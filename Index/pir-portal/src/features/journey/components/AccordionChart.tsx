import {
  ChevronDown,
  ChevronUp,
  TrendingUp,
  TrendingDown,
  Minus,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import ChartSparkline from './ChartSparkline'
import type { ChartDataPoint, TrendInfo, ChartType } from '../types'

// =============================================================================
// TYPES
// =============================================================================

export interface AccordionChartProps {
  id: ChartType
  title: string
  icon: LucideIcon
  color: string
  bgColor: string
  sparklineData: ChartDataPoint[]
  fullData: ChartDataPoint[]
  average: number
  trend: TrendInfo
  latestValue: number | null
  missedDays: number
  isExpanded: boolean
  onToggle: () => void
  showMissedDays?: boolean
  renderFullChart: (data: ChartDataPoint[]) => React.ReactNode
  className?: string
}

// =============================================================================
// HELPERS
// =============================================================================

const getTrendIcon = (direction: TrendInfo['direction']): LucideIcon => {
  switch (direction) {
    case 'up':
      return TrendingUp
    case 'down':
      return TrendingDown
    default:
      return Minus
  }
}

const getTrendColor = (chartType: ChartType, direction: TrendInfo['direction']): string => {
  // For craving and anxiety, down is good (green), up is bad (red)
  const invertedTypes: ChartType[] = ['craving', 'anxiety']
  const isInverted = invertedTypes.includes(chartType)

  if (direction === 'stable') return 'text-muted-foreground'

  if (isInverted) {
    return direction === 'down' ? 'text-green-500' : 'text-red-500'
  }

  return direction === 'up' ? 'text-green-500' : 'text-red-500'
}

// =============================================================================
// COMPONENT
// =============================================================================

export function AccordionChart({
  id,
  title,
  icon: Icon,
  color,
  bgColor,
  sparklineData,
  fullData,
  average,
  trend,
  latestValue,
  missedDays,
  isExpanded,
  onToggle,
  showMissedDays = true,
  renderFullChart,
  className,
}: AccordionChartProps) {
  const TrendIcon = getTrendIcon(trend.direction)
  const trendColor = getTrendColor(id, trend.direction)

  return (
    <div
      className={cn(
        'rounded-xl border-2 bg-white shadow-sm transition-all duration-300',
        isExpanded ? 'border-primary/50' : 'border-border',
        className
      )}
    >
      {/* Collapsed Header - Always visible */}
      <button
        onClick={onToggle}
        className={cn(
          'flex w-full items-center justify-between p-4',
          'transition-colors hover:bg-muted/30'
        )}
        aria-expanded={isExpanded}
        aria-controls={`chart-content-${id}`}
      >
        <div className="flex items-center gap-3">
          {/* Icon */}
          <div
            className="flex h-10 w-10 items-center justify-center rounded-full"
            style={{ backgroundColor: bgColor }}
          >
            <Icon className="h-5 w-5" style={{ color }} />
          </div>

          {/* Title and Stats */}
          <div className="text-left">
            <h4 className="font-semibold text-foreground">{title}</h4>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>Avg: {average.toFixed(1)}</span>
              <span className="text-muted-foreground/50">|</span>
              <div className={cn('flex items-center gap-1', trendColor)}>
                <TrendIcon className="h-3 w-3" />
                <span>
                  {trend.percentage > 0 ? `${trend.percentage.toFixed(0)}%` : 'Stable'}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Current Value */}
          <div
            className="text-2xl font-bold"
            style={{ color }}
          >
            {latestValue !== null ? latestValue : '-'}
          </div>

          {/* Expand/Collapse Icon */}
          <div className="text-muted-foreground">
            {isExpanded ? (
              <ChevronUp className="h-5 w-5" />
            ) : (
              <ChevronDown className="h-5 w-5" />
            )}
          </div>
        </div>
      </button>

      {/* Sparkline - Only visible when collapsed */}
      {!isExpanded && (
        <div className="px-4 pb-4">
          <ChartSparkline
            data={sparklineData}
            color={color}
            bgColor={bgColor}
            height={40}
            showMissedDays={showMissedDays}
          />
          <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
            <span>Last 7 days</span>
            {missedDays > 0 && showMissedDays && (
              <span className="text-amber-500">{missedDays} missed</span>
            )}
          </div>
        </div>
      )}

      {/* Expanded Content - Full Chart */}
      {isExpanded && (
        <div
          id={`chart-content-${id}`}
          className="border-t px-4 pb-4 pt-4"
        >
          {/* Date Range Selector (placeholder for future) */}
          <div className="mb-4 flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">
              Last 31 Days
            </span>
            <div className="flex items-center gap-2">
              {missedDays > 0 && showMissedDays && (
                <span className="text-xs text-amber-500">
                  {missedDays} days without data
                </span>
              )}
            </div>
          </div>

          {/* Full Chart */}
          <div className="h-48">
            {renderFullChart(fullData)}
          </div>

          {/* Stats Summary */}
          <div className="mt-4 grid grid-cols-3 gap-3">
            <div className="rounded-lg bg-muted/30 p-2 text-center">
              <p className="text-xs text-muted-foreground">Average</p>
              <p className="text-lg font-bold" style={{ color }}>
                {average.toFixed(1)}
              </p>
            </div>
            <div className="rounded-lg bg-muted/30 p-2 text-center">
              <p className="text-xs text-muted-foreground">Latest</p>
              <p className="text-lg font-bold" style={{ color }}>
                {latestValue !== null ? latestValue : '-'}
              </p>
            </div>
            <div className="rounded-lg bg-muted/30 p-2 text-center">
              <p className="text-xs text-muted-foreground">Trend</p>
              <p className={cn('flex items-center justify-center gap-1 text-lg font-bold', trendColor)}>
                <TrendIcon className="h-4 w-4" />
                {trend.percentage > 0 ? `${trend.percentage.toFixed(0)}%` : '-'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AccordionChart
