import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Activity, RefreshCw } from "lucide-react"
import { db } from "@/lib/firebase"
import { collection, query, where, orderBy, getDocs, Timestamp } from "firebase/firestore"
import { TrendChart } from "./TrendChart"
import { ComplianceChart } from "./ComplianceChart"
import { StatusDistribution } from "./StatusDistribution"
import {
  type CheckInDataPoint,
  type ComplianceData,
  type StatusDistributionData,
  type TimeRange,
  type RawCheckIn,
  TIME_RANGE_OPTIONS,
  CHART_COLORS,
  toDate,
  average,
} from "./types"

const CURRENT_TENANT = "full-service"

interface DashboardChartsProps {
  pirIds?: string[]
  className?: string
}

export function DashboardCharts({ pirIds = [], className = "" }: DashboardChartsProps) {
  // State
  const [timeRange, setTimeRange] = useState<TimeRange>(30)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [chartData, setChartData] = useState<CheckInDataPoint[]>([])
  const [complianceData, setComplianceData] = useState<ComplianceData>({
    expected: 0,
    actual: 0,
    percentage: 0,
  })
  const [statusData, setStatusData] = useState<StatusDistributionData>({
    active: 0,
    inactive: 0,
    critical: 0,
    total: 0,
  })

  // Load chart data
  const loadChartData = useCallback(async () => {
    setLoading(true)
    try {
      // Calculate date range
      const endDate = new Date()
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - timeRange)
      startDate.setHours(0, 0, 0, 0)

      // Fetch check-ins within date range
      let checkInsQuery = query(
        collection(db, "checkIns"),
        where("createdAt", ">=", Timestamp.fromDate(startDate)),
        where("createdAt", "<=", Timestamp.fromDate(endDate)),
        orderBy("createdAt", "asc")
      )

      const checkInsSnap = await getDocs(checkInsQuery)

      // Process check-ins into raw data
      const rawCheckIns: RawCheckIn[] = []
      checkInsSnap.forEach((doc) => {
        const data = doc.data()
        // Filter by PIR IDs if provided
        if (pirIds.length > 0 && !pirIds.includes(data.userId)) return

        rawCheckIns.push({
          id: doc.id,
          userId: data.userId,
          mood: data.mood,
          cravings: data.cravings || data.craving,
          anxiety: data.anxiety,
          sleep: data.sleep || data.sleepQuality,
          createdAt: data.createdAt,
        })
      })

      // Aggregate by date
      const byDate = new Map<
        string,
        { mood: number[]; cravings: number[]; anxiety: number[]; sleep: number[] }
      >()

      rawCheckIns.forEach((ci) => {
        const date = toDate(ci.createdAt)
        if (!date) return

        const dateKey = date.toISOString().split("T")[0]

        if (!byDate.has(dateKey)) {
          byDate.set(dateKey, { mood: [], cravings: [], anxiety: [], sleep: [] })
        }

        const entry = byDate.get(dateKey)!
        if (ci.mood != null) entry.mood.push(ci.mood)
        if (ci.cravings != null) entry.cravings.push(ci.cravings)
        if (ci.anxiety != null) entry.anxiety.push(ci.anxiety)
        if (ci.sleep != null) entry.sleep.push(ci.sleep)
      })

      // Convert to chart data
      const aggregatedData: CheckInDataPoint[] = Array.from(byDate.entries())
        .map(([date, values]) => ({
          date,
          mood: average(values.mood),
          cravings: average(values.cravings),
          anxiety: average(values.anxiety),
          sleep: average(values.sleep),
          count: values.mood.length,
        }))
        .sort((a, b) => a.date.localeCompare(b.date))

      setChartData(aggregatedData)

      // Calculate compliance
      const numberOfPIRs = pirIds.length > 0 ? pirIds.length : await getActivePIRCount()
      const expectedCheckIns = numberOfPIRs * timeRange
      const actualCheckIns = rawCheckIns.length
      const compliancePercentage =
        expectedCheckIns > 0 ? (actualCheckIns / expectedCheckIns) * 100 : 0

      setComplianceData({
        expected: expectedCheckIns,
        actual: actualCheckIns,
        percentage: Math.min(100, compliancePercentage),
      })

      // Get PIR status distribution
      await loadStatusDistribution()
    } catch (error) {
      console.error("Error loading chart data:", error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [timeRange, pirIds])

  // Get count of active PIRs
  const getActivePIRCount = async (): Promise<number> => {
    try {
      const usersSnap = await getDocs(
        query(
          collection(db, "users"),
          where("tenantId", "==", CURRENT_TENANT),
          where("role", "==", "pir"),
          where("active", "==", true)
        )
      )
      return usersSnap.size
    } catch {
      return 1
    }
  }

  // Load PIR status distribution
  const loadStatusDistribution = async () => {
    try {
      // Get all PIRs
      const pirsSnap = await getDocs(
        query(
          collection(db, "users"),
          where("tenantId", "==", CURRENT_TENANT),
          where("role", "==", "pir")
        )
      )

      let active = 0
      let inactive = 0
      let critical = 0

      // Get recent alerts to identify critical PIRs
      const recentAlertsSnap = await getDocs(
        query(
          collection(db, "alerts"),
          where("tenantId", "==", CURRENT_TENANT),
          where("status", "==", "active"),
          where("severity", "==", "high")
        )
      )

      const criticalPirIds = new Set<string>()
      recentAlertsSnap.forEach((doc) => {
        const data = doc.data()
        if (data.userId || data.pirId) {
          criticalPirIds.add(data.userId || data.pirId)
        }
      })

      pirsSnap.forEach((doc) => {
        const data = doc.data()
        if (criticalPirIds.has(doc.id)) {
          critical++
        } else if (data.active === true) {
          active++
        } else {
          inactive++
        }
      })

      setStatusData({
        active,
        inactive,
        critical,
        total: active + inactive + critical,
      })
    } catch (error) {
      console.error("Error loading status distribution:", error)
    }
  }

  useEffect(() => {
    loadChartData()
  }, [loadChartData])

  // Handle refresh
  const handleRefresh = () => {
    setRefreshing(true)
    loadChartData()
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Activity className="h-5 w-5 text-primary" />
            Program Analytics
          </CardTitle>

          <div className="flex items-center gap-2">
            {/* Time Range Selector */}
            <Select
              value={timeRange.toString()}
              onValueChange={(v) => setTimeRange(parseInt(v) as TimeRange)}
            >
              <SelectTrigger className="h-8 w-[110px]">
                <SelectValue placeholder="Time range" />
              </SelectTrigger>
              <SelectContent>
                {TIME_RANGE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value.toString()}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Refresh Button */}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Trend Charts Grid */}
        <div className="grid gap-4 sm:grid-cols-2">
          <TrendChart
            title="Mood Trend"
            data={chartData}
            dataKey="mood"
            color={CHART_COLORS.mood}
            loading={loading}
          />
          <TrendChart
            title="Craving Trend"
            data={chartData}
            dataKey="cravings"
            color={CHART_COLORS.cravings}
            loading={loading}
            invertTrend
          />
          <TrendChart
            title="Anxiety Trend"
            data={chartData}
            dataKey="anxiety"
            color={CHART_COLORS.anxiety}
            loading={loading}
            invertTrend
          />
          <TrendChart
            title="Sleep Quality"
            data={chartData}
            dataKey="sleep"
            color={CHART_COLORS.sleep}
            loading={loading}
          />
        </div>

        {/* Bottom Row - Compliance and Status */}
        <div className="grid gap-4 sm:grid-cols-2">
          <ComplianceChart data={complianceData} loading={loading} />
          <StatusDistribution data={statusData} loading={loading} />
        </div>
      </CardContent>
    </Card>
  )
}

export default DashboardCharts
