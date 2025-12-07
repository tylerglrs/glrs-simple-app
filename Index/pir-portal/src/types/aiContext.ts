// =============================================================================
// AI CONTEXT DOCUMENT SCHEMA
// Path: users/{userId}/aiContext/current
// =============================================================================

import { Timestamp } from 'firebase/firestore'

/**
 * The aiContext document - single source of truth for AI personalization
 * Updated incrementally on every user action
 * Read by AI functions and frontend for instant access
 */
export interface AIContextDocument {
  // ==========================================================================
  // METADATA
  // ==========================================================================

  /** User ID (for validation) */
  userId: string

  /** Last time this document was updated */
  lastUpdated: Timestamp

  /** Schema version for migrations */
  schemaVersion: number // Start at 1

  // ==========================================================================
  // USER PROFILE (Static - Updated on profile changes)
  // ==========================================================================

  user: {
    /** User's first name for personalization */
    firstName: string

    /** Recovery/sobriety start date */
    recoveryStartDate: Timestamp | null

    /** Calculated days in recovery (updated daily or on context refresh) */
    sobrietyDays: number

    /** Primary substance (for relevant content) */
    primarySubstance: string | null

    /** Recovery stage */
    stage: 'early' | 'developing' | 'sustained' | 'stable' | null

    /** Veteran status (for specialized support) */
    isVeteran: boolean

    /** User's timezone (for accurate day calculations) */
    timezone: string
  }

  // ==========================================================================
  // TODAY'S STATUS (Reset daily at midnight user's timezone)
  // ==========================================================================

  today: {
    /** ISO date string (YYYY-MM-DD) for validation */
    date: string

    /** Morning check-in status */
    morningCheckIn: {
      completed: boolean
      completedAt: Timestamp | null
      mood: number | null
      craving: number | null
      anxiety: number | null
      sleep: number | null
      energy: number | null
    }

    /** Evening check-in status */
    eveningCheckIn: {
      completed: boolean
      completedAt: Timestamp | null
      overallDay: number | null
      gratitude: string | null
      tomorrowGoal: string | null
    }

    /** Habits completed today */
    habitsCompleted: string[] // habitId[]

    /** Count of habits expected today */
    habitsExpected: number

    /** Reflections written today */
    reflectionsCount: number

    /** Gratitudes logged today */
    gratitudesCount: number

    /** Wins logged today */
    winsCount: number

    /** Meetings attended today */
    meetingsAttended: number

    /** Assignments completed today */
    assignmentsCompleted: number
  }

  // ==========================================================================
  // RECENT 7 DAYS (Rolling window - Updated on check-in)
  // ==========================================================================

  recent7Days: {
    /** Number of check-ins in last 7 days */
    checkInCount: number

    /** Metric averages */
    avgMood: number | null
    avgCraving: number | null
    avgAnxiety: number | null
    avgSleep: number | null
    avgEnergy: number | null

    /** Daily values for sparkline charts [oldest...newest] */
    moodValues: number[] // max 7 values
    cravingValues: number[]
    anxietyValues: number[]
    sleepValues: number[]
    energyValues: number[]

    /** Trends compared to previous 7 days */
    moodTrend: 'improving' | 'stable' | 'declining'
    cravingTrend: 'improving' | 'stable' | 'declining'
    anxietyTrend: 'improving' | 'stable' | 'declining'
    sleepTrend: 'improving' | 'stable' | 'declining'
    energyTrend: 'improving' | 'stable' | 'declining'
  }

  // ==========================================================================
  // PATTERNS (Computed from historical data)
  // ==========================================================================

  patterns: {
    /** Best day of week for mood */
    bestDayOfWeek: string | null // e.g., "Tuesday"

    /** Worst day of week for mood */
    worstDayOfWeek: string | null

    /** Time of day with highest cravings */
    highCravingTime: 'morning' | 'afternoon' | 'evening' | 'night' | null

    /** Sleep-mood correlation (-1 to 1) */
    sleepMoodCorrelation: number | null

    /** Weekend vs weekday mood difference */
    weekendMoodDiff: number | null

    /** Most common gratitude categories */
    topGratitudeCategories: string[] // max 3

    /** Most common win categories */
    topWinCategories: string[] // max 3
  }

  // ==========================================================================
  // STREAKS (Updated on relevant actions)
  // ==========================================================================

  streaks: {
    /** Current check-in streak (consecutive days) */
    checkInStreak: number

    /** Check-in streak at risk (missed today) */
    checkInStreakAtRisk: boolean

    /** Current meeting attendance streak */
    meetingStreak: number

    /** Per-habit streaks */
    habitStreaks: Array<{
      habitId: string
      habitName: string
      currentStreak: number
      longestStreak: number
    }>

    /** Overall habit completion streak (all habits done) */
    allHabitsStreak: number
  }

  // ==========================================================================
  // HABITS SUMMARY (Updated on habit changes/completions)
  // ==========================================================================

  habits: {
    /** Active habit definitions */
    definitions: Array<{
      id: string
      name: string
      frequency: 'daily' | 'weekly'
    }>

    /** Count of active habits */
    activeCount: number

    /** 7-day completion rate (0-100) */
    completionRate7Day: number

    /** 30-day completion rate (0-100) */
    completionRate30Day: number

    /** Habits with highest completion rates */
    topHabits: Array<{
      habitId: string
      habitName: string
      completionRate: number
    }> // max 3

    /** Habits that need attention (low completion) */
    needsAttention: Array<{
      habitId: string
      habitName: string
      completionRate: number
      daysMissed: number
    }> // max 3
  }

  // ==========================================================================
  // GOALS SUMMARY (Updated on goal changes)
  // ==========================================================================

  goals: {
    /** Count of active goals */
    activeCount: number

    /** Count of completed goals (all time) */
    completedCount: number

    /** Active goals summary */
    active: Array<{
      id: string
      title: string
      category: string | null
      progress: number
      targetDate: Timestamp | null
      isOverdue: boolean
    }> // max 10

    /** Average progress across active goals */
    avgProgress: number

    /** Count of overdue goals */
    overdueCount: number

    /** Recently completed goals (last 30 days) */
    recentlyCompleted: Array<{
      id: string
      title: string
      completedAt: Timestamp
    }> // max 5
  }

  // ==========================================================================
  // ASSIGNMENTS SUMMARY (Updated on assignment changes)
  // ==========================================================================

  assignments: {
    /** Count of pending assignments */
    pendingCount: number

    /** Count of overdue assignments */
    overdueCount: number

    /** Completed this week */
    completedThisWeek: number

    /** Current completion streak */
    streak: number

    /** Next due assignment */
    nextDue: {
      id: string
      title: string
      dueDate: Timestamp
    } | null
  }

  // ==========================================================================
  // MEETINGS SUMMARY (Updated on meeting attendance)
  // ==========================================================================

  meetings: {
    /** Meetings attended this week */
    attendedThisWeek: number

    /** Meetings attended this month */
    attendedThisMonth: number

    /** Weekly attendance rate (last 4 weeks) */
    weeklyAverage: number

    /** Current attendance streak */
    streak: number

    /** Most attended meeting types */
    topTypes: string[] // e.g., ["AA", "NA", "SMART Recovery"]

    /** Last meeting attended date */
    lastAttendedDate: Timestamp | null

    /** Upcoming scheduled meetings count */
    upcomingCount: number

    /** Number of saved/favorite meetings */
    savedCount: number
  }

  // ==========================================================================
  // REFLECTIONS & JOURNALING SUMMARY
  // ==========================================================================

  reflections: {
    /** Total reflections (last 30 days) */
    count30Day: number

    /** Weekly average */
    weeklyAverage: number

    /** Recent themes/topics extracted */
    recentThemes: string[] // max 5

    /** Overall sentiment trend */
    sentimentTrend: 'positive' | 'neutral' | 'negative'
  }

  gratitudes: {
    /** Total gratitudes (last 30 days) */
    count30Day: number

    /** Weekly average */
    weeklyAverage: number

    /** Top categories */
    topCategories: Array<{
      category: string
      count: number
    }> // max 5
  }

  wins: {
    /** Total wins (last 30 days) */
    count30Day: number

    /** Weekly average */
    weeklyAverage: number

    /** Top categories */
    topCategories: Array<{
      category: string
      count: number
    }> // max 5
  }

  // ==========================================================================
  // BREAKTHROUGHS & MILESTONES
  // ==========================================================================

  breakthroughs: {
    /** Total breakthroughs logged */
    totalCount: number

    /** Most recent breakthrough date */
    mostRecentDate: Timestamp | null

    /** Flag for AI context */
    hadRecentBreakthrough: boolean // within last 7 days
  }

  milestones: {
    /** Next milestone approaching */
    nextMilestone: {
      days: number // e.g., 30, 60, 90
      daysRemaining: number
    } | null

    /** Recently achieved milestones */
    recentlyAchieved: Array<{
      days: number
      achievedAt: Timestamp
    }> // max 3
  }

  // ==========================================================================
  // JOURNEY / FINANCIAL (Optional)
  // ==========================================================================

  journey: {
    /** Total money saved */
    totalSaved: number

    /** Active savings goal progress */
    savingsGoalProgress: number | null // 0-100

    /** Money map progress */
    moneyMapProgress: number | null // 0-100

    /** Countdown goals active */
    countdownGoalsActive: number
  }

  // ==========================================================================
  // CONTEXT FLAGS (For AI decision-making)
  // ==========================================================================

  context: {
    /** Is today a weekend? */
    isWeekend: boolean

    /** Is user in a high-risk period? */
    isHighRisk: boolean

    /** Flags that triggered high-risk */
    riskFactors: string[] // e.g., ["declining_mood", "missed_meetings"]

    /** Should AI be extra supportive? */
    needsEncouragement: boolean

    /** Recent positive momentum */
    hasPositiveMomentum: boolean

    /** Days until next milestone */
    daysToNextMilestone: number | null

    /** Has the user engaged today? */
    engagedToday: boolean

    /** Last AI insight generated */
    lastInsightDate: Timestamp | null

    /** Last AI insight type */
    lastInsightType: string | null
  }
}

// =============================================================================
// UPDATE TYPES (For partial/incremental updates)
// =============================================================================

/**
 * Type for morning check-in update payload
 */
export interface MorningCheckInContextUpdate {
  'today.morningCheckIn.completed': boolean
  'today.morningCheckIn.completedAt': Timestamp
  'today.morningCheckIn.mood': number
  'today.morningCheckIn.craving': number
  'today.morningCheckIn.anxiety': number
  'today.morningCheckIn.sleep': number
  'today.morningCheckIn.energy': number
  'context.engagedToday': boolean
  lastUpdated: Timestamp
}

/**
 * Type for evening check-in update payload
 */
export interface EveningCheckInContextUpdate {
  'today.eveningCheckIn.completed': boolean
  'today.eveningCheckIn.completedAt': Timestamp
  'today.eveningCheckIn.overallDay': number
  'today.eveningCheckIn.gratitude': string | null
  'today.eveningCheckIn.tomorrowGoal': string | null
  'context.engagedToday': boolean
  lastUpdated: Timestamp
}

/**
 * Type for habit completion update payload
 */
export interface HabitCompletionContextUpdate {
  'today.habitsCompleted': string[]
  'context.engagedToday': boolean
  lastUpdated: Timestamp
}

/**
 * Type for reflection/gratitude/win update payload
 */
export interface JournalingContextUpdate {
  'today.reflectionsCount'?: number
  'today.gratitudesCount'?: number
  'today.winsCount'?: number
  'context.engagedToday': boolean
  lastUpdated: Timestamp
}

/**
 * Type for goal update payload
 */
export interface GoalContextUpdate {
  'goals.activeCount'?: number
  'goals.completedCount'?: number
  'goals.avgProgress'?: number
  'context.engagedToday': boolean
  lastUpdated: Timestamp
}

/**
 * Type for assignment completion update payload
 */
export interface AssignmentContextUpdate {
  'today.assignmentsCompleted': number
  'assignments.pendingCount'?: number
  'context.engagedToday': boolean
  lastUpdated: Timestamp
}

/**
 * Type for meeting attendance update payload
 */
export interface MeetingContextUpdate {
  'today.meetingsAttended': number
  'meetings.attendedThisWeek'?: number
  'context.engagedToday': boolean
  lastUpdated: Timestamp
}

/**
 * Type for meeting save/unsave update payload
 */
export interface MeetingSaveContextUpdate {
  'meetings.savedCount': number
  lastUpdated: Timestamp
}

/**
 * Type for breakthrough update payload
 */
export interface BreakthroughContextUpdate {
  'breakthroughs.totalCount': number
  'breakthroughs.mostRecentDate': Timestamp
  'breakthroughs.hadRecentBreakthrough': boolean
  'context.engagedToday': boolean
  lastUpdated: Timestamp
}

/**
 * Type for financial/journey update payload
 */
export interface JourneyContextUpdate {
  'journey.totalSaved'?: number
  'journey.savingsGoalProgress'?: number
  'journey.countdownGoalsActive'?: number
  'context.engagedToday': boolean
  lastUpdated: Timestamp
}

/**
 * Union type for all possible update payloads
 */
export type AIContextUpdate =
  | MorningCheckInContextUpdate
  | EveningCheckInContextUpdate
  | HabitCompletionContextUpdate
  | JournalingContextUpdate
  | GoalContextUpdate
  | AssignmentContextUpdate
  | MeetingContextUpdate
  | MeetingSaveContextUpdate
  | BreakthroughContextUpdate
  | JourneyContextUpdate
  | Partial<Record<string, unknown>>

// =============================================================================
// HELPER TYPES
// =============================================================================

/**
 * Update action types for updateAIContext helper
 */
export type AIContextUpdateAction =
  | 'morning_checkin'
  | 'evening_checkin'
  | 'habit_complete'
  | 'habit_add'
  | 'reflection_add'
  | 'gratitude_add'
  | 'win_add'
  | 'goal_add'
  | 'goal_update'
  | 'goal_complete'
  | 'assignment_complete'
  | 'meeting_attend'
  | 'meeting_save'
  | 'breakthrough_add'
  | 'savings_update'
  | 'profile_update'
  | 'countdown_goal_add'
  | 'countdown_goal_update'
  | 'countdown_goal_complete'
  | 'money_map_update'
  | 'technique_complete'
  | 'intention_add'
  | 'safety_plan_update'

/**
 * Default empty context for new users
 */
export function createEmptyAIContext(userId: string): Partial<AIContextDocument> {
  const now = new Date()
  const today = now.toISOString().split('T')[0]

  return {
    userId,
    schemaVersion: 1,
    user: {
      firstName: '',
      recoveryStartDate: null,
      sobrietyDays: 0,
      primarySubstance: null,
      stage: null,
      isVeteran: false,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
    today: {
      date: today,
      morningCheckIn: {
        completed: false,
        completedAt: null,
        mood: null,
        craving: null,
        anxiety: null,
        sleep: null,
        energy: null,
      },
      eveningCheckIn: {
        completed: false,
        completedAt: null,
        overallDay: null,
        gratitude: null,
        tomorrowGoal: null,
      },
      habitsCompleted: [],
      habitsExpected: 0,
      reflectionsCount: 0,
      gratitudesCount: 0,
      winsCount: 0,
      meetingsAttended: 0,
      assignmentsCompleted: 0,
    },
    recent7Days: {
      checkInCount: 0,
      avgMood: null,
      avgCraving: null,
      avgAnxiety: null,
      avgSleep: null,
      avgEnergy: null,
      moodValues: [],
      cravingValues: [],
      anxietyValues: [],
      sleepValues: [],
      energyValues: [],
      moodTrend: 'stable',
      cravingTrend: 'stable',
      anxietyTrend: 'stable',
      sleepTrend: 'stable',
      energyTrend: 'stable',
    },
    patterns: {
      bestDayOfWeek: null,
      worstDayOfWeek: null,
      highCravingTime: null,
      sleepMoodCorrelation: null,
      weekendMoodDiff: null,
      topGratitudeCategories: [],
      topWinCategories: [],
    },
    streaks: {
      checkInStreak: 0,
      checkInStreakAtRisk: false,
      meetingStreak: 0,
      habitStreaks: [],
      allHabitsStreak: 0,
    },
    habits: {
      definitions: [],
      activeCount: 0,
      completionRate7Day: 0,
      completionRate30Day: 0,
      topHabits: [],
      needsAttention: [],
    },
    goals: {
      activeCount: 0,
      completedCount: 0,
      active: [],
      avgProgress: 0,
      overdueCount: 0,
      recentlyCompleted: [],
    },
    assignments: {
      pendingCount: 0,
      overdueCount: 0,
      completedThisWeek: 0,
      streak: 0,
      nextDue: null,
    },
    meetings: {
      attendedThisWeek: 0,
      attendedThisMonth: 0,
      weeklyAverage: 0,
      streak: 0,
      topTypes: [],
      lastAttendedDate: null,
      upcomingCount: 0,
      savedCount: 0,
    },
    reflections: {
      count30Day: 0,
      weeklyAverage: 0,
      recentThemes: [],
      sentimentTrend: 'neutral',
    },
    gratitudes: {
      count30Day: 0,
      weeklyAverage: 0,
      topCategories: [],
    },
    wins: {
      count30Day: 0,
      weeklyAverage: 0,
      topCategories: [],
    },
    breakthroughs: {
      totalCount: 0,
      mostRecentDate: null,
      hadRecentBreakthrough: false,
    },
    milestones: {
      nextMilestone: null,
      recentlyAchieved: [],
    },
    journey: {
      totalSaved: 0,
      savingsGoalProgress: null,
      moneyMapProgress: null,
      countdownGoalsActive: 0,
    },
    context: {
      isWeekend: [0, 6].includes(now.getDay()),
      isHighRisk: false,
      riskFactors: [],
      needsEncouragement: false,
      hasPositiveMomentum: false,
      daysToNextMilestone: null,
      engagedToday: false,
      lastInsightDate: null,
      lastInsightType: null,
    },
  }
}
