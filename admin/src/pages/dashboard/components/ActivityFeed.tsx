import { Activity, ActivityType } from "../types"
import { formatDistanceToNow } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Activity as ActivityIcon,
  CheckCircle,
  FileText,
  Target,
  MessageSquare,
  AlertTriangle,
  LogIn,
  User,
  Trophy,
  Flame,
  BookOpen,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface ActivityFeedProps {
  activities: Activity[]
  loading?: boolean
  onViewAll?: () => void
}

const activityConfig: Record<
  ActivityType,
  { icon: React.ElementType; color: string; bgColor: string }
> = {
  check_in: { icon: CheckCircle, color: "text-emerald-600", bgColor: "bg-emerald-50" },
  assignment_completed: { icon: FileText, color: "text-blue-600", bgColor: "bg-blue-50" },
  goal_completed: { icon: Target, color: "text-amber-600", bgColor: "bg-amber-50" },
  objective_completed: { icon: Target, color: "text-amber-600", bgColor: "bg-amber-50" },
  message_sent: { icon: MessageSquare, color: "text-purple-600", bgColor: "bg-purple-50" },
  sos_triggered: { icon: AlertTriangle, color: "text-red-600", bgColor: "bg-red-50" },
  login: { icon: LogIn, color: "text-sky-600", bgColor: "bg-sky-50" },
  profile_updated: { icon: User, color: "text-gray-600", bgColor: "bg-gray-50" },
  pledge_completed: { icon: CheckCircle, color: "text-emerald-600", bgColor: "bg-emerald-50" },
  resource_viewed: { icon: BookOpen, color: "text-indigo-600", bgColor: "bg-indigo-50" },
  milestone_achieved: { icon: Trophy, color: "text-amber-600", bgColor: "bg-amber-50" },
  streak_update: { icon: Flame, color: "text-orange-600", bgColor: "bg-orange-50" },
  account_created: { icon: User, color: "text-primary", bgColor: "bg-primary/10" },
}

function ActivityItemSkeleton() {
  return (
    <div className="flex items-start gap-3 py-3">
      <Skeleton className="h-8 w-8 rounded-full" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/4" />
      </div>
    </div>
  )
}

function ActivityItem({ activity }: { activity: Activity }) {
  const config = activityConfig[activity.type] || {
    icon: ActivityIcon,
    color: "text-gray-600",
    bgColor: "bg-gray-50",
  }
  const Icon = config.icon

  const createdAt =
    activity.createdAt instanceof Date
      ? activity.createdAt
      : activity.createdAt?.toDate?.() || new Date()

  return (
    <div className="flex items-start gap-3 py-3 border-b border-border last:border-0">
      <div
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
          config.bgColor
        )}
      >
        <Icon className={cn("h-4 w-4", config.color)} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-foreground line-clamp-2">{activity.description}</p>
        <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
          {activity.pirName && <span className="font-medium">{activity.pirName}</span>}
          <span>{formatDistanceToNow(createdAt)}</span>
        </div>
      </div>
    </div>
  )
}

export function ActivityFeed({ activities, loading, onViewAll }: ActivityFeedProps) {
  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <ActivityIcon className="h-5 w-5 text-primary" />
          Recent Activity
          {!loading && activities.length > 0 && (
            <span className="ml-auto text-xs font-normal text-muted-foreground">
              {activities.length} items
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {loading ? (
          <div className="space-y-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <ActivityItemSkeleton key={i} />
            ))}
          </div>
        ) : activities.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <ActivityIcon className="h-10 w-10 text-muted-foreground/30" />
            <p className="mt-2 text-sm text-muted-foreground">No recent activity</p>
          </div>
        ) : (
          <>
            <ScrollArea className="h-[320px] pr-4">
              {activities.slice(0, 8).map((activity) => (
                <ActivityItem key={activity.id} activity={activity} />
              ))}
            </ScrollArea>
            {activities.length > 8 && onViewAll && (
              <button
                onClick={onViewAll}
                className="mt-3 w-full rounded-lg border border-border bg-muted/50 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                View All Activity ({activities.length})
              </button>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}
