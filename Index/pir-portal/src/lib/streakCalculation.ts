// =============================================================================
// STREAK CALCULATION UTILITY
// =============================================================================
// Shared streak calculation logic for check-ins and reflections
// Used by useCheckInsQuery and streak modals

// =============================================================================
// TYPES
// =============================================================================

export interface StreakPeriod {
  length: number
  startDate: string
  endDate: string
}

export interface StreakData {
  currentStreak: number
  longestStreak: number
  allStreaks: StreakPeriod[]
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Convert a Date to YYYY-MM-DD string format
 */
export function getDateString(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

/**
 * Get today's date as YYYY-MM-DD string
 */
export function getTodayString(): string {
  return getDateString(new Date())
}

/**
 * Get yesterday's date as YYYY-MM-DD string
 */
export function getYesterdayString(): string {
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  return getDateString(yesterday)
}

// =============================================================================
// MAIN STREAK CALCULATION
// =============================================================================

/**
 * Calculate streaks from an array of date strings
 *
 * @param dateStrings - Array of YYYY-MM-DD date strings
 * @returns StreakData with currentStreak, longestStreak, and allStreaks array
 *
 * @example
 * const dates = ['2024-01-05', '2024-01-04', '2024-01-03', '2024-01-01']
 * const streaks = calculateStreaksFromDates(dates)
 * // Returns: { currentStreak: 3, longestStreak: 3, allStreaks: [...] }
 */
export function calculateStreaksFromDates(dateStrings: string[]): StreakData {
  if (dateStrings.length === 0) {
    return { currentStreak: 0, longestStreak: 0, allStreaks: [] }
  }

  // Extract unique dates and sort descending (most recent first)
  const dates = [...new Set(dateStrings)].sort((a, b) => b.localeCompare(a))

  if (dates.length === 0) {
    return { currentStreak: 0, longestStreak: 0, allStreaks: [] }
  }

  // Calculate streaks
  const allStreaks: StreakPeriod[] = []
  let longestStreakLength = 0
  let tempStreak: StreakPeriod = { length: 0, startDate: '', endDate: '' }

  const todayStr = getTodayString()
  const yesterdayStr = getYesterdayString()

  for (let i = 0; i < dates.length; i++) {
    const currentDate = dates[i]

    if (tempStreak.length === 0) {
      // Start a new streak
      tempStreak = { length: 1, startDate: currentDate, endDate: currentDate }
    } else {
      // Check if current date extends the streak
      const current = new Date(currentDate)
      const previous = new Date(tempStreak.startDate)
      const diffTime = previous.getTime() - current.getTime()
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

      if (diffDays === 1) {
        // Consecutive day - extend streak
        tempStreak.length++
        tempStreak.startDate = currentDate
      } else {
        // Gap found - save current streak and start new one
        allStreaks.push({ ...tempStreak })
        if (tempStreak.length > longestStreakLength) {
          longestStreakLength = tempStreak.length
        }
        tempStreak = { length: 1, startDate: currentDate, endDate: currentDate }
      }
    }

    // Save final streak
    if (i === dates.length - 1) {
      allStreaks.push({ ...tempStreak })
      if (tempStreak.length > longestStreakLength) {
        longestStreakLength = tempStreak.length
      }
    }
  }

  // Determine current streak (only counts if includes today or yesterday)
  let currentStreakLength = 0
  if (allStreaks.length > 0) {
    const mostRecentStreak = allStreaks[0]
    if (mostRecentStreak.endDate === todayStr || mostRecentStreak.endDate === yesterdayStr) {
      currentStreakLength = mostRecentStreak.length
    }
  }

  // Filter to streaks of 2+ days for history display
  const filteredStreaks = allStreaks
    .filter((s) => s.length >= 2)
    .sort((a, b) => b.length - a.length)

  return {
    currentStreak: currentStreakLength,
    longestStreak: longestStreakLength,
    allStreaks: filteredStreaks,
  }
}

// =============================================================================
// CONVENIENCE FUNCTIONS
// =============================================================================

/**
 * Calculate streaks from an array of Date objects
 */
export function calculateStreaksFromDateObjects(dates: Date[]): StreakData {
  const dateStrings = dates.map(getDateString)
  return calculateStreaksFromDates(dateStrings)
}

/**
 * Calculate streaks from timestamps (milliseconds since epoch)
 */
export function calculateStreaksFromTimestamps(timestamps: number[]): StreakData {
  const dateStrings = timestamps.map((ts) => getDateString(new Date(ts)))
  return calculateStreaksFromDates(dateStrings)
}
