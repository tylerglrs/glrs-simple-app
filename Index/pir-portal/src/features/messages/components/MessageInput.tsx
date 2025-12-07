import { useState, useRef, useEffect, useCallback } from 'react'
import { Send, Image as ImageIcon, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface MessageInputProps {
  onSendText: (text: string) => Promise<boolean>
  onSendImage: (file: File) => Promise<boolean>
  onTyping?: () => void
  onStopTyping?: () => void
  sending?: boolean
  uploadingImage?: boolean
  uploadProgress?: number
  disabled?: boolean
  maxLength?: number
  className?: string
}

export function MessageInput({
  onSendText,
  onSendImage,
  onTyping,
  onStopTyping,
  sending = false,
  uploadingImage = false,
  uploadProgress = 0,
  disabled = false,
  maxLength = 1000,
  className,
}: MessageInputProps) {
  const [messageText, setMessageText] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const canSend = messageText.trim().length > 0 && !sending && !disabled
  const charCount = messageText.length
  const showCharCount = charCount > maxLength - 200

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      const newHeight = Math.min(textareaRef.current.scrollHeight, 120)
      textareaRef.current.style.height = `${newHeight}px`
    }
  }, [messageText])

  // Clear typing indicator on unmount
  useEffect(() => {
    return () => {
      onStopTyping?.()
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
    }
  }, [onStopTyping])

  // Handle text change
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const value = e.target.value
      if (value.length <= maxLength) {
        setMessageText(value)

        if (value.length > 0) {
          onTyping?.()

          // Clear existing timeout
          if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current)
          }

          // Stop typing after 3 seconds of inactivity
          typingTimeoutRef.current = setTimeout(() => {
            onStopTyping?.()
          }, 3000)
        } else {
          onStopTyping?.()
          if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current)
          }
        }
      }
    },
    [maxLength, onTyping, onStopTyping]
  )

  // Handle send
  const handleSend = useCallback(async () => {
    const trimmed = messageText.trim()
    if (!trimmed || sending) return

    onStopTyping?.()
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    const success = await onSendText(trimmed)
    if (success) {
      setMessageText('')
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto'
      }
    }
  }, [messageText, sending, onSendText, onStopTyping])

  // Handle key press
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        handleSend()
      }
    },
    [handleSend]
  )

  // Handle image selection
  const handleImageSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return

      try {
        await onSendImage(file)
      } catch (err) {
        // Error handling done in parent
        console.error('Image upload failed:', err)
      }

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    },
    [onSendImage]
  )

  return (
    <div className={cn('p-3 border-t bg-background', className)}>
      {/* Upload progress bar */}
      {uploadingImage && uploadProgress > 0 && (
        <div className="mb-2 flex items-center gap-2">
          <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300 ease-out rounded-full"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
          <span className="text-xs text-muted-foreground font-medium min-w-[40px]">
            {uploadProgress}%
          </span>
        </div>
      )}

      <div className="flex items-end gap-2">
        {/* Image upload button */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageSelect}
          className="hidden"
        />
        <Button
          variant="ghost"
          size="icon"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploadingImage || disabled}
          className="h-10 w-10 rounded-full flex-shrink-0"
          aria-label="Attach image"
        >
          {uploadingImage ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <ImageIcon className="h-5 w-5" />
          )}
        </Button>

        {/* Text input */}
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={messageText}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            disabled={sending || disabled}
            rows={1}
            className={cn(
              'w-full min-h-[40px] max-h-[120px] py-2.5 px-4 resize-none',
              'bg-muted/50 border border-input rounded-2xl',
              'text-sm leading-tight placeholder:text-muted-foreground',
              'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-0',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              showCharCount && 'pr-14'
            )}
            aria-label="Type a message"
          />

          {/* Character count */}
          {showCharCount && (
            <span
              className={cn(
                'absolute right-3 bottom-2.5 text-xs pointer-events-none',
                charCount >= maxLength ? 'text-destructive font-semibold' : 'text-muted-foreground'
              )}
            >
              {charCount}/{maxLength}
            </span>
          )}
        </div>

        {/* Send button */}
        <Button
          onClick={handleSend}
          disabled={!canSend}
          size="icon"
          className="h-10 w-10 rounded-full flex-shrink-0"
          aria-label={sending ? 'Sending message...' : 'Send message'}
        >
          {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  )
}

export default MessageInput
