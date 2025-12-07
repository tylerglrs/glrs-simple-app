import { useState, useEffect, useCallback, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Send, FileText, Loader2 } from "lucide-react"
import { toast } from "sonner"
import {
  db,
  collection,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  doc,
  updateDoc,
  arrayUnion,
  addDoc,
  serverTimestamp,
} from "@/lib/firebase"
import type { Agreement, Signer, AgreementStatus } from "../../types"
import { AgreementFilters } from "./AgreementFilters"
import { AgreementRow } from "./AgreementRow"
import { AgreementDetailModal } from "./AgreementDetailModal"

interface AgreementsViewProps {
  user: {
    uid: string
    email?: string
    firstName?: string
    lastName?: string
  }
  tenantId: string
  onSendNew: () => void
  onSignAsGLRS: (agreement: Agreement) => void
}

/**
 * AgreementsView - Main agreements list view
 * Ported from templates.html lines 11194-11626
 *
 * Features:
 * - Real-time Firebase listener (onSnapshot)
 * - Status filtering with counts
 * - Table/card layout for desktop/mobile
 * - Actions: View, Copy Link, Resend, Void, Download PDF, Sign as GLRS
 */
export function AgreementsView({
  user,
  tenantId,
  onSendNew,
  onSignAsGLRS,
}: AgreementsViewProps) {
  const [agreements, setAgreements] = useState<Agreement[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState<AgreementStatus | "all">("all")
  const [selectedAgreement, setSelectedAgreement] = useState<Agreement | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [voidingAgreement, setVoidingAgreement] = useState<Agreement | null>(null)

  // Load agreements with real-time listener
  useEffect(() => {
    if (!user) return

    setLoading(true)

    const agreementsQuery = query(
      collection(db, "agreements"),
      where("tenantId", "==", tenantId),
      orderBy("sentAt", "desc"),
      limit(50)
    )

    const unsubscribe = onSnapshot(
      agreementsQuery,
      (snapshot) => {
        const agreementsList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Agreement[]
        setAgreements(agreementsList)
        setLoading(false)
      },
      (error) => {
        console.error("Error loading agreements:", error)
        toast.error("Failed to load agreements")
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [user, tenantId])

  // Calculate effective status (check for expired)
  const getEffectiveStatus = useCallback((agreement: Agreement): string => {
    const isExpired =
      agreement.expiresAt &&
      (agreement.expiresAt instanceof Date
        ? agreement.expiresAt
        : typeof agreement.expiresAt === "object" && "toDate" in agreement.expiresAt
          ? (agreement.expiresAt as { toDate: () => Date }).toDate()
          : new Date(agreement.expiresAt as string)
      ) < new Date()

    return isExpired &&
      agreement.status !== "completed" &&
      agreement.status !== "voided"
      ? "expired"
      : agreement.status
  }, [])

  // Filter agreements
  const filteredAgreements = useMemo(() => {
    if (filterStatus === "all") return agreements
    return agreements.filter((a) => getEffectiveStatus(a) === filterStatus)
  }, [agreements, filterStatus, getEffectiveStatus])

  // Status counts
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { all: agreements.length }
    agreements.forEach((a) => {
      const status = getEffectiveStatus(a)
      counts[status] = (counts[status] || 0) + 1
    })
    return counts as {
      all: number
      sent: number
      partially_signed: number
      completed: number
      expired: number
      voided: number
    }
  }, [agreements, getEffectiveStatus])

  // Copy signing link
  const handleCopyLink = useCallback(
    async (_agreement: Agreement, signer: Signer) => {
      const link = `https://app.glrecoveryservices.com/sign.html#${signer.token}`
      try {
        await navigator.clipboard.writeText(link)
        toast.success(`Link copied for ${signer.name}`)
      } catch (err) {
        console.error("Failed to copy:", err)
        toast.error("Failed to copy link")
      }
    },
    []
  )

  // Void agreement
  const handleVoid = useCallback(async () => {
    if (!voidingAgreement) return

    try {
      await updateDoc(doc(db, "agreements", voidingAgreement.id), {
        status: "voided",
        auditTrail: arrayUnion({
          timestamp: new Date().toISOString(),
          action: "voided",
          actor:
            user.email ||
            `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
            "Admin",
          actorRole: "glrs",
        }),
      })
      toast.success("Agreement voided")
      setShowDetailModal(false)
    } catch (error) {
      console.error("Error voiding agreement:", error)
      toast.error("Failed to void agreement")
    } finally {
      setVoidingAgreement(null)
    }
  }, [voidingAgreement, user])

  // Resend reminder email
  const handleResendEmail = useCallback(
    async (agreement: Agreement, signer: Signer) => {
      if (!signer.email) return

      try {
        // Create email in mail collection
        await addDoc(collection(db, "mail"), {
          to: signer.email,
          message: {
            subject: `Reminder: Please sign "${agreement.documentTitle}"`,
            html: generateReminderEmailHTML({
              recipientName: signer.name,
              documentTitle: agreement.documentTitle,
              signingLink: `https://app.glrecoveryservices.com/sign.html#${signer.token}`,
              senderName:
                `${user.firstName || ""} ${user.lastName || ""}`.trim() || "GLRS",
            }),
          },
          createdAt: serverTimestamp(),
        })
      } catch (error) {
        console.error("Error sending reminder:", error)
        throw error
      }
    },
    [user]
  )

  // View details
  const handleViewDetails = useCallback((agreement: Agreement) => {
    setSelectedAgreement(agreement)
    setShowDetailModal(true)
  }, [])

  // Download PDF (placeholder - would generate actual PDF)
  const handleDownloadPDF = useCallback(async (agreement: Agreement) => {
    // This would typically generate a PDF from the signed agreement
    // For now, show a toast message
    toast.info(`PDF generation for "${agreement.documentTitle}" coming soon`)
  }, [])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-700">Agreements</h2>
          <p className="text-sm text-muted-foreground">
            {agreements.length} total agreements
          </p>
        </div>
        <Button
          onClick={onSendNew}
          className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700"
        >
          <Send className="mr-2 h-4 w-4" />
          Send New Agreement
        </Button>
      </div>

      {/* Status filter tabs */}
      <AgreementFilters
        activeFilter={filterStatus}
        onFilterChange={setFilterStatus}
        statusCounts={statusCounts}
      />

      {/* Loading state */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-16">
          <Loader2 className="mb-4 h-12 w-12 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading agreements...</p>
        </div>
      )}

      {/* Empty state */}
      {!loading && filteredAgreements.length === 0 && (
        <div className="rounded-lg border-2 border-dashed border-muted-foreground/25 bg-white py-16 text-center">
          <FileText className="mx-auto mb-4 h-12 w-12 text-muted-foreground/50" />
          <h3 className="mb-2 text-lg font-semibold text-slate-700">
            {filterStatus === "all"
              ? "No agreements yet"
              : `No ${filterStatus.replace("_", " ")} agreements`}
          </h3>
          <p className="mb-6 text-sm text-muted-foreground">
            {filterStatus === "all"
              ? "Send your first agreement to get started"
              : `You don't have any agreements with "${filterStatus.replace("_", " ")}" status`}
          </p>
          {filterStatus === "all" && (
            <Button
              onClick={onSendNew}
              className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700"
            >
              <Send className="mr-2 h-4 w-4" />
              Send First Agreement
            </Button>
          )}
        </div>
      )}

      {/* Agreements table */}
      {!loading && filteredAgreements.length > 0 && (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b-2 bg-slate-100">
                    <th className="p-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Document
                    </th>
                    <th className="p-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Recipient
                    </th>
                    <th className="p-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Signers
                    </th>
                    <th className="p-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Status
                    </th>
                    <th className="p-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Sent
                    </th>
                    <th className="p-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Expires
                    </th>
                    <th className="p-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAgreements.map((agreement) => (
                    <AgreementRow
                      key={agreement.id}
                      agreement={agreement}
                      onViewDetails={handleViewDetails}
                      onCopyLink={handleCopyLink}
                      onVoid={(a) => setVoidingAgreement(a)}
                      onSignAsGLRS={onSignAsGLRS}
                      onDownloadPDF={handleDownloadPDF}
                      onResendEmail={handleResendEmail}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Agreement Detail Modal */}
      <AgreementDetailModal
        open={showDetailModal}
        agreement={selectedAgreement}
        onClose={() => {
          setShowDetailModal(false)
          setSelectedAgreement(null)
        }}
        onSignAsGLRS={onSignAsGLRS}
        onCopyLink={handleCopyLink}
        onVoid={(a) => setVoidingAgreement(a)}
        onResendEmail={handleResendEmail}
        onDownloadPDF={handleDownloadPDF}
      />

      {/* Void Confirmation Dialog */}
      <AlertDialog
        open={!!voidingAgreement}
        onOpenChange={(open) => !open && setVoidingAgreement(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Void Agreement?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to void &quot;{voidingAgreement?.documentTitle}
              &quot;? This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleVoid}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Void Agreement
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

// ==========================================
// EMAIL HTML GENERATOR
// ==========================================

interface ReminderEmailData {
  recipientName: string
  documentTitle: string
  signingLink: string
  senderName: string
}

function generateReminderEmailHTML(data: ReminderEmailData): string {
  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
      <div style="background: linear-gradient(135deg, #0077CC 0%, #008B8B 100%); padding: 32px 24px; text-align: center;">
        <h1 style="font-size: 24px; font-weight: 700; color: white; margin: 0;">GLRS Lighthouse</h1>
        <p style="color: rgba(255,255,255,0.9); font-size: 14px; margin: 8px 0 0 0;">Document Signing Reminder</p>
      </div>
      <div style="padding: 32px 24px;">
        <h2 style="font-size: 18px; color: #1F2937; margin: 0 0 16px 0;">Hello ${data.recipientName},</h2>
        <p style="font-size: 15px; color: #4B5563; line-height: 1.6; margin: 0 0 16px 0;">
          This is a friendly reminder that ${data.senderName} is waiting for your signature on the following document:
        </p>
        <div style="background: #F3F4F6; border-radius: 8px; padding: 16px; margin: 24px 0;">
          <p style="font-size: 16px; font-weight: 600; color: #1F2937; margin: 0;">${data.documentTitle}</p>
        </div>
        <div style="text-align: center; margin: 24px 0;">
          <a href="${data.signingLink}" style="display: inline-block; background: linear-gradient(135deg, #0077CC 0%, #008B8B 100%); color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 15px;">
            Review & Sign Now
          </a>
        </div>
        <p style="font-size: 15px; color: #4B5563; line-height: 1.6; margin: 0;">
          If you have any questions, please contact GLRS directly.
        </p>
      </div>
      <div style="background: #F9FAFB; padding: 24px; border-top: 1px solid #E5E7EB;">
        <p style="font-size: 12px; color: #9CA3AF; text-align: center; margin: 0;">
          This email was sent by Guiding Light Recovery Services.
        </p>
      </div>
    </div>
  `
}

export default AgreementsView
