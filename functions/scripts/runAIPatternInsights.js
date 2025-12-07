/**
 * Test script to run AI Pattern Insights generation for a user
 * Usage: OPENAI_API_KEY=sk-xxx node scripts/runAIPatternInsights.js
 */

const admin = require('firebase-admin');
admin.initializeApp({ projectId: 'glrs-pir-system' });

// Set up OpenAI API key from environment
if (!process.env.OPENAI_API_KEY) {
  console.error('ERROR: OPENAI_API_KEY environment variable is required');
  console.log('Usage: OPENAI_API_KEY=sk-xxx node scripts/runAIPatternInsights.js');
  process.exit(1);
}

const { generateAIPatternInsightsForUser } = require('../ai/generateAIPatternInsights');

const userId = 'QuxUOqnjM0VeK8M7JNnPe1vMTA82';

async function main() {
  console.log('='.repeat(60));
  console.log('Running AI Pattern Insights Generation');
  console.log('User ID:', userId);
  console.log('='.repeat(60));

  try {
    const result = await generateAIPatternInsightsForUser(userId);
    console.log('\nResult:', JSON.stringify(result, null, 2));
    console.log('\n✅ AI Pattern Insights generated successfully!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

main();
