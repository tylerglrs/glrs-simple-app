import { Clock, CheckCircle, AlertTriangle, Trash2, Edit } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import type { CountdownGoal } from '../types'
import { getDaysRemaining, getCountdownStatus } from '../hooks/useCountdownGoals'

// =============================================================================
// TYPES
// =============================================================================

export interface CountdownCardProps {
  goal: CountdownGoal
  onEdit?: (goal: CountdownGoal) => void
  onDelete?: (goalId: string) => void
  onComplete?: (goalId: string) => void
  variant?: 'compact' | 'full'
  className?: string
}

// =============================================================================
// HELPERS
// =============================================================================

const getStatusColors = (status: ReturnType<typeof getCountdownStatus>) => {
  switch (status) {
    case 'overdue':
      return {
        bg: 'bg-red-50',
        border: 'border-red-200',
        text: 'text-red-600',
        progress: 'bg-red-500',
      }
    case 'soon':
      return {
        bg: 'bg-orange-50',
        border: 'border-orange-200',
        text: 'text-orange-600',
        progress: 'bg-orange-500',
      }
    case 'upcoming':
      return {
        bg: 'bg-yellow-50',
        border: 'border-yellow-200',
        text: 'text-yellow-600',
        progress: 'bg-yellow-500',
      }
    default:
      return {
        bg: 'bg-teal-50',
        border: 'border-teal-200',
        text: 'text-teal-600',
        progress: 'bg-teal-500',
      }
  }
}

// =============================================================================
// COMPONENT
// =============================================================================

export function CountdownCard({
  goal,
  onEdit,
  onDelete,
  onComplete,
  variant = 'full',
  className,
}: CountdownCardProps) {
  const targetDate = goal.targetDate?.toDate?.() || new Date()
  const daysRemaining = getDaysRemaining(goal.targetDate)
  const status = getCountdownStatus(daysRemaining)
  const colors = getStatusColors(status)

  // Calculate progress (0-100)
  const createdDate = goal.createdAt?.toDate?.() || new Date()
  const totalDays = Math.ceil((targetDate.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24))
  const daysElapsed = totalDays - daysRemaining
  const progress = Math.min(100, Math.max(0, (daysElapsed / totalDays) * 100))

  if (variant === 'compact') {
    return (
      <div
        className={cn(
          'flex items-center justify-between rounded-lg border p-3',
          colors.bg,
          colors.border,
          className
        )}
      >
        <div className="flex items-center gap-3">
          <div className={cn('flex h-8 w-8 items-center justify-center rounded-full', colors.bg)}>
            <Clock className={cn('h-4 w-4', colors.text)} />
          </div>
          <div>
            <p className="font-medium text-foreground">{goal.title}</p>
            <p className={cn('text-xs', colors.text)}>
              {daysRemaining < 0
                ? `${Math.abs(daysRemaining)} days overdue`
                : daysRemaining === 0
                ? 'Today!'
                : `${daysRemaining} days left`}
            </p>
          </div>
        </div>

        {onComplete && daysRemaining <= 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onComplete(goal.id)}
            className={cn('h-8 w-8 p-0', colors.text)}
          >
            <CheckCircle className="h-5 w-5" />
          </Button>
        )}
      </div>
    )
  }

  // Full variant
  return (
    <div
      className={cn(
        'rounded-xl border-2 p-4 shadow-sm transition-all',
        colors.bg,
        colors.border,
        className
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              'flex h-10 w-10 items-center justify-center rounded-full',
              status === 'overdue' ? 'bg-red-100' : 'bg-teal-100'
            )}
          >
            {status === 'overdue' ? (
              <AlertTriangle className="h-5 w-5 text-red-500" />
            ) : (
              <Clock className="h-5 w-5 text-teal-500" />
            )}
          </div>
          <div>
            <h4 className="font-semibold text-foreground">{goal.title}</h4>
            {goal.category && (
              <span className="text-xs text-muted-foreground capitalize">{goal.category}</span>
            )}
          </div>
        </div>

        {/* Actions */}
        {(onEdit || onDelete) && (
          <div className="flex items-center gap-1">
            {onEdit && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(goal)}
                className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
              >
                <Edit className="h-4 w-4" />
              </Button>
            )}
            {onDelete && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(goal.id)}
                className="h-8 w-8 p-0 text-muted-foreground hover:text-red-500"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Description */}
      {goal.description && (
        <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{goal.description}</p>
      )}

      {/* Countdown Display */}
      <div className="mt-4 text-center">
        <p className={cn('text-4xl font-bold', colors.text)}>
          {daysRemaining < 0 ? Math.abs(daysRemaining) : daysRemaining}
        </p>
        <p className="text-sm text-muted-foreground">
          {daysRemaining < 0
            ? 'days overdue'
            : daysRemaining === 0
            ? "It's Today!"
            : daysRemaining === 1
            ? 'day to go'
            : 'days to go'}
        </p>
      </div>

      {/* Progress Bar */}
      <div className="mt-4">
        <Progress value={progress} className="h-2" />
        <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
          <span>Started</span>
          <span>
            {targetDate.toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </span>
        </div>
      </div>

      {/* Amount (if financial) */}
      {goal.amount && (
        <div className="mt-3 rounded-lg bg-white/50 p-2 text-center">
          <p className="text-lg font-bold text-teal-600">
            ${goal.amount.toLocaleString()}
          </p>
          <p className="text-xs text-muted-foreground">Goal Amount</p>
        </div>
      )}

      {/* Complete Button */}
      {onComplete && daysRemaining <= 0 && (
        <Button
          onClick={() => onComplete(goal.id)}
          className="mt-4 w-full"
          variant="default"
        >
          <CheckCircle className="mr-2 h-4 w-4" />
          Mark Complete
        </Button>
      )}
    </div>
  )
}

export default CountdownCard
