import { useState, useEffect } from "react"
import {
  db,
  collection,
  query,
  where,
  getDocs,
  orderBy,
  CURRENT_TENANT,
} from "@/lib/firebase"
import { toast } from "sonner"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  AlertTriangle,
  Plus,
  Search,
  Loader2,
  User,
  Clock,
  Ban,
  CheckCircle,
} from "lucide-react"
import { Timestamp } from "firebase/firestore"
import { formatDate, getInitials } from "@/lib/utils"
import { IssueWarningModal } from "./IssueWarningModal"
import { BanUserModal } from "./BanUserModal"

export interface UserWarning {
  id: string
  userId: string
  userName: string
  type: "content_violation" | "harassment" | "spam" | "other"
  contentId?: string
  reason: string
  issuedBy: string
  issuedByName: string
  createdAt: Timestamp
  acknowledged: boolean
  tenantId: string
}

interface UserWarningsTabProps {
  onRefreshStats: () => void
}

const WARNING_TYPE_LABELS: Record<string, { label: string; bg: string; text: string }> = {
  content_violation: { label: "Content Violation", bg: "bg-red-100", text: "text-red-700" },
  harassment: { label: "Harassment", bg: "bg-orange-100", text: "text-orange-700" },
  spam: { label: "Spam", bg: "bg-purple-100", text: "text-purple-700" },
  other: { label: "Other", bg: "bg-gray-100", text: "text-gray-700" },
}

export function UserWarningsTab({ onRefreshStats }: UserWarningsTabProps) {
  const [warnings, setWarnings] = useState<UserWarning[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [typeFilter, setTypeFilter] = useState<"all" | UserWarning["type"]>("all")
  const [statusFilter, setStatusFilter] = useState<"all" | "acknowledged" | "pending">("all")
  const [showIssueWarning, setShowIssueWarning] = useState(false)
  const [banningUser, setBanningUser] = useState<{ id: string; name: string } | null>(null)

  useEffect(() => {
    loadWarnings()
  }, [])

  const loadWarnings = async () => {
    setLoading(true)
    try {
      const warningsSnap = await getDocs(
        query(
          collection(db, "userWarnings"),
          where("tenantId", "==", CURRENT_TENANT),
          orderBy("createdAt", "desc")
        )
      )

      const warningsData: UserWarning[] = []
      warningsSnap.forEach((doc) => {
        warningsData.push({
          id: doc.id,
          ...doc.data(),
        } as UserWarning)
      })
      setWarnings(warningsData)
    } catch (error) {
      console.error("Error loading warnings:", error)
      toast.error("Failed to load warnings")
    } finally {
      setLoading(false)
    }
  }

  const handleSuccess = () => {
    loadWarnings()
    onRefreshStats()
  }

  // Filter warnings
  const filteredWarnings = warnings.filter((warning) => {
    const matchesSearch =
      searchQuery === "" ||
      warning.userName.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = typeFilter === "all" || warning.type === typeFilter
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "acknowledged" && warning.acknowledged) ||
      (statusFilter === "pending" && !warning.acknowledged)
    return matchesSearch && matchesType && matchesStatus
  })

  // Group warnings by user for warning count
  const userWarningCounts = warnings.reduce((acc, warning) => {
    acc[warning.userId] = (acc[warning.userId] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return (
    <div className="space-y-4">
      {/* Actions Bar */}
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div className="flex flex-wrap gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by user..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-[200px]"
            />
          </div>

          {/* Type Filter */}
          <Select
            value={typeFilter}
            onValueChange={(v) => setTypeFilter(v as typeof typeFilter)}
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="content_violation">Content Violation</SelectItem>
              <SelectItem value="harassment">Harassment</SelectItem>
              <SelectItem value="spam">Spam</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>

          {/* Status Filter */}
          <Select
            value={statusFilter}
            onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="acknowledged">Acknowledged</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Issue Warning Button */}
        <Button
          onClick={() => setShowIssueWarning(true)}
          className="bg-amber-600 hover:bg-amber-700"
        >
          <Plus className="mr-2 h-4 w-4" />
          Issue Warning
        </Button>
      </div>

      {/* Warnings List */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : filteredWarnings.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <AlertTriangle className="h-16 w-16 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium mb-2">
              {warnings.length === 0
                ? "No warnings issued"
                : "No warnings match filters"}
            </h3>
            <p className="text-sm text-muted-foreground">
              {warnings.length === 0
                ? "All users are in good standing."
                : "Try adjusting your filter criteria."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <ScrollArea className="h-[500px]">
          <div className="space-y-3">
            {filteredWarnings.map((warning) => {
              const typeStyle = WARNING_TYPE_LABELS[warning.type] || WARNING_TYPE_LABELS.other
              const warningCount = userWarningCounts[warning.userId] || 0

              return (
                <Card key={warning.id} className="overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex gap-3">
                        {/* User Avatar */}
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-amber-100 text-amber-700">
                            {getInitials(warning.userName)}
                          </AvatarFallback>
                        </Avatar>

                        {/* Warning Details */}
                        <div className="flex-1 min-w-0">
                          {/* User & Type */}
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className="font-medium">{warning.userName}</span>
                            <Badge className={`${typeStyle.bg} ${typeStyle.text}`}>
                              {typeStyle.label}
                            </Badge>
                            {warning.acknowledged ? (
                              <Badge variant="outline" className="gap-1 text-green-600 border-green-200">
                                <CheckCircle className="h-3 w-3" />
                                Acknowledged
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="gap-1 text-amber-600 border-amber-200">
                                <Clock className="h-3 w-3" />
                                Pending
                              </Badge>
                            )}
                            {warningCount >= 3 && (
                              <Badge className="bg-red-100 text-red-700">
                                {warningCount} warnings
                              </Badge>
                            )}
                          </div>

                          {/* Reason */}
                          <p className="text-sm text-muted-foreground mb-2">
                            {warning.reason}
                          </p>

                          {/* Meta */}
                          <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              Issued by: {warning.issuedByName}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatDate(warning.createdAt?.toDate?.(), "relative")}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      {warningCount >= 3 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setBanningUser({ id: warning.userId, name: warning.userName })}
                          className="text-red-600 border-red-200 hover:bg-red-50"
                        >
                          <Ban className="mr-2 h-4 w-4" />
                          Ban User
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </ScrollArea>
      )}

      {/* Issue Warning Modal */}
      <IssueWarningModal
        open={showIssueWarning}
        onClose={() => setShowIssueWarning(false)}
        onSuccess={handleSuccess}
      />

      {/* Ban User Modal */}
      <BanUserModal
        open={!!banningUser}
        userId={banningUser?.id || ""}
        userName={banningUser?.name || ""}
        onClose={() => setBanningUser(null)}
        onSuccess={handleSuccess}
      />
    </div>
  )
}

export default UserWarningsTab
