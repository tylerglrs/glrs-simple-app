import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Users,
  Shield,
  Calendar,
  MoreVertical,
  Pencil,
  UserPlus,
  Trash2,
  Lock,
  Unlock,
  Mail,
} from "lucide-react"
import { Timestamp } from "firebase/firestore"

export interface SupportGroup {
  id: string
  name: string
  description: string
  type: "open" | "closed" | "invite-only"
  facilitators: string[]
  facilitatorNames?: string[]
  members: string[]
  maxMembers?: number
  meetingSchedule?: {
    day: string
    time: string
    recurring: boolean
  }
  isActive: boolean
  createdBy: string
  createdAt: Timestamp
  updatedAt?: Timestamp
  tenantId: string
}

interface SupportGroupCardProps {
  group: SupportGroup
  onEdit: (group: SupportGroup) => void
  onManageMembers: (group: SupportGroup) => void
  onDelete: (group: SupportGroup) => void
}

const TYPE_STYLES = {
  open: {
    bg: "bg-green-100",
    text: "text-green-700",
    icon: Unlock,
    label: "Open",
  },
  closed: {
    bg: "bg-amber-100",
    text: "text-amber-700",
    icon: Lock,
    label: "Closed",
  },
  "invite-only": {
    bg: "bg-blue-100",
    text: "text-blue-700",
    icon: Mail,
    label: "Invite Only",
  },
}

const DAY_ABBREVIATIONS: Record<string, string> = {
  Monday: "Mon",
  Tuesday: "Tue",
  Wednesday: "Wed",
  Thursday: "Thu",
  Friday: "Fri",
  Saturday: "Sat",
  Sunday: "Sun",
}

function formatTime(time: string): string {
  const [hours, minutes] = time.split(":")
  const hour = parseInt(hours)
  const ampm = hour >= 12 ? "PM" : "AM"
  const hour12 = hour % 12 || 12
  return `${hour12}:${minutes} ${ampm}`
}

export function SupportGroupCard({
  group,
  onEdit,
  onManageMembers,
  onDelete,
}: SupportGroupCardProps) {
  const typeStyle = TYPE_STYLES[group.type] || TYPE_STYLES.open
  const TypeIcon = typeStyle.icon

  // Get first 5 members for avatar display
  const displayMembers = group.members.slice(0, 5)
  const remainingMembers = group.members.length - 5

  return (
    <Card className="overflow-hidden transition-shadow hover:shadow-md">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          {/* Main Content */}
          <div className="min-w-0 flex-1">
            {/* Title & Type Badge */}
            <div className="flex items-start gap-2">
              <h3 className="font-semibold text-foreground truncate">
                {group.name}
              </h3>
              <Badge className={`${typeStyle.bg} ${typeStyle.text} shrink-0`}>
                <TypeIcon className="mr-1 h-3 w-3" />
                {typeStyle.label}
              </Badge>
            </div>

            {/* Description */}
            {group.description && (
              <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                {group.description}
              </p>
            )}

            {/* Details Grid */}
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {/* Member Count */}
              <div className="flex items-center gap-2 text-sm">
                <Users className="h-4 w-4 text-[#069494]" />
                <span>
                  {group.members.length} member{group.members.length !== 1 ? "s" : ""}
                  {group.maxMembers && ` / ${group.maxMembers} max`}
                </span>
              </div>

              {/* Meeting Schedule */}
              {group.meetingSchedule && (
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {DAY_ABBREVIATIONS[group.meetingSchedule.day] || group.meetingSchedule.day}{" "}
                    {formatTime(group.meetingSchedule.time)}
                    {group.meetingSchedule.recurring && " (Weekly)"}
                  </span>
                </div>
              )}

              {/* Facilitators */}
              {group.facilitatorNames && group.facilitatorNames.length > 0 && (
                <div className="flex items-center gap-2 text-sm sm:col-span-2">
                  <Shield className="h-4 w-4 text-purple-600" />
                  <span className="truncate">
                    {group.facilitatorNames.join(", ")}
                  </span>
                </div>
              )}
            </div>

            {/* Member Avatars */}
            {group.members.length > 0 && (
              <div className="mt-3 flex items-center">
                <div className="flex -space-x-2">
                  {displayMembers.map((memberId, index) => (
                    <Avatar
                      key={memberId}
                      className="h-8 w-8 border-2 border-background"
                    >
                      <AvatarFallback className="bg-primary/10 text-primary text-xs">
                        {index + 1}
                      </AvatarFallback>
                    </Avatar>
                  ))}
                </div>
                {remainingMembers > 0 && (
                  <span className="ml-2 text-sm text-muted-foreground">
                    +{remainingMembers} more
                  </span>
                )}
              </div>
            )}

            {/* Status Badge */}
            {!group.isActive && (
              <Badge variant="secondary" className="mt-2">
                Inactive
              </Badge>
            )}
          </div>

          {/* Actions Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="shrink-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(group)}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit Group
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onManageMembers(group)}>
                <UserPlus className="mr-2 h-4 w-4" />
                Manage Members
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onDelete(group)}
                className="text-red-600 focus:text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Group
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  )
}

export default SupportGroupCard
