import { useEffect, useState } from 'react'
import {
  Calendar,
  Clock,
  MapPin,
  Video,
  Users,
  ExternalLink,
  X,
  Info,
  Globe,
  Accessibility,
  Phone,
} from 'lucide-react'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import type { SupportGroup, SupportGroupType } from '../types'

// ============================================================
// TYPES
// ============================================================

interface GroupDetailsModalProps {
  groupId?: string
  onClose: () => void
}

// ============================================================
// CONSTANTS
// ============================================================

const GROUP_TYPE_STYLES: Record<
  SupportGroupType,
  { bg: string; text: string; label: string; description: string }
> = {
  AA: {
    bg: 'bg-blue-100 dark:bg-blue-900/30',
    text: 'text-blue-700 dark:text-blue-300',
    label: 'AA',
    description: 'Alcoholics Anonymous',
  },
  NA: {
    bg: 'bg-orange-100 dark:bg-orange-900/30',
    text: 'text-orange-700 dark:text-orange-300',
    label: 'NA',
    description: 'Narcotics Anonymous',
  },
  SMART: {
    bg: 'bg-green-100 dark:bg-green-900/30',
    text: 'text-green-700 dark:text-green-300',
    label: 'SMART',
    description: 'SMART Recovery',
  },
  Refuge: {
    bg: 'bg-purple-100 dark:bg-purple-900/30',
    text: 'text-purple-700 dark:text-purple-300',
    label: 'Refuge',
    description: 'Refuge Recovery',
  },
  Other: {
    bg: 'bg-gray-100 dark:bg-gray-800',
    text: 'text-gray-700 dark:text-gray-300',
    label: 'Other',
    description: 'Support Group',
  },
}

// ============================================================
// LOADING STATE
// ============================================================

function LoadingState() {
  return (
    <div className="space-y-4 p-4">
      <div className="flex items-start justify-between">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
      <Separator />
      <div className="space-y-3">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-5 w-48" />
      </div>
      <Skeleton className="h-10 w-full rounded-md" />
    </div>
  )
}

// ============================================================
// ERROR STATE
// ============================================================

function ErrorState({ onClose }: { onClose: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
        <Info className="h-6 w-6 text-destructive" />
      </div>
      <h3 className="text-base font-semibold text-foreground mb-2">
        Group Not Found
      </h3>
      <p className="text-sm text-muted-foreground max-w-[250px] mb-4">
        This support group may have been removed or is no longer available.
      </p>
      <Button variant="outline" onClick={onClose}>
        Close
      </Button>
    </div>
  )
}

// ============================================================
// DETAIL ITEM COMPONENT
// ============================================================

interface DetailItemProps {
  icon: typeof Calendar
  label: string
  value: string
  className?: string
}

function DetailItem({ icon: Icon, label, value, className }: DetailItemProps) {
  return (
    <div className={cn('flex items-start gap-3', className)}>
      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          {label}
        </p>
        <p className="text-sm text-foreground mt-0.5">{value}</p>
      </div>
    </div>
  )
}

// ============================================================
// MAIN COMPONENT
// ============================================================

export function GroupDetailsModal({ groupId, onClose }: GroupDetailsModalProps) {
  const isMobile = useMediaQuery('(max-width: 768px)')
  const [group, setGroup] = useState<SupportGroup | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  // Load group data
  useEffect(() => {
    if (!groupId) {
      setError(true)
      setLoading(false)
      return
    }

    const loadGroup = async () => {
      try {
        const groupDoc = await getDoc(doc(db, 'supportGroups', groupId))
        if (groupDoc.exists()) {
          setGroup({ id: groupDoc.id, ...groupDoc.data() } as SupportGroup)
        } else {
          setError(true)
        }
      } catch (err) {
        console.error('[GroupDetailsModal] Error loading group:', err)
        setError(true)
      } finally {
        setLoading(false)
      }
    }

    loadGroup()
  }, [groupId])

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  // Handle join meeting
  const handleJoinMeeting = () => {
    if (group?.link) {
      window.open(group.link, '_blank', 'noopener,noreferrer')
    }
  }

  // Get type style
  const typeStyle = group
    ? GROUP_TYPE_STYLES[group.type] || GROUP_TYPE_STYLES.Other
    : GROUP_TYPE_STYLES.Other

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent
        className="max-w-[95vw] sm:max-w-md p-0 gap-0 overflow-hidden"
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 rounded-full p-1 opacity-70 hover:opacity-100 hover:bg-muted transition-all"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        {loading ? (
          <LoadingState />
        ) : error || !group ? (
          <ErrorState onClose={onClose} />
        ) : (
          <>
            {/* Header */}
            <DialogHeader className="p-4 pb-3">
              <div className="flex items-start gap-3 pr-8">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <DialogTitle className="text-lg font-semibold text-foreground leading-tight">
                    {group.name}
                  </DialogTitle>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge
                      variant="secondary"
                      className={cn(
                        'font-semibold text-xs',
                        typeStyle.bg,
                        typeStyle.text
                      )}
                    >
                      {typeStyle.label}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {typeStyle.description}
                    </span>
                  </div>
                </div>
              </div>
            </DialogHeader>

            {/* Content */}
            <div className="px-4 pb-4 space-y-4">
              {/* Description */}
              {group.description && (
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {group.description}
                </p>
              )}

              <Separator />

              {/* Meeting Details */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-foreground">
                  Meeting Schedule
                </h4>
                <div className="space-y-2.5">
                  <DetailItem icon={Calendar} label="Day" value={group.day} />
                  <DetailItem icon={Clock} label="Time" value={group.time} />

                  {group.location && (
                    <DetailItem
                      icon={MapPin}
                      label="Location"
                      value={group.location}
                    />
                  )}

                  {!group.location && group.link && (
                    <DetailItem
                      icon={Video}
                      label="Format"
                      value="Virtual Meeting"
                    />
                  )}

                  {group.format && (
                    <DetailItem
                      icon={Globe}
                      label="Format"
                      value={group.format}
                    />
                  )}

                  {group.memberCount && (
                    <DetailItem
                      icon={Users}
                      label="Members"
                      value={`${group.memberCount} members`}
                    />
                  )}

                  {group.accessibility && (
                    <DetailItem
                      icon={Accessibility}
                      label="Accessibility"
                      value={group.accessibility}
                    />
                  )}

                  {group.contact && (
                    <DetailItem
                      icon={Phone}
                      label="Contact"
                      value={group.contact}
                    />
                  )}
                </div>
              </div>

              {/* Notes */}
              {group.notes && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-foreground">
                      Additional Information
                    </h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {group.notes}
                    </p>
                  </div>
                </>
              )}

              {/* Join Button */}
              {group.link && (
                <>
                  <Separator />
                  <Button
                    onClick={handleJoinMeeting}
                    className="w-full"
                    size={isMobile ? 'lg' : 'default'}
                  >
                    <Video className="h-4 w-4 mr-2" />
                    Join Virtual Meeting
                    <ExternalLink className="h-3 w-3 ml-2" />
                  </Button>
                </>
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default GroupDetailsModal
