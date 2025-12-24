import {
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Calendar, CheckCircle, X, Loader2, Sun, Moon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useCheckInStats } from '../hooks/useTasksModalData'

// =============================================================================
// TYPES
// =============================================================================

export interface CheckRateModalProps {
  onClose: () => void
}

// =============================================================================
// COMPONENT
// =============================================================================

export function CheckRateModal({ onClose }: CheckRateModalProps) {
  const { checkIns, weeklyStats, loading } = useCheckInStats()

  // Helper to get date string in local time
  const getLocalDateString = (date: Date): string => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  // Group check-ins by date
  const checkInsByDate = checkIns.reduce((acc, checkIn) => {
    const date = checkIn.createdAt instanceof Date
      ? checkIn.createdAt
      : checkIn.createdAt.toDate()
    // Use local time, not UTC
    const dateKey = getLocalDateString(date)

    if (!acc[dateKey]) {
      acc[dateKey] = { morning: false, evening: false }
    }

    if (checkIn.type === 'morning') {
      acc[dateKey].morning = true
    } else if (checkIn.type === 'evening') {
      acc[dateKey].evening = true
    }

    return acc
  }, {} as Record<string, { morning: boolean; evening: boolean }>)

  // Get last 7 days
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - (6 - i))
    // Use local time, not UTC
    return getLocalDateString(date)
  })

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
            <Calendar className="h-5 w-5 text-blue-600" />
            Check-In Rate
          </DialogTitle>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
            <X className="h-5 w-5" />
          </Button>
        </div>
      </DialogHeader>

      <ScrollArea className="max-h-[60vh]">
        <div className="p-4 space-y-4 sm:p-5 sm:space-y-5">
          {/* Rate Overview */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 text-center border border-blue-100">
            <p className="text-sm text-muted-foreground mb-2">Weekly Check-In Rate</p>
            <p className="text-4xl font-bold text-blue-600 mb-3">
              {weeklyStats.checkRate}%
            </p>
            <Progress value={weeklyStats.checkRate} className="h-2" />
            <p className="text-sm text-muted-foreground mt-2">
              {weeklyStats.totalCheckIns} check-ins this week
            </p>
          </div>

          {/* Daily Breakdown */}
          <div>
            <h3 className="font-semibold text-foreground mb-3">Last 7 Days</h3>
            <div className="space-y-2">
              {last7Days.map((dateKey) => {
                const checkInData = checkInsByDate[dateKey] || { morning: false, evening: false }
                // Parse date string as local time, not UTC
                const [year, month, day] = dateKey.split('-').map(Number)
                const date = new Date(year, month - 1, day) // month is 0-indexed
                const isToday = dateKey === getLocalDateString(new Date())
                const dayName = date.toLocaleDateString('en-US', { weekday: 'short' })
                const dateFormatted = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

                return (
                  <div
                    key={dateKey}
                    className={cn(
                      'flex items-center justify-between p-3 rounded-lg border',
                      isToday ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-100'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-center w-16">
                        <p className={cn(
                          'text-sm font-medium',
                          isToday ? 'text-blue-600' : 'text-foreground'
                        )}>
                          {dayName}
                        </p>
                        <p className="text-xs text-muted-foreground">{dateFormatted}</p>
                      </div>
                      {isToday && (
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                          Today
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Morning Check-in */}
                      <div
                        className={cn(
                          'flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium',
                          checkInData.morning
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-400'
                        )}
                      >
                        <Sun className="h-3 w-3" />
                        {checkInData.morning ? (
                          <CheckCircle className="h-3 w-3" />
                        ) : (
                          <span>-</span>
                        )}
                      </div>

                      {/* Evening Reflection */}
                      <div
                        className={cn(
                          'flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium',
                          checkInData.evening
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-400'
                        )}
                      >
                        <Moon className="h-3 w-3" />
                        {checkInData.evening ? (
                          <CheckCircle className="h-3 w-3" />
                        ) : (
                          <span>-</span>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Tips */}
          <div className="bg-teal-50 rounded-lg p-4 border border-teal-100">
            <h4 className="font-medium text-teal-800 mb-2">Tips for Consistency</h4>
            <ul className="text-sm text-teal-700 space-y-1">
              <li>- Set a reminder for morning and evening check-ins</li>
              <li>- Link check-ins to existing habits (after coffee, before bed)</li>
              <li>- Keep your streak going - even a quick check-in counts!</li>
            </ul>
          </div>
        </div>
      </ScrollArea>
    </DialogContent>
  )
}

export default CheckRateModal
