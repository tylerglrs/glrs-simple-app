/**
 * useAIChat Hook - Chat Completions via Firebase Functions
 * Phase 7B: Stateless AI chat for Tabs 1-5 (Overview, Beacon, Habits, Reflections, Goals)
 * Phase 8D: Crisis detection integration
 *
 * All API calls proxy through Firebase Functions to keep API key secure.
 * Messages are scanned for crisis keywords and appropriate responses triggered.
 */

import { useState, useCallback } from 'react'
import { httpsCallable, getFunctions } from 'firebase/functions'
import {
  collection,
  addDoc,
  Timestamp,
} from 'firebase/firestore'
import { useAuth } from '@/contexts/AuthContext'
import { db } from '@/lib/firebase'
import {
  SYSTEM_PROMPTS,
  OPENAI_CONFIG,
  buildContextString,
  type AIContext,
  type ChatMessage,
  type ChatResponse,
} from '@/lib/openai'

// Firebase Functions instance
const functions = getFunctions()

// =============================================================================
// AI RESPONSE LOGGING (Phase 4)
// =============================================================================

export type AIResponseType = 'prompt_card' | 'oracle' | 'anchor' | 'insight' | 'pattern' | 'custom'

export interface AIResponseLog {
  type: AIResponseType
  prompt: string
  response: string
  contextSnapshot: Record<string, unknown>
  createdAt: Timestamp
  expiresAt: Timestamp  // 30 days
}

// 30 days in milliseconds
const LOG_RETENTION_MS = 30 * 24 * 60 * 60 * 1000

// Crisis tier types
export type CrisisTier = 'critical' | 'high' | 'moderate' | 'standard' | null

// Crisis detection response from backend
export interface CrisisDetectionResult {
  detected: boolean
  tier: CrisisTier
  keywords: string[]
  alertId?: string
  message?: string
}

// Types
export interface UseAIChatOptions {
  systemPrompt?: keyof typeof SYSTEM_PROMPTS
  maxTokens?: number
  temperature?: number
  enableCrisisDetection?: boolean
}

export interface UseAIChatReturn {
  // State
  isLoading: boolean
  error: string | null
  response: string | null
  usage: ChatResponse['usage'] | null

  // Crisis state (Phase 8D)
  crisisDetected: boolean
  crisisTier: CrisisTier
  crisisAlertId: string | null
  clearCrisis: () => void

  // Actions
  sendMessage: (message: string, context?: AIContext, logType?: AIResponseType) => Promise<string | null>
  sendPromptCard: (promptKey: string, context: AIContext) => Promise<string | null>
  generateInsight: (insightType: string, context: AIContext) => Promise<string | null>
  logAIResponse: (type: AIResponseType, prompt: string, response: string, context?: AIContext) => Promise<void>
  reset: () => void
}

// Prompt card templates
const PROMPT_CARDS: Record<string, string> = {
  whatsGoingWell: 'Based on my recent data, what is going well for me in my recovery?',
  howAmISleeping: 'How is my sleep affecting my mood and recovery? What patterns do you see?',
  whatPatterns: 'What patterns do you see in my data over the past week?',
  giveEncouragement: 'I could use some encouragement today. What positive things can you tell me about my progress?',
  whatToFocus: 'Based on my patterns, what should I focus on today for my recovery?',
  tellMeProgress: 'Tell me about my progress this week. What improvements have I made?',
  helpWithCravings: 'I am having cravings right now. Can you help me work through this?',
  morningMotivation: 'Give me some morning motivation based on my recovery journey.',
}

// Insight type templates
const INSIGHT_TYPES: Record<string, string> = {
  overview: 'Provide a brief overview of my current state based on today\'s check-in and recent patterns.',
  pattern: 'Analyze my mood patterns over the past week and identify any notable correlations.',
  habit: 'Review my habit completion and provide coaching on how to improve consistency.',
  reflection: 'Analyze my recent reflections and gratitudes to identify recurring themes.',
  goal: 'Review my goal progress and provide coaching on achieving my objectives.',
}

/**
 * useAIChat - Hook for AI chat completions
 *
 * @param options - Configuration options
 * @returns Chat state and actions
 */
export function useAIChat(options: UseAIChatOptions = {}): UseAIChatReturn {
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [response, setResponse] = useState<string | null>(null)
  const [usage, setUsage] = useState<ChatResponse['usage'] | null>(null)

  // Crisis detection state (Phase 8D)
  const [crisisDetected, setCrisisDetected] = useState(false)
  const [crisisTier, setCrisisTier] = useState<CrisisTier>(null)
  const [crisisAlertId, setCrisisAlertId] = useState<string | null>(null)

  const {
    systemPrompt = 'recoveryCoach',
    maxTokens = OPENAI_CONFIG.chat.maxTokens,
    temperature = OPENAI_CONFIG.chat.temperature,
    enableCrisisDetection = true,
  } = options

  /**
   * Clear crisis state
   */
  const clearCrisis = useCallback(() => {
    setCrisisDetected(false)
    setCrisisTier(null)
    setCrisisAlertId(null)
  }, [])

  /**
   * Log AI response to Firestore (Phase 4)
   */
  const logAIResponse = useCallback(
    async (
      type: AIResponseType,
      prompt: string,
      response: string,
      context?: AIContext
    ): Promise<void> => {
      if (!user?.uid) return

      try {
        const responsesRef = collection(db, 'users', user.uid, 'aiResponses')
        const now = Timestamp.now()
        const expiresAt = Timestamp.fromMillis(Date.now() + LOG_RETENTION_MS)

        const logEntry: AIResponseLog = {
          type,
          prompt,
          response,
          contextSnapshot: context ? {
            sobrietyDays: context.user?.sobrietyDays,
            checkInToday: !!context.checkIns?.today,
            weekMoodAvg: context.checkIns?.weekAverage?.mood,
            weekAnxietyAvg: context.checkIns?.weekAverage?.anxiety,
            weekCravingAvg: context.checkIns?.weekAverage?.craving,
            weekSleepAvg: context.checkIns?.weekAverage?.sleep,
            habitCompletionRate: context.habits?.completionRate,
            currentStreak: context.context?.currentStreak,
            activeGoals: context.goals?.activeCount,
          } : {},
          createdAt: now,
          expiresAt,
        }

        await addDoc(responsesRef, logEntry)
        console.log('[useAIChat] AI response logged:', type)
      } catch (err) {
        // Log error but don't throw - logging shouldn't break the main flow
        console.error('[useAIChat] Error logging AI response:', err)
      }
    },
    [user?.uid]
  )

  /**
   * Scan message for crisis keywords via backend
   */
  const scanForCrisis = useCallback(
    async (message: string): Promise<CrisisDetectionResult | null> => {
      if (!enableCrisisDetection || !user) return null

      try {
        const detectCrisis = httpsCallable<
          { text: string; source: string },
          CrisisDetectionResult
        >(functions, 'detectCrisis')

        const result = await detectCrisis({
          text: message,
          source: 'ai_chat',
        })

        return result.data
      } catch (err) {
        console.error('[useAIChat] Crisis detection error:', err)
        return null
      }
    },
    [user, enableCrisisDetection]
  )

  /**
   * Send a message to the AI
   */
  const sendMessage = useCallback(
    async (message: string, context?: AIContext, logType?: AIResponseType): Promise<string | null> => {
      if (!user) {
        setError('You must be logged in to use AI features')
        return null
      }

      setIsLoading(true)
      setError(null)
      setResponse(null)

      try {
        // Phase 8D: Scan for crisis keywords before processing
        if (enableCrisisDetection) {
          const crisisResult = await scanForCrisis(message)
          if (crisisResult?.detected) {
            console.log('[useAIChat] Crisis detected:', crisisResult.tier)
            setCrisisDetected(true)
            setCrisisTier(crisisResult.tier)
            setCrisisAlertId(crisisResult.alertId || null)

            // For critical tier, we still get AI response but also show crisis modal
            // The component layer handles which UI to show based on tier
          }
        }

        // Build messages array
        const messages: ChatMessage[] = [
          { role: 'system', content: SYSTEM_PROMPTS[systemPrompt] },
        ]

        // Add context if provided
        if (context) {
          messages.push({
            role: 'system',
            content: `USER CONTEXT:\n${buildContextString(context)}`,
          })
        }

        // Add user message
        messages.push({ role: 'user', content: message })

        // Call Firebase Function
        const chatFunction = httpsCallable<
          { messages: ChatMessage[]; maxTokens: number; temperature: number },
          ChatResponse
        >(functions, 'openaiChat')

        const result = await chatFunction({
          messages,
          maxTokens,
          temperature,
        })

        const aiResponse = result.data.content
        setResponse(aiResponse)
        setUsage(result.data.usage || null)

        // Phase 4: Log the response if logType is provided
        if (logType && aiResponse) {
          // Fire and forget - don't await
          logAIResponse(logType, message, aiResponse, context)
        }

        return aiResponse
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to get AI response'
        setError(errorMessage)
        console.error('AI Chat Error:', err)
        return null
      } finally {
        setIsLoading(false)
      }
    },
    [user, systemPrompt, maxTokens, temperature, enableCrisisDetection, scanForCrisis, logAIResponse]
  )

  /**
   * Send a pre-defined prompt card (auto-logs as 'prompt_card')
   */
  const sendPromptCard = useCallback(
    async (promptKey: string, context: AIContext): Promise<string | null> => {
      const promptTemplate = PROMPT_CARDS[promptKey]
      if (!promptTemplate) {
        setError(`Unknown prompt card: ${promptKey}`)
        return null
      }

      // Auto-log prompt card responses
      return sendMessage(promptTemplate, context, 'prompt_card')
    },
    [sendMessage]
  )

  /**
   * Generate a specific type of insight (auto-logs as 'insight')
   */
  const generateInsight = useCallback(
    async (insightType: string, context: AIContext): Promise<string | null> => {
      const insightTemplate = INSIGHT_TYPES[insightType]
      if (!insightTemplate) {
        setError(`Unknown insight type: ${insightType}`)
        return null
      }

      // Auto-log insight responses
      return sendMessage(insightTemplate, context, 'insight')
    },
    [sendMessage]
  )

  /**
   * Reset the chat state
   */
  const reset = useCallback(() => {
    setIsLoading(false)
    setError(null)
    setResponse(null)
    setUsage(null)
    clearCrisis()
  }, [clearCrisis])

  return {
    // State
    isLoading,
    error,
    response,
    usage,

    // Crisis state (Phase 8D)
    crisisDetected,
    crisisTier,
    crisisAlertId,
    clearCrisis,

    // Actions
    sendMessage,
    sendPromptCard,
    generateInsight,
    logAIResponse,
    reset,
  }
}

// Export prompt cards for UI
export const AI_PROMPT_CARDS = [
  { key: 'whatsGoingWell', label: "What's going well?", icon: 'ThumbsUp' },
  { key: 'howAmISleeping', label: 'How is my sleep?', icon: 'Moon' },
  { key: 'whatPatterns', label: 'What patterns?', icon: 'TrendingUp' },
  { key: 'giveEncouragement', label: 'Encouragement', icon: 'Heart' },
  { key: 'whatToFocus', label: 'What to focus on?', icon: 'Target' },
  { key: 'tellMeProgress', label: 'My progress', icon: 'Award' },
] as const

export default useAIChat
