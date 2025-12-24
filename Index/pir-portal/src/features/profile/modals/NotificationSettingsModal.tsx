/**
 * Notification Settings Modal
 *
 * Manages push notification preferences for the Recovery Compass app.
 * Includes permission request, notification types, and quiet hours.
 */

import { useState } from 'react'
import { ResponsiveModal } from '@/components/ui/responsive-modal'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Bell,
  BellOff,
  MessageSquare,
  Calendar,
  Award,
  ClipboardList,
  Users,
  Moon,
  Loader2,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react'
import { usePushNotifications, type NotificationPreferences } from '@/hooks/useNotifications'

// =============================================================================
// NOTIFICATION TYPE CONFIG
// =============================================================================

interface NotificationType {
  key: keyof NotificationPreferences
  label: string
  description: string
  icon: React.ReactNode
}

const NOTIFICATION_TYPES: NotificationType[] = [
  {
    key: 'messages',
    label: 'Messages',
    description: 'New messages from your coach',
    icon: <MessageSquare className="h-5 w-5 text-blue-500" />,
  },
  {
    key: 'checkinReminders',
    label: 'Check-in Reminders',
    description: 'Morning and evening check-in reminders',
    icon: <Calendar className="h-5 w-5 text-amber-500" />,
  },
  {
    key: 'milestones',
    label: 'Milestones',
    description: 'Sobriety milestone achievements',
    icon: <Award className="h-5 w-5 text-yellow-500" />,
  },
  {
    key: 'assignments',
    label: 'Assignments',
    description: 'New assignments from your coach',
    icon: <ClipboardList className="h-5 w-5 text-teal-500" />,
  },
  {
    key: 'community',
    label: 'Community',
    description: 'Activity in community discussions',
    icon: <Users className="h-5 w-5 text-purple-500" />,
  },
]

// =============================================================================
// COMPONENT
// =============================================================================

interface NotificationSettingsModalProps {
  onClose: () => void
}

export function NotificationSettingsModal({ onClose }: NotificationSettingsModalProps) {

  const {
    preferences,
    loading,
    permissionStatus,
    isSupported,
    isEnabled,
    enableNotifications,
    disableNotifications,
    updatePreferences,
  } = usePushNotifications()

  const [isEnabling, setIsEnabling] = useState(false)

  // Handle master toggle
  const handleMasterToggle = async (enabled: boolean) => {
    if (enabled) {
      setIsEnabling(true)
      await enableNotifications()
      setIsEnabling(false)
    } else {
      await disableNotifications()
    }
  }

  // Handle individual preference toggle
  const handlePreferenceToggle = async (key: keyof NotificationPreferences, enabled: boolean) => {
    await updatePreferences({ [key]: enabled })
  }

  // Handle quiet hours toggle
  const handleQuietHoursToggle = async (enabled: boolean) => {
    await updatePreferences({ quietHoursEnabled: enabled })
  }

  // Loading state
  if (loading) {
    return (
      <ResponsiveModal open={true} onOpenChange={(open) => !open && onClose()} desktopSize="md">
        <div className="flex flex-col h-full bg-white overflow-hidden">
          <div className="px-6 py-4 bg-gradient-to-r from-amber-500 to-amber-600 shrink-0">
            <h2 className="text-xl font-bold text-white flex items-center gap-3">
              <Bell className="h-6 w-6" />
              Notification Settings
            </h2>
          </div>
          <div className="p-6 space-y-4">
            <Skeleton className="h-20 w-full rounded-lg" />
            <Skeleton className="h-16 w-full rounded-lg" />
            <Skeleton className="h-16 w-full rounded-lg" />
            <Skeleton className="h-16 w-full rounded-lg" />
          </div>
        </div>
      </ResponsiveModal>
    )
  }

  return (
    <ResponsiveModal open={true} onOpenChange={(open) => !open && onClose()} desktopSize="md">
      <div className="flex flex-col h-full bg-white overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-amber-500 to-amber-600 shrink-0">
          <h2 className="text-xl font-bold text-white flex items-center gap-3">
            <Bell className="h-6 w-6" />
            Notification Settings
          </h2>
        </div>

        {/* Content */}
        <ScrollArea className="flex-1">
          <div className="p-6 space-y-6">
            {/* Not Supported Warning */}
            {!isSupported && (
              <Card className="bg-amber-50 border-amber-200">
                <CardContent className="pt-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-amber-800">Notifications Not Supported</h3>
                      <p className="text-sm text-amber-700 mt-1">
                        Your browser doesn't support push notifications. Try using a modern browser
                        or install the app as a PWA for notification support.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Permission Denied Warning */}
            {isSupported && permissionStatus === 'denied' && (
              <Card className="bg-red-50 border-red-200">
                <CardContent className="pt-4">
                  <div className="flex items-start gap-3">
                    <BellOff className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-red-800">Notifications Blocked</h3>
                      <p className="text-sm text-red-700 mt-1">
                        You've blocked notifications for this app. To enable them, you'll need to
                        update your browser or device settings.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Master Toggle */}
            {isSupported && permissionStatus !== 'denied' && (
              <Card className={isEnabled ? 'bg-green-50 border-green-200' : 'bg-slate-50'}>
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {isEnabled ? (
                        <CheckCircle2 className="h-6 w-6 text-green-600" />
                      ) : (
                        <BellOff className="h-6 w-6 text-slate-400" />
                      )}
                      <div>
                        <h3 className="font-semibold text-slate-900">
                          {isEnabled ? 'Notifications Enabled' : 'Enable Notifications'}
                        </h3>
                        <p className="text-sm text-slate-600">
                          {isEnabled
                            ? 'You will receive push notifications'
                            : 'Get notified about important updates'}
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={isEnabled}
                      onCheckedChange={handleMasterToggle}
                      disabled={isEnabling}
                      aria-label="Enable notifications"
                    />
                  </div>
                  {isEnabling && (
                    <div className="flex items-center gap-2 mt-3 text-sm text-amber-600">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Requesting permission...
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Notification Types */}
            {isEnabled && (
              <>
                <div>
                  <h3 className="text-base font-semibold text-slate-900 mb-3">Notification Types</h3>
                  <div className="space-y-2">
                    {NOTIFICATION_TYPES.map((type) => (
                      <Card key={type.key} className="overflow-hidden">
                        <CardContent className="py-3 px-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              {type.icon}
                              <div>
                                <Label
                                  htmlFor={type.key}
                                  className="text-sm font-medium cursor-pointer"
                                >
                                  {type.label}
                                </Label>
                                <p className="text-xs text-muted-foreground">{type.description}</p>
                              </div>
                            </div>
                            <Switch
                              id={type.key}
                              checked={preferences[type.key] as boolean}
                              onCheckedChange={(checked) => handlePreferenceToggle(type.key, checked)}
                              aria-label={`Toggle ${type.label} notifications`}
                            />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* Quiet Hours */}
                <div>
                  <h3 className="text-base font-semibold text-slate-900 mb-3">Quiet Hours</h3>
                  <Card className="overflow-hidden">
                    <CardContent className="py-3 px-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Moon className="h-5 w-5 text-indigo-500" />
                          <div>
                            <Label
                              htmlFor="quietHours"
                              className="text-sm font-medium cursor-pointer"
                            >
                              Enable Quiet Hours
                            </Label>
                            <p className="text-xs text-muted-foreground">
                              Silence notifications from {preferences.quietHoursStart} to{' '}
                              {preferences.quietHoursEnd}
                            </p>
                          </div>
                        </div>
                        <Switch
                          id="quietHours"
                          checked={preferences.quietHoursEnabled}
                          onCheckedChange={handleQuietHoursToggle}
                          aria-label="Toggle quiet hours"
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </>
            )}

            {/* Info Note */}
            <div className="text-center text-sm text-muted-foreground">
              <p>
                Notifications help you stay on track with your recovery journey.
                We respect your privacy and only send essential updates.
              </p>
            </div>
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="flex items-center justify-end px-6 py-4 border-t bg-muted/30 shrink-0">
          <Button onClick={onClose}>Done</Button>
        </div>
      </div>
    </ResponsiveModal>
  )
}

export default NotificationSettingsModal
