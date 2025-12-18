/**
 * Ready Screen (Screen 6)
 *
 * Final onboarding screen:
 * - "You're all set!" message
 * - Checkmark animation
 * - "Start My Journey" button
 * - Completes onboarding and redirects to Tasks
 */

import { motion } from 'framer-motion'
import { CheckCircle, Sparkles } from 'lucide-react'
import { OnboardingButton, OnboardingSkipButton } from '../components/OnboardingButton'
import { StaggerChildren, StaggerItem } from '../components/AnimatedTransition'

interface ReadyScreenProps {
  onComplete: () => Promise<void>
  isCompleting: boolean
}

export function ReadyScreen({ onComplete, isCompleting }: ReadyScreenProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-full px-6 py-12 text-center">
      <StaggerChildren staggerDelay={0.15}>
        {/* Success Animation */}
        <StaggerItem>
          <motion.div
            className="relative mb-8"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
          >
            {/* Sparkle effects */}
            <motion.div
              className="absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute"
                  style={{
                    top: `${20 + Math.random() * 60}%`,
                    left: `${10 + Math.random() * 80}%`,
                  }}
                  animate={{
                    opacity: [0, 1, 0],
                    scale: [0.5, 1, 0.5],
                    y: [0, -10, 0],
                  }}
                  transition={{
                    duration: 2,
                    delay: 0.8 + i * 0.15,
                    repeat: Infinity,
                    repeatDelay: 1,
                  }}
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                </motion.div>
              ))}
            </motion.div>

            {/* Checkmark Circle */}
            <motion.div
              className="w-28 h-28 rounded-full bg-green-500/20 backdrop-blur-sm flex items-center justify-center border-4 border-green-400/50"
              animate={{
                boxShadow: [
                  '0 0 0 0 rgba(74, 222, 128, 0.4)',
                  '0 0 0 20px rgba(74, 222, 128, 0)',
                ],
              }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.4 }}
              >
                <CheckCircle className="w-14 h-14 text-green-400" />
              </motion.div>
            </motion.div>
          </motion.div>
        </StaggerItem>

        {/* Title */}
        <StaggerItem>
          <motion.h2
            className="text-3xl font-bold text-white mb-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            You&apos;re All Set!
          </motion.h2>
        </StaggerItem>

        {/* Subtitle */}
        <StaggerItem>
          <motion.p
            className="text-white/70 mb-4 max-w-xs mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            Your recovery journey awaits. We&apos;re here with you every step of the way.
          </motion.p>
        </StaggerItem>

        {/* Encouragement */}
        <StaggerItem>
          <motion.div
            className="bg-white/10 backdrop-blur-md rounded-xl px-6 py-4 mb-10 border border-white/20 max-w-xs"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <p className="text-white/90 text-sm italic">
              &quot;The journey of a thousand miles begins with a single step.&quot;
            </p>
            <p className="text-white/50 text-xs mt-2">— Lao Tzu</p>
          </motion.div>
        </StaggerItem>

        {/* CTA */}
        <StaggerItem>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
          >
            <OnboardingButton
              onClick={onComplete}
              isLoading={isCompleting}
              showCheck
              className="bg-green-500 hover:bg-green-600 min-w-[200px]"
            >
              Start My Journey
            </OnboardingButton>
          </motion.div>
        </StaggerItem>
      </StaggerChildren>
    </div>
  )
}

export default ReadyScreen
