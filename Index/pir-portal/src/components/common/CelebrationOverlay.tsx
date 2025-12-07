import { useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  celebrate,
  milestoneCelebration,
  streakCelebration,
  achievementCelebration,
  checkInCelebration,
} from '@/lib/animations'
import { cn } from '@/lib/utils'

type CelebrationType = 'default' | 'milestone' | 'streak' | 'achievement' | 'checkin'

interface CelebrationOverlayProps {
  show: boolean
  type?: CelebrationType
  message?: string
  subMessage?: string
  onComplete?: () => void
  duration?: number
  className?: string
}

export function CelebrationOverlay({
  show,
  type = 'default',
  message,
  subMessage,
  onComplete,
  duration = 3000,
  className,
}: CelebrationOverlayProps) {
  const triggerCelebration = useCallback(() => {
    switch (type) {
      case 'milestone':
        milestoneCelebration()
        break
      case 'streak':
        streakCelebration()
        break
      case 'achievement':
        achievementCelebration()
        break
      case 'checkin':
        checkInCelebration()
        break
      default:
        celebrate()
    }
  }, [type])

  useEffect(() => {
    if (show) {
      triggerCelebration()
      if (onComplete) {
        const timer = setTimeout(onComplete, duration)
        return () => clearTimeout(timer)
      }
    }
  }, [show, triggerCelebration, onComplete, duration])

  return (
    <AnimatePresence>
      {show && message && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={cn(
            'fixed inset-0 z-50 flex items-center justify-center pointer-events-none',
            className
          )}
        >
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-2xl text-center max-w-sm mx-4"
          >
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 0.5, repeat: 2 }}
              className="text-4xl mb-4"
            >
              {type === 'milestone' && '🎉'}
              {type === 'streak' && '🔥'}
              {type === 'achievement' && '🏆'}
              {type === 'checkin' && '✅'}
              {type === 'default' && '🎊'}
            </motion.div>
            <h2 className="text-xl font-bold text-slate-800">{message}</h2>
            {subMessage && (
              <p className="text-muted-foreground mt-2">{subMessage}</p>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Hook for programmatic celebrations
export function useCelebration() {
  const trigger = useCallback((type: CelebrationType = 'default') => {
    switch (type) {
      case 'milestone':
        milestoneCelebration()
        break
      case 'streak':
        streakCelebration()
        break
      case 'achievement':
        achievementCelebration()
        break
      case 'checkin':
        checkInCelebration()
        break
      default:
        celebrate()
    }
  }, [])

  return { celebrate: trigger }
}
