import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Calendar,
  Clock,
  MapPin,
  Video,
  Users,
  MoreVertical,
  Pencil,
  Trash2,
  Repeat,
  ExternalLink,
  Mail,
} from "lucide-react"
import { InvitationStatusBadge, type RSVPCounts } from "./InvitationStatusBadge"
import { Timestamp } from "firebase/firestore"

export interface GLRSMeeting {
  id: string
  title: string
  description?: string
  date: Timestamp | Date
  time: string
  duration: number
  location: string
  address?: string
  isVirtual: boolean
  conferenceUrl?: string
  recurring: boolean
  recurrencePattern?: "daily" | "weekly" | "biweekly" | "monthly"
  maxAttendees?: number
  invitedPIRs: string[]
  status: "scheduled" | "cancelled" | "completed"
  createdBy: string
  createdAt: Timestamp
  updatedAt?: Timestamp
  tenantId: string
}

interface MeetingCardProps {
  meeting: GLRSMeeting
  rsvpCounts?: RSVPCounts
  onEdit: (meeting: GLRSMeeting) => void
  onDelete: (meeting: GLRSMeeting) => void
  onManageRSVPs?: (meeting: GLRSMeeting) => void
}

const STATUS_STYLES = {
  scheduled: {
    bg: "bg-[#069494]/10",
    text: "text-[#069494]",
    label: "Scheduled",
  },
  cancelled: {
    bg: "bg-red-100",
    text: "text-red-700",
    label: "Cancelled",
  },
  completed: {
    bg: "bg-gray-100",
    text: "text-gray-700",
    label: "Completed",
  },
}

const RECURRENCE_LABELS = {
  daily: "Daily",
  weekly: "Weekly",
  biweekly: "Bi-weekly",
  monthly: "Monthly",
}

function formatMeetingDate(date: Timestamp | Date): string {
  if (!date) return "N/A"
  const dateObj = date instanceof Date ? date : date.toDate()
  return dateObj.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (mins === 0) return `${hours}h`
  return `${hours}h ${mins}m`
}

export function MeetingCard({ meeting, rsvpCounts, onEdit, onDelete, onManageRSVPs }: MeetingCardProps) {
  const statusStyle = STATUS_STYLES[meeting.status] || STATUS_STYLES.scheduled

  return (
    <Card className="overflow-hidden transition-shadow hover:shadow-md">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          {/* Main Content */}
          <div className="min-w-0 flex-1">
            {/* Title & Status */}
            <div className="flex items-start gap-2">
              <h3 className="font-semibold text-foreground truncate">
                {meeting.title}
              </h3>
              <Badge className={`${statusStyle.bg} ${statusStyle.text} shrink-0`}>
                {statusStyle.label}
              </Badge>
            </div>

            {/* Description */}
            {meeting.description && (
              <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                {meeting.description}
              </p>
            )}

            {/* Details Grid */}
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {/* Date & Time */}
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-[#069494]" />
                <span>{formatMeetingDate(meeting.date)}</span>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>
                  {meeting.time} ({formatDuration(meeting.duration)})
                </span>
              </div>

              {/* Location */}
              <div className="flex items-center gap-2 text-sm">
                {meeting.isVirtual ? (
                  <>
                    <Video className="h-4 w-4 text-purple-600" />
                    <span className="text-purple-600">Virtual Meeting</span>
                  </>
                ) : (
                  <>
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="truncate">{meeting.location}</span>
                  </>
                )}
              </div>

              {/* Attendees */}
              {rsvpCounts ? (
                <div className="flex items-center gap-2 text-sm sm:col-span-2">
                  <InvitationStatusBadge counts={rsvpCounts} compact />
                  {meeting.maxAttendees && (
                    <span className="text-muted-foreground">
                      / {meeting.maxAttendees} max
                    </span>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {meeting.invitedPIRs.length} invited
                    {meeting.maxAttendees && ` / ${meeting.maxAttendees} max`}
                  </span>
                </div>
              )}
            </div>

            {/* Tags */}
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {meeting.recurring && meeting.recurrencePattern && (
                <Badge variant="outline" className="text-xs">
                  <Repeat className="mr-1 h-3 w-3" />
                  {RECURRENCE_LABELS[meeting.recurrencePattern]}
                </Badge>
              )}
              {meeting.isVirtual && meeting.conferenceUrl && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-xs text-purple-600 hover:text-purple-700"
                  onClick={() => window.open(meeting.conferenceUrl, "_blank")}
                >
                  <ExternalLink className="mr-1 h-3 w-3" />
                  Join Meeting
                </Button>
              )}
            </div>
          </div>

          {/* Actions Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="shrink-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(meeting)}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit Meeting
              </DropdownMenuItem>
              {onManageRSVPs && (
                <DropdownMenuItem onClick={() => onManageRSVPs(meeting)}>
                  <Mail className="mr-2 h-4 w-4" />
                  Manage Invitations
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onDelete(meeting)}
                className="text-red-600 focus:text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Meeting
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  )
}

export default MeetingCard
