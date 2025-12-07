// Firebase Messaging Service Worker
// This handles background push notifications

importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js')
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js')

// Initialize Firebase in the service worker
// Note: These values should match your firebase config
firebase.initializeApp({
  apiKey: 'AIzaSyC-BqH8mXpj1jHx4kVEQJLBbHlZDCPrXpk',
  authDomain: 'glrs-pir-system.firebaseapp.com',
  projectId: 'glrs-pir-system',
  storageBucket: 'glrs-pir-system.appspot.com',
  messagingSenderId: '1234567890',
  appId: '1:1234567890:web:abcdefghijklmnop',
})

const messaging = firebase.messaging()

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message:', payload)

  const notificationTitle = payload.notification?.title || 'GLRS Lighthouse'
  const notificationOptions = {
    body: payload.notification?.body || 'You have a new notification',
    icon: '/icons/pwa-192x192.png',
    badge: '/icons/pwa-192x192.png',
    tag: payload.data?.tag || 'default',
    data: payload.data,
    actions: [
      {
        action: 'open',
        title: 'Open App',
      },
      {
        action: 'dismiss',
        title: 'Dismiss',
      },
    ],
  }

  self.registration.showNotification(notificationTitle, notificationOptions)
})

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  console.log('[firebase-messaging-sw.js] Notification clicked:', event)

  event.notification.close()

  if (event.action === 'dismiss') {
    return
  }

  // Navigate to the app
  const urlToOpen = event.notification.data?.url || '/'

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // Check if there's already a window open
      for (const client of windowClients) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.focus()
          if (urlToOpen !== '/') {
            client.navigate(urlToOpen)
          }
          return
        }
      }

      // Open a new window if no existing window
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen)
      }
    })
  )
})
