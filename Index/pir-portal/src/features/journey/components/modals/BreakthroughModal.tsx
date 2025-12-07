import { useState, useEffect } from 'react'
import { Loader2, Sparkles, Plus, Check, Calendar } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore'
import { db, auth } from '@/lib/firebase'
import { updateContextAfterBreakthrough } from '@/lib/updateAIContext'
import type { Breakthrough } from '../../types'

// =============================================================================
// TYPES
// =============================================================================

export interface BreakthroughModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

// =============================================================================
// COMPONENT
// =============================================================================

export function BreakthroughModal({ open, onOpenChange }: BreakthroughModalProps) {
  const [breakthroughs, setBreakthroughs] = useState<Breakthrough[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [newBreakthrough, setNewBreakthrough] = useState('')

  useEffect(() => {
    if (!open) return

    const loadBreakthroughs = async () => {
      const user = auth.currentUser
      if (!user) return

      setLoading(true)
      try {
        const breakthroughQuery = query(
          collection(db, 'breakthroughs'),
          where('userId', '==', user.uid),
          orderBy('createdAt', 'desc')
        )

        const snapshot = await getDocs(breakthroughQuery)
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Breakthrough[]

        setBreakthroughs(data)
      } catch (error) {
        console.error('Error loading breakthroughs:', error)
      } finally {
        setLoading(false)
      }
    }

    loadBreakthroughs()
  }, [open])

  const handleSave = async () => {
    const user = auth.currentUser
    if (!user || !newBreakthrough.trim()) return

    setSaving(true)
    try {
      await addDoc(collection(db, 'breakthroughs'), {
        userId: user.uid,
        challengeText: newBreakthrough.trim(),
        createdAt: serverTimestamp(),
        isAcknowledged: false,
      })

      // Update AI context
      await updateContextAfterBreakthrough(user.uid)

      // Refresh list
      const breakthroughQuery = query(
        collection(db, 'breakthroughs'),
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc')
      )
      const snapshot = await getDocs(breakthroughQuery)
      setBreakthroughs(
        snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Breakthrough[]
      )

      setNewBreakthrough('')
      setShowForm(false)
    } catch (error) {
      console.error('Error saving breakthrough:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleAcknowledge = async (breakthroughId: string) => {
    try {
      await updateDoc(doc(db, 'breakthroughs', breakthroughId), {
        isAcknowledged: true,
      })

      setBreakthroughs((prev) =>
        prev.map((b) =>
          b.id === breakthroughId ? { ...b, isAcknowledged: true } : b
        )
      )
    } catch (error) {
      console.error('Error acknowledging breakthrough:', error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-lg max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-yellow-500" />
            Breakthrough Moments
          </DialogTitle>
        </DialogHeader>

        <p className="text-sm text-muted-foreground">
          Record and celebrate your breakthrough moments in recovery.
        </p>

        {/* Add New Form */}
        {showForm ? (
          <div className="rounded-xl border-2 border-primary bg-primary/5 p-4 mt-4">
            <h4 className="font-semibold mb-2">Record a Breakthrough</h4>
            <Textarea
              value={newBreakthrough}
              onChange={(e) => setNewBreakthrough(e.target.value)}
              placeholder="Describe your breakthrough moment..."
              className="min-h-[100px] mb-3"
            />
            <div className="flex gap-2">
              <Button
                onClick={handleSave}
                disabled={saving || !newBreakthrough.trim()}
                className="flex-1"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Saving...
                  </>
                ) : (
                  'Save Breakthrough'
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowForm(false)
                  setNewBreakthrough('')
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <Button
            variant="outline"
            onClick={() => setShowForm(true)}
            className="gap-2 mt-4"
          >
            <Plus className="h-4 w-4" />
            Record New Breakthrough
          </Button>
        )}

        <div className="flex-1 overflow-y-auto mt-4 -mx-6 px-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : breakthroughs.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Sparkles className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="font-medium">No Breakthroughs Yet</p>
              <p className="text-sm">Record your recovery wins and breakthrough moments.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {breakthroughs.map((breakthrough) => {
                const date = breakthrough.createdAt?.toDate?.() || new Date()

                return (
                  <div
                    key={breakthrough.id}
                    className={cn(
                      'rounded-xl border p-4',
                      breakthrough.isAcknowledged
                        ? 'bg-green-50 border-green-200'
                        : 'bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-300'
                    )}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {breakthrough.isAcknowledged ? (
                          <Check className="h-5 w-5 text-green-500" />
                        ) : (
                          <Sparkles className="h-5 w-5 text-yellow-500" />
                        )}
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {date.toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </div>
                      </div>

                      {!breakthrough.isAcknowledged && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleAcknowledge(breakthrough.id)}
                          className="gap-1"
                        >
                          <Check className="h-3 w-3" />
                          Acknowledge
                        </Button>
                      )}
                    </div>

                    <p className="text-sm text-foreground leading-relaxed">
                      {breakthrough.challengeText}
                    </p>

                    {breakthrough.isAcknowledged && (
                      <p className="text-xs text-green-600 mt-2 font-medium">
                        ✓ Acknowledged
                      </p>
                    )}
                  </div>
                )
              })}
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

export default BreakthroughModal
