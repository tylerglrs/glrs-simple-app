import { useMemo } from 'react'
import { Map, DollarSign, TrendingUp, Plus, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { MoneyMapStop } from './MoneyMapStop'
import { formatCurrency } from '../hooks/useSavingsData'
import { calculateMoneyMapProgress } from '../hooks/useMoneyMapStops'
import type { MoneyMapStop as MoneyMapStopType } from '../types'

// =============================================================================
// TYPES
// =============================================================================

export interface MoneyMapProps {
  stops: MoneyMapStopType[]
  moneySaved: number
  dailySavings?: number
  loading?: boolean
  onAddStop?: () => void
  onStopClick?: (stop: MoneyMapStopType) => void
  className?: string
}

// =============================================================================
// COMPONENT
// =============================================================================

export function MoneyMap({
  stops,
  moneySaved,
  dailySavings = 0,
  loading = false,
  onAddStop,
  onStopClick,
  className,
}: MoneyMapProps) {
  // Calculate progress and unlocked stops
  const { unlockedStops, nextStop, progress } = useMemo(
    () => calculateMoneyMapProgress(moneySaved, stops),
    [moneySaved, stops]
  )

  // Sort stops by cost
  const sortedStops = useMemo(
    () => [...stops].sort((a, b) => a.cost - b.cost),
    [stops]
  )

  if (loading) {
    return (
      <div className={cn('flex items-center justify-center py-12', className)}>
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Header Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl border bg-gradient-to-br from-green-50 to-green-100 p-3 text-center">
          <div className="flex items-center justify-center gap-1 text-green-600 mb-1">
            <DollarSign className="h-4 w-4" />
            <span className="text-xs font-medium">Saved</span>
          </div>
          <p className="text-lg font-bold text-green-700">
            {formatCurrency(moneySaved)}
          </p>
        </div>

        <div className="rounded-xl border bg-gradient-to-br from-primary/5 to-primary/10 p-3 text-center">
          <div className="flex items-center justify-center gap-1 text-primary mb-1">
            <Map className="h-4 w-4" />
            <span className="text-xs font-medium">Unlocked</span>
          </div>
          <p className="text-lg font-bold text-primary">
            {unlockedStops.length}/{stops.length}
          </p>
        </div>

        <div className="rounded-xl border bg-gradient-to-br from-amber-50 to-amber-100 p-3 text-center">
          <div className="flex items-center justify-center gap-1 text-amber-600 mb-1">
            <TrendingUp className="h-4 w-4" />
            <span className="text-xs font-medium">Daily</span>
          </div>
          <p className="text-lg font-bold text-amber-700">
            {formatCurrency(dailySavings)}
          </p>
        </div>
      </div>

      {/* Next Milestone Highlight */}
      {nextStop && (
        <div className="rounded-xl border-2 border-primary bg-gradient-to-r from-primary/10 to-primary/5 p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white">
              <Map className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Next Milestone</p>
              <p className="font-semibold text-foreground">{nextStop.name}</p>
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {formatCurrency(moneySaved)} / {formatCurrency(nextStop.cost)}
              </span>
              <span className="font-medium text-primary">{progress}%</span>
            </div>
            <div className="h-3 w-full rounded-full bg-muted overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(nextStop.cost - moneySaved)} to go
            </p>
          </div>
        </div>
      )}

      {/* Money Map Path */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-foreground">Your Money Map</h3>
          {onAddStop && (
            <Button
              variant="outline"
              size="sm"
              onClick={onAddStop}
              className="gap-1"
            >
              <Plus className="h-4 w-4" />
              Add Goal
            </Button>
          )}
        </div>

        {sortedStops.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-muted-foreground/30 p-8 text-center">
            <Map className="mx-auto mb-3 h-10 w-10 text-muted-foreground opacity-50" />
            <p className="text-sm font-medium text-muted-foreground">
              No milestones yet
            </p>
            <p className="text-xs text-muted-foreground opacity-75">
              Add financial goals to track your progress
            </p>
          </div>
        ) : (
          <div className="relative">
            {/* Connecting Line */}
            <div className="absolute left-6 top-6 bottom-6 w-0.5 bg-gradient-to-b from-green-500 via-primary to-muted" />

            {/* Stops */}
            <div className="space-y-3 relative">
              {sortedStops.map((stop) => {
                const isUnlocked = stop.cost <= moneySaved
                const isNext = nextStop?.id === stop.id

                return (
                  <MoneyMapStop
                    key={stop.id}
                    stop={stop}
                    isUnlocked={isUnlocked}
                    isNext={isNext}
                    progress={isNext ? progress : 0}
                    moneySaved={moneySaved}
                    onClick={() => onStopClick?.(stop)}
                  />
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* All Unlocked Message */}
      {unlockedStops.length === stops.length && stops.length > 0 && (
        <div className="rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 p-4 text-center text-white">
          <p className="text-lg font-bold">🎉 All Milestones Unlocked!</p>
          <p className="text-sm opacity-90">
            Amazing progress! Consider adding new goals.
          </p>
        </div>
      )}
    </div>
  )
}

export default MoneyMap
