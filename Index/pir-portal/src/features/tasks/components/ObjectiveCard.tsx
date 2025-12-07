import { useState } from 'react'
import { ChevronRight, CheckCircle, Flag } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { AssignmentItem } from './AssignmentItem'
import type { ObjectiveWithAssignments, Assignment } from '../hooks/useGoalsData'

// =============================================================================
// TYPES
// =============================================================================

export interface ObjectiveCardProps {
  objective: ObjectiveWithAssignments
  onCompleteAssignment: (assignmentId: string) => Promise<boolean>
  onViewAssignmentDetails: (assignment: Assignment) => void
}

// =============================================================================
// COMPONENT
// =============================================================================

export function ObjectiveCard({
  objective,
  onCompleteAssignment,
  onViewAssignmentDetails,
}: ObjectiveCardProps) {
  const isMobile = useMediaQuery('(max-width: 768px)')
  const [isExpanded, setIsExpanded] = useState(false)
  const isCompleted = objective.status === 'completed'
  const assignmentCount = objective.assignments.length

  return (
    <div
      className={cn(
        'ml-4 pl-4 border-l border-gray-300',
        isMobile && 'ml-3 pl-3'
      )}
    >
      {/* Objective Header - Clickable Accordion */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          'bg-white rounded-lg p-3 cursor-pointer',
          'border border-gray-200 shadow-sm',
          'transition-all hover:shadow-md hover:border-gray-300',
          isMobile && 'p-2.5'
        )}
      >
        <div className="flex items-center gap-2">
          {/* Flag Icon */}
          <div
            className={cn(
              'shrink-0 flex items-center justify-center rounded',
              'bg-gray-100',
              isMobile ? 'w-6 h-6' : 'w-7 h-7'
            )}
          >
            <Flag
              className={cn(
                'text-gray-500',
                isMobile ? 'h-3 w-3' : 'h-3.5 w-3.5'
              )}
            />
          </div>

          {/* Objective Badge */}
          <span
            className={cn(
              'px-1.5 py-0.5 rounded text-white font-bold uppercase tracking-wide',
              'bg-gradient-to-br from-gray-500 to-gray-600',
              isMobile ? 'text-xs' : 'text-xs'
            )}
          >
            Objective
          </span>

          {/* Completed Icon */}
          {isCompleted && <CheckCircle className="h-3.5 w-3.5 text-green-500 shrink-0" />}

          {/* Title */}
          <span
            className={cn(
              'flex-1 font-medium text-foreground',
              isMobile ? 'text-xs' : 'text-sm',
              isCompleted && 'line-through opacity-60'
            )}
          >
            {objective.title}
          </span>

          {/* Assignment Count */}
          <span className={cn('text-muted-foreground', isMobile ? 'text-xs' : 'text-xs')}>
            {assignmentCount} {assignmentCount === 1 ? 'task' : 'tasks'}
          </span>

          {/* Chevron */}
          <ChevronRight
            className={cn(
              'h-4 w-4 text-gray-400 shrink-0 transition-transform duration-300',
              isExpanded && 'rotate-90'
            )}
          />
        </div>
      </div>

      {/* Assignments - Only shown when expanded */}
      {isExpanded && (
        <div className={cn('mt-2 space-y-1.5', isMobile ? 'ml-9' : 'ml-10')}>
          {objective.assignments.length === 0 ? (
            <p
              className={cn(
                'text-muted-foreground italic py-2',
                isMobile ? 'text-xs' : 'text-sm'
              )}
            >
              No tasks created yet.
            </p>
          ) : (
            objective.assignments.map((assignment) => (
              <AssignmentItem
                key={assignment.id}
                assignment={assignment}
                onComplete={onCompleteAssignment}
                onViewDetails={onViewAssignmentDetails}
              />
            ))
          )}
        </div>
      )}
    </div>
  )
}

export default ObjectiveCard
