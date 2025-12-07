/**
 * migrateToAIContext.js
 *
 * Migration script to populate the aiContext document for a user from existing data.
 * This reads from all relevant collections and builds the initial aiContext/current document.
 *
 * Usage:
 *   node scripts/migrateToAIContext.js <userId>
 *
 * Example:
 *   node scripts/migrateToAIContext.js abc123def456
 */

const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  const serviceAccountPath = path.resolve(__dirname, '../../.test-credentials.json');
  try {
    const serviceAccount = require(serviceAccountPath);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    console.log('[migrateToAIContext] Firebase Admin initialized');
  } catch (error) {
    console.error('[migrateToAIContext] Error loading service account:', error.message);
    console.log('[migrateToAIContext] Attempting default credentials...');
    admin.initializeApp();
  }
}

const db = admin.firestore();
const FieldValue = admin.firestore.FieldValue;
const Timestamp = admin.firestore.Timestamp;

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Get today's date string in YYYY-MM-DD format
 */
function getTodayDateString() {
  return new Date().toISOString().split('T')[0];
}

/**
 * Get date N days ago
 */
function getDaysAgo(days) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
}

/**
 * Calculate days between two dates
 */
function daysBetween(date1, date2) {
  const oneDay = 24 * 60 * 60 * 1000;
  return Math.floor(Math.abs((date2 - date1) / oneDay));
}

/**
 * Calculate average of array of numbers
 */
function average(arr) {
  if (!arr || arr.length === 0) return null;
  const valid = arr.filter((n) => n !== null && n !== undefined);
  if (valid.length === 0) return null;
  return valid.reduce((a, b) => a + b, 0) / valid.length;
}

/**
 * Calculate trend from two averages
 */
function getTrend(current, previous) {
  if (current === null || previous === null) return 'stable';
  const diff = current - previous;
  if (diff > 0.5) return 'improving';
  if (diff < -0.5) return 'declining';
  return 'stable';
}

/**
 * Get day name from date
 */
function getDayName(date) {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[date.getDay()];
}

// =============================================================================
// DATA FETCHERS
// =============================================================================

/**
 * Fetch user profile data
 */
async function fetchUserProfile(userId) {
  console.log('[migrateToAIContext] Fetching user profile...');
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

/**
 * Fetch check-ins for a date range
 */
async function fetchCheckIns(userId, daysBack = 14) {
  console.log(`[migrateToAIContext] Fetching check-ins (last ${daysBack} days)...`);
  const startDate = getDaysAgo(daysBack);

  const snapshot = await db
    .collection('checkIns')
    .where('userId', '==', userId)
    .where('createdAt', '>=', Timestamp.fromDate(startDate))
    .orderBy('createdAt', 'desc')
    .get();

  console.log(`[migrateToAIContext] Found ${snapshot.size} check-ins`);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

/**
 * Fetch habits for user
 */
async function fetchHabits(userId) {
  console.log('[migrateToAIContext] Fetching habits...');
  const snapshot = await db
    .collection('habits')
    .where('userId', '==', userId)
    .where('isActive', '==', true)
    .get();

  console.log(`[migrateToAIContext] Found ${snapshot.size} active habits`);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

/**
 * Fetch habit completions for a date range
 */
async function fetchHabitCompletions(userId, daysBack = 30) {
  console.log(`[migrateToAIContext] Fetching habit completions (last ${daysBack} days)...`);
  const startDate = getDaysAgo(daysBack);

  const snapshot = await db
    .collection('habitCompletions')
    .where('userId', '==', userId)
    .where('completedAt', '>=', Timestamp.fromDate(startDate))
    .get();

  console.log(`[migrateToAIContext] Found ${snapshot.size} habit completions`);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

/**
 * Fetch goals for user
 */
async function fetchGoals(userId) {
  console.log('[migrateToAIContext] Fetching goals...');
  const snapshot = await db.collection('goals').where('userId', '==', userId).get();

  console.log(`[migrateToAIContext] Found ${snapshot.size} goals`);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

/**
 * Fetch assignments for user
 */
async function fetchAssignments(userId) {
  console.log('[migrateToAIContext] Fetching assignments...');
  const snapshot = await db.collection('assignments').where('pirId', '==', userId).get();

  console.log(`[migrateToAIContext] Found ${snapshot.size} assignments`);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

/**
 * Fetch reflections for a date range
 */
async function fetchReflections(userId, daysBack = 30) {
  console.log(`[migrateToAIContext] Fetching reflections (last ${daysBack} days)...`);
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

  const allReflections = [
    ...reflections.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
    ...quickReflections.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
  ];

  console.log(`[migrateToAIContext] Found ${allReflections.length} reflections`);
  return allReflections;
}

/**
 * Fetch gratitudes for a date range
 */
async function fetchGratitudes(userId, daysBack = 30) {
  console.log(`[migrateToAIContext] Fetching gratitudes (last ${daysBack} days)...`);
  const startDate = getDaysAgo(daysBack);

  const snapshot = await db
    .collection('gratitudes')
    .where('userId', '==', userId)
    .where('createdAt', '>=', Timestamp.fromDate(startDate))
    .get();

  console.log(`[migrateToAIContext] Found ${snapshot.size} gratitudes`);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

/**
 * Fetch wins for a date range
 */
async function fetchWins(userId, daysBack = 30) {
  console.log(`[migrateToAIContext] Fetching wins (last ${daysBack} days)...`);
  const startDate = getDaysAgo(daysBack);

  const snapshot = await db
    .collection('todayWins')
    .where('userId', '==', userId)
    .where('createdAt', '>=', Timestamp.fromDate(startDate))
    .get();

  console.log(`[migrateToAIContext] Found ${snapshot.size} wins`);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

/**
 * Fetch breakthroughs for user
 */
async function fetchBreakthroughs(userId) {
  console.log('[migrateToAIContext] Fetching breakthroughs...');
  const snapshot = await db.collection('breakthroughs').where('userId', '==', userId).get();

  console.log(`[migrateToAIContext] Found ${snapshot.size} breakthroughs`);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

/**
 * Fetch savings data for user
 */
async function fetchSavingsData(userId) {
  console.log('[migrateToAIContext] Fetching savings data...');
  const [savingsItems, savingsGoals] = await Promise.all([
    db.collection('savingsItems').where('userId', '==', userId).get(),
    db.collection('savingsGoals').where('userId', '==', userId).get(),
  ]);

  const items = savingsItems.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  const goals = savingsGoals.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

  console.log(`[migrateToAIContext] Found ${items.length} savings items, ${goals.length} goals`);
  return { items, goals };
}

// =============================================================================
// CONTEXT BUILDERS
// =============================================================================

/**
 * Build the user section
 */
function buildUserSection(profile) {
  let sobrietyDays = 0;
  let stage = null;

  if (profile.recoveryStartDate) {
    const startDate =
      profile.recoveryStartDate.toDate?.() || new Date(profile.recoveryStartDate);
    sobrietyDays = daysBetween(startDate, new Date());

    // Determine stage based on days
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

/**
 * Build today's status section
 */
function buildTodaySection(checkIns, habits, habitCompletions, reflections, gratitudes, wins) {
  const today = getTodayDateString();
  const todayDate = new Date(today);

  // Filter to today's data
  const todayCheckIns = checkIns.filter((c) => {
    const checkInDate = c.createdAt?.toDate?.() || new Date(c.createdAt);
    return checkInDate.toISOString().split('T')[0] === today;
  });

  const todayCompletions = habitCompletions.filter((c) => {
    const completedDate = c.completedAt?.toDate?.() || new Date(c.completedAt);
    return completedDate.toISOString().split('T')[0] === today;
  });

  const todayReflections = reflections.filter((r) => {
    const date = r.createdAt?.toDate?.() || new Date(r.createdAt);
    return date.toISOString().split('T')[0] === today;
  });

  const todayGratitudes = gratitudes.filter((g) => {
    const date = g.createdAt?.toDate?.() || new Date(g.createdAt);
    return date.toISOString().split('T')[0] === today;
  });

  const todayWins = wins.filter((w) => {
    const date = w.createdAt?.toDate?.() || new Date(w.createdAt);
    return date.toISOString().split('T')[0] === today;
  });

  // Find morning/evening check-ins
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
      overallDay:
        eveningCheckIn?.eveningData?.overallDay ?? eveningCheckIn?.overallDay ?? null,
      gratitude:
        eveningCheckIn?.eveningData?.gratitude ?? eveningCheckIn?.gratitude ?? null,
      tomorrowGoal:
        eveningCheckIn?.eveningData?.tomorrowGoal ?? eveningCheckIn?.tomorrowGoal ?? null,
    },
    habitsCompleted: todayCompletions.map((c) => c.habitId),
    habitsExpected: habits.filter((h) => h.frequency === 'daily').length,
    reflectionsCount: todayReflections.length,
    gratitudesCount: todayGratitudes.length,
    winsCount: todayWins.length,
    meetingsAttended: 0, // Would need meeting attendance data
    assignmentsCompleted: 0, // Would need to track
  };
}

/**
 * Build recent 7 days section
 */
function buildRecent7DaysSection(checkIns) {
  const now = new Date();
  const sevenDaysAgo = getDaysAgo(7);
  const fourteenDaysAgo = getDaysAgo(14);

  // Split into current and previous week
  const currentWeek = checkIns.filter((c) => {
    const date = c.createdAt?.toDate?.() || new Date(c.createdAt);
    return date >= sevenDaysAgo;
  });

  const previousWeek = checkIns.filter((c) => {
    const date = c.createdAt?.toDate?.() || new Date(c.createdAt);
    return date >= fourteenDaysAgo && date < sevenDaysAgo;
  });

  // Extract metrics from check-ins
  const extractMetric = (list, field) => {
    return list
      .map((c) => c.morningData?.[field] ?? c[field])
      .filter((v) => v !== null && v !== undefined);
  };

  const currentMoods = extractMetric(currentWeek, 'mood');
  const currentCravings = extractMetric(currentWeek, 'craving');
  const currentAnxiety = extractMetric(currentWeek, 'anxiety');
  const currentSleep = extractMetric(currentWeek, 'sleep');
  const currentEnergy = extractMetric(currentWeek, 'energy');

  const previousMoods = extractMetric(previousWeek, 'mood');
  const previousCravings = extractMetric(previousWeek, 'craving');
  const previousAnxiety = extractMetric(previousWeek, 'anxiety');
  const previousSleep = extractMetric(previousWeek, 'sleep');
  const previousEnergy = extractMetric(previousWeek, 'energy');

  return {
    checkInCount: currentWeek.length,
    avgMood: average(currentMoods),
    avgCraving: average(currentCravings),
    avgAnxiety: average(currentAnxiety),
    avgSleep: average(currentSleep),
    avgEnergy: average(currentEnergy),
    moodValues: currentMoods.slice(0, 7),
    cravingValues: currentCravings.slice(0, 7),
    anxietyValues: currentAnxiety.slice(0, 7),
    sleepValues: currentSleep.slice(0, 7),
    energyValues: currentEnergy.slice(0, 7),
    moodTrend: getTrend(average(currentMoods), average(previousMoods)),
    cravingTrend: getTrend(average(previousCravings), average(currentCravings)), // Inverted for cravings
    anxietyTrend: getTrend(average(previousAnxiety), average(currentAnxiety)), // Inverted for anxiety
    sleepTrend: getTrend(average(currentSleep), average(previousSleep)),
    energyTrend: getTrend(average(currentEnergy), average(previousEnergy)),
  };
}

/**
 * Build patterns section
 */
function buildPatternsSection(checkIns, gratitudes, wins) {
  // Group check-ins by day of week
  const dayMoods = {};
  checkIns.forEach((c) => {
    const date = c.createdAt?.toDate?.() || new Date(c.createdAt);
    const day = getDayName(date);
    const mood = c.morningData?.mood ?? c.mood;
    if (mood !== null && mood !== undefined) {
      if (!dayMoods[day]) dayMoods[day] = [];
      dayMoods[day].push(mood);
    }
  });

  // Find best and worst days
  let bestDay = null;
  let worstDay = null;
  let bestAvg = -Infinity;
  let worstAvg = Infinity;

  Object.entries(dayMoods).forEach(([day, moods]) => {
    const avg = average(moods);
    if (avg > bestAvg) {
      bestAvg = avg;
      bestDay = day;
    }
    if (avg < worstAvg) {
      worstAvg = avg;
      worstDay = day;
    }
  });

  // Count gratitude categories
  const gratitudeCategories = {};
  gratitudes.forEach((g) => {
    const cat = g.theme || g.category || 'general';
    gratitudeCategories[cat] = (gratitudeCategories[cat] || 0) + 1;
  });

  // Count win categories
  const winCategories = {};
  wins.forEach((w) => {
    const cat = w.category || 'general';
    winCategories[cat] = (winCategories[cat] || 0) + 1;
  });

  return {
    bestDayOfWeek: bestDay,
    worstDayOfWeek: worstDay,
    highCravingTime: null, // Would need time analysis
    sleepMoodCorrelation: null, // Would need correlation calculation
    weekendMoodDiff: null, // Would need weekend vs weekday analysis
    topGratitudeCategories: Object.entries(gratitudeCategories)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([cat]) => cat),
    topWinCategories: Object.entries(winCategories)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([cat]) => cat),
  };
}

/**
 * Build streaks section
 */
function buildStreaksSection(checkIns, habits, habitCompletions) {
  // Calculate check-in streak
  let checkInStreak = 0;
  const sortedCheckIns = [...checkIns].sort((a, b) => {
    const dateA = a.createdAt?.toDate?.() || new Date(a.createdAt);
    const dateB = b.createdAt?.toDate?.() || new Date(b.createdAt);
    return dateB - dateA;
  });

  // Count consecutive days with check-ins
  const checkedDays = new Set();
  sortedCheckIns.forEach((c) => {
    const date = c.createdAt?.toDate?.() || new Date(c.createdAt);
    checkedDays.add(date.toISOString().split('T')[0]);
  });

  const today = getTodayDateString();
  let currentDate = new Date();
  while (checkedDays.has(currentDate.toISOString().split('T')[0])) {
    checkInStreak++;
    currentDate.setDate(currentDate.getDate() - 1);
  }

  // Build habit streaks
  const habitStreaks = habits.map((habit) => {
    const completions = habitCompletions
      .filter((c) => c.habitId === habit.id)
      .sort((a, b) => {
        const dateA = a.completedAt?.toDate?.() || new Date(a.completedAt);
        const dateB = b.completedAt?.toDate?.() || new Date(b.completedAt);
        return dateB - dateA;
      });

    // Count current streak
    let currentStreak = 0;
    const completedDays = new Set();
    completions.forEach((c) => {
      const date = c.completedAt?.toDate?.() || new Date(c.completedAt);
      completedDays.add(date.toISOString().split('T')[0]);
    });

    let checkDate = new Date();
    while (completedDays.has(checkDate.toISOString().split('T')[0])) {
      currentStreak++;
      checkDate.setDate(checkDate.getDate() - 1);
    }

    return {
      habitId: habit.id,
      habitName: habit.name,
      currentStreak,
      longestStreak: currentStreak, // Would need historical analysis for actual longest
    };
  });

  return {
    checkInStreak,
    checkInStreakAtRisk: !checkedDays.has(today),
    meetingStreak: 0, // Would need meeting data
    habitStreaks,
    allHabitsStreak: 0, // Would need more complex calculation
  };
}

/**
 * Build habits section
 */
function buildHabitsSection(habits, habitCompletions) {
  const sevenDaysAgo = getDaysAgo(7);
  const thirtyDaysAgo = getDaysAgo(30);

  const completions7Day = habitCompletions.filter((c) => {
    const date = c.completedAt?.toDate?.() || new Date(c.completedAt);
    return date >= sevenDaysAgo;
  });

  const completions30Day = habitCompletions.filter((c) => {
    const date = c.completedAt?.toDate?.() || new Date(c.completedAt);
    return date >= thirtyDaysAgo;
  });

  // Calculate completion rates per habit
  const habitStats = habits.map((habit) => {
    const total7 = 7; // Assuming daily habits
    const completed7 = completions7Day.filter((c) => c.habitId === habit.id).length;
    const total30 = 30;
    const completed30 = completions30Day.filter((c) => c.habitId === habit.id).length;

    return {
      habitId: habit.id,
      habitName: habit.name,
      completionRate7: (completed7 / total7) * 100,
      completionRate30: (completed30 / total30) * 100,
    };
  });

  // Sort for top and needs attention
  const sorted = [...habitStats].sort((a, b) => b.completionRate7 - a.completionRate7);

  return {
    definitions: habits.map((h) => ({
      id: h.id,
      name: h.name,
      frequency: h.frequency || 'daily',
    })),
    activeCount: habits.length,
    completionRate7Day:
      habitStats.length > 0
        ? habitStats.reduce((sum, h) => sum + h.completionRate7, 0) / habitStats.length
        : 0,
    completionRate30Day:
      habitStats.length > 0
        ? habitStats.reduce((sum, h) => sum + h.completionRate30, 0) / habitStats.length
        : 0,
    topHabits: sorted.slice(0, 3).map((h) => ({
      habitId: h.habitId,
      habitName: h.habitName,
      completionRate: h.completionRate7,
    })),
    needsAttention: sorted
      .slice(-3)
      .reverse()
      .map((h) => ({
        habitId: h.habitId,
        habitName: h.habitName,
        completionRate: h.completionRate7,
        daysMissed: Math.round(7 - (h.completionRate7 / 100) * 7),
      })),
  };
}

/**
 * Build goals section
 */
function buildGoalsSection(goals) {
  const now = new Date();
  const thirtyDaysAgo = getDaysAgo(30);

  const activeGoals = goals.filter(
    (g) => g.status === 'active' || g.status === 'in_progress'
  );
  const completedGoals = goals.filter((g) => g.status === 'completed');
  const recentlyCompleted = completedGoals.filter((g) => {
    const date = g.completedAt?.toDate?.() || g.updatedAt?.toDate?.() || new Date();
    return date >= thirtyDaysAgo;
  });

  return {
    activeCount: activeGoals.length,
    completedCount: completedGoals.length,
    active: activeGoals.slice(0, 10).map((g) => {
      const targetDate = g.targetDate?.toDate?.() || null;
      return {
        id: g.id,
        title: g.title || g.name,
        category: g.category || null,
        progress: g.progress || 0,
        targetDate: g.targetDate || null,
        isOverdue: targetDate ? targetDate < now : false,
      };
    }),
    avgProgress:
      activeGoals.length > 0
        ? activeGoals.reduce((sum, g) => sum + (g.progress || 0), 0) / activeGoals.length
        : 0,
    overdueCount: activeGoals.filter((g) => {
      const targetDate = g.targetDate?.toDate?.() || null;
      return targetDate && targetDate < now;
    }).length,
    recentlyCompleted: recentlyCompleted.slice(0, 5).map((g) => ({
      id: g.id,
      title: g.title || g.name,
      completedAt: g.completedAt || g.updatedAt,
    })),
  };
}

/**
 * Build assignments section
 */
function buildAssignmentsSection(assignments) {
  const now = new Date();
  const weekStart = getDaysAgo(7);

  const pending = assignments.filter(
    (a) => a.status === 'pending' || a.status === 'assigned'
  );
  const completed = assignments.filter((a) => a.status === 'completed');
  const completedThisWeek = completed.filter((a) => {
    const date = a.completedAt?.toDate?.() || a.updatedAt?.toDate?.();
    return date && date >= weekStart;
  });

  // Find overdue
  const overdue = pending.filter((a) => {
    const dueDate = a.dueDate?.toDate?.() || null;
    return dueDate && dueDate < now;
  });

  // Find next due
  const sortedPending = [...pending]
    .filter((a) => a.dueDate)
    .sort((a, b) => {
      const dateA = a.dueDate.toDate?.() || new Date(a.dueDate);
      const dateB = b.dueDate.toDate?.() || new Date(b.dueDate);
      return dateA - dateB;
    });

  const nextDue = sortedPending[0] || null;

  return {
    pendingCount: pending.length,
    overdueCount: overdue.length,
    completedThisWeek: completedThisWeek.length,
    streak: 0, // Would need calculation
    nextDue: nextDue
      ? {
          id: nextDue.id,
          title: nextDue.title || nextDue.description,
          dueDate: nextDue.dueDate,
        }
      : null,
  };
}

/**
 * Build meetings section (placeholder)
 */
function buildMeetingsSection() {
  return {
    attendedThisWeek: 0,
    attendedThisMonth: 0,
    weeklyAverage: 0,
    streak: 0,
    topTypes: [],
    lastAttendedDate: null,
    upcomingCount: 0,
  };
}

/**
 * Build reflections section
 */
function buildReflectionsSection(reflections) {
  const weekStart = getDaysAgo(7);
  const weeklyCount = reflections.filter((r) => {
    const date = r.createdAt?.toDate?.() || new Date(r.createdAt);
    return date >= weekStart;
  }).length;

  return {
    count30Day: reflections.length,
    weeklyAverage: weeklyCount,
    recentThemes: [], // Would need NLP analysis
    sentimentTrend: 'neutral',
  };
}

/**
 * Build gratitudes section
 */
function buildGratitudesSection(gratitudes) {
  const weekStart = getDaysAgo(7);
  const weeklyCount = gratitudes.filter((g) => {
    const date = g.createdAt?.toDate?.() || new Date(g.createdAt);
    return date >= weekStart;
  }).length;

  // Count categories
  const categories = {};
  gratitudes.forEach((g) => {
    const cat = g.theme || g.category || 'general';
    categories[cat] = (categories[cat] || 0) + 1;
  });

  return {
    count30Day: gratitudes.length,
    weeklyAverage: weeklyCount,
    topCategories: Object.entries(categories)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([category, count]) => ({ category, count })),
  };
}

/**
 * Build wins section
 */
function buildWinsSection(wins) {
  const weekStart = getDaysAgo(7);
  const weeklyCount = wins.filter((w) => {
    const date = w.createdAt?.toDate?.() || new Date(w.createdAt);
    return date >= weekStart;
  }).length;

  // Count categories
  const categories = {};
  wins.forEach((w) => {
    const cat = w.category || 'general';
    categories[cat] = (categories[cat] || 0) + 1;
  });

  return {
    count30Day: wins.length,
    weeklyAverage: weeklyCount,
    topCategories: Object.entries(categories)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([category, count]) => ({ category, count })),
  };
}

/**
 * Build breakthroughs section
 */
function buildBreakthroughsSection(breakthroughs) {
  const sevenDaysAgo = getDaysAgo(7);

  const sorted = [...breakthroughs].sort((a, b) => {
    const dateA = a.createdAt?.toDate?.() || new Date(a.createdAt);
    const dateB = b.createdAt?.toDate?.() || new Date(b.createdAt);
    return dateB - dateA;
  });

  const mostRecent = sorted[0];
  const recentDate = mostRecent?.createdAt?.toDate?.() || null;

  return {
    totalCount: breakthroughs.length,
    mostRecentDate: mostRecent?.createdAt || null,
    hadRecentBreakthrough: recentDate ? recentDate >= sevenDaysAgo : false,
  };
}

/**
 * Build milestones section
 */
function buildMilestonesSection(sobrietyDays) {
  const milestones = [7, 14, 30, 60, 90, 180, 365, 730, 1095];

  // Find next milestone
  const nextMilestone = milestones.find((m) => m > sobrietyDays) || null;
  const daysUntilNext = nextMilestone ? nextMilestone - sobrietyDays : null;

  // Find recently achieved
  const recentlyAchieved = milestones
    .filter((m) => m <= sobrietyDays && sobrietyDays - m <= 7)
    .map((days) => ({ days, achievedAt: null }));

  return {
    nextMilestone: nextMilestone
      ? { days: nextMilestone, daysUntil: daysUntilNext }
      : null,
    recentlyAchieved,
  };
}

/**
 * Build journey section
 */
function buildJourneySection(savingsData) {
  const totalSaved = savingsData.items.reduce((sum, item) => sum + (item.amount || 0), 0);

  // Find progress toward first goal
  const activeGoal = savingsData.goals.find((g) => g.status === 'active');
  let progress = null;
  if (activeGoal && activeGoal.targetAmount) {
    progress = (totalSaved / activeGoal.targetAmount) * 100;
  }

  return {
    totalSaved,
    savingsGoalProgress: progress,
    moneyMapProgress: null, // Would need calculation
    countdownGoalsActive: 0, // Would need countdown goals data
  };
}

/**
 * Build context flags section
 */
function buildContextSection(userSection, todaySection, recent7Days, streaks) {
  const now = new Date();
  const isWeekend = now.getDay() === 0 || now.getDay() === 6;

  // Determine risk factors
  const riskFactors = [];
  if (recent7Days.avgCraving > 7) riskFactors.push('high_cravings');
  if (recent7Days.avgAnxiety > 7) riskFactors.push('high_anxiety');
  if (recent7Days.avgMood < 4) riskFactors.push('low_mood');
  if (streaks.checkInStreak === 0) riskFactors.push('missed_checkins');

  const isHighRisk = riskFactors.length >= 2;

  // Determine if needs encouragement
  const needsEncouragement =
    recent7Days.moodTrend === 'declining' || streaks.checkInStreakAtRisk;

  // Determine positive momentum
  const hasPositiveMomentum =
    recent7Days.moodTrend === 'improving' &&
    recent7Days.cravingTrend === 'improving' &&
    streaks.checkInStreak >= 3;

  return {
    isWeekend,
    isHighRisk,
    riskFactors,
    needsEncouragement,
    hasPositiveMomentum,
    daysToNextMilestone: null, // Set from milestones
    engagedToday:
      todaySection.morningCheckIn.completed ||
      todaySection.eveningCheckIn.completed ||
      todaySection.habitsCompleted.length > 0,
    lastInsightDate: null,
    lastInsightType: null,
  };
}

// =============================================================================
// MAIN MIGRATION FUNCTION
// =============================================================================

async function migrateUserToAIContext(userId) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`[migrateToAIContext] Starting migration for user: ${userId}`);
  console.log(`${'='.repeat(60)}\n`);

  try {
    // Fetch all data in parallel
    const [
      profile,
      checkIns,
      habits,
      habitCompletions,
      goals,
      assignments,
      reflections,
      gratitudes,
      wins,
      breakthroughs,
      savingsData,
    ] = await Promise.all([
      fetchUserProfile(userId),
      fetchCheckIns(userId),
      fetchHabits(userId),
      fetchHabitCompletions(userId),
      fetchGoals(userId),
      fetchAssignments(userId),
      fetchReflections(userId),
      fetchGratitudes(userId),
      fetchWins(userId),
      fetchBreakthroughs(userId),
      fetchSavingsData(userId),
    ]);

    console.log('\n[migrateToAIContext] Building aiContext document...\n');

    // Build sections
    const userSection = buildUserSection(profile);
    const todaySection = buildTodaySection(
      checkIns,
      habits,
      habitCompletions,
      reflections,
      gratitudes,
      wins
    );
    const recent7DaysSection = buildRecent7DaysSection(checkIns);
    const patternsSection = buildPatternsSection(checkIns, gratitudes, wins);
    const streaksSection = buildStreaksSection(checkIns, habits, habitCompletions);
    const habitsSection = buildHabitsSection(habits, habitCompletions);
    const goalsSection = buildGoalsSection(goals);
    const assignmentsSection = buildAssignmentsSection(assignments);
    const meetingsSection = buildMeetingsSection();
    const reflectionsSection = buildReflectionsSection(reflections);
    const gratitudesSection = buildGratitudesSection(gratitudes);
    const winsSection = buildWinsSection(wins);
    const breakthroughsSection = buildBreakthroughsSection(breakthroughs);
    const milestonesSection = buildMilestonesSection(userSection.sobrietyDays);
    const journeySection = buildJourneySection(savingsData);
    const contextSection = buildContextSection(
      userSection,
      todaySection,
      recent7DaysSection,
      streaksSection
    );

    // Update daysToNextMilestone in context
    if (milestonesSection.nextMilestone) {
      contextSection.daysToNextMilestone = milestonesSection.nextMilestone.daysUntil;
    }

    // Build complete document
    const aiContextDoc = {
      userId,
      lastUpdated: FieldValue.serverTimestamp(),
      schemaVersion: 1,
      user: userSection,
      today: todaySection,
      recent7Days: recent7DaysSection,
      patterns: patternsSection,
      streaks: streaksSection,
      habits: habitsSection,
      goals: goalsSection,
      assignments: assignmentsSection,
      meetings: meetingsSection,
      reflections: reflectionsSection,
      gratitudes: gratitudesSection,
      wins: winsSection,
      breakthroughs: breakthroughsSection,
      milestones: milestonesSection,
      journey: journeySection,
      context: contextSection,
    };

    // Write to Firestore
    console.log('[migrateToAIContext] Writing to Firestore...');
    await db
      .collection('users')
      .doc(userId)
      .collection('aiContext')
      .doc('current')
      .set(aiContextDoc);

    console.log('\n[migrateToAIContext] Migration complete!');
    console.log(`[migrateToAIContext] Document path: users/${userId}/aiContext/current`);

    // Print summary
    console.log('\n--- MIGRATION SUMMARY ---');
    console.log(`User: ${userSection.firstName}`);
    console.log(`Sobriety Days: ${userSection.sobrietyDays}`);
    console.log(`Check-ins processed: ${checkIns.length}`);
    console.log(`Habits: ${habits.length} active`);
    console.log(`Habit completions: ${habitCompletions.length}`);
    console.log(`Goals: ${goalsSection.activeCount} active, ${goalsSection.completedCount} completed`);
    console.log(`Assignments: ${assignmentsSection.pendingCount} pending`);
    console.log(`Reflections: ${reflectionsSection.count30Day} (30 day)`);
    console.log(`Gratitudes: ${gratitudesSection.count30Day} (30 day)`);
    console.log(`Wins: ${winsSection.count30Day} (30 day)`);
    console.log(`Breakthroughs: ${breakthroughsSection.totalCount} total`);
    console.log(`Check-in streak: ${streaksSection.checkInStreak} days`);
    console.log('-------------------------\n');

    return aiContextDoc;
  } catch (error) {
    console.error('[migrateToAIContext] Error during migration:', error);
    throw error;
  }
}

// =============================================================================
// CLI EXECUTION
// =============================================================================

const userId = process.argv[2];

if (!userId) {
  console.error('Usage: node scripts/migrateToAIContext.js <userId>');
  console.error('Example: node scripts/migrateToAIContext.js abc123def456');
  process.exit(1);
}

migrateUserToAIContext(userId)
  .then(() => {
    console.log('[migrateToAIContext] Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('[migrateToAIContext] Script failed:', error);
    process.exit(1);
  });
