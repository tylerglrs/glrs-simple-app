/**
 * TableSkeleton - Data table loading skeleton
 *
 * Content-shaped skeleton for data tables to improve perceived loading performance.
 */

import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

interface TableSkeletonProps {
  /** Number of rows to display */
  rows?: number
  /** Number of columns to display */
  columns?: number
  /** Whether to show table header */
  showHeader?: boolean
  /** Whether to show checkbox column */
  showCheckbox?: boolean
  /** Whether to show actions column */
  showActions?: boolean
  /** Additional CSS classes */
  className?: string
}

export function TableSkeleton({
  rows = 5,
  columns = 4,
  showHeader = true,
  showCheckbox = false,
  showActions = false,
  className,
}: TableSkeletonProps) {
  return (
    <div className={cn('w-full overflow-hidden rounded-lg border', className)}>
      {/* Table Header */}
      {showHeader && (
        <div className="flex items-center gap-4 border-b bg-muted/30 px-4 py-3">
          {showCheckbox && <Skeleton className="h-4 w-4 rounded" />}
          {Array.from({ length: columns }).map((_, i) => (
            <Skeleton
              key={`header-${i}`}
              className="h-4 flex-1"
              style={{ maxWidth: i === 0 ? '200px' : i === columns - 1 ? '100px' : '150px' }}
            />
          ))}
          {showActions && <Skeleton className="h-4 w-16" />}
        </div>
      )}

      {/* Table Rows */}
      <div className="divide-y">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div
            key={`row-${rowIndex}`}
            className="flex items-center gap-4 px-4 py-3"
          >
            {showCheckbox && <Skeleton className="h-4 w-4 rounded" />}
            {Array.from({ length: columns }).map((_, colIndex) => (
              <Skeleton
                key={`cell-${rowIndex}-${colIndex}`}
                className="h-4 flex-1"
                style={{
                  maxWidth: colIndex === 0 ? '200px' : colIndex === columns - 1 ? '100px' : '150px',
                  // Vary widths slightly for more realistic appearance
                  width: `${70 + Math.random() * 30}%`,
                }}
              />
            ))}
            {showActions && (
              <div className="flex gap-2">
                <Skeleton className="h-8 w-8 rounded" />
                <Skeleton className="h-8 w-8 rounded" />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

/**
 * Compact table row skeleton for simpler lists
 */
export function TableRowSkeleton({
  showAvatar = false,
  showBadge = false,
  showActions = false,
}: {
  showAvatar?: boolean
  showBadge?: boolean
  showActions?: boolean
}) {
  return (
    <div className="flex items-center gap-3 p-3">
      {showAvatar && <Skeleton className="h-10 w-10 rounded-full" />}
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
      {showBadge && <Skeleton className="h-5 w-16 rounded-full" />}
      {showActions && <Skeleton className="h-8 w-8 rounded" />}
    </div>
  )
}

/**
 * Pagination skeleton for table footers
 */
export function PaginationSkeleton() {
  return (
    <div className="flex items-center justify-between border-t px-4 py-3">
      <Skeleton className="h-4 w-40" />
      <div className="flex items-center gap-2">
        <Skeleton className="h-8 w-8 rounded" />
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-8 rounded" />
      </div>
    </div>
  )
}

export default TableSkeleton
