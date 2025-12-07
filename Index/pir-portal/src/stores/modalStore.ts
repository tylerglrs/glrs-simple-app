import { create } from 'zustand'

// =============================================================================
// MODAL NAME UNION TYPE - ALL 75 MODALS
// =============================================================================

export type ModalName =
  // -------------------------------------------------------------------------
  // Journey Tab - Life Sub-tab (9 modals)
  // -------------------------------------------------------------------------
  | 'gratitudeThemes'
  | 'gratitudeJournal'
  | 'challenges'
  | 'breakthrough'
  | 'streak'
  | 'reflectionStreak'
  | 'streaks'
  | 'reflectionStreaks'
  | 'addCountdown'

  // -------------------------------------------------------------------------
  // Journey Tab - Wellness Sub-tab (6 modals)
  // -------------------------------------------------------------------------
  | 'calendarHeatmap'
  | 'journeyCalendar'
  | 'weeklyReport'
  | 'moodInsights'
  | 'overallDayInsights'
  | 'graphSettings'

  // -------------------------------------------------------------------------
  // Journey Tab - Finances Sub-tab (5 modals)
  // -------------------------------------------------------------------------
  | 'addSavingsGoal'
  | 'editSavingsGoal'
  | 'jarTransaction'
  | 'savingsHistory'
  | 'financeCountdown'

  // -------------------------------------------------------------------------
  // Tasks Tab - Sidebar Modals (24 modals)
  // -------------------------------------------------------------------------
  | 'habit'
  | 'editHabit'
  | 'habitHistory'
  | 'reflection'
  | 'reflectionHistory'
  | 'thisWeek'
  | 'overdue'
  | 'complete'
  | 'stats'
  | 'goalProgress'
  | 'wins'
  | 'winsHistory'
  | 'checkRate'
  | 'checkIns'
  | 'avgMood'
  | 'allReflections'
  | 'challengesHistory'
  | 'shareGoal'
  | 'intentions'
  | 'pastIntentions'
  | 'snapshot'
  | 'quickReflection'
  | 'addWin'
  | 'viewGoal'
  | 'editGoal'

  // -------------------------------------------------------------------------
  // Tasks Tab - Pattern Modals (10 modals)
  // -------------------------------------------------------------------------
  | 'patterns'        // Unified pattern modal with tabs
  // aiInsightsHub removed - now a dedicated page route at /insights
  | 'insightDetail'   // AI Pattern Insight detail modal (Project Lighthouse)
  | 'moodPattern'
  | 'cravingPattern'
  | 'anxietyPattern'
  | 'sleepPattern'
  | 'tips'
  | 'copingTechnique'
  | 'milestone'
  | 'pastReflections'
  | 'gratitude'

  // -------------------------------------------------------------------------
  // Tasks Tab - Part 10D Core Modals (9 modals)
  // -------------------------------------------------------------------------
  | 'morningCheckin'
  | 'eveningReflection'
  | 'dailyOverview'
  | 'sidebar'
  | 'copingHistory'
  | 'crisis'

  // -------------------------------------------------------------------------
  // Community Tab (2 modals)
  // -------------------------------------------------------------------------
  | 'groupDetails'
  | 'imagePreview'

  // -------------------------------------------------------------------------
  // Messages Tab (2 modals)
  // -------------------------------------------------------------------------
  | 'newConversation'
  | 'imageLightbox'

  // -------------------------------------------------------------------------
  // Profile Tab (18 modals)
  // -------------------------------------------------------------------------
  | 'personalInfo'
  | 'recoveryInfo'
  | 'emergency'
  | 'emergencyContacts'
  | 'notificationSettings'
  | 'googleCalendar'
  | 'appleCalendar'
  | 'privacySettings'
  | 'dataManagement'
  | 'passwordChange'
  | 'password'
  | 'help'
  | 'feedback'
  | 'exportData'
  | 'deleteAccount'
  | 'profileVisibility'
  | 'accountActivity'
  | 'appSettings'

  // -------------------------------------------------------------------------
  // Resources Tab (1 modal)
  // -------------------------------------------------------------------------
  | 'resourceViewer'

// =============================================================================
// MODAL PROPS MAP - Type-safe props for modals that need them
// =============================================================================

export interface ModalPropsMap {
  // Journey modals with props
  editSavingsGoal: { goalId: string }
  jarTransaction: { goalId?: string; type?: 'deposit' | 'withdrawal' }
  breakthrough: { breakthroughId?: string }
  addCountdown: { countdownId?: string }
  financeCountdown: { countdownId?: string }

  // Tasks modals with props
  editHabit: { habitId: string }
  habitHistory: { habitId: string }
  editGoal: { goalId: string }
  viewGoal: { goalId: string }
  reflection: { date?: string }
  quickReflection: { prompt?: string }
  copingTechnique: { techniqueId?: string }
  insightDetail: { insight: import('@/hooks/useAIPatternInsights').AIPatternInsight }

  // Community modals with props
  groupDetails: { groupId: string }
  imagePreview: { imageUrl: string; title?: string }

  // Messages modals with props
  imageLightbox: { imageUrl: string }
  newConversation: {
    recipientId?: string
    onSelectConversation?: (conversation: unknown) => void
  }

  // Profile modals with props
  emergency: { contactId?: string }
  emergencyContacts: { contactId?: string }

  // Resources modals with props
  resourceViewer: { resource: unknown }

  // Modals without props (undefined)
  gratitudeThemes: undefined
  gratitudeJournal: undefined
  challenges: undefined
  streak: undefined
  reflectionStreak: undefined
  streaks: undefined
  reflectionStreaks: undefined
  calendarHeatmap: undefined
  journeyCalendar: undefined
  weeklyReport: undefined
  moodInsights: undefined
  overallDayInsights: undefined
  graphSettings: undefined
  addSavingsGoal: undefined
  savingsHistory: undefined
  habit: undefined
  thisWeek: undefined
  overdue: undefined
  complete: undefined
  stats: undefined
  goalProgress: undefined
  wins: undefined
  winsHistory: undefined
  checkRate: undefined
  checkIns: undefined
  avgMood: undefined
  allReflections: undefined
  challengesHistory: undefined
  shareGoal: undefined
  intentions: undefined
  pastIntentions: undefined
  snapshot: undefined
  addWin: undefined
  reflectionHistory: undefined
  // aiInsightsHub removed - now a dedicated page route at /insights
  moodPattern: undefined
  cravingPattern: undefined
  anxietyPattern: undefined
  sleepPattern: undefined
  tips: undefined
  milestone: undefined
  pastReflections: undefined
  gratitude: undefined
  personalInfo: undefined
  recoveryInfo: undefined
  notificationSettings: undefined
  googleCalendar: undefined
  appleCalendar: undefined
  privacySettings: undefined
  dataManagement: undefined
  passwordChange: undefined
  password: undefined
  help: undefined
  feedback: undefined
  exportData: undefined
  deleteAccount: undefined
  profileVisibility: undefined
  accountActivity: undefined
  appSettings: undefined

  // Part 10D Core Modals (no props)
  morningCheckin: undefined
  eveningReflection: undefined
  dailyOverview: undefined
  sidebar: undefined
  copingHistory: undefined
  crisis: undefined
}

// =============================================================================
// MODAL STATE INTERFACE
// =============================================================================

interface ModalState {
  // Current open modal (null = none open)
  activeModal: ModalName | null

  // Props passed to the modal
  modalProps: Record<string, unknown>

  // Open a modal with optional props
  openModal: <T extends ModalName>(
    name: T,
    props?: T extends keyof ModalPropsMap ? ModalPropsMap[T] : undefined
  ) => void

  // Close the current modal
  closeModal: () => void

  // Check if a specific modal is open
  isOpen: (name: ModalName) => boolean
}

// =============================================================================
// ZUSTAND STORE
// =============================================================================

export const useModalStore = create<ModalState>((set, get) => ({
  activeModal: null,
  modalProps: {},

  openModal: (name, props) => {
    set({
      activeModal: name,
      modalProps: (props as Record<string, unknown>) ?? {},
    })
  },

  closeModal: () => {
    set({ activeModal: null, modalProps: {} })
  },

  isOpen: (name) => get().activeModal === name,
}))

// =============================================================================
// CONVENIENCE HOOK - For components that only care about one modal
// =============================================================================

export function useModal<T extends ModalName>(name: T) {
  const { activeModal, modalProps, openModal, closeModal } = useModalStore()

  return {
    isOpen: activeModal === name,
    props: modalProps as T extends keyof ModalPropsMap ? ModalPropsMap[T] : undefined,
    open: (props?: T extends keyof ModalPropsMap ? ModalPropsMap[T] : undefined) =>
      openModal(name, props),
    close: closeModal,
  }
}

// =============================================================================
// MODAL CATEGORIES - For organizing modals in ModalProvider
// =============================================================================

export const MODAL_CATEGORIES = {
  journey: {
    life: [
      'gratitudeThemes',
      'gratitudeJournal',
      'challenges',
      'breakthrough',
      'streak',
      'reflectionStreak',
      'streaks',
      'reflectionStreaks',
      'addCountdown',
    ],
    wellness: [
      'calendarHeatmap',
      'journeyCalendar',
      'weeklyReport',
      'moodInsights',
      'overallDayInsights',
      'graphSettings',
    ],
    finances: [
      'addSavingsGoal',
      'editSavingsGoal',
      'jarTransaction',
      'savingsHistory',
      'financeCountdown',
    ],
  },
  tasks: {
    sidebar: [
      'habit',
      'editHabit',
      'habitHistory',
      'reflection',
      'reflectionHistory',
      'thisWeek',
      'overdue',
      'complete',
      'stats',
      'goalProgress',
      'wins',
      'winsHistory',
      'checkRate',
      'checkIns',
      'avgMood',
      'allReflections',
      'challengesHistory',
      'shareGoal',
      'intentions',
      'pastIntentions',
      'snapshot',
      'quickReflection',
      'addWin',
      'viewGoal',
      'editGoal',
    ],
    patterns: [
      // aiInsightsHub removed - now a dedicated page route at /insights
      'insightDetail',  // Project Lighthouse: AI Pattern Insight detail
      'moodPattern',
      'cravingPattern',
      'anxietyPattern',
      'sleepPattern',
      'tips',
      'copingTechnique',
      'milestone',
      'pastReflections',
      'gratitude',
    ],
    core: [
      'morningCheckin',
      'eveningReflection',
      'dailyOverview',
      'sidebar',
      'copingHistory',
      'crisis',
    ],
  },
  community: ['groupDetails', 'imagePreview'],
  messages: ['newConversation', 'imageLightbox'],
  profile: [
    'personalInfo',
    'recoveryInfo',
    'emergency',
    'emergencyContacts',
    'notificationSettings',
    'googleCalendar',
    'appleCalendar',
    'privacySettings',
    'dataManagement',
    'passwordChange',
    'password',
    'help',
    'feedback',
    'exportData',
    'deleteAccount',
    'profileVisibility',
    'accountActivity',
    'appSettings',
  ],
  resources: ['resourceViewer'],
} as const
