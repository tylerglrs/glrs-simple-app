import { useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  Brain,
  Sparkles,
  Target,
  TrendingUp,
  Lightbulb,
  Rocket,
  ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useGoalCoach } from '@/hooks'

// =============================================================================
// TYPES
// =============================================================================

export interface GoalCoachingInsight {
  id: string
  type: 'progress' | 'strategy' | 'motivation' | 'adjustment'
  title: string
  description: string
}

export interface GoalCoachingProps {
  insights?: GoalCoachingInsight[]
  activeGoalCount?: number
  completedGoalCount?: number
  avgProgress?: number
  isLoading?: boolean
  className?: string
}

// Legacy type alias
export type AIGoalCoachingProps = GoalCoachingProps

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
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring' as const,
      stiffness: 400,
      damping: 25,
    },
  },
}

const pulseVariants = {
  initial: { scale: 1, opacity: 0.6 },
  animate: {
    scale: [1, 1.1, 1],
    opacity: [0.6, 1, 0.6],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'easeInOut' as const,
    },
  },
}

// =============================================================================
// DEFAULT INSIGHTS (placeholders until Phase 7 GPT integration)
// =============================================================================

const DEFAULT_INSIGHTS: GoalCoachingInsight[] = [
  {
    id: '1',
    type: 'progress',
    title: 'Strong momentum this week',
    description:
      'You\'ve made progress on 3 goals. Your recovery and health goals are showing the most improvement.',
  },
  {
    id: '2',
    type: 'strategy',
    title: 'Break down larger goals',
    description:
      'Your "Rebuild Savings" goal could benefit from weekly sub-targets. Try setting a $50/week milestone.',
  },
  {
    id: '3',
    type: 'motivation',
    title: '90-day milestone approaching',
    description:
      'You\'re 12 days away from a major recovery milestone. Your consistent check-ins are building strong foundations.',
  },
  {
    id: '4',
    type: 'adjustment',
    title: 'Rebalance social goals',
    description:
      'Your social area has lower activity. Consider adding a small goal like "Reach out to 1 friend weekly".',
  },
]

// =============================================================================
// INSIGHT TYPE CONFIG
// =============================================================================

function InsightIcon({ type }: { type: GoalCoachingInsight['type'] }) {
  switch (type) {
    case 'progress':
      return <TrendingUp className="h-4 w-4 text-emerald-400" />
    case 'strategy':
      return <Target className="h-4 w-4 text-cyan-400" />
    case 'motivation':
      return <Rocket className="h-4 w-4 text-violet-400" />
    case 'adjustment':
      return <Lightbulb className="h-4 w-4 text-amber-400" />
  }
}

function getInsightColors(type: GoalCoachingInsight['type']) {
  switch (type) {
    case 'progress':
      return { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' }
    case 'strategy':
      return { bg: 'bg-cyan-500/10', border: 'border-cyan-500/30' }
    case 'motivation':
      return { bg: 'bg-violet-500/10', border: 'border-violet-500/30' }
    case 'adjustment':
      return { bg: 'bg-amber-500/10', border: 'border-amber-500/30' }
  }
}

// =============================================================================
// LOADING SKELETON
// =============================================================================

function LoadingSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="p-3 rounded-lg bg-slate-700/30 animate-pulse">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-4 w-4 rounded bg-slate-600" />
            <div className="h-4 w-32 rounded bg-slate-600" />
          </div>
          <div className="h-3 w-full rounded bg-slate-600/50" />
          <div className="h-3 w-3/4 rounded bg-slate-600/50 mt-1" />
        </div>
      ))}
    </div>
  )
}

// =============================================================================
// STATS BAR
// =============================================================================

interface StatsBarProps {
  activeGoalCount: number
  completedGoalCount: number
  avgProgress: number
}

function StatsBar({ activeGoalCount, completedGoalCount, avgProgress }: StatsBarProps) {
  return (
    <div className="flex items-center justify-around py-2 border-b border-slate-700/30">
      <div className="text-center">
        <span className="text-lg font-bold text-violet-400">{activeGoalCount}</span>
        <span className="text-xs text-slate-500 block">Active</span>
      </div>
      <div className="w-px h-8 bg-slate-700/50" />
      <div className="text-center">
        <span className="text-lg font-bold text-emerald-400">{completedGoalCount}</span>
        <span className="text-xs text-slate-500 block">Completed</span>
      </div>
      <div className="w-px h-8 bg-slate-700/50" />
      <div className="text-center">
        <div className="flex items-center justify-center gap-1">
          <TrendingUp className="h-3 w-3 text-cyan-400" />
          <span className="text-lg font-bold text-cyan-400">{avgProgress}%</span>
        </div>
        <span className="text-xs text-slate-500 block">Progress</span>
      </div>
    </div>
  )
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function GoalCoaching({
  insights,
  activeGoalCount = 0,
  completedGoalCount = 0,
  avgProgress = 0,
  isLoading = false,
  className,
}: GoalCoachingProps) {
  const { data: coachData, loading: coachLoading } = useGoalCoach()

  // Get insights from Firestore (use cards array, fallback to insights alias)
  const firestoreInsights = useMemo<GoalCoachingInsight[]>(() => {
    const cards = coachData?.cards || coachData?.insights
    if (!cards) return []

    return cards.map((insight, idx) => ({
      id: insight.id || `goal-${idx}`,
      type: (insight.type as GoalCoachingInsight['type']) || 'progress',
      title: insight.title,
      description: insight.message || (insight as { description?: string }).description || '',
    }))
  }, [coachData])

  // Use Firestore stats if available
  const displayActiveCount = coachData?.activeGoalCount ?? activeGoalCount
  const displayCompletedCount = coachData?.completedGoalCount ?? completedGoalCount
  const displayProgress = coachData?.avgProgress ?? avgProgress

  // Prefer Firestore insights, then props, then defaults
  const displayInsights = firestoreInsights.length > 0
    ? firestoreInsights
    : insights || DEFAULT_INSIGHTS

  const showLoading = isLoading || coachLoading

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
      {/* Header with AI indicator */}
      <div className="flex items-center justify-between p-2 md:p-3 border-b border-slate-700/50">
        <div className="flex items-center gap-2">
          <motion.div
            variants={pulseVariants}
            initial="initial"
            animate="animate"
            className="relative"
          >
            <div className="absolute inset-0 rounded-full bg-cyan-500/30 blur-md" />
            <div className="relative p-1.5 rounded-full bg-gradient-to-br from-cyan-500 to-violet-500">
              <Brain className="h-4 w-4 text-white" />
            </div>
          </motion.div>
          <div>
            <span className="text-sm font-semibold text-white">Goal Coach</span>
            <span className="text-xs text-emerald-400 block">
              Personalized guidance
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-cyan-500/20">
          <Sparkles className="h-3 w-3 text-cyan-400" />
          <span className="text-xs text-cyan-300">Beacon</span>
        </div>
      </div>

      {/* Stats summary */}
      <StatsBar
        activeGoalCount={displayActiveCount}
        completedGoalCount={displayCompletedCount}
        avgProgress={displayProgress}
      />

      {/* Insights */}
      <div className="p-2 md:p-3">
        {showLoading ? (
          <LoadingSkeleton />
        ) : (
          <motion.div variants={containerVariants} className="space-y-3">
            {displayInsights.map((insight) => {
              // Ensure insight has a valid type before rendering
              if (!insight || !insight.type) return null
              const colors = getInsightColors(insight.type)
              return (
                <motion.div
                  key={insight.id}
                  variants={itemVariants}
                  whileHover={{ x: 4 }}
                  className={cn(
                    'p-3 rounded-lg cursor-pointer',
                    'transition-all duration-200',
                    colors.bg,
                    'border',
                    colors.border
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <InsightIcon type={insight.type} />
                      <span className="text-sm font-medium text-white">
                        {insight.title}
                      </span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-500 flex-shrink-0" />
                  </div>
                  <p className="text-xs text-slate-400 mt-1.5 leading-relaxed pl-6">
                    {insight.description}
                  </p>
                </motion.div>
              )
            })}
          </motion.div>
        )}
      </div>

      {/* Footer - Refresh time */}
      <div className="px-2 pb-2 md:px-3 md:pb-3">
        <div className="py-1 text-center">
          <span className="text-xs text-slate-500">
            Refreshes every Sunday at 6 AM
          </span>
        </div>
      </div>
    </motion.div>
  )
}

// Legacy export for backward compatibility
export const AIGoalCoaching = GoalCoaching

export default GoalCoaching
