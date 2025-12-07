/**
 * BEACON AI - Habit Coach Insights Generation
 * Phase 2: Weekly Insights Cloud Function
 *
 * Generates personalized habit coaching insights:
 * - working: Habits that are going well (streak, completion rate)
 * - needs_attention: Habits that are struggling
 * - optimization: Suggestions for improvement
 *
 * Writes to: users/{userId}/weeklyInsights/habits_{weekId}
 * Read by: useHabitCoach() hook in useBeaconContent.ts
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
const TECHNIQUE_LIBRARY = require('../beacon/TECHNIQUE_LIBRARY.json');

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

const HABIT_CARD_TYPES = {
  working: {
    icon: 'CheckCircle',
    iconColor: '#22c55e', // green
    getTitle: (data) => data.habitName ? `${data.habitName} is Working` : 'Strong Habit',
  },
  needs_attention: {
    icon: 'AlertTriangle',
    iconColor: '#f59e0b', // amber
    getTitle: (data) => data.habitName ? `${data.habitName} Needs You` : 'Habit Alert',
  },
  optimization: {
    icon: 'Lightbulb',
    iconColor: '#3b82f6', // blue
    getTitle: (data) => 'Habit Tip',
  },
};

// =============================================================================
// CTA SELECTION
// =============================================================================

function selectCTA(cardType, habitId) {
  const ctaMap = {
    working: 'open-habit-tracker',
    needs_attention: 'edit-habit',
    optimization: 'open-habit-tracker',
  };

  const ctaId = ctaMap[cardType] || 'open-habit-tracker';
  const cta = CTA_LIBRARY.ctas.find(c => c.id === ctaId);

  // Add habitId to modalData if this is about a specific habit
  if (cta && habitId && cta.action === 'modal') {
    return {
      ...cta,
      modalData: { ...cta.modalData, habitId },
    };
  }

  return cta || null;
}

// =============================================================================
// ANALYZE HABIT PATTERNS
// =============================================================================

function analyzeHabitPatterns(aiContext) {
  const analysis = {
    habits: [],
    bestHabit: null,
    focusHabit: null,
    overallCompletionRate: 0,
    totalCompletions7Day: 0,
    hasHabits: false,
    streakAtRisk: [],
  };

  const habitsData = aiContext.habits || {};

  // Extract habit definitions
  const definitions = habitsData.definitions || [];
  const streaks = habitsData.streaks || [];
  const completionRate = habitsData.completionRate7Day || 0;

  analysis.hasHabits = definitions.length > 0;
  analysis.overallCompletionRate = Math.round(completionRate * 100);

  // Build habit analysis for each habit
  definitions.forEach((habit, index) => {
    const streakData = streaks[index] || {};
    const currentStreak = streakData.currentStreak || 0;
    const longestStreak = streakData.longestStreak || 0;
    const completions7Day = streakData.completions7Day || 0;

    const habitAnalysis = {
      id: habit.id,
      name: habit.name,
      category: habit.category || 'general',
      currentStreak,
      longestStreak,
      completions7Day,
      completionRate7Day: Math.round((completions7Day / 7) * 100),
      isStrong: currentStreak >= 5 || completions7Day >= 5,
      isStruggling: currentStreak === 0 && completions7Day <= 2,
      isStreakAtRisk: currentStreak >= 3 && !aiContext.today?.habitsCompleted?.includes(habit.id),
    };

    analysis.habits.push(habitAnalysis);
    analysis.totalCompletions7Day += completions7Day;

    // Track best and focus habits
    if (!analysis.bestHabit || habitAnalysis.currentStreak > (analysis.bestHabit.currentStreak || 0)) {
      analysis.bestHabit = habitAnalysis;
    }

    if (habitAnalysis.isStruggling) {
      if (!analysis.focusHabit || habitAnalysis.completions7Day < (analysis.focusHabit.completions7Day || 0)) {
        analysis.focusHabit = habitAnalysis;
      }
    }

    if (habitAnalysis.isStreakAtRisk) {
      analysis.streakAtRisk.push(habitAnalysis);
    }
  });

  // If no struggling habit, pick the one with lowest completion rate
  if (!analysis.focusHabit && analysis.habits.length > 0) {
    const sorted = [...analysis.habits].sort((a, b) => a.completionRate7Day - b.completionRate7Day);
    if (sorted[0].completionRate7Day < 70) {
      analysis.focusHabit = sorted[0];
    }
  }

  return analysis;
}

// =============================================================================
// GENERATE CARDS WITH AI
// =============================================================================

async function generateHabitCards(userId, aiContext, analysis) {
  const cards = [];
  const weekId = getCurrentWeekId();

  // Build context string for AI
  const contextSummary = `
User: ${aiContext.user?.firstName || 'Friend'}
Sobriety Day: ${aiContext.user?.sobrietyDays || 0}

Habit Overview:
- Total habits: ${analysis.habits.length}
- Overall completion rate (7 days): ${analysis.overallCompletionRate}%
- Total completions this week: ${analysis.totalCompletions7Day}

Individual Habits:
${analysis.habits.map(h => `- ${h.name}: ${h.completions7Day}/7 days (${h.completionRate7Day}%), ${h.currentStreak} day streak${h.isStrong ? ' [STRONG]' : ''}${h.isStruggling ? ' [STRUGGLING]' : ''}${h.isStreakAtRisk ? ' [STREAK AT RISK]' : ''}`).join('\n')}

Best Habit: ${analysis.bestHabit?.name || 'None'} (${analysis.bestHabit?.currentStreak || 0} day streak)
Focus Habit: ${analysis.focusHabit?.name || 'None'}${analysis.focusHabit ? ` (${analysis.focusHabit.completions7Day}/7 days)` : ''}
Streaks at Risk: ${analysis.streakAtRisk.map(h => h.name).join(', ') || 'None'}

Current Week: ${weekId}
`;

  const systemPrompt = `${BEACON_INSIGHT_PROMPT}

You are generating habit coaching insight cards.

${BEACON_VOICE}

${SPECIFICITY_RULES}

For each card, provide a JSON object with:
- message: 1-2 sentences, specific to their data, warm but encouraging
- Celebrate wins genuinely without being over-the-top
- For struggling habits, be compassionate and solution-focused
- Always reference specific numbers (streaks, days, percentages)`;

  try {
    const client = getOpenAIClient();

    // Determine which card types to generate
    const cardTypesToGenerate = [];

    // Working card if they have a strong habit
    if (analysis.bestHabit && analysis.bestHabit.isStrong) {
      cardTypesToGenerate.push({
        type: 'working',
        habitId: analysis.bestHabit.id,
        habitName: analysis.bestHabit.name,
        habitData: analysis.bestHabit,
      });
    }

    // Needs attention if there's a struggling habit or streak at risk
    if (analysis.focusHabit || analysis.streakAtRisk.length > 0) {
      const targetHabit = analysis.streakAtRisk[0] || analysis.focusHabit;
      if (targetHabit) {
        cardTypesToGenerate.push({
          type: 'needs_attention',
          habitId: targetHabit.id,
          habitName: targetHabit.name,
          habitData: targetHabit,
        });
      }
    }

    // Optimization if they have habits but could do better
    if (analysis.habits.length > 0 && analysis.overallCompletionRate < 85) {
      cardTypesToGenerate.push({
        type: 'optimization',
        habitId: null,
        habitName: null,
        habitData: null,
      });
    }

    // No habits? Suggest creating one
    if (!analysis.hasHabits) {
      cardTypesToGenerate.push({
        type: 'optimization',
        habitId: null,
        habitName: null,
        habitData: null,
        isNewUser: true,
      });
    }

    // Ensure at least one card
    if (cardTypesToGenerate.length === 0 && analysis.habits.length > 0) {
      cardTypesToGenerate.push({
        type: 'working',
        habitId: analysis.habits[0].id,
        habitName: analysis.habits[0].name,
        habitData: analysis.habits[0],
      });
    }

    // Generate each card
    for (const cardInfo of cardTypesToGenerate) {
      const cardConfig = HABIT_CARD_TYPES[cardInfo.type];

      const prompt = `Generate a ${cardInfo.type} habit coaching card for this user.

${contextSummary}

Card type: ${cardInfo.type}
${cardInfo.habitName ? `Target habit: ${cardInfo.habitName}` : ''}
${cardInfo.habitData ? `Habit stats: ${cardInfo.habitData.completions7Day}/7 days, ${cardInfo.habitData.currentStreak} day streak` : ''}
${cardInfo.isNewUser ? 'This user has no habits set up yet. Encourage them to create their first one.' : ''}
${cardInfo.type === 'working' ? 'Celebrate this win! Reference the specific streak/completion numbers.' : ''}
${cardInfo.type === 'needs_attention' ? `This habit needs support. ${cardInfo.habitData?.isStreakAtRisk ? 'Their streak is at risk!' : 'They need encouragement to get back on track.'}` : ''}
${cardInfo.type === 'optimization' ? 'Give a specific, actionable tip for improving their habit consistency.' : ''}

Respond with ONLY a JSON object (no markdown):
{
  "message": "your coaching message here"
}`;

      try {
        const completion = await client.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: prompt },
          ],
          max_tokens: 150,
          temperature: 0.7,
        });

        const responseText = completion.choices[0]?.message?.content || '';

        // Parse JSON response
        let parsed;
        try {
          const cleaned = responseText.replace(/```json\n?|\n?```/g, '').trim();
          parsed = JSON.parse(cleaned);
        } catch (parseError) {
          console.error(`Failed to parse AI response for ${cardInfo.type}:`, responseText);
          parsed = { message: responseText.substring(0, 200) };
        }

        // Build the card
        const card = {
          id: `${cardInfo.type}_${cardInfo.habitId || 'general'}_${Date.now()}`,
          type: cardInfo.type,
          icon: cardConfig.icon,
          iconColor: cardConfig.iconColor,
          habitId: cardInfo.habitId || null,
          habitName: cardInfo.habitName || null,
          title: cardConfig.getTitle({ habitName: cardInfo.habitName }),
          message: parsed.message || '',
          cta: selectCTA(cardInfo.type, cardInfo.habitId),
        };

        cards.push(card);

      } catch (cardError) {
        console.error(`Error generating ${cardInfo.type} card:`, cardError);
      }
    }

  } catch (error) {
    console.error('Error in generateHabitCards:', error);
  }

  return cards;
}

// =============================================================================
// MAIN: GENERATE HABIT INSIGHTS FOR ONE USER
// =============================================================================

async function generateHabitInsightsForUser(userId) {
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

    console.log(`[HabitInsights] User ${userId}: context source=${source}, isStale=${isStale}`);

    // Analyze habit patterns
    const analysis = analyzeHabitPatterns(aiContext);

    // Generate cards
    const cards = await generateHabitCards(userId, aiContext, analysis);

    // Build the document
    const insightDoc = {
      userId,
      weekId,
      cards,
      bestHabit: analysis.bestHabit?.name || null,
      focusHabit: analysis.focusHabit?.name || null,
      generatedAt: admin.firestore.FieldValue.serverTimestamp(),
      _aiContextSource: source,
      _aiContextStale: isStale,
    };

    // Write to Firestore
    await getDb()
      .collection('users')
      .doc(userId)
      .collection('weeklyInsights')
      .doc(`habits_${weekId}`)
      .set(insightDoc);

    result.cardCount = cards.length;
    console.log(`[HabitInsights] User ${userId}: Generated ${cards.length} cards`);

  } catch (error) {
    result.success = false;
    result.error = error.message;
    console.error(`[HabitInsights] User ${userId} error:`, error);
  }

  return result;
}

// =============================================================================
// CLOUD FUNCTION: SCHEDULED WEEKLY GENERATION (Monday 6 AM Pacific)
// =============================================================================

const generateWeeklyHabitInsights = functions
  .runWith({
    timeoutSeconds: 540,
    memory: '512MB',
  })
  .pubsub.schedule('0 6 * * 1') // Monday 6 AM
  .timeZone('America/Los_Angeles')
  .onRun(async (context) => {
    console.log('[HabitInsights] Starting weekly habit insights generation...');

    try {
      // Get all active PIR users
      const usersSnapshot = await getDb()
        .collection('users')
        .where('role', '==', 'pir')
        .where('status', '==', 'active')
        .get();

      console.log(`[HabitInsights] Found ${usersSnapshot.size} active PIR users`);

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
          const result = await generateHabitInsightsForUser(userDoc.id);
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

      console.log(`[HabitInsights] Complete: ${results.successful} successful, ${results.failed} failed`);

      if (results.failed > 0) {
        console.error('[HabitInsights] Failures:', JSON.stringify(results.errors, null, 2));
      }

      return null;
    } catch (error) {
      console.error('[HabitInsights] Fatal error:', error);
      return null;
    }
  });

// =============================================================================
// CLOUD FUNCTION: MANUAL TRIGGER FOR TESTING
// =============================================================================

const generateHabitInsightsManual = functions
  .runWith({
    timeoutSeconds: 300,
    memory: '512MB',
  })
  .https.onCall(async (data, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'Must be logged in');
    }

    const userId = data.userId || context.auth.uid;

    console.log(`[HabitInsights] Manual trigger for user: ${userId}`);

    const result = await generateHabitInsightsForUser(userId);

    return result;
  });

// =============================================================================
// EXPORTS
// =============================================================================

module.exports = {
  generateWeeklyHabitInsights,
  generateHabitInsightsManual,
  // Export for testing
  generateHabitInsightsForUser,
  analyzeHabitPatterns,
  getCurrentWeekId,
};
