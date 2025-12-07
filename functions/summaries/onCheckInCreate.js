const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { generateCheckInInsight } = require('./generateAISummary');
const { getRecentAverages } = require('./aggregateWeekData');

const db = admin.firestore();

/**
 * Triggered when a new check-in is created
 * Generates an AI insight and stores it in the user's aiInsights subcollection
 */
exports.onCheckInCreate = functions.firestore
  .document('checkIns/{checkInId}')
  .onCreate(async (snap, context) => {
    const { checkInId } = context.params;
    const checkIn = snap.data();
    const userId = checkIn.userId;

    if (!userId) {
      console.log('No userId in check-in, skipping insight generation');
      return null;
    }

    console.log(`[AI Insights] Processing check-in ${checkInId} for user ${userId}`);

    try {
      // Get recent averages for context
      const recentAvgs = await getRecentAverages(userId);

      // Generate insight
      const insight = await generateCheckInInsight(checkIn, recentAvgs);

      if (!insight) {
        console.log(`[AI Insights] No insight generated for check-in ${checkInId}`);
        return null;
      }

      // Extract metrics from check-in (handle nested structure)
      const mood = checkIn.mood ?? checkIn.morningData?.mood ?? checkIn.eveningData?.mood;
      const craving = checkIn.craving ?? checkIn.morningData?.craving ?? checkIn.eveningData?.craving;
      const anxiety = checkIn.anxiety ?? checkIn.morningData?.anxiety ?? checkIn.eveningData?.anxiety;
      const sleep = checkIn.sleep ?? checkIn.morningData?.sleep ?? checkIn.eveningData?.sleep;

      // Store insight in user's aiInsights subcollection
      await db.collection('users').doc(userId).collection('aiInsights').add({
        type: 'check-in',
        generatedAt: admin.firestore.FieldValue.serverTimestamp(),
        dataSourcesScanned: ['checkIns'],
        insight: insight,
        dataSnapshot: {
          mood: mood || null,
          craving: craving || null,
          anxiety: anxiety || null,
          sleep: sleep || null,
          checkInId: checkInId,
          checkInType: checkIn.type || (checkIn.morningData ? 'morning' : 'evening'),
        },
        dismissed: false,
        expiresAt: admin.firestore.Timestamp.fromDate(
          new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
        ),
      });

      console.log(`[AI Insights] Generated check-in insight for user ${userId}`);
      return null;

    } catch (error) {
      console.error(`[AI Insights] Error generating check-in insight for user ${userId}:`, error);
      return null;
    }
  });
