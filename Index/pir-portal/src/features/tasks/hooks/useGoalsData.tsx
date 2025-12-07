import React, { useState, useEffect, useCallback } from 'react'
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
  Timestamp,
} from 'firebase/firestore'
import { db, auth } from '@/lib/firebase'
import { updateContextAfterAssignmentComplete } from '@/lib/updateAIContext'

// =============================================================================
// TYPES
// =============================================================================

export interface Goal {
  id: string
  userId: string
  title: string
  description?: string
  status: 'active' | 'completed'
  dueDate?: Timestamp | Date
  createdAt: Timestamp | Date
  completedAt?: Timestamp | Date
}

export interface Objective {
  id: string
  goalId: string
  userId: string
  title: string
  description?: string
  status: 'active' | 'completed'
  dueDate?: Timestamp | Date
  createdAt: Timestamp | Date
  completedAt?: Timestamp | Date
}

export interface Assignment {
  id: string
  objectiveId: string
  goalId: string
  userId: string
  title: string
  description?: string
  status: 'active' | 'completed'
  dueDate?: Timestamp | Date
  createdAt: Timestamp | Date
  completedAt?: Timestamp | Date
  reflection?: string
  reflectionDate?: Timestamp | Date
}

export interface GoalWithChildren extends Goal {
  objectives: ObjectiveWithAssignments[]
  progress: number
}

export interface ObjectiveWithAssignments extends Objective {
  assignments: Assignment[]
}

export interface GoalStats {
  totalGoals: number
  activeGoals: number
  completedGoals: number
  totalObjectives: number
  activeObjectives: number
  completedObjectives: number
  totalAssignments: number
  activeAssignments: number
  completedAssignments: number
  completionRate: number
  dueToday: number
  overdue: number
}

export interface DueDateStatus {
  text: string
  color: string
  isOverdue: boolean
  isDueToday: boolean
  isDueSoon: boolean
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Format a Firestore timestamp or Date to a readable string
 */
export function formatDate(date: Timestamp | Date | undefined): string {
  if (!date) return 'Not set'
  const dateObj = date instanceof Timestamp ? date.toDate() : new Date(date)
  return dateObj.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

/**
 * Get due date status with color and text
 */
export function getDueDateStatus(
  date: Timestamp | Date | undefined,
  isCompleted: boolean
): DueDateStatus {
  if (isCompleted) {
    return {
      text: 'Completed',
      color: 'text-green-600',
      isOverdue: false,
      isDueToday: false,
      isDueSoon: false,
    }
  }

  if (!date) {
    return {
      text: 'No due date',
      color: 'text-muted-foreground',
      isOverdue: false,
      isDueToday: false,
      isDueSoon: false,
    }
  }

  const dueDate = date instanceof Timestamp ? date.toDate() : new Date(date)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  dueDate.setHours(0, 0, 0, 0)
  const diffDays = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

  if (diffDays < 0) {
    return {
      text: 'Overdue',
      color: 'text-red-500',
      isOverdue: true,
      isDueToday: false,
      isDueSoon: false,
    }
  }
  if (diffDays === 0) {
    return {
      text: 'Due Today',
      color: 'text-orange-500',
      isOverdue: false,
      isDueToday: true,
      isDueSoon: false,
    }
  }
  if (diffDays === 1) {
    return {
      text: 'Due Tomorrow',
      color: 'text-orange-500',
      isOverdue: false,
      isDueToday: false,
      isDueSoon: true,
    }
  }
  if (diffDays <= 7) {
    return {
      text: `Due in ${diffDays} days`,
      color: 'text-yellow-600',
      isOverdue: false,
      isDueToday: false,
      isDueSoon: true,
    }
  }

  return {
    text: formatDate(date),
    color: 'text-muted-foreground',
    isOverdue: false,
    isDueToday: false,
    isDueSoon: false,
  }
}

/**
 * Calculate goal progress based on completed assignments
 */
export function calculateGoalProgress(goalId: string, assignments: Assignment[]): number {
  const goalAssignments = assignments.filter((a) => a.goalId === goalId)
  if (goalAssignments.length === 0) return 0

  const completed = goalAssignments.filter((a) => a.status === 'completed').length
  return Math.round((completed / goalAssignments.length) * 100)
}

/**
 * Make links in text clickable
 */
export function makeLinksClickable(text: string): React.ReactNode[] {
  if (!text) return []

  const urlRegex = /(https?:\/\/[^\s]+)/g
  const parts = text.split(urlRegex)

  return parts.map((part, index) => {
    if (part.match(urlRegex)) {
      return (
        <a
          key={index}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 underline hover:text-blue-600"
        >
          {part}
        </a>
      )
    }
    return part
  })
}

// =============================================================================
// MAIN HOOK
// =============================================================================

export function useGoalsData() {
  const [goals, setGoals] = useState<Goal[]>([])
  const [objectives, setObjectives] = useState<Objective[]>([])
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load goals with real-time listener
  useEffect(() => {
    const userId = auth.currentUser?.uid
    if (!userId) {
      setGoals([])
      setLoading(false)
      return
    }

    const goalsQuery = query(
      collection(db, 'goals'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    )

    const unsubscribe = onSnapshot(
      goalsQuery,
      (snapshot) => {
        const goalsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Goal[]
        setGoals(goalsData)
        setLoading(false)
      },
      (err) => {
        console.error('Error loading goals:', err)
        setError('Failed to load goals')
        setGoals([])
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [])

  // Load objectives with real-time listener
  useEffect(() => {
    const userId = auth.currentUser?.uid
    if (!userId) {
      setObjectives([])
      return
    }

    const objectivesQuery = query(
      collection(db, 'objectives'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    )

    const unsubscribe = onSnapshot(
      objectivesQuery,
      (snapshot) => {
        const objectivesData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Objective[]
        setObjectives(objectivesData)
      },
      (err) => {
        console.error('Error loading objectives:', err)
        setObjectives([])
      }
    )

    return () => unsubscribe()
  }, [])

  // Load assignments with real-time listener
  useEffect(() => {
    const userId = auth.currentUser?.uid
    if (!userId) {
      setAssignments([])
      return
    }

    const assignmentsQuery = query(
      collection(db, 'assignments'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    )

    const unsubscribe = onSnapshot(
      assignmentsQuery,
      (snapshot) => {
        const assignmentsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Assignment[]
        setAssignments(assignmentsData)
      },
      (err) => {
        console.error('Error loading assignments:', err)
        setAssignments([])
      }
    )

    return () => unsubscribe()
  }, [])

  // Computed: Goals with nested objectives and assignments
  const goalsWithChildren: GoalWithChildren[] = goals.map((goal) => {
    const goalObjectives = objectives.filter((o) => o.goalId === goal.id)
    const objectivesWithAssignments: ObjectiveWithAssignments[] = goalObjectives.map((objective) => ({
      ...objective,
      assignments: assignments.filter((a) => a.objectiveId === objective.id),
    }))

    return {
      ...goal,
      objectives: objectivesWithAssignments,
      progress: calculateGoalProgress(goal.id, assignments),
    }
  })

  // Computed: Active and completed goals
  const activeGoals = goalsWithChildren.filter((g) => g.status !== 'completed')
  const completedGoals = goalsWithChildren.filter((g) => g.status === 'completed')

  // Computed: Stats
  const stats: GoalStats = (() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const activeAssignments = assignments.filter((a) => a.status !== 'completed')
    const activeObjectives = objectives.filter((o) => o.status !== 'completed')

    // Count items due today
    const dueToday = activeAssignments.filter((a) => {
      if (!a.dueDate) return false
      const dueDate = a.dueDate instanceof Timestamp ? a.dueDate.toDate() : new Date(a.dueDate)
      dueDate.setHours(0, 0, 0, 0)
      return dueDate.getTime() === today.getTime()
    }).length

    // Count overdue items
    const overdue = activeAssignments.filter((a) => {
      if (!a.dueDate) return false
      const dueDate = a.dueDate instanceof Timestamp ? a.dueDate.toDate() : new Date(a.dueDate)
      dueDate.setHours(0, 0, 0, 0)
      return dueDate.getTime() < today.getTime()
    }).length

    const completedAssignments = assignments.filter((a) => a.status === 'completed').length
    const completionRate =
      assignments.length > 0 ? Math.round((completedAssignments / assignments.length) * 100) : 0

    return {
      totalGoals: goals.length,
      activeGoals: activeGoals.length,
      completedGoals: completedGoals.length,
      totalObjectives: objectives.length,
      activeObjectives: activeObjectives.length,
      completedObjectives: objectives.filter((o) => o.status === 'completed').length,
      totalAssignments: assignments.length,
      activeAssignments: activeAssignments.length,
      completedAssignments,
      completionRate,
      dueToday,
      overdue,
    }
  })()

  // Mark assignment as complete
  const completeAssignment = useCallback(async (assignmentId: string): Promise<boolean> => {
    const userId = auth.currentUser?.uid
    try {
      const assignmentRef = doc(db, 'assignments', assignmentId)
      await updateDoc(assignmentRef, {
        status: 'completed',
        completedAt: Timestamp.now(),
      })
      // Update AI context
      if (userId) {
        await updateContextAfterAssignmentComplete(userId)
      }
      return true
    } catch (err) {
      console.error('Error completing assignment:', err)
      return false
    }
  }, [])

  // Save reflection for assignment and mark as complete
  const saveReflectionAndComplete = useCallback(
    async (assignmentId: string, reflection: string): Promise<boolean> => {
      const userId = auth.currentUser?.uid
      try {
        const assignmentRef = doc(db, 'assignments', assignmentId)
        await updateDoc(assignmentRef, {
          status: 'completed',
          completedAt: Timestamp.now(),
          reflection,
          reflectionDate: Timestamp.now(),
        })
        // Update AI context
        if (userId) {
          await updateContextAfterAssignmentComplete(userId)
        }
        return true
      } catch (err) {
        console.error('Error saving reflection:', err)
        return false
      }
    },
    []
  )

  return {
    // Data
    goals,
    objectives,
    assignments,
    goalsWithChildren,
    activeGoals,
    completedGoals,
    stats,
    loading,
    error,
    // Actions
    completeAssignment,
    saveReflectionAndComplete,
  }
}

export default useGoalsData
