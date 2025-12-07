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
  CURRENT_TENANT,
} from "@/lib/firebase"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Users, Plus, Loader2, Shield, Calendar } from "lucide-react"

interface CoachUser {
  id: string
  displayName?: string
  firstName?: string
  lastName?: string
  email: string
}

interface CreateGroupModalProps {
  open: boolean
  onClose: () => void
  onSuccess?: () => void
}

const DAYS_OF_WEEK = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
]

const GROUP_TYPES = [
  { value: "open", label: "Open - Anyone can join" },
  { value: "closed", label: "Closed - Approval required" },
  { value: "invite-only", label: "Invite Only - Admin adds members" },
]

export function CreateGroupModal({ open, onClose, onSuccess }: CreateGroupModalProps) {
  const { adminUser } = useAuth()
  const [saving, setSaving] = useState(false)
  const [coaches, setCoaches] = useState<CoachUser[]>([])
  const [loadingCoaches, setLoadingCoaches] = useState(false)

  // Form state
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [type, setType] = useState<"open" | "closed" | "invite-only">("open")
  const [selectedFacilitators, setSelectedFacilitators] = useState<string[]>([])
  const [maxMembers, setMaxMembers] = useState("")
  const [hasMeetingSchedule, setHasMeetingSchedule] = useState(false)
  const [meetingDay, setMeetingDay] = useState("Monday")
  const [meetingTime, setMeetingTime] = useState("18:00")
  const [isRecurring, setIsRecurring] = useState(true)

  // Load coaches/admins when modal opens
  useEffect(() => {
    if (open) {
      loadCoaches()
    }
  }, [open])

  const loadCoaches = async () => {
    setLoadingCoaches(true)
    try {
      // Load coaches and admins who can be facilitators
      const coachesSnap = await getDocs(
        query(
          collection(db, "users"),
          where("tenantId", "==", CURRENT_TENANT),
          where("role", "in", ["coach", "admin", "superadmin", "superadmin1"])
        )
      )

      const users: CoachUser[] = []
      coachesSnap.forEach((doc) => {
        const data = doc.data()
        users.push({
          id: doc.id,
          displayName: data.displayName,
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
        })
      })
      setCoaches(users)
    } catch (error) {
      console.error("Error loading coaches:", error)
      toast.error("Failed to load facilitators")
    } finally {
      setLoadingCoaches(false)
    }
  }

  const resetForm = () => {
    setName("")
    setDescription("")
    setType("open")
    setSelectedFacilitators([])
    setMaxMembers("")
    setHasMeetingSchedule(false)
    setMeetingDay("Monday")
    setMeetingTime("18:00")
    setIsRecurring(true)
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    if (!name.trim()) {
      toast.error("Please enter a group name")
      return
    }
    if (selectedFacilitators.length === 0) {
      toast.error("Please select at least one facilitator")
      return
    }

    setSaving(true)
    try {
      // Get facilitator names for display
      const facilitatorNames = selectedFacilitators.map((id) => {
        const coach = coaches.find((c) => c.id === id)
        return getCoachDisplayName(coach)
      })

      const groupData = {
        name: name.trim(),
        description: description.trim(),
        type,
        facilitators: selectedFacilitators,
        facilitatorNames,
        members: [],
        maxMembers: maxMembers ? parseInt(maxMembers) : null,
        meetingSchedule: hasMeetingSchedule
          ? {
              day: meetingDay,
              time: meetingTime,
              recurring: isRecurring,
            }
          : null,
        isActive: true,
        createdBy: adminUser?.uid || "",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        tenantId: CURRENT_TENANT,
      }

      await addDoc(collection(db, "supportGroups"), groupData)

      toast.success("Support group created successfully")
      handleClose()
      onSuccess?.()
    } catch (error) {
      console.error("Error creating support group:", error)
      toast.error("Failed to create support group")
    } finally {
      setSaving(false)
    }
  }

  const toggleFacilitator = (coachId: string) => {
    setSelectedFacilitators((prev) =>
      prev.includes(coachId)
        ? prev.filter((id) => id !== coachId)
        : [...prev, coachId]
    )
  }

  const getCoachDisplayName = (coach?: CoachUser): string => {
    if (!coach) return "Unknown"
    if (coach.displayName) return coach.displayName
    if (coach.firstName || coach.lastName) {
      return `${coach.firstName || ""} ${coach.lastName || ""}`.trim()
    }
    return coach.email
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5 text-[#069494]" />
            Create Support Group
          </DialogTitle>
          <DialogDescription>
            Create a new support group for PIRs
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex-1 overflow-hidden flex flex-col">
          <ScrollArea className="flex-1 pr-4">
            <div className="space-y-6 py-4">
              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Group Name *</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Weekly Recovery Circle"
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What is this group about?"
                  rows={3}
                />
              </div>

              {/* Group Type */}
              <div className="space-y-2">
                <Label>Group Type</Label>
                <Select value={type} onValueChange={(v) => setType(v as typeof type)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {GROUP_TYPES.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Max Members */}
              <div className="space-y-2">
                <Label htmlFor="maxMembers" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Maximum Members (optional)
                </Label>
                <Input
                  id="maxMembers"
                  type="number"
                  min="1"
                  value={maxMembers}
                  onChange={(e) => setMaxMembers(e.target.value)}
                  placeholder="Leave blank for unlimited"
                />
              </div>

              {/* Facilitators */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Facilitators * ({selectedFacilitators.length} selected)
                </Label>
                <div className="rounded-lg border">
                  <ScrollArea className="h-[150px] p-3">
                    {loadingCoaches ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                      </div>
                    ) : coaches.length === 0 ? (
                      <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
                        No coaches found
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {coaches.map((coach) => (
                          <div
                            key={coach.id}
                            className="flex items-center gap-3 rounded-md p-2 hover:bg-muted/50"
                          >
                            <Checkbox
                              id={`coach-${coach.id}`}
                              checked={selectedFacilitators.includes(coach.id)}
                              onCheckedChange={() => toggleFacilitator(coach.id)}
                            />
                            <Label
                              htmlFor={`coach-${coach.id}`}
                              className="flex-1 cursor-pointer text-sm"
                            >
                              {getCoachDisplayName(coach)}
                              <span className="ml-2 text-muted-foreground">
                                ({coach.email})
                              </span>
                            </Label>
                          </div>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </div>
              </div>

              {/* Meeting Schedule */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 rounded-lg border p-4">
                  <Checkbox
                    id="hasMeetingSchedule"
                    checked={hasMeetingSchedule}
                    onCheckedChange={(checked) => setHasMeetingSchedule(checked === true)}
                  />
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-purple-600" />
                    <Label htmlFor="hasMeetingSchedule" className="cursor-pointer">
                      Set regular meeting schedule
                    </Label>
                  </div>
                </div>

                {hasMeetingSchedule && (
                  <div className="ml-4 space-y-4 rounded-lg border p-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Day</Label>
                        <Select value={meetingDay} onValueChange={setMeetingDay}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {DAYS_OF_WEEK.map((day) => (
                              <SelectItem key={day} value={day}>
                                {day}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Time</Label>
                        <Input
                          type="time"
                          value={meetingTime}
                          onChange={(e) => setMeetingTime(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Checkbox
                        id="isRecurring"
                        checked={isRecurring}
                        onCheckedChange={(checked) => setIsRecurring(checked === true)}
                      />
                      <Label htmlFor="isRecurring" className="cursor-pointer">
                        Recurring weekly
                      </Label>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </ScrollArea>

          <DialogFooter className="border-t pt-4 mt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={saving}
              className="bg-[#069494] hover:bg-[#057a7a]"
            >
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Group"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default CreateGroupModal
