import { PIR } from "../types"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { Calendar, User } from "lucide-react"
import { cn } from "@/lib/utils"

interface ActivePIRsGridProps {
  pirs: PIR[]
  loading?: boolean
  onPIRClick?: (pir: PIR) => void
}

function getInitials(pir: PIR): string {
  if (pir.firstName && pir.lastName) {
    return `${pir.firstName[0]}${pir.lastName[0]}`.toUpperCase()
  }
  if (pir.displayName) {
    const parts = pir.displayName.split(" ")
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
    }
    return pir.displayName.substring(0, 2).toUpperCase()
  }
  return pir.email?.substring(0, 2).toUpperCase() || "??"
}

function getAvatarColor(name?: string): string {
  if (!name) return "bg-primary"
  const colors = [
    "bg-primary",
    "bg-blue-500",
    "bg-emerald-500",
    "bg-amber-500",
    "bg-purple-500",
    "bg-pink-500",
    "bg-indigo-500",
    "bg-cyan-500",
  ]
  const index = name.charCodeAt(0) % colors.length
  return colors[index]
}

function PIRCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <Skeleton className="h-14 w-14 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function PIRCard({ pir, onClick }: { pir: PIR; onClick?: () => void }) {
  return (
    <Card
      onClick={onClick}
      className={cn(
        "cursor-pointer overflow-hidden transition-all duration-200",
        "hover:-translate-y-0.5 hover:shadow-md"
      )}
    >
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-14 w-14">
            {pir.profileImageUrl ? (
              <AvatarImage src={pir.profileImageUrl} alt={pir.displayName} />
            ) : null}
            <AvatarFallback className={cn("text-white text-lg font-semibold", getAvatarColor(pir.firstName))}>
              {getInitials(pir)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-foreground truncate">
              {pir.displayName || pir.firstName || "Unknown"}
            </p>
            <div className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
              <Calendar className="h-3.5 w-3.5" />
              <span>{pir.daysSober ?? 0} days sober</span>
            </div>
            <div className="mt-0.5 flex items-center gap-1.5 text-sm text-muted-foreground truncate">
              <User className="h-3.5 w-3.5" />
              <span className="truncate">Coach: {pir.coachName || "Unassigned"}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function ActivePIRsGrid({ pirs, loading, onPIRClick }: ActivePIRsGridProps) {
  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-7 w-40" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <PIRCardSkeleton key={i} />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-foreground lg:text-2xl">
        Active PIRs ({pirs.length})
      </h2>
      {pirs.length === 0 ? (
        <Card className="py-12">
          <CardContent className="flex flex-col items-center justify-center text-center">
            <User className="h-12 w-12 text-muted-foreground/30" />
            <p className="mt-3 text-muted-foreground">No active PIRs found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {pirs.map((pir) => (
            <PIRCard key={pir.id} pir={pir} onClick={() => onPIRClick?.(pir)} />
          ))}
        </div>
      )}
    </div>
  )
}
