// ============================================================
// MEETINGS HOOKS - BARREL EXPORT
// ============================================================

// Main unified hook
export { useMeetings } from './useMeetings'
export type { UseMeetingsOptions, UseMeetingsCombinedReturn } from './useMeetings'

// Filter hook
export { useMeetingFilters } from './useMeetingFilters'

// Data source hooks
export { useExternalMeetings, useExternalMeetingsStatic } from './useExternalMeetings'
export { useSavedMeetings, useMeetingRecommendations } from './useSavedMeetings'
export { useUserMeetings } from './useUserMeetings'
export type { UseUserMeetingsReturn } from './useUserMeetings'

// Geolocation hook and utilities
export {
  useGeolocation,
  calculateDistance,
  formatDistance,
  addDistanceToMeetings,
  sortByDistance,
} from './useGeolocation'

// Search history hook
export { useSearchHistory } from './useSearchHistory'
export type { UseSearchHistoryReturn } from './useSearchHistory'

// Re-export types used by hooks
export type {
  UseMeetingFiltersReturn,
  UseMeetingsReturn,
  UseExternalMeetingsReturn,
  UseSavedMeetingsReturn,
  UseGeolocationReturn,
  Meeting,
  ScheduledMeeting,
  SavedMeeting,
  MeetingFilters,
  UserLocation,
  LocationPermissionStatus,
} from '../types'
