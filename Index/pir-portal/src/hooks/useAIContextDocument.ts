/**
 * useAIContextDocument Hook
 *
 * Single real-time listener for the aiContext document.
 * This replaces multiple collection queries with one document read.
 *
 * Path: users/{userId}/aiContext/current
 */

import { useState, useEffect, useCallback } from 'react'
import { doc, onSnapshot, Timestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useAuth } from '@/contexts/AuthContext'
import type { AIContextDocument } from '@/types/aiContext'

// =============================================================================
// TYPES
// =============================================================================

export interface AIContextDocumentState {
  /** The aiContext document data */
  context: AIContextDocument | null

  /** Loading state */
  loading: boolean

  /** Error state */
  error: string | null

  /** Last time the document was updated */
  lastUpdated: Date | null

  /** Whether the document exists */
  exists: boolean
}

// =============================================================================
// HOOK
// =============================================================================

/**
 * Hook to subscribe to the aiContext document for the current user.
 *
 * This is a single real-time listener that provides:
 * - User profile data
 * - Today's status (check-ins, habits, etc.)
 * - Recent 7-day metrics
 * - Patterns and streaks
 * - Habit, goal, meeting, and reflection summaries
 * - Context flags for AI personalization
 *
 * @example
 * const { context, loading, error } = useAIContextDocument()
 *
 * if (loading) return <Spinner />
 * if (!context) return <NoDataMessage />
 *
 * // Use context data
 * const { today, recent7Days, streaks } = context
 */
export function useAIContextDocument(): AIContextDocumentState & {
  /** Force refresh the listener */
  refresh: () => void
} {
  const { user } = useAuth()
  const userId = user?.uid

  const [context, setContext] = useState<AIContextDocument | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [exists, setExists] = useState(false)

  // Force refresh counter to re-trigger the effect
  const [refreshCounter, setRefreshCounter] = useState(0)

  useEffect(() => {
    if (!userId) {
      setLoading(false)
      setContext(null)
      setExists(false)
      return
    }

    setLoading(true)
    setError(null)

    // Single listener to the aiContext document
    const contextRef = doc(db, 'users', userId, 'aiContext', 'current')

    const unsubscribe = onSnapshot(
      contextRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data() as AIContextDocument

          // Validate userId matches
          if (data.userId && data.userId !== userId) {
            console.warn('[useAIContextDocument] userId mismatch, ignoring document')
            setContext(null)
            setExists(false)
          } else {
            setContext(data)
            setExists(true)

            // Extract lastUpdated from document
            if (data.lastUpdated) {
              const ts = data.lastUpdated as Timestamp
              setLastUpdated(ts.toDate ? ts.toDate() : new Date())
            }
          }
        } else {
          // Document doesn't exist yet
          console.log('[useAIContextDocument] Document does not exist for user:', userId)
          setContext(null)
          setExists(false)
        }

        setLoading(false)
      },
      (err) => {
        console.error('[useAIContextDocument] Error listening to context:', err)
        setError(err.message || 'Failed to load AI context')
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [userId, refreshCounter])

  const refresh = useCallback(() => {
    setRefreshCounter((c) => c + 1)
  }, [])

  return {
    context,
    loading,
    error,
    lastUpdated,
    exists,
    refresh,
  }
}

// =============================================================================
// CONVENIENCE HOOKS
// =============================================================================

/**
 * Hook to get just today's status from aiContext
 */
export function useAIContextToday() {
  const { context, loading } = useAIContextDocument()

  return {
    today: context?.today ?? null,
    loading,
    morningCheckIn: context?.today?.morningCheckIn ?? null,
    eveningCheckIn: context?.today?.eveningCheckIn ?? null,
    habitsCompleted: context?.today?.habitsCompleted ?? [],
    habitsExpected: context?.today?.habitsExpected ?? 0,
  }
}

/**
 * Hook to get recent 7 days metrics from aiContext
 */
export function useAIContextRecent() {
  const { context, loading } = useAIContextDocument()

  return {
    recent7Days: context?.recent7Days ?? null,
    loading,
    checkInCount: context?.recent7Days?.checkInCount ?? 0,
    avgMood: context?.recent7Days?.avgMood ?? null,
    moodTrend: context?.recent7Days?.moodTrend ?? 'stable',
  }
}

/**
 * Hook to get streaks from aiContext
 */
export function useAIContextStreaks() {
  const { context, loading } = useAIContextDocument()

  return {
    streaks: context?.streaks ?? null,
    loading,
    checkInStreak: context?.streaks?.checkInStreak ?? 0,
    checkInStreakAtRisk: context?.streaks?.checkInStreakAtRisk ?? false,
    habitStreaks: context?.streaks?.habitStreaks ?? [],
    meetingStreak: context?.streaks?.meetingStreak ?? 0,
  }
}

/**
 * Hook to get context flags from aiContext
 */
export function useAIContextFlags() {
  const { context, loading } = useAIContextDocument()

  return {
    flags: context?.context ?? null,
    loading,
    isHighRisk: context?.context?.isHighRisk ?? false,
    needsEncouragement: context?.context?.needsEncouragement ?? false,
    engagedToday: context?.context?.engagedToday ?? false,
    isWeekend: context?.context?.isWeekend ?? false,
  }
}

export default useAIContextDocument
