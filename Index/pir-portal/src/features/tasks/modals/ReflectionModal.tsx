import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  EnhancedDialog,
  EnhancedDialogContent,
} from '@/components/ui/enhanced-dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { MessageCircle, X, Share2, History, Send, Sparkles, Lightbulb } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { useModalStore } from '@/stores/modalStore'
import { useReflections, formatDateTime } from '../hooks/useTasksModalData'
import { haptics } from '@/lib/animations'

// =============================================================================
// TYPES
// =============================================================================

export interface ReflectionModalProps {
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
      staggerChildren: 0.06,
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

const promptVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: {
      delay: 0.5 + i * 0.1,
    },
  }),
}

// =============================================================================
// COMPONENT
// =============================================================================

export function ReflectionModal({ onClose }: ReflectionModalProps) {
  const isMobile = useMediaQuery('(max-width: 768px)')
  const { reflections, loading, addReflection } = useReflections()
  const { openModal } = useModalStore()

  const [newReflection, setNewReflection] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleAddReflection = async (shareToCommunity = false) => {
    if (!newReflection.trim() || submitting) return

    haptics.success()
    setSubmitting(true)
    const success = await addReflection(newReflection.trim(), shareToCommunity)
    setSubmitting(false)

    if (success) {
      setNewReflection('')
    }
  }

  // Get recent reflections (last 5)
  const recentReflections = reflections.slice(0, 5)

  const prompts = [
    'What are you grateful for today?',
    'How did you handle a challenge recently?',
    "What's one thing you learned about yourself?",
    'What made you smile today?',
  ]

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
                <MessageCircle className="h-10 w-10 text-teal-500" />
              </motion.div>
              <p className="text-sm text-muted-foreground">Loading reflections...</p>
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
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="absolute top-4 right-12 w-8 h-8 rounded-full bg-white/20"
          />
          <div className="absolute bottom-2 left-8 w-4 h-4 rounded-full bg-white/10" />

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
              <MessageCircle className="h-7 w-7 text-white" />
            </motion.div>
            <div>
              <h2 className="text-xl font-bold text-white">Quick Reflection</h2>
              <p className="text-white/80 text-sm">Capture your thoughts</p>
            </div>
          </div>
        </motion.div>

        {/* Content */}
        <ScrollArea className="flex-1">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className={cn('p-5 space-y-5', isMobile && 'p-4 space-y-4')}
          >
            {/* Add Reflection */}
            <motion.div variants={itemVariants}>
              <label className="text-sm font-medium text-foreground mb-2 block flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-teal-500" />
                What's on your mind?
              </label>
              <Textarea
                value={newReflection}
                onChange={(e) => setNewReflection(e.target.value)}
                placeholder="Share a quick thought, feeling, or reflection..."
                disabled={submitting}
                className="min-h-[120px] text-base resize-none border-2 focus:border-teal-400"
              />
              <div className="flex flex-col gap-2 mt-3">
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleAddReflection(false)}
                    disabled={!newReflection.trim() || submitting}
                    className="flex-1 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 h-11"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Save
                  </Button>
                  <Button
                    onClick={() => handleAddReflection(true)}
                    disabled={!newReflection.trim() || submitting}
                    className="flex-1 bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 h-11"
                  >
                    <Share2 className="h-4 w-4 mr-2" />
                    Save & Share
                  </Button>
                </div>
                <Button
                  variant="outline"
                  onClick={() => {
                    haptics.tap()
                    onClose()
                    openModal('reflectionHistory')
                  }}
                  className="w-full text-teal-600 border-teal-200 hover:bg-teal-50 h-10"
                >
                  <History className="h-4 w-4 mr-2" />
                  View Past Reflections
                </Button>
              </div>
            </motion.div>

            {/* Recent Reflections */}
            <AnimatePresence>
              {recentReflections.length > 0 && (
                <motion.div variants={itemVariants}>
                  <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                    <div className="w-1.5 h-5 rounded-full bg-gradient-to-b from-teal-500 to-cyan-500" />
                    Recent Reflections
                  </h3>
                  <div className="space-y-2">
                    {recentReflections.map((reflection, index) => (
                      <motion.div
                        key={reflection.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 + index * 0.1 }}
                        whileHover={{ scale: 1.01, x: 4 }}
                        className="p-3 bg-gradient-to-r from-gray-50 to-white rounded-xl border-2 border-gray-100 hover:border-teal-200 transition-colors"
                      >
                        <p className="text-sm text-foreground line-clamp-3">
                          {reflection.text}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs text-muted-foreground">
                            {formatDateTime(reflection.createdAt)}
                          </span>
                          {reflection.sharedToCommunity && (
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                              Shared
                            </span>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Prompts */}
            <motion.div
              variants={itemVariants}
              className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-5 border-2 border-blue-200"
            >
              <div className="flex items-center gap-2 mb-3">
                <Lightbulb className="h-5 w-5 text-blue-600" />
                <h4 className="font-semibold text-blue-800">Reflection Prompts</h4>
              </div>
              <div className="space-y-2">
                {prompts.map((prompt, index) => (
                  <motion.div
                    key={index}
                    custom={index}
                    variants={promptVariants}
                    initial="hidden"
                    animate="visible"
                    className="flex items-center gap-2 text-sm text-blue-700"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                    {prompt}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </ScrollArea>
      </EnhancedDialogContent>
    </EnhancedDialog>
  )
}

export default ReflectionModal
