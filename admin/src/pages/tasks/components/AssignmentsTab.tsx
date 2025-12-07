import { useState, useEffect, useMemo, useCallback } from "react"
import { useAuth } from "@/contexts/AuthContext"
import {
  db,
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  doc,
  updateDoc,
  addDoc,
  serverTimestamp,
  Timestamp,
} from "@/lib/firebase"
import { toast } from "sonner"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Plus,
  Eye,
  Check,
  ClipboardList,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { formatDate, getInitials } from "@/lib/utils"
import { Assignment, PIRUser, AssignmentStatus, Priority } from "../types"

const CURRENT_TENANT = "full-service"
const ITEMS_PER_PAGE = 20

interface AssignmentsTabProps {
  searchQuery: string
}

function getStatusBadge(status: AssignmentStatus) {
  const styles: Record<AssignmentStatus, { className: string; label: string }> = {
    pending: { className: "bg-amber-100 text-amber-700", label: "Pending" },
    "in-progress": { className: "bg-blue-100 text-blue-700", label: "In Progress" },
    completed: { className: "bg-emerald-100 text-emerald-700", label: "Completed" },
    overdue: { className: "bg-red-100 text-red-700", label: "Overdue" },
  }
  const s = styles[status] || styles.pending
  return <Badge variant="secondary" className={s.className}>{s.label}</Badge>
}

function getPriorityBadge(priority: Priority) {
  const styles: Record<Priority, { className: string; label: string }> = {
    high: { className: "bg-red-100 text-red-700", label: "High" },
    medium: { className: "bg-amber-100 text-amber-700", label: "Medium" },
    low: { className: "bg-gray-100 text-gray-600", label: "Low" },
  }
  const s = styles[priority] || styles.medium
  return <Badge variant="secondary" className={s.className}>{s.label}</Badge>
}

export function AssignmentsTab({ searchQuery }: AssignmentsTabProps) {
  const { adminUser, getDataScope } = useAuth()

  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [users, setUsers] = useState<PIRUser[]>([])
  const [loading, setLoading] = useState(true)

  const [filterStatus, setFilterStatus] = useState("all")
  const [filterPIR, setFilterPIR] = useState("all")
  const [filterPriority, setFilterPriority] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)

  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)

  const loadData = useCallback(async () => {
    if (!adminUser) return

    setLoading(true)
    const scope = getDataScope()

    try {
      // Load PIRs based on scope
      let pirQuery = query(
        collection(db, "users"),
        where("tenantId", "==", CURRENT_TENANT),
        where("role", "==", "pir")
      )

      if (scope === "assigned_pirs" && adminUser.uid) {
        pirQuery = query(
          collection(db, "users"),
          where("tenantId", "==", CURRENT_TENANT),
          where("role", "==", "pir"),
          where("assignedCoach", "==", adminUser.uid)
        )
      }

      const usersSnap = await getDocs(pirQuery)
      const usersData: PIRUser[] = []
      const userMap = new Map<string, string>()
      const allowedPIRIds = new Set<string>()

      usersSnap.forEach((docSnap) => {
        const data = docSnap.data()
        usersData.push({
          id: docSnap.id,
          uid: docSnap.id,
          email: data.email,
          displayName: data.displayName,
          firstName: data.firstName,
          lastName: data.lastName,
        })
        userMap.set(docSnap.id, data.displayName || data.email)
        allowedPIRIds.add(docSnap.id)
      })
      setUsers(usersData)

      // Load assignments
      const assignmentsSnap = await getDocs(
        query(
          collection(db, "assignments"),
          orderBy("createdAt", "desc"),
          limit(500)
        )
      )

      const assignmentsData: Assignment[] = []
      assignmentsSnap.forEach((docSnap) => {
        const data = docSnap.data()
        if (data.pirId && allowedPIRIds.has(data.pirId)) {
          assignmentsData.push({
            id: docSnap.id,
            title: data.title,
            description: data.description,
            pirId: data.pirId,
            pirName: userMap.get(data.pirId) || "Unknown",
            priority: data.priority || "medium",
            status: data.status || "pending",
            dueDate: data.dueDate,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
            completedAt: data.completedAt,
            createdBy: data.createdBy,
            tenantId: data.tenantId,
          })
        }
      })
      setAssignments(assignmentsData)
    } catch (error) {
      console.error("Error loading assignments:", error)
      toast.error("Failed to load assignments")
    } finally {
      setLoading(false)
    }
  }, [adminUser, getDataScope])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [filterStatus, filterPIR, filterPriority, searchQuery])

  const filteredAssignments = useMemo(() => {
    let filtered = assignments

    if (filterStatus !== "all") {
      filtered = filtered.filter((a) => a.status === filterStatus)
    }
    if (filterPIR !== "all") {
      filtered = filtered.filter((a) => a.pirId === filterPIR)
    }
    if (filterPriority !== "all") {
      filtered = filtered.filter((a) => a.priority === filterPriority)
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (a) =>
          a.title?.toLowerCase().includes(q) ||
          a.description?.toLowerCase().includes(q) ||
          a.pirName?.toLowerCase().includes(q)
      )
    }
    return filtered
  }, [assignments, filterStatus, filterPIR, filterPriority, searchQuery])

  const totalPages = Math.ceil(filteredAssignments.length / ITEMS_PER_PAGE)
  const paginatedAssignments = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE
    return filteredAssignments.slice(start, start + ITEMS_PER_PAGE)
  }, [filteredAssignments, currentPage])

  const handleStatusChange = async (assignmentId: string, newStatus: AssignmentStatus) => {
    try {
      const assignmentRef = doc(db, "assignments", assignmentId)
      await updateDoc(assignmentRef, {
        status: newStatus,
        updatedAt: serverTimestamp(),
        ...(newStatus === "completed" ? { completedAt: serverTimestamp() } : {}),
      })
      setAssignments((prev) =>
        prev.map((a) => (a.id === assignmentId ? { ...a, status: newStatus } : a))
      )
      toast.success("Status updated")
    } catch (error) {
      console.error("Error updating status:", error)
      toast.error("Failed to update status")
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex gap-3">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
          <Skeleton className="ml-auto h-10 w-40" />
        </div>
        <Card>
          <CardContent className="p-0">
            <div className="space-y-4 p-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-12 flex-1" />
                  <Skeleton className="h-8 w-24" />
                  <Skeleton className="h-8 w-24" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <Card>
        <CardContent className="flex flex-wrap items-center gap-3 p-4">
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="overdue">Overdue</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterPIR} onValueChange={setFilterPIR}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="PIR" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All PIRs</SelectItem>
              {users.map((u) => (
                <SelectItem key={u.id} value={u.id}>
                  {u.displayName || u.email}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filterPriority} onValueChange={setFilterPriority}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>

          <Button onClick={() => setShowCreateModal(true)} className="ml-auto gap-2">
            <Plus className="h-4 w-4" />
            New Assignment
          </Button>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Assignment</TableHead>
                <TableHead>PIR</TableHead>
                <TableHead className="text-center">Priority</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-center">Due Date</TableHead>
                <TableHead className="text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedAssignments.map((assignment) => (
                <TableRow key={assignment.id}>
                  <TableCell>
                    <div className="font-medium">{assignment.title}</div>
                    {assignment.description && (
                      <div className="mt-1 text-sm text-muted-foreground">
                        {assignment.description.substring(0, 60)}
                        {assignment.description.length > 60 ? "..." : ""}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-primary/10 text-primary text-xs">
                          {getInitials(assignment.pirName)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm">{assignment.pirName}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    {getPriorityBadge(assignment.priority)}
                  </TableCell>
                  <TableCell className="text-center">
                    {getStatusBadge(assignment.status)}
                  </TableCell>
                  <TableCell className="text-center text-sm">
                    {formatDate(assignment.dueDate)}
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex justify-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedAssignment(assignment)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {assignment.status !== "completed" && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-emerald-600 hover:bg-emerald-50"
                          onClick={() => handleStatusChange(assignment.id, "completed")}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredAssignments.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <ClipboardList className="mb-4 h-12 w-12 opacity-30" />
              <p>No assignments found</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t pt-4">
          <p className="text-sm text-muted-foreground">
            Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to{" "}
            {Math.min(currentPage * ITEMS_PER_PAGE, filteredAssignments.length)} of{" "}
            {filteredAssignments.length}
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

      {/* Detail Modal */}
      <Dialog open={!!selectedAssignment} onOpenChange={() => setSelectedAssignment(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assignment Details</DialogTitle>
          </DialogHeader>
          {selectedAssignment && (
            <div className="space-y-4">
              <div>
                <Label className="text-muted-foreground">Title</Label>
                <p className="font-medium">{selectedAssignment.title}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Description</Label>
                <p>{selectedAssignment.description || "No description"}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">PIR</Label>
                  <p>{selectedAssignment.pirName}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Due Date</Label>
                  <p>{formatDate(selectedAssignment.dueDate)}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Status</Label>
                  <div className="mt-1">{getStatusBadge(selectedAssignment.status)}</div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Priority</Label>
                  <div className="mt-1">{getPriorityBadge(selectedAssignment.priority)}</div>
                </div>
              </div>
              <div>
                <Label className="text-muted-foreground">Created</Label>
                <p className="text-sm">{formatDate(selectedAssignment.createdAt, "long")}</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedAssignment(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Modal */}
      <CreateAssignmentModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreated={() => {
          setShowCreateModal(false)
          loadData()
        }}
        users={users}
      />
    </div>
  )
}

// Create Assignment Modal
interface CreateAssignmentModalProps {
  open: boolean
  onClose: () => void
  onCreated: () => void
  users: PIRUser[]
}

function CreateAssignmentModal({ open, onClose, onCreated, users }: CreateAssignmentModalProps) {
  const { adminUser } = useAuth()
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [pirId, setPirId] = useState("")
  const [priority, setPriority] = useState<Priority>("medium")
  const [dueDate, setDueDate] = useState("")
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title || !pirId) {
      toast.error("Please fill in required fields")
      return
    }

    setSaving(true)
    try {
      await addDoc(collection(db, "assignments"), {
        title,
        description,
        pirId,
        priority,
        dueDate: dueDate ? Timestamp.fromDate(new Date(dueDate)) : null,
        status: "pending",
        createdBy: adminUser?.uid,
        createdAt: serverTimestamp(),
        tenantId: CURRENT_TENANT,
      })
      toast.success("Assignment created")
      onCreated()
      // Reset form
      setTitle("")
      setDescription("")
      setPirId("")
      setPriority("medium")
      setDueDate("")
    } catch (error) {
      console.error("Error creating assignment:", error)
      toast.error("Failed to create assignment")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Assignment</DialogTitle>
          <DialogDescription>Create a new assignment for a PIR</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Assignment title"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Assignment description"
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pirId">Assign to PIR *</Label>
            <Select value={pirId} onValueChange={setPirId}>
              <SelectTrigger>
                <SelectValue placeholder="Select PIR" />
              </SelectTrigger>
              <SelectContent>
                {users.map((u) => (
                  <SelectItem key={u.id} value={u.id}>
                    {u.displayName || u.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select value={priority} onValueChange={(v) => setPriority(v as Priority)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="dueDate">Due Date</Label>
              <Input
                id="dueDate"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Creating..." : "Create Assignment"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
