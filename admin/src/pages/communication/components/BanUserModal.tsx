import { useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import {
  db,
  collection,
  doc,
  addDoc,
  updateDoc,
  serverTimestamp,
  CURRENT_TENANT,
} from "@/lib/firebase"
import { Timestamp } from "firebase/firestore"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
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
import { Ban, Loader2, AlertTriangle } from "lucide-react"
import { getInitials } from "@/lib/utils"

interface BanUserModalProps {
  open: boolean
  userId: string
  userName: string
  onClose: () => void
  onSuccess: () => void
}

const BAN_DURATIONS = [
  { value: "1d", label: "1 Day" },
  { value: "3d", label: "3 Days" },
  { value: "7d", label: "1 Week" },
  { value: "14d", label: "2 Weeks" },
  { value: "30d", label: "1 Month" },
  { value: "permanent", label: "Permanent" },
]

function calculateSuspendedUntil(duration: string): Timestamp | null {
  if (duration === "permanent") return null

  const now = new Date()
  const daysMatch = duration.match(/^(\d+)d$/)
  if (daysMatch) {
    const days = parseInt(daysMatch[1])
    now.setDate(now.getDate() + days)
    return Timestamp.fromDate(now)
  }
  return null
}

export function BanUserModal({
  open,
  userId,
  userName,
  onClose,
  onSuccess,
}: BanUserModalProps) {
  const { adminUser } = useAuth()
  const [duration, setDuration] = useState("")
  const [reason, setReason] = useState("")
  const [banning, setBanning] = useState(false)
  const [confirmBan, setConfirmBan] = useState(false)

  const handleClose = () => {
    setDuration("")
    setReason("")
    setConfirmBan(false)
    onClose()
  }

  const handleBan = async () => {
    if (!duration) {
      toast.error("Please select a ban duration")
      return
    }
    if (!reason.trim()) {
      toast.error("Please enter a reason")
      return
    }

    setBanning(true)
    try {
      const suspendedUntil = calculateSuspendedUntil(duration)

      // Update user status
      await updateDoc(doc(db, "users", userId), {
        status: "suspended",
        suspendedAt: serverTimestamp(),
        suspendedUntil,
        suspendedReason: reason.trim(),
        suspendedBy: adminUser?.uid || "",
      })

      // Log moderation action
      await addDoc(collection(db, "moderationActions"), {
        action: "ban",
        targetUserId: userId,
        reason: reason.trim(),
        duration,
        moderatorId: adminUser?.uid || "",
        moderatorName: adminUser?.displayName || adminUser?.email || "",
        createdAt: serverTimestamp(),
        tenantId: CURRENT_TENANT,
      })

      // Send notification to user
      await addDoc(collection(db, "notifications"), {
        userId,
        type: "account_suspended",
        title: "Account Suspended",
        message: duration === "permanent"
          ? `Your account has been permanently suspended. Reason: ${reason.trim()}`
          : `Your account has been suspended for ${BAN_DURATIONS.find(d => d.value === duration)?.label}. Reason: ${reason.trim()}`,
        read: false,
        createdAt: serverTimestamp(),
        tenantId: CURRENT_TENANT,
      })

      toast.success(
        duration === "permanent"
          ? "User permanently banned"
          : "User suspended successfully"
      )
      setConfirmBan(false)
      handleClose()
      onSuccess()
    } catch (error) {
      console.error("Error banning user:", error)
      toast.error("Failed to ban user")
    } finally {
      setBanning(false)
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <Ban className="h-5 w-5" />
              Ban User
            </DialogTitle>
            <DialogDescription>
              Suspend this user's account. They will be unable to log in.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* User Info */}
            <div className="flex items-center gap-3 rounded-lg border p-3 bg-red-50">
              <Avatar className="h-12 w-12">
                <AvatarFallback className="bg-red-100 text-red-700">
                  {getInitials(userName)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{userName}</p>
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  User will be suspended
                </p>
              </div>
            </div>

            {/* Duration */}
            <div className="space-y-2">
              <Label>Ban Duration *</Label>
              <Select value={duration} onValueChange={setDuration}>
                <SelectTrigger>
                  <SelectValue placeholder="Select duration" />
                </SelectTrigger>
                <SelectContent>
                  {BAN_DURATIONS.map((d) => (
                    <SelectItem key={d.value} value={d.value}>
                      {d.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Reason */}
            <div className="space-y-2">
              <Label htmlFor="ban-reason">Reason *</Label>
              <Textarea
                id="ban-reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Explain the reason for this ban..."
                rows={4}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              onClick={() => setConfirmBan(true)}
              disabled={!duration || !reason.trim()}
              className="bg-red-600 hover:bg-red-700"
            >
              <Ban className="mr-2 h-4 w-4" />
              Ban User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <AlertDialog open={confirmBan} onOpenChange={(open) => !open && setConfirmBan(false)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Ban</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to{" "}
              {duration === "permanent" ? "permanently ban" : `suspend for ${BAN_DURATIONS.find(d => d.value === duration)?.label}`}{" "}
              <strong>{userName}</strong>?
              <br /><br />
              This will immediately log them out and prevent them from accessing their account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={banning}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBan}
              disabled={banning}
              className="bg-red-600 hover:bg-red-700"
            >
              {banning ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Banning...
                </>
              ) : (
                <>
                  <Ban className="mr-2 h-4 w-4" />
                  Confirm Ban
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

export default BanUserModal
