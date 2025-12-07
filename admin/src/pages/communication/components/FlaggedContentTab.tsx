import { useState, useEffect } from "react"
import {
  db,
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  CURRENT_TENANT,
} from "@/lib/firebase"
import { toast } from "sonner"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
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
  Flag,
  MessageSquare,
  FileText,
  MessageCircle,
  Loader2,
  Eye,
  User,
  Clock,
} from "lucide-react"
import { Timestamp } from "firebase/firestore"
import { formatDate, getInitials } from "@/lib/utils"
import { ContentReviewModal } from "./ContentReviewModal"

export interface ReportedContent {
  id: string
  contentId: string
  contentType: "message" | "post" | "comment"
  contentText: string
  contentAuthorId: string
  contentAuthorName: string
  reportedBy: string
  reporterName: string
  reason: string
  status: "pending" | "resolved"
  resolution?: "approved" | "removed" | "warned"
  resolvedBy?: string
  resolvedAt?: Timestamp
  resolutionNotes?: string
  createdAt: Timestamp
  tenantId: string
}

interface FlaggedContentTabProps {
  onRefreshStats: () => void
}

const CONTENT_TYPE_ICONS = {
  message: MessageSquare,
  post: FileText,
  comment: MessageCircle,
}

const STATUS_STYLES = {
  pending: {
    bg: "bg-amber-100",
    text: "text-amber-700",
    label: "Pending",
  },
  resolved: {
    bg: "bg-green-100",
    text: "text-green-700",
    label: "Resolved",
  },
}

const RESOLUTION_STYLES = {
  approved: {
    bg: "bg-gray-100",
    text: "text-gray-700",
    label: "Approved",
  },
  removed: {
    bg: "bg-red-100",
    text: "text-red-700",
    label: "Removed",
  },
  warned: {
    bg: "bg-amber-100",
    text: "text-amber-700",
    label: "Warned",
  },
}

export function FlaggedContentTab({ onRefreshStats }: FlaggedContentTabProps) {
  const [reports, setReports] = useState<ReportedContent[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "resolved">("pending")
  const [typeFilter, setTypeFilter] = useState<"all" | "message" | "post" | "comment">("all")
  const [reviewingReport, setReviewingReport] = useState<ReportedContent | null>(null)

  // Real-time listener for flagged content
  useEffect(() => {
    const unsubscribe = onSnapshot(
      query(
        collection(db, "reportedContent"),
        where("tenantId", "==", CURRENT_TENANT),
        orderBy("createdAt", "desc")
      ),
      (snapshot) => {
        const reportsData: ReportedContent[] = []
        snapshot.forEach((docSnap) => {
          reportsData.push({
            id: docSnap.id,
            ...docSnap.data(),
          } as ReportedContent)
        })
        setReports(reportsData)
        setLoading(false)
      },
      (error) => {
        console.error("Error listening to reports:", error)
        toast.error("Failed to load flagged content")
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [])

  const handleReviewComplete = () => {
    onRefreshStats()
    setReviewingReport(null)
  }

  // Filter reports
  const filteredReports = reports.filter((report) => {
    const matchesStatus = statusFilter === "all" || report.status === statusFilter
    const matchesType = typeFilter === "all" || report.contentType === typeFilter
    return matchesStatus && matchesType
  })

  const pendingCount = reports.filter((r) => r.status === "pending").length

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <Select
          value={statusFilter}
          onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">
              Pending ({pendingCount})
            </SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={typeFilter}
          onValueChange={(v) => setTypeFilter(v as typeof typeFilter)}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="message">Messages</SelectItem>
            <SelectItem value="post">Posts</SelectItem>
            <SelectItem value="comment">Comments</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Reports List */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : filteredReports.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Flag className="h-16 w-16 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium mb-2">
              {reports.length === 0
                ? "No flagged content"
                : "No reports match filters"}
            </h3>
            <p className="text-sm text-muted-foreground">
              {reports.length === 0
                ? "All content is in good standing."
                : "Try adjusting your filter criteria."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <ScrollArea className="h-[500px]">
          <div className="space-y-3">
            {filteredReports.map((report) => {
              const ContentIcon = CONTENT_TYPE_ICONS[report.contentType] || FileText
              const statusStyle = STATUS_STYLES[report.status]
              const resolutionStyle = report.resolution
                ? RESOLUTION_STYLES[report.resolution]
                : null

              return (
                <Card key={report.id} className="overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        {/* Header */}
                        <div className="flex items-center gap-2 flex-wrap mb-2">
                          <Badge
                            variant="outline"
                            className="gap-1"
                          >
                            <ContentIcon className="h-3 w-3" />
                            {report.contentType}
                          </Badge>
                          <Badge className={`${statusStyle.bg} ${statusStyle.text}`}>
                            {statusStyle.label}
                          </Badge>
                          {resolutionStyle && (
                            <Badge className={`${resolutionStyle.bg} ${resolutionStyle.text}`}>
                              {resolutionStyle.label}
                            </Badge>
                          )}
                        </div>

                        {/* Content Preview */}
                        <p className="text-sm line-clamp-2 mb-3">
                          {report.contentText}
                        </p>

                        {/* Author & Reporter Info */}
                        <div className="flex flex-wrap gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarFallback className="text-xs bg-red-100 text-red-700">
                                {getInitials(report.contentAuthorName)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-muted-foreground">
                              Author: <span className="font-medium text-foreground">{report.contentAuthorName}</span>
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">
                              Reported by: <span className="font-medium text-foreground">{report.reporterName}</span>
                            </span>
                          </div>
                        </div>

                        {/* Reason */}
                        <div className="mt-2 text-sm">
                          <span className="text-muted-foreground">Reason: </span>
                          <span className="italic">{report.reason}</span>
                        </div>

                        {/* Timestamp */}
                        <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {formatDate(report.createdAt?.toDate?.(), "relative")}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="shrink-0">
                        {report.status === "pending" ? (
                          <Button
                            size="sm"
                            onClick={() => setReviewingReport(report)}
                            className="bg-[#069494] hover:bg-[#057a7a]"
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            Review
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setReviewingReport(report)}
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            View
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </ScrollArea>
      )}

      {/* Content Review Modal */}
      <ContentReviewModal
        open={!!reviewingReport}
        report={reviewingReport}
        onClose={() => setReviewingReport(null)}
        onSuccess={handleReviewComplete}
      />
    </div>
  )
}

export default FlaggedContentTab
