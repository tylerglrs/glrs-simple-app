import { useMemo } from 'react'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  YAxis,
} from 'recharts'
import { cn } from '@/lib/utils'
import type { ChartDataPoint } from '../types'

// =============================================================================
// TYPES
// =============================================================================

export interface ChartSparklineProps {
  data: ChartDataPoint[]
  color: string
  bgColor?: string
  height?: number
  showMissedDays?: boolean
  className?: string
}

// =============================================================================
// COMPONENT
// =============================================================================

export function ChartSparkline({
  data,
  color,
  // bgColor is available for future gradient backgrounds
  bgColor: _bgColor,
  height = 32,
  showMissedDays = true,
  className,
}: ChartSparklineProps) {
  void _bgColor // Suppress unused warning
  // Prepare data for recharts
  const chartData = useMemo(() => {
    return data.map((point, index) => ({
      index,
      date: point.date,
      value: point.value ?? undefined,
      // Use a small value for null points to show gaps
      displayValue: point.value !== null ? point.value : undefined,
    }))
  }, [data])

  // Check if we have any data
  const hasData = data.some((d) => d.value !== null)

  if (!hasData) {
    return (
      <div
        className={cn(
          'flex items-center justify-center rounded bg-muted/30',
          className
        )}
        style={{ height }}
      >
        <span className="text-xs text-muted-foreground">No data</span>
      </div>
    )
  }

  return (
    <div className={cn('w-full', className)} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={chartData}
          margin={{ top: 2, right: 2, left: 2, bottom: 2 }}
        >
          <defs>
            <linearGradient id={`gradient-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.3} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <YAxis domain={[0, 10]} hide />
          <Area
            type="monotone"
            dataKey="displayValue"
            stroke={color}
            strokeWidth={2}
            fill={`url(#gradient-${color.replace('#', '')})`}
            connectNulls={!showMissedDays}
            dot={false}
            activeDot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

export default ChartSparkline
