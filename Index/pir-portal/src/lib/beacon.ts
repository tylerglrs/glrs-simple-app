/**
 * BEACON - Recovery AI Companion
 * Single source of truth for ALL AI in the GLRS Lighthouse app
 *
 * Version: 2.0.0
 * Last Updated: December 5, 2025
 *
 * This file exports the Beacon personality for frontend AI components.
 * See /functions/beacon/BEACON_PERSONALITY.md for full documentation.
 */

// =============================================================================
// TYPES
// =============================================================================

export type BeaconPromptType = 'general' | 'insight' | 'oracle' | 'summary' | 'anchor'

export interface MissingDataFlags {
  daysWithoutCheckIn: number
  lastCheckInDate?: string
  daysWithoutMeeting: number
  lastMeetingDate?: string
  lastMeetingName?: string
  habitsNotLoggedToday: boolean
  activeHabitCount: number
  activeHabitNames?: string[]
  noGratitudesThisWeek: boolean
  noReflectionsThisWeek: boolean
  lastReflectionDate?: string
}

// Technique Library Types
export type TechniqueCategory = 'grounding' | 'cognitive' | 'emotional' | 'behavioral' | 'physical' | 'social'
export type TechniqueTrigger = 'anxiety' | 'craving' | 'stress' | 'depression' | 'panic' | 'dissociation' | 'anger' | 'rumination' | 'isolation' | 'insomnia'

export interface Technique {
  id: string
  name: string
  category: TechniqueCategory
  triggers: TechniqueTrigger[]
  duration: string
  steps: string[]
  whyItWorks: string
  bestFor: string[]
  appLocation: string
}

// CTA Library Types
export type CTAActionType = 'navigate' | 'modal' | 'external' | 'function'
export type CTAPriority = 'critical' | 'high' | 'medium' | 'low'

export interface CTAAction {
  id: string
  label: string
  shortLabel: string
  action: CTAActionType
  target?: string
  scroll?: string
  modal?: string
  modalData?: Record<string, unknown>
  handler?: string
  icon: string
  contexts: string[]
  priority: CTAPriority
  limit?: number
}

// AI Insight Types
export type InsightType = 'daily_pattern' | 'weekly_pattern' | 'correlation' | 'encouragement' | 'proactive' | 'habit_coach' | 'goal_coach'

export interface AIInsight {
  id: string
  userId: string
  type: InsightType
  content: string
  cta?: CTAAction
  priority: CTAPriority
  category: string
  generatedAt: Date
  expiresAt: Date
  viewed: boolean
  dismissed: boolean
}

// =============================================================================
// CORE IDENTITY
// =============================================================================

export const BEACON_IDENTITY = `You are Beacon, an AI recovery companion for Guiding Light Recovery Services. You support people in recovery from substance use disorders - primarily veterans and first responders.

You are NOT a therapist or counselor. You are a supportive companion that helps users track their recovery, notice patterns, and stay connected to their goals. You work alongside their human coach (RADT/CADC counselor).`

// =============================================================================
// SPECIFICITY RULES
// =============================================================================

export const SPECIFICITY_RULES = `SPECIFICITY RULES (CRITICAL - FOLLOW THESE EXACTLY):

NEVER be generic. ALWAYS reference specific data from the context provided.

BAD (Generic) vs GOOD (Specific):
- BAD: "Your mood has been at a standstill"
  GOOD: "You haven't logged a check-in since Tuesday, Nov 26. Your last mood was 6 with a note about work stress."

- BAD: "Consider tracking your habits"
  GOOD: "You have 3 active habits but haven't logged any completions this week. Tap the hamburger menu next to Overview to open your habit tracker."

- BAD: "Keep up the good work"
  GOOD: "Day 58 - you've now made it past that Day 45 wall. Your mood average this week is 6.8, up from 5.2 last week."

Every insight MUST include at least one of:
- Specific date ("since Tuesday, Nov 26")
- Specific number ("6/7 check-ins", "mood of 7")
- Specific name ("Morning Meditation habit")
- Specific trend ("up from 5.2 last week")
- Specific app location ("tap Tasks tab")`

// =============================================================================
// ZERO/NULL HANDLING
// =============================================================================

export const ZERO_NULL_HANDLING = `When Data is Zero/Null/Missing:

Zero/null data means INCOMPLETE ACTIONS, not "standstill" or silence.

| Data State | What to Say |
|------------|-------------|
| No check-in today | "I don't see a check-in for today yet. Tap the Tasks tab to log one now." |
| No check-in in 3+ days | "Your last check-in was [DATE]. When we go quiet, it's often when things are hardest. What's been going on?" |
| Zero habits set up | "You haven't set up any habits yet. Tap the hamburger menu next to Overview to add your first one." |
| Habits exist but none logged | "You have [X] active habits ([names]) but haven't logged any today." |
| No meetings this week | "No meetings logged this week. The Meetings tab has 4,000+ AA/NA options near you." |
| No reflections | "Your last reflection was [DATE]. Tap Tasks and scroll to Evening Check-in when ready." |

NEVER say: "at a standstill", "consider", "you might want to"
ALWAYS say: specific dates, specific actions, specific app locations`

// =============================================================================
// APP NAVIGATION
// =============================================================================

export const APP_NAVIGATION = `App Navigation (be SPECIFIC about where to go):

| Feature | Exact Location |
|---------|----------------|
| Morning Check-in | Tasks tab - Check-in cards at top |
| Evening Check-in | Tasks tab - Evening Reflection card |
| Habit Tracker | Hamburger menu on left of Overview tab button |
| Goals/Objectives | Tasks tab - scroll to Golden Thread section |
| AI Insights Dashboard | Tasks tab - tap "AI Insights" button (brain icon) |
| Browse Meetings | Meetings tab - 4,000+ AA/NA meetings searchable |
| Community Posts | Connect tab - My Day section |
| Message Coach | Connect tab - Messages section |
| Crisis Toolkit | Guides tab - Crisis Toolkit category |
| Sobriety Counter | Journey tab - large counter at top |

Navigation phrases to use:
- "Tap the Tasks tab, then scroll to..."
- "Open the hamburger menu next to Overview..."
- "In the Meetings tab, search for..."`

// =============================================================================
// RESPONSE STRUCTURE
// =============================================================================

export const RESPONSE_STRUCTURE = `Response Structure - Every response should include:

1. ACKNOWLEDGE - What I notice from their data (with specific numbers/dates)
2. CONNECT - How it relates to their journey/patterns
3. GUIDE - Specific next action with exact app location

Keep responses to 2-4 sentences unless more detail is needed.`

// =============================================================================
// PROHIBITIONS
// =============================================================================

export const PROHIBITIONS = `What NOT to do:
- Don't diagnose or provide medical advice
- Don't use "clean/dirty" language
- Don't be preachy ("You really should...")
- Don't say "at a standstill"
- Don't say "consider" - say "tap [location] to..."
- Don't use excessive exclamation points
- Don't reference data you don't have`

// =============================================================================
// COMBINED PROMPTS
// =============================================================================

export const BEACON_SYSTEM_PROMPT = `${BEACON_IDENTITY}

${SPECIFICITY_RULES}

${ZERO_NULL_HANDLING}

${APP_NAVIGATION}

${RESPONSE_STRUCTURE}

${PROHIBITIONS}`

export const BEACON_INSIGHT_PROMPT = `${BEACON_IDENTITY}

${SPECIFICITY_RULES}

${ZERO_NULL_HANDLING}

${RESPONSE_STRUCTURE}

${PROHIBITIONS}

Keep responses to 2-4 sentences. Be specific with dates, numbers, and app locations.`

export const BEACON_ORACLE_PROMPT = `${BEACON_IDENTITY}

You are providing a daily oracle - one personalized insight for today.

${SPECIFICITY_RULES}

Guidelines:
- Be warm, supportive, and encouraging
- Reference their specific progress (sobriety days, patterns, recent wins)
- Provide actionable wisdom they can apply today
- Keep it to 2-3 sentences maximum
- Include a specific app location if relevant

Do NOT include generic platitudes or over-the-top enthusiasm.`

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Build a description of what's missing/incomplete for AI context
 */
export function buildMissingDataDescription(flags: MissingDataFlags): string {
  const parts: string[] = []

  if (flags.daysWithoutCheckIn > 0) {
    if (flags.daysWithoutCheckIn === 1) {
      parts.push(`No check-in today yet.`)
    } else if (flags.daysWithoutCheckIn <= 3) {
      parts.push(`No check-in in ${flags.daysWithoutCheckIn} days${flags.lastCheckInDate ? ` (last: ${flags.lastCheckInDate})` : ''}.`)
    } else {
      parts.push(`No check-in in ${flags.daysWithoutCheckIn} days${flags.lastCheckInDate ? ` - last was ${flags.lastCheckInDate}` : ''}. When we go quiet, it's often when things are hardest.`)
    }
  }

  if (flags.daysWithoutMeeting > 7) {
    parts.push(`No meetings logged in ${flags.daysWithoutMeeting} days${flags.lastMeetingName ? ` (last: ${flags.lastMeetingName} on ${flags.lastMeetingDate})` : ''}.`)
  }

  if (flags.habitsNotLoggedToday && flags.activeHabitCount > 0) {
    const habitNames = flags.activeHabitNames?.slice(0, 3).join(', ') || `${flags.activeHabitCount} habits`
    parts.push(`Active habits (${habitNames}) not logged today.`)
  }

  if (flags.noGratitudesThisWeek) {
    parts.push(`No gratitude entries this week.`)
  }

  if (flags.noReflectionsThisWeek) {
    parts.push(`No reflections this week${flags.lastReflectionDate ? ` (last: ${flags.lastReflectionDate})` : ''}.`)
  }

  return parts.join(' ')
}

/**
 * Get the appropriate system prompt based on use case
 */
export function getBeaconPrompt(type: BeaconPromptType = 'general'): string {
  switch (type) {
    case 'insight':
      return BEACON_INSIGHT_PROMPT
    case 'oracle':
      return BEACON_ORACLE_PROMPT
    case 'general':
    default:
      return BEACON_SYSTEM_PROMPT
  }
}

/**
 * Format a date for display in AI context
 */
export function formatDateForAI(date: Date | null | undefined): string {
  if (!date) return 'unknown'
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
}

/**
 * Calculate days since a date
 */
export function daysSince(date: Date | null | undefined): number {
  if (!date) return -1
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const target = new Date(date)
  target.setHours(0, 0, 0, 0)
  return Math.floor((now.getTime() - target.getTime()) / (1000 * 60 * 60 * 24))
}

// =============================================================================
// TECHNIQUE SELECTION HELPERS
// =============================================================================

/**
 * Recommended techniques based on user state
 */
export const TECHNIQUE_RECOMMENDATIONS: Record<string, string[]> = {
  'high-craving': ['urge-surfing', 'ice-cube-technique', 'tipp-skills', 'play-the-tape'],
  'high-anxiety': ['box-breathing', '54321-grounding', 'progressive-muscle-relaxation', 'safe-place-visualization'],
  'low-mood': ['opposite-action', 'behavioral-activation', 'gratitude-practice', 'connection-call'],
  'sleep-issues': ['body-scan', 'progressive-muscle-relaxation', 'safe-place-visualization'],
  'rumination': ['thought-defusion', 'leaves-on-stream', 'check-the-facts', 'mindful-walking'],
  'isolation': ['connection-call', 'dear-man', 'community-connect'],
  'crisis': ['tipp-skills', 'stop-skill', 'ice-cube-technique', 'box-breathing'],
}

/**
 * Get recommended technique IDs based on user context
 */
export function getRecommendedTechniques(context: {
  craving?: number
  anxiety?: number
  mood?: number
  sleep?: number
  isCrisis?: boolean
  isIsolated?: boolean
}): string[] {
  const recommendations: string[] = []

  if (context.isCrisis) {
    recommendations.push(...TECHNIQUE_RECOMMENDATIONS['crisis'])
  }

  if (context.craving && context.craving >= 7) {
    recommendations.push(...TECHNIQUE_RECOMMENDATIONS['high-craving'])
  }

  if (context.anxiety && context.anxiety >= 7) {
    recommendations.push(...TECHNIQUE_RECOMMENDATIONS['high-anxiety'])
  }

  if (context.mood && context.mood <= 4) {
    recommendations.push(...TECHNIQUE_RECOMMENDATIONS['low-mood'])
  }

  if (context.sleep && context.sleep <= 4) {
    recommendations.push(...TECHNIQUE_RECOMMENDATIONS['sleep-issues'])
  }

  if (context.isIsolated) {
    recommendations.push(...TECHNIQUE_RECOMMENDATIONS['isolation'])
  }

  // Remove duplicates and return
  return [...new Set(recommendations)]
}

// =============================================================================
// CTA SELECTION HELPERS
// =============================================================================

/**
 * CTA context to ID mappings
 */
export const CTA_CONTEXT_MAP: Record<string, string> = {
  'no-checkin-today': 'log-morning-checkin',
  'no-reflection-today': 'log-evening-reflection',
  'habits-not-logged': 'open-habit-tracker',
  'no-meetings-week': 'browse-meetings',
  'high-craving': 'open-crisis-toolkit',
  'concerning-pattern': 'message-coach',
  'milestone-achieved': 'view-journey',
  'crisis-detected': 'call-988',
}

/**
 * Get recommended CTA ID based on context
 */
export function getRecommendedCTA(contextFlags: string[]): string | null {
  // Priority order: crisis first, then high-priority items
  const priorityOrder = [
    'crisis-detected',
    'high-craving',
    'concerning-pattern',
    'no-checkin-today',
    'no-reflection-today',
    'habits-not-logged',
    'no-meetings-week',
    'milestone-achieved',
  ]

  for (const context of priorityOrder) {
    if (contextFlags.includes(context)) {
      return CTA_CONTEXT_MAP[context] || null
    }
  }

  return null
}

// =============================================================================
// RATE LIMITS
// =============================================================================

export const AI_RATE_LIMITS = {
  promptCardsPerDay: 3,
  anchorMessagesPerDay: 20,
  oracleRegeneratesPerDay: 1,
}

/**
 * Check if user can use a prompt card
 */
export function canUsePromptCard(usedToday: number): boolean {
  return usedToday < AI_RATE_LIMITS.promptCardsPerDay
}

/**
 * Check if user can send Anchor message
 */
export function canSendAnchorMessage(sentToday: number): boolean {
  return sentToday < AI_RATE_LIMITS.anchorMessagesPerDay
}

/**
 * Get remaining uses for AI features
 */
export function getRemainingUses(usedToday: { promptCards: number; anchorMessages: number; oracleRegenerated: boolean }): {
  promptCards: number
  anchorMessages: number
  oracleRegenerate: number
} {
  return {
    promptCards: Math.max(0, AI_RATE_LIMITS.promptCardsPerDay - usedToday.promptCards),
    anchorMessages: Math.max(0, AI_RATE_LIMITS.anchorMessagesPerDay - usedToday.anchorMessages),
    oracleRegenerate: usedToday.oracleRegenerated ? 0 : 1,
  }
}
