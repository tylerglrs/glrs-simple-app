import { motion } from 'framer-motion'
import {
  Brain,
  Sparkles,
  TrendingUp,
  Heart,
  Lightbulb,
  Clock,
  AlertCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useReflectionThemes } from '@/hooks'
import type { ReflectionThemesData } from '@/hooks'

// =============================================================================
// TYPES
// =============================================================================

export interface ReflectionThemesProps {
  isLoading?: boolean
  className?: string
}

// Legacy type alias for backwards compatibility
export type AIReflectionThemesProps = ReflectionThemesProps

// Card type from Firestore
type ReflectionCardType = 'dominant_topic' | 'gratitude_pattern' | 'timing_insight' | 'gap_analysis' | 'onboarding' | 'encouragement'

// =============================================================================
// ANIMATION VARIANTS
// =============================================================================

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring' as const,
      stiffness: 400,
      damping: 25,
    },
  },
}

const pulseVariants = {
  initial: { scale: 1, opacity: 0.6 },
  animate: {
    scale: [1, 1.1, 1],
    opacity: [0.6, 1, 0.6],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'easeInOut' as const,
    },
  },
}

// =============================================================================
// DEFAULT INSIGHTS (shown when no AI data available)
// =============================================================================

const DEFAULT_CARDS: ReflectionThemesData['cards'] = [
  {
    id: 'default-1',
    type: 'gap_analysis',
    icon: 'Lightbulb',
    iconColor: '#f59e0b',
    title: 'Start your reflection journey',
    message: 'Begin with evening reflections to track your thoughts, moods, and progress. Even a few sentences can reveal powerful patterns over time.',
    basedOn: [],
    cta: null,
  },
  {
    id: 'default-2',
    type: 'gratitude_pattern',
    icon: 'Heart',
    iconColor: '#ec4899',
    title: 'Practice daily gratitude',
    message: "Try listing 3 things you're grateful for each day. This simple habit has been shown to improve mood and strengthen recovery.",
    basedOn: [],
    cta: null,
  },
  {
    id: 'default-3',
    type: 'timing_insight',
    icon: 'Clock',
    iconColor: '#06b6d4',
    title: 'Build your routine',
    message: 'Consistent reflection at the same time each day creates a powerful habit. Most find evenings work best for looking back on the day.',
    basedOn: [],
    cta: null,
  },
]

// =============================================================================
// CARD TYPE CONFIG
// =============================================================================

function getCardIcon(type: ReflectionCardType, iconName?: string) {
  // Fallback icon mapping for common icon names from AI
  if (iconName) {
    switch (iconName) {
      case 'Sparkles': return <Sparkles className="h-4 w-4" />
      case 'Heart': return <Heart className="h-4 w-4" />
      case 'Clock': return <Clock className="h-4 w-4" />
      case 'AlertCircle': return <AlertCircle className="h-4 w-4" />
      case 'TrendingUp': return <TrendingUp className="h-4 w-4" />
      case 'Lightbulb': return <Lightbulb className="h-4 w-4" />
      case 'FileText': return <Sparkles className="h-4 w-4" />
      case 'HelpCircle': return <Lightbulb className="h-4 w-4" />
      case 'Brain': return <Brain className="h-4 w-4" />
      case 'BookOpen': return <Sparkles className="h-4 w-4" />
    }
  }

  // Map from type if no iconName provided
  const iconMap: Record<ReflectionCardType, React.ReactNode> = {
    dominant_topic: <Sparkles className="h-4 w-4" />,
    gratitude_pattern: <Heart className="h-4 w-4" />,
    timing_insight: <Clock className="h-4 w-4" />,
    gap_analysis: <AlertCircle className="h-4 w-4" />,
    onboarding: <Lightbulb className="h-4 w-4" />,
    encouragement: <Sparkles className="h-4 w-4" />,
  }

  return iconMap[type] || <Sparkles className="h-4 w-4" />
}

function getCardColors(type: ReflectionCardType, iconColor?: string) {
  // Default colors by type
  const colorMap: Record<ReflectionCardType, { bg: string; border: string; icon: string }> = {
    dominant_topic: { bg: 'bg-violet-500/10', border: 'border-violet-500/30', icon: '#8b5cf6' },
    gratitude_pattern: { bg: 'bg-pink-500/10', border: 'border-pink-500/30', icon: '#ec4899' },
    timing_insight: { bg: 'bg-cyan-500/10', border: 'border-cyan-500/30', icon: '#06b6d4' },
    gap_analysis: { bg: 'bg-amber-500/10', border: 'border-amber-500/30', icon: '#f59e0b' },
    onboarding: { bg: 'bg-slate-500/10', border: 'border-slate-500/30', icon: '#6b7280' },
    encouragement: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', icon: '#22c55e' },
  }

  // Use iconColor from AI if provided, otherwise use colorMap
  if (iconColor) {
    return {
      bg: colorMap[type]?.bg || 'bg-slate-500/10',
      border: colorMap[type]?.border || 'border-slate-500/30',
      icon: iconColor,
    }
  }

  return colorMap[type] || colorMap.onboarding
}

// =============================================================================
// LOADING SKELETON
// =============================================================================

function LoadingSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="p-3 rounded-lg bg-slate-700/30 animate-pulse">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-4 w-4 rounded bg-slate-600" />
            <div className="h-4 w-32 rounded bg-slate-600" />
          </div>
          <div className="h-3 w-full rounded bg-slate-600/50" />
          <div className="h-3 w-3/4 rounded bg-slate-600/50 mt-1" />
        </div>
      ))}
    </div>
  )
}

// =============================================================================
// STATS BAR
// =============================================================================

interface StatsBarProps {
  totalReflections: number
  totalGratitudes: number
}

function StatsBar({ totalReflections, totalGratitudes }: StatsBarProps) {
  const stats = [
    { label: 'Reflections', value: totalReflections, color: 'text-violet-400' },
    { label: 'Gratitudes', value: totalGratitudes, color: 'text-rose-400' },
  ]

  return (
    <div className="flex items-center justify-around py-2 border-b border-slate-700/30">
      {stats.map((stat, index) => (
        <div key={stat.label} className="flex items-center gap-2">
          {index > 0 && <div className="w-px h-8 bg-slate-700/50 -ml-2 mr-2" />}
          <div className="text-center">
            <span className={cn('text-lg font-bold', stat.color)}>{stat.value}</span>
            <span className="text-xs text-slate-500 block">{stat.label}</span>
          </div>
        </div>
      ))}
    </div>
  )
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function ReflectionThemes({
  isLoading = false,
  className,
}: ReflectionThemesProps) {
  // Use the hook to read from Firestore (populated by Phase 2 cloud function)
  const { data: themesData, loading: hookLoading, weekId } = useReflectionThemes()

  // Get cards from Firestore data, or use defaults
  const displayCards = themesData?.cards?.length
    ? themesData.cards
    : DEFAULT_CARDS

  const totalReflections = themesData?.totalReflections || 0
  const totalGratitudes = themesData?.totalGratitudes || 0

  const showLoading = isLoading || hookLoading

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={cn(
        'rounded-xl overflow-hidden',
        'bg-slate-800/60 border border-slate-700/50',
        'backdrop-blur-sm',
        className
      )}
    >
      {/* Header with AI indicator */}
      <div className="flex items-center justify-between p-2 md:p-3 border-b border-slate-700/50">
        <div className="flex items-center gap-2">
          <motion.div
            variants={pulseVariants}
            initial="initial"
            animate="animate"
            className="relative"
          >
            <div className="absolute inset-0 rounded-full bg-violet-500/30 blur-md" />
            <div className="relative p-1.5 rounded-full bg-gradient-to-br from-violet-500 to-cyan-500">
              <Brain className="h-4 w-4 text-white" />
            </div>
          </motion.div>
          <div>
            <span className="text-sm font-semibold text-white">Reflection Themes</span>
            <span className="text-xs text-emerald-400 block">
              {themesData ? `Week ${weekId}` : 'Pattern analysis'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-violet-500/20">
          <Sparkles className="h-3 w-3 text-violet-400" />
          <span className="text-xs text-violet-300">Beacon</span>
        </div>
      </div>

      {/* Stats summary */}
      <StatsBar
        totalReflections={totalReflections}
        totalGratitudes={totalGratitudes}
      />

      {/* Insight Cards */}
      <div className="p-2 md:p-3">
        {showLoading ? (
          <LoadingSkeleton />
        ) : (
          <motion.div variants={containerVariants} className="space-y-3">
            {displayCards.map((card) => {
              if (!card || !card.type) return null
              const colors = getCardColors(card.type as ReflectionCardType, card.iconColor)

              return (
                <motion.div
                  key={card.id}
                  variants={itemVariants}
                  className={cn(
                    'p-3 rounded-lg',
                    'transition-all duration-200',
                    colors.bg,
                    'border',
                    colors.border
                  )}
                >
                  <div className="flex items-start gap-2">
                    <div className="flex items-center gap-2">
                      <span style={{ color: colors.icon }}>
                        {getCardIcon(card.type as ReflectionCardType, card.icon)}
                      </span>
                      <span className="text-sm font-medium text-white">
                        {card.title}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 mt-1.5 leading-relaxed pl-6">
                    {card.message}
                  </p>
                </motion.div>
              )
            })}
          </motion.div>
        )}
      </div>

      {/* Footer - Analysis info */}
      <div className="px-2 pb-2 md:px-3 md:pb-3">
        <div className="py-1 text-center">
          <span className="text-xs text-slate-500">
            {themesData
              ? `Week ${weekId} insights`
              : totalReflections + totalGratitudes > 0
                ? 'Generating insights...'
                : 'Start logging to see insights'}
          </span>
        </div>
      </div>
    </motion.div>
  )
}

// Legacy export for backward compatibility
export const AIReflectionThemes = ReflectionThemes

export default ReflectionThemes
