import {
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Star, X, Loader2, Calendar, Share2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { useWins, formatDateTime, getDateString } from '../hooks/useTasksModalData'

// =============================================================================
// TYPES
// =============================================================================

export interface WinsHistoryModalProps {
  onClose: () => void
}

// =============================================================================
// COMPONENT
// =============================================================================

export function WinsHistoryModal({ onClose }: WinsHistoryModalProps) {
  const isMobile = useMediaQuery('(max-width: 768px)')
  const { allWins, loading } = useWins()

  // Calculate stats
  const thisWeek = new Date()
  thisWeek.setDate(thisWeek.getDate() - 7)

  const thisMonth = new Date()
  thisMonth.setMonth(thisMonth.getMonth() - 1)

  const weekWins = allWins.filter((w) => {
    const date = w.createdAt instanceof Date ? w.createdAt : w.createdAt.toDate()
    return date >= thisWeek
  })

  const monthWins = allWins.filter((w) => {
    const date = w.createdAt instanceof Date ? w.createdAt : w.createdAt.toDate()
    return date >= thisMonth
  })

  // Group wins by date
  const groupedWins = allWins.reduce((acc, win) => {
    const date =
      win.createdAt instanceof Date ? win.createdAt : win.createdAt.toDate()
    const dateKey = getDateString(date)

    if (!acc[dateKey]) {
      acc[dateKey] = []
    }
    acc[dateKey].push(win)
    return acc
  }, {} as Record<string, typeof allWins>)

  const sortedDates = Object.keys(groupedWins).sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime()
  )

  if (loading) {
    return (
      <DialogContent className="max-w-[95vw] sm:max-w-[550px]">
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
        </div>
      </DialogContent>
    )
  }

  return (
    <DialogContent className="max-w-[95vw] sm:max-w-[550px] p-0">
      {/* Header */}
      <DialogHeader className="p-5 pb-4 border-b">
        <div className="flex items-center justify-between">
          <DialogTitle className="flex items-center gap-2 text-lg font-semibold">
            <Star className="h-5 w-5 text-orange-500" />
            Wins History
          </DialogTitle>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
            <X className="h-5 w-5" />
          </Button>
        </div>
      </DialogHeader>

      <ScrollArea className="max-h-[55vh]">
        <div className={cn('p-5 space-y-5', isMobile && 'p-4 space-y-4')}>
          {/* Stats Summary */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-orange-50 rounded-lg p-3 text-center border border-orange-100">
              <p className="text-xl font-bold text-orange-600">{allWins.length}</p>
              <p className="text-xs text-muted-foreground">All Time</p>
            </div>
            <div className="bg-yellow-50 rounded-lg p-3 text-center border border-yellow-100">
              <p className="text-xl font-bold text-yellow-600">{monthWins.length}</p>
              <p className="text-xs text-muted-foreground">This Month</p>
            </div>
            <div className="bg-amber-50 rounded-lg p-3 text-center border border-amber-100">
              <p className="text-xl font-bold text-amber-600">{weekWins.length}</p>
              <p className="text-xs text-muted-foreground">This Week</p>
            </div>
          </div>

          {/* Wins List */}
          {sortedDates.length === 0 ? (
            <div className="text-center py-10">
              <Star className="h-12 w-12 mx-auto text-gray-300 mb-3" />
              <h3 className="font-semibold text-foreground mb-1">No Wins Recorded Yet</h3>
              <p className="text-sm text-muted-foreground">
                Start celebrating your daily victories!
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              {sortedDates.slice(0, 20).map((dateKey) => {
                const dateWins = groupedWins[dateKey]
                const displayDate = new Date(dateKey)
                const isToday = dateKey === getDateString()
                const isYesterday = dateKey === getDateString(new Date(Date.now() - 86400000))

                let dateLabel = displayDate.toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                })
                if (isToday) dateLabel = 'Today'
                if (isYesterday) dateLabel = 'Yesterday'

                return (
                  <div key={dateKey}>
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium text-muted-foreground">
                        {dateLabel}
                      </span>
                      <span className="text-xs bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded">
                        {dateWins.length} {dateWins.length === 1 ? 'win' : 'wins'}
                      </span>
                    </div>

                    <div className="space-y-2 ml-6">
                      {dateWins.map((win) => (
                        <div
                          key={win.id}
                          className="flex items-start gap-3 p-3 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg border border-orange-100"
                        >
                          <Star className="h-4 w-4 text-orange-500 mt-0.5 shrink-0" />
                          <div className="flex-1">
                            <p className="text-sm text-foreground">{win.text}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs text-muted-foreground">
                                {formatDateTime(win.createdAt)}
                              </span>
                              {win.sharedToCommunity && (
                                <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded flex items-center gap-1">
                                  <Share2 className="h-2.5 w-2.5" />
                                  Shared
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {sortedDates.length > 20 && (
            <p className="text-sm text-center text-muted-foreground">
              Showing most recent 20 days
            </p>
          )}

          {/* Encouragement */}
          <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg p-4 border border-orange-100 text-center">
            <span className="text-2xl mb-1 block">🏆</span>
            <p className="text-sm text-orange-800">
              You've recorded {allWins.length} wins! Keep celebrating your progress.
            </p>
          </div>
        </div>
      </ScrollArea>
    </DialogContent>
  )
}

export default WinsHistoryModal
