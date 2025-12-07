import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  FileText,
  BookOpen,
  FileType2,
  AlignLeft,
  FileOutput,
  Upload,
  Edit,
  Send,
  Trash2,
  Check,
  Loader2,
  AlertTriangle,
  Info,
} from "lucide-react"
import { toast } from "sonner"
import { db, doc, updateDoc, serverTimestamp } from "@/lib/firebase"
import type { Template, TemplateType, TemplateStatus } from "../types"
import { cn } from "@/lib/utils"
import { Timestamp } from "firebase/firestore"

// Template type configuration (same as create modal)
const TEMPLATE_TYPE_OPTIONS: Array<{
  key: TemplateType
  label: string
  icon: React.ElementType
  color: { bg: string; icon: string; text: string }
}> = [
  {
    key: "document",
    label: "Document",
    icon: FileText,
    color: { bg: "bg-blue-50", icon: "#3B82F6", text: "text-blue-700" },
  },
  {
    key: "cover",
    label: "Cover",
    icon: BookOpen,
    color: { bg: "bg-purple-50", icon: "#8B5CF6", text: "text-purple-700" },
  },
  {
    key: "header",
    label: "Header",
    icon: FileType2,
    color: { bg: "bg-teal-50", icon: "#14B8A6", text: "text-teal-700" },
  },
  {
    key: "footer",
    label: "Footer",
    icon: AlignLeft,
    color: { bg: "bg-amber-50", icon: "#F59E0B", text: "text-amber-700" },
  },
  {
    key: "endPage",
    label: "End Page",
    icon: FileOutput,
    color: { bg: "bg-rose-50", icon: "#F43F5E", text: "text-rose-700" },
  },
  {
    key: "uploaded",
    label: "Uploaded",
    icon: Upload,
    color: { bg: "bg-gray-50", icon: "#6B7280", text: "text-gray-700" },
  },
]

// Status options (includes archived for detail modal)
const STATUS_OPTIONS: Array<{
  key: TemplateStatus
  label: string
  color: { bg: string; text: string }
}> = [
  { key: "draft", label: "Draft", color: { bg: "bg-gray-100", text: "text-gray-600" } },
  { key: "active", label: "Active", color: { bg: "bg-emerald-100", text: "text-emerald-700" } },
  { key: "archived", label: "Archived", color: { bg: "bg-amber-100", text: "text-amber-700" } },
]

interface FormErrors {
  name?: string
}

// Format date for display
function formatDate(timestamp: Timestamp | Date | undefined): string {
  if (!timestamp) return "N/A"
  const date = timestamp instanceof Timestamp ? timestamp.toDate() : timestamp
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

interface TemplateDetailModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  template: Template | null
  onUpdate: () => void
  onDelete: () => void
  onOpenEditor?: (template: Template) => void
  onSend?: (template: Template) => void
}

/**
 * TemplateDetailModal - Modal for viewing/editing template details
 * Ported from templates.html lines 2344-2915
 */
export function TemplateDetailModal({
  open,
  onOpenChange,
  template,
  onUpdate,
  onDelete,
  onOpenEditor,
  onSend,
}: TemplateDetailModalProps) {
  // Form state - initialized with template data
  const [formData, setFormData] = useState({
    name: "",
    type: "document" as TemplateType,
    description: "",
    status: "draft" as TemplateStatus,
  })
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})
  const [hasChanges, setHasChanges] = useState(false)

  // Initialize form when template changes
  useEffect(() => {
    if (template) {
      setFormData({
        name: template.name || "",
        type: template.type || "document",
        description: template.description || "",
        status: template.status || "draft",
      })
      setErrors({})
      setHasChanges(false)
    }
  }, [template])

  // Track changes
  useEffect(() => {
    if (!template) return
    const changed =
      formData.name !== template.name ||
      formData.type !== template.type ||
      formData.description !== (template.description || "") ||
      formData.status !== template.status
    setHasChanges(changed)
  }, [formData, template])

  // Validation
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.name.trim()) {
      newErrors.name = "Template name is required"
    } else if (formData.name.length < 3) {
      newErrors.name = "Name must be at least 3 characters"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Save handler
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm() || !template) return

    setSaving(true)
    try {
      await updateDoc(doc(db, "templates", template.id), {
        name: formData.name.trim(),
        type: formData.type,
        description: formData.description.trim(),
        status: formData.status,
        updatedAt: serverTimestamp(),
      })

      toast.success("Template updated successfully")
      onUpdate()
      setHasChanges(false)
    } catch (error) {
      console.error("Error updating template:", error)
      toast.error("Failed to update template")
    } finally {
      setSaving(false)
    }
  }

  if (!template) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-hidden p-0">
        {/* Header with gradient */}
        <div className="bg-gradient-to-r from-primary to-teal-600 px-6 py-5">
          <div className="mb-2 flex items-center gap-2">
            <Badge
              variant="secondary"
              className="border-0 bg-white/20 capitalize text-white"
            >
              {formData.type === "endPage" ? "End Page" : formData.type}
            </Badge>
            <Badge
              variant="secondary"
              className={cn(
                "border-0 capitalize text-white",
                formData.status === "active" ? "bg-emerald-500/30" : "bg-white/15"
              )}
            >
              {formData.status}
            </Badge>
          </div>
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-white">
              Edit Template
            </DialogTitle>
          </DialogHeader>
        </div>

        {/* Form */}
        <form onSubmit={handleSave} className="flex flex-col">
          <div className="max-h-[55vh] space-y-6 overflow-y-auto bg-slate-50 px-6 py-5">
            {/* Template Name */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-semibold text-muted-foreground">
                Template Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className={cn(
                  "bg-white",
                  errors.name && "border-destructive focus-visible:ring-destructive"
                )}
              />
              {errors.name && (
                <div className="flex items-center gap-1 text-sm text-destructive">
                  <AlertTriangle className="h-3 w-3" />
                  {errors.name}
                </div>
              )}
            </div>

            {/* Template Type */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-muted-foreground">
                Template Type
              </Label>
              <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
                {TEMPLATE_TYPE_OPTIONS.map((type) => {
                  const Icon = type.icon
                  const isSelected = formData.type === type.key
                  return (
                    <button
                      key={type.key}
                      type="button"
                      onClick={() =>
                        setFormData({ ...formData, type: type.key })
                      }
                      className={cn(
                        "flex flex-col items-center gap-2 rounded-lg border-2 bg-white p-3 transition-all",
                        isSelected
                          ? `${type.color.bg} border-current ${type.color.text}`
                          : "border-gray-200 hover:border-gray-300"
                      )}
                    >
                      <Icon
                        className="h-5 w-5"
                        style={{
                          color: isSelected ? type.color.icon : "#9CA3AF",
                        }}
                      />
                      <span
                        className={cn(
                          "text-xs font-medium",
                          isSelected ? type.color.text : "text-muted-foreground"
                        )}
                      >
                        {type.label}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-semibold text-muted-foreground">
                Description
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Brief description..."
                rows={3}
                className="resize-none bg-white"
              />
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-muted-foreground">Status</Label>
              <div className="flex flex-wrap gap-2">
                {STATUS_OPTIONS.map((status) => (
                  <button
                    key={status.key}
                    type="button"
                    onClick={() =>
                      setFormData({ ...formData, status: status.key })
                    }
                    className={cn(
                      "rounded-lg border-2 px-4 py-2 text-sm font-medium transition-all",
                      formData.status === status.key
                        ? `${status.color.bg} ${status.color.text} border-current`
                        : "border-gray-200 bg-white text-muted-foreground hover:border-gray-300"
                    )}
                  >
                    {status.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Metadata Info Box */}
            <div className="rounded-lg border bg-white p-4">
              <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                <Info className="h-4 w-4 text-muted-foreground/70" />
                Template Info
              </h4>
              <div className="grid gap-3 text-xs text-muted-foreground md:grid-cols-2">
                <div>
                  <strong>Created:</strong> {formatDate(template.createdAt)}
                </div>
                <div>
                  <strong>Last Updated:</strong> {formatDate(template.updatedAt)}
                </div>
                <div className="md:col-span-2">
                  <strong>Template ID:</strong> {template.id}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              {/* Open Editor Button */}
              <Button
                type="button"
                onClick={() => onOpenEditor?.(template)}
                className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800"
              >
                <Edit className="mr-2 h-4 w-4" />
                Open Content Editor
              </Button>

              {/* Send for Signature - only for active document templates */}
              {template.type === "document" &&
                template.status === "active" &&
                onSend && (
                  <Button
                    type="button"
                    onClick={() => onSend(template)}
                    className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800"
                  >
                    <Send className="mr-2 h-4 w-4" />
                    Send for Signature
                  </Button>
                )}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-t bg-white px-6 py-4">
            {/* Delete button */}
            <Button
              type="button"
              variant="outline"
              onClick={onDelete}
              disabled={saving}
              className="border-red-200 text-destructive hover:bg-red-50 hover:text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={saving || !hasChanges}
                className={cn(
                  !hasChanges && "opacity-50",
                  "bg-gradient-to-r from-primary to-teal-600 hover:from-primary/90 hover:to-teal-600/90"
                )}
              >
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default TemplateDetailModal
