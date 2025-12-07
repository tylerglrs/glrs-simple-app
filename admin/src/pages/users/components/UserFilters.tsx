import { TabType, StatusFilter, ComplianceFilter } from "../types"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Users, UserCog, Shield, Plus } from "lucide-react"

interface UserFiltersProps {
  activeTab: TabType
  onTabChange: (tab: TabType) => void
  statusFilter: StatusFilter
  onStatusFilterChange: (filter: StatusFilter) => void
  complianceFilter: ComplianceFilter
  onComplianceFilterChange: (filter: ComplianceFilter) => void
  counts: {
    pir: number
    coach: number
    admin: number
  }
  onCreateUser: () => void
}

export function UserFilters({
  activeTab,
  onTabChange,
  statusFilter,
  onStatusFilterChange,
  complianceFilter,
  onComplianceFilterChange,
  counts,
  onCreateUser,
}: UserFiltersProps) {
  return (
    <div className="space-y-4">
      {/* Tabs and Create Button */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Tabs value={activeTab} onValueChange={(v) => onTabChange(v as TabType)}>
          <TabsList className="grid w-full grid-cols-3 sm:w-auto">
            <TabsTrigger value="pir" className="gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">PIRs</span>
              <Badge variant="secondary" className="ml-1 bg-muted">
                {counts.pir}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="coach" className="gap-2">
              <UserCog className="h-4 w-4" />
              <span className="hidden sm:inline">Coaches</span>
              <Badge variant="secondary" className="ml-1 bg-muted">
                {counts.coach}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="admin" className="gap-2">
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">Admins</span>
              <Badge variant="secondary" className="ml-1 bg-muted">
                {counts.admin}
              </Badge>
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <Button onClick={onCreateUser} className="gap-2">
          <Plus className="h-4 w-4" />
          Create User
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        {/* Status Filter */}
        <Select value={statusFilter} onValueChange={(v) => onStatusFilterChange(v as StatusFilter)}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            {activeTab === "pir" && <SelectItem value="critical">Critical</SelectItem>}
          </SelectContent>
        </Select>

        {/* Compliance Filter - PIRs only */}
        {activeTab === "pir" && (
          <Select
            value={complianceFilter}
            onValueChange={(v) => onComplianceFilterChange(v as ComplianceFilter)}
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Compliance" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Compliance</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
        )}
      </div>
    </div>
  )
}

// Skeleton loader for filters
export function UserFiltersSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-2">
          <div className="h-10 w-24 animate-pulse rounded-md bg-muted" />
          <div className="h-10 w-24 animate-pulse rounded-md bg-muted" />
          <div className="h-10 w-24 animate-pulse rounded-md bg-muted" />
        </div>
        <div className="h-10 w-32 animate-pulse rounded-md bg-muted" />
      </div>
      <div className="flex gap-3">
        <div className="h-10 w-36 animate-pulse rounded-md bg-muted" />
        <div className="h-10 w-40 animate-pulse rounded-md bg-muted" />
      </div>
    </div>
  )
}
