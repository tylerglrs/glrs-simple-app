import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"
import { Users } from "lucide-react"
import { type StatusDistributionData, CHART_COLORS } from "./types"

interface StatusDistributionProps {
  data: StatusDistributionData
  loading?: boolean
}

export function StatusDistribution({ data, loading = false }: StatusDistributionProps) {
  // Chart data
  const chartData = [
    { name: "Active", value: data.active, color: CHART_COLORS.active },
    { name: "Inactive", value: data.inactive, color: CHART_COLORS.inactive },
    { name: "Critical", value: data.critical, color: CHART_COLORS.critical },
  ].filter((d) => d.value > 0)

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
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-24" />
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
          <Users className="h-4 w-4 text-primary" />
          PIR Status Distribution
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4">
          {/* Pie Chart */}
          <div className="h-[120px] w-[120px]" style={{ minWidth: 120, minHeight: 120 }}>
            <ResponsiveContainer width={120} height={120}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={0}
                  outerRadius={50}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #e5e7eb",
                    borderRadius: "6px",
                    fontSize: "12px",
                  }}
                  formatter={(value: number, name: string) => [`${value} PIRs`, name]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Legend */}
          <div className="flex-1 space-y-2">
            <div className="text-center">
              <span className="text-3xl font-bold text-foreground">{data.total}</span>
              <span className="ml-1 text-sm text-muted-foreground">Total PIRs</span>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <div
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: CHART_COLORS.active }}
                />
                <span className="flex-1 text-sm text-muted-foreground">Active</span>
                <span className="font-medium">{data.active}</span>
              </div>

              <div className="flex items-center gap-2">
                <div
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: CHART_COLORS.inactive }}
                />
                <span className="flex-1 text-sm text-muted-foreground">Inactive</span>
                <span className="font-medium">{data.inactive}</span>
              </div>

              {data.critical > 0 && (
                <div className="flex items-center gap-2">
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: CHART_COLORS.critical }}
                  />
                  <span className="flex-1 text-sm text-muted-foreground">Critical</span>
                  <span className="font-medium text-red-500">{data.critical}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default StatusDistribution
