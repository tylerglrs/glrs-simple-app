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
import { Card, CardContent } from "@/components/ui/card"
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
} from "lucide-react"
import { formatDate, getInitials } from "@/lib/utils"
import { Goal, GoalStatus, PIRUser, Assignment } from "../types"

const CURRENT_TENANT = "full-service"

interface GoalsTabProps {
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

export function GoalsTab({ searchQuery }: GoalsTabProps) {
  const { adminUser, getDataScope } = useAuth()

  const [goals, setGoals] = useState<Goal[]>([])
  const [users, setUsers] = useState<PIRUser[]>([])
  const [loading, setLoading] = useState(true)

  const [filterPIR, setFilterPIR] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")
  const [expandedGoals, setExpandedGoals] = useState<Set<string>>(new Set())

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

      // Load goals
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
          g.pirName?.toLowerCase().includes(q)
      )
    }
    return filtered
  }, [goals, filterPIR, filterStatus, searchQuery])

  const toggleExpand = (goalId: string) => {
    const newExpanded = new Set(expandedGoals)
    if (newExpanded.has(goalId)) {
      newExpanded.delete(goalId)
    } else {
      newExpanded.add(goalId)
    }
    setExpandedGoals(newExpanded)
  }

  const getProgressPercent = (goal: Goal) => {
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
      <div className="space-y-4">
        <div className="flex gap-3">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
          <Skeleton className="ml-auto h-10 w-32" />
        </div>
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <Skeleton className="h-10 w-10 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-48" />
                  <Skeleton className="h-4 w-32" />
                </div>
                <Skeleton className="h-8 w-24" />
              </div>
            </CardContent>
          </Card>
        ))}
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

{/* "New Goal" button removed - use Quick Actions in Tasks page header */}
        </CardContent>
      </Card>

      {/* Goals List */}
      <div className="space-y-3">
        {filteredGoals.map((goal) => {
          const progress = getProgressPercent(goal)
          const isExpanded = expandedGoals.has(goal.id)

          return (
            <Collapsible key={goal.id} open={isExpanded} onOpenChange={() => toggleExpand(goal.id)}>
              <Card>
                <CollapsibleTrigger asChild>
                  <CardContent className="cursor-pointer p-4 hover:bg-muted/50">
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <Target className="h-5 w-5 text-primary" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{goal.title}</h3>
                          {getStatusBadge(goal.status)}
                        </div>
                        <div className="mt-1 flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Avatar className="h-5 w-5">
                              <AvatarFallback className="text-[10px]">
                                {getInitials(goal.pirName)}
                              </AvatarFallback>
                            </Avatar>
                            <span>{goal.pirName}</span>
                          </div>
                          {goal.objectives.length > 0 && (
                            <span>
                              {goal.objectives.length} objective
                              {goal.objectives.length !== 1 ? "s" : ""}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="w-32">
                          <div className="mb-1 flex justify-between text-xs">
                            <span>Progress</span>
                            <span className="font-medium">{progress}%</span>
                          </div>
                          <Progress value={progress} className="h-2" />
                        </div>
                        {isExpanded ? (
                          <ChevronDown className="h-5 w-5 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>
                    </div>
                  </CardContent>
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <div className="border-t px-4 pb-4">
                    {goal.description && (
                      <p className="mt-4 text-sm text-muted-foreground">{goal.description}</p>
                    )}

                    {goal.objectives.length > 0 ? (
                      <div className="mt-4 space-y-3">
                        {goal.objectives.map((obj) => (
                          <div
                            key={obj.id}
                            className="rounded-lg border bg-muted/30 p-3"
                          >
                            <h4 className="font-medium">{obj.title}</h4>
                            {obj.assignments.length > 0 && (
                              <div className="mt-2 space-y-1">
                                {obj.assignments.map((assignment) => (
                                  <div
                                    key={assignment.id}
                                    className="flex items-center gap-2 text-sm"
                                  >
                                    {assignment.status === "completed" ? (
                                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                    ) : (
                                      <Circle className="h-4 w-4 text-muted-foreground" />
                                    )}
                                    <span
                                      className={
                                        assignment.status === "completed"
                                          ? "text-muted-foreground line-through"
                                          : ""
                                      }
                                    >
                                      {assignment.title}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="mt-4 text-sm text-muted-foreground">
                        No objectives defined yet
                      </p>
                    )}

                    <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                      <span>Created {formatDate(goal.createdAt, "relative")}</span>
                      {goal.targetDate && (
                        <>
                          <span>|</span>
                          <span>Target: {formatDate(goal.targetDate)}</span>
                        </>
                      )}
                    </div>
                  </div>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          )
        })}

        {filteredGoals.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Target className="mb-4 h-12 w-12 opacity-30" />
              <p>No goals found</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
