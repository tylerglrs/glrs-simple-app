import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  fullScreen?: boolean
  text?: string
  className?: string
  variant?: 'default' | 'branded'
}

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-8 w-8',
  lg: 'h-12 w-12',
}

const containerSizes = {
  sm: 'p-2',
  md: 'p-3',
  lg: 'p-4',
}

export function LoadingSpinner({
  size = 'md',
  fullScreen = false,
  text,
  className,
  variant = 'default',
}: LoadingSpinnerProps) {
  const spinner = (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      className={cn('flex flex-col items-center justify-center gap-3', className)}
    >
      {variant === 'branded' ? (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className={cn(
            'rounded-full bg-gradient-to-br from-teal-500 to-cyan-600',
            containerSizes[size]
          )}
        >
          <div className="h-full w-full rounded-full bg-background/90 flex items-center justify-center">
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className={cn('rounded-full bg-primary', sizeClasses[size])}
              style={{ width: size === 'sm' ? 8 : size === 'md' ? 16 : 24, height: size === 'sm' ? 8 : size === 'md' ? 16 : 24 }}
            />
          </div>
        </motion.div>
      ) : (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        >
          <Loader2 className={cn('text-primary', sizeClasses[size])} />
        </motion.div>
      )}
      {text && (
        <motion.p
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-sm text-muted-foreground font-medium"
        >
          {text}
        </motion.p>
      )}
    </motion.div>
  )

  if (fullScreen) {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-50"
        >
          {spinner}
        </motion.div>
      </AnimatePresence>
    )
  }

  return spinner
}
