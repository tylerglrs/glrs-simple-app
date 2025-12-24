import { Calendar, Settings } from 'lucide-react'
import { ResponsiveModal } from '@/components/ui/responsive-modal'
import { Button } from '@/components/ui/button'

// =============================================================================
// TYPES
// =============================================================================

export interface JourneyCalendarModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onOpenCalendarHeatmap?: () => void
  onOpenGraphSettings?: () => void
}

// =============================================================================
// COMPONENT
// =============================================================================

export function JourneyCalendarModal({
  open,
  onOpenChange,
  onOpenCalendarHeatmap,
  onOpenGraphSettings,
}: JourneyCalendarModalProps) {
  return (
    <ResponsiveModal open={open} onOpenChange={onOpenChange} desktopSize="sm">
      <div className="flex flex-col h-full bg-white overflow-hidden">
        <div className="px-4 py-3 border-b shrink-0">
          <h2 className="text-lg font-semibold">Journey Calendar</h2>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {/* Check-In Calendar Button */}
          <Button
            variant="outline"
            className="w-full justify-start gap-3 h-auto py-4"
            onClick={() => {
              onOpenChange(false)
              onOpenCalendarHeatmap?.()
            }}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20">
              <Calendar className="h-5 w-5 text-primary" />
            </div>
            <div className="text-left">
              <div className="font-semibold">Check-In Calendar</div>
              <div className="text-xs text-muted-foreground">
                View your check-in history with mood colors
              </div>
            </div>
          </Button>

          {/* Graph Settings Button */}
          <Button
            variant="outline"
            className="w-full justify-start gap-3 h-auto py-4"
            onClick={() => {
              onOpenChange(false)
              onOpenGraphSettings?.()
            }}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20">
              <Settings className="h-5 w-5 text-primary" />
            </div>
            <div className="text-left">
              <div className="font-semibold">Graph Settings</div>
              <div className="text-xs text-muted-foreground">
                Customize which charts to display
              </div>
            </div>
          </Button>
        </div>

        <Button
          variant="ghost"
          onClick={() => onOpenChange(false)}
          className="w-full mt-2"
        >
          Cancel
        </Button>
      </div>
    </ResponsiveModal>
  )
}

export default JourneyCalendarModal
