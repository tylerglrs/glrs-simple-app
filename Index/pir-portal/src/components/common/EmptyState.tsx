import { motion } from 'framer-motion'
import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { haptics } from '@/lib/animations'

interface EmptyStateProps {
  icon?: LucideIcon
  illustration?: ReactNode
  title: string
  description: string
  action?: {
    label: string
    onClick: () => void
  }
  className?: string
  variant?: 'default' | 'card'
}

export function EmptyState({
  icon: Icon,
  illustration,
  title,
  description,
  action,
  className,
  variant = 'default',
}: EmptyStateProps) {
  const handleAction = () => {
    haptics.tap()
    action?.onClick()
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className={cn(
        'flex flex-col items-center justify-center py-12 px-4 text-center',
        variant === 'card' && 'rounded-xl border-2 border-dashed border-muted-foreground/20 bg-muted/20',
        className
      )}
    >
      {/* Illustration or Icon */}
      {illustration ? (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring' as const, stiffness: 260, damping: 20, delay: 0.1 }}
          className="mb-4"
        >
          {illustration}
        </motion.div>
      ) : Icon && (
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring' as const, stiffness: 260, damping: 20, delay: 0.1 }}
          className="rounded-full bg-gradient-to-br from-muted to-muted/50 p-5 mb-4 shadow-inner"
        >
          <Icon className="h-8 w-8 text-muted-foreground" />
        </motion.div>
      )}
      <motion.h3
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-lg font-semibold text-foreground mb-2"
      >
        {title}
      </motion.h3>
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-sm text-muted-foreground max-w-sm mb-6"
      >
        {description}
      </motion.p>
      {action && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button onClick={handleAction}>
            {action.label}
          </Button>
        </motion.div>
      )}
    </motion.div>
  )
}
