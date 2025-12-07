// ==========================================
// DOCUMENT PAGE VIEW COMPONENT
// ==========================================
//
// Displays a single page image with overlay fields.
// Used in UploadedDocumentEditor for viewing and editing pages.
//
// @version 1.0.0
// @date 2025-11-28

import { useState, useRef, useEffect } from "react"
import type { OverlayField, UploadedPage } from "../../types"
import { DraggableField } from "./DraggableField"

interface DocumentPageViewProps {
  page: UploadedPage
  pageIndex: number
  fields: OverlayField[]
  selectedFieldId: string | null
  onSelectField: (fieldId: string | null) => void
  onUpdateField: (field: OverlayField) => void
  onDeleteField: (fieldId: string) => void
}

/**
 * Displays one page image with draggable field overlays.
 * Handles field selection and deselection.
 */
export function DocumentPageView({
  page,
  pageIndex,
  fields,
  selectedFieldId,
  onSelectField,
  onUpdateField,
  onDeleteField,
}: DocumentPageViewProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [displayDimensions, setDisplayDimensions] = useState({
    width: 600,
    height: 800,
  })

  // Calculate display dimensions to fit container while maintaining aspect ratio
  useEffect(() => {
    if (!containerRef.current || !page) return

    const updateDimensions = () => {
      const containerWidth = containerRef.current?.clientWidth || 600
      const aspectRatio = page.width / page.height
      const displayWidth = Math.min(containerWidth - 40, 700)
      const displayHeight = displayWidth / aspectRatio
      setDisplayDimensions({ width: displayWidth, height: displayHeight })
    }

    updateDimensions()

    // Handle resize
    const resizeObserver = new ResizeObserver(updateDimensions)
    resizeObserver.observe(containerRef.current)

    return () => resizeObserver.disconnect()
  }, [page])

  // Filter fields for current page
  const fieldsOnPage = fields.filter((f) => f.pageIndex === pageIndex)

  // Handle click on page background to deselect
  const handleBackgroundClick = () => {
    onSelectField(null)
  }

  return (
    <div
      ref={containerRef}
      className="flex flex-1 justify-center overflow-auto p-5"
      onClick={handleBackgroundClick}
    >
      {page && (
        <div
          className="relative bg-white shadow-lg"
          style={{
            width: displayDimensions.width,
            height: displayDimensions.height,
          }}
        >
          {/* Page Image */}
          <img
            src={page.imageUrl}
            alt={`Page ${pageIndex + 1}`}
            className="h-full w-full object-contain"
            draggable={false}
          />

          {/* Overlay Fields */}
          {fieldsOnPage.map((field) => (
            <DraggableField
              key={field.id}
              field={field}
              pageWidth={displayDimensions.width}
              pageHeight={displayDimensions.height}
              isSelected={selectedFieldId === field.id}
              onSelect={() => onSelectField(field.id)}
              onUpdate={onUpdateField}
              onDelete={() => onDeleteField(field.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default DocumentPageView
