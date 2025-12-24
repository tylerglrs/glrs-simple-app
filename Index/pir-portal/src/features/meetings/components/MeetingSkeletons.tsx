/**
 * =============================================================================
 * MEETING SKELETONS - Phase 10: UX Polish & Accessibility
 * =============================================================================
 *
 * Skeleton loading states for meetings components.
 * Provides visual feedback during data loading.
 *
 * =============================================================================
 */

import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'

// ============================================================
// SKELETON PULSE ANIMATION
// ============================================================

const pulseClass = 'animate-pulse'

// ============================================================
// MEETING CARD SKELETON
// ============================================================

interface MeetingCardSkeletonProps {
  isMobile?: boolean
  className?: string
}

export function MeetingCardSkeleton({
  isMobile = false,
  className,
}: MeetingCardSkeletonProps) {
  return (
    <div
      className={cn(
        'bg-card rounded-xl border p-4 space-y-3',
        isMobile && 'p-3',
        className
      )}
      role="status"
      aria-label="Loading meeting card"
    >
      {/* Header Row: Name + Favorite */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 space-y-2">
          {/* Meeting Name */}
          <Skeleton className={cn('h-5 w-3/4', pulseClass)} />
          {/* Location */}
          <Skeleton className={cn('h-3 w-1/2', pulseClass)} />
        </div>
        {/* Favorite Button */}
        <Skeleton className={cn('h-8 w-8 rounded-md', pulseClass)} />
      </div>

      {/* Day & Time Row */}
      <div className="flex items-center gap-3">
        <Skeleton className={cn('h-4 w-20', pulseClass)} />
        <Skeleton className={cn('h-4 w-16', pulseClass)} />
      </div>

      {/* Address Row */}
      <div className="flex items-start gap-1">
        <Skeleton className={cn('h-3.5 w-3.5 rounded-full', pulseClass)} />
        <Skeleton className={cn('h-3 w-full', pulseClass)} />
      </div>

      {/* Badges Row */}
      <div className="flex items-center justify-between">
        <div className="flex gap-1.5">
          <Skeleton className={cn('h-5 w-12 rounded-md', pulseClass)} />
          <Skeleton className={cn('h-5 w-16 rounded-md', pulseClass)} />
        </div>
        <Skeleton className={cn('h-4 w-20', pulseClass)} />
      </div>
    </div>
  )
}

// ============================================================
// MEETING LIST SKELETON
// ============================================================

interface MeetingListSkeletonProps {
  count?: number
  isMobile?: boolean
  className?: string
}

export function MeetingListSkeleton({
  count = 5,
  isMobile = false,
  className,
}: MeetingListSkeletonProps) {
  return (
    <div
      className={cn('space-y-3', className)}
      role="status"
      aria-label="Loading meetings list"
    >
      {Array.from({ length: count }).map((_, index) => (
        <MeetingCardSkeleton
          key={index}
          isMobile={isMobile}
        />
      ))}
      <span className="sr-only">Loading {count} meetings...</span>
    </div>
  )
}

// ============================================================
// MEETING BROWSER SKELETON
// ============================================================

interface MeetingBrowserSkeletonProps {
  isMobile?: boolean
  className?: string
}

export function MeetingBrowserSkeleton({
  isMobile = false,
  className,
}: MeetingBrowserSkeletonProps) {
  return (
    <div
      className={cn('space-y-4', className)}
      role="status"
      aria-label="Loading meeting browser"
    >
      {/* Search Bar */}
      <Skeleton className={cn('h-10 w-full rounded-lg', pulseClass)} />

      {/* Filter Chips */}
      <div className="flex gap-2 overflow-hidden">
        <Skeleton className={cn('h-8 w-20 rounded-full', pulseClass)} />
        <Skeleton className={cn('h-8 w-24 rounded-full', pulseClass)} />
        <Skeleton className={cn('h-8 w-16 rounded-full', pulseClass)} />
        <Skeleton className={cn('h-8 w-28 rounded-full', pulseClass)} />
      </div>

      {/* Results Count */}
      <Skeleton className={cn('h-4 w-32', pulseClass)} />

      {/* Meeting Cards */}
      <MeetingListSkeleton count={4} isMobile={isMobile} />
    </div>
  )
}

// ============================================================
// MAP MARKER SKELETON (for map loading)
// ============================================================

export function MeetingMapSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'relative h-full min-h-[400px] bg-muted/30 rounded-lg overflow-hidden',
        className
      )}
      role="status"
      aria-label="Loading map"
    >
      {/* Map placeholder with gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-muted/50 to-muted animate-pulse" />

      {/* Fake map markers */}
      <div className="absolute top-1/4 left-1/3">
        <Skeleton className="h-8 w-6 rounded-full" />
      </div>
      <div className="absolute top-1/2 left-1/2">
        <Skeleton className="h-8 w-6 rounded-full" />
      </div>
      <div className="absolute top-2/3 left-1/4">
        <Skeleton className="h-8 w-6 rounded-full" />
      </div>
      <div className="absolute top-1/3 right-1/4">
        <Skeleton className="h-8 w-6 rounded-full" />
      </div>

      {/* Loading indicator */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="bg-background/90 backdrop-blur-sm rounded-lg px-4 py-2">
          <p className="text-sm text-muted-foreground">Loading map...</p>
        </div>
      </div>
    </div>
  )
}

// ============================================================
// FILTER PANEL SKELETON
// ============================================================

export function FilterPanelSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn('space-y-4 p-4', className)}
      role="status"
      aria-label="Loading filters"
    >
      {/* Program Type Filter */}
      <div className="space-y-2">
        <Skeleton className={cn('h-4 w-24', pulseClass)} />
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className={cn('h-8 w-16 rounded-md', pulseClass)} />
          ))}
        </div>
      </div>

      {/* Day Filter */}
      <div className="space-y-2">
        <Skeleton className={cn('h-4 w-20', pulseClass)} />
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 7 }).map((_, i) => (
            <Skeleton key={i} className={cn('h-8 w-12 rounded-md', pulseClass)} />
          ))}
        </div>
      </div>

      {/* Time Filter */}
      <div className="space-y-2">
        <Skeleton className={cn('h-4 w-16', pulseClass)} />
        <div className="flex gap-2">
          <Skeleton className={cn('h-10 w-24 rounded-md', pulseClass)} />
          <Skeleton className={cn('h-10 w-24 rounded-md', pulseClass)} />
        </div>
      </div>

      {/* Distance Slider */}
      <div className="space-y-2">
        <Skeleton className={cn('h-4 w-28', pulseClass)} />
        <Skeleton className={cn('h-2 w-full rounded-full', pulseClass)} />
      </div>
    </div>
  )
}

// ============================================================
// SIDEBAR SKELETON
// ============================================================

export function MeetingsSidebarSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn('p-4 space-y-6', className)}
      role="status"
      aria-label="Loading sidebar"
    >
      {/* Goal Progress Card */}
      <div className="bg-muted/50 rounded-xl p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Skeleton className={cn('h-5 w-5 rounded-full', pulseClass)} />
          <Skeleton className={cn('h-5 w-32', pulseClass)} />
        </div>
        <Skeleton className={cn('h-2 w-full rounded-full', pulseClass)} />
        <Skeleton className={cn('h-4 w-24', pulseClass)} />
      </div>

      {/* Quick Actions */}
      <div className="space-y-2">
        <Skeleton className={cn('h-4 w-24', pulseClass)} />
        <Skeleton className={cn('h-10 w-full rounded-lg', pulseClass)} />
        <Skeleton className={cn('h-10 w-full rounded-lg', pulseClass)} />
      </div>

      {/* Saved Meetings Preview */}
      <div className="space-y-2">
        <Skeleton className={cn('h-4 w-28', pulseClass)} />
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-muted/30">
              <Skeleton className={cn('h-4 w-4 rounded-full', pulseClass)} />
              <div className="flex-1 space-y-1">
                <Skeleton className={cn('h-3 w-3/4', pulseClass)} />
                <Skeleton className={cn('h-2 w-1/2', pulseClass)} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ============================================================
// SCHEDULED MEETING CARD SKELETON
// ============================================================

export function ScheduledMeetingCardSkeleton({
  isMobile = false,
  className,
}: MeetingCardSkeletonProps) {
  return (
    <div
      className={cn(
        'bg-card rounded-xl border p-4 space-y-3',
        isMobile && 'p-3',
        className
      )}
      role="status"
      aria-label="Loading scheduled meeting"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 space-y-2">
          <Skeleton className={cn('h-5 w-3/4', pulseClass)} />
          <Skeleton className={cn('h-3 w-1/2', pulseClass)} />
          <div className="flex items-center gap-2">
            <Skeleton className={cn('h-4 w-24', pulseClass)} />
            <Skeleton className={cn('h-4 w-16', pulseClass)} />
          </div>
        </div>
        <Skeleton className={cn('h-6 w-12 rounded-md', pulseClass)} />
      </div>

      {/* Address */}
      <div className="flex items-start gap-1">
        <Skeleton className={cn('h-3.5 w-3.5 rounded-full', pulseClass)} />
        <Skeleton className={cn('h-3 w-full', pulseClass)} />
      </div>

      {/* Action Button */}
      <Skeleton className={cn('h-9 w-full rounded-lg', pulseClass)} />
    </div>
  )
}

// ============================================================
// INLINE LOADING SPINNER
// ============================================================

export function InlineLoadingSpinner({
  text = 'Loading...',
  className,
}: {
  text?: string
  className?: string
}) {
  return (
    <div
      className={cn(
        'flex items-center justify-center gap-2 py-4',
        className
      )}
      role="status"
      aria-live="polite"
    >
      <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      <span className="text-sm text-muted-foreground">{text}</span>
    </div>
  )
}

// ============================================================
// EXPORTS
// ============================================================

export default {
  MeetingCardSkeleton,
  MeetingListSkeleton,
  MeetingBrowserSkeleton,
  MeetingMapSkeleton,
  FilterPanelSkeleton,
  MeetingsSidebarSkeleton,
  ScheduledMeetingCardSkeleton,
  InlineLoadingSpinner,
}
