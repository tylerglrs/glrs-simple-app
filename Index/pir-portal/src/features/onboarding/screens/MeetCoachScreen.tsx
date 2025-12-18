/**
 * Meet Your Coach Screen (Screen 4)
 *
 * Introduces the user's assigned coach:
 * - Coach photo/avatar, name
 * - "Your coach is here to support you"
 * - Optional message CTA
 */

import { motion } from 'framer-motion'
import { User, MessageCircle, Shield } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { OnboardingButton, OnboardingSkipButton } from '../components/OnboardingButton'
import { StaggerChildren, StaggerItem } from '../components/AnimatedTransition'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

interface MeetCoachScreenProps {
  onNext: () => void
}

export function MeetCoachScreen({ onNext }: MeetCoachScreenProps) {
  const { userData } = useAuth()

  // Get coach info from user data
  const coachName = userData?.coachName || 'Your GLRS Support Team'
  const coachInitials = coachName
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  const hasCoach = !!userData?.coachId

  return (
    <div className="flex flex-col items-center justify-center min-h-full px-6 py-12 text-center">
      <StaggerChildren staggerDelay={0.12}>
        {/* Coach Avatar */}
        <StaggerItem>
          <motion.div
            className="relative mb-6"
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          >
            <div className="relative">
              <Avatar className="w-28 h-28 border-4 border-white/30 shadow-xl">
                <AvatarImage src="" alt={coachName} />
                <AvatarFallback className="bg-primary/80 text-white text-2xl font-bold">
                  {hasCoach ? coachInitials : <User className="w-12 h-12" />}
                </AvatarFallback>
              </Avatar>
              {/* Online indicator */}
              <motion.div
                className="absolute bottom-1 right-1 w-6 h-6 bg-green-500 rounded-full border-4 border-white shadow"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </div>
          </motion.div>
        </StaggerItem>

        {/* Title */}
        <StaggerItem>
          <h2 className="text-2xl font-bold text-white mb-2">
            {hasCoach ? 'Meet Your Coach' : 'Your Support Team'}
          </h2>
        </StaggerItem>

        {/* Coach Name */}
        <StaggerItem>
          <p className="text-xl text-white/90 mb-2">
            {coachName}
          </p>
        </StaggerItem>

        <StaggerItem>
          <p className="text-white/70 mb-8 max-w-xs mx-auto">
            {hasCoach
              ? 'Your dedicated coach is here to guide and support you through your recovery journey'
              : 'Our team of recovery specialists is here to support you every step of the way'}
          </p>
        </StaggerItem>

        {/* Features */}
        <StaggerItem>
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 mb-8 border border-white/20 w-full max-w-xs">
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-left">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <MessageCircle className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-white font-medium text-sm">Direct Messaging</p>
                  <p className="text-white/60 text-xs">Message your coach anytime</p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-left">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <Shield className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-white font-medium text-sm">Private & Confidential</p>
                  <p className="text-white/60 text-xs">Your conversations are secure</p>
                </div>
              </div>
            </div>
          </div>
        </StaggerItem>

        {/* CTA */}
        <StaggerItem>
          <OnboardingButton onClick={onNext} showArrow>
            Continue
          </OnboardingButton>
        </StaggerItem>
      </StaggerChildren>
    </div>
  )
}

export default MeetCoachScreen
