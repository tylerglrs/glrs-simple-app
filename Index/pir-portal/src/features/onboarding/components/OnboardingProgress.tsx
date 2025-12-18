/**
 * Onboarding Progress Indicator
 *
 * Shows dot indicators for current screen position in onboarding flow.
 * Styled with teal accent for active dot, glass-morphism effect.
 */

import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

interface OnboardingProgressProps {
  currentIndex: number
  totalScreens: number
  className?: string
}

export function OnboardingProgress({
  currentIndex,
  totalScreens,
  className,
}: OnboardingProgressProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-center gap-2',
        className
      )}
      role="progressbar"
      aria-valuenow={currentIndex + 1}
      aria-valuemin={1}
      aria-valuemax={totalScreens}
      aria-label={`Step ${currentIndex + 1} of ${totalScreens}`}
    >
      {Array.from({ length: totalScreens }).map((_, index) => (
        <motion.div
          key={index}
          className={cn(
            'rounded-full transition-all duration-300',
            index === currentIndex
              ? 'w-8 h-2 bg-primary'
              : index < currentIndex
              ? 'w-2 h-2 bg-primary/50'
              : 'w-2 h-2 bg-white/30'
          )}
          initial={false}
          animate={{
            scale: index === currentIndex ? 1 : 0.9,
          }}
          transition={{ duration: 0.2 }}
          aria-hidden="true"
        />
      ))}
    </div>
  )
}

export default OnboardingProgress
