/**
 * Card Prioritization System
 * Phase 9/Task 5.2: Dynamic Prompt Cards based on user context
 *
 * Prioritizes prompt cards based on:
 * - Craving level (high craving → show Challenge Support)
 * - Anxiety level (high anxiety → show Wellness Check)
 * - Sleep quality (poor sleep → show Sleep Analysis)
 * - Milestone proximity (approaching → show Progress Review)
 * - Habit performance (low completion → show Habit Coaching)
 */

import type { AIContext } from '@/lib/openai'

// =============================================================================
// TYPES
// =============================================================================

export interface CardPriority {
  cardId: string
  score: number
  reason: string
}

export interface PrioritizationResult {
  prioritizedCards: CardPriority[]
  hiddenCards: string[]
  highlights: Array<{
    cardId: string
    badge: string
    color: string
  }>
}

// =============================================================================
// CARD IDS (must match PromptCards.tsx)
// =============================================================================

const CARD_IDS = {
  WELLNESS: 'wellness',
  PATTERNS: 'patterns',
  ENCOURAGEMENT: 'encouragement',
  SLEEP: 'sleep',
  HABITS: 'habits',
  PROGRESS: 'progress',
  CHALLENGE: 'challenge',
  CUSTOM: 'custom',
} as const

// =============================================================================
// BASE PRIORITIES (default order)
// =============================================================================

const BASE_PRIORITIES: Record<string, number> = {
  [CARD_IDS.WELLNESS]: 50,
  [CARD_IDS.PATTERNS]: 45,
  [CARD_IDS.ENCOURAGEMENT]: 40,
  [CARD_IDS.SLEEP]: 35,
  [CARD_IDS.HABITS]: 30,
  [CARD_IDS.PROGRESS]: 25,
  [CARD_IDS.CHALLENGE]: 20,
  [CARD_IDS.CUSTOM]: 15, // Always last before hidden
}

// =============================================================================
// PRIORITY BOOST FUNCTIONS
// =============================================================================

/**
 * Boost Challenge Support card when craving is high
 */
function getCravingBoost(craving: number | undefined): CardPriority | null {
  if (craving === undefined) return null

  if (craving >= 7) {
    return {
      cardId: CARD_IDS.CHALLENGE,
      score: 100, // Highest priority
      reason: 'High craving detected',
    }
  }
  if (craving >= 5) {
    return {
      cardId: CARD_IDS.CHALLENGE,
      score: 80,
      reason: 'Moderate craving',
    }
  }
  return null
}

/**
 * Boost Wellness Check when anxiety is high
 */
function getAnxietyBoost(anxiety: number | undefined): CardPriority | null {
  if (anxiety === undefined) return null

  if (anxiety >= 7) {
    return {
      cardId: CARD_IDS.WELLNESS,
      score: 95,
      reason: 'High anxiety detected',
    }
  }
  if (anxiety >= 5) {
    return {
      cardId: CARD_IDS.WELLNESS,
      score: 75,
      reason: 'Moderate anxiety',
    }
  }
  return null
}

/**
 * Boost Sleep Analysis when sleep quality is poor
 */
function getSleepBoost(sleep: number | undefined): CardPriority | null {
  if (sleep === undefined) return null

  if (sleep <= 3) {
    return {
      cardId: CARD_IDS.SLEEP,
      score: 85,
      reason: 'Poor sleep reported',
    }
  }
  if (sleep <= 5) {
    return {
      cardId: CARD_IDS.SLEEP,
      score: 65,
      reason: 'Below average sleep',
    }
  }
  return null
}

/**
 * Boost Progress Review when milestone is approaching
 */
function getMilestoneBoost(daysToMilestone: number): CardPriority | null {
  if (daysToMilestone <= 1) {
    return {
      cardId: CARD_IDS.PROGRESS,
      score: 90,
      reason: 'Milestone tomorrow or today!',
    }
  }
  if (daysToMilestone <= 3) {
    return {
      cardId: CARD_IDS.PROGRESS,
      score: 70,
      reason: 'Milestone approaching',
    }
  }
  if (daysToMilestone <= 7) {
    return {
      cardId: CARD_IDS.PROGRESS,
      score: 55,
      reason: 'Milestone this week',
    }
  }
  return null
}

/**
 * Boost Habit Coaching when habit completion is low
 */
function getHabitBoost(completionRate: number): CardPriority | null {
  if (completionRate < 0.3) {
    return {
      cardId: CARD_IDS.HABITS,
      score: 75,
      reason: 'Low habit completion',
    }
  }
  if (completionRate < 0.5) {
    return {
      cardId: CARD_IDS.HABITS,
      score: 60,
      reason: 'Habits need attention',
    }
  }
  return null
}

/**
 * Boost Encouragement when mood is low
 */
function getMoodBoost(mood: number | undefined): CardPriority | null {
  if (mood === undefined) return null

  if (mood <= 3) {
    return {
      cardId: CARD_IDS.ENCOURAGEMENT,
      score: 85,
      reason: 'Low mood - need support',
    }
  }
  if (mood <= 5) {
    return {
      cardId: CARD_IDS.ENCOURAGEMENT,
      score: 60,
      reason: 'Could use encouragement',
    }
  }
  return null
}

/**
 * Boost Patterns when there's enough data for analysis
 */
function getPatternsBoost(checkInCount: number): CardPriority | null {
  if (checkInCount >= 7) {
    return {
      cardId: CARD_IDS.PATTERNS,
      score: 55,
      reason: 'Enough data for patterns',
    }
  }
  return null
}

// =============================================================================
// MAIN PRIORITIZATION FUNCTION
// =============================================================================

export function prioritizeCards(
  context: AIContext | null,
  maxCards: number = 6
): PrioritizationResult {
  // Default result when no context
  if (!context) {
    const defaultOrder = Object.entries(BASE_PRIORITIES)
      .sort((a, b) => b[1] - a[1])
      .slice(0, maxCards)
      .map(([cardId, score]) => ({
        cardId,
        score,
        reason: 'Default priority',
      }))

    return {
      prioritizedCards: defaultOrder,
      hiddenCards: [],
      highlights: [],
    }
  }

  // Extract values from context
  const todayMood = context.checkIns.today?.mood
  const todayAnxiety = context.checkIns.today?.anxiety
  const todayCraving = context.checkIns.today?.craving
  const todaySleep = context.checkIns.today?.sleep
  const daysToMilestone = context.context.daysToNextMilestone
  const habitCompletionRate = context.habits.completionRate
  const weekAvgMood = context.checkIns.weekAverage.mood

  // Start with base priorities
  const scores: Record<string, { score: number; reason: string }> = {}
  Object.entries(BASE_PRIORITIES).forEach(([cardId, score]) => {
    scores[cardId] = { score, reason: 'Base priority' }
  })

  // Collect highlights for UI badges
  const highlights: Array<{ cardId: string; badge: string; color: string }> = []

  // Apply boosts based on context
  const boosts = [
    getCravingBoost(todayCraving),
    getAnxietyBoost(todayAnxiety),
    getSleepBoost(todaySleep),
    getMilestoneBoost(daysToMilestone),
    getHabitBoost(habitCompletionRate),
    getMoodBoost(todayMood ?? weekAvgMood),
    getPatternsBoost(7), // Assume enough data if context exists
  ].filter((b): b is CardPriority => b !== null)

  // Apply boosts to scores
  boosts.forEach((boost) => {
    if (boost.score > scores[boost.cardId].score) {
      scores[boost.cardId] = { score: boost.score, reason: boost.reason }

      // Add highlight for high-priority boosts
      if (boost.score >= 75) {
        let badge = 'Suggested'
        let color = 'bg-violet-500/80'

        if (boost.cardId === CARD_IDS.CHALLENGE && boost.score >= 80) {
          badge = 'Urgent'
          color = 'bg-rose-500/80'
        } else if (boost.cardId === CARD_IDS.PROGRESS && boost.score >= 70) {
          badge = 'Milestone'
          color = 'bg-amber-500/80'
        } else if (boost.cardId === CARD_IDS.ENCOURAGEMENT && boost.score >= 80) {
          badge = 'For You'
          color = 'bg-emerald-500/80'
        }

        highlights.push({ cardId: boost.cardId, badge, color })
      }
    }
  })

  // Sort by score descending
  const sortedCards = Object.entries(scores)
    .sort((a, b) => b[1].score - a[1].score)
    .map(([cardId, { score, reason }]) => ({
      cardId,
      score,
      reason,
    }))

  // Ensure Custom card is always last in the visible cards
  const customCard = sortedCards.find((c) => c.cardId === CARD_IDS.CUSTOM)
  const otherCards = sortedCards.filter((c) => c.cardId !== CARD_IDS.CUSTOM)

  // Take top cards + custom
  const visibleOthers = otherCards.slice(0, maxCards - 1)
  const prioritizedCards = customCard
    ? [...visibleOthers, customCard]
    : visibleOthers

  // Hidden cards
  const hiddenCards = otherCards
    .slice(maxCards - 1)
    .map((c) => c.cardId)

  return {
    prioritizedCards,
    hiddenCards,
    highlights,
  }
}

// =============================================================================
// UTILITY: Get card highlight if any
// =============================================================================

export function getCardHighlight(
  cardId: string,
  highlights: PrioritizationResult['highlights']
): { badge: string; color: string } | null {
  return highlights.find((h) => h.cardId === cardId) || null
}

export default prioritizeCards
