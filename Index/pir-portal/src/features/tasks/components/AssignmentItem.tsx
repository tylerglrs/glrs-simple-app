import { useState } from 'react'
import { Checkbox } from '@/components/ui/checkbox'
import { ChevronRight, CheckCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import type { Assignment } from '../hooks/useGoalsData'

// =============================================================================
// TYPES
// =============================================================================

export interface AssignmentItemProps {
  assignment: Assignment
  onComplete: (assignmentId: string) => Promise<boolean>
  onViewDetails: (assignment: Assignment) => void
}

// =============================================================================
// COMPONENT
// =============================================================================

export function AssignmentItem({ assignment, onComplete, onViewDetails }: AssignmentItemProps) {
  const isMobile = useMediaQuery('(max-width: 768px)')
  const [completing, setCompleting] = useState(false)
  const isCompleted = assignment.status === 'completed'

  const handleCheckboxChange = async (checked: boolean) => {
    if (isCompleted || !checked || completing) return

    setCompleting(true)
    try {
      await onComplete(assignment.id)
    } finally {
      setCompleting(false)
    }
  }

  return (
    <div
      className={cn(
        'flex items-center gap-2',
        isMobile ? 'gap-2' : 'gap-2.5'
      )}
    >
      {/* Status Icon/Checkbox */}
      {isCompleted ? (
        <CheckCircle
          className={cn(
            'shrink-0 text-green-500',
            isMobile ? 'h-4 w-4' : 'h-5 w-5'
          )}
        />
      ) : (
        <Checkbox
          checked={false}
          disabled={completing}
          onCheckedChange={handleCheckboxChange}
          className={cn(
            'shrink-0 border-gray-300',
            isMobile ? 'h-4 w-4' : 'h-5 w-5'
          )}
        />
      )}

      {/* Assignment Card - Clickable */}
      <div
        onClick={() => onViewDetails(assignment)}
        className={cn(
          'flex-1 bg-gray-50 rounded-md py-2 px-3',
          'cursor-pointer transition-all hover:bg-gray-100',
          isCompleted && 'opacity-60',
          isMobile && 'py-1.5 px-2.5'
        )}
      >
        <div className="flex items-center gap-2">
          {/* Title */}
          <span
            className={cn(
              'flex-1 text-foreground',
              isMobile ? 'text-xs' : 'text-sm',
              isCompleted && 'line-through'
            )}
          >
            {assignment.title}
          </span>

          {/* Arrow */}
          <ChevronRight className="h-3.5 w-3.5 text-gray-400 shrink-0" />
        </div>
      </div>
    </div>
  )
}

export default AssignmentItem
