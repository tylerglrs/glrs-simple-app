import { useState, useEffect, useCallback } from 'react'
import type { UserLocation, LocationPermissionStatus, UseGeolocationReturn } from '../types'

// ============================================================
// CONSTANTS
// ============================================================

// Geolocation options
const GEOLOCATION_OPTIONS: PositionOptions = {
  enableHighAccuracy: true,
  timeout: 10000, // 10 seconds
  maximumAge: 300000, // Cache for 5 minutes
}

// Cache key for localStorage
const LOCATION_CACHE_KEY = 'userLocation'
const LOCATION_CACHE_EXPIRY_MS = 30 * 60 * 1000 // 30 minutes

// ============================================================
// HELPER FUNCTIONS
// ============================================================

/**
 * Get cached location from localStorage
 * Returns null if cache is expired or invalid
 */
function getCachedLocation(): UserLocation | null {
  try {
    const cached = localStorage.getItem(LOCATION_CACHE_KEY)
    if (!cached) return null

    const { lat, lng, timestamp } = JSON.parse(cached)
    const isExpired = Date.now() - timestamp > LOCATION_CACHE_EXPIRY_MS

    if (isExpired) {
      localStorage.removeItem(LOCATION_CACHE_KEY)
      return null
    }

    return { lat, lng }
  } catch {
    localStorage.removeItem(LOCATION_CACHE_KEY)
    return null
  }
}

/**
 * Set cached location in localStorage
 */
function setCachedLocation(location: UserLocation): void {
  try {
    localStorage.setItem(
      LOCATION_CACHE_KEY,
      JSON.stringify({
        lat: location.lat,
        lng: location.lng,
        timestamp: Date.now(),
      })
    )
  } catch (error) {
    console.error('[useGeolocation] Error caching location:', error)
  }
}

/**
 * Clear cached location from localStorage
 */
function clearCachedLocation(): void {
  try {
    localStorage.removeItem(LOCATION_CACHE_KEY)
  } catch (error) {
    console.error('[useGeolocation] Error clearing cache:', error)
  }
}

/**
 * Map GeolocationPositionError codes to user-friendly messages
 */
function getErrorMessage(error: GeolocationPositionError): string {
  switch (error.code) {
    case error.PERMISSION_DENIED:
      return 'Location access was denied. Please enable location permissions in your browser settings.'
    case error.POSITION_UNAVAILABLE:
      return 'Location information is unavailable. Please try again.'
    case error.TIMEOUT:
      return 'Location request timed out. Please try again.'
    default:
      return 'Failed to get your location. Please try again.'
  }
}

// ============================================================
// HOOK: useGeolocation
// ============================================================

/**
 * Hook for browser geolocation with permission handling
 *
 * Features:
 * - Permission status tracking (prompt, granted, denied)
 * - Auto-request location if already granted
 * - Location caching with 30-minute expiry
 * - Error handling with user-friendly messages
 * - Clear location function for privacy
 *
 * @returns Object with location, permission status, loading state, error, and methods
 */
export function useGeolocation(): UseGeolocationReturn {
  const [location, setLocation] = useState<UserLocation | null>(null)
  const [permissionStatus, setPermissionStatus] = useState<LocationPermissionStatus>('prompt')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Check permission status and restore cached location on mount
  useEffect(() => {
    // Try to restore cached location
    const cached = getCachedLocation()
    if (cached) {
      setLocation(cached)
      console.log('[useGeolocation] Restored cached location')
    }

    // Check permission status using Permissions API
    if ('permissions' in navigator) {
      navigator.permissions
        .query({ name: 'geolocation' })
        .then((result) => {
          setPermissionStatus(result.state as LocationPermissionStatus)
          console.log(`[useGeolocation] Permission status: ${result.state}`)

          // If already granted and no cached location, request fresh location
          if (result.state === 'granted' && !cached) {
            requestLocation()
          }

          // Listen for permission changes
          result.onchange = () => {
            const newStatus = result.state as LocationPermissionStatus
            setPermissionStatus(newStatus)
            console.log(`[useGeolocation] Permission changed to: ${newStatus}`)

            // If permission revoked, clear location
            if (newStatus === 'denied') {
              setLocation(null)
              clearCachedLocation()
              setError('Location access was denied.')
            }
          }
        })
        .catch(() => {
          // Permissions API not supported, assume prompt
          console.log('[useGeolocation] Permissions API not supported')
          setPermissionStatus('prompt')
        })
    } else {
      console.log('[useGeolocation] Permissions API not available')
    }
  }, [])

  /**
   * Request current location from browser
   * Handles permission prompts, success, and errors
   */
  const requestLocation = useCallback(async () => {
    // Check if geolocation is supported
    if (!('geolocation' in navigator)) {
      setError('Geolocation is not supported by your browser.')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, GEOLOCATION_OPTIONS)
      })

      const newLocation: UserLocation = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      }

      setLocation(newLocation)
      setPermissionStatus('granted')
      setCachedLocation(newLocation)
      console.log('[useGeolocation] Got location:', newLocation)
    } catch (err) {
      const geoError = err as GeolocationPositionError
      const errorMessage = getErrorMessage(geoError)

      setError(errorMessage)
      console.error('[useGeolocation] Error:', errorMessage)

      // Update permission status if denied
      if (geoError.code === geoError.PERMISSION_DENIED) {
        setPermissionStatus('denied')
      }
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * Clear current location (for privacy or filter reset)
   */
  const clearLocation = useCallback(() => {
    setLocation(null)
    clearCachedLocation()
    setError(null)
    console.log('[useGeolocation] Location cleared')
  }, [])

  return {
    location,
    permissionStatus,
    loading,
    error,
    requestLocation,
    clearLocation,
  }
}

// ============================================================
// DISTANCE CALCULATION UTILITIES
// ============================================================

/**
 * Haversine formula to calculate distance between two coordinates
 * @param lat1 First latitude
 * @param lng1 First longitude
 * @param lat2 Second latitude
 * @param lng2 Second longitude
 * @returns Distance in miles
 */
export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 3959 // Earth's radius in miles
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

/**
 * Format distance for display
 * @param distance Distance in miles
 * @returns Formatted string (e.g., "< 0.1 mi", "2.5 mi", "10 mi")
 */
export function formatDistance(distance: number | null | undefined): string | null {
  if (distance === null || distance === undefined) return null
  if (distance < 0.1) return '< 0.1 mi'
  if (distance < 1) return `${distance.toFixed(1)} mi`
  return `${Math.round(distance)} mi`
}

/**
 * Add distance to meetings based on user location
 * @param meetings Array of meetings
 * @param userLocation User's current location
 * @returns Meetings with distance property populated
 */
export function addDistanceToMeetings<T extends { coordinates?: { lat?: number; lng?: number; _lat?: number; _long?: number } }>(
  meetings: T[],
  userLocation: UserLocation | null
): (T & { distance: number | null })[] {
  if (!userLocation) {
    return meetings.map((meeting) => ({ ...meeting, distance: null }))
  }

  return meetings.map((meeting) => {
    const coords = meeting.coordinates
    if (!coords) {
      return { ...meeting, distance: null }
    }

    // Handle various coordinate formats
    const lat = coords.lat || coords._lat || 0
    const lng = coords.lng || coords._long || 0

    if (!lat || !lng) {
      return { ...meeting, distance: null }
    }

    const distance = calculateDistance(userLocation.lat, userLocation.lng, lat, lng)
    return { ...meeting, distance }
  })
}

/**
 * Sort meetings by distance (closest first)
 * Meetings without distance go to the end
 */
export function sortByDistance<T extends { distance?: number | null }>(meetings: T[]): T[] {
  return [...meetings].sort((a, b) => {
    const distA = a.distance ?? Infinity
    const distB = b.distance ?? Infinity
    return distA - distB
  })
}

export default useGeolocation
