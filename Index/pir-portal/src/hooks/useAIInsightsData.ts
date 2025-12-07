import { useQuery } from '@tanstack/react-query'
import {
  collection,
  query,
  orderBy,
  limit,
  where,
  getDocs,
  Timestamp,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useAuth } from '@/contexts/AuthContext'
import type { AIInsight, AIInsightsState } from '@/types/summaries'

// =============================================================================
// AI INSIGHTS HOOK
// =============================================================================

/**
 * Fetches AI-generated insights from the user's subcollection
 * Path: users/{userId}/aiInsights
 */
export function useAIInsightsFromFirestore(limitCount: number = 20): AIInsightsState {
  const { user } = useAuth()
  const userId = user?.uid

  const { data, isLoading, error } = useQuery({
    queryKey: ['aiInsights', userId, limitCount],
    queryFn: async () => {
      if (!userId) return []

      const insightsRef = collection(db, 'users', userId, 'aiInsights')
      const q = query(
        insightsRef,
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      )

      const snapshot = await getDocs(q)
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as AIInsight[]
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })

  const insights = data || []

  // Filter for active (non-dismissed, non-expired) insights
  const now = Timestamp.now()
  const activeInsights = insights.filter((insight) => {
    if (insight.dismissed) return false
    if (insight.expiresAt && insight.expiresAt.toMillis() < now.toMillis()) {
      return false
    }
    return true
  })

  return {
    insights,
    activeInsights,
    loading: isLoading,
    error: error?.message || null,
  }
}

/**
 * Fetches only high-priority active insights
 */
export function useHighPriorityInsights(): AIInsightsState {
  const { user } = useAuth()
  const userId = user?.uid

  const { data, isLoading, error } = useQuery({
    queryKey: ['aiInsights', 'highPriority', userId],
    queryFn: async () => {
      if (!userId) return []

      const insightsRef = collection(db, 'users', userId, 'aiInsights')
      const q = query(
        insightsRef,
        where('dismissed', '==', false),
        where('priority', 'in', ['high', 'critical']),
        orderBy('createdAt', 'desc'),
        limit(10)
      )

      const snapshot = await getDocs(q)
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as AIInsight[]
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 2, // 2 minutes for high priority
  })

  const insights = data || []

  return {
    insights,
    activeInsights: insights,
    loading: isLoading,
    error: error?.message || null,
  }
}

export default useAIInsightsFromFirestore
