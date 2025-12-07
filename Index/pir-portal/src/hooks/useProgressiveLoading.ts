/**
 * useProgressiveLoading Hook - Progressive Loading States
 * Phase 9/Task 3.5: Shows progressive loading messages to reduce perceived wait time
 *
 * Cycles through loading states: "Thinking..." → "Reviewing your data..." → "Composing response..."
 */

import { useState, useEffect, useCallback, useRef } from 'react'

export interface LoadingStage {
  delay: number
  text: string
  icon?: string // optional icon identifier
}

const DEFAULT_STAGES: LoadingStage[] = [
  { delay: 0, text: 'Thinking...', icon: 'sparkles' },
  { delay: 1500, text: 'Reviewing your recovery data...', icon: 'chart' },
  { delay: 3500, text: 'Composing response...', icon: 'pencil' },
  { delay: 6000, text: 'Almost there...', icon: 'clock' },
]

export interface UseProgressiveLoadingOptions {
  /** Custom loading stages (default: built-in recovery-focused stages) */
  stages?: readonly LoadingStage[] | LoadingStage[]
  /** Whether to start immediately (default: false) */
  autoStart?: boolean
}

export interface UseProgressiveLoadingReturn {
  /** Current loading text */
  loadingText: string
  /** Current stage index */
  currentStage: number
  /** Total number of stages */
  totalStages: number
  /** Whether loading is active */
  isLoading: boolean
  /** Current stage icon identifier */
  currentIcon: string | undefined
  /** Start the loading progression */
  start: () => void
  /** Stop and reset */
  stop: () => void
}

export function useProgressiveLoading(
  options: UseProgressiveLoadingOptions = {}
): UseProgressiveLoadingReturn {
  const { stages = DEFAULT_STAGES, autoStart = false } = options

  const [loadingText, setLoadingText] = useState(stages[0]?.text || 'Loading...')
  const [currentStage, setCurrentStage] = useState(0)
  const [isLoading, setIsLoading] = useState(autoStart)
  const [currentIcon, setCurrentIcon] = useState<string | undefined>(stages[0]?.icon)

  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([])

  /**
   * Clear all timeouts
   */
  const clearTimeouts = useCallback(() => {
    timeoutsRef.current.forEach((timeout) => clearTimeout(timeout))
    timeoutsRef.current = []
  }, [])

  /**
   * Start the loading progression
   */
  const start = useCallback(() => {
    clearTimeouts()
    setIsLoading(true)
    setCurrentStage(0)
    setLoadingText(stages[0]?.text || 'Loading...')
    setCurrentIcon(stages[0]?.icon)

    stages.forEach((stage, index) => {
      if (index > 0) {
        const timeout = setTimeout(() => {
          setLoadingText(stage.text)
          setCurrentStage(index)
          setCurrentIcon(stage.icon)
        }, stage.delay)
        timeoutsRef.current.push(timeout)
      }
    })
  }, [stages, clearTimeouts])

  /**
   * Stop and reset
   */
  const stop = useCallback(() => {
    clearTimeouts()
    setIsLoading(false)
    setCurrentStage(0)
    setLoadingText(stages[0]?.text || 'Loading...')
    setCurrentIcon(stages[0]?.icon)
  }, [stages, clearTimeouts])

  // Cleanup on unmount
  useEffect(() => {
    return clearTimeouts
  }, [clearTimeouts])

  return {
    loadingText,
    currentStage,
    totalStages: stages.length,
    isLoading,
    currentIcon,
    start,
    stop,
  }
}

// Export preset stage configurations for different contexts
export const LOADING_PRESETS = {
  anchor: [
    { delay: 0, text: 'Thinking...', icon: 'sparkles' },
    { delay: 1500, text: 'Reviewing your journey...', icon: 'chart' },
    { delay: 3500, text: 'Composing response...', icon: 'pencil' },
    { delay: 6000, text: 'Almost there...', icon: 'clock' },
  ],
  voice: [
    { delay: 0, text: 'Listening...', icon: 'mic' },
    { delay: 1000, text: 'Processing speech...', icon: 'audio' },
    { delay: 2500, text: 'Understanding...', icon: 'brain' },
  ],
  oracle: [
    { delay: 0, text: 'Consulting the oracle...', icon: 'sparkles' },
    { delay: 2000, text: 'Analyzing patterns...', icon: 'chart' },
    { delay: 4000, text: 'Crafting your insight...', icon: 'star' },
  ],
  quick: [
    { delay: 0, text: 'Processing...', icon: 'sparkles' },
    { delay: 1500, text: 'Almost ready...', icon: 'clock' },
  ],
} as const

export default useProgressiveLoading
