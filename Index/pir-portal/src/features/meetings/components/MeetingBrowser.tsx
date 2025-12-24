import { useState, useMemo, useCallback, useEffect, useRef } from 'react'
import { Filter, MapPin, Loader2, X, List, Map as MapIcon, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { useAuth } from '@/contexts/AuthContext'
import { useMeetingFilters } from '../hooks/useMeetingFilters'
import { FilterPanel } from './FilterPanel'
import { FilterChips } from './FilterChips'
import { MeetingList } from './MeetingList'
import { MeetingMap } from './MeetingMap'
import { LocationSearch } from './LocationSearch'
import { WeekSelectorModal } from './WeekSelectorModal'
import { LogMeetingModal, type LogMeetingDetails } from './LogMeetingModal'
import { QuickFilters } from './QuickFilters'
import { applyMeetingFilters } from '../utils/filterUtils'
import { sortMeetingsByNextOccurrence } from '../utils/meetingSort'
import type { Meeting, MeetingBrowserProps, MeetingFilters, UserLocation } from '../types'
import { getMeetingTypesFromRecoveryPrograms } from '../types'

// ============================================================
// VIEW MODE TYPE
// ============================================================

type ViewMode = 'list' | 'map'

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
  /** Callback to clear the user's location */
  onClearLocation?: () => void
  /** Callback to schedule a meeting for multiple weeks */
  onScheduleMeeting?: (meeting: Meeting, weeks: number) => Promise<void>
  /** Whether scheduling is in progress */
  isScheduling?: boolean
  /** Callback to log a meeting manually */
  onLogMeeting?: (details: LogMeetingDetails, date: Date, isAttended: boolean) => Promise<string | null>
  /** Whether logging is in progress */
  isLogging?: boolean
  /** Callback to load more meetings (infinite scroll) */
  onLoadMore?: () => void
  /** Whether there are more meetings to load */
  hasMore?: boolean
  /** Whether more meetings are being fetched */
  isFetchingMore?: boolean
  /** Optional header content (e.g., tabs) to render above search bar inside scroll */
  headerContent?: React.ReactNode
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
  onClearLocation,
  onScheduleMeeting,
  isScheduling = false,
  onLogMeeting,
  isLogging = false,
  className,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onBack: _onBack,
  onLoadMore,
  hasMore = false,
  isFetchingMore = false,
  headerContent,
}: MeetingBrowserInternalProps) {
  // Get user's recovery programs from auth context
  const { userData } = useAuth()

  // Filter hook with URL sync
  const {
    filters,
    tempFilters,
    setTempFilter,
    setFilter,
    applyFilters: commitFilters,
    clearFilters,
    resetTempFilters,
    removeFilter,
    activeFilterCount,
  } = useMeetingFilters()

  // Track if we've already auto-preset the filters (only do once on mount)
  const hasAutoPreset = useRef(false)

  // Auto-preset filters based on user's Recovery Settings
  useEffect(() => {
    // Only auto-preset once, and only if no filters are already set from URL
    if (hasAutoPreset.current) return
    if (filters.type !== 'all') return // User already has a type filter from URL
    if (filters.programTypes.length > 0) return // Already has programTypes set

    // Get user's recovery programs
    const recoveryPrograms = userData?.recoveryPrograms as string[] | undefined
    if (!recoveryPrograms || recoveryPrograms.length === 0) return

    // Filter out 'none', 'other', and 'women-for-sobriety' (no meetings data yet)
    const validPrograms = recoveryPrograms.filter(
      p => !['none', 'other', 'women-for-sobriety'].includes(p)
    )
    if (validPrograms.length === 0) return

    // Get the meeting types for these programs
    const meetingTypes = getMeetingTypesFromRecoveryPrograms(validPrograms)
    if (meetingTypes.length === 0) return

    // Set the programTypes filter
    console.log('[MeetingBrowser] Auto-presetting filters based on Recovery Settings:', meetingTypes)
    setFilter('programTypes', meetingTypes)
    hasAutoPreset.current = true
  }, [userData?.recoveryPrograms, filters.type, filters.programTypes, setFilter])

  // Local state
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false)

  // View mode state (list vs map)
  const [viewMode, setViewMode] = useState<ViewMode>('list')

  // Location search state (custom location from search)
  const [searchLocation, setSearchLocation] = useState<{
    lat: number
    lng: number
    address: string
  } | null>(null)

  // Week selector modal state
  const [selectedMeetingForSchedule, setSelectedMeetingForSchedule] = useState<Meeting | null>(null)
  const [isWeekSelectorOpen, setIsWeekSelectorOpen] = useState(false)

  // Log meeting modal state
  const [isLogMeetingOpen, setIsLogMeetingOpen] = useState(false)

  // Effective location for filtering (search location takes priority)
  const effectiveLocation: UserLocation | null = searchLocation || userLocation

  // Filter meetings using shared utility
  const filteredMeetings = useMemo(() => {
    return applyMeetingFilters(meetings, filters, favorites, effectiveLocation)
  }, [meetings, filters, effectiveLocation, favorites])

  // ============================================================
  // SORTING: Distance (if location) or Circular Day+Time (default)
  // ============================================================
  // When user has location enabled: sort by distance (nearest first)
  // When no location: use circular day+time sort (next upcoming first)
  // This ensures meetings are always in a useful order, not arbitrary
  const sortedMeetings = useMemo(() => {
    // Priority 1: Sort by distance if location is available
    if (effectiveLocation) {
      return [...filteredMeetings].sort((a, b) => {
        const distA = a.distance ?? Infinity
        const distB = b.distance ?? Infinity
        return distA - distB
      })
    }

    // Priority 2: Circular day+time sort (next upcoming meeting first)
    // This is the default sort when no location is available
    // Uses modular arithmetic for week wrap-around (e.g., Saturday → Sunday)
    return sortMeetingsByNextOccurrence(filteredMeetings)
  }, [filteredMeetings, effectiveLocation])

  // Handle location search selection
  const handleLocationSelect = useCallback((location: { lat: number; lng: number; address: string }) => {
    setSearchLocation(location)
    // Clear the user's device location when using search location
    if (onClearLocation) {
      onClearLocation()
    }
  }, [onClearLocation])

  // Handle location search clear
  const handleLocationSearchClear = useCallback(() => {
    setSearchLocation(null)
  }, [])

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
    setIsFilterPanelOpen(false)
  }, [clearFilters])

  // Week selector modal handlers
  const handleOpenWeekSelector = useCallback((meeting: Meeting) => {
    setSelectedMeetingForSchedule(meeting)
    setIsWeekSelectorOpen(true)
  }, [])

  const handleCloseWeekSelector = useCallback(() => {
    setIsWeekSelectorOpen(false)
    setSelectedMeetingForSchedule(null)
  }, [])

  const handleConfirmSchedule = useCallback(async (meeting: Meeting, weeks: number) => {
    if (!onScheduleMeeting) return
    await onScheduleMeeting(meeting, weeks)
    handleCloseWeekSelector()
  }, [onScheduleMeeting, handleCloseWeekSelector])

  // Log meeting modal handlers
  const handleOpenLogMeeting = useCallback(() => {
    setIsLogMeetingOpen(true)
  }, [])

  const handleCloseLogMeeting = useCallback(() => {
    setIsLogMeetingOpen(false)
  }, [])

  const handleLogFuture = useCallback(async (details: LogMeetingDetails, date: Date) => {
    if (!onLogMeeting) return
    await onLogMeeting(details, date, false) // isAttended = false
  }, [onLogMeeting])

  const handleLogPast = useCallback(async (details: LogMeetingDetails, date: Date) => {
    if (!onLogMeeting) return
    await onLogMeeting(details, date, true) // isAttended = true
  }, [onLogMeeting])

  // Detect mobile
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768

  // Build header content that will scroll with meetings
  const listHeader = (
    <>
      {/* Optional header content (e.g., tabs) */}
      {headerContent}

      {/* Search and Filter Bar */}
      <div className="bg-white/10 backdrop-blur-sm border-b border-white/20 p-3 space-y-3">
        {/* Search Row */}
        <div className="flex items-center gap-2">
          {/* Location Search - Primary search bar */}
          <LocationSearch
            onLocationSelect={handleLocationSelect}
            onClear={handleLocationSearchClear}
            currentAddress={searchLocation?.address}
            placeholder="Search by address, city, or zip code..."
            className="flex-1"
          />

          {/* View Mode Toggle */}
          <div
            className="flex items-center border rounded-md overflow-hidden shrink-0"
            role="group"
            aria-label="View mode"
          >
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="icon"
              onClick={() => setViewMode('list')}
              className={cn(
                'h-9 w-9 min-w-[44px] min-h-[44px] rounded-none',
                viewMode === 'list' && 'bg-primary text-primary-foreground'
              )}
              aria-label="List view"
              aria-pressed={viewMode === 'list'}
            >
              <List className="h-4 w-4" aria-hidden="true" />
            </Button>
            <Button
              variant={viewMode === 'map' ? 'default' : 'ghost'}
              size="icon"
              onClick={() => setViewMode('map')}
              className={cn(
                'h-9 w-9 min-w-[44px] min-h-[44px] rounded-none',
                viewMode === 'map' && 'bg-primary text-primary-foreground'
              )}
              aria-label="Map view"
              aria-pressed={viewMode === 'map'}
            >
              <MapIcon className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>

          {/* Filter Button */}
          <Button
            variant="outline"
            size="icon"
            onClick={handleOpenFilterPanel}
            className="relative shrink-0 min-w-[44px] min-h-[44px]"
            aria-label={activeFilterCount > 0 ? `Open filters (${activeFilterCount} active)` : 'Open filters'}
          >
            <Filter className="h-4 w-4" aria-hidden="true" />
            {activeFilterCount > 0 && (
              <Badge
                variant="destructive"
                className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs"
                aria-hidden="true"
              >
                {activeFilterCount}
              </Badge>
            )}
          </Button>

          {/* Location Button (compact, in search bar) */}
          <Button
            variant="outline"
            size="icon"
            onClick={onRequestLocation}
            disabled={locationLoading}
            className={cn(
              'shrink-0 min-w-[44px] min-h-[44px]',
              effectiveLocation && 'text-primary border-primary'
            )}
            aria-label={effectiveLocation ? 'Location active - click to refresh' : 'Use my current location'}
            aria-busy={locationLoading}
          >
            {locationLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <MapPin className="h-4 w-4" aria-hidden="true" />
            )}
          </Button>
        </div>

        {/* Location Status & Distance Selector */}
        {effectiveLocation && (
          <div className="flex items-center gap-2 flex-wrap">
            <span id="distance-label" className="text-sm font-medium text-muted-foreground">Within:</span>
            <div
              role="group"
              aria-labelledby="distance-label"
              className="flex items-center gap-2"
            >
              {[5, 10, 25, 50].map((distance) => (
                <Button
                  key={distance}
                  variant={filters.distanceRadius === distance ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter('distanceRadius', distance as 5 | 10 | 25 | 50)}
                  className={cn(
                    'min-w-[60px] min-h-[36px]',
                    filters.distanceRadius === distance && 'bg-primary text-primary-foreground'
                  )}
                  aria-pressed={filters.distanceRadius === distance}
                  aria-label={`${distance} miles radius`}
                >
                  {distance} mi
                </Button>
              ))}
              {filters.distanceRadius !== null && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setFilter('distanceRadius', null)}
                  className="text-muted-foreground hover:text-foreground min-h-[36px]"
                  aria-label="Any distance"
                >
                  Any
                </Button>
              )}
            </div>
            {/* Show location source indicator */}
            <span className="ml-auto text-xs text-muted-foreground flex items-center gap-1">
              <MapPin className="h-3 w-3" aria-hidden="true" />
              {searchLocation ? 'Custom location' : 'Your location'}
            </span>
            {/* Clear location button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                if (searchLocation) {
                  handleLocationSearchClear()
                } else if (onClearLocation) {
                  onClearLocation()
                }
              }}
              className="text-muted-foreground hover:text-destructive min-h-[36px]"
              aria-label="Clear location"
            >
              <X className="h-4 w-4 mr-1" aria-hidden="true" />
              Clear
            </Button>
          </div>
        )}

        {/* Prompt to enable location (only when no location is set) */}
        {!effectiveLocation && !locationLoading && (
          <div className="text-center py-2 text-sm text-muted-foreground">
            <p>Search for a location above or</p>
            <Button
              variant="link"
              onClick={onRequestLocation}
              className="p-0 h-auto text-primary"
            >
              use your current location
            </Button>
            <span> to find nearby meetings</span>
          </div>
        )}

        {/* Quick Filters */}
        <QuickFilters
          filters={filters}
          onFilterChange={(partial) => {
            Object.entries(partial).forEach(([key, value]) => {
              setFilter(key as keyof MeetingFilters, value)
            })
          }}
        />

        {/* Filter Chips */}
        <FilterChips
          filters={filters}
          onRemoveFilter={removeFilter}
          onClearAll={handleClearFilters}
        />

        {/* Results Count - Live region for screen readers */}
        <div
          className="flex items-center justify-between text-xs text-muted-foreground"
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          <span>
            {filteredMeetings.length} meeting{filteredMeetings.length !== 1 ? 's' : ''} found
          </span>
          <div className="flex items-center gap-2">
            {effectiveLocation ? (
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3" aria-hidden="true" />
                Sorted by distance
              </span>
            ) : (
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" aria-hidden="true" />
                Next upcoming first
              </span>
            )}
            <span className="text-muted-foreground/70">
              {viewMode === 'list' ? 'List' : 'Map'} view
            </span>
          </div>
        </div>
      </div>
    </>
  )

  return (
    <div className={cn('flex flex-col min-h-0', className)}>
      {/* Content Area - List or Map based on viewMode */}
      {viewMode === 'list' ? (
        /* Virtualized Meeting List with Infinite Scroll */
        <MeetingList
          meetings={sortedMeetings}
          loading={loading}
          error={error}
          favorites={favorites}
          onToggleFavorite={onToggleFavorite}
          onAddToSchedule={onScheduleMeeting ? handleOpenWeekSelector : undefined}
          showDistance={!!effectiveLocation}
          emptyMessage="No meetings found"
          emptySubMessage="Check back later for meeting listings"
          activeFilterCount={activeFilterCount}
          onClearFilters={handleClearFilters}
          isMobile={isMobile}
          className="flex-1"
          onLoadMore={onLoadMore}
          hasMore={hasMore}
          isFetchingMore={isFetchingMore}
          header={listHeader}
        />
      ) : (
        /* Map View with header content */
        <div className="flex flex-col flex-1 min-h-0 overflow-auto">
          {/* Header content scrolls with map */}
          {listHeader}
          <MeetingMap
            meetings={sortedMeetings}
            userLocation={effectiveLocation}
            onMeetingSelect={(meeting) => {
              // Could open a detail modal or scroll to meeting in list
              console.log('[MeetingBrowser] Meeting selected on map:', meeting.name)
            }}
            className="flex-1 min-h-[500px]"
            center={searchLocation ? { lat: searchLocation.lat, lng: searchLocation.lng } : undefined}
          />
        </div>
      )}

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

      {/* Week Selector Modal */}
      <WeekSelectorModal
        meeting={selectedMeetingForSchedule}
        isOpen={isWeekSelectorOpen}
        onClose={handleCloseWeekSelector}
        onConfirm={handleConfirmSchedule}
        isLoading={isScheduling}
      />

      {/* Log Meeting Modal */}
      {onLogMeeting && (
        <LogMeetingModal
          isOpen={isLogMeetingOpen}
          onClose={handleCloseLogMeeting}
          onLogFuture={handleLogFuture}
          onLogPast={handleLogPast}
          isLoading={isLogging}
        />
      )}
    </div>
  )
}

export default MeetingBrowser
