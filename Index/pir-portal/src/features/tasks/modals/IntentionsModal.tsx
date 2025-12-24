import { useState } from 'react'
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Sparkles, X, Loader2, Plus, Trash2, History, Share2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { useModalStore } from '@/stores/modalStore'
import { useIntentions } from '../hooks/useTasksModalData'
import { haptics } from '@/lib/animations'

// =============================================================================
// TYPES
// =============================================================================

export interface IntentionsModalProps {
  onClose: () => void
}

// =============================================================================
// COMPONENT
// =============================================================================

export function IntentionsModal({ onClose }: IntentionsModalProps) {
  const isMobile = useMediaQuery('(max-width: 768px)')
  const { todayIntentions, loading, addIntention, removeIntention } = useIntentions()
  const { openModal } = useModalStore()

  const [newIntention, setNewIntention] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleAddIntention = async (shareToCommunity = false) => {
    if (!newIntention.trim() || submitting) return

    setSubmitting(true)
    const success = await addIntention(newIntention.trim(), shareToCommunity)
    setSubmitting(false)

    if (success) {
      setNewIntention('')
      haptics.success()
    }
  }

  const handleRemoveIntention = async (intentionId: string) => {
    await removeIntention(intentionId)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleAddIntention(false)
    }
  }

  if (loading) {
    return (
      <DialogContent className="max-w-[95vw] sm:max-w-[500px]">
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
        </div>
      </DialogContent>
    )
  }

  return (
    <DialogContent className="max-w-[95vw] sm:max-w-[500px] p-0">
      {/* Header */}
      <DialogHeader className="p-5 pb-4 border-b bg-gradient-to-r from-purple-50 to-indigo-50">
        <div className="flex items-center justify-between">
          <DialogTitle className="flex items-center gap-2 text-lg font-semibold text-purple-700">
            <Sparkles className="h-5 w-5" />
            Today's Intentions
          </DialogTitle>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
            <X className="h-5 w-5" />
          </Button>
        </div>
      </DialogHeader>

      <ScrollArea className="max-h-[55vh]">
        <div className={cn('p-5 space-y-5', isMobile && 'p-4 space-y-4')}>
          {/* Add Intention */}
          <div className="bg-gray-50 rounded-lg p-4 border">
            <label className="text-sm font-medium text-foreground mb-2 block">
              Set Your Intention
            </label>
            <Input
              value={newIntention}
              onChange={(e) => setNewIntention(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="What do you want to focus on today?"
              disabled={submitting}
              className="mb-3 text-base"
            />
            <div className="flex gap-2">
              <Button
                onClick={() => handleAddIntention(false)}
                disabled={!newIntention.trim() || submitting}
                className="flex-1 bg-purple-500 hover:bg-purple-600"
              >
                {submitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Add
                  </>
                )}
              </Button>
              <Button
                onClick={() => handleAddIntention(true)}
                disabled={!newIntention.trim() || submitting}
                className="flex-1 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600"
              >
                {submitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Share2 className="h-4 w-4 mr-2" />
                    Add & Share
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Today's Intentions */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-foreground">Today's Focus</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  onClose()
                  openModal('pastIntentions')
                }}
                className="text-purple-600 border-purple-200 hover:bg-purple-50"
              >
                <History className="h-4 w-4 mr-1" />
                Past
              </Button>
            </div>

            {todayIntentions.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <Sparkles className="h-10 w-10 mx-auto text-gray-300 mb-2" />
                <p className="text-sm text-muted-foreground">
                  No intentions set for today yet.
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Add your first intention above!
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {todayIntentions.map((intention, index) => (
                  <div
                    key={intention.id}
                    className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg border border-purple-100"
                  >
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-purple-200 text-purple-700 text-sm font-medium">
                      {index + 1}
                    </span>
                    <p className="flex-1 text-foreground">{intention.text}</p>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveIntention(intention.id)}
                      className="h-8 w-8 text-gray-400 hover:text-red-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Tips */}
          <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-100">
            <h4 className="font-medium text-indigo-800 mb-2">Intention Tips</h4>
            <ul className="text-sm text-indigo-700 space-y-1">
              <li>- Focus on 1-3 key intentions</li>
              <li>- Make them specific and actionable</li>
              <li>- Review them throughout the day</li>
              <li>- Celebrate completing each one!</li>
            </ul>
          </div>
        </div>
      </ScrollArea>
    </DialogContent>
  )
}

export default IntentionsModal
