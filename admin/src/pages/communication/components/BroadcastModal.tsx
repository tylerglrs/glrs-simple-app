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
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Checkbox } from "@/components/ui/checkbox"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Megaphone, Loader2, Users, Search } from "lucide-react"
import { getInitials } from "@/lib/utils"

interface PIRUser {
  id: string
  displayName?: string
  email: string
}

interface SupportGroup {
  id: string
  name: string
  memberCount: number
}

interface BroadcastModalProps {
  open: boolean
  onClose: () => void
}

type TargetType = "all_pirs" | "support_group" | "coaches" | "custom"

export function BroadcastModal({ open, onClose }: BroadcastModalProps) {
  const { adminUser } = useAuth()

  const [title, setTitle] = useState("")
  const [message, setMessage] = useState("")
  const [targetType, setTargetType] = useState<TargetType>("all_pirs")
  const [selectedGroupId, setSelectedGroupId] = useState("")
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState("")

  const [pirUsers, setPirUsers] = useState<PIRUser[]>([])
  const [supportGroups, setSupportGroups] = useState<SupportGroup[]>([])
  const [loadingData, setLoadingData] = useState(false)
  const [sending, setSending] = useState(false)

  // Load PIRs and Support Groups when modal opens
  useEffect(() => {
    if (open) {
      loadData()
    }
  }, [open])

  const loadData = async () => {
    setLoadingData(true)
    try {
      // Load PIR users
      const usersSnap = await getDocs(
        query(
          collection(db, "users"),
          where("tenantId", "==", CURRENT_TENANT),
          where("role", "==", "pir")
        )
      )
      const users: PIRUser[] = []
      usersSnap.forEach((docSnap) => {
        const data = docSnap.data()
        users.push({
          id: docSnap.id,
          displayName: data.displayName,
          email: data.email,
        })
      })
      setPirUsers(users)

      // Load Support Groups
      const groupsSnap = await getDocs(
        query(
          collection(db, "supportGroups"),
          where("tenantId", "==", CURRENT_TENANT)
        )
      )
      const groups: SupportGroup[] = []
      groupsSnap.forEach((docSnap) => {
        const data = docSnap.data()
        groups.push({
          id: docSnap.id,
          name: data.name,
          memberCount: data.members?.length || 0,
        })
      })
      setSupportGroups(groups)
    } catch (error) {
      console.error("Error loading data:", error)
      toast.error("Failed to load data")
    } finally {
      setLoadingData(false)
    }
  }

  const handleClose = () => {
    setTitle("")
    setMessage("")
    setTargetType("all_pirs")
    setSelectedGroupId("")
    setSelectedUserIds([])
    setSearchQuery("")
    onClose()
  }

  const handleSend = async () => {
    if (!title.trim()) {
      toast.error("Please enter a title")
      return
    }
    if (!message.trim()) {
      toast.error("Please enter a message")
      return
    }
    if (targetType === "support_group" && !selectedGroupId) {
      toast.error("Please select a support group")
      return
    }
    if (targetType === "custom" && selectedUserIds.length === 0) {
      toast.error("Please select at least one recipient")
      return
    }

    setSending(true)
    try {
      // Determine recipient IDs based on target type
      let recipientIds: string[] = []
      let targetName = ""

      switch (targetType) {
        case "all_pirs":
          recipientIds = pirUsers.map((u) => u.id)
          targetName = "All PIRs"
          break
        case "support_group":
          // Get group members
          const selectedGroup = supportGroups.find((g) => g.id === selectedGroupId)
          targetName = selectedGroup?.name || "Support Group"
          // Fetch group members from Firestore
          const groupDoc = await getDocs(
            query(
              collection(db, "supportGroups"),
              where("__name__", "==", selectedGroupId)
            )
          )
          if (!groupDoc.empty) {
            const groupData = groupDoc.docs[0].data()
            recipientIds = groupData.members || []
          }
          break
        case "coaches":
          // Get all coaches
          const coachesSnap = await getDocs(
            query(
              collection(db, "users"),
              where("tenantId", "==", CURRENT_TENANT),
              where("role", "in", ["coach", "admin", "superadmin"])
            )
          )
          coachesSnap.forEach((docSnap) => {
            recipientIds.push(docSnap.id)
          })
          targetName = "All Coaches"
          break
        case "custom":
          recipientIds = selectedUserIds
          targetName = `${selectedUserIds.length} selected users`
          break
      }

      // Create broadcast document
      await addDoc(collection(db, "broadcasts"), {
        title: title.trim(),
        message: message.trim(),
        targetType,
        targetGroupId: targetType === "support_group" ? selectedGroupId : null,
        targetName,
        recipientIds,
        senderId: adminUser?.uid,
        senderName: adminUser?.displayName || adminUser?.email,
        createdAt: serverTimestamp(),
        tenantId: CURRENT_TENANT,
      })

      // Create notifications for each recipient
      const notificationPromises = recipientIds.map((userId) =>
        addDoc(collection(db, "notifications"), {
          userId,
          type: "broadcast",
          title: title.trim(),
          message: message.trim(),
          read: false,
          createdAt: serverTimestamp(),
          tenantId: CURRENT_TENANT,
        })
      )
      await Promise.all(notificationPromises)

      toast.success(`Broadcast sent to ${recipientIds.length} recipients`)
      handleClose()
    } catch (error) {
      console.error("Error sending broadcast:", error)
      toast.error("Failed to send broadcast")
    } finally {
      setSending(false)
    }
  }

  const toggleUser = (userId: string) => {
    setSelectedUserIds((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    )
  }

  const filteredUsers = pirUsers.filter((user) => {
    if (!searchQuery) return true
    const q = searchQuery.toLowerCase()
    return (
      user.displayName?.toLowerCase().includes(q) ||
      user.email.toLowerCase().includes(q)
    )
  })

  const getRecipientCount = () => {
    switch (targetType) {
      case "all_pirs":
        return pirUsers.length
      case "support_group":
        return supportGroups.find((g) => g.id === selectedGroupId)?.memberCount || 0
      case "coaches":
        return "All"
      case "custom":
        return selectedUserIds.length
      default:
        return 0
    }
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Megaphone className="h-5 w-5 text-primary" />
            Send Broadcast
          </DialogTitle>
          <DialogDescription>
            Send a message to multiple users at once
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4 py-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="broadcast-title">Title *</Label>
            <Input
              id="broadcast-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Broadcast title..."
            />
          </div>

          {/* Message */}
          <div className="space-y-2">
            <Label htmlFor="broadcast-message">Message *</Label>
            <Textarea
              id="broadcast-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message..."
              rows={4}
            />
          </div>

          {/* Target Type */}
          <div className="space-y-2">
            <Label>Send To *</Label>
            <Select
              value={targetType}
              onValueChange={(v) => setTargetType(v as TargetType)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select recipients" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all_pirs">All PIRs ({pirUsers.length})</SelectItem>
                <SelectItem value="support_group">Support Group</SelectItem>
                <SelectItem value="coaches">All Coaches</SelectItem>
                <SelectItem value="custom">Custom Selection</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Support Group Selection */}
          {targetType === "support_group" && (
            <div className="space-y-2">
              <Label>Select Group *</Label>
              <Select value={selectedGroupId} onValueChange={setSelectedGroupId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a support group" />
                </SelectTrigger>
                <SelectContent>
                  {supportGroups.map((group) => (
                    <SelectItem key={group.id} value={group.id}>
                      {group.name} ({group.memberCount} members)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Custom User Selection */}
          {targetType === "custom" && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Select Recipients *</Label>
                {selectedUserIds.length > 0 && (
                  <Badge variant="secondary">
                    {selectedUserIds.length} selected
                  </Badge>
                )}
              </div>
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
                <ScrollArea className="h-[200px]">
                  {loadingData ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : filteredUsers.length === 0 ? (
                    <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
                      <Users className="h-4 w-4 mr-2" />
                      No users found
                    </div>
                  ) : (
                    <div className="divide-y">
                      {filteredUsers.map((user) => (
                        <label
                          key={user.id}
                          className="flex items-center gap-3 p-3 cursor-pointer hover:bg-muted/50"
                        >
                          <Checkbox
                            checked={selectedUserIds.includes(user.id)}
                            onCheckedChange={() => toggleUser(user.id)}
                          />
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-primary/10 text-primary text-xs">
                              {getInitials(user.displayName || user.email)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-sm truncate">
                              {user.displayName || user.email}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              {user.email}
                            </p>
                          </div>
                        </label>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </div>
            </div>
          )}

          {/* Recipient Count */}
          <div className="rounded-lg border bg-muted/50 p-3">
            <div className="flex items-center gap-2 text-sm">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Recipients:</span>
              <span className="font-medium">{getRecipientCount()}</span>
            </div>
          </div>
        </div>

        <DialogFooter className="border-t pt-4 mt-4">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSend} disabled={sending}>
            {sending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Megaphone className="mr-2 h-4 w-4" />
                Send Broadcast
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default BroadcastModal
