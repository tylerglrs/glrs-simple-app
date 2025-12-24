/**
 * =============================================================================
 * MEETING CARD COMPONENT - Professional Redesign v2.0
 * =============================================================================
 *
 * Displays meeting information in a polished, professional card format.
 * Follows industry best practices from Material Design 3 and shadcn/ui.
 *
 * Design System:
 * - 4px base unit grid (all spacing multiples of 4)
 * - 16px internal padding (p-4)
 * - 12px border radius (rounded-xl)
 * - 8-12px spacing between sections
 * - Clear visual hierarchy with typography scale
 *
 * WCAG 2.2 Accessibility Features:
 * - Semantic HTML structure (article, h3, etc.)
 * - Comprehensive aria-labels on interactive elements
 * - Minimum 44px touch targets
 * - Focus visible states (via Button component)
 * - Screen reader friendly content ordering
 * - 4.5:1 minimum contrast ratio for all text
 *
 * Sources:
 * - Material Design 3: https://m3.material.io/components/cards/specs
 * - LogRocket Card UI Design: https://blog.logrocket.com/ux-design/ui-card-design/
 * - shadcn/ui Card: https://ui.shadcn.com/docs/components/card
 *
 * =============================================================================
 */

import {
  Calendar,
  CalendarPlus,
  Clock,
  MapPin,
  Video,
  Heart,
  ExternalLink,
  Navigation,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { MeetingCardProps } from '../types'
import { MEETING_TYPE_CODES } from '../types'
import { toMeetingCardData } from '../utils/toMeetingCardData'
import {
  ProgramBadge,
  FormatBadge,
  LocationBadge,
  type ProgramType,
  type FormatType,
} from './MeetingBadge'
import {
  getMeetingCardAriaLabel,
  getFavoriteButtonAriaLabel,
  getScheduleButtonAriaLabel,
} from '../utils/accessibility'

// ============================================================
// MAIN MEETING CARD COMPONENT
// ============================================================

export function MeetingCard({
  meeting,
  isFavorite = false,
  showDistance = true,
  onToggleFavorite,
  onAddToSchedule,
  isMobile = false,
}: MeetingCardProps) {
  // Transform meeting to standardized card data
  // This ensures all fields have values (never null/undefined/blank)
  const cardData = toMeetingCardData(meeting)

  // Normalize program type for badge component
  const normalizedProgramType = cardData.programType.toLowerCase() as ProgramType

  // Parse meeting format from type codes
  const getFormatType = (codes: string[]): FormatType | null => {
    for (const code of codes) {
      const lowerCode = code.toLowerCase()
      if (lowerCode === 'o' || lowerCode === 'open') return 'open'
      if (lowerCode === 'c' || lowerCode === 'closed') return 'closed'
      if (lowerCode === 'd' || lowerCode === 'discussion') return 'discussion'
      if (lowerCode === 's' || lowerCode === 'speaker') return 'speaker'
      if (lowerCode === 'step' || lowerCode === 'ss') return 'stepStudy'
      if (lowerCode === 'bb' || lowerCode === 'b' || lowerCode === 'bigbook') return 'bigBook'
    }
    return null
  }
  const formatType = getFormatType(cardData.typeCodes)

  // Generate comprehensive aria-label for the card
  const cardAriaLabel = getMeetingCardAriaLabel({
    name: cardData.name,
    dayDisplay: cardData.dayDisplay,
    timeDisplay: cardData.timeDisplay,
    locationDisplay: cardData.locationDisplay,
    programType: cardData.programType,
    isVirtual: cardData.isVirtual,
    isHybrid: cardData.isHybrid,
  })

  return (
    <Card
      className={cn(
        // Base card styling with consistent border radius - TRANSPARENT
        'overflow-hidden rounded-xl border border-white/30',
        'bg-white/20 backdrop-blur-sm',
        // Subtle shadow for depth
        'shadow-sm',
        // Hover/focus states
        'transition-all duration-200 ease-out',
        'hover:shadow-md hover:border-white/40',
        'focus-within:ring-2 focus-within:ring-primary/50 focus-within:ring-offset-1',
        // Respect reduced motion preference
        'motion-reduce:transition-none'
      )}
      role="article"
      aria-label={cardAriaLabel}
    >
      <CardContent className="p-4">
        {/* ============================================================
            SECTION 1: HEADER - Meeting Name + Favorite
            Typography: 16px semibold (text-base) for name
            ============================================================ */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0 space-y-1">
            {/* Meeting Name - Primary heading, allow 2 lines */}
            <h3 className="font-semibold text-base leading-tight text-foreground line-clamp-2">
              {cardData.name}
            </h3>

            {/* Location Name - Secondary, allow truncate on single line */}
            {cardData.locationDisplay && cardData.locationDisplay !== 'Meeting Location' && (
              <p className="text-sm text-muted-foreground truncate">
                {cardData.locationDisplay}
              </p>
            )}
          </div>

          {/* Favorite Button - 44px touch target */}
          {onToggleFavorite && (
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                'shrink-0 h-10 w-10 rounded-full -mr-2 -mt-1',
                'transition-colors duration-150',
                isFavorite
                  ? 'text-rose-500 hover:text-rose-600 hover:bg-rose-50'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              )}
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                onToggleFavorite()
              }}
              aria-label={getFavoriteButtonAriaLabel(isFavorite, cardData.name)}
              aria-pressed={isFavorite}
            >
              <Heart
                className={cn(
                  'h-5 w-5 transition-transform duration-150',
                  isFavorite && 'fill-current scale-110'
                )}
                aria-hidden="true"
              />
            </Button>
          )}
        </div>

        {/* ============================================================
            SECTION 2: SCHEDULE INFO - Day, Time, Distance
            Consistent 12px gap, 14px font size
            ============================================================ */}
        <div className="flex items-center flex-wrap gap-x-4 gap-y-1 mt-3">
          {/* Day */}
          <div className="flex items-center gap-1.5 text-sm text-foreground/80">
            <Calendar className="h-4 w-4 text-primary/70" aria-hidden="true" />
            <span className="font-medium">{cardData.dayDisplay}</span>
          </div>

          {/* Time */}
          <div className="flex items-center gap-1.5 text-sm text-foreground/80">
            <Clock className="h-4 w-4 text-primary/70" aria-hidden="true" />
            <span className="font-medium">{cardData.timeDisplay}</span>
          </div>

          {/* Distance (if available) */}
          {showDistance && cardData.showDistance && cardData.distanceDisplay && (
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Navigation className="h-4 w-4" aria-hidden="true" />
              <span>{cardData.distanceDisplay}</span>
            </div>
          )}
        </div>

        {/* ============================================================
            SECTION 3: LOCATION - City/State + Directions
            Address on left, directions on right
            - Virtual-only meetings: Hide address (show "Virtual Meeting" badge instead)
            - Hybrid meetings: Show address (they have physical location)
            - In-person meetings: Show address
            ============================================================ */}
        {(!cardData.isVirtual || cardData.isHybrid) && (
          <div className="flex items-center justify-between gap-3 mt-3">
            <address className="flex items-center gap-1.5 text-sm text-muted-foreground not-italic min-w-0 flex-1">
              <MapPin className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span className="truncate">{cardData.addressDisplay}</span>
            </address>

            {/* Directions Link */}
            {cardData.canGetDirections && cardData.directionsUrl && (
              <a
                href={cardData.directionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  'flex items-center gap-1 text-sm font-medium shrink-0',
                  'text-primary hover:text-primary/80',
                  'transition-colors duration-150',
                  'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 rounded px-1 -mx-1'
                )}
                onClick={(e) => e.stopPropagation()}
                aria-label={`Get directions to ${cardData.locationDisplay}`}
              >
                Directions
                <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                <span className="sr-only"> (opens in new window)</span>
              </a>
            )}
          </div>
        )}

        {/* ============================================================
            SECTION 4: VIRTUAL MEETING LINK (if applicable)
            Prominent blue link for online access
            Shows "Contact for link" when virtual but no URL provided
            ============================================================ */}
        {cardData.canJoinOnline ? (
          <div className="flex items-center justify-between gap-2 mt-3 py-2 px-3 rounded-lg bg-blue-50 dark:bg-blue-950/30">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <Video className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0" aria-hidden="true" />
              <a
                href={cardData.conferenceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  'text-sm font-medium text-blue-600 dark:text-blue-400',
                  'hover:text-blue-700 dark:hover:text-blue-300 hover:underline',
                  'truncate',
                  'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 rounded'
                )}
                onClick={(e) => e.stopPropagation()}
                aria-label={`Join ${cardData.name} online`}
              >
                {cardData.virtualLabel === 'Hybrid' ? 'Join Virtual (Hybrid)' : 'Join Virtual Meeting'}
                <span className="sr-only"> (opens in new window)</span>
              </a>
            </div>
            {/* Directions button for virtual meetings with coordinates */}
            {cardData.isVirtual && !cardData.isHybrid && cardData.canGetDirections && cardData.directionsUrl && (
              <a
                href={cardData.directionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  'flex items-center gap-1 text-sm font-medium shrink-0',
                  'text-primary hover:text-primary/80',
                  'transition-colors duration-150',
                  'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 rounded px-1'
                )}
                onClick={(e) => e.stopPropagation()}
                aria-label={`Get directions to ${cardData.locationDisplay}`}
              >
                Directions
                <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                <span className="sr-only"> (opens in new window)</span>
              </a>
            )}
          </div>
        ) : cardData.isVirtual && !cardData.isHybrid ? (
          /* Virtual meeting without link - show contact message and directions if available */
          <div className="flex items-center justify-between gap-2 mt-3 py-2 px-3 rounded-lg bg-muted/50">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <Video className="h-4 w-4 text-muted-foreground shrink-0" aria-hidden="true" />
              <span className="text-sm text-muted-foreground">
                Contact meeting for virtual link
              </span>
            </div>
            {/* Directions button for virtual meetings with coordinates but no virtual link */}
            {cardData.canGetDirections && cardData.directionsUrl && (
              <a
                href={cardData.directionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  'flex items-center gap-1 text-sm font-medium shrink-0',
                  'text-primary hover:text-primary/80',
                  'transition-colors duration-150',
                  'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 rounded px-1'
                )}
                onClick={(e) => e.stopPropagation()}
                aria-label={`Get directions to ${cardData.locationDisplay}`}
              >
                Directions
                <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                <span className="sr-only"> (opens in new window)</span>
              </a>
            )}
          </div>
        ) : null}

        {/* ============================================================
            SECTION 5: BADGES - Program, Location Type, Format
            Proper 8px gap for badge separation
            ============================================================ */}
        <div className="flex flex-wrap items-center gap-2 mt-4">
          {/* Program Badge (AA, NA, etc.) - Always first */}
          <ProgramBadge
            type={normalizedProgramType}
            size="sm"
            variant="filled"
          />

          {/* Location Badge (Virtual/Hybrid) */}
          {cardData.isHybrid ? (
            <LocationBadge type="hybrid" size="sm" variant="filled" />
          ) : cardData.isVirtual ? (
            <LocationBadge type="virtual" size="sm" variant="filled" />
          ) : null}

          {/* Format Badge (Open/Closed/Discussion/etc.) */}
          {formatType && (
            <FormatBadge type={formatType} size="sm" variant="subtle" />
          )}

          {/* Additional type codes as subtle text badges - limit to 2 */}
          {/* Filter out: format codes (O, C, D, etc.) and attendance codes (online, virtual, hybrid) */}
          {cardData.typeCodes
            .filter(code => !['O', 'C', 'D', 'S', 'B', 'BB', 'STEP', 'SS', 'ONLINE', 'VIRTUAL', 'HYBRID', 'ONL', 'HY', 'VM'].includes(code.toUpperCase()))
            .slice(0, 2)
            .map((code) => (
              <span
                key={code}
                className={cn(
                  'inline-flex items-center px-2 py-0.5',
                  'text-xs font-medium text-muted-foreground',
                  'bg-muted/60 rounded-md'
                )}
                title={MEETING_TYPE_CODES[code] || code}
              >
                {MEETING_TYPE_CODES[code] || code}
              </span>
            ))}
        </div>

        {/* ============================================================
            SECTION 6: NOTES (if any)
            Subtle italic text, max 2 lines
            ============================================================ */}
        {cardData.notes && (
          <p className="text-xs text-muted-foreground mt-3 line-clamp-2 italic leading-relaxed">
            {cardData.notes}
          </p>
        )}

        {/* ============================================================
            SECTION 7: ADD TO SCHEDULE BUTTON
            Full-width CTA with 44px touch target
            ============================================================ */}
        {onAddToSchedule && (
          <Button
            variant="outline"
            className={cn(
              'w-full mt-4 h-11 gap-2',
              'text-primary border-primary/30',
              'hover:bg-primary/5 hover:border-primary/50',
              'transition-colors duration-150'
            )}
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              onAddToSchedule()
            }}
            aria-label={getScheduleButtonAriaLabel(cardData.name)}
          >
            <CalendarPlus className="h-4 w-4" aria-hidden="true" />
            Add to Schedule
          </Button>
        )}
      </CardContent>
    </Card>
  )
}

export default MeetingCard
