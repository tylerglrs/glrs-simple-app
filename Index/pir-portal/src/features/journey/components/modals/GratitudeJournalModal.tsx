import { useState, useEffect } from 'react'
import { Loader2, Share2, Calendar } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore'
import { db, auth } from '@/lib/firebase'
import type { GratitudeEntry } from '../../types'

// =============================================================================
// TYPES
// =============================================================================

export interface GratitudeJournalModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

// =============================================================================
// COMPONENT
// =============================================================================

export function GratitudeJournalModal({ open, onOpenChange }: GratitudeJournalModalProps) {
  const [entries, setEntries] = useState<GratitudeEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!open) return

    const loadEntries = async () => {
      const user = auth.currentUser
      if (!user) return

      setLoading(true)
      try {
        const gratitudeQuery = query(
          collection(db, 'checkIns'),
          where('userId', '==', user.uid),
          orderBy('createdAt', 'desc'),
          limit(50)
        )

        const snapshot = await getDocs(gratitudeQuery)
        const gratitudeEntries: GratitudeEntry[] = []

        snapshot.docs.forEach((doc) => {
          const data = doc.data()
          if (data.eveningData?.gratitude) {
            const createdAt = data.createdAt?.toDate?.() || new Date()
            gratitudeEntries.push({
              id: doc.id,
              date: createdAt.toISOString().split('T')[0],
              gratitude: data.eveningData.gratitude,
              overallDay: data.eveningData.overallDay,
            })
          }
        })

        setEntries(gratitudeEntries)
      } catch (error) {
        console.error('Error loading gratitude entries:', error)
      } finally {
        setLoading(false)
      }
    }

    loadEntries()
  }, [open])

  const handleShare = async (entry: GratitudeEntry) => {
    // Implementation would share to community
    console.log('Sharing gratitude:', entry)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-lg max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Gratitude Journal</DialogTitle>
        </DialogHeader>

        <p className="text-sm text-muted-foreground">
          All your gratitude entries from evening reflections.
        </p>

        <div className="flex-1 overflow-y-auto mt-4 -mx-6 px-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : entries.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="font-medium">No Gratitude Entries Yet</p>
              <p className="text-sm">Express gratitude in your evening reflections.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {entries.map((entry) => (
                <div
                  key={entry.id}
                  className="rounded-xl border bg-muted/30 p-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-primary">
                      {new Date(entry.date).toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                    {entry.overallDay && (
                      <span
                        className={cn(
                          'rounded-full px-2 py-0.5 text-xs font-bold text-white',
                          entry.overallDay >= 7
                            ? 'bg-green-500'
                            : entry.overallDay >= 5
                              ? 'bg-amber-500'
                              : 'bg-red-500'
                        )}
                      >
                        Day: {entry.overallDay}/10
                      </span>
                    )}
                  </div>

                  <p className="text-sm text-foreground leading-relaxed mb-3">
                    {entry.gratitude}
                  </p>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleShare(entry)}
                    className="gap-1"
                  >
                    <Share2 className="h-3 w-3" />
                    Share Gratitude
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        <Button onClick={() => onOpenChange(false)} className="w-full mt-4">
          Close
        </Button>
      </DialogContent>
    </Dialog>
  )
}

export default GratitudeJournalModal
