import { useState, useEffect, useCallback, useMemo } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import {
  X,
  CheckCircle,
  Clock,
  Check,
  Loader2,
} from "lucide-react"
import { toast } from "sonner"
import {
  db,
  doc,
  updateDoc,
  serverTimestamp,
  arrayUnion,
} from "@/lib/firebase"
import type { Agreement, Block, SignerRole } from "../../types"
import { SIGNER_ROLES } from "../../constants"
import { SignatureCanvas } from "./SignatureCanvas"
import { SigningFieldRenderer } from "./SigningFieldRenderer"

interface GLRSSigningModalProps {
  /** Whether the modal is open */
  open: boolean
  /** The agreement to sign */
  agreement: Agreement | null
  /** Current user info */
  user: {
    uid: string
    email?: string
    firstName?: string
    lastName?: string
  }
  /** Callback when modal closes */
  onClose: () => void
  /** Callback when signing is complete */
  onComplete: () => void
}

// Field types that GLRS can sign
const SIGNABLE_FIELD_TYPES = [
  "signatureField",
  "signatureBlock",
  "initialsField",
  "dateField",
  "textInputField",
  "checkboxField",
  "dropdownField",
]

/**
 * GLRSSigningModal - Modal for GLRS staff to counter-sign documents
 * Ported from templates.html lines 9443-9993
 *
 * Features:
 * - Shows previous signers' status
 * - Displays GLRS-assigned fields
 * - Signature capture via SignatureCanvas
 * - Field progress indicator
 * - Updates agreement in Firebase on submit
 * - Marks agreement as completed if all signers done
 */
export function GLRSSigningModal({
  open,
  agreement,
  user,
  onClose,
  onComplete,
}: GLRSSigningModalProps) {
  // State for field values
  const [fieldValues, setFieldValues] = useState<Record<string, unknown>>({})

  // Signature capture state
  const [showSignatureCapture, setShowSignatureCapture] = useState(false)
  const [currentField, setCurrentField] = useState<Block | null>(null)

  // Saving state
  const [saving, setSaving] = useState(false)

  // Get GLRS fields that need to be signed
  const glrsFields = useMemo(() => {
    if (!agreement?.content?.blocks) return []
    return agreement.content.blocks.filter(
      (block): block is Block & { role: SignerRole; required?: boolean; label?: string } =>
        "role" in block &&
        block.role === "glrs" &&
        SIGNABLE_FIELD_TYPES.includes(block.type)
    )
  }, [agreement])

  // Calculate progress
  const requiredFields = useMemo(
    () => glrsFields.filter((f) => f.required),
    [glrsFields]
  )
  const completedFields = useMemo(
    () => requiredFields.filter((f) => fieldValues[f.id] !== undefined && fieldValues[f.id] !== ""),
    [requiredFields, fieldValues]
  )
  const canSubmit = completedFields.length === requiredFields.length

  // Initialize field values from agreement
  useEffect(() => {
    if (agreement?.fieldValues) {
      setFieldValues(agreement.fieldValues as Record<string, unknown>)
    } else {
      setFieldValues({})
    }
  }, [agreement])

  // Reset state when modal closes
  useEffect(() => {
    if (!open) {
      setShowSignatureCapture(false)
      setCurrentField(null)
      setSaving(false)
    }
  }, [open])

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !saving && !showSignatureCapture) {
        onClose()
      }
    }
    if (open) {
      window.addEventListener("keydown", handleEscape)
      return () => window.removeEventListener("keydown", handleEscape)
    }
  }, [open, saving, showSignatureCapture, onClose])

  // Handle field value change
  const handleFieldChange = useCallback((fieldId: string, value: unknown) => {
    setFieldValues((prev) => ({ ...prev, [fieldId]: value }))
  }, [])

  // Handle signature field click
  const handleSignatureClick = useCallback((field: Block) => {
    setCurrentField(field)
    setShowSignatureCapture(true)
  }, [])

  // Handle signature capture
  const handleSignatureCapture = useCallback((dataUrl: string) => {
    if (currentField) {
      setFieldValues((prev) => ({ ...prev, [currentField.id]: dataUrl }))
      setShowSignatureCapture(false)
      setCurrentField(null)
    }
  }, [currentField])

  // Handle submit
  const handleSubmit = useCallback(async () => {
    if (!canSubmit || !agreement) return

    setSaving(true)
    try {
      // Find GLRS signer index
      const glrsSignerIndex = agreement.signers.findIndex(
        (s) => s.role === "glrs"
      )
      if (glrsSignerIndex === -1) {
        throw new Error("GLRS signer not found in agreement")
      }

      // Update signers array
      const updatedSigners = agreement.signers.map((signer, index) => {
        if (index === glrsSignerIndex) {
          return {
            ...signer,
            status: "signed" as const,
            signedAt: new Date().toISOString(),
            signedFields: glrsFields.map((f) => f.id),
          }
        }
        return signer
      })

      // Check if all signers have signed
      const allSigned = updatedSigners.every((s) => s.status === "signed")

      // Build audit trail entry
      const auditEntry = {
        timestamp: new Date().toISOString(),
        action: "signed" as const,
        actor: user.email || `${user.firstName || ""} ${user.lastName || ""}`.trim() || "GLRS Staff",
        actorRole: "glrs" as const,
        fields: glrsFields.map((f) => f.id),
      }

      // Update agreement in Firestore
      await updateDoc(doc(db, "agreements", agreement.id), {
        fieldValues: { ...agreement.fieldValues, ...fieldValues },
        signers: updatedSigners,
        status: allSigned ? "completed" : "partially_signed",
        completedAt: allSigned ? serverTimestamp() : null,
        auditTrail: arrayUnion(auditEntry),
      })

      toast.success(
        allSigned
          ? "Document fully signed and completed!"
          : "GLRS signature added successfully"
      )
      onComplete()
    } catch (error) {
      console.error("Error signing document:", error)
      toast.error(
        "Failed to sign document: " +
          (error instanceof Error ? error.message : "Unknown error")
      )
    } finally {
      setSaving(false)
    }
  }, [canSubmit, agreement, fieldValues, glrsFields, user, onComplete])

  if (!agreement) return null

  // Get other signers (non-GLRS) for status display
  const otherSigners = agreement.signers.filter((s) => s.role !== "glrs")

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && !saving && onClose()}>
      <DialogContent className="flex max-h-[90vh] max-w-2xl flex-col overflow-hidden p-0">
        {/* Header with orange gradient (GLRS color) */}
        <div className="flex items-center justify-between bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-5">
          <div>
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold text-white">
                GLRS Counter-Signature
              </DialogTitle>
            </DialogHeader>
            <p className="mt-1 text-sm text-white/85">
              {agreement.documentTitle || "Service Agreement"}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            disabled={saving}
            className="h-9 w-9 rounded-full bg-white/20 text-white hover:bg-white/30"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Previous Signers Status */}
        {otherSigners.length > 0 && (
          <div className="border-b bg-slate-100 px-6 py-3">
            <div className="mb-2 text-xs text-muted-foreground">
              Previous Signatures:
            </div>
            <div className="flex flex-wrap gap-2">
              {otherSigners.map((signer) => (
                <div
                  key={signer.role}
                  className="flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium"
                  style={{
                    backgroundColor:
                      signer.status === "signed" ? "#dcfce7" : "#fef3c7",
                    color: signer.status === "signed" ? "#166534" : "#92400e",
                  }}
                >
                  {signer.status === "signed" ? (
                    <CheckCircle className="h-3.5 w-3.5 text-emerald-600" />
                  ) : (
                    <Clock className="h-3.5 w-3.5 text-amber-600" />
                  )}
                  {signer.name} ({SIGNER_ROLES[signer.role]?.label || signer.role})
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Content - GLRS Fields */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {glrsFields.length === 0 ? (
            <div className="py-10 text-center">
              <p className="text-muted-foreground">
                No fields assigned to GLRS for this document.
              </p>
            </div>
          ) : (
            <>
              <p className="mb-5 text-sm text-muted-foreground">
                Complete the following fields to finalize the document:
              </p>

              <div className="flex flex-col gap-4">
                {glrsFields.map((field) => (
                  <SigningFieldRenderer
                    key={field.id}
                    field={field}
                    value={fieldValues[field.id]}
                    isCurrentRole={true}
                    onChange={(value) => handleFieldChange(field.id, value)}
                    onSignatureClick={() => handleSignatureClick(field)}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t bg-white px-6 py-4">
          <div className="text-xs text-muted-foreground">
            {completedFields.length} of {requiredFields.length} required fields
            completed
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} disabled={saving}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!canSubmit || saving}
              className={
                !canSubmit || saving
                  ? "bg-gray-300"
                  : "bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700"
              }
            >
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing...
                </>
              ) : (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Sign & Complete
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Signature Capture Modal */}
        {showSignatureCapture && currentField && (
          <Dialog
            open={showSignatureCapture}
            onOpenChange={(isOpen) => !isOpen && setShowSignatureCapture(false)}
          >
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {currentField.type === "initialsField"
                    ? "Add Your Initials"
                    : "Add Your Signature"}
                </DialogTitle>
              </DialogHeader>
              <SignatureCanvas
                type={currentField.type === "initialsField" ? "initials" : "signature"}
                onCapture={handleSignatureCapture}
                onCancel={() => {
                  setShowSignatureCapture(false)
                  setCurrentField(null)
                }}
              />
            </DialogContent>
          </Dialog>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default GLRSSigningModal
