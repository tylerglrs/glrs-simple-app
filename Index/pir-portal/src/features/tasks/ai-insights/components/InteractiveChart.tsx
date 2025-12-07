import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  ComposedChart,
} from 'recharts'
import { cn } from '@/lib/utils'
import { haptics } from '@/lib/animations'
import type { MetricType } from './MetricSelector'

// =============================================================================
// TYPES
// =============================================================================

export type TimePeriod = '7d' | '14d' | '30d'

export interface ChartDataPoint {
  date: string
  value: number
  label: string
}

export interface InteractiveChartProps {
  data: ChartDataPoint[]
  selectedMetric: MetricType
  className?: string
}

// =============================================================================
// PERIOD OPTIONS
// =============================================================================

const PERIOD_OPTIONS: { id: TimePeriod; label: string; days: number }[] = [
  { id: '7d', label: '7D', days: 7 },
  { id: '14d', label: '14D', days: 14 },
  { id: '30d', label: '30D', days: 30 },
]

// =============================================================================
// METRIC COLORS
// =============================================================================

const METRIC_COLORS: Record<MetricType, { stroke: string; fill: string; gradient: string }> = {
  mood: {
    stroke: '#fbbf24', // amber-400
    fill: 'url(#moodGradient)',
    gradient: '#fbbf24',
  },
  anxiety: {
    stroke: '#22d3ee', // cyan-400
    fill: 'url(#anxietyGradient)',
    gradient: '#22d3ee',
  },
  craving: {
    stroke: '#fb7185', // rose-400
    fill: 'url(#cravingGradient)',
    gradient: '#fb7185',
  },
  sleep: {
    stroke: '#818cf8', // indigo-400
    fill: 'url(#sleepGradient)',
    gradient: '#818cf8',
  },
  energy: {
    stroke: '#34d399', // emerald-400
    fill: 'url(#energyGradient)',
    gradient: '#34d399',
  },
}

// =============================================================================
// CUSTOM TOOLTIP
// =============================================================================

interface CustomTooltipProps {
  active?: boolean
  payload?: Array<{ value: number; payload: ChartDataPoint }>
  selectedMetric: MetricType
}

function CustomTooltip({ active, payload, selectedMetric }: CustomTooltipProps) {
  if (!active || !payload || !payload.length) return null

  const data = payload[0]
  const colors = METRIC_COLORS[selectedMetric]

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        'px-3 py-2 rounded-lg',
        'bg-slate-800/90 border border-slate-700/50',
        'backdrop-blur-sm shadow-lg'
      )}
    >
      <p className="text-xs text-slate-400 mb-1">{data.payload.label}</p>
      <p className="text-lg font-bold" style={{ color: colors.stroke }}>
        {data.value.toFixed(1)}
        <span className="text-xs text-slate-500 ml-1">/10</span>
      </p>
    </motion.div>
  )
}

// =============================================================================
// CUSTOM DOT
// =============================================================================

interface CustomDotProps {
  cx?: number
  cy?: number
  selectedMetric: MetricType
}

function CustomActiveDot({ cx, cy, selectedMetric }: CustomDotProps) {
  if (cx === undefined || cy === undefined) return null
  const colors = METRIC_COLORS[selectedMetric]

  return (
    <g>
      {/* Outer glow */}
      <circle cx={cx} cy={cy} r={12} fill={colors.stroke} opacity={0.2} />
      {/* Inner dot */}
      <circle cx={cx} cy={cy} r={6} fill={colors.stroke} stroke="#1e293b" strokeWidth={2} />
    </g>
  )
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
// MAIN COMPONENT
// =============================================================================

export function InteractiveChart({
  data: dataProp,
  selectedMetric,
  className,
}: InteractiveChartProps) {
  // Default to empty array if undefined to prevent crashes
  const data = dataProp ?? []

  const [period, setPeriod] = useState<TimePeriod>('7d')

  // Filter data based on selected period
  const filteredData = useMemo(() => {
    const days = PERIOD_OPTIONS.find((p) => p.id === period)?.days || 7
    return data.slice(-days)
  }, [data, period])

  const colors = METRIC_COLORS[selectedMetric]

  // Calculate stats for display
  const stats = useMemo(() => {
    if (filteredData.length === 0) return { avg: 0, min: 0, max: 0, trend: 0 }

    const values = filteredData.map((d) => d.value)
    const avg = values.reduce((a, b) => a + b, 0) / values.length
    const min = Math.min(...values)
    const max = Math.max(...values)

    // Calculate trend (compare last half to first half)
    const midpoint = Math.floor(values.length / 2)
    const firstHalf = values.slice(0, midpoint)
    const secondHalf = values.slice(midpoint)
    const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length || 0
    const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length || 0
    const trend = secondAvg - firstAvg

    return { avg, min, max, trend }
  }, [filteredData])

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={cn(
        'rounded-xl',
        'bg-slate-800/60 border border-slate-700/50',
        'backdrop-blur-sm',
        className
      )}
    >
      {/* Header with period toggle - Responsive, wrap on mobile */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-2 border-b border-slate-700/50">
        <div className="min-w-0">
          <span className="text-xs font-semibold text-white capitalize">
            {selectedMetric} Trend
          </span>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[10px] text-slate-400 whitespace-nowrap">
              Avg: <span className="text-white font-medium">{stats.avg.toFixed(1)}</span>
            </span>
            <span className="text-[10px] text-slate-400 whitespace-nowrap">
              Range: <span className="text-white font-medium">{stats.min.toFixed(1)}-{stats.max.toFixed(1)}</span>
            </span>
          </div>
        </div>

        {/* Period Toggle - Always visible, no shrink */}
        <div className="flex gap-0.5 p-0.5 rounded-md bg-slate-900/50 flex-shrink-0">
          {PERIOD_OPTIONS.map((option) => (
            <button
              key={option.id}
              onClick={() => {
                haptics.tap()
                setPeriod(option.id)
              }}
              className={cn(
                'px-2 py-0.5 rounded text-[10px] font-medium transition-all duration-200',
                period === option.id
                  ? 'bg-slate-700 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chart - Fit to screen width */}
      <div className="p-2 pt-2">
        <div className="h-32 md:h-40">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={filteredData}
              margin={{ top: 5, right: 10, left: -25, bottom: 5 }}
            >
              {/* Gradient definitions */}
              <defs>
                <linearGradient id="moodGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#fbbf24" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#fbbf24" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="anxietyGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#22d3ee" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="cravingGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#fb7185" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#fb7185" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="sleepGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#818cf8" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#818cf8" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="energyGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#34d399" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#34d399" stopOpacity={0} />
                </linearGradient>
              </defs>

              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#334155"
                vertical={false}
              />

              <XAxis
                dataKey="label"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#64748b', fontSize: 9 }}
                dy={8}
                interval="preserveStartEnd"
              />

              <YAxis
                domain={[0, 10]}
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#64748b', fontSize: 10 }}
                ticks={[0, 5, 10]}
              />

              <Tooltip
                content={<CustomTooltip selectedMetric={selectedMetric} />}
                cursor={{ stroke: '#475569', strokeDasharray: '4 4' }}
              />

              {/* Area fill under line */}
              <Area
                type="monotone"
                dataKey="value"
                fill={colors.fill}
                stroke="none"
              />

              {/* Main line */}
              <Line
                type="monotone"
                dataKey="value"
                stroke={colors.stroke}
                strokeWidth={2.5}
                dot={false}
                activeDot={<CustomActiveDot selectedMetric={selectedMetric} />}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Trend indicator - Compact */}
      <div className="px-2 pb-2">
        <div
          className={cn(
            'flex items-center justify-center gap-1 py-1 rounded text-[10px] font-medium',
            stats.trend > 0.5
              ? 'bg-emerald-500/10 text-emerald-400'
              : stats.trend < -0.5
              ? 'bg-rose-500/10 text-rose-400'
              : 'bg-slate-700/50 text-slate-400'
          )}
        >
          {stats.trend > 0.5 ? (
            <>↑ +{stats.trend.toFixed(1)} pts</>
          ) : stats.trend < -0.5 ? (
            <>↓ {stats.trend.toFixed(1)} pts</>
          ) : (
            <>→ Stable</>
          )}
        </div>
      </div>
    </motion.div>
  )
}

export default InteractiveChart
