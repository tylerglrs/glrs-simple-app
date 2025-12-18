/**
 * Journey Preview Screen (Screen 2)
 *
 * Shows sobriety counter preview:
 * - Days/hours since recovery start date
 * - "Track your progress, celebrate milestones"
 */

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { Award, Clock, Calendar } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { OnboardingButton } from '../components/OnboardingButton'
import { StaggerChildren, StaggerItem } from '../components/AnimatedTransition'

interface JourneyPreviewScreenProps {
  onNext: () => void
}

export function JourneyPreviewScreen({ onNext }: JourneyPreviewScreenProps) {
  const { userData } = useAuth()

  const sobrietyStats = useMemo(() => {
    if (!userData?.sobrietyDate) {
      return { days: 0, hours: 0, hasDate: false }
    }

    const sobrietyDate = userData.sobrietyDate.toDate()
    const now = new Date()
    const diffMs = now.getTime() - sobrietyDate.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))

    return { days: diffDays, hours: diffHours, hasDate: true }
  }, [userData?.sobrietyDate])

  return (
    <div className="flex flex-col items-center justify-center min-h-full px-6 py-12 text-center">
      <StaggerChildren staggerDelay={0.12}>
        {/* Icon */}
        <StaggerItem>
          <motion.div
            className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mb-6"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Award className="w-10 h-10 text-amber-300" />
          </motion.div>
        </StaggerItem>

        {/* Title */}
        <StaggerItem>
          <h2 className="text-2xl font-bold text-white mb-2">
            Your Journey Starts Here
          </h2>
        </StaggerItem>

        <StaggerItem>
          <p className="text-white/70 mb-8 max-w-xs mx-auto">
            Track your progress and celebrate every milestone
          </p>
        </StaggerItem>

        {/* Sobriety Counter Card */}
        <StaggerItem>
          <motion.div
            className="bg-white/10 backdrop-blur-md rounded-2xl p-6 mb-8 border border-white/20 w-full max-w-xs"
            whileHover={{ scale: 1.02 }}
          >
            {sobrietyStats.hasDate ? (
              <>
                <div className="flex items-center justify-center gap-6 mb-4">
                  {/* Days */}
                  <div className="text-center">
                    <motion.span
                      className="text-4xl font-bold text-white block"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                    >
                      {sobrietyStats.days}
                    </motion.span>
                    <span className="text-white/60 text-sm flex items-center justify-center gap-1">
                      <Calendar className="w-3 h-3" />
                      days
                    </span>
                  </div>

                  {/* Divider */}
                  <div className="w-px h-12 bg-white/20" />

                  {/* Hours */}
                  <div className="text-center">
                    <motion.span
                      className="text-4xl font-bold text-white block"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 }}
                    >
                      {sobrietyStats.hours}
                    </motion.span>
                    <span className="text-white/60 text-sm flex items-center justify-center gap-1">
                      <Clock className="w-3 h-3" />
                      hours
                    </span>
                  </div>
                </div>
                <p className="text-primary/90 text-sm font-medium">
                  Every moment counts
                </p>
              </>
            ) : (
              <div className="py-4">
                <p className="text-white/80 mb-2">
                  Your sobriety journey is about to begin
                </p>
                <p className="text-white/60 text-sm">
                  We&apos;ll track your progress from day one
                </p>
              </div>
            )}
          </motion.div>
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

export default JourneyPreviewScreen
