/**
 * BEACON AI - Goal Coach Insights Generation
 * Phase 2: Weekly Insights Cloud Function
 *
 * Generates personalized goal coaching insights:
 * - momentum: Goals making good progress
 * - stalled: Goals that need attention
 * - milestone: Celebrating completed goals or approaching milestones
 * - balance: Overall goal portfolio health
 *
 * Writes to: users/{userId}/weeklyInsights/goals_{weekId}
 * Read by: useGoalCoach() hook in useBeaconContent.ts
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

const GOAL_CARD_TYPES = {
  momentum: {
    icon: 'TrendingUp',
    iconColor: '#22c55e', // green
    getTitle: (data) => data.goalName ? `${data.goalName} is Moving` : 'Goal Momentum',
  },
  stalled: {
    icon: 'Pause',
    iconColor: '#f59e0b', // amber
    getTitle: (data) => data.goalName ? `${data.goalName} Needs You` : 'Goal Check-in',
  },
  milestone: {
    icon: 'Trophy',
    iconColor: '#eab308', // yellow/gold
    getTitle: (data) => data.goalName ? `${data.goalName} Milestone!` : 'Goal Celebration',
  },
  balance: {
    icon: 'Scale',
    iconColor: '#3b82f6', // blue
    getTitle: (data) => 'Goal Portfolio',
  },
};

// =============================================================================
// CTA SELECTION
// =============================================================================

function selectCTA(cardType, goalId) {
  const ctaMap = {
    momentum: 'view-goals',
    stalled: 'view-goal-detail',
    milestone: 'celebrate-milestone',
    balance: 'view-goals',
  };

  const ctaId = ctaMap[cardType] || 'view-goals';
  const cta = CTA_LIBRARY.ctas.find(c => c.id === ctaId);

  // Add goalId to modalData if this is about a specific goal
  if (cta && goalId && cta.action === 'modal') {
    return {
      ...cta,
      modalData: { ...cta.modalData, goalId },
    };
  }

  return cta || null;
}

// =============================================================================
// ANALYZE GOAL PATTERNS
// =============================================================================

function analyzeGoalPatterns(aiContext) {
  const analysis = {
    activeGoals: [],
    completedGoals: [],
    activeGoalCount: 0,
    completedGoalCount: 0,
    avgProgress: 0,
    hasGoals: false,
    momentumGoals: [],
    stalledGoals: [],
    milestoneGoals: [],
    overdue: [],
  };

  const goalsData = aiContext.goals || {};
  const now = new Date();

  // Extract active goals
  const activeGoals = goalsData.active || [];
  analysis.activeGoalCount = activeGoals.length;
  analysis.hasGoals = activeGoals.length > 0;

  // Extract completed goals (from last 30 days if available)
  const completedGoals = goalsData.completed || [];
  analysis.completedGoalCount = completedGoals.length;

  // Process each active goal
  let totalProgress = 0;

  activeGoals.forEach(goal => {
    const progress = goal.progress || 0;
    const targetDate = goal.targetDate?.toDate?.() || null;
    const lastUpdated = goal.lastUpdated?.toDate?.() || null;
    const createdAt = goal.createdAt?.toDate?.() || null;

    const goalAnalysis = {
      id: goal.id,
      name: goal.title || 'Untitled Goal',
      category: goal.category || 'general',
      progress,
      targetDate,
      lastUpdated,
      createdAt,
      isOverdue: targetDate && targetDate < now,
      daysSinceUpdate: lastUpdated ? Math.floor((now - lastUpdated) / (24 * 60 * 60 * 1000)) : null,
      daysUntilDue: targetDate ? Math.floor((targetDate - now) / (24 * 60 * 60 * 1000)) : null,
      hasMomentum: false,
      isStalled: false,
      nearMilestone: false,
    };

    // Determine goal status
    // Has momentum: updated recently and progress >= 30%
    if (goalAnalysis.daysSinceUpdate !== null && goalAnalysis.daysSinceUpdate <= 7 && progress >= 30) {
      goalAnalysis.hasMomentum = true;
      analysis.momentumGoals.push(goalAnalysis);
    }

    // Stalled: not updated in 14+ days, or progress stuck below 20%
    if ((goalAnalysis.daysSinceUpdate !== null && goalAnalysis.daysSinceUpdate >= 14) ||
        (goalAnalysis.daysSinceUpdate !== null && goalAnalysis.daysSinceUpdate >= 7 && progress < 20)) {
      goalAnalysis.isStalled = true;
      analysis.stalledGoals.push(goalAnalysis);
    }

    // Near milestone: 75%, 90%, or approaching due date with good progress
    if (progress >= 75 && progress < 100) {
      goalAnalysis.nearMilestone = true;
      analysis.milestoneGoals.push(goalAnalysis);
    } else if (goalAnalysis.daysUntilDue !== null && goalAnalysis.daysUntilDue <= 7 && goalAnalysis.daysUntilDue > 0 && progress >= 50) {
      goalAnalysis.nearMilestone = true;
      analysis.milestoneGoals.push(goalAnalysis);
    }

    // Track overdue goals
    if (goalAnalysis.isOverdue) {
      analysis.overdue.push(goalAnalysis);
    }

    analysis.activeGoals.push(goalAnalysis);
    totalProgress += progress;
  });

  // Calculate average progress
  if (analysis.activeGoalCount > 0) {
    analysis.avgProgress = Math.round(totalProgress / analysis.activeGoalCount);
  }

  // Process completed goals for recent celebrations
  completedGoals.forEach(goal => {
    const completedAt = goal.completedAt?.toDate?.() || null;
    const daysSinceCompletion = completedAt ? Math.floor((now - completedAt) / (24 * 60 * 60 * 1000)) : null;

    // Recent completions (within 7 days) for milestone cards
    if (daysSinceCompletion !== null && daysSinceCompletion <= 7) {
      analysis.milestoneGoals.push({
        id: goal.id,
        name: goal.title || 'Completed Goal',
        progress: 100,
        completedAt,
        isCompleted: true,
      });
    }

    analysis.completedGoals.push(goal);
  });

  return analysis;
}

// =============================================================================
// GENERATE CARDS WITH AI
// =============================================================================

async function generateGoalCards(userId, aiContext, analysis) {
  const cards = [];
  const weekId = getCurrentWeekId();

  // Build context string for AI
  const contextSummary = `
User: ${aiContext.user?.firstName || 'Friend'}
Sobriety Day: ${aiContext.user?.sobrietyDays || 0}

Goal Overview:
- Active goals: ${analysis.activeGoalCount}
- Completed goals: ${analysis.completedGoalCount}
- Average progress: ${analysis.avgProgress}%

Active Goals:
${analysis.activeGoals.map(g => `- ${g.name}: ${g.progress}%${g.hasMomentum ? ' [MOMENTUM]' : ''}${g.isStalled ? ' [STALLED]' : ''}${g.nearMilestone ? ' [NEAR MILESTONE]' : ''}${g.isOverdue ? ' [OVERDUE]' : ''}${g.daysUntilDue !== null ? ` (${g.daysUntilDue > 0 ? g.daysUntilDue + ' days left' : 'due today'})` : ''}`).join('\n') || 'No active goals'}

Goals with Momentum: ${analysis.momentumGoals.map(g => g.name).join(', ') || 'None'}
Stalled Goals: ${analysis.stalledGoals.map(g => g.name).join(', ') || 'None'}
Milestone-Ready: ${analysis.milestoneGoals.map(g => g.name).join(', ') || 'None'}
Overdue: ${analysis.overdue.map(g => g.name).join(', ') || 'None'}

Current Week: ${weekId}
`;

  const systemPrompt = `${BEACON_INSIGHT_PROMPT}

You are generating goal coaching insight cards.

${BEACON_VOICE}

${SPECIFICITY_RULES}

For each card, provide a JSON object with:
- message: 1-2 sentences, specific to their data, warm and encouraging
- Celebrate progress genuinely without being over-the-top
- For stalled goals, be compassionate and solution-focused
- Always reference specific numbers (progress %, days, goal names)`;

  try {
    const client = getOpenAIClient();

    // Determine which card types to generate
    const cardTypesToGenerate = [];

    // Milestone card for completions or near-complete goals
    if (analysis.milestoneGoals.length > 0) {
      const milestoneGoal = analysis.milestoneGoals[0];
      cardTypesToGenerate.push({
        type: 'milestone',
        goalId: milestoneGoal.id,
        goalName: milestoneGoal.name,
        goalData: milestoneGoal,
      });
    }

    // Momentum card for goals making progress
    if (analysis.momentumGoals.length > 0) {
      const momentumGoal = analysis.momentumGoals[0];
      cardTypesToGenerate.push({
        type: 'momentum',
        goalId: momentumGoal.id,
        goalName: momentumGoal.name,
        goalData: momentumGoal,
      });
    }

    // Stalled card for goals needing attention
    if (analysis.stalledGoals.length > 0 || analysis.overdue.length > 0) {
      const stalledGoal = analysis.stalledGoals[0] || analysis.overdue[0];
      if (stalledGoal) {
        cardTypesToGenerate.push({
          type: 'stalled',
          goalId: stalledGoal.id,
          goalName: stalledGoal.name,
          goalData: stalledGoal,
        });
      }
    }

    // Balance card if they have multiple goals
    if (analysis.activeGoalCount >= 2) {
      cardTypesToGenerate.push({
        type: 'balance',
        goalId: null,
        goalName: null,
        goalData: null,
      });
    }

    // No goals? Suggest creating one
    if (!analysis.hasGoals) {
      cardTypesToGenerate.push({
        type: 'balance',
        goalId: null,
        goalName: null,
        goalData: null,
        isNewUser: true,
      });
    }

    // Ensure at least one card
    if (cardTypesToGenerate.length === 0 && analysis.activeGoals.length > 0) {
      cardTypesToGenerate.push({
        type: 'momentum',
        goalId: analysis.activeGoals[0].id,
        goalName: analysis.activeGoals[0].name,
        goalData: analysis.activeGoals[0],
      });
    }

    // Generate each card
    for (const cardInfo of cardTypesToGenerate) {
      const cardConfig = GOAL_CARD_TYPES[cardInfo.type];

      const prompt = `Generate a ${cardInfo.type} goal coaching card for this user.

${contextSummary}

Card type: ${cardInfo.type}
${cardInfo.goalName ? `Target goal: ${cardInfo.goalName}` : ''}
${cardInfo.goalData ? `Goal stats: ${cardInfo.goalData.progress}% complete${cardInfo.goalData.daysUntilDue !== null ? `, ${cardInfo.goalData.daysUntilDue} days until due` : ''}${cardInfo.goalData.daysSinceUpdate !== null ? `, last updated ${cardInfo.goalData.daysSinceUpdate} days ago` : ''}` : ''}
${cardInfo.isNewUser ? 'This user has no goals set up yet. Encourage them to set their first recovery goal.' : ''}
${cardInfo.type === 'momentum' ? 'Celebrate this progress! Reference specific numbers and encourage continued effort.' : ''}
${cardInfo.type === 'stalled' ? `This goal needs attention. ${cardInfo.goalData?.isOverdue ? 'It is overdue!' : 'It has not been updated recently.'}` : ''}
${cardInfo.type === 'milestone' ? `${cardInfo.goalData?.isCompleted ? 'They completed this goal!' : 'They are very close to completing this goal.'} Celebrate genuinely.` : ''}
${cardInfo.type === 'balance' ? `Give insight about their overall goal portfolio (${analysis.activeGoalCount} active, ${analysis.avgProgress}% avg progress).` : ''}

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
          id: `${cardInfo.type}_${cardInfo.goalId || 'general'}_${Date.now()}`,
          type: cardInfo.type,
          icon: cardConfig.icon,
          iconColor: cardConfig.iconColor,
          goalId: cardInfo.goalId || null,
          goalName: cardInfo.goalName || null,
          title: cardConfig.getTitle({ goalName: cardInfo.goalName }),
          message: parsed.message || '',
          cta: selectCTA(cardInfo.type, cardInfo.goalId),
        };

        cards.push(card);

      } catch (cardError) {
        console.error(`Error generating ${cardInfo.type} card:`, cardError);
      }
    }

  } catch (error) {
    console.error('Error in generateGoalCards:', error);
  }

  return cards;
}

// =============================================================================
// MAIN: GENERATE GOAL INSIGHTS FOR ONE USER
// =============================================================================

async function generateGoalInsightsForUser(userId) {
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

    console.log(`[GoalInsights] User ${userId}: context source=${source}, isStale=${isStale}`);

    // Analyze goal patterns
    const analysis = analyzeGoalPatterns(aiContext);

    // Generate cards
    const cards = await generateGoalCards(userId, aiContext, analysis);

    // Build the document
    const insightDoc = {
      userId,
      weekId,
      cards,
      activeGoalCount: analysis.activeGoalCount,
      completedGoalCount: analysis.completedGoalCount,
      avgProgress: analysis.avgProgress,
      generatedAt: admin.firestore.FieldValue.serverTimestamp(),
      _aiContextSource: source,
      _aiContextStale: isStale,
    };

    // Write to Firestore
    await getDb()
      .collection('users')
      .doc(userId)
      .collection('weeklyInsights')
      .doc(`goals_${weekId}`)
      .set(insightDoc);

    result.cardCount = cards.length;
    console.log(`[GoalInsights] User ${userId}: Generated ${cards.length} cards`);

  } catch (error) {
    result.success = false;
    result.error = error.message;
    console.error(`[GoalInsights] User ${userId} error:`, error);
  }

  return result;
}

// =============================================================================
// CLOUD FUNCTION: SCHEDULED WEEKLY GENERATION (Monday 6 AM Pacific)
// =============================================================================

const generateWeeklyGoalInsights = functions
  .runWith({
    timeoutSeconds: 540,
    memory: '512MB',
  })
  .pubsub.schedule('0 6 * * 1') // Monday 6 AM
  .timeZone('America/Los_Angeles')
  .onRun(async (context) => {
    console.log('[GoalInsights] Starting weekly goal insights generation...');

    try {
      // Get all active PIR users
      const usersSnapshot = await getDb()
        .collection('users')
        .where('role', '==', 'pir')
        .where('status', '==', 'active')
        .get();

      console.log(`[GoalInsights] Found ${usersSnapshot.size} active PIR users`);

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
          const result = await generateGoalInsightsForUser(userDoc.id);
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

      console.log(`[GoalInsights] Complete: ${results.successful} successful, ${results.failed} failed`);

      if (results.failed > 0) {
        console.error('[GoalInsights] Failures:', JSON.stringify(results.errors, null, 2));
      }

      return null;
    } catch (error) {
      console.error('[GoalInsights] Fatal error:', error);
      return null;
    }
  });

// =============================================================================
// CLOUD FUNCTION: MANUAL TRIGGER FOR TESTING
// =============================================================================

const generateGoalInsightsManual = functions
  .runWith({
    timeoutSeconds: 300,
    memory: '512MB',
  })
  .https.onCall(async (data, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'Must be logged in');
    }

    const userId = data.userId || context.auth.uid;

    console.log(`[GoalInsights] Manual trigger for user: ${userId}`);

    const result = await generateGoalInsightsForUser(userId);

    return result;
  });

// =============================================================================
// EXPORTS
// =============================================================================

module.exports = {
  generateWeeklyGoalInsights,
  generateGoalInsightsManual,
  // Export for testing
  generateGoalInsightsForUser,
  analyzeGoalPatterns,
  getCurrentWeekId,
};
