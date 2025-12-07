import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  FileText,
  BookOpen,
  FileType2,
  AlignLeft,
  FileOutput,
  Upload,
  Edit,
  Copy,
  Trash2,
  Send,
  MoreVertical,
} from "lucide-react"
import type { Template, TemplateType, TemplateStatus } from "../types"
import { Timestamp } from "firebase/firestore"

interface TemplateCardProps {
  template: Template
  onEdit: (template: Template) => void
  onDuplicate: (template: Template) => void
  onDelete: (template: Template) => void
  onSend?: (template: Template) => void
}

// Type badge colors
const TYPE_COLORS: Record<TemplateType, { bg: string; text: string; icon: React.ElementType }> = {
  document: { bg: "bg-blue-100", text: "text-blue-700", icon: FileText },
  cover: { bg: "bg-purple-100", text: "text-purple-700", icon: BookOpen },
  header: { bg: "bg-teal-100", text: "text-teal-700", icon: FileType2 },
  footer: { bg: "bg-amber-100", text: "text-amber-700", icon: AlignLeft },
  endPage: { bg: "bg-rose-100", text: "text-rose-700", icon: FileOutput },
  uploaded: { bg: "bg-gray-100", text: "text-gray-700", icon: Upload },
}

// Status badge colors
const STATUS_COLORS: Record<TemplateStatus, { bg: string; text: string }> = {
  draft: { bg: "bg-gray-100", text: "text-gray-600" },
  active: { bg: "bg-emerald-100", text: "text-emerald-700" },
  archived: { bg: "bg-amber-100", text: "text-amber-700" },
}

// Format relative date
function formatRelativeDate(timestamp: Timestamp | Date | undefined): string {
  if (!timestamp) return "Never"
  const date = timestamp instanceof Timestamp ? timestamp.toDate() : timestamp
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return "Today"
  if (diffDays === 1) return "Yesterday"
  if (diffDays < 7) return `${diffDays} days ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
  return date.toLocaleDateString()
}

/**
 * TemplateCard - Individual template card with hover actions
 */
export function TemplateCard({
  template,
  onEdit,
  onDuplicate,
  onDelete,
  onSend,
}: TemplateCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  const typeConfig = TYPE_COLORS[template.type] || TYPE_COLORS.document
  const statusConfig = STATUS_COLORS[template.status] || STATUS_COLORS.draft
  const TypeIcon = typeConfig.icon

  const typeLabel = template.type === "endPage" ? "End Page" : template.type

  return (
    <Card
      className={`group cursor-pointer overflow-hidden transition-all duration-200 ${
        isHovered ? "-translate-y-1 shadow-lg" : "shadow-sm"
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onEdit(template)}
    >
      {/* Preview thumbnail */}
      <div className="relative flex h-36 items-center justify-center bg-gray-100 md:h-40">
        {/* Template preview placeholder */}
        {template.uploadedFile?.pages?.[0]?.imageUrl ? (
          <img
            src={template.uploadedFile.pages[0].imageUrl}
            alt={template.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-24 w-20 items-center justify-center rounded bg-white shadow-md">
            <TypeIcon className="h-8 w-8" style={{ color: template.iconColor || "#6B7280" }} />
          </div>
        )}

        {/* Type badge - top left */}
        <Badge
          className={`absolute left-3 top-3 ${typeConfig.bg} ${typeConfig.text} border-0 capitalize`}
        >
          {typeLabel}
        </Badge>

        {/* Quick actions overlay - visible on hover */}
        <div
          className={`absolute inset-0 flex items-center justify-center gap-2 bg-black/40 transition-opacity duration-150 ${
            isHovered ? "opacity-100" : "opacity-0"
          }`}
        >
          <Button
            size="sm"
            variant="secondary"
            className="bg-white hover:bg-gray-100"
            onClick={(e) => {
              e.stopPropagation()
              onEdit(template)
            }}
          >
            <Edit className="mr-1 h-4 w-4" />
            Edit
          </Button>
          <Button
            size="icon"
            variant="secondary"
            className="bg-white/90 hover:bg-white"
            onClick={(e) => {
              e.stopPropagation()
              onDuplicate(template)
            }}
          >
            <Copy className="h-4 w-4" />
          </Button>
          {/* Send button - only for active document templates */}
          {template.type === "document" && template.status === "active" && onSend && (
            <Button
              size="sm"
              className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white hover:from-emerald-700 hover:to-emerald-800"
              onClick={(e) => {
                e.stopPropagation()
                onSend(template)
              }}
            >
              <Send className="mr-1 h-4 w-4" />
              Send
            </Button>
          )}
        </div>

        {/* Dropdown menu - top right (visible on hover) */}
        <div
          className={`absolute right-3 top-3 transition-opacity duration-150 ${
            isHovered ? "opacity-100" : "opacity-0"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="icon"
                variant="secondary"
                className="h-8 w-8 bg-white/90 hover:bg-white"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(template)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDuplicate(template)}>
                <Copy className="mr-2 h-4 w-4" />
                Duplicate
              </DropdownMenuItem>
              {template.type === "document" && template.status === "active" && onSend && (
                <DropdownMenuItem onClick={() => onSend(template)}>
                  <Send className="mr-2 h-4 w-4" />
                  Send for Signature
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => onDelete(template)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Card content */}
      <div className="p-4">
        <h3 className="mb-2 truncate text-base font-semibold text-foreground md:text-lg">
          {template.name}
        </h3>
        <p className="mb-3 text-xs text-muted-foreground md:text-sm">
          Updated {formatRelativeDate(template.updatedAt)}
        </p>

        {/* Status badge */}
        <Badge
          variant="secondary"
          className={`${statusConfig.bg} ${statusConfig.text} border-0 capitalize`}
        >
          {template.status}
        </Badge>
      </div>
    </Card>
  )
}

export default TemplateCard
