import { useState, useEffect, useMemo } from 'react'
import {
  Loader2,
  Clock,
  Target,
  DollarSign,
  TrendingUp,
  CheckCircle,
  Calendar,
} from 'lucide-react'
import { ResponsiveModal } from '@/components/ui/responsive-modal'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  doc,
  getDoc,
} from 'firebase/firestore'
import { db, auth } from '@/lib/firebase'
import type { SavingsGoal } from '../../types'

// =============================================================================
// TYPES
// =============================================================================

export interface FinanceCountdownModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface CountdownItem {
  id: string
  name: string
  targetAmount: number
  currentAmount: number
  daysAway: number
  progress: number
  isUnlocked: boolean
  targetDate?: string
}

// =============================================================================
// COMPONENT
// =============================================================================

export function FinanceCountdownModal({
  open,
  onOpenChange,
}: FinanceCountdownModalProps) {
  const [goals, setGoals] = useState<SavingsGoal[]>([])
  const [dailySavings, setDailySavings] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!open) return

    const user = auth.currentUser
    if (!user) return

    setLoading(true)

    // Load user's daily savings rate
    const loadDailySavings = async () => {
      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid))
        if (userDoc.exists()) {
          setDailySavings(userDoc.data().dailyCost || 0)
        }
      } catch (error) {
        console.error('Error loading daily savings:', error)
      }
    }

    loadDailySavings()

    // Subscribe to savings goals
    const q = query(
      collection(db, 'savingsGoals'),
      where('userId', '==', user.uid),
      where('isActive', '==', true),
      orderBy('createdAt', 'desc')
    )

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        setGoals(
          snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as SavingsGoal[]
        )
        setLoading(false)
      },
      (error) => {
        console.error('Error loading goals:', error)
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [open])

  // Calculate countdown for each goal
  const countdownItems = useMemo((): CountdownItem[] => {
    return goals
      .map((goal) => {
        const remaining = (goal.targetAmount || 0) - (goal.currentAmount || 0)
        const daysAway =
          dailySavings > 0 ? Math.max(0, Math.ceil(remaining / dailySavings)) : 999
        const progress =
          (goal.targetAmount || 0) > 0
            ? Math.min(100, ((goal.currentAmount || 0) / (goal.targetAmount || 0)) * 100)
            : 0
        const isUnlocked = remaining <= 0

        return {
          id: goal.id,
          name: goal.name,
          targetAmount: goal.targetAmount || 0,
          currentAmount: goal.currentAmount || 0,
          daysAway,
          progress,
          isUnlocked,
          targetDate: goal.targetDate,
        }
      })
      .sort((a, b) => {
        // Unlocked items first, then by days away
        if (a.isUnlocked && !b.isUnlocked) return -1
        if (!a.isUnlocked && b.isUnlocked) return 1
        return a.daysAway - b.daysAway
      })
  }, [goals, dailySavings])

  const unlockedCount = countdownItems.filter((item) => item.isUnlocked).length
  const totalGoals = countdownItems.length

  return (
    <ResponsiveModal open={open} onOpenChange={onOpenChange} desktopSize="md">
      <div className="flex flex-col h-full bg-white overflow-hidden">
        <div className="px-4 py-3 border-b shrink-0">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Financial Countdown
          </h2>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Daily Savings Info */}
        <div className="rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 p-4 text-center">
          <p className="text-xs text-muted-foreground mb-1">
            Daily Savings Rate
          </p>
          <div className="text-3xl font-bold text-primary">
            ${dailySavings.toFixed(2)}/day
          </div>
          {unlockedCount > 0 && (
            <p className="text-sm text-green-600 mt-2 flex items-center justify-center gap-1">
              <CheckCircle className="h-4 w-4" />
              {unlockedCount} of {totalGoals} goals unlocked!
            </p>
          )}
        </div>

        {/* Goals List */}
        <div className="flex-1 overflow-y-auto min-h-0 space-y-3 py-2">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : countdownItems.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Target className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="font-medium">No Savings Goals</p>
              <p className="text-sm">Create a savings goal to start tracking.</p>
            </div>
          ) : (
            countdownItems.map((item) => (
              <div
                key={item.id}
                className={cn(
                  'rounded-xl border p-4 transition-all',
                  item.isUnlocked
                    ? 'border-green-500 bg-green-50'
                    : 'border-border bg-white'
                )}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-foreground truncate">
                      {item.name}
                    </h4>
                    <div className="text-sm text-muted-foreground">
                      ${item.currentAmount.toFixed(2)} of ${item.targetAmount.toFixed(2)}
                    </div>
                  </div>
                  {item.isUnlocked ? (
                    <div className="flex items-center gap-1 rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
                      <CheckCircle className="h-3 w-3" />
                      Unlocked!
                    </div>
                  ) : (
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary">
                        {item.daysAway}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {item.daysAway === 1 ? 'day' : 'days'}
                      </div>
                    </div>
                  )}
                </div>

                <Progress value={item.progress} className="h-2" />

                <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    {item.progress.toFixed(0)}% complete
                  </span>
                  {item.targetDate && (
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Target: {new Date(item.targetDate).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Help Text */}
        {dailySavings === 0 && countdownItems.length > 0 && (
          <div className="rounded-lg bg-amber-50 p-3 text-sm text-amber-700">
            <DollarSign className="inline h-4 w-4 mr-1" />
            Set your daily savings rate in profile to see countdown estimates.
          </div>
        )}

        <Button onClick={() => onOpenChange(false)} className="w-full">
          Close
        </Button>
        </div>
      </div>
    </ResponsiveModal>
  )
}

export default FinanceCountdownModal
