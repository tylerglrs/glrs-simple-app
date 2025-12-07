import { User, UserStatus, ComplianceLevel } from "../types"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  User as UserIcon,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  Phone,
  Calendar,
  Award,
  Activity,
  Shield,
} from "lucide-react"
import { formatDate, getInitials, calculateSobrietyDays } from "@/lib/utils"

interface UserCardProps {
  user: User
  onView: (user: User) => void
  onEdit: (user: User) => void
  onDelete: (user: User) => void
  selected?: boolean
  onSelect?: (user: User, selected: boolean) => void
}

function getStatusColor(user: User): { bg: string; text: string; label: UserStatus } {
  if (!user.active) {
    return { bg: "bg-gray-100", text: "text-gray-700", label: "inactive" }
  }

  // For PIRs, check compliance and last check-in
  if (user.role === "pir") {
    const daysSinceCheckIn = user.lastCheckIn
      ? Math.floor((Date.now() - (user.lastCheckIn instanceof Date ? user.lastCheckIn : user.lastCheckIn?.toDate?.()).getTime()) / (1000 * 60 * 60 * 24))
      : 999

    if (daysSinceCheckIn > 3 || (user.compliance !== undefined && user.compliance < 50)) {
      return { bg: "bg-red-100", text: "text-red-700", label: "critical" }
    }
  }

  return { bg: "bg-emerald-100", text: "text-emerald-700", label: "active" }
}

function getComplianceColor(level: ComplianceLevel | undefined): string {
  switch (level) {
    case "high":
      return "bg-emerald-100 text-emerald-700"
    case "medium":
      return "bg-amber-100 text-amber-700"
    case "low":
      return "bg-red-100 text-red-700"
    default:
      return "bg-gray-100 text-gray-700"
  }
}

function getRoleBadgeColor(role: string): string {
  switch (role) {
    case "superadmin":
    case "superadmin1":
      return "bg-purple-100 text-purple-700"
    case "admin":
      return "bg-blue-100 text-blue-700"
    case "coach":
      return "bg-teal-100 text-teal-700"
    default:
      return "bg-gray-100 text-gray-700"
  }
}

export function UserCard({
  user,
  onView,
  onEdit,
  onDelete,
  selected,
  onSelect,
}: UserCardProps) {
  const displayName = user.displayName || `${user.firstName || ""} ${user.lastName || ""}`.trim() || "Unknown"
  const status = getStatusColor(user)
  const daysSober = user.sobrietyDate ? calculateSobrietyDays(user.sobrietyDate) : 0

  return (
    <Card className={`transition-all hover:shadow-md ${selected ? "ring-2 ring-primary" : ""}`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          {/* Selection checkbox */}
          {onSelect && (
            <input
              type="checkbox"
              checked={selected}
              onChange={(e) => onSelect(user, e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
            />
          )}

          {/* Avatar */}
          <Avatar className="h-12 w-12 flex-shrink-0">
            <AvatarImage src={user.profileImageUrl} alt={displayName} />
            <AvatarFallback className="bg-primary/10 text-primary">
              {getInitials(displayName)}
            </AvatarFallback>
          </Avatar>

          {/* User Info */}
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="truncate font-semibold text-foreground">{displayName}</h3>
                <p className="truncate text-sm text-muted-foreground">{user.email}</p>
              </div>

              {/* Actions Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onView(user)}>
                    <Eye className="mr-2 h-4 w-4" />
                    View Details
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onEdit(user)}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => onDelete(user)}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Badges */}
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <Badge variant="secondary" className={status.bg + " " + status.text}>
                {status.label}
              </Badge>

              {user.role !== "pir" && (
                <Badge variant="secondary" className={getRoleBadgeColor(user.role)}>
                  <Shield className="mr-1 h-3 w-3" />
                  {user.role}
                </Badge>
              )}

              {user.role === "pir" && user.complianceLevel && (
                <Badge variant="secondary" className={getComplianceColor(user.complianceLevel)}>
                  <Activity className="mr-1 h-3 w-3" />
                  {user.complianceLevel} compliance
                </Badge>
              )}
            </div>

            {/* PIR-specific info */}
            {user.role === "pir" && (
              <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                {daysSober > 0 && (
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Award className="h-3.5 w-3.5 text-amber-500" />
                    <span>{daysSober} days sober</span>
                  </div>
                )}
                {user.coachName && (
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <UserIcon className="h-3.5 w-3.5" />
                    <span className="truncate">{user.coachName}</span>
                  </div>
                )}
                {user.lastCheckIn && (
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>Last: {formatDate(user.lastCheckIn, "relative")}</span>
                  </div>
                )}
                {user.checkInStreak !== undefined && user.checkInStreak > 0 && (
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Activity className="h-3.5 w-3.5 text-primary" />
                    <span>{user.checkInStreak} day streak</span>
                  </div>
                )}
              </div>
            )}

            {/* Coach-specific info */}
            {user.role === "coach" && (
              <div className="mt-3 flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <UserIcon className="h-3.5 w-3.5" />
                  <span>{user.pirCount || 0} PIRs assigned</span>
                </div>
                {user.capacity && (
                  <div className="flex items-center gap-1">
                    <span>Capacity: {user.capacity}</span>
                  </div>
                )}
              </div>
            )}

            {/* Contact info */}
            {user.phone && (
              <div className="mt-2 flex items-center gap-1 text-sm text-muted-foreground">
                <Phone className="h-3.5 w-3.5" />
                <span>{user.phone}</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Skeleton loader for UserCard
export function UserCardSkeleton() {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 animate-pulse rounded-full bg-muted" />
          <div className="flex-1 space-y-2">
            <div className="h-5 w-32 animate-pulse rounded bg-muted" />
            <div className="h-4 w-48 animate-pulse rounded bg-muted" />
            <div className="flex gap-2">
              <div className="h-5 w-16 animate-pulse rounded-full bg-muted" />
              <div className="h-5 w-24 animate-pulse rounded-full bg-muted" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
