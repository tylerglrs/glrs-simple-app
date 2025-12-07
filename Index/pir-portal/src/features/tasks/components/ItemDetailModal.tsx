import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Calendar, Clock, CheckCircle, X, MessageSquare } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import {
  formatDate,
  getDueDateStatus,
  makeLinksClickable,
  type Assignment,
  type Objective,
} from '../hooks/useGoalsData'

// =============================================================================
// TYPES
// =============================================================================

export type ItemType = 'assignment' | 'objective'

export interface ItemDetailModalProps {
  open: boolean
  onClose: () => void
  item: Assignment | Objective | null
  itemType: ItemType
  onComplete: (itemId: string) => Promise<boolean>
  onCompleteWithReflection: (itemId: string, reflection: string) => Promise<boolean>
}

// =============================================================================
// COMPONENT
// =============================================================================

export function ItemDetailModal({
  open,
  onClose,
  item,
  itemType,
  onComplete,
  onCompleteWithReflection,
}: ItemDetailModalProps) {
  const isMobile = useMediaQuery('(max-width: 768px)')
  const [showReflectionForm, setShowReflectionForm] = useState(false)
  const [reflection, setReflection] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (!item) return null

  const isCompleted = item.status === 'completed'
  const isAssignment = itemType === 'assignment'
  const assignment = item as Assignment
  const dueDateStatus = getDueDateStatus(item.dueDate, isCompleted)

  const headerGradient = isAssignment
    ? 'from-green-500 to-green-600'
    : 'from-teal-500 to-teal-600'

  const handleMarkComplete = async () => {
    if (submitting) return
    setSubmitting(true)
    try {
      await onComplete(item.id)
      onClose()
    } finally {
      setSubmitting(false)
    }
  }

  const handleCompleteWithReflection = async () => {
    if (submitting || !reflection.trim()) return
    setSubmitting(true)
    try {
      await onCompleteWithReflection(item.id, reflection.trim())
      setReflection('')
      setShowReflectionForm(false)
      onClose()
    } finally {
      setSubmitting(false)
    }
  }

  const handleClose = () => {
    setReflection('')
    setShowReflectionForm(false)
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <DialogContent
        className={cn(
          'max-w-[600px] max-h-[80vh] overflow-auto p-0',
          isMobile && 'max-w-[95vw]'
        )}
      >
        {/* Colored Header */}
        <div className={cn('p-5 bg-gradient-to-br', headerGradient)}>
          <DialogHeader>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <Badge
                  variant="secondary"
                  className="bg-black/30 text-white uppercase text-xs font-bold tracking-wide"
                >
                  {itemType}
                </Badge>
                {isCompleted && <CheckCircle className="h-4 w-4 text-white" />}
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-white hover:bg-white/20"
                onClick={handleClose}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <DialogTitle
              className={cn(
                'text-white font-semibold',
                isMobile ? 'text-lg' : 'text-xl',
                isCompleted && 'line-through'
              )}
            >
              {item.title}
            </DialogTitle>
          </DialogHeader>
        </div>

        {/* Body */}
        <div className={cn('p-5', isMobile && 'p-4')}>
          {/* Description */}
          {item.description && (
            <div className="mb-5">
              <h4 className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-medium">
                Description
              </h4>
              <div
                className={cn(
                  'bg-muted/50 rounded-lg p-3 text-foreground leading-relaxed',
                  isMobile ? 'text-sm' : 'text-base'
                )}
              >
                {makeLinksClickable(item.description)}
              </div>
            </div>
          )}

          {/* Dates */}
          <div className="flex flex-col gap-2.5 mb-5">
            {/* Created Date */}
            <div className="flex items-center gap-2.5 text-muted-foreground text-sm">
              <Calendar className="h-3.5 w-3.5" />
              <span>Created:</span>
              <span className="text-foreground">{formatDate(item.createdAt)}</span>
            </div>

            {/* Due Date */}
            {item.dueDate && (
              <div className="flex items-center gap-2.5 text-muted-foreground text-sm">
                <Clock className="h-3.5 w-3.5" />
                <span>Due:</span>
                <span className={dueDateStatus.color}>{formatDate(item.dueDate)}</span>
              </div>
            )}

            {/* Completed Date */}
            {isCompleted && item.completedAt && (
              <div className="flex items-center gap-2.5 text-green-600 text-sm">
                <CheckCircle className="h-3.5 w-3.5" />
                <span>Completed:</span>
                <span>{formatDate(item.completedAt)}</span>
              </div>
            )}
          </div>

          {/* Status Badge */}
          <div
            className={cn(
              'p-2.5 rounded-lg border mb-5',
              isCompleted
                ? 'bg-green-50 border-green-200 text-green-700'
                : 'bg-orange-50 border-orange-200 text-orange-700'
            )}
          >
            <span className="text-sm font-medium">
              Status: {isCompleted ? 'Completed' : 'Active'}
            </span>
          </div>

          {/* Existing Reflection (for assignments) */}
          {isAssignment && assignment.reflection && (
            <div className="mb-5 p-3 bg-blue-50 rounded-lg border-l-[3px] border-blue-500">
              <h4 className="text-xs uppercase tracking-wide text-blue-600 mb-2 font-medium">
                Your Reflection
              </h4>
              <p className={cn('text-foreground leading-relaxed', isMobile ? 'text-sm' : 'text-base')}>
                {assignment.reflection}
              </p>
            </div>
          )}

          {/* Reflection Form (for incomplete assignments) */}
          {isAssignment && !isCompleted && showReflectionForm && (
            <div className="mb-5 p-4 bg-muted/30 rounded-lg border">
              <label
                className={cn(
                  'block text-foreground font-medium mb-2.5',
                  isMobile ? 'text-sm' : 'text-base'
                )}
              >
                Add your reflection:
              </label>
              <Textarea
                value={reflection}
                onChange={(e) => setReflection(e.target.value)}
                placeholder="What did you learn? How did this help your recovery?"
                className="min-h-[100px] mb-3"
                autoFocus
              />
              <div className="flex gap-2.5">
                <Button
                  onClick={handleCompleteWithReflection}
                  disabled={submitting || !reflection.trim()}
                  className="flex-1 bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                >
                  Submit Reflection & Complete
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowReflectionForm(false)
                    setReflection('')
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* Action Buttons (for incomplete assignments) */}
          {isAssignment && !isCompleted && !showReflectionForm && (
            <div className="flex gap-2.5">
              <Button
                onClick={() => setShowReflectionForm(true)}
                className="flex-1 bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Complete with Reflection
              </Button>
              <Button
                onClick={handleMarkComplete}
                disabled={submitting}
                className="flex-1 bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Mark Complete Only
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default ItemDetailModal
