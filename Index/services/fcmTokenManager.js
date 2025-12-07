/**
 * PHASE 6: FCM Token Manager
 * Handles Firebase Cloud Messaging token registration, refresh, and multi-device management
 * Call initializeFCM() after user login to enable push notifications
 */

// VAPID key from Firebase Console (Cloud Messaging > Web Push certificates)
// IMPORTANT: Replace with actual VAPID key from Firebase Console
const VAPID_KEY = 'YOUR_VAPID_KEY_HERE';

/**
 * Initialize FCM for the current user
 * Call this function after successful login
 */
window.initializeFCM = async function() {
    try {
        // Check if browser supports notifications
        if (!('Notification' in window)) {
            console.log('This browser does not support notifications');
            return false;
        }

        // Check if user is logged in
        const currentUser = firebase.auth().currentUser;
        if (!currentUser) {
            console.log('No user logged in, skipping FCM initialization');
            return false;
        }

        // Register service worker
        const registration = await registerServiceWorker();
        if (!registration) {
            console.error('Service worker registration failed');
            return false;
        }

        // Request notification permission
        const permission = await requestNotificationPermission();
        if (permission !== 'granted') {
            console.log('Notification permission denied');
            return false;
        }

        // Get FCM token
        const token = await getFCMToken(registration);
        if (!token) {
            console.error('Failed to get FCM token');
            return false;
        }

        // Save token to Firestore
        await saveFCMToken(currentUser.uid, token);

        // Listen for token refresh
        setupTokenRefreshListener(currentUser.uid);

        // Listen for foreground messages
        setupForegroundMessageListener();

        console.log('FCM initialized successfully');
        return true;

    } catch (error) {
        console.error('Error initializing FCM:', error);
        return false;
    }
};

/**
 * Register Firebase Messaging service worker
 */
async function registerServiceWorker() {
    try {
        if (!('serviceWorker' in navigator)) {
            console.log('Service workers not supported');
            return null;
        }

        const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
            scope: '/'
        });

        console.log('Service Worker registered:', registration);

        // Wait for service worker to be ready
        await navigator.serviceWorker.ready;

        return registration;
    } catch (error) {
        console.error('Service Worker registration failed:', error);
        return null;
    }
}

/**
 * Request notification permission from user
 */
async function requestNotificationPermission() {
    try {
        const permission = await Notification.requestPermission();
        console.log('Notification permission:', permission);
        return permission;
    } catch (error) {
        console.error('Error requesting notification permission:', error);
        return 'denied';
    }
}

/**
 * Get FCM registration token
 */
async function getFCMToken(registration) {
    try {
        const messaging = firebase.messaging();

        // Get token with VAPID key
        const token = await messaging.getToken({
            vapidKey: VAPID_KEY,
            serviceWorkerRegistration: registration
        });

        console.log('FCM token obtained:', token.substring(0, 20) + '...');
        return token;
    } catch (error) {
        console.error('Error getting FCM token:', error);
        return null;
    }
}

/**
 * Save FCM token to Firestore
 * Supports multiple devices per user
 */
async function saveFCMToken(userId, token) {
    try {
        const db = firebase.firestore();
        const userRef = db.collection('users').doc(userId);

        // Get current tokens
        const userDoc = await userRef.get();
        const userData = userDoc.data();
        const existingTokens = userData.fcmTokens || [];

        // Check if token already exists
        const tokenExists = existingTokens.some(t =>
            (typeof t === 'string' ? t : t.token) === token
        );

        if (tokenExists) {
            console.log('FCM token already registered');
            return;
        }

        // Get device info
        const deviceInfo = getDeviceInfo();

        // Add new token
        const newToken = {
            token,
            device: deviceInfo.device,
            browser: deviceInfo.browser,
            platform: deviceInfo.platform,
            addedAt: firebase.firestore.FieldValue.serverTimestamp(),
            lastUsedAt: firebase.firestore.FieldValue.serverTimestamp()
        };

        // Update Firestore
        await userRef.update({
            fcmTokens: firebase.firestore.FieldValue.arrayUnion(newToken),
            lastFCMTokenUpdate: firebase.firestore.FieldValue.serverTimestamp()
        });

        console.log('FCM token saved to Firestore');

    } catch (error) {
        console.error('Error saving FCM token:', error);
    }
}

/**
 * Get device and browser information
 */
function getDeviceInfo() {
    const ua = navigator.userAgent;

    // Detect browser
    let browser = 'Unknown';
    if (ua.includes('Chrome')) browser = 'Chrome';
    else if (ua.includes('Firefox')) browser = 'Firefox';
    else if (ua.includes('Safari')) browser = 'Safari';
    else if (ua.includes('Edge')) browser = 'Edge';

    // Detect platform
    let platform = 'Unknown';
    if (ua.includes('Windows')) platform = 'Windows';
    else if (ua.includes('Mac')) platform = 'macOS';
    else if (ua.includes('Linux')) platform = 'Linux';
    else if (ua.includes('Android')) platform = 'Android';
    else if (ua.includes('iOS') || ua.includes('iPhone') || ua.includes('iPad')) platform = 'iOS';

    // Detect device type
    let device = 'Desktop';
    if (/Mobi|Android/i.test(ua)) device = 'Mobile';
    else if (/Tablet|iPad/i.test(ua)) device = 'Tablet';

    return { browser, platform, device };
}

/**
 * Setup listener for token refresh
 */
function setupTokenRefreshListener(userId) {
    const messaging = firebase.messaging();

    messaging.onTokenRefresh(async () => {
        try {
            console.log('FCM token refreshed');

            const registration = await navigator.serviceWorker.ready;
            const newToken = await getFCMToken(registration);

            if (newToken) {
                await saveFCMToken(userId, newToken);
            }
        } catch (error) {
            console.error('Error refreshing FCM token:', error);
        }
    });
}

/**
 * Setup listener for foreground messages
 * (messages received when app is in focus)
 */
function setupForegroundMessageListener() {
    const messaging = firebase.messaging();

    messaging.onMessage((payload) => {
        console.log('Foreground message received:', payload);

        const notificationTitle = payload.notification?.title || 'GLRS Lighthouse';
        const notificationOptions = {
            body: payload.notification?.body || 'You have a new notification',
            icon: payload.notification?.icon || '/assets/glrs-logo.png',
            badge: '/assets/badge.png',
            tag: payload.data?.category || 'general',
            data: payload.data,
            requireInteraction: payload.data?.priority === 'critical'
        };

        // Show notification if user has granted permission
        if (Notification.permission === 'granted') {
            new Notification(notificationTitle, notificationOptions);
        }

        // Play notification sound
        playNotificationSound(payload.data?.category);

        // Update UI badge count
        updateBadgeCount();
    });
}

/**
 * Play notification sound based on category
 */
function playNotificationSound(category) {
    try {
        const soundMap = {
            daily_reminder: '/sounds/gentle_chime.mp3',
            assignment: '/sounds/notification.mp3',
            meeting: '/sounds/urgent_alert.mp3',
            messaging: '/sounds/soft_chime.mp3',
            community: '/sounds/soft_chime.mp3',
            milestone: '/sounds/celebration.mp3',
            emergency: '/sounds/urgent_alert.mp3'
        };

        const soundFile = soundMap[category] || '/sounds/notification.mp3';
        const audio = new Audio(soundFile);
        audio.volume = 0.5;
        audio.play().catch(err => {
            // Ignore errors (browser may block autoplay)
            console.log('Could not play notification sound:', err.message);
        });
    } catch (error) {
        console.error('Error playing notification sound:', error);
    }
}

/**
 * Update notification badge count
 */
async function updateBadgeCount() {
    try {
        const currentUser = firebase.auth().currentUser;
        if (!currentUser) return;

        const db = firebase.firestore();
        const unreadSnapshot = await db.collection('notifications')
            .where('userId', '==', currentUser.uid)
            .where('read', '==', false)
            .get();

        const count = unreadSnapshot.size;

        // Update browser badge (if supported)
        if ('setAppBadge' in navigator) {
            if (count > 0) {
                navigator.setAppBadge(count);
            } else {
                navigator.clearAppBadge();
            }
        }

        // Update UI badge in NotificationsTab
        if (window.GLRSApp && window.GLRSApp.updateNotificationBadge) {
            window.GLRSApp.updateNotificationBadge(count);
        }

    } catch (error) {
        console.error('Error updating badge count:', error);
    }
}

/**
 * Remove FCM token (on logout or device removal)
 */
window.removeFCMToken = async function(userId, token) {
    try {
        const db = firebase.firestore();
        const userRef = db.collection('users').doc(userId);

        // Get current tokens
        const userDoc = await userRef.get();
        const userData = userDoc.data();
        const existingTokens = userData.fcmTokens || [];

        // Remove token
        const updatedTokens = existingTokens.filter(t =>
            (typeof t === 'string' ? t : t.token) !== token
        );

        await userRef.update({
            fcmTokens: updatedTokens
        });

        console.log('FCM token removed from Firestore');

        // Delete token from FCM
        const messaging = firebase.messaging();
        await messaging.deleteToken();

    } catch (error) {
        console.error('Error removing FCM token:', error);
    }
};

/**
 * Check if notifications are supported and enabled
 */
window.isNotificationSupported = function() {
    return 'Notification' in window &&
           'serviceWorker' in navigator &&
           firebase.messaging.isSupported();
};

/**
 * Get current notification permission status
 */
window.getNotificationPermission = function() {
    if (!('Notification' in window)) {
        return 'unsupported';
    }
    return Notification.permission;
};

console.log('[fcmTokenManager.js] FCM Token Manager loaded');
console.log('Call initializeFCM() after user login to enable push notifications');
