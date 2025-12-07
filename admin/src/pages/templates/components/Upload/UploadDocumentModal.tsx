// ==========================================
// UPLOAD DOCUMENT MODAL
// ==========================================
//
// Modal for uploading PDF/DOCX files and converting them to images.
// Port from templates.html lines 321-644.
//
// @version 1.0.0
// @date 2025-11-28

import { useState, useCallback } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Upload,
  FileText,
  AlertCircle,
  Loader2,
} from "lucide-react"
import { db, collection, doc, serverTimestamp, addDoc } from "@/lib/firebase"
import {
  convertDocument,
  uploadPageImagesToStorage,
  isValidDocumentType,
  getDocumentType,
  type ConvertedPage,
} from "../../lib/documentConversion"
import type { Template, UploadedPage } from "../../types"
import { cn } from "@/lib/utils"

interface UploadDocumentModalProps {
  open: boolean
  onClose: () => void
  onUploadComplete: (template: Template) => void
  userId: string
  tenantId: string
}

/**
 * Modal for uploading PDF/DOCX documents.
 * Converts files to images and creates an "uploaded" type template.
 */
export function UploadDocumentModal({
  open,
  onClose,
  onUploadComplete,
  userId,
  tenantId,
}: UploadDocumentModalProps) {
  const [file, setFile] = useState<File | null>(null)
  const [converting, setConverting] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState({ current: 0, total: 0 })
  const [error, setError] = useState<string | null>(null)
  const [previewPages, setPreviewPages] = useState<ConvertedPage[]>([])
  const [templateName, setTemplateName] = useState("")

  // Handle file selection
  const handleFileSelect = useCallback(async (selectedFile: File) => {
    if (!selectedFile) return

    if (!isValidDocumentType(selectedFile)) {
      setError("Please select a PDF or Word (.docx) file")
      return
    }

    setFile(selectedFile)
    setTemplateName(selectedFile.name.replace(/\.[^/.]+$/, ""))
    setError(null)
    setConverting(true)

    try {
      const pages = await convertDocument(selectedFile, (current, total) => {
        setProgress({ current, total })
      })
      setPreviewPages(pages)
    } catch (err) {
      console.error("Conversion error:", err)
      setError("Failed to convert document. Please try again.")
    } finally {
      setConverting(false)
    }
  }, [])

  // Handle file input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      handleFileSelect(selectedFile)
    }
  }

  // Handle drag and drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.currentTarget.classList.add("border-teal-500")
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.currentTarget.classList.remove("border-teal-500")
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.currentTarget.classList.remove("border-teal-500")
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile) {
      handleFileSelect(droppedFile)
    }
  }

  // Create template from uploaded document
  const handleCreateTemplate = async () => {
    if (!templateName.trim() || previewPages.length === 0 || !file) return

    setUploading(true)
    setError(null)

    try {
      // Create template document first to get ID
      const templateRef = doc(collection(db, "templates"))
      const templateId = templateRef.id

      // Upload images to Storage
      const uploadedPages: UploadedPage[] = await uploadPageImagesToStorage(
        previewPages,
        templateId
      )

      // Create the template document
      const templateData: Partial<Template> = {
        id: templateId,
        name: templateName.trim(),
        type: "uploaded",
        status: "draft",
        createdAt: serverTimestamp() as unknown as Date,
        updatedAt: serverTimestamp() as unknown as Date,
        createdBy: userId,
        tenantId,
        uploadedFile: {
          type: getDocumentType(file) || "pdf",
          originalName: file.name,
          pages: uploadedPages,
        },
        overlayFields: [],
      }

      await addDoc(collection(db, "templates"), {
        ...templateData,
        id: templateId,
      })

      onUploadComplete(templateData as Template)
    } catch (err) {
      console.error("Error creating template:", err)
      setError("Failed to create template. Please try again.")
      setUploading(false)
    }
  }

  // Reset state
  const handleReset = () => {
    setFile(null)
    setPreviewPages([])
    setTemplateName("")
    setError(null)
    setProgress({ current: 0, total: 0 })
  }

  // Handle close
  const handleClose = () => {
    handleReset()
    onClose()
  }

  const isLoading = converting || uploading

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <DialogContent className="max-h-[90vh] max-w-[700px] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5 text-teal-600" />
            Upload Document
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-auto py-4">
          {/* File Drop Zone */}
          {!file && !isLoading && (
            <div
              className={cn(
                "cursor-pointer rounded-lg border-2 border-dashed border-slate-300 p-12 text-center transition-colors",
                "hover:border-teal-400"
              )}
              onClick={() => document.getElementById("upload-file-input")?.click()}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <FileText className="mx-auto h-12 w-12 text-slate-400" />
              <p className="mt-4 text-base font-medium text-slate-600">
                Drop your document here or click to browse
              </p>
              <p className="mt-2 text-sm text-slate-400">
                Supports PDF and Word (.docx) files
              </p>
              <input
                id="upload-file-input"
                type="file"
                accept=".pdf,.docx"
                onChange={handleInputChange}
                className="hidden"
              />
            </div>
          )}

          {/* Converting Progress */}
          {converting && (
            <div className="py-10 text-center">
              <Loader2 className="mx-auto h-12 w-12 animate-spin text-teal-600" />
              <p className="mt-4 text-slate-600">
                {progress.total > 0
                  ? `Converting page ${progress.current} of ${progress.total}...`
                  : "Processing..."}
              </p>
            </div>
          )}

          {/* Uploading Progress */}
          {uploading && (
            <div className="py-10 text-center">
              <Loader2 className="mx-auto h-12 w-12 animate-spin text-teal-600" />
              <p className="mt-4 text-slate-600">
                Uploading to server...
              </p>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mb-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}

          {/* Preview */}
          {previewPages.length > 0 && !isLoading && (
            <div className="space-y-5">
              {/* Template Name */}
              <div className="space-y-2">
                <Label htmlFor="template-name">Template Name</Label>
                <Input
                  id="template-name"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  placeholder="Enter template name..."
                />
              </div>

              {/* Page Previews */}
              <div>
                <Label className="mb-3 block">
                  Preview ({previewPages.length} page{previewPages.length > 1 ? "s" : ""})
                </Label>
                <div className="grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-3">
                  {previewPages.map((page, index) => (
                    <div
                      key={index}
                      className="overflow-hidden rounded border border-slate-200"
                      style={{
                        aspectRatio: `${page.width}/${page.height}`,
                      }}
                    >
                      <img
                        src={page.imageData}
                        alt={`Page ${index + 1}`}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Reset Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
              >
                Choose Different File
              </Button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 border-t pt-4">
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleCreateTemplate}
            disabled={!templateName.trim() || previewPages.length === 0 || isLoading}
            className="bg-gradient-to-r from-teal-600 to-teal-500"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {uploading ? "Creating..." : "Converting..."}
              </>
            ) : (
              "Create Template"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default UploadDocumentModal
