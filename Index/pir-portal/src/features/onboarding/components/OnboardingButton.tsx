/**
 * Onboarding Button Component
 *
 * Styled CTA button for onboarding screens.
 * Features teal gradient, proper touch targets (44px min), and loading state.
 */

import { forwardRef } from 'react'
import { cn } from '@/lib/utils'
import { Button, type ButtonProps } from '@/components/ui/button'
import { Loader2, ArrowRight, Check } from 'lucide-react'
import { motion } from 'framer-motion'

interface OnboardingButtonProps extends ButtonProps {
  isLoading?: boolean
  showArrow?: boolean
  showCheck?: boolean
}

export const OnboardingButton = forwardRef<HTMLButtonElement, OnboardingButtonProps>(
  ({ className, children, isLoading, showArrow, showCheck, disabled, ...props }, ref) => {
    return (
      <Button
        ref={ref}
        className={cn(
          'min-h-[48px] min-w-[140px] px-8 py-3',
          'bg-primary hover:bg-primary/90',
          'text-white font-semibold text-base',
          'rounded-xl shadow-lg',
          'transition-all duration-200',
          'active:scale-[0.98]',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          className
        )}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2"
          >
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Please wait...</span>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2"
          >
            {showCheck && <Check className="h-5 w-5" />}
            <span>{children}</span>
            {showArrow && <ArrowRight className="h-5 w-5" />}
          </motion.div>
        )}
      </Button>
    )
  }
)

OnboardingButton.displayName = 'OnboardingButton'

/**
 * Secondary/Ghost button variant for skip actions
 */
interface OnboardingSkipButtonProps extends ButtonProps {
  isLoading?: boolean
}

export const OnboardingSkipButton = forwardRef<HTMLButtonElement, OnboardingSkipButtonProps>(
  ({ className, children, isLoading, disabled, ...props }, ref) => {
    return (
      <Button
        ref={ref}
        variant="ghost"
        className={cn(
          'min-h-[44px] px-6 py-2',
          'text-white/70 hover:text-white hover:bg-white/10',
          'font-medium text-sm',
          'rounded-lg',
          'transition-all duration-200',
          className
        )}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          children
        )}
      </Button>
    )
  }
)

OnboardingSkipButton.displayName = 'OnboardingSkipButton'

export default OnboardingButton
