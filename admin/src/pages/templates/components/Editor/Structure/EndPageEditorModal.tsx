import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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
  FileCheck,
  Phone,
  Mail,
  MapPin,
  Globe,
  Check,
  AlertCircle,
} from "lucide-react"
import { toast } from "sonner"
import { db, doc, updateDoc, addDoc, collection, serverTimestamp } from "@/lib/firebase"
import type { Template, TemplateStatus } from "../../../types"
import { cn } from "@/lib/utils"

type SaveStatus = "saved" | "saving" | "unsaved"

interface SocialLinks {
  website: string
  facebook: string
  instagram: string
}

interface EndPageFormData {
  phone: string
  email: string
  address: string
  message: string
  showSocialLinks: boolean
  socialLinks: SocialLinks
}

interface EndPageEditorModalProps {
  template?: Template | null
  tenantId: string
  userId: string
  open: boolean
  onClose: () => void
  onSaved?: () => void
}

/**
 * EndPageEditorModal - Full-screen editor for end page templates
 * Ported from templates.html lines 5318-5577
 */
export function EndPageEditorModal({
  template,
  tenantId,
  userId,
  open,
  onClose,
  onSaved,
}: EndPageEditorModalProps) {
  // Form state
  const [formData, setFormData] = useState<EndPageFormData>({
    phone: "",
    email: "",
    address: "",
    message:
      "Thank you for choosing Guiding Light Recovery Services. If you have any questions, please contact us.",
    showSocialLinks: false,
    socialLinks: { website: "", facebook: "", instagram: "" },
  })
  const [templateName, setTemplateName] = useState("New End Page")
  const [templateStatus, setTemplateStatus] = useState<TemplateStatus>("draft")
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("saved")
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  // Initialize from template
  useEffect(() => {
    if (template) {
      setTemplateName(template.name || "New End Page")
      setTemplateStatus(template.status || "draft")
      const content = template.content as unknown as EndPageFormData | undefined
      if (content) {
        setFormData({
          phone: content.phone || "",
          email: content.email || "",
          address: content.address || "",
          message:
            content.message ||
            "Thank you for choosing Guiding Light Recovery Services. If you have any questions, please contact us.",
          showSocialLinks: content.showSocialLinks || false,
          socialLinks: content.socialLinks || { website: "", facebook: "", instagram: "" },
        })
      }
    }
  }, [template])

  const handleFieldChange = <K extends keyof EndPageFormData>(
    field: K,
    value: EndPageFormData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setHasUnsavedChanges(true)
    setSaveStatus("unsaved")
  }

  const handleSocialLinkChange = (platform: keyof SocialLinks, value: string) => {
    setFormData((prev) => ({
      ...prev,
      socialLinks: { ...prev.socialLinks, [platform]: value },
    }))
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
          type: "endPage",
          tenantId,
          createdBy: userId,
          createdAt: serverTimestamp(),
        })
      }

      setSaveStatus("saved")
      setHasUnsavedChanges(false)
      toast.success("End page saved")
      onSaved?.()
    } catch (error) {
      console.error("Error saving end page:", error)
      setSaveStatus("unsaved")
      toast.error("Failed to save end page")
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
            <FileCheck className="h-5 w-5 text-emerald-500" />
            <Input
              value={templateName}
              onChange={(e) => {
                setTemplateName(e.target.value)
                setHasUnsavedChanges(true)
                setSaveStatus("unsaved")
              }}
              className="h-9 w-64 border-transparent bg-transparent text-lg font-semibold focus-visible:border-input focus-visible:ring-0"
              placeholder="End Page Name"
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
            End Page Settings
          </h3>

          {/* Contact Information */}
          <div className="mb-6">
            <h4 className="mb-3 text-sm font-semibold text-slate-600">
              Contact Information
            </h4>

            {/* Phone */}
            <div className="mb-4 space-y-2">
              <Label className="text-sm">Phone</Label>
              <Input
                value={formData.phone}
                onChange={(e) => handleFieldChange("phone", e.target.value)}
                placeholder="(555) 123-4567"
              />
            </div>

            {/* Email */}
            <div className="mb-4 space-y-2">
              <Label className="text-sm">Email</Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => handleFieldChange("email", e.target.value)}
                placeholder="contact@glrs.com"
              />
            </div>

            {/* Address */}
            <div className="mb-4 space-y-2">
              <Label className="text-sm">Address</Label>
              <Textarea
                value={formData.address}
                onChange={(e) => handleFieldChange("address", e.target.value)}
                placeholder={"123 Recovery Lane\nSan Mateo, CA 94401"}
                rows={3}
              />
            </div>
          </div>

          {/* Message */}
          <div className="mb-6 space-y-2">
            <Label className="text-sm font-medium">Message / Next Steps</Label>
            <Textarea
              value={formData.message}
              onChange={(e) => handleFieldChange("message", e.target.value)}
              rows={4}
            />
          </div>

          {/* Social Links Toggle */}
          <div className="mb-4 flex items-center justify-between">
            <Label className="text-sm font-medium">Show Social Links</Label>
            <Switch
              checked={formData.showSocialLinks}
              onCheckedChange={(checked) => handleFieldChange("showSocialLinks", checked)}
            />
          </div>

          {/* Social Links */}
          {formData.showSocialLinks && (
            <div className="mb-6 space-y-3 pl-1">
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Website</Label>
                <Input
                  type="url"
                  value={formData.socialLinks.website}
                  onChange={(e) => handleSocialLinkChange("website", e.target.value)}
                  placeholder="https://glrecoveryservices.com"
                  className="h-9 text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Facebook</Label>
                <Input
                  type="url"
                  value={formData.socialLinks.facebook}
                  onChange={(e) => handleSocialLinkChange("facebook", e.target.value)}
                  placeholder="https://facebook.com/glrs"
                  className="h-9 text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Instagram</Label>
                <Input
                  type="url"
                  value={formData.socialLinks.instagram}
                  onChange={(e) => handleSocialLinkChange("instagram", e.target.value)}
                  placeholder="https://instagram.com/glrs"
                  className="h-9 text-sm"
                />
              </div>
            </div>
          )}

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
          <div className="flex min-h-[520px] w-[400px] flex-col items-center justify-center rounded-lg bg-slate-50 p-12 text-center shadow-lg">
            {/* Message */}
            {formData.message && (
              <p className="mb-8 text-base leading-relaxed text-slate-600">
                {formData.message}
              </p>
            )}

            {/* Contact Info */}
            <div className="mb-8 space-y-2">
              {formData.phone && (
                <p className="flex items-center justify-center gap-2 text-sm text-slate-500">
                  <Phone className="h-4 w-4" />
                  {formData.phone}
                </p>
              )}
              {formData.email && (
                <p className="flex items-center justify-center gap-2 text-sm text-slate-500">
                  <Mail className="h-4 w-4" />
                  {formData.email}
                </p>
              )}
              {formData.address && (
                <p className="flex items-start justify-center gap-2 whitespace-pre-line text-sm text-slate-500">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                  {formData.address}
                </p>
              )}
            </div>

            {/* Social Links */}
            {formData.showSocialLinks && (
              <div className="flex gap-4">
                {formData.socialLinks.website && (
                  <Globe className="h-6 w-6 text-slate-400" />
                )}
                {formData.socialLinks.facebook && (
                  <div className="flex h-6 w-6 items-center justify-center rounded bg-slate-200 text-xs font-bold text-slate-500">
                    f
                  </div>
                )}
                {formData.socialLinks.instagram && (
                  <div className="flex h-6 w-6 items-center justify-center rounded bg-slate-200 text-xs font-bold text-slate-500">
                    ig
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default EndPageEditorModal
