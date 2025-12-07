/**
 * Tab Skeleton Components
 *
 * Content-shaped skeleton screens for each tab type.
 * These replace loading spinners during initial tab load for a smoother UX.
 *
 * Each skeleton matches the visual structure of its corresponding tab,
 * reducing perceived loading time and layout shift.
 */

import { cn } from '@/lib/utils'

// =============================================================================
// BASE SKELETON COMPONENTS
// =============================================================================

interface SkeletonProps {
  className?: string
}

/**
 * Base skeleton bar with animation
 */
function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn('animate-pulse bg-muted rounded', className)}
      aria-hidden="true"
    />
  )
}

/**
 * Skeleton card container
 */
function SkeletonCard({ className, children }: SkeletonProps & { children?: React.ReactNode }) {
  return (
    <div
      className={cn(
        'animate-pulse bg-card rounded-xl border border-border p-4',
        className
      )}
      aria-hidden="true"
    >
      {children}
    </div>
  )
}

// =============================================================================
// TASKS TAB SKELETON
// =============================================================================

/**
 * Skeleton for Tasks tab
 * Matches: Header, Check-in cards, Habit list, Goal cards
 */
export function TasksTabSkeleton() {
  return (
    <div className="p-4 space-y-4">
      {/* Header with greeting */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-32" />
      </div>

      {/* Check-in status cards */}
      <div className="grid grid-cols-2 gap-3">
        <SkeletonCard className="h-28">
          <div className="space-y-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-16" />
          </div>
        </SkeletonCard>
        <SkeletonCard className="h-28">
          <div className="space-y-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-16" />
          </div>
        </SkeletonCard>
      </div>

      {/* Habits section */}
      <div className="space-y-3">
        <Skeleton className="h-5 w-20" />
        <div className="flex gap-2 overflow-hidden">
          {[1, 2, 3, 4].map((i) => (
            <SkeletonCard key={i} className="flex-shrink-0 w-20 h-24">
              <div className="space-y-2 flex flex-col items-center">
                <Skeleton className="h-10 w-10 rounded-full" />
                <Skeleton className="h-3 w-12" />
              </div>
            </SkeletonCard>
          ))}
        </div>
      </div>

      {/* Goals section */}
      <div className="space-y-3">
        <Skeleton className="h-5 w-16" />
        <SkeletonCard className="h-24">
          <div className="flex items-center gap-3">
            <Skeleton className="h-12 w-12 rounded-lg" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
              <Skeleton className="h-2 w-full rounded-full" />
            </div>
          </div>
        </SkeletonCard>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-3 gap-2">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-12 rounded-lg" />
        ))}
      </div>
    </div>
  )
}

// =============================================================================
// JOURNEY TAB SKELETON
// =============================================================================

/**
 * Skeleton for Journey tab
 * Matches: Sobriety counter, Milestones, Savings tracker, Timeline
 */
export function JourneyTabSkeleton() {
  return (
    <div className="p-4 space-y-4">
      {/* Sobriety counter hero */}
      <SkeletonCard className="h-40 flex flex-col items-center justify-center">
        <div className="space-y-3 text-center">
          <Skeleton className="h-12 w-24 mx-auto" />
          <Skeleton className="h-4 w-32 mx-auto" />
          <Skeleton className="h-3 w-40 mx-auto" />
        </div>
      </SkeletonCard>

      {/* Milestone badges */}
      <div className="flex gap-2 overflow-hidden py-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="flex-shrink-0 h-16 w-16 rounded-full" />
        ))}
      </div>

      {/* Savings tracker */}
      <SkeletonCard className="h-28">
        <div className="space-y-3">
          <div className="flex justify-between">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-5 w-16" />
          </div>
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-2 w-full rounded-full" />
        </div>
      </SkeletonCard>

      {/* Section tabs */}
      <div className="flex gap-2">
        <Skeleton className="h-9 w-24 rounded-full" />
        <Skeleton className="h-9 w-24 rounded-full" />
        <Skeleton className="h-9 w-24 rounded-full" />
      </div>

      {/* Timeline items */}
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <SkeletonCard key={i} className="h-20">
            <div className="flex gap-3">
              <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          </SkeletonCard>
        ))}
      </div>
    </div>
  )
}

// =============================================================================
// MEETINGS TAB SKELETON
// =============================================================================

/**
 * Skeleton for Meetings tab
 * Matches: Day selector, Filter bar, Meeting cards list
 */
export function MeetingsTabSkeleton() {
  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="space-y-2">
        <Skeleton className="h-7 w-36" />
        <Skeleton className="h-4 w-48" />
      </div>

      {/* Day selector */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <Skeleton key={day} className="flex-shrink-0 h-14 w-12 rounded-lg" />
        ))}
      </div>

      {/* Filter/search bar */}
      <Skeleton className="h-10 w-full rounded-lg" />

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border pb-2">
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-8 w-20" />
      </div>

      {/* Meeting cards */}
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <SkeletonCard key={i} className="h-24">
            <div className="flex justify-between">
              <div className="space-y-2 flex-1">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <div className="flex gap-2">
                  <Skeleton className="h-5 w-16 rounded-full" />
                  <Skeleton className="h-5 w-12 rounded-full" />
                </div>
              </div>
              <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />
            </div>
          </SkeletonCard>
        ))}
      </div>
    </div>
  )
}

// =============================================================================
// COMMUNITY TAB SKELETON
// =============================================================================

/**
 * Skeleton for Community tab
 * Matches: Topic rooms, Message feed, Compose area
 */
export function CommunityTabSkeleton() {
  return (
    <div className="flex flex-col h-full">
      {/* Topic rooms header */}
      <div className="p-4 space-y-3 border-b border-border">
        <Skeleton className="h-6 w-32" />
        <div className="flex gap-2 overflow-x-auto pb-2">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="flex-shrink-0 h-10 w-24 rounded-full" />
          ))}
        </div>
      </div>

      {/* Message feed */}
      <div className="flex-1 p-4 space-y-4 overflow-hidden">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className={cn('flex gap-3', i % 2 === 0 && 'flex-row-reverse')}>
            <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />
            <div className={cn('space-y-2 max-w-[70%]', i % 2 === 0 && 'items-end')}>
              <Skeleton className="h-3 w-20" />
              <Skeleton className={cn('h-16 rounded-xl', i % 2 === 0 ? 'w-48' : 'w-56')} />
            </div>
          </div>
        ))}
      </div>

      {/* Compose area */}
      <div className="p-4 border-t border-border">
        <div className="flex gap-2">
          <Skeleton className="h-10 flex-1 rounded-full" />
          <Skeleton className="h-10 w-10 rounded-full" />
        </div>
      </div>
    </div>
  )
}

// =============================================================================
// RESOURCES TAB SKELETON
// =============================================================================

/**
 * Skeleton for Resources tab
 * Matches: Category filters, Resource cards grid
 */
export function ResourcesTabSkeleton() {
  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="space-y-2">
        <Skeleton className="h-7 w-24" />
        <Skeleton className="h-4 w-48" />
      </div>

      {/* Search bar */}
      <Skeleton className="h-10 w-full rounded-lg" />

      {/* Category filters */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="flex-shrink-0 h-9 w-20 rounded-full" />
        ))}
      </div>

      {/* Resource cards grid */}
      <div className="grid grid-cols-2 gap-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <SkeletonCard key={i} className="h-36">
            <div className="space-y-2">
              <Skeleton className="h-16 w-full rounded-lg" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </SkeletonCard>
        ))}
      </div>
    </div>
  )
}

// =============================================================================
// MESSAGES TAB SKELETON
// =============================================================================

/**
 * Skeleton for Messages tab
 * Matches: Search, Conversation list
 */
export function MessagesTabSkeleton() {
  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <Skeleton className="h-7 w-28" />
        <Skeleton className="h-9 w-9 rounded-full" />
      </div>

      {/* Search bar */}
      <Skeleton className="h-10 w-full rounded-lg" />

      {/* Conversation list */}
      <div className="space-y-2">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="flex gap-3 p-3 rounded-lg">
            <Skeleton className="h-12 w-12 rounded-full flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="flex justify-between">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-12" />
              </div>
              <Skeleton className="h-3 w-4/5" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// =============================================================================
// PROFILE TAB SKELETON
// =============================================================================

/**
 * Skeleton for Profile tab
 * Matches: Avatar, Stats, Settings sections
 */
export function ProfileTabSkeleton() {
  return (
    <div className="p-4 space-y-4">
      {/* Profile header */}
      <div className="flex flex-col items-center space-y-3 py-4">
        <Skeleton className="h-24 w-24 rounded-full" />
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-4 w-32" />
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        {[1, 2, 3].map((i) => (
          <SkeletonCard key={i} className="h-20 flex flex-col items-center justify-center">
            <Skeleton className="h-6 w-12 mb-1" />
            <Skeleton className="h-3 w-16" />
          </SkeletonCard>
        ))}
      </div>

      {/* Settings sections */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-20 mb-3" />
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-border">
            <div className="flex items-center gap-3">
              <Skeleton className="h-9 w-9 rounded-lg" />
              <Skeleton className="h-4 w-32" />
            </div>
            <Skeleton className="h-5 w-5" />
          </div>
        ))}
      </div>

      {/* Another section */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-24 mb-3" />
        {[1, 2].map((i) => (
          <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-border">
            <div className="flex items-center gap-3">
              <Skeleton className="h-9 w-9 rounded-lg" />
              <Skeleton className="h-4 w-28" />
            </div>
            <Skeleton className="h-5 w-5" />
          </div>
        ))}
      </div>
    </div>
  )
}

// =============================================================================
// TAB SKELETON SELECTOR
// =============================================================================

import type { TabId } from '@/contexts/TabContext'

interface TabSkeletonProps {
  tabId?: TabId
}

/**
 * Returns the appropriate skeleton for a given tab
 */
export function TabSkeleton({ tabId }: TabSkeletonProps) {
  switch (tabId) {
    case 'tasks':
      return <TasksTabSkeleton />
    case 'journey':
      return <JourneyTabSkeleton />
    case 'meetings':
      return <MeetingsTabSkeleton />
    case 'community':
      return <CommunityTabSkeleton />
    case 'resources':
      return <ResourcesTabSkeleton />
    case 'messages':
      return <MessagesTabSkeleton />
    case 'profile':
      return <ProfileTabSkeleton />
    default:
      // Default generic skeleton
      return (
        <div className="p-4 space-y-4 animate-pulse">
          <Skeleton className="h-10 w-2/3" />
          <div className="space-y-3">
            <Skeleton className="h-24 rounded-xl" />
            <Skeleton className="h-24 rounded-xl" />
          </div>
          <div className="space-y-2 pt-4">
            <Skeleton className="h-4 w-1/4" />
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-16 rounded-lg" />
            ))}
          </div>
        </div>
      )
  }
}

export default TabSkeleton
