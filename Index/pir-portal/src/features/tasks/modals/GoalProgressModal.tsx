import { motion } from 'framer-motion'
import {
  EnhancedDialog,
  EnhancedDialogContent,
} from '@/components/ui/enhanced-dialog'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Target, CheckCircle, Share2, X, Trophy, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { useGoalsData } from '../hooks/useGoalsData'
import { haptics } from '@/lib/animations'

// =============================================================================
// TYPES
// =============================================================================

export interface GoalProgressModalProps {
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

const heroVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      type: 'spring' as const,
      stiffness: 300,
      damping: 20,
      delay: 0.1,
    },
  },
}

const goalCardVariants = {
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

// =============================================================================
// COMPONENT
// =============================================================================

export function GoalProgressModal({ onClose }: GoalProgressModalProps) {
  const isMobile = useMediaQuery('(max-width: 768px)')
  const { goalsWithChildren, stats, loading } = useGoalsData()

  const handleShareGoal = async (goalName: string) => {
    haptics.success()
    const text = `I just completed my goal: ${goalName}! #RecoveryWin`

    if (navigator.share) {
      try {
        await navigator.share({ title: 'Goal Completed!', text })
      } catch {
        await navigator.clipboard.writeText(text)
      }
    } else {
      await navigator.clipboard.writeText(text)
    }
  }

  // Loading state
  if (loading) {
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
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' as const }}
              >
                <Target className="h-10 w-10 text-teal-500" />
              </motion.div>
              <p className="text-sm text-muted-foreground">Loading goals...</p>
            </motion.div>
          </div>
        </EnhancedDialogContent>
      </EnhancedDialog>
    )
  }

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
          className="relative bg-gradient-to-br from-teal-500 via-cyan-500 to-blue-500 p-6"
        >
          {/* Decorative targets */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: 'spring' as const }}
            className="absolute top-4 right-12 text-white/20"
          >
            <Target className="h-8 w-8" />
          </motion.div>
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' as const }}
            className="absolute bottom-2 left-8 text-white/10"
          >
            <Target className="h-5 w-5" />
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
              <Target className="h-7 w-7 text-white" />
            </motion.div>
            <div>
              <h2 className="text-xl font-bold text-white">Goal Progress</h2>
              <p className="text-white/80 text-sm">Track your achievements</p>
            </div>
          </div>
        </motion.div>

        {/* Content */}
        <ScrollArea className="flex-1">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className={cn('p-5 space-y-5', isMobile && 'p-4 space-y-4')}
          >
            {/* Overview Stats */}
            <motion.div variants={heroVariants} className="grid grid-cols-3 gap-3">
              <motion.div
                whileHover={{ scale: 1.05, y: -2 }}
                className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-xl p-4 text-center border-2 border-teal-200"
              >
                <motion.p
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring' as const, delay: 0.3 }}
                  className="text-3xl font-bold text-teal-600"
                >
                  {stats.totalGoals}
                </motion.p>
                <p className="text-xs text-muted-foreground mt-1">Total Goals</p>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05, y: -2 }}
                className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 text-center border-2 border-blue-200"
              >
                <motion.p
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring' as const, delay: 0.4 }}
                  className="text-3xl font-bold text-blue-600"
                >
                  {stats.activeGoals}
                </motion.p>
                <p className="text-xs text-muted-foreground mt-1">Active</p>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05, y: -2 }}
                className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 text-center border-2 border-green-200"
              >
                <motion.p
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring' as const, delay: 0.5 }}
                  className="text-3xl font-bold text-green-600"
                >
                  {stats.completedGoals}
                </motion.p>
                <p className="text-xs text-muted-foreground mt-1">Completed</p>
              </motion.div>
            </motion.div>

            {/* Goals List */}
            {goalsWithChildren.length === 0 ? (
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
                  <div className="p-4 rounded-full bg-gradient-to-br from-gray-100 to-gray-50">
                    <Target className="h-12 w-12 text-gray-300" />
                  </div>
                </motion.div>
                <h3 className="font-semibold text-foreground mb-2">No Goals Yet</h3>
                <p className="text-sm text-muted-foreground px-4">
                  Your coach will create personalized goals for you.
                </p>
              </motion.div>
            ) : (
              <div className="space-y-3">
                {goalsWithChildren.map((goal, index) => {
                  const isCompleted = goal.status === 'completed'

                  return (
                    <motion.div
                      key={goal.id}
                      variants={goalCardVariants}
                      custom={index}
                      whileHover={{ scale: 1.02, x: 4 }}
                      className={cn(
                        'p-4 rounded-xl border-2 transition-all',
                        isCompleted
                          ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200'
                          : 'bg-gradient-to-r from-gray-50 to-white border-gray-200'
                      )}
                    >
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            {isCompleted && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: 'spring' as const }}
                              >
                                <CheckCircle className="h-5 w-5 text-green-500 shrink-0" />
                              </motion.div>
                            )}
                            <h4
                              className={cn(
                                'font-semibold text-foreground',
                                isCompleted && 'line-through text-muted-foreground'
                              )}
                            >
                              {goal.title}
                            </h4>
                          </div>
                          {goal.description && (
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {goal.description}
                            </p>
                          )}
                        </div>
                        {isCompleted && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: 'spring' as const, delay: 0.2 }}
                          >
                            <Trophy className="h-6 w-6 text-amber-500" />
                          </motion.div>
                        )}
                      </div>

                      {/* Progress Bar */}
                      <div className="mb-2">
                        <motion.div
                          initial={{ scaleX: 0 }}
                          animate={{ scaleX: 1 }}
                          transition={{ duration: 0.8, delay: 0.3 + index * 0.1 }}
                          style={{ originX: 0 }}
                        >
                          <Progress
                            value={goal.progress}
                            className={cn('h-2.5', isCompleted && '[&>div]:bg-green-500')}
                          />
                        </motion.div>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                          {goal.objectives.reduce((sum, o) => sum + o.assignments.length, 0)} tasks
                        </span>
                        <motion.span
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.5 + index * 0.1 }}
                          className={cn(
                            'font-bold',
                            goal.progress === 100 ? 'text-green-600' : 'text-teal-600'
                          )}
                        >
                          {goal.progress}%
                        </motion.span>
                      </div>

                      {/* Share button for completed goals */}
                      {isCompleted && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.6 + index * 0.1 }}
                        >
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full mt-3 border-green-300 text-green-700 hover:bg-green-100"
                            onClick={() => handleShareGoal(goal.title)}
                          >
                            <Share2 className="h-4 w-4 mr-2" />
                            Share Completion
                          </Button>
                        </motion.div>
                      )}
                    </motion.div>
                  )
                })}
              </div>
            )}

            {/* Motivation */}
            {goalsWithChildren.length > 0 && (
              <motion.div
                variants={itemVariants}
                className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-5 border-2 border-purple-200"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="h-5 w-5 text-purple-600" />
                  <h4 className="font-semibold text-purple-800">Keep Going!</h4>
                </div>
                <p className="text-sm text-purple-700 leading-relaxed">
                  Every step forward is progress. Your goals are milestones on your recovery journey.
                  Celebrate each achievement, no matter how small!
                </p>
              </motion.div>
            )}
          </motion.div>
        </ScrollArea>
      </EnhancedDialogContent>
    </EnhancedDialog>
  )
}

export default GoalProgressModal
