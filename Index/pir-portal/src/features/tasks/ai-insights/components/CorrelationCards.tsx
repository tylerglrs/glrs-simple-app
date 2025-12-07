import { motion } from 'framer-motion'
import { ArrowRight, Sparkles, Moon, Smile, Wind, Flame, Zap, TrendingUp, TrendingDown } from 'lucide-react'
import { cn } from '@/lib/utils'

// =============================================================================
// TYPES
// =============================================================================

export type CorrelationType = 'positive' | 'negative' | 'neutral'

export interface Correlation {
  id: string
  metric1: string
  metric2: string
  type: CorrelationType
  strength: number // 0-1
  description: string
  icon1: React.ReactNode
  icon2: React.ReactNode
}

export interface CorrelationCardsProps {
  correlations: Correlation[]
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
      delayChildren: 0.1,
    },
  },
}

const cardVariants = {
  hidden: { opacity: 0, x: 20, scale: 0.95 },
  visible: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: {
      type: 'spring' as const,
      stiffness: 400,
      damping: 25,
    },
  },
}

// =============================================================================
// CORRELATION CARD COMPONENT
// =============================================================================

interface CorrelationCardProps {
  correlation: Correlation
}

function CorrelationCard({ correlation }: CorrelationCardProps) {
  const { metric1, metric2, type, strength, description, icon1, icon2 } = correlation

  const strengthPercent = Math.round(strength * 100)

  const typeColors = {
    positive: {
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/30',
      text: 'text-emerald-400',
      icon: <TrendingUp className="h-2.5 w-2.5" />,
    },
    negative: {
      bg: 'bg-rose-500/10',
      border: 'border-rose-500/30',
      text: 'text-rose-400',
      icon: <TrendingDown className="h-2.5 w-2.5" />,
    },
    neutral: {
      bg: 'bg-slate-500/10',
      border: 'border-slate-500/30',
      text: 'text-slate-400',
      icon: <ArrowRight className="h-2.5 w-2.5" />,
    },
  }

  const colors = typeColors[type]

  return (
    <motion.div
      variants={cardVariants}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      className={cn(
        // Always full width
        'w-full',
        'rounded-lg p-3',
        'bg-slate-800/60 border border-slate-700/50',
        'backdrop-blur-sm cursor-pointer',
        'transition-all duration-200'
      )}
    >
      {/* Metrics connection visual - Compact */}
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-1.5">
          {/* Metric 1 */}
          <div className="p-1 rounded bg-slate-700/50">
            {icon1}
          </div>

          {/* Connection arrow with type indicator */}
          <div className={cn('flex items-center gap-0.5 px-1 py-0.5 rounded-full', colors.bg)}>
            {colors.icon}
            <span className={cn('text-[10px] font-medium', colors.text)}>
              {type === 'positive' ? '+' : type === 'negative' ? '-' : '~'}
            </span>
          </div>

          {/* Metric 2 */}
          <div className="p-1 rounded bg-slate-700/50">
            {icon2}
          </div>
        </div>

        {/* Strength indicator */}
        <div className={cn(
          'px-1 py-0.5 rounded text-[10px] font-bold',
          colors.bg,
          colors.text
        )}>
          {strengthPercent}%
        </div>
      </div>

      {/* Metric labels */}
      <div className="flex items-center gap-1 mb-1">
        <span className="text-[10px] text-white font-medium">{metric1}</span>
        <ArrowRight className="h-2 w-2 text-slate-500" />
        <span className="text-[10px] text-white font-medium">{metric2}</span>
      </div>

      {/* Description - Full text display, no truncation */}
      <p className="text-[10px] text-slate-400 leading-relaxed">
        {description}
      </p>

      {/* Strength bar */}
      <div className="mt-1.5">
        <div className="h-0.5 rounded-full bg-slate-700/50 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${strengthPercent}%` }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className={cn(
              'h-full rounded-full',
              type === 'positive'
                ? 'bg-gradient-to-r from-emerald-500 to-emerald-400'
                : type === 'negative'
                ? 'bg-gradient-to-r from-rose-500 to-rose-400'
                : 'bg-gradient-to-r from-slate-500 to-slate-400'
            )}
          />
        </div>
      </div>
    </motion.div>
  )
}

// =============================================================================
// DEFAULT CORRELATIONS (used when no data provided)
// =============================================================================

export const DEFAULT_CORRELATIONS: Correlation[] = [
  {
    id: 'sleep-mood',
    metric1: 'Sleep',
    metric2: 'Mood',
    type: 'positive',
    strength: 0.72,
    description: 'Better sleep quality is associated with improved mood the next day',
    icon1: <Moon className="h-4 w-4 text-indigo-400" />,
    icon2: <Smile className="h-4 w-4 text-amber-400" />,
  },
  {
    id: 'anxiety-craving',
    metric1: 'Anxiety',
    metric2: 'Cravings',
    type: 'positive',
    strength: 0.65,
    description: 'Higher anxiety levels tend to coincide with increased cravings',
    icon1: <Wind className="h-4 w-4 text-cyan-400" />,
    icon2: <Flame className="h-4 w-4 text-rose-400" />,
  },
  {
    id: 'energy-mood',
    metric1: 'Energy',
    metric2: 'Mood',
    type: 'positive',
    strength: 0.58,
    description: 'Days with higher energy often show better overall mood',
    icon1: <Zap className="h-4 w-4 text-emerald-400" />,
    icon2: <Smile className="h-4 w-4 text-amber-400" />,
  },
  {
    id: 'sleep-anxiety',
    metric1: 'Sleep',
    metric2: 'Anxiety',
    type: 'negative',
    strength: 0.61,
    description: 'Poor sleep is linked to higher anxiety levels',
    icon1: <Moon className="h-4 w-4 text-indigo-400" />,
    icon2: <Wind className="h-4 w-4 text-cyan-400" />,
  },
]

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function CorrelationCards({
  correlations = DEFAULT_CORRELATIONS,
  className,
}: CorrelationCardsProps) {
  return (
    <div className={cn('relative', className)}>
      {/* Header */}
      <div className="flex items-center gap-1.5 mb-2">
        <Sparkles className="h-3 w-3 text-violet-400" />
        <span className="text-xs font-semibold text-white">Pattern Correlations</span>
        <span className="text-[10px] text-slate-500 ml-auto hidden md:inline">Swipe →</span>
      </div>

      {/* Cards - ALWAYS stack vertically using grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 gap-3"
      >
        {correlations.map((correlation) => (
          <CorrelationCard key={correlation.id} correlation={correlation} />
        ))}
      </motion.div>
    </div>
  )
}

export default CorrelationCards
