import { motion } from 'framer-motion'
import {
  EnhancedDialog,
  EnhancedDialogContent,
} from '@/components/ui/enhanced-dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Progress } from '@/components/ui/progress'
import {
  Zap,
  X,
  Award,
  Calendar,
  Flame,
  TrendingUp,
  Target,
  Sparkles,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { useCheckInsQuery } from '@/hooks/queries'
import { Illustration } from '@/components/common/Illustration'
import { haptics } from '@/lib/animations'

// =============================================================================
// TYPES
// =============================================================================

export interface StreaksModalProps {
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

const flameAnimation = {
  scale: [1, 1.1, 1],
  rotate: [0, -5, 5, 0],
  transition: {
    duration: 0.8,
    repeat: Infinity,
    ease: 'easeInOut' as const,
  },
}

// =============================================================================
// STREAK BADGE COMPONENT
// =============================================================================

interface StreakBadgeProps {
  streak: number
  label: string
  icon: React.ReactNode
  gradient: string
  index: number
}

function StreakBadge({ streak, label, icon, gradient, index }: StreakBadgeProps) {
  return (
    <motion.div
      variants={itemVariants}
      custom={index}
      whileHover={{ scale: 1.05, y: -2 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        'text-center p-4 rounded-xl border-2 transition-shadow hover:shadow-md',
        gradient
      )}
    >
      <div className="flex justify-center mb-2">{icon}</div>
      <motion.p
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring' as const, delay: 0.3 + index * 0.1 }}
        className="text-2xl font-bold"
      >
        {streak}
      </motion.p>
      <p className="text-xs text-muted-foreground mt-1">{label}</p>
    </motion.div>
  )
}

// =============================================================================
// COMPONENT
// =============================================================================

export function StreaksModal({ onClose }: StreaksModalProps) {
  const isMobile = useMediaQuery('(max-width: 768px)')
  const { checkInStreak, checkInStreakData, weeklyStats, loading } = useCheckInsQuery()


  const getStreakIcon = (streak: number) => {
    if (streak >= 30) return <Flame className="h-6 w-6 text-orange-500" />
    if (streak >= 14) return <Sparkles className="h-6 w-6 text-yellow-500" />
    if (streak >= 7) return <Zap className="h-6 w-6 text-amber-500" />
    if (streak >= 3) return <Target className="h-6 w-6 text-green-500" />
    return <Award className="h-6 w-6 text-blue-500" />
  }

  const getStreakMessage = (streak: number) => {
    if (streak >= 30) return "Incredible dedication! You're on fire!"
    if (streak >= 14) return 'Two weeks strong! Amazing work!'
    if (streak >= 7) return "A full week! You're building momentum!"
    if (streak >= 3) return 'Great start! Keep it going!'
    if (streak > 0) return 'Every day counts! Building your streak!'
    return 'Check in today to start your streak!'
  }

  const getMilestoneProgress = () => {
    const milestones = [3, 7, 14, 30, 60, 90]
    const current = checkInStreak

    for (const milestone of milestones) {
      if (current < milestone) {
        return {
          next: milestone,
          progress: (current / milestone) * 100,
          remaining: milestone - current,
        }
      }
    }

    return { next: 100, progress: 100, remaining: 0 }
  }

  const milestoneProgress = getMilestoneProgress()

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
                <Flame className="h-10 w-10 text-orange-500" />
              </motion.div>
              <p className="text-sm text-muted-foreground">Loading streaks...</p>
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
          className="relative bg-gradient-to-br from-orange-500 via-amber-500 to-yellow-500 p-6"
        >
          {/* Decorative fire particles */}
          <div className="absolute top-2 right-8 w-2 h-2 rounded-full bg-yellow-300 animate-pulse" />
          <div className="absolute top-6 right-16 w-1.5 h-1.5 rounded-full bg-orange-300 animate-pulse delay-100" />
          <div className="absolute bottom-4 left-12 w-1 h-1 rounded-full bg-red-300 animate-pulse delay-200" />

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
              animate={flameAnimation}
              className="p-3 rounded-xl bg-white/20 backdrop-blur-sm"
            >
              <Flame className="h-7 w-7 text-white" />
            </motion.div>
            <div>
              <h2 className="text-xl font-bold text-white">Check-In Streaks</h2>
              <p className="text-white/80 text-sm">Keep the fire burning!</p>
            </div>
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
            {/* Current Streak Hero */}
            <motion.div
              variants={heroVariants}
              className="text-center py-8 bg-gradient-to-br from-orange-50 to-yellow-50 rounded-xl border-2 border-orange-200 shadow-sm"
            >
              <motion.div
                animate={checkInStreak > 0 ? flameAnimation : undefined}
                className="inline-block mb-3"
              >
                {getStreakIcon(checkInStreak)}
              </motion.div>
              <motion.p
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring' as const, stiffness: 300, delay: 0.3 }}
                className="text-5xl font-bold text-orange-600 mb-2"
              >
                {checkInStreak}
              </motion.p>
              <p className="text-sm text-orange-700 font-medium">
                Day{checkInStreak !== 1 ? 's' : ''} Current Streak
              </p>
              <p className="text-sm text-muted-foreground mt-2 px-4">
                {getStreakMessage(checkInStreak)}
              </p>
            </motion.div>

            {/* Milestone Progress */}
            {milestoneProgress.remaining > 0 && (
              <motion.div
                variants={itemVariants}
                className="bg-white rounded-xl border-2 border-orange-100 p-4 shadow-sm"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-orange-500" />
                    <span className="text-sm font-semibold text-foreground">
                      Next Milestone: {milestoneProgress.next} Days
                    </span>
                  </div>
                  <span className="text-sm text-orange-600 font-medium">
                    {milestoneProgress.remaining} to go
                  </span>
                </div>
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.8, delay: 0.4, ease: 'easeOut' as const }}
                  style={{ originX: 0 }}
                >
                  <Progress
                    value={milestoneProgress.progress}
                    className="h-3 rounded-full"
                  />
                </motion.div>
              </motion.div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3">
              <StreakBadge
                streak={checkInStreakData.longestStreak}
                label="Longest Streak"
                icon={<Flame className="h-6 w-6 text-orange-500" />}
                gradient="bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200"
                index={0}
              />
              <StreakBadge
                streak={weeklyStats.checkInCount}
                label="7-Day Check-Ins"
                icon={<Calendar className="h-6 w-6 text-teal-500" />}
                gradient="bg-gradient-to-br from-teal-50 to-cyan-50 border-teal-200"
                index={1}
              />
            </div>

            {/* Streak History */}
            {checkInStreakData.allStreaks.length > 0 && (
              <motion.div variants={itemVariants}>
                <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                  <div className="w-1.5 h-5 rounded-full bg-gradient-to-b from-orange-500 to-yellow-500" />
                  Streak History
                </h3>
                <div className="space-y-2">
                  {checkInStreakData.allStreaks
                    .sort((a, b) => b.length - a.length)
                    .slice(0, 5)
                    .map((streak, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 + index * 0.1 }}
                        className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-white rounded-lg border hover:border-orange-200 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          {getStreakIcon(streak.length)}
                          <span className="font-semibold text-foreground">
                            {streak.length} day{streak.length !== 1 ? 's' : ''}
                          </span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {streak.startDate.slice(5)} - {streak.endDate.slice(5)}
                        </span>
                      </motion.div>
                    ))}
                </div>
              </motion.div>
            )}

            {/* No Streaks Yet */}
            {checkInStreakData.allStreaks.length === 0 && checkInStreak === 0 && (
              <motion.div
                variants={itemVariants}
                className="text-center py-8 bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl border-2 border-dashed border-orange-200"
              >
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                  className="mb-4"
                >
                  <Illustration name="streak-fire" size="lg" className="mx-auto opacity-85" />
                </motion.div>
                <motion.h3
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="font-semibold text-foreground mb-1"
                >
                  Start Your First Streak
                </motion.h3>
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-sm text-muted-foreground px-4"
                >
                  Complete check-ins on consecutive days to build your streak!
                </motion.p>
              </motion.div>
            )}

            {/* Motivation */}
            <motion.div
              variants={itemVariants}
              className="bg-gradient-to-r from-teal-50 to-cyan-50 rounded-xl p-5 border-2 border-teal-200"
            >
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-5 w-5 text-teal-600" />
                <h4 className="font-semibold text-teal-800">Why Streaks Matter</h4>
              </div>
              <p className="text-sm text-teal-700 leading-relaxed">
                Consistent check-ins help you stay mindful of your recovery journey.
                They create a powerful habit of self-reflection and keep you connected
                to your progress. Every day counts!
              </p>
            </motion.div>
          </motion.div>
        </ScrollArea>
      </EnhancedDialogContent>
    </EnhancedDialog>
  )
}

export default StreaksModal
