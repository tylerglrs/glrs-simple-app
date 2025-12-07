import type { Timestamp } from 'firebase/firestore'

// ============================================================
// MEETING DATA TYPES
// ============================================================

export type MeetingSource = 'GLRS' | 'AA' | 'NA' | 'external' | 'saved'
export type MeetingStatus = 'scheduled' | 'completed' | 'cancelled'

export interface MeetingCoordinates {
  lat: number
  lng: number
  _lat?: number // Firestore GeoPoint format
  _long?: number // Firestore GeoPoint format
  latitude?: number
  longitude?: number
}

export interface MeetingLocation {
  name?: string
  streetName?: string
  city?: string
  state?: string
  zipCode?: string
  formatted?: string
  coordinates?: MeetingCoordinates
}

export interface MeetingAddress {
  street?: string
  city?: string
  state?: string
  zip?: string
  formatted?: string
}

export interface Meeting {
  id: string
  name: string
  type: MeetingSource
  types?: string // Comma-separated meeting type codes (O, C, D, B, etc.)
  day: number // 0-6 (Sunday-Saturday)
  time: string
  duration?: number
  location?: MeetingLocation
  locationName?: string
  address?: MeetingAddress
  city?: string
  state?: string
  zip?: string
  coordinates?: MeetingCoordinates
  isVirtual: boolean
  conferenceUrl?: string
  conference_url?: string
  meetingLink?: string
  notes?: string
  source: MeetingSource
  externalMeetingId?: string
  lastUpdated?: Timestamp | null
  distance?: number | null // Calculated distance from user location
}

export interface ScheduledMeeting extends Meeting {
  userId: string
  meetingTitle: string
  scheduledTime: Timestamp
  status: MeetingStatus
  attended: boolean
  attendedAt?: Timestamp | null
  glrsMeetingId?: string
  recurringSource?: string
  isRecurring?: boolean
  createdAt?: Timestamp | null
  updatedAt?: Timestamp | null
}

export interface SavedMeeting {
  id: string
  meetingId: string
  meetingName: string
  meetingType: MeetingSource
  addedAt: Timestamp
}

// ============================================================
// FILTER TYPES
// ============================================================

export type MeetingTypeFilter = 'all' | 'aa' | 'na'

export type CountyFilter =
  | 'all'
  | 'sf'
  | 'eastbay'
  | 'santaclara'
  | 'santacruz'
  | 'sanmateo'
  | 'other'

export type DayFilter = 'all' | '0' | '1' | '2' | '3' | '4' | '5' | '6'

export type FormatFilter =
  | 'all'
  | 'D' // Discussion
  | 'B' // Big Book Study
  | '12x12' // 12 Steps & 12 Traditions
  | 'LIT' // Literature
  | 'ST' // Step Study
  | 'SP' // Speaker
  | 'MED' // Meditation
  | 'CAN' // Candlelight
  | 'T' // Tradition Study
  | 'TR' // Tradition Study
  | 'POA' // Format Varies

export type GroupFilter =
  | 'W' // Women Only
  | 'M' // Men Only
  | 'Y' // Young People
  | 'SEN' // Seniors
  | 'LGBTQ' // LGBTQ+
  | 'POC' // People of Color
  | 'NB' // Non-Binary
  | 'BE' // Beginners
  | 'DD' // Dual Diagnosis

export type AccessibilityFilter =
  | 'O' // Open
  | 'C' // Closed
  | 'X' // Wheelchair Accessible
  | 'XB' // Wheelchair + Bathroom
  | 'BA' // Babysitting Available
  | 'CF' // Child-Friendly
  | 'ASL' // ASL Interpreted
  | 'ONL' // Online
  | 'HY' // Hybrid
  | 'FF' // Fragrance Free

export type LanguageFilter = 'all' | 'EN' | 'ES' | 'FR'

export type SpecialFilter =
  | 'ABSI' // Adult Children of Alcoholics
  | 'AL-AN' // Al-Anon Focus
  | 'DB' // Digital Basket
  | 'GR' // Grapevine
  | 'DR' // Daily Reflections
  | '11' // 11th Step Focus
  | 'P' // Professionals
  | 'A' // Atheist/Agnostic
  | 'N' // Native American

export type DistanceRadius = 5 | 10 | 25 | 50 | null

export type TimeOfDayFilter = 'all' | 'morning' | 'afternoon' | 'evening' | 'night'

export interface MeetingFilters {
  type: MeetingTypeFilter
  county: CountyFilter
  day: DayFilter
  timeOfDay: TimeOfDayFilter
  format: FormatFilter
  groups: GroupFilter[]
  accessibility: AccessibilityFilter[]
  language: LanguageFilter
  special: SpecialFilter[]
  distanceRadius: DistanceRadius
  searchQuery: string
  showFavoritesOnly: boolean
}

export interface UserLocation {
  lat: number
  lng: number
}

export type LocationPermissionStatus = 'prompt' | 'granted' | 'denied'

// ============================================================
// MEETING TYPE CODES DICTIONARY
// ============================================================

export const MEETING_TYPE_CODES: Record<string, string> = {
  // FORMAT TYPES
  D: 'Discussion',
  B: 'Big Book Study',
  '12x12': '12 Steps & 12 Traditions',
  LIT: 'Literature',
  ST: 'Step Study',
  SP: 'Speaker',
  MED: 'Meditation',
  CAN: 'Candlelight',
  T: 'Tradition Study',
  TR: 'Tradition Study',
  POA: 'Format Varies',

  // MEETING ACCESS
  O: 'Open (Non-alcoholics welcome)',
  C: 'Closed (Alcoholics only)',

  // DEMOGRAPHIC FOCUS
  W: 'Women Only',
  M: 'Men Only',
  Y: 'Young People',
  SEN: 'Seniors',
  LGBTQ: 'LGBTQ+',
  POC: 'People of Color',
  G: 'Gay/Lesbian (LGBTQ+)',
  L: 'Lesbian (LGBTQ+)',
  NB: 'Non-Binary',

  // SPECIAL POPULATIONS
  BE: 'Beginners',
  DD: 'Dual Diagnosis',
  ABSI: 'Adult Children of Alcoholics',
  'AL-AN': 'Al-Anon Focus',
  DB: 'Digital Basket (Venmo/PayPal)',
  GR: 'Grapevine',
  DR: 'Daily Reflections',
  '11': '11th Step Focus',
  P: 'Professionals',
  A: 'Atheist/Agnostic',
  N: 'Native American',

  // ACCESSIBILITY FEATURES
  X: 'Wheelchair Accessible',
  XB: 'Wheelchair Accessible + Bathroom',
  BA: 'Babysitting Available',
  CF: 'Child-Friendly',
  ASL: 'ASL Interpreted',
  ONL: 'Online',
  HY: 'Hybrid (In-person & Online)',
  TC: 'Temporarily Closed',
  FF: 'Fragrance Free',
  XT: 'Cross-Talk Permitted',

  // LANGUAGE
  EN: 'English',
  ES: 'Spanish',
  S: 'Spanish',
  FR: 'French',

  // DEFAULT
  DEFAULT: 'Meeting Type',
}

// Code aliasing - maps duplicate/variant codes to primary codes
export const CODE_ALIASES: Record<string, string> = {
  S: 'ES',
  G: 'LGBTQ',
  L: 'LGBTQ',
  XB: 'X',
  '12 STEP': '12x12',
  'TWELVE STEP': '12x12',
}

// ============================================================
// DAYS OF WEEK
// ============================================================

export const DAYS_OF_WEEK = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
] as const

// ============================================================
// COUNTY LABELS
// ============================================================

export const COUNTY_LABELS: Record<CountyFilter, string> = {
  all: 'All Regions',
  sf: 'San Francisco / Marin',
  eastbay: 'East Bay',
  santaclara: 'Santa Clara',
  santacruz: 'Santa Cruz',
  sanmateo: 'San Mateo',
  other: 'Other',
}

// ============================================================
// FILTER OPTIONS
// ============================================================

export const FORMAT_OPTIONS: { value: FormatFilter; label: string }[] = [
  { value: 'all', label: 'All Formats' },
  { value: 'D', label: 'Discussion' },
  { value: 'B', label: 'Big Book Study' },
  { value: '12x12', label: '12 Steps & 12 Traditions' },
  { value: 'LIT', label: 'Literature' },
  { value: 'ST', label: 'Step Study' },
  { value: 'SP', label: 'Speaker' },
  { value: 'MED', label: 'Meditation' },
  { value: 'CAN', label: 'Candlelight' },
  { value: 'POA', label: 'Format Varies' },
]

export const GROUP_OPTIONS: { value: GroupFilter; label: string }[] = [
  { value: 'W', label: 'Women Only' },
  { value: 'M', label: 'Men Only' },
  { value: 'Y', label: 'Young People' },
  { value: 'SEN', label: 'Seniors' },
  { value: 'LGBTQ', label: 'LGBTQ+' },
  { value: 'POC', label: 'People of Color' },
  { value: 'NB', label: 'Non-Binary' },
  { value: 'BE', label: 'Beginners' },
  { value: 'DD', label: 'Dual Diagnosis' },
]

export const ACCESSIBILITY_OPTIONS: { value: AccessibilityFilter; label: string }[] = [
  { value: 'O', label: 'Open Meeting' },
  { value: 'C', label: 'Closed Meeting' },
  { value: 'X', label: 'Wheelchair Accessible' },
  { value: 'BA', label: 'Babysitting Available' },
  { value: 'CF', label: 'Child-Friendly' },
  { value: 'ASL', label: 'ASL Interpreted' },
  { value: 'ONL', label: 'Online Only' },
  { value: 'HY', label: 'Hybrid' },
  { value: 'FF', label: 'Fragrance Free' },
]

export const LANGUAGE_OPTIONS: { value: LanguageFilter; label: string }[] = [
  { value: 'all', label: 'All Languages' },
  { value: 'EN', label: 'English' },
  { value: 'ES', label: 'Spanish' },
  { value: 'FR', label: 'French' },
]

export const SPECIAL_OPTIONS: { value: SpecialFilter; label: string }[] = [
  { value: 'ABSI', label: 'Adult Children of Alcoholics' },
  { value: 'AL-AN', label: 'Al-Anon Focus' },
  { value: 'DB', label: 'Digital Basket' },
  { value: 'GR', label: 'Grapevine' },
  { value: 'DR', label: 'Daily Reflections' },
  { value: '11', label: '11th Step Focus' },
  { value: 'P', label: 'Professionals' },
  { value: 'A', label: 'Atheist/Agnostic' },
  { value: 'N', label: 'Native American' },
]

export const TIME_OF_DAY_FILTER_OPTIONS: { value: TimeOfDayFilter; label: string; description: string }[] = [
  { value: 'all', label: 'Any Time', description: 'All meeting times' },
  { value: 'morning', label: 'Morning', description: '5am - 12pm' },
  { value: 'afternoon', label: 'Afternoon', description: '12pm - 6pm' },
  { value: 'evening', label: 'Evening', description: '6pm - 10pm' },
  { value: 'night', label: 'Night', description: '10pm - 5am' },
]

export const DISTANCE_OPTIONS: { value: DistanceRadius; label: string }[] = [
  { value: null, label: 'Any Distance' },
  { value: 5, label: 'Within 5 miles' },
  { value: 10, label: 'Within 10 miles' },
  { value: 25, label: 'Within 25 miles' },
  { value: 50, label: 'Within 50 miles' },
]

export const DAY_FILTER_OPTIONS: { value: DayFilter; label: string }[] = [
  { value: 'all', label: 'Any Day' },
  { value: '0', label: 'Sunday' },
  { value: '1', label: 'Monday' },
  { value: '2', label: 'Tuesday' },
  { value: '3', label: 'Wednesday' },
  { value: '4', label: 'Thursday' },
  { value: '5', label: 'Friday' },
  { value: '6', label: 'Saturday' },
]

export const MEETING_TYPE_OPTIONS: { value: MeetingTypeFilter; label: string }[] = [
  { value: 'all', label: 'All Types' },
  { value: 'aa', label: 'AA Meetings' },
  { value: 'na', label: 'NA Meetings' },
]

// ============================================================
// COMPONENT PROP TYPES
// ============================================================

export interface MeetingsTabProps {
  className?: string
}

export interface MeetingBrowserProps {
  className?: string
  onBack?: () => void
}

export interface MeetingCardProps {
  meeting: Meeting
  isFavorite?: boolean
  showDistance?: boolean
  onSave?: () => void
  onUnsave?: () => void
  onToggleFavorite?: () => void
  isMobile?: boolean
}

export interface FilterPanelProps {
  filters: MeetingFilters
  onFiltersChange: (filters: Partial<MeetingFilters>) => void
  onApply: () => void
  onClear: () => void
  onCancel: () => void
  isOpen: boolean
  meetingCount: number
  totalCount: number
}

export interface FilterChipsProps {
  filters: MeetingFilters
  onRemoveFilter: (key: keyof MeetingFilters, value?: string) => void
  onClearAll: () => void
}

// ============================================================
// HOOK RETURN TYPES
// ============================================================

export interface UseMeetingFiltersReturn {
  // Applied filters (use these for filtering meetings)
  filters: MeetingFilters
  // Temporary filters (use these in FilterPanel for batch editing)
  tempFilters: MeetingFilters
  // Set a single temp filter
  setTempFilter: <K extends keyof MeetingFilters>(key: K, value: MeetingFilters[K]) => void
  // Apply temp filters to applied
  applyFilters: () => void
  // Clear all filters to defaults
  clearFilters: () => void
  // Reset temp filters back to applied (cancel changes)
  resetTempFilters: () => void
  // Remove a single filter (for FilterChips)
  removeFilter: (key: keyof MeetingFilters, value?: string) => void
  // Active filter count for badge
  activeFilterCount: number
  // Direct filter update (for quick filters outside panel)
  setFilter: <K extends keyof MeetingFilters>(key: K, value: MeetingFilters[K]) => void
  // Toggle array filter (for checkboxes)
  toggleArrayFilter: <K extends 'groups' | 'accessibility' | 'special'>(
    key: K,
    value: MeetingFilters[K][number]
  ) => void
  // Set search query directly
  setSearchQuery: (query: string) => void
}

export interface UseMeetingsReturn {
  meetings: Meeting[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export interface UseExternalMeetingsReturn {
  meetings: Meeting[]
  loading: boolean
  error: string | null
}

export interface UseSavedMeetingsReturn {
  savedMeetings: SavedMeeting[]
  favorites: Set<string>
  loading: boolean
  saveMeeting: (meeting: Meeting, weeksToAdd?: number) => Promise<boolean>
  unsaveMeeting: (meetingId: string) => Promise<boolean>
  toggleFavorite: (meeting: Meeting) => Promise<void>
  isFavorite: (meetingId: string) => boolean
}

export interface UseGeolocationReturn {
  location: UserLocation | null
  permissionStatus: LocationPermissionStatus
  loading: boolean
  error: string | null
  requestLocation: () => Promise<void>
  clearLocation: () => void
}

// ============================================================
// UTILITY FUNCTION TYPES
// ============================================================

export interface TimeOfDay {
  label: string
  startHour: number
  endHour: number
}

export const TIME_OF_DAY_OPTIONS: TimeOfDay[] = [
  { label: 'Morning (5am-12pm)', startHour: 5, endHour: 12 },
  { label: 'Afternoon (12pm-6pm)', startHour: 12, endHour: 18 },
  { label: 'Evening (6pm-10pm)', startHour: 18, endHour: 22 },
  { label: 'Night (10pm-5am)', startHour: 22, endHour: 5 },
]
