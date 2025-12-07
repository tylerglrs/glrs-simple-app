import { useState, useEffect, useCallback } from 'react'
import {
  db,
  collection,
  getDocs,
  query,
  limit,
  onSnapshot,
} from '@/lib/firebase'
import type { Meeting, UseExternalMeetingsReturn, MeetingSource, MeetingCoordinates, MeetingAddress } from '../types'

// ============================================================
// CONSTANTS
// ============================================================

const EXTERNAL_MEETINGS_COLLECTION = 'externalMeetings'
const MAX_MEETINGS_LIMIT = 5000

// Cache keys for localStorage
const CACHE_KEY_COUNT = 'externalMeetingsCount'
const CACHE_KEY_TIMESTAMP = 'externalMeetingsCountTimestamp'
const CACHE_EXPIRY_MS = 60 * 60 * 1000 // 1 hour

// ============================================================
// HELPER FUNCTIONS
// ============================================================

/**
 * Get cached meeting count from localStorage
 * Returns null if cache is expired or invalid
 */
function getCachedCount(): number | null {
  try {
    const countStr = localStorage.getItem(CACHE_KEY_COUNT)
    const timestampStr = localStorage.getItem(CACHE_KEY_TIMESTAMP)

    if (!countStr || !timestampStr) return null

    const timestamp = parseInt(timestampStr, 10)
    const isExpired = Date.now() - timestamp > CACHE_EXPIRY_MS

    if (isExpired) {
      localStorage.removeItem(CACHE_KEY_COUNT)
      localStorage.removeItem(CACHE_KEY_TIMESTAMP)
      return null
    }

    return parseInt(countStr, 10)
  } catch (error) {
    console.error('[useExternalMeetings] Error reading cache:', error)
    return null
  }
}

/**
 * Set cached meeting count in localStorage
 */
function setCachedCount(count: number): void {
  try {
    localStorage.setItem(CACHE_KEY_COUNT, count.toString())
    localStorage.setItem(CACHE_KEY_TIMESTAMP, Date.now().toString())
  } catch (error) {
    console.error('[useExternalMeetings] Error writing cache:', error)
  }
}

/**
 * Normalize external meeting data to common Meeting format
 * Handles various field naming conventions from scrapers
 */
function normalizeExternalMeeting(doc: { id: string; [key: string]: unknown }): Meeting {
  const data = doc

  // Determine meeting source (AA or NA)
  const rawSource = (data.source || data.type || 'AA') as string
  const source: MeetingSource = rawSource.toUpperCase() === 'NA' ? 'NA' : 'AA'

  // Extract coordinates from various formats
  let coordinates: MeetingCoordinates | undefined = undefined
  if (data.coordinates) {
    const coords = data.coordinates as { lat?: number; lng?: number; _lat?: number; _long?: number; latitude?: number; longitude?: number }
    coordinates = {
      lat: coords.lat || coords._lat || coords.latitude || 0,
      lng: coords.lng || coords._long || coords.longitude || 0,
      _lat: coords._lat,
      _long: coords._long,
    }
  } else if (data.location && typeof data.location === 'object') {
    const loc = data.location as { coordinates?: { lat?: number; lng?: number; _lat?: number; _long?: number } }
    if (loc.coordinates) {
      coordinates = {
        lat: loc.coordinates.lat || loc.coordinates._lat || 0,
        lng: loc.coordinates.lng || loc.coordinates._long || 0,
        _lat: loc.coordinates._lat,
        _long: loc.coordinates._long,
      }
    }
  }

  // Extract location info
  const location = data.location as { name?: string; streetName?: string; city?: string; state?: string; zipCode?: string; formatted?: string; coordinates?: unknown } | undefined

  // Extract address info
  const address = data.address as { street?: string; city?: string; state?: string; zip?: string; formatted?: string } | string | undefined
  let parsedAddress: MeetingAddress | undefined = undefined
  if (typeof address === 'string') {
    try {
      parsedAddress = JSON.parse(address) as MeetingAddress
    } catch {
      parsedAddress = { street: address }
    }
  } else if (address && typeof address === 'object') {
    parsedAddress = address
  }

  return {
    id: doc.id,
    name: (data.name as string) || 'Unknown Meeting',
    type: source,
    types: (data.types as string) || '',
    day: typeof data.day === 'number' ? data.day : 0,
    time: (data.time as string) || '',
    duration: data.duration as number | undefined,
    location: location ? {
      name: location.name,
      streetName: location.streetName,
      city: location.city,
      state: location.state,
      zipCode: location.zipCode,
      formatted: location.formatted,
      coordinates: coordinates,
    } : undefined,
    locationName: (data.locationName as string) || location?.name,
    address: parsedAddress,
    city: (data.city as string) || location?.city,
    state: (data.state as string) || location?.state,
    zip: (data.zip as string) || location?.zipCode,
    coordinates,
    isVirtual: Boolean(data.isVirtual || data.online || data.conferenceUrl || data.conference_url),
    conferenceUrl: (data.conferenceUrl as string) || (data.conference_url as string),
    conference_url: data.conference_url as string | undefined,
    meetingLink: data.meetingLink as string | undefined,
    notes: data.notes as string | undefined,
    source,
    externalMeetingId: doc.id,
    lastUpdated: data.lastUpdated as Meeting['lastUpdated'],
  }
}

// ============================================================
// HOOK: useExternalMeetings
// ============================================================

/**
 * Hook for loading external AA/NA meetings from Firestore
 *
 * Features:
 * - Loads up to 5,000 meetings from externalMeetings collection
 * - Real-time listener for updates
 * - Caches meeting count with 1-hour expiry
 * - Normalizes data from various scraper formats
 *
 * @returns Object with meetings array, loading state, and error
 */
export function useExternalMeetings(): UseExternalMeetingsReturn {
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load external meetings with real-time listener
  useEffect(() => {
    setLoading(true)
    setError(null)

    // Check cached count for quick UI feedback
    const cachedCount = getCachedCount()
    if (cachedCount !== null) {
      console.log(`[useExternalMeetings] Cached count: ${cachedCount} meetings`)
    }

    // Create query for external meetings
    const meetingsRef = collection(db, EXTERNAL_MEETINGS_COLLECTION)
    const meetingsQuery = query(meetingsRef, limit(MAX_MEETINGS_LIMIT))

    // Set up real-time listener
    const unsubscribe = onSnapshot(
      meetingsQuery,
      (snapshot) => {
        try {
          const normalizedMeetings: Meeting[] = snapshot.docs.map((doc) => {
            const data = doc.data()
            return normalizeExternalMeeting({ id: doc.id, ...data })
          })

          setMeetings(normalizedMeetings)
          setLoading(false)
          setError(null)

          // Update cache
          setCachedCount(normalizedMeetings.length)
          console.log(`[useExternalMeetings] Loaded ${normalizedMeetings.length} external meetings`)
        } catch (err) {
          console.error('[useExternalMeetings] Error processing meetings:', err)
          setError('Failed to process meeting data')
          setLoading(false)
        }
      },
      (err) => {
        console.error('[useExternalMeetings] Firestore listener error:', err)
        setError('Failed to load external meetings. Please try again.')
        setLoading(false)
      }
    )

    // Cleanup listener on unmount
    return () => {
      console.log('[useExternalMeetings] Cleaning up listener')
      unsubscribe()
    }
  }, [])

  return {
    meetings,
    loading,
    error,
  }
}

// ============================================================
// HOOK: useExternalMeetingsStatic (Alternative without real-time)
// ============================================================

/**
 * Static version that loads meetings once (not real-time)
 * Use this for better performance if real-time updates aren't needed
 */
export function useExternalMeetingsStatic(): UseExternalMeetingsReturn & { refetch: () => Promise<void> } {
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadMeetings = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const meetingsRef = collection(db, EXTERNAL_MEETINGS_COLLECTION)
      const meetingsQuery = query(meetingsRef, limit(MAX_MEETINGS_LIMIT))
      const snapshot = await getDocs(meetingsQuery)

      const normalizedMeetings: Meeting[] = snapshot.docs.map((doc) => {
        const data = doc.data()
        return normalizeExternalMeeting({ id: doc.id, ...data })
      })

      setMeetings(normalizedMeetings)
      setCachedCount(normalizedMeetings.length)
      console.log(`[useExternalMeetingsStatic] Loaded ${normalizedMeetings.length} external meetings`)
    } catch (err) {
      console.error('[useExternalMeetingsStatic] Error loading meetings:', err)
      setError('Failed to load external meetings. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [])

  // Load meetings on mount
  useEffect(() => {
    loadMeetings()
  }, [loadMeetings])

  return {
    meetings,
    loading,
    error,
    refetch: loadMeetings,
  }
}

export default useExternalMeetings
