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
  orderBy,
  onSnapshot,
  Timestamp,
} from '@/lib/firebase'
import { useAuth } from '@/contexts/AuthContext'
import { queryKeys } from '@/lib/queryClient'

// =============================================================================
// TYPES
// =============================================================================

export interface JourneyUserData {
  sobrietyDate?: string
  dailyCost?: number
  firstName?: string
  lastName?: string
  substance?: string
  profileImageUrl?: string
}

export interface CheckIn {
  id: string
  userId: string
  createdAt: Timestamp
  morningData?: {
    mood?: number
    craving?: number
    anxiety?: number
    sleep?: number
    notes?: string
  }
  eveningData?: {
    overallDay?: number
    gratitude?: string
    gratitudeTheme?: string
    challenges?: string
    tomorrowGoal?: string
  }
}

export interface Milestone {
  days: number
  title: string
  icon: string
  achieved: boolean
  date: Date
  daysUntil: number
}

export interface SavingsGoal {
  id: string
  userId: string
  name: string
  targetAmount: number
  currentAmount: number
  createdAt: Timestamp
}

export interface Breakthrough {
  id: string
  userId: string
  title: string
  description: string
  createdAt: Timestamp
}

export interface GratitudeEntry {
  id: string
  date: string
  gratitude: string
  overallDay?: number
}

export interface ChallengeEntry {
  id: string
  date: string
  challenges: string
  overallDay?: number
}

// =============================================================================
// MILESTONE DEFINITIONS
// =============================================================================

const MILESTONE_DEFINITIONS = [
  { days: 1, title: '1 Day', icon: '🌱' },
  { days: 7, title: '1 Week', icon: '🌿' },
  { days: 14, title: '2 Weeks', icon: '🍀' },
  { days: 30, title: '1 Month', icon: '🌲' },
  { days: 60, title: '2 Months', icon: '🌳' },
  { days: 90, title: '3 Months', icon: '🌴' },
  { days: 180, title: '6 Months', icon: '🏔️' },
  { days: 365, title: '1 Year', icon: '🌟' },
  { days: 730, title: '2 Years', icon: '💎' },
  { days: 1095, title: '3 Years', icon: '🏆' },
  { days: 1825, title: '5 Years', icon: '👑' },
  { days: 3650, title: '10 Years', icon: '🎖️' },
]

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

export function calculateSobrietyDays(sobrietyDate: string | undefined): number {
  if (!sobrietyDate) return 0

  const [year, month, day] = sobrietyDate.split('-').map(Number)
  const startDate = new Date(year, month - 1, day)
  startDate.setHours(0, 0, 0, 0)

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const diffTime = today.getTime() - startDate.getTime()
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

  return Math.max(0, diffDays)
}

export function getRecoveryMilestones(sobrietyDate: string | undefined): Milestone[] {
  if (!sobrietyDate) return []

  const daysSober = calculateSobrietyDays(sobrietyDate)
  const [year, month, day] = sobrietyDate.split('-').map(Number)
  const startDate = new Date(year, month - 1, day)

  return MILESTONE_DEFINITIONS.map((m) => {
    const achieved = daysSober >= m.days
    const milestoneDate = new Date(startDate)
    milestoneDate.setDate(milestoneDate.getDate() + m.days)

    return {
      ...m,
      achieved,
      date: milestoneDate,
      daysUntil: achieved ? 0 : m.days - daysSober,
    }
  })
}

// =============================================================================
// FETCH FUNCTIONS
// =============================================================================

interface JourneyData {
  userData: JourneyUserData | null
  checkIns: CheckIn[]
  savingsGoals: SavingsGoal[]
  breakthroughs: Breakthrough[]
}

async function fetchJourneyData(userId: string): Promise<JourneyData> {
  const ninetyDaysAgo = new Date()
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90)

  // Fetch all data in parallel
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
    userData: userDoc.exists() ? (userDoc.data() as JourneyUserData) : null,
    checkIns: checkInsSnap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as CheckIn[],
    savingsGoals: savingsSnap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as SavingsGoal[],
    breakthroughs: breakthroughsSnap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Breakthrough[],
  }
}

// =============================================================================
// MAIN HOOK
// =============================================================================

/**
 * TanStack Query hook for Journey tab data
 *
 * Benefits over original useJourneyData:
 * - Single query replaces 4 separate getDocs calls
 * - Data cached and persists across tab switches
 * - Real-time listener updates cache automatically
 * - Computed values derived from cached data
 */
export function useJourneyQuery() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  // Main query - fetches all journey data
  const {
    data,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useQuery({
    queryKey: queryKeys.journey?.all?.(user?.uid ?? '') ?? ['journey', user?.uid ?? ''],
    queryFn: () => fetchJourneyData(user!.uid),
    enabled: !!user?.uid,
    staleTime: 5 * 60 * 1000, // Fresh for 5 minutes
  })

  // Real-time listener for check-ins updates
  useEffect(() => {
    if (!user?.uid) return

    const ninetyDaysAgo = new Date()
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90)

    const q = query(
      collection(db, 'checkIns'),
      where('userId', '==', user.uid),
      where('createdAt', '>=', Timestamp.fromDate(ninetyDaysAgo)),
      orderBy('createdAt', 'desc')
    )

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const checkIns = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as CheckIn[]

        // Update only the checkIns portion of the cache
        queryClient.setQueryData(
          queryKeys.journey?.all?.(user.uid) ?? ['journey', user.uid],
          (old: JourneyData | undefined) => {
            if (!old) return old
            return { ...old, checkIns }
          }
        )
      },
      (err) => {
        console.error('[useJourneyQuery] CheckIns snapshot error:', err)
      }
    )

    return () => unsubscribe()
  }, [user?.uid, queryClient])

  // Computed values
  const computed = useMemo(() => {
    const userData = data?.userData ?? null
    const checkIns = data?.checkIns ?? []
    const savingsGoals = data?.savingsGoals ?? []
    const breakthroughs = data?.breakthroughs ?? []

    const daysSober = calculateSobrietyDays(userData?.sobrietyDate)
    const milestones = getRecoveryMilestones(userData?.sobrietyDate)
    const nextMilestone = milestones.find((m) => !m.achieved) || null

    // Extract gratitude entries from check-ins
    const gratitudeEntries: GratitudeEntry[] = checkIns
      .filter((ci) => ci.eveningData?.gratitude)
      .map((ci) => ({
        id: ci.id,
        date: ci.createdAt?.toDate?.().toISOString().split('T')[0] || '',
        gratitude: ci.eveningData!.gratitude!,
        overallDay: ci.eveningData?.overallDay,
      }))

    // Extract challenge entries from check-ins
    const challengeEntries: ChallengeEntry[] = checkIns
      .filter((ci) => ci.eveningData?.challenges)
      .map((ci) => ({
        id: ci.id,
        date: ci.createdAt?.toDate?.().toISOString().split('T')[0] || '',
        challenges: ci.eveningData!.challenges!,
        overallDay: ci.eveningData?.overallDay,
      }))

    // Calculate total saved
    const dailyCost = userData?.dailyCost || 0
    const totalSaved = daysSober * dailyCost

    return {
      userData,
      checkIns,
      savingsGoals,
      breakthroughs,
      daysSober,
      milestones,
      nextMilestone,
      gratitudeEntries,
      challengeEntries,
      totalSaved,
    }
  }, [data])

  return {
    // Data
    userData: computed.userData,
    checkIns: computed.checkIns,
    savingsGoals: computed.savingsGoals,
    breakthroughs: computed.breakthroughs,

    // Computed values
    daysSober: computed.daysSober,
    milestones: computed.milestones,
    nextMilestone: computed.nextMilestone,
    gratitudeEntries: computed.gratitudeEntries,
    challengeEntries: computed.challengeEntries,
    totalSaved: computed.totalSaved,

    // Loading states
    loading: isLoading,
    isFetching,
    error: error instanceof Error ? error.message : null,

    // Actions
    refreshData: refetch,
  }
}

// Add query key for journey
declare module '@/lib/queryClient' {
  interface QueryKeys {
    journey?: {
      all: (userId: string) => readonly ['journey', string]
    }
  }
}

export default useJourneyQuery
