/**
 * Welcome Screen (Screen 1)
 *
 * First screen of onboarding flow:
 * - GLRS branding with Anchor icon
 * - "Welcome to Recovery Compass"
 * - Personalized greeting with user's first name
 */

import { motion } from 'framer-motion'
import { Anchor } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { OnboardingButton } from '../components/OnboardingButton'
import { StaggerChildren, StaggerItem } from '../components/AnimatedTransition'

interface WelcomeScreenProps {
  onNext: () => void
}

export function WelcomeScreen({ onNext }: WelcomeScreenProps) {
  const { userData } = useAuth()
  const firstName = userData?.firstName || userData?.displayName?.split(' ')[0] || 'there'

  return (
    <div className="flex flex-col items-center justify-center min-h-full px-6 py-12 text-center">
      <StaggerChildren staggerDelay={0.15}>
        {/* Animated Logo */}
        <StaggerItem>
          <motion.div
            className="mb-8"
            animate={{
              y: [0, -8, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            <div className="w-24 h-24 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-xl">
              <Anchor className="w-12 h-12 text-white" />
            </div>
          </motion.div>
        </StaggerItem>

        {/* Welcome Text */}
        <StaggerItem>
          <h1 className="text-3xl font-bold text-white mb-3">
            Welcome to Recovery Compass
          </h1>
        </StaggerItem>

        <StaggerItem>
          <p className="text-xl text-white/90 mb-2">
            Hi, {firstName}!
          </p>
        </StaggerItem>

        <StaggerItem>
          <p className="text-white/70 text-base max-w-xs mx-auto mb-12">
            Your personal companion for a stronger recovery journey
          </p>
        </StaggerItem>

        {/* CTA Button */}
        <StaggerItem>
          <OnboardingButton onClick={onNext} showArrow>
            Get Started
          </OnboardingButton>
        </StaggerItem>
      </StaggerChildren>
    </div>
  )
}

export default WelcomeScreen
