import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'

interface SkeletonCardProps {
  className?: string
}

// Basic card skeleton
export function SkeletonCard({ className }: SkeletonCardProps) {
  return (
    <div className={cn('rounded-xl border border-border p-4 space-y-3', className)}>
      <Skeleton className="h-5 w-5 rounded" />
      <div className="space-y-2">
        <Skeleton className="h-6 w-1/3" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    </div>
  )
}

// Stat card skeleton
export function SkeletonStatCard({ className }: SkeletonCardProps) {
  return (
    <div className={cn('rounded-xl border border-border p-4', className)}>
      <div className="flex items-start justify-between">
        <Skeleton className="h-9 w-9 rounded-lg" />
        <Skeleton className="h-4 w-12" />
      </div>
      <div className="mt-3 space-y-1">
        <Skeleton className="h-8 w-16" />
        <Skeleton className="h-4 w-24" />
      </div>
    </div>
  )
}

// Toolkit card skeleton
export function SkeletonToolkitCard({ className }: SkeletonCardProps) {
  return (
    <div className={cn('rounded-xl bg-slate-50 p-4', className)}>
      <Skeleton className="h-10 w-10 rounded-lg mb-3" />
      <Skeleton className="h-5 w-20 mb-1" />
      <Skeleton className="h-4 w-28" />
    </div>
  )
}

// List item skeleton
export function SkeletonListItem({ className }: SkeletonCardProps) {
  return (
    <div className={cn('flex items-center gap-3 p-3', className)}>
      <Skeleton className="h-10 w-10 rounded-full" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-48" />
      </div>
      <Skeleton className="h-8 w-8 rounded" />
    </div>
  )
}

// Hero card skeleton
export function SkeletonHeroCard({ className }: SkeletonCardProps) {
  return (
    <div className={cn('rounded-2xl bg-slate-100 p-6', className)}>
      <div className="flex items-center justify-center mb-4">
        <Skeleton className="h-24 w-24 rounded-full" />
      </div>
      <div className="text-center space-y-2">
        <Skeleton className="h-10 w-24 mx-auto" />
        <Skeleton className="h-4 w-32 mx-auto" />
      </div>
    </div>
  )
}

// Circular progress skeleton
export function SkeletonCircularProgress({ size = 100, className }: { size?: number; className?: string }) {
  return (
    <Skeleton
      className={cn('rounded-full', className)}
      style={{ width: size, height: size }}
    />
  )
}

// Grid of toolkit skeletons
export function SkeletonToolkitGrid({ count = 6, columns = 2 }: { count?: number; columns?: 2 | 3 }) {
  return (
    <div className={cn('grid gap-3', columns === 2 ? 'grid-cols-2' : 'grid-cols-3')}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonToolkitCard key={i} />
      ))}
    </div>
  )
}

// Full section skeleton
export function SkeletonSection({ className }: SkeletonCardProps) {
  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-4 w-16" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <SkeletonStatCard />
        <SkeletonStatCard />
      </div>
    </div>
  )
}
