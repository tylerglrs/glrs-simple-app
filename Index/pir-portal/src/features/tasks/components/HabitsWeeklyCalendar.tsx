import { useCallback, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import useEmblaCarousel from 'embla-carousel-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Repeat,
  ChevronRight,
  CheckCircle2,
  Circle,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { useHabitsForWeek, type DayHabits } from '../hooks/useHabitsForWeek'
import { haptics } from '@/lib/animations'

// =============================================================================
// TYPES
// =============================================================================

interface HabitsWeeklyCalendarProps {
  onSelectDay?: (day: DayHabits) => void
  className?: string
}

// =============================================================================
// DAY CARD COMPONENT
// =============================================================================

interface DayCardProps {
  day: DayHabits
  isSelected: boolean
  onSelect: () => void
}

function DayCard({ day, isSelected, onSelect }: DayCardProps) {
  const isMobile = useMediaQuery('(max-width: 768px)')
  const hasHabits = day.habits.length > 0
  const allComplete = day.completedCount === day.totalCount && day.totalCount > 0

  return (
    <motion.div
      whileTap={{ scale: 0.98 }}
      className="flex-shrink-0"
      style={{ width: isMobile ? '140px' : '160px' }}
    >
      <Card
        className={cn(
          'h-full cursor-pointer transition-all duration-200',
          'border hover:border-emerald-300 hover:shadow-md',
          isSelected && 'border-emerald-500 bg-emerald-50/50 shadow-md',
          day.isToday && !isSelected && 'border-emerald-200 bg-emerald-50/30',
          allComplete && 'ring-2 ring-emerald-400 ring-offset-1'
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
                  day.isToday ? 'text-emerald-600' : 'text-slate-500'
                )}
              >
                {day.isToday ? 'Today' : day.dayName}
              </span>
              <span
                className={cn(
                  'w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold',
                  day.isToday
                    ? 'bg-emerald-500 text-white'
                    : 'bg-slate-100 text-slate-700'
                )}
              >
                {day.dayNumber}
              </span>
            </div>
            {hasHabits && (
              <Badge
                variant="secondary"
                className={cn(
                  'h-5 px-1.5 text-xs font-bold',
                  allComplete
                    ? 'bg-emerald-100 text-emerald-700'
                    : day.isToday
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-slate-100 text-slate-600'
                )}
              >
                {day.completedCount}/{day.totalCount}
              </Badge>
            )}
          </div>

          {/* Habits List */}
          {hasHabits ? (
            <div className="space-y-1.5">
              {day.habits.slice(0, 3).map(({ habit, completed }) => (
                <div
                  key={habit.id}
                  className={cn(
                    'flex items-center gap-2 p-1.5 rounded-lg',
                    'transition-colors',
                    completed
                      ? 'bg-emerald-50 border border-emerald-200'
                      : 'bg-white border border-slate-100'
                  )}
                >
                  {completed ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                  ) : (
                    <Circle className="h-4 w-4 text-slate-300 flex-shrink-0" />
                  )}
                  <span
                    className={cn(
                      'text-xs truncate flex-1',
                      completed
                        ? 'text-emerald-700 line-through'
                        : 'text-slate-700'
                    )}
                  >
                    {habit.name}
                  </span>
                </div>
              ))}
              {day.habits.length > 3 && (
                <div className="text-xs text-slate-400 text-center pt-0.5">
                  +{day.habits.length - 3} more
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-3 text-slate-300">
              <Repeat className="h-5 w-5 mb-1" />
              <span className="text-xs">No habits yet</span>
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

export function HabitsWeeklyCalendar({
  onSelectDay,
  className,
}: HabitsWeeklyCalendarProps) {
  const isMobile = useMediaQuery('(max-width: 768px)')
  const { habitsByDate, habits, loading } = useHabitsForWeek()
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
      onSelectDay?.(habitsByDate[index])
    },
    [habitsByDate, onSelectDay]
  )

  // Don't render if no habits
  if (!loading && habits.length === 0) {
    return null
  }

  if (loading) {
    return (
      <div className={cn('mb-4', className)}>
        <div className="flex items-center gap-2 mb-3">
          <Repeat className="h-5 w-5 text-emerald-500" />
          <h2 className={cn('font-bold text-slate-900', isMobile ? 'text-base' : 'text-lg')}>
            Habits
          </h2>
        </div>
        <div className="flex gap-3 overflow-hidden">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex-shrink-0 w-36 h-32 bg-slate-100 rounded-xl animate-pulse"
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
      transition={{ delay: 0.3 }}
      className={cn('mb-4', className)}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Repeat className="h-5 w-5 text-emerald-500" />
          <h2 className={cn('font-bold text-slate-900', isMobile ? 'text-base' : 'text-lg')}>
            Habits
          </h2>
        </div>
        <span className="text-xs text-slate-500">
          Tap to track
        </span>
      </div>

      {/* Swipeable Calendar */}
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex gap-3">
          {habitsByDate.map((day, index) => (
            <DayCard
              key={day.dateString}
              day={day}
              isSelected={selectedIndex === index}
              onSelect={() => handleDaySelect(index)}
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

export default HabitsWeeklyCalendar
