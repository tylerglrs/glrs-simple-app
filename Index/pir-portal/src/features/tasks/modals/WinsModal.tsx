import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  EnhancedDialog,
  EnhancedDialogContent,
} from '@/components/ui/enhanced-dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Star,
  Share2,
  X,
  Loader2,
  History,
  Plus,
  Sparkles,
  Trophy,
  PartyPopper,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { useModalStore } from '@/stores/modalStore'
import { Illustration } from '@/components/common/Illustration'
import { useWins, formatDateTime } from '../hooks/useTasksModalData'
import { haptics, celebrate } from '@/lib/animations'

// =============================================================================
// TYPES
// =============================================================================

export interface WinsModalProps {
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
      staggerChildren: 0.08,
      delayChildren: 0.15,
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

const winCardVariants = {
  hidden: { opacity: 0, x: -20, scale: 0.9 },
  visible: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: {
      type: 'spring' as const,
      stiffness: 300,
      damping: 20,
    },
  },
  exit: {
    opacity: 0,
    x: 20,
    scale: 0.9,
    transition: { duration: 0.2 },
  },
}

const starBurstAnimation = {
  scale: [1, 1.3, 1],
  rotate: [0, 15, -15, 0],
  transition: {
    duration: 0.6,
    times: [0, 0.3, 0.7, 1],
    ease: 'easeOut' as const,
  },
}

const celebrationParticles = {
  initial: { scale: 0, opacity: 0 },
  animate: {
    scale: [0, 1.5, 0],
    opacity: [0, 1, 0],
    y: [0, -30],
    transition: {
      duration: 0.8,
      ease: 'easeOut' as const,
    },
  },
}

// =============================================================================
// COMPONENT
// =============================================================================

export function WinsModal({ onClose }: WinsModalProps) {
  const isMobile = useMediaQuery('(max-width: 768px)')
  const { wins, loading, addWin } = useWins()
  const { openModal } = useModalStore()


  const [newWin, setNewWin] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [showCelebration, setShowCelebration] = useState(false)

  const handleAddWin = async (shareToCommunity = false) => {
    if (!newWin.trim() || submitting) return

    haptics.success()
    setSubmitting(true)
    const success = await addWin(newWin.trim(), shareToCommunity)
    setSubmitting(false)

    if (success) {
      setNewWin('')
      celebrate() // Confetti celebration
      setShowCelebration(true)
      setTimeout(() => setShowCelebration(false), 1000)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleAddWin(false)
    }
  }

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
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' as const }}
              >
                <Star className="h-10 w-10 text-orange-500" />
              </motion.div>
              <p className="text-sm text-muted-foreground">Loading wins...</p>
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
        className="p-0 flex flex-col overflow-hidden"
      >
        {/* Celebration Overlay */}
        <AnimatePresence>
          {showCelebration && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none"
            >
              <motion.div {...celebrationParticles}>
                <PartyPopper className="h-16 w-16 text-orange-500" />
              </motion.div>
              {/* Star particles */}
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{
                    opacity: [0, 1, 0],
                    scale: [0, 1, 0],
                    x: Math.cos((i / 6) * Math.PI * 2) * 60,
                    y: Math.sin((i / 6) * Math.PI * 2) * 60,
                  }}
                  transition={{ duration: 0.6, delay: i * 0.05 }}
                  className="absolute"
                >
                  <Sparkles className="h-6 w-6 text-yellow-500" />
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative bg-gradient-to-br from-orange-500 via-amber-500 to-yellow-500 p-6"
        >
          {/* Decorative stars */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' as const }}
            className="absolute top-4 right-12 opacity-30"
          >
            <Star className="h-8 w-8 text-white fill-white" />
          </motion.div>
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 15, repeat: Infinity, ease: 'linear' as const }}
            className="absolute bottom-4 left-8 opacity-20"
          >
            <Star className="h-6 w-6 text-white fill-white" />
          </motion.div>

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
              <Trophy className="h-7 w-7 text-white" />
            </motion.div>
            <div>
              <h2 className="text-xl font-bold text-white">Today's Wins</h2>
              <p className="text-white/80 text-sm">Celebrate your victories!</p>
            </div>
          </div>
        </motion.div>

        {/* Content */}
        <ScrollArea className="flex-1">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="p-4 space-y-4 md:p-5 md:space-y-5"
          >
            {/* Add Win Input */}
            <motion.div
              variants={itemVariants}
              className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-xl p-4 border-2 border-orange-200"
            >
              <label className="text-sm font-semibold text-orange-800 mb-2 block">
                Add a win for today
              </label>
              <Input
                value={newWin}
                onChange={(e) => setNewWin(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="e.g., Completed my morning workout"
                disabled={submitting}
                className="text-base mb-3 border-orange-200 focus:border-orange-400 focus:ring-orange-400"
              />
              <div className="flex gap-2">
                <Button
                  onClick={() => handleAddWin(false)}
                  disabled={!newWin.trim() || submitting}
                  className="flex-1 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 shadow-lg shadow-orange-500/20"
                >
                  {submitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Win
                    </>
                  )}
                </Button>
                <Button
                  onClick={() => handleAddWin(true)}
                  disabled={!newWin.trim() || submitting}
                  className="flex-1 bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 shadow-lg shadow-green-500/20"
                >
                  {submitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Share2 className="h-4 w-4 mr-2" />
                      Share
                    </>
                  )}
                </Button>
              </div>
            </motion.div>

            {/* Wins List */}
            <motion.div variants={itemVariants}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <div className="w-1.5 h-5 rounded-full bg-gradient-to-b from-orange-500 to-yellow-500" />
                  Today's Wins ({wins.length})
                </h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    haptics.tap()
                    onClose()
                    openModal('winsHistory')
                  }}
                  className="text-orange-600 border-orange-200 hover:bg-orange-50"
                >
                  <History className="h-4 w-4 mr-1" />
                  History
                </Button>
              </div>

              {wins.length === 0 ? (
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-center py-10 bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl border-2 border-dashed border-orange-200"
                >
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                    className="mb-4"
                  >
                    <Illustration name="trophy" size="lg" className="mx-auto opacity-85" />
                  </motion.div>
                  <motion.h3
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="font-semibold text-foreground mb-1"
                  >
                    No Wins Yet Today
                  </motion.h3>
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-sm text-muted-foreground px-4"
                  >
                    Add your first win above to start celebrating!
                  </motion.p>
                </motion.div>
              ) : (
                <div className="space-y-2">
                  <AnimatePresence>
                    {wins.map((win, index) => (
                      <motion.div
                        key={win.id}
                        variants={winCardVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        custom={index}
                        whileHover={{ scale: 1.02, x: 4 }}
                        className="flex items-start gap-3 p-4 bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl border-2 border-orange-100 shadow-sm"
                      >
                        <motion.div
                          animate={{
                            rotate: [0, 10, -10, 0],
                            scale: [1, 1.1, 1],
                          }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <Star className="h-5 w-5 text-orange-500 fill-orange-200 mt-0.5 shrink-0" />
                        </motion.div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground">{win.text}</p>
                          <div className="flex items-center gap-2 mt-1.5">
                            <span className="text-xs text-muted-foreground">
                              {formatDateTime(win.createdAt)}
                            </span>
                            {win.sharedToCommunity && (
                              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                                Shared
                              </span>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </motion.div>

            {/* Encouragement */}
            <motion.div
              variants={itemVariants}
              className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-5 border-2 border-purple-200 text-center"
            >
              <motion.div
                animate={{
                  y: [0, -5, 0],
                  rotate: [0, 5, -5, 0],
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="inline-block mb-2"
              >
                <Sparkles className="h-8 w-8 text-purple-500" />
              </motion.div>
              <p className="text-sm text-purple-800 font-medium">
                Every win counts! Celebrate your progress, no matter how small.
                You're doing amazing!
              </p>
            </motion.div>
          </motion.div>
        </ScrollArea>
      </EnhancedDialogContent>
    </EnhancedDialog>
  )
}

export default WinsModal
