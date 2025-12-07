import { motion } from 'framer-motion'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Cell,
  Tooltip,
} from 'recharts'
import { Zap, Smile, Moon, Wind } from 'lucide-react'
import { cn } from '@/lib/utils'

// =============================================================================
// TYPES
// =============================================================================

export type ImpactMetric = 'mood' | 'energy' | 'sleep' | 'anxiety'

export interface HabitImpact {
  habitId: string
  habitName: string
  impact: number // -1 to 1 (or actual point difference)
  metric: ImpactMetric
}

export interface HabitImpactChartProps {
  impacts: HabitImpact[]
  selectedMetric?: ImpactMetric
  onMetricChange?: (metric: ImpactMetric) => void
  className?: string
}

// =============================================================================
// ANIMATION VARIANTS
// =============================================================================

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
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

// =============================================================================
// CONSTANTS
// =============================================================================

const METRIC_CONFIG: Record<
  ImpactMetric,
  { label: string; icon: React.ReactNode; color: string; bgColor: string }
> = {
  mood: {
    label: 'Mood',
    icon: <Smile className="h-3.5 w-3.5" />,
    color: '#fbbf24', // amber-400
    bgColor: 'bg-amber-500/20',
  },
  energy: {
    label: 'Energy',
    icon: <Zap className="h-3.5 w-3.5" />,
    color: '#34d399', // emerald-400
    bgColor: 'bg-emerald-500/20',
  },
  sleep: {
    label: 'Sleep',
    icon: <Moon className="h-3.5 w-3.5" />,
    color: '#818cf8', // indigo-400
    bgColor: 'bg-indigo-500/20',
  },
  anxiety: {
    label: 'Anxiety',
    icon: <Wind className="h-3.5 w-3.5" />,
    color: '#22d3ee', // cyan-400
    bgColor: 'bg-cyan-500/20',
  },
}

// =============================================================================
// CUSTOM TOOLTIP
// =============================================================================

interface CustomTooltipProps {
  active?: boolean
  payload?: Array<{ value: number; payload: { habitName: string } }>
  metric: ImpactMetric
}

function CustomTooltip({ active, payload, metric }: CustomTooltipProps) {
  if (!active || !payload || !payload.length) return null

  const data = payload[0]
  const config = METRIC_CONFIG[metric]

  // Safety check: ensure config and data exist
  if (!config || !config.label || !data) return null

  const isPositive = data.value > 0

  return (
    <div
      className={cn(
        'px-3 py-2 rounded-lg',
        'bg-slate-800/90 border border-slate-700/50',
        'backdrop-blur-sm shadow-lg'
      )}
    >
      <p className="text-xs text-slate-400 mb-1">{data.payload?.habitName || 'Unknown habit'}</p>
      <p className="text-sm font-bold" style={{ color: config.color }}>
        {isPositive ? '+' : ''}
        {typeof data.value === 'number' ? data.value.toFixed(2) : '0.00'} {config.label.toLowerCase()}
      </p>
    </div>
  )
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function HabitImpactChart({
  impacts: impactsProp,
  selectedMetric = 'mood',
  onMetricChange,
  className,
}: HabitImpactChartProps) {
  // Default to empty array if undefined to prevent crashes
  const impacts = impactsProp ?? []

  const config = METRIC_CONFIG[selectedMetric]

  // Filter impacts for selected metric and sort by impact value
  const chartData = impacts
    .filter((i) => i.metric === selectedMetric)
    .sort((a, b) => b.impact - a.impact)
    .slice(0, 5) // Top 5 habits
    .map((impact) => ({
      habitName: impact.habitName.length > 12
        ? impact.habitName.slice(0, 12) + '...'
        : impact.habitName,
      fullName: impact.habitName,
      impact: impact.impact,
    }))

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
          <div className={cn('p-1.5 rounded-lg', config.bgColor)}>
            <span style={{ color: config.color }}>{config.icon}</span>
          </div>
          <span className="text-sm font-semibold text-white">
            How Habits Affect {config.label}
          </span>
        </div>
      </div>

      {/* Metric selector */}
      <div className="flex flex-wrap gap-1 p-2 border-b border-slate-700/30">
        {(Object.keys(METRIC_CONFIG) as ImpactMetric[]).map((metric) => {
          const metricConfig = METRIC_CONFIG[metric]
          const isSelected = selectedMetric === metric
          return (
            <button
              key={metric}
              onClick={() => onMetricChange?.(metric)}
              className={cn(
                'flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium transition-all',
                isSelected
                  ? cn(metricConfig.bgColor, 'border border-current/30')
                  : 'text-slate-500 hover:text-slate-300'
              )}
              style={isSelected ? { color: metricConfig.color } : undefined}
            >
              {metricConfig.icon}
              <span>{metricConfig.label}</span>
            </button>
          )
        })}
      </div>

      {/* Chart */}
      <div className="p-2 md:p-3">
        {chartData.length === 0 ? (
          <div className="h-40 md:h-48 flex items-center justify-center text-sm text-slate-500">
            Not enough data to show correlations
          </div>
        ) : (
          <div className="h-40 md:h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
              >
                <XAxis
                  type="number"
                  domain={[-1, 1]}
                  tickFormatter={(v: number) => (v > 0 ? `+${v}` : v.toString())}
                  tick={{ fill: '#64748b', fontSize: 10 }}
                  axisLine={{ stroke: '#334155' }}
                  tickLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="habitName"
                  tick={{ fill: '#94a3b8', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  width={75}
                />
                <Tooltip
                  content={<CustomTooltip metric={selectedMetric} />}
                  cursor={{ fill: 'rgba(148, 163, 184, 0.1)' }}
                />
                <Bar dataKey="impact" radius={[0, 4, 4, 0]} maxBarSize={24}>
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.impact >= 0 ? config.color : '#ef4444'}
                      fillOpacity={0.8}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="px-2 md:px-3 pb-2 md:pb-3 flex items-center justify-center gap-4 md:gap-6">
        <div className="flex items-center gap-1.5">
          <div
            className="w-3 h-3 rounded-sm"
            style={{ backgroundColor: config.color }}
          />
          <span className="text-xs text-slate-400">Positive impact</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-red-500" />
          <span className="text-xs text-slate-400">Negative impact</span>
        </div>
      </div>
    </motion.div>
  )
}

export default HabitImpactChart
