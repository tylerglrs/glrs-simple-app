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
  PanelTop,
  Image,
  Check,
  AlertCircle,
} from "lucide-react"
import { toast } from "sonner"
import { db, doc, updateDoc, addDoc, collection, serverTimestamp } from "@/lib/firebase"
import type { Template, TemplateStatus } from "../../../types"
import { cn } from "@/lib/utils"

type SaveStatus = "saved" | "saving" | "unsaved"

interface HeaderFormData {
  logoPosition: "left" | "center" | "right"
  showTitle: boolean
  showDate: boolean
  height: "compact" | "standard"
}

interface HeaderEditorModalProps {
  template?: Template | null
  tenantId: string
  userId: string
  open: boolean
  onClose: () => void
  onSaved?: () => void
}

/**
 * HeaderEditorModal - Full-screen editor for header templates
 * Ported from templates.html lines 4860-5084
 */
export function HeaderEditorModal({
  template,
  tenantId,
  userId,
  open,
  onClose,
  onSaved,
}: HeaderEditorModalProps) {
  // Form state
  const [formData, setFormData] = useState<HeaderFormData>({
    logoPosition: "left",
    showTitle: true,
    showDate: false,
    height: "standard",
  })
  const [templateName, setTemplateName] = useState("New Header")
  const [templateStatus, setTemplateStatus] = useState<TemplateStatus>("draft")
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("saved")
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  // Initialize from template
  useEffect(() => {
    if (template) {
      setTemplateName(template.name || "New Header")
      setTemplateStatus(template.status || "draft")
      const content = template.content as unknown as HeaderFormData | undefined
      if (content) {
        setFormData({
          logoPosition: content.logoPosition || "left",
          showTitle: content.showTitle !== false,
          showDate: content.showDate || false,
          height: content.height || "standard",
        })
      }
    }
  }, [template])

  const handleFieldChange = <K extends keyof HeaderFormData>(
    field: K,
    value: HeaderFormData[K]
  ) => {
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
          type: "header",
          tenantId,
          createdBy: userId,
          createdAt: serverTimestamp(),
        })
      }

      setSaveStatus("saved")
      setHasUnsavedChanges(false)
      toast.success("Header saved")
      onSaved?.()
    } catch (error) {
      console.error("Error saving header:", error)
      setSaveStatus("unsaved")
      toast.error("Failed to save header")
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
            <PanelTop className="h-5 w-5 text-blue-500" />
            <Input
              value={templateName}
              onChange={(e) => {
                setTemplateName(e.target.value)
                setHasUnsavedChanges(true)
                setSaveStatus("unsaved")
              }}
              className="h-9 w-64 border-transparent bg-transparent text-lg font-semibold focus-visible:border-input focus-visible:ring-0"
              placeholder="Header Name"
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
            Header Settings
          </h3>

          {/* Logo Position */}
          <div className="mb-5 space-y-3">
            <Label className="text-sm font-medium">Logo Position</Label>
            <div className="flex gap-2">
              {(["left", "center", "right"] as const).map((pos) => (
                <Button
                  key={pos}
                  type="button"
                  variant="outline"
                  onClick={() => handleFieldChange("logoPosition", pos)}
                  className={cn(
                    "flex-1 capitalize",
                    formData.logoPosition === pos && "border-primary bg-primary/5"
                  )}
                >
                  {pos}
                </Button>
              ))}
            </div>
          </div>

          {/* Show Title */}
          <div className="mb-5 flex items-center justify-between">
            <Label className="text-sm font-medium">Show Document Title</Label>
            <Switch
              checked={formData.showTitle}
              onCheckedChange={(checked) => handleFieldChange("showTitle", checked)}
            />
          </div>

          {/* Show Date */}
          <div className="mb-5 flex items-center justify-between">
            <Label className="text-sm font-medium">Show Date</Label>
            <Switch
              checked={formData.showDate}
              onCheckedChange={(checked) => handleFieldChange("showDate", checked)}
            />
          </div>

          {/* Header Height */}
          <div className="mb-5 space-y-3">
            <Label className="text-sm font-medium">Header Height</Label>
            <div className="flex gap-2">
              {(["compact", "standard"] as const).map((h) => (
                <Button
                  key={h}
                  type="button"
                  variant="outline"
                  onClick={() => handleFieldChange("height", h)}
                  className={cn(
                    "flex-1 capitalize",
                    formData.height === h && "border-primary bg-primary/5"
                  )}
                >
                  {h}
                </Button>
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
        <div className="flex flex-1 items-start justify-center overflow-auto bg-slate-200 p-10">
          <div className="w-[600px] overflow-hidden rounded-lg bg-white shadow-lg">
            {/* Header Preview Strip */}
            <div
              className={cn(
                "flex items-center border-b-2 border-slate-200 bg-white px-6",
                formData.height === "compact" ? "h-12" : "h-16"
              )}
              style={{
                justifyContent:
                  formData.logoPosition === "center"
                    ? "center"
                    : formData.logoPosition === "right"
                      ? "flex-end"
                      : "flex-start",
              }}
            >
              <div className="flex items-center gap-4">
                {/* Logo placeholder */}
                <div
                  className={cn(
                    "flex items-center justify-center rounded bg-slate-100",
                    formData.height === "compact" ? "h-7 w-20" : "h-9 w-20"
                  )}
                >
                  <Image className="h-4 w-4 text-muted-foreground" />
                </div>

                {/* Title */}
                {formData.showTitle && (
                  <span
                    className={cn(
                      "font-semibold text-slate-600",
                      formData.height === "compact" ? "text-sm" : "text-base"
                    )}
                  >
                    Document Title
                  </span>
                )}

                {/* Date */}
                {formData.showDate && (
                  <span
                    className={cn(
                      "text-muted-foreground",
                      formData.logoPosition === "center" ? "" : "ml-auto",
                      formData.height === "compact" ? "text-xs" : "text-sm"
                    )}
                  >
                    {new Date().toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>

            {/* Content placeholder */}
            <div className="space-y-3 p-10">
              <div className="h-4 w-4/5 rounded bg-slate-100" />
              <div className="h-4 w-[90%] rounded bg-slate-100" />
              <div className="h-4 w-[70%] rounded bg-slate-100" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HeaderEditorModal
