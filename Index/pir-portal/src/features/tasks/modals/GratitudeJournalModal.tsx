import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  EnhancedDialog,
  EnhancedDialogContent,
} from '@/components/ui/enhanced-dialog'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  BookHeart,
  X,
  Loader2,
  Heart,
  Moon,
  Calendar,
  Plus,
  Sparkles,
  Filter,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { db, auth } from '@/lib/firebase'
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  Timestamp,
} from 'firebase/firestore'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { haptics } from '@/lib/animations'
import { useModalStore } from '@/stores/modalStore'

// =============================================================================
// TYPES
// =============================================================================

export interface GratitudeJournalModalProps {
  onClose: () => void
}

interface GratitudeEntry {
  id: string
  text: string
  theme?: string
  source: 'entry' | 'reflection'
  createdAt: Date
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
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring' as const,
      stiffness: 400,
      damping: 25,
    },
  },
}

const pulseAnimation = {
  scale: [1, 1.05, 1],
  transition: {
    duration: 2,
    repeat: Infinity,
    ease: 'easeInOut' as const,
  },
}

// =============================================================================
// HELPERS
// =============================================================================

function formatDate(date: Date): string {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  const entryDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())

  if (entryDate.getTime() === today.getTime()) {
    return 'Today'
  } else if (entryDate.getTime() === yesterday.getTime()) {
    return 'Yesterday'
  } else {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    })
  }
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

// Group entries by date
function groupByDate(entries: GratitudeEntry[]): Map<string, GratitudeEntry[]> {
  const groups = new Map<string, GratitudeEntry[]>()

  for (const entry of entries) {
    const dateKey = entry.createdAt.toDateString()
    const existing = groups.get(dateKey) || []
    existing.push(entry)
    groups.set(dateKey, existing)
  }

  return groups
}

// =============================================================================
// COMPONENT
// =============================================================================

export function GratitudeJournalModal({ onClose }: GratitudeJournalModalProps) {
  const isMobile = useMediaQuery('(max-width: 768px)')
  const { openModal } = useModalStore()
  const [entries, setEntries] = useState<GratitudeEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'entry' | 'reflection'>('all')

  // Fetch gratitudes from both sources
  useEffect(() => {
    const userId = auth.currentUser?.uid
    if (!userId) {
      setLoading(false)
      return
    }

    const allEntries: GratitudeEntry[] = []
    let gratitudesLoaded = false
    let checkInsLoaded = false

    const checkComplete = () => {
      if (gratitudesLoaded && checkInsLoaded) {
        // Sort all entries by date, most recent first
        allEntries.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        setEntries([...allEntries])
        setLoading(false)
      }
    }

    // Query 1: Direct gratitude entries
    const gratitudesQuery = query(
      collection(db, 'gratitudes'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    )

    const unsubGratitudes = onSnapshot(
      gratitudesQuery,
      (snapshot) => {
        // Remove old gratitude entries
        const filtered = allEntries.filter((e) => e.source !== 'entry')
        allEntries.length = 0
        allEntries.push(...filtered)

        // Add new ones
        snapshot.docs.forEach((doc) => {
          const data = doc.data()
          if (data.text) {
            allEntries.push({
              id: doc.id,
              text: data.text,
              theme: data.theme,
              source: 'entry',
              createdAt: data.createdAt?.toDate?.() || new Date(),
            })
          }
        })

        gratitudesLoaded = true
        checkComplete()
      },
      (err) => {
        console.error('Error loading gratitudes:', err)
        gratitudesLoaded = true
        checkComplete()
      }
    )

    // Query 2: Evening reflections with gratitude
    const checkInsQuery = query(
      collection(db, 'checkIns'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    )

    const unsubCheckIns = onSnapshot(
      checkInsQuery,
      (snapshot) => {
        // Remove old reflection entries
        const filtered = allEntries.filter((e) => e.source !== 'reflection')
        allEntries.length = 0
        allEntries.push(...filtered)

        // Add new ones that have gratitude
        snapshot.docs.forEach((doc) => {
          const data = doc.data()
          const gratitudeText = data.eveningData?.gratitude
          if (gratitudeText && gratitudeText.trim()) {
            allEntries.push({
              id: `reflection-${doc.id}`,
              text: gratitudeText,
              source: 'reflection',
              createdAt: data.createdAt?.toDate?.() || new Date(),
            })
          }
        })

        checkInsLoaded = true
        checkComplete()
      },
      (err) => {
        console.error('Error loading check-ins:', err)
        checkInsLoaded = true
        checkComplete()
      }
    )

    return () => {
      unsubGratitudes()
      unsubCheckIns()
    }
  }, [])

  // Filter entries
  const filteredEntries = useMemo(() => {
    if (filter === 'all') return entries
    return entries.filter((e) => e.source === filter)
  }, [entries, filter])

  // Group by date
  const groupedEntries = useMemo(() => {
    return groupByDate(filteredEntries)
  }, [filteredEntries])

  const handleAddNew = () => {
    onClose()
    setTimeout(() => {
      openModal('gratitude')
    }, 100)
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
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              >
                <BookHeart className="h-10 w-10 text-pink-500" />
              </motion.div>
              <p className="text-sm text-muted-foreground">Loading journal...</p>
            </motion.div>
          </div>
        </EnhancedDialogContent>
      </EnhancedDialog>
    )
  }

  return (
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
          className="relative bg-gradient-to-br from-rose-500 via-pink-500 to-fuchsia-500 p-6"
        >
          {/* Decorative elements */}
          <motion.div
            animate={pulseAnimation}
            className="absolute top-4 right-12 w-8 h-8 rounded-full bg-white/10"
          />
          <div className="absolute bottom-4 left-8 w-6 h-6 rounded-full bg-white/5" />

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

          {/* Title and stats */}
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-3">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 15, delay: 0.2 }}
                className="p-3 rounded-xl bg-white/20 backdrop-blur-sm"
              >
                <BookHeart className="h-7 w-7 text-white" />
              </motion.div>
              <div>
                <h2 className="text-xl font-bold text-white">Gratitude Journal</h2>
                <p className="text-white/80 text-sm">Your moments of appreciation</p>
              </div>
            </div>

            {/* Entry count */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3 }}
              className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2 text-center"
            >
              <span className="text-2xl font-bold text-white">{entries.length}</span>
              <p className="text-xs text-white/80">entries</p>
            </motion.div>
          </div>
        </motion.div>

        {/* Filter Tabs */}
        <div className="px-4 py-3 bg-gray-50 border-b flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-400" />
          <div className="flex gap-1">
            {[
              { key: 'all' as const, label: 'All' },
              { key: 'entry' as const, label: 'Entries', icon: Heart },
              { key: 'reflection' as const, label: 'Reflections', icon: Moon },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => {
                  haptics.tap()
                  setFilter(tab.key)
                }}
                className={cn(
                  'px-3 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1',
                  filter === tab.key
                    ? 'bg-pink-500 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                )}
              >
                {tab.icon && <tab.icon className="h-3 w-3" />}
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <ScrollArea className="flex-1">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="p-4 space-y-4 md:p-5"
          >
            {/* Add New Button */}
            <motion.div variants={itemVariants}>
              <Button
                onClick={handleAddNew}
                variant="outline"
                className="w-full py-5 border-2 border-dashed border-pink-300 hover:border-pink-400 hover:bg-pink-50 transition-all"
              >
                <Plus className="h-5 w-5 mr-2 text-pink-600" />
                <span className="font-medium text-pink-700">Add New Gratitude</span>
              </Button>
            </motion.div>

            {/* Entries */}
            {filteredEntries.length === 0 ? (
              <motion.div
                variants={itemVariants}
                className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200"
              >
                <motion.div animate={pulseAnimation}>
                  <Sparkles className="h-14 w-14 mx-auto text-gray-300 mb-3" />
                </motion.div>
                <h3 className="font-semibold text-foreground mb-1">No Gratitudes Yet</h3>
                <p className="text-sm text-muted-foreground px-4 mb-4">
                  {filter === 'all'
                    ? 'Start capturing moments of gratitude to build your journal.'
                    : filter === 'entry'
                    ? 'No direct gratitude entries yet. Add one above!'
                    : 'Complete an Evening Reflection to add gratitude here.'}
                </p>
                <Button
                  onClick={handleAddNew}
                  className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Gratitude
                </Button>
              </motion.div>
            ) : (
              <div className="space-y-6">
                {Array.from(groupedEntries.entries()).map(([dateKey, dateEntries]) => (
                  <motion.div key={dateKey} variants={itemVariants}>
                    {/* Date Header */}
                    <div className="flex items-center gap-2 mb-3">
                      <Calendar className="h-4 w-4 text-pink-500" />
                      <span className="text-sm font-semibold text-foreground">
                        {formatDate(dateEntries[0].createdAt)}
                      </span>
                      <div className="flex-1 h-px bg-gray-200" />
                      <span className="text-xs text-muted-foreground">
                        {dateEntries.length} {dateEntries.length === 1 ? 'entry' : 'entries'}
                      </span>
                    </div>

                    {/* Entries for this date */}
                    <div className="space-y-2">
                      <AnimatePresence>
                        {dateEntries.map((entry, index) => (
                          <motion.div
                            key={entry.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className={cn(
                              'p-4 rounded-xl border-2 transition-all',
                              entry.source === 'entry'
                                ? 'bg-gradient-to-r from-pink-50 to-rose-50 border-pink-200'
                                : 'bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200'
                            )}
                          >
                            {/* Source indicator */}
                            <div className="flex items-center gap-2 mb-2">
                              {entry.source === 'entry' ? (
                                <>
                                  <Heart className="h-3.5 w-3.5 text-pink-500" />
                                  <span className="text-xs font-medium text-pink-600">
                                    Gratitude Entry
                                  </span>
                                </>
                              ) : (
                                <>
                                  <Moon className="h-3.5 w-3.5 text-indigo-500" />
                                  <span className="text-xs font-medium text-indigo-600">
                                    Evening Reflection
                                  </span>
                                </>
                              )}
                              <span className="text-xs text-muted-foreground ml-auto">
                                {formatTime(entry.createdAt)}
                              </span>
                            </div>

                            {/* Gratitude text */}
                            <p
                              className={cn(
                                'text-sm leading-relaxed',
                                entry.source === 'entry'
                                  ? 'text-pink-900'
                                  : 'text-indigo-900'
                              )}
                            >
                              {entry.text}
                            </p>

                            {/* Theme badge if present */}
                            {entry.theme && (
                              <div className="mt-2">
                                <span className="inline-block text-xs bg-white/60 px-2 py-0.5 rounded-full text-pink-700 font-medium capitalize">
                                  {entry.theme}
                                </span>
                              </div>
                            )}
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Bottom padding */}
            <div className="h-4" />
          </motion.div>
        </ScrollArea>
      </EnhancedDialogContent>
    </EnhancedDialog>
  )
}

export default GratitudeJournalModal
