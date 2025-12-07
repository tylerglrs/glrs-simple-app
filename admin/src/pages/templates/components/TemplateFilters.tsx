import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Search,
  FileText,
  BookOpen,
  FileType2,
  AlignLeft,
  FileOutput,
  Upload,
  LayoutGrid,
} from "lucide-react"
import type { Template, TemplateType, TemplateStatus } from "../types"
import { TEMPLATE_CATEGORIES } from "../constants"

interface TemplateFiltersProps {
  searchQuery: string
  onSearchChange: (value: string) => void
  filterType: TemplateType | "all"
  onTypeChange: (value: TemplateType | "all") => void
  filterStatus: TemplateStatus | "all"
  onStatusChange: (value: TemplateStatus | "all") => void
  filterCategory: string
  onCategoryChange: (value: string) => void
  templates: Template[]
}

// Template type configuration for tabs
const TEMPLATE_TYPES: Array<{
  key: TemplateType | "all"
  label: string
  icon: React.ElementType
}> = [
  { key: "all", label: "All Templates", icon: LayoutGrid },
  { key: "document", label: "Documents", icon: FileText },
  { key: "cover", label: "Cover Pages", icon: BookOpen },
  { key: "header", label: "Headers", icon: FileType2 },
  { key: "footer", label: "Footers", icon: AlignLeft },
  { key: "endPage", label: "End Pages", icon: FileOutput },
  { key: "uploaded", label: "Uploaded", icon: Upload },
]

// Status options
const STATUS_OPTIONS: Array<{ key: TemplateStatus | "all"; label: string }> = [
  { key: "all", label: "All Statuses" },
  { key: "draft", label: "Draft" },
  { key: "active", label: "Active" },
  { key: "archived", label: "Archived" },
]

/**
 * TemplateFilters - Search, type tabs, status, and category filters
 */
export function TemplateFilters({
  searchQuery,
  onSearchChange,
  filterType,
  onTypeChange,
  filterStatus,
  onStatusChange,
  filterCategory,
  onCategoryChange,
  templates,
}: TemplateFiltersProps) {
  // Count templates by type
  const typeCounts = TEMPLATE_TYPES.reduce(
    (acc, type) => {
      if (type.key === "all") {
        acc[type.key] = templates.length
      } else {
        acc[type.key] = templates.filter((t) => t.type === type.key).length
      }
      return acc
    },
    {} as Record<string, number>
  )

  return (
    <div className="space-y-4">
      {/* Type filter tabs */}
      <div className="scrollbar-hide -mx-1 flex gap-2 overflow-x-auto pb-2 md:gap-3">
        {TEMPLATE_TYPES.map((type) => {
          const Icon = type.icon
          const isActive = filterType === type.key
          const count = typeCounts[type.key] || 0

          return (
            <Button
              key={type.key}
              variant={isActive ? "default" : "outline"}
              size="sm"
              onClick={() => onTypeChange(type.key)}
              className={`flex-shrink-0 gap-1.5 rounded-full px-3 py-2 text-sm md:px-4 ${
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "border-border bg-white text-muted-foreground hover:bg-gray-50"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span className="hidden md:inline">{type.label}</span>
              <span className="md:hidden">
                {type.key === "all" ? "All" : ""}
              </span>
              <Badge
                variant="secondary"
                className={`ml-1 px-2 py-0 text-xs ${
                  isActive
                    ? "bg-white/20 text-primary-foreground"
                    : "bg-gray-100 text-muted-foreground"
                }`}
              >
                {count}
              </Badge>
            </Button>
          )
        })}
      </div>

      {/* Search and dropdown filters */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        {/* Search input */}
        <div className="relative flex-1 md:max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Status filter */}
        <Select value={filterStatus} onValueChange={onStatusChange}>
          <SelectTrigger className="w-full md:w-[150px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((status) => (
              <SelectItem key={status.key} value={status.key}>
                {status.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Category filter */}
        <Select value={filterCategory} onValueChange={onCategoryChange}>
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {TEMPLATE_CATEGORIES.map((category) => (
              <SelectItem key={category.value} value={category.value}>
                {category.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}

export default TemplateFilters
