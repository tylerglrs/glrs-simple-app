const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { generateReflectionInsight } = require('./generateAISummary');

const db = admin.firestore();

/**
 * Triggered when a new reflection is created
 * Generates an AI insight and stores it in the user's aiInsights subcollection
 */
exports.onReflectionCreate = functions.firestore
  .document('reflections/{reflectionId}')
  .onCreate(async (snap, context) => {
    const { reflectionId } = context.params;
    const reflection = snap.data();
    const userId = reflection.userId;

    if (!userId) {
      console.log('No userId in reflection, skipping insight generation');
      return null;
    }

    console.log(`[AI Insights] Processing reflection ${reflectionId} for user ${userId}`);

    try {
      // Generate insight
      const insight = await generateReflectionInsight(reflection);

      if (!insight) {
        console.log(`[AI Insights] No insight generated for reflection ${reflectionId}`);
        return null;
      }

      // Store insight in user's aiInsights subcollection
      await db.collection('users').doc(userId).collection('aiInsights').add({
        type: 'reflection',
        generatedAt: admin.firestore.FieldValue.serverTimestamp(),
        dataSourcesScanned: ['reflections'],
        insight: insight,
        dataSnapshot: {
          dayRating: reflection.dayRating || reflection.overallDay || null,
          hasGratitude: !!(reflection.gratitude),
          hasChallenge: !!(reflection.challenge || reflection.challenges),
          hasTomorrowGoal: !!(reflection.tomorrowGoal),
          reflectionId: reflectionId,
        },
        dismissed: false,
        expiresAt: admin.firestore.Timestamp.fromDate(
          new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
        ),
      });

      console.log(`[AI Insights] Generated reflection insight for user ${userId}`);
      return null;

    } catch (error) {
      console.error(`[AI Insights] Error generating reflection insight for user ${userId}:`, error);
      return null;
    }
  });
