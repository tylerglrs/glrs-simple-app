import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'
import { Trophy, Target, TrendingUp, Star } from 'lucide-react'
import { cn } from '@/lib/utils'

// =============================================================================
// TYPES
// =============================================================================

export interface HabitConsistency {
  habitId: string
  habitName: string
  completionRate: number
  color?: string
}

export interface ConsistencyRadialProps {
  overallScore: number
  habitConsistencies: HabitConsistency[]
  weeklyChange?: number
  bestHabit?: string
  focusHabit?: string
  className?: string
}

// =============================================================================
// ANIMATION VARIANTS
// =============================================================================

const containerVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      type: 'spring' as const,
      stiffness: 400,
      damping: 25,
    },
  },
}

const numberVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      delay: 0.3,
      type: 'spring' as const,
      stiffness: 400,
      damping: 25,
    },
  },
}

// =============================================================================
// CONSTANTS
// =============================================================================

const COLORS = {
  excellent: '#22c55e', // green-500
  good: '#eab308', // yellow-500
  needsWork: '#f97316', // orange-500
  low: '#ef4444', // red-500
  background: '#334155', // slate-700
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function getScoreColor(score: number): string {
  if (score >= 80) return COLORS.excellent
  if (score >= 60) return COLORS.good
  if (score >= 40) return COLORS.needsWork
  return COLORS.low
}

function getScoreLabel(score: number): string {
  if (score >= 80) return 'Excellent!'
  if (score >= 60) return 'Good'
  if (score >= 40) return 'Building'
  return 'Keep going'
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function ConsistencyRadial({
  overallScore,
  habitConsistencies: habitConsistenciesProp,
  weeklyChange = 0,
  bestHabit,
  focusHabit,
  className,
}: ConsistencyRadialProps) {
  // Default to empty array if undefined to prevent crashes
  const habitConsistencies = habitConsistenciesProp ?? []

  const chartData = useMemo(() => {
    return [
      { name: 'completed', value: overallScore, fill: getScoreColor(overallScore) },
      { name: 'remaining', value: 100 - overallScore, fill: COLORS.background },
    ]
  }, [overallScore])

  const scoreColor = getScoreColor(overallScore)

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
      {/* Header */}
      <div className="flex items-center justify-between p-2 md:p-3 border-b border-slate-700/50">
        <div className="flex items-center gap-2">
          <Trophy className="h-4 w-4 text-amber-400" />
          <span className="text-sm font-semibold text-white">Consistency Score</span>
        </div>
        {weeklyChange !== 0 && (
          <div
            className={cn(
              'flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium',
              weeklyChange > 0
                ? 'bg-emerald-500/20 text-emerald-400'
                : 'bg-rose-500/20 text-rose-400'
            )}
          >
            <TrendingUp
              className={cn('h-3 w-3', weeklyChange < 0 && 'rotate-180')}
            />
            {weeklyChange > 0 ? '+' : ''}{weeklyChange}% vs last week
          </div>
        )}
      </div>

      <div className="p-3 md:p-4">
        <div className="flex items-center gap-3 md:gap-4">
          {/* Radial Chart */}
          <div className="relative w-28 h-28 md:w-32 md:h-32 flex-shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={35}
                  outerRadius={50}
                  startAngle={90}
                  endAngle={-270}
                  dataKey="value"
                  strokeWidth={0}
                >
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.fill}
                      style={{
                        filter:
                          index === 0
                            ? `drop-shadow(0 0 8px ${scoreColor}40)`
                            : 'none',
                      }}
                    />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>

            {/* Center content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <motion.span
                variants={numberVariants}
                initial="hidden"
                animate="visible"
                className="text-3xl font-bold"
                style={{ color: scoreColor }}
              >
                {overallScore.toFixed(0)}%
              </motion.span>
              <span className="text-xs text-slate-400">
                {getScoreLabel(overallScore)}
              </span>
            </div>
          </div>

          {/* Stats */}
          <div className="flex-1 space-y-3">
            {/* Best habit */}
            {bestHabit && (
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-emerald-500/20">
                  <Star className="h-3.5 w-3.5 text-emerald-400" />
                </div>
                <div>
                  <span className="text-xs text-slate-500 block">Best</span>
                  <span className="text-xs text-white font-medium">
                    {bestHabit}
                  </span>
                </div>
              </div>
            )}

            {/* Focus habit */}
            {focusHabit && (
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-amber-500/20">
                  <Target className="h-3.5 w-3.5 text-amber-400" />
                </div>
                <div>
                  <span className="text-xs text-slate-500 block">Focus</span>
                  <span className="text-xs text-white font-medium">
                    {focusHabit}
                  </span>
                </div>
              </div>
            )}

            {/* Habit count */}
            <div className="text-xs text-slate-500">
              Tracking {habitConsistencies.length} habit{habitConsistencies.length !== 1 ? 's' : ''}
            </div>
          </div>
        </div>

        {/* Mini habit bars */}
        {habitConsistencies.length > 0 && (
          <div className="mt-4 space-y-2">
            <span className="text-xs text-slate-500">By Habit</span>
            <div className="space-y-1.5">
              {habitConsistencies.slice(0, 4).map((habit) => (
                <div key={habit.habitId} className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 w-20 truncate">
                    {habit.habitName}
                  </span>
                  <div className="flex-1 h-1.5 rounded-full bg-slate-700/50 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${habit.completionRate}%` }}
                      transition={{ duration: 0.8, delay: 0.5 }}
                      className="h-full rounded-full"
                      style={{
                        backgroundColor: getScoreColor(habit.completionRate),
                      }}
                    />
                  </div>
                  <span
                    className="text-xs font-medium w-8 text-right"
                    style={{ color: getScoreColor(habit.completionRate) }}
                  >
                    {habit.completionRate.toFixed(0)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  )
}

export default ConsistencyRadial
