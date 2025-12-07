import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CheckCircle, Copy, Check } from "lucide-react"
import { toast } from "sonner"
import type { SendAgreementResult } from "../../types"
import { SIGNER_ROLES } from "../../constants"

interface SendSuccessModalProps {
  open: boolean
  onClose: () => void
  result: SendAgreementResult | null
}

/**
 * SendSuccessModal - Success confirmation after sending document for signature
 * Ported from templates.html lines 9997-10186
 *
 * Features:
 * - Success confirmation with celebration styling
 * - Shows list of signers with their status
 * - Copy signing link for each signer
 * - Toast confirmation on copy
 */
export function SendSuccessModal({
  open,
  onClose,
  result,
}: SendSuccessModalProps) {
  const [copiedLink, setCopiedLink] = useState<string | null>(null)

  const copyToClipboard = async (link: string, role: string) => {
    try {
      await navigator.clipboard.writeText(link)
      setCopiedLink(role)
      toast.success("Link copied to clipboard")
      setTimeout(() => setCopiedLink(null), 2000)
    } catch (err) {
      console.error("Failed to copy:", err)
      toast.error("Failed to copy link")
    }
  }

  if (!result) return null

  // Filter signing links to only show those with email (external signers)
  const externalSigners = result.signingLinks.filter((s) => s.email)
  const glrsSigner = result.signingLinks.find((s) => s.role === "glrs")

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-md p-0">
        <div className="p-8 text-center">
          {/* Success Icon */}
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
            <CheckCircle className="h-8 w-8 text-emerald-600" />
          </div>

          {/* Title */}
          <DialogHeader className="mb-2">
            <DialogTitle className="text-center text-xl font-semibold text-slate-800">
              Document Sent!
            </DialogTitle>
          </DialogHeader>

          <p className="mb-6 text-sm text-muted-foreground">
            Signing links have been generated. Share them with the signers.
          </p>

          {/* Signing Links */}
          {externalSigners.length > 0 && (
            <div className="mb-6 rounded-lg bg-slate-100 p-4 text-left">
              {externalSigners.map((signer, index) => {
                const roleConfig = SIGNER_ROLES[signer.role]
                const isCopied = copiedLink === signer.role

                return (
                  <div
                    key={signer.role}
                    className={`rounded-lg bg-white p-3 ${
                      index < externalSigners.length - 1 ? "mb-2" : ""
                    }`}
                  >
                    {/* Signer Info */}
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-sm font-semibold text-slate-700">
                        {signer.name}
                      </span>
                      <span
                        className="rounded-md px-2 py-0.5 text-xs font-medium"
                        style={{
                          backgroundColor: roleConfig?.bgLight,
                          color: roleConfig?.color,
                        }}
                      >
                        {roleConfig?.label || signer.role}
                      </span>
                    </div>

                    {/* Link with Copy Button */}
                    <div className="flex items-center gap-2">
                      <Input
                        type="text"
                        value={signer.link}
                        readOnly
                        className="flex-1 bg-slate-50 text-xs text-muted-foreground"
                      />
                      <Button
                        type="button"
                        size="sm"
                        variant={isCopied ? "outline" : "default"}
                        onClick={() => copyToClipboard(signer.link, signer.role)}
                        className={
                          isCopied
                            ? "border-emerald-200 bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                            : "bg-primary hover:bg-primary/90"
                        }
                      >
                        {isCopied ? (
                          <>
                            <Check className="mr-1 h-3.5 w-3.5" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="mr-1 h-3.5 w-3.5" />
                            Copy
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* GLRS Signer Note */}
          {glrsSigner && (
            <p className="mb-4 text-xs text-muted-foreground">
              <strong>{glrsSigner.name}</strong> (GLRS) will sign in the admin
              portal after other signers complete.
            </p>
          )}

          {/* Email Note */}
          <p className="mb-5 text-xs text-muted-foreground">
            Email notifications have been sent to signers with email addresses.
          </p>

          {/* Done Button */}
          <Button
            onClick={onClose}
            className="w-full bg-gradient-to-r from-primary to-teal-600 hover:from-primary/90 hover:to-teal-600/90"
          >
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default SendSuccessModal
