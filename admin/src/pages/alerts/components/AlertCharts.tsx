/**
 * AlertCharts Component
 * Phase 8E: Admin Crisis Dashboard
 *
 * Analytics charts for crisis alerts:
 * 1. Line chart: Alerts over time
 * 2. Pie/Donut chart: Alerts by source
 * 3. Bar chart: Alerts by tier
 * 4. Bar chart: Response time distribution
 */

import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { format, subDays, differenceInMinutes } from 'date-fns'
import type { AlertChartsProps } from '../types'

// Colors for charts
const COLORS = {
  tier: {
    1: '#ef4444', // red
    2: '#f97316', // orange
    3: '#eab308', // yellow
    4: '#3b82f6', // blue
  },
  source: {
    sos: '#ef4444', // red
    ai: '#a855f7', // purple
    checkin: '#14b8a6', // teal
  },
  responseTime: {
    fast: '#22c55e', // green
    medium: '#eab308', // yellow
    slow: '#f97316', // orange
    verySlowж: '#ef4444', // red
  },
}

export function AlertCharts({
  alerts,
  dateRange,
  loading = false,
}: AlertChartsProps) {
  // Process data for charts
  const chartData = useMemo(() => {
    // Alerts over time (group by day)
    const timelineData: Record<string, { date: string; count: number }> = {}
    const today = new Date()

    // Initialize all days in range
    for (let i = dateRange - 1; i >= 0; i--) {
      const date = subDays(today, i)
      const key = format(date, 'MMM d')
      timelineData[key] = { date: key, count: 0 }
    }

    // Count alerts per day
    alerts.forEach((alert) => {
      const alertDate = alert.createdAt?.toDate?.()
      if (alertDate) {
        const key = format(alertDate, 'MMM d')
        if (timelineData[key]) {
          timelineData[key].count++
        }
      }
    })

    const alertsOverTime = Object.values(timelineData)

    // Alerts by source
    const bySource = [
      {
        name: 'SOS',
        value: alerts.filter((a) => a.source === 'sos').length,
        color: COLORS.source.sos,
      },
      {
        name: 'AI Crisis',
        value: alerts.filter((a) => a.source === 'ai').length,
        color: COLORS.source.ai,
      },
      {
        name: 'Check-in',
        value: alerts.filter((a) => a.source === 'checkin').length,
        color: COLORS.source.checkin,
      },
    ].filter((d) => d.value > 0)

    // Alerts by tier
    const byTier = [
      {
        name: 'Critical',
        value: alerts.filter((a) => a.tier === 1).length,
        color: COLORS.tier[1],
      },
      {
        name: 'High',
        value: alerts.filter((a) => a.tier === 2).length,
        color: COLORS.tier[2],
      },
      {
        name: 'Moderate',
        value: alerts.filter((a) => a.tier === 3).length,
        color: COLORS.tier[3],
      },
      {
        name: 'Standard',
        value: alerts.filter((a) => a.tier === 4).length,
        color: COLORS.tier[4],
      },
    ]

    // Response time distribution
    const responseTimeDistribution = {
      '<5 min': 0,
      '5-15 min': 0,
      '15-60 min': 0,
      '>1 hour': 0,
    }

    alerts.forEach((alert) => {
      if (alert.acknowledgedAt && alert.createdAt) {
        const created = alert.createdAt.toDate?.()
        const acknowledged = alert.acknowledgedAt.toDate?.()
        if (created && acknowledged) {
          const minutes = differenceInMinutes(acknowledged, created)
          if (minutes < 5) responseTimeDistribution['<5 min']++
          else if (minutes < 15) responseTimeDistribution['5-15 min']++
          else if (minutes < 60) responseTimeDistribution['15-60 min']++
          else responseTimeDistribution['>1 hour']++
        }
      }
    })

    const responseTime = [
      { name: '<5 min', value: responseTimeDistribution['<5 min'], color: '#22c55e' },
      { name: '5-15 min', value: responseTimeDistribution['5-15 min'], color: '#eab308' },
      { name: '15-60 min', value: responseTimeDistribution['15-60 min'], color: '#f97316' },
      { name: '>1 hour', value: responseTimeDistribution['>1 hour'], color: '#ef4444' },
    ]

    return { alertsOverTime, bySource, byTier, responseTime }
  }, [alerts, dateRange])

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-5 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-[200px] w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Alerts Over Time */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Alerts Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData.alertsOverTime}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12 }}
                className="text-gray-500"
              />
              <YAxis
                tick={{ fontSize: 12 }}
                allowDecimals={false}
                className="text-gray-500"
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                }}
              />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#0d9488"
                strokeWidth={2}
                dot={{ fill: '#0d9488', strokeWidth: 2 }}
                name="Alerts"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Alerts by Source */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Alerts by Source</CardTitle>
        </CardHeader>
        <CardContent>
          {chartData.bySource.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={chartData.bySource}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, percent }) =>
                    `${name} ${((percent || 0) * 100).toFixed(0)}%`
                  }
                  labelLine={false}
                >
                  {chartData.bySource.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[200px] flex items-center justify-center text-gray-400">
              No data available
            </div>
          )}
        </CardContent>
      </Card>

      {/* Alerts by Tier */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Alerts by Tier</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData.byTier} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200" />
              <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12 }} />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fontSize: 12 }}
                width={70}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                }}
              />
              <Bar dataKey="value" name="Count" radius={[0, 4, 4, 0]}>
                {chartData.byTier.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Response Time Distribution */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">
            Response Time Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData.responseTime}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                }}
              />
              <Bar dataKey="value" name="Alerts" radius={[4, 4, 0, 0]}>
                {chartData.responseTime.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}

export default AlertCharts
