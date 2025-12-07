import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import {
  Repeat,
  CalendarDays,
  AlertCircle,
  CheckCircle,
  X,
  Heart,
  BookHeart,
  TrendingUp,
  Target,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useMediaQuery } from '@/hooks/useMediaQuery'

// =============================================================================
// TYPES
// =============================================================================

export interface TasksSidebarProps {
  open: boolean
  onClose: () => void
  onOpenModal: (modal: string) => void
}

// =============================================================================
// SIDEBAR ITEMS
// =============================================================================

interface SidebarItem {
  icon: typeof Repeat
  label: string
  modal: string
  iconColor?: string
}

const SIDEBAR_ITEMS: SidebarItem[] = [
  {
    icon: CheckCircle,
    label: 'Complete',
    modal: 'complete',
    iconColor: 'text-green-500',
  },
  {
    icon: Repeat,
    label: 'Habit Tracker',
    modal: 'habit',
    iconColor: 'text-teal-500',
  },
  {
    icon: CalendarDays,
    label: "This Week's Tasks",
    modal: 'thisWeek',
    iconColor: 'text-teal-500',
  },
  {
    icon: AlertCircle,
    label: 'Overdue Items',
    modal: 'overdue',
    iconColor: 'text-red-500',
  },
  {
    icon: Heart,
    label: 'Gratitude Entry',
    modal: 'gratitude',
    iconColor: 'text-pink-500',
  },
  {
    icon: BookHeart,
    label: 'Gratitude Journal',
    modal: 'gratitudeJournal',
    iconColor: 'text-rose-500',
  },
  {
    icon: TrendingUp,
    label: 'Challenges History',
    modal: 'challengesHistory',
    iconColor: 'text-purple-500',
  },
  {
    icon: Target,
    label: 'Goal Tracker',
    modal: 'goalProgress',
    iconColor: 'text-amber-500',
  },
]

// =============================================================================
// SIDEBAR ITEM COMPONENT
// =============================================================================

interface SidebarItemButtonProps {
  item: SidebarItem
  onClick: () => void
}

function SidebarItemButton({ item, onClick }: SidebarItemButtonProps) {
  const isMobile = useMediaQuery('(max-width: 768px)')
  const Icon = item.icon

  return (
    <button
      className={cn(
        'w-full flex items-center gap-3 p-4 rounded-xl bg-gray-50 border border-gray-200',
        'hover:bg-gray-100 hover:border-gray-300 transition-all duration-200',
        'cursor-pointer text-left'
      )}
      onClick={onClick}
    >
      <Icon className={cn('h-5 w-5', item.iconColor || 'text-teal-500')} />
      <span className={cn('font-medium text-gray-700', isMobile ? 'text-sm' : 'text-base')}>
        {item.label}
      </span>
    </button>
  )
}

// =============================================================================
// MAIN COMPONENT - USING SHEET (SHADCN DRAWER)
// =============================================================================

export function TasksSidebar({ open, onClose, onOpenModal }: TasksSidebarProps) {
  const isMobile = useMediaQuery('(max-width: 768px)')

  // Handle item click - close sidebar and open modal
  const handleItemClick = (modal: string) => {
    onClose()
    // Small delay to allow sidebar animation to complete
    setTimeout(() => {
      onOpenModal(modal)
    }, 100)
  }

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [open, onClose])

  return (
    <Sheet open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <SheetContent
        side="left"
        className={cn('p-0 w-[280px]', isMobile && 'w-[85vw] max-w-[320px]')}
      >
        <SheetHeader className="px-5 py-4 border-b">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-lg font-bold text-teal-600">
              Quick Tools
            </SheetTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={onClose}
            >
              <X className="h-5 w-5 text-muted-foreground" />
            </Button>
          </div>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-80px)]">
          <div className={cn('p-4 space-y-2', isMobile ? 'p-3 space-y-2' : 'p-5 space-y-3')}>
            {SIDEBAR_ITEMS.map((item, index) => (
              <SidebarItemButton
                key={index}
                item={item}
                onClick={() => handleItemClick(item.modal)}
              />
            ))}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}

// =============================================================================
// ALTERNATIVE: INLINE SIDEBAR (FOR NON-SHEET USAGE)
// =============================================================================

interface InlineSidebarProps {
  open: boolean
  onClose: () => void
  onOpenModal: (modal: string) => void
}

export function InlineSidebar({ open, onClose, onOpenModal }: InlineSidebarProps) {
  const isMobile = useMediaQuery('(max-width: 768px)')

  const handleItemClick = (modal: string) => {
    onClose()
    setTimeout(() => {
      onOpenModal(modal)
    }, 100)
  }

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [open, onClose])

  if (!open) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-[9998] animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Sidebar Panel */}
      <div
        className={cn(
          'fixed top-0 left-0 bottom-0 w-[280px] bg-white shadow-xl z-[9999]',
          'animate-in slide-in-from-left duration-300',
          isMobile && 'w-[85vw] max-w-[320px]'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b-2 border-gray-100">
          <h2 className="text-xl font-bold text-teal-600">Quick Tools</h2>
          <button
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
            onClick={onClose}
          >
            <X className="h-6 w-6 text-muted-foreground" />
          </button>
        </div>

        {/* Menu Items */}
        <ScrollArea className="h-[calc(100vh-73px)]">
          <div className={cn('p-5 space-y-3', isMobile && 'p-4 space-y-2')}>
            {SIDEBAR_ITEMS.map((item, index) => (
              <SidebarItemButton
                key={index}
                item={item}
                onClick={() => handleItemClick(item.modal)}
              />
            ))}
          </div>
        </ScrollArea>
      </div>
    </>
  )
}

export default TasksSidebar
