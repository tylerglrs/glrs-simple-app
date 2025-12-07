import { getMessaging, getToken, onMessage, type Messaging } from 'firebase/messaging'
import { app, db, auth } from './firebase'
import { doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore'

// =============================================================================
// FIREBASE CLOUD MESSAGING CONFIGURATION
// =============================================================================

let messaging: Messaging | null = null

// Initialize messaging only if supported
export const initializeMessaging = (): Messaging | null => {
  if (typeof window === 'undefined') return null

  // Check if notifications are supported
  if (!('Notification' in window)) {
    console.log('This browser does not support notifications')
    return null
  }

  // Check if service worker is supported
  if (!('serviceWorker' in navigator)) {
    console.log('Service Worker not supported')
    return null
  }

  try {
    messaging = getMessaging(app)
    return messaging
  } catch (error) {
    console.error('Error initializing Firebase Messaging:', error)
    return null
  }
}

// =============================================================================
// FCM TOKEN MANAGEMENT
// =============================================================================

export const requestNotificationPermission = async (): Promise<boolean> => {
  try {
    const permission = await Notification.requestPermission()
    return permission === 'granted'
  } catch (error) {
    console.error('Error requesting notification permission:', error)
    return false
  }
}

export const getFCMToken = async (): Promise<string | null> => {
  const msg = messaging || initializeMessaging()
  if (!msg) return null

  try {
    const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY
    if (!vapidKey) {
      console.warn('VAPID key not configured')
      return null
    }

    const token = await getToken(msg, { vapidKey })
    return token
  } catch (error) {
    console.error('Error getting FCM token:', error)
    return null
  }
}

export const saveFCMTokenToUser = async (token: string): Promise<void> => {
  const user = auth.currentUser
  if (!user) return

  try {
    await updateDoc(doc(db, 'users', user.uid), {
      fcmTokens: arrayUnion(token),
      lastTokenUpdate: new Date(),
    })
  } catch (error) {
    console.error('Error saving FCM token:', error)
  }
}

export const removeFCMTokenFromUser = async (token: string): Promise<void> => {
  const user = auth.currentUser
  if (!user) return

  try {
    await updateDoc(doc(db, 'users', user.uid), {
      fcmTokens: arrayRemove(token),
    })
  } catch (error) {
    console.error('Error removing FCM token:', error)
  }
}

// =============================================================================
// FOREGROUND MESSAGE HANDLER
// =============================================================================

export interface NotificationPayload {
  title: string
  body: string
  icon?: string
  data?: Record<string, string>
}

export type MessageHandler = (payload: NotificationPayload) => void

export const onForegroundMessage = (handler: MessageHandler): (() => void) => {
  const msg = messaging || initializeMessaging()
  if (!msg) return () => {}

  const unsubscribe = onMessage(msg, (payload) => {
    const notification: NotificationPayload = {
      title: payload.notification?.title || 'New Notification',
      body: payload.notification?.body || '',
      icon: payload.notification?.icon,
      data: payload.data,
    }
    handler(notification)
  })

  return unsubscribe
}

// =============================================================================
// EXPORTS
// =============================================================================

export { messaging }
