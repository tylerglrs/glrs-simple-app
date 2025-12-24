import { Calendar, Clock, Users, Sparkles, Heart, Globe, Video, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import type { MeetingFilters, MeetingTypeFilter, DayFilter, TimeOfDayFilter, AttendanceModeFilter } from '../types'
import { TWELVE_STEP_MEETING_TYPES, SECULAR_MEETING_TYPES } from '../types'

// ============================================================
// QUICK FILTER PRESETS
// ============================================================

interface QuickFilterPreset {
  id: string
  label: string
  icon: React.ElementType
  filters: Partial<MeetingFilters>
  description?: string
}

// Get today's day number (0-6)
const getTodayDayFilter = (): DayFilter => {
  return String(new Date().getDay()) as DayFilter
}

// Quick filter presets
const QUICK_FILTER_PRESETS: QuickFilterPreset[] = [
  {
    id: 'today',
    label: 'Today',
    icon: Calendar,
    filters: {
      day: getTodayDayFilter(),
    },
    description: 'Meetings happening today',
  },
  {
    id: 'now',
    label: 'Now',
    icon: Clock,
    filters: {
      day: getTodayDayFilter(),
      timeOfDay: getCurrentTimeOfDay(),
    },
    description: 'Meetings happening now',
  },
  {
    id: 'morning',
    label: 'Morning',
    icon: Clock,
    filters: {
      timeOfDay: 'morning' as TimeOfDayFilter,
    },
    description: 'Morning meetings (5am-12pm)',
  },
  {
    id: 'evening',
    label: 'Evening',
    icon: Clock,
    filters: {
      timeOfDay: 'evening' as TimeOfDayFilter,
    },
    description: 'Evening meetings (6pm-10pm)',
  },
  {
    id: '12-step',
    label: '12-Step',
    icon: Users,
    filters: {
      type: 'all',
      programTypes: TWELVE_STEP_MEETING_TYPES,
    },
    description: 'AA, NA, CMA, MA, HA',
  },
  {
    id: 'secular',
    label: 'Secular',
    icon: Globe,
    filters: {
      type: 'all',
      programTypes: SECULAR_MEETING_TYPES,
    },
    description: 'Recovery Dharma, SMART',
  },
  {
    id: 'aa-only',
    label: 'AA Only',
    icon: Users,
    filters: {
      type: 'all',
      programTypes: ['aa'] as MeetingTypeFilter[],
    },
    description: 'Alcoholics Anonymous',
  },
  {
    id: 'na-only',
    label: 'NA Only',
    icon: Users,
    filters: {
      type: 'all',
      programTypes: ['na'] as MeetingTypeFilter[],
    },
    description: 'Narcotics Anonymous',
  },
  {
    id: 'virtual',
    label: 'Virtual',
    icon: Video,
    filters: {
      attendanceMode: 'online' as AttendanceModeFilter, // Keep 'online' for backwards compatibility with filter logic
    },
    description: 'Virtual meetings only',
  },
  {
    id: 'in-person',
    label: 'In-Person',
    icon: MapPin,
    filters: {
      attendanceMode: 'in_person' as AttendanceModeFilter,
    },
    description: 'Physical location meetings',
  },
  {
    id: 'open',
    label: 'Open Meetings',
    icon: Sparkles,
    filters: {
      accessibility: ['O'],
    },
    description: 'Open to everyone',
  },
]

// Get current time of day
function getCurrentTimeOfDay(): TimeOfDayFilter {
  const hour = new Date().getHours()
  if (hour >= 5 && hour < 12) return 'morning'
  if (hour >= 12 && hour < 18) return 'afternoon'
  if (hour >= 18 && hour < 22) return 'evening'
  return 'night'
}

// ============================================================
// QUICK FILTERS COMPONENT
// ============================================================

interface QuickFiltersProps {
  filters: MeetingFilters
  onFilterChange: (filters: Partial<MeetingFilters>) => void
  className?: string
}

export function QuickFilters({ filters, onFilterChange, className }: QuickFiltersProps) {
  // Check if a preset is currently active
  const isPresetActive = (preset: QuickFilterPreset): boolean => {
    const presetFilters = preset.filters

    // Check day filter
    if (presetFilters.day && filters.day !== presetFilters.day) return false

    // Check time of day filter
    if (presetFilters.timeOfDay && filters.timeOfDay !== presetFilters.timeOfDay) return false

    // Check attendance mode filter
    if (presetFilters.attendanceMode && filters.attendanceMode !== presetFilters.attendanceMode) return false

    // Check programTypes
    if (presetFilters.programTypes && presetFilters.programTypes.length > 0) {
      if (filters.programTypes.length !== presetFilters.programTypes.length) return false
      const sortedCurrent = [...filters.programTypes].sort()
      const sortedPreset = [...presetFilters.programTypes].sort()
      if (!sortedCurrent.every((v, i) => v === sortedPreset[i])) return false
    }

    // Check accessibility
    if (presetFilters.accessibility && presetFilters.accessibility.length > 0) {
      if (!presetFilters.accessibility.every((a) => filters.accessibility.includes(a))) return false
    }

    return true
  }

  // Handle preset click
  const handlePresetClick = (preset: QuickFilterPreset) => {
    if (isPresetActive(preset)) {
      // If already active, clear those specific filters
      const clearFilters: Partial<MeetingFilters> = {}
      if (preset.filters.day) clearFilters.day = 'all'
      if (preset.filters.timeOfDay) clearFilters.timeOfDay = 'all'
      if (preset.filters.attendanceMode) clearFilters.attendanceMode = 'all'
      if (preset.filters.programTypes) {
        clearFilters.type = 'all'
        clearFilters.programTypes = []
      }
      if (preset.filters.accessibility) clearFilters.accessibility = []
      onFilterChange(clearFilters)
    } else {
      // Apply the preset filters
      onFilterChange(preset.filters)
    }
  }

  return (
    <div className={cn('w-full', className)}>
      <ScrollArea className="w-full whitespace-nowrap">
        <div
          className="flex items-center gap-2 py-1 px-1"
          role="group"
          aria-label="Quick filter presets"
        >
          {QUICK_FILTER_PRESETS.map((preset) => {
            const isActive = isPresetActive(preset)
            const Icon = preset.icon

            return (
              <Button
                key={preset.id}
                variant={isActive ? 'default' : 'outline'}
                size="sm"
                onClick={() => handlePresetClick(preset)}
                className={cn(
                  'shrink-0 gap-1.5 h-8 min-h-[36px]',
                  isActive && 'bg-primary text-primary-foreground'
                )}
                aria-label={`${preset.label}: ${preset.description}`}
                aria-pressed={isActive}
              >
                <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                {preset.label}
              </Button>
            )
          })}
        </div>
        <ScrollBar orientation="horizontal" className="h-2" />
      </ScrollArea>
    </div>
  )
}

export default QuickFilters
