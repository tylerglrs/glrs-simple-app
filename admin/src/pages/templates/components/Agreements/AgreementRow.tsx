import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Check,
  MoreVertical,
  Eye,
  Copy,
  Mail,
  Download,
  X,
  Edit,
  Loader2,
} from "lucide-react"
import type { Agreement, Signer } from "../../types"
import { AGREEMENT_STATUS, SIGNER_ROLES } from "../../constants"

interface AgreementRowProps {
  agreement: Agreement
  onViewDetails: (agreement: Agreement) => void
  onCopyLink: (agreement: Agreement, signer: Signer) => void
  onVoid: (agreement: Agreement) => void
  onSignAsGLRS: (agreement: Agreement) => void
  onDownloadPDF: (agreement: Agreement) => Promise<void>
  onResendEmail?: (agreement: Agreement, signer: Signer) => void
}

// Format relative date
function formatRelativeDate(timestamp: unknown): string {
  if (!timestamp) return "-"
  const date =
    timestamp instanceof Date
      ? timestamp
      : typeof timestamp === "object" && "toDate" in timestamp
        ? (timestamp as { toDate: () => Date }).toDate()
        : new Date(timestamp as string)

  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return "Today"
  if (diffDays === 1) return "Yesterday"
  if (diffDays < 7) return `${diffDays} days ago`
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

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
  })
}

/**
 * AgreementRow - Displays a single agreement in the list
 * Ported from templates.html lines 10203-10672
 *
 * Features:
 * - Status badge with color coding
 * - Signer status indicators (circles with checkmarks)
 * - Dropdown actions (View, Copy Link, Resend, Download PDF, Void)
 * - Sign as GLRS button when applicable
 */
export function AgreementRow({
  agreement,
  onViewDetails,
  onCopyLink,
  onVoid,
  onSignAsGLRS,
  onDownloadPDF,
  onResendEmail,
}: AgreementRowProps) {
  const [downloadingPDF, setDownloadingPDF] = useState(false)

  // Get status config
  const statusConfig =
    AGREEMENT_STATUS[agreement.status as keyof typeof AGREEMENT_STATUS] ||
    AGREEMENT_STATUS.sent

  // Get primary signer (first non-GLRS signer)
  const primarySigner =
    agreement.signers?.find((s) => s.role !== "glrs") || agreement.signers?.[0]

  // Get next pending signer
  const nextPendingSigner = agreement.signers?.find(
    (s) => s.status === "pending"
  )

  // Check if GLRS can sign (all previous signers have signed)
  const glrsSigner = agreement.signers?.find((s) => s.role === "glrs")
  const canGLRSSign =
    glrsSigner?.status === "pending" &&
    agreement.signers
      ?.filter((s) => s.role !== "glrs")
      .every((s) => s.status === "signed")

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

  // Handle PDF download
  const handleDownloadPDF = async () => {
    if (agreement.status !== "completed") {
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
    <tr className="border-b transition-colors hover:bg-muted/50">
      {/* Document Title */}
      <td className="p-4 align-middle">
        <div className="text-sm font-semibold text-slate-700">
          {agreement.documentTitle}
        </div>
      </td>

      {/* Recipient */}
      <td className="p-4 align-middle">
        <div className="text-sm text-slate-600">
          {primarySigner?.name || "-"}
        </div>
        {agreement.signers && agreement.signers.length > 1 && (
          <div className="text-xs text-muted-foreground">
            +{agreement.signers.length - 1} more
          </div>
        )}
      </td>

      {/* Signer Status Indicators */}
      <td className="p-4 align-middle">
        <div className="flex gap-1">
          {agreement.signers?.map((signer, idx) => {
            const roleConfig = SIGNER_ROLES[signer.role]
            return (
              <div
                key={idx}
                title={`${signer.name} (${roleConfig?.label || signer.role}): ${signer.status === "signed" ? "Signed" : "Pending"}`}
                className="flex h-5 w-5 cursor-help items-center justify-center rounded-full"
                style={{
                  backgroundColor:
                    signer.status === "signed"
                      ? roleConfig?.color
                      : "transparent",
                  border: `2px solid ${roleConfig?.color || "#9CA3AF"}`,
                }}
              >
                {signer.status === "signed" && (
                  <Check className="h-2.5 w-2.5 text-white" />
                )}
              </div>
            )
          })}
        </div>
      </td>

      {/* Status */}
      <td className="p-4 align-middle">
        <span
          className="whitespace-nowrap rounded-xl px-2.5 py-1 text-xs font-semibold"
          style={{
            backgroundColor: effectiveStatusConfig.bg,
            color: effectiveStatusConfig.color,
          }}
        >
          {effectiveStatusConfig.label}
        </span>
      </td>

      {/* Sent */}
      <td className="p-4 align-middle text-sm text-muted-foreground">
        {formatRelativeDate(agreement.sentAt)}
      </td>

      {/* Expires */}
      <td className="p-4 align-middle text-sm text-muted-foreground">
        {agreement.status === "completed" || agreement.status === "voided"
          ? "-"
          : formatDate(agreement.expiresAt)}
      </td>

      {/* Actions */}
      <td className="p-4 align-middle">
        <div className="flex items-center justify-end gap-2">
          {/* Sign as GLRS button */}
          {canGLRSSign && (
            <Button
              size="sm"
              onClick={() => onSignAsGLRS(agreement)}
              className="bg-gradient-to-r from-orange-500 to-orange-600 text-xs hover:from-orange-600 hover:to-orange-700"
            >
              <Edit className="mr-1 h-3 w-3" />
              Sign
            </Button>
          )}

          {/* Dropdown menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => onViewDetails(agreement)}>
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </DropdownMenuItem>

              {nextPendingSigner && nextPendingSigner.role !== "glrs" && (
                <DropdownMenuItem
                  onClick={() => onCopyLink(agreement, nextPendingSigner)}
                >
                  <Copy className="mr-2 h-4 w-4" />
                  Copy Signing Link
                </DropdownMenuItem>
              )}

              {nextPendingSigner &&
                nextPendingSigner.role !== "glrs" &&
                nextPendingSigner.email &&
                onResendEmail && (
                  <DropdownMenuItem
                    onClick={() => onResendEmail(agreement, nextPendingSigner)}
                  >
                    <Mail className="mr-2 h-4 w-4" />
                    Resend Reminder
                  </DropdownMenuItem>
                )}

              <DropdownMenuItem
                onClick={handleDownloadPDF}
                disabled={downloadingPDF || agreement.status !== "completed"}
                className={
                  agreement.status !== "completed"
                    ? "cursor-not-allowed opacity-50"
                    : ""
                }
              >
                {downloadingPDF ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Download className="mr-2 h-4 w-4" />
                )}
                {downloadingPDF ? "Generating..." : "Download PDF"}
                {agreement.status !== "completed" && (
                  <span className="ml-auto text-[10px] text-muted-foreground">
                    Completed only
                  </span>
                )}
              </DropdownMenuItem>

              {agreement.status !== "completed" &&
                agreement.status !== "voided" && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => onVoid(agreement)}
                      className="text-destructive focus:text-destructive"
                    >
                      <X className="mr-2 h-4 w-4" />
                      Void Agreement
                    </DropdownMenuItem>
                  </>
                )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </td>
    </tr>
  )
}

export default AgreementRow
