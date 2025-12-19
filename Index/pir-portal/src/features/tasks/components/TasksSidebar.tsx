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
  X,
  Heart,
  BookHeart,
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
    icon: Repeat,
    label: 'Habit Tracker',
    modal: 'habit',
    iconColor: 'text-teal-500',
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
  const Icon = item.icon

  return (
    <button
      className={cn(
        'w-full flex items-center gap-3 p-4 rounded-xl',
        'bg-white/60 backdrop-blur-sm border border-white/40 shadow-sm',
        'hover:bg-white/80 hover:border-white/60 hover:shadow-md transition-all duration-200',
        'cursor-pointer text-left'
      )}
      onClick={onClick}
    >
      <Icon className={cn('h-5 w-5', item.iconColor || 'text-teal-500')} />
      <span className="font-medium text-gray-700 text-sm md:text-base">
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
        className={cn(
          'p-0 w-[280px] bg-white/80 backdrop-blur-xl border-r-white/20',
          isMobile && 'w-[85vw] max-w-[320px]'
        )}
      >
        <SheetHeader className="px-5 py-4 border-b border-white/30 bg-gradient-to-r from-teal-500/10 to-cyan-500/10">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-lg font-bold text-teal-600">
              Quick Tools
            </SheetTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 hover:bg-white/50"
              onClick={onClose}
            >
              <X className="h-5 w-5 text-muted-foreground" />
            </Button>
          </div>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-80px)]">
          <div className="p-3 md:p-5 space-y-2 md:space-y-3">
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
          'fixed left-0 bottom-0 w-[280px] bg-white/80 backdrop-blur-xl shadow-xl z-[9999]',
          'animate-in slide-in-from-left duration-300',
          isMobile && 'w-[85vw] max-w-[320px]'
        )}
        style={{ top: 'env(safe-area-inset-top, 0px)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/30 bg-gradient-to-r from-teal-500/10 to-cyan-500/10 pt-safe">
          <h2 className="text-xl font-bold text-teal-600">Quick Tools</h2>
          <button
            className="p-1 hover:bg-white/50 rounded-lg transition-colors"
            onClick={onClose}
          >
            <X className="h-6 w-6 text-muted-foreground" />
          </button>
        </div>

        {/* Menu Items */}
        <ScrollArea className="h-[calc(100vh-73px-env(safe-area-inset-top,0px))]">
          <div className="p-4 md:p-5 space-y-2 md:space-y-3">
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
