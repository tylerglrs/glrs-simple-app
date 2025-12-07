/**
 * App Data Prefetch Hook
 *
 * This hook prefetches critical data when the app first loads, ensuring
 * that data is already in cache when users navigate between tabs.
 *
 * Key features:
 * - Prefetches all tab data on app mount
 * - Sets up centralized real-time listeners
 * - Uses TanStack Query's prefetchQuery for background loading
 * - Data stays in cache for 30 minutes (gcTime)
 * - Reduces perceived load time when switching tabs
 *
 * This creates the "Instagram-like" instant tab switching experience
 * by ensuring data is already available before the user navigates.
 */

import { useEffect, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  limit,
  Timestamp,
  doc,
  getDoc,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { queryKeys } from '@/lib/queryClient'
import { useAuth } from '@/contexts/AuthContext'
import { useRealtimeListeners } from '@/lib/realtimeManager'

// =============================================================================
// PREFETCH FUNCTIONS
// =============================================================================

/**
 * Prefetch check-ins data (last 100 for ~3 months)
 */
async function prefetchCheckIns(userId: string) {
  const checkInsRef = collection(db, 'checkIns')
  const q = query(
    checkInsRef,
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
    limit(100)
  )

  const snapshot = await getDocs(q)
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }))
}

/**
 * Prefetch goals data
 */
async function prefetchGoals(userId: string) {
  const goalsRef = collection(db, 'goals')
  const q = query(
    goalsRef,
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  )

  const snapshot = await getDocs(q)
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }))
}

/**
 * Prefetch objectives data
 */
async function prefetchObjectives(userId: string) {
  const objectivesRef = collection(db, 'objectives')
  const q = query(
    objectivesRef,
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  )

  const snapshot = await getDocs(q)
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }))
}

/**
 * Prefetch habits data
 */
async function prefetchHabits(userId: string) {
  const habitsRef = collection(db, 'habits')
  const q = query(
    habitsRef,
    where('userId', '==', userId),
    where('isActive', '==', true),
    orderBy('createdAt', 'desc')
  )

  const snapshot = await getDocs(q)
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }))
}

/**
 * Prefetch habit completions (last 7 days for habit tracking)
 */
async function prefetchHabitCompletions(userId: string) {
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  const completionsRef = collection(db, 'habitCompletions')
  const q = query(
    completionsRef,
    where('userId', '==', userId),
    where('completedAt', '>=', Timestamp.fromDate(sevenDaysAgo)),
    orderBy('completedAt', 'desc')
  )

  const snapshot = await getDocs(q)
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }))
}

/**
 * Prefetch resources (shared across users)
 */
async function prefetchResources() {
  const resourcesRef = collection(db, 'resources')
  const q = query(
    resourcesRef,
    where('isPublished', '==', true),
    orderBy('createdAt', 'desc'),
    limit(100)
  )

  const snapshot = await getDocs(q)
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }))
}

/**
 * Prefetch conversations (for messages tab)
 */
async function prefetchConversations(userId: string) {
  const conversationsRef = collection(db, 'conversations')
  const q = query(
    conversationsRef,
    where('participants', 'array-contains', userId),
    orderBy('lastMessageTimestamp', 'desc'),
    limit(20)
  )

  const snapshot = await getDocs(q)
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }))
}

/**
 * Prefetch saved meetings (for meetings tab)
 */
async function prefetchSavedMeetings(userId: string) {
  const savedMeetingsRef = collection(db, 'users', userId, 'savedMeetings')
  const q = query(
    savedMeetingsRef,
    orderBy('addedAt', 'desc')
  )

  const snapshot = await getDocs(q)
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }))
}

/**
 * Prefetch external meetings (AA/NA meetings)
 */
async function prefetchExternalMeetings() {
  const meetingsRef = collection(db, 'externalMeetings')
  const q = query(
    meetingsRef,
    orderBy('name', 'asc'),
    limit(5000)
  )

  const snapshot = await getDocs(q)
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }))
}

/**
 * Prefetch journey data (user, savings, breakthroughs)
 */
async function prefetchJourneyData(userId: string) {
  const ninetyDaysAgo = new Date()
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90)

  const [userDoc, checkInsSnap, savingsSnap, breakthroughsSnap] = await Promise.all([
    getDoc(doc(db, 'users', userId)),
    getDocs(
      query(
        collection(db, 'checkIns'),
        where('userId', '==', userId),
        where('createdAt', '>=', Timestamp.fromDate(ninetyDaysAgo)),
        orderBy('createdAt', 'desc')
      )
    ),
    getDocs(
      query(
        collection(db, 'savingsGoals'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      )
    ),
    getDocs(
      query(
        collection(db, 'breakthroughs'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      )
    ),
  ])

  return {
    userData: userDoc.exists() ? userDoc.data() : null,
    checkIns: checkInsSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
    savingsGoals: savingsSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
    breakthroughs: breakthroughsSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
  }
}

/**
 * Prefetch profile data
 */
async function prefetchProfileData(userId: string, coachId?: string) {
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const [userDoc, checkInsSnap, assignmentsSnap, streakDoc] = await Promise.all([
    getDoc(doc(db, 'users', userId)),
    getDocs(
      query(
        collection(db, 'checkIns'),
        where('userId', '==', userId),
        where('createdAt', '>=', Timestamp.fromDate(thirtyDaysAgo))
      )
    ),
    getDocs(
      query(
        collection(db, 'assignments'),
        where('userId', '==', userId)
      )
    ),
    getDoc(doc(db, 'streaks', userId)),
  ])

  let coachData: { id: string; [key: string]: unknown } | null = null
  if (coachId) {
    const coachDoc = await getDoc(doc(db, 'users', coachId))
    if (coachDoc.exists()) {
      coachData = { id: coachDoc.id, ...coachDoc.data() }
    }
  }

  return {
    userData: userDoc.exists() ? userDoc.data() : {},
    checkIns: checkInsSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
    assignments: assignmentsSnap.docs.map((doc) => ({ id: doc.id, status: doc.data().status })),
    streak: streakDoc.exists() ? streakDoc.data().currentStreak || 0 : 0,
    coachData,
  }
}

// =============================================================================
// MAIN HOOK
// =============================================================================

interface UseAppDataPrefetchOptions {
  /**
   * Whether to enable prefetching. Default: true
   */
  enabled?: boolean
  /**
   * Delay before starting prefetch (ms). Default: 100
   * Small delay to let critical UI render first
   */
  delay?: number
}

interface UseAppDataPrefetchResult {
  /**
   * Whether prefetching is in progress
   */
  isPrefetching: boolean
  /**
   * Number of queries currently being prefetched
   */
  pendingCount: number
  /**
   * Whether all prefetch operations are complete
   */
  isComplete: boolean
}

/**
 * Hook that prefetches app data on mount for instant tab switching
 *
 * This hook should be used in the MainLayout component that mounts
 * after the user is authenticated.
 *
 * The prefetch happens in the background and doesn't block the UI.
 * Data is cached for 30 minutes, so subsequent navigations are instant.
 *
 * @example
 * ```tsx
 * function MainLayout({ children }: MainLayoutProps) {
 *   const { isPrefetching, isComplete } = useAppDataPrefetch()
 *
 *   return (
 *     <div>
 *       {children}
 *       {isPrefetching && <PrefetchIndicator />}
 *     </div>
 *   )
 * }
 * ```
 */
export function useAppDataPrefetch(
  options: UseAppDataPrefetchOptions = {}
): UseAppDataPrefetchResult {
  const { enabled = true, delay = 100 } = options
  const { user, userData } = useAuth()
  const queryClient = useQueryClient()
  const hasPrefetched = useRef(false)
  const pendingRef = useRef(0)

  // Set up centralized real-time listeners
  useRealtimeListeners()

  useEffect(() => {
    // Only prefetch once per session
    if (!enabled || !user?.uid || hasPrefetched.current) return

    // Mark as prefetched immediately to prevent duplicate calls
    hasPrefetched.current = true

    const prefetch = async () => {
      const userId = user.uid

      // Track pending queries (now 11 total)
      pendingRef.current = 11

      // Prefetch all critical data in parallel
      const prefetchPromises = [
        // Check-ins (Tasks, Journey tabs)
        queryClient.prefetchQuery({
          queryKey: queryKeys.checkIns.all(userId),
          queryFn: () => prefetchCheckIns(userId),
          staleTime: 5 * 60 * 1000,
        }).finally(() => pendingRef.current--),

        // Goals (Tasks, Journey tabs)
        queryClient.prefetchQuery({
          queryKey: queryKeys.goals.all(userId),
          queryFn: async () => {
            const [goals, objectives] = await Promise.all([
              prefetchGoals(userId),
              prefetchObjectives(userId),
            ])
            return { goals, objectives }
          },
          staleTime: 5 * 60 * 1000,
        }).finally(() => pendingRef.current--),

        // Habits (Tasks tab)
        queryClient.prefetchQuery({
          queryKey: queryKeys.habits.all(userId),
          queryFn: () => prefetchHabits(userId),
          staleTime: 5 * 60 * 1000,
        }).finally(() => pendingRef.current--),

        // Habit completions (Tasks tab)
        queryClient.prefetchQuery({
          queryKey: queryKeys.habits.completions(userId),
          queryFn: () => prefetchHabitCompletions(userId),
          staleTime: 5 * 60 * 1000,
        }).finally(() => pendingRef.current--),

        // Resources (Resources tab - shared data)
        queryClient.prefetchQuery({
          queryKey: queryKeys.resources.all(),
          queryFn: () => prefetchResources(),
          staleTime: 10 * 60 * 1000, // Resources change less frequently
        }).finally(() => pendingRef.current--),

        // Conversations (Messages tab)
        queryClient.prefetchQuery({
          queryKey: queryKeys.conversations.all(userId),
          queryFn: () => prefetchConversations(userId),
          staleTime: 5 * 60 * 1000,
        }).finally(() => pendingRef.current--),

        // Saved meetings (Meetings tab)
        queryClient.prefetchQuery({
          queryKey: queryKeys.meetings.saved(userId),
          queryFn: () => prefetchSavedMeetings(userId),
          staleTime: 5 * 60 * 1000,
        }).finally(() => pendingRef.current--),

        // External meetings (Meetings tab - shared data)
        queryClient.prefetchQuery({
          queryKey: queryKeys.meetings.external(),
          queryFn: () => prefetchExternalMeetings(),
          staleTime: 10 * 60 * 1000, // External meetings change weekly
        }).finally(() => pendingRef.current--),

        // Journey data (Journey tab)
        queryClient.prefetchQuery({
          queryKey: queryKeys.journey.all(userId),
          queryFn: () => prefetchJourneyData(userId),
          staleTime: 5 * 60 * 1000,
        }).finally(() => pendingRef.current--),

        // Profile data (Profile tab)
        queryClient.prefetchQuery({
          queryKey: queryKeys.user.data(userId),
          queryFn: () => prefetchProfileData(userId, userData?.coachId),
          staleTime: 5 * 60 * 1000,
        }).finally(() => pendingRef.current--),

        // Community rooms (Community tab)
        queryClient.prefetchQuery({
          queryKey: queryKeys.community.rooms(),
          queryFn: async () => {
            const roomsRef = collection(db, 'topicRooms')
            const q = query(roomsRef, orderBy('name', 'asc'))
            const snapshot = await getDocs(q)
            return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
          },
          staleTime: 5 * 60 * 1000,
        }).finally(() => pendingRef.current--),
      ]

      try {
        await Promise.allSettled(prefetchPromises)
        console.log('[AppDataPrefetch] All critical data prefetched (11 queries)')
      } catch (error) {
        // Prefetch errors are non-critical - data will be fetched on demand
        console.warn('[AppDataPrefetch] Some prefetch operations failed:', error)
      }
    }

    // Delay prefetch slightly to let critical UI render first
    const timeoutId = setTimeout(prefetch, delay)

    return () => clearTimeout(timeoutId)
  }, [enabled, user?.uid, userData?.coachId, queryClient, delay])

  return {
    isPrefetching: pendingRef.current > 0,
    pendingCount: pendingRef.current,
    isComplete: hasPrefetched.current && pendingRef.current === 0,
  }
}

export default useAppDataPrefetch
