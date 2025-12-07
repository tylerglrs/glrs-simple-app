/**
 * migrateToAIContext-lib.js
 *
 * Library version of the migration script - exports the function for use by bulk migration.
 */

const admin = require('firebase-admin');

// Get db from admin (assumes already initialized by caller)
const getDb = () => admin.firestore();
const getFieldValue = () => admin.firestore.FieldValue;
const getTimestamp = () => admin.firestore.Timestamp;

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function getTodayDateString() {
  return new Date().toISOString().split('T')[0];
}

function getDaysAgo(days) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
}

function daysBetween(date1, date2) {
  const oneDay = 24 * 60 * 60 * 1000;
  return Math.floor(Math.abs((date2 - date1) / oneDay));
}

function average(arr) {
  if (!arr || arr.length === 0) return null;
  const valid = arr.filter((n) => n !== null && n !== undefined);
  if (valid.length === 0) return null;
  return valid.reduce((a, b) => a + b, 0) / valid.length;
}

function getTrend(current, previous) {
  if (current === null || previous === null) return 'stable';
  const diff = current - previous;
  if (diff > 0.5) return 'improving';
  if (diff < -0.5) return 'declining';
  return 'stable';
}

function getDayName(date) {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[date.getDay()];
}

// =============================================================================
// DATA FETCHERS
// =============================================================================

async function fetchUserProfile(db, Timestamp, userId) {
  const userDoc = await db.collection('users').doc(userId).get();
  if (!userDoc.exists) {
    throw new Error(`User ${userId} not found`);
  }
  const userData = userDoc.data();
  return {
    firstName: userData.firstName || userData.displayName || 'User',
    recoveryStartDate: userData.sobrietyDate || userData.recoveryStartDate || null,
    primarySubstance: userData.primarySubstance || userData.substance || null,
    isVeteran: userData.isVeteran || false,
    timezone: userData.timezone || 'America/Los_Angeles',
  };
}

async function fetchCheckIns(db, Timestamp, userId, daysBack = 14) {
  const startDate = getDaysAgo(daysBack);
  const snapshot = await db
    .collection('checkIns')
    .where('userId', '==', userId)
    .where('createdAt', '>=', Timestamp.fromDate(startDate))
    .orderBy('createdAt', 'desc')
    .get();
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

async function fetchHabits(db, userId) {
  const snapshot = await db
    .collection('habits')
    .where('userId', '==', userId)
    .where('isActive', '==', true)
    .get();
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

async function fetchHabitCompletions(db, Timestamp, userId, daysBack = 30) {
  const startDate = getDaysAgo(daysBack);
  const snapshot = await db
    .collection('habitCompletions')
    .where('userId', '==', userId)
    .where('completedAt', '>=', Timestamp.fromDate(startDate))
    .get();
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

async function fetchGoals(db, userId) {
  const snapshot = await db.collection('goals').where('userId', '==', userId).get();
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

async function fetchAssignments(db, userId) {
  const snapshot = await db.collection('assignments').where('pirId', '==', userId).get();
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

async function fetchReflections(db, Timestamp, userId, daysBack = 30) {
  const startDate = getDaysAgo(daysBack);
  const [reflections, quickReflections] = await Promise.all([
    db
      .collection('reflections')
      .where('userId', '==', userId)
      .where('createdAt', '>=', Timestamp.fromDate(startDate))
      .get(),
    db
      .collection('quickReflections')
      .where('userId', '==', userId)
      .where('createdAt', '>=', Timestamp.fromDate(startDate))
      .get(),
  ]);
  return [
    ...reflections.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
    ...quickReflections.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
  ];
}

async function fetchGratitudes(db, Timestamp, userId, daysBack = 30) {
  const startDate = getDaysAgo(daysBack);
  const snapshot = await db
    .collection('gratitudes')
    .where('userId', '==', userId)
    .where('createdAt', '>=', Timestamp.fromDate(startDate))
    .get();
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

async function fetchWins(db, Timestamp, userId, daysBack = 30) {
  const startDate = getDaysAgo(daysBack);
  const snapshot = await db
    .collection('todayWins')
    .where('userId', '==', userId)
    .where('createdAt', '>=', Timestamp.fromDate(startDate))
    .get();
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

async function fetchBreakthroughs(db, userId) {
  const snapshot = await db.collection('breakthroughs').where('userId', '==', userId).get();
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

async function fetchSavingsData(db, userId) {
  const [savingsItems, savingsGoals] = await Promise.all([
    db.collection('savingsItems').where('userId', '==', userId).get(),
    db.collection('savingsGoals').where('userId', '==', userId).get(),
  ]);
  return {
    items: savingsItems.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
    goals: savingsGoals.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
  };
}

// =============================================================================
// CONTEXT BUILDERS (simplified versions)
// =============================================================================

function buildUserSection(profile) {
  let sobrietyDays = 0;
  let stage = null;

  if (profile.recoveryStartDate) {
    const startDate = profile.recoveryStartDate.toDate?.() || new Date(profile.recoveryStartDate);
    sobrietyDays = daysBetween(startDate, new Date());
    if (sobrietyDays < 90) stage = 'early';
    else if (sobrietyDays < 180) stage = 'developing';
    else if (sobrietyDays < 365) stage = 'sustained';
    else stage = 'stable';
  }

  return {
    firstName: profile.firstName,
    recoveryStartDate: profile.recoveryStartDate,
    sobrietyDays,
    primarySubstance: profile.primarySubstance,
    stage,
    isVeteran: profile.isVeteran,
    timezone: profile.timezone,
  };
}

function buildTodaySection(checkIns, habits, habitCompletions, reflections, gratitudes, wins) {
  const today = getTodayDateString();
  const todayCheckIns = checkIns.filter((c) => {
    const date = c.createdAt?.toDate?.() || new Date(c.createdAt);
    return date.toISOString().split('T')[0] === today;
  });
  const todayCompletions = habitCompletions.filter((c) => {
    const date = c.completedAt?.toDate?.() || new Date(c.completedAt);
    return date.toISOString().split('T')[0] === today;
  });
  const morningCheckIn = todayCheckIns.find((c) => c.type === 'morning');
  const eveningCheckIn = todayCheckIns.find((c) => c.type === 'evening');

  return {
    date: today,
    morningCheckIn: {
      completed: !!morningCheckIn,
      completedAt: morningCheckIn?.createdAt || null,
      mood: morningCheckIn?.morningData?.mood ?? morningCheckIn?.mood ?? null,
      craving: morningCheckIn?.morningData?.craving ?? morningCheckIn?.craving ?? null,
      anxiety: morningCheckIn?.morningData?.anxiety ?? morningCheckIn?.anxiety ?? null,
      sleep: morningCheckIn?.morningData?.sleep ?? morningCheckIn?.sleep ?? null,
      energy: morningCheckIn?.morningData?.energy ?? morningCheckIn?.energy ?? null,
    },
    eveningCheckIn: {
      completed: !!eveningCheckIn,
      completedAt: eveningCheckIn?.createdAt || null,
      overallDay: eveningCheckIn?.eveningData?.overallDay ?? eveningCheckIn?.overallDay ?? null,
      gratitude: eveningCheckIn?.eveningData?.gratitude ?? eveningCheckIn?.gratitude ?? null,
      tomorrowGoal: eveningCheckIn?.eveningData?.tomorrowGoal ?? eveningCheckIn?.tomorrowGoal ?? null,
    },
    habitsCompleted: todayCompletions.map((c) => c.habitId),
    habitsExpected: habits.filter((h) => h.frequency === 'daily').length,
    reflectionsCount: 0,
    gratitudesCount: 0,
    winsCount: 0,
    meetingsAttended: 0,
    assignmentsCompleted: 0,
  };
}

function buildRecent7DaysSection(checkIns) {
  const sevenDaysAgo = getDaysAgo(7);
  const fourteenDaysAgo = getDaysAgo(14);

  const currentWeek = checkIns.filter((c) => {
    const date = c.createdAt?.toDate?.() || new Date(c.createdAt);
    return date >= sevenDaysAgo;
  });

  const previousWeek = checkIns.filter((c) => {
    const date = c.createdAt?.toDate?.() || new Date(c.createdAt);
    return date >= fourteenDaysAgo && date < sevenDaysAgo;
  });

  const extractMetric = (list, field) => {
    return list
      .map((c) => c.morningData?.[field] ?? c[field])
      .filter((v) => v !== null && v !== undefined);
  };

  const currentMoods = extractMetric(currentWeek, 'mood');
  const currentCravings = extractMetric(currentWeek, 'craving');
  const previousMoods = extractMetric(previousWeek, 'mood');
  const previousCravings = extractMetric(previousWeek, 'craving');

  return {
    checkInCount: currentWeek.length,
    avgMood: average(currentMoods),
    avgCraving: average(currentCravings),
    avgAnxiety: null,
    avgSleep: null,
    avgEnergy: null,
    moodValues: currentMoods.slice(0, 7),
    cravingValues: currentCravings.slice(0, 7),
    anxietyValues: [],
    sleepValues: [],
    energyValues: [],
    moodTrend: getTrend(average(currentMoods), average(previousMoods)),
    cravingTrend: getTrend(average(previousCravings), average(currentCravings)),
    anxietyTrend: 'stable',
    sleepTrend: 'stable',
    energyTrend: 'stable',
  };
}

function buildPatternsSection() {
  return {
    bestDayOfWeek: null,
    worstDayOfWeek: null,
    highCravingTime: null,
    sleepMoodCorrelation: null,
    weekendMoodDiff: null,
    topGratitudeCategories: [],
    topWinCategories: [],
  };
}

function buildStreaksSection(checkIns) {
  const checkedDays = new Set();
  checkIns.forEach((c) => {
    const date = c.createdAt?.toDate?.() || new Date(c.createdAt);
    checkedDays.add(date.toISOString().split('T')[0]);
  });

  let checkInStreak = 0;
  let currentDate = new Date();
  while (checkedDays.has(currentDate.toISOString().split('T')[0])) {
    checkInStreak++;
    currentDate.setDate(currentDate.getDate() - 1);
  }

  return {
    checkInStreak,
    checkInStreakAtRisk: !checkedDays.has(getTodayDateString()),
    meetingStreak: 0,
    habitStreaks: [],
    allHabitsStreak: 0,
  };
}

function buildHabitsSection(habits) {
  return {
    definitions: habits.map((h) => ({ id: h.id, name: h.name, frequency: h.frequency || 'daily' })),
    activeCount: habits.length,
    completionRate7Day: 0,
    completionRate30Day: 0,
    topHabits: [],
    needsAttention: [],
  };
}

function buildGoalsSection(goals) {
  const active = goals.filter((g) => g.status === 'active' || g.status === 'in_progress');
  const completed = goals.filter((g) => g.status === 'completed');
  return {
    activeCount: active.length,
    completedCount: completed.length,
    active: active.slice(0, 10).map((g) => ({
      id: g.id,
      title: g.title || g.name,
      category: g.category || null,
      progress: g.progress || 0,
      targetDate: g.targetDate || null,
      isOverdue: false,
    })),
    avgProgress: 0,
    overdueCount: 0,
    recentlyCompleted: [],
  };
}

function buildAssignmentsSection(assignments) {
  const pending = assignments.filter((a) => a.status === 'pending' || a.status === 'assigned');
  return {
    pendingCount: pending.length,
    overdueCount: 0,
    completedThisWeek: 0,
    streak: 0,
    nextDue: null,
  };
}

function buildMeetingsSection() {
  return {
    attendedThisWeek: 0,
    attendedThisMonth: 0,
    weeklyAverage: 0,
    streak: 0,
    topTypes: [],
    lastAttendedDate: null,
    upcomingCount: 0,
    savedCount: 0,
  };
}

function buildReflectionsSection(reflections) {
  return { count30Day: reflections.length, weeklyAverage: 0, recentThemes: [], sentimentTrend: 'neutral' };
}

function buildGratitudesSection(gratitudes) {
  return { count30Day: gratitudes.length, weeklyAverage: 0, topCategories: [] };
}

function buildWinsSection(wins) {
  return { count30Day: wins.length, weeklyAverage: 0, topCategories: [] };
}

function buildBreakthroughsSection(breakthroughs) {
  const sorted = [...breakthroughs].sort((a, b) => {
    const dateA = a.createdAt?.toDate?.() || new Date(a.createdAt);
    const dateB = b.createdAt?.toDate?.() || new Date(b.createdAt);
    return dateB - dateA;
  });
  const mostRecent = sorted[0];
  return {
    totalCount: breakthroughs.length,
    mostRecentDate: mostRecent?.createdAt || null,
    hadRecentBreakthrough: false,
  };
}

function buildMilestonesSection(sobrietyDays) {
  const milestones = [7, 14, 30, 60, 90, 180, 365, 730, 1095];
  const nextMilestone = milestones.find((m) => m > sobrietyDays) || null;
  return {
    nextMilestone: nextMilestone ? { days: nextMilestone, daysUntil: nextMilestone - sobrietyDays } : null,
    recentlyAchieved: [],
  };
}

function buildJourneySection(savingsData) {
  const totalSaved = savingsData.items.reduce((sum, item) => sum + (item.amount || 0), 0);
  return { totalSaved, savingsGoalProgress: null, moneyMapProgress: null, countdownGoalsActive: 0 };
}

function buildContextSection(todaySection, streaks) {
  const now = new Date();
  return {
    isWeekend: now.getDay() === 0 || now.getDay() === 6,
    isHighRisk: false,
    riskFactors: [],
    needsEncouragement: false,
    hasPositiveMomentum: false,
    daysToNextMilestone: null,
    engagedToday: todaySection.morningCheckIn.completed || todaySection.eveningCheckIn.completed,
    lastInsightDate: null,
    lastInsightType: null,
  };
}

// =============================================================================
// MAIN MIGRATION FUNCTION (EXPORTED)
// =============================================================================

async function migrateUserToAIContext(userId) {
  const db = getDb();
  const FieldValue = getFieldValue();
  const Timestamp = getTimestamp();

  // Fetch all data
  const [profile, checkIns, habits, habitCompletions, goals, assignments, reflections, gratitudes, wins, breakthroughs, savingsData] =
    await Promise.all([
      fetchUserProfile(db, Timestamp, userId),
      fetchCheckIns(db, Timestamp, userId),
      fetchHabits(db, userId),
      fetchHabitCompletions(db, Timestamp, userId),
      fetchGoals(db, userId),
      fetchAssignments(db, userId),
      fetchReflections(db, Timestamp, userId),
      fetchGratitudes(db, Timestamp, userId),
      fetchWins(db, Timestamp, userId),
      fetchBreakthroughs(db, userId),
      fetchSavingsData(db, userId),
    ]);

  // Build sections
  const userSection = buildUserSection(profile);
  const todaySection = buildTodaySection(checkIns, habits, habitCompletions, reflections, gratitudes, wins);
  const recent7DaysSection = buildRecent7DaysSection(checkIns);
  const streaksSection = buildStreaksSection(checkIns);
  const milestonesSection = buildMilestonesSection(userSection.sobrietyDays);

  // Build document
  const aiContextDoc = {
    userId,
    lastUpdated: FieldValue.serverTimestamp(),
    schemaVersion: 1,
    user: userSection,
    today: todaySection,
    recent7Days: recent7DaysSection,
    patterns: buildPatternsSection(),
    streaks: streaksSection,
    habits: buildHabitsSection(habits),
    goals: buildGoalsSection(goals),
    assignments: buildAssignmentsSection(assignments),
    meetings: buildMeetingsSection(),
    reflections: buildReflectionsSection(reflections),
    gratitudes: buildGratitudesSection(gratitudes),
    wins: buildWinsSection(wins),
    breakthroughs: buildBreakthroughsSection(breakthroughs),
    milestones: milestonesSection,
    journey: buildJourneySection(savingsData),
    context: buildContextSection(todaySection, streaksSection),
  };

  // Write to Firestore
  await db.collection('users').doc(userId).collection('aiContext').doc('current').set(aiContextDoc);

  return aiContextDoc;
}

module.exports = { migrateUserToAIContext };
