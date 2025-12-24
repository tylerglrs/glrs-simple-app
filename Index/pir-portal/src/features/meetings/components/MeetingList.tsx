import React, { useRef, useCallback, useMemo, useEffect, memo, useState } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import { motion } from 'framer-motion'
import { Loader2, CalendarDays, AlertCircle, ChevronUp, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Illustration } from '@/components/common/Illustration'
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
  /** Add to schedule callback */
  onAddToSchedule?: (meeting: Meeting) => void
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
  /** Callback to load more meetings (infinite scroll) */
  onLoadMore?: () => void
  /** Whether there are more meetings to load */
  hasMore?: boolean
  /** Whether more meetings are being fetched */
  isFetchingMore?: boolean
}

// ============================================================
// CONSTANTS
// ============================================================

// Estimated heights for virtualization (updated for v2.0 card design)
// Card structure: Header(~52px) + Schedule(~28px) + Location(~28px) + Badges(~32px) + Button(~44px) + padding(32px)
// Plus variable content: virtual link (~44px), notes (~40px)
const CARD_HEIGHT_MOBILE = 280   // Increased for new spacing
const CARD_HEIGHT_DESKTOP = 300  // Increased for new spacing
const CARD_GAP = 16              // 16px gap between cards (4px grid)
const SKELETON_COUNT = 8

// Scroll to top threshold
const SCROLL_TOP_THRESHOLD = 500

// ============================================================
// SKELETON LOADING COMPONENT (v2.0 - matches new card design)
// ============================================================

function MeetingCardSkeleton({ isMobile }: { isMobile?: boolean }) {
  return (
    <div
      className={cn(
        'rounded-xl border border-white/30 shadow-sm',
        'bg-white/20 backdrop-blur-sm',
        'animate-pulse motion-reduce:animate-none',
        'p-4'
      )}
      role="presentation"
      aria-hidden="true"
    >
      {/* Section 1: Header - Name + Favorite */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0 space-y-2">
          <div className="h-5 bg-muted rounded-md w-4/5" />
          <div className="h-4 bg-muted rounded-md w-1/2" />
        </div>
        <div className="h-10 w-10 bg-muted rounded-full shrink-0" />
      </div>

      {/* Section 2: Schedule Info - Day, Time, Distance */}
      <div className="flex items-center gap-4 mt-3">
        <div className="flex items-center gap-1.5">
          <div className="h-4 w-4 bg-muted rounded" />
          <div className="h-4 bg-muted rounded-md w-16" />
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-4 w-4 bg-muted rounded" />
          <div className="h-4 bg-muted rounded-md w-14" />
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-4 w-4 bg-muted rounded" />
          <div className="h-4 bg-muted rounded-md w-12" />
        </div>
      </div>

      {/* Section 3: Location + Directions */}
      <div className="flex items-center justify-between gap-3 mt-3">
        <div className="flex items-center gap-1.5 flex-1 min-w-0">
          <div className="h-4 w-4 bg-muted rounded shrink-0" />
          <div className="h-4 bg-muted rounded-md w-3/4" />
        </div>
        <div className="h-4 bg-muted rounded-md w-20 shrink-0" />
      </div>

      {/* Section 5: Badges */}
      <div className="flex flex-wrap items-center gap-2 mt-4">
        <div className="h-6 bg-muted rounded-md w-10" />
        <div className="h-6 bg-muted rounded-md w-14" />
        <div className="h-6 bg-muted rounded-md w-20" />
      </div>

      {/* Section 7: Button */}
      <div className="h-11 bg-muted rounded-md w-full mt-4" />
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
    <div
      className="flex flex-col items-center justify-center py-12 px-4 text-center"
      role="status"
      aria-label={message}
    >
      <CalendarDays className="h-12 w-12 text-muted-foreground mb-4" aria-hidden="true" />
      <p className="text-lg font-medium text-foreground">{message}</p>
      {subMessage && (
        <p className="text-sm text-muted-foreground mt-1">{subMessage}</p>
      )}
      {activeFilterCount !== undefined && activeFilterCount > 0 && onClearFilters && (
        <Button
          variant="outline"
          size="sm"
          onClick={onClearFilters}
          className="mt-4 min-h-[44px]"
          aria-label={`Clear ${activeFilterCount} active filter${activeFilterCount > 1 ? 's' : ''}`}
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 24 }}
      className="flex flex-col items-center justify-center py-12 px-4 text-center bg-gradient-to-br from-slate-50 to-slate-100/50 rounded-xl"
      role="alert"
      aria-live="assertive"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
        className="mb-4"
      >
        <Illustration name="error-network" size="md" className="opacity-85" />
      </motion.div>
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="text-lg font-semibold text-foreground mb-1"
      >
        Error Loading Meetings
      </motion.p>
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-sm text-muted-foreground mb-4"
      >
        {message}
      </motion.p>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Button
          variant="outline"
          onClick={() => window.location.reload()}
          className="gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Try Again
        </Button>
      </motion.div>
    </motion.div>
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
      <div
        className="space-y-3 p-3"
        role="status"
        aria-busy="true"
        aria-label="Loading meetings"
      >
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <MeetingCardSkeleton key={i} isMobile={isMobile} />
        ))}
        <span className="sr-only">Loading {skeletonCount} meetings...</span>
      </div>
    )
  }

  return (
    <div
      className="flex flex-col items-center justify-center py-12"
      role="status"
      aria-busy="true"
      aria-label="Loading meetings"
    >
      <Loader2
        className="h-8 w-8 animate-spin motion-reduce:animate-none text-muted-foreground mb-4"
        aria-hidden="true"
      />
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
  onAddToSchedule?: () => void
  isMobile: boolean
  virtualStart: number
  virtualIndex: number
  measureRef: (node: HTMLElement | null) => void
}

const MeetingRow = memo(function MeetingRow({
  meeting,
  isFavorite,
  showDistance,
  onToggleFavorite,
  onAddToSchedule,
  isMobile,
  virtualStart,
  virtualIndex,
  measureRef,
}: MeetingRowProps) {
  return (
    <div
      ref={measureRef}
      data-index={virtualIndex}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        transform: `translateY(${virtualStart}px)`,
      }}
      className="px-3 pb-4"
    >
      <MeetingCard
        meeting={meeting}
        isFavorite={isFavorite}
        showDistance={showDistance}
        onToggleFavorite={onToggleFavorite}
        onAddToSchedule={onAddToSchedule}
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
      className="fixed bottom-20 right-4 z-50 rounded-full shadow-lg h-11 w-11 min-w-[44px] min-h-[44px]"
      onClick={onClick}
      aria-label="Scroll to top of meetings list"
    >
      <ChevronUp className="h-5 w-5" aria-hidden="true" />
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
  onAddToSchedule,
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
  onLoadMore,
  hasMore = false,
  isFetchingMore = false,
}: MeetingListProps) {
  // Refs for virtualization
  const parentRef = useRef<HTMLDivElement>(null)
  const scrollTopBtnVisibleRef = useRef(false)

  // Calculate estimated item size
  const estimatedSize = useMemo(() => {
    return (isMobile ? CARD_HEIGHT_MOBILE : CARD_HEIGHT_DESKTOP) + CARD_GAP
  }, [isMobile])

  // Initialize virtualizer with dynamic measurement
  const virtualizer = useVirtualizer({
    count: meetings.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => estimatedSize,
    overscan: 5, // Render 5 extra items above/below viewport for smooth scrolling
    getItemKey: (index) => meetings[index]?.id || index,
    measureElement: (element) => {
      // Dynamically measure actual element height
      return element?.getBoundingClientRect().height ?? estimatedSize
    },
  })

  // Get virtual items
  const virtualItems = virtualizer.getVirtualItems()

  // Handle scroll to top
  const scrollToTop = useCallback(() => {
    if (parentRef.current) {
      parentRef.current.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [])

  // Track scroll position for scroll-to-top button AND infinite scroll
  const [showScrollTop, setShowScrollTop] = useState(false)

  useEffect(() => {
    const element = parentRef.current
    if (!element) return

    const handleScroll = () => {
      // Scroll-to-top button visibility
      const shouldShow = element.scrollTop > SCROLL_TOP_THRESHOLD
      if (shouldShow !== scrollTopBtnVisibleRef.current) {
        scrollTopBtnVisibleRef.current = shouldShow
        setShowScrollTop(shouldShow)
      }

      // Infinite scroll - load more when 200px from bottom
      if (onLoadMore && hasMore && !isFetchingMore) {
        const scrollBottom = element.scrollHeight - element.scrollTop - element.clientHeight
        if (scrollBottom < 200) {
          console.log('[MeetingList] Near bottom, triggering loadMore')
          onLoadMore()
        }
      }
    }

    element.addEventListener('scroll', handleScroll, { passive: true })
    return () => element.removeEventListener('scroll', handleScroll)
  }, [onLoadMore, hasMore, isFetchingMore])

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
    <div className={cn('flex flex-col flex-1 min-h-0 overflow-hidden', className)}>
      {/* Virtualized list container */}
      <div
        ref={parentRef}
        className="flex-1 overflow-auto"
        role="feed"
        aria-label={`${meetings.length} meetings`}
        aria-busy={loading}
      >
        {/* Optional header - scrolls with content */}
        {header}

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
                onAddToSchedule={onAddToSchedule ? () => onAddToSchedule(meeting) : undefined}
                isMobile={isMobile}
                virtualStart={virtualItem.start}
                virtualIndex={virtualItem.index}
                measureRef={virtualizer.measureElement}
              />
            )
          })}
        </div>

        {/* Loading indicator at bottom when fetching more (infinite scroll) */}
        {(isFetchingMore || (loading && meetings.length > 0)) && (
          <div
            className="flex justify-center py-4"
            role="status"
            aria-label="Loading more meetings"
          >
            <Loader2
              className="h-6 w-6 animate-spin motion-reduce:animate-none text-muted-foreground"
              aria-hidden="true"
            />
            <span className="sr-only">Loading more meetings...</span>
          </div>
        )}

        {/* Load more button (fallback for users who don't scroll) */}
        {hasMore && !isFetchingMore && onLoadMore && (
          <div className="flex justify-center py-4">
            <Button
              variant="outline"
              onClick={onLoadMore}
              className="min-h-[44px]"
            >
              Load More Meetings
            </Button>
          </div>
        )}
      </div>

      {/* Scroll to top button */}
      <ScrollToTopButton visible={showScrollTop} onClick={scrollToTop} />
    </div>
  )
}

export default MeetingList
