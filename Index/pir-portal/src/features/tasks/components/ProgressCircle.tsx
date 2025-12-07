import { cn } from '@/lib/utils'

// =============================================================================
// TYPES
// =============================================================================

export interface ProgressCircleProps {
  value: number // 0-100
  size?: 'sm' | 'md' | 'lg' | 'xl'
  strokeWidth?: number
  showValue?: boolean
  label?: string
  color?: string
  trackColor?: string
  className?: string
}

// =============================================================================
// SIZE CONFIG
// =============================================================================

const sizeConfig = {
  sm: { diameter: 48, fontSize: 'text-sm', labelSize: 'text-xs' },
  md: { diameter: 72, fontSize: 'text-lg', labelSize: 'text-xs' },
  lg: { diameter: 96, fontSize: 'text-2xl', labelSize: 'text-sm' },
  xl: { diameter: 128, fontSize: 'text-3xl', labelSize: 'text-sm' },
}

// =============================================================================
// COMPONENT
// =============================================================================

export function ProgressCircle({
  value,
  size = 'md',
  strokeWidth = 8,
  showValue = true,
  label,
  color = 'stroke-teal-500',
  trackColor = 'stroke-gray-200',
  className,
}: ProgressCircleProps) {
  const config = sizeConfig[size]
  const radius = (config.diameter - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (Math.min(Math.max(value, 0), 100) / 100) * circumference

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)}>
      <svg
        width={config.diameter}
        height={config.diameter}
        className="transform -rotate-90"
      >
        {/* Background track */}
        <circle
          cx={config.diameter / 2}
          cy={config.diameter / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          className={trackColor}
        />
        {/* Progress arc */}
        <circle
          cx={config.diameter / 2}
          cy={config.diameter / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className={cn(color, 'transition-all duration-500 ease-out')}
        />
      </svg>

      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {showValue && (
          <span className={cn('font-bold text-foreground', config.fontSize)}>
            {Math.round(value)}%
          </span>
        )}
        {label && (
          <span className={cn('text-muted-foreground', config.labelSize)}>
            {label}
          </span>
        )}
      </div>
    </div>
  )
}

// =============================================================================
// PRESET VARIANTS
// =============================================================================

export function TaskCompletionCircle({
  completed,
  total,
  ...props
}: {
  completed: number
  total: number
} & Omit<ProgressCircleProps, 'value'>) {
  const percentage = total > 0 ? (completed / total) * 100 : 0

  return (
    <ProgressCircle
      value={percentage}
      label={`${completed}/${total}`}
      color={percentage === 100 ? 'stroke-green-500' : 'stroke-teal-500'}
      {...props}
    />
  )
}

export function GoalProgressCircle({
  progress,
  goalTitle,
  ...props
}: {
  progress: number
  goalTitle?: string
} & Omit<ProgressCircleProps, 'value' | 'label'>) {
  const colorClass =
    progress >= 100
      ? 'stroke-green-500'
      : progress >= 75
      ? 'stroke-teal-500'
      : progress >= 50
      ? 'stroke-yellow-500'
      : progress >= 25
      ? 'stroke-orange-500'
      : 'stroke-red-500'

  return (
    <ProgressCircle
      value={progress}
      label={goalTitle}
      color={colorClass}
      {...props}
    />
  )
}

export function CheckInRateCircle({
  rate,
  ...props
}: {
  rate: number
} & Omit<ProgressCircleProps, 'value' | 'label'>) {
  return (
    <ProgressCircle
      value={rate}
      label="check-in rate"
      color={rate >= 80 ? 'stroke-green-500' : rate >= 50 ? 'stroke-yellow-500' : 'stroke-red-500'}
      {...props}
    />
  )
}

export default ProgressCircle
