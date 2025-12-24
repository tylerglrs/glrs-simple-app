import { useState, useEffect } from 'react'
import {
  Loader2,
  History,
  Plus,
  Minus,
  Calendar,
  DollarSign,
  TrendingUp,
  TrendingDown,
} from 'lucide-react'
import { ResponsiveModal } from '@/components/ui/responsive-modal'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  Timestamp,
} from 'firebase/firestore'
import { db, auth } from '@/lib/firebase'
import type { SavingsGoal } from '../../types'

// =============================================================================
// TYPES
// =============================================================================

export interface SavingsHistoryModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  goal: SavingsGoal | null
}

interface Transaction {
  id: string
  type: 'deposit' | 'withdrawal'
  amount: number
  note?: string
  createdAt: Timestamp
}

// =============================================================================
// COMPONENT
// =============================================================================

export function SavingsHistoryModal({
  open,
  onOpenChange,
  goal,
}: SavingsHistoryModalProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!open || !goal?.id) return

    const loadTransactions = async () => {
      const user = auth.currentUser
      if (!user) return

      setLoading(true)
      try {
        const q = query(
          collection(db, 'savingsTransactions'),
          where('userId', '==', user.uid),
          where('goalId', '==', goal.id),
          orderBy('createdAt', 'desc')
        )

        const snapshot = await getDocs(q)
        setTransactions(
          snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as Transaction[]
        )
      } catch (error) {
        console.error('Error loading transactions:', error)
      } finally {
        setLoading(false)
      }
    }

    loadTransactions()
  }, [open, goal?.id])

  // Calculate totals
  const totalDeposits = transactions
    .filter((t) => t.type === 'deposit')
    .reduce((sum, t) => sum + t.amount, 0)

  const totalWithdrawals = transactions
    .filter((t) => t.type === 'withdrawal')
    .reduce((sum, t) => sum + t.amount, 0)

  const formatDate = (timestamp: Timestamp) => {
    const date = timestamp.toDate()
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    })
  }

  return (
    <ResponsiveModal open={open} onOpenChange={onOpenChange} desktopSize="md">
      <div className="flex flex-col h-full bg-white overflow-hidden">
        <div className="px-4 py-3 border-b shrink-0">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <History className="h-5 w-5 text-primary" />
            Transaction History
          </h2>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Goal Info */}
        {goal && (
          <div className="rounded-lg bg-muted/50 p-3 mb-4">
            <div className="text-sm font-medium">{goal.name}</div>
            <div className="text-2xl font-bold text-primary mt-1">
              ${(goal.currentAmount || 0).toFixed(2)}
            </div>
          </div>
        )}

        {/* Summary Stats */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="rounded-lg bg-green-50 p-3 text-center">
            <div className="flex items-center justify-center gap-1 text-green-600 mb-1">
              <TrendingUp className="h-4 w-4" />
              <span className="text-xs font-medium">Total Deposits</span>
            </div>
            <div className="text-lg font-bold text-green-700">
              ${totalDeposits.toFixed(2)}
            </div>
          </div>
          <div className="rounded-lg bg-red-50 p-3 text-center">
            <div className="flex items-center justify-center gap-1 text-red-600 mb-1">
              <TrendingDown className="h-4 w-4" />
              <span className="text-xs font-medium">Total Withdrawals</span>
            </div>
            <div className="text-lg font-bold text-red-700">
              ${totalWithdrawals.toFixed(2)}
            </div>
          </div>
        </div>

        {/* Transaction List */}
        <div className="flex-1 overflow-y-auto min-h-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <DollarSign className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="font-medium">No Transactions Yet</p>
              <p className="text-sm">Add funds to start building your savings.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {transactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center gap-3 rounded-lg border p-3"
                >
                  <div
                    className={cn(
                      'flex h-10 w-10 items-center justify-center rounded-full',
                      transaction.type === 'deposit'
                        ? 'bg-green-100 text-green-600'
                        : 'bg-red-100 text-red-600'
                    )}
                  >
                    {transaction.type === 'deposit' ? (
                      <Plus className="h-5 w-5" />
                    ) : (
                      <Minus className="h-5 w-5" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span
                        className={cn(
                          'font-semibold',
                          transaction.type === 'deposit'
                            ? 'text-green-700'
                            : 'text-red-700'
                        )}
                      >
                        {transaction.type === 'deposit' ? '+' : '-'}$
                        {transaction.amount.toFixed(2)}
                      </span>
                    </div>
                    {transaction.note && (
                      <p className="text-sm text-muted-foreground truncate">
                        {transaction.note}
                      </p>
                    )}
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                      <Calendar className="h-3 w-3" />
                      {formatDate(transaction.createdAt)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-4 border-t shrink-0">
          <Button onClick={() => onOpenChange(false)} className="w-full">
            Close
          </Button>
        </div>
        </div>
      </div>
    </ResponsiveModal>
  )
}

export default SavingsHistoryModal
