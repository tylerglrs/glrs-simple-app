import { useState, useCallback } from 'react'
import { MessageSquare, Plus, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useConversations, type Conversation } from '../hooks/useConversations'
import { ConversationList } from './ConversationList'
import { ChatThread } from './ChatThread'
import { useModalStore } from '@/stores/modalStore'
import { useMediaQuery } from '@/hooks/useMediaQuery'

export function MessagesTab() {
  const isMobile = useMediaQuery('(max-width: 768px)')

  const {
    conversations,
    loading,
    currentUserId,
    getOtherParticipant,
    getUnreadCount,
  } = useConversations()

  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)

  const { openModal } = useModalStore()

  // Handle new conversation
  const handleNewConversation = useCallback(() => {
    openModal('newConversation', {
      onSelectConversation: (conversation: unknown) => {
        setSelectedConversation(conversation as Conversation)
      },
    })
  }, [openModal])

  // Handle conversation selection
  const handleSelectConversation = useCallback((conversation: Conversation) => {
    setSelectedConversation(conversation)
  }, [])

  // Handle back from thread (mobile)
  const handleBack = useCallback(() => {
    setSelectedConversation(null)
  }, [])

  // Handle image click - opens lightbox modal
  const handleImageClick = useCallback((imageUrl: string) => {
    openModal('imageLightbox', { imageUrl })
  }, [openModal])

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto mb-3" />
          <p className="text-sm text-muted-foreground font-medium">Loading conversations...</p>
        </div>
      </div>
    )
  }

  // Not authenticated
  if (!currentUserId) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <MessageSquare className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
          <h2 className="text-lg font-semibold mb-2">Sign in to view messages</h2>
          <p className="text-sm text-muted-foreground">
            Please sign in to access your conversations.
          </p>
        </div>
      </div>
    )
  }

  // Mobile view - show either list or thread
  const showConversationList = isMobile ? !selectedConversation : true
  const showMessageThread = isMobile ? !!selectedConversation : !!selectedConversation

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-background">
      {/* Conversation List */}
      {showConversationList && (
        <ConversationList
          conversations={conversations}
          loading={loading}
          selectedConversationId={selectedConversation?.id}
          onSelectConversation={handleSelectConversation}
          onNewConversation={handleNewConversation}
          getOtherParticipant={getOtherParticipant}
          getUnreadCount={getUnreadCount}
          className={cn(
            isMobile ? 'w-full' : 'w-[380px] border-r',
            !isMobile && 'flex-shrink-0'
          )}
        />
      )}

      {/* Message Thread */}
      {showMessageThread && selectedConversation && (
        <ChatThread
          conversation={selectedConversation}
          currentUserId={currentUserId}
          onBack={handleBack}
          onImageClick={handleImageClick}
          isMobile={isMobile}
          className="flex-1"
        />
      )}

      {/* Desktop: Empty state when no conversation selected */}
      {!isMobile && !selectedConversation && (
        <div className="flex-1 bg-muted/30 flex flex-col items-center justify-center">
          <MessageSquare className="h-16 w-16 text-muted-foreground/30 mb-4" />
          <h2 className="text-lg font-semibold text-foreground mb-2">
            Select a conversation
          </h2>
          <p className="text-sm text-muted-foreground mb-5 text-center max-w-[280px]">
            Choose a conversation from the list or start a new one
          </p>
          <Button onClick={handleNewConversation}>
            <Plus className="h-4 w-4 mr-2" />
            New Message
          </Button>
        </div>
      )}
    </div>
  )
}

export default MessagesTab
