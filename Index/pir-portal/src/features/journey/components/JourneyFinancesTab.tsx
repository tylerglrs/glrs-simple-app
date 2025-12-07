import { useState, useEffect } from 'react'
import {
  DollarSign,
  PiggyBank,
  Target,
  TrendingUp,
  Plus,
  Loader2,
  Trash2,
  Edit,
  MapPin,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { db, auth } from '@/lib/firebase'
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  deleteDoc,
  doc,
} from 'firebase/firestore'
import { useJourneyData } from '../hooks/useJourneyData'
import type { SavingsGoal } from '../types'

// =============================================================================
// SAVINGS JAR COMPONENT
// =============================================================================

interface SavingsJarProps {
  totalSaved: number
  dailyCost: number
  daysSober: number
  loading: boolean
}

function SavingsJar({ totalSaved, dailyCost, daysSober, loading }: SavingsJarProps) {
  if (loading) {
    return (
      <div className="flex h-48 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div
      className={cn(
        'rounded-xl border-2 border-primary/30 p-6',
        'bg-gradient-to-br from-primary/10 to-primary/5'
      )}
    >
      <div className="flex items-center gap-3">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/20">
          <PiggyBank className="h-7 w-7 text-primary" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Money Saved</p>
          <p className="text-3xl font-bold text-primary">
            ${totalSaved.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4">
        <div className="rounded-lg bg-white/50 p-3">
          <p className="text-xs text-muted-foreground">Daily Cost</p>
          <p className="text-lg font-semibold text-foreground">
            ${dailyCost.toFixed(2)}
          </p>
        </div>
        <div className="rounded-lg bg-white/50 p-3">
          <p className="text-xs text-muted-foreground">Days Sober</p>
          <p className="text-lg font-semibold text-foreground">{daysSober}</p>
        </div>
      </div>

      <p className="mt-4 text-center text-xs text-muted-foreground">
        Update your daily cost in Profile settings
      </p>
    </div>
  )
}

// =============================================================================
// SAVINGS GOAL CARD COMPONENT
// =============================================================================

interface SavingsGoalCardProps {
  goal: SavingsGoal
  currentSaved: number
  onDelete: (id: string) => void
  onEdit?: (goal: SavingsGoal) => void
}

function SavingsGoalCard({ goal, currentSaved, onDelete, onEdit }: SavingsGoalCardProps) {
  const progress = Math.min(100, (currentSaved / goal.targetAmount) * 100)
  const isComplete = currentSaved >= goal.targetAmount

  return (
    <div
      className={cn(
        'rounded-xl border-2 p-4 shadow-sm transition-all',
        isComplete
          ? 'border-green-300 bg-green-50'
          : 'border-border bg-white'
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              'flex h-10 w-10 items-center justify-center rounded-full',
              isComplete ? 'bg-green-200' : 'bg-primary/10'
            )}
          >
            {isComplete ? (
              <span className="text-lg">🎉</span>
            ) : (
              <Target className="h-5 w-5 text-primary" />
            )}
          </div>
          <div>
            <h4 className="font-semibold text-foreground">{goal.title}</h4>
            <p className="text-xs text-muted-foreground">{goal.category || 'General'}</p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {onEdit && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(goal)}
              className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
            >
              <Edit className="h-4 w-4" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(goal.id)}
            className="h-8 w-8 p-0 text-muted-foreground hover:text-red-500"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="mt-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            ${currentSaved.toLocaleString()} / ${goal.targetAmount.toLocaleString()}
          </span>
          <span className={cn('font-medium', isComplete ? 'text-green-600' : 'text-primary')}>
            {progress.toFixed(0)}%
          </span>
        </div>
        <Progress value={progress} className="mt-2 h-2" />
      </div>

      {goal.description && (
        <p className="mt-3 text-xs text-muted-foreground line-clamp-2">{goal.description}</p>
      )}
    </div>
  )
}

// =============================================================================
// MONEY MAP PREVIEW COMPONENT
// =============================================================================

function MoneyMapPreview() {
  // Placeholder - full Money Map would require more complex implementation
  const sampleStops = [
    { id: '1', name: 'Emergency Fund', amount: 1000, achieved: true },
    { id: '2', name: 'New Phone', amount: 500, achieved: true },
    { id: '3', name: 'Vacation Fund', amount: 2000, achieved: false },
    { id: '4', name: 'New Car Down Payment', amount: 5000, achieved: false },
  ]

  return (
    <div className="rounded-xl border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-white p-4">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-amber-600" />
          <h4 className="font-semibold text-foreground">Money Map</h4>
        </div>
        <Button variant="outline" size="sm" className="h-7 text-xs">
          View Full Map
        </Button>
      </div>

      <div className="relative">
        {/* Road Line */}
        <div className="absolute left-4 top-0 h-full w-0.5 bg-amber-200" />

        {/* Stops */}
        <div className="space-y-3">
          {sampleStops.map((stop) => (
            <div key={stop.id} className="relative flex items-center gap-3 pl-8">
              {/* Stop Marker */}
              <div
                className={cn(
                  'absolute left-2 h-5 w-5 rounded-full border-2',
                  stop.achieved
                    ? 'border-amber-500 bg-amber-500'
                    : 'border-amber-300 bg-white'
                )}
              >
                {stop.achieved && (
                  <span className="flex h-full items-center justify-center text-xs text-white">
                    ✓
                  </span>
                )}
              </div>

              {/* Stop Info */}
              <div className="flex-1">
                <p
                  className={cn(
                    'text-sm font-medium',
                    stop.achieved ? 'text-amber-700' : 'text-foreground'
                  )}
                >
                  {stop.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  ${stop.amount.toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <p className="mt-4 text-center text-xs text-muted-foreground">
        Track your financial milestones as you save
      </p>
    </div>
  )
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function JourneyFinancesTab() {
  const isMobile = useMediaQuery('(max-width: 768px)')
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([])
  const [loading, setLoading] = useState(true)

  const { userData, daysSober, totalSaved, loading: journeyLoading } = useJourneyData()

  // Load savings goals
  useEffect(() => {
    const user = auth.currentUser
    if (!user) {
      setLoading(false)
      return
    }

    const goalsRef = collection(db, 'savingsGoals')
    const q = query(
      goalsRef,
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    )

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const goals = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as SavingsGoal[]
        setSavingsGoals(goals)
        setLoading(false)
      },
      (error) => {
        console.error('Error loading savings goals:', error)
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [])

  const handleDeleteGoal = async (goalId: string) => {
    try {
      await deleteDoc(doc(db, 'savingsGoals', goalId))
    } catch (error) {
      console.error('Error deleting goal:', error)
    }
  }

  const dailyCost = userData?.dailyCost || 0

  return (
    <div className={cn('pb-8', isMobile ? 'px-4' : 'mx-auto max-w-xl px-5')}>
      {/* Header */}
      <div className="py-4">
        <h3 className="text-lg font-semibold text-foreground">Financial Journey</h3>
        <p className="text-sm text-muted-foreground">
          Track your savings and financial milestones
        </p>
      </div>

      {/* Savings JAR */}
      <SavingsJar
        totalSaved={totalSaved}
        dailyCost={dailyCost}
        daysSober={daysSober}
        loading={journeyLoading}
      />

      {/* Savings Goals Section */}
      <div className="mt-6">
        <div className="mb-3 flex items-center justify-between">
          <h4 className="text-base font-semibold text-primary">Savings Goals</h4>
          <Button variant="outline" size="sm" className="h-8 text-xs">
            <Plus className="mr-1 h-3 w-3" />
            Add Goal
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : savingsGoals.length === 0 ? (
          <div
            className={cn(
              'rounded-xl border-2 border-dashed border-muted-foreground/30 p-6',
              'text-center text-muted-foreground'
            )}
          >
            <Target className="mx-auto mb-2 h-8 w-8 opacity-50" />
            <p className="text-sm">No savings goals yet</p>
            <p className="text-xs opacity-75">
              Create a goal to start saving for something special!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {savingsGoals.map((goal) => (
              <SavingsGoalCard
                key={goal.id}
                goal={goal}
                currentSaved={totalSaved}
                onDelete={handleDeleteGoal}
              />
            ))}
          </div>
        )}
      </div>

      {/* Money Map Preview */}
      <div className="mt-6">
        <h4 className="mb-3 text-base font-semibold text-primary">Money Map</h4>
        <MoneyMapPreview />
      </div>

      {/* Quick Stats */}
      <div className="mt-6">
        <h4 className="mb-3 text-base font-semibold text-primary">Financial Impact</h4>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl border bg-gradient-to-br from-green-50 to-white p-4 text-center">
            <TrendingUp className="mx-auto mb-2 h-6 w-6 text-green-500" />
            <p className="text-2xl font-bold text-green-600">
              ${(totalSaved / 12).toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </p>
            <p className="text-xs text-muted-foreground">Monthly Savings</p>
          </div>
          <div className="rounded-xl border bg-gradient-to-br from-blue-50 to-white p-4 text-center">
            <DollarSign className="mx-auto mb-2 h-6 w-6 text-blue-500" />
            <p className="text-2xl font-bold text-blue-600">
              ${(totalSaved * 12 / Math.max(daysSober, 1)).toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </p>
            <p className="text-xs text-muted-foreground">Yearly Projection</p>
          </div>
        </div>
      </div>

      {/* Bottom Spacing */}
      <div className="h-8" />
    </div>
  )
}

export default JourneyFinancesTab
