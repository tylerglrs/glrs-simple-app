import { useEffect, useRef, useState, useMemo, useCallback } from 'react'
import { ArrowLeft, ChevronDown, MessageCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'
import { MessageBubble } from './MessageBubble'
import { MessageInput } from './MessageInput'
import { TypingIndicator } from './TypingIndicator'
import {
  useMessages,
  useSendMessage,
  useTypingIndicator,
  type Conversation,
  type Message,
  type Participant,
} from '../hooks/useConversations'

interface ChatThreadProps {
  conversation: Conversation
  currentUserId: string
  onBack: () => void
  onImageClick?: (imageUrl: string) => void
  isMobile?: boolean
  className?: string
}

// Format date header
function formatDateHeader(date: Date): string {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  const msgDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())

  if (msgDate.getTime() === today.getTime()) return 'Today'
  if (msgDate.getTime() === yesterday.getTime()) return 'Yesterday'

  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  })
}

// Group messages by sender and time
interface MessageGroup {
  senderId: string
  messages: Message[]
  timestamp: Date | null
}

function groupMessages(messages: Message[]): MessageGroup[] {
  const groups: MessageGroup[] = []
  let currentGroup: MessageGroup | null = null

  messages.forEach((msg, idx) => {
    const prevMsg = messages[idx - 1]
    const shouldGroup =
      prevMsg &&
      prevMsg.senderId === msg.senderId &&
      msg.createdAt &&
      prevMsg.createdAt &&
      msg.createdAt.getTime() - prevMsg.createdAt.getTime() < 60000

    if (shouldGroup && currentGroup) {
      currentGroup.messages.push(msg)
    } else {
      currentGroup = {
        senderId: msg.senderId,
        messages: [msg],
        timestamp: msg.createdAt,
      }
      groups.push(currentGroup)
    }
  })

  return groups
}

export function ChatThread({
  conversation,
  currentUserId,
  onBack,
  onImageClick,
  isMobile = false,
  className,
}: ChatThreadProps) {
  const { toast } = useToast()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const [isNearBottom, setIsNearBottom] = useState(true)

  // Get other participant
  const otherUser = useMemo((): Participant => {
    const otherUserId = conversation.participants.find((id) => id !== currentUserId)
    return (
      conversation.participantDetails?.[otherUserId || ''] || {
        name: 'Unknown',
        avatar: null,
        role: 'user',
      }
    )
  }, [conversation, currentUserId])

  // Hooks
  const { messages, loading, addOptimisticMessage, markAsRead } = useMessages(conversation.id)
  const { sendTextMessage, sendImageMessage, sending, uploadingImage, uploadProgress } =
    useSendMessage(conversation)
  const { isOtherUserTyping, handleTyping, stopTyping } = useTypingIndicator(conversation)

  // Group messages
  const groupedMessages = useMemo(() => groupMessages(messages), [messages])

  // Messages with date headers
  const messagesWithHeaders = useMemo(() => {
    const result: Array<
      | { type: 'date-header'; date: Date; key: string }
      | { type: 'message-group'; group: MessageGroup; key: string }
    > = []
    let lastDate: string | null = null

    groupedMessages.forEach((group) => {
      if (!group.timestamp) return
      const msgDate = group.timestamp.toDateString()
      if (msgDate !== lastDate) {
        result.push({
          type: 'date-header',
          date: group.timestamp,
          key: `header-${msgDate}`,
        })
        lastDate = msgDate
      }
      result.push({
        type: 'message-group',
        group,
        key: `group-${group.messages[0].id}`,
      })
    })

    return result
  }, [groupedMessages])

  // Scroll to bottom
  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior })
  }, [])

  // Handle scroll
  const handleScroll = useCallback(() => {
    if (!messagesContainerRef.current) return
    const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current
    const nearBottom = scrollHeight - scrollTop - clientHeight < 100
    setIsNearBottom(nearBottom)
  }, [])

  // Scroll to bottom when messages change (if near bottom)
  useEffect(() => {
    if (isNearBottom && messages.length > 0) {
      setTimeout(() => scrollToBottom(), 100)
    }
  }, [messages.length, isNearBottom, scrollToBottom])

  // Mark messages as read when viewing
  useEffect(() => {
    if (messages.length > 0) {
      markAsRead()
    }
  }, [messages, markAsRead])

  // Send text message
  const handleSendText = useCallback(
    async (text: string) => {
      const success = await sendTextMessage(text, addOptimisticMessage)
      if (success) {
        setTimeout(() => scrollToBottom(), 100)
      } else {
        toast({
          variant: 'destructive',
          title: 'Message failed',
          description: 'Could not send your message. Please try again.',
        })
      }
      return success
    },
    [sendTextMessage, addOptimisticMessage, scrollToBottom, toast]
  )

  // Send image message
  const handleSendImage = useCallback(
    async (file: File) => {
      try {
        const success = await sendImageMessage(file, addOptimisticMessage)
        if (success) {
          setTimeout(() => scrollToBottom(), 100)
        } else {
          toast({
            variant: 'destructive',
            title: 'Image failed',
            description: 'Could not send your image. Please try again.',
          })
        }
        return success
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Could not send your image.'
        toast({
          variant: 'destructive',
          title: 'Image failed',
          description: errorMessage,
        })
        return false
      }
    },
    [sendImageMessage, addOptimisticMessage, scrollToBottom, toast]
  )

  // Loading state
  if (loading) {
    return (
      <div
        className={cn(
          'flex flex-col h-full bg-background',
          className
        )}
      >
        {/* Header skeleton */}
        <div className="p-4 border-b flex items-center gap-3">
          {isMobile && <Skeleton className="h-9 w-9 rounded-lg" />}
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>

        {/* Messages skeleton */}
        <div className="flex-1 p-4 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    )
  }

  return (
    <div className={cn('flex flex-col h-full bg-background', className)}>
      {/* Header */}
      <div className="p-3 md:p-4 border-b flex items-center gap-3 sticky top-0 z-10 bg-background">
        {isMobile && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="-ml-2"
            aria-label="Back to conversations"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
        )}

        <Avatar className={cn('flex-shrink-0', isMobile ? 'h-9 w-9' : 'h-10 w-10')}>
          <AvatarImage src={otherUser.avatar || undefined} />
          <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
            {otherUser.name?.[0]?.toUpperCase() || '?'}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="text-base font-semibold text-foreground truncate">
            {otherUser.name || 'Unknown'}
          </div>
          {otherUser.role && (
            <div className="text-xs text-muted-foreground capitalize">{otherUser.role}</div>
          )}
        </div>
      </div>

      {/* Messages container */}
      <div
        ref={messagesContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-4 bg-muted/30"
      >
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-12 text-center">
            <MessageCircle className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <h3 className="text-base font-semibold text-foreground mb-2">No messages yet</h3>
            <p className="text-sm text-muted-foreground">
              Start the conversation by sending a message
            </p>
          </div>
        ) : (
          <>
            {messagesWithHeaders.map((item) => {
              if (item.type === 'date-header') {
                return (
                  <div key={item.key} className="flex justify-center my-4">
                    <span className="bg-primary/10 text-primary text-xs font-medium px-3 py-1 rounded-full">
                      {formatDateHeader(item.date)}
                    </span>
                  </div>
                )
              }

              const { group } = item
              const isOwn = group.senderId === currentUserId

              return (
                <div
                  key={item.key}
                  className={cn(
                    'flex flex-col mb-2',
                    isOwn ? 'items-end' : 'items-start'
                  )}
                >
                  {group.messages.map((msg, msgIdx) => (
                    <MessageBubble
                      key={msg.id}
                      message={msg}
                      isOwn={isOwn}
                      isFirstInGroup={msgIdx === 0}
                      isLastInGroup={msgIdx === group.messages.length - 1}
                      onImageClick={onImageClick}
                    />
                  ))}
                </div>
              )
            })}
          </>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Scroll to bottom button */}
      {!isNearBottom && messages.length > 0 && (
        <Button
          onClick={() => scrollToBottom()}
          size="icon"
          className="absolute bottom-20 right-5 h-10 w-10 rounded-full shadow-lg z-10"
          aria-label="Scroll to bottom"
        >
          <ChevronDown className="h-5 w-5" />
        </Button>
      )}

      {/* Typing indicator */}
      {isOtherUserTyping && <TypingIndicator userName={otherUser.name} />}

      {/* Message input */}
      <MessageInput
        onSendText={handleSendText}
        onSendImage={handleSendImage}
        onTyping={handleTyping}
        onStopTyping={stopTyping}
        sending={sending}
        uploadingImage={uploadingImage}
        uploadProgress={uploadProgress}
      />
    </div>
  )
}

export default ChatThread
