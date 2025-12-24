import { useState, useCallback, useRef, useEffect } from 'react'
import { MapPin, Loader2, X, Navigation } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

// ============================================================
// TYPES
// ============================================================

interface LocationSearchProps {
  onLocationSelect: (location: { lat: number; lng: number; address: string }) => void
  onClear: () => void
  currentAddress?: string
  className?: string
  placeholder?: string
}

interface NominatimResult {
  lat: string
  lon: string
  display_name: string
  type: string
  class: string
  importance: number
  address?: {
    city?: string
    town?: string
    village?: string
    county?: string
    state?: string
    postcode?: string
    country?: string
  }
}

// ============================================================
// CONSTANTS
// ============================================================

// Using OpenStreetMap Nominatim (free, no API key required)
// Rate limit: 1 request per second - we use 500ms debounce to be safe
const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search'

// Default center for Bay Area (used when no results)
const BAY_AREA_CENTER = { lat: 37.5, lng: -122.0 }

// ============================================================
// HELPER FUNCTIONS
// ============================================================

/**
 * Format a Nominatim result into a cleaner display string
 */
function formatAddress(result: NominatimResult): string {
  // Try to create a cleaner address from the parts
  const parts = result.display_name.split(', ')

  // If we have address details, use them for a cleaner format
  if (result.address) {
    const city = result.address.city || result.address.town || result.address.village || ''
    const state = result.address.state || ''
    const zip = result.address.postcode || ''

    // Get the first part (usually the street/location name)
    const name = parts[0] || ''

    if (city && state) {
      return zip ? `${name}, ${city}, ${state} ${zip}` : `${name}, ${city}, ${state}`
    }
  }

  // Fallback to truncated display_name
  if (parts.length > 4) {
    return parts.slice(0, 4).join(', ')
  }

  return result.display_name
}

/**
 * Get a short label for a location result
 */
function getShortLabel(result: NominatimResult): string {
  const parts = result.display_name.split(', ')
  return parts[0] || result.display_name
}

// ============================================================
// LOCATION SEARCH COMPONENT
// ============================================================

export function LocationSearch({
  onLocationSelect,
  onClear,
  currentAddress,
  className,
  placeholder = 'Search by address or zip code...',
}: LocationSearchProps) {
  // State
  const [query, setQuery] = useState(currentAddress || '')
  const [results, setResults] = useState<NominatimResult[]>([])
  const [loading, setLoading] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Refs
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // ============================================================
  // SEARCH FUNCTION
  // ============================================================

  const searchLocation = useCallback(async (searchQuery: string) => {
    // Need at least 3 characters for meaningful search
    if (searchQuery.length < 3) {
      setResults([])
      setError(null)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({
        q: searchQuery,
        format: 'json',
        countrycodes: 'us', // Restrict to US
        limit: '8',
        addressdetails: '1', // Include address breakdown
        // Prioritize places in California for Bay Area users
        viewbox: '-123.5,38.5,-121.0,36.5', // Bay Area bounding box
        bounded: '0', // Don't restrict to viewbox, just bias results
      })

      const response = await fetch(`${NOMINATIM_URL}?${params}`, {
        headers: {
          'User-Agent': 'GLRS-Lighthouse-Recovery-App/1.0',
          'Accept-Language': 'en-US,en;q=0.9',
        },
      })

      if (!response.ok) {
        throw new Error(`Search failed: ${response.status}`)
      }

      const data: NominatimResult[] = await response.json()

      // Sort by importance/relevance
      const sortedData = data.sort((a, b) => b.importance - a.importance)

      setResults(sortedData)
      setShowResults(true)

      if (sortedData.length === 0 && searchQuery.length >= 3) {
        setError('No locations found. Try a different search.')
      }
    } catch (err) {
      console.error('[LocationSearch] Error:', err)
      setError('Search failed. Please try again.')
      setResults([])
    } finally {
      setLoading(false)
    }
  }, [])

  // ============================================================
  // EVENT HANDLERS
  // ============================================================

  // Handle input change with debounce
  const handleInputChange = useCallback((value: string) => {
    setQuery(value)
    setError(null)

    // Clear any existing debounce timer
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    // Debounce the search (500ms to respect Nominatim rate limits)
    debounceRef.current = setTimeout(() => {
      searchLocation(value)
    }, 500)
  }, [searchLocation])

  // Handle result selection
  const handleSelect = useCallback((result: NominatimResult) => {
    const lat = parseFloat(result.lat)
    const lng = parseFloat(result.lon)
    const address = formatAddress(result)

    onLocationSelect({ lat, lng, address })
    setQuery(getShortLabel(result))
    setShowResults(false)
    setResults([])
  }, [onLocationSelect])

  // Handle clear
  const handleClear = useCallback(() => {
    setQuery('')
    setResults([])
    setShowResults(false)
    setError(null)
    onClear()
    inputRef.current?.focus()
  }, [onClear])

  // Handle "Use Current Location" (browser geolocation)
  const handleUseCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser')
      return
    }

    setLoading(true)
    setError(null)

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        onLocationSelect({
          lat: latitude,
          lng: longitude,
          address: 'Current Location',
        })
        setQuery('Current Location')
        setShowResults(false)
        setLoading(false)
      },
      (err) => {
        console.error('[LocationSearch] Geolocation error:', err)
        setError('Could not get your location. Please enable location access.')
        setLoading(false)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000, // Cache for 1 minute
      }
    )
  }, [onLocationSelect])

  // ============================================================
  // EFFECTS
  // ============================================================

  // Close results on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowResults(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Update query when currentAddress prop changes
  useEffect(() => {
    if (currentAddress && currentAddress !== query) {
      setQuery(currentAddress)
    }
  }, [currentAddress])

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [])

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      {/* Search Input */}
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => results.length > 0 && setShowResults(true)}
          className="pl-9 pr-20"
          aria-label="Search for a location"
          aria-describedby={error ? 'location-search-error' : undefined}
        />

        {/* Action Buttons */}
        <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {/* Current Location Button */}
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={handleUseCurrentLocation}
            disabled={loading}
            title="Use current location"
            aria-label="Use current location"
          >
            <Navigation className="h-3.5 w-3.5" />
          </Button>

          {/* Clear Button */}
          {(query || loading) && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={handleClear}
              disabled={loading}
              title="Clear search"
              aria-label="Clear search"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <X className="h-4 w-4" />
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <p id="location-search-error" className="text-xs text-destructive mt-1 px-1">
          {error}
        </p>
      )}

      {/* Results Dropdown */}
      {showResults && results.length > 0 && (
        <div
          className="absolute z-50 top-full left-0 right-0 mt-1 bg-popover border rounded-md shadow-lg overflow-hidden max-h-[300px] overflow-y-auto"
          role="listbox"
          aria-label="Location search results"
        >
          {results.map((result, index) => (
            <button
              key={`${result.lat}-${result.lon}-${index}`}
              type="button"
              role="option"
              className="w-full px-3 py-2.5 text-left text-sm hover:bg-accent transition-colors flex items-start gap-2 border-b border-border/50 last:border-b-0"
              onClick={() => handleSelect(result)}
            >
              <MapPin className="h-4 w-4 mt-0.5 shrink-0 text-primary" />
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">
                  {getShortLabel(result)}
                </div>
                <div className="text-xs text-muted-foreground truncate mt-0.5">
                  {formatAddress(result)}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* No Results Message */}
      {showResults && query.length >= 3 && results.length === 0 && !loading && !error && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-popover border rounded-md shadow-lg p-4 text-center">
          <p className="text-sm text-muted-foreground">
            No locations found for "{query}"
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Try a more specific address or zip code
          </p>
        </div>
      )}
    </div>
  )
}

export default LocationSearch
