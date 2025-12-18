/**
 * Onboarding Flow Component
 *
 * Main orchestrator for the 6-screen onboarding experience.
 * Handles screen transitions, navigation, and completion.
 */

import { useCallback, useState, useRef } from 'react'
import { AnimatePresence } from 'framer-motion'
import { useOnboardingState } from './hooks/useOnboardingState'
import { OnboardingProgress } from './components/OnboardingProgress'
import { OnboardingSkipButton } from './components/OnboardingButton'
import { AnimatedTransition } from './components/AnimatedTransition'

// Screens
import { WelcomeScreen } from './screens/WelcomeScreen'
import { JourneyPreviewScreen } from './screens/JourneyPreviewScreen'
import { CheckInDemoScreen } from './screens/CheckInDemoScreen'
import { MeetCoachScreen } from './screens/MeetCoachScreen'
import { FeaturesOverviewScreen } from './screens/FeaturesOverviewScreen'
import { ReadyScreen } from './screens/ReadyScreen'

export function OnboardingFlow() {
  const {
    state,
    goToNext,
    goToPrevious,
    completeOnboarding,
    skipOnboarding,
    isCompleting,
  } = useOnboardingState()

  const [direction, setDirection] = useState<'forward' | 'backward'>('forward')
  const previousIndexRef = useRef(state.currentIndex)

  // Track direction for animations
  const handleNext = useCallback(() => {
    setDirection('forward')
    previousIndexRef.current = state.currentIndex
    goToNext()
  }, [goToNext, state.currentIndex])

  const handlePrevious = useCallback(() => {
    setDirection('backward')
    previousIndexRef.current = state.currentIndex
    goToPrevious()
  }, [goToPrevious, state.currentIndex])

  // Render current screen
  const renderScreen = () => {
    switch (state.currentScreen) {
      case 'welcome':
        return <WelcomeScreen onNext={handleNext} />
      case 'journey':
        return <JourneyPreviewScreen onNext={handleNext} />
      case 'checkin':
        return <CheckInDemoScreen onNext={handleNext} />
      case 'coach':
        return <MeetCoachScreen onNext={handleNext} />
      case 'features':
        return <FeaturesOverviewScreen onNext={handleNext} />
      case 'ready':
        return (
          <ReadyScreen
            onComplete={completeOnboarding}
            isCompleting={isCompleting}
          />
        )
      default:
        return null
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #069494 0%, #047878 50%, #034d4d 100%)',
      }}
    >
      {/* Skip Button (top-right) - hidden on first and last screen */}
      {!state.isFirstScreen && !state.isLastScreen && (
        <div className="absolute top-4 right-4 z-10 safe-area-top">
          <OnboardingSkipButton
            onClick={skipOnboarding}
            isLoading={isCompleting}
          >
            Skip
          </OnboardingSkipButton>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden safe-area-inset">
        {/* Screen Content */}
        <div className="flex-1 overflow-hidden">
          <AnimatedTransition
            screenKey={state.currentScreen}
            direction={direction}
          >
            {renderScreen()}
          </AnimatedTransition>
        </div>
      </div>

      {/* Progress Indicator (bottom) */}
      <div className="py-6 safe-area-bottom">
        <OnboardingProgress
          currentIndex={state.currentIndex}
          totalScreens={state.totalScreens}
        />
      </div>

      {/* Touch gesture hint on first screen */}
      {state.isFirstScreen && (
        <div className="absolute bottom-24 left-0 right-0 text-center">
          <p className="text-white/40 text-xs animate-pulse">
            Tap Continue to begin
          </p>
        </div>
      )}
    </div>
  )
}

export default OnboardingFlow
