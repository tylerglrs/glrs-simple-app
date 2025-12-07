import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  FileText,
  BookOpen,
  FileType2,
  AlignLeft,
  FileOutput,
  Upload,
  Plus,
  Loader2,
  AlertTriangle,
} from "lucide-react"
import { toast } from "sonner"
import {
  db,
  collection,
  addDoc,
  serverTimestamp,
} from "@/lib/firebase"
import type { Template, TemplateType, TemplateStatus } from "../types"
import { cn } from "@/lib/utils"

// Template type configuration
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

// Status options
const STATUS_OPTIONS: Array<{
  key: TemplateStatus
  label: string
  color: { bg: string; text: string }
}> = [
  { key: "draft", label: "Draft", color: { bg: "bg-gray-100", text: "text-gray-600" } },
  { key: "active", label: "Active", color: { bg: "bg-emerald-100", text: "text-emerald-700" } },
]

interface FormErrors {
  name?: string
  type?: string
}

interface TemplateCreateModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  preselectedType?: TemplateType
  userId: string
  tenantId: string
  onSuccess: (template: Template) => void
}

/**
 * TemplateCreateModal - Modal for creating new templates
 * Ported from templates.html lines 1896-2340
 */
export function TemplateCreateModal({
  open,
  onOpenChange,
  preselectedType,
  userId,
  tenantId,
  onSuccess,
}: TemplateCreateModalProps) {
  // Form state
  const [formData, setFormData] = useState({
    name: "",
    type: preselectedType || ("document" as TemplateType),
    description: "",
    status: "draft" as TemplateStatus,
  })
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      setFormData({
        name: "",
        type: preselectedType || "document",
        description: "",
        status: "draft",
      })
      setErrors({})
    }
  }, [open, preselectedType])

  // Validation
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.name.trim()) {
      newErrors.name = "Template name is required"
    } else if (formData.name.length < 3) {
      newErrors.name = "Name must be at least 3 characters"
    } else if (formData.name.length > 100) {
      newErrors.name = "Name must be less than 100 characters"
    }

    if (!formData.type) {
      newErrors.type = "Please select a template type"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Submit handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    setSaving(true)
    try {
      const templateData = {
        name: formData.name.trim(),
        type: formData.type,
        description: formData.description.trim(),
        status: formData.status,
        content: formData.type === "document" ? { blocks: [] } : {},
        components:
          formData.type === "document"
            ? {
                coverPageId: null,
                headerId: null,
                footerId: null,
                endPageId: null,
              }
            : null,
        tenantId,
        createdBy: userId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }

      const docRef = await addDoc(collection(db, "templates"), templateData)

      toast.success("Template created successfully")

      // Pass the created template to onSuccess
      onSuccess({
        id: docRef.id,
        ...templateData,
      } as unknown as Template)

      onOpenChange(false)
    } catch (error) {
      console.error("Error creating template:", error)
      toast.error("Failed to create template")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-xl overflow-hidden p-0">
        {/* Header with gradient */}
        <div className="bg-gradient-to-r from-primary to-teal-600 px-6 py-5">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-white">
              Create New Template
            </DialogTitle>
            <DialogDescription className="text-white/85">
              Set up your template details
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col">
          <div className="max-h-[60vh] space-y-6 overflow-y-auto bg-slate-50 px-6 py-5">
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
                placeholder="e.g., Service Agreement Cover Page"
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
                Template Type <span className="text-destructive">*</span>
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
              {errors.type && (
                <div className="flex items-center gap-1 text-sm text-destructive">
                  <AlertTriangle className="h-3 w-3" />
                  {errors.type}
                </div>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-semibold text-muted-foreground">
                Description{" "}
                <span className="font-normal text-muted-foreground/70">(optional)</span>
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Brief description of what this template is for..."
                rows={3}
                className="resize-none bg-white"
              />
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-muted-foreground">Status</Label>
              <div className="flex gap-2">
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
              <p className="text-xs text-muted-foreground/70">
                Draft templates are only visible to admins. Active templates can be
                used in documents.
              </p>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex justify-end gap-3 border-t bg-white px-6 py-4">
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
              disabled={saving}
              className="bg-gradient-to-r from-primary to-teal-600 hover:from-primary/90 hover:to-teal-600/90"
            >
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Template
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default TemplateCreateModal
