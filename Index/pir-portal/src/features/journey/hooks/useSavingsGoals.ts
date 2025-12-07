import { useState, useCallback } from 'react'
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from 'firebase/firestore'
import { db, auth } from '@/lib/firebase'
import { updateContextAfterSavingsUpdate } from '@/lib/updateAIContext'
import type { SavingsGoal } from '../types'

// =============================================================================
// TYPES
// =============================================================================

export interface CreateSavingsGoalInput {
  title: string
  targetAmount: number
  description?: string
  category?: string
  deadline?: Date
  icon?: string
  color?: string
}

export interface UpdateSavingsGoalInput {
  title?: string
  targetAmount?: number
  currentAmount?: number
  description?: string
  category?: string
  deadline?: Date
  icon?: string
  color?: string
}

// =============================================================================
// HOOK
// =============================================================================

export function useSavingsGoals() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Create a new savings goal
  const createGoal = useCallback(async (input: CreateSavingsGoalInput): Promise<string | null> => {
    const user = auth.currentUser
    if (!user) {
      setError('Not authenticated')
      return null
    }

    setLoading(true)
    setError(null)

    try {
      const goalData = {
        userId: user.uid,
        title: input.title,
        targetAmount: input.targetAmount,
        currentAmount: 0,
        description: input.description || null,
        category: input.category || null,
        deadline: input.deadline || null,
        icon: input.icon || '🎯',
        color: input.color || '#058585',
        createdAt: serverTimestamp(),
      }

      const docRef = await addDoc(collection(db, 'savingsGoals'), goalData)

      // Update AI context
      await updateContextAfterSavingsUpdate(user.uid)

      return docRef.id
    } catch (err) {
      console.error('Error creating savings goal:', err)
      setError('Failed to create savings goal')
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  // Update an existing savings goal
  const updateGoal = useCallback(async (goalId: string, input: UpdateSavingsGoalInput): Promise<boolean> => {
    const user = auth.currentUser
    if (!user) {
      setError('Not authenticated')
      return false
    }

    setLoading(true)
    setError(null)

    try {
      const updateData: Record<string, unknown> = {}

      if (input.title !== undefined) updateData.title = input.title
      if (input.targetAmount !== undefined) updateData.targetAmount = input.targetAmount
      if (input.currentAmount !== undefined) updateData.currentAmount = input.currentAmount
      if (input.description !== undefined) updateData.description = input.description
      if (input.category !== undefined) updateData.category = input.category
      if (input.deadline !== undefined) updateData.deadline = input.deadline
      if (input.icon !== undefined) updateData.icon = input.icon
      if (input.color !== undefined) updateData.color = input.color

      await updateDoc(doc(db, 'savingsGoals', goalId), updateData)

      // Update AI context
      await updateContextAfterSavingsUpdate(user.uid)

      return true
    } catch (err) {
      console.error('Error updating savings goal:', err)
      setError('Failed to update savings goal')
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  // Delete a savings goal
  const deleteGoal = useCallback(async (goalId: string): Promise<boolean> => {
    const user = auth.currentUser
    if (!user) {
      setError('Not authenticated')
      return false
    }

    setLoading(true)
    setError(null)

    try {
      await deleteDoc(doc(db, 'savingsGoals', goalId))
      return true
    } catch (err) {
      console.error('Error deleting savings goal:', err)
      setError('Failed to delete savings goal')
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  // Add transaction (deposit or withdrawal)
  const addTransaction = useCallback(async (
    goalId: string,
    amount: number,
    type: 'deposit' | 'withdrawal',
    note?: string
  ): Promise<boolean> => {
    const user = auth.currentUser
    if (!user) {
      setError('Not authenticated')
      return false
    }

    setLoading(true)
    setError(null)

    try {
      // Add transaction record
      await addDoc(collection(db, 'jarTransactions'), {
        userId: user.uid,
        goalId,
        amount,
        type,
        note: note || null,
        createdAt: serverTimestamp(),
      })

      // Update goal's current amount
      const goalRef = doc(db, 'savingsGoals', goalId)
      const { getDoc } = await import('firebase/firestore')
      const goalDoc = await getDoc(goalRef)

      if (goalDoc.exists()) {
        const goalData = goalDoc.data() as SavingsGoal
        const currentAmount = goalData.currentAmount || 0
        const newAmount = type === 'deposit'
          ? currentAmount + amount
          : Math.max(0, currentAmount - amount)

        await updateDoc(goalRef, { currentAmount: newAmount })
      }

      // Update AI context
      await updateContextAfterSavingsUpdate(user.uid)

      return true
    } catch (err) {
      console.error('Error adding transaction:', err)
      setError('Failed to add transaction')
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    createGoal,
    updateGoal,
    deleteGoal,
    addTransaction,
    loading,
    error,
  }
}

export default useSavingsGoals
