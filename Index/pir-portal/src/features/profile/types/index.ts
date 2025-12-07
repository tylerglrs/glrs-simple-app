import type { Timestamp } from 'firebase/firestore'

// ============================================================
// PROFILE SETTINGS TYPES
// ============================================================

export interface ProfileStats {
  /** Check-in rate (0-100%) */
  checkInRate: number
  /** Task completion rate (0-100%) */
  taskCompletionRate: number
  /** Current check-in streak (days) */
  currentStreak: number
  /** Average mood score (1-10) */
  avgMood: number
  /** Days since account creation */
  daysActive: number
  /** Profile completion percentage */
  profileCompletion: number
}

export interface ReflectionStreakData {
  currentStreak: number
  longestStreak: number
  allStreaks: Array<{
    length: number
    startDate: string
    endDate: string
  }>
}

export interface EmergencyContact {
  name: string
  phone: string
  relationship?: string
  isPrimary?: boolean
}

export interface NotificationSettings {
  /** Enable push notifications */
  pushEnabled?: boolean
  /** Enable email notifications */
  emailEnabled?: boolean
  /** Morning check-in reminder */
  morningReminder?: boolean
  /** Morning reminder time (e.g., "08:00") */
  morningReminderTime?: string
  /** Evening reflection reminder */
  eveningReminder?: boolean
  /** Evening reminder time (e.g., "20:00") */
  eveningReminderTime?: string
  /** Quiet hours enabled */
  quietHoursEnabled?: boolean
  /** Quiet hours start time */
  quietHoursStart?: string
  /** Quiet hours end time */
  quietHoursEnd?: string
  /** Coach messages notifications */
  coachMessages?: boolean
  /** Assignment reminders */
  assignmentReminders?: boolean
  /** Milestone achievements */
  milestoneAlerts?: boolean
  /** Community updates */
  communityUpdates?: boolean
}

export interface PrivacySettings {
  /** Profile visibility */
  profileVisibility?: 'public' | 'coach-only' | 'private'
  /** Show online status */
  showOnlineStatus?: boolean
  /** Show activity status */
  showActivityStatus?: boolean
  /** Allow messages from community */
  allowCommunityMessages?: boolean
  /** Share progress with community */
  shareProgress?: boolean
}

export interface CalendarConnection {
  connected: boolean
  email?: string
  lastSyncedAt?: Timestamp
  syncEnabled?: boolean
  calendarId?: string
}

export interface CoachInfo {
  id: string
  firstName?: string
  lastName?: string
  displayName?: string
  email?: string
  phone?: string
  profileImageUrl?: string
}

// ============================================================
// SETTINGS SECTION TYPES
// ============================================================

export type SettingsSectionId =
  | 'account'
  | 'notifications'
  | 'privacy'
  | 'support'
  | 'dangerZone'

export interface SettingsItemConfig {
  id: string
  label: string
  description?: string
  icon: string
  iconColor?: string
  iconBgColor?: string
  modalId?: string
  onClick?: () => void
  badge?: string | number
  badgeColor?: 'primary' | 'success' | 'warning' | 'destructive'
  showChevron?: boolean
  disabled?: boolean
}

export interface SettingsSectionConfig {
  id: SettingsSectionId
  title: string
  items: SettingsItemConfig[]
}

// ============================================================
// MODAL TYPES
// ============================================================

export type ProfileModalType =
  // Account modals
  | 'personalInfo'
  | 'recoveryInfo'
  | 'emergencyContacts'
  | 'passwordChange'
  // Notifications & Calendar modals
  | 'notificationSettings'
  | 'googleCalendar'
  | 'appleCalendar'
  // Privacy & Data modals
  | 'privacySettings'
  | 'profileVisibility'
  | 'dataManagement'
  | 'exportData'
  | 'accountActivity'
  // Support modals
  | 'help'
  | 'feedback'
  // Danger Zone modals
  | 'deleteAccount'

// ============================================================
// HOOK RETURN TYPES
// ============================================================

export interface UseProfileDataReturn {
  /** Profile statistics */
  stats: ProfileStats
  /** Reflection streak data */
  streakData: ReflectionStreakData
  /** Coach information */
  coachInfo: CoachInfo | null
  /** Google calendar connection status */
  googleConnected: boolean
  /** Apple calendar connection status */
  appleConnected: boolean
  /** Loading state */
  loading: boolean
  /** Error message */
  error: string | null
  /** Refresh stats */
  refreshStats: () => Promise<void>
}

// ============================================================
// COMPONENT PROP TYPES
// ============================================================

export interface ProfileHeaderProps {
  /** User data from auth context */
  userData: {
    firstName?: string
    lastName?: string
    displayName?: string
    email?: string
    profileImageUrl?: string
    sobrietyDate?: string
  } | null
  /** Coach info */
  coachInfo: CoachInfo | null
  /** Google calendar connected */
  googleConnected: boolean
  /** Profile completion percentage */
  profileCompletion: number
  /** Handler for avatar change */
  onAvatarChange: (file: File) => Promise<void>
  /** Handler for edit profile */
  onEditProfile?: () => void
  /** Whether avatar is currently uploading */
  uploadingAvatar?: boolean
}

export interface StatsGridProps {
  /** Profile statistics */
  stats: ProfileStats
  /** Reflection streak data */
  streakData: ReflectionStreakData
  /** Loading state */
  loading?: boolean
}

export interface SettingsSectionProps {
  /** Section configuration */
  section: SettingsSectionConfig
  /** Handler for item click */
  onItemClick: (itemId: string, modalId?: string) => void
}

export interface SettingsItemProps {
  /** Item configuration */
  item: SettingsItemConfig
  /** Handler for click */
  onClick: () => void
}
