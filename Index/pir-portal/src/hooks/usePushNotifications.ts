import { useState, useEffect, useCallback } from 'react'
import { auth, onAuthStateChanged, type User } from '@/lib/firebase'
import {
  initializeMessaging,
  requestNotificationPermission,
  getFCMToken,
  saveFCMTokenToUser,
  removeFCMTokenFromUser,
  onForegroundMessage,
  type NotificationPayload,
} from '@/lib/firebase-messaging'

// =============================================================================
// TYPES
// =============================================================================

export interface PushNotificationState {
  isSupported: boolean
  permission: NotificationPermission | 'default'
  token: string | null
  loading: boolean
  error: string | null
}

export interface UsePushNotificationsReturn extends PushNotificationState {
  requestPermission: () => Promise<boolean>
  unsubscribe: () => Promise<void>
}

// =============================================================================
// HOOK
// =============================================================================

export function usePushNotifications(
  onNotification?: (payload: NotificationPayload) => void
): UsePushNotificationsReturn {
  const [user, setUser] = useState<User | null>(null)
  const [state, setState] = useState<PushNotificationState>({
    isSupported: false,
    permission: 'default',
    loading: true,
    token: null,
    error: null,
  })

  // Check if notifications are supported and listen for auth changes
  useEffect(() => {
    const isSupported =
      typeof window !== 'undefined' &&
      'Notification' in window &&
      'serviceWorker' in navigator

    setState((prev) => ({
      ...prev,
      isSupported,
      permission: isSupported ? Notification.permission : 'default',
      loading: false,
    }))

    // Listen for auth state changes
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
    })

    return () => unsubscribe()
  }, [])

  // Initialize messaging when user logs in
  useEffect(() => {
    if (!user || !state.isSupported) return

    const initMessaging = async () => {
      try {
        initializeMessaging()

        // If permission already granted, get token
        if (Notification.permission === 'granted') {
          const token = await getFCMToken()
          if (token) {
            await saveFCMTokenToUser(token)
            setState((prev) => ({ ...prev, token, permission: 'granted' }))
          }
        }
      } catch (error) {
        console.error('Error initializing messaging:', error)
        setState((prev) => ({
          ...prev,
          error: 'Failed to initialize notifications',
        }))
      }
    }

    initMessaging()
  }, [user, state.isSupported])

  // Set up foreground message listener
  useEffect(() => {
    if (!state.token || !onNotification) return

    const unsubscribe = onForegroundMessage(onNotification)
    return () => unsubscribe()
  }, [state.token, onNotification])

  // Request permission and get token
  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!state.isSupported) return false

    setState((prev) => ({ ...prev, loading: true, error: null }))

    try {
      const granted = await requestNotificationPermission()

      if (granted) {
        const token = await getFCMToken()
        if (token && user) {
          await saveFCMTokenToUser(token)
          setState((prev) => ({
            ...prev,
            token,
            permission: 'granted',
            loading: false,
          }))
          return true
        }
      }

      setState((prev) => ({
        ...prev,
        permission: Notification.permission,
        loading: false,
      }))
      return false
    } catch (error) {
      console.error('Error requesting permission:', error)
      setState((prev) => ({
        ...prev,
        error: 'Failed to enable notifications',
        loading: false,
      }))
      return false
    }
  }, [state.isSupported, user])

  // Unsubscribe from notifications
  const unsubscribe = useCallback(async (): Promise<void> => {
    if (!state.token) return

    try {
      await removeFCMTokenFromUser(state.token)
      setState((prev) => ({ ...prev, token: null }))
    } catch (error) {
      console.error('Error unsubscribing:', error)
    }
  }, [state.token])

  return {
    ...state,
    requestPermission,
    unsubscribe,
  }
}

export default usePushNotifications
