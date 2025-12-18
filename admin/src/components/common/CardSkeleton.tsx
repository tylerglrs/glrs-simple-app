/**
 * CardSkeleton - Stats and content card loading skeletons
 *
 * Content-shaped skeletons for various card types used in the admin portal.
 */

import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface CardSkeletonProps {
  className?: string
}

/**
 * Stats card skeleton - for numeric metric cards
 */
export function StatsCardSkeleton({ className }: CardSkeletonProps) {
  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-3 w-24" />
          </div>
          <Skeleton className="h-12 w-12 rounded-lg" />
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * Grid of stats cards
 */
export function StatsGridSkeleton({
  count = 4,
  className,
}: {
  count?: number
  className?: string
}) {
  return (
    <div className={cn('grid gap-4 sm:grid-cols-2 lg:grid-cols-4', className)}>
      {Array.from({ length: count }).map((_, i) => (
        <StatsCardSkeleton key={i} />
      ))}
    </div>
  )
}

/**
 * User/PIR card skeleton - matches UserCard component
 */
export function UserCardSkeleton({ className }: CardSkeletonProps) {
  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <Skeleton className="h-14 w-14 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * Activity/feed item skeleton
 */
export function ActivityItemSkeleton({ className }: CardSkeletonProps) {
  return (
    <div className={cn('flex items-start gap-3 p-3', className)}>
      <Skeleton className="h-8 w-8 rounded-full" />
      <div className="flex-1 space-y-2">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-16" />
        </div>
        <Skeleton className="h-4 w-full" />
      </div>
    </div>
  )
}

/**
 * Activity feed card skeleton
 */
export function ActivityFeedSkeleton({
  items = 5,
  className,
}: {
  items?: number
  className?: string
}) {
  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <Skeleton className="h-6 w-32" />
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y">
          {Array.from({ length: items }).map((_, i) => (
            <ActivityItemSkeleton key={i} />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * Alert/notification card skeleton
 */
export function AlertCardSkeleton({ className }: CardSkeletonProps) {
  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Skeleton className="h-10 w-10 rounded-lg" />
          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * Alerts panel skeleton
 */
export function AlertsPanelSkeleton({
  items = 3,
  className,
}: {
  items?: number
  className?: string
}) {
  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-5 w-12 rounded-full" />
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {Array.from({ length: items }).map((_, i) => (
          <AlertCardSkeleton key={i} />
        ))}
      </CardContent>
    </Card>
  )
}

/**
 * Task/priority item skeleton
 */
export function TaskItemSkeleton({ className }: CardSkeletonProps) {
  return (
    <div className={cn('flex items-center gap-3 rounded-lg border p-3', className)}>
      <Skeleton className="h-4 w-4 rounded" />
      <div className="flex-1 space-y-1.5">
        <Skeleton className="h-4 w-3/4" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
      </div>
      <Skeleton className="h-6 w-6 rounded" />
    </div>
  )
}

/**
 * Priority tasks panel skeleton
 */
export function PriorityTasksSkeleton({
  items = 4,
  className,
}: {
  items?: number
  className?: string
}) {
  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <Skeleton className="h-6 w-28" />
      </CardHeader>
      <CardContent className="space-y-2">
        {Array.from({ length: items }).map((_, i) => (
          <TaskItemSkeleton key={i} />
        ))}
      </CardContent>
    </Card>
  )
}

/**
 * Quick actions skeleton
 */
export function QuickActionsSkeleton({ className }: CardSkeletonProps) {
  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <Skeleton className="h-6 w-28" />
      </CardHeader>
      <CardContent className="space-y-2">
        <Skeleton className="h-10 w-full rounded-lg" />
        <Skeleton className="h-10 w-full rounded-lg" />
        <Skeleton className="h-10 w-full rounded-lg" />
      </CardContent>
    </Card>
  )
}

/**
 * Chart/analytics card skeleton
 */
export function ChartCardSkeleton({
  height = 200,
  className,
}: {
  height?: number
  className?: string
}) {
  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-8 w-24 rounded" />
        </div>
      </CardHeader>
      <CardContent>
        <Skeleton className="w-full rounded-lg" style={{ height }} />
      </CardContent>
    </Card>
  )
}

/**
 * Meeting card skeleton
 */
export function MeetingCardSkeleton({ className }: CardSkeletonProps) {
  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Skeleton className="h-12 w-12 rounded-lg" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-3/4" />
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-4 rounded-full" />
              <Skeleton className="h-4 w-16" />
            </div>
            <Skeleton className="h-4 w-full" />
          </div>
          <Skeleton className="h-8 w-8 rounded" />
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * Calendar widget skeleton
 */
export function CalendarWidgetSkeleton({ className }: CardSkeletonProps) {
  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-24" />
          <div className="flex items-center gap-1">
            <Skeleton className="h-8 w-8 rounded" />
            <Skeleton className="h-8 w-8 rounded" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Week days header */}
        <div className="mb-2 grid grid-cols-7 gap-1">
          {Array.from({ length: 7 }).map((_, i) => (
            <Skeleton key={`day-${i}`} className="h-4 w-full" />
          ))}
        </div>
        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: 35 }).map((_, i) => (
            <Skeleton key={`cell-${i}`} className="aspect-square w-full rounded" />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export default {
  StatsCardSkeleton,
  StatsGridSkeleton,
  UserCardSkeleton,
  ActivityItemSkeleton,
  ActivityFeedSkeleton,
  AlertCardSkeleton,
  AlertsPanelSkeleton,
  TaskItemSkeleton,
  PriorityTasksSkeleton,
  QuickActionsSkeleton,
  ChartCardSkeleton,
  MeetingCardSkeleton,
  CalendarWidgetSkeleton,
}
