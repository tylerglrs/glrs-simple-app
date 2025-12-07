import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { AIInsightsDataState } from '../useAIInsightsData'
import {
  GoalProgress,
  ObjectiveRadar,
  AIGoalCoaching,
} from '../components'
import type {
  GoalEntry,
  GoalForRadar,
} from '../components'

// =============================================================================
// TYPES
// =============================================================================

export interface GoalsTabProps {
  data: AIInsightsDataState
}

// =============================================================================
// ANIMATION VARIANTS
// =============================================================================

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring' as const,
      stiffness: 400,
      damping: 25,
    },
  },
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function transformGoals(goals: AIInsightsDataState['goals'] | undefined | null): GoalEntry[] {
  if (!goals) return []
  // Filter out invalid entries and ensure all fields are safe
  return goals
    .filter((g) => g && g.id && typeof g.title === 'string')
    .map((g) => ({
      id: g.id,
      title: g.title || 'Untitled Goal',
      description: g.description,
      category: g.category,
      progress: typeof g.progress === 'number' ? g.progress : 0,
      status: g.status || 'active',
      targetDate: g.targetDate,
    }))
}

function transformGoalsForRadar(goals: AIInsightsDataState['goals'] | undefined | null): GoalForRadar[] {
  if (!goals) return []
  // Filter out invalid entries
  return goals
    .filter((g) => g && g.id)
    .map((g) => ({
      category: g.category,
      progress: typeof g.progress === 'number' ? g.progress : 0,
      status: g.status || 'active',
    }))
}

function calculateGoalStats(goals: AIInsightsDataState['goals'] | undefined | null) {
  if (!goals) return { activeCount: 0, completedCount: 0, avgProgress: 0 }
  const active = goals.filter((g) => g.status === 'active')
  const completed = goals.filter((g) => g.status === 'completed')
  const avgProgress = active.length > 0
    ? Math.round(active.reduce((acc, g) => acc + g.progress, 0) / active.length)
    : 0

  return {
    activeCount: active.length,
    completedCount: completed.length,
    avgProgress,
  }
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function GoalsTab({ data }: GoalsTabProps) {
  // Transform data to component-specific formats
  const goals = useMemo(() => transformGoals(data.goals), [data.goals])

  const goalsForRadar = useMemo(
    () => transformGoalsForRadar(data.goals),
    [data.goals]
  )

  const goalStats = useMemo(() => calculateGoalStats(data.goals), [data.goals])

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="p-3 md:p-4 space-y-3 md:space-y-4"
    >
      {/* AI Goal Coaching - Hero section */}
      <motion.div variants={itemVariants}>
        <AIGoalCoaching
          activeGoalCount={goalStats.activeCount}
          completedGoalCount={goalStats.completedCount}
          avgProgress={goalStats.avgProgress}
          isLoading={data.loading}
        />
      </motion.div>

      {/* Goal Progress */}
      <motion.div variants={itemVariants}>
        <GoalProgress goals={goals} maxGoals={5} />
      </motion.div>

      {/* Objective Radar */}
      <motion.div variants={itemVariants}>
        <ObjectiveRadar goals={goalsForRadar} />
      </motion.div>
    </motion.div>
  )
}

// Placeholder wrapper that accepts data as props
export function GoalsTabPlaceholder({ data }: { data?: AIInsightsDataState }) {
  // If no data provided, show loading state
  if (!data) {
    return (
      <div className="p-4 flex items-center justify-center h-64">
        <span className="text-slate-500 text-sm">Loading goals...</span>
      </div>
    )
  }
  return <GoalsTab data={data} />
}

export default GoalsTabPlaceholder
