import { useMemo } from 'react'
import { Calendar } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { CheckIn } from '../types'

// =============================================================================
// TYPES
// =============================================================================

export interface CalendarHeatmapPreviewProps {
  checkIns: CheckIn[]
  onClick?: () => void
  className?: string
}

// =============================================================================
// HELPERS
// =============================================================================

function getMoodColor(mood: number | null): string {
  if (mood === null) return '#e5e7eb'
  if (mood <= 2) return '#ef4444'
  if (mood <= 4) return '#f97316'
  if (mood <= 6) return '#eab308'
  if (mood <= 8) return '#84cc16'
  return '#22c55e'
}

// =============================================================================
// COMPONENT
// =============================================================================

export function CalendarHeatmapPreview({
  checkIns,
  onClick,
  className,
}: CalendarHeatmapPreviewProps) {
  // Get last 7 days of data
  const weekData = useMemo(() => {
    const days: Array<{ date: Date; mood: number | null; hasData: boolean }> = []

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

      const moodAverage =
        moodValues.length > 0
          ? moodValues.reduce((a, b) => a + b, 0) / moodValues.length
          : null

      days.push({
        date,
        mood: moodAverage,
        hasData: dayCheckIns.length > 0,
      })
    }

    return days
  }, [checkIns])

  // Calculate stats
  const stats = useMemo(() => {
    const daysWithData = weekData.filter((d) => d.hasData).length
    const moods = weekData
      .map((d) => d.mood)
      .filter((m): m is number => m !== null)
    const avgMood =
      moods.length > 0 ? moods.reduce((a, b) => a + b, 0) / moods.length : null

    return { daysWithData, avgMood }
  }, [weekData])

  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full rounded-xl border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10 p-4',
        'transition-all hover:border-primary/40 hover:shadow-md',
        'focus:outline-none focus:ring-2 focus:ring-primary/50',
        className
      )}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20">
            <Calendar className="h-4 w-4 text-primary" />
          </div>
          <span className="font-semibold text-foreground">Check-In Calendar</span>
        </div>
        <span className="text-xs text-muted-foreground">Last 7 days</span>
      </div>

      {/* Mini Heatmap Row */}
      <div className="flex items-center justify-between gap-1 mb-3">
        {weekData.map((day, idx) => (
          <div key={idx} className="flex flex-col items-center">
            <div
              className="h-6 w-6 rounded-md transition-transform hover:scale-110"
              style={{ backgroundColor: getMoodColor(day.mood) }}
              title={`${day.date.toLocaleDateString('en-US', { weekday: 'short' })}: ${day.mood?.toFixed(1) || 'No data'}`}
            />
            <span className="mt-1 text-xs text-muted-foreground">
              {day.date.toLocaleDateString('en-US', { weekday: 'narrow' })}
            </span>
          </div>
        ))}
      </div>

      {/* Stats */}
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">
          {stats.daysWithData}/7 days tracked
        </span>
        {stats.avgMood !== null && (
          <span className="font-medium text-primary">
            Avg: {stats.avgMood.toFixed(1)}
          </span>
        )}
      </div>
    </button>
  )
}

export default CalendarHeatmapPreview
