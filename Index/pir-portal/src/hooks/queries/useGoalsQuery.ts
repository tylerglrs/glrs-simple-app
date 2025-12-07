/**
 * TanStack Query hook for Goals data
 *
 * This hook replaces manual Firestore queries with TanStack Query for:
 * - Automatic caching (5-minute staleTime)
 * - Real-time updates via Firestore onSnapshot
 * - Computed values (active count, completed count, progress)
 * - Mutation functions for CRUD operations
 *
 * All computed values are derived from a single cached query result,
 * preventing duplicate Firestore reads across components.
 */

import { useMemo, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore'
import { db, auth } from '@/lib/firebase'
import { queryKeys } from '@/lib/queryClient'
import {
  updateContextAfterGoalAdd,
  updateContextAfterGoalUpdate,
  updateContextAfterGoalComplete,
} from '@/lib/updateAIContext'
import type { Goal, Objective } from '@/types/firebase'

// =============================================================================
// TYPES
// =============================================================================

export interface GoalWithProgress extends Goal {
  objectivesCount: number
  completedObjectivesCount: number
  actualProgress: number // Calculated from objectives if available
}

export interface GoalStats {
  totalGoals: number
  activeGoals: number
  completedGoals: number
  pausedGoals: number
  averageProgress: number
  goalsByCategory: Record<string, number>
}

export interface CreateGoalInput {
  title: string
  description?: string
  category: Goal['category']
  targetDate?: Date
}

export interface UpdateGoalInput {
  title?: string
  description?: string
  category?: Goal['category']
  status?: Goal['status']
  targetDate?: Date | null
  progress?: number
}

// =============================================================================
// FIRESTORE FETCHING
// =============================================================================

/**
 * Fetch all goals for a user from Firestore
 */
async function fetchAllGoals(userId: string): Promise<Goal[]> {
  return new Promise((resolve, reject) => {
    const goalsRef = collection(db, 'goals')
    const q = query(
      goalsRef,
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    )

    // Single fetch, not a listener (listener is set up separately)
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const goals = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Goal[]
        unsubscribe()
        resolve(goals)
      },
      (error) => {
        unsubscribe()
        reject(error)
      }
    )
  })
}

/**
 * Fetch objectives for goals (to calculate accurate progress)
 */
async function fetchObjectivesForGoals(userId: string): Promise<Objective[]> {
  return new Promise((resolve, reject) => {
    const objectivesRef = collection(db, 'objectives')
    const q = query(
      objectivesRef,
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    )

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const objectives = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Objective[]
        unsubscribe()
        resolve(objectives)
      },
      (error) => {
        unsubscribe()
        reject(error)
      }
    )
  })
}

// =============================================================================
// COMPUTED HELPERS
// =============================================================================

/**
 * Enhance goals with objective-based progress calculation
 */
function enhanceGoalsWithProgress(
  goals: Goal[],
  objectives: Objective[]
): GoalWithProgress[] {
  return goals.map((goal) => {
    const goalObjectives = objectives.filter((obj) => obj.goalId === goal.id)
    const completedObjectives = goalObjectives.filter(
      (obj) => obj.status === 'completed'
    )

    // Calculate progress from objectives if available, otherwise use stored progress
    const actualProgress =
      goalObjectives.length > 0
        ? Math.round((completedObjectives.length / goalObjectives.length) * 100)
        : goal.progress

    return {
      ...goal,
      objectivesCount: goalObjectives.length,
      completedObjectivesCount: completedObjectives.length,
      actualProgress,
    }
  })
}

/**
 * Calculate goal statistics
 */
function calculateGoalStats(goals: Goal[]): GoalStats {
  const activeGoals = goals.filter((g) => g.status === 'active')
  const completedGoals = goals.filter((g) => g.status === 'completed')
  const pausedGoals = goals.filter((g) => g.status === 'paused')

  const totalProgress = goals.reduce((sum, g) => sum + (g.progress || 0), 0)
  const averageProgress = goals.length > 0 ? Math.round(totalProgress / goals.length) : 0

  const goalsByCategory = goals.reduce((acc, goal) => {
    acc[goal.category] = (acc[goal.category] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return {
    totalGoals: goals.length,
    activeGoals: activeGoals.length,
    completedGoals: completedGoals.length,
    pausedGoals: pausedGoals.length,
    averageProgress,
    goalsByCategory,
  }
}

// =============================================================================
// MUTATION FUNCTIONS
// =============================================================================

/**
 * Create a new goal
 */
export async function createGoal(input: CreateGoalInput): Promise<string> {
  const user = auth.currentUser
  if (!user) throw new Error('Not authenticated')

  const goalData = {
    userId: user.uid,
    tenantId: user.uid, // Default tenant to user ID
    title: input.title,
    description: input.description || null,
    category: input.category,
    status: 'active' as const,
    targetDate: input.targetDate ? Timestamp.fromDate(input.targetDate) : null,
    progress: 0,
    createdAt: serverTimestamp(),
  }

  const docRef = await addDoc(collection(db, 'goals'), goalData)

  // Update AI context
  await updateContextAfterGoalAdd(user.uid)

  return docRef.id
}

/**
 * Update an existing goal
 */
export async function updateGoal(
  goalId: string,
  input: UpdateGoalInput
): Promise<void> {
  const user = auth.currentUser
  if (!user) throw new Error('Not authenticated')

  const updateData: Record<string, unknown> = {
    updatedAt: serverTimestamp(),
  }

  if (input.title !== undefined) updateData.title = input.title
  if (input.description !== undefined) updateData.description = input.description
  if (input.category !== undefined) updateData.category = input.category
  if (input.status !== undefined) updateData.status = input.status
  if (input.progress !== undefined) updateData.progress = input.progress
  if (input.targetDate !== undefined) {
    updateData.targetDate = input.targetDate
      ? Timestamp.fromDate(input.targetDate)
      : null
  }

  await updateDoc(doc(db, 'goals', goalId), updateData)

  // Update AI context - use complete if status is being set to completed
  if (input.status === 'completed') {
    await updateContextAfterGoalComplete(user.uid)
  } else {
    await updateContextAfterGoalUpdate(user.uid)
  }
}

/**
 * Delete a goal
 */
export async function deleteGoal(goalId: string): Promise<void> {
  const user = auth.currentUser
  if (!user) throw new Error('Not authenticated')

  await deleteDoc(doc(db, 'goals', goalId))

  // Update AI context
  await updateContextAfterGoalUpdate(user.uid)
}

/**
 * Mark a goal as completed
 */
export async function completeGoal(goalId: string): Promise<void> {
  await updateGoal(goalId, { status: 'completed', progress: 100 })
}

/**
 * Pause a goal
 */
export async function pauseGoal(goalId: string): Promise<void> {
  await updateGoal(goalId, { status: 'paused' })
}

/**
 * Resume a paused goal
 */
export async function resumeGoal(goalId: string): Promise<void> {
  await updateGoal(goalId, { status: 'active' })
}

// =============================================================================
// MAIN HOOK
// =============================================================================

interface UseGoalsQueryOptions {
  enabled?: boolean
  status?: Goal['status']
  category?: Goal['category']
}

interface UseGoalsQueryResult {
  // Raw data
  goals: GoalWithProgress[]
  objectives: Objective[]

  // Filtered data
  activeGoals: GoalWithProgress[]
  completedGoals: GoalWithProgress[]
  pausedGoals: GoalWithProgress[]

  // Stats
  stats: GoalStats

  // State
  isLoading: boolean
  error: Error | null

  // Mutations
  createGoal: (input: CreateGoalInput) => Promise<string>
  updateGoal: (goalId: string, input: UpdateGoalInput) => Promise<void>
  deleteGoal: (goalId: string) => Promise<void>
  completeGoal: (goalId: string) => Promise<void>
  pauseGoal: (goalId: string) => Promise<void>
  resumeGoal: (goalId: string) => Promise<void>

  // Refetch
  refetch: () => void
}

/**
 * Main hook for Goals data with TanStack Query caching
 *
 * Provides:
 * - All goals for the current user
 * - Filtered lists (active, completed, paused)
 * - Stats and computed values
 * - Mutation functions for CRUD operations
 * - Real-time updates via Firestore listener
 */
export function useGoalsQuery(
  userId: string | null | undefined,
  options: UseGoalsQueryOptions = {}
): UseGoalsQueryResult {
  const { enabled = true, status, category } = options
  const queryClient = useQueryClient()
  const queryKey = queryKeys.goals.all(userId || '')

  // Main query for fetching goals and objectives
  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey,
    queryFn: async () => {
      if (!userId) return { goals: [], objectives: [] }

      const [goals, objectives] = await Promise.all([
        fetchAllGoals(userId),
        fetchObjectivesForGoals(userId),
      ])

      return { goals, objectives }
    },
    enabled: enabled && !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  })

  // Set up real-time listener to update cache
  useEffect(() => {
    if (!userId || !enabled) return

    const goalsRef = collection(db, 'goals')
    const q = query(
      goalsRef,
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    )

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const goals = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Goal[]

        // Update the cache with fresh data
        queryClient.setQueryData(queryKey, (oldData: { goals: Goal[]; objectives: Objective[] } | undefined) => ({
          goals,
          objectives: oldData?.objectives || [],
        }))
      },
      (error) => {
        console.error('Goals listener error:', error)
      }
    )

    return () => unsubscribe()
  }, [userId, enabled, queryClient, queryKey])

  // Also listen for objectives changes
  useEffect(() => {
    if (!userId || !enabled) return

    const objectivesRef = collection(db, 'objectives')
    const q = query(
      objectivesRef,
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    )

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const objectives = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Objective[]

        // Update the cache with fresh objectives
        queryClient.setQueryData(queryKey, (oldData: { goals: Goal[]; objectives: Objective[] } | undefined) => ({
          goals: oldData?.goals || [],
          objectives,
        }))
      },
      (error) => {
        console.error('Objectives listener error:', error)
      }
    )

    return () => unsubscribe()
  }, [userId, enabled, queryClient, queryKey])

  // Compute enhanced goals with progress
  const goalsWithProgress = useMemo(() => {
    if (!data) return []
    return enhanceGoalsWithProgress(data.goals, data.objectives)
  }, [data])

  // Apply filters if provided
  const filteredGoals = useMemo(() => {
    let result = goalsWithProgress
    if (status) {
      result = result.filter((g) => g.status === status)
    }
    if (category) {
      result = result.filter((g) => g.category === category)
    }
    return result
  }, [goalsWithProgress, status, category])

  // Filter by status
  const activeGoals = useMemo(
    () => goalsWithProgress.filter((g) => g.status === 'active'),
    [goalsWithProgress]
  )

  const completedGoals = useMemo(
    () => goalsWithProgress.filter((g) => g.status === 'completed'),
    [goalsWithProgress]
  )

  const pausedGoals = useMemo(
    () => goalsWithProgress.filter((g) => g.status === 'paused'),
    [goalsWithProgress]
  )

  // Calculate stats
  const stats = useMemo(
    () => calculateGoalStats(data?.goals || []),
    [data?.goals]
  )

  // Mutations with cache invalidation
  const createMutation = useMutation({
    mutationFn: createGoal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey })
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ goalId, input }: { goalId: string; input: UpdateGoalInput }) =>
      updateGoal(goalId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteGoal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey })
    },
  })

  return {
    // Raw data
    goals: filteredGoals,
    objectives: data?.objectives || [],

    // Filtered data
    activeGoals,
    completedGoals,
    pausedGoals,

    // Stats
    stats,

    // State
    isLoading,
    error: error as Error | null,

    // Mutations
    createGoal: async (input) => createMutation.mutateAsync(input),
    updateGoal: async (goalId, input) =>
      updateMutation.mutateAsync({ goalId, input }),
    deleteGoal: async (goalId) => deleteMutation.mutateAsync(goalId),
    completeGoal: async (goalId) =>
      updateMutation.mutateAsync({ goalId, input: { status: 'completed', progress: 100 } }),
    pauseGoal: async (goalId) =>
      updateMutation.mutateAsync({ goalId, input: { status: 'paused' } }),
    resumeGoal: async (goalId) =>
      updateMutation.mutateAsync({ goalId, input: { status: 'active' } }),

    // Refetch
    refetch: () => refetch(),
  }
}

// =============================================================================
// SINGLE GOAL HOOK
// =============================================================================

interface UseSingleGoalResult {
  goal: GoalWithProgress | null
  objectives: Objective[]
  isLoading: boolean
  error: Error | null
  updateGoal: (input: UpdateGoalInput) => Promise<void>
  deleteGoal: () => Promise<void>
  completeGoal: () => Promise<void>
  pauseGoal: () => Promise<void>
  resumeGoal: () => Promise<void>
}

/**
 * Hook for fetching a single goal by ID
 */
export function useSingleGoalQuery(
  userId: string | null | undefined,
  goalId: string | null | undefined
): UseSingleGoalResult {
  const { goals, objectives, isLoading, error, updateGoal, deleteGoal } =
    useGoalsQuery(userId)

  const goal = useMemo(() => {
    if (!goalId) return null
    return goals.find((g) => g.id === goalId) || null
  }, [goals, goalId])

  const goalObjectives = useMemo(() => {
    if (!goalId) return []
    return objectives.filter((obj) => obj.goalId === goalId)
  }, [objectives, goalId])

  return {
    goal,
    objectives: goalObjectives,
    isLoading,
    error,
    updateGoal: async (input) => {
      if (!goalId) throw new Error('No goal ID provided')
      await updateGoal(goalId, input)
    },
    deleteGoal: async () => {
      if (!goalId) throw new Error('No goal ID provided')
      await deleteGoal(goalId)
    },
    completeGoal: async () => {
      if (!goalId) throw new Error('No goal ID provided')
      await updateGoal(goalId, { status: 'completed', progress: 100 })
    },
    pauseGoal: async () => {
      if (!goalId) throw new Error('No goal ID provided')
      await updateGoal(goalId, { status: 'paused' })
    },
    resumeGoal: async () => {
      if (!goalId) throw new Error('No goal ID provided')
      await updateGoal(goalId, { status: 'active' })
    },
  }
}

export default useGoalsQuery
