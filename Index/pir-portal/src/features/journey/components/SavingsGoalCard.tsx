import { Target, Edit2, Trash2, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import { formatCurrency, calculateProgress } from '../hooks/useSavingsData'
import type { SavingsGoal } from '../types'

// =============================================================================
// TYPES
// =============================================================================

export interface SavingsGoalCardProps {
  goal: SavingsGoal
  onEdit?: () => void
  onDelete?: () => void
  onAddFunds?: () => void
  className?: string
}

// =============================================================================
// COMPONENT
// =============================================================================

export function SavingsGoalCard({
  goal,
  onEdit,
  onDelete,
  onAddFunds,
  className,
}: SavingsGoalCardProps) {
  const progress = calculateProgress(goal.currentAmount, goal.targetAmount)
  const isComplete = progress >= 100
  const remaining = Math.max(0, goal.targetAmount - goal.currentAmount)

  // Calculate deadline status
  const deadlineStatus = (() => {
    if (!goal.deadline) return null
    const deadline = goal.deadline.toDate?.() || new Date(goal.deadline as unknown as string)
    const now = new Date()
    const daysRemaining = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

    if (daysRemaining < 0) return { text: 'Overdue', color: 'text-red-500' }
    if (daysRemaining === 0) return { text: 'Due today', color: 'text-amber-500' }
    if (daysRemaining <= 7) return { text: `${daysRemaining}d left`, color: 'text-amber-500' }
    return { text: `${daysRemaining}d left`, color: 'text-muted-foreground' }
  })()

  return (
    <div
      className={cn(
        'rounded-xl border-2 bg-white p-4 transition-all',
        isComplete
          ? 'border-green-500/50 bg-gradient-to-br from-green-50 to-green-100'
          : 'border-border hover:border-primary/30',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-full text-xl"
            style={{ backgroundColor: goal.color ? `${goal.color}20` : '#05858520' }}
          >
            {goal.icon || <Target className="h-5 w-5" style={{ color: goal.color || '#058585' }} />}
          </div>
          <div>
            <h4 className="font-semibold text-foreground">{goal.title}</h4>
            {goal.description && (
              <p className="text-xs text-muted-foreground line-clamp-1">
                {goal.description}
              </p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          {onEdit && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={onEdit}
            >
              <Edit2 className="h-4 w-4 text-muted-foreground" />
            </Button>
          )}
          {onDelete && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={onDelete}
            >
              <Trash2 className="h-4 w-4 text-muted-foreground" />
            </Button>
          )}
        </div>
      </div>

      {/* Progress */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-medium" style={{ color: goal.color || '#058585' }}>
            {formatCurrency(goal.currentAmount)}
          </span>
          <span className="text-sm text-muted-foreground">
            {formatCurrency(goal.targetAmount)}
          </span>
        </div>
        <Progress value={progress} className="h-2" />
        <div className="flex items-center justify-between mt-1">
          <span className="text-xs text-muted-foreground">
            {progress}% complete
          </span>
          {deadlineStatus && (
            <span className={cn('text-xs font-medium', deadlineStatus.color)}>
              {deadlineStatus.text}
            </span>
          )}
        </div>
      </div>

      {/* Status / Action */}
      {isComplete ? (
        <div className="rounded-lg bg-green-500 p-2 text-center">
          <span className="text-sm font-semibold text-white">
            Goal Achieved! 🎉
          </span>
        </div>
      ) : (
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            {formatCurrency(remaining)} to go
          </span>
          {onAddFunds && (
            <Button
              size="sm"
              onClick={onAddFunds}
              className="gap-1"
              style={{ backgroundColor: goal.color || '#058585' }}
            >
              <Plus className="h-4 w-4" />
              Add Funds
            </Button>
          )}
        </div>
      )}
    </div>
  )
}

export default SavingsGoalCard
