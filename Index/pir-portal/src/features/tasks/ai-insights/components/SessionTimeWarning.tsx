/**
 * SessionTimeWarning Component
 * Phase 6/Task 6.5: Session Time Awareness UI
 *
 * Displays gentle break reminders based on session duration.
 * Non-intrusive but noticeable inline alert.
 */

import { motion, AnimatePresence } from 'framer-motion'
import { Clock, Coffee, Wind, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { haptics } from '@/lib/animations'
import type { SessionWarning } from '@/hooks/useSessionTime'

interface SessionTimeWarningProps {
  warning: SessionWarning | null
  onDismiss: () => void
  onTakeBreak: () => void
}

export function SessionTimeWarning({
  warning,
  onDismiss,
  onTakeBreak,
}: SessionTimeWarningProps) {
  if (!warning) return null

  const isStrong = warning.severity === 'strong'

  const handleDismiss = () => {
    haptics.tap()
    onDismiss()
  }

  const handleTakeBreak = () => {
    haptics.select()
    onTakeBreak()
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="px-3 md:px-4"
      >
        <div
          className={cn(
            'relative rounded-xl overflow-hidden',
            'border',
            isStrong
              ? 'bg-amber-50 border-amber-200'
              : 'bg-blue-50 border-blue-200'
          )}
        >
          {/* Content */}
          <div className="p-3 md:p-4">
            {/* Header */}
            <div className="flex items-start gap-3">
              <div
                className={cn(
                  'p-2 rounded-lg flex-shrink-0',
                  isStrong ? 'bg-amber-100' : 'bg-blue-100'
                )}
              >
                {isStrong ? (
                  <Coffee
                    className={cn(
                      'w-5 h-5',
                      isStrong ? 'text-amber-600' : 'text-blue-600'
                    )}
                  />
                ) : (
                  <Clock
                    className={cn(
                      'w-5 h-5',
                      isStrong ? 'text-amber-600' : 'text-blue-600'
                    )}
                  />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3
                    className={cn(
                      'font-semibold text-sm',
                      isStrong ? 'text-amber-900' : 'text-blue-900'
                    )}
                  >
                    {warning.title}
                  </h3>
                  <span
                    className={cn(
                      'text-xs px-2 py-0.5 rounded-full',
                      isStrong
                        ? 'bg-amber-200 text-amber-800'
                        : 'bg-blue-200 text-blue-800'
                    )}
                  >
                    {warning.minutesElapsed}m
                  </span>
                </div>
                <p
                  className={cn(
                    'text-sm leading-relaxed',
                    isStrong ? 'text-amber-800' : 'text-blue-800'
                  )}
                >
                  {warning.message}
                </p>
              </div>

              {/* Dismiss button */}
              <button
                onClick={handleDismiss}
                className={cn(
                  'p-1 rounded-lg transition-colors flex-shrink-0',
                  isStrong
                    ? 'hover:bg-amber-200 text-amber-600'
                    : 'hover:bg-blue-200 text-blue-600'
                )}
                aria-label="Dismiss"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-dashed border-current/10">
              <motion.button
                onClick={handleTakeBreak}
                className={cn(
                  'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium',
                  'transition-colors',
                  isStrong
                    ? 'bg-amber-600 text-white hover:bg-amber-700'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                )}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Wind className="w-4 h-4" />
                Take a Break
              </motion.button>

              <motion.button
                onClick={handleDismiss}
                className={cn(
                  'px-3 py-2 rounded-lg text-sm font-medium',
                  'transition-colors',
                  isStrong
                    ? 'text-amber-700 hover:bg-amber-100'
                    : 'text-blue-700 hover:bg-blue-100'
                )}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Continue
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

export default SessionTimeWarning
