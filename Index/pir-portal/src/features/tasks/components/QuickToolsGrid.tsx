import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import {
  Heart,
  BookHeart,
  Mountain,
  Target,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { haptics } from '@/lib/animations'
import { Illustration, type IllustrationType } from '@/components/common'

// =============================================================================
// TYPES
// =============================================================================

interface QuickTool {
  id: string
  icon: LucideIcon
  label: string
  description: string
  modal: string
  gradient: string
  iconColor: string
  illustration: IllustrationType
}

interface QuickToolsGridProps {
  onOpenModal?: (modal: string) => void
  className?: string
}

// =============================================================================
// TOOL DEFINITIONS
// =============================================================================

const QUICK_TOOLS: QuickTool[] = [
  {
    id: 'gratitude-entry',
    icon: Heart,
    label: 'Gratitude Entry',
    description: 'Add what you are grateful for',
    modal: 'gratitude',
    gradient: 'from-rose-100 to-pink-100',
    iconColor: 'text-rose-500',
    illustration: 'gratitude',
  },
  {
    id: 'gratitude-journal',
    icon: BookHeart,
    label: 'Gratitude Journal',
    description: 'View past gratitudes',
    modal: 'gratitudeJournal',
    gradient: 'from-amber-100 to-orange-100',
    iconColor: 'text-amber-600',
    illustration: 'journal',
  },
  {
    id: 'challenges-history',
    icon: Mountain,
    label: 'Challenges History',
    description: 'Track your growth',
    modal: 'challengesHistory',
    gradient: 'from-slate-100 to-gray-100',
    iconColor: 'text-slate-600',
    illustration: 'achievement',
  },
  {
    id: 'goal-tracker',
    icon: Target,
    label: 'Goal Tracker',
    description: 'Monitor your progress',
    modal: 'goalProgress',
    gradient: 'from-teal-100 to-cyan-100',
    iconColor: 'text-teal-600',
    illustration: 'goals',
  },
]

// =============================================================================
// ANIMATION VARIANTS
// =============================================================================

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring' as const,
      stiffness: 300,
      damping: 20,
    },
  },
}

// =============================================================================
// TOOL CARD COMPONENT
// =============================================================================

interface ToolCardProps {
  tool: QuickTool
  onClick: () => void
}

function ToolCard({ tool, onClick }: ToolCardProps) {
  const isMobile = useMediaQuery('(max-width: 768px)')
  const Icon = tool.icon

  return (
    <motion.div
      variants={itemVariants}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
    >
      <Card
        className={cn(
          'cursor-pointer transition-all duration-200',
          'hover:shadow-lg border-gray-200/80',
          'overflow-hidden'
        )}
        onClick={() => {
          haptics.tap()
          onClick()
        }}
      >
        {/* Gradient Background */}
        <div className={cn('absolute inset-0 bg-gradient-to-br opacity-50', tool.gradient)} />

        {/* Illustration Background */}
        <div className="absolute inset-x-0 top-0 h-20 overflow-hidden opacity-20 pointer-events-none">
          <Illustration
            name={tool.illustration}
            className="w-full h-full object-cover"
            size="full"
          />
        </div>

        <CardContent
          className={cn(
            'relative flex flex-col items-center justify-center text-center',
            isMobile ? 'py-5 px-3 pt-8' : 'py-6 px-4 pt-10'
          )}
        >
          {/* Icon Container */}
          <div
            className={cn(
              'flex items-center justify-center rounded-2xl mb-3',
              'bg-white/90 shadow-sm backdrop-blur-sm',
              isMobile ? 'w-12 h-12' : 'w-14 h-14'
            )}
          >
            <Icon
              className={cn(
                tool.iconColor,
                isMobile ? 'h-6 w-6' : 'h-7 w-7'
              )}
            />
          </div>

          {/* Label */}
          <h3
            className={cn(
              'font-semibold text-slate-800 mb-1',
              isMobile ? 'text-sm' : 'text-base'
            )}
          >
            {tool.label}
          </h3>

          {/* Description */}
          <p
            className={cn(
              'text-slate-500 leading-tight',
              isMobile ? 'text-xs' : 'text-sm'
            )}
          >
            {tool.description}
          </p>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

/**
 * QuickToolsGrid - A 2x2 grid of quick action tools for the Reflection tab.
 *
 * Features:
 * - 4 tools: Gratitude Entry, Gratitude Journal, Challenges History, Goal Tracker
 * - Animated entrance with staggered cards
 * - Hover and tap effects
 * - Mobile-responsive sizing
 *
 * @example
 * <QuickToolsGrid onOpenModal={(modal) => openModal(modal)} />
 */
export function QuickToolsGrid({ onOpenModal, className }: QuickToolsGridProps) {
  const isMobile = useMediaQuery('(max-width: 768px)')

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className={cn('grid grid-cols-2', isMobile ? 'gap-3' : 'gap-4', className)}
    >
      {QUICK_TOOLS.map((tool) => (
        <ToolCard
          key={tool.id}
          tool={tool}
          onClick={() => onOpenModal?.(tool.modal)}
        />
      ))}
    </motion.div>
  )
}

export default QuickToolsGrid
