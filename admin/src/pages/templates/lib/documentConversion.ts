// ==========================================
// DOCUMENT CONVERSION UTILITIES
// ==========================================
//
// Utilities for converting PDF and DOCX files to images.
// Uses pdfjs-dist for PDFs and mammoth for DOCX files.
//
// @version 1.0.0
// @date 2025-11-28

import * as pdfjs from "pdfjs-dist"
import mammoth from "mammoth"
import { storage, ref, uploadBytes, getDownloadURL } from "@/lib/firebase"

// Set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`

// ==========================================
// TYPES
// ==========================================

export interface ConvertedPage {
  imageData: string // base64 data URL
  width: number
  height: number
  pageNumber: number
}

export interface UploadedPageResult {
  imageUrl: string
  width: number
  height: number
  pageNumber: number
}

export type ProgressCallback = (current: number, total: number) => void

// ==========================================
// PDF CONVERSION
// ==========================================

/**
 * Convert PDF file to array of page images using PDF.js
 *
 * @param file - PDF file to convert
 * @param onProgress - Optional progress callback
 * @returns Array of converted page images
 */
export async function convertPdfToImages(
  file: File,
  onProgress?: ProgressCallback
): Promise<ConvertedPage[]> {
  const arrayBuffer = await file.arrayBuffer()
  const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise
  const pages: ConvertedPage[] = []
  const scale = 2 // Higher quality rendering

  for (let i = 1; i <= pdf.numPages; i++) {
    if (onProgress) {
      onProgress(i, pdf.numPages)
    }

    const page = await pdf.getPage(i)
    const viewport = page.getViewport({ scale })

    const canvas = document.createElement("canvas")
    const context = canvas.getContext("2d")
    if (!context) {
      throw new Error("Could not get canvas context")
    }

    canvas.width = viewport.width
    canvas.height = viewport.height

    // pdfjs-dist v4+ requires canvas property
    const renderContext = {
      canvasContext: context,
      viewport,
    }
    // @ts-expect-error - pdfjs-dist types expect canvas property but canvasContext works
    await page.render(renderContext).promise

    pages.push({
      imageData: canvas.toDataURL("image/png"),
      width: viewport.width,
      height: viewport.height,
      pageNumber: i,
    })
  }

  return pages
}

// ==========================================
// DOCX CONVERSION
// ==========================================

/**
 * Convert DOCX file to images using mammoth.js + html2canvas
 *
 * Note: DOCX conversion is less accurate than PDF. The document is
 * first converted to HTML, then rendered as an image. Complex
 * formatting may not be preserved perfectly.
 *
 * @param file - DOCX file to convert
 * @param onProgress - Optional progress callback
 * @returns Array of converted page images
 */
export async function convertDocxToImages(
  file: File,
  onProgress?: ProgressCallback
): Promise<ConvertedPage[]> {
  const arrayBuffer = await file.arrayBuffer()

  // Convert DOCX to HTML using mammoth
  const result = await mammoth.convertToHtml({ arrayBuffer })
  const html = result.value

  // Create a hidden container for rendering
  const container = document.createElement("div")
  container.style.cssText = `
    position: absolute;
    left: -9999px;
    top: 0;
    width: 816px;
    padding: 60px;
    background: white;
    font-family: 'Times New Roman', serif;
    font-size: 12pt;
    line-height: 1.5;
  `
  container.innerHTML = html
  document.body.appendChild(container)

  // Wait for images to load
  await new Promise((resolve) => setTimeout(resolve, 500))

  if (onProgress) {
    onProgress(1, 1)
  }

  // Dynamically import html2canvas
  const { default: html2canvas } = await import("html2canvas")

  // Capture as image
  const canvas = await html2canvas(container, {
    scale: 2,
    useCORS: true,
    logging: false,
  })

  document.body.removeChild(container)

  // For Word docs, we'll treat it as a single page (simplification)
  // In production, you'd want to paginate based on content height
  const pages: ConvertedPage[] = [
    {
      imageData: canvas.toDataURL("image/png"),
      width: canvas.width,
      height: canvas.height,
      pageNumber: 1,
    },
  ]

  return pages
}

// ==========================================
// STORAGE UPLOAD
// ==========================================

/**
 * Upload page images to Firebase Storage and return URLs
 *
 * @param pages - Array of converted pages
 * @param templateId - Template ID for storage path
 * @returns Array of uploaded page results with URLs
 */
export async function uploadPageImagesToStorage(
  pages: ConvertedPage[],
  templateId: string
): Promise<UploadedPageResult[]> {
  const uploadedPages: UploadedPageResult[] = []

  for (let i = 0; i < pages.length; i++) {
    const page = pages[i]
    const pageRef = ref(storage, `templates/${templateId}/page_${i + 1}.png`)

    // Convert base64 to blob
    const response = await fetch(page.imageData)
    const blob = await response.blob()

    // Upload to storage
    await uploadBytes(pageRef, blob, { contentType: "image/png" })

    // Get download URL
    const imageUrl = await getDownloadURL(pageRef)

    uploadedPages.push({
      imageUrl,
      width: page.width,
      height: page.height,
      pageNumber: page.pageNumber,
    })
  }

  return uploadedPages
}

// ==========================================
// FILE VALIDATION
// ==========================================

/**
 * Get file extension in lowercase
 */
export function getFileExtension(filename: string): string {
  return filename.split(".").pop()?.toLowerCase() || ""
}

/**
 * Check if file is a valid document type
 */
export function isValidDocumentType(file: File): boolean {
  const extension = getFileExtension(file.name)
  return ["pdf", "docx"].includes(extension)
}

/**
 * Get document type from file
 */
export function getDocumentType(file: File): "pdf" | "docx" | null {
  const extension = getFileExtension(file.name)
  if (extension === "pdf") return "pdf"
  if (extension === "docx") return "docx"
  return null
}

/**
 * Convert file based on type
 */
export async function convertDocument(
  file: File,
  onProgress?: ProgressCallback
): Promise<ConvertedPage[]> {
  const type = getDocumentType(file)

  if (type === "pdf") {
    return convertPdfToImages(file, onProgress)
  } else if (type === "docx") {
    return convertDocxToImages(file, onProgress)
  } else {
    throw new Error("Unsupported file type. Please use PDF or DOCX files.")
  }
}
