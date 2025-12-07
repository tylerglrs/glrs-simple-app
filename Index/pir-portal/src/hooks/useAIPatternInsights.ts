/**
 * useAIPatternInsights - Hook for reading AI-generated pattern insights from Firestore
 * Project Lighthouse: AI Pattern Insights Redesign
 *
 * Reads GPT-generated insight cards from:
 * - users/{userId}/weeklyInsights/aiPatterns_{weekId}
 *
 * Each insight card has:
 * - AI-generated personalized message
 * - AI-chosen action (technique, journal, meeting, post, none)
 * - Expandable modal content
 */

import { useState, useEffect, useMemo, useCallback } from 'react'
import { doc, onSnapshot } from 'firebase/firestore'
import { httpsCallable } from 'firebase/functions'
import { db, functions } from '@/lib/firebase'
import { useAuth } from '@/contexts/AuthContext'

// =============================================================================
// TYPES
// =============================================================================

export type MetricType = 'mood' | 'anxiety' | 'cravings' | 'sleep' | 'energy'
export type InsightType = 'observation' | 'warning' | 'recommendation'
export type ActionType = 'technique' | 'journal' | 'meeting' | 'post' | 'none'
export type SeverityLevel = 'info' | 'warning' | 'alert'

export interface AIPatternInsight {
  id: string
  metric: MetricType
  type: InsightType
  title: string
  message: string
  icon: string
  severity: SeverityLevel
  actionType: ActionType
  actionId: string | null
  modalTitle: string
  modalContent: string
}

export interface AIPatternInsightsData {
  type: 'aiPatterns'
  weekId: string
  userId: string
  insights: AIPatternInsight[]
  insightsByMetric: Record<MetricType, AIPatternInsight[]>
  totalCards: number
  tokenUsage: {
    inputTokens: number
    outputTokens: number
    totalTokens: number
  }
  generatedAt: Date
  expiresAt: Date
}

export interface UseAIPatternInsightsReturn {
  data: AIPatternInsightsData | null
  loading: boolean
  error: Error | null
  weekId: string
  // Get insights for a specific metric
  getInsightsForMetric: (metric: MetricType) => AIPatternInsight[]
  // Trigger manual generation
  regenerate: () => Promise<{ success: boolean; error?: string }>
  regenerating: boolean
}

// =============================================================================
// HELPERS
// =============================================================================

function getWeekId(date = new Date()): string {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const dayNum = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7)
  return `${d.getUTCFullYear()}-W${weekNo.toString().padStart(2, '0')}`
}

// =============================================================================
// MAIN HOOK
// =============================================================================

export function useAIPatternInsights(): UseAIPatternInsightsReturn {
  const { user } = useAuth()
  const [data, setData] = useState<AIPatternInsightsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [regenerating, setRegenerating] = useState(false)

  const weekId = useMemo(() => getWeekId(), [])

  // Subscribe to Firestore document
  useEffect(() => {
    if (!user?.uid) {
      setLoading(false)
      return
    }

    const docRef = doc(db, 'users', user.uid, 'weeklyInsights', `aiPatterns_${weekId}`)

    const unsubscribe = onSnapshot(
      docRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const docData = snapshot.data()
          setData({
            ...docData,
            generatedAt: docData.generatedAt?.toDate?.() || new Date(),
            expiresAt: docData.expiresAt instanceof Date
              ? docData.expiresAt
              : new Date(docData.expiresAt),
          } as AIPatternInsightsData)
        } else {
          setData(null)
        }
        setLoading(false)
      },
      (err) => {
        console.error('[useAIPatternInsights] Error:', err)
        setError(err)
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [user?.uid, weekId])

  // Get insights for a specific metric
  const getInsightsForMetric = useCallback((metric: MetricType): AIPatternInsight[] => {
    if (!data) return []
    return data.insightsByMetric?.[metric] || data.insights?.filter(i => i.metric === metric) || []
  }, [data])

  // Trigger manual regeneration
  const regenerate = useCallback(async (): Promise<{ success: boolean; error?: string }> => {
    if (!user?.uid) {
      return { success: false, error: 'Not authenticated' }
    }

    setRegenerating(true)
    try {
      const generateFn = httpsCallable(functions, 'generateAIPatternInsightsManual')
      const result = await generateFn({ userId: user.uid })
      const response = result.data as { success: boolean; error?: string }

      if (!response.success) {
        return { success: false, error: response.error || 'Generation failed' }
      }

      return { success: true }
    } catch (err) {
      console.error('[useAIPatternInsights] Regeneration failed:', err)
      return { success: false, error: (err as Error).message }
    } finally {
      setRegenerating(false)
    }
  }, [user?.uid])

  return {
    data,
    loading,
    error,
    weekId,
    getInsightsForMetric,
    regenerate,
    regenerating,
  }
}

// =============================================================================
// HELPER HOOK: Get insights for single metric
// =============================================================================

export function useMetricInsights(metric: MetricType): {
  insights: AIPatternInsight[]
  loading: boolean
  error: Error | null
} {
  const { data, loading, error, getInsightsForMetric } = useAIPatternInsights()

  const insights = useMemo(() => {
    return getInsightsForMetric(metric)
  }, [getInsightsForMetric, metric])

  return { insights, loading, error }
}

export default useAIPatternInsights
