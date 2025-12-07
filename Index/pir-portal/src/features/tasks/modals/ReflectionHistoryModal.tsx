import {
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { MessageCircle, X, Loader2, Calendar, Share2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { useReflections, formatDateTime, getDateString } from '../hooks/useTasksModalData'

// =============================================================================
// TYPES
// =============================================================================

export interface ReflectionHistoryModalProps {
  onClose: () => void
}

// =============================================================================
// COMPONENT
// =============================================================================

export function ReflectionHistoryModal({ onClose }: ReflectionHistoryModalProps) {
  const isMobile = useMediaQuery('(max-width: 768px)')
  const { reflections, loading } = useReflections()

  // Calculate stats
  const thisWeek = new Date()
  thisWeek.setDate(thisWeek.getDate() - 7)

  const thisMonth = new Date()
  thisMonth.setMonth(thisMonth.getMonth() - 1)

  const weekReflections = reflections.filter((r) => {
    const date = r.createdAt instanceof Date ? r.createdAt : r.createdAt.toDate()
    return date >= thisWeek
  })

  const monthReflections = reflections.filter((r) => {
    const date = r.createdAt instanceof Date ? r.createdAt : r.createdAt.toDate()
    return date >= thisMonth
  })

  // Group reflections by date
  const groupedReflections = reflections.reduce((acc, reflection) => {
    const date =
      reflection.createdAt instanceof Date
        ? reflection.createdAt
        : reflection.createdAt.toDate()
    const dateKey = getDateString(date)

    if (!acc[dateKey]) {
      acc[dateKey] = []
    }
    acc[dateKey].push(reflection)
    return acc
  }, {} as Record<string, typeof reflections>)

  const sortedDates = Object.keys(groupedReflections).sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime()
  )

  if (loading) {
    return (
      <DialogContent className="max-w-[95vw] sm:max-w-[550px]">
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-teal-500" />
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
            <MessageCircle className="h-5 w-5 text-blue-600" />
            Reflection History
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
            <div className="bg-blue-50 rounded-lg p-3 text-center border border-blue-100">
              <p className="text-xl font-bold text-blue-600">{reflections.length}</p>
              <p className="text-xs text-muted-foreground">All Time</p>
            </div>
            <div className="bg-purple-50 rounded-lg p-3 text-center border border-purple-100">
              <p className="text-xl font-bold text-purple-600">{monthReflections.length}</p>
              <p className="text-xs text-muted-foreground">This Month</p>
            </div>
            <div className="bg-teal-50 rounded-lg p-3 text-center border border-teal-100">
              <p className="text-xl font-bold text-teal-600">{weekReflections.length}</p>
              <p className="text-xs text-muted-foreground">This Week</p>
            </div>
          </div>

          {/* Reflections List */}
          {sortedDates.length === 0 ? (
            <div className="text-center py-10">
              <MessageCircle className="h-12 w-12 mx-auto text-gray-300 mb-3" />
              <h3 className="font-semibold text-foreground mb-1">No Reflections Yet</h3>
              <p className="text-sm text-muted-foreground">
                Start capturing your thoughts and feelings.
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              {sortedDates.slice(0, 15).map((dateKey) => {
                const dateReflections = groupedReflections[dateKey]
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
                      <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">
                        {dateReflections.length}
                      </span>
                    </div>

                    <div className="space-y-2 ml-6">
                      {dateReflections.map((reflection) => (
                        <div
                          key={reflection.id}
                          className="p-3 bg-gray-50 rounded-lg border border-gray-100"
                        >
                          <p className="text-sm text-foreground leading-relaxed">
                            {reflection.text}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-xs text-muted-foreground">
                              {formatDateTime(reflection.createdAt)}
                            </span>
                            {reflection.sharedToCommunity && (
                              <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded flex items-center gap-1">
                                <Share2 className="h-2.5 w-2.5" />
                                Shared
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {sortedDates.length > 15 && (
            <p className="text-sm text-center text-muted-foreground">
              Showing most recent 15 days
            </p>
          )}
        </div>
      </ScrollArea>
    </DialogContent>
  )
}

export default ReflectionHistoryModal
