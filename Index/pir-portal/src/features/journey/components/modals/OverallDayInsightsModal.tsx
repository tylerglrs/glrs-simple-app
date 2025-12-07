import { useState, useEffect, useMemo } from 'react'
import { Loader2, Star, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { collection, query, where, getDocs, orderBy, Timestamp } from 'firebase/firestore'
import { db, auth } from '@/lib/firebase'
import type { CheckIn } from '../../types'

// =============================================================================
// TYPES
// =============================================================================

export interface OverallDayInsightsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface DayScoreData {
  date: string
  score: number
  height: string
}

// =============================================================================
// COMPONENT
// =============================================================================

export function OverallDayInsightsModal({ open, onOpenChange }: OverallDayInsightsModalProps) {
  const [checkIns, setCheckIns] = useState<CheckIn[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!open) return

    const loadData = async () => {
      const user = auth.currentUser
      if (!user) return

      setLoading(true)
      try {
        const sevenDaysAgo = new Date()
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

        const checkInsQuery = query(
          collection(db, 'checkIns'),
          where('userId', '==', user.uid),
          where('createdAt', '>=', Timestamp.fromDate(sevenDaysAgo)),
          orderBy('createdAt', 'desc')
        )

        const snapshot = await getDocs(checkInsQuery)
        setCheckIns(
          snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as CheckIn[]
        )
      } catch (error) {
        console.error('Error loading overall day data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [open])

  // Calculate score data for chart
  const scoreData = useMemo((): DayScoreData[] => {
    const data: DayScoreData[] = []

    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      date.setHours(0, 0, 0, 0)

      const dayCheckIns = checkIns.filter((ci) => {
        const ciDate = ci.createdAt?.toDate?.() || new Date()
        ciDate.setHours(0, 0, 0, 0)
        return ciDate.getTime() === date.getTime()
      })

      const scores = dayCheckIns
        .map((ci) => ci.eveningData?.overallDay)
        .filter((s): s is number => s !== undefined && s !== null)

      const avgScore = scores.length > 0
        ? scores.reduce((a, b) => a + b, 0) / scores.length
        : 0

      data.push({
        date: date.toLocaleDateString('en-US', { weekday: 'short' }),
        score: avgScore,
        height: avgScore > 0 ? `${(avgScore / 10) * 100}%` : '5%',
      })
    }

    return data
  }, [checkIns])

  // Calculate overall average
  const overallAvg = useMemo(() => {
    const validScores = scoreData.filter((d) => d.score > 0)
    if (validScores.length === 0) return 'N/A'
    return (validScores.reduce((sum, d) => sum + d.score, 0) / validScores.length).toFixed(1)
  }, [scoreData])

  // Calculate trend
  const trend = useMemo(() => {
    const firstHalf = scoreData.slice(0, 3).filter((d) => d.score > 0)
    const secondHalf = scoreData.slice(4).filter((d) => d.score > 0)

    if (firstHalf.length === 0 || secondHalf.length === 0) return 'stable'

    const firstAvg = firstHalf.reduce((s, d) => s + d.score, 0) / firstHalf.length
    const secondAvg = secondHalf.reduce((s, d) => s + d.score, 0) / secondHalf.length

    if (secondAvg > firstAvg + 0.5) return 'up'
    if (secondAvg < firstAvg - 0.5) return 'down'
    return 'stable'
  }, [scoreData])

  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-primary" />
            Overall Day Insights
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-4">
            {/* Average Score */}
            <div className="rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 p-4 text-center">
              <p className="text-xs text-muted-foreground mb-1">7-Day Average Score</p>
              <div className="flex items-center justify-center gap-2">
                <span className="text-4xl font-bold text-primary">{overallAvg}</span>
                <div className={cn(
                  'flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium',
                  trend === 'up' ? 'bg-green-100 text-green-700' :
                  trend === 'down' ? 'bg-red-100 text-red-700' :
                  'bg-gray-100 text-gray-700'
                )}>
                  <TrendIcon className="h-3 w-3" />
                  {trend === 'up' ? 'Improving' : trend === 'down' ? 'Declining' : 'Stable'}
                </div>
              </div>
            </div>

            {/* Bar Chart */}
            <div>
              <h4 className="text-sm font-semibold mb-3">Daily Score Trend</h4>
              <div className="flex items-end justify-between h-48 gap-2">
                {scoreData.map((day, idx) => (
                  <div
                    key={idx}
                    className="flex-1 flex flex-col items-center justify-end"
                  >
                    <div
                      className="w-full bg-primary rounded-t transition-all duration-300"
                      style={{
                        height: day.height,
                        minHeight: '5%',
                        opacity: day.score > 0 ? 1 : 0.3,
                      }}
                      title={`${day.date}: ${day.score.toFixed(1)}`}
                    />
                    <span className="mt-2 text-xs text-muted-foreground">
                      {day.date}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Scale Reference */}
            <p className="text-xs text-muted-foreground text-center">
              Scale: 1 (Poor) - 10 (Excellent)
            </p>

            {/* Insights */}
            <div className="rounded-xl border bg-muted/30 p-3">
              <h4 className="text-sm font-semibold mb-2">Insights</h4>
              <ul className="text-xs text-muted-foreground space-y-1">
                {trend === 'up' && (
                  <li>Your days are getting better - great progress!</li>
                )}
                {trend === 'down' && (
                  <li>Recent days have been more challenging. Remember to use your coping tools.</li>
                )}
                {overallAvg !== 'N/A' && parseFloat(overallAvg) >= 7 && (
                  <li>Averaging above 7 shows strong recovery momentum!</li>
                )}
                {overallAvg !== 'N/A' && parseFloat(overallAvg) < 5 && (
                  <li>Consider connecting with your support network for encouragement.</li>
                )}
              </ul>
            </div>
          </div>
        )}

        <Button onClick={() => onOpenChange(false)} className="w-full">
          Close
        </Button>
      </DialogContent>
    </Dialog>
  )
}

export default OverallDayInsightsModal
