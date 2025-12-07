// ==========================================
// PAGE PREVIEW CONTAINER
// ==========================================
//
// Main container for document preview with pagination.
// Orchestrates cover page, content pages, and end page.
//
// @version 1.0.0
// @date 2025-11-28

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ZoomIn,
  ZoomOut,
} from "lucide-react"
// Note: PAGE_WIDTH and PAGE_HEIGHT are used by child components
import { paginateBlocks } from "../../../lib/pagination"
import type { Block } from "../../../types"
import { CoverPagePreview } from "./CoverPagePreview"
import { ContentPagePreview } from "./ContentPagePreview"
import { EndPagePreview } from "./EndPagePreview"
import { cn } from "@/lib/utils"

interface PagePreviewProps {
  /** Document title */
  title: string
  /** Document category */
  category?: string
  /** Blocks to render */
  blocks: Block[]
  /** Whether to show cover page */
  showCoverPage?: boolean
  /** Whether to show end page */
  showEndPage?: boolean
  /** Whether to show headers on content pages */
  showHeaders?: boolean
  /** Whether to show footers on content pages */
  showFooters?: boolean
  /** Custom cover page content */
  customCoverContent?: React.ReactNode
  /** Custom end page content */
  customEndContent?: React.ReactNode
  /** Custom header content for all pages */
  customHeaderContent?: React.ReactNode
  /** Custom footer content for all pages */
  customFooterContent?: React.ReactNode
}

type ZoomLevel = 0.5 | 0.75 | 1 | 1.25 | 1.5

const ZOOM_LEVELS: ZoomLevel[] = [0.5, 0.75, 1, 1.25, 1.5]

/**
 * Main preview container with pagination and zoom controls.
 * Renders cover, content pages, and end page in sequence.
 */
export function PagePreview({
  title,
  category,
  blocks,
  showCoverPage = false,
  showEndPage = false,
  showHeaders = true,
  showFooters = true,
  customCoverContent,
  customEndContent,
  customHeaderContent,
  customFooterContent,
}: PagePreviewProps) {
  const [currentPage, setCurrentPage] = useState(0)
  const [zoom, setZoom] = useState<ZoomLevel>(0.75)

  // Paginate blocks
  const { pages: contentPages, pageCount: contentPageCount } = useMemo(
    () => paginateBlocks(blocks),
    [blocks]
  )

  // Calculate total pages including cover and end
  const totalPages = useMemo(() => {
    let count = contentPageCount
    if (showCoverPage) count++
    if (showEndPage) count++
    return Math.max(count, 1) // At least 1 page
  }, [contentPageCount, showCoverPage, showEndPage])

  // Determine what type of page is at current index
  const getPageType = (index: number): "cover" | "content" | "end" => {
    if (showCoverPage && index === 0) return "cover"
    if (showEndPage && index === totalPages - 1) return "end"
    return "content"
  }

  // Get content page index (0-based, excluding cover)
  const getContentPageIndex = (index: number): number => {
    return showCoverPage ? index - 1 : index
  }

  // Navigation handlers
  const goToFirst = () => setCurrentPage(0)
  const goToPrevious = () => setCurrentPage((p) => Math.max(0, p - 1))
  const goToNext = () => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))
  const goToLast = () => setCurrentPage(totalPages - 1)

  // Zoom handlers
  const zoomIn = () => {
    const currentIndex = ZOOM_LEVELS.indexOf(zoom)
    if (currentIndex < ZOOM_LEVELS.length - 1) {
      setZoom(ZOOM_LEVELS[currentIndex + 1])
    }
  }

  const zoomOut = () => {
    const currentIndex = ZOOM_LEVELS.indexOf(zoom)
    if (currentIndex > 0) {
      setZoom(ZOOM_LEVELS[currentIndex - 1])
    }
  }

  // Render the current page
  const renderCurrentPage = () => {
    const pageType = getPageType(currentPage)

    if (pageType === "cover") {
      return (
        <CoverPagePreview
          title={title}
          category={category}
          customContent={customCoverContent}
        />
      )
    }

    if (pageType === "end") {
      return (
        <EndPagePreview
          customContent={customEndContent}
        />
      )
    }

    // Content page
    const contentIndex = getContentPageIndex(currentPage)
    const pageBlocks = contentPages[contentIndex] || []
    const contentPageNumber = contentIndex + 1

    return (
      <ContentPagePreview
        blocks={pageBlocks}
        pageNumber={contentPageNumber}
        totalPages={contentPageCount}
        documentTitle={title}
        showHeader={showHeaders}
        showFooter={showFooters}
        customHeader={customHeaderContent}
        customFooter={customFooterContent}
      />
    )
  }

  return (
    <div className="flex h-full flex-col bg-slate-100">
      {/* Toolbar */}
      <div className="flex shrink-0 items-center justify-between border-b bg-white px-4 py-2">
        {/* Page navigation */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={goToFirst}
            disabled={currentPage === 0}
            className="h-8 w-8"
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={goToPrevious}
            disabled={currentPage === 0}
            className="h-8 w-8"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <span className="mx-2 text-sm text-slate-600">
            Page {currentPage + 1} of {totalPages}
          </span>

          <Button
            variant="ghost"
            size="icon"
            onClick={goToNext}
            disabled={currentPage >= totalPages - 1}
            className="h-8 w-8"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={goToLast}
            disabled={currentPage >= totalPages - 1}
            className="h-8 w-8"
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Page type indicator */}
        <div className="text-xs text-slate-400">
          {getPageType(currentPage) === "cover" && "Cover Page"}
          {getPageType(currentPage) === "content" && `Content Page ${getContentPageIndex(currentPage) + 1}`}
          {getPageType(currentPage) === "end" && "End Page"}
        </div>

        {/* Zoom controls */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={zoomOut}
            disabled={zoom === ZOOM_LEVELS[0]}
            className="h-8 w-8"
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="mx-2 w-12 text-center text-sm text-slate-600">
            {Math.round(zoom * 100)}%
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={zoomIn}
            disabled={zoom === ZOOM_LEVELS[ZOOM_LEVELS.length - 1]}
            className="h-8 w-8"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Page preview area */}
      <div className="flex flex-1 items-start justify-center overflow-auto p-8">
        <div
          className="transition-transform duration-200"
          style={{
            transform: `scale(${zoom})`,
            transformOrigin: "top center",
          }}
        >
          {renderCurrentPage()}
        </div>
      </div>

      {/* Page thumbnails (optional) */}
      {totalPages > 1 && (
        <div className="shrink-0 border-t bg-white p-2">
          <div className="flex justify-center gap-2 overflow-x-auto">
            {Array.from({ length: totalPages }).map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentPage(index)}
                className={cn(
                  "flex h-12 w-9 items-center justify-center rounded border text-xs transition-colors",
                  currentPage === index
                    ? "border-teal-500 bg-teal-50 text-teal-700"
                    : "border-slate-200 bg-white text-slate-500 hover:border-slate-300"
                )}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default PagePreview
