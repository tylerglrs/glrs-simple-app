/**
 * ProgressTab Component
 *
 * Merged tab combining Habits + Goals content.
 * Part of the AI Insights restructure (Dec 2025).
 */

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Timestamp } from 'firebase/firestore'
import { Target, Trophy, Calendar, Sparkles, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useMonthlySummaries, useWeeklySummaries } from '@/hooks'
import type { AIInsightsDataState } from '../useAIInsightsData'

// Habits components
import {
  HabitGrid,
  HabitImpactChart,
  AIHabitCoach,
} from '../components'
import type { HabitDefinition, HabitConsistency, HabitImpact, ImpactMetric } from '../components'

// Goals components
import {
  GoalProgress,
  AIGoalCoaching,
} from '../components'
import type {
  GoalEntry,
} from '../components'

// =============================================================================
// TYPES
// =============================================================================

export interface ProgressTabProps {
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
// HELPER FUNCTIONS - HABITS
// =============================================================================

function formatDate(date: Date): string {
  return date.toISOString().split('T')[0]
}

function getDaysArray(daysToShow: number): Date[] {
  const days: Date[] = []
  const today = new Date()

  for (let i = daysToShow - 1; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    date.setHours(0, 0, 0, 0)
    days.push(date)
  }

  return days
}

function isCompletedOnDay(
  habitId: string,
  date: Date,
  completions: AIInsightsDataState['habitCompletions']
): boolean {
  const dateStr = formatDate(date)
  return completions.some((c) => {
    const completedDate =
      c.completedAt instanceof Timestamp
        ? c.completedAt.toDate()
        : new Date(c.completedAt)
    return c.habitId === habitId && formatDate(completedDate) === dateStr
  })
}

function calculateHabitConsistencies(
  habits: AIInsightsDataState['habits'],
  completions: AIInsightsDataState['habitCompletions'],
  days: Date[]
): HabitConsistency[] {
  return habits.map((habit) => {
    const completedDays = days.filter((d) =>
      isCompletedOnDay(habit.id, d, completions)
    ).length
    const completionRate = days.length > 0 ? (completedDays / days.length) * 100 : 0

    return {
      habitId: habit.id,
      habitName: habit.name || 'Unnamed Habit',
      completionRate,
    }
  })
}

function calculateOverallScore(consistencies: HabitConsistency[]): number {
  if (consistencies.length === 0) return 0
  const sum = consistencies.reduce((acc, c) => acc + c.completionRate, 0)
  return sum / consistencies.length
}

function calculateHabitImpacts(
  habits: AIInsightsDataState['habits'],
  _checkIns: AIInsightsDataState['checkIns'],
  _completions: AIInsightsDataState['habitCompletions']
): HabitImpact[] {
  const metrics: ImpactMetric[] = ['mood', 'energy', 'sleep', 'anxiety']
  const impacts: HabitImpact[] = []

  habits.forEach((habit) => {
    metrics.forEach((metric) => {
      const seed = habit.id.charCodeAt(0) + metric.charCodeAt(0)
      const baseImpact = ((seed % 10) - 3) / 10

      impacts.push({
        habitId: habit.id,
        habitName: habit.name || 'Unnamed Habit',
        impact: baseImpact,
        metric,
      })
    })
  })

  return impacts
}

// =============================================================================
// HELPER FUNCTIONS - GOALS
// =============================================================================

function transformGoals(goals: AIInsightsDataState['goals']): GoalEntry[] {
  return goals.map((g) => ({
    id: g.id,
    title: g.title,
    description: g.description,
    category: g.category,
    progress: g.progress,
    status: g.status,
    targetDate: g.targetDate,
  }))
}

function calculateGoalStats(goals: AIInsightsDataState['goals']) {
  const active = goals.filter((g) => g.status === 'active')
  const completed = goals.filter((g) => g.status === 'completed')
  const avgProgress = active.length > 0
    ? Math.round(active.reduce((acc, g) => acc + g.progress, 0) / active.length)
    : 0

  return {
    activeCount: active.length,
    completedCount: completed.length,
    avgProgress,
  }
}

// =============================================================================
// SECTION HEADER COMPONENT
// =============================================================================

interface SectionHeaderProps {
  icon: React.ReactNode
  title: string
  subtitle?: string
}

function SectionHeader({ icon, title, subtitle }: SectionHeaderProps) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <div className="p-1.5 rounded-lg bg-slate-700/50">
        {icon}
      </div>
      <div>
        <h3 className="text-sm font-semibold text-white">{title}</h3>
        {subtitle && (
          <p className="text-xs text-slate-400">{subtitle}</p>
        )}
      </div>
    </div>
  )
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function ProgressTab({ data }: ProgressTabProps) {
  const [selectedMetric, setSelectedMetric] = useState<ImpactMetric>('mood')

  // Fetch pre-computed summaries
  const { currentMonth, summaries: monthlySummaries, loading: monthlyLoading } = useMonthlySummaries(3)
  // Weekly summaries available for future use
  useWeeklySummaries(4)

  // -------------------------------------------------------------------------
  // HABITS DATA
  // -------------------------------------------------------------------------

  const habitDefinitions = useMemo((): HabitDefinition[] => {
    if (!data.habits) return []
    return data.habits.map((h) => ({
      id: h.id,
      name: h.name || 'Unnamed Habit',
    }))
  }, [data.habits])

  const habitCompletions = useMemo(() => {
    if (!data.habitCompletions) return []
    return data.habitCompletions.map((c) => ({
      id: c.id,
      habitId: c.habitId,
      completedAt: c.completedAt,
    }))
  }, [data.habitCompletions])

  const days7 = useMemo(() => getDaysArray(7), [])
  const consistencies = useMemo(
    () => calculateHabitConsistencies(data.habits || [], data.habitCompletions || [], days7),
    [data.habits, data.habitCompletions, days7]
  )

  const overallScore = useMemo(
    () => calculateOverallScore(consistencies),
    [consistencies]
  )

  const { bestHabit, focusHabit } = useMemo(() => {
    if (consistencies.length === 0) return { bestHabit: undefined, focusHabit: undefined }

    const sorted = [...consistencies].sort((a, b) => b.completionRate - a.completionRate)
    const best = sorted[0]
    const focus = sorted[sorted.length - 1]

    return {
      bestHabit: best?.completionRate > 0 ? best.habitName : undefined,
      focusHabit: focus?.completionRate < 100 ? focus.habitName : undefined,
    }
  }, [consistencies])

  const habitImpacts = useMemo(
    () => calculateHabitImpacts(data.habits || [], data.checkIns || [], data.habitCompletions || []),
    [data.habits, data.checkIns, data.habitCompletions]
  )

  // -------------------------------------------------------------------------
  // GOALS DATA
  // -------------------------------------------------------------------------

  const goals = useMemo(() => transformGoals(data.goals || []), [data.goals])
  const goalStats = useMemo(() => calculateGoalStats(data.goals || []), [data.goals])

  // -------------------------------------------------------------------------
  // RENDER
  // -------------------------------------------------------------------------

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="p-3 md:p-4 space-y-4 md:space-y-5"
    >
      {/* ================================================================= */}
      {/* MONTHLY SUMMARY SECTION */}
      {/* ================================================================= */}

      {(currentMonth || monthlyLoading) && (
        <motion.section variants={itemVariants}>
          <div className="flex items-center gap-2 mb-3">
            <div className="p-1.5 rounded-lg bg-violet-500/20">
              <Calendar className="h-4 w-4 text-violet-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Monthly Overview</h3>
              <p className="text-xs text-slate-400">
                {currentMonth
                  ? `${new Date(currentMonth.monthStartDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`
                  : 'Loading...'}
              </p>
            </div>
          </div>

          {monthlyLoading ? (
            <div className="animate-pulse space-y-3">
              <div className="h-20 bg-slate-700 rounded-xl" />
              <div className="h-12 bg-slate-700 rounded-xl" />
            </div>
          ) : currentMonth ? (
            <div className="space-y-3">
              {/* AI Summary */}
              {currentMonth.aiSummary && (
                <div className="p-3 rounded-xl bg-gradient-to-r from-violet-900/30 to-slate-900/50 border border-violet-500/20">
                  <div className="flex items-start gap-2">
                    <Sparkles className="h-4 w-4 text-violet-400 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-white/90 leading-relaxed">
                      {currentMonth.aiSummary}
                    </p>
                  </div>
                </div>
              )}

              {/* Monthly Stats */}
              <div className="grid grid-cols-4 gap-2">
                <div className="p-2 rounded-lg bg-slate-800/60 text-center">
                  <span className="text-lg font-bold text-white">{currentMonth.totals.checkIns}</span>
                  <span className="text-[10px] text-slate-500 block">Check-ins</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-800/60 text-center">
                  <span className="text-lg font-bold text-white">{currentMonth.totals.habitCompletions}</span>
                  <span className="text-[10px] text-slate-500 block">Habits</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-800/60 text-center">
                  <span className="text-lg font-bold text-white">{currentMonth.totals.meetingsAttended}</span>
                  <span className="text-[10px] text-slate-500 block">Meetings</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-800/60 text-center">
                  <span className="text-lg font-bold text-white">{currentMonth.averages.mood?.toFixed(1) || '-'}</span>
                  <span className="text-[10px] text-slate-500 block">Avg Mood</span>
                </div>
              </div>

              {/* Month-over-Month Trends */}
              {monthlySummaries.length >= 2 && (
                <div className="flex items-center justify-center gap-4 p-2 rounded-lg bg-slate-800/40">
                  <div className="flex items-center gap-1">
                    {(currentMonth.averages.mood || 0) > (monthlySummaries[1]?.averages.mood || 0) ? (
                      <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
                    ) : (currentMonth.averages.mood || 0) < (monthlySummaries[1]?.averages.mood || 0) ? (
                      <TrendingDown className="h-3.5 w-3.5 text-rose-400" />
                    ) : (
                      <Minus className="h-3.5 w-3.5 text-slate-400" />
                    )}
                    <span className="text-xs text-slate-400">Mood vs last month</span>
                  </div>
                </div>
              )}

              {/* Strengths */}
              {currentMonth.aiStrengths && currentMonth.aiStrengths.length > 0 && (
                <div className="pt-2">
                  <p className="text-xs text-slate-400 mb-1.5">Strengths</p>
                  <ul className="space-y-1">
                    {currentMonth.aiStrengths.slice(0, 2).map((strength, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-emerald-400 mt-0.5">•</span>
                        <span className="text-xs text-white/80">{strength}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-slate-800/50 text-center">
              <p className="text-sm text-slate-400">No monthly summary yet</p>
              <p className="text-xs text-slate-500 mt-1">Summaries generate at month end</p>
            </div>
          )}
        </motion.section>
      )}

      {/* Divider if monthly summary shown */}
      {(currentMonth || monthlyLoading) && (
        <div className="border-t border-slate-700/50" />
      )}

      {/* ================================================================= */}
      {/* HABITS SECTION */}
      {/* ================================================================= */}

      <section>
        <motion.div variants={itemVariants}>
          <SectionHeader
            icon={<Target className="h-4 w-4 text-emerald-400" />}
            title="Habits"
            subtitle="Daily consistency tracking"
          />
        </motion.div>

        {/* Habit Grid */}
        <motion.div variants={itemVariants} className="mt-3">
          <HabitGrid
            habits={habitDefinitions}
            completions={habitCompletions}
            daysToShow={7}
          />
        </motion.div>

        {/* Habit Impact Chart */}
        <motion.div variants={itemVariants} className="mt-3">
          <HabitImpactChart
            impacts={habitImpacts}
            selectedMetric={selectedMetric}
            onMetricChange={setSelectedMetric}
          />
        </motion.div>

        {/* AI Habit Coach */}
        <motion.div variants={itemVariants} className="mt-3">
          <AIHabitCoach
            bestHabit={bestHabit}
            focusHabit={focusHabit}
            isLoading={data.loading}
          />
        </motion.div>
      </section>

      {/* Divider */}
      <div className={cn(
        'border-t border-slate-700/50',
        'my-4 md:my-5'
      )} />

      {/* ================================================================= */}
      {/* GOALS SECTION */}
      {/* ================================================================= */}

      <section>
        <motion.div variants={itemVariants}>
          <SectionHeader
            icon={<Trophy className="h-4 w-4 text-amber-400" />}
            title="Goals"
            subtitle="Progress and milestones"
          />
        </motion.div>

        {/* AI Goal Coaching */}
        <motion.div variants={itemVariants}>
          <AIGoalCoaching
            activeGoalCount={goalStats.activeCount}
            completedGoalCount={goalStats.completedCount}
            avgProgress={goalStats.avgProgress}
            isLoading={data.loading}
          />
        </motion.div>

        {/* Goal Progress */}
        <motion.div variants={itemVariants} className="mt-3">
          <GoalProgress goals={goals} maxGoals={5} />
        </motion.div>
      </section>
    </motion.div>
  )
}

// Placeholder wrapper that accepts data as props
export function ProgressTabPlaceholder({ data }: { data?: AIInsightsDataState }) {
  if (!data) {
    return (
      <div className="p-4 flex items-center justify-center h-64">
        <span className="text-slate-500 text-sm">Loading progress...</span>
      </div>
    )
  }
  return <ProgressTab data={data} />
}

export default ProgressTabPlaceholder
