import { useState, useEffect, useMemo } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import {
  ExternalLink,
  FileText,
  Video,
  Headphones,
  FileSpreadsheet,
  Wrench,
  File,
  Clock,
  CheckCircle2,
  Circle,
  PlayCircle,
  StickyNote,
  Save,
} from 'lucide-react'
import type { ResourceWithProgress } from '../hooks/useResources'

interface ResourceViewerModalProps {
  isOpen: boolean
  onClose: () => void
  resource: ResourceWithProgress | null
  onProgressUpdate?: (resourceId: string, status: string) => void
  onNoteSave?: (resourceId: string, note: string) => void
}

// Type icon mapping
const typeIcons: Record<string, typeof FileText> = {
  article: FileText,
  video: Video,
  audio: Headphones,
  worksheet: FileSpreadsheet,
  tool: Wrench,
  pdf: File,
  link: ExternalLink,
}

// Extract video ID from YouTube or Vimeo URLs
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

// Check if URL is a PDF
function isPdfUrl(url: string): boolean {
  if (!url) return false
  return url.toLowerCase().endsWith('.pdf') || url.includes('/pdf/')
}

export function ResourceViewerModal({
  isOpen,
  onClose,
  resource,
  onProgressUpdate,
  onNoteSave,
}: ResourceViewerModalProps) {
  const [activeTab, setActiveTab] = useState<'content' | 'notes'>('content')
  const [note, setNote] = useState('')
  const [isSavingNote, setIsSavingNote] = useState(false)
  const [contentLoading, setContentLoading] = useState(true)

  // Reset state when resource changes
  useEffect(() => {
    if (resource) {
      setNote(resource.userNotes || '')
      setContentLoading(true)
      setActiveTab('content')
    }
  }, [resource?.id])

  const TypeIcon = resource ? typeIcons[resource.type] || FileText : FileText
  const progressStatus = resource?.userProgress?.status || 'not_started'
  const isCompleted = progressStatus === 'completed'
  const isInProgress = progressStatus === 'in_progress'

  // Determine content type
  const contentType = useMemo(() => {
    if (!resource) return 'unknown'
    if (resource.type === 'video' || getVideoEmbedUrl(resource.url || '')) return 'video'
    if (resource.type === 'pdf' || isPdfUrl(resource.url || '')) return 'pdf'
    if (resource.type === 'link' || resource.url?.startsWith('http')) return 'link'
    if (resource.content) return 'article'
    return 'unknown'
  }, [resource])

  const videoEmbedUrl = useMemo(() => {
    return resource?.url ? getVideoEmbedUrl(resource.url) : null
  }, [resource?.url])

  const handleSaveNote = async () => {
    if (!resource || !onNoteSave) return
    setIsSavingNote(true)
    try {
      await onNoteSave(resource.id, note)
    } finally {
      setIsSavingNote(false)
    }
  }

  const handleProgressChange = (newStatus: string) => {
    if (!resource || !onProgressUpdate) return
    onProgressUpdate(resource.id, newStatus)
  }

  const handleOpenExternal = () => {
    if (resource?.url) {
      window.open(resource.url, '_blank', 'noopener,noreferrer')
    }
  }

  if (!resource) return null

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-[95vw] sm:max-w-4xl h-[90vh] flex flex-col p-0 gap-0">
        {/* Header */}
        <DialogHeader className="px-4 py-3 border-b flex-shrink-0">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              {/* Type Badge */}
              <Badge variant="secondary" className="mb-2 text-xs">
                <TypeIcon className="h-3 w-3 mr-1" />
                {resource.type || 'Article'}
              </Badge>

              {/* Title */}
              <DialogTitle className="text-lg font-semibold line-clamp-2">
                {resource.title}
              </DialogTitle>

              {/* Meta info */}
              <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                {resource.duration && (
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {resource.duration} min
                  </span>
                )}
                {resource.category && (
                  <span className="capitalize">{resource.category}</span>
                )}
              </div>
            </div>
          </div>
        </DialogHeader>

        {/* Tab Navigation */}
        <div className="flex items-center border-b px-4 flex-shrink-0">
          <button
            onClick={() => setActiveTab('content')}
            className={cn(
              'px-4 py-2.5 text-sm font-medium border-b-2 transition-colors',
              activeTab === 'content'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            )}
          >
            Content
          </button>
          <button
            onClick={() => setActiveTab('notes')}
            className={cn(
              'px-4 py-2.5 text-sm font-medium border-b-2 transition-colors flex items-center gap-1.5',
              activeTab === 'notes'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            )}
          >
            <StickyNote className="h-4 w-4" />
            Notes
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden">
          {activeTab === 'content' ? (
            <div className="h-full overflow-y-auto">
              {/* Video Content */}
              {contentType === 'video' && videoEmbedUrl && (
                <div className="relative w-full aspect-video bg-black">
                  {contentLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-muted">
                      <Skeleton className="w-full h-full" />
                    </div>
                  )}
                  <iframe
                    src={videoEmbedUrl}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    onLoad={() => setContentLoading(false)}
                  />
                </div>
              )}

              {/* PDF Content */}
              {contentType === 'pdf' && resource.url && (
                <div className="h-full">
                  {contentLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-muted">
                      <Skeleton className="w-full h-full" />
                    </div>
                  )}
                  <iframe
                    src={`${resource.url}#toolbar=1&navpanes=0`}
                    className="w-full h-full border-0"
                    onLoad={() => setContentLoading(false)}
                  />
                </div>
              )}

              {/* Article/HTML Content */}
              {contentType === 'article' && resource.content && (
                <div className="p-4 md:p-6">
                  <div
                    className="prose prose-sm md:prose-base dark:prose-invert max-w-none"
                    dangerouslySetInnerHTML={{ __html: resource.content }}
                  />
                </div>
              )}

              {/* External Link */}
              {contentType === 'link' && (
                <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                  <ExternalLink className="h-16 w-16 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">External Resource</h3>
                  <p className="text-sm text-muted-foreground mb-6 max-w-md">
                    {resource.description || 'This resource opens in a new tab.'}
                  </p>
                  <Button onClick={handleOpenExternal} size="lg">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Open Resource
                  </Button>
                </div>
              )}

              {/* Unknown Content Type */}
              {contentType === 'unknown' && (
                <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                  <FileText className="h-16 w-16 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Content Unavailable</h3>
                  <p className="text-sm text-muted-foreground mb-6 max-w-md">
                    {resource.description || 'This resource content is not available for preview.'}
                  </p>
                  {resource.url && (
                    <Button onClick={handleOpenExternal} variant="outline">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Open External Link
                    </Button>
                  )}
                </div>
              )}

              {/* Description Section (below content for video/article) */}
              {(contentType === 'video' || contentType === 'article') && resource.description && (
                <div className="p-4 md:p-6 border-t">
                  <h3 className="font-medium mb-2">About this resource</h3>
                  <p className="text-sm text-muted-foreground">{resource.description}</p>
                </div>
              )}
            </div>
          ) : (
            /* Notes Tab */
            <div className="p-4 md:p-6 h-full flex flex-col">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium">Your Notes</h3>
                <Button
                  size="sm"
                  onClick={handleSaveNote}
                  disabled={isSavingNote || note === (resource.userNotes || '')}
                >
                  {isSavingNote ? (
                    'Saving...'
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-1" />
                      Save
                    </>
                  )}
                </Button>
              </div>
              <Textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Add your personal notes about this resource..."
                className="flex-1 min-h-[200px] resize-none"
              />
              <p className="text-xs text-muted-foreground mt-2">
                Your notes are private and saved to your account.
              </p>
            </div>
          )}
        </div>

        {/* Footer - Progress Actions */}
        <div className="px-4 py-3 border-t flex items-center justify-between gap-4 flex-shrink-0 bg-muted/30">
          {/* Progress Status */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Progress:</span>
            <div className="flex gap-1">
              <Button
                variant={progressStatus === 'not_started' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleProgressChange('not_started')}
                className="text-xs"
              >
                <Circle className="h-3 w-3 mr-1" />
                Not Started
              </Button>
              <Button
                variant={isInProgress ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleProgressChange('in_progress')}
                className="text-xs"
              >
                <PlayCircle className="h-3 w-3 mr-1" />
                In Progress
              </Button>
              <Button
                variant={isCompleted ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleProgressChange('completed')}
                className={cn(
                  'text-xs',
                  isCompleted && 'bg-green-600 hover:bg-green-700'
                )}
              >
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Completed
              </Button>
            </div>
          </div>

          {/* External Link Button */}
          {resource.url && (
            <Button variant="outline" size="sm" onClick={handleOpenExternal}>
              <ExternalLink className="h-4 w-4 mr-1" />
              Open
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default ResourceViewerModal
