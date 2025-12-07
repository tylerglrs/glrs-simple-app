import { useEffect, useCallback, useState } from 'react'
import { X, Download, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

// ============================================================
// TYPES
// ============================================================

interface ImagePreviewModalProps {
  imageUrl?: string
  title?: string
  onClose: () => void
}

// ============================================================
// MAIN COMPONENT
// ============================================================

export function ImagePreviewModal({
  imageUrl,
  title,
  onClose,
}: ImagePreviewModalProps) {
  const [zoom, setZoom] = useState(1)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)

  // Handle escape key and keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      } else if (e.key === '+' || e.key === '=') {
        setZoom((z) => Math.min(z + 0.25, 3))
      } else if (e.key === '-') {
        setZoom((z) => Math.max(z - 0.25, 0.5))
      } else if (e.key === '0') {
        handleReset()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  // Zoom controls
  const handleZoomIn = useCallback(() => {
    setZoom((z) => Math.min(z + 0.25, 3))
  }, [])

  const handleZoomOut = useCallback(() => {
    setZoom((z) => Math.max(z - 0.25, 0.5))
  }, [])

  const handleReset = useCallback(() => {
    setZoom(1)
    setPosition({ x: 0, y: 0 })
  }, [])

  // Download handler
  const handleDownload = useCallback(async () => {
    if (!imageUrl) return
    try {
      const response = await fetch(imageUrl)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = title
        ? `${title.replace(/[^a-z0-9]/gi, '_')}-${Date.now()}.jpg`
        : `community-image-${Date.now()}.jpg`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    } catch (err) {
      console.error('[ImagePreviewModal] Download failed:', err)
    }
  }, [imageUrl, title])

  // Drag handlers for panning when zoomed
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (zoom > 1) {
        e.preventDefault()
        setIsDragging(true)
        setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y })
      }
    },
    [zoom, position]
  )

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (isDragging) {
        setPosition({
          x: e.clientX - dragStart.x,
          y: e.clientY - dragStart.y,
        })
      }
    },
    [isDragging, dragStart]
  )

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  // Touch handlers for mobile
  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (zoom > 1 && e.touches.length === 1) {
        const touch = e.touches[0]
        setIsDragging(true)
        setDragStart({
          x: touch.clientX - position.x,
          y: touch.clientY - position.y,
        })
      }
    },
    [zoom, position]
  )

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (isDragging && e.touches.length === 1) {
        const touch = e.touches[0]
        setPosition({
          x: touch.clientX - dragStart.x,
          y: touch.clientY - dragStart.y,
        })
      }
    },
    [isDragging, dragStart]
  )

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false)
  }, [])

  // Backdrop click handler
  const handleBackdropClick = useCallback(() => {
    if (!isDragging) {
      onClose()
    }
  }, [isDragging, onClose])

  // Image load handlers
  const handleImageLoad = useCallback(() => {
    setImageLoaded(true)
  }, [])

  const handleImageError = useCallback(() => {
    setImageError(true)
    setImageLoaded(true)
  }, [])

  if (!imageUrl) return null

  return (
    <div
      className="fixed inset-0 z-[10000] bg-black/95 flex flex-col"
      onClick={handleBackdropClick}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Top toolbar */}
      <div
        className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between z-10 bg-gradient-to-b from-black/60 to-transparent"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Left side - Zoom controls */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleZoomOut}
            disabled={zoom <= 0.5}
            className="text-white hover:bg-white/20 h-10 w-10"
            aria-label="Zoom out"
          >
            <ZoomOut className="h-5 w-5" />
          </Button>
          <button
            onClick={handleReset}
            className="text-white text-sm font-medium px-2 py-1 rounded hover:bg-white/20 min-w-[60px] transition-colors"
          >
            {Math.round(zoom * 100)}%
          </button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleZoomIn}
            disabled={zoom >= 3}
            className="text-white hover:bg-white/20 h-10 w-10"
            aria-label="Zoom in"
          >
            <ZoomIn className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleReset}
            className="text-white hover:bg-white/20 h-10 w-10"
            aria-label="Reset view"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>

        {/* Title (if provided) */}
        {title && (
          <div className="absolute left-1/2 -translate-x-1/2 text-white text-sm font-medium max-w-[200px] truncate">
            {title}
          </div>
        )}

        {/* Right side - Download and Close */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleDownload}
            className="text-white hover:bg-white/20 h-10 w-10"
            aria-label="Download image"
          >
            <Download className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-white hover:bg-white/20 h-10 w-10"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Image container */}
      <div
        className={cn(
          'flex-1 flex items-center justify-center overflow-hidden',
          zoom > 1 ? 'cursor-grab' : 'cursor-zoom-out',
          isDragging && 'cursor-grabbing'
        )}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onClick={(e) => {
          if (!isDragging && zoom === 1) {
            onClose()
          }
          e.stopPropagation()
        }}
      >
        {/* Loading indicator */}
        {!imageLoaded && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          </div>
        )}

        {/* Error state */}
        {imageError ? (
          <div className="text-center text-white/70 p-4">
            <p className="text-lg mb-2">Failed to load image</p>
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        ) : (
          <img
            src={imageUrl}
            alt={title || 'Full size preview'}
            className={cn(
              'max-w-[90vw] max-h-[85vh] object-contain rounded-lg select-none',
              'transition-[transform,opacity] duration-200',
              imageLoaded ? 'opacity-100' : 'opacity-0'
            )}
            style={{
              transform: `scale(${zoom}) translate(${position.x / zoom}px, ${position.y / zoom}px)`,
            }}
            draggable={false}
            onLoad={handleImageLoad}
            onError={handleImageError}
            onClick={(e) => e.stopPropagation()}
          />
        )}
      </div>

      {/* Keyboard hints */}
      <div
        className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/50 text-xs flex gap-4"
        onClick={(e) => e.stopPropagation()}
      >
        <span>ESC to close</span>
        <span>+/- to zoom</span>
        <span>0 to reset</span>
      </div>
    </div>
  )
}

export default ImagePreviewModal
