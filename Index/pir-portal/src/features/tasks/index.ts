// =============================================================================
// TASKS FEATURE - BARREL EXPORTS
// =============================================================================

// Default export for lazy loading
export { default } from './components/TasksTab'

// Components - Main Views
export { TasksTab, type TasksTabProps, type TasksView } from './components/TasksTab'
export { CheckInView, type CheckInViewProps } from './components/CheckInView'
export { ReflectionView, type ReflectionViewProps } from './components/ReflectionView'
export { DailyOverview, type DailyOverviewProps } from './components/DailyOverview'
export { TasksSidebar, InlineSidebar, type TasksSidebarProps } from './components/TasksSidebar'
export {
  MoodSliders,
  SinglePicker,
  type MoodSlidersProps,
  type SinglePickerProps,
  type SliderConfig,
} from './components/MoodSliders'

// Components - Golden Thread (Goals/Objectives/Assignments)
export { GoldenThreadView, type GoldenThreadViewProps } from './components/GoldenThreadView'
export { GoalCard, type GoalCardProps } from './components/GoalCard'
export { ObjectiveCard, type ObjectiveCardProps } from './components/ObjectiveCard'
export { AssignmentItem, type AssignmentItemProps } from './components/AssignmentItem'
export {
  ItemDetailModal,
  type ItemDetailModalProps,
  type ItemType,
} from './components/ItemDetailModal'

// Hooks - Check-In Data
export {
  useCheckInData,
  type MorningCheckInData,
  type EveningReflectionData,
  type CheckInDocument,
  type CheckInStatus,
  type WeeklyStats,
  type ReflectionStats,
  type GratitudeTheme,
  type StreakData,
  type StreakPeriod,
  type YesterdayGoal,
} from './hooks/useCheckInData'

// Hooks - Goals Data
export {
  useGoalsData,
  formatDate,
  getDueDateStatus,
  calculateGoalProgress,
  makeLinksClickable,
  type Goal,
  type Objective,
  type Assignment,
  type GoalWithChildren,
  type ObjectiveWithAssignments,
  type GoalStats,
  type DueDateStatus,
} from './hooks/useGoalsData'

// Note: useGoalsData.tsx contains JSX for makeLinksClickable helper
