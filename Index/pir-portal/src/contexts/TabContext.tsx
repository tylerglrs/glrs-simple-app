/**
 * Tab Navigation Context
 *
 * Provides state-based tab switching for instant navigation without
 * component unmounting. All tabs stay mounted once loaded and are
 * shown/hidden via CSS display toggle.
 *
 * Key features:
 * - State-based tab switching (no route changes)
 * - Tracks which tabs have been loaded (lazy mounting)
 * - LRU (Least Recently Used) caching with max tab limit
 * - URL hash sync for bookmarking (#journey, #tasks, etc.)
 * - Preserves tab state across switches
 */

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  type ReactNode,
} from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

// =============================================================================
// TYPES
// =============================================================================

/**
 * Available tab identifiers
 */
export type TabId =
  | 'tasks'
  | 'journey'
  | 'meetings'
  | 'community'
  | 'resources'
  | 'messages'
  | 'profile'

/**
 * Tab metadata for navigation
 */
export interface TabInfo {
  id: TabId
  label: string
  hash: string
}

/**
 * Tab context value
 */
interface TabContextValue {
  /** Currently active tab */
  activeTab: TabId
  /** Set the active tab */
  setActiveTab: (tab: TabId) => void
  /** Set of tabs that have been loaded at least once */
  loadedTabs: Set<TabId>
  /** Check if a tab has been loaded */
  isTabLoaded: (tab: TabId) => boolean
  /** Navigate to a specific tab with optional hash update */
  navigateToTab: (tab: TabId, options?: { updateHash?: boolean }) => void
  /** Tab access order for LRU tracking (most recent first) */
  tabAccessOrder: TabId[]
  /** Check if a tab should be cached (within LRU limit) */
  isTabCached: (tab: TabId) => boolean
  /** Maximum cached tabs limit */
  maxCachedTabs: number
}

// =============================================================================
// CONSTANTS
// =============================================================================

/**
 * All available tabs with metadata
 */
export const TABS: TabInfo[] = [
  { id: 'tasks', label: 'Tasks', hash: '#tasks' },
  { id: 'journey', label: 'Journey', hash: '#journey' },
  { id: 'community', label: 'Connect', hash: '#community' },
  { id: 'meetings', label: 'Meetings', hash: '#meetings' },
  { id: 'resources', label: 'Guides', hash: '#resources' },
  { id: 'messages', label: 'Messages', hash: '#messages' },
  { id: 'profile', label: 'Profile', hash: '#profile' },
]

/**
 * Valid tab IDs for validation
 */
const VALID_TAB_IDS = new Set<TabId>(TABS.map((t) => t.id))

/**
 * Default tab to show
 */
const DEFAULT_TAB: TabId = 'tasks'

/**
 * Maximum number of tabs to keep cached in memory
 * Tabs beyond this limit will be evicted (LRU)
 */
const MAX_CACHED_TABS = 5

// =============================================================================
// CONTEXT
// =============================================================================

const TabContext = createContext<TabContextValue | null>(null)

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Parse tab from URL hash
 */
function getTabFromHash(hash: string): TabId | null {
  const tabId = hash.slice(1) as TabId // Remove # prefix
  return VALID_TAB_IDS.has(tabId) ? tabId : null
}

/**
 * Check if a path is an external profile view
 */
function isExternalProfilePath(pathname: string): boolean {
  // Match /profile/:userId where userId is present
  const match = pathname.match(/^\/profile\/([^/]+)$/)
  return !!match && match[1] !== ''
}

// =============================================================================
// PROVIDER
// =============================================================================

interface TabProviderProps {
  children: ReactNode
  /** Initial tab to display (defaults to 'tasks') */
  initialTab?: TabId
}

/**
 * Tab navigation provider
 *
 * Wraps the application and provides tab switching functionality.
 * Handles URL hash synchronization for deep linking.
 * Implements LRU caching to bound memory usage.
 */
export function TabProvider({ children, initialTab }: TabProviderProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const isInitialMount = useRef(true)

  // Determine initial tab from hash or prop
  const getInitialTab = useCallback((): TabId => {
    // Check URL hash first
    const hashTab = getTabFromHash(location.hash)
    if (hashTab) return hashTab

    // Use provided initial tab or default
    return initialTab || DEFAULT_TAB
  }, [location.hash, initialTab])

  // Active tab state
  const [activeTab, setActiveTabState] = useState<TabId>(getInitialTab)

  // Track which tabs have been loaded (for lazy mounting)
  const [loadedTabs, setLoadedTabs] = useState<Set<TabId>>(
    () => new Set([getInitialTab()])
  )

  // LRU tracking: array of tab IDs in access order (most recent first)
  const [tabAccessOrder, setTabAccessOrder] = useState<TabId[]>(() => [
    getInitialTab(),
  ])

  /**
   * Update LRU access order when a tab is accessed
   */
  const updateAccessOrder = useCallback((tab: TabId) => {
    setTabAccessOrder((prev) => {
      // Remove tab from current position (if exists)
      const filtered = prev.filter((t) => t !== tab)
      // Add to front (most recently accessed)
      const updated = [tab, ...filtered]
      // Keep within limit
      return updated.slice(0, MAX_CACHED_TABS)
    })
  }, [])

  // Handle URL hash changes (browser back/forward, direct links)
  useEffect(() => {
    const hashTab = getTabFromHash(location.hash)
    if (hashTab && hashTab !== activeTab) {
      setActiveTabState(hashTab)
      setLoadedTabs((prev) => new Set([...prev, hashTab]))
      updateAccessOrder(hashTab)
    }
  }, [location.hash, activeTab, updateAccessOrder])

  // Set initial hash if not present
  useEffect(() => {
    if (!isInitialMount.current) return
    isInitialMount.current = false

    // Don't set hash if we're on an external profile path
    if (isExternalProfilePath(location.pathname)) return

    // Set hash to current tab if no hash present
    if (!location.hash && location.pathname === '/') {
      navigate(`#${activeTab}`, { replace: true })
    }
  }, [location.pathname, location.hash, activeTab, navigate])

  /**
   * Navigate to a tab and update URL hash
   */
  const navigateToTab = useCallback(
    (tab: TabId, options: { updateHash?: boolean } = { updateHash: true }) => {
      setActiveTabState(tab)
      setLoadedTabs((prev) => new Set([...prev, tab]))
      updateAccessOrder(tab)

      if (options.updateHash) {
        navigate(`/#${tab}`, { replace: true })
      }
    },
    [navigate, updateAccessOrder]
  )

  /**
   * Set active tab (updates hash by default)
   */
  const setActiveTab = useCallback(
    (tab: TabId) => {
      navigateToTab(tab, { updateHash: true })
    },
    [navigateToTab]
  )

  /**
   * Check if a tab has been loaded
   */
  const isTabLoaded = useCallback(
    (tab: TabId): boolean => {
      return loadedTabs.has(tab)
    },
    [loadedTabs]
  )

  /**
   * Check if a tab should be cached (within LRU limit)
   * Only tabs in the access order should be cached
   */
  const isTabCached = useCallback(
    (tab: TabId): boolean => {
      return tabAccessOrder.includes(tab)
    },
    [tabAccessOrder]
  )

  const value: TabContextValue = {
    activeTab,
    setActiveTab,
    loadedTabs,
    isTabLoaded,
    navigateToTab,
    tabAccessOrder,
    isTabCached,
    maxCachedTabs: MAX_CACHED_TABS,
  }

  return <TabContext.Provider value={value}>{children}</TabContext.Provider>
}

// =============================================================================
// HOOK
// =============================================================================

/**
 * Hook to access tab navigation context
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { activeTab, setActiveTab } = useTab()
 *
 *   return (
 *     <button onClick={() => setActiveTab('journey')}>
 *       Go to Journey
 *     </button>
 *   )
 * }
 * ```
 */
export function useTab(): TabContextValue {
  const context = useContext(TabContext)
  if (!context) {
    throw new Error('useTab must be used within a TabProvider')
  }
  return context
}

/**
 * Hook to check if current context is within TabProvider
 */
export function useTabOptional(): TabContextValue | null {
  return useContext(TabContext)
}

export { TabContext }
