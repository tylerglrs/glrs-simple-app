// ==========================================
// COVER PAGE PREVIEW COMPONENT
// ==========================================
//
// Renders the cover page for document preview.
// Matches EditorCoverPage from templates.html lines 6167-6218
//
// @version 1.0.0
// @date 2025-11-28

import { FileText } from "lucide-react"
import {
  PAGE_WIDTH,
  PAGE_HEIGHT,
  PAGE_MARGIN,
} from "../../../lib/documentConstants"

interface CoverPagePreviewProps {
  /** Document title */
  title: string
  /** Optional subtitle */
  subtitle?: string
  /** Optional document category */
  category?: string
  /** Optional prepared for name */
  preparedFor?: string
  /** Optional prepared by name */
  preparedBy?: string
  /** Optional date */
  date?: string
  /** Optional logo URL */
  logoUrl?: string
  /** Custom content from cover template */
  customContent?: React.ReactNode
}

/**
 * Renders the cover page with centered title and metadata.
 * Full page with professional styling.
 */
export function CoverPagePreview({
  title,
  subtitle,
  category,
  preparedFor,
  preparedBy,
  date,
  logoUrl,
  customContent,
}: CoverPagePreviewProps) {
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
      {/* Top section with logo placeholder */}
      <div className="flex justify-center pt-16">
        {logoUrl ? (
          <img
            src={logoUrl}
            alt="Logo"
            className="h-24 w-auto object-contain"
          />
        ) : (
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-teal-50">
            <FileText className="h-12 w-12 text-teal-600" />
          </div>
        )}
      </div>

      {/* Category badge */}
      {category && (
        <div className="mt-8 flex justify-center">
          <span className="rounded-full bg-slate-100 px-4 py-1 text-xs font-medium uppercase tracking-wider text-slate-600">
            {category}
          </span>
        </div>
      )}

      {/* Title section - centered vertically */}
      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <h1 className="text-3xl font-bold text-slate-800">
          {title || "Untitled Document"}
        </h1>
        {subtitle && (
          <p className="mt-4 text-lg text-slate-600">
            {subtitle}
          </p>
        )}
      </div>

      {/* Bottom metadata section */}
      <div className="space-y-4 pb-8 text-center">
        {preparedFor && (
          <div>
            <p className="text-xs uppercase tracking-wider text-slate-400">
              Prepared For
            </p>
            <p className="mt-1 text-sm font-medium text-slate-700">
              {preparedFor}
            </p>
          </div>
        )}

        {preparedBy && (
          <div>
            <p className="text-xs uppercase tracking-wider text-slate-400">
              Prepared By
            </p>
            <p className="mt-1 text-sm font-medium text-slate-700">
              {preparedBy}
            </p>
          </div>
        )}

        {date && (
          <div>
            <p className="text-xs uppercase tracking-wider text-slate-400">
              Date
            </p>
            <p className="mt-1 text-sm text-slate-600">
              {date}
            </p>
          </div>
        )}
      </div>

      {/* Footer line */}
      <div className="border-t border-slate-200 pt-4 text-center">
        <p className="text-xs text-slate-400">
          Guiding Light Recovery Services
        </p>
      </div>
    </div>
  )
}

export default CoverPagePreview
