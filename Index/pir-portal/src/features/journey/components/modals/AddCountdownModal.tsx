import { useState } from 'react'
import { CalendarDays, Loader2, Target } from 'lucide-react'
import { ResponsiveModal } from '@/components/ui/responsive-modal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { addDoc, collection, serverTimestamp, Timestamp } from 'firebase/firestore'
import { db, auth } from '@/lib/firebase'
import { updateContextAfterCountdownGoalAdd } from '@/lib/updateAIContext'

// =============================================================================
// TYPES
// =============================================================================

export interface AddCountdownModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

// =============================================================================
// COMPONENT
// =============================================================================

export function AddCountdownModal({
  open,
  onOpenChange,
  onSuccess,
}: AddCountdownModalProps) {
  const [title, setTitle] = useState('')
  const [targetDate, setTargetDate] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState<string>('personal')
  const [icon, setIcon] = useState('🎯')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Calculate days until target
  const daysUntil = targetDate
    ? Math.ceil((new Date(targetDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null

  const handleSave = async () => {
    const user = auth.currentUser
    if (!user) {
      setError('Not authenticated')
      return
    }

    if (!title.trim()) {
      setError('Please enter a goal name')
      return
    }

    if (!targetDate) {
      setError('Please select a target date')
      return
    }

    if (daysUntil !== null && daysUntil < 0) {
      setError('Target date must be in the future')
      return
    }

    setSaving(true)
    setError(null)

    try {
      await addDoc(collection(db, 'countdownGoals'), {
        userId: user.uid,
        title: title.trim(),
        targetDate: Timestamp.fromDate(new Date(targetDate)),
        description: description.trim() || null,
        category,
        icon,
        isCompleted: false,
        createdAt: serverTimestamp(),
      })

      // Update AI context
      await updateContextAfterCountdownGoalAdd(user.uid)

      // Reset form
      setTitle('')
      setTargetDate('')
      setDescription('')
      setCategory('personal')
      setIcon('🎯')

      onSuccess?.()
      onOpenChange(false)
    } catch (err) {
      console.error('Error creating countdown:', err)
      setError('Failed to create goal. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleClose = () => {
    setTitle('')
    setTargetDate('')
    setDescription('')
    setCategory('personal')
    setIcon('🎯')
    setError(null)
    onOpenChange(false)
  }

  return (
    <ResponsiveModal open={open} onOpenChange={handleClose} desktopSize="md">
      <div className="flex flex-col h-full bg-white overflow-hidden">
        <div className="px-4 py-3 border-b shrink-0">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-primary" />
            Add Custom Goal
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Create a custom goal to celebrate upcoming recovery milestones.
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Goal Name */}
          <div className="space-y-2">
            <Label htmlFor="title">Goal Name *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., 6 Months Sober, First Year Anniversary"
            />
          </div>

          {/* Target Date */}
          <div className="space-y-2">
            <Label htmlFor="targetDate">Target Date *</Label>
            <Input
              id="targetDate"
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="personal">Personal</SelectItem>
                <SelectItem value="financial">Financial</SelectItem>
                <SelectItem value="health">Health</SelectItem>
                <SelectItem value="career">Career</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Icon */}
          <div className="space-y-2">
            <Label htmlFor="icon">Icon/Emoji</Label>
            <Input
              id="icon"
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
              placeholder="🎯"
              maxLength={2}
              className="text-center text-2xl"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What you're looking forward to..."
              className="min-h-[80px]"
            />
          </div>

          {/* Preview */}
          {title && targetDate && daysUntil !== null && daysUntil >= 0 && (
            <div className="rounded-xl bg-gradient-to-br from-primary to-primary/70 p-6 text-center text-white">
              <h4 className="text-xs font-medium opacity-80 mb-2">Preview</h4>
              <div className="text-4xl mb-2">{icon}</div>
              <div className="text-4xl font-bold mb-1">{daysUntil}</div>
              <div className="text-sm opacity-90">
                {daysUntil === 1 ? 'day' : 'days'}
              </div>
              <div className="text-base font-semibold mt-2">until {title}</div>
              {description && (
                <p className="text-xs opacity-75 mt-2 italic">"{description}"</p>
              )}
            </div>
          )}

          {/* Error */}
          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              onClick={handleSave}
              disabled={saving || !title || !targetDate}
              className="flex-1"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <Target className="h-4 w-4 mr-2" />
                  Add Goal
                </>
              )}
            </Button>
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </ResponsiveModal>
  )
}

export default AddCountdownModal
