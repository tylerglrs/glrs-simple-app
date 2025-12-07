import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { Heart, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

// =============================================================================
// TYPES
// =============================================================================

export interface GratitudeEntry {
  id: string
  text: string
  category?: string
}

export interface WordCloudWord {
  text: string
  count: number
  size: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  color: string
}

export interface GratitudeWordCloudProps {
  gratitudes: GratitudeEntry[]
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
      staggerChildren: 0.03,
      delayChildren: 0.2,
    },
  },
}

const wordVariants = {
  hidden: { opacity: 0, scale: 0.5 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      type: 'spring' as const,
      stiffness: 400,
      damping: 20,
    },
  },
}

// =============================================================================
// CONSTANTS
// =============================================================================

const STOP_WORDS = new Set([
  'a', 'an', 'the', 'and', 'or', 'but', 'is', 'are', 'was', 'were',
  'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did',
  'will', 'would', 'could', 'should', 'may', 'might', 'must',
  'i', 'me', 'my', 'we', 'our', 'you', 'your', 'he', 'she', 'it',
  'they', 'them', 'this', 'that', 'these', 'those', 'am', 'im',
  'to', 'for', 'of', 'with', 'at', 'by', 'from', 'in', 'on', 'so',
  'as', 'if', 'then', 'than', 'too', 'very', 'just', 'about', 'into',
  'today', 'grateful', 'thankful', 'appreciate', 'blessed', // Common gratitude words
])

const WORD_COLORS = [
  'text-violet-400',
  'text-cyan-400',
  'text-emerald-400',
  'text-amber-400',
  'text-rose-400',
  'text-indigo-400',
  'text-pink-400',
  'text-teal-400',
]

const SIZE_CLASSES = {
  xs: 'text-xs',
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base font-medium',
  xl: 'text-lg font-semibold',
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function extractWords(gratitudes: GratitudeEntry[]): Map<string, number> {
  const wordCounts = new Map<string, number>()

  gratitudes.forEach((gratitude) => {
    // Safety check: skip entries without valid text
    if (!gratitude.text || typeof gratitude.text !== 'string') {
      return
    }

    // Tokenize and clean text
    const words = gratitude.text
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter((word) => word.length > 2 && !STOP_WORDS.has(word))

    words.forEach((word) => {
      wordCounts.set(word, (wordCounts.get(word) || 0) + 1)
    })
  })

  return wordCounts
}

function getWordSize(count: number, maxCount: number): WordCloudWord['size'] {
  const ratio = count / maxCount
  if (ratio >= 0.8) return 'xl'
  if (ratio >= 0.6) return 'lg'
  if (ratio >= 0.4) return 'md'
  if (ratio >= 0.2) return 'sm'
  return 'xs'
}

function buildWordCloud(gratitudes: GratitudeEntry[]): WordCloudWord[] {
  const wordCounts = extractWords(gratitudes)

  // Sort by count and take top 30 words
  const sortedWords = Array.from(wordCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 30)

  if (sortedWords.length === 0) return []

  const maxCount = sortedWords[0][1]

  return sortedWords.map(([text, count], index) => ({
    text,
    count,
    size: getWordSize(count, maxCount),
    color: WORD_COLORS[index % WORD_COLORS.length],
  }))
}

// Shuffle array for random placement
function shuffle<T>(array: T[]): T[] {
  const arr = [...array]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

// =============================================================================
// EMPTY STATE
// =============================================================================

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <div className="p-3 rounded-full bg-slate-700/50 mb-3">
        <Heart className="h-6 w-6 text-slate-400" />
      </div>
      <p className="text-sm text-slate-400 mb-1">No gratitude entries yet</p>
      <p className="text-xs text-slate-500">
        Start logging what you're grateful for
      </p>
    </div>
  )
}

// =============================================================================
// PLACEHOLDER WORD CLOUD (when not enough data)
// =============================================================================

const PLACEHOLDER_WORDS: WordCloudWord[] = [
  { text: 'family', count: 10, size: 'xl', color: 'text-violet-400' },
  { text: 'health', count: 8, size: 'lg', color: 'text-emerald-400' },
  { text: 'friends', count: 7, size: 'lg', color: 'text-cyan-400' },
  { text: 'support', count: 6, size: 'md', color: 'text-amber-400' },
  { text: 'progress', count: 5, size: 'md', color: 'text-rose-400' },
  { text: 'recovery', count: 5, size: 'md', color: 'text-indigo-400' },
  { text: 'hope', count: 4, size: 'sm', color: 'text-pink-400' },
  { text: 'strength', count: 4, size: 'sm', color: 'text-teal-400' },
  { text: 'love', count: 3, size: 'sm', color: 'text-violet-400' },
  { text: 'peace', count: 3, size: 'sm', color: 'text-emerald-400' },
  { text: 'growth', count: 2, size: 'xs', color: 'text-cyan-400' },
  { text: 'clarity', count: 2, size: 'xs', color: 'text-amber-400' },
]

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function GratitudeWordCloud({
  gratitudes: gratitudesProp,
  className,
}: GratitudeWordCloudProps) {
  // Default to empty array if undefined to prevent crashes
  const gratitudes = gratitudesProp ?? []

  // Build word cloud from gratitude entries
  const words = useMemo(() => {
    const extracted = buildWordCloud(gratitudes)
    // If not enough data, show placeholder
    if (extracted.length < 5) return shuffle(PLACEHOLDER_WORDS)
    return shuffle(extracted)
  }, [gratitudes])

  const isPlaceholder = gratitudes.length < 5

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
          <div className="p-1.5 rounded-lg bg-rose-500/20">
            <Heart className="h-4 w-4 text-rose-400" />
          </div>
          <div>
            <span className="text-sm font-semibold text-white">Gratitude Themes</span>
            <span className="text-xs text-slate-400 block">
              {gratitudes.length} gratitude{gratitudes.length !== 1 ? 's' : ''} logged
            </span>
          </div>
        </div>

        {isPlaceholder && (
          <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-slate-700/50">
            <Sparkles className="h-3 w-3 text-slate-400" />
            <span className="text-xs text-slate-400">Sample data</span>
          </div>
        )}
      </div>

      {/* Word Cloud */}
      <div className="p-3 md:p-4">
        {gratitudes.length === 0 && !isPlaceholder ? (
          <EmptyState />
        ) : (
          <motion.div
            variants={containerVariants}
            className="flex flex-wrap items-center justify-center gap-2 min-h-[160px]"
          >
            {words.map((word, index) => (
              <motion.span
                key={`${word.text}-${index}`}
                variants={wordVariants}
                whileHover={{
                  scale: 1.15,
                  transition: { type: 'spring', stiffness: 400, damping: 10 },
                }}
                className={cn(
                  SIZE_CLASSES[word.size],
                  word.color,
                  'px-2 py-0.5 rounded-full cursor-default transition-all',
                  'hover:bg-white/10',
                  isPlaceholder && 'opacity-60'
                )}
              >
                {word.text}
              </motion.span>
            ))}
          </motion.div>
        )}
      </div>

      {/* Legend */}
      <div className="px-2 md:px-3 pb-2 md:pb-3 flex items-center justify-center gap-3 md:gap-4">
        <div className="flex items-center gap-1.5">
          <span className="text-lg font-semibold text-violet-400">Aa</span>
          <span className="text-xs text-slate-500">More frequent</span>
        </div>
        <div className="w-px h-3 bg-slate-700" />
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-cyan-400">Aa</span>
          <span className="text-xs text-slate-500">Less frequent</span>
        </div>
      </div>
    </motion.div>
  )
}

export default GratitudeWordCloud
