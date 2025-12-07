/**
 * BEACON AI - AI Pattern Insights Generation
 * Phase: Project Lighthouse - AI Pattern Insights Redesign
 *
 * Generates 15 genuinely AI-generated insight cards per user weekly:
 * - 3 cards per metric (Mood, Anxiety, Cravings, Sleep, Energy)
 * - Each card has AI-chosen action (technique, journal, meeting, post, none)
 * - Uses GPT-4o-mini for personalized, data-driven insights
 *
 * Runs: Sunday 6 AM Pacific (alongside existing weekly content)
 * Storage: users/{userId}/weeklyInsights/aiPatterns_{weekId}
 * WeekId Format: YYYY-Www (e.g., 2025-W49)
 */

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const OpenAI = require('openai').default;

// Import Beacon personality
const {
  BEACON_IDENTITY,
  BEACON_VOICE,
  SPECIFICITY_RULES,
  APP_NAVIGATION,
  PROHIBITIONS,
} = require('../beacon/beaconPersonality');

// Import AI Context Reader - PHASE 1 REFACTOR
const { getAIContext } = require('./lib/aiContextReader');

// Import full TECHNIQUE_LIBRARY for pattern-based recommendations
const TECHNIQUE_LIBRARY = require('../beacon/TECHNIQUE_LIBRARY.json');

// Import monitoring for structured logging
const {
  logFunctionStart,
  logFunctionSuccess,
  logFunctionError,
  logFunctionWarning,
  recordFunctionExecution,
} = require('../monitoring/functionMonitor');

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
// CONSTANTS
// =============================================================================

const METRICS = ['mood', 'anxiety', 'cravings', 'sleep', 'energy'];
const CARDS_PER_METRIC = 3;
const TOTAL_CARDS = METRICS.length * CARDS_PER_METRIC; // 15

// =============================================================================
// TECHNIQUE MATCHING: Maps metrics/patterns to relevant techniques
// =============================================================================

// Mapping of metrics/patterns to technique triggers for smart recommendations
const METRIC_TECHNIQUE_MAP = {
  mood: {
    declining: ['depression', 'low mood', 'negativity'],
    low: ['depression', 'low motivation', 'withdrawal'],
    improving: [], // No intervention needed
  },
  anxiety: {
    high: ['anxiety', 'panic', 'stress'],
    rising: ['anxiety', 'fear', 'worry'],
    improving: [],
  },
  cravings: {
    high: ['craving', 'urge', 'compulsion'],
    spike: ['craving', 'intense emotion'],
    improving: [],
  },
  sleep: {
    poor: ['insomnia', 'tension', 'anxiety'],
    declining: ['insomnia', 'stress', 'worry'],
    improving: [],
  },
  energy: {
    low: ['low motivation', 'depression', 'withdrawal'],
    declining: ['vulnerability', 'self-care'],
    improving: [],
  },
};

/**
 * Get relevant techniques for a metric based on its current state
 * @param {string} metric - mood, anxiety, cravings, sleep, or energy
 * @param {Object} stats - The metric stats (average, trend, etc.)
 * @returns {Array} Filtered techniques with full details from TECHNIQUE_LIBRARY
 */
function getRelevantTechniques(metric, stats) {
  const triggers = [];

  // Determine which triggers to look for based on metric state
  if (!stats.hasData) return [];

  const isPositiveMetric = ['mood', 'sleep', 'energy'].includes(metric);
  const avg = stats.average || 5;
  const trend = stats.trend || 'stable';

  // Add triggers based on metric value and trend
  if (isPositiveMetric) {
    if (avg <= 4) triggers.push(...(METRIC_TECHNIQUE_MAP[metric]?.low || []));
    if (trend === 'declining') triggers.push(...(METRIC_TECHNIQUE_MAP[metric]?.declining || []));
  } else {
    if (avg >= 6) triggers.push(...(METRIC_TECHNIQUE_MAP[metric]?.high || []));
    if (trend === 'declining') triggers.push(...(METRIC_TECHNIQUE_MAP[metric]?.rising || []));
    if (stats.worstValue >= 7) triggers.push(...(METRIC_TECHNIQUE_MAP[metric]?.spike || []));
  }

  if (triggers.length === 0) return [];

  // Find techniques from TECHNIQUE_LIBRARY that match these triggers
  const matchedTechniques = TECHNIQUE_LIBRARY.techniques.filter(technique => {
    return technique.triggers.some(t =>
      triggers.some(trigger => t.toLowerCase().includes(trigger.toLowerCase()))
    );
  });

  // Return top 5 most relevant, with full details
  return matchedTechniques.slice(0, 5).map(t => ({
    id: t.id,
    name: t.name,
    category: t.category,
    triggers: t.triggers,
    duration: t.duration,
    whyItWorks: t.whyItWorks,
    bestFor: t.bestFor,
    appLocation: t.appLocation,
  }));
}

/**
 * Format techniques for GPT prompt with context
 * @param {Array} techniques - Array of technique objects
 * @returns {string} Formatted string for prompt
 */
function formatTechniquesForPrompt(techniques) {
  if (!techniques || techniques.length === 0) return 'No specific techniques recommended';

  return techniques.map(t =>
    `${t.id}: ${t.name} (${t.category}) - ${t.duration}\n   Best for: ${t.bestFor.slice(0, 3).join(', ')}\n   Why: ${t.whyItWorks.substring(0, 100)}...`
  ).join('\n');
}

// =============================================================================
// HELPER: DATE & WEEK FORMATTING
// =============================================================================

function getWeekId(date = new Date()) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  return `${d.getUTCFullYear()}-W${weekNo.toString().padStart(2, '0')}`;
}

function getDayOfWeekName(dayIndex) {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[dayIndex];
}

function formatDateShort(date) {
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

// =============================================================================
// HELPER: BUILD COMPREHENSIVE USER CONTEXT (REFACTORED - Phase 1)
// Now reads from aiContext/current instead of 10+ collection queries
// =============================================================================

async function buildComprehensiveContext(userId) {
  const weekId = getWeekId();

  console.log(`[AIPatternInsights] Building context for user ${userId} using aiContext reader`);

  // Use aiContextReader instead of direct collection queries
  const { source, data: aiContext, isStale } = await getAIContext(userId, getDb());

  if (!aiContext) {
    console.error(`[AIPatternInsights] Failed to get aiContext for user ${userId}`);
    return null;
  }

  console.log(`[AIPatternInsights] Context source: ${source}, isStale: ${isStale}`);

  // Transform aiContext structure to the format expected by buildGPTPrompt
  const context = {
    userId,
    weekId,
    timestamp: new Date(),
    _aiContextSource: source,
    _aiContextStale: isStale,
    user: {
      firstName: aiContext.user?.firstName || 'Friend',
      sobrietyDate: aiContext.user?.recoveryStartDate?.toDate?.() || null,
      sobrietyDays: aiContext.user?.sobrietyDays || 0,
    },
    thisWeek: {
      checkIns: [],
      metrics: {
        mood: [],
        anxiety: [],
        cravings: [],
        sleep: [],
        energy: [],
      },
      reflections: [],
      gratitudes: [],
      wins: [],
      breakthroughs: [],
      meetingCount: 0,
    },
    prevWeek: {
      metrics: {
        mood: [],
        anxiety: [],
        cravings: [],
        sleep: [],
        energy: [],
      },
    },
    habits: [],
    habitCompletions: [],
    goals: [],
    savedMeetings: [],
  };

  // Transform recent7Days metrics into the format expected by buildGPTPrompt
  const recent7Days = aiContext.recent7Days || {};

  // Map the pre-computed metric values to the expected format
  // aiContext stores: moodValues: [7, 6, 8, ...]
  // buildGPTPrompt expects: [{value: 7, day: 'Monday'}, ...]
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const now = new Date();

  function mapMetricValues(values, metricName) {
    if (!values || !Array.isArray(values)) return [];
    return values.map((value, idx) => {
      // Work backward from today for day assignment
      const dayOffset = values.length - 1 - idx;
      const date = new Date(now);
      date.setDate(date.getDate() - dayOffset);
      return {
        value,
        date,
        day: dayNames[date.getDay()]
      };
    });
  }

  context.thisWeek.metrics.mood = mapMetricValues(recent7Days.moodValues, 'mood');
  context.thisWeek.metrics.anxiety = mapMetricValues(recent7Days.anxietyValues, 'anxiety');
  context.thisWeek.metrics.cravings = mapMetricValues(recent7Days.cravingValues, 'cravings');
  context.thisWeek.metrics.sleep = mapMetricValues(recent7Days.sleepValues, 'sleep');
  context.thisWeek.metrics.energy = mapMetricValues(recent7Days.energyValues, 'energy');

  // Set check-in count from aiContext
  context.thisWeek.checkIns = new Array(recent7Days.checkInCount || 0).fill({});

  // Transform habits from aiContext
  const habitsData = aiContext.habits || {};
  if (habitsData.definitions && Array.isArray(habitsData.definitions)) {
    context.habits = habitsData.definitions.map(h => ({
      id: h.id,
      name: h.name,
      frequency: h.frequency || 'daily'
    }));
  }

  // Simulate habit completions based on completion rate
  // aiContext has completionRate7Day as percentage
  if (habitsData.completionRate7Day && context.habits.length > 0) {
    const expectedCompletions = Math.round((habitsData.completionRate7Day / 100) * context.habits.length * 7);
    for (let i = 0; i < expectedCompletions; i++) {
      const habitIdx = i % context.habits.length;
      context.habitCompletions.push({
        habitId: context.habits[habitIdx].id,
        completedAt: new Date(now.getTime() - (i * 24 * 60 * 60 * 1000))
      });
    }
  }

  // Transform goals from aiContext
  const goalsData = aiContext.goals || {};
  if (goalsData.active && Array.isArray(goalsData.active)) {
    context.goals = goalsData.active.map(g => ({
      id: g.id,
      title: g.title || 'Untitled Goal',
      progress: g.progress || 0,
      area: g.category || 'general'
    }));
  }

  // Transform reflections from aiContext (if available)
  const reflectionsData = aiContext.reflections || {};
  if (reflectionsData.recentThemes && Array.isArray(reflectionsData.recentThemes)) {
    // Create synthetic reflections from themes for prompt context
    context.thisWeek.reflections = reflectionsData.recentThemes.slice(0, 3).map(theme => ({
      text: `Reflection about ${theme}`,
      date: formatDateShort(new Date())
    }));
  }

  // Transform gratitudes from aiContext (if available)
  const gratitudesData = aiContext.gratitudes || {};
  if (gratitudesData.topCategories && Array.isArray(gratitudesData.topCategories)) {
    context.thisWeek.gratitudes = gratitudesData.topCategories.slice(0, 3).map(cat => ({
      text: `Gratitude for ${cat.category || 'general'}`,
      date: formatDateShort(new Date())
    }));
  }

  // Transform wins from aiContext (if available)
  const winsData = aiContext.wins || {};
  if (winsData.topCategories && Array.isArray(winsData.topCategories)) {
    context.thisWeek.wins = winsData.topCategories.slice(0, 3).map(cat => ({
      text: `Win in ${cat.category || 'general'}`,
      date: formatDateShort(new Date())
    }));
  }

  // Meeting count from today's data or patterns
  const todayData = aiContext.today || {};
  context.thisWeek.meetingCount = todayData.meetingsAttended || 0;

  // Calculate previous week metrics using trends
  // If we have trends, we can estimate previous week values
  if (recent7Days.moodTrend && context.thisWeek.metrics.mood.length > 0) {
    const avgMood = recent7Days.avgMood || 5;
    const trendAdjustment = recent7Days.moodTrend === 'improving' ? -0.5 :
                           recent7Days.moodTrend === 'declining' ? 0.5 : 0;
    context.prevWeek.metrics.mood = [{ value: avgMood + trendAdjustment, day: 'Previous Week Avg' }];
  }

  if (recent7Days.anxietyTrend && context.thisWeek.metrics.anxiety.length > 0) {
    const avgAnxiety = recent7Days.avgAnxiety || 5;
    const trendAdjustment = recent7Days.anxietyTrend === 'improving' ? 0.5 :
                           recent7Days.anxietyTrend === 'declining' ? -0.5 : 0;
    context.prevWeek.metrics.anxiety = [{ value: avgAnxiety + trendAdjustment, day: 'Previous Week Avg' }];
  }

  if (recent7Days.cravingTrend && context.thisWeek.metrics.cravings.length > 0) {
    const avgCraving = recent7Days.avgCraving || 5;
    const trendAdjustment = recent7Days.cravingTrend === 'improving' ? 0.5 :
                           recent7Days.cravingTrend === 'declining' ? -0.5 : 0;
    context.prevWeek.metrics.cravings = [{ value: avgCraving + trendAdjustment, day: 'Previous Week Avg' }];
  }

  if (recent7Days.sleepTrend && context.thisWeek.metrics.sleep.length > 0) {
    const avgSleep = recent7Days.avgSleep || 5;
    const trendAdjustment = recent7Days.sleepTrend === 'improving' ? -0.5 :
                           recent7Days.sleepTrend === 'declining' ? 0.5 : 0;
    context.prevWeek.metrics.sleep = [{ value: avgSleep + trendAdjustment, day: 'Previous Week Avg' }];
  }

  if (recent7Days.energyTrend && context.thisWeek.metrics.energy.length > 0) {
    const avgEnergy = recent7Days.avgEnergy || 5;
    const trendAdjustment = recent7Days.energyTrend === 'improving' ? -0.5 :
                           recent7Days.energyTrend === 'declining' ? 0.5 : 0;
    context.prevWeek.metrics.energy = [{ value: avgEnergy + trendAdjustment, day: 'Previous Week Avg' }];
  }

  return context;
}

// =============================================================================
// HELPER: CALCULATE METRIC STATS
// =============================================================================

function calculateMetricStats(thisWeekData, prevWeekData, metricName) {
  const stats = {
    metric: metricName,
    hasData: thisWeekData.length > 0,
    count: thisWeekData.length,
    average: null,
    prevAverage: null,
    trend: 'stable',
    bestDay: null,
    worstDay: null,
    bestValue: null,
    worstValue: null,
    values: thisWeekData.map(d => ({ value: d.value, day: d.day })),
  };

  if (thisWeekData.length === 0) return stats;

  // Calculate average
  const values = thisWeekData.map(d => d.value);
  stats.average = parseFloat((values.reduce((a, b) => a + b, 0) / values.length).toFixed(1));

  // Find best and worst
  const isPositiveMetric = ['mood', 'sleep', 'energy'].includes(metricName);
  if (isPositiveMetric) {
    const bestPoint = thisWeekData.reduce((best, curr) => curr.value > best.value ? curr : best);
    const worstPoint = thisWeekData.reduce((worst, curr) => curr.value < worst.value ? curr : worst);
    stats.bestDay = bestPoint.day;
    stats.bestValue = bestPoint.value;
    stats.worstDay = worstPoint.day;
    stats.worstValue = worstPoint.value;
  } else {
    const bestPoint = thisWeekData.reduce((best, curr) => curr.value < best.value ? curr : best);
    const worstPoint = thisWeekData.reduce((worst, curr) => curr.value > worst.value ? curr : worst);
    stats.bestDay = bestPoint.day;
    stats.bestValue = bestPoint.value;
    stats.worstDay = worstPoint.day;
    stats.worstValue = worstPoint.value;
  }

  // Calculate trend
  if (prevWeekData.length > 0) {
    const prevValues = prevWeekData.map(d => d.value);
    stats.prevAverage = parseFloat((prevValues.reduce((a, b) => a + b, 0) / prevValues.length).toFixed(1));
    const change = stats.average - stats.prevAverage;
    const threshold = 0.5;
    if (isPositiveMetric) {
      if (change > threshold) stats.trend = 'improving';
      else if (change < -threshold) stats.trend = 'declining';
    } else {
      if (change < -threshold) stats.trend = 'improving';
      else if (change > threshold) stats.trend = 'declining';
    }
  }

  return stats;
}

// =============================================================================
// HELPER: BUILD GPT PROMPT
// =============================================================================

function buildGPTPrompt(ctx) {
  // Build metric stats
  const metricStats = {};
  for (const metric of METRICS) {
    metricStats[metric] = calculateMetricStats(
      ctx.thisWeek.metrics[metric],
      ctx.prevWeek.metrics[metric],
      metric
    );
  }

  // Build habit stats
  const habitStats = ctx.habits.map(habit => {
    const completions = ctx.habitCompletions.filter(c => c.habitId === habit.id).length;
    return {
      name: habit.name,
      completionRate: Math.round((completions / 7) * 100),
    };
  });

  // Build pattern-matched techniques for each metric (from full TECHNIQUE_LIBRARY)
  const techniquesByMetric = {};
  for (const metric of METRICS) {
    techniquesByMetric[metric] = getRelevantTechniques(metric, metricStats[metric]);
  }

  // Build the master techniques list (all unique techniques from TECHNIQUE_LIBRARY)
  const allTechniques = TECHNIQUE_LIBRARY.techniques.map(t =>
    `${t.id}: ${t.name} (${t.category}) - Helps: ${t.triggers.slice(0, 4).join(', ')}`
  ).join('\n');

  // System prompt using Beacon personality
  const systemPrompt = `${BEACON_IDENTITY}

${BEACON_VOICE}

${SPECIFICITY_RULES}

${APP_NAVIGATION}

${PROHIBITIONS}

You are generating personalized AI insight cards for a recovery app.`;

  // User prompt with all context
  const userPrompt = `Generate ${TOTAL_CARDS} insight cards for ${ctx.user.firstName} who has been sober ${ctx.user.sobrietyDays} days.

TODAY: ${formatDateShort(new Date())}
WEEK: ${ctx.weekId}

=== CHECK-IN DATA THIS WEEK ===
Total check-ins: ${ctx.thisWeek.checkIns.length}/7

MOOD (${metricStats.mood.count} data points):
${metricStats.mood.hasData
    ? `- Average: ${metricStats.mood.average}/10
- Trend: ${metricStats.mood.trend}${metricStats.mood.prevAverage ? ` (was ${metricStats.mood.prevAverage} last week)` : ''}
- Best day: ${metricStats.mood.bestDay} (${metricStats.mood.bestValue}/10)
- Worst day: ${metricStats.mood.worstDay} (${metricStats.mood.worstValue}/10)
- Daily values: ${metricStats.mood.values.map(v => `${v.day}: ${v.value}`).join(', ')}`
    : '- No mood data logged this week'}

ANXIETY (${metricStats.anxiety.count} data points):
${metricStats.anxiety.hasData
    ? `- Average: ${metricStats.anxiety.average}/10
- Trend: ${metricStats.anxiety.trend}${metricStats.anxiety.prevAverage ? ` (was ${metricStats.anxiety.prevAverage} last week)` : ''}
- Best day: ${metricStats.anxiety.bestDay} (${metricStats.anxiety.bestValue}/10)
- Worst day: ${metricStats.anxiety.worstDay} (${metricStats.anxiety.worstValue}/10)
- Daily values: ${metricStats.anxiety.values.map(v => `${v.day}: ${v.value}`).join(', ')}`
    : '- No anxiety data logged this week'}

CRAVINGS (${metricStats.cravings.count} data points):
${metricStats.cravings.hasData
    ? `- Average: ${metricStats.cravings.average}/10
- Trend: ${metricStats.cravings.trend}${metricStats.cravings.prevAverage ? ` (was ${metricStats.cravings.prevAverage} last week)` : ''}
- Best day: ${metricStats.cravings.bestDay} (${metricStats.cravings.bestValue}/10)
- Worst day: ${metricStats.cravings.worstDay} (${metricStats.cravings.worstValue}/10)
- Daily values: ${metricStats.cravings.values.map(v => `${v.day}: ${v.value}`).join(', ')}`
    : '- No craving data logged this week'}

SLEEP (${metricStats.sleep.count} data points):
${metricStats.sleep.hasData
    ? `- Average: ${metricStats.sleep.average}/10
- Trend: ${metricStats.sleep.trend}${metricStats.sleep.prevAverage ? ` (was ${metricStats.sleep.prevAverage} last week)` : ''}
- Best day: ${metricStats.sleep.bestDay} (${metricStats.sleep.bestValue}/10)
- Worst day: ${metricStats.sleep.worstDay} (${metricStats.sleep.worstValue}/10)
- Daily values: ${metricStats.sleep.values.map(v => `${v.day}: ${v.value}`).join(', ')}`
    : '- No sleep data logged this week'}

ENERGY (${metricStats.energy.count} data points):
${metricStats.energy.hasData
    ? `- Average: ${metricStats.energy.average}/10
- Trend: ${metricStats.energy.trend}${metricStats.energy.prevAverage ? ` (was ${metricStats.energy.prevAverage} last week)` : ''}
- Best day: ${metricStats.energy.bestDay} (${metricStats.energy.bestValue}/10)
- Worst day: ${metricStats.energy.worstDay} (${metricStats.energy.worstValue}/10)
- Daily values: ${metricStats.energy.values.map(v => `${v.day}: ${v.value}`).join(', ')}`
    : '- No energy data logged this week'}

=== HABITS ===
${habitStats.length > 0
    ? habitStats.map(h => `- ${h.name}: ${h.completionRate}% this week`).join('\n')
    : '- No habits set up yet'}

=== GOALS ===
${ctx.goals.length > 0
    ? ctx.goals.map(g => `- ${g.title}: ${g.progress}% complete (${g.area})`).join('\n')
    : '- No active goals'}

=== MEETINGS ===
- Attended ${ctx.thisWeek.meetingCount} meetings this week
- ${ctx.savedMeetings.length} saved meetings: ${ctx.savedMeetings.slice(0, 3).map(m => m.name).join(', ') || 'none'}

=== REFLECTIONS ===
${ctx.thisWeek.reflections.length > 0
    ? ctx.thisWeek.reflections.slice(0, 3).map(r => `- "${(r.text || 'Reflection').substring(0, 100)}..." (${r.date})`).join('\n')
    : '- No reflections this week'}

=== GRATITUDES ===
${ctx.thisWeek.gratitudes.length > 0
    ? ctx.thisWeek.gratitudes.slice(0, 3).map(g => `- "${(g.text || 'Gratitude entry').substring(0, 80)}..." (${g.date})`).join('\n')
    : '- No gratitudes this week'}

=== WINS ===
${ctx.thisWeek.wins.length > 0
    ? ctx.thisWeek.wins.slice(0, 3).map(w => `- "${(w.text || 'Win logged').substring(0, 80)}..." (${w.date})`).join('\n')
    : '- No wins logged this week'}

=== BREAKTHROUGHS ===
${ctx.thisWeek.breakthroughs.length > 0
    ? ctx.thisWeek.breakthroughs.slice(0, 3).map(b => `- "${(b.text || 'Breakthrough moment').substring(0, 80)}..." (${b.date})`).join('\n')
    : '- No breakthroughs this week'}

=== RECOMMENDED TECHNIQUES BY METRIC (Based on ${ctx.user.firstName}'s patterns) ===

MOOD techniques:
${formatTechniquesForPrompt(techniquesByMetric.mood)}

ANXIETY techniques:
${formatTechniquesForPrompt(techniquesByMetric.anxiety)}

CRAVINGS techniques:
${formatTechniquesForPrompt(techniquesByMetric.cravings)}

SLEEP techniques:
${formatTechniquesForPrompt(techniquesByMetric.sleep)}

ENERGY techniques:
${formatTechniquesForPrompt(techniquesByMetric.energy)}

=== ALL AVAILABLE TECHNIQUES (Pick from these) ===
${allTechniques}

=== INSTRUCTIONS ===

Generate exactly ${TOTAL_CARDS} insight cards (3 for each metric: mood, anxiety, cravings, sleep, energy).

For EACH card, you must:
1. Reference specific data from above (dates, values, trends, names)
2. Be personalized to ${ctx.user.firstName}'s patterns
3. Pick ONE action type that would genuinely help based on the data:
   - "technique": Pick a specific technique ID from the list above
   - "journal": If they need to reflect or process something
   - "meeting": If they need connection/support
   - "post": If sharing could help them or help others
   - "none": If the insight is informational only

IMPORTANT for each metric:
- Card 1: Primary observation about the week's data
- Card 2: Pattern or trend insight
- Card 3: Actionable recommendation

Return ONLY valid JSON array (no markdown, no explanation):
[
  {
    "metric": "mood",
    "type": "observation",
    "title": "Short title max 8 words",
    "message": "Personalized message 40-60 words referencing specific data",
    "icon": "LucideIconName",
    "severity": "info",
    "actionType": "technique",
    "actionId": "ct-06",
    "modalTitle": "Expanded title for detail view",
    "modalContent": "Expanded explanation 80-100 words with more context and why this matters"
  }
]

Valid Lucide icons: TrendingUp, TrendingDown, AlertTriangle, Lightbulb, Heart, Target, Zap, Sun, Moon, Brain, Star, Activity, Coffee, Battery, Smile, Frown, CloudRain, Sparkles, Award, CheckCircle`;

  return { systemPrompt, userPrompt };
}

// =============================================================================
// HELPER: CALL GPT AND PARSE RESPONSE
// =============================================================================

async function callGPTForInsights(ctx) {
  const { systemPrompt, userPrompt } = buildGPTPrompt(ctx);

  try {
    const client = getOpenAIClient();

    const completion = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      max_tokens: 3000,
      temperature: 0.7,
    });

    const responseText = completion.choices[0]?.message?.content || '';
    const usage = completion.usage;

    console.log(`[AIPatternInsights] Token usage - Input: ${usage?.prompt_tokens}, Output: ${usage?.completion_tokens}`);

    // Parse the JSON response
    const jsonMatch = responseText.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      console.error('[AIPatternInsights] No JSON array found in response');
      console.log('[AIPatternInsights] Raw response:', responseText.substring(0, 500));
      return null;
    }

    const insights = JSON.parse(jsonMatch[0]);

    // Validate structure
    if (!Array.isArray(insights)) {
      console.error('[AIPatternInsights] Response is not an array');
      return null;
    }

    // Validate each insight
    const validatedInsights = insights.map((insight, idx) => ({
      id: `${insight.metric}-${idx + 1}`,
      metric: insight.metric || 'unknown',
      type: insight.type || 'observation',
      title: insight.title || 'Insight',
      message: insight.message || '',
      icon: insight.icon || 'Lightbulb',
      severity: insight.severity || 'info',
      actionType: insight.actionType || 'none',
      actionId: insight.actionId || null,
      modalTitle: insight.modalTitle || insight.title,
      modalContent: insight.modalContent || insight.message,
    }));

    return {
      insights: validatedInsights,
      usage: {
        inputTokens: usage?.prompt_tokens || 0,
        outputTokens: usage?.completion_tokens || 0,
        totalTokens: usage?.total_tokens || 0,
      },
    };

  } catch (error) {
    console.error('[AIPatternInsights] GPT call failed:', error);
    return null;
  }
}

// =============================================================================
// MAIN: GENERATE AI PATTERN INSIGHTS FOR ONE USER
// =============================================================================

async function generateAIPatternInsightsForUser(userId) {
  const weekId = getWeekId();
  const result = {
    userId,
    weekId,
    success: false,
    insightsCount: 0,
    error: null,
  };

  try {
    // Build comprehensive context
    const ctx = await buildComprehensiveContext(userId);
    if (!ctx) {
      result.error = 'Failed to build user context';
      return result;
    }

    // Call GPT
    const gptResult = await callGPTForInsights(ctx);
    if (!gptResult) {
      result.error = 'Failed to generate GPT insights';
      return result;
    }

    // Group insights by metric
    const insightsByMetric = {};
    for (const metric of METRICS) {
      insightsByMetric[metric] = gptResult.insights.filter(i => i.metric === metric);
    }

    // Save to Firestore
    const weeklyInsightsRef = getDb().collection('users').doc(userId).collection('weeklyInsights');
    await weeklyInsightsRef.doc(`aiPatterns_${weekId}`).set({
      type: 'aiPatterns',
      weekId,
      userId,
      insights: gptResult.insights,
      insightsByMetric,
      totalCards: gptResult.insights.length,
      tokenUsage: gptResult.usage,
      generatedAt: admin.firestore.FieldValue.serverTimestamp(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    result.success = true;
    result.insightsCount = gptResult.insights.length;

    console.log(`[AIPatternInsights] Generated ${result.insightsCount} insights for user ${userId}`);

  } catch (error) {
    console.error(`[AIPatternInsights] Error for user ${userId}:`, error);
    result.error = error.message;
  }

  return result;
}

// =============================================================================
// CLOUD FUNCTION: SCHEDULED GENERATION (Sunday 6 AM Pacific)
// =============================================================================

const generateAIPatternInsights = functions
  .runWith({
    timeoutSeconds: 540, // 9 minutes
    memory: '512MB',
  })
  .pubsub.schedule('0 6 * * 0') // 6 AM every Sunday
  .timeZone('America/Los_Angeles')
  .onRun(async (context) => {
    const startTime = new Date();
    const weekId = getWeekId();

    // Log function start with structured logging
    logFunctionStart('generateAIPatternInsights', { weekId, schedule: 'Sunday 6 AM PT' });

    try {
      // Get all active PIR users
      const usersSnapshot = await getDb().collection('users')
        .where('role', '==', 'pir')
        .where('status', '==', 'active')
        .get();

      console.log(`[AIPatternInsights] Found ${usersSnapshot.size} active PIR users`);

      const results = {
        total: usersSnapshot.size,
        successful: 0,
        failed: 0,
        errors: [],
      };

      // Process users in batches of 5 for rate limiting
      const batchSize = 5;
      const users = usersSnapshot.docs;

      for (let i = 0; i < users.length; i += batchSize) {
        const batch = users.slice(i, i + batchSize);

        const promises = batch.map(async (userDoc) => {
          const result = await generateAIPatternInsightsForUser(userDoc.id);
          if (result.success) {
            results.successful++;
            logFunctionSuccess('generateAIPatternInsights', {
              userId: userDoc.id,
              insightsCount: result.insightsCount,
            });
          } else {
            results.failed++;
            results.errors.push({ userId: userDoc.id, error: result.error });
            logFunctionWarning('generateAIPatternInsights', `Failed for user ${userDoc.id}: ${result.error}`, {
              userId: userDoc.id,
            });
          }
          return result;
        });

        await Promise.all(promises);

        // 2 second delay between batches to avoid rate limits
        if (i + batchSize < users.length) {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }

      // Record execution summary to Firestore for monitoring dashboard
      await recordFunctionExecution('generateAIPatternInsights', {
        startTime,
        total: results.total,
        successful: results.successful,
        failed: results.failed,
        errors: results.errors,
        metadata: { weekId },
      });

      return null;
    } catch (error) {
      // Log critical error
      logFunctionError('generateAIPatternInsights', error, { phase: 'main_loop', weekId });

      // Record failed execution
      await recordFunctionExecution('generateAIPatternInsights', {
        startTime,
        total: 0,
        successful: 0,
        failed: 1,
        errors: [{ error: error.message, stack: error.stack }],
        metadata: { weekId },
      });

      return null;
    }
  });

// =============================================================================
// CLOUD FUNCTION: MANUAL TRIGGER FOR TESTING
// =============================================================================

const generateAIPatternInsightsManual = functions
  .runWith({
    timeoutSeconds: 120,
    memory: '512MB',
  })
  .https.onCall(async (data, context) => {
    // Verify authentication
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'Must be logged in');
    }

    const userId = data.userId || context.auth.uid;

    console.log(`[AIPatternInsights] Manual generation for user: ${userId}`);

    const result = await generateAIPatternInsightsForUser(userId);

    return result;
  });

// =============================================================================
// EXPORTS
// =============================================================================

module.exports = {
  generateAIPatternInsights,
  generateAIPatternInsightsManual,
  // Export for testing/manual runs
  generateAIPatternInsightsForUser,
  buildComprehensiveContext,
  buildGPTPrompt,
  callGPTForInsights,
  getWeekId,
};
