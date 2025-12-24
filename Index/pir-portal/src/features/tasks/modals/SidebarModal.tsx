import { ScrollArea } from '@/components/ui/scroll-area'
import {
  GlassSidebar,
  SidebarHeader,
  SidebarItem,
  SidebarSection,
  SidebarItemsContainer,
  SidebarFooter,
} from '@/components/ui/glass-sidebar'
import {
  Menu,
  CheckCircle,
  Target,
  Star,
  Calendar,
  TrendingUp,
  Sparkles,
  History,
  Heart,
  Wind,
  AlertTriangle,
  Flame,
  Sun,
  Moon,
  Brain,
  LayoutDashboard,
  Compass,
} from 'lucide-react'
import { useModalStore } from '@/stores/modalStore'

// =============================================================================
// TYPES
// =============================================================================

export interface SidebarModalProps {
  onClose: () => void
}

// =============================================================================
// SIDEBAR SECTIONS DATA
// =============================================================================

interface SidebarItemData {
  id: string
  label: string
  description: string
  icon: typeof Menu
  color: string
  bgColor: string
  modalName: string
}

interface SidebarSectionData {
  title: string
  gradient: string
  items: SidebarItemData[]
}

const sidebarSections: SidebarSectionData[] = [
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
// COMPONENT
// =============================================================================

export function SidebarModal({ onClose }: SidebarModalProps) {
  const { openModal } = useModalStore()

  const handleItemClick = (modalName: string) => {
    onClose()
    // Small delay to allow sidebar to close first
    setTimeout(() => {
      openModal(modalName as Parameters<typeof openModal>[0])
    }, 150)
  }

  return (
    <GlassSidebar
      open
      onOpenChange={(isOpen) => !isOpen && onClose()}
      side="left"
      size="sm"
      variant="standard"
    >
      <SidebarHeader
        variant="gradient"
        title="Quick Menu"
        subtitle="Access all your tools"
        icon={Menu}
        onClose={onClose}
        showCloseButton
      />

      <ScrollArea className="flex-1">
        <div className="p-3 pb-6">
          <SidebarItemsContainer>
            {sidebarSections.map((section) => (
              <SidebarSection
                key={section.title}
                title={section.title}
                gradient={section.gradient}
              >
                {section.items.map((item) => (
                  <SidebarItem
                    key={item.id}
                    icon={item.icon}
                    label={item.label}
                    description={item.description}
                    iconColor={item.color}
                    iconBgColor={item.bgColor}
                    onClick={() => handleItemClick(item.modalName)}
                  />
                ))}
              </SidebarSection>
            ))}
          </SidebarItemsContainer>
        </div>
      </ScrollArea>

      <SidebarFooter helpText="Swipe right or tap outside to close" />
    </GlassSidebar>
  )
}

export default SidebarModal
