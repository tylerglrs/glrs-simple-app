import { useState } from "react"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { CalendarEvent } from "./CalendarEvent"
import { type CalendarDay as CalendarDayType, EVENT_TYPE_CONFIG } from "./types"

interface CalendarDayProps {
  day: CalendarDayType
  isMobile?: boolean
}

export function CalendarDay({ day, isMobile = false }: CalendarDayProps) {
  const [isOpen, setIsOpen] = useState(false)
  const hasEvents = day.events.length > 0
  const maxVisibleDots = 3

  // Base classes for the day cell
  const baseClasses = `
    relative flex flex-col items-center justify-start p-1
    min-h-[60px] sm:min-h-[80px] text-sm
    transition-colors duration-150
    ${day.isCurrentMonth ? "text-foreground" : "text-muted-foreground/50"}
    ${hasEvents ? "cursor-pointer hover:bg-muted/50" : ""}
  `

  // Today highlight
  const todayClasses = day.isToday
    ? "ring-2 ring-primary ring-inset bg-primary/5 font-bold"
    : ""

  // Day content
  const dayContent = (
    <div className={`${baseClasses} ${todayClasses} rounded-md`}>
      {/* Day number */}
      <span
        className={`
          flex h-6 w-6 items-center justify-center rounded-full text-xs sm:text-sm
          ${day.isToday ? "bg-primary text-white" : ""}
        `}
      >
        {day.date.getDate()}
      </span>

      {/* Event indicators */}
      {hasEvents && (
        <div className="mt-1 flex flex-wrap justify-center gap-0.5">
          {day.events.slice(0, maxVisibleDots).map((event, index) => (
            <div
              key={event.id || index}
              className="h-1.5 w-1.5 rounded-full"
              style={{ backgroundColor: EVENT_TYPE_CONFIG[event.type].color }}
            />
          ))}
          {day.events.length > maxVisibleDots && (
            <span className="text-[10px] text-muted-foreground">
              +{day.events.length - maxVisibleDots}
            </span>
          )}
        </div>
      )}

      {/* Desktop: Show first event preview */}
      {!isMobile && hasEvents && (
        <div className="mt-1 hidden w-full sm:block">
          {day.events.slice(0, 1).map((event) => (
            <div
              key={event.id}
              className="truncate rounded px-1 py-0.5 text-[10px]"
              style={{
                backgroundColor: EVENT_TYPE_CONFIG[event.type].bgColor,
                color: EVENT_TYPE_CONFIG[event.type].color,
              }}
            >
              {event.title}
            </div>
          ))}
        </div>
      )}
    </div>
  )

  // If no events, just render the day
  if (!hasEvents) {
    return dayContent
  }

  // With events, wrap in popover for details
  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button className="w-full text-left focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 rounded-md">
          {dayContent}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-3" align="start">
        <div className="space-y-2">
          <div className="text-sm font-medium">
            {day.date.toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </div>
          <div className="space-y-1.5">
            {day.events.map((event) => (
              <CalendarEvent key={event.id} event={event} />
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

export default CalendarDay
