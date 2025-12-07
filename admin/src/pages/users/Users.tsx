import { useState, useEffect, useCallback, useMemo } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { useAuth } from "@/contexts/AuthContext"
import {
  db,
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  logAudit,
} from "@/lib/firebase"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
import { Search, ChevronLeft, ChevronRight } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import {
  UserCard,
  UserCardSkeleton,
  UserFilters,
  UserFiltersSkeleton,
  CreateUserModal,
  BulkActionsBar,
} from "./components"
import {
  User,
  Coach,
  TabType,
  StatusFilter,
  ComplianceFilter,
  ComplianceLevel,
} from "./types"

// Items per page
const ITEMS_PER_PAGE = 20

// Tenant ID
const CURRENT_TENANT = "full-service"

export function Users() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { adminUser, getDataScope } = useAuth()

  // Data state
  const [users, setUsers] = useState<User[]>([])
  const [coaches, setCoaches] = useState<Coach[]>([])
  const [loading, setLoading] = useState(true)

  // UI state
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState<TabType>("pir")
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")
  const [complianceFilter, setComplianceFilter] = useState<ComplianceFilter>("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [userToDelete, setUserToDelete] = useState<User | null>(null)

  // Selection state (for bulk actions)
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set())

  // Check for action param on mount
  useEffect(() => {
    if (searchParams.get("action") === "create") {
      setShowCreateModal(true)
    }
  }, [searchParams])

  // Calculate compliance level from percentage
  const getComplianceLevel = (compliance: number | undefined): ComplianceLevel => {
    if (compliance === undefined) return "unknown"
    if (compliance >= 80) return "high"
    if (compliance >= 50) return "medium"
    return "low"
  }

  // Load all users data
  const loadUsers = useCallback(async () => {
    if (!adminUser) return

    setLoading(true)
    const scope = getDataScope()

    try {
      // Load coaches first for PIR mapping
      const coachesSnap = await getDocs(
        query(
          collection(db, "users"),
          where("tenantId", "==", CURRENT_TENANT),
          where("role", "in", ["admin", "coach", "superadmin", "superadmin1"])
        )
      )

      const coachMap = new Map<string, Coach>()
      const coachesList: Coach[] = []

      coachesSnap.forEach((doc) => {
        const data = doc.data()
        const coach: Coach = {
          id: doc.id,
          uid: doc.id,
          email: data.email,
          displayName: data.displayName,
          firstName: data.firstName,
          lastName: data.lastName,
          pirCount: 0,
          capacity: data.capacity,
        }
        coachMap.set(doc.id, coach)
        if (data.role === "coach") {
          coachesList.push(coach)
        }
      })

      // Load all users
      let usersQuery = query(
        collection(db, "users"),
        where("tenantId", "==", CURRENT_TENANT)
      )

      // Apply scope filtering for coaches (they only see their PIRs)
      if (scope === "assigned_pirs" && adminUser.uid) {
        usersQuery = query(
          collection(db, "users"),
          where("tenantId", "==", CURRENT_TENANT),
          where("assignedCoach", "==", adminUser.uid)
        )
      }

      const usersSnap = await getDocs(usersQuery)
      const usersList: User[] = []

      // Count PIRs per coach
      const pirCounts = new Map<string, number>()

      usersSnap.forEach((docSnap) => {
        const data = docSnap.data()
        const coach = data.assignedCoach ? coachMap.get(data.assignedCoach) : undefined

        // Count PIRs for coaches
        if (data.role === "pir" && data.assignedCoach) {
          pirCounts.set(data.assignedCoach, (pirCounts.get(data.assignedCoach) || 0) + 1)
        }

        usersList.push({
          id: docSnap.id,
          uid: data.uid || docSnap.id,
          email: data.email,
          displayName: data.displayName,
          firstName: data.firstName,
          lastName: data.lastName,
          role: data.role,
          tenantId: data.tenantId,
          active: data.active !== false,
          profileImageUrl: data.profileImageUrl,
          phone: data.phone,
          createdAt: data.createdAt,
          lastLogin: data.lastLogin,
          assignedCoach: data.assignedCoach,
          coachName: coach?.displayName || coach?.firstName || undefined,
          sobrietyDate: data.sobrietyDate,
          lastCheckIn: data.lastCheckIn,
          checkInStreak: data.checkInStreak,
          compliance: data.compliance,
          complianceLevel: getComplianceLevel(data.compliance),
          pirCount: data.pirCount,
          capacity: data.capacity,
        })
      })

      // Update coach PIR counts
      coachesList.forEach((coach) => {
        coach.pirCount = pirCounts.get(coach.id) || 0
      })

      setUsers(usersList)
      setCoaches(coachesList)
    } catch (error) {
      console.error("Error loading users:", error)
      toast.error("Failed to load users")
    } finally {
      setLoading(false)
    }
  }, [adminUser, getDataScope])

  useEffect(() => {
    loadUsers()
  }, [loadUsers])

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1)
    setSelectedUsers(new Set())
  }, [activeTab, statusFilter, complianceFilter, searchQuery])

  // Filter users based on current tab and filters
  const filteredUsers = useMemo(() => {
    let result = users

    // Filter by role (tab)
    if (activeTab === "pir") {
      result = result.filter((u) => u.role === "pir")
    } else if (activeTab === "coach") {
      result = result.filter((u) => u.role === "coach")
    } else if (activeTab === "admin") {
      result = result.filter((u) =>
        ["admin", "superadmin", "superadmin1"].includes(u.role)
      )
    }

    // Filter by status
    if (statusFilter !== "all") {
      if (statusFilter === "active") {
        result = result.filter((u) => u.active)
      } else if (statusFilter === "inactive") {
        result = result.filter((u) => !u.active)
      } else if (statusFilter === "critical") {
        result = result.filter((u) => {
          if (!u.active) return false
          if (u.role !== "pir") return false
          const daysSinceCheckIn = u.lastCheckIn
            ? Math.floor(
                (Date.now() -
                  (u.lastCheckIn instanceof Date
                    ? u.lastCheckIn
                    : u.lastCheckIn?.toDate?.()
                  ).getTime()) /
                  (1000 * 60 * 60 * 24)
              )
            : 999
          return daysSinceCheckIn > 3 || (u.compliance !== undefined && u.compliance < 50)
        })
      }
    }

    // Filter by compliance (PIRs only)
    if (activeTab === "pir" && complianceFilter !== "all") {
      result = result.filter((u) => u.complianceLevel === complianceFilter)
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (u) =>
          u.email?.toLowerCase().includes(query) ||
          u.displayName?.toLowerCase().includes(query) ||
          u.firstName?.toLowerCase().includes(query) ||
          u.lastName?.toLowerCase().includes(query)
      )
    }

    return result
  }, [users, activeTab, statusFilter, complianceFilter, searchQuery])

  // Pagination
  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE)
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE
    return filteredUsers.slice(start, start + ITEMS_PER_PAGE)
  }, [filteredUsers, currentPage])

  // User counts per tab
  const counts = useMemo(() => {
    return {
      pir: users.filter((u) => u.role === "pir").length,
      coach: users.filter((u) => u.role === "coach").length,
      admin: users.filter((u) =>
        ["admin", "superadmin", "superadmin1"].includes(u.role)
      ).length,
    }
  }, [users])

  // Handlers
  const handleViewUser = (user: User) => {
    navigate(`/users/${user.id}`)
  }

  const handleEditUser = (user: User) => {
    navigate(`/users/${user.id}?edit=true`)
  }

  const handleDeleteUser = async () => {
    if (!userToDelete) return

    try {
      // Soft delete - just mark as inactive
      const userRef = doc(db, "users", userToDelete.id)
      await updateDoc(userRef, {
        active: false,
        deactivatedAt: new Date(),
      })

      await logAudit("user_deactivated", {
        targetUserId: userToDelete.id,
        resource: "users",
        resourceId: userToDelete.id,
      })

      toast.success("User deactivated successfully")
      loadUsers()
    } catch (error) {
      console.error("Error deleting user:", error)
      toast.error("Failed to deactivate user")
    } finally {
      setUserToDelete(null)
    }
  }

  const handleSelectUser = (user: User, selected: boolean) => {
    setSelectedUsers((prev) => {
      const next = new Set(prev)
      if (selected) {
        next.add(user.id)
      } else {
        next.delete(user.id)
      }
      return next
    })
  }

  // Select All handlers
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = new Set(paginatedUsers.map((u) => u.id))
      setSelectedUsers(allIds)
    } else {
      setSelectedUsers(new Set())
    }
  }

  const isAllSelected =
    paginatedUsers.length > 0 &&
    paginatedUsers.every((u) => selectedUsers.has(u.id))

  const isSomeSelected =
    paginatedUsers.some((u) => selectedUsers.has(u.id)) && !isAllSelected

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground lg:text-3xl">Users</h1>
          <p className="mt-1 text-muted-foreground">
            Manage PIRs, coaches, and administrators
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Filters */}
      {loading ? (
        <UserFiltersSkeleton />
      ) : (
        <UserFilters
          activeTab={activeTab}
          onTabChange={setActiveTab}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          complianceFilter={complianceFilter}
          onComplianceFilterChange={setComplianceFilter}
          counts={counts}
          onCreateUser={() => setShowCreateModal(true)}
        />
      )}

      {/* Bulk Actions Bar */}
      {selectedUsers.size > 0 && (
        <BulkActionsBar
          selectedCount={selectedUsers.size}
          selectedUsers={selectedUsers}
          users={users}
          coaches={coaches}
          onClearSelection={() => setSelectedUsers(new Set())}
          onRefresh={loadUsers}
        />
      )}

      {/* Select All Header */}
      {!loading && paginatedUsers.length > 0 && (
        <div className="flex items-center gap-3 rounded-lg border bg-muted/30 px-4 py-2">
          <Checkbox
            id="select-all"
            checked={isAllSelected}
            onCheckedChange={handleSelectAll}
            className="data-[state=checked]:bg-primary"
          />
          <label
            htmlFor="select-all"
            className="text-sm font-medium text-muted-foreground cursor-pointer"
          >
            {isAllSelected
              ? `All ${paginatedUsers.length} on this page selected`
              : isSomeSelected
              ? `${selectedUsers.size} selected`
              : "Select all on this page"}
          </label>
        </div>
      )}

      {/* Users Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          // Skeleton loading
          Array.from({ length: 6 }).map((_, i) => <UserCardSkeleton key={i} />)
        ) : paginatedUsers.length > 0 ? (
          paginatedUsers.map((user) => (
            <UserCard
              key={user.id}
              user={user}
              onView={handleViewUser}
              onEdit={handleEditUser}
              onDelete={setUserToDelete}
              selected={selectedUsers.has(user.id)}
              onSelect={handleSelectUser}
            />
          ))
        ) : (
          <div className="col-span-full py-12 text-center">
            <p className="text-muted-foreground">No users found</p>
            {searchQuery && (
              <Button
                variant="link"
                onClick={() => setSearchQuery("")}
                className="mt-2"
              >
                Clear search
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-between border-t pt-4">
          <p className="text-sm text-muted-foreground">
            Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to{" "}
            {Math.min(currentPage * ITEMS_PER_PAGE, filteredUsers.length)} of{" "}
            {filteredUsers.length} users
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Create User Modal */}
      <CreateUserModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={loadUsers}
        defaultRole={activeTab === "admin" ? "admin" : activeTab}
        coaches={coaches}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!userToDelete} onOpenChange={() => setUserToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deactivate User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to deactivate{" "}
              <strong>
                {userToDelete?.displayName ||
                  `${userToDelete?.firstName} ${userToDelete?.lastName}`}
              </strong>
              ? They will no longer be able to access the platform.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteUser}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Deactivate
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default Users
