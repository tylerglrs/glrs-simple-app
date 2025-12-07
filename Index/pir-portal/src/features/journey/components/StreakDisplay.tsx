import { Flame, Moon, TrendingUp, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import type { StreakData } from '../types'

// =============================================================================
// TYPES
// =============================================================================

export interface StreakDisplayProps {
  checkInStreak: StreakData
  reflectionStreak: StreakData
  loading?: boolean
  variant?: 'compact' | 'full' | 'cards'
  className?: string
}

// =============================================================================
// COMPONENT
// =============================================================================

export function StreakDisplay({
  checkInStreak,
  reflectionStreak,
  loading = false,
  variant = 'cards',
  className,
}: StreakDisplayProps) {
  const isMobile = useMediaQuery('(max-width: 768px)')

  if (loading) {
    return (
      <div className={cn('flex items-center justify-center p-8', className)}>
        <Loader2 className="h-6 w-6 animate-spin text-teal-500" />
      </div>
    )
  }

  if (variant === 'compact') {
    return (
      <div className={cn('flex items-center gap-6', className)}>
        <div className="flex items-center gap-2">
          <Flame className="h-5 w-5 text-orange-500" />
          <span className="text-lg font-bold text-foreground">{checkInStreak.current}</span>
          <span className="text-sm text-muted-foreground">check-ins</span>
        </div>
        <div className="flex items-center gap-2">
          <Moon className="h-5 w-5 text-indigo-500" />
          <span className="text-lg font-bold text-foreground">{reflectionStreak.current}</span>
          <span className="text-sm text-muted-foreground">reflections</span>
        </div>
      </div>
    )
  }

  if (variant === 'full') {
    return (
      <div className={cn('rounded-xl border bg-white p-5 shadow-sm', className)}>
        <h3 className="mb-4 font-semibold text-foreground">Your Streaks</h3>

        <div className="grid grid-cols-2 gap-4">
          {/* Check-in Streak */}
          <div className="rounded-lg bg-gradient-to-br from-orange-50 to-orange-100 p-4">
            <div className="mb-2 flex items-center gap-2">
              <Flame className="h-5 w-5 text-orange-500" />
              <span className="text-sm font-medium text-orange-700">Check-ins</span>
            </div>
            <p className="text-3xl font-bold text-orange-600">{checkInStreak.current}</p>
            <p className="mt-1 text-xs text-orange-600/70">
              Best: {checkInStreak.longest} days
            </p>
          </div>

          {/* Reflection Streak */}
          <div className="rounded-lg bg-gradient-to-br from-indigo-50 to-indigo-100 p-4">
            <div className="mb-2 flex items-center gap-2">
              <Moon className="h-5 w-5 text-indigo-500" />
              <span className="text-sm font-medium text-indigo-700">Reflections</span>
            </div>
            <p className="text-3xl font-bold text-indigo-600">{reflectionStreak.current}</p>
            <p className="mt-1 text-xs text-indigo-600/70">
              Best: {reflectionStreak.longest} days
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Default: cards variant
  return (
    <div className={cn('grid gap-3', isMobile ? 'grid-cols-2' : 'grid-cols-2', className)}>
      {/* Check-in Streak Card */}
      <div className="rounded-xl border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100">
            <Flame className="h-5 w-5 text-orange-500" />
          </div>
          {checkInStreak.current > 0 && checkInStreak.current === checkInStreak.longest && (
            <div className="flex items-center gap-1 rounded-full bg-orange-500 px-2 py-0.5">
              <TrendingUp className="h-3 w-3 text-white" />
              <span className="text-xs font-medium text-white">Best!</span>
            </div>
          )}
        </div>

        <div className="mt-3">
          <p className="text-3xl font-bold text-orange-600">{checkInStreak.current}</p>
          <p className="text-sm text-muted-foreground">Day Check-in Streak</p>
        </div>

        <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
          <span>Best: {checkInStreak.longest}</span>
          {checkInStreak.lastDate && (
            <span>
              Last: {new Date(checkInStreak.lastDate).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
              })}
            </span>
          )}
        </div>
      </div>

      {/* Reflection Streak Card */}
      <div className="rounded-xl border-2 border-indigo-200 bg-gradient-to-br from-indigo-50 to-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100">
            <Moon className="h-5 w-5 text-indigo-500" />
          </div>
          {reflectionStreak.current > 0 && reflectionStreak.current === reflectionStreak.longest && (
            <div className="flex items-center gap-1 rounded-full bg-indigo-500 px-2 py-0.5">
              <TrendingUp className="h-3 w-3 text-white" />
              <span className="text-xs font-medium text-white">Best!</span>
            </div>
          )}
        </div>

        <div className="mt-3">
          <p className="text-3xl font-bold text-indigo-600">{reflectionStreak.current}</p>
          <p className="text-sm text-muted-foreground">Day Reflection Streak</p>
        </div>

        <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
          <span>Best: {reflectionStreak.longest}</span>
          {reflectionStreak.lastDate && (
            <span>
              Last: {new Date(reflectionStreak.lastDate).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
              })}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

export default StreakDisplay
