import { useState, useEffect, useMemo, useCallback } from "react"
import { useAuth } from "@/contexts/AuthContext"
import {
  db,
  collection,
  doc,
  query,
  where,
  orderBy,
  getDocs,
  setDoc,
  serverTimestamp,
  Timestamp,
  CURRENT_TENANT,
} from "@/lib/firebase"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Skeleton } from "@/components/ui/skeleton"
import { Progress } from "@/components/ui/progress"
import {
  Calendar,
  Clock,
  Users,
  CheckCircle,
  XCircle,
  Save,
  Loader2,
} from "lucide-react"

interface GLRSMeeting {
  id: string
  title: string
  date: Timestamp
  time: string
  invitedPIRs: string[]
  status: string
}

interface PIRUser {
  id: string
  displayName?: string
  firstName?: string
  lastName?: string
  email: string
}

interface AttendanceRecord {
  pirId: string
  pirName: string
  attended: boolean
  recordedAt?: Timestamp
}

function formatMeetingDate(date: Timestamp): string {
  const d = date.toDate()
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

function generateCSV(
  meetingTitle: string,
  meetingDate: string,
  records: AttendanceRecord[]
): string {
  const headers = ["Meeting Title", "Meeting Date", "PIR Name", "Attended", "Recorded At"]
  const rows = records.map((r) => [
    meetingTitle,
    meetingDate,
    r.pirName,
    r.attended ? "Yes" : "No",
    r.recordedAt ? r.recordedAt.toDate().toLocaleString() : "Not recorded",
  ])
  return [headers, ...rows].map((row) => row.join(",")).join("\n")
}

function downloadCSV(content: string, filename: string) {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" })
  const link = document.createElement("a")
  link.href = URL.createObjectURL(blob)
  link.download = filename
  link.click()
  URL.revokeObjectURL(link.href)
}

export function AttendanceByMeeting() {
  const { adminUser } = useAuth()
  const [meetings, setMeetings] = useState<GLRSMeeting[]>([])
  const [pirUsers, setPirUsers] = useState<PIRUser[]>([])
  const [selectedMeetingId, setSelectedMeetingId] = useState("")
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([])
  const [originalRecords, setOriginalRecords] = useState<AttendanceRecord[]>([])
  const [loadingMeetings, setLoadingMeetings] = useState(true)
  const [loadingAttendance, setLoadingAttendance] = useState(false)
  const [saving, setSaving] = useState(false)

  // Load GLRS meetings
  const loadMeetings = useCallback(async () => {
    setLoadingMeetings(true)
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
          date: data.date,
          time: data.time,
          invitedPIRs: data.invitedPIRs || [],
          status: data.status || "scheduled",
        })
      })
      setMeetings(meetingsData)
    } catch (error) {
      console.error("Error loading meetings:", error)
      toast.error("Failed to load meetings")
    } finally {
      setLoadingMeetings(false)
    }
  }, [])

  // Load PIR users
  const loadPIRUsers = useCallback(async () => {
    try {
      const pirsSnap = await getDocs(
        query(
          collection(db, "users"),
          where("tenantId", "==", CURRENT_TENANT),
          where("role", "==", "pir"),
          where("active", "==", true)
        )
      )

      const users: PIRUser[] = []
      pirsSnap.forEach((doc) => {
        const data = doc.data()
        users.push({
          id: doc.id,
          displayName: data.displayName,
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
        })
      })
      setPirUsers(users)
    } catch (error) {
      console.error("Error loading PIR users:", error)
    }
  }, [])

  useEffect(() => {
    loadMeetings()
    loadPIRUsers()
  }, [loadMeetings, loadPIRUsers])

  // Load attendance when meeting is selected
  useEffect(() => {
    if (!selectedMeetingId) {
      setAttendanceRecords([])
      setOriginalRecords([])
      return
    }

    const loadAttendance = async () => {
      setLoadingAttendance(true)
      try {
        const meeting = meetings.find((m) => m.id === selectedMeetingId)
        if (!meeting) return

        // Get existing attendance records
        const attendanceSnap = await getDocs(
          query(
            collection(db, "meetingAttendance"),
            where("meetingId", "==", selectedMeetingId)
          )
        )

        const existingRecords: Record<string, AttendanceRecord> = {}
        attendanceSnap.forEach((doc) => {
          const data = doc.data()
          existingRecords[data.pirId] = {
            pirId: data.pirId,
            pirName: data.pirName,
            attended: data.attended,
            recordedAt: data.recordedAt,
          }
        })

        // Build records list from invited PIRs
        const records: AttendanceRecord[] = meeting.invitedPIRs.map((pirId) => {
          if (existingRecords[pirId]) {
            return existingRecords[pirId]
          }
          const pir = pirUsers.find((p) => p.id === pirId)
          return {
            pirId,
            pirName: getPIRDisplayName(pir),
            attended: false,
          }
        })

        setAttendanceRecords(records)
        setOriginalRecords(JSON.parse(JSON.stringify(records)))
      } catch (error) {
        console.error("Error loading attendance:", error)
        toast.error("Failed to load attendance")
      } finally {
        setLoadingAttendance(false)
      }
    }

    loadAttendance()
  }, [selectedMeetingId, meetings, pirUsers])

  // Export CSV listener
  useEffect(() => {
    const handleExport = () => {
      if (!selectedMeetingId) {
        toast.error("Please select a meeting first")
        return
      }
      const meeting = meetings.find((m) => m.id === selectedMeetingId)
      if (!meeting) return

      const csv = generateCSV(
        meeting.title,
        formatMeetingDate(meeting.date),
        attendanceRecords
      )
      const filename = `attendance-${meeting.title.replace(/\s+/g, "-")}-${formatMeetingDate(meeting.date)}.csv`
      downloadCSV(csv, filename)
      toast.success("Attendance exported to CSV")
    }

    window.addEventListener("export-attendance", handleExport)
    return () => window.removeEventListener("export-attendance", handleExport)
  }, [selectedMeetingId, meetings, attendanceRecords])

  const getPIRDisplayName = (pir?: PIRUser): string => {
    if (!pir) return "Unknown PIR"
    if (pir.displayName) return pir.displayName
    if (pir.firstName || pir.lastName) {
      return `${pir.firstName || ""} ${pir.lastName || ""}`.trim()
    }
    return pir.email
  }

  const toggleAttendance = (pirId: string) => {
    setAttendanceRecords((prev) =>
      prev.map((r) =>
        r.pirId === pirId ? { ...r, attended: !r.attended } : r
      )
    )
  }

  const markAllAttended = () => {
    setAttendanceRecords((prev) =>
      prev.map((r) => ({ ...r, attended: true }))
    )
  }

  const markAllAbsent = () => {
    setAttendanceRecords((prev) =>
      prev.map((r) => ({ ...r, attended: false }))
    )
  }

  const hasChanges = useMemo(() => {
    if (attendanceRecords.length !== originalRecords.length) return true
    return attendanceRecords.some((r, i) => r.attended !== originalRecords[i]?.attended)
  }, [attendanceRecords, originalRecords])

  const handleSave = async () => {
    if (!selectedMeetingId || !adminUser) return

    const meeting = meetings.find((m) => m.id === selectedMeetingId)
    if (!meeting) return

    setSaving(true)
    try {
      for (const record of attendanceRecords) {
        await setDoc(doc(db, "meetingAttendance", `${selectedMeetingId}_${record.pirId}`), {
          meetingId: selectedMeetingId,
          meetingTitle: meeting.title,
          meetingDate: meeting.date,
          pirId: record.pirId,
          pirName: record.pirName,
          attended: record.attended,
          recordedBy: adminUser.uid,
          recordedAt: serverTimestamp(),
        })
      }

      toast.success("Attendance saved successfully")
      setOriginalRecords(JSON.parse(JSON.stringify(attendanceRecords)))
    } catch (error) {
      console.error("Error saving attendance:", error)
      toast.error("Failed to save attendance")
    } finally {
      setSaving(false)
    }
  }

  const selectedMeeting = meetings.find((m) => m.id === selectedMeetingId)

  // Stats
  const stats = useMemo(() => {
    const total = attendanceRecords.length
    const attended = attendanceRecords.filter((r) => r.attended).length
    const rate = total > 0 ? Math.round((attended / total) * 100) : 0
    return { total, attended, absent: total - attended, rate }
  }, [attendanceRecords])

  if (loadingMeetings) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full max-w-md" />
        <Skeleton className="h-64" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Meeting Selector */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <div className="flex-1 space-y-1.5">
              <label className="text-sm font-medium">Select Meeting</label>
              <Select value={selectedMeetingId} onValueChange={setSelectedMeetingId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choose a GLRS meeting..." />
                </SelectTrigger>
                <SelectContent>
                  {meetings.length === 0 ? (
                    <SelectItem value="_none" disabled>
                      No meetings found
                    </SelectItem>
                  ) : (
                    meetings.map((meeting) => (
                      <SelectItem key={meeting.id} value={meeting.id}>
                        <div className="flex items-center gap-2">
                          <span>{meeting.title}</span>
                          <span className="text-xs text-muted-foreground">
                            ({formatMeetingDate(meeting.date)})
                          </span>
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Meeting Info & Stats */}
      {selectedMeeting && (
        <>
          <div className="grid gap-3 sm:grid-cols-4">
            <Card className="bg-muted/30">
              <CardContent className="p-3 text-center">
                <div className="text-2xl font-bold text-foreground">{stats.total}</div>
                <div className="text-xs text-muted-foreground">Total Invited</div>
              </CardContent>
            </Card>
            <Card className="bg-[#069494]/5">
              <CardContent className="p-3 text-center">
                <div className="text-2xl font-bold text-[#069494]">{stats.attended}</div>
                <div className="text-xs text-muted-foreground">Attended</div>
              </CardContent>
            </Card>
            <Card className="bg-red-50">
              <CardContent className="p-3 text-center">
                <div className="text-2xl font-bold text-red-600">{stats.absent}</div>
                <div className="text-xs text-muted-foreground">Absent</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 text-center">
                <div className="text-2xl font-bold text-foreground">{stats.rate}%</div>
                <Progress value={stats.rate} className="mt-1 h-2" />
                <div className="text-xs text-muted-foreground">Attendance Rate</div>
              </CardContent>
            </Card>
          </div>

          {/* Meeting Details */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{selectedMeeting.title}</CardTitle>
                  <div className="mt-1 flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {formatMeetingDate(selectedMeeting.date)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {selectedMeeting.time}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {selectedMeeting.invitedPIRs.length} invited
                    </span>
                  </div>
                </div>
                <Badge
                  className={
                    selectedMeeting.status === "completed"
                      ? "bg-gray-100 text-gray-700"
                      : selectedMeeting.status === "cancelled"
                        ? "bg-red-100 text-red-700"
                        : "bg-[#069494]/10 text-[#069494]"
                  }
                >
                  {selectedMeeting.status}
                </Badge>
              </div>
            </CardHeader>
          </Card>
        </>
      )}

      {/* Attendance List */}
      {selectedMeetingId && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Attendance List</CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={markAllAttended}>
                  Mark All Present
                </Button>
                <Button variant="outline" size="sm" onClick={markAllAbsent}>
                  Mark All Absent
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loadingAttendance ? (
              <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-12" />
                ))}
              </div>
            ) : attendanceRecords.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                <Users className="mb-4 h-12 w-12 opacity-30" />
                <p>No PIRs invited to this meeting</p>
                <p className="text-sm">
                  Invite PIRs from the GLRS Meetings tab first
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {attendanceRecords.map((record) => (
                  <div
                    key={record.pirId}
                    className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/50"
                  >
                    <div className="flex items-center gap-3">
                      <Checkbox
                        id={`attendance-${record.pirId}`}
                        checked={record.attended}
                        onCheckedChange={() => toggleAttendance(record.pirId)}
                      />
                      <label
                        htmlFor={`attendance-${record.pirId}`}
                        className="cursor-pointer font-medium"
                      >
                        {record.pirName}
                      </label>
                    </div>
                    <div className="flex items-center gap-2">
                      {record.attended ? (
                        <Badge className="bg-[#069494]/10 text-[#069494]">
                          <CheckCircle className="mr-1 h-3 w-3" />
                          Present
                        </Badge>
                      ) : (
                        <Badge className="bg-red-100 text-red-700">
                          <XCircle className="mr-1 h-3 w-3" />
                          Absent
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Save Button */}
            {attendanceRecords.length > 0 && (
              <div className="mt-4 flex justify-end">
                <Button
                  onClick={handleSave}
                  disabled={saving || !hasChanges}
                  className="bg-[#069494] hover:bg-[#057a7a]"
                >
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Attendance
                    </>
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* No Meeting Selected */}
      {!selectedMeetingId && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <Calendar className="mb-4 h-12 w-12 opacity-30" />
            <p className="text-lg font-medium">Select a Meeting</p>
            <p className="text-sm">
              Choose a GLRS meeting from the dropdown to record attendance
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default AttendanceByMeeting
