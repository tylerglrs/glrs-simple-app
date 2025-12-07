import { motion, AnimatePresence } from 'framer-motion'
import {
  EnhancedDialog,
  EnhancedDialogContent,
} from '@/components/ui/enhanced-dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Checkbox } from '@/components/ui/checkbox'
import { Progress } from '@/components/ui/progress'
import {
  CalendarDays,
  X,
  AlertCircle,
  CheckCircle,
  Clock,
  Target,
  Sparkles,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { useGoalsData, getDueDateStatus } from '../hooks/useGoalsData'
import { Timestamp } from 'firebase/firestore'
import { haptics } from '@/lib/animations'

// =============================================================================
// TYPES
// =============================================================================

export interface ThisWeekModalProps {
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

const taskCardVariants = {
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

const checkVariants = {
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

// =============================================================================
// COMPONENT
// =============================================================================

export function ThisWeekModal({ onClose }: ThisWeekModalProps) {
  const isMobile = useMediaQuery('(max-width: 768px)')
  const { assignments, loading, completeAssignment } = useGoalsData()

  // Get this week's date range
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const startOfWeek = new Date(today)
  startOfWeek.setDate(today.getDate() - today.getDay())

  const endOfWeek = new Date(startOfWeek)
  endOfWeek.setDate(startOfWeek.getDate() + 7)

  // Filter assignments due this week
  const thisWeekAssignments = assignments.filter((assignment) => {
    if (!assignment.dueDate) return false
    const dueDate =
      assignment.dueDate instanceof Timestamp
        ? assignment.dueDate.toDate()
        : new Date(assignment.dueDate)
    return dueDate >= startOfWeek && dueDate < endOfWeek
  })

  // Sort by due date and status
  const sortedAssignments = [...thisWeekAssignments].sort((a, b) => {
    // Completed items last
    if (a.status === 'completed' && b.status !== 'completed') return 1
    if (a.status !== 'completed' && b.status === 'completed') return -1

    // Then by due date
    const dateA = a.dueDate instanceof Timestamp ? a.dueDate.toDate() : new Date(a.dueDate!)
    const dateB = b.dueDate instanceof Timestamp ? b.dueDate.toDate() : new Date(b.dueDate!)
    return dateA.getTime() - dateB.getTime()
  })

  const completedCount = sortedAssignments.filter((a) => a.status === 'completed').length
  const totalCount = sortedAssignments.length
  const progressPercent = totalCount > 0 ? (completedCount / totalCount) * 100 : 0

  const handleComplete = async (assignmentId: string) => {
    haptics.success()
    await completeAssignment(assignmentId)
  }

  // Loading state
  if (loading) {
    return (
      <EnhancedDialog open onOpenChange={onClose}>
        <EnhancedDialogContent
          variant={isMobile ? 'fullscreen' : 'sheet-right'}
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
                <CalendarDays className="h-10 w-10 text-teal-500" />
              </motion.div>
              <p className="text-sm text-muted-foreground">Loading tasks...</p>
            </motion.div>
          </div>
        </EnhancedDialogContent>
      </EnhancedDialog>
    )
  }

  return (
    <EnhancedDialog open onOpenChange={onClose}>
      <EnhancedDialogContent
        variant={isMobile ? 'fullscreen' : 'sheet-right'}
        showCloseButton={false}
        className="p-0 flex flex-col"
      >
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative bg-gradient-to-br from-teal-500 via-cyan-500 to-blue-500 p-6"
        >
          {/* Decorative calendar grid */}
          <div className="absolute top-4 right-8 opacity-10">
            <div className="grid grid-cols-7 gap-0.5">
              {[...Array(7)].map((_, i) => (
                <div key={i} className="w-2 h-2 rounded-sm bg-white" />
              ))}
            </div>
          </div>

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
              <h2 className="text-xl font-bold text-white">This Week's Tasks</h2>
              <p className="text-white/80 text-sm">
                {startOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} -{' '}
                {endOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Progress Bar */}
        {totalCount > 0 && (
          <motion.div
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ delay: 0.3 }}
            className="px-5 py-3 border-b bg-gradient-to-r from-teal-50 to-cyan-50"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-teal-800">Weekly Progress</span>
              <span className="text-sm font-bold text-teal-600">
                {completedCount}/{totalCount} completed
              </span>
            </div>
            <Progress value={progressPercent} className="h-2" />
          </motion.div>
        )}

        {/* Content */}
        <ScrollArea className="flex-1">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className={cn('p-5 space-y-4', isMobile && 'p-4 space-y-3')}
          >
            {/* Tasks List */}
            {sortedAssignments.length === 0 ? (
              <motion.div
                variants={itemVariants}
                className="text-center py-12"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring' as const, delay: 0.2 }}
                  className="inline-block mb-4"
                >
                  <div className="p-4 rounded-full bg-gradient-to-br from-teal-100 to-cyan-100">
                    <Sparkles className="h-10 w-10 text-teal-500" />
                  </div>
                </motion.div>
                <h3 className="font-semibold text-foreground mb-2">All Clear This Week!</h3>
                <p className="text-sm text-muted-foreground px-4">
                  You don't have any tasks due this week. Enjoy!
                </p>
              </motion.div>
            ) : (
              <div className="space-y-2">
                <AnimatePresence>
                  {sortedAssignments.map((assignment, index) => {
                    const isCompleted = assignment.status === 'completed'
                    const dueDate =
                      assignment.dueDate instanceof Timestamp
                        ? assignment.dueDate.toDate()
                        : new Date(assignment.dueDate!)
                    const isOverdue = !isCompleted && dueDate < today
                    const isToday = dueDate.toDateString() === today.toDateString()
                    const dueDateStatus = getDueDateStatus(assignment.dueDate, isCompleted)

                    return (
                      <motion.div
                        key={assignment.id}
                        variants={taskCardVariants}
                        initial="hidden"
                        animate="visible"
                        custom={index}
                        whileHover={{ scale: 1.02, x: 4 }}
                        className={cn(
                          'flex items-start gap-3 p-4 rounded-xl border-2 transition-all',
                          isCompleted && 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200',
                          isOverdue && 'bg-gradient-to-r from-red-50 to-rose-50 border-red-200',
                          isToday && !isCompleted && !isOverdue && 'bg-gradient-to-r from-orange-50 to-amber-50 border-orange-200',
                          !isCompleted && !isOverdue && !isToday && 'bg-gradient-to-r from-gray-50 to-white border-gray-200'
                        )}
                      >
                        <Checkbox
                          checked={isCompleted}
                          disabled={isCompleted}
                          onCheckedChange={() => handleComplete(assignment.id)}
                          className={cn(
                            'mt-0.5 h-5 w-5',
                            isCompleted && 'data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500'
                          )}
                        />
                        <div className="flex-1 min-w-0">
                          <p
                            className={cn(
                              'font-medium text-foreground',
                              isCompleted && 'line-through text-muted-foreground'
                            )}
                          >
                            {assignment.title}
                          </p>
                          <div className="flex items-center gap-2 mt-1.5">
                            <AnimatePresence mode="wait">
                              {isCompleted ? (
                                <motion.div
                                  key="completed"
                                  variants={checkVariants}
                                  initial="hidden"
                                  animate="visible"
                                  exit="hidden"
                                  className="flex items-center gap-1"
                                >
                                  <CheckCircle className="h-3.5 w-3.5 text-green-500" />
                                  <span className="text-xs text-green-600 font-medium">Completed</span>
                                </motion.div>
                              ) : isOverdue ? (
                                <motion.div
                                  key="overdue"
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  className="flex items-center gap-1"
                                >
                                  <AlertCircle className="h-3.5 w-3.5 text-red-500" />
                                  <span className="text-xs text-red-500 font-medium">Overdue</span>
                                </motion.div>
                              ) : (
                                <motion.div
                                  key="pending"
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  className="flex items-center gap-1"
                                >
                                  <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                                  <span
                                    className={cn(
                                      'text-xs',
                                      isToday ? 'text-orange-600 font-medium' : 'text-muted-foreground'
                                    )}
                                  >
                                    {dueDateStatus.text}
                                    {isToday && ' (Today)'}
                                  </span>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        </div>

                        {/* Priority indicator */}
                        {isToday && !isCompleted && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="shrink-0"
                          >
                            <Target className="h-5 w-5 text-orange-500" />
                          </motion.div>
                        )}
                      </motion.div>
                    )
                  })}
                </AnimatePresence>
              </div>
            )}

            {/* Summary Card */}
            {totalCount > 0 && (
              <motion.div
                variants={itemVariants}
                className="bg-gradient-to-r from-teal-50 to-cyan-50 rounded-xl p-4 border-2 border-teal-200"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Target className="h-5 w-5 text-teal-600" />
                  <h4 className="font-semibold text-teal-800">Weekly Summary</h4>
                </div>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div>
                    <p className="text-2xl font-bold text-teal-600">{completedCount}</p>
                    <p className="text-xs text-muted-foreground">Completed</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-orange-600">
                      {sortedAssignments.filter(
                        (a) =>
                          a.status !== 'completed' &&
                          (a.dueDate instanceof Timestamp
                            ? a.dueDate.toDate()
                            : new Date(a.dueDate!)
                          ).toDateString() === today.toDateString()
                      ).length}
                    </p>
                    <p className="text-xs text-muted-foreground">Due Today</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-red-600">
                      {sortedAssignments.filter((a) => {
                        if (a.status === 'completed') return false
                        const due =
                          a.dueDate instanceof Timestamp
                            ? a.dueDate.toDate()
                            : new Date(a.dueDate!)
                        return due < today
                      }).length}
                    </p>
                    <p className="text-xs text-muted-foreground">Overdue</p>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        </ScrollArea>
      </EnhancedDialogContent>
    </EnhancedDialog>
  )
}

export default ThisWeekModal
