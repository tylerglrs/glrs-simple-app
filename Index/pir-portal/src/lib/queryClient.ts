import { QueryClient } from '@tanstack/react-query'

/**
 * Global QueryClient configuration for TanStack Query
 *
 * This enables:
 * - Data caching across tab switches (staleTime: 5 minutes)
 * - Stale-while-revalidate pattern
 * - Reduced Firestore reads by preventing unnecessary refetches
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Data considered fresh for 5 minutes
      // During this time, no refetch on mount/focus/reconnect
      staleTime: 5 * 60 * 1000,

      // Keep unused data in cache for 30 minutes
      // Even after component unmounts, data stays cached
      gcTime: 30 * 60 * 1000,

      // Don't refetch on mount if data is fresh
      // Key for instant tab switching
      refetchOnMount: false,

      // Don't refetch when window regains focus
      // Prevents unnecessary queries on alt-tab
      refetchOnWindowFocus: false,

      // Don't refetch on network reconnect
      refetchOnReconnect: false,

      // Retry failed requests once
      retry: 1,

      // Exponential backoff for retries (capped at 30 seconds)
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      // Retry mutations once
      retry: 1,
    },
  },
})

// Query key factories for type-safe, consistent query keys
export const queryKeys = {
  // Check-ins
  checkIns: {
    all: (userId: string) => ['checkIns', userId] as const,
    today: (userId: string) => ['checkIns', userId, 'today'] as const,
    weekly: (userId: string) => ['checkIns', userId, 'weekly'] as const,
  },

  // Goals
  goals: {
    all: (userId: string) => ['goals', userId] as const,
    active: (userId: string) => ['goals', userId, 'active'] as const,
    byId: (userId: string, goalId: string) => ['goals', userId, goalId] as const,
  },

  // Habits
  habits: {
    all: (userId: string) => ['habits', userId] as const,
    completions: (userId: string) => ['habitCompletions', userId] as const,
  },

  // Journey (aggregated data for journey tab)
  journey: {
    all: (userId: string) => ['journey', userId] as const,
    savings: (userId: string) => ['journey', userId, 'savings'] as const,
    breakthroughs: (userId: string) => ['journey', userId, 'breakthroughs'] as const,
  },

  // Resources (shared across users)
  resources: {
    all: () => ['resources'] as const,
    byCategory: (category: string) => ['resources', category] as const,
    assigned: (userId: string) => ['resources', 'assigned', userId] as const,
  },

  // Meetings
  meetings: {
    saved: (userId: string) => ['savedMeetings', userId] as const,
    external: () => ['externalMeetings'] as const,
    favorites: (userId: string) => ['meetingFavorites', userId] as const,
  },

  // Community
  community: {
    messages: (roomId?: string) => ['communityMessages', roomId ?? 'all'] as const,
    rooms: () => ['topicRooms'] as const,
    groups: () => ['supportGroups'] as const,
    myDay: () => ['myDayPosts'] as const,
  },

  // Conversations/Messages
  conversations: {
    all: (userId: string) => ['conversations', userId] as const,
    messages: (conversationId: string) => ['messages', conversationId] as const,
  },

  // Profile/User
  user: {
    data: (userId: string) => ['userData', userId] as const,
    emergencyContacts: (userId: string) => ['emergencyContacts', userId] as const,
    calendarConnections: (userId: string) => ['calendarConnections', userId] as const,
  },

  // Assignments
  assignments: {
    all: (userId: string) => ['assignments', userId] as const,
    active: (userId: string) => ['assignments', userId, 'active'] as const,
  },
} as const
