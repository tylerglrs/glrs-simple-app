import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import type { Conversation, Participant } from '../hooks/useConversations'

interface ConversationItemProps {
  conversation: Conversation
  otherParticipant: Participant
  unreadCount: number
  isSelected?: boolean
  onClick?: () => void
}

// Format timestamp for display
function formatTimestamp(timestamp: Date | null): string {
  if (!timestamp) return ''

  const now = new Date()
  const diffMs = now.getTime() - timestamp.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Now'
  if (diffMins < 60) return `${diffMins}m`
  if (diffHours < 24) return `${diffHours}h`
  if (diffDays < 7) return `${diffDays}d`

  return timestamp.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function ConversationItem({
  conversation,
  otherParticipant,
  unreadCount,
  isSelected = false,
  onClick,
}: ConversationItemProps) {
  const lastMessageText =
    conversation.lastMessage?.type === 'image'
      ? 'Sent an image'
      : conversation.lastMessage?.text || 'No messages'

  const hasUnread = unreadCount > 0

  return (
    <div
      onClick={onClick}
      className={cn(
        'flex items-center gap-3 px-4 py-3 cursor-pointer border-b border-muted/50 transition-colors',
        isSelected ? 'bg-primary/5' : 'hover:bg-muted/50'
      )}
    >
      {/* Avatar */}
      <Avatar className="h-12 w-12 flex-shrink-0">
        <AvatarImage src={otherParticipant.avatar || undefined} />
        <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
          {otherParticipant.name?.[0]?.toUpperCase() || '?'}
        </AvatarFallback>
      </Avatar>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-center mb-1">
          <span
            className={cn(
              'text-sm font-medium truncate',
              hasUnread ? 'text-foreground font-semibold' : 'text-foreground'
            )}
          >
            {otherParticipant.name}
          </span>
          <span className="text-xs text-muted-foreground flex-shrink-0 ml-2">
            {formatTimestamp(conversation.lastMessageTimestamp)}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span
            className={cn(
              'text-sm truncate',
              hasUnread ? 'text-foreground font-medium' : 'text-muted-foreground',
              conversation.lastMessage?.type === 'image' && 'italic'
            )}
          >
            {lastMessageText}
          </span>

          {hasUnread && (
            <span className="flex-shrink-0 ml-2 bg-primary text-primary-foreground text-xs font-semibold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
              {unreadCount}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

export default ConversationItem
