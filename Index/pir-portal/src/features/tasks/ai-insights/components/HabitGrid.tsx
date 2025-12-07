import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { Check, X, Target, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { Timestamp } from 'firebase/firestore'
import { cn } from '@/lib/utils'

// =============================================================================
// TYPES
// =============================================================================

export interface HabitDefinition {
  id: string
  name: string
  icon?: string
  color?: string
}

export interface HabitCompletion {
  id: string
  habitId: string
  completedAt: Date | Timestamp
}

export interface HabitGridProps {
  habits: HabitDefinition[]
  completions: HabitCompletion[]
  daysToShow?: number
  className?: string
}

// =============================================================================
// ANIMATION VARIANTS
// =============================================================================

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.03,
      delayChildren: 0.1,
    },
  },
}

const cellVariants = {
  hidden: { opacity: 0, scale: 0.5 },
  visible: {
    opacity: 1,
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

function formatDate(date: Date): string {
  return date.toISOString().split('T')[0]
}

function getDayLabel(date: Date): string {
  return date.toLocaleDateString('en-US', { weekday: 'short' }).charAt(0)
}

function isCompleted(
  habitId: string,
  date: Date,
  completions: HabitCompletion[]
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

function calculateHabitStats(
  habitId: string,
  days: Date[],
  completions: HabitCompletion[]
): { completionRate: number; trend: 'up' | 'down' | 'stable' } {
  const completed = days.filter((d) => isCompleted(habitId, d, completions)).length
  const completionRate = days.length > 0 ? (completed / days.length) * 100 : 0

  // Calculate trend (compare last 3 days vs previous 3 days)
  if (days.length >= 6) {
    const recentDays = days.slice(-3)
    const olderDays = days.slice(-6, -3)

    const recentCompletions = recentDays.filter((d) =>
      isCompleted(habitId, d, completions)
    ).length
    const olderCompletions = olderDays.filter((d) =>
      isCompleted(habitId, d, completions)
    ).length

    if (recentCompletions > olderCompletions) return { completionRate, trend: 'up' }
    if (recentCompletions < olderCompletions) return { completionRate, trend: 'down' }
  }

  return { completionRate, trend: 'stable' }
}

// =============================================================================
// COMPLETION CELL COMPONENT
// =============================================================================

interface CompletionCellProps {
  isCompleted: boolean
  isToday: boolean
}

function CompletionCell({ isCompleted, isToday }: CompletionCellProps) {
  return (
    <motion.div
      variants={cellVariants}
      className={cn(
        // Responsive cell sizes: 24px -> 28px -> 32px
        'w-6 h-6 xs:w-7 xs:h-7 sm:w-8 sm:h-8',
        'rounded-md sm:rounded-lg flex items-center justify-center',
        'transition-all duration-200',
        isCompleted
          ? 'bg-emerald-500/20 border border-emerald-500/40'
          : 'bg-slate-700/30 border border-slate-600/30',
        isToday && 'ring-2 ring-violet-500/50 ring-offset-1 ring-offset-slate-900'
      )}
    >
      {isCompleted ? (
        <Check className="h-3 w-3 xs:h-3.5 xs:w-3.5 sm:h-4 sm:w-4 text-emerald-400" />
      ) : (
        <X className="h-2.5 w-2.5 xs:h-3 xs:w-3 text-slate-600" />
      )}
    </motion.div>
  )
}

// =============================================================================
// HABIT ROW COMPONENT
// =============================================================================

interface HabitRowProps {
  habit: HabitDefinition
  days: Date[]
  completions: HabitCompletion[]
}

function HabitRow({ habit, days, completions }: HabitRowProps) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayStr = formatDate(today)

  const stats = useMemo(
    () => calculateHabitStats(habit.id, days, completions),
    [habit.id, days, completions]
  )

  return (
    <div className="flex items-center gap-2 xs:gap-3">
      {/* Habit name - responsive width */}
      <div className="w-16 xs:w-20 sm:w-28 flex-shrink-0">
        <span className="text-xs text-slate-300 font-medium truncate block">
          {habit.name}
        </span>
        <div className="flex items-center gap-1 mt-0.5">
          <span className="text-xs text-slate-500">
            {stats.completionRate.toFixed(0)}%
          </span>
          {stats.trend === 'up' && (
            <TrendingUp className="h-3 w-3 text-emerald-400" />
          )}
          {stats.trend === 'down' && (
            <TrendingDown className="h-3 w-3 text-rose-400" />
          )}
          {stats.trend === 'stable' && (
            <Minus className="h-3 w-3 text-slate-500" />
          )}
        </div>
      </div>

      {/* Day cells - responsive gap */}
      <div className="flex gap-0.5 xs:gap-1 flex-1 overflow-x-auto scrollbar-hide">
        {days.map((day) => (
          <CompletionCell
            key={formatDate(day)}
            isCompleted={isCompleted(habit.id, day, completions)}
            isToday={formatDate(day) === todayStr}
          />
        ))}
      </div>
    </div>
  )
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function HabitGrid({
  habits: habitsProp,
  completions: completionsProp,
  daysToShow = 7,
  className,
}: HabitGridProps) {
  // Default to empty arrays if undefined to prevent crashes
  const habits = habitsProp ?? []
  const completions = completionsProp ?? []

  const days = useMemo(() => getDaysArray(daysToShow), [daysToShow])

  // Calculate overall stats
  const overallStats = useMemo(() => {
    if (habits.length === 0 || days.length === 0) {
      return { totalPossible: 0, totalCompleted: 0, rate: 0 }
    }

    const totalPossible = habits.length * days.length
    let totalCompleted = 0

    habits.forEach((habit) => {
      days.forEach((day) => {
        if (isCompleted(habit.id, day, completions)) {
          totalCompleted++
        }
      })
    })

    return {
      totalPossible,
      totalCompleted,
      rate: (totalCompleted / totalPossible) * 100,
    }
  }, [habits, days, completions])

  if (habits.length === 0) {
    return (
      <div
        className={cn(
          'rounded-xl p-6 text-center',
          'bg-slate-800/60 border border-slate-700/50',
          className
        )}
      >
        <Target className="h-8 w-8 text-slate-500 mx-auto mb-2" />
        <p className="text-sm text-slate-400">No habits tracked yet</p>
        <p className="text-xs text-slate-500 mt-1">
          Add habits in the Habits section to see your progress
        </p>
      </div>
    )
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={cn(
        'rounded-xl overflow-hidden',
        'bg-slate-800/60 border border-slate-700/50',
        'backdrop-blur-sm',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-slate-700/50">
        <div className="flex items-center gap-2">
          <Target className="h-4 w-4 text-emerald-400" />
          <span className="text-sm font-semibold text-white">This Week's Habits</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">
            {overallStats.totalCompleted}/{overallStats.totalPossible}
          </span>
          <span
            className={cn(
              'px-2 py-0.5 rounded-full text-xs font-medium',
              overallStats.rate >= 70
                ? 'bg-emerald-500/20 text-emerald-400'
                : overallStats.rate >= 40
                ? 'bg-amber-500/20 text-amber-400'
                : 'bg-rose-500/20 text-rose-400'
            )}
          >
            {overallStats.rate.toFixed(0)}%
          </span>
        </div>
      </div>

      {/* Day headers - responsive */}
      <div className="flex items-center gap-2 xs:gap-3 px-2 xs:px-3 py-2 border-b border-slate-700/30">
        <div className="w-16 xs:w-20 sm:w-28 flex-shrink-0" />
        <div className="flex gap-0.5 xs:gap-1 flex-1 overflow-x-auto scrollbar-hide">
          {days.map((day) => (
            <div
              key={formatDate(day)}
              className="w-6 xs:w-7 sm:w-8 text-center text-xs text-slate-500 font-medium flex-shrink-0"
            >
              {getDayLabel(day)}
            </div>
          ))}
        </div>
      </div>

      {/* Habit rows */}
      <div className="p-3 space-y-3">
        {habits.map((habit) => (
          <HabitRow
            key={habit.id}
            habit={habit}
            days={days}
            completions={completions}
          />
        ))}
      </div>

      {/* Week comparison */}
      <div className="px-3 pb-3">
        <div
          className={cn(
            'flex items-center justify-center gap-2 py-2 rounded-lg text-xs',
            overallStats.rate >= 70
              ? 'bg-emerald-500/10 text-emerald-400'
              : overallStats.rate >= 40
              ? 'bg-amber-500/10 text-amber-400'
              : 'bg-slate-700/50 text-slate-400'
          )}
        >
          {overallStats.rate >= 70 ? (
            <>Great week! Keep it up!</>
          ) : overallStats.rate >= 40 ? (
            <>Good progress - room to improve</>
          ) : (
            <>Focus on building consistency</>
          )}
        </div>
      </div>
    </motion.div>
  )
}

export default HabitGrid
