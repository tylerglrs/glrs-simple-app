import { useState } from "react"
import {
  db,
  doc,
  writeBatch,
  serverTimestamp,
  logAudit,
} from "@/lib/firebase"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
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
import { Label } from "@/components/ui/label"
import {
  UserMinus,
  UserPlus,
  Download,
  UserCog,
  X,
  Loader2,
  Users,
} from "lucide-react"
import { User, Coach } from "../types"

interface BulkActionsBarProps {
  selectedCount: number
  selectedUsers: Set<string>
  users: User[]
  coaches: Coach[]
  onClearSelection: () => void
  onRefresh: () => void
}

// Generate CSV from user data
function generateCSV(users: User[]): string {
  const headers = [
    "Email",
    "First Name",
    "Last Name",
    "Display Name",
    "Role",
    "Status",
    "Phone",
    "Assigned Coach",
    "Compliance",
    "Check-in Streak",
    "Created At",
  ]

  const rows = users.map((user) => [
    user.email || "",
    user.firstName || "",
    user.lastName || "",
    user.displayName || "",
    user.role || "",
    user.active ? "Active" : "Inactive",
    user.phone || "",
    user.coachName || "",
    user.compliance !== undefined ? `${user.compliance}%` : "",
    user.checkInStreak?.toString() || "",
    user.createdAt
      ? new Date(
          user.createdAt instanceof Date
            ? user.createdAt
            : user.createdAt.toDate()
        ).toLocaleDateString()
      : "",
  ])

  const csvContent = [
    headers.join(","),
    ...rows.map((row) =>
      row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(",")
    ),
  ].join("\n")

  return csvContent
}

// Download CSV file
function downloadCSV(csv: string, filename: string) {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
  const link = document.createElement("a")
  const url = URL.createObjectURL(blob)
  link.setAttribute("href", url)
  link.setAttribute("download", filename)
  link.style.visibility = "hidden"
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

export function BulkActionsBar({
  selectedCount,
  selectedUsers,
  users,
  coaches,
  onClearSelection,
  onRefresh,
}: BulkActionsBarProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [showDeactivateDialog, setShowDeactivateDialog] = useState(false)
  const [showActivateDialog, setShowActivateDialog] = useState(false)
  const [showAssignCoachModal, setShowAssignCoachModal] = useState(false)
  const [selectedCoach, setSelectedCoach] = useState("")

  // Get selected user data
  const selectedUserData = users.filter((u) => selectedUsers.has(u.id))

  // Bulk Deactivate
  const handleBulkDeactivate = async () => {
    setIsProcessing(true)
    try {
      const batch = writeBatch(db)

      selectedUsers.forEach((userId) => {
        const ref = doc(db, "users", userId)
        batch.update(ref, {
          active: false,
          deactivatedAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        })
      })

      await batch.commit()

      // Log audit for the bulk action
      await logAudit("bulk_user_deactivated", {
        resource: "users",
        changes: {
          action: "deactivate",
          affectedUserIds: Array.from(selectedUsers),
          totalAffected: selectedUsers.size,
        },
      })

      toast.success(`${selectedUsers.size} users deactivated`)
      onClearSelection()
      onRefresh()
    } catch (error) {
      console.error("Error bulk deactivating users:", error)
      toast.error("Failed to deactivate users")
    } finally {
      setIsProcessing(false)
      setShowDeactivateDialog(false)
    }
  }

  // Bulk Activate
  const handleBulkActivate = async () => {
    setIsProcessing(true)
    try {
      const batch = writeBatch(db)

      selectedUsers.forEach((userId) => {
        const ref = doc(db, "users", userId)
        batch.update(ref, {
          active: true,
          reactivatedAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        })
      })

      await batch.commit()

      // Log audit for the bulk action
      await logAudit("bulk_user_activated", {
        resource: "users",
        changes: {
          action: "activate",
          affectedUserIds: Array.from(selectedUsers),
          totalAffected: selectedUsers.size,
        },
      })

      toast.success(`${selectedUsers.size} users activated`)
      onClearSelection()
      onRefresh()
    } catch (error) {
      console.error("Error bulk activating users:", error)
      toast.error("Failed to activate users")
    } finally {
      setIsProcessing(false)
      setShowActivateDialog(false)
    }
  }

  // Export Selected
  const handleExport = () => {
    const csv = generateCSV(selectedUserData)
    const timestamp = new Date().toISOString().split("T")[0]
    downloadCSV(csv, `users-export-${timestamp}.csv`)
    toast.success(`Exported ${selectedUserData.length} users`)
  }

  // Assign Coach
  const handleAssignCoach = async () => {
    if (!selectedCoach) {
      toast.error("Please select a coach")
      return
    }

    setIsProcessing(true)
    try {
      const batch = writeBatch(db)
      const coachData = coaches.find((c) => c.id === selectedCoach)

      selectedUsers.forEach((userId) => {
        const ref = doc(db, "users", userId)
        batch.update(ref, {
          assignedCoach: selectedCoach,
          updatedAt: serverTimestamp(),
        })
      })

      await batch.commit()

      // Log audit
      await logAudit("bulk_coach_assigned", {
        resource: "users",
        changes: {
          coachId: selectedCoach,
          coachName: coachData?.displayName || coachData?.email,
          affectedUserIds: Array.from(selectedUsers),
          totalAffected: selectedUsers.size,
        },
      })

      toast.success(
        `Assigned ${coachData?.displayName || coachData?.email} to ${selectedUsers.size} PIRs`
      )
      onClearSelection()
      onRefresh()
    } catch (error) {
      console.error("Error assigning coach:", error)
      toast.error("Failed to assign coach")
    } finally {
      setIsProcessing(false)
      setShowAssignCoachModal(false)
      setSelectedCoach("")
    }
  }

  // Check if selected users are PIRs (for assign coach action)
  const hasOnlyPIRs = selectedUserData.every((u) => u.role === "pir")
  const hasInactiveUsers = selectedUserData.some((u) => !u.active)
  const hasActiveUsers = selectedUserData.some((u) => u.active)

  return (
    <>
      <Card className="border-primary/50 bg-primary/5">
        <CardContent className="flex flex-wrap items-center gap-3 p-4">
          <div className="flex items-center gap-2 text-sm font-medium text-primary">
            <Users className="h-4 w-4" />
            <span>{selectedCount} selected</span>
          </div>

          <div className="h-6 w-px bg-border" />

          {/* Activate - show if any inactive users selected */}
          {hasInactiveUsers && (
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 border-teal-300 text-teal-700 hover:bg-teal-50 hover:text-teal-800"
              onClick={() => setShowActivateDialog(true)}
              disabled={isProcessing}
            >
              <UserPlus className="h-4 w-4" />
              Activate
            </Button>
          )}

          {/* Deactivate - show if any active users selected */}
          {hasActiveUsers && (
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 border-red-300 text-red-700 hover:bg-red-50 hover:text-red-800"
              onClick={() => setShowDeactivateDialog(true)}
              disabled={isProcessing}
            >
              <UserMinus className="h-4 w-4" />
              Deactivate
            </Button>
          )}

          {/* Export */}
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 border-blue-300 text-blue-700 hover:bg-blue-50 hover:text-blue-800"
            onClick={handleExport}
            disabled={isProcessing}
          >
            <Download className="h-4 w-4" />
            Export CSV
          </Button>

          {/* Assign Coach - only show if all selected are PIRs */}
          {hasOnlyPIRs && coaches.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={() => setShowAssignCoachModal(true)}
              disabled={isProcessing}
            >
              <UserCog className="h-4 w-4" />
              Assign Coach
            </Button>
          )}

          <div className="ml-auto">
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5 text-muted-foreground hover:text-foreground"
              onClick={onClearSelection}
              disabled={isProcessing}
            >
              <X className="h-4 w-4" />
              Clear
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Deactivate Confirmation Dialog */}
      <AlertDialog open={showDeactivateDialog} onOpenChange={setShowDeactivateDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deactivate {selectedCount} Users</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to deactivate {selectedCount} users? They will no
              longer be able to access the platform until reactivated.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessing}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkDeactivate}
              disabled={isProcessing}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deactivating...
                </>
              ) : (
                "Deactivate All"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Activate Confirmation Dialog */}
      <AlertDialog open={showActivateDialog} onOpenChange={setShowActivateDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Activate {selectedCount} Users</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to activate {selectedCount} users? They will regain
              access to the platform.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessing}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkActivate}
              disabled={isProcessing}
              className="bg-teal-600 text-white hover:bg-teal-700"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Activating...
                </>
              ) : (
                "Activate All"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Assign Coach Modal */}
      <Dialog open={showAssignCoachModal} onOpenChange={setShowAssignCoachModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Coach to {selectedCount} PIRs</DialogTitle>
            <DialogDescription>
              Select a coach to assign to the selected PIRs. This will replace any
              existing coach assignments.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="coach">Select Coach</Label>
              <Select value={selectedCoach} onValueChange={setSelectedCoach}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a coach..." />
                </SelectTrigger>
                <SelectContent>
                  {coaches.map((coach) => (
                    <SelectItem key={coach.id} value={coach.id}>
                      <div className="flex items-center justify-between gap-4">
                        <span>{coach.displayName || coach.email}</span>
                        {coach.capacity && (
                          <span className="text-xs text-muted-foreground">
                            ({coach.pirCount || 0}/{coach.capacity} PIRs)
                          </span>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowAssignCoachModal(false)
                setSelectedCoach("")
              }}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAssignCoach}
              disabled={isProcessing || !selectedCoach}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Assigning...
                </>
              ) : (
                "Assign Coach"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default BulkActionsBar
