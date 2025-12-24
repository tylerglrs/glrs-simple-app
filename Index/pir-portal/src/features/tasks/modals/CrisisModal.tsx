import { motion } from 'framer-motion'
import {
  EnhancedDialog,
  EnhancedDialogContent,
} from '@/components/ui/enhanced-dialog'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  AlertTriangle,
  Phone,
  MessageCircle,
  Heart,
  X,
  ExternalLink,
  ShieldCheck,
  Users,
  Sparkles,
  Wind,
  HandHeart,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { haptics } from '@/lib/animations'

// =============================================================================
// TYPES
// =============================================================================

export interface CrisisModalProps {
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
      staggerChildren: 0.1,
      delayChildren: 0.2,
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
      stiffness: 300,
      damping: 24,
    },
  },
}

const pulseAnimation = {
  scale: [1, 1.05, 1],
  transition: {
    duration: 1.5,
    repeat: Infinity,
    ease: 'easeInOut' as const,
  },
}

const shakeAnimation = {
  x: [0, -2, 2, -2, 2, 0],
  transition: {
    duration: 0.5,
    repeat: Infinity,
    repeatDelay: 3,
    ease: 'linear' as const,
  },
}

// =============================================================================
// CRISIS RESOURCES DATA
// =============================================================================

const crisisHotlines = [
  {
    name: '988 Suicide & Crisis Lifeline',
    description: '24/7 crisis support for suicide, mental health, and substance abuse',
    phone: '988',
    gradient: 'from-red-500 to-rose-500',
    icon: Phone,
    priority: true,
  },
  {
    name: 'SAMHSA National Helpline',
    description: 'Free, confidential, 24/7 treatment referrals and information',
    phone: '1-800-662-4357',
    gradient: 'from-amber-500 to-orange-500',
    icon: Heart,
    priority: false,
  },
  {
    name: 'Crisis Text Line',
    description: 'Text HOME to 741741 for free 24/7 support',
    phone: 'text: HOME to 741741',
    gradient: 'from-purple-500 to-violet-500',
    icon: MessageCircle,
    priority: false,
    isText: true,
  },
]

const copingStrategies = [
  {
    title: 'Box Breathing',
    description: 'Breathe in 4s, hold 4s, out 4s, hold 4s',
    icon: Wind,
  },
  {
    title: '5-4-3-2-1 Grounding',
    description: '5 things you see, 4 you hear, 3 you touch...',
    icon: ShieldCheck,
  },
  {
    title: 'Reach Out',
    description: 'Call a friend, sponsor, or family member',
    icon: Users,
  },
  {
    title: 'Safe Space',
    description: 'Go somewhere calm and familiar',
    icon: Heart,
  },
]

// =============================================================================
// HOTLINE CARD COMPONENT
// =============================================================================

interface HotlineCardProps {
  hotline: (typeof crisisHotlines)[0]
}

function HotlineCard({ hotline }: HotlineCardProps) {
  const Icon = hotline.icon

  const handleCall = () => {
    haptics.tap()
    if (hotline.isText) {
      window.open('sms:741741&body=HOME', '_blank')
    } else {
      window.open(`tel:${hotline.phone.replace(/-/g, '')}`, '_blank')
    }
  }

  return (
    <motion.div
      variants={itemVariants}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="w-full"
    >
      <button
        onClick={handleCall}
        className={cn(
          'w-full p-4 rounded-xl text-white text-left transition-all shadow-lg',
          `bg-gradient-to-r ${hotline.gradient}`,
          hotline.priority && 'ring-2 ring-white/50 ring-offset-2 ring-offset-red-50'
        )}
      >
        <div className="flex items-center gap-4">
          <motion.div
            animate={hotline.priority ? pulseAnimation : undefined}
            className="p-3 rounded-full bg-white/20"
          >
            <Icon className="h-6 w-6" />
          </motion.div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg">{hotline.name}</span>
              {hotline.priority && (
                <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">24/7</span>
              )}
            </div>
            <p className="text-sm text-white/80 mt-0.5">{hotline.description}</p>
          </div>
          <div className="flex flex-col items-end">
            <span className="font-bold text-xl">{hotline.phone}</span>
            <span className="text-xs text-white/70">
              {hotline.isText ? 'Tap to text' : 'Tap to call'}
            </span>
          </div>
        </div>
      </button>
    </motion.div>
  )
}

// =============================================================================
// COPING STRATEGY CARD
// =============================================================================

interface CopingCardProps {
  strategy: (typeof copingStrategies)[0]
  index: number
}

function CopingCard({ strategy, index }: CopingCardProps) {
  const Icon = strategy.icon

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.5 + index * 0.1 }}
      className="flex items-center gap-3 p-3 rounded-lg bg-white/50 border border-red-100"
    >
      <div className="p-2 rounded-lg bg-red-50">
        <Icon className="h-4 w-4 text-red-500" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm text-foreground">{strategy.title}</p>
        <p className="text-xs text-muted-foreground truncate">{strategy.description}</p>
      </div>
    </motion.div>
  )
}

// =============================================================================
// COMPONENT
// =============================================================================

export function CrisisModal({ onClose }: CrisisModalProps) {
  const isMobile = useMediaQuery('(max-width: 768px)')


  return (
    <EnhancedDialog open onOpenChange={onClose}>
      <EnhancedDialogContent
        variant={isMobile ? 'fullscreen' : 'centered-large'}
        showCloseButton={false}
        className="p-0 flex flex-col bg-gradient-to-b from-red-50 to-white"
      >
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative bg-gradient-to-br from-red-500 via-red-600 to-rose-600 p-6 pb-8"
        >
          {/* Animated pulse rings */}
          <motion.div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full border-2 border-white/20"
            animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0, 0.3] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <motion.div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full border-2 border-white/30"
            animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0.2, 0.5] }}
            transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
          />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors z-10"
          >
            <X className="h-5 w-5 text-white" />
          </button>

          {/* Title */}
          <div className="flex items-center justify-center flex-col text-center relative z-10">
            <motion.div
              animate={shakeAnimation}
              className="p-4 rounded-full bg-white/20 backdrop-blur-sm mb-4"
            >
              <motion.div animate={pulseAnimation}>
                <AlertTriangle className="h-10 w-10 text-white" />
              </motion.div>
            </motion.div>
            <h2 className="text-2xl font-bold text-white">You Are Not Alone</h2>
            <p className="text-white/90 text-sm mt-2 max-w-xs">
              Help is available right now. Please reach out.
            </p>
          </div>
        </motion.div>

        {/* Content */}
        <ScrollArea className="flex-1">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="p-5 space-y-6"
          >
            {/* Emergency Hotlines */}
            <div className="space-y-3">
              <motion.h3
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-2 font-semibold text-red-700"
              >
                <Phone className="h-4 w-4" />
                Crisis Hotlines
              </motion.h3>

              {crisisHotlines.map((hotline, index) => (
                <HotlineCard key={index} hotline={hotline} />
              ))}
            </div>

            {/* Quick Coping Strategies */}
            <div className="space-y-3">
              <motion.h3
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="flex items-center gap-2 font-semibold text-foreground"
              >
                <Sparkles className="h-4 w-4 text-amber-500" />
                Quick Coping Strategies
              </motion.h3>

              <div className="grid grid-cols-1 gap-2">
                {copingStrategies.map((strategy, index) => (
                  <CopingCard key={index} strategy={strategy} index={index} />
                ))}
              </div>
            </div>

            {/* Encouragement */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-5 border border-green-200 text-center"
            >
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                className="inline-block mb-3"
              >
                <HandHeart className="h-10 w-10 text-green-500" />
              </motion.div>
              <h4 className="font-bold text-green-800 mb-2">You Matter</h4>
              <p className="text-sm text-green-700">
                This moment will pass. Your journey is valuable, and so are you.
                Take it one breath at a time.
              </p>
            </motion.div>

            {/* Additional Resources */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="space-y-2"
            >
              <h3 className="font-semibold text-muted-foreground text-sm">
                Additional Resources
              </h3>
              <a
                href="https://findtreatment.gov"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors group"
              >
                <span className="text-sm font-medium">SAMHSA Treatment Locator</span>
                <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-foreground" />
              </a>
              <a
                href="https://www.aa.org/find-aa"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors group"
              >
                <span className="text-sm font-medium">Find an AA Meeting</span>
                <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-foreground" />
              </a>
            </motion.div>
          </motion.div>
        </ScrollArea>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="p-4 border-t bg-white/80 backdrop-blur-sm"
        >
          <Button
            onClick={onClose}
            variant="outline"
            className="w-full"
          >
            Close
          </Button>
          <p className="text-xs text-center text-muted-foreground mt-2">
            Remember: Seeking help is a sign of strength, not weakness.
          </p>
        </motion.div>
      </EnhancedDialogContent>
    </EnhancedDialog>
  )
}

export default CrisisModal
