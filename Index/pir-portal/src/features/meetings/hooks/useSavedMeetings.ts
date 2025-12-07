import { useState, useEffect, useCallback, useMemo } from 'react'
import {
  db,
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  serverTimestamp,
  query,
  orderBy,
} from '@/lib/firebase'
import { useAuth } from '@/contexts/AuthContext'
import { updateContextAfterMeetingSave } from '@/lib/updateAIContext'
import type { Meeting, SavedMeeting, UseSavedMeetingsReturn } from '../types'

// ============================================================
// CONSTANTS
// ============================================================

const FAVORITES_SUBCOLLECTION = 'favorites'
const SAVED_MEETINGS_SUBCOLLECTION = 'savedMeetings'

// ============================================================
// HOOK: useSavedMeetings
// ============================================================

/**
 * Hook for managing user's saved/favorite meetings
 *
 * Features:
 * - Real-time sync with Firestore
 * - Optimistic UI updates
 * - Two subcollections: favorites (IDs only) and savedMeetings (full data)
 * - Add/remove favorites with toggle function
 * - Check if meeting is favorited
 *
 * Firestore Structure:
 * - users/{userId}/favorites/{meetingId} - Quick lookup by ID
 * - users/{userId}/savedMeetings/{docId} - Full meeting data with metadata
 *
 * @returns Object with favorites set, saved meetings, methods, and loading state
 */
export function useSavedMeetings(): UseSavedMeetingsReturn {
  const { user } = useAuth()
  const [favorites, setFavorites] = useState<Set<string>>(new Set())
  const [savedMeetings, setSavedMeetings] = useState<SavedMeeting[]>([])
  const [loading, setLoading] = useState(true)

  // User ID for Firestore queries
  const userId = user?.uid

  // ============================================================
  // REAL-TIME LISTENERS
  // ============================================================

  // Subscribe to favorites collection
  useEffect(() => {
    if (!userId) {
      setFavorites(new Set())
      setLoading(false)
      return
    }

    setLoading(true)

    const favoritesRef = collection(db, 'users', userId, FAVORITES_SUBCOLLECTION)

    const unsubscribe = onSnapshot(
      favoritesRef,
      (snapshot) => {
        const favIds = new Set<string>(snapshot.docs.map((doc) => doc.id))
        setFavorites(favIds)
        setLoading(false)
        console.log(`[useSavedMeetings] Loaded ${favIds.size} favorites`)
      },
      (error) => {
        console.error('[useSavedMeetings] Error loading favorites:', error)
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [userId])

  // Subscribe to saved meetings collection (full data)
  useEffect(() => {
    if (!userId) {
      setSavedMeetings([])
      return
    }

    const savedRef = collection(db, 'users', userId, SAVED_MEETINGS_SUBCOLLECTION)
    const savedQuery = query(savedRef, orderBy('addedAt', 'desc'))

    const unsubscribe = onSnapshot(
      savedQuery,
      (snapshot) => {
        const meetings: SavedMeeting[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as SavedMeeting[]
        setSavedMeetings(meetings)
        console.log(`[useSavedMeetings] Loaded ${meetings.length} saved meetings`)
      },
      (error) => {
        console.error('[useSavedMeetings] Error loading saved meetings:', error)
      }
    )

    return () => unsubscribe()
  }, [userId])

  // ============================================================
  // METHODS
  // ============================================================

  /**
   * Save a meeting to favorites
   * Stores in both favorites (ID) and savedMeetings (full data)
   */
  const saveMeeting = useCallback(
    async (meeting: Meeting, _weeksToAdd?: number): Promise<boolean> => {
      if (!userId) {
        console.warn('[useSavedMeetings] Cannot save: User not authenticated')
        return false
      }

      try {
        // Optimistic update
        setFavorites((prev) => new Set(prev).add(meeting.id))

        // Save to favorites subcollection (quick lookup)
        const favoriteRef = doc(db, 'users', userId, FAVORITES_SUBCOLLECTION, meeting.id)
        await setDoc(favoriteRef, {
          meetingId: meeting.id,
          meetingName: meeting.name,
          meetingType: meeting.source,
          addedAt: serverTimestamp(),
        })

        // Save to savedMeetings subcollection (full data)
        const savedRef = doc(db, 'users', userId, SAVED_MEETINGS_SUBCOLLECTION, meeting.id)
        await setDoc(savedRef, {
          meetingId: meeting.id,
          meetingName: meeting.name,
          meetingType: meeting.source,
          day: meeting.day,
          time: meeting.time,
          location: meeting.location || null,
          address: meeting.address || null,
          coordinates: meeting.coordinates || null,
          isVirtual: meeting.isVirtual,
          types: meeting.types || '',
          addedAt: serverTimestamp(),
        })

        // Update AI context
        await updateContextAfterMeetingSave(userId)

        console.log(`[useSavedMeetings] Saved meeting: ${meeting.name}`)
        return true
      } catch (error) {
        console.error('[useSavedMeetings] Error saving meeting:', error)
        // Revert optimistic update
        setFavorites((prev) => {
          const newSet = new Set(prev)
          newSet.delete(meeting.id)
          return newSet
        })
        return false
      }
    },
    [userId]
  )

  /**
   * Remove a meeting from favorites
   */
  const unsaveMeeting = useCallback(
    async (meetingId: string): Promise<boolean> => {
      if (!userId) {
        console.warn('[useSavedMeetings] Cannot unsave: User not authenticated')
        return false
      }

      try {
        // Optimistic update
        setFavorites((prev) => {
          const newSet = new Set(prev)
          newSet.delete(meetingId)
          return newSet
        })

        // Remove from favorites subcollection
        const favoriteRef = doc(db, 'users', userId, FAVORITES_SUBCOLLECTION, meetingId)
        await deleteDoc(favoriteRef)

        // Remove from savedMeetings subcollection
        const savedRef = doc(db, 'users', userId, SAVED_MEETINGS_SUBCOLLECTION, meetingId)
        await deleteDoc(savedRef)

        // Update AI context
        await updateContextAfterMeetingSave(userId)

        console.log(`[useSavedMeetings] Unsaved meeting: ${meetingId}`)
        return true
      } catch (error) {
        console.error('[useSavedMeetings] Error unsaving meeting:', error)
        // Revert optimistic update (real-time listener will correct it)
        return false
      }
    },
    [userId]
  )

  /**
   * Toggle favorite status
   * Adds if not favorited, removes if already favorited
   */
  const toggleFavorite = useCallback(
    async (meeting: Meeting): Promise<void> => {
      if (!userId) {
        console.warn('[useSavedMeetings] Cannot toggle: User not authenticated')
        return
      }

      const isFavorited = favorites.has(meeting.id)

      if (isFavorited) {
        await unsaveMeeting(meeting.id)
      } else {
        await saveMeeting(meeting)
      }
    },
    [userId, favorites, saveMeeting, unsaveMeeting]
  )

  /**
   * Check if a meeting is favorited
   */
  const isFavorite = useCallback(
    (meetingId: string): boolean => {
      return favorites.has(meetingId)
    },
    [favorites]
  )

  return {
    savedMeetings,
    favorites,
    loading,
    saveMeeting,
    unsaveMeeting,
    toggleFavorite,
    isFavorite,
  }
}

// ============================================================
// RECOMMENDATION HOOK
// ============================================================

interface RecommendationPatterns {
  types: Record<string, number>
  days: Record<number, number>
  timeOfDay: Record<string, number>
  counties: Record<string, number>
}

/**
 * Hook for generating meeting recommendations based on user's favorites
 *
 * Analyzes user's favorited meetings to find patterns:
 * - Preferred meeting types (AA/NA)
 * - Preferred days of week
 * - Preferred time of day
 * - Preferred locations/counties
 *
 * @param allMeetings All available meetings to score
 * @param favorites Set of favorited meeting IDs
 * @param userLocation Optional user location for distance bonus
 * @param limit Number of recommendations to return (default: 10)
 * @returns Array of recommended meetings sorted by score
 */
export function useMeetingRecommendations(
  allMeetings: Meeting[],
  favorites: Set<string>,
  userLocation?: { lat: number; lng: number } | null,
  limitCount = 10
): Meeting[] {
  return useMemo(() => {
    if (favorites.size === 0) return []

    // Get favorited meetings
    const favoritedMeetings = allMeetings.filter((m) => favorites.has(m.id))
    if (favoritedMeetings.length === 0) return []

    // Extract patterns from favorites
    const patterns: RecommendationPatterns = {
      types: {},
      days: {},
      timeOfDay: {},
      counties: {},
    }

    favoritedMeetings.forEach((meeting) => {
      // Count meeting types (AA/NA)
      const type = meeting.source
      patterns.types[type] = (patterns.types[type] || 0) + 1

      // Count days
      patterns.days[meeting.day] = (patterns.days[meeting.day] || 0) + 1

      // Count time of day
      if (meeting.time) {
        const hour = parseInt(meeting.time.split(':')[0], 10)
        let timeOfDay = 'night'
        if (hour >= 5 && hour < 12) timeOfDay = 'morning'
        else if (hour >= 12 && hour < 18) timeOfDay = 'afternoon'
        else if (hour >= 18) timeOfDay = 'evening'
        patterns.timeOfDay[timeOfDay] = (patterns.timeOfDay[timeOfDay] || 0) + 1
      }

      // Count counties/cities
      const city = meeting.city || meeting.location?.city || ''
      if (city) {
        patterns.counties[city.toLowerCase()] = (patterns.counties[city.toLowerCase()] || 0) + 1
      }
    })

    // Score all non-favorited meetings
    const scored = allMeetings
      .filter((m) => !favorites.has(m.id)) // Exclude already favorited
      .map((meeting) => {
        let score = 0

        // Type match (high weight: 3x)
        if (patterns.types[meeting.source]) {
          score += patterns.types[meeting.source] * 3
        }

        // Day match (medium weight: 2x)
        if (patterns.days[meeting.day]) {
          score += patterns.days[meeting.day] * 2
        }

        // Time of day match (medium weight: 2x)
        if (meeting.time) {
          const hour = parseInt(meeting.time.split(':')[0], 10)
          let timeOfDay = 'night'
          if (hour >= 5 && hour < 12) timeOfDay = 'morning'
          else if (hour >= 12 && hour < 18) timeOfDay = 'afternoon'
          else if (hour >= 18) timeOfDay = 'evening'

          if (patterns.timeOfDay[timeOfDay]) {
            score += patterns.timeOfDay[timeOfDay] * 2
          }
        }

        // City/location match (low weight: 1x)
        const city = meeting.city || meeting.location?.city || ''
        if (city && patterns.counties[city.toLowerCase()]) {
          score += patterns.counties[city.toLowerCase()] * 1
        }

        // Distance bonus (if location available)
        if (userLocation && meeting.coordinates) {
          const lat = meeting.coordinates.lat || meeting.coordinates._lat || 0
          const lng = meeting.coordinates.lng || meeting.coordinates._long || 0
          if (lat && lng) {
            const R = 3959
            const dLat = ((lat - userLocation.lat) * Math.PI) / 180
            const dLng = ((lng - userLocation.lng) * Math.PI) / 180
            const a =
              Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos((userLocation.lat * Math.PI) / 180) *
                Math.cos((lat * Math.PI) / 180) *
                Math.sin(dLng / 2) *
                Math.sin(dLng / 2)
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
            const distance = R * c

            if (distance < 10) score += 3 // Close by
            else if (distance < 25) score += 1 // Moderately close
          }
        }

        return { meeting, score }
      })

    // Sort by score and return top recommendations
    return scored
      .sort((a, b) => b.score - a.score)
      .slice(0, limitCount)
      .map((item) => item.meeting)
  }, [allMeetings, favorites, userLocation, limitCount])
}

export default useSavedMeetings
