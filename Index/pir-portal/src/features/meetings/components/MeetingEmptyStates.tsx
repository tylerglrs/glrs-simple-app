/**
 * =============================================================================
 * MEETING EMPTY STATES - Phase 10: UX Polish & Accessibility
 * =============================================================================
 *
 * Friendly, illustrated empty states for meetings components.
 * Uses SVG illustrations for primary states, Lucide icons for fallback/utility.
 *
 * =============================================================================
 */

import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import {
  Search,
  Bookmark,
  Calendar,
  MapPin,
  Filter,
  WifiOff,
  AlertCircle,
  Heart,
  History,
  Target,
  Clock,
  Users,
  RefreshCw,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Illustration } from '@/components/common/Illustration'

// ============================================================
// BASE EMPTY STATE COMPONENT
// ============================================================

interface EmptyStateProps {
  /** Main icon to display */
  icon: ReactNode
  /** Primary title text */
  title: string
  /** Secondary description text */
  description: string
  /** Optional action button */
  action?: {
    label: string
    onClick: () => void
    icon?: ReactNode
    variant?: 'default' | 'outline' | 'ghost'
  }
  /** Optional secondary action */
  secondaryAction?: {
    label: string
    onClick: () => void
    icon?: ReactNode
  }
  /** Additional CSS classes */
  className?: string
  /** Custom illustration (overrides icon) */
  illustration?: ReactNode
  /** Whether this is an error state (affects aria-live behavior) */
  isError?: boolean
}

function EmptyState({
  icon,
  title,
  description,
  action,
  secondaryAction,
  className,
  illustration,
  isError = false,
}: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className={cn(
        'flex flex-col items-center justify-center py-12 px-6 text-center',
        className
      )}
      role={isError ? 'alert' : 'status'}
      aria-label={title}
      aria-live={isError ? 'assertive' : 'polite'}
      aria-atomic="true"
    >
      {/* Illustration or Icon */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.1 }}
        className="mb-6"
      >
        {illustration || (
          <div className="relative">
            {/* Background circle */}
            <div className="absolute inset-0 bg-muted/50 rounded-full blur-xl scale-150" />
            {/* Icon container */}
            <div className="relative w-20 h-20 bg-muted rounded-full flex items-center justify-center">
              {icon}
            </div>
          </div>
        )}
      </motion.div>

      {/* Title */}
      <motion.h3
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-lg font-semibold text-foreground mb-2"
      >
        {title}
      </motion.h3>

      {/* Description */}
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-sm text-muted-foreground max-w-xs mb-6"
      >
        {description}
      </motion.p>

      {/* Actions */}
      {(action || secondaryAction) && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-2"
        >
          {action && (
            <Button
              variant={action.variant || 'default'}
              onClick={action.onClick}
              className="gap-2 min-h-[44px]"
              aria-label={action.label}
            >
              <span aria-hidden="true">{action.icon}</span>
              {action.label}
            </Button>
          )}
          {secondaryAction && (
            <Button
              variant="ghost"
              onClick={secondaryAction.onClick}
              className="gap-2 min-h-[44px] text-muted-foreground"
              aria-label={secondaryAction.label}
            >
              <span aria-hidden="true">{secondaryAction.icon}</span>
              {secondaryAction.label}
            </Button>
          )}
        </motion.div>
      )}
    </motion.div>
  )
}

// ============================================================
// SPECIFIC EMPTY STATE VARIANTS
// ============================================================

interface EmptyStateVariantProps {
  onAction?: () => void
  onSecondaryAction?: () => void
  className?: string
}

/**
 * No meetings found (filter/search results)
 */
export function NoMeetingsFoundState({
  onAction,
  onSecondaryAction,
  className,
}: EmptyStateVariantProps) {
  return (
    <EmptyState
      icon={<Filter className="h-10 w-10 text-muted-foreground" />}
      title="No meetings match your filters"
      description="Try adjusting your search or filter criteria to find more meetings."
      action={onAction ? {
        label: 'Clear Filters',
        onClick: onAction,
        icon: <RefreshCw className="h-4 w-4" />,
        variant: 'outline',
      } : undefined}
      secondaryAction={onSecondaryAction ? {
        label: 'Browse All',
        onClick: onSecondaryAction,
      } : undefined}
      className={className}
    />
  )
}

/**
 * Search no results
 */
export function SearchNoResultsState({
  searchTerm,
  onAction,
  className,
}: EmptyStateVariantProps & { searchTerm?: string }) {
  return (
    <EmptyState
      icon={<Search className="h-10 w-10 text-muted-foreground" />}
      title="No search results"
      description={searchTerm
        ? `We couldn't find any meetings matching "${searchTerm}". Try different search terms.`
        : "Try different search terms or browse all meetings."
      }
      action={onAction ? {
        label: 'Clear Search',
        onClick: onAction,
        icon: <RefreshCw className="h-4 w-4" />,
        variant: 'outline',
      } : undefined}
      className={className}
    />
  )
}

/**
 * No saved meetings
 */
export function NoSavedMeetingsState({
  onAction,
  className,
}: EmptyStateVariantProps) {
  return (
    <EmptyState
      icon={<Bookmark className="h-10 w-10 text-muted-foreground" />}
      illustration={<Illustration name="compass" size="lg" className="opacity-85" />}
      title="No saved meetings"
      description="Save meetings you want to attend regularly. They'll appear here for quick access."
      action={onAction ? {
        label: 'Browse Meetings',
        onClick: onAction,
        variant: 'outline',
      } : undefined}
      className={className}
    />
  )
}

/**
 * No favorite meetings
 */
export function NoFavoriteMeetingsState({
  onAction,
  className,
}: EmptyStateVariantProps) {
  return (
    <EmptyState
      icon={<Heart className="h-10 w-10 text-muted-foreground" />}
      title="No favorite meetings"
      description="Heart meetings you love to add them to your favorites list."
      action={onAction ? {
        label: 'Browse Meetings',
        onClick: onAction,
        variant: 'outline',
      } : undefined}
      className={className}
    />
  )
}

/**
 * No scheduled meetings
 */
export function NoScheduledMeetingsState({
  variant = 'today',
  onAction,
  className,
}: EmptyStateVariantProps & { variant?: 'today' | 'upcoming' }) {
  const isToday = variant === 'today'

  return (
    <EmptyState
      icon={<Calendar className="h-10 w-10 text-muted-foreground" />}
      illustration={<Illustration name="horizon" size="lg" className="opacity-85" />}
      title={isToday ? "No meetings today" : "No upcoming meetings"}
      description={isToday
        ? "You don't have any meetings scheduled for today. Browse to find and schedule meetings."
        : "You don't have any upcoming meetings. Add meetings to your schedule from the Browse tab."
      }
      action={onAction ? {
        label: 'Browse Meetings',
        onClick: onAction,
        variant: 'outline',
      } : undefined}
      className={className}
    />
  )
}

/**
 * No meeting history
 */
export function NoMeetingHistoryState({
  onAction,
  className,
}: EmptyStateVariantProps) {
  return (
    <EmptyState
      icon={<History className="h-10 w-10 text-muted-foreground" />}
      illustration={<Illustration name="stepping-stones" size="lg" className="opacity-85" />}
      title="No meeting history yet"
      description="Your attended meetings will appear here. Schedule and attend meetings to build your history."
      action={onAction ? {
        label: 'Schedule a Meeting',
        onClick: onAction,
        variant: 'outline',
      } : undefined}
      className={className}
    />
  )
}

/**
 * Location unavailable
 */
export function LocationUnavailableState({
  onAction,
  className,
}: EmptyStateVariantProps) {
  return (
    <EmptyState
      icon={<MapPin className="h-10 w-10 text-muted-foreground" />}
      title="Location unavailable"
      description="Enable location access to find meetings near you and get distance information."
      action={onAction ? {
        label: 'Enable Location',
        onClick: onAction,
        variant: 'default',
      } : undefined}
      className={className}
    />
  )
}

/**
 * No meetings in area
 */
export function NoMeetingsInAreaState({
  onAction,
  className,
}: EmptyStateVariantProps) {
  return (
    <EmptyState
      icon={<MapPin className="h-10 w-10 text-muted-foreground" />}
      title="No meetings in this area"
      description="We couldn't find any meetings near your location. Try expanding your search radius."
      action={onAction ? {
        label: 'Expand Search',
        onClick: onAction,
        variant: 'outline',
      } : undefined}
      className={className}
    />
  )
}

/**
 * Network offline
 */
export function OfflineState({
  onAction,
  className,
}: EmptyStateVariantProps) {
  return (
    <EmptyState
      icon={<WifiOff className="h-10 w-10 text-muted-foreground" aria-hidden="true" />}
      title="You're offline"
      description="Check your internet connection and try again. Some features may be limited while offline."
      action={onAction ? {
        label: 'Retry',
        onClick: onAction,
        icon: <RefreshCw className="h-4 w-4" />,
        variant: 'outline',
      } : undefined}
      className={className}
      isError={true}
    />
  )
}

/**
 * Error state (generic)
 */
export function ErrorState({
  message,
  onAction,
  className,
}: EmptyStateVariantProps & { message?: string }) {
  return (
    <EmptyState
      icon={<AlertCircle className="h-10 w-10 text-destructive" aria-hidden="true" />}
      title="Something went wrong"
      description={message || "We encountered an error loading meetings. Please try again."}
      action={onAction ? {
        label: 'Try Again',
        onClick: onAction,
        icon: <RefreshCw className="h-4 w-4" />,
        variant: 'outline',
      } : undefined}
      className={className}
      isError={true}
    />
  )
}

/**
 * No active goal
 */
export function NoActiveGoalState({
  onAction,
  className,
}: EmptyStateVariantProps) {
  return (
    <EmptyState
      icon={<Target className="h-10 w-10 text-muted-foreground" />}
      illustration={<Illustration name="path-to-success" size="lg" className="opacity-85" />}
      title="No active meeting goal"
      description="Set a meeting goal to track your progress. Try 90-in-90 or a weekly meeting target."
      action={onAction ? {
        label: 'Set Goal',
        onClick: onAction,
        variant: 'default',
      } : undefined}
      className={className}
    />
  )
}

/**
 * Map loading failed
 */
export function MapLoadFailedState({
  onAction,
  className,
}: EmptyStateVariantProps) {
  return (
    <EmptyState
      icon={<MapPin className="h-10 w-10 text-muted-foreground" aria-hidden="true" />}
      title="Couldn't load map"
      description="There was a problem loading the map. Try refreshing or switch to list view."
      action={onAction ? {
        label: 'Refresh',
        onClick: onAction,
        icon: <RefreshCw className="h-4 w-4" />,
        variant: 'outline',
      } : undefined}
      className={className}
      isError={true}
    />
  )
}

/**
 * Time filter no results
 */
export function NoMeetingsAtTimeState({
  time,
  onAction,
  className,
}: EmptyStateVariantProps & { time?: string }) {
  return (
    <EmptyState
      icon={<Clock className="h-10 w-10 text-muted-foreground" />}
      title={time ? `No meetings at ${time}` : "No meetings at this time"}
      description="Try adjusting your time filter or browse all meetings."
      action={onAction ? {
        label: 'Clear Time Filter',
        onClick: onAction,
        icon: <RefreshCw className="h-4 w-4" />,
        variant: 'outline',
      } : undefined}
      className={className}
    />
  )
}

/**
 * No virtual meetings
 */
export function NoOnlineMeetingsState({
  onAction,
  className,
}: EmptyStateVariantProps) {
  return (
    <EmptyState
      icon={<Users className="h-10 w-10 text-muted-foreground" />}
      title="No virtual meetings found"
      description="Try browsing in-person meetings or check back later for more virtual options."
      action={onAction ? {
        label: 'Browse All',
        onClick: onAction,
        variant: 'outline',
      } : undefined}
      className={className}
    />
  )
}

// ============================================================
// EXPORTS
// ============================================================

export {
  EmptyState,
  type EmptyStateProps,
}

export default {
  EmptyState,
  NoMeetingsFoundState,
  SearchNoResultsState,
  NoSavedMeetingsState,
  NoFavoriteMeetingsState,
  NoScheduledMeetingsState,
  NoMeetingHistoryState,
  LocationUnavailableState,
  NoMeetingsInAreaState,
  OfflineState,
  ErrorState,
  NoActiveGoalState,
  MapLoadFailedState,
  NoMeetingsAtTimeState,
  NoOnlineMeetingsState,
}
