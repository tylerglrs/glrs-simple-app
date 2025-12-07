import { useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'
import {
  Trophy,
  Heart,
  Briefcase,
  Users,
  Star,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// =============================================================================
// TYPES
// =============================================================================

export type WinCategory = 'recovery' | 'personal' | 'work' | 'family' | 'other'

export interface WinEntry {
  id: string
  text: string
  category?: string
}

export interface CategoryData {
  name: string
  value: number
  color: string
  icon: React.ReactNode
}

export interface WinCategoriesProps {
  wins: WinEntry[]
  className?: string
}

// =============================================================================
// ANIMATION VARIANTS
// =============================================================================

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
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

// =============================================================================
// CONSTANTS
// =============================================================================

const CATEGORY_CONFIG: Record<WinCategory, { label: string; color: string; icon: React.ReactNode }> = {
  recovery: {
    label: 'Recovery',
    color: '#8b5cf6', // violet-500
    icon: <Star className="h-3.5 w-3.5" />,
  },
  personal: {
    label: 'Personal',
    color: '#10b981', // emerald-500
    icon: <Heart className="h-3.5 w-3.5" />,
  },
  work: {
    label: 'Work',
    color: '#3b82f6', // blue-500
    icon: <Briefcase className="h-3.5 w-3.5" />,
  },
  family: {
    label: 'Family',
    color: '#f59e0b', // amber-500
    icon: <Users className="h-3.5 w-3.5" />,
  },
  other: {
    label: 'Other',
    color: '#64748b', // slate-500
    icon: <Trophy className="h-3.5 w-3.5" />,
  },
}

// Keywords to auto-categorize wins
const CATEGORY_KEYWORDS: Record<WinCategory, string[]> = {
  recovery: ['sober', 'sobriety', 'clean', 'meeting', 'sponsor', 'recovery', 'step', 'craving', 'urge', 'temptation', 'relapse'],
  personal: ['myself', 'health', 'exercise', 'gym', 'meditation', 'self', 'growth', 'hobby', 'learned', 'goal'],
  work: ['work', 'job', 'career', 'project', 'boss', 'colleague', 'promotion', 'interview', 'meeting', 'deadline'],
  family: ['family', 'mom', 'dad', 'parent', 'child', 'kid', 'spouse', 'wife', 'husband', 'sibling', 'brother', 'sister'],
  other: [],
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function categorizeWin(win: WinEntry): WinCategory {
  // If category is already set, use it
  if (win.category && win.category in CATEGORY_CONFIG) {
    return win.category as WinCategory
  }

  // Safety check: if text is undefined or empty, return 'other'
  if (!win.text || typeof win.text !== 'string') {
    return 'other'
  }

  // Auto-categorize based on keywords
  const lowerText = win.text.toLowerCase()

  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (category === 'other') continue
    if (keywords.some((keyword) => lowerText.includes(keyword))) {
      return category as WinCategory
    }
  }

  return 'other'
}

function buildCategoryData(wins: WinEntry[]): CategoryData[] {
  const counts: Record<WinCategory, number> = {
    recovery: 0,
    personal: 0,
    work: 0,
    family: 0,
    other: 0,
  }

  wins.forEach((win) => {
    const category = categorizeWin(win)
    counts[category]++
  })

  return (Object.keys(counts) as WinCategory[])
    .filter((category) => counts[category] > 0)
    .map((category) => ({
      name: CATEGORY_CONFIG[category].label,
      value: counts[category],
      color: CATEGORY_CONFIG[category].color,
      icon: CATEGORY_CONFIG[category].icon,
    }))
}

// =============================================================================
// CUSTOM TOOLTIP
// =============================================================================

interface CustomTooltipProps {
  active?: boolean
  payload?: Array<{ name: string; value: number; payload: CategoryData }>
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload || !payload.length) return null

  const data = payload[0]

  return (
    <div
      className={cn(
        'px-3 py-2 rounded-lg',
        'bg-slate-800/90 border border-slate-700/50',
        'backdrop-blur-sm shadow-lg'
      )}
    >
      <p className="text-sm font-medium text-white">{data.name}</p>
      <p className="text-xs text-slate-400">
        {data.value} win{data.value !== 1 ? 's' : ''}
      </p>
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
        <Trophy className="h-6 w-6 text-slate-400" />
      </div>
      <p className="text-sm text-slate-400 mb-1">No wins logged yet</p>
      <p className="text-xs text-slate-500">
        Celebrate your victories, big and small
      </p>
    </div>
  )
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function WinCategories({
  wins: winsProp,
  className,
}: WinCategoriesProps) {
  // Default to empty array if undefined to prevent crashes
  const wins = winsProp ?? []

  const categoryData = useMemo(() => buildCategoryData(wins), [wins])
  const totalWins = wins.length

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
          <div className="p-1.5 rounded-lg bg-amber-500/20">
            <Trophy className="h-4 w-4 text-amber-400" />
          </div>
          <div>
            <span className="text-sm font-semibold text-white">Win Categories</span>
            <span className="text-xs text-slate-400 block">
              {totalWins} total win{totalWins !== 1 ? 's' : ''} logged
            </span>
          </div>
        </div>
      </div>

      {/* Chart and Legend */}
      {totalWins === 0 ? (
        <EmptyState />
      ) : (
        <div className="p-3 md:p-4">
          <div className="flex flex-col sm:flex-row items-center gap-3 md:gap-4">
            {/* Donut Chart */}
            <div className="w-28 h-28 md:w-32 md:h-32 flex-shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={30}
                    outerRadius={50}
                    paddingAngle={3}
                    dataKey="value"
                    stroke="transparent"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Legend */}
            <div className="flex-1 space-y-2">
              {categoryData.map((category) => (
                <motion.div
                  key={category.name}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-sm flex items-center justify-center"
                      style={{ backgroundColor: category.color }}
                    >
                      <span className="text-white scale-75">{category.icon}</span>
                    </div>
                    <span className="text-xs text-slate-300">{category.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-white">{category.value}</span>
                    <span className="text-xs text-slate-500">
                      ({Math.round((category.value / totalWins) * 100)}%)
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Center stat */}
          <div className="mt-4 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30">
              <Trophy className="h-4 w-4 text-amber-400" />
              <span className="text-sm font-semibold text-white">{totalWins}</span>
              <span className="text-xs text-amber-300">Total Wins</span>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  )
}

export default WinCategories
