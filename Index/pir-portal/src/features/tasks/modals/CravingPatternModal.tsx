import { motion } from 'framer-motion'
import {
  EnhancedDialog,
  EnhancedDialogContent,
} from '@/components/ui/enhanced-dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Flame, X, TrendingUp, TrendingDown, Minus, Lightbulb, Shield } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { useCheckInStats, type PatternData } from '../hooks/useTasksModalData'
import { haptics } from '@/lib/animations'

// =============================================================================
// TYPES
// =============================================================================

export interface CravingPatternModalProps {
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
  scale: [1, 1.15, 1],
  rotate: [0, -3, 3, 0],
  transition: {
    duration: 1.5,
    repeat: Infinity,
    ease: 'easeInOut' as const,
  },
}

// =============================================================================
// COMPONENT
// =============================================================================

export function CravingPatternModal({ onClose }: CravingPatternModalProps) {
  const isMobile = useMediaQuery('(max-width: 768px)')
  const { cravingPattern, loading } = useCheckInStats()


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

  const getCravingLevel = (value: number) => {
    if (value <= 2) return { label: 'Very Low', color: 'text-green-600' }
    if (value <= 4) return { label: 'Low', color: 'text-green-500' }
    if (value <= 6) return { label: 'Moderate', color: 'text-yellow-600' }
    if (value <= 8) return { label: 'High', color: 'text-orange-600' }
    return { label: 'Very High', color: 'text-red-600' }
  }

  const getCravingGradient = (value: number) => {
    if (value <= 3) return 'from-green-500 via-emerald-500 to-teal-500'
    if (value <= 6) return 'from-yellow-500 via-amber-500 to-orange-500'
    return 'from-orange-500 via-red-500 to-rose-500'
  }

  const cravingLevel = getCravingLevel(cravingPattern.average)

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
              <p className="text-sm text-muted-foreground">Analyzing cravings...</p>
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
            getCravingGradient(cravingPattern.average)
          )}
        >
          {/* Decorative flames */}
          <motion.div
            animate={flameAnimation}
            className="absolute top-4 right-12 text-white/20"
          >
            <Flame className="h-6 w-6" />
          </motion.div>
          <div className="absolute bottom-2 left-8 text-white/10">
            <Flame className="h-4 w-4" />
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
              animate={flameAnimation}
              className="p-3 rounded-xl bg-white/20 backdrop-blur-sm"
            >
              <Flame className="h-7 w-7 text-white" />
            </motion.div>
            <div>
              <h2 className="text-xl font-bold text-white">Craving Patterns</h2>
              <p className="text-white/80 text-sm">Track your craving intensity</p>
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
              className="text-center py-6 bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl border-2 border-orange-200 shadow-sm"
            >
              <motion.div animate={flameAnimation} className="inline-block mb-2">
                <Flame className={cn('h-10 w-10', cravingLevel.color)} />
              </motion.div>
              <motion.p
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring' as const, stiffness: 300, delay: 0.3 }}
                className="text-4xl font-bold text-foreground"
              >
                {cravingPattern.average.toFixed(1)}/10
              </motion.p>
              <p className={cn('text-sm font-medium mt-1', cravingLevel.color)}>
                {cravingLevel.label}
              </p>
            </motion.div>

            {/* Trend Card */}
            <motion.div
              variants={itemVariants}
              className={cn(
                'flex items-center gap-4 p-4 rounded-xl border-2',
                getTrendColor(cravingPattern.trend)
              )}
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring' as const, delay: 0.4 }}
              >
                {getTrendIcon(cravingPattern.trend)}
              </motion.div>
              <div>
                <p className="font-semibold">{getTrendLabel(cravingPattern.trend)}</p>
                <p className="text-xs opacity-80">Craving intensity trend</p>
              </div>
            </motion.div>

            {/* Chart Visualization */}
            {cravingPattern.dataPoints.length > 0 && (
              <motion.div
                variants={itemVariants}
                className="bg-white rounded-xl border-2 border-gray-200 p-5"
              >
                <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                  <div className="w-1.5 h-5 rounded-full bg-gradient-to-b from-orange-500 to-red-500" />
                  Recent Craving Trend
                </h3>
                <div className="flex items-end justify-between h-40 gap-1">
                  {cravingPattern.dataPoints.slice(-14).map((point, index) => (
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
            {cravingPattern.insights.length > 0 && (
              <motion.div
                variants={itemVariants}
                className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl p-5 border-2 border-orange-200"
              >
                <div className="flex items-center gap-2 mb-3">
                  <Lightbulb className="h-5 w-5 text-orange-600" />
                  <h4 className="font-semibold text-orange-800">Insights</h4>
                </div>
                <div className="space-y-2">
                  {cravingPattern.insights.map((insight, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.7 + index * 0.1 }}
                      className="flex items-start gap-2 text-sm text-orange-700"
                    >
                      <span className="text-orange-400 mt-0.5">-</span>
                      {insight}
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* No Data State */}
            {cravingPattern.dataPoints.length === 0 && (
              <motion.div
                variants={itemVariants}
                className="text-center py-10 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring' as const, delay: 0.3 }}
                >
                  <Flame className="h-14 w-14 mx-auto text-gray-300 mb-3" />
                </motion.div>
                <h3 className="font-semibold text-foreground mb-1">No Craving Data Yet</h3>
                <p className="text-sm text-muted-foreground px-4">
                  Complete daily check-ins to track your craving patterns.
                </p>
              </motion.div>
            )}

            {/* Coping Strategies */}
            <motion.div
              variants={itemVariants}
              className="bg-gradient-to-r from-teal-50 to-cyan-50 rounded-xl p-5 border-2 border-teal-200"
            >
              <div className="flex items-center gap-2 mb-3">
                <Shield className="h-5 w-5 text-teal-600" />
                <h4 className="font-semibold text-teal-800">Coping Strategies</h4>
              </div>
              <div className="space-y-2">
                {[
                  'Use the H.A.L.T. check: Hungry, Angry, Lonely, Tired?',
                  'Practice deep breathing or grounding',
                  'Call your sponsor or support person',
                  'Distract with physical activity',
                  'Remember: Cravings pass in 15-20 minutes',
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

export default CravingPatternModal
