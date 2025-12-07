import { Flame, Calendar, TrendingUp, Award } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import type { StreakData } from '../../types'

// =============================================================================
// TYPES
// =============================================================================

export interface StreakModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  streakData: StreakData
  title?: string
  icon?: React.ReactNode
  color?: string
}

// =============================================================================
// MILESTONES
// =============================================================================

const STREAK_MILESTONES = [7, 14, 21, 30, 60, 90, 180, 365]

// =============================================================================
// COMPONENT
// =============================================================================

export function StreakModal({
  open,
  onOpenChange,
  streakData,
  title = 'Check-In Streak',
  icon,
  color = '#f97316',
}: StreakModalProps) {
  const { current, longest, lastDate } = streakData

  // Find next milestone
  const nextMilestone = STREAK_MILESTONES.find((m) => m > current) || STREAK_MILESTONES[STREAK_MILESTONES.length - 1]
  const prevMilestone = STREAK_MILESTONES.filter((m) => m <= current).pop() || 0
  const progress = nextMilestone > 0
    ? Math.min(100, Math.round(((current - prevMilestone) / (nextMilestone - prevMilestone)) * 100))
    : 100

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {icon || <Flame className="h-5 w-5" style={{ color }} />}
            {title}
          </DialogTitle>
        </DialogHeader>

        {/* Current Streak Hero */}
        <div
          className="rounded-xl p-6 text-center text-white"
          style={{ background: `linear-gradient(135deg, ${color}, ${adjustColor(color, -20)})` }}
        >
          <div className="text-5xl font-bold mb-1">{current}</div>
          <div className="text-sm opacity-90">Day Streak</div>
          {current > 0 && (
            <div className="mt-2 text-xs opacity-75">
              Keep it up! 🔥
            </div>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl border bg-muted/30 p-4 text-center">
            <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
              <Award className="h-4 w-4" />
              <span className="text-xs">Longest</span>
            </div>
            <div className="text-2xl font-bold" style={{ color }}>
              {longest}
            </div>
            <div className="text-xs text-muted-foreground">days</div>
          </div>

          <div className="rounded-xl border bg-muted/30 p-4 text-center">
            <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
              <Calendar className="h-4 w-4" />
              <span className="text-xs">Last</span>
            </div>
            <div className="text-sm font-medium">
              {lastDate
                ? new Date(lastDate).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })
                : 'N/A'}
            </div>
          </div>
        </div>

        {/* Progress to Next Milestone */}
        <div className="rounded-xl border bg-muted/10 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium flex items-center gap-1">
              <TrendingUp className="h-4 w-4 text-primary" />
              Next Milestone
            </span>
            <span className="text-sm font-bold" style={{ color }}>
              {nextMilestone} days
            </span>
          </div>
          <Progress value={progress} className="h-2 mb-2" />
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{current} days</span>
            <span>{nextMilestone - current} to go</span>
          </div>
        </div>

        {/* Milestone Badges */}
        <div className="space-y-2">
          <h4 className="text-sm font-semibold">Milestones</h4>
          <div className="flex flex-wrap gap-2">
            {STREAK_MILESTONES.map((milestone) => {
              const achieved = current >= milestone
              const isLongestAchieved = longest >= milestone

              return (
                <div
                  key={milestone}
                  className={cn(
                    'flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium',
                    achieved
                      ? 'bg-green-100 text-green-700 border border-green-300'
                      : isLongestAchieved
                        ? 'bg-amber-100 text-amber-700 border border-amber-300'
                        : 'bg-muted text-muted-foreground'
                  )}
                >
                  {achieved && '✓ '}
                  {milestone} days
                </div>
              )
            })}
          </div>
        </div>

        <Button onClick={() => onOpenChange(false)} className="w-full">
          Close
        </Button>
      </DialogContent>
    </Dialog>
  )
}

// =============================================================================
// HELPERS
// =============================================================================

function adjustColor(hex: string, amount: number): string {
  const num = parseInt(hex.replace('#', ''), 16)
  const r = Math.min(255, Math.max(0, (num >> 16) + amount))
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00ff) + amount))
  const b = Math.min(255, Math.max(0, (num & 0x0000ff) + amount))
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`
}

export default StreakModal
