import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  Heart,
  CheckCircle2,
  Circle,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { useActivityData, type DayActivity } from '../hooks/useActivityData'
import { haptics } from '@/lib/animations'

// =============================================================================
// TYPES
// =============================================================================

interface ActivityCalendarProps {
  onSelectDay?: (date: string, activity: DayActivity) => void
  className?: string
}

// =============================================================================
// HELPERS
// =============================================================================

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

function getCalendarDays(month: Date): (Date | null)[] {
  const year = month.getFullYear()
  const monthIndex = month.getMonth()

  // First day of the month
  const firstDay = new Date(year, monthIndex, 1)
  const startingDayOfWeek = firstDay.getDay()

  // Last day of the month
  const lastDay = new Date(year, monthIndex + 1, 0)
  const totalDays = lastDay.getDate()

  const days: (Date | null)[] = []

  // Add empty slots for days before the first day
  for (let i = 0; i < startingDayOfWeek; i++) {
    days.push(null)
  }

  // Add all days of the month
  for (let day = 1; day <= totalDays; day++) {
    days.push(new Date(year, monthIndex, day))
  }

  return days
}

function formatDateString(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

function isToday(date: Date): boolean {
  const today = new Date()
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  )
}

function isFuture(date: Date): boolean {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return date > today
}

// =============================================================================
// DAY CELL COMPONENT
// =============================================================================

interface DayCellProps {
  date: Date
  activity: DayActivity | null
  isCurrentMonth: boolean
  onClick: () => void
}

function DayCell({ date, activity, isCurrentMonth, onClick }: DayCellProps) {
  const isMobile = useMediaQuery('(max-width: 768px)')
  const today = isToday(date)
  const future = isFuture(date)

  const hasMorning = activity?.morningCheckIn !== null
  const hasEvening = activity?.eveningReflection !== null
  const completedHabits = activity?.habits.filter((h) => h.completed).length ?? 0
  const totalHabits = activity?.habits.length ?? 0
  const hasGratitude = (activity?.gratitudes.length ?? 0) > 0

  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={() => {
        if (!future) {
          haptics.tap()
          onClick()
        }
      }}
      disabled={future}
      className={cn(
        'relative flex flex-col items-center justify-start',
        'rounded-lg transition-all duration-200',
        isMobile ? 'p-1 min-h-[52px]' : 'p-1.5 min-h-[60px]',
        !isCurrentMonth && 'opacity-30',
        future && 'opacity-40 cursor-not-allowed',
        today && 'bg-teal-50 ring-2 ring-teal-500',
        !today && !future && isCurrentMonth && 'hover:bg-slate-50 cursor-pointer',
        activity?.hasActivity && !today && 'bg-slate-50/50'
      )}
    >
      {/* Date Number */}
      <span
        className={cn(
          'text-sm font-medium mb-0.5',
          today ? 'text-teal-600 font-bold' : 'text-slate-700',
          !isCurrentMonth && 'text-slate-400',
          future && 'text-slate-300'
        )}
      >
        {date.getDate()}
      </span>

      {/* Activity Indicators */}
      {!future && isCurrentMonth && activity?.hasActivity && (
        <div className="flex flex-wrap justify-center gap-0.5">
          {/* Morning Check-in */}
          {hasMorning && (
            <div className="w-3.5 h-3.5 rounded-full bg-amber-100 flex items-center justify-center">
              <Sun className="h-2 w-2 text-amber-600" />
            </div>
          )}

          {/* Evening Reflection */}
          {hasEvening && (
            <div className="w-3.5 h-3.5 rounded-full bg-indigo-100 flex items-center justify-center">
              <Moon className="h-2 w-2 text-indigo-600" />
            </div>
          )}

          {/* Habits Indicator */}
          {totalHabits > 0 && (
            <div className="flex items-center gap-px">
              {completedHabits > 0 ? (
                <div className="w-3.5 h-3.5 rounded-full bg-emerald-100 flex items-center justify-center">
                  <CheckCircle2 className="h-2 w-2 text-emerald-600" />
                </div>
              ) : (
                <div className="w-3.5 h-3.5 rounded-full bg-slate-100 flex items-center justify-center">
                  <Circle className="h-2 w-2 text-slate-400" />
                </div>
              )}
            </div>
          )}

          {/* Gratitude */}
          {hasGratitude && (
            <div className="w-3.5 h-3.5 rounded-full bg-rose-100 flex items-center justify-center">
              <Heart className="h-2 w-2 text-rose-500" />
            </div>
          )}
        </div>
      )}
    </motion.button>
  )
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function ActivityCalendar({ onSelectDay, className }: ActivityCalendarProps) {
  const isMobile = useMediaQuery('(max-width: 768px)')
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const { activityByDate, loading } = useActivityData(currentMonth)

  const calendarDays = useMemo(() => getCalendarDays(currentMonth), [currentMonth])

  const handlePrevMonth = () => {
    haptics.tap()
    setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))
  }

  const handleNextMonth = () => {
    haptics.tap()
    const next = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)
    const today = new Date()
    // Don't go past current month
    if (next <= new Date(today.getFullYear(), today.getMonth() + 1, 0)) {
      setCurrentMonth(next)
    }
  }

  const handleDayClick = (date: Date) => {
    const dateStr = formatDateString(date)
    const activity = activityByDate.get(dateStr)
    if (activity) {
      onSelectDay?.(dateStr, activity)
    }
  }

  const isNextDisabled = useMemo(() => {
    const today = new Date()
    const nextMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)
    return nextMonth > new Date(today.getFullYear(), today.getMonth() + 1, 0)
  }, [currentMonth])

  if (loading) {
    return (
      <div className={cn('mb-4', className)}>
        <div className="flex items-center gap-2 mb-3">
          <CalendarDays className="h-5 w-5 text-teal-500" />
          <h2 className={cn('font-bold text-slate-900', isMobile ? 'text-base' : 'text-lg')}>
            Activity Calendar
          </h2>
        </div>
        <Card className="overflow-hidden">
          <CardContent className="p-4">
            <div className="h-64 bg-slate-100 rounded-lg animate-pulse" />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35 }}
      className={cn('mb-4', className)}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <CalendarDays className="h-5 w-5 text-teal-500" />
          <h2 className={cn('font-bold text-slate-900', isMobile ? 'text-base' : 'text-lg')}>
            Activity Calendar
          </h2>
        </div>
      </div>

      {/* Calendar Card */}
      <Card className="overflow-hidden border-slate-200">
        <CardContent className={cn('p-3', isMobile && 'p-2')}>
          {/* Month Navigation */}
          <div className="flex items-center justify-between mb-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={handlePrevMonth}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h3 className="font-semibold text-slate-900">
              {MONTHS[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleNextMonth}
              disabled={isNextDisabled}
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Days of Week Header */}
          <div className="grid grid-cols-7 gap-1 mb-1">
            {DAYS_OF_WEEK.map((day) => (
              <div
                key={day}
                className="text-center text-xs font-medium text-slate-500 py-1"
              >
                {isMobile ? day.charAt(0) : day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((date, index) => {
              if (!date) {
                return <div key={`empty-${index}`} className="min-h-[52px]" />
              }

              const dateStr = formatDateString(date)
              const activity = activityByDate.get(dateStr) || null

              return (
                <DayCell
                  key={dateStr}
                  date={date}
                  activity={activity}
                  isCurrentMonth={date.getMonth() === currentMonth.getMonth()}
                  onClick={() => handleDayClick(date)}
                />
              )
            })}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap items-center justify-center gap-3 mt-3 pt-3 border-t border-slate-100">
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-4 rounded-full bg-amber-100 flex items-center justify-center">
                <Sun className="h-2.5 w-2.5 text-amber-600" />
              </div>
              <span className="text-xs text-slate-500">Check-In</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-4 rounded-full bg-indigo-100 flex items-center justify-center">
                <Moon className="h-2.5 w-2.5 text-indigo-600" />
              </div>
              <span className="text-xs text-slate-500">Reflection</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-4 rounded-full bg-emerald-100 flex items-center justify-center">
                <CheckCircle2 className="h-2.5 w-2.5 text-emerald-600" />
              </div>
              <span className="text-xs text-slate-500">Habits</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-4 rounded-full bg-rose-100 flex items-center justify-center">
                <Heart className="h-2.5 w-2.5 text-rose-500" />
              </div>
              <span className="text-xs text-slate-500">Gratitude</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export default ActivityCalendar
