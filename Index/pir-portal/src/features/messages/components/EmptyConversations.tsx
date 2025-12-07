import { MessageCircle, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface EmptyConversationsProps {
  isSearching?: boolean
  onNewConversation?: () => void
  className?: string
}

export function EmptyConversations({
  isSearching = false,
  onNewConversation,
  className,
}: EmptyConversationsProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-12 px-6 text-center',
        className
      )}
    >
      <div className="mb-4">
        <MessageCircle className="h-12 w-12 text-muted-foreground/50" />
      </div>

      <h3 className="text-lg font-semibold text-foreground mb-2">
        {isSearching ? 'No conversations found' : 'No messages yet'}
      </h3>

      <p className="text-sm text-muted-foreground mb-6 max-w-[240px]">
        {isSearching
          ? 'Try a different search term'
          : 'Start a conversation with your coach or peers'}
      </p>

      {!isSearching && onNewConversation && (
        <Button onClick={onNewConversation} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Start a Conversation
        </Button>
      )}
    </div>
  )
}

export default EmptyConversations
