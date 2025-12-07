import { ErrorBoundary } from '@/components/common'
import { TasksTab as TasksTabComponent } from './components/TasksTab'

// Wrap TasksTab with ErrorBoundary for graceful error handling
export function TasksTab() {
  return (
    <ErrorBoundary>
      <TasksTabComponent />
    </ErrorBoundary>
  )
}

export default TasksTab
