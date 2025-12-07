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
import type { MonthlySummary, MonthlySummariesState } from '@/types/summaries'

// =============================================================================
// MONTHLY SUMMARIES HOOK
// =============================================================================

/**
 * Fetches monthly summaries from the user's subcollection
 * Path: users/{userId}/monthlySummaries
 */
export function useMonthlySummaries(limitCount: number = 12): MonthlySummariesState {
  const { user } = useAuth()
  const userId = user?.uid

  const { data, isLoading, error } = useQuery({
    queryKey: ['monthlySummaries', userId, limitCount],
    queryFn: async () => {
      if (!userId) return []

      const summariesRef = collection(db, 'users', userId, 'monthlySummaries')
      const q = query(
        summariesRef,
        orderBy('monthStartDate', 'desc'),
        limit(limitCount)
      )

      const snapshot = await getDocs(q)
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as MonthlySummary[]
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 30, // 30 minutes (monthly data changes less frequently)
  })

  // Get current month (most recent)
  const summaries = data || []
  const currentMonth = summaries.length > 0 ? summaries[0] : null

  return {
    summaries,
    currentMonth,
    loading: isLoading,
    error: error?.message || null,
  }
}

export default useMonthlySummaries
