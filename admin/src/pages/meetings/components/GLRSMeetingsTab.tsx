import { useState, useEffect, useMemo, useCallback } from "react"
import {
  db,
  collection,
  doc,
  query,
  where,
  orderBy,
  getDocs,
  deleteDoc,
  CURRENT_TENANT,
} from "@/lib/firebase"
import { toast } from "sonner"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Search,
  Calendar,
  Plus,
  Filter,
  List,
  CalendarDays,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { MeetingCard, type GLRSMeeting } from "./MeetingCard"
import { CreateMeetingModal } from "./CreateMeetingModal"
import { EditMeetingModal } from "./EditMeetingModal"
import { MeetingsCalendar, type CalendarMeeting, type CalendarView, type MeetingType } from "./MeetingsCalendar"
import { CalendarDayModal } from "./CalendarDayModal"
import { AddToPIRModal } from "./AddToPIRModal"
import { RSVPManagementModal } from "./RSVPManagementModal"
import { type RSVPCounts } from "./InvitationStatusBadge"

type StatusFilter = "all" | "scheduled" | "cancelled" | "completed"
type TimeFilter = "all" | "upcoming" | "past"
type ViewMode = "list" | "calendar"

export function GLRSMeetingsTab() {
  const [meetings, setMeetings] = useState<GLRSMeeting[]>([])
  const [loading, setLoading] = useState(true)

  // View mode
  const [viewMode, setViewMode] = useState<ViewMode>("list")
  const [calendarView, setCalendarView] = useState<CalendarView>("week")
  const [typeFilter, setTypeFilter] = useState<MeetingType>("all")

  // List filters
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("all")

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showDayModal, setShowDayModal] = useState(false)
  const [showAddToPIRModal, setShowAddToPIRModal] = useState(false)
  const [showRSVPModal, setShowRSVPModal] = useState(false)
  const [selectedMeeting, setSelectedMeeting] = useState<GLRSMeeting | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedDayMeetings, setSelectedDayMeetings] = useState<CalendarMeeting[]>([])
  const [meetingForPIR, setMeetingForPIR] = useState<CalendarMeeting | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [rsvpCountsMap, setRsvpCountsMap] = useState<Record<string, RSVPCounts>>({})

  const loadMeetings = useCallback(async () => {
    setLoading(true)
    try {
      const meetingsSnap = await getDocs(
        query(
          collection(db, "meetings"),
          where("tenantId", "==", CURRENT_TENANT),
          orderBy("date", "desc")
        )
      )

      const meetingsData: GLRSMeeting[] = []
      meetingsSnap.forEach((doc) => {
        const data = doc.data()
        meetingsData.push({
          id: doc.id,
          title: data.title,
          description: data.description,
          date: data.date,
          time: data.time,
          duration: data.duration || 60,
          location: data.location,
          address: data.address,
          isVirtual: data.isVirtual || false,
          conferenceUrl: data.conferenceUrl,
          recurring: data.recurring || false,
          recurrencePattern: data.recurrencePattern,
          maxAttendees: data.maxAttendees,
          invitedPIRs: data.invitedPIRs || [],
          status: data.status || "scheduled",
          createdBy: data.createdBy,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
          tenantId: data.tenantId,
        })
      })
      setMeetings(meetingsData)
    } catch (error) {
      console.error("Error loading GLRS meetings:", error)
      toast.error("Failed to load meetings")
    } finally {
      setLoading(false)
    }
  }, [])

  const loadRSVPCounts = useCallback(async (meetingIds: string[]) => {
    if (meetingIds.length === 0) return

    try {
      const countsMap: Record<string, RSVPCounts> = {}

      // Initialize counts for all meetings
      meetingIds.forEach((id) => {
        countsMap[id] = { total: 0, accepted: 0, declined: 0, pending: 0 }
      })

      // Load all RSVP records
      const rsvpSnap = await getDocs(collection(db, "meetingRSVPs"))
      rsvpSnap.forEach((doc) => {
        const data = doc.data()
        const meetingId = data.meetingId
        if (countsMap[meetingId]) {
          countsMap[meetingId].total++
          if (data.status === "accepted") {
            countsMap[meetingId].accepted++
          } else if (data.status === "declined") {
            countsMap[meetingId].declined++
          } else {
            countsMap[meetingId].pending++
          }
        }
      })

      setRsvpCountsMap(countsMap)
    } catch (error) {
      console.error("Error loading RSVP counts:", error)
    }
  }, [])

  useEffect(() => {
    loadMeetings()
  }, [loadMeetings])

  // Load RSVP counts when meetings change
  useEffect(() => {
    if (meetings.length > 0) {
      loadRSVPCounts(meetings.map((m) => m.id))
    }
  }, [meetings, loadRSVPCounts])

  // Convert GLRS meetings to calendar format
  const calendarMeetings: CalendarMeeting[] = useMemo(() => {
    return meetings.map((m) => ({
      id: m.id,
      title: m.title,
      date: m.date,
      time: m.time,
      type: "glrs" as MeetingType,
      isVirtual: m.isVirtual,
      location: m.location,
      source: "glrs",
    }))
  }, [meetings])

  // Filter meetings for list view
  const filteredMeetings = useMemo(() => {
    let filtered = meetings

    if (statusFilter !== "all") {
      filtered = filtered.filter((m) => m.status === statusFilter)
    }

    if (timeFilter !== "all") {
      const now = new Date()
      now.setHours(0, 0, 0, 0)

      filtered = filtered.filter((m) => {
        const meetingDate = m.date instanceof Date ? m.date : m.date.toDate()
        meetingDate.setHours(0, 0, 0, 0)

        if (timeFilter === "upcoming") {
          return meetingDate >= now
        } else {
          return meetingDate < now
        }
      })
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (m) =>
          m.title.toLowerCase().includes(q) ||
          m.location.toLowerCase().includes(q) ||
          (m.description && m.description.toLowerCase().includes(q))
      )
    }

    return filtered
  }, [meetings, statusFilter, timeFilter, searchQuery])

  // Stats
  const stats = useMemo(() => ({
    total: meetings.length,
    scheduled: meetings.filter((m) => m.status === "scheduled").length,
    completed: meetings.filter((m) => m.status === "completed").length,
    cancelled: meetings.filter((m) => m.status === "cancelled").length,
  }), [meetings])

  const handleEdit = (meeting: GLRSMeeting) => {
    setSelectedMeeting(meeting)
    setShowEditModal(true)
  }

  const handleDelete = (meeting: GLRSMeeting) => {
    setSelectedMeeting(meeting)
    setShowDeleteConfirm(true)
  }

  const handleManageRSVPs = (meeting: GLRSMeeting) => {
    setSelectedMeeting(meeting)
    setShowRSVPModal(true)
  }

  const confirmDelete = async () => {
    if (!selectedMeeting) return

    setDeleting(true)
    try {
      await deleteDoc(doc(db, "meetings", selectedMeeting.id))
      toast.success("Meeting deleted successfully")
      setShowDeleteConfirm(false)
      setSelectedMeeting(null)
      loadMeetings()
    } catch (error) {
      console.error("Error deleting meeting:", error)
      toast.error("Failed to delete meeting")
    } finally {
      setDeleting(false)
    }
  }

  // Calendar handlers
  const handleDayClick = (date: Date, dayMeetings: CalendarMeeting[]) => {
    setSelectedDate(date)
    setSelectedDayMeetings(dayMeetings)
    setShowDayModal(true)
  }

  const handleMeetingClick = (meeting: CalendarMeeting) => {
    const glrsMeeting = meetings.find((m) => m.id === meeting.id)
    if (glrsMeeting) {
      setSelectedMeeting(glrsMeeting)
      setShowEditModal(true)
    }
  }

  const handleAddToPIR = (meeting: CalendarMeeting) => {
    setMeetingForPIR(meeting)
    setShowAddToPIRModal(true)
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex gap-3">
          <Skeleton className="h-10 flex-1 max-w-xs" />
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-36" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Stats Summary */}
      <div className="grid gap-3 sm:grid-cols-4">
        <Card className="bg-muted/30">
          <CardContent className="p-3 text-center">
            <div className="text-2xl font-bold text-foreground">{stats.total}</div>
            <div className="text-xs text-muted-foreground">Total Meetings</div>
          </CardContent>
        </Card>
        <Card className="bg-[#069494]/5">
          <CardContent className="p-3 text-center">
            <div className="text-2xl font-bold text-[#069494]">{stats.scheduled}</div>
            <div className="text-xs text-muted-foreground">Scheduled</div>
          </CardContent>
        </Card>
        <Card className="bg-gray-100">
          <CardContent className="p-3 text-center">
            <div className="text-2xl font-bold text-gray-700">{stats.completed}</div>
            <div className="text-xs text-muted-foreground">Completed</div>
          </CardContent>
        </Card>
        <Card className="bg-red-50">
          <CardContent className="p-3 text-center">
            <div className="text-2xl font-bold text-red-600">{stats.cancelled}</div>
            <div className="text-xs text-muted-foreground">Cancelled</div>
          </CardContent>
        </Card>
      </div>

      {/* View Toggle & Actions */}
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

              <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusFilter)}>
                <SelectTrigger className="w-[140px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>

              <Select value={timeFilter} onValueChange={(v) => setTimeFilter(v as TimeFilter)}>
                <SelectTrigger className="w-[140px]">
                  <Calendar className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Time" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="upcoming">Upcoming</SelectItem>
                  <SelectItem value="past">Past</SelectItem>
                </SelectContent>
              </Select>
            </>
          )}

          <div className="flex-1" />

          <Button
            onClick={() => setShowCreateModal(true)}
            className="bg-[#069494] hover:bg-[#057a7a]"
          >
            <Plus className="mr-2 h-4 w-4" />
            Create Meeting
          </Button>
        </CardContent>
      </Card>

      {/* Content - List or Calendar */}
      {viewMode === "list" ? (
        <>
          {filteredMeetings.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <Calendar className="mb-4 h-12 w-12 opacity-30" />
                <p className="text-lg font-medium">No meetings found</p>
                <p className="text-sm">
                  {meetings.length === 0
                    ? "Create your first GLRS meeting to get started"
                    : "Try adjusting your filters"}
                </p>
                {meetings.length === 0 && (
                  <Button
                    onClick={() => setShowCreateModal(true)}
                    className="mt-4 bg-[#069494] hover:bg-[#057a7a]"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Create Meeting
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredMeetings.map((meeting) => (
                <MeetingCard
                  key={meeting.id}
                  meeting={meeting}
                  rsvpCounts={rsvpCountsMap[meeting.id]}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onManageRSVPs={handleManageRSVPs}
                />
              ))}
            </div>
          )}

          {filteredMeetings.length > 0 && (
            <p className="text-sm text-muted-foreground">
              Showing {filteredMeetings.length} of {meetings.length} meetings
            </p>
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

      {/* Create Modal */}
      <CreateMeetingModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={loadMeetings}
      />

      {/* Edit Modal */}
      <EditMeetingModal
        open={showEditModal}
        meeting={selectedMeeting}
        onClose={() => {
          setShowEditModal(false)
          setSelectedMeeting(null)
        }}
        onSuccess={loadMeetings}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Meeting</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{selectedMeeting?.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
        onCreateMeeting={() => {
          setShowDayModal(false)
          setShowCreateModal(true)
        }}
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

      {/* RSVP Management Modal */}
      <RSVPManagementModal
        open={showRSVPModal}
        onClose={() => {
          setShowRSVPModal(false)
          setSelectedMeeting(null)
        }}
        meeting={selectedMeeting}
        onUpdate={() => {
          loadRSVPCounts(meetings.map((m) => m.id))
        }}
      />
    </div>
  )
}

export default GLRSMeetingsTab
