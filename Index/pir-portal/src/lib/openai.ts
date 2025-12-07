/**
 * OpenAI Configuration for AI Insights Hub
 * Phase 7B: Client-side configuration (API calls go through Firebase Functions)
 * Phase 8B: Added SAFETY_PREFIX to all system prompts
 * Phase 6.3: Integrated Beacon personality system
 *
 * SECURITY: API key is NEVER exposed to client. All calls proxy through Firebase Functions.
 */

// Phase 6.3: Import Beacon personality prompts
import {
  SPECIFICITY_RULES,
  ZERO_NULL_HANDLING,
  BEACON_ORACLE_PROMPT,
  PROHIBITIONS,
} from './beacon'

// OpenAI model configuration
export const OPENAI_CONFIG = {
  // Primary insight generation
  chat: {
    model: 'gpt-4o-mini' as const,
    maxTokens: 500,
    temperature: 0.7,
  },

  // Voice input (Whisper)
  whisper: {
    model: 'whisper-1' as const,
    responseFormat: 'json' as const,
    language: 'en',
  },

  // Voice output (TTS)
  tts: {
    model: 'tts-1' as const,
    voice: 'alloy' as const, // warm, supportive tone
    responseFormat: 'mp3' as const,
    speed: 1.0,
  },

  // Thread persistence for Anchor tab (Assistants API)
  assistants: {
    model: 'gpt-4o-mini' as const,
    maxThreadMessages: 50, // Control costs
  },
} as const

// =============================================================================
// PHASE 9: OPTIMIZED SAFETY SYSTEM
// Task 2.1: Reduced from ~400 tokens to ~100 tokens per message
// Full safety rules are in assistant base instructions (set once)
// =============================================================================

// CONDENSED safety reminder for per-message use (~100 tokens)
export const SAFETY_REMINDER = `SAFETY: You're a supportive AI, not a therapist. If user mentions crisis (suicide, self-harm, overdose, abuse), respond: "I'm concerned. Please call 988 or text HOME to 741741. Your coach has been notified." Never minimize feelings, diagnose, or advise on medications.`

// FULL safety prefix - only used when creating new assistants or threads
export const SAFETY_PREFIX_FULL = `CRITICAL SAFETY RULES:

1. AI LIMITATIONS: You are an AI assistant, not a licensed therapist. You cannot provide crisis intervention, diagnosis, or medical advice.

2. CRISIS RESPONSE: If user mentions suicide, self-harm, overdose, or abuse, respond with:
"I'm really concerned about what you've shared. Please reach out now:
- 988 Suicide & Crisis Lifeline (call or text 988)
- Crisis Text Line (text HOME to 741741)
- 911 for emergencies
Your coach has been notified."

3. NEVER: Provide self-harm methods, minimize despair, say "just" do something, diagnose conditions, advise on medications, promise confidentiality.

4. ALWAYS: Validate feelings first, encourage professional support, remind of progress and support system.`

// =============================================================================
// PHASE 9: THERAPEUTIC RESPONSE PATTERNS
// Tasks 2.4-2.6: Industry-standard therapeutic AI techniques
// =============================================================================

const EMOTION_MIRRORING = `
EMOTION MIRRORING (ALWAYS DO FIRST):
If user expresses emotion, your FIRST sentence must acknowledge it before anything else.
- "I'm frustrated" → First: "That frustration makes sense." NOT: "Here are tips..."
- "I hit 30 days!" → First: "Thirty days! That's a real milestone." NOT: "Great, here's what's next..."
- "I almost relapsed" → First: "That sounds like a really hard night." NOT: "Here's what to do..."
`

const THERAPEUTIC_TECHNIQUES = `
THERAPEUTIC TECHNIQUES (use naturally, never label them):

VALIDATION FIRST:
- Before advice, acknowledge: "That sounds really difficult"
- Mirror emotions: "It sounds like you're feeling frustrated"
- Normalize: "A lot of people in recovery experience this"

COGNITIVE REFRAMES (for negative thoughts):
- Gently explore: "What makes you think that?"
- Offer reframe: "Another way to look at it might be..."
- Avoid: lecturing, dismissing, toxic positivity

CRAVING SUPPORT:
- HALT check: "Sometimes cravings spike when we're Hungry, Angry, Lonely, or Tired. Any of those true right now?"
- Reference past: "Last time you mentioned [X] helped"
- Normalize: "Cravings are part of recovery. They pass."

DISTRESS MOMENTS:
- Don't rush to fix
- Sit with them: "I'm here with you"
- Ask what they need: "Would it help to talk this through, or would you rather focus on something grounding?"
`

const RECOVERY_PATTERNS = `
RECOVERY-SPECIFIC RESPONSES:

ON RELAPSE:
- Lead with compassion, never judgment
- "Relapse can be part of recovery. What matters is you're here now."
- Focus on safety first, then next steps
- Never shame

ON CRAVINGS:
- Normalize: "Cravings are your brain doing what brains do"
- Time-limit: "This feeling will pass, usually within 15-20 minutes"
- Redirect: "What's one small thing you can do right now?"

ON MILESTONES:
- Be specific about the number: "1,035 days. Almost 3 years of choosing yourself."
- Reference their journey if known
- Never generic "congrats!"

ON MEETINGS/SPONSOR:
- Encourage connection without pushing
- "Have you talked to your sponsor about this?"
- Never replace human support

ON MEDICATION/MEDICAL:
- Don't advise on medication
- "That's worth discussing with your doctor"
- Support their treatment plan
`

const RESPONSE_EXAMPLES = `
RESPONSE EXAMPLES:

GOOD RESPONSE:
"Tyler, your mood has improved 15% this week - that's real progress. I notice your anxiety tends to be lower on days you journal. Your 12-day meditation streak might be contributing. What do you think is helping most?"

BAD RESPONSE:
"I see you're doing well. Keep up the good work! Let me know if you need anything."

The good response: references specific data, notices patterns, asks a follow-up.
The bad response: generic, no data, no engagement.
`

// =============================================================================
// PHASE 9: OPTIMIZED SYSTEM PROMPTS
// Tasks 2.1-2.6: Therapeutic patterns, examples, structured output
// =============================================================================

export const SYSTEM_PROMPTS = {
  // General Recovery Coach (Tabs 1-5: Stateless) - Phase 6.3: Beacon integration
  recoveryCoach: `${SAFETY_REMINDER}

You are Beacon, an AI wellness companion for GLRS Lighthouse, a recovery support app. You support veterans and first responders in recovery.

${SPECIFICITY_RULES}

${ZERO_NULL_HANDLING}

${EMOTION_MIRRORING}
${RESPONSE_EXAMPLES}

PERSONALITY:
- Warm, supportive, and encouraging like a caring friend
- Recovery-informed (12-step, CBT, DBT, ACT principles)
- Optimistic but realistic - acknowledge struggles while maintaining hope
- Action-oriented - always suggest specific next steps with exact app locations

GUIDELINES:
- Always use the user's first name when provided
- Reference specific dates, numbers, and data points
- Highlight positive patterns with exact improvements (e.g., "up 15% from last week")
- Keep responses concise (2-4 sentences)
- End interactions with hope and engagement

${PROHIBITIONS}

${THERAPEUTIC_TECHNIQUES}
${RECOVERY_PATTERNS}

If user seems distressed: "Remember, your coach is here for you anytime."`,

  // Anchor Tab Companion (Persistent thread, more conversational) - Phase 6.3: Beacon integration
  anchorCompanion: `${SAFETY_REMINDER}

You are Anchor, a personal AI recovery companion for GLRS Lighthouse. You support veterans and first responders in recovery.
You maintain an ongoing supportive relationship across conversations.

${SPECIFICITY_RULES}

${ZERO_NULL_HANDLING}

${EMOTION_MIRRORING}
${RESPONSE_EXAMPLES}

RESPONSE STRUCTURE (use as natural flow, not rigid template):
1. ACKNOWLEDGMENT - Reflect what you heard ("It sounds like...")
2. OBSERVATION - One specific data point with date/number ("I notice your sleep was 4.2 yesterday...")
3. INSIGHT - What this might mean ("This often connects to...")
4. SUGGESTION - One concrete action with exact app location ("Tap Tasks tab to...")
5. ENGAGEMENT - A question to continue ("What feels most true for you?")

Keep responses 2-4 sentences. Conversational, not clinical. ALWAYS BE SPECIFIC.

PERSONALITY:
- Warm, empathetic, genuinely caring
- Remember and reference past conversations
- Adapt communication style to the user
- Celebrate progress with SPECIFIC numbers

${PROHIBITIONS}

${THERAPEUTIC_TECHNIQUES}
${RECOVERY_PATTERNS}

If user seems distressed, gently offer support resources.`,

  // Voice Companion (Audio responses - shorter, more natural)
  voiceCompanion: `${SAFETY_REMINDER}

You are Anchor, responding via voice audio.
${EMOTION_MIRRORING}

VOICE STYLE:
- Speak naturally, as in supportive conversation
- Shorter sentences for audio clarity
- Natural pauses with commas
- Express warmth through word choice
- Keep responses under 3 sentences
- End with clear, actionable suggestion

GOOD VOICE EXAMPLE:
"Tyler, that sounds like a tough morning. I notice you slept better last night though. Maybe start with a short walk, and see how you feel after?"

Remember: Response will be spoken aloud, avoid complex formatting.
${RECOVERY_PATTERNS}`,

  // Daily Oracle (One insight per day) - Phase 6.3: Uses Beacon oracle prompt
  dailyOracle: `${SAFETY_REMINDER}

${BEACON_ORACLE_PROMPT}

${RECOVERY_PATTERNS}`,

  // Story Mode (Narrative of recovery journey)
  storyMode: `${SAFETY_REMINDER}

Narrate this user's recovery journey as a compelling, encouraging story.

STORY STYLE:
- Write in third person using their first name
- Reference SPECIFIC milestones from their data
- Acknowledge struggles as part of the hero's journey
- Connect early challenges to current victories
- Build toward next milestone
- 2-3 short paragraphs

GOOD STORY EXAMPLE:
"On day 47, Tyler faced his first real test - a work event where everyone was drinking. He called his sponsor, white-knuckled through the night, and woke up on day 48 with something new: proof that he could do hard things.

Now, 180 days in, those hard things have become his foundation. His mood scores have climbed steadily. His sleep has normalized. And that nervous guy at the work event? He's become someone others lean on.

The next milestone - 6 months - is just 2 days away. Tyler's not the same person who started this journey. He's someone who chose himself, again and again."

Focus on resilience, growth, hope. Make them feel proud.`,

  // Guided Check-in Synthesis
  guidedCheckin: `${SAFETY_REMINDER}

Synthesize this check-in conversation into a personalized summary.
${EMOTION_MIRRORING}

STRUCTURE:
1. Acknowledge their current emotional state (validate first)
2. Connect sleep/mood to their patterns (use their data)
3. Offer one specific coping strategy if needed
4. Affirm their intention for the day
5. End with encouragement

GOOD SYNTHESIS EXAMPLE:
"Sounds like a heavier morning - that makes sense given the rough sleep. When your sleep dips, I usually see your anxiety tick up the next day. Today might be a good day for that breathing exercise you mentioned helps. Your intention to 'just get through work' is real and honest. One day at a time."

BAD SYNTHESIS EXAMPLE:
"You seem to be doing okay! Remember to take care of yourself today."

Keep it warm, personal, actionable.
${RECOVERY_PATTERNS}

If concerning feelings mentioned: "Your coach is here if you need extra support today."`,

  // Prompt Cards (Quick AI responses)
  promptCards: `${SAFETY_REMINDER}

Quick, personalized response for a prompt card.
${EMOTION_MIRRORING}

STYLE:
- 2-3 sentences maximum
- Reference their specific recovery data
- End with one actionable suggestion or question

GOOD EXAMPLE:
"Day 23 - you're past the 3-week mark. Your check-ins show mornings are toughest. What's one small thing that could make tomorrow morning 5% easier?"

BAD EXAMPLE:
"Great job! Keep going!"

Make every interaction specific and meaningful.`,

} as const

// Firebase Functions endpoints (relative URLs for same-origin)
export const OPENAI_ENDPOINTS = {
  chat: '/api/openai/chat',
  whisper: '/api/openai/whisper',
  tts: '/api/openai/tts',
  thread: '/api/openai/thread',
} as const

// Types for API responses
export interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface ChatRequest {
  messages: ChatMessage[]
  systemPrompt?: keyof typeof SYSTEM_PROMPTS
  maxTokens?: number
  temperature?: number
  stream?: boolean
}

export interface ChatResponse {
  content: string
  usage?: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
  // Phase 8B: Crisis detection results
  crisis?: boolean
  tier?: 'critical' | 'high' | 'moderate' | 'standard'
  alertId?: string
}

export interface WhisperRequest {
  audio: Blob
  language?: string
}

export interface WhisperResponse {
  text: string
  duration?: number
}

export interface TTSRequest {
  text: string
  voice?: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer'
  speed?: number
}

export interface ThreadMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export interface ThreadRequest {
  userId: string
  message: string
  threadId?: string
}

export interface ThreadResponse {
  threadId: string
  response: string
  messages: ThreadMessage[]
  // Phase 8B: Crisis detection results
  crisis?: boolean
  tier?: 'critical' | 'high' | 'moderate' | 'standard'
  alertId?: string
}

// =============================================================================
// BEACON CONTEXT - Full context for AI personalization
// Phase 6.2: Extended to include all data for specific, actionable responses
// =============================================================================

export interface AIContext {
  // User Identity
  user: {
    firstName: string
    odid?: string // Organization ID
    sobrietyDays: number
    sobrietyDate?: string // Formatted date string
    substance?: string
    isVeteran?: boolean
    isFirstResponder?: boolean
    upcomingMilestones: Array<{ days: number; achieved: boolean }>
  }

  // Today's Status (specific, not averages)
  today: {
    hasCompletedMorningCheckIn: boolean
    hasCompletedEveningCheckIn: boolean
    morningCheckIn: {
      mood?: number
      anxiety?: number
      craving?: number
      sleep?: number
      energy?: number
      notes?: string
    } | null
    eveningCheckIn: {
      dayRating?: number
      gratitude?: string
      challenge?: string
      tomorrowGoal?: string
    } | null
    habitsCompletedToday: string[] // habit names
    habitsMissedToday: string[] // habit names
  }

  // Recent History (7 days) - with specific dates
  recent: {
    checkInCount: number
    checkInRate: number // e.g., 0.71 for 5/7
    lastCheckInDate: string | null // "Tue, Nov 26"
    lastCheckInDaysAgo: number
    lastCheckInMood: number | null
    lastCheckInNotes: string | null
    moodAvg: number
    moodTrend: 'improving' | 'declining' | 'stable'
    cravingAvg: number
    cravingHigh: number
    cravingHighDate: string | null
    sleepAvg: number
    anxietyAvg: number
    reflectionCount: number
    lastReflectionDate: string | null
    lastReflectionGratitude: string | null
    gratitudeCount: number
    recentGratitudes: string[] // last 3 actual texts
    meetingCount: number
    lastMeetingDate: string | null
    lastMeetingName: string | null
  }

  // Legacy checkIns object for backwards compatibility
  checkIns: {
    today: {
      mood?: number
      anxiety?: number
      craving?: number
      sleep?: number
      energy?: number
    } | null
    weekAverage: {
      mood: number
      anxiety: number
      craving: number
      sleep: number
    }
    monthTrend: {
      mood: 'improving' | 'stable' | 'declining'
      anxiety: 'improving' | 'stable' | 'declining'
      craving: 'improving' | 'stable' | 'declining'
      sleep: 'improving' | 'stable' | 'declining'
    }
  }

  // Patterns (for personalized insights)
  patterns: {
    bestDayOfWeek: string | null
    worstDayOfWeek: string | null
    sleepMoodCorrelation: number // -1 to 1
    meetingCravingCorrelation: number // -1 to 1
    riskDays: string[] // days they typically struggle
    effectiveCoping: string[] // what's worked before
  }

  // Habits with names and streaks
  habits: {
    completionRate: number
    streaks: Array<{ name: string; days: number }>
    topHabit: string | null
    activeHabits?: Array<{ name: string; streak: number; completionRate: number }>
    strugglingHabit?: string | null
  }

  // Reflections with actual content
  reflections: {
    recentThemes: string[]
    gratitudeCount: number
    breakthroughCount: number
    recentGratitudeTexts?: string[] // last 3 actual gratitude texts
    recentChallengeTexts?: string[] // last 3 challenge texts
  }

  // Meetings with specifics
  meetings: {
    weeklyAverage: number
    streak: number
    lastAttended: Date | null
    lastMeetingName?: string | null
    lastMeetingDate?: string | null
  }

  // Goals with details
  goals: {
    activeCount: number
    completionRate: number
    nearestDeadline: Date | null
    currentFocus?: string | null // top goal title
    goalNames?: string[] // all active goal names
  }

  // Milestones
  milestones: {
    nextMilestone: string | null // "90 Days"
    daysUntilNext: number
    recentAchieved: number[] // [60, 30] milestone days achieved
  }

  // Previous AI Insights (for continuity)
  previousInsights: {
    lastInsightDate: string | null
    lastInsightText: string | null
    recentInsights: Array<{
      type: string
      prompt: string
      response: string
      createdAt: string // formatted date string
    }>
  }

  // Flags for quick status checks
  flags: {
    isWeekend: boolean
    daysWithoutCheckIn: number
    daysWithoutMeeting: number
    daysWithoutReflection: number
    cravingSpikeRecent: boolean
    sleepDeclineTrend: boolean
    needsAttention: boolean // any concerning patterns
    streakAtRisk: boolean
  }

  // Legacy context object for backwards compatibility
  context: {
    isWeekend: boolean
    daysToNextMilestone: number
    currentStreak: number
    streakAtRisk: boolean
  }
}

// Helper to build context string for prompts
// Phase 6.2: Enhanced for Beacon personality with specific data
export function buildContextString(context: AIContext): string {
  const sections: string[] = []

  // ==========================================================================
  // SECTION 1: USER IDENTITY
  // ==========================================================================
  const userSection = [
    `=== USER ===`,
    `Name: ${context.user.firstName}`,
    `Sobriety: Day ${context.user.sobrietyDays}${context.user.sobrietyDate ? ` (since ${context.user.sobrietyDate})` : ''}`,
  ]
  if (context.user.substance) userSection.push(`Substance: ${context.user.substance}`)
  if (context.user.isVeteran) userSection.push(`Status: Veteran`)
  if (context.user.isFirstResponder) userSection.push(`Status: First Responder`)
  sections.push(userSection.join('\n'))

  // ==========================================================================
  // SECTION 2: TODAY'S STATUS (Critical for specific responses)
  // ==========================================================================
  const todaySection = [`=== TODAY ===`]

  if (context.today?.hasCompletedMorningCheckIn && context.today.morningCheckIn) {
    const m = context.today.morningCheckIn
    todaySection.push(`Morning Check-in: Mood ${m.mood}/10, Anxiety ${m.anxiety}/10, Craving ${m.craving}/10, Sleep ${m.sleep}/10, Energy ${m.energy}/10`)
    if (m.notes) todaySection.push(`Notes: "${m.notes.substring(0, 100)}${m.notes.length > 100 ? '...' : ''}"`)
  } else {
    todaySection.push(`Morning Check-in: NOT COMPLETED TODAY`)
  }

  if (context.today?.hasCompletedEveningCheckIn && context.today.eveningCheckIn) {
    const e = context.today.eveningCheckIn
    todaySection.push(`Evening Reflection: Day rated ${e.dayRating}/5`)
    if (e.gratitude) todaySection.push(`Today's gratitude: "${e.gratitude.substring(0, 100)}..."`)
    if (e.challenge) todaySection.push(`Today's challenge: "${e.challenge.substring(0, 100)}..."`)
  } else {
    todaySection.push(`Evening Reflection: NOT COMPLETED TODAY`)
  }

  if (context.today?.habitsCompletedToday?.length > 0) {
    todaySection.push(`Habits completed today: ${context.today.habitsCompletedToday.join(', ')}`)
  }
  if (context.today?.habitsMissedToday?.length > 0) {
    todaySection.push(`Habits NOT completed today: ${context.today.habitsMissedToday.join(', ')}`)
  }
  sections.push(todaySection.join('\n'))

  // ==========================================================================
  // SECTION 3: RECENT HISTORY (7 days) - With specific dates
  // ==========================================================================
  const recentSection = [`=== LAST 7 DAYS ===`]

  if (context.recent) {
    recentSection.push(`Check-ins: ${context.recent.checkInCount}/7 (${Math.round(context.recent.checkInRate * 100)}%)`)

    if (context.recent.lastCheckInDate) {
      recentSection.push(`Last check-in: ${context.recent.lastCheckInDate} (${context.recent.lastCheckInDaysAgo} days ago), mood was ${context.recent.lastCheckInMood}/10`)
      if (context.recent.lastCheckInNotes) {
        recentSection.push(`Last notes: "${context.recent.lastCheckInNotes.substring(0, 100)}..."`)
      }
    } else {
      recentSection.push(`Last check-in: NONE IN LAST 7 DAYS`)
    }

    recentSection.push(`Mood avg: ${context.recent.moodAvg.toFixed(1)}/10 (${context.recent.moodTrend})`)
    recentSection.push(`Craving avg: ${context.recent.cravingAvg.toFixed(1)}/10${context.recent.cravingHigh >= 7 ? ` - SPIKE to ${context.recent.cravingHigh} on ${context.recent.cravingHighDate}` : ''}`)
    recentSection.push(`Sleep avg: ${context.recent.sleepAvg.toFixed(1)}/10`)
    recentSection.push(`Anxiety avg: ${context.recent.anxietyAvg.toFixed(1)}/10`)

    if (context.recent.lastReflectionDate) {
      recentSection.push(`Last reflection: ${context.recent.lastReflectionDate}${context.recent.lastReflectionGratitude ? ` - grateful for "${context.recent.lastReflectionGratitude.substring(0, 50)}..."` : ''}`)
    } else {
      recentSection.push(`Reflections: NONE IN LAST 7 DAYS`)
    }

    if (context.recent.recentGratitudes?.length > 0) {
      recentSection.push(`Recent gratitudes:`)
      context.recent.recentGratitudes.slice(0, 3).forEach(g => {
        // Skip undefined or null gratitudes
        if (g && typeof g === 'string') {
          recentSection.push(`  - "${g.substring(0, 80)}${g.length > 80 ? '...' : ''}"`)
        }
      })
    } else {
      recentSection.push(`Gratitudes: NONE THIS WEEK`)
    }

    if (context.recent.lastMeetingDate) {
      recentSection.push(`Last meeting: ${context.recent.lastMeetingName || 'Meeting'} on ${context.recent.lastMeetingDate}`)
    } else {
      recentSection.push(`Meetings: NONE THIS WEEK`)
    }
  }
  sections.push(recentSection.join('\n'))

  // ==========================================================================
  // SECTION 4: HABITS (with names and streaks)
  // ==========================================================================
  const habitSection = [`=== HABITS ===`]

  if (context.habits?.activeHabits && context.habits.activeHabits.length > 0) {
    habitSection.push(`Completion rate: ${Math.round(context.habits.completionRate * 100)}%`)
    habitSection.push(`Active habits:`)
    context.habits.activeHabits.forEach(h => {
      habitSection.push(`  - ${h.name}: ${h.streak} day streak, ${Math.round(h.completionRate * 100)}% completion`)
    })
    if (context.habits.strugglingHabit) {
      habitSection.push(`Struggling with: ${context.habits.strugglingHabit}`)
    }
  } else if (context.habits?.streaks && context.habits.streaks.length > 0) {
    // Fallback to legacy streaks data
    habitSection.push(`Completion rate: ${Math.round(context.habits.completionRate * 100)}%`)
    habitSection.push(`Active habits:`)
    context.habits.streaks.forEach(h => {
      habitSection.push(`  - ${h.name}: ${h.days} day streak`)
    })
  } else {
    habitSection.push(`NO HABITS SET UP - User should tap hamburger menu next to Overview to add habits`)
  }
  sections.push(habitSection.join('\n'))

  // ==========================================================================
  // SECTION 5: GOALS
  // ==========================================================================
  const goalSection = [`=== GOALS ===`]

  if (context.goals && context.goals.activeCount > 0) {
    goalSection.push(`Active: ${context.goals.activeCount}`)
    goalSection.push(`Completion rate: ${Math.round(context.goals.completionRate * 100)}%`)
    if (context.goals.currentFocus) {
      goalSection.push(`Current focus: "${context.goals.currentFocus}"`)
    }
    if (context.goals.goalNames && context.goals.goalNames.length > 0) {
      goalSection.push(`Goal names: ${context.goals.goalNames.join(', ')}`)
    }
  } else {
    goalSection.push(`NO GOALS SET - User should tap Tasks tab, scroll to Golden Thread to add goals`)
  }
  sections.push(goalSection.join('\n'))

  // ==========================================================================
  // SECTION 6: MILESTONES
  // ==========================================================================
  const milestoneSection = [`=== MILESTONES ===`]

  if (context.milestones) {
    if (context.milestones.nextMilestone) {
      milestoneSection.push(`Next: ${context.milestones.nextMilestone} in ${context.milestones.daysUntilNext} days`)
    }
    if (context.milestones.recentAchieved?.length > 0) {
      milestoneSection.push(`Recently achieved: ${context.milestones.recentAchieved.join(', ')}`)
    }
  }
  sections.push(milestoneSection.join('\n'))

  // ==========================================================================
  // SECTION 7: FLAGS (quick status for AI)
  // ==========================================================================
  const flagSection = [`=== STATUS FLAGS ===`]

  if (context.flags) {
    if (context.flags.daysWithoutCheckIn > 0) {
      flagSection.push(`Days without check-in: ${context.flags.daysWithoutCheckIn}`)
    }
    if (context.flags.daysWithoutMeeting > 7) {
      flagSection.push(`Days without meeting: ${context.flags.daysWithoutMeeting}`)
    }
    if (context.flags.daysWithoutReflection > 0) {
      flagSection.push(`Days without reflection: ${context.flags.daysWithoutReflection}`)
    }
    if (context.flags.cravingSpikeRecent) {
      flagSection.push(`ALERT: Craving spike in last 3 days`)
    }
    if (context.flags.sleepDeclineTrend) {
      flagSection.push(`ALERT: Sleep declining trend`)
    }
    if (context.flags.streakAtRisk) {
      flagSection.push(`ALERT: Check-in streak at risk`)
    }
    if (context.flags.needsAttention) {
      flagSection.push(`NEEDS ATTENTION: Concerning patterns detected`)
    }
    if (context.flags.isWeekend) {
      flagSection.push(`Today is weekend`)
    }
  }
  sections.push(flagSection.join('\n'))

  // ==========================================================================
  // SECTION 8: PREVIOUS AI INSIGHTS (for continuity)
  // ==========================================================================
  if (context.previousInsights?.recentInsights?.length > 0) {
    const insightSection = [`=== PREVIOUS AI INSIGHTS (for continuity) ===`]
    const lastInsight = context.previousInsights.recentInsights[0]
    if (lastInsight) {
      insightSection.push(`Last insight (${context.previousInsights.lastInsightDate}):`)
      insightSection.push(`"${lastInsight.response.substring(0, 200)}..."`)
    }
    sections.push(insightSection.join('\n'))
  }

  // ==========================================================================
  // SECTION 9: INSTRUCTIONS FOR AI
  // ==========================================================================
  const instructionSection = [
    `=== RESPONSE INSTRUCTIONS ===`,
    `1. Reference SPECIFIC dates, numbers, and names from above`,
    `2. If data is missing (e.g., "NOT COMPLETED"), tell user what's missing with specific action`,
    `3. Never say "at a standstill" - say exactly what hasn't been done`,
    `4. Guide to specific app locations (e.g., "tap Tasks tab", "hamburger menu next to Overview")`,
    `5. If previous insight exists, you may reference it for continuity`,
  ]
  sections.push(instructionSection.join('\n'))

  return sections.join('\n\n')
}
