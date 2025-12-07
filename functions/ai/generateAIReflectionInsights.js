/**
 * BEACON AI - Reflection & Gratitude Insights Generation
 * Phase 2: Weekly Insights Cloud Function
 *
 * Generates personalized insights about reflection and gratitude patterns:
 * - dominant_topic: What themes dominate their reflections
 * - gratitude_pattern: Patterns in what they're grateful for
 * - timing_insight: When they reflect best/most
 * - gap_analysis: What's missing in their reflection practice
 *
 * Writes to: users/{userId}/weeklyInsights/reflections_{weekId}
 * Read by: useReflectionThemes() hook in useBeaconContent.ts
 */

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const OpenAI = require('openai').default;

// Import Beacon personality
const {
  BEACON_INSIGHT_PROMPT,
  BEACON_VOICE,
  SPECIFICITY_RULES,
} = require('../beacon/beaconPersonality');

// Import libraries
const CTA_LIBRARY = require('../beacon/CTA_LIBRARY.json');

// Import AI Context Reader
const { getAIContext } = require('./lib/aiContextReader');

// Firestore reference (lazy initialized)
let db = null;

function getDb() {
  if (!db) {
    db = admin.firestore();
  }
  return db;
}

// OpenAI client (lazy initialization)
let openai = null;

function getOpenAIClient() {
  if (!openai) {
    const apiKey = functions.config().openai?.key || process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OpenAI API key not configured');
    }
    openai = new OpenAI({ apiKey });
  }
  return openai;
}

// =============================================================================
// HELPER: WEEK ID GENERATION
// =============================================================================

function getCurrentWeekId() {
  const now = new Date();
  const year = now.getFullYear();
  const startOfYear = new Date(year, 0, 1);
  const days = Math.floor((now - startOfYear) / (24 * 60 * 60 * 1000));
  const weekNumber = Math.ceil((days + startOfYear.getDay() + 1) / 7);
  return `${year}-W${weekNumber.toString().padStart(2, '0')}`;
}

// =============================================================================
// CARD TYPE DEFINITIONS
// =============================================================================

const REFLECTION_CARD_TYPES = {
  dominant_topic: {
    icon: 'Sparkles',
    iconColor: '#8b5cf6', // purple
    getTitle: (data) => data.topicName || 'Your Main Theme',
  },
  gratitude_pattern: {
    icon: 'Heart',
    iconColor: '#ec4899', // pink
    getTitle: (data) => 'Gratitude Insight',
  },
  timing_insight: {
    icon: 'Clock',
    iconColor: '#06b6d4', // cyan
    getTitle: (data) => 'When You Shine',
  },
  gap_analysis: {
    icon: 'AlertCircle',
    iconColor: '#f59e0b', // amber
    getTitle: (data) => 'Room to Grow',
  },
};

// =============================================================================
// CTA SELECTION
// =============================================================================

function selectCTA(cardType, context) {
  const ctaMap = {
    dominant_topic: 'log-evening-reflection',
    gratitude_pattern: 'add-gratitude',
    timing_insight: 'log-evening-reflection',
    gap_analysis: context.reflectionCount === 0 ? 'log-evening-reflection' : 'add-gratitude',
  };

  const ctaId = ctaMap[cardType] || 'log-evening-reflection';
  return CTA_LIBRARY.ctas.find(c => c.id === ctaId) || null;
}

// =============================================================================
// ANALYZE REFLECTION PATTERNS
// =============================================================================

function analyzeReflectionPatterns(aiContext) {
  const analysis = {
    totalReflections: 0,
    totalGratitudes: 0,
    reflectionThemes: [],
    gratitudeThemes: [],
    bestReflectionDay: null,
    bestReflectionTime: null,
    daysWithoutReflection: 0,
    daysWithoutGratitude: 0,
    recentReflections: [],
    recentGratitudes: [],
  };

  // Extract reflection data from aiContext
  const reflections = aiContext.reflections || {};
  const gratitudes = aiContext.gratitudes || {};

  analysis.totalReflections = reflections.count30Day || 0;
  analysis.totalGratitudes = gratitudes.count30Day || 0;

  // Recent reflections (last 7 days approximation)
  analysis.reflectionThemes = reflections.topThemes || [];
  analysis.gratitudeThemes = gratitudes.topThemes || [];

  // Calculate days without (approximate based on counts)
  const avgReflectionsPerDay = analysis.totalReflections / 30;
  analysis.daysWithoutReflection = avgReflectionsPerDay < 0.2 ? 7 :
    (avgReflectionsPerDay < 0.5 ? 3 : 0);

  const avgGratitudesPerDay = analysis.totalGratitudes / 30;
  analysis.daysWithoutGratitude = avgGratitudesPerDay < 0.2 ? 7 :
    (avgGratitudesPerDay < 0.5 ? 3 : 0);

  // Extract timing patterns if available
  if (reflections.bestTime) {
    analysis.bestReflectionTime = reflections.bestTime;
  }
  if (reflections.bestDay) {
    analysis.bestReflectionDay = reflections.bestDay;
  }

  return analysis;
}

// =============================================================================
// GENERATE CARDS WITH AI
// =============================================================================

async function generateReflectionCards(userId, aiContext, analysis) {
  const cards = [];
  const weekId = getCurrentWeekId();

  // Build context string for AI
  const contextSummary = `
User: ${aiContext.user?.firstName || 'Friend'}
Sobriety Day: ${aiContext.user?.sobrietyDays || 0}

Reflection Activity (30 days):
- Total reflections: ${analysis.totalReflections}
- Total gratitudes: ${analysis.totalGratitudes}
- Top reflection themes: ${analysis.reflectionThemes.slice(0, 3).join(', ') || 'None identified'}
- Top gratitude themes: ${analysis.gratitudeThemes.slice(0, 3).join(', ') || 'None identified'}
- Days without reflection: ${analysis.daysWithoutReflection}
- Days without gratitude: ${analysis.daysWithoutGratitude}
${analysis.bestReflectionTime ? `- Best reflection time: ${analysis.bestReflectionTime}` : ''}
${analysis.bestReflectionDay ? `- Best reflection day: ${analysis.bestReflectionDay}` : ''}

Current Week: ${weekId}
`;

  const systemPrompt = `${BEACON_INSIGHT_PROMPT}

You are generating insight cards about a user's reflection and gratitude practices.

${BEACON_VOICE}

${SPECIFICITY_RULES}

For each card, provide a JSON object with:
- message: 1-2 sentences, specific to their data, warm but direct
- basedOn: array of specific data points you referenced (e.g., "5 reflections this month", "gratitude theme: family")

Be specific with numbers and themes. Never be generic. If data is missing, acknowledge it directly.`;

  try {
    const client = getOpenAIClient();

    // Determine which card types to generate based on available data
    const cardTypesToGenerate = [];

    // Always try dominant_topic if they have reflections
    if (analysis.totalReflections > 0 && analysis.reflectionThemes.length > 0) {
      cardTypesToGenerate.push('dominant_topic');
    }

    // Gratitude pattern if they have gratitudes
    if (analysis.totalGratitudes > 0) {
      cardTypesToGenerate.push('gratitude_pattern');
    }

    // Timing insight if we have timing data
    if (analysis.bestReflectionTime || analysis.bestReflectionDay) {
      cardTypesToGenerate.push('timing_insight');
    }

    // Gap analysis if missing data or low engagement
    if (analysis.totalReflections < 7 || analysis.totalGratitudes < 7 ||
        analysis.daysWithoutReflection > 3 || analysis.daysWithoutGratitude > 3) {
      cardTypesToGenerate.push('gap_analysis');
    }

    // Ensure at least one card type (gap_analysis as fallback)
    if (cardTypesToGenerate.length === 0) {
      cardTypesToGenerate.push('gap_analysis');
    }

    // Generate each card type
    for (const cardType of cardTypesToGenerate) {
      const cardConfig = REFLECTION_CARD_TYPES[cardType];

      const prompt = `Generate a ${cardType} insight card for this user.

${contextSummary}

Card type: ${cardType}
${cardType === 'dominant_topic' ? `Focus on their top theme: ${analysis.reflectionThemes[0] || 'recovery journey'}` : ''}
${cardType === 'gratitude_pattern' ? `Focus on gratitude patterns: ${analysis.gratitudeThemes.slice(0, 2).join(', ') || 'building the practice'}` : ''}
${cardType === 'timing_insight' ? `Focus on when they reflect best: ${analysis.bestReflectionTime || analysis.bestReflectionDay || 'evening time'}` : ''}
${cardType === 'gap_analysis' ? `Focus on what's missing: ${analysis.daysWithoutReflection} days without reflection, ${analysis.daysWithoutGratitude} days without gratitude` : ''}

Respond with ONLY a JSON object (no markdown):
{
  "message": "your insight message here",
  "basedOn": ["specific data point 1", "specific data point 2"]
}`;

      try {
        const completion = await client.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: prompt },
          ],
          max_tokens: 200,
          temperature: 0.7,
        });

        const responseText = completion.choices[0]?.message?.content || '';

        // Parse JSON response
        let parsed;
        try {
          // Clean up potential markdown formatting
          const cleaned = responseText.replace(/```json\n?|\n?```/g, '').trim();
          parsed = JSON.parse(cleaned);
        } catch (parseError) {
          console.error(`Failed to parse AI response for ${cardType}:`, responseText);
          parsed = {
            message: responseText.substring(0, 200),
            basedOn: [`${analysis.totalReflections} reflections`],
          };
        }

        // Build the card
        const card = {
          id: `${cardType}_${Date.now()}`,
          type: cardType,
          icon: cardConfig.icon,
          iconColor: cardConfig.iconColor,
          title: cardConfig.getTitle({ topicName: analysis.reflectionThemes[0] }),
          message: parsed.message || '',
          basedOn: parsed.basedOn || [],
          cta: selectCTA(cardType, {
            reflectionCount: analysis.totalReflections,
            gratitudeCount: analysis.totalGratitudes,
          }),
        };

        cards.push(card);

      } catch (cardError) {
        console.error(`Error generating ${cardType} card:`, cardError);
      }
    }

  } catch (error) {
    console.error('Error in generateReflectionCards:', error);
  }

  return cards;
}

// =============================================================================
// MAIN: GENERATE REFLECTION INSIGHTS FOR ONE USER
// =============================================================================

async function generateReflectionInsightsForUser(userId) {
  const weekId = getCurrentWeekId();
  const result = {
    userId,
    weekId,
    success: true,
    cardCount: 0,
    error: null,
  };

  try {
    // Get AI context for this user
    const { source, data: aiContext, isStale } = await getAIContext(userId, getDb());

    if (!aiContext) {
      result.success = false;
      result.error = 'Failed to get AI context';
      return result;
    }

    console.log(`[ReflectionInsights] User ${userId}: context source=${source}, isStale=${isStale}`);

    // Analyze reflection patterns
    const analysis = analyzeReflectionPatterns(aiContext);

    // Generate cards
    const cards = await generateReflectionCards(userId, aiContext, analysis);

    // Build the document
    const insightDoc = {
      userId,
      weekId,
      cards,
      totalReflections: analysis.totalReflections,
      totalGratitudes: analysis.totalGratitudes,
      generatedAt: admin.firestore.FieldValue.serverTimestamp(),
      _aiContextSource: source,
      _aiContextStale: isStale,
    };

    // Write to Firestore
    await getDb()
      .collection('users')
      .doc(userId)
      .collection('weeklyInsights')
      .doc(`reflections_${weekId}`)
      .set(insightDoc);

    result.cardCount = cards.length;
    console.log(`[ReflectionInsights] User ${userId}: Generated ${cards.length} cards`);

  } catch (error) {
    result.success = false;
    result.error = error.message;
    console.error(`[ReflectionInsights] User ${userId} error:`, error);
  }

  return result;
}

// =============================================================================
// CLOUD FUNCTION: SCHEDULED WEEKLY GENERATION (Monday 6 AM Pacific)
// =============================================================================

const generateWeeklyReflectionInsights = functions
  .runWith({
    timeoutSeconds: 540,
    memory: '512MB',
  })
  .pubsub.schedule('0 6 * * 1') // Monday 6 AM
  .timeZone('America/Los_Angeles')
  .onRun(async (context) => {
    console.log('[ReflectionInsights] Starting weekly reflection insights generation...');

    try {
      // Get all active PIR users
      const usersSnapshot = await getDb()
        .collection('users')
        .where('role', '==', 'pir')
        .where('status', '==', 'active')
        .get();

      console.log(`[ReflectionInsights] Found ${usersSnapshot.size} active PIR users`);

      const results = {
        total: usersSnapshot.size,
        successful: 0,
        failed: 0,
        errors: [],
      };

      // Process users in batches
      const batchSize = 10;
      const users = usersSnapshot.docs;

      for (let i = 0; i < users.length; i += batchSize) {
        const batch = users.slice(i, i + batchSize);

        const promises = batch.map(async (userDoc) => {
          const result = await generateReflectionInsightsForUser(userDoc.id);
          if (result.success) {
            results.successful++;
          } else {
            results.failed++;
            results.errors.push({ userId: userDoc.id, error: result.error });
          }
          return result;
        });

        await Promise.all(promises);

        // Rate limiting delay between batches
        if (i + batchSize < users.length) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      console.log(`[ReflectionInsights] Complete: ${results.successful} successful, ${results.failed} failed`);

      if (results.failed > 0) {
        console.error('[ReflectionInsights] Failures:', JSON.stringify(results.errors, null, 2));
      }

      return null;
    } catch (error) {
      console.error('[ReflectionInsights] Fatal error:', error);
      return null;
    }
  });

// =============================================================================
// CLOUD FUNCTION: MANUAL TRIGGER FOR TESTING
// =============================================================================

const generateReflectionInsightsManual = functions
  .runWith({
    timeoutSeconds: 300,
    memory: '512MB',
  })
  .https.onCall(async (data, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'Must be logged in');
    }

    const userId = data.userId || context.auth.uid;

    console.log(`[ReflectionInsights] Manual trigger for user: ${userId}`);

    const result = await generateReflectionInsightsForUser(userId);

    return result;
  });

// =============================================================================
// EXPORTS
// =============================================================================

module.exports = {
  generateWeeklyReflectionInsights,
  generateReflectionInsightsManual,
  // Export for testing
  generateReflectionInsightsForUser,
  analyzeReflectionPatterns,
  getCurrentWeekId,
};
