/**
 * useAIContext Hook - AI Context Builder for BEACON
 * Phase 6: Full BeaconContext for unified AI personality
 *
 * This hook pulls from multiple data sources and computes:
 * - User identity (firstName, sobrietyDays, veteran/first responder status)
 * - Today's status (morning/evening check-in, habits completed/missed)
 * - Recent history (7 days - specific dates, actual text, trends)
 * - Patterns (best/worst days, correlations, effective coping)
 * - Previous AI insights (for continuity in responses)
 * - Status flags (daysWithoutCheckIn, daysWithoutMeeting, needsAttention)
 * - Milestones (next milestone, days until, recent achieved)
 */

import { useState, useEffect, useMemo, useCallback } from 'react'
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  Timestamp,
  limit,
  doc,
  getDoc,
  getDocs,
} from 'firebase/firestore'
import { db, auth } from '@/lib/firebase'
import { buildContextString, type AIContext } from '@/lib/openai'
import { formatDateForAI } from '@/lib/beacon'

// =============================================================================
// TYPES
// =============================================================================

export interface AIContextState {
  context: AIContext | null
  contextString: string
  loading: boolean
  error: string | null
  lastUpdated: Date | null
}

interface RawUserData {
  firstName?: string
  lastName?: string
  odid?: string
  sobrietyDate?: string
  recoveryDate?: string
  substance?: string
  isVeteran?: boolean
  isFirstResponder?: boolean
}

interface RawAIResponse {
  id: string
  type: string
  prompt: string
  response: string
  createdAt: Timestamp | Date
}

interface RawCheckIn {
  id: string
  userId: string
  type?: 'morning' | 'evening'
  mood: number
  craving?: number
  anxiety?: number
  sleep?: number
  energy?: number
  notes?: string
  createdAt: Timestamp | Date
}

interface RawHabit {
  id: string
  name: string
  isActive: boolean
}

interface RawHabitCompletion {
  habitId: string
  completedAt: Timestamp | Date
}

interface RawReflection {
  id: string
  text?: string
  dayRating?: number
  gratitude?: string
  challenge?: string
  tomorrowGoal?: string
  mood?: number
  createdAt: Timestamp | Date
}

interface RawGratitude {
  id: string
  text: string
  category?: string
  createdAt: Timestamp | Date
}

interface RawBreakthrough {
  id: string
  text: string
  sobrietyDay: number
  createdAt: Timestamp | Date
}

interface RawGoal {
  id: string
  title: string
  description?: string
  category?: string
  targetDate?: Timestamp | Date
  progress: number
  status: 'active' | 'completed' | 'archived'
}

interface RawMilestone {
  id: string
  days: number
  achievedAt?: Timestamp | Date
  celebrated: boolean
}

interface RawMeetingAttendance {
  id: string
  meetingId: string
  meetingName?: string
  meetingType?: string
  attendedAt: Timestamp | Date
}

interface RawCoach {
  id: string
  firstName: string
  lastName: string
  email: string
}

interface RawAssignment {
  id: string
  title: string
  dueDate?: Timestamp | Date
  status: 'pending' | 'completed' | 'overdue'
  createdAt: Timestamp | Date
}

interface RawAIPromptUsage {
  promptCardsUsed: number
  anchorMessagesUsed: number
  oracleRegenerated: boolean
}

interface RawOracle {
  date: string
  revealed: boolean
  revealedAt?: Timestamp | Date
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function getDateDaysAgo(days: number): Date {
  const date = new Date()
  date.setDate(date.getDate() - days)
  date.setHours(0, 0, 0, 0)
  return date
}

function isToday(date: Date | Timestamp): boolean {
  const d = date instanceof Timestamp ? date.toDate() : new Date(date)
  const today = new Date()
  return (
    d.getDate() === today.getDate() &&
    d.getMonth() === today.getMonth() &&
    d.getFullYear() === today.getFullYear()
  )
}

function isWeekend(): boolean {
  const day = new Date().getDay()
  return day === 0 || day === 6
}

function toDate(value: Timestamp | Date): Date {
  if (value instanceof Timestamp) {
    return value.toDate()
  }
  return new Date(value)
}

function calculateDaysSober(sobrietyDate: string | undefined): number {
  if (!sobrietyDate) return 0
  try {
    const [year, month, day] = sobrietyDate.split('-').map(Number)
    const sobrietyDateObj = new Date(year, month - 1, day, 0, 0, 0, 0)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const sobrietyUTC = Date.UTC(sobrietyDateObj.getFullYear(), sobrietyDateObj.getMonth(), sobrietyDateObj.getDate())
    const todayUTC = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate())
    const diffTime = todayUTC - sobrietyUTC
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1
    return Math.max(1, diffDays)
  } catch {
    return 0
  }
}

function calculateTrend(values: number[] | undefined | null): 'improving' | 'stable' | 'declining' {
  if (!values || values.length < 3) return 'stable'
  const recentAvg = values.slice(-3).reduce((a, b) => a + b, 0) / 3
  const olderAvg = values.slice(0, 3).reduce((a, b) => a + b, 0) / 3
  const diff = recentAvg - olderAvg
  if (diff > 0.5) return 'improving'
  if (diff < -0.5) return 'declining'
  return 'stable'
}

function calculateAverage(values: number[] | undefined | null): number {
  if (!values || values.length === 0) return 0
  return values.reduce((a, b) => a + b, 0) / values.length
}

function extractThemes(texts: string[]): string[] {
  // Simple word frequency extraction
  const stopWords = new Set([
    'a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
    'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'been',
    'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would',
    'should', 'could', 'can', 'may', 'might', 'must', 'i', 'my', 'me',
    'am', 'that', 'this', 'it', 'very', 'so', 'too', 'just', 'about',
    'been', 'being', 'they', 'them', 'their', 'what', 'which', 'when',
    'where', 'who', 'why', 'how', 'all', 'each', 'every', 'both', 'few',
    'more', 'most', 'other', 'some', 'such', 'only', 'own', 'same',
    'today', 'day', 'felt', 'feel', 'feeling', 'really', 'good', 'great',
  ])

  const wordCount: Record<string, number> = {}

  texts.forEach((text) => {
    const words = text
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter((word) => word.length > 3 && !stopWords.has(word))

    words.forEach((word) => {
      wordCount[word] = (wordCount[word] || 0) + 1
    })
  })

  // Return top 10 words by frequency
  return Object.entries(wordCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([word]) => word.charAt(0).toUpperCase() + word.slice(1))
}

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

function calculateBestWorstDays(checkIns: RawCheckIn[] | undefined | null): { best: string | null; worst: string | null } {
  if (!checkIns || checkIns.length < 3) return { best: null, worst: null }

  const dayMoods: Record<number, number[]> = { 0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] }

  checkIns.forEach((c) => {
    const date = c.createdAt instanceof Timestamp ? c.createdAt.toDate() : new Date(c.createdAt)
    const dayOfWeek = date.getDay()
    if (c.mood != null) {
      dayMoods[dayOfWeek].push(c.mood)
    }
  })

  let bestDay: number | null = null
  let bestAvg = -Infinity
  let worstDay: number | null = null
  let worstAvg = Infinity

  for (let day = 0; day < 7; day++) {
    if (dayMoods[day].length >= 2) {
      const avg = dayMoods[day].reduce((a, b) => a + b, 0) / dayMoods[day].length
      if (avg > bestAvg) {
        bestAvg = avg
        bestDay = day
      }
      if (avg < worstAvg) {
        worstAvg = avg
        worstDay = day
      }
    }
  }

  return {
    best: bestDay !== null ? DAY_NAMES[bestDay] : null,
    worst: worstDay !== null ? DAY_NAMES[worstDay] : null,
  }
}

function calculateDaysSinceLastCheckIn(checkIns: RawCheckIn[] | undefined | null): number {
  if (!checkIns || checkIns.length === 0) return -1

  const sorted = [...checkIns].sort((a, b) => {
    const dateA = a.createdAt instanceof Timestamp ? a.createdAt.toDate() : new Date(a.createdAt)
    const dateB = b.createdAt instanceof Timestamp ? b.createdAt.toDate() : new Date(b.createdAt)
    return dateB.getTime() - dateA.getTime()
  })

  const lastDate = sorted[0].createdAt instanceof Timestamp
    ? sorted[0].createdAt.toDate()
    : new Date(sorted[0].createdAt)

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  lastDate.setHours(0, 0, 0, 0)

  return Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24))
}

function calculateDaysSinceLastMeeting(attendance: RawMeetingAttendance[] | undefined | null): number {
  if (!attendance || attendance.length === 0) return -1

  const sorted = [...attendance].sort((a, b) => {
    const dateA = a.attendedAt instanceof Timestamp ? a.attendedAt.toDate() : new Date(a.attendedAt)
    const dateB = b.attendedAt instanceof Timestamp ? b.attendedAt.toDate() : new Date(b.attendedAt)
    return dateB.getTime() - dateA.getTime()
  })

  const lastDate = sorted[0].attendedAt instanceof Timestamp
    ? sorted[0].attendedAt.toDate()
    : new Date(sorted[0].attendedAt)

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  lastDate.setHours(0, 0, 0, 0)

  return Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24))
}

function calculateDaysSinceLastReflection(reflections: RawReflection[] | undefined | null): number {
  if (!reflections || reflections.length === 0) return -1

  const sorted = [...reflections].sort((a, b) => {
    const dateA = a.createdAt instanceof Timestamp ? a.createdAt.toDate() : new Date(a.createdAt)
    const dateB = b.createdAt instanceof Timestamp ? b.createdAt.toDate() : new Date(b.createdAt)
    return dateB.getTime() - dateA.getTime()
  })

  const lastDate = sorted[0].createdAt instanceof Timestamp
    ? sorted[0].createdAt.toDate()
    : new Date(sorted[0].createdAt)

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  lastDate.setHours(0, 0, 0, 0)

  return Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24))
}

function detectCravingSpike(checkIns: RawCheckIn[] | undefined | null, daysBack: number = 3): boolean {
  if (!checkIns) return false
  const recent = checkIns.filter((c) => {
    const date = c.createdAt instanceof Timestamp ? c.createdAt.toDate() : new Date(c.createdAt)
    const cutoff = getDateDaysAgo(daysBack)
    return date >= cutoff && c.craving != null
  })

  return recent.some((c) => (c.craving ?? 0) >= 7)
}

function detectSleepDecline(checkIns: RawCheckIn[] | undefined | null): boolean {
  if (!checkIns || checkIns.length < 5) return false

  const sorted = [...checkIns]
    .filter((c) => c.sleep != null)
    .sort((a, b) => {
      const dateA = a.createdAt instanceof Timestamp ? a.createdAt.toDate() : new Date(a.createdAt)
      const dateB = b.createdAt instanceof Timestamp ? b.createdAt.toDate() : new Date(b.createdAt)
      return dateB.getTime() - dateA.getTime()
    })

  if (sorted.length < 5) return false

  const recentAvg = sorted.slice(0, 3).reduce((a, c) => a + (c.sleep ?? 0), 0) / 3
  const olderAvg = sorted.slice(3, 6).reduce((a, c) => a + (c.sleep ?? 0), 0) / Math.min(3, sorted.length - 3)

  return recentAvg < olderAvg - 1.5
}

function getHabitsCompletedToday(
  habits: RawHabit[] | undefined | null,
  completions: RawHabitCompletion[] | undefined | null
): string[] {
  if (!habits || !completions) return []
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const todayCompletions = completions.filter((c) => {
    const date = c.completedAt instanceof Timestamp ? c.completedAt.toDate() : new Date(c.completedAt)
    date.setHours(0, 0, 0, 0)
    return date.getTime() === today.getTime()
  })

  const completedIds = new Set(todayCompletions.map((c) => c.habitId))

  return habits
    .filter((h) => h.isActive && completedIds.has(h.id))
    .map((h) => h.name)
}

function getHabitsMissedToday(
  habits: RawHabit[] | undefined | null,
  completions: RawHabitCompletion[] | undefined | null
): string[] {
  if (!habits || !completions) return []
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const todayCompletions = completions.filter((c) => {
    const date = c.completedAt instanceof Timestamp ? c.completedAt.toDate() : new Date(c.completedAt)
    date.setHours(0, 0, 0, 0)
    return date.getTime() === today.getTime()
  })

  const completedIds = new Set(todayCompletions.map((c) => c.habitId))

  return habits
    .filter((h) => h.isActive && !completedIds.has(h.id))
    .map((h) => h.name)
}

function getNextMilestone(sobrietyDays: number): { days: number; name: string } | null {
  const milestoneNames: Record<number, string> = {
    1: '1 Day',
    7: '1 Week',
    14: '2 Weeks',
    30: '30 Days',
    60: '60 Days',
    90: '90 Days',
    180: '6 Months',
    365: '1 Year',
    730: '2 Years',
    1095: '3 Years',
    1825: '5 Years',
  }

  for (const milestone of STANDARD_MILESTONES) {
    if (milestone > sobrietyDays) {
      return { days: milestone, name: milestoneNames[milestone] || `${milestone} Days` }
    }
  }

  // Beyond 5 years, calculate next yearly milestone
  const yearsComplete = Math.floor(sobrietyDays / 365)
  const nextYearDays = (yearsComplete + 1) * 365
  return { days: nextYearDays, name: `${yearsComplete + 1} Years` }
}

// Standard recovery milestones in days
const STANDARD_MILESTONES = [1, 7, 14, 30, 60, 90, 180, 365, 730, 1095, 1825]

function calculateUpcomingMilestones(
  sobrietyDays: number,
  achievedMilestones: RawMilestone[]
): Array<{ days: number; achieved: boolean }> {
  const achievedDays = new Set(achievedMilestones.map((m) => m.days))

  return STANDARD_MILESTONES.map((days) => ({
    days,
    achieved: achievedDays.has(days) || sobrietyDays >= days,
  }))
}

function calculateCheckInStreak(checkIns: RawCheckIn[] | undefined | null): { current: number; atRisk: boolean } {
  if (!checkIns || checkIns.length === 0) return { current: 0, atRisk: false }

  // Sort by date descending
  const sorted = [...checkIns].sort((a, b) => {
    const dateA = a.createdAt instanceof Timestamp ? a.createdAt.toDate() : new Date(a.createdAt)
    const dateB = b.createdAt instanceof Timestamp ? b.createdAt.toDate() : new Date(b.createdAt)
    return dateB.getTime() - dateA.getTime()
  })

  // Check if most recent is today or yesterday
  const mostRecent = sorted[0].createdAt instanceof Timestamp
    ? sorted[0].createdAt.toDate()
    : new Date(sorted[0].createdAt)

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  mostRecent.setHours(0, 0, 0, 0)

  const isToday = mostRecent.getTime() === today.getTime()
  const isYesterday = mostRecent.getTime() === yesterday.getTime()

  if (!isToday && !isYesterday) {
    return { current: 0, atRisk: true }
  }

  // Count consecutive days
  let streak = 1
  let currentDate = mostRecent

  for (let i = 1; i < sorted.length; i++) {
    const checkInDate = toDate(sorted[i].createdAt)
    checkInDate.setHours(0, 0, 0, 0)

    const expectedDate = new Date(currentDate)
    expectedDate.setDate(expectedDate.getDate() - 1)

    if (checkInDate.getTime() === expectedDate.getTime()) {
      streak++
      currentDate = checkInDate
    } else if (checkInDate.getTime() < expectedDate.getTime()) {
      break
    }
    // Skip same-day duplicates
  }

  return {
    current: streak,
    atRisk: isYesterday && !isToday,
  }
}

function calculateHabitCompletionRate(
  habits: RawHabit[] | undefined | null,
  completions: RawHabitCompletion[] | undefined | null,
  daysToConsider: number = 7
): number {
  if (!habits || habits.length === 0) return 0
  if (!completions) return 0

  const cutoff = getDateDaysAgo(daysToConsider)
  const recentCompletions = completions.filter((c) => {
    const date = c.completedAt instanceof Timestamp ? c.completedAt.toDate() : new Date(c.completedAt)
    return date >= cutoff
  })

  // Expected completions = habits * days
  const expectedCompletions = habits.filter((h) => h.isActive).length * daysToConsider

  if (expectedCompletions === 0) return 0
  return Math.min(1, recentCompletions.length / expectedCompletions)
}

function calculateHabitStreaks(
  habits: RawHabit[] | undefined | null,
  completions: RawHabitCompletion[] | undefined | null
): Array<{ name: string; days: number }> {
  if (!habits || !completions) return []
  const streaks: Array<{ name: string; days: number }> = []

  habits.forEach((habit) => {
    const habitCompletions = completions
      .filter((c) => c.habitId === habit.id)
      .map((c) => (c.completedAt instanceof Timestamp ? c.completedAt.toDate() : new Date(c.completedAt)))
      .sort((a, b) => b.getTime() - a.getTime())

    if (habitCompletions.length === 0) {
      streaks.push({ name: habit.name, days: 0 })
      return
    }

    // Count consecutive days
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    let streak = 0
    let currentDate = new Date(today)

    for (const completionDate of habitCompletions) {
      const compDate = new Date(completionDate)
      compDate.setHours(0, 0, 0, 0)

      if (compDate.getTime() === currentDate.getTime()) {
        streak++
        currentDate.setDate(currentDate.getDate() - 1)
      } else if (compDate.getTime() < currentDate.getTime()) {
        break
      }
    }

    streaks.push({ name: habit.name, days: streak })
  })

  // Sort by streak length descending
  return streaks.sort((a, b) => b.days - a.days)
}

function calculateMeetingStreak(attendance: RawMeetingAttendance[] | undefined | null): number {
  if (!attendance || attendance.length === 0) return 0

  // Group by week
  const weekCounts: Record<string, number> = {}

  attendance.forEach((a) => {
    const date = a.attendedAt instanceof Timestamp ? a.attendedAt.toDate() : new Date(a.attendedAt)
    // Get week number
    const startOfWeek = new Date(date)
    startOfWeek.setDate(date.getDate() - date.getDay())
    const weekKey = startOfWeek.toISOString().split('T')[0]
    weekCounts[weekKey] = (weekCounts[weekKey] || 0) + 1
  })

  // Check consecutive weeks with at least 1 meeting
  const weeks = Object.keys(weekCounts).sort().reverse()

  let streak = 0
  const today = new Date()
  const currentWeekStart = new Date(today)
  currentWeekStart.setDate(today.getDate() - today.getDay())

  let expectedWeek = new Date(currentWeekStart)

  for (const weekKey of weeks) {
    const weekDate = new Date(weekKey)
    expectedWeek.setHours(0, 0, 0, 0)
    weekDate.setHours(0, 0, 0, 0)

    if (weekDate.getTime() === expectedWeek.getTime()) {
      streak++
      expectedWeek.setDate(expectedWeek.getDate() - 7)
    } else if (weekDate.getTime() < expectedWeek.getTime()) {
      break
    }
  }

  return streak
}

// =============================================================================
// MAIN HOOK
// =============================================================================

export function useAIContext(): AIContextState & {
  refresh: () => void
  getContextForPrompt: () => string
} {
  // Raw data state
  const [userData, setUserData] = useState<RawUserData | null>(null)
  const [checkIns, setCheckIns] = useState<RawCheckIn[]>([])
  const [habits, setHabits] = useState<RawHabit[]>([])
  const [habitCompletions, setHabitCompletions] = useState<RawHabitCompletion[]>([])
  const [reflections, setReflections] = useState<RawReflection[]>([])
  const [gratitudes, setGratitudes] = useState<RawGratitude[]>([])
  const [breakthroughs, setBreakthroughs] = useState<RawBreakthrough[]>([])
  const [goals, setGoals] = useState<RawGoal[]>([])
  const [milestones, setMilestones] = useState<RawMilestone[]>([])
  const [meetingAttendance, setMeetingAttendance] = useState<RawMeetingAttendance[]>([])
  const [aiResponses, setAIResponses] = useState<RawAIResponse[]>([])
  const [coach, setCoach] = useState<RawCoach | null>(null)
  const [assignments, setAssignments] = useState<RawAssignment[]>([])
  const [promptUsage, setPromptUsage] = useState<RawAIPromptUsage | null>(null)
  const [todayOracle, setTodayOracle] = useState<RawOracle | null>(null)

  // Loading state
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  // Load user data
  useEffect(() => {
    const userId = auth.currentUser?.uid
    if (!userId) {
      setLoading(false)
      return
    }

    const loadUserData = async () => {
      try {
        const userDoc = await getDoc(doc(db, 'users', userId))
        if (userDoc.exists()) {
          setUserData(userDoc.data() as RawUserData)
        }
      } catch (err) {
        console.error('Error loading user data for AI context:', err)
      }
    }

    loadUserData()
  }, [])

  // Load check-ins (30 days)
  useEffect(() => {
    const userId = auth.currentUser?.uid
    if (!userId) return

    const thirtyDaysAgo = getDateDaysAgo(30)
    const q = query(
      collection(db, 'checkIns'),
      where('userId', '==', userId),
      where('createdAt', '>=', Timestamp.fromDate(thirtyDaysAgo)),
      orderBy('createdAt', 'desc')
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as RawCheckIn[]
      setCheckIns(data)
      setLoading(false)
      setLastUpdated(new Date())
    }, (err) => {
      console.error('Error loading check-ins for AI context:', err)
      setError('Failed to load check-in data')
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  // Load habits
  useEffect(() => {
    const userId = auth.currentUser?.uid
    if (!userId) return

    const q = query(
      collection(db, 'habits'),
      where('userId', '==', userId),
      where('isActive', '==', true)
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as RawHabit[]
      setHabits(data)
    })

    return () => unsubscribe()
  }, [])

  // Load habit completions (30 days)
  useEffect(() => {
    const userId = auth.currentUser?.uid
    if (!userId) return

    const thirtyDaysAgo = getDateDaysAgo(30)
    const q = query(
      collection(db, 'habitCompletions'),
      where('userId', '==', userId),
      where('completedAt', '>=', Timestamp.fromDate(thirtyDaysAgo)),
      orderBy('completedAt', 'desc')
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => {
        const docData = doc.data()
        return {
          habitId: docData.habitId as string,
          completedAt: docData.completedAt as Timestamp | Date,
        }
      })
      setHabitCompletions(data)
    })

    return () => unsubscribe()
  }, [])

  // Load reflections (30 days)
  useEffect(() => {
    const userId = auth.currentUser?.uid
    if (!userId) return

    const thirtyDaysAgo = getDateDaysAgo(30)
    const q = query(
      collection(db, 'reflections'),
      where('userId', '==', userId),
      where('createdAt', '>=', Timestamp.fromDate(thirtyDaysAgo)),
      orderBy('createdAt', 'desc'),
      limit(50)
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as RawReflection[]
      setReflections(data)
    })

    return () => unsubscribe()
  }, [])

  // Load gratitudes (30 days)
  useEffect(() => {
    const userId = auth.currentUser?.uid
    if (!userId) return

    const thirtyDaysAgo = getDateDaysAgo(30)
    const q = query(
      collection(db, 'gratitudes'),
      where('userId', '==', userId),
      where('createdAt', '>=', Timestamp.fromDate(thirtyDaysAgo)),
      orderBy('createdAt', 'desc'),
      limit(50)
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as RawGratitude[]
      setGratitudes(data)
    })

    return () => unsubscribe()
  }, [])

  // Load breakthroughs
  useEffect(() => {
    const userId = auth.currentUser?.uid
    if (!userId) return

    const q = query(
      collection(db, 'breakthroughs'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(10)
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as RawBreakthrough[]
      setBreakthroughs(data)
    })

    return () => unsubscribe()
  }, [])

  // Load goals
  useEffect(() => {
    const userId = auth.currentUser?.uid
    if (!userId) return

    const q = query(
      collection(db, 'goals'),
      where('userId', '==', userId),
      where('status', '==', 'active'),
      orderBy('createdAt', 'desc')
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as RawGoal[]
      setGoals(data)
    })

    return () => unsubscribe()
  }, [])

  // Load milestones
  useEffect(() => {
    const userId = auth.currentUser?.uid
    if (!userId) return

    const q = query(
      collection(db, 'milestones'),
      where('userId', '==', userId)
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as RawMilestone[]
      setMilestones(data)
    })

    return () => unsubscribe()
  }, [])

  // Load meeting attendance (30 days)
  useEffect(() => {
    const userId = auth.currentUser?.uid
    if (!userId) return

    const thirtyDaysAgo = getDateDaysAgo(30)
    const q = query(
      collection(db, 'meetingAttendance'),
      where('userId', '==', userId),
      where('attendedAt', '>=', Timestamp.fromDate(thirtyDaysAgo)),
      orderBy('attendedAt', 'desc')
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as RawMeetingAttendance[]
      setMeetingAttendance(data)
    })

    return () => unsubscribe()
  }, [])

  // Load previous AI responses (for continuity - last 10)
  useEffect(() => {
    const userId = auth.currentUser?.uid
    if (!userId) return

    const loadAIResponses = async () => {
      try {
        const q = query(
          collection(db, `users/${userId}/aiResponses`),
          orderBy('createdAt', 'desc'),
          limit(10)
        )
        const snapshot = await getDocs(q)
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as RawAIResponse[]
        setAIResponses(data)
      } catch (err) {
        // aiResponses collection may not exist yet - that's ok
        console.debug('No previous AI responses found:', err)
      }
    }

    loadAIResponses()
  }, [])

  // Load coach info
  useEffect(() => {
    const userId = auth.currentUser?.uid
    if (!userId) return

    const loadCoach = async () => {
      try {
        // Get user's assigned coach
        const userDoc = await getDoc(doc(db, 'users', userId))
        if (userDoc.exists()) {
          const coachId = userDoc.data().coachId
          if (coachId) {
            const coachDoc = await getDoc(doc(db, 'users', coachId))
            if (coachDoc.exists()) {
              const coachData = coachDoc.data()
              setCoach({
                id: coachId,
                firstName: coachData.firstName || '',
                lastName: coachData.lastName || '',
                email: coachData.email || '',
              })
            }
          }
        }
      } catch (err) {
        console.debug('Error loading coach info:', err)
      }
    }

    loadCoach()
  }, [])

  // Load assignments
  useEffect(() => {
    const userId = auth.currentUser?.uid
    if (!userId) return

    const q = query(
      collection(db, 'assignments'),
      where('assignedTo', '==', userId),
      where('status', 'in', ['pending', 'overdue']),
      orderBy('createdAt', 'desc'),
      limit(20)
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as RawAssignment[]
      setAssignments(data)
    }, (err) => {
      console.debug('Error loading assignments:', err)
    })

    return () => unsubscribe()
  }, [])

  // Load today's prompt usage
  useEffect(() => {
    const userId = auth.currentUser?.uid
    if (!userId) return

    const today = new Date().toISOString().split('T')[0]
    const loadPromptUsage = async () => {
      try {
        const usageDoc = await getDoc(doc(db, `aiPromptUsage/${userId}/daily/${today}`))
        if (usageDoc.exists()) {
          setPromptUsage(usageDoc.data() as RawAIPromptUsage)
        } else {
          setPromptUsage({ promptCardsUsed: 0, anchorMessagesUsed: 0, oracleRegenerated: false })
        }
      } catch (err) {
        console.debug('Error loading prompt usage:', err)
        setPromptUsage({ promptCardsUsed: 0, anchorMessagesUsed: 0, oracleRegenerated: false })
      }
    }

    loadPromptUsage()
  }, [])

  // Load today's oracle status
  useEffect(() => {
    const userId = auth.currentUser?.uid
    if (!userId) return

    const today = new Date().toISOString().split('T')[0]
    const loadOracle = async () => {
      try {
        const oracleDoc = await getDoc(doc(db, `userOracles/${userId}/daily/${today}`))
        if (oracleDoc.exists()) {
          setTodayOracle(oracleDoc.data() as RawOracle)
        }
      } catch (err) {
        console.debug('Error loading oracle status:', err)
      }
    }

    loadOracle()
  }, [])

  // Compute AI Context
  const context = useMemo<AIContext | null>(() => {
    if (!userData) return null

    const sobrietyDays = calculateDaysSober(userData.sobrietyDate || userData.recoveryDate)

    // ==========================================================================
    // TODAY'S DATA
    // ==========================================================================

    // Find today's morning and evening check-ins
    const todayMorningCheckIn = checkIns.find((c) => isToday(c.createdAt) && c.type === 'morning') || null
    const todayEveningCheckIn = checkIns.find((c) => isToday(c.createdAt) && c.type === 'evening') || null
    // Fallback: if no type, treat any today's check-in as morning
    const todayAnyCheckIn = checkIns.find((c) => isToday(c.createdAt)) || null
    const effectiveMorningCheckIn = todayMorningCheckIn || (todayAnyCheckIn && !todayEveningCheckIn ? todayAnyCheckIn : null)

    // Today's habits
    const habitsCompletedToday = getHabitsCompletedToday(habits, habitCompletions)
    const habitsMissedToday = getHabitsMissedToday(habits, habitCompletions)

    // Today's reflection (evening)
    const todayReflection = reflections.find((r) => isToday(r.createdAt)) || null

    // ==========================================================================
    // 7-DAY RECENT DATA
    // ==========================================================================

    const sevenDaysAgo = getDateDaysAgo(7)
    const weekCheckIns = checkIns.filter((c) => {
      const date = c.createdAt instanceof Timestamp ? c.createdAt.toDate() : new Date(c.createdAt)
      return date >= sevenDaysAgo
    })

    const weekMoods = weekCheckIns.filter((c) => c.mood != null).map((c) => c.mood)
    const weekAnxiety = weekCheckIns.filter((c) => c.anxiety != null).map((c) => c.anxiety!)
    const weekCraving = weekCheckIns.filter((c) => c.craving != null).map((c) => c.craving!)
    const weekSleep = weekCheckIns.filter((c) => c.sleep != null).map((c) => c.sleep!)

    // Calculate trends (30 day)
    const monthMoods = checkIns.filter((c) => c.mood != null).map((c) => c.mood)

    // Check-in streak and days since last
    const { current: checkInStreak, atRisk: streakAtRisk } = calculateCheckInStreak(checkIns)
    const daysWithoutCheckIn = calculateDaysSinceLastCheckIn(checkIns)
    const daysWithoutMeeting = calculateDaysSinceLastMeeting(meetingAttendance)
    const daysWithoutReflection = calculateDaysSinceLastReflection(reflections)

    // Last check-in details
    const sortedCheckIns = [...checkIns].sort((a, b) => {
      const dateA = a.createdAt instanceof Timestamp ? a.createdAt.toDate() : new Date(a.createdAt)
      const dateB = b.createdAt instanceof Timestamp ? b.createdAt.toDate() : new Date(b.createdAt)
      return dateB.getTime() - dateA.getTime()
    })
    const lastCheckIn = sortedCheckIns[0] || null
    const lastCheckInDate = lastCheckIn ? toDate(lastCheckIn.createdAt) : null

    // Last meeting details
    const sortedMeetings = [...meetingAttendance].sort((a, b) => {
      const dateA = a.attendedAt instanceof Timestamp ? a.attendedAt.toDate() : new Date(a.attendedAt)
      const dateB = b.attendedAt instanceof Timestamp ? b.attendedAt.toDate() : new Date(b.attendedAt)
      return dateB.getTime() - dateA.getTime()
    })
    const lastMeeting = sortedMeetings[0] || null
    const lastMeetingDate = lastMeeting ? toDate(lastMeeting.attendedAt) : null

    // Last reflection
    const sortedReflections = [...reflections].sort((a, b) => {
      const dateA = a.createdAt instanceof Timestamp ? a.createdAt.toDate() : new Date(a.createdAt)
      const dateB = b.createdAt instanceof Timestamp ? b.createdAt.toDate() : new Date(b.createdAt)
      return dateB.getTime() - dateA.getTime()
    })
    const lastReflection = sortedReflections[0] || null

    // Craving spike detection
    const highestCraving = Math.max(...weekCheckIns.map((c) => c.craving ?? 0), 0)
    const highestCravingCheckIn = weekCheckIns.find((c) => c.craving === highestCraving)
    const highestCravingDate = highestCravingCheckIn ? toDate(highestCravingCheckIn.createdAt) : null

    // Recent gratitudes (actual text)
    const sortedGratitudes = [...gratitudes].sort((a, b) => {
      const dateA = a.createdAt instanceof Timestamp ? a.createdAt.toDate() : new Date(a.createdAt)
      const dateB = b.createdAt instanceof Timestamp ? b.createdAt.toDate() : new Date(b.createdAt)
      return dateB.getTime() - dateA.getTime()
    })
    const recentGratitudeTexts = sortedGratitudes
      .slice(0, 5)
      .map((g) => g.text)
      .filter((text): text is string => text != null && text.length > 0)

    // Week reflections count
    const weekReflections = reflections.filter((r) => {
      const date = r.createdAt instanceof Timestamp ? r.createdAt.toDate() : new Date(r.createdAt)
      return date >= sevenDaysAgo
    })
    const weekGratitudes = gratitudes.filter((g) => {
      const date = g.createdAt instanceof Timestamp ? g.createdAt.toDate() : new Date(g.createdAt)
      return date >= sevenDaysAgo
    })

    // ==========================================================================
    // PATTERNS
    // ==========================================================================

    const { best: bestDayOfWeek, worst: worstDayOfWeek } = calculateBestWorstDays(checkIns)
    const cravingSpikeRecent = detectCravingSpike(checkIns, 3)
    const sleepDeclineTrend = detectSleepDecline(checkIns)

    // ==========================================================================
    // HABIT ANALYTICS
    // ==========================================================================

    const habitCompletionRate = calculateHabitCompletionRate(habits, habitCompletions)
    const habitStreaks = calculateHabitStreaks(habits, habitCompletions)
    const topHabit = habitStreaks.length > 0 ? habitStreaks[0].name : null

    // Reflection themes
    const reflectionTexts = reflections
      .map((r) => [r.text, r.gratitude, r.challenge].filter(Boolean).join(' '))
      .filter((t) => t.length > 0)
    const themes = extractThemes(reflectionTexts)

    // ==========================================================================
    // MEETING STATS
    // ==========================================================================

    const meetingStreak = calculateMeetingStreak(meetingAttendance)
    const weeklyMeetingAvg = meetingAttendance.length / 4 // 30 days ~ 4 weeks
    const weekMeetings = meetingAttendance.filter((m) => {
      const date = m.attendedAt instanceof Timestamp ? m.attendedAt.toDate() : new Date(m.attendedAt)
      return date >= sevenDaysAgo
    })

    // ==========================================================================
    // GOAL STATS
    // ==========================================================================

    const completedGoals = goals.filter((g) => g.status === 'completed').length
    const totalGoals = goals.length
    const goalCompletionRate = totalGoals > 0 ? completedGoals / totalGoals : 0

    // ==========================================================================
    // MILESTONES
    // ==========================================================================

    const nextMilestone = getNextMilestone(sobrietyDays)
    const daysToNextMilestone = nextMilestone ? nextMilestone.days - sobrietyDays : 0
    const recentlyAchievedMilestones = milestones
      .filter((m) => m.achievedAt)
      .map((m) => m.days)
      .slice(0, 3)

    // ==========================================================================
    // PREVIOUS AI INSIGHTS (for continuity)
    // ==========================================================================

    const lastInsight = aiResponses[0] || null
    const lastInsightDate = lastInsight ? toDate(lastInsight.createdAt) : null

    // ==========================================================================
    // STATUS FLAGS
    // ==========================================================================

    const needsAttention =
      daysWithoutCheckIn >= 3 ||
      daysWithoutMeeting >= 14 ||
      cravingSpikeRecent ||
      sleepDeclineTrend

    // ==========================================================================
    // BUILD CONTEXT OBJECT (BeaconContext format)
    // ==========================================================================

    return {
      // USER IDENTITY
      user: {
        firstName: userData.firstName || 'Friend',
        odid: userData.odid,
        sobrietyDays,
        sobrietyDate: userData.sobrietyDate || userData.recoveryDate,
        substance: userData.substance,
        isVeteran: userData.isVeteran,
        isFirstResponder: userData.isFirstResponder,
        upcomingMilestones: calculateUpcomingMilestones(sobrietyDays, milestones),
      },

      // TODAY'S STATUS
      today: {
        hasCompletedMorningCheckIn: effectiveMorningCheckIn !== null,
        hasCompletedEveningCheckIn: todayEveningCheckIn !== null || todayReflection !== null,
        morningCheckIn: effectiveMorningCheckIn ? {
          mood: effectiveMorningCheckIn.mood,
          anxiety: effectiveMorningCheckIn.anxiety,
          craving: effectiveMorningCheckIn.craving,
          sleep: effectiveMorningCheckIn.sleep,
          energy: effectiveMorningCheckIn.energy,
          notes: effectiveMorningCheckIn.notes,
        } : null,
        eveningCheckIn: todayReflection ? {
          dayRating: todayReflection.dayRating,
          gratitude: todayReflection.gratitude,
          challenge: todayReflection.challenge,
          tomorrowGoal: todayReflection.tomorrowGoal,
        } : null,
        habitsCompletedToday,
        habitsMissedToday,
      },

      // RECENT HISTORY (7 days) - with specific dates and text
      recent: {
        checkInCount: weekCheckIns.length,
        checkInRate: weekCheckIns.length / 7,
        lastCheckInDate: lastCheckInDate ? formatDateForAI(lastCheckInDate) : null,
        lastCheckInDaysAgo: daysWithoutCheckIn,
        lastCheckInMood: lastCheckIn?.mood ?? null,
        lastCheckInNotes: lastCheckIn?.notes ?? null,
        moodAvg: calculateAverage(weekMoods),
        moodTrend: calculateTrend(monthMoods),
        cravingAvg: calculateAverage(weekCraving),
        cravingHigh: highestCraving,
        cravingHighDate: highestCravingDate ? formatDateForAI(highestCravingDate) : null,
        sleepAvg: calculateAverage(weekSleep),
        anxietyAvg: calculateAverage(weekAnxiety),
        reflectionCount: weekReflections.length,
        lastReflectionDate: lastReflection ? formatDateForAI(toDate(lastReflection.createdAt)) : null,
        lastReflectionGratitude: lastReflection?.gratitude ?? null,
        gratitudeCount: weekGratitudes.length,
        recentGratitudes: recentGratitudeTexts,
        meetingCount: weekMeetings.length,
        lastMeetingDate: lastMeetingDate ? formatDateForAI(lastMeetingDate) : null,
        lastMeetingName: lastMeeting?.meetingName ?? null,
      },

      // PATTERNS
      patterns: {
        bestDayOfWeek,
        worstDayOfWeek,
        sleepMoodCorrelation: 0, // TODO: implement correlation calculation
        meetingCravingCorrelation: 0, // TODO: implement correlation calculation
        riskDays: [], // TODO: identify risk patterns
        effectiveCoping: [], // TODO: extract from check-in notes
      },

      // PREVIOUS AI INSIGHTS (for continuity)
      previousInsights: {
        lastInsightDate: lastInsightDate ? formatDateForAI(lastInsightDate) : null,
        lastInsightText: lastInsight?.response ?? null,
        recentInsights: aiResponses.slice(0, 5).map((r) => ({
          type: r.type,
          prompt: r.prompt,
          response: r.response,
          createdAt: formatDateForAI(toDate(r.createdAt)),
        })),
      },

      // STATUS FLAGS
      flags: {
        isWeekend: isWeekend(),
        daysWithoutCheckIn: Math.max(0, daysWithoutCheckIn),
        daysWithoutMeeting: Math.max(0, daysWithoutMeeting),
        daysWithoutReflection: Math.max(0, daysWithoutReflection),
        cravingSpikeRecent,
        sleepDeclineTrend,
        needsAttention,
        streakAtRisk,
      },

      // MILESTONES
      milestones: {
        nextMilestone: nextMilestone?.name ?? null,
        daysUntilNext: daysToNextMilestone,
        recentAchieved: recentlyAchievedMilestones,
      },

      // COACH INFO
      coach: {
        hasCoach: coach !== null,
        coachName: coach ? `${coach.firstName} ${coach.lastName}`.trim() : null,
        coachFirstName: coach?.firstName ?? null,
      },

      // ASSIGNMENTS/TASKS
      assignments: {
        pendingCount: assignments.filter((a) => a.status === 'pending').length,
        overdueCount: assignments.filter((a) => a.status === 'overdue').length,
        overdueAssignments: assignments
          .filter((a) => a.status === 'overdue')
          .map((a) => ({ id: a.id, title: a.title })),
      },

      // AI USAGE LIMITS
      aiUsage: {
        promptCardsUsedToday: promptUsage?.promptCardsUsed ?? 0,
        anchorMessagesUsedToday: promptUsage?.anchorMessagesUsed ?? 0,
        oracleRevealedToday: todayOracle?.revealed ?? false,
        lastOracleDate: todayOracle?.revealedAt
          ? formatDateForAI(toDate(todayOracle.revealedAt))
          : null,
      },

      // MEETINGS EXTENDED
      meetingsExtended: {
        thisWeek: weekMeetings.length,
        lastWeek: meetingAttendance.filter((m) => {
          const date = m.attendedAt instanceof Timestamp ? m.attendedAt.toDate() : new Date(m.attendedAt)
          const twoWeeksAgo = getDateDaysAgo(14)
          return date >= twoWeeksAgo && date < sevenDaysAgo
        }).length,
        preferredTypes: [...new Set(meetingAttendance.map((m) => m.meetingType).filter(Boolean))].slice(0, 3) as string[],
      },

      // ==========================================================================
      // LEGACY OBJECTS (for backwards compatibility with existing components)
      // ==========================================================================

      checkIns: {
        today: effectiveMorningCheckIn
          ? {
              mood: effectiveMorningCheckIn.mood,
              anxiety: effectiveMorningCheckIn.anxiety,
              craving: effectiveMorningCheckIn.craving,
              sleep: effectiveMorningCheckIn.sleep,
              energy: effectiveMorningCheckIn.energy,
            }
          : null,
        weekAverage: {
          mood: calculateAverage(weekMoods),
          anxiety: calculateAverage(weekAnxiety),
          craving: calculateAverage(weekCraving),
          sleep: calculateAverage(weekSleep),
        },
        monthTrend: {
          mood: calculateTrend(monthMoods),
          anxiety: calculateTrend(checkIns.filter((c) => c.anxiety != null).map((c) => c.anxiety!)),
          craving: calculateTrend(checkIns.filter((c) => c.craving != null).map((c) => c.craving!)),
          sleep: calculateTrend(checkIns.filter((c) => c.sleep != null).map((c) => c.sleep!)),
        },
      },
      habits: {
        completionRate: habitCompletionRate,
        streaks: habitStreaks.map((h) => ({ name: h.name, days: h.days })),
        topHabit,
      },
      reflections: {
        recentThemes: themes,
        gratitudeCount: gratitudes.length,
        breakthroughCount: breakthroughs.length,
      },
      meetings: {
        weeklyAverage: weeklyMeetingAvg,
        streak: meetingStreak,
        lastAttended: lastMeetingDate,
      },
      goals: {
        activeCount: goals.length,
        completionRate: goalCompletionRate,
        nearestDeadline: goals.length > 0 && goals[0].targetDate
          ? (goals[0].targetDate instanceof Timestamp
              ? goals[0].targetDate.toDate()
              : new Date(goals[0].targetDate))
          : null,
      },
      context: {
        isWeekend: isWeekend(),
        daysToNextMilestone,
        currentStreak: checkInStreak,
        streakAtRisk,
      },
    }
  }, [
    userData,
    checkIns,
    habits,
    habitCompletions,
    reflections,
    gratitudes,
    breakthroughs,
    goals,
    milestones,
    meetingAttendance,
    aiResponses,
    coach,
    assignments,
    promptUsage,
    todayOracle,
  ])

  // Build context string
  const contextString = useMemo(() => {
    if (!context) return ''
    return buildContextString(context)
  }, [context])

  // Refresh function
  const refresh = useCallback(() => {
    setLastUpdated(new Date())
  }, [])

  // Get context for prompt (callable helper)
  const getContextForPrompt = useCallback(() => {
    return contextString
  }, [contextString])

  return {
    context,
    contextString,
    loading,
    error,
    lastUpdated,
    refresh,
    getContextForPrompt,
  }
}

export default useAIContext
