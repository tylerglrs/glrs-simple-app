import { useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'
import {
  Compass,
  Heart,
  Users,
  Wallet,
  Activity,
  Sparkles,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// =============================================================================
// TYPES
// =============================================================================

export type ObjectiveArea = 'recovery' | 'social' | 'health' | 'financial'

export interface ObjectiveScore {
  area: ObjectiveArea
  score: number // 0-100
  goalCount: number
}

export interface GoalForRadar {
  category?: string
  progress: number
  status: 'active' | 'completed' | 'archived'
}

export interface ObjectiveRadarProps {
  goals: GoalForRadar[]
  className?: string
}

// =============================================================================
// ANIMATION VARIANTS
// =============================================================================

const containerVariants = {
  hidden: { opacity: 0, scale: 0.95 },
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

// =============================================================================
// CONSTANTS
// =============================================================================

const AREA_CONFIG: Record<ObjectiveArea, { label: string; icon: React.ReactNode; color: string }> = {
  recovery: {
    label: 'Recovery',
    icon: <Heart className="h-3.5 w-3.5" />,
    color: '#8b5cf6', // violet
  },
  social: {
    label: 'Social',
    icon: <Users className="h-3.5 w-3.5" />,
    color: '#06b6d4', // cyan
  },
  health: {
    label: 'Health',
    icon: <Activity className="h-3.5 w-3.5" />,
    color: '#10b981', // emerald
  },
  financial: {
    label: 'Financial',
    icon: <Wallet className="h-3.5 w-3.5" />,
    color: '#f59e0b', // amber
  },
}

// Mapping of common category names to objective areas
const CATEGORY_MAPPING: Record<string, ObjectiveArea> = {
  recovery: 'recovery',
  sobriety: 'recovery',
  addiction: 'recovery',
  social: 'social',
  relationships: 'social',
  family: 'social',
  friends: 'social',
  community: 'social',
  health: 'health',
  fitness: 'health',
  exercise: 'health',
  mental: 'health',
  wellness: 'health',
  financial: 'financial',
  money: 'financial',
  savings: 'financial',
  career: 'financial',
  work: 'financial',
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function mapCategoryToArea(category?: string): ObjectiveArea | null {
  if (!category) return null
  const normalized = category.toLowerCase()
  return CATEGORY_MAPPING[normalized] || null
}

function calculateObjectiveScores(goals: GoalForRadar[]): ObjectiveScore[] {
  const areaData: Record<ObjectiveArea, { totalProgress: number; count: number }> = {
    recovery: { totalProgress: 0, count: 0 },
    social: { totalProgress: 0, count: 0 },
    health: { totalProgress: 0, count: 0 },
    financial: { totalProgress: 0, count: 0 },
  }

  goals.forEach((goal) => {
    const area = mapCategoryToArea(goal.category)
    if (area) {
      areaData[area].totalProgress += goal.progress
      areaData[area].count++
    }
  })

  return (Object.keys(areaData) as ObjectiveArea[]).map((area) => ({
    area,
    score: areaData[area].count > 0
      ? Math.round(areaData[area].totalProgress / areaData[area].count)
      : 0,
    goalCount: areaData[area].count,
  }))
}

// =============================================================================
// CUSTOM TOOLTIP
// =============================================================================

interface CustomTooltipProps {
  active?: boolean
  payload?: Array<{ value: number; payload: { area: ObjectiveArea; goalCount: number } }>
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload || !payload.length) return null

  const data = payload[0]
  const config = AREA_CONFIG[data.payload.area]

  return (
    <div
      className={cn(
        'px-3 py-2 rounded-lg',
        'bg-slate-800/90 border border-slate-700/50',
        'backdrop-blur-sm shadow-lg'
      )}
    >
      <div className="flex items-center gap-2 mb-1">
        <span style={{ color: config.color }}>{config.icon}</span>
        <span className="text-sm font-medium text-white">{config.label}</span>
      </div>
      <p className="text-xs text-slate-400">
        Score: <span className="font-bold" style={{ color: config.color }}>{data.value}%</span>
      </p>
      <p className="text-xs text-slate-500">
        {data.payload.goalCount} goal{data.payload.goalCount !== 1 ? 's' : ''} in this area
      </p>
    </div>
  )
}

// =============================================================================
// LEGEND
// =============================================================================

interface LegendProps {
  scores: ObjectiveScore[]
}

function Legend({ scores }: LegendProps) {
  return (
    <div className="grid grid-cols-2 gap-2 mt-3">
      {scores.map((score) => {
        const config = AREA_CONFIG[score.area]
        return (
          <div
            key={score.area}
            className="flex items-center gap-2 p-2 rounded-lg bg-slate-700/30"
          >
            <div
              className="p-1 rounded"
              style={{ backgroundColor: `${config.color}20` }}
            >
              <span style={{ color: config.color }}>{config.icon}</span>
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-xs text-white block truncate">{config.label}</span>
              <span className="text-xs text-slate-500">
                {score.goalCount} goal{score.goalCount !== 1 ? 's' : ''}
              </span>
            </div>
            <span
              className="text-sm font-bold"
              style={{ color: config.color }}
            >
              {score.score}%
            </span>
          </div>
        )
      })}
    </div>
  )
}

// =============================================================================
// EMPTY STATE
// =============================================================================

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <div className="p-3 rounded-full bg-slate-700/50 mb-3">
        <Compass className="h-6 w-6 text-slate-400" />
      </div>
      <p className="text-sm text-slate-400 mb-1">No categorized goals</p>
      <p className="text-xs text-slate-500">
        Add categories to your goals to see your radar
      </p>
    </div>
  )
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function ObjectiveRadar({
  goals: goalsProp,
  className,
}: ObjectiveRadarProps) {
  // Default to empty array if undefined to prevent crashes
  const goals = goalsProp ?? []

  const scores = useMemo(() => calculateObjectiveScores(goals), [goals])

  // Check if we have any data to display
  const hasData = scores.some((s) => s.goalCount > 0)

  // Format data for radar chart
  const chartData = scores.map((score) => ({
    area: score.area,
    label: AREA_CONFIG[score.area].label,
    score: score.score,
    goalCount: score.goalCount,
    fullMark: 100,
  }))

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
          <div className="p-1.5 rounded-lg bg-cyan-500/20">
            <Compass className="h-4 w-4 text-cyan-400" />
          </div>
          <div>
            <span className="text-sm font-semibold text-white">Life Balance</span>
            <span className="text-xs text-slate-400 block">
              Goal distribution by area
            </span>
          </div>
        </div>

        {hasData && (
          <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-slate-700/50">
            <Sparkles className="h-3 w-3 text-slate-400" />
            <span className="text-xs text-slate-400">Balance view</span>
          </div>
        )}
      </div>

      {/* Chart */}
      <div className="p-3 md:p-4">
        {!hasData ? (
          <EmptyState />
        ) : (
          <>
            <div className="h-44 md:h-52">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={chartData} cx="50%" cy="50%" outerRadius="70%">
                  <PolarGrid stroke="#334155" strokeDasharray="3 3" />
                  <PolarAngleAxis
                    dataKey="label"
                    tick={{ fill: '#94a3b8', fontSize: 11 }}
                    tickLine={false}
                  />
                  <PolarRadiusAxis
                    angle={90}
                    domain={[0, 100]}
                    tick={{ fill: '#64748b', fontSize: 9 }}
                    tickCount={5}
                    axisLine={false}
                  />
                  <Radar
                    name="Progress"
                    dataKey="score"
                    stroke="#8b5cf6"
                    fill="#8b5cf6"
                    fillOpacity={0.3}
                    strokeWidth={2}
                  />
                  <Tooltip content={<CustomTooltip />} />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            {/* Legend */}
            <Legend scores={scores} />
          </>
        )}
      </div>
    </motion.div>
  )
}

export default ObjectiveRadar
