import { useState, useEffect, useMemo } from 'react'
import {
  db,
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  Timestamp,
} from '@/lib/firebase'
import { useAuth } from '@/contexts/AuthContext'
import { startOfDay, addDays, format, isSameDay } from 'date-fns'
import type { Assignment } from '@/types/firebase'

// =============================================================================
// TYPES
// =============================================================================

export interface AssignmentsByDate {
  date: Date
  dateString: string
  dayName: string
  dayNumber: number
  isToday: boolean
  assignments: Assignment[]
}

// =============================================================================
// HOOK
// =============================================================================

/**
 * Hook to fetch user assignments and group them by due date.
 * Returns assignments for the next 14 days (to allow for scrolling).
 *
 * @returns Object with assignments grouped by date and loading state
 */
export function useAssignmentsByDate() {
  const { user } = useAuth()
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch assignments with real-time listener
  useEffect(() => {
    if (!user?.uid) {
      setLoading(false)
      return
    }

    // Query assignments for this user that are not completed
    const assignmentsRef = collection(db, 'assignments')
    const q = query(
      assignmentsRef,
      where('userId', '==', user.uid),
      where('status', 'in', ['pending', 'in_progress', 'overdue']),
      orderBy('dueDate', 'asc')
    )

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const fetchedAssignments: Assignment[] = []
        snapshot.forEach((doc) => {
          const data = doc.data()
          fetchedAssignments.push({
            id: doc.id,
            ...data,
          } as Assignment)
        })
        setAssignments(fetchedAssignments)
        setLoading(false)
      },
      (error) => {
        console.error('Error fetching assignments:', error)
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [user?.uid])

  // Group assignments by date for the next 7 days
  const assignmentsByDate = useMemo((): AssignmentsByDate[] => {
    const today = startOfDay(new Date())
    const days: AssignmentsByDate[] = []

    // Generate 7 days starting from today
    for (let i = 0; i < 7; i++) {
      const date = addDays(today, i)
      const isToday = i === 0

      // Filter assignments for this date
      const dayAssignments = assignments.filter((assignment) => {
        if (!assignment.dueDate) return false
        const dueDate = assignment.dueDate instanceof Timestamp
          ? assignment.dueDate.toDate()
          : new Date(assignment.dueDate)
        return isSameDay(dueDate, date)
      })

      days.push({
        date,
        dateString: format(date, 'yyyy-MM-dd'),
        dayName: isToday ? 'Today' : format(date, 'EEE'),
        dayNumber: parseInt(format(date, 'd'), 10),
        isToday,
        assignments: dayAssignments,
      })
    }

    return days
  }, [assignments])

  // Also include overdue assignments (due before today)
  const overdueAssignments = useMemo((): Assignment[] => {
    const today = startOfDay(new Date())
    return assignments.filter((assignment) => {
      if (!assignment.dueDate) return false
      const dueDate = assignment.dueDate instanceof Timestamp
        ? assignment.dueDate.toDate()
        : new Date(assignment.dueDate)
      return dueDate < today
    })
  }, [assignments])

  return {
    assignmentsByDate,
    overdueAssignments,
    totalAssignments: assignments.length,
    loading,
  }
}

export default useAssignmentsByDate
