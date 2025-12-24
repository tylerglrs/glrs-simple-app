import { useState, useCallback, useMemo, useRef, useEffect } from 'react'
import { Search, X, Clock, TrendingUp, MapPin, Users, Hash } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { Meeting } from '../types'
import { MEETING_TYPE_CODES } from '../types'

// ============================================================
// CONSTANTS
// ============================================================

const RECENT_SEARCHES_KEY = 'glrs_meetingRecentSearches'
const MAX_RECENT_SEARCHES = 5
const MAX_SUGGESTIONS = 10
const MIN_QUERY_LENGTH = 2

// ============================================================
// TYPES
// ============================================================

type SuggestionType = 'meeting' | 'location' | 'city' | 'type'

interface Suggestion {
  type: SuggestionType
  label: string
  value: string
  count?: number // Number of meetings matching this suggestion
}

interface SearchWithSuggestionsProps {
  value: string
  onChange: (value: string) => void
  meetings: Meeting[]
  className?: string
  placeholder?: string
}

// ============================================================
// HELPER FUNCTIONS
// ============================================================

/**
 * Get recent searches from localStorage
 */
function getRecentSearches(): string[] {
  try {
    const stored = localStorage.getItem(RECENT_SEARCHES_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

/**
 * Save a search to recent searches
 */
function saveRecentSearch(query: string) {
  if (!query || query.length < MIN_QUERY_LENGTH) return

  try {
    const recent = getRecentSearches().filter(s => s.toLowerCase() !== query.toLowerCase())
    recent.unshift(query)
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(recent.slice(0, MAX_RECENT_SEARCHES)))
  } catch {
    // Ignore localStorage errors
  }
}

/**
 * Clear all recent searches
 */
function clearRecentSearches() {
  try {
    localStorage.removeItem(RECENT_SEARCHES_KEY)
  } catch {
    // Ignore
  }
}

/**
 * Get icon component for suggestion type
 */
function getSuggestionIcon(type: SuggestionType) {
  switch (type) {
    case 'meeting':
      return Users
    case 'location':
      return MapPin
    case 'city':
      return MapPin
    case 'type':
      return Hash
    default:
      return Search
  }
}

/**
 * Get badge color for suggestion type
 */
function getSuggestionBadgeStyle(type: SuggestionType): string {
  switch (type) {
    case 'meeting':
      return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
    case 'location':
      return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
    case 'city':
      return 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400'
    case 'type':
      return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
    default:
      return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400'
  }
}

// ============================================================
// SEARCH WITH SUGGESTIONS COMPONENT
// ============================================================

export function SearchWithSuggestions({
  value,
  onChange,
  meetings,
  className,
  placeholder = 'Search meetings, locations, or types...',
}: SearchWithSuggestionsProps) {
  // State
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const [highlightedIndex, setHighlightedIndex] = useState(-1)

  // Refs
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Load recent searches on mount
  useEffect(() => {
    setRecentSearches(getRecentSearches())
  }, [])

  // ============================================================
  // GENERATE SUGGESTIONS
  // ============================================================

  const suggestions = useMemo((): Suggestion[] => {
    if (!value || value.length < MIN_QUERY_LENGTH) return []

    const query = value.toLowerCase().trim()
    const seen = new Set<string>()
    const results: Suggestion[] = []

    // Helper to add suggestion without duplicates
    const addSuggestion = (suggestion: Suggestion) => {
      const key = `${suggestion.type}:${suggestion.value.toLowerCase()}`
      if (!seen.has(key) && results.length < MAX_SUGGESTIONS) {
        seen.add(key)
        results.push(suggestion)
      }
    }

    // 1. Meeting names that match
    const meetingNameCounts = new Map<string, number>()
    for (const meeting of meetings) {
      if (meeting.name?.toLowerCase().includes(query)) {
        const name = meeting.name
        meetingNameCounts.set(name, (meetingNameCounts.get(name) || 0) + 1)
      }
    }
    // Add top meeting names by frequency
    const sortedMeetingNames = [...meetingNameCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
    for (const [name, count] of sortedMeetingNames) {
      addSuggestion({ type: 'meeting', label: name, value: name, count })
    }

    // 2. Location names that match
    const locationCounts = new Map<string, number>()
    for (const meeting of meetings) {
      const locName = meeting.locationName || meeting.location?.name
      if (locName?.toLowerCase().includes(query)) {
        locationCounts.set(locName, (locationCounts.get(locName) || 0) + 1)
      }
    }
    const sortedLocations = [...locationCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
    for (const [name, count] of sortedLocations) {
      addSuggestion({ type: 'location', label: name, value: name, count })
    }

    // 3. Cities that match
    const cityCounts = new Map<string, number>()
    for (const meeting of meetings) {
      const city = meeting.city || meeting.location?.city
      if (city?.toLowerCase().includes(query)) {
        cityCounts.set(city, (cityCounts.get(city) || 0) + 1)
      }
    }
    const sortedCities = [...cityCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
    for (const [city, count] of sortedCities) {
      addSuggestion({ type: 'city', label: city, value: city, count })
    }

    // 4. Meeting type codes/labels that match
    for (const [code, label] of Object.entries(MEETING_TYPE_CODES)) {
      if (
        code.toLowerCase().includes(query) ||
        label.toLowerCase().includes(query)
      ) {
        // Count meetings with this type code (safely handle non-string types)
        const count = meetings.filter(m => {
          const types = m.types as unknown
          if (!types || typeof types !== 'string') return false
          return types.split(',').map(t => t.trim().toUpperCase()).includes(code.toUpperCase())
        }).length

        if (count > 0) {
          const displayLabel = `${label} (${code})`
          addSuggestion({ type: 'type', label: displayLabel, value: label, count })
        }
      }
    }

    return results
  }, [value, meetings])

  // ============================================================
  // EVENT HANDLERS
  // ============================================================

  // Handle selection
  const handleSelect = useCallback((selectedValue: string) => {
    onChange(selectedValue)
    saveRecentSearch(selectedValue)
    setRecentSearches(getRecentSearches())
    setShowSuggestions(false)
    setHighlightedIndex(-1)
    inputRef.current?.blur()
  }, [onChange])

  // Handle clear
  const handleClear = useCallback(() => {
    onChange('')
    inputRef.current?.focus()
    setHighlightedIndex(-1)
  }, [onChange])

  // Handle clear recent searches
  const handleClearRecentSearches = useCallback(() => {
    clearRecentSearches()
    setRecentSearches([])
  }, [])

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    // Determine which list we're navigating
    const isShowingSuggestions = value && suggestions.length > 0
    const isShowingRecent = !value && recentSearches.length > 0
    const maxIndex = isShowingSuggestions
      ? suggestions.length - 1
      : isShowingRecent
        ? recentSearches.length - 1
        : -1

    if (maxIndex < 0) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setHighlightedIndex(prev => (prev < maxIndex ? prev + 1 : 0))
        break
      case 'ArrowUp':
        e.preventDefault()
        setHighlightedIndex(prev => (prev > 0 ? prev - 1 : maxIndex))
        break
      case 'Enter':
        e.preventDefault()
        if (highlightedIndex >= 0 && highlightedIndex <= maxIndex) {
          if (isShowingSuggestions) {
            handleSelect(suggestions[highlightedIndex].value)
          } else if (isShowingRecent) {
            handleSelect(recentSearches[highlightedIndex])
          }
        } else if (value) {
          // Save current input as search
          saveRecentSearch(value)
          setRecentSearches(getRecentSearches())
          setShowSuggestions(false)
        }
        break
      case 'Escape':
        setShowSuggestions(false)
        setHighlightedIndex(-1)
        inputRef.current?.blur()
        break
    }
  }, [value, suggestions, recentSearches, highlightedIndex, handleSelect])

  // ============================================================
  // EFFECTS
  // ============================================================

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false)
        setHighlightedIndex(-1)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Reset highlighted index when suggestions change
  useEffect(() => {
    setHighlightedIndex(-1)
  }, [suggestions])

  // ============================================================
  // RENDER CONDITIONS
  // ============================================================

  const showDropdown = showSuggestions && (
    suggestions.length > 0 ||
    (recentSearches.length > 0 && !value)
  )

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(e) => {
            onChange(e.target.value)
            setShowSuggestions(true)
          }}
          onFocus={() => setShowSuggestions(true)}
          onKeyDown={handleKeyDown}
          className="pl-9 pr-9"
          aria-label="Search meetings"
          aria-autocomplete="list"
          aria-expanded={showDropdown}
          aria-controls="search-suggestions"
        />
        {value && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
            onClick={handleClear}
            tabIndex={-1}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Suggestions Dropdown */}
      {showDropdown && (
        <div
          id="search-suggestions"
          className="absolute z-50 top-full left-0 right-0 mt-1 bg-popover border rounded-md shadow-lg overflow-hidden max-h-[350px] overflow-y-auto"
          role="listbox"
        >
          {/* Recent Searches (when input is empty) */}
          {!value && recentSearches.length > 0 && (
            <div className="p-2">
              <div className="flex items-center justify-between px-2 py-1">
                <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <Clock className="h-3 w-3" />
                  Recent Searches
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearRecentSearches}
                  className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
                >
                  Clear
                </Button>
              </div>
              {recentSearches.map((search, index) => (
                <button
                  key={`recent-${index}`}
                  type="button"
                  role="option"
                  aria-selected={highlightedIndex === index}
                  className={cn(
                    'w-full px-3 py-2 text-left text-sm rounded transition-colors flex items-center gap-2',
                    highlightedIndex === index ? 'bg-accent' : 'hover:bg-accent'
                  )}
                  onClick={() => handleSelect(search)}
                >
                  <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                  {search}
                </button>
              ))}
            </div>
          )}

          {/* Suggestions based on input */}
          {value && suggestions.length > 0 && (
            <div className="p-2">
              <p className="text-xs text-muted-foreground px-2 py-1 flex items-center gap-1.5">
                <TrendingUp className="h-3 w-3" />
                Suggestions
              </p>
              {suggestions.map((suggestion, index) => {
                const Icon = getSuggestionIcon(suggestion.type)
                return (
                  <button
                    key={`suggestion-${index}`}
                    type="button"
                    role="option"
                    aria-selected={highlightedIndex === index}
                    className={cn(
                      'w-full px-3 py-2 text-left text-sm rounded transition-colors flex items-center gap-2',
                      highlightedIndex === index ? 'bg-accent' : 'hover:bg-accent'
                    )}
                    onClick={() => handleSelect(suggestion.value)}
                  >
                    <Icon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    <span className="flex-1 truncate">{suggestion.label}</span>
                    <Badge
                      variant="outline"
                      className={cn('text-[10px] px-1.5 py-0 h-5 shrink-0', getSuggestionBadgeStyle(suggestion.type))}
                    >
                      {suggestion.type === 'meeting' ? 'Name' :
                       suggestion.type === 'location' ? 'Location' :
                       suggestion.type === 'city' ? 'City' : 'Type'}
                    </Badge>
                    {suggestion.count !== undefined && (
                      <span className="text-xs text-muted-foreground shrink-0">
                        ({suggestion.count})
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          )}

          {/* No Results */}
          {value && value.length >= MIN_QUERY_LENGTH && suggestions.length === 0 && (
            <div className="p-4 text-center text-sm text-muted-foreground">
              <p>No suggestions for "{value}"</p>
              <p className="text-xs mt-1">Press Enter to search anyway</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default SearchWithSuggestions
