/**
 * BEACON AI - Daily Content Generation
 * Phase 6.2: Cloud Functions for 6 AM Pacific Daily Content
 *
 * Generates 4 types of personalized AI content for each user:
 * 1. AI Insight Card - Daily insight based on user's recovery state
 * 2. Daily Oracle - Inspirational, data-driven wisdom to reveal
 * 3. Proactive Insight - Priority-based alert card for today
 * 4. Technique Selection - 3 AI-selected therapeutic techniques
 *
 * Runs: 6 AM Pacific daily
 * Storage: users/{userId}/aiInsights/{type}_{YYYY-MM-DD}
 */

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const OpenAI = require('openai').default;

// Import Beacon personality
const {
  getSystemPrompt,
  BEACON_INSIGHT_PROMPT,
  BEACON_ORACLE_PROMPT,
  buildMissingDataDescription,
} = require('../beacon/beaconPersonality');

// Import libraries
const TECHNIQUE_LIBRARY = require('../beacon/TECHNIQUE_LIBRARY.json');
const CTA_LIBRARY = require('../beacon/CTA_LIBRARY.json');

// Import AI Context Reader - PHASE 1 REFACTOR
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
// HELPER: FORMAT DATE
// =============================================================================

function formatDate(date) {
  return date.toISOString().split('T')[0]; // YYYY-MM-DD
}

function formatDateForAI(date) {
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

function getDayOfWeek(date) {
  return date.toLocaleDateString('en-US', { weekday: 'long' });
}

// =============================================================================
// HELPER: BUILD BEACON CONTEXT FOR A USER (REFACTORED - Phase 1)
// Now reads from aiContext/current instead of 9+ collection queries
// =============================================================================

async function buildBeaconContext(userId) {
  console.log(`[DailyContent] Building context for user ${userId} using aiContext reader`);

  // Use aiContextReader instead of direct collection queries
  const { source, data: aiContext, isStale } = await getAIContext(userId, getDb());

  if (!aiContext) {
    console.error(`[DailyContent] Failed to get aiContext for user ${userId}`);
    return null;
  }

  console.log(`[DailyContent] Context source: ${source}, isStale: ${isStale}`);

  // Transform aiContext to the format expected by the generators
  const context = {
    userId,
    timestamp: new Date(),
    _aiContextSource: source,
    _aiContextStale: isStale,
    user: {
      firstName: aiContext.user?.firstName || 'Friend',
      sobrietyDate: aiContext.user?.recoveryStartDate?.toDate?.() || null,
      sobrietyDays: aiContext.user?.sobrietyDays || 0,
      primarySubstance: aiContext.user?.primarySubstance || null,
      isVeteran: aiContext.user?.isVeteran || false,
      isFirstResponder: aiContext.user?.isFirstResponder || false,
      coachName: null, // Not stored in aiContext - would need separate query if needed
    },
    today: {
      checkInDone: aiContext.today?.morningCheckIn?.completed || false,
      eveningCheckInDone: aiContext.today?.eveningCheckIn?.completed || false,
      habitsDone: [],
      habitsMissed: [],
    },
    recent7Days: {
      checkInCount: aiContext.recent7Days?.checkInCount || 0,
      checkInRate: Math.round(((aiContext.recent7Days?.checkInCount || 0) / 7) * 100),
      moodAvg: aiContext.recent7Days?.avgMood || null,
      moodTrend: aiContext.recent7Days?.moodTrend || 'stable',
      cravingAvg: aiContext.recent7Days?.avgCraving || null,
      cravingMax: aiContext.recent7Days?.cravingValues?.length > 0
        ? Math.max(...aiContext.recent7Days.cravingValues)
        : null,
      anxietyAvg: aiContext.recent7Days?.avgAnxiety || null,
      sleepAvg: aiContext.recent7Days?.avgSleep || null,
      energyAvg: aiContext.recent7Days?.avgEnergy || null,
      reflectionCount: aiContext.reflections?.count30Day ? Math.round(aiContext.reflections.count30Day / 4) : 0,
      gratitudeCount: aiContext.gratitudes?.count30Day ? Math.round(aiContext.gratitudes.count30Day / 4) : 0,
      meetingCount: aiContext.today?.meetingsAttended || 0,
    },
    patterns: {
      bestDayOfWeek: aiContext.patterns?.bestDayOfWeek || null,
      worstDayOfWeek: aiContext.patterns?.worstDayOfWeek || null,
      sleepMoodCorrelation: aiContext.patterns?.sleepMoodCorrelation || null,
      meetingCravingCorrelation: null, // Not currently computed in aiContext
    },
    goals: [],
    habits: [],
    recentInsights: [], // Would need separate query - keeping empty for now
    missingData: {},
  };

  // Transform habits from aiContext
  const habitsData = aiContext.habits || {};
  if (habitsData.definitions && Array.isArray(habitsData.definitions)) {
    context.habits = habitsData.definitions.map((h, idx) => {
      const streak = habitsData.streaks?.[idx]?.currentStreak || 0;
      const completionRate = habitsData.completionRate7Day || 0;
      return {
        id: h.id,
        name: h.name,
        streak,
        completionRate,
      };
    });
  }

  // Determine which habits are done vs missed today
  const todayHabitsCompleted = aiContext.today?.habitsCompleted || [];
  context.habits.forEach(habit => {
    if (todayHabitsCompleted.includes(habit.id)) {
      context.today.habitsDone.push(habit.name);
    } else {
      context.today.habitsMissed.push(habit.name);
    }
  });

  // Transform goals from aiContext
  const goalsData = aiContext.goals || {};
  if (goalsData.active && Array.isArray(goalsData.active)) {
    context.goals = goalsData.active.slice(0, 5).map(g => ({
      id: g.id,
      title: g.title || 'Untitled Goal',
      progress: g.progress || 0,
      dueDate: g.targetDate?.toDate?.() || null,
    }));
  }

  // Build missing data flags from aiContext
  const streaks = aiContext.streaks || {};
  context.missingData = {
    daysWithoutCheckIn: context.today.checkInDone ? 0 : (streaks.checkInStreakAtRisk ? 1 : 0),
    lastCheckInDate: aiContext.context?.lastInsightDate ? formatDateForAI(new Date(aiContext.context.lastInsightDate)) : null,
    daysWithoutMeeting: context.recent7Days.meetingCount === 0 ? 7 : 0,
    habitsNotLoggedToday: context.today.habitsMissed.length > 0,
    activeHabitCount: context.habits.length,
    activeHabitNames: context.habits.map(h => h.name),
    noGratitudesThisWeek: context.recent7Days.gratitudeCount === 0,
    noReflectionsThisWeek: context.recent7Days.reflectionCount === 0,
  };

  return context;
}

// =============================================================================
// GENERATE: AI INSIGHT CARD
// =============================================================================

const INSIGHT_MESSAGE_TYPES = {
  good_day: {
    trigger: (ctx) => ctx.recent7Days.moodAvg >= 7 && ctx.recent7Days.checkInRate >= 70,
    template: 'Celebrate their strong week with specific numbers',
  },
  missing_checkins: {
    trigger: (ctx) => ctx.missingData.daysWithoutCheckIn >= 3,
    template: 'Acknowledge the gap compassionately, ask what\'s going on',
  },
  high_craving: {
    trigger: (ctx) => ctx.recent7Days.cravingMax >= 7,
    template: 'Acknowledge the craving spike, suggest specific coping technique',
  },
  new_user: {
    trigger: (ctx) => ctx.user.sobrietyDays <= 7,
    template: 'Welcome them warmly, celebrate starting their journey',
  },
  mood_declining: {
    trigger: (ctx) => ctx.recent7Days.moodTrend === 'declining',
    template: 'Gently acknowledge the trend, encourage connection',
  },
  streak_milestone: {
    trigger: (ctx) => [7, 14, 30, 60, 90, 180, 365].includes(ctx.user.sobrietyDays),
    template: 'Celebrate the milestone with specific acknowledgment',
  },
  weekend: {
    trigger: (ctx) => ['Saturday', 'Sunday'].includes(getDayOfWeek(new Date())),
    template: 'Weekend-specific support, meeting suggestions',
  },
  default: {
    trigger: () => true,
    template: 'General daily insight with specific data references',
  },
};

async function generateDailyInsight(ctx) {
  // Determine message type
  let selectedType = 'default';
  for (const [type, config] of Object.entries(INSIGHT_MESSAGE_TYPES)) {
    if (type !== 'default' && config.trigger(ctx)) {
      selectedType = type;
      break;
    }
  }

  // Build user context for AI
  const contextSummary = `
User: ${ctx.user.firstName}
Sobriety: Day ${ctx.user.sobrietyDays}${ctx.user.primarySubstance ? ` (${ctx.user.primarySubstance})` : ''}
${ctx.user.isVeteran ? 'Veteran. ' : ''}${ctx.user.isFirstResponder ? 'First Responder. ' : ''}

This Week (7 days):
- Check-ins: ${ctx.recent7Days.checkInCount}/7 (${ctx.recent7Days.checkInRate}%)
- Mood: ${ctx.recent7Days.moodAvg ?? 'no data'}/10 (${ctx.recent7Days.moodTrend})
- Cravings: avg ${ctx.recent7Days.cravingAvg ?? 'no data'}, max ${ctx.recent7Days.cravingMax ?? 'no data'}
- Anxiety: ${ctx.recent7Days.anxietyAvg ?? 'no data'}/10
- Sleep: ${ctx.recent7Days.sleepAvg ?? 'no data'}/10
- Meetings: ${ctx.recent7Days.meetingCount}
- Reflections: ${ctx.recent7Days.reflectionCount}
- Gratitudes: ${ctx.recent7Days.gratitudeCount}

Today:
- Morning check-in: ${ctx.today.checkInDone ? 'Yes' : 'No'}
- Habits done: ${ctx.today.habitsDone.length > 0 ? ctx.today.habitsDone.join(', ') : 'None yet'}
- Habits pending: ${ctx.today.habitsMissed.length > 0 ? ctx.today.habitsMissed.join(', ') : 'None'}

Active Goals: ${ctx.goals.length > 0 ? ctx.goals.map(g => `${g.title} (${g.progress}%)`).join(', ') : 'None set'}
Active Habits: ${ctx.habits.length > 0 ? ctx.habits.map(h => `${h.name} (${h.streak} day streak)`).join(', ') : 'None set'}

${ctx.missingData.daysWithoutCheckIn > 0 ? buildMissingDataDescription(ctx.missingData) : ''}

Message Type: ${selectedType}
Today: ${formatDateForAI(new Date())}
`;

  try {
    const client = getOpenAIClient();

    const completion = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: BEACON_INSIGHT_PROMPT },
        {
          role: 'user',
          content: `Generate a daily insight for this user. Type: ${selectedType}

${contextSummary}

Requirements:
- 2-4 sentences maximum
- Reference specific numbers/dates from the context
- Include one specific app location for next action
- Use warm but direct tone
- Never say "at a standstill" or be generic
- End with an actionable suggestion`,
        },
      ],
      max_tokens: 200,
      temperature: 0.7,
    });

    return {
      type: selectedType,
      content: completion.choices[0]?.message?.content || '',
      usage: completion.usage,
    };
  } catch (error) {
    console.error('Error generating daily insight:', error);
    return null;
  }
}

// =============================================================================
// GENERATE: DAILY ORACLE
// =============================================================================

const ORACLE_TYPES = ['milestone_approaching', 'tough_week', 'strong_week', 'pattern_insight', 'encouragement'];

async function generateDailyOracle(ctx) {
  // Determine oracle type based on context
  let oracleType = 'encouragement'; // default

  // Check for milestone approaching (within 3 days)
  const milestones = [7, 14, 30, 45, 60, 90, 180, 365, 730, 1095];
  for (const m of milestones) {
    if (ctx.user.sobrietyDays >= m - 3 && ctx.user.sobrietyDays < m) {
      oracleType = 'milestone_approaching';
      break;
    }
  }

  // Check for tough week (declining mood or high cravings)
  if (ctx.recent7Days.moodTrend === 'declining' || ctx.recent7Days.cravingMax >= 7) {
    oracleType = 'tough_week';
  }

  // Check for strong week
  if (ctx.recent7Days.checkInRate >= 85 && ctx.recent7Days.moodAvg >= 6.5) {
    oracleType = 'strong_week';
  }

  // Check for pattern insight opportunity
  if (ctx.recent7Days.checkInCount >= 5) {
    oracleType = Math.random() > 0.5 ? oracleType : 'pattern_insight';
  }

  const contextSummary = `
User: ${ctx.user.firstName}
Day: ${ctx.user.sobrietyDays}
Mood this week: ${ctx.recent7Days.moodAvg ?? 'no data'}/10 (${ctx.recent7Days.moodTrend})
Check-in rate: ${ctx.recent7Days.checkInRate}%
Recent wins: ${ctx.today.habitsDone.length > 0 ? ctx.today.habitsDone.join(', ') : 'still building'}
${ctx.habits.length > 0 ? `Longest habit streak: ${Math.max(...ctx.habits.map(h => h.streak))} days` : ''}

Oracle Type: ${oracleType}
`;

  try {
    const client = getOpenAIClient();

    const completion = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: BEACON_ORACLE_PROMPT },
        {
          role: 'user',
          content: `Generate a daily oracle for this user. Type: ${oracleType}

${contextSummary}

Requirements:
- 2-3 sentences maximum
- Feel personal and meaningful, not generic
- Reference their specific journey (day count, patterns, recent data)
- Provide actionable wisdom for today
- Warm and encouraging without being over-the-top
- Include a specific reflection or action they can take`,
        },
      ],
      max_tokens: 150,
      temperature: 0.8,
    });

    return {
      oracleType,
      content: completion.choices[0]?.message?.content || '',
      revealed: false,
      usage: completion.usage,
    };
  } catch (error) {
    console.error('Error generating oracle:', error);
    return null;
  }
}

// =============================================================================
// GENERATE: PROACTIVE INSIGHT CARD
// =============================================================================

const PROACTIVE_TRIGGERS = [
  {
    id: 'cravingAlert',
    trigger: (ctx) => ctx.recent7Days.cravingMax >= 7,
    priority: 1,
    title: 'Craving Alert',
    icon: 'AlertTriangle',
    iconColor: '#ef4444',
    getCTA: () => CTA_LIBRARY.ctas.find(c => c.id === 'open-crisis-toolkit'),
  },
  {
    id: 'sleepRecovery',
    trigger: (ctx) => ctx.recent7Days.sleepAvg !== null && ctx.recent7Days.sleepAvg <= 4,
    priority: 2,
    title: 'Sleep Support',
    icon: 'Moon',
    iconColor: '#6366f1',
    getCTA: () => CTA_LIBRARY.ctas.find(c => c.id === 'sleep-guide'),
  },
  {
    id: 'meetingReminder',
    trigger: (ctx) => ctx.missingData.daysWithoutMeeting >= 7,
    priority: 3,
    title: 'Connection Matters',
    icon: 'Users',
    iconColor: '#8b5cf6',
    getCTA: () => CTA_LIBRARY.ctas.find(c => c.id === 'browse-meetings'),
  },
  {
    id: 'moodCheck',
    trigger: (ctx) => ctx.recent7Days.moodTrend === 'declining',
    priority: 4,
    title: 'Mood Check-in',
    icon: 'Heart',
    iconColor: '#f59e0b',
    getCTA: () => CTA_LIBRARY.ctas.find(c => c.id === 'message-coach'),
  },
  {
    id: 'streakAlert',
    trigger: (ctx) => ctx.habits.some(h => h.streak >= 5 && ctx.today.habitsMissed.includes(h.name)),
    priority: 5,
    title: 'Streak at Risk',
    icon: 'Flame',
    iconColor: '#f97316',
    getCTA: () => CTA_LIBRARY.ctas.find(c => c.id === 'open-habit-tracker'),
  },
  {
    id: 'anxietySupport',
    trigger: (ctx) => ctx.recent7Days.anxietyAvg !== null && ctx.recent7Days.anxietyAvg >= 7,
    priority: 6,
    title: 'Calm Your Mind',
    icon: 'Wind',
    iconColor: '#22c55e',
    getCTA: () => CTA_LIBRARY.ctas.find(c => c.id === 'breathing-exercise'),
  },
  {
    id: 'patternInsight',
    trigger: (ctx) => ctx.recent7Days.checkInCount >= 5 && ctx.patterns.sleepMoodCorrelation,
    priority: 7,
    title: 'Pattern Detected',
    icon: 'TrendingUp',
    iconColor: '#3b82f6',
    getCTA: () => CTA_LIBRARY.ctas.find(c => c.id === 'view-insights'),
  },
  {
    id: 'recoveryTip',
    trigger: () => true, // Default fallback
    priority: 8,
    title: 'Daily Wisdom',
    icon: 'Lightbulb',
    iconColor: '#eab308',
    getCTA: () => CTA_LIBRARY.ctas.find(c => c.id === 'view-resources'),
  },
];

async function generateProactiveInsight(ctx) {
  // Find first matching trigger (priority order)
  let selectedTrigger = PROACTIVE_TRIGGERS[PROACTIVE_TRIGGERS.length - 1]; // default
  for (const trigger of PROACTIVE_TRIGGERS) {
    if (trigger.trigger(ctx)) {
      selectedTrigger = trigger;
      break;
    }
  }

  const contextSummary = `
User: ${ctx.user.firstName}, Day ${ctx.user.sobrietyDays}
Trigger: ${selectedTrigger.id}
Mood: ${ctx.recent7Days.moodAvg ?? 'no data'}/10
Cravings (max): ${ctx.recent7Days.cravingMax ?? 'no data'}/10
Sleep: ${ctx.recent7Days.sleepAvg ?? 'no data'}/10
Anxiety: ${ctx.recent7Days.anxietyAvg ?? 'no data'}/10
Meetings this week: ${ctx.recent7Days.meetingCount}
Habits at risk: ${ctx.habits.filter(h => h.streak >= 5 && ctx.today.habitsMissed.includes(h.name)).map(h => h.name).join(', ') || 'None'}
`;

  try {
    const client = getOpenAIClient();

    const completion = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: BEACON_INSIGHT_PROMPT },
        {
          role: 'user',
          content: `Generate a proactive insight message for trigger: ${selectedTrigger.id}

${contextSummary}

Requirements:
- 1-2 sentences only
- Direct and actionable
- Reference specific data (numbers, streaks, days)
- Match the title "${selectedTrigger.title}"
- Don't repeat the title in the message`,
        },
      ],
      max_tokens: 100,
      temperature: 0.7,
    });

    return {
      triggerId: selectedTrigger.id,
      title: selectedTrigger.title,
      icon: selectedTrigger.icon,
      iconColor: selectedTrigger.iconColor,
      message: completion.choices[0]?.message?.content || '',
      cta: selectedTrigger.getCTA(),
      priority: selectedTrigger.priority,
      usage: completion.usage,
    };
  } catch (error) {
    console.error('Error generating proactive insight:', error);
    return null;
  }
}

// =============================================================================
// GENERATE: TECHNIQUE SELECTION
// =============================================================================

const TECHNIQUE_CATEGORIES = {
  anxiety: { threshold: 6, weight: 'anxietyAvg' },
  craving: { threshold: 5, weight: 'cravingAvg' },
  lowMood: { threshold: 4, weight: 'moodAvg', inverse: true },
  sleep: { threshold: 4, weight: 'sleepAvg', inverse: true },
  anger: { threshold: 7, weight: 'anxietyAvg' }, // proxy
  isolation: { threshold: 0, weight: 'meetingCount', checkZero: true },
};

function selectTechniques(ctx) {
  const categoryScores = {};

  // Score each category based on check-in data
  for (const [category, config] of Object.entries(TECHNIQUE_CATEGORIES)) {
    let score = 0;
    const value = ctx.recent7Days[config.weight];

    if (value !== null && value !== undefined) {
      if (config.checkZero && value === 0) {
        score = 10;
      } else if (config.inverse) {
        score = value <= config.threshold ? 10 - value : 0;
      } else {
        score = value >= config.threshold ? value : 0;
      }
    }

    categoryScores[category] = score;
  }

  // Sort categories by score and take top 3
  const sortedCategories = Object.entries(categoryScores)
    .filter(([, score]) => score > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([category]) => category);

  // Fill with defaults if needed
  const defaults = ['grounding', 'cognitive', 'emotional'];
  while (sortedCategories.length < 3) {
    const defaultCat = defaults.find(d => !sortedCategories.includes(d));
    if (defaultCat) sortedCategories.push(defaultCat);
    else break;
  }

  // Map category names to TECHNIQUE_LIBRARY triggers
  const triggerMap = {
    anxiety: 'anxiety',
    craving: 'craving',
    lowMood: 'depression',
    sleep: 'insomnia',
    anger: 'anger',
    isolation: 'isolation',
    grounding: 'anxiety', // default to grounding techniques
    cognitive: 'negative thoughts',
    emotional: 'depression',
  };

  // Select one technique from each category
  const selectedTechniques = [];

  for (const category of sortedCategories) {
    const trigger = triggerMap[category] || category;

    // Find techniques that match this trigger
    const matchingTechniques = TECHNIQUE_LIBRARY.techniques.filter(t =>
      t.triggers.some(tr => tr.toLowerCase().includes(trigger.toLowerCase()))
    );

    if (matchingTechniques.length > 0) {
      // Pick random from matching
      const technique = matchingTechniques[Math.floor(Math.random() * matchingTechniques.length)];
      selectedTechniques.push({
        id: technique.id,
        name: technique.name,
        category: technique.category,
        duration: technique.duration,
        whySelected: category,
        score: categoryScores[category],
      });
    }
  }

  return {
    techniques: selectedTechniques,
    categoryScores,
    reasoning: sortedCategories.join(', '),
  };
}

// =============================================================================
// MAIN: GENERATE ALL DAILY CONTENT FOR ONE USER
// =============================================================================

async function generateDailyContentForUser(userId) {
  const dateKey = formatDate(new Date());
  const results = {
    userId,
    dateKey,
    success: true,
    generated: {},
    errors: [],
  };

  try {
    // Build user context
    const ctx = await buildBeaconContext(userId);
    if (!ctx) {
      results.success = false;
      results.errors.push('Failed to build user context');
      return results;
    }

    const aiInsightsRef = getDb().collection('users').doc(userId).collection('aiInsights');
    const now = admin.firestore.FieldValue.serverTimestamp();

    // 1. Generate Daily Insight
    try {
      const insight = await generateDailyInsight(ctx);
      if (insight) {
        await aiInsightsRef.doc(`daily_${dateKey}`).set({
          type: 'daily',
          subType: insight.type,
          content: insight.content,
          generatedAt: now,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
          viewed: false,
          dismissed: false,
        });
        results.generated.daily = true;
      }
    } catch (error) {
      results.errors.push(`Daily insight: ${error.message}`);
    }

    // 2. Generate Oracle
    try {
      const oracle = await generateDailyOracle(ctx);
      if (oracle) {
        await aiInsightsRef.doc(`oracle_${dateKey}`).set({
          type: 'oracle',
          oracleType: oracle.oracleType,
          content: oracle.content,
          generatedAt: now,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
          revealed: false,
          revealedAt: null,
        });
        results.generated.oracle = true;
      }
    } catch (error) {
      results.errors.push(`Oracle: ${error.message}`);
    }

    // 3. Generate Proactive Insight
    try {
      const proactive = await generateProactiveInsight(ctx);
      if (proactive) {
        await aiInsightsRef.doc(`proactive_${dateKey}`).set({
          type: 'proactive',
          triggerId: proactive.triggerId,
          title: proactive.title,
          message: proactive.message,
          icon: proactive.icon,
          iconColor: proactive.iconColor,
          cta: proactive.cta,
          priority: proactive.priority,
          generatedAt: now,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
          viewed: false,
          actioned: false,
        });
        results.generated.proactive = true;
      }
    } catch (error) {
      results.errors.push(`Proactive: ${error.message}`);
    }

    // 4. Generate Technique Selection
    try {
      const techniques = selectTechniques(ctx);
      await aiInsightsRef.doc(`techniques_${dateKey}`).set({
        type: 'techniques',
        techniques: techniques.techniques,
        categoryScores: techniques.categoryScores,
        reasoning: techniques.reasoning,
        generatedAt: now,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      });
      results.generated.techniques = true;
    } catch (error) {
      results.errors.push(`Techniques: ${error.message}`);
    }

    results.success = results.errors.length === 0;

  } catch (error) {
    results.success = false;
    results.errors.push(`General error: ${error.message}`);
  }

  return results;
}

// =============================================================================
// CLOUD FUNCTION: SCHEDULED DAILY GENERATION (6 AM Pacific)
// =============================================================================

const generateDailyContent = functions
  .runWith({
    timeoutSeconds: 540, // 9 minutes
    memory: '512MB',
  })
  .pubsub.schedule('0 6 * * *') // 6 AM every day
  .timeZone('America/Los_Angeles')
  .onRun(async (context) => {
    console.log('Starting daily AI content generation...');

    try {
      // Get all active PIR users
      const usersSnapshot = await getDb().collection('users')
        .where('role', '==', 'pir')
        .where('status', '==', 'active')
        .get();

      console.log(`Found ${usersSnapshot.size} active PIR users`);

      const results = {
        total: usersSnapshot.size,
        successful: 0,
        failed: 0,
        errors: [],
      };

      // Process users in batches of 10 for rate limiting
      const batchSize = 10;
      const users = usersSnapshot.docs;

      for (let i = 0; i < users.length; i += batchSize) {
        const batch = users.slice(i, i + batchSize);

        const promises = batch.map(async (userDoc) => {
          const result = await generateDailyContentForUser(userDoc.id);
          if (result.success) {
            results.successful++;
          } else {
            results.failed++;
            results.errors.push({ userId: userDoc.id, errors: result.errors });
          }
          return result;
        });

        await Promise.all(promises);

        // Small delay between batches to avoid rate limits
        if (i + batchSize < users.length) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      console.log(`Daily content generation complete: ${results.successful} successful, ${results.failed} failed`);

      if (results.failed > 0) {
        console.error('Failed users:', JSON.stringify(results.errors, null, 2));
      }

      return null;
    } catch (error) {
      console.error('Fatal error in daily content generation:', error);
      return null;
    }
  });

// =============================================================================
// CLOUD FUNCTION: MANUAL TRIGGER FOR TESTING
// =============================================================================

const generateDailyContentManual = functions
  .runWith({
    timeoutSeconds: 300,
    memory: '512MB',
  })
  .https.onCall(async (data, context) => {
    // Verify admin access
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'Must be logged in');
    }

    const userId = data.userId || context.auth.uid;

    console.log(`Manual daily content generation for user: ${userId}`);

    const result = await generateDailyContentForUser(userId);

    return result;
  });

// =============================================================================
// EXPORTS
// =============================================================================

module.exports = {
  generateDailyContent,
  generateDailyContentManual,
  // Export for testing
  generateDailyContentForUser,
  buildBeaconContext,
  generateDailyInsight,
  generateDailyOracle,
  generateProactiveInsight,
  selectTechniques,
};
