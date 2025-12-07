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
  addDoc,
  arrayUnion,
  arrayRemove,
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
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Users,
  Search,
  Loader2,
  UserPlus,
  UserMinus,
  Bell,
  X,
} from "lucide-react"
import { type SupportGroup } from "./SupportGroupCard"
import { getInitials } from "@/lib/utils"

interface PIRUser {
  id: string
  displayName?: string
  firstName?: string
  lastName?: string
  email: string
}

interface ManageMembersModalProps {
  open: boolean
  group: SupportGroup | null
  onClose: () => void
  onSuccess?: () => void
}

export function ManageMembersModal({
  open,
  group,
  onClose,
  onSuccess,
}: ManageMembersModalProps) {
  const { adminUser } = useAuth()
  const [saving, setSaving] = useState(false)
  const [allPIRs, setAllPIRs] = useState<PIRUser[]>([])
  const [loadingPIRs, setLoadingPIRs] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedPIRs, setSelectedPIRs] = useState<string[]>([])
  const [sendNotification, setSendNotification] = useState(true)
  const [activeTab, setActiveTab] = useState<"current" | "add">("current")

  // Load all PIRs when modal opens
  useEffect(() => {
    if (open && group) {
      loadPIRs()
      setSelectedPIRs([])
      setSearchQuery("")
      setActiveTab("current")
    }
  }, [open, group])

  const loadPIRs = async () => {
    setLoadingPIRs(true)
    try {
      const pirsSnap = await getDocs(
        query(
          collection(db, "users"),
          where("tenantId", "==", CURRENT_TENANT),
          where("role", "==", "pir")
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
      setAllPIRs(users)
    } catch (error) {
      console.error("Error loading PIRs:", error)
      toast.error("Failed to load PIRs")
    } finally {
      setLoadingPIRs(false)
    }
  }

  const handleClose = () => {
    setSelectedPIRs([])
    setSearchQuery("")
    onClose()
  }

  const getPIRDisplayName = (pir?: PIRUser): string => {
    if (!pir) return "Unknown"
    if (pir.displayName) return pir.displayName
    if (pir.firstName || pir.lastName) {
      return `${pir.firstName || ""} ${pir.lastName || ""}`.trim()
    }
    return pir.email
  }

  const togglePIRSelection = (pirId: string) => {
    setSelectedPIRs((prev) =>
      prev.includes(pirId)
        ? prev.filter((id) => id !== pirId)
        : [...prev, pirId]
    )
  }

  const handleAddMembers = async () => {
    if (!group || selectedPIRs.length === 0) return

    // Check max members limit
    if (group.maxMembers) {
      const newTotal = group.members.length + selectedPIRs.length
      if (newTotal > group.maxMembers) {
        toast.error(
          `Cannot add ${selectedPIRs.length} members. Group limit is ${group.maxMembers} (currently ${group.members.length})`
        )
        return
      }
    }

    setSaving(true)
    try {
      // Add members to group
      await updateDoc(doc(db, "supportGroups", group.id), {
        members: arrayUnion(...selectedPIRs),
        updatedAt: serverTimestamp(),
        updatedBy: adminUser?.uid || "",
      })

      // Send notifications if enabled
      if (sendNotification) {
        const notificationPromises = selectedPIRs.map((pirId) =>
          addDoc(collection(db, "notifications"), {
            userId: pirId,
            type: "group_assignment",
            title: "Added to Support Group",
            message: `You have been added to the support group "${group.name}"`,
            groupId: group.id,
            groupName: group.name,
            read: false,
            createdAt: serverTimestamp(),
            createdBy: adminUser?.uid || "",
            tenantId: CURRENT_TENANT,
          })
        )
        await Promise.all(notificationPromises)
      }

      toast.success(`${selectedPIRs.length} member(s) added to group`)
      setSelectedPIRs([])
      onSuccess?.()
    } catch (error) {
      console.error("Error adding members:", error)
      toast.error("Failed to add members")
    } finally {
      setSaving(false)
    }
  }

  const handleRemoveMember = async (pirId: string) => {
    if (!group) return

    setSaving(true)
    try {
      await updateDoc(doc(db, "supportGroups", group.id), {
        members: arrayRemove(pirId),
        updatedAt: serverTimestamp(),
        updatedBy: adminUser?.uid || "",
      })

      toast.success("Member removed from group")
      onSuccess?.()
    } catch (error) {
      console.error("Error removing member:", error)
      toast.error("Failed to remove member")
    } finally {
      setSaving(false)
    }
  }

  // Filter PIRs based on search and tab
  const currentMembers = allPIRs.filter((pir) =>
    group?.members.includes(pir.id)
  )

  const availablePIRs = allPIRs.filter(
    (pir) =>
      !group?.members.includes(pir.id) &&
      (searchQuery === "" ||
        getPIRDisplayName(pir).toLowerCase().includes(searchQuery.toLowerCase()) ||
        pir.email.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  if (!group) return null

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-[#069494]" />
            Manage Members
          </DialogTitle>
          <DialogDescription>
            {group.name} - {group.members.length} member
            {group.members.length !== 1 ? "s" : ""}
            {group.maxMembers && ` / ${group.maxMembers} max`}
          </DialogDescription>
        </DialogHeader>

        {/* Tab Buttons */}
        <div className="flex gap-2 border-b pb-2">
          <Button
            variant={activeTab === "current" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("current")}
            className={activeTab === "current" ? "bg-[#069494] hover:bg-[#057a7a]" : ""}
          >
            <Users className="mr-2 h-4 w-4" />
            Current ({currentMembers.length})
          </Button>
          <Button
            variant={activeTab === "add" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("add")}
            className={activeTab === "add" ? "bg-[#069494] hover:bg-[#057a7a]" : ""}
          >
            <UserPlus className="mr-2 h-4 w-4" />
            Add Members
          </Button>
        </div>

        <div className="flex-1 overflow-hidden">
          {activeTab === "current" ? (
            /* Current Members Tab */
            <ScrollArea className="h-[300px] pr-4">
              {loadingPIRs ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : currentMembers.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Users className="h-12 w-12 text-muted-foreground/50 mb-3" />
                  <p className="text-sm text-muted-foreground">
                    No members in this group yet
                  </p>
                  <Button
                    variant="link"
                    className="text-[#069494] mt-2"
                    onClick={() => setActiveTab("add")}
                  >
                    Add members
                  </Button>
                </div>
              ) : (
                <div className="space-y-2 py-2">
                  {currentMembers.map((pir) => (
                    <div
                      key={pir.id}
                      className="flex items-center justify-between gap-3 rounded-lg border p-3"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {getInitials(getPIRDisplayName(pir))}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm">
                            {getPIRDisplayName(pir)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {pir.email}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveMember(pir.id)}
                        disabled={saving}
                        className="text-red-500 hover:text-red-600 hover:bg-red-50"
                      >
                        <UserMinus className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          ) : (
            /* Add Members Tab */
            <div className="space-y-4 py-2">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search PIRs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Selection Summary */}
              {selectedPIRs.length > 0 && (
                <div className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
                  <span className="text-sm font-medium">
                    {selectedPIRs.length} selected
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedPIRs([])}
                  >
                    <X className="mr-1 h-3 w-3" />
                    Clear
                  </Button>
                </div>
              )}

              {/* PIR List */}
              <ScrollArea className="h-[200px]">
                {loadingPIRs ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : availablePIRs.length === 0 ? (
                  <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
                    {searchQuery ? "No PIRs found" : "All PIRs are already members"}
                  </div>
                ) : (
                  <div className="space-y-1">
                    {availablePIRs.map((pir) => (
                      <div
                        key={pir.id}
                        className="flex items-center gap-3 rounded-md p-2 hover:bg-muted/50 cursor-pointer"
                        onClick={() => togglePIRSelection(pir.id)}
                      >
                        <Checkbox
                          checked={selectedPIRs.includes(pir.id)}
                          onCheckedChange={() => togglePIRSelection(pir.id)}
                        />
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-primary/10 text-primary text-xs">
                            {getInitials(getPIRDisplayName(pir))}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {getPIRDisplayName(pir)}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {pir.email}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>

              {/* Notification Toggle */}
              <div className="flex items-center gap-3 rounded-lg border p-3">
                <Checkbox
                  id="sendNotification"
                  checked={sendNotification}
                  onCheckedChange={(checked) =>
                    setSendNotification(checked === true)
                  }
                />
                <div className="flex items-center gap-2">
                  <Bell className="h-4 w-4 text-muted-foreground" />
                  <Label htmlFor="sendNotification" className="cursor-pointer text-sm">
                    Send notification to added members
                  </Label>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="border-t pt-4 mt-4">
          <Button type="button" variant="outline" onClick={handleClose}>
            Close
          </Button>
          {activeTab === "add" && selectedPIRs.length > 0 && (
            <Button
              onClick={handleAddMembers}
              disabled={saving}
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
                  Add {selectedPIRs.length} Member{selectedPIRs.length !== 1 ? "s" : ""}
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default ManageMembersModal
