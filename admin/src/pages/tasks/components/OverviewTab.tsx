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
  doc,
  updateDoc,
  addDoc,
  serverTimestamp,
  Timestamp,
} from "@/lib/firebase"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Plus,
  Eye,
  Check,
  Target,
  Flag,
  ClipboardList,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
} from "lucide-react"
import { formatDate, getInitials } from "@/lib/utils"
import { Assignment, Goal, Objective, PIRUser, AssignmentStatus, Priority, GoalStatus } from "../types"

const CURRENT_TENANT = "full-service"
const ITEMS_PER_PAGE = 10

interface OverviewTabProps {
  searchQuery: string
}

// Status badge helpers
function getGoalStatusBadge(status: GoalStatus) {
  const styles: Record<GoalStatus, { className: string; label: string }> = {
    active: { className: "bg-emerald-100 text-emerald-700", label: "Active" },
    completed: { className: "bg-blue-100 text-blue-700", label: "Completed" },
    paused: { className: "bg-gray-100 text-gray-600", label: "Paused" },
  }
  const s = styles[status] || styles.active
  return <Badge variant="secondary" className={s.className}>{s.label}</Badge>
}

function getAssignmentStatusBadge(status: AssignmentStatus) {
  const styles: Record<AssignmentStatus, { className: string; label: string }> = {
    pending: { className: "bg-amber-100 text-amber-700", label: "Pending" },
    "in-progress": { className: "bg-blue-100 text-blue-700", label: "In Progress" },
    completed: { className: "bg-emerald-100 text-emerald-700", label: "Completed" },
    overdue: { className: "bg-red-100 text-red-700", label: "Overdue" },
  }
  const s = styles[status] || styles.pending
  return <Badge variant="secondary" className={s.className}>{s.label}</Badge>
}

function getPriorityBadge(priority: Priority) {
  const styles: Record<Priority, { className: string; label: string }> = {
    high: { className: "bg-red-100 text-red-700", label: "High" },
    medium: { className: "bg-amber-100 text-amber-700", label: "Medium" },
    low: { className: "bg-gray-100 text-gray-600", label: "Low" },
  }
  const s = styles[priority] || styles.medium
  return <Badge variant="secondary" className={s.className}>{s.label}</Badge>
}

// Extended objective type with PIR info
interface ObjectiveWithMeta extends Objective {
  pirId: string
  pirName?: string
  goalId: string
  goalTitle: string
}

export function OverviewTab({ searchQuery }: OverviewTabProps) {
  const { adminUser, getDataScope } = useAuth()

  const [goals, setGoals] = useState<Goal[]>([])
  const [objectives, setObjectives] = useState<ObjectiveWithMeta[]>([])
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [users, setUsers] = useState<PIRUser[]>([])
  const [loading, setLoading] = useState(true)

  // Filter states
  const [filterPIR, setFilterPIR] = useState("all")

  // Section expand states
  const [goalsExpanded, setGoalsExpanded] = useState(true)
  const [objectivesExpanded, setObjectivesExpanded] = useState(true)
  const [assignmentsExpanded, setAssignmentsExpanded] = useState(true)

  // Pagination states
  const [goalsPage, setGoalsPage] = useState(1)
  const [objectivesPage, setObjectivesPage] = useState(1)
  const [assignmentsPage, setAssignmentsPage] = useState(1)

  // Modal states
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null)
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null)
  const [showCreateAssignment, setShowCreateAssignment] = useState(false)

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

      // Load goals with objectives
      const goalsSnap = await getDocs(
        query(collection(db, "goals"), orderBy("createdAt", "desc"))
      )

      const goalsData: Goal[] = []
      const allObjectives: ObjectiveWithMeta[] = []

      for (const docSnap of goalsSnap.docs) {
        const data = docSnap.data()
        if (data.pirId && allowedPIRIds.has(data.pirId)) {
          // Load objectives for this goal
          const objectivesSnap = await getDocs(
            collection(db, "goals", docSnap.id, "objectives")
          )

          const goalObjectives: Objective[] = []
          for (const objDoc of objectivesSnap.docs) {
            const objData = objDoc.data()

            // Load assignments for this objective
            const assignmentsSnap = await getDocs(
              query(collection(db, "assignments"), where("objectiveId", "==", objDoc.id))
            )
            const objAssignments: Assignment[] = assignmentsSnap.docs.map((d) => ({
              id: d.id,
              ...d.data(),
            })) as Assignment[]

            const objective: Objective = {
              id: objDoc.id,
              title: objData.title,
              description: objData.description,
              assignments: objAssignments,
            }
            goalObjectives.push(objective)

            // Add to all objectives list with meta
            allObjectives.push({
              ...objective,
              pirId: data.pirId,
              pirName: userMap.get(data.pirId) || "Unknown",
              goalId: docSnap.id,
              goalTitle: data.title,
            })
          }

          goalsData.push({
            id: docSnap.id,
            title: data.title,
            description: data.description,
            pirId: data.pirId,
            pirName: userMap.get(data.pirId) || "Unknown",
            status: data.status || "active",
            objectives: goalObjectives,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
            targetDate: data.targetDate,
            tenantId: data.tenantId,
          })
        }
      }
      setGoals(goalsData)
      setObjectives(allObjectives)

      // Load all assignments (including those not linked to objectives)
      const assignmentsSnap = await getDocs(
        query(collection(db, "assignments"), orderBy("createdAt", "desc"), limit(500))
      )

      const assignmentsData: Assignment[] = []
      assignmentsSnap.forEach((docSnap) => {
        const data = docSnap.data()
        if (data.pirId && allowedPIRIds.has(data.pirId)) {
          assignmentsData.push({
            id: docSnap.id,
            title: data.title,
            description: data.description,
            pirId: data.pirId,
            pirName: userMap.get(data.pirId) || "Unknown",
            priority: data.priority || "medium",
            status: data.status || "pending",
            dueDate: data.dueDate,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
            completedAt: data.completedAt,
            createdBy: data.createdBy,
            objectiveId: data.objectiveId,
            goalId: data.goalId,
            tenantId: data.tenantId,
          })
        }
      })
      setAssignments(assignmentsData)
    } catch (error) {
      console.error("Error loading data:", error)
      toast.error("Failed to load data")
    } finally {
      setLoading(false)
    }
  }, [adminUser, getDataScope])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Reset pages when filter changes
  useEffect(() => {
    setGoalsPage(1)
    setObjectivesPage(1)
    setAssignmentsPage(1)
  }, [filterPIR, searchQuery])

  // Filtered data
  const filteredGoals = useMemo(() => {
    let filtered = goals
    if (filterPIR !== "all") {
      filtered = filtered.filter((g) => g.pirId === filterPIR)
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (g) =>
          g.title?.toLowerCase().includes(q) ||
          g.description?.toLowerCase().includes(q) ||
          g.pirName?.toLowerCase().includes(q)
      )
    }
    return filtered
  }, [goals, filterPIR, searchQuery])

  const filteredObjectives = useMemo(() => {
    let filtered = objectives
    if (filterPIR !== "all") {
      filtered = filtered.filter((o) => o.pirId === filterPIR)
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (o) =>
          o.title?.toLowerCase().includes(q) ||
          o.description?.toLowerCase().includes(q) ||
          o.pirName?.toLowerCase().includes(q) ||
          o.goalTitle?.toLowerCase().includes(q)
      )
    }
    return filtered
  }, [objectives, filterPIR, searchQuery])

  const filteredAssignments = useMemo(() => {
    let filtered = assignments
    if (filterPIR !== "all") {
      filtered = filtered.filter((a) => a.pirId === filterPIR)
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (a) =>
          a.title?.toLowerCase().includes(q) ||
          a.description?.toLowerCase().includes(q) ||
          a.pirName?.toLowerCase().includes(q)
      )
    }
    return filtered
  }, [assignments, filterPIR, searchQuery])

  // Pagination
  const goalsTotalPages = Math.ceil(filteredGoals.length / ITEMS_PER_PAGE)
  const paginatedGoals = useMemo(() => {
    const start = (goalsPage - 1) * ITEMS_PER_PAGE
    return filteredGoals.slice(start, start + ITEMS_PER_PAGE)
  }, [filteredGoals, goalsPage])

  const objectivesTotalPages = Math.ceil(filteredObjectives.length / ITEMS_PER_PAGE)
  const paginatedObjectives = useMemo(() => {
    const start = (objectivesPage - 1) * ITEMS_PER_PAGE
    return filteredObjectives.slice(start, start + ITEMS_PER_PAGE)
  }, [filteredObjectives, objectivesPage])

  const assignmentsTotalPages = Math.ceil(filteredAssignments.length / ITEMS_PER_PAGE)
  const paginatedAssignments = useMemo(() => {
    const start = (assignmentsPage - 1) * ITEMS_PER_PAGE
    return filteredAssignments.slice(start, start + ITEMS_PER_PAGE)
  }, [filteredAssignments, assignmentsPage])

  // Handlers
  const handleStatusChange = async (assignmentId: string, newStatus: AssignmentStatus) => {
    try {
      const assignmentRef = doc(db, "assignments", assignmentId)
      await updateDoc(assignmentRef, {
        status: newStatus,
        updatedAt: serverTimestamp(),
        ...(newStatus === "completed" ? { completedAt: serverTimestamp() } : {}),
      })
      setAssignments((prev) =>
        prev.map((a) => (a.id === assignmentId ? { ...a, status: newStatus } : a))
      )
      toast.success("Status updated")
    } catch (error) {
      console.error("Error updating status:", error)
      toast.error("Failed to update status")
    }
  }

  const getGoalProgress = (goal: Goal) => {
    if (!goal.objectives || goal.objectives.length === 0) return 0
    let total = 0
    let completed = 0
    goal.objectives.forEach((obj) => {
      if (obj.assignments) {
        total += obj.assignments.length
        completed += obj.assignments.filter((a) => a.status === "completed").length
      }
    })
    return total > 0 ? Math.round((completed / total) * 100) : 0
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-40" />
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, j) => (
                  <Skeleton key={j} className="h-12" />
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Filter Bar */}
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

          <div className="ml-auto text-sm text-muted-foreground">
            {filteredGoals.length} goals | {filteredObjectives.length} objectives | {filteredAssignments.length} assignments
          </div>
        </CardContent>
      </Card>

      {/* Goals Section */}
      <Collapsible open={goalsExpanded} onOpenChange={setGoalsExpanded}>
        <Card>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                    <Target className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-base">Goals</CardTitle>
                    <p className="text-sm text-muted-foreground">{filteredGoals.length} total</p>
                  </div>
                </div>
                {goalsExpanded ? (
                  <ChevronDown className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
            </CardHeader>
          </CollapsibleTrigger>

          <CollapsibleContent>
            <CardContent className="pt-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Goal</TableHead>
                    <TableHead>PIR</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="text-center">Progress</TableHead>
                    <TableHead className="text-center">Objectives</TableHead>
                    <TableHead className="text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedGoals.map((goal) => (
                    <TableRow key={goal.id}>
                      <TableCell>
                        <div className="font-medium">{goal.title}</div>
                        {goal.description && (
                          <div className="mt-1 text-sm text-muted-foreground max-w-[200px] truncate">
                            {goal.description}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-7 w-7">
                            <AvatarFallback className="bg-primary/10 text-primary text-xs">
                              {getInitials(goal.pirName)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm">{goal.pirName}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        {getGoalStatusBadge(goal.status)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={getGoalProgress(goal)} className="h-2 w-16" />
                          <span className="text-xs text-muted-foreground w-8">
                            {getGoalProgress(goal)}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="secondary">{goal.objectives.length}</Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Button variant="outline" size="sm" onClick={() => setSelectedGoal(goal)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {filteredGoals.length === 0 && (
                <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                  <Target className="mb-3 h-10 w-10 opacity-30" />
                  <p>No goals found</p>
                </div>
              )}

              {goalsTotalPages > 1 && (
                <div className="flex items-center justify-between border-t pt-4 mt-4">
                  <p className="text-sm text-muted-foreground">
                    {(goalsPage - 1) * ITEMS_PER_PAGE + 1}-{Math.min(goalsPage * ITEMS_PER_PAGE, filteredGoals.length)} of {filteredGoals.length}
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setGoalsPage((p) => Math.max(1, p - 1))}
                      disabled={goalsPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm">{goalsPage} / {goalsTotalPages}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setGoalsPage((p) => Math.min(goalsTotalPages, p + 1))}
                      disabled={goalsPage === goalsTotalPages}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Objectives Section */}
      <Collapsible open={objectivesExpanded} onOpenChange={setObjectivesExpanded}>
        <Card>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100">
                    <Flag className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-base">Objectives</CardTitle>
                    <p className="text-sm text-muted-foreground">{filteredObjectives.length} total</p>
                  </div>
                </div>
                {objectivesExpanded ? (
                  <ChevronDown className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
            </CardHeader>
          </CollapsibleTrigger>

          <CollapsibleContent>
            <CardContent className="pt-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Objective</TableHead>
                    <TableHead>Goal</TableHead>
                    <TableHead>PIR</TableHead>
                    <TableHead className="text-center">Assignments</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedObjectives.map((objective) => (
                    <TableRow key={objective.id}>
                      <TableCell>
                        <div className="font-medium">{objective.title}</div>
                        {objective.description && (
                          <div className="mt-1 text-sm text-muted-foreground max-w-[200px] truncate">
                            {objective.description}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{objective.goalTitle}</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-7 w-7">
                            <AvatarFallback className="bg-primary/10 text-primary text-xs">
                              {getInitials(objective.pirName)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm">{objective.pirName}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="secondary">{objective.assignments.length}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {filteredObjectives.length === 0 && (
                <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                  <Flag className="mb-3 h-10 w-10 opacity-30" />
                  <p>No objectives found</p>
                </div>
              )}

              {objectivesTotalPages > 1 && (
                <div className="flex items-center justify-between border-t pt-4 mt-4">
                  <p className="text-sm text-muted-foreground">
                    {(objectivesPage - 1) * ITEMS_PER_PAGE + 1}-{Math.min(objectivesPage * ITEMS_PER_PAGE, filteredObjectives.length)} of {filteredObjectives.length}
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setObjectivesPage((p) => Math.max(1, p - 1))}
                      disabled={objectivesPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm">{objectivesPage} / {objectivesTotalPages}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setObjectivesPage((p) => Math.min(objectivesTotalPages, p + 1))}
                      disabled={objectivesPage === objectivesTotalPages}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Assignments Section */}
      <Collapsible open={assignmentsExpanded} onOpenChange={setAssignmentsExpanded}>
        <Card>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-100">
                    <ClipboardList className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <CardTitle className="text-base">Assignments</CardTitle>
                    <p className="text-sm text-muted-foreground">{filteredAssignments.length} total</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      setShowCreateAssignment(true)
                    }}
                    className="gap-1"
                  >
                    <Plus className="h-4 w-4" />
                    New
                  </Button>
                  {assignmentsExpanded ? (
                    <ChevronDown className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
              </div>
            </CardHeader>
          </CollapsibleTrigger>

          <CollapsibleContent>
            <CardContent className="pt-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Assignment</TableHead>
                    <TableHead>PIR</TableHead>
                    <TableHead className="text-center">Priority</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="text-center">Due Date</TableHead>
                    <TableHead className="text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedAssignments.map((assignment) => (
                    <TableRow key={assignment.id}>
                      <TableCell>
                        <div className="font-medium">{assignment.title}</div>
                        {assignment.description && (
                          <div className="mt-1 text-sm text-muted-foreground max-w-[180px] truncate">
                            {assignment.description}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-7 w-7">
                            <AvatarFallback className="bg-primary/10 text-primary text-xs">
                              {getInitials(assignment.pirName)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm">{assignment.pirName}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        {getPriorityBadge(assignment.priority)}
                      </TableCell>
                      <TableCell className="text-center">
                        {getAssignmentStatusBadge(assignment.status)}
                      </TableCell>
                      <TableCell className="text-center text-sm">
                        {formatDate(assignment.dueDate)}
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex justify-center gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedAssignment(assignment)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {assignment.status !== "completed" && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-emerald-600 hover:bg-emerald-50"
                              onClick={() => handleStatusChange(assignment.id, "completed")}
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {filteredAssignments.length === 0 && (
                <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                  <ClipboardList className="mb-3 h-10 w-10 opacity-30" />
                  <p>No assignments found</p>
                </div>
              )}

              {assignmentsTotalPages > 1 && (
                <div className="flex items-center justify-between border-t pt-4 mt-4">
                  <p className="text-sm text-muted-foreground">
                    {(assignmentsPage - 1) * ITEMS_PER_PAGE + 1}-{Math.min(assignmentsPage * ITEMS_PER_PAGE, filteredAssignments.length)} of {filteredAssignments.length}
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setAssignmentsPage((p) => Math.max(1, p - 1))}
                      disabled={assignmentsPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm">{assignmentsPage} / {assignmentsTotalPages}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setAssignmentsPage((p) => Math.min(assignmentsTotalPages, p + 1))}
                      disabled={assignmentsPage === assignmentsTotalPages}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Goal Detail Modal */}
      <Dialog open={!!selectedGoal} onOpenChange={() => setSelectedGoal(null)}>
        <DialogContent className="max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Goal Details</DialogTitle>
          </DialogHeader>
          {selectedGoal && (
            <div className="space-y-4">
              <div>
                <Label className="text-muted-foreground">Title</Label>
                <p className="font-medium">{selectedGoal.title}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Description</Label>
                <p>{selectedGoal.description || "No description"}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">PIR</Label>
                  <p>{selectedGoal.pirName}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Status</Label>
                  <div className="mt-1">{getGoalStatusBadge(selectedGoal.status)}</div>
                </div>
              </div>
              <div>
                <Label className="text-muted-foreground">Progress</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Progress value={getGoalProgress(selectedGoal)} className="h-2 flex-1" />
                  <span className="text-sm">{getGoalProgress(selectedGoal)}%</span>
                </div>
              </div>
              {selectedGoal.objectives.length > 0 && (
                <div>
                  <Label className="text-muted-foreground">Objectives ({selectedGoal.objectives.length})</Label>
                  <div className="mt-2 space-y-2">
                    {selectedGoal.objectives.map((obj) => (
                      <div key={obj.id} className="rounded-lg border p-3">
                        <div className="font-medium text-sm">{obj.title}</div>
                        {obj.assignments.length > 0 && (
                          <div className="mt-1 text-xs text-muted-foreground">
                            {obj.assignments.filter((a) => a.status === "completed").length}/{obj.assignments.length} assignments completed
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div>
                <Label className="text-muted-foreground">Created</Label>
                <p className="text-sm">{formatDate(selectedGoal.createdAt, "long")}</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedGoal(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assignment Detail Modal */}
      <Dialog open={!!selectedAssignment} onOpenChange={() => setSelectedAssignment(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assignment Details</DialogTitle>
          </DialogHeader>
          {selectedAssignment && (
            <div className="space-y-4">
              <div>
                <Label className="text-muted-foreground">Title</Label>
                <p className="font-medium">{selectedAssignment.title}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Description</Label>
                <p>{selectedAssignment.description || "No description"}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">PIR</Label>
                  <p>{selectedAssignment.pirName}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Due Date</Label>
                  <p>{formatDate(selectedAssignment.dueDate)}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Status</Label>
                  <div className="mt-1">{getAssignmentStatusBadge(selectedAssignment.status)}</div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Priority</Label>
                  <div className="mt-1">{getPriorityBadge(selectedAssignment.priority)}</div>
                </div>
              </div>
              <div>
                <Label className="text-muted-foreground">Created</Label>
                <p className="text-sm">{formatDate(selectedAssignment.createdAt, "long")}</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedAssignment(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Assignment Modal */}
      <CreateAssignmentModal
        open={showCreateAssignment}
        onClose={() => setShowCreateAssignment(false)}
        onCreated={() => {
          setShowCreateAssignment(false)
          loadData()
        }}
        users={users}
      />
    </div>
  )
}

// Create Assignment Modal
interface CreateAssignmentModalProps {
  open: boolean
  onClose: () => void
  onCreated: () => void
  users: PIRUser[]
}

function CreateAssignmentModal({ open, onClose, onCreated, users }: CreateAssignmentModalProps) {
  const { adminUser } = useAuth()
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [pirId, setPirId] = useState("")
  const [priority, setPriority] = useState<Priority>("medium")
  const [dueDate, setDueDate] = useState("")
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title || !pirId) {
      toast.error("Please fill in required fields")
      return
    }

    setSaving(true)
    try {
      await addDoc(collection(db, "assignments"), {
        title,
        description,
        pirId,
        priority,
        dueDate: dueDate ? Timestamp.fromDate(new Date(dueDate)) : null,
        status: "pending",
        createdBy: adminUser?.uid,
        createdAt: serverTimestamp(),
        tenantId: CURRENT_TENANT,
      })
      toast.success("Assignment created")
      onCreated()
      // Reset form
      setTitle("")
      setDescription("")
      setPirId("")
      setPriority("medium")
      setDueDate("")
    } catch (error) {
      console.error("Error creating assignment:", error)
      toast.error("Failed to create assignment")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Assignment</DialogTitle>
          <DialogDescription>Create a new assignment for a PIR</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Assignment title"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Assignment description"
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pirId">Assign to PIR *</Label>
            <Select value={pirId} onValueChange={setPirId}>
              <SelectTrigger>
                <SelectValue placeholder="Select PIR" />
              </SelectTrigger>
              <SelectContent>
                {users.map((u) => (
                  <SelectItem key={u.id} value={u.id}>
                    {u.displayName || u.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select value={priority} onValueChange={(v) => setPriority(v as Priority)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="dueDate">Due Date</Label>
              <Input
                id="dueDate"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Creating..." : "Create Assignment"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default OverviewTab
