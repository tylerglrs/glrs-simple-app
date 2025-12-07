import { useCallback, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import useEmblaCarousel from 'embla-carousel-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Calendar,
  ChevronRight,
  BookOpen,
  FileText,
  Dumbbell,
  Brain,
  ClipboardList,
  AlertCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { useAssignmentsByDate, type AssignmentsByDate } from '../hooks/useAssignmentsByDate'
import { haptics } from '@/lib/animations'
import type { Assignment } from '@/types/firebase'

// =============================================================================
// TYPES
// =============================================================================

interface AssignmentCalendarProps {
  onSelectDay?: (day: AssignmentsByDate) => void
  onSelectAssignment?: (assignment: Assignment) => void
  className?: string
}

// =============================================================================
// HELPERS
// =============================================================================

const TYPE_ICONS: Record<string, typeof BookOpen> = {
  task: ClipboardList,
  reading: BookOpen,
  exercise: Dumbbell,
  reflection: Brain,
  homework: FileText,
}

function getAssignmentIcon(type: string) {
  return TYPE_ICONS[type] || ClipboardList
}

// =============================================================================
// DAY CARD COMPONENT
// =============================================================================

interface DayCardProps {
  day: AssignmentsByDate
  isSelected: boolean
  onSelect: () => void
  onAssignmentClick?: (assignment: Assignment) => void
}

function DayCard({ day, isSelected, onSelect, onAssignmentClick }: DayCardProps) {
  const isMobile = useMediaQuery('(max-width: 768px)')
  const hasAssignments = day.assignments.length > 0
  const previewAssignments = day.assignments.slice(0, 2)
  const remainingCount = day.assignments.length - 2

  return (
    <motion.div
      whileTap={{ scale: 0.98 }}
      className="flex-shrink-0"
      style={{ width: isMobile ? '160px' : '180px' }}
    >
      <Card
        className={cn(
          'h-full cursor-pointer transition-all duration-200',
          'border hover:border-teal-300 hover:shadow-md',
          isSelected && 'border-teal-500 bg-teal-50/50 shadow-md',
          day.isToday && !isSelected && 'border-teal-200 bg-teal-50/30'
        )}
        onClick={() => {
          haptics.tap()
          onSelect()
        }}
      >
        <CardContent className={cn('p-3', isMobile && 'p-2.5')}>
          {/* Day Header */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  'text-xs font-semibold',
                  day.isToday ? 'text-teal-600' : 'text-slate-500'
                )}
              >
                {day.dayName}
              </span>
              <span
                className={cn(
                  'w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold',
                  day.isToday
                    ? 'bg-teal-500 text-white'
                    : 'bg-slate-100 text-slate-700'
                )}
              >
                {day.dayNumber}
              </span>
            </div>
            {hasAssignments && (
              <Badge
                variant="secondary"
                className={cn(
                  'h-5 px-1.5 text-xs font-bold',
                  day.isToday
                    ? 'bg-teal-100 text-teal-700'
                    : 'bg-slate-100 text-slate-600'
                )}
              >
                {day.assignments.length}
              </Badge>
            )}
          </div>

          {/* Assignment Previews */}
          {hasAssignments ? (
            <div className="space-y-1.5">
              {previewAssignments.map((assignment) => {
                const Icon = getAssignmentIcon(assignment.type)
                return (
                  <div
                    key={assignment.id}
                    className={cn(
                      'flex items-center gap-2 p-1.5 rounded-lg',
                      'bg-white border border-slate-100',
                      'hover:bg-slate-50 transition-colors cursor-pointer'
                    )}
                    onClick={(e) => {
                      e.stopPropagation()
                      haptics.tap()
                      onAssignmentClick?.(assignment)
                    }}
                  >
                    <div
                      className={cn(
                        'w-5 h-5 rounded flex items-center justify-center flex-shrink-0',
                        assignment.priority === 'high'
                          ? 'bg-red-100 text-red-600'
                          : assignment.priority === 'medium'
                          ? 'bg-amber-100 text-amber-600'
                          : 'bg-slate-100 text-slate-500'
                      )}
                    >
                      <Icon className="h-3 w-3" />
                    </div>
                    <span className="text-xs text-slate-700 truncate flex-1">
                      {assignment.title}
                    </span>
                  </div>
                )
              })}
              {remainingCount > 0 && (
                <div className="text-xs text-slate-400 text-center pt-0.5">
                  +{remainingCount} more
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-3 text-slate-300">
              <Calendar className="h-5 w-5 mb-1" />
              <span className="text-xs">No assignments due</span>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function AssignmentCalendar({
  onSelectDay,
  onSelectAssignment,
  className,
}: AssignmentCalendarProps) {
  const isMobile = useMediaQuery('(max-width: 768px)')
  const { assignmentsByDate, overdueAssignments, loading } = useAssignmentsByDate()
  const [selectedIndex, setSelectedIndex] = useState(0)

  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    containScroll: 'trimSnaps',
    dragFree: true,
  })

  const onSelect = useCallback(() => {
    if (!emblaApi) return
    setSelectedIndex(emblaApi.selectedScrollSnap())
  }, [emblaApi])

  useEffect(() => {
    if (!emblaApi) return
    emblaApi.on('select', onSelect)
    return () => {
      emblaApi.off('select', onSelect)
    }
  }, [emblaApi, onSelect])

  const handleDaySelect = useCallback(
    (index: number) => {
      setSelectedIndex(index)
      onSelectDay?.(assignmentsByDate[index])
    },
    [assignmentsByDate, onSelectDay]
  )

  if (loading) {
    return (
      <div className={cn('mb-4', className)}>
        <div className="flex items-center gap-2 mb-3">
          <Calendar className="h-5 w-5 text-teal-500" />
          <h2 className={cn('font-bold text-slate-900', isMobile ? 'text-base' : 'text-lg')}>
            Assignments and Habits
          </h2>
        </div>
        <div className="flex gap-3 overflow-hidden">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex-shrink-0 w-40 h-32 bg-slate-100 rounded-xl animate-pulse"
            />
          ))}
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25 }}
      className={cn('mb-4', className)}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-teal-500" />
          <h2 className={cn('font-bold text-slate-900', isMobile ? 'text-base' : 'text-lg')}>
            Assignments and Habits
          </h2>
        </div>
        {overdueAssignments.length > 0 && (
          <Badge variant="destructive" className="flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            {overdueAssignments.length} overdue
          </Badge>
        )}
      </div>

      {/* Swipeable Calendar */}
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex gap-3">
          {assignmentsByDate.map((day, index) => (
            <DayCard
              key={day.dateString}
              day={day}
              isSelected={selectedIndex === index}
              onSelect={() => handleDaySelect(index)}
              onAssignmentClick={onSelectAssignment}
            />
          ))}
        </div>
      </div>

      {/* Swipe hint */}
      <div className="flex items-center justify-center gap-1 mt-2 text-slate-400">
        <span className="text-xs">Swipe for more</span>
        <ChevronRight className="h-3 w-3" />
      </div>
    </motion.div>
  )
}

export default AssignmentCalendar
