/**
 * useSessionTime Hook - Session Duration Tracking
 * Phase 6/Task 6.5: Session Time Awareness
 *
 * Tracks how long a user has been in the Anchor tab and provides
 * gentle reminders to take breaks. Based on California legislation
 * requirements for digital mental health tools.
 *
 * Thresholds:
 * - 45 minutes: Gentle suggestion to take a break
 * - 90 minutes: Stronger suggestion to step away
 */

import { useState, useEffect, useCallback, useRef } from 'react'

// Session warning thresholds in minutes
export const SESSION_THRESHOLDS = {
  GENTLE_REMINDER: 45, // 45 minutes
  STRONG_REMINDER: 90, // 90 minutes
} as const

// Warning messages
export const SESSION_WARNINGS = {
  [SESSION_THRESHOLDS.GENTLE_REMINDER]: {
    title: 'Time for a Break?',
    message:
      "You've been chatting for a while. Remember to take breaks and stay hydrated. Your wellbeing matters.",
    severity: 'gentle' as const,
  },
  [SESSION_THRESHOLDS.STRONG_REMINDER]: {
    title: 'Extended Session',
    message:
      "We've been talking for over an hour. It might be good to step away for a bit, stretch, or get some fresh air. I'll be here when you get back.",
    severity: 'strong' as const,
  },
}

export interface SessionWarning {
  title: string
  message: string
  severity: 'gentle' | 'strong'
  minutesElapsed: number
}

export interface UseSessionTimeReturn {
  /** Session start timestamp */
  sessionStartTime: Date | null
  /** Current session duration in minutes */
  sessionDurationMinutes: number
  /** Current warning to display (if any) */
  currentWarning: SessionWarning | null
  /** Whether the 45-minute warning has been shown */
  gentleWarningShown: boolean
  /** Whether the 90-minute warning has been shown */
  strongWarningShown: boolean
  /** Dismiss the current warning */
  dismissWarning: () => void
  /** Reset session timer (e.g., when user takes a break) */
  resetSession: () => void
  /** Manually acknowledge user took a break */
  acknowledgeBrak: () => void
}

/**
 * useSessionTime - Track session duration and show break reminders
 *
 * @param enabled - Whether session tracking is enabled (default: true)
 * @returns Session time state and controls
 */
export function useSessionTime(enabled: boolean = true): UseSessionTimeReturn {
  // Session start time
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null)

  // Session duration in minutes (updated every minute)
  const [sessionDurationMinutes, setSessionDurationMinutes] = useState(0)

  // Warning state
  const [currentWarning, setCurrentWarning] = useState<SessionWarning | null>(null)
  const [gentleWarningShown, setGentleWarningShown] = useState(false)
  const [strongWarningShown, setStrongWarningShown] = useState(false)

  // Interval ref for cleanup
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Initialize session on mount
  useEffect(() => {
    if (enabled && !sessionStartTime) {
      setSessionStartTime(new Date())
    }
  }, [enabled, sessionStartTime])

  // Update duration every minute
  useEffect(() => {
    if (!enabled || !sessionStartTime) return

    const updateDuration = () => {
      const now = new Date()
      const elapsed = Math.floor(
        (now.getTime() - sessionStartTime.getTime()) / (1000 * 60)
      )
      setSessionDurationMinutes(elapsed)

      // Check for warnings
      if (
        elapsed >= SESSION_THRESHOLDS.STRONG_REMINDER &&
        !strongWarningShown
      ) {
        setCurrentWarning({
          ...SESSION_WARNINGS[SESSION_THRESHOLDS.STRONG_REMINDER],
          minutesElapsed: elapsed,
        })
        setStrongWarningShown(true)
        console.log(`[SessionTime] Strong reminder triggered at ${elapsed} minutes`)
      } else if (
        elapsed >= SESSION_THRESHOLDS.GENTLE_REMINDER &&
        !gentleWarningShown
      ) {
        setCurrentWarning({
          ...SESSION_WARNINGS[SESSION_THRESHOLDS.GENTLE_REMINDER],
          minutesElapsed: elapsed,
        })
        setGentleWarningShown(true)
        console.log(`[SessionTime] Gentle reminder triggered at ${elapsed} minutes`)
      }
    }

    // Initial update
    updateDuration()

    // Update every minute
    intervalRef.current = setInterval(updateDuration, 60 * 1000)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [enabled, sessionStartTime, gentleWarningShown, strongWarningShown])

  /**
   * Dismiss current warning
   */
  const dismissWarning = useCallback(() => {
    setCurrentWarning(null)
  }, [])

  /**
   * Reset session timer (starts fresh)
   */
  const resetSession = useCallback(() => {
    setSessionStartTime(new Date())
    setSessionDurationMinutes(0)
    setCurrentWarning(null)
    setGentleWarningShown(false)
    setStrongWarningShown(false)
    console.log('[SessionTime] Session reset')
  }, [])

  /**
   * Acknowledge user took a break
   * Resets warning state but keeps session time for logging
   */
  const acknowledgeBrak = useCallback(() => {
    setCurrentWarning(null)
    // Reset warning flags so they can trigger again after another interval
    setGentleWarningShown(false)
    setStrongWarningShown(false)
    // Reset the session start to now
    setSessionStartTime(new Date())
    setSessionDurationMinutes(0)
    console.log('[SessionTime] Break acknowledged, session reset')
  }, [])

  return {
    sessionStartTime,
    sessionDurationMinutes,
    currentWarning,
    gentleWarningShown,
    strongWarningShown,
    dismissWarning,
    resetSession,
    acknowledgeBrak,
  }
}

export default useSessionTime
