import { useState } from 'react'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import {
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle,
  ChevronRight,
  Flag,
  MessageSquare,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Timestamp } from 'firebase/firestore'

// =============================================================================
// TYPES
// =============================================================================

export interface Task {
  id: string
  title: string
  description?: string
  status: 'pending' | 'in_progress' | 'completed'
  priority?: 'low' | 'medium' | 'high'
  dueDate?: Timestamp | Date | null
  goalId?: string
  objectiveId?: string
  coachNotes?: string
}

export interface TaskCardProps {
  task: Task
  onComplete?: (taskId: string) => void
  onView?: (task: Task) => void
  compact?: boolean
  showCoachNotes?: boolean
}

// =============================================================================
// HELPERS
// =============================================================================

const formatDueDate = (date: Timestamp | Date | null | undefined): string => {
  if (!date) return ''
  const d = date instanceof Timestamp ? date.toDate() : new Date(date)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  const dateOnly = new Date(d)
  dateOnly.setHours(0, 0, 0, 0)

  if (dateOnly.getTime() === today.getTime()) return 'Today'
  if (dateOnly.getTime() === tomorrow.getTime()) return 'Tomorrow'

  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

const getDueDateStatus = (date: Timestamp | Date | null | undefined, isCompleted: boolean) => {
  if (!date || isCompleted) return { status: 'none', isOverdue: false, isToday: false }

  const d = date instanceof Timestamp ? date.toDate() : new Date(date)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const dateOnly = new Date(d)
  dateOnly.setHours(0, 0, 0, 0)

  const isOverdue = dateOnly < today
  const isToday = dateOnly.getTime() === today.getTime()

  return {
    status: isOverdue ? 'overdue' : isToday ? 'today' : 'upcoming',
    isOverdue,
    isToday,
  }
}

const priorityConfig = {
  high: { color: 'text-red-500', bg: 'bg-red-50', border: 'border-red-200', label: 'High' },
  medium: { color: 'text-orange-500', bg: 'bg-orange-50', border: 'border-orange-200', label: 'Medium' },
  low: { color: 'text-blue-500', bg: 'bg-blue-50', border: 'border-blue-200', label: 'Low' },
}

// =============================================================================
// COMPONENT
// =============================================================================

export function TaskCard({
  task,
  onComplete,
  onView,
  compact = false,
  showCoachNotes = false,
}: TaskCardProps) {
  const [completing, setCompleting] = useState(false)

  const isCompleted = task.status === 'completed'
  const dueDateInfo = getDueDateStatus(task.dueDate, isCompleted)
  const priority = task.priority ? priorityConfig[task.priority] : null

  const handleComplete = async () => {
    if (isCompleted || completing || !onComplete) return
    setCompleting(true)
    await onComplete(task.id)
    setCompleting(false)
  }

  if (compact) {
    return (
      <div
        className={cn(
          'flex items-center gap-3 p-3 rounded-lg border transition-colors',
          isCompleted && 'bg-green-50 border-green-200',
          dueDateInfo.isOverdue && !isCompleted && 'bg-red-50 border-red-200',
          dueDateInfo.isToday && !isCompleted && 'bg-orange-50 border-orange-200',
          !isCompleted && !dueDateInfo.isOverdue && !dueDateInfo.isToday && 'bg-white hover:bg-gray-50'
        )}
        onClick={() => onView?.(task)}
      >
        <Checkbox
          checked={isCompleted}
          disabled={isCompleted || completing}
          onCheckedChange={handleComplete}
          onClick={(e) => e.stopPropagation()}
          className={cn(
            isCompleted && 'data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500'
          )}
        />
        <span className={cn(
          'flex-1 text-sm font-medium truncate',
          isCompleted && 'line-through text-muted-foreground'
        )}>
          {task.title}
        </span>
        {task.dueDate && (
          <span className={cn(
            'text-xs',
            isCompleted && 'text-green-600',
            dueDateInfo.isOverdue && !isCompleted && 'text-red-500',
            dueDateInfo.isToday && !isCompleted && 'text-orange-600',
          )}>
            {formatDueDate(task.dueDate)}
          </span>
        )}
      </div>
    )
  }

  return (
    <div
      className={cn(
        'rounded-xl border shadow-sm overflow-hidden transition-all',
        isCompleted && 'bg-green-50 border-green-200',
        dueDateInfo.isOverdue && !isCompleted && 'bg-red-50 border-red-200',
        dueDateInfo.isToday && !isCompleted && 'bg-orange-50 border-orange-200',
        !isCompleted && !dueDateInfo.isOverdue && !dueDateInfo.isToday && 'bg-white hover:shadow-md'
      )}
    >
      <div className="p-3 md:p-4">
        <div className="flex items-start gap-3">
          <Checkbox
            checked={isCompleted}
            disabled={isCompleted || completing}
            onCheckedChange={handleComplete}
            className={cn(
              'mt-1',
              isCompleted && 'data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500'
            )}
          />

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h3 className={cn(
                'font-semibold text-foreground',
                isCompleted && 'line-through text-muted-foreground'
              )}>
                {task.title}
              </h3>
              {priority && (
                <div className={cn(
                  'flex items-center gap-1 px-2 py-0.5 rounded-full text-xs',
                  priority.bg, priority.color
                )}>
                  <Flag className="h-3 w-3" />
                  {priority.label}
                </div>
              )}
            </div>

            {task.description && (
              <p className={cn(
                'text-sm text-muted-foreground mt-1 line-clamp-2',
                isCompleted && 'line-through'
              )}>
                {task.description}
              </p>
            )}

            <div className="flex items-center gap-3 mt-3 flex-wrap">
              {task.dueDate && (
                <div className={cn(
                  'flex items-center gap-1 text-xs',
                  isCompleted && 'text-green-600',
                  dueDateInfo.isOverdue && !isCompleted && 'text-red-500',
                  dueDateInfo.isToday && !isCompleted && 'text-orange-600',
                  !isCompleted && !dueDateInfo.isOverdue && !dueDateInfo.isToday && 'text-muted-foreground'
                )}>
                  {dueDateInfo.isOverdue && !isCompleted ? (
                    <AlertTriangle className="h-3 w-3" />
                  ) : isCompleted ? (
                    <CheckCircle className="h-3 w-3" />
                  ) : dueDateInfo.isToday ? (
                    <Clock className="h-3 w-3" />
                  ) : (
                    <Calendar className="h-3 w-3" />
                  )}
                  <span>
                    {isCompleted ? 'Completed' : formatDueDate(task.dueDate)}
                    {dueDateInfo.isOverdue && !isCompleted && ' (Overdue)'}
                  </span>
                </div>
              )}

              {task.goalId && (
                <span className="text-xs bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full">
                  Goal linked
                </span>
              )}
            </div>
          </div>

          {onView && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 flex-shrink-0"
              onClick={() => onView(task)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}
        </div>

        {showCoachNotes && task.coachNotes && (
          <div className="mt-3 pt-3 border-t">
            <div className="flex items-start gap-2 bg-blue-50 rounded-lg p-3">
              <MessageSquare className="h-4 w-4 text-blue-500 flex-shrink-0 mt-0.5" />
              <div>
                <span className="text-xs font-medium text-blue-700">Coach Notes</span>
                <p className="text-sm text-blue-800 mt-0.5">{task.coachNotes}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default TaskCard
