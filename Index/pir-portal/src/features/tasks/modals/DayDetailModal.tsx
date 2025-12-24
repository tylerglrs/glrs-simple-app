import { motion } from 'framer-motion'
import {
  EnhancedDialog,
  EnhancedDialogContent,
} from '@/components/ui/enhanced-dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  CalendarDays,
  X,
  Sun,
  Moon,
  CheckCircle2,
  Circle,
  Heart,
  Frown,
  Meh,
  Smile,
  Loader2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { haptics } from '@/lib/animations'
import { useStatusBarColor } from '@/hooks/useStatusBarColor'
import type { DayActivity, CheckIn, Reflection } from '../hooks/useActivityData'
import { Timestamp } from 'firebase/firestore'

// =============================================================================
// TYPES
// =============================================================================

export interface DayDetailModalProps {
  onClose: () => void
  date?: string
  activity?: DayActivity
}

// =============================================================================
// ANIMATION VARIANTS
// =============================================================================

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.15,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring' as const,
      stiffness: 400,
      damping: 25,
    },
  },
}

// =============================================================================
// HELPERS
// =============================================================================

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + 'T12:00:00')
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

function getMoodIcon(mood: number | undefined | null) {
  if (mood === undefined || mood === null) return null
  if (mood >= 7) return <Smile className="h-4 w-4 text-green-500" />
  if (mood >= 4) return <Meh className="h-4 w-4 text-amber-500" />
  return <Frown className="h-4 w-4 text-red-500" />
}

function getMoodFromCheckIn(checkIn: CheckIn | null): number | null {
  if (!checkIn) return null
  if (checkIn.morningData?.mood !== undefined && checkIn.morningData?.mood !== null) {
    return checkIn.morningData.mood
  }
  if (checkIn.mood !== undefined) return checkIn.mood
  return null
}

function getAnxietyFromCheckIn(checkIn: CheckIn | null): number | null {
  if (!checkIn) return null
  if (checkIn.morningData?.anxiety !== undefined && checkIn.morningData?.anxiety !== null) {
    return checkIn.morningData.anxiety
  }
  if (checkIn.anxiety !== undefined) return checkIn.anxiety
  return null
}

function getCravingFromCheckIn(checkIn: CheckIn | null): number | null {
  if (!checkIn) return null
  if (checkIn.morningData?.craving !== undefined && checkIn.morningData?.craving !== null) {
    return checkIn.morningData.craving
  }
  if (checkIn.craving !== undefined) return checkIn.craving
  return null
}

function getSleepFromCheckIn(checkIn: CheckIn | null): number | null {
  if (!checkIn) return null
  if (checkIn.morningData?.sleep !== undefined && checkIn.morningData?.sleep !== null) {
    return checkIn.morningData.sleep
  }
  if (checkIn.sleep !== undefined) return checkIn.sleep
  return null
}

function getOverallDayFromReflection(reflection: CheckIn | Reflection | null): number | null {
  if (!reflection) return null

  // Check if it's a CheckIn with eveningData
  if ('eveningData' in reflection && reflection.eveningData?.overallDay !== undefined) {
    return reflection.eveningData.overallDay
  }

  // Check if it has overallDay directly
  if ('overallDay' in reflection && reflection.overallDay !== undefined) {
    return reflection.overallDay
  }

  return null
}

function getReflectionText(reflection: CheckIn | Reflection | null): string | null {
  if (!reflection) return null

  // Check if it's a CheckIn with eveningData
  if ('eveningData' in reflection && reflection.eveningData?.promptResponse) {
    return reflection.eveningData.promptResponse
  }

  // Check for gratitude field in Reflection
  if ('gratitude' in reflection && reflection.gratitude) {
    return reflection.gratitude
  }

  return null
}

// =============================================================================
// COMPONENT
// =============================================================================

export function DayDetailModal({ onClose, date, activity }: DayDetailModalProps) {
  const isMobile = useMediaQuery('(max-width: 768px)')

  // Set iOS status bar to match modal header color (teal-500)
  useStatusBarColor('#14B8A6', true)

  // Loading state if no data
  if (!date || !activity) {
    return (
      <EnhancedDialog open onOpenChange={onClose}>
        <EnhancedDialogContent
          variant={isMobile ? 'fullscreen' : 'centered-large'}
          showCloseButton={false}
          className="p-0"
        >
          <div className="flex items-center justify-center h-full min-h-[400px]">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center gap-3"
            >
              <Loader2 className="h-10 w-10 text-teal-500 animate-spin" />
              <p className="text-sm text-muted-foreground">Loading...</p>
            </motion.div>
          </div>
        </EnhancedDialogContent>
      </EnhancedDialog>
    )
  }

  const mood = getMoodFromCheckIn(activity.morningCheckIn)
  const anxiety = getAnxietyFromCheckIn(activity.morningCheckIn)
  const craving = getCravingFromCheckIn(activity.morningCheckIn)
  const sleep = getSleepFromCheckIn(activity.morningCheckIn)
  const overallDay = getOverallDayFromReflection(activity.eveningReflection)
  const reflectionText = getReflectionText(activity.eveningReflection)
  const completedHabits = activity.habits.filter((h) => h.completed).length
  const totalHabits = activity.habits.length

  return (
    <EnhancedDialog open onOpenChange={onClose}>
      <EnhancedDialogContent
        variant={isMobile ? 'fullscreen' : 'centered-large'}
        showCloseButton={false}
        className="p-0 flex flex-col"
      >
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative bg-gradient-to-br from-teal-500 via-cyan-500 to-teal-600 p-6"
        >
          {/* Close button */}
          <button
            onClick={() => {
              haptics.tap()
              onClose()
            }}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors z-10"
          >
            <X className="h-5 w-5 text-white" />
          </button>

          {/* Title */}
          <div className="flex items-center gap-3 relative z-10">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring' as const, stiffness: 400, damping: 15, delay: 0.2 }}
              className="p-3 rounded-xl bg-white/20 backdrop-blur-sm"
            >
              <CalendarDays className="h-7 w-7 text-white" />
            </motion.div>
            <div>
              <h2 className="text-xl font-bold text-white">Day Details</h2>
              <p className="text-white/80 text-sm">{formatDate(date)}</p>
            </div>
          </div>
        </motion.div>

        {/* Content */}
        <ScrollArea className="flex-1">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="p-4 space-y-3 md:p-5 md:space-y-4"
          >
            {/* Morning Check-In Section */}
            <motion.div
              variants={itemVariants}
              className={cn(
                'rounded-xl border-2 p-4',
                activity.morningCheckIn
                  ? 'bg-amber-50 border-amber-200'
                  : 'bg-slate-50 border-slate-200'
              )}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center',
                    activity.morningCheckIn ? 'bg-amber-100' : 'bg-slate-100'
                  )}>
                    <Sun className={cn(
                      'h-4 w-4',
                      activity.morningCheckIn ? 'text-amber-600' : 'text-slate-400'
                    )} />
                  </div>
                  <h3 className="font-semibold text-slate-900">Morning Check-In</h3>
                </div>
                {activity.morningCheckIn ? (
                  <span className="flex items-center gap-1 text-emerald-600 text-sm font-medium">
                    <CheckCircle2 className="h-4 w-4" />
                    Done
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-slate-400 text-sm">
                    <Circle className="h-4 w-4" />
                    Not Done
                  </span>
                )}
              </div>

              {activity.morningCheckIn && (
                <div className="grid grid-cols-2 gap-3">
                  {mood !== null && (
                    <div className="flex items-center gap-2 p-2 bg-white rounded-lg">
                      {getMoodIcon(mood)}
                      <div>
                        <span className="text-xs text-slate-500">Mood</span>
                        <p className="font-semibold text-slate-900">{mood}/10</p>
                      </div>
                    </div>
                  )}
                  {anxiety !== null && (
                    <div className="flex items-center gap-2 p-2 bg-white rounded-lg">
                      <div>
                        <span className="text-xs text-slate-500">Anxiety</span>
                        <p className="font-semibold text-slate-900">{anxiety}/10</p>
                      </div>
                    </div>
                  )}
                  {craving !== null && (
                    <div className="flex items-center gap-2 p-2 bg-white rounded-lg">
                      <div>
                        <span className="text-xs text-slate-500">Craving</span>
                        <p className="font-semibold text-slate-900">{craving}/10</p>
                      </div>
                    </div>
                  )}
                  {sleep !== null && (
                    <div className="flex items-center gap-2 p-2 bg-white rounded-lg">
                      <div>
                        <span className="text-xs text-slate-500">Sleep</span>
                        <p className="font-semibold text-slate-900">{sleep}/10</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </motion.div>

            {/* Evening Reflection Section */}
            <motion.div
              variants={itemVariants}
              className={cn(
                'rounded-xl border-2 p-4',
                activity.eveningReflection
                  ? 'bg-indigo-50 border-indigo-200'
                  : 'bg-slate-50 border-slate-200'
              )}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center',
                    activity.eveningReflection ? 'bg-indigo-100' : 'bg-slate-100'
                  )}>
                    <Moon className={cn(
                      'h-4 w-4',
                      activity.eveningReflection ? 'text-indigo-600' : 'text-slate-400'
                    )} />
                  </div>
                  <h3 className="font-semibold text-slate-900">Evening Reflection</h3>
                </div>
                {activity.eveningReflection ? (
                  <span className="flex items-center gap-1 text-emerald-600 text-sm font-medium">
                    <CheckCircle2 className="h-4 w-4" />
                    Done
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-slate-400 text-sm">
                    <Circle className="h-4 w-4" />
                    Not Done
                  </span>
                )}
              </div>

              {activity.eveningReflection && (
                <div className="space-y-3">
                  {overallDay !== null && (
                    <div className="flex items-center gap-2 p-2 bg-white rounded-lg">
                      {getMoodIcon(overallDay)}
                      <div>
                        <span className="text-xs text-slate-500">Day Rating</span>
                        <p className="font-semibold text-slate-900">{overallDay}/10</p>
                      </div>
                    </div>
                  )}
                  {reflectionText && (
                    <div className="p-3 bg-white rounded-lg">
                      <span className="text-xs text-slate-500 block mb-1">Reflection</span>
                      <p className="text-sm text-slate-700 line-clamp-3">{reflectionText}</p>
                    </div>
                  )}
                </div>
              )}
            </motion.div>

            {/* Habits Section */}
            {totalHabits > 0 && (
              <motion.div
                variants={itemVariants}
                className="rounded-xl border-2 border-emerald-200 bg-emerald-50 p-4"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    </div>
                    <h3 className="font-semibold text-slate-900">Habits</h3>
                  </div>
                  <span className={cn(
                    'text-sm font-medium',
                    completedHabits === totalHabits ? 'text-emerald-600' : 'text-slate-500'
                  )}>
                    {completedHabits} of {totalHabits} completed
                  </span>
                </div>

                <div className="space-y-2">
                  {activity.habits.map(({ habit, completed }) => (
                    <div
                      key={habit.id}
                      className={cn(
                        'flex items-center gap-3 p-2 rounded-lg',
                        completed ? 'bg-white' : 'bg-emerald-100/50'
                      )}
                    >
                      {completed ? (
                        <CheckCircle2 className="h-5 w-5 text-emerald-500 flex-shrink-0" />
                      ) : (
                        <Circle className="h-5 w-5 text-slate-300 flex-shrink-0" />
                      )}
                      <span className={cn(
                        'text-sm',
                        completed ? 'text-slate-900' : 'text-slate-500'
                      )}>
                        {habit.name}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Gratitude Section */}
            {activity.gratitudes.length > 0 && (
              <motion.div
                variants={itemVariants}
                className="rounded-xl border-2 border-rose-200 bg-rose-50 p-4"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center">
                      <Heart className="h-4 w-4 text-rose-500" />
                    </div>
                    <h3 className="font-semibold text-slate-900">Gratitude</h3>
                  </div>
                  <span className="text-sm text-rose-600 font-medium">
                    {activity.gratitudes.length} {activity.gratitudes.length === 1 ? 'entry' : 'entries'}
                  </span>
                </div>

                <div className="space-y-2">
                  {activity.gratitudes.map((gratitude) => (
                    <div
                      key={gratitude.id}
                      className="p-3 bg-white rounded-lg"
                    >
                      <p className="text-sm text-slate-700">{gratitude.text}</p>
                      {gratitude.theme && (
                        <span className="inline-block mt-2 text-xs text-rose-500 bg-rose-100 px-2 py-0.5 rounded-full">
                          {gratitude.theme}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* No Activity State */}
            {!activity.hasActivity && (
              <motion.div
                variants={itemVariants}
                className="text-center py-10 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200"
              >
                <CalendarDays className="h-12 w-12 mx-auto text-slate-300 mb-3" />
                <h3 className="font-semibold text-slate-900 mb-1">No Activity</h3>
                <p className="text-sm text-slate-500">
                  No check-ins, reflections, or habits logged for this day.
                </p>
              </motion.div>
            )}
          </motion.div>
        </ScrollArea>
      </EnhancedDialogContent>
    </EnhancedDialog>
  )
}

export default DayDetailModal
