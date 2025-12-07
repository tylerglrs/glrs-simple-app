/**
 * useAnchor Hook - Assistants API with Persistent Threads
 * Phase 7B: Conversational AI for Anchor tab with memory
 * Phase 8D: Crisis detection integration
 *
 * Each PIR gets their own thread stored in Firestore (users/{userId}/anchorThreadId)
 * This enables memory/context persistence across conversations.
 * Messages are scanned for crisis keywords and appropriate responses triggered.
 */

import { useState, useCallback, useEffect } from 'react'
import { httpsCallable, getFunctions } from 'firebase/functions'
import { useAuth } from '@/contexts/AuthContext'
import { type CrisisTier, type CrisisDetectionResult } from './useAIChat'

// Firebase Functions instance
const functions = getFunctions()

// Types
export interface AnchorMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  createdAt: string
}

export interface RecoveryContext {
  sobrietyDays: number
  mood?: number
  patterns?: string
}

export interface UseAnchorReturn {
  // State
  isLoading: boolean
  isSending: boolean
  error: string | null
  messages: AnchorMessage[]
  hasThread: boolean
  threadId: string | null

  // Crisis state (Phase 8D)
  crisisDetected: boolean
  crisisTier: CrisisTier
  crisisAlertId: string | null
  clearCrisis: () => void

  // Actions
  sendMessage: (message: string, context?: RecoveryContext) => Promise<string | null>
  loadHistory: () => Promise<void>
  clearHistory: () => Promise<void>
}

/**
 * useAnchor - Hook for Anchor tab with persistent conversation
 *
 * @returns Anchor state and actions
 */
export function useAnchor(): UseAnchorReturn {
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [messages, setMessages] = useState<AnchorMessage[]>([])
  const [hasThread, setHasThread] = useState(false)
  const [threadId, setThreadId] = useState<string | null>(null)

  // Crisis detection state (Phase 8D)
  const [crisisDetected, setCrisisDetected] = useState(false)
  const [crisisTier, setCrisisTier] = useState<CrisisTier>(null)
  const [crisisAlertId, setCrisisAlertId] = useState<string | null>(null)

  /**
   * Clear crisis state
   */
  const clearCrisis = useCallback(() => {
    setCrisisDetected(false)
    setCrisisTier(null)
    setCrisisAlertId(null)
  }, [])

  /**
   * Scan message for crisis keywords via backend
   */
  const scanForCrisis = useCallback(
    async (message: string): Promise<CrisisDetectionResult | null> => {
      if (!user) return null

      try {
        const detectCrisis = httpsCallable<
          { text: string; source: string },
          CrisisDetectionResult
        >(functions, 'detectCrisis')

        const result = await detectCrisis({
          text: message,
          source: 'anchor_chat',
        })

        return result.data
      } catch (err) {
        console.error('[useAnchor] Crisis detection error:', err)
        return null
      }
    },
    [user]
  )

  /**
   * Load conversation history
   */
  const loadHistory = useCallback(async () => {
    if (!user) {
      setError('You must be logged in to use Anchor')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const getHistoryFn = httpsCallable<
        { limit: number },
        { messages: AnchorMessage[]; hasThread: boolean; threadId?: string }
      >(functions, 'anchorGetHistory')

      const result = await getHistoryFn({ limit: 50 })

      setMessages(result.data.messages)
      setHasThread(result.data.hasThread)
      setThreadId(result.data.threadId || null)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load conversation'
      setError(errorMessage)
      console.error('Anchor History Error:', err)
    } finally {
      setIsLoading(false)
    }
  }, [user])

  /**
   * Send a message to Anchor
   */
  const sendMessage = useCallback(
    async (message: string, context?: RecoveryContext): Promise<string | null> => {
      if (!user) {
        setError('You must be logged in to use Anchor')
        return null
      }

      setIsSending(true)
      setError(null)

      // Phase 8D: Scan for crisis keywords before processing
      const crisisResult = await scanForCrisis(message)
      if (crisisResult?.detected) {
        console.log('[useAnchor] Crisis detected:', crisisResult.tier)
        setCrisisDetected(true)
        setCrisisTier(crisisResult.tier)
        setCrisisAlertId(crisisResult.alertId || null)
        // Continue processing - component layer handles UI based on tier
      }

      // Optimistically add user message
      const tempUserMessage: AnchorMessage = {
        id: `temp-${Date.now()}`,
        role: 'user',
        content: message,
        createdAt: new Date().toISOString(),
      }
      setMessages(prev => [...prev, tempUserMessage])

      try {
        const sendMessageFn = httpsCallable<
          { message: string; recoveryContext?: RecoveryContext },
          { response: string; threadId: string; messageId: string }
        >(functions, 'anchorSendMessage')

        const result = await sendMessageFn({
          message,
          recoveryContext: context,
        })

        // Add assistant response
        const assistantMessage: AnchorMessage = {
          id: result.data.messageId,
          role: 'assistant',
          content: result.data.response,
          createdAt: new Date().toISOString(),
        }
        setMessages(prev => [...prev, assistantMessage])
        setThreadId(result.data.threadId)
        setHasThread(true)

        return result.data.response
      } catch (err) {
        // Remove optimistic message on error
        setMessages(prev => prev.filter(m => m.id !== tempUserMessage.id))

        const errorMessage = err instanceof Error ? err.message : 'Failed to send message'
        setError(errorMessage)
        console.error('Anchor Send Error:', err)
        return null
      } finally {
        setIsSending(false)
      }
    },
    [user, scanForCrisis]
  )

  /**
   * Clear conversation history (start fresh)
   */
  const clearHistory = useCallback(async () => {
    if (!user) {
      setError('You must be logged in to use Anchor')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const clearHistoryFn = httpsCallable<
        Record<string, never>,
        { success: boolean; threadId: string; message: string }
      >(functions, 'anchorClearHistory')

      const result = await clearHistoryFn({})

      setMessages([])
      setThreadId(result.data.threadId)
      // Keep hasThread true since we now have a new empty thread
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to clear conversation'
      setError(errorMessage)
      console.error('Anchor Clear Error:', err)
    } finally {
      setIsLoading(false)
    }
  }, [user])

  // Load history on mount
  useEffect(() => {
    if (user) {
      loadHistory()
    }
  }, [user, loadHistory])

  return {
    // State
    isLoading,
    isSending,
    error,
    messages,
    hasThread,
    threadId,

    // Crisis state (Phase 8D)
    crisisDetected,
    crisisTier,
    crisisAlertId,
    clearCrisis,

    // Actions
    sendMessage,
    loadHistory,
    clearHistory,
  }
}

export default useAnchor
