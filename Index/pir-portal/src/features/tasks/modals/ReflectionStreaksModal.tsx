import { motion } from 'framer-motion'
import {
  EnhancedDialog,
  EnhancedDialogContent,
} from '@/components/ui/enhanced-dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Progress } from '@/components/ui/progress'
import {
  Moon,
  X,
  Award,
  Calendar,
  Sparkles,
  TrendingUp,
  Target,
  Star,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { useCheckInsQuery } from '@/hooks/queries'
import { haptics } from '@/lib/animations'

// =============================================================================
// TYPES
// =============================================================================

export interface ReflectionStreaksModalProps {
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

const moonAnimation = {
  scale: [1, 1.1, 1],
  rotate: [0, 5, -5, 0],
  transition: {
    duration: 2,
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

export function ReflectionStreaksModal({ onClose }: ReflectionStreaksModalProps) {
  const isMobile = useMediaQuery('(max-width: 768px)')
  const { reflectionStreak, reflectionStreakData, reflectionStats, loading } = useCheckInsQuery()

  const getStreakIcon = (streak: number) => {
    if (streak >= 30) return <Star className="h-6 w-6 text-purple-500" />
    if (streak >= 14) return <Sparkles className="h-6 w-6 text-indigo-500" />
    if (streak >= 7) return <Moon className="h-6 w-6 text-violet-500" />
    if (streak >= 3) return <Target className="h-6 w-6 text-blue-500" />
    return <Award className="h-6 w-6 text-slate-500" />
  }

  const getStreakMessage = (streak: number) => {
    if (streak >= 30) return "A month of reflection! You're deeply committed!"
    if (streak >= 14) return 'Two weeks of mindfulness! Incredible dedication!'
    if (streak >= 7) return "A full week! You're building a powerful habit!"
    if (streak >= 3) return 'Great start! Keep reflecting!'
    if (streak > 0) return 'Every reflection counts! Building your practice!'
    return 'Complete an evening reflection to start your streak!'
  }

  const getMilestoneProgress = () => {
    const milestones = [3, 7, 14, 30, 60, 90]
    const current = reflectionStreak

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
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' as const }}
              >
                <Moon className="h-10 w-10 text-indigo-500" />
              </motion.div>
              <p className="text-sm text-muted-foreground">Loading reflections...</p>
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
          className="relative bg-gradient-to-br from-indigo-500 via-purple-500 to-violet-500 p-6"
        >
          {/* Decorative star particles */}
          <div className="absolute top-2 right-8 w-2 h-2 rounded-full bg-purple-300 animate-pulse" />
          <div className="absolute top-6 right-16 w-1.5 h-1.5 rounded-full bg-indigo-300 animate-pulse delay-100" />
          <div className="absolute bottom-4 left-12 w-1 h-1 rounded-full bg-violet-300 animate-pulse delay-200" />

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
              animate={moonAnimation}
              className="p-3 rounded-xl bg-white/20 backdrop-blur-sm"
            >
              <Moon className="h-7 w-7 text-white" />
            </motion.div>
            <div>
              <h2 className="text-xl font-bold text-white">Reflection Streaks</h2>
              <p className="text-white/80 text-sm">Nurture your evening practice!</p>
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
            {/* Current Streak Hero */}
            <motion.div
              variants={heroVariants}
              className="text-center py-8 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border-2 border-indigo-200 shadow-sm"
            >
              <motion.div
                animate={reflectionStreak > 0 ? moonAnimation : undefined}
                className="inline-block mb-3"
              >
                {getStreakIcon(reflectionStreak)}
              </motion.div>
              <motion.p
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring' as const, stiffness: 300, delay: 0.3 }}
                className="text-5xl font-bold text-indigo-600 mb-2"
              >
                {reflectionStreak}
              </motion.p>
              <p className="text-sm text-indigo-700 font-medium">
                Day{reflectionStreak !== 1 ? 's' : ''} Current Streak
              </p>
              <p className="text-sm text-muted-foreground mt-2 px-4">
                {getStreakMessage(reflectionStreak)}
              </p>
            </motion.div>

            {/* Milestone Progress */}
            {milestoneProgress.remaining > 0 && (
              <motion.div
                variants={itemVariants}
                className="bg-white rounded-xl border-2 border-indigo-100 p-4 shadow-sm"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-indigo-500" />
                    <span className="text-sm font-semibold text-foreground">
                      Next Milestone: {milestoneProgress.next} Days
                    </span>
                  </div>
                  <span className="text-sm text-indigo-600 font-medium">
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
                streak={reflectionStreakData.longestStreak}
                label="Longest Streak"
                icon={<Star className="h-6 w-6 text-purple-500" />}
                gradient="bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200"
                index={0}
              />
              <StreakBadge
                streak={reflectionStats.totalAllTime}
                label="Total Reflections"
                icon={<Calendar className="h-6 w-6 text-indigo-500" />}
                gradient="bg-gradient-to-br from-indigo-50 to-violet-50 border-indigo-200"
                index={1}
              />
            </div>

            {/* This Month Stats */}
            <motion.div
              variants={itemVariants}
              className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-4 border border-purple-200"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-purple-600" />
                  <span className="font-semibold text-purple-800">This Month</span>
                </div>
                <span className="text-2xl font-bold text-purple-600">
                  {reflectionStats.totalThisMonth}
                </span>
              </div>
              <p className="text-sm text-purple-600/70 mt-1">
                reflections completed
              </p>
            </motion.div>

            {/* Streak History */}
            {reflectionStreakData.allStreaks.length > 0 && (
              <motion.div variants={itemVariants}>
                <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                  <div className="w-1.5 h-5 rounded-full bg-gradient-to-b from-indigo-500 to-purple-500" />
                  Streak History
                </h3>
                <div className="space-y-2">
                  {reflectionStreakData.allStreaks
                    .sort((a, b) => b.length - a.length)
                    .slice(0, 5)
                    .map((streak, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 + index * 0.1 }}
                        className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-white rounded-lg border hover:border-indigo-200 transition-colors"
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
            {reflectionStreakData.allStreaks.length === 0 && reflectionStreak === 0 && (
              <motion.div
                variants={itemVariants}
                className="text-center py-8 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring' as const, delay: 0.3 }}
                >
                  <Moon className="h-14 w-14 mx-auto text-gray-300 mb-3" />
                </motion.div>
                <h3 className="font-semibold text-foreground mb-1">Start Your First Streak</h3>
                <p className="text-sm text-muted-foreground px-4">
                  Complete evening reflections on consecutive days to build your streak!
                </p>
              </motion.div>
            )}

            {/* Motivation */}
            <motion.div
              variants={itemVariants}
              className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-5 border-2 border-indigo-200"
            >
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-5 w-5 text-indigo-600" />
                <h4 className="font-semibold text-indigo-800">The Power of Reflection</h4>
              </div>
              <p className="text-sm text-indigo-700 leading-relaxed">
                Evening reflections help you process your day, acknowledge your wins,
                and set intentions for tomorrow. This mindful practice strengthens your
                recovery and builds emotional resilience. Keep reflecting!
              </p>
            </motion.div>
          </motion.div>
        </ScrollArea>
      </EnhancedDialogContent>
    </EnhancedDialog>
  )
}

export default ReflectionStreaksModal
