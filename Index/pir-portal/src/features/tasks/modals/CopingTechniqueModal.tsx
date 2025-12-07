import { useState } from 'react'
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
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
  Clock,
  X,
  CheckCircle,
  Check,
  Loader2,
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
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { useTodaysCopingTechnique } from '../hooks/useTodaysCopingTechnique'
import { useTechniqueCompletion } from '../hooks/useTechniqueCompletion'
import { COPING_TECHNIQUES } from '../data/copingTechniques'
import type { CopingTechnique, CopingCategory } from '../data/copingTechniques'

// =============================================================================
// TYPES
// =============================================================================

export interface CopingTechniqueModalProps {
  onClose: () => void
  technique?: CopingTechnique // Optional - if not provided, uses today's
  techniqueId?: string // Optional - look up technique by ID
}

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
    bg: 'bg-purple-100',
    text: 'text-purple-700',
    border: 'border-purple-200',
  },
  DBT: {
    bg: 'bg-orange-100',
    text: 'text-orange-700',
    border: 'border-orange-200',
  },
  MINDFULNESS: {
    bg: 'bg-teal-100',
    text: 'text-teal-700',
    border: 'border-teal-200',
  },
}

// =============================================================================
// COMPONENT
// =============================================================================

export function CopingTechniqueModal({ onClose, technique: providedTechnique, techniqueId }: CopingTechniqueModalProps) {
  const isMobile = useMediaQuery('(max-width: 768px)')
  const todaysTechnique = useTodaysCopingTechnique()
  const { isCompleted, loading: completionLoading, markComplete } = useTechniqueCompletion()
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Look up technique by ID if provided, otherwise use provided technique or fall back to today's
  const technique = (() => {
    if (techniqueId) {
      const found = COPING_TECHNIQUES.find(t => t.id === techniqueId)
      if (found) return found
    }
    return providedTechnique || todaysTechnique
  })()
  const Icon = getIcon(technique.icon)
  const categoryStyle = CATEGORY_STYLES[technique.category]

  const handleMarkComplete = async () => {
    setIsSubmitting(true)
    try {
      await markComplete({
        id: technique.id,
        name: technique.name,
        category: technique.category,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <DialogContent className="max-w-[95vw] sm:max-w-[500px] p-0">
      {/* Header */}
      <DialogHeader className="p-5 pb-4 border-b bg-gradient-to-r from-teal-50 to-green-50">
        <div className="flex items-center justify-between">
          <DialogTitle className="flex items-center gap-2 text-lg font-semibold text-teal-700">
            <Icon className="h-5 w-5" />
            {techniqueId ? 'Recommended Technique' : "Today's Technique"}
          </DialogTitle>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
            <X className="h-5 w-5" />
          </Button>
        </div>
      </DialogHeader>

      <ScrollArea className="max-h-[55vh]">
        <div className={cn('p-5 space-y-4', isMobile && 'p-4 space-y-3')}>
          {/* Technique Header */}
          <div className="bg-white rounded-xl p-4 border shadow-sm">
            <div className="flex items-start gap-3">
              <div className={cn(
                'w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0',
                'bg-gradient-to-br from-teal-400 to-teal-600'
              )}>
                <Icon className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-foreground mb-1">
                  {technique.name}
                </h3>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge
                    variant="secondary"
                    className={cn(
                      'text-xs font-medium',
                      categoryStyle.bg,
                      categoryStyle.text,
                      categoryStyle.border,
                      'border'
                    )}
                  >
                    {technique.category}
                  </Badge>
                  <div className="flex items-center gap-1 text-slate-500">
                    <Clock className="h-3.5 w-3.5" />
                    <span className="text-xs">{technique.duration}</span>
                  </div>
                </div>
              </div>
            </div>
            <p className="text-slate-600 mt-3 text-sm leading-relaxed">
              {technique.description}
            </p>
          </div>

          {/* Steps */}
          <div className="bg-slate-50 rounded-xl p-4 border">
            <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2 text-sm">
              <CheckCircle className="h-4 w-4 text-teal-500" />
              How to Practice
            </h4>
            <ol className="space-y-2">
              {technique.steps.map((step, index) => (
                <li key={index} className="flex gap-2 text-sm">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center text-xs font-medium">
                    {index + 1}
                  </span>
                  <span className="text-slate-700 text-xs pt-0.5">{step}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* Benefits */}
          <div className="bg-gradient-to-r from-teal-50 to-green-50 rounded-xl p-4 border border-teal-100">
            <h4 className="font-semibold text-teal-700 mb-2 text-sm">Benefits</h4>
            <div className="flex flex-wrap gap-1.5">
              {technique.benefits.map((benefit, index) => (
                <span
                  key={index}
                  className="px-2 py-0.5 bg-white/80 rounded-full text-xs text-teal-700 border border-teal-200"
                >
                  {benefit}
                </span>
              ))}
            </div>
          </div>

          {/* Tip */}
          <div className="bg-amber-50 rounded-xl p-3 border border-amber-100">
            <p className="text-xs text-amber-800">
              <strong>Tip:</strong> Practice this technique when you're calm so it becomes automatic during stressful moments.
            </p>
          </div>
        </div>
      </ScrollArea>

      {/* Mark Complete Button - Always visible at bottom */}
      <div className={cn('p-4 border-t bg-white', isMobile && 'p-3')}>
        {isCompleted ? (
          <div className="flex items-center justify-center gap-2 py-3 px-4 bg-green-50 rounded-xl border border-green-200">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span className="font-medium text-green-700">Completed Today!</span>
          </div>
        ) : (
          <Button
            onClick={handleMarkComplete}
            disabled={isSubmitting || completionLoading}
            className="w-full h-12 bg-teal-500 hover:bg-teal-600 text-white font-medium"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Check className="mr-2 h-5 w-5" />
                Mark as Completed
              </>
            )}
          </Button>
        )}
      </div>
    </DialogContent>
  )
}

export default CopingTechniqueModal
