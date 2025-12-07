import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import type { LucideIcon } from 'lucide-react'
import { cardHover, haptics } from '@/lib/animations'

// Theme style interface
interface ThemeStyle {
  gradient: string
  iconBg: string
  iconColor: string
  bgClass?: string
  borderClass?: string
  titleColor?: string
}

// Predefined toolkit themes
export const toolkitThemes: Record<string, ThemeStyle> = {
  gratitude: {
    gradient: 'from-rose-50 to-pink-100',
    iconBg: 'bg-rose-100',
    iconColor: 'text-rose-500',
  },
  journal: {
    gradient: 'from-amber-50 to-orange-100',
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-500',
  },
  coping: {
    gradient: 'from-teal-50 to-cyan-100',
    iconBg: 'bg-teal-100',
    iconColor: 'text-teal-500',
  },
  goals: {
    gradient: 'from-purple-50 to-indigo-100',
    iconBg: 'bg-purple-100',
    iconColor: 'text-purple-500',
  },
  challenges: {
    gradient: 'from-indigo-50 to-blue-100',
    iconBg: 'bg-indigo-100',
    iconColor: 'text-indigo-500',
  },
  breathe: {
    gradient: 'from-sky-50 to-blue-100',
    iconBg: 'bg-sky-100',
    iconColor: 'text-sky-500',
  },
  meditate: {
    gradient: 'from-violet-50 to-purple-100',
    iconBg: 'bg-violet-100',
    iconColor: 'text-violet-500',
  },
  share: {
    gradient: 'from-emerald-50 to-green-100',
    iconBg: 'bg-emerald-100',
    iconColor: 'text-emerald-500',
  },
  morning: {
    gradient: '',
    bgClass: 'bg-transparent',
    borderClass: 'border border-slate-200/60',
    iconBg: 'bg-gradient-to-br from-amber-400 to-orange-500',
    iconColor: 'text-white',
    titleColor: 'text-teal-600',
  },
  evening: {
    gradient: '',
    bgClass: 'bg-transparent',
    borderClass: 'border border-slate-200/60',
    iconBg: 'bg-gradient-to-br from-indigo-400 to-purple-500',
    iconColor: 'text-white',
    titleColor: 'text-teal-600',
  },
  tasks: {
    gradient: 'from-teal-50 to-emerald-100',
    iconBg: 'bg-teal-100',
    iconColor: 'text-teal-600',
  },
  meetings: {
    gradient: 'from-purple-50 to-violet-100',
    iconBg: 'bg-purple-100',
    iconColor: 'text-purple-500',
  },
  transparent: {
    gradient: '',
    bgClass: 'bg-white/60 backdrop-blur-sm shadow-sm',
    borderClass: 'border-0',
    iconBg: 'bg-gradient-to-br from-teal-400 to-teal-600',
    iconColor: 'text-white',
    titleColor: 'text-teal-600',
  },
}

export type ToolkitTheme = 'gratitude' | 'journal' | 'coping' | 'goals' | 'challenges' | 'breathe' | 'meditate' | 'share' | 'morning' | 'evening' | 'tasks' | 'meetings' | 'transparent'

interface ToolkitCardProps {
  icon: LucideIcon
  title: string
  subtitle?: string
  time?: string
  theme: ToolkitTheme
  onClick?: () => void
  disabled?: boolean
  badge?: string | number
  className?: string
}

export function ToolkitCard({
  icon: Icon,
  title,
  subtitle,
  time,
  theme,
  onClick,
  disabled = false,
  badge,
  className,
}: ToolkitCardProps) {
  const themeStyles = toolkitThemes[theme]

  return (
    <motion.button
      variants={cardHover}
      initial="rest"
      whileHover={disabled ? undefined : 'hover'}
      whileTap={disabled ? undefined : 'tap'}
      onClick={() => {
        if (!disabled && onClick) {
          haptics.tap()
          onClick()
        }
      }}
      disabled={disabled}
      className={cn(
        'relative w-full p-4 rounded-xl text-left',
        'transition-shadow duration-200',
        themeStyles.gradient ? `bg-gradient-to-br ${themeStyles.gradient}` : themeStyles.bgClass,
        // Handle border: use custom borderClass if provided, otherwise default styling
        themeStyles.borderClass
          ? themeStyles.borderClass
          : 'border border-white/50 shadow-sm',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
    >
      {/* Badge */}
      {badge !== undefined && (
        <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1.5 flex items-center justify-center rounded-full bg-teal-500 text-white text-xs font-medium">
          {badge}
        </span>
      )}

      {/* Icon */}
      <div
        className={cn(
          'w-10 h-10 rounded-lg flex items-center justify-center mb-3',
          themeStyles.iconBg
        )}
      >
        <Icon className={cn('w-5 h-5', themeStyles.iconColor)} />
      </div>

      {/* Content */}
      <div>
        <h3 className={cn('font-semibold', themeStyles.titleColor || 'text-slate-800')}>{title}</h3>
        {subtitle && (
          <p className="text-sm text-slate-600 mt-0.5">{subtitle}</p>
        )}
        {time && (
          <p className="text-xs text-slate-500 mt-1">{time}</p>
        )}
      </div>
    </motion.button>
  )
}

// Grid wrapper for toolkit cards
interface ToolkitGridProps {
  children: React.ReactNode
  columns?: 2 | 3
  className?: string
}

export function ToolkitGrid({ children, columns = 2, className }: ToolkitGridProps) {
  return (
    <div
      className={cn(
        'grid gap-3',
        columns === 2 ? 'grid-cols-2' : 'grid-cols-3',
        className
      )}
    >
      {children}
    </div>
  )
}
