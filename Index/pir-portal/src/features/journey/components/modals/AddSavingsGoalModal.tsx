import { useState } from 'react'
import { Loader2, Target, DollarSign, Calendar } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db, auth } from '@/lib/firebase'
import { updateContextAfterSavingsUpdate } from '@/lib/updateAIContext'

// =============================================================================
// TYPES
// =============================================================================

export interface AddSavingsGoalModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

// =============================================================================
// COMPONENT
// =============================================================================

export function AddSavingsGoalModal({
  open,
  onOpenChange,
  onSuccess,
}: AddSavingsGoalModalProps) {
  const [name, setName] = useState('')
  const [targetAmount, setTargetAmount] = useState('')
  const [description, setDescription] = useState('')
  const [targetDate, setTargetDate] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const resetForm = () => {
    setName('')
    setTargetAmount('')
    setDescription('')
    setTargetDate('')
    setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const user = auth.currentUser
    if (!user) {
      setError('You must be logged in to create a savings goal')
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
      await addDoc(collection(db, 'savingsGoals'), {
        userId: user.uid,
        name: name.trim(),
        targetAmount: amount,
        currentAmount: 0,
        description: description.trim() || null,
        targetDate: targetDate || null,
        isActive: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })

      // Update AI context
      await updateContextAfterSavingsUpdate(user.uid)

      resetForm()
      onOpenChange(false)
      onSuccess?.()
    } catch (err) {
      console.error('Error creating savings goal:', err)
      setError('Failed to create savings goal. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen) resetForm()
      onOpenChange(isOpen)
    }}>
      <DialogContent className="max-w-[95vw] sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Add Savings Goal
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

          <div className="flex gap-2 pt-2">
            <Button type="submit" className="flex-1" disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Create Goal'
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={saving}
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default AddSavingsGoalModal
