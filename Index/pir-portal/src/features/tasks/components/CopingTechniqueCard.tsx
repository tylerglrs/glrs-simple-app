import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useTechniqueCompletion } from '../hooks/useTechniqueCompletion'
import {
  Wind,
  FileText,
  Eye,
  Thermometer,
  User,
  ArrowLeftRight,
  Cloud,
  MessageSquare,
  Apple,
  Heart,
  GitBranch,
  Shield,
  Activity,
  Circle,
  FlaskConical,
  Shuffle,
  Compass,
  HeartHandshake,
  Lightbulb,
  Scale,
  Sparkles,
  Waves,
  Users,
  AlertTriangle,
  Tag,
  Calendar,
  Search,
  Home,
  ClipboardCheck,
  Footprints,
  ChevronRight,
  Clock,
  CheckCircle2,
  // Extended icons for days 32-61
  Moon,
  HelpCircle,
  Mail,
  MessageCircle,
  Target,
  Flame,
  Star,
  Unlock,
  CheckSquare,
  Leaf,
  Repeat,
  Filter,
  Battery,
  Trophy,
  LayoutGrid,
  Map,
  Briefcase,
  Droplet,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { useTodaysCopingTechnique } from '../hooks/useTodaysCopingTechnique'
import type { CopingTechnique, CopingCategory } from '../data/copingTechniques'
import { haptics } from '@/lib/animations'

// =============================================================================
// ICON MAPPING
// =============================================================================

const ICON_MAP: Record<string, LucideIcon> = {
  Wind,
  FileText,
  Eye,
  Thermometer,
  User,
  ArrowLeftRight,
  Cloud,
  MessageSquare,
  Apple,
  Heart,
  GitBranch,
  Shield,
  Activity,
  Circle,
  FlaskConical,
  Shuffle,
  Compass,
  HeartHandshake,
  Lightbulb,
  Scale,
  Sparkles,
  Waves,
  Users,
  AlertTriangle,
  Tag,
  Calendar,
  Search,
  Home,
  ClipboardCheck,
  Footprints,
  // Extended icons for days 32-61
  Moon,
  HelpCircle,
  Mail,
  MessageCircle,
  Target,
  Flame,
  Star,
  Unlock,
  CheckSquare,
  Leaf,
  Repeat,
  Filter,
  Battery,
  Trophy,
  LayoutGrid,
  Map,
  Briefcase,
  Droplet,
}

function getIcon(iconName: string): LucideIcon {
  return ICON_MAP[iconName] || Heart
}

// =============================================================================
// CATEGORY STYLES
// =============================================================================

const CATEGORY_STYLES: Record<CopingCategory, { bg: string; text: string; border: string }> = {
  CBT: {
    bg: 'bg-blue-100',
    text: 'text-blue-700',
    border: 'border-blue-200',
  },
  DBT: {
    bg: 'bg-purple-100',
    text: 'text-purple-700',
    border: 'border-purple-200',
  },
  MINDFULNESS: {
    bg: 'bg-teal-100',
    text: 'text-teal-700',
    border: 'border-teal-200',
  },
}

// =============================================================================
// TYPES
// =============================================================================

interface CopingTechniqueCardProps {
  technique?: CopingTechnique
  onTryIt?: (technique: CopingTechnique) => void
  className?: string
  compact?: boolean
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

/**
 * CopingTechniqueCard - Displays today's coping technique with an action button.
 *
 * Features:
 * - Automatically fetches today's technique if not provided
 * - Shows category badge (CBT, DBT, MINDFULNESS)
 * - Duration indicator
 * - "Try It" call-to-action button
 * - Animated entrance
 *
 * @example
 * <CopingTechniqueCard onTryIt={(technique) => openModal('copingTechnique', technique)} />
 */
export function CopingTechniqueCard({
  technique: providedTechnique,
  onTryIt,
  className,
  compact = false,
}: CopingTechniqueCardProps) {
  const isMobile = useMediaQuery('(max-width: 768px)')
  const todaysTechnique = useTodaysCopingTechnique()
  const { isCompleted, resetCompletion } = useTechniqueCompletion()
  const technique = providedTechnique || todaysTechnique

  const Icon = getIcon(technique.icon)

  const handleTryIt = () => {
    haptics.tap()
    onTryIt?.(technique)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className={className}
    >
      <Card
        className={cn(
          'overflow-hidden',
          'bg-transparent',
          'border-0',
          'hover:shadow-md transition-all duration-200',
          'cursor-pointer'
        )}
        onClick={handleTryIt}
      >
        <CardContent
          className={cn(
            compact ? 'py-3 px-4' : isMobile ? 'py-4 px-4' : 'py-5 px-5'
          )}
        >
          {/* Header: Title + Badge */}
          <div className="flex items-start justify-between gap-3 mb-2">
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  'flex items-center justify-center rounded-xl shadow-md relative',
                  isCompleted
                    ? 'bg-gradient-to-br from-green-400 to-green-600'
                    : 'bg-gradient-to-br from-teal-400 to-teal-600',
                  compact ? 'w-10 h-10' : isMobile ? 'w-11 h-11' : 'w-12 h-12'
                )}
              >
                {isCompleted ? (
                  <CheckCircle2
                    className={cn(
                      'text-white',
                      compact ? 'h-5 w-5' : isMobile ? 'h-5 w-5' : 'h-6 w-6'
                    )}
                  />
                ) : (
                  <Icon
                    className={cn(
                      'text-white',
                      compact ? 'h-5 w-5' : isMobile ? 'h-5 w-5' : 'h-6 w-6'
                    )}
                  />
                )}
              </div>
              <div>
                <div
                  className={cn(
                    'font-medium',
                    isCompleted ? 'text-green-600' : 'text-muted-foreground',
                    compact ? 'text-xs' : isMobile ? 'text-xs' : 'text-xs'
                  )}
                >
                  {isCompleted ? 'Completed Today!' : "Today's Technique"}
                </div>
                <h3
                  className={cn(
                    'font-bold',
                    isCompleted ? 'text-green-600' : 'text-teal-600',
                    compact ? 'text-sm' : isMobile ? 'text-base' : 'text-lg'
                  )}
                >
                  {technique.name}
                </h3>
              </div>
            </div>

            <Badge
              variant="secondary"
              className={cn(
                'shrink-0',
                CATEGORY_STYLES[technique.category].bg,
                CATEGORY_STYLES[technique.category].text,
                compact ? 'text-xs px-1.5 py-0' : 'text-xs'
              )}
            >
              {technique.category}
            </Badge>
          </div>

          {/* Description */}
          <p
            className={cn(
              'text-slate-600 mb-3 line-clamp-2',
              compact ? 'text-xs' : isMobile ? 'text-sm' : 'text-sm'
            )}
          >
            {technique.description}
          </p>

          {/* Footer: Duration + CTA */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-slate-500">
              <Clock className={cn(compact ? 'h-3 w-3' : 'h-4 w-4')} />
              <span className={cn('font-medium', compact ? 'text-xs' : 'text-xs')}>
                {technique.duration}
              </span>
            </div>

            {isCompleted ? (
              <div className="flex items-center gap-2">
                <Button
                  size={compact ? 'sm' : 'default'}
                  variant="outline"
                  className={cn(
                    'border-green-300 text-green-600 hover:bg-green-50',
                    compact && 'h-7 px-3 text-xs'
                  )}
                  onClick={(e) => {
                    e.stopPropagation()
                    handleTryIt()
                  }}
                >
                  <CheckCircle2 className="mr-1 h-4 w-4" />
                  Done
                </Button>
                <button
                  className="text-xs text-slate-400 hover:text-slate-600 underline"
                  onClick={(e) => {
                    e.stopPropagation()
                    haptics.tap()
                    resetCompletion()
                  }}
                >
                  Reset
                </button>
              </div>
            ) : (
              <Button
                size={compact ? 'sm' : 'default'}
                className={cn(
                  'bg-teal-500 hover:bg-teal-600 text-white',
                  compact && 'h-7 px-3 text-xs'
                )}
                onClick={(e) => {
                  e.stopPropagation()
                  handleTryIt()
                }}
              >
                Try It
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// =============================================================================
// MINI VERSION (FOR LISTS)
// =============================================================================

interface MiniTechniqueCardProps {
  technique: CopingTechnique
  onClick?: (technique: CopingTechnique) => void
  isActive?: boolean
}

/**
 * MiniTechniqueCard - Compact version for lists/grids of techniques.
 */
export function MiniTechniqueCard({
  technique,
  onClick,
  isActive = false,
}: MiniTechniqueCardProps) {
  const Icon = getIcon(technique.icon)
  const categoryStyle = CATEGORY_STYLES[technique.category]

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Card
        className={cn(
          'cursor-pointer transition-all duration-200',
          'hover:shadow-md',
          isActive
            ? 'ring-2 ring-teal-500 border-teal-300'
            : 'border-gray-200 hover:border-gray-300'
        )}
        onClick={() => {
          haptics.tap()
          onClick?.(technique)
        }}
      >
        <CardContent className="py-3 px-3">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                'flex items-center justify-center w-9 h-9 rounded-lg',
                categoryStyle.bg
              )}
            >
              <Icon className={cn('h-5 w-5', categoryStyle.text)} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm text-slate-800 truncate">
                {technique.name}
              </div>
              <div className="flex items-center gap-2">
                <span className={cn('text-xs font-medium', categoryStyle.text)}>
                  {technique.category}
                </span>
                <span className="text-xs text-slate-400">
                  {technique.duration}
                </span>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-slate-400 shrink-0" />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export default CopingTechniqueCard
