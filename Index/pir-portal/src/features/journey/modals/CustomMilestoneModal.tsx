import { useState, useEffect } from 'react'
import {
  Calendar,
  User,
  Briefcase,
  GraduationCap,
  Heart,
  Users,
  Star,
  Plus,
  Trash2,
  Edit2,
  Check,
  Home,
  Bell,
  BellOff,
  Award,
} from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import { Illustration } from '@/components/common/Illustration'
import { db, auth } from '@/lib/firebase'
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore'
import {
  CUSTOM_MILESTONE_CATEGORIES,
  type CustomMilestone,
} from '../types/recovery'
import { MilestoneBadges } from '../components/MilestoneBadges'

// Helper to calculate days since milestone date
function getDaysSince(dateStr: string): number {
  const [year, month, day] = dateStr.split('-').map(Number)
  const milestoneDate = new Date(year, month - 1, day)
  milestoneDate.setHours(0, 0, 0, 0)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const diffTime = today.getTime() - milestoneDate.getTime()
  return Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24)))
}

// =============================================================================
// TYPES
// =============================================================================

interface CustomMilestoneModalProps {
  isOpen: boolean
  onClose: () => void
}

// =============================================================================
// ICON COMPONENTS
// =============================================================================

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  personal: User,
  career: Briefcase,
  education: GraduationCap,
  health: Heart,
  relationship: Users,
  housing: Home,
  other: Star,
}

// =============================================================================
// COMPONENT
// =============================================================================

export function CustomMilestoneModal({ isOpen, onClose }: CustomMilestoneModalProps) {
  const [milestones, setMilestones] = useState<CustomMilestone[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  // Form state
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [category, setCategory] = useState<string>('career')
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)
  const [saving, setSaving] = useState(false)

  // Load milestones from Firestore
  useEffect(() => {
    const user = auth.currentUser
    if (!user || !isOpen) return

    const milestonesRef = collection(db, 'customMilestones')
    const q = query(
      milestonesRef,
      where('userId', '==', user.uid),
      orderBy('date', 'desc')
    )

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as CustomMilestone[]
        setMilestones(data)
        setLoading(false)
      },
      (error) => {
        console.error('Error loading custom milestones:', error)
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [isOpen])

  const resetForm = () => {
    setTitle('')
    setDescription('')
    setDate(new Date().toISOString().split('T')[0])
    setCategory('career')
    setNotificationsEnabled(true)
    setEditingId(null)
    setShowForm(false)
  }

  const handleSave = async () => {
    const user = auth.currentUser
    if (!user || !title.trim()) return

    setSaving(true)
    try {
      if (editingId) {
        // Update existing
        await updateDoc(doc(db, 'customMilestones', editingId), {
          title: title.trim(),
          description: description.trim(),
          date,
          category,
          notificationsEnabled,
          updatedAt: serverTimestamp(),
        })
      } else {
        // Create new
        await addDoc(collection(db, 'customMilestones'), {
          userId: user.uid,
          title: title.trim(),
          description: description.trim(),
          date,
          category,
          notificationsEnabled,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        })
      }
      resetForm()
    } catch (error) {
      console.error('Error saving milestone:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (milestone: CustomMilestone) => {
    setTitle(milestone.title)
    setDescription(milestone.description || '')
    setDate(milestone.date)
    setCategory(milestone.category)
    setNotificationsEnabled(milestone.notificationsEnabled ?? true)
    setEditingId(milestone.id || null)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this milestone?')) return

    try {
      await deleteDoc(doc(db, 'customMilestones', id))
    } catch (error) {
      console.error('Error deleting milestone:', error)
    }
  }

  const getCategoryInfo = (categoryId: string) => {
    return CUSTOM_MILESTONE_CATEGORIES.find((c) => c.id === categoryId)
  }

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="bottom" className="h-[85vh] rounded-t-2xl p-0">
        {/* Header */}
        <SheetHeader className="px-6 py-4 bg-gradient-to-r from-purple-500 to-purple-600 rounded-t-2xl relative overflow-hidden">
          {/* Decorative illustration */}
          <div className="absolute right-0 top-1/2 -translate-y-1/2 opacity-15 pointer-events-none">
            <Illustration name="milestone" size="md" />
          </div>
          <div className="relative z-10">
            <SheetTitle className="text-lg font-semibold text-white">
              Custom Milestones
            </SheetTitle>
            <SheetDescription className="text-sm text-white/80">
              Track your personal achievements
            </SheetDescription>
          </div>
        </SheetHeader>

        {/* Content */}
        <ScrollArea className="flex-1 h-[calc(85vh-180px)]">
          <div className="p-4">
          {/* Add New Button */}
          {!showForm && (
            <Button
              onClick={() => setShowForm(true)}
              className="w-full mb-4 bg-purple-500 hover:bg-purple-600"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add New Milestone
            </Button>
          )}

          {/* Form */}
          {showForm && (
            <div className="mb-6 rounded-xl border-2 border-purple-200 bg-purple-50 p-4">
              <h3 className="mb-4 font-semibold text-purple-900">
                {editingId ? 'Edit Milestone' : 'New Milestone'}
              </h3>

              {/* Title */}
              <div className="mb-3">
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Title *
                </label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Started new job"
                  className="border-purple-200 focus:border-purple-500"
                />
              </div>

              {/* Description */}
              <div className="mb-3">
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Description
                </label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Add any details about this milestone..."
                  rows={2}
                  className="border-purple-200 focus:border-purple-500"
                />
              </div>

              {/* Date */}
              <div className="mb-3">
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Date *
                </label>
                <Input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="border-purple-200 focus:border-purple-500"
                />
              </div>

              {/* Category */}
              <div className="mb-4">
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Category
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {CUSTOM_MILESTONE_CATEGORIES.map((cat) => {
                    const Icon = CATEGORY_ICONS[cat.id]
                    return (
                      <button
                        key={cat.id}
                        onClick={() => setCategory(cat.id)}
                        className={cn(
                          'flex flex-col items-center gap-1 rounded-lg border-2 p-2 transition-all',
                          category === cat.id
                            ? 'border-purple-500 bg-purple-100'
                            : 'border-gray-200 hover:border-purple-300'
                        )}
                      >
                        <Icon
                          className="h-5 w-5"
                          style={{ color: cat.color }}
                        />
                        <span className="text-xs font-medium">{cat.name}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Notifications Toggle */}
              <div className="mb-4">
                <button
                  type="button"
                  onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                  className={cn(
                    'flex w-full items-center justify-between rounded-lg border-2 p-3 transition-all',
                    notificationsEnabled
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 bg-gray-50'
                  )}
                >
                  <div className="flex items-center gap-2">
                    {notificationsEnabled ? (
                      <Bell className="h-5 w-5 text-purple-600" />
                    ) : (
                      <BellOff className="h-5 w-5 text-gray-400" />
                    )}
                    <div className="text-left">
                      <p className="text-sm font-medium text-gray-900">
                        Anniversary Notifications
                      </p>
                      <p className="text-xs text-gray-500">
                        Get notified at 30, 60, 90 days and yearly anniversaries
                      </p>
                    </div>
                  </div>
                  <div
                    className={cn(
                      'h-5 w-9 rounded-full transition-colors',
                      notificationsEnabled ? 'bg-purple-500' : 'bg-gray-300'
                    )}
                  >
                    <div
                      className={cn(
                        'h-4 w-4 rounded-full bg-white shadow-sm transition-transform mt-0.5',
                        notificationsEnabled ? 'translate-x-4 ml-0.5' : 'translate-x-0.5'
                      )}
                    />
                  </div>
                </button>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={resetForm}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={!title.trim() || saving}
                  className="flex-1 bg-purple-500 hover:bg-purple-600"
                >
                  {saving ? 'Saving...' : editingId ? 'Update' : 'Save'}
                </Button>
              </div>
            </div>
          )}

          {/* Milestones List */}
          <div className="space-y-3">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin h-8 w-8 border-4 border-purple-500 border-t-transparent rounded-full mx-auto" />
                <p className="mt-2 text-sm text-gray-500">Loading milestones...</p>
              </div>
            ) : milestones.length === 0 ? (
              <div className="text-center py-8 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border-2 border-dashed border-purple-200">
                <div className="mb-3">
                  <Illustration name="anniversary" size="lg" className="mx-auto opacity-85" />
                </div>
                <p className="mt-2 font-medium text-gray-700">No custom milestones yet</p>
                <p className="text-sm text-gray-500 px-4 mt-1">
                  Add milestones like starting a new job, getting your license back, or any personal achievement!
                </p>
              </div>
            ) : (
              milestones.map((milestone) => {
                const catInfo = getCategoryInfo(milestone.category)
                const Icon = CATEGORY_ICONS[milestone.category] || Star
                const milestoneDate = new Date(milestone.date)
                const isPast = milestoneDate <= new Date()
                const daysSince = getDaysSince(milestone.date)

                return (
                  <div
                    key={milestone.id}
                    className={cn(
                      'rounded-xl border-2 p-4 transition-all',
                      isPast
                        ? 'border-green-200 bg-green-50'
                        : 'border-blue-200 bg-blue-50'
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className="flex h-10 w-10 items-center justify-center rounded-full"
                        style={{ backgroundColor: catInfo?.color + '20' }}
                      >
                        <Icon
                          className="h-5 w-5"
                          style={{ color: catInfo?.color }}
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-semibold text-gray-900">
                              {milestone.title}
                            </h4>
                            <p className="text-sm text-gray-500">
                              <Calendar className="mr-1 inline-block h-3 w-3" />
                              {milestoneDate.toLocaleDateString('en-US', {
                                month: 'long',
                                day: 'numeric',
                                year: 'numeric',
                              })}
                              {isPast && (
                                <>
                                  <span className="mx-1">•</span>
                                  <span className="font-medium text-green-600">
                                    {daysSince} day{daysSince !== 1 ? 's' : ''}
                                  </span>
                                </>
                              )}
                            </p>
                          </div>
                          <div className="flex gap-1">
                            <button
                              onClick={() => handleEdit(milestone)}
                              className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-200 hover:text-gray-600"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => milestone.id && handleDelete(milestone.id)}
                              className="p-1.5 rounded-lg text-gray-400 hover:bg-red-100 hover:text-red-600"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                        {milestone.description && (
                          <p className="mt-2 text-sm text-gray-600">
                            {milestone.description}
                          </p>
                        )}

                        {/* Badges */}
                        {isPast && daysSince > 0 && (
                          <div className="mt-3">
                            <MilestoneBadges
                              daysSince={daysSince}
                              milestoneTitle={milestone.title}
                              compact
                              showNext
                            />
                          </div>
                        )}

                        <span
                          className="mt-2 inline-block rounded-full px-2 py-0.5 text-xs font-medium"
                          style={{
                            backgroundColor: catInfo?.color + '20',
                            color: catInfo?.color,
                          }}
                        >
                          {catInfo?.name}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="border-t bg-gray-50 p-4 shrink-0">
          <Button variant="outline" onClick={onClose} className="w-full">
            Close
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}

export default CustomMilestoneModal
