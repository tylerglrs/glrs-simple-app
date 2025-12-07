// ==========================================
// CONTENT PAGE PREVIEW COMPONENT
// ==========================================
//
// Renders a content page with header, blocks, and footer.
// Matches EditorContentPage from templates.html lines 6352-6403
//
// @version 1.0.0
// @date 2025-11-28

import {
  PAGE_WIDTH,
  PAGE_HEIGHT,
  PAGE_MARGIN,
  HEADER_HEIGHT,
  FOOTER_HEIGHT,
  CONTENT_HEIGHT,
} from "../../../lib/documentConstants"
import type { Block } from "../../../types"
import { BlockRenderer } from "./BlockRenderer"
import { PageHeaderPreview } from "./PageHeaderPreview"
import { PageFooterPreview } from "./PageFooterPreview"

interface ContentPagePreviewProps {
  /** Blocks to render on this page */
  blocks: Block[]
  /** Current page number (1-indexed) */
  pageNumber: number
  /** Total number of content pages */
  totalPages: number
  /** Document title for header */
  documentTitle?: string
  /** Whether to show header */
  showHeader?: boolean
  /** Whether to show footer */
  showFooter?: boolean
  /** Custom header content */
  customHeader?: React.ReactNode
  /** Custom footer content */
  customFooter?: React.ReactNode
}

/**
 * Renders a single content page with header, blocks, and footer.
 * Uses fixed dimensions matching document constants.
 */
export function ContentPagePreview({
  blocks,
  pageNumber,
  totalPages,
  documentTitle = "Document",
  showHeader = true,
  showFooter = true,
  customHeader,
  customFooter,
}: ContentPagePreviewProps) {
  return (
    <div
      className="relative bg-white shadow-lg"
      style={{
        width: PAGE_WIDTH,
        height: PAGE_HEIGHT,
      }}
    >
      {/* Page Header */}
      {showHeader && (
        <PageHeaderPreview
          title={documentTitle}
          pageNumber={pageNumber}
          totalPages={totalPages}
          customContent={customHeader}
          isFirstPage={pageNumber === 1}
        />
      )}

      {/* Content Area */}
      <div
        className="overflow-hidden"
        style={{
          height: showHeader && showFooter
            ? CONTENT_HEIGHT + HEADER_HEIGHT + FOOTER_HEIGHT - HEADER_HEIGHT - FOOTER_HEIGHT
            : showHeader
              ? PAGE_HEIGHT - PAGE_MARGIN * 2 - HEADER_HEIGHT
              : showFooter
                ? PAGE_HEIGHT - PAGE_MARGIN * 2 - FOOTER_HEIGHT
                : PAGE_HEIGHT - PAGE_MARGIN * 2,
          padding: PAGE_MARGIN,
          paddingTop: showHeader ? PAGE_MARGIN / 2 : PAGE_MARGIN,
          paddingBottom: showFooter ? PAGE_MARGIN / 2 : PAGE_MARGIN,
        }}
      >
        {/* Render blocks */}
        {blocks.map((block, index) => (
          <BlockRenderer
            key={block.id}
            block={block}
            index={index}
          />
        ))}

        {/* Empty state */}
        {blocks.length === 0 && (
          <div className="flex h-full items-center justify-center text-slate-400">
            <p className="text-sm italic">No content on this page</p>
          </div>
        )}
      </div>

      {/* Page Footer */}
      {showFooter && (
        <div className="absolute bottom-0 left-0 right-0">
          <PageFooterPreview
            pageNumber={pageNumber}
            totalPages={totalPages}
            customContent={customFooter}
          />
        </div>
      )}
    </div>
  )
}

export default ContentPagePreview
