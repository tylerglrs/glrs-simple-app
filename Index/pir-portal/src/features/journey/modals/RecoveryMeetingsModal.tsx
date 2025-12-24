import { useState, useMemo, useCallback, useEffect } from 'react'
import {
  X,
  Calendar,
  Target,
  Award,
  PlusCircle,
  CheckCircle,
  Flame,
  CalendarDays,
  Clock,
  TrendingUp,
  Trophy,
  Loader2,
  AlertCircle,
} from 'lucide-react'
import { ResponsiveModal } from '@/components/ui/responsive-modal'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { cn } from '@/lib/utils'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { Illustration } from '@/components/common/Illustration'
import { useToast } from '@/hooks/use-toast'
import { useUserMeetings, useMeetingGoals, GOAL_PRESETS, DURATION_OPTIONS, type GoalDurationWeeks } from '@/features/meetings/hooks'
import { LogMeetingModal, type LogMeetingDetails } from '@/features/meetings/components/LogMeetingModal'
import type { ScheduledMeeting } from '@/features/meetings/types'
import { DAYS_OF_WEEK } from '@/features/meetings/types'
import { toMeetingCardData, PROGRAM_TYPE_COLORS } from '@/features/meetings/utils/toMeetingCardData'
import { MEETING_MILESTONES, PROGRAM_MILESTONE_COLORS } from '@/features/journey/types/recovery'
import { useStatusBarColor } from '@/hooks/useStatusBarColor'

// =============================================================================
// TYPES
// =============================================================================

export interface RecoveryMeetingsModalProps {
  isOpen: boolean
  onClose: () => void
}

type TabValue = 'logged' | 'goals' | 'milestones'

// Get program-specific milestone colors for 12-step programs
const MILESTONE_COLORS = PROGRAM_MILESTONE_COLORS.aa

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function formatMeetingDate(meeting: ScheduledMeeting): string {
  if (!meeting.scheduledTime) return ''
  const date = meeting.scheduledTime.toDate()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const dayName = DAYS_OF_WEEK[date.getDay()]
  return `${dayName}, ${month}/${day}`
}

function formatMeetingTime(meeting: ScheduledMeeting): string {
  if (!meeting.scheduledTime) return 'Time TBD'
  const date = meeting.scheduledTime.toDate()
  const hours = date.getHours()
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const ampm = hours >= 12 ? 'PM' : 'AM'
  const displayHour = hours % 12 || 12
  return `${displayHour}:${minutes} ${ampm}`
}

function getGoalIcon(iconName: string) {
  switch (iconName) {
    case 'flame':
      return Flame
    case 'calendar':
    case 'calendar-check':
    case 'calendar-heart':
    case 'calendar-range':
      return CalendarDays
    default:
      return Target
  }
}

// =============================================================================
// MEETING CARD COMPONENT (Simplified for modal)
// =============================================================================

interface MeetingCardProps {
  meeting: ScheduledMeeting
  onMarkAttended?: (id: string) => void
  onMarkNotAttended?: (id: string) => void
  isLoading?: boolean
  isMobile?: boolean
}

function MeetingCard({
  meeting,
  onMarkAttended,
  onMarkNotAttended,
  isLoading,
  isMobile,
}: MeetingCardProps) {
  // Transform to standardized card data - ensures consistent display
  const cardData = toMeetingCardData(meeting)
  const programColors = PROGRAM_TYPE_COLORS[cardData.programType.toUpperCase()] ||
    PROGRAM_TYPE_COLORS[cardData.programType] ||
    PROGRAM_TYPE_COLORS.Meeting

  const isAttended = meeting.attended
  const isPast = meeting.scheduledTime && meeting.scheduledTime.toDate() < new Date()

  return (
    <article
      className={cn(
        'bg-card rounded-lg border p-2.5 md:p-3 transition-all motion-reduce:transition-none',
        isAttended && 'border-green-200 bg-green-50/30',
        !isAttended && isPast && 'border-orange-200 bg-orange-50/30'
      )}
      aria-label={`${cardData.name}, ${formatMeetingDate(meeting)} at ${cardData.timeDisplay}${isAttended ? ', attended' : isPast ? ', missed' : ''}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-sm truncate">
            {cardData.name}
          </h4>
          <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" aria-hidden="true" />
            <span>{formatMeetingDate(meeting)}</span>
            <Clock className="h-3 w-3 ml-1" aria-hidden="true" />
            <span>{cardData.timeDisplay}</span>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <Badge
            variant="secondary"
            className={cn('text-xs shrink-0', programColors.bg, programColors.text)}
          >
            {cardData.programTypeDisplay}
          </Badge>
          {isAttended && (
            <Badge className="bg-green-100 text-green-700 text-xs">Attended</Badge>
          )}
          {!isAttended && isPast && (
            <Badge variant="outline" className="bg-orange-100 text-orange-700 border-orange-200 text-xs">
              Missed
            </Badge>
          )}
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-2 mt-2">
        {isAttended && onMarkNotAttended && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onMarkNotAttended(meeting.id)}
            disabled={isLoading}
            className="text-xs h-7 min-h-[36px] text-muted-foreground hover:text-orange-600"
            aria-label={`Mark ${cardData.name} as not attended`}
          >
            {isLoading && <Loader2 className="h-3 w-3 animate-spin motion-reduce:animate-none mr-1" aria-hidden="true" />}
            Didn't attend?
          </Button>
        )}
        {!isAttended && isPast && onMarkAttended && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onMarkAttended(meeting.id)}
            disabled={isLoading}
            className="text-xs h-7 min-h-[36px] border-green-300 text-green-700 hover:bg-green-50"
            aria-label={`Mark ${cardData.name} as attended`}
          >
            {isLoading && <Loader2 className="h-3 w-3 animate-spin motion-reduce:animate-none mr-1" aria-hidden="true" />}
            I Attended
          </Button>
        )}
      </div>
    </article>
  )
}

// =============================================================================
// GOAL CARD COMPONENT
// =============================================================================

interface GoalPresetCardProps {
  preset: typeof GOAL_PRESETS[number]
  isSelected: boolean
  onSelect: () => void
  disabled?: boolean
}

function GoalPresetCard({ preset, isSelected, onSelect, disabled }: GoalPresetCardProps) {
  const Icon = getGoalIcon(preset.icon)

  return (
    <button
      onClick={onSelect}
      disabled={disabled}
      className={cn(
        'w-full p-3 rounded-lg border-2 text-left transition-all motion-reduce:transition-none min-h-[60px]',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
        isSelected
          ? 'border-primary bg-primary/5'
          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50',
        disabled && 'opacity-50 cursor-not-allowed'
      )}
      aria-label={`${preset.name}: ${preset.description}`}
      aria-pressed={isSelected}
      role="radio"
      aria-checked={isSelected}
    >
      <div className="flex items-start gap-3">
        <div
          className="h-10 w-10 rounded-full flex items-center justify-center shrink-0"
          style={{ backgroundColor: `${preset.color}20` }}
          aria-hidden="true"
        >
          <Icon className="h-5 w-5" style={{ color: preset.color }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm">{preset.name}</p>
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
            {preset.description}
          </p>
        </div>
        {isSelected && (
          <CheckCircle className="h-5 w-5 text-primary shrink-0" aria-hidden="true" />
        )}
      </div>
    </button>
  )
}

// =============================================================================
// STATS BAR COMPONENT
// =============================================================================

interface StatsBarProps {
  totalMeetings: number
  attendedCount: number
  missedCount: number
  isMobile?: boolean
}

function StatsBar({ totalMeetings, attendedCount, missedCount, isMobile }: StatsBarProps) {
  const attendanceRate = totalMeetings > 0
    ? Math.round((attendedCount / totalMeetings) * 100)
    : 0

  return (
    <div
      className="grid grid-cols-2 md:grid-cols-4 gap-2 bg-muted/30 rounded-lg p-3"
      role="group"
      aria-label="Meeting statistics"
    >
      <div className="text-center" aria-label={`Total meetings: ${totalMeetings}`}>
        <p className="text-2xl font-bold text-primary" aria-hidden="true">{totalMeetings}</p>
        <p className="text-xs text-muted-foreground">Total</p>
      </div>
      <div className="text-center" aria-label={`Attended: ${attendedCount} meetings`}>
        <p className="text-2xl font-bold text-green-600" aria-hidden="true">{attendedCount}</p>
        <p className="text-xs text-muted-foreground">Attended</p>
      </div>
      <div className="text-center" aria-label={`Missed: ${missedCount} meetings`}>
        <p className="text-2xl font-bold text-orange-600" aria-hidden="true">{missedCount}</p>
        <p className="text-xs text-muted-foreground">Missed</p>
      </div>
      <div className="text-center" aria-label={`Attendance rate: ${attendanceRate} percent`}>
        <p className="text-2xl font-bold text-blue-600" aria-hidden="true">{attendanceRate}%</p>
        <p className="text-xs text-muted-foreground">Rate</p>
      </div>
    </div>
  )
}

// =============================================================================
// ACTIVE GOAL PROGRESS COMPONENT
// =============================================================================

interface ActiveGoalProgressProps {
  goal: ReturnType<typeof useMeetingGoals>['activeGoal']
  stats: ReturnType<typeof useMeetingGoals>['activeGoalStats']
  isMobile?: boolean
}

function ActiveGoalProgress({ goal, stats, isMobile }: ActiveGoalProgressProps) {
  if (!goal || !stats) return null

  const preset = GOAL_PRESETS.find((p) => p.id === goal.presetId)
  const Icon = preset ? getGoalIcon(preset.icon) : Target

  return (
    <Card className="border-primary/50 bg-primary/5">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <div
            className="h-8 w-8 rounded-full flex items-center justify-center"
            style={{ backgroundColor: preset?.color ? `${preset.color}20` : '#f0f0f0' }}
          >
            <Icon
              className="h-4 w-4"
              style={{ color: preset?.color || '#666' }}
            />
          </div>
          <div className="flex-1">
            <CardTitle className="text-sm">
              {preset?.name || 'Active Goal'}
            </CardTitle>
            <CardDescription className="text-xs">
              {stats.daysRemaining !== null
                ? `${stats.daysRemaining} days remaining`
                : 'Ongoing'}
            </CardDescription>
          </div>
          {stats.isOnTrack ? (
            <Badge className="bg-green-100 text-green-700">On Track</Badge>
          ) : (
            <Badge className="bg-orange-100 text-orange-700">Catching Up</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2">
          {/* Overall Progress */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span>Overall Progress</span>
              <span>{stats.totalMeetings} / {stats.totalTarget || 'ongoing'}</span>
            </div>
            <Progress value={stats.overallProgress} className="h-2" />
          </div>

          {/* This Week */}
          {goal.weeklyTarget && (
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span>This Week</span>
                <span>{stats.currentWeekMeetings} / {stats.currentWeekTarget}</span>
              </div>
              <Progress value={stats.currentWeekProgress} className="h-2" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function RecoveryMeetingsModal({ isOpen, onClose }: RecoveryMeetingsModalProps) {
  const { toast } = useToast()
  const isMobile = useMediaQuery('(max-width: 768px)')

  // Set iOS status bar to match modal header color (teal-600)
  useStatusBarColor('#0D9488', isOpen)

  // Tab state
  const [activeTab, setActiveTab] = useState<TabValue>('logged')

  // Goal creation state
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>(null)
  const [customWeeklyTarget, setCustomWeeklyTarget] = useState(3)
  const [selectedDuration, setSelectedDuration] = useState<GoalDurationWeeks>(4)
  const [isCreatingGoal, setIsCreatingGoal] = useState(false)
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)

  // Log meeting modal state
  const [showLogMeetingModal, setShowLogMeetingModal] = useState(false)
  const [isLogging, setIsLogging] = useState(false)

  // Attendance action state
  const [attendanceLoading, setAttendanceLoading] = useState<Record<string, boolean>>({})

  // Data hooks
  const {
    meetings: scheduledMeetings,
    loading: meetingsLoading,
    markAttended,
    markNotAttended,
    logManualMeeting,
  } = useUserMeetings()

  const {
    activeGoal,
    activeGoalStats,
    allGoals,
    loading: goalsLoading,
    hasActiveGoal,
    canCreateNewGoal,
    createGoal,
    cancelGoal,
    updateGoalProgress,
  } = useMeetingGoals()

  // ==========================================================================
  // COMPUTED VALUES
  // ==========================================================================

  // Filter and sort meetings for display
  const sortedMeetings = useMemo(() => {
    return [...scheduledMeetings].sort((a, b) => {
      const dateA = a.scheduledTime?.toDate() || new Date()
      const dateB = b.scheduledTime?.toDate() || new Date()
      return dateB.getTime() - dateA.getTime() // Most recent first
    })
  }, [scheduledMeetings])

  // Stats
  const stats = useMemo(() => {
    const total = scheduledMeetings.length
    const attended = scheduledMeetings.filter((m) => m.attended).length
    const past = scheduledMeetings.filter(
      (m) => m.scheduledTime && m.scheduledTime.toDate() < new Date()
    ).length
    const missed = past - attended

    return { total, attended, missed }
  }, [scheduledMeetings])

  // Milestones achieved
  const achievedMilestones = useMemo(() => {
    return MEETING_MILESTONES.filter((m) => stats.attended >= m.count)
  }, [stats.attended])

  const nextMilestone = useMemo(() => {
    return MEETING_MILESTONES.find((m) => stats.attended < m.count)
  }, [stats.attended])

  // Get selected preset
  const selectedPreset = useMemo(() => {
    return GOAL_PRESETS.find((p) => p.id === selectedPresetId)
  }, [selectedPresetId])

  // ==========================================================================
  // HANDLERS
  // ==========================================================================

  // Handle mark attended
  const handleMarkAttended = useCallback(
    async (meetingId: string) => {
      setAttendanceLoading((prev) => ({ ...prev, [meetingId]: true }))
      try {
        const success = await markAttended(meetingId)
        if (success) {
          toast({
            title: 'Attendance recorded',
            description: 'Great job attending your meeting!',
          })
          // Update goal progress if there's an active goal
          if (activeGoal?.id) {
            const meeting = scheduledMeetings.find((m) => m.id === meetingId)
            if (meeting?.scheduledTime) {
              await updateGoalProgress(activeGoal.id, meeting.scheduledTime.toDate())
            }
          }
        }
      } finally {
        setAttendanceLoading((prev) => ({ ...prev, [meetingId]: false }))
      }
    },
    [markAttended, toast, activeGoal, scheduledMeetings, updateGoalProgress]
  )

  // Handle mark not attended
  const handleMarkNotAttended = useCallback(
    async (meetingId: string) => {
      setAttendanceLoading((prev) => ({ ...prev, [meetingId]: true }))
      try {
        const success = await markNotAttended(meetingId)
        if (success) {
          toast({
            title: 'Attendance updated',
            description: 'Meeting marked as not attended.',
          })
        }
      } finally {
        setAttendanceLoading((prev) => ({ ...prev, [meetingId]: false }))
      }
    },
    [markNotAttended, toast]
  )

  // Handle log meeting
  const handleLogMeeting = useCallback(
    async (details: LogMeetingDetails, date: Date, isAttended: boolean) => {
      setIsLogging(true)
      try {
        const meetingId = await logManualMeeting(details, date, isAttended)
        if (meetingId) {
          toast({
            title: isAttended ? 'Meeting logged' : 'Meeting scheduled',
            description: `${details.name} has been added.`,
          })
          setShowLogMeetingModal(false)
          // Update goal progress if attended
          if (isAttended && activeGoal?.id) {
            await updateGoalProgress(activeGoal.id, date)
          }
        }
      } finally {
        setIsLogging(false)
      }
    },
    [logManualMeeting, toast, activeGoal, updateGoalProgress]
  )

  // Handle create goal
  const handleCreateGoal = useCallback(async () => {
    if (!selectedPreset) return

    setIsCreatingGoal(true)
    try {
      const weeklyTarget =
        selectedPreset.id === 'custom' ? customWeeklyTarget : selectedPreset.weeklyTarget
      const duration =
        selectedPreset.id === 'ninety-in-ninety' ? 12 : selectedDuration

      const goalId = await createGoal(
        selectedPreset.goalType,
        weeklyTarget,
        duration,
        selectedPreset.id
      )

      if (goalId) {
        toast({
          title: 'Goal created!',
          description: `Your ${selectedPreset.name} goal has started.`,
        })
        setSelectedPresetId(null)
        setSelectedDuration(4)
        setCustomWeeklyTarget(3)
      }
    } finally {
      setIsCreatingGoal(false)
    }
  }, [selectedPreset, customWeeklyTarget, selectedDuration, createGoal, toast])

  // Handle cancel goal
  const handleCancelGoal = useCallback(async () => {
    if (!activeGoal?.id) return

    try {
      const success = await cancelGoal(activeGoal.id)
      if (success) {
        toast({
          title: 'Goal cancelled',
          description: 'You can start a new goal anytime.',
        })
        setShowCancelConfirm(false)
      }
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to cancel goal. Please try again.',
        variant: 'destructive',
      })
    }
  }, [activeGoal, cancelGoal, toast])

  // Reset form state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedPresetId(null)
      setSelectedDuration(4)
      setCustomWeeklyTarget(3)
    }
  }, [isOpen])

  // ==========================================================================
  // RENDER
  // ==========================================================================

  const loading = meetingsLoading || goalsLoading

  return (
    <>
      <ResponsiveModal
        open={isOpen}
        onOpenChange={(open) => !open && onClose()}
        desktopSize="lg"
      >
        <div className="flex flex-col h-full bg-white">
          {/* Header */}
          <div className="px-4 py-4 bg-gradient-to-r from-teal-600 to-cyan-600 shrink-0 relative overflow-hidden">
            {/* Decorative illustration */}
            <div className="absolute right-0 top-1/2 -translate-y-1/2 opacity-15 pointer-events-none">
              <Illustration name="support" size="md" />
            </div>
            <div className="flex items-center justify-between relative z-10">
              <div>
                <h2 className="text-lg font-semibold text-white">12 Step Meeting Tracker</h2>
                <p className="text-sm text-white/80">
                  Track your AA, NA, and other 12 Step meeting attendance
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="min-h-[44px] min-w-[44px] text-white hover:bg-white/20"
                aria-label="Close meeting tracker"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </Button>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="px-4 py-3 border-b shrink-0">
            <StatsBar
              totalMeetings={stats.total}
              attendedCount={stats.attended}
              missedCount={stats.missed}
              isMobile={isMobile}
            />
          </div>

          {/* Tabs */}
          <Tabs
            value={activeTab}
            onValueChange={(v) => setActiveTab(v as TabValue)}
            className="flex-1 flex flex-col min-h-0"
          >
            <TabsList className="mx-4 mt-2 grid grid-cols-3 shrink-0">
              <TabsTrigger value="logged" className="gap-1.5 min-h-[44px]" aria-label="Logged meetings">
                <Calendar className="h-4 w-4" aria-hidden="true" />
                {!isMobile && 'Logged'}
              </TabsTrigger>
              <TabsTrigger value="goals" className="gap-1.5 min-h-[44px]" aria-label="Meeting goals">
                <Target className="h-4 w-4" aria-hidden="true" />
                {!isMobile && 'Goals'}
              </TabsTrigger>
              <TabsTrigger value="milestones" className="gap-1.5 min-h-[44px]" aria-label="Meeting milestones">
                <Award className="h-4 w-4" aria-hidden="true" />
                {!isMobile && 'Milestones'}
              </TabsTrigger>
            </TabsList>

            {/* LOGGED MEETINGS TAB */}
            <TabsContent value="logged" className="flex-1 m-0 overflow-hidden">
              <ScrollArea className="h-full">
                <div className="p-4 space-y-3">
                  {/* Log Meeting Button */}
                  <Button
                    onClick={() => setShowLogMeetingModal(true)}
                    className="w-full gap-2 min-h-[44px]"
                    disabled={loading}
                    aria-label="Log a new meeting"
                  >
                    <PlusCircle className="h-4 w-4" aria-hidden="true" />
                    Log a Meeting
                  </Button>

                  {/* Active Goal Progress (if exists) */}
                  {activeGoal && activeGoalStats && (
                    <ActiveGoalProgress
                      goal={activeGoal}
                      stats={activeGoalStats}
                      isMobile={isMobile}
                    />
                  )}

                  <Separator />

                  {/* Meeting List */}
                  {loading ? (
                    <div
                      className="flex items-center justify-center py-8"
                      role="status"
                      aria-label="Loading meetings"
                    >
                      <Loader2 className="h-6 w-6 animate-spin motion-reduce:animate-none text-muted-foreground" aria-hidden="true" />
                      <span className="sr-only">Loading meetings...</span>
                    </div>
                  ) : sortedMeetings.length === 0 ? (
                    <div
                      className="text-center py-8 bg-gradient-to-br from-teal-50 to-cyan-50 rounded-xl border-2 border-dashed border-teal-200"
                      role="status"
                      aria-label="No meetings logged yet"
                    >
                      <div className="mb-4">
                        <Illustration name="journey" size="lg" className="mx-auto opacity-85" />
                      </div>
                      <p className="font-medium text-foreground">No meetings logged yet</p>
                      <p className="text-sm text-muted-foreground mt-1 px-4">
                        Use the button above to log your first meeting and start tracking your progress
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {sortedMeetings.map((meeting) => (
                        <MeetingCard
                          key={meeting.id}
                          meeting={meeting}
                          onMarkAttended={handleMarkAttended}
                          onMarkNotAttended={handleMarkNotAttended}
                          isLoading={attendanceLoading[meeting.id]}
                          isMobile={isMobile}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>

            {/* GOALS TAB */}
            <TabsContent value="goals" className="flex-1 m-0 overflow-hidden">
              <ScrollArea className="h-full">
                <div className="p-4 space-y-4">
                  {/* Active Goal Display */}
                  {hasActiveGoal && activeGoal && activeGoalStats && (
                    <>
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold">Your Active Goal</h3>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive min-h-[44px]"
                          onClick={() => setShowCancelConfirm(true)}
                          aria-label="Cancel your active goal"
                        >
                          Cancel Goal
                        </Button>
                      </div>
                      <ActiveGoalProgress
                        goal={activeGoal}
                        stats={activeGoalStats}
                        isMobile={isMobile}
                      />
                      <div className="rounded-lg bg-amber-50 border border-amber-200 p-3" role="alert">
                        <div className="flex items-start gap-2">
                          <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" aria-hidden="true" />
                          <p className="text-sm text-amber-800">
                            You can only have one active goal at a time. Cancel your current goal to create a new one.
                          </p>
                        </div>
                      </div>
                    </>
                  )}

                  {/* Goal Creation (only if no active goal) */}
                  {canCreateNewGoal && (
                    <>
                      <h3 className="font-semibold">Set a New Goal</h3>

                      {/* Preset Selection */}
                      <div className="space-y-2" role="radiogroup" aria-label="Goal type selection">
                        {GOAL_PRESETS.map((preset) => (
                          <GoalPresetCard
                            key={preset.id}
                            preset={preset}
                            isSelected={selectedPresetId === preset.id}
                            onSelect={() => setSelectedPresetId(preset.id)}
                          />
                        ))}
                      </div>

                      {/* Custom Weekly Target (for custom goal) */}
                      {selectedPresetId === 'custom' && (
                        <div className="space-y-2">
                          <Label htmlFor="weekly-target">Meetings per week (1-14)</Label>
                          <Input
                            id="weekly-target"
                            type="number"
                            inputMode="numeric"
                            min={1}
                            max={14}
                            value={customWeeklyTarget}
                            onChange={(e) =>
                              setCustomWeeklyTarget(
                                Math.min(14, Math.max(1, parseInt(e.target.value) || 1))
                              )
                            }
                          />
                        </div>
                      )}

                      {/* Duration Selection (for weekly/custom goals) */}
                      {selectedPreset &&
                        selectedPreset.id !== 'ninety-in-ninety' &&
                        selectedPresetId !== null && (
                          <div className="space-y-2">
                            <Label>Duration</Label>
                            <Select
                              value={selectedDuration === null ? 'indefinite' : String(selectedDuration)}
                              onValueChange={(v) =>
                                setSelectedDuration(v === 'indefinite' ? null : (parseInt(v) as GoalDurationWeeks))
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select duration" />
                              </SelectTrigger>
                              <SelectContent>
                                {DURATION_OPTIONS.map((opt) => (
                                  <SelectItem
                                    key={opt.value === null ? 'indefinite' : opt.value}
                                    value={opt.value === null ? 'indefinite' : String(opt.value)}
                                  >
                                    {opt.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        )}

                      {/* Create Goal Button */}
                      {selectedPresetId && (
                        <Button
                          className="w-full mt-4"
                          onClick={handleCreateGoal}
                          disabled={isCreatingGoal}
                        >
                          {isCreatingGoal && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                          Start Goal
                        </Button>
                      )}
                    </>
                  )}

                  {/* Goal History */}
                  {allGoals.filter((g) => g.status !== 'active').length > 0 && (
                    <>
                      <Separator className="my-4" />
                      <h3 className="font-semibold">Past Goals</h3>
                      <div className="space-y-2">
                        {allGoals
                          .filter((g) => g.status !== 'active')
                          .map((goal) => {
                            const preset = GOAL_PRESETS.find((p) => p.id === goal.presetId)
                            return (
                              <div
                                key={goal.id}
                                className={cn(
                                  'p-3 rounded-lg border',
                                  goal.status === 'completed' && 'bg-green-50 border-green-200',
                                  goal.status === 'cancelled' && 'bg-gray-50 border-gray-200',
                                  goal.status === 'expired' && 'bg-orange-50 border-orange-200'
                                )}
                              >
                                <div className="flex items-center justify-between">
                                  <span className="font-medium text-sm">
                                    {preset?.name || 'Custom Goal'}
                                  </span>
                                  <Badge
                                    variant="secondary"
                                    className={cn(
                                      'text-xs',
                                      goal.status === 'completed' && 'bg-green-100 text-green-700',
                                      goal.status === 'cancelled' && 'bg-gray-100 text-gray-700',
                                      goal.status === 'expired' && 'bg-orange-100 text-orange-700'
                                    )}
                                  >
                                    {goal.status}
                                  </Badge>
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {goal.currentCount} meetings attended
                                </p>
                              </div>
                            )
                          })}
                      </div>
                    </>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>

            {/* MILESTONES TAB */}
            <TabsContent value="milestones" className="flex-1 m-0 overflow-hidden">
              <ScrollArea className="h-full">
                <div className="p-4 space-y-4">
                  {/* Next Milestone */}
                  {nextMilestone && (
                    <Card className="border-primary/50 bg-primary/5">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <TrendingUp className="h-4 w-4 text-primary" />
                          Next Milestone
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-lg font-bold">{nextMilestone.label}</p>
                        <p className="text-sm text-muted-foreground">
                          {nextMilestone.count - stats.attended} more meetings to go
                        </p>
                        <Progress
                          value={(stats.attended / nextMilestone.count) * 100}
                          className="h-2 mt-2"
                        />
                      </CardContent>
                    </Card>
                  )}

                  {/* Achieved Milestones */}
                  <h3 className="font-semibold">Achievements</h3>
                  <div className="grid gap-3">
                    {MEETING_MILESTONES.map((milestone, index) => {
                      const isAchieved = stats.attended >= milestone.count
                      const milestoneColor = MILESTONE_COLORS[index] || milestone.defaultColor
                      return (
                        <div
                          key={milestone.count}
                          className={cn(
                            'flex items-center gap-3 p-3 rounded-lg border',
                            isAchieved
                              ? 'bg-gradient-to-r from-primary/10 to-transparent border-primary/30'
                              : 'bg-gray-50 border-gray-200 opacity-60'
                          )}
                        >
                          <div
                            className={cn(
                              'h-10 w-10 rounded-full flex items-center justify-center',
                              isAchieved ? 'bg-primary/20' : 'bg-gray-200'
                            )}
                          >
                            {isAchieved ? (
                              <Trophy
                                className="h-5 w-5"
                                style={{ color: milestoneColor }}
                              />
                            ) : (
                              <Trophy className="h-5 w-5 text-gray-400" />
                            )}
                          </div>
                          <div className="flex-1">
                            <p className={cn('font-medium text-sm', !isAchieved && 'text-gray-500')}>
                              {milestone.label}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {milestone.count} meetings
                            </p>
                          </div>
                          {isAchieved && (
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>
      </ResponsiveModal>

      {/* Log Meeting Modal */}
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

      {/* Cancel Goal Confirmation */}
      <AlertDialog open={showCancelConfirm} onOpenChange={setShowCancelConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Goal?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel your current goal? Your progress will be saved in your history, but you won't be able to continue this goal.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Goal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelGoal}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Cancel Goal
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

export default RecoveryMeetingsModal
