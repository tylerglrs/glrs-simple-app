/**
 * Features Overview Screen (Screen 5)
 *
 * Icon grid showing key features:
 * - Tasks, Journey, Meetings, Community
 * - Brief 1-line descriptions
 */

import { motion } from 'framer-motion'
import {
  ClipboardCheck,
  TrendingUp,
  Calendar,
  Users,
  BookOpen,
  MessageCircle,
} from 'lucide-react'
import { OnboardingButton } from '../components/OnboardingButton'
import { StaggerChildren, StaggerItem } from '../components/AnimatedTransition'
import { cn } from '@/lib/utils'

interface FeaturesOverviewScreenProps {
  onNext: () => void
}

const FEATURES = [
  {
    icon: ClipboardCheck,
    title: 'Tasks',
    description: 'Daily check-ins & habits',
    color: 'bg-teal-500/20 text-teal-300',
  },
  {
    icon: TrendingUp,
    title: 'Journey',
    description: 'Track your progress',
    color: 'bg-blue-500/20 text-blue-300',
  },
  {
    icon: Calendar,
    title: 'Meetings',
    description: 'Find AA/NA meetings',
    color: 'bg-purple-500/20 text-purple-300',
  },
  {
    icon: Users,
    title: 'Community',
    description: 'Connect with others',
    color: 'bg-orange-500/20 text-orange-300',
  },
  {
    icon: BookOpen,
    title: 'Resources',
    description: 'Recovery guides',
    color: 'bg-emerald-500/20 text-emerald-300',
  },
  {
    icon: MessageCircle,
    title: 'Messages',
    description: 'Chat with your coach',
    color: 'bg-pink-500/20 text-pink-300',
  },
]

export function FeaturesOverviewScreen({ onNext }: FeaturesOverviewScreenProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-full px-6 py-12 text-center">
      <StaggerChildren staggerDelay={0.08}>
        {/* Title */}
        <StaggerItem>
          <h2 className="text-2xl font-bold text-white mb-2">
            Everything You Need
          </h2>
        </StaggerItem>

        <StaggerItem>
          <p className="text-white/70 mb-8 max-w-xs mx-auto">
            Swipe between tabs to explore these features
          </p>
        </StaggerItem>

        {/* Features Grid */}
        <StaggerItem>
          <div className="grid grid-cols-2 gap-3 mb-8 w-full max-w-sm">
            {FEATURES.map((feature, index) => {
              const Icon = feature.icon
              return (
                <motion.div
                  key={feature.title}
                  className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.08 }}
                  whileHover={{ scale: 1.02, backgroundColor: 'rgba(255,255,255,0.15)' }}
                >
                  <div
                    className={cn(
                      'w-12 h-12 rounded-xl flex items-center justify-center mb-3 mx-auto',
                      feature.color.split(' ')[0]
                    )}
                  >
                    <Icon className={cn('w-6 h-6', feature.color.split(' ')[1])} />
                  </div>
                  <h3 className="text-white font-semibold text-sm mb-1">
                    {feature.title}
                  </h3>
                  <p className="text-white/60 text-xs">
                    {feature.description}
                  </p>
                </motion.div>
              )
            })}
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

export default FeaturesOverviewScreen
