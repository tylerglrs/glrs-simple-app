import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import type { MetricType } from './MetricSelector'

// =============================================================================
// TYPES
// =============================================================================

export interface HeatmapDataPoint {
  date: string // ISO date string
  value: number | null
}

export interface CalendarHeatmapProps {
  data: HeatmapDataPoint[]
  selectedMetric: MetricType
  days?: number
  className?: string
}

// =============================================================================
// METRIC COLOR SCALES
// =============================================================================

// Each metric has 5 intensity levels (0-4)
const METRIC_COLOR_SCALES: Record<MetricType, string[]> = {
  mood: [
    'bg-slate-800', // No data
    'bg-amber-900/40', // Low (0-2)
    'bg-amber-700/50', // Medium-low (2-4)
    'bg-amber-500/60', // Medium-high (4-7)
    'bg-amber-400/80', // High (7-10)
  ],
  anxiety: [
    'bg-slate-800',
    'bg-cyan-400/80', // Low is GOOD for anxiety
    'bg-cyan-500/60',
    'bg-cyan-700/50',
    'bg-cyan-900/40', // High is BAD
  ],
  craving: [
    'bg-slate-800',
    'bg-rose-400/80', // Low is GOOD for cravings
    'bg-rose-500/60',
    'bg-rose-700/50',
    'bg-rose-900/40', // High is BAD
  ],
  sleep: [
    'bg-slate-800',
    'bg-indigo-900/40', // Low
    'bg-indigo-700/50',
    'bg-indigo-500/60',
    'bg-indigo-400/80', // High is GOOD
  ],
  energy: [
    'bg-slate-800',
    'bg-emerald-900/40', // Low
    'bg-emerald-700/50',
    'bg-emerald-500/60',
    'bg-emerald-400/80', // High is GOOD
  ],
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function getIntensityLevel(value: number | null): number {
  if (value === null || value === undefined) return 0
  if (value < 2.5) return 1
  if (value < 5) return 2
  if (value < 7.5) return 3
  return 4
}

function formatDate(date: Date): string {
  return date.toISOString().split('T')[0]
}

function getDayOfWeek(date: Date): number {
  return date.getDay() // 0 = Sunday, 6 = Saturday
}

// =============================================================================
// ANIMATION VARIANTS
// =============================================================================

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.005,
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
// DAY LABELS
// =============================================================================

const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function CalendarHeatmap({
  data: dataProp,
  selectedMetric,
  days = 90,
  className,
}: CalendarHeatmapProps) {
  // Default to empty array if undefined to prevent crashes
  const data = dataProp ?? []

  const colorScale = METRIC_COLOR_SCALES[selectedMetric]

  // Generate grid data for the last N days
  const gridData = useMemo(() => {
    const today = new Date()
    const dataMap = new Map<string, number | null>()

    // Create lookup map from data
    data.forEach((point) => {
      dataMap.set(point.date, point.value)
    })

    // Generate all days
    const allDays: { date: Date; value: number | null; dateStr: string }[] = []

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const dateStr = formatDate(date)
      allDays.push({
        date,
        dateStr,
        value: dataMap.get(dateStr) ?? null,
      })
    }

    return allDays
  }, [data, days])

  // Organize into weeks (columns) for GitHub-style grid
  const weeks = useMemo(() => {
    const result: Array<Array<typeof gridData[0] | null>> = []
    let currentWeek: Array<typeof gridData[0] | null> = []

    // Fill in empty days at the start of first week
    if (gridData.length > 0) {
      const firstDay = getDayOfWeek(gridData[0].date)
      for (let i = 0; i < firstDay; i++) {
        currentWeek.push(null)
      }
    }

    gridData.forEach((day) => {
      const dayOfWeek = getDayOfWeek(day.date)

      if (dayOfWeek === 0 && currentWeek.length > 0) {
        result.push(currentWeek)
        currentWeek = []
      }

      currentWeek.push(day)
    })

    // Push the last incomplete week
    if (currentWeek.length > 0) {
      result.push(currentWeek)
    }

    return result
  }, [gridData])

  // Calculate stats
  const stats = useMemo(() => {
    const values = gridData.filter((d) => d.value !== null).map((d) => d.value as number)
    if (values.length === 0) return { daysTracked: 0, avgValue: 0 }

    return {
      daysTracked: values.length,
      avgValue: values.reduce((a, b) => a + b, 0) / values.length,
    }
  }, [gridData])

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
      {/* Header - Compact */}
      <div className="flex items-center justify-between gap-2 p-2 border-b border-slate-700/50">
        <div className="min-w-0 flex-1">
          <span className="text-xs font-semibold text-white">Activity Heatmap</span>
          <p className="text-[10px] text-slate-500">Last {days} days</p>
        </div>
        <span className="text-[10px] text-slate-400 flex-shrink-0 whitespace-nowrap">
          {stats.daysTracked} tracked
        </span>
      </div>

      {/* Heatmap Grid - Fit to screen */}
      <div className="p-2 overflow-hidden">
        <div className="flex gap-px">
          {/* Day labels column */}
          <div className="flex flex-col gap-px mr-0.5">
            {DAY_LABELS.map((label, i) => (
              <div
                key={i}
                className="h-2 w-2 flex items-center justify-center text-[8px] text-slate-500"
              >
                {i % 2 === 1 ? label : ''}
              </div>
            ))}
          </div>

          {/* Weeks grid */}
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="flex flex-col gap-px">
              {Array.from({ length: 7 }).map((_, dayIndex) => {
                const day = week[dayIndex]

                if (!day) {
                  return (
                    <div
                      key={dayIndex}
                      className="h-2 w-2 rounded-sm bg-transparent"
                    />
                  )
                }

                const intensity = getIntensityLevel(day.value)
                const colorClass = colorScale[intensity]

                return (
                  <motion.div
                    key={day.dateStr}
                    variants={cellVariants}
                    className={cn(
                      'h-2 w-2 rounded-sm cursor-pointer',
                      'transition-all duration-200',
                      colorClass
                    )}
                    title={`${day.dateStr}: ${day.value !== null ? day.value.toFixed(1) : 'No data'}`}
                  />
                )
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Legend - Compact */}
      <div className="px-2 pb-1.5 flex items-center justify-between">
        <span className="text-[10px] text-slate-500">Less</span>
        <div className="flex gap-0.5">
          {colorScale.map((color, i) => (
            <div
              key={i}
              className={cn('h-2 w-2 rounded-sm', color)}
            />
          ))}
        </div>
        <span className="text-[10px] text-slate-500">More</span>
      </div>
    </motion.div>
  )
}

export default CalendarHeatmap
