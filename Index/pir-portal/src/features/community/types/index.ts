import type { Timestamp } from 'firebase/firestore'

// ============================================================
// COMMUNITY MESSAGE TYPES
// ============================================================

export interface Reaction {
  heart: string[]
  support: string[]
  celebrate: string[]
}

export interface CommunityMessage {
  id: string
  content: string
  imageUrl?: string
  senderId: string
  senderName: string
  senderProfileImageUrl?: string
  isAnonymous: boolean
  type: 'community' | 'topic'
  topicRoomId?: string
  createdAt: Timestamp | null
  updatedAt?: Timestamp | null
  reactions?: Reaction
  reactedBy?: Record<string, 'heart' | 'support' | 'celebrate'>
  commentCount?: number
}

export interface Comment {
  id: string
  content: string
  userId: string
  userDisplayName: string
  userProfileImageUrl?: string
  isAnonymous: boolean
  parentCommentId?: string
  createdAt: Timestamp | null
}

// ============================================================
// MY DAY POST TYPES
// ============================================================

export type MyDayPostType = 'reflection' | 'win'
export type MyDayFilter = 'all' | 'reflections' | 'wins' | 'myPosts'

export interface MyDayPost {
  id: string
  userId: string
  userDisplayName: string
  userProfileImageUrl?: string
  type: MyDayPostType
  content: string
  isAnonymous: boolean
  createdAt: Timestamp | null
  reactions?: Reaction
  reactedBy?: Record<string, 'heart' | 'support' | 'celebrate'>
  commentCount?: number
}

// ============================================================
// SUPPORT GROUP TYPES
// ============================================================

export type SupportGroupType = 'AA' | 'NA' | 'SMART' | 'Refuge' | 'Other'

export interface SupportGroup {
  id: string
  name: string
  type: SupportGroupType
  description?: string
  day: string
  time: string
  location?: string
  link?: string
  isVirtual: boolean
  format?: string
  memberCount?: number
  accessibility?: string
  contact?: string
  notes?: string
  createdAt?: Timestamp | null
}

// ============================================================
// TOPIC ROOM TYPES (for future use)
// ============================================================

export interface TopicRoom {
  id: string
  name: string
  description?: string
  icon?: string
  color?: string
  memberCount: number
  lastActivity?: Timestamp | null
  createdAt?: Timestamp | null
}

// ============================================================
// EMERGENCY RESOURCE TYPES
// ============================================================

export interface EmergencyResource {
  id: string
  name: string
  phone: string
  description?: string
  category: 'crisis' | 'support' | 'medical'
  available24h: boolean
  order?: number
}

// ============================================================
// COMPONENT PROP TYPES
// ============================================================

export type CommunitySubTab = 'main' | 'myday' | 'groups'

export interface CommunityTabProps {
  className?: string
}

export interface CommunityMessageProps {
  message: CommunityMessage | MyDayPost
  currentUserId: string
  isMyDayPost?: boolean
  onReaction: (messageId: string, reactionType: 'heart' | 'support' | 'celebrate') => Promise<void>
  onComment: (messageId: string, content: string) => Promise<void>
  onDeleteComment: (messageId: string, commentId: string) => Promise<void>
  onDelete: (messageId: string) => Promise<void>
  onReport: (messageId: string) => Promise<void>
  onBlock?: (userId: string) => Promise<void>
  onAvatarClick: (userId: string, isAnonymous: boolean) => void
  onImageClick: (imageUrl: string) => void
  isCoachOrAdmin: boolean
  isMobile?: boolean
}

export interface SupportGroupCardProps {
  group: SupportGroup
  isMobile?: boolean
}

// ============================================================
// HOOK RETURN TYPES
// ============================================================

export interface UseCommunityMessagesReturn {
  messages: CommunityMessage[]
  loading: boolean
  error: string | null
  sendMessage: (content: string, imageUrl?: string, isAnonymous?: boolean) => Promise<boolean>
  deleteMessage: (messageId: string) => Promise<boolean>
  reportMessage: (messageId: string) => Promise<boolean>
  addReaction: (messageId: string, reactionType: 'heart' | 'support' | 'celebrate') => Promise<void>
}

export interface UseMyDayReturn {
  posts: MyDayPost[]
  loading: boolean
  error: string | null
  filter: MyDayFilter
  setFilter: (filter: MyDayFilter) => void
  createPost: (type: MyDayPostType, content: string, isAnonymous: boolean) => Promise<boolean>
  deletePost: (postId: string) => Promise<boolean>
  addReaction: (postId: string, reactionType: 'heart' | 'support' | 'celebrate') => Promise<void>
}

export interface UseSupportGroupsReturn {
  groups: SupportGroup[]
  loading: boolean
  error: string | null
}

export interface UseCommentsReturn {
  comments: Record<string, Comment[]>
  loadingComments: Record<string, boolean>
  submitting: boolean
  loadComments: (postId: string) => Promise<void>
  addComment: (postId: string, content: string, isAnonymous?: boolean) => Promise<boolean>
  deleteComment: (postId: string, commentId: string) => Promise<boolean>
  addReply: (postId: string, parentCommentId: string, content: string) => Promise<boolean>
}
