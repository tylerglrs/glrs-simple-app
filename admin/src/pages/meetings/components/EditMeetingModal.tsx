import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import {
  db,
  collection,
  doc,
  query,
  where,
  getDocs,
  updateDoc,
  setDoc,
  addDoc,
  deleteDoc,
  serverTimestamp,
  Timestamp,
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
import { Calendar, Clock, MapPin, Video, Users, Pencil, Loader2 } from "lucide-react"
import { type GLRSMeeting } from "./MeetingCard"

interface PIRUser {
  id: string
  displayName?: string
  firstName?: string
  lastName?: string
  email: string
}

interface EditMeetingModalProps {
  open: boolean
  meeting: GLRSMeeting | null
  onClose: () => void
  onSuccess: () => void
}

const DURATION_OPTIONS = [
  { value: "30", label: "30 minutes" },
  { value: "45", label: "45 minutes" },
  { value: "60", label: "1 hour" },
  { value: "90", label: "1.5 hours" },
  { value: "120", label: "2 hours" },
]

const RECURRENCE_OPTIONS = [
  { value: "none", label: "Does not repeat" },
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "biweekly", label: "Bi-weekly" },
  { value: "monthly", label: "Monthly" },
]

const STATUS_OPTIONS = [
  { value: "scheduled", label: "Scheduled" },
  { value: "cancelled", label: "Cancelled" },
  { value: "completed", label: "Completed" },
]

export function EditMeetingModal({ open, meeting, onClose, onSuccess }: EditMeetingModalProps) {
  const { adminUser } = useAuth()
  const [saving, setSaving] = useState(false)
  const [pirUsers, setPirUsers] = useState<PIRUser[]>([])
  const [loadingPirs, setLoadingPirs] = useState(false)

  // Form state
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [date, setDate] = useState("")
  const [time, setTime] = useState("")
  const [duration, setDuration] = useState("60")
  const [location, setLocation] = useState("")
  const [address, setAddress] = useState("")
  const [isVirtual, setIsVirtual] = useState(false)
  const [conferenceUrl, setConferenceUrl] = useState("")
  const [recurring, setRecurring] = useState("none")
  const [maxAttendees, setMaxAttendees] = useState("")
  const [selectedPIRs, setSelectedPIRs] = useState<string[]>([])
  const [originalPIRs, setOriginalPIRs] = useState<string[]>([])
  const [status, setStatus] = useState<"scheduled" | "cancelled" | "completed">("scheduled")

  // Load meeting data when modal opens
  useEffect(() => {
    if (open && meeting) {
      // Populate form with meeting data
      setTitle(meeting.title)
      setDescription(meeting.description || "")

      // Parse date
      const meetingDate = meeting.date instanceof Date ? meeting.date : meeting.date.toDate()
      const year = meetingDate.getFullYear()
      const month = String(meetingDate.getMonth() + 1).padStart(2, "0")
      const day = String(meetingDate.getDate()).padStart(2, "0")
      setDate(`${year}-${month}-${day}`)

      setTime(meeting.time)
      setDuration(String(meeting.duration))
      setLocation(meeting.location)
      setAddress(meeting.address || "")
      setIsVirtual(meeting.isVirtual)
      setConferenceUrl(meeting.conferenceUrl || "")
      setRecurring(meeting.recurring ? (meeting.recurrencePattern || "weekly") : "none")
      setMaxAttendees(meeting.maxAttendees ? String(meeting.maxAttendees) : "")
      const currentPIRs = meeting.invitedPIRs || []
      setSelectedPIRs(currentPIRs)
      setOriginalPIRs(currentPIRs)
      setStatus(meeting.status)

      loadPIRUsers()
    }
  }, [open, meeting])

  const loadPIRUsers = async () => {
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
      setPirUsers(users)
    } catch (error) {
      console.error("Error loading PIR users:", error)
      toast.error("Failed to load PIR users")
    } finally {
      setLoadingPirs(false)
    }
  }

  const handleClose = () => {
    onClose()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!meeting) return

    // Validation
    if (!title.trim()) {
      toast.error("Please enter a meeting title")
      return
    }
    if (!date) {
      toast.error("Please select a date")
      return
    }
    if (!time) {
      toast.error("Please enter a time")
      return
    }
    if (!isVirtual && !location.trim()) {
      toast.error("Please enter a location")
      return
    }
    if (isVirtual && !conferenceUrl.trim()) {
      toast.error("Please enter a conference URL")
      return
    }

    setSaving(true)
    try {
      // Parse the date
      const [year, month, day] = date.split("-").map(Number)
      const meetingDate = new Date(year, month - 1, day)

      const updateData = {
        title: title.trim(),
        description: description.trim(),
        date: Timestamp.fromDate(meetingDate),
        time: time,
        duration: parseInt(duration),
        location: isVirtual ? "Virtual" : location.trim(),
        address: isVirtual ? "" : address.trim(),
        isVirtual,
        conferenceUrl: isVirtual ? conferenceUrl.trim() : "",
        recurring: recurring !== "none",
        recurrencePattern: recurring !== "none" ? recurring : null,
        maxAttendees: maxAttendees ? parseInt(maxAttendees) : null,
        invitedPIRs: selectedPIRs,
        status,
        updatedAt: serverTimestamp(),
        updatedBy: adminUser?.uid || "",
      }

      await updateDoc(doc(db, "meetings", meeting.id), updateData)

      // Handle PIR changes - detect additions and removals
      const addedPIRs = selectedPIRs.filter((id) => !originalPIRs.includes(id))
      const removedPIRs = originalPIRs.filter((id) => !selectedPIRs.includes(id))

      const meetingTimestamp = Timestamp.fromDate(meetingDate)
      const meetingTitle = title.trim()

      // Create RSVP records and send notifications for newly added PIRs
      for (const pirId of addedPIRs) {
        const pir = pirUsers.find((p) => p.id === pirId)
        const pirName = pir ? getPIRDisplayName(pir) : "Unknown PIR"

        // Create RSVP record
        await setDoc(doc(db, "meetingRSVPs", `${meeting.id}_${pirId}`), {
          meetingId: meeting.id,
          pirId,
          pirName,
          status: "pending",
          createdAt: serverTimestamp(),
        })

        // Send notification
        await addDoc(collection(db, "notifications"), {
          userId: pirId,
          type: "meeting_invitation",
          title: "Meeting Invitation",
          message: `You've been invited to: ${meetingTitle}`,
          meetingId: meeting.id,
          meetingTitle,
          meetingDate: meetingTimestamp,
          createdAt: serverTimestamp(),
          read: false,
          tenantId: CURRENT_TENANT,
        })
      }

      // Delete RSVP records for removed PIRs
      for (const pirId of removedPIRs) {
        await deleteDoc(doc(db, "meetingRSVPs", `${meeting.id}_${pirId}`))
      }

      // Build success message
      const messages = ["Meeting updated successfully"]
      if (addedPIRs.length > 0) {
        messages.push(`${addedPIRs.length} new PIR(s) invited`)
      }
      if (removedPIRs.length > 0) {
        messages.push(`${removedPIRs.length} PIR(s) removed`)
      }
      toast.success(messages.join(". "))

      handleClose()
      onSuccess()
    } catch (error) {
      console.error("Error updating meeting:", error)
      toast.error("Failed to update meeting")
    } finally {
      setSaving(false)
    }
  }

  const togglePIR = (pirId: string) => {
    setSelectedPIRs((prev) =>
      prev.includes(pirId)
        ? prev.filter((id) => id !== pirId)
        : [...prev, pirId]
    )
  }

  const selectAllPIRs = () => {
    setSelectedPIRs(pirUsers.map((p) => p.id))
  }

  const deselectAllPIRs = () => {
    setSelectedPIRs([])
  }

  const getPIRDisplayName = (pir: PIRUser): string => {
    if (pir.displayName) return pir.displayName
    if (pir.firstName || pir.lastName) {
      return `${pir.firstName || ""} ${pir.lastName || ""}`.trim()
    }
    return pir.email
  }

  if (!meeting) return null

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pencil className="h-5 w-5 text-[#069494]" />
            Edit Meeting
          </DialogTitle>
          <DialogDescription>
            Update meeting details
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex-1 overflow-hidden flex flex-col">
          <ScrollArea className="flex-1 pr-4">
            <div className="space-y-6 py-4">
              {/* Status */}
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={status} onValueChange={(v) => setStatus(v as typeof status)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="edit-title">Meeting Title *</Label>
                <Input
                  id="edit-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Weekly Group Session"
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What is this meeting about?"
                  rows={3}
                />
              </div>

              {/* Date & Time */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="edit-date" className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Date *
                  </Label>
                  <Input
                    id="edit-date"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-time" className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Time *
                  </Label>
                  <Input
                    id="edit-time"
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                  />
                </div>
              </div>

              {/* Duration & Recurrence */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Duration</Label>
                  <Select value={duration} onValueChange={setDuration}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DURATION_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Recurrence</Label>
                  <Select value={recurring} onValueChange={setRecurring}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {RECURRENCE_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Virtual Toggle */}
              <div className="flex items-center gap-3 rounded-lg border p-4">
                <Checkbox
                  id="edit-isVirtual"
                  checked={isVirtual}
                  onCheckedChange={(checked) => setIsVirtual(checked === true)}
                />
                <div className="flex items-center gap-2">
                  <Video className="h-4 w-4 text-purple-600" />
                  <Label htmlFor="edit-isVirtual" className="cursor-pointer">
                    This is a virtual meeting
                  </Label>
                </div>
              </div>

              {/* Location or Conference URL */}
              {isVirtual ? (
                <div className="space-y-2">
                  <Label htmlFor="edit-conferenceUrl" className="flex items-center gap-2">
                    <Video className="h-4 w-4" />
                    Conference URL *
                  </Label>
                  <Input
                    id="edit-conferenceUrl"
                    value={conferenceUrl}
                    onChange={(e) => setConferenceUrl(e.target.value)}
                    placeholder="https://zoom.us/j/..."
                  />
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-location" className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Location *
                    </Label>
                    <Input
                      id="edit-location"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="e.g., GLRS Office, Room 101"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-address">Address (optional)</Label>
                    <Input
                      id="edit-address"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="e.g., 123 Main St, San Francisco, CA"
                    />
                  </div>
                </div>
              )}

              {/* Max Attendees */}
              <div className="space-y-2">
                <Label htmlFor="edit-maxAttendees" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Maximum Attendees (optional)
                </Label>
                <Input
                  id="edit-maxAttendees"
                  type="number"
                  min="1"
                  value={maxAttendees}
                  onChange={(e) => setMaxAttendees(e.target.value)}
                  placeholder="Leave blank for unlimited"
                />
              </div>

              {/* Invite PIRs */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Invited PIRs ({selectedPIRs.length} selected)
                  </Label>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={selectAllPIRs}
                      disabled={loadingPirs}
                    >
                      Select All
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={deselectAllPIRs}
                      disabled={loadingPirs}
                    >
                      Clear
                    </Button>
                  </div>
                </div>

                <div className="rounded-lg border">
                  <ScrollArea className="h-[200px] p-3">
                    {loadingPirs ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                      </div>
                    ) : pirUsers.length === 0 ? (
                      <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
                        No active PIRs found
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {pirUsers.map((pir) => (
                          <div
                            key={pir.id}
                            className="flex items-center gap-3 rounded-md p-2 hover:bg-muted/50"
                          >
                            <Checkbox
                              id={`edit-pir-${pir.id}`}
                              checked={selectedPIRs.includes(pir.id)}
                              onCheckedChange={() => togglePIR(pir.id)}
                            />
                            <Label
                              htmlFor={`edit-pir-${pir.id}`}
                              className="flex-1 cursor-pointer text-sm"
                            >
                              {getPIRDisplayName(pir)}
                              <span className="ml-2 text-muted-foreground">
                                ({pir.email})
                              </span>
                            </Label>
                          </div>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </div>
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
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default EditMeetingModal
