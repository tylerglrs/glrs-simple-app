/**
 * Report Message Modal
 *
 * Allows users to report inappropriate messages.
 * Required for Apple App Store compliance (Guideline 1.2).
 */

import { useState } from 'react'
import { ResponsiveModal } from '@/components/ui/responsive-modal'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Flag, Loader2, CheckCircle, AlertTriangle } from 'lucide-react'
import { doc, addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useAuth } from '@/contexts/AuthContext'
import { useStatusBarColor } from '@/hooks/useStatusBarColor'
import type { Message } from '../hooks/useConversations'

// =============================================================================
// REPORT REASONS
// =============================================================================

const REPORT_REASONS = [
  { id: 'harassment', label: 'Harassment or bullying' },
  { id: 'inappropriate', label: 'Inappropriate content' },
  { id: 'spam', label: 'Spam or solicitation' },
  { id: 'harmful', label: 'Promotes self-harm or dangerous behavior' },
  { id: 'impersonation', label: 'Impersonation' },
  { id: 'other', label: 'Other' },
] as const

type ReportReason = typeof REPORT_REASONS[number]['id']

// =============================================================================
// COMPONENT
// =============================================================================

interface ReportMessageModalProps {
  message: Message
  conversationId: string
  onClose: () => void
}

export function ReportMessageModal({ message, conversationId, onClose }: ReportMessageModalProps) {
  const { user } = useAuth()

  // Set iOS status bar to match modal header color (amber-500)
  useStatusBarColor('#F59E0B', true)

  const [reason, setReason] = useState<ReportReason | ''>('')
  const [details, setDetails] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async () => {
    if (!reason || !user) return

    setIsSubmitting(true)
    setError(null)

    try {
      // Create report document in Firestore
      await addDoc(collection(db, 'messageReports'), {
        // Report metadata
        reporterId: user.uid,
        reporterEmail: user.email,
        reportedAt: serverTimestamp(),
        status: 'pending', // pending | reviewed | resolved | dismissed

        // Message details
        messageId: message.id,
        conversationId,
        messageText: message.text || '[Image]',
        messageSenderId: message.senderId,
        messageCreatedAt: message.createdAt,

        // Report details
        reason,
        reasonLabel: REPORT_REASONS.find(r => r.id === reason)?.label || reason,
        details: details.trim() || null,
      })

      setIsSubmitted(true)
    } catch (err) {
      console.error('Failed to submit report:', err)
      setError('Failed to submit report. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Success state
  if (isSubmitted) {
    return (
      <ResponsiveModal open={true} onOpenChange={(open) => !open && onClose()} desktopSize="sm">
        <div className="flex flex-col h-full bg-white overflow-hidden">
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-xl font-semibold text-slate-900 mb-2">Report Submitted</h2>
            <p className="text-slate-600 mb-6">
              Thank you for your report. Our team will review it and take appropriate action.
            </p>
            <Button onClick={onClose}>Close</Button>
          </div>
        </div>
      </ResponsiveModal>
    )
  }

  return (
    <ResponsiveModal open={true} onOpenChange={(open) => !open && onClose()} desktopSize="md">
      <div className="flex flex-col h-full bg-white overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-amber-500 to-amber-600 shrink-0">
          <h2 className="text-xl font-bold text-white flex items-center gap-3">
            <Flag className="h-6 w-6" />
            Report Message
          </h2>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Message preview */}
          <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
            <p className="text-xs text-slate-500 mb-1">Message being reported:</p>
            <p className="text-slate-700 text-sm break-words">
              {message.text || (message.type === 'image' ? '[Image attachment]' : '[Message]')}
            </p>
          </div>

          {/* Reason selection */}
          <div>
            <Label className="text-sm font-medium text-slate-900 mb-3 block">
              Why are you reporting this message? *
            </Label>
            <RadioGroup
              value={reason}
              onValueChange={(value) => setReason(value as ReportReason)}
              className="space-y-3"
            >
              {REPORT_REASONS.map((r) => (
                <div
                  key={r.id}
                  className="flex items-center space-x-3 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
                >
                  <RadioGroupItem value={r.id} id={r.id} />
                  <Label htmlFor={r.id} className="text-sm text-slate-700 cursor-pointer flex-1">
                    {r.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Additional details */}
          <div>
            <Label htmlFor="details" className="text-sm font-medium text-slate-900 mb-2 block">
              Additional details (optional)
            </Label>
            <Textarea
              id="details"
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Provide any additional context that might help our review..."
              className="min-h-[100px] resize-none"
              maxLength={1000}
            />
            <p className="text-xs text-slate-500 mt-1 text-right">
              {details.length}/1000 characters
            </p>
          </div>

          {/* Error message */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          {/* Privacy note */}
          <div className="bg-blue-50 rounded-lg p-4 text-sm text-blue-800">
            <p>
              <strong>Privacy note:</strong> Reports are confidential. The user you're reporting
              will not know who submitted the report.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t bg-muted/30 shrink-0">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!reason || isSubmitting}
            className="bg-amber-500 hover:bg-amber-600"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              'Submit Report'
            )}
          </Button>
        </div>
      </div>
    </ResponsiveModal>
  )
}

export default ReportMessageModal
