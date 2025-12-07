import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState, EducationIllustration } from '@/components/common'
import { ResourceCard } from './ResourceCard'
import { cn } from '@/lib/utils'
import { Search } from 'lucide-react'
import type { ResourceWithProgress } from '../hooks/useResources'

interface ResourceListProps {
  resources: ResourceWithProgress[]
  isLoading?: boolean
  emptyTitle?: string
  emptyDescription?: string
  searchQuery?: string
  onResourceClick?: (resource: ResourceWithProgress) => void
  className?: string
}

export function ResourceList({
  resources,
  isLoading = false,
  emptyTitle = 'No resources found',
  emptyDescription = 'Try adjusting your filters or search query.',
  searchQuery,
  onResourceClick,
  className,
}: ResourceListProps) {
  // Loading skeleton
  if (isLoading) {
    return (
      <div className={cn('grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4', className)}>
        {Array.from({ length: 6 }).map((_, i) => (
          <ResourceCardSkeleton key={i} />
        ))}
      </div>
    )
  }

  // Empty state
  if (resources.length === 0) {
    return (
      <EmptyState
        icon={searchQuery ? Search : undefined}
        illustration={!searchQuery ? <EducationIllustration size="lg" className="w-32 h-32 opacity-80" /> : undefined}
        title={emptyTitle}
        description={emptyDescription}
        className={className}
      />
    )
  }

  // Resource grid
  return (
    <div className={cn('grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4', className)}>
      {resources.map((resource) => (
        <ResourceCard
          key={resource.id}
          resource={resource}
          onClick={onResourceClick}
        />
      ))}
    </div>
  )
}

// =============================================================================
// SKELETON
// =============================================================================

function ResourceCardSkeleton() {
  return (
    <div className="rounded-lg border bg-card p-4 space-y-3">
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-16" />
        <Skeleton className="h-5 w-12" />
      </div>
      <Skeleton className="h-5 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-2/3" />
      <div className="flex items-center justify-between pt-2 border-t">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-3 w-12" />
      </div>
    </div>
  )
}

export default ResourceList
