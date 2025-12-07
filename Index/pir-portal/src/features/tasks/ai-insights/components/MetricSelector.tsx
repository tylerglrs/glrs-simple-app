import { motion } from 'framer-motion'
import { Smile, Wind, Flame, Moon, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'
import { haptics } from '@/lib/animations'

// =============================================================================
// TYPES
// =============================================================================

export type MetricType = 'mood' | 'anxiety' | 'craving' | 'sleep' | 'energy'

export interface MetricSelectorProps {
  selectedMetric: MetricType
  onSelect: (metric: MetricType) => void
  className?: string
}

interface MetricOption {
  id: MetricType
  label: string
  icon: React.ReactNode
  color: string
  activeColor: string
  activeBg: string
}

// =============================================================================
// METRIC OPTIONS CONFIG
// =============================================================================

const METRIC_OPTIONS: MetricOption[] = [
  {
    id: 'mood',
    label: 'Mood',
    icon: <Smile className="h-4 w-4" />,
    color: 'text-slate-400',
    activeColor: 'text-amber-400',
    activeBg: 'bg-amber-500/20',
  },
  {
    id: 'anxiety',
    label: 'Anxiety',
    icon: <Wind className="h-4 w-4" />,
    color: 'text-slate-400',
    activeColor: 'text-cyan-400',
    activeBg: 'bg-cyan-500/20',
  },
  {
    id: 'craving',
    label: 'Cravings',
    icon: <Flame className="h-4 w-4" />,
    color: 'text-slate-400',
    activeColor: 'text-rose-400',
    activeBg: 'bg-rose-500/20',
  },
  {
    id: 'sleep',
    label: 'Sleep',
    icon: <Moon className="h-4 w-4" />,
    color: 'text-slate-400',
    activeColor: 'text-indigo-400',
    activeBg: 'bg-indigo-500/20',
  },
  {
    id: 'energy',
    label: 'Energy',
    icon: <Zap className="h-4 w-4" />,
    color: 'text-slate-400',
    activeColor: 'text-emerald-400',
    activeBg: 'bg-emerald-500/20',
  },
]

// =============================================================================
// COMPONENT
// =============================================================================

export function MetricSelector({ selectedMetric, onSelect, className }: MetricSelectorProps) {
  return (
    <div
      className={cn(
        'flex gap-1 p-1 rounded-xl',
        'bg-slate-800/60 border border-slate-700/50',
        'overflow-x-auto scrollbar-hide',
        className
      )}
    >
      {METRIC_OPTIONS.map((metric) => {
        const isSelected = selectedMetric === metric.id

        return (
          <button
            key={metric.id}
            onClick={() => {
              haptics.tap()
              onSelect(metric.id)
            }}
            className={cn(
              'relative flex items-center gap-1.5 px-2 py-2 sm:px-3 rounded-lg min-h-touch',
              'transition-all duration-200',
              'text-xs font-medium whitespace-nowrap',
              isSelected
                ? cn(metric.activeColor, metric.activeBg)
                : cn(metric.color, 'hover:text-slate-200 hover:bg-slate-700/50')
            )}
          >
            {/* Active indicator background */}
            {isSelected && (
              <motion.div
                layoutId="activeMetric"
                className={cn(
                  'absolute inset-0 rounded-lg',
                  metric.activeBg,
                  'border border-current/20'
                )}
                transition={{
                  type: 'spring',
                  stiffness: 400,
                  damping: 30,
                }}
              />
            )}
            <span className="relative z-10">{metric.icon}</span>
            <span className="relative z-10">{metric.label}</span>
          </button>
        )
      })}
    </div>
  )
}

export default MetricSelector
