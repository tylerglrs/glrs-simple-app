/**
 * AlertsPanel Dashboard Widget
 * Phase 8E: Admin Crisis Dashboard
 *
 * Compact dashboard widget showing recent crisis alerts.
 * Uses CrisisAlert types and tier-based styling.
 */

import { useNavigate } from "react-router-dom"
import { formatDistanceToNow } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Bell,
  AlertTriangle,
  AlertOctagon,
  AlertCircle,
  CheckCircle,
  ExternalLink,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { CrisisAlert, AlertTier, AlertSource } from "@/pages/alerts/types"

interface AlertsPanelProps {
  alerts: CrisisAlert[]
  loading?: boolean
}

// Tier styling
const tierConfig: Record<AlertTier, { bg: string; border: string; text: string; icon: React.ReactNode }> = {
  1: {
    bg: "bg-red-50 hover:bg-red-100",
    border: "border-red-200",
    text: "text-red-600",
    icon: <AlertOctagon className="h-4 w-4" />,
  },
  2: {
    bg: "bg-orange-50 hover:bg-orange-100",
    border: "border-orange-200",
    text: "text-orange-600",
    icon: <AlertTriangle className="h-4 w-4" />,
  },
  3: {
    bg: "bg-yellow-50 hover:bg-yellow-100",
    border: "border-yellow-200",
    text: "text-yellow-600",
    icon: <AlertCircle className="h-4 w-4" />,
  },
  4: {
    bg: "bg-blue-50 hover:bg-blue-100",
    border: "border-blue-200",
    text: "text-blue-600",
    icon: <Bell className="h-4 w-4" />,
  },
}

// Source labels
const sourceLabels: Record<AlertSource, string> = {
  sos: "SOS",
  ai: "AI",
  checkin: "Check-in",
}

function AlertSkeleton() {
  return (
    <div className="rounded-lg border p-3">
      <div className="flex items-start gap-3">
        <Skeleton className="h-4 w-4 rounded" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
    </div>
  )
}

function AlertItem({ alert }: { alert: CrisisAlert }) {
  const navigate = useNavigate()
  const config = tierConfig[alert.tier]

  const createdAt = alert.createdAt?.toDate?.() || new Date()

  // Get preview text - use first trigger keyword or context
  const previewText =
    alert.triggerKeywords.length > 0
      ? `Keywords: ${alert.triggerKeywords.slice(0, 3).join(", ")}`
      : alert.context?.slice(0, 80) || "Crisis alert triggered"

  return (
    <div
      onClick={() => navigate(`/alerts?id=${alert.id}`)}
      className={cn(
        "cursor-pointer rounded-lg border p-3 transition-all hover:translate-x-1",
        config.bg,
        config.border
      )}
    >
      <div className="flex items-start gap-3">
        <span className={cn("mt-0.5 shrink-0", config.text)}>{config.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-medium truncate">{alert.pirName}</span>
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
              {sourceLabels[alert.source]}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground line-clamp-1">{previewText}</p>
          <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
            <span className="capitalize">{alert.status}</span>
            <span>{formatDistanceToNow(createdAt)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export function AlertsPanel({ alerts, loading }: AlertsPanelProps) {
  const navigate = useNavigate()
  const hasAlerts = alerts.length > 0

  // Count critical alerts (tier 1)
  const criticalCount = alerts.filter((a) => a.tier === 1).length
  const hasCritical = criticalCount > 0

  return (
    <Card className={cn(hasCritical ? "border-red-300" : hasAlerts && "border-orange-200")}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <Bell
            className={cn(
              "h-4 w-4",
              hasCritical ? "text-red-600" : hasAlerts ? "text-orange-500" : "text-primary"
            )}
          />
          Crisis Alerts
          {hasAlerts && (
            <span
              className={cn(
                "ml-auto rounded-full px-2 py-0.5 text-xs font-semibold text-white",
                hasCritical ? "animate-pulse bg-red-600" : "bg-orange-500"
              )}
            >
              {alerts.length}
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <AlertSkeleton key={i} />
            ))}
          </div>
        ) : alerts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <CheckCircle className="h-8 w-8 text-emerald-500" />
            <p className="mt-2 text-sm text-muted-foreground">No active alerts</p>
          </div>
        ) : (
          <div className="space-y-2">
            {alerts.slice(0, 5).map((alert) => (
              <AlertItem key={alert.id} alert={alert} />
            ))}
            {alerts.length > 0 && (
              <button
                onClick={() => navigate("/alerts")}
                className={cn(
                  "mt-2 flex w-full items-center justify-center gap-2 rounded-lg border py-2.5 text-sm font-medium transition-colors",
                  hasCritical
                    ? "border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
                    : "border-orange-200 bg-orange-50 text-orange-700 hover:bg-orange-100"
                )}
              >
                <ExternalLink className="h-3.5 w-3.5" />
                View All Alerts
              </button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
