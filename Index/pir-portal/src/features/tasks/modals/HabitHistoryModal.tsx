import { useState, useEffect } from 'react'
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Repeat, X, Loader2, CheckCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { db, auth } from '@/lib/firebase'
import { collection, query, where, orderBy, onSnapshot, Timestamp } from 'firebase/firestore'
import { getDateString } from '../hooks/useTasksModalData'

// =============================================================================
// TYPES
// =============================================================================

export interface HabitHistoryModalProps {
  onClose: () => void
}

interface Habit {
  id: string
  userId: string
  name: string
  frequency: 'daily' | 'weekly'
  createdAt: Timestamp | Date
  isActive: boolean
}

interface HabitCompletion {
  id: string
  habitId: string
  userId: string
  completedAt: Timestamp | Date
}

// =============================================================================
// COMPONENT
// =============================================================================

export function HabitHistoryModal({ onClose }: HabitHistoryModalProps) {
  const isMobile = useMediaQuery('(max-width: 768px)')
  const [habits, setHabits] = useState<Habit[]>([])
  const [completions, setCompletions] = useState<HabitCompletion[]>([])
  const [loading, setLoading] = useState(true)

  // Load habits
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

  // Load completions (last 30 days)
  useEffect(() => {
    const userId = auth.currentUser?.uid
    if (!userId) {
      setCompletions([])
      return
    }

    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

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
        })) as HabitCompletion[]
        setCompletions(data)
      },
      (err) => {
        console.error('Error loading completions:', err)
        setCompletions([])
      }
    )

    return () => unsubscribe()
  }, [])

  // Calculate streak for each habit
  const getHabitStreak = (habitId: string): number => {
    const habitCompletions = completions
      .filter((c) => c.habitId === habitId)
      .map((c) =>
        c.completedAt instanceof Date
          ? getDateString(c.completedAt)
          : getDateString(c.completedAt.toDate())
      )

    const uniqueDates = [...new Set(habitCompletions)].sort().reverse()
    if (uniqueDates.length === 0) return 0

    let streak = 0
    const today = getDateString()
    const yesterday = getDateString(new Date(Date.now() - 86400000))

    // Check if completed today or yesterday to have active streak
    if (!uniqueDates.includes(today) && !uniqueDates.includes(yesterday)) {
      return 0
    }

    for (let i = 0; i < uniqueDates.length; i++) {
      const expectedDate = new Date()
      expectedDate.setDate(expectedDate.getDate() - i)
      const expectedDateStr = getDateString(expectedDate)

      if (uniqueDates.includes(expectedDateStr)) {
        streak++
      } else {
        break
      }
    }

    return streak
  }

  // Get completions count for each habit
  const getCompletionCount = (habitId: string): number => {
    return completions.filter((c) => c.habitId === habitId).length
  }

  // Get last 7 days
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - (6 - i))
    return getDateString(date)
  })

  if (loading) {
    return (
      <DialogContent className="max-w-[95vw] sm:max-w-[550px]">
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-teal-500" />
        </div>
      </DialogContent>
    )
  }

  return (
    <DialogContent className="max-w-[95vw] sm:max-w-[550px] p-0">
      {/* Header */}
      <DialogHeader className="p-5 pb-4 border-b">
        <div className="flex items-center justify-between">
          <DialogTitle className="flex items-center gap-2 text-lg font-semibold">
            <Repeat className="h-5 w-5 text-teal-600" />
            Habit History
          </DialogTitle>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
            <X className="h-5 w-5" />
          </Button>
        </div>
      </DialogHeader>

      <ScrollArea className="max-h-[55vh]">
        <div className={cn('p-5 space-y-5', isMobile && 'p-4 space-y-4')}>
          {/* Summary Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-teal-50 rounded-lg p-3 text-center border border-teal-100">
              <p className="text-xl font-bold text-teal-600">{habits.length}</p>
              <p className="text-xs text-muted-foreground">Total Habits</p>
            </div>
            <div className="bg-green-50 rounded-lg p-3 text-center border border-green-100">
              <p className="text-xl font-bold text-green-600">
                {completions.length}
              </p>
              <p className="text-xs text-muted-foreground">Completions (30d)</p>
            </div>
          </div>

          {/* Habits List */}
          {habits.length === 0 ? (
            <div className="text-center py-10">
              <Repeat className="h-12 w-12 mx-auto text-gray-300 mb-3" />
              <h3 className="font-semibold text-foreground mb-1">No Habits Yet</h3>
              <p className="text-sm text-muted-foreground">
                Create your first habit to start tracking.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {habits.map((habit) => {
                const streak = getHabitStreak(habit.id)
                const completionCount = getCompletionCount(habit.id)
                const habitCompletionDates = completions
                  .filter((c) => c.habitId === habit.id)
                  .map((c) =>
                    c.completedAt instanceof Date
                      ? getDateString(c.completedAt)
                      : getDateString(c.completedAt.toDate())
                  )

                return (
                  <div
                    key={habit.id}
                    className={cn(
                      'p-4 rounded-lg border',
                      habit.isActive ? 'bg-gray-50' : 'bg-gray-100 opacity-70'
                    )}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-medium text-foreground">{habit.name}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-muted-foreground capitalize">
                            {habit.frequency}
                          </span>
                          {!habit.isActive && (
                            <span className="text-xs bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded">
                              Inactive
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        {streak > 0 ? (
                          <div className="bg-orange-100 text-orange-700 px-2 py-1 rounded text-sm font-medium">
                            🔥 {streak} day streak
                          </div>
                        ) : (
                          <div className="text-xs text-muted-foreground">
                            {completionCount} completions
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Week View */}
                    <div className="flex gap-1">
                      {last7Days.map((dateKey) => {
                        const isCompleted = habitCompletionDates.includes(dateKey)
                        const date = new Date(dateKey)
                        const dayLabel = date.toLocaleDateString('en-US', { weekday: 'short' })

                        return (
                          <div key={dateKey} className="flex-1 text-center">
                            <p className="text-xs text-muted-foreground mb-1">
                              {dayLabel.charAt(0)}
                            </p>
                            <div
                              className={cn(
                                'h-6 w-full rounded flex items-center justify-center',
                                isCompleted
                                  ? 'bg-green-500'
                                  : 'bg-gray-200'
                              )}
                            >
                              {isCompleted && (
                                <CheckCircle className="h-3 w-3 text-white" />
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </ScrollArea>
    </DialogContent>
  )
}

export default HabitHistoryModal
