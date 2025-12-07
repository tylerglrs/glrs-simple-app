/**
 * Centralized Real-Time Listener Manager
 *
 * This module manages all Firestore real-time listeners in a single place,
 * preventing duplicate subscriptions and providing clean cleanup.
 *
 * Key features:
 * - Single listener per collection/query
 * - Automatic cleanup on unmount
 * - TanStack Query cache updates
 * - Reference counting for shared listeners
 */

import { useEffect, useRef } from 'react'
import {
  db,
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  limit,
} from '@/lib/firebase'
import { useQueryClient, QueryClient } from '@tanstack/react-query'
import { useAuth } from '@/contexts/AuthContext'
import { queryKeys } from '@/lib/queryClient'
import type { Unsubscribe } from 'firebase/firestore'

// =============================================================================
// TYPES
// =============================================================================

type ListenerKey = string

interface ListenerEntry {
  unsubscribe: Unsubscribe
  refCount: number
}

// Global listener registry (singleton)
const listeners = new Map<ListenerKey, ListenerEntry>()

// =============================================================================
// LISTENER MANAGEMENT
// =============================================================================

function addListener(key: ListenerKey, unsubscribe: Unsubscribe): void {
  const existing = listeners.get(key)
  if (existing) {
    existing.refCount++
    return
  }
  listeners.set(key, { unsubscribe, refCount: 1 })
}

function removeListener(key: ListenerKey): void {
  const existing = listeners.get(key)
  if (!existing) return

  existing.refCount--
  if (existing.refCount <= 0) {
    existing.unsubscribe()
    listeners.delete(key)
    console.log(`[RealtimeManager] Removed listener: ${key}`)
  }
}

function hasListener(key: ListenerKey): boolean {
  return listeners.has(key)
}

// =============================================================================
// CHECK-INS LISTENER
// =============================================================================

export function subscribeToCheckIns(
  userId: string,
  queryClient: QueryClient
): () => void {
  const key = `checkIns:${userId}`

  if (hasListener(key)) {
    const existing = listeners.get(key)!
    existing.refCount++
    return () => removeListener(key)
  }

  const q = query(
    collection(db, 'checkIns'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
    limit(100)
  )

  const unsubscribe = onSnapshot(
    q,
    (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      queryClient.setQueryData(queryKeys.checkIns.all(userId), data)
    },
    (error) => {
      console.error('[RealtimeManager] CheckIns error:', error)
    }
  )

  addListener(key, unsubscribe)
  console.log(`[RealtimeManager] Added listener: ${key}`)

  return () => removeListener(key)
}

// =============================================================================
// GOALS LISTENER
// =============================================================================

export function subscribeToGoals(
  userId: string,
  queryClient: QueryClient
): () => void {
  const key = `goals:${userId}`

  if (hasListener(key)) {
    const existing = listeners.get(key)!
    existing.refCount++
    return () => removeListener(key)
  }

  const q = query(
    collection(db, 'goals'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  )

  const unsubscribe = onSnapshot(
    q,
    (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      queryClient.setQueryData(queryKeys.goals.all(userId), data)
    },
    (error) => {
      console.error('[RealtimeManager] Goals error:', error)
    }
  )

  addListener(key, unsubscribe)
  console.log(`[RealtimeManager] Added listener: ${key}`)

  return () => removeListener(key)
}

// =============================================================================
// HABITS LISTENER
// =============================================================================

export function subscribeToHabits(
  userId: string,
  queryClient: QueryClient
): () => void {
  const key = `habits:${userId}`

  if (hasListener(key)) {
    const existing = listeners.get(key)!
    existing.refCount++
    return () => removeListener(key)
  }

  const q = query(
    collection(db, 'habits'),
    where('userId', '==', userId),
    where('isActive', '==', true),
    orderBy('createdAt', 'desc')
  )

  const unsubscribe = onSnapshot(
    q,
    (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      queryClient.setQueryData(queryKeys.habits.all(userId), data)
    },
    (error) => {
      console.error('[RealtimeManager] Habits error:', error)
    }
  )

  addListener(key, unsubscribe)
  console.log(`[RealtimeManager] Added listener: ${key}`)

  return () => removeListener(key)
}

// =============================================================================
// CONVERSATIONS LISTENER
// =============================================================================

export function subscribeToConversations(
  userId: string,
  queryClient: QueryClient
): () => void {
  const key = `conversations:${userId}`

  if (hasListener(key)) {
    const existing = listeners.get(key)!
    existing.refCount++
    return () => removeListener(key)
  }

  const q = query(
    collection(db, 'conversations'),
    where('participants', 'array-contains', userId),
    orderBy('lastMessageTimestamp', 'desc')
  )

  const unsubscribe = onSnapshot(
    q,
    (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      queryClient.setQueryData(queryKeys.conversations.all(userId), data)
    },
    (error) => {
      console.error('[RealtimeManager] Conversations error:', error)
    }
  )

  addListener(key, unsubscribe)
  console.log(`[RealtimeManager] Added listener: ${key}`)

  return () => removeListener(key)
}

// =============================================================================
// COMMUNITY MESSAGES LISTENER
// =============================================================================

export function subscribeToCommunityMessages(
  topicRoomId: string | null,
  queryClient: QueryClient
): () => void {
  const key = `communityMessages:${topicRoomId || 'main'}`

  if (hasListener(key)) {
    const existing = listeners.get(key)!
    existing.refCount++
    return () => removeListener(key)
  }

  const messagesRef = collection(db, 'messages')
  let q

  if (topicRoomId) {
    q = query(
      messagesRef,
      where('type', '==', 'topic'),
      where('topicRoomId', '==', topicRoomId),
      orderBy('createdAt', 'desc'),
      limit(100)
    )
  } else {
    q = query(
      messagesRef,
      where('type', '==', 'community'),
      orderBy('createdAt', 'desc'),
      limit(100)
    )
  }

  const unsubscribe = onSnapshot(
    q,
    (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      queryClient.setQueryData(
        queryKeys.community.messages(topicRoomId || undefined),
        data
      )
    },
    (error) => {
      console.error('[RealtimeManager] CommunityMessages error:', error)
    }
  )

  addListener(key, unsubscribe)
  console.log(`[RealtimeManager] Added listener: ${key}`)

  return () => removeListener(key)
}

// =============================================================================
// RESOURCES LISTENER
// =============================================================================

export function subscribeToResources(queryClient: QueryClient): () => void {
  const key = 'resources:all'

  if (hasListener(key)) {
    const existing = listeners.get(key)!
    existing.refCount++
    return () => removeListener(key)
  }

  const q = query(
    collection(db, 'resources'),
    where('isPublished', '==', true),
    orderBy('createdAt', 'desc'),
    limit(100)
  )

  const unsubscribe = onSnapshot(
    q,
    (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      queryClient.setQueryData(queryKeys.resources.all(), data)
    },
    (error) => {
      console.error('[RealtimeManager] Resources error:', error)
    }
  )

  addListener(key, unsubscribe)
  console.log(`[RealtimeManager] Added listener: ${key}`)

  return () => removeListener(key)
}

// =============================================================================
// HOOK: useRealtimeListeners
// =============================================================================

/**
 * Hook to set up all real-time listeners for the current user
 *
 * This hook should be used in MainLayout to set up listeners once
 * when the app loads. The listeners will automatically update
 * TanStack Query cache when data changes.
 *
 * @example
 * ```tsx
 * function MainLayout({ children }: MainLayoutProps) {
 *   useRealtimeListeners()
 *   return <div>{children}</div>
 * }
 * ```
 */
export function useRealtimeListeners(): void {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const cleanupRef = useRef<(() => void)[]>([])

  useEffect(() => {
    if (!user?.uid) return

    // Set up all listeners
    const cleanups = [
      subscribeToCheckIns(user.uid, queryClient),
      subscribeToGoals(user.uid, queryClient),
      subscribeToHabits(user.uid, queryClient),
      subscribeToConversations(user.uid, queryClient),
      subscribeToResources(queryClient),
    ]

    cleanupRef.current = cleanups

    console.log('[RealtimeManager] All listeners initialized')

    return () => {
      cleanups.forEach((cleanup) => cleanup())
      console.log('[RealtimeManager] All listeners cleaned up')
    }
  }, [user?.uid, queryClient])
}

// =============================================================================
// UTILITIES
// =============================================================================

/**
 * Get the current number of active listeners
 */
export function getActiveListenerCount(): number {
  return listeners.size
}

/**
 * Force cleanup all listeners (for testing/debugging)
 */
export function cleanupAllListeners(): void {
  listeners.forEach((entry) => entry.unsubscribe())
  listeners.clear()
  console.log('[RealtimeManager] All listeners force cleaned')
}

export default useRealtimeListeners
