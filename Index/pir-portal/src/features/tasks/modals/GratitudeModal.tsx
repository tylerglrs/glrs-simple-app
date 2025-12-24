import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  EnhancedDialog,
  EnhancedDialogContent,
} from '@/components/ui/enhanced-dialog'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Textarea } from '@/components/ui/textarea'
import {
  Heart,
  X,
  Loader2,
  Users,
  Sun,
  TrendingUp,
  Smile,
  Target,
  Shield,
  Award,
  LifeBuoy,
  Palette,
  Coffee,
  MoreHorizontal,
  CheckCircle,
  Sparkles,
  BookHeart,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { db, auth } from '@/lib/firebase'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { updateContextAfterGratitude } from '@/lib/updateAIContext'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { haptics, celebrate } from '@/lib/animations'
import { useModalStore } from '@/stores/modalStore'
import { Illustration } from '@/components/common/Illustration'
import { useStatusBarColor } from '@/hooks/useStatusBarColor'

// =============================================================================
// TYPES
// =============================================================================

export interface GratitudeModalProps {
  onClose: () => void
}

interface GratitudeTheme {
  id: string
  label: string
  icon: LucideIcon
  color: string
  bgColor: string
}

// =============================================================================
// GRATITUDE THEMES
// =============================================================================

const gratitudeThemes: GratitudeTheme[] = [
  { id: 'relationships', label: 'Relationships', icon: Users, color: 'text-red-600', bgColor: 'bg-red-100 border-red-200' },
  { id: 'health', label: 'Health', icon: Heart, color: 'text-teal-600', bgColor: 'bg-teal-100 border-teal-200' },
  { id: 'nature', label: 'Nature', icon: Sun, color: 'text-green-600', bgColor: 'bg-green-100 border-green-200' },
  { id: 'personal', label: 'Growth', icon: TrendingUp, color: 'text-pink-600', bgColor: 'bg-pink-100 border-pink-200' },
  { id: 'moments', label: 'Moments', icon: Smile, color: 'text-yellow-600', bgColor: 'bg-yellow-100 border-yellow-200' },
  { id: 'opportunities', label: 'Opportunity', icon: Target, color: 'text-emerald-600', bgColor: 'bg-emerald-100 border-emerald-200' },
  { id: 'comfort', label: 'Comfort', icon: Shield, color: 'text-blue-600', bgColor: 'bg-blue-100 border-blue-200' },
  { id: 'accomplishments', label: 'Wins', icon: Award, color: 'text-purple-600', bgColor: 'bg-purple-100 border-purple-200' },
  { id: 'support', label: 'Support', icon: LifeBuoy, color: 'text-orange-600', bgColor: 'bg-orange-100 border-orange-200' },
  { id: 'creativity', label: 'Creativity', icon: Palette, color: 'text-rose-600', bgColor: 'bg-rose-100 border-rose-200' },
  { id: 'simple', label: 'Simple Joy', icon: Coffee, color: 'text-amber-600', bgColor: 'bg-amber-100 border-amber-200' },
  { id: 'other', label: 'Other', icon: MoreHorizontal, color: 'text-gray-600', bgColor: 'bg-gray-100 border-gray-200' },
]

// =============================================================================
// ANIMATION VARIANTS
// =============================================================================

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.04,
      delayChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 15, scale: 0.95 },
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
// COMPONENT
// =============================================================================

export function GratitudeModal({ onClose }: GratitudeModalProps) {
  const isMobile = useMediaQuery('(max-width: 768px)')
  const { openModal } = useModalStore()

  // Set iOS status bar to match modal header color (pink-500)
  useStatusBarColor('#EC4899', true)
  const [selectedTheme, setSelectedTheme] = useState<string | null>(null)
  const [gratitudeText, setGratitudeText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async () => {
    if (!gratitudeText.trim() || submitting) return

    const userId = auth.currentUser?.uid
    if (!userId) return

    setSubmitting(true)
    haptics.tap()

    try {
      await addDoc(collection(db, 'gratitudes'), {
        userId,
        text: gratitudeText.trim(),
        theme: selectedTheme,
        createdAt: serverTimestamp(),
      })

      // Update AI context
      await updateContextAfterGratitude(userId)

      setSubmitted(true)
      haptics.success()
      celebrate() // Confetti celebration
    } catch (error) {
      console.error('Error saving gratitude:', error)
      haptics.error()
    } finally {
      setSubmitting(false)
    }
  }

  const handleViewJournal = () => {
    onClose()
    setTimeout(() => {
      openModal('gratitudeJournal')
    }, 100)
  }

  const selectedThemeData = gratitudeThemes.find(t => t.id === selectedTheme)

  // Success state
  if (submitted) {
    return (
      <EnhancedDialog open onOpenChange={onClose}>
        <EnhancedDialogContent
          variant={isMobile ? 'fullscreen' : 'bottom-sheet'}
          showCloseButton={false}
          className="p-0"
        >
          <div className="flex flex-col items-center justify-center h-full min-h-[400px] p-6 bg-gradient-to-b from-pink-50 to-rose-50">
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 260, damping: 20 }}
              className="mb-4"
            >
              <Illustration name="gratitude" size="lg" className="opacity-90" />
            </motion.div>
            <motion.h3
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl font-semibold text-foreground mb-2"
            >
              Gratitude Saved!
            </motion.h3>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-sm text-muted-foreground text-center mb-6 max-w-xs"
            >
              Taking time to appreciate the good things in life supports your recovery journey.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex gap-3"
            >
              <Button
                variant="outline"
                onClick={handleViewJournal}
                className="border-pink-200 text-pink-700 hover:bg-pink-50"
              >
                <BookHeart className="h-4 w-4 mr-2" />
                View Journal
              </Button>
              <Button
                onClick={onClose}
                className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600"
              >
                Done
              </Button>
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
          className="relative bg-gradient-to-br from-pink-500 via-rose-500 to-red-400 p-6 overflow-hidden"
        >
          {/* Decorative illustration */}
          <div className="absolute right-0 top-1/2 -translate-y-1/2 opacity-15 pointer-events-none">
            <Illustration name="journal" size="md" />
          </div>

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

          {/* Title */}
          <div className="flex items-center gap-3 relative z-10">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 15, delay: 0.2 }}
              className="p-3 rounded-xl bg-white/20 backdrop-blur-sm"
            >
              <Heart className="h-7 w-7 text-white" />
            </motion.div>
            <div>
              <h2 className="text-xl font-bold text-white">Gratitude Entry</h2>
              <p className="text-white/80 text-sm">What are you grateful for today?</p>
            </div>
          </div>
        </motion.div>

        {/* Content */}
        <ScrollArea className="flex-1">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="p-4 space-y-5 md:p-5"
          >
            {/* Theme Selection */}
            <motion.div variants={itemVariants}>
              <label className="text-sm font-medium text-foreground mb-3 block">
                Choose a theme (optional)
              </label>
              <div className="grid grid-cols-4 gap-2">
                {gratitudeThemes.map((theme) => {
                  const Icon = theme.icon
                  const isSelected = selectedTheme === theme.id

                  return (
                    <motion.button
                      key={theme.id}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        haptics.tap()
                        setSelectedTheme(isSelected ? null : theme.id)
                      }}
                      className={cn(
                        'flex flex-col items-center gap-1 p-2 md:p-3 rounded-lg border transition-all',
                        isSelected
                          ? `${theme.bgColor} ring-2 ring-offset-1 ring-pink-400`
                          : 'bg-gray-50 hover:bg-gray-100 border-gray-200'
                      )}
                    >
                      <Icon className={cn('h-5 w-5', isSelected ? theme.color : 'text-gray-500')} />
                      <span className={cn(
                        'text-[10px] md:text-xs font-medium text-center leading-tight',
                        isSelected ? theme.color : 'text-gray-600'
                      )}>
                        {theme.label}
                      </span>
                    </motion.button>
                  )
                })}
              </div>
            </motion.div>

            {/* Gratitude Text */}
            <motion.div variants={itemVariants}>
              <label className="text-sm font-medium text-foreground mb-2 block">
                {selectedThemeData
                  ? `I'm grateful for (${selectedThemeData.label})...`
                  : "I'm grateful for..."}
              </label>
              <Textarea
                value={gratitudeText}
                onChange={(e) => setGratitudeText(e.target.value)}
                placeholder="Write what you're grateful for today..."
                className="min-h-[140px] text-base border-2 focus:border-pink-300"
              />
            </motion.div>

            {/* Inspiration */}
            <motion.div
              variants={itemVariants}
              className="bg-gradient-to-r from-pink-50 to-rose-50 rounded-xl p-4 border-2 border-pink-200"
            >
              <div className="flex items-start gap-2">
                <Sparkles className="h-5 w-5 text-pink-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-pink-800 text-sm mb-2">
                    Need inspiration?
                  </h4>
                  <ul className="text-xs text-pink-700 space-y-1.5">
                    <li className="flex items-center gap-1.5">
                      <div className="w-1 h-1 rounded-full bg-pink-400" />
                      Something that made you smile today
                    </li>
                    <li className="flex items-center gap-1.5">
                      <div className="w-1 h-1 rounded-full bg-pink-400" />
                      A person who supported you
                    </li>
                    <li className="flex items-center gap-1.5">
                      <div className="w-1 h-1 rounded-full bg-pink-400" />
                      Progress you've made in recovery
                    </li>
                    <li className="flex items-center gap-1.5">
                      <div className="w-1 h-1 rounded-full bg-pink-400" />
                      A simple comfort you enjoyed
                    </li>
                  </ul>
                </div>
              </div>
            </motion.div>

            {/* Submit Button */}
            <motion.div variants={itemVariants}>
              <Button
                onClick={handleSubmit}
                disabled={!gratitudeText.trim() || submitting}
                className="w-full py-6 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-lg font-semibold"
              >
                {submitting ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    <Heart className="h-5 w-5 mr-2" />
                    Save Gratitude
                  </>
                )}
              </Button>
            </motion.div>

            {/* View Journal Link */}
            <motion.div variants={itemVariants} className="text-center">
              <button
                onClick={handleViewJournal}
                className="text-sm text-pink-600 hover:text-pink-700 font-medium"
              >
                View Gratitude Journal
              </button>
            </motion.div>
          </motion.div>
        </ScrollArea>
      </EnhancedDialogContent>
    </EnhancedDialog>
  )
}

export default GratitudeModal
