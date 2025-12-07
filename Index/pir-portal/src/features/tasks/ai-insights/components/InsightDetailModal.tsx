/**
 * InsightDetailModal - Modal for AI Pattern Insight Details
 * Project Lighthouse: AI Pattern Insights Redesign
 *
 * Displays expanded AI-generated insight with action button.
 * Actions can be: technique, journal, meeting, post, or none.
 */

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Lightbulb,
  Heart,
  Target,
  Zap,
  Sun,
  Moon,
  Brain,
  Star,
  Activity,
  Coffee,
  Battery,
  Smile,
  Frown,
  CloudRain,
  Sparkles,
  Award,
  CheckCircle,
  BookOpen,
  MessageSquare,
  Calendar,
  Users,
  ArrowRight,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import type { AIPatternInsight, ActionType, MetricType, SeverityLevel } from '@/hooks/useAIPatternInsights'

// =============================================================================
// TYPES
// =============================================================================

export interface InsightDetailModalProps {
  insight: AIPatternInsight
  onClose: () => void
  onActionClick: (action: {
    type: ActionType
    id: string | null
    insightId: string
  }) => void
}

// =============================================================================
// ICON MAPPING
// =============================================================================

const ICON_MAP: Record<string, LucideIcon> = {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Lightbulb,
  Heart,
  Target,
  Zap,
  Sun,
  Moon,
  Brain,
  Star,
  Activity,
  Coffee,
  Battery,
  Smile,
  Frown,
  CloudRain,
  Sparkles,
  Award,
  CheckCircle,
}

// =============================================================================
// COLOR SCHEMES
// =============================================================================

const METRIC_COLORS: Record<MetricType, { bg: string; border: string; text: string; icon: string }> = {
  mood: {
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
    text: 'text-amber-400',
    icon: 'bg-gradient-to-br from-amber-500 to-orange-500',
  },
  anxiety: {
    bg: 'bg-violet-500/10',
    border: 'border-violet-500/30',
    text: 'text-violet-400',
    icon: 'bg-gradient-to-br from-violet-500 to-purple-500',
  },
  cravings: {
    bg: 'bg-rose-500/10',
    border: 'border-rose-500/30',
    text: 'text-rose-400',
    icon: 'bg-gradient-to-br from-rose-500 to-pink-500',
  },
  sleep: {
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/30',
    text: 'text-blue-400',
    icon: 'bg-gradient-to-br from-blue-500 to-indigo-500',
  },
  energy: {
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/30',
    text: 'text-emerald-400',
    icon: 'bg-gradient-to-br from-emerald-500 to-teal-500',
  },
}

const SEVERITY_COLORS: Record<SeverityLevel, { bg: string; border: string; text: string }> = {
  info: {
    bg: 'bg-cyan-500/10',
    border: 'border-cyan-500/30',
    text: 'text-cyan-400',
  },
  warning: {
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
    text: 'text-amber-400',
  },
  alert: {
    bg: 'bg-rose-500/10',
    border: 'border-rose-500/30',
    text: 'text-rose-400',
  },
}

// =============================================================================
// ACTION BUTTON CONFIG
// =============================================================================

interface ActionConfig {
  icon: LucideIcon
  label: string
  description: string
  gradient: string
}

const ACTION_CONFIG: Record<ActionType, ActionConfig> = {
  technique: {
    icon: Brain,
    label: 'Try This Technique',
    description: 'Open a coping technique to help with this pattern',
    gradient: 'from-violet-500 to-purple-500',
  },
  journal: {
    icon: BookOpen,
    label: 'Reflect on This',
    description: 'Write about your thoughts and feelings',
    gradient: 'from-blue-500 to-indigo-500',
  },
  meeting: {
    icon: Calendar,
    label: 'Find a Meeting',
    description: 'Browse AA/NA meetings near you',
    gradient: 'from-emerald-500 to-teal-500',
  },
  post: {
    icon: Users,
    label: 'Share in Community',
    description: 'Connect with others in recovery',
    gradient: 'from-orange-500 to-amber-500',
  },
  none: {
    icon: CheckCircle,
    label: '',
    description: '',
    gradient: '',
  },
}

// =============================================================================
// ANIMATION VARIANTS
// =============================================================================

const contentVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: 'easeOut' as const,
    },
  },
}

const buttonVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      delay: 0.2,
      duration: 0.2,
    },
  },
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function InsightDetailModal({
  insight,
  onClose,
  onActionClick,
}: InsightDetailModalProps) {
  const isMobile = useMediaQuery('(max-width: 768px)')

  // Get the icon component
  const IconComponent = useMemo(() => {
    return ICON_MAP[insight.icon] || Lightbulb
  }, [insight.icon])

  // Get color schemes
  const metricColors = METRIC_COLORS[insight.metric]
  const severityColors = SEVERITY_COLORS[insight.severity]
  const actionConfig = ACTION_CONFIG[insight.actionType]

  // Format metric name with safety check
  const metricLabel = insight.metric
    ? insight.metric.charAt(0).toUpperCase() + insight.metric.slice(1)
    : 'General'

  // Handle action button click
  const handleActionClick = () => {
    if (insight.actionType !== 'none') {
      onActionClick({
        type: insight.actionType,
        id: insight.actionId,
        insightId: insight.id,
      })
    }
  }

  return (
    <DialogContent
      className={cn(
        'bg-slate-900 border-slate-700/50',
        'max-w-lg',
        isMobile ? 'max-h-[90vh]' : 'max-h-[80vh]'
      )}
    >
      <DialogHeader className="space-y-3">
        {/* Metric badge and type */}
        <div className="flex items-center justify-between">
          <Badge
            variant="outline"
            className={cn(
              'text-xs font-medium',
              metricColors.bg,
              metricColors.border,
              metricColors.text
            )}
          >
            {metricLabel}
          </Badge>
          <Badge
            variant="outline"
            className={cn(
              'text-xs',
              severityColors.bg,
              severityColors.border,
              severityColors.text
            )}
          >
            {insight.type}
          </Badge>
        </div>

        {/* Icon and title */}
        <div className="flex items-start gap-3">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={cn(
              'p-2.5 rounded-xl',
              metricColors.icon
            )}
          >
            <IconComponent className="h-5 w-5 text-white" />
          </motion.div>
          <div className="flex-1">
            <DialogTitle className="text-lg font-semibold text-white">
              {insight.modalTitle}
            </DialogTitle>
          </div>
        </div>
      </DialogHeader>

      <ScrollArea className="flex-1 pr-4 -mr-4">
        <motion.div
          variants={contentVariants}
          initial="hidden"
          animate="visible"
          className="space-y-4 py-4"
        >
          {/* Main message */}
          <div
            className={cn(
              'p-4 rounded-xl',
              'bg-slate-800/60 border',
              metricColors.border
            )}
          >
            <p className="text-sm text-slate-200 leading-relaxed">
              {insight.modalContent}
            </p>
          </div>

          {/* AI insight indicator */}
          <div className="flex items-center gap-2 px-1">
            <Sparkles className="h-3.5 w-3.5 text-violet-400" />
            <span className="text-xs text-slate-500">
              AI-generated insight based on your data
            </span>
          </div>

          {/* Action button */}
          {insight.actionType !== 'none' && actionConfig && (
            <motion.div
              variants={buttonVariants}
              initial="hidden"
              animate="visible"
              className="pt-2"
            >
              <Button
                onClick={handleActionClick}
                className={cn(
                  'w-full h-auto py-4 px-4',
                  'bg-gradient-to-r',
                  actionConfig.gradient,
                  'hover:opacity-90 transition-opacity',
                  'flex items-center justify-between',
                  'rounded-xl border-0'
                )}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-white/20">
                    <actionConfig.icon className="h-5 w-5 text-white" />
                  </div>
                  <div className="text-left">
                    <span className="block text-sm font-semibold text-white">
                      {actionConfig.label}
                    </span>
                    <span className="block text-xs text-white/70">
                      {actionConfig.description}
                    </span>
                  </div>
                </div>
                <ArrowRight className="h-5 w-5 text-white/80" />
              </Button>
            </motion.div>
          )}
        </motion.div>
      </ScrollArea>

      {/* Footer note */}
      <div className="pt-2 border-t border-slate-700/50">
        <p className="text-xs text-center text-slate-500">
          Insights refresh every Sunday at 6 AM
        </p>
      </div>
    </DialogContent>
  )
}

export default InsightDetailModal
