import { motion } from 'framer-motion'
import {
  EnhancedDialog,
  EnhancedDialogContent,
} from '@/components/ui/enhanced-dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Smile,
  X,
  TrendingUp,
  TrendingDown,
  Minus,
  Lightbulb,
  Heart,
  Sun,
  Cloud,
  CloudRain,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { useCheckInStats, type PatternData } from '../hooks/useTasksModalData'
import { useCheckInsQuery } from '@/hooks/queries'
import { haptics } from '@/lib/animations'

// =============================================================================
// TYPES
// =============================================================================

export interface MoodPatternModalProps {
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

const pulseAnimation = {
  scale: [1, 1.1, 1],
  transition: {
    duration: 2,
    repeat: Infinity,
    ease: 'easeInOut' as const,
  },
}

// =============================================================================
// COMPONENT
// =============================================================================

export function MoodPatternModal({ onClose }: MoodPatternModalProps) {
  const isMobile = useMediaQuery('(max-width: 768px)')
  // Use useCheckInsQuery for 7-day average (matches card display)
  const { weeklyStats, loading: queryLoading } = useCheckInsQuery()
  // Use useCheckInStats for trend, dataPoints, insights (pattern analysis)
  const { moodPattern, loading: statsLoading } = useCheckInStats()

  const loading = queryLoading || statsLoading
  // Use 7-day average from useCheckInsQuery (matches card)
  const avgMood = weeklyStats.avgMood

  const getTrendIcon = (trend: PatternData['trend']) => {
    switch (trend) {
      case 'improving':
        return <TrendingUp className="h-6 w-6 text-green-500" />
      case 'declining':
        return <TrendingDown className="h-6 w-6 text-red-500" />
      default:
        return <Minus className="h-6 w-6 text-gray-500" />
    }
  }

  const getTrendLabel = (trend: PatternData['trend']) => {
    switch (trend) {
      case 'improving':
        return 'Improving'
      case 'declining':
        return 'Needs Attention'
      default:
        return 'Stable'
    }
  }

  const getTrendColor = (trend: PatternData['trend']) => {
    switch (trend) {
      case 'improving':
        return 'text-green-600 bg-green-50 border-green-200'
      case 'declining':
        return 'text-red-600 bg-red-50 border-red-200'
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getMoodIcon = (value: number) => {
    if (value >= 8) return <Sun className="h-10 w-10 text-yellow-500" />
    if (value >= 6) return <Smile className="h-10 w-10 text-green-500" />
    if (value >= 4) return <Cloud className="h-10 w-10 text-blue-400" />
    return <CloudRain className="h-10 w-10 text-gray-500" />
  }

  const getMoodLabel = (value: number) => {
    if (value >= 8) return 'Excellent'
    if (value >= 6) return 'Good'
    if (value >= 4) return 'Fair'
    if (value >= 2) return 'Low'
    return 'Very Low'
  }

  const getMoodGradient = (value: number) => {
    if (value >= 8) return 'from-yellow-400 via-amber-400 to-orange-400'
    if (value >= 6) return 'from-green-400 via-emerald-400 to-teal-400'
    if (value >= 4) return 'from-blue-400 via-cyan-400 to-sky-400'
    return 'from-gray-400 via-slate-400 to-zinc-400'
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
                <Smile className="h-10 w-10 text-yellow-500" />
              </motion.div>
              <p className="text-sm text-muted-foreground">Analyzing mood patterns...</p>
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
          className={cn(
            'relative p-6 bg-gradient-to-br',
            getMoodGradient(avgMood)
          )}
        >
          {/* Decorative elements */}
          <motion.div
            animate={pulseAnimation}
            className="absolute top-4 right-12 w-12 h-12 rounded-full bg-white/10"
          />
          <div className="absolute bottom-2 left-8 w-8 h-8 rounded-full bg-white/5" />

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
              <Smile className="h-7 w-7 text-white" />
            </motion.div>
            <div>
              <h2 className="text-xl font-bold text-white">Mood Patterns</h2>
              <p className="text-white/80 text-sm">Track your emotional wellbeing</p>
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
            {/* Current Average Hero */}
            <motion.div
              variants={heroVariants}
              className="text-center py-6 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl border-2 border-yellow-200 shadow-sm"
            >
              <motion.div animate={pulseAnimation} className="inline-block mb-2">
                {getMoodIcon(avgMood)}
              </motion.div>
              <motion.p
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring' as const, stiffness: 300, delay: 0.3 }}
                className="text-4xl font-bold text-foreground"
              >
                {avgMood.toFixed(1)}/10
              </motion.p>
              <p className="text-sm text-muted-foreground mt-1">
                {getMoodLabel(avgMood)}
              </p>
            </motion.div>

            {/* Trend Card */}
            <motion.div
              variants={itemVariants}
              className={cn(
                'flex items-center gap-4 p-4 rounded-xl border-2',
                getTrendColor(moodPattern.trend)
              )}
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring' as const, delay: 0.4 }}
              >
                {getTrendIcon(moodPattern.trend)}
              </motion.div>
              <div>
                <p className="font-semibold">{getTrendLabel(moodPattern.trend)}</p>
                <p className="text-xs opacity-80">Based on recent check-ins</p>
              </div>
            </motion.div>

            {/* Chart Visualization */}
            {moodPattern.dataPoints.length > 0 && (
              <motion.div
                variants={itemVariants}
                className="bg-white rounded-xl border-2 border-gray-200 p-5"
              >
                <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                  <div className="w-1.5 h-5 rounded-full bg-gradient-to-b from-yellow-500 to-orange-500" />
                  Recent Mood Trend
                </h3>
                <div className="flex items-end justify-between h-40 gap-1">
                  {moodPattern.dataPoints.slice(-14).map((point, index) => (
                    <motion.div
                      key={index}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      transition={{ delay: 0.5 + index * 0.05 }}
                      className="flex-1 flex flex-col items-center gap-1"
                    >
                      <motion.div
                        initial={{ scaleY: 0 }}
                        animate={{ scaleY: 1 }}
                        transition={{ duration: 0.5, delay: 0.6 + index * 0.05 }}
                        style={{ originY: 1 }}
                        className="w-full rounded-t-md transition-all duration-300"
                      >
                        <div
                          className="w-full rounded-t-md"
                          style={{
                            height: `${(point.value / 10) * 120}px`,
                            background:
                              point.value >= 7
                                ? 'linear-gradient(to top, #22c55e, #4ade80)'
                                : point.value >= 5
                                  ? 'linear-gradient(to top, #eab308, #facc15)'
                                  : 'linear-gradient(to top, #ef4444, #f87171)',
                          }}
                        />
                      </motion.div>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {point.date.slice(5)}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Insights */}
            {moodPattern.insights.length > 0 && (
              <motion.div
                variants={itemVariants}
                className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-5 border-2 border-purple-200"
              >
                <div className="flex items-center gap-2 mb-3">
                  <Lightbulb className="h-5 w-5 text-purple-600" />
                  <h4 className="font-semibold text-purple-800">Insights</h4>
                </div>
                <div className="space-y-2">
                  {moodPattern.insights.map((insight, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.7 + index * 0.1 }}
                      className="flex items-start gap-2 text-sm text-purple-700"
                    >
                      <span className="text-purple-400 mt-0.5">-</span>
                      {insight}
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* No Data State */}
            {moodPattern.dataPoints.length === 0 && (
              <motion.div
                variants={itemVariants}
                className="text-center py-10 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring' as const, delay: 0.3 }}
                >
                  <Smile className="h-14 w-14 mx-auto text-gray-300 mb-3" />
                </motion.div>
                <h3 className="font-semibold text-foreground mb-1">No Mood Data Yet</h3>
                <p className="text-sm text-muted-foreground px-4">
                  Complete daily check-ins to track your mood patterns.
                </p>
              </motion.div>
            )}

            {/* Tips */}
            <motion.div
              variants={itemVariants}
              className="bg-gradient-to-r from-teal-50 to-cyan-50 rounded-xl p-5 border-2 border-teal-200"
            >
              <div className="flex items-center gap-2 mb-3">
                <Heart className="h-5 w-5 text-teal-600" />
                <h4 className="font-semibold text-teal-800">Tips for Better Mood</h4>
              </div>
              <div className="space-y-2">
                {[
                  'Maintain consistent sleep patterns',
                  'Practice gratitude daily',
                  'Stay connected with supportive people',
                  'Exercise regularly, even just a short walk',
                ].map((tip, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.8 + index * 0.1 }}
                    className="flex items-center gap-2 text-sm text-teal-700"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
                    {tip}
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

export default MoodPatternModal
