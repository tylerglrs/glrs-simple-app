import { useState, useEffect, useCallback } from 'react'
import {
  collection,
  doc,
  getDoc,
  query,
  where,
  getDocs,
  Timestamp,
  onSnapshot,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useAuth } from '@/contexts/AuthContext'
import type {
  ProfileStats,
  ReflectionStreakData,
  CoachInfo,
  UseProfileDataReturn,
} from '../types'

// ============================================================
// HELPER FUNCTIONS
// ============================================================

/**
 * Calculate days between two dates
 */
function daysBetween(date1: Date, date2: Date): number {
  const oneDay = 24 * 60 * 60 * 1000
  return Math.floor(Math.abs((date1.getTime() - date2.getTime()) / oneDay))
}

/**
 * Get date string in YYYY-MM-DD format
 */
function toDateString(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

/**
 * Calculate profile completion percentage
 */
function calculateProfileCompletion(userData: Record<string, unknown>): number {
  const fields = [
    'firstName',
    'lastName',
    'phone',
    'sobrietyDate',
    'substance',
    'dailyCost',
    'emergencyContacts',
    'address',
    'profileImageUrl',
    'dateOfBirth',
  ]

  let completed = 0
  for (const field of fields) {
    const value = userData[field]
    if (value !== undefined && value !== null && value !== '') {
      // Special check for arrays and objects
      if (Array.isArray(value)) {
        if (value.length > 0) completed++
      } else if (typeof value === 'object') {
        const objValue = value as Record<string, unknown>
        if (objValue.city || objValue.street) completed++
      } else {
        completed++
      }
    }
  }

  return Math.round((completed / fields.length) * 100)
}

/**
 * Calculate reflection streaks from check-ins
 */
function calculateReflectionStreaks(
  checkInDates: string[]
): ReflectionStreakData {
  if (checkInDates.length === 0) {
    return { currentStreak: 0, longestStreak: 0, allStreaks: [] }
  }

  // Sort dates newest first
  const sortedDates = [...checkInDates].sort((a, b) => b.localeCompare(a))

  const today = new Date()
  const todayStr = toDateString(today)
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayStr = toDateString(yesterday)

  const allStreaks: Array<{ length: number; startDate: string; endDate: string }> = []
  let tempStreak = { length: 0, startDate: '', endDate: '' }

  for (let i = 0; i < sortedDates.length; i++) {
    const currentDate = sortedDates[i]

    if (tempStreak.length === 0) {
      tempStreak = { length: 1, startDate: currentDate, endDate: currentDate }
    } else {
      const current = new Date(currentDate)
      const previous = new Date(tempStreak.startDate)
      const diffDays = Math.floor(
        (previous.getTime() - current.getTime()) / (1000 * 60 * 60 * 24)
      )

      if (diffDays === 1) {
        tempStreak.length++
        tempStreak.startDate = currentDate
      } else {
        allStreaks.push({ ...tempStreak })
        tempStreak = { length: 1, startDate: currentDate, endDate: currentDate }
      }
    }

    if (i === sortedDates.length - 1) {
      allStreaks.push({ ...tempStreak })
    }
  }

  // Calculate longest streak
  const longestStreak = Math.max(...allStreaks.map((s) => s.length), 0)

  // Calculate current streak (must include today or yesterday)
  let currentStreak = 0
  if (allStreaks.length > 0) {
    const mostRecent = allStreaks[0]
    if (mostRecent.endDate === todayStr || mostRecent.endDate === yesterdayStr) {
      currentStreak = mostRecent.length
    }
  }

  // Filter to streaks of 2+ days
  const filteredStreaks = allStreaks
    .filter((s) => s.length >= 2)
    .sort((a, b) => b.length - a.length)

  return { currentStreak, longestStreak, allStreaks: filteredStreaks }
}

// ============================================================
// MAIN HOOK
// ============================================================

/**
 * Hook for loading profile statistics and related data
 *
 * Aggregates data from:
 * - users collection (profile data, coach assignment)
 * - checkIns collection (check-in rate, mood, streaks)
 * - assignments collection (task completion)
 * - streaks collection (current streak)
 *
 * @returns Profile statistics and helper functions
 */
export function useProfileData(): UseProfileDataReturn {
  const { user, userData } = useAuth()

  // Stats state
  const [stats, setStats] = useState<ProfileStats>({
    checkInRate: 0,
    taskCompletionRate: 0,
    currentStreak: 0,
    avgMood: 0,
    daysActive: 0,
    profileCompletion: 0,
  })

  // Streak data state
  const [streakData, setStreakData] = useState<ReflectionStreakData>({
    currentStreak: 0,
    longestStreak: 0,
    allStreaks: [],
  })

  // Coach info state
  const [coachInfo, setCoachInfo] = useState<CoachInfo | null>(null)

  // Calendar connection states
  const [googleConnected, setGoogleConnected] = useState(false)
  const [appleConnected, setAppleConnected] = useState(false)

  // Loading and error states
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // ============================================================
  // LOAD PROFILE STATS
  // ============================================================

  const loadStats = useCallback(async () => {
    if (!user?.uid) return

    try {
      // Get user document for account creation date
      const userDoc = await getDoc(doc(db, 'users', user.uid))
      if (!userDoc.exists()) {
        throw new Error('User document not found')
      }

      const userDataDoc = userDoc.data()
      const accountCreated = userDataDoc.createdAt?.toDate() || new Date()
      const today = new Date()
      const daysActive = daysBetween(accountCreated, today)
      const daysToCheck = Math.min(daysActive, 30)

      // Calculate profile completion
      const profileCompletion = calculateProfileCompletion(userDataDoc)

      // Skip stats if account is less than 1 day old
      if (daysToCheck < 1) {
        setStats({
          checkInRate: 0,
          taskCompletionRate: 0,
          currentStreak: 0,
          avgMood: 0,
          daysActive: 0,
          profileCompletion,
        })
        return
      }

      // Calculate date range for check-ins
      const dateToCheckFrom = new Date()
      dateToCheckFrom.setDate(dateToCheckFrom.getDate() - daysToCheck)

      // Query check-ins
      const checkInsQuery = query(
        collection(db, 'checkIns'),
        where('userId', '==', user.uid),
        where('createdAt', '>=', Timestamp.fromDate(dateToCheckFrom))
      )
      const checkInsSnap = await getDocs(checkInsQuery)

      // Count morning check-ins and calculate mood average
      let morningCheckInCount = 0
      let totalMood = 0
      let moodCount = 0

      checkInsSnap.forEach((docSnap) => {
        const data = docSnap.data()
        if (data.morningData) {
          morningCheckInCount++
          if (data.morningData.mood) {
            totalMood += data.morningData.mood
            moodCount++
          }
        }
      })

      // Calculate check-in rate (capped at 100%)
      const checkInRate = Math.min(
        100,
        Math.round((morningCheckInCount / daysToCheck) * 100)
      )

      // Calculate average mood
      const avgMood = moodCount > 0 ? Math.round((totalMood / moodCount) * 10) / 10 : 0

      // Get current streak from streaks collection
      const streakDoc = await getDoc(doc(db, 'streaks', user.uid))
      const currentStreak = streakDoc.exists()
        ? streakDoc.data().currentStreak || 0
        : 0

      // Calculate task completion rate
      const assignmentsQuery = query(
        collection(db, 'assignments'),
        where('userId', '==', user.uid)
      )
      const assignmentsSnap = await getDocs(assignmentsQuery)

      let totalAssignments = 0
      let completedAssignments = 0
      assignmentsSnap.forEach((docSnap) => {
        totalAssignments++
        if (docSnap.data().status === 'completed') {
          completedAssignments++
        }
      })

      // Calculate lifetime task completion
      // Include morning check-ins + evening reflections + assignments
      const allCheckInsQuery = query(
        collection(db, 'checkIns'),
        where('userId', '==', user.uid)
      )
      const allCheckInsSnap = await getDocs(allCheckInsQuery)

      let morningTotal = 0
      let eveningTotal = 0
      allCheckInsSnap.forEach((docSnap) => {
        const data = docSnap.data()
        if (data.morningData) morningTotal++
        if (data.eveningData) eveningTotal++
      })

      const expectedDailyTasks = daysActive * 2 // Morning + evening each day
      const totalExpected = expectedDailyTasks + totalAssignments
      const totalCompleted = morningTotal + eveningTotal + completedAssignments
      const taskCompletionRate =
        totalExpected > 0
          ? Math.round((totalCompleted / totalExpected) * 100)
          : 0

      setStats({
        checkInRate,
        taskCompletionRate,
        currentStreak,
        avgMood,
        daysActive,
        profileCompletion,
      })
    } catch (err) {
      console.error('[useProfileData] Error loading stats:', err)
      setError(err instanceof Error ? err.message : 'Failed to load profile stats')
    }
  }, [user?.uid])

  // ============================================================
  // LOAD REFLECTION STREAKS
  // ============================================================

  const loadStreakData = useCallback(async () => {
    if (!user?.uid) return

    try {
      // Get all check-ins with evening data
      const checkInsQuery = query(
        collection(db, 'checkIns'),
        where('userId', '==', user.uid)
      )
      const checkInsSnap = await getDocs(checkInsQuery)

      // Extract dates with reflections
      const reflectionDates: string[] = []
      checkInsSnap.forEach((docSnap) => {
        const data = docSnap.data()
        if (data.eveningData && data.createdAt) {
          const date = data.createdAt.toDate()
          const dateStr = toDateString(date)
          if (!reflectionDates.includes(dateStr)) {
            reflectionDates.push(dateStr)
          }
        }
      })

      const streaks = calculateReflectionStreaks(reflectionDates)
      setStreakData(streaks)
    } catch (err) {
      console.error('[useProfileData] Error loading streaks:', err)
    }
  }, [user?.uid])

  // ============================================================
  // LOAD COACH INFO
  // ============================================================

  const loadCoachInfo = useCallback(async () => {
    if (!userData?.coachId) {
      setCoachInfo(null)
      return
    }

    try {
      const coachDoc = await getDoc(doc(db, 'users', userData.coachId))
      if (coachDoc.exists()) {
        const data = coachDoc.data()
        setCoachInfo({
          id: coachDoc.id,
          firstName: data.firstName,
          lastName: data.lastName,
          displayName: data.displayName,
          email: data.email,
          phone: data.phone,
          profileImageUrl: data.profileImageUrl,
        })
      }
    } catch (err) {
      console.error('[useProfileData] Error loading coach info:', err)
    }
  }, [userData?.coachId])

  // ============================================================
  // INITIAL LOAD & REALTIME UPDATES
  // ============================================================

  useEffect(() => {
    if (!user?.uid) {
      setLoading(false)
      return
    }

    // Calendar connections are loaded from a separate collection
    // For now, set to false - will be updated when calendar modals are implemented
    setGoogleConnected(false)
    setAppleConnected(false)

    // Load all data
    const loadAll = async () => {
      setLoading(true)
      setError(null)

      await Promise.all([loadStats(), loadStreakData(), loadCoachInfo()])

      // Load calendar connections
      try {
        const calendarQuery = query(
          collection(db, 'calendarConnections'),
          where('userId', '==', user.uid)
        )
        const calendarSnap = await getDocs(calendarQuery)
        calendarSnap.forEach((docSnap) => {
          const data = docSnap.data()
          if (data.provider === 'google' && data.syncEnabled) {
            setGoogleConnected(true)
          }
          if (data.provider === 'apple' && data.syncEnabled) {
            setAppleConnected(true)
          }
        })
      } catch (err) {
        console.warn('[useProfileData] Could not load calendar connections:', err)
      }

      setLoading(false)
    }

    loadAll()

    // Set up realtime listener for check-ins (to update streaks)
    const checkInsQuery = query(
      collection(db, 'checkIns'),
      where('userId', '==', user.uid)
    )

    const unsubscribe = onSnapshot(checkInsQuery, () => {
      // Reload streaks when check-ins change
      loadStreakData()
      loadStats()
    })

    return () => unsubscribe()
  }, [user?.uid, userData, loadStats, loadStreakData, loadCoachInfo])

  // ============================================================
  // REFRESH FUNCTION
  // ============================================================

  const refreshStats = useCallback(async () => {
    setLoading(true)
    setError(null)

    await Promise.all([loadStats(), loadStreakData(), loadCoachInfo()])

    setLoading(false)
  }, [loadStats, loadStreakData, loadCoachInfo])

  // ============================================================
  // RETURN
  // ============================================================

  return {
    stats,
    streakData,
    coachInfo,
    googleConnected,
    appleConnected,
    loading,
    error,
    refreshStats,
  }
}

export default useProfileData
