import { useState, useEffect } from "react"
import {
  db,
  collection,
  query,
  where,
  deleteDoc,
  doc,
  orderBy,
  onSnapshot,
  CURRENT_TENANT,
} from "@/lib/firebase"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
  Users,
  Plus,
  Search,
  Loader2,
  UsersRound,
  UserCheck,
  Filter,
} from "lucide-react"
import { SupportGroupCard, type SupportGroup } from "./SupportGroupCard"
import { CreateGroupModal } from "./CreateGroupModal"
import { EditGroupModal } from "./EditGroupModal"
import { ManageMembersModal } from "./ManageMembersModal"

type FilterStatus = "all" | "active" | "inactive"
type FilterType = "all" | "open" | "closed" | "invite-only"

export function SupportGroupsTab() {
  const [groups, setGroups] = useState<SupportGroup[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all")
  const [filterType, setFilterType] = useState<FilterType>("all")

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingGroup, setEditingGroup] = useState<SupportGroup | null>(null)
  const [managingGroup, setManagingGroup] = useState<SupportGroup | null>(null)
  const [deletingGroup, setDeletingGroup] = useState<SupportGroup | null>(null)
  const [deleting, setDeleting] = useState(false)

  // Real-time listener for support groups
  useEffect(() => {
    const unsubscribe = onSnapshot(
      query(
        collection(db, "supportGroups"),
        where("tenantId", "==", CURRENT_TENANT),
        orderBy("createdAt", "desc")
      ),
      (snapshot) => {
        const groupsData: SupportGroup[] = []
        snapshot.forEach((docSnap) => {
          groupsData.push({
            id: docSnap.id,
            ...docSnap.data(),
          } as SupportGroup)
        })
        setGroups(groupsData)
        setLoading(false)
      },
      (error) => {
        console.error("Error listening to support groups:", error)
        toast.error("Failed to load support groups")
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [])

  const handleDeleteGroup = async () => {
    if (!deletingGroup) return

    setDeleting(true)
    try {
      await deleteDoc(doc(db, "supportGroups", deletingGroup.id))
      toast.success("Support group deleted")
      setDeletingGroup(null)
    } catch (error) {
      console.error("Error deleting group:", error)
      toast.error("Failed to delete support group")
    } finally {
      setDeleting(false)
    }
  }

  // Filter groups
  const filteredGroups = groups.filter((group) => {
    // Search filter
    const matchesSearch =
      searchQuery === "" ||
      group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      group.description?.toLowerCase().includes(searchQuery.toLowerCase())

    // Status filter
    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "active" && group.isActive) ||
      (filterStatus === "inactive" && !group.isActive)

    // Type filter
    const matchesType = filterType === "all" || group.type === filterType

    return matchesSearch && matchesStatus && matchesType
  })

  // Calculate stats
  const stats = {
    total: groups.length,
    active: groups.filter((g) => g.isActive).length,
    totalMembers: groups.reduce((sum, g) => sum + (g.members?.length || 0), 0),
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="rounded-full bg-[#069494]/10 p-3">
              <UsersRound className="h-6 w-6 text-[#069494]" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Groups</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="rounded-full bg-green-100 p-3">
              <UserCheck className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Active Groups</p>
              <p className="text-2xl font-bold">{stats.active}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="rounded-full bg-purple-100 p-3">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Members</p>
              <p className="text-2xl font-bold">{stats.totalMembers}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 gap-3">
          {/* Search */}
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search groups..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Status Filter */}
          <Select
            value={filterStatus}
            onValueChange={(v) => setFilterStatus(v as FilterStatus)}
          >
            <SelectTrigger className="w-[130px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>

          {/* Type Filter */}
          <Select
            value={filterType}
            onValueChange={(v) => setFilterType(v as FilterType)}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
              <SelectItem value="invite-only">Invite Only</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Create Button */}
        <Button
          onClick={() => setShowCreateModal(true)}
          className="bg-[#069494] hover:bg-[#057a7a]"
        >
          <Plus className="mr-2 h-4 w-4" />
          Create Group
        </Button>
      </div>

      {/* Groups Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : filteredGroups.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <UsersRound className="h-16 w-16 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium mb-2">
              {groups.length === 0
                ? "No support groups yet"
                : "No groups match your filters"}
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              {groups.length === 0
                ? "Create your first support group to help PIRs connect and recover together."
                : "Try adjusting your search or filter criteria."}
            </p>
            {groups.length === 0 && (
              <Button
                onClick={() => setShowCreateModal(true)}
                className="bg-[#069494] hover:bg-[#057a7a]"
              >
                <Plus className="mr-2 h-4 w-4" />
                Create Group
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredGroups.map((group) => (
            <SupportGroupCard
              key={group.id}
              group={group}
              onEdit={setEditingGroup}
              onManageMembers={setManagingGroup}
              onDelete={setDeletingGroup}
            />
          ))}
        </div>
      )}

      {/* Create Modal */}
      <CreateGroupModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />

      {/* Edit Modal */}
      <EditGroupModal
        open={!!editingGroup}
        group={editingGroup}
        onClose={() => setEditingGroup(null)}
      />

      {/* Manage Members Modal */}
      <ManageMembersModal
        open={!!managingGroup}
        group={managingGroup}
        onClose={() => setManagingGroup(null)}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deletingGroup}
        onOpenChange={(open) => !open && setDeletingGroup(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Support Group</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deletingGroup?.name}"? This will
              remove all {deletingGroup?.members?.length || 0} members from the
              group. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteGroup}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Group"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default SupportGroupsTab
