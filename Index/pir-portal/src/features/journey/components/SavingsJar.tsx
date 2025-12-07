import { useMemo } from 'react'
import { PiggyBank, Plus, Minus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { formatCurrency } from '../hooks/useSavingsData'

// =============================================================================
// TYPES
// =============================================================================

export interface SavingsJarProps {
  currentAmount: number
  targetAmount?: number
  title?: string
  onDeposit?: () => void
  onWithdraw?: () => void
  className?: string
}

// =============================================================================
// COMPONENT
// =============================================================================

export function SavingsJar({
  currentAmount,
  targetAmount,
  title = 'Savings Jar',
  onDeposit,
  onWithdraw,
  className,
}: SavingsJarProps) {
  const progress = useMemo(() => {
    if (!targetAmount || targetAmount <= 0) return 0
    return Math.min(100, Math.round((currentAmount / targetAmount) * 100))
  }, [currentAmount, targetAmount])

  // Calculate fill level for jar visualization
  const fillLevel = useMemo(() => {
    if (!targetAmount) return Math.min(100, (currentAmount / 1000) * 100) // Default scale to $1000
    return progress
  }, [currentAmount, targetAmount, progress])

  return (
    <div
      className={cn(
        'rounded-xl border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10 p-4',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20">
            <PiggyBank className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">{title}</h3>
            {targetAmount && (
              <p className="text-xs text-muted-foreground">
                Goal: {formatCurrency(targetAmount)}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Jar Visualization */}
      <div className="relative mx-auto mb-4 h-40 w-28">
        {/* Jar Outline */}
        <div className="absolute inset-0 rounded-b-3xl rounded-t-lg border-4 border-primary/30 bg-white/50">
          {/* Fill Level */}
          <div
            className="absolute bottom-0 left-0 right-0 rounded-b-3xl bg-gradient-to-t from-primary to-primary/60 transition-all duration-500"
            style={{ height: `${fillLevel}%` }}
          >
            {/* Bubbles effect */}
            <div className="absolute inset-0 overflow-hidden rounded-b-3xl">
              <div className="absolute bottom-2 left-2 h-2 w-2 rounded-full bg-white/30 animate-bounce" />
              <div className="absolute bottom-4 right-3 h-3 w-3 rounded-full bg-white/20 animate-bounce delay-100" />
              <div className="absolute bottom-6 left-4 h-1.5 w-1.5 rounded-full bg-white/40 animate-bounce delay-200" />
            </div>
          </div>
        </div>

        {/* Jar Lid */}
        <div className="absolute -top-2 left-1/2 h-4 w-20 -translate-x-1/2 rounded-t-lg bg-primary/40" />

        {/* Amount Display */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-bold text-white drop-shadow-md">
            {formatCurrency(currentAmount)}
          </span>
        </div>
      </div>

      {/* Progress Bar (if target set) */}
      {targetAmount && (
        <div className="mb-4">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-muted-foreground">{progress}% complete</span>
            <span className="font-medium text-primary">
              {formatCurrency(targetAmount - currentAmount)} to go
            </span>
          </div>
          <div className="h-2 w-full rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Action Buttons */}
      {(onDeposit || onWithdraw) && (
        <div className="flex gap-2">
          {onDeposit && (
            <Button
              onClick={onDeposit}
              size="sm"
              className="flex-1 gap-1"
            >
              <Plus className="h-4 w-4" />
              Deposit
            </Button>
          )}
          {onWithdraw && (
            <Button
              onClick={onWithdraw}
              variant="outline"
              size="sm"
              className="flex-1 gap-1"
            >
              <Minus className="h-4 w-4" />
              Withdraw
            </Button>
          )}
        </div>
      )}
    </div>
  )
}

export default SavingsJar
