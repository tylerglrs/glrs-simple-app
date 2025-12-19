import { lazy, Suspense, type LazyExoticComponent, type ComponentType } from 'react'
import { useModalStore, type ModalName } from '@/stores/modalStore'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'

// Actual modal imports (as they are implemented)
import { ResourceViewerModal } from '@/features/resources/modals/ResourceViewerModal'
import { ImageLightboxModal } from '@/features/messages/modals/ImageLightboxModal'
import { NewConversationModal } from '@/features/messages/modals/NewConversationModal'
import { GroupDetailsModal } from '@/features/community/modals/GroupDetailsModal'
import { ImagePreviewModal } from '@/features/community/modals/ImagePreviewModal'

// Profile modals - Part 9B
import { PersonalInfoModal } from '@/features/profile/modals/PersonalInfoModal'
import { RecoveryInfoModal } from '@/features/profile/modals/RecoveryInfoModal'
import { EducationInfoModal } from '@/features/profile/modals/EducationInfoModal'
import { EmergencyContactsModal } from '@/features/profile/modals/EmergencyContactsModal'
import { PasswordChangeModal } from '@/features/profile/modals/PasswordChangeModal'
import { NotificationSettingsModal } from '@/features/profile/modals/NotificationSettingsModal'
import { PrivacySettingsModal } from '@/features/profile/modals/PrivacySettingsModal'
import { ProfileVisibilityModal } from '@/features/profile/modals/ProfileVisibilityModal'
import { DataManagementModal } from '@/features/profile/modals/DataManagementModal'
import { ExportModal } from '@/features/profile/modals/ExportModal'
import { AccountActivityModal } from '@/features/profile/modals/AccountActivityModal'

// Profile modals - Part 9C
import { GoogleCalendarModal } from '@/features/profile/modals/GoogleCalendarModal'
import { AppleCalendarModal } from '@/features/profile/modals/AppleCalendarModal'
import { HelpModal } from '@/features/profile/modals/HelpModal'
import { FeedbackModal } from '@/features/profile/modals/FeedbackModal'
import { DeleteAccountModal } from '@/features/profile/modals/DeleteAccountModal'
import { PasswordModal } from '@/features/profile/modals/PasswordModal'

// Profile modals - Security
import { SessionManagementModal } from '@/features/profile/modals/SessionManagementModal'
import { TwoFactorSettingsModal } from '@/features/profile/modals/TwoFactorSettingsModal'

// Tasks modals - Part 10C: Stats modals
import { StatsModal } from '@/features/tasks/modals/StatsModal'
import { CheckRateModal } from '@/features/tasks/modals/CheckRateModal'
import { CheckInsModal } from '@/features/tasks/modals/CheckInsModal'
import { AvgMoodModal } from '@/features/tasks/modals/AvgMoodModal'
import { GoalProgressModal } from '@/features/tasks/modals/GoalProgressModal'
import { WinsModal } from '@/features/tasks/modals/WinsModal'
import { SnapshotModal } from '@/features/tasks/modals/SnapshotModal'

// Tasks modals - Part 10C: History modals
import { AllReflectionsModal } from '@/features/tasks/modals/AllReflectionsModal'
import { ChallengesHistoryModal } from '@/features/tasks/modals/ChallengesHistoryModal'
import { HabitHistoryModal } from '@/features/tasks/modals/HabitHistoryModal'
import { ReflectionHistoryModal } from '@/features/tasks/modals/ReflectionHistoryModal'
import { WinsHistoryModal } from '@/features/tasks/modals/WinsHistoryModal'

// Tasks modals - Part 10C: Task modals
import { ThisWeekModal } from '@/features/tasks/modals/ThisWeekModal'
import { OverdueModal } from '@/features/tasks/modals/OverdueModal'
import { CompleteModal } from '@/features/tasks/modals/CompleteModal'
import { HabitModal } from '@/features/tasks/modals/HabitModal'
import { ManageHabitsModal } from '@/features/tasks/modals/ManageHabitsModal'
import { ReflectionModal } from '@/features/tasks/modals/ReflectionModal'

// Tasks modals - Part 10C: Action modals
import { ShareGoalModal } from '@/features/tasks/modals/ShareGoalModal'
import { IntentionsModal } from '@/features/tasks/modals/IntentionsModal'
import { PastIntentionsModal } from '@/features/tasks/modals/PastIntentionsModal'
import { PatternModal } from '@/features/tasks/modals/PatternModal'
import { TipsModal } from '@/features/tasks/modals/TipsModal'

// Tasks modals - Part 10C: Additional modals
import { StreaksModal } from '@/features/tasks/modals/StreaksModal'
import { ReflectionStreaksModal } from '@/features/tasks/modals/ReflectionStreaksModal'

// Tasks modals - Part 10D: Core modals
import { CopingTechniqueModal } from '@/features/tasks/modals/CopingTechniqueModal'
import { MilestoneModal } from '@/features/tasks/modals/MilestoneModal'
import { PastReflectionsModal } from '@/features/tasks/modals/PastReflectionsModal'
import { GratitudeModal } from '@/features/tasks/modals/GratitudeModal'
import { GratitudeJournalModal } from '@/features/tasks/modals/GratitudeJournalModal'
import { MorningCheckinModal } from '@/features/tasks/modals/MorningCheckinModal'
import { EveningReflectionModal } from '@/features/tasks/modals/EveningReflectionModal'
import { DailyOverviewModal } from '@/features/tasks/modals/DailyOverviewModal'
import { SidebarModal } from '@/features/tasks/modals/SidebarModal'
import { CopingHistoryModal } from '@/features/tasks/modals/CopingHistoryModal'
import { CrisisModal } from '@/features/tasks/modals/CrisisModal'

// AIInsightsHub removed - now a dedicated page route at /insights

// =============================================================================
// PLACEHOLDER MODAL - Used until actual modals are implemented
// =============================================================================

interface PlaceholderModalProps {
  modalName: string
  onClose: () => void
}

function PlaceholderModal({ modalName, onClose }: PlaceholderModalProps) {
  return (
    <DialogContent className="sm:max-w-md">
      <div className="p-6 text-center space-y-4">
        <h2 className="text-lg font-semibold text-primary">
          {modalName.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase())}
        </h2>
        <p className="text-sm text-muted-foreground">
          This modal will be implemented in a later phase.
        </p>
        <button
          onClick={onClose}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        >
          Close
        </button>
      </div>
    </DialogContent>
  )
}

// =============================================================================
// LAZY MODAL IMPORTS - Will be replaced with actual components during migration
// =============================================================================

// Type for modal components
type ModalComponent = LazyExoticComponent<ComponentType<{ onClose: () => void }>>

// Registry of lazy-loaded modal components
// Initially all point to placeholder, will be replaced as modals are built
const createPlaceholder = (name: string): ModalComponent =>
  lazy(() =>
    Promise.resolve({
      default: ({ onClose }: { onClose: () => void }) => (
        <PlaceholderModal modalName={name} onClose={onClose} />
      ),
    })
  )

// =============================================================================
// JOURNEY MODALS
// =============================================================================

const JourneyLifeModals: Partial<Record<ModalName, ModalComponent>> = {
  gratitudeThemes: createPlaceholder('gratitudeThemes'),
  gratitudeJournal: lazy(() =>
    Promise.resolve({
      default: ({ onClose }: { onClose: () => void }) => <GratitudeJournalModal onClose={onClose} />,
    })
  ),
  challenges: createPlaceholder('challenges'),
  breakthrough: createPlaceholder('breakthrough'),
  streak: lazy(() =>
    Promise.resolve({
      default: ({ onClose }: { onClose: () => void }) => <StreaksModal onClose={onClose} />,
    })
  ),
  reflectionStreak: createPlaceholder('reflectionStreak'),
  streaks: lazy(() =>
    Promise.resolve({
      default: ({ onClose }: { onClose: () => void }) => <StreaksModal onClose={onClose} />,
    })
  ),
  reflectionStreaks: lazy(() =>
    Promise.resolve({
      default: ({ onClose }: { onClose: () => void }) => <ReflectionStreaksModal onClose={onClose} />,
    })
  ),
  addCountdown: createPlaceholder('addCountdown'),
}

const JourneyWellnessModals: Partial<Record<ModalName, ModalComponent>> = {
  calendarHeatmap: createPlaceholder('calendarHeatmap'),
  journeyCalendar: createPlaceholder('journeyCalendar'),
  weeklyReport: createPlaceholder('weeklyReport'),
  moodInsights: createPlaceholder('moodInsights'),
  overallDayInsights: createPlaceholder('overallDayInsights'),
  graphSettings: createPlaceholder('graphSettings'),
}

const JourneyFinancesModals: Partial<Record<ModalName, ModalComponent>> = {
  addSavingsGoal: createPlaceholder('addSavingsGoal'),
  editSavingsGoal: createPlaceholder('editSavingsGoal'),
  jarTransaction: createPlaceholder('jarTransaction'),
  savingsHistory: createPlaceholder('savingsHistory'),
  financeCountdown: createPlaceholder('financeCountdown'),
}

// =============================================================================
// TASKS MODALS
// =============================================================================

const TasksSidebarModals: Partial<Record<ModalName, ModalComponent>> = {
  // Task modals - implemented
  habit: lazy(() =>
    Promise.resolve({
      default: ({ onClose }: { onClose: () => void }) => <HabitModal onClose={onClose} />,
    })
  ),
  manageHabits: lazy(() =>
    Promise.resolve({
      default: ({ onClose }: { onClose: () => void }) => <ManageHabitsModal onClose={onClose} />,
    })
  ),
  editHabit: createPlaceholder('editHabit'),
  habitHistory: lazy(() =>
    Promise.resolve({
      default: ({ onClose }: { onClose: () => void }) => <HabitHistoryModal onClose={onClose} />,
    })
  ),
  reflection: lazy(() =>
    Promise.resolve({
      default: ({ onClose }: { onClose: () => void }) => <ReflectionModal onClose={onClose} />,
    })
  ),
  reflectionHistory: lazy(() =>
    Promise.resolve({
      default: ({ onClose }: { onClose: () => void }) => <ReflectionHistoryModal onClose={onClose} />,
    })
  ),
  thisWeek: lazy(() =>
    Promise.resolve({
      default: ({ onClose }: { onClose: () => void }) => <ThisWeekModal onClose={onClose} />,
    })
  ),
  overdue: lazy(() =>
    Promise.resolve({
      default: ({ onClose }: { onClose: () => void }) => <OverdueModal onClose={onClose} />,
    })
  ),
  complete: lazy(() =>
    Promise.resolve({
      default: ({ onClose }: { onClose: () => void }) => <CompleteModal onClose={onClose} />,
    })
  ),
  // Stats modals - implemented
  stats: lazy(() =>
    Promise.resolve({
      default: ({ onClose }: { onClose: () => void }) => <StatsModal onClose={onClose} />,
    })
  ),
  goalProgress: lazy(() =>
    Promise.resolve({
      default: ({ onClose }: { onClose: () => void }) => <GoalProgressModal onClose={onClose} />,
    })
  ),
  wins: lazy(() =>
    Promise.resolve({
      default: ({ onClose }: { onClose: () => void }) => <WinsModal onClose={onClose} />,
    })
  ),
  winsHistory: lazy(() =>
    Promise.resolve({
      default: ({ onClose }: { onClose: () => void }) => <WinsHistoryModal onClose={onClose} />,
    })
  ),
  checkRate: lazy(() =>
    Promise.resolve({
      default: ({ onClose }: { onClose: () => void }) => <CheckRateModal onClose={onClose} />,
    })
  ),
  checkIns: lazy(() =>
    Promise.resolve({
      default: ({ onClose }: { onClose: () => void }) => <CheckInsModal onClose={onClose} />,
    })
  ),
  avgMood: lazy(() =>
    Promise.resolve({
      default: ({ onClose }: { onClose: () => void }) => <AvgMoodModal onClose={onClose} />,
    })
  ),
  // History modals - implemented
  allReflections: lazy(() =>
    Promise.resolve({
      default: ({ onClose }: { onClose: () => void }) => <AllReflectionsModal onClose={onClose} />,
    })
  ),
  challengesHistory: lazy(() =>
    Promise.resolve({
      default: ({ onClose }: { onClose: () => void }) => <ChallengesHistoryModal onClose={onClose} />,
    })
  ),
  // Action modals - implemented
  shareGoal: lazy(() =>
    Promise.resolve({
      default: ({ onClose }: { onClose: () => void }) => <ShareGoalModal onClose={onClose} />,
    })
  ),
  intentions: lazy(() =>
    Promise.resolve({
      default: ({ onClose }: { onClose: () => void }) => <IntentionsModal onClose={onClose} />,
    })
  ),
  pastIntentions: lazy(() =>
    Promise.resolve({
      default: ({ onClose }: { onClose: () => void }) => <PastIntentionsModal onClose={onClose} />,
    })
  ),
  snapshot: lazy(() =>
    Promise.resolve({
      default: ({ onClose }: { onClose: () => void }) => <SnapshotModal onClose={onClose} />,
    })
  ),
  quickReflection: lazy(() =>
    Promise.resolve({
      default: ({ onClose }: { onClose: () => void }) => <ReflectionModal onClose={onClose} />,
    })
  ),
  addWin: lazy(() =>
    Promise.resolve({
      default: ({ onClose }: { onClose: () => void }) => <WinsModal onClose={onClose} />,
    })
  ),
  viewGoal: createPlaceholder('viewGoal'),
  editGoal: createPlaceholder('editGoal'),
}

const TasksPatternModals: Partial<Record<ModalName, ModalComponent>> = {
  // Unified Pattern Modal with tabs (new consolidated approach)
  patterns: lazy(() =>
    Promise.resolve({
      default: ({ onClose }: { onClose: () => void }) => <PatternModal onClose={onClose} />,
    })
  ),
  // Individual pattern modals - now redirect to unified modal with initialTab
  moodPattern: lazy(() =>
    Promise.resolve({
      default: ({ onClose }: { onClose: () => void }) => <PatternModal initialTab="mood" onClose={onClose} />,
    })
  ),
  cravingPattern: lazy(() =>
    Promise.resolve({
      default: ({ onClose }: { onClose: () => void }) => <PatternModal initialTab="craving" onClose={onClose} />,
    })
  ),
  anxietyPattern: lazy(() =>
    Promise.resolve({
      default: ({ onClose }: { onClose: () => void }) => <PatternModal initialTab="anxiety" onClose={onClose} />,
    })
  ),
  sleepPattern: lazy(() =>
    Promise.resolve({
      default: ({ onClose }: { onClose: () => void }) => <PatternModal initialTab="sleep" onClose={onClose} />,
    })
  ),
  tips: lazy(() =>
    Promise.resolve({
      default: ({ onClose }: { onClose: () => void }) => <TipsModal onClose={onClose} />,
    })
  ),
  // Part 10D - Implemented modals
  copingTechnique: lazy(() =>
    Promise.resolve({
      default: ({ onClose, ...props }: { onClose: () => void; techniqueId?: string }) => (
        <CopingTechniqueModal onClose={onClose} techniqueId={props.techniqueId} />
      ),
    })
  ),
  milestone: lazy(() =>
    Promise.resolve({
      default: ({ onClose }: { onClose: () => void }) => <MilestoneModal onClose={onClose} />,
    })
  ),
  pastReflections: lazy(() =>
    Promise.resolve({
      default: ({ onClose }: { onClose: () => void }) => <PastReflectionsModal onClose={onClose} />,
    })
  ),
  gratitude: lazy(() =>
    Promise.resolve({
      default: ({ onClose }: { onClose: () => void }) => <GratitudeModal onClose={onClose} />,
    })
  ),
  morningCheckin: lazy(() =>
    Promise.resolve({
      default: ({ onClose }: { onClose: () => void }) => <MorningCheckinModal onClose={onClose} />,
    })
  ),
  eveningReflection: lazy(() =>
    Promise.resolve({
      default: ({ onClose }: { onClose: () => void }) => <EveningReflectionModal onClose={onClose} />,
    })
  ),
  dailyOverview: lazy(() =>
    Promise.resolve({
      default: ({ onClose }: { onClose: () => void }) => <DailyOverviewModal onClose={onClose} />,
    })
  ),
  sidebar: lazy(() =>
    Promise.resolve({
      default: ({ onClose }: { onClose: () => void }) => <SidebarModal onClose={onClose} />,
    })
  ),
  copingHistory: lazy(() =>
    Promise.resolve({
      default: ({ onClose }: { onClose: () => void }) => <CopingHistoryModal onClose={onClose} />,
    })
  ),
  crisis: lazy(() =>
    Promise.resolve({
      default: ({ onClose }: { onClose: () => void }) => <CrisisModal onClose={onClose} />,
    })
  ),
  // aiInsightsHub removed - now a dedicated page route at /insights
}

// =============================================================================
// COMMUNITY MODALS
// =============================================================================

const CommunityModals: Partial<Record<ModalName, ModalComponent>> = {
  groupDetails: lazy(() =>
    Promise.resolve({
      default: ({ onClose, ...props }: { onClose: () => void; groupId?: string }) => (
        <GroupDetailsModal onClose={onClose} groupId={props.groupId} />
      ),
    })
  ),
  imagePreview: lazy(() =>
    Promise.resolve({
      default: ({
        onClose,
        ...props
      }: {
        onClose: () => void
        imageUrl?: string
        title?: string
      }) => <ImagePreviewModal onClose={onClose} imageUrl={props.imageUrl} title={props.title} />,
    })
  ),
}

// =============================================================================
// MESSAGES MODALS
// =============================================================================

const MessagesModals: Partial<Record<ModalName, ModalComponent>> = {
  newConversation: lazy(() =>
    Promise.resolve({
      default: ({
        onClose,
        ...props
      }: {
        onClose: () => void
        recipientId?: string
        onSelectConversation?: (conversation: unknown) => void
      }) => (
        <NewConversationModal
          onClose={onClose}
          recipientId={props.recipientId}
          onSelectConversation={props.onSelectConversation}
        />
      ),
    })
  ),
  imageLightbox: lazy(() =>
    Promise.resolve({
      default: ({ onClose, ...props }: { onClose: () => void; imageUrl?: string }) => (
        <ImageLightboxModal onClose={onClose} imageUrl={props.imageUrl} />
      ),
    })
  ),
}

// =============================================================================
// PROFILE MODALS
// =============================================================================

const ProfileModals: Partial<Record<ModalName, ModalComponent>> = {
  // Part 9B - Implemented modals
  personalInfo: lazy(() =>
    Promise.resolve({
      default: ({ onClose }: { onClose: () => void }) => <PersonalInfoModal onClose={onClose} />,
    })
  ),
  recoveryInfo: lazy(() =>
    Promise.resolve({
      default: ({ onClose }: { onClose: () => void }) => <RecoveryInfoModal onClose={onClose} />,
    })
  ),
  educationInfo: lazy(() =>
    Promise.resolve({
      default: ({ onClose }: { onClose: () => void }) => <EducationInfoModal onClose={onClose} />,
    })
  ),
  emergency: lazy(() =>
    Promise.resolve({
      default: ({ onClose }: { onClose: () => void }) => <EmergencyContactsModal onClose={onClose} />,
    })
  ),
  emergencyContacts: lazy(() =>
    Promise.resolve({
      default: ({ onClose }: { onClose: () => void }) => <EmergencyContactsModal onClose={onClose} />,
    })
  ),
  passwordChange: lazy(() =>
    Promise.resolve({
      default: ({ onClose }: { onClose: () => void }) => <PasswordChangeModal onClose={onClose} />,
    })
  ),
  notificationSettings: lazy(() =>
    Promise.resolve({
      default: ({ onClose }: { onClose: () => void }) => <NotificationSettingsModal onClose={onClose} />,
    })
  ),
  privacySettings: lazy(() =>
    Promise.resolve({
      default: ({ onClose }: { onClose: () => void }) => <PrivacySettingsModal onClose={onClose} />,
    })
  ),
  profileVisibility: lazy(() =>
    Promise.resolve({
      default: ({ onClose }: { onClose: () => void }) => <ProfileVisibilityModal onClose={onClose} />,
    })
  ),
  dataManagement: lazy(() =>
    Promise.resolve({
      default: ({ onClose }: { onClose: () => void }) => <DataManagementModal onClose={onClose} />,
    })
  ),
  exportData: lazy(() =>
    Promise.resolve({
      default: ({ onClose }: { onClose: () => void }) => <ExportModal onClose={onClose} />,
    })
  ),
  accountActivity: lazy(() =>
    Promise.resolve({
      default: ({ onClose }: { onClose: () => void }) => <AccountActivityModal onClose={onClose} />,
    })
  ),
  // Part 9C - Implemented modals
  googleCalendar: lazy(() =>
    Promise.resolve({
      default: ({ onClose }: { onClose: () => void }) => <GoogleCalendarModal onClose={onClose} />,
    })
  ),
  appleCalendar: lazy(() =>
    Promise.resolve({
      default: ({ onClose }: { onClose: () => void }) => <AppleCalendarModal onClose={onClose} />,
    })
  ),
  help: lazy(() =>
    Promise.resolve({
      default: ({ onClose }: { onClose: () => void }) => <HelpModal onClose={onClose} />,
    })
  ),
  feedback: lazy(() =>
    Promise.resolve({
      default: ({ onClose }: { onClose: () => void }) => <FeedbackModal onClose={onClose} />,
    })
  ),
  deleteAccount: lazy(() =>
    Promise.resolve({
      default: ({ onClose }: { onClose: () => void }) => <DeleteAccountModal onClose={onClose} />,
    })
  ),
  password: lazy(() =>
    Promise.resolve({
      default: ({ onClose }: { onClose: () => void }) => <PasswordModal onClose={onClose} />,
    })
  ),
  // Security modals
  sessionManagement: lazy(() =>
    Promise.resolve({
      default: ({ onClose }: { onClose: () => void }) => <SessionManagementModal onClose={onClose} />,
    })
  ),
  twoFactorSettings: lazy(() =>
    Promise.resolve({
      default: ({ onClose }: { onClose: () => void }) => <TwoFactorSettingsModal onClose={onClose} />,
    })
  ),
  // Remaining placeholders - will be implemented later
  appSettings: createPlaceholder('appSettings'),
}

// =============================================================================
// RESOURCES MODALS
// =============================================================================

// ResourceViewerModal is implemented - use a wrapper to match the expected interface
const ResourcesModals: Partial<Record<ModalName, ModalComponent>> = {
  resourceViewer: lazy(() =>
    Promise.resolve({
      default: ({
        onClose,
        ...props
      }: {
        onClose: () => void
        resource?: unknown
        onToggleFavorite?: (resourceId: string) => void
        onToggleLibrary?: (resourceId: string) => void
        isFavorite?: boolean
        isInLibrary?: boolean
      }) => (
        <ResourceViewerModal
          isOpen={true}
          onClose={onClose}
          resource={props.resource as import('@/features/resources/hooks/useResources').ResourceWithProgress | null}
          onToggleFavorite={props.onToggleFavorite}
          onToggleLibrary={props.onToggleLibrary}
          isFavorite={props.isFavorite}
          isInLibrary={props.isInLibrary}
        />
      ),
    })
  ),
}

// =============================================================================
// COMBINED MODAL REGISTRY
// =============================================================================

const ALL_MODALS: Record<ModalName, ModalComponent> = {
  // Journey - Life
  ...JourneyLifeModals,
  // Journey - Wellness
  ...JourneyWellnessModals,
  // Journey - Finances
  ...JourneyFinancesModals,
  // Tasks - Sidebar
  ...TasksSidebarModals,
  // Tasks - Patterns
  ...TasksPatternModals,
  // Community
  ...CommunityModals,
  // Messages
  ...MessagesModals,
  // Profile
  ...ProfileModals,
  // Resources
  ...ResourcesModals,
} as Record<ModalName, ModalComponent>

// =============================================================================
// MODAL PROVIDER COMPONENT
// =============================================================================

// Modals that manage their own Dialog (use EnhancedDialog internally)
const SELF_MANAGED_MODALS: Set<ModalName> = new Set([
  // Core check-in modals (Phase 1-2)
  'morningCheckin',
  'eveningReflection',
  'dailyOverview',
  'sidebar',
  'copingHistory',
  'crisis',
  // Sidebar modals (Phase 3)
  'stats',
  'streaks',
  'streak',
  'reflectionStreaks',
  'wins',
  'addWin',
  'habit',
  'manageHabits',
  'thisWeek',
  'reflection',
  'overdue',
  'complete',
  'goalProgress',
  // Gratitude modals (fullscreen pages)
  'gratitude',
  'gratitudeJournal',
  // Pattern modals (Phase 4)
  'moodPattern',
  'cravingPattern',
  'anxietyPattern',
  'sleepPattern',
  // aiInsightsHub removed - now a dedicated page route at /insights
  // Resources modals - uses Sheet instead of Dialog
  'resourceViewer',
  // Messages modals - full-screen on mobile
  'newConversation',
  // Profile modals - Security (manage own Dialog)
  'sessionManagement',
  'twoFactorSettings',
])

export function ModalProvider() {
  const { activeModal, modalProps, closeModal } = useModalStore()

  // No modal open
  if (!activeModal) {
    return null
  }

  // Get the modal component
  const ModalComponent = ALL_MODALS[activeModal]

  if (!ModalComponent) {
    console.error(`Modal "${activeModal}" not found in registry`)
    return null
  }

  // Self-managed modals (use EnhancedDialog) - render without Dialog wrapper
  if (SELF_MANAGED_MODALS.has(activeModal)) {
    return (
      <Suspense
        fallback={
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
            <LoadingSpinner text="Loading..." />
          </div>
        }
      >
        <ModalComponent {...modalProps} onClose={closeModal} />
      </Suspense>
    )
  }

  // Regular modals - wrap with Dialog
  return (
    <Dialog open={true} onOpenChange={(open) => !open && closeModal()}>
      <Suspense
        fallback={
          <DialogContent className="sm:max-w-md">
            <div className="flex items-center justify-center p-8">
              <LoadingSpinner text="Loading..." />
            </div>
          </DialogContent>
        }
      >
        <ModalComponent {...modalProps} onClose={closeModal} />
      </Suspense>
    </Dialog>
  )
}

// =============================================================================
// HELPER: Replace placeholder with actual modal component
// =============================================================================

// This function will be used during migration to replace placeholders
// Example usage:
// ALL_MODALS.gratitudeThemes = lazy(() => import('@/features/journey/modals/GratitudeThemesModal'))

export function registerModal(name: ModalName, component: ModalComponent) {
  ALL_MODALS[name] = component
}
