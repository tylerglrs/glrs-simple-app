import { useState } from 'react'
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { MessageSquare, X, Loader2, Calendar } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { useReflections, formatDateTime, getDateString } from '../hooks/useTasksModalData'

// =============================================================================
// TYPES
// =============================================================================

export interface AllReflectionsModalProps {
  onClose: () => void
}

type FilterPeriod = 'all' | 'week' | 'month'

// =============================================================================
// COMPONENT
// =============================================================================

export function AllReflectionsModal({ onClose }: AllReflectionsModalProps) {
  const isMobile = useMediaQuery('(max-width: 768px)')
  const { reflections, loading } = useReflections()
  const [filterPeriod, setFilterPeriod] = useState<FilterPeriod>('all')

  // Filter reflections by period
  const filteredReflections = reflections.filter((reflection) => {
    const date =
      reflection.createdAt instanceof Date
        ? reflection.createdAt
        : reflection.createdAt.toDate()

    if (filterPeriod === 'week') {
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      return date >= weekAgo
    }

    if (filterPeriod === 'month') {
      const monthAgo = new Date()
      monthAgo.setMonth(monthAgo.getMonth() - 1)
      return date >= monthAgo
    }

    return true
  })

  // Group reflections by date
  const groupedReflections = filteredReflections.reduce((acc, reflection) => {
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
            <MessageSquare className="h-5 w-5 text-teal-600" />
            All Reflections
          </DialogTitle>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Filter Tabs */}
        <div className="pt-3">
          <Tabs
            value={filterPeriod}
            onValueChange={(v) => setFilterPeriod(v as FilterPeriod)}
          >
            <TabsList className="w-full">
              <TabsTrigger value="all" className="flex-1">
                All Time
              </TabsTrigger>
              <TabsTrigger value="month" className="flex-1">
                This Month
              </TabsTrigger>
              <TabsTrigger value="week" className="flex-1">
                This Week
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </DialogHeader>

      <ScrollArea className="max-h-[55vh]">
        <div className={cn('p-5 space-y-5', isMobile && 'p-4 space-y-4')}>
          {/* Stats Summary */}
          <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3 border">
            <span className="text-sm text-muted-foreground">Total Reflections</span>
            <span className="font-semibold text-foreground">{filteredReflections.length}</span>
          </div>

          {/* Reflections List */}
          {sortedDates.length === 0 ? (
            <div className="text-center py-10">
              <MessageSquare className="h-12 w-12 mx-auto text-gray-300 mb-3" />
              <h3 className="font-semibold text-foreground mb-1">No Reflections Yet</h3>
              <p className="text-sm text-muted-foreground">
                Start journaling your thoughts and feelings.
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              {sortedDates.map((dateKey) => {
                const dateReflections = groupedReflections[dateKey]
                const displayDate = new Date(dateKey)
                const isToday = dateKey === getDateString()
                const isYesterday = dateKey === getDateString(new Date(Date.now() - 86400000))

                let dateLabel = displayDate.toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                })
                if (isToday) dateLabel = 'Today'
                if (isYesterday) dateLabel = 'Yesterday'

                return (
                  <div key={dateKey}>
                    <div className="flex items-center gap-2 mb-3">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <h3 className="text-sm font-medium text-muted-foreground">
                        {dateLabel}
                      </h3>
                    </div>

                    <div className="space-y-2">
                      {dateReflections.map((reflection) => (
                        <div
                          key={reflection.id}
                          className="p-3 bg-teal-50 rounded-lg border-l-[3px] border-teal-500"
                        >
                          <p className="text-sm text-foreground leading-relaxed">
                            {reflection.text}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-xs text-muted-foreground">
                              {formatDateTime(reflection.createdAt)}
                            </span>
                            {reflection.sharedToCommunity && (
                              <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded">
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
        </div>
      </ScrollArea>
    </DialogContent>
  )
}

export default AllReflectionsModal
