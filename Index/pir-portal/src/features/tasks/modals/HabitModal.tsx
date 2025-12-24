import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  EnhancedDialog,
  EnhancedDialogContent,
} from '@/components/ui/enhanced-dialog'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Repeat,
  X,
  Loader2,
  Plus,
  History,
  CheckCircle,
  Sparkles,
  Target,
  TrendingUp,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { Illustration } from '@/components/common/Illustration'
import { useModalStore } from '@/stores/modalStore'
import { useHabits } from '../hooks/useTasksModalData'
import { haptics, celebrate } from '@/lib/animations'

// =============================================================================
// TYPES
// =============================================================================

export interface HabitModalProps {
  onClose: () => void
}

// =============================================================================
// ANIMATION VARIANTS
// =============================================================================

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 15, scale: 0.95 },
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

const habitCardVariants = {
  hidden: { opacity: 0, x: -20, scale: 0.95 },
  visible: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: {
      type: 'spring' as const,
      stiffness: 350,
      damping: 20,
    },
  },
}

const checkmarkVariants = {
  hidden: { scale: 0, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: {
      type: 'spring' as const,
      stiffness: 500,
      damping: 15,
    },
  },
}

const pulseAnimation = {
  scale: [1, 1.05, 1],
  transition: {
    duration: 2,
    repeat: Infinity,
    ease: 'easeInOut' as const,
  },
}

// =============================================================================
// COMPONENT
// =============================================================================

export function HabitModal({ onClose }: HabitModalProps) {
  const isMobile = useMediaQuery('(max-width: 768px)')
  const { habits, loading, completeHabit, isHabitCompletedToday } = useHabits()
  const { openModal } = useModalStore()


  const [completingId, setCompletingId] = useState<string | null>(null)

  const completedCount = habits.filter((h) => isHabitCompletedToday(h.id)).length
  const totalCount = habits.length
  const progressPercent = totalCount > 0 ? (completedCount / totalCount) * 100 : 0

  const handleCompleteHabit = async (habitId: string) => {
    setCompletingId(habitId)
    haptics.success()
    celebrate()
    await completeHabit(habitId)
    setCompletingId(null)
  }

  // Loading state
  if (loading) {
    return (
      <EnhancedDialog open onOpenChange={onClose}>
        <EnhancedDialogContent
          variant={isMobile ? 'fullscreen' : 'bottom-sheet'}
          showCloseButton={false}
          className="p-0"
        >
          <div className="flex items-center justify-center h-full min-h-[400px]">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center gap-3"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' as const }}
              >
                <Repeat className="h-10 w-10 text-teal-500" />
              </motion.div>
              <p className="text-sm text-muted-foreground">Loading habits...</p>
            </motion.div>
          </div>
        </EnhancedDialogContent>
      </EnhancedDialog>
    )
  }

  return (
    <EnhancedDialog open onOpenChange={onClose}>
      <EnhancedDialogContent
        variant={isMobile ? 'fullscreen' : 'bottom-sheet'}
        showCloseButton={false}
        className="p-0 flex flex-col"
      >
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative bg-gradient-to-br from-teal-500 via-cyan-500 to-emerald-500 p-6"
        >
          {/* Decorative elements */}
          <motion.div
            animate={pulseAnimation}
            className="absolute top-4 right-12 w-8 h-8 rounded-full bg-white/10"
          />
          <div className="absolute bottom-4 left-8 w-6 h-6 rounded-full bg-white/5" />

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

          {/* Title and progress */}
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-3">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring' as const, stiffness: 400, damping: 15, delay: 0.2 }}
                className="p-3 rounded-xl bg-white/20 backdrop-blur-sm"
              >
                <Repeat className="h-7 w-7 text-white" />
              </motion.div>
              <div>
                <h2 className="text-xl font-bold text-white">Habit Tracker</h2>
                <p className="text-white/80 text-sm">Build lasting positive habits</p>
              </div>
            </div>

            {/* Progress circle */}
            {totalCount > 0 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3 }}
                className="relative"
              >
                <svg className="w-14 h-14 -rotate-90">
                  <circle
                    cx="28"
                    cy="28"
                    r="24"
                    stroke="rgba(255,255,255,0.2)"
                    strokeWidth="4"
                    fill="none"
                  />
                  <motion.circle
                    cx="28"
                    cy="28"
                    r="24"
                    stroke="white"
                    strokeWidth="4"
                    fill="none"
                    strokeLinecap="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: progressPercent / 100 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                    style={{
                      strokeDasharray: '151',
                      strokeDashoffset: '0',
                    }}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs font-bold text-white">
                    {completedCount}/{totalCount}
                  </span>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Content */}
        <ScrollArea className="flex-1">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="p-4 space-y-4 md:p-5 md:space-y-5"
          >
            {/* Manage Habits Button */}
            <motion.div variants={itemVariants}>
              <Button
                onClick={() => {
                  haptics.tap()
                  onClose()
                  openModal('manageHabits')
                }}
                variant="outline"
                className="w-full py-6 border-2 border-dashed border-slate-300 hover:border-teal-400 hover:bg-teal-50 transition-all"
              >
                <Plus className="h-5 w-5 mr-2 text-teal-600" />
                <span className="font-medium text-slate-700">Manage Habits</span>
              </Button>
            </motion.div>

            {/* Today's Habits */}
            <motion.div variants={itemVariants}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <div className="w-1.5 h-5 rounded-full bg-gradient-to-b from-teal-500 to-cyan-500" />
                  Today's Habits
                </h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    haptics.tap()
                    onClose()
                    openModal('habitHistory')
                  }}
                  className="text-teal-600 border-teal-200 hover:bg-teal-50"
                >
                  <History className="h-4 w-4 mr-1" />
                  History
                </Button>
              </div>

              {habits.length === 0 ? (
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-center py-10 bg-gradient-to-br from-teal-50 to-cyan-50 rounded-xl border-2 border-dashed border-teal-200"
                >
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                    className="mb-4"
                  >
                    <Illustration name="growth" size="lg" className="mx-auto opacity-85" />
                  </motion.div>
                  <motion.h3
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="font-semibold text-foreground mb-1"
                  >
                    No Habits Yet
                  </motion.h3>
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-sm text-muted-foreground px-4"
                  >
                    Add your first habit above to start building positive routines!
                  </motion.p>
                </motion.div>
              ) : (
                <div className="space-y-2">
                  <AnimatePresence>
                    {habits.map((habit, index) => {
                      const isCompleted = isHabitCompletedToday(habit.id)
                      const isCompleting = completingId === habit.id

                      return (
                        <motion.div
                          key={habit.id}
                          variants={habitCardVariants}
                          initial="hidden"
                          animate="visible"
                          custom={index}
                          whileHover={{ scale: 1.02, x: 4 }}
                          className={cn(
                            'flex items-center gap-3 p-4 rounded-xl border-2 transition-all',
                            isCompleted
                              ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200'
                              : 'bg-gradient-to-r from-gray-50 to-white border-gray-200 hover:border-teal-200'
                          )}
                        >
                          <div className="relative">
                            <Checkbox
                              checked={isCompleted}
                              disabled={isCompleted || isCompleting}
                              onCheckedChange={() => handleCompleteHabit(habit.id)}
                              className={cn(
                                'h-6 w-6 transition-all',
                                isCompleted &&
                                  'data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500'
                              )}
                            />
                            {isCompleting && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="absolute inset-0 flex items-center justify-center"
                              >
                                <Loader2 className="h-4 w-4 animate-spin text-teal-500" />
                              </motion.div>
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <p
                              className={cn(
                                'font-medium transition-all',
                                isCompleted
                                  ? 'text-green-700 line-through'
                                  : 'text-foreground'
                              )}
                            >
                              {habit.name}
                            </p>
                            <p className="text-xs text-muted-foreground capitalize">
                              {habit.frequency}
                            </p>
                          </div>

                          <AnimatePresence>
                            {isCompleted && (
                              <motion.div
                                variants={checkmarkVariants}
                                initial="hidden"
                                animate="visible"
                                exit="hidden"
                                className="flex items-center gap-1"
                              >
                                <CheckCircle className="h-5 w-5 text-green-500" />
                                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                                  Done
                                </span>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.div>
                      )
                    })}
                  </AnimatePresence>
                </div>
              )}
            </motion.div>

            {/* Tips */}
            <motion.div
              variants={itemVariants}
              className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-5 border-2 border-purple-200"
            >
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="h-5 w-5 text-purple-600" />
                <h4 className="font-semibold text-purple-800">Building Habits Tips</h4>
              </div>
              <div className="space-y-2">
                {[
                  { icon: Target, text: 'Start with 1-2 simple habits' },
                  { icon: Repeat, text: 'Attach new habits to existing routines' },
                  { icon: TrendingUp, text: 'Celebrate small wins to build momentum' },
                ].map((tip, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    className="flex items-center gap-2 text-sm text-purple-700"
                  >
                    <tip.icon className="h-4 w-4 text-purple-500" />
                    {tip.text}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </ScrollArea>
      </EnhancedDialogContent>
    </EnhancedDialog>
  )
}

export default HabitModal
