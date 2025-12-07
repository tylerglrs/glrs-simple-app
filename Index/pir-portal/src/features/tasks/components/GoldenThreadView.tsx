import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Target, CheckCircle, Sparkles, Loader2, Trophy } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { useGoalsData, type Assignment } from '../hooks/useGoalsData'
import { GoalCard } from './GoalCard'
import { ItemDetailModal } from './ItemDetailModal'

// =============================================================================
// TYPES
// =============================================================================

export interface GoldenThreadViewProps {
  onOpenModal?: (modal: string) => void
}

// =============================================================================
// EMPTY STATE
// =============================================================================

function EmptyGoalsState() {
  const isMobile = useMediaQuery('(max-width: 768px)')

  return (
    <div
      className={cn(
        'bg-gradient-to-br from-blue-50/50 to-teal-50/50 rounded-xl',
        'p-10 text-center border-2 border-dashed border-blue-300',
        isMobile && 'p-6'
      )}
    >
      <Target
        className={cn(
          'mx-auto mb-4 text-blue-600',
          isMobile ? 'h-12 w-12' : 'h-14 w-14'
        )}
      />
      <h3
        className={cn(
          'font-semibold text-foreground mb-2',
          isMobile ? 'text-base' : 'text-lg'
        )}
      >
        Your Goal Journey Awaits
      </h3>
      <p
        className={cn(
          'text-muted-foreground leading-relaxed mb-4',
          isMobile ? 'text-sm' : 'text-base'
        )}
      >
        Your coach will create personalized goals tailored to your recovery journey.
        Check back soon to see your customized roadmap to success.
      </p>
      <div
        className={cn(
          'flex items-center justify-center gap-2 text-blue-600 font-medium',
          isMobile ? 'text-xs' : 'text-sm'
        )}
      >
        <Sparkles className="h-4 w-4" />
        <span>Goals will appear here once assigned</span>
      </div>
    </div>
  )
}

// =============================================================================
// LOADING STATE
// =============================================================================

function LoadingState() {
  return (
    <div className="flex items-center justify-center py-16">
      <Loader2 className="h-8 w-8 animate-spin text-teal-500" />
    </div>
  )
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function GoldenThreadView({ onOpenModal: _onOpenModal }: GoldenThreadViewProps) {
  // Note: onOpenModal reserved for future sidebar modal integration
  const isMobile = useMediaQuery('(max-width: 768px)')
  const {
    activeGoals,
    completedGoals,
    loading,
    completeAssignment,
    saveReflectionAndComplete,
  } = useGoalsData()

  // Modal state for assignment details
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  // Handle viewing assignment details
  const handleViewAssignmentDetails = useCallback((assignment: Assignment) => {
    setSelectedAssignment(assignment)
    setModalOpen(true)
  }, [])

  // Handle closing the modal
  const handleCloseModal = useCallback(() => {
    setModalOpen(false)
    setSelectedAssignment(null)
  }, [])

  // Handle completing an assignment
  const handleCompleteAssignment = useCallback(
    async (assignmentId: string) => {
      return await completeAssignment(assignmentId)
    },
    [completeAssignment]
  )

  // Handle completing with reflection
  const handleCompleteWithReflection = useCallback(
    async (assignmentId: string, reflection: string) => {
      return await saveReflectionAndComplete(assignmentId, reflection)
    },
    [saveReflectionAndComplete]
  )

  if (loading) {
    return <LoadingState />
  }

  const hasGoals = activeGoals.length > 0 || completedGoals.length > 0
  const totalGoals = activeGoals.length + completedGoals.length
  const completionRate = totalGoals > 0 ? Math.round((completedGoals.length / totalGoals) * 100) : 0

  return (
    <ScrollArea className="h-full">
      <div className={cn('p-5 max-w-[800px] mx-auto', isMobile && 'p-4')}>
        {/* Hero Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            'bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50',
            'rounded-xl p-5 mb-6 border border-amber-200/50',
            isMobile && 'p-4 mb-4'
          )}
        >
          <div className="flex items-start gap-4">
            <div
              className={cn(
                'shrink-0 flex items-center justify-center rounded-xl',
                'bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg',
                isMobile ? 'w-12 h-12' : 'w-14 h-14'
              )}
            >
              <Sparkles
                className={cn('text-white', isMobile ? 'h-6 w-6' : 'h-7 w-7')}
              />
            </div>
            <div className="flex-1 min-w-0">
              <h1
                className={cn(
                  'font-bold text-foreground mb-1',
                  isMobile ? 'text-lg' : 'text-xl'
                )}
              >
                Golden Thread
              </h1>
              <p
                className={cn(
                  'text-muted-foreground leading-relaxed',
                  isMobile ? 'text-xs' : 'text-sm'
                )}
              >
                Your personalized goals woven together by your coach to guide your recovery journey.
              </p>
              {hasGoals && (
                <div className={cn('flex items-center gap-3 mt-3', isMobile && 'mt-2')}>
                  <span
                    className={cn(
                      'px-2 py-1 rounded-full bg-teal-100 text-teal-700 font-medium',
                      isMobile ? 'text-xs' : 'text-sm'
                    )}
                  >
                    {activeGoals.length} Active
                  </span>
                  <span
                    className={cn(
                      'px-2 py-1 rounded-full bg-green-100 text-green-700 font-medium',
                      isMobile ? 'text-xs' : 'text-sm'
                    )}
                  >
                    {completedGoals.length} Completed
                  </span>
                  {completionRate > 0 && (
                    <span
                      className={cn(
                        'text-muted-foreground',
                        isMobile ? 'text-xs' : 'text-sm'
                      )}
                    >
                      {completionRate}% overall
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Active Goals Section */}
        {!hasGoals ? (
          <EmptyGoalsState />
        ) : activeGoals.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={cn(
              'bg-gradient-to-br from-green-50 to-teal-50 rounded-xl',
              'p-6 text-center border border-green-200 mb-6',
              isMobile && 'p-4'
            )}
          >
            <Trophy
              className={cn('mx-auto mb-3 text-green-500', isMobile ? 'h-10 w-10' : 'h-12 w-12')}
            />
            <h3
              className={cn(
                'font-semibold text-foreground mb-1',
                isMobile ? 'text-sm' : 'text-base'
              )}
            >
              All Goals Completed!
            </h3>
            <p className={cn('text-muted-foreground', isMobile ? 'text-xs' : 'text-sm')}>
              Amazing work! You&apos;ve completed all your current goals.
            </p>
          </motion.div>
        ) : (
          <div className="mb-6">
            <h2
              className={cn(
                'font-semibold text-foreground mb-3 flex items-center gap-2',
                isMobile ? 'text-sm' : 'text-base'
              )}
            >
              <Target className={cn('text-teal-500', isMobile ? 'h-4 w-4' : 'h-5 w-5')} />
              Active Goals
            </h2>
            <div className="space-y-3">
              {activeGoals.map((goal, index) => (
                <motion.div
                  key={goal.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <GoalCard
                    goal={goal}
                    onCompleteAssignment={handleCompleteAssignment}
                    onViewAssignmentDetails={handleViewAssignmentDetails}
                  />
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Completed Goals Section */}
        {completedGoals.length > 0 && (
          <div className="mt-6">
            <h2
              className={cn(
                'font-semibold text-foreground mb-3 flex items-center gap-2',
                isMobile ? 'text-sm' : 'text-base'
              )}
            >
              <CheckCircle className={cn('text-green-500', isMobile ? 'h-4 w-4' : 'h-5 w-5')} />
              Completed Goals
            </h2>
            <div className="space-y-3 opacity-75">
              {completedGoals.map((goal) => (
                <GoalCard
                  key={goal.id}
                  goal={goal}
                  onCompleteAssignment={handleCompleteAssignment}
                  onViewAssignmentDetails={handleViewAssignmentDetails}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Assignment Detail Modal */}
      <ItemDetailModal
        open={modalOpen}
        onClose={handleCloseModal}
        item={selectedAssignment}
        itemType="assignment"
        onComplete={handleCompleteAssignment}
        onCompleteWithReflection={handleCompleteWithReflection}
      />
    </ScrollArea>
  )
}

export default GoldenThreadView
