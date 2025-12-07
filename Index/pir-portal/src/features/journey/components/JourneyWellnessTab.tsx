import { Loader2, AlertCircle, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import ChartAccordionGroup from './ChartAccordionGroup'
import { useChartData, CHART_CONFIGS } from '../hooks/useChartData'
import type { ChartType } from '../types'

// =============================================================================
// COMPONENT
// =============================================================================

export function JourneyWellnessTab() {
  const isMobile = useMediaQuery('(max-width: 768px)')
  const { data, loading, error } = useChartData()

  // Loading state
  if (loading) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Loading wellness data...</p>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center gap-4 p-5">
        <AlertCircle className="h-12 w-12 text-destructive" />
        <p className="text-center text-destructive">{error}</p>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    )
  }

  return (
    <div className={cn('pb-8', isMobile ? 'px-4' : 'mx-auto max-w-xl px-5')}>
      {/* Header */}
      <div className="mb-4 flex items-center justify-between py-4">
        <h3 className="text-lg font-semibold text-foreground">Wellness Tracking</h3>
        <Button variant="outline" size="sm" className="h-8 text-xs">
          <Settings className="mr-1 h-3 w-3" />
          Settings
        </Button>
      </div>

      {/* Quick Stats Row */}
      <div className="mb-6 grid grid-cols-3 gap-3">
        {(['mood', 'craving', 'sleep'] as ChartType[]).map((type) => {
          const chartData = data[type]
          const config = CHART_CONFIGS[type]
          return (
            <div
              key={type}
              className="rounded-lg p-3 text-center"
              style={{ backgroundColor: config.bgColor }}
            >
              <p className="text-xs text-muted-foreground">{config.title}</p>
              <p
                className="text-xl font-bold"
                style={{ color: config.color }}
              >
                {chartData.latestValue !== null ? chartData.latestValue : '-'}
              </p>
            </div>
          )
        })}
      </div>

      {/* Chart Accordion Group - All 5 charts */}
      <ChartAccordionGroup />
    </div>
  )
}

export default JourneyWellnessTab
