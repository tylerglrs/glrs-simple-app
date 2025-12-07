import { useMemo, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useResources as useResourcesQuery } from '@/hooks/useCollections'
import { useFirestoreQuery } from '@/hooks/useFirestoreQuery'
import { where, orderBy } from 'firebase/firestore'
import type { Resource } from '@/types/firebase'

// =============================================================================
// CATEGORY DEFINITIONS
// =============================================================================

export interface ResourceCategory {
  id: string
  name: string
  icon: string
  color: string
  description: string
}

export const RESOURCE_CATEGORIES: ResourceCategory[] = [
  {
    id: 'coping',
    name: 'Coping Skills',
    icon: 'Brain',
    color: 'emerald',
    description: 'Tools and techniques for managing stress and difficult emotions',
  },
  {
    id: 'relapse',
    name: 'Relapse Prevention',
    icon: 'Shield',
    color: 'amber',
    description: 'Strategies to recognize and avoid triggers',
  },
  {
    id: 'daily',
    name: 'Daily Tools',
    icon: 'CalendarCheck',
    color: 'blue',
    description: 'Resources for your daily recovery routine',
  },
  {
    id: 'education',
    name: 'Education',
    icon: 'BookOpen',
    color: 'purple',
    description: 'Learn about addiction, recovery, and mental health',
  },
  {
    id: 'support',
    name: 'Support',
    icon: 'Users',
    color: 'teal',
    description: 'Connect with support systems and community',
  },
  {
    id: 'life',
    name: 'Life Skills',
    icon: 'Sparkles',
    color: 'rose',
    description: 'Financial, career, and personal development resources',
  },
]

// =============================================================================
// TAB DEFINITIONS
// =============================================================================

export interface ResourceTab {
  id: string
  label: string
  icon: string
  description: string
}

export const RESOURCE_TABS: ResourceTab[] = [
  {
    id: 'library',
    label: 'My Library',
    icon: 'BookOpen',
    description: 'All your saved and assigned resources',
  },
  {
    id: 'work',
    label: 'Work & Career',
    icon: 'Briefcase',
    description: 'Employment and career development resources',
  },
  {
    id: 'wellness',
    label: 'Wellness',
    icon: 'Heart',
    description: 'Mental and physical health resources',
  },
  {
    id: 'relationships',
    label: 'Relationships',
    icon: 'Users',
    description: 'Building healthy relationships',
  },
  {
    id: 'crisis',
    label: 'Crisis Toolkit',
    icon: 'ShieldAlert',
    description: 'Immediate support and crisis resources',
  },
]

// =============================================================================
// RESOURCE TYPE DEFINITIONS
// =============================================================================

export type ResourceType = 'article' | 'video' | 'audio' | 'worksheet' | 'tool' | 'pdf' | 'link'
export type ProgressStatus = 'not_started' | 'in_progress' | 'completed'

export interface ResourceProgress {
  status: ProgressStatus
  progress?: number // 0-100
  updatedAt: Date
  completedAt?: Date
}

export interface ResourceWithProgress extends Resource {
  isAssigned?: boolean
  isNew?: boolean
  userProgress?: ResourceProgress
  userNotes?: string
}

// =============================================================================
// HOOK RETURN TYPE
// =============================================================================

export interface UseResourcesReturn {
  // Data
  resources: ResourceWithProgress[]
  assignedResources: ResourceWithProgress[]
  globalResources: ResourceWithProgress[]
  filteredResources: ResourceWithProgress[]

  // Counts
  totalCount: number
  categoryCounts: Record<string, number>

  // Filters
  selectedCategory: string | null
  setSelectedCategory: (category: string | null) => void
  selectedTab: string
  setSelectedTab: (tab: string) => void
  filterType: ResourceType | 'all'
  setFilterType: (type: ResourceType | 'all') => void
  filterStatus: ProgressStatus | 'all' | 'assigned'
  setFilterStatus: (status: ProgressStatus | 'all' | 'assigned') => void
  searchQuery: string
  setSearchQuery: (query: string) => void

  // Loading states
  isLoading: boolean
  error: Error | null

  // Categories and tabs
  categories: ResourceCategory[]
  tabs: ResourceTab[]
}

// =============================================================================
// MAIN HOOK
// =============================================================================

export function useResourcesData(): UseResourcesReturn {
  const { user, userData } = useAuth()
  const userId = user?.uid
  const tenantId = userData?.tenantId

  // Filter state
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedTab, setSelectedTab] = useState<string>('library')
  const [filterType, setFilterType] = useState<ResourceType | 'all'>('all')
  const [filterStatus, setFilterStatus] = useState<ProgressStatus | 'all' | 'assigned'>('all')
  const [searchQuery, setSearchQuery] = useState<string>('')

  // =============================================================================
  // FETCH ASSIGNED RESOURCES
  // =============================================================================

  const assignedConstraints = useMemo(() => {
    if (!userId) return []
    return [
      where('assignedTo', 'array-contains', userId),
      where('active', '==', true),
      orderBy('createdAt', 'desc'),
    ]
  }, [userId])

  const {
    data: assignedResourcesRaw,
    loading: assignedLoading,
    error: assignedError,
  } = useFirestoreQuery<Resource>('resources', assignedConstraints, {
    enabled: !!userId,
  })

  // =============================================================================
  // FETCH GLOBAL RESOURCES
  // =============================================================================

  const {
    data: globalResourcesRaw,
    loading: globalLoading,
    error: globalError,
  } = useResourcesQuery(tenantId, {
    enabled: !!tenantId,
  })

  // =============================================================================
  // MERGE AND DEDUPLICATE RESOURCES
  // =============================================================================

  const { resources, assignedResources, globalResources } = useMemo(() => {
    const resourceMap = new Map<string, ResourceWithProgress>()

    // Add assigned resources first (they take priority)
    assignedResourcesRaw.forEach((r) => {
      resourceMap.set(r.id, {
        ...r,
        isAssigned: true,
        isNew: false, // TODO: Check against lastViewDate
      })
    })

    // Add global resources (only if not already assigned)
    globalResourcesRaw.forEach((r) => {
      if (!resourceMap.has(r.id)) {
        resourceMap.set(r.id, {
          ...r,
          isAssigned: false,
          isNew: false,
        })
      }
    })

    const allResources = Array.from(resourceMap.values())
    const assigned = allResources.filter((r) => r.isAssigned)
    const global = allResources.filter((r) => !r.isAssigned)

    return {
      resources: allResources,
      assignedResources: assigned,
      globalResources: global,
    }
  }, [assignedResourcesRaw, globalResourcesRaw])

  // =============================================================================
  // CALCULATE CATEGORY COUNTS
  // =============================================================================

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    RESOURCE_CATEGORIES.forEach((cat) => {
      counts[cat.id] = resources.filter((r) => r.category === cat.id).length
    })
    return counts
  }, [resources])

  // =============================================================================
  // FILTER RESOURCES
  // =============================================================================

  const filteredResources = useMemo(() => {
    let filtered = [...resources]

    // Filter by tab
    if (selectedTab === 'library') {
      // My Library shows assigned + any in-progress/saved
      // For now, show all. Later can filter by user interaction
    } else if (selectedTab === 'work') {
      filtered = filtered.filter(
        (r) => r.category === 'life' || r.tags?.includes('career') || r.tags?.includes('work')
      )
    } else if (selectedTab === 'wellness') {
      filtered = filtered.filter(
        (r) => r.category === 'coping' || r.category === 'daily' || r.tags?.includes('wellness')
      )
    } else if (selectedTab === 'relationships') {
      filtered = filtered.filter(
        (r) => r.category === 'support' || r.tags?.includes('relationships')
      )
    } else if (selectedTab === 'crisis') {
      filtered = filtered.filter(
        (r) => r.category === 'relapse' || r.tags?.includes('crisis') || r.tags?.includes('emergency')
      )
    }

    // Filter by category
    if (selectedCategory) {
      filtered = filtered.filter((r) => r.category === selectedCategory)
    }

    // Filter by type
    if (filterType !== 'all') {
      filtered = filtered.filter((r) => r.type === filterType)
    }

    // Filter by status
    if (filterStatus === 'assigned') {
      filtered = filtered.filter((r) => r.isAssigned)
    } else if (filterStatus !== 'all') {
      filtered = filtered.filter((r) => r.userProgress?.status === filterStatus)
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (r) =>
          r.title.toLowerCase().includes(query) ||
          r.description?.toLowerCase().includes(query) ||
          r.category?.toLowerCase().includes(query) ||
          r.tags?.some((t) => t.toLowerCase().includes(query))
      )
    }

    return filtered
  }, [resources, selectedTab, selectedCategory, filterType, filterStatus, searchQuery])

  // =============================================================================
  // RETURN
  // =============================================================================

  return {
    // Data
    resources,
    assignedResources,
    globalResources,
    filteredResources,

    // Counts
    totalCount: resources.length,
    categoryCounts,

    // Filters
    selectedCategory,
    setSelectedCategory,
    selectedTab,
    setSelectedTab,
    filterType,
    setFilterType,
    filterStatus,
    setFilterStatus,
    searchQuery,
    setSearchQuery,

    // Loading states
    isLoading: assignedLoading || globalLoading,
    error: assignedError || globalError,

    // Categories and tabs
    categories: RESOURCE_CATEGORIES,
    tabs: RESOURCE_TABS,
  }
}

export default useResourcesData
