import { cn } from '@/lib/utils'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { SettingsItem } from './SettingsItem'
import type { SettingsSectionConfig, ProfileModalType } from '../types'

// =============================================================================
// FEATURE FLAGS
// =============================================================================
// Temporarily disable 2FA until user base grows
// Set to true to re-enable 2FA functionality
const FEATURES = {
  twoFactorAuth: false, // DISABLED - Will re-enable when user base grows
}

// ============================================================
// SETTINGS CONFIGURATIONS
// ============================================================

/**
 * Configure all settings sections with their items
 * Organized into 5 groups per Part 9A requirements
 */
export function getSettingsSections(
  options: {
    googleConnected?: boolean
    appleConnected?: boolean
    profileCompletion?: number
  } = {}
): SettingsSectionConfig[] {
  return [
    // ============================
    // 1. ACCOUNT SECTION
    // ============================
    {
      id: 'account',
      title: 'Account',
      items: [
        {
          id: 'personalInfo',
          label: 'Personal Info',
          description: 'Name, email, phone, address',
          icon: 'User',
          iconBgColor: 'linear-gradient(135deg, #4A90E2 0%, #357ABD 100%)',
          modalId: 'personalInfo',
        },
        {
          id: 'recoveryInfo',
          label: 'Recovery',
          description: 'Sobriety date, substances, daily cost',
          icon: 'Heart',
          iconBgColor: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          modalId: 'recoveryInfo',
        },
        {
          id: 'emergencyContacts',
          label: 'Coach & Emergency',
          description: 'Assigned coach, emergency contacts',
          icon: 'Users',
          iconBgColor: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
          modalId: 'emergencyContacts',
        },
        {
          id: 'password',
          label: 'Password',
          description: 'Change your password',
          icon: 'Lock',
          iconBgColor: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
          modalId: 'passwordChange',
        },
      ],
    },

    // ============================
    // 2. NOTIFICATIONS & CALENDAR
    // ============================
    {
      id: 'notifications',
      title: 'Notifications & Calendar',
      items: [
        {
          id: 'notificationSettings',
          label: 'Notifications',
          description: 'Alerts, reminders, quiet hours',
          icon: 'Bell',
          iconBgColor: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
          modalId: 'notificationSettings',
        },
        {
          id: 'googleCalendar',
          label: 'Google Calendar',
          description: options.googleConnected
            ? 'Connected'
            : 'Sync events with Google Calendar',
          icon: 'Calendar',
          iconBgColor: 'linear-gradient(135deg, #058585 0%, #047272 100%)',
          modalId: 'googleCalendar',
          badge: options.googleConnected ? 'Connected' : undefined,
          badgeColor: 'success',
        },
        {
          id: 'appleCalendar',
          label: 'Apple Calendar',
          description: options.appleConnected
            ? 'Connected'
            : 'Sync events with iCloud Calendar',
          icon: 'Calendar',
          iconBgColor: 'linear-gradient(135deg, #000000 0%, #434343 100%)',
          modalId: 'appleCalendar',
          badge: options.appleConnected ? 'Connected' : undefined,
          badgeColor: 'success',
        },
      ],
    },

    // ============================
    // 3. SECURITY
    // ============================
    {
      id: 'privacy',
      title: 'Security',
      items: [
        {
          id: 'sessionManagement',
          label: 'Active Sessions',
          description: 'Manage devices logged into your account',
          icon: 'Monitor',
          iconBgColor: 'linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)',
          modalId: 'sessionManagement',
        },
        {
          id: 'twoFactorSettings',
          label: 'Two-Factor Auth',
          description: FEATURES.twoFactorAuth
            ? 'Add extra security to your account'
            : 'Enhanced security features coming soon',
          icon: 'Shield',
          iconBgColor: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
          modalId: FEATURES.twoFactorAuth ? 'twoFactorSettings' : undefined,
          badge: FEATURES.twoFactorAuth ? undefined : 'Coming Soon',
          badgeColor: 'warning' as const,
          disabled: !FEATURES.twoFactorAuth,
        },
        {
          id: 'privacySettings',
          label: 'Privacy',
          description: 'Visibility, data sharing, blocked users',
          icon: 'Lock',
          iconBgColor: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
          modalId: 'privacySettings',
        },
        {
          id: 'profileVisibility',
          label: 'Profile Visibility',
          description: 'Control what others see',
          icon: 'Eye',
          iconBgColor: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
          modalId: 'profileVisibility',
        },
        {
          id: 'dataManagement',
          label: 'Data & Account',
          description: 'Export data, cache, account info',
          icon: 'Download',
          iconBgColor: 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
          modalId: 'dataManagement',
        },
      ],
    },

    // ============================
    // 4. EDUCATION & GOALS
    // ============================
    {
      id: 'education',
      title: 'Education & Goals',
      items: [
        {
          id: 'educationInfo',
          label: 'Education',
          description: 'Education level and background',
          icon: 'GraduationCap',
          iconBgColor: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
          modalId: 'educationInfo',
        },
      ],
    },

    // ============================
    // 5. SUPPORT
    // ============================
    {
      id: 'support',
      title: 'Support',
      items: [
        {
          id: 'help',
          label: 'Help & FAQ',
          description: 'Get help using the app',
          icon: 'HelpCircle',
          iconBgColor: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
          modalId: 'help',
        },
        {
          id: 'feedback',
          label: 'Send Feedback',
          description: 'Report issues or suggest features',
          icon: 'MessageSquare',
          iconBgColor: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
          modalId: 'feedback',
        },
      ],
    },

    // ============================
    // 5. DANGER ZONE
    // ============================
    {
      id: 'dangerZone',
      title: 'Danger Zone',
      items: [
        {
          id: 'deleteAccount',
          label: 'Delete Account',
          description: 'Permanently delete your account and data',
          icon: 'Trash2',
          iconBgColor: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
          modalId: 'deleteAccount',
        },
      ],
    },
  ]
}

// ============================================================
// SETTINGS SECTION COMPONENT
// ============================================================

interface SettingsSectionComponentProps {
  /** Section configuration */
  section: SettingsSectionConfig
  /** Handler for item click */
  onItemClick: (modalId: ProfileModalType) => void
}

function SettingsSection({ section, onItemClick }: SettingsSectionComponentProps) {
  const isMobile = useMediaQuery('(max-width: 768px)')

  return (
    <div className="px-4 py-4 md:px-5 md:py-5">
      {/* Section Title */}
      <h2
        className={cn(
          'text-xl font-bold uppercase tracking-wide mb-4',
          'text-amber-400 drop-shadow-sm'
        )}
      >
        {section.title}
      </h2>

      {/* Items */}
      <div className="flex flex-col gap-3 md:gap-4">
        {section.items.map((item) => (
          <SettingsItem
            key={item.id}
            item={item}
            onClick={() => {
              if (item.modalId) {
                onItemClick(item.modalId as ProfileModalType)
              } else if (item.onClick) {
                item.onClick()
              }
            }}
            isMobile={isMobile}
          />
        ))}
      </div>
    </div>
  )
}

// ============================================================
// MAIN COMPONENT
// ============================================================

interface SettingsSectionsProps {
  /** Handler for opening modals */
  onOpenModal: (modalId: ProfileModalType) => void
  /** Google calendar connected */
  googleConnected?: boolean
  /** Apple calendar connected */
  appleConnected?: boolean
  /** Profile completion percentage */
  profileCompletion?: number
}

/**
 * Renders all 5 settings sections
 * Account | Notifications & Calendar | Privacy & Data | Support | Danger Zone
 */
export function SettingsSections({
  onOpenModal,
  googleConnected = false,
  appleConnected = false,
  profileCompletion = 0,
}: SettingsSectionsProps) {
  const sections = getSettingsSections({
    googleConnected,
    appleConnected,
    profileCompletion,
  })

  return (
    <div className="flex flex-col">
      {sections.map((section) => (
        <SettingsSection
          key={section.id}
          section={section}
          onItemClick={onOpenModal}
        />
      ))}
    </div>
  )
}

export default SettingsSections
