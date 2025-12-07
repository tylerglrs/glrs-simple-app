/**
 * useUserPreferences Hook
 * Phase 9/Task 5.5: User Preferences Tracking
 *
 * Tracks user preferences, technique effectiveness, and AI interaction patterns.
 * Stores data in Firestore for personalization.
 *
 * Collections:
 * - userPreferences/{userId} - Main preferences doc
 * - userPreferences/{userId}/techniqueHistory - Technique usage history
 * - userPreferences/{userId}/insightHistory - Insight interaction history
 */

import { useState, useEffect, useCallback } from 'react'
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  addDoc,
  query,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  Timestamp,
  increment,
} from 'firebase/firestore'
import { db, auth } from '@/lib/firebase'

// =============================================================================
// TYPES
// =============================================================================

export interface TechniquePreference {
  techniqueId: string
  totalUsed: number
  helpfulCount: number
  notHelpfulCount: number
  lastUsed: Date | null
  effectivenessScore: number // 0-1, higher = more effective for user
}

export interface InsightPreference {
  insightType: string
  totalShown: number
  dismissedCount: number
  engagedCount: number
  lastShown: Date | null
}

export interface VoicePreference {
  preferredVoice: string
  ttsEnabled: boolean
  sttEnabled: boolean
  autoPlayResponses: boolean
}

export interface UserPreferences {
  userId: string
  // Voice settings
  voice: VoicePreference
  // AI settings
  preferredResponseLength: 'brief' | 'detailed'
  // Technique preferences (aggregated)
  topTechniques: string[] // Top 3 most effective
  avoidTechniques: string[] // Marked as not helpful 3+ times
  // Last interaction timestamps
  lastAnchorVisit: Date | null
  lastCheckIn: Date | null
  // Timestamps
  createdAt: Date
  updatedAt: Date
}

export interface TechniqueHistoryEntry {
  techniqueId: string
  helpful: boolean
  usedAt: Timestamp
  context?: {
    mood?: number
    anxiety?: number
    craving?: number
  }
}

// =============================================================================
// DEFAULT PREFERENCES
// =============================================================================

const DEFAULT_PREFERENCES: Omit<UserPreferences, 'userId' | 'createdAt' | 'updatedAt'> = {
  voice: {
    preferredVoice: 'rachel',
    ttsEnabled: false,
    sttEnabled: true,
    autoPlayResponses: false,
  },
  preferredResponseLength: 'detailed',
  topTechniques: [],
  avoidTechniques: [],
  lastAnchorVisit: null,
  lastCheckIn: null,
}

// =============================================================================
// HOOK
// =============================================================================

export function useUserPreferences() {
  const [preferences, setPreferences] = useState<UserPreferences | null>(null)
  const [techniqueStats, setTechniqueStats] = useState<Map<string, TechniquePreference>>(new Map())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const userId = auth.currentUser?.uid

  // Load preferences on mount
  useEffect(() => {
    if (!userId) {
      setLoading(false)
      return
    }

    const prefsRef = doc(db, 'userPreferences', userId)

    // Real-time listener for preferences
    const unsubscribe = onSnapshot(
      prefsRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data()
          setPreferences({
            userId,
            voice: data.voice || DEFAULT_PREFERENCES.voice,
            preferredResponseLength: data.preferredResponseLength || DEFAULT_PREFERENCES.preferredResponseLength,
            topTechniques: data.topTechniques || [],
            avoidTechniques: data.avoidTechniques || [],
            lastAnchorVisit: data.lastAnchorVisit?.toDate() || null,
            lastCheckIn: data.lastCheckIn?.toDate() || null,
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date(),
          })
        } else {
          // Create default preferences
          const now = new Date()
          const newPrefs: UserPreferences = {
            userId,
            ...DEFAULT_PREFERENCES,
            createdAt: now,
            updatedAt: now,
          }
          setPreferences(newPrefs)
          // Save to Firestore
          setDoc(prefsRef, {
            ...DEFAULT_PREFERENCES,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          }).catch(console.error)
        }
        setLoading(false)
      },
      (err) => {
        console.error('[useUserPreferences] Error loading preferences:', err)
        setError('Failed to load preferences')
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [userId])

  // Load technique stats
  useEffect(() => {
    if (!userId) return

    const historyRef = collection(db, 'userPreferences', userId, 'techniqueHistory')
    const historyQuery = query(historyRef, orderBy('usedAt', 'desc'), limit(100))

    const unsubscribe = onSnapshot(historyQuery, (snapshot) => {
      const stats = new Map<string, TechniquePreference>()

      snapshot.docs.forEach((doc) => {
        const entry = doc.data() as TechniqueHistoryEntry
        const existing = stats.get(entry.techniqueId) || {
          techniqueId: entry.techniqueId,
          totalUsed: 0,
          helpfulCount: 0,
          notHelpfulCount: 0,
          lastUsed: null,
          effectivenessScore: 0.5,
        }

        existing.totalUsed++
        if (entry.helpful) {
          existing.helpfulCount++
        } else {
          existing.notHelpfulCount++
        }

        const usedAt = entry.usedAt?.toDate()
        if (!existing.lastUsed || (usedAt && usedAt > existing.lastUsed)) {
          existing.lastUsed = usedAt || null
        }

        // Calculate effectiveness score
        if (existing.totalUsed > 0) {
          existing.effectivenessScore = existing.helpfulCount / existing.totalUsed
        }

        stats.set(entry.techniqueId, existing)
      })

      setTechniqueStats(stats)
    })

    return () => unsubscribe()
  }, [userId])

  /**
   * Record technique usage
   */
  const recordTechniqueUsage = useCallback(
    async (
      techniqueId: string,
      helpful: boolean,
      context?: { mood?: number; anxiety?: number; craving?: number }
    ) => {
      if (!userId) return

      try {
        // Add to history subcollection
        const historyRef = collection(db, 'userPreferences', userId, 'techniqueHistory')
        await addDoc(historyRef, {
          techniqueId,
          helpful,
          usedAt: serverTimestamp(),
          context: context || null,
        })

        // Update aggregate stats
        const statsRef = doc(db, 'userPreferences', userId, 'techniqueStats', techniqueId)
        const statsDoc = await getDoc(statsRef)

        if (statsDoc.exists()) {
          await updateDoc(statsRef, {
            totalUsed: increment(1),
            helpfulCount: helpful ? increment(1) : increment(0),
            notHelpfulCount: helpful ? increment(0) : increment(1),
            lastUsed: serverTimestamp(),
            updatedAt: serverTimestamp(),
          })
        } else {
          await setDoc(statsRef, {
            techniqueId,
            totalUsed: 1,
            helpfulCount: helpful ? 1 : 0,
            notHelpfulCount: helpful ? 0 : 1,
            lastUsed: serverTimestamp(),
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          })
        }

        // Update top/avoid lists in main preferences
        await updateTechniqueLists(techniqueId, helpful)

        console.log(`[useUserPreferences] Recorded ${techniqueId} as ${helpful ? 'helpful' : 'not helpful'}`)
      } catch (err) {
        console.error('[useUserPreferences] Error recording technique usage:', err)
      }
    },
    [userId]
  )

  /**
   * Update top/avoid technique lists based on effectiveness
   */
  const updateTechniqueLists = useCallback(
    async (techniqueId: string, _helpful: boolean) => {
      if (!userId) return

      const prefsRef = doc(db, 'userPreferences', userId)

      try {
        const prefsDoc = await getDoc(prefsRef)
        if (!prefsDoc.exists()) return

        const data = prefsDoc.data()
        let topTechniques: string[] = data.topTechniques || []
        let avoidTechniques: string[] = data.avoidTechniques || []

        // Get stats for this technique
        const statsRef = doc(db, 'userPreferences', userId, 'techniqueStats', techniqueId)
        const statsDoc = await getDoc(statsRef)
        const stats = statsDoc.data()

        if (stats) {
          const effectiveness = stats.helpfulCount / stats.totalUsed
          const notHelpfulCount = stats.notHelpfulCount

          // Add to top if consistently helpful (>70% and used 3+ times)
          if (effectiveness >= 0.7 && stats.totalUsed >= 3) {
            if (!topTechniques.includes(techniqueId)) {
              topTechniques = [techniqueId, ...topTechniques].slice(0, 5)
            }
            // Remove from avoid if it was there
            avoidTechniques = avoidTechniques.filter((t) => t !== techniqueId)
          }

          // Add to avoid if consistently not helpful (3+ times marked unhelpful)
          if (notHelpfulCount >= 3) {
            if (!avoidTechniques.includes(techniqueId)) {
              avoidTechniques = [techniqueId, ...avoidTechniques].slice(0, 10)
            }
            // Remove from top if it was there
            topTechniques = topTechniques.filter((t) => t !== techniqueId)
          }
        }

        await updateDoc(prefsRef, {
          topTechniques,
          avoidTechniques,
          updatedAt: serverTimestamp(),
        })
      } catch (err) {
        console.error('[useUserPreferences] Error updating technique lists:', err)
      }
    },
    [userId]
  )

  /**
   * Update voice preferences
   */
  const updateVoicePreferences = useCallback(
    async (updates: Partial<VoicePreference>) => {
      if (!userId) return

      try {
        const prefsRef = doc(db, 'userPreferences', userId)
        await updateDoc(prefsRef, {
          [`voice.${Object.keys(updates)[0]}`]: Object.values(updates)[0],
          updatedAt: serverTimestamp(),
        })
      } catch (err) {
        console.error('[useUserPreferences] Error updating voice preferences:', err)
      }
    },
    [userId]
  )

  /**
   * Update response length preference
   */
  const updateResponseLength = useCallback(
    async (length: 'brief' | 'detailed') => {
      if (!userId) return

      try {
        const prefsRef = doc(db, 'userPreferences', userId)
        await updateDoc(prefsRef, {
          preferredResponseLength: length,
          updatedAt: serverTimestamp(),
        })
      } catch (err) {
        console.error('[useUserPreferences] Error updating response length:', err)
      }
    },
    [userId]
  )

  /**
   * Record Anchor tab visit
   */
  const recordAnchorVisit = useCallback(async () => {
    if (!userId) return

    try {
      const prefsRef = doc(db, 'userPreferences', userId)
      await updateDoc(prefsRef, {
        lastAnchorVisit: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
    } catch (err) {
      // Ignore errors for visit tracking
    }
  }, [userId])

  /**
   * Get technique effectiveness score
   */
  const getTechniqueEffectiveness = useCallback(
    (techniqueId: string): number => {
      const stats = techniqueStats.get(techniqueId)
      return stats?.effectivenessScore ?? 0.5 // Default to neutral
    },
    [techniqueStats]
  )

  /**
   * Check if technique should be avoided
   */
  const shouldAvoidTechnique = useCallback(
    (techniqueId: string): boolean => {
      return preferences?.avoidTechniques.includes(techniqueId) ?? false
    },
    [preferences]
  )

  /**
   * Check if technique is a top pick for user
   */
  const isTopTechnique = useCallback(
    (techniqueId: string): boolean => {
      return preferences?.topTechniques.includes(techniqueId) ?? false
    },
    [preferences]
  )

  return {
    preferences,
    techniqueStats,
    loading,
    error,
    // Actions
    recordTechniqueUsage,
    updateVoicePreferences,
    updateResponseLength,
    recordAnchorVisit,
    // Queries
    getTechniqueEffectiveness,
    shouldAvoidTechnique,
    isTopTechnique,
  }
}

export default useUserPreferences
