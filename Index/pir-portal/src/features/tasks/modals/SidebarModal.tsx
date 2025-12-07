import { motion } from 'framer-motion'
import {
  EnhancedDialog,
  EnhancedDialogContent,
} from '@/components/ui/enhanced-dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Menu,
  X,
  CheckCircle,
  Target,
  Star,
  Calendar,
  TrendingUp,
  Sparkles,
  History,
  Heart,
  Wind,
  ChevronRight,
  AlertTriangle,
  Flame,
  Sun,
  Moon,
  Brain,
  LayoutDashboard,
  Compass,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useModalStore } from '@/stores/modalStore'
import { haptics } from '@/lib/animations'

// =============================================================================
// TYPES
// =============================================================================

export interface SidebarModalProps {
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
      staggerChildren: 0.04,
      delayChildren: 0.1,
    },
  },
}

const sectionVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      type: 'spring' as const,
      stiffness: 400,
      damping: 30,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, x: -15, scale: 0.95 },
  visible: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: {
      type: 'spring' as const,
      stiffness: 400,
      damping: 25,
    },
  },
}

const headerVariants = {
  hidden: { opacity: 0, y: -10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring' as const,
      stiffness: 300,
      damping: 20,
    },
  },
}

// =============================================================================
// SIDEBAR ITEMS
// =============================================================================

const sidebarSections = [
  {
    title: 'Daily Check-ins',
    gradient: 'from-amber-500 to-orange-500',
    items: [
      {
        id: 'dailyOverview',
        label: 'Daily Overview',
        description: "See today's progress",
        icon: LayoutDashboard,
        color: 'text-teal-600',
        bgColor: 'bg-gradient-to-br from-teal-50 to-emerald-100',
        modalName: 'dailyOverview',
      },
      {
        id: 'morningCheckin',
        label: 'Morning Check-In',
        description: 'Start your day right',
        icon: Sun,
        color: 'text-amber-600',
        bgColor: 'bg-gradient-to-br from-amber-50 to-orange-100',
        modalName: 'morningCheckin',
      },
      {
        id: 'eveningReflection',
        label: 'Evening Reflection',
        description: 'Wind down with reflection',
        icon: Moon,
        color: 'text-indigo-600',
        bgColor: 'bg-gradient-to-br from-indigo-50 to-purple-100',
        modalName: 'eveningReflection',
      },
    ],
  },
  {
    title: 'Quick Actions',
    gradient: 'from-green-500 to-emerald-500',
    items: [
      {
        id: 'habit',
        label: 'Track Habit',
        description: 'Log a habit completion',
        icon: CheckCircle,
        color: 'text-green-600',
        bgColor: 'bg-gradient-to-br from-green-50 to-emerald-100',
        modalName: 'habit',
      },
      {
        id: 'reflection',
        label: 'Quick Reflection',
        description: 'Record a thought or insight',
        icon: Sparkles,
        color: 'text-purple-600',
        bgColor: 'bg-gradient-to-br from-purple-50 to-violet-100',
        modalName: 'reflection',
      },
      {
        id: 'wins',
        label: "Today's Wins",
        description: 'Celebrate your victories',
        icon: Star,
        color: 'text-orange-600',
        bgColor: 'bg-gradient-to-br from-orange-50 to-amber-100',
        modalName: 'wins',
      },
      {
        id: 'intentions',
        label: 'Set Intention',
        description: 'Focus your day',
        icon: Target,
        color: 'text-teal-600',
        bgColor: 'bg-gradient-to-br from-teal-50 to-cyan-100',
        modalName: 'intentions',
      },
    ],
  },
  {
    title: 'Tasks',
    gradient: 'from-blue-500 to-indigo-500',
    items: [
      {
        id: 'thisWeek',
        label: 'This Week',
        description: 'Tasks due this week',
        icon: Calendar,
        color: 'text-blue-600',
        bgColor: 'bg-gradient-to-br from-blue-50 to-indigo-100',
        modalName: 'thisWeek',
      },
      {
        id: 'overdue',
        label: 'Overdue',
        description: 'Tasks that need attention',
        icon: AlertTriangle,
        color: 'text-red-600',
        bgColor: 'bg-gradient-to-br from-red-50 to-rose-100',
        modalName: 'overdue',
      },
      {
        id: 'complete',
        label: 'Completed',
        description: 'Your accomplishments',
        icon: CheckCircle,
        color: 'text-green-600',
        bgColor: 'bg-gradient-to-br from-green-50 to-emerald-100',
        modalName: 'complete',
      },
    ],
  },
  {
    title: 'Progress & Stats',
    gradient: 'from-teal-500 to-cyan-500',
    items: [
      {
        id: 'stats',
        label: 'Weekly Stats',
        description: 'Your progress report',
        icon: TrendingUp,
        color: 'text-teal-600',
        bgColor: 'bg-gradient-to-br from-teal-50 to-cyan-100',
        modalName: 'stats',
      },
      {
        id: 'streaks',
        label: 'Streaks',
        description: 'Your check-in streaks',
        icon: Flame,
        color: 'text-orange-600',
        bgColor: 'bg-gradient-to-br from-orange-50 to-amber-100',
        modalName: 'streakHistory',
      },
      {
        id: 'moodPattern',
        label: 'Mood Patterns',
        description: 'Analyze your moods',
        icon: Brain,
        color: 'text-purple-600',
        bgColor: 'bg-gradient-to-br from-purple-50 to-violet-100',
        modalName: 'moodPattern',
      },
      {
        id: 'goalProgress',
        label: 'Goal Progress',
        description: 'Track your goals',
        icon: Target,
        color: 'text-indigo-600',
        bgColor: 'bg-gradient-to-br from-indigo-50 to-blue-100',
        modalName: 'goalProgress',
      },
    ],
  },
  {
    title: 'History',
    gradient: 'from-indigo-500 to-purple-500',
    items: [
      {
        id: 'reflectionHistory',
        label: 'Past Reflections',
        description: 'Review your reflections',
        icon: History,
        color: 'text-indigo-600',
        bgColor: 'bg-gradient-to-br from-indigo-50 to-violet-100',
        modalName: 'pastReflections',
      },
      {
        id: 'habitHistory',
        label: 'Habit History',
        description: 'Your habit tracking',
        icon: CheckCircle,
        color: 'text-green-600',
        bgColor: 'bg-gradient-to-br from-green-50 to-emerald-100',
        modalName: 'habitHistory',
      },
      {
        id: 'winsHistory',
        label: 'Wins History',
        description: 'All your wins',
        icon: Star,
        color: 'text-orange-600',
        bgColor: 'bg-gradient-to-br from-orange-50 to-amber-100',
        modalName: 'winsHistory',
      },
    ],
  },
  {
    title: 'Wellness Tools',
    gradient: 'from-pink-500 to-rose-500',
    items: [
      {
        id: 'copingTechnique',
        label: 'Coping Technique',
        description: "Today's technique",
        icon: Wind,
        color: 'text-teal-600',
        bgColor: 'bg-gradient-to-br from-teal-50 to-cyan-100',
        modalName: 'copingTechnique',
      },
      {
        id: 'copingHistory',
        label: 'Coping History',
        description: 'Past techniques used',
        icon: Compass,
        color: 'text-blue-600',
        bgColor: 'bg-gradient-to-br from-blue-50 to-cyan-100',
        modalName: 'copingHistory',
      },
      {
        id: 'gratitude',
        label: 'Gratitude',
        description: 'Practice gratitude',
        icon: Heart,
        color: 'text-pink-600',
        bgColor: 'bg-gradient-to-br from-pink-50 to-rose-100',
        modalName: 'gratitude',
      },
      {
        id: 'tips',
        label: 'Recovery Tips',
        description: 'Helpful suggestions',
        icon: Sparkles,
        color: 'text-blue-600',
        bgColor: 'bg-gradient-to-br from-blue-50 to-indigo-100',
        modalName: 'tips',
      },
    ],
  },
]

// =============================================================================
// SIDEBAR ITEM COMPONENT
// =============================================================================

interface SidebarItemProps {
  item: (typeof sidebarSections)[0]['items'][0]
  onClick: () => void
}

function SidebarItem({ item, onClick }: SidebarItemProps) {
  const Icon = item.icon

  return (
    <motion.button
      variants={itemVariants}
      whileHover={{ scale: 1.02, x: 4 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50/80 transition-colors text-left group"
    >
      <div
        className={cn(
          'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm',
          item.bgColor
        )}
      >
        <Icon className={cn('h-5 w-5', item.color)} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm text-foreground">{item.label}</p>
        <p className="text-xs text-muted-foreground truncate">{item.description}</p>
      </div>
      <ChevronRight className="h-4 w-4 text-gray-300 flex-shrink-0 transition-transform group-hover:translate-x-1 group-hover:text-gray-500" />
    </motion.button>
  )
}

// =============================================================================
// COMPONENT
// =============================================================================

export function SidebarModal({ onClose }: SidebarModalProps) {
  const { openModal } = useModalStore()

  const handleItemClick = (modalName: string) => {
    haptics.tap()
    onClose()
    // Small delay to allow sidebar to close first
    setTimeout(() => {
      openModal(modalName as Parameters<typeof openModal>[0])
    }, 150)
  }

  return (
    <EnhancedDialog open onOpenChange={onClose}>
      <EnhancedDialogContent
        variant="sheet-left"
        showCloseButton={false}
        className="p-0 flex flex-col"
      >
        {/* Header */}
        <motion.div
          variants={headerVariants}
          initial="hidden"
          animate="visible"
          className="relative bg-gradient-to-br from-teal-500 via-teal-600 to-emerald-600 p-5"
        >
          {/* Decorative circles */}
          <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white/10 -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-20 h-20 rounded-full bg-white/5 translate-y-1/2 -translate-x-1/2" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors z-10"
          >
            <X className="h-5 w-5 text-white" />
          </button>

          <div className="flex items-center gap-3 relative z-10">
            <div className="p-2.5 rounded-xl bg-white/20 backdrop-blur-sm">
              <Menu className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Quick Menu</h2>
              <p className="text-white/70 text-xs mt-0.5">Access all your tools</p>
            </div>
          </div>
        </motion.div>

        {/* Content */}
        <ScrollArea className="flex-1">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="p-4 space-y-5 pb-8"
          >
            {sidebarSections.map((section) => (
              <motion.div key={section.title} variants={sectionVariants}>
                {/* Section Header */}
                <div className="flex items-center gap-2 mb-2 px-1">
                  <div
                    className={cn(
                      'h-1 w-6 rounded-full bg-gradient-to-r',
                      section.gradient
                    )}
                  />
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {section.title}
                  </h3>
                </div>

                {/* Section Items */}
                <div className="space-y-0.5">
                  {section.items.map((item) => (
                    <SidebarItem
                      key={item.id}
                      item={item}
                      onClick={() => handleItemClick(item.modalName)}
                    />
                  ))}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </ScrollArea>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="p-4 border-t bg-gray-50/50"
        >
          <p className="text-xs text-center text-muted-foreground">
            Swipe right or tap outside to close
          </p>
        </motion.div>
      </EnhancedDialogContent>
    </EnhancedDialog>
  )
}

export default SidebarModal
