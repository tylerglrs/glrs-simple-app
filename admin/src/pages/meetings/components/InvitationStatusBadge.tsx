import { Badge } from "@/components/ui/badge"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Users, CheckCircle, XCircle, Clock } from "lucide-react"
import { cn } from "@/lib/utils"

export interface RSVPCounts {
  total: number
  accepted: number
  declined: number
  pending: number
}

interface InvitationStatusBadgeProps {
  counts: RSVPCounts
  compact?: boolean
  className?: string
}

export function InvitationStatusBadge({
  counts,
  compact = false,
  className,
}: InvitationStatusBadgeProps) {
  if (counts.total === 0) {
    return (
      <Badge variant="secondary" className={cn("text-xs", className)}>
        <Users className="mr-1 h-3 w-3" />
        No invites
      </Badge>
    )
  }

  if (compact) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className={cn("flex items-center gap-1", className)}>
              <Badge variant="secondary" className="text-xs gap-1">
                <Users className="h-3 w-3" />
                {counts.total}
              </Badge>
              {counts.accepted > 0 && (
                <Badge className="bg-green-100 text-green-700 text-xs gap-1">
                  <CheckCircle className="h-3 w-3" />
                  {counts.accepted}
                </Badge>
              )}
              {counts.declined > 0 && (
                <Badge className="bg-red-100 text-red-700 text-xs gap-1">
                  <XCircle className="h-3 w-3" />
                  {counts.declined}
                </Badge>
              )}
              {counts.pending > 0 && (
                <Badge className="bg-gray-100 text-gray-600 text-xs gap-1">
                  <Clock className="h-3 w-3" />
                  {counts.pending}
                </Badge>
              )}
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <div className="space-y-1 text-sm">
              <p className="font-medium">{counts.total} PIRs Invited</p>
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="h-3 w-3" />
                {counts.accepted} Accepted
              </div>
              <div className="flex items-center gap-2 text-red-600">
                <XCircle className="h-3 w-3" />
                {counts.declined} Declined
              </div>
              <div className="flex items-center gap-2 text-gray-500">
                <Clock className="h-3 w-3" />
                {counts.pending} Pending
              </div>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      <Badge variant="secondary" className="text-xs">
        <Users className="mr-1 h-3 w-3" />
        {counts.total} Invited
      </Badge>
      {counts.accepted > 0 && (
        <Badge className="bg-green-100 text-green-700 text-xs">
          <CheckCircle className="mr-1 h-3 w-3" />
          {counts.accepted} Accepted
        </Badge>
      )}
      {counts.declined > 0 && (
        <Badge className="bg-red-100 text-red-700 text-xs">
          <XCircle className="mr-1 h-3 w-3" />
          {counts.declined} Declined
        </Badge>
      )}
      {counts.pending > 0 && (
        <Badge className="bg-gray-100 text-gray-600 text-xs">
          <Clock className="mr-1 h-3 w-3" />
          {counts.pending} Pending
        </Badge>
      )}
    </div>
  )
}

export default InvitationStatusBadge
