// Components
export { MessagesTab } from './components/MessagesTab'
export { ConversationList } from './components/ConversationList'
export { ConversationItem } from './components/ConversationItem'
export { ChatThread } from './components/ChatThread'
export { MessageBubble } from './components/MessageBubble'
export { MessageInput } from './components/MessageInput'
export { EmptyConversations } from './components/EmptyConversations'
export { TypingIndicator } from './components/TypingIndicator'
export { MessagesErrorBoundary } from './components/MessagesErrorBoundary'

// Modals
export { ImageLightboxModal } from './modals/ImageLightboxModal'
export { NewConversationModal } from './modals/NewConversationModal'

// Hooks
export {
  useConversations,
  useMessages,
  useSendMessage,
  useTypingIndicator,
  useEligibleUsers,
} from './hooks/useConversations'

// Types
export type {
  Conversation,
  Message,
  Participant,
  LastMessage,
  EligibleUser,
} from './hooks/useConversations'

// Default export
export { MessagesTab as default } from './components/MessagesTab'
