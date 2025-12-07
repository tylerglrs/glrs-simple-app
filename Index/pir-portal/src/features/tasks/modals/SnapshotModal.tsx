import {
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Camera,
  Share2,
  X,
  Loader2,
  Target,
  CheckCircle,
  Calendar,
  Star,
  Heart,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { useCheckInStats } from '../hooks/useTasksModalData'
import { useGoalsData } from '../hooks/useGoalsData'
import { useWins } from '../hooks/useTasksModalData'

// =============================================================================
// TYPES
// =============================================================================

export interface SnapshotModalProps {
  onClose: () => void
}

// =============================================================================
// COMPONENT
// =============================================================================

export function SnapshotModal({ onClose }: SnapshotModalProps) {
  const isMobile = useMediaQuery('(max-width: 768px)')
  const { weeklyStats, streakData, loading: checkInLoading } = useCheckInStats()
  const { stats: goalStats, loading: goalsLoading } = useGoalsData()
  const { wins, loading: winsLoading } = useWins()

  const loading = checkInLoading || goalsLoading || winsLoading

  const generateSnapshotText = () => {
    const date = new Date().toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    })

    return `Recovery Snapshot - ${date}

Current Streak: ${streakData.currentStreak} days
Check-in Rate: ${weeklyStats.checkRate}%
Task Completion: ${goalStats.completionRate}%
Average Mood: ${weeklyStats.avgMood}/10
Today's Wins: ${wins.length}

Keep pushing forward!
#RecoveryJourney #Progress`
  }

  const handleShare = async () => {
    const text = generateSnapshotText()

    if (navigator.share) {
      try {
        await navigator.share({ title: 'My Recovery Snapshot', text })
      } catch {
        await navigator.clipboard.writeText(text)
      }
    } else {
      await navigator.clipboard.writeText(text)
    }
  }

  if (loading) {
    return (
      <DialogContent className="max-w-[95vw] sm:max-w-[500px]">
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-teal-500" />
        </div>
      </DialogContent>
    )
  }

  return (
    <DialogContent className="max-w-[95vw] sm:max-w-[500px] p-0">
      {/* Header */}
      <DialogHeader className="p-5 pb-4 border-b">
        <div className="flex items-center justify-between">
          <DialogTitle className="flex items-center gap-2 text-lg font-semibold">
            <Camera className="h-5 w-5 text-indigo-600" />
            Recovery Snapshot
          </DialogTitle>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
            <X className="h-5 w-5" />
          </Button>
        </div>
      </DialogHeader>

      <ScrollArea className="max-h-[60vh]">
        <div className={cn('p-5 space-y-4', isMobile && 'p-4 space-y-3')}>
          {/* Snapshot Card - Visual Summary */}
          <div className="bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-xl p-5 text-white">
            <div className="text-center mb-4">
              <p className="text-sm opacity-80 mb-1">Recovery Snapshot</p>
              <p className="text-xs opacity-60">
                {new Date().toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>

            {/* Main Stats */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-white/20 rounded-lg p-3 text-center backdrop-blur-sm">
                <span className="text-2xl mb-1 block">🔥</span>
                <p className="text-xl font-bold">{streakData.currentStreak}</p>
                <p className="text-xs opacity-80">Day Streak</p>
              </div>
              <div className="bg-white/20 rounded-lg p-3 text-center backdrop-blur-sm">
                <span className="text-2xl mb-1 block">✅</span>
                <p className="text-xl font-bold">{goalStats.completionRate}%</p>
                <p className="text-xs opacity-80">Tasks Done</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="bg-white/15 rounded-lg p-2 text-center backdrop-blur-sm">
                <p className="text-lg font-bold">{weeklyStats.avgMood}</p>
                <p className="text-xs opacity-80">Avg Mood</p>
              </div>
              <div className="bg-white/15 rounded-lg p-2 text-center backdrop-blur-sm">
                <p className="text-lg font-bold">{wins.length}</p>
                <p className="text-xs opacity-80">Today's Wins</p>
              </div>
              <div className="bg-white/15 rounded-lg p-2 text-center backdrop-blur-sm">
                <p className="text-lg font-bold">{goalStats.activeGoals}</p>
                <p className="text-xs opacity-80">Active Goals</p>
              </div>
            </div>
          </div>

          {/* Quick Stats Breakdown */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-700">Check-ins</span>
              </div>
              <p className="text-xl font-bold text-blue-600">{weeklyStats.checkRate}%</p>
              <p className="text-xs text-muted-foreground">this week</p>
            </div>

            <div className="bg-orange-50 rounded-lg p-3 border border-orange-100">
              <div className="flex items-center gap-2 mb-2">
                <Star className="h-4 w-4 text-orange-500" />
                <span className="text-sm font-medium text-orange-700">Longest Streak</span>
              </div>
              <p className="text-xl font-bold text-orange-600">{streakData.longestStreak}</p>
              <p className="text-xs text-muted-foreground">days ever</p>
            </div>

            <div className="bg-green-50 rounded-lg p-3 border border-green-100">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-700">Completed</span>
              </div>
              <p className="text-xl font-bold text-green-600">{goalStats.completedAssignments}</p>
              <p className="text-xs text-muted-foreground">tasks total</p>
            </div>

            <div className="bg-purple-50 rounded-lg p-3 border border-purple-100">
              <div className="flex items-center gap-2 mb-2">
                <Target className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-medium text-purple-700">Goals Done</span>
              </div>
              <p className="text-xl font-bold text-purple-600">{goalStats.completedGoals}</p>
              <p className="text-xs text-muted-foreground">completed</p>
            </div>
          </div>

          {/* Share Button */}
          <Button
            onClick={handleShare}
            className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600"
          >
            <Share2 className="h-4 w-4 mr-2" />
            Share Snapshot
          </Button>

          {/* Motivation */}
          <div className="text-center text-sm text-muted-foreground flex items-center justify-center gap-2">
            <Heart className="h-4 w-4 text-pink-400" />
            <span>Every day is a new opportunity to grow</span>
            <Heart className="h-4 w-4 text-pink-400" />
          </div>
        </div>
      </ScrollArea>
    </DialogContent>
  )
}

export default SnapshotModal
