import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  EnhancedDialog,
  EnhancedDialogContent,
} from '@/components/ui/enhanced-dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import {
  X,
  TrendingUp,
  TrendingDown,
  Minus,
  Lightbulb,
  Heart,
  Brain,
  Activity,
  Moon,
  Sun,
  Smile,
  Cloud,
  CloudRain,
  Flame,
  Loader2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { useCheckInStats, type PatternData } from '../hooks/useTasksModalData'
import { haptics } from '@/lib/animations'

// =============================================================================
// TYPES
// =============================================================================

export type PatternType = 'mood' | 'anxiety' | 'craving' | 'sleep'

export interface PatternModalProps {
  initialTab?: PatternType
  onClose: () => void
}

interface TabConfig {
  id: PatternType
  label: string
  icon: React.ReactNode
  color: string
  gradient: string
  bgColor: string
  getValue: (data: PatternData) => number
  getIcon: (value: number) => React.ReactNode
  getLabel: (value: number) => string
  getGradient: (value: number) => string
  invertTrend?: boolean // For anxiety/craving where lower is better
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

const tabContentVariants = {
  hidden: { opacity: 0, x: 20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, x: -20, transition: { duration: 0.2 } },
}

// =============================================================================
// TAB CONFIGURATIONS
// =============================================================================

const TAB_CONFIGS: TabConfig[] = [
  {
    id: 'mood',
    label: 'Mood',
    icon: <Smile className="h-4 w-4" />,
    color: 'text-amber-600',
    gradient: 'from-amber-400 to-orange-500',
    bgColor: 'bg-amber-50',
    getValue: (data) => data.average,
    getIcon: (value) => {
      if (value >= 8) return <Sun className="h-10 w-10 text-yellow-500" />
      if (value >= 6) return <Smile className="h-10 w-10 text-green-500" />
      if (value >= 4) return <Cloud className="h-10 w-10 text-blue-400" />
      return <CloudRain className="h-10 w-10 text-gray-500" />
    },
    getLabel: (value) => {
      if (value >= 8) return 'Excellent'
      if (value >= 6) return 'Good'
      if (value >= 4) return 'Fair'
      if (value >= 2) return 'Low'
      return 'Very Low'
    },
    getGradient: (value) => {
      if (value >= 8) return 'from-yellow-400 via-amber-400 to-orange-400'
      if (value >= 6) return 'from-green-400 via-emerald-400 to-teal-400'
      if (value >= 4) return 'from-blue-400 via-cyan-400 to-sky-400'
      return 'from-gray-400 via-slate-400 to-zinc-400'
    },
  },
  {
    id: 'anxiety',
    label: 'Anxiety',
    icon: <Brain className="h-4 w-4" />,
    color: 'text-purple-600',
    gradient: 'from-purple-400 to-indigo-500',
    bgColor: 'bg-purple-50',
    invertTrend: true,
    getValue: (data) => data.average,
    getIcon: (value) => {
      if (value <= 2) return <Sun className="h-10 w-10 text-green-500" />
      if (value <= 4) return <Cloud className="h-10 w-10 text-blue-400" />
      if (value <= 6) return <Activity className="h-10 w-10 text-amber-500" />
      return <Brain className="h-10 w-10 text-red-500" />
    },
    getLabel: (value) => {
      if (value <= 2) return 'Calm'
      if (value <= 4) return 'Mild'
      if (value <= 6) return 'Moderate'
      if (value <= 8) return 'High'
      return 'Severe'
    },
    getGradient: (value) => {
      if (value <= 2) return 'from-green-400 via-emerald-400 to-teal-400'
      if (value <= 4) return 'from-blue-400 via-cyan-400 to-sky-400'
      if (value <= 6) return 'from-amber-400 via-yellow-400 to-orange-400'
      return 'from-red-400 via-rose-400 to-pink-400'
    },
  },
  {
    id: 'craving',
    label: 'Cravings',
    icon: <Flame className="h-4 w-4" />,
    color: 'text-rose-600',
    gradient: 'from-rose-400 to-red-500',
    bgColor: 'bg-rose-50',
    invertTrend: true,
    getValue: (data) => data.average,
    getIcon: (value) => {
      if (value <= 2) return <Heart className="h-10 w-10 text-green-500" />
      if (value <= 4) return <Cloud className="h-10 w-10 text-blue-400" />
      if (value <= 6) return <Activity className="h-10 w-10 text-amber-500" />
      return <Flame className="h-10 w-10 text-red-500" />
    },
    getLabel: (value) => {
      if (value <= 2) return 'Minimal'
      if (value <= 4) return 'Low'
      if (value <= 6) return 'Moderate'
      if (value <= 8) return 'Strong'
      return 'Intense'
    },
    getGradient: (value) => {
      if (value <= 2) return 'from-green-400 via-emerald-400 to-teal-400'
      if (value <= 4) return 'from-blue-400 via-cyan-400 to-sky-400'
      if (value <= 6) return 'from-amber-400 via-yellow-400 to-orange-400'
      return 'from-red-400 via-rose-400 to-pink-400'
    },
  },
  {
    id: 'sleep',
    label: 'Sleep',
    icon: <Moon className="h-4 w-4" />,
    color: 'text-indigo-600',
    gradient: 'from-indigo-400 to-blue-500',
    bgColor: 'bg-indigo-50',
    getValue: (data) => data.average,
    getIcon: (value) => {
      if (value >= 8) return <Moon className="h-10 w-10 text-indigo-500" />
      if (value >= 6) return <Cloud className="h-10 w-10 text-blue-400" />
      if (value >= 4) return <Activity className="h-10 w-10 text-amber-500" />
      return <CloudRain className="h-10 w-10 text-gray-500" />
    },
    getLabel: (value) => {
      if (value >= 8) return 'Excellent'
      if (value >= 6) return 'Good'
      if (value >= 4) return 'Fair'
      if (value >= 2) return 'Poor'
      return 'Very Poor'
    },
    getGradient: (value) => {
      if (value >= 8) return 'from-indigo-400 via-purple-400 to-violet-400'
      if (value >= 6) return 'from-blue-400 via-cyan-400 to-sky-400'
      if (value >= 4) return 'from-amber-400 via-yellow-400 to-orange-400'
      return 'from-gray-400 via-slate-400 to-zinc-400'
    },
  },
]

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function getTrendIcon(trend: PatternData['trend'], inverted = false) {
  const actualTrend = inverted
    ? (trend === 'improving' ? 'declining' : trend === 'declining' ? 'improving' : trend)
    : trend

  switch (actualTrend) {
    case 'improving':
      return <TrendingUp className="h-5 w-5 text-green-500" />
    case 'declining':
      return <TrendingDown className="h-5 w-5 text-red-500" />
    default:
      return <Minus className="h-5 w-5 text-gray-500" />
  }
}

function getTrendLabel(trend: PatternData['trend'], inverted = false) {
  const actualTrend = inverted
    ? (trend === 'improving' ? 'declining' : trend === 'declining' ? 'improving' : trend)
    : trend

  switch (actualTrend) {
    case 'improving':
      return 'Improving'
    case 'declining':
      return 'Needs Attention'
    default:
      return 'Stable'
  }
}

function getTrendColor(trend: PatternData['trend'], inverted = false) {
  const actualTrend = inverted
    ? (trend === 'improving' ? 'declining' : trend === 'declining' ? 'improving' : trend)
    : trend

  switch (actualTrend) {
    case 'improving':
      return 'text-green-600 bg-green-50 border-green-200'
    case 'declining':
      return 'text-red-600 bg-red-50 border-red-200'
    default:
      return 'text-gray-600 bg-gray-50 border-gray-200'
  }
}

// =============================================================================
// PATTERN TAB CONTENT COMPONENT
// =============================================================================

interface PatternTabContentProps {
  config: TabConfig
  data: PatternData
  isMobile: boolean
}

function PatternTabContent({ config, data, isMobile }: PatternTabContentProps) {
  const value = config.getValue(data)
  const icon = config.getIcon(value)
  const label = config.getLabel(value)
  const gradient = config.getGradient(value)

  return (
    <motion.div
      variants={tabContentVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-4"
      >
        {/* Hero Section */}
        <motion.div
          variants={heroVariants}
          className={cn(
            'relative overflow-hidden rounded-2xl p-6',
            'bg-gradient-to-br',
            gradient
          )}
        >
          {/* Decorative circles */}
          <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full bg-white/10" />
          <div className="absolute -bottom-6 -left-6 w-16 h-16 rounded-full bg-white/10" />

          <div className="relative flex items-center justify-between">
            <div className="flex-1">
              <p className="text-white/80 text-sm font-medium mb-1">7-Day Average</p>
              <div className="flex items-baseline gap-2">
                <span className={cn('font-bold text-white', isMobile ? 'text-4xl' : 'text-5xl')}>
                  {value > 0 ? value.toFixed(1) : '-'}
                </span>
                <span className="text-white/70 text-lg">/10</span>
              </div>
              <p className="text-white/90 font-medium mt-1">{label}</p>
            </div>

            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              className="p-4 bg-white/20 rounded-2xl backdrop-blur-sm"
            >
              {icon}
            </motion.div>
          </div>
        </motion.div>

        {/* Trend Card */}
        <motion.div variants={itemVariants}>
          <div
            className={cn(
              'rounded-xl border p-4',
              getTrendColor(data.trend, config.invertTrend)
            )}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {getTrendIcon(data.trend, config.invertTrend)}
                <div>
                  <p className="font-semibold">Trend</p>
                  <p className="text-sm opacity-80">
                    {getTrendLabel(data.trend, config.invertTrend)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Data Points Chart */}
        {data.dataPoints.length > 0 && (
          <motion.div variants={itemVariants}>
            <div className="bg-gray-50 rounded-xl p-4">
              <h3 className={cn('font-semibold text-gray-800 mb-3', isMobile ? 'text-sm' : 'text-base')}>
                Recent History
              </h3>
              <div className="flex items-end justify-between gap-1 h-24">
                {data.dataPoints.slice(-7).map((point, index) => {
                  const height = (point.value / 10) * 100
                  return (
                    <div key={index} className="flex flex-col items-center flex-1">
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${height}%` }}
                        transition={{ delay: index * 0.05, duration: 0.3 }}
                        className={cn(
                          'w-full rounded-t-sm',
                          `bg-gradient-to-t ${gradient}`
                        )}
                      />
                      <span className="text-xs text-gray-500 mt-1">
                        {new Date(point.date).toLocaleDateString('en-US', { weekday: 'narrow' })}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          </motion.div>
        )}

        {/* Insights */}
        {data.insights && data.insights.length > 0 && (
          <motion.div variants={itemVariants}>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-amber-100 rounded-lg shrink-0">
                  <Lightbulb className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <h3 className={cn('font-semibold text-amber-800 mb-2', isMobile ? 'text-sm' : 'text-base')}>
                    Insights
                  </h3>
                  <ul className="space-y-2">
                    {data.insights.map((insight, index) => (
                      <li
                        key={index}
                        className={cn('text-amber-700', isMobile ? 'text-xs' : 'text-sm')}
                      >
                        {insight}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  )
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function PatternModal({ initialTab = 'mood', onClose }: PatternModalProps) {
  const isMobile = useMediaQuery('(max-width: 768px)')
  const [activeTab, setActiveTab] = useState<PatternType>(initialTab)
  const { moodPattern, anxietyPattern, cravingPattern, sleepPattern, loading } = useCheckInStats()

  const patternDataMap: Record<PatternType, PatternData> = {
    mood: moodPattern,
    anxiety: anxietyPattern,
    craving: cravingPattern,
    sleep: sleepPattern,
  }

  // Loading state
  if (loading) {
    return (
      <EnhancedDialog open onOpenChange={onClose}>
        <EnhancedDialogContent className="max-w-md">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        </EnhancedDialogContent>
      </EnhancedDialog>
    )
  }

  return (
    <EnhancedDialog open onOpenChange={onClose}>
      <EnhancedDialogContent className={cn('max-w-md', isMobile && 'h-[90vh]')}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className={cn('font-bold text-gray-800', isMobile ? 'text-lg' : 'text-xl')}>
            Your Patterns
          </h2>
          <button
            onClick={() => {
              haptics.tap()
              onClose()
            }}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={(value) => {
            haptics.tap()
            setActiveTab(value as PatternType)
          }}
          className="flex-1 flex flex-col"
        >
          <TabsList className="grid grid-cols-4 mx-4 mt-4">
            {TAB_CONFIGS.map((config) => (
              <TabsTrigger
                key={config.id}
                value={config.id}
                className={cn(
                  'flex items-center gap-1.5 text-xs',
                  activeTab === config.id && config.color
                )}
              >
                {config.icon}
                <span className="hidden sm:inline">{config.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          <ScrollArea className="flex-1 px-4 pb-4">
            <AnimatePresence mode="wait">
              {TAB_CONFIGS.map((config) => (
                <TabsContent
                  key={config.id}
                  value={config.id}
                  className="mt-4 focus:outline-none"
                >
                  <PatternTabContent
                    config={config}
                    data={patternDataMap[config.id]}
                    isMobile={isMobile}
                  />
                </TabsContent>
              ))}
            </AnimatePresence>
          </ScrollArea>
        </Tabs>
      </EnhancedDialogContent>
    </EnhancedDialog>
  )
}

export default PatternModal
