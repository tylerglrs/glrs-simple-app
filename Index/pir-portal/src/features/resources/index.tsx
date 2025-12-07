// Resources feature barrel export
export { ResourcesTab } from './components/ResourcesTab'
export { ResourceCard } from './components/ResourceCard'
export { ResourceList } from './components/ResourceList'
export { CategoryGrid } from './components/CategoryGrid'
export { useResourcesData, RESOURCE_CATEGORIES, RESOURCE_TABS } from './hooks/useResources'
export type {
  ResourceCategory,
  ResourceTab,
  ResourceType,
  ProgressStatus,
  ResourceProgress,
  ResourceWithProgress,
  UseResourcesReturn,
} from './hooks/useResources'

// Default export for lazy loading
export { ResourcesTab as default } from './components/ResourcesTab'
