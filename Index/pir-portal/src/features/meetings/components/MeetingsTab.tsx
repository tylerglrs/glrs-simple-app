import { useState, useMemo, useCallback } from 'react'
import { Calendar, Clock, History, Search, Loader2, CalendarDays, ChevronRight } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { useMeetings } from '../hooks'
import { MeetingBrowser } from './MeetingBrowser'
import { MeetingList } from './MeetingList'
import type { Meeting, MeetingsTabProps, ScheduledMeeting } from '../types'
import { DAYS_OF_WEEK } from '../types'

// ============================================================
// TYPES
// ============================================================

type TabValue = 'today' | 'upcoming' | 'browse' | 'history'
type TimeFilter = '7days' | '14days' | '30days' | 'all'

// ============================================================
// CONSTANTS
// ============================================================

const TIME_FILTER_OPTIONS: { value: TimeFilter; label: string }[] = [
  { value: '7days', label: 'Next 7 days' },
  { value: '14days', label: 'Next 14 days' },
  { value: '30days', label: 'Next 30 days' },
  { value: 'all', label: 'All upcoming' },
]

// ============================================================
// HELPER FUNCTIONS
// ============================================================

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
 * Filter meetings for today
 */
function getTodayMeetings(
  scheduledMeetings: ScheduledMeeting[],
  externalMeetings: Meeting[]
): Meeting[] {
  const today = new Date()
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000)
  const todayDay = getDayOfWeek(today)

  const results: Meeting[] = []

  // Add scheduled meetings for today
  scheduledMeetings.forEach((m) => {
    if (m.scheduledTime) {
      const meetingDate = m.scheduledTime.toDate()
      if (meetingDate >= todayStart && meetingDate < todayEnd) {
        results.push({ ...m, source: 'GLRS' })
      }
    }
  })

  // Add external meetings that occur on today's day of week
  externalMeetings.forEach((m) => {
    if (m.day === todayDay) {
      results.push(m)
    }
  })

  // Sort by time
  return results.sort((a, b) => {
    const timeA = a.time || '00:00'
    const timeB = b.time || '00:00'
    return timeA.localeCompare(timeB)
  })
}

/**
 * Filter scheduled meetings by time range
 */
function getUpcomingMeetings(
  scheduledMeetings: ScheduledMeeting[],
  timeFilter: TimeFilter
): ScheduledMeeting[] {
  const now = new Date()
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
      const meetingDate = m.scheduledTime.toDate()
      return meetingDate >= now && meetingDate <= endDate && m.status !== 'completed'
    })
    .sort((a, b) => {
      const dateA = a.scheduledTime?.toDate() || new Date()
      const dateB = b.scheduledTime?.toDate() || new Date()
      return dateA.getTime() - dateB.getTime()
    })
}

/**
 * Get past attended meetings (history)
 */
function getHistoryMeetings(scheduledMeetings: ScheduledMeeting[]): ScheduledMeeting[] {
  return scheduledMeetings
    .filter((m) => m.attended === true || m.status === 'completed')
    .sort((a, b) => {
      const dateA = a.attendedAt?.toDate() || a.scheduledTime?.toDate() || new Date()
      const dateB = b.attendedAt?.toDate() || b.scheduledTime?.toDate() || new Date()
      return dateB.getTime() - dateA.getTime() // Most recent first
    })
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
  isMarkingAttended?: boolean
  isMobile?: boolean
}

function ScheduledMeetingCard({
  meeting,
  onMarkAttended,
  isMarkingAttended = false,
  isMobile = false,
}: ScheduledMeetingCardProps) {
  const isNow = isMeetingNow(meeting)
  const source = meeting.source || 'GLRS'

  return (
    <div
      className={cn(
        'bg-card rounded-xl border p-3 transition-all',
        isNow && 'ring-2 ring-primary',
        isMobile ? 'p-3' : 'p-4'
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h3 className={cn('font-semibold text-foreground truncate', isMobile ? 'text-sm' : 'text-base')}>
            {meeting.meetingTitle || meeting.name || 'Unnamed Meeting'}
          </h3>
          <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
            <Calendar className="h-3.5 w-3.5" />
            <span>{formatDate(meeting)}</span>
            <Clock className="h-3.5 w-3.5 ml-1" />
            <span>{formatScheduledTime(meeting)}</span>
            {isNow && (
              <Badge variant="default" className="bg-primary text-xs">
                NOW
              </Badge>
            )}
          </div>
        </div>
        <Badge
          variant="secondary"
          className={cn(
            'shrink-0 text-xs',
            source === 'GLRS' && 'bg-primary/10 text-primary',
            source === 'AA' && 'bg-blue-100 text-blue-700',
            source === 'NA' && 'bg-purple-100 text-purple-700'
          )}
        >
          {source}
        </Badge>
      </div>

      {/* Mark Attended Button */}
      {onMarkAttended && !meeting.attended && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => onMarkAttended(meeting.id)}
          disabled={isMarkingAttended}
          className="mt-3 w-full"
        >
          {isMarkingAttended ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : null}
          Mark as Attended
        </Button>
      )}

      {/* Attended Badge */}
      {meeting.attended && (
        <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
          <Badge variant="secondary" className="bg-green-100 text-green-700">
            Attended
          </Badge>
          {meeting.attendedAt && (
            <span className="text-xs">
              {meeting.attendedAt.toDate().toLocaleDateString()}
            </span>
          )}
        </div>
      )}
    </div>
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
}: {
  icon: React.ElementType
  title: string
  description: string
  action?: {
    label: string
    onClick: () => void
  }
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <Icon className="h-12 w-12 text-muted-foreground mb-4" />
      <p className="text-lg font-medium text-foreground">{title}</p>
      <p className="text-sm text-muted-foreground mt-1">{description}</p>
      {action && (
        <Button variant="outline" onClick={action.onClick} className="mt-4">
          {action.label}
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      )}
    </div>
  )
}

// ============================================================
// MAIN MEETINGS TAB COMPONENT
// ============================================================

export function MeetingsTab({ className }: MeetingsTabProps) {
  // Local state
  const [activeTab, setActiveTab] = useState<TabValue>('today')
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('7days')
  const [markingAttended, setMarkingAttended] = useState<Record<string, boolean>>({})

  // Get meetings data
  const {
    meetings: allMeetings,
    loading,
    error,
    favorites,
    toggleFavorite,
    userLocation,
    requestLocation,
    locationLoading,
    externalMeetings,
    scheduledMeetings,
    markAttended,
  } = useMeetings({
    includeExternal: true,
    includeScheduled: true,
    applyFilters: false, // We'll filter manually for tabs
    sortByDistance: true,
  })

  // Detect mobile
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768

  // Filter meetings for each tab
  const todayMeetings = useMemo(
    () => getTodayMeetings(scheduledMeetings, externalMeetings),
    [scheduledMeetings, externalMeetings]
  )

  const upcomingMeetings = useMemo(
    () => getUpcomingMeetings(scheduledMeetings, timeFilter),
    [scheduledMeetings, timeFilter]
  )

  const historyMeetings = useMemo(
    () => getHistoryMeetings(scheduledMeetings),
    [scheduledMeetings]
  )

  // Handle mark attended
  const handleMarkAttended = useCallback(
    async (meetingId: string) => {
      setMarkingAttended((prev) => ({ ...prev, [meetingId]: true }))
      try {
        await markAttended(meetingId)
      } finally {
        setMarkingAttended((prev) => ({ ...prev, [meetingId]: false }))
      }
    },
    [markAttended]
  )

  // Navigate to browse tab
  const handleBrowseClick = useCallback(() => {
    setActiveTab('browse')
  }, [])

  return (
    <div className={cn('flex flex-col h-full', className)}>
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabValue)} className="flex flex-col h-full">
        {/* Tab Navigation */}
        <div className="border-b bg-background sticky top-0 z-10">
          <TabsList className="w-full h-12 rounded-none bg-transparent border-0 p-0">
            <TabsTrigger
              value="today"
              className={cn(
                'flex-1 h-full rounded-none border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent',
                'data-[state=inactive]:border-transparent'
              )}
            >
              <Calendar className="h-4 w-4 mr-1.5" />
              Today
              {todayMeetings.length > 0 && (
                <Badge variant="secondary" className="ml-1.5 text-xs">
                  {todayMeetings.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger
              value="upcoming"
              className={cn(
                'flex-1 h-full rounded-none border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent',
                'data-[state=inactive]:border-transparent'
              )}
            >
              <Clock className="h-4 w-4 mr-1.5" />
              Upcoming
              {upcomingMeetings.length > 0 && (
                <Badge variant="secondary" className="ml-1.5 text-xs">
                  {upcomingMeetings.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger
              value="browse"
              className={cn(
                'flex-1 h-full rounded-none border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent',
                'data-[state=inactive]:border-transparent'
              )}
            >
              <Search className="h-4 w-4 mr-1.5" />
              Browse
            </TabsTrigger>
            <TabsTrigger
              value="history"
              className={cn(
                'flex-1 h-full rounded-none border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent',
                'data-[state=inactive]:border-transparent'
              )}
            >
              <History className="h-4 w-4 mr-1.5" />
              History
            </TabsTrigger>
          </TabsList>
        </div>

        {/* TODAY Tab */}
        <TabsContent value="today" className="flex-1 overflow-hidden m-0">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Loading meetings...</p>
            </div>
          ) : todayMeetings.length === 0 ? (
            <EmptyTabState
              icon={CalendarDays}
              title="No meetings today"
              description="Browse to find and save meetings for today"
              action={{ label: 'Browse Meetings', onClick: handleBrowseClick }}
            />
          ) : (
            <MeetingList
              meetings={todayMeetings}
              loading={false}
              error={null}
              favorites={favorites}
              onToggleFavorite={toggleFavorite}
              showDistance={!!userLocation}
              isMobile={isMobile}
              className="h-full"
            />
          )}
        </TabsContent>

        {/* UPCOMING Tab */}
        <TabsContent value="upcoming" className="flex-1 overflow-hidden m-0">
          {/* Time Filter */}
          <div className="p-3 border-b bg-muted/30">
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
            />
          ) : (
            <div className="flex-1 overflow-auto p-3 space-y-3">
              {upcomingMeetings.map((meeting) => (
                <ScheduledMeetingCard
                  key={meeting.id}
                  meeting={meeting}
                  onMarkAttended={handleMarkAttended}
                  isMarkingAttended={markingAttended[meeting.id]}
                  isMobile={isMobile}
                />
              ))}
            </div>
          )}
        </TabsContent>

        {/* BROWSE Tab */}
        <TabsContent value="browse" className="flex-1 overflow-hidden m-0">
          <MeetingBrowser
            meetings={allMeetings}
            loading={loading}
            error={error}
            userLocation={userLocation}
            favorites={favorites}
            onToggleFavorite={toggleFavorite}
            onRequestLocation={requestLocation}
            locationLoading={locationLoading}
            className="h-full"
          />
        </TabsContent>

        {/* HISTORY Tab */}
        <TabsContent value="history" className="flex-1 overflow-hidden m-0">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Loading history...</p>
            </div>
          ) : historyMeetings.length === 0 ? (
            <EmptyTabState
              icon={History}
              title="No meeting history"
              description="Attended meetings will appear here"
            />
          ) : (
            <div className="flex-1 overflow-auto p-3 space-y-3">
              {historyMeetings.map((meeting) => (
                <ScheduledMeetingCard
                  key={meeting.id}
                  meeting={meeting}
                  isMobile={isMobile}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default MeetingsTab
