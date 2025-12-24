import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  EnhancedDialog,
  EnhancedDialogContent,
} from '@/components/ui/enhanced-dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Wind,
  X,
  Calendar,
  CheckCircle,
  Heart,
  Sparkles,
  Award,
  Compass,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { db, auth } from '@/lib/firebase'
import { collection, query, where, orderBy, onSnapshot, Timestamp } from 'firebase/firestore'
import { haptics } from '@/lib/animations'
import { useStatusBarColor } from '@/hooks/useStatusBarColor'

// =============================================================================
// TYPES
// =============================================================================

export interface CopingHistoryModalProps {
  onClose: () => void
}

interface CopingEntry {
  id: string
  technique: string
  category: string
  helpful: boolean
  notes?: string
  createdAt: Timestamp | Date
}

// =============================================================================
// ANIMATION VARIANTS
// =============================================================================

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
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

const statCardVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: (i: number) => ({
    opacity: 1,
    scale: 1,
    transition: {
      delay: i * 0.1,
      type: 'spring' as const,
      stiffness: 400,
      damping: 20,
    },
  }),
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

const formatDate = (date: Timestamp | Date): string => {
  const d = date instanceof Timestamp ? date.toDate() : new Date(date)
  return d.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
}

// Category colors with gradients
const categoryStyles: Record<string, { bg: string; text: string; gradient: string }> = {
  Breathing: {
    bg: 'bg-blue-100',
    text: 'text-blue-700',
    gradient: 'from-blue-400 to-cyan-400',
  },
  Grounding: {
    bg: 'bg-green-100',
    text: 'text-green-700',
    gradient: 'from-green-400 to-emerald-400',
  },
  CBT: {
    bg: 'bg-purple-100',
    text: 'text-purple-700',
    gradient: 'from-purple-400 to-violet-400',
  },
  DBT: {
    bg: 'bg-orange-100',
    text: 'text-orange-700',
    gradient: 'from-orange-400 to-amber-400',
  },
  Mindfulness: {
    bg: 'bg-teal-100',
    text: 'text-teal-700',
    gradient: 'from-teal-400 to-cyan-400',
  },
  'Anger Management': {
    bg: 'bg-red-100',
    text: 'text-red-700',
    gradient: 'from-red-400 to-rose-400',
  },
  Anxiety: {
    bg: 'bg-indigo-100',
    text: 'text-indigo-700',
    gradient: 'from-indigo-400 to-purple-400',
  },
}

// =============================================================================
// ANIMATED STAT CARD
// =============================================================================

interface StatCardProps {
  icon: typeof Wind
  value: string | number
  label: string
  gradient: string
  index: number
}

function StatCard({ icon: Icon, value, label, gradient, index }: StatCardProps) {
  return (
    <motion.div
      custom={index}
      variants={statCardVariants}
      initial="hidden"
      animate="visible"
      whileHover={{ scale: 1.05, y: -2 }}
      className={cn(
        'relative overflow-hidden rounded-xl p-4 text-white shadow-lg',
        `bg-gradient-to-br ${gradient}`
      )}
    >
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-16 h-16 rounded-full bg-white/10 -translate-y-1/2 translate-x-1/2" />

      <div className="relative z-10 text-center">
        <motion.div animate={pulseAnimation} className="mb-1">
          <Icon className="h-5 w-5 mx-auto opacity-90" />
        </motion.div>
        <motion.p
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 + index * 0.1, type: 'spring' as const }}
          className="text-2xl font-bold"
        >
          {value}
        </motion.p>
        <p className="text-xs opacity-90">{label}</p>
      </div>
    </motion.div>
  )
}

// =============================================================================
// COMPONENT
// =============================================================================

export function CopingHistoryModal({ onClose }: CopingHistoryModalProps) {
  const isMobile = useMediaQuery('(max-width: 768px)')

  // Set iOS status bar to match modal header color (teal-500)
  useStatusBarColor('#14B8A6', true)

  const [entries, setEntries] = useState<CopingEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState<'week' | 'month' | 'all'>('week')

  useEffect(() => {
    const userId = auth.currentUser?.uid
    if (!userId) {
      setLoading(false)
      return
    }

    const now = new Date()
    let startDate: Date

    if (period === 'week') {
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    } else if (period === 'month') {
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    } else {
      startDate = new Date(0)
    }

    const q = query(
      collection(db, 'copingHistory'),
      where('userId', '==', userId),
      where('createdAt', '>=', Timestamp.fromDate(startDate)),
      orderBy('createdAt', 'desc')
    )

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as CopingEntry[]
        setEntries(data)
        setLoading(false)
      },
      (error) => {
        console.error('Error loading coping history:', error)
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [period])

  // Calculate stats
  const totalUsed = entries.length
  const helpfulCount = entries.filter((e) => e.helpful).length
  const helpfulRate = totalUsed > 0 ? Math.round((helpfulCount / totalUsed) * 100) : 0

  // Group by category
  const categoryStats = entries.reduce(
    (acc, entry) => {
      acc[entry.category] = (acc[entry.category] || 0) + 1
      return acc
    },
    {} as Record<string, number>
  )

  const topCategory = Object.entries(categoryStats).sort((a, b) => b[1] - a[1])[0]

  // Loading state
  if (loading) {
    return (
      <EnhancedDialog open onOpenChange={onClose}>
        <EnhancedDialogContent
          variant={isMobile ? 'fullscreen' : 'centered-large'}
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
                <Wind className="h-10 w-10 text-teal-500" />
              </motion.div>
              <p className="text-sm text-muted-foreground">Loading history...</p>
            </motion.div>
          </div>
        </EnhancedDialogContent>
      </EnhancedDialog>
    )
  }

  return (
    <EnhancedDialog open onOpenChange={onClose}>
      <EnhancedDialogContent
        variant={isMobile ? 'fullscreen' : 'centered-large'}
        showCloseButton={false}
        className="p-0 flex flex-col"
      >
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative bg-gradient-to-br from-teal-500 via-cyan-500 to-blue-500 p-6"
        >
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-white/10 -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full bg-white/5 translate-y-1/2 -translate-x-1/2" />

          {/* Animated wind particles */}
          <motion.div
            className="absolute top-1/2 left-4 w-2 h-2 rounded-full bg-white/30"
            animate={{ x: [0, 100, 200], opacity: [0, 1, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          />
          <motion.div
            className="absolute top-1/3 left-8 w-1.5 h-1.5 rounded-full bg-white/20"
            animate={{ x: [0, 80, 160], opacity: [0, 1, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'linear', delay: 0.5 }}
          />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors z-10"
          >
            <X className="h-5 w-5 text-white" />
          </button>

          {/* Title */}
          <div className="flex items-center gap-3 relative z-10">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="p-3 rounded-xl bg-white/20 backdrop-blur-sm"
            >
              <Compass className="h-7 w-7 text-white" />
            </motion.div>
            <div>
              <h2 className="text-xl font-bold text-white">Coping History</h2>
              <p className="text-white/80 text-sm">Track your wellness journey</p>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="px-5 -mt-4 relative z-20">
          <div className="grid grid-cols-3 gap-3">
            <StatCard
              icon={Wind}
              value={totalUsed}
              label="Used"
              gradient="from-teal-500 to-cyan-500"
              index={0}
            />
            <StatCard
              icon={Heart}
              value={`${helpfulRate}%`}
              label="Helpful"
              gradient="from-green-500 to-emerald-500"
              index={1}
            />
            <StatCard
              icon={Award}
              value={topCategory ? topCategory[0].substring(0, 8) : '-'}
              label="Top Type"
              gradient="from-purple-500 to-violet-500"
              index={2}
            />
          </div>
        </div>

        {/* Content */}
        <div className="p-4 pt-3 flex-1 flex flex-col md:p-5 md:pt-4">
          {/* Period Tabs */}
          <Tabs
            defaultValue="week"
            className="w-full flex-1 flex flex-col"
            onValueChange={(v) => {
              haptics.tap()
              setPeriod(v as 'week' | 'month' | 'all')
            }}
          >
            <TabsList className="grid w-full grid-cols-3 mb-4">
              <TabsTrigger value="week">This Week</TabsTrigger>
              <TabsTrigger value="month">This Month</TabsTrigger>
              <TabsTrigger value="all">All Time</TabsTrigger>
            </TabsList>

            <ScrollArea className="flex-1 h-[40vh]">
              <AnimatePresence mode="wait">
                <TabsContent value="week" className="mt-0">
                  <HistoryList entries={entries} />
                </TabsContent>
                <TabsContent value="month" className="mt-0">
                  <HistoryList entries={entries} />
                </TabsContent>
                <TabsContent value="all" className="mt-0">
                  <HistoryList entries={entries} />
                </TabsContent>
              </AnimatePresence>
            </ScrollArea>
          </Tabs>
        </div>
      </EnhancedDialogContent>
    </EnhancedDialog>
  )
}

// =============================================================================
// SUB-COMPONENTS
// =============================================================================

interface HistoryListProps {
  entries: CopingEntry[]
}

function HistoryList({ entries }: HistoryListProps) {
  if (entries.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-10"
      >
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <Sparkles className="h-12 w-12 mx-auto text-gray-300 mb-3" />
        </motion.div>
        <h3 className="font-semibold text-foreground mb-1">No History Yet</h3>
        <p className="text-sm text-muted-foreground">
          Start practicing coping techniques to track your progress.
        </p>
      </motion.div>
    )
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-3"
    >
      {entries.map((entry) => (
        <motion.div
          key={entry.id}
          variants={itemVariants}
          whileHover={{ scale: 1.01, x: 4 }}
          className={cn(
            'p-4 rounded-xl border-2 transition-all cursor-pointer',
            entry.helpful
              ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 hover:border-green-300'
              : 'bg-gradient-to-r from-gray-50 to-slate-50 border-gray-200 hover:border-gray-300'
          )}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <div
                  className={cn(
                    'p-1.5 rounded-lg',
                    entry.helpful ? 'bg-green-100' : 'bg-gray-100'
                  )}
                >
                  <Wind
                    className={cn(
                      'h-4 w-4',
                      entry.helpful ? 'text-green-500' : 'text-gray-500'
                    )}
                  />
                </div>
                <span className="font-semibold text-foreground">{entry.technique}</span>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className={cn(
                    'text-xs px-2.5 py-1 rounded-full font-medium',
                    categoryStyles[entry.category]?.bg || 'bg-gray-100',
                    categoryStyles[entry.category]?.text || 'text-gray-700'
                  )}
                >
                  {entry.category}
                </span>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  {formatDate(entry.createdAt)}
                </div>
              </div>
              {entry.notes && (
                <p className="text-sm text-muted-foreground mt-2 italic">"{entry.notes}"</p>
              )}
            </div>
            <div className="flex-shrink-0">
              {entry.helpful ? (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring' as const, stiffness: 400 }}
                  className="flex items-center gap-1 bg-green-100 text-green-600 px-2 py-1 rounded-full"
                >
                  <Heart className="h-3.5 w-3.5 fill-current" />
                  <span className="text-xs font-medium">Helpful</span>
                </motion.div>
              ) : (
                <div className="flex items-center gap-1 bg-gray-100 text-gray-500 px-2 py-1 rounded-full">
                  <CheckCircle className="h-3.5 w-3.5" />
                  <span className="text-xs font-medium">Used</span>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  )
}

export default CopingHistoryModal
