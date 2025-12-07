/**
 * AI Context Reader Library
 *
 * Provides a single source of truth for reading user context data.
 * All AI generation functions should use this instead of querying collections directly.
 *
 * Path: users/{userId}/aiContext/current
 *
 * Benefits:
 * - 1 read vs 7+ collection queries = 85% fewer Firestore reads
 * - Faster function execution (less I/O)
 * - Consistent data snapshot (no race conditions)
 * - Pre-computed patterns ready for GPT
 */

const admin = require('firebase-admin');

// =============================================================================
// CONSTANTS
// =============================================================================

const AI_CONTEXT_PATH = 'aiContext';
const AI_CONTEXT_DOC = 'current';
const STALE_THRESHOLD_HOURS = 48; // Consider context stale after 48 hours

// =============================================================================
// MAIN READER FUNCTION
// =============================================================================

/**
 * Read the aiContext document for a user with automatic fallback
 *
 * @param {string} userId - The user's ID
 * @param {FirebaseFirestore.Firestore} db - Firestore instance
 * @param {Object} options - Optional configuration
 * @param {boolean} options.allowStale - If true, return stale data without fallback (default: false)
 * @param {number} options.staleThresholdHours - Hours before data is considered stale (default: 48)
 * @returns {Promise<{source: string, data: Object, isStale: boolean}>}
 */
async function getAIContext(userId, db, options = {}) {
  const { allowStale = false, staleThresholdHours = STALE_THRESHOLD_HOURS } = options;

  if (!userId) {
    console.error('[aiContextReader] No userId provided');
    return { source: 'error', data: null, isStale: true, error: 'No userId provided' };
  }

  try {
    const contextRef = db.collection('users').doc(userId).collection(AI_CONTEXT_PATH).doc(AI_CONTEXT_DOC);
    const contextSnap = await contextRef.get();

    if (contextSnap.exists) {
      const context = contextSnap.data();

      // Check freshness
      const lastUpdated = context.lastUpdated?.toDate?.() || new Date(0);
      const hoursSinceUpdate = (Date.now() - lastUpdated.getTime()) / (1000 * 60 * 60);
      const isStale = hoursSinceUpdate > staleThresholdHours;

      if (!isStale || allowStale) {
        console.log(`[aiContextReader] Successfully read aiContext for user ${userId} (${hoursSinceUpdate.toFixed(1)}h old)`);
        return {
          source: 'aiContext',
          data: context,
          isStale,
          lastUpdated: lastUpdated.toISOString(),
          hoursSinceUpdate: Math.round(hoursSinceUpdate * 10) / 10
        };
      }

      // Context is stale, log warning but still return it with fallback flag
      console.warn(`[aiContextReader] aiContext is stale (${hoursSinceUpdate.toFixed(1)}h old) for user ${userId}`);

      // Return stale data but mark it - caller can decide whether to supplement
      return {
        source: 'aiContext_stale',
        data: context,
        isStale: true,
        lastUpdated: lastUpdated.toISOString(),
        hoursSinceUpdate: Math.round(hoursSinceUpdate * 10) / 10
      };
    }

    // Document doesn't exist - need to build from scratch
    console.warn(`[aiContextReader] aiContext does not exist for user ${userId}, using fallback queries`);
    const fallbackData = await buildFallbackContext(userId, db);
    return {
      source: 'fallback',
      data: fallbackData,
      isStale: false,
      note: 'Built from direct collection queries'
    };

  } catch (error) {
    console.error(`[aiContextReader] Error reading aiContext for user ${userId}:`, error);

    // Attempt fallback on error
    try {
      const fallbackData = await buildFallbackContext(userId, db);
      return {
        source: 'fallback_after_error',
        data: fallbackData,
        isStale: false,
        originalError: error.message
      };
    } catch (fallbackError) {
      console.error(`[aiContextReader] Fallback also failed:`, fallbackError);
      return {
        source: 'error',
        data: null,
        isStale: true,
        error: fallbackError.message
      };
    }
  }
}

// =============================================================================
// FALLBACK CONTEXT BUILDER
// =============================================================================

/**
 * Build context from direct collection queries when aiContext doesn't exist
 * This mirrors the structure of the aiContext document
 *
 * @param {string} userId - The user's ID
 * @param {FirebaseFirestore.Firestore} db - Firestore instance
 * @returns {Promise<Object>} Context object matching aiContext schema
 */
async function buildFallbackContext(userId, db) {
  console.log(`[aiContextReader] Building fallback context for user ${userId}`);

  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const todayStr = now.toISOString().split('T')[0];

  // Parallel queries for efficiency
  const [
    userDoc,
    checkInsSnap,
    habitsSnap,
    habitCompletionsSnap,
    goalsSnap,
    reflectionsSnap,
    gratitudesSnap,
    winsSnap
  ] = await Promise.all([
    db.collection('users').doc(userId).get(),
    db.collection('checkIns')
      .where('userId', '==', userId)
      .where('createdAt', '>=', sevenDaysAgo)
      .orderBy('createdAt', 'desc')
      .limit(50)
      .get(),
    db.collection('habits')
      .where('userId', '==', userId)
      .where('status', '==', 'active')
      .get(),
    db.collection('habitCompletions')
      .where('userId', '==', userId)
      .where('completedAt', '>=', sevenDaysAgo)
      .get(),
    db.collection('goals')
      .where('userId', '==', userId)
      .get(),
    db.collection('reflections')
      .where('userId', '==', userId)
      .where('createdAt', '>=', thirtyDaysAgo)
      .orderBy('createdAt', 'desc')
      .limit(30)
      .get(),
    db.collection('gratitudes')
      .where('userId', '==', userId)
      .where('createdAt', '>=', thirtyDaysAgo)
      .orderBy('createdAt', 'desc')
      .limit(30)
      .get(),
    db.collection('todayWins')
      .where('userId', '==', userId)
      .where('createdAt', '>=', thirtyDaysAgo)
      .orderBy('createdAt', 'desc')
      .limit(30)
      .get()
  ]);

  // Process user data
  const userData = userDoc.exists ? userDoc.data() : {};
  const recoveryStartDate = userData.recoveryStartDate?.toDate?.() || userData.sobrietyDate?.toDate?.() || null;
  const sobrietyDays = recoveryStartDate
    ? Math.floor((now.getTime() - recoveryStartDate.getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  // Process check-ins for 7-day metrics
  const checkIns = checkInsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  const recent7DaysMetrics = calculateRecentMetrics(checkIns);

  // Process habits
  const habits = habitsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  const habitCompletions = habitCompletionsSnap.docs.map(doc => doc.data());
  const habitStats = calculateHabitStats(habits, habitCompletions);

  // Process goals
  const goals = goalsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  const activeGoals = goals.filter(g => g.status === 'active' || !g.status);
  const completedGoals = goals.filter(g => g.status === 'completed');

  // Process reflections/gratitudes/wins
  const reflections = reflectionsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  const gratitudes = gratitudesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  const wins = winsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

  // Find today's check-ins
  const todayCheckIns = checkIns.filter(c => {
    const checkInDate = c.createdAt?.toDate?.() || new Date(c.createdAt);
    return checkInDate.toISOString().split('T')[0] === todayStr;
  });
  const morningCheckIn = todayCheckIns.find(c => c.type === 'morning' || c.morningData);
  const eveningCheckIn = todayCheckIns.find(c => c.type === 'evening' || c.eveningData);

  // Build the context object matching aiContext schema
  return {
    userId,
    lastUpdated: admin.firestore.Timestamp.now(),
    schemaVersion: 1,
    _fallbackGenerated: true,
    _generatedAt: now.toISOString(),

    user: {
      firstName: userData.firstName || userData.displayName?.split(' ')[0] || '',
      recoveryStartDate: recoveryStartDate ? admin.firestore.Timestamp.fromDate(recoveryStartDate) : null,
      sobrietyDays,
      primarySubstance: userData.primarySubstance || null,
      stage: getSobrietyStage(sobrietyDays),
      isVeteran: userData.isVeteran || false,
      timezone: userData.timezone || 'America/Los_Angeles'
    },

    today: {
      date: todayStr,
      morningCheckIn: {
        completed: !!morningCheckIn,
        completedAt: morningCheckIn?.createdAt || null,
        mood: morningCheckIn?.mood || morningCheckIn?.morningData?.mood || null,
        craving: morningCheckIn?.craving || morningCheckIn?.morningData?.craving || null,
        anxiety: morningCheckIn?.anxiety || morningCheckIn?.morningData?.anxiety || null,
        sleep: morningCheckIn?.sleep || morningCheckIn?.morningData?.sleep || null,
        energy: morningCheckIn?.energy || morningCheckIn?.morningData?.energy || null
      },
      eveningCheckIn: {
        completed: !!eveningCheckIn,
        completedAt: eveningCheckIn?.createdAt || null,
        overallDay: eveningCheckIn?.overallDay || eveningCheckIn?.eveningData?.overallDay || null,
        gratitude: eveningCheckIn?.gratitude || eveningCheckIn?.eveningData?.gratitude || null,
        tomorrowGoal: eveningCheckIn?.tomorrowGoal || eveningCheckIn?.eveningData?.tomorrowGoal || null
      },
      habitsCompleted: getTodayCompletedHabits(habitCompletions, todayStr),
      habitsExpected: habits.length,
      reflectionsCount: reflections.filter(r => r.createdAt?.toDate?.().toISOString().split('T')[0] === todayStr).length,
      gratitudesCount: gratitudes.filter(g => g.createdAt?.toDate?.().toISOString().split('T')[0] === todayStr).length,
      winsCount: wins.filter(w => w.createdAt?.toDate?.().toISOString().split('T')[0] === todayStr).length,
      meetingsAttended: 0,
      assignmentsCompleted: 0
    },

    recent7Days: recent7DaysMetrics,

    patterns: {
      bestDayOfWeek: findBestDay(checkIns),
      worstDayOfWeek: findWorstDay(checkIns),
      highCravingTime: null,
      sleepMoodCorrelation: calculateCorrelation(checkIns, 'sleep', 'mood'),
      weekendMoodDiff: calculateWeekendDiff(checkIns),
      topGratitudeCategories: extractCategories(gratitudes, 3),
      topWinCategories: extractCategories(wins, 3)
    },

    streaks: {
      checkInStreak: calculateCheckInStreak(checkIns),
      checkInStreakAtRisk: !morningCheckIn && !eveningCheckIn,
      meetingStreak: 0,
      habitStreaks: habitStats.streaks,
      allHabitsStreak: 0
    },

    habits: {
      definitions: habits.map(h => ({ id: h.id, name: h.name, frequency: h.frequency || 'daily' })),
      activeCount: habits.length,
      completionRate7Day: habitStats.completionRate7Day,
      completionRate30Day: habitStats.completionRate30Day,
      topHabits: habitStats.topHabits,
      needsAttention: habitStats.needsAttention
    },

    goals: {
      activeCount: activeGoals.length,
      completedCount: completedGoals.length,
      active: activeGoals.slice(0, 10).map(g => ({
        id: g.id,
        title: g.title || g.name || 'Untitled Goal',
        category: g.category || null,
        progress: g.progress || 0,
        targetDate: g.targetDate || null,
        isOverdue: g.targetDate && g.targetDate.toDate?.() < now
      })),
      avgProgress: activeGoals.length > 0
        ? Math.round(activeGoals.reduce((sum, g) => sum + (g.progress || 0), 0) / activeGoals.length)
        : 0,
      overdueCount: activeGoals.filter(g => g.targetDate && g.targetDate.toDate?.() < now).length,
      recentlyCompleted: completedGoals.slice(0, 5).map(g => ({
        id: g.id,
        title: g.title || g.name || 'Untitled Goal',
        completedAt: g.completedAt || g.updatedAt
      }))
    },

    reflections: {
      count30Day: reflections.length,
      weeklyAverage: Math.round(reflections.length / 4),
      recentThemes: extractThemes(reflections),
      sentimentTrend: 'neutral'
    },

    gratitudes: {
      count30Day: gratitudes.length,
      weeklyAverage: Math.round(gratitudes.length / 4),
      topCategories: extractCategoryCounts(gratitudes)
    },

    wins: {
      count30Day: wins.length,
      weeklyAverage: Math.round(wins.length / 4),
      topCategories: extractCategoryCounts(wins)
    },

    context: {
      isWeekend: [0, 6].includes(now.getDay()),
      isHighRisk: recent7DaysMetrics.avgCraving > 6 || recent7DaysMetrics.avgAnxiety > 7,
      riskFactors: buildRiskFactors(recent7DaysMetrics),
      needsEncouragement: recent7DaysMetrics.moodTrend === 'declining',
      hasPositiveMomentum: recent7DaysMetrics.moodTrend === 'improving',
      daysToNextMilestone: getNextMilestone(sobrietyDays),
      engagedToday: !!morningCheckIn || !!eveningCheckIn,
      lastInsightDate: null,
      lastInsightType: null
    }
  };
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function calculateRecentMetrics(checkIns) {
  if (!checkIns || checkIns.length === 0) {
    return {
      checkInCount: 0,
      avgMood: null,
      avgCraving: null,
      avgAnxiety: null,
      avgSleep: null,
      avgEnergy: null,
      moodValues: [],
      cravingValues: [],
      anxietyValues: [],
      sleepValues: [],
      energyValues: [],
      moodTrend: 'stable',
      cravingTrend: 'stable',
      anxietyTrend: 'stable',
      sleepTrend: 'stable',
      energyTrend: 'stable'
    };
  }

  const getMetric = (checkIn, field) => {
    return checkIn[field] || checkIn.morningData?.[field] || checkIn.eveningData?.[field] || null;
  };

  const moodValues = checkIns.map(c => getMetric(c, 'mood')).filter(v => v !== null);
  const cravingValues = checkIns.map(c => getMetric(c, 'craving')).filter(v => v !== null);
  const anxietyValues = checkIns.map(c => getMetric(c, 'anxiety')).filter(v => v !== null);
  const sleepValues = checkIns.map(c => getMetric(c, 'sleep')).filter(v => v !== null);
  const energyValues = checkIns.map(c => getMetric(c, 'energy')).filter(v => v !== null);

  const avg = arr => arr.length > 0 ? Math.round((arr.reduce((a, b) => a + b, 0) / arr.length) * 10) / 10 : null;
  const trend = arr => {
    if (arr.length < 3) return 'stable';
    const recent = arr.slice(0, Math.ceil(arr.length / 2));
    const older = arr.slice(Math.ceil(arr.length / 2));
    const recentAvg = avg(recent);
    const olderAvg = avg(older);
    if (recentAvg === null || olderAvg === null) return 'stable';
    const diff = recentAvg - olderAvg;
    if (Math.abs(diff) < 0.5) return 'stable';
    return diff > 0 ? 'improving' : 'declining';
  };

  return {
    checkInCount: checkIns.length,
    avgMood: avg(moodValues),
    avgCraving: avg(cravingValues),
    avgAnxiety: avg(anxietyValues),
    avgSleep: avg(sleepValues),
    avgEnergy: avg(energyValues),
    moodValues: moodValues.slice(0, 7),
    cravingValues: cravingValues.slice(0, 7),
    anxietyValues: anxietyValues.slice(0, 7),
    sleepValues: sleepValues.slice(0, 7),
    energyValues: energyValues.slice(0, 7),
    moodTrend: trend(moodValues),
    cravingTrend: trend(cravingValues),
    anxietyTrend: trend(anxietyValues),
    sleepTrend: trend(sleepValues),
    energyTrend: trend(energyValues)
  };
}

function calculateHabitStats(habits, completions) {
  const habitCompletionMap = new Map();

  completions.forEach(c => {
    const habitId = c.habitId;
    if (!habitCompletionMap.has(habitId)) {
      habitCompletionMap.set(habitId, []);
    }
    habitCompletionMap.get(habitId).push(c);
  });

  const streaks = habits.map(h => ({
    habitId: h.id,
    habitName: h.name,
    currentStreak: (habitCompletionMap.get(h.id) || []).length,
    longestStreak: (habitCompletionMap.get(h.id) || []).length
  }));

  const totalExpected = habits.length * 7;
  const totalCompleted = completions.length;
  const completionRate7Day = totalExpected > 0 ? Math.round((totalCompleted / totalExpected) * 100) : 0;

  const topHabits = streaks
    .sort((a, b) => b.currentStreak - a.currentStreak)
    .slice(0, 3)
    .map(s => ({ habitId: s.habitId, habitName: s.habitName, completionRate: Math.min(100, s.currentStreak * 14) }));

  const needsAttention = streaks
    .filter(s => s.currentStreak < 2)
    .slice(0, 3)
    .map(s => ({ habitId: s.habitId, habitName: s.habitName, completionRate: s.currentStreak * 14, daysMissed: 7 - s.currentStreak }));

  return {
    streaks,
    completionRate7Day,
    completionRate30Day: completionRate7Day, // Simplified
    topHabits,
    needsAttention
  };
}

function getSobrietyStage(days) {
  if (days < 30) return 'early';
  if (days < 90) return 'developing';
  if (days < 365) return 'sustained';
  return 'stable';
}

function getTodayCompletedHabits(completions, todayStr) {
  return completions
    .filter(c => {
      const date = c.completedAt?.toDate?.() || new Date(c.completedAt);
      return date.toISOString().split('T')[0] === todayStr;
    })
    .map(c => c.habitId);
}

function findBestDay(checkIns) {
  const dayMoods = {};
  checkIns.forEach(c => {
    const date = c.createdAt?.toDate?.() || new Date(c.createdAt);
    const day = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][date.getDay()];
    const mood = c.mood || c.morningData?.mood;
    if (mood) {
      if (!dayMoods[day]) dayMoods[day] = [];
      dayMoods[day].push(mood);
    }
  });

  let bestDay = null;
  let bestAvg = 0;
  Object.entries(dayMoods).forEach(([day, moods]) => {
    const avg = moods.reduce((a, b) => a + b, 0) / moods.length;
    if (avg > bestAvg) {
      bestAvg = avg;
      bestDay = day;
    }
  });
  return bestDay;
}

function findWorstDay(checkIns) {
  const dayMoods = {};
  checkIns.forEach(c => {
    const date = c.createdAt?.toDate?.() || new Date(c.createdAt);
    const day = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][date.getDay()];
    const mood = c.mood || c.morningData?.mood;
    if (mood) {
      if (!dayMoods[day]) dayMoods[day] = [];
      dayMoods[day].push(mood);
    }
  });

  let worstDay = null;
  let worstAvg = 11;
  Object.entries(dayMoods).forEach(([day, moods]) => {
    const avg = moods.reduce((a, b) => a + b, 0) / moods.length;
    if (avg < worstAvg) {
      worstAvg = avg;
      worstDay = day;
    }
  });
  return worstDay;
}

function calculateCorrelation(checkIns, field1, field2) {
  const pairs = checkIns
    .map(c => ({
      v1: c[field1] || c.morningData?.[field1],
      v2: c[field2] || c.morningData?.[field2]
    }))
    .filter(p => p.v1 !== null && p.v1 !== undefined && p.v2 !== null && p.v2 !== undefined);

  if (pairs.length < 5) return null;

  const n = pairs.length;
  const sumX = pairs.reduce((a, p) => a + p.v1, 0);
  const sumY = pairs.reduce((a, p) => a + p.v2, 0);
  const sumXY = pairs.reduce((a, p) => a + p.v1 * p.v2, 0);
  const sumX2 = pairs.reduce((a, p) => a + p.v1 * p.v1, 0);
  const sumY2 = pairs.reduce((a, p) => a + p.v2 * p.v2, 0);

  const numerator = n * sumXY - sumX * sumY;
  const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

  if (denominator === 0) return null;
  return Math.round((numerator / denominator) * 100) / 100;
}

function calculateWeekendDiff(checkIns) {
  const weekdayMoods = [];
  const weekendMoods = [];

  checkIns.forEach(c => {
    const date = c.createdAt?.toDate?.() || new Date(c.createdAt);
    const mood = c.mood || c.morningData?.mood;
    if (mood) {
      if ([0, 6].includes(date.getDay())) {
        weekendMoods.push(mood);
      } else {
        weekdayMoods.push(mood);
      }
    }
  });

  if (weekdayMoods.length === 0 || weekendMoods.length === 0) return null;

  const weekdayAvg = weekdayMoods.reduce((a, b) => a + b, 0) / weekdayMoods.length;
  const weekendAvg = weekendMoods.reduce((a, b) => a + b, 0) / weekendMoods.length;

  return Math.round((weekendAvg - weekdayAvg) * 10) / 10;
}

function extractCategories(items, limit) {
  const categories = {};
  items.forEach(item => {
    const cat = item.category || 'general';
    categories[cat] = (categories[cat] || 0) + 1;
  });
  return Object.entries(categories)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([cat]) => cat);
}

function extractCategoryCounts(items) {
  const categories = {};
  items.forEach(item => {
    const cat = item.category || 'general';
    categories[cat] = (categories[cat] || 0) + 1;
  });
  return Object.entries(categories)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([category, count]) => ({ category, count }));
}

function extractThemes(reflections) {
  // Simple word frequency for themes
  const words = {};
  const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'is', 'are', 'was', 'were', 'i', 'my', 'me', 'to', 'for', 'of', 'in', 'on', 'at', 'it', 'that', 'this', 'with', 'have', 'had', 'be', 'been', 'being']);

  reflections.forEach(r => {
    const text = (r.content || r.text || '').toLowerCase();
    text.split(/\W+/).forEach(word => {
      if (word.length > 3 && !stopWords.has(word)) {
        words[word] = (words[word] || 0) + 1;
      }
    });
  });

  return Object.entries(words)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([word]) => word);
}

function calculateCheckInStreak(checkIns) {
  if (!checkIns || checkIns.length === 0) return 0;

  const dates = new Set(checkIns.map(c => {
    const date = c.createdAt?.toDate?.() || new Date(c.createdAt);
    return date.toISOString().split('T')[0];
  }));

  let streak = 0;
  let currentDate = new Date();

  for (let i = 0; i < 30; i++) {
    const dateStr = currentDate.toISOString().split('T')[0];
    if (dates.has(dateStr)) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}

function buildRiskFactors(metrics) {
  const factors = [];
  if (metrics.avgCraving > 6) factors.push('high_cravings');
  if (metrics.avgAnxiety > 7) factors.push('high_anxiety');
  if (metrics.moodTrend === 'declining') factors.push('declining_mood');
  if (metrics.sleepTrend === 'declining') factors.push('poor_sleep');
  return factors;
}

function getNextMilestone(days) {
  const milestones = [7, 14, 30, 60, 90, 180, 365, 730, 1095];
  for (const milestone of milestones) {
    if (days < milestone) {
      return milestone - days;
    }
  }
  return null;
}

// =============================================================================
// EXPORTS
// =============================================================================

module.exports = {
  getAIContext,
  buildFallbackContext,
  AI_CONTEXT_PATH,
  AI_CONTEXT_DOC,
  STALE_THRESHOLD_HOURS
};
