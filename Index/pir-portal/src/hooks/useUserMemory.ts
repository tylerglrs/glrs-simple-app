import { useQuery } from '@tanstack/react-query'
import {
  collection,
  query,
  orderBy,
  getDocs,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useAuth } from '@/contexts/AuthContext'
import type {
  UserMemory,
  UserMemoryState,
  MemoryCategory,
} from '@/types/summaries'

// =============================================================================
// USER MEMORY HOOK
// =============================================================================

/**
 * Fetches AI memory entries from the user's subcollection
 * Path: users/{userId}/memory
 */
export function useUserMemory(): UserMemoryState {
  const { user } = useAuth()
  const userId = user?.uid

  const { data, isLoading, error } = useQuery({
    queryKey: ['userMemory', userId],
    queryFn: async () => {
      if (!userId) return []

      const memoryRef = collection(db, 'users', userId, 'memory')
      const q = query(
        memoryRef,
        orderBy('lastReinforcedAt', 'desc')
      )

      const snapshot = await getDocs(q)
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as UserMemory[]
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 10, // 10 minutes (memory updates less frequently)
  })

  const memories = data || []

  // Group memories by category
  const byCategory = memories.reduce((acc, memory) => {
    const category = memory.category as MemoryCategory
    if (!acc[category]) {
      acc[category] = []
    }
    acc[category].push(memory)
    return acc
  }, {} as Record<MemoryCategory, UserMemory[]>)

  return {
    memories,
    byCategory,
    loading: isLoading,
    error: error?.message || null,
  }
}

/**
 * Helper to get memories for a specific category
 */
export function useMemoryByCategory(category: MemoryCategory) {
  const { byCategory, loading, error } = useUserMemory()

  return {
    memories: byCategory[category] || [],
    loading,
    error,
  }
}

/**
 * Helper to get the most recent memory for a specific key
 */
export function useMemoryValue(key: string) {
  const { memories, loading, error } = useUserMemory()

  const memory = memories.find((m) => m.key === key)

  return {
    memory,
    value: memory?.value,
    confidence: memory?.confidence,
    loading,
    error,
  }
}

export default useUserMemory
