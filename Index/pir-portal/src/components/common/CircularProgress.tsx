import { RadialBarChart, RadialBar, ResponsiveContainer } from 'recharts'
import { cn } from '@/lib/utils'

interface CircularProgressProps {
  value: number
  max?: number
  size?: number
  strokeWidth?: number
  color?: string
  bgColor?: string
  children?: React.ReactNode
  className?: string
}

export function CircularProgress({
  value,
  max = 100,
  size = 120,
  strokeWidth = 12,
  color = '#069494',
  bgColor = '#e2e8f0',
  children,
  className,
}: CircularProgressProps) {
  const percentage = Math.min((value / max) * 100, 100)
  const data = [{ value: percentage, fill: color }]

  return (
    <div className={cn('relative', className)} style={{ width: size, height: size }}>
      <ResponsiveContainer width="100%" height="100%">
        <RadialBarChart
          innerRadius={`${100 - (strokeWidth / size) * 100 * 2}%`}
          outerRadius="100%"
          data={data}
          startAngle={90}
          endAngle={-270}
        >
          <RadialBar
            background={{ fill: bgColor }}
            dataKey="value"
            cornerRadius={strokeWidth / 2}
          />
        </RadialBarChart>
      </ResponsiveContainer>
      {children && (
        <div className="absolute inset-0 flex items-center justify-center">
          {children}
        </div>
      )}
    </div>
  )
}

// Preset circular progress variants
export function SobrietyProgress({
  currentDays,
  targetDays,
  size = 140,
  className,
}: {
  currentDays: number
  targetDays: number
  size?: number
  className?: string
}) {
  return (
    <CircularProgress
      value={currentDays}
      max={targetDays}
      size={size}
      strokeWidth={14}
      color="#069494"
      className={className}
    >
      <div className="text-center">
        <span className="text-3xl font-bold text-teal-600">{currentDays}</span>
        <span className="text-sm text-muted-foreground block">
          of {targetDays} days
        </span>
      </div>
    </CircularProgress>
  )
}

export function MetricProgress({
  value,
  label,
  color,
  size = 80,
  className,
}: {
  value: number
  label: string
  color?: string
  size?: number
  className?: string
}) {
  return (
    <CircularProgress
      value={value}
      max={10}
      size={size}
      strokeWidth={8}
      color={color}
      className={className}
    >
      <div className="text-center">
        <span className="text-lg font-bold">{value}</span>
        <span className="text-xs text-muted-foreground block">{label}</span>
      </div>
    </CircularProgress>
  )
}

export function CompletionProgress({
  completed,
  total,
  size = 100,
  className,
}: {
  completed: number
  total: number
  size?: number
  className?: string
}) {
  return (
    <CircularProgress
      value={completed}
      max={total}
      size={size}
      strokeWidth={10}
      color="#22c55e"
      className={className}
    >
      <div className="text-center">
        <span className="text-xl font-bold">{completed}</span>
        <span className="text-xs text-muted-foreground block">of {total}</span>
      </div>
    </CircularProgress>
  )
}

// Simple mini progress for inline use
export function MiniProgress({
  value,
  max = 100,
  color = '#069494',
  className,
}: {
  value: number
  max?: number
  color?: string
  className?: string
}) {
  return (
    <CircularProgress
      value={value}
      max={max}
      size={32}
      strokeWidth={4}
      color={color}
      className={className}
    />
  )
}
