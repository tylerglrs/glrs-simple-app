import { motion, AnimatePresence } from 'framer-motion'
import {
  EnhancedDialog,
  EnhancedDialogContent,
} from '@/components/ui/enhanced-dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Checkbox } from '@/components/ui/checkbox'
import { AlertCircle, X, CheckCircle, Calendar, Clock, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { useGoalsData, formatDate } from '../hooks/useGoalsData'
import { Timestamp } from 'firebase/firestore'
import { haptics } from '@/lib/animations'
import { useStatusBarColor } from '@/hooks/useStatusBarColor'

// =============================================================================
// TYPES
// =============================================================================

export interface OverdueModalProps {
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

export function OverdueModal({ onClose }: OverdueModalProps) {
  const isMobile = useMediaQuery('(max-width: 768px)')
  const { assignments, loading, completeAssignment } = useGoalsData()

  // Set iOS status bar to match modal header color (red-500)
  useStatusBarColor('#EF4444', true)

  // Get today at midnight
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Filter overdue assignments (not completed and past due date)
  const overdueAssignments = assignments.filter((assignment) => {
    if (!assignment.dueDate || assignment.status === 'completed') return false
    const dueDate =
      assignment.dueDate instanceof Timestamp
        ? assignment.dueDate.toDate()
        : new Date(assignment.dueDate)
    return dueDate < today
  })

  // Sort by oldest first
  const sortedAssignments = [...overdueAssignments].sort((a, b) => {
    const dateA = a.dueDate instanceof Timestamp ? a.dueDate.toDate() : new Date(a.dueDate!)
    const dateB = b.dueDate instanceof Timestamp ? b.dueDate.toDate() : new Date(b.dueDate!)
    return dateA.getTime() - dateB.getTime()
  })

  const getDaysOverdue = (dueDate: Timestamp | Date): number => {
    const due = dueDate instanceof Timestamp ? dueDate.toDate() : new Date(dueDate)
    due.setHours(0, 0, 0, 0)
    return Math.floor((today.getTime() - due.getTime()) / (1000 * 60 * 60 * 24))
  }

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
                <AlertCircle className="h-10 w-10 text-red-500" />
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
          className="relative bg-gradient-to-br from-red-500 via-rose-500 to-pink-500 p-6"
        >
          {/* Decorative warning pulse */}
          <motion.div
            animate={pulseAnimation}
            className="absolute top-4 right-12 w-6 h-6 rounded-full bg-white/20"
          />
          <div className="absolute bottom-2 left-8 w-3 h-3 rounded-full bg-white/10" />

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
              animate={pulseAnimation}
              className="p-3 rounded-xl bg-white/20 backdrop-blur-sm"
            >
              <AlertCircle className="h-7 w-7 text-white" />
            </motion.div>
            <div>
              <h2 className="text-xl font-bold text-white">Overdue Items</h2>
              <p className="text-white/80 text-sm">Tasks needing attention</p>
            </div>
          </div>
        </motion.div>

        {/* Warning Banner */}
        {sortedAssignments.length > 0 && (
          <motion.div
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ delay: 0.3 }}
            className="px-5 py-3 border-b bg-gradient-to-r from-red-50 to-rose-50"
          >
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-red-600" />
              <p className="text-sm text-red-700 font-medium">
                {sortedAssignments.length} overdue item{sortedAssignments.length !== 1 ? 's' : ''} need your attention
              </p>
            </div>
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
                  <div className="p-4 rounded-full bg-gradient-to-br from-green-100 to-emerald-100">
                    <CheckCircle className="h-12 w-12 text-green-500" />
                  </div>
                </motion.div>
                <h3 className="font-semibold text-foreground mb-2">No Overdue Items!</h3>
                <p className="text-sm text-muted-foreground px-4">
                  You're all caught up. Great work!
                </p>
              </motion.div>
            ) : (
              <div className="space-y-2">
                <AnimatePresence>
                  {sortedAssignments.map((assignment, index) => {
                    const daysOverdue = getDaysOverdue(assignment.dueDate!)

                    return (
                      <motion.div
                        key={assignment.id}
                        variants={taskCardVariants}
                        initial="hidden"
                        animate="visible"
                        custom={index}
                        whileHover={{ scale: 1.02, x: 4 }}
                        className="flex items-start gap-3 p-4 bg-gradient-to-r from-red-50 to-rose-50 rounded-xl border-2 border-red-200 hover:border-red-300 transition-all"
                      >
                        <Checkbox
                          checked={false}
                          onCheckedChange={() => handleComplete(assignment.id)}
                          className="mt-0.5 h-5 w-5"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground">
                            {assignment.title}
                          </p>
                          <div className="flex items-center gap-2 mt-2 flex-wrap">
                            <motion.div
                              animate={{ opacity: [1, 0.6, 1] }}
                              transition={{ duration: 1.5, repeat: Infinity }}
                              className="flex items-center gap-1 text-xs text-red-600 font-semibold bg-red-100 px-2 py-0.5 rounded-full"
                            >
                              <AlertCircle className="h-3 w-3" />
                              <span>
                                {daysOverdue} day{daysOverdue !== 1 ? 's' : ''} overdue
                              </span>
                            </motion.div>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Calendar className="h-3 w-3" />
                              <span>Due: {formatDate(assignment.dueDate)}</span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )
                  })}
                </AnimatePresence>
              </div>
            )}

            {/* Encouragement */}
            {sortedAssignments.length > 0 && (
              <motion.div
                variants={itemVariants}
                className="bg-gradient-to-r from-teal-50 to-cyan-50 rounded-xl p-5 border-2 border-teal-200"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="h-5 w-5 text-teal-600" />
                  <h4 className="font-semibold text-teal-800">You've Got This!</h4>
                </div>
                <p className="text-sm text-teal-700 leading-relaxed">
                  Don't worry - just take it one task at a time. Check off what you can today.
                  Every small step counts toward your progress!
                </p>
              </motion.div>
            )}
          </motion.div>
        </ScrollArea>
      </EnhancedDialogContent>
    </EnhancedDialog>
  )
}

export default OverdueModal
