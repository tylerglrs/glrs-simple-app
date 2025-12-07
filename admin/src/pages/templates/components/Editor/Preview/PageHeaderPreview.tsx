// ==========================================
// PAGE HEADER PREVIEW COMPONENT
// ==========================================
//
// Renders the header portion of document pages.
// Matches EditorPageHeader from templates.html lines 6220-6260
//
// @version 1.0.0
// @date 2025-11-28

import { HEADER_HEIGHT, PAGE_MARGIN } from "../../../lib/documentConstants"

interface PageHeaderPreviewProps {
  /** Document title displayed in header */
  title?: string
  /** Current page number */
  pageNumber: number
  /** Total number of pages */
  totalPages: number
  /** Optional custom header content (from header template) */
  customContent?: React.ReactNode
  /** Whether this is the first page (may hide page number) */
  isFirstPage?: boolean
}

/**
 * Renders the page header with title and page number.
 * Height matches HEADER_HEIGHT constant for proper layout.
 */
export function PageHeaderPreview({
  title = "Document",
  pageNumber,
  totalPages,
  customContent,
  isFirstPage = false,
}: PageHeaderPreviewProps) {
  // If custom content provided, render that instead
  if (customContent) {
    return (
      <div
        className="border-b border-slate-200 bg-slate-50"
        style={{
          height: HEADER_HEIGHT,
          padding: `0 ${PAGE_MARGIN}px`,
        }}
      >
        {customContent}
      </div>
    )
  }

  return (
    <div
      className="flex items-center justify-between border-b border-slate-200 bg-slate-50"
      style={{
        height: HEADER_HEIGHT,
        padding: `0 ${PAGE_MARGIN}px`,
      }}
    >
      {/* Document title */}
      <div className="text-sm font-medium text-slate-600">
        {title}
      </div>

      {/* Page number - often hidden on first page */}
      {!isFirstPage && (
        <div className="text-xs text-slate-400">
          Page {pageNumber} of {totalPages}
        </div>
      )}
    </div>
  )
}

export default PageHeaderPreview
