import { useState, useEffect, useCallback } from 'react'
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  Timestamp,
  limit,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useAuth } from '@/contexts/AuthContext'
import type {
  CheckInData,
  HabitData,
  HabitCompletionData,
  ReflectionData,
  GratitudeData,
  WinData,
  GoalData,
  MeetingAttendanceData,
  MetricPattern,
  TrendDirection,
  AIContext,
} from './types'

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function getDateDaysAgo(days: number): Date {
  const date = new Date()
  date.setDate(date.getDate() - days)
  date.setHours(0, 0, 0, 0)
  return date
}

function calculateTrend(values: number[] | undefined | null): TrendDirection {
  if (!values || values.length < 3) return 'stable'

  const recentAvg = values.slice(-3).reduce((a, b) => a + b, 0) / 3
  const olderAvg = values.slice(0, 3).reduce((a, b) => a + b, 0) / 3

  const diff = recentAvg - olderAvg
  if (diff > 0.5) return 'improving'
  if (diff < -0.5) return 'declining'
  return 'stable'
}

function calculateAverage(values: number[] | undefined | null): number {
  if (!values || values.length === 0) return 0
  return values.reduce((a, b) => a + b, 0) / values.length
}

function getDayOfWeek(date: Date): string {
  return date.toLocaleDateString('en-US', { weekday: 'long' })
}

// Helper to check if a date is today (used in AI context)
function _isToday(date: Date | Timestamp): boolean {
  const d = date instanceof Timestamp ? date.toDate() : new Date(date)
  const today = new Date()
  return (
    d.getDate() === today.getDate() &&
    d.getMonth() === today.getMonth() &&
    d.getFullYear() === today.getFullYear()
  )
}

// Helper to check if today is a weekend (used in AI context)
function _isWeekend(): boolean {
  const day = new Date().getDay()
  return day === 0 || day === 6
}

// Export helpers for use in AI context building
export const dateHelpers = { isToday: _isToday, isWeekend: _isWeekend }

// =============================================================================
// MAIN HOOK
// =============================================================================

export interface AIInsightsDataState {
  // Raw data
  checkIns: CheckInData[]
  habits: HabitData[]
  habitCompletions: HabitCompletionData[]
  reflections: ReflectionData[]
  gratitudes: GratitudeData[]
  wins: WinData[]
  goals: GoalData[]
  meetingAttendance: MeetingAttendanceData[]

  // Computed patterns
  moodPattern: MetricPattern
  anxietyPattern: MetricPattern
  cravingPattern: MetricPattern
  sleepPattern: MetricPattern
  energyPattern: MetricPattern

  // AI Context (aggregated for GPT)
  aiContext: AIContext | null

  // State
  loading: boolean
  refreshing: boolean
  error: string | null
  lastUpdated: Date | null
}

/**
 * Return type of useAIInsightsData hook
 */
export type AIInsightsData = AIInsightsDataState & {
  refresh: () => void
}

export function useAIInsightsData(): AIInsightsData {
  const { user } = useAuth()
  const userId = user?.uid

  const [state, setState] = useState<AIInsightsDataState>({
    checkIns: [],
    habits: [],
    habitCompletions: [],
    reflections: [],
    gratitudes: [],
    wins: [],
    goals: [],
    meetingAttendance: [],
    moodPattern: { average: 0, trend: 'stable', dataPoints: [], bestDay: '', worstDay: '', weeklyChange: 0 },
    anxietyPattern: { average: 0, trend: 'stable', dataPoints: [], bestDay: '', worstDay: '', weeklyChange: 0 },
    cravingPattern: { average: 0, trend: 'stable', dataPoints: [], bestDay: '', worstDay: '', weeklyChange: 0 },
    sleepPattern: { average: 0, trend: 'stable', dataPoints: [], bestDay: '', worstDay: '', weeklyChange: 0 },
    energyPattern: { average: 0, trend: 'stable', dataPoints: [], bestDay: '', worstDay: '', weeklyChange: 0 },
    aiContext: null,
    loading: true,
    refreshing: false,
    error: null,
    lastUpdated: null,
  })

  // Load check-ins data
  useEffect(() => {
    if (!userId) {
      setState((prev) => ({ ...prev, loading: false }))
      return
    }

    const thirtyDaysAgo = getDateDaysAgo(30)

    // Check-ins query - collection name is 'checkIns' with capital I
    const checkInsQuery = query(
      collection(db, 'checkIns'),
      where('userId', '==', userId),
      where('createdAt', '>=', Timestamp.fromDate(thirtyDaysAgo)),
      orderBy('createdAt', 'desc')
    )

    console.log('[AI Insights] Loading check-ins for user:', userId)

    const unsubscribe = onSnapshot(
      checkInsQuery,
      (snapshot) => {
        console.log('[AI Insights] Check-ins loaded:', snapshot.docs.length)
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as CheckInData[]

        // Calculate patterns - handle both flat fields and nested morningData/eveningData
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const getMood = (c: CheckInData): number | undefined => c.mood ?? (c as any).morningData?.mood
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const getAnxiety = (c: CheckInData): number | undefined => c.anxiety ?? (c as any).morningData?.anxiety
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const getCraving = (c: CheckInData): number | undefined => c.craving ?? (c as any).morningData?.craving
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const getSleep = (c: CheckInData): number | undefined => c.sleep ?? (c as any).morningData?.sleep
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const getEnergy = (c: CheckInData): number | undefined => c.energy ?? (c as any).morningData?.energy

        const moodValues = data.filter((c) => getMood(c) !== undefined).map((c) => getMood(c)!)
        const anxietyValues = data.filter((c) => getAnxiety(c) !== undefined).map((c) => getAnxiety(c)!)
        const cravingValues = data.filter((c) => getCraving(c) !== undefined).map((c) => getCraving(c)!)
        const sleepValues = data.filter((c) => getSleep(c) !== undefined).map((c) => getSleep(c)!)
        const energyValues = data.filter((c) => getEnergy(c) !== undefined).map((c) => getEnergy(c)!)

        // Calculate day-by-day mood for best/worst day
        const moodByDay: Record<string, number[]> = {}
        data.forEach((c) => {
          if (c.mood && c.createdAt) {
            const date = c.createdAt instanceof Timestamp ? c.createdAt.toDate() : new Date(c.createdAt)
            const day = getDayOfWeek(date)
            if (!moodByDay[day]) moodByDay[day] = []
            moodByDay[day].push(c.mood)
          }
        })

        let bestDay = ''
        let worstDay = ''
        let bestAvg = 0
        let worstAvg = 10

        Object.entries(moodByDay).forEach(([day, values]) => {
          const avg = calculateAverage(values)
          if (avg > bestAvg) {
            bestAvg = avg
            bestDay = day
          }
          if (avg < worstAvg) {
            worstAvg = avg
            worstDay = day
          }
        })

        // Create data points for charts
        const dataPoints = data
          .slice()
          .reverse()
          .map((c) => ({
            date: c.createdAt instanceof Timestamp
              ? c.createdAt.toDate().toISOString().split('T')[0]
              : new Date(c.createdAt).toISOString().split('T')[0],
            value: c.mood || 0,
          }))

        console.log('[AI Insights] Mood values found:', moodValues.length)

        setState((prev) => ({
          ...prev,
          checkIns: data,
          moodPattern: {
            average: calculateAverage(moodValues),
            trend: calculateTrend(moodValues),
            dataPoints,
            bestDay,
            worstDay,
            weeklyChange: moodValues.length >= 14
              ? calculateAverage(moodValues.slice(0, 7)) - calculateAverage(moodValues.slice(7, 14))
              : 0,
          },
          anxietyPattern: {
            average: calculateAverage(anxietyValues),
            trend: calculateTrend(anxietyValues),
            dataPoints: [],
            bestDay: '',
            worstDay: '',
            weeklyChange: 0,
          },
          cravingPattern: {
            average: calculateAverage(cravingValues),
            trend: calculateTrend(cravingValues),
            dataPoints: [],
            bestDay: '',
            worstDay: '',
            weeklyChange: 0,
          },
          sleepPattern: {
            average: calculateAverage(sleepValues),
            trend: calculateTrend(sleepValues),
            dataPoints: [],
            bestDay: '',
            worstDay: '',
            weeklyChange: 0,
          },
          energyPattern: {
            average: calculateAverage(energyValues),
            trend: calculateTrend(energyValues),
            dataPoints: [],
            bestDay: '',
            worstDay: '',
            weeklyChange: 0,
          },
          loading: false,
          lastUpdated: new Date(),
        }))
      },
      (err) => {
        console.error('Error loading check-ins for AI insights:', err)
        setState((prev) => ({
          ...prev,
          error: 'Failed to load check-in data',
          loading: false,
        }))
      }
    )

    return () => unsubscribe()
  }, [userId])

  // Load habits data
  useEffect(() => {
    if (!userId) return

    const habitsQuery = query(
      collection(db, 'habits'),
      where('userId', '==', userId),
      where('isActive', '==', true)
    )

    const unsubscribe = onSnapshot(
      habitsQuery,
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as HabitData[]

        setState((prev) => ({
          ...prev,
          habits: data,
        }))
      },
      (err) => {
        console.error('Error loading habits:', err)
      }
    )

    return () => unsubscribe()
  }, [userId])

  // Load habit completions
  useEffect(() => {
    if (!userId) return

    const thirtyDaysAgo = getDateDaysAgo(30)

    const completionsQuery = query(
      collection(db, 'habitCompletions'),
      where('userId', '==', userId),
      where('completedAt', '>=', Timestamp.fromDate(thirtyDaysAgo)),
      orderBy('completedAt', 'desc')
    )

    const unsubscribe = onSnapshot(
      completionsQuery,
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as HabitCompletionData[]

        setState((prev) => ({
          ...prev,
          habitCompletions: data,
        }))
      },
      (err) => {
        console.error('Error loading habit completions:', err)
      }
    )

    return () => unsubscribe()
  }, [userId])

  // Load reflections
  useEffect(() => {
    if (!userId) return

    const thirtyDaysAgo = getDateDaysAgo(30)

    const reflectionsQuery = query(
      collection(db, 'reflections'),
      where('userId', '==', userId),
      where('createdAt', '>=', Timestamp.fromDate(thirtyDaysAgo)),
      orderBy('createdAt', 'desc'),
      limit(50)
    )

    const unsubscribe = onSnapshot(
      reflectionsQuery,
      (snapshot) => {
        console.log('[AI Insights] Reflections loaded:', snapshot.docs.length)
        // Map Firestore 'content' field to 'text' for component compatibility
        const data = snapshot.docs.map((doc) => {
          const docData = doc.data()
          return {
            id: doc.id,
            userId: docData.userId,
            // Map 'content' to 'text' - Firestore uses 'content', components expect 'text'
            text: docData.content || docData.text || '',
            mood: docData.mood,
            createdAt: docData.createdAt,
          }
        }) as ReflectionData[]

        console.log('[AI Insights] Reflections with text:', data.filter(r => r.text).length)

        setState((prev) => ({
          ...prev,
          reflections: data,
        }))
      },
      (err) => {
        console.error('Error loading reflections:', err)
      }
    )

    return () => unsubscribe()
  }, [userId])

  // Load gratitudes
  useEffect(() => {
    if (!userId) return

    const thirtyDaysAgo = getDateDaysAgo(30)

    const gratitudesQuery = query(
      collection(db, 'gratitudes'),
      where('userId', '==', userId),
      where('createdAt', '>=', Timestamp.fromDate(thirtyDaysAgo)),
      orderBy('createdAt', 'desc'),
      limit(50)
    )

    const unsubscribe = onSnapshot(
      gratitudesQuery,
      (snapshot) => {
        console.log('[AI Insights] Gratitudes loaded:', snapshot.docs.length)
        // Map Firestore 'content' to 'text' and 'theme' to 'category' for component compatibility
        const data = snapshot.docs.map((doc) => {
          const docData = doc.data()
          return {
            id: doc.id,
            userId: docData.userId,
            // Map 'content' to 'text' - Firestore uses 'content', components expect 'text'
            text: docData.content || docData.text || '',
            // Map 'theme' to 'category' - Firestore uses 'theme', components expect 'category'
            category: docData.theme || docData.category,
            createdAt: docData.createdAt,
          }
        }) as GratitudeData[]

        console.log('[AI Insights] Gratitudes with text:', data.filter(g => g.text).length)

        setState((prev) => ({
          ...prev,
          gratitudes: data,
        }))
      },
      (err) => {
        console.error('Error loading gratitudes:', err)
      }
    )

    return () => unsubscribe()
  }, [userId])

  // Load wins (from todayWins collection)
  useEffect(() => {
    if (!userId) return

    const thirtyDaysAgo = getDateDaysAgo(30)

    const winsQuery = query(
      collection(db, 'todayWins'),
      where('userId', '==', userId),
      where('createdAt', '>=', Timestamp.fromDate(thirtyDaysAgo)),
      orderBy('createdAt', 'desc'),
      limit(50)
    )

    const unsubscribe = onSnapshot(
      winsQuery,
      (snapshot) => {
        console.log('[AI Insights] Wins loaded:', snapshot.docs.length)
        // Map Firestore 'content' to 'text' for component compatibility
        const data = snapshot.docs.map((doc) => {
          const docData = doc.data()
          return {
            id: doc.id,
            userId: docData.userId,
            // Map 'content' to 'text' - Firestore uses 'content', components expect 'text'
            text: docData.content || docData.text || '',
            category: docData.category,
            createdAt: docData.createdAt,
          }
        }) as WinData[]

        console.log('[AI Insights] Wins with text:', data.filter(w => w.text).length)

        setState((prev) => ({
          ...prev,
          wins: data,
        }))
      },
      (err) => {
        console.error('Error loading wins:', err)
      }
    )

    return () => unsubscribe()
  }, [userId])

  // Load goals
  useEffect(() => {
    if (!userId) return

    const goalsQuery = query(
      collection(db, 'goals'),
      where('userId', '==', userId),
      where('status', '==', 'active'),
      orderBy('createdAt', 'desc')
    )

    const unsubscribe = onSnapshot(
      goalsQuery,
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as GoalData[]

        setState((prev) => ({
          ...prev,
          goals: data,
        }))
      },
      (err) => {
        console.error('Error loading goals:', err)
      }
    )

    return () => unsubscribe()
  }, [userId])

  // Load meeting attendance
  useEffect(() => {
    if (!userId) return

    const thirtyDaysAgo = getDateDaysAgo(30)

    const meetingQuery = query(
      collection(db, 'meetingAttendance'),
      where('userId', '==', userId),
      where('attendedAt', '>=', Timestamp.fromDate(thirtyDaysAgo)),
      orderBy('attendedAt', 'desc')
    )

    const unsubscribe = onSnapshot(
      meetingQuery,
      (snapshot) => {
        console.log('[AI Insights] Meeting attendance loaded:', snapshot.docs.length)
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as MeetingAttendanceData[]

        setState((prev) => ({
          ...prev,
          meetingAttendance: data,
        }))
      },
      (err) => {
        console.error('Error loading meeting attendance:', err)
      }
    )

    return () => unsubscribe()
  }, [userId])

  // Refresh function
  const refresh = useCallback(() => {
    setState((prev) => ({ ...prev, refreshing: true }))
    // The real-time listeners will automatically update
    // Just simulate a brief refresh state
    setTimeout(() => {
      setState((prev) => ({
        ...prev,
        refreshing: false,
        lastUpdated: new Date(),
      }))
    }, 1000)
  }, [])

  return {
    ...state,
    refresh,
  }
}

export default useAIInsightsData
