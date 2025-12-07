// ==========================================
// PAGE FOOTER PREVIEW COMPONENT
// ==========================================
//
// Renders the footer portion of document pages.
// Matches EditorPageFooter from templates.html lines 6262-6300
//
// @version 1.0.0
// @date 2025-11-28

import { FOOTER_HEIGHT, PAGE_MARGIN } from "../../../lib/documentConstants"

interface PageFooterPreviewProps {
  /** Current page number */
  pageNumber: number
  /** Total number of pages */
  totalPages: number
  /** Optional company name or document identifier */
  documentId?: string
  /** Optional custom footer content (from footer template) */
  customContent?: React.ReactNode
  /** Whether to show confidential notice */
  showConfidential?: boolean
}

/**
 * Renders the page footer with page number and optional info.
 * Height matches FOOTER_HEIGHT constant for proper layout.
 */
export function PageFooterPreview({
  pageNumber,
  totalPages,
  documentId,
  customContent,
  showConfidential = true,
}: PageFooterPreviewProps) {
  // If custom content provided, render that instead
  if (customContent) {
    return (
      <div
        className="border-t border-slate-200 bg-slate-50"
        style={{
          height: FOOTER_HEIGHT,
          padding: `0 ${PAGE_MARGIN}px`,
        }}
      >
        {customContent}
      </div>
    )
  }

  return (
    <div
      className="flex items-center justify-between border-t border-slate-200 bg-slate-50"
      style={{
        height: FOOTER_HEIGHT,
        padding: `0 ${PAGE_MARGIN}px`,
      }}
    >
      {/* Left side - confidential notice or document ID */}
      <div className="text-[10px] text-slate-400">
        {showConfidential && (
          <span>CONFIDENTIAL</span>
        )}
        {documentId && !showConfidential && (
          <span>{documentId}</span>
        )}
      </div>

      {/* Center - page number */}
      <div className="text-xs text-slate-500">
        {pageNumber} / {totalPages}
      </div>

      {/* Right side - GLRS branding */}
      <div className="text-[10px] text-slate-400">
        Guiding Light Recovery Services
      </div>
    </div>
  )
}

export default PageFooterPreview
