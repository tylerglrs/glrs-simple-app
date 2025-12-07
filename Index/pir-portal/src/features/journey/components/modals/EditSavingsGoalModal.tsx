import { useState, useEffect } from 'react'
import { Loader2, Target, DollarSign, Calendar, Trash2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { doc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore'
import { db, auth } from '@/lib/firebase'
import { updateContextAfterSavingsUpdate } from '@/lib/updateAIContext'
import type { SavingsGoal } from '../../types'

// =============================================================================
// TYPES
// =============================================================================

export interface EditSavingsGoalModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  goal: SavingsGoal | null
  onSuccess?: () => void
}

// =============================================================================
// COMPONENT
// =============================================================================

export function EditSavingsGoalModal({
  open,
  onOpenChange,
  goal,
  onSuccess,
}: EditSavingsGoalModalProps) {
  const [name, setName] = useState('')
  const [targetAmount, setTargetAmount] = useState('')
  const [description, setDescription] = useState('')
  const [targetDate, setTargetDate] = useState('')
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (goal && open) {
      setName(goal.name || '')
      setTargetAmount(goal.targetAmount?.toString() || '')
      setDescription(goal.description || '')
      setTargetDate(goal.targetDate || '')
      setError(null)
    }
  }, [goal, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!goal?.id) {
      setError('Invalid goal')
      return
    }

    if (!name.trim()) {
      setError('Please enter a goal name')
      return
    }

    const amount = parseFloat(targetAmount)
    if (isNaN(amount) || amount <= 0) {
      setError('Please enter a valid target amount')
      return
    }

    setSaving(true)
    setError(null)

    try {
      await updateDoc(doc(db, 'savingsGoals', goal.id), {
        name: name.trim(),
        targetAmount: amount,
        description: description.trim() || null,
        targetDate: targetDate || null,
        updatedAt: serverTimestamp(),
      })

      // Update AI context
      const user = auth.currentUser
      if (user) {
        await updateContextAfterSavingsUpdate(user.uid)
      }

      onOpenChange(false)
      onSuccess?.()
    } catch (err) {
      console.error('Error updating savings goal:', err)
      setError('Failed to update savings goal. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!goal?.id) return

    setDeleting(true)
    try {
      await deleteDoc(doc(db, 'savingsGoals', goal.id))

      // Update AI context
      const user = auth.currentUser
      if (user) {
        await updateContextAfterSavingsUpdate(user.uid)
      }

      setShowDeleteConfirm(false)
      onOpenChange(false)
      onSuccess?.()
    } catch (err) {
      console.error('Error deleting savings goal:', err)
      setError('Failed to delete savings goal. Please try again.')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-[95vw] sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Edit Savings Goal
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="goalName">Goal Name *</Label>
              <Input
                id="goalName"
                placeholder="e.g., Emergency Fund, Vacation, New Car"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={saving}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="targetAmount">Target Amount *</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="targetAmount"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  className="pl-9"
                  value={targetAmount}
                  onChange={(e) => setTargetAmount(e.target.value)}
                  disabled={saving}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="targetDate">Target Date (Optional)</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="targetDate"
                  type="date"
                  className="pl-9"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  disabled={saving}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                placeholder="Why is this goal important to you?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={saving}
                rows={3}
              />
            </div>

            {/* Current Progress */}
            {goal && (
              <div className="rounded-lg bg-muted/50 p-3">
                <div className="text-sm text-muted-foreground mb-1">Current Progress</div>
                <div className="text-lg font-semibold text-primary">
                  ${(goal.currentAmount || 0).toFixed(2)} / ${(goal.targetAmount || 0).toFixed(2)}
                </div>
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <Button type="submit" className="flex-1" disabled={saving || deleting}>
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </Button>
              <Button
                type="button"
                variant="destructive"
                size="icon"
                onClick={() => setShowDeleteConfirm(true)}
                disabled={saving || deleting}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Savings Goal?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete &quot;{goal?.name}&quot; and all its transaction history.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

export default EditSavingsGoalModal
