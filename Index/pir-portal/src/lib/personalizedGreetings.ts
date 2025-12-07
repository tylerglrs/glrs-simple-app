/**
 * Personalized Greeting System
 * Phase 9/Task 5.1: Context-aware greetings for Anchor companion
 *
 * Generates personalized greetings based on:
 * - Time of day
 * - Milestone proximity
 * - Today's mood/state
 * - Check-in streak status
 * - Recovery day count
 */

import type { AIContext } from '@/lib/openai'

// =============================================================================
// TYPES
// =============================================================================

export interface GreetingResult {
  /** Primary greeting (e.g., "Good morning, Sarah") */
  greeting: string
  /** Contextual message (e.g., "5 days until your 90-day milestone!") */
  message: string
  /** Accent color/emoji hint for UI */
  accent: 'celebration' | 'encouragement' | 'calm' | 'warmth' | 'focus'
  /** Priority of the message type */
  priority: number
}

interface GreetingContext {
  firstName: string
  sobrietyDays: number
  daysToNextMilestone: number
  currentStreak: number
  streakAtRisk: boolean
  todayMood: number | null
  todayAnxiety: number | null
  todayCraving: number | null
  isWeekend: boolean
}

// =============================================================================
// MILESTONE DEFINITIONS
// =============================================================================

const MILESTONES = [
  { days: 1, label: 'first day' },
  { days: 7, label: '1 week' },
  { days: 14, label: '2 weeks' },
  { days: 30, label: '1 month' },
  { days: 60, label: '2 months' },
  { days: 90, label: '90 days' },
  { days: 180, label: '6 months' },
  { days: 365, label: '1 year' },
  { days: 730, label: '2 years' },
  { days: 1095, label: '3 years' },
  { days: 1825, label: '5 years' },
]

// =============================================================================
// TIME-BASED GREETINGS
// =============================================================================

function getTimeGreeting(): { greeting: string; period: 'morning' | 'afternoon' | 'evening' | 'night' } {
  const hour = new Date().getHours()

  if (hour >= 5 && hour < 12) {
    return { greeting: 'Good morning', period: 'morning' }
  } else if (hour >= 12 && hour < 17) {
    return { greeting: 'Good afternoon', period: 'afternoon' }
  } else if (hour >= 17 && hour < 21) {
    return { greeting: 'Good evening', period: 'evening' }
  } else {
    return { greeting: 'Good night', period: 'night' }
  }
}

// =============================================================================
// MILESTONE MESSAGES
// =============================================================================

function getMilestoneMessage(sobrietyDays: number, daysToNext: number): GreetingResult | null {
  // Check if TODAY is a milestone
  const todayMilestone = MILESTONES.find(m => m.days === sobrietyDays)
  if (todayMilestone) {
    return {
      greeting: getTimeGreeting().greeting,
      message: `Today marks ${todayMilestone.label}! This is a major achievement.`,
      accent: 'celebration',
      priority: 100, // Highest priority
    }
  }

  // Check if milestone is approaching (within 3 days)
  if (daysToNext <= 3 && daysToNext > 0) {
    const nextMilestone = MILESTONES.find(m => m.days === sobrietyDays + daysToNext)
    if (nextMilestone) {
      const daysWord = daysToNext === 1 ? 'day' : 'days'
      return {
        greeting: getTimeGreeting().greeting,
        message: `${daysToNext} ${daysWord} until your ${nextMilestone.label} milestone!`,
        accent: 'encouragement',
        priority: 90,
      }
    }
  }

  // Check for significant day numbers
  if (sobrietyDays % 100 === 0 && sobrietyDays > 0) {
    return {
      greeting: getTimeGreeting().greeting,
      message: `Day ${sobrietyDays}! What an incredible number.`,
      accent: 'celebration',
      priority: 85,
    }
  }

  return null
}

// =============================================================================
// STREAK MESSAGES
// =============================================================================

function getStreakMessage(streak: number, atRisk: boolean, firstName: string): GreetingResult | null {
  const { greeting } = getTimeGreeting()

  // Streak at risk - encourage check-in
  if (atRisk) {
    return {
      greeting,
      message: `Your ${streak}-day check-in streak is at risk. Let's keep it going!`,
      accent: 'focus',
      priority: 80,
    }
  }

  // Celebrate streak milestones
  if (streak === 7) {
    return {
      greeting,
      message: `A full week of check-ins! Consistency is key, ${firstName}.`,
      accent: 'celebration',
      priority: 75,
    }
  }

  if (streak === 30) {
    return {
      greeting,
      message: `30 days of daily check-ins! Your commitment is inspiring.`,
      accent: 'celebration',
      priority: 75,
    }
  }

  if (streak > 0 && streak % 7 === 0 && streak < 30) {
    return {
      greeting,
      message: `${streak} days of consistent check-ins. Keep building that habit!`,
      accent: 'encouragement',
      priority: 60,
    }
  }

  return null
}

// =============================================================================
// MOOD-BASED MESSAGES
// =============================================================================

function getMoodMessage(mood: number | null, anxiety: number | null, craving: number | null): GreetingResult | null {
  const { greeting } = getTimeGreeting()

  // No check-in yet today
  if (mood === null) {
    return null
  }

  // Struggling (mood <= 3)
  if (mood <= 3) {
    return {
      greeting,
      message: "I see you're having a tough day. I'm here to support you.",
      accent: 'warmth',
      priority: 70,
    }
  }

  // High craving (>= 7)
  if (craving !== null && craving >= 7) {
    return {
      greeting,
      message: "I notice cravings are high today. Let's work through this together.",
      accent: 'focus',
      priority: 70,
    }
  }

  // High anxiety (>= 7)
  if (anxiety !== null && anxiety >= 7) {
    return {
      greeting,
      message: "Feeling anxious today? Take a breath. We'll get through it.",
      accent: 'calm',
      priority: 65,
    }
  }

  // Great mood (>= 8)
  if (mood >= 8) {
    return {
      greeting,
      message: "You're feeling great today! Let's capture this positive energy.",
      accent: 'celebration',
      priority: 50,
    }
  }

  return null
}

// =============================================================================
// WEEKEND MESSAGES
// =============================================================================

function getWeekendMessage(isWeekend: boolean): GreetingResult | null {
  if (!isWeekend) return null

  const { greeting, period } = getTimeGreeting()

  if (period === 'morning') {
    return {
      greeting,
      message: "Weekend mornings are for self-care. How can I support you today?",
      accent: 'calm',
      priority: 30,
    }
  }

  return null
}

// =============================================================================
// DEFAULT MESSAGES
// =============================================================================

function getDefaultMessage(sobrietyDays: number, firstName: string): GreetingResult {
  const { greeting, period } = getTimeGreeting()

  const messages = {
    morning: [
      `Day ${sobrietyDays} begins. You've got this, ${firstName}.`,
      `Another day of strength. How can I help you, ${firstName}?`,
      `A new day, a new opportunity. What's on your mind?`,
    ],
    afternoon: [
      `How's your day going, ${firstName}?`,
      `Afternoon check-in. Anything you'd like to talk about?`,
      `Day ${sobrietyDays} continues. I'm here when you need me.`,
    ],
    evening: [
      `Winding down, ${firstName}? Let's reflect on your day.`,
      `Evening time. How has day ${sobrietyDays} been?`,
      `The day is almost done. You made it, ${firstName}.`,
    ],
    night: [
      `Night owl, ${firstName}? I'm here if you need to talk.`,
      `Rest well tonight. You've earned it.`,
      `Before you sleep, know that you're doing great.`,
    ],
  }

  const periodMessages = messages[period]
  const randomMessage = periodMessages[Math.floor(Math.random() * periodMessages.length)]

  return {
    greeting,
    message: randomMessage,
    accent: 'warmth',
    priority: 10,
  }
}

// =============================================================================
// MAIN FUNCTION
// =============================================================================

export function generateGreeting(context: AIContext | null): GreetingResult {
  // Handle null context
  if (!context) {
    const { greeting } = getTimeGreeting()
    return {
      greeting,
      message: "I'm here to support your recovery journey.",
      accent: 'warmth',
      priority: 0,
    }
  }

  // Build greeting context from AIContext
  const greetingContext: GreetingContext = {
    firstName: context.user.firstName,
    sobrietyDays: context.user.sobrietyDays,
    daysToNextMilestone: context.context.daysToNextMilestone,
    currentStreak: context.context.currentStreak,
    streakAtRisk: context.context.streakAtRisk,
    todayMood: context.checkIns.today?.mood ?? null,
    todayAnxiety: context.checkIns.today?.anxiety ?? null,
    todayCraving: context.checkIns.today?.craving ?? null,
    isWeekend: context.context.isWeekend,
  }

  // Collect all possible messages
  const candidates: GreetingResult[] = []

  // Milestone message (highest priority)
  const milestoneMsg = getMilestoneMessage(
    greetingContext.sobrietyDays,
    greetingContext.daysToNextMilestone
  )
  if (milestoneMsg) candidates.push(milestoneMsg)

  // Streak message
  const streakMsg = getStreakMessage(
    greetingContext.currentStreak,
    greetingContext.streakAtRisk,
    greetingContext.firstName
  )
  if (streakMsg) candidates.push(streakMsg)

  // Mood-based message
  const moodMsg = getMoodMessage(
    greetingContext.todayMood,
    greetingContext.todayAnxiety,
    greetingContext.todayCraving
  )
  if (moodMsg) candidates.push(moodMsg)

  // Weekend message
  const weekendMsg = getWeekendMessage(greetingContext.isWeekend)
  if (weekendMsg) candidates.push(weekendMsg)

  // If we have candidates, return the highest priority one
  if (candidates.length > 0) {
    candidates.sort((a, b) => b.priority - a.priority)
    const winner = candidates[0]
    // Add firstName to greeting if not already there
    winner.greeting = `${winner.greeting}, ${greetingContext.firstName}`
    return winner
  }

  // Fall back to default
  const defaultMsg = getDefaultMessage(greetingContext.sobrietyDays, greetingContext.firstName)
  defaultMsg.greeting = `${defaultMsg.greeting}, ${greetingContext.firstName}`
  return defaultMsg
}

// =============================================================================
// ACCENT TO UI MAPPING
// =============================================================================

export const ACCENT_STYLES = {
  celebration: {
    gradient: 'from-amber-500/30 via-yellow-500/20 to-orange-500/30',
    icon: 'sparkles',
    iconColor: 'text-amber-400',
  },
  encouragement: {
    gradient: 'from-emerald-500/30 via-teal-500/20 to-cyan-500/30',
    icon: 'trending-up',
    iconColor: 'text-emerald-400',
  },
  calm: {
    gradient: 'from-blue-500/30 via-indigo-500/20 to-purple-500/30',
    icon: 'wind',
    iconColor: 'text-blue-400',
  },
  warmth: {
    gradient: 'from-rose-500/30 via-pink-500/20 to-fuchsia-500/30',
    icon: 'heart',
    iconColor: 'text-rose-400',
  },
  focus: {
    gradient: 'from-violet-500/30 via-purple-500/20 to-indigo-500/30',
    icon: 'target',
    iconColor: 'text-violet-400',
  },
} as const

export default generateGreeting
