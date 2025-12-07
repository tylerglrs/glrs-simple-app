// ============================================================
// PROFILE FEATURE - EXPORTS
// ============================================================

// Main Tab Component (replaces placeholder)
export { ProfileTab } from './components/ProfileTab'
export { ProfileTab as default } from './components/ProfileTab'

// View Components
export { UserProfileView } from './components/UserProfileView'
export { ProfileHeader } from './components/ProfileHeader'
export { StatsGrid } from './components/StatsGrid'
export { SettingsSections, getSettingsSections } from './components/SettingsSections'
export { SettingsItem } from './components/SettingsItem'

// Hooks
export { useProfileData } from './hooks/useProfileData'
export {
  useUserProfile,
  calculateDaysSober,
  formatMemberSince,
  getInitials,
  getDisplayName,
  getProfilePicture,
} from './hooks/useUserProfile'

// Types
export type {
  ProfileStats,
  ReflectionStreakData,
  EmergencyContact,
  NotificationSettings,
  PrivacySettings,
  CalendarConnection,
  CoachInfo,
  SettingsSectionId,
  SettingsItemConfig,
  SettingsSectionConfig,
  ProfileModalType,
  UseProfileDataReturn,
  ProfileHeaderProps,
  StatsGridProps,
  SettingsSectionProps,
  SettingsItemProps,
} from './types'

export type { UserProfile, ProfileVisibility } from './hooks/useUserProfile'
