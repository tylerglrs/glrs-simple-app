import { motion } from 'framer-motion'
import {
  EnhancedDialog,
  EnhancedDialogContent,
} from '@/components/ui/enhanced-dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Activity, X, TrendingUp, TrendingDown, Minus, Lightbulb, Heart } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { useCheckInStats, type PatternData } from '../hooks/useTasksModalData'
import { haptics } from '@/lib/animations'

// =============================================================================
// TYPES
// =============================================================================

export interface AnxietyPatternModalProps {
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
  scale: [1, 1.08, 1],
  opacity: [1, 0.85, 1],
  transition: {
    duration: 2,
    repeat: Infinity,
    ease: 'easeInOut' as const,
  },
}

// =============================================================================
// COMPONENT
// =============================================================================

export function AnxietyPatternModal({ onClose }: AnxietyPatternModalProps) {
  const isMobile = useMediaQuery('(max-width: 768px)')
  const { anxietyPattern, loading } = useCheckInStats()


  const getTrendIcon = (trend: PatternData['trend']) => {
    switch (trend) {
      case 'improving':
        return <TrendingDown className="h-6 w-6 text-green-500" />
      case 'declining':
        return <TrendingUp className="h-6 w-6 text-red-500" />
      default:
        return <Minus className="h-6 w-6 text-gray-500" />
    }
  }

  const getTrendLabel = (trend: PatternData['trend']) => {
    switch (trend) {
      case 'improving':
        return 'Decreasing'
      case 'declining':
        return 'Increasing'
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

  const getAnxietyLevel = (value: number) => {
    if (value <= 2) return { label: 'Calm', color: 'text-green-600' }
    if (value <= 4) return { label: 'Low', color: 'text-green-500' }
    if (value <= 6) return { label: 'Moderate', color: 'text-yellow-600' }
    if (value <= 8) return { label: 'High', color: 'text-purple-600' }
    return { label: 'Very High', color: 'text-red-600' }
  }

  const getAnxietyGradient = (value: number) => {
    if (value <= 3) return 'from-green-500 via-teal-500 to-cyan-500'
    if (value <= 6) return 'from-purple-500 via-indigo-500 to-blue-500'
    return 'from-red-500 via-pink-500 to-purple-500'
  }

  const anxietyLevel = getAnxietyLevel(anxietyPattern.average)

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
                animate={pulseAnimation}
              >
                <Activity className="h-10 w-10 text-purple-500" />
              </motion.div>
              <p className="text-sm text-muted-foreground">Analyzing anxiety...</p>
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
            getAnxietyGradient(anxietyPattern.average)
          )}
        >
          {/* Decorative elements */}
          <motion.div
            animate={pulseAnimation}
            className="absolute top-4 right-12 w-8 h-8 rounded-full bg-white/20"
          />
          <div className="absolute bottom-2 left-8 w-4 h-4 rounded-full bg-white/10" />

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
              <Activity className="h-7 w-7 text-white" />
            </motion.div>
            <div>
              <h2 className="text-xl font-bold text-white">Anxiety Patterns</h2>
              <p className="text-white/80 text-sm">Track your stress levels</p>
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
            {/* Current Average Hero */}
            <motion.div
              variants={heroVariants}
              className="text-center py-6 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl border-2 border-purple-200 shadow-sm"
            >
              <motion.div animate={pulseAnimation} className="inline-block mb-2">
                <Activity className={cn('h-10 w-10', anxietyLevel.color)} />
              </motion.div>
              <motion.p
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring' as const, stiffness: 300, delay: 0.3 }}
                className="text-4xl font-bold text-foreground"
              >
                {anxietyPattern.average.toFixed(1)}/10
              </motion.p>
              <p className={cn('text-sm font-medium mt-1', anxietyLevel.color)}>
                {anxietyLevel.label}
              </p>
            </motion.div>

            {/* Trend Card */}
            <motion.div
              variants={itemVariants}
              className={cn(
                'flex items-center gap-4 p-4 rounded-xl border-2',
                getTrendColor(anxietyPattern.trend)
              )}
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring' as const, delay: 0.4 }}
              >
                {getTrendIcon(anxietyPattern.trend)}
              </motion.div>
              <div>
                <p className="font-semibold">{getTrendLabel(anxietyPattern.trend)}</p>
                <p className="text-xs opacity-80">Anxiety level trend</p>
              </div>
            </motion.div>

            {/* Chart Visualization */}
            {anxietyPattern.dataPoints.length > 0 && (
              <motion.div
                variants={itemVariants}
                className="bg-white rounded-xl border-2 border-gray-200 p-5"
              >
                <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                  <div className="w-1.5 h-5 rounded-full bg-gradient-to-b from-purple-500 to-indigo-500" />
                  Recent Anxiety Trend
                </h3>
                <div className="flex items-end justify-between h-40 gap-1">
                  {anxietyPattern.dataPoints.slice(-14).map((point, index) => (
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
                              point.value <= 3
                                ? 'linear-gradient(to top, #22c55e, #4ade80)'
                                : point.value <= 6
                                  ? 'linear-gradient(to top, #a855f7, #c084fc)'
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
            {anxietyPattern.insights.length > 0 && (
              <motion.div
                variants={itemVariants}
                className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-5 border-2 border-purple-200"
              >
                <div className="flex items-center gap-2 mb-3">
                  <Lightbulb className="h-5 w-5 text-purple-600" />
                  <h4 className="font-semibold text-purple-800">Insights</h4>
                </div>
                <div className="space-y-2">
                  {anxietyPattern.insights.map((insight, index) => (
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
            {anxietyPattern.dataPoints.length === 0 && (
              <motion.div
                variants={itemVariants}
                className="text-center py-10 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring' as const, delay: 0.3 }}
                >
                  <Activity className="h-14 w-14 mx-auto text-gray-300 mb-3" />
                </motion.div>
                <h3 className="font-semibold text-foreground mb-1">No Anxiety Data Yet</h3>
                <p className="text-sm text-muted-foreground px-4">
                  Complete daily check-ins to track your anxiety patterns.
                </p>
              </motion.div>
            )}

            {/* Calming Techniques */}
            <motion.div
              variants={itemVariants}
              className="bg-gradient-to-r from-teal-50 to-cyan-50 rounded-xl p-5 border-2 border-teal-200"
            >
              <div className="flex items-center gap-2 mb-3">
                <Heart className="h-5 w-5 text-teal-600" />
                <h4 className="font-semibold text-teal-800">Calming Techniques</h4>
              </div>
              <div className="space-y-2">
                {[
                  { title: 'Box Breathing:', desc: '4 sec in, 4 hold, 4 out, 4 hold' },
                  { title: '5-4-3-2-1 Grounding:', desc: 'Notice 5 see, 4 hear, 3 feel, 2 smell, 1 taste' },
                  { title: 'Progressive Relaxation:', desc: 'Tense and release each muscle group' },
                  { title: 'Cold Water:', desc: 'Splash face or hold ice to reset nervous system' },
                ].map((tip, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.8 + index * 0.1 }}
                    className="flex items-start gap-2 text-sm text-teal-700"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-500 mt-1.5 shrink-0" />
                    <span><strong>{tip.title}</strong> {tip.desc}</span>
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

export default AnxietyPatternModal
