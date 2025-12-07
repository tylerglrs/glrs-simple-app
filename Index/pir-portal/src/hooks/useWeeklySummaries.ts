import { useQuery } from '@tanstack/react-query'
import {
  collection,
  query,
  orderBy,
  limit,
  getDocs,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useAuth } from '@/contexts/AuthContext'
import type { WeeklySummary, WeeklySummariesState } from '@/types/summaries'

// =============================================================================
// WEEKLY SUMMARIES HOOK
// =============================================================================

/**
 * Fetches weekly summaries from the user's subcollection
 * Path: users/{userId}/weeklySummaries
 */
export function useWeeklySummaries(limitCount: number = 12): WeeklySummariesState {
  const { user } = useAuth()
  const userId = user?.uid

  const { data, isLoading, error } = useQuery({
    queryKey: ['weeklySummaries', userId, limitCount],
    queryFn: async () => {
      if (!userId) return []

      const summariesRef = collection(db, 'users', userId, 'weeklySummaries')
      const q = query(
        summariesRef,
        orderBy('weekStartDate', 'desc'),
        limit(limitCount)
      )

      const snapshot = await getDocs(q)
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as WeeklySummary[]
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })

  // Get current week (most recent)
  const summaries = data || []
  const currentWeek = summaries.length > 0 ? summaries[0] : null

  return {
    summaries,
    currentWeek,
    loading: isLoading,
    error: error?.message || null,
  }
}

export default useWeeklySummaries
