import { useState } from 'react'
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Checkbox } from '@/components/ui/checkbox'
import { Share2, X, Loader2, Target, CheckCircle, Users } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useGoalsData } from '../hooks/useGoalsData'
import { db, auth } from '@/lib/firebase'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'

// =============================================================================
// TYPES
// =============================================================================

export interface ShareGoalModalProps {
  onClose: () => void
}

// =============================================================================
// COMPONENT
// =============================================================================

export function ShareGoalModal({ onClose }: ShareGoalModalProps) {
  const { goals, loading } = useGoalsData()

  const [selectedGoals, setSelectedGoals] = useState<string[]>([])
  const [sharing, setSharing] = useState(false)
  const [shared, setShared] = useState(false)

  const handleToggleGoal = (goalId: string) => {
    setSelectedGoals((prev) =>
      prev.includes(goalId)
        ? prev.filter((id) => id !== goalId)
        : [...prev, goalId]
    )
  }

  const handleShare = async () => {
    if (selectedGoals.length === 0 || sharing) return

    const userId = auth.currentUser?.uid
    if (!userId) return

    setSharing(true)
    try {
      const selectedGoalData = goals.filter((g) => selectedGoals.includes(g.id))

      for (const goal of selectedGoalData) {
        await addDoc(collection(db, 'communityMessages'), {
          userId,
          type: 'goal_share',
          goalId: goal.id,
          goalTitle: goal.title,
          goalProgress: 0,
          message: `I'm working on: "${goal.title}"`,
          createdAt: serverTimestamp(),
          likes: [],
          comments: []
        })
      }

      setShared(true)
      setTimeout(() => {
        onClose()
      }, 1500)
    } catch (error) {
      console.error('Error sharing goals:', error)
    } finally {
      setSharing(false)
    }
  }

  if (loading) {
    return (
      <DialogContent className="max-w-[95vw] sm:max-w-[500px]">
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-teal-500" />
        </div>
      </DialogContent>
    )
  }

  if (shared) {
    return (
      <DialogContent className="max-w-[95vw] sm:max-w-[500px]">
        <div className="flex flex-col items-center justify-center py-12">
          <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
          <h3 className="text-xl font-semibold text-foreground mb-2">
            Goals Shared!
          </h3>
          <p className="text-sm text-muted-foreground text-center">
            Your goals have been shared with the community.
          </p>
        </div>
      </DialogContent>
    )
  }

  return (
    <DialogContent className="max-w-[95vw] sm:max-w-[500px] p-0">
      {/* Header */}
      <DialogHeader className="p-5 pb-4 border-b">
        <div className="flex items-center justify-between">
          <DialogTitle className="flex items-center gap-2 text-lg font-semibold text-teal-600">
            <Share2 className="h-5 w-5" />
            Share Your Goals
          </DialogTitle>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
            <X className="h-5 w-5" />
          </Button>
        </div>
      </DialogHeader>

      <ScrollArea className="max-h-[55vh]">
        <div className="p-4 space-y-4 md:p-5 md:space-y-5">
          {/* Info */}
          <div className="bg-teal-50 rounded-lg p-4 border border-teal-100">
            <div className="flex gap-3">
              <Users className="h-5 w-5 text-teal-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-teal-800 mb-1">
                  Share with Community
                </h4>
                <p className="text-sm text-teal-700">
                  Sharing your goals helps build accountability and inspires others on their journey.
                </p>
              </div>
            </div>
          </div>

          {/* Goals List */}
          <div>
            <h3 className="font-semibold text-foreground mb-3">Select Goals to Share</h3>
            {goals.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <Target className="h-10 w-10 mx-auto text-gray-300 mb-2" />
                <p className="text-sm text-muted-foreground">
                  No goals to share yet. Create a goal first!
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {goals.map((goal) => (
                  <div
                    key={goal.id}
                    className={cn(
                      'flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors',
                      selectedGoals.includes(goal.id)
                        ? 'bg-teal-50 border-teal-200'
                        : 'bg-gray-50 hover:bg-gray-100'
                    )}
                    onClick={() => handleToggleGoal(goal.id)}
                  >
                    <Checkbox
                      checked={selectedGoals.includes(goal.id)}
                      onCheckedChange={() => handleToggleGoal(goal.id)}
                      className="mt-0.5"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground">
                        {goal.title}
                      </p>
                      {goal.description && (
                        <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">
                          {goal.description}
                        </p>
                      )}
                      <p className="text-xs text-teal-600 mt-2">
                        {goal.status === 'completed' ? 'Completed' : 'In Progress'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Share Button */}
          {goals.length > 0 && (
            <Button
              onClick={handleShare}
              disabled={selectedGoals.length === 0 || sharing}
              className="w-full bg-gradient-to-r from-teal-500 to-green-500 hover:from-teal-600 hover:to-green-600"
            >
              {sharing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Share2 className="h-4 w-4 mr-2" />
                  Share {selectedGoals.length > 0 ? `${selectedGoals.length} Goal${selectedGoals.length !== 1 ? 's' : ''}` : 'Selected'}
                </>
              )}
            </Button>
          )}
        </div>
      </ScrollArea>
    </DialogContent>
  )
}

export default ShareGoalModal
