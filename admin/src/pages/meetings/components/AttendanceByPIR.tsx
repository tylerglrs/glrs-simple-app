import { useState, useEffect, useMemo, useCallback } from "react"
import {
  db,
  collection,
  query,
  where,
  orderBy,
  getDocs,
  Timestamp,
  CURRENT_TENANT,
} from "@/lib/firebase"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Progress } from "@/components/ui/progress"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  User,
  Calendar,
  CheckCircle,
  XCircle,
  TrendingUp,
  Flame,
} from "lucide-react"

interface PIRUser {
  id: string
  displayName?: string
  firstName?: string
  lastName?: string
  email: string
}

interface AttendanceRecord {
  id: string
  meetingId: string
  meetingTitle: string
  meetingDate: Timestamp
  attended: boolean
  recordedAt?: Timestamp
  recordedBy?: string
}

function formatDate(date: Timestamp): string {
  const d = date.toDate()
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

function generateCSV(pirName: string, records: AttendanceRecord[]): string {
  const headers = ["PIR Name", "Meeting Title", "Meeting Date", "Attended", "Recorded At"]
  const rows = records.map((r) => [
    pirName,
    r.meetingTitle,
    formatDate(r.meetingDate),
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

function calculateStreak(records: AttendanceRecord[]): number {
  // Sort by date descending
  const sorted = [...records].sort((a, b) =>
    b.meetingDate.toDate().getTime() - a.meetingDate.toDate().getTime()
  )

  let streak = 0
  for (const record of sorted) {
    if (record.attended) {
      streak++
    } else {
      break
    }
  }
  return streak
}

export function AttendanceByPIR() {
  const [pirUsers, setPirUsers] = useState<PIRUser[]>([])
  const [selectedPIRId, setSelectedPIRId] = useState("")
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([])
  const [loadingPirs, setLoadingPirs] = useState(true)
  const [loadingRecords, setLoadingRecords] = useState(false)

  // Load PIR users
  const loadPIRUsers = useCallback(async () => {
    setLoadingPirs(true)
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
      // Sort by name
      users.sort((a, b) => {
        const nameA = getPIRDisplayName(a).toLowerCase()
        const nameB = getPIRDisplayName(b).toLowerCase()
        return nameA.localeCompare(nameB)
      })
      setPirUsers(users)
    } catch (error) {
      console.error("Error loading PIR users:", error)
      toast.error("Failed to load PIR users")
    } finally {
      setLoadingPirs(false)
    }
  }, [])

  useEffect(() => {
    loadPIRUsers()
  }, [loadPIRUsers])

  // Load attendance records when PIR is selected
  useEffect(() => {
    if (!selectedPIRId) {
      setAttendanceRecords([])
      return
    }

    const loadAttendance = async () => {
      setLoadingRecords(true)
      try {
        const attendanceSnap = await getDocs(
          query(
            collection(db, "meetingAttendance"),
            where("pirId", "==", selectedPIRId),
            orderBy("meetingDate", "desc")
          )
        )

        const records: AttendanceRecord[] = []
        attendanceSnap.forEach((doc) => {
          const data = doc.data()
          records.push({
            id: doc.id,
            meetingId: data.meetingId,
            meetingTitle: data.meetingTitle,
            meetingDate: data.meetingDate,
            attended: data.attended,
            recordedAt: data.recordedAt,
            recordedBy: data.recordedBy,
          })
        })
        setAttendanceRecords(records)
      } catch (error) {
        console.error("Error loading attendance records:", error)
        toast.error("Failed to load attendance records")
      } finally {
        setLoadingRecords(false)
      }
    }

    loadAttendance()
  }, [selectedPIRId])

  // Export CSV listener
  useEffect(() => {
    const handleExport = (event: Event) => {
      const customEvent = event as CustomEvent
      if (customEvent.detail !== "by-pir") return

      if (!selectedPIRId) {
        toast.error("Please select a PIR first")
        return
      }
      const pir = pirUsers.find((p) => p.id === selectedPIRId)
      if (!pir) return

      const pirName = getPIRDisplayName(pir)
      const csv = generateCSV(pirName, attendanceRecords)
      const filename = `attendance-${pirName.replace(/\s+/g, "-")}-${new Date().toISOString().split("T")[0]}.csv`
      downloadCSV(csv, filename)
      toast.success("Attendance exported to CSV")
    }

    window.addEventListener("export-attendance", handleExport)
    return () => window.removeEventListener("export-attendance", handleExport)
  }, [selectedPIRId, pirUsers, attendanceRecords])

  const getPIRDisplayName = (pir?: PIRUser): string => {
    if (!pir) return "Unknown PIR"
    if (pir.displayName) return pir.displayName
    if (pir.firstName || pir.lastName) {
      return `${pir.firstName || ""} ${pir.lastName || ""}`.trim()
    }
    return pir.email
  }

  const selectedPIR = pirUsers.find((p) => p.id === selectedPIRId)

  // Stats
  const stats = useMemo(() => {
    const total = attendanceRecords.length
    const attended = attendanceRecords.filter((r) => r.attended).length
    const missed = total - attended
    const rate = total > 0 ? Math.round((attended / total) * 100) : 0
    const streak = calculateStreak(attendanceRecords)
    return { total, attended, missed, rate, streak }
  }, [attendanceRecords])

  if (loadingPirs) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full max-w-md" />
        <Skeleton className="h-64" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* PIR Selector */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <div className="flex-1 space-y-1.5">
              <label className="text-sm font-medium">Select PIR</label>
              <Select value={selectedPIRId} onValueChange={setSelectedPIRId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choose a PIR..." />
                </SelectTrigger>
                <SelectContent>
                  {pirUsers.length === 0 ? (
                    <SelectItem value="_none" disabled>
                      No PIRs found
                    </SelectItem>
                  ) : (
                    pirUsers.map((pir) => (
                      <SelectItem key={pir.id} value={pir.id}>
                        {getPIRDisplayName(pir)}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* PIR Stats */}
      {selectedPIR && (
        <div className="grid gap-3 sm:grid-cols-5">
          <Card className="bg-muted/30">
            <CardContent className="p-3 text-center">
              <div className="text-2xl font-bold text-foreground">{stats.total}</div>
              <div className="text-xs text-muted-foreground">Total Meetings</div>
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
              <div className="text-2xl font-bold text-red-600">{stats.missed}</div>
              <div className="text-xs text-muted-foreground">Missed</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 text-center">
              <div className="flex items-center justify-center gap-1">
                <TrendingUp className="h-5 w-5 text-[#069494]" />
                <span className="text-2xl font-bold text-foreground">{stats.rate}%</span>
              </div>
              <Progress value={stats.rate} className="mt-1 h-2" />
              <div className="text-xs text-muted-foreground">Rate</div>
            </CardContent>
          </Card>
          <Card className="bg-orange-50">
            <CardContent className="p-3 text-center">
              <div className="flex items-center justify-center gap-1">
                <Flame className="h-5 w-5 text-orange-500" />
                <span className="text-2xl font-bold text-orange-600">{stats.streak}</span>
              </div>
              <div className="text-xs text-muted-foreground">Current Streak</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Attendance History */}
      {selectedPIRId && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <User className="h-4 w-4" />
              Attendance History for {getPIRDisplayName(selectedPIR)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingRecords ? (
              <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-12" />
                ))}
              </div>
            ) : attendanceRecords.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                <Calendar className="mb-4 h-12 w-12 opacity-30" />
                <p>No attendance records found</p>
                <p className="text-sm">
                  This PIR hasn't been invited to any meetings yet
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead>Meeting</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-center">Status</TableHead>
                      <TableHead className="text-right">Recorded</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {attendanceRecords.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell className="font-medium">
                          {record.meetingTitle}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            {formatDate(record.meetingDate)}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
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
                        </TableCell>
                        <TableCell className="text-right text-sm text-muted-foreground">
                          {record.recordedAt
                            ? record.recordedAt.toDate().toLocaleDateString()
                            : "-"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* No PIR Selected */}
      {!selectedPIRId && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <User className="mb-4 h-12 w-12 opacity-30" />
            <p className="text-lg font-medium">Select a PIR</p>
            <p className="text-sm">
              Choose a PIR from the dropdown to view their attendance history
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default AttendanceByPIR
