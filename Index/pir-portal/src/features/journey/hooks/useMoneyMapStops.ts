import { useState, useEffect, useCallback } from 'react'
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
} from 'firebase/firestore'
import { db, auth } from '@/lib/firebase'
import { updateContextAfterMoneyMapUpdate } from '@/lib/updateAIContext'
import type { MoneyMapStop } from '../types'

// =============================================================================
// DEFAULT MONEY MAP STOPS
// =============================================================================

export const DEFAULT_MONEY_MAP_STOPS: Omit<MoneyMapStop, 'id' | 'userId' | 'createdAt'>[] = [
  { name: 'Coffee', cost: 5, icon: 'coffee', sortOrder: 1 },
  { name: 'Lunch Out', cost: 15, icon: 'utensils', sortOrder: 2 },
  { name: 'Movie Ticket', cost: 15, icon: 'film', sortOrder: 3 },
  { name: 'New Book', cost: 20, icon: 'book', sortOrder: 4 },
  { name: 'Gym Membership', cost: 50, icon: 'dumbbell', sortOrder: 5 },
  { name: 'Weekend Getaway', cost: 200, icon: 'map-pin', sortOrder: 6 },
  { name: 'New Phone', cost: 500, icon: 'smartphone', sortOrder: 7 },
  { name: 'Emergency Fund', cost: 1000, icon: 'shield', sortOrder: 8 },
  { name: 'Vacation', cost: 2000, icon: 'plane', sortOrder: 9 },
  { name: 'Car Payment', cost: 5000, icon: 'car', sortOrder: 10 },
]

// =============================================================================
// TYPES
// =============================================================================

export interface MoneyMapData {
  stops: MoneyMapStop[]
  loading: boolean
  error: string | null
}

export interface CreateMoneyMapStopInput {
  name: string
  cost: number
  icon?: string
  description?: string
  category?: string
  sortOrder?: number
}

// =============================================================================
// HOOK
// =============================================================================

export function useMoneyMapStops() {
  const [data, setData] = useState<MoneyMapData>({
    stops: [],
    loading: true,
    error: null,
  })

  useEffect(() => {
    const user = auth.currentUser
    if (!user) {
      setData((prev) => ({ ...prev, loading: false, error: 'Not authenticated' }))
      return
    }

    const stopsQuery = query(
      collection(db, 'moneyMapStops'),
      where('userId', '==', user.uid),
      orderBy('sortOrder', 'asc')
    )

    const unsubscribe = onSnapshot(
      stopsQuery,
      (snapshot) => {
        const stops = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as MoneyMapStop[]

        setData({
          stops,
          loading: false,
          error: null,
        })
      },
      (error) => {
        console.error('Error loading money map stops:', error)
        setData((prev) => ({
          ...prev,
          loading: false,
          error: 'Failed to load money map stops',
        }))
      }
    )

    return () => unsubscribe()
  }, [])

  // Create a new stop
  const createStop = useCallback(async (input: CreateMoneyMapStopInput): Promise<string | null> => {
    const user = auth.currentUser
    if (!user) return null

    try {
      const docRef = await addDoc(collection(db, 'moneyMapStops'), {
        userId: user.uid,
        name: input.name,
        cost: input.cost,
        icon: input.icon || 'target',
        description: input.description || null,
        category: input.category || null,
        sortOrder: input.sortOrder || 999,
        isUnlocked: false,
        createdAt: serverTimestamp(),
      })
      return docRef.id
    } catch (error) {
      console.error('Error creating money map stop:', error)
      return null
    }
  }, [])

  // Update a stop
  const updateStop = useCallback(async (
    stopId: string,
    updates: Partial<CreateMoneyMapStopInput>
  ): Promise<boolean> => {
    try {
      await updateDoc(doc(db, 'moneyMapStops', stopId), updates)
      return true
    } catch (error) {
      console.error('Error updating money map stop:', error)
      return false
    }
  }, [])

  // Delete a stop
  const deleteStop = useCallback(async (stopId: string): Promise<boolean> => {
    try {
      await deleteDoc(doc(db, 'moneyMapStops', stopId))
      return true
    } catch (error) {
      console.error('Error deleting money map stop:', error)
      return false
    }
  }, [])

  // Mark stop as unlocked
  const unlockStop = useCallback(async (stopId: string): Promise<boolean> => {
    const user = auth.currentUser
    try {
      await updateDoc(doc(db, 'moneyMapStops', stopId), {
        isUnlocked: true,
        unlockedAt: serverTimestamp(),
      })

      // Update AI context with progress
      if (user) {
        // Calculate progress based on unlocked stops
        const unlockedCount = data.stops.filter(s => s.isUnlocked || s.id === stopId).length
        const totalCount = data.stops.length
        const progress = totalCount > 0 ? Math.round((unlockedCount / totalCount) * 100) : 0
        await updateContextAfterMoneyMapUpdate(user.uid, progress)
      }

      return true
    } catch (error) {
      console.error('Error unlocking money map stop:', error)
      return false
    }
  }, [data.stops])

  // Initialize default stops for new users
  const initializeDefaultStops = useCallback(async (): Promise<boolean> => {
    const user = auth.currentUser
    if (!user) return false

    try {
      const promises = DEFAULT_MONEY_MAP_STOPS.map((stop) =>
        addDoc(collection(db, 'moneyMapStops'), {
          ...stop,
          userId: user.uid,
          isUnlocked: false,
          createdAt: serverTimestamp(),
        })
      )

      await Promise.all(promises)
      return true
    } catch (error) {
      console.error('Error initializing default stops:', error)
      return false
    }
  }, [])

  return {
    ...data,
    createStop,
    updateStop,
    deleteStop,
    unlockStop,
    initializeDefaultStops,
  }
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

export function calculateMoneyMapProgress(
  moneySaved: number,
  stops: MoneyMapStop[]
): { unlockedStops: MoneyMapStop[]; nextStop: MoneyMapStop | null; progress: number } {
  const sortedStops = [...stops].sort((a, b) => a.cost - b.cost)
  const unlockedStops = sortedStops.filter((stop) => stop.cost <= moneySaved)
  const lockedStops = sortedStops.filter((stop) => stop.cost > moneySaved)
  const nextStop = lockedStops.length > 0 ? lockedStops[0] : null

  let progress = 0
  if (nextStop) {
    const previousStop = unlockedStops.length > 0
      ? unlockedStops[unlockedStops.length - 1]
      : { cost: 0 }
    const range = nextStop.cost - previousStop.cost
    const current = moneySaved - previousStop.cost
    progress = Math.min(100, Math.round((current / range) * 100))
  } else if (sortedStops.length > 0) {
    progress = 100
  }

  return { unlockedStops, nextStop, progress }
}

export default useMoneyMapStops
