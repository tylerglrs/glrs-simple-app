import { useState, useEffect, useMemo } from 'react'
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  Timestamp,
} from 'firebase/firestore'
import { db, auth } from '@/lib/firebase'

// =============================================================================
// TYPES
// =============================================================================

export interface CheckIn {
  id: string
  userId: string
  type: 'morning' | 'evening' | 'both'
  mood?: number
  craving?: number
  anxiety?: number
  sleep?: number
  morningData?: {
    mood: number | null
    craving: number | null
    anxiety: number | null
    sleep: number | null
    notes?: string
  }
  eveningData?: {
    overallDay: number | null
    promptResponse?: string
    challenges?: string
    gratitude?: string
    tomorrowGoal?: string
  }
  overallDay?: number
  createdAt: Timestamp | Date
}

export interface Reflection {
  id: string
  userId: string
  type?: string
  overallDay?: number
  gratitude?: string
  challenges?: string
  gratitudeTheme?: string
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

export interface Gratitude {
  id: string
  userId: string
  text: string
  theme?: string
  createdAt: Timestamp | Date
}

export interface DayActivity {
  date: string // YYYY-MM-DD
  morningCheckIn: CheckIn | null
  eveningReflection: CheckIn | Reflection | null
  habits: { habit: Habit; completed: boolean }[]
  gratitudes: Gratitude[]
  hasActivity: boolean
}

// =============================================================================
// HELPERS
// =============================================================================

function getDateString(date: Date | Timestamp): string {
  const d = date instanceof Timestamp ? date.toDate() : date
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function getMonthRange(month: Date): { start: Date; end: Date } {
  const start = new Date(month.getFullYear(), month.getMonth(), 1)
  start.setHours(0, 0, 0, 0)

  const end = new Date(month.getFullYear(), month.getMonth() + 1, 0)
  end.setHours(23, 59, 59, 999)

  return { start, end }
}

// =============================================================================
// HOOK
// =============================================================================

export function useActivityData(month: Date = new Date()) {
  const [checkIns, setCheckIns] = useState<CheckIn[]>([])
  const [reflections, setReflections] = useState<Reflection[]>([])
  const [habits, setHabits] = useState<Habit[]>([])
  const [habitCompletions, setHabitCompletions] = useState<HabitCompletion[]>([])
  const [gratitudes, setGratitudes] = useState<Gratitude[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const userId = auth.currentUser?.uid
    if (!userId) {
      setLoading(false)
      return
    }

    const { start, end } = getMonthRange(month)
    const unsubscribes: (() => void)[] = []

    // Track loading state for each collection
    let loadedCount = 0
    const totalCollections = 5
    const checkLoaded = () => {
      loadedCount++
      if (loadedCount >= totalCollections) {
        setLoading(false)
      }
    }

    // 1. Fetch check-ins for the month
    const checkInsQuery = query(
      collection(db, 'checkIns'),
      where('userId', '==', userId),
      where('createdAt', '>=', Timestamp.fromDate(start)),
      where('createdAt', '<=', Timestamp.fromDate(end)),
      orderBy('createdAt', 'desc')
    )

    unsubscribes.push(
      onSnapshot(
        checkInsQuery,
        (snapshot) => {
          const data = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as CheckIn[]
          setCheckIns(data)
          checkLoaded()
        },
        (err) => {
          console.error('Error fetching check-ins:', err)
          checkLoaded()
        }
      )
    )

    // 2. Fetch reflections for the month
    const reflectionsQuery = query(
      collection(db, 'reflections'),
      where('userId', '==', userId),
      where('createdAt', '>=', Timestamp.fromDate(start)),
      where('createdAt', '<=', Timestamp.fromDate(end)),
      orderBy('createdAt', 'desc')
    )

    unsubscribes.push(
      onSnapshot(
        reflectionsQuery,
        (snapshot) => {
          const data = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as Reflection[]
          setReflections(data)
          checkLoaded()
        },
        (err) => {
          console.error('Error fetching reflections:', err)
          checkLoaded()
        }
      )
    )

    // 3. Fetch all active habits
    const habitsQuery = query(
      collection(db, 'habits'),
      where('userId', '==', userId),
      where('isActive', '==', true)
    )

    unsubscribes.push(
      onSnapshot(
        habitsQuery,
        (snapshot) => {
          const data = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as Habit[]
          setHabits(data)
          checkLoaded()
        },
        (err) => {
          console.error('Error fetching habits:', err)
          checkLoaded()
        }
      )
    )

    // 4. Fetch habit completions for the month
    const completionsQuery = query(
      collection(db, 'habitCompletions'),
      where('userId', '==', userId),
      where('completedAt', '>=', Timestamp.fromDate(start)),
      where('completedAt', '<=', Timestamp.fromDate(end))
    )

    unsubscribes.push(
      onSnapshot(
        completionsQuery,
        (snapshot) => {
          const data = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as HabitCompletion[]
          setHabitCompletions(data)
          checkLoaded()
        },
        (err) => {
          console.error('Error fetching habit completions:', err)
          checkLoaded()
        }
      )
    )

    // 5. Fetch gratitudes for the month
    const gratitudesQuery = query(
      collection(db, 'gratitudes'),
      where('userId', '==', userId),
      where('createdAt', '>=', Timestamp.fromDate(start)),
      where('createdAt', '<=', Timestamp.fromDate(end)),
      orderBy('createdAt', 'desc')
    )

    unsubscribes.push(
      onSnapshot(
        gratitudesQuery,
        (snapshot) => {
          const data = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as Gratitude[]
          setGratitudes(data)
          checkLoaded()
        },
        (err) => {
          console.error('Error fetching gratitudes:', err)
          checkLoaded()
        }
      )
    )

    return () => {
      unsubscribes.forEach((unsub) => unsub())
    }
  }, [month.getFullYear(), month.getMonth()])

  // Build activity map by date
  const activityByDate = useMemo(() => {
    const map = new Map<string, DayActivity>()

    // Initialize all days in the month
    const { start, end } = getMonthRange(month)
    const current = new Date(start)
    while (current <= end) {
      const dateStr = getDateString(current)
      map.set(dateStr, {
        date: dateStr,
        morningCheckIn: null,
        eveningReflection: null,
        habits: habits.map((h) => ({ habit: h, completed: false })),
        gratitudes: [],
        hasActivity: false,
      })
      current.setDate(current.getDate() + 1)
    }

    // Add check-ins
    checkIns.forEach((checkIn) => {
      const dateStr = getDateString(checkIn.createdAt)
      const activity = map.get(dateStr)
      if (activity) {
        // Check if it's a morning check-in
        const isMorning = checkIn.type === 'morning' ||
          checkIn.type === 'both' ||
          checkIn.morningData !== undefined ||
          (checkIn.mood !== undefined && checkIn.type !== 'evening')

        // Check if it's an evening reflection
        const isEvening = checkIn.type === 'evening' ||
          checkIn.type === 'both' ||
          checkIn.eveningData !== undefined ||
          checkIn.overallDay !== undefined

        if (isMorning && !activity.morningCheckIn) {
          activity.morningCheckIn = checkIn
          activity.hasActivity = true
        }
        if (isEvening && !activity.eveningReflection) {
          activity.eveningReflection = checkIn
          activity.hasActivity = true
        }
      }
    })

    // Add reflections (can override evening if from separate collection)
    reflections.forEach((reflection) => {
      const dateStr = getDateString(reflection.createdAt)
      const activity = map.get(dateStr)
      if (activity && !activity.eveningReflection) {
        activity.eveningReflection = reflection
        activity.hasActivity = true
      }
    })

    // Add habit completions
    habitCompletions.forEach((completion) => {
      const dateStr = getDateString(completion.completedAt)
      const activity = map.get(dateStr)
      if (activity) {
        const habitEntry = activity.habits.find((h) => h.habit.id === completion.habitId)
        if (habitEntry) {
          habitEntry.completed = true
          activity.hasActivity = true
        }
      }
    })

    // Add gratitudes
    gratitudes.forEach((gratitude) => {
      const dateStr = getDateString(gratitude.createdAt)
      const activity = map.get(dateStr)
      if (activity) {
        activity.gratitudes.push(gratitude)
        activity.hasActivity = true
      }
    })

    return map
  }, [checkIns, reflections, habits, habitCompletions, gratitudes, month])

  // Get activity for a specific date
  const getActivityForDate = (date: string): DayActivity | null => {
    return activityByDate.get(date) || null
  }

  return {
    activityByDate,
    getActivityForDate,
    habits,
    loading,
  }
}

export default useActivityData
