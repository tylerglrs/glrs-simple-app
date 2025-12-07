import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import { cardHover } from '@/lib/animations'

interface GradientCardProps {
  children: React.ReactNode
  gradient?: string
  hoverEffect?: boolean
  className?: string
  onClick?: () => void
}

export function GradientCard({
  children,
  gradient = 'from-white to-slate-50',
  hoverEffect = false,
  className,
  onClick,
}: GradientCardProps) {
  const baseClasses = cn(
    'rounded-xl border border-border/50 shadow-sm overflow-hidden',
    `bg-gradient-to-br ${gradient}`,
    className
  )

  if (hoverEffect) {
    return (
      <motion.div
        variants={cardHover}
        initial="rest"
        whileHover="hover"
        whileTap="tap"
        className={baseClasses}
        onClick={onClick}
      >
        {children}
      </motion.div>
    )
  }

  return (
    <div className={baseClasses} onClick={onClick}>
      {children}
    </div>
  )
}

// Preset gradient cards
export function TealGradientCard({ children, className, ...props }: Omit<GradientCardProps, 'gradient'>) {
  return (
    <GradientCard
      gradient="from-teal-500 to-cyan-600"
      className={cn('text-white border-0', className)}
      {...props}
    >
      {children}
    </GradientCard>
  )
}

export function WarmGradientCard({ children, className, ...props }: Omit<GradientCardProps, 'gradient'>) {
  return (
    <GradientCard
      gradient="from-amber-400 to-orange-500"
      className={cn('text-white border-0', className)}
      {...props}
    >
      {children}
    </GradientCard>
  )
}

export function RoseGradientCard({ children, className, ...props }: Omit<GradientCardProps, 'gradient'>) {
  return (
    <GradientCard
      gradient="from-rose-400 to-pink-500"
      className={cn('text-white border-0', className)}
      {...props}
    >
      {children}
    </GradientCard>
  )
}

export function CalmGradientCard({ children, className, ...props }: Omit<GradientCardProps, 'gradient'>) {
  return (
    <GradientCard
      gradient="from-indigo-400 to-purple-500"
      className={cn('text-white border-0', className)}
      {...props}
    >
      {children}
    </GradientCard>
  )
}
