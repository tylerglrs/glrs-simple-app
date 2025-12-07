/**
 * Alerts Page - Crisis Dashboard
 * Phase 8E: Admin Crisis Dashboard
 *
 * Real-time crisis alerts monitoring dashboard with:
 * - Stats cards with trend indicators
 * - Multi-filter bar
 * - List/Charts/Calendar view tabs
 * - Detail sheet for full alert info
 * - Action handlers for workflow management
 */

import { useState, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { CURRENT_TENANT } from '@/lib/firebase'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  AlertTriangle,
  Download,
  List,
  BarChart3,
  Calendar as CalendarIcon,
  RefreshCw,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAlerts } from './hooks/useAlerts'
import { AlertStatsCards } from './components/AlertStatsCards'
import { AlertFilters } from './components/AlertFilters'
import { AlertList } from './components/AlertList'
import { AlertDetail } from './components/AlertDetail'
import { AlertCharts } from './components/AlertCharts'
import { AlertCalendar } from './components/AlertCalendar'
import type { CrisisAlert, AlertFilters as AlertFiltersType, AlertAction } from './types'

export function Alerts() {
  const { adminUser, getDataScope } = useAuth()

  // Determine if coach should only see their PIRs
  const scope = getDataScope()
  const coachId = scope === 'assigned_pirs' ? adminUser?.uid : undefined

  // Use the alerts hook with real-time listener
  const {
    alerts,
    allAlerts,
    loading,
    error,
    filters,
    setFilters,
    stats,
    acknowledgeAlert,
    addResponseNote,
    escalateAlert,
    resolveAlert,
    refresh,
  } = useAlerts({
    tenantId: CURRENT_TENANT,
    coachId,
    limit: 200,
  })

  // Local state
  const [selectedAlert, setSelectedAlert] = useState<CrisisAlert | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'list' | 'charts' | 'calendar'>('list')
  const [chartDateRange, setChartDateRange] = useState(30)
  const [calendarSelectedDate, setCalendarSelectedDate] = useState<Date | null>(null)

  // Handle filter changes from stats cards
  const handleStatClick = useCallback(
    (filter: Partial<AlertFiltersType>) => {
      setFilters((prev) => ({
        ...prev,
        ...filter,
        // Reset other filters when clicking a stat
        source: filter.source || 'all',
        tier: filter.tier || 'all',
        status: filter.status || 'all',
      }))
      setActiveTab('list')
    },
    [setFilters]
  )

  // Handle alert selection
  const handleAlertSelect = useCallback((alert: CrisisAlert) => {
    setSelectedAlert(alert)
    setDetailOpen(true)
  }, [])

  // Handle acknowledge from list
  const handleAcknowledge = useCallback(
    async (alert: CrisisAlert) => {
      try {
        await acknowledgeAlert(alert.id)
      } catch (err) {
        console.error('Failed to acknowledge alert:', err)
      }
    },
    [acknowledgeAlert]
  )

  // Handle respond from list (opens detail with focus on note)
  const handleRespond = useCallback((alert: CrisisAlert) => {
    setSelectedAlert(alert)
    setDetailOpen(true)
  }, [])

  // Handle escalate from list
  const handleEscalate = useCallback((alert: CrisisAlert) => {
    setSelectedAlert(alert)
    setDetailOpen(true)
  }, [])

  // Handle actions from detail sheet
  const handleDetailAction = useCallback(
    async (action: AlertAction, note?: string) => {
      if (!selectedAlert) return

      try {
        switch (action) {
          case 'acknowledge':
            await acknowledgeAlert(selectedAlert.id)
            break
          case 'add_note':
          case 'respond':
            if (note) {
              await addResponseNote(selectedAlert.id, note)
            }
            break
          case 'escalate':
            if (note) {
              await escalateAlert(selectedAlert.id, note)
            }
            break
          case 'resolve':
            await resolveAlert(selectedAlert.id, note)
            setDetailOpen(false)
            setSelectedAlert(null)
            break
        }
      } catch (err) {
        console.error('Action failed:', err)
      }
    },
    [selectedAlert, acknowledgeAlert, addResponseNote, escalateAlert, resolveAlert]
  )

  // Handle calendar date selection
  const handleCalendarDateSelect = useCallback(
    (date: Date) => {
      setCalendarSelectedDate(date)
      // Update filters to show alerts from selected date
      const startOfDay = new Date(date)
      startOfDay.setHours(0, 0, 0, 0)
      const endOfDay = new Date(date)
      endOfDay.setHours(23, 59, 59, 999)
      setFilters((prev) => ({
        ...prev,
        dateRange: { start: startOfDay, end: endOfDay },
      }))
    },
    [setFilters]
  )

  // Export to CSV
  const handleExport = useCallback(() => {
    const headers = [
      'ID',
      'PIR Name',
      'Coach',
      'Source',
      'Tier',
      'Status',
      'Created At',
      'Keywords',
    ]
    const rows = alerts.map((alert) => [
      alert.id,
      alert.pirName,
      alert.coachName || '',
      alert.source,
      alert.tier,
      alert.status,
      alert.createdAt?.toDate?.()?.toISOString() || '',
      alert.triggerKeywords.join('; '),
    ])

    const csv = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `crisis-alerts-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }, [alerts])

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <AlertTriangle className="h-6 w-6 text-red-500" />
            Crisis Alerts
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Monitor and respond to crisis situations in real-time
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={refresh}
            disabled={loading}
            className="gap-2"
          >
            <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} />
            Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport} className="gap-2">
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Stats Cards */}
      <AlertStatsCards
        stats={stats}
        loading={loading}
        onStatClick={handleStatClick}
      />

      {/* Filters */}
      <AlertFilters
        filters={filters}
        onFilterChange={setFilters}
        loading={loading}
        onRefresh={refresh}
      />

      {/* View Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="list" className="gap-2">
              <List className="h-4 w-4" />
              List View
            </TabsTrigger>
            <TabsTrigger value="charts" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              Charts
            </TabsTrigger>
            <TabsTrigger value="calendar" className="gap-2">
              <CalendarIcon className="h-4 w-4" />
              Calendar
            </TabsTrigger>
          </TabsList>

          {activeTab === 'charts' && (
            <Select
              value={chartDateRange.toString()}
              onValueChange={(v) => setChartDateRange(parseInt(v))}
            >
              <SelectTrigger className="w-[130px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>

        <TabsContent value="list" className="mt-4">
          <AlertList
            alerts={alerts}
            loading={loading}
            onAlertSelect={handleAlertSelect}
            selectedAlertId={selectedAlert?.id}
            onAcknowledge={handleAcknowledge}
            onRespond={handleRespond}
            onEscalate={handleEscalate}
            totalCount={allAlerts.length}
          />
        </TabsContent>

        <TabsContent value="charts" className="mt-4">
          <AlertCharts
            alerts={allAlerts}
            dateRange={chartDateRange}
            loading={loading}
          />
        </TabsContent>

        <TabsContent value="calendar" className="mt-4">
          <AlertCalendar
            alerts={allAlerts}
            onDateSelect={handleCalendarDateSelect}
            selectedDate={calendarSelectedDate}
          />
        </TabsContent>
      </Tabs>

      {/* Alert Detail Sheet */}
      <AlertDetail
        alert={selectedAlert}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        onAction={handleDetailAction}
      />
    </div>
  )
}

export default Alerts
