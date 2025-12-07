import { Users, Trophy, Calendar, MapPin, ClipboardList, Flame } from "lucide-react"
import { type CalendarEvent as CalendarEventType, EVENT_TYPE_CONFIG } from "./types"

interface CalendarEventProps {
  event: CalendarEventType
  compact?: boolean
}

// Icon mapping for event types
const eventIcons = {
  support_group: Users,
  milestone: Trophy,
  session: Calendar,
  saved_meeting: MapPin,
  assignment_due: ClipboardList,
  check_in_streak: Flame,
}

export function CalendarEvent({ event, compact = false }: CalendarEventProps) {
  const config = EVENT_TYPE_CONFIG[event.type]
  const Icon = eventIcons[event.type]

  if (compact) {
    // Compact view - just a colored dot
    return (
      <div
        className="h-2 w-2 rounded-full"
        style={{ backgroundColor: config.color }}
        title={event.title}
      />
    )
  }

  // Full view - shows event details
  return (
    <div
      className="flex items-center gap-2 rounded px-2 py-1 text-xs"
      style={{ backgroundColor: config.bgColor }}
    >
      <Icon className="h-3 w-3 flex-shrink-0" style={{ color: config.color }} />
      <span className="truncate font-medium" style={{ color: config.color }}>
        {event.title}
      </span>
      {event.time && (
        <span className="ml-auto flex-shrink-0 text-muted-foreground">{event.time}</span>
      )}
    </div>
  )
}

export default CalendarEvent
