import React, { useRef, useCallback, useMemo, useEffect, memo, useState } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import { Loader2, CalendarDays, AlertCircle, ChevronUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { MeetingCard } from './MeetingCard'
import type { Meeting } from '../types'

// ============================================================
// TYPES
// ============================================================

export interface MeetingListProps {
  /** Array of meetings to display */
  meetings: Meeting[]
  /** Loading state */
  loading?: boolean
  /** Error message */
  error?: string | null
  /** Favorites set for checking if a meeting is saved */
  favorites: Set<string>
  /** Toggle favorite callback */
  onToggleFavorite: (meeting: Meeting) => void
  /** Show distance on cards (when location is available) */
  showDistance?: boolean
  /** Optional class name */
  className?: string
  /** Empty state message */
  emptyMessage?: string
  /** Empty state sub-message */
  emptySubMessage?: string
  /** Whether to show skeleton loading */
  showSkeletons?: boolean
  /** Skeleton count for loading state */
  skeletonCount?: number
  /** Whether on mobile */
  isMobile?: boolean
  /** Active filter count (for empty state messaging) */
  activeFilterCount?: number
  /** Callback when clear filters is clicked */
  onClearFilters?: () => void
  /** Optional header content */
  header?: React.ReactNode
}

// ============================================================
// CONSTANTS
// ============================================================

// Estimated heights for virtualization
const CARD_HEIGHT_MOBILE = 180
const CARD_HEIGHT_DESKTOP = 200
const CARD_GAP = 12
const SKELETON_COUNT = 8

// Scroll to top threshold
const SCROLL_TOP_THRESHOLD = 500

// ============================================================
// SKELETON LOADING COMPONENT
// ============================================================

function MeetingCardSkeleton({ isMobile }: { isMobile?: boolean }) {
  return (
    <div
      className={cn(
        'bg-card rounded-xl border animate-pulse',
        isMobile ? 'p-3' : 'p-4'
      )}
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="h-5 bg-muted rounded w-3/4 mb-2" />
          <div className="h-3 bg-muted rounded w-1/2" />
        </div>
        <div className="h-8 w-8 bg-muted rounded" />
      </div>

      {/* Time row */}
      <div className="flex items-center gap-3 mt-3">
        <div className="h-4 bg-muted rounded w-20" />
        <div className="h-4 bg-muted rounded w-16" />
        <div className="h-4 bg-muted rounded w-12" />
      </div>

      {/* Address row */}
      <div className="flex items-start gap-1 mt-3">
        <div className="h-3.5 w-3.5 bg-muted rounded mt-0.5" />
        <div className="h-4 bg-muted rounded flex-1" />
      </div>

      {/* Badges row */}
      <div className="flex flex-wrap gap-1 mt-3">
        <div className="h-5 bg-muted rounded w-16" />
        <div className="h-5 bg-muted rounded w-12" />
        <div className="h-5 bg-muted rounded w-20" />
      </div>

      {/* Footer row */}
      <div className="flex items-center justify-between mt-3">
        <div className="h-5 bg-muted rounded w-10" />
        <div className="h-4 bg-muted rounded w-20" />
      </div>
    </div>
  )
}

// ============================================================
// EMPTY STATE COMPONENT
// ============================================================

function EmptyState({
  message,
  subMessage,
  activeFilterCount,
  onClearFilters,
}: {
  message: string
  subMessage?: string
  activeFilterCount?: number
  onClearFilters?: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <CalendarDays className="h-12 w-12 text-muted-foreground mb-4" />
      <p className="text-lg font-medium text-foreground">{message}</p>
      {subMessage && (
        <p className="text-sm text-muted-foreground mt-1">{subMessage}</p>
      )}
      {activeFilterCount !== undefined && activeFilterCount > 0 && onClearFilters && (
        <Button
          variant="outline"
          size="sm"
          onClick={onClearFilters}
          className="mt-4"
        >
          Clear Filters
        </Button>
      )}
    </div>
  )
}

// ============================================================
// ERROR STATE COMPONENT
// ============================================================

function ErrorState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <AlertCircle className="h-12 w-12 text-destructive mb-4" />
      <p className="text-lg font-medium text-destructive">Error Loading Meetings</p>
      <p className="text-sm text-muted-foreground mt-1">{message}</p>
    </div>
  )
}

// ============================================================
// LOADING STATE COMPONENT
// ============================================================

function LoadingState({
  showSkeletons,
  skeletonCount,
  isMobile,
}: {
  showSkeletons: boolean
  skeletonCount: number
  isMobile?: boolean
}) {
  if (showSkeletons) {
    return (
      <div className="space-y-3 p-3">
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <MeetingCardSkeleton key={i} isMobile={isMobile} />
        ))}
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center py-12">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-4" />
      <p className="text-muted-foreground">Loading meetings...</p>
    </div>
  )
}

// ============================================================
// MEMOIZED MEETING ROW COMPONENT
// ============================================================

interface MeetingRowProps {
  meeting: Meeting
  isFavorite: boolean
  showDistance: boolean
  onToggleFavorite: () => void
  isMobile: boolean
  style: React.CSSProperties
}

const MeetingRow = memo(function MeetingRow({
  meeting,
  isFavorite,
  showDistance,
  onToggleFavorite,
  isMobile,
  style,
}: MeetingRowProps) {
  return (
    <div style={style} className="px-3 pb-3">
      <MeetingCard
        meeting={meeting}
        isFavorite={isFavorite}
        showDistance={showDistance}
        onToggleFavorite={onToggleFavorite}
        isMobile={isMobile}
      />
    </div>
  )
})

// ============================================================
// SCROLL TO TOP BUTTON
// ============================================================

function ScrollToTopButton({
  visible,
  onClick,
}: {
  visible: boolean
  onClick: () => void
}) {
  if (!visible) return null

  return (
    <Button
      variant="secondary"
      size="icon"
      className="fixed bottom-20 right-4 z-50 rounded-full shadow-lg h-10 w-10"
      onClick={onClick}
      aria-label="Scroll to top"
    >
      <ChevronUp className="h-5 w-5" />
    </Button>
  )
}

// ============================================================
// MAIN MEETING LIST COMPONENT
// ============================================================

export function MeetingList({
  meetings,
  loading = false,
  error = null,
  favorites,
  onToggleFavorite,
  showDistance = false,
  className,
  emptyMessage = 'No meetings found',
  emptySubMessage,
  showSkeletons = true,
  skeletonCount = SKELETON_COUNT,
  isMobile = false,
  activeFilterCount = 0,
  onClearFilters,
  header,
}: MeetingListProps) {
  // Refs for virtualization
  const parentRef = useRef<HTMLDivElement>(null)
  const scrollTopBtnVisibleRef = useRef(false)

  // Calculate estimated item size
  const estimatedSize = useMemo(() => {
    return (isMobile ? CARD_HEIGHT_MOBILE : CARD_HEIGHT_DESKTOP) + CARD_GAP
  }, [isMobile])

  // Initialize virtualizer
  const virtualizer = useVirtualizer({
    count: meetings.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => estimatedSize,
    overscan: 5, // Render 5 extra items above/below viewport for smooth scrolling
    getItemKey: (index) => meetings[index]?.id || index,
  })

  // Get virtual items
  const virtualItems = virtualizer.getVirtualItems()

  // Handle scroll to top
  const scrollToTop = useCallback(() => {
    if (parentRef.current) {
      parentRef.current.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [])

  // Track scroll position for scroll-to-top button
  const [showScrollTop, setShowScrollTop] = useState(false)

  useEffect(() => {
    const element = parentRef.current
    if (!element) return

    const handleScroll = () => {
      const shouldShow = element.scrollTop > SCROLL_TOP_THRESHOLD
      if (shouldShow !== scrollTopBtnVisibleRef.current) {
        scrollTopBtnVisibleRef.current = shouldShow
        setShowScrollTop(shouldShow)
      }
    }

    element.addEventListener('scroll', handleScroll, { passive: true })
    return () => element.removeEventListener('scroll', handleScroll)
  }, [])

  // Memoize favorite check
  const isFavoriteCheck = useCallback(
    (meetingId: string) => favorites.has(meetingId),
    [favorites]
  )

  // ============================================================
  // RENDER STATES
  // ============================================================

  // Loading state
  if (loading && meetings.length === 0) {
    return (
      <div className={cn('flex-1 overflow-hidden', className)}>
        <LoadingState
          showSkeletons={showSkeletons}
          skeletonCount={skeletonCount}
          isMobile={isMobile}
        />
      </div>
    )
  }

  // Error state
  if (error && meetings.length === 0) {
    return (
      <div className={cn('flex-1 overflow-hidden', className)}>
        <ErrorState message={error} />
      </div>
    )
  }

  // Empty state
  if (!loading && meetings.length === 0) {
    return (
      <div className={cn('flex-1 overflow-hidden', className)}>
        <EmptyState
          message={emptyMessage}
          subMessage={activeFilterCount > 0 ? 'Try adjusting your filters' : emptySubMessage}
          activeFilterCount={activeFilterCount}
          onClearFilters={onClearFilters}
        />
      </div>
    )
  }

  // ============================================================
  // MAIN RENDER
  // ============================================================

  return (
    <div className={cn('flex flex-col flex-1 overflow-hidden', className)}>
      {/* Optional header */}
      {header}

      {/* Virtualized list container */}
      <div
        ref={parentRef}
        className="flex-1 overflow-auto"
        style={{ contain: 'strict' }}
      >
        {/* Total height wrapper for proper scrollbar */}
        <div
          style={{
            height: `${virtualizer.getTotalSize()}px`,
            width: '100%',
            position: 'relative',
          }}
        >
          {/* Render only visible items */}
          {virtualItems.map((virtualItem) => {
            const meeting = meetings[virtualItem.index]
            if (!meeting) return null

            return (
              <MeetingRow
                key={virtualItem.key}
                meeting={meeting}
                isFavorite={isFavoriteCheck(meeting.id)}
                showDistance={showDistance}
                onToggleFavorite={() => onToggleFavorite(meeting)}
                isMobile={isMobile}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: `${virtualItem.size}px`,
                  transform: `translateY(${virtualItem.start}px)`,
                }}
              />
            )
          })}
        </div>

        {/* Loading indicator at bottom when loading more */}
        {loading && meetings.length > 0 && (
          <div className="flex justify-center py-4">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        )}
      </div>

      {/* Scroll to top button */}
      <ScrollToTopButton visible={showScrollTop} onClick={scrollToTop} />
    </div>
  )
}

export default MeetingList
