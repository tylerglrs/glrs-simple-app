const admin = require('firebase-admin');

/**
 * Master notification sender
 * Handles all notification delivery with preference checking, quiet hours, and timezone awareness
 * PHASE 6: Enhanced with multi-device FCM push, priority levels, custom sounds, and notification actions
 *
 * @param {Object} params
 * @param {string} params.userId - User ID to send notification to
 * @param {string} params.type - Notification type (e.g., 'morning_checkin', 'assignment_due_today')
 * @param {string} params.title - Notification title
 * @param {string} params.message - Notification message body
 * @param {string} params.category - Category for filtering (e.g., 'daily_reminder', 'alert', 'meeting')
 * @param {string} params.priority - Priority level ('low', 'normal', 'high', 'critical')
 * @param {string} params.actionUrl - Optional deep link URL
 * @param {Object} params.data - Optional additional data
 * @param {string} params.preferenceKey - User preference key to check (e.g., 'morningCheckInAlerts')
 * @returns {Promise<Object>} Result object with delivery status
 */
async function sendNotification({
    userId,
    type,
    title,
    message,
    category = 'general',
    priority = 'normal',
    actionUrl = null,
    data = {},
    preferenceKey = null
}) {
    const db = admin.firestore();

    try {
        // 1. Get user data and preferences
        const userDoc = await db.collection('users').doc(userId).get();

        if (!userDoc.exists) {
            console.warn(`User ${userId} not found, skipping notification`);
            return { delivered: false, reason: 'user_not_found' };
        }

        const userData = userDoc.data();
        const notifications = userData.notifications || {};

        // 2. Check master notification toggle
        if (notifications.enabled === false) {
            console.log(`Notifications disabled for user ${userId}`);
            return { delivered: false, reason: 'notifications_disabled' };
        }

        // 3. Check specific notification type preference
        if (preferenceKey && notifications[preferenceKey] === false) {
            console.log(`Notification type ${preferenceKey} disabled for user ${userId}`);
            return { delivered: false, reason: 'type_disabled', preferenceKey };
        }

        // 4. Check quiet hours
        const quietHours = notifications.quietHours || {};
        if (quietHours.enabled && isInQuietHours(userData.timezone, quietHours)) {
            console.log(`User ${userId} in quiet hours, storing notification without push/email`);

            // Still store in Firestore for in-app display
            const notificationDoc = await storeNotification(userId, {
                type,
                title,
                message,
                category,
                priority,
                actionUrl,
                data,
                deliveredVia: { inApp: true, push: false, email: false }
            });

            return {
                delivered: true,
                channels: ['in-app'],
                quietHours: true,
                notificationId: notificationDoc.id
            };
        }

        // 5. Store notification in Firestore (always for in-app)
        const notificationDoc = await storeNotification(userId, {
            type,
            title,
            message,
            category,
            priority,
            actionUrl,
            data,
            deliveredVia: { inApp: true, push: false, email: false }
        });

        const channels = ['in-app'];
        let pushSent = false;

        // 6. Send push notification to all user's devices
        const fcmTokens = userData.fcmTokens || [];
        if (fcmTokens.length > 0 && notifications.sounds !== false) {
            try {
                const pushResults = await sendPushNotificationToDevices(fcmTokens, {
                    title,
                    body: message,
                    type,
                    category,
                    priority,
                    actionUrl,
                    data,
                    userId,
                    notificationId: notificationDoc.id,
                    soundEnabled: notifications.sounds !== false,
                    vibrationEnabled: notifications.vibration !== false
                });

                // Remove invalid tokens
                if (pushResults.invalidTokens.length > 0) {
                    console.log(`Removing ${pushResults.invalidTokens.length} invalid FCM tokens for user ${userId}`);
                    const validTokens = fcmTokens.filter(t => !pushResults.invalidTokens.includes(t.token));
                    await db.collection('users').doc(userId).update({
                        fcmTokens: validTokens
                    });
                }

                if (pushResults.successCount > 0) {
                    channels.push('push');
                    pushSent = true;

                    // Update deliveredVia in notification document
                    await notificationDoc.ref.update({
                        'deliveredVia.push': true,
                        pushDeliveredAt: admin.firestore.FieldValue.serverTimestamp(),
                        pushDeviceCount: pushResults.successCount
                    });
                }
            } catch (error) {
                console.error(`Failed to send push notification to ${userId}:`, error);
            }
        }

        // 7. Send email for high-priority notifications (if enabled)
        const shouldEmail = priority === 'critical' || priority === 'high';
        if (shouldEmail && userData.email) {
            // Email sending implemented in Phase 4
            console.log(`Would send email to ${userData.email} for ${type}`);
        }

        return {
            delivered: true,
            channels,
            quietHours: false,
            pushSent,
            notificationId: notificationDoc.id
        };

    } catch (error) {
        console.error(`Error sending notification to ${userId}:`, error);
        throw error;
    }
}

/**
 * Store notification in Firestore
 * Returns document reference for further updates
 */
async function storeNotification(userId, notificationData) {
    const db = admin.firestore();

    const docRef = await db.collection('notifications').add({
        userId,
        type: notificationData.type,
        title: notificationData.title,
        message: notificationData.message,
        category: notificationData.category || 'general',
        priority: notificationData.priority || 'normal',
        actionUrl: notificationData.actionUrl || null,
        data: notificationData.data || {},
        read: false,
        readAt: null,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        deliveredVia: notificationData.deliveredVia || {
            inApp: true,
            push: false,
            email: false
        }
    });

    return docRef;
}

/**
 * Check if current time is within user's quiet hours
 */
function isInQuietHours(userTimezone, quietHours) {
    if (!quietHours.enabled || !quietHours.start || !quietHours.end) {
        return false;
    }

    const now = new Date();
    const timezone = userTimezone || 'America/Los_Angeles';

    // Get user's local time
    const userTime = now.toLocaleString('en-US', {
        timeZone: timezone,
        hour12: false,
        hour: '2-digit',
        minute: '2-digit'
    });

    const currentTime = userTime.slice(-5); // "HH:MM"
    const startTime = quietHours.start; // "22:00"
    const endTime = quietHours.end; // "07:00"

    // Handle overnight quiet hours (e.g., 22:00 to 07:00)
    if (startTime > endTime) {
        return currentTime >= startTime || currentTime < endTime;
    }

    // Handle same-day quiet hours (e.g., 13:00 to 14:00)
    return currentTime >= startTime && currentTime < endTime;
}

/**
 * PHASE 6: Send push notification to multiple devices
 * Supports priority levels, custom sounds, notification actions, and badge management
 */
async function sendPushNotificationToDevices(fcmTokens, payload) {
    const {
        title,
        body,
        type,
        category,
        priority,
        actionUrl,
        data,
        userId,
        notificationId,
        soundEnabled,
        vibrationEnabled
    } = payload;

    // Map priority to FCM priority and TTL
    const priorityConfig = {
        critical: { priority: 'high', ttl: 0, androidPriority: 'high' },
        high: { priority: 'high', ttl: 3600, androidPriority: 'high' },
        normal: { priority: 'normal', ttl: 86400, androidPriority: 'default' },
        low: { priority: 'normal', ttl: 259200, androidPriority: 'low' }
    };

    const config = priorityConfig[priority] || priorityConfig.normal;

    // Get custom sound based on category
    const sound = soundEnabled ? getCategorySound(category) : null;

    // Get notification channel based on category
    const channelId = getCategoryChannel(category);

    // Build notification actions based on type
    const actions = getNotificationActions(type);

    // Convert data to strings (FCM requirement)
    const stringifiedData = {
        type,
        category,
        priority,
        actionUrl: actionUrl || '',
        userId,
        notificationId,
        ...Object.fromEntries(
            Object.entries(data).map(([key, value]) => [
                key,
                typeof value === 'string' ? value : JSON.stringify(value)
            ])
        )
    };

    const results = {
        successCount: 0,
        failureCount: 0,
        invalidTokens: []
    };

    // Send to each device
    const promises = fcmTokens.map(async (tokenObj) => {
        const token = typeof tokenObj === 'string' ? tokenObj : tokenObj.token;

        try {
            const message = {
                token,
                notification: {
                    title,
                    body
                },
                data: stringifiedData,
                android: {
                    priority: config.androidPriority,
                    ttl: config.ttl * 1000, // Convert to milliseconds
                    notification: {
                        sound: sound || undefined,
                        channelId,
                        priority: config.androidPriority,
                        defaultSound: !sound,
                        defaultVibrateTimings: !vibrationEnabled,
                        clickAction: 'FLUTTER_NOTIFICATION_CLICK',
                        tag: category
                    }
                },
                apns: {
                    headers: {
                        'apns-priority': config.priority === 'high' ? '10' : '5',
                        'apns-expiration': String(Math.floor(Date.now() / 1000) + config.ttl)
                    },
                    payload: {
                        aps: {
                            alert: {
                                title,
                                body
                            },
                            sound: sound || 'default',
                            badge: 1,
                            category: type,
                            threadId: category
                        }
                    }
                },
                webpush: {
                    notification: {
                        title,
                        body,
                        icon: '/assets/glrs-logo.png',
                        badge: '/assets/badge.png',
                        vibrate: vibrationEnabled ? [200, 100, 200] : undefined,
                        requireInteraction: priority === 'critical',
                        tag: category,
                        renotify: true,
                        actions: actions.map(action => ({
                            action: action.action,
                            title: action.title,
                            icon: action.icon
                        })),
                        data: {
                            url: actionUrl || '/notifications',
                            notificationId,
                            type,
                            category
                        }
                    },
                    fcmOptions: {
                        link: actionUrl || '/notifications'
                    }
                }
            };

            await admin.messaging().send(message);
            results.successCount++;
        } catch (error) {
            results.failureCount++;

            // Check if token is invalid
            if (
                error.code === 'messaging/invalid-registration-token' ||
                error.code === 'messaging/registration-token-not-registered'
            ) {
                results.invalidTokens.push(token);
            }

            console.error(`Failed to send push to token ${token}:`, error.message);
        }
    });

    await Promise.all(promises);

    console.log(`Push notification sent: ${results.successCount} success, ${results.failureCount} failed`);

    return results;
}

/**
 * Get custom sound file based on notification category
 */
function getCategorySound(category) {
    const soundMap = {
        daily_reminder: 'gentle_chime.wav',
        assignment: 'notification.wav',
        meeting: 'urgent_alert.wav',
        messaging: 'soft_chime.wav',
        community: 'soft_chime.wav',
        milestone: 'celebration.wav',
        emergency: 'urgent_alert.wav'
    };

    return soundMap[category] || 'default';
}

/**
 * Get Android notification channel based on category
 */
function getCategoryChannel(category) {
    const channelMap = {
        daily_reminder: 'daily_reminders',
        assignment: 'assignments_milestones',
        milestone: 'assignments_milestones',
        meeting: 'meetings',
        messaging: 'community_messages',
        community: 'community_messages',
        emergency: 'emergency'
    };

    return channelMap[category] || 'glrs_notifications';
}

/**
 * Get notification actions (interactive buttons) based on notification type
 */
function getNotificationActions(type) {
    const actionMap = {
        new_message: [
            { action: 'reply', title: 'Reply', icon: '/assets/icons/reply.png' },
            { action: 'mark_read', title: 'Mark Read', icon: '/assets/icons/check.png' }
        ],
        new_comment: [
            { action: 'view', title: 'View', icon: '/assets/icons/eye.png' },
            { action: 'mark_read', title: 'Mark Read', icon: '/assets/icons/check.png' }
        ],
        assignment_due_today: [
            { action: 'view', title: 'View Assignment', icon: '/assets/icons/assignment.png' },
            { action: 'mark_read', title: 'Dismiss', icon: '/assets/icons/close.png' }
        ],
        meeting_starting_now: [
            { action: 'view', title: 'View Details', icon: '/assets/icons/calendar.png' },
            { action: 'dismiss', title: 'Dismiss', icon: '/assets/icons/close.png' }
        ],
        morning_checkin: [
            { action: 'open_checkin', title: 'Start Check-in', icon: '/assets/icons/checkin.png' },
            { action: 'snooze', title: 'Remind Later', icon: '/assets/icons/snooze.png' }
        ]
    };

    return actionMap[type] || [
        { action: 'view', title: 'View', icon: '/assets/icons/eye.png' }
    ];
}

module.exports = {
    sendNotification,
    storeNotification,
    isInQuietHours
};
