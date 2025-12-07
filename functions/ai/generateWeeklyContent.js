/**
 * BEACON AI - Weekly Content Generation
 * Phase 6.3: Cloud Functions for Sunday 6 AM Pacific Weekly Content
 *
 * Generates 5 types of personalized AI content for each user weekly:
 * 1. Pattern Analysis - Metric analysis with insights (Mood, Anxiety, Cravings, Sleep, Energy)
 * 2. Correlation AI Text - Personalized correlation interpretations
 * 3. Reflection Themes - Analysis of reflections and gratitudes
 * 4. Habit Coach - 3 insight cards about habit performance
 * 5. Goal Coach - 4 insight cards about goal progress
 *
 * Runs: Sunday 6 AM Pacific
 * Storage: users/{userId}/weeklyInsights/{type}_{weekId}
 * WeekId Format: YYYY-Www (e.g., 2025-W49)
 */

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const OpenAI = require('openai').default;

// Import Beacon personality
const {
  getSystemPrompt,
  BEACON_INSIGHT_PROMPT,
  BEACON_SUMMARY_PROMPT,
} = require('../beacon/beaconPersonality');

// Import libraries
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
// HELPER: DATE & WEEK FORMATTING
// =============================================================================

function getWeekId(date = new Date()) {
  // Get ISO week number
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  return `${d.getUTCFullYear()}-W${weekNo.toString().padStart(2, '0')}`;
}

function formatDateForAI(date) {
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

function getDayOfWeekName(dayIndex) {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[dayIndex];
}

// =============================================================================
// HELPER: BUILD WEEKLY CONTEXT FOR A USER (REFACTORED - Phase 1)
// Now reads from aiContext/current instead of 8+ collection queries
// =============================================================================

async function buildWeeklyContext(userId) {
  const weekId = getWeekId();

  console.log(`[WeeklyContent] Building context for user ${userId} using aiContext reader`);

  // Use aiContextReader instead of direct collection queries
  const { source, data: aiContext, isStale } = await getAIContext(userId, getDb());

  if (!aiContext) {
    console.error(`[WeeklyContent] Failed to get aiContext for user ${userId}`);
    return null;
  }

  console.log(`[WeeklyContent] Context source: ${source}, isStale: ${isStale}`);

  // Transform aiContext to the format expected by the generators
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
    goalUpdates: [],
  };

  // Transform recent7Days metrics into the format expected by the generators
  const recent7Days = aiContext.recent7Days || {};
  const now = new Date();

  // Map the pre-computed metric values to the expected format with dayOfWeek
  function mapMetricValues(values) {
    if (!values || !Array.isArray(values)) return [];
    return values.map((value, idx) => {
      const dayOffset = values.length - 1 - idx;
      const date = new Date(now);
      date.setDate(date.getDate() - dayOffset);
      return {
        value,
        date,
        dayOfWeek: date.getDay()
      };
    });
  }

  context.thisWeek.metrics.mood = mapMetricValues(recent7Days.moodValues);
  context.thisWeek.metrics.anxiety = mapMetricValues(recent7Days.anxietyValues);
  context.thisWeek.metrics.cravings = mapMetricValues(recent7Days.cravingValues);
  context.thisWeek.metrics.sleep = mapMetricValues(recent7Days.sleepValues);
  context.thisWeek.metrics.energy = mapMetricValues(recent7Days.energyValues);

  // Set check-in count from aiContext
  const checkInCount = recent7Days.checkInCount || 0;
  for (let i = 0; i < checkInCount; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    context.thisWeek.checkIns.push({
      id: `synthetic_${i}`,
      date,
      dayOfWeek: date.getDay()
    });
  }

  // Transform reflections from aiContext
  const reflectionsData = aiContext.reflections || {};
  // Use allReflections if available (full data), otherwise fall back to recentThemes
  if (reflectionsData.allReflections && Array.isArray(reflectionsData.allReflections)) {
    // Filter to last 7 days and map to expected format
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    context.thisWeek.reflections = reflectionsData.allReflections
      .filter(r => {
        const createdAt = r.createdAt?._seconds ? new Date(r.createdAt._seconds * 1000) : new Date(r.createdAt);
        return createdAt >= sevenDaysAgo;
      })
      .slice(0, 20)
      .map(r => ({
        id: r.id,
        text: r.content || r.text || '',
        date: r.createdAt?._seconds ? new Date(r.createdAt._seconds * 1000) : new Date(r.createdAt),
        dayOfWeek: (r.createdAt?._seconds ? new Date(r.createdAt._seconds * 1000) : new Date(r.createdAt)).getDay()
      }));
  } else if (reflectionsData.recentThemes && Array.isArray(reflectionsData.recentThemes)) {
    context.thisWeek.reflections = reflectionsData.recentThemes.slice(0, 5).map((theme, idx) => ({
      id: `theme_${idx}`,
      text: `Reflection about ${theme}`,
      date: new Date(now.getTime() - idx * 24 * 60 * 60 * 1000),
      dayOfWeek: new Date(now.getTime() - idx * 24 * 60 * 60 * 1000).getDay()
    }));
  }
  // Store total counts for UI
  context.reflectionsTotalCount = reflectionsData.totalCount || context.thisWeek.reflections.length;

  // Transform gratitudes from aiContext
  const gratitudesData = aiContext.gratitudes || {};
  // Use allGratitudes if available (full data), otherwise fall back to topCategories
  if (gratitudesData.allGratitudes && Array.isArray(gratitudesData.allGratitudes)) {
    // Filter to last 7 days and map to expected format
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    context.thisWeek.gratitudes = gratitudesData.allGratitudes
      .filter(g => {
        const createdAt = g.createdAt?._seconds ? new Date(g.createdAt._seconds * 1000) : new Date(g.createdAt);
        return createdAt >= sevenDaysAgo;
      })
      .slice(0, 20)
      .map(g => ({
        id: g.id,
        text: g.content || g.text || '',
        date: g.createdAt?._seconds ? new Date(g.createdAt._seconds * 1000) : new Date(g.createdAt),
        dayOfWeek: (g.createdAt?._seconds ? new Date(g.createdAt._seconds * 1000) : new Date(g.createdAt)).getDay()
      }));
  } else if (gratitudesData.topCategories && Array.isArray(gratitudesData.topCategories)) {
    context.thisWeek.gratitudes = gratitudesData.topCategories.slice(0, 5).map((cat, idx) => ({
      id: `gratitude_${idx}`,
      text: `Gratitude for ${cat.category || 'general'}`,
      date: new Date(now.getTime() - idx * 24 * 60 * 60 * 1000),
      dayOfWeek: new Date(now.getTime() - idx * 24 * 60 * 60 * 1000).getDay()
    }));
  }
  // Store total counts for UI
  context.gratitudesTotalCount = gratitudesData.totalCount || context.thisWeek.gratitudes.length;

  // Meeting count from aiContext
  context.thisWeek.meetingCount = aiContext.today?.meetingsAttended || 0;

  // Transform habits from aiContext
  const habitsData = aiContext.habits || {};
  if (habitsData.definitions && Array.isArray(habitsData.definitions)) {
    context.habits = habitsData.definitions.map((h, idx) => {
      const streakInfo = habitsData.streaks?.[idx] || {};
      return {
        id: h.id,
        name: h.name,
        frequency: h.frequency || 'daily',
        streak: streakInfo.currentStreak || 0,
        active: true
      };
    });
  }

  // Simulate habit completions based on completion rate
  if (habitsData.completionRate7Day && context.habits.length > 0) {
    const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
    const expectedCompletions = Math.round((habitsData.completionRate7Day / 100) * context.habits.length * 14);
    for (let i = 0; i < expectedCompletions; i++) {
      const habitIdx = i % context.habits.length;
      const daysAgo = i % 14;
      context.habitCompletions.push({
        id: `completion_${i}`,
        habitId: context.habits[habitIdx].id,
        completedAt: new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000)
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
      area: g.category || 'general',
      status: 'active',
      targetDate: g.targetDate?.toDate?.() || null
    }));
  }

  // Calculate previous week metrics using trends (synthetic data for comparison)
  // If we have trends, we can estimate previous week values
  if (recent7Days.moodTrend && context.thisWeek.metrics.mood.length > 0) {
    const avgMood = recent7Days.avgMood || 5;
    const trendAdjustment = recent7Days.moodTrend === 'improving' ? -0.5 :
                           recent7Days.moodTrend === 'declining' ? 0.5 : 0;
    const prevDate = new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000);
    context.prevWeek.metrics.mood = [{ value: avgMood + trendAdjustment, date: prevDate, dayOfWeek: prevDate.getDay() }];
  }

  if (recent7Days.anxietyTrend && context.thisWeek.metrics.anxiety.length > 0) {
    const avgAnxiety = recent7Days.avgAnxiety || 5;
    const trendAdjustment = recent7Days.anxietyTrend === 'improving' ? 0.5 :
                           recent7Days.anxietyTrend === 'declining' ? -0.5 : 0;
    const prevDate = new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000);
    context.prevWeek.metrics.anxiety = [{ value: avgAnxiety + trendAdjustment, date: prevDate, dayOfWeek: prevDate.getDay() }];
  }

  if (recent7Days.cravingTrend && context.thisWeek.metrics.cravings.length > 0) {
    const avgCraving = recent7Days.avgCraving || 5;
    const trendAdjustment = recent7Days.cravingTrend === 'improving' ? 0.5 :
                           recent7Days.cravingTrend === 'declining' ? -0.5 : 0;
    const prevDate = new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000);
    context.prevWeek.metrics.cravings = [{ value: avgCraving + trendAdjustment, date: prevDate, dayOfWeek: prevDate.getDay() }];
  }

  if (recent7Days.sleepTrend && context.thisWeek.metrics.sleep.length > 0) {
    const avgSleep = recent7Days.avgSleep || 5;
    const trendAdjustment = recent7Days.sleepTrend === 'improving' ? -0.5 :
                           recent7Days.sleepTrend === 'declining' ? 0.5 : 0;
    const prevDate = new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000);
    context.prevWeek.metrics.sleep = [{ value: avgSleep + trendAdjustment, date: prevDate, dayOfWeek: prevDate.getDay() }];
  }

  if (recent7Days.energyTrend && context.thisWeek.metrics.energy.length > 0) {
    const avgEnergy = recent7Days.avgEnergy || 5;
    const trendAdjustment = recent7Days.energyTrend === 'improving' ? -0.5 :
                           recent7Days.energyTrend === 'declining' ? 0.5 : 0;
    const prevDate = new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000);
    context.prevWeek.metrics.energy = [{ value: avgEnergy + trendAdjustment, date: prevDate, dayOfWeek: prevDate.getDay() }];
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
    weekCount: thisWeekData.length,
    weekAvg: null,
    prevWeekAvg: null,
    change: null,
    trend: 'stable',
    bestDay: null,
    worstDay: null,
    bestValue: null,
    worstValue: null,
    weekdayAvg: null,
    weekendAvg: null,
    dataPoints: thisWeekData,
  };

  if (thisWeekData.length === 0) return stats;

  // Calculate this week's average
  const values = thisWeekData.map(d => d.value);
  stats.weekAvg = parseFloat((values.reduce((a, b) => a + b, 0) / values.length).toFixed(1));

  // Find best and worst days
  const isPositiveMetric = ['mood', 'sleep', 'energy'].includes(metricName);

  if (isPositiveMetric) {
    // Higher is better
    const bestPoint = thisWeekData.reduce((best, curr) => curr.value > best.value ? curr : best);
    const worstPoint = thisWeekData.reduce((worst, curr) => curr.value < worst.value ? curr : worst);
    stats.bestDay = getDayOfWeekName(bestPoint.dayOfWeek);
    stats.bestValue = bestPoint.value;
    stats.worstDay = getDayOfWeekName(worstPoint.dayOfWeek);
    stats.worstValue = worstPoint.value;
  } else {
    // Lower is better (anxiety, cravings)
    const bestPoint = thisWeekData.reduce((best, curr) => curr.value < best.value ? curr : best);
    const worstPoint = thisWeekData.reduce((worst, curr) => curr.value > worst.value ? curr : worst);
    stats.bestDay = getDayOfWeekName(bestPoint.dayOfWeek);
    stats.bestValue = bestPoint.value;
    stats.worstDay = getDayOfWeekName(worstPoint.dayOfWeek);
    stats.worstValue = worstPoint.value;
  }

  // Calculate weekday vs weekend averages
  const weekdayData = thisWeekData.filter(d => d.dayOfWeek >= 1 && d.dayOfWeek <= 5);
  const weekendData = thisWeekData.filter(d => d.dayOfWeek === 0 || d.dayOfWeek === 6);

  if (weekdayData.length > 0) {
    stats.weekdayAvg = parseFloat((weekdayData.reduce((a, b) => a + b.value, 0) / weekdayData.length).toFixed(1));
  }
  if (weekendData.length > 0) {
    stats.weekendAvg = parseFloat((weekendData.reduce((a, b) => a + b.value, 0) / weekendData.length).toFixed(1));
  }

  // Calculate previous week's average and trend
  if (prevWeekData.length > 0) {
    const prevValues = prevWeekData.map(d => d.value);
    stats.prevWeekAvg = parseFloat((prevValues.reduce((a, b) => a + b, 0) / prevValues.length).toFixed(1));
    stats.change = parseFloat((stats.weekAvg - stats.prevWeekAvg).toFixed(1));

    // Determine trend
    const threshold = 0.5;
    if (isPositiveMetric) {
      if (stats.change > threshold) stats.trend = 'improving';
      else if (stats.change < -threshold) stats.trend = 'declining';
    } else {
      if (stats.change < -threshold) stats.trend = 'improving';
      else if (stats.change > threshold) stats.trend = 'declining';
    }
  }

  return stats;
}

// =============================================================================
// HELPER: CALCULATE CORRELATION
// =============================================================================

function calculateCorrelation(data1, data2) {
  // Match data points by date
  const paired = [];
  data1.forEach(d1 => {
    const dateStr = d1.date.toISOString().split('T')[0];
    const match = data2.find(d2 => d2.date.toISOString().split('T')[0] === dateStr);
    if (match) {
      paired.push({ x: d1.value, y: match.value, date: d1.date });
    }
  });

  if (paired.length < 3) return null;

  // Pearson correlation coefficient
  const n = paired.length;
  const sumX = paired.reduce((a, b) => a + b.x, 0);
  const sumY = paired.reduce((a, b) => a + b.y, 0);
  const sumXY = paired.reduce((a, b) => a + b.x * b.y, 0);
  const sumX2 = paired.reduce((a, b) => a + b.x * b.x, 0);
  const sumY2 = paired.reduce((a, b) => a + b.y * b.y, 0);

  const numerator = n * sumXY - sumX * sumY;
  const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

  if (denominator === 0) return null;

  const coefficient = numerator / denominator;

  return {
    coefficient: parseFloat(coefficient.toFixed(2)),
    strength: Math.abs(coefficient) >= 0.7 ? 'strong' : Math.abs(coefficient) >= 0.4 ? 'moderate' : 'weak',
    direction: coefficient >= 0 ? 'positive' : 'negative',
    dataPoints: paired.length,
    examples: paired.slice(0, 5),
  };
}

// =============================================================================
// GENERATE: PATTERN ANALYSIS
// =============================================================================

async function generatePatternAnalysis(ctx) {
  const metrics = ['mood', 'anxiety', 'cravings', 'sleep', 'energy'];
  const analysis = {};

  for (const metric of metrics) {
    const thisWeekData = ctx.thisWeek.metrics[metric];
    const prevWeekData = ctx.prevWeek.metrics[metric];
    const stats = calculateMetricStats(thisWeekData, prevWeekData, metric);

    // Generate empty state if no data
    if (!stats.hasData) {
      analysis[metric] = {
        stats,
        isEmpty: true,
        cards: [
          {
            id: `${metric}_empty`,
            type: 'empty',
            title: `No ${metric.charAt(0).toUpperCase() + metric.slice(1)} Data`,
            message: `Start logging your daily ${metric} to see patterns and insights here.`,
            severity: 'info',
            icon: 'Info',
            cta: CTA_LIBRARY.ctas.find(c => c.id === 'log-morning-checkin'),
          },
        ],
      };
      continue;
    }

    // Generate 4 insight cards
    const cards = [];

    // Card 1: Primary (week-over-week change)
    let primaryTitle, primaryMessage, primarySeverity;
    if (stats.trend === 'improving') {
      primaryTitle = `${metric.charAt(0).toUpperCase() + metric.slice(1)} Improving`;
      primaryMessage = `Your ${metric} averaged ${stats.weekAvg}/10 this week${stats.prevWeekAvg ? `, up from ${stats.prevWeekAvg} last week` : ''}. Keep it up.`;
      primarySeverity = 'info';
    } else if (stats.trend === 'declining') {
      const isPositive = ['mood', 'sleep', 'energy'].includes(metric);
      primaryTitle = `${metric.charAt(0).toUpperCase() + metric.slice(1)} ${isPositive ? 'Dropped' : 'Increased'}`;
      primaryMessage = `Your ${metric} averaged ${stats.weekAvg}/10 this week${stats.prevWeekAvg ? `, ${isPositive ? 'down' : 'up'} from ${stats.prevWeekAvg} last week` : ''}. Let's look at what's going on.`;
      primarySeverity = 'warning';
    } else {
      primaryTitle = `${metric.charAt(0).toUpperCase() + metric.slice(1)} Steady`;
      primaryMessage = `Your ${metric} averaged ${stats.weekAvg}/10 this week - holding steady.`;
      primarySeverity = 'info';
    }

    cards.push({
      id: `${metric}_primary`,
      type: 'primary',
      title: primaryTitle,
      message: primaryMessage,
      severity: primarySeverity,
      icon: stats.trend === 'improving' ? 'TrendingUp' : stats.trend === 'declining' ? 'TrendingDown' : 'Minus',
    });

    // Card 2: Pattern (day-of-week insights)
    if (stats.bestDay && stats.worstDay && stats.bestDay !== stats.worstDay) {
      const isPositive = ['mood', 'sleep', 'energy'].includes(metric);
      cards.push({
        id: `${metric}_pattern`,
        type: 'pattern',
        title: `${stats.bestDay}s Are Best`,
        message: `Your ${metric} tends to be ${isPositive ? 'highest' : 'lowest'} on ${stats.bestDay}s (${stats.bestValue}/10) and ${isPositive ? 'lowest' : 'highest'} on ${stats.worstDay}s (${stats.worstValue}/10).`,
        severity: 'info',
        icon: 'Calendar',
      });
    }

    // Card 3: Weekday/Weekend pattern
    if (stats.weekdayAvg && stats.weekendAvg && Math.abs(stats.weekdayAvg - stats.weekendAvg) >= 1) {
      const weekdayBetter = ['mood', 'sleep', 'energy'].includes(metric)
        ? stats.weekdayAvg > stats.weekendAvg
        : stats.weekdayAvg < stats.weekendAvg;

      cards.push({
        id: `${metric}_weekday_weekend`,
        type: 'pattern',
        title: weekdayBetter ? 'Better on Weekdays' : 'Better on Weekends',
        message: `Weekday ${metric}: ${stats.weekdayAvg}/10. Weekend ${metric}: ${stats.weekendAvg}/10. ${weekdayBetter ? 'Weekends may need extra attention.' : 'Structure helps on weekdays.'}`,
        severity: 'info',
        icon: 'BarChart2',
      });
    }

    // Card 4: Action recommendation
    let actionTitle, actionMessage, actionCta;
    if (stats.trend === 'declining') {
      if (metric === 'mood') {
        actionTitle = 'Boost Your Mood';
        actionMessage = 'Try the Opposite Action technique - doing the opposite of what your mood urges can shift your state.';
        actionCta = CTA_LIBRARY.ctas.find(c => c.id === 'technique-opposite-action');
      } else if (metric === 'anxiety') {
        actionTitle = 'Calm Your Mind';
        actionMessage = 'Box breathing has helped you before. Try it for 2 minutes.';
        actionCta = CTA_LIBRARY.ctas.find(c => c.id === 'breathing-exercise');
      } else if (metric === 'cravings') {
        actionTitle = 'Manage Cravings';
        actionMessage = 'Urge surfing can help ride out craving waves without acting on them.';
        actionCta = CTA_LIBRARY.ctas.find(c => c.id === 'technique-urge-surfing');
      } else if (metric === 'sleep') {
        actionTitle = 'Improve Sleep';
        actionMessage = 'Try a body scan before bed - it helps release tension and quiet the mind.';
        actionCta = CTA_LIBRARY.ctas.find(c => c.id === 'sleep-guide');
      } else if (metric === 'energy') {
        actionTitle = 'Boost Energy';
        actionMessage = 'Check your basics: sleep, food, movement. The ABC PLEASE skill is designed for this.';
        actionCta = CTA_LIBRARY.ctas.find(c => c.id === 'view-resources');
      }
    } else {
      actionTitle = 'Keep It Going';
      actionMessage = `Your ${metric} is stable. Log check-ins consistently to spot patterns early.`;
      actionCta = CTA_LIBRARY.ctas.find(c => c.id === 'log-morning-checkin');
    }

    cards.push({
      id: `${metric}_action`,
      type: 'action',
      title: actionTitle,
      message: actionMessage,
      severity: stats.trend === 'declining' ? 'warning' : 'info',
      icon: 'Lightbulb',
      cta: actionCta,
    });

    analysis[metric] = {
      stats,
      isEmpty: false,
      cards,
    };
  }

  return analysis;
}

// =============================================================================
// GENERATE: CORRELATION AI TEXT
// =============================================================================

async function generateCorrelationAnalysis(ctx) {
  const correlations = [];
  const metrics = ctx.thisWeek.metrics;

  // Define correlation pairs to analyze
  const pairs = [
    { metric1: 'anxiety', metric2: 'cravings', label: 'Anxiety & Cravings' },
    { metric1: 'sleep', metric2: 'mood', label: 'Sleep & Mood' },
    { metric1: 'sleep', metric2: 'anxiety', label: 'Sleep & Anxiety' },
    { metric1: 'energy', metric2: 'mood', label: 'Energy & Mood' },
    { metric1: 'sleep', metric2: 'cravings', label: 'Sleep & Cravings' },
  ];

  for (const pair of pairs) {
    const data1 = metrics[pair.metric1];
    const data2 = metrics[pair.metric2];

    if (data1.length < 3 || data2.length < 3) continue;

    const corr = calculateCorrelation(data1, data2);
    if (!corr || Math.abs(corr.coefficient) < 0.3) continue;

    // Generate AI interpretation
    let aiInterpretation, actionableInsight, technique;

    if (pair.metric1 === 'anxiety' && pair.metric2 === 'cravings') {
      if (corr.direction === 'positive') {
        aiInterpretation = `For you, anxiety and cravings move together ${corr.strength}ly (${Math.round(Math.abs(corr.coefficient) * 100)}% correlation). When anxiety goes up, cravings tend to follow.`;
        actionableInsight = 'Catch the anxiety early with breathing exercises before cravings kick in.';
        technique = CTA_LIBRARY.ctas.find(c => c.id === 'breathing-exercise');
      } else {
        aiInterpretation = `Interestingly, your anxiety and cravings move in opposite directions. Higher anxiety correlates with lower cravings for you.`;
        actionableInsight = 'This is an uncommon pattern. Discuss it with your coach for personalized insight.';
        technique = CTA_LIBRARY.ctas.find(c => c.id === 'message-coach');
      }
    } else if (pair.metric1 === 'sleep' && pair.metric2 === 'mood') {
      if (corr.direction === 'positive') {
        aiInterpretation = `Your mood and sleep are ${corr.strength}ly connected (${Math.round(Math.abs(corr.coefficient) * 100)}%). Better sleep = better mood for you.`;
        actionableInsight = 'Protecting your sleep is protecting your recovery. Aim for 7-8 hours consistently.';
        technique = CTA_LIBRARY.ctas.find(c => c.id === 'sleep-guide');
      }
    } else if (pair.metric1 === 'sleep' && pair.metric2 === 'anxiety') {
      if (corr.direction === 'negative') {
        aiInterpretation = `Poor sleep and higher anxiety go hand-in-hand for you (${Math.round(Math.abs(corr.coefficient) * 100)}% inverse correlation).`;
        actionableInsight = 'On nights you sleep poorly, use grounding techniques early the next day.';
        technique = CTA_LIBRARY.ctas.find(c => c.id === 'grounding-exercise');
      }
    } else {
      aiInterpretation = `Your ${pair.label.toLowerCase()} show a ${corr.strength} ${corr.direction} correlation (${Math.round(Math.abs(corr.coefficient) * 100)}%).`;
      actionableInsight = 'Track both metrics consistently to understand this pattern better.';
      technique = CTA_LIBRARY.ctas.find(c => c.id === 'log-morning-checkin');
    }

    correlations.push({
      id: `${pair.metric1}_${pair.metric2}`,
      label: pair.label,
      metric1: pair.metric1,
      metric2: pair.metric2,
      coefficient: corr.coefficient,
      strength: corr.strength,
      direction: corr.direction,
      dataPoints: corr.dataPoints,
      examples: corr.examples,
      aiInterpretation,
      actionableInsight,
      cta: technique,
    });
  }

  return {
    correlations,
    isEmpty: correlations.length === 0,
    emptyMessage: correlations.length === 0
      ? 'Log more check-ins to discover how your metrics relate to each other.'
      : null,
  };
}

// =============================================================================
// GENERATE: REFLECTION THEMES
// =============================================================================

async function generateReflectionThemes(ctx) {
  const reflections = ctx.thisWeek.reflections;
  const gratitudes = ctx.thisWeek.gratitudes;

  // Use total counts from context (from aiContext document)
  const totalReflections = ctx.reflectionsTotalCount || reflections.length;
  const totalGratitudes = ctx.gratitudesTotalCount || gratitudes.length;

  // Empty state - only if no data at all (not just this week)
  if (reflections.length === 0 && gratitudes.length === 0 && totalReflections === 0 && totalGratitudes === 0) {
    return {
      isEmpty: true,
      totalReflections: 0,
      totalGratitudes: 0,
      cards: [
        {
          id: 'reflection_empty_1',
          type: 'onboarding',
          icon: 'FileText',
          iconColor: '#6b7280',
          title: 'No Reflections This Week',
          message: 'Evening reflections help process your day and spot patterns. Try writing for just 2 minutes tonight.',
          cta: CTA_LIBRARY.ctas.find(c => c.id === 'log-evening-reflection'),
        },
        {
          id: 'reflection_empty_2',
          type: 'onboarding',
          icon: 'HelpCircle',
          iconColor: '#3b82f6',
          title: 'What to Write About',
          message: 'What went well today? What was hard? What are you grateful for? Start simple.',
          cta: null,
        },
        {
          id: 'reflection_empty_3',
          type: 'onboarding',
          icon: 'Heart',
          iconColor: '#ef4444',
          title: 'Start with Gratitude',
          message: 'Can\'t think of what to write? Just name one small thing you\'re grateful for. That\'s enough.',
          cta: CTA_LIBRARY.ctas.find(c => c.id === 'add-gratitude'),
        },
        {
          id: 'reflection_empty_4',
          type: 'onboarding',
          icon: 'Brain',
          iconColor: '#8b5cf6',
          title: 'AI Gets Smarter With Data',
          message: 'The more you write, the better Beacon can identify themes and patterns unique to you.',
          cta: null,
        },
      ],
    };
  }

  // Extract themes from reflections
  const allText = [...reflections.map(r => r.text), ...gratitudes.map(g => g.text)].join(' ').toLowerCase();
  const cards = [];

  // Card 1: Dominant topic
  const topics = {
    work: /\b(work|job|boss|coworker|meeting|deadline|project|office|career|stress at work)\b/g,
    family: /\b(family|mom|dad|parent|sister|brother|child|kid|spouse|wife|husband|partner)\b/g,
    health: /\b(health|doctor|sleep|tired|energy|exercise|workout|gym|pain|sick)\b/g,
    recovery: /\b(recovery|sobriety|meeting|sponsor|craving|urge|relapse|aa|na|sober)\b/g,
    relationships: /\b(friend|relationship|lonely|connection|social|date|dating|love)\b/g,
    growth: /\b(learn|grow|better|progress|goal|accomplish|proud|achieve)\b/g,
  };

  let dominantTopic = null;
  let maxCount = 0;

  for (const [topic, regex] of Object.entries(topics)) {
    const matches = allText.match(regex);
    const count = matches ? matches.length : 0;
    if (count > maxCount) {
      maxCount = count;
      dominantTopic = topic;
    }
  }

  if (dominantTopic && maxCount >= 2) {
    const topicTitles = {
      work: 'Work on Your Mind',
      family: 'Family Focus',
      health: 'Health Awareness',
      recovery: 'Recovery-Centered',
      relationships: 'Connection Matters',
      growth: 'Growing Stronger',
    };

    cards.push({
      id: 'reflection_dominant',
      type: 'dominant_topic',
      icon: 'BookOpen',
      iconColor: '#3b82f6',
      title: topicTitles[dominantTopic],
      message: `${dominantTopic.charAt(0).toUpperCase() + dominantTopic.slice(1)} appeared ${maxCount} times in your reflections this week. It's clearly on your mind.`,
      basedOn: reflections.slice(0, 3).map(r => r.id),
      cta: null,
    });
  }

  // Card 2: Gratitude pattern
  if (gratitudes.length >= 2) {
    cards.push({
      id: 'reflection_gratitude',
      type: 'gratitude_pattern',
      icon: 'Heart',
      iconColor: '#ef4444',
      title: `${gratitudes.length} Gratitudes This Week`,
      message: gratitudes.length >= 5
        ? 'Strong gratitude practice! Research shows this rewires your brain for positivity over time.'
        : 'You\'re building the habit. Try to add one gratitude each evening.',
      basedOn: gratitudes.map(g => g.id),
      cta: CTA_LIBRARY.ctas.find(c => c.id === 'add-gratitude'),
    });
  }

  // Card 3: Timing insight
  const eveningReflections = reflections.filter(r => {
    const hour = r.date.getHours();
    return hour >= 18 || hour < 6;
  });

  if (reflections.length >= 3) {
    const eveningPct = Math.round((eveningReflections.length / reflections.length) * 100);
    cards.push({
      id: 'reflection_timing',
      type: 'timing_insight',
      icon: 'Clock',
      iconColor: '#f97316',
      title: eveningPct >= 70 ? 'Evening Reflector' : 'Varied Timing',
      message: eveningPct >= 70
        ? `${eveningPct}% of your reflections are in the evening. Great for processing the day.`
        : 'You reflect at different times. Find what works best for consistency.',
      basedOn: reflections.map(r => r.id),
      cta: null,
    });
  }

  // Card 4: Gap analysis
  const hasReflections = reflections.length > 0;
  const hasGratitudes = gratitudes.length > 0;

  if (hasReflections && !hasGratitudes) {
    cards.push({
      id: 'reflection_gap',
      type: 'gap_analysis',
      icon: 'AlertCircle',
      iconColor: '#eab308',
      title: 'Add Some Gratitude',
      message: 'You\'re reflecting but haven\'t logged gratitudes this week. Adding even one can shift your perspective.',
      basedOn: [],
      cta: CTA_LIBRARY.ctas.find(c => c.id === 'add-gratitude'),
    });
  } else if (!hasReflections && hasGratitudes) {
    cards.push({
      id: 'reflection_gap',
      type: 'gap_analysis',
      icon: 'AlertCircle',
      iconColor: '#eab308',
      title: 'Try a Full Reflection',
      message: 'You\'re logging gratitudes - great! Try adding a short reflection about what went well or what was hard.',
      basedOn: [],
      cta: CTA_LIBRARY.ctas.find(c => c.id === 'log-evening-reflection'),
    });
  }

  // Ensure we have at least one card
  if (cards.length === 0) {
    cards.push({
      id: 'reflection_keep_going',
      type: 'encouragement',
      icon: 'Sparkles',
      iconColor: '#22c55e',
      title: 'Keep Writing',
      message: `You logged ${reflections.length + gratitudes.length} entries this week. The AI is learning your patterns.`,
      basedOn: [],
      cta: CTA_LIBRARY.ctas.find(c => c.id === 'log-evening-reflection'),
    });
  }

  return {
    isEmpty: false,
    cards,
    totalReflections: reflections.length,
    totalGratitudes: gratitudes.length,
  };
}

// =============================================================================
// GENERATE: HABIT COACH
// =============================================================================

async function generateHabitCoach(ctx) {
  const habits = ctx.habits;
  const completions = ctx.habitCompletions;

  // Empty state
  if (habits.length === 0) {
    return {
      isEmpty: true,
      cards: [
        {
          id: 'habit_empty_1',
          type: 'onboarding',
          icon: 'Target',
          iconColor: '#6b7280',
          title: 'No Habits Tracked Yet',
          message: 'Habits are the foundation of lasting recovery. Start with just one small daily practice.',
          cta: CTA_LIBRARY.ctas.find(c => c.id === 'set-first-habit'),
        },
        {
          id: 'habit_empty_2',
          type: 'onboarding',
          icon: 'Lightbulb',
          iconColor: '#f97316',
          title: 'Popular Starting Habits',
          message: 'Morning gratitude, daily check-in, 10-minute walk, or evening reflection. Pick one that feels doable.',
          cta: CTA_LIBRARY.ctas.find(c => c.id === 'set-first-habit'),
        },
        {
          id: 'habit_empty_3',
          type: 'onboarding',
          icon: 'Award',
          iconColor: '#22c55e',
          title: 'Start Small',
          message: 'A 2-minute habit done daily beats a 30-minute habit done occasionally. Consistency is everything.',
          cta: null,
        },
      ],
    };
  }

  const cards = [];

  // Calculate completion rates for each habit (last 7 days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const habitStats = habits.map(habit => {
    const habitCompletions = completions.filter(c =>
      c.habitId === habit.id && new Date(c.completedAt) >= sevenDaysAgo
    );
    const weekdayCompletions = habitCompletions.filter(c => {
      const day = new Date(c.completedAt).getDay();
      return day >= 1 && day <= 5;
    });
    const weekendCompletions = habitCompletions.filter(c => {
      const day = new Date(c.completedAt).getDay();
      return day === 0 || day === 6;
    });

    return {
      ...habit,
      weekCompletions: habitCompletions.length,
      weekdayCompletions: weekdayCompletions.length,
      weekendCompletions: weekendCompletions.length,
      completionRate: Math.round((habitCompletions.length / 7) * 100),
    };
  });

  // Card 1: Working (strongest habit)
  const bestHabit = habitStats.reduce((best, curr) =>
    curr.completionRate > best.completionRate ? curr : best
  );

  if (bestHabit.completionRate > 0) {
    cards.push({
      id: 'habit_working',
      type: 'working',
      icon: 'CheckCircle',
      iconColor: '#22c55e',
      habitId: bestHabit.id,
      habitName: bestHabit.name,
      title: `${bestHabit.name} Is Working`,
      message: `${bestHabit.completionRate}% completion this week${bestHabit.streak ? ` (${bestHabit.streak} day streak)` : ''}. This one's sticking.`,
      cta: CTA_LIBRARY.ctas.find(c => c.id === 'open-habit-tracker'),
    });
  }

  // Card 2: Needs attention (struggling habit)
  const strugglingHabit = habitStats.find(h =>
    h.completionRate < 50 && h.completionRate > 0
  ) || habitStats.find(h => h.completionRate === 0 && (h.streak || 0) >= 3);

  if (strugglingHabit) {
    cards.push({
      id: 'habit_needs_attention',
      type: 'needs_attention',
      icon: 'AlertTriangle',
      iconColor: '#f97316',
      habitId: strugglingHabit.id,
      habitName: strugglingHabit.name,
      title: `${strugglingHabit.name} Needs Attention`,
      message: strugglingHabit.streak >= 3
        ? `Your ${strugglingHabit.streak}-day streak is at risk. Don't break the chain!`
        : `Only ${strugglingHabit.completionRate}% this week. Is this habit still right for you, or does it need adjusting?`,
      cta: CTA_LIBRARY.ctas.find(c => c.id === 'edit-habit'),
    });
  }

  // Card 3: Optimization (pattern-based tip)
  const weekdayHeavy = habitStats.some(h =>
    h.weekdayCompletions > h.weekendCompletions * 2
  );
  const weekendHeavy = habitStats.some(h =>
    h.weekendCompletions > h.weekdayCompletions * 2
  );

  if (weekdayHeavy) {
    cards.push({
      id: 'habit_optimization',
      type: 'optimization',
      icon: 'TrendingUp',
      iconColor: '#3b82f6',
      title: 'Weekend Habit Gap',
      message: 'Your habits are stronger on weekdays. Try lighter weekend versions to maintain momentum.',
      cta: CTA_LIBRARY.ctas.find(c => c.id === 'open-habit-tracker'),
    });
  } else if (weekendHeavy) {
    cards.push({
      id: 'habit_optimization',
      type: 'optimization',
      icon: 'TrendingUp',
      iconColor: '#3b82f6',
      title: 'Weekday Habit Gap',
      message: 'Weekdays are harder for habits. Try anchoring them to existing routines (after coffee, before bed).',
      cta: CTA_LIBRARY.ctas.find(c => c.id === 'open-habit-tracker'),
    });
  } else {
    // General optimization
    const avgCompletion = Math.round(habitStats.reduce((a, b) => a + b.completionRate, 0) / habitStats.length);
    cards.push({
      id: 'habit_optimization',
      type: 'optimization',
      icon: 'TrendingUp',
      iconColor: '#3b82f6',
      title: avgCompletion >= 70 ? 'Strong Habit Week' : 'Building Habits',
      message: avgCompletion >= 70
        ? `${avgCompletion}% average completion across ${habits.length} habits. Solid consistency.`
        : `${avgCompletion}% average completion. Focus on one habit at a time for best results.`,
      cta: CTA_LIBRARY.ctas.find(c => c.id === 'open-habit-tracker'),
    });
  }

  return {
    isEmpty: false,
    cards,
    habitCount: habits.length,
  };
}

// =============================================================================
// GENERATE: GOAL COACH
// =============================================================================

async function generateGoalCoach(ctx) {
  const goals = ctx.goals;
  const updates = ctx.goalUpdates;

  // Empty state
  if (goals.length === 0) {
    return {
      isEmpty: true,
      cards: [
        {
          id: 'goal_empty_1',
          type: 'onboarding',
          icon: 'Target',
          iconColor: '#6b7280',
          title: 'No Goals Set Yet',
          message: 'Goals give your recovery direction. What do you want to be different in 30 days?',
          cta: CTA_LIBRARY.ctas.find(c => c.id === 'set-first-goal'),
        },
        {
          id: 'goal_empty_2',
          type: 'onboarding',
          icon: 'Compass',
          iconColor: '#3b82f6',
          title: 'Goal Areas to Consider',
          message: 'Recovery, Health, Relationships, Career, Finance, Personal Growth. Pick one area to start.',
          cta: CTA_LIBRARY.ctas.find(c => c.id === 'set-first-goal'),
        },
        {
          id: 'goal_empty_3',
          type: 'onboarding',
          icon: 'CheckSquare',
          iconColor: '#22c55e',
          title: 'SMART Goals Work Best',
          message: 'Specific, Measurable, Achievable, Relevant, Time-bound. "Attend 2 meetings this week" beats "go to more meetings."',
          cta: null,
        },
        {
          id: 'goal_empty_4',
          type: 'onboarding',
          icon: 'MessageCircle',
          iconColor: '#8b5cf6',
          title: 'Set Goals With Your Coach',
          message: 'Your coach can help you set realistic goals aligned with your recovery plan.',
          cta: CTA_LIBRARY.ctas.find(c => c.id === 'message-coach'),
        },
      ],
    };
  }

  const cards = [];
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  // Calculate goal stats
  const goalStats = goals.map(goal => {
    const goalUpdates = updates.filter(u => u.goalId === goal.id);
    const recentUpdates = goalUpdates.filter(u =>
      u.createdAt?.toDate?.() >= sevenDaysAgo
    );
    const lastUpdate = goalUpdates.sort((a, b) =>
      (b.createdAt?.toDate?.() || 0) - (a.createdAt?.toDate?.() || 0)
    )[0];

    const daysSinceUpdate = lastUpdate?.createdAt?.toDate?.()
      ? Math.floor((new Date() - lastUpdate.createdAt.toDate()) / (1000 * 60 * 60 * 24))
      : 999;

    return {
      ...goal,
      recentUpdateCount: recentUpdates.length,
      daysSinceUpdate,
      progress: goal.progress || 0,
    };
  });

  // Card 1: Momentum (goals with recent progress)
  const goalsWithMomentum = goalStats.filter(g => g.recentUpdateCount > 0 && g.progress > 0);
  if (goalsWithMomentum.length > 0) {
    const best = goalsWithMomentum.reduce((a, b) => a.progress > b.progress ? a : b);
    cards.push({
      id: 'goal_momentum',
      type: 'momentum',
      icon: 'Zap',
      iconColor: '#22c55e',
      goalId: best.id,
      goalName: best.title,
      title: `${best.title} Has Momentum`,
      message: `${best.progress}% complete with ${best.recentUpdateCount} updates this week. Keep pushing.`,
      cta: CTA_LIBRARY.ctas.find(c => c.id === 'view-goal-detail'),
    });
  }

  // Card 2: Stalled (goals with no recent updates)
  const stalledGoals = goalStats.filter(g => g.daysSinceUpdate >= 7);
  if (stalledGoals.length > 0) {
    const stalled = stalledGoals[0];
    cards.push({
      id: 'goal_stalled',
      type: 'stalled',
      icon: 'Pause',
      iconColor: '#f97316',
      goalId: stalled.id,
      goalName: stalled.title,
      title: `${stalled.title} Needs Attention`,
      message: `No updates in ${stalled.daysSinceUpdate} days. Is this still a priority, or should we adjust it?`,
      cta: CTA_LIBRARY.ctas.find(c => c.id === 'view-goal-detail'),
    });
  }

  // Card 3: Milestone (goals near completion)
  const nearCompletion = goalStats.filter(g => g.progress >= 75 && g.progress < 100);
  if (nearCompletion.length > 0) {
    const close = nearCompletion[0];
    cards.push({
      id: 'goal_milestone',
      type: 'milestone',
      icon: 'Award',
      iconColor: '#eab308',
      goalId: close.id,
      goalName: close.title,
      title: `Almost There: ${close.title}`,
      message: `${close.progress}% complete! You're in the home stretch. What's the next small step?`,
      cta: CTA_LIBRARY.ctas.find(c => c.id === 'view-goal-detail'),
    });
  }

  // Card 4: Balance (goal area distribution)
  const areas = goals.reduce((acc, g) => {
    const area = g.area || 'general';
    acc[area] = (acc[area] || 0) + 1;
    return acc;
  }, {});

  const allAreas = ['recovery', 'health', 'relationships', 'career', 'finance', 'growth'];
  const coveredAreas = Object.keys(areas);
  const missingAreas = allAreas.filter(a => !coveredAreas.includes(a));

  if (missingAreas.length > 0 && goals.length >= 2) {
    cards.push({
      id: 'goal_balance',
      type: 'balance',
      icon: 'PieChart',
      iconColor: '#8b5cf6',
      title: 'Expand Your Goals',
      message: `You have goals in ${coveredAreas.length} areas. Consider adding one for ${missingAreas.slice(0, 2).join(' or ')}.`,
      cta: CTA_LIBRARY.ctas.find(c => c.id === 'set-first-goal'),
    });
  }

  // Ensure at least 2 cards
  if (cards.length < 2) {
    const totalProgress = Math.round(goalStats.reduce((a, b) => a + b.progress, 0) / goals.length);
    cards.push({
      id: 'goal_overview',
      type: 'overview',
      icon: 'Target',
      iconColor: '#3b82f6',
      title: `${goals.length} Active Goals`,
      message: `Average progress: ${totalProgress}%. Small steps every day add up to big changes.`,
      cta: CTA_LIBRARY.ctas.find(c => c.id === 'view-goals'),
    });
  }

  return {
    isEmpty: false,
    cards,
    goalCount: goals.length,
  };
}

// =============================================================================
// MAIN: GENERATE ALL WEEKLY CONTENT FOR ONE USER
// =============================================================================

async function generateWeeklyContentForUser(userId) {
  const weekId = getWeekId();
  const results = {
    userId,
    weekId,
    success: true,
    generated: {},
    errors: [],
  };

  try {
    // Build user context
    const ctx = await buildWeeklyContext(userId);
    if (!ctx) {
      results.success = false;
      results.errors.push('Failed to build user context');
      return results;
    }

    const weeklyInsightsRef = getDb().collection('users').doc(userId).collection('weeklyInsights');
    const now = admin.firestore.FieldValue.serverTimestamp();

    // 1. Generate Pattern Analysis
    try {
      const patterns = await generatePatternAnalysis(ctx);
      await weeklyInsightsRef.doc(`patterns_${weekId}`).set({
        type: 'patterns',
        weekId,
        analysis: patterns,
        generatedAt: now,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      });
      results.generated.patterns = true;
    } catch (error) {
      results.errors.push(`Patterns: ${error.message}`);
    }

    // 2. Generate Correlation Analysis
    try {
      const correlations = await generateCorrelationAnalysis(ctx);
      await weeklyInsightsRef.doc(`correlations_${weekId}`).set({
        type: 'correlations',
        weekId,
        ...correlations,
        generatedAt: now,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      });
      results.generated.correlations = true;
    } catch (error) {
      results.errors.push(`Correlations: ${error.message}`);
    }

    // 3. Generate Reflection Themes
    try {
      const reflections = await generateReflectionThemes(ctx);
      await weeklyInsightsRef.doc(`reflections_${weekId}`).set({
        type: 'reflections',
        weekId,
        ...reflections,
        generatedAt: now,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      });
      results.generated.reflections = true;
    } catch (error) {
      results.errors.push(`Reflections: ${error.message}`);
    }

    // 4. Generate Habit Coach
    try {
      const habits = await generateHabitCoach(ctx);
      await weeklyInsightsRef.doc(`habits_${weekId}`).set({
        type: 'habits',
        weekId,
        ...habits,
        generatedAt: now,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      });
      results.generated.habits = true;
    } catch (error) {
      results.errors.push(`Habits: ${error.message}`);
    }

    // 5. Generate Goal Coach
    try {
      const goals = await generateGoalCoach(ctx);
      await weeklyInsightsRef.doc(`goals_${weekId}`).set({
        type: 'goals',
        weekId,
        ...goals,
        generatedAt: now,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      });
      results.generated.goals = true;
    } catch (error) {
      results.errors.push(`Goals: ${error.message}`);
    }

    results.success = results.errors.length === 0;

  } catch (error) {
    results.success = false;
    results.errors.push(`General error: ${error.message}`);
  }

  return results;
}

// =============================================================================
// CLOUD FUNCTION: SCHEDULED WEEKLY GENERATION (Sunday 6 AM Pacific)
// =============================================================================

const generateWeeklyContent = functions
  .runWith({
    timeoutSeconds: 540, // 9 minutes
    memory: '512MB',
  })
  .pubsub.schedule('0 6 * * 0') // 6 AM every Sunday
  .timeZone('America/Los_Angeles')
  .onRun(async (context) => {
    console.log('Starting weekly AI content generation...');

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
          const result = await generateWeeklyContentForUser(userDoc.id);
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

      console.log(`Weekly content generation complete: ${results.successful} successful, ${results.failed} failed`);

      if (results.failed > 0) {
        console.error('Failed users:', JSON.stringify(results.errors, null, 2));
      }

      return null;
    } catch (error) {
      console.error('Fatal error in weekly content generation:', error);
      return null;
    }
  });

// =============================================================================
// CLOUD FUNCTION: MANUAL TRIGGER FOR TESTING
// =============================================================================

const generateWeeklyContentManual = functions
  .runWith({
    timeoutSeconds: 300,
    memory: '512MB',
  })
  .https.onCall(async (data, context) => {
    // Verify authentication
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'Must be logged in');
    }

    const userId = data.userId || context.auth.uid;

    console.log(`Manual weekly content generation for user: ${userId}`);

    const result = await generateWeeklyContentForUser(userId);

    return result;
  });

// =============================================================================
// EXPORTS
// =============================================================================

module.exports = {
  generateWeeklyContent,
  generateWeeklyContentManual,
  // Export for testing
  generateWeeklyContentForUser,
  buildWeeklyContext,
  generatePatternAnalysis,
  generateCorrelationAnalysis,
  generateReflectionThemes,
  generateHabitCoach,
  generateGoalCoach,
  getWeekId,
};
