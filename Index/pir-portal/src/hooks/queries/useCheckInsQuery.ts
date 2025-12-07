import { useEffect, useMemo, useCallback, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
  db,
  collection,
  doc,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  getDocs,
  onSnapshot,
  serverTimestamp,
  Timestamp,
  CURRENT_TENANT,
} from '@/lib/firebase'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/hooks/use-toast'
import { queryKeys } from '@/lib/queryClient'
import {
  updateContextAfterMorningCheckin,
  updateContextAfterEveningCheckin,
} from '@/lib/updateAIContext'
import {
  calculateStreaksFromDates,
  getDateString,
  type StreakData as SharedStreakData,
  type StreakPeriod as SharedStreakPeriod,
} from '@/lib/streakCalculation'

// =============================================================================
// TYPES (re-exported from original hook for compatibility)
// =============================================================================

export interface MorningCheckInData {
  mood: number | null
  craving: number | null
  anxiety: number | null
  sleep: number | null
  notes?: string
}

export interface EveningReflectionData {
  overallDay: number | null
  promptResponse?: string
  challenges?: string
  gratitude?: string
  tomorrowGoal?: string
  gratitudeTheme?: string
}

export interface CheckInDocument {
  id: string
  userId: string
  tenantId: string
  type: 'morning' | 'evening' | 'both'
  morningData?: MorningCheckInData
  eveningData?: EveningReflectionData
  mood?: number
  craving?: number
  anxiety?: number
  sleep?: number
  overallDay?: number
  createdAt: Timestamp
  updatedAt?: Timestamp
}

export interface CheckInStatus {
  morning: boolean
  evening: boolean
}

export interface WeeklyStats {
  checkRate: number
  avgMood: number
  checkInCount: number
}

export interface ReflectionStats {
  totalAllTime: number
  totalThisMonth: number
  avgDailyScore: number
  topGratitudeThemes: GratitudeTheme[]
}

export interface GratitudeTheme {
  name: string
  count: number
  lastDate: Date
}

// Re-export streak types from shared utility for backward compatibility
export type StreakData = SharedStreakData
export type StreakPeriod = SharedStreakPeriod

export interface YesterdayGoal {
  docId: string
  goal: string
  completed: boolean
}

// Reflection document from separate reflections collection
export interface ReflectionDocument {
  id: string
  userId: string
  tenantId?: string
  type?: string
  overallDay?: number
  gratitude?: string
  challenges?: string
  gratitudeTheme?: string
  createdAt: Timestamp
}

// =============================================================================
// FETCH FUNCTIONS
// =============================================================================

// Fetch ALL check-ins - no limit
async function fetchAllCheckIns(userId: string): Promise<CheckInDocument[]> {
  const q = query(
    collection(db, 'checkIns'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
    // NO LIMIT - get ALL documents
  )

  const snapshot = await getDocs(q)
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as CheckInDocument[]
}

// Fetch ALL reflections from separate reflections collection - no limit
async function fetchAllReflections(userId: string): Promise<ReflectionDocument[]> {
  const q = query(
    collection(db, 'reflections'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
    // NO LIMIT - get ALL documents
  )

  const snapshot = await getDocs(q)
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as ReflectionDocument[]
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

// Helper to extract Date from CheckInDocument
function getCheckInDate(checkIn: CheckInDocument): Date {
  if (checkIn.createdAt?.toDate) {
    return checkIn.createdAt.toDate()
  }
  return new Date(checkIn.createdAt as unknown as string)
}

// Helper to extract Date from ReflectionDocument
function getReflectionDate(reflection: ReflectionDocument): Date {
  if (reflection.createdAt?.toDate) {
    return reflection.createdAt.toDate()
  }
  return new Date(reflection.createdAt as unknown as string)
}

// Calculate streaks from CheckInDocument array with filter
// Uses shared calculateStreaksFromDates from @/lib/streakCalculation
function calculateStreaks(
  checkIns: CheckInDocument[],
  filterFn: (c: CheckInDocument) => boolean
): StreakData {
  const filteredCheckIns = checkIns.filter(filterFn)
  const dateStrings = filteredCheckIns.map((c) => getDateString(getCheckInDate(c)))
  return calculateStreaksFromDates(dateStrings)
}

// =============================================================================
// MAIN HOOK
// =============================================================================

/**
 * TanStack Query version of useCheckInData
 *
 * Benefits over original:
 * - Data cached and persists across tab switches
 * - Single query replaces 6+ separate queries
 * - Stale-while-revalidate pattern for instant data display
 * - Background refetching keeps data fresh
 * - Real-time listener updates cache automatically
 */
export function useCheckInsQuery() {
  const { user, userData } = useAuth()
  const { toast } = useToast()
  const queryClient = useQueryClient()

  // Local mutation loading state (for submit functions)
  const [mutationLoading, setMutationLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Last submitted data (for completion summaries)
  const [lastSubmittedCheckIn, setLastSubmittedCheckIn] = useState<MorningCheckInData | null>(null)
  const [lastSubmittedReflection, setLastSubmittedReflection] = useState<EveningReflectionData | null>(null)

  // ==========================================================================
  // MAIN QUERY - ALL check-ins (no limit)
  // ==========================================================================

  const {
    data: checkIns = [],
    isLoading: isLoadingCheckIns,
    isFetching: isFetchingCheckIns,
    refetch: refetchCheckIns,
  } = useQuery({
    queryKey: queryKeys.checkIns.all(user?.uid ?? ''),
    queryFn: () => fetchAllCheckIns(user!.uid),
    enabled: !!user?.uid,
    staleTime: 2 * 60 * 1000, // Fresh for 2 minutes
  })

  // ==========================================================================
  // REFLECTIONS QUERY - ALL reflections from separate collection (no limit)
  // ==========================================================================

  const {
    data: reflections = [],
    isLoading: isLoadingReflections,
    isFetching: isFetchingReflections,
    refetch: refetchReflections,
  } = useQuery({
    queryKey: ['reflections', 'all', user?.uid ?? ''],
    queryFn: () => fetchAllReflections(user!.uid),
    enabled: !!user?.uid,
    staleTime: 2 * 60 * 1000, // Fresh for 2 minutes
  })

  // Combined loading states
  const isLoading = isLoadingCheckIns || isLoadingReflections
  const isFetching = isFetchingCheckIns || isFetchingReflections
  const refetch = useCallback(() => {
    refetchCheckIns()
    refetchReflections()
  }, [refetchCheckIns, refetchReflections])

  // ==========================================================================
  // REAL-TIME LISTENER FOR CHECK-INS - NO LIMIT
  // ==========================================================================

  useEffect(() => {
    if (!user?.uid) return

    const q = query(
      collection(db, 'checkIns'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
      // NO LIMIT - get ALL documents
    )

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as CheckInDocument[]
        queryClient.setQueryData(queryKeys.checkIns.all(user.uid), data)
      },
      (err) => {
        console.error('[useCheckInsQuery] CheckIns snapshot error:', err)
      }
    )

    return () => unsubscribe()
  }, [user?.uid, queryClient])

  // ==========================================================================
  // REAL-TIME LISTENER FOR REFLECTIONS - NO LIMIT
  // ==========================================================================

  useEffect(() => {
    if (!user?.uid) return

    const q = query(
      collection(db, 'reflections'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
      // NO LIMIT - get ALL documents
    )

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as ReflectionDocument[]
        queryClient.setQueryData(['reflections', 'all', user.uid], data)
      },
      (err) => {
        console.error('[useCheckInsQuery] Reflections snapshot error:', err)
      }
    )

    return () => unsubscribe()
  }, [user?.uid, queryClient])

  // ==========================================================================
  // COMPUTED VALUES - Derived from ALL data sources
  // ==========================================================================

  const computedData = useMemo(() => {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    const sevenDaysAgo = new Date(today)
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    // Default values
    const defaults = {
      checkInStatus: { morning: false, evening: false } as CheckInStatus,
      checkInStreak: 0,
      reflectionStreak: 0,
      checkInStreakData: { currentStreak: 0, longestStreak: 0, allStreaks: [] } as StreakData,
      reflectionStreakData: { currentStreak: 0, longestStreak: 0, allStreaks: [] } as StreakData,
      weeklyStats: { checkRate: 0, avgMood: 0, checkInCount: 0 } as WeeklyStats,
      reflectionStats: {
        totalAllTime: 0,
        totalThisMonth: 0,
        avgDailyScore: 0,
        topGratitudeThemes: [],
      } as ReflectionStats,
      allReflections: [] as CheckInDocument[],
      yesterdayGoal: null as YesterdayGoal | null,
      yesterdayCheckInData: null as { mood?: number; craving?: number; anxiety?: number; sleep?: number } | null,
      todayCheckInData: null as { mood: number | null; craving: number | null; anxiety: number | null; sleep: number | null; notes?: string } | null,
      todayReflectionData: null as { overallDay: number | null; promptResponse?: string; challenges?: string; gratitude?: string; tomorrowGoal?: string; gratitudeTheme?: string } | null,
    }

    // Need data from at least one source
    if (!checkIns.length && !reflections.length) {
      return defaults
    }

    // Today's status
    const todayCheckIns = checkIns.filter((c) => {
      const checkInDate = getCheckInDate(c)
      return checkInDate >= today
    })

    // Also check reflections collection for today's evening
    const todayReflections = reflections.filter((r) => {
      const reflectionDate = getReflectionDate(r)
      return reflectionDate >= today
    })

    const checkInStatus: CheckInStatus = {
      morning: todayCheckIns.some((c) => c.type === 'morning' || c.morningData),
      evening: todayCheckIns.some((c) => c.type === 'evening' || c.eveningData) || todayReflections.length > 0,
    }

    // ==========================================================================
    // MORNING CHECK-IN STREAK
    // Sources: checkIns where type='morning' OR has morningData
    // ==========================================================================
    const checkInStreakData = calculateStreaks(
      checkIns,
      (c) => c.type === 'morning' || !!c.morningData
    )

    // ==========================================================================
    // REFLECTION STREAK - COMBINED FROM ALL SOURCES
    // Sources:
    //   1. checkIns where type='evening'
    //   2. checkIns where eveningData exists
    //   3. reflections collection (ALL entries)
    // ==========================================================================

    // Get dates from checkIns (evening type or eveningData)
    const checkInReflectionDates = checkIns
      .filter((c) => c.type === 'evening' || !!c.eveningData)
      .map((c) => getDateString(getCheckInDate(c)))

    // Get dates from separate reflections collection
    const separateReflectionDates = reflections.map((r) => getDateString(getReflectionDate(r)))

    // Combine ALL dates from ALL sources
    const allReflectionDates = [...checkInReflectionDates, ...separateReflectionDates]

    // Calculate combined reflection streak
    const reflectionStreakData = calculateStreaksFromDates(allReflectionDates)

    // Weekly stats
    const weeklyCheckIns = checkIns.filter((c) => {
      const checkInDate = getCheckInDate(c)
      return checkInDate >= sevenDaysAgo
    })

    const morningCheckIns = weeklyCheckIns.filter((c) => c.type === 'morning' || c.morningData)
    const uniqueDays = new Set(
      morningCheckIns.map((c) => getDateString(getCheckInDate(c)))
    ).size

    const moodRatings = morningCheckIns
      .map((c) => c.mood || c.morningData?.mood)
      .filter((v): v is number => v != null)

    const avgMood =
      moodRatings.length > 0
        ? Math.round((moodRatings.reduce((sum, val) => sum + val, 0) / moodRatings.length) * 10) / 10
        : 0

    const weeklyStats: WeeklyStats = {
      checkRate: Math.min(100, Math.round((uniqueDays / 7) * 100)),
      avgMood,
      checkInCount: morningCheckIns.length,
    }

    // ==========================================================================
    // REFLECTION STATS - COMBINED FROM ALL SOURCES
    // ==========================================================================

    // Reflections from checkIns collection
    const checkInReflections = checkIns.filter((c) => c.type === 'evening' || c.eveningData)

    // Count unique dates for totalAllTime (deduplicated across both sources)
    const totalAllTime = new Set(allReflectionDates).size

    // This month's reflections from checkIns
    const thisMonthCheckInReflections = checkInReflections.filter((c) => {
      const checkInDate = getCheckInDate(c)
      return checkInDate >= firstDayOfMonth
    })

    // This month's reflections from separate collection
    const thisMonthSeparateReflections = reflections.filter((r) => {
      const reflectionDate = getReflectionDate(r)
      return reflectionDate >= firstDayOfMonth
    })

    // Unique dates this month
    const thisMonthDates = new Set([
      ...thisMonthCheckInReflections.map((c) => getDateString(getCheckInDate(c))),
      ...thisMonthSeparateReflections.map((r) => getDateString(getReflectionDate(r))),
    ])
    const totalThisMonth = thisMonthDates.size

    // Average daily score from checkIn eveningData (separate collection doesn't have overallDay consistently)
    let avgDailyScore = 0
    if (thisMonthCheckInReflections.length > 0) {
      const totalScore = thisMonthCheckInReflections.reduce(
        (sum, r) => sum + (r.eveningData?.overallDay || 0),
        0
      )
      avgDailyScore = Math.round((totalScore / thisMonthCheckInReflections.length) * 10) / 10
    }

    // Gratitude themes from checkIns
    const themeData: Record<string, { name: string; count: number; dates: Date[] }> = {}
    checkInReflections.forEach((r) => {
      const theme = r.eveningData?.gratitudeTheme?.trim()
      if (theme) {
        if (!themeData[theme]) {
          themeData[theme] = { name: theme, count: 0, dates: [] }
        }
        themeData[theme].count++
        themeData[theme].dates.push(getCheckInDate(r))
      }
    })

    // Also include gratitude themes from separate reflections collection
    reflections.forEach((r) => {
      const theme = r.gratitudeTheme?.trim()
      if (theme) {
        if (!themeData[theme]) {
          themeData[theme] = { name: theme, count: 0, dates: [] }
        }
        themeData[theme].count++
        themeData[theme].dates.push(getReflectionDate(r))
      }
    })

    const topGratitudeThemes: GratitudeTheme[] = Object.values(themeData)
      .sort((a, b) => b.count - a.count)
      .slice(0, 3)
      .map((theme) => ({
        name: theme.name,
        count: theme.count,
        lastDate: theme.dates[0],
      }))

    const reflectionStats: ReflectionStats = {
      totalAllTime,
      totalThisMonth,
      avgDailyScore,
      topGratitudeThemes,
    }

    // allReflections for backward compatibility (just from checkIns - used for UI display)
    const allReflections = checkInReflections

    // Yesterday's goal
    const yesterdayCheckIn = checkIns.find((c) => {
      const checkInDate = getCheckInDate(c)
      return (
        checkInDate >= yesterday &&
        checkInDate < today &&
        c.eveningData?.tomorrowGoal
      )
    })

    const yesterdayGoal: YesterdayGoal | null = yesterdayCheckIn
      ? {
          docId: yesterdayCheckIn.id,
          goal: yesterdayCheckIn.eveningData!.tomorrowGoal!,
          completed: ((yesterdayCheckIn.eveningData as unknown as Record<string, unknown>)?.goalCompleted as boolean) || false,
        }
      : null

    // Yesterday's morning check-in data (for comparison in completion screen)
    const yesterdayMorningCheckIn = checkIns.find((c) => {
      const checkInDate = getCheckInDate(c)
      return (
        checkInDate >= yesterday &&
        checkInDate < today &&
        (c.type === 'morning' || c.morningData)
      )
    })

    const yesterdayCheckInData = yesterdayMorningCheckIn
      ? {
          mood: yesterdayMorningCheckIn.morningData?.mood ?? yesterdayMorningCheckIn.mood,
          craving: yesterdayMorningCheckIn.morningData?.craving ?? yesterdayMorningCheckIn.craving,
          anxiety: yesterdayMorningCheckIn.morningData?.anxiety ?? yesterdayMorningCheckIn.anxiety,
          sleep: yesterdayMorningCheckIn.morningData?.sleep ?? yesterdayMorningCheckIn.sleep,
        }
      : null

    // Today's morning check-in data (for completion screen when already submitted)
    const todayMorningCheckIn = todayCheckIns.find((c) => c.type === 'morning' || c.morningData)
    const todayCheckInData = todayMorningCheckIn
      ? {
          mood: todayMorningCheckIn.morningData?.mood ?? todayMorningCheckIn.mood ?? null,
          craving: todayMorningCheckIn.morningData?.craving ?? todayMorningCheckIn.craving ?? null,
          anxiety: todayMorningCheckIn.morningData?.anxiety ?? todayMorningCheckIn.anxiety ?? null,
          sleep: todayMorningCheckIn.morningData?.sleep ?? todayMorningCheckIn.sleep ?? null,
          notes: todayMorningCheckIn.morningData?.notes,
        }
      : null

    // Today's evening reflection data (for completion screen when already submitted)
    const todayEveningCheckIn = todayCheckIns.find((c) => c.type === 'evening' || c.eveningData)
    const todayReflectionData = todayEveningCheckIn?.eveningData
      ? {
          overallDay: todayEveningCheckIn.eveningData.overallDay ?? null,
          promptResponse: todayEveningCheckIn.eveningData.promptResponse,
          challenges: todayEveningCheckIn.eveningData.challenges,
          gratitude: todayEveningCheckIn.eveningData.gratitude,
          tomorrowGoal: todayEveningCheckIn.eveningData.tomorrowGoal,
          gratitudeTheme: todayEveningCheckIn.eveningData.gratitudeTheme,
        }
      : null

    return {
      checkInStatus,
      checkInStreak: checkInStreakData.currentStreak,
      reflectionStreak: reflectionStreakData.currentStreak,
      checkInStreakData,
      reflectionStreakData,
      weeklyStats,
      reflectionStats,
      allReflections,
      yesterdayGoal,
      yesterdayCheckInData,
      todayCheckInData,
      todayReflectionData,
    }
  }, [checkIns, reflections])

  // ==========================================================================
  // MUTATIONS
  // ==========================================================================

  const submitMorningCheckIn = useCallback(
    async (checkInData: MorningCheckInData): Promise<boolean> => {
      if (!user) {
        setError('You must be logged in to submit a check-in')
        return false
      }

      if (
        checkInData.mood === null ||
        checkInData.craving === null ||
        checkInData.anxiety === null ||
        checkInData.sleep === null
      ) {
        setError('Please complete all mood ratings')
        return false
      }

      setMutationLoading(true)
      setError(null)

      try {
        await addDoc(collection(db, 'checkIns'), {
          userId: user.uid,
          tenantId: userData?.tenantId || CURRENT_TENANT,
          morningData: checkInData,
          mood: checkInData.mood,
          craving: checkInData.craving,
          anxiety: checkInData.anxiety,
          sleep: checkInData.sleep,
          notes: checkInData.notes || null,
          createdAt: serverTimestamp(),
          type: 'morning',
        })

        // Update AI context
        await updateContextAfterMorningCheckin(user.uid, {
          mood: checkInData.mood ?? undefined,
          craving: checkInData.craving ?? undefined,
        })

        // Store last submitted data for completion summary
        setLastSubmittedCheckIn(checkInData)

        // Invalidate to trigger refetch (real-time listener will also update)
        queryClient.invalidateQueries({ queryKey: queryKeys.checkIns.all(user.uid) })

        toast({
          title: 'Check-in Complete',
          description: 'Your morning check-in has been submitted successfully!',
        })

        setMutationLoading(false)
        return true
      } catch (err) {
        console.error('[useCheckInsQuery] Error submitting morning check-in:', err)
        setError('Failed to submit check-in. Please try again.')
        toast({
          title: 'Error',
          description: 'Failed to submit check-in. Please try again.',
          variant: 'destructive',
        })
        setMutationLoading(false)
        return false
      }
    },
    [user, userData, toast, queryClient]
  )

  const submitEveningReflection = useCallback(
    async (reflectionData: EveningReflectionData): Promise<boolean> => {
      if (!user) {
        setError('You must be logged in to submit a reflection')
        return false
      }

      if (
        reflectionData.overallDay === null ||
        !reflectionData.challenges ||
        !reflectionData.gratitude ||
        !reflectionData.tomorrowGoal
      ) {
        setError('Please complete all required fields')
        return false
      }

      setMutationLoading(true)
      setError(null)

      try {
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        const q = query(
          collection(db, 'checkIns'),
          where('userId', '==', user.uid),
          where('createdAt', '>=', Timestamp.fromDate(today))
        )

        const snapshot = await getDocs(q)

        if (!snapshot.empty) {
          const docRef = doc(db, 'checkIns', snapshot.docs[0].id)
          await updateDoc(docRef, {
            eveningData: reflectionData,
            overallDay: reflectionData.overallDay,
            updatedAt: serverTimestamp(),
          })
        } else {
          await addDoc(collection(db, 'checkIns'), {
            userId: user.uid,
            tenantId: userData?.tenantId || CURRENT_TENANT,
            eveningData: reflectionData,
            overallDay: reflectionData.overallDay,
            createdAt: serverTimestamp(),
            type: 'evening',
          })
        }

        // Update AI context
        await updateContextAfterEveningCheckin(user.uid, {
          overallDay: reflectionData.overallDay ?? undefined,
        })

        // Store last submitted data for completion summary
        setLastSubmittedReflection(reflectionData)

        queryClient.invalidateQueries({ queryKey: queryKeys.checkIns.all(user.uid) })

        toast({
          title: 'Reflection Complete',
          description: 'Your evening reflection has been submitted successfully!',
        })

        setMutationLoading(false)
        return true
      } catch (err) {
        console.error('[useCheckInsQuery] Error submitting evening reflection:', err)
        setError('Failed to submit reflection. Please try again.')
        toast({
          title: 'Error',
          description: 'Failed to submit reflection. Please try again.',
          variant: 'destructive',
        })
        setMutationLoading(false)
        return false
      }
    },
    [user, userData, toast, queryClient]
  )

  const markYesterdayGoalComplete = useCallback(
    async (completed: boolean): Promise<boolean> => {
      if (!user || !computedData.yesterdayGoal) {
        return false
      }

      try {
        const docRef = doc(db, 'checkIns', computedData.yesterdayGoal.docId)
        await updateDoc(docRef, {
          'eveningData.goalCompleted': completed,
          'eveningData.goalCompletedDate': completed ? serverTimestamp() : null,
        })

        queryClient.invalidateQueries({ queryKey: queryKeys.checkIns.all(user.uid) })

        toast({
          title: completed ? 'Goal Completed!' : 'Goal Unmarked',
          description: completed
            ? 'Great job completing your goal!'
            : 'Goal marked as incomplete.',
        })

        return true
      } catch (err) {
        console.error('[useCheckInsQuery] Error updating goal status:', err)
        toast({
          title: 'Error',
          description: 'Failed to update goal status.',
          variant: 'destructive',
        })
        return false
      }
    },
    [user, computedData.yesterdayGoal, toast, queryClient]
  )

  // ==========================================================================
  // RETURN - API compatible with original useCheckInData
  // ==========================================================================

  return {
    // Loading and error states
    loading: isLoading || mutationLoading,
    error,

    // Check-in status
    checkInStatus: computedData.checkInStatus,

    // Streaks
    checkInStreak: computedData.checkInStreak,
    reflectionStreak: computedData.reflectionStreak,
    checkInStreakData: computedData.checkInStreakData,
    reflectionStreakData: computedData.reflectionStreakData,

    // Stats
    weeklyStats: computedData.weeklyStats,
    reflectionStats: computedData.reflectionStats,

    // Data
    allReflections: computedData.allReflections,
    yesterdayGoal: computedData.yesterdayGoal,

    // Last submitted data (for completion summaries)
    // Use lastSubmitted if available (just submitted), otherwise use cached today's data
    lastSubmittedCheckIn: lastSubmittedCheckIn || computedData.todayCheckInData,
    lastSubmittedReflection: lastSubmittedReflection || computedData.todayReflectionData,
    yesterdayCheckInData: computedData.yesterdayCheckInData,

    // Actions
    submitMorningCheckIn,
    submitEveningReflection,
    markYesterdayGoalComplete,

    // Manual refresh (for compatibility)
    refreshData: refetch,

    // Additional TanStack Query info
    isFetching,
  }
}

export default useCheckInsQuery
