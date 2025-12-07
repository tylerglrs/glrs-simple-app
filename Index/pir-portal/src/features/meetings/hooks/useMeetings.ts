import { useMemo, useCallback } from 'react'
import { useExternalMeetings } from './useExternalMeetings'
import { useSavedMeetings, useMeetingRecommendations } from './useSavedMeetings'
import { useUserMeetings } from './useUserMeetings'
import { useGeolocation, addDistanceToMeetings, sortByDistance } from './useGeolocation'
import { useMeetingFilters } from './useMeetingFilters'
import type {
  Meeting,
  ScheduledMeeting,
  MeetingFilters,
  UserLocation,
  UseMeetingsReturn,
} from '../types'
import { TIME_OF_DAY_OPTIONS } from '../types'

// ============================================================
// TYPES
// ============================================================

export interface UseMeetingsOptions {
  /** Enable external meetings (AA/NA) loading */
  includeExternal?: boolean
  /** Enable user's scheduled meetings loading */
  includeScheduled?: boolean
  /** Apply filters automatically */
  applyFilters?: boolean
  /** Sort by distance when location available */
  sortByDistance?: boolean
}

export interface UseMeetingsCombinedReturn extends UseMeetingsReturn {
  // All meetings (combined)
  allMeetings: Meeting[]
  // Filtered meetings (after applying filters)
  filteredMeetings: Meeting[]
  // External meetings only
  externalMeetings: Meeting[]
  // User's scheduled meetings only
  scheduledMeetings: ScheduledMeeting[]
  // Favorites
  favorites: Set<string>
  toggleFavorite: (meeting: Meeting) => Promise<void>
  isFavorite: (meetingId: string) => boolean
  // Geolocation
  userLocation: UserLocation | null
  requestLocation: () => Promise<void>
  clearLocation: () => void
  locationLoading: boolean
  // Filters (from useMeetingFilters)
  filters: MeetingFilters
  setFilter: <K extends keyof MeetingFilters>(key: K, value: MeetingFilters[K]) => void
  clearFilters: () => void
  activeFilterCount: number
  // Attendance
  markAttended: (meetingId: string) => Promise<boolean>
  scheduleMeeting: (meeting: Meeting, scheduledTime: Date) => Promise<string | null>
  // Recommendations
  recommendations: Meeting[]
  // Loading states
  externalLoading: boolean
  scheduledLoading: boolean
  favoritesLoading: boolean
  // Error states
  externalError: string | null
  scheduledError: string | null
}

// ============================================================
// FILTER HELPERS
// ============================================================

/**
 * Get meeting hour from time string
 */
function getMeetingHour(time: string): number | null {
  if (!time) return null

  const match = time.match(/^(\d{1,2}):?(\d{2})?\s*(am|pm)?$/i)
  if (!match) return null

  let hours = parseInt(match[1], 10)
  const period = match[3]?.toLowerCase()

  if (period === 'pm' && hours < 12) hours += 12
  if (period === 'am' && hours === 12) hours = 0

  return hours
}

/**
 * Check if meeting time is within time of day range
 */
function isInTimeRange(meetingHour: number, startHour: number, endHour: number): boolean {
  if (startHour < endHour) {
    return meetingHour >= startHour && meetingHour < endHour
  }
  // Handle overnight range (e.g., 22-5 for "night")
  return meetingHour >= startHour || meetingHour < endHour
}

/**
 * Apply all filters to meetings array
 */
function applyAllFilters(
  meetings: Meeting[],
  filters: MeetingFilters,
  favorites: Set<string>
): Meeting[] {
  let filtered = [...meetings]

  // 1. Search query
  if (filters.searchQuery.trim()) {
    const query = filters.searchQuery.toLowerCase().trim()
    filtered = filtered.filter(
      (m) =>
        m.name.toLowerCase().includes(query) ||
        m.locationName?.toLowerCase().includes(query) ||
        m.location?.name?.toLowerCase().includes(query) ||
        m.address?.formatted?.toLowerCase().includes(query) ||
        m.city?.toLowerCase().includes(query) ||
        m.notes?.toLowerCase().includes(query)
    )
  }

  // 2. Day filter
  if (filters.day !== 'all') {
    const dayNum = parseInt(filters.day, 10)
    filtered = filtered.filter((m) => m.day === dayNum)
  }

  // 3. Time of day filter
  if (filters.timeOfDay !== 'all') {
    const timeRange = TIME_OF_DAY_OPTIONS.find((opt) =>
      opt.label.toLowerCase().includes(filters.timeOfDay)
    )
    if (timeRange) {
      filtered = filtered.filter((m) => {
        const hour = getMeetingHour(m.time)
        if (hour === null) return true // Include if time can't be parsed
        return isInTimeRange(hour, timeRange.startHour, timeRange.endHour)
      })
    }
  }

  // 4. Meeting type (AA/NA/GLRS)
  if (filters.type !== 'all') {
    filtered = filtered.filter((m) => m.source.toLowerCase() === filters.type.toLowerCase())
  }

  // 5. Format
  if (filters.format !== 'all') {
    filtered = filtered.filter((m) => {
      if (!m.types) return false
      const codes = m.types.split(',').map((c) => c.trim().toUpperCase())
      return codes.includes(filters.format.toUpperCase())
    })
  }

  // 6. County/Region
  if (filters.county !== 'all') {
    const countyMapping: Record<string, string[]> = {
      sf: ['san francisco', 'sf', 'marin'],
      eastbay: [
        'oakland',
        'berkeley',
        'alameda',
        'contra costa',
        'richmond',
        'fremont',
        'hayward',
      ],
      santaclara: [
        'san jose',
        'santa clara',
        'palo alto',
        'mountain view',
        'sunnyvale',
        'cupertino',
      ],
      santacruz: ['santa cruz', 'watsonville', 'capitola'],
      sanmateo: [
        'san mateo',
        'redwood city',
        'daly city',
        'south san francisco',
        'burlingame',
      ],
    }
    const targetCities = countyMapping[filters.county] || []
    if (targetCities.length > 0) {
      filtered = filtered.filter((m) => {
        const city = (m.city || m.location?.city || '').toLowerCase()
        return targetCities.some((c) => city.includes(c))
      })
    }
  }

  // 7. Distance (requires userLocation - handled in main hook)
  // Distance filtering is done after distance calculation

  // 8. Groups (demographics)
  if (filters.groups.length > 0) {
    filtered = filtered.filter((m) => {
      if (!m.types) return false
      const codes = m.types.split(',').map((c) => c.trim().toUpperCase())
      return filters.groups.some((g) => codes.includes(g))
    })
  }

  // 9. Accessibility
  if (filters.accessibility.length > 0) {
    filtered = filtered.filter((m) => {
      if (!m.types) return false
      const codes = m.types.split(',').map((c) => c.trim().toUpperCase())
      return filters.accessibility.some((a) => codes.includes(a))
    })
  }

  // 10. Language
  if (filters.language !== 'all') {
    filtered = filtered.filter((m) => {
      if (!m.types) return filters.language === 'EN' // Default to English
      const codes = m.types.split(',').map((c) => c.trim().toUpperCase())
      return codes.includes(filters.language)
    })
  }

  // 11. Special focus
  if (filters.special.length > 0) {
    filtered = filtered.filter((m) => {
      if (!m.types) return false
      const codes = m.types.split(',').map((c) => c.trim().toUpperCase())
      return filters.special.some((s) => codes.includes(s))
    })
  }

  // 12. Favorites only
  if (filters.showFavoritesOnly) {
    filtered = filtered.filter((m) => favorites.has(m.id))
  }

  return filtered
}

// ============================================================
// MAIN HOOK: useMeetings
// ============================================================

/**
 * Unified hook for all meeting data
 *
 * Combines:
 * - External meetings (4,000+ AA/NA from Firestore)
 * - User's scheduled GLRS meetings
 * - Favorites/saved meetings
 * - Geolocation with distance calculation
 * - Filtering via useMeetingFilters
 * - Recommendations based on favorites
 *
 * @param options Configuration options
 * @returns Combined meeting data with all hooks' functionality
 */
export function useMeetings(options: UseMeetingsOptions = {}): UseMeetingsCombinedReturn {
  const {
    includeExternal = true,
    includeScheduled = true,
    applyFilters: shouldApplyFilters = true,
    sortByDistance: shouldSortByDistance = true,
  } = options

  // ============================================================
  // COMPOSE HOOKS
  // ============================================================

  // External meetings (AA/NA)
  const {
    meetings: externalMeetings,
    loading: externalLoading,
    error: externalError,
  } = useExternalMeetings()

  // User's scheduled meetings
  const {
    meetings: scheduledMeetings,
    loading: scheduledLoading,
    error: scheduledError,
    markAttended,
    scheduleMeeting,
  } = useUserMeetings()

  // Favorites
  const { favorites, toggleFavorite, isFavorite, loading: favoritesLoading } = useSavedMeetings()

  // Geolocation
  const {
    location: userLocation,
    requestLocation,
    clearLocation,
    loading: locationLoading,
  } = useGeolocation()

  // Filters
  const { filters, setFilter, clearFilters, activeFilterCount } = useMeetingFilters()

  // ============================================================
  // COMBINE ALL MEETINGS
  // ============================================================

  const allMeetings = useMemo(() => {
    const meetings: Meeting[] = []

    // Add external meetings
    if (includeExternal) {
      meetings.push(...externalMeetings)
    }

    // Add scheduled meetings (convert to Meeting type)
    if (includeScheduled) {
      const scheduledAsBase: Meeting[] = scheduledMeetings.map((sm) => ({
        ...sm,
        source: 'GLRS' as const,
      }))
      meetings.push(...scheduledAsBase)
    }

    return meetings
  }, [externalMeetings, scheduledMeetings, includeExternal, includeScheduled])

  // ============================================================
  // ADD DISTANCE TO MEETINGS
  // ============================================================

  const meetingsWithDistance = useMemo(() => {
    return addDistanceToMeetings(allMeetings, userLocation)
  }, [allMeetings, userLocation])

  // ============================================================
  // APPLY FILTERS
  // ============================================================

  const filteredMeetings = useMemo(() => {
    if (!shouldApplyFilters) {
      return meetingsWithDistance
    }

    // Apply all filters
    let filtered = applyAllFilters(meetingsWithDistance, filters, favorites)

    // Apply distance filter (if set and location available)
    if (filters.distanceRadius !== null && userLocation) {
      filtered = filtered.filter(
        (m) => m.distance !== null && m.distance !== undefined && m.distance <= (filters.distanceRadius as number)
      )
    }

    // Sort by distance if enabled and location available
    if (shouldSortByDistance && userLocation) {
      filtered = sortByDistance(filtered)
    }

    return filtered
  }, [meetingsWithDistance, filters, favorites, userLocation, shouldApplyFilters, shouldSortByDistance])

  // ============================================================
  // RECOMMENDATIONS
  // ============================================================

  const recommendations = useMeetingRecommendations(allMeetings, favorites, userLocation, 10)

  // ============================================================
  // LOADING & ERROR STATES
  // ============================================================

  const loading = externalLoading || scheduledLoading || favoritesLoading
  const error = externalError || scheduledError

  // ============================================================
  // REFETCH
  // ============================================================

  const refetch = useCallback(async () => {
    // Real-time listeners auto-refresh, this is just for manual trigger
    console.log('[useMeetings] Manual refetch triggered')
  }, [])

  // ============================================================
  // RETURN COMBINED DATA
  // ============================================================

  return {
    // UseMeetingsReturn interface
    meetings: filteredMeetings,
    loading,
    error,
    refetch,

    // Extended data
    allMeetings: meetingsWithDistance,
    filteredMeetings,
    externalMeetings,
    scheduledMeetings,

    // Favorites
    favorites,
    toggleFavorite,
    isFavorite,

    // Geolocation
    userLocation,
    requestLocation,
    clearLocation,
    locationLoading,

    // Filters
    filters,
    setFilter,
    clearFilters,
    activeFilterCount,

    // Attendance & Scheduling
    markAttended,
    scheduleMeeting,

    // Recommendations
    recommendations,

    // Individual loading states
    externalLoading,
    scheduledLoading,
    favoritesLoading,

    // Individual error states
    externalError,
    scheduledError,
  }
}

export default useMeetings
