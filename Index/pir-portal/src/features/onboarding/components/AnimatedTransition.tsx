/**
 * Animated Transition Wrapper
 *
 * Provides smooth slide/fade transitions between onboarding screens.
 * Uses Framer Motion for performant animations.
 */

import type { ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface AnimatedTransitionProps {
  children: ReactNode
  screenKey: string
  direction?: 'forward' | 'backward'
}

const slideVariants = {
  enter: (direction: 'forward' | 'backward') => ({
    x: direction === 'forward' ? 100 : -100,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: 'forward' | 'backward') => ({
    x: direction === 'forward' ? -100 : 100,
    opacity: 0,
  }),
}

const fadeVariants = {
  enter: {
    opacity: 0,
    scale: 0.95,
  },
  center: {
    opacity: 1,
    scale: 1,
  },
  exit: {
    opacity: 0,
    scale: 1.05,
  },
}

export function AnimatedTransition({
  children,
  screenKey,
  direction = 'forward',
}: AnimatedTransitionProps) {
  return (
    <AnimatePresence mode="wait" custom={direction}>
      <motion.div
        key={screenKey}
        custom={direction}
        variants={slideVariants}
        initial="enter"
        animate="center"
        exit="exit"
        transition={{
          x: { type: 'spring', stiffness: 300, damping: 30 },
          opacity: { duration: 0.2 },
        }}
        className="w-full h-full"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}

/**
 * Fade-only transition for simpler animations
 */
export function FadeTransition({
  children,
  screenKey,
}: Omit<AnimatedTransitionProps, 'direction'>) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={screenKey}
        variants={fadeVariants}
        initial="enter"
        animate="center"
        exit="exit"
        transition={{
          duration: 0.3,
          ease: 'easeInOut',
        }}
        className="w-full h-full"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}

/**
 * Staggered children animation wrapper
 */
interface StaggerChildrenProps {
  children: ReactNode
  staggerDelay?: number
}

export function StaggerChildren({ children, staggerDelay = 0.1 }: StaggerChildrenProps) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: staggerDelay,
          },
        },
      }}
    >
      {children}
    </motion.div>
  )
}

/**
 * Individual stagger item
 */
export function StaggerItem({ children }: { children: ReactNode }) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.4, ease: 'easeOut' },
        },
      }}
    >
      {children}
    </motion.div>
  )
}

export default AnimatedTransition
