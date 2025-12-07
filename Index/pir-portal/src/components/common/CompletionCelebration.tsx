import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { Check, ChevronRight, ArrowLeft, Sun, Moon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { checkInCelebration, haptics } from '@/lib/animations'
import { useMediaQuery } from '@/hooks/useMediaQuery'

// =============================================================================
// TYPES
// =============================================================================

export type CompletionType = 'checkin' | 'reflection'

interface NavigationSuggestion {
  title: string
  description: string
  onClick: () => void
}

export interface CompletionCelebrationProps {
  type: CompletionType
  title: string
  subtitle?: string
  navigationSuggestion?: NavigationSuggestion
  onBack: () => void
  className?: string
}

// =============================================================================
// ANIMATION VARIANTS
// =============================================================================

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring' as const,
      stiffness: 300,
      damping: 24,
    },
  },
}

const checkmarkVariants = {
  hidden: { scale: 0, opacity: 0 },
  show: {
    scale: 1,
    opacity: 1,
    transition: {
      type: 'spring' as const,
      stiffness: 400,
      damping: 15,
      delay: 0.3,
    },
  },
}

// =============================================================================
// SUB-COMPONENTS
// =============================================================================

function BackgroundIllustration({ type }: { type: CompletionType }) {
  const isMorning = type === 'checkin'

  return (
    <div className="absolute inset-x-0 top-0 h-48 overflow-hidden pointer-events-none">
      {/* Gradient background */}
      <div
        className={cn(
          'absolute inset-0 bg-gradient-to-b',
          isMorning
            ? 'from-amber-100 via-orange-50 to-transparent'
            : 'from-indigo-100 via-purple-50 to-transparent'
        )}
      />

      {/* Abstract shapes */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 0.3, scale: 1 }}
        transition={{ duration: 1, ease: 'easeOut' }}
        className={cn(
          'absolute -top-20 -right-20 w-64 h-64 rounded-full',
          isMorning ? 'bg-amber-200' : 'bg-indigo-200'
        )}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 0.2, scale: 1 }}
        transition={{ duration: 1, delay: 0.2, ease: 'easeOut' }}
        className={cn(
          'absolute -top-10 right-20 w-40 h-40 rounded-full',
          isMorning ? 'bg-orange-200' : 'bg-purple-200'
        )}
      />

      {/* Time icon */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 0.6, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4 }}
        className="absolute top-8 right-8"
      >
        {isMorning ? (
          <Sun className="w-12 h-12 text-amber-400" />
        ) : (
          <Moon className="w-12 h-12 text-indigo-400" />
        )}
      </motion.div>
    </div>
  )
}

function AnimatedCheckmark() {
  return (
    <motion.div
      variants={checkmarkVariants}
      initial="hidden"
      animate="show"
      className="relative mx-auto mb-6"
    >
      {/* Outer ring pulse */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.5, 0, 0.5],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute inset-0 w-20 h-20 rounded-full bg-teal-500/30"
      />

      {/* Main circle */}
      <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 shadow-lg flex items-center justify-center">
        <motion.div
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <Check className="w-10 h-10 text-white" strokeWidth={3} />
        </motion.div>
      </div>
    </motion.div>
  )
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

/**
 * CompletionCelebration - Full screen completion view for Check-In and Reflection.
 *
 * Features:
 * - Time-appropriate background illustration
 * - Animated checkmark with pulse effect
 * - Confetti celebration on mount
 * - Navigation suggestion card
 * - Back to overview button
 *
 * @example
 * <CompletionCelebration
 *   type="checkin"
 *   title="Morning Check-In Complete!"
 *   subtitle="Great job starting your day mindfully."
 *   navigationSuggestion={{
 *     title: "Come back this evening",
 *     description: "Complete your evening reflection to track your progress",
 *     onClick: () => navigateToReflection()
 *   }}
 *   onBack={() => setView('overview')}
 * />
 */
export function CompletionCelebration({
  type,
  title,
  subtitle,
  navigationSuggestion,
  onBack,
  className,
}: CompletionCelebrationProps) {
  const isMobile = useMediaQuery('(max-width: 768px)')

  // Trigger confetti on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      checkInCelebration()
      haptics.success()
    }, 400)

    return () => clearTimeout(timer)
  }, [])

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className={cn(
        'relative min-h-[70vh] flex flex-col items-center justify-center',
        isMobile ? 'px-4 py-8' : 'px-6 py-12',
        className
      )}
    >
      {/* Background illustration */}
      <BackgroundIllustration type={type} />

      {/* Content */}
      <div className="relative z-10 w-full max-w-md mx-auto text-center">
        {/* Animated checkmark */}
        <AnimatedCheckmark />

        {/* Title */}
        <motion.h1
          variants={itemVariants}
          className={cn(
            'font-bold text-slate-800 mb-2',
            isMobile ? 'text-xl' : 'text-2xl'
          )}
        >
          {title}
        </motion.h1>

        {/* Subtitle */}
        {subtitle && (
          <motion.p
            variants={itemVariants}
            className={cn(
              'text-slate-500 mb-8',
              isMobile ? 'text-sm' : 'text-base'
            )}
          >
            {subtitle}
          </motion.p>
        )}

        {/* Navigation suggestion card */}
        {navigationSuggestion && (
          <motion.div variants={itemVariants} className="mb-6">
            <Card
              className={cn(
                'cursor-pointer transition-all duration-200',
                'hover:shadow-md hover:border-teal-200',
                'border-slate-200 bg-white/80 backdrop-blur-sm'
              )}
              onClick={() => {
                haptics.tap()
                navigationSuggestion.onClick()
              }}
            >
              <CardContent
                className={cn(
                  'flex items-center justify-between',
                  isMobile ? 'p-4' : 'p-5'
                )}
              >
                <div className="text-left">
                  <p
                    className={cn(
                      'font-medium text-slate-800',
                      isMobile ? 'text-sm' : 'text-base'
                    )}
                  >
                    {navigationSuggestion.title}
                  </p>
                  <p
                    className={cn(
                      'text-slate-500',
                      isMobile ? 'text-xs' : 'text-sm'
                    )}
                  >
                    {navigationSuggestion.description}
                  </p>
                </div>
                <ChevronRight className="h-5 w-5 text-slate-400 shrink-0 ml-3" />
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Back to overview button */}
        <motion.div variants={itemVariants}>
          <Button
            variant="ghost"
            onClick={() => {
              haptics.tap()
              onBack()
            }}
            className={cn(
              'text-slate-600 hover:text-slate-800',
              isMobile ? 'text-sm' : 'text-base'
            )}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Overview
          </Button>
        </motion.div>
      </div>
    </motion.div>
  )
}

export default CompletionCelebration
