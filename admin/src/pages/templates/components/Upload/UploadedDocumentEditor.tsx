// ==========================================
// UPLOADED DOCUMENT EDITOR
// ==========================================
//
// Full-screen editor for uploaded PDF/DOCX templates.
// Allows placing draggable signature fields on document pages.
// Port from templates.html lines 803-1169.
//
// @version 1.0.0
// @date 2025-11-28

import { useState, useRef, useEffect, useCallback } from "react"
import {
  ArrowLeft,
  Pen,
  User,
  Calendar,
  FileText,
  CheckSquare,
  Trash2,
  Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { db, doc, updateDoc, serverTimestamp } from "@/lib/firebase"
import type { Template, OverlayField, BlockType, SignerRole } from "../../types"
import { SIGNER_ROLES } from "../../constants"
import { DraggableField } from "./DraggableField"
import { cn } from "@/lib/utils"

interface UploadedDocumentEditorProps {
  template: Template
  onClose: () => void
  onSave: (template: Template) => void
}

// Field types available for overlay
const FIELD_TYPES: {
  type: BlockType
  label: string
  icon: typeof Pen
}[] = [
  { type: "signatureField", label: "Signature", icon: Pen },
  { type: "initialsField", label: "Initials", icon: User },
  { type: "dateField", label: "Date", icon: Calendar },
  { type: "textInputField", label: "Text Input", icon: FileText },
  { type: "checkboxField", label: "Checkbox", icon: CheckSquare },
]

/**
 * Full-screen editor for uploaded document templates.
 * Allows placing and configuring overlay fields on document pages.
 */
export function UploadedDocumentEditor({
  template,
  onClose,
  onSave,
}: UploadedDocumentEditorProps) {
  const [overlayFields, setOverlayFields] = useState<OverlayField[]>(
    template.overlayFields || []
  )
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(0)
  const [saving, setSaving] = useState(false)
  const [displayDimensions, setDisplayDimensions] = useState({
    width: 600,
    height: 800,
  })

  const containerRef = useRef<HTMLDivElement>(null)

  const pages = template.uploadedFile?.pages || []
  const currentPageData = pages[currentPage]
  const selectedField = overlayFields.find((f) => f.id === selectedFieldId)
  const fieldsOnCurrentPage = overlayFields.filter(
    (f) => f.pageIndex === currentPage
  )

  // Generate unique field ID
  const generateFieldId = useCallback(() => {
    return `field_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }, [])

  // Calculate display dimensions to fit container
  useEffect(() => {
    if (!containerRef.current || !currentPageData) return

    const updateDimensions = () => {
      const containerWidth = (containerRef.current?.clientWidth || 700) - 40
      const aspectRatio = currentPageData.width / currentPageData.height
      const displayWidth = Math.min(containerWidth, 700)
      const displayHeight = displayWidth / aspectRatio
      setDisplayDimensions({ width: displayWidth, height: displayHeight })
    }

    updateDimensions()

    const resizeObserver = new ResizeObserver(updateDimensions)
    resizeObserver.observe(containerRef.current)

    return () => resizeObserver.disconnect()
  }, [currentPage, currentPageData])

  // Add new overlay field
  const addField = useCallback(
    (type: BlockType) => {
      const newField: OverlayField = {
        id: generateFieldId(),
        type,
        pageIndex: currentPage,
        x: 30, // percentage
        y: 30, // percentage
        width: 20, // percentage
        height: 8, // percentage
        role: "pir" as SignerRole,
        label: type.replace("Field", "").charAt(0).toUpperCase() +
          type.replace("Field", "").slice(1),
        required: true,
      }
      setOverlayFields([...overlayFields, newField])
      setSelectedFieldId(newField.id)
    },
    [currentPage, generateFieldId, overlayFields]
  )

  // Update field
  const updateField = useCallback((updatedField: OverlayField) => {
    setOverlayFields((fields) =>
      fields.map((f) => (f.id === updatedField.id ? updatedField : f))
    )
  }, [])

  // Delete field
  const deleteField = useCallback(
    (fieldId: string) => {
      setOverlayFields((fields) => fields.filter((f) => f.id !== fieldId))
      if (selectedFieldId === fieldId) {
        setSelectedFieldId(null)
      }
    },
    [selectedFieldId]
  )

  // Save changes to Firestore
  const handleSave = async () => {
    setSaving(true)
    try {
      const templateRef = doc(db, "templates", template.id)
      await updateDoc(templateRef, {
        overlayFields,
        updatedAt: serverTimestamp(),
      })
      onSave({ ...template, overlayFields })
    } catch (error) {
      console.error("Error saving:", error)
      alert("Failed to save changes. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  // Handle background click to deselect
  const handleBackgroundClick = () => {
    setSelectedFieldId(null)
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-100">
      {/* Header */}
      <div className="flex items-center justify-between border-b bg-white px-6 py-3">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h2 className="text-lg font-semibold text-slate-800">
            {template.name}
          </h2>
          <span className="rounded bg-indigo-100 px-2 py-1 text-xs font-medium text-indigo-700">
            Uploaded Document
          </span>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-gradient-to-r from-teal-600 to-teal-500"
          >
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel - Field Types */}
        <div className="w-52 overflow-y-auto border-r bg-white p-4">
          <h3 className="mb-4 text-sm font-medium text-slate-500">Add Fields</h3>
          <div className="space-y-2">
            {FIELD_TYPES.map(({ type, label, icon: Icon }) => (
              <button
                key={type}
                onClick={() => addField(type)}
                className={cn(
                  "flex w-full items-center gap-2.5 rounded-md border border-slate-200 bg-slate-50 px-3 py-2.5",
                  "transition-colors hover:bg-slate-100"
                )}
              >
                <Icon className="h-4 w-4 text-slate-500" />
                <span className="text-sm text-slate-700">{label}</span>
              </button>
            ))}
          </div>

          {/* Page Navigation */}
          {pages.length > 1 && (
            <div className="mt-6">
              <h3 className="mb-3 text-sm font-medium text-slate-500">Pages</h3>
              <div className="space-y-2">
                {pages.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentPage(index)}
                    className={cn(
                      "w-full rounded-md border px-3 py-2 text-sm transition-colors",
                      currentPage === index
                        ? "border-teal-500 bg-teal-500 text-white"
                        : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
                    )}
                  >
                    Page {index + 1}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Center - Document View */}
        <div
          ref={containerRef}
          className="flex flex-1 justify-center overflow-auto p-5"
          onClick={handleBackgroundClick}
        >
          {currentPageData && (
            <div
              className="relative bg-white shadow-lg"
              style={{
                width: displayDimensions.width,
                height: displayDimensions.height,
              }}
            >
              <img
                src={currentPageData.imageUrl}
                alt={`Page ${currentPage + 1}`}
                className="h-full w-full object-contain"
                draggable={false}
              />
              {/* Overlay Fields */}
              {fieldsOnCurrentPage.map((field) => (
                <DraggableField
                  key={field.id}
                  field={field}
                  pageWidth={displayDimensions.width}
                  pageHeight={displayDimensions.height}
                  isSelected={selectedFieldId === field.id}
                  onSelect={() => setSelectedFieldId(field.id)}
                  onUpdate={updateField}
                  onDelete={() => deleteField(field.id)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Right Panel - Field Properties */}
        <div className="w-72 overflow-y-auto border-l bg-white p-4">
          <h3 className="mb-4 text-sm font-medium text-slate-500">
            Field Properties
          </h3>

          {selectedField ? (
            <div className="space-y-4">
              {/* Label */}
              <div className="space-y-1.5">
                <Label htmlFor="field-label" className="text-xs text-slate-500">
                  Label
                </Label>
                <Input
                  id="field-label"
                  value={selectedField.label}
                  onChange={(e) =>
                    updateField({ ...selectedField, label: e.target.value })
                  }
                />
              </div>

              {/* Role */}
              <div className="space-y-1.5">
                <Label htmlFor="field-role" className="text-xs text-slate-500">
                  Signer Role
                </Label>
                <Select
                  value={selectedField.role}
                  onValueChange={(value) =>
                    updateField({
                      ...selectedField,
                      role: value as SignerRole,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(SIGNER_ROLES).map(([key, role]) => (
                      <SelectItem key={key} value={key}>
                        {role.fullLabel}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Required */}
              <div className="flex items-center gap-2">
                <Checkbox
                  id="field-required"
                  checked={selectedField.required}
                  onCheckedChange={(checked) =>
                    updateField({
                      ...selectedField,
                      required: checked === true,
                    })
                  }
                />
                <Label
                  htmlFor="field-required"
                  className="text-sm text-slate-700"
                >
                  Required field
                </Label>
              </div>

              {/* Position Info */}
              <div className="rounded-md bg-slate-50 p-3">
                <div className="mb-2 text-xs text-slate-500">Position</div>
                <div className="text-sm text-slate-700">
                  X: {selectedField.x.toFixed(1)}% | Y:{" "}
                  {selectedField.y.toFixed(1)}%
                </div>
                <div className="mt-1 text-sm text-slate-700">
                  Size: {selectedField.width.toFixed(1)}% x{" "}
                  {selectedField.height.toFixed(1)}%
                </div>
              </div>

              {/* Delete Button */}
              <Button
                variant="outline"
                className="w-full border-red-200 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700"
                onClick={() => deleteField(selectedField.id)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Field
              </Button>
            </div>
          ) : (
            <p className="py-5 text-center text-sm text-slate-400">
              Select a field to edit its properties, or click a field type to add
              one.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

export default UploadedDocumentEditor
