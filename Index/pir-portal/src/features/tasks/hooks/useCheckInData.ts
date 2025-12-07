import { useState, useEffect, useCallback } from 'react'
import {
  db,
  collection,
  doc,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  getDocs,
  onSnapshot,
  serverTimestamp,
  Timestamp,
  CURRENT_TENANT,
} from '@/lib/firebase'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/hooks/use-toast'

// =============================================================================
// TYPES
// =============================================================================

export interface MorningCheckInData {
  mood: number | null // 0-10
  craving: number | null // 0-10
  anxiety: number | null // 0-10
  sleep: number | null // 0-10
  notes?: string
}

export interface EveningReflectionData {
  overallDay: number | null // 0-10
  promptResponse?: string
  challenges?: string
  gratitude?: string
  tomorrowGoal?: string
  gratitudeTheme?: string
}

export interface CheckInDocument {
  id: string
  userId: string
  tenantId: string
  type: 'morning' | 'evening' | 'both'
  morningData?: MorningCheckInData
  eveningData?: EveningReflectionData
  mood?: number
  craving?: number
  anxiety?: number
  sleep?: number
  overallDay?: number
  createdAt: Timestamp
  updatedAt?: Timestamp
}

export interface CheckInStatus {
  morning: boolean
  evening: boolean
}

export interface WeeklyStats {
  checkRate: number // 0-100
  avgMood: number // 0-10
  checkInCount: number
}

export interface ReflectionStats {
  totalAllTime: number
  totalThisMonth: number
  avgDailyScore: number
  topGratitudeThemes: GratitudeTheme[]
}

export interface GratitudeTheme {
  name: string
  count: number
  lastDate: Date
}

export interface StreakData {
  currentStreak: number
  longestStreak: number
  allStreaks: StreakPeriod[]
}

export interface StreakPeriod {
  length: number
  startDate: string
  endDate: string
}

export interface YesterdayGoal {
  docId: string
  goal: string
  completed: boolean
}

// =============================================================================
// HOOK
// =============================================================================

export function useCheckInData() {
  const { user, userData } = useAuth()
  const { toast } = useToast()

  // State
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Check-in status for today
  const [checkInStatus, setCheckInStatus] = useState<CheckInStatus>({
    morning: false,
    evening: false,
  })

  // Check-in and reflection streaks
  const [checkInStreak, setCheckInStreak] = useState(0)
  const [reflectionStreak, setReflectionStreak] = useState(0)
  const [checkInStreakData, setCheckInStreakData] = useState<StreakData>({
    currentStreak: 0,
    longestStreak: 0,
    allStreaks: [],
  })
  const [reflectionStreakData, setReflectionStreakData] = useState<StreakData>({
    currentStreak: 0,
    longestStreak: 0,
    allStreaks: [],
  })

  // Weekly stats
  const [weeklyStats, setWeeklyStats] = useState<WeeklyStats | null>(null)

  // Reflection stats
  const [reflectionStats, setReflectionStats] = useState<ReflectionStats>({
    totalAllTime: 0,
    totalThisMonth: 0,
    avgDailyScore: 0,
    topGratitudeThemes: [],
  })

  // All reflections
  const [allReflections, setAllReflections] = useState<CheckInDocument[]>([])

  // Yesterday's goal
  const [yesterdayGoal, setYesterdayGoal] = useState<YesterdayGoal | null>(null)

  // Last submitted check-in data (for completion summary)
  const [lastSubmittedCheckIn, setLastSubmittedCheckIn] = useState<MorningCheckInData | null>(null)
  const [lastSubmittedReflection, setLastSubmittedReflection] = useState<EveningReflectionData | null>(null)

  // Yesterday's check-in data (for comparison in completion screen)
  const [yesterdayCheckInData, setYesterdayCheckInData] = useState<{
    mood?: number
    craving?: number
    anxiety?: number
    sleep?: number
  } | null>(null)

  // ==========================================================================
  // CHECK TODAY'S STATUS
  // ==========================================================================

  useEffect(() => {
    if (!user) {
      setCheckInStatus({ morning: false, evening: false })
      return
    }

    const checkTodayStatus = async () => {
      try {
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        const checkInsRef = collection(db, 'checkIns')
        const q = query(
          checkInsRef,
          where('userId', '==', user.uid),
          where('createdAt', '>=', Timestamp.fromDate(today))
        )

        const snapshot = await getDocs(q)

        let morning = false
        let evening = false

        snapshot.forEach((doc) => {
          const data = doc.data()
          if (data.morningData || data.type === 'morning') {
            morning = true
          }
          if (data.eveningData || data.type === 'evening') {
            evening = true
          }
        })

        setCheckInStatus({ morning, evening })
      } catch (err) {
        console.error('[useCheckInData] Error checking today status:', err)
      }
    }

    checkTodayStatus()

    // Set up listener for real-time updates
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const checkInsRef = collection(db, 'checkIns')
    const q = query(
      checkInsRef,
      where('userId', '==', user.uid),
      where('createdAt', '>=', Timestamp.fromDate(today))
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      let morning = false
      let evening = false

      snapshot.forEach((doc) => {
        const data = doc.data()
        if (data.morningData || data.type === 'morning') {
          morning = true
        }
        if (data.eveningData || data.type === 'evening') {
          evening = true
        }
      })

      setCheckInStatus({ morning, evening })
    })

    return () => unsubscribe()
  }, [user])

  // ==========================================================================
  // CALCULATE CHECK-IN STREAKS
  // ==========================================================================

  const calculateCheckInStreaks = useCallback(async () => {
    if (!user) return

    try {
      const checkInsRef = collection(db, 'checkIns')
      const q = query(
        checkInsRef,
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc')
      )

      const snapshot = await getDocs(q)

      // Extract unique dates with morning check-ins
      const checkInDates: string[] = []
      snapshot.forEach((doc) => {
        const data = doc.data()
        if ((data.morningData || data.type === 'morning') && data.createdAt) {
          const date = data.createdAt.toDate()
          const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
          if (!checkInDates.includes(dateStr)) {
            checkInDates.push(dateStr)
          }
        }
      })

      if (checkInDates.length === 0) {
        setCheckInStreak(0)
        setCheckInStreakData({ currentStreak: 0, longestStreak: 0, allStreaks: [] })
        return
      }

      // Sort dates (newest first)
      checkInDates.sort((a, b) => b.localeCompare(a))

      // Calculate streaks
      const allStreaks: StreakPeriod[] = []
      let longestStreakLength = 0
      let tempStreak: StreakPeriod = {
        length: 0,
        startDate: '',
        endDate: '',
      }

      // Get today's and yesterday's date strings
      const today = new Date()
      const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
      const yesterday = new Date(today)
      yesterday.setDate(yesterday.getDate() - 1)
      const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`

      // Process dates to find streaks
      for (let i = 0; i < checkInDates.length; i++) {
        const currentDate = checkInDates[i]

        if (tempStreak.length === 0) {
          tempStreak = {
            length: 1,
            startDate: currentDate,
            endDate: currentDate,
          }
        } else {
          const current = new Date(currentDate)
          const previous = new Date(tempStreak.startDate)
          const diffTime = previous.getTime() - current.getTime()
          const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

          if (diffDays === 1) {
            tempStreak.length++
            tempStreak.startDate = currentDate
          } else {
            allStreaks.push({ ...tempStreak })
            if (tempStreak.length > longestStreakLength) {
              longestStreakLength = tempStreak.length
            }
            tempStreak = {
              length: 1,
              startDate: currentDate,
              endDate: currentDate,
            }
          }
        }

        if (i === checkInDates.length - 1) {
          allStreaks.push({ ...tempStreak })
          if (tempStreak.length > longestStreakLength) {
            longestStreakLength = tempStreak.length
          }
        }
      }

      // Determine current streak (must include today or yesterday)
      let currentStreakLength = 0
      if (allStreaks.length > 0) {
        const mostRecentStreak = allStreaks[0]
        if (mostRecentStreak.endDate === todayStr || mostRecentStreak.endDate === yesterdayStr) {
          currentStreakLength = mostRecentStreak.length
        }
      }

      // Filter streaks to show only 2+ days
      const filteredStreaks = allStreaks
        .filter((s) => s.length >= 2)
        .sort((a, b) => b.length - a.length)

      setCheckInStreak(currentStreakLength)
      setCheckInStreakData({
        currentStreak: currentStreakLength,
        longestStreak: longestStreakLength,
        allStreaks: filteredStreaks,
      })
    } catch (err) {
      console.error('[useCheckInData] Error calculating check-in streaks:', err)
    }
  }, [user])

  // ==========================================================================
  // CALCULATE REFLECTION STREAKS
  // ==========================================================================

  const calculateReflectionStreaks = useCallback(async () => {
    if (!user) return

    try {
      const checkInsRef = collection(db, 'checkIns')
      const q = query(
        checkInsRef,
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc')
      )

      const snapshot = await getDocs(q)

      // Extract unique dates with evening reflections
      const reflectionDates: string[] = []
      snapshot.forEach((doc) => {
        const data = doc.data()
        if (data.eveningData && data.createdAt) {
          const date = data.createdAt.toDate()
          const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
          if (!reflectionDates.includes(dateStr)) {
            reflectionDates.push(dateStr)
          }
        }
      })

      if (reflectionDates.length === 0) {
        setReflectionStreak(0)
        setReflectionStreakData({ currentStreak: 0, longestStreak: 0, allStreaks: [] })
        return
      }

      // Sort dates (newest first)
      reflectionDates.sort((a, b) => b.localeCompare(a))

      // Calculate streaks (same logic as check-in streaks)
      const allStreaks: StreakPeriod[] = []
      let longestStreakLength = 0
      let tempStreak: StreakPeriod = {
        length: 0,
        startDate: '',
        endDate: '',
      }

      const today = new Date()
      const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
      const yesterday = new Date(today)
      yesterday.setDate(yesterday.getDate() - 1)
      const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`

      for (let i = 0; i < reflectionDates.length; i++) {
        const currentDate = reflectionDates[i]

        if (tempStreak.length === 0) {
          tempStreak = {
            length: 1,
            startDate: currentDate,
            endDate: currentDate,
          }
        } else {
          const current = new Date(currentDate)
          const previous = new Date(tempStreak.startDate)
          const diffTime = previous.getTime() - current.getTime()
          const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

          if (diffDays === 1) {
            tempStreak.length++
            tempStreak.startDate = currentDate
          } else {
            allStreaks.push({ ...tempStreak })
            if (tempStreak.length > longestStreakLength) {
              longestStreakLength = tempStreak.length
            }
            tempStreak = {
              length: 1,
              startDate: currentDate,
              endDate: currentDate,
            }
          }
        }

        if (i === reflectionDates.length - 1) {
          allStreaks.push({ ...tempStreak })
          if (tempStreak.length > longestStreakLength) {
            longestStreakLength = tempStreak.length
          }
        }
      }

      let currentStreakLength = 0
      if (allStreaks.length > 0) {
        const mostRecentStreak = allStreaks[0]
        if (mostRecentStreak.endDate === todayStr || mostRecentStreak.endDate === yesterdayStr) {
          currentStreakLength = mostRecentStreak.length
        }
      }

      const filteredStreaks = allStreaks
        .filter((s) => s.length >= 2)
        .sort((a, b) => b.length - a.length)

      setReflectionStreak(currentStreakLength)
      setReflectionStreakData({
        currentStreak: currentStreakLength,
        longestStreak: longestStreakLength,
        allStreaks: filteredStreaks,
      })
    } catch (err) {
      console.error('[useCheckInData] Error calculating reflection streaks:', err)
    }
  }, [user])

  // ==========================================================================
  // CALCULATE WEEKLY STATS
  // ==========================================================================

  const calculateWeeklyStats = useCallback(async () => {
    if (!user) {
      setWeeklyStats(null)
      return
    }

    try {
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

      const checkInsRef = collection(db, 'checkIns')
      const q = query(
        checkInsRef,
        where('userId', '==', user.uid),
        where('createdAt', '>=', Timestamp.fromDate(sevenDaysAgo))
      )

      const snapshot = await getDocs(q)

      if (snapshot.empty) {
        setWeeklyStats({ checkRate: 0, avgMood: 0, checkInCount: 0 })
        return
      }

      const checkIns = snapshot.docs.map((doc) => doc.data())

      // Calculate check rate (percentage of days with check-ins)
      const checkRate = Math.round((checkIns.length / 7) * 100)

      // Calculate average mood
      const moodRatings = checkIns
        .map((c) => c.mood || c.morningData?.mood)
        .filter((v): v is number => v != null)
      const avgMood =
        moodRatings.length > 0
          ? Math.round((moodRatings.reduce((sum, val) => sum + val, 0) / moodRatings.length) * 10) /
            10
          : 0

      setWeeklyStats({ checkRate, avgMood, checkInCount: checkIns.length })
    } catch (err) {
      console.error('[useCheckInData] Error calculating weekly stats:', err)
      setWeeklyStats({ checkRate: 0, avgMood: 0, checkInCount: 0 })
    }
  }, [user])

  // ==========================================================================
  // CALCULATE REFLECTION STATS
  // ==========================================================================

  const calculateReflectionStats = useCallback(async () => {
    if (!user) {
      setReflectionStats({
        totalAllTime: 0,
        totalThisMonth: 0,
        avgDailyScore: 0,
        topGratitudeThemes: [],
      })
      setAllReflections([])
      return
    }

    try {
      const now = new Date()
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      firstDayOfMonth.setHours(0, 0, 0, 0)

      const checkInsRef = collection(db, 'checkIns')
      const q = query(
        checkInsRef,
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc')
      )

      const snapshot = await getDocs(q)

      const allReflectionsArray: CheckInDocument[] = []
      const thisMonthReflections: EveningReflectionData[] = []

      snapshot.forEach((docSnap) => {
        const data = docSnap.data()
        if (data.eveningData) {
          const reflectionData: CheckInDocument = {
            id: docSnap.id,
            userId: data.userId,
            tenantId: data.tenantId || CURRENT_TENANT,
            type: data.type || 'evening',
            eveningData: data.eveningData,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
          }
          allReflectionsArray.push(reflectionData)

          if (data.createdAt.toDate() >= firstDayOfMonth) {
            thisMonthReflections.push(data.eveningData)
          }
        }
      })

      const totalAllTime = allReflectionsArray.length
      const totalThisMonth = thisMonthReflections.length

      // Calculate average daily score
      let avgDailyScore = 0
      if (totalThisMonth > 0) {
        const totalScore = thisMonthReflections.reduce(
          (sum, r) => sum + (r.overallDay || 0),
          0
        )
        avgDailyScore = Math.round((totalScore / totalThisMonth) * 10) / 10
      }

      // Analyze gratitude themes
      const themeData: Record<string, { name: string; count: number; dates: Date[] }> = {}

      allReflectionsArray.forEach((r) => {
        if (r.eveningData?.gratitudeTheme && r.eveningData.gratitudeTheme.trim()) {
          const theme = r.eveningData.gratitudeTheme
          if (!themeData[theme]) {
            themeData[theme] = {
              name: theme,
              count: 0,
              dates: [],
            }
          }
          themeData[theme].count++
          themeData[theme].dates.push(r.createdAt.toDate())
        }
      })

      // Get top 3 themes
      const topGratitudeThemes: GratitudeTheme[] = Object.values(themeData)
        .sort((a, b) => b.count - a.count)
        .slice(0, 3)
        .map((theme) => ({
          name: theme.name,
          count: theme.count,
          lastDate: theme.dates[0],
        }))

      setReflectionStats({
        totalAllTime,
        totalThisMonth,
        avgDailyScore,
        topGratitudeThemes,
      })
      setAllReflections(allReflectionsArray)
    } catch (err) {
      console.error('[useCheckInData] Error calculating reflection stats:', err)
    }
  }, [user])

  // ==========================================================================
  // LOAD YESTERDAY'S CHECK-IN DATA (FOR COMPARISON)
  // ==========================================================================

  const loadYesterdayCheckInData = useCallback(async () => {
    if (!user) {
      setYesterdayCheckInData(null)
      return
    }

    try {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      yesterday.setHours(0, 0, 0, 0)
      const yesterdayEnd = new Date(yesterday)
      yesterdayEnd.setHours(23, 59, 59, 999)

      const checkInsRef = collection(db, 'checkIns')
      const q = query(
        checkInsRef,
        where('userId', '==', user.uid),
        where('createdAt', '>=', Timestamp.fromDate(yesterday)),
        where('createdAt', '<=', Timestamp.fromDate(yesterdayEnd))
      )

      const snapshot = await getDocs(q)

      if (!snapshot.empty) {
        const data = snapshot.docs[0].data()
        const morningData = data.morningData || {}
        setYesterdayCheckInData({
          mood: morningData.mood ?? data.mood,
          craving: morningData.craving ?? data.craving,
          anxiety: morningData.anxiety ?? data.anxiety,
          sleep: morningData.sleep ?? data.sleep,
        })
      } else {
        setYesterdayCheckInData(null)
      }
    } catch (err) {
      console.error('[useCheckInData] Error loading yesterday check-in data:', err)
      setYesterdayCheckInData(null)
    }
  }, [user])

  // ==========================================================================
  // LOAD YESTERDAY'S GOAL
  // ==========================================================================

  const loadYesterdayGoal = useCallback(async () => {
    if (!user) {
      setYesterdayGoal(null)
      return
    }

    try {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      yesterday.setHours(0, 0, 0, 0)
      const yesterdayEnd = new Date(yesterday)
      yesterdayEnd.setHours(23, 59, 59, 999)

      const checkInsRef = collection(db, 'checkIns')
      const q = query(
        checkInsRef,
        where('userId', '==', user.uid),
        where('createdAt', '>=', Timestamp.fromDate(yesterday)),
        where('createdAt', '<=', Timestamp.fromDate(yesterdayEnd))
      )

      const snapshot = await getDocs(q)

      let foundGoal: YesterdayGoal | null = null

      snapshot.forEach((docSnap) => {
        const data = docSnap.data()
        if (data.eveningData?.tomorrowGoal) {
          foundGoal = {
            docId: docSnap.id,
            goal: data.eveningData.tomorrowGoal,
            completed: data.eveningData?.goalCompleted || false,
          }
        }
      })

      setYesterdayGoal(foundGoal)
    } catch (err) {
      console.error('[useCheckInData] Error loading yesterday goal:', err)
    }
  }, [user])

  // ==========================================================================
  // INITIAL DATA LOADING
  // ==========================================================================

  useEffect(() => {
    if (!user) return

    calculateCheckInStreaks()
    calculateReflectionStreaks()
    calculateWeeklyStats()
    calculateReflectionStats()
    loadYesterdayGoal()
    loadYesterdayCheckInData()

    // Set up listener for real-time streak updates
    const checkInsRef = collection(db, 'checkIns')
    const q = query(checkInsRef, where('userId', '==', user.uid))

    const unsubscribe = onSnapshot(q, () => {
      calculateCheckInStreaks()
      calculateReflectionStreaks()
      calculateWeeklyStats()
      calculateReflectionStats()
      loadYesterdayGoal()
      loadYesterdayCheckInData()
    })

    return () => unsubscribe()
  }, [
    user,
    calculateCheckInStreaks,
    calculateReflectionStreaks,
    calculateWeeklyStats,
    calculateReflectionStats,
    loadYesterdayGoal,
    loadYesterdayCheckInData,
  ])

  // ==========================================================================
  // SUBMIT MORNING CHECK-IN
  // ==========================================================================

  const submitMorningCheckIn = useCallback(
    async (checkInData: MorningCheckInData): Promise<boolean> => {
      if (!user) {
        setError('You must be logged in to submit a check-in')
        return false
      }

      // Validate all fields are filled
      if (
        checkInData.mood === null ||
        checkInData.craving === null ||
        checkInData.anxiety === null ||
        checkInData.sleep === null
      ) {
        setError('Please complete all mood ratings')
        return false
      }

      setLoading(true)
      setError(null)

      try {
        const checkInsRef = collection(db, 'checkIns')

        await addDoc(checkInsRef, {
          userId: user.uid,
          tenantId: userData?.tenantId || CURRENT_TENANT,
          morningData: checkInData,
          mood: checkInData.mood,
          craving: checkInData.craving,
          anxiety: checkInData.anxiety,
          sleep: checkInData.sleep,
          notes: checkInData.notes || null,
          createdAt: serverTimestamp(),
          type: 'morning',
        })

        setCheckInStatus((prev) => ({ ...prev, morning: true }))
        setLastSubmittedCheckIn(checkInData)

        toast({
          title: 'Check-in Complete',
          description: 'Your morning check-in has been submitted successfully!',
        })

        setLoading(false)
        return true
      } catch (err) {
        console.error('[useCheckInData] Error submitting morning check-in:', err)
        setError('Failed to submit check-in. Please try again.')
        toast({
          title: 'Error',
          description: 'Failed to submit check-in. Please try again.',
          variant: 'destructive',
        })
        setLoading(false)
        return false
      }
    },
    [user, userData, toast]
  )

  // ==========================================================================
  // SUBMIT EVENING REFLECTION
  // ==========================================================================

  const submitEveningReflection = useCallback(
    async (reflectionData: EveningReflectionData): Promise<boolean> => {
      if (!user) {
        setError('You must be logged in to submit a reflection')
        return false
      }

      // Validate required fields
      if (
        reflectionData.overallDay === null ||
        !reflectionData.challenges ||
        !reflectionData.gratitude ||
        !reflectionData.tomorrowGoal
      ) {
        setError('Please complete all required fields')
        return false
      }

      setLoading(true)
      setError(null)

      try {
        // Find today's check-in or create new one
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        const checkInsRef = collection(db, 'checkIns')
        const q = query(
          checkInsRef,
          where('userId', '==', user.uid),
          where('createdAt', '>=', Timestamp.fromDate(today))
        )

        const snapshot = await getDocs(q)

        if (!snapshot.empty) {
          // Update existing check-in
          const docRef = doc(db, 'checkIns', snapshot.docs[0].id)
          await updateDoc(docRef, {
            eveningData: reflectionData,
            overallDay: reflectionData.overallDay,
            updatedAt: serverTimestamp(),
          })
        } else {
          // Create new check-in
          await addDoc(checkInsRef, {
            userId: user.uid,
            tenantId: userData?.tenantId || CURRENT_TENANT,
            eveningData: reflectionData,
            overallDay: reflectionData.overallDay,
            createdAt: serverTimestamp(),
            type: 'evening',
          })
        }

        setCheckInStatus((prev) => ({ ...prev, evening: true }))
        setLastSubmittedReflection(reflectionData)

        toast({
          title: 'Reflection Complete',
          description: 'Your evening reflection has been submitted successfully!',
        })

        setLoading(false)
        return true
      } catch (err) {
        console.error('[useCheckInData] Error submitting evening reflection:', err)
        setError('Failed to submit reflection. Please try again.')
        toast({
          title: 'Error',
          description: 'Failed to submit reflection. Please try again.',
          variant: 'destructive',
        })
        setLoading(false)
        return false
      }
    },
    [user, userData, toast]
  )

  // ==========================================================================
  // MARK YESTERDAY'S GOAL AS COMPLETE
  // ==========================================================================

  const markYesterdayGoalComplete = useCallback(
    async (completed: boolean): Promise<boolean> => {
      if (!user || !yesterdayGoal) {
        return false
      }

      try {
        const docRef = doc(db, 'checkIns', yesterdayGoal.docId)
        await updateDoc(docRef, {
          'eveningData.goalCompleted': completed,
          'eveningData.goalCompletedDate': completed ? serverTimestamp() : null,
        })

        setYesterdayGoal((prev) => (prev ? { ...prev, completed } : null))

        toast({
          title: completed ? 'Goal Completed!' : 'Goal Unmarked',
          description: completed
            ? 'Great job completing your goal!'
            : 'Goal marked as incomplete.',
        })

        return true
      } catch (err) {
        console.error('[useCheckInData] Error updating goal status:', err)
        toast({
          title: 'Error',
          description: 'Failed to update goal status.',
          variant: 'destructive',
        })
        return false
      }
    },
    [user, yesterdayGoal, toast]
  )

  // ==========================================================================
  // RETURN HOOK VALUES
  // ==========================================================================

  return {
    // Loading and error states
    loading,
    error,

    // Check-in status
    checkInStatus,

    // Streaks
    checkInStreak,
    reflectionStreak,
    checkInStreakData,
    reflectionStreakData,

    // Stats
    weeklyStats,
    reflectionStats,

    // Data
    allReflections,
    yesterdayGoal,

    // Last submitted data (for completion summaries)
    lastSubmittedCheckIn,
    lastSubmittedReflection,
    yesterdayCheckInData,

    // Actions
    submitMorningCheckIn,
    submitEveningReflection,
    markYesterdayGoalComplete,

    // Manual refresh
    refreshData: useCallback(() => {
      calculateCheckInStreaks()
      calculateReflectionStreaks()
      calculateWeeklyStats()
      calculateReflectionStats()
      loadYesterdayGoal()
      loadYesterdayCheckInData()
    }, [
      calculateCheckInStreaks,
      calculateReflectionStreaks,
      calculateWeeklyStats,
      calculateReflectionStats,
      loadYesterdayGoal,
      loadYesterdayCheckInData,
    ]),
  }
}

export default useCheckInData
