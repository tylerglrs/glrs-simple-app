/**
 * AlertCalendar Component
 * Phase 8E: Admin Crisis Dashboard
 *
 * Monthly calendar view for crisis alerts:
 * - Monthly grid with navigation
 * - Color dots indicating alert tiers
 * - Click date to filter/select
 * - Selected date shows alert summary below
 */

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  AlertOctagon,
  AlertCircle,
  Bell,
} from 'lucide-react'
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  isSameMonth,
  addMonths,
  subMonths,
  getDay,
  isToday,
} from 'date-fns'
import { cn } from '@/lib/utils'
import type { CrisisAlert, AlertCalendarProps, AlertTier } from '../types'

// Tier colors for dots
const tierDotColors: Record<AlertTier, string> = {
  1: 'bg-red-500',
  2: 'bg-orange-500',
  3: 'bg-yellow-500',
  4: 'bg-blue-500',
}

const tierLabels: Record<AlertTier, string> = {
  1: 'Critical',
  2: 'High',
  3: 'Moderate',
  4: 'Standard',
}

const tierIcons: Record<AlertTier, React.ReactNode> = {
  1: <AlertOctagon className="h-3 w-3" />,
  2: <AlertTriangle className="h-3 w-3" />,
  3: <AlertCircle className="h-3 w-3" />,
  4: <Bell className="h-3 w-3" />,
}

export function AlertCalendar({
  alerts,
  onDateSelect,
  selectedDate,
}: AlertCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())

  // Group alerts by date
  const alertsByDate = useMemo(() => {
    const grouped: Record<string, CrisisAlert[]> = {}
    alerts.forEach((alert) => {
      const date = alert.createdAt?.toDate?.()
      if (date) {
        const key = format(date, 'yyyy-MM-dd')
        if (!grouped[key]) {
          grouped[key] = []
        }
        grouped[key].push(alert)
      }
    })
    return grouped
  }, [alerts])

  // Get days in current month view
  const calendarDays = useMemo(() => {
    const start = startOfMonth(currentMonth)
    const end = endOfMonth(currentMonth)
    const days = eachDayOfInterval({ start, end })

    // Add padding for days before first of month
    const startPadding = getDay(start)
    const paddingDays = Array(startPadding).fill(null)

    return [...paddingDays, ...days]
  }, [currentMonth])

  // Get alerts for selected date
  const selectedDateAlerts = useMemo(() => {
    if (!selectedDate) return []
    const key = format(selectedDate, 'yyyy-MM-dd')
    return alertsByDate[key] || []
  }, [selectedDate, alertsByDate])

  const goToPreviousMonth = () => setCurrentMonth(subMonths(currentMonth, 1))
  const goToNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1))
  const goToToday = () => {
    setCurrentMonth(new Date())
    onDateSelect(new Date())
  }

  const handleDateClick = (date: Date) => {
    onDateSelect(date)
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold">
              Calendar View
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={goToToday}>
                Today
              </Button>
              <Button variant="outline" size="icon" onClick={goToPreviousMonth}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm font-medium min-w-[120px] text-center">
                {format(currentMonth, 'MMMM yyyy')}
              </span>
              <Button variant="outline" size="icon" onClick={goToNextMonth}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div
                key={day}
                className="text-center text-xs font-medium text-gray-500 py-2"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day, index) => {
              if (!day) {
                return <div key={`empty-${index}`} className="h-16" />
              }

              const dateKey = format(day, 'yyyy-MM-dd')
              const dayAlerts = alertsByDate[dateKey] || []
              const isSelected = selectedDate && isSameDay(day, selectedDate)
              const isCurrentMonth = isSameMonth(day, currentMonth)
              const isCurrentDay = isToday(day)

              // Group alerts by tier for this day
              const tierCounts: Record<AlertTier, number> = {
                1: 0,
                2: 0,
                3: 0,
                4: 0,
              }
              dayAlerts.forEach((alert) => {
                tierCounts[alert.tier]++
              })

              return (
                <button
                  key={dateKey}
                  onClick={() => handleDateClick(day)}
                  className={cn(
                    'h-16 p-1 rounded-lg transition-colors flex flex-col items-center',
                    'hover:bg-gray-100',
                    !isCurrentMonth && 'opacity-40',
                    isSelected && 'bg-teal-50 ring-2 ring-teal-500',
                    isCurrentDay && !isSelected && 'bg-blue-50'
                  )}
                >
                  <span
                    className={cn(
                      'text-sm font-medium mb-1',
                      isCurrentDay && 'text-blue-600',
                      isSelected && 'text-teal-700'
                    )}
                  >
                    {format(day, 'd')}
                  </span>

                  {/* Alert tier dots */}
                  {dayAlerts.length > 0 && (
                    <div className="flex flex-wrap justify-center gap-0.5 max-w-full">
                      {(Object.keys(tierCounts) as unknown as AlertTier[]).map(
                        (tier) => {
                          const count = tierCounts[tier]
                          if (count === 0) return null
                          return (
                            <div
                              key={tier}
                              className={cn(
                                'w-2 h-2 rounded-full',
                                tierDotColors[tier]
                              )}
                              title={`${count} ${tierLabels[tier]}`}
                            />
                          )
                        }
                      )}
                    </div>
                  )}
                </button>
              )
            })}
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center gap-4 mt-4 pt-4 border-t">
            {([1, 2, 3, 4] as AlertTier[]).map((tier) => (
              <div key={tier} className="flex items-center gap-1.5">
                <div className={cn('w-2 h-2 rounded-full', tierDotColors[tier])} />
                <span className="text-xs text-gray-500">{tierLabels[tier]}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Selected date details */}
      {selectedDate && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              {format(selectedDate, 'EEEE, MMMM d, yyyy')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedDateAlerts.length === 0 ? (
              <p className="text-sm text-gray-500">No alerts on this day.</p>
            ) : (
              <div className="space-y-2">
                <p className="text-sm text-gray-500 mb-3">
                  {selectedDateAlerts.length} alert
                  {selectedDateAlerts.length !== 1 ? 's' : ''} on this day:
                </p>
                {selectedDateAlerts.slice(0, 5).map((alert) => (
                  <div
                    key={alert.id}
                    className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg"
                  >
                    <div
                      className={cn(
                        'p-1.5 rounded',
                        alert.tier === 1 && 'bg-red-100 text-red-600',
                        alert.tier === 2 && 'bg-orange-100 text-orange-600',
                        alert.tier === 3 && 'bg-yellow-100 text-yellow-600',
                        alert.tier === 4 && 'bg-blue-100 text-blue-600'
                      )}
                    >
                      {tierIcons[alert.tier]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium truncate">
                          {alert.pirName}
                        </span>
                        <Badge variant="secondary" className="text-xs">
                          {alert.source.toUpperCase()}
                        </Badge>
                      </div>
                      <span className="text-xs text-gray-500">
                        {alert.createdAt?.toDate?.()
                          ? format(alert.createdAt.toDate(), 'h:mm a')
                          : ''}
                        {' - '}
                        {alert.status}
                      </span>
                    </div>
                  </div>
                ))}
                {selectedDateAlerts.length > 5 && (
                  <p className="text-xs text-gray-400 text-center pt-2">
                    +{selectedDateAlerts.length - 5} more alerts
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default AlertCalendar
