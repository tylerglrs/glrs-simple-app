import { useState, useEffect, useCallback } from 'react'
import { db, auth } from '@/lib/firebase'
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore'
import {
  updateContextAfterCountdownGoalAdd,
  updateContextAfterCountdownGoalUpdate,
  updateContextAfterCountdownGoalComplete,
} from '@/lib/updateAIContext'
import type { CountdownGoal } from '../types'

// =============================================================================
// TYPES
// =============================================================================

interface UseCountdownGoalsReturn {
  goals: CountdownGoal[]
  loading: boolean
  error: string | null
  addGoal: (goal: Omit<CountdownGoal, 'id' | 'userId' | 'createdAt'>) => Promise<string | null>
  updateGoal: (id: string, updates: Partial<CountdownGoal>) => Promise<boolean>
  deleteGoal: (id: string) => Promise<boolean>
  completeGoal: (id: string) => Promise<boolean>
}

// =============================================================================
// HOOK
// =============================================================================

export function useCountdownGoals(): UseCountdownGoalsReturn {
  const [goals, setGoals] = useState<CountdownGoal[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      if (!user) {
        setGoals([])
        setLoading(false)
        return
      }

      const goalsRef = collection(db, 'countdownGoals')
      const q = query(
        goalsRef,
        where('userId', '==', user.uid),
        where('isCompleted', '!=', true),
        orderBy('isCompleted'),
        orderBy('targetDate', 'asc')
      )

      const unsubscribeSnapshot = onSnapshot(
        q,
        (snapshot) => {
          const goalsData: CountdownGoal[] = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
          })) as CountdownGoal[]

          // Sort by days remaining
          goalsData.sort((a, b) => {
            const aDate = a.targetDate?.toDate?.() || new Date()
            const bDate = b.targetDate?.toDate?.() || new Date()
            return aDate.getTime() - bDate.getTime()
          })

          setGoals(goalsData)
          setLoading(false)
          setError(null)
        },
        (err) => {
          console.error('Error loading countdown goals:', err)
          setError('Failed to load countdown goals')
          setLoading(false)
        }
      )

      return () => unsubscribeSnapshot()
    })

    return () => unsubscribeAuth()
  }, [])

  const addGoal = useCallback(
    async (goalData: Omit<CountdownGoal, 'id' | 'userId' | 'createdAt'>): Promise<string | null> => {
      const user = auth.currentUser
      if (!user) {
        setError('Must be logged in to add goals')
        return null
      }

      try {
        const goalsRef = collection(db, 'countdownGoals')
        const docRef = await addDoc(goalsRef, {
          ...goalData,
          userId: user.uid,
          createdAt: serverTimestamp(),
          isCompleted: false,
        })

        // Update AI context
        await updateContextAfterCountdownGoalAdd(user.uid)

        return docRef.id
      } catch (err) {
        console.error('Error adding countdown goal:', err)
        setError('Failed to add goal')
        return null
      }
    },
    []
  )

  const updateGoal = useCallback(
    async (id: string, updates: Partial<CountdownGoal>): Promise<boolean> => {
      const user = auth.currentUser
      try {
        const goalRef = doc(db, 'countdownGoals', id)
        await updateDoc(goalRef, updates)

        // Update AI context
        if (user) {
          await updateContextAfterCountdownGoalUpdate(user.uid)
        }

        return true
      } catch (err) {
        console.error('Error updating countdown goal:', err)
        setError('Failed to update goal')
        return false
      }
    },
    []
  )

  const deleteGoal = useCallback(async (id: string): Promise<boolean> => {
    try {
      const goalRef = doc(db, 'countdownGoals', id)
      await deleteDoc(goalRef)
      return true
    } catch (err) {
      console.error('Error deleting countdown goal:', err)
      setError('Failed to delete goal')
      return false
    }
  }, [])

  const completeGoal = useCallback(async (id: string): Promise<boolean> => {
    const user = auth.currentUser
    try {
      const goalRef = doc(db, 'countdownGoals', id)
      await updateDoc(goalRef, {
        isCompleted: true,
        completedAt: serverTimestamp(),
      })

      // Update AI context
      if (user) {
        await updateContextAfterCountdownGoalComplete(user.uid)
      }

      return true
    } catch (err) {
      console.error('Error completing countdown goal:', err)
      setError('Failed to complete goal')
      return false
    }
  }, [])

  return {
    goals,
    loading,
    error,
    addGoal,
    updateGoal,
    deleteGoal,
    completeGoal,
  }
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

export function getDaysRemaining(targetDate: Timestamp | Date): number {
  const target = targetDate instanceof Date ? targetDate : targetDate.toDate()
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  target.setHours(0, 0, 0, 0)

  const diffTime = target.getTime() - now.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  return diffDays
}

export function getCountdownStatus(daysRemaining: number): 'overdue' | 'soon' | 'upcoming' | 'distant' {
  if (daysRemaining < 0) return 'overdue'
  if (daysRemaining <= 3) return 'soon'
  if (daysRemaining <= 14) return 'upcoming'
  return 'distant'
}

export default useCountdownGoals
