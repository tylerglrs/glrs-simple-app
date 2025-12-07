import { motion } from 'framer-motion'
import {
  EnhancedDialog,
  EnhancedDialogContent,
} from '@/components/ui/enhanced-dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Moon, X, TrendingUp, TrendingDown, Minus, Lightbulb, Bed, Star, CloudMoon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { useCheckInStats, type PatternData } from '../hooks/useTasksModalData'
import { haptics } from '@/lib/animations'

// =============================================================================
// TYPES
// =============================================================================

export interface SleepPatternModalProps {
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
  rotate: [-5, 5, -5],
  scale: [1, 1.05, 1],
  transition: {
    duration: 4,
    repeat: Infinity,
    ease: 'easeInOut' as const,
  },
}

const starAnimation = {
  opacity: [0.5, 1, 0.5],
  scale: [0.8, 1, 0.8],
  transition: {
    duration: 2,
    repeat: Infinity,
    ease: 'easeInOut' as const,
  },
}

// =============================================================================
// COMPONENT
// =============================================================================

export function SleepPatternModal({ onClose }: SleepPatternModalProps) {
  const isMobile = useMediaQuery('(max-width: 768px)')
  const { sleepPattern, loading } = useCheckInStats()

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
        return 'Declining'
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

  const getSleepQuality = (value: number) => {
    if (value >= 8) return { label: 'Excellent', color: 'text-green-600' }
    if (value >= 6) return { label: 'Good', color: 'text-teal-600' }
    if (value >= 4) return { label: 'Fair', color: 'text-yellow-600' }
    if (value >= 2) return { label: 'Poor', color: 'text-orange-600' }
    return { label: 'Very Poor', color: 'text-red-600' }
  }

  const getSleepGradient = (value: number) => {
    if (value >= 7) return 'from-indigo-600 via-purple-600 to-blue-600'
    if (value >= 5) return 'from-indigo-500 via-violet-500 to-purple-500'
    return 'from-slate-600 via-gray-600 to-zinc-600'
  }

  const sleepQuality = getSleepQuality(sleepPattern.average)

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
              <motion.div animate={moonAnimation}>
                <Moon className="h-10 w-10 text-indigo-500" />
              </motion.div>
              <p className="text-sm text-muted-foreground">Analyzing sleep...</p>
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
            'relative p-6 bg-gradient-to-br overflow-hidden',
            getSleepGradient(sleepPattern.average)
          )}
        >
          {/* Decorative stars */}
          <motion.div
            animate={starAnimation}
            className="absolute top-3 right-16 text-white/30"
          >
            <Star className="h-3 w-3 fill-current" />
          </motion.div>
          <motion.div
            animate={{ ...starAnimation, transition: { ...starAnimation.transition, delay: 0.5 } }}
            className="absolute top-8 right-24 text-white/20"
          >
            <Star className="h-2 w-2 fill-current" />
          </motion.div>
          <motion.div
            animate={{ ...starAnimation, transition: { ...starAnimation.transition, delay: 1 } }}
            className="absolute bottom-6 left-20 text-white/15"
          >
            <Star className="h-2.5 w-2.5 fill-current" />
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
              animate={moonAnimation}
              className="p-3 rounded-xl bg-white/20 backdrop-blur-sm"
            >
              <Moon className="h-7 w-7 text-white" />
            </motion.div>
            <div>
              <h2 className="text-xl font-bold text-white">Sleep Patterns</h2>
              <p className="text-white/80 text-sm">Track your rest quality</p>
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
              className="text-center py-6 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border-2 border-indigo-200 shadow-sm"
            >
              <motion.div animate={moonAnimation} className="inline-block mb-2">
                <Moon className={cn('h-10 w-10', sleepQuality.color)} />
              </motion.div>
              <motion.p
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring' as const, stiffness: 300, delay: 0.3 }}
                className="text-4xl font-bold text-foreground"
              >
                {sleepPattern.average.toFixed(1)}/10
              </motion.p>
              <p className={cn('text-sm font-medium mt-1', sleepQuality.color)}>
                {sleepQuality.label} Quality
              </p>
            </motion.div>

            {/* Trend Card */}
            <motion.div
              variants={itemVariants}
              className={cn(
                'flex items-center gap-4 p-4 rounded-xl border-2',
                getTrendColor(sleepPattern.trend)
              )}
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring' as const, delay: 0.4 }}
              >
                {getTrendIcon(sleepPattern.trend)}
              </motion.div>
              <div>
                <p className="font-semibold">{getTrendLabel(sleepPattern.trend)}</p>
                <p className="text-xs opacity-80">Sleep quality trend</p>
              </div>
            </motion.div>

            {/* Chart Visualization */}
            {sleepPattern.dataPoints.length > 0 && (
              <motion.div
                variants={itemVariants}
                className="bg-white rounded-xl border-2 border-gray-200 p-5"
              >
                <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                  <div className="w-1.5 h-5 rounded-full bg-gradient-to-b from-indigo-500 to-purple-500" />
                  Recent Sleep Trend
                </h3>
                <div className="flex items-end justify-between h-40 gap-1">
                  {sleepPattern.dataPoints.slice(-14).map((point, index) => (
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
                                  ? 'linear-gradient(to top, #6366f1, #818cf8)'
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
            {sleepPattern.insights.length > 0 && (
              <motion.div
                variants={itemVariants}
                className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-5 border-2 border-indigo-200"
              >
                <div className="flex items-center gap-2 mb-3">
                  <Lightbulb className="h-5 w-5 text-indigo-600" />
                  <h4 className="font-semibold text-indigo-800">Insights</h4>
                </div>
                <div className="space-y-2">
                  {sleepPattern.insights.map((insight, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.7 + index * 0.1 }}
                      className="flex items-start gap-2 text-sm text-indigo-700"
                    >
                      <span className="text-indigo-400 mt-0.5">-</span>
                      {insight}
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* No Data State */}
            {sleepPattern.dataPoints.length === 0 && (
              <motion.div
                variants={itemVariants}
                className="text-center py-10 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring' as const, delay: 0.3 }}
                >
                  <Moon className="h-14 w-14 mx-auto text-gray-300 mb-3" />
                </motion.div>
                <h3 className="font-semibold text-foreground mb-1">No Sleep Data Yet</h3>
                <p className="text-sm text-muted-foreground px-4">
                  Complete morning check-ins to track your sleep patterns.
                </p>
              </motion.div>
            )}

            {/* Sleep Hygiene Tips */}
            <motion.div
              variants={itemVariants}
              className="bg-gradient-to-r from-teal-50 to-cyan-50 rounded-xl p-5 border-2 border-teal-200"
            >
              <div className="flex items-center gap-2 mb-3">
                <Bed className="h-5 w-5 text-teal-600" />
                <h4 className="font-semibold text-teal-800">Sleep Hygiene Tips</h4>
              </div>
              <div className="space-y-2">
                {[
                  'Keep a consistent sleep schedule, even on weekends',
                  'Avoid screens 1 hour before bed',
                  'Keep your room cool, dark, and quiet',
                  'Limit caffeine after 2 PM',
                  'Create a relaxing bedtime routine',
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

            {/* Recovery Connection */}
            <motion.div
              variants={itemVariants}
              className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-5 border-2 border-blue-200"
            >
              <div className="flex items-center gap-2 mb-3">
                <CloudMoon className="h-5 w-5 text-blue-600" />
                <h4 className="font-semibold text-blue-800">Why Sleep Matters for Recovery</h4>
              </div>
              <p className="text-sm text-blue-700 leading-relaxed">
                Quality sleep is crucial for recovery. Poor sleep can increase cravings,
                anxiety, and make it harder to cope with stress. Prioritizing rest
                supports your physical healing and emotional resilience.
              </p>
            </motion.div>
          </motion.div>
        </ScrollArea>
      </EnhancedDialogContent>
    </EnhancedDialog>
  )
}

export default SleepPatternModal
