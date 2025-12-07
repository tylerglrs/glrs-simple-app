/**
 * AlertTimeline Component
 * Phase 8E: Admin Crisis Dashboard
 *
 * Vertical timeline showing the response history:
 * - Action icons for each event type
 * - Timestamps
 * - User who took action
 * - Notes content
 * - Current status indicator
 */

import { format } from 'date-fns'
import {
  Check,
  MessageSquare,
  AlertTriangle,
  CheckCircle2,
  Phone,
  Clock,
  User,
  Bell,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ResponseLogEntry, AlertStatus } from '../types'
import { Timestamp } from 'firebase/firestore'

interface AlertTimelineProps {
  entries: ResponseLogEntry[]
  currentStatus: AlertStatus
  createdAt?: Timestamp
  loading?: boolean
}

// Action styling
const actionStyles: Record<
  string,
  { icon: React.ReactNode; color: string; bgColor: string; label: string }
> = {
  acknowledged: {
    icon: <Check className="h-4 w-4" />,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-100',
    label: 'Acknowledged',
  },
  note_added: {
    icon: <MessageSquare className="h-4 w-4" />,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    label: 'Note Added',
  },
  responded: {
    icon: <MessageSquare className="h-4 w-4" />,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    label: 'Responded',
  },
  escalated: {
    icon: <AlertTriangle className="h-4 w-4" />,
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
    label: 'Escalated',
  },
  resolved: {
    icon: <CheckCircle2 className="h-4 w-4" />,
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    label: 'Resolved',
  },
  contacted_pir: {
    icon: <Phone className="h-4 w-4" />,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
    label: 'Contacted PIR',
  },
}

// Status labels for pending indicator
const pendingStatusLabels: Record<AlertStatus, string> = {
  unread: 'Awaiting acknowledgment...',
  acknowledged: 'Awaiting response...',
  responded: 'Awaiting resolution...',
  escalated: 'Awaiting escalation response...',
  resolved: 'Resolved',
}

export function AlertTimeline({
  entries,
  currentStatus,
  createdAt,
  loading = false,
}: AlertTimelineProps) {
  // Sort entries by timestamp (oldest first)
  const sortedEntries = [...entries].sort((a, b) => {
    const aTime = a.timestamp?.toDate?.() || new Date(0)
    const bTime = b.timestamp?.toDate?.() || new Date(0)
    return aTime.getTime() - bTime.getTime()
  })

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex gap-3">
            <div className="h-8 w-8 rounded-full bg-gray-200" />
            <div className="flex-1">
              <div className="h-4 w-32 bg-gray-200 rounded mb-2" />
              <div className="h-3 w-24 bg-gray-100 rounded" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="relative">
      {/* Timeline line */}
      <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />

      <div className="space-y-4">
        {/* Alert created event */}
        {createdAt && (
          <TimelineItem
            icon={<Bell className="h-4 w-4" />}
            color="text-red-600"
            bgColor="bg-red-100"
            title="Alert Created"
            timestamp={createdAt.toDate()}
            isFirst
          />
        )}

        {/* Response log entries */}
        {sortedEntries.map((entry, index) => {
          const style = actionStyles[entry.action] || {
            icon: <Clock className="h-4 w-4" />,
            color: 'text-gray-600',
            bgColor: 'bg-gray-100',
            label: entry.action,
          }

          return (
            <TimelineItem
              key={index}
              icon={style.icon}
              color={style.color}
              bgColor={style.bgColor}
              title={style.label}
              subtitle={entry.userName}
              timestamp={entry.timestamp?.toDate?.()}
              note={entry.note}
            />
          )
        })}

        {/* Pending status indicator */}
        {currentStatus !== 'resolved' && (
          <TimelineItem
            icon={<Clock className="h-4 w-4" />}
            color="text-gray-400"
            bgColor="bg-gray-100"
            title={pendingStatusLabels[currentStatus]}
            isPending
            isLast
          />
        )}

        {/* Resolved indicator if resolved */}
        {currentStatus === 'resolved' && sortedEntries.length > 0 && (
          <div className="pl-10 text-sm text-green-600 font-medium">
            Case closed
          </div>
        )}
      </div>
    </div>
  )
}

interface TimelineItemProps {
  icon: React.ReactNode
  color: string
  bgColor: string
  title: string
  subtitle?: string
  timestamp?: Date
  note?: string
  isFirst?: boolean
  isLast?: boolean
  isPending?: boolean
}

function TimelineItem({
  icon,
  color,
  bgColor,
  title,
  subtitle,
  timestamp,
  note,
  isFirst: _isFirst = false,
  isLast = false,
  isPending = false,
}: TimelineItemProps) {
  return (
    <div className="relative flex gap-3">
      {/* Icon */}
      <div
        className={cn(
          'relative z-10 flex h-8 w-8 items-center justify-center rounded-full',
          bgColor,
          color,
          isPending && 'opacity-50'
        )}
      >
        {icon}
      </div>

      {/* Content */}
      <div className={cn('flex-1 pb-4', isLast && 'pb-0')}>
        <div className="flex items-baseline gap-2">
          <span
            className={cn(
              'font-medium text-sm',
              isPending ? 'text-gray-400' : 'text-gray-900'
            )}
          >
            {title}
          </span>
          {subtitle && (
            <span className="text-xs text-gray-500 flex items-center gap-1">
              <User className="h-3 w-3" />
              {subtitle}
            </span>
          )}
        </div>

        {timestamp && (
          <div className="text-xs text-gray-400 mt-0.5">
            {format(timestamp, 'MMM d, yyyy h:mm a')}
          </div>
        )}

        {note && (
          <div className="mt-2 p-2 bg-gray-50 rounded-lg text-sm text-gray-700">
            "{note}"
          </div>
        )}
      </div>
    </div>
  )
}

export default AlertTimeline
