import { useState, useEffect, useCallback } from "react"
import { useAuth } from "@/contexts/AuthContext"
import {
  db,
  collection,
  doc,
  query,
  where,
  getDocs,
  deleteDoc,
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
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Calendar,
  Clock,
  Users,
  CheckCircle,
  XCircle,
  Send,
  UserMinus,
  Loader2,
  Mail,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { type GLRSMeeting } from "./MeetingCard"
import { InvitationStatusBadge, type RSVPCounts } from "./InvitationStatusBadge"

interface RSVPRecord {
  id: string
  meetingId: string
  pirId: string
  pirName: string
  status: "pending" | "accepted" | "declined"
  respondedAt?: Timestamp
  createdAt: Timestamp
}

interface RSVPManagementModalProps {
  open: boolean
  onClose: () => void
  meeting: GLRSMeeting | null
  onUpdate?: () => void
}

function formatDate(date: Timestamp | Date): string {
  const d = date instanceof Date ? date : date.toDate()
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

const STATUS_STYLES = {
  pending: {
    bg: "bg-gray-100",
    text: "text-gray-600",
    icon: Clock,
    label: "Pending",
  },
  accepted: {
    bg: "bg-green-100",
    text: "text-green-700",
    icon: CheckCircle,
    label: "Accepted",
  },
  declined: {
    bg: "bg-red-100",
    text: "text-red-700",
    icon: XCircle,
    label: "Declined",
  },
}

export function RSVPManagementModal({
  open,
  onClose,
  meeting,
  onUpdate,
}: RSVPManagementModalProps) {
  const { adminUser } = useAuth()
  const [rsvpRecords, setRsvpRecords] = useState<RSVPRecord[]>([])
  const [loading, setLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  // Confirmation dialogs
  const [confirmRemove, setConfirmRemove] = useState<RSVPRecord | null>(null)
  const [confirmResend, setConfirmResend] = useState<RSVPRecord | null>(null)

  const loadRSVPs = useCallback(async () => {
    if (!meeting) return

    setLoading(true)
    try {
      const rsvpSnap = await getDocs(
        query(
          collection(db, "meetingRSVPs"),
          where("meetingId", "==", meeting.id)
        )
      )

      const records: RSVPRecord[] = []
      rsvpSnap.forEach((doc) => {
        const data = doc.data()
        records.push({
          id: doc.id,
          meetingId: data.meetingId,
          pirId: data.pirId,
          pirName: data.pirName,
          status: data.status || "pending",
          respondedAt: data.respondedAt,
          createdAt: data.createdAt,
        })
      })

      // Sort: pending first, then by name
      records.sort((a, b) => {
        if (a.status === "pending" && b.status !== "pending") return -1
        if (a.status !== "pending" && b.status === "pending") return 1
        return a.pirName.localeCompare(b.pirName)
      })

      setRsvpRecords(records)
    } catch (error) {
      console.error("Error loading RSVPs:", error)
      toast.error("Failed to load invitation status")
    } finally {
      setLoading(false)
    }
  }, [meeting])

  useEffect(() => {
    if (open && meeting) {
      loadRSVPs()
    }
  }, [open, meeting, loadRSVPs])

  const handleResendInvitation = async (record: RSVPRecord) => {
    if (!meeting || !adminUser) return

    setActionLoading(record.id)
    try {
      // Send notification
      await addDoc(collection(db, "notifications"), {
        userId: record.pirId,
        type: "meeting_invitation",
        title: "Meeting Reminder",
        message: `Reminder: You're invited to "${meeting.title}"`,
        meetingId: meeting.id,
        meetingTitle: meeting.title,
        meetingDate: meeting.date,
        createdAt: serverTimestamp(),
        read: false,
        tenantId: CURRENT_TENANT,
      })

      toast.success(`Invitation resent to ${record.pirName}`)
      setConfirmResend(null)
    } catch (error) {
      console.error("Error resending invitation:", error)
      toast.error("Failed to resend invitation")
    } finally {
      setActionLoading(null)
    }
  }

  const handleRemoveFromInvite = async (record: RSVPRecord) => {
    if (!meeting) return

    setActionLoading(record.id)
    try {
      // Delete RSVP record
      await deleteDoc(doc(db, "meetingRSVPs", record.id))

      // Update local state
      setRsvpRecords((prev) => prev.filter((r) => r.id !== record.id))

      toast.success(`${record.pirName} removed from invitation`)
      setConfirmRemove(null)
      onUpdate?.()
    } catch (error) {
      console.error("Error removing from invite:", error)
      toast.error("Failed to remove from invitation")
    } finally {
      setActionLoading(null)
    }
  }

  // Calculate counts
  const counts: RSVPCounts = {
    total: rsvpRecords.length,
    accepted: rsvpRecords.filter((r) => r.status === "accepted").length,
    declined: rsvpRecords.filter((r) => r.status === "declined").length,
    pending: rsvpRecords.filter((r) => r.status === "pending").length,
  }

  if (!meeting) return null

  return (
    <>
      <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-[#069494]" />
              Manage Invitations
            </DialogTitle>
            <DialogDescription>
              View and manage PIR invitations for this meeting
            </DialogDescription>
          </DialogHeader>

          {/* Meeting Info */}
          <div className="rounded-lg border bg-muted/30 p-4 space-y-2">
            <h3 className="font-medium">{meeting.title}</h3>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {formatDate(meeting.date)}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {meeting.time}
              </span>
            </div>
            <InvitationStatusBadge counts={counts} />
          </div>

          {/* RSVP List */}
          <ScrollArea className="flex-1 pr-4">
            {loading ? (
              <div className="space-y-2 py-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-16" />
                ))}
              </div>
            ) : rsvpRecords.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                <Users className="mb-4 h-12 w-12 opacity-30" />
                <p>No PIRs invited to this meeting</p>
              </div>
            ) : (
              <div className="space-y-2 py-4">
                {rsvpRecords.map((record) => {
                  const statusStyle = STATUS_STYLES[record.status]
                  const StatusIcon = statusStyle.icon

                  return (
                    <div
                      key={record.id}
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="min-w-0">
                          <p className="font-medium truncate">{record.pirName}</p>
                          <div className="flex items-center gap-2">
                            <Badge
                              className={cn(
                                "text-xs",
                                statusStyle.bg,
                                statusStyle.text
                              )}
                            >
                              <StatusIcon className="mr-1 h-3 w-3" />
                              {statusStyle.label}
                            </Badge>
                            {record.respondedAt && (
                              <span className="text-xs text-muted-foreground">
                                {record.respondedAt.toDate().toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => setConfirmResend(record)}
                          disabled={actionLoading === record.id}
                          title="Resend Invitation"
                        >
                          {actionLoading === record.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Send className="h-4 w-4 text-[#069494]" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-600 hover:text-red-700"
                          onClick={() => setConfirmRemove(record)}
                          disabled={actionLoading === record.id}
                          title="Remove from Invitation"
                        >
                          <UserMinus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </ScrollArea>

          {/* Footer */}
          <div className="flex justify-end border-t pt-4 mt-4">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Resend Confirmation */}
      <AlertDialog
        open={!!confirmResend}
        onOpenChange={(open) => !open && setConfirmResend(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Resend Invitation?</AlertDialogTitle>
            <AlertDialogDescription>
              This will send a reminder notification to {confirmResend?.pirName} about
              this meeting.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => confirmResend && handleResendInvitation(confirmResend)}
              className="bg-[#069494] hover:bg-[#057a7a]"
            >
              Resend
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Remove Confirmation */}
      <AlertDialog
        open={!!confirmRemove}
        onOpenChange={(open) => !open && setConfirmRemove(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove from Invitation?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove {confirmRemove?.pirName} from the invitation list. They
              will no longer receive notifications about this meeting.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => confirmRemove && handleRemoveFromInvite(confirmRemove)}
              className="bg-red-600 hover:bg-red-700"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

export default RSVPManagementModal
