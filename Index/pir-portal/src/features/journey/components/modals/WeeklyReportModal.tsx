import { useState, useEffect, useMemo } from 'react'
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Calendar,
  Smile,
  Flame,
  AlertCircle,
  Moon,
  Star,
  CheckCircle,
} from 'lucide-react'
import { ResponsiveModal } from '@/components/ui/responsive-modal'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { WeeklyReportSkeleton } from '@/components/common'
import { collection, query, where, getDocs, orderBy, Timestamp } from 'firebase/firestore'
import { db, auth } from '@/lib/firebase'
import type { CheckIn, WeeklyReportData, TrendInfo } from '../../types'

// =============================================================================
// TYPES
// =============================================================================

export interface WeeklyReportModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

// =============================================================================
// COMPONENT
// =============================================================================

export function WeeklyReportModal({ open, onOpenChange }: WeeklyReportModalProps) {
  const [checkIns, setCheckIns] = useState<CheckIn[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!open) return

    const loadData = async () => {
      const user = auth.currentUser
      if (!user) return

      setLoading(true)
      try {
        const fourteenDaysAgo = new Date()
        fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14)

        const checkInsQuery = query(
          collection(db, 'checkIns'),
          where('userId', '==', user.uid),
          where('createdAt', '>=', Timestamp.fromDate(fourteenDaysAgo)),
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
        console.error('Error loading weekly report data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [open])

  // Calculate report data
  const reportData = useMemo((): WeeklyReportData | null => {
    if (checkIns.length === 0) return null

    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const thisWeek = checkIns.filter((ci) => {
      const date = ci.createdAt?.toDate?.() || new Date()
      return date >= sevenDaysAgo
    })

    const lastWeek = checkIns.filter((ci) => {
      const date = ci.createdAt?.toDate?.() || new Date()
      const fourteenDaysAgo = new Date()
      fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14)
      return date >= fourteenDaysAgo && date < sevenDaysAgo
    })

    // Calculate averages
    const calcAvg = (items: CheckIn[], path: string): number => {
      const values = items
        .map((ci) => {
          const [obj, key] = path.split('.')
          return (ci as unknown as Record<string, Record<string, number>>)[obj]?.[key]
        })
        .filter((v): v is number => v !== undefined && v !== null)
      return values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0
    }

    const thisWeekMood = calcAvg(thisWeek, 'morningData.mood')
    const lastWeekMood = calcAvg(lastWeek, 'morningData.mood')

    // Calculate trend
    const calculateTrend = (current: number, previous: number): TrendInfo => {
      if (previous === 0) return { direction: 'stable', percentage: 0 }
      const change = ((current - previous) / previous) * 100
      if (Math.abs(change) < 5) return { direction: 'stable', percentage: 0 }
      return {
        direction: change > 0 ? 'up' : 'down',
        percentage: Math.abs(Math.round(change)),
      }
    }

    // Extract gratitudes and challenges
    const gratitudes = thisWeek
      .map((ci) => ci.eveningData?.gratitude)
      .filter((g): g is string => !!g)
      .slice(0, 3)

    const challenges = thisWeek
      .map((ci) => ci.eveningData?.challenges)
      .filter((c): c is string => !!c)
      .slice(0, 3)

    return {
      totalCheckIns: thisWeek.length,
      totalReflections: thisWeek.filter((ci) => ci.eveningData?.reflection).length,
      averageMood: thisWeekMood,
      averageCraving: calcAvg(thisWeek, 'morningData.craving'),
      averageAnxiety: calcAvg(thisWeek, 'morningData.anxiety'),
      averageSleep: calcAvg(thisWeek, 'morningData.sleep'),
      averageOverallDay: calcAvg(thisWeek, 'eveningData.overallDay'),
      moodTrend: calculateTrend(thisWeekMood, lastWeekMood),
      streakDays: thisWeek.length,
      highlights: gratitudes,
      challenges,
      gratitudes,
    }
  }, [checkIns])

  const TrendIcon = reportData?.moodTrend.direction === 'up'
    ? TrendingUp
    : reportData?.moodTrend.direction === 'down'
      ? TrendingDown
      : Minus

  return (
    <ResponsiveModal open={open} onOpenChange={onOpenChange} desktopSize="lg">
      <div className="flex flex-col h-full bg-white overflow-hidden">
        <div className="px-4 py-3 border-b shrink-0">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Weekly Report
          </h2>
        </div>

        <div className="flex-1 overflow-y-auto p-4">

        {loading ? (
          <WeeklyReportSkeleton />
        ) : !reportData ? (
          <div className="text-center py-12 text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="font-medium">No Data This Week</p>
            <p className="text-sm">Complete check-ins to see your weekly report.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Summary Header */}
            <div className="rounded-xl bg-gradient-to-br from-primary to-primary/70 p-4 text-white">
              <h3 className="text-sm font-medium opacity-90 mb-1">This Week</h3>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold">{reportData.totalCheckIns}</div>
                  <div className="text-xs opacity-75">check-ins completed</div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1">
                    <TrendIcon className="h-5 w-5" />
                    <span className="text-lg font-semibold">
                      {reportData.moodTrend.percentage}%
                    </span>
                  </div>
                  <div className="text-xs opacity-75">mood trend</div>
                </div>
              </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 gap-3">
              <MetricCard
                icon={<Smile className="h-4 w-4" />}
                label="Avg Mood"
                value={reportData.averageMood.toFixed(1)}
                color="#22c55e"
              />
              <MetricCard
                icon={<Flame className="h-4 w-4" />}
                label="Avg Craving"
                value={reportData.averageCraving.toFixed(1)}
                color="#f97316"
              />
              <MetricCard
                icon={<AlertCircle className="h-4 w-4" />}
                label="Avg Anxiety"
                value={reportData.averageAnxiety.toFixed(1)}
                color="#ef4444"
              />
              <MetricCard
                icon={<Moon className="h-4 w-4" />}
                label="Avg Sleep"
                value={reportData.averageSleep.toFixed(1)}
                color="#6366f1"
              />
            </div>

            {/* Overall Day */}
            <div className="rounded-xl border bg-muted/30 p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-amber-500" />
                  <span className="text-sm font-medium">Overall Day Average</span>
                </div>
                <span className="text-lg font-bold text-amber-500">
                  {reportData.averageOverallDay.toFixed(1)}/10
                </span>
              </div>
              <Progress value={reportData.averageOverallDay * 10} className="h-2" />
            </div>

            {/* Reflections */}
            <div className="rounded-xl border bg-muted/30 p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Reflections Completed</span>
              </div>
              <div className="text-2xl font-bold text-primary">
                {reportData.totalReflections}/7
              </div>
              <Progress value={(reportData.totalReflections / 7) * 100} className="h-2 mt-2" />
            </div>

            {/* Gratitudes */}
            {reportData.gratitudes.length > 0 && (
              <div className="rounded-xl border bg-green-50 p-4">
                <h4 className="text-sm font-semibold text-green-700 mb-2">
                  This Week's Gratitudes
                </h4>
                <div className="space-y-2">
                  {reportData.gratitudes.map((g, i) => (
                    <p key={i} className="text-sm text-green-600 line-clamp-2">
                      "{g}"
                    </p>
                  ))}
                </div>
              </div>
            )}
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

// =============================================================================
// SUB-COMPONENTS
// =============================================================================

function MetricCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode
  label: string
  value: string
  color: string
}) {
  return (
    <div className="rounded-xl border bg-white p-3 text-center">
      <div
        className="flex items-center justify-center gap-1 mb-1"
        style={{ color }}
      >
        {icon}
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
      </div>
      <div className="text-2xl font-bold" style={{ color }}>
        {value}
      </div>
    </div>
  )
}

export default WeeklyReportModal
