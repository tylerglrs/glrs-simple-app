import { Task } from "../types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { ClipboardList, CheckCircle, Clock } from "lucide-react"
import { cn } from "@/lib/utils"

interface PriorityTasksProps {
  tasks: Task[]
  loading?: boolean
  onTaskClick?: (task: Task) => void
}

function TaskSkeleton() {
  return (
    <div className="rounded-lg border p-3">
      <Skeleton className="h-4 w-3/4 mb-2" />
      <div className="flex justify-between">
        <Skeleton className="h-3 w-1/4" />
        <Skeleton className="h-3 w-1/4" />
      </div>
    </div>
  )
}

function TaskItem({ task, onClick }: { task: Task; onClick?: () => void }) {
  const dueDate =
    task.dueDate instanceof Date ? task.dueDate : task.dueDate?.toDate?.() || new Date()

  return (
    <div
      onClick={onClick}
      className={cn(
        "cursor-pointer rounded-lg border p-3 transition-all hover:translate-x-1",
        task.isOverdue
          ? "border-red-200 bg-red-50 hover:bg-red-100"
          : "border-border bg-muted/50 hover:bg-muted"
      )}
    >
      <p className="text-sm font-medium text-foreground line-clamp-1">{task.title}</p>
      <div className="mt-1.5 flex items-center justify-between text-xs">
        <span className="text-muted-foreground">{task.pirName}</span>
        <span
          className={cn(
            "flex items-center gap-1",
            task.isOverdue ? "font-medium text-red-600" : "text-muted-foreground"
          )}
        >
          <Clock className={cn("h-3 w-3", task.isOverdue ? "text-red-600" : "text-muted-foreground")} />
          {task.isOverdue
            ? "Overdue"
            : dueDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
        </span>
      </div>
    </div>
  )
}

export function PriorityTasks({ tasks, loading, onTaskClick }: PriorityTasksProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <ClipboardList className="h-4 w-4 text-primary" />
          Priority Tasks
          {tasks.length > 0 && (
            <span className="ml-auto rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">
              {tasks.length}
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <TaskSkeleton key={i} />
            ))}
          </div>
        ) : tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <CheckCircle className="h-8 w-8 text-emerald-500" />
            <p className="mt-2 text-sm text-muted-foreground">All caught up!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {tasks.slice(0, 5).map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                onClick={() => onTaskClick?.(task)}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
