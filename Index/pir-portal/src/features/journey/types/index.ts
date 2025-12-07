// =============================================================================
// JOURNEY FEATURE TYPES
// =============================================================================

import type { Timestamp } from 'firebase/firestore'

// =============================================================================
// CHECK-IN DATA
// =============================================================================

export interface MorningData {
  mood: number
  craving: number
  anxiety: number
  sleep: number
}

export interface EveningData {
  overallDay: number
  reflection?: string
  gratitude?: string
  challenges?: string
  tomorrowGoal?: string
}

export interface CheckIn {
  id: string
  userId: string
  morningData?: MorningData
  eveningData?: EveningData
  createdAt: Timestamp
  date?: string
}

// =============================================================================
// STREAK DATA
// =============================================================================

export interface StreakData {
  current: number
  longest: number
  lastDate: string | null
}

export interface StreaksState {
  checkIn: StreakData
  reflection: StreakData
  loading: boolean
}

// =============================================================================
// MILESTONE DATA
// =============================================================================

export interface Milestone {
  days: number
  title: string
  icon: string
  achieved: boolean
  date?: Date
  daysUntil?: number
}

// =============================================================================
// COUNTDOWN GOAL
// =============================================================================

export interface CountdownGoal {
  id: string
  userId: string
  title: string
  targetDate: Timestamp
  description?: string
  category?: 'financial' | 'personal' | 'health' | 'career' | 'other'
  amount?: number
  createdAt: Timestamp
  completedAt?: Timestamp
  isCompleted?: boolean
}

// =============================================================================
// SAVINGS DATA
// =============================================================================

export interface SavingsGoal {
  id: string
  userId: string
  name: string
  title?: string // Alias for name
  targetAmount: number
  currentAmount: number
  description?: string
  category?: string
  targetDate?: string // ISO date string
  deadline?: Timestamp // Alternative timestamp format
  isActive?: boolean
  createdAt: Timestamp
  updatedAt?: Timestamp
  icon?: string
  color?: string
}

export interface JarTransaction {
  id: string
  goalId: string
  userId: string
  amount: number
  type: 'deposit' | 'withdrawal'
  note?: string
  createdAt: Timestamp
}

// =============================================================================
// GRATITUDE & CHALLENGES
// =============================================================================

export interface GratitudeEntry {
  id: string
  date: string
  gratitude: string
  overallDay?: number
}

export interface ChallengeEntry {
  id: string
  date: string
  challenges: string
  overallDay?: number
}

// =============================================================================
// CHART DATA
// =============================================================================

export interface ChartDataPoint {
  date: string
  value: number | null
  label?: string
}

export interface ChartConfig {
  title: string
  color: string
  bgColor: string
  metricPath: string
  icon: string
}

export type ChartType = 'mood' | 'craving' | 'anxiety' | 'sleep' | 'overallDay'

export interface TrendInfo {
  direction: 'up' | 'down' | 'stable'
  percentage: number
}

// =============================================================================
// JOURNEY SUB-TAB
// =============================================================================

export type JourneySubTab = 'life' | 'wellness' | 'finances'

// =============================================================================
// USER DATA (Journey relevant)
// =============================================================================

export interface JourneyUserData {
  sobrietyDate?: string
  dailyCost?: number
  firstName?: string
  lastName?: string
}

// =============================================================================
// BREAKTHROUGH DATA
// =============================================================================

export interface Breakthrough {
  id: string
  userId: string
  challengeText: string
  daysSinceLastMention?: number
  createdAt: Timestamp
  isAcknowledged?: boolean
}

// =============================================================================
// REFLECTION DATA
// =============================================================================

export interface Reflection {
  id: string
  userId: string
  content: string
  mood?: number
  gratitude?: string
  challenges?: string
  createdAt: Timestamp
  date: string
}

// =============================================================================
// MONEY MAP DATA
// =============================================================================

export interface MoneyMapStop {
  id: string
  userId: string
  name: string
  cost: number
  icon?: string
  description?: string
  category?: string
  isUnlocked?: boolean
  unlockedAt?: Timestamp
  createdAt: Timestamp
  sortOrder?: number
}

// =============================================================================
// CALENDAR HEATMAP DATA
// =============================================================================

export interface CalendarDayData {
  date: Date
  checkIns: CheckIn[]
  moodAverage: number | null
  hasData: boolean
  color: string
}

export type CalendarFilter = 'week' | 'month' | 'all'

// =============================================================================
// WEEKLY REPORT DATA
// =============================================================================

export interface WeeklyReportData {
  totalCheckIns: number
  totalReflections: number
  averageMood: number
  averageCraving: number
  averageAnxiety: number
  averageSleep: number
  averageOverallDay: number
  moodTrend: TrendInfo
  streakDays: number
  highlights: string[]
  challenges: string[]
  gratitudes: string[]
}

// =============================================================================
// GRATITUDE INSIGHTS DATA
// =============================================================================

export interface GratitudeTheme {
  theme: string
  count: number
  percentage?: number
}

export interface GratitudeInsights {
  computed?: {
    topThemes: GratitudeTheme[]
    gaps: Array<{
      category: string
      severity: 'high' | 'medium' | 'low'
      daysSinceLast?: number
    }>
    lastComputed?: Timestamp
  }
}

export interface ChallengesInsights {
  categories: Record<string, { count: number }>
  totalChallenges?: number
}

// =============================================================================
// CHART SETTINGS DATA
// =============================================================================

export interface ChartSettings {
  dateRange: '7d' | '14d' | '31d' | '90d'
  visibleCharts: ChartType[]
  chartOrder: ChartType[]
  showTrendBadges: boolean
  showMissedDays: boolean
}

// =============================================================================
// MODAL TYPES
// =============================================================================

export type JourneyModalType =
  // Life modals
  | 'gratitudeThemes'
  | 'gratitudeJournal'
  | 'challenges'
  | 'breakthrough'
  | 'streak'
  | 'reflectionStreak'
  | 'streaks'
  | 'reflectionStreaks'
  | 'addCountdown'
  // Wellness modals
  | 'calendarHeatmap'
  | 'journeyCalendar'
  | 'weeklyReport'
  | 'moodInsights'
  | 'overallDayInsights'
  | 'graphSettings'
  // Finance modals
  | 'addSavingsGoal'
  | 'editSavingsGoal'
  | 'jarTransaction'
  | 'savingsHistory'
  | 'financeCountdown'
  | null
