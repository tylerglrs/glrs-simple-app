import { useState, useEffect } from 'react'

// =============================================================================
// TYPES
// =============================================================================

export type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'night'

export interface TimeOfDayConfig {
  timeOfDay: TimeOfDay
  greeting: string
  backgroundGradient: string
  accentColor: string
  iconColor: string
}

// =============================================================================
// CONFIGURATION
// =============================================================================

const TIME_OF_DAY_CONFIG: Record<TimeOfDay, Omit<TimeOfDayConfig, 'timeOfDay'>> = {
  morning: {
    greeting: 'Good Morning',
    backgroundGradient: 'from-orange-200 via-amber-100 to-sky-100',
    accentColor: 'rgb(251, 146, 60)', // orange-400
    iconColor: 'text-orange-500',
  },
  afternoon: {
    greeting: 'Good Afternoon',
    backgroundGradient: 'from-sky-200 via-blue-100 to-cyan-100',
    accentColor: 'rgb(56, 189, 248)', // sky-400
    iconColor: 'text-sky-500',
  },
  evening: {
    greeting: 'Good Evening',
    backgroundGradient: 'from-orange-300 via-rose-200 to-purple-200',
    accentColor: 'rgb(244, 114, 182)', // pink-400
    iconColor: 'text-rose-500',
  },
  night: {
    greeting: 'Good Night',
    backgroundGradient: 'from-indigo-900 via-purple-800 to-slate-900',
    accentColor: 'rgb(129, 140, 248)', // indigo-400
    iconColor: 'text-indigo-400',
  },
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Determine time of day from current hour
 */
function getTimeOfDayFromHour(hour: number): TimeOfDay {
  if (hour >= 5 && hour < 12) return 'morning'
  if (hour >= 12 && hour < 17) return 'afternoon'
  if (hour >= 17 && hour < 21) return 'evening'
  return 'night'
}

// =============================================================================
// HOOK
// =============================================================================

/**
 * Hook that returns the current time of day and auto-updates every minute.
 * Useful for time-based UI theming and greetings.
 *
 * @returns TimeOfDay - 'morning' | 'afternoon' | 'evening' | 'night'
 *
 * @example
 * const timeOfDay = useTimeOfDay()
 * // Returns 'morning' between 5am-12pm
 * // Returns 'afternoon' between 12pm-5pm
 * // Returns 'evening' between 5pm-9pm
 * // Returns 'night' between 9pm-5am
 */
export function useTimeOfDay(): TimeOfDay {
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>(() => {
    const hour = new Date().getHours()
    return getTimeOfDayFromHour(hour)
  })

  useEffect(() => {
    const updateTime = () => {
      const hour = new Date().getHours()
      setTimeOfDay(getTimeOfDayFromHour(hour))
    }

    // Update immediately
    updateTime()

    // Check every minute
    const interval = setInterval(updateTime, 60000)

    return () => clearInterval(interval)
  }, [])

  return timeOfDay
}

/**
 * Hook that returns the full configuration for the current time of day.
 * Includes greeting, background gradient, and accent colors.
 *
 * @returns TimeOfDayConfig object with all styling properties
 *
 * @example
 * const { greeting, backgroundGradient, accentColor } = useTimeOfDayConfig()
 */
export function useTimeOfDayConfig(): TimeOfDayConfig {
  const timeOfDay = useTimeOfDay()
  const config = TIME_OF_DAY_CONFIG[timeOfDay]

  return {
    timeOfDay,
    ...config,
  }
}

export default useTimeOfDay
