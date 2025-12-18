// Common shared components
export { LoadingSpinner } from './LoadingSpinner'
export { TabHeader } from './TabHeader'
export { EmptyState } from './EmptyState'
export { ErrorBoundary } from './ErrorBoundary'
export { MoodSlider } from './MoodSlider'
export { StatCard } from './StatCard'
export { SectionHeader } from './SectionHeader'
export { ActionCard } from './ActionCard'

// Pull-to-refresh component
export {
  PullToRefresh,
  usePullToRefresh,
  type PullToRefreshProps,
  type UsePullToRefreshOptions,
} from './PullToRefresh'

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
  useTimeOfDay as useTimeOfDayLegacy,
  getGreeting as getGreetingLegacy,
  getCurrentTimeOfDay as getCurrentTimeOfDayLegacy,
  greetings,
  timeOfDayIcons,
} from './TimeOfDayBackground'

// Scroll-fade time-based backgrounds (unified system)
export {
  ScrollFadeBackground,
  StaticTimeBackground,
  HeroBackground,
  type BackgroundMode,
} from './ScrollFadeBackground'

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
  // Legacy illustrations
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
  // New illustrations
  LighthouseIllustration,
  PathToSuccessIllustration,
  MountainClimbIllustration,
  RecoveryJourneyIllustration,
  StreakFireIllustration,
  GoalReachedIllustration,
  WelcomeIllustration,
  NoDataIllustration,
  NoMessagesIllustration,
  NoTasksIllustration,
  // Types
  type IllustrationType,
  type JourneyIllustrationName,
  type WellnessIllustrationName,
  type AchievementIllustrationName,
  type EmptyStateIllustrationName,
  type OnboardingIllustrationName,
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

// Coach Marks / Feature Discovery (Phase 2B)
export {
  CoachMark,
  CoachMarkTrigger,
} from './CoachMark'

export {
  CoachMarkProvider,
  useCoachMarkContext,
  useCoachMarkTarget,
} from './CoachMarkProvider'

export {
  useCoachMarks,
  COACH_MARKS,
  type CoachMarkConfig,
  type UseCoachMarksReturn,
} from './useCoachMarks'

// Modal Skeletons (Phase 3A)
export {
  WeeklyReportSkeleton,
  CalendarHeatmapSkeleton,
  MoodInsightsSkeleton,
  RecoveryProgramSkeleton,
  GratitudeJournalSkeleton,
  CheckInsListSkeleton,
  ResourceViewerSkeleton,
  GenericModalSkeleton,
} from './ModalSkeletons'
