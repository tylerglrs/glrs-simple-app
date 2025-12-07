import { Button } from '@/components/ui/button'
import {
  Sun,
  Moon,
  Phone,
  CheckCircle,
  Sparkles,
  Target,
  Plus,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useModalStore } from '@/stores/modalStore'

// =============================================================================
// TYPES
// =============================================================================

export interface QuickActionButtonsProps {
  variant?: 'horizontal' | 'vertical' | 'grid'
  showMorningCheckIn?: boolean
  showEveningReflection?: boolean
  showSOS?: boolean
  showHabit?: boolean
  showWin?: boolean
  showIntention?: boolean
  morningCheckInComplete?: boolean
  eveningReflectionComplete?: boolean
  className?: string
}

interface QuickAction {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  color: string
  bgColor: string
  hoverColor: string
  modalName: string
  show: boolean
  completed?: boolean
}

// =============================================================================
// COMPONENT
// =============================================================================

export function QuickActionButtons({
  variant = 'horizontal',
  showMorningCheckIn = true,
  showEveningReflection = true,
  showSOS = true,
  showHabit = false,
  showWin = false,
  showIntention = false,
  morningCheckInComplete = false,
  eveningReflectionComplete = false,
  className,
}: QuickActionButtonsProps) {
  const { openModal } = useModalStore()

  const actions: QuickAction[] = [
    {
      id: 'morningCheckIn',
      label: morningCheckInComplete ? 'Done' : 'Check In',
      icon: morningCheckInComplete ? CheckCircle : Sun,
      color: morningCheckInComplete ? 'text-green-600' : 'text-orange-600',
      bgColor: morningCheckInComplete ? 'bg-green-100' : 'bg-orange-100',
      hoverColor: morningCheckInComplete ? 'hover:bg-green-200' : 'hover:bg-orange-200',
      modalName: 'morningCheckin',
      show: showMorningCheckIn,
      completed: morningCheckInComplete,
    },
    {
      id: 'eveningReflection',
      label: eveningReflectionComplete ? 'Done' : 'Reflect',
      icon: eveningReflectionComplete ? CheckCircle : Moon,
      color: eveningReflectionComplete ? 'text-green-600' : 'text-indigo-600',
      bgColor: eveningReflectionComplete ? 'bg-green-100' : 'bg-indigo-100',
      hoverColor: eveningReflectionComplete ? 'hover:bg-green-200' : 'hover:bg-indigo-200',
      modalName: 'eveningReflection',
      show: showEveningReflection,
      completed: eveningReflectionComplete,
    },
    {
      id: 'sos',
      label: 'SOS',
      icon: Phone,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      hoverColor: 'hover:bg-red-200',
      modalName: 'crisis',
      show: showSOS,
    },
    {
      id: 'habit',
      label: 'Habit',
      icon: Plus,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      hoverColor: 'hover:bg-green-200',
      modalName: 'habit',
      show: showHabit,
    },
    {
      id: 'win',
      label: 'Win',
      icon: Sparkles,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
      hoverColor: 'hover:bg-yellow-200',
      modalName: 'wins',
      show: showWin,
    },
    {
      id: 'intention',
      label: 'Intention',
      icon: Target,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      hoverColor: 'hover:bg-purple-200',
      modalName: 'intentions',
      show: showIntention,
    },
  ]

  const visibleActions = actions.filter(a => a.show)

  const handleClick = (action: QuickAction) => {
    openModal(action.modalName as Parameters<typeof openModal>[0])
  }

  if (variant === 'grid') {
    return (
      <div className={cn('grid grid-cols-3 gap-3', className)}>
        {visibleActions.map((action) => {
          const Icon = action.icon
          return (
            <button
              key={action.id}
              onClick={() => handleClick(action)}
              disabled={action.completed}
              className={cn(
                'flex flex-col items-center justify-center p-3 md:p-4 rounded-xl transition-all min-h-touch',
                action.bgColor,
                action.hoverColor,
                action.completed && 'opacity-70 cursor-default'
              )}
            >
              <Icon className={cn('h-6 w-6 mb-1', action.color)} />
              <span className={cn('text-xs font-medium', action.color)}>
                {action.label}
              </span>
            </button>
          )
        })}
      </div>
    )
  }

  if (variant === 'vertical') {
    return (
      <div className={cn('flex flex-col gap-2', className)}>
        {visibleActions.map((action) => {
          const Icon = action.icon
          return (
            <Button
              key={action.id}
              variant="outline"
              onClick={() => handleClick(action)}
              disabled={action.completed}
              className={cn(
                'justify-start gap-3 h-12',
                action.bgColor,
                action.hoverColor,
                'border-transparent',
                action.completed && 'opacity-70'
              )}
            >
              <Icon className={cn('h-5 w-5', action.color)} />
              <span className={cn('font-medium', action.color)}>
                {action.label}
              </span>
              {action.completed && (
                <CheckCircle className="h-4 w-4 text-green-500 ml-auto" />
              )}
            </Button>
          )
        })}
      </div>
    )
  }

  // Default: horizontal
  return (
    <div className={cn('flex items-center gap-2 flex-wrap', className)}>
      {visibleActions.map((action) => {
        const Icon = action.icon
        return (
          <Button
            key={action.id}
            variant="outline"
            size="sm"
            onClick={() => handleClick(action)}
            disabled={action.completed}
            className={cn(
              'gap-2',
              action.bgColor,
              action.hoverColor,
              'border-transparent',
              action.completed && 'opacity-70'
            )}
          >
            <Icon className={cn('h-4 w-4', action.color)} />
            <span className={cn('font-medium', action.color)}>
              {action.label}
            </span>
          </Button>
        )
      })}
    </div>
  )
}

export default QuickActionButtons
