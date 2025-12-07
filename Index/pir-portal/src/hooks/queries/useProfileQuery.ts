import { useEffect, useMemo } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
  db,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  onSnapshot,
  Timestamp,
} from '@/lib/firebase'
import { useAuth } from '@/contexts/AuthContext'
import { queryKeys } from '@/lib/queryClient'

// =============================================================================
// TYPES
// =============================================================================

export interface ProfileStats {
  checkInRate: number
  taskCompletionRate: number
  currentStreak: number
  avgMood: number
  daysActive: number
  profileCompletion: number
}

export interface ReflectionStreakData {
  currentStreak: number
  longestStreak: number
  allStreaks: StreakPeriod[]
}

export interface StreakPeriod {
  length: number
  startDate: string
  endDate: string
}

export interface CoachInfo {
  id: string
  firstName?: string
  lastName?: string
  displayName?: string
  email?: string
  phone?: string
  profileImageUrl?: string
}

export interface EmergencyContact {
  id: string
  name: string
  phone: string
  relationship: string
}

export interface CalendarConnection {
  provider: 'google' | 'apple'
  syncEnabled: boolean
  connectedAt: Date
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function daysBetween(date1: Date, date2: Date): number {
  const oneDay = 24 * 60 * 60 * 1000
  return Math.floor(Math.abs((date1.getTime() - date2.getTime()) / oneDay))
}

function toDateString(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

function calculateProfileCompletion(userData: Record<string, unknown>): number {
  const fields = [
    'firstName',
    'lastName',
    'phone',
    'sobrietyDate',
    'substance',
    'dailyCost',
    'emergencyContacts',
    'address',
    'profileImageUrl',
    'dateOfBirth',
  ]

  let completed = 0
  for (const field of fields) {
    const value = userData[field]
    if (value !== undefined && value !== null && value !== '') {
      if (Array.isArray(value)) {
        if (value.length > 0) completed++
      } else if (typeof value === 'object') {
        const objValue = value as Record<string, unknown>
        if (objValue.city || objValue.street) completed++
      } else {
        completed++
      }
    }
  }

  return Math.round((completed / fields.length) * 100)
}

function calculateReflectionStreaks(checkInDates: string[]): ReflectionStreakData {
  if (checkInDates.length === 0) {
    return { currentStreak: 0, longestStreak: 0, allStreaks: [] }
  }

  const sortedDates = [...checkInDates].sort((a, b) => b.localeCompare(a))
  const today = new Date()
  const todayStr = toDateString(today)
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayStr = toDateString(yesterday)

  const allStreaks: StreakPeriod[] = []
  let tempStreak = { length: 0, startDate: '', endDate: '' }

  for (let i = 0; i < sortedDates.length; i++) {
    const currentDate = sortedDates[i]

    if (tempStreak.length === 0) {
      tempStreak = { length: 1, startDate: currentDate, endDate: currentDate }
    } else {
      const current = new Date(currentDate)
      const previous = new Date(tempStreak.startDate)
      const diffDays = Math.floor(
        (previous.getTime() - current.getTime()) / (1000 * 60 * 60 * 24)
      )

      if (diffDays === 1) {
        tempStreak.length++
        tempStreak.startDate = currentDate
      } else {
        allStreaks.push({ ...tempStreak })
        tempStreak = { length: 1, startDate: currentDate, endDate: currentDate }
      }
    }

    if (i === sortedDates.length - 1) {
      allStreaks.push({ ...tempStreak })
    }
  }

  const longestStreak = Math.max(...allStreaks.map((s) => s.length), 0)

  let currentStreak = 0
  if (allStreaks.length > 0) {
    const mostRecent = allStreaks[0]
    if (mostRecent.endDate === todayStr || mostRecent.endDate === yesterdayStr) {
      currentStreak = mostRecent.length
    }
  }

  const filteredStreaks = allStreaks
    .filter((s) => s.length >= 2)
    .sort((a, b) => b.length - a.length)

  return { currentStreak, longestStreak, allStreaks: filteredStreaks }
}

// =============================================================================
// FETCH FUNCTIONS
// =============================================================================

interface ProfileData {
  userData: Record<string, unknown>
  checkIns: Array<{ id: string; morningData?: Record<string, unknown>; eveningData?: Record<string, unknown>; createdAt: Timestamp }>
  allCheckIns: Array<{ id: string; eveningData?: Record<string, unknown>; createdAt: Timestamp }>
  assignments: Array<{ id: string; status: string }>
  streak: number
  calendarConnections: CalendarConnection[]
  coachData: CoachInfo | null
}

async function fetchProfileData(userId: string, coachId?: string): Promise<ProfileData> {
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  // Fetch all data in parallel
  const [
    userDoc,
    checkInsSnap,
    assignmentsSnap,
    streakDoc,
    calendarSnap,
    allCheckInsSnap,
  ] = await Promise.all([
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
    getDocs(
      query(
        collection(db, 'calendarConnections'),
        where('userId', '==', userId)
      )
    ),
    getDocs(
      query(
        collection(db, 'checkIns'),
        where('userId', '==', userId)
      )
    ),
  ])

  // Fetch coach data if available
  let coachData: CoachInfo | null = null
  if (coachId) {
    const coachDoc = await getDoc(doc(db, 'users', coachId))
    if (coachDoc.exists()) {
      const data = coachDoc.data()
      coachData = {
        id: coachDoc.id,
        firstName: data.firstName,
        lastName: data.lastName,
        displayName: data.displayName,
        email: data.email,
        phone: data.phone,
        profileImageUrl: data.profileImageUrl,
      }
    }
  }

  return {
    userData: userDoc.exists() ? userDoc.data() : {},
    checkIns: checkInsSnap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as ProfileData['checkIns'],
    allCheckIns: allCheckInsSnap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as ProfileData['allCheckIns'],
    assignments: assignmentsSnap.docs.map((doc) => ({
      id: doc.id,
      status: doc.data().status,
    })),
    streak: streakDoc.exists() ? streakDoc.data().currentStreak || 0 : 0,
    calendarConnections: calendarSnap.docs.map((doc) => {
      const data = doc.data()
      return {
        provider: data.provider as 'google' | 'apple',
        syncEnabled: data.syncEnabled || false,
        connectedAt: data.connectedAt?.toDate() || new Date(),
      }
    }),
    coachData,
  }
}

// =============================================================================
// MAIN HOOK
// =============================================================================

/**
 * TanStack Query hook for Profile tab data
 *
 * Benefits over original useProfileData:
 * - Single query replaces 6+ separate getDocs calls
 * - Data cached and persists across tab switches
 * - Computed stats derived from cached data
 */
export function useProfileQuery() {
  const { user, userData: authUserData } = useAuth()
  const queryClient = useQueryClient()

  // Main query
  const {
    data,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useQuery({
    queryKey: queryKeys.user.data(user?.uid ?? ''),
    queryFn: () => fetchProfileData(user!.uid, authUserData?.coachId),
    enabled: !!user?.uid,
    staleTime: 5 * 60 * 1000,
  })

  // Real-time listener for check-ins (updates streaks)
  useEffect(() => {
    if (!user?.uid) return

    const q = query(
      collection(db, 'checkIns'),
      where('userId', '==', user.uid)
    )

    const unsubscribe = onSnapshot(
      q,
      () => {
        // Invalidate to trigger refetch when check-ins change
        queryClient.invalidateQueries({ queryKey: queryKeys.user.data(user.uid) })
      },
      (err) => {
        console.error('[useProfileQuery] CheckIns snapshot error:', err)
      }
    )

    return () => unsubscribe()
  }, [user?.uid, queryClient])

  // Computed values
  const computed = useMemo(() => {
    const userData = data?.userData ?? {}
    const checkIns = data?.checkIns ?? []
    const allCheckIns = data?.allCheckIns ?? []
    const assignments = data?.assignments ?? []
    const currentStreak = data?.streak ?? 0
    const calendarConnections = data?.calendarConnections ?? []
    const coachInfo = data?.coachData ?? null

    // Calculate days active
    const accountCreated = (userData.createdAt as Timestamp)?.toDate() || new Date()
    const daysActive = daysBetween(accountCreated, new Date())
    const daysToCheck = Math.min(daysActive, 30)

    // Calculate check-in rate and avg mood
    let morningCheckInCount = 0
    let totalMood = 0
    let moodCount = 0

    checkIns.forEach((ci) => {
      if (ci.morningData) {
        morningCheckInCount++
        const mood = ci.morningData.mood as number | undefined
        if (mood) {
          totalMood += mood
          moodCount++
        }
      }
    })

    const checkInRate = daysToCheck > 0
      ? Math.min(100, Math.round((morningCheckInCount / daysToCheck) * 100))
      : 0

    const avgMood = moodCount > 0
      ? Math.round((totalMood / moodCount) * 10) / 10
      : 0

    // Calculate task completion rate
    const totalAssignments = assignments.length
    const completedAssignments = assignments.filter((a) => a.status === 'completed').length
    const taskCompletionRate = totalAssignments > 0
      ? Math.round((completedAssignments / totalAssignments) * 100)
      : 0

    // Calculate profile completion
    const profileCompletion = calculateProfileCompletion(userData)

    // Calculate streak data from ALL check-ins (not just 30 days)
    const reflectionDates: string[] = []
    allCheckIns.forEach((ci) => {
      if (ci.eveningData && ci.createdAt) {
        const date = ci.createdAt.toDate()
        const dateStr = toDateString(date)
        if (!reflectionDates.includes(dateStr)) {
          reflectionDates.push(dateStr)
        }
      }
    })
    const streakData = calculateReflectionStreaks(reflectionDates)

    // Calendar connections
    const googleConnected = calendarConnections.some(
      (c) => c.provider === 'google' && c.syncEnabled
    )
    const appleConnected = calendarConnections.some(
      (c) => c.provider === 'apple' && c.syncEnabled
    )

    const stats: ProfileStats = {
      checkInRate,
      taskCompletionRate,
      currentStreak,
      avgMood,
      daysActive,
      profileCompletion,
    }

    return {
      stats,
      streakData,
      coachInfo,
      googleConnected,
      appleConnected,
    }
  }, [data])

  return {
    // Data
    stats: computed.stats,
    streakData: computed.streakData,
    coachInfo: computed.coachInfo,

    // Calendar states
    googleConnected: computed.googleConnected,
    appleConnected: computed.appleConnected,

    // Loading states
    loading: isLoading,
    isFetching,
    error: error instanceof Error ? error.message : null,

    // Actions
    refreshStats: refetch,
  }
}

export default useProfileQuery
