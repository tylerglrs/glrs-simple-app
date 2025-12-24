/**
 * =============================================================================
 * DATA QUALITY DASHBOARD - Phase F5
 * =============================================================================
 *
 * Admin dashboard component for monitoring meeting data quality.
 * Displays quality metrics, score distribution, issues, and low-quality meetings.
 *
 * Features:
 * - Overall quality statistics
 * - Score distribution chart
 * - Top issues breakdown
 * - Source-by-source analysis
 * - Lowest quality meetings list
 *
 * =============================================================================
 */

import { useMemo, useState } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts'
import {
  AlertTriangle,
  CheckCircle,
  MapPin,
  TrendingUp,
  AlertCircle,
  Info,
  Target,
  Activity,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { cn } from '@/lib/utils'
import type { Meeting } from '../types'
import {
  calculateDataQualityStats,
  getGradeColor,
  getSeverityColor,
  formatScore,
  DATA_QUALITY_TARGETS,
  type DataQualityStats,
} from '../utils/dataQuality'

// =============================================================================
// TYPES
// =============================================================================

interface DataQualityDashboardProps {
  meetings: Partial<Meeting>[]
  className?: string
  compact?: boolean
}

// =============================================================================
// CHART COLORS
// =============================================================================

const GRADE_COLORS = {
  A: '#22c55e', // green-500
  B: '#3b82f6', // blue-500
  C: '#eab308', // yellow-500
  D: '#f97316', // orange-500
  F: '#ef4444', // red-500
}

const SOURCE_COLORS = [
  '#069494', // teal (brand)
  '#3b82f6', // blue
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#f97316', // orange
  '#22c55e', // green
  '#6366f1', // indigo
  '#14b8a6', // cyan
]

// =============================================================================
// STAT CARD COMPONENT
// =============================================================================

interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: React.ReactNode
  trend?: 'up' | 'down' | 'neutral'
  target?: number
  current?: number
  className?: string
}

function StatCard({ title, value, subtitle, icon, trend, target, current, className }: StatCardProps) {
  const showProgress = target !== undefined && current !== undefined
  const meetsTarget = current !== undefined && target !== undefined && current >= target

  return (
    <Card className={cn('', className)}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">{title}</p>
            <div className="flex items-baseline gap-2">
              <p className="text-2xl font-bold">{value}</p>
              {trend && (
                <TrendingUp
                  className={cn(
                    'h-4 w-4',
                    trend === 'up' && 'text-green-500',
                    trend === 'down' && 'text-red-500 rotate-180',
                    trend === 'neutral' && 'text-muted-foreground'
                  )}
                />
              )}
            </div>
            {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
          </div>
          <div className={cn(
            'p-2 rounded-lg',
            meetsTarget ? 'bg-green-100 text-green-600' : 'bg-muted text-muted-foreground'
          )}>
            {icon}
          </div>
        </div>
        {showProgress && (
          <div className="mt-3 space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Target: {target}%</span>
              {meetsTarget ? (
                <span className="text-green-600 flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" /> Met
                </span>
              ) : (
                <span className="text-amber-600 flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" /> {(target - (current || 0)).toFixed(1)}% to go
                </span>
              )}
            </div>
            <Progress value={current} className="h-2" />
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function DataQualityDashboard({ meetings, className, compact = false }: DataQualityDashboardProps) {
  const [showLowQuality, setShowLowQuality] = useState(false)
  const [showBySource, setShowBySource] = useState(false)

  // Calculate statistics
  const stats = useMemo(() => {
    return calculateDataQualityStats(meetings)
  }, [meetings])

  // Prepare chart data
  const gradeDistributionData = useMemo(() => {
    return [
      { grade: 'A', count: stats.scoreDistribution.A, color: GRADE_COLORS.A },
      { grade: 'B', count: stats.scoreDistribution.B, color: GRADE_COLORS.B },
      { grade: 'C', count: stats.scoreDistribution.C, color: GRADE_COLORS.C },
      { grade: 'D', count: stats.scoreDistribution.D, color: GRADE_COLORS.D },
      { grade: 'F', count: stats.scoreDistribution.F, color: GRADE_COLORS.F },
    ]
  }, [stats.scoreDistribution])

  const sourceData = useMemo(() => {
    return Object.entries(stats.bySource).map(([source, data], index) => ({
      source,
      ...data,
      color: SOURCE_COLORS[index % SOURCE_COLORS.length],
    }))
  }, [stats.bySource])

  if (meetings.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            <Activity className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No meetings to analyze</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Data Quality Dashboard</h2>
          <p className="text-sm text-muted-foreground">
            Monitoring {stats.totalMeetings.toLocaleString()} meetings
          </p>
        </div>
        <Badge variant={stats.meetsCoordinateTarget ? 'default' : 'destructive'}>
          {stats.meetsCoordinateTarget ? 'Meeting Targets' : 'Below Targets'}
        </Badge>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Coordinate Coverage"
          value={`${stats.coordinatePercentage}%`}
          subtitle={`${stats.withCoordinates.toLocaleString()} of ${stats.totalMeetings.toLocaleString()}`}
          icon={<MapPin className="h-5 w-5" />}
          target={DATA_QUALITY_TARGETS.coordinatePercentage}
          current={stats.coordinatePercentage}
        />
        <StatCard
          title="Average Score"
          value={formatScore(stats.averageScore)}
          subtitle={`Median: ${formatScore(stats.medianScore)}`}
          icon={<Target className="h-5 w-5" />}
          target={DATA_QUALITY_TARGETS.averageScore}
          current={stats.averageScore}
        />
        <StatCard
          title="High Quality (A/B)"
          value={(stats.scoreDistribution.A + stats.scoreDistribution.B).toLocaleString()}
          subtitle={`${Math.round(((stats.scoreDistribution.A + stats.scoreDistribution.B) / stats.totalMeetings) * 100)}% of meetings`}
          icon={<CheckCircle className="h-5 w-5" />}
        />
        <StatCard
          title="Needs Attention"
          value={(stats.scoreDistribution.D + stats.scoreDistribution.F).toLocaleString()}
          subtitle={`${Math.round(((stats.scoreDistribution.D + stats.scoreDistribution.F) / stats.totalMeetings) * 100)}% of meetings`}
          icon={<AlertTriangle className="h-5 w-5" />}
        />
      </div>

      {!compact && (
        <>
          {/* Charts Row */}
          <div className="grid gap-4 lg:grid-cols-2">
            {/* Grade Distribution */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Grade Distribution</CardTitle>
                <CardDescription>Quality scores grouped by letter grade</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={gradeDistributionData} margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="grade" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload
                            return (
                              <div className="bg-background border rounded-lg shadow-lg p-2 text-sm">
                                <p className="font-medium">Grade {data.grade}</p>
                                <p className="text-muted-foreground">{data.count} meetings</p>
                              </div>
                            )
                          }
                          return null
                        }}
                      />
                      <Bar
                        dataKey="count"
                        fill="currentColor"
                        radius={[4, 4, 0, 0]}
                        className="fill-primary"
                      >
                        {gradeDistributionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Top Issues */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Top Quality Issues</CardTitle>
                <CardDescription>Most common data quality problems</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-64">
                  <div className="space-y-3">
                    {stats.topIssues.map((issue, index) => (
                      <div key={issue.field} className="flex items-center gap-3">
                        <div className="w-6 text-center text-sm text-muted-foreground">
                          {index + 1}.
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium capitalize">{issue.field}</span>
                            <span className="text-sm text-muted-foreground">
                              {issue.count.toLocaleString()} ({issue.percentage}%)
                            </span>
                          </div>
                          <Progress value={issue.percentage} className="h-2 mt-1" />
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* By Source Breakdown */}
          <Collapsible open={showBySource} onOpenChange={setShowBySource}>
            <Card>
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base">Quality by Source</CardTitle>
                      <CardDescription>Breakdown by meeting program/intergroup</CardDescription>
                    </div>
                    {showBySource ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </div>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="pt-0">
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {sourceData.map((source) => (
                      <div
                        key={source.source}
                        className="p-3 rounded-lg border"
                        style={{ borderLeftColor: source.color, borderLeftWidth: 4 }}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-sm">{source.source}</span>
                          <Badge variant="outline">{source.count} meetings</Badge>
                        </div>
                        <div className="mt-2 space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">Avg Score</span>
                            <span className={cn(
                              'font-medium',
                              source.avgScore >= 80 && 'text-green-600',
                              source.avgScore >= 60 && source.avgScore < 80 && 'text-yellow-600',
                              source.avgScore < 60 && 'text-red-600'
                            )}>
                              {source.avgScore}%
                            </span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">With Coords</span>
                            <span>
                              {Math.round((source.withCoords / source.count) * 100)}%
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>

          {/* Lowest Quality Meetings */}
          <Collapsible open={showLowQuality} onOpenChange={setShowLowQuality}>
            <Card>
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-amber-500" />
                        Lowest Quality Meetings
                      </CardTitle>
                      <CardDescription>Top 20 meetings needing attention</CardDescription>
                    </div>
                    {showLowQuality ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </div>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="pt-0">
                  <ScrollArea className="h-80">
                    <div className="space-y-2">
                      {stats.lowestQualityMeetings.map((meeting, index) => (
                        <div
                          key={meeting.id || index}
                          className="p-3 rounded-lg border bg-muted/30"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm truncate">{meeting.name}</p>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {meeting.issues.slice(0, 3).map((issue, i) => (
                                  <Badge
                                    key={i}
                                    variant="outline"
                                    className={cn('text-xs', getSeverityColor(issue.severity))}
                                  >
                                    {issue.field}
                                  </Badge>
                                ))}
                                {meeting.issues.length > 3 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{meeting.issues.length - 3} more
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <Badge className={getGradeColor(meeting.score >= 60 ? 'D' : 'F')}>
                              {meeting.score}%
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>
        </>
      )}

      {/* Info Footer */}
      <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/50 text-sm text-muted-foreground">
        <Info className="h-4 w-4 mt-0.5 shrink-0" />
        <div>
          <p>
            Data quality is scored on a 100-point scale: Coordinates (25pts), Type Codes (20pts),
            Address (20pts), Virtual Info (15pts), Notes (10pts), Phone (10pts).
          </p>
          <p className="mt-1">
            Targets: {DATA_QUALITY_TARGETS.coordinatePercentage}% coordinate coverage,
            {DATA_QUALITY_TARGETS.averageScore}% average score.
          </p>
        </div>
      </div>
    </div>
  )
}

export default DataQualityDashboard
