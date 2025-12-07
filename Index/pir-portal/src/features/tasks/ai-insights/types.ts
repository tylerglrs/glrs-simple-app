// =============================================================================
// BEACON HUB - TYPE DEFINITIONS
// Beacon tracks your patterns and guides you in the right direction
// =============================================================================

import type { Timestamp } from 'firebase/firestore'

// Tab types for navigation (Beacon feature - 2 tabs)
export type BeaconTab = 'patterns' | 'reflect'

// Legacy alias
export type AIInsightTab = BeaconTab

// Trend directions
export type TrendDirection = 'improving' | 'declining' | 'stable'

// =============================================================================
// DATA TYPES
// =============================================================================

export interface CheckInData {
  id: string
  userId: string
  type: 'morning' | 'evening'
  mood: number
  craving?: number
  anxiety?: number
  sleep?: number
  energy?: number
  overallDay?: number
  reflection?: string
  createdAt: Timestamp | Date
}

export interface HabitData {
  id: string
  userId: string
  name: string
  description?: string
  frequency: 'daily' | 'weekly'
  isActive: boolean
  createdAt: Timestamp | Date
}

export interface HabitCompletionData {
  id: string
  habitId: string
  userId: string
  completedAt: Timestamp | Date
}

export interface ReflectionData {
  id: string
  userId: string
  text: string
  mood?: number
  createdAt: Timestamp | Date
}

export interface GratitudeData {
  id: string
  userId: string
  text: string
  category?: string
  createdAt: Timestamp | Date
}

export interface WinData {
  id: string
  userId: string
  text: string
  category?: string
  createdAt: Timestamp | Date
}

export interface GoalData {
  id: string
  userId: string
  title: string
  description?: string
  category?: string
  targetDate?: Timestamp | Date
  progress: number
  status: 'active' | 'completed' | 'archived'
  createdAt: Timestamp | Date
}

export interface MeetingAttendanceData {
  id: string
  userId: string
  meetingId: string
  meetingName: string
  attendedAt: Timestamp | Date
}

// =============================================================================
// PATTERN & ANALYTICS TYPES
// =============================================================================

export interface MetricPattern {
  average: number
  trend: TrendDirection
  dataPoints: Array<{
    date: string
    value: number
  }>
  bestDay: string
  worstDay: string
  weeklyChange: number
}

export interface Correlation {
  factorA: string
  factorB: string
  coefficient: number // -1 to 1
  description: string
}

export interface HabitAnalysis {
  habitId: string
  habitName: string
  completionRate: number
  currentStreak: number
  moodImpact: number // How much mood improves when completed
}

// =============================================================================
// AI INSIGHT TYPES
// =============================================================================

export interface AIInsight {
  id: string
  type: 'summary' | 'pattern' | 'habit' | 'reflection' | 'goal' | 'alert' | 'celebration'
  priority: 'high' | 'medium' | 'low'
  content: string
  actions?: Array<{
    label: string
    action: string // e.g., 'navigate:techniques', 'open:habit-settings'
  }>
  generatedAt: Date
  expiresAt?: Date
}

export interface AIRecommendation {
  id: string
  type: 'technique' | 'habit' | 'meeting' | 'goal' | 'reflection'
  title: string
  description: string
  priority: number // 1-10
  reasoning: string
}

// =============================================================================
// AGGREGATED CONTEXT FOR GPT
// =============================================================================

export interface AIContext {
  // User Profile
  user: {
    firstName: string
    recoveryDate: Date | null
    sobrietyDays: number
  }

  // Check-in Data (30 days)
  checkIns: {
    today: CheckInData | null
    weekAverage: {
      mood: number
      anxiety: number
      craving: number
      sleep: number
      energy: number
    }
    monthTrend: {
      mood: TrendDirection
      anxiety: TrendDirection
      craving: TrendDirection
      sleep: TrendDirection
    }
    patterns: {
      bestDay: string
      worstDay: string
      sleepMoodCorrelation: number
    }
  }

  // Habits (30 days)
  habits: {
    definitions: HabitData[]
    completionRate: number
    streaks: Array<{ habitId: string; habitName: string; days: number }>
    impactAnalysis: Array<{ habitId: string; habitName: string; moodImpact: number }>
  }

  // Reflections (30 days)
  reflections: {
    count: number
    themes: string[]
    sentiment: 'positive' | 'neutral' | 'negative'
    breakthroughCount: number
  }

  // Gratitudes (30 days)
  gratitudes: {
    count: number
    topCategories: string[]
    frequency: number // per week
  }

  // Meetings (30 days)
  meetings: {
    attended: number
    weeklyAverage: number
    streak: number
    upcomingCount: number
  }

  // Goals
  goals: {
    active: GoalData[]
    completionRate: number
    overdueCount: number
  }

  // Context Flags
  context: {
    isWeekend: boolean
    daysToNextMilestone: number
    recentBreakthrough: boolean
    currentCheckInStreak: number
    streakAtRisk: boolean
  }
}

// =============================================================================
// COMPONENT PROPS
// =============================================================================

export interface BeaconHubProps {
  onClose: () => void
  initialTab?: BeaconTab
}

// Legacy alias
export type AIInsightsHubProps = BeaconHubProps

export interface TabProps {
  isActive: boolean
}
