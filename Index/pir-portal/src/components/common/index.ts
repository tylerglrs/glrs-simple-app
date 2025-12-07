// Common shared components
export { LoadingSpinner } from './LoadingSpinner'
export { EmptyState } from './EmptyState'
export { ErrorBoundary } from './ErrorBoundary'
export { MoodSlider } from './MoodSlider'
export { StatCard } from './StatCard'
export { SectionHeader } from './SectionHeader'
export { ActionCard } from './ActionCard'

// Design system components (Phase 2)
export {
  GradientCard,
  TealGradientCard,
  WarmGradientCard,
  RoseGradientCard,
  CalmGradientCard,
} from './GradientCard'

export {
  ToolkitCard,
  ToolkitGrid,
  toolkitThemes,
  type ToolkitTheme,
} from './ToolkitCard'

export {
  AnimatedCounter,
  DaysCounter,
  MoneyCounter,
  StreakCounter,
  PercentageCounter,
} from './AnimatedCounter'

export {
  CircularProgress,
  SobrietyProgress,
  MetricProgress,
  CompletionProgress,
  MiniProgress,
} from './CircularProgress'

export {
  PageTransition,
  PageContainer,
  FadeTransition,
  ScaleTransition,
  SlideUpTransition,
  AnimateInView,
} from './PageTransition'

export {
  StaggeredList,
  StaggeredItem,
  StaggeredRenderList,
  StaggeredGrid,
} from './StaggeredList'

export {
  CelebrationOverlay,
  useCelebration,
} from './CelebrationOverlay'

export {
  CompletionCelebration,
  type CompletionType,
  type CompletionCelebrationProps,
} from './CompletionCelebration'

export {
  SkeletonCard,
  SkeletonStatCard,
  SkeletonToolkitCard,
  SkeletonListItem,
  SkeletonHeroCard,
  SkeletonCircularProgress,
  SkeletonToolkitGrid,
  SkeletonSection,
} from './SkeletonCard'

export {
  TimeOfDayBackground,
  useTimeOfDay,
  getGreeting,
  getCurrentTimeOfDay,
  greetings,
  timeOfDayIcons,
} from './TimeOfDayBackground'

export {
  LottieAnimation,
  ConfettiAnimation,
  SuccessAnimation,
  FireAnimation,
  LoadingAnimation,
  HeartAnimation,
  type AnimationType,
} from './LottieAnimation'

export {
  Illustration,
  MeditationIllustration,
  AchievementIllustration,
  CelebrationIllustration,
  CommunityIllustration,
  JourneyIllustration,
  MorningIllustration,
  EveningIllustration,
  EmptyStateIllustration,
  GoalsIllustration,
  GratitudeIllustration,
  JournalIllustration,
  EducationIllustration,
  CopingIllustration,
  LifeSkillsIllustration,
  RelapsePreventionIllustration,
  SupportIllustration,
  type IllustrationType,
} from './Illustration'

// Tab skeleton screens (Phase 4)
export {
  TabSkeleton,
  TasksTabSkeleton,
  JourneyTabSkeleton,
  MeetingsTabSkeleton,
  CommunityTabSkeleton,
  ResourcesTabSkeleton,
  MessagesTabSkeleton,
  ProfileTabSkeleton,
} from './TabSkeletons'
