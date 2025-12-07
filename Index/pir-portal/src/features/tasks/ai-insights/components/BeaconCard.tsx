/**
 * BeaconCard - Daily insight from Beacon
 * Beacon tracks your patterns and guides you in the right direction—like the beacon of a lighthouse.
 * Phase 6.4: Reads from Firestore aiInsights/daily_{date}
 */

import { motion } from 'framer-motion'
import { Sparkles, Loader2, ChevronRight, AlertCircle, Moon, TrendingUp, Trophy, Calendar, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useDailyInsight } from '@/hooks'
import { useCTAHandler } from '@/lib/ctaHandler'
import { useAuth } from '@/contexts/AuthContext'
import type { MetricPattern } from '../types'

// =============================================================================
// TYPES
// =============================================================================

export interface BeaconCardProps {
  className?: string
  // Legacy props - kept for backwards compatibility
  insight?: string | null
  isLoading?: boolean
  onRefresh?: () => void
  moodPattern?: MetricPattern
  anxietyPattern?: MetricPattern
  cravingPattern?: MetricPattern
  sleepPattern?: MetricPattern
  checkInCount?: number
}

// Legacy type alias
export type AIInsightCardProps = BeaconCardProps

// =============================================================================
// ICON MAP
// =============================================================================

const ICON_MAP: Record<string, React.ReactNode> = {
  'sun': <TrendingUp className="h-4 w-4 text-white" />,
  'alert-circle': <AlertCircle className="h-4 w-4 text-white" />,
  'flame': <AlertCircle className="h-4 w-4 text-white" />,
  'user-plus': <Sparkles className="h-4 w-4 text-white" />,
  'trending-down': <TrendingUp className="h-4 w-4 text-white" />,
  'trophy': <Trophy className="h-4 w-4 text-white" />,
  'calendar': <Calendar className="h-4 w-4 text-white" />,
  'clock': <Clock className="h-4 w-4 text-white" />,
  'moon': <Moon className="h-4 w-4 text-white" />,
}

const COLOR_MAP: Record<string, string> = {
  'emerald': 'from-emerald-500 to-teal-500',
  'amber': 'from-amber-500 to-orange-500',
  'red': 'from-red-500 to-rose-500',
  'cyan': 'from-cyan-500 to-blue-500',
  'violet': 'from-violet-500 to-purple-500',
  'yellow': 'from-yellow-500 to-amber-500',
  'indigo': 'from-indigo-500 to-violet-500',
}

// =============================================================================
// ANIMATION VARIANTS
// =============================================================================

const pulseVariants = {
  initial: { scale: 1, opacity: 0.6 },
  animate: {
    scale: [1, 1.15, 1],
    opacity: [0.6, 1, 0.6],
    transition: {
      duration: 2.5,
      repeat: Infinity,
      ease: 'easeInOut' as const,
    },
  },
}

const glowVariants = {
  initial: { boxShadow: '0 0 15px rgba(139, 92, 246, 0.3)' },
  animate: {
    boxShadow: [
      '0 0 15px rgba(139, 92, 246, 0.3)',
      '0 0 30px rgba(139, 92, 246, 0.5)',
      '0 0 15px rgba(139, 92, 246, 0.3)',
    ],
    transition: {
      duration: 2.5,
      repeat: Infinity,
      ease: 'easeInOut' as const,
    },
  },
}

const textVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: 'easeOut' as const,
    },
  },
}

// =============================================================================
// COMPONENT
// =============================================================================

export function BeaconCard(props: BeaconCardProps) {
  const { className } = props
  const { user } = useAuth()
  const { data, loading, error } = useDailyInsight()
  const { handleCTA } = useCTAHandler({
    userId: user?.uid,
    source: 'BeaconCard',
  })

  // Determine what to display
  const isLoading = loading
  const hasData = !!data
  const displayTitle = data?.title || 'Beacon Insight'
  const displayMessage = data?.message || 'Generating your personalized insight...'
  const iconKey = data?.icon || 'sparkles'
  const colorKey = data?.iconColor || 'violet'
  const cta = data?.cta

  // Get icon and color
  const icon = ICON_MAP[iconKey] || <Sparkles className="h-4 w-4 text-white" />
  const gradientColor = COLOR_MAP[colorKey] || 'from-violet-500 to-cyan-500'

  // Handle CTA click
  const handleClick = () => {
    if (cta) {
      handleCTA(cta)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{
        y: -2,
        boxShadow: '0 8px 30px rgba(139, 92, 246, 0.15)',
        transition: { duration: 0.2 },
      }}
      whileTap={{ scale: 0.98 }}
      transition={{ delay: 0.2 }}
      onClick={handleClick}
      className={cn(
        'relative overflow-hidden rounded-2xl cursor-pointer',
        'bg-gradient-to-br from-violet-600/20 via-purple-600/15 to-cyan-600/20',
        'border border-violet-500/30',
        'backdrop-blur-sm',
        className
      )}
    >
      {/* Animated background glow */}
      <motion.div
        animate={{
          opacity: [0.3, 0.5, 0.3],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute -top-10 -right-10 w-32 h-32 bg-violet-500/20 rounded-full blur-2xl"
      />
      <motion.div
        animate={{
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 1,
        }}
        className="absolute -bottom-10 -left-10 w-32 h-32 bg-cyan-500/20 rounded-full blur-2xl"
      />

      {/* Content */}
      <div className="relative z-10 p-3 md:p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            {/* Pulsing Beacon Indicator */}
            <motion.div
              variants={pulseVariants}
              initial="initial"
              animate="animate"
              className="relative"
            >
              <motion.div
                variants={glowVariants}
                initial="initial"
                animate="animate"
                className="absolute inset-0 rounded-full"
              />
              <div className={cn(
                "relative w-8 h-8 rounded-full flex items-center justify-center",
                "bg-gradient-to-br",
                gradientColor
              )}>
                {isLoading ? (
                  <Loader2 className="h-4 w-4 text-white animate-spin" />
                ) : (
                  icon
                )}
              </div>
            </motion.div>
            <div>
              <span className="text-sm font-semibold text-violet-300">{displayTitle}</span>
              <span className="text-xs text-slate-500 block">Personalized for you</span>
            </div>
          </div>

          {/* CTA indicator */}
          {cta && (
            <div className="flex items-center gap-1 text-xs text-violet-400">
              <span>{cta.shortLabel || cta.label}</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </div>
          )}
        </div>

        {/* Insight Text */}
        <motion.div
          key={displayMessage}
          variants={textVariants}
          initial="hidden"
          animate="visible"
        >
          {isLoading ? (
            <div className="space-y-2">
              <div className="h-4 bg-slate-700/50 rounded animate-pulse w-full" />
              <div className="h-4 bg-slate-700/50 rounded animate-pulse w-3/4" />
            </div>
          ) : !hasData ? (
            <div className="text-sm text-slate-400 leading-relaxed">
              <p>Your daily insight will be ready at 6 AM.</p>
              <p className="text-xs text-slate-500 mt-1">
                Check in regularly to get personalized insights.
              </p>
            </div>
          ) : (
            <p className="text-sm text-slate-200 leading-relaxed">
              {displayMessage}
            </p>
          )}
        </motion.div>

        {/* Error state */}
        {error && (
          <div className="mt-2 text-xs text-red-400">
            Unable to load insight. Please try again later.
          </div>
        )}
      </div>
    </motion.div>
  )
}

// Legacy export for backward compatibility
export const AIInsightCard = BeaconCard

export default BeaconCard
