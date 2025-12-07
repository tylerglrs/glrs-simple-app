import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"
import { type CheckInDataPoint, formatChartDate } from "./types"

interface TrendChartProps {
  title: string
  data: CheckInDataPoint[]
  dataKey: keyof Pick<CheckInDataPoint, "mood" | "cravings" | "anxiety" | "sleep">
  color: string
  loading?: boolean
  invertTrend?: boolean // For cravings/anxiety, lower is better
}

export function TrendChart({
  title,
  data,
  dataKey,
  color,
  loading = false,
  invertTrend = false,
}: TrendChartProps) {
  // Calculate trend (comparing last 7 days to previous 7 days)
  const calculateTrend = (): { direction: "up" | "down" | "flat"; change: number } => {
    if (data.length < 7) return { direction: "flat", change: 0 }

    const midpoint = Math.floor(data.length / 2)
    const recentData = data.slice(midpoint)
    const previousData = data.slice(0, midpoint)

    const recentAvg =
      recentData.reduce((sum, d) => sum + (d[dataKey] || 0), 0) / recentData.length
    const previousAvg =
      previousData.reduce((sum, d) => sum + (d[dataKey] || 0), 0) / previousData.length

    const change = Math.round((recentAvg - previousAvg) * 10) / 10

    if (Math.abs(change) < 0.3) return { direction: "flat", change: 0 }
    return { direction: change > 0 ? "up" : "down", change: Math.abs(change) }
  }

  const trend = calculateTrend()

  // Determine if trend is good or bad
  const isPositiveTrend = invertTrend
    ? trend.direction === "down" // For cravings/anxiety, down is good
    : trend.direction === "up" // For mood/sleep, up is good

  const TrendIcon =
    trend.direction === "flat" ? Minus : trend.direction === "up" ? TrendingUp : TrendingDown

  const trendColor = trend.direction === "flat" ? "#9CA3AF" : isPositiveTrend ? "#00A86B" : "#EF4444"

  // Calculate current average
  const currentAvg =
    data.length > 0
      ? Math.round((data.reduce((sum, d) => sum + (d[dataKey] || 0), 0) / data.length) * 10) / 10
      : 0

  if (loading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <Skeleton className="h-5 w-24" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[180px] w-full" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold" style={{ color }}>
              {currentAvg}
            </span>
            <span className="text-xs text-muted-foreground">/10</span>
            {trend.direction !== "flat" && (
              <div className="flex items-center gap-0.5" style={{ color: trendColor }}>
                <TrendIcon className="h-4 w-4" />
                <span className="text-xs font-medium">{trend.change}</span>
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="flex h-[180px] items-center justify-center text-sm text-muted-foreground">
            No data available
          </div>
        ) : (
          <div className="h-[180px] w-full relative" style={{ minWidth: 0, minHeight: 180 }}>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart
                data={data}
                margin={{ top: 5, right: 10, left: -20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                <XAxis
                  dataKey="date"
                  tickFormatter={formatChartDate}
                  tick={{ fontSize: 10, fill: "#9CA3AF" }}
                  tickLine={false}
                  axisLine={{ stroke: "#e5e7eb" }}
                  interval="preserveStartEnd"
                />
                <YAxis
                  domain={[0, 10]}
                  tick={{ fontSize: 10, fill: "#9CA3AF" }}
                  tickLine={false}
                  axisLine={false}
                  ticks={[0, 2.5, 5, 7.5, 10]}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #e5e7eb",
                    borderRadius: "6px",
                    fontSize: "12px",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                  }}
                  labelFormatter={(label) => formatChartDate(label as string)}
                  formatter={(value: number) => [
                    `${value}/10`,
                    title.replace(" Trend", ""),
                  ]}
                />
                <ReferenceLine y={5} stroke="#e5e7eb" strokeDasharray="3 3" />
                <Line
                  type="monotone"
                  dataKey={dataKey}
                  stroke={color}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, fill: color }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default TrendChart
