import { motion, AnimatePresence } from 'framer-motion'
import {
  EnhancedDialog,
  EnhancedDialogContent,
} from '@/components/ui/enhanced-dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Checkbox } from '@/components/ui/checkbox'
import { CheckCircle, X, Calendar, Sparkles, PartyPopper } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { useGoalsData, formatDate } from '../hooks/useGoalsData'
import { haptics, achievementCelebration } from '@/lib/animations'
import { useStatusBarColor } from '@/hooks/useStatusBarColor'

// =============================================================================
// TYPES
// =============================================================================

export interface CompleteModalProps {
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

export function CompleteModal({ onClose }: CompleteModalProps) {
  const isMobile = useMediaQuery('(max-width: 768px)')
  const { assignments, loading, completeAssignment } = useGoalsData()

  // Set iOS status bar to match modal header color (green-500)
  useStatusBarColor('#22C55E', true)

  // Filter incomplete assignments
  const incompleteAssignments = assignments.filter(
    (assignment) => assignment.status !== 'completed'
  )

  const handleComplete = async (assignmentId: string) => {
    haptics.success()
    achievementCelebration()
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
                <CheckCircle className="h-10 w-10 text-green-500" />
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
          className="relative bg-gradient-to-br from-green-500 via-emerald-500 to-teal-500 p-6"
        >
          {/* Decorative check marks */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: 'spring' as const }}
            className="absolute top-4 right-12 text-white/20"
          >
            <CheckCircle className="h-6 w-6" />
          </motion.div>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5, type: 'spring' as const }}
            className="absolute bottom-4 left-10 text-white/10"
          >
            <CheckCircle className="h-4 w-4" />
          </motion.div>

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
              <CheckCircle className="h-7 w-7 text-white" />
            </motion.div>
            <div>
              <h2 className="text-xl font-bold text-white">Mark Complete</h2>
              <p className="text-white/80 text-sm">Check off your tasks</p>
            </div>
          </div>
        </motion.div>

        {/* Summary Banner */}
        {incompleteAssignments.length > 0 && (
          <motion.div
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ delay: 0.3 }}
            className="px-5 py-3 border-b bg-gradient-to-r from-green-50 to-emerald-50"
          >
            <p className="text-sm text-green-700 font-medium">
              {incompleteAssignments.length} task{incompleteAssignments.length !== 1 ? 's' : ''} remaining
            </p>
          </motion.div>
        )}

        {/* Content */}
        <ScrollArea className="flex-1">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="p-4 space-y-3 md:p-5 md:space-y-4"
          >
            {/* Tasks List */}
            {incompleteAssignments.length === 0 ? (
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
                  <div className="p-4 rounded-full bg-gradient-to-br from-green-100 to-emerald-100 relative">
                    <PartyPopper className="h-12 w-12 text-green-500" />
                    <motion.div
                      variants={checkVariants}
                      initial="hidden"
                      animate="visible"
                      className="absolute -top-1 -right-1"
                    >
                      <div className="p-1 bg-green-500 rounded-full">
                        <CheckCircle className="h-4 w-4 text-white" />
                      </div>
                    </motion.div>
                  </div>
                </motion.div>
                <h3 className="font-semibold text-foreground mb-2">All Done!</h3>
                <p className="text-sm text-muted-foreground px-4">
                  You have no incomplete tasks. Great work!
                </p>
              </motion.div>
            ) : (
              <div className="space-y-2">
                <AnimatePresence>
                  {incompleteAssignments.map((assignment, index) => (
                    <motion.div
                      key={assignment.id}
                      variants={taskCardVariants}
                      initial="hidden"
                      animate="visible"
                      custom={index}
                      whileHover={{ scale: 1.02, x: 4 }}
                      className="flex items-start gap-3 p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border-2 border-gray-200 hover:border-green-200 hover:bg-green-50/30 transition-all"
                    >
                      <Checkbox
                        checked={false}
                        onCheckedChange={() => handleComplete(assignment.id)}
                        className="mt-0.5 h-5 w-5 data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground">
                          {assignment.title}
                        </p>
                        {assignment.description && (
                          <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">
                            {assignment.description}
                          </p>
                        )}
                        {assignment.dueDate && (
                          <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            <span>Due: {formatDate(assignment.dueDate)}</span>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}

            {/* Tip */}
            {incompleteAssignments.length > 0 && (
              <motion.div
                variants={itemVariants}
                className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-5 border-2 border-green-200"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="h-5 w-5 text-green-600" />
                  <h4 className="font-semibold text-green-800">Quick Tip</h4>
                </div>
                <p className="text-sm text-green-700 leading-relaxed">
                  Check the box next to each task to mark it complete. Your progress will be saved automatically.
                  Celebrate each accomplishment!
                </p>
              </motion.div>
            )}
          </motion.div>
        </ScrollArea>
      </EnhancedDialogContent>
    </EnhancedDialog>
  )
}

export default CompleteModal
