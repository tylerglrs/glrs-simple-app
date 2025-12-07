import { useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import {
  db,
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
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
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
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
import {
  Check,
  Trash2,
  AlertTriangle,
  Loader2,
  User,
  Clock,
  MessageSquare,
  FileText,
  MessageCircle,
} from "lucide-react"
import { formatDate, getInitials } from "@/lib/utils"
import { type ReportedContent } from "./FlaggedContentTab"

interface ContentReviewModalProps {
  open: boolean
  report: ReportedContent | null
  onClose: () => void
  onSuccess: () => void
}

const CONTENT_TYPE_ICONS = {
  message: MessageSquare,
  post: FileText,
  comment: MessageCircle,
}

// Map content types to their Firestore collections
const CONTENT_COLLECTIONS: Record<string, string> = {
  message: "messages",
  post: "communityMessages",
  comment: "comments",
}

export function ContentReviewModal({
  open,
  report,
  onClose,
  onSuccess,
}: ContentReviewModalProps) {
  const { adminUser } = useAuth()
  const [notes, setNotes] = useState("")
  const [processing, setProcessing] = useState(false)
  const [confirmAction, setConfirmAction] = useState<"remove" | "warn" | null>(null)

  const handleClose = () => {
    setNotes("")
    setConfirmAction(null)
    onClose()
  }

  const logModerationAction = async (
    action: "approve" | "remove" | "warn",
    reason: string
  ) => {
    if (!report) return

    await addDoc(collection(db, "moderationActions"), {
      contentId: report.contentId,
      contentType: report.contentType,
      action,
      reason,
      moderatorId: adminUser?.uid || "",
      moderatorName: adminUser?.displayName || adminUser?.email || "",
      targetUserId: report.contentAuthorId,
      createdAt: serverTimestamp(),
      tenantId: CURRENT_TENANT,
    })
  }

  const handleApprove = async () => {
    if (!report) return

    setProcessing(true)
    try {
      // Update report status
      await updateDoc(doc(db, "reportedContent", report.id), {
        status: "resolved",
        resolution: "approved",
        resolvedBy: adminUser?.uid || "",
        resolvedAt: serverTimestamp(),
        resolutionNotes: notes || "Content approved - no violation found",
      })

      // Log the moderation action
      await logModerationAction("approve", notes || "Content approved - no violation found")

      toast.success("Content approved")
      handleClose()
      onSuccess()
    } catch (error) {
      console.error("Error approving content:", error)
      toast.error("Failed to approve content")
    } finally {
      setProcessing(false)
    }
  }

  const handleRemove = async () => {
    if (!report) return

    setProcessing(true)
    try {
      // Delete the actual content
      const contentCollection = CONTENT_COLLECTIONS[report.contentType] || "messages"
      try {
        await deleteDoc(doc(db, contentCollection, report.contentId))
      } catch (deleteError) {
        console.warn("Content may already be deleted:", deleteError)
      }

      // Update report status
      await updateDoc(doc(db, "reportedContent", report.id), {
        status: "resolved",
        resolution: "removed",
        resolvedBy: adminUser?.uid || "",
        resolvedAt: serverTimestamp(),
        resolutionNotes: notes || "Content removed for violation",
      })

      // Log the moderation action
      await logModerationAction("remove", notes || "Content removed for violation")

      toast.success("Content removed")
      setConfirmAction(null)
      handleClose()
      onSuccess()
    } catch (error) {
      console.error("Error removing content:", error)
      toast.error("Failed to remove content")
    } finally {
      setProcessing(false)
    }
  }

  const handleWarn = async () => {
    if (!report) return

    setProcessing(true)
    try {
      // Issue warning to user
      await addDoc(collection(db, "userWarnings"), {
        userId: report.contentAuthorId,
        userName: report.contentAuthorName,
        type: "content_violation",
        contentId: report.contentId,
        reason: notes || "Content violated community guidelines",
        issuedBy: adminUser?.uid || "",
        issuedByName: adminUser?.displayName || adminUser?.email || "",
        createdAt: serverTimestamp(),
        acknowledged: false,
        tenantId: CURRENT_TENANT,
      })

      // Send notification to user
      await addDoc(collection(db, "notifications"), {
        userId: report.contentAuthorId,
        type: "warning",
        title: "Content Warning",
        message: "Your content was flagged for review. Please review our community guidelines.",
        read: false,
        createdAt: serverTimestamp(),
        tenantId: CURRENT_TENANT,
      })

      // Update report status
      await updateDoc(doc(db, "reportedContent", report.id), {
        status: "resolved",
        resolution: "warned",
        resolvedBy: adminUser?.uid || "",
        resolvedAt: serverTimestamp(),
        resolutionNotes: notes || "User warned for content violation",
      })

      // Log the moderation action
      await logModerationAction("warn", notes || "User warned for content violation")

      toast.success("Warning issued to user")
      setConfirmAction(null)
      handleClose()
      onSuccess()
    } catch (error) {
      console.error("Error warning user:", error)
      toast.error("Failed to issue warning")
    } finally {
      setProcessing(false)
    }
  }

  if (!report) return null

  const ContentIcon = CONTENT_TYPE_ICONS[report.contentType] || FileText
  const isResolved = report.status === "resolved"

  return (
    <>
      <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ContentIcon className="h-5 w-5 text-[#069494]" />
              Review Flagged {report.contentType}
            </DialogTitle>
            <DialogDescription>
              {isResolved
                ? "This report has been resolved"
                : "Review the content and take appropriate action"}
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto space-y-4 py-4">
            {/* Content Preview */}
            <div className="space-y-2">
              <Label className="text-muted-foreground">Flagged Content</Label>
              <div className="rounded-lg border bg-muted/50 p-4">
                <p className="text-sm whitespace-pre-wrap">{report.contentText}</p>
              </div>
            </div>

            <Separator />

            {/* Author Info */}
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-red-100 text-red-700">
                  {getInitials(report.contentAuthorName)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{report.contentAuthorName}</p>
                <p className="text-sm text-muted-foreground">Content Author</p>
              </div>
            </div>

            <Separator />

            {/* Report Details */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  <span className="text-muted-foreground">Reported by: </span>
                  <span className="font-medium">{report.reporterName}</span>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  <span className="text-muted-foreground">Reported: </span>
                  <span className="font-medium">
                    {formatDate(report.createdAt?.toDate?.(), "relative")}
                  </span>
                </span>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Reason:</p>
                <p className="text-sm italic">{report.reason}</p>
              </div>
            </div>

            {/* Resolution Info (if resolved) */}
            {isResolved && (
              <>
                <Separator />
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge
                      className={
                        report.resolution === "approved"
                          ? "bg-gray-100 text-gray-700"
                          : report.resolution === "removed"
                          ? "bg-red-100 text-red-700"
                          : "bg-amber-100 text-amber-700"
                      }
                    >
                      {report.resolution === "approved"
                        ? "Approved"
                        : report.resolution === "removed"
                        ? "Removed"
                        : "Warned"}
                    </Badge>
                  </div>
                  {report.resolutionNotes && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Resolution Notes:</p>
                      <p className="text-sm">{report.resolutionNotes}</p>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Notes Input (if pending) */}
            {!isResolved && (
              <>
                <Separator />
                <div className="space-y-2">
                  <Label htmlFor="notes">Resolution Notes (optional)</Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add notes about your decision..."
                    rows={3}
                  />
                </div>
              </>
            )}
          </div>

          <DialogFooter className="border-t pt-4 mt-4 gap-2 sm:gap-0">
            <Button variant="outline" onClick={handleClose}>
              {isResolved ? "Close" : "Cancel"}
            </Button>

            {!isResolved && (
              <>
                <Button
                  variant="outline"
                  onClick={() => setConfirmAction("warn")}
                  disabled={processing}
                  className="text-amber-600 border-amber-200 hover:bg-amber-50"
                >
                  <AlertTriangle className="mr-2 h-4 w-4" />
                  Warn User
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setConfirmAction("remove")}
                  disabled={processing}
                  className="text-red-600 border-red-200 hover:bg-red-50"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Remove
                </Button>
                <Button
                  onClick={handleApprove}
                  disabled={processing}
                  className="bg-[#069494] hover:bg-[#057a7a]"
                >
                  {processing ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Check className="mr-2 h-4 w-4" />
                  )}
                  Approve
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm Remove Dialog */}
      <AlertDialog
        open={confirmAction === "remove"}
        onOpenChange={(open) => !open && setConfirmAction(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Content</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this content? This action cannot be
              undone and the content will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={processing}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemove}
              disabled={processing}
              className="bg-red-600 hover:bg-red-700"
            >
              {processing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Removing...
                </>
              ) : (
                "Remove Content"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Confirm Warn Dialog */}
      <AlertDialog
        open={confirmAction === "warn"}
        onOpenChange={(open) => !open && setConfirmAction(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Issue Warning</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to issue a warning to {report?.contentAuthorName}?
              They will receive a notification about this warning.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={processing}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleWarn}
              disabled={processing}
              className="bg-amber-600 hover:bg-amber-700"
            >
              {processing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Issuing Warning...
                </>
              ) : (
                "Issue Warning"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

export default ContentReviewModal
