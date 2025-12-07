import { useState, useEffect } from 'react'
import { doc, updateDoc, serverTimestamp, deleteField } from 'firebase/firestore'
import { db, functions } from '@/lib/firebase'
import { httpsCallable } from 'firebase/functions'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/hooks/use-toast'
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import {
  Calendar,
  CheckCircle,
  CalendarOff,
  Globe,
  Clock,
  RefreshCw,
  Settings,
  Info,
  ChevronDown,
  ChevronUp,
  Link,
  XCircle,
  Check,
  Loader2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useMediaQuery } from '@/hooks/useMediaQuery'

// =============================================================================
// TYPES
// =============================================================================

interface GoogleCalendarData {
  connected?: boolean
  connectedAt?: { seconds: number }
  email?: string
}

// =============================================================================
// OPTIONS
// =============================================================================

const TIMEZONE_OPTIONS = [
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
  { value: 'America/Denver', label: 'Mountain Time (MT)' },
  { value: 'America/Chicago', label: 'Central Time (CT)' },
  { value: 'America/New_York', label: 'Eastern Time (ET)' },
  { value: 'America/Phoenix', label: 'Arizona (MST - No DST)' },
  { value: 'America/Anchorage', label: 'Alaska Time (AKT)' },
  { value: 'Pacific/Honolulu', label: 'Hawaii Time (HST)' },
]

const DATE_FORMAT_OPTIONS = [
  { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY' },
  { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY' },
  { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD' },
]

const TIME_FORMAT_OPTIONS = [
  { value: '12h', label: '12-hour (AM/PM)' },
  { value: '24h', label: '24-hour (Military)' },
]

const AUTO_REFRESH_OPTIONS = [
  { value: '15', label: 'Every 15 minutes' },
  { value: '30', label: 'Every 30 minutes' },
  { value: '60', label: 'Every hour' },
  { value: '120', label: 'Every 2 hours' },
  { value: '240', label: 'Every 4 hours' },
]

// =============================================================================
// COMPONENT
// =============================================================================

interface GoogleCalendarModalProps {
  onClose: () => void
}

export function GoogleCalendarModal({ onClose }: GoogleCalendarModalProps) {
  const { user, userData } = useAuth()
  const { toast } = useToast()
  const isMobile = useMediaQuery('(max-width: 768px)')

  // Get extended user data
  const extendedUserData = userData as unknown as Record<string, unknown> | null
  const googleCalendar = extendedUserData?.googleCalendar as GoogleCalendarData | undefined

  // Connection state
  const isConnected = googleCalendar?.connected || false
  const connectedAt = googleCalendar?.connectedAt
  const connectedEmail = googleCalendar?.email

  // Settings form state
  const [formData, setFormData] = useState({
    timezone: (extendedUserData?.timezone as string) || 'America/Los_Angeles',
    dateFormat: (extendedUserData?.dateFormat as string) || 'MM/DD/YYYY',
    timeFormat: (extendedUserData?.timeFormat as string) || '12h',
    autoRefresh: String((extendedUserData?.autoRefresh as number) || 60),
    syncMeetings: (extendedUserData?.syncMeetings as boolean) !== false,
    syncAAMeetings: (extendedUserData?.syncAAMeetings as boolean) !== false,
    syncNAMeetings: (extendedUserData?.syncNAMeetings as boolean) !== false,
  })

  // UI state
  const [connecting, setConnecting] = useState(false)
  const [disconnecting, setDisconnecting] = useState(false)
  const [saving, setSaving] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [showSyncDetails, setShowSyncDetails] = useState(false)
  const [error, setError] = useState('')

  // Update formData when userData changes
  useEffect(() => {
    if (extendedUserData) {
      setFormData({
        timezone: (extendedUserData.timezone as string) || 'America/Los_Angeles',
        dateFormat: (extendedUserData.dateFormat as string) || 'MM/DD/YYYY',
        timeFormat: (extendedUserData.timeFormat as string) || '12h',
        autoRefresh: String((extendedUserData.autoRefresh as number) || 60),
        syncMeetings: (extendedUserData.syncMeetings as boolean) !== false,
        syncAAMeetings: (extendedUserData.syncAAMeetings as boolean) !== false,
        syncNAMeetings: (extendedUserData.syncNAMeetings as boolean) !== false,
      })
    }
  }, [extendedUserData])

  // OAuth connect handler
  const handleConnectCalendar = async () => {
    if (!user?.uid) {
      setError('Authentication error. Please refresh the page and try again.')
      return
    }

    setConnecting(true)
    setError('')

    try {
      const scopes = [
        'https://www.googleapis.com/auth/calendar',
        'https://www.googleapis.com/auth/calendar.events',
        'https://www.googleapis.com/auth/userinfo.email',
      ].join(' ')

      const redirectUri = window.location.origin + '/oauth-callback'
      const clientId = '830378577655-ms2vopfhcr5ld21hlv318ov8r22pq224.apps.googleusercontent.com'

      const authUrl =
        `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${clientId}&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `response_type=code&` +
        `scope=${encodeURIComponent(scopes)}&` +
        `access_type=offline&` +
        `prompt=consent&` +
        `state=${user.uid}`

      window.location.href = authUrl
    } catch (err) {
      console.error('[GoogleCalendarModal] Failed to initiate OAuth:', err)
      setError('Failed to connect to Google Calendar: ' + (err as Error).message)
      setConnecting(false)
    }
  }

  // Disconnect handler
  const handleDisconnectCalendar = async () => {
    if (!user?.uid) {
      setError('Authentication error. Please refresh the page and try again.')
      return
    }

    setDisconnecting(true)
    setError('')

    try {
      await updateDoc(doc(db, 'users', user.uid), {
        'googleCalendar.connected': false,
        'googleCalendar.disconnectedAt': serverTimestamp(),
        'googleCalendar.accessToken': deleteField(),
        'googleCalendar.refreshToken': deleteField(),
        'googleCalendar.expiresAt': deleteField(),
      })

      toast({
        title: 'Disconnected',
        description: 'Google Calendar disconnected successfully.',
      })
      onClose()
    } catch (err) {
      console.error('[GoogleCalendarModal] Failed to disconnect:', err)
      setError('Failed to disconnect: ' + (err as Error).message)
    } finally {
      setDisconnecting(false)
    }
  }

  // Save settings handler
  const handleSave = async () => {
    if (!user?.uid) {
      toast({
        title: 'Error',
        description: 'Authentication error. Please refresh the page.',
        variant: 'destructive',
      })
      return
    }

    setSaving(true)

    try {
      await updateDoc(doc(db, 'users', user.uid), {
        timezone: formData.timezone,
        dateFormat: formData.dateFormat,
        timeFormat: formData.timeFormat,
        autoRefresh: parseInt(formData.autoRefresh),
        syncMeetings: formData.syncMeetings,
        syncAAMeetings: formData.syncAAMeetings,
        syncNAMeetings: formData.syncNAMeetings,
        updatedAt: serverTimestamp(),
      })

      // Trigger calendar sync with new settings
      try {
        const syncSettings = httpsCallable(functions, 'syncCalendarSettings')
        await syncSettings({ userId: user.uid })
      } catch (syncError) {
        console.error('[GoogleCalendarModal] Calendar sync failed (non-fatal):', syncError)
      }

      toast({
        title: 'Success',
        description: 'Calendar settings updated successfully.',
      })
      onClose()
    } catch (err) {
      console.error('[GoogleCalendarModal] Error saving settings:', err)
      toast({
        title: 'Error',
        description: 'Failed to save changes. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  // Manual sync handler
  const handleManualSync = async () => {
    if (!user?.uid) return

    setSyncing(true)
    try {
      const syncMeetings = httpsCallable(functions, 'manualSyncMeetings')
      const result = await syncMeetings({ userId: user.uid })
      const data = result.data as { count?: number }
      toast({
        title: 'Sync Complete',
        description: `Synced ${data.count || 0} meetings to Google Calendar.`,
      })
    } catch (err) {
      console.error('[GoogleCalendarModal] Sync failed:', err)
      toast({
        title: 'Sync Failed',
        description: 'Failed to sync meetings. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setSyncing(false)
    }
  }

  // Get timezone display name
  const getTimezoneDisplay = () => {
    const tz = formData.timezone.split('/')[1]
    return tz ? tz.replace(/_/g, ' ') : formData.timezone
  }

  return (
    <DialogContent className="max-w-[95vw] sm:max-w-[600px] p-0 gap-0">
      {/* Header */}
      <DialogHeader className="px-6 py-4 bg-gradient-to-r from-blue-500 to-blue-600">
        <DialogTitle className="text-xl font-bold text-white flex items-center gap-3">
          <Calendar className="h-6 w-6" />
          Google Calendar Integration
        </DialogTitle>
      </DialogHeader>

      {/* Content */}
      <ScrollArea className="max-h-[calc(90vh-180px)]">
        <div className="p-6 space-y-5">
          {/* Error Message */}
          {error && (
            <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-3 text-destructive text-sm flex items-center gap-2">
              <XCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          {/* Connection Status Hero */}
          {isConnected ? (
            <Card className="bg-gradient-to-r from-emerald-500 to-emerald-600 border-0">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
                  <CheckCircle className="h-8 w-8 text-white" />
                </div>
                <div className="flex-1">
                  <div className="text-lg font-bold text-white">Calendar Connected</div>
                  <div className="text-sm text-white/90 font-medium">
                    {connectedEmail || 'Syncing to Google Calendar'}
                  </div>
                  {connectedAt && (
                    <div className="text-xs text-white/75 mt-1">
                      Connected{' '}
                      {new Date(connectedAt.seconds * 1000).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </div>
                  )}
                </div>
                <Badge variant="secondary" className="bg-white/20 text-white border-0">
                  Active
                </Badge>
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-gradient-to-r from-gray-500 to-gray-600 border-0">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
                  <CalendarOff className="h-8 w-8 text-white" />
                </div>
                <div className="flex-1">
                  <div className="text-lg font-bold text-white">Not Connected</div>
                  <div className="text-sm text-white/85">
                    Connect your Google Calendar to automatically sync GLRS meetings
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Settings Grid */}
          <div className={cn('grid gap-3', isMobile ? 'grid-cols-1' : 'grid-cols-2')}>
            {/* Timezone */}
            <Card>
              <CardContent className="pt-4">
                <label className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  <Globe className="h-4 w-4" />
                  Timezone
                </label>
                <Select
                  value={formData.timezone}
                  onValueChange={(value) => setFormData({ ...formData, timezone: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TIMEZONE_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {/* Date Format */}
            <Card>
              <CardContent className="pt-4">
                <label className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  <Calendar className="h-4 w-4" />
                  Date Format
                </label>
                <Select
                  value={formData.dateFormat}
                  onValueChange={(value) => setFormData({ ...formData, dateFormat: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DATE_FORMAT_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {/* Time Format */}
            <Card>
              <CardContent className="pt-4">
                <label className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  <Clock className="h-4 w-4" />
                  Time Format
                </label>
                <Select
                  value={formData.timeFormat}
                  onValueChange={(value) => setFormData({ ...formData, timeFormat: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TIME_FORMAT_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {/* Auto-Refresh */}
            <Card>
              <CardContent className="pt-4">
                <label className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  <RefreshCw className="h-4 w-4" />
                  Auto-Refresh
                </label>
                <Select
                  value={formData.autoRefresh}
                  onValueChange={(value) => setFormData({ ...formData, autoRefresh: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {AUTO_REFRESH_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>
          </div>

          {/* Sync Preferences (only when connected) */}
          {isConnected && (
            <Card>
              <CardContent className="pt-4">
                <h3 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Settings className="h-5 w-5 text-blue-500" />
                  Sync Preferences
                </h3>

                <div className="space-y-4">
                  {/* GLRS Meetings */}
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium">GLRS Meetings</div>
                      <div className="text-xs text-muted-foreground">
                        Coaching sessions and support meetings
                      </div>
                    </div>
                    <Switch
                      checked={formData.syncMeetings}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, syncMeetings: checked })
                      }
                    />
                  </div>

                  {/* AA Meetings */}
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium">AA Meetings</div>
                      <div className="text-xs text-muted-foreground">
                        Alcoholics Anonymous meetings you&apos;ve saved
                      </div>
                    </div>
                    <Switch
                      checked={formData.syncAAMeetings}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, syncAAMeetings: checked })
                      }
                    />
                  </div>

                  {/* NA Meetings */}
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium">NA Meetings</div>
                      <div className="text-xs text-muted-foreground">
                        Narcotics Anonymous meetings you&apos;ve saved
                      </div>
                    </div>
                    <Switch
                      checked={formData.syncNAMeetings}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, syncNAMeetings: checked })
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* What Gets Synced - Collapsible */}
          <Collapsible open={showSyncDetails} onOpenChange={setShowSyncDetails}>
            <Card className="cursor-pointer" onClick={() => setShowSyncDetails(!showSyncDetails)}>
              <CardContent className="pt-4">
                <CollapsibleTrigger asChild>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Info className="h-5 w-5 text-blue-500" />
                      <div>
                        <div className="text-base font-semibold">What Gets Synced</div>
                        {!showSyncDetails && (
                          <div className="text-xs text-muted-foreground">View sync details</div>
                        )}
                      </div>
                    </div>
                    {showSyncDetails ? (
                      <ChevronUp className="h-5 w-5 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <div className="mt-4 pt-4 border-t space-y-4">
                    {/* GLRS Meetings */}
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                      <div>
                        <div className="text-sm font-semibold">GLRS Meetings</div>
                        <div className="text-xs text-muted-foreground leading-relaxed">
                          Coaching sessions, check-ins, and support meetings with 30-minute and
                          60-minute advance reminders
                        </div>
                      </div>
                    </div>

                    {/* External Meetings */}
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                      <div>
                        <div className="text-sm font-semibold">External Meetings (AA/NA)</div>
                        <div className="text-xs text-muted-foreground leading-relaxed">
                          AA and NA meetings you&apos;ve saved to your schedule with location and
                          meeting details
                        </div>
                      </div>
                    </div>

                    {/* Automatic Updates */}
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                      <div>
                        <div className="text-sm font-semibold">Automatic Updates</div>
                        <div className="text-xs text-muted-foreground leading-relaxed">
                          Events automatically update when meetings are rescheduled or canceled. All
                          events use your selected timezone ({getTimezoneDisplay()})
                        </div>
                      </div>
                    </div>
                  </div>
                </CollapsibleContent>
              </CardContent>
            </Card>
          </Collapsible>

          {/* Manual Sync Section (only when connected) */}
          {isConnected && (
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 mb-3">
                  <RefreshCw className="h-5 w-5 text-blue-500" />
                  <h4 className="text-base font-semibold">Manual Sync</h4>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Manually sync all your meetings to Google Calendar right now
                </p>
                <Button
                  onClick={handleManualSync}
                  disabled={syncing}
                  className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                >
                  {syncing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Syncing...
                    </>
                  ) : (
                    <>
                      <Calendar className="mr-2 h-4 w-4" />
                      Sync All Meetings
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="flex items-center justify-end gap-3 px-6 py-4 border-t bg-muted/30">
        <Button type="button" variant="outline" onClick={onClose} disabled={saving || connecting}>
          Cancel
        </Button>

        {isConnected ? (
          <>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  className="text-destructive border-destructive hover:bg-destructive/10"
                  disabled={disconnecting}
                >
                  {disconnecting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Disconnecting...
                    </>
                  ) : (
                    <>
                      <XCircle className="mr-2 h-4 w-4" />
                      Disconnect
                    </>
                  )}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Disconnect Google Calendar?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Your calendar events will no longer sync. You can reconnect at any time.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDisconnectCalendar}
                    className="bg-destructive hover:bg-destructive/90"
                  >
                    Disconnect
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700"
            >
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </>
        ) : (
          <Button
            onClick={handleConnectCalendar}
            disabled={connecting}
            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
          >
            {connecting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                <Link className="mr-2 h-4 w-4" />
                Connect Google Calendar
              </>
            )}
          </Button>
        )}
      </div>
    </DialogContent>
  )
}

export default GoogleCalendarModal
