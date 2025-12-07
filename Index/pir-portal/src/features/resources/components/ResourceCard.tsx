import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import {
  FileText,
  Video,
  Headphones,
  FileSpreadsheet,
  Wrench,
  File,
  ExternalLink,
  Clock,
  CheckCircle2,
  PlayCircle,
  Sparkles,
} from 'lucide-react'
import type { ResourceWithProgress } from '../hooks/useResources'

interface ResourceCardProps {
  resource: ResourceWithProgress
  onClick?: (resource: ResourceWithProgress) => void
  className?: string
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

// Type color mapping
const typeColors: Record<string, string> = {
  article: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  video: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  audio: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400',
  worksheet: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  tool: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  pdf: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  link: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
}

export function ResourceCard({ resource, onClick, className }: ResourceCardProps) {
  const TypeIcon = typeIcons[resource.type] || FileText
  const typeColor = typeColors[resource.type] || typeColors.article

  const progressStatus = resource.userProgress?.status || 'not_started'
  const progressPercent = resource.userProgress?.progress || 0
  const isCompleted = progressStatus === 'completed'
  const isInProgress = progressStatus === 'in_progress'

  return (
    <Card
      className={cn(
        'group cursor-pointer transition-all duration-200 hover:shadow-md hover:border-primary/50',
        isCompleted && 'bg-green-50/50 dark:bg-green-900/10 border-green-200/50',
        className
      )}
      onClick={() => onClick?.(resource)}
    >
      <CardContent className="p-4">
        {/* Header: Type Badge + Status */}
        <div className="flex items-center justify-between gap-2 mb-3">
          {/* Type Badge */}
          <Badge variant="secondary" className={cn('text-xs font-medium', typeColor)}>
            <TypeIcon className="h-3 w-3 mr-1" />
            {resource.type || 'Article'}
          </Badge>

          {/* Status Badges */}
          <div className="flex items-center gap-1.5">
            {resource.isNew && (
              <Badge variant="default" className="bg-amber-500 text-white text-xs">
                <Sparkles className="h-3 w-3 mr-1" />
                NEW
              </Badge>
            )}
            {resource.isAssigned && (
              <Badge
                variant="outline"
                className={cn(
                  'text-xs',
                  isCompleted
                    ? 'border-green-500 text-green-600'
                    : 'border-amber-500 text-amber-600'
                )}
              >
                {isCompleted ? (
                  <>
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Done
                  </>
                ) : (
                  'Assigned'
                )}
              </Badge>
            )}
          </div>
        </div>

        {/* Thumbnail (if available) */}
        {resource.thumbnailUrl && (
          <div className="relative mb-3 rounded-lg overflow-hidden aspect-video bg-muted">
            <img
              src={resource.thumbnailUrl}
              alt={resource.title}
              className="w-full h-full object-cover"
            />
            {resource.type === 'video' && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                <PlayCircle className="h-12 w-12 text-white/90" />
              </div>
            )}
          </div>
        )}

        {/* Title */}
        <h3 className="font-semibold text-foreground line-clamp-2 mb-2 group-hover:text-primary transition-colors">
          {resource.title}
        </h3>

        {/* Description */}
        {resource.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
            {resource.description}
          </p>
        )}

        {/* Progress Bar (if in progress) */}
        {isInProgress && progressPercent > 0 && progressPercent < 100 && (
          <div className="mb-3">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
              <span>Progress</span>
              <span className="font-medium text-primary">{progressPercent}%</span>
            </div>
            <Progress value={progressPercent} className="h-1.5" />
          </div>
        )}

        {/* Footer: Duration/Category */}
        <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
          <span className="truncate">{resource.category}</span>
          {resource.duration && (
            <span className="flex items-center gap-1 flex-shrink-0">
              <Clock className="h-3 w-3" />
              {resource.duration} min
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default ResourceCard
