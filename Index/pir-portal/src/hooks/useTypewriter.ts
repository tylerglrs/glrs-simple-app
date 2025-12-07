/**
 * useTypewriter Hook - Streaming Text Display Effect
 * Phase 9/Task 3.1: Creates perception of streaming by progressively revealing text
 *
 * Improves perceived response time by showing text word-by-word
 */

import { useState, useEffect, useCallback, useRef } from 'react'

export interface UseTypewriterOptions {
  /** Speed in milliseconds per word (default: 50) */
  speed?: number
  /** Whether to start immediately when text changes (default: true) */
  autoStart?: boolean
  /** Callback when typing completes */
  onComplete?: () => void
}

export interface UseTypewriterReturn {
  /** Current displayed text (progressively revealed) */
  displayText: string
  /** Whether currently typing */
  isTyping: boolean
  /** Whether typing is complete */
  isComplete: boolean
  /** Start typing the provided text */
  startTyping: (text: string) => void
  /** Skip to end (show all text immediately) */
  skipToEnd: () => void
  /** Reset to empty */
  reset: () => void
}

export function useTypewriter(options: UseTypewriterOptions = {}): UseTypewriterReturn {
  const { speed = 50, onComplete } = options
  // Note: autoStart option available for future use

  const [fullText, setFullText] = useState<string>('')
  const [displayText, setDisplayText] = useState<string>('')
  const [isTyping, setIsTyping] = useState(false)
  const [isComplete, setIsComplete] = useState(false)

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const wordIndexRef = useRef(0)
  const wordsRef = useRef<string[]>([])

  /**
   * Clear interval and cleanup
   */
  const cleanup = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  /**
   * Start typing animation
   */
  const startTyping = useCallback(
    (text: string) => {
      cleanup()
      setFullText(text)
      setDisplayText('')
      setIsComplete(false)
      wordIndexRef.current = 0

      // Split by words (preserving punctuation and spaces)
      wordsRef.current = text.split(/(\s+)/).filter(Boolean)

      if (wordsRef.current.length === 0) {
        setIsComplete(true)
        onComplete?.()
        return
      }

      setIsTyping(true)

      intervalRef.current = setInterval(() => {
        if (wordIndexRef.current < wordsRef.current.length) {
          setDisplayText((prev) => prev + wordsRef.current[wordIndexRef.current])
          wordIndexRef.current++
        } else {
          cleanup()
          setIsTyping(false)
          setIsComplete(true)
          onComplete?.()
        }
      }, speed)
    },
    [speed, onComplete, cleanup]
  )

  /**
   * Skip to end - show all text immediately
   */
  const skipToEnd = useCallback(() => {
    cleanup()
    setDisplayText(fullText)
    setIsTyping(false)
    setIsComplete(true)
    onComplete?.()
  }, [fullText, onComplete, cleanup])

  /**
   * Reset to initial state
   */
  const reset = useCallback(() => {
    cleanup()
    setFullText('')
    setDisplayText('')
    setIsTyping(false)
    setIsComplete(false)
    wordIndexRef.current = 0
    wordsRef.current = []
  }, [cleanup])

  // Cleanup on unmount
  useEffect(() => {
    return cleanup
  }, [cleanup])

  return {
    displayText,
    isTyping,
    isComplete,
    startTyping,
    skipToEnd,
    reset,
  }
}

export default useTypewriter
