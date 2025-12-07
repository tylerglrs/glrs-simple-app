const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { aggregateMonthData, getMonthId } = require('./aggregateMonthData');
const { generateMonthlySummary } = require('./generateAISummary');

const db = admin.firestore();

/**
 * Scheduled function: Generate monthly summaries for all active users
 * Runs on the last day of each month at 11:59 PM Pacific Time
 * Note: Using 28-31 pattern to cover all month-end dates
 */
exports.generateMonthlySummaries = functions.pubsub
  .schedule('59 23 28-31 * *') // Days 28-31 at 11:59 PM
  .timeZone('America/Los_Angeles')
  .onRun(async (context) => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Only run if tomorrow is a new month (i.e., today is the last day)
    if (today.getMonth() === tomorrow.getMonth()) {
      console.log('[Monthly Summaries] Not the last day of month, skipping...');
      return null;
    }

    console.log('[Monthly Summaries] Starting monthly summary generation...');

    try {
      // Get all active users (PIRs)
      const usersSnap = await db.collection('users')
        .where('status', '==', 'active')
        .where('role', '==', 'pir')
        .get();

      console.log(`[Monthly Summaries] Processing ${usersSnap.size} active users`);

      const monthDate = new Date();
      const monthId = getMonthId(monthDate);

      let successCount = 0;
      let errorCount = 0;

      for (const userDoc of usersSnap.docs) {
        const userId = userDoc.id;

        try {
          // Aggregate month data
          const monthData = await aggregateMonthData(userId, monthDate);

          // Get prior month for comparison
          const priorMonthDate = new Date(monthDate);
          priorMonthDate.setMonth(priorMonthDate.getMonth() - 1);
          const priorMonthId = getMonthId(priorMonthDate);

          const priorMonthSnap = await db.collection('users').doc(userId)
            .collection('monthlySummaries').doc(priorMonthId).get();
          const priorMonth = priorMonthSnap.exists ? priorMonthSnap.data() : null;

          // Generate AI summary
          const aiSummary = await generateMonthlySummary(monthData, priorMonth);

          // Store monthly summary
          await db.collection('users').doc(userId)
            .collection('monthlySummaries').doc(monthId)
            .set({
              ...monthData,
              aiSummary,
              generatedAt: admin.firestore.FieldValue.serverTimestamp(),
            });

          // Also store as an AI insight
          await db.collection('users').doc(userId).collection('aiInsights').add({
            type: 'monthly',
            generatedAt: admin.firestore.FieldValue.serverTimestamp(),
            dataSourcesScanned: ['weeklySummaries', 'checkIns', 'meetings'],
            insight: aiSummary,
            dataSnapshot: {
              monthId,
              sobrietyDaysEnd: monthData.sobrietyDaysEnd,
              checkInRate: monthData.checkIns.rate,
              meetingsTotal: monthData.meetings.total,
              milestonesAchieved: monthData.milestones.achieved,
            },
            dismissed: false,
            // Monthly summaries don't expire
          });

          successCount++;
          console.log(`[Monthly Summaries] Generated monthly summary for user ${userId}`);

        } catch (userError) {
          errorCount++;
          console.error(`[Monthly Summaries] Error processing user ${userId}:`, userError);
        }
      }

      console.log(`[Monthly Summaries] Complete. Success: ${successCount}, Errors: ${errorCount}`);
      return null;

    } catch (error) {
      console.error('[Monthly Summaries] Monthly summary generation failed:', error);
      throw error;
    }
  });

/**
 * Manual trigger for testing monthly summary generation
 * Callable function for admin use
 */
exports.generateMonthlySummaryManual = functions.https.onCall(async (data, context) => {
  // Verify authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Must be authenticated');
  }

  const userId = data.userId || context.auth.uid;
  const monthDate = data.monthDate ? new Date(data.monthDate) : new Date();

  console.log(`[Monthly Summaries] Manual trigger for user ${userId}`);

  try {
    const monthData = await aggregateMonthData(userId, monthDate);

    // Get prior month for comparison
    const priorMonthDate = new Date(monthDate);
    priorMonthDate.setMonth(priorMonthDate.getMonth() - 1);
    const priorMonthId = getMonthId(priorMonthDate);

    const priorMonthSnap = await db.collection('users').doc(userId)
      .collection('monthlySummaries').doc(priorMonthId).get();
    const priorMonth = priorMonthSnap.exists ? priorMonthSnap.data() : null;

    const aiSummary = await generateMonthlySummary(monthData, priorMonth);

    const monthId = getMonthId(monthDate);

    await db.collection('users').doc(userId)
      .collection('monthlySummaries').doc(monthId)
      .set({
        ...monthData,
        aiSummary,
        generatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

    // Also store as AI insight
    await db.collection('users').doc(userId).collection('aiInsights').add({
      type: 'monthly',
      generatedAt: admin.firestore.FieldValue.serverTimestamp(),
      dataSourcesScanned: ['weeklySummaries', 'checkIns', 'meetings'],
      insight: aiSummary,
      dataSnapshot: {
        monthId,
        sobrietyDaysEnd: monthData.sobrietyDaysEnd,
        checkInRate: monthData.checkIns.rate,
        meetingsTotal: monthData.meetings.total,
        milestonesAchieved: monthData.milestones.achieved,
      },
      dismissed: false,
    });

    return {
      success: true,
      monthId,
      aiSummary,
      monthData,
    };

  } catch (error) {
    console.error(`[Monthly Summaries] Manual trigger failed for user ${userId}:`, error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});
