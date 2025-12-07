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
  PanelBottom,
  Check,
  AlertCircle,
} from "lucide-react"
import { toast } from "sonner"
import { db, doc, updateDoc, addDoc, collection, serverTimestamp } from "@/lib/firebase"
import type { Template, TemplateStatus } from "../../../types"
import { cn } from "@/lib/utils"

type SaveStatus = "saved" | "saving" | "unsaved"

interface FooterFormData {
  showPageNumbers: boolean
  pageNumberFormat: "pageX" | "pageXofY"
  confidentialityText: string
  customText: string
}

interface FooterEditorModalProps {
  template?: Template | null
  tenantId: string
  userId: string
  open: boolean
  onClose: () => void
  onSaved?: () => void
}

/**
 * FooterEditorModal - Full-screen editor for footer templates
 * Ported from templates.html lines 5089-5313
 */
export function FooterEditorModal({
  template,
  tenantId,
  userId,
  open,
  onClose,
  onSaved,
}: FooterEditorModalProps) {
  // Form state
  const [formData, setFormData] = useState<FooterFormData>({
    showPageNumbers: true,
    pageNumberFormat: "pageX",
    confidentialityText: "CONFIDENTIAL",
    customText: "",
  })
  const [templateName, setTemplateName] = useState("New Footer")
  const [templateStatus, setTemplateStatus] = useState<TemplateStatus>("draft")
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("saved")
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  // Initialize from template
  useEffect(() => {
    if (template) {
      setTemplateName(template.name || "New Footer")
      setTemplateStatus(template.status || "draft")
      const content = template.content as unknown as FooterFormData | undefined
      if (content) {
        setFormData({
          showPageNumbers: content.showPageNumbers !== false,
          pageNumberFormat: content.pageNumberFormat || "pageX",
          confidentialityText: content.confidentialityText || "CONFIDENTIAL",
          customText: content.customText || "",
        })
      }
    }
  }, [template])

  const handleFieldChange = <K extends keyof FooterFormData>(
    field: K,
    value: FooterFormData[K]
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
          type: "footer",
          tenantId,
          createdBy: userId,
          createdAt: serverTimestamp(),
        })
      }

      setSaveStatus("saved")
      setHasUnsavedChanges(false)
      toast.success("Footer saved")
      onSaved?.()
    } catch (error) {
      console.error("Error saving footer:", error)
      setSaveStatus("unsaved")
      toast.error("Failed to save footer")
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

  const formatPageNumber = (format: string) => {
    return format === "pageXofY" ? "Page 1 of 5" : "Page 1"
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
            <PanelBottom className="h-5 w-5 text-amber-500" />
            <Input
              value={templateName}
              onChange={(e) => {
                setTemplateName(e.target.value)
                setHasUnsavedChanges(true)
                setSaveStatus("unsaved")
              }}
              className="h-9 w-64 border-transparent bg-transparent text-lg font-semibold focus-visible:border-input focus-visible:ring-0"
              placeholder="Footer Name"
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
            Footer Settings
          </h3>

          {/* Page Numbers Toggle */}
          <div className="mb-5 flex items-center justify-between">
            <Label className="text-sm font-medium">Show Page Numbers</Label>
            <Switch
              checked={formData.showPageNumbers}
              onCheckedChange={(checked) => handleFieldChange("showPageNumbers", checked)}
            />
          </div>

          {/* Page Number Format */}
          {formData.showPageNumbers && (
            <div className="mb-5 space-y-3">
              <Label className="text-sm font-medium">Page Number Format</Label>
              <div className="flex gap-2">
                {([
                  { value: "pageX", label: "Page X" },
                  { value: "pageXofY", label: "Page X of Y" },
                ] as const).map((opt) => (
                  <Button
                    key={opt.value}
                    type="button"
                    variant="outline"
                    onClick={() => handleFieldChange("pageNumberFormat", opt.value)}
                    className={cn(
                      "flex-1",
                      formData.pageNumberFormat === opt.value && "border-primary bg-primary/5"
                    )}
                  >
                    {opt.label}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Confidentiality Text */}
          <div className="mb-5 space-y-2">
            <Label className="text-sm font-medium">Confidentiality Statement</Label>
            <Input
              value={formData.confidentialityText}
              onChange={(e) => handleFieldChange("confidentialityText", e.target.value)}
              placeholder="CONFIDENTIAL"
            />
            <p className="text-xs text-muted-foreground">Leave empty to hide</p>
          </div>

          {/* Custom Text */}
          <div className="mb-5 space-y-2">
            <Label className="text-sm font-medium">Custom Text</Label>
            <Input
              value={formData.customText}
              onChange={(e) => handleFieldChange("customText", e.target.value)}
              placeholder="Optional footer text"
            />
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
        <div className="flex flex-1 items-end justify-center overflow-auto bg-slate-200 p-10">
          <div className="w-[600px] overflow-hidden rounded-lg bg-white shadow-lg">
            {/* Content placeholder */}
            <div className="min-h-[250px] space-y-3 p-10">
              <div className="h-4 w-4/5 rounded bg-slate-100" />
              <div className="h-4 w-[90%] rounded bg-slate-100" />
              <div className="h-4 w-[70%] rounded bg-slate-100" />
            </div>

            {/* Footer Preview Strip */}
            <div className="flex h-12 items-center justify-between border-t border-slate-200 bg-slate-50 px-6">
              {/* Left: Confidentiality */}
              <div className="flex items-center gap-2">
                {formData.confidentialityText && (
                  <span className="text-[11px] font-semibold tracking-wide text-red-600">
                    {formData.confidentialityText}
                  </span>
                )}
              </div>

              {/* Center: Custom text */}
              {formData.customText && (
                <span className="flex-1 text-center text-[11px] text-muted-foreground">
                  {formData.customText}
                </span>
              )}

              {/* Right: Page numbers */}
              {formData.showPageNumbers && (
                <span className="text-[11px] text-muted-foreground">
                  {formatPageNumber(formData.pageNumberFormat)}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FooterEditorModal
