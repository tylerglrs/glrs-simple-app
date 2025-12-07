import { Skeleton } from "@/components/ui/skeleton"

/**
 * SkeletonCard - Loading skeleton for template cards
 * Matches the TemplateCard layout with animated shimmer effect
 */
export function SkeletonCard() {
  return (
    <div className="overflow-hidden rounded-xl bg-white shadow-sm">
      {/* Preview area skeleton */}
      <Skeleton className="h-40 w-full rounded-none" />

      {/* Content skeleton */}
      <div className="p-4">
        {/* Title skeleton */}
        <Skeleton className="mb-3 h-5 w-3/4" />

        {/* Metadata skeleton */}
        <Skeleton className="mb-4 h-4 w-1/2" />

        {/* Status badge skeleton */}
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
    </div>
  )
}

export default SkeletonCard
