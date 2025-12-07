import { useState, useEffect, useMemo, useCallback } from "react"
import { useAuth } from "@/contexts/AuthContext"
import {
  db,
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
} from "@/lib/firebase"
import { toast } from "sonner"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { Label } from "@/components/ui/label"
import {
  FileText,
  Eye,
  ChevronLeft,
  ChevronRight,
  Smile,
  Meh,
  Frown,
  Sun,
  Moon,
} from "lucide-react"
import { formatDate, getInitials } from "@/lib/utils"
import { CheckIn, PIRUser } from "../types"

const CURRENT_TENANT = "full-service"
const ITEMS_PER_PAGE = 20

interface CheckInsTabProps {
  searchQuery: string
}

function getMoodIcon(mood: number | undefined) {
  if (!mood) return <Meh className="h-5 w-5 text-gray-400" />
  if (mood >= 7) return <Smile className="h-5 w-5 text-emerald-500" />
  if (mood >= 4) return <Meh className="h-5 w-5 text-amber-500" />
  return <Frown className="h-5 w-5 text-red-500" />
}

function getMoodBadge(mood: number | undefined) {
  if (!mood) return <Badge variant="secondary" className="bg-gray-100 text-gray-600">N/A</Badge>
  if (mood >= 7) return <Badge variant="secondary" className="bg-emerald-100 text-emerald-700">{mood}/10</Badge>
  if (mood >= 4) return <Badge variant="secondary" className="bg-amber-100 text-amber-700">{mood}/10</Badge>
  return <Badge variant="secondary" className="bg-red-100 text-red-700">{mood}/10</Badge>
}

function getTypeIcon(type: string | undefined) {
  if (type === "morning") return <Sun className="h-4 w-4 text-amber-500" />
  if (type === "evening") return <Moon className="h-4 w-4 text-indigo-500" />
  return <FileText className="h-4 w-4 text-gray-500" />
}

export function CheckInsTab({ searchQuery }: CheckInsTabProps) {
  const { adminUser, getDataScope } = useAuth()

  const [checkIns, setCheckIns] = useState<CheckIn[]>([])
  const [users, setUsers] = useState<PIRUser[]>([])
  const [loading, setLoading] = useState(true)

  const [filterPIR, setFilterPIR] = useState("all")
  const [filterType, setFilterType] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedCheckIn, setSelectedCheckIn] = useState<CheckIn | null>(null)

  const loadData = useCallback(async () => {
    if (!adminUser) return

    setLoading(true)
    const scope = getDataScope()

    try {
      // Load PIRs
      let pirQuery = query(
        collection(db, "users"),
        where("tenantId", "==", CURRENT_TENANT),
        where("role", "==", "pir")
      )

      if (scope === "assigned_pirs" && adminUser.uid) {
        pirQuery = query(
          collection(db, "users"),
          where("tenantId", "==", CURRENT_TENANT),
          where("role", "==", "pir"),
          where("assignedCoach", "==", adminUser.uid)
        )
      }

      const usersSnap = await getDocs(pirQuery)
      const usersData: PIRUser[] = []
      const userMap = new Map<string, string>()
      const allowedPIRIds = new Set<string>()

      usersSnap.forEach((docSnap) => {
        const data = docSnap.data()
        usersData.push({
          id: docSnap.id,
          uid: docSnap.id,
          email: data.email,
          displayName: data.displayName,
          firstName: data.firstName,
          lastName: data.lastName,
        })
        userMap.set(docSnap.id, data.displayName || data.email)
        allowedPIRIds.add(docSnap.id)
      })
      setUsers(usersData)

      // Load check-ins
      const checkInsSnap = await getDocs(
        query(
          collection(db, "checkins"),
          orderBy("date", "desc"),
          limit(500)
        )
      )

      const checkInsData: CheckIn[] = []
      checkInsSnap.forEach((docSnap) => {
        const data = docSnap.data()
        // Handle both pirId and userId fields
        const pirId = data.pirId || data.userId
        if (pirId && allowedPIRIds.has(pirId)) {
          checkInsData.push({
            id: docSnap.id,
            pirId,
            pirName: userMap.get(pirId) || "Unknown",
            date: data.date,
            mood: data.mood,
            moodLabel: data.moodLabel,
            cravings: data.cravings,
            notes: data.notes,
            goals: data.goals,
            challenges: data.challenges,
            gratitude: data.gratitude,
            createdAt: data.createdAt,
            type: data.type || "daily",
          })
        }
      })
      setCheckIns(checkInsData)
    } catch (error) {
      console.error("Error loading check-ins:", error)
      toast.error("Failed to load check-ins")
    } finally {
      setLoading(false)
    }
  }, [adminUser, getDataScope])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [filterPIR, filterType, searchQuery])

  const filteredCheckIns = useMemo(() => {
    let filtered = checkIns

    if (filterPIR !== "all") {
      filtered = filtered.filter((c) => c.pirId === filterPIR)
    }
    if (filterType !== "all") {
      filtered = filtered.filter((c) => c.type === filterType)
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (c) =>
          c.pirName?.toLowerCase().includes(q) ||
          c.notes?.toLowerCase().includes(q) ||
          c.gratitude?.toLowerCase().includes(q)
      )
    }
    return filtered
  }, [checkIns, filterPIR, filterType, searchQuery])

  const totalPages = Math.ceil(filteredCheckIns.length / ITEMS_PER_PAGE)
  const paginatedCheckIns = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE
    return filteredCheckIns.slice(start, start + ITEMS_PER_PAGE)
  }, [filteredCheckIns, currentPage])

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex gap-3">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
        </div>
        <Card>
          <CardContent className="p-0">
            <div className="space-y-4 p-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <Skeleton className="h-12 flex-1" />
                  <Skeleton className="h-8 w-20" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <Card>
        <CardContent className="flex flex-wrap items-center gap-3 p-4">
          <Select value={filterPIR} onValueChange={setFilterPIR}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="PIR" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All PIRs</SelectItem>
              {users.map((u) => (
                <SelectItem key={u.id} value={u.id}>
                  {u.displayName || u.email}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="morning">Morning</SelectItem>
              <SelectItem value="evening">Evening</SelectItem>
              <SelectItem value="daily">Daily</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>PIR</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-center">Type</TableHead>
                <TableHead className="text-center">Mood</TableHead>
                <TableHead className="text-center">Cravings</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead className="text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedCheckIns.map((checkIn) => (
                <TableRow key={checkIn.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-primary/10 text-primary text-xs">
                          {getInitials(checkIn.pirName)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm">{checkIn.pirName}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">
                    {formatDate(checkIn.date)}
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      {getTypeIcon(checkIn.type)}
                      <span className="text-sm capitalize">{checkIn.type}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      {getMoodIcon(checkIn.mood)}
                      {getMoodBadge(checkIn.mood)}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    {checkIn.cravings !== undefined ? (
                      <Badge
                        variant="secondary"
                        className={
                          checkIn.cravings >= 7
                            ? "bg-red-100 text-red-700"
                            : checkIn.cravings >= 4
                            ? "bg-amber-100 text-amber-700"
                            : "bg-emerald-100 text-emerald-700"
                        }
                      >
                        {checkIn.cravings}/10
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="bg-gray-100 text-gray-600">
                        N/A
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="max-w-[200px] truncate text-sm text-muted-foreground">
                      {checkIn.notes || "No notes"}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedCheckIn(checkIn)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredCheckIns.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <FileText className="mb-4 h-12 w-12 opacity-30" />
              <p>No check-ins found</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t pt-4">
          <p className="text-sm text-muted-foreground">
            Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to{" "}
            {Math.min(currentPage * ITEMS_PER_PAGE, filteredCheckIns.length)} of{" "}
            {filteredCheckIns.length}
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

      {/* Detail Modal */}
      <Dialog open={!!selectedCheckIn} onOpenChange={() => setSelectedCheckIn(null)}>
        <DialogContent className="max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Check-in Details</DialogTitle>
          </DialogHeader>
          {selectedCheckIn && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 rounded-lg bg-muted p-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {getInitials(selectedCheckIn.pirName)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">{selectedCheckIn.pirName}</div>
                  <div className="text-sm text-muted-foreground">
                    {formatDate(selectedCheckIn.date, "long")}
                  </div>
                </div>
                <div className="ml-auto flex items-center gap-1">
                  {getTypeIcon(selectedCheckIn.type)}
                  <span className="text-sm capitalize">{selectedCheckIn.type}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Mood</Label>
                  <div className="mt-1 flex items-center gap-2">
                    {getMoodIcon(selectedCheckIn.mood)}
                    <span className="text-lg font-medium">
                      {selectedCheckIn.mood ?? "N/A"}/10
                    </span>
                    {selectedCheckIn.moodLabel && (
                      <span className="text-sm text-muted-foreground">
                        ({selectedCheckIn.moodLabel})
                      </span>
                    )}
                  </div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Cravings</Label>
                  <div className="mt-1 text-lg font-medium">
                    {selectedCheckIn.cravings ?? "N/A"}/10
                  </div>
                </div>
              </div>

              {selectedCheckIn.notes && (
                <div>
                  <Label className="text-muted-foreground">Notes</Label>
                  <p className="mt-1 rounded-lg bg-muted p-3 text-sm">
                    {selectedCheckIn.notes}
                  </p>
                </div>
              )}

              {selectedCheckIn.gratitude && (
                <div>
                  <Label className="text-muted-foreground">Gratitude</Label>
                  <p className="mt-1 rounded-lg bg-muted p-3 text-sm">
                    {selectedCheckIn.gratitude}
                  </p>
                </div>
              )}

              {selectedCheckIn.goals && selectedCheckIn.goals.length > 0 && (
                <div>
                  <Label className="text-muted-foreground">Goals</Label>
                  <ul className="mt-1 list-inside list-disc space-y-1 text-sm">
                    {selectedCheckIn.goals.map((goal, i) => (
                      <li key={i}>{goal}</li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedCheckIn.challenges && selectedCheckIn.challenges.length > 0 && (
                <div>
                  <Label className="text-muted-foreground">Challenges</Label>
                  <ul className="mt-1 list-inside list-disc space-y-1 text-sm">
                    {selectedCheckIn.challenges.map((challenge, i) => (
                      <li key={i}>{challenge}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedCheckIn(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
