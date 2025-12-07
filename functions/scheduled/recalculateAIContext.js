/**
 * recalculateAIContext.js
 *
 * Scheduled Cloud Function that runs nightly at 8 PM Pacific
 * Recalculates aiContext averages, trends, and patterns from source collections
 *
 * Schedule: 0 20 * * * (8 PM daily) in America/Los_Angeles timezone
 */

const functions = require('firebase-functions');
const admin = require('firebase-admin');

// Import monitoring for structured logging
const {
  logFunctionStart,
  logFunctionError,
  recordFunctionExecution,
} = require('../monitoring/functionMonitor');

// Initialize if not already
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Get date N days ago
 */
function getDaysAgo(days) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  date.setHours(0, 0, 0, 0);
  return date;
}

/**
 * Calculate average of an array of numbers
 */
function average(arr) {
  if (!arr || arr.length === 0) return null;
  const valid = arr.filter((v) => v !== null && v !== undefined && !isNaN(v));
  if (valid.length === 0) return null;
  return Math.round((valid.reduce((a, b) => a + b, 0) / valid.length) * 10) / 10;
}

/**
 * Calculate trend from two averages (current vs previous period)
 */
function getTrend(current, previous) {
  if (current === null || previous === null) return 'stable';
  const diff = current - previous;
  if (Math.abs(diff) < 0.5) return 'stable';
  return diff > 0 ? 'improving' : 'declining';
}

/**
 * Calculate trend for cravings (lower is better, so invert)
 */
function getCravingTrend(current, previous) {
  if (current === null || previous === null) return 'stable';
  const diff = previous - current; // Inverted: lower current = improving
  if (Math.abs(diff) < 0.5) return 'stable';
  return diff > 0 ? 'improving' : 'declining';
}

/**
 * Get day of week name
 */
function getDayName(dayIndex) {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[dayIndex];
}

/**
 * Calculate days between two dates
 */
function daysBetween(date1, date2) {
  const oneDay = 24 * 60 * 60 * 1000;
  return Math.floor(Math.abs((date2 - date1) / oneDay));
}

/**
 * Calculate check-in streak from check-in dates
 */
function calculateStreak(checkInDates) {
  if (!checkInDates || checkInDates.length === 0) return 0;

  // Sort dates descending
  const sortedDates = [...checkInDates].sort((a, b) => b - a);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let streak = 0;
  let currentDate = new Date(today);

  // Check if today has a check-in
  const todayStr = today.toISOString().split('T')[0];
  const dateStrings = sortedDates.map((d) => d.toISOString().split('T')[0]);

  if (!dateStrings.includes(todayStr)) {
    // Check yesterday
    currentDate.setDate(currentDate.getDate() - 1);
  }

  while (true) {
    const dateStr = currentDate.toISOString().split('T')[0];
    if (dateStrings.includes(dateStr)) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}

// =============================================================================
// MAIN RECALCULATION FUNCTION
// =============================================================================

/**
 * Recalculate aiContext for a single user
 */
async function recalculateUserContext(userId) {
  const updates = {};
  const now = new Date();
  const today = now.toISOString().split('T')[0];
  const sevenDaysAgo = getDaysAgo(7);
  const fourteenDaysAgo = getDaysAgo(14);
  const thirtyDaysAgo = getDaysAgo(30);

  try {
    // Get user document
    const userDoc = await db.collection('users').doc(userId).get();
    if (!userDoc.exists) {
      console.log(`[${userId}] User document not found, skipping`);
      return null;
    }
    const userData = userDoc.data();

    // ==========================================================================
    // RECALCULATE SOBRIETY DAYS
    // ==========================================================================
    let sobrietyDays = 0;
    let stage = 'unknown';
    const startDateStr = userData.sobrietyDate || userData.recoveryStartDate;
    if (startDateStr) {
      const startDate =
        startDateStr.toDate?.() || new Date(startDateStr._seconds * 1000) || new Date(startDateStr);
      sobrietyDays = daysBetween(startDate, now);
      if (sobrietyDays < 90) stage = 'early';
      else if (sobrietyDays < 180) stage = 'developing';
      else if (sobrietyDays < 365) stage = 'sustained';
      else stage = 'stable';
    }
    updates['user.sobrietyDays'] = sobrietyDays;
    updates['user.stage'] = stage;

    // ==========================================================================
    // FETCH CHECK-INS (last 14 days for trend calculation)
    // ==========================================================================
    const checkInsSnapshot = await db
      .collection('checkIns')
      .where('userId', '==', userId)
      .where('createdAt', '>=', admin.firestore.Timestamp.fromDate(fourteenDaysAgo))
      .orderBy('createdAt', 'desc')
      .get();

    const checkIns = checkInsSnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        ...data,
        createdAt: data.createdAt?.toDate?.() || new Date(data.createdAt),
      };
    });

    // Split into current week and previous week
    const currentWeek = checkIns.filter((c) => c.createdAt >= sevenDaysAgo);
    const previousWeek = checkIns.filter(
      (c) => c.createdAt >= fourteenDaysAgo && c.createdAt < sevenDaysAgo
    );

    // Extract metrics
    const extractMetric = (list, field) =>
      list.map((c) => c.morningData?.[field] ?? c[field]).filter((v) => v !== null && v !== undefined);

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

    // Calculate averages
    const avgMood = average(currentMoods);
    const avgCraving = average(currentCravings);
    const avgAnxiety = average(currentAnxiety);
    const avgSleep = average(currentSleep);
    const avgEnergy = average(currentEnergy);

    updates['recent7Days.checkInCount'] = currentWeek.length;
    updates['recent7Days.avgMood'] = avgMood;
    updates['recent7Days.avgCraving'] = avgCraving;
    updates['recent7Days.avgAnxiety'] = avgAnxiety;
    updates['recent7Days.avgSleep'] = avgSleep;
    updates['recent7Days.avgEnergy'] = avgEnergy;
    updates['recent7Days.moodValues'] = currentMoods.slice(0, 7);
    updates['recent7Days.cravingValues'] = currentCravings.slice(0, 7);
    updates['recent7Days.anxietyValues'] = currentAnxiety.slice(0, 7);
    updates['recent7Days.sleepValues'] = currentSleep.slice(0, 7);
    updates['recent7Days.energyValues'] = currentEnergy.slice(0, 7);

    // Calculate trends
    updates['recent7Days.moodTrend'] = getTrend(avgMood, average(previousMoods));
    updates['recent7Days.cravingTrend'] = getCravingTrend(avgCraving, average(previousCravings));
    updates['recent7Days.anxietyTrend'] = getCravingTrend(avgAnxiety, average(previousAnxiety));
    updates['recent7Days.sleepTrend'] = getTrend(avgSleep, average(previousSleep));
    updates['recent7Days.energyTrend'] = getTrend(avgEnergy, average(previousEnergy));

    // ==========================================================================
    // CALCULATE PATTERNS
    // ==========================================================================
    // Group check-ins by day of week
    const moodByDay = {};
    checkIns.forEach((c) => {
      const day = c.createdAt.getDay();
      const mood = c.morningData?.mood ?? c.mood;
      if (mood !== null && mood !== undefined) {
        if (!moodByDay[day]) moodByDay[day] = [];
        moodByDay[day].push(mood);
      }
    });

    // Find best and worst days
    let bestDay = null;
    let bestAvg = -Infinity;
    let worstDay = null;
    let worstAvg = Infinity;

    Object.keys(moodByDay).forEach((day) => {
      const avg = average(moodByDay[day]);
      if (avg !== null) {
        if (avg > bestAvg) {
          bestAvg = avg;
          bestDay = parseInt(day);
        }
        if (avg < worstAvg) {
          worstAvg = avg;
          worstDay = parseInt(day);
        }
      }
    });

    updates['patterns.bestDayOfWeek'] = bestDay !== null ? getDayName(bestDay) : null;
    updates['patterns.worstDayOfWeek'] = worstDay !== null ? getDayName(worstDay) : null;

    // Calculate sleep-mood correlation (simple)
    const sleepMoodPairs = currentWeek
      .map((c) => ({
        sleep: c.morningData?.sleep ?? c.sleep,
        mood: c.morningData?.mood ?? c.mood,
      }))
      .filter((p) => p.sleep !== null && p.mood !== null);

    if (sleepMoodPairs.length >= 3) {
      // Simple correlation: high sleep with high mood = positive
      const highSleep = sleepMoodPairs.filter((p) => p.sleep >= 7);
      const lowSleep = sleepMoodPairs.filter((p) => p.sleep < 7);
      const highSleepMoodAvg = average(highSleep.map((p) => p.mood));
      const lowSleepMoodAvg = average(lowSleep.map((p) => p.mood));

      if (highSleepMoodAvg !== null && lowSleepMoodAvg !== null) {
        const diff = highSleepMoodAvg - lowSleepMoodAvg;
        if (diff > 1) updates['patterns.sleepMoodCorrelation'] = 'strong_positive';
        else if (diff > 0.5) updates['patterns.sleepMoodCorrelation'] = 'positive';
        else if (diff < -0.5) updates['patterns.sleepMoodCorrelation'] = 'negative';
        else updates['patterns.sleepMoodCorrelation'] = 'neutral';
      }
    }

    // Weekend vs weekday mood difference
    const weekendCheckIns = currentWeek.filter((c) => {
      const day = c.createdAt.getDay();
      return day === 0 || day === 6;
    });
    const weekdayCheckIns = currentWeek.filter((c) => {
      const day = c.createdAt.getDay();
      return day !== 0 && day !== 6;
    });

    const weekendMoodAvg = average(extractMetric(weekendCheckIns, 'mood'));
    const weekdayMoodAvg = average(extractMetric(weekdayCheckIns, 'mood'));

    if (weekendMoodAvg !== null && weekdayMoodAvg !== null) {
      updates['patterns.weekendMoodDiff'] = Math.round((weekendMoodAvg - weekdayMoodAvg) * 10) / 10;
    }

    // ==========================================================================
    // CALCULATE CHECK-IN STREAK
    // ==========================================================================
    const allCheckInsSnapshot = await db
      .collection('checkIns')
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .limit(90) // Last 90 days max
      .get();

    const checkInDates = allCheckInsSnapshot.docs.map((doc) => {
      const data = doc.data();
      const date = data.createdAt?.toDate?.() || new Date(data.createdAt);
      return date;
    });

    const checkInStreak = calculateStreak(checkInDates);
    updates['streaks.checkInStreak'] = checkInStreak;
    updates['streaks.checkInStreakAtRisk'] = !checkInDates.some((d) => {
      return d.toISOString().split('T')[0] === today;
    });

    // ==========================================================================
    // CALCULATE HABIT COMPLETION RATES
    // ==========================================================================
    const habitsSnapshot = await db
      .collection('habits')
      .where('userId', '==', userId)
      .where('isActive', '==', true)
      .get();

    const habits = habitsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    updates['habits.activeCount'] = habits.length;

    if (habits.length > 0) {
      // Get habit completions for last 30 days
      const completionsSnapshot = await db
        .collection('habitCompletions')
        .where('userId', '==', userId)
        .where('completedAt', '>=', admin.firestore.Timestamp.fromDate(thirtyDaysAgo))
        .get();

      const completions = completionsSnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          ...data,
          completedAt: data.completedAt?.toDate?.() || new Date(data.completedAt),
        };
      });

      // Calculate 7-day and 30-day completion rates
      const completions7Day = completions.filter((c) => c.completedAt >= sevenDaysAgo);
      const expectedDaily7Day = habits.filter((h) => h.frequency === 'daily').length * 7;
      const expectedWeekly7Day = habits.filter((h) => h.frequency === 'weekly').length;
      const expected7Day = expectedDaily7Day + expectedWeekly7Day;

      const expectedDaily30Day = habits.filter((h) => h.frequency === 'daily').length * 30;
      const expectedWeekly30Day = habits.filter((h) => h.frequency === 'weekly').length * 4;
      const expected30Day = expectedDaily30Day + expectedWeekly30Day;

      updates['habits.completionRate7Day'] =
        expected7Day > 0 ? Math.round((completions7Day.length / expected7Day) * 100) : 0;
      updates['habits.completionRate30Day'] =
        expected30Day > 0 ? Math.round((completions.length / expected30Day) * 100) : 0;

      // Find habits that need attention (< 50% completion rate)
      const habitCompletionCounts = {};
      completions7Day.forEach((c) => {
        habitCompletionCounts[c.habitId] = (habitCompletionCounts[c.habitId] || 0) + 1;
      });

      const needsAttention = habits
        .filter((h) => {
          const expected = h.frequency === 'daily' ? 7 : 1;
          const actual = habitCompletionCounts[h.id] || 0;
          return actual / expected < 0.5;
        })
        .map((h) => h.name || h.id)
        .slice(0, 3);

      updates['habits.needsAttention'] = needsAttention;
    }

    // ==========================================================================
    // UPDATE TODAY SECTION
    // ==========================================================================
    const todayCheckIns = checkIns.filter((c) => c.createdAt.toISOString().split('T')[0] === today);

    const morningCheckIn = todayCheckIns.find((c) => c.type === 'morning');
    const eveningCheckIn = todayCheckIns.find((c) => c.type === 'evening');

    updates['today.date'] = today;
    updates['today.morningCheckIn.completed'] = !!morningCheckIn;
    updates['today.eveningCheckIn.completed'] = !!eveningCheckIn;
    updates['context.engagedToday'] = !!morningCheckIn || !!eveningCheckIn;
    updates['context.isWeekend'] = now.getDay() === 0 || now.getDay() === 6;

    // ==========================================================================
    // CALCULATE NEXT MILESTONE
    // ==========================================================================
    const milestones = [7, 14, 30, 60, 90, 180, 365, 730, 1095, 1825];
    const nextMilestone = milestones.find((m) => m > sobrietyDays);

    if (nextMilestone) {
      updates['milestones.nextMilestone'] = {
        days: nextMilestone,
        daysUntil: nextMilestone - sobrietyDays,
      };
      updates['context.daysToNextMilestone'] = nextMilestone - sobrietyDays;
    }

    // ==========================================================================
    // DETERMINE RISK FACTORS AND ENCOURAGEMENT
    // ==========================================================================
    const riskFactors = [];

    // High cravings
    if (avgCraving !== null && avgCraving >= 7) {
      riskFactors.push('high_cravings');
    }

    // Declining mood
    if (updates['recent7Days.moodTrend'] === 'declining') {
      riskFactors.push('declining_mood');
    }

    // Poor sleep
    if (avgSleep !== null && avgSleep < 5) {
      riskFactors.push('poor_sleep');
    }

    // Low engagement
    if (currentWeek.length < 3) {
      riskFactors.push('low_engagement');
    }

    updates['context.riskFactors'] = riskFactors;
    updates['context.isHighRisk'] = riskFactors.length >= 2;
    updates['context.needsEncouragement'] =
      avgMood !== null && avgMood < 5 && updates['recent7Days.moodTrend'] !== 'improving';
    updates['context.hasPositiveMomentum'] =
      updates['recent7Days.moodTrend'] === 'improving' &&
      updates['recent7Days.cravingTrend'] === 'improving';

    // ==========================================================================
    // WRITE UPDATES TO FIRESTORE
    // ==========================================================================
    updates['lastUpdated'] = admin.firestore.FieldValue.serverTimestamp();
    updates['lastRecalculatedAt'] = admin.firestore.FieldValue.serverTimestamp();

    await db.collection('users').doc(userId).collection('aiContext').doc('current').update(updates);

    return {
      userId,
      sobrietyDays,
      checkInStreak,
      avgMood,
      avgCraving,
      updatedFields: Object.keys(updates).length,
    };
  } catch (error) {
    console.error(`[${userId}] Error recalculating context:`, error);
    return { userId, error: error.message };
  }
}

// =============================================================================
// SCHEDULED FUNCTION - Runs daily at 8 PM Pacific
// =============================================================================

exports.recalculateAIContextNightly = functions
  .runWith({
    timeoutSeconds: 540, // 9 minutes
    memory: '512MB',
  })
  .pubsub.schedule('0 20 * * *')
  .timeZone('America/Los_Angeles')
  .onRun(async (context) => {
    const startTime = new Date();

    // Log function start with structured logging
    logFunctionStart('recalculateAIContextNightly', { schedule: 'Daily 8 PM PT' });

    console.log('='.repeat(60));
    console.log('[recalculateAIContext] Starting nightly recalculation');
    console.log('='.repeat(60));

    try {
      // Get all users who have aiContext documents
      const usersSnapshot = await db.collection('users').get();
      const users = usersSnapshot.docs.map((doc) => doc.id);

      console.log(`[recalculateAIContext] Found ${users.length} users to process`);

      const results = {
        total: users.length,
        success: 0,
        skipped: 0,
        failed: 0,
        errors: [],
      };

      for (const userId of users) {
        // Check if user has aiContext
        const contextDoc = await db
          .collection('users')
          .doc(userId)
          .collection('aiContext')
          .doc('current')
          .get();

        if (!contextDoc.exists) {
          results.skipped++;
          continue;
        }

        const result = await recalculateUserContext(userId);

        if (result && !result.error) {
          results.success++;
          console.log(
            `[${userId}] Recalculated: ${result.sobrietyDays} days, streak: ${result.checkInStreak}, mood: ${result.avgMood}`
          );
        } else {
          results.failed++;
          if (result?.error) {
            results.errors.push({ userId, error: result.error });
          }
        }

        // Small delay to avoid rate limiting
        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      const duration = Math.round((new Date() - startTime) / 1000);

      console.log('='.repeat(60));
      console.log('[recalculateAIContext] COMPLETE');
      console.log(`  Duration: ${duration}s`);
      console.log(`  Total: ${results.total}`);
      console.log(`  Success: ${results.success}`);
      console.log(`  Skipped: ${results.skipped}`);
      console.log(`  Failed: ${results.failed}`);
      console.log('='.repeat(60));

      // Record execution summary to Firestore for monitoring dashboard
      await recordFunctionExecution('recalculateAIContextNightly', {
        startTime,
        total: results.total - results.skipped,
        successful: results.success,
        failed: results.failed,
        errors: results.errors,
        metadata: { skipped: results.skipped },
      });

      return results;
    } catch (error) {
      // Log critical error
      logFunctionError('recalculateAIContextNightly', error, { phase: 'main_loop' });

      // Record failed execution
      await recordFunctionExecution('recalculateAIContextNightly', {
        startTime,
        total: 0,
        successful: 0,
        failed: 1,
        errors: [{ error: error.message, stack: error.stack }],
      });

      throw error;
    }
  });

// =============================================================================
// CALLABLE FUNCTION - For manual testing
// =============================================================================

exports.recalculateAIContextManual = functions
  .runWith({
    timeoutSeconds: 300,
    memory: '512MB',
  })
  .https.onCall(async (data, context) => {
    // Verify caller is authenticated
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'Must be authenticated');
    }

    const userId = data.userId || context.auth.uid;
    const allUsers = data.allUsers || false;

    console.log(`[recalculateAIContextManual] Called by ${context.auth.uid}`);
    console.log(`  Target: ${allUsers ? 'ALL USERS' : userId}`);

    if (allUsers) {
      // Check if caller is admin
      const callerDoc = await db.collection('users').doc(context.auth.uid).get();
      const callerData = callerDoc.data();
      if (!['admin', 'superadmin', 'superadmin1'].includes(callerData?.role)) {
        throw new functions.https.HttpsError('permission-denied', 'Only admins can recalculate all users');
      }

      // Run for all users
      const usersSnapshot = await db.collection('users').get();
      const results = [];

      for (const doc of usersSnapshot.docs) {
        const contextDoc = await db
          .collection('users')
          .doc(doc.id)
          .collection('aiContext')
          .doc('current')
          .get();

        if (contextDoc.exists) {
          const result = await recalculateUserContext(doc.id);
          results.push(result);
        }
      }

      return {
        success: true,
        message: `Recalculated ${results.length} users`,
        results,
      };
    } else {
      // Run for single user
      const result = await recalculateUserContext(userId);

      if (result?.error) {
        throw new functions.https.HttpsError('internal', result.error);
      }

      return {
        success: true,
        message: `Recalculated context for ${userId}`,
        result,
      };
    }
  });
