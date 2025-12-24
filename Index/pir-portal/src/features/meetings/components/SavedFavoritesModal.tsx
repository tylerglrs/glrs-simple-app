/**
 * =============================================================================
 * SAVED FAVORITES MODAL - Modal Modernization Update
 * =============================================================================
 *
 * Modal for viewing saved meetings and favorites.
 * Uses ResponsiveModal for iOS Safari compatibility:
 * - Mobile: Bottom sheet (full height)
 * - Desktop: Centered dialog (large)
 *
 * =============================================================================
 */

import { useState, useCallback } from 'react'
import {
  Heart,
  Bookmark,
  Trash2,
  Share2,
  MapPin,
  Clock,
  Calendar,
  ExternalLink,
  Loader2,
  Star,
} from 'lucide-react'
import { ResponsiveModal } from '@/components/ui/responsive-modal'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { cn } from '@/lib/utils'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { useToast } from '@/hooks/use-toast'
import { useStatusBarColor } from '@/hooks/useStatusBarColor'
import { Illustration } from '@/components/common/Illustration'
import type { SavedMeeting } from '../hooks/useSavedMeetings'
import { toMeetingCardData, type MeetingCardData } from '../utils/toMeetingCardData'
import {
  ProgramBadge,
  LocationBadge,
  type ProgramType,
} from './MeetingBadge'

// =============================================================================
// TYPES
// =============================================================================

export interface SavedFavoritesModalProps {
  isOpen: boolean
  onClose: () => void
  savedMeetings: SavedMeeting[]
  favorites: SavedMeeting[]
  manualEntries: SavedMeeting[]
  loading: boolean
  onDeleteMeeting: (meetingId: string) => Promise<boolean>
  onToggleFavorite: (meetingId: string) => Promise<boolean>
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Share meeting using Web Share API
 * Uses cardData for consistent display formatting
 */
async function shareMeeting(cardData: MeetingCardData): Promise<boolean> {
  const shareText = [
    cardData.name,
    `${cardData.dayDisplay} at ${cardData.timeDisplay}`,
    cardData.locationDisplay !== 'Location TBD' && `Location: ${cardData.locationDisplay}`,
    cardData.programTypeDisplay !== 'Meeting' && `Type: ${cardData.programTypeDisplay}`,
  ].filter(Boolean).join('\n')

  const shareData = {
    title: cardData.name,
    text: shareText,
  }

  // Check if Web Share API is available
  if (navigator.share && navigator.canShare?.(shareData)) {
    try {
      await navigator.share(shareData)
      return true
    } catch (err) {
      // User cancelled or error
      if ((err as Error).name !== 'AbortError') {
        console.error('Error sharing:', err)
      }
      return false
    }
  } else {
    // Fallback: copy to clipboard
    try {
      await navigator.clipboard.writeText(shareText)
      return true
    } catch (err) {
      console.error('Error copying to clipboard:', err)
      return false
    }
  }
}

// =============================================================================
// MEETING CARD COMPONENT
// =============================================================================

interface MeetingCardProps {
  meeting: SavedMeeting
  onDelete: () => void
  onToggleFavorite: () => void
  onShare: () => void
  isDeleting: boolean
  isMobile: boolean
}

function MeetingCard({
  meeting,
  onDelete,
  onToggleFavorite,
  onShare,
  isDeleting,
  isMobile,
}: MeetingCardProps) {
  // Transform to standardized card data - ensures consistent display
  const cardData = toMeetingCardData(meeting)

  // Normalize program type for badge component
  const normalizedProgramType = cardData.programType.toLowerCase() as ProgramType

  return (
    <article
      className="bg-card rounded-xl border p-3 md:p-4 transition-all motion-reduce:transition-none"
      aria-label={`${cardData.name}, ${cardData.dayDisplay} at ${cardData.timeDisplay}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground text-sm md:text-base">
            {cardData.name}
          </h3>
          <p className="text-xs text-muted-foreground truncate mt-0.5">
            {cardData.locationDisplay}
          </p>
        </div>

        {/* Favorite button */}
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            'shrink-0 h-8 w-8 min-h-[44px] min-w-[44px]',
            meeting.isFavorite && 'text-amber-500'
          )}
          onClick={onToggleFavorite}
          aria-label={meeting.isFavorite ? `Remove ${cardData.name} from favorites` : `Add ${cardData.name} to favorites`}
          aria-pressed={meeting.isFavorite}
        >
          <Star className={cn('h-4 w-4', meeting.isFavorite && 'fill-current')} aria-hidden="true" />
        </Button>
      </div>

      {/* Day & Time - never blank */}
      <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
        <div className="flex items-center gap-1">
          <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
          <span>{cardData.dayDisplay}</span>
        </div>
        <div className="flex items-center gap-1">
          <Clock className="h-3.5 w-3.5" aria-hidden="true" />
          <span>{cardData.timeDisplay}</span>
        </div>
      </div>

      {/* Address */}
      <address className="flex items-start gap-1 mt-2 text-xs text-muted-foreground not-italic">
        <MapPin className="h-3.5 w-3.5 mt-0.5 shrink-0" aria-hidden="true" />
        <span className="line-clamp-2">{cardData.addressDisplay}</span>
      </address>

      {/* Badges & Directions */}
      <div className="flex items-center justify-between mt-3">
        <div className="flex items-center gap-1.5">
          <ProgramBadge
            type={normalizedProgramType}
            size="sm"
            variant="filled"
          />
          {cardData.isHybrid ? (
            <LocationBadge type="hybrid" size="sm" variant="filled" />
          ) : cardData.isVirtual ? (
            <LocationBadge type="virtual" size="sm" variant="filled" />
          ) : null}
          {meeting.isManualEntry && (
            <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium text-muted-foreground bg-muted rounded-md">
              Saved
            </span>
          )}
        </div>

        {cardData.canGetDirections && cardData.directionsUrl && (
          <a
            href={cardData.directionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 rounded px-1 -mx-1"
            aria-label={`Get directions to ${cardData.locationDisplay}`}
          >
            Directions
            <ExternalLink className="h-3 w-3" aria-hidden="true" />
            <span className="sr-only"> (opens in new window)</span>
          </a>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 mt-4 pt-3 border-t">
        <Button
          variant="outline"
          size="sm"
          className="flex-1 gap-2 min-h-[44px]"
          onClick={onShare}
          aria-label={`Share ${cardData.name}`}
        >
          <Share2 className="h-4 w-4" aria-hidden="true" />
          Share
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="flex-1 gap-2 min-h-[44px] text-destructive hover:text-destructive hover:bg-destructive/10"
          onClick={onDelete}
          disabled={isDeleting}
          aria-label={`Delete ${cardData.name}`}
        >
          {isDeleting ? (
            <Loader2 className="h-4 w-4 animate-spin motion-reduce:animate-none" aria-hidden="true" />
          ) : (
            <Trash2 className="h-4 w-4" aria-hidden="true" />
          )}
          Delete
        </Button>
      </div>
    </article>
  )
}

// =============================================================================
// EMPTY STATE COMPONENT
// =============================================================================

function EmptyState({ icon: Icon, title, description, illustrationName }: {
  icon: typeof Heart
  title: string
  description: string
  illustrationName?: 'calendar' | 'community' | 'library' | 'support' | 'empty-state'
}) {
  return (
    <div
      className="flex flex-col items-center justify-center py-12 px-4 text-center"
      role="status"
      aria-label={title}
    >
      {illustrationName ? (
        <div className="mb-4">
          <Illustration name={illustrationName} size="lg" className="opacity-85" />
        </div>
      ) : (
        <Icon className="h-12 w-12 text-muted-foreground mb-4" aria-hidden="true" />
      )}
      <p className="text-lg font-medium text-foreground">{title}</p>
      <p className="text-sm text-muted-foreground mt-1">{description}</p>
    </div>
  )
}

// =============================================================================
// MAIN MODAL COMPONENT
// =============================================================================

export function SavedFavoritesModal({
  isOpen,
  onClose,
  savedMeetings,
  favorites,
  manualEntries,
  loading,
  onDeleteMeeting,
  onToggleFavorite,
}: SavedFavoritesModalProps) {
  const isMobile = useMediaQuery('(max-width: 768px)')
  const { toast } = useToast()

  // Set iOS status bar to match modal header color (amber-500)
  useStatusBarColor('#F59E0B', isOpen)

  const [activeTab, setActiveTab] = useState<'saved' | 'favorites'>('saved')
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<SavedMeeting | null>(null)

  // Handle delete
  const handleDelete = useCallback(async () => {
    if (!confirmDelete) return

    setDeletingId(confirmDelete.id)
    const success = await onDeleteMeeting(confirmDelete.id)
    setDeletingId(null)
    setConfirmDelete(null)

    if (success) {
      toast({
        title: 'Meeting deleted',
        description: `${confirmDelete.name} has been removed`,
      })
    }
  }, [confirmDelete, onDeleteMeeting, toast])

  // Handle share - uses cardData for consistent formatting
  const handleShare = useCallback(async (meeting: SavedMeeting) => {
    const cardData = toMeetingCardData(meeting)
    const canNativeShare = typeof navigator.share === 'function'
    const success = await shareMeeting(cardData)
    if (success) {
      toast({
        title: canNativeShare ? 'Shared!' : 'Copied to clipboard',
        description: canNativeShare
          ? 'Meeting details shared successfully'
          : 'Meeting details copied to clipboard',
      })
    }
  }, [toast])

  // Handle toggle favorite
  const handleToggleFavorite = useCallback(async (meetingId: string) => {
    const success = await onToggleFavorite(meetingId)
    if (success) {
      const meeting = savedMeetings.find((m) => m.id === meetingId)
      toast({
        title: meeting?.isFavorite ? 'Removed from favorites' : 'Added to favorites',
      })
    }
  }, [onToggleFavorite, savedMeetings, toast])

  return (
    <>
      <ResponsiveModal open={isOpen} onOpenChange={(open) => !open && onClose()} desktopSize="lg">
        <div className="flex flex-col h-full bg-white overflow-hidden">
          {/* Header */}
          <div className="px-6 py-4 bg-gradient-to-r from-amber-500 to-orange-500 shrink-0">
            <h2 className="text-xl font-bold text-white flex items-center gap-3">
              <Star className="h-6 w-6" />
              Saved & Favorites
            </h2>
            <p className="text-amber-100 text-sm mt-1">
              Your saved meetings and favorites
            </p>
          </div>

          {/* Tabs - sticky below header */}
          <div className="border-b bg-white shrink-0">
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'saved' | 'favorites')} className="w-full">
              <TabsList className="grid w-full grid-cols-2 h-12 rounded-none bg-transparent p-0">
                <TabsTrigger
                  value="saved"
                  className={cn(
                    'h-full rounded-none border-b-2 data-[state=active]:border-amber-500 data-[state=active]:bg-transparent',
                    'data-[state=inactive]:border-transparent gap-2 min-h-[44px]'
                  )}
                  aria-label={`Saved meetings, ${manualEntries.length} ${manualEntries.length === 1 ? 'meeting' : 'meetings'}`}
                >
                  <Bookmark className="h-4 w-4" aria-hidden="true" />
                  Saved
                  {manualEntries.length > 0 && (
                    <Badge variant="secondary" className="ml-1.5 text-xs" aria-hidden="true">
                      {manualEntries.length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger
                  value="favorites"
                  className={cn(
                    'h-full rounded-none border-b-2 data-[state=active]:border-amber-500 data-[state=active]:bg-transparent',
                    'data-[state=inactive]:border-transparent gap-2 min-h-[44px]'
                  )}
                  aria-label={`Favorite meetings, ${favorites.length} ${favorites.length === 1 ? 'meeting' : 'meetings'}`}
                >
                  <Heart className="h-4 w-4" aria-hidden="true" />
                  Favorites
                  {favorites.length > 0 && (
                    <Badge variant="secondary" className="ml-1.5 text-xs" aria-hidden="true">
                      {favorites.length}
                    </Badge>
                  )}
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Content */}
          <ScrollArea className="flex-1">
            <Tabs value={activeTab} className="w-full">
              {/* Saved Tab */}
              <TabsContent value="saved" className="m-0">
                {loading ? (
                  <div
                    className="flex flex-col items-center justify-center py-12"
                    role="status"
                    aria-label="Loading saved meetings"
                  >
                    <Loader2 className="h-8 w-8 animate-spin motion-reduce:animate-none text-muted-foreground mb-4" aria-hidden="true" />
                    <p className="text-muted-foreground">Loading saved meetings...</p>
                  </div>
                ) : manualEntries.length === 0 ? (
                  <EmptyState
                    icon={Bookmark}
                    title="No saved meetings"
                    description="Meetings you create manually will appear here"
                    illustrationName="calendar"
                  />
                ) : (
                  <div className="p-4 space-y-3">
                    {manualEntries.map((meeting) => (
                      <MeetingCard
                        key={meeting.id}
                        meeting={meeting}
                        onDelete={() => setConfirmDelete(meeting)}
                        onToggleFavorite={() => handleToggleFavorite(meeting.id)}
                        onShare={() => handleShare(meeting)}
                        isDeleting={deletingId === meeting.id}
                        isMobile={isMobile}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* Favorites Tab */}
              <TabsContent value="favorites" className="m-0">
                {loading ? (
                  <div
                    className="flex flex-col items-center justify-center py-12"
                    role="status"
                    aria-label="Loading favorite meetings"
                  >
                    <Loader2 className="h-8 w-8 animate-spin motion-reduce:animate-none text-muted-foreground mb-4" aria-hidden="true" />
                    <p className="text-muted-foreground">Loading favorites...</p>
                  </div>
                ) : favorites.length === 0 ? (
                  <EmptyState
                    icon={Heart}
                    title="No favorite meetings"
                    description="Heart meetings in Browse to add them here"
                    illustrationName="community"
                  />
                ) : (
                  <div className="p-4 space-y-3">
                    {favorites.map((meeting) => (
                      <MeetingCard
                        key={meeting.id}
                        meeting={meeting}
                        onDelete={() => setConfirmDelete(meeting)}
                        onToggleFavorite={() => handleToggleFavorite(meeting.id)}
                        onShare={() => handleShare(meeting)}
                        isDeleting={deletingId === meeting.id}
                        isMobile={isMobile}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </ScrollArea>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t bg-muted/30 shrink-0">
            <Button type="button" variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </ResponsiveModal>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!confirmDelete} onOpenChange={(open) => !open && setConfirmDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Meeting?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{confirmDelete?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

export default SavedFavoritesModal
