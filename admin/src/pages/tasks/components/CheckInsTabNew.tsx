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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
  Heart,
  Link,
  Layers,
} from "lucide-react"
import { formatDate, getInitials } from "@/lib/utils"
import { CheckIn, Reflection, GratitudeEntry, PIRUser, CheckInSubTab } from "../types"

const CURRENT_TENANT = "full-service"
const ITEMS_PER_PAGE = 20

interface CheckInsTabProps {
  searchQuery: string
  activeSubTab: CheckInSubTab
  onSubTabChange: (subTab: CheckInSubTab) => void
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

export function CheckInsTabNew({ searchQuery, activeSubTab, onSubTabChange }: CheckInsTabProps) {
  const { adminUser, getDataScope } = useAuth()

  const [checkIns, setCheckIns] = useState<CheckIn[]>([])
  const [reflections, setReflections] = useState<Reflection[]>([])
  const [gratitudes, setGratitudes] = useState<GratitudeEntry[]>([])
  const [users, setUsers] = useState<PIRUser[]>([])
  const [loading, setLoading] = useState(true)

  const [filterPIR, setFilterPIR] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedCheckIn, setSelectedCheckIn] = useState<CheckIn | null>(null)
  const [selectedReflection, setSelectedReflection] = useState<Reflection | null>(null)
  const [selectedGratitude, setSelectedGratitude] = useState<GratitudeEntry | null>(null)

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

      // Load all check-ins
      const checkInsSnap = await getDocs(
        query(
          collection(db, "checkIns"),
          orderBy("createdAt", "desc"),
          limit(500)
        )
      )

      const checkInsData: CheckIn[] = []
      checkInsSnap.forEach((docSnap) => {
        const data = docSnap.data()
        const pirId = data.pirId || data.userId
        if (pirId && allowedPIRIds.has(pirId)) {
          checkInsData.push({
            id: docSnap.id,
            pirId,
            pirName: userMap.get(pirId) || "Unknown",
            date: data.date || data.createdAt,
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

      // Load reflections
      const reflectionsSnap = await getDocs(
        query(
          collection(db, "reflections"),
          orderBy("createdAt", "desc"),
          limit(500)
        )
      )

      const reflectionsData: Reflection[] = []
      reflectionsSnap.forEach((docSnap) => {
        const data = docSnap.data()
        const pirId = data.pirId || data.userId
        if (pirId && allowedPIRIds.has(pirId)) {
          reflectionsData.push({
            id: docSnap.id,
            pirId,
            pirName: userMap.get(pirId) || "Unknown",
            date: data.date || data.createdAt,
            overallDay: data.overallDay || data.dayRating,
            gratitude: data.gratitude,
            challenges: data.challenges,
            tomorrowGoal: data.tomorrowGoal || data.goals,
            wins: data.wins || data.todayWins,
            createdAt: data.createdAt,
          })
        }
      })
      setReflections(reflectionsData)

      // Load gratitudes
      const gratitudesSnap = await getDocs(
        query(
          collection(db, "gratitudes"),
          orderBy("createdAt", "desc"),
          limit(500)
        )
      )

      const gratitudesData: GratitudeEntry[] = []
      gratitudesSnap.forEach((docSnap) => {
        const data = docSnap.data()
        const pirId = data.pirId || data.userId
        if (pirId && allowedPIRIds.has(pirId)) {
          gratitudesData.push({
            id: docSnap.id,
            pirId,
            pirName: userMap.get(pirId) || "Unknown",
            date: data.date || data.createdAt,
            entry: data.entry || data.gratitude || data.text,
            category: data.category,
            createdAt: data.createdAt,
          })
        }
      })
      setGratitudes(gratitudesData)
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

  useEffect(() => {
    setCurrentPage(1)
  }, [filterPIR, activeSubTab, searchQuery])

  // Get filtered data based on active sub-tab
  const filteredData = useMemo(() => {
    let data: (CheckIn | Reflection | GratitudeEntry)[] = []

    switch (activeSubTab) {
      case "all":
        data = checkIns
        break
      case "evening":
        data = reflections
        break
      case "goldenthread":
        // Filter check-ins that have assignment context
        data = checkIns.filter((c) => c.goals && c.goals.length > 0)
        break
      case "gratitude":
        data = gratitudes
        break
    }

    // Filter by PIR
    if (filterPIR !== "all") {
      data = data.filter((item) => item.pirId === filterPIR)
    }

    // Filter by search
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      data = data.filter((item) => {
        const pirName = item.pirName?.toLowerCase() || ""
        if (pirName.includes(q)) return true

        if ("notes" in item && item.notes?.toLowerCase().includes(q)) return true
        if ("gratitude" in item && item.gratitude?.toLowerCase().includes(q)) return true
        if ("entry" in item && item.entry?.toLowerCase().includes(q)) return true
        if ("challenges" in item && typeof item.challenges === "string" && item.challenges.toLowerCase().includes(q)) return true

        return false
      })
    }

    return data
  }, [activeSubTab, checkIns, reflections, gratitudes, filterPIR, searchQuery])

  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE)
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE
    return filteredData.slice(start, start + ITEMS_PER_PAGE)
  }, [filteredData, currentPage])

  // Get counts for sub-tab badges
  const counts = useMemo(() => ({
    all: checkIns.length,
    evening: reflections.length,
    goldenthread: checkIns.filter((c) => c.goals && c.goals.length > 0).length,
    gratitude: gratitudes.length,
  }), [checkIns, reflections, gratitudes])

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <div className="flex gap-3">
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
      {/* Sub-tabs */}
      <Tabs value={activeSubTab} onValueChange={(v) => onSubTabChange(v as CheckInSubTab)}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all" className="gap-1.5">
            <Layers className="h-4 w-4" />
            <span className="hidden sm:inline">All</span>
            <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
              {counts.all}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="evening" className="gap-1.5">
            <Moon className="h-4 w-4" />
            <span className="hidden sm:inline">Evening</span>
            <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
              {counts.evening}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="goldenthread" className="gap-1.5">
            <Link className="h-4 w-4" />
            <span className="hidden sm:inline">Golden Thread</span>
            <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
              {counts.goldenthread}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="gratitude" className="gap-1.5">
            <Heart className="h-4 w-4" />
            <span className="hidden sm:inline">Gratitude</span>
            <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
              {counts.gratitude}
            </Badge>
          </TabsTrigger>
        </TabsList>

        {/* Filters */}
        <Card className="mt-4">
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

            <div className="ml-auto text-sm text-muted-foreground">
              {filteredData.length} items
            </div>
          </CardContent>
        </Card>

        {/* All Categories Content */}
        <TabsContent value="all" className="mt-0">
          <AllCheckInsTable
            data={paginatedData as CheckIn[]}
            onView={(item) => setSelectedCheckIn(item)}
          />
        </TabsContent>

        {/* Evening Reflections Content */}
        <TabsContent value="evening" className="mt-0">
          <ReflectionsTable
            data={paginatedData as Reflection[]}
            onView={(item) => setSelectedReflection(item)}
          />
        </TabsContent>

        {/* Golden Thread Content */}
        <TabsContent value="goldenthread" className="mt-0">
          <AllCheckInsTable
            data={paginatedData as CheckIn[]}
            onView={(item) => setSelectedCheckIn(item)}
            showGoals
          />
        </TabsContent>

        {/* Gratitude Journal Content */}
        <TabsContent value="gratitude" className="mt-0">
          <GratitudeTable
            data={paginatedData as GratitudeEntry[]}
            onView={(item) => setSelectedGratitude(item)}
          />
        </TabsContent>
      </Tabs>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t pt-4">
          <p className="text-sm text-muted-foreground">
            Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to{" "}
            {Math.min(currentPage * ITEMS_PER_PAGE, filteredData.length)} of{" "}
            {filteredData.length}
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

      {/* Check-in Detail Modal */}
      <Dialog open={!!selectedCheckIn} onOpenChange={() => setSelectedCheckIn(null)}>
        <DialogContent className="max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Check-in Details</DialogTitle>
          </DialogHeader>
          {selectedCheckIn && (
            <CheckInDetailView checkIn={selectedCheckIn} />
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedCheckIn(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reflection Detail Modal */}
      <Dialog open={!!selectedReflection} onOpenChange={() => setSelectedReflection(null)}>
        <DialogContent className="max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Evening Reflection</DialogTitle>
          </DialogHeader>
          {selectedReflection && (
            <ReflectionDetailView reflection={selectedReflection} />
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedReflection(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Gratitude Detail Modal */}
      <Dialog open={!!selectedGratitude} onOpenChange={() => setSelectedGratitude(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Gratitude Entry</DialogTitle>
          </DialogHeader>
          {selectedGratitude && (
            <GratitudeDetailView gratitude={selectedGratitude} />
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedGratitude(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// All Check-ins Table
function AllCheckInsTable({
  data,
  onView,
  showGoals = false,
}: {
  data: CheckIn[]
  onView: (item: CheckIn) => void
  showGoals?: boolean
}) {
  return (
    <Card className="mt-4">
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>PIR</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-center">Type</TableHead>
              <TableHead className="text-center">Mood</TableHead>
              <TableHead className="text-center">Cravings</TableHead>
              {showGoals && <TableHead>Goals</TableHead>}
              <TableHead>Notes</TableHead>
              <TableHead className="text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((checkIn) => (
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
                {showGoals && (
                  <TableCell>
                    <div className="max-w-[150px] truncate text-sm text-muted-foreground">
                      {checkIn.goals?.join(", ") || "-"}
                    </div>
                  </TableCell>
                )}
                <TableCell>
                  <div className="max-w-[200px] truncate text-sm text-muted-foreground">
                    {checkIn.notes || "No notes"}
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <Button variant="outline" size="sm" onClick={() => onView(checkIn)}>
                    <Eye className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {data.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <FileText className="mb-4 h-12 w-12 opacity-30" />
            <p>No check-ins found</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Reflections Table
function ReflectionsTable({
  data,
  onView,
}: {
  data: Reflection[]
  onView: (item: Reflection) => void
}) {
  return (
    <Card className="mt-4">
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>PIR</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-center">Day Rating</TableHead>
              <TableHead>Gratitude</TableHead>
              <TableHead>Challenges</TableHead>
              <TableHead className="text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((reflection) => (
              <TableRow key={reflection.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary/10 text-primary text-xs">
                        {getInitials(reflection.pirName)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm">{reflection.pirName}</span>
                  </div>
                </TableCell>
                <TableCell className="text-sm">
                  {formatDate(reflection.date)}
                </TableCell>
                <TableCell className="text-center">
                  {getMoodBadge(reflection.overallDay)}
                </TableCell>
                <TableCell>
                  <div className="max-w-[200px] truncate text-sm text-muted-foreground">
                    {reflection.gratitude || "-"}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="max-w-[200px] truncate text-sm text-muted-foreground">
                    {reflection.challenges || "-"}
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <Button variant="outline" size="sm" onClick={() => onView(reflection)}>
                    <Eye className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {data.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <Moon className="mb-4 h-12 w-12 opacity-30" />
            <p>No evening reflections found</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Gratitude Table
function GratitudeTable({
  data,
  onView,
}: {
  data: GratitudeEntry[]
  onView: (item: GratitudeEntry) => void
}) {
  return (
    <Card className="mt-4">
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>PIR</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Entry</TableHead>
              <TableHead className="text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((gratitude) => (
              <TableRow key={gratitude.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary/10 text-primary text-xs">
                        {getInitials(gratitude.pirName)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm">{gratitude.pirName}</span>
                  </div>
                </TableCell>
                <TableCell className="text-sm">
                  {formatDate(gratitude.date)}
                </TableCell>
                <TableCell>
                  {gratitude.category ? (
                    <Badge variant="outline">{gratitude.category}</Badge>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell>
                  <div className="max-w-[300px] truncate text-sm">
                    {gratitude.entry}
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <Button variant="outline" size="sm" onClick={() => onView(gratitude)}>
                    <Eye className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {data.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <Heart className="mb-4 h-12 w-12 opacity-30" />
            <p>No gratitude entries found</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Check-in Detail View
function CheckInDetailView({ checkIn }: { checkIn: CheckIn }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 rounded-lg bg-muted p-3">
        <Avatar className="h-10 w-10">
          <AvatarFallback className="bg-primary/10 text-primary">
            {getInitials(checkIn.pirName)}
          </AvatarFallback>
        </Avatar>
        <div>
          <div className="font-medium">{checkIn.pirName}</div>
          <div className="text-sm text-muted-foreground">
            {formatDate(checkIn.date, "long")}
          </div>
        </div>
        <div className="ml-auto flex items-center gap-1">
          {getTypeIcon(checkIn.type)}
          <span className="text-sm capitalize">{checkIn.type}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-muted-foreground">Mood</Label>
          <div className="mt-1 flex items-center gap-2">
            {getMoodIcon(checkIn.mood)}
            <span className="text-lg font-medium">
              {checkIn.mood ?? "N/A"}/10
            </span>
          </div>
        </div>
        <div>
          <Label className="text-muted-foreground">Cravings</Label>
          <div className="mt-1 text-lg font-medium">
            {checkIn.cravings ?? "N/A"}/10
          </div>
        </div>
      </div>

      {checkIn.notes && (
        <div>
          <Label className="text-muted-foreground">Notes</Label>
          <p className="mt-1 rounded-lg bg-muted p-3 text-sm">{checkIn.notes}</p>
        </div>
      )}

      {checkIn.gratitude && (
        <div>
          <Label className="text-muted-foreground">Gratitude</Label>
          <p className="mt-1 rounded-lg bg-muted p-3 text-sm">{checkIn.gratitude}</p>
        </div>
      )}

      {checkIn.goals && checkIn.goals.length > 0 && (
        <div>
          <Label className="text-muted-foreground">Goals</Label>
          <ul className="mt-1 list-inside list-disc space-y-1 text-sm">
            {checkIn.goals.map((goal, i) => (
              <li key={i}>{goal}</li>
            ))}
          </ul>
        </div>
      )}

      {checkIn.challenges && checkIn.challenges.length > 0 && (
        <div>
          <Label className="text-muted-foreground">Challenges</Label>
          <ul className="mt-1 list-inside list-disc space-y-1 text-sm">
            {checkIn.challenges.map((challenge, i) => (
              <li key={i}>{challenge}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

// Reflection Detail View
function ReflectionDetailView({ reflection }: { reflection: Reflection }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 rounded-lg bg-muted p-3">
        <Avatar className="h-10 w-10">
          <AvatarFallback className="bg-primary/10 text-primary">
            {getInitials(reflection.pirName)}
          </AvatarFallback>
        </Avatar>
        <div>
          <div className="font-medium">{reflection.pirName}</div>
          <div className="text-sm text-muted-foreground">
            {formatDate(reflection.date, "long")}
          </div>
        </div>
        <div className="ml-auto flex items-center gap-1">
          <Moon className="h-4 w-4 text-indigo-500" />
          <span className="text-sm">Evening Reflection</span>
        </div>
      </div>

      <div>
        <Label className="text-muted-foreground">Overall Day Rating</Label>
        <div className="mt-1 flex items-center gap-2">
          {getMoodIcon(reflection.overallDay)}
          <span className="text-lg font-medium">
            {reflection.overallDay ?? "N/A"}/10
          </span>
        </div>
      </div>

      {reflection.gratitude && (
        <div>
          <Label className="text-muted-foreground">Gratitude</Label>
          <p className="mt-1 rounded-lg bg-muted p-3 text-sm">{reflection.gratitude}</p>
        </div>
      )}

      {reflection.challenges && (
        <div>
          <Label className="text-muted-foreground">Challenges</Label>
          <p className="mt-1 rounded-lg bg-muted p-3 text-sm">{reflection.challenges}</p>
        </div>
      )}

      {reflection.tomorrowGoal && (
        <div>
          <Label className="text-muted-foreground">Tomorrow&apos;s Goal</Label>
          <p className="mt-1 rounded-lg bg-muted p-3 text-sm">{reflection.tomorrowGoal}</p>
        </div>
      )}

      {reflection.wins && reflection.wins.length > 0 && (
        <div>
          <Label className="text-muted-foreground">Today&apos;s Wins</Label>
          <ul className="mt-1 list-inside list-disc space-y-1 text-sm">
            {reflection.wins.map((win, i) => (
              <li key={i}>{win}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

// Gratitude Detail View
function GratitudeDetailView({ gratitude }: { gratitude: GratitudeEntry }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 rounded-lg bg-muted p-3">
        <Avatar className="h-10 w-10">
          <AvatarFallback className="bg-primary/10 text-primary">
            {getInitials(gratitude.pirName)}
          </AvatarFallback>
        </Avatar>
        <div>
          <div className="font-medium">{gratitude.pirName}</div>
          <div className="text-sm text-muted-foreground">
            {formatDate(gratitude.date, "long")}
          </div>
        </div>
        <div className="ml-auto flex items-center gap-1">
          <Heart className="h-4 w-4 text-pink-500" />
          <span className="text-sm">Gratitude</span>
        </div>
      </div>

      {gratitude.category && (
        <div>
          <Label className="text-muted-foreground">Category</Label>
          <div className="mt-1">
            <Badge variant="outline">{gratitude.category}</Badge>
          </div>
        </div>
      )}

      <div>
        <Label className="text-muted-foreground">Entry</Label>
        <p className="mt-1 rounded-lg bg-muted p-3 text-sm">{gratitude.entry}</p>
      </div>
    </div>
  )
}

export default CheckInsTabNew
