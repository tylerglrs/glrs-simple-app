import { useState, useEffect } from 'react'
import { db, auth } from '@/lib/firebase'
import { collection, query, where, orderBy, getDocs, Timestamp } from 'firebase/firestore'
import type { StreakData, StreaksState, CheckIn } from '../types'

// =============================================================================
// HELPERS
// =============================================================================

const getDateString = (date: Date): string => {
  return date.toISOString().split('T')[0]
}

const getYesterday = (): Date => {
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  yesterday.setHours(0, 0, 0, 0)
  return yesterday
}

const calculateStreak = (
  dates: string[],
  checkFn: (date: string) => boolean
): StreakData => {
  if (dates.length === 0) {
    return { current: 0, longest: 0, lastDate: null }
  }

  // Sort dates descending
  const sortedDates = [...dates].sort((a, b) => b.localeCompare(a))

  const today = getDateString(new Date())
  const yesterday = getDateString(getYesterday())

  let current = 0
  let longest = 0
  let tempStreak = 0
  let lastDate: string | null = null

  // Check if streak is active (today or yesterday has data)
  const mostRecent = sortedDates[0]
  const streakIsActive = mostRecent === today || mostRecent === yesterday

  if (streakIsActive) {
    // Calculate current streak from most recent date
    let expectedDate = new Date(mostRecent)

    for (const dateStr of sortedDates) {
      const currentDateStr = getDateString(expectedDate)

      if (dateStr === currentDateStr && checkFn(dateStr)) {
        current++
        expectedDate.setDate(expectedDate.getDate() - 1)
      } else if (dateStr < currentDateStr) {
        break
      }
    }
    lastDate = mostRecent
  }

  // Calculate longest streak
  let prevDate: Date | null = null

  for (const dateStr of sortedDates) {
    if (!checkFn(dateStr)) continue

    const currentDate = new Date(dateStr)

    if (prevDate === null) {
      tempStreak = 1
    } else {
      const daysDiff = Math.round((prevDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24))
      if (daysDiff === 1) {
        tempStreak++
      } else {
        longest = Math.max(longest, tempStreak)
        tempStreak = 1
      }
    }

    prevDate = currentDate
  }

  longest = Math.max(longest, tempStreak, current)

  return { current, longest, lastDate }
}

// =============================================================================
// HOOK
// =============================================================================

interface UseStreaksReturn {
  checkInStreak: StreakData
  reflectionStreak: StreakData
  loading: boolean
}

export function useStreaks(): UseStreaksReturn {
  const [streaks, setStreaks] = useState<StreaksState>({
    checkIn: { current: 0, longest: 0, lastDate: null },
    reflection: { current: 0, longest: 0, lastDate: null },
    loading: true,
  })

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        setStreaks({
          checkIn: { current: 0, longest: 0, lastDate: null },
          reflection: { current: 0, longest: 0, lastDate: null },
          loading: false,
        })
        return
      }

      try {
        // Load last 90 days of check-ins
        const ninetyDaysAgo = new Date()
        ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90)

        const checkInsRef = collection(db, 'checkIns')
        const q = query(
          checkInsRef,
          where('userId', '==', user.uid),
          where('createdAt', '>=', Timestamp.fromDate(ninetyDaysAgo)),
          orderBy('createdAt', 'desc')
        )

        const snapshot = await getDocs(q)
        const checkIns: CheckIn[] = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as CheckIn[]

        // Group by date and determine what data exists
        const checkInDates = new Map<string, { hasMorning: boolean; hasEvening: boolean }>()

        checkIns.forEach(ci => {
          const date = ci.createdAt?.toDate?.() || new Date()
          const dateStr = getDateString(date)

          const existing = checkInDates.get(dateStr) || { hasMorning: false, hasEvening: false }

          if (ci.morningData && (ci.morningData.mood !== undefined || ci.morningData.craving !== undefined)) {
            existing.hasMorning = true
          }
          if (ci.eveningData && ci.eveningData.overallDay !== undefined) {
            existing.hasEvening = true
          }

          checkInDates.set(dateStr, existing)
        })

        const allDates = Array.from(checkInDates.keys())

        // Calculate check-in streak (morning data)
        const checkInStreak = calculateStreak(
          allDates,
          (date) => checkInDates.get(date)?.hasMorning || false
        )

        // Calculate reflection streak (evening data)
        const reflectionStreak = calculateStreak(
          allDates,
          (date) => checkInDates.get(date)?.hasEvening || false
        )

        setStreaks({
          checkIn: checkInStreak,
          reflection: reflectionStreak,
          loading: false,
        })
      } catch (error) {
        console.error('Error loading streaks:', error)
        setStreaks({
          checkIn: { current: 0, longest: 0, lastDate: null },
          reflection: { current: 0, longest: 0, lastDate: null },
          loading: false,
        })
      }
    })

    return () => unsubscribe()
  }, [])

  return {
    checkInStreak: streaks.checkIn,
    reflectionStreak: streaks.reflection,
    loading: streaks.loading,
  }
}

export default useStreaks
