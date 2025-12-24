import { useState } from 'react'
import {
  Settings,
  Smile,
  Flame,
  AlertCircle,
  Moon,
  Star,
  GripVertical,
  Eye,
  EyeOff,
} from 'lucide-react'
import { ResponsiveModal } from '@/components/ui/responsive-modal'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import type { ChartType, ChartSettings } from '../../types'

// =============================================================================
// TYPES
// =============================================================================

export interface GraphSettingsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  settings: ChartSettings
  onSettingsChange: (settings: ChartSettings) => void
}

// =============================================================================
// CHART CONFIG
// =============================================================================

const CHART_OPTIONS: Array<{
  id: ChartType
  label: string
  icon: React.ReactNode
  color: string
}> = [
  { id: 'mood', label: 'Mood', icon: <Smile className="h-4 w-4" />, color: '#22c55e' },
  { id: 'craving', label: 'Craving', icon: <Flame className="h-4 w-4" />, color: '#f97316' },
  { id: 'anxiety', label: 'Anxiety', icon: <AlertCircle className="h-4 w-4" />, color: '#ef4444' },
  { id: 'sleep', label: 'Sleep', icon: <Moon className="h-4 w-4" />, color: '#6366f1' },
  { id: 'overallDay', label: 'Overall Day', icon: <Star className="h-4 w-4" />, color: '#eab308' },
]

// =============================================================================
// COMPONENT
// =============================================================================

export function GraphSettingsModal({
  open,
  onOpenChange,
  settings,
  onSettingsChange,
}: GraphSettingsModalProps) {
  const [localSettings, setLocalSettings] = useState<ChartSettings>(settings)

  const toggleChart = (chartType: ChartType) => {
    const newVisible = localSettings.visibleCharts.includes(chartType)
      ? localSettings.visibleCharts.filter((c) => c !== chartType)
      : [...localSettings.visibleCharts, chartType]

    setLocalSettings({
      ...localSettings,
      visibleCharts: newVisible,
    })
  }

  const handleSave = () => {
    onSettingsChange(localSettings)
    onOpenChange(false)
  }

  const handleReset = () => {
    const defaults: ChartSettings = {
      dateRange: '31d',
      visibleCharts: ['mood', 'craving', 'anxiety', 'sleep', 'overallDay'],
      chartOrder: ['mood', 'craving', 'anxiety', 'sleep', 'overallDay'],
      showTrendBadges: true,
      showMissedDays: true,
    }
    setLocalSettings(defaults)
  }

  return (
    <ResponsiveModal open={open} onOpenChange={onOpenChange} desktopSize="md">
      <div className="flex flex-col h-full bg-white overflow-hidden">
        <div className="px-4 py-3 border-b shrink-0">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Settings className="h-5 w-5 text-primary" />
            Graph Settings
          </h2>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Date Range */}
          <div className="space-y-2">
            <Label>Default Date Range</Label>
            <Select
              value={localSettings.dateRange}
              onValueChange={(value) =>
                setLocalSettings({
                  ...localSettings,
                  dateRange: value as ChartSettings['dateRange'],
                })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 Days</SelectItem>
                <SelectItem value="14d">Last 14 Days</SelectItem>
                <SelectItem value="31d">Last 31 Days</SelectItem>
                <SelectItem value="90d">Last 90 Days</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Visible Charts */}
          <div className="space-y-2">
            <Label>Visible Charts</Label>
            <div className="space-y-2">
              {CHART_OPTIONS.map((chart) => {
                const isVisible = localSettings.visibleCharts.includes(chart.id)

                return (
                  <button
                    key={chart.id}
                    onClick={() => toggleChart(chart.id)}
                    className={cn(
                      'w-full flex items-center justify-between rounded-lg border p-3 transition-all',
                      isVisible
                        ? 'border-primary/50 bg-primary/5'
                        : 'border-border bg-muted/30 opacity-60'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <GripVertical className="h-4 w-4 text-muted-foreground" />
                      <div
                        className="flex h-8 w-8 items-center justify-center rounded-full"
                        style={{ backgroundColor: `${chart.color}20`, color: chart.color }}
                      >
                        {chart.icon}
                      </div>
                      <span className="font-medium">{chart.label}</span>
                    </div>
                    {isVisible ? (
                      <Eye className="h-4 w-4 text-primary" />
                    ) : (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Toggle Options */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="showTrend">Show Trend Badges</Label>
              <Switch
                id="showTrend"
                checked={localSettings.showTrendBadges}
                onCheckedChange={(checked) =>
                  setLocalSettings({ ...localSettings, showTrendBadges: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="showMissed">Show Missed Days</Label>
              <Switch
                id="showMissed"
                checked={localSettings.showMissedDays}
                onCheckedChange={(checked) =>
                  setLocalSettings({ ...localSettings, showMissedDays: checked })
                }
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 mt-4">
          <Button onClick={handleSave} className="flex-1">
            Save Settings
          </Button>
          <Button variant="outline" onClick={handleReset}>
            Reset
          </Button>
        </div>
      </div>
    </ResponsiveModal>
  )
}

export default GraphSettingsModal
