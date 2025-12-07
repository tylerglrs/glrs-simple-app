/**
 * Tab Preloading Hook
 *
 * Preloads adjacent tab chunks in the background after the user lands on a tab.
 * This ensures that when the user switches to a likely next tab, the JavaScript
 * chunk is already downloaded and ready.
 *
 * Key features:
 * - Preloads adjacent tabs after 1 second delay
 * - Uses dynamic imports for chunk preloading
 * - Tracks which chunks have been preloaded to avoid duplicates
 * - Prioritizes most likely navigation paths
 */

import { useEffect, useRef } from 'react'
import type { TabId } from '@/contexts/TabContext'

// =============================================================================
// TAB ADJACENCY MAP
// =============================================================================

/**
 * Map of likely next tabs based on user behavior patterns
 * Key: current tab, Value: array of likely next tabs (in priority order)
 *
 * Based on expected user flows:
 * - Tasks: Users often check Journey progress or Profile settings
 * - Journey: Users may go back to Tasks or check Community
 * - Meetings: Users browse meetings then check Community or return to Tasks
 * - Community: Users often switch between Community and Messages
 * - Resources: Users typically come from Tasks or check Profile
 * - Messages: Users switch between Messages and Community/Profile
 * - Profile: Users check Tasks or Messages
 */
const TAB_ADJACENCY: Record<TabId, TabId[]> = {
  tasks: ['journey', 'profile'],
  journey: ['tasks', 'community'],
  meetings: ['community', 'tasks'],
  community: ['meetings', 'messages'],
  resources: ['tasks', 'profile'],
  messages: ['community', 'profile'],
  profile: ['tasks', 'messages'],
}

// =============================================================================
// CHUNK PRELOAD FUNCTIONS
// =============================================================================

/**
 * Dynamic import functions for each tab chunk
 * These trigger webpack/vite to load the chunk without rendering
 */
const preloadChunk: Record<TabId, () => Promise<unknown>> = {
  tasks: () => import('@/features/tasks'),
  journey: () => import('@/features/journey'),
  meetings: () => import('@/features/meetings'),
  community: () => import('@/features/community'),
  resources: () => import('@/features/resources'),
  messages: () => import('@/features/messages'),
  profile: () => import('@/features/profile'),
}

// Global set to track which chunks have been preloaded
const preloadedChunks = new Set<TabId>()

/**
 * Preload a tab's JavaScript chunk
 */
async function preloadTabChunk(tabId: TabId): Promise<void> {
  if (preloadedChunks.has(tabId)) return

  try {
    await preloadChunk[tabId]()
    preloadedChunks.add(tabId)
    console.log(`[TabPreload] Preloaded chunk: ${tabId}`)
  } catch (error) {
    // Non-critical - chunk will load on demand
    console.warn(`[TabPreload] Failed to preload ${tabId}:`, error)
  }
}

// =============================================================================
// MAIN HOOK
// =============================================================================

interface UseTabPreloadOptions {
  /**
   * Delay before starting preload (ms). Default: 1000
   * Allows current tab to fully render before preloading
   */
  delay?: number
  /**
   * Whether preloading is enabled. Default: true
   */
  enabled?: boolean
}

/**
 * Hook to preload adjacent tab chunks in the background
 *
 * Call this hook with the current active tab. After a short delay,
 * it will preload the JavaScript chunks for likely next tabs.
 *
 * @example
 * ```tsx
 * function TabContainer() {
 *   const { activeTab } = useTab()
 *   useTabPreload(activeTab)
 *   // ...
 * }
 * ```
 */
export function useTabPreload(
  activeTab: TabId,
  options: UseTabPreloadOptions = {}
): void {
  const { delay = 1000, enabled = true } = options
  const previousTabRef = useRef<TabId | null>(null)

  useEffect(() => {
    if (!enabled) return

    // Skip if same tab (no navigation occurred)
    if (previousTabRef.current === activeTab) return
    previousTabRef.current = activeTab

    // Mark current tab as preloaded (it's now loaded)
    preloadedChunks.add(activeTab)

    // Get adjacent tabs to preload
    const adjacentTabs = TAB_ADJACENCY[activeTab] || []
    const tabsToPreload = adjacentTabs.filter((tab) => !preloadedChunks.has(tab))

    if (tabsToPreload.length === 0) return

    // Preload after delay to let current tab render
    const timeoutId = setTimeout(() => {
      // Preload sequentially to avoid network congestion
      tabsToPreload.reduce(async (promise, tab) => {
        await promise
        await preloadTabChunk(tab)
      }, Promise.resolve())
    }, delay)

    return () => clearTimeout(timeoutId)
  }, [activeTab, delay, enabled])
}

// =============================================================================
// UTILITIES
// =============================================================================

/**
 * Manually preload specific tabs
 * Useful for preloading all critical tabs on app startup
 */
export async function preloadTabs(tabIds: TabId[]): Promise<void> {
  const tabsToPreload = tabIds.filter((tab) => !preloadedChunks.has(tab))
  await Promise.all(tabsToPreload.map(preloadTabChunk))
}

/**
 * Check if a tab's chunk has been preloaded
 */
export function isTabPreloaded(tabId: TabId): boolean {
  return preloadedChunks.has(tabId)
}

/**
 * Get list of all preloaded tabs
 */
export function getPreloadedTabs(): TabId[] {
  return Array.from(preloadedChunks)
}

/**
 * Clear preload tracking (for testing)
 */
export function clearPreloadTracking(): void {
  preloadedChunks.clear()
}

export default useTabPreload
