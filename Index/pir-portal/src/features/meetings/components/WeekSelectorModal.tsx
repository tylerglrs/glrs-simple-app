/**
 * =============================================================================
 * WEEK SELECTOR MODAL - Modal Modernization Update
 * =============================================================================
 *
 * Modal for selecting how many weeks to schedule a meeting.
 * Uses ResponsiveModal for iOS Safari compatibility:
 * - Mobile: Bottom sheet (full height)
 * - Desktop: Centered dialog
 *
 * =============================================================================
 */

import { useState } from 'react'
import { CalendarPlus, Loader2, Calendar } from 'lucide-react'
import { ResponsiveModal } from '@/components/ui/responsive-modal'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import type { Meeting } from '../types'
import { toMeetingCardData } from '../utils/toMeetingCardData'
import { useStatusBarColor } from '@/hooks/useStatusBarColor'

// ============================================================
// TYPES
// ============================================================

export interface WeekSelectorModalProps {
  /** The meeting to add to schedule */
  meeting: Meeting | null
  /** Whether the modal is open */
  isOpen: boolean
  /** Callback when modal is closed */
  onClose: () => void
  /** Callback when user confirms - receives meeting and number of weeks */
  onConfirm: (meeting: Meeting, weeks: number) => Promise<void>
  /** Whether the confirm action is in progress */
  isLoading?: boolean
}

// ============================================================
// CONSTANTS
// ============================================================

const MIN_WEEKS = 1
const MAX_WEEKS = 12
const WEEK_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]

// ============================================================
// COMPONENT
// ============================================================

export function WeekSelectorModal({
  meeting,
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
}: WeekSelectorModalProps) {
  // Set iOS status bar to match modal header color (purple-600)
  useStatusBarColor('#9333EA', isOpen)

  const [weeks, setWeeks] = useState(4) // Default to 4 weeks

  // Handle confirm
  const handleConfirm = async () => {
    if (!meeting) return
    await onConfirm(meeting, weeks)
  }

  // Handle close and reset
  const handleClose = () => {
    if (isLoading) return
    setWeeks(4) // Reset to default
    onClose()
  }

  // Transform meeting to standardized card data
  // This ensures consistent display (day, time, location never blank)
  const cardData = meeting ? toMeetingCardData(meeting) : null

  if (!meeting || !cardData) return null

  return (
    <ResponsiveModal open={isOpen} onOpenChange={handleClose} desktopSize="sm">
      <div className="flex flex-col h-full bg-white overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-purple-600 to-violet-600 shrink-0">
          <h2 className="text-xl font-bold text-white flex items-center gap-3">
            <Calendar className="h-6 w-6" />
            Add to Schedule
          </h2>
          <p className="text-purple-100 text-sm mt-1">
            Schedule this meeting to appear in your Today and Upcoming tabs
          </p>
        </div>

        {/* Content */}
        <ScrollArea className="flex-1">
          <div className="p-6 space-y-6">
            {/* Meeting Info - Now uses cardData for consistent display */}
            <div className="rounded-lg bg-muted/50 p-4 space-y-2">
              <h4 className="font-medium text-foreground line-clamp-2">
                {cardData.name}
              </h4>
              <div className="text-sm text-muted-foreground">
                <span>{cardData.dayDisplay}</span>
                <span className="mx-2">at</span>
                <span>{cardData.timeDisplay}</span>
              </div>
              <p className="text-xs text-muted-foreground truncate">
                {cardData.locationDisplay}
              </p>
            </div>

            {/* Week Selector */}
            <div className="space-y-4" role="group" aria-labelledby="week-selector-label">
              <label id="week-selector-label" className="text-sm font-medium text-foreground">
                How many weeks?
              </label>

              {/* Grid of 1-12 week options */}
              <div className="grid grid-cols-4 gap-2" role="group" aria-label="Week selection">
                {WEEK_OPTIONS.map((weekNum) => (
                  <Button
                    key={weekNum}
                    variant={weeks === weekNum ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setWeeks(weekNum)}
                    disabled={isLoading}
                    className="min-h-[44px] text-base font-medium"
                    aria-label={`${weekNum} ${weekNum === 1 ? 'week' : 'weeks'}`}
                    aria-pressed={weeks === weekNum}
                  >
                    {weekNum}
                  </Button>
                ))}
              </div>

              {/* Helper text */}
              <p className="text-center text-sm text-muted-foreground" aria-live="polite">
                This will create{' '}
                <span className="font-medium text-foreground">{weeks}</span>{' '}
                meeting {weeks === 1 ? 'instance' : 'instances'} on your schedule
              </p>
            </div>
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t bg-muted/30 shrink-0">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isLoading}
            className="gap-2 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700"
            aria-label={`Add ${cardData?.name || 'meeting'} to schedule for ${weeks} ${weeks === 1 ? 'week' : 'weeks'}`}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin motion-reduce:animate-none" aria-hidden="true" />
                Adding...
              </>
            ) : (
              <>
                <CalendarPlus className="h-4 w-4" aria-hidden="true" />
                Add to Schedule
              </>
            )}
          </Button>
        </div>
      </div>
    </ResponsiveModal>
  )
}

export default WeekSelectorModal
