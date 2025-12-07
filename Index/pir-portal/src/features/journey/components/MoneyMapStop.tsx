import {
  Coffee,
  Utensils,
  Film,
  Book,
  Dumbbell,
  MapPin,
  Smartphone,
  Shield,
  Plane,
  Car,
  Target,
  Check,
  Lock,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatCurrency } from '../hooks/useSavingsData'
import type { MoneyMapStop as MoneyMapStopType } from '../types'

// =============================================================================
// ICON MAP
// =============================================================================

const ICON_MAP: Record<string, LucideIcon> = {
  coffee: Coffee,
  utensils: Utensils,
  film: Film,
  book: Book,
  dumbbell: Dumbbell,
  'map-pin': MapPin,
  smartphone: Smartphone,
  shield: Shield,
  plane: Plane,
  car: Car,
  target: Target,
}

// =============================================================================
// TYPES
// =============================================================================

export interface MoneyMapStopProps {
  stop: MoneyMapStopType
  isUnlocked: boolean
  isNext: boolean
  progress?: number
  moneySaved: number
  onClick?: () => void
  className?: string
}

// =============================================================================
// COMPONENT
// =============================================================================

export function MoneyMapStop({
  stop,
  isUnlocked,
  isNext,
  progress = 0,
  moneySaved,
  onClick,
  className,
}: MoneyMapStopProps) {
  const Icon = stop.icon ? ICON_MAP[stop.icon] || Target : Target
  const daysAway = Math.ceil((stop.cost - moneySaved) / 50) // Assuming ~$50/day savings

  return (
    <div
      onClick={onClick}
      className={cn(
        'relative rounded-xl p-4 transition-all',
        isUnlocked
          ? 'border-2 border-green-500 bg-gradient-to-br from-green-50 to-green-100'
          : isNext
            ? 'border-2 border-primary bg-gradient-to-br from-primary/5 to-primary/10'
            : 'border border-border bg-white/80',
        onClick && 'cursor-pointer hover:shadow-md',
        className
      )}
    >
      {/* Status Badge */}
      {isUnlocked && (
        <div className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-green-500 text-white">
          <Check className="h-4 w-4" />
        </div>
      )}
      {!isUnlocked && !isNext && (
        <div className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <Lock className="h-3 w-3" />
        </div>
      )}

      <div className="flex items-start gap-3">
        {/* Icon */}
        <div
          className={cn(
            'flex h-12 w-12 items-center justify-center rounded-full',
            isUnlocked
              ? 'bg-green-500 text-white'
              : isNext
                ? 'bg-primary/20 text-primary'
                : 'bg-muted text-muted-foreground'
          )}
        >
          <Icon className="h-6 w-6" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h4
                className={cn(
                  'font-semibold',
                  isUnlocked ? 'text-green-700' : 'text-foreground'
                )}
              >
                {stop.name}
              </h4>
              <p
                className={cn(
                  'text-sm',
                  isUnlocked ? 'text-green-600' : 'text-muted-foreground'
                )}
              >
                {formatCurrency(stop.cost)}
              </p>
            </div>

            {isUnlocked && (
              <span className="inline-flex items-center rounded-full bg-green-500 px-2 py-1 text-xs font-semibold text-white">
                UNLOCKED! 🎉
              </span>
            )}
          </div>

          {/* Progress for next stop */}
          {isNext && (
            <div className="mt-2">
              <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="mt-1 flex items-center justify-between text-xs">
                <span className="text-primary font-medium">{progress}% there</span>
                <span className="text-muted-foreground">
                  ~{daysAway > 0 ? `${daysAway} days away` : 'Almost there!'}
                </span>
              </div>
            </div>
          )}

          {/* Status text for unlocked */}
          {isUnlocked && (
            <p className="mt-1 text-xs text-green-600 font-medium">
              ✅ You can afford this NOW
            </p>
          )}
        </div>
      </div>

      {stop.description && (
        <p className="mt-2 text-xs text-muted-foreground line-clamp-2">
          {stop.description}
        </p>
      )}
    </div>
  )
}

export default MoneyMapStop
