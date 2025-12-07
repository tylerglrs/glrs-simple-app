import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { Timestamp } from 'firebase/firestore'
import {
  Target,
  CheckCircle2,
  Clock,
  TrendingUp,
  ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// =============================================================================
// TYPES
// =============================================================================

export interface GoalEntry {
  id: string
  title: string
  description?: string
  category?: string
  progress: number // 0-100
  status: 'active' | 'completed' | 'archived'
  targetDate?: Date | Timestamp
}

export interface GoalProgressProps {
  goals: GoalEntry[]
  maxGoals?: number
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
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      type: 'spring' as const,
      stiffness: 400,
      damping: 25,
    },
  },
}

const progressVariants = {
  hidden: { width: 0 },
  visible: (progress: number) => ({
    width: `${progress}%`,
    transition: {
      type: 'spring' as const,
      stiffness: 100,
      damping: 20,
      delay: 0.3,
    },
  }),
}

// =============================================================================
// CONSTANTS
// =============================================================================

const CATEGORY_COLORS: Record<string, { bg: string; bar: string; text: string }> = {
  recovery: { bg: 'bg-violet-500/10', bar: 'bg-violet-500', text: 'text-violet-400' },
  health: { bg: 'bg-emerald-500/10', bar: 'bg-emerald-500', text: 'text-emerald-400' },
  social: { bg: 'bg-cyan-500/10', bar: 'bg-cyan-500', text: 'text-cyan-400' },
  financial: { bg: 'bg-amber-500/10', bar: 'bg-amber-500', text: 'text-amber-400' },
  personal: { bg: 'bg-rose-500/10', bar: 'bg-rose-500', text: 'text-rose-400' },
  work: { bg: 'bg-blue-500/10', bar: 'bg-blue-500', text: 'text-blue-400' },
  default: { bg: 'bg-slate-500/10', bar: 'bg-slate-500', text: 'text-slate-400' },
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function getCategoryColors(category?: string) {
  if (!category) return CATEGORY_COLORS.default
  return CATEGORY_COLORS[category.toLowerCase()] || CATEGORY_COLORS.default
}

function formatDueDate(date?: Date | Timestamp): string | null {
  if (!date) return null
  const d = date instanceof Timestamp ? date.toDate() : date
  const now = new Date()
  const diffDays = Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

  if (diffDays < 0) return 'Overdue'
  if (diffDays === 0) return 'Due today'
  if (diffDays === 1) return 'Due tomorrow'
  if (diffDays < 7) return `${diffDays} days left`
  if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks left`
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function getProgressLabel(progress: number): string {
  if (progress === 100) return 'Complete!'
  if (progress >= 75) return 'Almost there'
  if (progress >= 50) return 'Halfway'
  if (progress >= 25) return 'In progress'
  return 'Just started'
}

// =============================================================================
// EMPTY STATE
// =============================================================================

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <div className="p-3 rounded-full bg-slate-700/50 mb-3">
        <Target className="h-6 w-6 text-slate-400" />
      </div>
      <p className="text-sm text-slate-400 mb-1">No goals set yet</p>
      <p className="text-xs text-slate-500">
        Create goals to track your progress
      </p>
    </div>
  )
}

// =============================================================================
// GOAL CARD COMPONENT
// =============================================================================

interface GoalCardProps {
  goal: GoalEntry
}

function GoalCard({ goal }: GoalCardProps) {
  const colors = getCategoryColors(goal.category)
  const dueDate = formatDueDate(goal.targetDate)
  const isCompleted = goal.status === 'completed' || goal.progress === 100

  return (
    <motion.div
      variants={itemVariants}
      whileHover={{ x: 4 }}
      className={cn(
        'p-3 rounded-xl cursor-pointer',
        'bg-slate-800/60 border border-slate-700/50',
        'hover:bg-slate-700/60 transition-colors duration-200',
        'group'
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {isCompleted ? (
            <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0" />
          ) : (
            <Target className={cn('h-4 w-4 flex-shrink-0', colors.text)} />
          )}
          <span className={cn(
            'text-sm font-medium truncate',
            isCompleted ? 'text-emerald-300 line-through' : 'text-white'
          )}>
            {goal.title}
          </span>
        </div>
        <ChevronRight className="h-4 w-4 text-slate-500 group-hover:text-violet-400 transition-colors flex-shrink-0" />
      </div>

      {/* Category and due date */}
      <div className="flex items-center gap-2 mb-2">
        {goal.category && (
          <span className={cn(
            'text-xs px-1.5 py-0.5 rounded-full',
            colors.bg,
            colors.text
          )}>
            {goal.category}
          </span>
        )}
        {dueDate && (
          <span className={cn(
            'text-xs flex items-center gap-1',
            dueDate === 'Overdue' ? 'text-rose-400' : 'text-slate-500'
          )}>
            <Clock className="h-3 w-3" />
            {dueDate}
          </span>
        )}
      </div>

      {/* Progress bar */}
      <div className="relative">
        <div className="h-2 rounded-full bg-slate-700/50 overflow-hidden">
          <motion.div
            variants={progressVariants}
            custom={goal.progress}
            initial="hidden"
            animate="visible"
            className={cn('h-full rounded-full', colors.bar)}
          />
        </div>
        <div className="flex items-center justify-between mt-1">
          <span className="text-xs text-slate-500">
            {getProgressLabel(goal.progress)}
          </span>
          <span className={cn('text-xs font-medium', colors.text)}>
            {goal.progress}%
          </span>
        </div>
      </div>
    </motion.div>
  )
}

// =============================================================================
// SUMMARY STATS
// =============================================================================

interface SummaryStatsProps {
  goals: GoalEntry[]
}

function SummaryStats({ goals }: SummaryStatsProps) {
  const activeGoals = goals.filter((g) => g.status === 'active')
  const completedGoals = goals.filter((g) => g.status === 'completed' || g.progress === 100)
  const avgProgress = activeGoals.length > 0
    ? Math.round(activeGoals.reduce((acc, g) => acc + g.progress, 0) / activeGoals.length)
    : 0

  return (
    <div className="flex items-center justify-around py-2 border-b border-slate-700/30">
      <div className="text-center">
        <span className="text-lg font-bold text-violet-400">{activeGoals.length}</span>
        <span className="text-xs text-slate-500 block">Active</span>
      </div>
      <div className="w-px h-8 bg-slate-700/50" />
      <div className="text-center">
        <span className="text-lg font-bold text-emerald-400">{completedGoals.length}</span>
        <span className="text-xs text-slate-500 block">Completed</span>
      </div>
      <div className="w-px h-8 bg-slate-700/50" />
      <div className="text-center">
        <div className="flex items-center justify-center gap-1">
          <TrendingUp className="h-3 w-3 text-cyan-400" />
          <span className="text-lg font-bold text-cyan-400">{avgProgress}%</span>
        </div>
        <span className="text-xs text-slate-500 block">Avg Progress</span>
      </div>
    </div>
  )
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function GoalProgress({
  goals: goalsProp,
  maxGoals = 5,
  className,
}: GoalProgressProps) {
  // Default to empty array if undefined to prevent crashes
  const goals = goalsProp ?? []

  // Sort: active first (by progress desc), then completed
  const sortedGoals = useMemo(() => {
    const active = goals
      .filter((g) => g.status === 'active')
      .sort((a, b) => b.progress - a.progress)
    const completed = goals.filter((g) => g.status === 'completed')
    return [...active, ...completed].slice(0, maxGoals)
  }, [goals, maxGoals])

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
      <div className="flex items-center justify-between p-2 md:p-3 border-b border-slate-700/50">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-violet-500/20">
            <Target className="h-4 w-4 text-violet-400" />
          </div>
          <div>
            <span className="text-sm font-semibold text-white">Goal Progress</span>
            <span className="text-xs text-slate-400 block">
              {goals.length} total goal{goals.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </div>

      {/* Summary stats */}
      {goals.length > 0 && <SummaryStats goals={goals} />}

      {/* Goal list */}
      <div className="p-2 md:p-3">
        {sortedGoals.length === 0 ? (
          <EmptyState />
        ) : (
          <motion.div variants={containerVariants} className="space-y-3">
            {sortedGoals.map((goal) => (
              <GoalCard key={goal.id} goal={goal} />
            ))}
          </motion.div>
        )}
      </div>

      {/* View all link */}
      {goals.length > maxGoals && (
        <div className="px-2 pb-2 md:px-3 md:pb-3">
          <button className="w-full py-2 rounded-lg bg-slate-700/30 border border-slate-600/30 text-xs text-slate-400 hover:text-white hover:bg-slate-700/50 transition-colors">
            View all {goals.length} goals
          </button>
        </div>
      )}
    </motion.div>
  )
}

export default GoalProgress
