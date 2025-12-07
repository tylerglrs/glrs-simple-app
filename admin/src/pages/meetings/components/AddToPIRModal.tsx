import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import {
  db,
  collection,
  doc,
  query,
  where,
  getDocs,
  setDoc,
  addDoc,
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
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Calendar,
  Clock,
  MapPin,
  Video,
  UserPlus,
  Users,
  Loader2,
  CheckCircle,
} from "lucide-react"
import { type CalendarMeeting, type MeetingType } from "./MeetingsCalendar"

interface PIRUser {
  id: string
  displayName?: string
  firstName?: string
  lastName?: string
  email: string
}

interface AddToPIRModalProps {
  open: boolean
  onClose: () => void
  meeting: CalendarMeeting | null
  onSuccess?: () => void
}

const TYPE_LABELS: Record<MeetingType, string> = {
  glrs: "GLRS",
  aa: "AA",
  na: "NA",
  all: "Meeting",
}

function getMeetingType(meeting: CalendarMeeting): MeetingType {
  if (meeting.type === "glrs") return "glrs"
  if (meeting.source?.toLowerCase().includes("na") || meeting.type === "na") return "na"
  return "aa"
}

function getMeetingDate(meeting: CalendarMeeting): Date {
  if (meeting.date instanceof Date) return meeting.date
  return meeting.date.toDate()
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

export function AddToPIRModal({ open, onClose, meeting, onSuccess }: AddToPIRModalProps) {
  const { adminUser } = useAuth()
  const [pirUsers, setPirUsers] = useState<PIRUser[]>([])
  const [loadingPirs, setLoadingPirs] = useState(false)
  const [saving, setSaving] = useState(false)

  // Selection mode
  const [selectionMode, setSelectionMode] = useState<"single" | "multiple">("single")
  const [selectedPIR, setSelectedPIR] = useState("")
  const [selectedPIRs, setSelectedPIRs] = useState<string[]>([])

  const [successCount, setSuccessCount] = useState(0)

  // Load PIR users when modal opens
  useEffect(() => {
    if (open) {
      loadPIRUsers()
      setSelectedPIR("")
      setSelectedPIRs([])
      setSuccessCount(0)
    }
  }, [open])

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
    setSelectedPIR("")
    setSelectedPIRs([])
    setSuccessCount(0)
    onClose()
  }

  const getPIRDisplayName = (pir: PIRUser): string => {
    if (pir.displayName) return pir.displayName
    if (pir.firstName || pir.lastName) {
      return `${pir.firstName || ""} ${pir.lastName || ""}`.trim()
    }
    return pir.email
  }

  const addMeetingToPIR = async (pirId: string) => {
    if (!meeting) return

    const pir = pirUsers.find((p) => p.id === pirId)
    if (!pir) return

    const meetingDate = getMeetingDate(meeting)
    const meetingType = getMeetingType(meeting)

    // Save meeting to PIR's schedule
    await setDoc(doc(db, `users/${pirId}/savedMeetings`, meeting.id), {
      meetingId: meeting.id,
      meetingTitle: meeting.title,
      meetingDate: Timestamp.fromDate(meetingDate),
      meetingTime: meeting.time,
      meetingType: meetingType,
      meetingSource: meeting.source || "glrs",
      isVirtual: meeting.isVirtual || false,
      location: meeting.location || "",
      addedBy: adminUser?.uid || "",
      addedByName: adminUser?.displayName || adminUser?.email || "",
      addedAt: serverTimestamp(),
    })

    // Send notification to PIR
    await addDoc(collection(db, "notifications"), {
      userId: pirId,
      type: "meeting_assigned",
      title: "Meeting Added to Schedule",
      message: `"${meeting.title}" has been added to your schedule`,
      meetingId: meeting.id,
      meetingTitle: meeting.title,
      meetingDate: Timestamp.fromDate(meetingDate),
      createdAt: serverTimestamp(),
      read: false,
      tenantId: CURRENT_TENANT,
    })
  }

  const handleSubmit = async () => {
    if (!meeting) return

    const pirsToAdd = selectionMode === "single" ? [selectedPIR] : selectedPIRs
    if (pirsToAdd.length === 0 || (selectionMode === "single" && !selectedPIR)) {
      toast.error("Please select at least one PIR")
      return
    }

    setSaving(true)
    let successfulAdds = 0

    try {
      for (const pirId of pirsToAdd) {
        try {
          await addMeetingToPIR(pirId)
          successfulAdds++
        } catch (err) {
          console.error(`Error adding to PIR ${pirId}:`, err)
        }
      }

      if (successfulAdds === pirsToAdd.length) {
        toast.success(
          successfulAdds === 1
            ? "Meeting added to PIR schedule"
            : `Meeting added to ${successfulAdds} PIR schedules`
        )
        setSuccessCount(successfulAdds)
        setTimeout(() => {
          handleClose()
          onSuccess?.()
        }, 1500)
      } else if (successfulAdds > 0) {
        toast.warning(`Added to ${successfulAdds} of ${pirsToAdd.length} PIRs`)
        setSuccessCount(successfulAdds)
      } else {
        toast.error("Failed to add meeting to any PIR")
      }
    } catch (error) {
      console.error("Error adding meeting to PIR:", error)
      toast.error("Failed to add meeting to schedule")
    } finally {
      setSaving(false)
    }
  }

  const togglePIR = (pirId: string) => {
    setSelectedPIRs((prev) =>
      prev.includes(pirId) ? prev.filter((id) => id !== pirId) : [...prev, pirId]
    )
  }

  const selectAllPIRs = () => {
    setSelectedPIRs(pirUsers.map((p) => p.id))
  }

  const deselectAllPIRs = () => {
    setSelectedPIRs([])
  }

  if (!meeting) return null

  const meetingDate = getMeetingDate(meeting)
  const meetingType = getMeetingType(meeting)

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <DialogContent className="max-w-md max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-[#069494]" />
            Add to PIR Schedule
          </DialogTitle>
          <DialogDescription>
            Add this meeting to a PIR's personal schedule
          </DialogDescription>
        </DialogHeader>

        {/* Success State */}
        {successCount > 0 ? (
          <div className="flex flex-col items-center justify-center py-8">
            <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
            <p className="text-lg font-medium text-green-600">
              Added to {successCount} PIR{successCount !== 1 ? "s" : ""}
            </p>
          </div>
        ) : (
          <>
            {/* Meeting Info */}
            <div className="rounded-lg border bg-muted/30 p-4 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-medium">{meeting.title}</h3>
                <Badge>{TYPE_LABELS[meetingType]}</Badge>
              </div>

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>{formatDate(meetingDate)}</span>
              </div>

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>{meeting.time}</span>
              </div>

              {meeting.location && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  {meeting.isVirtual ? (
                    <Video className="h-4 w-4 text-purple-600" />
                  ) : (
                    <MapPin className="h-4 w-4" />
                  )}
                  <span className="truncate">
                    {meeting.isVirtual ? "Virtual Meeting" : meeting.location}
                  </span>
                </div>
              )}
            </div>

            {/* Selection Mode Toggle */}
            <div className="flex items-center gap-2 rounded-lg border p-1">
              <Button
                variant={selectionMode === "single" ? "default" : "ghost"}
                size="sm"
                onClick={() => setSelectionMode("single")}
                className={selectionMode === "single" ? "bg-[#069494] hover:bg-[#057a7a]" : ""}
              >
                Single PIR
              </Button>
              <Button
                variant={selectionMode === "multiple" ? "default" : "ghost"}
                size="sm"
                onClick={() => setSelectionMode("multiple")}
                className={selectionMode === "multiple" ? "bg-[#069494] hover:bg-[#057a7a]" : ""}
              >
                <Users className="mr-2 h-4 w-4" />
                Multiple PIRs
              </Button>
            </div>

            {/* PIR Selection */}
            {selectionMode === "single" ? (
              <div className="space-y-2">
                <Label>Select PIR</Label>
                <Select value={selectedPIR} onValueChange={setSelectedPIR} disabled={loadingPirs}>
                  <SelectTrigger>
                    <SelectValue placeholder={loadingPirs ? "Loading..." : "Select a PIR"} />
                  </SelectTrigger>
                  <SelectContent>
                    {pirUsers.map((pir) => (
                      <SelectItem key={pir.id} value={pir.id}>
                        {getPIRDisplayName(pir)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <div className="space-y-2 flex-1 overflow-hidden">
                <div className="flex items-center justify-between">
                  <Label>Select PIRs ({selectedPIRs.length} selected)</Label>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={selectAllPIRs}
                      disabled={loadingPirs}
                    >
                      All
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={deselectAllPIRs}
                      disabled={loadingPirs}
                    >
                      None
                    </Button>
                  </div>
                </div>

                <ScrollArea className="h-[200px] rounded-lg border p-3">
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
                            id={`pir-add-${pir.id}`}
                            checked={selectedPIRs.includes(pir.id)}
                            onCheckedChange={() => togglePIR(pir.id)}
                          />
                          <Label
                            htmlFor={`pir-add-${pir.id}`}
                            className="flex-1 cursor-pointer text-sm"
                          >
                            {getPIRDisplayName(pir)}
                          </Label>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </div>
            )}
          </>
        )}

        <DialogFooter className="border-t pt-4 mt-4">
          <Button variant="outline" onClick={handleClose}>
            {successCount > 0 ? "Close" : "Cancel"}
          </Button>
          {successCount === 0 && (
            <Button
              onClick={handleSubmit}
              disabled={
                saving ||
                (selectionMode === "single" && !selectedPIR) ||
                (selectionMode === "multiple" && selectedPIRs.length === 0)
              }
              className="bg-[#069494] hover:bg-[#057a7a]"
            >
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Add to Schedule
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default AddToPIRModal
