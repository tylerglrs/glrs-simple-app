import { Menu, User } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TabHeaderProps {
  title: string
  onMenuClick: () => void
  onProfileClick?: () => void
  /** When true, profile icon is visible but grayed out and non-clickable */
  profileDisabled?: boolean
  children?: React.ReactNode // For additional actions (filters, calendar, etc.)
  className?: string
}

/**
 * Standardized header for all tabs
 *
 * Layout: [Hamburger] [Title] ... [children] [Profile]
 *
 * Features:
 * - Transparent background (gradient shows through)
 * - iOS safe area support
 * - Sticky positioning
 * - Touch-friendly targets
 */
export function TabHeader({
  title,
  onMenuClick,
  onProfileClick,
  profileDisabled = false,
  children,
  className
}: TabHeaderProps) {
  return (
    <header
      className={cn(
        'sticky z-40 w-full pt-safe',
        'bg-transparent',
        className
      )}
      style={{ top: 'env(safe-area-inset-top, 0px)' }}
    >
      <div className="flex h-10 items-center justify-between px-4">
        {/* Left: Hamburger + Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuClick}
            className={cn(
              'flex h-10 w-10 items-center justify-center',
              '-ml-2 rounded-full transition-colors',
              'hover:bg-black/5 active:bg-black/10',
              'cursor-pointer touch-manipulation'
            )}
            aria-label="Open menu"
          >
            <Menu className="h-6 w-6 text-slate-700" />
          </button>
          <h1 className="text-xl font-semibold text-slate-900">{title}</h1>
        </div>

        {/* Right: Additional actions + Profile */}
        <div className="flex items-center gap-2">
          {children}
          <button
            onClick={profileDisabled ? undefined : onProfileClick}
            disabled={profileDisabled}
            className={cn(
              'flex h-10 w-10 items-center justify-center',
              '-mr-2 rounded-full transition-colors',
              profileDisabled
                ? 'opacity-50 cursor-not-allowed'
                : 'hover:bg-black/5 active:bg-black/10 cursor-pointer',
              'touch-manipulation'
            )}
            aria-label={profileDisabled ? 'Profile (coming soon)' : 'Profile'}
          >
            <User className={cn('h-6 w-6', profileDisabled ? 'text-slate-400' : 'text-slate-700')} />
          </button>
        </div>
      </div>
    </header>
  )
}

export default TabHeader
