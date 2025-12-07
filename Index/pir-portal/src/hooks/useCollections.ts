import { where, orderBy, limit, type QueryConstraint } from 'firebase/firestore'
import { useFirestoreQuery, createCollectionHook } from './useFirestoreQuery'
import { useFirestoreDoc, createDocHook } from './useFirestoreDoc'
import type {
  CheckIn,
  Reflection,
  QuickReflection,
  Goal,
  Objective,
  Assignment,
  Habit,
  HabitCompletion,
  Gratitude,
  TodayWin,
  Breakthrough,
  Meeting,
  ExternalMeeting,
  SavedMeeting,
  CommunityMessage,
  TopicRoom,
  SupportGroup,
  Conversation,
  Message,
  SavingsGoal,
  SavingsItem,
  MoneyMapStop,
  CountdownGoal,
  Resource,
  Notification,
  Broadcast,
  DailyQuote,
  EmergencyContact,
  Streak,
} from '@/types/firebase'

// =============================================================================
// CHECK-INS & REFLECTIONS
// =============================================================================

/**
 * Hook for fetching user check-ins with optional filters
 */
export function useCheckIns(
  userId: string | null | undefined,
  options?: {
    type?: 'morning' | 'evening'
    limit?: number
    startDate?: Date
    enabled?: boolean
  }
) {
  const constraints: QueryConstraint[] = []

  if (userId) {
    constraints.push(where('userId', '==', userId))
  }
  if (options?.type) {
    constraints.push(where('type', '==', options.type))
  }
  if (options?.startDate) {
    constraints.push(where('createdAt', '>=', options.startDate))
  }
  constraints.push(orderBy('createdAt', 'desc'))
  if (options?.limit) {
    constraints.push(limit(options.limit))
  }

  return useFirestoreQuery<CheckIn>('checkIns', constraints, {
    enabled: options?.enabled ?? !!userId,
  })
}

/**
 * Hook for fetching user reflections
 */
export function useReflections(
  userId: string | null | undefined,
  options?: {
    type?: 'evening' | 'quick'
    limit?: number
    enabled?: boolean
  }
) {
  const constraints: QueryConstraint[] = []

  if (userId) {
    constraints.push(where('userId', '==', userId))
  }
  if (options?.type) {
    constraints.push(where('type', '==', options.type))
  }
  constraints.push(orderBy('createdAt', 'desc'))
  if (options?.limit) {
    constraints.push(limit(options.limit))
  }

  return useFirestoreQuery<Reflection>('reflections', constraints, {
    enabled: options?.enabled ?? !!userId,
  })
}

/**
 * Hook for fetching quick reflections
 */
export function useQuickReflections(
  userId: string | null | undefined,
  options?: { limit?: number; enabled?: boolean }
) {
  const constraints: QueryConstraint[] = []

  if (userId) {
    constraints.push(where('userId', '==', userId))
  }
  constraints.push(orderBy('createdAt', 'desc'))
  if (options?.limit) {
    constraints.push(limit(options.limit))
  }

  return useFirestoreQuery<QuickReflection>('quickReflections', constraints, {
    enabled: options?.enabled ?? !!userId,
  })
}

// =============================================================================
// GOALS, OBJECTIVES & ASSIGNMENTS (GOLDEN THREAD)
// =============================================================================

/**
 * Hook for fetching user goals
 */
export function useGoals(
  userId: string | null | undefined,
  options?: {
    status?: 'active' | 'completed' | 'paused' | 'archived'
    category?: string
    enabled?: boolean
  }
) {
  const constraints: QueryConstraint[] = []

  if (userId) {
    constraints.push(where('userId', '==', userId))
  }
  if (options?.status) {
    constraints.push(where('status', '==', options.status))
  }
  if (options?.category) {
    constraints.push(where('category', '==', options.category))
  }
  constraints.push(orderBy('createdAt', 'desc'))

  return useFirestoreQuery<Goal>('goals', constraints, {
    enabled: options?.enabled ?? !!userId,
  })
}

/**
 * Hook for fetching a single goal
 */
export const useGoal = createDocHook<Goal>('goals')

/**
 * Hook for fetching objectives for a goal
 */
export function useObjectives(
  goalId: string | null | undefined,
  options?: { enabled?: boolean }
) {
  const constraints: QueryConstraint[] = []

  if (goalId) {
    constraints.push(where('goalId', '==', goalId))
  }
  constraints.push(orderBy('createdAt', 'desc'))

  return useFirestoreQuery<Objective>('objectives', constraints, {
    enabled: options?.enabled ?? !!goalId,
  })
}

/**
 * Hook for fetching user objectives
 */
export function useUserObjectives(
  userId: string | null | undefined,
  options?: { status?: string; enabled?: boolean }
) {
  const constraints: QueryConstraint[] = []

  if (userId) {
    constraints.push(where('userId', '==', userId))
  }
  if (options?.status) {
    constraints.push(where('status', '==', options.status))
  }
  constraints.push(orderBy('createdAt', 'desc'))

  return useFirestoreQuery<Objective>('objectives', constraints, {
    enabled: options?.enabled ?? !!userId,
  })
}

/**
 * Hook for fetching user assignments
 */
export function useAssignments(
  userId: string | null | undefined,
  options?: {
    status?: 'pending' | 'in_progress' | 'completed' | 'overdue'
    goalId?: string
    enabled?: boolean
  }
) {
  const constraints: QueryConstraint[] = []

  if (userId) {
    constraints.push(where('userId', '==', userId))
  }
  if (options?.status) {
    constraints.push(where('status', '==', options.status))
  }
  if (options?.goalId) {
    constraints.push(where('goalId', '==', options.goalId))
  }
  constraints.push(orderBy('createdAt', 'desc'))

  return useFirestoreQuery<Assignment>('assignments', constraints, {
    enabled: options?.enabled ?? !!userId,
  })
}

/**
 * Hook for fetching a single assignment
 */
export const useAssignment = createDocHook<Assignment>('assignments')

// =============================================================================
// HABITS & TRACKING
// =============================================================================

/**
 * Hook for fetching user habits
 */
export function useHabits(
  userId: string | null | undefined,
  options?: {
    isActive?: boolean
    category?: string
    enabled?: boolean
  }
) {
  const constraints: QueryConstraint[] = []

  if (userId) {
    constraints.push(where('userId', '==', userId))
  }
  if (options?.isActive !== undefined) {
    constraints.push(where('isActive', '==', options.isActive))
  }
  if (options?.category) {
    constraints.push(where('category', '==', options.category))
  }
  constraints.push(orderBy('createdAt', 'desc'))

  return useFirestoreQuery<Habit>('habits', constraints, {
    enabled: options?.enabled ?? !!userId,
  })
}

/**
 * Hook for fetching a single habit
 */
export const useHabit = createDocHook<Habit>('habits')

/**
 * Hook for fetching habit completions
 */
export function useHabitCompletions(
  habitId: string | null | undefined,
  options?: { limit?: number; enabled?: boolean }
) {
  const constraints: QueryConstraint[] = []

  if (habitId) {
    constraints.push(where('habitId', '==', habitId))
  }
  constraints.push(orderBy('completedAt', 'desc'))
  if (options?.limit) {
    constraints.push(limit(options.limit))
  }

  return useFirestoreQuery<HabitCompletion>('habitCompletions', constraints, {
    enabled: options?.enabled ?? !!habitId,
  })
}

// =============================================================================
// GRATITUDE, WINS & BREAKTHROUGHS
// =============================================================================

/**
 * Hook for fetching user gratitudes
 */
export function useGratitudes(
  userId: string | null | undefined,
  options?: {
    theme?: string
    limit?: number
    enabled?: boolean
  }
) {
  const constraints: QueryConstraint[] = []

  if (userId) {
    constraints.push(where('userId', '==', userId))
  }
  if (options?.theme) {
    constraints.push(where('theme', '==', options.theme))
  }
  constraints.push(orderBy('createdAt', 'desc'))
  if (options?.limit) {
    constraints.push(limit(options.limit))
  }

  return useFirestoreQuery<Gratitude>('gratitudes', constraints, {
    enabled: options?.enabled ?? !!userId,
  })
}

/**
 * Hook for fetching today's wins
 */
export function useTodayWins(
  userId: string | null | undefined,
  options?: { limit?: number; enabled?: boolean }
) {
  const constraints: QueryConstraint[] = []

  if (userId) {
    constraints.push(where('userId', '==', userId))
  }
  constraints.push(orderBy('createdAt', 'desc'))
  if (options?.limit) {
    constraints.push(limit(options.limit))
  }

  return useFirestoreQuery<TodayWin>('todayWins', constraints, {
    enabled: options?.enabled ?? !!userId,
  })
}

/**
 * Hook for fetching breakthroughs
 */
export function useBreakthroughs(
  userId: string | null | undefined,
  options?: { limit?: number; enabled?: boolean }
) {
  const constraints: QueryConstraint[] = []

  if (userId) {
    constraints.push(where('userId', '==', userId))
  }
  constraints.push(orderBy('createdAt', 'desc'))
  if (options?.limit) {
    constraints.push(limit(options.limit))
  }

  return useFirestoreQuery<Breakthrough>('breakthroughs', constraints, {
    enabled: options?.enabled ?? !!userId,
  })
}

// =============================================================================
// MEETINGS
// =============================================================================

/**
 * Hook for fetching user's GLRS meetings
 */
export function useMeetings(
  userId: string | null | undefined,
  options?: {
    type?: 'glrs' | 'aa' | 'na' | 'other'
    day?: number
    enabled?: boolean
  }
) {
  const constraints: QueryConstraint[] = []

  if (userId) {
    constraints.push(where('userId', '==', userId))
  }
  if (options?.type) {
    constraints.push(where('type', '==', options.type))
  }
  if (options?.day !== undefined) {
    constraints.push(where('day', '==', options.day))
  }
  constraints.push(orderBy('time', 'asc'))

  return useFirestoreQuery<Meeting>('meetings', constraints, {
    enabled: options?.enabled ?? !!userId,
  })
}

/**
 * Hook for fetching external AA/NA meetings
 */
export function useExternalMeetings(options?: {
  source?: 'aa' | 'na'
  region?: string
  day?: number
  limit?: number
  enabled?: boolean
}) {
  const constraints: QueryConstraint[] = []

  if (options?.source) {
    constraints.push(where('source', '==', options.source))
  }
  if (options?.region) {
    constraints.push(where('region', '==', options.region))
  }
  if (options?.day !== undefined) {
    constraints.push(where('day', '==', options.day))
  }
  constraints.push(orderBy('time', 'asc'))
  if (options?.limit) {
    constraints.push(limit(options.limit))
  }

  return useFirestoreQuery<ExternalMeeting>('externalMeetings', constraints, {
    enabled: options?.enabled ?? true,
  })
}

/**
 * Hook for fetching user's saved meetings
 */
export function useSavedMeetings(
  userId: string | null | undefined,
  options?: { enabled?: boolean }
) {
  const constraints: QueryConstraint[] = []

  if (userId) {
    constraints.push(where('userId', '==', userId))
  }
  constraints.push(orderBy('createdAt', 'desc'))

  return useFirestoreQuery<SavedMeeting>('savedMeetings', constraints, {
    enabled: options?.enabled ?? !!userId,
  })
}

// =============================================================================
// COMMUNITY & MESSAGING
// =============================================================================

/**
 * Hook for fetching community messages
 */
export function useCommunityMessages(
  roomId: string | null | undefined,
  options?: { limit?: number; enabled?: boolean }
) {
  const constraints: QueryConstraint[] = []

  if (roomId) {
    constraints.push(where('roomId', '==', roomId))
  }
  constraints.push(where('isDeleted', '==', false))
  constraints.push(orderBy('createdAt', 'desc'))
  if (options?.limit) {
    constraints.push(limit(options.limit))
  }

  return useFirestoreQuery<CommunityMessage>('communityMessages', constraints, {
    enabled: options?.enabled ?? !!roomId,
  })
}

/**
 * Hook for fetching topic rooms
 */
export function useTopicRooms(
  tenantId: string | null | undefined,
  options?: { enabled?: boolean }
) {
  const constraints: QueryConstraint[] = []

  if (tenantId) {
    constraints.push(where('tenantId', '==', tenantId))
  }
  constraints.push(where('isActive', '==', true))
  constraints.push(orderBy('lastActivity', 'desc'))

  return useFirestoreQuery<TopicRoom>('topicRooms', constraints, {
    enabled: options?.enabled ?? !!tenantId,
  })
}

/**
 * Hook for fetching support groups
 */
export function useSupportGroups(
  tenantId: string | null | undefined,
  options?: {
    type?: 'peer' | 'professional' | 'family'
    enabled?: boolean
  }
) {
  const constraints: QueryConstraint[] = []

  if (tenantId) {
    constraints.push(where('tenantId', '==', tenantId))
  }
  if (options?.type) {
    constraints.push(where('type', '==', options.type))
  }
  constraints.push(orderBy('createdAt', 'desc'))

  return useFirestoreQuery<SupportGroup>('supportGroups', constraints, {
    enabled: options?.enabled ?? !!tenantId,
  })
}

/**
 * Hook for fetching a single support group
 */
export const useSupportGroup = createDocHook<SupportGroup>('supportGroups')

// =============================================================================
// DIRECT MESSAGING
// =============================================================================

/**
 * Hook for fetching user conversations
 */
export function useConversations(
  userId: string | null | undefined,
  options?: { enabled?: boolean }
) {
  const constraints: QueryConstraint[] = []

  if (userId) {
    constraints.push(where('participantIds', 'array-contains', userId))
  }
  constraints.push(orderBy('lastMessageAt', 'desc'))

  return useFirestoreQuery<Conversation>('conversations', constraints, {
    enabled: options?.enabled ?? !!userId,
  })
}

/**
 * Hook for fetching messages in a conversation
 */
export function useMessages(
  conversationId: string | null | undefined,
  options?: { limit?: number; enabled?: boolean }
) {
  const constraints: QueryConstraint[] = []

  if (conversationId) {
    constraints.push(where('conversationId', '==', conversationId))
  }
  constraints.push(orderBy('createdAt', 'asc'))
  if (options?.limit) {
    constraints.push(limit(options.limit))
  }

  return useFirestoreQuery<Message>('messages', constraints, {
    enabled: options?.enabled ?? !!conversationId,
  })
}

// =============================================================================
// FINANCES (JAR/SAVINGS)
// =============================================================================

/**
 * Hook for fetching user savings goals
 */
export function useSavingsGoals(
  userId: string | null | undefined,
  options?: {
    isCompleted?: boolean
    enabled?: boolean
  }
) {
  const constraints: QueryConstraint[] = []

  if (userId) {
    constraints.push(where('userId', '==', userId))
  }
  if (options?.isCompleted !== undefined) {
    constraints.push(where('isCompleted', '==', options.isCompleted))
  }
  constraints.push(orderBy('createdAt', 'desc'))

  return useFirestoreQuery<SavingsGoal>('savingsGoals', constraints, {
    enabled: options?.enabled ?? !!userId,
  })
}

/**
 * Hook for fetching a single savings goal
 */
export const useSavingsGoal = createDocHook<SavingsGoal>('savingsGoals')

/**
 * Hook for fetching savings items (transactions)
 */
export function useSavingsItems(
  userId: string | null | undefined,
  options?: {
    goalId?: string
    type?: 'deposit' | 'withdrawal'
    limit?: number
    enabled?: boolean
  }
) {
  const constraints: QueryConstraint[] = []

  if (userId) {
    constraints.push(where('userId', '==', userId))
  }
  if (options?.goalId) {
    constraints.push(where('goalId', '==', options.goalId))
  }
  if (options?.type) {
    constraints.push(where('type', '==', options.type))
  }
  constraints.push(orderBy('createdAt', 'desc'))
  if (options?.limit) {
    constraints.push(limit(options.limit))
  }

  return useFirestoreQuery<SavingsItem>('savingsItems', constraints, {
    enabled: options?.enabled ?? !!userId,
  })
}

/**
 * Hook for fetching money map stops
 */
export function useMoneyMapStops(
  userId: string | null | undefined,
  options?: { enabled?: boolean }
) {
  const constraints: QueryConstraint[] = []

  if (userId) {
    constraints.push(where('userId', '==', userId))
  }
  constraints.push(orderBy('date', 'asc'))

  return useFirestoreQuery<MoneyMapStop>('moneyMapStops', constraints, {
    enabled: options?.enabled ?? !!userId,
  })
}

/**
 * Hook for fetching countdown goals
 */
export function useCountdownGoals(
  userId: string | null | undefined,
  options?: {
    isCompleted?: boolean
    enabled?: boolean
  }
) {
  const constraints: QueryConstraint[] = []

  if (userId) {
    constraints.push(where('userId', '==', userId))
  }
  if (options?.isCompleted !== undefined) {
    constraints.push(where('isCompleted', '==', options.isCompleted))
  }
  constraints.push(orderBy('targetDate', 'asc'))

  return useFirestoreQuery<CountdownGoal>('countdownGoals', constraints, {
    enabled: options?.enabled ?? !!userId,
  })
}

// =============================================================================
// RESOURCES
// =============================================================================

/**
 * Hook for fetching resources
 */
export function useResources(
  tenantId: string | null | undefined,
  options?: {
    category?: string
    type?: 'article' | 'video' | 'pdf' | 'link' | 'audio'
    limit?: number
    enabled?: boolean
  }
) {
  const constraints: QueryConstraint[] = []

  if (tenantId) {
    constraints.push(where('tenantId', '==', tenantId))
  }
  constraints.push(where('isPublished', '==', true))
  if (options?.category) {
    constraints.push(where('category', '==', options.category))
  }
  if (options?.type) {
    constraints.push(where('type', '==', options.type))
  }
  constraints.push(orderBy('createdAt', 'desc'))
  if (options?.limit) {
    constraints.push(limit(options.limit))
  }

  return useFirestoreQuery<Resource>('resources', constraints, {
    enabled: options?.enabled ?? !!tenantId,
  })
}

/**
 * Hook for fetching a single resource
 */
export const useResource = createDocHook<Resource>('resources')

// =============================================================================
// NOTIFICATIONS & BROADCASTS
// =============================================================================

/**
 * Hook for fetching user notifications
 */
export function useNotifications(
  userId: string | null | undefined,
  options?: {
    isRead?: boolean
    type?: string
    limit?: number
    enabled?: boolean
  }
) {
  const constraints: QueryConstraint[] = []

  if (userId) {
    constraints.push(where('userId', '==', userId))
  }
  if (options?.isRead !== undefined) {
    constraints.push(where('isRead', '==', options.isRead))
  }
  if (options?.type) {
    constraints.push(where('type', '==', options.type))
  }
  constraints.push(orderBy('createdAt', 'desc'))
  if (options?.limit) {
    constraints.push(limit(options.limit))
  }

  return useFirestoreQuery<Notification>('notifications', constraints, {
    enabled: options?.enabled ?? !!userId,
  })
}

/**
 * Hook for fetching active broadcasts
 */
export function useBroadcasts(
  tenantId: string | null | undefined,
  options?: { enabled?: boolean }
) {
  const constraints: QueryConstraint[] = []

  if (tenantId) {
    constraints.push(where('tenantId', '==', tenantId))
  }
  constraints.push(where('isActive', '==', true))
  constraints.push(orderBy('createdAt', 'desc'))

  return useFirestoreQuery<Broadcast>('broadcasts', constraints, {
    enabled: options?.enabled ?? !!tenantId,
  })
}

/**
 * Hook for fetching daily quotes
 */
export function useDailyQuotes(
  tenantId: string | null | undefined,
  options?: { enabled?: boolean }
) {
  const constraints: QueryConstraint[] = []

  if (tenantId) {
    constraints.push(where('tenantId', '==', tenantId))
  }
  constraints.push(where('isActive', '==', true))
  constraints.push(orderBy('date', 'desc'))
  constraints.push(limit(1))

  return useFirestoreQuery<DailyQuote>('dailyQuotes', constraints, {
    enabled: options?.enabled ?? !!tenantId,
  })
}

// =============================================================================
// EMERGENCY & SAFETY
// =============================================================================

/**
 * Hook for fetching emergency contacts
 */
export function useEmergencyContacts(
  userId: string | null | undefined,
  options?: { enabled?: boolean }
) {
  const constraints: QueryConstraint[] = []

  if (userId) {
    constraints.push(where('userId', '==', userId))
  }
  constraints.push(orderBy('isPrimary', 'desc'))
  constraints.push(orderBy('createdAt', 'asc'))

  return useFirestoreQuery<EmergencyContact>('emergencyContacts', constraints, {
    enabled: options?.enabled ?? !!userId,
  })
}

/**
 * Hook for fetching a single emergency contact
 */
export const useEmergencyContact = createDocHook<EmergencyContact>('emergencyContacts')

// =============================================================================
// STREAKS & GAMIFICATION
// =============================================================================

/**
 * Hook for fetching user streaks
 */
export function useStreaks(
  userId: string | null | undefined,
  options?: {
    type?: 'check_in' | 'reflection' | 'gratitude' | 'sobriety'
    enabled?: boolean
  }
) {
  const constraints: QueryConstraint[] = []

  if (userId) {
    constraints.push(where('userId', '==', userId))
  }
  if (options?.type) {
    constraints.push(where('type', '==', options.type))
  }

  return useFirestoreQuery<Streak>('streaks', constraints, {
    enabled: options?.enabled ?? !!userId,
  })
}

/**
 * Hook for fetching a single streak by type
 */
export function useStreak(
  userId: string | null | undefined,
  type: 'check_in' | 'reflection' | 'gratitude' | 'sobriety',
  options?: { enabled?: boolean }
) {
  const { data, loading, error } = useStreaks(userId, { type, enabled: options?.enabled })
  return {
    data: data[0] || null,
    loading,
    error,
    exists: data.length > 0,
  }
}

// =============================================================================
// RE-EXPORT GENERIC HOOKS
// =============================================================================

export { useFirestoreQuery, useFirestoreDoc, createCollectionHook, createDocHook }
