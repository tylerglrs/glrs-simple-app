import { useState, useMemo, useCallback, useEffect, useRef } from 'react'
import { PullToRefresh, TabHeader } from '@/components/common'
import { Calendar, Clock, History, Search, Loader2, CalendarDays, ChevronRight, PlusCircle, MapPin, ExternalLink, Target, Flame, TrendingUp, CheckCircle, XCircle } from 'lucide-react'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'
import { useTab } from '@/contexts/TabContext'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { useMeetings, useSavedMeetings, useMeetingGoals, getPresetById } from '../hooks'
import type { MeetingGoal, MeetingGoalStats } from '../types/goals'
import { MeetingBrowser } from './MeetingBrowser'
import { MeetingList } from './MeetingList'
import { LogMeetingModal, type LogMeetingDetails } from './LogMeetingModal'
import { MeetingsSidebar } from './MeetingsSidebar'
import { SavedFavoritesModal } from './SavedFavoritesModal'
import type { Meeting, MeetingsTabProps, ScheduledMeeting } from '../types'
import { DAYS_OF_WEEK } from '../types'
import { toMeetingCardData } from '../utils/toMeetingCardData'
import { ProgramBadge, LocationBadge, type ProgramType } from './MeetingBadge'

// ============================================================
// TYPES
// ============================================================

type TabValue = 'today' | 'upcoming' | 'browse' | 'history'
type TimeFilter = '7days' | '14days' | '30days' | 'all'
type HistoryProgramFilter = 'all' | '12-step' | 'recovery-dharma' | 'lifering' | 'smart-recovery' | 'celebrate-recovery'

// ============================================================
// CONSTANTS
// ============================================================

const TIME_FILTER_OPTIONS: { value: TimeFilter; label: string }[] = [
  { value: '7days', label: 'Next 7 days' },
  { value: '14days', label: 'Next 14 days' },
  { value: '30days', label: 'Next 30 days' },
  { value: 'all', label: 'All upcoming' },
]

const HISTORY_PROGRAM_FILTER_OPTIONS: { value: HistoryProgramFilter; label: string }[] = [
  { value: 'all', label: 'All Meetings' },
  { value: '12-step', label: '12 Step (AA, NA, etc.)' },
  { value: 'recovery-dharma', label: 'Recovery Dharma' },
  { value: 'lifering', label: 'LifeRing' },
  { value: 'smart-recovery', label: 'SMART Recovery' },
  { value: 'celebrate-recovery', label: 'Celebrate Recovery' },
]

// 12-step meeting types for filtering
const TWELVE_STEP_TYPES = ['AA', 'NA', 'CMA', 'MA', 'HA']

// Alternative program type mapping
const PROGRAM_TYPE_MAP: Record<HistoryProgramFilter, string[]> = {
  'all': [], // Empty means no filter
  '12-step': TWELVE_STEP_TYPES,
  'recovery-dharma': ['RD', 'RecoveryDharma'],
  'lifering': ['LR', 'LifeRing'],
  'smart-recovery': ['SMART', 'SmartRecovery'],
  'celebrate-recovery': ['CR', 'CelebrateRecovery'],
}

// ============================================================
// HELPER FUNCTIONS
// ============================================================

/**
 * Get Google Maps directions URL
 */
function getDirectionsUrl(
  address?: string,
  location?: { name?: string; formatted?: string },
  coordinates?: { lat?: number; lng?: number; _lat?: number; _long?: number }
): string | null {
  // Try coordinates first
  const lat = coordinates?.lat || coordinates?._lat
  const lng = coordinates?.lng || coordinates?._long
  if (lat && lng) {
    return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`
  }
  // Fall back to address
  const addressStr = address || location?.formatted || location?.name
  if (addressStr) {
    return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(addressStr)}`
  }
  return null
}

/**
 * Get formatted address from meeting
 */
function getFormattedAddress(meeting: ScheduledMeeting): string | null {
  if (meeting.address?.formatted) return meeting.address.formatted
  if (meeting.location?.formatted) return meeting.location.formatted

  const parts = [
    meeting.address?.street || meeting.location?.streetName,
    meeting.address?.city || meeting.location?.city || meeting.city,
    meeting.address?.state || meeting.location?.state || meeting.state,
  ].filter(Boolean)

  return parts.length > 0 ? parts.join(', ') : null
}

/**
 * Check if a meeting is happening now (within 1 hour window)
 */
function isMeetingNow(meeting: Meeting | ScheduledMeeting): boolean {
  if (!('scheduledTime' in meeting) || !meeting.scheduledTime) return false

  const now = new Date()
  const meetingDate = meeting.scheduledTime.toDate()
  const diffMinutes = (meetingDate.getTime() - now.getTime()) / (1000 * 60)

  // Meeting is "now" if it started within last 30 min or starts in next 30 min
  return diffMinutes >= -30 && diffMinutes <= 30
}

/**
 * Get day number (0-6) for a date
 */
function getDayOfWeek(date: Date): number {
  return date.getDay()
}

/**
 * Filter scheduled meetings for today only
 * Returns only the user's scheduled meetings for today (not all external meetings)
 */
function getTodayMeetings(
  scheduledMeetings: ScheduledMeeting[]
): ScheduledMeeting[] {
  const today = new Date()
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000)

  return scheduledMeetings
    .filter((m) => {
      if (!m.scheduledTime) return false
      const meetingDate = m.scheduledTime.toDate()
      return meetingDate >= todayStart && meetingDate < todayEnd
    })
    .sort((a, b) => {
      const dateA = a.scheduledTime?.toDate() || new Date()
      const dateB = b.scheduledTime?.toDate() || new Date()
      return dateA.getTime() - dateB.getTime()
    })
}

/**
 * Filter scheduled meetings by time range
 * Excludes:
 * - Meetings from before today (they go to History)
 * - Completed meetings
 */
function getUpcomingMeetings(
  scheduledMeetings: ScheduledMeeting[],
  timeFilter: TimeFilter
): ScheduledMeeting[] {
  const now = new Date()
  // Start of today (midnight) - meetings before this go to History
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  let endDate: Date

  switch (timeFilter) {
    case '7days':
      endDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
      break
    case '14days':
      endDate = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000)
      break
    case '30days':
      endDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
      break
    case 'all':
    default:
      endDate = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000) // 1 year
      break
  }

  return scheduledMeetings
    .filter((m) => {
      if (!m.scheduledTime) return false
      if (m.status === 'completed') return false
      if (m.attended === true) return false // Attended meetings go to History

      const meetingDate = m.scheduledTime.toDate()

      // Exclude meetings from before today (they go to History)
      if (meetingDate < todayStart) return false

      // Include meetings from today onwards up to endDate
      return meetingDate <= endDate
    })
    .sort((a, b) => {
      const dateA = a.scheduledTime?.toDate() || new Date()
      const dateB = b.scheduledTime?.toDate() || new Date()
      return dateA.getTime() - dateB.getTime()
    })
}

/**
 * Get past attended meetings (history)
 * Includes:
 * 1. Attended meetings (attended === true or status === 'completed')
 * 2. Auto-migrated: Unattended meetings from yesterday or earlier
 */
function getHistoryMeetings(scheduledMeetings: ScheduledMeeting[]): ScheduledMeeting[] {
  const now = new Date()
  // Start of today (midnight)
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  return scheduledMeetings
    .filter((m) => {
      // Include attended meetings
      if (m.attended === true || m.status === 'completed') return true

      // Auto-migrate: Include unattended meetings from before today
      if (m.scheduledTime) {
        const meetingDate = m.scheduledTime.toDate()
        // If meeting was scheduled before today and not attended, include in history
        if (meetingDate < todayStart && !m.attended) return true
      }

      return false
    })
    .sort((a, b) => {
      const dateA = a.attendedAt?.toDate() || a.scheduledTime?.toDate() || new Date()
      const dateB = b.attendedAt?.toDate() || b.scheduledTime?.toDate() || new Date()
      return dateB.getTime() - dateA.getTime() // Most recent first
    })
}

/**
 * Check if a meeting can be marked as attended
 * Conditions:
 * - Meeting is not already attended
 * - Meeting time has passed (scheduledTime < now)
 */
function canMarkAttended(meeting: ScheduledMeeting): boolean {
  if (meeting.attended) return false
  if (meeting.status === 'completed') return false
  if (!meeting.scheduledTime) return false

  const meetingTime = meeting.scheduledTime.toDate()
  const now = new Date()

  // Can mark as attended if the meeting time has passed
  return meetingTime < now
}

/**
 * Format scheduled time for display
 */
function formatScheduledTime(meeting: ScheduledMeeting): string {
  if (!meeting.scheduledTime) return 'Time TBD'
  const date = meeting.scheduledTime.toDate()
  const hours = date.getHours()
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const ampm = hours >= 12 ? 'PM' : 'AM'
  const displayHour = hours % 12 || 12
  return `${displayHour}:${minutes} ${ampm}`
}

/**
 * Format date for display
 */
function formatDate(meeting: ScheduledMeeting): string {
  if (!meeting.scheduledTime) return ''
  const date = meeting.scheduledTime.toDate()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const dayName = DAYS_OF_WEEK[date.getDay()]
  return `${dayName} ${month}/${day}`
}

// ============================================================
// SCHEDULED MEETING CARD COMPONENT
// ============================================================

interface ScheduledMeetingCardProps {
  meeting: ScheduledMeeting
  onMarkAttended?: (meetingId: string) => void
  onMarkNotAttended?: (meetingId: string) => void
  isMarkingAttended?: boolean
  isMarkingNotAttended?: boolean
  isMobile?: boolean
  /** If true, always show Mark Attended for unattended meetings (History view) */
  isHistoryView?: boolean
}

function ScheduledMeetingCard({
  meeting,
  onMarkAttended,
  onMarkNotAttended,
  isMarkingAttended = false,
  isMarkingNotAttended = false,
  isMobile = false,
  isHistoryView = false,
}: ScheduledMeetingCardProps) {
  // Transform to standardized card data - ensures consistent display
  const cardData = toMeetingCardData(meeting)
  const normalizedProgramType = cardData.programType.toLowerCase() as ProgramType

  const isNow = isMeetingNow(meeting)

  // Determine if we should show the "Mark Attended" button
  // In History view: always show for unattended meetings (retroactive credit)
  // In other views: only show if meeting time has passed
  const showMarkAttendedButton = onMarkAttended && !meeting.attended && (
    isHistoryView || canMarkAttended(meeting)
  )

  // Check if this is a missed meeting (unattended in history)
  const isMissed = isHistoryView && !meeting.attended

  return (
    <article
      className={cn(
        'rounded-xl border border-white/30 transition-all motion-reduce:transition-none',
        'bg-white/20 backdrop-blur-sm',
        'p-3 md:p-4', // Responsive padding
        isNow && 'ring-2 ring-primary',
        isMissed && 'border-orange-200/50 bg-orange-50/20'
      )}
      aria-label={`${cardData.name} on ${formatDate(meeting)} at ${cardData.timeDisplay}${isNow ? ', happening now' : ''}${isMissed ? ', missed' : ''}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground truncate text-sm md:text-base">
            {cardData.name}
          </h3>
          {/* Location Name - never blank due to fallback chain */}
          <p className="text-xs text-muted-foreground truncate mt-0.5">
            {cardData.locationDisplay}
          </p>
          <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
            <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
            <span>{formatDate(meeting)}</span>
            <Clock className="h-3.5 w-3.5 ml-1" aria-hidden="true" />
            <span>{cardData.timeDisplay}</span>
            {isNow && (
              <Badge variant="default" className="bg-primary text-xs">
                NOW
              </Badge>
            )}
            {isMissed && (
              <Badge variant="outline" className="bg-orange-100 text-orange-700 border-orange-200 text-xs">
                Missed
              </Badge>
            )}
          </div>
        </div>
        <ProgramBadge
          type={normalizedProgramType}
          size="sm"
          variant="filled"
        />
      </div>

      {/* Address Row - never blank due to fallback chain */}
      <address className="flex items-start gap-1 mt-2 text-xs text-muted-foreground not-italic">
        <MapPin className="h-3.5 w-3.5 mt-0.5 shrink-0" aria-hidden="true" />
        <span className="line-clamp-2">{cardData.addressDisplay}</span>
      </address>

      {/* Location Badge + Directions */}
      <div className="flex items-center justify-between mt-3">
        <div className="flex items-center gap-1.5">
          {cardData.isHybrid ? (
            <LocationBadge type="hybrid" size="sm" variant="filled" />
          ) : cardData.isVirtual ? (
            <LocationBadge type="virtual" size="sm" variant="filled" />
          ) : (
            <LocationBadge type="inPerson" size="sm" variant="subtle" />
          )}
        </div>

        {cardData.canGetDirections && cardData.directionsUrl && (
          <a
            href={cardData.directionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded px-1"
            onClick={(e) => e.stopPropagation()}
            aria-label={`Get directions to ${cardData.locationDisplay}`}
          >
            Directions
            <ExternalLink className="h-3 w-3" aria-hidden="true" />
            <span className="sr-only"> (opens in new window)</span>
          </a>
        )}
      </div>

      {/* Mark Attended Button */}
      {showMarkAttendedButton && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => onMarkAttended(meeting.id)}
          disabled={isMarkingAttended}
          className={cn(
            'mt-3 w-full min-h-[44px]',
            isMissed && 'border-orange-300 text-orange-700 hover:bg-orange-100'
          )}
          aria-label={isMissed ? `Mark ${cardData.name} as attended` : `Mark ${cardData.name} as attended`}
        >
          {isMarkingAttended ? (
            <Loader2 className="h-4 w-4 animate-spin motion-reduce:animate-none mr-2" aria-hidden="true" />
          ) : null}
          {isMissed ? 'I Attended This Meeting' : 'Mark as Attended'}
        </Button>
      )}

      {/* Attended Badge + Mark Not Attended Button */}
      {meeting.attended && (
        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Badge variant="secondary" className="bg-green-100 text-green-700">
              Attended
            </Badge>
            {meeting.attendedAt && (
              <span className="text-xs">
                {meeting.attendedAt.toDate().toLocaleDateString()}
              </span>
            )}
          </div>
          {onMarkNotAttended && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onMarkNotAttended(meeting.id)}
              disabled={isMarkingNotAttended}
              className="text-xs text-muted-foreground hover:text-orange-600 h-7 px-2 min-h-[36px]"
              aria-label={`Mark ${cardData.name} as not attended`}
            >
              {isMarkingNotAttended ? (
                <Loader2 className="h-3 w-3 animate-spin motion-reduce:animate-none mr-1" aria-hidden="true" />
              ) : null}
              Didn't attend?
            </Button>
          )}
        </div>
      )}
    </article>
  )
}

// ============================================================
// EMPTY STATE COMPONENT
// ============================================================

function EmptyTabState({
  icon: Icon,
  title,
  description,
  action,
  secondaryAction,
}: {
  icon: React.ElementType
  title: string
  description: string
  action?: {
    label: string
    onClick: () => void
    icon?: React.ElementType
  }
  secondaryAction?: {
    label: string
    onClick: () => void
    icon?: React.ElementType
  }
}) {
  return (
    <div
      className="flex flex-col items-center justify-center py-12 px-4 text-center"
      role="status"
      aria-label={title}
    >
      <Icon className="h-12 w-12 text-muted-foreground mb-4" aria-hidden="true" />
      <p className="text-lg font-medium text-foreground">{title}</p>
      <p className="text-sm text-muted-foreground mt-1">{description}</p>
      <div className="flex flex-col sm:flex-row gap-2 mt-4">
        {action && (
          <Button variant="outline" onClick={action.onClick} className="min-h-[44px]">
            {action.icon && <action.icon className="h-4 w-4 mr-1.5" aria-hidden="true" />}
            {action.label}
            {!action.icon && <ChevronRight className="h-4 w-4 ml-1" aria-hidden="true" />}
          </Button>
        )}
        {secondaryAction && (
          <Button variant="ghost" onClick={secondaryAction.onClick} className="text-muted-foreground min-h-[44px]">
            {secondaryAction.icon && <secondaryAction.icon className="h-4 w-4 mr-1.5" aria-hidden="true" />}
            {secondaryAction.label}
          </Button>
        )}
      </div>
    </div>
  )
}

// ============================================================
// GOAL PROGRESS HEADER COMPONENT
// ============================================================

interface GoalProgressHeaderProps {
  activeGoal: MeetingGoal | null
  stats: MeetingGoalStats | null
  totalMeetings: number
  attendedCount: number
  missedCount: number
  isMobile?: boolean
}

function GoalProgressHeader({
  activeGoal,
  stats,
  totalMeetings,
  attendedCount,
  missedCount,
  isMobile = false,
}: GoalProgressHeaderProps) {
  const attendanceRate = totalMeetings > 0 ? Math.round((attendedCount / totalMeetings) * 100) : 0

  // Get goal display info
  const getGoalInfo = () => {
    if (!activeGoal) return null

    const preset = activeGoal.presetId ? getPresetById(activeGoal.presetId) : null
    let goalName = preset?.name || 'Custom Goal'
    let goalDescription = ''

    if (activeGoal.goalType === 'ninety-in-ninety') {
      goalName = '90 in 90'
      goalDescription = '90 meetings in 90 days'
    } else if (activeGoal.weeklyTarget) {
      goalDescription = `${activeGoal.weeklyTarget} meetings per week`
      if (activeGoal.durationWeeks) {
        goalDescription += ` for ${activeGoal.durationWeeks} weeks`
      }
    }

    return { name: goalName, description: goalDescription }
  }

  const goalInfo = getGoalInfo()

  return (
    <div className={cn(
      'bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl',
      'p-3 md:p-4' // Responsive padding
    )}>
      {/* Active Goal Section */}
      {activeGoal && stats && goalInfo && (
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            {activeGoal.goalType === 'ninety-in-ninety' ? (
              <Flame className="h-5 w-5 text-orange-500" />
            ) : (
              <Target className="h-5 w-5 text-primary" />
            )}
            <span className="font-semibold text-foreground">{goalInfo.name}</span>
            <Badge variant="outline" className="bg-green-100 text-green-700 border-green-200 text-xs">
              Active
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mb-3">{goalInfo.description}</p>

          {/* Weekly Progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">This Week</span>
              <span className="font-medium">
                {stats.currentWeekMeetings}/{stats.currentWeekTarget} meetings
              </span>
            </div>
            <Progress value={stats.currentWeekProgress} className="h-2" />
          </div>

          {/* Overall Progress (for 90-in-90) */}
          {activeGoal.goalType === 'ninety-in-ninety' && (
            <div className="mt-3 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Overall Progress</span>
                <span className="font-medium">
                  {stats.totalMeetings}/90 meetings
                </span>
              </div>
              <Progress value={stats.overallProgress} className="h-2" />
              {stats.daysRemaining !== null && (
                <p className="text-xs text-muted-foreground">
                  {stats.daysRemaining} days remaining
                </p>
              )}
            </div>
          )}

          {/* On Track Indicator */}
          <div className="flex items-center gap-2 mt-3">
            {stats.isOnTrack ? (
              <>
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span className="text-sm text-green-600 font-medium">On track!</span>
              </>
            ) : (
              <>
                <TrendingUp className="h-4 w-4 text-orange-500" />
                <span className="text-sm text-orange-500 font-medium">
                  {stats.currentWeekTarget - stats.currentWeekMeetings} more this week
                </span>
              </>
            )}
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className={cn(
        'grid gap-3',
        'grid-cols-2 md:grid-cols-4', // Responsive grid columns
        activeGoal ? 'border-t border-primary/20 pt-4' : ''
      )}>
        <div className="text-center">
          <p className="text-2xl font-bold text-foreground">{totalMeetings}</p>
          <p className="text-xs text-muted-foreground">Total Logged</p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <p className="text-2xl font-bold text-green-600">{attendedCount}</p>
          </div>
          <p className="text-xs text-muted-foreground">Attended</p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1">
            <XCircle className="h-4 w-4 text-orange-500" />
            <p className="text-2xl font-bold text-orange-500">{missedCount}</p>
          </div>
          <p className="text-xs text-muted-foreground">Missed</p>
        </div>
        <div className="text-center">
          <p className={cn(
            'text-2xl font-bold',
            attendanceRate >= 80 ? 'text-green-600' : attendanceRate >= 50 ? 'text-yellow-600' : 'text-orange-500'
          )}>
            {attendanceRate}%
          </p>
          <p className="text-xs text-muted-foreground">Attendance</p>
        </div>
      </div>
    </div>
  )
}

// ============================================================
// MAIN MEETINGS TAB COMPONENT
// ============================================================

export function MeetingsTab({ className }: MeetingsTabProps) {
  // Toast notifications
  const { toast } = useToast()
  const { setActiveTab: setGlobalActiveTab } = useTab()

  // Local state
  const [activeTab, setActiveTab] = useState<TabValue>('today')
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('7days')
  const [historyProgramFilter, setHistoryProgramFilter] = useState<HistoryProgramFilter>('all')
  const [markingAttended, setMarkingAttended] = useState<Record<string, boolean>>({})
  const [markingNotAttended, setMarkingNotAttended] = useState<Record<string, boolean>>({})
  const [isScheduling, setIsScheduling] = useState(false)
  const [isLogging, setIsLogging] = useState(false)
  const [showLogMeetingModal, setShowLogMeetingModal] = useState(false)

  // Sidebar and modal state
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showSavedFavoritesModal, setShowSavedFavoritesModal] = useState(false)

  // Get meetings data
  const {
    meetings: allMeetings,
    loading,
    error,
    refetch,
    favorites,
    toggleFavorite,
    userLocation,
    requestLocation,
    clearLocation,
    locationLoading,
    setFilter,
    externalMeetings,
    scheduledMeetings,
    markAttended,
    markNotAttended,
    scheduleMultiWeekMeetings,
    logManualMeeting,
    loadMore,
    hasMore,
    isFetchingMore,
  } = useMeetings({
    includeExternal: true,
    includeScheduled: true,
    applyFilters: false, // We'll filter manually for tabs
    sortByDistance: true,
  })

  // Get saved meetings data
  const {
    savedMeetings,
    favorites: savedFavorites,
    manualEntries,
    loading: savedLoading,
    deleteMeeting,
    toggleFavorite: toggleSavedFavorite,
  } = useSavedMeetings()

  // Get meeting goals data
  const {
    activeGoal,
    activeGoalStats,
    loading: goalsLoading,
  } = useMeetingGoals()

  // Detect mobile
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768

  // Filter meetings for each tab
  const todayMeetings = useMemo(
    () => getTodayMeetings(scheduledMeetings),
    [scheduledMeetings]
  )

  const upcomingMeetings = useMemo(
    () => getUpcomingMeetings(scheduledMeetings, timeFilter),
    [scheduledMeetings, timeFilter]
  )

  // Get all history meetings (unfiltered)
  const allHistoryMeetings = useMemo(
    () => getHistoryMeetings(scheduledMeetings),
    [scheduledMeetings]
  )

  // Filter history meetings by program type
  const historyMeetings = useMemo(() => {
    if (historyProgramFilter === 'all') {
      return allHistoryMeetings
    }

    const allowedTypes = PROGRAM_TYPE_MAP[historyProgramFilter]
    return allHistoryMeetings.filter((m) => {
      const meetingType = m.type?.toUpperCase() || ''
      return allowedTypes.some((type) => meetingType.includes(type.toUpperCase()))
    })
  }, [allHistoryMeetings, historyProgramFilter])

  // Calculate history stats for GoalProgressHeader (based on filtered meetings)
  const historyStats = useMemo(() => {
    const attended = historyMeetings.filter(m => m.attended === true).length
    const missed = historyMeetings.filter(m => m.attended === false || (!m.attended && m.status !== 'completed')).length
    return {
      total: historyMeetings.length,
      attended,
      missed: historyMeetings.length - attended,
    }
  }, [historyMeetings])

  // Auto-set default 10mi distance when location becomes available
  const hasSetDefaultDistance = useRef(false)

  useEffect(() => {
    if (userLocation && !hasSetDefaultDistance.current) {
      setFilter('distanceRadius', 10)
      hasSetDefaultDistance.current = true
    }
  }, [userLocation, setFilter])

  // Handle mark attended
  const handleMarkAttended = useCallback(
    async (meetingId: string) => {
      setMarkingAttended((prev) => ({ ...prev, [meetingId]: true }))
      try {
        const success = await markAttended(meetingId)
        if (success) {
          toast({
            title: 'Attendance recorded',
            description: 'Great job attending your meeting!',
          })
        }
      } finally {
        setMarkingAttended((prev) => ({ ...prev, [meetingId]: false }))
      }
    },
    [markAttended, toast]
  )

  // Handle mark not attended
  const handleMarkNotAttended = useCallback(
    async (meetingId: string) => {
      setMarkingNotAttended((prev) => ({ ...prev, [meetingId]: true }))
      try {
        const success = await markNotAttended(meetingId)
        if (success) {
          toast({
            title: 'Attendance updated',
            description: 'Meeting marked as not attended.',
          })
        }
      } finally {
        setMarkingNotAttended((prev) => ({ ...prev, [meetingId]: false }))
      }
    },
    [markNotAttended, toast]
  )

  // Handle schedule multi-week meeting
  const handleScheduleMeeting = useCallback(
    async (meeting: Meeting, weeks: number) => {
      setIsScheduling(true)
      try {
        const success = await scheduleMultiWeekMeetings(meeting, weeks)
        if (success) {
          const meetingName = meeting.name || 'Meeting'
          toast({
            title: 'Meeting added to schedule',
            description: weeks === 1
              ? `${meetingName} has been added for this week`
              : `${meetingName} has been added for ${weeks} weeks`,
          })
        }
      } finally {
        setIsScheduling(false)
      }
    },
    [scheduleMultiWeekMeetings, toast]
  )

  // Handle log manual meeting
  const handleLogMeeting = useCallback(
    async (details: LogMeetingDetails, date: Date, isAttended: boolean): Promise<string | null> => {
      setIsLogging(true)
      try {
        const meetingId = await logManualMeeting(details, date, isAttended)
        if (meetingId) {
          toast({
            title: isAttended ? 'Meeting logged successfully' : 'Meeting added to schedule',
            description: isAttended
              ? `${details.name} has been added to your history`
              : `${details.name} has been scheduled`,
          })
          setShowLogMeetingModal(false)
        }
        return meetingId
      } finally {
        setIsLogging(false)
      }
    },
    [logManualMeeting, toast]
  )

  // Handle opening the log meeting modal from empty states
  const handleOpenLogMeeting = useCallback(() => {
    setShowLogMeetingModal(true)
  }, [])

  // Navigate to browse tab
  const handleBrowseClick = useCallback(() => {
    setActiveTab('browse')
  }, [])

  // Handle opening saved/favorites modal from sidebar
  const handleOpenSavedFavorites = useCallback(() => {
    setSidebarOpen(false)
    setShowSavedFavoritesModal(true)
  }, [])

  // Pull-to-refresh handler
  const handleRefresh = useCallback(async () => {
    await refetch()
  }, [refetch])

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Page Header - using standardized TabHeader */}
      <TabHeader
        title="Meetings"
        onMenuClick={() => setSidebarOpen(true)}
        onProfileClick={() => setGlobalActiveTab('profile')}
      />

      {/* Sidebar Drawer */}
      <MeetingsSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onOpenSavedFavorites={handleOpenSavedFavorites}
        onOpenLogMeeting={handleOpenLogMeeting}
      />

      {/* Saved/Favorites Modal */}
      <SavedFavoritesModal
        isOpen={showSavedFavoritesModal}
        onClose={() => setShowSavedFavoritesModal(false)}
        savedMeetings={savedMeetings}
        favorites={savedFavorites}
        manualEntries={manualEntries}
        loading={savedLoading}
        onDeleteMeeting={deleteMeeting}
        onToggleFavorite={toggleSavedFavorite}
      />

      {/* Tab Navigation - scrolls with content */}
      <div className="px-4 py-2">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabValue)} className="flex-1">
          <TabsList className="w-full grid grid-cols-4 rounded-none bg-transparent border-0 p-0 h-7">
            <TabsTrigger
              value="today"
              className={cn(
                'flex-1 h-full rounded-none border-b-2 data-[state=active]:bg-transparent',
                'data-[state=active]:border-slate-700 data-[state=inactive]:border-transparent',
                'data-[state=active]:text-slate-800 data-[state=active]:font-medium data-[state=inactive]:text-slate-500',
                'text-[11px] gap-1'
              )}
            >
              <Calendar className="h-3 w-3" />
              Today
              {todayMeetings.length > 0 && (
                <Badge variant="secondary" className="ml-1 h-4 px-1 text-[9px]">
                  {todayMeetings.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger
              value="upcoming"
              className={cn(
                'flex-1 h-full rounded-none border-b-2 data-[state=active]:bg-transparent',
                'data-[state=active]:border-slate-700 data-[state=inactive]:border-transparent',
                'data-[state=active]:text-slate-800 data-[state=active]:font-medium data-[state=inactive]:text-slate-500',
                'text-[11px] gap-1'
              )}
            >
              <Clock className="h-3 w-3" />
              Upcoming
              {upcomingMeetings.length > 0 && (
                <Badge variant="secondary" className="ml-1 h-4 px-1 text-[9px]">
                  {upcomingMeetings.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger
              value="browse"
              className={cn(
                'flex-1 h-full rounded-none border-b-2 data-[state=active]:bg-transparent',
                'data-[state=active]:border-slate-700 data-[state=inactive]:border-transparent',
                'data-[state=active]:text-slate-800 data-[state=active]:font-medium data-[state=inactive]:text-slate-500',
                'text-[11px] gap-1'
              )}
            >
              <Search className="h-3 w-3" />
              Browse
            </TabsTrigger>
            <TabsTrigger
              value="history"
              className={cn(
                'flex-1 h-full rounded-none border-b-2 data-[state=active]:bg-transparent',
                'data-[state=active]:border-slate-700 data-[state=inactive]:border-transparent',
                'data-[state=active]:text-slate-800 data-[state=active]:font-medium data-[state=inactive]:text-slate-500',
                'text-[11px] gap-1'
              )}
            >
              <History className="h-3 w-3" />
              History
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Main Content - SEPARATE from tabs, state-based rendering like TasksTab */}
      {/* Browse tab needs its own scroll container for virtualization - render outside PullToRefresh */}
      {activeTab === 'browse' ? (
        <MeetingBrowser
          meetings={allMeetings}
          loading={loading}
          error={error}
          userLocation={userLocation}
          favorites={favorites}
          onToggleFavorite={toggleFavorite}
          onRequestLocation={requestLocation}
          locationLoading={locationLoading}
          onClearLocation={clearLocation}
          onScheduleMeeting={handleScheduleMeeting}
          isScheduling={isScheduling}
          onLogMeeting={handleLogMeeting}
          isLogging={isLogging}
          className="flex-1 min-h-0"
          onLoadMore={loadMore}
          hasMore={hasMore}
          isFetchingMore={isFetchingMore}
        />
      ) : (
      <PullToRefresh
        onRefresh={handleRefresh}
        className="flex-1 overflow-auto flex flex-col"
      >
        {/* TODAY Content */}
        {activeTab === 'today' && (
          loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Loading meetings...</p>
            </div>
          ) : todayMeetings.length === 0 ? (
            <EmptyTabState
              icon={CalendarDays}
              title="No meetings today"
              description="Browse to find and save meetings, or log one you attended"
              action={{ label: 'Browse Meetings', onClick: handleBrowseClick }}
              secondaryAction={{
                label: 'Log a Meeting',
                onClick: handleOpenLogMeeting,
                icon: PlusCircle,
              }}
            />
          ) : (
            <div className="flex-1 overflow-auto p-3 space-y-3">
              {todayMeetings.map((meeting) => (
                <ScheduledMeetingCard
                  key={meeting.id}
                  meeting={meeting}
                  onMarkAttended={handleMarkAttended}
                  onMarkNotAttended={handleMarkNotAttended}
                  isMarkingAttended={markingAttended[meeting.id]}
                  isMarkingNotAttended={markingNotAttended[meeting.id]}
                  isMobile={isMobile}
                />
              ))}
            </div>
          )
        )}

        {/* UPCOMING Content */}
        {activeTab === 'upcoming' && (
          <>
            {/* Time Filter */}
            <div className="p-3 border-b border-white/20 bg-white/10 backdrop-blur-sm">
              <Select value={timeFilter} onValueChange={(v) => setTimeFilter(v as TimeFilter)}>
                <SelectTrigger className="w-full max-w-[200px]">
                  <SelectValue placeholder="Select time range" />
                </SelectTrigger>
                <SelectContent>
                  {TIME_FILTER_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Loading meetings...</p>
              </div>
            ) : upcomingMeetings.length === 0 ? (
              <EmptyTabState
                icon={Clock}
                title="No upcoming meetings"
                description="Browse to find and add meetings to your schedule"
                action={{ label: 'Browse Meetings', onClick: handleBrowseClick }}
                secondaryAction={{
                  label: 'Add Manually',
                  onClick: handleOpenLogMeeting,
                  icon: PlusCircle,
                }}
              />
            ) : (
              <div className="flex-1 overflow-auto p-3 space-y-3">
                {upcomingMeetings.map((meeting) => (
                  <ScheduledMeetingCard
                    key={meeting.id}
                    meeting={meeting}
                    onMarkAttended={handleMarkAttended}
                    onMarkNotAttended={handleMarkNotAttended}
                    isMarkingAttended={markingAttended[meeting.id]}
                    isMarkingNotAttended={markingNotAttended[meeting.id]}
                    isMobile={isMobile}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {/* HISTORY Content */}
        {activeTab === 'history' && (
          loading || goalsLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Loading history...</p>
            </div>
          ) : allHistoryMeetings.length === 0 ? (
            <EmptyTabState
              icon={History}
              title="No meeting history"
              description="Log past meetings to build your attendance history and track your progress"
              action={{
                label: 'Log Past Meeting',
                onClick: handleOpenLogMeeting,
                icon: PlusCircle,
              }}
              secondaryAction={{
                label: 'Browse Meetings',
                onClick: handleBrowseClick,
              }}
            />
          ) : (
            <div className="flex-1 overflow-auto p-3 space-y-3">
              {/* Program Filter */}
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-muted-foreground">Filter by Program</span>
                <Select
                  value={historyProgramFilter}
                  onValueChange={(value) => setHistoryProgramFilter(value as HistoryProgramFilter)}
                >
                  <SelectTrigger className="w-[200px] h-9">
                    <SelectValue placeholder="All Meetings" />
                  </SelectTrigger>
                  <SelectContent>
                    {HISTORY_PROGRAM_FILTER_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Goal Progress Header with Stats */}
              <GoalProgressHeader
                activeGoal={activeGoal}
                stats={activeGoalStats}
                totalMeetings={historyStats.total}
                attendedCount={historyStats.attended}
                missedCount={historyStats.missed}
                isMobile={isMobile}
              />

              {/* Empty state for filtered results */}
              {historyMeetings.length === 0 && historyProgramFilter !== 'all' ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <History className="h-12 w-12 text-muted-foreground/50 mb-3" />
                  <p className="text-muted-foreground font-medium">
                    No {HISTORY_PROGRAM_FILTER_OPTIONS.find(o => o.value === historyProgramFilter)?.label} meetings found
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Try selecting a different program or &quot;All Meetings&quot;
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4"
                    onClick={() => setHistoryProgramFilter('all')}
                  >
                    Show All Meetings
                  </Button>
                </div>
              ) : (
                /* Meeting Cards */
                historyMeetings.map((meeting) => (
                  <ScheduledMeetingCard
                    key={meeting.id}
                    meeting={meeting}
                    onMarkAttended={handleMarkAttended}
                    isMarkingAttended={markingAttended[meeting.id]}
                    isMobile={isMobile}
                    isHistoryView={true}
                  />
                ))
              )}
            </div>
          )
        )}
      </PullToRefresh>
      )}

      {/* Log Meeting Modal (accessible from empty states) */}
      <LogMeetingModal
        isOpen={showLogMeetingModal}
        onClose={() => setShowLogMeetingModal(false)}
        onLogFuture={async (details, date) => {
          await handleLogMeeting(details, date, false)
        }}
        onLogPast={async (details, date) => {
          await handleLogMeeting(details, date, true)
        }}
        isLoading={isLogging}
      />
    </div>
  )
}

export default MeetingsTab
