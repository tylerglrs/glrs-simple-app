/**
 * Check-In Demo Screen (Screen 3)
 *
 * Interactive demo of the mood check-in:
 * - Mini mood slider that user can adjust
 * - Teaches core interaction pattern
 * - Does NOT save to Firestore (just demo)
 */

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, Smile, Meh, Frown } from 'lucide-react'
import { OnboardingButton } from '../components/OnboardingButton'
import { StaggerChildren, StaggerItem } from '../components/AnimatedTransition'
import { cn } from '@/lib/utils'

interface CheckInDemoScreenProps {
  onNext: () => void
}

const MOOD_LABELS = [
  { value: 1, label: 'Struggling', icon: Frown, color: 'text-red-400' },
  { value: 2, label: 'Difficult', icon: Frown, color: 'text-orange-400' },
  { value: 3, label: 'Okay', icon: Meh, color: 'text-yellow-400' },
  { value: 4, label: 'Good', icon: Smile, color: 'text-lime-400' },
  { value: 5, label: 'Great', icon: Smile, color: 'text-green-400' },
]

export function CheckInDemoScreen({ onNext }: CheckInDemoScreenProps) {
  const [moodValue, setMoodValue] = useState(3)
  const [hasInteracted, setHasInteracted] = useState(false)

  const currentMood = MOOD_LABELS[moodValue - 1]
  const MoodIcon = currentMood.icon

  const handleMoodChange = (value: number) => {
    setMoodValue(value)
    if (!hasInteracted) {
      setHasInteracted(true)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-full px-6 py-12 text-center">
      <StaggerChildren staggerDelay={0.12}>
        {/* Icon */}
        <StaggerItem>
          <motion.div
            className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mb-6"
            animate={{ scale: hasInteracted ? [1, 1.1, 1] : 1 }}
            transition={{ duration: 0.3 }}
          >
            <Heart className="w-10 h-10 text-rose-300" />
          </motion.div>
        </StaggerItem>

        {/* Title */}
        <StaggerItem>
          <h2 className="text-2xl font-bold text-white mb-2">
            Daily Check-Ins
          </h2>
        </StaggerItem>

        <StaggerItem>
          <p className="text-white/70 mb-8 max-w-xs mx-auto">
            How are you feeling right now? Try the slider below.
          </p>
        </StaggerItem>

        {/* Mood Demo Card */}
        <StaggerItem>
          <motion.div
            className="bg-white/10 backdrop-blur-md rounded-2xl p-6 mb-6 border border-white/20 w-full max-w-xs"
            layout
          >
            {/* Current Mood Display */}
            <AnimatePresence mode="wait">
              <motion.div
                key={moodValue}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="flex flex-col items-center mb-6"
              >
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 0.3 }}
                >
                  <MoodIcon className={cn('w-12 h-12 mb-2', currentMood.color)} />
                </motion.div>
                <span className={cn('text-xl font-semibold', currentMood.color)}>
                  {currentMood.label}
                </span>
              </motion.div>
            </AnimatePresence>

            {/* Mood Slider */}
            <div className="space-y-3">
              <div className="flex justify-between text-xs text-white/50 px-1">
                <span>Struggling</span>
                <span>Great</span>
              </div>

              {/* Custom Slider */}
              <div className="relative py-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full h-2 rounded-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 opacity-30" />
                </div>
                <input
                  type="range"
                  min={1}
                  max={5}
                  value={moodValue}
                  onChange={(e) => handleMoodChange(Number(e.target.value))}
                  className="relative w-full h-2 appearance-none bg-transparent cursor-pointer
                    [&::-webkit-slider-thumb]:appearance-none
                    [&::-webkit-slider-thumb]:w-8
                    [&::-webkit-slider-thumb]:h-8
                    [&::-webkit-slider-thumb]:rounded-full
                    [&::-webkit-slider-thumb]:bg-white
                    [&::-webkit-slider-thumb]:shadow-lg
                    [&::-webkit-slider-thumb]:cursor-pointer
                    [&::-webkit-slider-thumb]:border-4
                    [&::-webkit-slider-thumb]:border-primary
                    [&::-webkit-slider-thumb]:transition-transform
                    [&::-webkit-slider-thumb]:active:scale-110
                    [&::-moz-range-thumb]:w-8
                    [&::-moz-range-thumb]:h-8
                    [&::-moz-range-thumb]:rounded-full
                    [&::-moz-range-thumb]:bg-white
                    [&::-moz-range-thumb]:shadow-lg
                    [&::-moz-range-thumb]:cursor-pointer
                    [&::-moz-range-thumb]:border-4
                    [&::-moz-range-thumb]:border-primary
                  "
                  style={{ WebkitTapHighlightColor: 'transparent' }}
                />
              </div>

              {/* Mood dots for visual feedback */}
              <div className="flex justify-between px-1">
                {MOOD_LABELS.map((mood, index) => (
                  <button
                    key={mood.value}
                    onClick={() => handleMoodChange(mood.value)}
                    className={cn(
                      'w-6 h-6 rounded-full transition-all duration-200',
                      moodValue === mood.value
                        ? 'bg-white scale-110'
                        : 'bg-white/30 hover:bg-white/50'
                    )}
                    aria-label={mood.label}
                    style={{ WebkitTapHighlightColor: 'transparent' }}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        </StaggerItem>

        {/* Helper Text */}
        <StaggerItem>
          <p className="text-white/60 text-sm mb-8 max-w-xs mx-auto">
            Daily check-ins help you and your coach track your progress together
          </p>
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

export default CheckInDemoScreen
