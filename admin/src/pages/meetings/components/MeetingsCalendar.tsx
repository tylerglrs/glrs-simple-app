import { useState, useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  CalendarDays,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Timestamp } from "firebase/firestore"

export type MeetingType = "glrs" | "aa" | "na" | "all"
export type CalendarView = "week" | "month"

export interface CalendarMeeting {
  id: string
  title: string
  date: Timestamp | Date
  time: string
  type: MeetingType
  isVirtual?: boolean
  location?: string
  source?: string
}

interface MeetingsCalendarProps {
  meetings: CalendarMeeting[]
  view: CalendarView
  onViewChange: (view: CalendarView) => void
  typeFilter: MeetingType
  onTypeFilterChange: (type: MeetingType) => void
  onDayClick: (date: Date, meetings: CalendarMeeting[]) => void
  onMeetingClick: (meeting: CalendarMeeting) => void
}

const TYPE_COLORS = {
  glrs: { bg: "bg-[#069494]", text: "text-white", dot: "bg-[#069494]" },
  aa: { bg: "bg-blue-500", text: "text-white", dot: "bg-blue-500" },
  na: { bg: "bg-green-500", text: "text-white", dot: "bg-green-500" },
  all: { bg: "bg-gray-500", text: "text-white", dot: "bg-gray-500" },
}

const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
]

function getMeetingDate(meeting: CalendarMeeting): Date {
  if (meeting.date instanceof Date) return meeting.date
  return meeting.date.toDate()
}

function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  )
}

function getMeetingType(meeting: CalendarMeeting): MeetingType {
  if (meeting.type === "glrs") return "glrs"
  if (meeting.source?.toLowerCase().includes("aa") || meeting.type === "aa") return "aa"
  if (meeting.source?.toLowerCase().includes("na") || meeting.type === "na") return "na"
  return "aa" // Default external meetings to AA
}

export function MeetingsCalendar({
  meetings,
  view,
  onViewChange,
  typeFilter,
  onTypeFilterChange,
  onDayClick,
  onMeetingClick,
}: MeetingsCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const today = new Date()

  // Filter meetings by type
  const filteredMeetings = useMemo(() => {
    if (typeFilter === "all") return meetings
    return meetings.filter((m) => getMeetingType(m) === typeFilter)
  }, [meetings, typeFilter])

  // Get meetings for a specific day
  const getMeetingsForDay = (date: Date): CalendarMeeting[] => {
    return filteredMeetings.filter((m) => isSameDay(getMeetingDate(m), date))
  }

  // Get 7-day range
  const weekDays = useMemo(() => {
    const days: Date[] = []
    const start = new Date(currentDate)
    start.setHours(0, 0, 0, 0)

    for (let i = 0; i < 7; i++) {
      const day = new Date(start)
      day.setDate(start.getDate() + i)
      days.push(day)
    }
    return days
  }, [currentDate])

  // Get month grid
  const monthGrid = useMemo(() => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)

    const days: (Date | null)[] = []

    // Add empty cells for days before first of month
    for (let i = 0; i < firstDay.getDay(); i++) {
      days.push(null)
    }

    // Add all days of month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i))
    }

    return days
  }, [currentDate])

  // Navigation
  const navigatePrev = () => {
    const newDate = new Date(currentDate)
    if (view === "week") {
      newDate.setDate(newDate.getDate() - 7)
    } else {
      newDate.setMonth(newDate.getMonth() - 1)
    }
    setCurrentDate(newDate)
  }

  const navigateNext = () => {
    const newDate = new Date(currentDate)
    if (view === "week") {
      newDate.setDate(newDate.getDate() + 7)
    } else {
      newDate.setMonth(newDate.getMonth() + 1)
    }
    setCurrentDate(newDate)
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  // Format date header
  const getHeaderTitle = (): string => {
    if (view === "week") {
      const start = weekDays[0]
      const end = weekDays[6]
      if (start.getMonth() === end.getMonth()) {
        return `${MONTHS[start.getMonth()]} ${start.getDate()} - ${end.getDate()}, ${start.getFullYear()}`
      }
      return `${MONTHS[start.getMonth()]} ${start.getDate()} - ${MONTHS[end.getMonth()]} ${end.getDate()}, ${end.getFullYear()}`
    }
    return `${MONTHS[currentDate.getMonth()]} ${currentDate.getFullYear()}`
  }

  return (
    <div className="space-y-4">
      {/* Controls */}
      <Card>
        <CardContent className="flex flex-wrap items-center gap-3 p-4">
          {/* View Toggle */}
          <div className="flex rounded-lg border p-1">
            <Button
              variant={view === "week" ? "default" : "ghost"}
              size="sm"
              onClick={() => onViewChange("week")}
              className={cn(
                "gap-2",
                view === "week" && "bg-[#069494] hover:bg-[#057a7a]"
              )}
            >
              <CalendarDays className="h-4 w-4" />
              7 Days
            </Button>
            <Button
              variant={view === "month" ? "default" : "ghost"}
              size="sm"
              onClick={() => onViewChange("month")}
              className={cn(
                "gap-2",
                view === "month" && "bg-[#069494] hover:bg-[#057a7a]"
              )}
            >
              <CalendarIcon className="h-4 w-4" />
              Month
            </Button>
          </div>

          {/* Type Filter */}
          <div className="flex gap-1 rounded-lg border p-1">
            {(["all", "glrs", "aa", "na"] as MeetingType[]).map((type) => (
              <Button
                key={type}
                variant={typeFilter === type ? "default" : "ghost"}
                size="sm"
                onClick={() => onTypeFilterChange(type)}
                className={cn(
                  typeFilter === type && TYPE_COLORS[type].bg,
                  typeFilter === type && "hover:opacity-90"
                )}
              >
                {type.toUpperCase()}
              </Button>
            ))}
          </div>

          <div className="flex-1" />

          {/* Navigation */}
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={goToToday}>
              Today
            </Button>
            <Button variant="outline" size="icon" onClick={navigatePrev}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="min-w-[200px] text-center text-sm font-medium">
              {getHeaderTitle()}
            </span>
            <Button variant="outline" size="icon" onClick={navigateNext}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Calendar Grid */}
      {view === "week" ? (
        <WeekView
          days={weekDays}
          today={today}
          getMeetingsForDay={getMeetingsForDay}
          onDayClick={onDayClick}
          onMeetingClick={onMeetingClick}
        />
      ) : (
        <MonthView
          grid={monthGrid}
          today={today}
          getMeetingsForDay={getMeetingsForDay}
          onDayClick={onDayClick}
        />
      )}

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 text-sm">
        <div className="flex items-center gap-1">
          <div className={cn("h-3 w-3 rounded-full", TYPE_COLORS.glrs.dot)} />
          <span>GLRS</span>
        </div>
        <div className="flex items-center gap-1">
          <div className={cn("h-3 w-3 rounded-full", TYPE_COLORS.aa.dot)} />
          <span>AA</span>
        </div>
        <div className="flex items-center gap-1">
          <div className={cn("h-3 w-3 rounded-full", TYPE_COLORS.na.dot)} />
          <span>NA</span>
        </div>
      </div>
    </div>
  )
}

// Week View Component
interface WeekViewProps {
  days: Date[]
  today: Date
  getMeetingsForDay: (date: Date) => CalendarMeeting[]
  onDayClick: (date: Date, meetings: CalendarMeeting[]) => void
  onMeetingClick: (meeting: CalendarMeeting) => void
}

function WeekView({ days, today, getMeetingsForDay, onDayClick, onMeetingClick }: WeekViewProps) {
  return (
    <Card>
      <CardContent className="p-0">
        <div className="grid grid-cols-7 divide-x">
          {days.map((day, idx) => {
            const dayMeetings = getMeetingsForDay(day)
            const isToday = isSameDay(day, today)

            return (
              <div
                key={idx}
                className={cn(
                  "min-h-[200px] cursor-pointer p-2 transition-colors hover:bg-muted/50",
                  isToday && "bg-[#069494]/5"
                )}
                onClick={() => onDayClick(day, dayMeetings)}
              >
                {/* Day Header */}
                <div className="mb-2 text-center">
                  <div className="text-xs text-muted-foreground">
                    {DAYS_OF_WEEK[day.getDay()]}
                  </div>
                  <div
                    className={cn(
                      "inline-flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium",
                      isToday && "bg-[#069494] text-white"
                    )}
                  >
                    {day.getDate()}
                  </div>
                </div>

                {/* Meetings */}
                <div className="space-y-1">
                  {dayMeetings.slice(0, 4).map((meeting) => {
                    const type = getMeetingType(meeting)
                    return (
                      <div
                        key={meeting.id}
                        className={cn(
                          "truncate rounded px-1 py-0.5 text-xs cursor-pointer",
                          TYPE_COLORS[type].bg,
                          TYPE_COLORS[type].text
                        )}
                        onClick={(e) => {
                          e.stopPropagation()
                          onMeetingClick(meeting)
                        }}
                        title={`${meeting.time} - ${meeting.title}`}
                      >
                        {meeting.time} {meeting.title}
                      </div>
                    )
                  })}
                  {dayMeetings.length > 4 && (
                    <div className="text-xs text-muted-foreground text-center">
                      +{dayMeetings.length - 4} more
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

// Month View Component
interface MonthViewProps {
  grid: (Date | null)[]
  today: Date
  getMeetingsForDay: (date: Date) => CalendarMeeting[]
  onDayClick: (date: Date, meetings: CalendarMeeting[]) => void
}

function MonthView({ grid, today, getMeetingsForDay, onDayClick }: MonthViewProps) {
  return (
    <Card>
      <CardContent className="p-0">
        {/* Header */}
        <div className="grid grid-cols-7 border-b bg-muted/30">
          {DAYS_OF_WEEK.map((day) => (
            <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
              {day}
            </div>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-7 divide-x divide-y">
          {grid.map((day, idx) => {
            if (!day) {
              return <div key={idx} className="min-h-[100px] bg-muted/20 p-2" />
            }

            const dayMeetings = getMeetingsForDay(day)
            const isToday = isSameDay(day, today)

            // Group meetings by type for dots
            const meetingTypes = new Set(dayMeetings.map(getMeetingType))

            return (
              <div
                key={idx}
                className={cn(
                  "min-h-[100px] cursor-pointer p-2 transition-colors hover:bg-muted/50",
                  isToday && "bg-[#069494]/5"
                )}
                onClick={() => onDayClick(day, dayMeetings)}
              >
                {/* Day Number */}
                <div className="flex items-center justify-between">
                  <span
                    className={cn(
                      "inline-flex h-6 w-6 items-center justify-center rounded-full text-sm",
                      isToday && "bg-[#069494] text-white font-medium"
                    )}
                  >
                    {day.getDate()}
                  </span>
                  {dayMeetings.length > 0 && (
                    <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                      {dayMeetings.length}
                    </Badge>
                  )}
                </div>

                {/* Meeting Type Dots */}
                {dayMeetings.length > 0 && (
                  <div className="mt-2 flex gap-1">
                    {Array.from(meetingTypes).map((type) => (
                      <div
                        key={type}
                        className={cn("h-2 w-2 rounded-full", TYPE_COLORS[type].dot)}
                        title={type.toUpperCase()}
                      />
                    ))}
                  </div>
                )}

                {/* First few meetings */}
                <div className="mt-1 space-y-0.5">
                  {dayMeetings.slice(0, 2).map((meeting) => {
                    const type = getMeetingType(meeting)
                    return (
                      <div
                        key={meeting.id}
                        className="truncate text-xs text-muted-foreground"
                        title={meeting.title}
                      >
                        <span className={cn("mr-1 inline-block h-1.5 w-1.5 rounded-full", TYPE_COLORS[type].dot)} />
                        {meeting.time}
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

export default MeetingsCalendar
