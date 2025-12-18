/**
 * Coach Mark Component
 *
 * A tooltip-style coach mark for progressive feature discovery.
 * Uses Radix UI Popover with glass-morphism styling.
 */

import { useRef, useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Lightbulb, ChevronRight } from 'lucide-react'
import { Popover, PopoverContent, PopoverAnchor } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import type { CoachMarkConfig } from './useCoachMarks'

interface CoachMarkProps {
  config: CoachMarkConfig
  isOpen: boolean
  onDismiss: () => void
  onNext?: () => void
  hasMore?: boolean
  anchorRef?: React.RefObject<HTMLElement>
  children?: React.ReactNode
}

export function CoachMark({
  config,
  isOpen,
  onDismiss,
  onNext,
  hasMore = false,
  anchorRef,
  children,
}: CoachMarkProps) {
  const [mounted, setMounted] = useState(false)

  // Delay mount for smooth entrance animation
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => setMounted(true), 100)
      return () => clearTimeout(timer)
    } else {
      setMounted(false)
    }
  }, [isOpen])

  // Map placement to Popover side
  const sideMap = {
    top: 'top' as const,
    bottom: 'bottom' as const,
    left: 'left' as const,
    right: 'right' as const,
  }

  const side = sideMap[config.placement || 'bottom']

  return (
    <Popover open={isOpen && mounted}>
      {/* If children provided, use them as anchor */}
      {children ? (
        <PopoverAnchor asChild>
          {children}
        </PopoverAnchor>
      ) : (
        <PopoverAnchor asChild>
          <span ref={anchorRef as React.RefObject<HTMLSpanElement>} />
        </PopoverAnchor>
      )}

      <AnimatePresence>
        {isOpen && mounted && (
          <PopoverContent
            side={side}
            sideOffset={12}
            align="center"
            className="w-72 p-0 border-0 shadow-xl z-[100]"
            onPointerDownOutside={(e) => {
              // Prevent closing when clicking outside (user must dismiss manually)
              e.preventDefault()
            }}
            asChild
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: side === 'top' ? 10 : -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: side === 'top' ? 10 : -10 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="relative overflow-hidden rounded-xl"
              style={{
                background: 'linear-gradient(135deg, rgba(6, 148, 148, 0.95) 0%, rgba(4, 120, 120, 0.95) 100%)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
              }}
            >
              {/* Header */}
              <div className="flex items-start justify-between p-4 pb-2">
                <div className="flex items-center gap-2">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{
                      background: 'rgba(255, 255, 255, 0.2)',
                    }}
                  >
                    <Lightbulb className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="text-base font-semibold text-white">
                    {config.title}
                  </h3>
                </div>

                {/* Close button */}
                <button
                  onClick={onDismiss}
                  className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors"
                  style={{ minWidth: '32px', minHeight: '32px' }}
                  aria-label="Dismiss tip"
                >
                  <X className="w-4 h-4 text-white/80" />
                </button>
              </div>

              {/* Description */}
              <p className="px-4 pb-3 text-sm text-white/90 leading-relaxed">
                {config.description}
              </p>

              {/* Footer */}
              <div className="px-4 pb-4 flex items-center justify-between">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onDismiss}
                  className="text-white/70 hover:text-white hover:bg-white/10 text-xs"
                >
                  Got it
                </Button>

                {hasMore && onNext && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      onDismiss()
                      onNext()
                    }}
                    className="text-white hover:bg-white/10 text-xs flex items-center gap-1"
                  >
                    Next tip
                    <ChevronRight className="w-3 h-3" />
                  </Button>
                )}
              </div>

              {/* Decorative arrow indicator */}
              <div
                className="absolute w-3 h-3 rotate-45"
                style={{
                  background: 'linear-gradient(135deg, rgba(6, 148, 148, 0.95) 0%, rgba(4, 120, 120, 0.95) 100%)',
                  ...(side === 'bottom' && {
                    top: '-6px',
                    left: '50%',
                    transform: 'translateX(-50%) rotate(45deg)',
                  }),
                  ...(side === 'top' && {
                    bottom: '-6px',
                    left: '50%',
                    transform: 'translateX(-50%) rotate(45deg)',
                  }),
                  ...(side === 'left' && {
                    right: '-6px',
                    top: '50%',
                    transform: 'translateY(-50%) rotate(45deg)',
                  }),
                  ...(side === 'right' && {
                    left: '-6px',
                    top: '50%',
                    transform: 'translateY(-50%) rotate(45deg)',
                  }),
                }}
              />
            </motion.div>
          </PopoverContent>
        )}
      </AnimatePresence>
    </Popover>
  )
}

/**
 * Inline Coach Mark Trigger
 *
 * Use this to wrap an element that should trigger a coach mark.
 */
interface CoachMarkTriggerProps {
  markId: string
  children: React.ReactNode
  className?: string
}

export function CoachMarkTrigger({ markId, children, className }: CoachMarkTriggerProps) {
  // This is a simple wrapper - the actual logic is handled by CoachMarkProvider
  return (
    <span data-coach-mark={markId} className={className}>
      {children}
    </span>
  )
}

export default CoachMark
