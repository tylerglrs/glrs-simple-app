import { useState, useMemo, useCallback } from 'react'
import { ChevronLeft, ChevronRight, Info } from 'lucide-react'
import { Calendar } from '@/components/ui/calendar'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { CheckIn, CalendarDayData } from '../types'

// =============================================================================
// TYPES
// =============================================================================

export interface CalendarHeatmapProps {
  checkIns: CheckIn[]
  onDayClick?: (date: Date, data: CalendarDayData) => void
  className?: string
}

// =============================================================================
// HELPERS
// =============================================================================

function getMoodColor(mood: number | null): string {
  if (mood === null) return '#e5e7eb' // gray-200
  if (mood <= 2) return '#ef4444' // red-500
  if (mood <= 4) return '#f97316' // orange-500
  if (mood <= 6) return '#eab308' // yellow-500
  if (mood <= 8) return '#84cc16' // lime-500
  return '#22c55e' // green-500
}

function getMoodLabel(mood: number | null): string {
  if (mood === null) return 'No data'
  if (mood <= 2) return 'Very Low'
  if (mood <= 4) return 'Low'
  if (mood <= 6) return 'Moderate'
  if (mood <= 8) return 'Good'
  return 'Excellent'
}

// =============================================================================
// COMPONENT
// =============================================================================

export function CalendarHeatmap({
  checkIns,
  onDayClick,
  className,
}: CalendarHeatmapProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  // Process check-ins into a map by date string
  const checkInsByDate = useMemo(() => {
    const map = new Map<string, CheckIn[]>()

    checkIns.forEach((checkIn) => {
      const date = checkIn.createdAt?.toDate?.() || new Date()
      const dateString = date.toISOString().split('T')[0]

      if (!map.has(dateString)) {
        map.set(dateString, [])
      }
      map.get(dateString)!.push(checkIn)
    })

    return map
  }, [checkIns])

  // Get data for a specific date
  const getDateData = useCallback(
    (date: Date): CalendarDayData => {
      const dateString = date.toISOString().split('T')[0]
      const dayCheckIns = checkInsByDate.get(dateString) || []

      // Calculate mood average from morning data
      const moodValues = dayCheckIns
        .map((ci) => ci.morningData?.mood)
        .filter((m): m is number => m !== undefined && m !== null)

      const moodAverage =
        moodValues.length > 0
          ? moodValues.reduce((a, b) => a + b, 0) / moodValues.length
          : null

      return {
        date,
        checkIns: dayCheckIns,
        moodAverage,
        hasData: dayCheckIns.length > 0,
        color: getMoodColor(moodAverage),
      }
    },
    [checkInsByDate]
  )

  // Handle day click
  const handleDayClick = useCallback(
    (date: Date) => {
      setSelectedDate(date)
      const data = getDateData(date)
      onDayClick?.(date, data)
    },
    [getDateData, onDayClick]
  )

  // Navigation
  const goToPreviousMonth = () => {
    setCurrentMonth((prev) => {
      const newDate = new Date(prev)
      newDate.setMonth(newDate.getMonth() - 1)
      return newDate
    })
  }

  const goToNextMonth = () => {
    const today = new Date()
    setCurrentMonth((prev) => {
      const newDate = new Date(prev)
      newDate.setMonth(newDate.getMonth() + 1)
      // Don't go past current month
      if (
        newDate.getFullYear() > today.getFullYear() ||
        (newDate.getFullYear() === today.getFullYear() &&
          newDate.getMonth() > today.getMonth())
      ) {
        return prev
      }
      return newDate
    })
  }

  const isCurrentMonth = () => {
    const today = new Date()
    return (
      currentMonth.getFullYear() === today.getFullYear() &&
      currentMonth.getMonth() === today.getMonth()
    )
  }

  // Custom day renderer with mood color
  const modifiers = useMemo(() => {
    const modifiersObj: Record<string, Date[]> = {
      hasData: [],
      noData: [],
      veryLow: [],
      low: [],
      moderate: [],
      good: [],
      excellent: [],
    }

    // Get all days in current month
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    const daysInMonth = new Date(year, month + 1, 0).getDate()

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day)
      const data = getDateData(date)

      if (data.hasData) {
        modifiersObj.hasData.push(date)
        if (data.moodAverage !== null) {
          if (data.moodAverage <= 2) modifiersObj.veryLow.push(date)
          else if (data.moodAverage <= 4) modifiersObj.low.push(date)
          else if (data.moodAverage <= 6) modifiersObj.moderate.push(date)
          else if (data.moodAverage <= 8) modifiersObj.good.push(date)
          else modifiersObj.excellent.push(date)
        }
      } else {
        modifiersObj.noData.push(date)
      }
    }

    return modifiersObj
  }, [currentMonth, getDateData])

  const modifiersStyles = {
    veryLow: { backgroundColor: '#fecaca', color: '#991b1b' },
    low: { backgroundColor: '#fed7aa', color: '#9a3412' },
    moderate: { backgroundColor: '#fef08a', color: '#854d0e' },
    good: { backgroundColor: '#d9f99d', color: '#3f6212' },
    excellent: { backgroundColor: '#bbf7d0', color: '#166534' },
    noData: { backgroundColor: '#f3f4f6', color: '#6b7280' },
  }

  // Selected date info
  const selectedData = selectedDate ? getDateData(selectedDate) : null

  return (
    <div className={cn('space-y-4', className)}>
      {/* Header with Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={goToPreviousMonth}
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Button>

        <h3 className="text-lg font-semibold">
          {currentMonth.toLocaleDateString('en-US', {
            month: 'long',
            year: 'numeric',
          })}
        </h3>

        <Button
          variant="outline"
          size="sm"
          onClick={goToNextMonth}
          disabled={isCurrentMonth()}
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Calendar */}
      <Calendar
        mode="single"
        selected={selectedDate || undefined}
        onSelect={(date) => date && handleDayClick(date)}
        month={currentMonth}
        onMonthChange={setCurrentMonth}
        modifiers={modifiers}
        modifiersStyles={modifiersStyles}
        className="rounded-xl border p-3"
      />

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-center gap-2 text-xs">
        <div className="flex items-center gap-1">
          <div className="h-3 w-3 rounded" style={{ backgroundColor: '#ef4444' }} />
          <span>1-2</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="h-3 w-3 rounded" style={{ backgroundColor: '#f97316' }} />
          <span>3-4</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="h-3 w-3 rounded" style={{ backgroundColor: '#eab308' }} />
          <span>5-6</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="h-3 w-3 rounded" style={{ backgroundColor: '#84cc16' }} />
          <span>7-8</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="h-3 w-3 rounded" style={{ backgroundColor: '#22c55e' }} />
          <span>9-10</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="h-3 w-3 rounded" style={{ backgroundColor: '#e5e7eb' }} />
          <span>No data</span>
        </div>
      </div>

      {/* Selected Date Details */}
      {selectedData && (
        <div className="rounded-xl border bg-muted/30 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Info className="h-4 w-4 text-primary" />
            <h4 className="font-semibold">
              {selectedDate?.toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
              })}
            </h4>
          </div>

          {selectedData.hasData ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Mood Average</span>
                <span
                  className="font-bold px-2 py-1 rounded"
                  style={{
                    backgroundColor: selectedData.color,
                    color: selectedData.moodAverage && selectedData.moodAverage > 6 ? '#166534' : '#991b1b',
                  }}
                >
                  {selectedData.moodAverage?.toFixed(1) || '-'} - {getMoodLabel(selectedData.moodAverage)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Check-ins</span>
                <span className="font-medium">{selectedData.checkIns.length}</span>
              </div>
              {selectedData.checkIns.map((ci, idx) => (
                <div key={ci.id || idx} className="text-xs text-muted-foreground pl-4">
                  {ci.morningData && `Morning: Mood ${ci.morningData.mood}`}
                  {ci.eveningData && ` | Evening: Day ${ci.eveningData.overallDay}`}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No check-in data for this day</p>
          )}
        </div>
      )}
    </div>
  )
}

export default CalendarHeatmap
