/**
 * Main Application Layout
 *
 * Provides the app shell with:
 * - Header bar
 * - Main content area (TabContainer or custom content)
 * - Bottom navigation
 * - Tab state management via TabProvider
 * - Data prefetching for instant tab switching
 *
 * Two modes:
 * 1. Tab mode (default): Shows TabContainer with tab navigation
 * 2. Custom content mode: Shows children with optional bottom nav
 */

import type { ReactNode } from 'react'
import { BottomNav } from './BottomNav'
import { HeaderBar } from './HeaderBar'
import { TabContainer } from './TabContainer'
import { TimeOfDayBackground } from '@/components/common'
import { TabProvider } from '@/contexts/TabContext'
import { useAppDataPrefetch } from '@/hooks/useAppDataPrefetch'

// =============================================================================
// TYPES
// =============================================================================

interface MainLayoutProps {
  /**
   * Custom content to render instead of TabContainer.
   * If provided, TabContainer is not rendered.
   */
  children?: ReactNode

  /**
   * Whether to show the bottom tab navigation.
   * Default: true (shown for main app, hidden for profile view)
   */
  showTabs?: boolean
}

// =============================================================================
// LAYOUT CONTENT
// =============================================================================

interface LayoutContentProps {
  children?: ReactNode
  showTabs: boolean
}

/**
 * Inner layout content wrapped in TabProvider
 */
function LayoutContent({ children, showTabs }: LayoutContentProps) {
  // Prefetch critical app data in the background for instant tab switching
  // This runs once after mount and caches data for 30 minutes
  useAppDataPrefetch()

  return (
    <TimeOfDayBackground showBackgroundImage={true}>
      <div className="min-h-screen flex flex-col">
        {/* Header */}
        <HeaderBar />

        {/* Main content area */}
        <main className="flex-1 pb-16 overflow-hidden flex flex-col">
          {children ? (
            // Custom content (e.g., external profile view)
            <div className="h-full overflow-auto">{children}</div>
          ) : (
            // Default: Tab-based navigation
            <TabContainer />
          )}
        </main>

        {/* Bottom navigation - only show for tab mode */}
        {showTabs && <BottomNav />}
      </div>
    </TimeOfDayBackground>
  )
}

// =============================================================================
// MAIN LAYOUT
// =============================================================================

/**
 * Main application layout
 *
 * Wraps content in TabProvider for state-based tab navigation.
 * The TabContainer renders all tabs and manages visibility.
 *
 * Usage:
 * ```tsx
 * // Tab mode (default) - shows TabContainer
 * <MainLayout />
 *
 * // Custom content mode - shows children
 * <MainLayout showTabs={false}>
 *   <UserProfileView />
 * </MainLayout>
 * ```
 */
export function MainLayout({ children, showTabs = true }: MainLayoutProps) {
  // Wrap in TabProvider for tab state management
  // TabProvider handles URL hash synchronization
  return (
    <TabProvider>
      <LayoutContent showTabs={showTabs}>{children}</LayoutContent>
    </TabProvider>
  )
}

export default MainLayout
