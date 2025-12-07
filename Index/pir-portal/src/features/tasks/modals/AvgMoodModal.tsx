import {
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Smile, TrendingUp, TrendingDown, Minus, X, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { useCheckInStats } from '../hooks/useTasksModalData'

// =============================================================================
// TYPES
// =============================================================================

export interface AvgMoodModalProps {
  onClose: () => void
}

// =============================================================================
// COMPONENT
// =============================================================================

export function AvgMoodModal({ onClose }: AvgMoodModalProps) {
  const isMobile = useMediaQuery('(max-width: 768px)')
  const { weeklyStats, moodPattern, loading } = useCheckInStats()

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving':
        return <TrendingUp className="h-4 w-4 text-green-500" />
      case 'declining':
        return <TrendingDown className="h-4 w-4 text-red-500" />
      default:
        return <Minus className="h-4 w-4 text-gray-500" />
    }
  }

  const getMoodEmoji = (value: number) => {
    if (value >= 8) return '😄'
    if (value >= 6) return '🙂'
    if (value >= 4) return '😐'
    if (value >= 2) return '😕'
    return '😢'
  }

  const getMoodColor = (value: number) => {
    if (value >= 8) return 'text-green-500'
    if (value >= 6) return 'text-green-400'
    if (value >= 4) return 'text-yellow-500'
    if (value >= 2) return 'text-orange-500'
    return 'text-red-500'
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
            <Smile className="h-5 w-5 text-purple-600" />
            Average Mood
          </DialogTitle>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
            <X className="h-5 w-5" />
          </Button>
        </div>
      </DialogHeader>

      <ScrollArea className="max-h-[60vh]">
        <div className={cn('p-5 space-y-5', isMobile && 'p-4 space-y-4')}>
          {/* Mood Overview */}
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-5 text-center border border-purple-100">
            <p className="text-sm text-muted-foreground mb-2">Weekly Average Mood</p>
            <div className="flex items-center justify-center gap-3 mb-3">
              <span className="text-5xl">{getMoodEmoji(weeklyStats.avgMood)}</span>
              <span className={cn('text-4xl font-bold', getMoodColor(weeklyStats.avgMood))}>
                {weeklyStats.avgMood}/10
              </span>
            </div>
            <Progress value={weeklyStats.avgMood * 10} className="h-2" />

            <div className="flex items-center justify-center gap-2 mt-3 text-sm text-muted-foreground">
              {getTrendIcon(moodPattern.trend)}
              <span className="capitalize">{moodPattern.trend} trend</span>
            </div>
          </div>

          {/* Recent Mood History */}
          {moodPattern.dataPoints.length > 0 && (
            <div>
              <h3 className="font-semibold text-foreground mb-3">Recent Mood Entries</h3>
              <div className="space-y-2">
                {moodPattern.dataPoints.slice(0, 7).map((point, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border"
                  >
                    <span className="text-sm text-muted-foreground">
                      {new Date(point.date).toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{getMoodEmoji(point.value)}</span>
                      <span className={cn('font-semibold', getMoodColor(point.value))}>
                        {point.value}/10
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Insights */}
          {moodPattern.insights.length > 0 && (
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
              <h4 className="font-medium text-blue-800 mb-2">Insights</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                {moodPattern.insights.map((insight, index) => (
                  <li key={index}>- {insight}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Tips */}
          <div className="bg-purple-50 rounded-lg p-4 border border-purple-100">
            <h4 className="font-medium text-purple-800 mb-2">Mood Boosting Tips</h4>
            <ul className="text-sm text-purple-700 space-y-1">
              <li>- Start your day with gratitude</li>
              <li>- Get outside for fresh air and natural light</li>
              <li>- Connect with someone you trust</li>
              <li>- Practice mindfulness or deep breathing</li>
            </ul>
          </div>
        </div>
      </ScrollArea>
    </DialogContent>
  )
}

export default AvgMoodModal
