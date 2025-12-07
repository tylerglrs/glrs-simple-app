import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import {
  X,
  Users,
  Activity,
  Check,
  CheckCircle,
  Copy,
  Mail,
  Edit,
  Download,
  Send,
  Eye,
  Loader2,
} from "lucide-react"
import { toast } from "sonner"
import type { Agreement, Signer } from "../../types"
import { AGREEMENT_STATUS, SIGNER_ROLES } from "../../constants"

interface AgreementDetailModalProps {
  open: boolean
  agreement: Agreement | null
  onClose: () => void
  onSignAsGLRS: (agreement: Agreement) => void
  onCopyLink: (agreement: Agreement, signer: Signer) => void
  onVoid: (agreement: Agreement) => void
  onResendEmail?: (agreement: Agreement, signer: Signer) => Promise<void>
  onDownloadPDF: (agreement: Agreement) => Promise<void>
}

// Format date with time
function formatDate(timestamp: unknown): string {
  if (!timestamp) return "-"
  const date =
    timestamp instanceof Date
      ? timestamp
      : typeof timestamp === "object" && "toDate" in timestamp
        ? (timestamp as { toDate: () => Date }).toDate()
        : new Date(timestamp as string)
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

// Get action icon
function getActionIcon(action: string) {
  switch (action) {
    case "sent":
      return Send
    case "viewed":
      return Eye
    case "signed":
      return CheckCircle
    case "field_signed":
      return Edit
    case "voided":
      return X
    case "declined":
      return X
    default:
      return Activity
  }
}

/**
 * AgreementDetailModal - Shows full agreement details
 * Ported from templates.html lines 10677-11189
 *
 * Features:
 * - Header with status badge
 * - Signers section with status and actions
 * - Audit trail timeline
 * - Footer actions (Void, Download PDF, Close)
 */
export function AgreementDetailModal({
  open,
  agreement,
  onClose,
  onSignAsGLRS,
  onCopyLink,
  onVoid,
  onResendEmail,
  onDownloadPDF,
}: AgreementDetailModalProps) {
  const [sendingReminder, setSendingReminder] = useState<string | null>(null)
  const [downloadingPDF, setDownloadingPDF] = useState(false)

  if (!agreement) return null

  // Get status config
  const statusConfig =
    AGREEMENT_STATUS[agreement.status as keyof typeof AGREEMENT_STATUS] ||
    AGREEMENT_STATUS.sent

  // Check if expired
  const isExpired =
    agreement.expiresAt &&
    (agreement.expiresAt instanceof Date
      ? agreement.expiresAt
      : typeof agreement.expiresAt === "object" && "toDate" in agreement.expiresAt
        ? (agreement.expiresAt as { toDate: () => Date }).toDate()
        : new Date(agreement.expiresAt as string)
    ) < new Date()

  const effectiveStatus =
    isExpired &&
    agreement.status !== "completed" &&
    agreement.status !== "voided"
      ? "expired"
      : agreement.status

  const effectiveStatusConfig =
    AGREEMENT_STATUS[effectiveStatus as keyof typeof AGREEMENT_STATUS] ||
    statusConfig

  // Handle resend email
  const handleResendEmail = async (signer: Signer) => {
    if (!onResendEmail) return
    setSendingReminder(signer.token)
    try {
      await onResendEmail(agreement, signer)
      toast.success(`Reminder sent to ${signer.name}`)
    } catch {
      toast.error("Failed to send reminder")
    } finally {
      setSendingReminder(null)
    }
  }

  // Handle download PDF
  const handleDownloadPDF = async () => {
    if (agreement.status !== "completed") {
      toast.error("PDF is only available for completed agreements")
      return
    }
    setDownloadingPDF(true)
    try {
      await onDownloadPDF(agreement)
    } finally {
      setDownloadingPDF(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="flex max-h-[90vh] max-w-2xl flex-col overflow-hidden p-0">
        {/* Header with teal gradient */}
        <div className="flex items-start justify-between bg-gradient-to-r from-primary to-teal-600 px-6 py-5">
          <div className="flex-1">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold text-white">
                {agreement.documentTitle}
              </DialogTitle>
            </DialogHeader>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <span
                className="rounded-xl px-3 py-1 text-xs font-semibold"
                style={{
                  backgroundColor: effectiveStatusConfig.bg,
                  color: effectiveStatusConfig.color,
                }}
              >
                {effectiveStatusConfig.label}
              </span>
              <span className="text-xs text-white/80">
                Sent {formatDate(agreement.sentAt)}
              </span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-9 w-9 rounded-full bg-white/20 text-white hover:bg-white/30"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {/* Signers Section */}
          <div className="mb-6">
            <h4 className="mb-4 flex items-center gap-2 text-base font-semibold text-slate-700">
              <Users className="h-5 w-5" />
              Signers
            </h4>

            <div className="flex flex-col gap-3">
              {agreement.signers?.map((signer, idx) => {
                const roleConfig = SIGNER_ROLES[signer.role]
                const isPending = signer.status === "pending"
                const isTheirTurn =
                  isPending &&
                  agreement.signers
                    .filter((s) => s.order < signer.order)
                    .every((s) => s.status === "signed")

                return (
                  <div
                    key={idx}
                    className="rounded-lg border-2 p-4"
                    style={{
                      backgroundColor: roleConfig?.bgLight || "#F3F4F6",
                      borderColor: roleConfig?.borderColor || "#E5E7EB",
                    }}
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="flex h-9 w-9 items-center justify-center rounded-full"
                          style={{
                            backgroundColor:
                              signer.status === "signed"
                                ? roleConfig?.color
                                : "transparent",
                            border: `3px solid ${roleConfig?.color || "#9CA3AF"}`,
                          }}
                        >
                          {signer.status === "signed" ? (
                            <Check className="h-5 w-5 text-white" />
                          ) : (
                            <span
                              className="text-sm font-semibold"
                              style={{ color: roleConfig?.color }}
                            >
                              {idx + 1}
                            </span>
                          )}
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-slate-700">
                            {signer.name}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span
                              className="rounded px-1.5 py-0.5 text-[10px] font-semibold text-white"
                              style={{ backgroundColor: roleConfig?.color }}
                            >
                              {roleConfig?.label || signer.role}
                            </span>
                            {signer.email && <span>{signer.email}</span>}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {signer.status === "signed" ? (
                          <span className="flex items-center gap-1 text-xs text-emerald-600">
                            <CheckCircle className="h-3.5 w-3.5" />
                            Signed {formatDate(signer.signedAt)}
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            {isTheirTurn
                              ? "Awaiting signature"
                              : "Waiting for previous signer"}
                          </span>
                        )}

                        {/* Actions for pending signers whose turn it is */}
                        {isPending && isTheirTurn && (
                          <>
                            {signer.role === "glrs" ? (
                              <Button
                                size="sm"
                                onClick={() => onSignAsGLRS(agreement)}
                                className="bg-gradient-to-r from-orange-500 to-orange-600 text-xs hover:from-orange-600 hover:to-orange-700"
                              >
                                <Edit className="mr-1.5 h-3.5 w-3.5" />
                                Sign Now
                              </Button>
                            ) : (
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => onCopyLink(agreement, signer)}
                                  className="text-xs"
                                >
                                  <Copy className="mr-1.5 h-3.5 w-3.5" />
                                  Copy Link
                                </Button>
                                {signer.email && onResendEmail && (
                                  <Button
                                    size="sm"
                                    onClick={() => handleResendEmail(signer)}
                                    disabled={sendingReminder === signer.token}
                                    className="bg-gradient-to-r from-primary to-teal-600 text-xs hover:from-primary/90 hover:to-teal-600/90"
                                  >
                                    {sendingReminder === signer.token ? (
                                      <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                                    ) : (
                                      <Mail className="mr-1.5 h-3.5 w-3.5" />
                                    )}
                                    {sendingReminder === signer.token
                                      ? "Sending..."
                                      : "Resend"}
                                  </Button>
                                )}
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Audit Trail Section */}
          {agreement.auditTrail && agreement.auditTrail.length > 0 && (
            <div>
              <h4 className="mb-4 flex items-center gap-2 text-base font-semibold text-slate-700">
                <Activity className="h-5 w-5" />
                Activity Timeline
              </h4>

              <div className="ml-2.5 border-l-2 border-slate-200 pl-5">
                {[...agreement.auditTrail].reverse().map((entry, idx) => {
                  const ActionIcon = getActionIcon(entry.action)
                  const actorRoleConfig =
                    entry.actorRole && entry.actorRole in SIGNER_ROLES
                      ? SIGNER_ROLES[
                          entry.actorRole as keyof typeof SIGNER_ROLES
                        ]
                      : null

                  return (
                    <div
                      key={idx}
                      className={`relative ${idx < agreement.auditTrail.length - 1 ? "pb-5" : ""}`}
                    >
                      <div className="absolute -left-8 top-0 flex h-6 w-6 items-center justify-center rounded-full border-2 border-slate-200 bg-white">
                        <ActionIcon className="h-3 w-3 text-slate-500" />
                      </div>
                      <div className="text-sm text-slate-600">
                        <strong className="capitalize">
                          {entry.action.replace("_", " ")}
                        </strong>
                        {" by "}
                        {entry.actor}
                        {actorRoleConfig && (
                          <span
                            className="ml-1.5 rounded px-1.5 py-0.5 text-[10px] font-semibold"
                            style={{
                              backgroundColor: actorRoleConfig.bgLight,
                              color: actorRoleConfig.color,
                            }}
                          >
                            {actorRoleConfig.label}
                          </span>
                        )}
                      </div>
                      <div className="mt-0.5 text-xs text-muted-foreground">
                        {formatDate(entry.timestamp)}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t bg-white px-6 py-4">
          {agreement.status !== "completed" && agreement.status !== "voided" && (
            <Button
              variant="outline"
              onClick={() => {
                onVoid(agreement)
                onClose()
              }}
              className="border-red-200 text-destructive hover:bg-red-50"
            >
              <X className="mr-2 h-4 w-4" />
              Void Agreement
            </Button>
          )}

          <div className="ml-auto flex gap-3">
            <Button
              variant={agreement.status === "completed" ? "default" : "outline"}
              onClick={handleDownloadPDF}
              disabled={downloadingPDF || agreement.status !== "completed"}
              className={
                agreement.status === "completed"
                  ? "bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700"
                  : ""
              }
            >
              {downloadingPDF ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Download className="mr-2 h-4 w-4" />
              )}
              {downloadingPDF ? "Generating..." : "Download PDF"}
            </Button>
            <Button
              onClick={onClose}
              className="bg-gradient-to-r from-primary to-teal-600 hover:from-primary/90 hover:to-teal-600/90"
            >
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default AgreementDetailModal
