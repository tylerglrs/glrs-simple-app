import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Timestamp } from 'firebase/firestore'
import { Moon, Smile, Wind, Flame, Zap, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useWeeklySummaries } from '@/hooks'
import type { AIInsightsDataState } from '../useAIInsightsData'
import {
  MetricSelector,
  InteractiveChart,
  CalendarHeatmap,
  CorrelationCards,
  AIPatternAnalysis,
} from '../components'
import type { MetricType, ChartDataPoint, HeatmapDataPoint, Correlation } from '../components'

// =============================================================================
// TYPES
// =============================================================================

export interface PatternsTabProps {
  data: AIInsightsDataState
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

const itemVariants = {
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

function getMetricValue(
  checkIn: AIInsightsDataState['checkIns'][0],
  metric: MetricType
): number | null {
  // Handle both flat fields and nested morningData/eveningData
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const c = checkIn as any
  switch (metric) {
    case 'mood':
      return c.mood ?? c.morningData?.mood ?? null
    case 'anxiety':
      return c.anxiety ?? c.morningData?.anxiety ?? null
    case 'craving':
      return c.craving ?? c.morningData?.craving ?? null
    case 'sleep':
      return c.sleep ?? c.morningData?.sleep ?? null
    case 'energy':
      return c.energy ?? c.morningData?.energy ?? null
    default:
      return null
  }
}

function formatDateLabel(date: Date): string {
  const month = date.toLocaleDateString('en-US', { month: 'short' })
  const day = date.getDate()
  return `${month} ${day}`
}

// Calculate Pearson correlation coefficient between two arrays
function calculateCorrelation(arr1: number[] | undefined | null, arr2: number[] | undefined | null): number {
  if (!arr1 || !arr2 || arr1.length < 3 || arr2.length < 3 || arr1.length !== arr2.length) {
    return 0
  }

  const n = arr1.length
  const sum1 = arr1.reduce((a, b) => a + b, 0)
  const sum2 = arr2.reduce((a, b) => a + b, 0)
  const mean1 = sum1 / n
  const mean2 = sum2 / n

  let numerator = 0
  let sum1Sq = 0
  let sum2Sq = 0

  for (let i = 0; i < n; i++) {
    const diff1 = arr1[i] - mean1
    const diff2 = arr2[i] - mean2
    numerator += diff1 * diff2
    sum1Sq += diff1 * diff1
    sum2Sq += diff2 * diff2
  }

  const denominator = Math.sqrt(sum1Sq * sum2Sq)
  if (denominator === 0) return 0

  return numerator / denominator
}

// Get icon for metric
function getMetricIcon(metric: string) {
  switch (metric) {
    case 'Sleep':
      return <Moon className="h-4 w-4 text-indigo-400" />
    case 'Mood':
      return <Smile className="h-4 w-4 text-amber-400" />
    case 'Anxiety':
      return <Wind className="h-4 w-4 text-cyan-400" />
    case 'Cravings':
      return <Flame className="h-4 w-4 text-rose-400" />
    case 'Energy':
      return <Zap className="h-4 w-4 text-emerald-400" />
    default:
      return <Smile className="h-4 w-4 text-white" />
  }
}

// Generate description based on correlation
function getCorrelationDescription(
  metric1: string | undefined | null,
  metric2: string | undefined | null,
  correlation: number,
  isPositive: boolean
): string {
  // Safety check: ensure metrics exist
  const m1 = metric1 || 'metric'
  const m2 = metric2 || 'metric'

  const strength = Math.abs(correlation)
  const strengthWord = strength > 0.7 ? 'strongly' : strength > 0.5 ? 'moderately' : 'slightly'

  if (isPositive) {
    if (m1 === 'Sleep' && m2 === 'Mood') {
      return `Better sleep quality is ${strengthWord} associated with improved mood in your data`
    }
    if (m1 === 'Anxiety' && m2 === 'Cravings') {
      return `Higher anxiety levels ${strengthWord} coincide with increased cravings for you`
    }
    if (m1 === 'Energy' && m2 === 'Mood') {
      return `Your energy and mood levels tend to rise and fall together`
    }
    return `Higher ${m1.toLowerCase()} is ${strengthWord} linked to higher ${m2.toLowerCase()}`
  } else {
    if (m1 === 'Sleep' && m2 === 'Anxiety') {
      return `Poor sleep is ${strengthWord} linked to higher anxiety levels in your patterns`
    }
    return `Higher ${m1.toLowerCase()} tends to come with lower ${m2.toLowerCase()}`
  }
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function PatternsTab({ data }: PatternsTabProps) {
  const [selectedMetric, setSelectedMetric] = useState<MetricType>('mood')

  // Fetch pre-computed weekly summaries (last 4 weeks)
  const { summaries: weeklySummaries, currentWeek } = useWeeklySummaries(4)

  // Extract values for all metrics from check-ins
  const metricArrays = useMemo(() => {
    const mood: number[] = []
    const anxiety: number[] = []
    const craving: number[] = []
    const sleep: number[] = []
    const energy: number[] = []

    const checkIns = data.checkIns ?? []
    checkIns.forEach((checkIn) => {
      const m = getMetricValue(checkIn, 'mood')
      const a = getMetricValue(checkIn, 'anxiety')
      const c = getMetricValue(checkIn, 'craving')
      const s = getMetricValue(checkIn, 'sleep')
      const e = getMetricValue(checkIn, 'energy')

      if (m !== null) mood.push(m)
      if (a !== null) anxiety.push(a)
      if (c !== null) craving.push(c)
      if (s !== null) sleep.push(s)
      if (e !== null) energy.push(e)
    })

    return { mood, anxiety, craving, sleep, energy }
  }, [data.checkIns])

  // Calculate real correlations from user data
  const calculatedCorrelations = useMemo((): Correlation[] => {
    const correlations: Correlation[] = []

    // Sleep → Mood correlation
    if (metricArrays.sleep.length >= 5 && metricArrays.mood.length >= 5) {
      const minLen = Math.min(metricArrays.sleep.length, metricArrays.mood.length)
      const corr = calculateCorrelation(
        metricArrays.sleep.slice(0, minLen),
        metricArrays.mood.slice(0, minLen)
      )
      if (Math.abs(corr) > 0.2) {
        correlations.push({
          id: 'sleep-mood',
          metric1: 'Sleep',
          metric2: 'Mood',
          type: corr > 0 ? 'positive' : 'negative',
          strength: Math.abs(corr),
          description: getCorrelationDescription('Sleep', 'Mood', corr, corr > 0),
          icon1: getMetricIcon('Sleep'),
          icon2: getMetricIcon('Mood'),
        })
      }
    }

    // Anxiety → Cravings correlation
    if (metricArrays.anxiety.length >= 5 && metricArrays.craving.length >= 5) {
      const minLen = Math.min(metricArrays.anxiety.length, metricArrays.craving.length)
      const corr = calculateCorrelation(
        metricArrays.anxiety.slice(0, minLen),
        metricArrays.craving.slice(0, minLen)
      )
      if (Math.abs(corr) > 0.2) {
        correlations.push({
          id: 'anxiety-craving',
          metric1: 'Anxiety',
          metric2: 'Cravings',
          type: corr > 0 ? 'positive' : 'negative',
          strength: Math.abs(corr),
          description: getCorrelationDescription('Anxiety', 'Cravings', corr, corr > 0),
          icon1: getMetricIcon('Anxiety'),
          icon2: getMetricIcon('Cravings'),
        })
      }
    }

    // Energy → Mood correlation
    if (metricArrays.energy.length >= 5 && metricArrays.mood.length >= 5) {
      const minLen = Math.min(metricArrays.energy.length, metricArrays.mood.length)
      const corr = calculateCorrelation(
        metricArrays.energy.slice(0, minLen),
        metricArrays.mood.slice(0, minLen)
      )
      if (Math.abs(corr) > 0.2) {
        correlations.push({
          id: 'energy-mood',
          metric1: 'Energy',
          metric2: 'Mood',
          type: corr > 0 ? 'positive' : 'negative',
          strength: Math.abs(corr),
          description: getCorrelationDescription('Energy', 'Mood', corr, corr > 0),
          icon1: getMetricIcon('Energy'),
          icon2: getMetricIcon('Mood'),
        })
      }
    }

    // Sleep → Anxiety correlation
    if (metricArrays.sleep.length >= 5 && metricArrays.anxiety.length >= 5) {
      const minLen = Math.min(metricArrays.sleep.length, metricArrays.anxiety.length)
      const corr = calculateCorrelation(
        metricArrays.sleep.slice(0, minLen),
        metricArrays.anxiety.slice(0, minLen)
      )
      if (Math.abs(corr) > 0.2) {
        correlations.push({
          id: 'sleep-anxiety',
          metric1: 'Sleep',
          metric2: 'Anxiety',
          type: corr > 0 ? 'positive' : 'negative',
          strength: Math.abs(corr),
          description: getCorrelationDescription('Sleep', 'Anxiety', corr, corr > 0),
          icon1: getMetricIcon('Sleep'),
          icon2: getMetricIcon('Anxiety'),
        })
      }
    }

    // Sort by strength
    correlations.sort((a, b) => b.strength - a.strength)

    return correlations
  }, [metricArrays])

  // Transform check-in data to chart data points (aggregated by day)
  const chartData = useMemo((): ChartDataPoint[] => {
    // Group check-ins by LOCAL date and calculate daily average
    const dailyData = new Map<string, { total: number; count: number; date: Date }>()

    const checkIns = data.checkIns ?? []
    checkIns.forEach((checkIn) => {
      const date =
        checkIn.createdAt instanceof Timestamp
          ? checkIn.createdAt.toDate()
          : new Date(checkIn.createdAt)
      // Use LOCAL date string (YYYY-MM-DD) to avoid timezone issues
      // toISOString() uses UTC which can put late-night check-ins on the wrong day
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      const dateStr = `${year}-${month}-${day}`
      const value = getMetricValue(checkIn, selectedMetric)

      if (value !== null && value > 0) {
        const existing = dailyData.get(dateStr)
        if (existing) {
          existing.total += value
          existing.count += 1
        } else {
          dailyData.set(dateStr, { total: value, count: 1, date })
        }
      }
    })

    // Convert to array and sort by date
    return Array.from(dailyData.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([dateStr, { total, count, date }]) => ({
        date: dateStr,
        value: Math.round((total / count) * 10) / 10, // Average, rounded to 1 decimal
        label: formatDateLabel(date),
      }))
  }, [data.checkIns, selectedMetric])

  // Transform check-in data to heatmap data points (last 90 days)
  const heatmapData = useMemo((): HeatmapDataPoint[] => {
    const dataMap = new Map<string, number>()

    // Helper to get LOCAL date string (YYYY-MM-DD)
    const getLocalDateStr = (date: Date) => {
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    }

    const checkIns = data.checkIns ?? []
    checkIns.forEach((checkIn) => {
      const date =
        checkIn.createdAt instanceof Timestamp
          ? checkIn.createdAt.toDate()
          : new Date(checkIn.createdAt)
      const dateStr = getLocalDateStr(date)
      const value = getMetricValue(checkIn, selectedMetric)

      if (value !== null) {
        dataMap.set(dateStr, value)
      }
    })

    const result: HeatmapDataPoint[] = []
    const today = new Date()

    for (let i = 89; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const dateStr = getLocalDateStr(date)

      result.push({
        date: dateStr,
        value: dataMap.get(dateStr) ?? null,
      })
    }

    return result
  }, [data.checkIns, selectedMetric])

  // Get the current metric's pattern for stats display
  // Prefer pre-computed data from weekly summaries when available
  const currentPattern = useMemo(() => {
    // Try to get pre-computed average from current week
    const weeklyAvg = currentWeek?.checkIns
    const preComputedAvg = weeklyAvg
      ? {
          mood: weeklyAvg.avgMood,
          anxiety: weeklyAvg.avgAnxiety,
          craving: weeklyAvg.avgCraving,
          sleep: weeklyAvg.avgSleep,
          energy: weeklyAvg.avgEnergy,
        }[selectedMetric]
      : null

    const basePattern = (() => {
      switch (selectedMetric) {
        case 'mood':
          return data.moodPattern
        case 'anxiety':
          return data.anxietyPattern
        case 'craving':
          return data.cravingPattern
        case 'sleep':
          return data.sleepPattern
        case 'energy':
          return data.energyPattern
        default:
          return data.moodPattern
      }
    })()

    // Use pre-computed average if available, otherwise use real-time calculation
    if (preComputedAvg !== null && preComputedAvg !== undefined) {
      return {
        ...basePattern,
        average: preComputedAvg,
        trend: currentWeek?.checkIns?.moodTrend || basePattern.trend,
      }
    }

    return basePattern
  }, [
    selectedMetric,
    data.moodPattern,
    data.anxietyPattern,
    data.cravingPattern,
    data.sleepPattern,
    data.energyPattern,
    currentWeek,
  ])

  // Calculate 4-week trend from weekly summaries
  const weeklyTrend = useMemo(() => {
    if (!weeklySummaries || weeklySummaries.length < 2) return null

    const metricKey = {
      mood: 'avgMood',
      anxiety: 'avgAnxiety',
      craving: 'avgCraving',
      sleep: 'avgSleep',
      energy: 'avgEnergy',
    }[selectedMetric] as keyof typeof weeklySummaries[0]['checkIns']

    const values = weeklySummaries
      .map((w) => w.checkIns?.[metricKey] as number)
      .filter((v) => v !== undefined && v !== null)
      .reverse() // oldest to newest

    if (values.length < 2) return null

    const first = values[0]
    const last = values[values.length - 1]
    const change = last - first
    const percentChange = first !== 0 ? ((last - first) / first) * 100 : 0

    return {
      direction: change > 0.2 ? 'up' : change < -0.2 ? 'down' : 'stable',
      change: Math.abs(change).toFixed(1),
      percentChange: Math.abs(percentChange).toFixed(0),
      weeks: values.length,
    }
  }, [weeklySummaries, selectedMetric])

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="p-2 space-y-2"
    >
      {/* Metric Selector - Compact */}
      <motion.div variants={itemVariants}>
        <MetricSelector
          selectedMetric={selectedMetric}
          onSelect={setSelectedMetric}
        />
      </motion.div>

      {/* Pattern Summary - More compact */}
      <motion.div variants={itemVariants}>
        <div
          className={cn(
            'grid grid-cols-3 gap-1 p-2 rounded-lg',
            'bg-slate-800/60 border border-slate-700/50'
          )}
        >
          <div className="text-center">
            <span className="text-[10px] text-slate-500 block">Week Avg</span>
            <span className="text-base font-bold text-white">
              {currentPattern.average.toFixed(1)}
            </span>
          </div>
          <div className="text-center border-x border-slate-700/50">
            <span className="text-[10px] text-slate-500 block">Trend</span>
            <span
              className={cn(
                'text-xs font-medium capitalize',
                currentPattern.trend === 'improving' && 'text-emerald-400',
                currentPattern.trend === 'declining' && 'text-rose-400',
                currentPattern.trend === 'stable' && 'text-slate-400'
              )}
            >
              {currentPattern.trend}
            </span>
          </div>
          <div className="text-center">
            <span className="text-[10px] text-slate-500 block">Best</span>
            <span className="text-xs font-medium text-white truncate">
              {currentPattern.bestDay?.slice(0, 3) || 'N/A'}
            </span>
          </div>
        </div>

        {/* 4-Week Trend from summaries */}
        {weeklyTrend && (
          <div className="mt-2 flex items-center justify-center gap-2 p-2 rounded-lg bg-slate-800/40">
            {weeklyTrend.direction === 'up' && (
              <TrendingUp className="h-4 w-4 text-emerald-400" />
            )}
            {weeklyTrend.direction === 'down' && (
              <TrendingDown className="h-4 w-4 text-rose-400" />
            )}
            {weeklyTrend.direction === 'stable' && (
              <Minus className="h-4 w-4 text-slate-400" />
            )}
            <span className="text-xs text-slate-400">
              {weeklyTrend.direction === 'stable'
                ? `Stable over ${weeklyTrend.weeks} weeks`
                : `${weeklyTrend.direction === 'up' ? '+' : '-'}${weeklyTrend.change} over ${weeklyTrend.weeks} weeks`}
            </span>
          </div>
        )}
      </motion.div>

      {/* Interactive Chart - Full width, responsive */}
      <motion.div variants={itemVariants} className="w-full">
        <InteractiveChart data={chartData} selectedMetric={selectedMetric} />
      </motion.div>

      {/* Calendar Heatmap - Full width, internal scroll for grid only */}
      <motion.div variants={itemVariants} className="w-full">
        <CalendarHeatmap
          data={heatmapData}
          selectedMetric={selectedMetric}
          days={90}
        />
      </motion.div>

      {/* Correlation Cards - Dynamic from real data */}
      <motion.div variants={itemVariants}>
        {calculatedCorrelations.length > 0 ? (
          <CorrelationCards correlations={calculatedCorrelations} />
        ) : (
          <div className="p-3 rounded-lg bg-slate-800/60 border border-slate-700/50 text-center">
            <span className="text-xs text-slate-400">
              Keep checking in to discover patterns
            </span>
            <p className="text-[10px] text-slate-500 mt-0.5">
              5+ check-ins needed
            </p>
          </div>
        )}
      </motion.div>

      {/* AI Pattern Analysis - Dynamic insights */}
      <motion.div variants={itemVariants}>
        <AIPatternAnalysis
          selectedMetric={selectedMetric}
          checkIns={data.checkIns}
          moodPattern={data.moodPattern}
          anxietyPattern={data.anxietyPattern}
          cravingPattern={data.cravingPattern}
          sleepPattern={data.sleepPattern}
          energyPattern={data.energyPattern}
          isLoading={data.loading}
        />
      </motion.div>
    </motion.div>
  )
}

// Placeholder wrapper that accepts data as props
export function PatternsTabPlaceholder({ data }: { data?: AIInsightsDataState }) {
  if (!data) {
    return (
      <div className="p-4 flex items-center justify-center h-64">
        <span className="text-slate-500 text-sm">Loading patterns...</span>
      </div>
    )
  }
  return <PatternsTab data={data} />
}

export default PatternsTabPlaceholder
