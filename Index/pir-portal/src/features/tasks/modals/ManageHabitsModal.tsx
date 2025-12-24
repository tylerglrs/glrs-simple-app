import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  EnhancedDialog,
  EnhancedDialogContent,
} from '@/components/ui/enhanced-dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
import {
  Settings,
  X,
  Loader2,
  Plus,
  Trash2,
  Repeat,
  AlertTriangle,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { useHabits } from '../hooks/useTasksModalData'
import { haptics } from '@/lib/animations'
import { doc, updateDoc, Timestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'

// =============================================================================
// TYPES
// =============================================================================

export interface ManageHabitsModalProps {
  onClose: () => void
}

// =============================================================================
// ANIMATION VARIANTS
// =============================================================================

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring' as const,
      stiffness: 400,
      damping: 25,
    },
  },
  exit: {
    opacity: 0,
    x: -50,
    scale: 0.95,
    transition: { duration: 0.2 },
  },
}

// =============================================================================
// COMPONENT
// =============================================================================

export function ManageHabitsModal({ onClose }: ManageHabitsModalProps) {
  const isMobile = useMediaQuery('(max-width: 768px)')
  const { habits: firestoreHabits, loading, addHabit } = useHabits()


  // Local state for optimistic UI updates
  const [deletedIds, setDeletedIds] = useState<Set<string>>(new Set())

  // Filter out deleted habits for display
  const habits = firestoreHabits.filter(h => !deletedIds.has(h.id))

  const [newHabitName, setNewHabitName] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [confirmDeleteHabit, setConfirmDeleteHabit] = useState<{
    id: string
    name: string
  } | null>(null)

  const handleAddHabit = async () => {
    if (!newHabitName.trim() || submitting) return

    haptics.tap()
    setSubmitting(true)
    const success = await addHabit(newHabitName.trim())
    setSubmitting(false)

    if (success) {
      setNewHabitName('')
      haptics.success()
    }
  }

  const handleDeleteHabit = async (habitId: string) => {
    setDeletingId(habitId)
    haptics.tap()

    // Optimistic UI update - immediately hide the habit
    setDeletedIds(prev => new Set([...prev, habitId]))
    setConfirmDeleteHabit(null)

    try {
      // Soft delete: set deletedAfterDate to today
      // This means the habit is active through today, disappears tomorrow
      const today = new Date()
      today.setHours(23, 59, 59, 999) // End of today

      await updateDoc(doc(db, 'habits', habitId), {
        deletedAfterDate: Timestamp.fromDate(today),
      })

      haptics.success()
    } catch (error) {
      console.error('Error deleting habit:', error)
      // Revert optimistic update on error
      setDeletedIds(prev => {
        const next = new Set(prev)
        next.delete(habitId)
        return next
      })
    } finally {
      setDeletingId(null)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleAddHabit()
    }
  }

  // Loading state
  if (loading) {
    return (
      <EnhancedDialog open onOpenChange={onClose}>
        <EnhancedDialogContent
          variant={isMobile ? 'fullscreen' : 'bottom-sheet'}
          showCloseButton={false}
          className="p-0"
        >
          <div className="flex items-center justify-center h-full min-h-[400px]">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center gap-3"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' as const }}
              >
                <Settings className="h-10 w-10 text-slate-500" />
              </motion.div>
              <p className="text-sm text-muted-foreground">Loading habits...</p>
            </motion.div>
          </div>
        </EnhancedDialogContent>
      </EnhancedDialog>
    )
  }

  return (
    <>
      <EnhancedDialog open onOpenChange={onClose}>
        <EnhancedDialogContent
          variant={isMobile ? 'fullscreen' : 'bottom-sheet'}
          showCloseButton={false}
          className="p-0 flex flex-col"
        >
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative bg-gradient-to-br from-slate-700 via-slate-600 to-slate-700 p-6"
          >
            {/* Close button */}
            <button
              onClick={() => {
                haptics.tap()
                onClose()
              }}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors z-10"
            >
              <X className="h-5 w-5 text-white" />
            </button>

            {/* Title */}
            <div className="flex items-center gap-3 relative z-10">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring' as const, stiffness: 400, damping: 15, delay: 0.2 }}
                className="p-3 rounded-xl bg-white/20 backdrop-blur-sm"
              >
                <Settings className="h-7 w-7 text-white" />
              </motion.div>
              <div>
                <h2 className="text-xl font-bold text-white">Manage Habits</h2>
                <p className="text-white/80 text-sm">Add or remove your daily habits</p>
              </div>
            </div>
          </motion.div>

          {/* Content */}
          <ScrollArea className="flex-1">
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="p-4 md:p-5 space-y-4 md:space-y-5"
            >
              {/* Add New Habit */}
              <motion.div
                variants={itemVariants}
                className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-4 border-2 border-emerald-200"
              >
                <label className="text-sm font-semibold text-emerald-800 mb-2 block">
                  Add New Habit
                </label>
                <div className="flex gap-2">
                  <Input
                    value={newHabitName}
                    onChange={(e) => setNewHabitName(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="e.g., Drink 8 glasses of water"
                    disabled={submitting}
                    className="flex-1 text-base border-emerald-200 focus:border-emerald-400 focus:ring-emerald-400"
                  />
                  <Button
                    onClick={handleAddHabit}
                    disabled={!newHabitName.trim() || submitting}
                    className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 shadow-lg shadow-emerald-500/20 px-4"
                  >
                    {submitting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Plus className="h-5 w-5" />
                    )}
                  </Button>
                </div>
              </motion.div>

              {/* Current Habits */}
              <motion.div variants={itemVariants}>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-1.5 h-5 rounded-full bg-gradient-to-b from-slate-500 to-slate-600" />
                  <h3 className="font-semibold text-foreground">Your Habits</h3>
                  <span className="text-sm text-muted-foreground">({habits.length})</span>
                </div>

                {habits.length === 0 ? (
                  <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-center py-10 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200"
                  >
                    <Repeat className="h-14 w-14 mx-auto text-gray-300 mb-3" />
                    <h3 className="font-semibold text-foreground mb-1">No Habits Yet</h3>
                    <p className="text-sm text-muted-foreground px-4">
                      Add your first habit above to get started!
                    </p>
                  </motion.div>
                ) : (
                  <div className="space-y-2">
                    <AnimatePresence mode="popLayout">
                      {habits.map((habit) => {
                        const isDeleting = deletingId === habit.id

                        return (
                          <motion.div
                            key={habit.id}
                            variants={itemVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            layout
                            className={cn(
                              'flex items-center justify-between gap-3 p-4 rounded-xl border-2 transition-all',
                              'bg-white border-slate-200 hover:border-slate-300'
                            )}
                          >
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <div className="p-2 rounded-lg bg-emerald-100">
                                <Repeat className="h-4 w-4 text-emerald-600" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-foreground truncate">
                                  {habit.name}
                                </p>
                                <p className="text-xs text-muted-foreground capitalize">
                                  {habit.frequency}
                                </p>
                              </div>
                            </div>

                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                haptics.tap()
                                setConfirmDeleteHabit({ id: habit.id, name: habit.name })
                              }}
                              disabled={isDeleting}
                              className="text-red-500 hover:text-red-600 hover:bg-red-50 shrink-0"
                            >
                              {isDeleting ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </Button>
                          </motion.div>
                        )
                      })}
                    </AnimatePresence>
                  </div>
                )}
              </motion.div>

              {/* Info Note */}
              <motion.div
                variants={itemVariants}
                className="flex items-start gap-3 p-4 bg-amber-50 rounded-xl border border-amber-200"
              >
                <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-amber-800">
                    <strong>Note:</strong> Deleting a habit removes it from tomorrow onwards.
                    Today's data and history are preserved.
                  </p>
                </div>
              </motion.div>
            </motion.div>
          </ScrollArea>
        </EnhancedDialogContent>
      </EnhancedDialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!confirmDeleteHabit}
        onOpenChange={(open) => !open && setConfirmDeleteHabit(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Habit</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{confirmDeleteHabit?.name}"? This habit will be
              removed starting tomorrow. Your history for this habit will be preserved.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => confirmDeleteHabit && handleDeleteHabit(confirmDeleteHabit.id)}
              className="bg-red-500 hover:bg-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

export default ManageHabitsModal
