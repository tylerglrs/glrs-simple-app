import { useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  Brain,
  Sparkles,
  ChevronRight,
  Star,
  Target,
  Clock,
  Calendar,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useHabitCoach } from '@/hooks'

// =============================================================================
// TYPES
// =============================================================================

export interface HabitRecommendation {
  id: string
  type: 'praise' | 'suggestion' | 'schedule' | 'insight'
  title: string
  description: string
}

export interface HabitCoachProps {
  recommendations?: HabitRecommendation[]
  bestHabit?: string
  focusHabit?: string
  isLoading?: boolean
  className?: string
}

// Legacy type alias
export type AIHabitCoachProps = HabitCoachProps

// =============================================================================
// DEFAULT RECOMMENDATIONS (placeholders until Phase 7 GPT integration)
// =============================================================================

const DEFAULT_RECOMMENDATIONS: HabitRecommendation[] = [
  {
    id: '1',
    type: 'praise',
    title: 'Gratitude journaling is working',
    description:
      'Your consistent gratitude practice correlates with 18% higher mood scores. Keep it up!',
  },
  {
    id: '2',
    type: 'suggestion',
    title: 'Try habit stacking',
    description:
      'Pair your exercise habit with an existing routine to improve consistency. After morning coffee → 5 minute walk.',
  },
  {
    id: '3',
    type: 'schedule',
    title: 'Weekend habits need attention',
    description:
      'Your completion rate drops 40% on weekends. Consider lighter, modified versions for Sat/Sun.',
  },
]

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
// RECOMMENDATION ICON
// =============================================================================

function RecommendationIcon({ type }: { type: HabitRecommendation['type'] }) {
  switch (type) {
    case 'praise':
      return <Star className="h-4 w-4 text-amber-400" />
    case 'suggestion':
      return <Target className="h-4 w-4 text-emerald-400" />
    case 'schedule':
      return <Calendar className="h-4 w-4 text-violet-400" />
    case 'insight':
      return <Clock className="h-4 w-4 text-cyan-400" />
  }
}

function getRecommendationColors(type: HabitRecommendation['type']) {
  switch (type) {
    case 'praise':
      return { bg: 'bg-amber-500/10', border: 'border-amber-500/30' }
    case 'suggestion':
      return { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' }
    case 'schedule':
      return { bg: 'bg-violet-500/10', border: 'border-violet-500/30' }
    case 'insight':
      return { bg: 'bg-cyan-500/10', border: 'border-cyan-500/30' }
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
// MAIN COMPONENT
// =============================================================================

export function HabitCoach({
  recommendations,
  bestHabit,
  focusHabit,
  isLoading = false,
  className,
}: HabitCoachProps) {
  const { data: coachData, loading: coachLoading } = useHabitCoach()

  // Get recommendations from Firestore (use cards array, fallback to recommendations alias)
  const firestoreRecommendations = useMemo<HabitRecommendation[]>(() => {
    const cards = coachData?.cards || coachData?.recommendations
    if (!cards) return []

    return cards.map((rec, idx) => ({
      id: rec.id || `habit-${idx}`,
      type: (rec.type as HabitRecommendation['type']) || 'suggestion',
      title: rec.title,
      description: rec.message || (rec as { description?: string }).description || '',
    }))
  }, [coachData])

  // Get best/focus habits from Firestore if available
  const displayBestHabit = coachData?.bestHabit || bestHabit
  const displayFocusHabit = coachData?.focusHabit || focusHabit

  // Prefer Firestore recommendations, then props, then defaults
  const displayRecommendations = firestoreRecommendations.length > 0
    ? firestoreRecommendations
    : recommendations || DEFAULT_RECOMMENDATIONS

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
            <div className="absolute inset-0 rounded-full bg-violet-500/30 blur-md" />
            <div className="relative p-1.5 rounded-full bg-gradient-to-br from-violet-500 to-emerald-500">
              <Brain className="h-4 w-4 text-white" />
            </div>
          </motion.div>
          <div>
            <span className="text-sm font-semibold text-white">Habit Coach</span>
            <span className="text-xs text-emerald-400 block">
              Personalized recommendations
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-violet-500/20">
          <Sparkles className="h-3 w-3 text-violet-400" />
          <span className="text-xs text-violet-300">Beacon</span>
        </div>
      </div>

      {/* Quick stats */}
      {(displayBestHabit || displayFocusHabit) && (
        <div className="grid grid-cols-2 gap-2 p-2 md:p-3 border-b border-slate-700/30">
          {displayBestHabit && (
            <div className="flex items-center gap-2 p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
              <Star className="h-3.5 w-3.5 text-emerald-400" />
              <div>
                <span className="text-xs text-slate-400 block">Strongest</span>
                <span className="text-xs text-emerald-300 font-medium truncate block">
                  {displayBestHabit}
                </span>
              </div>
            </div>
          )}
          {displayFocusHabit && (
            <div className="flex items-center gap-2 p-2 rounded-lg bg-amber-500/10 border border-amber-500/30">
              <Target className="h-3.5 w-3.5 text-amber-400" />
              <div>
                <span className="text-xs text-slate-400 block">Focus on</span>
                <span className="text-xs text-amber-300 font-medium truncate block">
                  {displayFocusHabit}
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Recommendations */}
      <div className="p-2 md:p-3">
        {showLoading ? (
          <LoadingSkeleton />
        ) : (
          <motion.div variants={containerVariants} className="space-y-3">
            {displayRecommendations.map((rec) => {
              const colors = getRecommendationColors(rec.type)
              return (
                <motion.div
                  key={rec.id}
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
                      <RecommendationIcon type={rec.type} />
                      <span className="text-sm font-medium text-white">
                        {rec.title}
                      </span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-500 flex-shrink-0" />
                  </div>
                  <p className="text-xs text-slate-400 mt-1.5 leading-relaxed pl-6">
                    {rec.description}
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
export const AIHabitCoach = HabitCoach

export default HabitCoach
