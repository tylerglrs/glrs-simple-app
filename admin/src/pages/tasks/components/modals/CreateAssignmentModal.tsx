import { useState, useEffect, useMemo } from "react"
import { useAuth } from "@/contexts/AuthContext"
import {
  db,
  collection,
  query,
  where,
  orderBy,
  getDocs,
  addDoc,
  serverTimestamp,
  Timestamp,
} from "@/lib/firebase"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ClipboardList, Loader2, Target, Flag } from "lucide-react"
import { getInitials } from "@/lib/utils"
import { PIRUser, Goal, Objective, Priority } from "../../types"

const CURRENT_TENANT = "full-service"

interface ObjectiveWithGoal extends Objective {
  goalId: string
  goalTitle: string
  pirId: string
  pirName: string
}

interface CreateAssignmentModalProps {
  open: boolean
  onClose: () => void
  onCreated: () => void
  preselectedObjectiveId?: string
}

export function CreateAssignmentModal({
  open,
  onClose,
  onCreated,
  preselectedObjectiveId,
}: CreateAssignmentModalProps) {
  const { adminUser, getDataScope } = useAuth()

  const [users, setUsers] = useState<PIRUser[]>([])
  const [goals, setGoals] = useState<Goal[]>([])
  const [objectives, setObjectives] = useState<ObjectiveWithGoal[]>([])
  const [loading, setLoading] = useState(false)

  const [pirId, setPirId] = useState("")
  const [goalId, setGoalId] = useState("")
  const [objectiveId, setObjectiveId] = useState(preselectedObjectiveId || "")
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [dueDate, setDueDate] = useState("")
  const [priority, setPriority] = useState<Priority>("medium")
  const [saving, setSaving] = useState(false)

  // Load data when modal opens
  useEffect(() => {
    if (open) {
      loadData()
    }
  }, [open])

  const loadData = async () => {
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
      const allObjectives: ObjectiveWithGoal[] = []

      for (const docSnap of goalsSnap.docs) {
        const data = docSnap.data()
        if (data.pirId && allowedPIRIds.has(data.pirId)) {
          const pirName = userMap.get(data.pirId) || "Unknown"

          // Load objectives for this goal
          const objectivesSnap = await getDocs(
            collection(db, "goals", docSnap.id, "objectives")
          )

          const goalObjectives: Objective[] = []
          objectivesSnap.forEach((objDoc) => {
            const objData = objDoc.data()
            const objective: Objective = {
              id: objDoc.id,
              title: objData.title,
              description: objData.description,
              assignments: [],
            }
            goalObjectives.push(objective)

            allObjectives.push({
              ...objective,
              goalId: docSnap.id,
              goalTitle: data.title,
              pirId: data.pirId,
              pirName,
            })
          })

          goalsData.push({
            id: docSnap.id,
            title: data.title,
            description: data.description,
            pirId: data.pirId,
            pirName,
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

      // If preselected objective, set the goal and PIR
      if (preselectedObjectiveId) {
        const obj = allObjectives.find((o) => o.id === preselectedObjectiveId)
        if (obj) {
          setObjectiveId(obj.id)
          setGoalId(obj.goalId)
          setPirId(obj.pirId)
        }
      }
    } catch (error) {
      console.error("Error loading data:", error)
      toast.error("Failed to load data")
    } finally {
      setLoading(false)
    }
  }

  // Filter goals by PIR
  const filteredGoals = useMemo(() => {
    if (!pirId) return goals
    return goals.filter((g) => g.pirId === pirId)
  }, [goals, pirId])

  // Filter objectives by goal
  const filteredObjectives = useMemo(() => {
    if (!goalId) return pirId ? objectives.filter((o) => o.pirId === pirId) : objectives
    return objectives.filter((o) => o.goalId === goalId)
  }, [objectives, goalId, pirId])

  // Cascade reset when parent selection changes
  useEffect(() => {
    if (pirId && goalId) {
      const goal = goals.find((g) => g.id === goalId)
      if (goal && goal.pirId !== pirId) {
        setGoalId("")
        setObjectiveId("")
      }
    }
  }, [pirId])

  useEffect(() => {
    if (goalId && objectiveId) {
      const obj = objectives.find((o) => o.id === objectiveId)
      if (obj && obj.goalId !== goalId) {
        setObjectiveId("")
      }
    }
  }, [goalId])

  // Auto-populate parent when child is selected
  useEffect(() => {
    if (objectiveId) {
      const obj = objectives.find((o) => o.id === objectiveId)
      if (obj) {
        if (!goalId) setGoalId(obj.goalId)
        if (!pirId) setPirId(obj.pirId)
      }
    }
  }, [objectiveId])

  const resetForm = () => {
    setPirId("")
    setGoalId("")
    setObjectiveId(preselectedObjectiveId || "")
    setTitle("")
    setDescription("")
    setDueDate("")
    setPriority("medium")
  }

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
        userId: pirId, // PIR app queries by userId
        goalId: goalId || null,
        objectiveId: objectiveId || null,
        priority,
        dueDate: dueDate ? Timestamp.fromDate(new Date(dueDate)) : null,
        status: "pending",
        createdBy: adminUser?.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        tenantId: CURRENT_TENANT,
      })
      toast.success("Assignment created successfully")
      resetForm()
      onCreated()
    } catch (error) {
      console.error("Error creating assignment:", error)
      toast.error("Failed to create assignment")
    } finally {
      setSaving(false)
    }
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100">
              <ClipboardList className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <DialogTitle>New Assignment</DialogTitle>
              <DialogDescription>Create an assignment for a PIR</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* PIR Selector */}
          <div className="space-y-2">
            <Label htmlFor="pirId">Assign to PIR *</Label>
            <Select value={pirId} onValueChange={setPirId} disabled={loading}>
              <SelectTrigger>
                <SelectValue placeholder={loading ? "Loading..." : "Select PIR"} />
              </SelectTrigger>
              <SelectContent>
                {users.map((u) => (
                  <SelectItem key={u.id} value={u.id}>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-xs bg-primary/10 text-primary">
                          {getInitials(u.displayName || u.email)}
                        </AvatarFallback>
                      </Avatar>
                      <span>{u.displayName || u.email}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Goal Selector (Optional) */}
          <div className="space-y-2">
            <Label htmlFor="goalId">Link to Goal (optional)</Label>
            <Select value={goalId} onValueChange={setGoalId} disabled={loading || !pirId}>
              <SelectTrigger>
                <SelectValue placeholder="Select goal (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">No goal</SelectItem>
                {filteredGoals.map((g) => (
                  <SelectItem key={g.id} value={g.id}>
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4 text-primary" />
                      <span>{g.title}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Objective Selector (Optional) */}
          <div className="space-y-2">
            <Label htmlFor="objectiveId">Link to Objective (optional)</Label>
            <Select
              value={objectiveId}
              onValueChange={setObjectiveId}
              disabled={loading || !pirId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select objective (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">No objective</SelectItem>
                {filteredObjectives.map((o) => (
                  <SelectItem key={o.id} value={o.id}>
                    <div className="flex items-center gap-2">
                      <Flag className="h-4 w-4 text-blue-600" />
                      <span>{o.title}</span>
                      <span className="text-xs text-muted-foreground">({o.goalTitle})</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Assignment Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Complete daily journal entry"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what needs to be done..."
              rows={3}
            />
          </div>

          {/* Due Date & Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dueDate">Due Date</Label>
              <Input
                id="dueDate"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
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
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={handleClose} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving || !pirId || !title}>
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Assignment"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default CreateAssignmentModal
