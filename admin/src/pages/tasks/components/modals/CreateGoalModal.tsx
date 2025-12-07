import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import {
  db,
  collection,
  query,
  where,
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
import { Target, Loader2 } from "lucide-react"
import { getInitials } from "@/lib/utils"
import { PIRUser, GoalStatus } from "../../types"

const CURRENT_TENANT = "full-service"

interface CreateGoalModalProps {
  open: boolean
  onClose: () => void
  onCreated: () => void
}

export function CreateGoalModal({ open, onClose, onCreated }: CreateGoalModalProps) {
  const { adminUser, getDataScope } = useAuth()

  const [users, setUsers] = useState<PIRUser[]>([])
  const [loadingUsers, setLoadingUsers] = useState(false)

  const [pirId, setPirId] = useState("")
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [targetDate, setTargetDate] = useState("")
  const [status, setStatus] = useState<GoalStatus>("active")
  const [saving, setSaving] = useState(false)

  // Load PIRs when modal opens
  useEffect(() => {
    if (open && users.length === 0) {
      loadUsers()
    }
  }, [open])

  const loadUsers = async () => {
    if (!adminUser) return

    setLoadingUsers(true)
    const scope = getDataScope()

    try {
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
      })
      setUsers(usersData)
    } catch (error) {
      console.error("Error loading users:", error)
      toast.error("Failed to load PIRs")
    } finally {
      setLoadingUsers(false)
    }
  }

  const resetForm = () => {
    setPirId("")
    setTitle("")
    setDescription("")
    setTargetDate("")
    setStatus("active")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title || !pirId) {
      toast.error("Please fill in required fields")
      return
    }

    setSaving(true)
    try {
      const dueDateValue = targetDate ? Timestamp.fromDate(new Date(targetDate)) : null
      await addDoc(collection(db, "goals"), {
        title,
        description,
        pirId,
        userId: pirId, // PIR app queries by userId
        status,
        progress: 0, // Initial progress
        dueDate: dueDateValue, // PIR app uses dueDate
        targetDate: dueDateValue, // Keep for admin compatibility
        createdBy: adminUser?.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        tenantId: CURRENT_TENANT,
      })
      toast.success("Goal created successfully")
      resetForm()
      onCreated()
    } catch (error) {
      console.error("Error creating goal:", error)
      toast.error("Failed to create goal")
    } finally {
      setSaving(false)
    }
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  const selectedUser = users.find((u) => u.id === pirId)

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Target className="h-5 w-5 text-primary" />
            </div>
            <div>
              <DialogTitle>New Goal</DialogTitle>
              <DialogDescription>Create a new goal for a PIR</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="pirId">Assign to PIR *</Label>
            <Select value={pirId} onValueChange={setPirId} disabled={loadingUsers}>
              <SelectTrigger>
                <SelectValue placeholder={loadingUsers ? "Loading PIRs..." : "Select PIR"} />
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
            {selectedUser && (
              <p className="text-xs text-muted-foreground">
                Selected: {selectedUser.displayName || selectedUser.email}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Goal Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Maintain 90 days of sobriety"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the goal and what success looks like..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="targetDate">Target Date</Label>
              <Input
                id="targetDate"
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as GoalStatus)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="paused">Paused</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
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
                "Create Goal"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default CreateGoalModal
