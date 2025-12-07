import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ArrowLeft,
  Save,
  Loader2,
  FileText,
  Image,
  Check,
  AlertCircle,
} from "lucide-react"
import { toast } from "sonner"
import { db, doc, updateDoc, addDoc, collection, serverTimestamp } from "@/lib/firebase"
import type { Template, TemplateStatus } from "../../../types"
import { cn } from "@/lib/utils"

type SaveStatus = "saved" | "saving" | "unsaved"

interface CoverPageFormData {
  logoUrl: string
  title: string
  subtitle: string
  showDate: boolean
  backgroundStyle: string
}

interface CoverPageEditorModalProps {
  template?: Template | null
  tenantId: string
  userId: string
  open: boolean
  onClose: () => void
  onSaved?: () => void
}

const BACKGROUND_OPTIONS = [
  { value: "gradient-teal", label: "Teal Gradient", preview: "linear-gradient(135deg, #0D9488 0%, #0F766E 100%)" },
  { value: "gradient-blue", label: "Blue Gradient", preview: "linear-gradient(135deg, #0077CC 0%, #005A9C 100%)" },
  { value: "gradient-purple", label: "Purple Gradient", preview: "linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)" },
  { value: "solid-white", label: "Solid White", preview: "#FFFFFF" },
  { value: "solid-light", label: "Light Gray", preview: "#F8FAFC" },
]

/**
 * CoverPageEditorModal - Full-screen editor for cover page templates
 * Ported from templates.html lines 4516-4855
 */
export function CoverPageEditorModal({
  template,
  tenantId,
  userId,
  open,
  onClose,
  onSaved,
}: CoverPageEditorModalProps) {
  // Form state
  const [formData, setFormData] = useState<CoverPageFormData>({
    logoUrl: "",
    title: "{{documentTitle}}",
    subtitle: "",
    showDate: true,
    backgroundStyle: "gradient-teal",
  })
  const [templateName, setTemplateName] = useState("New Cover Page")
  const [templateStatus, setTemplateStatus] = useState<TemplateStatus>("draft")
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("saved")
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  // Initialize from template
  useEffect(() => {
    if (template) {
      setTemplateName(template.name || "New Cover Page")
      setTemplateStatus(template.status || "draft")
      const content = template.content as unknown as CoverPageFormData | undefined
      if (content) {
        setFormData({
          logoUrl: content.logoUrl || "",
          title: content.title || "{{documentTitle}}",
          subtitle: content.subtitle || "",
          showDate: content.showDate !== false,
          backgroundStyle: content.backgroundStyle || "gradient-teal",
        })
      }
    }
  }, [template])

  const handleFieldChange = (field: keyof CoverPageFormData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setHasUnsavedChanges(true)
    setSaveStatus("unsaved")
  }

  const handleSave = async () => {
    setSaveStatus("saving")
    try {
      const updateData = {
        name: templateName,
        status: templateStatus,
        content: { ...formData },
        updatedAt: serverTimestamp(),
      }

      if (template?.id) {
        await updateDoc(doc(db, "templates", template.id), updateData)
      } else {
        await addDoc(collection(db, "templates"), {
          ...updateData,
          type: "cover",
          tenantId,
          createdBy: userId,
          createdAt: serverTimestamp(),
        })
      }

      setSaveStatus("saved")
      setHasUnsavedChanges(false)
      toast.success("Cover page saved")
      onSaved?.()
    } catch (error) {
      console.error("Error saving cover page:", error)
      setSaveStatus("unsaved")
      toast.error("Failed to save cover page")
    }
  }

  const handleClose = () => {
    if (hasUnsavedChanges) {
      if (!window.confirm("You have unsaved changes. Are you sure you want to close?")) {
        return
      }
    }
    onClose()
  }

  const getBackgroundStyle = (styleValue: string) => {
    const option = BACKGROUND_OPTIONS.find((o) => o.value === styleValue)
    return option?.preview || "#FFFFFF"
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-50">
      {/* Top Toolbar */}
      <div className="flex h-14 shrink-0 items-center justify-between border-b bg-white px-4">
        {/* Left: Back button and name */}
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={handleClose}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>

          <div className="h-6 w-px bg-border" />

          <div className="flex items-center gap-3">
            <FileText className="h-5 w-5 text-purple-500" />
            <Input
              value={templateName}
              onChange={(e) => {
                setTemplateName(e.target.value)
                setHasUnsavedChanges(true)
                setSaveStatus("unsaved")
              }}
              className="h-9 w-64 border-transparent bg-transparent text-lg font-semibold focus-visible:border-input focus-visible:ring-0"
              placeholder="Cover Page Name"
            />
          </div>
        </div>

        {/* Right: Save status and button */}
        <div className="flex items-center gap-4">
          {/* Save status indicator */}
          <div
            className={cn(
              "flex items-center gap-1.5 text-xs",
              saveStatus === "saved" && "text-emerald-600",
              saveStatus === "saving" && "text-muted-foreground",
              saveStatus === "unsaved" && "text-amber-600"
            )}
          >
            {saveStatus === "saving" ? (
              <>
                <Loader2 className="h-3 w-3 animate-spin" />
                Saving...
              </>
            ) : saveStatus === "saved" ? (
              <>
                <Check className="h-3 w-3" />
                Saved
              </>
            ) : (
              <>
                <AlertCircle className="h-3 w-3" />
                Unsaved changes
              </>
            )}
          </div>

          {/* Save button */}
          <Button
            size="sm"
            onClick={handleSave}
            disabled={saveStatus === "saving"}
            className="bg-gradient-to-r from-primary to-teal-600 hover:from-primary/90 hover:to-teal-600/90"
          >
            {saveStatus === "saving" ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Save
          </Button>
        </div>
      </div>

      {/* Main Content - Two columns: Form and Preview */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Column - Form Fields */}
        <div className="w-[360px] shrink-0 overflow-y-auto border-r bg-white p-6">
          <h3 className="mb-5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Cover Page Settings
          </h3>

          {/* Logo URL */}
          <div className="mb-5 space-y-2">
            <Label className="text-sm font-medium">Logo URL</Label>
            <Input
              value={formData.logoUrl}
              onChange={(e) => handleFieldChange("logoUrl", e.target.value)}
              placeholder="https://example.com/logo.png"
            />
            <p className="text-xs text-muted-foreground">
              Leave empty to use default GLRS logo
            </p>
          </div>

          {/* Title */}
          <div className="mb-5 space-y-2">
            <Label className="text-sm font-medium">Document Title</Label>
            <Input
              value={formData.title}
              onChange={(e) => handleFieldChange("title", e.target.value)}
              placeholder="{{documentTitle}}"
            />
            <p className="text-xs text-muted-foreground">
              Use {"{{documentTitle}}"} for dynamic title
            </p>
          </div>

          {/* Subtitle */}
          <div className="mb-5 space-y-2">
            <Label className="text-sm font-medium">Subtitle</Label>
            <Input
              value={formData.subtitle}
              onChange={(e) => handleFieldChange("subtitle", e.target.value)}
              placeholder="Optional subtitle text"
            />
          </div>

          {/* Show Date Toggle */}
          <div className="mb-5 flex items-center justify-between">
            <Label className="text-sm font-medium">Show Date on Cover</Label>
            <Switch
              checked={formData.showDate}
              onCheckedChange={(checked) => handleFieldChange("showDate", checked)}
            />
          </div>

          {/* Background Style */}
          <div className="mb-5 space-y-3">
            <Label className="text-sm font-medium">Background Style</Label>
            <div className="flex flex-col gap-2">
              {BACKGROUND_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleFieldChange("backgroundStyle", option.value)}
                  className={cn(
                    "flex items-center gap-3 rounded-lg border-2 p-3 transition-colors",
                    formData.backgroundStyle === option.value
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-muted-foreground/50"
                  )}
                >
                  <div
                    className="h-8 w-8 shrink-0 rounded"
                    style={{ background: option.preview, border: "1px solid rgba(0,0,0,0.1)" }}
                  />
                  <span className="text-sm">{option.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Status */}
          <div className="mb-5 space-y-2">
            <Label className="text-sm font-medium">Status</Label>
            <Select value={templateStatus} onValueChange={(v) => {
              setTemplateStatus(v as TemplateStatus)
              setHasUnsavedChanges(true)
              setSaveStatus("unsaved")
            }}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Right Column - Preview */}
        <div className="flex flex-1 items-center justify-center overflow-auto bg-slate-200 p-10">
          {/* Cover Page Preview */}
          <div
            className="flex h-[520px] w-[400px] flex-col items-center justify-center rounded-lg p-10 text-center shadow-lg"
            style={{
              background: getBackgroundStyle(formData.backgroundStyle),
              color: formData.backgroundStyle.includes("gradient") ? "white" : "#475569",
            }}
          >
            {/* Logo */}
            {formData.logoUrl ? (
              <img
                src={formData.logoUrl}
                alt="Logo"
                className="mb-6 max-h-[60px] max-w-[120px]"
              />
            ) : (
              <div className="mb-6 flex h-[50px] w-[100px] items-center justify-center rounded-lg bg-white/20">
                <Image className="h-6 w-6 opacity-50" />
              </div>
            )}

            {/* Title */}
            <h1 className="mb-3 text-[28px] font-bold">
              {formData.title || "Document Title"}
            </h1>

            {/* Subtitle */}
            {formData.subtitle && (
              <p className="mb-6 text-base opacity-90">{formData.subtitle}</p>
            )}

            {/* Date */}
            {formData.showDate && (
              <p className="mt-auto text-sm opacity-80">
                {new Date().toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default CoverPageEditorModal
