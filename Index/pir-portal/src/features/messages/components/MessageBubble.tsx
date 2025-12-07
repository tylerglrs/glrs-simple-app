import { cn } from '@/lib/utils'
import { Check, CheckCheck } from 'lucide-react'
import type { Message } from '../hooks/useConversations'

interface MessageBubbleProps {
  message: Message
  isOwn: boolean
  isFirstInGroup?: boolean
  isLastInGroup?: boolean
  onImageClick?: (imageUrl: string) => void
}

export function MessageBubble({
  message,
  isOwn,
  isFirstInGroup = true,
  isLastInGroup = true,
  onImageClick,
}: MessageBubbleProps) {
  const isImage = message.type === 'image'

  // Format time
  const formatTime = (date: Date | null) => {
    if (!date) return ''
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
  }

  // Get bubble border radius based on position in group
  const getBubbleRadius = () => {
    if (isOwn) {
      if (isFirstInGroup && isLastInGroup) return 'rounded-2xl'
      if (isFirstInGroup) return 'rounded-2xl rounded-br-sm'
      if (isLastInGroup) return 'rounded-2xl rounded-tr-sm'
      return 'rounded-2xl rounded-r-sm'
    } else {
      if (isFirstInGroup && isLastInGroup) return 'rounded-2xl'
      if (isFirstInGroup) return 'rounded-2xl rounded-bl-sm'
      if (isLastInGroup) return 'rounded-2xl rounded-tl-sm'
      return 'rounded-2xl rounded-l-sm'
    }
  }

  // Read receipt icon
  const ReadReceipt = () => {
    if (!isOwn) return null

    const status = message.status || 'sent'

    if (status === 'sent') {
      return <Check className="h-3.5 w-3.5 text-white/70" aria-label="Sent" />
    }

    if (status === 'delivered') {
      return <CheckCheck className="h-4 w-4 text-white/70" aria-label="Delivered" />
    }

    if (status === 'read') {
      return <CheckCheck className="h-4 w-4 text-green-400" aria-label="Read" />
    }

    return null
  }

  return (
    <div
      className={cn('max-w-[85%] md:max-w-[70%] mb-0.5', isOwn ? 'ml-auto' : 'mr-auto')}
    >
      {isImage && message.imageUrl ? (
        // Image message
        <div
          onClick={() => onImageClick?.(message.imageUrl!)}
          className="cursor-pointer rounded-xl overflow-hidden shadow-sm hover:opacity-95 transition-opacity"
        >
          <img
            src={message.imageUrl}
            alt="Shared image"
            className="max-w-full max-h-[300px] block rounded-xl"
          />
        </div>
      ) : (
        // Text message
        <div
          className={cn(
            'px-3 py-2 break-words whitespace-pre-wrap text-sm md:text-base shadow-sm',
            getBubbleRadius(),
            isOwn
              ? 'bg-gradient-to-br from-primary to-primary/90 text-primary-foreground'
              : 'bg-muted text-foreground'
          )}
        >
          {message.text}
        </div>
      )}

      {/* Timestamp and read receipt */}
      {isLastInGroup && (
        <div
          className={cn(
            'flex items-center gap-1 mt-1 text-xs text-muted-foreground',
            isOwn ? 'justify-end' : 'justify-start'
          )}
        >
          <span>{formatTime(message.createdAt)}</span>
          <ReadReceipt />
        </div>
      )}
    </div>
  )
}

export default MessageBubble
