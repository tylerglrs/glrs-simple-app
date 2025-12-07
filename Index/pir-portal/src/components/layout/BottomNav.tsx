/**
 * Bottom Navigation Component
 *
 * Tab-based navigation that uses state switching instead of route navigation.
 * This enables instant tab switching by toggling visibility rather than
 * unmounting/remounting components.
 *
 * Features:
 * - State-based tab switching (no page reloads)
 * - Visual active state indicator
 * - Accessible with proper ARIA attributes
 * - Mobile-optimized touch targets
 */

import { cn } from '@/lib/utils'
import { useTab, type TabId } from '@/contexts/TabContext'
import {
  ClipboardList,
  Compass,
  Users,
  Calendar,
  Book,
  MessageSquare,
  type LucideIcon,
} from 'lucide-react'

// =============================================================================
// TAB CONFIGURATION
// =============================================================================

interface TabConfig {
  id: TabId
  icon: LucideIcon
  label: string
}

/**
 * Navigation tabs configuration
 * Note: Profile tab is intentionally omitted from bottom nav
 * (accessible via header/settings)
 */
const tabs: TabConfig[] = [
  { id: 'tasks', icon: ClipboardList, label: 'Tasks' },
  { id: 'journey', icon: Compass, label: 'Journey' },
  { id: 'community', icon: Users, label: 'Connect' },
  { id: 'meetings', icon: Calendar, label: 'Meetings' },
  { id: 'resources', icon: Book, label: 'Guides' },
  { id: 'messages', icon: MessageSquare, label: 'Messages' },
]

// =============================================================================
// NAV BUTTON
// =============================================================================

interface NavButtonProps {
  tab: TabConfig
  isActive: boolean
  onClick: () => void
}

/**
 * Individual navigation button
 */
function NavButton({ tab, isActive, onClick }: NavButtonProps) {
  const Icon = tab.icon

  return (
    <button
      id={`tab-${tab.id}`}
      role="tab"
      aria-selected={isActive}
      aria-controls={`tab-panel-${tab.id}`}
      onClick={onClick}
      className={cn(
        'flex-1 flex flex-col items-center justify-center gap-1',
        'transition-colors duration-150',
        'tap-target min-h-[48px]', // Touch-friendly target
        isActive
          ? 'text-primary'
          : 'text-muted-foreground hover:text-foreground active:text-foreground'
      )}
    >
      <Icon
        className={cn(
          'h-5 w-5 transition-all duration-150',
          isActive && 'stroke-[2.5] scale-110'
        )}
      />
      <span
        className={cn(
          'text-xs font-medium transition-all duration-150',
          isActive && 'font-semibold'
        )}
      >
        {tab.label}
      </span>
    </button>
  )
}

// =============================================================================
// BOTTOM NAV
// =============================================================================

/**
 * Bottom navigation bar
 *
 * Uses TabContext for state-based navigation instead of React Router.
 * This enables instant tab switching without component unmounting.
 */
export function BottomNav() {
  const { activeTab, setActiveTab } = useTab()

  return (
    <nav
      role="tablist"
      aria-label="Main navigation"
      className={cn(
        'fixed bottom-0 left-0 right-0',
        'h-16 bg-background/95 backdrop-blur-sm border-t',
        'flex z-50',
        'safe-bottom' // iOS safe area
      )}
    >
      {tabs.map((tab) => (
        <NavButton
          key={tab.id}
          tab={tab}
          isActive={activeTab === tab.id}
          onClick={() => setActiveTab(tab.id)}
        />
      ))}
    </nav>
  )
}

export default BottomNav
