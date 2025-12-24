// =============================================================================
// HOOKS BARREL EXPORT
// =============================================================================

// Generic Firestore hooks
export { useFirestoreQuery, createCollectionHook } from './useFirestoreQuery'
export { useFirestoreDoc, createDocHook } from './useFirestoreDoc'

// Collection-specific hooks
export {
  // Check-ins & Reflections
  useCheckIns,
  useReflections,
  useQuickReflections,

  // Goals, Objectives & Assignments (Golden Thread)
  useGoals,
  useGoal,
  useObjectives,
  useUserObjectives,
  useAssignments,
  useAssignment,

  // Habits & Tracking
  useHabits,
  useHabit,
  useHabitCompletions,

  // Gratitude, Wins & Breakthroughs
  useGratitudes,
  useTodayWins,
  useBreakthroughs,

  // Meetings
  useMeetings,
  useExternalMeetings,
  useSavedMeetings,

  // Community & Messaging
  useCommunityMessages,
  useTopicRooms,
  useSupportGroups,
  useSupportGroup,

  // Direct Messaging
  useConversations,
  useMessages,

  // Finances (JAR/Savings)
  useSavingsGoals,
  useSavingsGoal,
  useSavingsItems,
  useMoneyMapStops,
  useCountdownGoals,

  // Resources
  useResources,
  useResource,

  // Notifications & Broadcasts
  useNotifications,
  useBroadcasts,
  useDailyQuotes,

  // Emergency & Safety
  useEmergencyContacts,
  useEmergencyContact,

  // Streaks & Gamification
  useStreaks,
  useStreak,
} from './useCollections'

// AI Insights Hub hooks (Phase 7)
export { useAIChat, AI_PROMPT_CARDS } from './useAIChat'
export { useAnchor } from './useAnchor'
export { useAIContext } from './useAIContext'

// AI Summary hooks (Phase 2 - AI Restructure)
export { useWeeklySummaries } from './useWeeklySummaries'
export { useMonthlySummaries } from './useMonthlySummaries'
export {
  useAIInsightsFromFirestore,
  useHighPriorityInsights,
} from './useAIInsightsData'
export {
  useUserMemory,
  useMemoryByCategory,
  useMemoryValue,
} from './useUserMemory'

// Tab navigation & preloading
export {
  useTabPreload,
  preloadTabs,
  isTabPreloaded,
  getPreloadedTabs,
} from './useTabPreload'

// Data prefetching
export { useAppDataPrefetch } from './useAppDataPrefetch'

// Beacon AI Content hooks (Phase 6.4)
export {
  useDailyInsight,
  useDailyOracle,
  useProactiveInsight,
  useTechniqueSelection,
  usePatternAnalysis,
  useCorrelationAnalysis,
  useReflectionThemes,
  useHabitCoach,
  useGoalCoach,
} from './useBeaconContent'

// Project Lighthouse: AI Pattern Insights (GPT-generated)
export {
  useAIPatternInsights,
  useMetricInsights,
} from './useAIPatternInsights'
export type {
  AIPatternInsight,
  AIPatternInsightsData,
  MetricType as AIMetricType,
  ActionType as AIActionType,
} from './useAIPatternInsights'

// Re-export types
export type {
  DailyInsightData,
  DailyOracleData,
  ProactiveInsightData,
  TechniqueSelectionData,
  PatternAnalysisData,
  CorrelationAnalysisData,
  ReflectionThemesData,
  HabitCoachData,
  GoalCoachData,
} from './useBeaconContent'

// Time of day hooks (unified)
export {
  useTimeOfDay,
  useTimeOfDayConfig,
  useTimeGradient,
  useTimeGradientClass,
  getCurrentTimeOfDay,
  getGreeting,
  getTimeConfig,
  TIME_CONFIG,
  type TimeOfDay,
  type TimeOfDayConfig,
} from './useTimeOfDay'

// Security & Authentication hooks (Phase 2)
export { use2FA, clearTrustToken } from './use2FA'
export type { TwoFAStatus, TrustedDevice, Use2FAReturn } from './use2FA'
export { useSession } from './useSession'
export type { SessionInfo, UseSessionReturn } from './useSession'

// Timezone utilities
export { useTimezone } from './useTimezone'

// Push Notifications (FCM)
export { usePushNotifications, type NotificationPreferences } from './useNotifications'

// Capacitor/Native Platform hooks
export { useCapacitor } from './useCapacitor'

// Status Bar Color hook (for modal header matching)
export {
  useStatusBarColor,
  getDefaultStatusBarColor,
  setStatusBar,
  resetStatusBar,
} from './useStatusBarColor'
