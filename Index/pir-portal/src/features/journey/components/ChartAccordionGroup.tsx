import { useState, useCallback } from 'react'
import { Smile, Flame, AlertCircle, Moon, Star, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import AccordionChart from './AccordionChart'
import FullLineChart from './FullLineChart'
import { useChartData, CHART_CONFIGS } from '../hooks/useChartData'
import { useChartSettings } from '../hooks/useChartSettings'
import type { ChartType, ChartDataPoint } from '../types'

// =============================================================================
// ICON MAP
// =============================================================================

const CHART_ICONS = {
  mood: Smile,
  craving: Flame,
  anxiety: AlertCircle,
  sleep: Moon,
  overallDay: Star,
} as const

// =============================================================================
// TYPES
// =============================================================================

interface ChartAccordionGroupProps {
  className?: string
}

// =============================================================================
// COMPONENT
// =============================================================================

export function ChartAccordionGroup({ className }: ChartAccordionGroupProps) {
  const [expandedChart, setExpandedChart] = useState<ChartType | null>(null)

  const { data, loading, error } = useChartData()
  const { settings } = useChartSettings()

  // Toggle chart expansion - only one open at a time
  const handleToggle = useCallback((chartType: ChartType) => {
    setExpandedChart((current) => (current === chartType ? null : chartType))
  }, [])

  // Render full chart for a specific type
  const renderFullChart = useCallback(
    (chartType: ChartType) => (chartData: ChartDataPoint[]) => {
      const config = CHART_CONFIGS[chartType]
      return (
        <FullLineChart
          data={chartData}
          color={config.color}
          bgColor={config.bgColor}
          showMissedDays={settings.showMissedDays}
        />
      )
    },
    [settings.showMissedDays]
  )

  // Loading state
  if (loading) {
    return (
      <div className={cn('flex items-center justify-center py-12', className)}>
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className={cn('rounded-xl border-2 border-destructive/30 bg-destructive/10 p-6 text-center', className)}>
        <AlertCircle className="mx-auto mb-2 h-8 w-8 text-destructive" />
        <p className="text-sm text-destructive">{error}</p>
      </div>
    )
  }

  // Filter and order charts based on settings
  const chartTypes: ChartType[] = ['mood', 'craving', 'anxiety', 'sleep', 'overallDay']
  const visibleCharts = settings.chartOrder.filter((type) =>
    settings.visibleCharts.includes(type) && chartTypes.includes(type)
  )

  // No charts enabled
  if (visibleCharts.length === 0) {
    return (
      <div className={cn('rounded-xl border-2 border-dashed border-muted-foreground/30 p-8 text-center', className)}>
        <Star className="mx-auto mb-3 h-10 w-10 text-muted-foreground opacity-50" />
        <p className="text-sm font-medium text-muted-foreground">No charts enabled</p>
        <p className="text-xs text-muted-foreground opacity-75">
          Enable charts in settings to view your wellness data
        </p>
      </div>
    )
  }

  return (
    <div className={cn('space-y-3', className)}>
      {visibleCharts.map((chartType) => {
        const chartData = data[chartType]
        const config = CHART_CONFIGS[chartType]
        const Icon = CHART_ICONS[chartType]

        return (
          <AccordionChart
            key={chartType}
            id={chartType}
            title={config.title}
            icon={Icon}
            color={config.color}
            bgColor={config.bgColor}
            sparklineData={chartData.sparkline}
            fullData={chartData.full}
            average={chartData.average}
            trend={chartData.trend}
            latestValue={chartData.latestValue}
            missedDays={chartData.missedDays}
            isExpanded={expandedChart === chartType}
            onToggle={() => handleToggle(chartType)}
            showMissedDays={settings.showMissedDays}
            renderFullChart={renderFullChart(chartType)}
          />
        )
      })}
    </div>
  )
}

export default ChartAccordionGroup
