/**
 * Tab Container Component
 *
 * Renders all tab components and manages visibility via CSS display toggle.
 * This creates the "Instagram-like" instant tab switching experience by:
 *
 * 1. Keeping tabs mounted in the DOM (within LRU limit)
 * 2. Toggling visibility via display: none/block
 * 3. Lazy-loading tabs on first visit (then keeping them mounted)
 * 4. Preserving state, scroll position, and form inputs
 * 5. Memory-bounded caching with LRU eviction
 * 6. Smooth fade transitions between tabs
 *
 * Performance characteristics:
 * - First tab visit: Loads chunk + data (shows content-shaped skeleton)
 * - Return tab visit: Instant (< 100ms, no loading)
 * - Memory: Max 5 tabs cached (LRU eviction)
 * - Adjacent tabs preloaded in background
 */

import { lazy, Suspense, memo, useRef } from 'react'
import { useTab, type TabId } from '@/contexts/TabContext'
import { TabSkeleton } from '@/components/common/TabSkeletons'
import { useTabPreload } from '@/hooks/useTabPreload'

// =============================================================================
// LAZY IMPORTS
// =============================================================================

// Lazy load tab components for code splitting
// These chunks are loaded once and kept mounted (within LRU limit)
const TasksTab = lazy(() => import('@/features/tasks'))
const JourneyTab = lazy(() => import('@/features/journey'))
const MeetingsTab = lazy(() => import('@/features/meetings'))
const CommunityTab = lazy(() => import('@/features/community'))
const ResourcesTab = lazy(() => import('@/features/resources'))
const MessagesTab = lazy(() => import('@/features/messages'))
const ProfileTab = lazy(() => import('@/features/profile'))

// =============================================================================
// TAB PANEL
// =============================================================================

interface TabPanelProps {
  id: TabId
  isActive: boolean
  isLoaded: boolean
  isCached: boolean
  children: React.ReactNode
}

/**
 * Individual tab panel wrapper
 * Handles visibility, transitions, and accessibility attributes
 */
const TabPanel = memo(function TabPanel({
  id,
  isActive,
  isLoaded,
  isCached,
  children,
}: TabPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null)

  // Don't render if tab hasn't been loaded yet
  // Exception: always render the active tab even if not in loadedTabs yet
  if (!isLoaded && !isActive) return null

  // For LRU eviction: don't render if tab is not cached AND not active
  // This allows evicted tabs to unmount while keeping active tab visible
  if (!isCached && !isActive && isLoaded) return null

  return (
    <div
      ref={panelRef}
      id={`tab-panel-${id}`}
      role="tabpanel"
      aria-labelledby={`tab-${id}`}
      aria-hidden={!isActive}
      className="absolute inset-0 overflow-auto"
      style={{
        // Use display toggle for reliable visibility
        display: isActive ? 'block' : 'none',
        // Prevent scroll events and interactions on hidden tabs
        pointerEvents: isActive ? 'auto' : 'none',
      }}
    >
      <Suspense fallback={<TabSkeleton tabId={id} />}>{children}</Suspense>
    </div>
  )
})

// =============================================================================
// TAB CONTAINER
// =============================================================================

/**
 * Main tab container component
 *
 * Renders tabs that are within the LRU cache limit.
 * Tabs are kept mounted after first load to preserve state,
 * but evicted when the cache limit is exceeded.
 */
export function TabContainer() {
  const { activeTab, isTabLoaded, isTabCached } = useTab()

  // Preload adjacent tab chunks in background
  useTabPreload(activeTab)

  return (
    <div className="flex-1 h-full min-h-0 overflow-hidden relative">
      {/* Tasks Tab - Default tab */}
      <TabPanel
        id="tasks"
        isActive={activeTab === 'tasks'}
        isLoaded={isTabLoaded('tasks')}
        isCached={isTabCached('tasks')}
      >
        <TasksTab />
      </TabPanel>

      {/* Journey Tab */}
      <TabPanel
        id="journey"
        isActive={activeTab === 'journey'}
        isLoaded={isTabLoaded('journey')}
        isCached={isTabCached('journey')}
      >
        <JourneyTab />
      </TabPanel>

      {/* Meetings Tab */}
      <TabPanel
        id="meetings"
        isActive={activeTab === 'meetings'}
        isLoaded={isTabLoaded('meetings')}
        isCached={isTabCached('meetings')}
      >
        <MeetingsTab />
      </TabPanel>

      {/* Community Tab */}
      <TabPanel
        id="community"
        isActive={activeTab === 'community'}
        isLoaded={isTabLoaded('community')}
        isCached={isTabCached('community')}
      >
        <CommunityTab />
      </TabPanel>

      {/* Resources Tab */}
      <TabPanel
        id="resources"
        isActive={activeTab === 'resources'}
        isLoaded={isTabLoaded('resources')}
        isCached={isTabCached('resources')}
      >
        <ResourcesTab />
      </TabPanel>

      {/* Messages Tab */}
      <TabPanel
        id="messages"
        isActive={activeTab === 'messages'}
        isLoaded={isTabLoaded('messages')}
        isCached={isTabCached('messages')}
      >
        <MessagesTab />
      </TabPanel>

      {/* Profile Tab */}
      <TabPanel
        id="profile"
        isActive={activeTab === 'profile'}
        isLoaded={isTabLoaded('profile')}
        isCached={isTabCached('profile')}
      >
        <ProfileTab />
      </TabPanel>
    </div>
  )
}

// =============================================================================
// LOADING FALLBACK (for initial app load)
// =============================================================================

/**
 * Full-page loading state for initial app load
 * Uses the skeleton for the default tab
 */
export function TabContainerFallback() {
  return (
    <div className="flex-1 h-full min-h-0 overflow-hidden relative">
      <TabSkeleton tabId="tasks" />
    </div>
  )
}

export default TabContainer
