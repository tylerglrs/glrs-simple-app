/**
 * AlertDetail Component
 * Phase 8E: Admin Crisis Dashboard
 *
 * Side panel (Sheet) showing full alert details:
 * - PIR profile link
 * - Complete context
 * - AI response display
 * - Notification delivery status with timestamps
 * - Response timeline
 * - Add note textarea
 * - Action buttons
 */

import { useState } from 'react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  AlertTriangle,
  AlertCircle,
  AlertOctagon,
  Bell,
  Check,
  CheckCircle2,
  ExternalLink,
  Mail,
  MessageSquare,
  Send,
  Smartphone,
  Loader2,
} from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { AlertTimeline } from './AlertTimeline'
import { AIContextDisplay } from './AIContextDisplay'
import type { CrisisAlert, AlertAction, AlertTier, AlertStatus } from '../types'

interface AlertDetailProps {
  alert: CrisisAlert | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onAction: (action: AlertAction, note?: string) => Promise<void>
}

// Tier styling
const tierStyles: Record<AlertTier, { badge: string; text: string; label: string }> = {
  1: { badge: 'bg-red-100 text-red-700', text: 'text-red-600', label: 'Critical' },
  2: { badge: 'bg-orange-100 text-orange-700', text: 'text-orange-600', label: 'High' },
  3: { badge: 'bg-yellow-100 text-yellow-700', text: 'text-yellow-600', label: 'Moderate' },
  4: { badge: 'bg-blue-100 text-blue-700', text: 'text-blue-600', label: 'Standard' },
}

// Status styling
const statusStyles: Record<AlertStatus, { badge: string; label: string }> = {
  unread: { badge: 'bg-red-100 text-red-700', label: 'Unread' },
  acknowledged: { badge: 'bg-yellow-100 text-yellow-700', label: 'Acknowledged' },
  responded: { badge: 'bg-blue-100 text-blue-700', label: 'Responded' },
  escalated: { badge: 'bg-orange-100 text-orange-700', label: 'Escalated' },
  resolved: { badge: 'bg-green-100 text-green-700', label: 'Resolved' },
}

export function AlertDetail({
  alert,
  open,
  onOpenChange,
  onAction,
}: AlertDetailProps) {
  const [note, setNote] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showEscalateDialog, setShowEscalateDialog] = useState(false)
  const [escalateTo, setEscalateTo] = useState('')
  const [showResolveDialog, setShowResolveDialog] = useState(false)

  if (!alert) return null

  const tierStyle = tierStyles[alert.tier]
  const statusStyle = statusStyles[alert.status]

  const handleAcknowledge = async () => {
    setIsSubmitting(true)
    try {
      await onAction('acknowledge')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleAddNote = async () => {
    if (!note.trim()) return
    setIsSubmitting(true)
    try {
      await onAction('add_note', note)
      setNote('')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEscalate = async () => {
    if (!escalateTo) return
    setIsSubmitting(true)
    try {
      await onAction('escalate', `Escalated to ${escalateTo}`)
      setShowEscalateDialog(false)
      setEscalateTo('')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleResolve = async () => {
    setIsSubmitting(true)
    try {
      await onAction('resolve', note || 'Alert resolved')
      setShowResolveDialog(false)
      setNote('')
    } finally {
      setIsSubmitting(false)
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-full sm:max-w-lg overflow-hidden flex flex-col">
          <SheetHeader className="space-y-1 flex-shrink-0">
            <div className="flex items-center justify-between">
              <SheetTitle className="flex items-center gap-2">
                <span className={tierStyle.text}>
                  {alert.tier === 1 && <AlertOctagon className="h-5 w-5" />}
                  {alert.tier === 2 && <AlertTriangle className="h-5 w-5" />}
                  {alert.tier === 3 && <AlertCircle className="h-5 w-5" />}
                  {alert.tier === 4 && <Bell className="h-5 w-5" />}
                </span>
                Alert Details
              </SheetTitle>
              <Badge className={statusStyle.badge}>{statusStyle.label}</Badge>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={tierStyle.badge}>{tierStyle.label}</Badge>
              <span className="text-sm text-gray-500">
                {alert.createdAt?.toDate
                  ? format(alert.createdAt.toDate(), 'MMM d, yyyy h:mm a')
                  : 'Unknown time'}
              </span>
            </div>
          </SheetHeader>

          <ScrollArea className="flex-1 -mx-6 px-6">
            <div className="space-y-6 pb-6">
              {/* PIR Information */}
              <section>
                <h3 className="text-sm font-medium text-gray-500 mb-3">
                  PIR Information
                </h3>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-teal-100 text-teal-700">
                      {getInitials(alert.pirName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="font-medium">{alert.pirName}</div>
                    {alert.coachName && (
                      <div className="text-sm text-gray-500">
                        Coach: {alert.coachName}
                      </div>
                    )}
                  </div>
                  <Button variant="outline" size="sm" className="gap-1">
                    <ExternalLink className="h-3 w-3" />
                    View Profile
                  </Button>
                </div>
              </section>

              <Separator />

              {/* AI Context / Trigger Details */}
              <section>
                <h3 className="text-sm font-medium text-gray-500 mb-3">
                  Trigger Details
                </h3>
                <AIContextDisplay alert={alert} />
              </section>

              <Separator />

              {/* Notifications Sent */}
              <section>
                <h3 className="text-sm font-medium text-gray-500 mb-3">
                  Notifications Sent
                </h3>
                <div className="space-y-2">
                  <NotificationStatus
                    type="Push"
                    icon={<Smartphone className="h-4 w-4" />}
                    sent={alert.notificationsSent.push}
                    sentAt={alert.notificationsSent.pushSentAt?.toDate()}
                  />
                  <NotificationStatus
                    type="Email"
                    icon={<Mail className="h-4 w-4" />}
                    sent={alert.notificationsSent.email}
                    sentAt={alert.notificationsSent.emailSentAt?.toDate()}
                  />
                  <NotificationStatus
                    type="SMS"
                    icon={<MessageSquare className="h-4 w-4" />}
                    sent={alert.notificationsSent.sms}
                    sentAt={alert.notificationsSent.smsSentAt?.toDate()}
                  />
                  <NotificationStatus
                    type="In-App"
                    icon={<Bell className="h-4 w-4" />}
                    sent={alert.notificationsSent.inApp}
                    sentAt={alert.notificationsSent.inAppSentAt?.toDate()}
                  />
                </div>
              </section>

              <Separator />

              {/* Response Timeline */}
              <section>
                <h3 className="text-sm font-medium text-gray-500 mb-3">
                  Response Timeline
                </h3>
                <AlertTimeline
                  entries={alert.responseLog}
                  currentStatus={alert.status}
                  createdAt={alert.createdAt}
                />
              </section>

              <Separator />

              {/* Add Response Note */}
              {alert.status !== 'resolved' && (
                <section>
                  <h3 className="text-sm font-medium text-gray-500 mb-3">
                    Add Response Note
                  </h3>
                  <div className="space-y-3">
                    <Textarea
                      placeholder="Document your response actions, observations, or follow-up notes..."
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      rows={3}
                      className="resize-none"
                    />
                    <Button
                      onClick={handleAddNote}
                      disabled={!note.trim() || isSubmitting}
                      className="w-full gap-2"
                    >
                      {isSubmitting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                      Add Note
                    </Button>
                  </div>
                </section>
              )}
            </div>
          </ScrollArea>

          {/* Action Buttons */}
          {alert.status !== 'resolved' && (
            <div className="flex-shrink-0 pt-4 border-t space-y-3">
              <div className="grid grid-cols-2 gap-2">
                {alert.status === 'unread' && (
                  <Button
                    variant="outline"
                    onClick={handleAcknowledge}
                    disabled={isSubmitting}
                    className="gap-2"
                  >
                    {isSubmitting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Check className="h-4 w-4" />
                    )}
                    Acknowledge
                  </Button>
                )}

                {alert.status !== 'escalated' && (
                  <Button
                    variant="outline"
                    onClick={() => setShowEscalateDialog(true)}
                    disabled={isSubmitting}
                    className="gap-2 text-orange-600 border-orange-200 hover:bg-orange-50"
                  >
                    <AlertTriangle className="h-4 w-4" />
                    Escalate
                  </Button>
                )}

                <Button
                  onClick={() => setShowResolveDialog(true)}
                  disabled={isSubmitting}
                  className={cn(
                    'gap-2',
                    alert.status === 'unread' ? 'col-span-1' : 'col-span-2'
                  )}
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Mark Resolved
                </Button>
              </div>

              <p className="text-xs text-gray-400 text-center">
                These resources are available 24/7. You matter, and help is always
                available.
              </p>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Escalate Dialog */}
      <AlertDialog open={showEscalateDialog} onOpenChange={setShowEscalateDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Escalate Alert</AlertDialogTitle>
            <AlertDialogDescription>
              This will escalate the alert to a supervisor or manager for
              immediate attention.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Label htmlFor="escalate-to">Escalate To</Label>
            <Select value={escalateTo} onValueChange={setEscalateTo}>
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Select supervisor..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="supervisor">On-Call Supervisor</SelectItem>
                <SelectItem value="manager">Program Manager</SelectItem>
                <SelectItem value="clinical">Clinical Director</SelectItem>
                <SelectItem value="emergency">Emergency Services</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleEscalate}
              disabled={!escalateTo || isSubmitting}
              className="bg-orange-600 hover:bg-orange-700"
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Escalate
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Resolve Dialog */}
      <AlertDialog open={showResolveDialog} onOpenChange={setShowResolveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Resolve Alert</AlertDialogTitle>
            <AlertDialogDescription>
              Confirm that this crisis alert has been fully addressed and the PIR
              is safe.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Label htmlFor="resolve-note">Resolution Note (Optional)</Label>
            <Textarea
              id="resolve-note"
              placeholder="Add a final note about the resolution..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="mt-2"
              rows={3}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleResolve}
              disabled={isSubmitting}
              className="bg-green-600 hover:bg-green-700"
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Mark Resolved
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

interface NotificationStatusProps {
  type: string
  icon: React.ReactNode
  sent: boolean
  sentAt?: Date
}

function NotificationStatus({ type, icon, sent, sentAt }: NotificationStatusProps) {
  return (
    <div className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
      <div className="flex items-center gap-2">
        <div
          className={cn(
            'p-1.5 rounded',
            sent ? 'bg-green-100 text-green-600' : 'bg-gray-200 text-gray-400'
          )}
        >
          {icon}
        </div>
        <span className="text-sm font-medium">{type}</span>
      </div>
      <div className="text-sm">
        {sent ? (
          <span className="text-green-600 flex items-center gap-1">
            <Check className="h-3 w-3" />
            {sentAt ? format(sentAt, 'h:mm a') : 'Sent'}
          </span>
        ) : (
          <span className="text-gray-400">Not sent</span>
        )}
      </div>
    </div>
  )
}

export default AlertDetail
