import { CalendarDays, UserCheck, Clock, Flame } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import type { StatsGridProps } from '../types'

// ============================================================
// STAT CARD COMPONENT
// ============================================================

interface StatCardProps {
  icon: React.ReactNode
  value: string | number
  label: string
  isMobile?: boolean
}

function StatCard({ icon, value, label, isMobile = false }: StatCardProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-xl',
        'bg-gradient-to-br from-[#058585]/8 to-[#047272]/5',
        'border border-[#058585]/20',
        isMobile ? 'h-[60px] px-3 py-2' : 'h-[60px] px-4 py-3'
      )}
    >
      {/* Icon */}
      <div
        className={cn(
          'flex items-center justify-center rounded-lg bg-[#058585] flex-shrink-0',
          'w-9 h-9'
        )}
      >
        <span className="text-white">{icon}</span>
      </div>

      {/* Content */}
      <div className="flex flex-col gap-0.5 flex-1">
        <span className="text-lg font-bold text-[#058585]">{value}</span>
        <span className="text-xs text-muted-foreground uppercase tracking-wide">
          {label}
        </span>
      </div>
    </div>
  )
}

// ============================================================
// LOADING STATE
// ============================================================

function StatsGridSkeleton({ isMobile }: { isMobile: boolean }) {
  return (
    <div className={cn('grid grid-cols-2 gap-3', isMobile ? 'px-4 py-4' : 'px-5 py-5')}>
      {[1, 2, 3, 4].map((i) => (
        <Skeleton key={i} className="h-[60px] rounded-xl" />
      ))}
    </div>
  )
}

// ============================================================
// MAIN COMPONENT
// ============================================================

/**
 * 2x2 grid of account activity stats
 * Displays: Days Active, Profile Completion, Last Active, Check-in Streak
 */
export function StatsGrid({ stats, streakData, loading = false }: StatsGridProps) {
  const isMobile = useMediaQuery('(max-width: 768px)')

  if (loading) {
    return <StatsGridSkeleton isMobile={isMobile} />
  }

  return (
    <div className={cn('px-4 py-4', !isMobile && 'px-5 py-5')}>
      {/* Section Title */}
      <h2
        className={cn(
          'text-xl font-bold uppercase tracking-wide mb-4',
          'text-amber-400 drop-shadow-sm'
        )}
      >
        Account Activity
      </h2>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        {/* Days Active */}
        <StatCard
          icon={<CalendarDays className="w-5 h-5" strokeWidth={2} />}
          value={stats.daysActive}
          label="Days Active"
          isMobile={isMobile}
        />

        {/* Profile Completion */}
        <StatCard
          icon={<UserCheck className="w-5 h-5" strokeWidth={2} />}
          value={`${stats.profileCompletion}%`}
          label="Profile Done"
          isMobile={isMobile}
        />

        {/* Last Active */}
        <StatCard
          icon={<Clock className="w-5 h-5" strokeWidth={2} />}
          value="Today"
          label="Last Active"
          isMobile={isMobile}
        />

        {/* Check-in Streak */}
        <StatCard
          icon={<Flame className="w-5 h-5" strokeWidth={2} />}
          value={streakData.currentStreak}
          label="Check-in Streak"
          isMobile={isMobile}
        />
      </div>
    </div>
  )
}

export default StatsGrid
