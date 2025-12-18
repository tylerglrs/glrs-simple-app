/**
 * Coach Marks Hook
 *
 * Manages coach marks state, visibility, and dismissal.
 * Progressive feature discovery over first 14 days.
 */

import { useState, useCallback, useEffect, useMemo } from 'react'
import { useAuth } from '@/contexts/AuthContext'

// Coach mark configuration
export interface CoachMarkConfig {
  id: string
  title: string
  description: string
  showAfterDays: number // Days since signup/sobriety start
  placement?: 'top' | 'bottom' | 'left' | 'right'
  priority?: number // Lower = higher priority (shown first)
}

// Predefined coach marks schedule
export const COACH_MARKS: CoachMarkConfig[] = [
  {
    id: 'morning-checkin',
    title: 'Morning Check-in',
    description: 'Start your day with a quick check-in to track how you\'re feeling',
    showAfterDays: 1,
    placement: 'bottom',
    priority: 1,
  },
  {
    id: 'tasks-tab',
    title: 'Your Daily Tasks',
    description: 'Your daily tasks, habits, and assignments from your coach live here',
    showAfterDays: 1,
    placement: 'top',
    priority: 2,
  },
  {
    id: 'journey-tab',
    title: 'Your Journey',
    description: 'Track your sobriety milestones, streaks, and overall progress',
    showAfterDays: 3,
    placement: 'top',
    priority: 3,
  },
  {
    id: 'meetings-tab',
    title: 'Find Meetings',
    description: 'Discover AA, NA, and other recovery meetings near you',
    showAfterDays: 5,
    placement: 'top',
    priority: 4,
  },
  {
    id: 'community-tab',
    title: 'Community',
    description: 'Connect with others in recovery and share your journey',
    showAfterDays: 7,
    placement: 'top',
    priority: 5,
  },
]

// LocalStorage key for dismissed marks
const DISMISSED_MARKS_KEY = 'glrs_coach_marks_dismissed'

// Get dismissed marks from localStorage
function getDismissedMarks(): string[] {
  try {
    const stored = localStorage.getItem(DISMISSED_MARKS_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

// Save dismissed marks to localStorage
function saveDismissedMark(markId: string): void {
  try {
    const dismissed = getDismissedMarks()
    if (!dismissed.includes(markId)) {
      dismissed.push(markId)
      localStorage.setItem(DISMISSED_MARKS_KEY, JSON.stringify(dismissed))
    }
  } catch {
    // Silently fail if localStorage is unavailable
  }
}

// Calculate days since a date
function getDaysSince(date: Date): number {
  const now = new Date()
  const diffTime = Math.abs(now.getTime() - date.getTime())
  return Math.floor(diffTime / (1000 * 60 * 60 * 24))
}

export interface UseCoachMarksReturn {
  // Currently active coach mark (if any)
  activeCoachMark: CoachMarkConfig | null

  // Dismiss a coach mark
  dismissCoachMark: (markId: string) => void

  // Dismiss all coach marks
  dismissAllCoachMarks: () => void

  // Check if a specific mark should be shown
  shouldShowMark: (markId: string) => boolean

  // Get available marks for current day
  availableMarks: CoachMarkConfig[]

  // Days in recovery
  daysInRecovery: number

  // Show a specific coach mark
  showMark: (markId: string) => void

  // Hide the current mark without dismissing
  hideMark: () => void
}

export function useCoachMarks(): UseCoachMarksReturn {
  const { userData } = useAuth()

  const [dismissedMarks, setDismissedMarks] = useState<string[]>(() => getDismissedMarks())
  const [currentMarkId, setCurrentMarkId] = useState<string | null>(null)
  const [hasShownInitialMark, setHasShownInitialMark] = useState(false)

  // Calculate days in recovery from sobriety date
  const daysInRecovery = useMemo(() => {
    if (!userData?.sobrietyDate) {
      // If no sobriety date, use account creation or default to 0
      if (userData?.createdAt) {
        const createdDate = userData.createdAt.toDate()
        return getDaysSince(createdDate)
      }
      return 0
    }

    const sobrietyDate = userData.sobrietyDate.toDate()
    return getDaysSince(sobrietyDate)
  }, [userData?.sobrietyDate, userData?.createdAt])

  // Get marks that should be available based on days in recovery
  const availableMarks = useMemo(() => {
    return COACH_MARKS.filter(mark => {
      const isAvailable = daysInRecovery >= mark.showAfterDays
      const isDismissed = dismissedMarks.includes(mark.id)
      return isAvailable && !isDismissed
    }).sort((a, b) => (a.priority || 999) - (b.priority || 999))
  }, [daysInRecovery, dismissedMarks])

  // Get the currently active mark config
  const activeCoachMark = useMemo(() => {
    if (!currentMarkId) return null
    return COACH_MARKS.find(mark => mark.id === currentMarkId) || null
  }, [currentMarkId])

  // Check if a specific mark should be shown
  const shouldShowMark = useCallback((markId: string) => {
    const mark = COACH_MARKS.find(m => m.id === markId)
    if (!mark) return false

    const isAvailable = daysInRecovery >= mark.showAfterDays
    const isDismissed = dismissedMarks.includes(markId)

    return isAvailable && !isDismissed
  }, [daysInRecovery, dismissedMarks])

  // Dismiss a coach mark
  const dismissCoachMark = useCallback((markId: string) => {
    saveDismissedMark(markId)
    setDismissedMarks(prev => [...prev, markId])

    // If this is the current mark, clear it
    if (currentMarkId === markId) {
      setCurrentMarkId(null)
    }
  }, [currentMarkId])

  // Dismiss all coach marks
  const dismissAllCoachMarks = useCallback(() => {
    const allIds = COACH_MARKS.map(m => m.id)
    allIds.forEach(id => saveDismissedMark(id))
    setDismissedMarks(allIds)
    setCurrentMarkId(null)
  }, [])

  // Show a specific coach mark
  const showMark = useCallback((markId: string) => {
    if (shouldShowMark(markId)) {
      setCurrentMarkId(markId)
    }
  }, [shouldShowMark])

  // Hide the current mark without dismissing
  const hideMark = useCallback(() => {
    setCurrentMarkId(null)
  }, [])

  // Auto-show the first available mark on mount (if user has completed onboarding)
  useEffect(() => {
    // Only show if onboarding is complete and we haven't shown initial mark
    if (userData?.onboardingComplete && availableMarks.length > 0 && !hasShownInitialMark) {
      // Small delay to let the page render first
      const timer = setTimeout(() => {
        setCurrentMarkId(availableMarks[0].id)
        setHasShownInitialMark(true)
      }, 1500)

      return () => clearTimeout(timer)
    }
  }, [userData?.onboardingComplete, availableMarks, hasShownInitialMark])

  return {
    activeCoachMark,
    dismissCoachMark,
    dismissAllCoachMarks,
    shouldShowMark,
    availableMarks,
    daysInRecovery,
    showMark,
    hideMark,
  }
}

export default useCoachMarks
