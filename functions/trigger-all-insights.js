/**
 * Script to trigger ALL AI insight cloud functions for a specific user
 * Run: OPENAI_API_KEY=your-key node trigger-all-insights.js
 */

const admin = require('firebase-admin');

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    projectId: 'glrs-pir-system'
  });
}

const db = admin.firestore();

// User ID for Heinz Roberts
const USER_ID = 'QuxUOqnjM0VeK8M7JNnPe1vMTA82';

// Import all the insight generation functions
const { generateAIPatternInsightsForUser } = require('./ai/generateAIPatternInsights');
const { generateReflectionInsightsForUser } = require('./ai/generateAIReflectionInsights');
const { generateHabitInsightsForUser } = require('./ai/generateAIHabitInsights');
const { generateGoalInsightsForUser } = require('./ai/generateAIGoalInsights');
const { generateDailyContentForUser } = require('./ai/generateDailyContent');
const { generateWeeklyContentForUser } = require('./ai/generateWeeklyContent');

function getWeekId() {
  const now = new Date();
  const year = now.getFullYear();
  const startOfYear = new Date(year, 0, 1);
  const days = Math.floor((now - startOfYear) / (24 * 60 * 60 * 1000));
  const weekNumber = Math.ceil((days + startOfYear.getDay() + 1) / 7);
  return `${year}-W${weekNumber.toString().padStart(2, '0')}`;
}

async function runAllInsightGenerators() {
  console.log('='.repeat(60));
  console.log('BEACON AI - Full Insights Generation');
  console.log('='.repeat(60));
  console.log('User ID:', USER_ID);
  console.log('Week ID:', getWeekId());
  console.log('');

  const results = {
    patternInsights: null,
    reflectionInsights: null,
    habitInsights: null,
    goalInsights: null,
    dailyContent: null,
    weeklyContent: null,
  };

  // 1. Generate AI Pattern Insights
  console.log('\n[1/6] Generating AI Pattern Insights...');
  try {
    results.patternInsights = await generateAIPatternInsightsForUser(USER_ID);
    console.log('✅ Pattern Insights: Generated', results.patternInsights?.insights?.length || 0, 'insights');
  } catch (error) {
    console.error('❌ Pattern Insights failed:', error.message);
  }

  // 2. Generate Reflection Insights
  console.log('\n[2/6] Generating Reflection Insights...');
  try {
    results.reflectionInsights = await generateReflectionInsightsForUser(USER_ID);
    console.log('✅ Reflection Insights: Generated', results.reflectionInsights?.cards?.length || 0, 'cards');
  } catch (error) {
    console.error('❌ Reflection Insights failed:', error.message);
  }

  // 3. Generate Habit Insights
  console.log('\n[3/6] Generating Habit Insights...');
  try {
    results.habitInsights = await generateHabitInsightsForUser(USER_ID);
    console.log('✅ Habit Insights: Generated', results.habitInsights?.recommendations?.length || 0, 'recommendations');
  } catch (error) {
    console.error('❌ Habit Insights failed:', error.message);
  }

  // 4. Generate Goal Insights
  console.log('\n[4/6] Generating Goal Insights...');
  try {
    results.goalInsights = await generateGoalInsightsForUser(USER_ID);
    console.log('✅ Goal Insights: Generated', results.goalInsights?.insights?.length || 0, 'insights');
  } catch (error) {
    console.error('❌ Goal Insights failed:', error.message);
  }

  // 5. Generate Daily Content
  console.log('\n[5/6] Generating Daily Content...');
  try {
    results.dailyContent = await generateDailyContentForUser(USER_ID);
    console.log('✅ Daily Content: Generated');
  } catch (error) {
    console.error('❌ Daily Content failed:', error.message);
  }

  // 6. Generate Weekly Content
  console.log('\n[6/6] Generating Weekly Content...');
  try {
    results.weeklyContent = await generateWeeklyContentForUser(USER_ID);
    console.log('✅ Weekly Content: Generated');
  } catch (error) {
    console.error('❌ Weekly Content failed:', error.message);
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('GENERATION COMPLETE');
  console.log('='.repeat(60));

  const weekId = getWeekId();
  console.log('\nFirestore paths populated:');
  console.log(`  users/${USER_ID}/weeklyInsights/aiPatterns_${weekId}`);
  console.log(`  users/${USER_ID}/weeklyInsights/reflections_${weekId}`);
  console.log(`  users/${USER_ID}/weeklyInsights/habits_${weekId}`);
  console.log(`  users/${USER_ID}/weeklyInsights/goals_${weekId}`);
  console.log(`  users/${USER_ID}/beaconContent/daily`);
  console.log(`  users/${USER_ID}/beaconContent/weekly`);

  console.log('\nResults Summary:');
  console.log('  Pattern Insights:', results.patternInsights ? '✅' : '❌');
  console.log('  Reflection Insights:', results.reflectionInsights ? '✅' : '❌');
  console.log('  Habit Insights:', results.habitInsights ? '✅' : '❌');
  console.log('  Goal Insights:', results.goalInsights ? '✅' : '❌');
  console.log('  Daily Content:', results.dailyContent ? '✅' : '❌');
  console.log('  Weekly Content:', results.weeklyContent ? '✅' : '❌');

  return results;
}

// Run
runAllInsightGenerators()
  .then(() => {
    console.log('\nDone!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
