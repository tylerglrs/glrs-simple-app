import { Flame, Moon, Target, TrendingUp } from 'lucide-react'
import { ResponsiveModal } from '@/components/ui/responsive-modal'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import type { StreakData } from '../../types'

// =============================================================================
// TYPES
// =============================================================================

export interface StreaksModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  checkInStreak: StreakData
  reflectionStreak: StreakData
  onViewCheckInStreak?: () => void
  onViewReflectionStreak?: () => void
}

// =============================================================================
// COMPONENT
// =============================================================================

export function StreaksModal({
  open,
  onOpenChange,
  checkInStreak,
  reflectionStreak,
  onViewCheckInStreak,
  onViewReflectionStreak,
}: StreaksModalProps) {
  // Calculate combined stats
  const totalCurrentStreak = checkInStreak.current + reflectionStreak.current
  const totalLongestStreak = checkInStreak.longest + reflectionStreak.longest

  return (
    <ResponsiveModal open={open} onOpenChange={onOpenChange} desktopSize="md">
      <div className="flex flex-col h-full bg-white overflow-hidden">
        <div className="px-4 py-3 border-b shrink-0">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            All Streaks Overview
          </h2>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">

        {/* Summary Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 p-4 text-center">
            <div className="flex items-center justify-center gap-1 text-primary mb-1">
              <TrendingUp className="h-4 w-4" />
              <span className="text-xs font-medium">Combined Current</span>
            </div>
            <div className="text-3xl font-bold text-primary">
              {totalCurrentStreak}
            </div>
            <div className="text-xs text-muted-foreground">total days</div>
          </div>

          <div className="rounded-xl bg-gradient-to-br from-amber-500/10 to-amber-500/5 border border-amber-500/20 p-4 text-center">
            <div className="flex items-center justify-center gap-1 text-amber-600 mb-1">
              <Flame className="h-4 w-4" />
              <span className="text-xs font-medium">Combined Best</span>
            </div>
            <div className="text-3xl font-bold text-amber-600">
              {totalLongestStreak}
            </div>
            <div className="text-xs text-muted-foreground">total days</div>
          </div>
        </div>

        {/* Individual Streak Cards */}
        <div className="space-y-3">
          {/* Check-In Streak */}
          <button
            onClick={onViewCheckInStreak}
            className={cn(
              'w-full rounded-xl border p-4 text-left transition-all',
              'hover:border-orange-300 hover:bg-orange-50'
            )}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-red-500 text-white">
                  <Flame className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">Check-In Streak</h4>
                  <p className="text-xs text-muted-foreground">Daily check-ins</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-orange-500">
                  {checkInStreak.current}
                </div>
                <div className="text-xs text-muted-foreground">
                  Best: {checkInStreak.longest}
                </div>
              </div>
            </div>
            <Progress
              value={Math.min(100, (checkInStreak.current / 30) * 100)}
              className="h-1.5 mt-3"
            />
          </button>

          {/* Reflection Streak */}
          <button
            onClick={onViewReflectionStreak}
            className={cn(
              'w-full rounded-xl border p-4 text-left transition-all',
              'hover:border-indigo-300 hover:bg-indigo-50'
            )}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 text-white">
                  <Moon className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">Reflection Streak</h4>
                  <p className="text-xs text-muted-foreground">Evening reflections</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-indigo-500">
                  {reflectionStreak.current}
                </div>
                <div className="text-xs text-muted-foreground">
                  Best: {reflectionStreak.longest}
                </div>
              </div>
            </div>
            <Progress
              value={Math.min(100, (reflectionStreak.current / 30) * 100)}
              className="h-1.5 mt-3"
            />
          </button>
        </div>

        {/* Tips */}
        <div className="rounded-xl bg-muted/50 p-3 text-center">
          <p className="text-xs text-muted-foreground">
            Tip: Complete both morning check-ins and evening reflections daily to build multiple streaks!
          </p>
        </div>

        <Button onClick={() => onOpenChange(false)} className="w-full">
          Close
        </Button>
        </div>
      </div>
    </ResponsiveModal>
  )
}

export default StreaksModal
