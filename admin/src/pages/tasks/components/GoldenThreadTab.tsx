import { useState, useEffect, useMemo, useCallback } from "react"
import { useAuth } from "@/contexts/AuthContext"
import {
  db,
  collection,
  query,
  where,
  orderBy,
  getDocs,
} from "@/lib/firebase"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Skeleton } from "@/components/ui/skeleton"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Target,
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  Circle,
  ClipboardList,
  Flag,
  Link,
} from "lucide-react"
import { formatDate, getInitials } from "@/lib/utils"
import { Goal, GoalStatus, PIRUser, Assignment, AssignmentStatus } from "../types"

const CURRENT_TENANT = "full-service"

interface GoldenThreadTabProps {
  searchQuery: string
}

function getStatusBadge(status: GoalStatus) {
  const styles: Record<GoalStatus, { className: string; label: string }> = {
    active: { className: "bg-emerald-100 text-emerald-700", label: "Active" },
    completed: { className: "bg-blue-100 text-blue-700", label: "Completed" },
    paused: { className: "bg-gray-100 text-gray-600", label: "Paused" },
  }
  const s = styles[status] || styles.active
  return <Badge variant="secondary" className={s.className}>{s.label}</Badge>
}

function getAssignmentStatusIcon(status: AssignmentStatus) {
  if (status === "completed") return <CheckCircle2 className="h-4 w-4 text-emerald-500" />
  if (status === "in-progress") return <Circle className="h-4 w-4 text-blue-500 fill-blue-100" />
  if (status === "overdue") return <Circle className="h-4 w-4 text-red-500" />
  return <Circle className="h-4 w-4 text-gray-400" />
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

export function GoldenThreadTab({ searchQuery }: GoldenThreadTabProps) {
  const { adminUser, getDataScope } = useAuth()

  const [goals, setGoals] = useState<Goal[]>([])
  const [users, setUsers] = useState<PIRUser[]>([])
  const [loading, setLoading] = useState(true)

  const [filterPIR, setFilterPIR] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")
  const [expandedGoals, setExpandedGoals] = useState<Set<string>>(new Set())
  const [expandedObjectives, setExpandedObjectives] = useState<Set<string>>(new Set())

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

      // Load goals with objectives and assignments
      const goalsSnap = await getDocs(
        query(collection(db, "goals"), orderBy("createdAt", "desc"))
      )

      const goalsData: Goal[] = []
      for (const docSnap of goalsSnap.docs) {
        const data = docSnap.data()
        if (data.pirId && allowedPIRIds.has(data.pirId)) {
          // Load objectives for this goal
          const objectivesSnap = await getDocs(
            collection(db, "goals", docSnap.id, "objectives")
          )

          const objectives = []
          for (const objDoc of objectivesSnap.docs) {
            const objData = objDoc.data()
            // Load assignments for this objective
            const assignmentsSnap = await getDocs(
              query(
                collection(db, "assignments"),
                where("objectiveId", "==", objDoc.id)
              )
            )
            const assignments: Assignment[] = assignmentsSnap.docs.map((d) => ({
              id: d.id,
              ...d.data(),
            })) as Assignment[]

            objectives.push({
              id: objDoc.id,
              title: objData.title,
              description: objData.description,
              assignments,
            })
          }

          goalsData.push({
            id: docSnap.id,
            title: data.title,
            description: data.description,
            pirId: data.pirId,
            pirName: userMap.get(data.pirId) || "Unknown",
            status: data.status || "active",
            objectives,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
            targetDate: data.targetDate,
            tenantId: data.tenantId,
          })
        }
      }
      setGoals(goalsData)
    } catch (error) {
      console.error("Error loading goals:", error)
      toast.error("Failed to load goals")
    } finally {
      setLoading(false)
    }
  }, [adminUser, getDataScope])

  useEffect(() => {
    loadData()
  }, [loadData])

  const filteredGoals = useMemo(() => {
    let filtered = goals

    if (filterPIR !== "all") {
      filtered = filtered.filter((g) => g.pirId === filterPIR)
    }
    if (filterStatus !== "all") {
      filtered = filtered.filter((g) => g.status === filterStatus)
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (g) =>
          g.title?.toLowerCase().includes(q) ||
          g.description?.toLowerCase().includes(q) ||
          g.pirName?.toLowerCase().includes(q) ||
          g.objectives.some(
            (o) =>
              o.title?.toLowerCase().includes(q) ||
              o.assignments.some((a) => a.title?.toLowerCase().includes(q))
          )
      )
    }
    return filtered
  }, [goals, filterPIR, filterStatus, searchQuery])

  const toggleGoal = (goalId: string) => {
    const newExpanded = new Set(expandedGoals)
    if (newExpanded.has(goalId)) {
      newExpanded.delete(goalId)
    } else {
      newExpanded.add(goalId)
    }
    setExpandedGoals(newExpanded)
  }

  const toggleObjective = (objectiveId: string) => {
    const newExpanded = new Set(expandedObjectives)
    if (newExpanded.has(objectiveId)) {
      newExpanded.delete(objectiveId)
    } else {
      newExpanded.add(objectiveId)
    }
    setExpandedObjectives(newExpanded)
  }

  const expandAll = () => {
    const allGoalIds = new Set(filteredGoals.map((g) => g.id))
    const allObjectiveIds = new Set(
      filteredGoals.flatMap((g) => g.objectives.map((o) => o.id))
    )
    setExpandedGoals(allGoalIds)
    setExpandedObjectives(allObjectiveIds)
  }

  const collapseAll = () => {
    setExpandedGoals(new Set())
    setExpandedObjectives(new Set())
  }

  // Calculate statistics
  const stats = useMemo(() => {
    const totalGoals = filteredGoals.length
    const activeGoals = filteredGoals.filter((g) => g.status === "active").length
    const totalObjectives = filteredGoals.reduce((sum, g) => sum + g.objectives.length, 0)
    const totalAssignments = filteredGoals.reduce(
      (sum, g) => sum + g.objectives.reduce((s, o) => s + o.assignments.length, 0),
      0
    )
    const completedAssignments = filteredGoals.reduce(
      (sum, g) =>
        sum +
        g.objectives.reduce(
          (s, o) => s + o.assignments.filter((a) => a.status === "completed").length,
          0
        ),
      0
    )
    return { totalGoals, activeGoals, totalObjectives, totalAssignments, completedAssignments }
  }, [filteredGoals])

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex gap-3">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Target className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.totalGoals}</p>
              <p className="text-xs text-muted-foreground">Goals ({stats.activeGoals} active)</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
              <Flag className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.totalObjectives}</p>
              <p className="text-xs text-muted-foreground">Objectives</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100">
              <ClipboardList className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.totalAssignments}</p>
              <p className="text-xs text-muted-foreground">Assignments</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {stats.totalAssignments > 0
                  ? Math.round((stats.completedAssignments / stats.totalAssignments) * 100)
                  : 0}%
              </p>
              <p className="text-xs text-muted-foreground">Completed</p>
            </div>
          </CardContent>
        </Card>
      </div>

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

          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="paused">Paused</SelectItem>
            </SelectContent>
          </Select>

          <div className="ml-auto flex gap-2">
            <Button variant="outline" size="sm" onClick={expandAll}>
              Expand All
            </Button>
            <Button variant="outline" size="sm" onClick={collapseAll}>
              Collapse All
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Goals Hierarchy */}
      <div className="space-y-4">
        {filteredGoals.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Link className="mb-4 h-12 w-12 opacity-30" />
              <p>No goals found</p>
              <p className="text-sm">Create goals to build your Golden Thread</p>
            </CardContent>
          </Card>
        ) : (
          filteredGoals.map((goal) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              isExpanded={expandedGoals.has(goal.id)}
              expandedObjectives={expandedObjectives}
              onToggle={() => toggleGoal(goal.id)}
              onToggleObjective={toggleObjective}
            />
          ))
        )}
      </div>
    </div>
  )
}

// Goal Card Component
function GoalCard({
  goal,
  isExpanded,
  expandedObjectives,
  onToggle,
  onToggleObjective,
}: {
  goal: Goal
  isExpanded: boolean
  expandedObjectives: Set<string>
  onToggle: () => void
  onToggleObjective: (id: string) => void
}) {
  const totalAssignments = goal.objectives.reduce((sum, o) => sum + o.assignments.length, 0)
  const completedAssignments = goal.objectives.reduce(
    (sum, o) => sum + o.assignments.filter((a) => a.status === "completed").length,
    0
  )
  const progress = totalAssignments > 0 ? (completedAssignments / totalAssignments) * 100 : 0

  return (
    <Card>
      <Collapsible open={isExpanded} onOpenChange={onToggle}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <Target className="h-5 w-5 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <CardTitle className="text-base">{goal.title}</CardTitle>
                  {getStatusBadge(goal.status)}
                </div>
                <div className="mt-1 flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Avatar className="h-5 w-5">
                      <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
                        {getInitials(goal.pirName)}
                      </AvatarFallback>
                    </Avatar>
                    <span>{goal.pirName}</span>
                  </div>
                  <span>{goal.objectives.length} objectives</span>
                  <span>{totalAssignments} assignments</span>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <Progress value={progress} className="h-2 flex-1" />
                  <span className="text-xs text-muted-foreground w-12 text-right">
                    {Math.round(progress)}%
                  </span>
                </div>
              </div>
              <Button variant="ghost" size="icon">
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </Button>
            </div>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="pt-0">
            {goal.description && (
              <p className="mb-4 text-sm text-muted-foreground pl-[52px]">
                {goal.description}
              </p>
            )}

            {goal.objectives.length === 0 ? (
              <div className="ml-[52px] rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground">
                No objectives yet
              </div>
            ) : (
              <div className="ml-[52px] space-y-3">
                {goal.objectives.map((objective) => (
                  <ObjectiveCard
                    key={objective.id}
                    objective={objective}
                    isExpanded={expandedObjectives.has(objective.id)}
                    onToggle={() => onToggleObjective(objective.id)}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  )
}

// Objective Card Component
function ObjectiveCard({
  objective,
  isExpanded,
  onToggle,
}: {
  objective: { id: string; title: string; description?: string; assignments: Assignment[] }
  isExpanded: boolean
  onToggle: () => void
}) {
  const completedCount = objective.assignments.filter((a) => a.status === "completed").length
  const progress =
    objective.assignments.length > 0
      ? (completedCount / objective.assignments.length) * 100
      : 0

  return (
    <div className="rounded-lg border">
      <Collapsible open={isExpanded} onOpenChange={onToggle}>
        <CollapsibleTrigger asChild>
          <div className="flex items-center gap-3 p-3 cursor-pointer hover:bg-muted/50 transition-colors">
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-blue-100">
              <Flag className="h-4 w-4 text-blue-600" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-medium text-sm">{objective.title}</div>
              <div className="flex items-center gap-2 mt-1">
                <Progress value={progress} className="h-1.5 flex-1 max-w-[100px]" />
                <span className="text-xs text-muted-foreground">
                  {completedCount}/{objective.assignments.length}
                </span>
              </div>
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              {isExpanded ? (
                <ChevronDown className="h-3 w-3" />
              ) : (
                <ChevronRight className="h-3 w-3" />
              )}
            </Button>
          </div>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="border-t px-3 pb-3">
            {objective.description && (
              <p className="text-xs text-muted-foreground py-2 pl-11">
                {objective.description}
              </p>
            )}

            {objective.assignments.length === 0 ? (
              <div className="ml-11 mt-2 rounded border border-dashed p-3 text-center text-xs text-muted-foreground">
                No assignments yet
              </div>
            ) : (
              <div className="ml-11 mt-2 space-y-2">
                {objective.assignments.map((assignment) => (
                  <div
                    key={assignment.id}
                    className="flex items-center gap-2 rounded-md bg-muted/50 px-3 py-2"
                  >
                    {getAssignmentStatusIcon(assignment.status)}
                    <div className="min-w-0 flex-1">
                      <div className="text-sm truncate">{assignment.title}</div>
                      {assignment.dueDate && (
                        <div className="text-xs text-muted-foreground">
                          Due: {formatDate(assignment.dueDate)}
                        </div>
                      )}
                    </div>
                    {getAssignmentStatusBadge(assignment.status)}
                  </div>
                ))}
              </div>
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  )
}

export default GoldenThreadTab
