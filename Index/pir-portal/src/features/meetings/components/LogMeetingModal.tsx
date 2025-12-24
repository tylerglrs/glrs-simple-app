import { useState, useCallback } from 'react'
import { CalendarPlus, CheckCircle, Loader2, MapPin, ClipboardList } from 'lucide-react'
import { ResponsiveModal } from '@/components/ui/responsive-modal'
import { Illustration } from '@/components/common/Illustration'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { DAYS_OF_WEEK } from '../types'

// ============================================================
// TYPES
// ============================================================

// Extended meeting types to support all recovery programs
// Using ABBREVIATED codes to match cloud functions, Life Tab, and external meetings
export type MeetingTypeOption =
  | 'AA'
  | 'NA'
  | 'CMA'
  | 'MA'
  | 'HA'
  | 'RD'      // Recovery Dharma
  | 'SMART'   // SMART Recovery
  | 'LR'      // LifeRing
  | 'GLRS'    // GLRS Manual
  | 'Other'

// Legacy type names for backward compatibility (DO NOT USE for new code)
// These are kept in MeetingSource type for reading old data
export type LegacyMeetingType = 'RecoveryDharma' | 'LifeRing' | 'SmartRecovery'

export interface LogMeetingModalProps {
  isOpen: boolean
  onClose: () => void
  onLogFuture: (details: LogMeetingDetails, scheduledDate: Date) => Promise<void>
  onLogPast: (details: LogMeetingDetails, attendedDate: Date) => Promise<void>
  isLoading?: boolean
  /** Default meeting type to select */
  defaultType?: MeetingTypeOption
  /** Program name for display (e.g., "Recovery Dharma") */
  programName?: string
  /** Hide the type selector (use defaultType exclusively) */
  hideTypeSelector?: boolean
}

export interface LogMeetingDetails {
  name: string
  day: number
  time: string
  location?: string
  type: MeetingTypeOption
}

type TabValue = 'schedule' | 'attended'

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function getNextDateForDay(dayOfWeek: number): Date {
  const today = new Date()
  const currentDay = today.getDay()
  let daysUntil = dayOfWeek - currentDay
  if (daysUntil <= 0) daysUntil += 7 // Next week
  const nextDate = new Date(today)
  nextDate.setDate(today.getDate() + daysUntil)
  return nextDate
}

function formatDateForInput(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function getTodayDateString(): string {
  return formatDateForInput(new Date())
}

function getYesterdayDateString(): string {
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  return formatDateForInput(yesterday)
}

// ============================================================
// COMPONENT
// ============================================================

// Meeting type display labels (using abbreviated codes as keys)
const MEETING_TYPE_LABELS: Record<MeetingTypeOption, string> = {
  AA: 'AA Meeting',
  NA: 'NA Meeting',
  CMA: 'CMA Meeting',
  MA: 'MA Meeting',
  HA: 'HA Meeting',
  RD: 'Recovery Dharma Meeting',
  SMART: 'SMART Recovery Meeting',
  LR: 'LifeRing Meeting',
  GLRS: 'GLRS Meeting',
  Other: 'Other Recovery Meeting',
}

export function LogMeetingModal({
  isOpen,
  onClose,
  onLogFuture,
  onLogPast,
  isLoading = false,
  defaultType = 'AA',
  programName,
  hideTypeSelector = false,
}: LogMeetingModalProps) {

  // Tab state
  const [activeTab, setActiveTab] = useState<TabValue>('schedule')

  // Form state
  const [name, setName] = useState('')
  const [day, setDay] = useState<number>(new Date().getDay())
  const [time, setTime] = useState('19:00')
  const [location, setLocation] = useState('')
  const [meetingType, setMeetingType] = useState<MeetingTypeOption>(defaultType)

  // Date state
  const [scheduledDate, setScheduledDate] = useState(getTodayDateString())
  const [attendedDate, setAttendedDate] = useState(getYesterdayDateString())

  // Validation
  const isFormValid = name.trim().length > 0 && time.length > 0

  // Reset form
  const resetForm = useCallback(() => {
    setName('')
    setDay(new Date().getDay())
    setTime('19:00')
    setLocation('')
    setMeetingType(defaultType)
    setScheduledDate(getTodayDateString())
    setAttendedDate(getYesterdayDateString())
    setActiveTab('schedule')
  }, [defaultType])

  // Handle close
  const handleClose = useCallback(() => {
    if (isLoading) return
    resetForm()
    onClose()
  }, [isLoading, resetForm, onClose])

  // Handle submit
  const handleSubmit = useCallback(async () => {
    if (!isFormValid) return

    const details: LogMeetingDetails = {
      name: name.trim(),
      day,
      time,
      location: location.trim() || undefined,
      type: meetingType,
    }

    if (activeTab === 'schedule') {
      // Parse scheduled date and set time
      const [year, month, dayOfMonth] = scheduledDate.split('-').map(Number)
      const [hours, minutes] = time.split(':').map(Number)
      const date = new Date(year, month - 1, dayOfMonth, hours, minutes)
      await onLogFuture(details, date)
    } else {
      // Parse attended date and set time
      const [year, month, dayOfMonth] = attendedDate.split('-').map(Number)
      const [hours, minutes] = time.split(':').map(Number)
      const date = new Date(year, month - 1, dayOfMonth, hours, minutes)
      await onLogPast(details, date)
    }

    handleClose()
  }, [
    isFormValid,
    name,
    day,
    time,
    location,
    meetingType,
    activeTab,
    scheduledDate,
    attendedDate,
    onLogFuture,
    onLogPast,
    handleClose,
  ])

  // Update day when scheduled date changes
  const handleScheduledDateChange = useCallback((dateString: string) => {
    setScheduledDate(dateString)
    const [year, month, dayOfMonth] = dateString.split('-').map(Number)
    const date = new Date(year, month - 1, dayOfMonth)
    setDay(date.getDay())
  }, [])

  // Update day when attended date changes
  const handleAttendedDateChange = useCallback((dateString: string) => {
    setAttendedDate(dateString)
    const [year, month, dayOfMonth] = dateString.split('-').map(Number)
    const date = new Date(year, month - 1, dayOfMonth)
    setDay(date.getDay())
  }, [])

  return (
    <ResponsiveModal open={isOpen} onOpenChange={handleClose} desktopSize="md">
      <div className="flex flex-col h-full bg-white overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-teal-600 to-cyan-600 shrink-0 relative overflow-hidden">
          <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-20 pointer-events-none">
            <Illustration name="calendar" size="sm" />
          </div>
          <div className="relative z-10">
            <h2 className="text-xl font-bold text-white flex items-center gap-3">
              <ClipboardList className="h-6 w-6" />
              Log a Meeting
            </h2>
            <p className="text-teal-100 text-sm mt-1">
              Add a meeting to your schedule or log one you've already attended
            </p>
          </div>
        </div>

        {/* Tabs - sticky below header */}
        <div className="border-b bg-white shrink-0">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabValue)} className="w-full">
            <TabsList className="grid w-full grid-cols-2 h-12 rounded-none bg-transparent p-0">
              <TabsTrigger
                value="schedule"
                className={cn(
                  'h-full rounded-none border-b-2 data-[state=active]:border-teal-600 data-[state=active]:bg-transparent',
                  'data-[state=inactive]:border-transparent gap-2 min-h-[44px]'
                )}
                aria-label="Schedule a future meeting"
              >
                <CalendarPlus className="h-4 w-4" aria-hidden="true" />
                Schedule
              </TabsTrigger>
              <TabsTrigger
                value="attended"
                className={cn(
                  'h-full rounded-none border-b-2 data-[state=active]:border-teal-600 data-[state=active]:bg-transparent',
                  'data-[state=inactive]:border-transparent gap-2 min-h-[44px]'
                )}
                aria-label="Log a meeting you already attended"
              >
                <CheckCircle className="h-4 w-4" aria-hidden="true" />
                Log Attended
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Content */}
        <ScrollArea className="flex-1">
          <Tabs value={activeTab} className="w-full">
            {/* SCHEDULE TAB */}
            <TabsContent value="schedule" className="p-6 space-y-4 m-0">
              <p className="text-sm text-muted-foreground">
                Add a meeting to your upcoming schedule
              </p>

              {/* Meeting Name */}
              <div className="space-y-2">
                <Label htmlFor="name-schedule">Meeting Name *</Label>
                <Input
                  id="name-schedule"
                  placeholder="e.g., Monday Night Big Book"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isLoading}
                />
              </div>

              {/* Meeting Type */}
              {!hideTypeSelector ? (
                <div className="space-y-2">
                  <Label htmlFor="type-schedule">Meeting Type</Label>
                  <Select
                    value={meetingType}
                    onValueChange={(v) => setMeetingType(v as MeetingTypeOption)}
                    disabled={isLoading}
                  >
                    <SelectTrigger id="type-schedule">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(MEETING_TYPE_LABELS).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ) : (
                <div className="rounded-lg bg-muted/50 px-3 py-2 text-sm text-muted-foreground">
                  Meeting type: <span className="font-medium text-foreground">{programName || MEETING_TYPE_LABELS[meetingType]}</span>
                </div>
              )}

              {/* Date & Time Row */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="date-schedule">Date *</Label>
                  <Input
                    id="date-schedule"
                    type="date"
                    value={scheduledDate}
                    onChange={(e) => handleScheduledDateChange(e.target.value)}
                    min={getTodayDateString()}
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="time-schedule">Time *</Label>
                  <Input
                    id="time-schedule"
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Location */}
              <div className="space-y-2">
                <Label htmlFor="location-schedule">Location (optional)</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
                  <Input
                    id="location-schedule"
                    placeholder="e.g., St. Mary's Church"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    disabled={isLoading}
                    className="pl-9 min-h-[44px]"
                    aria-describedby="location-schedule-hint"
                  />
                  <span id="location-schedule-hint" className="sr-only">
                    Optional location for the meeting
                  </span>
                </div>
              </div>
            </TabsContent>

            {/* LOG ATTENDED TAB */}
            <TabsContent value="attended" className="p-6 space-y-4 m-0">
              <p className="text-sm text-muted-foreground">
                Log a meeting you've already attended to get credit
              </p>

              {/* Meeting Name */}
              <div className="space-y-2">
                <Label htmlFor="name-attended">Meeting Name *</Label>
                <Input
                  id="name-attended"
                  placeholder="e.g., Monday Night Big Book"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isLoading}
                />
              </div>

              {/* Meeting Type */}
              {!hideTypeSelector ? (
                <div className="space-y-2">
                  <Label htmlFor="type-attended">Meeting Type</Label>
                  <Select
                    value={meetingType}
                    onValueChange={(v) => setMeetingType(v as MeetingTypeOption)}
                    disabled={isLoading}
                  >
                    <SelectTrigger id="type-attended">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(MEETING_TYPE_LABELS).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ) : (
                <div className="rounded-lg bg-muted/50 px-3 py-2 text-sm text-muted-foreground">
                  Meeting type: <span className="font-medium text-foreground">{programName || MEETING_TYPE_LABELS[meetingType]}</span>
                </div>
              )}

              {/* Date & Time Row */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="date-attended">Date Attended *</Label>
                  <Input
                    id="date-attended"
                    type="date"
                    value={attendedDate}
                    onChange={(e) => handleAttendedDateChange(e.target.value)}
                    max={getTodayDateString()}
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="time-attended">Time</Label>
                  <Input
                    id="time-attended"
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Location */}
              <div className="space-y-2">
                <Label htmlFor="location-attended">Location (optional)</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
                  <Input
                    id="location-attended"
                    placeholder="e.g., St. Mary's Church"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    disabled={isLoading}
                    className="pl-9 min-h-[44px]"
                    aria-describedby="location-attended-hint"
                  />
                  <span id="location-attended-hint" className="sr-only">
                    Optional location for the attended meeting
                  </span>
                </div>
              </div>

              {/* Info box */}
              <div className="rounded-lg bg-green-50 border border-green-200 p-3">
                <p className="text-sm text-green-800">
                  This meeting will be added to your history as attended, giving you credit for your recovery journey.
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </ScrollArea>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t bg-muted/30 shrink-0">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isLoading || !isFormValid}
            className="gap-2 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700"
            aria-label={activeTab === 'schedule' ? 'Add meeting to schedule' : 'Log meeting as attended'}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin motion-reduce:animate-none" aria-hidden="true" />
                {activeTab === 'schedule' ? 'Adding...' : 'Logging...'}
              </>
            ) : (
              <>
                {activeTab === 'schedule' ? (
                  <>
                    <CalendarPlus className="h-4 w-4" aria-hidden="true" />
                    Add to Schedule
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4" aria-hidden="true" />
                    Log as Attended
                  </>
                )}
              </>
            )}
          </Button>
        </div>
      </div>
    </ResponsiveModal>
  )
}

export default LogMeetingModal
