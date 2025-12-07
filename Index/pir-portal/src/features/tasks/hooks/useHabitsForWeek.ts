import { useState, useEffect, useMemo, useCallback } from 'react'
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  Timestamp,
} from 'firebase/firestore'
import { db, auth } from '@/lib/firebase'
import { updateContextAfterHabitComplete } from '@/lib/updateAIContext'

// =============================================================================
// TYPES
// =============================================================================

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

export interface HabitWithStatus {
  habit: Habit
  completed: boolean
}

export interface DayHabits {
  date: Date
  dateString: string
  dayName: string
  dayNumber: number
  isToday: boolean
  isPast: boolean
  habits: HabitWithStatus[]
  completedCount: number
  totalCount: number
}

// =============================================================================
// HELPERS
// =============================================================================

function getDateString(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

function getWeekRange(): { start: Date; end: Date } {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const end = new Date(today)
  end.setDate(end.getDate() + 6) // Today + 6 more days = 7 days
  end.setHours(23, 59, 59, 999)

  return { start: today, end }
}

function isToday(date: Date): boolean {
  const today = new Date()
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  )
}

function isPastDate(date: Date): boolean {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const checkDate = new Date(date)
  checkDate.setHours(0, 0, 0, 0)
  return checkDate < today
}

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

// =============================================================================
// HOOK
// =============================================================================

export function useHabitsForWeek() {
  const [habits, setHabits] = useState<Habit[]>([])
  const [completions, setCompletions] = useState<HabitCompletion[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch habits
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

  // Fetch completions for the week
  useEffect(() => {
    const userId = auth.currentUser?.uid
    if (!userId) {
      setCompletions([])
      return
    }

    const { start, end } = getWeekRange()

    const completionsQuery = query(
      collection(db, 'habitCompletions'),
      where('userId', '==', userId),
      where('completedAt', '>=', Timestamp.fromDate(start)),
      where('completedAt', '<=', Timestamp.fromDate(end))
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

  // Check if a habit is completed for a specific date
  const isHabitCompletedForDate = useCallback((habitId: string, date: Date): boolean => {
    const dateStr = getDateString(date)
    return completions.some((c) => {
      const completionDate = c.completedAt instanceof Timestamp
        ? c.completedAt.toDate()
        : new Date(c.completedAt)
      return c.habitId === habitId && getDateString(completionDate) === dateStr
    })
  }, [completions])

  // Complete a habit for a specific date
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

  // Build habits by date for the week
  const habitsByDate = useMemo((): DayHabits[] => {
    const days: DayHabits[] = []
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    for (let i = 0; i < 7; i++) {
      const date = new Date(today)
      date.setDate(date.getDate() + i)

      const habitsWithStatus: HabitWithStatus[] = habits.map((habit) => ({
        habit,
        completed: isHabitCompletedForDate(habit.id, date),
      }))

      const completedCount = habitsWithStatus.filter((h) => h.completed).length

      days.push({
        date,
        dateString: getDateString(date),
        dayName: DAY_NAMES[date.getDay()],
        dayNumber: date.getDate(),
        isToday: isToday(date),
        isPast: isPastDate(date),
        habits: habitsWithStatus,
        completedCount,
        totalCount: habits.length,
      })
    }

    return days
  }, [habits, isHabitCompletedForDate])

  // Get today's habits
  const todayHabits = useMemo((): DayHabits | null => {
    return habitsByDate.find((d) => d.isToday) ?? null
  }, [habitsByDate])

  return {
    habits,
    habitsByDate,
    todayHabits,
    loading,
    isHabitCompletedForDate,
    completeHabit,
  }
}

export default useHabitsForWeek
