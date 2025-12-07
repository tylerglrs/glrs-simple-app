import { useMemo, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Brain, Sparkles, ChevronRight, Lightbulb, AlertTriangle, TrendingUp } from 'lucide-react'
import { Timestamp } from 'firebase/firestore'
import { cn } from '@/lib/utils'
import { Dialog } from '@/components/ui/dialog'
import { usePatternAnalysis, useAIPatternInsights } from '@/hooks'
import type { AIPatternInsight } from '@/hooks/useAIPatternInsights'
import { useAIContext } from '@/hooks/useAIContext'
import { useInsightActions } from '@/lib/insightActions'
import { InsightDetailModal } from './InsightDetailModal'
import type { MetricType } from './MetricSelector'
import type { MetricPattern, CheckInData } from '../types'

// =============================================================================
// TYPES
// =============================================================================

export interface PatternInsight {
  id: string
  type: 'observation' | 'warning' | 'recommendation'
  title: string
  description: string
}

export interface PatternAnalysisProps {
  selectedMetric: MetricType
  checkIns?: CheckInData[]
  moodPattern?: MetricPattern
  anxietyPattern?: MetricPattern
  cravingPattern?: MetricPattern
  sleepPattern?: MetricPattern
  energyPattern?: MetricPattern
  isLoading?: boolean
  className?: string
}

// Legacy type alias
export type AIPatternAnalysisProps = PatternAnalysisProps

// =============================================================================
// CACHE MANAGEMENT (24-hour refresh)
// =============================================================================

const CACHE_KEY = 'glrs-ai-insights-cache'

interface CachedInsights {
  timestamp: number
  insights: Record<MetricType, PatternInsight[]>
}

// Check if cache should be invalidated (past 6 AM since last cache)
function shouldRefreshCache(cacheTimestamp: number): boolean {
  const cacheDate = new Date(cacheTimestamp)
  const now = new Date()

  // Get 6 AM on the day the cache was created
  const cacheDaySixAM = new Date(cacheDate)
  cacheDaySixAM.setHours(6, 0, 0, 0)

  // If cache was created before 6 AM, check if we've passed 6 AM that day
  if (cacheDate < cacheDaySixAM) {
    return now >= cacheDaySixAM
  }

  // If cache was created after 6 AM, check if we've passed 6 AM the next day
  const nextDaySixAM = new Date(cacheDaySixAM)
  nextDaySixAM.setDate(nextDaySixAM.getDate() + 1)
  return now >= nextDaySixAM
}

function getCachedInsights(): CachedInsights | null {
  try {
    const cached = localStorage.getItem(CACHE_KEY)
    if (!cached) return null
    const parsed = JSON.parse(cached) as CachedInsights
    if (shouldRefreshCache(parsed.timestamp)) {
      localStorage.removeItem(CACHE_KEY)
      return null
    }
    return parsed
  } catch {
    return null
  }
}

function setCachedInsights(insights: Record<MetricType, PatternInsight[]>) {
  try {
    const cache: CachedInsights = {
      timestamp: Date.now(),
      insights,
    }
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache))
  } catch {
    // Ignore storage errors
  }
}

// =============================================================================
// AI PROMPTS FOR PATTERN ANALYSIS
// =============================================================================

const PATTERN_PROMPTS: Record<MetricType, string> = {
  mood: `Analyze my mood patterns from the past 7-30 days. Based on my check-in data, provide 2-3 specific observations or recommendations about:
- Weekly patterns (best/worst days)
- Weekend vs weekday differences
- Overall trend direction
Keep each insight to 1-2 sentences. Format as JSON array: [{"type": "observation"|"warning"|"recommendation", "title": "short title", "description": "insight text"}]`,

  anxiety: `Analyze my anxiety patterns from the past 7-30 days. Based on my check-in data, provide 2-3 specific observations about:
- Days when anxiety tends to spike
- Patterns in anxiety levels
- Correlation with other factors if visible
Keep each insight to 1-2 sentences. Format as JSON array: [{"type": "observation"|"warning"|"recommendation", "title": "short title", "description": "insight text"}]`,

  craving: `Analyze my craving patterns from the past 7-30 days. Based on my check-in data, provide 2-3 specific observations about:
- When cravings tend to be strongest
- Any day-of-week patterns
- Whether cravings are improving or need attention
Keep each insight to 1-2 sentences. Format as JSON array: [{"type": "observation"|"warning"|"recommendation", "title": "short title", "description": "insight text"}]`,

  sleep: `Analyze my sleep quality patterns from the past 7-30 days. Based on my check-in data, provide 2-3 specific observations about:
- Best nights for sleep
- Consistency of sleep quality
- Impact on recovery
Keep each insight to 1-2 sentences. Format as JSON array: [{"type": "observation"|"warning"|"recommendation", "title": "short title", "description": "insight text"}]`,

  energy: `Analyze my energy level patterns from the past 7-30 days. Based on my check-in data, provide 2-3 specific observations about:
- Days with highest/lowest energy
- Energy trends over time
- Recommendations for managing energy
Keep each insight to 1-2 sentences. Format as JSON array: [{"type": "observation"|"warning"|"recommendation", "title": "short title", "description": "insight text"}]`,
}

// Parse AI response into PatternInsight array
function parseAIInsights(response: string, metric: MetricType): PatternInsight[] {
  try {
    // Try to extract JSON from the response
    const jsonMatch = response.match(/\[[\s\S]*\]/)
    if (!jsonMatch) {
      console.warn('[AIPatternAnalysis] No JSON found in response')
      return []
    }

    const parsed = JSON.parse(jsonMatch[0])
    if (!Array.isArray(parsed)) return []

    return parsed.map((item, index) => ({
      id: `${metric}-ai-${index}`,
      type: item.type || 'observation',
      title: item.title || 'Insight',
      description: item.description || '',
    })).filter(insight => insight.description)
  } catch (err) {
    console.error('[AIPatternAnalysis] Failed to parse AI response:', err)
    return []
  }
}

// =============================================================================
// TEMPLATE FALLBACK (used when AI fails)
// =============================================================================

function generateInsightsFromData(
  checkIns: CheckInData[],
  patterns: {
    mood?: MetricPattern
    anxiety?: MetricPattern
    craving?: MetricPattern
    sleep?: MetricPattern
    energy?: MetricPattern
  }
): Record<MetricType, PatternInsight[]> {
  const insights: Record<MetricType, PatternInsight[]> = {
    mood: [],
    anxiety: [],
    craving: [],
    sleep: [],
    energy: [],
  }

  if (checkIns.length < 3) {
    // Not enough data - return empty insights
    return insights
  }

  // Analyze check-in times and day patterns
  const checkInsByDay: Record<string, number[]> = {}
  const checkInsByHour: Record<number, { values: number[]; count: number }> = {}
  const weekdayValues: number[] = []
  const weekendValues: number[] = []

  checkIns.forEach((checkIn) => {
    const date = checkIn.createdAt instanceof Timestamp
      ? checkIn.createdAt.toDate()
      : new Date(checkIn.createdAt)
    const day = date.toLocaleDateString('en-US', { weekday: 'long' })
    const hour = date.getHours()
    const isWeekend = date.getDay() === 0 || date.getDay() === 6

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const c = checkIn as any
    const mood = c.mood ?? c.morningData?.mood

    if (mood !== undefined && mood !== null) {
      if (!checkInsByDay[day]) checkInsByDay[day] = []
      checkInsByDay[day].push(mood)

      if (!checkInsByHour[hour]) checkInsByHour[hour] = { values: [], count: 0 }
      checkInsByHour[hour].values.push(mood)
      checkInsByHour[hour].count++

      if (isWeekend) {
        weekendValues.push(mood)
      } else {
        weekdayValues.push(mood)
      }
    }
  })

  // Calculate averages
  const avg = (arr: number[]) => arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : 0

  // MOOD INSIGHTS
  if (patterns.mood && patterns.mood.average > 0) {
    // Weekend vs weekday comparison
    if (weekendValues.length >= 2 && weekdayValues.length >= 2) {
      const weekendAvg = avg(weekendValues)
      const weekdayAvg = avg(weekdayValues)
      const diff = weekendAvg - weekdayAvg

      if (Math.abs(diff) > 0.5) {
        insights.mood.push({
          id: 'mood-weekend',
          type: 'observation',
          title: diff > 0 ? 'Weekend Boost' : 'Weekday Strength',
          description: diff > 0
            ? `Your mood is ${diff.toFixed(1)} points higher on weekends. Consider bringing weekend activities into your weekday routine.`
            : `Your mood is ${Math.abs(diff).toFixed(1)} points higher on weekdays. Your work routine may be providing structure that helps.`,
        })
      }
    }

    // Best day analysis
    if (patterns.mood.bestDay) {
      insights.mood.push({
        id: 'mood-bestday',
        type: 'observation',
        title: `${patterns.mood.bestDay}s Are Your Best`,
        description: `Your highest mood scores consistently come on ${patterns.mood.bestDay}s. What makes this day special for you?`,
      })
    }

    // Trend-based insight
    if (patterns.mood.trend === 'improving') {
      insights.mood.push({
        id: 'mood-trend',
        type: 'recommendation',
        title: 'Keep Up the Momentum',
        description: `Your mood has been trending upward. Whatever you're doing is working - keep it up!`,
      })
    } else if (patterns.mood.trend === 'declining') {
      insights.mood.push({
        id: 'mood-trend',
        type: 'warning',
        title: 'Check In With Yourself',
        description: `Your mood has been trending down recently. Consider reaching out to your support network or trying a new coping strategy.`,
      })
    }
  }

  // ANXIETY INSIGHTS
  if (patterns.anxiety && patterns.anxiety.average > 0) {
    // High anxiety warning
    if (patterns.anxiety.average > 6) {
      insights.anxiety.push({
        id: 'anxiety-high',
        type: 'warning',
        title: 'Elevated Anxiety Pattern',
        description: `Your anxiety has been averaging ${patterns.anxiety.average.toFixed(1)}/10. Consider adding relaxation techniques to your daily routine.`,
      })
    }

    // Worst day insight
    if (patterns.anxiety.worstDay) {
      insights.anxiety.push({
        id: 'anxiety-worstday',
        type: 'observation',
        title: `${patterns.anxiety.worstDay} Challenge`,
        description: `${patterns.anxiety.worstDay}s tend to be harder for anxiety. Try planning a calming activity the night before.`,
      })
    }

    // Trend insight
    if (patterns.anxiety.trend === 'improving') {
      insights.anxiety.push({
        id: 'anxiety-trend',
        type: 'recommendation',
        title: 'Anxiety Decreasing',
        description: `Great news - your anxiety levels have been dropping. Your coping strategies are paying off.`,
      })
    }
  }

  // CRAVING INSIGHTS
  if (patterns.craving && patterns.craving.average > 0) {
    // High craving warning
    if (patterns.craving.average > 5) {
      insights.craving.push({
        id: 'craving-high',
        type: 'warning',
        title: 'Cravings Need Attention',
        description: `Your cravings are averaging ${patterns.craving.average.toFixed(1)}/10. Make sure to have your coping toolkit ready.`,
      })
    }

    // Pattern insight
    if (patterns.craving.worstDay) {
      insights.craving.push({
        id: 'craving-pattern',
        type: 'observation',
        title: `${patterns.craving.worstDay} is a Trigger Day`,
        description: `Cravings peak on ${patterns.craving.worstDay}s. Plan extra support or activities for these days.`,
      })
    }

    // Improvement insight
    if (patterns.craving.trend === 'improving') {
      insights.craving.push({
        id: 'craving-improving',
        type: 'recommendation',
        title: 'Cravings Are Easing',
        description: `Your craving intensity has been decreasing. Your recovery work is making a difference.`,
      })
    }
  }

  // SLEEP INSIGHTS
  if (patterns.sleep && patterns.sleep.average > 0) {
    // Sleep quality insight
    if (patterns.sleep.average < 5) {
      insights.sleep.push({
        id: 'sleep-low',
        type: 'warning',
        title: 'Sleep Quality Concern',
        description: `Your sleep quality is averaging ${patterns.sleep.average.toFixed(1)}/10. Consider evaluating your bedtime routine.`,
      })
    } else if (patterns.sleep.average >= 7) {
      insights.sleep.push({
        id: 'sleep-good',
        type: 'observation',
        title: 'Solid Sleep Foundation',
        description: `You're averaging ${patterns.sleep.average.toFixed(1)}/10 sleep quality. This supports your recovery.`,
      })
    }

    // Best sleep day
    if (patterns.sleep.bestDay) {
      insights.sleep.push({
        id: 'sleep-bestday',
        type: 'recommendation',
        title: `${patterns.sleep.bestDay} Sleep Success`,
        description: `You sleep best on ${patterns.sleep.bestDay}s. What's different about your ${patterns.sleep.bestDay} routine?`,
      })
    }
  }

  // ENERGY INSIGHTS
  if (patterns.energy && patterns.energy.average > 0) {
    // Energy level insight
    if (patterns.energy.average < 4) {
      insights.energy.push({
        id: 'energy-low',
        type: 'warning',
        title: 'Low Energy Pattern',
        description: `Your energy is averaging ${patterns.energy.average.toFixed(1)}/10. Consider checking sleep, nutrition, and activity levels.`,
      })
    }

    // Trend insight
    if (patterns.energy.trend === 'improving') {
      insights.energy.push({
        id: 'energy-trend',
        type: 'observation',
        title: 'Energy Rising',
        description: `Your energy levels have been improving. Keep doing what's working!`,
      })
    }

    // Best day
    if (patterns.energy.bestDay) {
      insights.energy.push({
        id: 'energy-bestday',
        type: 'recommendation',
        title: `Peak Energy Days`,
        description: `You have the most energy on ${patterns.energy.bestDay}s. Consider scheduling important tasks for these days.`,
      })
    }
  }

  return insights
}

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
// INSIGHT ICON COMPONENT
// =============================================================================

function InsightIcon({ type }: { type: PatternInsight['type'] | string }) {
  switch (type) {
    case 'observation':
      return <TrendingUp className="h-4 w-4 text-cyan-400" />
    case 'warning':
      return <AlertTriangle className="h-4 w-4 text-amber-400" />
    case 'recommendation':
      return <Lightbulb className="h-4 w-4 text-emerald-400" />
    default:
      return <Lightbulb className="h-4 w-4 text-violet-400" />
  }
}

function getInsightColors(type: PatternInsight['type'] | string) {
  switch (type) {
    case 'observation':
      return { bg: 'bg-cyan-500/10', border: 'border-cyan-500/30' }
    case 'warning':
      return { bg: 'bg-amber-500/10', border: 'border-amber-500/30' }
    case 'recommendation':
      return { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' }
    default:
      // Fallback for any unknown types (AI might generate different values)
      return { bg: 'bg-violet-500/10', border: 'border-violet-500/30' }
  }
}

// =============================================================================
// LOADING SKELETON
// =============================================================================

function LoadingSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2].map((i) => (
        <div key={i} className="p-3 rounded-lg bg-slate-700/30 animate-pulse">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-4 w-4 rounded bg-slate-600" />
            <div className="h-4 w-24 rounded bg-slate-600" />
          </div>
          <div className="h-3 w-full rounded bg-slate-600/50" />
          <div className="h-3 w-3/4 rounded bg-slate-600/50 mt-1" />
        </div>
      ))}
    </div>
  )
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function PatternAnalysis({
  selectedMetric,
  checkIns = [],
  moodPattern,
  anxietyPattern,
  cravingPattern,
  sleepPattern,
  energyPattern,
  isLoading = false,
  className,
}: PatternAnalysisProps) {
  const { data: patternData, loading: patternLoading } = usePatternAnalysis()
  const { context, loading: contextLoading } = useAIContext()

  // Project Lighthouse: GPT-generated insights from Firestore
  const { data: aiInsightsData, loading: aiInsightsLoading, getInsightsForMetric } = useAIPatternInsights()
  const { handleAction } = useInsightActions()

  // State for selected insight modal
  const [selectedInsight, setSelectedInsight] = useState<AIPatternInsight | null>(null)

  // Get insights from Firestore
  const firestoreInsights = useMemo<PatternInsight[]>(() => {
    // Check for metrics data (the main data structure)
    if (!patternData?.metrics) return []

    // Get insights for the selected metric from the metrics Record
    const metricData = patternData.metrics[selectedMetric]
    if (!metricData?.insights || !Array.isArray(metricData.insights)) return []

    // Filter out any undefined or invalid insights and map to PatternInsight
    return metricData.insights
      .filter((insight): insight is NonNullable<typeof insight> =>
        insight != null && typeof insight === 'object' && 'title' in insight
      )
      .map((insight, idx) => ({
        id: `${selectedMetric}-${idx}`,
        type: (insight.type as PatternInsight['type']) || 'observation',
        title: insight.title || 'Insight',
        description: insight.message || (insight as { description?: string }).description || '',
      }))
  }, [patternData, selectedMetric])

  // Generate fallback insights from local data
  const fallbackInsights = useMemo<PatternInsight[]>(() => {
    if (!context && checkIns.length < 3) return []

    const generated = generateInsightsFromData(checkIns, {
      mood: moodPattern,
      anxiety: anxietyPattern,
      craving: cravingPattern,
      sleep: sleepPattern,
      energy: energyPattern,
    })

    return generated[selectedMetric] || []
  }, [checkIns, selectedMetric, moodPattern, anxietyPattern, cravingPattern, sleepPattern, energyPattern, context])

  // Project Lighthouse: Get GPT-generated insights for this metric
  const gptInsights = useMemo<AIPatternInsight[]>(() => {
    return getInsightsForMetric(selectedMetric as AIPatternInsight['metric'])
  }, [getInsightsForMetric, selectedMetric])

  // Priority: GPT insights > Firestore template insights > Local fallback
  const displayInsights = useMemo(() => {
    // If we have GPT-generated insights, use those (convert to PatternInsight format for display)
    if (gptInsights.length > 0) {
      return gptInsights.map(insight => ({
        id: insight.id,
        type: insight.type as PatternInsight['type'],
        title: insight.title,
        description: insight.message,
        // Store full insight for modal
        _fullInsight: insight,
      }))
    }
    // Fall back to Firestore template insights
    if (firestoreInsights.length > 0) {
      return firestoreInsights
    }
    // Finally, use locally generated fallbacks
    return fallbackInsights
  }, [gptInsights, firestoreInsights, fallbackInsights])

  // Handle insight card click - open detail modal
  const handleInsightClick = useCallback((insight: PatternInsight & { _fullInsight?: AIPatternInsight }) => {
    if (insight._fullInsight) {
      // GPT insight - open full modal
      setSelectedInsight(insight._fullInsight)
    }
    // For template insights, we could show a simpler modal or do nothing
    // For now, only GPT insights are clickable
  }, [])

  // Handle action from modal
  const handleModalAction = useCallback((action: { type: AIPatternInsight['actionType']; id: string | null; insightId: string }) => {
    handleAction({
      type: action.type,
      id: action.id,
      insightId: action.insightId,
    })
    setSelectedInsight(null)
  }, [handleAction])

  // Format last generated time
  const lastGeneratedText = useMemo(() => {
    if (!patternData?.generatedAt) return null
    // Handle both Timestamp and Date types from Firestore
    const genAt = patternData.generatedAt as Date | { toDate: () => Date }
    const genDate = typeof (genAt as { toDate?: () => Date }).toDate === 'function'
      ? (genAt as { toDate: () => Date }).toDate()
      : genAt as Date
    const hours = Math.floor((Date.now() - genDate.getTime()) / (1000 * 60 * 60))
    if (hours < 1) return 'Just now'
    if (hours < 24) return `${hours}h ago`
    return 'This week'
  }, [patternData])

  const isMetricLoading = patternLoading || contextLoading || aiInsightsLoading

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={cn(
        'rounded-xl',
        'bg-slate-800/60 border border-slate-700/50',
        'backdrop-blur-sm',
        className
      )}
    >
      {/* Header with AI indicator - Compact */}
      <div className="flex items-center justify-between p-2 border-b border-slate-700/50">
        <div className="flex items-center gap-1.5">
          <motion.div
            variants={pulseVariants}
            initial="initial"
            animate="animate"
            className="relative"
          >
            <div className="absolute inset-0 rounded-full bg-violet-500/30 blur-sm" />
            <div className="relative p-1 rounded-full bg-gradient-to-br from-violet-500 to-cyan-500">
              <Brain className="h-3 w-3 text-white" />
            </div>
          </motion.div>
          <div>
            <span className="text-xs font-semibold text-white">Pattern Analysis</span>
            <span className="text-[10px] text-violet-400 block">
              {selectedMetric} patterns
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {lastGeneratedText && (
            <span className="text-[10px] text-slate-500">{lastGeneratedText}</span>
          )}
          {/* Beacon badge when insights are loaded */}
          {aiInsightsData && (
            <div className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-violet-500/20">
              <Sparkles className="h-2.5 w-2.5 text-violet-400" />
              <span className="text-[10px] text-violet-300">Beacon</span>
            </div>
          )}
        </div>
      </div>

      {/* Insights - Compact */}
      <div className="p-2">
        {isLoading || isMetricLoading || contextLoading ? (
          <LoadingSkeleton />
        ) : displayInsights.length > 0 ? (
          <motion.div variants={containerVariants} className="space-y-2">
            {displayInsights.map((insight) => {
              // Ensure insight has a valid type before rendering
              if (!insight || !insight.type) return null
              const colors = getInsightColors(insight.type)
              return (
                <motion.div
                  key={insight.id}
                  variants={itemVariants}
                  whileHover={{ x: 2, scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleInsightClick(insight)}
                  className={cn(
                    'p-3 rounded-lg cursor-pointer',
                    'transition-all duration-200',
                    colors.bg,
                    'border',
                    colors.border,
                    // Visual cue that GPT insights are clickable
                    (insight as { _fullInsight?: AIPatternInsight })._fullInsight && 'hover:border-violet-500/50'
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <InsightIcon type={insight.type} />
                      <span className="text-xs font-medium text-white">
                        {insight.title}
                      </span>
                    </div>
                    <ChevronRight className="h-3 w-3 text-slate-500 flex-shrink-0 mt-0.5" />
                  </div>
                  {/* Full text display - no truncation, natural line wrapping */}
                  <p className="text-[11px] text-slate-300 mt-1.5 leading-relaxed pl-5 break-words w-full">
                    {insight.description}
                  </p>
                </motion.div>
              )
            })}
          </motion.div>
        ) : (
          <div className="p-2 text-center">
            <p className="text-xs text-slate-400">
              Keep tracking for insights
            </p>
          </div>
        )}
      </div>

      {/* Footer - Shows next refresh time - Compact */}
      <div className="px-2 pb-1.5">
        <div className="py-1 text-center">
          <span className="text-[10px] text-slate-500">
            {gptInsights.length > 0 ? 'Refreshes every Sunday at 6 AM' : `Refreshes at 6 AM (${Intl.DateTimeFormat().resolvedOptions().timeZone.split('/').pop()?.replace('_', ' ') || 'local'})`}
          </span>
        </div>
      </div>

      {/* Project Lighthouse: Insight Detail Modal */}
      <Dialog open={!!selectedInsight} onOpenChange={(open) => !open && setSelectedInsight(null)}>
        {selectedInsight && (
          <InsightDetailModal
            insight={selectedInsight}
            onClose={() => setSelectedInsight(null)}
            onActionClick={handleModalAction}
          />
        )}
      </Dialog>
    </motion.div>
  )
}

// Legacy export for backward compatibility
export const AIPatternAnalysis = PatternAnalysis

export default PatternAnalysis
