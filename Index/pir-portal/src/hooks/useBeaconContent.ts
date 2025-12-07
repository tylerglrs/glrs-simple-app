/**
 * useBeaconContent - Hook for reading AI-generated content from Firestore
 * Phase 6.4: UI Updates
 *
 * Reads daily and weekly AI content from Firestore collections:
 * - users/{userId}/aiInsights/daily_{YYYY-MM-DD}
 * - users/{userId}/aiInsights/oracle_{YYYY-MM-DD}
 * - users/{userId}/aiInsights/proactive_{YYYY-MM-DD}
 * - users/{userId}/aiInsights/techniques_{YYYY-MM-DD}
 * - users/{userId}/weeklyInsights/patterns_{weekId}
 * - users/{userId}/weeklyInsights/correlations_{weekId}
 * - users/{userId}/weeklyInsights/reflections_{weekId}
 * - users/{userId}/weeklyInsights/habits_{weekId}
 * - users/{userId}/weeklyInsights/goals_{weekId}
 */

import { useState, useEffect, useMemo } from 'react'
import { doc, onSnapshot } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useAuth } from '@/contexts/AuthContext'
import type { CTAAction } from '@/lib/ctaHandler'

// =============================================================================
// TYPES
// =============================================================================

// Daily Insight Card
export interface DailyInsightData {
  userId: string
  date: string
  state: 'good_day' | 'missing_checkins' | 'high_craving' | 'new_user' | 'mood_declining' | 'streak_milestone' | 'weekend'
  title: string
  message: string
  icon: string
  iconColor: string
  cta: CTAAction | null
  modalContent?: {
    yesterdayRecap: string
    weekComparison: string
    focusAreas: Array<{ area: string; severity: string; message: string }>
  }
  generatedAt: Date
}

// Daily Oracle
export interface DailyOracleData {
  userId: string
  date: string
  type: 'milestone_approaching' | 'tough_week' | 'strong_week' | 'pattern_insight' | 'encouragement'
  content: string
  revealed: boolean
  revealedAt: Date | null
  cta?: CTAAction | null
  generatedAt: Date
}

// Proactive Insight
export interface ProactiveInsightData {
  userId: string
  date: string
  cardType: 'cravingAlert' | 'sleepRecovery' | 'meetingReminder' | 'moodCheck' | 'streakAlert' | 'anxietySupport' | 'patternInsight' | 'recoveryTip'
  type?: string // Alias for cardType for backwards compatibility
  title: string
  message: string
  icon: string
  iconColor: string
  cta: CTAAction | null
  priority: number | string
  generatedAt: Date
}

// Technique Selection
export interface TechniqueSelectionData {
  userId: string
  date: string
  selectedTechniques: Array<{
    id: string
    category: string
    name: string
    reason: string
    score: number
  }>
  techniques?: Array<{
    id: string
    category: string
    name: string
    reason: string
    score: number
  }> // Alias for backwards compatibility
  generatedAt: Date
}

// Pattern Analysis
export interface PatternAnalysisData {
  userId: string
  weekId: string
  metrics: Record<string, {
    weekAvg: number
    prevWeekAvg: number
    change: number
    trend: 'improving' | 'declining' | 'stable'
    bestDay: string
    worstDay: string
    weekdayAvg: number
    weekendAvg: number
    insights: Array<{
      id: string
      type: 'primary' | 'pattern' | 'correlation' | 'action'
      title: string
      message: string
      severity: 'info' | 'warning' | 'alert'
      icon: string
      cta: CTAAction | null
    }>
    modalContent?: {
      title: string
      chartData: unknown[]
      dayBreakdown: unknown[]
      correlations: unknown[]
      recommendations: string[]
    }
  }>
  // Alias for backwards compatibility with components
  patterns?: Array<{
    id: string
    type: string
    title: string
    message: string
    severity?: string
    icon?: string
  }>
  generatedAt: Date
}

// Correlation Analysis
export interface CorrelationAnalysisData {
  userId: string
  weekId: string
  correlations: Array<{
    metric1: string
    metric2: string
    coefficient: number
    strength: 'weak' | 'moderate' | 'strong'
    direction: 'positive' | 'negative'
    aiInterpretation: string
    actionableInsight: string
    cta: CTAAction | null
    modalContent?: {
      title: string
      subtitle: string
      explanation: string
      examples: Array<{ date: string; metric1Value: number; metric2Value: number }>
      techniques: string[]
      coachNote: string
    }
  }>
  generatedAt: Date
}

// Reflection Themes
export interface ReflectionThemesData {
  userId: string
  weekId: string
  cards: Array<{
    id: string
    type: 'dominant_topic' | 'gratitude_pattern' | 'timing_insight' | 'gap_analysis'
    icon: string
    iconColor: string
    title: string
    message: string
    basedOn: string[]
    cta: CTAAction | null
  }>
  // Alias for backwards compatibility
  themes?: Array<{
    id: string
    type: string
    icon?: string
    iconColor?: string
    title: string
    message: string
    description?: string
  }>
  totalReflections: number
  totalGratitudes: number
  generatedAt: Date
}

// Habit Coach
export interface HabitCoachData {
  userId: string
  weekId: string
  cards: Array<{
    id: string
    type: 'working' | 'needs_attention' | 'optimization'
    icon: string
    iconColor: string
    habitId: string | null
    habitName: string | null
    title: string
    message: string
    cta: CTAAction | null
    modalContent?: {
      stats?: Record<string, unknown>
      completionHistory?: unknown[]
      correlations?: unknown[]
      suggestions?: string[]
    }
  }>
  // Alias for backwards compatibility
  recommendations?: Array<{
    id: string
    type: string
    title: string
    message: string
    description?: string
  }>
  bestHabit: string | null
  focusHabit: string | null
  generatedAt: Date
}

// Goal Coach
export interface GoalCoachData {
  userId: string
  weekId: string
  cards: Array<{
    id: string
    type: 'momentum' | 'stalled' | 'milestone' | 'balance'
    icon: string
    iconColor: string
    goalId: string | null
    goalName: string | null
    title: string
    message: string
    cta: CTAAction | null
    modalContent?: {
      progress?: number
      progressHistory?: unknown[]
      linkedHabits?: unknown[]
      suggestions?: string[]
    }
  }>
  // Alias for backwards compatibility
  insights?: Array<{
    id: string
    type: string
    title: string
    description: string
  }>
  activeGoalCount?: number
  completedGoalCount?: number
  avgProgress?: number
  generatedAt: Date
}

// =============================================================================
// HELPERS
// =============================================================================

function getTodayDateString(): string {
  return new Date().toISOString().split('T')[0]
}

function getWeekId(date = new Date()): string {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const dayNum = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7)
  return `${d.getUTCFullYear()}-W${weekNo.toString().padStart(2, '0')}`
}

// =============================================================================
// DAILY CONTENT HOOKS
// =============================================================================

/**
 * Hook to read daily AI insight from Firestore
 */
export function useDailyInsight() {
  const { user } = useAuth()
  const [data, setData] = useState<DailyInsightData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const dateKey = useMemo(() => getTodayDateString(), [])

  useEffect(() => {
    if (!user?.uid) {
      setLoading(false)
      return
    }

    const docRef = doc(db, 'users', user.uid, 'aiInsights', `daily_${dateKey}`)

    const unsubscribe = onSnapshot(
      docRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const docData = snapshot.data()
          setData({
            ...docData,
            generatedAt: docData.generatedAt?.toDate?.() || new Date(),
          } as DailyInsightData)
        } else {
          setData(null)
        }
        setLoading(false)
      },
      (err) => {
        console.error('[useDailyInsight] Error:', err)
        setError(err)
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [user?.uid, dateKey])

  return { data, loading, error }
}

/**
 * Hook to read daily oracle from Firestore
 */
export function useDailyOracle() {
  const { user } = useAuth()
  const [data, setData] = useState<DailyOracleData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const dateKey = useMemo(() => getTodayDateString(), [])

  useEffect(() => {
    if (!user?.uid) {
      setLoading(false)
      return
    }

    const docRef = doc(db, 'users', user.uid, 'aiInsights', `oracle_${dateKey}`)

    const unsubscribe = onSnapshot(
      docRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const docData = snapshot.data()
          setData({
            ...docData,
            generatedAt: docData.generatedAt?.toDate?.() || new Date(),
            revealedAt: docData.revealedAt?.toDate?.() || null,
          } as DailyOracleData)
        } else {
          setData(null)
        }
        setLoading(false)
      },
      (err) => {
        console.error('[useDailyOracle] Error:', err)
        setError(err)
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [user?.uid, dateKey])

  return { data, loading, error }
}

/**
 * Hook to read proactive insight from Firestore
 */
export function useProactiveInsight() {
  const { user } = useAuth()
  const [data, setData] = useState<ProactiveInsightData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const dateKey = useMemo(() => getTodayDateString(), [])

  useEffect(() => {
    if (!user?.uid) {
      setLoading(false)
      return
    }

    const docRef = doc(db, 'users', user.uid, 'aiInsights', `proactive_${dateKey}`)

    const unsubscribe = onSnapshot(
      docRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const docData = snapshot.data()
          setData({
            ...docData,
            generatedAt: docData.generatedAt?.toDate?.() || new Date(),
          } as ProactiveInsightData)
        } else {
          setData(null)
        }
        setLoading(false)
      },
      (err) => {
        console.error('[useProactiveInsight] Error:', err)
        setError(err)
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [user?.uid, dateKey])

  return { data, loading, error }
}

/**
 * Hook to read technique selection from Firestore
 */
export function useTechniqueSelection() {
  const { user } = useAuth()
  const [data, setData] = useState<TechniqueSelectionData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const dateKey = useMemo(() => getTodayDateString(), [])

  useEffect(() => {
    if (!user?.uid) {
      setLoading(false)
      return
    }

    const docRef = doc(db, 'users', user.uid, 'aiInsights', `techniques_${dateKey}`)

    const unsubscribe = onSnapshot(
      docRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const docData = snapshot.data()
          setData({
            ...docData,
            generatedAt: docData.generatedAt?.toDate?.() || new Date(),
          } as TechniqueSelectionData)
        } else {
          setData(null)
        }
        setLoading(false)
      },
      (err) => {
        console.error('[useTechniqueSelection] Error:', err)
        setError(err)
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [user?.uid, dateKey])

  return { data, loading, error }
}

// =============================================================================
// WEEKLY CONTENT HOOKS
// =============================================================================

/**
 * Hook to read pattern analysis from Firestore
 */
export function usePatternAnalysis() {
  const { user } = useAuth()
  const [data, setData] = useState<PatternAnalysisData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const weekId = useMemo(() => getWeekId(), [])

  useEffect(() => {
    if (!user?.uid) {
      setLoading(false)
      return
    }

    const docRef = doc(db, 'users', user.uid, 'weeklyInsights', `patterns_${weekId}`)

    const unsubscribe = onSnapshot(
      docRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const docData = snapshot.data()
          setData({
            ...docData,
            generatedAt: docData.generatedAt?.toDate?.() || new Date(),
          } as PatternAnalysisData)
        } else {
          setData(null)
        }
        setLoading(false)
      },
      (err) => {
        console.error('[usePatternAnalysis] Error:', err)
        setError(err)
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [user?.uid, weekId])

  return { data, loading, error, weekId }
}

/**
 * Hook to read correlation analysis from Firestore
 */
export function useCorrelationAnalysis() {
  const { user } = useAuth()
  const [data, setData] = useState<CorrelationAnalysisData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const weekId = useMemo(() => getWeekId(), [])

  useEffect(() => {
    if (!user?.uid) {
      setLoading(false)
      return
    }

    const docRef = doc(db, 'users', user.uid, 'weeklyInsights', `correlations_${weekId}`)

    const unsubscribe = onSnapshot(
      docRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const docData = snapshot.data()
          setData({
            ...docData,
            generatedAt: docData.generatedAt?.toDate?.() || new Date(),
          } as CorrelationAnalysisData)
        } else {
          setData(null)
        }
        setLoading(false)
      },
      (err) => {
        console.error('[useCorrelationAnalysis] Error:', err)
        setError(err)
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [user?.uid, weekId])

  return { data, loading, error, weekId }
}

/**
 * Hook to read reflection themes from Firestore
 */
export function useReflectionThemes() {
  const { user } = useAuth()
  const [data, setData] = useState<ReflectionThemesData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const weekId = useMemo(() => getWeekId(), [])

  useEffect(() => {
    if (!user?.uid) {
      setLoading(false)
      return
    }

    const docRef = doc(db, 'users', user.uid, 'weeklyInsights', `reflections_${weekId}`)

    const unsubscribe = onSnapshot(
      docRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const docData = snapshot.data()
          setData({
            ...docData,
            generatedAt: docData.generatedAt?.toDate?.() || new Date(),
          } as ReflectionThemesData)
        } else {
          setData(null)
        }
        setLoading(false)
      },
      (err) => {
        console.error('[useReflectionThemes] Error:', err)
        setError(err)
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [user?.uid, weekId])

  return { data, loading, error, weekId }
}

/**
 * Hook to read habit coach from Firestore
 */
export function useHabitCoach() {
  const { user } = useAuth()
  const [data, setData] = useState<HabitCoachData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const weekId = useMemo(() => getWeekId(), [])

  useEffect(() => {
    if (!user?.uid) {
      setLoading(false)
      return
    }

    const docRef = doc(db, 'users', user.uid, 'weeklyInsights', `habits_${weekId}`)

    const unsubscribe = onSnapshot(
      docRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const docData = snapshot.data()
          setData({
            ...docData,
            generatedAt: docData.generatedAt?.toDate?.() || new Date(),
          } as HabitCoachData)
        } else {
          setData(null)
        }
        setLoading(false)
      },
      (err) => {
        console.error('[useHabitCoach] Error:', err)
        setError(err)
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [user?.uid, weekId])

  return { data, loading, error, weekId }
}

/**
 * Hook to read goal coach from Firestore
 */
export function useGoalCoach() {
  const { user } = useAuth()
  const [data, setData] = useState<GoalCoachData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const weekId = useMemo(() => getWeekId(), [])

  useEffect(() => {
    if (!user?.uid) {
      setLoading(false)
      return
    }

    const docRef = doc(db, 'users', user.uid, 'weeklyInsights', `goals_${weekId}`)

    const unsubscribe = onSnapshot(
      docRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const docData = snapshot.data()
          setData({
            ...docData,
            generatedAt: docData.generatedAt?.toDate?.() || new Date(),
          } as GoalCoachData)
        } else {
          setData(null)
        }
        setLoading(false)
      },
      (err) => {
        console.error('[useGoalCoach] Error:', err)
        setError(err)
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [user?.uid, weekId])

  return { data, loading, error, weekId }
}
