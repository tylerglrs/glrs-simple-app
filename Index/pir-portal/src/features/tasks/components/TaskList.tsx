import { TaskCard, type Task } from './TaskCard'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  CheckCircle,
  AlertTriangle,
  Calendar,
  Loader2,
  ListTodo,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Timestamp } from 'firebase/firestore'

// =============================================================================
// TYPES
// =============================================================================

export interface TaskListProps {
  tasks: Task[]
  loading?: boolean
  onCompleteTask?: (taskId: string) => void
  onViewTask?: (task: Task) => void
  groupBy?: 'none' | 'status' | 'dueDate'
  showCoachNotes?: boolean
  emptyMessage?: string
  emptyIcon?: React.ComponentType<{ className?: string }>
  maxHeight?: string
  compact?: boolean
}

interface TaskGroup {
  title: string
  icon: React.ComponentType<{ className?: string }>
  iconColor: string
  tasks: Task[]
}

// =============================================================================
// HELPERS
// =============================================================================

const groupByStatus = (tasks: Task[]): TaskGroup[] => {
  const pending = tasks.filter(t => t.status === 'pending' || t.status === 'in_progress')
  const completed = tasks.filter(t => t.status === 'completed')

  const groups: TaskGroup[] = []

  if (pending.length > 0) {
    groups.push({
      title: 'To Do',
      icon: ListTodo,
      iconColor: 'text-orange-500',
      tasks: pending,
    })
  }

  if (completed.length > 0) {
    groups.push({
      title: 'Completed',
      icon: CheckCircle,
      iconColor: 'text-green-500',
      tasks: completed,
    })
  }

  return groups
}

const groupByDueDate = (tasks: Task[]): TaskGroup[] => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  const nextWeek = new Date(today)
  nextWeek.setDate(nextWeek.getDate() + 7)

  const overdue: Task[] = []
  const todayTasks: Task[] = []
  const tomorrowTasks: Task[] = []
  const thisWeek: Task[] = []
  const later: Task[] = []
  const noDueDate: Task[] = []
  const completed: Task[] = []

  tasks.forEach(task => {
    if (task.status === 'completed') {
      completed.push(task)
      return
    }

    if (!task.dueDate) {
      noDueDate.push(task)
      return
    }

    const dueDate = task.dueDate instanceof Timestamp
      ? task.dueDate.toDate()
      : new Date(task.dueDate)
    dueDate.setHours(0, 0, 0, 0)

    if (dueDate < today) {
      overdue.push(task)
    } else if (dueDate.getTime() === today.getTime()) {
      todayTasks.push(task)
    } else if (dueDate.getTime() === tomorrow.getTime()) {
      tomorrowTasks.push(task)
    } else if (dueDate < nextWeek) {
      thisWeek.push(task)
    } else {
      later.push(task)
    }
  })

  const groups: TaskGroup[] = []

  if (overdue.length > 0) {
    groups.push({
      title: 'Overdue',
      icon: AlertTriangle,
      iconColor: 'text-red-500',
      tasks: overdue,
    })
  }

  if (todayTasks.length > 0) {
    groups.push({
      title: 'Today',
      icon: Calendar,
      iconColor: 'text-orange-500',
      tasks: todayTasks,
    })
  }

  if (tomorrowTasks.length > 0) {
    groups.push({
      title: 'Tomorrow',
      icon: Calendar,
      iconColor: 'text-blue-500',
      tasks: tomorrowTasks,
    })
  }

  if (thisWeek.length > 0) {
    groups.push({
      title: 'This Week',
      icon: Calendar,
      iconColor: 'text-purple-500',
      tasks: thisWeek,
    })
  }

  if (later.length > 0) {
    groups.push({
      title: 'Later',
      icon: Calendar,
      iconColor: 'text-gray-500',
      tasks: later,
    })
  }

  if (noDueDate.length > 0) {
    groups.push({
      title: 'No Due Date',
      icon: ListTodo,
      iconColor: 'text-gray-400',
      tasks: noDueDate,
    })
  }

  if (completed.length > 0) {
    groups.push({
      title: 'Completed',
      icon: CheckCircle,
      iconColor: 'text-green-500',
      tasks: completed,
    })
  }

  return groups
}

// =============================================================================
// COMPONENT
// =============================================================================

export function TaskList({
  tasks,
  loading = false,
  onCompleteTask,
  onViewTask,
  groupBy = 'none',
  showCoachNotes = false,
  emptyMessage = 'No tasks',
  emptyIcon: EmptyIcon = ListTodo,
  maxHeight = '60vh',
  compact = false,
}: TaskListProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-teal-500" />
      </div>
    )
  }

  if (tasks.length === 0) {
    return (
      <div className="text-center py-10">
        <EmptyIcon className="h-12 w-12 mx-auto text-gray-300 mb-3" />
        <h3 className="font-semibold text-foreground mb-1">All Caught Up!</h3>
        <p className="text-sm text-muted-foreground">{emptyMessage}</p>
      </div>
    )
  }

  const groups: TaskGroup[] =
    groupBy === 'status'
      ? groupByStatus(tasks)
      : groupBy === 'dueDate'
      ? groupByDueDate(tasks)
      : [{ title: '', icon: ListTodo, iconColor: '', tasks }]

  return (
    <ScrollArea className={cn('pr-2')} style={{ maxHeight }}>
      <div className="space-y-6">
        {groups.map((group, index) => (
          <div key={group.title || index}>
            {group.title && (
              <div className="flex items-center gap-2 mb-3 sticky top-0 bg-background py-1">
                <group.icon className={cn('h-4 w-4', group.iconColor)} />
                <h3 className="font-semibold text-sm text-foreground">
                  {group.title}
                </h3>
                <span className="text-xs text-muted-foreground">
                  ({group.tasks.length})
                </span>
              </div>
            )}
            <div className={cn('space-y-3', compact && 'space-y-2')}>
              {group.tasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onComplete={onCompleteTask}
                  onView={onViewTask}
                  compact={compact}
                  showCoachNotes={showCoachNotes}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  )
}

export default TaskList
