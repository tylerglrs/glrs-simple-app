import { motion, AnimatePresence } from 'framer-motion'
import { pageVariants, pageTransition } from '@/lib/animations'

interface PageTransitionProps {
  children: React.ReactNode
  className?: string
}

export function PageTransition({ children, className }: PageTransitionProps) {
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={pageTransition}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// For wrapping route content with AnimatePresence
interface PageContainerProps {
  children: React.ReactNode
  locationKey: string
  className?: string
}

export function PageContainer({ children, locationKey, className }: PageContainerProps) {
  return (
    <AnimatePresence mode="wait">
      <PageTransition key={locationKey} className={className}>
        {children}
      </PageTransition>
    </AnimatePresence>
  )
}

// Fade only transition (no Y movement)
export function FadeTransition({ children, className }: PageTransitionProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// Scale and fade in (good for modals/overlays)
export function ScaleTransition({ children, className }: PageTransitionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// Slide up transition (good for bottom sheets)
export function SlideUpTransition({ children, className }: PageTransitionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// Animate individual element when it enters viewport
interface AnimateInViewProps {
  children: React.ReactNode
  className?: string
  delay?: number
}

export function AnimateInView({ children, className, delay = 0 }: AnimateInViewProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.4, delay }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
