import type { LucideIcon } from 'lucide-react'
import { ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ActionCardProps {
  icon: LucideIcon
  title: string
  description: string
  gradient?: string
  onClick: () => void
  className?: string
  badge?: string | number
  completed?: boolean
}

export function ActionCard({
  icon: Icon,
  title,
  description,
  gradient = 'from-primary to-primary/80',
  onClick,
  className,
  badge,
  completed = false,
}: ActionCardProps) {
  return (
    <button
      onClick={onClick}
      disabled={completed}
      className={cn(
        'relative w-full p-4 rounded-xl text-left transition-all duration-200',
        'bg-gradient-to-br',
        gradient,
        'text-white shadow-lg',
        !completed && 'hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]',
        completed && 'opacity-50 cursor-not-allowed',
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="p-2 rounded-lg bg-white/20">
          <Icon className="h-5 w-5 text-white" />
        </div>
        <div className="flex items-center gap-2">
          {badge !== undefined && (
            <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-white/20">
              {badge}
            </span>
          )}
          <ChevronRight className="h-5 w-5 text-white/60" />
        </div>
      </div>
      <div className="mt-3">
        <h3 className="font-semibold text-white">{title}</h3>
        <p className="text-sm text-white/80 mt-0.5">{description}</p>
      </div>
      {completed && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-xl">
          <span className="px-3 py-1 text-sm font-medium bg-white/20 rounded-full">
            Completed
          </span>
        </div>
      )}
    </button>
  )
}
