/**
 * CrisisModal.tsx
 * Phase 8D-1: PIR-Facing Crisis UI
 *
 * Non-dismissable modal that displays when CRITICAL tier crisis is detected.
 * Shows crisis resources (988, Crisis Text Line, 911) and safety plan access.
 */

import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, Phone, MessageCircle, Ambulance, Heart, Shield } from 'lucide-react'
import { cn } from '@/lib/utils'
import { haptics } from '@/lib/animations'

interface CrisisModalProps {
  isOpen: boolean
  onClose: () => void
  onViewSafetyPlan: () => void
  coachNotified?: boolean
  tier?: 'critical' | 'high'
}

interface ResourceCardProps {
  icon: React.ReactNode
  title: string
  subtitle: string
  action: string
  href: string
  gradient: string
  onClick?: () => void
}

const ResourceCard = ({ icon, title, subtitle, action, href, gradient, onClick }: ResourceCardProps) => {
  const handleClick = () => {
    haptics.select()
    onClick?.()
    // Log the resource click
    console.log(`[CrisisModal] Resource clicked: ${title}`)
  }

  return (
    <motion.a
      href={href}
      onClick={handleClick}
      className={cn(
        'block w-full p-3 md:p-4 rounded-xl text-white min-h-[56px]',
        'transition-all duration-200',
        'hover:scale-[1.02] active:scale-[0.98]',
        gradient
      )}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="flex items-center gap-3">
        <div className="p-2 bg-white/20 rounded-lg">
          {icon}
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-lg">{title}</h3>
          <p className="text-white/80 text-sm">{subtitle}</p>
        </div>
        <div className="text-white/90 font-medium text-sm">
          {action}
        </div>
      </div>
    </motion.a>
  )
}

export function CrisisModal({
  isOpen,
  onClose,
  onViewSafetyPlan,
  coachNotified = true,
  tier: _tier = 'critical'
}: CrisisModalProps) {
  // _tier is available for future use (e.g., styling differences between critical/high)

  const handleContinue = () => {
    haptics.tap()
    console.log('[CrisisModal] User clicked: I\'m Okay - Continue')
    onClose()
  }

  const handleViewSafetyPlan = () => {
    haptics.select()
    console.log('[CrisisModal] User clicked: View Safety Plan')
    onViewSafetyPlan()
  }

  const logResourceClick = (resource: string) => {
    console.log(`[CrisisModal] Resource accessed: ${resource}`)
    // In production, this would log to Firestore for crisis response tracking
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
        >
          {/* Backdrop - clicking doesn't close (non-dismissable) */}
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={cn(
              'relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden',
              'max-h-[90vh] overflow-y-auto'
            )}
          >
            {/* Red Gradient Header */}
            <div className="bg-gradient-to-r from-red-600 to-red-500 p-6 text-white">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-white/20 rounded-full">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-bold">We're Here For You</h2>
              </div>
              <p className="text-white/90 leading-relaxed">
                It sounds like you might be going through something really difficult.
                You don't have to face this alone.
              </p>
            </div>

            {/* Resource Cards */}
            <div className="p-3 md:p-4 space-y-3">
              <ResourceCard
                icon={<Phone className="w-5 h-5" />}
                title="988 Suicide & Crisis Lifeline"
                subtitle="Free, confidential support 24/7"
                action="Call Now"
                href="tel:988"
                gradient="bg-gradient-to-r from-blue-600 to-blue-500"
                onClick={() => logResourceClick('988_call')}
              />

              <ResourceCard
                icon={<MessageCircle className="w-5 h-5" />}
                title="Crisis Text Line"
                subtitle="Text HOME to 741741"
                action="Text Now"
                href="sms:741741?body=HOME"
                gradient="bg-gradient-to-r from-purple-600 to-purple-500"
                onClick={() => logResourceClick('crisis_text')}
              />

              <ResourceCard
                icon={<Ambulance className="w-5 h-5" />}
                title="Emergency Services"
                subtitle="For immediate danger"
                action="Call 911"
                href="tel:911"
                gradient="bg-gradient-to-r from-orange-600 to-orange-500"
                onClick={() => logResourceClick('911')}
              />
            </div>

            {/* Coach Notification Message */}
            {coachNotified && (
              <div className="px-4 pb-2">
                <div className="flex items-center gap-2 p-3 bg-teal-50 rounded-lg border border-teal-200">
                  <Heart className="w-5 h-5 text-teal-600" />
                  <p className="text-sm text-teal-800">
                    Your coach has been notified and will reach out to check on you.
                  </p>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="p-3 md:p-4 space-y-3 border-t border-gray-100">
              <motion.button
                onClick={handleViewSafetyPlan}
                className={cn(
                  'w-full py-4 px-4 rounded-xl font-semibold min-h-[56px]',
                  'bg-gradient-to-r from-teal-600 to-teal-500 text-white',
                  'flex items-center justify-center gap-2',
                  'hover:from-teal-700 hover:to-teal-600',
                  'transition-all duration-200'
                )}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Shield className="w-5 h-5" />
                View My Safety Plan
              </motion.button>

              <motion.button
                onClick={handleContinue}
                className={cn(
                  'w-full py-4 px-4 rounded-xl font-medium min-h-[56px]',
                  'bg-gray-100 text-gray-700',
                  'hover:bg-gray-200',
                  'transition-all duration-200'
                )}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                I'm Okay - Continue Chat
              </motion.button>
            </div>

            {/* Subtle reminder */}
            <div className="px-3 pb-3 md:px-4 md:pb-4">
              <p className="text-xs text-gray-500 text-center">
                These resources are available 24/7. You matter, and help is always available.
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default CrisisModal
