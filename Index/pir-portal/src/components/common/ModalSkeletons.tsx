/**
 * Modal Skeleton Components
 *
 * Content-shaped loading skeletons for modal content.
 * Replace spinner-only loading with these for better perceived performance.
 */

import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'

interface ModalSkeletonProps {
  className?: string
}

// =============================================================================
// WEEKLY REPORT SKELETON
// =============================================================================

/**
 * Skeleton for WeeklyReportModal content
 * Matches: Summary header + Metrics grid + Chart area
 */
export function WeeklyReportSkeleton({ className }: ModalSkeletonProps) {
  return (
    <div className={cn('space-y-4 p-4', className)}>
      {/* Summary Header */}
      <Skeleton className="h-28 w-full rounded-xl" />

      {/* Metrics Grid - 2x2 */}
      <div className="grid grid-cols-2 gap-3">
        <Skeleton className="h-20 rounded-xl" />
        <Skeleton className="h-20 rounded-xl" />
        <Skeleton className="h-20 rounded-xl" />
        <Skeleton className="h-20 rounded-xl" />
      </div>

      {/* Chart Area */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-48 w-full rounded-xl" />
      </div>

      {/* Bottom Section */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-32" />
        <div className="grid grid-cols-3 gap-2">
          <Skeleton className="h-16 rounded-lg" />
          <Skeleton className="h-16 rounded-lg" />
          <Skeleton className="h-16 rounded-lg" />
        </div>
      </div>
    </div>
  )
}

// =============================================================================
// CALENDAR HEATMAP SKELETON
// =============================================================================

/**
 * Skeleton for CalendarHeatmapModal content
 * Matches: Month label + Calendar grid + Legend
 */
export function CalendarHeatmapSkeleton({ className }: ModalSkeletonProps) {
  return (
    <div className={cn('space-y-4 p-4', className)}>
      {/* Month Navigation */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-8 rounded" />
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-8 w-8 rounded" />
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Week day headers */}
        {Array.from({ length: 7 }).map((_, i) => (
          <Skeleton key={`header-${i}`} className="h-4 w-full" />
        ))}
        {/* Calendar cells - 5 rows */}
        {Array.from({ length: 35 }).map((_, i) => (
          <Skeleton key={`cell-${i}`} className="h-10 w-full rounded" />
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-2">
        <Skeleton className="h-4 w-8" />
        <div className="flex gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={`legend-${i}`} className="h-4 w-4 rounded" />
          ))}
        </div>
        <Skeleton className="h-4 w-8" />
      </div>
    </div>
  )
}

// =============================================================================
// MOOD INSIGHTS SKELETON
// =============================================================================

/**
 * Skeleton for MoodInsightsModal content
 * Matches: Mood summary + Chart + Pattern analysis
 */
export function MoodInsightsSkeleton({ className }: ModalSkeletonProps) {
  return (
    <div className={cn('space-y-4 p-4', className)}>
      {/* Mood Summary */}
      <div className="flex items-center gap-4">
        <Skeleton className="h-16 w-16 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-4 w-40" />
        </div>
      </div>

      {/* Chart Area */}
      <Skeleton className="h-40 w-full rounded-xl" />

      {/* Pattern Cards */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-28" />
        <div className="space-y-2">
          <Skeleton className="h-16 w-full rounded-lg" />
          <Skeleton className="h-16 w-full rounded-lg" />
        </div>
      </div>
    </div>
  )
}

// =============================================================================
// RECOVERY PROGRAM SKELETON
// =============================================================================

/**
 * Skeleton for 12-Step/Recovery program modals
 * Matches: Progress header + Steps list + Notes section
 */
export function RecoveryProgramSkeleton({ className }: ModalSkeletonProps) {
  return (
    <div className={cn('space-y-4 p-4', className)}>
      {/* Progress Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-24" />
        </div>
        <Skeleton className="h-12 w-12 rounded-full" />
      </div>

      {/* Progress Bar */}
      <Skeleton className="h-3 w-full rounded-full" />

      {/* Steps List */}
      <div className="space-y-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 p-2">
            <Skeleton className="h-8 w-8 rounded-lg" />
            <div className="flex-1 space-y-1">
              <Skeleton className="h-4 w-full max-w-[200px]" />
              <Skeleton className="h-3 w-24" />
            </div>
            <Skeleton className="h-6 w-6 rounded" />
          </div>
        ))}
      </div>
    </div>
  )
}

// =============================================================================
// GRATITUDE JOURNAL SKELETON
// =============================================================================

/**
 * Skeleton for GratitudeJournalModal content
 * Matches: Today's entry + Past entries list
 */
export function GratitudeJournalSkeleton({ className }: ModalSkeletonProps) {
  return (
    <div className={cn('space-y-4 p-4', className)}>
      {/* Today's Entry Card */}
      <div className="rounded-xl border p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-5 rounded" />
          <Skeleton className="h-5 w-24" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>

      {/* Past Entries */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-28" />
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-lg border p-3 space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-2/3" />
          </div>
        ))}
      </div>
    </div>
  )
}

// =============================================================================
// CHECK-INS LIST SKELETON
// =============================================================================

/**
 * Skeleton for CheckInsModal content
 * Matches: Filter tabs + Check-in list items
 */
export function CheckInsListSkeleton({ className }: ModalSkeletonProps) {
  return (
    <div className={cn('space-y-4 p-4', className)}>
      {/* Filter Tabs */}
      <div className="flex gap-2">
        <Skeleton className="h-8 w-20 rounded-full" />
        <Skeleton className="h-8 w-20 rounded-full" />
        <Skeleton className="h-8 w-20 rounded-full" />
      </div>

      {/* Check-in List */}
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 p-3 rounded-lg border">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-24" />
              <div className="flex gap-2">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
            <Skeleton className="h-4 w-12" />
          </div>
        ))}
      </div>
    </div>
  )
}

// =============================================================================
// RESOURCE VIEWER SKELETON
// =============================================================================

/**
 * Skeleton for ResourceViewerModal content
 * Matches: Resource header + PDF/Content area + Notes section
 */
export function ResourceViewerSkeleton({ className }: ModalSkeletonProps) {
  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Header */}
      <div className="p-4 border-b space-y-2">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-32" />
      </div>

      {/* Content Area - PDF viewer placeholder */}
      <div className="flex-1 p-4">
        <Skeleton className="h-full w-full rounded-lg min-h-[300px]" />
      </div>

      {/* Footer/Notes */}
      <div className="p-4 border-t space-y-2">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-24 rounded" />
          <Skeleton className="h-8 w-24 rounded" />
        </div>
      </div>
    </div>
  )
}

// =============================================================================
// GENERIC MODAL SKELETON
// =============================================================================

/**
 * Generic skeleton for simple modals
 * Use when no specific skeleton exists
 */
export function GenericModalSkeleton({ className }: ModalSkeletonProps) {
  return (
    <div className={cn('space-y-4 p-4', className)}>
      {/* Header */}
      <div className="space-y-2">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-4 w-64" />
      </div>

      {/* Content */}
      <div className="space-y-3">
        <Skeleton className="h-16 w-full rounded-lg" />
        <Skeleton className="h-16 w-full rounded-lg" />
        <Skeleton className="h-16 w-full rounded-lg" />
      </div>

      {/* Footer */}
      <div className="flex justify-end gap-2 pt-4">
        <Skeleton className="h-10 w-24 rounded-lg" />
        <Skeleton className="h-10 w-24 rounded-lg" />
      </div>
    </div>
  )
}

export default {
  WeeklyReportSkeleton,
  CalendarHeatmapSkeleton,
  MoodInsightsSkeleton,
  RecoveryProgramSkeleton,
  GratitudeJournalSkeleton,
  CheckInsListSkeleton,
  ResourceViewerSkeleton,
  GenericModalSkeleton,
}
