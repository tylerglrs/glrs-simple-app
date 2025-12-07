// =============================================================================
// JOURNEY FEATURE - BARREL EXPORTS
// =============================================================================

// Main Tab Component
export { JourneyTab } from './components/JourneyTab'
export { default } from './components/JourneyTab'

// Sub-Tab Components
export { JourneyLifeTab } from './components/JourneyLifeTab'
export { JourneyWellnessTab } from './components/JourneyWellnessTab'
export { JourneyFinancesTab } from './components/JourneyFinancesTab'

// Display Components
export { StreakDisplay } from './components/StreakDisplay'
export { CountdownCard } from './components/CountdownCard'

// Chart Components
export { ChartSparkline } from './components/ChartSparkline'
export { AccordionChart } from './components/AccordionChart'
export { FullLineChart } from './components/FullLineChart'
export { ChartAccordionGroup } from './components/ChartAccordionGroup'

// Calendar Components (Part 11C)
export { CalendarHeatmap } from './components/CalendarHeatmap'
export { CalendarHeatmapPreview } from './components/CalendarHeatmapPreview'

// Finance Components (Part 11C)
export { SavingsJar } from './components/SavingsJar'
export { SavingsGoalCard } from './components/SavingsGoalCard'
export { MoneyMap } from './components/MoneyMap'
export { MoneyMapStop as MoneyMapStopComponent } from './components/MoneyMapStop'

// =============================================================================
// MODALS (Part 11D)
// =============================================================================

// Life Modals
export { GratitudeThemesModal } from './components/modals/GratitudeThemesModal'
export { GratitudeJournalModal } from './components/modals/GratitudeJournalModal'
export { ChallengesModal } from './components/modals/ChallengesModal'
export { BreakthroughModal } from './components/modals/BreakthroughModal'
export { StreakModal } from './components/modals/StreakModal'
export { ReflectionStreakModal } from './components/modals/ReflectionStreakModal'
export { StreaksModal } from './components/modals/StreaksModal'
export { ReflectionStreaksModal } from './components/modals/ReflectionStreaksModal'
export { AddCountdownModal } from './components/modals/AddCountdownModal'

// Wellness Modals
export { CalendarHeatmapModal } from './components/modals/CalendarHeatmapModal'
export { JourneyCalendarModal } from './components/modals/JourneyCalendarModal'
export { WeeklyReportModal } from './components/modals/WeeklyReportModal'
export { MoodInsightsModal } from './components/modals/MoodInsightsModal'
export { OverallDayInsightsModal } from './components/modals/OverallDayInsightsModal'
export { GraphSettingsModal } from './components/modals/GraphSettingsModal'

// Finance Modals
export { AddSavingsGoalModal } from './components/modals/AddSavingsGoalModal'
export { EditSavingsGoalModal } from './components/modals/EditSavingsGoalModal'
export { JarTransactionModal } from './components/modals/JarTransactionModal'
export { SavingsHistoryModal } from './components/modals/SavingsHistoryModal'
export { FinanceCountdownModal } from './components/modals/FinanceCountdownModal'

// =============================================================================
// HOOKS
// =============================================================================

// Core Data Hooks
export { useJourneyData, calculateSobrietyDays, getRecoveryMilestones } from './hooks/useJourneyData'
export { useStreaks } from './hooks/useStreaks'
export { useCountdownGoals, getDaysRemaining, getCountdownStatus } from './hooks/useCountdownGoals'

// Chart Hooks
export { useChartData, CHART_CONFIGS } from './hooks/useChartData'
export { useChartSettings } from './hooks/useChartSettings'

// Finance Hooks (Part 11C)
export { useSavingsData } from './hooks/useSavingsData'
export { useSavingsGoals } from './hooks/useSavingsGoals'
export { useMoneyMapStops, DEFAULT_MONEY_MAP_STOPS } from './hooks/useMoneyMapStops'

// =============================================================================
// TYPES
// =============================================================================

export type {
  // Core Types
  JourneySubTab,
  CheckIn,
  MorningData,
  EveningData,

  // Streak Types
  StreakData,
  StreaksState,

  // Milestone Types
  Milestone,

  // Goal Types
  CountdownGoal,
  SavingsGoal,
  JarTransaction,

  // Chart Types
  ChartDataPoint,
  ChartConfig,
  ChartType,
  ChartSettings,
  TrendInfo,

  // User Data Types
  JourneyUserData,
  GratitudeEntry,
  ChallengeEntry,
  Breakthrough,

  // Calendar Types (Part 11C)
  CalendarDayData,
  CalendarFilter,

  // Finance Types (Part 11C)
  MoneyMapStop,

  // Report Types (Part 11D)
  WeeklyReportData,
  GratitudeTheme,
  GratitudeInsights,
  ChallengesInsights,

  // Modal Types (Part 11D)
  JourneyModalType,
} from './types'
