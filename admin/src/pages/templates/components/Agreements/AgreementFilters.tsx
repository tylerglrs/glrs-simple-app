import { Button } from "@/components/ui/button"
import { AGREEMENT_STATUS } from "../../constants"
import type { AgreementStatus } from "../../types"

interface StatusCount {
  all: number
  sent: number
  partially_signed: number
  completed: number
  expired: number
  voided: number
}

interface AgreementFiltersProps {
  activeFilter: AgreementStatus | "all"
  onFilterChange: (filter: AgreementStatus | "all") => void
  statusCounts: StatusCount
}

// Status tabs to display
const STATUS_TABS: Array<{ key: AgreementStatus | "all"; label: string }> = [
  { key: "all", label: "All" },
  { key: "sent", label: "Sent" },
  { key: "partially_signed", label: "Partial" },
  { key: "completed", label: "Completed" },
  { key: "expired", label: "Expired" },
]

/**
 * AgreementFilters - Status filter tabs for agreements list
 * Ported from templates.html lines 11361-11406
 *
 * Features:
 * - Filter tabs for status (All, Sent, Partial, Completed, Expired)
 * - Count badges per status
 * - Active state styling with status colors
 */
export function AgreementFilters({
  activeFilter,
  onFilterChange,
  statusCounts,
}: AgreementFiltersProps) {
  return (
    <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
      {STATUS_TABS.map((tab) => {
        const isActive = activeFilter === tab.key
        const count = statusCounts[tab.key as keyof StatusCount] || 0

        // Get status config for coloring
        const statusConfig =
          tab.key === "all"
            ? { color: "#0077CC", bg: "rgba(0, 119, 204, 0.1)" }
            : AGREEMENT_STATUS[tab.key as keyof typeof AGREEMENT_STATUS]

        return (
          <Button
            key={tab.key}
            variant={isActive ? "default" : "outline"}
            size="sm"
            onClick={() => onFilterChange(tab.key)}
            className="flex items-center gap-1.5 whitespace-nowrap rounded-full transition-all"
            style={
              isActive
                ? {
                    backgroundColor: statusConfig?.bg,
                    borderColor: statusConfig?.color,
                    borderWidth: "2px",
                    color: statusConfig?.color,
                  }
                : {}
            }
          >
            {tab.label}
            <span
              className="rounded-full px-2 py-0.5 text-[11px]"
              style={{
                backgroundColor: isActive
                  ? "rgba(255, 255, 255, 0.5)"
                  : "hsl(var(--muted))",
              }}
            >
              {count}
            </span>
          </Button>
        )
      })}
    </div>
  )
}

export default AgreementFilters
