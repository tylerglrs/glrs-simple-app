import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts"
import { CheckCircle2 } from "lucide-react"
import { type ComplianceData, CHART_COLORS } from "./types"

interface ComplianceChartProps {
  data: ComplianceData
  loading?: boolean
}

export function ComplianceChart({ data, loading = false }: ComplianceChartProps) {
  // Determine compliance level
  const getComplianceLevel = (percentage: number) => {
    if (percentage >= 80) return { label: "Excellent", color: CHART_COLORS.compliant }
    if (percentage >= 50) return { label: "Moderate", color: CHART_COLORS.partial }
    return { label: "Needs Attention", color: CHART_COLORS.noncompliant }
  }

  const level = getComplianceLevel(data.percentage)

  // Chart data
  const chartData = [
    { name: "Completed", value: data.actual, color: level.color },
    { name: "Missing", value: Math.max(0, data.expected - data.actual), color: "#e5e7eb" },
  ]

  if (loading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <Skeleton className="h-5 w-32" />
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Skeleton className="h-[120px] w-[120px] rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <CheckCircle2 className="h-4 w-4 text-primary" />
          Check-in Compliance
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4">
          {/* Donut Chart */}
          <div className="relative h-[120px] w-[120px]" style={{ minWidth: 120, minHeight: 120 }}>
            <ResponsiveContainer width={120} height={120}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={35}
                  outerRadius={50}
                  paddingAngle={2}
                  dataKey="value"
                  startAngle={90}
                  endAngle={-270}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            {/* Center percentage */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold" style={{ color: level.color }}>
                {Math.round(data.percentage)}%
              </span>
            </div>
          </div>

          {/* Stats */}
          <div className="flex-1 space-y-2">
            <div
              className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
              style={{ backgroundColor: `${level.color}20`, color: level.color }}
            >
              {level.label}
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Completed</span>
                <span className="font-medium">{data.actual}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Expected</span>
                <span className="font-medium">{data.expected}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Missing</span>
                <span className="font-medium text-red-500">
                  {Math.max(0, data.expected - data.actual)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default ComplianceChart
