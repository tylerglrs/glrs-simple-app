// ==========================================
// DRAGGABLE FIELD COMPONENT
// ==========================================
//
// Overlay field that can be positioned and resized on uploaded documents.
// Used in UploadedDocumentEditor for placing signature fields.
//
// @version 1.0.0
// @date 2025-11-28

import { useState, useEffect, useCallback } from "react"
import { Pen, User, Calendar, FileText, CheckSquare, X } from "lucide-react"
import type { OverlayField, SignerRole } from "../../types"
import { SIGNER_ROLES } from "../../constants"
import { cn } from "@/lib/utils"

interface DraggableFieldProps {
  field: OverlayField
  pageWidth: number
  pageHeight: number
  isSelected: boolean
  onSelect: () => void
  onUpdate: (field: OverlayField) => void
  onDelete: () => void
}

/**
 * Draggable and resizable field overlay for uploaded documents.
 * Position and size are stored as percentages for responsive rendering.
 */
export function DraggableField({
  field,
  pageWidth,
  pageHeight,
  isSelected,
  onSelect,
  onUpdate,
  onDelete,
}: DraggableFieldProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0, width: 0, height: 0 })

  const roleConfig = SIGNER_ROLES[field.role as SignerRole] || SIGNER_ROLES.pir

  // Convert percentage to pixels for display
  const pixelX = (field.x / 100) * pageWidth
  const pixelY = (field.y / 100) * pageHeight
  const pixelWidth = (field.width / 100) * pageWidth
  const pixelHeight = (field.height / 100) * pageHeight

  // Handle drag start
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      onSelect()
      setIsDragging(true)
      setDragStart({
        x: e.clientX - pixelX,
        y: e.clientY - pixelY,
        width: 0,
        height: 0,
      })
    },
    [pixelX, pixelY, onSelect]
  )

  // Handle resize start
  const handleResizeMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      setIsResizing(true)
      setDragStart({
        x: e.clientX,
        y: e.clientY,
        width: pixelWidth,
        height: pixelHeight,
      })
    },
    [pixelWidth, pixelHeight]
  )

  // Handle mouse move for drag/resize
  useEffect(() => {
    if (!isDragging && !isResizing) return

    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const newX = Math.max(0, Math.min(pageWidth - pixelWidth, e.clientX - dragStart.x))
        const newY = Math.max(0, Math.min(pageHeight - pixelHeight, e.clientY - dragStart.y))
        onUpdate({
          ...field,
          x: (newX / pageWidth) * 100,
          y: (newY / pageHeight) * 100,
        })
      } else if (isResizing) {
        const deltaX = e.clientX - dragStart.x
        const deltaY = e.clientY - dragStart.y
        const newWidth = Math.max(50, dragStart.width + deltaX)
        const newHeight = Math.max(30, dragStart.height + deltaY)
        onUpdate({
          ...field,
          width: (newWidth / pageWidth) * 100,
          height: (newHeight / pageHeight) * 100,
        })
      }
    }

    const handleMouseUp = () => {
      setIsDragging(false)
      setIsResizing(false)
    }

    window.addEventListener("mousemove", handleMouseMove)
    window.addEventListener("mouseup", handleMouseUp)

    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("mouseup", handleMouseUp)
    }
  }, [
    isDragging,
    isResizing,
    dragStart,
    field,
    pageWidth,
    pageHeight,
    pixelWidth,
    pixelHeight,
    onUpdate,
  ])

  // Get icon for field type
  const iconMap: Record<string, typeof Pen> = {
    signatureField: Pen,
    initialsField: User,
    dateField: Calendar,
    textInputField: FileText,
    checkboxField: CheckSquare,
  }
  const FieldIcon = iconMap[field.type] || Pen

  return (
    <div
      className={cn(
        "absolute flex flex-col items-center justify-center rounded select-none",
        isDragging ? "cursor-grabbing" : "cursor-grab",
        isSelected && "ring-2 ring-teal-500"
      )}
      style={{
        left: pixelX,
        top: pixelY,
        width: pixelWidth,
        height: pixelHeight,
        border: `2px solid ${roleConfig.borderColor}`,
        backgroundColor: roleConfig.bgLight,
      }}
      onMouseDown={handleMouseDown}
    >
      {/* Field Content */}
      <FieldIcon
        className="h-4 w-4"
        style={{ color: roleConfig.color }}
      />
      <span
        className="mt-0.5 text-[10px] font-medium"
        style={{ color: roleConfig.color }}
      >
        {field.label || field.type}
      </span>
      <span
        className="text-[8px] opacity-70"
        style={{ color: roleConfig.color }}
      >
        ({roleConfig.label})
      </span>

      {/* Delete Button (visible when selected) */}
      {isSelected && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onDelete()
          }}
          className="absolute -right-2.5 -top-2.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 hover:bg-red-600"
        >
          <X className="h-3 w-3 text-white" />
        </button>
      )}

      {/* Resize Handle (visible when selected) */}
      {isSelected && (
        <div
          onMouseDown={handleResizeMouseDown}
          className="absolute -bottom-1 -right-1 h-3 w-3 cursor-se-resize rounded-sm"
          style={{ backgroundColor: roleConfig.color }}
        />
      )}
    </div>
  )
}

export default DraggableField
