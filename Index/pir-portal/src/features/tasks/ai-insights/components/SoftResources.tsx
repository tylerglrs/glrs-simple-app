/**
 * SoftResources.tsx
 * Phase 8D-2: Inline Resources for HIGH Tier Alerts
 *
 * Non-intrusive inline component that shows crisis resources
 * when HIGH tier (not CRITICAL) crisis indicators are detected.
 * Appears below AI response, can be dismissed.
 */

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, Phone, MessageCircle, ChevronDown, ChevronUp, X, ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils'
import { haptics } from '@/lib/animations'

interface SoftResourcesProps {
  isVisible: boolean
  onDismiss: () => void
  context?: string // Optional context about why resources are shown
}

interface ResourceLinkProps {
  icon: React.ReactNode
  label: string
  href: string
  description: string
}

const ResourceLink = ({ icon, label, href, description }: ResourceLinkProps) => {
  const handleClick = () => {
    haptics.tap()
    console.log(`[SoftResources] Resource clicked: ${label}`)
  }

  return (
    <a
      href={href}
      onClick={handleClick}
      className={cn(
        'flex items-center gap-3 p-3 rounded-lg min-h-[48px]',
        'bg-white/60 hover:bg-white/80',
        'transition-all duration-200',
        'group'
      )}
    >
      <div className="p-2 bg-teal-100 rounded-lg text-teal-600 group-hover:bg-teal-200 transition-colors">
        {icon}
      </div>
      <div className="flex-1">
        <span className="font-medium text-gray-800">{label}</span>
        <p className="text-xs text-gray-500">{description}</p>
      </div>
      <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-teal-600 transition-colors" />
    </a>
  )
}

export function SoftResources({ isVisible, onDismiss, context }: SoftResourcesProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const handleDismiss = () => {
    haptics.tap()
    console.log('[SoftResources] Dismissed by user')
    onDismiss()
  }

  const toggleExpand = () => {
    haptics.tap()
    setIsExpanded(!isExpanded)
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -10, height: 0 }}
          animate={{ opacity: 1, y: 0, height: 'auto' }}
          exit={{ opacity: 0, y: -10, height: 0 }}
          transition={{ duration: 0.3 }}
          className="overflow-hidden"
        >
          <div className={cn(
            'bg-gradient-to-r from-teal-50 to-blue-50',
            'border border-teal-200 rounded-xl',
            'p-3 md:p-4 my-3'
          )}>
            {/* Header */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-teal-100 rounded-lg">
                  <Heart className="w-4 h-4 text-teal-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-800 text-sm">
                    Support Resources Available
                  </h4>
                  <p className="text-xs text-gray-500">
                    {context || "Here if you need to talk to someone"}
                  </p>
                </div>
              </div>
              <button
                onClick={handleDismiss}
                className="p-2 hover:bg-white/60 rounded-lg transition-colors min-h-touch min-w-touch flex items-center justify-center"
                aria-label="Dismiss"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {/* Quick Actions - Always Visible */}
            <div className="flex gap-2 mt-3">
              <a
                href="tel:988"
                onClick={() => {
                  haptics.select()
                  console.log('[SoftResources] Quick action: Call 988')
                }}
                className={cn(
                  'flex-1 flex items-center justify-center gap-2',
                  'py-3 px-3 rounded-lg min-h-[48px]',
                  'bg-white text-gray-700 font-medium text-sm',
                  'hover:bg-teal-50 hover:text-teal-700',
                  'transition-all duration-200',
                  'border border-gray-200'
                )}
              >
                <Phone className="w-5 h-5" />
                Call 988
              </a>
              <a
                href="sms:741741?body=HOME"
                onClick={() => {
                  haptics.select()
                  console.log('[SoftResources] Quick action: Text 741741')
                }}
                className={cn(
                  'flex-1 flex items-center justify-center gap-2',
                  'py-3 px-3 rounded-lg min-h-[48px]',
                  'bg-white text-gray-700 font-medium text-sm',
                  'hover:bg-teal-50 hover:text-teal-700',
                  'transition-all duration-200',
                  'border border-gray-200'
                )}
              >
                <MessageCircle className="w-5 h-5" />
                Text HOME
              </a>
            </div>

            {/* Expandable Section */}
            <button
              onClick={toggleExpand}
              className={cn(
                'w-full flex items-center justify-center gap-1',
                'mt-3 py-2 text-xs text-gray-500',
                'hover:text-teal-600 transition-colors'
              )}
            >
              {isExpanded ? (
                <>
                  <span>Show less</span>
                  <ChevronUp className="w-3 h-3" />
                </>
              ) : (
                <>
                  <span>More resources</span>
                  <ChevronDown className="w-3 h-3" />
                </>
              )}
            </button>

            {/* Expanded Resources */}
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="space-y-2 mt-2 pt-3 border-t border-teal-200/50">
                    <ResourceLink
                      icon={<Phone className="w-4 h-4" />}
                      label="988 Lifeline"
                      href="tel:988"
                      description="24/7 crisis support line"
                    />
                    <ResourceLink
                      icon={<MessageCircle className="w-4 h-4" />}
                      label="Crisis Text Line"
                      href="sms:741741?body=HOME"
                      description="Text HOME to 741741"
                    />
                    <ResourceLink
                      icon={<Heart className="w-4 h-4" />}
                      label="SAMHSA Helpline"
                      href="tel:1-800-662-4357"
                      description="1-800-662-HELP (4357)"
                    />
                  </div>

                  <p className="text-xs text-gray-400 text-center mt-3">
                    All resources are free, confidential, and available 24/7
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default SoftResources
