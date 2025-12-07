// Main Components
export { CommunityTab } from './components/CommunityTab'
export { CommunityChat } from './components/CommunityChat'
export { MyDayFeed } from './components/MyDayFeed'
export { SupportGroups } from './components/SupportGroups'
export { CommunityMessage } from './components/CommunityMessage'

// Modals
export { GroupDetailsModal } from './modals/GroupDetailsModal'
export { ImagePreviewModal } from './modals/ImagePreviewModal'

// Hooks
export { useCommunity, formatTimeAgo, getInitials } from './hooks/useCommunity'

// Types
export type {
  CommunityMessage as CommunityMessageType,
  MyDayPost,
  MyDayPostType,
  MyDayFilter,
  SupportGroup,
  SupportGroupType,
  TopicRoom,
  EmergencyResource,
  Comment,
  Reaction,
  CommunitySubTab,
  CommunityTabProps,
  CommunityMessageProps,
  SupportGroupCardProps,
  UseCommunityMessagesReturn,
  UseMyDayReturn,
  UseSupportGroupsReturn,
  UseCommentsReturn,
} from './types'

// Default export
export { CommunityTab as default } from './components/CommunityTab'
