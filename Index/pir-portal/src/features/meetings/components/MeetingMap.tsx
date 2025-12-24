/**
 * =============================================================================
 * MEETING MAP COMPONENT - Phase F4 Update
 * =============================================================================
 *
 * Displays meetings on an interactive map with popup details.
 * Now uses toMeetingCardData() mapper for consistent popup display.
 *
 * =============================================================================
 */

import { useEffect, useMemo, useRef, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap, CircleMarker } from 'react-leaflet'
import L from 'leaflet'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Calendar, Clock, MapPin, ExternalLink, Navigation, Loader2 } from 'lucide-react'
import type { Meeting, UserLocation } from '../types'
import { toMeetingCardData } from '../utils/toMeetingCardData'
import { ProgramBadge, LocationBadge, PROGRAM_COLORS, type ProgramType } from './MeetingBadge'
import 'leaflet/dist/leaflet.css'

// ============================================================
// FIX LEAFLET DEFAULT MARKER ICONS
// ============================================================

// Fix for default marker icon not showing in webpack/vite builds
// This is a known issue with Leaflet and module bundlers
delete (L.Icon.Default.prototype as { _getIconUrl?: () => string })._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

// ============================================================
// CUSTOM MARKER ICONS
// ============================================================

// Meeting type to color mapping (for map markers - hex values)
// Uses PROGRAM_COLORS from MeetingBadge for consistency
const MARKER_COLORS: Record<string, string> = {
  AA: PROGRAM_COLORS.aa?.bg || '#3B82F6',      // Blue
  NA: PROGRAM_COLORS.na?.bg || '#22C55E',      // Green
  CMA: PROGRAM_COLORS.cma?.bg || '#A855F7',    // Purple
  MA: PROGRAM_COLORS.ma?.bg || '#8B5CF6',      // Violet
  HA: PROGRAM_COLORS.ha?.bg || '#F97316',      // Orange
  RD: PROGRAM_COLORS.rd?.bg || '#14B8A6',      // Teal
  SMART: PROGRAM_COLORS.smart?.bg || '#CA8A04', // Darker Yellow
  LR: PROGRAM_COLORS.lr?.bg || '#6366F1',      // Indigo
  CR: PROGRAM_COLORS.cr?.bg || '#EF4444',      // Red
  GLRS: '#069494', // Teal (brand color)
}

// Create colored SVG marker icon
function createMarkerIcon(color: string): L.DivIcon {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 36" width="24" height="36">
      <path d="M12 0C5.4 0 0 5.4 0 12c0 7.2 12 24 12 24s12-16.8 12-24C24 5.4 18.6 0 12 0z" fill="${color}"/>
      <circle cx="12" cy="11" r="5" fill="white"/>
    </svg>
  `
  return L.divIcon({
    html: svg,
    className: 'custom-meeting-marker',
    iconSize: [24, 36],
    iconAnchor: [12, 36],
    popupAnchor: [0, -36],
  })
}

// User location marker
const userLocationIcon = L.divIcon({
  html: `
    <div class="user-marker-pulse"></div>
    <div class="user-marker-dot"></div>
  `,
  className: 'user-location-marker-container',
  iconSize: [20, 20],
  iconAnchor: [10, 10],
})

// ============================================================
// TYPES
// ============================================================

interface MeetingMapProps {
  meetings: Meeting[]
  userLocation: UserLocation | null
  onMeetingSelect?: (meeting: Meeting) => void
  selectedMeetingId?: string
  className?: string
  /** Custom center point (overrides auto-calculated center) */
  center?: { lat: number; lng: number }
  /** Custom zoom level */
  zoom?: number
}

// ============================================================
// MAP UPDATER COMPONENT
// ============================================================

// Component to update map view when center/zoom changes
function MapUpdater({
  center,
  zoom,
  shouldFlyTo
}: {
  center: [number, number]
  zoom: number
  shouldFlyTo?: boolean
}) {
  const map = useMap()

  useEffect(() => {
    if (shouldFlyTo) {
      map.flyTo(center, zoom, { duration: 1 })
    } else {
      map.setView(center, zoom)
    }
  }, [map, center, zoom, shouldFlyTo])

  return null
}

// ============================================================
// FIT BOUNDS COMPONENT
// ============================================================

// Component to fit map to show all markers
function FitBounds({ meetings }: { meetings: Meeting[] }) {
  const map = useMap()

  useEffect(() => {
    if (meetings.length === 0) return

    const validMeetings = meetings.filter(
      m => m.coordinates?.lat && m.coordinates?.lng &&
           m.coordinates.lat !== 0 && m.coordinates.lng !== 0
    )

    if (validMeetings.length === 0) return

    const bounds = L.latLngBounds(
      validMeetings.map(m => [m.coordinates!.lat!, m.coordinates!.lng!])
    )

    map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 })
  }, [map, meetings])

  return null
}

// ============================================================
// MEETING MAP COMPONENT
// ============================================================

export function MeetingMap({
  meetings,
  userLocation,
  onMeetingSelect,
  selectedMeetingId,
  className,
  center: customCenter,
  zoom: customZoom = 11,
}: MeetingMapProps) {
  const mapRef = useRef<L.Map | null>(null)
  const [isMapReady, setIsMapReady] = useState(false)

  // ============================================================
  // CALCULATE CENTER
  // ============================================================

  const center = useMemo<[number, number]>(() => {
    // Use custom center if provided
    if (customCenter) {
      return [customCenter.lat, customCenter.lng]
    }

    // Use user location if available
    if (userLocation) {
      return [userLocation.lat, userLocation.lng]
    }

    // Default to Bay Area center
    if (meetings.length === 0) {
      return [37.5485, -122.0585] // Bay Area center
    }

    // Calculate center from meeting coordinates
    const validMeetings = meetings.filter(
      m => m.coordinates?.lat && m.coordinates?.lng &&
           m.coordinates.lat !== 0 && m.coordinates.lng !== 0
    )

    if (validMeetings.length === 0) {
      return [37.5485, -122.0585]
    }

    const avgLat = validMeetings.reduce((sum, m) => sum + (m.coordinates?.lat || 0), 0) / validMeetings.length
    const avgLng = validMeetings.reduce((sum, m) => sum + (m.coordinates?.lng || 0), 0) / validMeetings.length

    return [avgLat, avgLng]
  }, [meetings, userLocation, customCenter])

  // ============================================================
  // FILTER MAPPABLE MEETINGS
  // ============================================================

  const mappableMeetings = useMemo(() => {
    return meetings.filter(m =>
      m.coordinates?.lat &&
      m.coordinates?.lng &&
      m.coordinates.lat !== 0 &&
      m.coordinates.lng !== 0
    )
  }, [meetings])

  // ============================================================
  // GET MARKER FOR MEETING TYPE
  // ============================================================

  const getMarkerIcon = (meeting: Meeting): L.DivIcon => {
    const meetingType = (meeting.type || meeting.source || 'AA').toUpperCase()
    const color = MARKER_COLORS[meetingType] || MARKER_COLORS.AA
    return createMarkerIcon(color)
  }

  // ============================================================
  // HANDLE DIRECTIONS
  // ============================================================

  const handleGetDirections = (meeting: Meeting) => {
    if (!meeting.coordinates?.lat || !meeting.coordinates?.lng) return

    const destination = `${meeting.coordinates.lat},${meeting.coordinates.lng}`
    const origin = userLocation ? `${userLocation.lat},${userLocation.lng}` : ''

    // Open Google Maps with directions
    const url = origin
      ? `https://www.google.com/maps/dir/${origin}/${destination}`
      : `https://www.google.com/maps/search/?api=1&query=${destination}`

    window.open(url, '_blank', 'noopener,noreferrer')
  }

  // ============================================================
  // RENDER
  // ============================================================

  if (mappableMeetings.length === 0 && !userLocation) {
    return (
      <div
        className={cn('flex items-center justify-center h-full min-h-[400px] bg-muted/30 rounded-lg', className)}
        role="status"
        aria-label="No meetings available to display on map"
      >
        <div className="text-center p-6">
          <MapPin className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" aria-hidden="true" />
          <p className="text-muted-foreground">No meetings with location data to display</p>
          <p className="text-sm text-muted-foreground/70 mt-1">Try adjusting your filters</p>
        </div>
      </div>
    )
  }

  return (
    <div className={cn('relative h-full min-h-[400px]', className)}>
      {/* Loading overlay */}
      {!isMapReady && (
        <div
          className="absolute inset-0 z-10 flex items-center justify-center bg-background/80 rounded-lg"
          role="status"
          aria-label="Loading map"
        >
          <Loader2 className="h-8 w-8 animate-spin motion-reduce:animate-none text-primary" aria-hidden="true" />
          <span className="sr-only">Loading map...</span>
        </div>
      )}

      {/* Map Container */}
      <MapContainer
        center={center}
        zoom={customZoom}
        className="h-full w-full rounded-lg"
        scrollWheelZoom={true}
        ref={mapRef}
        whenReady={() => setIsMapReady(true)}
      >
        {/* Tile Layer (OpenStreetMap) */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Map Updater */}
        <MapUpdater center={center} zoom={customZoom} />

        {/* Fit Bounds on initial load if we have multiple meetings */}
        {mappableMeetings.length > 1 && <FitBounds meetings={mappableMeetings} />}

        {/* User Location Marker */}
        {userLocation && (
          <CircleMarker
            center={[userLocation.lat, userLocation.lng]}
            radius={8}
            pathOptions={{
              color: '#3B82F6',
              fillColor: '#3B82F6',
              fillOpacity: 1,
              weight: 2,
            }}
          >
            <Popup>
              <div className="text-center font-medium">Your Location</div>
            </Popup>
          </CircleMarker>
        )}

        {/* Meeting Markers */}
        {mappableMeetings.map((meeting) => {
          // Transform to standardized card data for consistent popup display
          const cardData = toMeetingCardData(meeting)
          const normalizedProgramType = cardData.programType.toLowerCase() as ProgramType

          return (
            <Marker
              key={meeting.id}
              position={[meeting.coordinates!.lat!, meeting.coordinates!.lng!]}
              icon={getMarkerIcon(meeting)}
              eventHandlers={{
                click: () => onMeetingSelect?.(meeting),
              }}
            >
              <Popup minWidth={250} maxWidth={320}>
                <div className="p-1">
                  {/* Meeting Name - never blank */}
                  <h3 className="font-semibold text-sm mb-1 pr-4">{cardData.name}</h3>

                  {/* Meeting Badges Row */}
                  <div className="flex flex-wrap items-center gap-1 mb-2">
                    <ProgramBadge
                      type={normalizedProgramType}
                      size="xs"
                      variant="filled"
                    />
                    {cardData.isHybrid ? (
                      <LocationBadge type="hybrid" size="xs" variant="filled" />
                    ) : cardData.isVirtual ? (
                      <LocationBadge type="virtual" size="xs" variant="filled" />
                    ) : null}
                  </div>

                  {/* Location - never blank (uses fallback chain) */}
                  <div className="flex items-start gap-1.5 text-xs text-muted-foreground mb-1">
                    <MapPin className="h-3.5 w-3.5 mt-0.5 shrink-0" aria-hidden="true" />
                    <span>{cardData.locationDisplay}</span>
                  </div>

                  {/* Day & Time - never blank (uses standardized formatting) */}
                  <div className="flex items-center gap-3 text-xs mb-2">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>{cardData.dayDisplay}</span>
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>{cardData.timeDisplay}</span>
                    </div>
                  </div>

                  {/* Distance - uses standardized formatting */}
                  {cardData.showDistance && cardData.distanceDisplay && (
                    <p className="text-xs text-primary font-medium mb-2">
                      {cardData.distanceDisplay} away
                    </p>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-2 mt-2 pt-2 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 text-xs flex-1 min-h-[36px] focus:ring-2 focus:ring-primary focus:ring-offset-1"
                      onClick={() => handleGetDirections(meeting)}
                      aria-label={`Get directions to ${cardData.name}`}
                    >
                      <Navigation className="h-3 w-3 mr-1" aria-hidden="true" />
                      Directions
                    </Button>
                    {cardData.canJoinOnline && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs flex-1 min-h-[36px] focus:ring-2 focus:ring-primary focus:ring-offset-1"
                        onClick={() => {
                          if (cardData.conferenceUrl) {
                            window.open(cardData.conferenceUrl, '_blank', 'noopener,noreferrer')
                          }
                        }}
                        aria-label={`Join ${cardData.name} online, opens in new window`}
                      >
                        <ExternalLink className="h-3 w-3 mr-1" aria-hidden="true" />
                        Join Virtual
                      </Button>
                    )}
                  </div>
                </div>
              </Popup>
            </Marker>
          )
        })}
      </MapContainer>

      {/* Meeting Count Overlay */}
      <div
        className="absolute bottom-4 left-4 z-[1000] bg-background/90 backdrop-blur-sm rounded-md px-3 py-1.5 shadow-md"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        <span className="text-xs font-medium">
          {mappableMeetings.length} meetings on map
        </span>
      </div>

      {/* Legend */}
      <div
        className="absolute top-4 right-4 z-[1000] bg-background/90 backdrop-blur-sm rounded-md p-2 shadow-md"
        aria-label="Map legend showing meeting type colors"
        role="region"
      >
        <div className="text-xs font-medium mb-1" id="map-legend-title">Meeting Types</div>
        <div className="grid grid-cols-2 gap-x-3 gap-y-0.5" aria-labelledby="map-legend-title">
          {Object.entries(MARKER_COLORS).slice(0, 6).map(([type, color]) => (
            <div key={type} className="flex items-center gap-1">
              <div
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: color }}
                aria-hidden="true"
              />
              <span className="text-[10px] text-muted-foreground">{type}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Custom CSS for user location marker */}
      <style>{`
        .user-location-marker-container {
          position: relative;
        }
        .user-marker-pulse {
          position: absolute;
          width: 20px;
          height: 20px;
          background: rgba(59, 130, 246, 0.3);
          border-radius: 50%;
          animation: pulse 2s infinite;
        }
        .user-marker-dot {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 12px;
          height: 12px;
          background: #3B82F6;
          border: 2px solid white;
          border-radius: 50%;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        }
        @keyframes pulse {
          0% { transform: scale(1); opacity: 1; }
          100% { transform: scale(2.5); opacity: 0; }
        }
        .custom-meeting-marker {
          background: transparent !important;
          border: none !important;
        }
        .leaflet-popup-content-wrapper {
          border-radius: 8px;
        }
        .leaflet-popup-content {
          margin: 8px 12px;
        }
      `}</style>
    </div>
  )
}

export default MeetingMap
