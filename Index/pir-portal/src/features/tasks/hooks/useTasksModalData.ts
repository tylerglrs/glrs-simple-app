import { useState, useEffect, useCallback } from 'react'
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  updateDoc,
  doc,
  Timestamp,
  limit,
} from 'firebase/firestore'
import { db, auth } from '@/lib/firebase'
import {
  updateContextAfterHabitAdd,
  updateContextAfterHabitComplete,
  updateContextAfterReflection,
  updateContextAfterWin,
  updateContextAfterIntention,
} from '@/lib/updateAIContext'

// =============================================================================
// TYPES
// =============================================================================

export interface CheckIn {
  id: string
  userId: string
  type: 'morning' | 'evening'
  mood: number
  craving?: number
  anxiety?: number
  sleep?: number
  overallDay?: number
  reflection?: string
  createdAt: Timestamp | Date
}

export interface Habit {
  id: string
  userId: string
  name: string
  description?: string
  frequency: 'daily' | 'weekly'
  createdAt: Timestamp | Date
  isActive: boolean
}

export interface HabitCompletion {
  id: string
  habitId: string
  userId: string
  completedAt: Timestamp | Date
}

export interface QuickReflection {
  id: string
  userId: string
  text: string
  createdAt: Timestamp | Date
  sharedToCommunity?: boolean
}

export interface TodayWin {
  id: string
  userId: string
  text: string
  createdAt: Timestamp | Date
  sharedToCommunity?: boolean
}

export interface Intention {
  id: string
  userId: string
  text: string
  date: string
  completed?: boolean
  completedDate?: Timestamp | Date
  createdAt: Timestamp | Date
  sharedToCommunity?: boolean
}

export interface StreakData {
  currentStreak: number
  longestStreak: number
  allStreaks: Array<{
    startDate: string
    endDate: string
    length: number
  }>
}

export interface WeeklyStats {
  checkRate: number
  avgMood: number
  avgCraving: number
  avgAnxiety: number
  avgSleep: number
  totalCheckIns: number
  reflectionsCount: number
}

export interface PatternData {
  average: number
  trend: 'improving' | 'declining' | 'stable'
  dataPoints: Array<{
    date: string
    value: number
  }>
  insights: string[]
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

export function getDateString(date: Date = new Date()): string {
  return date.toISOString().split('T')[0]
}

export function getStartOfWeek(date: Date = new Date()): Date {
  const d = new Date(date)
  d.setDate(d.getDate() - d.getDay())
  d.setHours(0, 0, 0, 0)
  return d
}

export function getEndOfWeek(date: Date = new Date()): Date {
  const d = getStartOfWeek(date)
  d.setDate(d.getDate() + 7)
  return d
}

export function formatDateShort(date: Timestamp | Date): string {
  const d = date instanceof Timestamp ? date.toDate() : new Date(date)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function formatDateTime(date: Timestamp | Date): string {
  const d = date instanceof Timestamp ? date.toDate() : new Date(date)
  return d.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

export function calculateTrend(
  dataPoints: number[] | undefined | null
): 'improving' | 'declining' | 'stable' {
  if (!dataPoints || dataPoints.length < 3) return 'stable'

  const recentAvg = dataPoints.slice(-3).reduce((a, b) => a + b, 0) / 3
  const olderAvg = dataPoints.slice(0, 3).reduce((a, b) => a + b, 0) / 3

  const diff = recentAvg - olderAvg
  if (diff > 0.5) return 'improving'
  if (diff < -0.5) return 'declining'
  return 'stable'
}

// =============================================================================
// CHECK-IN STATS HOOK
// =============================================================================

export function useCheckInStats() {
  const [checkIns, setCheckIns] = useState<CheckIn[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const userId = auth.currentUser?.uid
    if (!userId) {
      setCheckIns([])
      setLoading(false)
      return
    }

    // Get check-ins from last 30 days
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const checkInsQuery = query(
      collection(db, 'checkIns'),
      where('userId', '==', userId),
      where('createdAt', '>=', Timestamp.fromDate(thirtyDaysAgo)),
      orderBy('createdAt', 'desc')
    )

    const unsubscribe = onSnapshot(
      checkInsQuery,
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as CheckIn[]
        setCheckIns(data)
        setLoading(false)
      },
      (err) => {
        console.error('Error loading check-ins:', err)
        setError('Failed to load check-in data')
        setCheckIns([])
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [])

  // Calculate weekly stats
  const weeklyStats: WeeklyStats = (() => {
    const startOfWeek = getStartOfWeek()
    const weekCheckIns = checkIns.filter((c) => {
      const date = c.createdAt instanceof Timestamp ? c.createdAt.toDate() : new Date(c.createdAt)
      return date >= startOfWeek
    })

    const morningCheckIns = weekCheckIns.filter((c) => c.type === 'morning')
    const eveningCheckIns = weekCheckIns.filter((c) => c.type === 'evening')

    const daysSinceStart = Math.ceil(
      (Date.now() - startOfWeek.getTime()) / (1000 * 60 * 60 * 24)
    )
    const checkRate = daysSinceStart > 0
      ? Math.round((weekCheckIns.length / (daysSinceStart * 2)) * 100)
      : 0

    const moodValues = morningCheckIns.map((c) => c.mood).filter((v) => v !== undefined)
    const avgMood = moodValues.length > 0
      ? Math.round((moodValues.reduce((a, b) => a + b, 0) / moodValues.length) * 10) / 10
      : 0

    const cravingValues = morningCheckIns.map((c) => c.craving).filter((v) => v !== undefined) as number[]
    const avgCraving = cravingValues.length > 0
      ? Math.round((cravingValues.reduce((a, b) => a + b, 0) / cravingValues.length) * 10) / 10
      : 0

    const anxietyValues = morningCheckIns.map((c) => c.anxiety).filter((v) => v !== undefined) as number[]
    const avgAnxiety = anxietyValues.length > 0
      ? Math.round((anxietyValues.reduce((a, b) => a + b, 0) / anxietyValues.length) * 10) / 10
      : 0

    const sleepValues = morningCheckIns.map((c) => c.sleep).filter((v) => v !== undefined) as number[]
    const avgSleep = sleepValues.length > 0
      ? Math.round((sleepValues.reduce((a, b) => a + b, 0) / sleepValues.length) * 10) / 10
      : 0

    return {
      checkRate,
      avgMood,
      avgCraving,
      avgAnxiety,
      avgSleep,
      totalCheckIns: weekCheckIns.length,
      reflectionsCount: eveningCheckIns.filter((c) => c.reflection).length,
    }
  })()

  // Calculate streak data
  const streakData: StreakData = (() => {
    const dates = [...new Set(
      checkIns.map((c) => {
        const date = c.createdAt instanceof Timestamp ? c.createdAt.toDate() : new Date(c.createdAt)
        return getDateString(date)
      })
    )].sort()

    const allStreaks: StreakData['allStreaks'] = []
    let currentStreak = 0
    let longestStreak = 0

    if (dates.length > 0) {
      let streakStart = dates[0]
      let streakLength = 1

      for (let i = 1; i < dates.length; i++) {
        const prevDate = new Date(dates[i - 1])
        const currDate = new Date(dates[i])
        const diffDays = Math.ceil(
          (currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24)
        )

        if (diffDays === 1) {
          streakLength++
        } else {
          if (streakLength >= 2) {
            allStreaks.push({
              startDate: streakStart,
              endDate: dates[i - 1],
              length: streakLength,
            })
          }
          streakStart = dates[i]
          streakLength = 1
        }
      }

      // Push the last streak
      if (streakLength >= 2) {
        allStreaks.push({
          startDate: streakStart,
          endDate: dates[dates.length - 1],
          length: streakLength,
        })
      }

      // Calculate current streak
      const today = getDateString()
      const yesterday = getDateString(new Date(Date.now() - 86400000))

      if (dates.includes(today) || dates.includes(yesterday)) {
        const lastStreak = allStreaks[allStreaks.length - 1]
        if (lastStreak && (lastStreak.endDate === today || lastStreak.endDate === yesterday)) {
          currentStreak = lastStreak.length
        }
      }

      longestStreak = allStreaks.reduce((max, s) => Math.max(max, s.length), 0)
    }

    return { currentStreak, longestStreak, allStreaks }
  })()

  // Calculate pattern data for each metric
  const moodPattern: PatternData = (() => {
    const morningCheckIns = checkIns.filter((c) => c.type === 'morning' && c.mood !== undefined)
    const dataPoints = morningCheckIns.map((c) => ({
      date: getDateString(c.createdAt instanceof Timestamp ? c.createdAt.toDate() : new Date(c.createdAt)),
      value: c.mood,
    }))

    const values = morningCheckIns.map((c) => c.mood)
    const average = values.length > 0
      ? Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 10) / 10
      : 0

    const trend = calculateTrend(values)

    const insights: string[] = []
    if (average >= 7) insights.push('Your mood has been consistently positive')
    if (average < 4) insights.push('Consider reaching out to your coach for support')
    if (trend === 'improving') insights.push('Your mood is trending upward')
    if (trend === 'declining') insights.push('Your mood has been declining recently')

    return { average, trend, dataPoints, insights }
  })()

  const cravingPattern: PatternData = (() => {
    const morningCheckIns = checkIns.filter((c) => c.type === 'morning' && c.craving !== undefined)
    const dataPoints = morningCheckIns.map((c) => ({
      date: getDateString(c.createdAt instanceof Timestamp ? c.createdAt.toDate() : new Date(c.createdAt)),
      value: c.craving!,
    }))

    const values = morningCheckIns.map((c) => c.craving!)
    const average = values.length > 0
      ? Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 10) / 10
      : 0

    const trend = calculateTrend(values.map((v) => 10 - v)) // Invert for cravings (lower is better)

    const insights: string[] = []
    if (average <= 3) insights.push('Your cravings are well-managed')
    if (average > 6) insights.push('Consider using coping techniques when cravings arise')
    if (trend === 'improving') insights.push('Your cravings are decreasing')

    return { average, trend, dataPoints, insights }
  })()

  const anxietyPattern: PatternData = (() => {
    const morningCheckIns = checkIns.filter((c) => c.type === 'morning' && c.anxiety !== undefined)
    const dataPoints = morningCheckIns.map((c) => ({
      date: getDateString(c.createdAt instanceof Timestamp ? c.createdAt.toDate() : new Date(c.createdAt)),
      value: c.anxiety!,
    }))

    const values = morningCheckIns.map((c) => c.anxiety!)
    const average = values.length > 0
      ? Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 10) / 10
      : 0

    const trend = calculateTrend(values.map((v) => 10 - v)) // Invert (lower is better)

    const insights: string[] = []
    if (average <= 3) insights.push('Your anxiety levels are well-controlled')
    if (average > 6) insights.push('Try breathing exercises or grounding techniques')
    if (trend === 'improving') insights.push('Your anxiety is decreasing')

    return { average, trend, dataPoints, insights }
  })()

  const sleepPattern: PatternData = (() => {
    const morningCheckIns = checkIns.filter((c) => c.type === 'morning' && c.sleep !== undefined)
    const dataPoints = morningCheckIns.map((c) => ({
      date: getDateString(c.createdAt instanceof Timestamp ? c.createdAt.toDate() : new Date(c.createdAt)),
      value: c.sleep!,
    }))

    const values = morningCheckIns.map((c) => c.sleep!)
    const average = values.length > 0
      ? Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 10) / 10
      : 0

    const trend = calculateTrend(values)

    const insights: string[] = []
    if (average >= 7) insights.push('Your sleep quality is excellent')
    if (average < 5) insights.push('Consider establishing a bedtime routine')
    if (trend === 'improving') insights.push('Your sleep quality is improving')

    return { average, trend, dataPoints, insights }
  })()

  return {
    checkIns,
    weeklyStats,
    streakData,
    moodPattern,
    cravingPattern,
    anxietyPattern,
    sleepPattern,
    loading,
    error,
  }
}

// =============================================================================
// HABITS HOOK
// =============================================================================

export function useHabits() {
  const [habits, setHabits] = useState<Habit[]>([])
  const [completions, setCompletions] = useState<HabitCompletion[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const userId = auth.currentUser?.uid
    if (!userId) {
      setHabits([])
      setLoading(false)
      return
    }

    const habitsQuery = query(
      collection(db, 'habits'),
      where('userId', '==', userId),
      where('isActive', '==', true),
      orderBy('createdAt', 'desc')
    )

    const unsubscribe = onSnapshot(
      habitsQuery,
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Habit[]
        setHabits(data)
        setLoading(false)
      },
      (err) => {
        console.error('Error loading habits:', err)
        setHabits([])
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [])

  // Load completions for today
  useEffect(() => {
    const userId = auth.currentUser?.uid
    if (!userId) {
      setCompletions([])
      return
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const completionsQuery = query(
      collection(db, 'habitCompletions'),
      where('userId', '==', userId),
      where('completedAt', '>=', Timestamp.fromDate(today)),
      orderBy('completedAt', 'desc')
    )

    const unsubscribe = onSnapshot(
      completionsQuery,
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as HabitCompletion[]
        setCompletions(data)
      },
      (err) => {
        console.error('Error loading habit completions:', err)
        setCompletions([])
      }
    )

    return () => unsubscribe()
  }, [])

  const addHabit = useCallback(async (name: string, frequency: 'daily' | 'weekly' = 'daily'): Promise<boolean> => {
    const userId = auth.currentUser?.uid
    if (!userId) return false

    try {
      await addDoc(collection(db, 'habits'), {
        userId,
        name,
        frequency,
        isActive: true,
        createdAt: Timestamp.now(),
      })
      // Update AI context
      await updateContextAfterHabitAdd(userId)
      return true
    } catch (err) {
      console.error('Error adding habit:', err)
      return false
    }
  }, [])

  const completeHabit = useCallback(async (habitId: string): Promise<boolean> => {
    const userId = auth.currentUser?.uid
    if (!userId) return false

    try {
      await addDoc(collection(db, 'habitCompletions'), {
        habitId,
        userId,
        completedAt: Timestamp.now(),
      })
      // Update AI context
      await updateContextAfterHabitComplete(userId, habitId)
      return true
    } catch (err) {
      console.error('Error completing habit:', err)
      return false
    }
  }, [])

  const isHabitCompletedToday = useCallback((habitId: string): boolean => {
    return completions.some((c) => c.habitId === habitId)
  }, [completions])

  return {
    habits,
    completions,
    loading,
    addHabit,
    completeHabit,
    isHabitCompletedToday,
  }
}

// =============================================================================
// REFLECTIONS HOOK
// =============================================================================

export function useReflections() {
  const [reflections, setReflections] = useState<QuickReflection[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const userId = auth.currentUser?.uid
    if (!userId) {
      setReflections([])
      setLoading(false)
      return
    }

    // Query the 'reflections' collection (correct collection name)
    // Note: quickReflections collection is empty/deprecated
    const reflectionsQuery = query(
      collection(db, 'reflections'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(50)
    )

    const unsubscribe = onSnapshot(
      reflectionsQuery,
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as QuickReflection[]
        setReflections(data)
        setLoading(false)
      },
      (err) => {
        console.error('Error loading reflections:', err)
        setReflections([])
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [])

  const addReflection = useCallback(async (text: string, shareToCommunity = false): Promise<boolean> => {
    const userId = auth.currentUser?.uid
    if (!userId) return false

    try {
      // Write to 'reflections' collection (correct collection name)
      await addDoc(collection(db, 'reflections'), {
        userId,
        text,
        sharedToCommunity: shareToCommunity,
        createdAt: Timestamp.now(),
      })

      if (shareToCommunity) {
        await addDoc(collection(db, 'communityMessages'), {
          userId,
          type: 'reflection',
          content: text,
          createdAt: Timestamp.now(),
        })
      }

      // Update AI context
      await updateContextAfterReflection(userId)

      return true
    } catch (err) {
      console.error('Error adding reflection:', err)
      return false
    }
  }, [])

  return {
    reflections,
    loading,
    addReflection,
  }
}

// =============================================================================
// WINS HOOK
// =============================================================================

export function useWins() {
  const [wins, setWins] = useState<TodayWin[]>([])
  const [allWins, setAllWins] = useState<TodayWin[]>([])
  const [loading, setLoading] = useState(true)

  // Load today's wins
  useEffect(() => {
    const userId = auth.currentUser?.uid
    if (!userId) {
      setWins([])
      setLoading(false)
      return
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const winsQuery = query(
      collection(db, 'todayWins'),
      where('userId', '==', userId),
      where('createdAt', '>=', Timestamp.fromDate(today)),
      orderBy('createdAt', 'desc')
    )

    const unsubscribe = onSnapshot(
      winsQuery,
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as TodayWin[]
        setWins(data)
        setLoading(false)
      },
      (err) => {
        console.error('Error loading wins:', err)
        setWins([])
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [])

  // Load all wins for history
  useEffect(() => {
    const userId = auth.currentUser?.uid
    if (!userId) {
      setAllWins([])
      return
    }

    const allWinsQuery = query(
      collection(db, 'todayWins'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(100)
    )

    const unsubscribe = onSnapshot(
      allWinsQuery,
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as TodayWin[]
        setAllWins(data)
      },
      (err) => {
        console.error('Error loading all wins:', err)
        setAllWins([])
      }
    )

    return () => unsubscribe()
  }, [])

  const addWin = useCallback(async (text: string, shareToCommunity = false): Promise<boolean> => {
    const userId = auth.currentUser?.uid
    if (!userId) return false

    try {
      await addDoc(collection(db, 'todayWins'), {
        userId,
        text,
        sharedToCommunity: shareToCommunity,
        createdAt: Timestamp.now(),
      })

      if (shareToCommunity) {
        await addDoc(collection(db, 'communityMessages'), {
          userId,
          type: 'win',
          content: text,
          createdAt: Timestamp.now(),
        })
      }

      // Update AI context
      await updateContextAfterWin(userId)

      return true
    } catch (err) {
      console.error('Error adding win:', err)
      return false
    }
  }, [])

  return {
    wins,
    allWins,
    loading,
    addWin,
  }
}

// =============================================================================
// INTENTIONS HOOK
// =============================================================================

export function useIntentions() {
  const [intentions, setIntentions] = useState<Intention[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const userId = auth.currentUser?.uid
    if (!userId) {
      setIntentions([])
      setLoading(false)
      return
    }

    const intentionsQuery = query(
      collection(db, 'intentions'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(50)
    )

    const unsubscribe = onSnapshot(
      intentionsQuery,
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Intention[]
        setIntentions(data)
        setLoading(false)
      },
      (err) => {
        console.error('Error loading intentions:', err)
        setIntentions([])
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [])

  const addIntention = useCallback(async (text: string, shareToCommunity = false): Promise<boolean> => {
    const userId = auth.currentUser?.uid
    if (!userId) return false

    try {
      await addDoc(collection(db, 'intentions'), {
        userId,
        text,
        date: getDateString(),
        completed: false,
        sharedToCommunity: shareToCommunity,
        createdAt: Timestamp.now(),
      })

      if (shareToCommunity) {
        await addDoc(collection(db, 'communityMessages'), {
          userId,
          type: 'intention',
          content: text,
          createdAt: Timestamp.now(),
        })
      }

      // Update AI context
      await updateContextAfterIntention(userId)

      return true
    } catch (err) {
      console.error('Error adding intention:', err)
      return false
    }
  }, [])

  const removeIntention = useCallback(async (intentionId: string): Promise<boolean> => {
    try {
      const { deleteDoc } = await import('firebase/firestore')
      await deleteDoc(doc(db, 'intentions', intentionId))
      return true
    } catch (err) {
      console.error('Error removing intention:', err)
      return false
    }
  }, [])

  const completeIntention = useCallback(async (intentionId: string): Promise<boolean> => {
    try {
      await updateDoc(doc(db, 'intentions', intentionId), {
        completed: true,
        completedDate: Timestamp.now(),
      })
      return true
    } catch (err) {
      console.error('Error completing intention:', err)
      return false
    }
  }, [])

  // Get today's intentions
  const todayIntentions = intentions.filter((i) => i.date === getDateString())

  // Get all intentions for history
  const allIntentions = intentions

  return {
    intentions,
    todayIntentions,
    allIntentions,
    loading,
    addIntention,
    removeIntention,
    completeIntention,
  }
}
