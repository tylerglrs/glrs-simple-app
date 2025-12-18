/**
 * Coach Mark Provider
 *
 * Context provider that manages coach marks throughout the app.
 * Wraps the app to provide coach mark state and display.
 */

import { createContext, useContext, useCallback, useRef, useEffect, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { CoachMark } from './CoachMark'
import { useCoachMarks, COACH_MARKS, type CoachMarkConfig } from './useCoachMarks'

interface CoachMarkContextType {
  // Register an element as a coach mark target
  registerTarget: (markId: string, element: HTMLElement | null) => void

  // Unregister an element
  unregisterTarget: (markId: string) => void

  // Show a specific coach mark
  showMark: (markId: string) => void

  // Dismiss the current coach mark
  dismissCurrentMark: () => void

  // Dismiss a specific mark permanently
  dismissMark: (markId: string) => void

  // Check if a mark is available
  isMarkAvailable: (markId: string) => boolean

  // Current active mark ID
  activeMarkId: string | null

  // Days in recovery
  daysInRecovery: number
}

const CoachMarkContext = createContext<CoachMarkContextType | null>(null)

interface CoachMarkProviderProps {
  children: ReactNode
}

export function CoachMarkProvider({ children }: CoachMarkProviderProps) {
  const {
    activeCoachMark,
    dismissCoachMark,
    shouldShowMark,
    availableMarks,
    daysInRecovery,
    showMark: showMarkHook,
    hideMark,
  } = useCoachMarks()

  // Store refs to target elements
  const targetsRef = useRef<Map<string, HTMLElement>>(new Map())

  // Current target element for positioning
  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null)

  // Register a target element
  const registerTarget = useCallback((markId: string, element: HTMLElement | null) => {
    if (element) {
      targetsRef.current.set(markId, element)
    } else {
      targetsRef.current.delete(markId)
    }
  }, [])

  // Unregister a target element
  const unregisterTarget = useCallback((markId: string) => {
    targetsRef.current.delete(markId)
  }, [])

  // Show a specific mark
  const showMark = useCallback((markId: string) => {
    const target = targetsRef.current.get(markId)
    if (target) {
      setTargetElement(target)
      showMarkHook(markId)
    }
  }, [showMarkHook])

  // Dismiss current mark
  const dismissCurrentMark = useCallback(() => {
    if (activeCoachMark) {
      dismissCoachMark(activeCoachMark.id)
      setTargetElement(null)
    }
  }, [activeCoachMark, dismissCoachMark])

  // Dismiss a specific mark
  const dismissMark = useCallback((markId: string) => {
    dismissCoachMark(markId)
    if (activeCoachMark?.id === markId) {
      setTargetElement(null)
    }
  }, [dismissCoachMark, activeCoachMark])

  // Check if a mark is available
  const isMarkAvailable = useCallback((markId: string) => {
    return shouldShowMark(markId)
  }, [shouldShowMark])

  // Get next available mark
  const getNextMark = useCallback((): CoachMarkConfig | null => {
    const currentIndex = activeCoachMark
      ? availableMarks.findIndex(m => m.id === activeCoachMark.id)
      : -1

    if (currentIndex < availableMarks.length - 1) {
      return availableMarks[currentIndex + 1]
    }
    return null
  }, [activeCoachMark, availableMarks])

  // Handle next mark
  const handleNext = useCallback(() => {
    const nextMark = getNextMark()
    if (nextMark) {
      showMark(nextMark.id)
    }
  }, [getNextMark, showMark])

  // Update target element when active mark changes
  useEffect(() => {
    if (activeCoachMark) {
      const target = targetsRef.current.get(activeCoachMark.id)
      if (target) {
        setTargetElement(target)
      }
    } else {
      setTargetElement(null)
    }
  }, [activeCoachMark])

  // Context value
  const contextValue: CoachMarkContextType = {
    registerTarget,
    unregisterTarget,
    showMark,
    dismissCurrentMark,
    dismissMark,
    isMarkAvailable,
    activeMarkId: activeCoachMark?.id || null,
    daysInRecovery,
  }

  // Check if there are more marks after current
  const hasMoreMarks = activeCoachMark
    ? availableMarks.findIndex(m => m.id === activeCoachMark.id) < availableMarks.length - 1
    : false

  return (
    <CoachMarkContext.Provider value={contextValue}>
      {children}

      {/* Render coach mark via portal */}
      {activeCoachMark && targetElement && typeof document !== 'undefined' && createPortal(
        <CoachMark
          config={activeCoachMark}
          isOpen={true}
          onDismiss={dismissCurrentMark}
          onNext={hasMoreMarks ? handleNext : undefined}
          hasMore={hasMoreMarks}
        >
          {/* Clone the target element position */}
          <div
            style={{
              position: 'fixed',
              top: targetElement.getBoundingClientRect().top,
              left: targetElement.getBoundingClientRect().left,
              width: targetElement.getBoundingClientRect().width,
              height: targetElement.getBoundingClientRect().height,
              pointerEvents: 'none',
            }}
          />
        </CoachMark>,
        document.body
      )}
    </CoachMarkContext.Provider>
  )
}

/**
 * Hook to access coach mark context
 */
export function useCoachMarkContext() {
  const context = useContext(CoachMarkContext)
  if (!context) {
    throw new Error('useCoachMarkContext must be used within a CoachMarkProvider')
  }
  return context
}

/**
 * Hook to register a component as a coach mark target
 *
 * @param markId - The ID of the coach mark
 * @returns A ref callback to attach to the target element
 */
export function useCoachMarkTarget(markId: string) {
  const { registerTarget, unregisterTarget, isMarkAvailable, showMark } = useCoachMarkContext()
  const elementRef = useRef<HTMLElement | null>(null)

  // Register/unregister on mount/unmount
  useEffect(() => {
    return () => {
      unregisterTarget(markId)
    }
  }, [markId, unregisterTarget])

  // Ref callback
  const refCallback = useCallback((element: HTMLElement | null) => {
    elementRef.current = element
    registerTarget(markId, element)
  }, [markId, registerTarget])

  return {
    ref: refCallback,
    isAvailable: isMarkAvailable(markId),
    showMark: () => showMark(markId),
  }
}

export default CoachMarkProvider
