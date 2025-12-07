import { useState, useEffect, useCallback } from 'react'
import {
  db,
  doc,
  setDoc,
  onSnapshot,
  serverTimestamp,
  CURRENT_TENANT,
} from '@/lib/firebase'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/hooks/use-toast'
import { updateContextAfterTechniqueComplete } from '@/lib/updateAIContext'

// =============================================================================
// TYPES
// =============================================================================

export interface TechniqueCompletionData {
  techniqueId: string
  techniqueName: string
  category: string
  completedAt: Date
}

// =============================================================================
// HELPERS
// =============================================================================

/**
 * Get today's date string in YYYY-MM-DD format (local timezone)
 */
function getTodayDateString(): string {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Get day of year (1-366)
 */
function getDayOfYear(date: Date = new Date()): number {
  const start = new Date(date.getFullYear(), 0, 0)
  const diff = date.getTime() - start.getTime()
  const oneDay = 1000 * 60 * 60 * 24
  return Math.floor(diff / oneDay)
}

// =============================================================================
// HOOK
// =============================================================================

/**
 * Hook for tracking coping technique completion status.
 *
 * Stores completion in Firestore at:
 * techniqueCompletions/{userId}/daily/{dateString}
 *
 * Uses real-time listener for instant updates across components.
 *
 * @returns Object with completion status and mark complete function
 */
export function useTechniqueCompletion() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [isCompleted, setIsCompleted] = useState(false)
  const [loading, setLoading] = useState(true)
  const [completionData, setCompletionData] = useState<TechniqueCompletionData | null>(null)

  // Real-time listener for today's technique completion
  useEffect(() => {
    if (!user?.uid) {
      setLoading(false)
      return
    }

    const dateString = getTodayDateString()
    const docRef = doc(db, 'techniqueCompletions', user.uid, 'daily', dateString)

    // Set up real-time listener
    const unsubscribe = onSnapshot(
      docRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data()
          setIsCompleted(true)
          setCompletionData({
            techniqueId: data.techniqueId,
            techniqueName: data.techniqueName,
            category: data.category,
            completedAt: data.completedAt?.toDate() || new Date(),
          })
        } else {
          setIsCompleted(false)
          setCompletionData(null)
        }
        setLoading(false)
      },
      (error) => {
        console.error('Error listening to technique completion:', error)
        setLoading(false)
      }
    )

    // Cleanup listener on unmount
    return () => unsubscribe()
  }, [user?.uid])

  // Mark technique as completed
  const markComplete = useCallback(async (technique: {
    id: string
    name: string
    category: string
  }) => {
    if (!user?.uid) {
      toast({
        title: 'Error',
        description: 'You must be logged in to track progress',
        variant: 'destructive',
      })
      return false
    }

    try {
      const dateString = getTodayDateString()
      const docRef = doc(db, 'techniqueCompletions', user.uid, 'daily', dateString)

      await setDoc(docRef, {
        userId: user.uid,
        tenantId: CURRENT_TENANT,
        techniqueId: technique.id,
        techniqueName: technique.name,
        category: technique.category,
        dayOfYear: getDayOfYear(),
        dateString,
        completedAt: serverTimestamp(),
      })

      // Update AI context
      await updateContextAfterTechniqueComplete(user.uid)

      setIsCompleted(true)
      setCompletionData({
        techniqueId: technique.id,
        techniqueName: technique.name,
        category: technique.category,
        completedAt: new Date(),
      })

      toast({
        title: 'Great job!',
        description: `You completed "${technique.name}" today!`,
      })

      return true
    } catch (error) {
      console.error('Error marking technique complete:', error)
      toast({
        title: 'Error',
        description: 'Failed to save progress. Please try again.',
        variant: 'destructive',
      })
      return false
    }
  }, [user?.uid, toast])

  // Reset completion (for fixing incorrect entries)
  const resetCompletion = useCallback(async () => {
    if (!user?.uid) return false

    try {
      const dateString = getTodayDateString()
      const docRef = doc(db, 'techniqueCompletions', user.uid, 'daily', dateString)

      // Import deleteDoc dynamically to avoid adding to imports if not needed
      const { deleteDoc } = await import('firebase/firestore')
      await deleteDoc(docRef)

      setIsCompleted(false)
      setCompletionData(null)

      toast({
        title: 'Reset Complete',
        description: 'Technique completion has been reset for today.',
      })

      return true
    } catch (error) {
      console.error('Error resetting technique completion:', error)
      toast({
        title: 'Error',
        description: 'Failed to reset. Please try again.',
        variant: 'destructive',
      })
      return false
    }
  }, [user?.uid, toast])

  return {
    isCompleted,
    loading,
    completionData,
    markComplete,
    resetCompletion,
  }
}

export default useTechniqueCompletion
