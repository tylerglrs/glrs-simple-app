/**
 * InsightsLoadingScreen Component
 *
 * Premium loading experience for AI Insights page.
 * Features animated beacon and cycling progress messages.
 */

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BeaconAnimation } from './BeaconAnimation'

// =============================================================================
// LOADING MESSAGES
// =============================================================================

const LOADING_MESSAGES = [
  'Analyzing your recovery patterns...',
  'Reviewing your check-ins...',
  'Loading your reflections...',
  'Loading your habits...',
  'Loading your goals...',
  'Identifying trends...',
  'Gathering your journey data...',
  'Preparing your insights...',
]

const MESSAGE_INTERVAL = 700 // 0.7 seconds between messages (8 messages * 0.7s = 5.6s)

// =============================================================================
// ANIMATION VARIANTS
// =============================================================================

const containerVariants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: 'easeOut' as const,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.3,
      ease: 'easeIn' as const,
    },
  },
}

const messageVariants = {
  initial: { opacity: 0, y: 10 },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: 'easeOut' as const,
    },
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: {
      duration: 0.3,
      ease: 'easeIn' as const,
    },
  },
}

const subtitleVariants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: {
      delay: 0.3,
      duration: 0.5,
    },
  },
}

// =============================================================================
// BACKGROUND GRADIENT ANIMATION
// =============================================================================

function AnimatedBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Base gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-900" />

      {/* Animated violet glow - top right */}
      <motion.div
        animate={{
          opacity: [0.2, 0.4, 0.2],
          scale: [1, 1.2, 1],
          x: [0, 20, 0],
          y: [0, -10, 0],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute -top-32 -right-32 w-96 h-96 rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(139, 92, 246, 0.3) 0%, transparent 70%)',
          filter: 'blur(40px)',
        }}
      />

      {/* Animated cyan glow - bottom left */}
      <motion.div
        animate={{
          opacity: [0.15, 0.3, 0.15],
          scale: [1, 1.3, 1],
          x: [0, -15, 0],
          y: [0, 15, 0],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 2,
        }}
        className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(6, 182, 212, 0.25) 0%, transparent 70%)',
          filter: 'blur(40px)',
        }}
      />

      {/* Subtle center glow */}
      <motion.div
        animate={{
          opacity: [0.05, 0.1, 0.05],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(139, 92, 246, 0.1) 0%, transparent 60%)',
          filter: 'blur(60px)',
        }}
      />
    </div>
  )
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

interface InsightsLoadingScreenProps {
  /** Callback when loading screen should transition out */
  onComplete?: () => void
  /** Minimum time to show loading screen (ms). Default: 2500 */
  minimumDuration?: number
  /** Whether data has finished loading */
  dataReady?: boolean
}

export function InsightsLoadingScreen({
  onComplete,
  minimumDuration = 2500,
  dataReady = false,
}: InsightsLoadingScreenProps) {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0)
  const [minimumTimeElapsed, setMinimumTimeElapsed] = useState(false)

  // Cycle through loading messages
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMessageIndex((prev) => (prev + 1) % LOADING_MESSAGES.length)
    }, MESSAGE_INTERVAL)

    return () => clearInterval(interval)
  }, [])

  // Track minimum duration
  useEffect(() => {
    const timer = setTimeout(() => {
      setMinimumTimeElapsed(true)
    }, minimumDuration)

    return () => clearTimeout(timer)
  }, [minimumDuration])

  // Trigger completion when both conditions are met
  useEffect(() => {
    if (minimumTimeElapsed && dataReady && onComplete) {
      onComplete()
    }
  }, [minimumTimeElapsed, dataReady, onComplete])

  return (
    <motion.div
      variants={containerVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="fixed inset-0 z-50 flex flex-col items-center justify-center"
    >
      <AnimatedBackground />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center">
        {/* Beacon Animation */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="mb-8"
        >
          <BeaconAnimation size={140} showRays />
        </motion.div>

        {/* Title */}
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="text-xl font-semibold text-white mb-2"
        >
          Beacon
        </motion.h2>

        {/* Cycling message */}
        <div className="h-6 flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.p
              key={currentMessageIndex}
              variants={messageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="text-sm text-slate-400 text-center"
            >
              {LOADING_MESSAGES[currentMessageIndex]}
            </motion.p>
          </AnimatePresence>
        </div>

        {/* Subtle subtitle */}
        <motion.p
          variants={subtitleVariants}
          initial="initial"
          animate="animate"
          className="text-xs text-slate-500 mt-6"
        >
          Beacon is loading...
        </motion.p>
      </div>
    </motion.div>
  )
}

export default InsightsLoadingScreen
