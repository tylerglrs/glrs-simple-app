/**
 * AlertFilters Component
 * Phase 8E: Admin Crisis Dashboard
 *
 * Multi-filter bar for crisis alerts with:
 * - Source dropdown (SOS, AI, Check-in)
 * - Tier dropdown (Critical, High, Moderate, Standard)
 * - Status dropdown (Unread, Acknowledged, Responded, Escalated, Resolved)
 * - Date range picker
 * - Search input
 */

import { useState } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Search,
  X,
  Calendar as CalendarIcon,
  RefreshCw,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import type { AlertFilters as AlertFiltersType, AlertSource, AlertStatus } from '../types'

interface AlertFiltersProps {
  filters: AlertFiltersType
  onFilterChange: (filters: AlertFiltersType) => void
  loading?: boolean
  onRefresh?: () => void
}

// Source options
const sourceOptions: { value: 'all' | AlertSource; label: string }[] = [
  { value: 'all', label: 'All Sources' },
  { value: 'sos', label: 'SOS Button' },
  { value: 'ai', label: 'AI Crisis' },
  { value: 'checkin', label: 'Check-in' },
]

// Tier options
const tierOptions: { value: 'all' | '1' | '2' | '3' | '4'; label: string; color: string }[] = [
  { value: 'all', label: 'All Tiers', color: '' },
  { value: '1', label: 'Critical', color: 'bg-red-500' },
  { value: '2', label: 'High', color: 'bg-orange-500' },
  { value: '3', label: 'Moderate', color: 'bg-yellow-500' },
  { value: '4', label: 'Standard', color: 'bg-blue-500' },
]

// Status options
const statusOptions: { value: 'all' | AlertStatus; label: string }[] = [
  { value: 'all', label: 'All Status' },
  { value: 'unread', label: 'Unread' },
  { value: 'acknowledged', label: 'Acknowledged' },
  { value: 'responded', label: 'Responded' },
  { value: 'escalated', label: 'Escalated' },
  { value: 'resolved', label: 'Resolved' },
]

export function AlertFilters({
  filters,
  onFilterChange,
  loading = false,
  onRefresh,
}: AlertFiltersProps) {
  const [searchValue, setSearchValue] = useState(filters.searchQuery || '')

  // Count active filters (excluding 'all' values)
  const activeFilterCount = [
    filters.source !== 'all',
    filters.tier !== 'all',
    filters.status !== 'all',
    filters.dateRange.start !== null,
    filters.dateRange.end !== null,
    !!filters.searchQuery,
  ].filter(Boolean).length

  const handleSourceChange = (value: string) => {
    onFilterChange({ ...filters, source: value as 'all' | AlertSource })
  }

  const handleTierChange = (value: string) => {
    onFilterChange({ ...filters, tier: value as 'all' | '1' | '2' | '3' | '4' })
  }

  const handleStatusChange = (value: string) => {
    onFilterChange({ ...filters, status: value as 'all' | AlertStatus })
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onFilterChange({ ...filters, searchQuery: searchValue })
  }

  const handleSearchClear = () => {
    setSearchValue('')
    onFilterChange({ ...filters, searchQuery: '' })
  }

  const handleClearAllFilters = () => {
    setSearchValue('')
    onFilterChange({
      source: 'all',
      tier: 'all',
      status: 'all',
      dateRange: { start: null, end: null },
      pirId: null,
      coachId: null,
      searchQuery: '',
    })
  }

  const handleDateRangeChange = (start: Date | null, end: Date | null) => {
    onFilterChange({
      ...filters,
      dateRange: { start, end },
    })
  }

  // Quick date range presets
  const setQuickDateRange = (days: number) => {
    const end = new Date()
    const start = new Date()
    start.setDate(start.getDate() - days)
    handleDateRangeChange(start, end)
  }

  return (
    <div className="space-y-4">
      {/* Main filter row */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Source filter */}
        <Select value={filters.source} onValueChange={handleSourceChange}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Source" />
          </SelectTrigger>
          <SelectContent>
            {sourceOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Tier filter */}
        <Select value={filters.tier} onValueChange={handleTierChange}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Tier" />
          </SelectTrigger>
          <SelectContent>
            {tierOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                <div className="flex items-center gap-2">
                  {option.color && (
                    <div className={cn('w-2 h-2 rounded-full', option.color)} />
                  )}
                  {option.label}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Status filter */}
        <Select value={filters.status} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Date range popover */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                'w-[180px] justify-start text-left font-normal',
                !filters.dateRange.start && 'text-muted-foreground'
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {filters.dateRange.start ? (
                filters.dateRange.end ? (
                  <>
                    {format(filters.dateRange.start, 'MMM d')} -{' '}
                    {format(filters.dateRange.end, 'MMM d')}
                  </>
                ) : (
                  format(filters.dateRange.start, 'MMM d, yyyy')
                )
              ) : (
                <span>Date range</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-4" align="start">
            <div className="space-y-3">
              <div className="text-sm font-medium">Quick select</div>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setQuickDateRange(7)}
                >
                  Last 7 days
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setQuickDateRange(30)}
                >
                  Last 30 days
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setQuickDateRange(90)}
                >
                  Last 90 days
                </Button>
              </div>
              {(filters.dateRange.start || filters.dateRange.end) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDateRangeChange(null, null)}
                  className="w-full"
                >
                  Clear date range
                </Button>
              )}
            </div>
          </PopoverContent>
        </Popover>

        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="flex-1 min-w-[200px] max-w-[300px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search PIR, keywords..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="pl-9 pr-9"
            />
            {searchValue && (
              <button
                type="button"
                onClick={handleSearchClear}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </form>

        {/* Refresh button */}
        {onRefresh && (
          <Button
            variant="outline"
            size="icon"
            onClick={onRefresh}
            disabled={loading}
            className="flex-shrink-0"
          >
            <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} />
          </Button>
        )}
      </div>

      {/* Active filters summary */}
      {activeFilterCount > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-gray-500">Active filters:</span>

          {filters.source !== 'all' && (
            <Badge variant="secondary" className="gap-1">
              Source: {sourceOptions.find((o) => o.value === filters.source)?.label}
              <button
                onClick={() => handleSourceChange('all')}
                className="ml-1 hover:text-red-500"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}

          {filters.tier !== 'all' && (
            <Badge variant="secondary" className="gap-1">
              Tier: {tierOptions.find((o) => o.value === filters.tier)?.label}
              <button
                onClick={() => handleTierChange('all')}
                className="ml-1 hover:text-red-500"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}

          {filters.status !== 'all' && (
            <Badge variant="secondary" className="gap-1">
              Status: {statusOptions.find((o) => o.value === filters.status)?.label}
              <button
                onClick={() => handleStatusChange('all')}
                className="ml-1 hover:text-red-500"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}

          {filters.dateRange.start && (
            <Badge variant="secondary" className="gap-1">
              Date: {format(filters.dateRange.start, 'MMM d')}
              {filters.dateRange.end && ` - ${format(filters.dateRange.end, 'MMM d')}`}
              <button
                onClick={() => handleDateRangeChange(null, null)}
                className="ml-1 hover:text-red-500"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}

          {filters.searchQuery && (
            <Badge variant="secondary" className="gap-1">
              Search: "{filters.searchQuery}"
              <button
                onClick={handleSearchClear}
                className="ml-1 hover:text-red-500"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearAllFilters}
            className="text-gray-500 hover:text-red-500"
          >
            Clear all
          </Button>
        </div>
      )}
    </div>
  )
}

export default AlertFilters
