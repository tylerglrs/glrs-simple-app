import { motion } from 'framer-motion'
import { Smile, Frown, Meh, Wind, Flame, Moon, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { MetricPattern, TrendDirection } from '../types'

// =============================================================================
// TYPES
// =============================================================================

export interface TodayMetricsGridProps {
  moodPattern: MetricPattern
  anxietyPattern: MetricPattern
  cravingPattern: MetricPattern
  sleepPattern: MetricPattern
  todayMood?: number
  todayAnxiety?: number
  todayCraving?: number
  todaySleep?: number
  className?: string
}

interface MetricCardProps {
  label: string
  todayValue: number | undefined
  average: number
  trend: TrendDirection
  icon: React.ReactNode
  color: string
  bgGradient: string
  index: number
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

const cardVariants = {
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

function getMoodIcon(value: number) {
  if (value >= 7) return <Smile className="h-5 w-5" />
  if (value >= 4) return <Meh className="h-5 w-5" />
  return <Frown className="h-5 w-5" />
}

function getTrendIcon(trend: TrendDirection) {
  switch (trend) {
    case 'improving':
      return <TrendingUp className="h-3 w-3 text-emerald-400" />
    case 'declining':
      return <TrendingDown className="h-3 w-3 text-rose-400" />
    default:
      return <Minus className="h-3 w-3 text-slate-400" />
  }
}

function getTrendLabel(trend: TrendDirection) {
  switch (trend) {
    case 'improving':
      return 'Improving'
    case 'declining':
      return 'Declining'
    default:
      return 'Stable'
  }
}

function formatValue(value: number | undefined): string {
  if (value === undefined || value === null) return '--'
  return value.toFixed(1)
}

// =============================================================================
// METRIC CARD COMPONENT
// =============================================================================

function MetricCard({
  label,
  todayValue,
  average,
  trend,
  icon,
  color,
  bgGradient,
}: Omit<MetricCardProps, 'index'>) {
  const hasToday = todayValue !== undefined && todayValue !== null

  return (
    <motion.div
      variants={cardVariants}
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        'relative overflow-hidden rounded-lg xs:rounded-xl',
        'bg-slate-800/60 border border-slate-700/50',
        'backdrop-blur-sm cursor-pointer',
        'transition-all duration-200'
      )}
    >
      {/* Background gradient accent */}
      <div className={cn('absolute inset-0 opacity-20', bgGradient)} />

      <div className="relative z-10 p-2 xs:p-3">
        {/* Header */}
        <div className="flex items-center justify-between mb-1.5 xs:mb-2">
          <div className={cn('p-1 xs:p-1.5 rounded-md xs:rounded-lg', color.replace('text-', 'bg-').replace('400', '500/20'))}>
            <span className={color}>{icon}</span>
          </div>
          <div className="flex items-center gap-0.5 xs:gap-1">
            {getTrendIcon(trend)}
            <span className="text-xs text-slate-500 hidden xs:inline">{getTrendLabel(trend)}</span>
          </div>
        </div>

        {/* Label */}
        <span className="text-xs text-slate-400 font-medium">{label}</span>

        {/* Values */}
        <div className="mt-0.5 xs:mt-1 flex items-baseline gap-1 xs:gap-2">
          <span className={cn('text-xl xs:text-2xl font-bold', hasToday ? 'text-white' : 'text-slate-500')}>
            {formatValue(todayValue)}
          </span>
          <span className="text-xs text-slate-500">/10</span>
        </div>

        {/* 30-day average */}
        <div className="mt-0.5 xs:mt-1 flex items-center gap-1">
          <span className="text-xs text-slate-500">30d avg:</span>
          <span className="text-xs text-slate-400 font-medium">
            {formatValue(average)}
          </span>
        </div>
      </div>
    </motion.div>
  )
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function TodayMetricsGrid({
  moodPattern,
  anxietyPattern,
  cravingPattern,
  sleepPattern,
  todayMood,
  todayAnxiety,
  todayCraving,
  todaySleep,
  className,
}: TodayMetricsGridProps) {
  const metrics = [
    {
      label: 'Mood',
      todayValue: todayMood,
      average: moodPattern.average,
      trend: moodPattern.trend,
      icon: todayMood ? getMoodIcon(todayMood) : <Smile className="h-5 w-5" />,
      color: 'text-amber-400',
      bgGradient: 'bg-gradient-to-br from-amber-500/30 to-orange-500/10',
    },
    {
      label: 'Anxiety',
      todayValue: todayAnxiety,
      average: anxietyPattern.average,
      trend: anxietyPattern.trend,
      icon: <Wind className="h-5 w-5" />,
      color: 'text-cyan-400',
      bgGradient: 'bg-gradient-to-br from-cyan-500/30 to-blue-500/10',
    },
    {
      label: 'Cravings',
      todayValue: todayCraving,
      average: cravingPattern.average,
      trend: cravingPattern.trend,
      icon: <Flame className="h-5 w-5" />,
      color: 'text-rose-400',
      bgGradient: 'bg-gradient-to-br from-rose-500/30 to-red-500/10',
    },
    {
      label: 'Sleep',
      todayValue: todaySleep,
      average: sleepPattern.average,
      trend: sleepPattern.trend,
      icon: <Moon className="h-5 w-5" />,
      color: 'text-indigo-400',
      bgGradient: 'bg-gradient-to-br from-indigo-500/30 to-purple-500/10',
    },
  ]

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={cn('grid grid-cols-2 gap-2 xs:gap-3', className)}
    >
      {metrics.map((metric) => (
        <MetricCard key={metric.label} {...metric} />
      ))}
    </motion.div>
  )
}

export default TodayMetricsGrid
