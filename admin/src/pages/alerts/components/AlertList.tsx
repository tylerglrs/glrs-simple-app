/**
 * AlertList Component
 * Phase 8E: Admin Crisis Dashboard
 *
 * List container for alert cards with:
 * - Pagination
 * - Empty state
 * - Loading skeletons
 * - Selection handling
 */

import { useState, useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  ChevronLeft,
  ChevronRight,
  Inbox,
} from 'lucide-react'
import { AlertCard } from './AlertCard'
import type { AlertListProps } from '../types'

interface ExtendedAlertListProps extends AlertListProps {
  /** Total count for showing "Showing X of Y" */
  totalCount?: number
}

export function AlertList({
  alerts,
  loading = false,
  onAlertSelect,
  selectedAlertId,
  onAcknowledge,
  onRespond,
  onEscalate,
  totalCount,
}: ExtendedAlertListProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  // Calculate pagination
  const totalPages = Math.ceil(alerts.length / pageSize)
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = startIndex + pageSize
  const paginatedAlerts = alerts.slice(startIndex, endIndex)

  // Reset to page 1 when alerts change
  useMemo(() => {
    if (currentPage > 1 && currentPage > totalPages) {
      setCurrentPage(1)
    }
  }, [alerts.length, pageSize, currentPage, totalPages])

  const handlePageChange = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)))
  }

  const handlePageSizeChange = (value: string) => {
    setPageSize(parseInt(value))
    setCurrentPage(1)
  }

  // Loading state
  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="border-l-4 border-l-gray-200">
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-5 w-20" />
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <Skeleton className="h-5 w-20" />
              </div>
              <div className="flex items-center gap-3 mb-3 pb-3 border-b border-gray-100">
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-4 w-32" />
              </div>
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-3/4 mb-3" />
              <div className="flex items-center gap-2">
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-8 w-16" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  // Empty state
  if (alerts.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <div className="p-4 bg-gray-100 rounded-full mb-4">
            <Inbox className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">
            No alerts found
          </h3>
          <p className="text-sm text-gray-500 text-center max-w-sm">
            No crisis alerts match your current filters. Try adjusting your
            filters or check back later.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Alert list */}
      <div className="space-y-4">
        {paginatedAlerts.map((alert) => (
          <AlertCard
            key={alert.id}
            alert={alert}
            isSelected={alert.id === selectedAlertId}
            onAcknowledge={() => onAcknowledge(alert)}
            onRespond={() => onRespond(alert)}
            onEscalate={() => onEscalate(alert)}
            onViewDetails={() => onAlertSelect(alert)}
          />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span>Showing</span>
            <Select value={pageSize.toString()} onValueChange={handlePageSizeChange}>
              <SelectTrigger className="w-[70px] h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
            <span>
              of {totalCount !== undefined ? totalCount : alerts.length} alerts
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>

            <div className="flex items-center gap-1">
              {/* Page numbers */}
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum: number
                if (totalPages <= 5) {
                  pageNum = i + 1
                } else if (currentPage <= 3) {
                  pageNum = i + 1
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i
                } else {
                  pageNum = currentPage - 2 + i
                }

                return (
                  <Button
                    key={pageNum}
                    variant={pageNum === currentPage ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handlePageChange(pageNum)}
                    className="w-8 h-8 p-0"
                  >
                    {pageNum}
                  </Button>
                )
              })}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* Simple count for single page */}
      {totalPages <= 1 && alerts.length > 0 && (
        <div className="text-sm text-gray-500 pt-4 border-t">
          Showing {alerts.length} alert{alerts.length !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  )
}

export default AlertList
