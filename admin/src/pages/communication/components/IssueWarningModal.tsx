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
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { AlertTriangle, Loader2, Search, User } from "lucide-react"
import { getInitials } from "@/lib/utils"

interface PIRUser {
  id: string
  displayName?: string
  firstName?: string
  lastName?: string
  email: string
}

interface IssueWarningModalProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

const WARNING_TYPES = [
  { value: "content_violation", label: "Content Violation" },
  { value: "harassment", label: "Harassment" },
  { value: "spam", label: "Spam" },
  { value: "other", label: "Other" },
]

export function IssueWarningModal({
  open,
  onClose,
  onSuccess,
}: IssueWarningModalProps) {
  const { adminUser } = useAuth()
  const [users, setUsers] = useState<PIRUser[]>([])
  const [loadingUsers, setLoadingUsers] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedUserId, setSelectedUserId] = useState("")
  const [warningType, setWarningType] = useState<string>("")
  const [reason, setReason] = useState("")
  const [issuing, setIssuing] = useState(false)

  useEffect(() => {
    if (open) {
      loadUsers()
    }
  }, [open])

  const loadUsers = async () => {
    setLoadingUsers(true)
    try {
      const usersSnap = await getDocs(
        query(
          collection(db, "users"),
          where("tenantId", "==", CURRENT_TENANT),
          where("role", "==", "pir")
        )
      )

      const usersData: PIRUser[] = []
      usersSnap.forEach((doc) => {
        const data = doc.data()
        usersData.push({
          id: doc.id,
          displayName: data.displayName,
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
        })
      })
      setUsers(usersData)
    } catch (error) {
      console.error("Error loading users:", error)
      toast.error("Failed to load users")
    } finally {
      setLoadingUsers(false)
    }
  }

  const getUserDisplayName = (user: PIRUser): string => {
    if (user.displayName) return user.displayName
    if (user.firstName || user.lastName) {
      return `${user.firstName || ""} ${user.lastName || ""}`.trim()
    }
    return user.email
  }

  const handleClose = () => {
    setSelectedUserId("")
    setWarningType("")
    setReason("")
    setSearchQuery("")
    onClose()
  }

  const handleSubmit = async () => {
    if (!selectedUserId) {
      toast.error("Please select a user")
      return
    }
    if (!warningType) {
      toast.error("Please select a warning type")
      return
    }
    if (!reason.trim()) {
      toast.error("Please enter a reason")
      return
    }

    const selectedUser = users.find((u) => u.id === selectedUserId)
    if (!selectedUser) {
      toast.error("Selected user not found")
      return
    }

    setIssuing(true)
    try {
      // Create warning
      await addDoc(collection(db, "userWarnings"), {
        userId: selectedUserId,
        userName: getUserDisplayName(selectedUser),
        type: warningType,
        reason: reason.trim(),
        issuedBy: adminUser?.uid || "",
        issuedByName: adminUser?.displayName || adminUser?.email || "",
        createdAt: serverTimestamp(),
        acknowledged: false,
        tenantId: CURRENT_TENANT,
      })

      // Send notification to user
      await addDoc(collection(db, "notifications"), {
        userId: selectedUserId,
        type: "warning",
        title: "Warning Issued",
        message: `You have received a warning: ${reason.trim()}`,
        read: false,
        createdAt: serverTimestamp(),
        tenantId: CURRENT_TENANT,
      })

      // Log moderation action
      await addDoc(collection(db, "moderationActions"), {
        action: "warn",
        targetUserId: selectedUserId,
        reason: reason.trim(),
        moderatorId: adminUser?.uid || "",
        moderatorName: adminUser?.displayName || adminUser?.email || "",
        createdAt: serverTimestamp(),
        tenantId: CURRENT_TENANT,
      })

      toast.success("Warning issued successfully")
      handleClose()
      onSuccess()
    } catch (error) {
      console.error("Error issuing warning:", error)
      toast.error("Failed to issue warning")
    } finally {
      setIssuing(false)
    }
  }

  // Filter users based on search
  const filteredUsers = users.filter((user) => {
    if (!searchQuery) return true
    const searchLower = searchQuery.toLowerCase()
    return (
      getUserDisplayName(user).toLowerCase().includes(searchLower) ||
      user.email.toLowerCase().includes(searchLower)
    )
  })

  const selectedUser = users.find((u) => u.id === selectedUserId)

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
            Issue Warning
          </DialogTitle>
          <DialogDescription>
            Issue a warning to a user for policy violations
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4 py-4">
          {/* User Selection */}
          <div className="space-y-2">
            <Label>Select User *</Label>
            {selectedUser ? (
              <div className="flex items-center gap-3 rounded-lg border p-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {getInitials(getUserDisplayName(selectedUser))}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-medium">{getUserDisplayName(selectedUser)}</p>
                  <p className="text-sm text-muted-foreground">{selectedUser.email}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedUserId("")}
                >
                  Change
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search users..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="rounded-lg border">
                  <ScrollArea className="h-[150px]">
                    {loadingUsers ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                      </div>
                    ) : filteredUsers.length === 0 ? (
                      <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
                        <User className="h-4 w-4 mr-2" />
                        {searchQuery ? "No users found" : "No PIRs available"}
                      </div>
                    ) : (
                      <div className="divide-y">
                        {filteredUsers.map((user) => (
                          <button
                            key={user.id}
                            onClick={() => setSelectedUserId(user.id)}
                            className="flex w-full items-center gap-3 p-3 text-left hover:bg-muted/50"
                          >
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="bg-primary/10 text-primary text-xs">
                                {getInitials(getUserDisplayName(user))}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0 flex-1">
                              <p className="font-medium text-sm truncate">
                                {getUserDisplayName(user)}
                              </p>
                              <p className="text-xs text-muted-foreground truncate">
                                {user.email}
                              </p>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </div>
              </div>
            )}
          </div>

          {/* Warning Type */}
          <div className="space-y-2">
            <Label>Warning Type *</Label>
            <Select value={warningType} onValueChange={setWarningType}>
              <SelectTrigger>
                <SelectValue placeholder="Select warning type" />
              </SelectTrigger>
              <SelectContent>
                {WARNING_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Reason */}
          <div className="space-y-2">
            <Label htmlFor="reason">Reason *</Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Explain the reason for this warning..."
              rows={4}
            />
          </div>
        </div>

        <DialogFooter className="border-t pt-4 mt-4">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={issuing}
            className="bg-amber-600 hover:bg-amber-700"
          >
            {issuing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Issuing...
              </>
            ) : (
              <>
                <AlertTriangle className="mr-2 h-4 w-4" />
                Issue Warning
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default IssueWarningModal
