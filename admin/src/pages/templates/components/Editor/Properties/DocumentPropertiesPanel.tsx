import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  FileText,
  PanelTop,
  PanelBottom,
  FileCheck,
  ExternalLink,
} from "lucide-react"
import type { TemplateStatus, TemplateComponents } from "../../../types"
import { TEMPLATE_CATEGORIES, TEMPLATE_STATUS_CONFIG } from "../../../constants"
import { cn } from "@/lib/utils"

interface ComponentOption {
  id: string
  name: string
  status: TemplateStatus
}

interface AvailableComponents {
  covers: ComponentOption[]
  headers: ComponentOption[]
  footers: ComponentOption[]
  endPages: ComponentOption[]
}

interface DocumentPropertiesPanelProps {
  templateName: string
  templateDescription: string
  templateStatus: TemplateStatus
  templateCategory: string
  components?: TemplateComponents
  availableComponents?: AvailableComponents
  onNameChange: (name: string) => void
  onDescriptionChange: (description: string) => void
  onStatusChange: (status: TemplateStatus) => void
  onCategoryChange: (category: string) => void
  onComponentChange?: (componentType: string, componentId: string) => void
  onOpenComponentEditor?: (componentType: string, componentId?: string) => void
}

/**
 * DocumentPropertiesPanel - Shows when no block is selected
 * Ported from templates.html lines 7636-7859
 */
export function DocumentPropertiesPanel({
  templateName,
  templateDescription,
  templateStatus,
  templateCategory,
  components,
  availableComponents,
  onNameChange,
  onDescriptionChange,
  onStatusChange,
  onCategoryChange,
  onComponentChange,
  onOpenComponentEditor,
}: DocumentPropertiesPanelProps) {
  return (
    <div className="space-y-6">
      {/* Template Name */}
      <div className="space-y-2">
        <Label className="text-xs font-semibold text-muted-foreground">
          Template Name
        </Label>
        <Input
          value={templateName}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder="Enter template name..."
        />
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label className="text-xs font-semibold text-muted-foreground">
          Description
        </Label>
        <Textarea
          value={templateDescription}
          onChange={(e) => onDescriptionChange(e.target.value)}
          placeholder="Optional description..."
          rows={3}
        />
      </div>

      {/* Category */}
      <div className="space-y-2">
        <Label className="text-xs font-semibold text-muted-foreground">
          Category
        </Label>
        <Select value={templateCategory} onValueChange={onCategoryChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            {TEMPLATE_CATEGORIES.map((cat) => (
              <SelectItem key={cat.value} value={cat.value}>
                {cat.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Status */}
      <div className="space-y-2">
        <Label className="text-xs font-semibold text-muted-foreground">
          Status
        </Label>
        <div className="flex flex-wrap gap-2">
          {(Object.entries(TEMPLATE_STATUS_CONFIG) as [TemplateStatus, typeof TEMPLATE_STATUS_CONFIG.draft][]).map(
            ([status, config]) => (
              <Button
                key={status}
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onStatusChange(status)}
                className={cn(
                  "h-auto px-3 py-1.5",
                  templateStatus === status && config.color
                )}
              >
                {config.label}
              </Button>
            )
          )}
        </div>
      </div>

      {/* Document Components Section */}
      {onComponentChange && (
        <div className="border-t pt-6">
          <h4 className="mb-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Document Components
          </h4>

          {/* Cover Page */}
          <div className="mb-4 space-y-2">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2 text-sm">
                <FileText className="h-4 w-4 text-purple-500" />
                Cover Page
              </Label>
              {onOpenComponentEditor && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    onOpenComponentEditor("cover", components?.coverPageId)
                  }
                  className="h-7 px-2 text-xs"
                >
                  <ExternalLink className="mr-1 h-3 w-3" />
                  Edit
                </Button>
              )}
            </div>
            <Select
              value={components?.coverPageId || "none"}
              onValueChange={(v) => onComponentChange("coverPage", v === "none" ? "" : v)}
            >
              <SelectTrigger className="h-9">
                <SelectValue placeholder="No cover page" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No cover page</SelectItem>
                {availableComponents?.covers
                  ?.filter((c) => c.status === "active")
                  .map((cover) => (
                    <SelectItem key={cover.id} value={cover.id}>
                      {cover.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          {/* Header */}
          <div className="mb-4 space-y-2">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2 text-sm">
                <PanelTop className="h-4 w-4 text-blue-500" />
                Header
              </Label>
              {onOpenComponentEditor && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    onOpenComponentEditor("header", components?.headerId)
                  }
                  className="h-7 px-2 text-xs"
                >
                  <ExternalLink className="mr-1 h-3 w-3" />
                  Edit
                </Button>
              )}
            </div>
            <Select
              value={components?.headerId || "none"}
              onValueChange={(v) => onComponentChange("header", v === "none" ? "" : v)}
            >
              <SelectTrigger className="h-9">
                <SelectValue placeholder="No header" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No header</SelectItem>
                {availableComponents?.headers
                  ?.filter((h) => h.status === "active")
                  .map((header) => (
                    <SelectItem key={header.id} value={header.id}>
                      {header.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          {/* Footer */}
          <div className="mb-4 space-y-2">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2 text-sm">
                <PanelBottom className="h-4 w-4 text-amber-500" />
                Footer
              </Label>
              {onOpenComponentEditor && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    onOpenComponentEditor("footer", components?.footerId)
                  }
                  className="h-7 px-2 text-xs"
                >
                  <ExternalLink className="mr-1 h-3 w-3" />
                  Edit
                </Button>
              )}
            </div>
            <Select
              value={components?.footerId || "none"}
              onValueChange={(v) => onComponentChange("footer", v === "none" ? "" : v)}
            >
              <SelectTrigger className="h-9">
                <SelectValue placeholder="No footer" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No footer</SelectItem>
                {availableComponents?.footers
                  ?.filter((f) => f.status === "active")
                  .map((footer) => (
                    <SelectItem key={footer.id} value={footer.id}>
                      {footer.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          {/* End Page */}
          <div className="mb-4 space-y-2">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2 text-sm">
                <FileCheck className="h-4 w-4 text-emerald-500" />
                End Page
              </Label>
              {onOpenComponentEditor && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    onOpenComponentEditor("endPage", components?.endPageId)
                  }
                  className="h-7 px-2 text-xs"
                >
                  <ExternalLink className="mr-1 h-3 w-3" />
                  Edit
                </Button>
              )}
            </div>
            <Select
              value={components?.endPageId || "none"}
              onValueChange={(v) => onComponentChange("endPage", v === "none" ? "" : v)}
            >
              <SelectTrigger className="h-9">
                <SelectValue placeholder="No end page" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No end page</SelectItem>
                {availableComponents?.endPages
                  ?.filter((e) => e.status === "active")
                  .map((endPage) => (
                    <SelectItem key={endPage.id} value={endPage.id}>
                      {endPage.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          <p className="mt-3 text-[11px] italic text-muted-foreground">
            Components must be set to "Active" status to appear here
          </p>
        </div>
      )}
    </div>
  )
}

export default DocumentPropertiesPanel
