/**
 * Onboarding State Hook
 *
 * Manages onboarding flow state and Firestore persistence.
 * Tracks current screen, completion status, and user data for onboarding.
 */

import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useAuth } from '@/contexts/AuthContext'

export type OnboardingScreen =
  | 'welcome'
  | 'journey'
  | 'checkin'
  | 'coach'
  | 'features'
  | 'ready'

const SCREEN_ORDER: OnboardingScreen[] = [
  'welcome',
  'journey',
  'checkin',
  'coach',
  'features',
  'ready',
]

export interface OnboardingState {
  currentScreen: OnboardingScreen
  currentIndex: number
  totalScreens: number
  isFirstScreen: boolean
  isLastScreen: boolean
  progress: number // 0-100
}

export interface UseOnboardingStateReturn {
  state: OnboardingState
  goToNext: () => void
  goToPrevious: () => void
  goToScreen: (screen: OnboardingScreen) => void
  completeOnboarding: () => Promise<void>
  skipOnboarding: () => Promise<void>
  isCompleting: boolean
}

export function useOnboardingState(): UseOnboardingStateReturn {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isCompleting, setIsCompleting] = useState(false)

  const currentScreen = SCREEN_ORDER[currentIndex]
  const totalScreens = SCREEN_ORDER.length
  const isFirstScreen = currentIndex === 0
  const isLastScreen = currentIndex === totalScreens - 1
  const progress = ((currentIndex + 1) / totalScreens) * 100

  const state: OnboardingState = {
    currentScreen,
    currentIndex,
    totalScreens,
    isFirstScreen,
    isLastScreen,
    progress,
  }

  const goToNext = useCallback(() => {
    if (currentIndex < totalScreens - 1) {
      setCurrentIndex(prev => prev + 1)
    }
  }, [currentIndex, totalScreens])

  const goToPrevious = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1)
    }
  }, [currentIndex])

  const goToScreen = useCallback((screen: OnboardingScreen) => {
    const index = SCREEN_ORDER.indexOf(screen)
    if (index !== -1) {
      setCurrentIndex(index)
    }
  }, [])

  const markOnboardingComplete = async () => {
    if (!user) return

    try {
      const userRef = doc(db, 'users', user.uid)
      await updateDoc(userRef, {
        onboardingComplete: true,
        onboardingCompletedAt: serverTimestamp(),
      })
    } catch (error) {
      console.error('Failed to mark onboarding complete:', error)
      throw error
    }
  }

  const completeOnboarding = useCallback(async () => {
    setIsCompleting(true)
    try {
      await markOnboardingComplete()
      // Navigate to tasks tab after completion
      navigate('/#tasks', { replace: true })
    } catch (error) {
      console.error('Failed to complete onboarding:', error)
    } finally {
      setIsCompleting(false)
    }
  }, [navigate, user])

  const skipOnboarding = useCallback(async () => {
    setIsCompleting(true)
    try {
      await markOnboardingComplete()
      navigate('/#tasks', { replace: true })
    } catch (error) {
      console.error('Failed to skip onboarding:', error)
    } finally {
      setIsCompleting(false)
    }
  }, [navigate, user])

  return {
    state,
    goToNext,
    goToPrevious,
    goToScreen,
    completeOnboarding,
    skipOnboarding,
    isCompleting,
  }
}
