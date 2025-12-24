import { useState } from 'react'
import {
  Filter,
  MapPin,
  Clock,
  Calendar,
  Users,
  Accessibility,
  Star,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Check,
  Video,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@/components/ui/sheet'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import type {
  MeetingFilters,
  FilterPanelProps,
  GroupFilter,
  AccessibilityFilter,
  SpecialFilter,
  MeetingTypeFilter,
} from '../types'
import {
  DAY_FILTER_OPTIONS,
  TIME_OF_DAY_FILTER_OPTIONS,
  ATTENDANCE_MODE_OPTIONS,
  MEETING_TYPE_OPTIONS,
  FORMAT_OPTIONS,
  COUNTY_LABELS,
  GROUP_OPTIONS,
  ACCESSIBILITY_OPTIONS,
  LANGUAGE_OPTIONS,
  SPECIAL_OPTIONS,
} from '../types'

// Multi-select meeting type options (excluding 'all')
const MEETING_TYPE_CHECKBOX_OPTIONS = MEETING_TYPE_OPTIONS.filter(
  (opt) => opt.value !== 'all'
) as { value: MeetingTypeFilter; label: string }[]

// ============================================================
// COUNTY OPTIONS (derived from COUNTY_LABELS)
// ============================================================

const COUNTY_OPTIONS = Object.entries(COUNTY_LABELS).map(([value, label]) => ({
  value: value as keyof typeof COUNTY_LABELS,
  label,
}))

// ============================================================
// FILTER SECTION COMPONENT
// ============================================================

interface FilterSectionProps {
  title: string
  icon: React.ReactNode
  children: React.ReactNode
  defaultOpen?: boolean
}

// Generate unique IDs for accessibility
let sectionIdCounter = 0

function FilterSection({ title, icon, children, defaultOpen = false }: FilterSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)
  const [sectionId] = useState(() => `filter-section-${++sectionIdCounter}`)
  const contentId = `${sectionId}-content`

  return (
    <div className="border-b border-border last:border-b-0">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between py-4 px-1 text-left hover:bg-accent/50 transition-colors min-h-[44px] focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        aria-expanded={isOpen}
        aria-controls={contentId}
      >
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground" aria-hidden="true">{icon}</span>
          <span className="font-medium">{title}</span>
        </div>
        {isOpen ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
        )}
      </button>
      {isOpen && (
        <div id={contentId} className="pb-4 px-1" role="region" aria-labelledby={sectionId}>
          {children}
        </div>
      )}
    </div>
  )
}

// ============================================================
// CHECKBOX GROUP COMPONENT
// ============================================================

interface CheckboxGroupProps<T extends string> {
  options: { value: T; label: string }[]
  selected: T[]
  onChange: (selected: T[]) => void
  columns?: 1 | 2
}

function CheckboxGroup<T extends string>({
  options,
  selected,
  onChange,
  columns = 2,
}: CheckboxGroupProps<T>) {
  const handleToggle = (value: T) => {
    if (selected.includes(value)) {
      onChange(selected.filter((v) => v !== value))
    } else {
      onChange([...selected, value])
    }
  }

  return (
    <div className={cn('grid gap-2', columns === 2 ? 'grid-cols-2' : 'grid-cols-1')}>
      {options.map((option) => (
        <div key={option.value} className="flex items-center space-x-2">
          <Checkbox
            id={`filter-${option.value}`}
            checked={selected.includes(option.value)}
            onCheckedChange={() => handleToggle(option.value)}
          />
          <Label
            htmlFor={`filter-${option.value}`}
            className="text-sm font-normal cursor-pointer"
          >
            {option.label}
          </Label>
        </div>
      ))}
    </div>
  )
}

// ============================================================
// MAIN FILTER PANEL COMPONENT
// ============================================================

export function FilterPanel({
  filters,
  onFiltersChange,
  onApply,
  onClear,
  onCancel,
  isOpen,
  meetingCount,
  totalCount,
}: FilterPanelProps) {
  // ============================================================
  // FILTER CHANGE HANDLERS
  // ============================================================

  const handleSelectChange = <K extends keyof MeetingFilters>(
    key: K,
    value: MeetingFilters[K]
  ) => {
    onFiltersChange({ [key]: value })
  }

  const handleCheckboxGroupChange = <
    K extends 'groups' | 'accessibility' | 'special' | 'programTypes'
  >(
    key: K,
    values: MeetingFilters[K]
  ) => {
    onFiltersChange({ [key]: values })
  }

  // Handle meeting type multi-select changes
  const handleMeetingTypeChange = (types: MeetingTypeFilter[]) => {
    // When using multi-select, set type to 'all' and use programTypes array
    onFiltersChange({
      type: 'all',
      programTypes: types,
    })
  }

  const handleDistanceChange = (value: number[]) => {
    const distances = [null, 5, 10, 25, 50] as const
    onFiltersChange({ distanceRadius: distances[value[0]] })
  }

  const getDistanceSliderValue = () => {
    const distances = [null, 5, 10, 25, 50]
    const index = distances.indexOf(filters.distanceRadius)
    return index >= 0 ? index : 0
  }

  const handleFavoritesToggle = () => {
    onFiltersChange({ showFavoritesOnly: !filters.showFavoritesOnly })
  }

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <Sheet open={isOpen} onOpenChange={(open: boolean) => !open && onCancel()}>
      <SheetContent side="right" className="w-full sm:max-w-md p-0 flex flex-col">
        {/* Header */}
        <SheetHeader className="px-4 py-3 border-b">
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" aria-hidden="true" />
              Filters
            </SheetTitle>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                <span className="sr-only">Showing </span>
                {meetingCount} of {totalCount}
                <span className="sr-only"> meetings</span>
              </Badge>
            </div>
          </div>
        </SheetHeader>

        {/* Filter Content */}
        <ScrollArea className="flex-1">
          <div className="px-4">
            {/* ============================== */}
            {/* 1. DAY OF WEEK */}
            {/* ============================== */}
            <FilterSection
              title="Day of Week"
              icon={<Calendar className="h-4 w-4" />}
              defaultOpen={true}
            >
              <Select
                value={filters.day}
                onValueChange={(value) => handleSelectChange('day', value as MeetingFilters['day'])}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select day" />
                </SelectTrigger>
                <SelectContent>
                  {DAY_FILTER_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FilterSection>

            {/* ============================== */}
            {/* 2. TIME OF DAY */}
            {/* ============================== */}
            <FilterSection
              title="Time of Day"
              icon={<Clock className="h-4 w-4" />}
            >
              <div className="space-y-2" role="radiogroup" aria-label="Time of day filter">
                {TIME_OF_DAY_FILTER_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleSelectChange('timeOfDay', option.value)}
                    className={cn(
                      'flex w-full items-center justify-between p-2 rounded-md transition-colors text-left min-h-[44px] focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
                      filters.timeOfDay === option.value
                        ? 'bg-primary/10 border border-primary'
                        : 'hover:bg-accent border border-transparent'
                    )}
                    role="radio"
                    aria-checked={filters.timeOfDay === option.value}
                    aria-describedby={`time-${option.value}-desc`}
                  >
                    <div>
                      <div className="font-medium text-sm">{option.label}</div>
                      <div id={`time-${option.value}-desc`} className="text-xs text-muted-foreground">{option.description}</div>
                    </div>
                    {filters.timeOfDay === option.value && (
                      <Check className="h-4 w-4 text-primary" aria-hidden="true" />
                    )}
                  </button>
                ))}
              </div>
            </FilterSection>

            {/* ============================== */}
            {/* 3. ATTENDANCE MODE (In-Person / Virtual / Hybrid) */}
            {/* ============================== */}
            <FilterSection
              title="Attendance Mode"
              icon={<Video className="h-4 w-4" />}
              defaultOpen={true}
            >
              <div className="space-y-2" role="radiogroup" aria-label="Attendance mode filter">
                {ATTENDANCE_MODE_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleSelectChange('attendanceMode', option.value)}
                    className={cn(
                      'flex w-full items-center justify-between p-2 rounded-md transition-colors text-left min-h-[44px] focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
                      filters.attendanceMode === option.value
                        ? 'bg-primary/10 border border-primary'
                        : 'hover:bg-accent border border-transparent'
                    )}
                    role="radio"
                    aria-checked={filters.attendanceMode === option.value}
                    aria-describedby={`attendance-${option.value}-desc`}
                  >
                    <div>
                      <div className="font-medium text-sm">{option.label}</div>
                      <div id={`attendance-${option.value}-desc`} className="text-xs text-muted-foreground">{option.description}</div>
                    </div>
                    {filters.attendanceMode === option.value && (
                      <Check className="h-4 w-4 text-primary" aria-hidden="true" />
                    )}
                  </button>
                ))}
              </div>
            </FilterSection>

            {/* ============================== */}
            {/* 4. MEETING TYPE (Multi-select) */}
            {/* ============================== */}
            <FilterSection
              title="Meeting Type"
              icon={<Users className="h-4 w-4" />}
              defaultOpen={true}
            >
              <div className="space-y-3">
                {filters.programTypes.length > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      {filters.programTypes.length} selected
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleMeetingTypeChange([])}
                      className="h-7 px-2 text-xs"
                    >
                      Clear
                    </Button>
                  </div>
                )}
                <CheckboxGroup<MeetingTypeFilter>
                  options={MEETING_TYPE_CHECKBOX_OPTIONS}
                  selected={filters.programTypes}
                  onChange={handleMeetingTypeChange}
                  columns={2}
                />
                {filters.programTypes.length === 0 && (
                  <p className="text-xs text-muted-foreground">
                    Select one or more meeting types (shows all types if none selected)
                  </p>
                )}
              </div>
            </FilterSection>

            {/* ============================== */}
            {/* 4. FORMAT (Discussion, Big Book, etc.) */}
            {/* ============================== */}
            <FilterSection
              title="Meeting Format"
              icon={<Star className="h-4 w-4" />}
            >
              <Select
                value={filters.format}
                onValueChange={(value) => handleSelectChange('format', value as MeetingFilters['format'])}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent>
                  {FORMAT_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FilterSection>

            {/* ============================== */}
            {/* 5. LOCATION / REGION */}
            {/* ============================== */}
            <FilterSection
              title="Region"
              icon={<MapPin className="h-4 w-4" />}
            >
              <Select
                value={filters.county}
                onValueChange={(value) => handleSelectChange('county', value as MeetingFilters['county'])}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select region" />
                </SelectTrigger>
                <SelectContent>
                  {COUNTY_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FilterSection>

            {/* ============================== */}
            {/* 6. DISTANCE (Slider) */}
            {/* ============================== */}
            <FilterSection
              title="Distance"
              icon={<MapPin className="h-4 w-4" />}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span id="distance-max-label" className="text-muted-foreground">Max distance</span>
                  <span className="font-medium" aria-live="polite">
                    {filters.distanceRadius === null
                      ? 'Any'
                      : `${filters.distanceRadius} miles`}
                  </span>
                </div>
                <Slider
                  value={[getDistanceSliderValue()]}
                  onValueChange={handleDistanceChange}
                  min={0}
                  max={4}
                  step={1}
                  className="w-full"
                  aria-label="Maximum distance"
                  aria-valuetext={filters.distanceRadius === null ? 'Any distance' : `${filters.distanceRadius} miles`}
                />
                <div className="flex justify-between text-xs text-muted-foreground" aria-hidden="true">
                  <span>Any</span>
                  <span>5mi</span>
                  <span>10mi</span>
                  <span>25mi</span>
                  <span>50mi</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Enable location access to filter by distance
                </p>
              </div>
            </FilterSection>

            {/* ============================== */}
            {/* 7. CHARACTERISTICS (Groups + Accessibility + Language) */}
            {/* ============================== */}
            <FilterSection
              title="Characteristics"
              icon={<Accessibility className="h-4 w-4" />}
            >
              <Accordion type="multiple" className="w-full">
                {/* Group Demographics */}
                <AccordionItem value="groups">
                  <AccordionTrigger className="text-sm py-2">
                    Group Demographics
                    {filters.groups.length > 0 && (
                      <Badge variant="secondary" className="ml-2 text-xs">
                        {filters.groups.length}
                      </Badge>
                    )}
                  </AccordionTrigger>
                  <AccordionContent>
                    <CheckboxGroup<GroupFilter>
                      options={GROUP_OPTIONS}
                      selected={filters.groups}
                      onChange={(values) => handleCheckboxGroupChange('groups', values)}
                    />
                  </AccordionContent>
                </AccordionItem>

                {/* Accessibility */}
                <AccordionItem value="accessibility">
                  <AccordionTrigger className="text-sm py-2">
                    Accessibility
                    {filters.accessibility.length > 0 && (
                      <Badge variant="secondary" className="ml-2 text-xs">
                        {filters.accessibility.length}
                      </Badge>
                    )}
                  </AccordionTrigger>
                  <AccordionContent>
                    <CheckboxGroup<AccessibilityFilter>
                      options={ACCESSIBILITY_OPTIONS}
                      selected={filters.accessibility}
                      onChange={(values) =>
                        handleCheckboxGroupChange('accessibility', values)
                      }
                    />
                  </AccordionContent>
                </AccordionItem>

                {/* Language */}
                <AccordionItem value="language">
                  <AccordionTrigger className="text-sm py-2">
                    Language
                  </AccordionTrigger>
                  <AccordionContent>
                    <Select
                      value={filters.language}
                      onValueChange={(value) =>
                        handleSelectChange('language', value as MeetingFilters['language'])
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                      <SelectContent>
                        {LANGUAGE_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </AccordionContent>
                </AccordionItem>

                {/* Special Focus */}
                <AccordionItem value="special">
                  <AccordionTrigger className="text-sm py-2">
                    Special Focus
                    {filters.special.length > 0 && (
                      <Badge variant="secondary" className="ml-2 text-xs">
                        {filters.special.length}
                      </Badge>
                    )}
                  </AccordionTrigger>
                  <AccordionContent>
                    <CheckboxGroup<SpecialFilter>
                      options={SPECIAL_OPTIONS}
                      selected={filters.special}
                      onChange={(values) => handleCheckboxGroupChange('special', values)}
                      columns={1}
                    />
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </FilterSection>

            {/* ============================== */}
            {/* 8. FAVORITES ONLY */}
            {/* ============================== */}
            <FilterSection
              title="Favorites"
              icon={<Star className="h-4 w-4" />}
            >
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="favorites-only"
                  checked={filters.showFavoritesOnly}
                  onCheckedChange={handleFavoritesToggle}
                />
                <Label htmlFor="favorites-only" className="text-sm cursor-pointer">
                  Show favorites only
                </Label>
              </div>
            </FilterSection>
          </div>
        </ScrollArea>

        {/* Footer */}
        <SheetFooter className="px-4 py-3 border-t">
          <div className="flex w-full gap-2">
            <Button
              variant="outline"
              onClick={onClear}
              className="flex-1 min-h-[44px]"
              aria-label="Clear all filters"
            >
              <RotateCcw className="h-4 w-4 mr-2" aria-hidden="true" />
              Clear All
            </Button>
            <Button
              onClick={onApply}
              className="flex-1 min-h-[44px]"
              aria-label={`Apply filters and show ${meetingCount} meetings`}
            >
              <Check className="h-4 w-4 mr-2" aria-hidden="true" />
              Apply Filters
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

export default FilterPanel
