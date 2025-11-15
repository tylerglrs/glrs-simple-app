// ============================================================
// GLRS LIGHTHOUSE - FIRESTORE SERVICE
// ============================================================
// All Firestore database operations
// Part of modular architecture - provides database access layer
// ============================================================

window.GLRSApp = window.GLRSApp || {};
window.GLRSApp.services = window.GLRSApp.services || {};

// Get db reference from config.js (already initialized)
// Note: auth and db are accessed via window.GLRSApp throughout this file to avoid global const conflicts
if (!window.GLRSApp.db && !window.db) {
    console.error('❌ Firestore not initialized! Ensure config.js loads before firestore.js');
}

// ============================================================
// USER OPERATIONS (36 uses)
// ============================================================

window.GLRSApp.services.firestore = {

    // Get user by UID
    getUser: async (uid) => {
        try {
            const doc = await window.GLRSApp.db.collection('users').doc(uid).get();
            return doc.exists ? { id: doc.id, ...doc.data() } : null;
        } catch (error) {
            console.error('Error getting user:', error);
            return null;
        }
    },

    // Create new user
    createUser: async (uid, userData) => {
        try {
            await window.GLRSApp.db.collection('users').doc(uid).set({
                ...userData,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            return true;
        } catch (error) {
            console.error('Error creating user:', error);
            return false;
        }
    },

    // Update user
    updateUser: async (uid, updates) => {
        try {
            await window.GLRSApp.db.collection('users').doc(uid).update({
                ...updates,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            return true;
        } catch (error) {
            console.error('Error updating user:', error);
            return false;
        }
    },

    // ============================================================
    // CHECK-IN OPERATIONS (26 uses)
    // ============================================================

    // Get user's check-ins
    getCheckIns: async (userId, limit = 30) => {
        try {
            const snapshot = await window.GLRSApp.db.collection('checkIns')
                .where('userId', '==', userId)
                .orderBy('createdAt', 'desc')
                .limit(limit)
                .get();

            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            console.error('Error getting check-ins:', error);
            return [];
        }
    },

    // Create check-in
    createCheckIn: async (checkInData) => {
        try {
            const docRef = await window.GLRSApp.db.collection('checkIns').add({
                ...checkInData,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            return docRef.id;
        } catch (error) {
            console.error('Error creating check-in:', error);
            return null;
        }
    },

    // Get check-in by ID
    getCheckIn: async (checkInId) => {
        try {
            const doc = await window.GLRSApp.db.collection('checkIns').doc(checkInId).get();
            return doc.exists ? { id: doc.id, ...doc.data() } : null;
        } catch (error) {
            console.error('Error getting check-in:', error);
            return null;
        }
    },

    // Update check-in
    updateCheckIn: async (checkInId, updates) => {
        try {
            await window.GLRSApp.db.collection('checkIns').doc(checkInId).update({
                ...updates,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            return true;
        } catch (error) {
            console.error('Error updating check-in:', error);
            return false;
        }
    },

    // ============================================================
    // NOTIFICATION OPERATIONS (15 uses)
    // ============================================================

    // Get user notifications
    getNotifications: async (userId, limit = 20) => {
        try {
            const snapshot = await window.GLRSApp.db.collection('notifications')
                .where('userId', '==', userId)
                .orderBy('createdAt', 'desc')
                .limit(limit)
                .get();

            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            console.error('Error getting notifications:', error);
            return [];
        }
    },

    // Create notification
    createNotification: async (notificationData) => {
        try {
            const docRef = await window.GLRSApp.db.collection('notifications').add({
                ...notificationData,
                read: false,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            return docRef.id;
        } catch (error) {
            console.error('Error creating notification:', error);
            return null;
        }
    },

    // Mark notification as read
    markNotificationRead: async (notificationId) => {
        try {
            await window.GLRSApp.db.collection('notifications').doc(notificationId).update({
                read: true,
                readAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            return true;
        } catch (error) {
            console.error('Error marking notification read:', error);
            return false;
        }
    },

    // ============================================================
    // ASSIGNMENT OPERATIONS (12 uses)
    // ============================================================

    // Get user assignments
    getAssignments: async (userId) => {
        try {
            const snapshot = await window.GLRSApp.db.collection('assignments')
                .where('userId', '==', userId)
                .orderBy('dueDate', 'asc')
                .get();

            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            console.error('Error getting assignments:', error);
            return [];
        }
    },

    // Create assignment
    createAssignment: async (assignmentData) => {
        try {
            const docRef = await window.GLRSApp.db.collection('assignments').add({
                ...assignmentData,
                status: 'pending',
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            return docRef.id;
        } catch (error) {
            console.error('Error creating assignment:', error);
            return null;
        }
    },

    // Update assignment
    updateAssignment: async (assignmentId, updates) => {
        try {
            await window.GLRSApp.db.collection('assignments').doc(assignmentId).update({
                ...updates,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            return true;
        } catch (error) {
            console.error('Error updating assignment:', error);
            return false;
        }
    },

    // ============================================================
    // GOAL OPERATIONS (5 uses)
    // ============================================================

    // Get user goals
    getGoals: async (userId) => {
        try {
            const snapshot = await window.GLRSApp.db.collection('goals')
                .where('userId', '==', userId)
                .orderBy('createdAt', 'desc')
                .get();

            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            console.error('Error getting goals:', error);
            return [];
        }
    },

    // Create goal
    createGoal: async (goalData) => {
        try {
            const docRef = await window.GLRSApp.db.collection('goals').add({
                ...goalData,
                status: 'active',
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            return docRef.id;
        } catch (error) {
            console.error('Error creating goal:', error);
            return null;
        }
    },

    // Update goal
    updateGoal: async (goalId, updates) => {
        try {
            await window.GLRSApp.db.collection('goals').doc(goalId).update({
                ...updates,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            return true;
        } catch (error) {
            console.error('Error updating goal:', error);
            return false;
        }
    },

    // ============================================================
    // MESSAGE OPERATIONS (5 uses)
    // ============================================================

    // Get user messages
    getMessages: async (userId, limit = 50) => {
        try {
            const snapshot = await window.GLRSApp.db.collection('messages')
                .where('participants', 'array-contains', userId)
                .orderBy('createdAt', 'desc')
                .limit(limit)
                .get();

            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            console.error('Error getting messages:', error);
            return [];
        }
    },

    // Send message
    sendMessage: async (messageData) => {
        try {
            const docRef = await window.GLRSApp.db.collection('messages').add({
                ...messageData,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            return docRef.id;
        } catch (error) {
            console.error('Error sending message:', error);
            return null;
        }
    },

    // ============================================================
    // RESOURCE OPERATIONS (4 uses)
    // ============================================================

    // Get resources
    getResources: async (userId = null) => {
        try {
            let query = window.GLRSApp.db.collection('resources');

            // If userId provided, get user-specific resources
            if (userId) {
                query = query.where('userId', '==', userId);
            }

            const snapshot = await query.orderBy('createdAt', 'desc').get();
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            console.error('Error getting resources:', error);
            return [];
        }
    },

    // Create resource
    createResource: async (resourceData) => {
        try {
            const docRef = await window.GLRSApp.db.collection('resources').add({
                ...resourceData,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            return docRef.id;
        } catch (error) {
            console.error('Error creating resource:', error);
            return null;
        }
    },

    // ============================================================
    // HABIT OPERATIONS (5 uses)
    // ============================================================

    // Get user habits
    getHabits: async (userId) => {
        try {
            const snapshot = await window.GLRSApp.db.collection('habits')
                .where('userId', '==', userId)
                .orderBy('createdAt', 'desc')
                .get();

            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            console.error('Error getting habits:', error);
            return [];
        }
    },

    // Create habit
    createHabit: async (habitData) => {
        try {
            const docRef = await window.GLRSApp.db.collection('habits').add({
                ...habitData,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            return docRef.id;
        } catch (error) {
            console.error('Error creating habit:', error);
            return null;
        }
    },

    // ============================================================
    // REAL-TIME LISTENERS
    // ============================================================

    // Listen to user document changes
    listenToUser: (userId, callback) => {
        return window.GLRSApp.db.collection('users').doc(userId).onSnapshot(doc => {
            if (doc.exists) {
                callback({ id: doc.id, ...doc.data() });
            }
        });
    },

    // Listen to notifications
    listenToNotifications: (userId, callback) => {
        return window.GLRSApp.db.collection('notifications')
            .where('userId', '==', userId)
            .orderBy('createdAt', 'desc')
            .limit(20)
            .onSnapshot(snapshot => {
                const notifications = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                callback(notifications);
            });
    },

    // Listen to check-ins
    listenToCheckIns: (userId, callback) => {
        return window.GLRSApp.db.collection('checkIns')
            .where('userId', '==', userId)
            .orderBy('createdAt', 'desc')
            .limit(30)
            .onSnapshot(snapshot => {
                const checkIns = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                callback(checkIns);
            });
    }
};

// ============================================================
// BACKWARD COMPATIBILITY
// ============================================================

// Expose service methods at root level for backward compatibility
Object.keys(window.GLRSApp.services.firestore).forEach(key => {
    window[key] = window.GLRSApp.services.firestore[key];
});

console.log('✅ firestore.js loaded - Database service available');
