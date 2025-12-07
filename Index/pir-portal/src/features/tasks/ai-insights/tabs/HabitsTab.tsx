import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { Timestamp } from 'firebase/firestore'
import type { AIInsightsDataState } from '../useAIInsightsData'
import {
  HabitGrid,
  ConsistencyRadial,
  AIHabitCoach,
} from '../components'
import type { HabitDefinition, HabitConsistency } from '../components'

// =============================================================================
// TYPES
// =============================================================================

export interface HabitsTabProps {
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

function formatDate(date: Date): string {
  return date.toISOString().split('T')[0]
}

function getDaysArray(daysToShow: number): Date[] {
  const days: Date[] = []
  const today = new Date()

  for (let i = daysToShow - 1; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    date.setHours(0, 0, 0, 0)
    days.push(date)
  }

  return days
}

function isCompletedOnDay(
  habitId: string,
  date: Date,
  completions: AIInsightsDataState['habitCompletions']
): boolean {
  const dateStr = formatDate(date)
  return completions.some((c) => {
    const completedDate =
      c.completedAt instanceof Timestamp
        ? c.completedAt.toDate()
        : new Date(c.completedAt)
    return c.habitId === habitId && formatDate(completedDate) === dateStr
  })
}

function calculateHabitConsistencies(
  habits: AIInsightsDataState['habits'],
  completions: AIInsightsDataState['habitCompletions'],
  days: Date[]
): HabitConsistency[] {
  return habits.map((habit) => {
    const completedDays = days.filter((d) =>
      isCompletedOnDay(habit.id, d, completions)
    ).length
    const completionRate = days.length > 0 ? (completedDays / days.length) * 100 : 0

    return {
      habitId: habit.id,
      habitName: habit.name || 'Unnamed Habit',
      completionRate,
    }
  })
}

function calculateOverallScore(consistencies: HabitConsistency[]): number {
  if (consistencies.length === 0) return 0
  const sum = consistencies.reduce((acc, c) => acc + c.completionRate, 0)
  return sum / consistencies.length
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function HabitsTab({ data }: HabitsTabProps) {

  // Transform habit data to the format expected by components
  const habitDefinitions = useMemo((): HabitDefinition[] => {
    const habits = data.habits ?? []
    // Filter out invalid entries and ensure all fields are safe
    return habits
      .filter((h) => h && h.id)
      .map((h) => ({
        id: h.id,
        name: h.name || 'Unnamed Habit',
        // icon and color are optional - not stored in HabitData
      }))
  }, [data.habits])

  // Transform habit completions
  const habitCompletions = useMemo(() => {
    const completions = data.habitCompletions ?? []
    // Filter out invalid entries
    return completions
      .filter((c) => c && c.id && c.habitId)
      .map((c) => ({
        id: c.id,
        habitId: c.habitId,
        completedAt: c.completedAt,
      }))
  }, [data.habitCompletions])

  // Calculate consistency for last 7 days
  const days7 = useMemo(() => getDaysArray(7), [])
  const consistencies = useMemo(
    () => calculateHabitConsistencies(data.habits ?? [], data.habitCompletions ?? [], days7),
    [data.habits, data.habitCompletions, days7]
  )

  const overallScore = useMemo(
    () => calculateOverallScore(consistencies),
    [consistencies]
  )

  // Find best and focus habits
  const { bestHabit, focusHabit } = useMemo(() => {
    if (consistencies.length === 0) return { bestHabit: undefined, focusHabit: undefined }

    const sorted = [...consistencies].sort((a, b) => b.completionRate - a.completionRate)
    const best = sorted[0]
    const focus = sorted[sorted.length - 1]

    return {
      bestHabit: best?.completionRate > 0 ? best.habitName : undefined,
      focusHabit: focus?.completionRate < 100 ? focus.habitName : undefined,
    }
  }, [consistencies])

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="p-3 md:p-4 space-y-3 md:space-y-4"
    >
      {/* Consistency Radial */}
      <motion.div variants={itemVariants}>
        <ConsistencyRadial
          overallScore={overallScore}
          habitConsistencies={consistencies}
          bestHabit={bestHabit}
          focusHabit={focusHabit}
        />
      </motion.div>

      {/* Habit Grid */}
      <motion.div variants={itemVariants}>
        <HabitGrid
          habits={habitDefinitions}
          completions={habitCompletions}
          daysToShow={7}
        />
      </motion.div>

      {/* AI Habit Coach */}
      <motion.div variants={itemVariants}>
        <AIHabitCoach
          bestHabit={bestHabit}
          focusHabit={focusHabit}
          isLoading={data.loading}
        />
      </motion.div>

      {/* Phase indicator */}
      <motion.div variants={itemVariants}>
        <div className="text-center py-2">
          <span className="text-xs text-slate-600 uppercase tracking-wider">
            Phase 4 - Habits Complete
          </span>
        </div>
      </motion.div>
    </motion.div>
  )
}

// Placeholder wrapper that accepts data as props
export function HabitsTabPlaceholder({ data }: { data?: AIInsightsDataState }) {
  // If no data provided, show loading state
  if (!data) {
    return (
      <div className="p-4 flex items-center justify-center h-64">
        <span className="text-slate-500 text-sm">Loading habits...</span>
      </div>
    )
  }
  return <HabitsTab data={data} />
}

export default HabitsTabPlaceholder
