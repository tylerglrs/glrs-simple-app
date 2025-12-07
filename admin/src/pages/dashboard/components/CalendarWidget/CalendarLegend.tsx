import { Users, Trophy, Calendar, MapPin, ClipboardList, Flame } from "lucide-react"
import { Button } from "@/components/ui/button"
import { type CalendarEventType, EVENT_TYPE_CONFIG } from "./types"

interface CalendarLegendProps {
  activeFilters: Set<CalendarEventType>
  onToggleFilter: (type: CalendarEventType) => void
  eventCounts: Record<CalendarEventType, number>
}

// Icon mapping for event types
const eventIcons: Record<CalendarEventType, React.ElementType> = {
  support_group: Users,
  milestone: Trophy,
  session: Calendar,
  saved_meeting: MapPin,
  assignment_due: ClipboardList,
  check_in_streak: Flame,
}

export function CalendarLegend({
  activeFilters,
  onToggleFilter,
  eventCounts,
}: CalendarLegendProps) {
  const eventTypes = Object.keys(EVENT_TYPE_CONFIG) as CalendarEventType[]

  return (
    <div className="flex flex-wrap gap-2">
      {eventTypes.map((type) => {
        const config = EVENT_TYPE_CONFIG[type]
        const Icon = eventIcons[type]
        const isActive = activeFilters.has(type)
        const count = eventCounts[type] || 0

        // Skip types with no events
        if (count === 0) return null

        return (
          <Button
            key={type}
            variant="ghost"
            size="sm"
            onClick={() => onToggleFilter(type)}
            className={`
              h-auto gap-1.5 px-2 py-1 text-xs
              ${isActive ? "" : "opacity-40"}
            `}
            style={{
              backgroundColor: isActive ? config.bgColor : undefined,
              color: isActive ? config.color : undefined,
            }}
          >
            <Icon className="h-3 w-3" />
            <span>{config.label}</span>
            <span
              className="rounded-full px-1.5 py-0.5 text-[10px]"
              style={{
                backgroundColor: isActive ? config.color : "#e5e7eb",
                color: isActive ? "#fff" : "#666",
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

export default CalendarLegend
