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

import { useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'
import { useTab, type TabId } from '@/contexts/TabContext'
import { useCoachMarkContext } from '@/components/common/CoachMarkProvider'
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
  coachMarkId?: string // Coach mark ID for feature discovery
}

/**
 * Navigation tabs configuration
 * Note: Profile tab is intentionally omitted from bottom nav
 * (accessible via header/settings)
 * Note: Community/Connect tab is hidden from users but code is preserved
 */
const tabs: TabConfig[] = [
  { id: 'tasks', icon: ClipboardList, label: 'Tasks', coachMarkId: 'tasks-tab' },
  { id: 'journey', icon: Compass, label: 'Journey', coachMarkId: 'journey-tab' },
  // Connect tab hidden from users - code preserved for future use
  // { id: 'community', icon: Users, label: 'Connect', coachMarkId: 'community-tab' },
  { id: 'meetings', icon: Calendar, label: 'Meetings', coachMarkId: 'meetings-tab' },
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
  registerCoachMark?: (markId: string, element: HTMLElement | null) => void
}

/**
 * Individual navigation button
 */
function NavButton({ tab, isActive, onClick, registerCoachMark }: NavButtonProps) {
  const Icon = tab.icon
  const buttonRef = useRef<HTMLButtonElement>(null)

  // Register this button as a coach mark target if it has a coachMarkId
  useEffect(() => {
    if (tab.coachMarkId && registerCoachMark && buttonRef.current) {
      registerCoachMark(tab.coachMarkId, buttonRef.current)
    }

    return () => {
      if (tab.coachMarkId && registerCoachMark) {
        registerCoachMark(tab.coachMarkId, null)
      }
    }
  }, [tab.coachMarkId, registerCoachMark])

  return (
    <button
      ref={buttonRef}
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
  const { registerTarget } = useCoachMarkContext()

  return (
    <nav
      role="tablist"
      aria-label="Main navigation"
      className={cn(
        'fixed bottom-0 left-0 right-0',
        'bg-white/20 backdrop-blur-md border-t border-white/30',
        'flex z-50',
        'pb-safe' // iOS safe area inset below nav buttons
      )}
      style={{
        paddingTop: '8px',
        minHeight: '64px', // Ensures 64px min + safe area inset
      }}
    >
      {tabs.map((tab) => (
        <NavButton
          key={tab.id}
          tab={tab}
          isActive={activeTab === tab.id}
          onClick={() => setActiveTab(tab.id)}
          registerCoachMark={registerTarget}
        />
      ))}
    </nav>
  )
}

export default BottomNav
