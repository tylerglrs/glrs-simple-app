// ═══════════════════════════════════════════════════════════
// NOTIFICATION ACTIONS
// Business logic for managing notifications
// ═══════════════════════════════════════════════════════════

// ==========================================
// MARK SINGLE NOTIFICATION AS READ
// ==========================================

const markNotificationAsRead = async ({ notificationId, db, firebase }) => {
    try {
        await db.collection('notifications').doc(notificationId).update({
            read: true,
            readAt: firebase.firestore.FieldValue.serverTimestamp()
        });
    } catch (error) {
        console.error('Error marking notification as read:', error);
    }
};

// ==========================================
// MARK ALL NOTIFICATIONS AS READ
// ==========================================

const markAllNotificationsAsRead = async ({ notifications, db, firebase }) => {
    try {
        const batch = db.batch();

        notifications.forEach(notification => {
            if (!notification.read) {
                const notificationRef = db.collection('notifications').doc(notification.id);
                batch.update(notificationRef, {
                    read: true,
                    readAt: firebase.firestore.FieldValue.serverTimestamp()
                });
            }
        });

        await batch.commit();
    } catch (error) {
        console.error('Error marking all notifications as read:', error);
    }
};

// Register globally
window.GLRSApp = window.GLRSApp || { shared: {} };
window.GLRSApp.shared = window.GLRSApp.shared || {};
window.GLRSApp.shared.notificationActions = {
    markNotificationAsRead,
    markAllNotificationsAsRead
};

console.log('✅ Notification actions loaded');
