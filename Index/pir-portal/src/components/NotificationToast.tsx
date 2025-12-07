import { useState, useEffect, useCallback } from 'react'
import { Bell, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { usePushNotifications } from '@/hooks/usePushNotifications'
import type { NotificationPayload } from '@/lib/firebase-messaging'

// =============================================================================
// TYPES
// =============================================================================

interface ToastNotification extends NotificationPayload {
  id: string
  timestamp: number
}

// =============================================================================
// COMPONENT
// =============================================================================

export function NotificationToast() {
  const [notifications, setNotifications] = useState<ToastNotification[]>([])

  const handleNotification = useCallback((payload: NotificationPayload) => {
    const notification: ToastNotification = {
      ...payload,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
    }

    setNotifications((prev) => [...prev, notification])

    // Auto-dismiss after 5 seconds
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== notification.id))
    }, 5000)
  }, [])

  // Initialize push notifications with handler
  usePushNotifications(handleNotification)

  const dismissNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }

  if (notifications.length === 0) {
    return null
  }

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={cn(
            'rounded-lg border bg-white p-4 shadow-lg',
            'animate-in slide-in-from-right-4 duration-300'
          )}
        >
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
              <Bell className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-sm text-foreground">
                {notification.title}
              </h4>
              {notification.body && (
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                  {notification.body}
                </p>
              )}
            </div>
            <button
              onClick={() => dismissNotification(notification.id)}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}

// =============================================================================
// NOTIFICATION PERMISSION PROMPT COMPONENT
// =============================================================================

export function NotificationPermissionPrompt() {
  const { isSupported, permission, loading, requestPermission } = usePushNotifications()
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    // Check if previously dismissed
    const wasDismissed = localStorage.getItem('notification-prompt-dismissed')
    if (wasDismissed) {
      setDismissed(true)
    }
  }, [])

  const handleEnable = async () => {
    await requestPermission()
    setDismissed(true)
  }

  const handleDismiss = () => {
    setDismissed(true)
    localStorage.setItem('notification-prompt-dismissed', 'true')
  }

  // Don't show if not supported, already granted/denied, dismissed, or loading
  if (!isSupported || permission !== 'default' || dismissed || loading) {
    return null
  }

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 md:left-auto md:right-4 md:w-96">
      <div
        className={cn(
          'rounded-xl border bg-white p-4 shadow-lg',
          'animate-in slide-in-from-bottom-4 duration-300'
        )}
      >
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
            <Bell className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-foreground">Stay Updated</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Enable notifications to receive check-in reminders and messages from your coach.
            </p>
          </div>
        </div>
        <div className="flex gap-2 mt-4">
          <button
            onClick={handleEnable}
            className="flex-1 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 transition-colors"
          >
            Enable Notifications
          </button>
          <button
            onClick={handleDismiss}
            className="rounded-lg border px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Later
          </button>
        </div>
      </div>
    </div>
  )
}

export default NotificationToast
