/**
 * AlertCard Component
 * Phase 8E: Admin Crisis Dashboard
 *
 * Individual alert card with:
 * - Color-coded border by tier
 * - Source and tier badges
 * - PIR info with avatar
 * - Trigger keywords (highlighted)
 * - Context preview (truncated)
 * - AI-specific data display
 * - Notification status icons
 * - Quick action buttons
 */

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  AlertTriangle,
  AlertCircle,
  AlertOctagon,
  Bell,
  Check,
  ChevronRight,
  Mail,
  MessageSquare,
  Send,
  ShieldAlert,
  Smartphone,
  Zap,
  Bot,
  ClipboardCheck,
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { cn } from '@/lib/utils'
import type { CrisisAlert, AlertTier, AlertSource } from '../types'

interface AlertCardProps {
  alert: CrisisAlert
  onAcknowledge: () => void
  onRespond: () => void
  onEscalate: () => void
  onViewDetails: () => void
  isSelected?: boolean
}

// Tier styling
const tierStyles: Record<AlertTier, { border: string; badge: string; text: string; icon: React.ReactNode }> = {
  1: {
    border: 'border-l-4 border-l-red-500',
    badge: 'bg-red-100 text-red-700 hover:bg-red-200',
    text: 'text-red-600',
    icon: <AlertOctagon className="h-4 w-4" />,
  },
  2: {
    border: 'border-l-4 border-l-orange-500',
    badge: 'bg-orange-100 text-orange-700 hover:bg-orange-200',
    text: 'text-orange-600',
    icon: <AlertTriangle className="h-4 w-4" />,
  },
  3: {
    border: 'border-l-4 border-l-yellow-500',
    badge: 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200',
    text: 'text-yellow-600',
    icon: <AlertCircle className="h-4 w-4" />,
  },
  4: {
    border: 'border-l-4 border-l-blue-500',
    badge: 'bg-blue-100 text-blue-700 hover:bg-blue-200',
    text: 'text-blue-600',
    icon: <Bell className="h-4 w-4" />,
  },
}

// Source styling
const sourceStyles: Record<AlertSource, { badge: string; icon: React.ReactNode; label: string }> = {
  sos: {
    badge: 'bg-red-500 text-white',
    icon: <ShieldAlert className="h-3 w-3" />,
    label: 'SOS',
  },
  ai: {
    badge: 'bg-purple-500 text-white',
    icon: <Bot className="h-3 w-3" />,
    label: 'AI',
  },
  checkin: {
    badge: 'bg-teal-500 text-white',
    icon: <ClipboardCheck className="h-3 w-3" />,
    label: 'Check-in',
  },
}

// Status styling
const statusStyles = {
  unread: { badge: 'bg-red-100 text-red-700', label: 'Unread' },
  acknowledged: { badge: 'bg-yellow-100 text-yellow-700', label: 'Acknowledged' },
  responded: { badge: 'bg-blue-100 text-blue-700', label: 'Responded' },
  escalated: { badge: 'bg-orange-100 text-orange-700', label: 'Escalated' },
  resolved: { badge: 'bg-green-100 text-green-700', label: 'Resolved' },
}

// AI Feature labels
const aiFeatureLabels: Record<string, string> = {
  anchor: 'Anchor',
  daily_oracle: 'Daily Oracle',
  voice_companion: 'Voice Companion',
  story_mode: 'Story Mode',
  guided_checkin: 'Guided Check-in',
  prompt_cards: 'Prompt Cards',
}

// Tier labels
const tierLabels: Record<AlertTier, string> = {
  1: 'Critical',
  2: 'High',
  3: 'Moderate',
  4: 'Standard',
}

export function AlertCard({
  alert,
  onAcknowledge,
  onRespond,
  onEscalate,
  onViewDetails,
  isSelected = false,
}: AlertCardProps) {
  const tierStyle = tierStyles[alert.tier]
  const sourceStyle = sourceStyles[alert.source]
  const statusStyle = statusStyles[alert.status]

  // Get initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  // Format time ago
  const timeAgo = alert.createdAt?.toDate
    ? formatDistanceToNow(alert.createdAt.toDate(), { addSuffix: true })
    : 'Unknown time'

  // Truncate context
  const truncatedContext = alert.context.length > 150
    ? alert.context.slice(0, 150) + '...'
    : alert.context

  return (
    <Card
      className={cn(
        'transition-all duration-200 hover:shadow-md cursor-pointer',
        tierStyle.border,
        isSelected && 'ring-2 ring-primary'
      )}
      onClick={onViewDetails}
    >
      <CardContent className="p-4">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            {/* Tier indicator */}
            <div className={cn('flex items-center gap-1.5', tierStyle.text)}>
              {tierStyle.icon}
              <span className="font-semibold text-sm uppercase">
                {tierLabels[alert.tier]}
              </span>
            </div>

            {/* Source badge */}
            <Badge className={cn('gap-1', sourceStyle.badge)}>
              {sourceStyle.icon}
              {sourceStyle.label}
            </Badge>

            {/* Time ago */}
            <span className="text-xs text-gray-500">{timeAgo}</span>
          </div>

          {/* Status badge */}
          <Badge className={statusStyle.badge}>{statusStyle.label}</Badge>
        </div>

        {/* PIR and Coach info */}
        <div className="flex items-center justify-between gap-4 mb-3 pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-gray-100 text-gray-600 text-xs">
                {getInitials(alert.pirName)}
              </AvatarFallback>
            </Avatar>
            <div>
              <span className="font-medium text-sm">{alert.pirName}</span>
              {alert.coachName && (
                <span className="text-xs text-gray-500 ml-2">
                  Coach: {alert.coachName}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Trigger keywords */}
        {alert.triggerKeywords.length > 0 && (
          <div className="mb-3">
            <span className="text-xs text-gray-500 font-medium">Triggers: </span>
            {alert.triggerKeywords.slice(0, 5).map((keyword, index) => (
              <Badge
                key={index}
                variant="outline"
                className="mr-1 mb-1 text-xs border-red-200 text-red-600 bg-red-50"
              >
                "{keyword}"
              </Badge>
            ))}
            {alert.triggerKeywords.length > 5 && (
              <span className="text-xs text-gray-400">
                +{alert.triggerKeywords.length - 5} more
              </span>
            )}
          </div>
        )}

        {/* Context preview */}
        <div className="mb-3 p-2 bg-gray-50 rounded text-sm text-gray-700">
          <p className="line-clamp-2">{truncatedContext}</p>
        </div>

        {/* AI-specific info */}
        {alert.source === 'ai' && (
          <div className="flex items-center gap-4 mb-3 text-xs text-gray-500">
            {alert.aiFeature && (
              <span className="flex items-center gap-1">
                <Bot className="h-3 w-3" />
                {aiFeatureLabels[alert.aiFeature] || alert.aiFeature}
              </span>
            )}
            {alert.resourcesDisplayed && (
              <span className="flex items-center gap-1 text-green-600">
                <Check className="h-3 w-3" />
                Resources shown
              </span>
            )}
            {alert.llmBypassed && (
              <span className="flex items-center gap-1 text-amber-600">
                <Zap className="h-3 w-3" />
                LLM bypassed
              </span>
            )}
          </div>
        )}

        {/* Check-in specific info */}
        {alert.source === 'checkin' && alert.concerningScore && (
          <div className="flex items-center gap-4 mb-3 text-xs text-gray-500">
            <span>Check-in Type: {alert.checkinType || 'Unknown'}</span>
            <span>Score: {alert.concerningScore}/10</span>
          </div>
        )}

        {/* Notifications sent */}
        <div className="flex items-center gap-3 mb-4">
          <span className="text-xs text-gray-500">Notifications:</span>
          <TooltipProvider>
            <div className="flex items-center gap-2">
              <Tooltip>
                <TooltipTrigger>
                  <div
                    className={cn(
                      'p-1 rounded',
                      alert.notificationsSent.push
                        ? 'bg-green-100 text-green-600'
                        : 'bg-gray-100 text-gray-400'
                    )}
                  >
                    <Smartphone className="h-3 w-3" />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  Push {alert.notificationsSent.push ? 'sent' : 'not sent'}
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger>
                  <div
                    className={cn(
                      'p-1 rounded',
                      alert.notificationsSent.email
                        ? 'bg-green-100 text-green-600'
                        : 'bg-gray-100 text-gray-400'
                    )}
                  >
                    <Mail className="h-3 w-3" />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  Email {alert.notificationsSent.email ? 'sent' : 'not sent'}
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger>
                  <div
                    className={cn(
                      'p-1 rounded',
                      alert.notificationsSent.sms
                        ? 'bg-green-100 text-green-600'
                        : 'bg-gray-100 text-gray-400'
                    )}
                  >
                    <MessageSquare className="h-3 w-3" />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  SMS {alert.notificationsSent.sms ? 'sent' : 'not sent'}
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger>
                  <div
                    className={cn(
                      'p-1 rounded',
                      alert.notificationsSent.inApp
                        ? 'bg-green-100 text-green-600'
                        : 'bg-gray-100 text-gray-400'
                    )}
                  >
                    <Bell className="h-3 w-3" />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  In-App {alert.notificationsSent.inApp ? 'sent' : 'not sent'}
                </TooltipContent>
              </Tooltip>
            </div>
          </TooltipProvider>
        </div>

        {/* Action buttons */}
        <div className="flex items-center justify-end gap-2">
          {alert.status === 'unread' && (
            <Button
              size="sm"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation()
                onAcknowledge()
              }}
              className="gap-1"
            >
              <Check className="h-3 w-3" />
              ACK
            </Button>
          )}

          {(alert.status === 'unread' || alert.status === 'acknowledged') && (
            <Button
              size="sm"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation()
                onRespond()
              }}
              className="gap-1"
            >
              <Send className="h-3 w-3" />
              Respond
            </Button>
          )}

          {alert.status !== 'resolved' && alert.status !== 'escalated' && (
            <Button
              size="sm"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation()
                onEscalate()
              }}
              className="gap-1 text-orange-600 border-orange-200 hover:bg-orange-50"
            >
              <AlertTriangle className="h-3 w-3" />
              Escalate
            </Button>
          )}

          <Button
            size="sm"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation()
              onViewDetails()
            }}
            className="gap-1"
          >
            Details
            <ChevronRight className="h-3 w-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default AlertCard
