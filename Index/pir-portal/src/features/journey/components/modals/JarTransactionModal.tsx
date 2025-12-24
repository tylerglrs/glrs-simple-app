import { useState } from 'react'
import { Loader2, PiggyBank, Plus, Minus, DollarSign } from 'lucide-react'
import { ResponsiveModal } from '@/components/ui/responsive-modal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { collection, addDoc, doc, updateDoc, increment, serverTimestamp } from 'firebase/firestore'
import { db, auth } from '@/lib/firebase'
import { updateContextAfterSavingsUpdate } from '@/lib/updateAIContext'
import type { SavingsGoal } from '../../types'

// =============================================================================
// TYPES
// =============================================================================

export interface JarTransactionModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  goal: SavingsGoal | null
  onSuccess?: () => void
}

type TransactionType = 'deposit' | 'withdrawal'

// =============================================================================
// COMPONENT
// =============================================================================

export function JarTransactionModal({
  open,
  onOpenChange,
  goal,
  onSuccess,
}: JarTransactionModalProps) {
  const [type, setType] = useState<TransactionType>('deposit')
  const [amount, setAmount] = useState('')
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const resetForm = () => {
    setType('deposit')
    setAmount('')
    setNote('')
    setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const user = auth.currentUser
    if (!user || !goal?.id) {
      setError('Invalid request')
      return
    }

    const amountValue = parseFloat(amount)
    if (isNaN(amountValue) || amountValue <= 0) {
      setError('Please enter a valid amount')
      return
    }

    if (type === 'withdrawal' && amountValue > (goal.currentAmount || 0)) {
      setError('Insufficient funds in this goal')
      return
    }

    setSaving(true)
    setError(null)

    try {
      const transactionAmount = type === 'deposit' ? amountValue : -amountValue

      // Create transaction record
      await addDoc(collection(db, 'savingsTransactions'), {
        userId: user.uid,
        goalId: goal.id,
        type,
        amount: amountValue,
        note: note.trim() || null,
        createdAt: serverTimestamp(),
      })

      // Update goal current amount
      await updateDoc(doc(db, 'savingsGoals', goal.id), {
        currentAmount: increment(transactionAmount),
        updatedAt: serverTimestamp(),
      })

      // Update AI context
      await updateContextAfterSavingsUpdate(user.uid)

      resetForm()
      onOpenChange(false)
      onSuccess?.()
    } catch (err) {
      console.error('Error recording transaction:', err)
      setError('Failed to record transaction. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const currentAmount = goal?.currentAmount || 0
  const targetAmount = goal?.targetAmount || 0
  const progress = targetAmount > 0 ? Math.min(100, (currentAmount / targetAmount) * 100) : 0

  return (
    <ResponsiveModal open={open} onOpenChange={(isOpen) => {
      if (!isOpen) resetForm()
      onOpenChange(isOpen)
    }} desktopSize="md">
      <div className="flex flex-col h-full bg-white overflow-hidden">
        <div className="px-4 py-3 border-b shrink-0">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <PiggyBank className="h-5 w-5 text-primary" />
            {goal?.name || 'Savings Goal'}
          </h2>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Current Balance */}
        <div className="rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 p-4 text-center">
          <p className="text-xs text-muted-foreground mb-1">Current Balance</p>
          <div className="text-3xl font-bold text-primary">
            ${currentAmount.toFixed(2)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {progress.toFixed(0)}% of ${targetAmount.toFixed(2)} goal
          </p>
          <div className="mt-2 h-2 w-full rounded-full bg-muted overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {/* Transaction Type Toggle */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setType('deposit')}
              className={cn(
                'flex items-center justify-center gap-2 rounded-lg border-2 p-3 transition-all',
                type === 'deposit'
                  ? 'border-green-500 bg-green-50 text-green-700'
                  : 'border-border bg-muted/30 text-muted-foreground'
              )}
            >
              <Plus className="h-4 w-4" />
              Deposit
            </button>
            <button
              type="button"
              onClick={() => setType('withdrawal')}
              className={cn(
                'flex items-center justify-center gap-2 rounded-lg border-2 p-3 transition-all',
                type === 'withdrawal'
                  ? 'border-red-500 bg-red-50 text-red-700'
                  : 'border-border bg-muted/30 text-muted-foreground'
              )}
            >
              <Minus className="h-4 w-4" />
              Withdraw
            </button>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount *</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="amount"
                type="number"
                inputMode="decimal"
                min="0.01"
                step="0.01"
                placeholder="0.00"
                className="pl-9"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                disabled={saving}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="note">Note (Optional)</Label>
            <Textarea
              id="note"
              placeholder="What's this for?"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              disabled={saving}
              rows={2}
            />
          </div>

          {/* Quick Amount Buttons */}
          <div className="flex gap-2 flex-wrap">
            {[5, 10, 20, 50, 100].map((quickAmount) => (
              <Button
                key={quickAmount}
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setAmount(quickAmount.toString())}
                disabled={saving}
              >
                ${quickAmount}
              </Button>
            ))}
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              type="submit"
              className={cn(
                'flex-1',
                type === 'deposit'
                  ? 'bg-green-600 hover:bg-green-700'
                  : 'bg-red-600 hover:bg-red-700'
              )}
              disabled={saving}
            >
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : type === 'deposit' ? (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Funds
                </>
              ) : (
                <>
                  <Minus className="mr-2 h-4 w-4" />
                  Withdraw
                </>
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
        </div>
      </div>
    </ResponsiveModal>
  )
}

export default JarTransactionModal
