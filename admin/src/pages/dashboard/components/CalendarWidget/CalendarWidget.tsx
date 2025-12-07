import { useState, useEffect, useCallback, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react"
import { db } from "@/lib/firebase"
import { collection, query, where, getDocs, Timestamp } from "firebase/firestore"
import { CalendarDay } from "./CalendarDay"
import { CalendarLegend } from "./CalendarLegend"
import {
  type CalendarDay as CalendarDayType,
  type CalendarEvent,
  type CalendarEventType,
  SOBRIETY_MILESTONES,
  toDate,
} from "./types"

const CURRENT_TENANT = "full-service"
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

interface CalendarWidgetProps {
  className?: string
}

export function CalendarWidget({ className = "" }: CalendarWidgetProps) {
  // State
  const [currentDate, setCurrentDate] = useState(new Date())
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [activeFilters, setActiveFilters] = useState<Set<CalendarEventType>>(
    new Set([
      "support_group",
      "milestone",
      "session",
      "saved_meeting",
      "assignment_due",
      "check_in_streak",
    ])
  )

  // Calculate start and end of displayed month
  const monthStart = useMemo(() => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
    return date
  }, [currentDate])

  const monthEnd = useMemo(() => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)
    return date
  }, [currentDate])

  // Generate calendar days for the month view
  const calendarDays = useMemo((): CalendarDayType[] => {
    const days: CalendarDayType[] = []
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Start from the first day of the week containing the month start
    const startDay = new Date(monthStart)
    startDay.setDate(startDay.getDate() - startDay.getDay())

    // End on the last day of the week containing the month end
    const endDay = new Date(monthEnd)
    endDay.setDate(endDay.getDate() + (6 - endDay.getDay()))

    // Generate all days
    const current = new Date(startDay)
    while (current <= endDay) {
      const dayDate = new Date(current)
      dayDate.setHours(0, 0, 0, 0)

      // Filter events for this day
      const dayEvents = events.filter((event) => {
        if (!activeFilters.has(event.type)) return false
        const eventDate = new Date(event.date)
        eventDate.setHours(0, 0, 0, 0)
        return eventDate.getTime() === dayDate.getTime()
      })

      days.push({
        date: dayDate,
        isCurrentMonth: dayDate.getMonth() === currentDate.getMonth(),
        isToday: dayDate.getTime() === today.getTime(),
        events: dayEvents,
      })

      current.setDate(current.getDate() + 1)
    }

    return days
  }, [monthStart, monthEnd, currentDate, events, activeFilters])

  // Event counts for legend
  const eventCounts = useMemo(() => {
    const counts: Record<CalendarEventType, number> = {
      support_group: 0,
      milestone: 0,
      session: 0,
      saved_meeting: 0,
      assignment_due: 0,
      check_in_streak: 0,
    }

    events.forEach((event) => {
      const eventDate = new Date(event.date)
      if (eventDate >= monthStart && eventDate <= monthEnd) {
        counts[event.type]++
      }
    })

    return counts
  }, [events, monthStart, monthEnd])

  // Load events from Firebase
  const loadEvents = useCallback(async () => {
    setLoading(true)
    try {
      const allEvents: CalendarEvent[] = []

      // Calculate date range (current month plus buffer)
      const rangeStart = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
      const rangeEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 2, 0)

      // 1. Load Support Group Meetings
      try {
        const supportGroupsSnap = await getDocs(
          query(
            collection(db, "supportGroups"),
            where("tenantId", "==", CURRENT_TENANT),
            where("status", "==", "active")
          )
        )

        supportGroupsSnap.forEach((doc) => {
          const data = doc.data()
          // Parse meeting time/day to create events
          const meetingDay = data.dayOfWeek // e.g., "Monday"
          const meetingTime = data.time // e.g., "19:00"

          if (meetingDay) {
            // Generate events for each occurrence in the month
            const dayIndex = [
              "Sunday",
              "Monday",
              "Tuesday",
              "Wednesday",
              "Thursday",
              "Friday",
              "Saturday",
            ].indexOf(meetingDay)

            if (dayIndex >= 0) {
              const current = new Date(rangeStart)
              while (current <= rangeEnd) {
                if (current.getDay() === dayIndex) {
                  allEvents.push({
                    id: `${doc.id}-${current.toISOString()}`,
                    title: data.name || "Support Group",
                    date: new Date(current),
                    type: "support_group",
                    time: meetingTime,
                    description: data.description,
                  })
                }
                current.setDate(current.getDate() + 1)
              }
            }
          }
        })
      } catch (e) {
        console.log("Support groups query skipped:", e)
      }

      // 2. Load PIR Milestones (from users collection)
      try {
        const usersSnap = await getDocs(
          query(
            collection(db, "users"),
            where("tenantId", "==", CURRENT_TENANT),
            where("role", "==", "pir"),
            where("active", "==", true)
          )
        )

        usersSnap.forEach((doc) => {
          const data = doc.data()
          const sobrietyDate = toDate(data.sobrietyDate)

          if (sobrietyDate) {
            const pirName =
              data.displayName ||
              `${data.firstName || ""} ${data.lastName || ""}`.trim() ||
              "PIR"

            // Calculate upcoming milestones
            SOBRIETY_MILESTONES.forEach((milestone) => {
              const milestoneDate = new Date(sobrietyDate)
              milestoneDate.setDate(milestoneDate.getDate() + milestone.days)

              if (milestoneDate >= rangeStart && milestoneDate <= rangeEnd) {
                allEvents.push({
                  id: `milestone-${doc.id}-${milestone.days}`,
                  title: `${pirName}: ${milestone.label}`,
                  date: milestoneDate,
                  type: "milestone",
                  pirId: doc.id,
                  pirName,
                  metadata: { milestone: milestone.label, days: milestone.days },
                })
              }
            })

            // Check-in streak milestones (7, 14, 30, 60, 90 days)
            const streakCount = data.checkInStreak || 0
            if (streakCount > 0) {
              const streakMilestones = [7, 14, 30, 60, 90]
              streakMilestones.forEach((days) => {
                if (streakCount >= days && streakCount < days + 7) {
                  // Just hit this milestone
                  allEvents.push({
                    id: `streak-${doc.id}-${days}`,
                    title: `${pirName}: ${days}-day streak`,
                    date: new Date(), // Today
                    type: "check_in_streak",
                    pirId: doc.id,
                    pirName,
                  })
                }
              })
            }
          }
        })
      } catch (e) {
        console.log("Users query skipped:", e)
      }

      // 3. Load Scheduled Sessions (meetings collection)
      try {
        const meetingsSnap = await getDocs(
          query(
            collection(db, "meetings"),
            where("tenantId", "==", CURRENT_TENANT),
            where("scheduledTime", ">=", Timestamp.fromDate(rangeStart)),
            where("scheduledTime", "<=", Timestamp.fromDate(rangeEnd))
          )
        )

        meetingsSnap.forEach((doc) => {
          const data = doc.data()
          const scheduledTime = toDate(data.scheduledTime)

          if (scheduledTime) {
            allEvents.push({
              id: doc.id,
              title: data.title || "Scheduled Session",
              date: scheduledTime,
              type: "session",
              pirId: data.pirId,
              pirName: data.pirName,
              time: scheduledTime.toLocaleTimeString("en-US", {
                hour: "numeric",
                minute: "2-digit",
              }),
            })
          }
        })
      } catch (e) {
        console.log("Meetings query skipped:", e)
      }

      // 4. Load Assignment Due Dates
      try {
        const assignmentsSnap = await getDocs(
          query(
            collection(db, "assignments"),
            where("tenantId", "==", CURRENT_TENANT),
            where("status", "in", ["pending", "in_progress"]),
            where("dueDate", ">=", Timestamp.fromDate(rangeStart)),
            where("dueDate", "<=", Timestamp.fromDate(rangeEnd))
          )
        )

        assignmentsSnap.forEach((doc) => {
          const data = doc.data()
          const dueDate = toDate(data.dueDate)

          if (dueDate) {
            allEvents.push({
              id: doc.id,
              title: data.title || "Assignment Due",
              date: dueDate,
              type: "assignment_due",
              pirId: data.userId || data.pirId,
              pirName: data.pirName,
            })
          }
        })
      } catch (e) {
        console.log("Assignments query skipped:", e)
      }

      setEvents(allEvents)
    } catch (error) {
      console.error("Error loading calendar events:", error)
    } finally {
      setLoading(false)
    }
  }, [currentDate])

  useEffect(() => {
    loadEvents()
  }, [loadEvents])

  // Navigation handlers
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  // Filter toggle
  const toggleFilter = (type: CalendarEventType) => {
    setActiveFilters((prev) => {
      const next = new Set(prev)
      if (next.has(type)) {
        next.delete(type)
      } else {
        next.add(type)
      }
      return next
    })
  }

  // Format month/year header
  const monthYearLabel = currentDate.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  })

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <CalendarIcon className="h-5 w-5 text-primary" />
            Calendar
          </CardTitle>

          {/* Navigation */}
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={goToPreviousMonth}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2 text-xs"
              onClick={goToToday}
            >
              Today
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={goToNextMonth}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Month/Year */}
        <div className="text-sm font-medium text-muted-foreground">{monthYearLabel}</div>
      </CardHeader>

      <CardContent className="space-y-4">
        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-6 w-full" />
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: 35 }).map((_, i) => (
                <Skeleton key={i} className="aspect-square" />
              ))}
            </div>
          </div>
        ) : (
          <>
            {/* Weekday Headers */}
            <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-muted-foreground">
              {WEEKDAYS.map((day) => (
                <div key={day} className="py-1">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((day, index) => (
                <CalendarDay key={index} day={day} />
              ))}
            </div>

            {/* Legend with filters */}
            <div className="border-t pt-3">
              <CalendarLegend
                activeFilters={activeFilters}
                onToggleFilter={toggleFilter}
                eventCounts={eventCounts}
              />
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}

export default CalendarWidget
