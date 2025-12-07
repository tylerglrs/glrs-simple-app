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
import { Flag, Loader2, Target } from "lucide-react"
import { getInitials } from "@/lib/utils"
import { PIRUser, Goal } from "../../types"

const CURRENT_TENANT = "full-service"

interface CreateObjectiveModalProps {
  open: boolean
  onClose: () => void
  onCreated: () => void
  preselectedGoalId?: string
}

export function CreateObjectiveModal({
  open,
  onClose,
  onCreated,
  preselectedGoalId,
}: CreateObjectiveModalProps) {
  const { adminUser, getDataScope } = useAuth()

  const [users, setUsers] = useState<PIRUser[]>([])
  const [goals, setGoals] = useState<Goal[]>([])
  const [loading, setLoading] = useState(false)

  const [pirId, setPirId] = useState("")
  const [goalId, setGoalId] = useState(preselectedGoalId || "")
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [saving, setSaving] = useState(false)

  // Load data when modal opens
  useEffect(() => {
    if (open) {
      loadData()
      if (preselectedGoalId) {
        setGoalId(preselectedGoalId)
      }
    }
  }, [open, preselectedGoalId])

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

      // Load goals
      const goalsSnap = await getDocs(
        query(collection(db, "goals"), orderBy("createdAt", "desc"))
      )

      const goalsData: Goal[] = []
      goalsSnap.forEach((docSnap) => {
        const data = docSnap.data()
        if (data.pirId && allowedPIRIds.has(data.pirId)) {
          goalsData.push({
            id: docSnap.id,
            title: data.title,
            description: data.description,
            pirId: data.pirId,
            pirName: userMap.get(data.pirId) || "Unknown",
            status: data.status || "active",
            objectives: [],
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
            targetDate: data.targetDate,
            tenantId: data.tenantId,
          })
        }
      })
      setGoals(goalsData)

      // If preselected goal, set the PIR
      if (preselectedGoalId) {
        const goal = goalsData.find((g) => g.id === preselectedGoalId)
        if (goal) {
          setPirId(goal.pirId)
        }
      }
    } catch (error) {
      console.error("Error loading data:", error)
      toast.error("Failed to load data")
    } finally {
      setLoading(false)
    }
  }

  // Filter goals by selected PIR
  const filteredGoals = useMemo(() => {
    if (!pirId) return goals
    return goals.filter((g) => g.pirId === pirId)
  }, [goals, pirId])

  // When PIR changes, reset goal if it doesn't belong to new PIR
  useEffect(() => {
    if (pirId && goalId) {
      const goal = goals.find((g) => g.id === goalId)
      if (goal && goal.pirId !== pirId) {
        setGoalId("")
      }
    }
  }, [pirId, goalId, goals])

  // When goal changes, set PIR automatically
  useEffect(() => {
    if (goalId && !pirId) {
      const goal = goals.find((g) => g.id === goalId)
      if (goal) {
        setPirId(goal.pirId)
      }
    }
  }, [goalId, pirId, goals])

  const resetForm = () => {
    setPirId("")
    setGoalId(preselectedGoalId || "")
    setTitle("")
    setDescription("")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title || !goalId) {
      toast.error("Please fill in required fields")
      return
    }

    setSaving(true)
    try {
      // Create objective in TOP-LEVEL objectives collection (PIR app queries this)
      await addDoc(collection(db, "objectives"), {
        title,
        description,
        goalId, // Link to parent goal
        pirId, // For admin queries
        userId: pirId, // PIR app queries by userId
        status: "active",
        createdBy: adminUser?.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        tenantId: CURRENT_TENANT,
      })
      toast.success("Objective created successfully")
      resetForm()
      onCreated()
    } catch (error) {
      console.error("Error creating objective:", error)
      toast.error("Failed to create objective")
    } finally {
      setSaving(false)
    }
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  const selectedGoal = goals.find((g) => g.id === goalId)

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
              <Flag className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <DialogTitle>New Objective</DialogTitle>
              <DialogDescription>Create an objective under a goal</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="pirId">Filter by PIR</Label>
            <Select value={pirId} onValueChange={setPirId} disabled={loading}>
              <SelectTrigger>
                <SelectValue placeholder={loading ? "Loading..." : "All PIRs"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All PIRs</SelectItem>
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

          <div className="space-y-2">
            <Label htmlFor="goalId">Select Goal *</Label>
            <Select value={goalId} onValueChange={setGoalId} disabled={loading}>
              <SelectTrigger>
                <SelectValue placeholder={loading ? "Loading goals..." : "Select a goal"} />
              </SelectTrigger>
              <SelectContent>
                {filteredGoals.length === 0 ? (
                  <div className="p-2 text-sm text-muted-foreground text-center">
                    No goals found
                  </div>
                ) : (
                  filteredGoals.map((g) => (
                    <SelectItem key={g.id} value={g.id}>
                      <div className="flex items-center gap-2">
                        <Target className="h-4 w-4 text-primary" />
                        <span>{g.title}</span>
                        <span className="text-xs text-muted-foreground">({g.pirName})</span>
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            {selectedGoal && (
              <p className="text-xs text-muted-foreground">
                Goal: {selectedGoal.title} (PIR: {selectedGoal.pirName})
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Objective Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Complete weekly therapy sessions"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what this objective entails..."
              rows={3}
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={handleClose} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving || !goalId || !title}>
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Objective"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default CreateObjectiveModal
