import { ChevronRight } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import * as Icons from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import type { SettingsItemConfig } from '../types'

// ============================================================
// ICON RESOLVER
// ============================================================

function getIconComponent(iconName: string): LucideIcon | null {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const IconComponent = (Icons as any)[iconName]
  return IconComponent || null
}

// ============================================================
// SETTINGS ITEM COMPONENT
// ============================================================

interface SettingsItemProps {
  /** Item configuration */
  item: SettingsItemConfig
  /** Click handler */
  onClick: () => void
  /** Is mobile viewport */
  isMobile?: boolean
}

/**
 * Individual settings row with icon, label, description, and chevron
 * Matches the original ProfileTab.js card design
 */
export function SettingsItem({ item, onClick, isMobile = false }: SettingsItemProps) {
  const IconComponent = getIconComponent(item.icon)

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={item.disabled}
      className={cn(
        'w-full flex items-center gap-4 p-4 bg-card rounded-2xl border shadow-sm',
        'transition-all duration-200 cursor-pointer text-left',
        'hover:border-primary/50 hover:shadow-md hover:-translate-y-0.5',
        'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50',
        'active:scale-[0.99] active:shadow-sm',
        item.disabled && 'opacity-50 cursor-not-allowed hover:border-border hover:shadow-sm hover:translate-y-0',
        isMobile ? 'min-h-[72px]' : 'min-h-[88px]'
      )}
    >
      {/* Icon Container */}
      <div
        className={cn(
          'flex items-center justify-center rounded-2xl flex-shrink-0',
          isMobile ? 'w-12 h-12' : 'w-14 h-14'
        )}
        style={{
          background: item.iconBgColor || 'linear-gradient(135deg, #4A90E2 0%, #357ABD 100%)',
          boxShadow: `0 2px 8px ${item.iconColor || '#4A90E2'}40`,
        }}
      >
        {IconComponent && (
          <IconComponent
            className={cn('text-white', isMobile ? 'w-6 h-6' : 'w-7 h-7')}
            strokeWidth={2}
          />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-bold text-base text-foreground">{item.label}</span>
          {item.badge && (
            <Badge
              variant={item.badgeColor === 'destructive' ? 'destructive' : 'secondary'}
              className={cn(
                'text-xs',
                item.badgeColor === 'success' && 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400',
                item.badgeColor === 'warning' && 'bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400',
                item.badgeColor === 'primary' && 'bg-primary/10 text-primary'
              )}
            >
              {item.badge}
            </Badge>
          )}
        </div>
        {item.description && (
          <p className="text-sm text-muted-foreground truncate">{item.description}</p>
        )}
      </div>

      {/* Chevron */}
      {item.showChevron !== false && (
        <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
      )}
    </button>
  )
}

export default SettingsItem
