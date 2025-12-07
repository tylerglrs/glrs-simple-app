// =============================================================================
// BEACON HUB - Main exports
// Beacon tracks your patterns and guides you in the right direction
// =============================================================================

// Main component
export { BeaconHub, AIInsightsHub } from './BeaconHub'

// Data hook
export { useAIInsightsData } from './useAIInsightsData'
export type { AIInsightsData, AIInsightsDataState } from './useAIInsightsData'

// Types
export * from './types'

// Tab exports (2 tabs: Patterns, Reflect)
export {
  PatternsTabPlaceholder,
  ReflectionsTabPlaceholder,
} from './tabs'

// Legacy exports for backward compatibility
export { HabitsTabPlaceholder, GoalsTabPlaceholder } from './tabs'
