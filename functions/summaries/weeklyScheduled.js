const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { aggregateWeekData, getWeekId } = require('./aggregateWeekData');
const { generateWeeklySummary } = require('./generateAISummary');

const db = admin.firestore();

/**
 * Scheduled function: Generate weekly summaries for all active users
 * Runs every Sunday at 11:59 PM Pacific Time
 */
exports.generateWeeklySummaries = functions.pubsub
  .schedule('59 23 * * 0') // Sunday 11:59 PM
  .timeZone('America/Los_Angeles')
  .onRun(async (context) => {
    console.log('[Weekly Summaries] Starting weekly summary generation...');

    try {
      // Get all active users (PIRs)
      const usersSnap = await db.collection('users')
        .where('status', '==', 'active')
        .where('role', '==', 'pir')
        .get();

      console.log(`[Weekly Summaries] Processing ${usersSnap.size} active users`);

      const weekDate = new Date();
      const weekId = getWeekId(weekDate);

      let successCount = 0;
      let errorCount = 0;

      for (const userDoc of usersSnap.docs) {
        const userId = userDoc.id;

        try {
          // Aggregate week data
          const weekData = await aggregateWeekData(userId, weekDate);

          // Generate AI summary
          const aiSummary = await generateWeeklySummary(weekData);

          // Store weekly summary in user's weeklySummaries subcollection
          await db.collection('users').doc(userId)
            .collection('weeklySummaries').doc(weekId)
            .set({
              ...weekData,
              aiSummary,
              generatedAt: admin.firestore.FieldValue.serverTimestamp(),
            });

          // Also store as an AI insight for display in the UI
          await db.collection('users').doc(userId).collection('aiInsights').add({
            type: 'weekly',
            generatedAt: admin.firestore.FieldValue.serverTimestamp(),
            dataSourcesScanned: ['checkIns', 'reflections', 'habits', 'meetings'],
            insight: aiSummary,
            dataSnapshot: {
              weekId,
              checkInRate: weekData.checkIns.rate,
              moodAvg: weekData.checkIns.moodAvg,
              meetingsAttended: weekData.meetings.attended,
              habitCompletionRate: weekData.habits.overallCompletionRate,
            },
            dismissed: false,
            // Weekly summaries don't expire
          });

          successCount++;
          console.log(`[Weekly Summaries] Generated weekly summary for user ${userId}`);

        } catch (userError) {
          errorCount++;
          console.error(`[Weekly Summaries] Error processing user ${userId}:`, userError);
        }
      }

      console.log(`[Weekly Summaries] Complete. Success: ${successCount}, Errors: ${errorCount}`);
      return null;

    } catch (error) {
      console.error('[Weekly Summaries] Weekly summary generation failed:', error);
      throw error;
    }
  });

/**
 * Manual trigger for testing weekly summary generation
 * Callable function for admin use
 */
exports.generateWeeklySummaryManual = functions.https.onCall(async (data, context) => {
  // Verify authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Must be authenticated');
  }

  const userId = data.userId || context.auth.uid;
  const weekDate = data.weekDate ? new Date(data.weekDate) : new Date();

  console.log(`[Weekly Summaries] Manual trigger for user ${userId}`);

  try {
    const weekData = await aggregateWeekData(userId, weekDate);
    const aiSummary = await generateWeeklySummary(weekData);

    const weekId = getWeekId(weekDate);

    await db.collection('users').doc(userId)
      .collection('weeklySummaries').doc(weekId)
      .set({
        ...weekData,
        aiSummary,
        generatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

    // Also store as AI insight
    await db.collection('users').doc(userId).collection('aiInsights').add({
      type: 'weekly',
      generatedAt: admin.firestore.FieldValue.serverTimestamp(),
      dataSourcesScanned: ['checkIns', 'reflections', 'habits', 'meetings'],
      insight: aiSummary,
      dataSnapshot: {
        weekId,
        checkInRate: weekData.checkIns.rate,
        moodAvg: weekData.checkIns.moodAvg,
        meetingsAttended: weekData.meetings.attended,
      },
      dismissed: false,
    });

    return {
      success: true,
      weekId,
      aiSummary,
      weekData,
    };

  } catch (error) {
    console.error(`[Weekly Summaries] Manual trigger failed for user ${userId}:`, error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});
