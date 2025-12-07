import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { ChevronRight, CheckCircle, Calendar, Clock, Target } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { ObjectiveCard } from './ObjectiveCard'
import {
  formatDate,
  getDueDateStatus,
  makeLinksClickable,
  type GoalWithChildren,
  type Assignment,
} from '../hooks/useGoalsData'

// =============================================================================
// TYPES
// =============================================================================

export interface GoalCardProps {
  goal: GoalWithChildren
  onCompleteAssignment: (assignmentId: string) => Promise<boolean>
  onViewAssignmentDetails: (assignment: Assignment) => void
}

// =============================================================================
// COMPONENT
// =============================================================================

export function GoalCard({ goal, onCompleteAssignment, onViewAssignmentDetails }: GoalCardProps) {
  const isMobile = useMediaQuery('(max-width: 768px)')
  const [isExpanded, setIsExpanded] = useState(false)

  const isCompleted = goal.status === 'completed'
  const dueDateStatus = getDueDateStatus(goal.dueDate, isCompleted)
  const objectiveCount = goal.objectives.length
  const assignmentCount = goal.objectives.reduce((sum, o) => sum + o.assignments.length, 0)

  return (
    <Card
      className={cn(
        'mb-4 overflow-hidden border-2 border-teal-500/80',
        'bg-gradient-to-br from-slate-50 to-white',
        'shadow-sm hover:shadow-md transition-shadow',
        isMobile && 'mb-3'
      )}
    >
      {/* Goal Header - Clickable */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          'p-4 cursor-pointer',
          isExpanded && 'border-b border-teal-100',
          isMobile && 'p-3'
        )}
      >
        {/* Top Row: Icon + Badge + Title + Chevron */}
        <div className={cn('flex items-start gap-3 mb-2', isMobile && 'gap-2')}>
          {/* Target Icon */}
          <div
            className={cn(
              'shrink-0 flex items-center justify-center rounded-lg',
              'bg-teal-500/10',
              isMobile ? 'w-8 h-8' : 'w-10 h-10'
            )}
          >
            <Target
              className={cn(
                'text-teal-600',
                isMobile ? 'h-4 w-4' : 'h-5 w-5'
              )}
            />
          </div>

          <div className="flex-1 min-w-0">
            {/* Badge Row */}
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span
                className={cn(
                  'px-2 py-0.5 rounded text-white font-bold uppercase tracking-wide',
                  'bg-gradient-to-br from-teal-500 to-teal-600',
                  isMobile ? 'text-xs' : 'text-xs'
                )}
              >
                Goal
              </span>
              {isCompleted && <CheckCircle className="h-4 w-4 text-teal-500 shrink-0" />}
            </div>

            {/* Title */}
            <h3
              className={cn(
                'font-semibold text-foreground',
                isMobile ? 'text-sm' : 'text-base',
                isCompleted && 'line-through opacity-60'
              )}
            >
              {goal.title}
            </h3>
          </div>

          {/* Chevron */}
          <ChevronRight
            className={cn(
              'h-5 w-5 text-teal-400 shrink-0 mt-1 transition-transform duration-300',
              isExpanded && 'rotate-90'
            )}
          />
        </div>

        {/* Description */}
        {goal.description && (
          <div
            className={cn(
              'text-muted-foreground leading-relaxed mb-3',
              isMobile ? 'text-xs ml-10' : 'text-sm ml-[52px]'
            )}
          >
            {makeLinksClickable(goal.description)}
          </div>
        )}

        {/* Date Information */}
        <div
          className={cn(
            'flex flex-wrap gap-4 mb-3',
            isMobile ? 'gap-3 ml-10' : 'ml-[52px]'
          )}
        >
          {/* Created Date */}
          <span
            className={cn(
              'flex items-center gap-1 text-muted-foreground',
              isMobile ? 'text-xs' : 'text-xs'
            )}
          >
            <Calendar className="h-3 w-3" />
            {formatDate(goal.createdAt)}
          </span>

          {/* Due Date / Completed Date */}
          {isCompleted && goal.completedAt ? (
            <span
              className={cn(
                'flex items-center gap-1 text-blue-600 font-medium',
                isMobile ? 'text-xs' : 'text-xs'
              )}
            >
              <CheckCircle className="h-3 w-3" />
              Completed {formatDate(goal.completedAt)}
            </span>
          ) : (
            goal.dueDate && (
              <span
                className={cn(
                  'flex items-center gap-1 font-medium',
                  dueDateStatus.color,
                  isMobile ? 'text-xs' : 'text-xs'
                )}
              >
                <Clock className="h-3 w-3" />
                {dueDateStatus.text}
              </span>
            )
          )}
        </div>

        {/* Progress Bar */}
        <div className={cn(isMobile ? 'ml-10' : 'ml-[52px]')}>
          <Progress value={goal.progress} className="h-2 mb-1.5" />
          <div className="flex justify-between">
            <span
              className={cn(
                'text-teal-600 font-medium',
                isMobile ? 'text-xs' : 'text-xs'
              )}
            >
              {goal.progress}% Complete
            </span>
            <span className={cn('text-muted-foreground', isMobile ? 'text-xs' : 'text-xs')}>
              {objectiveCount} Objectives &bull; {assignmentCount} Tasks
            </span>
          </div>
        </div>
      </div>

      {/* Expanded Content: Objectives and Assignments */}
      {isExpanded && (
        <div className={cn('px-4 pb-4 bg-slate-50/50', isMobile && 'px-3 pb-3')}>
          {goal.objectives.length === 0 ? (
            <p
              className={cn(
                'text-muted-foreground italic py-3',
                isMobile ? 'text-xs ml-4' : 'text-sm ml-4'
              )}
            >
              No objectives created yet.
            </p>
          ) : (
            <div className="space-y-2 pt-2">
              {goal.objectives.map((objective) => (
                <ObjectiveCard
                  key={objective.id}
                  objective={objective}
                  onCompleteAssignment={onCompleteAssignment}
                  onViewAssignmentDetails={onViewAssignmentDetails}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </Card>
  )
}

export default GoalCard
