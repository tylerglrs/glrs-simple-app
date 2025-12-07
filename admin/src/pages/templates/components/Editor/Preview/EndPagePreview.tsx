// ==========================================
// END PAGE PREVIEW COMPONENT
// ==========================================
//
// Renders the end/closing page for document preview.
// Matches EditorEndPage from templates.html lines 6302-6350
//
// @version 1.0.0
// @date 2025-11-28

import { CheckCircle } from "lucide-react"
import {
  PAGE_WIDTH,
  PAGE_HEIGHT,
  PAGE_MARGIN,
} from "../../../lib/documentConstants"

interface EndPagePreviewProps {
  /** Main title for end page */
  title?: string
  /** Subtitle or closing message */
  subtitle?: string
  /** Contact information to display */
  contactInfo?: {
    phone?: string
    email?: string
    website?: string
    address?: string
  }
  /** Custom content from end page template */
  customContent?: React.ReactNode
}

/**
 * Renders the end page with closing content.
 * Typically includes thank you message and contact info.
 */
export function EndPagePreview({
  title = "Thank You",
  subtitle = "This document has been prepared for your review.",
  contactInfo,
  customContent,
}: EndPagePreviewProps) {
  // If custom content provided, render that instead
  if (customContent) {
    return (
      <div
        className="relative bg-white shadow-lg"
        style={{
          width: PAGE_WIDTH,
          height: PAGE_HEIGHT,
          padding: PAGE_MARGIN,
        }}
      >
        {customContent}
      </div>
    )
  }

  return (
    <div
      className="relative flex flex-col bg-white shadow-lg"
      style={{
        width: PAGE_WIDTH,
        height: PAGE_HEIGHT,
        padding: PAGE_MARGIN,
      }}
    >
      {/* Centered content */}
      <div className="flex flex-1 flex-col items-center justify-center text-center">
        {/* Success icon */}
        <div className="mb-8 flex h-20 w-20 items-center justify-center rounded-full bg-teal-50">
          <CheckCircle className="h-10 w-10 text-teal-600" />
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-slate-800">
          {title}
        </h1>

        {/* Subtitle */}
        {subtitle && (
          <p className="mt-4 max-w-md text-slate-600">
            {subtitle}
          </p>
        )}

        {/* Divider */}
        <div className="my-8 h-px w-32 bg-slate-200" />

        {/* Contact information */}
        {contactInfo && (
          <div className="space-y-2 text-sm text-slate-600">
            {contactInfo.phone && (
              <p>
                <span className="font-medium">Phone:</span> {contactInfo.phone}
              </p>
            )}
            {contactInfo.email && (
              <p>
                <span className="font-medium">Email:</span> {contactInfo.email}
              </p>
            )}
            {contactInfo.website && (
              <p>
                <span className="font-medium">Website:</span> {contactInfo.website}
              </p>
            )}
            {contactInfo.address && (
              <p className="mt-4 text-xs text-slate-400">
                {contactInfo.address}
              </p>
            )}
          </div>
        )}

        {/* Default contact if none provided */}
        {!contactInfo && (
          <div className="space-y-2 text-sm text-slate-600">
            <p className="font-medium">Guiding Light Recovery Services</p>
            <p className="text-xs text-slate-400">
              For questions about this document, please contact your assigned coach.
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-slate-200 pt-4 text-center">
        <p className="text-xs text-slate-400">
          This document is confidential and intended for the recipient only.
        </p>
      </div>
    </div>
  )
}

export default EndPagePreview
