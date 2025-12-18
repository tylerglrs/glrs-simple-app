/**
 * Onboarding Feature Exports
 */

// Main component
export { OnboardingFlow } from './OnboardingFlow'

// Hook
export { useOnboardingState } from './hooks/useOnboardingState'
export type { OnboardingScreen, OnboardingState, UseOnboardingStateReturn } from './hooks/useOnboardingState'

// Components
export { OnboardingProgress } from './components/OnboardingProgress'
export { OnboardingButton, OnboardingSkipButton } from './components/OnboardingButton'
export { AnimatedTransition, FadeTransition, StaggerChildren, StaggerItem } from './components/AnimatedTransition'

// Screens (for direct access if needed)
export { WelcomeScreen } from './screens/WelcomeScreen'
export { JourneyPreviewScreen } from './screens/JourneyPreviewScreen'
export { CheckInDemoScreen } from './screens/CheckInDemoScreen'
export { MeetCoachScreen } from './screens/MeetCoachScreen'
export { FeaturesOverviewScreen } from './screens/FeaturesOverviewScreen'
export { ReadyScreen } from './screens/ReadyScreen'
