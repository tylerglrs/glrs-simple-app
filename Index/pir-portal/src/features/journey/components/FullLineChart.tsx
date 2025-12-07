import { useMemo } from 'react'
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from 'recharts'
import { cn } from '@/lib/utils'
import type { ChartDataPoint } from '../types'

// =============================================================================
// TYPES
// =============================================================================

export interface FullLineChartProps {
  data: ChartDataPoint[]
  color: string
  bgColor?: string
  showMissedDays?: boolean
  yAxisDomain?: [number, number]
  referenceValue?: number
  height?: number
  className?: string
}

// =============================================================================
// CUSTOM TOOLTIP
// =============================================================================

interface CustomTooltipProps {
  active?: boolean
  payload?: Array<{
    value: number | null
    payload: {
      date: string
      label: string
      value: number | null
    }
  }>
  color: string
}

function CustomTooltip({ active, payload, color }: CustomTooltipProps) {
  if (!active || !payload || !payload.length) return null

  const data = payload[0]
  if (!data || data.value === null || data.value === undefined) return null

  return (
    <div className="rounded-lg border bg-white p-2 shadow-md">
      <p className="text-xs text-muted-foreground">{data.payload.label}</p>
      <p className="text-lg font-bold" style={{ color }}>
        {data.value}
      </p>
    </div>
  )
}

// =============================================================================
// COMPONENT
// =============================================================================

export function FullLineChart({
  data,
  color,
  // bgColor is available for future gradient backgrounds
  bgColor: _bgColor,
  showMissedDays = true,
  yAxisDomain = [0, 10],
  referenceValue,
  height = 180,
  className,
}: FullLineChartProps) {
  void _bgColor // Suppress unused warning

  // Prepare data for recharts
  const chartData = useMemo(() => {
    return data.map((point, index) => ({
      index,
      date: point.date,
      label: point.label || point.date,
      value: point.value,
      // Use undefined for null values to create gaps in the line
      displayValue: point.value !== null ? point.value : undefined,
    }))
  }, [data])

  // Check if we have any data
  const hasData = data.some((d) => d.value !== null)

  if (!hasData) {
    return (
      <div
        className={cn(
          'flex items-center justify-center rounded-lg bg-muted/30',
          className
        )}
        style={{ height }}
      >
        <span className="text-sm text-muted-foreground">No check-in data available</span>
      </div>
    )
  }

  // Calculate average for reference line
  const values = data.filter((d) => d.value !== null).map((d) => d.value!)
  const average = values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0

  return (
    <div className={cn('w-full', className)} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{ top: 5, right: 5, left: -20, bottom: 5 }}
        >
          <defs>
            <linearGradient id={`chartGradient-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.2} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>

          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke="#e5e7eb"
          />

          <XAxis
            dataKey="label"
            tick={{ fontSize: 10, fill: '#9ca3af' }}
            tickLine={false}
            axisLine={{ stroke: '#e5e7eb' }}
            interval="preserveStartEnd"
            minTickGap={30}
          />

          <YAxis
            domain={yAxisDomain}
            tick={{ fontSize: 10, fill: '#9ca3af' }}
            tickLine={false}
            axisLine={false}
            width={30}
          />

          <Tooltip
            content={<CustomTooltip color={color} />}
            cursor={{ stroke: color, strokeWidth: 1, strokeDasharray: '3 3' }}
          />

          {/* Average reference line */}
          <ReferenceLine
            y={referenceValue ?? average}
            stroke={color}
            strokeDasharray="5 5"
            strokeOpacity={0.5}
            label={{
              value: `Avg: ${(referenceValue ?? average).toFixed(1)}`,
              fill: color,
              fontSize: 10,
              position: 'right',
            }}
          />

          <Line
            type="monotone"
            dataKey="displayValue"
            stroke={color}
            strokeWidth={2}
            dot={{
              r: 3,
              fill: color,
              stroke: 'white',
              strokeWidth: 1,
            }}
            activeDot={{
              r: 5,
              fill: color,
              stroke: 'white',
              strokeWidth: 2,
            }}
            connectNulls={!showMissedDays}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export default FullLineChart
