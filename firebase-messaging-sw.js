/**
 * PHASE 6: Firebase Cloud Messaging Service Worker
 * Handles background push notifications for PWA web app
 * Implements notification click handling and navigation
 */

// Import Firebase scripts for service worker
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// Initialize Firebase in service worker
firebase.initializeApp({
    apiKey: "AIzaSyBUinN5WbAtRwGSQIyKPVCRQ4LlBf6MObU",
    authDomain: "glrs-pir-system.firebaseapp.com",
    projectId: "glrs-pir-system",
    storageBucket: "glrs-pir-system.firebasestorage.app",
    messagingSenderId: "783629667894",
    appId: "1:783629667894:web:e4f6ed5b1b5e7e9e5f7a8d",
    measurementId: "G-XXXXXXXXXX"
});

const messaging = firebase.messaging();

/**
 * Handle background messages (when app is not focused)
 */
messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Received background message:', payload);

    const notificationTitle = payload.notification?.title || 'GLRS Lighthouse';
    const notificationOptions = {
        body: payload.notification?.body || 'You have a new notification',
        icon: payload.notification?.icon || '/assets/glrs-logo.png',
        badge: payload.notification?.badge || '/assets/badge.png',
        tag: payload.data?.category || 'general',
        data: {
            url: payload.data?.actionUrl || '/notifications',
            notificationId: payload.data?.notificationId,
            type: payload.data?.type,
            category: payload.data?.category,
            userId: payload.data?.userId
        },
        requireInteraction: payload.data?.priority === 'critical',
        vibrate: [200, 100, 200],
        actions: getNotificationActions(payload.data?.type)
    };

    // Show notification
    return self.registration.showNotification(notificationTitle, notificationOptions);
});

/**
 * Handle notification click
 */
self.addEventListener('notificationclick', (event) => {
    console.log('[firebase-messaging-sw.js] Notification click:', event);

    event.notification.close();

    const action = event.action;
    const data = event.notification.data;

    // Handle notification actions
    if (action === 'mark_read') {
        // Mark notification as read via API
        event.waitUntil(
            markNotificationAsRead(data.notificationId, data.userId)
        );
        return;
    }

    if (action === 'reply' && data.type === 'new_message') {
        // Open reply UI
        event.waitUntil(
            clients.openWindow(`/messages?reply=${data.notificationId}`)
        );
        return;
    }

    if (action === 'snooze' && data.type === 'morning_checkin') {
        // Snooze check-in reminder for 30 minutes
        event.waitUntil(
            snoozeNotification(data.notificationId, data.userId, 30)
        );
        return;
    }

    // Default action: navigate to notification URL
    const urlToOpen = data.url || '/notifications';

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
            // Check if there's already a window open
            for (const client of clientList) {
                if (client.url.includes(self.location.origin) && 'focus' in client) {
                    // Navigate existing window
                    client.postMessage({
                        type: 'NOTIFICATION_CLICKED',
                        url: urlToOpen,
                        notificationId: data.notificationId,
                        notificationType: data.type
                    });
                    return client.focus();
                }
            }

            // Open new window
            if (clients.openWindow) {
                return clients.openWindow(urlToOpen);
            }
        })
    );
});

/**
 * Get notification actions based on type
 */
function getNotificationActions(type) {
    const actionMap = {
        new_message: [
            { action: 'reply', title: 'Reply' },
            { action: 'mark_read', title: 'Mark Read' }
        ],
        new_comment: [
            { action: 'view', title: 'View' },
            { action: 'mark_read', title: 'Mark Read' }
        ],
        assignment_due_today: [
            { action: 'view', title: 'View Assignment' },
            { action: 'mark_read', title: 'Dismiss' }
        ],
        meeting_starting_now: [
            { action: 'view', title: 'View Details' },
            { action: 'dismiss', title: 'Dismiss' }
        ],
        morning_checkin: [
            { action: 'open_checkin', title: 'Start Check-in' },
            { action: 'snooze', title: 'Remind Later' }
        ]
    };

    return actionMap[type] || [{ action: 'view', title: 'View' }];
}

/**
 * Mark notification as read
 */
async function markNotificationAsRead(notificationId, userId) {
    if (!notificationId || !userId) return;

    try {
        // Call Firestore via REST API (since we can't use Firebase SDK directly)
        const response = await fetch(
            `https://firestore.googleapis.com/v1/projects/glrs-pir-system/databases/(default)/documents/notifications/${notificationId}`,
            {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    fields: {
                        read: { booleanValue: true },
                        readAt: { timestampValue: new Date().toISOString() }
                    }
                })
            }
        );

        if (response.ok) {
            console.log(`Marked notification ${notificationId} as read`);
        }
    } catch (error) {
        console.error('Error marking notification as read:', error);
    }
}

/**
 * Snooze notification (reschedule for later)
 */
async function snoozeNotification(notificationId, userId, minutes) {
    console.log(`Snoozing notification ${notificationId} for ${minutes} minutes`);

    // Store snooze preference in local storage
    const snoozeTime = Date.now() + (minutes * 60 * 1000);

    try {
        const cache = await caches.open('glrs-snooze');
        await cache.put(
            `/snooze/${notificationId}`,
            new Response(JSON.stringify({
                notificationId,
                userId,
                snoozeUntil: snoozeTime
            }))
        );
    } catch (error) {
        console.error('Error snoozing notification:', error);
    }
}

/**
 * Handle service worker installation
 */
self.addEventListener('install', (event) => {
    console.log('[firebase-messaging-sw.js] Service Worker installing...');
    self.skipWaiting();
});

/**
 * Handle service worker activation
 */
self.addEventListener('activate', (event) => {
    console.log('[firebase-messaging-sw.js] Service Worker activating...');
    event.waitUntil(clients.claim());
});

console.log('[firebase-messaging-sw.js] Service Worker loaded');
