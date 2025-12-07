import { Timestamp } from 'firebase/firestore'

// =============================================================================
// AI INSIGHT TYPES
// =============================================================================

export type InsightType =
  | 'daily_pattern'
  | 'weekly_summary'
  | 'monthly_summary'
  | 'milestone'
  | 'encouragement'
  | 'concern'
  | 'recommendation'

export type InsightPriority = 'low' | 'medium' | 'high' | 'critical'

export interface AIInsight {
  id: string
  userId: string
  type: InsightType
  title: string
  content: string
  priority: InsightPriority
  metadata?: {
    dataPoints?: number
    confidence?: number
    relatedPatterns?: string[]
  }
  dismissed: boolean
  dismissedAt?: Timestamp
  createdAt: Timestamp
  expiresAt?: Timestamp
}

// =============================================================================
// WEEKLY SUMMARY TYPES
// =============================================================================

export interface WeeklySummary {
  id: string
  userId: string
  weekStartDate: string // ISO date string (YYYY-MM-DD)
  weekEndDate: string // ISO date string (YYYY-MM-DD)

  // Check-in metrics
  checkIns: {
    total: number
    morningCount: number
    eveningCount: number
    avgMood: number
    avgAnxiety: number
    avgCraving: number
    avgSleep: number
    avgEnergy: number
    moodTrend: 'improving' | 'stable' | 'declining'
  }

  // Habit metrics
  habits: {
    totalCompletions: number
    completionRate: number
    topHabits: Array<{
      name: string
      completions: number
    }>
  }

  // Reflections & gratitudes
  reflections: {
    total: number
    avgMood: number
    themes: string[]
  }

  gratitudes: {
    total: number
    categories: Record<string, number>
  }

  // Meetings
  meetings: {
    attended: number
    types: Record<string, number>
  }

  // AI-generated summary
  aiSummary: string
  aiHighlights: string[]
  aiRecommendations: string[]

  createdAt: Timestamp
}

// =============================================================================
// MONTHLY SUMMARY TYPES
// =============================================================================

export interface MonthlySummary {
  id: string
  userId: string
  month: number // 1-12
  year: number
  monthStartDate: string // ISO date string
  monthEndDate: string // ISO date string

  // Aggregated weekly data
  weeklyTrends: {
    mood: number[]
    anxiety: number[]
    craving: number[]
    sleep: number[]
    energy: number[]
  }

  // Monthly totals
  totals: {
    checkIns: number
    habitCompletions: number
    reflections: number
    gratitudes: number
    meetingsAttended: number
  }

  // Averages
  averages: {
    mood: number
    anxiety: number
    craving: number
    sleep: number
    energy: number
    habitCompletionRate: number
  }

  // Progress
  progress: {
    sobrietyDaysStart: number
    sobrietyDaysEnd: number
    milestonesReached: string[]
    goalsCompleted: string[]
  }

  // AI analysis
  aiSummary: string
  aiPatterns: string[]
  aiStrengths: string[]
  aiGrowthAreas: string[]
  aiNextMonthFocus: string[]

  createdAt: Timestamp
}

// =============================================================================
// USER MEMORY TYPES
// =============================================================================

export type MemoryCategory =
  | 'preferences'
  | 'patterns'
  | 'triggers'
  | 'coping_strategies'
  | 'goals'
  | 'relationships'
  | 'milestones'
  | 'conversation_context'

export interface UserMemory {
  id: string
  userId: string
  category: MemoryCategory
  key: string
  value: string | number | boolean | Record<string, unknown>
  confidence: number // 0-1 how confident AI is in this memory
  source: 'check_in' | 'reflection' | 'conversation' | 'behavior' | 'explicit'
  lastReinforcedAt: Timestamp
  createdAt: Timestamp
  updatedAt: Timestamp
}

// =============================================================================
// HOOK RETURN TYPES
// =============================================================================

export interface WeeklySummariesState {
  summaries: WeeklySummary[]
  currentWeek: WeeklySummary | null
  loading: boolean
  error: string | null
}

export interface MonthlySummariesState {
  summaries: MonthlySummary[]
  currentMonth: MonthlySummary | null
  loading: boolean
  error: string | null
}

export interface AIInsightsState {
  insights: AIInsight[]
  activeInsights: AIInsight[]
  loading: boolean
  error: string | null
}

export interface UserMemoryState {
  memories: UserMemory[]
  byCategory: Record<MemoryCategory, UserMemory[]>
  loading: boolean
  error: string | null
}
