import { useState, useCallback, useEffect, useRef, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Document, Page, pdfjs } from 'react-pdf'
import { ref, getDownloadURL } from 'firebase/storage'
import { storage } from '@/lib/firebase'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import {
  ChevronLeft,
  ChevronRight,
  FileText,
  Video,
  Music,
  Link as LinkIcon,
  Heart,
  Plus,
  Download,
  StickyNote,
  Trash2,
  Check,
  Loader2,
  ZoomIn,
  ZoomOut,
  Maximize2,
  X,
  RotateCcw,
  Sun,
  Moon,
  Palette,
} from 'lucide-react'
import { useResourceNotes, type ResourceNote } from '../hooks/useResourceNotes'
import { useResourceProgress } from '../hooks/useResourceProgress'
import type { ResourceWithProgress } from '../hooks/useResources'
import { haptics } from '@/lib/animations'
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch'
import type { ReactZoomPanPinchRef } from 'react-zoom-pan-pinch'

// Import react-pdf styles
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'

// Set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`

// =============================================================================
// TYPES
// =============================================================================

interface ResourceViewerModalProps {
  resource: ResourceWithProgress | null
  isOpen: boolean
  onClose: () => void
  onToggleFavorite?: (resourceId: string, resourceTitle?: string) => void
  onToggleLibrary?: (resourceId: string) => void
  isFavorite?: boolean
  isInLibrary?: boolean
}

type ReadingMode = 'light' | 'dark' | 'sepia'

// =============================================================================
// CONSTANTS
// =============================================================================

const CONTROLS_HIDE_DELAY = 2500 // 2.5 seconds - industry standard
const ZOOM_STEP = 0.25
const MIN_SCALE = 0.5
const MAX_SCALE = 4
const DOUBLE_TAP_SCALE = 2

// Reading mode styles
const readingModeStyles: Record<ReadingMode, { bg: string; filter: string; label: string }> = {
  light: {
    bg: 'bg-gray-900',
    filter: '',
    label: 'Light',
  },
  dark: {
    bg: 'bg-black',
    filter: 'invert(1) hue-rotate(180deg)',
    label: 'Dark',
  },
  sepia: {
    bg: 'bg-[#2a2418]',
    filter: 'sepia(0.3)',
    label: 'Sepia',
  },
}

// =============================================================================
// PAGE TRANSITION VARIANTS
// =============================================================================

const pageVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
    scale: 0.95,
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 300 : -300,
    opacity: 0,
    scale: 0.95,
  }),
}

const pageTransition = {
  type: 'spring' as const,
  stiffness: 300,
  damping: 30,
}

// =============================================================================
// NOTES PANEL COMPONENT
// =============================================================================

interface NotesPanelProps {
  notes: ResourceNote[]
  onDeleteNote: (noteId: string) => void
  onJumpToPage: (pageNumber: number) => void
  onAddNote: () => void
  loading: boolean
}

function NotesPanel({
  notes,
  onDeleteNote,
  onJumpToPage,
  onAddNote,
  loading,
}: NotesPanelProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (notes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
        <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mb-4">
          <StickyNote className="w-7 h-7 text-muted-foreground" />
        </div>
        <h3 className="font-semibold text-base mb-2">No notes yet</h3>
        <p className="text-sm text-muted-foreground mb-4 max-w-[240px]">
          Add notes to remember important points from this resource
        </p>
        <Button onClick={onAddNote} size="sm">
          <Plus className="h-4 w-4 mr-1" />
          Add Note
        </Button>
      </div>
    )
  }

  // Group notes by page
  const notesByPage = notes.reduce((acc, note) => {
    const key = note.pageNumber ?? 'general'
    if (!acc[key]) acc[key] = []
    acc[key].push(note)
    return acc
  }, {} as Record<string | number, ResourceNote[]>)

  const sortedKeys = Object.keys(notesByPage).sort((a, b) => {
    if (a === 'general') return 1
    if (b === 'general') return -1
    return Number(a) - Number(b)
  })

  return (
    <div className="space-y-4 pb-4">
      {sortedKeys.map((key) => (
        <div key={key} className="space-y-2">
          <h4 className="text-xs font-medium text-muted-foreground px-1">
            {key === 'general' ? 'General Notes' : `Page ${key}`}
          </h4>
          {notesByPage[key].map((note) => (
            <motion.div
              key={note.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-muted/50 rounded-lg p-3 space-y-2"
            >
              {note.highlightedText && (
                <p className="text-xs italic text-muted-foreground border-l-2 border-teal-500 pl-2">
                  "{note.highlightedText}"
                </p>
              )}
              <p className="text-sm">{note.noteContent}</p>
              <div className="flex items-center justify-between pt-1">
                <span className="text-xs text-muted-foreground">
                  {note.createdAt?.toDate?.()?.toLocaleDateString() || 'Just now'}
                </span>
                <div className="flex items-center gap-1">
                  {note.pageNumber && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => onJumpToPage(note.pageNumber!)}
                    >
                      <FileText className="h-3 w-3" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-destructive hover:text-destructive"
                    onClick={() => onDeleteNote(note.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ))}
      <Button onClick={onAddNote} className="w-full" variant="outline" size="sm">
        <Plus className="h-4 w-4 mr-1" />
        Add New Note
      </Button>
    </div>
  )
}

// =============================================================================
// ADD NOTE DIALOG
// =============================================================================

interface AddNoteDialogProps {
  isOpen: boolean
  onClose: () => void
  onSave: (content: string) => void
  resourceTitle: string
  pageNumber: number | null
  highlightedText: string | null
  isSaving: boolean
}

function AddNoteDialog({
  isOpen,
  onClose,
  onSave,
  resourceTitle,
  pageNumber,
  highlightedText,
  isSaving,
}: AddNoteDialogProps) {
  const [content, setContent] = useState('')

  const handleSave = () => {
    if (content.trim()) {
      onSave(content.trim())
      setContent('')
    }
  }

  useEffect(() => {
    if (!isOpen) {
      setContent('')
    }
  }, [isOpen])

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Note</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{resourceTitle}</span>
            {pageNumber && (
              <span className="ml-2 text-xs">Page {pageNumber}</span>
            )}
          </div>

          {highlightedText && (
            <div className="bg-muted rounded-lg p-3 border-l-2 border-teal-500">
              <p className="text-sm italic text-muted-foreground">
                "{highlightedText}"
              </p>
            </div>
          )}

          <Textarea
            placeholder="Write your note here..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[120px] resize-none"
            autoFocus
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!content.trim() || isSaving}>
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin mr-1" />
            ) : (
              <Check className="h-4 w-4 mr-1" />
            )}
            Save Note
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// =============================================================================
// PDF VIEWER COMPONENT (Preview Mode)
// =============================================================================

interface PDFViewerProps {
  url: string
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  onTotalPagesChange: (total: number) => void
  direction: number
  onTextSelect: (text: string) => void
  scale: number
}

function PDFViewer({
  url,
  currentPage,
  onTotalPagesChange,
  direction,
  onTextSelect,
  scale,
}: PDFViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isLoading, setIsLoading] = useState(true)

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    onTotalPagesChange(numPages)
    setIsLoading(false)
  }

  // Handle text selection
  const handleMouseUp = () => {
    const selection = window.getSelection()
    const selectedText = selection?.toString().trim()
    if (selectedText && selectedText.length > 0) {
      onTextSelect(selectedText)
    }
  }

  return (
    <div
      ref={containerRef}
      className="relative flex-1 flex items-center justify-center overflow-hidden bg-gray-100 dark:bg-gray-900"
      onMouseUp={handleMouseUp}
    >
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
          <Loader2 className="h-8 w-8 animate-spin text-teal-500" />
        </div>
      )}

      <Document
        file={url}
        onLoadSuccess={onDocumentLoadSuccess}
        loading={null}
        className="flex items-center justify-center"
      >
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentPage}
            custom={direction}
            variants={pageVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={pageTransition}
            className="shadow-2xl"
          >
            <Page
              pageNumber={currentPage}
              scale={scale}
              renderTextLayer={true}
              renderAnnotationLayer={true}
              className="bg-white"
              loading={null}
            />
          </motion.div>
        </AnimatePresence>
      </Document>
    </div>
  )
}

// =============================================================================
// VIDEO VIEWER COMPONENT
// =============================================================================

interface VideoViewerProps {
  url: string
}

// Helper to get YouTube/Vimeo embed URL
function getVideoEmbedUrl(url: string): string | null {
  if (!url) return null

  // YouTube
  const youtubeMatch = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  )
  if (youtubeMatch) {
    return `https://www.youtube.com/embed/${youtubeMatch[1]}?rel=0`
  }

  // Vimeo
  const vimeoMatch = url.match(/vimeo\.com\/(?:video\/)?(\d+)/)
  if (vimeoMatch) {
    return `https://player.vimeo.com/video/${vimeoMatch[1]}`
  }

  return null
}

function VideoViewer({ url }: VideoViewerProps) {
  const embedUrl = useMemo(() => getVideoEmbedUrl(url), [url])
  const isEmbed = embedUrl !== null

  if (isEmbed) {
    return (
      <div className="flex-1 flex items-center justify-center bg-black">
        <iframe
          src={embedUrl}
          className="w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    )
  }

  // Direct video URL - use native video element
  return (
    <div className="flex-1 flex items-center justify-center bg-black p-4">
      <video
        src={url}
        controls
        className="max-h-[80vh] max-w-full rounded-lg"
        controlsList="nodownload"
      >
        Your browser does not support the video element.
      </video>
    </div>
  )
}

// =============================================================================
// AUDIO VIEWER COMPONENT
// =============================================================================

interface AudioViewerProps {
  url: string
  title: string
}

function AudioViewer({ url, title }: AudioViewerProps) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-gradient-to-br from-teal-600 to-teal-800 p-8">
      <div className="w-48 h-48 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center mb-8 shadow-xl">
        <Music className="w-24 h-24 text-white/80" />
      </div>
      <h3 className="text-xl font-semibold text-white mb-8 text-center max-w-md">
        {title}
      </h3>
      <audio controls className="w-full max-w-md">
        <source src={url} />
        Your browser does not support the audio element.
      </audio>
    </div>
  )
}

// =============================================================================
// LINK VIEWER COMPONENT
// =============================================================================

interface LinkViewerProps {
  url: string
  title: string
}

function LinkViewer({ url, title }: LinkViewerProps) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8">
      <div className="w-24 h-24 rounded-2xl bg-teal-100 dark:bg-teal-900/50 flex items-center justify-center mb-6">
        <LinkIcon className="w-12 h-12 text-teal-600 dark:text-teal-400" />
      </div>
      <h3 className="text-xl font-semibold mb-4 text-center max-w-md">
        {title}
      </h3>
      <p className="text-sm text-muted-foreground mb-6 text-center max-w-md">
        This resource links to an external website
      </p>
      <Button asChild>
        <a href={url} target="_blank" rel="noopener noreferrer">
          <LinkIcon className="h-4 w-4 mr-2" />
          Open Link
        </a>
      </Button>
    </div>
  )
}

// =============================================================================
// TEXT SELECTION POPUP
// =============================================================================

interface TextSelectionPopupProps {
  position: { x: number; y: number } | null
  selectedText: string
  onAddNote: () => void
  onDismiss: () => void
}

function TextSelectionPopup({
  position,
  selectedText,
  onAddNote,
  onDismiss,
}: TextSelectionPopupProps) {
  if (!position || !selectedText) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: -10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed z-50 bg-white dark:bg-gray-800 rounded-lg shadow-xl border p-1 flex gap-1"
      style={{ left: position.x, top: position.y }}
    >
      <Button size="sm" variant="ghost" onClick={onAddNote}>
        <StickyNote className="h-4 w-4 mr-1" />
        Add Note
      </Button>
      <Button
        size="sm"
        variant="ghost"
        onClick={() => {
          navigator.clipboard.writeText(selectedText)
          haptics.tap()
          onDismiss()
        }}
      >
        Copy
      </Button>
    </motion.div>
  )
}

// =============================================================================
// FULL SCREEN READER COMPONENT (Industry Standard Implementation)
// =============================================================================

interface FullScreenReaderProps {
  url: string
  currentPage: number
  totalPages: number
  direction: number
  scale: number
  onPageChange: (page: number) => void
  onTotalPagesChange: (total: number) => void
  onScaleChange: (scale: number) => void
  onClose: () => void
  onTextSelect: (text: string) => void
  selectionPosition: { x: number; y: number } | null
  selectedText: string
  onAddNoteFromSelection: () => void
  onDismissSelection: () => void
}

function FullScreenReader({
  url,
  currentPage,
  totalPages,
  direction,
  scale,
  onPageChange,
  onTotalPagesChange,
  onScaleChange,
  onClose,
  onTextSelect,
  selectionPosition,
  selectedText,
  onAddNoteFromSelection,
  onDismissSelection,
}: FullScreenReaderProps) {
  // State
  const [isLoading, setIsLoading] = useState(true)
  const [localDirection, setLocalDirection] = useState(0)
  const [controlsVisible, setControlsVisible] = useState(true)
  const [readingMode, setReadingMode] = useState<ReadingMode>('light')
  const [showModeMenu, setShowModeMenu] = useState(false)

  // Refs
  const hideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const transformRef = useRef<ReactZoomPanPinchRef>(null)
  const lastTapRef = useRef<number>(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null)
  const isTouchMoveRef = useRef(false)

  // Document load handler
  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    onTotalPagesChange(numPages)
    setIsLoading(false)
  }

  // ==========================================================================
  // AUTO-HIDE CONTROLS (Industry Standard: 2.5s timeout)
  // ==========================================================================

  const showControls = useCallback(() => {
    setControlsVisible(true)
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current)
    }
    hideTimeoutRef.current = setTimeout(() => {
      // Only hide if not zoomed in (when zoomed, user may need controls)
      if (scale <= 1.1) {
        setControlsVisible(false)
      }
    }, CONTROLS_HIDE_DELAY)
  }, [scale])

  const toggleControls = useCallback(() => {
    if (controlsVisible) {
      setControlsVisible(false)
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current)
      }
    } else {
      showControls()
    }
  }, [controlsVisible, showControls])

  // Start auto-hide timer on mount
  useEffect(() => {
    showControls()
    return () => {
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current)
      }
    }
  }, [showControls])

  // ==========================================================================
  // PAGE NAVIGATION
  // ==========================================================================

  const goToPage = useCallback((page: number) => {
    if (page >= 1 && page <= totalPages) {
      setLocalDirection(page > currentPage ? 1 : -1)
      onPageChange(page)
      haptics.tap()
      // Reset zoom when changing pages
      transformRef.current?.resetTransform()
      onScaleChange(1)
    }
  }, [currentPage, totalPages, onPageChange, onScaleChange])

  const nextPage = useCallback(() => {
    if (currentPage < totalPages) {
      goToPage(currentPage + 1)
    }
  }, [currentPage, totalPages, goToPage])

  const prevPage = useCallback(() => {
    if (currentPage > 1) {
      goToPage(currentPage - 1)
    }
  }, [currentPage, goToPage])

  // ==========================================================================
  // TAP ZONE HANDLING (Industry Standard: Left 30%, Center 40%, Right 30%)
  // ==========================================================================

  const handleTapZone = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    // Don't handle if clicking on a button or control
    const target = e.target as HTMLElement
    if (target.closest('button') || target.closest('[role="button"]')) {
      return
    }

    // Get tap position
    const clientX = 'touches' in e ? e.touches[0]?.clientX ?? 0 : e.clientX
    const screenWidth = window.innerWidth
    const tapPosition = clientX / screenWidth

    // Only handle taps when not zoomed (pan takes priority when zoomed)
    if (scale > 1.1) {
      showControls()
      return
    }

    // Check for double tap (for zoom toggle)
    const now = Date.now()
    const DOUBLE_TAP_DELAY = 300
    if (now - lastTapRef.current < DOUBLE_TAP_DELAY) {
      // Double tap - toggle zoom
      if (scale > 1.1) {
        transformRef.current?.resetTransform()
        onScaleChange(1)
      } else {
        transformRef.current?.zoomIn(DOUBLE_TAP_SCALE - 1)
        onScaleChange(DOUBLE_TAP_SCALE)
      }
      lastTapRef.current = 0
      return
    }
    lastTapRef.current = now

    // Single tap with delay to allow for double tap detection
    setTimeout(() => {
      if (lastTapRef.current === 0) return // Double tap was detected

      if (tapPosition < 0.3) {
        // Left 30% - Previous page
        prevPage()
      } else if (tapPosition > 0.7) {
        // Right 30% - Next page
        nextPage()
      } else {
        // Center 40% - Toggle controls
        toggleControls()
      }
    }, DOUBLE_TAP_DELAY + 10)
  }, [scale, showControls, prevPage, nextPage, toggleControls, onScaleChange])

  // ==========================================================================
  // KEYBOARD NAVIGATION (Full Industry Standard Support)
  // ==========================================================================

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      showControls()

      switch (e.key) {
        // Page navigation
        case 'ArrowLeft':
        case 'ArrowUp':
        case 'PageUp':
          e.preventDefault()
          prevPage()
          break
        case 'ArrowRight':
        case 'ArrowDown':
        case 'PageDown':
          e.preventDefault()
          nextPage()
          break
        case ' ': // Space
          e.preventDefault()
          if (e.shiftKey) {
            prevPage()
          } else {
            nextPage()
          }
          break
        case 'Home':
          e.preventDefault()
          goToPage(1)
          break
        case 'End':
          e.preventDefault()
          goToPage(totalPages)
          break

        // Zoom controls
        case '+':
        case '=':
          e.preventDefault()
          transformRef.current?.zoomIn(ZOOM_STEP)
          onScaleChange(Math.min(scale + ZOOM_STEP, MAX_SCALE))
          break
        case '-':
        case '_':
          e.preventDefault()
          transformRef.current?.zoomOut(ZOOM_STEP)
          onScaleChange(Math.max(scale - ZOOM_STEP, MIN_SCALE))
          break
        case '0':
          e.preventDefault()
          transformRef.current?.resetTransform()
          onScaleChange(1)
          break

        // Close
        case 'Escape':
          e.preventDefault()
          onClose()
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [prevPage, nextPage, goToPage, totalPages, onClose, showControls, scale, onScaleChange])

  // ==========================================================================
  // NATIVE TOUCH HANDLERS (iOS PWA Fix)
  // Uses native event listeners to bypass react-zoom-pan-pinch event capture
  // ==========================================================================

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    // Constants for gesture detection
    const TAP_THRESHOLD = 10 // pixels - max movement for a tap
    const TAP_DURATION = 300 // ms - max duration for a tap
    const DOUBLE_TAP_DELAY = 300 // ms - max time between taps for double tap
    const SWIPE_THRESHOLD = 50 // pixels - min horizontal distance for swipe
    const SWIPE_VERTICAL_LIMIT = 100 // pixels - max vertical movement during swipe

    const handleTouchStart = (e: TouchEvent) => {
      // Ignore multi-touch (pinch gestures)
      if (e.touches.length > 1) {
        touchStartRef.current = null
        return
      }

      const touch = e.touches[0]
      touchStartRef.current = {
        x: touch.clientX,
        y: touch.clientY,
        time: Date.now(),
      }
      isTouchMoveRef.current = false
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (!touchStartRef.current || e.touches.length > 1) return

      const touch = e.touches[0]
      const dx = Math.abs(touch.clientX - touchStartRef.current.x)
      const dy = Math.abs(touch.clientY - touchStartRef.current.y)

      // If moved beyond threshold, it's a drag/pan not a tap
      if (dx > TAP_THRESHOLD || dy > TAP_THRESHOLD) {
        isTouchMoveRef.current = true
      }
    }

    const handleTouchEnd = (e: TouchEvent) => {
      if (!touchStartRef.current || e.changedTouches.length === 0) {
        touchStartRef.current = null
        return
      }

      const touch = e.changedTouches[0]
      const startData = touchStartRef.current
      touchStartRef.current = null

      // Calculate movement
      const dx = touch.clientX - startData.x
      const dy = touch.clientY - startData.y
      const absDx = Math.abs(dx)
      const absDy = Math.abs(dy)
      const duration = Date.now() - startData.time

      // Don't handle if tapping on a button or control
      const target = e.target as HTMLElement
      if (target.closest('button') || target.closest('[role="button"]')) {
        return
      }

      // When zoomed in, only show controls - don't navigate
      if (scale > 1.1) {
        showControls()
        return
      }

      // ==========================================================================
      // SWIPE DETECTION (only when not zoomed)
      // Horizontal swipe: dx > threshold, dy < vertical limit
      // Only trigger if touch moved (isTouchMoveRef is true)
      // ==========================================================================
      if (isTouchMoveRef.current && absDx > SWIPE_THRESHOLD && absDy < SWIPE_VERTICAL_LIMIT) {
        // This was a swipe (detected from our touchmove tracking)
        if (dx < -SWIPE_THRESHOLD) {
          // Swipe left - next page
          nextPage()
          return
        } else if (dx > SWIPE_THRESHOLD) {
          // Swipe right - previous page
          prevPage()
          return
        }
      }

      // ==========================================================================
      // TAP DETECTION
      // ==========================================================================

      // Not a tap if moved too much or took too long
      if (absDx > TAP_THRESHOLD || absDy > TAP_THRESHOLD || duration > TAP_DURATION) {
        // Check if it was a horizontal swipe even without touchmove tracking
        if (absDx > SWIPE_THRESHOLD && absDy < SWIPE_VERTICAL_LIMIT) {
          if (dx < -SWIPE_THRESHOLD) {
            nextPage()
          } else if (dx > SWIPE_THRESHOLD) {
            prevPage()
          }
        }
        return
      }

      // Calculate tap position relative to screen width
      const screenWidth = window.innerWidth
      const tapPosition = touch.clientX / screenWidth

      // Check for double tap
      const now = Date.now()
      if (now - lastTapRef.current < DOUBLE_TAP_DELAY) {
        // Double tap - toggle zoom
        e.preventDefault()
        e.stopPropagation()

        if (scale > 1.1) {
          transformRef.current?.resetTransform()
          onScaleChange(1)
        } else {
          transformRef.current?.zoomIn(DOUBLE_TAP_SCALE - 1)
          onScaleChange(DOUBLE_TAP_SCALE)
        }
        lastTapRef.current = 0
        haptics.tap()
        return
      }
      lastTapRef.current = now

      // Single tap - delay to check for double tap
      setTimeout(() => {
        if (lastTapRef.current === 0) return // Double tap was detected

        if (tapPosition < 0.3) {
          // Left 30% - Previous page
          prevPage()
        } else if (tapPosition > 0.7) {
          // Right 30% - Next page
          nextPage()
        } else {
          // Center 40% - Toggle controls
          toggleControls()
        }
      }, DOUBLE_TAP_DELAY + 10)
    }

    // Add event listeners with capture phase to get events before TransformWrapper
    container.addEventListener('touchstart', handleTouchStart, { passive: true })
    container.addEventListener('touchmove', handleTouchMove, { passive: true })
    container.addEventListener('touchend', handleTouchEnd, { passive: false })

    return () => {
      container.removeEventListener('touchstart', handleTouchStart)
      container.removeEventListener('touchmove', handleTouchMove)
      container.removeEventListener('touchend', handleTouchEnd)
    }
  }, [scale, showControls, prevPage, nextPage, toggleControls, onScaleChange])

  // ==========================================================================
  // ZOOM HANDLERS
  // ==========================================================================

  const handleZoomIn = useCallback(() => {
    haptics.tap()
    transformRef.current?.zoomIn(ZOOM_STEP)
    const newScale = Math.min(scale + ZOOM_STEP, MAX_SCALE)
    onScaleChange(newScale)
    showControls()
  }, [scale, onScaleChange, showControls])

  const handleZoomOut = useCallback(() => {
    haptics.tap()
    transformRef.current?.zoomOut(ZOOM_STEP)
    const newScale = Math.max(scale - ZOOM_STEP, MIN_SCALE)
    onScaleChange(newScale)
    showControls()
  }, [scale, onScaleChange, showControls])

  const handleResetZoom = useCallback(() => {
    haptics.tap()
    transformRef.current?.resetTransform()
    onScaleChange(1)
    showControls()
  }, [onScaleChange, showControls])

  // Handle text selection
  const handleMouseUp = () => {
    const selection = window.getSelection()
    const text = selection?.toString().trim()
    if (text && text.length > 0) {
      onTextSelect(text)
    }
  }

  // Handle transform change from react-zoom-pan-pinch
  const handleTransformChange = useCallback((ref: ReactZoomPanPinchRef) => {
    const newScale = ref.state.scale
    if (Math.abs(newScale - scale) > 0.01) {
      onScaleChange(newScale)
    }
  }, [scale, onScaleChange])

  // Reading mode style
  const modeStyle = readingModeStyles[readingMode]

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={cn(
        "fixed inset-0 z-[100] flex flex-col",
        modeStyle.bg
      )}
      style={{
        height: '100dvh',
        touchAction: 'none',
        WebkitUserSelect: 'none',
        userSelect: 'none',
      }}
      onClick={(e) => e.stopPropagation()}
      onTouchStart={(e) => e.stopPropagation()}
      onTouchEnd={(e) => e.stopPropagation()}
    >
      {/* =================================================================== */}
      {/* CONTROLS OVERLAY - Auto-hide after 2.5s                            */}
      {/* =================================================================== */}

      <motion.div
        initial={{ opacity: 1 }}
        animate={{ opacity: controlsVisible ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        className="absolute inset-0 z-[110] pointer-events-none"
        style={{ pointerEvents: controlsVisible ? 'auto' : 'none' }}
      >
        {/* Top Bar - Close & Reading Mode */}
        <div className="absolute top-0 left-0 right-0 flex items-center justify-between p-4 bg-gradient-to-b from-black/60 to-transparent">
          {/* Reading Mode Toggle */}
          <div className="relative">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                setShowModeMenu(!showModeMenu)
                showControls()
              }}
              className="p-3 rounded-full bg-black/50 hover:bg-black/70 text-white/90 hover:text-white transition-all cursor-pointer"
              aria-label={`Reading mode: ${modeStyle.label}`}
            >
              {readingMode === 'light' && <Sun className="h-5 w-5" />}
              {readingMode === 'dark' && <Moon className="h-5 w-5" />}
              {readingMode === 'sepia' && <Palette className="h-5 w-5" />}
            </button>

            {/* Mode Menu */}
            <AnimatePresence>
              {showModeMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-full left-0 mt-2 bg-black/80 backdrop-blur-sm rounded-lg p-1 flex flex-col gap-1"
                >
                  {(['light', 'dark', 'sepia'] as ReadingMode[]).map((mode) => (
                    <button
                      key={mode}
                      onClick={(e) => {
                        e.stopPropagation()
                        setReadingMode(mode)
                        setShowModeMenu(false)
                        showControls()
                      }}
                      className={cn(
                        "px-4 py-2 rounded text-sm text-white/90 hover:bg-white/20 transition-all text-left",
                        readingMode === mode && "bg-white/20"
                      )}
                    >
                      {readingModeStyles[mode].label}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Close Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              haptics.tap()
              onClose()
            }}
            className="p-3 rounded-full bg-black/50 hover:bg-black/70 text-white/90 hover:text-white transition-all cursor-pointer"
            aria-label="Close full view (Escape)"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Side Navigation Buttons */}
        {totalPages > 1 && (
          <>
            {/* Previous Page - Left side, vertically centered */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                prevPage()
              }}
              disabled={currentPage <= 1}
              className={cn(
                'absolute left-4 top-1/2 -translate-y-1/2',
                'h-14 w-14 flex items-center justify-center rounded-full',
                'bg-black/50 backdrop-blur-sm',
                'text-white/90 hover:text-white hover:bg-black/70',
                'transition-all disabled:opacity-30 disabled:cursor-not-allowed',
                'active:scale-95 cursor-pointer'
              )}
              aria-label="Previous page (Left Arrow)"
            >
              <ChevronLeft className="h-7 w-7" />
            </button>

            {/* Next Page - Right side, vertically centered */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                nextPage()
              }}
              disabled={currentPage >= totalPages}
              className={cn(
                'absolute right-4 top-1/2 -translate-y-1/2',
                'h-14 w-14 flex items-center justify-center rounded-full',
                'bg-black/50 backdrop-blur-sm',
                'text-white/90 hover:text-white hover:bg-black/70',
                'transition-all disabled:opacity-30 disabled:cursor-not-allowed',
                'active:scale-95 cursor-pointer'
              )}
              aria-label="Next page (Right Arrow)"
            >
              <ChevronRight className="h-7 w-7" />
            </button>
          </>
        )}

        {/* Bottom Bar - Page Indicator & Zoom Controls */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent">
          <div className="flex items-center justify-between">
            {/* Zoom Controls */}
            <div className="flex items-center gap-1 bg-black/50 backdrop-blur-sm rounded-lg p-1">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  handleZoomOut()
                }}
                disabled={scale <= MIN_SCALE}
                className="p-2.5 rounded hover:bg-white/20 text-white/90 hover:text-white transition-all disabled:opacity-30 cursor-pointer"
                aria-label={`Zoom out (current: ${Math.round(scale * 100)}%)`}
              >
                <ZoomOut className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  handleResetZoom()
                }}
                className="px-2 py-1 rounded hover:bg-white/20 text-white/90 hover:text-white transition-all text-sm font-medium min-w-[50px] cursor-pointer"
                aria-label="Reset zoom to 100%"
              >
                {Math.round(scale * 100)}%
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  handleZoomIn()
                }}
                disabled={scale >= MAX_SCALE}
                className="p-2.5 rounded hover:bg-white/20 text-white/90 hover:text-white transition-all disabled:opacity-30 cursor-pointer"
                aria-label="Zoom in"
              >
                <ZoomIn className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  handleResetZoom()
                }}
                className="p-2.5 rounded hover:bg-white/20 text-white/90 hover:text-white transition-all cursor-pointer"
                aria-label="Reset view"
              >
                <RotateCcw className="h-5 w-5" />
              </button>
            </div>

            {/* Page Indicator */}
            <div
              className="px-4 py-2 bg-black/50 backdrop-blur-sm rounded-full text-white/90 text-sm font-medium"
              role="status"
              aria-live="polite"
            >
              Page {currentPage} of {totalPages}
            </div>
          </div>
        </div>
      </motion.div>

      {/* =================================================================== */}
      {/* MAIN PDF CONTENT WITH PAN/ZOOM                                     */}
      {/* =================================================================== */}

      <div
        className="flex-1 flex items-center justify-center overflow-hidden"
        onClick={handleTapZone}
        onTouchEnd={handleTapZone}
        onMouseUp={handleMouseUp}
        onMouseMove={() => showControls()}
      >
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center z-20">
            <Loader2 className="h-10 w-10 animate-spin text-teal-400" />
          </div>
        )}

        <TransformWrapper
          ref={transformRef}
          initialScale={1}
          minScale={MIN_SCALE}
          maxScale={MAX_SCALE}
          centerOnInit={true}
          limitToBounds={true}
          panning={{
            disabled: false,
            velocityDisabled: false,
          }}
          pinch={{
            disabled: false,
          }}
          wheel={{
            disabled: false,
            step: 0.1,
          }}
          doubleClick={{
            disabled: true, // We handle double-tap manually for better control
          }}
          onTransformed={handleTransformChange}
          onPanning={() => showControls()}
          onPinching={() => showControls()}
          onWheel={() => showControls()}
        >
          <TransformComponent
            wrapperStyle={{
              width: '100%',
              height: '100%',
            }}
            contentStyle={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Document
              file={url}
              onLoadSuccess={onDocumentLoadSuccess}
              loading={null}
              className="flex items-center justify-center"
            >
              <AnimatePresence mode="wait" custom={localDirection || direction}>
                <motion.div
                  key={currentPage}
                  custom={localDirection || direction}
                  variants={pageVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={pageTransition}
                  className="shadow-2xl"
                  style={{ filter: modeStyle.filter }}
                >
                  <Page
                    pageNumber={currentPage}
                    scale={1} // Scale handled by TransformWrapper
                    renderTextLayer={true}
                    renderAnnotationLayer={true}
                    className="bg-white"
                    loading={null}
                  />
                </motion.div>
              </AnimatePresence>
            </Document>
          </TransformComponent>
        </TransformWrapper>
      </div>

      {/* =================================================================== */}
      {/* HINTS & ACCESSIBILITY                                              */}
      {/* =================================================================== */}

      {/* Initial hint - fades after 3s */}
      <motion.div
        initial={{ opacity: 0.9 }}
        animate={{ opacity: 0 }}
        transition={{ delay: 3, duration: 1 }}
        className="absolute bottom-24 left-1/2 -translate-x-1/2 z-[105] px-4 py-2 bg-black/60 backdrop-blur-sm rounded-full text-white/80 text-sm pointer-events-none"
      >
        Swipe or tap edges to navigate
      </motion.div>

      {/* Screen reader announcements */}
      <div className="sr-only" aria-live="polite">
        Page {currentPage} of {totalPages}. Zoom level {Math.round(scale * 100)} percent.
      </div>

      {/* Text Selection Popup */}
      <AnimatePresence>
        {selectionPosition && selectedText && (
          <TextSelectionPopup
            position={selectionPosition}
            selectedText={selectedText}
            onAddNote={onAddNoteFromSelection}
            onDismiss={onDismissSelection}
          />
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function ResourceViewerModal({
  resource,
  isOpen,
  onClose,
  onToggleFavorite,
  onToggleLibrary,
  isFavorite = false,
  isInLibrary = false,
}: ResourceViewerModalProps) {
  // Page state
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [direction, setDirection] = useState(0)
  const [scale, setScale] = useState(1)

  // Full view state
  const [isFullView, setIsFullView] = useState(false)

  // Notes state
  const [showNotes, setShowNotes] = useState(false)
  const [showAddNote, setShowAddNote] = useState(false)
  const [highlightedText, setHighlightedText] = useState<string | null>(null)
  const [isSavingNote, setIsSavingNote] = useState(false)

  // Text selection state
  const [selectionPosition, setSelectionPosition] = useState<{ x: number; y: number } | null>(null)
  const [selectedText, setSelectedText] = useState('')

  // PDF URL state (with proper auth token)
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const [pdfLoading, setPdfLoading] = useState(false)
  const [pdfError, setPdfError] = useState<string | null>(null)

  // Notes hook
  const {
    notes,
    loading: notesLoading,
    notesCount,
    addNote,
    deleteNote,
  } = useResourceNotes(resource?.id ?? null)

  // Progress tracking hook
  const { trackView, updatePdfProgress, getProgress } = useResourceProgress()
  const resourceProgress = resource ? getProgress(resource.id) : undefined

  // Fetch authenticated PDF URL from Firebase Storage
  useEffect(() => {
    async function fetchPdfUrl() {
      if (!resource?.url || resource.type !== 'pdf') {
        setPdfUrl(null)
        return
      }

      setPdfLoading(true)
      setPdfError(null)

      try {
        // Check if it's a Firebase Storage URL (supports both old and new bucket formats)
        const isFirebaseStorageUrl =
          resource.url.includes('firebasestorage.googleapis.com') ||
          resource.url.includes('firebasestorage.app') ||
          resource.url.includes('.appspot.com/o/') ||
          resource.url.includes('storage.googleapis.com')

        if (isFirebaseStorageUrl) {
          // Extract the path from the URL
          // URL formats:
          // - https://firebasestorage.googleapis.com/v0/b/bucket/o/path%2Fto%2Ffile.pdf?alt=media
          // - https://storage.googleapis.com/bucket/path/to/file.pdf
          const match = resource.url.match(/\/o\/([^?]+)/)
          if (match) {
            const path = decodeURIComponent(match[1])
            const storageRef = ref(storage, path)
            const downloadUrl = await getDownloadURL(storageRef)
            setPdfUrl(downloadUrl)
          } else {
            // Try extracting path after bucket name for storage.googleapis.com format
            const storageMatch = resource.url.match(/storage\.googleapis\.com\/[^/]+\/(.+)/)
            if (storageMatch) {
              const path = decodeURIComponent(storageMatch[1])
              const storageRef = ref(storage, path)
              const downloadUrl = await getDownloadURL(storageRef)
              setPdfUrl(downloadUrl)
            } else {
              // Fallback to original URL
              setPdfUrl(resource.url)
            }
          }
        } else {
          // Not a Firebase Storage URL, use as-is
          setPdfUrl(resource.url)
        }
      } catch (error) {
        console.error('Error fetching PDF URL:', error)
        setPdfError('Failed to load PDF. Please try again.')
        setPdfUrl(null)
      } finally {
        setPdfLoading(false)
      }
    }

    fetchPdfUrl()
  }, [resource?.url, resource?.type])

  // Reset state when resource changes
  useEffect(() => {
    if (resource) {
      setCurrentPage(1)
      setTotalPages(1)
      setDirection(0)
      setScale(1)
      setIsFullView(false)
      setShowNotes(false)
      setShowAddNote(false)
      setHighlightedText(null)
      setSelectedText('')
      setSelectionPosition(null)
      setPdfUrl(null)
      setPdfError(null)
    }
  }, [resource?.id])

  // Track view when modal opens
  useEffect(() => {
    if (isOpen && resource) {
      trackView(resource.id, resource.title)
    }
  }, [isOpen, resource?.id, resource?.title, trackView])

  // Track PDF progress when page changes
  useEffect(() => {
    if (isOpen && resource?.type === 'pdf' && totalPages > 1) {
      updatePdfProgress(resource.id, currentPage, totalPages)
    }
  }, [isOpen, resource?.id, resource?.type, currentPage, totalPages, updatePdfProgress])

  // Handle page navigation
  const goToPage = useCallback((page: number) => {
    if (page >= 1 && page <= totalPages) {
      setDirection(page > currentPage ? 1 : -1)
      setCurrentPage(page)
      haptics.tap()
    }
  }, [currentPage, totalPages])

  const nextPage = useCallback(() => goToPage(currentPage + 1), [goToPage, currentPage])
  const prevPage = useCallback(() => goToPage(currentPage - 1), [goToPage, currentPage])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen || resource?.type !== 'pdf') return
      if (e.key === 'ArrowLeft') prevPage()
      if (e.key === 'ArrowRight') nextPage()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, resource?.type, prevPage, nextPage])

  // Handle text selection for PDF
  const handleTextSelect = (text: string) => {
    if (text.length > 0) {
      setSelectedText(text)
      // Get selection position
      const selection = window.getSelection()
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0)
        const rect = range.getBoundingClientRect()
        setSelectionPosition({
          x: rect.left + rect.width / 2 - 80,
          y: rect.top - 50,
        })
      }
    }
  }

  // Handle add note from selection
  const handleAddNoteFromSelection = () => {
    setHighlightedText(selectedText)
    setShowAddNote(true)
    setSelectionPosition(null)
    window.getSelection()?.removeAllRanges()
  }

  // Dismiss selection popup
  const dismissSelection = () => {
    setSelectedText('')
    setSelectionPosition(null)
    window.getSelection()?.removeAllRanges()
  }

  // Handle save note
  const handleSaveNote = async (content: string) => {
    if (!resource) return

    setIsSavingNote(true)
    await addNote({
      resourceId: resource.id,
      resourceTitle: resource.title,
      pageNumber: resource.type === 'pdf' ? currentPage : null,
      highlightedText,
      noteContent: content,
    })
    setIsSavingNote(false)
    setShowAddNote(false)
    setHighlightedText(null)
    haptics.tap()
  }

  // Handle delete note
  const handleDeleteNote = async (noteId: string) => {
    await deleteNote(noteId)
    haptics.tap()
  }

  // Handle download
  const handleDownload = () => {
    if (resource?.url) {
      window.open(resource.url, '_blank')
    }
  }

  // Get resource type icon
  const getTypeIcon = () => {
    switch (resource?.type) {
      case 'video':
        return <Video className="h-4 w-4" />
      case 'audio':
        return <Music className="h-4 w-4" />
      case 'link':
        return <LinkIcon className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  if (!resource) return null

  return (
    <>
      <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <SheetContent
          side="bottom"
          className="h-[100dvh] p-0 flex flex-col"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          {/* Header */}
          <SheetHeader className="px-4 py-3 border-b flex-shrink-0">
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-teal-600 hover:text-teal-700 -ml-2"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Back to Guides
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowNotes(true)}
                className="relative"
              >
                <StickyNote className="h-4 w-4 mr-1" />
                Notes
                {notesCount > 0 && (
                  <Badge
                    variant="secondary"
                    className="ml-1 h-5 px-1.5 text-xs bg-teal-100 text-teal-700"
                  >
                    {notesCount}
                  </Badge>
                )}
              </Button>
            </div>
          </SheetHeader>

          {/* Resource Info */}
          <div className="px-4 py-3 border-b flex-shrink-0">
            <SheetTitle className="text-lg font-semibold line-clamp-1">
              {resource.title}
            </SheetTitle>
            <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
              <span className="capitalize">{resource.category}</span>
              <span>-</span>
              <div className="flex items-center gap-1">
                {getTypeIcon()}
                <span className="capitalize">{resource.type || 'PDF'}</span>
              </div>
              {resource.type === 'pdf' && totalPages > 0 && (
                <>
                  <span>-</span>
                  <span>
                    Page {currentPage} of {totalPages}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 overflow-hidden relative">
            {resource.type === 'pdf' && (
              <>
                {/* PDF Loading State */}
                {pdfLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-background">
                    <div className="flex flex-col items-center gap-3">
                      <Loader2 className="h-8 w-8 animate-spin text-teal-500" />
                      <p className="text-sm text-muted-foreground">Loading PDF...</p>
                    </div>
                  </div>
                )}

                {/* PDF Error State */}
                {pdfError && !pdfLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-background">
                    <div className="flex flex-col items-center gap-3 text-center px-4">
                      <FileText className="h-12 w-12 text-muted-foreground" />
                      <p className="text-sm text-destructive">{pdfError}</p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(resource.url, '_blank')}
                      >
                        Open in New Tab
                      </Button>
                    </div>
                  </div>
                )}

                {/* PDF Viewer */}
                {pdfUrl && !pdfLoading && !pdfError && (
                  <PDFViewer
                    url={pdfUrl}
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                    onTotalPagesChange={setTotalPages}
                    direction={direction}
                    onTextSelect={handleTextSelect}
                    scale={scale}
                  />
                )}
              </>
            )}

            {resource.type === 'video' && resource.url && (
              <VideoViewer url={resource.url} />
            )}

            {resource.type === 'audio' && resource.url && (
              <AudioViewer url={resource.url} title={resource.title} />
            )}

            {resource.type === 'link' && resource.url && (
              <LinkViewer url={resource.url} title={resource.title} />
            )}

            {/* Text Selection Popup */}
            <AnimatePresence>
              {selectionPosition && selectedText && (
                <TextSelectionPopup
                  position={selectionPosition}
                  selectedText={selectedText}
                  onAddNote={handleAddNoteFromSelection}
                  onDismiss={dismissSelection}
                />
              )}
            </AnimatePresence>
          </div>

          {/* PDF Page Navigation */}
          {resource.type === 'pdf' && totalPages > 1 && (
            <div className="px-4 py-3 border-t flex items-center justify-between flex-shrink-0">
              <Button
                variant="outline"
                size="icon"
                onClick={prevPage}
                disabled={currentPage <= 1}
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>

              {/* Page dots (show up to 5) */}
              <div className="flex items-center gap-1.5">
                {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
                  let pageNum = i + 1
                  if (totalPages > 5) {
                    if (currentPage <= 3) {
                      pageNum = i + 1
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i
                    } else {
                      pageNum = currentPage - 2 + i
                    }
                  }
                  return (
                    <button
                      key={i}
                      onClick={() => goToPage(pageNum)}
                      className={cn(
                        'w-2 h-2 rounded-full transition-all',
                        currentPage === pageNum
                          ? 'bg-teal-500 w-4'
                          : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400'
                      )}
                    />
                  )
                })}
              </div>

              <Button
                variant="outline"
                size="icon"
                onClick={nextPage}
                disabled={currentPage >= totalPages}
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
          )}

          {/* Zoom Controls for PDF */}
          {resource.type === 'pdf' && (
            <div className="absolute bottom-24 right-4 flex flex-col gap-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg border p-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setScale((s) => Math.min(s + 0.2, 2))}
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setScale((s) => Math.max(s - 0.2, 0.5))}
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
            </div>
          )}

          {/* Bottom Action Bar */}
          <div className="px-4 py-3 border-t flex items-center justify-around flex-shrink-0 bg-background">
            {onToggleLibrary && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  haptics.tap()
                  onToggleLibrary(resource.id)
                }}
                className={cn(
                  'flex-col h-auto py-2 px-4',
                  isInLibrary && 'text-teal-600'
                )}
              >
                {isInLibrary ? (
                  <Check className="h-5 w-5 mb-1" />
                ) : (
                  <Plus className="h-5 w-5 mb-1" />
                )}
                <span className="text-xs">
                  {isInLibrary ? 'In Library' : 'Add'}
                </span>
              </Button>
            )}

            {onToggleFavorite && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  haptics.tap()
                  onToggleFavorite(resource.id, resource.title)
                }}
                className={cn(
                  'flex-col h-auto py-2 px-4',
                  isFavorite && 'text-red-500'
                )}
              >
                <Heart
                  className={cn('h-5 w-5 mb-1', isFavorite && 'fill-current')}
                />
                <span className="text-xs">Favorite</span>
              </Button>
            )}

            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setHighlightedText(null)
                setShowAddNote(true)
              }}
              className="flex-col h-auto py-2 px-4"
            >
              <StickyNote className="h-5 w-5 mb-1" />
              <span className="text-xs">Add Note</span>
            </Button>

            {resource.type !== 'link' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDownload}
                className="flex-col h-auto py-2 px-4"
              >
                <Download className="h-5 w-5 mb-1" />
                <span className="text-xs">Download</span>
              </Button>
            )}

            {/* Full View button - PDFs only */}
            {resource.type === 'pdf' && pdfUrl && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  haptics.tap()
                  setIsFullView(true)
                }}
                className="flex-col h-auto py-2 px-4 text-teal-600"
              >
                <Maximize2 className="h-5 w-5 mb-1" />
                <span className="text-xs">Full View</span>
              </Button>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Notes Panel (Side Sheet) */}
      <Sheet open={showNotes} onOpenChange={setShowNotes}>
        <SheetContent side="right" className="w-full sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Notes for "{resource.title}"</SheetTitle>
          </SheetHeader>
          <ScrollArea className="h-[calc(100vh-8rem)] mt-4 pr-4">
            <NotesPanel
              notes={notes}
              onDeleteNote={handleDeleteNote}
              onJumpToPage={(page) => {
                goToPage(page)
                setShowNotes(false)
              }}
              onAddNote={() => {
                setHighlightedText(null)
                setShowAddNote(true)
              }}
              loading={notesLoading}
            />
          </ScrollArea>
        </SheetContent>
      </Sheet>

      {/* Add Note Dialog */}
      <AddNoteDialog
        isOpen={showAddNote}
        onClose={() => {
          setShowAddNote(false)
          setHighlightedText(null)
        }}
        onSave={handleSaveNote}
        resourceTitle={resource.title}
        pageNumber={resource.type === 'pdf' ? currentPage : null}
        highlightedText={highlightedText}
        isSaving={isSavingNote}
      />

      {/* Full Screen Reader Mode - Rendered via Portal to escape Sheet's DOM tree */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {isFullView && pdfUrl && resource.type === 'pdf' && (
            <FullScreenReader
              url={pdfUrl}
              currentPage={currentPage}
              totalPages={totalPages}
              direction={direction}
              scale={scale}
              onPageChange={setCurrentPage}
              onTotalPagesChange={setTotalPages}
              onScaleChange={setScale}
              onClose={() => setIsFullView(false)}
              onTextSelect={handleTextSelect}
              selectionPosition={selectionPosition}
              selectedText={selectedText}
              onAddNoteFromSelection={handleAddNoteFromSelection}
              onDismissSelection={dismissSelection}
            />
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  )
}

export default ResourceViewerModal
