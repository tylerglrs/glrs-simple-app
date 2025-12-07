import { useState, useMemo, useCallback, useEffect } from 'react'
import { Search, Filter, MapPin, Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { useMeetingFilters } from '../hooks/useMeetingFilters'
import { FilterPanel } from './FilterPanel'
import { FilterChips } from './FilterChips'
import { MeetingList } from './MeetingList'
import type { Meeting, MeetingBrowserProps, MeetingFilters, UserLocation } from '../types'
import { TIME_OF_DAY_OPTIONS } from '../types'

// ============================================================
// CONSTANTS
// ============================================================

const DEBOUNCE_MS = 300

// ============================================================
// HELPER FUNCTIONS
// ============================================================

/**
 * Haversine formula to calculate distance between two coordinates
 */
function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 3959 // Earth's radius in miles
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

/**
 * Get coordinates from meeting (handles various formats)
 */
function getMeetingCoordinates(meeting: Meeting): { lat: number; lng: number } | null {
  // Check direct coordinates
  if (meeting.coordinates?.lat && meeting.coordinates?.lng) {
    return { lat: meeting.coordinates.lat, lng: meeting.coordinates.lng }
  }
  // Check Firestore GeoPoint format
  if (meeting.coordinates?._lat && meeting.coordinates?._long) {
    return { lat: meeting.coordinates._lat, lng: meeting.coordinates._long }
  }
  // Check location.coordinates
  if (meeting.location?.coordinates?.lat && meeting.location?.coordinates?.lng) {
    return { lat: meeting.location.coordinates.lat, lng: meeting.location.coordinates.lng }
  }
  return null
}

/**
 * Parse meeting time to get hour (for time of day filtering)
 */
function getMeetingHour(time: string): number | null {
  if (!time) return null

  // Handle HH:MM format
  const match = time.match(/^(\d{1,2}):(\d{2})\s*(am|pm)?$/i)
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
 * Apply filters to meetings
 */
function applyFilters(
  meetings: Meeting[],
  filters: MeetingFilters,
  userLocation: UserLocation | null,
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
    const timeRange = TIME_OF_DAY_OPTIONS.find(
      (opt) => opt.label.toLowerCase().includes(filters.timeOfDay)
    )
    if (timeRange) {
      filtered = filtered.filter((m) => {
        const hour = getMeetingHour(m.time)
        if (hour === null) return true // Include if time can't be parsed
        return isInTimeRange(hour, timeRange.startHour, timeRange.endHour)
      })
    }
  }

  // 4. Meeting type (AA/NA)
  if (filters.type !== 'all') {
    filtered = filtered.filter(
      (m) => m.source.toLowerCase() === filters.type.toLowerCase()
    )
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
      eastbay: ['oakland', 'berkeley', 'alameda', 'contra costa', 'richmond', 'fremont', 'hayward'],
      santaclara: ['san jose', 'santa clara', 'palo alto', 'mountain view', 'sunnyvale', 'cupertino'],
      santacruz: ['santa cruz', 'watsonville', 'capitola'],
      sanmateo: ['san mateo', 'redwood city', 'daly city', 'south san francisco', 'burlingame'],
    }
    const targetCities = countyMapping[filters.county] || []
    if (targetCities.length > 0) {
      filtered = filtered.filter((m) => {
        const city = (m.city || m.location?.city || '').toLowerCase()
        return targetCities.some((c) => city.includes(c))
      })
    }
  }

  // 7. Distance (requires user location)
  if (filters.distanceRadius !== null && userLocation) {
    filtered = filtered
      .map((m) => {
        const coords = getMeetingCoordinates(m)
        if (!coords) return { ...m, distance: null }
        const dist = calculateDistance(
          userLocation.lat,
          userLocation.lng,
          coords.lat,
          coords.lng
        )
        return { ...m, distance: dist }
      })
      .filter((m) => m.distance !== null && m.distance <= filters.distanceRadius!)
  }

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
// MAIN MEETING BROWSER COMPONENT
// ============================================================

interface MeetingBrowserInternalProps extends MeetingBrowserProps {
  meetings: Meeting[]
  loading: boolean
  error: string | null
  userLocation: UserLocation | null
  favorites: Set<string>
  onToggleFavorite: (meeting: Meeting) => void
  onRequestLocation: () => void
  locationLoading: boolean
}

export function MeetingBrowser({
  meetings,
  loading,
  error,
  userLocation,
  favorites,
  onToggleFavorite,
  onRequestLocation,
  locationLoading,
  className,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onBack: _onBack,
}: MeetingBrowserInternalProps) {
  // Filter hook with URL sync
  const {
    filters,
    tempFilters,
    setTempFilter,
    applyFilters: commitFilters,
    clearFilters,
    resetTempFilters,
    removeFilter,
    activeFilterCount,
    setSearchQuery,
  } = useMeetingFilters()

  // Local state
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false)
  const [searchInput, setSearchInput] = useState(filters.searchQuery)

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(searchInput)
    }, DEBOUNCE_MS)
    return () => clearTimeout(timer)
  }, [searchInput, setSearchQuery])

  // Filter meetings
  const filteredMeetings = useMemo(() => {
    return applyFilters(meetings, filters, userLocation, favorites)
  }, [meetings, filters, userLocation, favorites])

  // Sort by distance if location is available
  const sortedMeetings = useMemo(() => {
    if (!userLocation) return filteredMeetings

    return [...filteredMeetings].sort((a, b) => {
      const distA = a.distance ?? Infinity
      const distB = b.distance ?? Infinity
      return distA - distB
    })
  }, [filteredMeetings, userLocation])

  // Filter panel handlers
  const handleOpenFilterPanel = useCallback(() => {
    resetTempFilters()
    setIsFilterPanelOpen(true)
  }, [resetTempFilters])

  const handleApplyFilters = useCallback(() => {
    commitFilters()
    setIsFilterPanelOpen(false)
  }, [commitFilters])

  const handleCancelFilters = useCallback(() => {
    resetTempFilters()
    setIsFilterPanelOpen(false)
  }, [resetTempFilters])

  const handleClearFilters = useCallback(() => {
    clearFilters()
    setSearchInput('')
    setIsFilterPanelOpen(false)
  }, [clearFilters])

  // Detect mobile
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Search and Filter Bar */}
      <div className="sticky top-0 z-10 bg-background border-b p-3 space-y-3">
        {/* Search Row */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search meetings..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Filter Button */}
          <Button
            variant="outline"
            size="icon"
            onClick={handleOpenFilterPanel}
            className="relative shrink-0"
          >
            <Filter className="h-4 w-4" />
            {activeFilterCount > 0 && (
              <Badge
                variant="destructive"
                className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs"
              >
                {activeFilterCount}
              </Badge>
            )}
          </Button>

          {/* Location Button */}
          <Button
            variant="outline"
            size="icon"
            onClick={onRequestLocation}
            disabled={locationLoading}
            className={cn(
              'shrink-0',
              userLocation && 'text-primary border-primary'
            )}
          >
            {locationLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <MapPin className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Filter Chips */}
        <FilterChips
          filters={filters}
          onRemoveFilter={removeFilter}
          onClearAll={handleClearFilters}
        />

        {/* Results Count */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            {filteredMeetings.length} meeting{filteredMeetings.length !== 1 ? 's' : ''} found
          </span>
          {userLocation && (
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              Sorted by distance
            </span>
          )}
        </div>
      </div>

      {/* Virtualized Meeting List */}
      <MeetingList
        meetings={sortedMeetings}
        loading={loading}
        error={error}
        favorites={favorites}
        onToggleFavorite={onToggleFavorite}
        showDistance={!!userLocation}
        emptyMessage="No meetings found"
        emptySubMessage="Check back later for meeting listings"
        activeFilterCount={activeFilterCount}
        onClearFilters={handleClearFilters}
        isMobile={isMobile}
        className="flex-1"
      />

      {/* Filter Panel */}
      <FilterPanel
        filters={tempFilters}
        onFiltersChange={(partial) => {
          Object.entries(partial).forEach(([key, value]) => {
            setTempFilter(key as keyof MeetingFilters, value)
          })
        }}
        onApply={handleApplyFilters}
        onClear={handleClearFilters}
        onCancel={handleCancelFilters}
        isOpen={isFilterPanelOpen}
        meetingCount={filteredMeetings.length}
        totalCount={meetings.length}
      />
    </div>
  )
}

export default MeetingBrowser
