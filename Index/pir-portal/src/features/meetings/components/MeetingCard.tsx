import {
  Calendar,
  Clock,
  MapPin,
  Video,
  Heart,
  ExternalLink,
  Navigation,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { MeetingCardProps } from '../types'
import { DAYS_OF_WEEK, MEETING_TYPE_CODES, CODE_ALIASES } from '../types'

// ============================================================
// HELPER FUNCTIONS
// ============================================================

/**
 * Parse meeting type codes and return labels
 */
function parseMeetingTypeCodes(types?: string): string[] {
  if (!types) return []

  return types
    .split(',')
    .map((code) => code.trim().toUpperCase())
    .map((code) => CODE_ALIASES[code] || code) // Resolve aliases
    .filter((code) => MEETING_TYPE_CODES[code]) // Only valid codes
    .slice(0, 4) // Limit to 4 badges
}

/**
 * Format meeting time to 12-hour format
 */
function formatMeetingTime(time: string): string {
  if (!time) return ''

  // Handle various time formats
  const match = time.match(/^(\d{1,2}):?(\d{2})?\s*(am|pm)?$/i)
  if (!match) return time

  let hours = parseInt(match[1], 10)
  const minutes = match[2] || '00'
  const period = match[3]?.toLowerCase()

  if (period === 'pm' && hours < 12) hours += 12
  if (period === 'am' && hours === 12) hours = 0

  const displayHour = hours % 12 || 12
  const displayPeriod = hours >= 12 ? 'PM' : 'AM'

  return `${displayHour}:${minutes} ${displayPeriod}`
}

/**
 * Format distance with appropriate units
 */
function formatDistance(distance: number | null | undefined): string | null {
  if (distance === null || distance === undefined) return null
  if (distance < 0.1) return '< 0.1 mi'
  if (distance < 1) return `${distance.toFixed(1)} mi`
  return `${Math.round(distance)} mi`
}

/**
 * Get Google Maps directions URL
 */
function getDirectionsUrl(address?: string, coords?: { lat: number; lng: number }): string | null {
  if (coords?.lat && coords?.lng) {
    return `https://www.google.com/maps/dir/?api=1&destination=${coords.lat},${coords.lng}`
  }
  if (address) {
    return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`
  }
  return null
}

// ============================================================
// MAIN MEETING CARD COMPONENT
// ============================================================

export function MeetingCard({
  meeting,
  isFavorite = false,
  showDistance = true,
  onToggleFavorite,
  isMobile = false,
}: MeetingCardProps) {
  // Parse meeting type codes for badges
  const typeCodes = parseMeetingTypeCodes(meeting.types)

  // Get location info
  const locationName = meeting.locationName || meeting.location?.name
  const address =
    meeting.address?.formatted ||
    meeting.location?.formatted ||
    [meeting.address?.street, meeting.city, meeting.state].filter(Boolean).join(', ')

  // Get directions URL
  const directionsUrl = getDirectionsUrl(address, meeting.coordinates)

  // Format distance
  const distanceText = showDistance ? formatDistance(meeting.distance) : null

  // Get day name
  const dayName = DAYS_OF_WEEK[meeting.day] || ''

  // Get conference URL
  const conferenceUrl = meeting.conferenceUrl || meeting.conference_url || meeting.meetingLink

  return (
    <Card
      className={cn(
        'transition-all hover:shadow-md',
        isMobile ? 'rounded-lg' : 'rounded-xl'
      )}
    >
      <CardContent className={cn('p-3', isMobile ? 'p-3' : 'p-4')}>
        {/* Header Row: Name + Favorite Button */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            {/* Meeting Name */}
            <h3 className={cn(
              'font-semibold text-foreground truncate',
              isMobile ? 'text-sm' : 'text-base'
            )}>
              {meeting.name}
            </h3>

            {/* Location Name */}
            {locationName && (
              <p className="text-xs text-muted-foreground truncate mt-0.5">
                {locationName}
              </p>
            )}
          </div>

          {/* Favorite Button */}
          {onToggleFavorite && (
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                'shrink-0 h-8 w-8',
                isFavorite && 'text-red-500 hover:text-red-600'
              )}
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                onToggleFavorite()
              }}
              aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            >
              <Heart
                className={cn(
                  'h-4 w-4',
                  isFavorite && 'fill-current'
                )}
              />
            </Button>
          )}
        </div>

        {/* Day & Time Row */}
        <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            <span>{dayName}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            <span>{formatMeetingTime(meeting.time)}</span>
          </div>
          {distanceText && (
            <div className="flex items-center gap-1">
              <Navigation className="h-3.5 w-3.5" />
              <span>{distanceText}</span>
            </div>
          )}
        </div>

        {/* Address Row */}
        {address && (
          <div className="flex items-start gap-1 mt-2 text-xs text-muted-foreground">
            <MapPin className="h-3.5 w-3.5 mt-0.5 shrink-0" />
            <span className="line-clamp-2">{address}</span>
          </div>
        )}

        {/* Virtual Meeting Indicator */}
        {meeting.isVirtual && conferenceUrl && (
          <div className="flex items-center gap-1 mt-2 text-xs text-blue-600">
            <Video className="h-3.5 w-3.5" />
            <a
              href={conferenceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline truncate"
              onClick={(e) => e.stopPropagation()}
            >
              Join Online Meeting
            </a>
          </div>
        )}

        {/* Meeting Type Badges */}
        {typeCodes.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {typeCodes.map((code) => (
              <Badge
                key={code}
                variant="outline"
                className="text-xs px-1.5 py-0"
              >
                {MEETING_TYPE_CODES[code]}
              </Badge>
            ))}
          </div>
        )}

        {/* Source Badge + Directions */}
        <div className="flex items-center justify-between mt-3">
          <Badge
            variant="secondary"
            className={cn(
              'text-xs',
              meeting.source === 'AA' && 'bg-blue-100 text-blue-700',
              meeting.source === 'NA' && 'bg-purple-100 text-purple-700',
              meeting.source === 'GLRS' && 'bg-primary/10 text-primary'
            )}
          >
            {meeting.source}
          </Badge>

          {directionsUrl && (
            <a
              href={directionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              Directions
              <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>

        {/* Notes (if any) */}
        {meeting.notes && (
          <p className="text-xs text-muted-foreground mt-2 line-clamp-2 italic">
            {meeting.notes}
          </p>
        )}
      </CardContent>
    </Card>
  )
}

export default MeetingCard
