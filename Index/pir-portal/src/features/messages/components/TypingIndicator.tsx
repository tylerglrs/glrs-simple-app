import { cn } from '@/lib/utils'

interface TypingIndicatorProps {
  userName?: string
  className?: string
}

export function TypingIndicator({ userName = 'User', className }: TypingIndicatorProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-2 px-4 py-2 bg-muted/50 border-t text-sm text-muted-foreground',
        className
      )}
    >
      <div className="flex gap-1 items-center">
        <span
          className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce"
          style={{ animationDelay: '0ms' }}
        />
        <span
          className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce"
          style={{ animationDelay: '150ms' }}
        />
        <span
          className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce"
          style={{ animationDelay: '300ms' }}
        />
      </div>
      <span className="italic">{userName} is typing...</span>
    </div>
  )
}

export default TypingIndicator
