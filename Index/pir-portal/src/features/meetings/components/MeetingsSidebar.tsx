import { ScrollArea } from '@/components/ui/scroll-area'
import {
  GlassSidebar,
  SidebarHeader,
  SidebarItem,
  SidebarItemsContainer,
  SidebarFooter,
} from '@/components/ui/glass-sidebar'
import {
  Calendar,
  PlusCircle,
  Bookmark,
} from 'lucide-react'

// =============================================================================
// TYPES
// =============================================================================

export interface MeetingsSidebarProps {
  open: boolean
  onClose: () => void
  onOpenSavedFavorites: () => void
  onOpenLogMeeting: () => void
}

// =============================================================================
// SIDEBAR ITEMS
// =============================================================================

interface SidebarItemData {
  icon: typeof PlusCircle
  label: string
  description: string
  action: string
  iconColor: string
  iconBgColor: string
}

const SIDEBAR_ITEMS: SidebarItemData[] = [
  {
    icon: PlusCircle,
    label: 'Log Meeting',
    description: 'Log a meeting you attended',
    action: 'logMeeting',
    iconColor: 'text-teal-500',
    iconBgColor: 'bg-teal-50',
  },
  {
    icon: Bookmark,
    label: 'Saved & Favorites',
    description: 'Your saved meetings and favorites',
    action: 'savedFavorites',
    iconColor: 'text-amber-500',
    iconBgColor: 'bg-amber-50',
  },
]

// =============================================================================
// COMPONENT
// =============================================================================

export function MeetingsSidebar({
  open,
  onClose,
  onOpenSavedFavorites,
  onOpenLogMeeting,
}: MeetingsSidebarProps) {
  // Handle item click - close sidebar and call appropriate callback
  const handleItemClick = (action: string) => {
    onClose()
    // Small delay to allow sidebar animation to complete
    setTimeout(() => {
      if (action === 'savedFavorites') {
        onOpenSavedFavorites()
      } else if (action === 'logMeeting') {
        onOpenLogMeeting()
      }
    }, 150)
  }

  return (
    <GlassSidebar
      open={open}
      onOpenChange={(isOpen) => !isOpen && onClose()}
      side="left"
      size="sm"
      variant="standard"
    >
      <SidebarHeader
        variant="plain"
        title="Meetings"
        icon={Calendar}
        onClose={onClose}
        showCloseButton
      />

      <ScrollArea className="flex-1">
        <nav className="p-3" aria-label="Meetings menu options">
          <SidebarItemsContainer>
            {SIDEBAR_ITEMS.map((item) => (
              <SidebarItem
                key={item.action}
                icon={item.icon}
                label={item.label}
                description={item.description}
                iconColor={item.iconColor}
                iconBgColor={item.iconBgColor}
                onClick={() => handleItemClick(item.action)}
              />
            ))}
          </SidebarItemsContainer>
        </nav>
      </ScrollArea>

      <SidebarFooter helpText="Tap outside to close" />
    </GlassSidebar>
  )
}

export default MeetingsSidebar
