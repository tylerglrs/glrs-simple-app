import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Clock,
  MapPin,
  Video,
  Plus,
  UserPlus,
  Info,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { type CalendarMeeting, type MeetingType } from "./MeetingsCalendar"

interface CalendarDayModalProps {
  open: boolean
  onClose: () => void
  date: Date | null
  meetings: CalendarMeeting[]
  onAddToPIR: (meeting: CalendarMeeting) => void
  onViewDetails?: (meeting: CalendarMeeting) => void
  onCreateMeeting?: () => void
}

const DAYS_FULL = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
]

const TYPE_STYLES = {
  glrs: { bg: "bg-[#069494]/10", text: "text-[#069494]", badge: "bg-[#069494] text-white" },
  aa: { bg: "bg-blue-50", text: "text-blue-600", badge: "bg-blue-500 text-white" },
  na: { bg: "bg-green-50", text: "text-green-600", badge: "bg-green-500 text-white" },
  all: { bg: "bg-gray-50", text: "text-gray-600", badge: "bg-gray-500 text-white" },
}

function getMeetingType(meeting: CalendarMeeting): MeetingType {
  if (meeting.type === "glrs") return "glrs"
  if (meeting.source?.toLowerCase().includes("na") || meeting.type === "na") return "na"
  return "aa"
}

function formatDate(date: Date): string {
  return `${DAYS_FULL[date.getDay()]}, ${MONTHS[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`
}

export function CalendarDayModal({
  open,
  onClose,
  date,
  meetings,
  onAddToPIR,
  onViewDetails,
  onCreateMeeting,
}: CalendarDayModalProps) {
  if (!date) return null

  // Sort meetings by time
  const sortedMeetings = [...meetings].sort((a, b) => {
    const timeA = a.time || "00:00"
    const timeB = b.time || "00:00"
    return timeA.localeCompare(timeB)
  })

  // Group by type
  const glrsMeetings = sortedMeetings.filter((m) => getMeetingType(m) === "glrs")
  const aaMeetings = sortedMeetings.filter((m) => getMeetingType(m) === "aa")
  const naMeetings = sortedMeetings.filter((m) => getMeetingType(m) === "na")

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader className="pb-4 border-b">
          <DialogTitle className="text-lg">
            {formatDate(date)}
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            {meetings.length} meeting{meetings.length !== 1 ? "s" : ""} scheduled
          </p>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-6 py-4">
            {meetings.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                <Clock className="mb-4 h-12 w-12 opacity-30" />
                <p>No meetings scheduled</p>
                {onCreateMeeting && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4"
                    onClick={onCreateMeeting}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Create GLRS Meeting
                  </Button>
                )}
              </div>
            ) : (
              <>
                {/* GLRS Meetings */}
                {glrsMeetings.length > 0 && (
                  <MeetingSection
                    title="GLRS Meetings"
                    type="glrs"
                    meetings={glrsMeetings}
                    onAddToPIR={onAddToPIR}
                    onViewDetails={onViewDetails}
                  />
                )}

                {/* AA Meetings */}
                {aaMeetings.length > 0 && (
                  <MeetingSection
                    title="AA Meetings"
                    type="aa"
                    meetings={aaMeetings}
                    onAddToPIR={onAddToPIR}
                    onViewDetails={onViewDetails}
                  />
                )}

                {/* NA Meetings */}
                {naMeetings.length > 0 && (
                  <MeetingSection
                    title="NA Meetings"
                    type="na"
                    meetings={naMeetings}
                    onAddToPIR={onAddToPIR}
                    onViewDetails={onViewDetails}
                  />
                )}
              </>
            )}
          </div>
        </ScrollArea>

        {/* Footer Actions */}
        <div className="flex justify-between border-t pt-4 mt-4">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          {onCreateMeeting && meetings.length > 0 && (
            <Button
              onClick={onCreateMeeting}
              className="bg-[#069494] hover:bg-[#057a7a]"
            >
              <Plus className="mr-2 h-4 w-4" />
              Create GLRS Meeting
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Meeting Section Component
interface MeetingSectionProps {
  title: string
  type: MeetingType
  meetings: CalendarMeeting[]
  onAddToPIR: (meeting: CalendarMeeting) => void
  onViewDetails?: (meeting: CalendarMeeting) => void
}

function MeetingSection({ title, type, meetings, onAddToPIR, onViewDetails }: MeetingSectionProps) {
  const styles = TYPE_STYLES[type]

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <Badge className={styles.badge}>{title}</Badge>
        <span className="text-sm text-muted-foreground">({meetings.length})</span>
      </div>

      <div className="space-y-2">
        {meetings.map((meeting) => (
          <MeetingItem
            key={meeting.id}
            meeting={meeting}
            type={type}
            onAddToPIR={onAddToPIR}
            onViewDetails={onViewDetails}
          />
        ))}
      </div>
    </div>
  )
}

// Meeting Item Component
interface MeetingItemProps {
  meeting: CalendarMeeting
  type: MeetingType
  onAddToPIR: (meeting: CalendarMeeting) => void
  onViewDetails?: (meeting: CalendarMeeting) => void
}

function MeetingItem({ meeting, type, onAddToPIR, onViewDetails }: MeetingItemProps) {
  const styles = TYPE_STYLES[type]

  return (
    <div className={cn("rounded-lg border p-3", styles.bg)}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <h4 className="font-medium truncate">{meeting.title}</h4>

          <div className="mt-1 space-y-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              <span>{meeting.time}</span>
            </div>

            {meeting.location && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                {meeting.isVirtual ? (
                  <Video className="h-3.5 w-3.5 text-purple-600" />
                ) : (
                  <MapPin className="h-3.5 w-3.5" />
                )}
                <span className="truncate">
                  {meeting.isVirtual ? "Virtual Meeting" : meeting.location}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-1 shrink-0">
          {onViewDetails && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => onViewDetails(meeting)}
              title="View Details"
            >
              <Info className="h-4 w-4" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className={cn("h-8 w-8", styles.text)}
            onClick={() => onAddToPIR(meeting)}
            title="Add to PIR Schedule"
          >
            <UserPlus className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

export default CalendarDayModal
