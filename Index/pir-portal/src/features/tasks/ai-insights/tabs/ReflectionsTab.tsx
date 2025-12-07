import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { Sparkles, MessageSquare } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAIInsightsFromFirestore } from '@/hooks'
import type { AIInsightsDataState } from '../useAIInsightsData'
import {
  ReflectionTimeline,
  GratitudeWordCloud,
  WinCategories,
  AIReflectionThemes,
} from '../components'
import type {
  ReflectionEntry,
  GratitudeEntry,
  WinEntry,
} from '../components'

// =============================================================================
// TYPES
// =============================================================================

export interface ReflectionsTabProps {
  data: AIInsightsDataState
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
      delayChildren: 0.1,
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

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function transformReflections(
  reflections: AIInsightsDataState['reflections'] | undefined | null
): ReflectionEntry[] {
  if (!reflections) return []
  // Filter out entries without valid text and ensure all fields are safe
  return reflections
    .filter((r) => r && r.id && typeof r.text === 'string')
    .map((r) => ({
      id: r.id,
      text: r.text || '',
      mood: r.mood,
      createdAt: r.createdAt,
    }))
}

function transformGratitudes(
  gratitudes: AIInsightsDataState['gratitudes'] | undefined | null
): GratitudeEntry[] {
  if (!gratitudes) return []
  // Filter out entries without valid text and ensure all fields are safe
  return gratitudes
    .filter((g) => g && g.id && typeof g.text === 'string')
    .map((g) => ({
      id: g.id,
      text: g.text || '',
      category: g.category,
    }))
}

function transformWins(wins: AIInsightsDataState['wins'] | undefined | null): WinEntry[] {
  if (!wins) return []
  // Filter out entries without valid text and ensure all fields are safe
  return wins
    .filter((w) => w && w.id && typeof w.text === 'string')
    .map((w) => ({
      id: w.id,
      text: w.text || '',
      category: w.category,
    }))
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function ReflectionsTab({ data }: ReflectionsTabProps) {
  // Fetch reflection insights from aiInsights collection
  const { activeInsights: activeInsightsProp } = useAIInsightsFromFirestore(10)

  // Default to empty array if undefined to prevent crashes
  const activeInsights = activeInsightsProp ?? []

  // Filter for reflection-type insights (check for types that relate to reflections)
  const reflectionInsights = useMemo(() => {
    return activeInsights.filter(
      (insight) =>
        insight.type === 'daily_pattern' ||
        insight.type === 'encouragement' ||
        insight.type === 'recommendation'
    )
  }, [activeInsights])

  // Transform data to component-specific formats
  const reflections = useMemo(
    () => transformReflections(data.reflections),
    [data.reflections]
  )

  const gratitudes = useMemo(
    () => transformGratitudes(data.gratitudes),
    [data.gratitudes]
  )

  const wins = useMemo(() => transformWins(data.wins), [data.wins])

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="p-3 md:p-4 space-y-3 md:space-y-4"
    >
      {/* AI Reflection Insights - from aiInsights collection */}
      {reflectionInsights.length > 0 && (
        <motion.div variants={itemVariants}>
          <div className="mb-2">
            <span className="text-sm font-semibold text-white flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-violet-400" />
              Reflection Insights
            </span>
          </div>
          <div className="space-y-2">
            {reflectionInsights.slice(0, 3).map((insight) => (
              <motion.div
                key={insight.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className={cn(
                  'p-3 rounded-xl',
                  'bg-gradient-to-r from-indigo-900/30 to-slate-900/50',
                  'border border-indigo-500/20'
                )}
              >
                <div className="flex items-start gap-2">
                  <MessageSquare className="h-4 w-4 text-indigo-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white/90 leading-relaxed">
                      {insight.content}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      {insight.createdAt?.toDate?.()?.toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      }) || 'Today'}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* AI Reflection Themes - Hero section with real-time analysis */}
      <motion.div variants={itemVariants}>
{/* AIReflectionThemes now fetches its own data via useReflectionThemes hook */}
        <AIReflectionThemes isLoading={data.loading} />
      </motion.div>

      {/* Reflection Timeline */}
      <motion.div variants={itemVariants}>
        <ReflectionTimeline reflections={reflections} maxEntries={5} />
      </motion.div>

      {/* Gratitude Word Cloud */}
      <motion.div variants={itemVariants}>
        <GratitudeWordCloud gratitudes={gratitudes} />
      </motion.div>

      {/* Win Categories */}
      <motion.div variants={itemVariants}>
        <WinCategories wins={wins} />
      </motion.div>
    </motion.div>
  )
}

// Placeholder wrapper that accepts data as props
export function ReflectionsTabPlaceholder({ data }: { data?: AIInsightsDataState }) {
  // If no data provided, show loading state
  if (!data) {
    return (
      <div className="p-4 flex items-center justify-center h-64">
        <span className="text-slate-500 text-sm">Loading reflections...</span>
      </div>
    )
  }
  return <ReflectionsTab data={data} />
}

export default ReflectionsTabPlaceholder
