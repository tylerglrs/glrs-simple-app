import { useState, useMemo } from 'react'
import { Search, PenSquare, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { ConversationItem } from './ConversationItem'
import { EmptyConversations } from './EmptyConversations'
import type { Conversation, Participant } from '../hooks/useConversations'

interface ConversationListProps {
  conversations: Conversation[]
  loading?: boolean
  selectedConversationId?: string | null
  onSelectConversation: (conversation: Conversation) => void
  onNewConversation: () => void
  getOtherParticipant: (conversation: Conversation) => Participant
  getUnreadCount: (conversation: Conversation) => number
  className?: string
}

export function ConversationList({
  conversations,
  loading = false,
  selectedConversationId,
  onSelectConversation,
  onNewConversation,
  getOtherParticipant,
  getUnreadCount,
  className,
}: ConversationListProps) {
  const [searchQuery, setSearchQuery] = useState('')

  // Filter conversations by search query
  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) return conversations

    const query = searchQuery.toLowerCase()
    return conversations.filter((convo) => {
      const otherUser = getOtherParticipant(convo)
      return otherUser.name?.toLowerCase().includes(query)
    })
  }, [conversations, searchQuery, getOtherParticipant])

  // Loading skeleton
  if (loading) {
    return (
      <div className={cn('flex flex-col h-full bg-background', className)}>
        {/* Header skeleton */}
        <div className="p-4 border-b space-y-3">
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-9 w-9 rounded-lg" />
          </div>
          <Skeleton className="h-10 w-full rounded-lg" />
        </div>

        {/* List skeleton */}
        <div className="flex-1 overflow-y-auto">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 p-4 border-b border-muted/50">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-48" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className={cn('flex flex-col h-full bg-background', className)}>
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-lg font-semibold text-foreground">Messages</h1>

          <Button
            onClick={onNewConversation}
            size="icon"
            className="h-9 w-9"
            aria-label="New message"
          >
            <PenSquare className="h-4 w-4" />
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-9 h-10"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
              onClick={() => setSearchQuery('')}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Conversation list */}
      <div className="flex-1 overflow-y-auto">
        {filteredConversations.length === 0 ? (
          <EmptyConversations
            isSearching={!!searchQuery}
            onNewConversation={onNewConversation}
          />
        ) : (
          filteredConversations.map((convo) => (
            <ConversationItem
              key={convo.id}
              conversation={convo}
              otherParticipant={getOtherParticipant(convo)}
              unreadCount={getUnreadCount(convo)}
              isSelected={selectedConversationId === convo.id}
              onClick={() => onSelectConversation(convo)}
            />
          ))
        )}
      </div>
    </div>
  )
}

export default ConversationList
