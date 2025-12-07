import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { Timestamp } from 'firebase/firestore'
import {
  BookHeart,
  Smile,
  Meh,
  Frown,
  Clock,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// =============================================================================
// TYPES
// =============================================================================

export interface ReflectionEntry {
  id: string
  text: string
  mood?: number // 1-10 scale
  createdAt: Date | Timestamp
}

export interface ReflectionTimelineProps {
  reflections: ReflectionEntry[]
  maxEntries?: number
  className?: string
}

// =============================================================================
// ANIMATION VARIANTS
// =============================================================================

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      type: 'spring' as const,
      stiffness: 400,
      damping: 25,
    },
  },
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function formatDate(date: Date | Timestamp): string {
  const d = date instanceof Timestamp ? date.toDate() : date
  const now = new Date()
  const diffDays = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`

  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function getMoodIcon(mood?: number) {
  if (!mood) return <Meh className="h-4 w-4 text-slate-400" />
  if (mood >= 7) return <Smile className="h-4 w-4 text-emerald-400" />
  if (mood >= 4) return <Meh className="h-4 w-4 text-amber-400" />
  return <Frown className="h-4 w-4 text-rose-400" />
}

function getMoodColor(mood?: number): string {
  if (!mood) return 'bg-slate-500/20 border-slate-500/30'
  if (mood >= 7) return 'bg-emerald-500/20 border-emerald-500/30'
  if (mood >= 4) return 'bg-amber-500/20 border-amber-500/30'
  return 'bg-rose-500/20 border-rose-500/30'
}

function getMoodLabel(mood?: number): string {
  if (!mood) return 'No mood'
  if (mood >= 8) return 'Great'
  if (mood >= 6) return 'Good'
  if (mood >= 4) return 'Okay'
  if (mood >= 2) return 'Low'
  return 'Struggling'
}

function truncateText(text: string | undefined | null, maxLength: number = 80): string {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength).trim() + '...'
}

// =============================================================================
// EMPTY STATE
// =============================================================================

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <div className="p-3 rounded-full bg-slate-700/50 mb-3">
        <BookHeart className="h-6 w-6 text-slate-400" />
      </div>
      <p className="text-sm text-slate-400 mb-1">No reflections yet</p>
      <p className="text-xs text-slate-500">
        Start journaling to see your reflection timeline
      </p>
    </div>
  )
}

// =============================================================================
// TIMELINE ENTRY COMPONENT
// =============================================================================

interface TimelineEntryProps {
  reflection: ReflectionEntry
  isLast: boolean
}

function TimelineEntry({ reflection, isLast }: TimelineEntryProps) {
  const date = reflection.createdAt instanceof Timestamp
    ? reflection.createdAt.toDate()
    : reflection.createdAt

  return (
    <motion.div variants={itemVariants} className="flex gap-3">
      {/* Timeline connector */}
      <div className="flex flex-col items-center">
        <motion.div
          whileHover={{ scale: 1.1 }}
          className={cn(
            'relative w-8 h-8 rounded-full flex items-center justify-center',
            'border',
            getMoodColor(reflection.mood)
          )}
        >
          {getMoodIcon(reflection.mood)}
          {/* Pulse animation for recent entries */}
          {formatDate(date) === 'Today' && (
            <motion.div
              animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
              className={cn(
                'absolute inset-0 rounded-full',
                getMoodColor(reflection.mood)
              )}
            />
          )}
        </motion.div>
        {!isLast && (
          <div className="w-0.5 flex-1 bg-gradient-to-b from-slate-600 to-transparent mt-2 min-h-[20px]" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 pb-4">
        {/* Date and mood label */}
        <div className="flex items-center gap-2 mb-1.5">
          <div className="flex items-center gap-1 text-xs text-slate-400">
            <Clock className="h-3 w-3" />
            <span>{formatDate(date)}</span>
          </div>
          {reflection.mood && (
            <span className={cn(
              'text-xs px-1.5 py-0.5 rounded-full',
              getMoodColor(reflection.mood)
            )}>
              {getMoodLabel(reflection.mood)}
            </span>
          )}
        </div>

        {/* Reflection text */}
        <div
          className={cn(
            'p-3 rounded-lg',
            'bg-slate-800/60 border border-slate-700/50'
          )}
        >
          <p className="text-sm text-slate-300 leading-relaxed">
            {truncateText(reflection.text, 150)}
          </p>
        </div>
      </div>
    </motion.div>
  )
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function ReflectionTimeline({
  reflections: reflectionsProp,
  maxEntries = 5,
  className,
}: ReflectionTimelineProps) {
  // Default to empty array if undefined to prevent crashes
  const reflections = reflectionsProp ?? []

  // Sort and limit reflections
  const sortedReflections = useMemo(() => {
    return [...reflections]
      .sort((a, b) => {
        const dateA = a.createdAt instanceof Timestamp ? a.createdAt.toDate() : a.createdAt
        const dateB = b.createdAt instanceof Timestamp ? b.createdAt.toDate() : b.createdAt
        return dateB.getTime() - dateA.getTime()
      })
      .slice(0, maxEntries)
  }, [reflections, maxEntries])

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={cn(
        'rounded-xl overflow-hidden',
        'bg-slate-800/60 border border-slate-700/50',
        'backdrop-blur-sm',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-2 md:p-3 border-b border-slate-700/50">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-violet-500/20">
            <BookHeart className="h-4 w-4 text-violet-400" />
          </div>
          <div>
            <span className="text-sm font-semibold text-white">Reflection Timeline</span>
            <span className="text-xs text-slate-400 block">
              {reflections.length} total entries
            </span>
          </div>
        </div>
      </div>

      {/* Timeline content */}
      <div className="p-2 md:p-3">
        {sortedReflections.length === 0 ? (
          <EmptyState />
        ) : (
          <motion.div variants={containerVariants}>
            {sortedReflections.map((reflection, index) => (
              <TimelineEntry
                key={reflection.id}
                reflection={reflection}
                isLast={index === sortedReflections.length - 1}
              />
            ))}
          </motion.div>
        )}
      </div>

    </motion.div>
  )
}

export default ReflectionTimeline
