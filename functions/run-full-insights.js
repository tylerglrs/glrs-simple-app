/**
 * Script to manually run AI Pattern Insights generation
 * Run: GOOGLE_APPLICATION_CREDENTIALS=/path/to/key.json OPENAI_API_KEY=your-key node run-full-insights.js
 */

const admin = require('firebase-admin');

// Initialize Firebase Admin with project ID (will use gcloud auth)
if (!admin.apps.length) {
  admin.initializeApp({
    projectId: 'glrs-pir-system'
  });
}

// Import the function
const { generateAIPatternInsightsForUser, buildComprehensiveContext, buildGPTPrompt, callGPTForInsights, getWeekId } = require('./ai/generateAIPatternInsights');

// The user ID to generate insights for
const USER_ID = 'QuxUOqnjM0VeK8M7JNnPe1vMTA82';

async function main() {
  console.log('Starting AI Pattern Insights generation...');
  console.log('User ID:', USER_ID);
  console.log('Week ID:', getWeekId());

  try {
    // Step 1: Build context
    console.log('\n=== Step 1: Building user context ===');
    let context;
    try {
      context = await buildComprehensiveContext(USER_ID);
    } catch (ctxError) {
      console.error('Context build failed:', ctxError.message);
      throw ctxError;
    }
    if (!context) {
      console.error('Context is null - check Firebase credentials');
      return;
    }
    console.log('Context built for:', context.user?.firstName || 'Unknown');
    console.log('Check-ins this week:', context.thisWeek.checkIns.length);
    console.log('Mood data points:', context.thisWeek.metrics.mood.length);

    // Step 2: Build prompt
    console.log('\n=== Step 2: Building GPT prompt ===');
    const { systemPrompt, userPrompt } = buildGPTPrompt(context);
    console.log('System prompt length:', systemPrompt.length);
    console.log('User prompt length:', userPrompt.length);

    // Step 3: Call GPT
    console.log('\n=== Step 3: Calling GPT-4o-mini ===');
    const insights = await callGPTForInsights(systemPrompt, userPrompt, context);
    console.log('Generated insights:', insights.length);

    // Log first insight to verify actionId
    if (insights.length > 0) {
      console.log('\nFirst insight sample:');
      console.log(JSON.stringify(insights[0], null, 2));
    }

    // Step 4: Save to Firestore
    console.log('\n=== Step 4: Saving to Firestore ===');
    const db = admin.firestore();
    const weekId = getWeekId();
    const docRef = db.collection('users').doc(USER_ID).collection('weeklyInsights').doc(`aiPatterns_${weekId}`);

    await docRef.set({
      weekId,
      generatedAt: admin.firestore.FieldValue.serverTimestamp(),
      insights,
      userId: USER_ID,
    });

    console.log('Saved to:', `users/${USER_ID}/weeklyInsights/aiPatterns_${weekId}`);
    console.log('\n=== Generation complete! ===');
    console.log('Total insights generated:', insights.length);

    // Count insights by actionType
    const actionCounts = insights.reduce((acc, i) => {
      acc[i.actionType] = (acc[i.actionType] || 0) + 1;
      return acc;
    }, {});
    console.log('Action types:', actionCounts);

    // Show all actionIds for technique actions
    const techniqueInsights = insights.filter(i => i.actionType === 'technique');
    console.log('\nTechnique recommendations:');
    techniqueInsights.forEach(i => {
      console.log(`  - ${i.metric}: ${i.actionId || 'NO_ID'} (${i.title})`);
    });

  } catch (error) {
    console.error('Error generating insights:', error);
    console.error(error.stack);
  }

  process.exit(0);
}

main();
