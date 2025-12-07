import { useState, useCallback, useMemo, useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import type {
  MeetingFilters,
  MeetingTypeFilter,
  CountyFilter,
  DayFilter,
  TimeOfDayFilter,
  FormatFilter,
  GroupFilter,
  AccessibilityFilter,
  LanguageFilter,
  SpecialFilter,
  DistanceRadius,
  UseMeetingFiltersReturn,
} from '../types'

// ============================================================
// CONSTANTS
// ============================================================

const DEBOUNCE_DELAY = 300 // ms - matches original implementation

const DEFAULT_FILTERS: MeetingFilters = {
  type: 'all',
  county: 'all',
  day: 'all',
  timeOfDay: 'all',
  format: 'all',
  groups: [],
  accessibility: [],
  language: 'all',
  special: [],
  distanceRadius: null,
  searchQuery: '',
  showFavoritesOnly: false,
}

// URL parameter keys - kept short for cleaner URLs
const URL_PARAMS = {
  type: 't',
  county: 'c',
  day: 'd',
  timeOfDay: 'tod',
  format: 'f',
  groups: 'g',
  accessibility: 'a',
  language: 'l',
  special: 's',
  distanceRadius: 'r',
  searchQuery: 'q',
  showFavoritesOnly: 'fav',
} as const

// ============================================================
// URL SERIALIZATION HELPERS
// ============================================================

function serializeArrayToUrl(arr: string[]): string {
  return arr.length > 0 ? arr.join(',') : ''
}

function deserializeArrayFromUrl(value: string | null): string[] {
  if (!value || value.trim() === '') return []
  return value.split(',').filter(Boolean)
}

function parseDistanceRadius(value: string | null): DistanceRadius {
  if (!value) return null
  const num = parseInt(value, 10)
  if ([5, 10, 25, 50].includes(num)) {
    return num as DistanceRadius
  }
  return null
}

// ============================================================
// FILTERS FROM URL
// ============================================================

function parseFiltersFromUrl(searchParams: URLSearchParams): MeetingFilters {
  return {
    type: (searchParams.get(URL_PARAMS.type) as MeetingTypeFilter) || 'all',
    county: (searchParams.get(URL_PARAMS.county) as CountyFilter) || 'all',
    day: (searchParams.get(URL_PARAMS.day) as DayFilter) || 'all',
    timeOfDay: (searchParams.get(URL_PARAMS.timeOfDay) as TimeOfDayFilter) || 'all',
    format: (searchParams.get(URL_PARAMS.format) as FormatFilter) || 'all',
    groups: deserializeArrayFromUrl(searchParams.get(URL_PARAMS.groups)) as GroupFilter[],
    accessibility: deserializeArrayFromUrl(searchParams.get(URL_PARAMS.accessibility)) as AccessibilityFilter[],
    language: (searchParams.get(URL_PARAMS.language) as LanguageFilter) || 'all',
    special: deserializeArrayFromUrl(searchParams.get(URL_PARAMS.special)) as SpecialFilter[],
    distanceRadius: parseDistanceRadius(searchParams.get(URL_PARAMS.distanceRadius)),
    searchQuery: searchParams.get(URL_PARAMS.searchQuery) || '',
    showFavoritesOnly: searchParams.get(URL_PARAMS.showFavoritesOnly) === '1',
  }
}

// ============================================================
// FILTERS TO URL
// ============================================================

function serializeFiltersToUrl(filters: MeetingFilters): Record<string, string> {
  const params: Record<string, string> = {}

  // Only add non-default values to keep URL clean
  if (filters.type !== 'all') {
    params[URL_PARAMS.type] = filters.type
  }
  if (filters.county !== 'all') {
    params[URL_PARAMS.county] = filters.county
  }
  if (filters.day !== 'all') {
    params[URL_PARAMS.day] = filters.day
  }
  if (filters.timeOfDay !== 'all') {
    params[URL_PARAMS.timeOfDay] = filters.timeOfDay
  }
  if (filters.format !== 'all') {
    params[URL_PARAMS.format] = filters.format
  }
  if (filters.groups.length > 0) {
    params[URL_PARAMS.groups] = serializeArrayToUrl(filters.groups)
  }
  if (filters.accessibility.length > 0) {
    params[URL_PARAMS.accessibility] = serializeArrayToUrl(filters.accessibility)
  }
  if (filters.language !== 'all') {
    params[URL_PARAMS.language] = filters.language
  }
  if (filters.special.length > 0) {
    params[URL_PARAMS.special] = serializeArrayToUrl(filters.special)
  }
  if (filters.distanceRadius !== null) {
    params[URL_PARAMS.distanceRadius] = String(filters.distanceRadius)
  }
  if (filters.searchQuery.trim()) {
    params[URL_PARAMS.searchQuery] = filters.searchQuery.trim()
  }
  if (filters.showFavoritesOnly) {
    params[URL_PARAMS.showFavoritesOnly] = '1'
  }

  return params
}

// ============================================================
// MAIN HOOK
// ============================================================

export function useMeetingFilters(): UseMeetingFiltersReturn {
  const [searchParams, setSearchParams] = useSearchParams()

  // Parse initial filters from URL
  const initialFilters = useMemo(() => parseFiltersFromUrl(searchParams), [])

  // Applied filters (synced with URL)
  const [filters, setFilters] = useState<MeetingFilters>(initialFilters)

  // Temporary filters for batch editing (used in FilterPanel)
  const [tempFilters, setTempFilters] = useState<MeetingFilters>(initialFilters)

  // Track if this is the initial mount to prevent double URL updates
  const isInitialMount = useRef(true)

  // Debounce timer for search query
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // ============================================================
  // SYNC FILTERS TO URL (debounced)
  // ============================================================

  useEffect(() => {
    // Skip initial mount to prevent URL flash
    if (isInitialMount.current) {
      isInitialMount.current = false
      return
    }

    // Clear any pending debounce
    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current)
    }

    // Debounce URL updates (especially for search)
    searchDebounceRef.current = setTimeout(() => {
      const urlParams = serializeFiltersToUrl(filters)
      setSearchParams(urlParams, { replace: true })
    }, DEBOUNCE_DELAY)

    return () => {
      if (searchDebounceRef.current) {
        clearTimeout(searchDebounceRef.current)
      }
    }
  }, [filters, setSearchParams])

  // ============================================================
  // ACTIVE FILTER COUNT (for badge display)
  // ============================================================

  const activeFilterCount = useMemo(() => {
    let count = 0

    if (filters.type !== 'all') count++
    if (filters.county !== 'all') count++
    if (filters.day !== 'all') count++
    if (filters.timeOfDay !== 'all') count++
    if (filters.format !== 'all') count++
    if (filters.groups.length > 0) count += filters.groups.length
    if (filters.accessibility.length > 0) count += filters.accessibility.length
    if (filters.language !== 'all') count++
    if (filters.special.length > 0) count += filters.special.length
    if (filters.distanceRadius !== null) count++
    if (filters.searchQuery.trim()) count++
    if (filters.showFavoritesOnly) count++

    return count
  }, [filters])

  // ============================================================
  // SET TEMPORARY FILTER (for FilterPanel batch editing)
  // ============================================================

  const setTempFilter = useCallback(
    <K extends keyof MeetingFilters>(key: K, value: MeetingFilters[K]) => {
      setTempFilters((prev) => ({
        ...prev,
        [key]: value,
      }))
    },
    []
  )

  // ============================================================
  // APPLY FILTERS (commit temp filters to applied)
  // ============================================================

  const applyFilters = useCallback(() => {
    setFilters(tempFilters)
  }, [tempFilters])

  // ============================================================
  // CLEAR FILTERS (reset to defaults)
  // ============================================================

  const clearFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS)
    setTempFilters(DEFAULT_FILTERS)
  }, [])

  // ============================================================
  // RESET TEMP FILTERS (discard changes, restore from applied)
  // ============================================================

  const resetTempFilters = useCallback(() => {
    setTempFilters(filters)
  }, [filters])

  // ============================================================
  // REMOVE SINGLE FILTER (for FilterChips)
  // ============================================================

  const removeFilter = useCallback((key: keyof MeetingFilters, value?: string) => {
    setFilters((prev) => {
      const newFilters = { ...prev }

      // Handle array filters (groups, accessibility, special)
      if (value !== undefined) {
        if (key === 'groups') {
          newFilters.groups = prev.groups.filter((v) => v !== value)
        } else if (key === 'accessibility') {
          newFilters.accessibility = prev.accessibility.filter((v) => v !== value)
        } else if (key === 'special') {
          newFilters.special = prev.special.filter((v) => v !== value)
        }
      } else {
        // Handle scalar filters
        switch (key) {
          case 'type':
            newFilters.type = 'all'
            break
          case 'county':
            newFilters.county = 'all'
            break
          case 'day':
            newFilters.day = 'all'
            break
          case 'timeOfDay':
            newFilters.timeOfDay = 'all'
            break
          case 'format':
            newFilters.format = 'all'
            break
          case 'language':
            newFilters.language = 'all'
            break
          case 'distanceRadius':
            newFilters.distanceRadius = null
            break
          case 'searchQuery':
            newFilters.searchQuery = ''
            break
          case 'showFavoritesOnly':
            newFilters.showFavoritesOnly = false
            break
          case 'groups':
            newFilters.groups = []
            break
          case 'accessibility':
            newFilters.accessibility = []
            break
          case 'special':
            newFilters.special = []
            break
        }
      }

      return newFilters
    })

    // Also update temp filters to stay in sync
    setTempFilters((prev) => {
      const newFilters = { ...prev }

      if (value !== undefined) {
        if (key === 'groups') {
          newFilters.groups = prev.groups.filter((v) => v !== value)
        } else if (key === 'accessibility') {
          newFilters.accessibility = prev.accessibility.filter((v) => v !== value)
        } else if (key === 'special') {
          newFilters.special = prev.special.filter((v) => v !== value)
        }
      } else {
        switch (key) {
          case 'type':
            newFilters.type = 'all'
            break
          case 'county':
            newFilters.county = 'all'
            break
          case 'day':
            newFilters.day = 'all'
            break
          case 'timeOfDay':
            newFilters.timeOfDay = 'all'
            break
          case 'format':
            newFilters.format = 'all'
            break
          case 'language':
            newFilters.language = 'all'
            break
          case 'distanceRadius':
            newFilters.distanceRadius = null
            break
          case 'searchQuery':
            newFilters.searchQuery = ''
            break
          case 'showFavoritesOnly':
            newFilters.showFavoritesOnly = false
            break
          case 'groups':
            newFilters.groups = []
            break
          case 'accessibility':
            newFilters.accessibility = []
            break
          case 'special':
            newFilters.special = []
            break
        }
      }

      return newFilters
    })
  }, [])

  // ============================================================
  // DIRECT FILTER UPDATES (for quick filters outside panel)
  // ============================================================

  const setFilter = useCallback(
    <K extends keyof MeetingFilters>(key: K, value: MeetingFilters[K]) => {
      setFilters((prev) => ({
        ...prev,
        [key]: value,
      }))
      setTempFilters((prev) => ({
        ...prev,
        [key]: value,
      }))
    },
    []
  )

  // ============================================================
  // TOGGLE ARRAY FILTER (for checkboxes in quick filters)
  // ============================================================

  const toggleArrayFilter = useCallback(
    <K extends 'groups' | 'accessibility' | 'special'>(
      key: K,
      value: MeetingFilters[K][number]
    ) => {
      setFilters((prev) => {
        const currentArray = prev[key] as string[]
        const newArray = currentArray.includes(value)
          ? currentArray.filter((v) => v !== value)
          : [...currentArray, value]
        return { ...prev, [key]: newArray }
      })
      setTempFilters((prev) => {
        const currentArray = prev[key] as string[]
        const newArray = currentArray.includes(value)
          ? currentArray.filter((v) => v !== value)
          : [...currentArray, value]
        return { ...prev, [key]: newArray }
      })
    },
    []
  )

  // ============================================================
  // SEARCH QUERY WITH IMMEDIATE UPDATE (for search input)
  // ============================================================

  const setSearchQuery = useCallback((query: string) => {
    setFilters((prev) => ({ ...prev, searchQuery: query }))
    setTempFilters((prev) => ({ ...prev, searchQuery: query }))
  }, [])

  // ============================================================
  // RETURN
  // ============================================================

  return {
    // Applied filters (use these for filtering meetings)
    filters,

    // Temporary filters (use these in FilterPanel)
    tempFilters,

    // Set a single temp filter
    setTempFilter,

    // Apply temp filters to applied
    applyFilters,

    // Clear all filters to defaults
    clearFilters,

    // Reset temp filters back to applied (cancel changes)
    resetTempFilters,

    // Remove a single filter (for FilterChips)
    removeFilter,

    // Active filter count for badge
    activeFilterCount,

    // Additional convenience methods
    setFilter,
    toggleArrayFilter,
    setSearchQuery,
  }
}

export default useMeetingFilters
