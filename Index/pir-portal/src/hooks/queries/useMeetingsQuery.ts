import { useEffect, useCallback, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
  db,
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  limit,
} from '@/lib/firebase'
import { useAuth } from '@/contexts/AuthContext'
import { queryKeys } from '@/lib/queryClient'

// =============================================================================
// TYPES
// =============================================================================

export interface Meeting {
  id: string
  name: string
  day: number
  time: string
  location?: {
    name?: string
    city?: string
    address?: string
  }
  address?: string
  city?: string
  coordinates?: {
    lat?: number
    lng?: number
    _lat?: number
    _long?: number
  }
  isVirtual: boolean
  conferenceUrl?: string
  source: 'aa' | 'na' | 'glrs'
  types?: string
  notes?: string
}

export interface SavedMeeting {
  id: string
  meetingId: string
  meetingName: string
  meetingType: string
  day: number
  time: string
  location?: string
  address?: string
  coordinates?: Meeting['coordinates']
  isVirtual: boolean
  types?: string
  addedAt: Date
}

// =============================================================================
// FETCH FUNCTIONS
// =============================================================================

async function fetchExternalMeetings(): Promise<Meeting[]> {
  const q = query(
    collection(db, 'externalMeetings'),
    orderBy('name', 'asc'),
    limit(5000) // Load all meetings for filtering
  )

  const snapshot = await getDocs(q)
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Meeting[]
}

async function fetchSavedMeetings(userId: string): Promise<SavedMeeting[]> {
  const savedRef = collection(db, 'users', userId, 'savedMeetings')
  const q = query(savedRef, orderBy('addedAt', 'desc'))

  const snapshot = await getDocs(q)
  return snapshot.docs.map((doc) => {
    const data = doc.data()
    return {
      id: doc.id,
      ...data,
      addedAt: data.addedAt?.toDate() || new Date(),
    }
  }) as SavedMeeting[]
}

// =============================================================================
// MAIN HOOKS
// =============================================================================

/**
 * TanStack Query hook for external meetings (AA/NA)
 *
 * Benefits:
 * - Meetings data cached for 10 minutes (changes infrequently)
 * - Shared across all users (no userId in query key)
 * - Single fetch for all meetings, filtering done client-side
 */
export function useExternalMeetingsQuery() {
  const {
    data: meetings = [],
    isLoading,
    isFetching,
    error,
    refetch,
  } = useQuery({
    queryKey: queryKeys.meetings.external(),
    queryFn: fetchExternalMeetings,
    staleTime: 10 * 60 * 1000, // External meetings change weekly, cache longer
  })

  return {
    meetings,
    loading: isLoading,
    isFetching,
    error: error instanceof Error ? error.message : null,
    refreshMeetings: refetch,
  }
}

/**
 * TanStack Query hook for user's saved meetings and favorites
 *
 * Benefits:
 * - Data cached and persists across tab switches
 * - Real-time listener updates cache automatically
 * - Optimistic updates for instant UI feedback
 */
export function useSavedMeetingsQuery() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  // Saved meetings query
  const {
    data: savedMeetings = [],
    isLoading: savedLoading,
    refetch: refetchSaved,
  } = useQuery({
    queryKey: queryKeys.meetings.saved(user?.uid ?? ''),
    queryFn: () => fetchSavedMeetings(user!.uid),
    enabled: !!user?.uid,
    staleTime: 5 * 60 * 1000,
  })

  // Favorites query (just IDs for quick lookup)
  const [favorites, setFavorites] = useState<Set<string>>(new Set())
  const [favoritesLoading, setFavoritesLoading] = useState(true)

  // Real-time listener for favorites
  useEffect(() => {
    if (!user?.uid) {
      setFavorites(new Set())
      setFavoritesLoading(false)
      return
    }

    setFavoritesLoading(true)
    const favoritesRef = collection(db, 'users', user.uid, 'favorites')

    const unsubscribe = onSnapshot(
      favoritesRef,
      (snapshot) => {
        const favIds = new Set<string>(snapshot.docs.map((doc) => doc.id))
        setFavorites(favIds)
        setFavoritesLoading(false)
      },
      (err) => {
        console.error('[useSavedMeetingsQuery] Favorites error:', err)
        setFavoritesLoading(false)
      }
    )

    return () => unsubscribe()
  }, [user?.uid])

  // Real-time listener for saved meetings
  useEffect(() => {
    if (!user?.uid) return

    const savedRef = collection(db, 'users', user.uid, 'savedMeetings')
    const q = query(savedRef, orderBy('addedAt', 'desc'))

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const meetings = snapshot.docs.map((doc) => {
          const data = doc.data()
          return {
            id: doc.id,
            ...data,
            addedAt: data.addedAt?.toDate() || new Date(),
          }
        }) as SavedMeeting[]

        queryClient.setQueryData(
          queryKeys.meetings.saved(user.uid),
          meetings
        )
      },
      (err) => {
        console.error('[useSavedMeetingsQuery] SavedMeetings error:', err)
      }
    )

    return () => unsubscribe()
  }, [user?.uid, queryClient])

  // Save meeting action
  const saveMeeting = useCallback(
    async (meeting: Meeting): Promise<boolean> => {
      if (!user?.uid) return false

      // Optimistic update
      setFavorites((prev) => new Set(prev).add(meeting.id))

      try {
        // Save to favorites (quick lookup)
        const favoriteRef = doc(db, 'users', user.uid, 'favorites', meeting.id)
        await setDoc(favoriteRef, {
          meetingId: meeting.id,
          meetingName: meeting.name,
          meetingType: meeting.source,
          addedAt: serverTimestamp(),
        })

        // Save to savedMeetings (full data)
        const savedRef = doc(db, 'users', user.uid, 'savedMeetings', meeting.id)
        await setDoc(savedRef, {
          meetingId: meeting.id,
          meetingName: meeting.name,
          meetingType: meeting.source,
          day: meeting.day,
          time: meeting.time,
          location: meeting.location?.name || null,
          address: meeting.address || null,
          coordinates: meeting.coordinates || null,
          isVirtual: meeting.isVirtual,
          types: meeting.types || '',
          addedAt: serverTimestamp(),
        })

        return true
      } catch (error) {
        console.error('[useSavedMeetingsQuery] Save error:', error)
        // Revert optimistic update
        setFavorites((prev) => {
          const newSet = new Set(prev)
          newSet.delete(meeting.id)
          return newSet
        })
        return false
      }
    },
    [user?.uid]
  )

  // Unsave meeting action
  const unsaveMeeting = useCallback(
    async (meetingId: string): Promise<boolean> => {
      if (!user?.uid) return false

      // Optimistic update
      setFavorites((prev) => {
        const newSet = new Set(prev)
        newSet.delete(meetingId)
        return newSet
      })

      try {
        const favoriteRef = doc(db, 'users', user.uid, 'favorites', meetingId)
        await deleteDoc(favoriteRef)

        const savedRef = doc(db, 'users', user.uid, 'savedMeetings', meetingId)
        await deleteDoc(savedRef)

        return true
      } catch (error) {
        console.error('[useSavedMeetingsQuery] Unsave error:', error)
        // Real-time listener will correct state
        return false
      }
    },
    [user?.uid]
  )

  // Toggle favorite
  const toggleFavorite = useCallback(
    async (meeting: Meeting): Promise<void> => {
      if (favorites.has(meeting.id)) {
        await unsaveMeeting(meeting.id)
      } else {
        await saveMeeting(meeting)
      }
    },
    [favorites, saveMeeting, unsaveMeeting]
  )

  // Check if favorited
  const isFavorite = useCallback(
    (meetingId: string): boolean => {
      return favorites.has(meetingId)
    },
    [favorites]
  )

  return {
    savedMeetings,
    favorites,
    loading: savedLoading || favoritesLoading,
    saveMeeting,
    unsaveMeeting,
    toggleFavorite,
    isFavorite,
    refreshSaved: refetchSaved,
  }
}

/**
 * Combined hook for meetings tab
 */
export function useMeetingsQuery() {
  const external = useExternalMeetingsQuery()
  const saved = useSavedMeetingsQuery()

  return {
    // External meetings
    meetings: external.meetings,
    meetingsLoading: external.loading,

    // Saved meetings
    savedMeetings: saved.savedMeetings,
    favorites: saved.favorites,
    savedLoading: saved.loading,

    // Actions
    saveMeeting: saved.saveMeeting,
    unsaveMeeting: saved.unsaveMeeting,
    toggleFavorite: saved.toggleFavorite,
    isFavorite: saved.isFavorite,

    // Refresh
    refreshMeetings: external.refreshMeetings,
    refreshSaved: saved.refreshSaved,

    // Combined loading
    loading: external.loading || saved.loading,
  }
}

export default useMeetingsQuery
