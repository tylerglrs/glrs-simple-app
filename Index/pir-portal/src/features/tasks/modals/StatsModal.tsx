import { motion } from 'framer-motion'
import {
  EnhancedDialog,
  EnhancedDialogContent,
} from '@/components/ui/enhanced-dialog'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  TrendingUp,
  Target,
  Calendar,
  Share2,
  X,
  Flame,
  Smile,
  Sparkles,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { useCheckInStats } from '../hooks/useTasksModalData'
import { useGoalsData } from '../hooks/useGoalsData'
import { haptics } from '@/lib/animations'

// =============================================================================
// TYPES
// =============================================================================

export interface StatsModalProps {
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

const countUpVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring' as const,
      stiffness: 300,
      damping: 20,
    },
  },
}

// =============================================================================
// STAT CARD COMPONENT
// =============================================================================

interface StatCardProps {
  icon: React.ReactNode
  label: string
  value: string | number
  subtext: string
  gradient: string
  borderColor: string
  index: number
}

function StatCard({ icon, label, value, subtext, gradient, borderColor, index }: StatCardProps) {
  return (
    <motion.div
      variants={itemVariants}
      custom={index}
      whileHover={{ scale: 1.03, y: -2 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        'rounded-xl p-4 border-2 transition-shadow hover:shadow-md',
        gradient,
        borderColor
      )}
    >
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="text-sm font-medium">{label}</span>
      </div>
      <motion.p
        variants={countUpVariants}
        className="text-2xl font-bold"
      >
        {value}
      </motion.p>
      <p className="text-xs text-muted-foreground mt-1">{subtext}</p>
    </motion.div>
  )
}

// =============================================================================
// COMPONENT
// =============================================================================

export function StatsModal({ onClose }: StatsModalProps) {
  const isMobile = useMediaQuery('(max-width: 768px)')
  const { weeklyStats, streakData, loading: checkInLoading } = useCheckInStats()
  const { stats: goalStats, loading: goalsLoading } = useGoalsData()

  const loading = checkInLoading || goalsLoading

  // Generate shareable report text
  const generateReportText = () => {
    const date = new Date().toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    })

    return `Weekly Recovery Progress - ${date}

Overall Performance
- ${weeklyStats.checkRate}% check-in rate
- ${streakData.currentStreak} day check-in streak
- ${goalStats.completionRate}% task completion rate

Wellness
- Average mood: ${weeklyStats.avgMood}/10
- Average craving: ${weeklyStats.avgCraving}/10
- Average anxiety: ${weeklyStats.avgAnxiety}/10
- Sleep quality: ${weeklyStats.avgSleep}/10

Tasks & Goals
- ${goalStats.totalAssignments} total tasks (${goalStats.completedAssignments} completed)
- ${goalStats.totalGoals} goals (${goalStats.activeGoals} active)

Keep up the great work in recovery!

#RecoveryJourney #Progress`
  }

  const handleShare = async () => {
    haptics.tap()
    const text = generateReportText()

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My Weekly Progress Report',
          text,
        })
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
                <TrendingUp className="h-10 w-10 text-teal-500" />
              </motion.div>
              <p className="text-sm text-muted-foreground">Loading stats...</p>
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
          className="relative bg-gradient-to-br from-teal-500 via-cyan-500 to-green-500 p-6"
        >
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white/10 -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full bg-white/5 translate-y-1/2 -translate-x-1/2" />

          {/* Close button */}
          <button
            onClick={onClose}
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
              <TrendingUp className="h-7 w-7 text-white" />
            </motion.div>
            <div>
              <h2 className="text-xl font-bold text-white">Weekly Progress</h2>
              <p className="text-white/80 text-sm">Your recovery stats at a glance</p>
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
            {/* Completion Rate Hero */}
            <motion.div
              variants={heroVariants}
              className="bg-gradient-to-br from-teal-50 to-green-50 rounded-xl p-5 text-center border-2 border-teal-200 shadow-sm"
            >
              <div className="flex items-center justify-center gap-2 mb-2">
                <Sparkles className="h-4 w-4 text-teal-500" />
                <p className="text-sm text-muted-foreground">Task Completion Rate</p>
              </div>
              <motion.p
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring' as const, stiffness: 300, delay: 0.3 }}
                className="text-5xl font-bold text-teal-600 mb-3"
              >
                {goalStats.completionRate}%
              </motion.p>
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.8, delay: 0.4, ease: 'easeOut' as const }}
                style={{ originX: 0 }}
              >
                <Progress value={goalStats.completionRate} className="h-3 rounded-full" />
              </motion.div>
              <p className="text-sm text-muted-foreground mt-3">
                {goalStats.completedAssignments} of {goalStats.totalAssignments} tasks completed
              </p>
            </motion.div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3">
              <StatCard
                icon={<Calendar className="h-4 w-4 text-blue-600" />}
                label="Check-in Rate"
                value={`${weeklyStats.checkRate}%`}
                subtext={`${weeklyStats.totalCheckIns} check-ins this week`}
                gradient="bg-gradient-to-br from-blue-50 to-indigo-50"
                borderColor="border-blue-200"
                index={0}
              />
              <StatCard
                icon={<Flame className="h-4 w-4 text-orange-500" />}
                label="Current Streak"
                value={streakData.currentStreak}
                subtext="days in a row"
                gradient="bg-gradient-to-br from-orange-50 to-amber-50"
                borderColor="border-orange-200"
                index={1}
              />
              <StatCard
                icon={<Smile className="h-4 w-4 text-purple-500" />}
                label="Avg Mood"
                value={`${weeklyStats.avgMood}/10`}
                subtext={weeklyStats.avgMood >= 7 ? 'Feeling great!' : weeklyStats.avgMood >= 4 ? 'Staying steady' : 'Working through it'}
                gradient="bg-gradient-to-br from-purple-50 to-violet-50"
                borderColor="border-purple-200"
                index={2}
              />
              <StatCard
                icon={<Target className="h-4 w-4 text-green-600" />}
                label="Active Goals"
                value={goalStats.activeGoals}
                subtext={`${goalStats.completedGoals} completed`}
                gradient="bg-gradient-to-br from-green-50 to-emerald-50"
                borderColor="border-green-200"
                index={3}
              />
            </div>

            {/* Wellness Overview */}
            <motion.div
              variants={itemVariants}
              className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-xl p-4 border-2 border-gray-200"
            >
              <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <div className="w-1.5 h-5 rounded-full bg-gradient-to-b from-teal-500 to-green-500" />
                Wellness Overview
              </h3>
              <div className="space-y-4">
                {[
                  { label: 'Craving Level', value: weeklyStats.avgCraving, inverted: true, color: 'bg-orange-500' },
                  { label: 'Anxiety Level', value: weeklyStats.avgAnxiety, inverted: true, color: 'bg-purple-500' },
                  { label: 'Sleep Quality', value: weeklyStats.avgSleep, inverted: false, color: 'bg-indigo-500' },
                ].map((item, index) => (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    className="flex items-center justify-between"
                  >
                    <span className="text-sm text-muted-foreground">{item.label}</span>
                    <div className="flex items-center gap-3">
                      <div className="w-28 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(item.inverted ? 10 - item.value : item.value) * 10}%` }}
                          transition={{ duration: 0.8, delay: 0.6 + index * 0.1, ease: 'easeOut' as const }}
                          className={cn('h-full rounded-full', item.color)}
                        />
                      </div>
                      <span className="text-sm font-semibold w-10 text-right">{item.value}/10</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Share Button */}
            <motion.div variants={itemVariants}>
              <Button
                onClick={handleShare}
                className="w-full bg-gradient-to-r from-teal-500 to-green-500 hover:from-teal-600 hover:to-green-600 h-12 text-base font-medium shadow-lg shadow-teal-500/20"
              >
                <Share2 className="h-5 w-5 mr-2" />
                Share Progress Report
              </Button>
            </motion.div>
          </motion.div>
        </ScrollArea>
      </EnhancedDialogContent>
    </EnhancedDialog>
  )
}

export default StatsModal
