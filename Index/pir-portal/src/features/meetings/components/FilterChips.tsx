import { X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import type { FilterChipsProps, MeetingFilters } from '../types'
import {
  DAY_FILTER_OPTIONS,
  TIME_OF_DAY_FILTER_OPTIONS,
  MEETING_TYPE_OPTIONS,
  FORMAT_OPTIONS,
  COUNTY_LABELS,
  GROUP_OPTIONS,
  ACCESSIBILITY_OPTIONS,
  LANGUAGE_OPTIONS,
  SPECIAL_OPTIONS,
} from '../types'

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function getDayLabel(value: string): string {
  const option = DAY_FILTER_OPTIONS.find((o) => o.value === value)
  return option?.label || value
}

function getTimeOfDayLabel(value: string): string {
  const option = TIME_OF_DAY_FILTER_OPTIONS.find((o) => o.value === value)
  return option?.label || value
}

function getMeetingTypeLabel(value: string): string {
  const option = MEETING_TYPE_OPTIONS.find((o) => o.value === value)
  return option?.label || value
}

function getFormatLabel(value: string): string {
  const option = FORMAT_OPTIONS.find((o) => o.value === value)
  return option?.label || value
}

function getCountyLabel(value: string): string {
  return COUNTY_LABELS[value as keyof typeof COUNTY_LABELS] || value
}

function getGroupLabel(value: string): string {
  const option = GROUP_OPTIONS.find((o) => o.value === value)
  return option?.label || value
}

function getAccessibilityLabel(value: string): string {
  const option = ACCESSIBILITY_OPTIONS.find((o) => o.value === value)
  return option?.label || value
}

function getLanguageLabel(value: string): string {
  const option = LANGUAGE_OPTIONS.find((o) => o.value === value)
  return option?.label || value
}

function getSpecialLabel(value: string): string {
  const option = SPECIAL_OPTIONS.find((o) => o.value === value)
  return option?.label || value
}

// ============================================================
// FILTER CHIP COMPONENT
// ============================================================

interface FilterChipProps {
  label: string
  onRemove: () => void
  variant?: 'default' | 'secondary' | 'outline'
}

function FilterChip({ label, onRemove, variant = 'secondary' }: FilterChipProps) {
  return (
    <Badge
      variant={variant}
      className="flex items-center gap-1 pr-1 whitespace-nowrap"
    >
      <span className="max-w-[150px] truncate">{label}</span>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          onRemove()
        }}
        className="ml-1 rounded-full p-0.5 hover:bg-muted-foreground/20 transition-colors"
        aria-label={`Remove ${label} filter`}
      >
        <X className="h-3 w-3" />
      </button>
    </Badge>
  )
}

// ============================================================
// MAIN FILTER CHIPS COMPONENT
// ============================================================

export function FilterChips({ filters, onRemoveFilter, onClearAll }: FilterChipsProps) {
  // Build list of active filter chips
  const chips: { key: keyof MeetingFilters; value?: string; label: string }[] = []

  // Search query
  if (filters.searchQuery.trim()) {
    chips.push({
      key: 'searchQuery',
      label: `"${filters.searchQuery.trim()}"`,
    })
  }

  // Day
  if (filters.day !== 'all') {
    chips.push({
      key: 'day',
      label: getDayLabel(filters.day),
    })
  }

  // Time of Day
  if (filters.timeOfDay !== 'all') {
    chips.push({
      key: 'timeOfDay',
      label: getTimeOfDayLabel(filters.timeOfDay),
    })
  }

  // Meeting Type
  if (filters.type !== 'all') {
    chips.push({
      key: 'type',
      label: getMeetingTypeLabel(filters.type),
    })
  }

  // Format
  if (filters.format !== 'all') {
    chips.push({
      key: 'format',
      label: getFormatLabel(filters.format),
    })
  }

  // County/Region
  if (filters.county !== 'all') {
    chips.push({
      key: 'county',
      label: getCountyLabel(filters.county),
    })
  }

  // Distance
  if (filters.distanceRadius !== null) {
    chips.push({
      key: 'distanceRadius',
      label: `Within ${filters.distanceRadius} mi`,
    })
  }

  // Language
  if (filters.language !== 'all') {
    chips.push({
      key: 'language',
      label: getLanguageLabel(filters.language),
    })
  }

  // Groups (array - each gets its own chip)
  for (const group of filters.groups) {
    chips.push({
      key: 'groups',
      value: group,
      label: getGroupLabel(group),
    })
  }

  // Accessibility (array - each gets its own chip)
  for (const access of filters.accessibility) {
    chips.push({
      key: 'accessibility',
      value: access,
      label: getAccessibilityLabel(access),
    })
  }

  // Special (array - each gets its own chip)
  for (const special of filters.special) {
    chips.push({
      key: 'special',
      value: special,
      label: getSpecialLabel(special),
    })
  }

  // Favorites only
  if (filters.showFavoritesOnly) {
    chips.push({
      key: 'showFavoritesOnly',
      label: 'Favorites only',
    })
  }

  // Don't render if no active filters
  if (chips.length === 0) {
    return null
  }

  return (
    <div className="flex items-center gap-2">
      <ScrollArea className="flex-1 whitespace-nowrap">
        <div className="flex items-center gap-1.5 py-1">
          {chips.map((chip, index) => (
            <FilterChip
              key={`${chip.key}-${chip.value || index}`}
              label={chip.label}
              onRemove={() => onRemoveFilter(chip.key, chip.value)}
            />
          ))}
        </div>
        <ScrollBar orientation="horizontal" className="h-2" />
      </ScrollArea>

      {chips.length > 1 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearAll}
          className="shrink-0 text-xs text-muted-foreground hover:text-foreground"
        >
          Clear all
        </Button>
      )}
    </div>
  )
}

export default FilterChips
