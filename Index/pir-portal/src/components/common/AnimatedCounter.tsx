import CountUp from 'react-countup'
import { cn } from '@/lib/utils'

interface AnimatedCounterProps {
  value: number
  prefix?: string
  suffix?: string
  decimals?: number
  duration?: number
  className?: string
  separator?: string
  enableScrollSpy?: boolean
  scrollSpyOnce?: boolean
}

export function AnimatedCounter({
  value,
  prefix = '',
  suffix = '',
  decimals = 0,
  duration = 2,
  className,
  separator = ',',
  enableScrollSpy = true,
  scrollSpyOnce = true,
}: AnimatedCounterProps) {
  return (
    <CountUp
      end={value}
      prefix={prefix}
      suffix={suffix}
      decimals={decimals}
      duration={duration}
      separator={separator}
      enableScrollSpy={enableScrollSpy}
      scrollSpyOnce={scrollSpyOnce}
      className={cn('tabular-nums', className)}
    />
  )
}

// Preset counters
export function DaysCounter({ days, className }: { days: number; className?: string }) {
  return (
    <div className={cn('text-center', className)}>
      <AnimatedCounter
        value={days}
        className="text-4xl md:text-5xl font-bold"
        duration={2.5}
      />
      <p className="text-sm text-muted-foreground mt-1">
        {days === 1 ? 'day' : 'days'}
      </p>
    </div>
  )
}

export function MoneyCounter({
  amount,
  className,
}: {
  amount: number
  className?: string
}) {
  return (
    <AnimatedCounter
      value={amount}
      prefix="$"
      decimals={2}
      className={cn('text-2xl font-bold', className)}
      duration={2}
    />
  )
}

export function StreakCounter({
  days,
  className,
}: {
  days: number
  className?: string
}) {
  return (
    <div className={cn('flex items-baseline gap-1', className)}>
      <AnimatedCounter
        value={days}
        className="text-3xl font-bold"
        duration={1.5}
      />
      <span className="text-sm text-muted-foreground">day streak</span>
    </div>
  )
}

export function PercentageCounter({
  value,
  className,
}: {
  value: number
  className?: string
}) {
  return (
    <AnimatedCounter
      value={value}
      suffix="%"
      decimals={0}
      className={cn('text-xl font-semibold', className)}
      duration={1.5}
    />
  )
}
