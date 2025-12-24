import { useState, useEffect, useMemo } from 'react'
import { Smile, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { ResponsiveModal } from '@/components/ui/responsive-modal'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { MoodInsightsSkeleton } from '@/components/common'
import { collection, query, where, getDocs, orderBy, Timestamp } from 'firebase/firestore'
import { db, auth } from '@/lib/firebase'
import type { CheckIn } from '../../types'

// =============================================================================
// TYPES
// =============================================================================

export interface MoodInsightsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface DayMoodData {
  date: string
  mood: number
  height: string
}

// =============================================================================
// COMPONENT
// =============================================================================

export function MoodInsightsModal({ open, onOpenChange }: MoodInsightsModalProps) {
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
        console.error('Error loading mood data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [open])

  // Calculate mood data for chart
  const moodData = useMemo((): DayMoodData[] => {
    const data: DayMoodData[] = []

    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      date.setHours(0, 0, 0, 0)

      const dayCheckIns = checkIns.filter((ci) => {
        const ciDate = ci.createdAt?.toDate?.() || new Date()
        ciDate.setHours(0, 0, 0, 0)
        return ciDate.getTime() === date.getTime()
      })

      const moodValues = dayCheckIns
        .map((ci) => ci.morningData?.mood)
        .filter((m): m is number => m !== undefined && m !== null)

      const avgMood = moodValues.length > 0
        ? moodValues.reduce((a, b) => a + b, 0) / moodValues.length
        : 0

      data.push({
        date: date.toLocaleDateString('en-US', { weekday: 'short' }),
        mood: avgMood,
        height: avgMood > 0 ? `${(avgMood / 10) * 100}%` : '5%',
      })
    }

    return data
  }, [checkIns])

  // Calculate overall average
  const overallAvg = useMemo(() => {
    const validMoods = moodData.filter((d) => d.mood > 0)
    if (validMoods.length === 0) return 'N/A'
    return (validMoods.reduce((sum, d) => sum + d.mood, 0) / validMoods.length).toFixed(1)
  }, [moodData])

  // Calculate trend
  const trend = useMemo(() => {
    const firstHalf = moodData.slice(0, 3).filter((d) => d.mood > 0)
    const secondHalf = moodData.slice(4).filter((d) => d.mood > 0)

    if (firstHalf.length === 0 || secondHalf.length === 0) return 'stable'

    const firstAvg = firstHalf.reduce((s, d) => s + d.mood, 0) / firstHalf.length
    const secondAvg = secondHalf.reduce((s, d) => s + d.mood, 0) / secondHalf.length

    if (secondAvg > firstAvg + 0.5) return 'up'
    if (secondAvg < firstAvg - 0.5) return 'down'
    return 'stable'
  }, [moodData])

  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus

  return (
    <ResponsiveModal open={open} onOpenChange={onOpenChange} desktopSize="md">
      <div className="flex flex-col h-full bg-white overflow-hidden">
        <div className="px-4 py-3 border-b shrink-0">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Smile className="h-5 w-5 text-pink-500" />
            Mood Insights
          </h2>
        </div>

        <div className="flex-1 overflow-y-auto p-4">

        {loading ? (
          <MoodInsightsSkeleton />
        ) : (
          <div className="space-y-4">
            {/* Average Mood */}
            <div className="rounded-xl bg-gradient-to-br from-pink-100 to-pink-50 p-4 text-center">
              <p className="text-xs text-muted-foreground mb-1">7-Day Average Mood</p>
              <div className="flex items-center justify-center gap-2">
                <span className="text-4xl font-bold text-pink-500">{overallAvg}</span>
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
              <h4 className="text-sm font-semibold mb-3">Daily Mood Trend</h4>
              <div className="flex items-end justify-between h-48 gap-2">
                {moodData.map((day, idx) => (
                  <div
                    key={idx}
                    className="flex-1 flex flex-col items-center justify-end"
                  >
                    <div
                      className="w-full bg-pink-500 rounded-t transition-all duration-300"
                      style={{
                        height: day.height,
                        minHeight: '5%',
                        opacity: day.mood > 0 ? 1 : 0.3,
                      }}
                      title={`${day.date}: ${day.mood.toFixed(1)}`}
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
              Scale: 1 (Low) - 10 (High)
            </p>

            {/* Recommendations */}
            <div className="rounded-xl border bg-muted/30 p-3">
              <h4 className="text-sm font-semibold mb-2">Insights</h4>
              <ul className="text-xs text-muted-foreground space-y-1">
                {trend === 'up' && (
                  <li>Your mood is trending upward - keep up the great work!</li>
                )}
                {trend === 'down' && (
                  <li>Your mood has been lower recently. Consider reaching out to your support network.</li>
                )}
                {overallAvg !== 'N/A' && parseFloat(overallAvg) >= 7 && (
                  <li>You're averaging above 7 - excellent emotional wellness!</li>
                )}
                {overallAvg !== 'N/A' && parseFloat(overallAvg) < 5 && (
                  <li>Consider using coping techniques when mood is low.</li>
                )}
              </ul>
            </div>
          </div>
        )}

        <Button onClick={() => onOpenChange(false)} className="w-full">
          Close
        </Button>
        </div>
      </div>
    </ResponsiveModal>
  )
}

export default MoodInsightsModal
