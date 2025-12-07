/**
 * Test script to run AI Context recalculation and AI Pattern Insights
 * Usage: node scripts/runAIContextTest.js
 */

const admin = require('firebase-admin');
admin.initializeApp({ projectId: 'glrs-pir-system' });
const db = admin.firestore();

const userId = 'QuxUOqnjM0VeK8M7JNnPe1vMTA82';

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function average(arr) {
  if (!arr || arr.length === 0) return null;
  const valid = arr.filter((v) => v !== null && v !== undefined && !isNaN(v));
  if (valid.length === 0) return null;
  return Math.round((valid.reduce((a, b) => a + b, 0) / valid.length) * 10) / 10;
}

function getTrend(current, previous) {
  if (current === null || previous === null) return 'stable';
  const diff = current - previous;
  if (Math.abs(diff) < 0.5) return 'stable';
  return diff > 0 ? 'improving' : 'declining';
}

function getCravingTrend(current, previous) {
  if (current === null || previous === null) return 'stable';
  const diff = previous - current;
  if (Math.abs(diff) < 0.5) return 'stable';
  return diff > 0 ? 'improving' : 'declining';
}

// =============================================================================
// STEP 1: RECALCULATE AI CONTEXT
// =============================================================================

async function runRecalculation() {
  console.log('='.repeat(60));
  console.log('STEP 1: Running AI Context Recalculation');
  console.log('User ID:', userId);
  console.log('='.repeat(60));

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  const fourteenDaysAgo = new Date();
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
  fourteenDaysAgo.setHours(0, 0, 0, 0);

  // Get check-ins from last 14 days
  const checkInsSnapshot = await db
    .collection('checkIns')
    .where('userId', '==', userId)
    .where('createdAt', '>=', admin.firestore.Timestamp.fromDate(fourteenDaysAgo))
    .orderBy('createdAt', 'desc')
    .get();

  console.log('Found', checkInsSnapshot.size, 'check-ins in last 14 days');

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

  console.log('Current week check-ins:', currentWeek.length);
  console.log('Previous week check-ins:', previousWeek.length);

  // Extract metrics
  const extractMetric = (list, field) =>
    list.map((c) => c.morningData?.[field] ?? c[field]).filter((v) => v !== null && v !== undefined);

  const currentMoods = extractMetric(currentWeek, 'mood');
  const currentCravings = extractMetric(currentWeek, 'craving');
  const previousMoods = extractMetric(previousWeek, 'mood');
  const previousCravings = extractMetric(previousWeek, 'craving');

  const avgMood = average(currentMoods);
  const avgCraving = average(currentCravings);
  const prevAvgMood = average(previousMoods);
  const prevAvgCraving = average(previousCravings);

  console.log('\nCalculated Averages:');
  console.log('  Mood (current):', avgMood, '(previous:', prevAvgMood, ')');
  console.log('  Craving (current):', avgCraving, '(previous:', prevAvgCraving, ')');

  const moodTrend = getTrend(avgMood, prevAvgMood);
  const cravingTrend = getCravingTrend(avgCraving, prevAvgCraving);

  console.log('\nCalculated Trends:');
  console.log('  Mood trend:', moodTrend);
  console.log('  Craving trend:', cravingTrend);

  // Get user for sobriety calculation
  const userDoc = await db.collection('users').doc(userId).get();
  const userData = userDoc.data();
  let sobrietyDays = 0;
  const startDateStr = userData.sobrietyDate || userData.recoveryStartDate;
  if (startDateStr) {
    const startDate =
      startDateStr.toDate?.() || new Date(startDateStr._seconds * 1000) || new Date(startDateStr);
    const now = new Date();
    sobrietyDays = Math.floor((now - startDate) / (24 * 60 * 60 * 1000));
  }

  console.log('\nSobriety Days:', sobrietyDays);

  // Build updates
  const updates = {
    'user.sobrietyDays': sobrietyDays,
    'recent7Days.checkInCount': currentWeek.length,
    'recent7Days.avgMood': avgMood,
    'recent7Days.avgCraving': avgCraving,
    'recent7Days.moodTrend': moodTrend,
    'recent7Days.cravingTrend': cravingTrend,
    'recent7Days.moodValues': currentMoods.slice(0, 7),
    'recent7Days.cravingValues': currentCravings.slice(0, 7),
    lastRecalculatedAt: admin.firestore.FieldValue.serverTimestamp(),
    lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
  };

  // Determine risk factors
  const riskFactors = [];
  if (avgCraving !== null && avgCraving >= 7) riskFactors.push('high_cravings');
  if (moodTrend === 'declining') riskFactors.push('declining_mood');
  if (currentWeek.length < 3) riskFactors.push('low_engagement');

  updates['context.riskFactors'] = riskFactors;
  updates['context.isHighRisk'] = riskFactors.length >= 2;
  updates['context.hasPositiveMomentum'] = moodTrend === 'improving' && cravingTrend === 'improving';

  console.log('\nRisk Factors:', riskFactors);
  console.log('High Risk:', riskFactors.length >= 2);
  console.log('Positive Momentum:', moodTrend === 'improving' && cravingTrend === 'improving');

  // Write updates
  await db.collection('users').doc(userId).collection('aiContext').doc('current').update(updates);

  console.log('\n✅ AI Context recalculated and updated!');
  console.log('='.repeat(60));
}

// =============================================================================
// STEP 2: CHECK AI CONTEXT DOCUMENT
// =============================================================================

async function checkAIContext() {
  console.log('\n' + '='.repeat(60));
  console.log('STEP 2: Checking AI Context Document');
  console.log('='.repeat(60));

  const contextDoc = await db
    .collection('users')
    .doc(userId)
    .collection('aiContext')
    .doc('current')
    .get();

  if (!contextDoc.exists) {
    console.log('No aiContext document found!');
    return;
  }

  const data = contextDoc.data();
  console.log('\nAI Context Summary:');
  console.log('  Last Updated:', data.lastUpdated?.toDate?.()?.toISOString() || 'N/A');
  console.log('  Last Recalculated:', data.lastRecalculatedAt?.toDate?.()?.toISOString() || 'N/A');
  console.log('\nUser:');
  console.log('  Name:', data.user?.firstName);
  console.log('  Sobriety Days:', data.user?.sobrietyDays);
  console.log('  Stage:', data.user?.stage);
  console.log('\nRecent 7 Days:');
  console.log('  Check-in Count:', data.recent7Days?.checkInCount);
  console.log('  Avg Mood:', data.recent7Days?.avgMood);
  console.log('  Avg Craving:', data.recent7Days?.avgCraving);
  console.log('  Mood Trend:', data.recent7Days?.moodTrend);
  console.log('  Craving Trend:', data.recent7Days?.cravingTrend);
  console.log('\nContext:');
  console.log('  Risk Factors:', data.context?.riskFactors);
  console.log('  Is High Risk:', data.context?.isHighRisk);
  console.log('  Positive Momentum:', data.context?.hasPositiveMomentum);
  console.log('\nData Counts:');
  console.log('  Check-ins History:', data.checkInsHistory?.length || 0);
  console.log('  Reflections:', data.reflections?.totalCount || 0);
  console.log('  Gratitudes:', data.gratitudes?.totalCount || 0);
  console.log('  Wins:', data.wins?.totalCount || 0);
  console.log('  Technique Completions:', data.techniqueCompletions?.totalCount || 0);
  console.log('  Meeting Attendance:', data.meetings?.totalAttended || 0);
  console.log('='.repeat(60));
}

// =============================================================================
// RUN ALL
// =============================================================================

async function main() {
  try {
    await runRecalculation();
    await checkAIContext();
    console.log('\n✅ ALL TESTS COMPLETE!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

main();
