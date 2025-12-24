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
  Brain,
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
import { useToast } from '@/hooks/use-toast'
import { useUserMeetings, useMeetingGoals, GOAL_PRESETS, DURATION_OPTIONS, type GoalDurationWeeks } from '@/features/meetings/hooks'
import { LogMeetingModal, type LogMeetingDetails } from '@/features/meetings/components/LogMeetingModal'
import type { ScheduledMeeting } from '@/features/meetings/types'
import { toMeetingCardData } from '@/features/meetings/utils/toMeetingCardData'
import { DAYS_OF_WEEK } from '@/features/meetings/types'
import { MEETING_MILESTONES, PROGRAM_MILESTONE_COLORS } from '@/features/journey/types/recovery'

// =============================================================================
// CONSTANTS
// =============================================================================

// Use abbreviated code to match cloud functions, Life Tab, and external meetings
const PROGRAM_TYPE = 'SMART'
// Legacy type name for backward compatibility with old manually logged meetings
const LEGACY_TYPE = 'SmartRecovery'
// Get program-specific milestone colors for SMART Recovery (amber/orange palette)
const MILESTONE_COLORS = PROGRAM_MILESTONE_COLORS['smart-recovery']
const PROGRAM_TITLE = 'SMART Recovery Meetings'
const PROGRAM_DESCRIPTION = 'Track your SMART Recovery meeting attendance and set goals'
const PROGRAM_COLOR = '#f59e0b' // Amber - science/CBT theme

// =============================================================================
// TYPES
// =============================================================================

export interface SmartRecoveryMeetingsModalProps {
  isOpen: boolean
  onClose: () => void
}

type TabValue = 'logged' | 'goals' | 'milestones'

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
// MEETING CARD COMPONENT
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
  const isAttended = meeting.attended
  const isPast = meeting.scheduledTime && meeting.scheduledTime.toDate() < new Date()

  return (
    <div
      className={cn(
        'bg-card rounded-lg border p-2.5 md:p-3 transition-all',
        isAttended && 'border-amber-200 bg-amber-50/30',
        !isAttended && isPast && 'border-orange-200 bg-orange-50/30'
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-sm truncate">
            {cardData.name}
          </h4>
          <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            <span>{formatMeetingDate(meeting)}</span>
            <Clock className="h-3 w-3 ml-1" />
            <span>{cardData.timeDisplay}</span>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <Badge
            variant="secondary"
            className="text-xs shrink-0 bg-amber-100 text-amber-700"
          >
            <Brain className="h-3 w-3 mr-1" />
            SMART
          </Badge>
          {isAttended && (
            <Badge className="bg-amber-100 text-amber-700 text-xs">Attended</Badge>
          )}
          {!isAttended && isPast && (
            <Badge variant="outline" className="bg-orange-100 text-orange-700 border-orange-200 text-xs">
              Missed
            </Badge>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 mt-2">
        {isAttended && onMarkNotAttended && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onMarkNotAttended(meeting.id)}
            disabled={isLoading}
            className="text-xs h-7 text-muted-foreground hover:text-orange-600"
          >
            {isLoading && <Loader2 className="h-3 w-3 animate-spin mr-1" />}
            Didn't attend?
          </Button>
        )}
        {!isAttended && isPast && onMarkAttended && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onMarkAttended(meeting.id)}
            disabled={isLoading}
            className="text-xs h-7 border-amber-300 text-amber-700 hover:bg-amber-50"
          >
            {isLoading && <Loader2 className="h-3 w-3 animate-spin mr-1" />}
            I Attended
          </Button>
        )}
      </div>
    </div>
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
        'w-full p-3 rounded-lg border-2 text-left transition-all',
        isSelected
          ? 'border-amber-500 bg-amber-50'
          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50',
        disabled && 'opacity-50 cursor-not-allowed'
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className="h-10 w-10 rounded-full flex items-center justify-center shrink-0"
          style={{ backgroundColor: `${PROGRAM_COLOR}20` }}
        >
          <Icon className="h-5 w-5" style={{ color: PROGRAM_COLOR }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm">{preset.name}</p>
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
            {preset.description}
          </p>
        </div>
        {isSelected && (
          <CheckCircle className="h-5 w-5 text-amber-500 shrink-0" />
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
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 bg-amber-50/50 rounded-lg p-3">
      <div className="text-center">
        <p className="text-2xl font-bold text-amber-600">{totalMeetings}</p>
        <p className="text-xs text-muted-foreground">Total</p>
      </div>
      <div className="text-center">
        <p className="text-2xl font-bold text-amber-600">{attendedCount}</p>
        <p className="text-xs text-muted-foreground">Attended</p>
      </div>
      <div className="text-center">
        <p className="text-2xl font-bold text-orange-600">{missedCount}</p>
        <p className="text-xs text-muted-foreground">Missed</p>
      </div>
      <div className="text-center">
        <p className="text-2xl font-bold text-amber-700">{attendanceRate}%</p>
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
    <Card className="border-amber-500/50 bg-amber-50/50">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <div
            className="h-8 w-8 rounded-full flex items-center justify-center"
            style={{ backgroundColor: `${PROGRAM_COLOR}20` }}
          >
            <Icon className="h-4 w-4" style={{ color: PROGRAM_COLOR }} />
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
            <Badge className="bg-amber-100 text-amber-700">On Track</Badge>
          ) : (
            <Badge className="bg-orange-100 text-orange-700">Catching Up</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2">
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span>Overall Progress</span>
              <span>{stats.totalMeetings} / {stats.totalTarget || 'ongoing'}</span>
            </div>
            <Progress value={stats.overallProgress} className="h-2 bg-amber-100" />
          </div>
          {goal.weeklyTarget && (
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span>This Week</span>
                <span>{stats.currentWeekMeetings} / {stats.currentWeekTarget}</span>
              </div>
              <Progress value={stats.currentWeekProgress} className="h-2 bg-amber-100" />
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

export function SmartRecoveryMeetingsModal({ isOpen, onClose }: SmartRecoveryMeetingsModalProps) {
  const { toast } = useToast()
  const isMobile = useMediaQuery('(max-width: 768px)')

  const [activeTab, setActiveTab] = useState<TabValue>('logged')
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>(null)
  const [customWeeklyTarget, setCustomWeeklyTarget] = useState(3)
  const [selectedDuration, setSelectedDuration] = useState<GoalDurationWeeks>(4)
  const [isCreatingGoal, setIsCreatingGoal] = useState(false)
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)
  const [showLogMeetingModal, setShowLogMeetingModal] = useState(false)
  const [isLogging, setIsLogging] = useState(false)
  const [attendanceLoading, setAttendanceLoading] = useState<Record<string, boolean>>({})

  const {
    meetings: allMeetings,
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

  // Filter meetings by program type (handle both new abbreviated and legacy full names)
  const scheduledMeetings = useMemo(() => {
    return allMeetings.filter(
      (m) =>
        m.type === PROGRAM_TYPE ||
        m.type === LEGACY_TYPE ||
        m.source === PROGRAM_TYPE ||
        m.source === LEGACY_TYPE
    )
  }, [allMeetings])

  const sortedMeetings = useMemo(() => {
    return [...scheduledMeetings].sort((a, b) => {
      const dateA = a.scheduledTime?.toDate() || new Date()
      const dateB = b.scheduledTime?.toDate() || new Date()
      return dateB.getTime() - dateA.getTime()
    })
  }, [scheduledMeetings])

  const stats = useMemo(() => {
    const total = scheduledMeetings.length
    const attended = scheduledMeetings.filter((m) => m.attended).length
    const past = scheduledMeetings.filter(
      (m) => m.scheduledTime && m.scheduledTime.toDate() < new Date()
    ).length
    const missed = past - attended
    return { total, attended, missed }
  }, [scheduledMeetings])

  const nextMilestone = useMemo(() => {
    return MEETING_MILESTONES.find((m) => stats.attended < m.count)
  }, [stats.attended])

  const selectedPreset = useMemo(() => {
    return GOAL_PRESETS.find((p) => p.id === selectedPresetId)
  }, [selectedPresetId])

  const handleMarkAttended = useCallback(
    async (meetingId: string) => {
      setAttendanceLoading((prev) => ({ ...prev, [meetingId]: true }))
      try {
        const success = await markAttended(meetingId)
        if (success) {
          toast({
            title: 'Attendance recorded',
            description: 'Great job attending your SMART Recovery meeting!',
          })
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

  const handleMarkNotAttended = useCallback(
    async (meetingId: string) => {
      setAttendanceLoading((prev) => ({ ...prev, [meetingId]: true }))
      try {
        const success = await markNotAttended(meetingId)
        if (success) {
          toast({ title: 'Attendance updated', description: 'Meeting marked as not attended.' })
        }
      } finally {
        setAttendanceLoading((prev) => ({ ...prev, [meetingId]: false }))
      }
    },
    [markNotAttended, toast]
  )

  const handleLogMeeting = useCallback(
    async (details: LogMeetingDetails, date: Date, isAttended: boolean) => {
      setIsLogging(true)
      try {
        const smartDetails: LogMeetingDetails = {
          ...details,
          type: PROGRAM_TYPE as LogMeetingDetails['type'],
        }
        const meetingId = await logManualMeeting(smartDetails, date, isAttended)
        if (meetingId) {
          toast({
            title: isAttended ? 'Meeting logged' : 'Meeting scheduled',
            description: `${details.name} has been added to your SMART Recovery meetings.`,
          })
          setShowLogMeetingModal(false)
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

  const handleCreateGoal = useCallback(async () => {
    if (!selectedPreset) return
    setIsCreatingGoal(true)
    try {
      const weeklyTarget = selectedPreset.id === 'custom' ? customWeeklyTarget : selectedPreset.weeklyTarget
      const duration = selectedPreset.id === 'ninety-in-ninety' ? 12 : selectedDuration
      const goalId = await createGoal(selectedPreset.goalType, weeklyTarget, duration, selectedPreset.id)
      if (goalId) {
        toast({ title: 'Goal created!', description: `Your ${selectedPreset.name} goal has started.` })
        setSelectedPresetId(null)
        setSelectedDuration(4)
        setCustomWeeklyTarget(3)
      }
    } finally {
      setIsCreatingGoal(false)
    }
  }, [selectedPreset, customWeeklyTarget, selectedDuration, createGoal, toast])

  const handleCancelGoal = useCallback(async () => {
    if (!activeGoal?.id) return
    try {
      const success = await cancelGoal(activeGoal.id)
      if (success) {
        toast({ title: 'Goal cancelled', description: 'You can start a new goal anytime.' })
        setShowCancelConfirm(false)
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to cancel goal. Please try again.', variant: 'destructive' })
    }
  }, [activeGoal, cancelGoal, toast])

  useEffect(() => {
    if (!isOpen) {
      setSelectedPresetId(null)
      setSelectedDuration(4)
      setCustomWeeklyTarget(3)
    }
  }, [isOpen])

  const loading = meetingsLoading || goalsLoading

  return (
    <>
      <ResponsiveModal
        open={isOpen}
        onOpenChange={(open) => !open && onClose()}
        desktopSize="lg"
      >
        <div className="flex flex-col h-full bg-white">
          <div className="px-4 py-3 border-b shrink-0 bg-gradient-to-r from-amber-50 to-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center">
                  <Brain className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-amber-900">{PROGRAM_TITLE}</h2>
                  <p className="text-sm text-amber-700">
                    {PROGRAM_DESCRIPTION}
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>

          <div className="px-4 py-3 border-b shrink-0">
            <StatsBar
              totalMeetings={stats.total}
              attendedCount={stats.attended}
              missedCount={stats.missed}
              isMobile={isMobile}
            />
          </div>

          <Tabs
            value={activeTab}
            onValueChange={(v) => setActiveTab(v as TabValue)}
            className="flex-1 flex flex-col min-h-0"
          >
            <TabsList className="mx-4 mt-2 grid grid-cols-3 shrink-0">
              <TabsTrigger value="logged" className="gap-1.5 data-[state=active]:bg-amber-100 data-[state=active]:text-amber-700">
                <Calendar className="h-4 w-4" />
                {!isMobile && 'Logged'}
              </TabsTrigger>
              <TabsTrigger value="goals" className="gap-1.5 data-[state=active]:bg-amber-100 data-[state=active]:text-amber-700">
                <Target className="h-4 w-4" />
                {!isMobile && 'Goals'}
              </TabsTrigger>
              <TabsTrigger value="milestones" className="gap-1.5 data-[state=active]:bg-amber-100 data-[state=active]:text-amber-700">
                <Award className="h-4 w-4" />
                {!isMobile && 'Milestones'}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="logged" className="flex-1 m-0 overflow-hidden">
              <ScrollArea className="h-full">
                <div className="p-4 space-y-3">
                  <Button
                    onClick={() => setShowLogMeetingModal(true)}
                    className="w-full gap-2 bg-amber-600 hover:bg-amber-700"
                    disabled={loading}
                  >
                    <PlusCircle className="h-4 w-4" />
                    Log a SMART Recovery Meeting
                  </Button>
                  {activeGoal && activeGoalStats && (
                    <ActiveGoalProgress goal={activeGoal} stats={activeGoalStats} isMobile={isMobile} />
                  )}
                  <Separator />
                  {loading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-amber-500" />
                    </div>
                  ) : sortedMeetings.length === 0 ? (
                    <div className="text-center py-8">
                      <Brain className="h-12 w-12 mx-auto text-amber-300 mb-3" />
                      <p className="text-muted-foreground">No SMART Recovery meetings logged yet</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Use the button above to log your first meeting
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

            <TabsContent value="goals" className="flex-1 m-0 overflow-hidden">
              <ScrollArea className="h-full">
                <div className="p-4 space-y-4">
                  {hasActiveGoal && activeGoal && activeGoalStats && (
                    <>
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-amber-900">Your Active Goal</h3>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => setShowCancelConfirm(true)}
                        >
                          Cancel Goal
                        </Button>
                      </div>
                      <ActiveGoalProgress goal={activeGoal} stats={activeGoalStats} isMobile={isMobile} />
                      <div className="rounded-lg bg-amber-50 border border-amber-200 p-3">
                        <div className="flex items-start gap-2">
                          <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
                          <p className="text-sm text-amber-800">
                            You can only have one active goal at a time.
                          </p>
                        </div>
                      </div>
                    </>
                  )}
                  {canCreateNewGoal && (
                    <>
                      <h3 className="font-semibold text-amber-900">Set a New Goal</h3>
                      <div className="space-y-2">
                        {GOAL_PRESETS.map((preset) => (
                          <GoalPresetCard
                            key={preset.id}
                            preset={preset}
                            isSelected={selectedPresetId === preset.id}
                            onSelect={() => setSelectedPresetId(preset.id)}
                          />
                        ))}
                      </div>
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
                            onChange={(e) => setCustomWeeklyTarget(Math.min(14, Math.max(1, parseInt(e.target.value) || 1)))}
                          />
                        </div>
                      )}
                      {selectedPreset && selectedPreset.id !== 'ninety-in-ninety' && selectedPresetId !== null && (
                        <div className="space-y-2">
                          <Label>Duration</Label>
                          <Select
                            value={selectedDuration === null ? 'indefinite' : String(selectedDuration)}
                            onValueChange={(v) => setSelectedDuration(v === 'indefinite' ? null : (parseInt(v) as GoalDurationWeeks))}
                          >
                            <SelectTrigger><SelectValue placeholder="Select duration" /></SelectTrigger>
                            <SelectContent>
                              {DURATION_OPTIONS.map((opt) => (
                                <SelectItem key={opt.value === null ? 'indefinite' : opt.value} value={opt.value === null ? 'indefinite' : String(opt.value)}>
                                  {opt.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                      {selectedPresetId && (
                        <Button className="w-full mt-4 bg-amber-600 hover:bg-amber-700" onClick={handleCreateGoal} disabled={isCreatingGoal}>
                          {isCreatingGoal && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                          Start Goal
                        </Button>
                      )}
                    </>
                  )}
                  {allGoals.filter((g) => g.status !== 'active').length > 0 && (
                    <>
                      <Separator className="my-4" />
                      <h3 className="font-semibold text-amber-900">Past Goals</h3>
                      <div className="space-y-2">
                        {allGoals.filter((g) => g.status !== 'active').map((goal) => {
                          const preset = GOAL_PRESETS.find((p) => p.id === goal.presetId)
                          return (
                            <div
                              key={goal.id}
                              className={cn(
                                'p-3 rounded-lg border',
                                goal.status === 'completed' && 'bg-amber-50 border-amber-200',
                                goal.status === 'cancelled' && 'bg-gray-50 border-gray-200',
                                goal.status === 'expired' && 'bg-orange-50 border-orange-200'
                              )}
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-medium text-sm">{preset?.name || 'Custom Goal'}</span>
                                <Badge variant="secondary" className={cn(
                                  'text-xs',
                                  goal.status === 'completed' && 'bg-amber-100 text-amber-700',
                                  goal.status === 'cancelled' && 'bg-gray-100 text-gray-700',
                                  goal.status === 'expired' && 'bg-orange-100 text-orange-700'
                                )}>
                                  {goal.status}
                                </Badge>
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">{goal.currentCount} meetings attended</p>
                            </div>
                          )
                        })}
                      </div>
                    </>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="milestones" className="flex-1 m-0 overflow-hidden">
              <ScrollArea className="h-full">
                <div className="p-4 space-y-4">
                  {nextMilestone && (
                    <Card className="border-amber-500/50 bg-amber-50/50">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <TrendingUp className="h-4 w-4 text-amber-600" />
                          Next Milestone
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-lg font-bold text-amber-900">{nextMilestone.label}</p>
                        <p className="text-sm text-muted-foreground">{nextMilestone.count - stats.attended} more meetings to go</p>
                        <Progress value={(stats.attended / nextMilestone.count) * 100} className="h-2 mt-2 bg-amber-100" />
                      </CardContent>
                    </Card>
                  )}
                  <h3 className="font-semibold text-amber-900">Achievements</h3>
                  <div className="grid gap-3">
                    {MEETING_MILESTONES.map((milestone, index) => {
                      const isAchieved = stats.attended >= milestone.count
                      const milestoneColor = MILESTONE_COLORS[index] || milestone.defaultColor
                      return (
                        <div
                          key={milestone.count}
                          className={cn(
                            'flex items-center gap-3 p-3 rounded-lg border',
                            isAchieved ? 'bg-gradient-to-r from-amber-100 to-transparent border-amber-300' : 'bg-gray-50 border-gray-200 opacity-60'
                          )}
                        >
                          <div className={cn('h-10 w-10 rounded-full flex items-center justify-center', isAchieved ? 'bg-amber-200' : 'bg-gray-200')}>
                            {isAchieved ? <Trophy className="h-5 w-5" style={{ color: milestoneColor }} /> : <Trophy className="h-5 w-5 text-gray-400" />}
                          </div>
                          <div className="flex-1">
                            <p className={cn('font-medium text-sm', !isAchieved && 'text-gray-500')}>{milestone.label}</p>
                            <p className="text-xs text-muted-foreground">{milestone.count} meetings</p>
                          </div>
                          {isAchieved && <CheckCircle className="h-5 w-5 text-amber-600" />}
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

      <LogMeetingModal
        isOpen={showLogMeetingModal}
        onClose={() => setShowLogMeetingModal(false)}
        onLogFuture={async (details, date) => { await handleLogMeeting(details, date, false) }}
        onLogPast={async (details, date) => { await handleLogMeeting(details, date, true) }}
        isLoading={isLogging}
        defaultType="SMART"
        programName="SMART Recovery"
        hideTypeSelector={true}
      />

      <AlertDialog open={showCancelConfirm} onOpenChange={setShowCancelConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Goal?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel your current goal? Your progress will be saved in your history.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Goal</AlertDialogCancel>
            <AlertDialogAction onClick={handleCancelGoal} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Cancel Goal
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

export default SmartRecoveryMeetingsModal
