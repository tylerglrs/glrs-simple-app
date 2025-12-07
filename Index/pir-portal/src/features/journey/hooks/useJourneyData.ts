import { useState, useEffect, useMemo } from 'react'
import { db, auth } from '@/lib/firebase'
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  doc,
  getDoc,
  Timestamp,
} from 'firebase/firestore'
import type {
  JourneyUserData,
  CheckIn,
  Milestone,
  GratitudeEntry,
  ChallengeEntry,
  SavingsGoal,
  Breakthrough,
} from '../types'

// =============================================================================
// MILESTONE DEFINITIONS
// =============================================================================

const MILESTONE_DEFINITIONS = [
  { days: 1, title: '1 Day', icon: '🌱' },
  { days: 7, title: '1 Week', icon: '🌿' },
  { days: 14, title: '2 Weeks', icon: '🍀' },
  { days: 30, title: '1 Month', icon: '🌲' },
  { days: 60, title: '2 Months', icon: '🌳' },
  { days: 90, title: '3 Months', icon: '🌴' },
  { days: 180, title: '6 Months', icon: '🏔️' },
  { days: 365, title: '1 Year', icon: '🌟' },
  { days: 730, title: '2 Years', icon: '💎' },
  { days: 1095, title: '3 Years', icon: '🏆' },
  { days: 1825, title: '5 Years', icon: '👑' },
  { days: 3650, title: '10 Years', icon: '🎖️' },
]

// =============================================================================
// HELPERS
// =============================================================================

export function calculateSobrietyDays(sobrietyDate: string | undefined): number {
  if (!sobrietyDate) return 0

  // Parse as local date to avoid timezone issues
  const [year, month, day] = sobrietyDate.split('-').map(Number)
  const startDate = new Date(year, month - 1, day)
  startDate.setHours(0, 0, 0, 0)

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const diffTime = today.getTime() - startDate.getTime()
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

  return Math.max(0, diffDays)
}

export function getRecoveryMilestones(sobrietyDate: string | undefined): Milestone[] {
  if (!sobrietyDate) return []

  const daysSober = calculateSobrietyDays(sobrietyDate)
  const [year, month, day] = sobrietyDate.split('-').map(Number)
  const startDate = new Date(year, month - 1, day)

  return MILESTONE_DEFINITIONS.map(m => {
    const achieved = daysSober >= m.days
    const milestoneDate = new Date(startDate)
    milestoneDate.setDate(milestoneDate.getDate() + m.days)

    return {
      ...m,
      achieved,
      date: milestoneDate,
      daysUntil: achieved ? 0 : m.days - daysSober,
    }
  })
}

// =============================================================================
// TYPES
// =============================================================================

interface UseJourneyDataReturn {
  userData: JourneyUserData | null
  checkIns: CheckIn[]
  milestones: Milestone[]
  daysSober: number
  nextMilestone: Milestone | null
  gratitudeEntries: GratitudeEntry[]
  challengeEntries: ChallengeEntry[]
  savingsGoals: SavingsGoal[]
  breakthroughs: Breakthrough[]
  loading: boolean
  error: string | null
  totalSaved: number
}

// =============================================================================
// HOOK
// =============================================================================

export function useJourneyData(): UseJourneyDataReturn {
  const [userData, setUserData] = useState<JourneyUserData | null>(null)
  const [checkIns, setCheckIns] = useState<CheckIn[]>([])
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([])
  const [breakthroughs, setBreakthroughs] = useState<Breakthrough[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        setUserData(null)
        setCheckIns([])
        setSavingsGoals([])
        setBreakthroughs([])
        setLoading(false)
        return
      }

      try {
        setLoading(true)

        // Load user data
        const userDocRef = doc(db, 'users', user.uid)
        const userDoc = await getDoc(userDocRef)
        if (userDoc.exists()) {
          setUserData(userDoc.data() as JourneyUserData)
        }

        // Load last 90 days of check-ins
        const ninetyDaysAgo = new Date()
        ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90)

        const checkInsRef = collection(db, 'checkIns')
        const checkInsQuery = query(
          checkInsRef,
          where('userId', '==', user.uid),
          where('createdAt', '>=', Timestamp.fromDate(ninetyDaysAgo)),
          orderBy('createdAt', 'desc')
        )
        const checkInsSnapshot = await getDocs(checkInsQuery)
        const checkInsData = checkInsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as CheckIn[]
        setCheckIns(checkInsData)

        // Load savings goals
        const savingsRef = collection(db, 'savingsGoals')
        const savingsQuery = query(
          savingsRef,
          where('userId', '==', user.uid),
          orderBy('createdAt', 'desc')
        )
        const savingsSnapshot = await getDocs(savingsQuery)
        const savingsData = savingsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as SavingsGoal[]
        setSavingsGoals(savingsData)

        // Load breakthroughs
        const breakthroughsRef = collection(db, 'breakthroughs')
        const breakthroughsQuery = query(
          breakthroughsRef,
          where('userId', '==', user.uid),
          orderBy('createdAt', 'desc')
        )
        const breakthroughsSnapshot = await getDocs(breakthroughsQuery)
        const breakthroughsData = breakthroughsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as Breakthrough[]
        setBreakthroughs(breakthroughsData)

        setError(null)
      } catch (err) {
        console.error('Error loading journey data:', err)
        setError('Failed to load journey data')
      } finally {
        setLoading(false)
      }
    })

    return () => unsubscribe()
  }, [])

  // Calculate derived values
  const daysSober = useMemo(() => {
    return calculateSobrietyDays(userData?.sobrietyDate)
  }, [userData?.sobrietyDate])

  const milestones = useMemo(() => {
    return getRecoveryMilestones(userData?.sobrietyDate)
  }, [userData?.sobrietyDate])

  const nextMilestone = useMemo(() => {
    return milestones.find(m => !m.achieved) || null
  }, [milestones])

  const gratitudeEntries = useMemo(() => {
    return checkIns
      .filter(ci => ci.eveningData?.gratitude)
      .map(ci => ({
        id: ci.id,
        date: ci.createdAt?.toDate?.().toISOString().split('T')[0] || '',
        gratitude: ci.eveningData!.gratitude!,
        overallDay: ci.eveningData?.overallDay,
      }))
  }, [checkIns])

  const challengeEntries = useMemo(() => {
    return checkIns
      .filter(ci => ci.eveningData?.challenges)
      .map(ci => ({
        id: ci.id,
        date: ci.createdAt?.toDate?.().toISOString().split('T')[0] || '',
        challenges: ci.eveningData!.challenges!,
        overallDay: ci.eveningData?.overallDay,
      }))
  }, [checkIns])

  const totalSaved = useMemo(() => {
    const dailyCost = userData?.dailyCost || 0
    return daysSober * dailyCost
  }, [daysSober, userData?.dailyCost])

  return {
    userData,
    checkIns,
    milestones,
    daysSober,
    nextMilestone,
    gratitudeEntries,
    challengeEntries,
    savingsGoals,
    breakthroughs,
    loading,
    error,
    totalSaved,
  }
}

export default useJourneyData
