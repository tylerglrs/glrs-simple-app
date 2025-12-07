/**
 * AlertStatsCards Component
 * Phase 8E: Admin Crisis Dashboard
 *
 * Displays 5 stat cards showing alert counts:
 * - Critical (tier 1, unresolved)
 * - High (tier 2, unresolved)
 * - Unread
 * - Active (all unresolved)
 * - Resolved (last 30 days)
 *
 * Features trend arrows comparing to previous period.
 */

import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  AlertTriangle,
  AlertCircle,
  Mail,
  Clock,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  Minus,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { AlertStats, AlertFilters } from '../types'

interface AlertStatsCardsProps {
  stats: AlertStats
  loading?: boolean
  onStatClick?: (filter: Partial<AlertFilters>) => void
  /** Previous period stats for trend calculation */
  previousStats?: Partial<AlertStats>
}

interface StatCardProps {
  title: string
  value: number
  icon: React.ReactNode
  color: 'red' | 'orange' | 'blue' | 'amber' | 'green'
  trend?: number
  loading?: boolean
  onClick?: () => void
  pulse?: boolean
  subtitle?: string
}

const colorStyles = {
  red: {
    bg: 'bg-red-50',
    iconBg: 'bg-red-100',
    iconText: 'text-red-600',
    text: 'text-red-700',
    border: 'border-red-200 hover:border-red-300',
    hoverBg: 'hover:bg-red-100/50',
  },
  orange: {
    bg: 'bg-orange-50',
    iconBg: 'bg-orange-100',
    iconText: 'text-orange-600',
    text: 'text-orange-700',
    border: 'border-orange-200 hover:border-orange-300',
    hoverBg: 'hover:bg-orange-100/50',
  },
  blue: {
    bg: 'bg-blue-50',
    iconBg: 'bg-blue-100',
    iconText: 'text-blue-600',
    text: 'text-blue-700',
    border: 'border-blue-200 hover:border-blue-300',
    hoverBg: 'hover:bg-blue-100/50',
  },
  amber: {
    bg: 'bg-amber-50',
    iconBg: 'bg-amber-100',
    iconText: 'text-amber-600',
    text: 'text-amber-700',
    border: 'border-amber-200 hover:border-amber-300',
    hoverBg: 'hover:bg-amber-100/50',
  },
  green: {
    bg: 'bg-green-50',
    iconBg: 'bg-green-100',
    iconText: 'text-green-600',
    text: 'text-green-700',
    border: 'border-green-200 hover:border-green-300',
    hoverBg: 'hover:bg-green-100/50',
  },
}

function StatCard({
  title,
  value,
  icon,
  color,
  trend,
  loading = false,
  onClick,
  pulse = false,
  subtitle,
}: StatCardProps) {
  const styles = colorStyles[color]

  if (loading) {
    return (
      <Card className="border">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-lg" />
            <div className="flex-1">
              <Skeleton className="h-4 w-20 mb-2" />
              <Skeleton className="h-6 w-12" />
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card
      className={cn(
        'border cursor-pointer transition-all duration-200',
        styles.border,
        styles.hoverBg,
        onClick && 'active:scale-[0.98]'
      )}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              'p-2.5 rounded-lg',
              styles.iconBg,
              styles.iconText,
              pulse && 'animate-pulse'
            )}
          >
            {icon}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide truncate">
              {title}
            </p>
            <div className="flex items-baseline gap-2">
              <span className={cn('text-2xl font-bold', styles.text)}>
                {value.toLocaleString()}
              </span>
              {trend !== undefined && trend !== 0 && (
                <span
                  className={cn(
                    'flex items-center text-xs font-medium',
                    trend > 0 ? 'text-red-600' : 'text-green-600'
                  )}
                >
                  {trend > 0 ? (
                    <TrendingUp className="w-3 h-3 mr-0.5" />
                  ) : (
                    <TrendingDown className="w-3 h-3 mr-0.5" />
                  )}
                  {Math.abs(trend)}
                </span>
              )}
              {trend === 0 && (
                <span className="flex items-center text-xs font-medium text-gray-400">
                  <Minus className="w-3 h-3 mr-0.5" />
                  0
                </span>
              )}
            </div>
            {subtitle && (
              <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function AlertStatsCards({
  stats,
  loading = false,
  onStatClick,
  previousStats,
}: AlertStatsCardsProps) {
  // Calculate trends (difference from previous period)
  const criticalTrend = previousStats?.critical !== undefined
    ? stats.critical - previousStats.critical
    : undefined

  const highTrend = previousStats?.high !== undefined
    ? stats.high - previousStats.high
    : undefined

  const unreadTrend = previousStats?.unread !== undefined
    ? stats.unread - previousStats.unread
    : undefined

  // Calculate active (unresolved) count
  const activeCount = stats.total - stats.resolved

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      <StatCard
        title="Critical"
        value={stats.critical}
        icon={<AlertTriangle className="h-5 w-5" />}
        color="red"
        trend={criticalTrend}
        loading={loading}
        onClick={() => onStatClick?.({ tier: '1', status: 'all' })}
        pulse={stats.critical > 0}
      />

      <StatCard
        title="High"
        value={stats.high}
        icon={<AlertCircle className="h-5 w-5" />}
        color="orange"
        trend={highTrend}
        loading={loading}
        onClick={() => onStatClick?.({ tier: '2', status: 'all' })}
      />

      <StatCard
        title="Unread"
        value={stats.unread}
        icon={<Mail className="h-5 w-5" />}
        color="blue"
        trend={unreadTrend}
        loading={loading}
        onClick={() => onStatClick?.({ status: 'unread' })}
        subtitle="Needs attention"
      />

      <StatCard
        title="Active"
        value={activeCount}
        icon={<Clock className="h-5 w-5" />}
        color="amber"
        loading={loading}
        onClick={() => onStatClick?.({ status: 'all' })}
        subtitle="In progress"
      />

      <StatCard
        title="Resolved"
        value={stats.resolved}
        icon={<CheckCircle2 className="h-5 w-5" />}
        color="green"
        loading={loading}
        onClick={() => onStatClick?.({ status: 'resolved' })}
        subtitle="Last 30 days"
      />
    </div>
  )
}

export default AlertStatsCards
