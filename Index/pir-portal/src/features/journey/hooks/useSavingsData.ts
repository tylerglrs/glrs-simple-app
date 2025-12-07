import { useState, useEffect } from 'react'
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
} from 'firebase/firestore'
import { db, auth } from '@/lib/firebase'
import type { SavingsGoal, JarTransaction, JourneyUserData } from '../types'

// =============================================================================
// TYPES
// =============================================================================

export interface SavingsData {
  goals: SavingsGoal[]
  transactions: JarTransaction[]
  totalSaved: number
  totalTarget: number
  moneySavedFromSobriety: number
  dailySavings: number
  loading: boolean
  error: string | null
}

// =============================================================================
// HOOK
// =============================================================================

export function useSavingsData() {
  const [data, setData] = useState<SavingsData>({
    goals: [],
    transactions: [],
    totalSaved: 0,
    totalTarget: 0,
    moneySavedFromSobriety: 0,
    dailySavings: 0,
    loading: true,
    error: null,
  })

  useEffect(() => {
    const user = auth.currentUser
    if (!user) {
      setData((prev) => ({ ...prev, loading: false, error: 'Not authenticated' }))
      return
    }

    // Subscribe to savings goals
    const goalsQuery = query(
      collection(db, 'savingsGoals'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    )

    const unsubscribeGoals = onSnapshot(
      goalsQuery,
      (snapshot) => {
        const goals = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as SavingsGoal[]

        const totalSaved = goals.reduce((sum, g) => sum + (g.currentAmount || 0), 0)
        const totalTarget = goals.reduce((sum, g) => sum + (g.targetAmount || 0), 0)

        setData((prev) => ({
          ...prev,
          goals,
          totalSaved,
          totalTarget,
          loading: false,
          error: null,
        }))
      },
      (error) => {
        console.error('Error loading savings goals:', error)
        setData((prev) => ({
          ...prev,
          loading: false,
          error: 'Failed to load savings goals',
        }))
      }
    )

    // Subscribe to transactions
    const transactionsQuery = query(
      collection(db, 'jarTransactions'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    )

    const unsubscribeTransactions = onSnapshot(
      transactionsQuery,
      (snapshot) => {
        const transactions = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as JarTransaction[]

        setData((prev) => ({
          ...prev,
          transactions,
        }))
      },
      (error) => {
        console.error('Error loading transactions:', error)
      }
    )

    // Load user data for sobriety savings calculation
    const loadUserData = async () => {
      try {
        const userDoc = await import('firebase/firestore').then(({ doc, getDoc }) =>
          getDoc(doc(db, 'users', user.uid))
        )

        if (userDoc.exists()) {
          const userData = userDoc.data() as JourneyUserData
          const dailyCost = userData.dailyCost || 0
          const sobrietyDate = userData.sobrietyDate

          if (sobrietyDate && dailyCost > 0) {
            const start = new Date(sobrietyDate)
            const now = new Date()
            const diffTime = Math.abs(now.getTime() - start.getTime())
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
            const moneySaved = diffDays * dailyCost

            setData((prev) => ({
              ...prev,
              moneySavedFromSobriety: moneySaved,
              dailySavings: dailyCost,
            }))
          }
        }
      } catch (error) {
        console.error('Error loading user data for savings:', error)
      }
    }

    loadUserData()

    return () => {
      unsubscribeGoals()
      unsubscribeTransactions()
    }
  }, [])

  return data
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

export function calculateProgress(current: number, target: number): number {
  if (target <= 0) return 0
  return Math.min(100, Math.round((current / target) * 100))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export default useSavingsData
