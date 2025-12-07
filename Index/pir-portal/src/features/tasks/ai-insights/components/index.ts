// =============================================================================
// BEACON HUB - COMPONENT EXPORTS
// Beacon tracks your patterns and guides you in the right direction
// =============================================================================

// Main Beacon Card
export { BeaconCard, AIInsightCard } from './BeaconCard'
export type { BeaconCardProps, AIInsightCardProps } from './BeaconCard'

// Today's Metrics
export { TodayMetricsGrid } from './TodayMetricsGrid'
export { MetricSelector } from './MetricSelector'
export type { MetricType, MetricSelectorProps } from './MetricSelector'

// Charts & Visualization
export { InteractiveChart } from './InteractiveChart'
export type { ChartDataPoint, InteractiveChartProps, TimePeriod } from './InteractiveChart'
export { CalendarHeatmap } from './CalendarHeatmap'
export type { HeatmapDataPoint, CalendarHeatmapProps } from './CalendarHeatmap'
export { CorrelationCards, DEFAULT_CORRELATIONS } from './CorrelationCards'
export type { Correlation, CorrelationCardsProps, CorrelationType } from './CorrelationCards'

// Pattern Analysis
export { PatternAnalysis, AIPatternAnalysis } from './PatternAnalysis'
export type { PatternInsight, PatternAnalysisProps, AIPatternAnalysisProps } from './PatternAnalysis'

// Habits
export { HabitGrid } from './HabitGrid'
export type { HabitDefinition, HabitCompletion, HabitGridProps } from './HabitGrid'
export { ConsistencyRadial } from './ConsistencyRadial'
export type { HabitConsistency, ConsistencyRadialProps } from './ConsistencyRadial'
export { HabitImpactChart } from './HabitImpactChart'
export type { HabitImpact, HabitImpactChartProps, ImpactMetric } from './HabitImpactChart'
export { HabitCoach, AIHabitCoach } from './HabitCoach'
export type { HabitRecommendation, HabitCoachProps, AIHabitCoachProps } from './HabitCoach'

// Reflections
export { ReflectionTimeline } from './ReflectionTimeline'
export type { ReflectionEntry, ReflectionTimelineProps } from './ReflectionTimeline'
export { GratitudeWordCloud } from './GratitudeWordCloud'
export type { GratitudeEntry, WordCloudWord, GratitudeWordCloudProps } from './GratitudeWordCloud'
export { WinCategories } from './WinCategories'
export type { WinEntry, WinCategory, CategoryData, WinCategoriesProps } from './WinCategories'
export { ReflectionThemes, AIReflectionThemes } from './ReflectionThemes'
export type { ReflectionThemesProps, AIReflectionThemesProps } from './ReflectionThemes'

// Goals
export { GoalProgress } from './GoalProgress'
export type { GoalEntry, GoalProgressProps } from './GoalProgress'
export { ObjectiveRadar } from './ObjectiveRadar'
export type { ObjectiveArea, ObjectiveScore, GoalForRadar, ObjectiveRadarProps } from './ObjectiveRadar'
export { GoalCoaching, AIGoalCoaching } from './GoalCoaching'
export type { GoalCoachingInsight, GoalCoachingProps, AIGoalCoachingProps } from './GoalCoaching'

// Weekly Summary
export { WeeklySummaryCard } from './WeeklySummaryCard'
