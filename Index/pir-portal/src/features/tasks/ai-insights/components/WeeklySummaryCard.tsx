/**
 * WeeklySummaryCard Component
 * Phase 4/Task 4.6: Display this week's AI-generated summary
 *
 * Shows pre-computed data from users/{userId}/weeklySummaries
 */

import { motion } from 'framer-motion'
import {
  Calendar,
  TrendingUp,
  TrendingDown,
  Minus,
  CheckCircle,
  Target,
  Users,
  Sparkles,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { WeeklySummary } from '@/types/summaries'

// =============================================================================
// TYPES
// =============================================================================

interface WeeklySummaryCardProps {
  summary: WeeklySummary | null
  loading?: boolean
  className?: string
}

// =============================================================================
// ANIMATION VARIANTS
// =============================================================================

const cardVariants = {
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

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function getTrendIcon(trend: 'improving' | 'stable' | 'declining') {
  switch (trend) {
    case 'improving':
      return <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
    case 'declining':
      return <TrendingDown className="h-3.5 w-3.5 text-rose-400" />
    default:
      return <Minus className="h-3.5 w-3.5 text-slate-400" />
  }
}

function getTrendColor(trend: 'improving' | 'stable' | 'declining') {
  switch (trend) {
    case 'improving':
      return 'text-emerald-400'
    case 'declining':
      return 'text-rose-400'
    default:
      return 'text-slate-400'
  }
}

function formatDateRange(startDate: string, endDate: string): string {
  const start = new Date(startDate)
  const end = new Date(endDate)
  const startMonth = start.toLocaleDateString('en-US', { month: 'short' })
  const endMonth = end.toLocaleDateString('en-US', { month: 'short' })

  if (startMonth === endMonth) {
    return `${startMonth} ${start.getDate()}-${end.getDate()}`
  }
  return `${startMonth} ${start.getDate()} - ${endMonth} ${end.getDate()}`
}

// =============================================================================
// LOADING STATE
// =============================================================================

function LoadingSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="flex items-center gap-2">
        <div className="h-5 w-5 rounded bg-slate-700" />
        <div className="h-4 w-32 rounded bg-slate-700" />
      </div>
      <div className="h-16 rounded-lg bg-slate-700" />
      <div className="grid grid-cols-3 gap-2">
        <div className="h-12 rounded bg-slate-700" />
        <div className="h-12 rounded bg-slate-700" />
        <div className="h-12 rounded bg-slate-700" />
      </div>
    </div>
  )
}

// =============================================================================
// EMPTY STATE
// =============================================================================

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-6 text-center">
      <div className="p-3 rounded-full bg-slate-700/50 mb-3">
        <Calendar className="h-6 w-6 text-slate-400" />
      </div>
      <p className="text-sm text-slate-400">No weekly summary yet</p>
      <p className="text-xs text-slate-500 mt-1">
        Summaries generate every Sunday
      </p>
    </div>
  )
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function WeeklySummaryCard({
  summary,
  loading = false,
  className,
}: WeeklySummaryCardProps) {
  if (loading) {
    return (
      <div
        className={cn(
          'p-4 rounded-2xl',
          'bg-gradient-to-br from-teal-900/30 via-slate-900/50 to-cyan-900/30',
          'border border-teal-500/20',
          className
        )}
      >
        <LoadingSkeleton />
      </div>
    )
  }

  if (!summary) {
    return (
      <div
        className={cn(
          'p-4 rounded-2xl',
          'bg-slate-800/50',
          'border border-slate-700/50',
          className
        )}
      >
        <EmptyState />
      </div>
    )
  }

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      className={cn(
        'relative overflow-hidden rounded-2xl',
        'bg-gradient-to-br from-teal-900/30 via-slate-900/50 to-cyan-900/30',
        'border border-teal-500/20',
        'p-4',
        className
      )}
    >
      {/* Background glow */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-teal-400/10 rounded-full blur-2xl" />

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-teal-500/20">
            <Calendar className="h-4 w-4 text-teal-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Weekly Summary</h3>
            <p className="text-xs text-slate-400">
              {formatDateRange(summary.weekStartDate, summary.weekEndDate)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {getTrendIcon(summary.checkIns.moodTrend)}
          <span className={cn('text-xs', getTrendColor(summary.checkIns.moodTrend))}>
            {summary.checkIns.moodTrend}
          </span>
        </div>
      </div>

      {/* AI Summary */}
      {summary.aiSummary && (
        <div className="relative z-10 mb-4 p-3 rounded-xl bg-white/5 border border-white/10">
          <div className="flex items-start gap-2">
            <Sparkles className="h-4 w-4 text-violet-400 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-white/90 leading-relaxed">
              {summary.aiSummary}
            </p>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="relative z-10 grid grid-cols-3 gap-2">
        {/* Check-in Rate */}
        <div className="p-2 rounded-lg bg-white/5 text-center">
          <CheckCircle className="h-4 w-4 text-emerald-400 mx-auto mb-1" />
          <span className="text-sm font-bold text-white block">
            {Math.round((summary.checkIns.total / 14) * 100)}%
          </span>
          <span className="text-xs text-slate-500">Check-ins</span>
        </div>

        {/* Mood Avg */}
        <div className="p-2 rounded-lg bg-white/5 text-center">
          <Target className="h-4 w-4 text-amber-400 mx-auto mb-1" />
          <span className="text-sm font-bold text-white block">
            {summary.checkIns.avgMood.toFixed(1)}
          </span>
          <span className="text-xs text-slate-500">Mood Avg</span>
        </div>

        {/* Meetings */}
        <div className="p-2 rounded-lg bg-white/5 text-center">
          <Users className="h-4 w-4 text-cyan-400 mx-auto mb-1" />
          <span className="text-sm font-bold text-white block">
            {summary.meetings.attended}
          </span>
          <span className="text-xs text-slate-500">Meetings</span>
        </div>
      </div>

      {/* Highlights (if any) */}
      {summary.aiHighlights && summary.aiHighlights.length > 0 && (
        <div className="relative z-10 mt-3 pt-3 border-t border-white/10">
          <p className="text-xs text-slate-400 mb-2">Highlights</p>
          <ul className="space-y-1">
            {summary.aiHighlights.slice(0, 2).map((highlight, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-teal-400 mt-0.5">•</span>
                <span className="text-xs text-white/80">{highlight}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </motion.div>
  )
}

export default WeeklySummaryCard
