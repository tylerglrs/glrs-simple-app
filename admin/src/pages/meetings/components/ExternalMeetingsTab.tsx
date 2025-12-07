import { useState, useEffect, useMemo, useCallback } from "react"
import {
  db,
  collection,
  query,
  orderBy,
  limit,
  getDocs,
} from "@/lib/firebase"
import { toast } from "sonner"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Search,
  Calendar,
  MapPin,
  Clock,
  Video,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  List,
  CalendarDays,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { MeetingsCalendar, type CalendarMeeting, type CalendarView, type MeetingType } from "./MeetingsCalendar"
import { CalendarDayModal } from "./CalendarDayModal"
import { AddToPIRModal } from "./AddToPIRModal"

const ITEMS_PER_PAGE = 20

type ViewMode = "list" | "calendar"

interface MeetingAddress {
  formatted?: string
  street?: string
  streetName?: string
  streetNumber?: string
  city?: string
  state?: string
  zip?: string
  zipCode?: string
  country?: string
  coordinates?: { lat: number; lng: number }
}

interface ExternalMeeting {
  id: string
  name: string
  day: number
  time: string
  location?: string
  address?: string | MeetingAddress
  city?: string
  type: string
  types?: string[]
  source: string
  isVirtual?: boolean
  conferenceUrl?: string
  notes?: string
}

// Helper to safely convert any value to string
function safeString(value: unknown): string {
  if (value === null || value === undefined) return ""
  if (typeof value === "string") return value
  if (typeof value === "number" || typeof value === "boolean") return String(value)

  if (typeof value === "object") {
    const obj = value as Record<string, unknown>
    if (obj.formatted && typeof obj.formatted === "string") return obj.formatted
    if (obj.name && typeof obj.name === "string") return obj.name
    const parts: string[] = []
    if (obj.streetNumber && obj.streetName) {
      parts.push(`${obj.streetNumber} ${obj.streetName}`)
    } else if (obj.street) {
      parts.push(String(obj.street))
    }
    if (obj.city) parts.push(String(obj.city))
    if (obj.state) parts.push(String(obj.state))
    if (obj.zip || obj.zipCode) parts.push(String(obj.zip || obj.zipCode))
    if (parts.length > 0) return parts.join(", ")
    return ""
  }

  return String(value)
}

function formatAddress(address: string | MeetingAddress | undefined): string {
  return safeString(address)
}

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

const SOURCES = [
  { value: "all", label: "All Sources" },
  { value: "sfmarin", label: "SF/Marin AA" },
  { value: "eastbay", label: "East Bay AA" },
  { value: "santaclara", label: "Santa Clara AA" },
  { value: "santacruz", label: "Santa Cruz AA" },
  { value: "sanmateo", label: "San Mateo AA" },
]

export function ExternalMeetingsTab() {
  const [meetings, setMeetings] = useState<ExternalMeeting[]>([])
  const [loading, setLoading] = useState(true)

  // View mode
  const [viewMode, setViewMode] = useState<ViewMode>("list")
  const [calendarView, setCalendarView] = useState<CalendarView>("week")
  const [typeFilter, setTypeFilter] = useState<MeetingType>("all")

  // List filters
  const [searchQuery, setSearchQuery] = useState("")
  const [filterDay, setFilterDay] = useState("all")
  const [filterSource, setFilterSource] = useState("all")
  const [filterVirtual, setFilterVirtual] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)

  // Calendar modals
  const [showDayModal, setShowDayModal] = useState(false)
  const [showAddToPIRModal, setShowAddToPIRModal] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedDayMeetings, setSelectedDayMeetings] = useState<CalendarMeeting[]>([])
  const [meetingForPIR, setMeetingForPIR] = useState<CalendarMeeting | null>(null)

  const loadMeetings = useCallback(async () => {
    setLoading(true)
    try {
      const meetingsSnap = await getDocs(
        query(
          collection(db, "externalMeetings"),
          orderBy("day", "asc"),
          limit(1000)
        )
      )

      const meetingsData: ExternalMeeting[] = []
      meetingsSnap.forEach((doc) => {
        const data = doc.data()
        meetingsData.push({
          id: doc.id,
          name: data.name,
          day: data.day,
          time: data.time,
          location: data.location,
          address: data.address,
          city: data.city,
          type: data.type,
          types: data.types,
          source: data.source,
          isVirtual: data.isVirtual,
          conferenceUrl: data.conferenceUrl,
          notes: data.notes,
        })
      })
      setMeetings(meetingsData)
    } catch (error) {
      console.error("Error loading meetings:", error)
      toast.error("Failed to load meetings")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadMeetings()
  }, [loadMeetings])

  useEffect(() => {
    setCurrentPage(1)
  }, [filterDay, filterSource, filterVirtual, searchQuery])

  const filteredMeetings = useMemo(() => {
    let filtered = meetings

    if (filterDay !== "all") {
      filtered = filtered.filter((m) => m.day === parseInt(filterDay))
    }
    if (filterSource !== "all") {
      filtered = filtered.filter((m) => m.source?.includes(filterSource))
    }
    if (filterVirtual === "virtual") {
      filtered = filtered.filter((m) => m.isVirtual)
    } else if (filterVirtual === "inperson") {
      filtered = filtered.filter((m) => !m.isVirtual)
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (m) =>
          safeString(m.name).toLowerCase().includes(q) ||
          safeString(m.location).toLowerCase().includes(q) ||
          safeString(m.city).toLowerCase().includes(q) ||
          formatAddress(m.address).toLowerCase().includes(q)
      )
    }
    return filtered
  }, [meetings, filterDay, filterSource, filterVirtual, searchQuery])

  const totalPages = Math.ceil(filteredMeetings.length / ITEMS_PER_PAGE)
  const paginatedMeetings = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE
    return filteredMeetings.slice(start, start + ITEMS_PER_PAGE)
  }, [filteredMeetings, currentPage])

  const stats = useMemo(() => ({
    total: meetings.length,
    virtual: meetings.filter((m) => m.isVirtual).length,
    inPerson: meetings.filter((m) => !m.isVirtual).length,
  }), [meetings])

  // Convert external meetings to calendar format
  // External meetings have day (0-6) instead of dates, so we map to current/next week dates
  const calendarMeetings: CalendarMeeting[] = useMemo(() => {
    const result: CalendarMeeting[] = []
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayDay = today.getDay()

    // Generate meetings for each recurring day over 5 weeks (for month view coverage)
    meetings.forEach((m) => {
      // For each meeting, create instances for the next 5 weeks
      for (let week = 0; week < 5; week++) {
        const meetingDate = new Date(today)
        // Calculate days until this meeting's day in current/future week
        let daysUntil = m.day - todayDay + (week * 7)
        if (week === 0 && daysUntil < 0) {
          daysUntil += 7 // If already passed this week, show next week
        }
        meetingDate.setDate(today.getDate() + daysUntil)

        // Determine meeting type from source
        let meetingType: MeetingType = "aa"
        if (m.source?.toLowerCase().includes("na")) {
          meetingType = "na"
        }

        result.push({
          id: `${m.id}-week${week}`,
          title: m.name,
          date: meetingDate,
          time: m.time,
          type: meetingType,
          isVirtual: m.isVirtual,
          location: safeString(m.location) || formatAddress(m.address),
          source: m.source,
        })
      }
    })

    return result
  }, [meetings])

  // Calendar handlers
  const handleDayClick = (date: Date, dayMeetings: CalendarMeeting[]) => {
    setSelectedDate(date)
    setSelectedDayMeetings(dayMeetings)
    setShowDayModal(true)
  }

  const handleMeetingClick = (meeting: CalendarMeeting) => {
    // For external meetings, just show the day modal with this meeting highlighted
    const date = meeting.date instanceof Date ? meeting.date : meeting.date.toDate()
    const dayMeetings = calendarMeetings.filter((m) => {
      const mDate = m.date instanceof Date ? m.date : m.date.toDate()
      return (
        mDate.getFullYear() === date.getFullYear() &&
        mDate.getMonth() === date.getMonth() &&
        mDate.getDate() === date.getDate()
      )
    })
    setSelectedDate(date)
    setSelectedDayMeetings(dayMeetings)
    setShowDayModal(true)
  }

  const handleAddToPIR = (meeting: CalendarMeeting) => {
    setMeetingForPIR(meeting)
    setShowAddToPIRModal(true)
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex gap-3">
          <Skeleton className="h-10 w-full max-w-xs" />
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
        </div>
        <Card>
          <CardContent className="p-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="mb-3 h-16" />
            ))}
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Stats */}
      <p className="text-sm text-muted-foreground">
        Browse AA/NA meetings from Bay Area intergroups ({stats.total.toLocaleString()} meetings)
      </p>

      {/* View Toggle & Filters */}
      <Card>
        <CardContent className="flex flex-wrap items-center gap-3 p-4">
          {/* View Toggle */}
          <div className="flex rounded-lg border p-1">
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("list")}
              className={cn(
                "gap-2",
                viewMode === "list" && "bg-[#069494] hover:bg-[#057a7a]"
              )}
            >
              <List className="h-4 w-4" />
              List
            </Button>
            <Button
              variant={viewMode === "calendar" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("calendar")}
              className={cn(
                "gap-2",
                viewMode === "calendar" && "bg-[#069494] hover:bg-[#057a7a]"
              )}
            >
              <CalendarDays className="h-4 w-4" />
              Calendar
            </Button>
          </div>

          {/* List View Filters */}
          {viewMode === "list" && (
            <>
              <div className="relative flex-1 sm:max-w-xs">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search meetings..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>

              <Select value={filterDay} onValueChange={setFilterDay}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Day" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Days</SelectItem>
                  {DAYS.map((day, idx) => (
                    <SelectItem key={idx} value={idx.toString()}>
                      {day}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filterSource} onValueChange={setFilterSource}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Source" />
                </SelectTrigger>
                <SelectContent>
                  {SOURCES.map((source) => (
                    <SelectItem key={source.value} value={source.value}>
                      {source.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filterVirtual} onValueChange={setFilterVirtual}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Formats</SelectItem>
                  <SelectItem value="inperson">In Person</SelectItem>
                  <SelectItem value="virtual">Virtual</SelectItem>
                </SelectContent>
              </Select>
            </>
          )}
        </CardContent>
      </Card>

      {/* Content - List or Calendar */}
      {viewMode === "list" ? (
        <>
          {/* Meetings Table */}
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Meeting</TableHead>
                    <TableHead>Day & Time</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead className="text-center">Type</TableHead>
                    <TableHead className="text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedMeetings.map((meeting) => (
                    <TableRow key={meeting.id}>
                      <TableCell>
                        <div className="font-medium">{safeString(meeting.name)}</div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          {meeting.isVirtual ? (
                            <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                              <Video className="mr-1 h-3 w-3" />
                              Virtual
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="bg-emerald-100 text-emerald-700">
                              <MapPin className="mr-1 h-3 w-3" />
                              In Person
                            </Badge>
                          )}
                          {meeting.types && Array.isArray(meeting.types) && meeting.types.length > 0 && (
                            <span>{meeting.types.map(t => safeString(t)).join(", ")}</span>
                          )}
                          {meeting.types && typeof meeting.types === "string" && (
                            <span>{safeString(meeting.types)}</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>{DAYS[meeting.day]}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {safeString(meeting.time)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-[200px]">
                          <div className="truncate">{safeString(meeting.location) || "N/A"}</div>
                          {meeting.address && (
                            <div className="truncate text-xs text-muted-foreground">
                              {formatAddress(meeting.address)}
                            </div>
                          )}
                          {meeting.city && (
                            <div className="text-xs text-muted-foreground">{safeString(meeting.city)}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="secondary" className="bg-primary/10 text-primary">
                          {safeString(meeting.type) || "AA"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        {meeting.conferenceUrl && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(meeting.conferenceUrl, "_blank")}
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {filteredMeetings.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <Calendar className="mb-4 h-12 w-12 opacity-30" />
                  <p>No meetings found</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t pt-4">
              <p className="text-sm text-muted-foreground">
                Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to{" "}
                {Math.min(currentPage * ITEMS_PER_PAGE, filteredMeetings.length)} of{" "}
                {filteredMeetings.length} meetings
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      ) : (
        <MeetingsCalendar
          meetings={calendarMeetings}
          view={calendarView}
          onViewChange={setCalendarView}
          typeFilter={typeFilter}
          onTypeFilterChange={setTypeFilter}
          onDayClick={handleDayClick}
          onMeetingClick={handleMeetingClick}
        />
      )}

      {/* Calendar Day Modal */}
      <CalendarDayModal
        open={showDayModal}
        onClose={() => {
          setShowDayModal(false)
          setSelectedDate(null)
          setSelectedDayMeetings([])
        }}
        date={selectedDate}
        meetings={selectedDayMeetings}
        onAddToPIR={handleAddToPIR}
        onViewDetails={handleMeetingClick}
      />

      {/* Add to PIR Modal */}
      <AddToPIRModal
        open={showAddToPIRModal}
        onClose={() => {
          setShowAddToPIRModal(false)
          setMeetingForPIR(null)
        }}
        meeting={meetingForPIR}
        onSuccess={() => {
          setShowDayModal(false)
        }}
      />
    </div>
  )
}

export default ExternalMeetingsTab
