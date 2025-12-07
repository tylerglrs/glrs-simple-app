import { useState, useEffect, useCallback } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Check,
  ChevronRight,
  Send,
  Loader2,
  FileText,
  AlertTriangle,
} from "lucide-react"
import { toast } from "sonner"
import {
  db,
  collection,
  query,
  where,
  getDocs,
  addDoc,
  serverTimestamp,
  Timestamp,
} from "@/lib/firebase"
import type {
  Template,
  SignerRole,
  SignerFormData,
  SendAgreementResult,
  Block,
} from "../../types"
import { SIGNER_ROLES } from "../../constants"
import { SignerForm } from "./SignerForm"

// ==========================================
// HELPER FUNCTIONS
// ==========================================

/**
 * Generate a secure random token for signing links
 */
function generateSecureToken(): string {
  const array = new Uint8Array(24)
  crypto.getRandomValues(array)
  return Array.from(array, (b) => b.toString(16).padStart(2, "0")).join("")
}

/**
 * Calculate expiration date as Firestore Timestamp
 */
function calculateExpiration(days: number): Timestamp {
  const date = new Date()
  date.setDate(date.getDate() + days)
  return Timestamp.fromDate(date)
}

/**
 * Get unique signer roles from template blocks
 */
function getRolesFromTemplate(template: Template): SignerRole[] {
  const roles = new Set<SignerRole>()
  const blocks = template?.content?.blocks || []

  blocks.forEach((block: Block) => {
    if ("role" in block && block.role) {
      roles.add(block.role as SignerRole)
    }
  })

  // Always include PIR as minimum
  if (roles.size === 0) {
    roles.add("pir")
  }

  return Array.from(roles)
}

/**
 * Validate email format
 */
function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

// ==========================================
// COMPONENT
// ==========================================

interface SendForSignatureModalProps {
  open: boolean
  onClose: () => void
  template?: Template | null // Optional - if not provided, step 1 shows template selection
  user: {
    uid: string
    email?: string
    firstName?: string
    lastName?: string
  }
  tenantId: string
  onSuccess: (result: SendAgreementResult) => void
}

/**
 * SendForSignatureModal - Multi-step modal for sending documents for signature
 * Ported from templates.html lines 8546-9439
 *
 * Steps:
 * 1. Select Template (skipped if template prop provided)
 * 2. Add Signers - collect signer info for each role
 * 3. Review & Send - confirm and create agreement
 *
 * Features:
 * - Detects required signers from template blocks
 * - Creates agreement in Firebase
 * - Creates email notification in mail collection
 * - Returns signing links for each signer
 */
export function SendForSignatureModal({
  open,
  onClose,
  template,
  user,
  tenantId,
  onSuccess,
}: SendForSignatureModalProps) {
  // Step state - skip template selection if template is provided
  const [step, setStep] = useState(template ? 2 : 1)

  // Step 1: Template selection
  const [documentTemplates, setDocumentTemplates] = useState<Template[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(
    template || null
  )
  const [loadingTemplates, setLoadingTemplates] = useState(!template)

  // Step 2: Signer info
  const [signers, setSigners] = useState<Record<SignerRole, SignerFormData>>({} as Record<SignerRole, SignerFormData>)
  const rolesNeeded = selectedTemplate ? getRolesFromTemplate(selectedTemplate) : []

  // Step 3: Review & Send
  const [documentTitle, setDocumentTitle] = useState(template?.name || "")
  const [expirationDays, setExpirationDays] = useState(14)

  // General state
  const [sending, setSending] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Load document templates for Step 1
  useEffect(() => {
    if (template) {
      setDocumentTitle(template.name)
      return
    }

    const loadTemplates = async () => {
      setLoadingTemplates(true)
      try {
        const templatesQuery = query(
          collection(db, "templates"),
          where("tenantId", "==", tenantId),
          where("type", "==", "document"),
          where("status", "==", "active")
        )
        const snapshot = await getDocs(templatesQuery)
        const templates = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Template[]
        setDocumentTemplates(templates)
      } catch (error) {
        console.error("Error loading templates:", error)
        toast.error("Failed to load templates")
      }
      setLoadingTemplates(false)
    }
    loadTemplates()
  }, [template, tenantId])

  // Initialize signers when template is selected
  useEffect(() => {
    if (selectedTemplate) {
      const roles = getRolesFromTemplate(selectedTemplate)
      const initialSigners: Record<SignerRole, SignerFormData> = {} as Record<SignerRole, SignerFormData>
      roles.forEach((role) => {
        initialSigners[role] = {
          name: role === "glrs"
            ? `${user.firstName || ""} ${user.lastName || ""}`.trim()
            : "",
          email: role === "glrs" ? "" : "", // GLRS signs in portal, no email needed
          order: role === "pir" ? 0 : role === "family" ? 1 : 2,
        }
      })
      setSigners(initialSigners)
      setDocumentTitle(selectedTemplate.name)
    }
  }, [selectedTemplate, user])

  // Reset state when modal opens
  useEffect(() => {
    if (open) {
      setStep(template ? 2 : 1)
      setSelectedTemplate(template || null)
      setDocumentTitle(template?.name || "")
      setExpirationDays(14)
      setErrors({})
      setSending(false)
    }
  }, [open, template])

  // Update signer field
  const updateSigner = useCallback(
    (role: SignerRole, field: keyof SignerFormData, value: string) => {
      setSigners((prev) => ({
        ...prev,
        [role]: { ...prev[role], [field]: value },
      }))
      // Clear error for this field
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[`${role}_${field}`]
        return newErrors
      })
    },
    []
  )

  // Validate step 2 (signers)
  const validateSigners = useCallback((): boolean => {
    const newErrors: Record<string, string> = {}
    rolesNeeded.forEach((role) => {
      const signer = signers[role]
      if (!signer?.name?.trim()) {
        newErrors[`${role}_name`] = `${SIGNER_ROLES[role]?.label || role} name is required`
      }
      if (role !== "glrs" && !signer?.email?.trim()) {
        newErrors[`${role}_email`] = `${SIGNER_ROLES[role]?.label || role} email is required`
      } else if (role !== "glrs" && signer?.email && !isValidEmail(signer.email)) {
        newErrors[`${role}_email`] = "Invalid email format"
      }
    })
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [rolesNeeded, signers])

  // Validate step 3 (review)
  const validateReview = useCallback((): boolean => {
    const newErrors: Record<string, string> = {}
    if (!documentTitle.trim()) {
      newErrors.documentTitle = "Document title is required"
    }
    // Check template has signature fields
    const blocks = selectedTemplate?.content?.blocks || []
    const hasSignatureFields = blocks.some(
      (b) =>
        ["signatureField", "signatureBlock", "initialsField"].includes(b.type)
    )
    if (!hasSignatureFields) {
      newErrors.template = "Template must have at least one signature field"
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [documentTitle, selectedTemplate])

  // Handle next step
  const handleNext = useCallback(() => {
    if (step === 1) {
      if (!selectedTemplate) {
        setErrors({ template: "Please select a template" })
        return
      }
      setStep(2)
    } else if (step === 2) {
      if (validateSigners()) {
        setStep(3)
      }
    }
  }, [step, selectedTemplate, validateSigners])

  // Handle back
  const handleBack = useCallback(() => {
    if (step > 1) {
      setStep(step - 1)
    } else {
      onClose()
    }
  }, [step, onClose])

  // Handle send
  const handleSend = useCallback(async () => {
    if (!validateReview() || !selectedTemplate) return

    setSending(true)
    try {
      // Generate tokens and build signers array
      const signerTokens: string[] = []
      const signersArray: Array<{
        role: SignerRole
        name: string
        email: string | null
        token: string
        status: "pending"
        signedAt: null
        signedFields: string[]
        order: number
      }> = []

      // Sort signers by order
      const sortedRoles = [...rolesNeeded].sort(
        (a, b) => (signers[a]?.order || 0) - (signers[b]?.order || 0)
      )

      sortedRoles.forEach((role, index) => {
        const signer = signers[role]
        const token = generateSecureToken()
        signerTokens.push(token)

        signersArray.push({
          role,
          name: signer.name.trim(),
          email: role === "glrs" ? null : signer.email?.trim() || null,
          token,
          status: "pending",
          signedAt: null,
          signedFields: [],
          order: index,
        })
      })

      // Build agreement document
      const agreement = {
        templateId: selectedTemplate.id,
        documentTitle: documentTitle.trim(),
        status: "sent",

        // Copy template content at time of sending (snapshot)
        content: selectedTemplate.content || { blocks: [] },
        components: selectedTemplate.components || {
          coverPageId: null,
          headerId: null,
          footerId: null,
          endPageId: null,
        },

        // Signers
        signerTokens,
        signers: signersArray,

        // Field values (empty initially)
        fieldValues: {},

        // Audit trail
        auditTrail: [
          {
            timestamp: new Date().toISOString(),
            action: "sent",
            actor: user.email || `${user.firstName} ${user.lastName}`,
            actorRole: "glrs",
            recipients: signersArray
              .filter((s) => s.email)
              .map((s) => s.email as string),
          },
        ],

        // Metadata
        expiresAt: calculateExpiration(expirationDays),
        tenantId,
        createdBy: user.uid,
        createdAt: serverTimestamp(),
        sentAt: serverTimestamp(),
        completedAt: null,
      }

      const docRef = await addDoc(collection(db, "agreements"), agreement)

      // Send email to the first signer (if they have an email - not GLRS)
      const firstSigner = signersArray.find((s) => s.order === 0)
      if (firstSigner && firstSigner.email) {
        const expirationDate = new Date()
        expirationDate.setDate(expirationDate.getDate() + expirationDays)
        const expirationStr = expirationDate.toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
        })

        // Create email in mail collection (triggers Firebase Email Extension)
        await addDoc(collection(db, "mail"), {
          to: firstSigner.email,
          message: {
            subject: `Action Required: Please sign "${documentTitle.trim()}"`,
            html: generateSigningEmailHTML({
              recipientName: firstSigner.name,
              documentTitle: documentTitle.trim(),
              signingLink: `https://app.glrecoveryservices.com/sign.html#${firstSigner.token}`,
              senderName:
                `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
                "GLRS",
              expirationDate: expirationStr,
            }),
          },
          createdAt: serverTimestamp(),
        })
      }

      // Build signing links for success modal
      const signingLinks = signersArray.map((s) => ({
        role: s.role,
        name: s.name,
        email: s.email,
        link: `https://app.glrecoveryservices.com/sign.html#${s.token}`,
      }))

      // Success - return the result
      onSuccess({
        id: docRef.id,
        documentTitle: documentTitle.trim(),
        status: "sent",
        signingLinks,
      })
    } catch (error) {
      console.error("Error creating agreement:", error)
      toast.error(
        "Failed to send document: " +
          (error instanceof Error ? error.message : "Unknown error")
      )
    } finally {
      setSending(false)
    }
  }, [
    validateReview,
    selectedTemplate,
    rolesNeeded,
    signers,
    documentTitle,
    expirationDays,
    tenantId,
    user,
    onSuccess,
  ])

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && !sending && onClose()}>
      <DialogContent className="max-h-[90vh] max-w-xl overflow-hidden p-0">
        {/* Header with gradient */}
        <div className="bg-gradient-to-r from-primary to-teal-600 px-6 py-5">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-white">
              Send for Signature
            </DialogTitle>
            <p className="text-sm text-white/85">
              Step {step} of 3:{" "}
              {step === 1
                ? "Select Template"
                : step === 2
                  ? "Add Signers"
                  : "Review & Send"}
            </p>
          </DialogHeader>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-2 border-b bg-slate-50 py-4">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`flex h-7 w-7 items-center justify-center rounded-full text-sm font-semibold ${
                  s < step
                    ? "bg-emerald-500 text-white"
                    : s === step
                      ? "bg-primary text-white"
                      : "bg-gray-200 text-gray-500"
                }`}
              >
                {s < step ? <Check className="h-4 w-4" /> : s}
              </div>
              {s < 3 && (
                <div
                  className={`h-0.5 w-10 ${
                    s < step ? "bg-emerald-500" : "bg-gray-200"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Content */}
        <div className="max-h-[50vh] overflow-y-auto px-6 py-5">
          {/* Step 1: Select Template */}
          {step === 1 && (
            <div>
              <h4 className="mb-4 text-base font-semibold text-slate-700">
                Select a Document Template
              </h4>

              {loadingTemplates ? (
                <div className="py-10 text-center">
                  <Loader2 className="mx-auto mb-4 h-10 w-10 animate-spin text-primary" />
                  <p className="text-muted-foreground">Loading templates...</p>
                </div>
              ) : documentTemplates.length === 0 ? (
                <div className="rounded-lg bg-slate-100 py-10 text-center">
                  <FileText className="mx-auto mb-3 h-10 w-10 text-muted-foreground/50" />
                  <p className="text-muted-foreground">
                    No active document templates found.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {documentTemplates.map((tmpl) => (
                    <button
                      key={tmpl.id}
                      type="button"
                      onClick={() => setSelectedTemplate(tmpl)}
                      className={`rounded-lg border-2 p-4 text-left transition-all ${
                        selectedTemplate?.id === tmpl.id
                          ? "border-primary bg-primary/5"
                          : "border-gray-200 bg-white hover:border-gray-300"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="mb-1 text-base font-semibold text-slate-700">
                            {tmpl.name}
                          </div>
                          {tmpl.description && (
                            <div className="text-xs text-muted-foreground">
                              {tmpl.description}
                            </div>
                          )}
                        </div>
                        {selectedTemplate?.id === tmpl.id && (
                          <Check className="h-5 w-5 text-primary" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {errors.template && (
                <div className="mt-3 flex items-center gap-1 text-xs text-destructive">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  {errors.template}
                </div>
              )}
            </div>
          )}

          {/* Step 2: Add Signers */}
          {step === 2 && (
            <div>
              <h4 className="mb-2 text-base font-semibold text-slate-700">
                Signer Information
              </h4>
              <p className="mb-5 text-xs text-muted-foreground">
                Signing order:{" "}
                {rolesNeeded.map((r) => SIGNER_ROLES[r]?.label || r).join(" → ")}
              </p>

              <div className="flex flex-col gap-5">
                {[...rolesNeeded]
                  .sort((a, b) => (signers[a]?.order || 0) - (signers[b]?.order || 0))
                  .map((role) => (
                    <SignerForm
                      key={role}
                      role={role}
                      data={signers[role] || { name: "", email: "", order: 0 }}
                      errors={errors}
                      onChange={(field, value) =>
                        updateSigner(role, field, value)
                      }
                    />
                  ))}
              </div>
            </div>
          )}

          {/* Step 3: Review & Send */}
          {step === 3 && (
            <div>
              <h4 className="mb-5 text-base font-semibold text-slate-700">
                Review & Send
              </h4>

              {/* Document Title */}
              <div className="mb-5">
                <Label className="mb-1.5 block text-xs font-semibold text-muted-foreground">
                  Document Title <span className="text-destructive">*</span>
                </Label>
                <Input
                  type="text"
                  value={documentTitle}
                  onChange={(e) => {
                    setDocumentTitle(e.target.value)
                    setErrors((prev) => {
                      const newErrors = { ...prev }
                      delete newErrors.documentTitle
                      return newErrors
                    })
                  }}
                  className={
                    errors.documentTitle
                      ? "border-destructive focus-visible:ring-destructive"
                      : ""
                  }
                />
                {errors.documentTitle && (
                  <div className="mt-1 text-xs text-destructive">
                    {errors.documentTitle}
                  </div>
                )}
              </div>

              {/* Summary */}
              <div className="mb-5 rounded-lg bg-slate-100 p-4">
                <div className="mb-3 text-xs font-semibold text-muted-foreground">
                  This document will be sent to:
                </div>

                {[...rolesNeeded]
                  .sort((a, b) => (signers[a]?.order || 0) - (signers[b]?.order || 0))
                  .map((role, index) => {
                    const signer = signers[role]
                    const roleConfig = SIGNER_ROLES[role]
                    return (
                      <div
                        key={role}
                        className={`flex items-center gap-3 rounded-lg bg-white p-3 ${
                          index < rolesNeeded.length - 1 ? "mb-2" : ""
                        }`}
                      >
                        <span
                          className="flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold text-white"
                          style={{ backgroundColor: roleConfig?.color }}
                        >
                          {index + 1}
                        </span>
                        <div className="flex-1">
                          <div className="text-sm font-medium text-slate-700">
                            {signer?.name}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {roleConfig?.label} •{" "}
                            {role === "glrs" ? "Signs in portal" : signer?.email}
                          </div>
                        </div>
                      </div>
                    )
                  })}
              </div>

              {/* Expiration */}
              <div className="mb-5">
                <Label className="mb-1.5 block text-xs font-semibold text-muted-foreground">
                  Expires After
                </Label>
                <Select
                  value={expirationDays.toString()}
                  onValueChange={(v) => setExpirationDays(parseInt(v))}
                >
                  <SelectTrigger className="bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">7 days</SelectItem>
                    <SelectItem value="14">14 days</SelectItem>
                    <SelectItem value="30">30 days</SelectItem>
                    <SelectItem value="60">60 days</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {errors.template && (
                <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-destructive">
                  <AlertTriangle className="h-4 w-4" />
                  {errors.template}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 border-t bg-white px-6 py-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleBack}
            disabled={sending}
          >
            {step > 1 ? "Back" : "Cancel"}
          </Button>

          {step < 3 ? (
            <Button
              onClick={handleNext}
              disabled={step === 1 && !selectedTemplate}
              className="bg-gradient-to-r from-primary to-teal-600 hover:from-primary/90 hover:to-teal-600/90"
            >
              Next
              <ChevronRight className="ml-1.5 h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={handleSend}
              disabled={sending}
              className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800"
            >
              {sending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Send for Signature
                </>
              )}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ==========================================
// EMAIL HTML GENERATOR
// ==========================================

interface EmailData {
  recipientName: string
  documentTitle: string
  signingLink: string
  senderName: string
  expirationDate: string
}

function generateSigningEmailHTML(data: EmailData): string {
  const { recipientName, documentTitle, signingLink, senderName, expirationDate } = data

  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
      <div style="background: linear-gradient(135deg, #0077CC 0%, #008B8B 100%); padding: 32px 24px; text-align: center;">
        <h1 style="font-size: 24px; font-weight: 700; color: white; margin: 0;">GLRS Lighthouse</h1>
        <p style="color: rgba(255,255,255,0.9); font-size: 14px; margin: 8px 0 0 0;">Guiding Light Recovery Services</p>
      </div>
      <div style="padding: 32px 24px;">
        <h2 style="font-size: 18px; color: #1F2937; margin: 0 0 16px 0;">Hello ${recipientName},</h2>
        <p style="font-size: 15px; color: #4B5563; line-height: 1.6; margin: 0 0 16px 0;">
          ${senderName} has sent you a document to review and sign. Please review the document carefully before signing.
        </p>
        <div style="background: #F3F4F6; border-radius: 8px; padding: 16px; margin: 24px 0;">
          <p style="font-size: 16px; font-weight: 600; color: #1F2937; margin: 0 0 4px 0;">${documentTitle}</p>
          <p style="font-size: 13px; color: #6B7280; margin: 0;">Expires: ${expirationDate}</p>
        </div>
        <div style="text-align: center; margin: 24px 0;">
          <a href="${signingLink}" style="display: inline-block; background: linear-gradient(135deg, #0077CC 0%, #008B8B 100%); color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 15px;">
            Review & Sign Document
          </a>
        </div>
        <div style="background: #FEF3C7; border-left: 4px solid #F59E0B; padding: 12px 16px; margin: 16px 0; border-radius: 0 8px 8px 0;">
          <p style="font-size: 13px; color: #92400E; margin: 0;">
            <strong>Important:</strong> This link is unique to you and should not be shared.
            Please complete your signature before ${expirationDate}.
          </p>
        </div>
        <p style="font-size: 15px; color: #4B5563; line-height: 1.6; margin: 0;">
          If you have any questions about this document, please contact GLRS directly.
        </p>
      </div>
      <div style="background: #F9FAFB; padding: 24px; border-top: 1px solid #E5E7EB;">
        <p style="font-size: 12px; color: #9CA3AF; text-align: center; margin: 0;">
          This email was sent by Guiding Light Recovery Services.<br>
          If you did not expect this document, please contact us immediately.
        </p>
      </div>
    </div>
  `
}

export default SendForSignatureModal
