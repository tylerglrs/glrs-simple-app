import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import {
  Scissors,
  PenTool,
  ChevronDown,
  X,
  GripVertical,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Block, SignerRole } from "../../types"
import { ROLE_COLORS, SIGNER_ROLES } from "../../constants"
import { cn } from "@/lib/utils"

interface CanvasBlockProps {
  block: Block
  index: number
  isSelected: boolean
  onSelect: () => void
  onDelete: () => void
  previewMode?: boolean
}

/**
 * CanvasBlock - Individual block rendered on the canvas
 * Ported from templates.html lines 5648-6166
 */
export function CanvasBlock({
  block,
  index: _index,
  isSelected,
  onSelect,
  onDelete,
  previewMode = false,
}: CanvasBlockProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: block.id,
    disabled: previewMode,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  // Get role color for signature fields
  const getRoleColor = (role?: SignerRole) => {
    if (!role) return null
    return ROLE_COLORS[role]
  }

  const roleColor = "role" in block ? getRoleColor(block.role as SignerRole) : null

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={previewMode ? undefined : onSelect}
      className={cn(
        "group relative transition-all",
        isDragging && "z-50 opacity-50",
        !previewMode && "cursor-pointer"
      )}
    >
      {/* Selection overlay */}
      {!previewMode && (
        <div
          className={cn(
            "pointer-events-none absolute -inset-1 rounded-lg border-2 transition-all",
            isSelected
              ? "border-primary bg-primary/5"
              : "border-transparent group-hover:border-muted-foreground/20 group-hover:bg-muted/30"
          )}
        />
      )}

      {/* Delete button - visible when selected */}
      {!previewMode && isSelected && (
        <Button
          variant="destructive"
          size="icon"
          onClick={(e) => {
            e.stopPropagation()
            onDelete()
          }}
          className="absolute -right-3 -top-3 z-10 h-6 w-6 rounded-full"
        >
          <X className="h-3 w-3" />
        </Button>
      )}

      {/* Drag handle - visible on hover or when selected */}
      {!previewMode && (
        <div
          {...attributes}
          {...listeners}
          className={cn(
            "absolute -left-8 top-1/2 -translate-y-1/2 cursor-grab rounded p-1 opacity-0 transition-opacity",
            "hover:bg-muted",
            (isSelected || isDragging) && "opacity-100",
            "group-hover:opacity-100"
          )}
        >
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </div>
      )}

      {/* Block content based on type */}
      <div className="relative">
        {/* Section Block */}
        {block.type === "section" && (
          <div className="flex items-center gap-3 border-b-2 border-primary pb-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
              {"number" in block ? block.number : "1"}
            </span>
            <h2 className="text-lg font-semibold text-foreground">
              {"title" in block ? block.title : "Section Title"}
            </h2>
          </div>
        )}

        {/* Heading Block */}
        {block.type === "heading" && (
          <div
            className={cn(
              "font-semibold text-foreground",
              "level" in block && block.level === 1 && "text-2xl",
              "level" in block && block.level === 2 && "text-xl",
              "level" in block && block.level === 3 && "text-lg",
              "level" in block && block.level === 4 && "text-base"
            )}
          >
            {"content" in block ? block.content : "Heading Text"}
          </div>
        )}

        {/* Paragraph Block */}
        {block.type === "paragraph" && (
          <p className="text-sm leading-relaxed text-foreground">
            {"content" in block ? block.content : "Enter your text here..."}
          </p>
        )}

        {/* Bullet List Block */}
        {block.type === "bulletList" && (
          <ul className="ml-4 list-disc space-y-1 text-sm text-foreground">
            {"items" in block &&
              block.items.map((item, i) => <li key={i}>{item}</li>)}
          </ul>
        )}

        {/* Page Break */}
        {block.type === "pageBreak" && (
          <div className="my-2 flex items-center justify-center gap-3 py-4">
            <Scissors className="h-4 w-4 rotate-90 text-destructive" />
            <div className="flex-1 border-t-2 border-dashed border-destructive/60" />
            <span className="text-xs font-semibold uppercase tracking-wider text-destructive">
              Page Break
            </span>
            <div className="flex-1 border-t-2 border-dashed border-destructive/60" />
            <Scissors className="h-4 w-4 -rotate-90 text-destructive" />
          </div>
        )}

        {/* Signature Field */}
        {block.type === "signatureField" && (
          <div
            className="rounded-r-lg border-l-4 p-2.5"
            style={{
              borderLeftColor: roleColor?.border || "#9CA3AF",
              backgroundColor: roleColor?.bg || "#F3F4F6",
            }}
          >
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                {"label" in block ? block.label : "Signature"}
                {"required" in block && block.required && (
                  <span className="text-destructive">*</span>
                )}
              </div>
              <span
                className="rounded px-1.5 py-0.5 text-[9px] font-semibold"
                style={{
                  backgroundColor: roleColor?.bg || "#E5E7EB",
                  color: roleColor?.text || "#6B7280",
                }}
              >
                {SIGNER_ROLES["role" in block ? (block.role as SignerRole) : "pir"]?.label || "PIR"}
              </span>
            </div>
            <div className="flex h-9 items-center justify-center rounded border-2 border-dashed border-muted-foreground/30 bg-white">
              <span className="text-xs text-muted-foreground">Click to sign</span>
            </div>
          </div>
        )}

        {/* Initials Field */}
        {block.type === "initialsField" && (
          <div
            className="rounded-r-lg border-l-4 p-2.5"
            style={{
              borderLeftColor: roleColor?.border || "#9CA3AF",
              backgroundColor: roleColor?.bg || "#F3F4F6",
            }}
          >
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                {"label" in block ? block.label : "Initials"}
                {"required" in block && block.required && (
                  <span className="text-destructive">*</span>
                )}
              </div>
              <span
                className="rounded px-1.5 py-0.5 text-[9px] font-semibold"
                style={{
                  backgroundColor: roleColor?.bg || "#E5E7EB",
                  color: roleColor?.text || "#6B7280",
                }}
              >
                {SIGNER_ROLES["role" in block ? (block.role as SignerRole) : "pir"]?.label || "PIR"}
              </span>
            </div>
            <div className="flex h-7 items-center justify-center rounded border-2 border-dashed border-muted-foreground/30 bg-white">
              <span className="text-xs text-muted-foreground">Click to sign</span>
            </div>
          </div>
        )}

        {/* Date Field */}
        {block.type === "dateField" && (
          <div
            className="rounded-r-lg border-l-4 p-2.5"
            style={{
              borderLeftColor: roleColor?.border || "#9CA3AF",
              backgroundColor: roleColor?.bg || "#F3F4F6",
            }}
          >
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                {"label" in block ? block.label : "Date"}
                {"required" in block && block.required && (
                  <span className="text-destructive">*</span>
                )}
              </div>
              <span
                className="rounded px-1.5 py-0.5 text-[9px] font-semibold"
                style={{
                  backgroundColor: roleColor?.bg || "#E5E7EB",
                  color: roleColor?.text || "#6B7280",
                }}
              >
                {SIGNER_ROLES["role" in block ? (block.role as SignerRole) : "pir"]?.label || "PIR"}
              </span>
            </div>
            <div className="rounded border bg-white px-2.5 py-1.5 text-sm text-muted-foreground">
              {"autoFill" in block && block.autoFill
                ? new Date().toLocaleDateString("en-US")
                : "MM/DD/YYYY"}
            </div>
          </div>
        )}

        {/* Text Input Field */}
        {block.type === "textInputField" && (
          <div
            className="rounded-r-lg border-l-4 p-2.5"
            style={{
              borderLeftColor: roleColor?.border || "#9CA3AF",
              backgroundColor: roleColor?.bg || "#F3F4F6",
            }}
          >
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                {"label" in block ? block.label : "Text Input"}
                {"required" in block && block.required && (
                  <span className="text-destructive">*</span>
                )}
              </div>
              <span
                className="rounded px-1.5 py-0.5 text-[9px] font-semibold"
                style={{
                  backgroundColor: roleColor?.bg || "#E5E7EB",
                  color: roleColor?.text || "#6B7280",
                }}
              >
                {SIGNER_ROLES["role" in block ? (block.role as SignerRole) : "pir"]?.label || "PIR"}
              </span>
            </div>
            <div className="rounded border bg-white px-2.5 py-1.5 text-sm text-muted-foreground">
              {"placeholder" in block && block.placeholder
                ? block.placeholder
                : "Enter text..."}
            </div>
          </div>
        )}

        {/* Checkbox Field */}
        {block.type === "checkboxField" && (
          <div
            className="flex items-start gap-2 rounded-r-lg border-l-4 p-2.5"
            style={{
              borderLeftColor: roleColor?.border || "#9CA3AF",
              backgroundColor: roleColor?.bg || "#F3F4F6",
            }}
          >
            <div className="mt-0.5 h-4 w-4 shrink-0 rounded border-2 border-muted-foreground/30 bg-white" />
            <div className="flex flex-1 items-start justify-between">
              <span className="text-xs leading-relaxed text-foreground">
                {"label" in block ? block.label : "Checkbox label"}
                {"required" in block && block.required && (
                  <span className="text-destructive"> *</span>
                )}
              </span>
              <span
                className="ml-2 shrink-0 rounded px-1.5 py-0.5 text-[9px] font-semibold"
                style={{
                  backgroundColor: roleColor?.bg || "#E5E7EB",
                  color: roleColor?.text || "#6B7280",
                }}
              >
                {SIGNER_ROLES["role" in block ? (block.role as SignerRole) : "pir"]?.label || "PIR"}
              </span>
            </div>
          </div>
        )}

        {/* Dropdown Field */}
        {block.type === "dropdownField" && (
          <div
            className="rounded-r-lg border-l-4 p-2.5"
            style={{
              borderLeftColor: roleColor?.border || "#9CA3AF",
              backgroundColor: roleColor?.bg || "#F3F4F6",
            }}
          >
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                {"label" in block ? block.label : "Dropdown"}
                {"required" in block && block.required && (
                  <span className="text-destructive">*</span>
                )}
              </div>
              <span
                className="rounded px-1.5 py-0.5 text-[9px] font-semibold"
                style={{
                  backgroundColor: roleColor?.bg || "#E5E7EB",
                  color: roleColor?.text || "#6B7280",
                }}
              >
                {SIGNER_ROLES["role" in block ? (block.role as SignerRole) : "pir"]?.label || "PIR"}
              </span>
            </div>
            <div className="flex items-center justify-between rounded border bg-white px-2.5 py-1.5 text-sm text-muted-foreground">
              <span>Select an option</span>
              <ChevronDown className="h-3 w-3" />
            </div>
            {"options" in block && block.options && block.options.length > 0 && (
              <div className="mt-1 text-[10px] text-muted-foreground/70">
                Options: {block.options.join(", ")}
              </div>
            )}
          </div>
        )}

        {/* Legacy Signature Block */}
        {block.type === "signatureBlock" && (
          <div
            className="rounded-lg border-2 p-2.5"
            style={{
              borderColor: roleColor?.border || "#D1D5DB",
              backgroundColor: roleColor?.bg || "#F9FAFB",
            }}
          >
            <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold"
              style={{ color: roleColor?.text || "#6B7280" }}
            >
              <PenTool className="h-3 w-3" />
              {"label" in block ? block.label : "Signature"}
              {"required" in block && block.required && (
                <span className="text-destructive">*</span>
              )}
            </div>
            <div className="mb-2 h-7 border-b-2" style={{ borderColor: roleColor?.border || "#9CA3AF" }} />
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <div className="mb-0.5 text-[10px] text-muted-foreground">Printed Name</div>
                <div className="h-4 border-b border-muted-foreground/30" />
              </div>
              <div>
                <div className="mb-0.5 text-[10px] text-muted-foreground">Date</div>
                <div className="h-4 border-b border-muted-foreground/30" />
              </div>
            </div>
          </div>
        )}

        {/* Acknowledgment Block */}
        {block.type === "acknowledgment" && (
          <div
            className="flex items-start gap-2 rounded-lg border p-2.5"
            style={{
              borderColor: roleColor?.border || "#E5E7EB",
              backgroundColor: roleColor?.bg || "#F9FAFB",
            }}
          >
            <div className="mt-0.5 h-3.5 w-3.5 shrink-0 rounded border-2 border-muted-foreground/40" />
            <div className="text-xs leading-relaxed text-foreground">
              {"text" in block ? block.text : "Acknowledgment text"}
              {"required" in block && block.required && (
                <span className="text-destructive"> *</span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default CanvasBlock
