// ============================================================
// GLRS LIGHTHOUSE - FIREBASE CONFIGURATION
// ============================================================
// This file contains Firebase configuration and initialization
// Part of modular architecture - loads before all other modules
// ============================================================

// Initialize global namespace
window.GLRSApp = window.GLRSApp || {};

// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyAufSTHtCTFSEIeZ9YzvrULCnji5I-SMi0",
    authDomain: "glrs-pir-system.firebaseapp.com",
    projectId: "glrs-pir-system",
    storageBucket: "glrs-pir-system.appspot.com",
    messagingSenderId: "830378577655",
    appId: "1:830378577655:web:8a9ea644b8e3c5a9f15c42"
};

// Initialize Firebase (only if not already initialized)
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
    console.log('✅ Firebase initialized from config.js');
} else {
    console.log('✅ Firebase already initialized');
}

// Export Firebase services for global access
window.GLRSApp.auth = firebase.auth();
window.GLRSApp.db = firebase.firestore();
window.GLRSApp.storage = firebase.storage();

// Backward compatibility - maintain global references
window.auth = window.GLRSApp.auth;
window.db = window.GLRSApp.db;
window.storage = window.GLRSApp.storage;
window.firebase = firebase;

console.log('✅ config.js loaded - Firebase services available');
// ========================================
// GLRS LIGHTHOUSE - CONSTANTS
// App-wide constants and configuration values
// ========================================

window.GLRSApp = window.GLRSApp || {};
window.GLRSApp.utils = window.GLRSApp.utils || {};

window.GLRSApp.utils.constants = {
    // Will contain constants:
    // - Tier thresholds
    // - Color schemes
    // - API endpoints
    // - Feature flags
    // - Default values
    // - Validation rules
    // - etc.
};

console.log('✅ Constants loaded');
// ============================================================
// GLRS LIGHTHOUSE - HELPER UTILITIES
// ============================================================
// Shared utility functions used across the app
// Part of modular architecture - provides common utilities
// ============================================================

window.GLRSApp = window.GLRSApp || {};
window.GLRSApp.utils = window.GLRSApp.utils || {};

// ============================================================
// SOBRIETY DATE CALCULATIONS
// ============================================================

// Calculate sobriety days from a sobriety date string (YYYY-MM-DD)
// DST-proof calculation using UTC conversion
window.GLRSApp.utils.getSobrietyDays = (sobrietyDate) => {
    if (!sobrietyDate) return 0;

    // Parse as LOCAL date
    const [year, month, day] = sobrietyDate.split('-');
    const sobrietyDateObj = new Date(parseInt(year), parseInt(month) - 1, parseInt(day), 0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // FIXED: Convert both to UTC to avoid DST issues
    const sobrietyUTC = Date.UTC(sobrietyDateObj.getFullYear(), sobrietyDateObj.getMonth(), sobrietyDateObj.getDate());
    const todayUTC = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());

    // Calculate difference in milliseconds (now DST-proof)
    const diffTime = todayUTC - sobrietyUTC;

    // Convert to days and add 1 (sobriety date counts as day 1)
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;

    // Return at least 1 if sobriety date is today or in the past
    return Math.max(1, diffDays);
};

// ============================================================
// HAPTIC FEEDBACK
// ============================================================

// Trigger haptic feedback on supported devices
window.GLRSApp.utils.triggerHaptic = (type = 'light') => {
    if (!navigator.vibrate) return;

    switch (type) {
        case 'light':
            navigator.vibrate(10);
            break;
        case 'medium':
            navigator.vibrate(20);
            break;
        case 'heavy':
            navigator.vibrate(50);
            break;
        case 'success':
            navigator.vibrate([10, 50, 10]);
            break;
        case 'error':
            navigator.vibrate([50, 100, 50]);
            break;
        default:
            navigator.vibrate(10);
    }
};

// ============================================================
// NOTIFICATION SYSTEM
// ============================================================

// Show a toast notification with haptic feedback
window.GLRSApp.utils.showNotification = (message, type = 'info') => {
    // Trigger haptic feedback
    if (navigator.vibrate) {
        navigator.vibrate(type === 'success' ? [10, 50, 10] : type === 'error' ? [50, 100, 50] : 10);
    }

    // Create notification container
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: var(--space-4);
        right: var(--space-4);
        background: ${type === 'success' ? 'var(--color-success)' : type === 'error' ? 'var(--color-danger)' : 'var(--color-info)'};
        color: white;
        padding: var(--space-4) var(--space-6);
        border-radius: var(--radius-lg);
        box-shadow: 0 8px 24px rgba(0,0,0,0.15);
        z-index: 10000;
        animation: slideIn 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        display: flex;
        align-items: center;
        gap: var(--space-3);
        max-width: 400px;
        backdrop-filter: blur(10px);
    `;

    // Add icon based on type
    const icon = document.createElement('i');
    icon.setAttribute('data-lucide', type === 'success' ? 'check-circle' : type === 'error' ? 'alert-circle' : 'info');
    icon.style.cssText = 'width: 20px; height: 20px; flex-shrink: 0;';

    // Add message text
    const text = document.createElement('span');
    text.textContent = message;
    text.style.cssText = 'font-size: var(--font-sm); font-weight: 500;';

    notification.appendChild(icon);
    notification.appendChild(text);
    document.body.appendChild(notification);

    // Initialize icon
    if (window.lucide) {
        window.lucide.createIcons();
    }

    // Auto-dismiss after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, 3000);
};

// ============================================================
// BACKWARD COMPATIBILITY
// ============================================================

// Maintain global references for backward compatibility
window.getSobrietyDays = window.GLRSApp.utils.getSobrietyDays;
window.triggerHaptic = window.GLRSApp.utils.triggerHaptic;
window.showNotification = window.GLRSApp.utils.showNotification;

console.log('✅ helpers.js loaded - Utility functions available');
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
// ============================================================
// GLRS LIGHTHOUSE - STORAGE SERVICE
// ============================================================
// Firebase Storage operations and image processing
// Part of modular architecture - handles file uploads
// ============================================================

window.GLRSApp = window.GLRSApp || {};
window.GLRSApp.services = window.GLRSApp.services || {};

// Get storage reference from config.js (already initialized)
// Note: storage is accessed via window.GLRSApp.storage throughout this file to avoid global const conflicts
if (!window.GLRSApp.storage && !window.storage) {
    console.warn('⚠️ Firebase Storage not initialized');
}

// ============================================================
// IMAGE PROCESSING & UPLOAD
// ============================================================

window.GLRSApp.services.storage = {

    // Upload chat image with compression (returns data URL)
    uploadChatImage: async (file, chatType, roomId) => {
        if (!file) return null;

        return new Promise((resolve, reject) => {
            // First compress the image
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    // Create canvas for compression
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');

                    // Set max dimensions
                    const maxWidth = 800;
                    const maxHeight = 800;
                    let width = img.width;
                    let height = img.height;

                    // Calculate new dimensions
                    if (width > height) {
                        if (width > maxWidth) {
                            height = (maxWidth / width) * height;
                            width = maxWidth;
                        }
                    } else {
                        if (height > maxHeight) {
                            width = (maxHeight / height) * width;
                            height = maxHeight;
                        }
                    }

                    // Set canvas size and draw compressed image
                    canvas.width = width;
                    canvas.height = height;
                    ctx.drawImage(img, 0, 0, width, height);

                    // Convert to data URL directly
                    const dataUrl = canvas.toDataURL('image/jpeg', 0.6);

                    // Check size
                    if (dataUrl.length > 900000) { // ~900KB limit for safety
                        alert('Image too large. Please choose a smaller image.');
                        reject(new Error('Image too large after compression'));
                        return;
                    }

                    // Return the data URL directly - no Firestore save needed here
                    resolve(dataUrl);
                };
                img.onerror = () => reject(new Error('Failed to load image'));
                img.src = e.target.result;
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    },

    // Generic file upload with progress tracking to Firebase Storage
    uploadFile: async (file, path, onProgress) => {
        if (!window.GLRSApp.storage && !window.storage) {
            throw new Error('Firebase Storage not initialized');
        }

        const storageRef = window.GLRSApp.storage.ref(path);
        const uploadTask = storageRef.put(file);

        return new Promise((resolve, reject) => {
            uploadTask.on('state_changed',
                (snapshot) => {
                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    if (onProgress) onProgress(progress);
                },
                (error) => reject(error),
                async () => {
                    const downloadURL = await uploadTask.snapshot.ref.getDownloadURL();
                    resolve(downloadURL);
                }
            );
        });
    },

    // Upload data URL to Firebase Storage (alternative method)
    uploadDataURL: async (dataURL, path) => {
        if (!window.GLRSApp.storage && !window.storage) {
            throw new Error('Firebase Storage not initialized');
        }

        const storageRef = window.GLRSApp.storage.ref(path);
        await storageRef.putString(dataURL, 'data_url');
        return await storageRef.getDownloadURL();
    },

    // Delete file from Firebase Storage
    deleteFile: async (path) => {
        if (!window.GLRSApp.storage && !window.storage) {
            throw new Error('Firebase Storage not initialized');
        }

        const storageRef = window.GLRSApp.storage.ref(path);
        await storageRef.delete();
        return true;
    },

    // Get download URL for a file
    getDownloadURL: async (path) => {
        if (!window.GLRSApp.storage && !window.storage) {
            throw new Error('Firebase Storage not initialized');
        }

        const storageRef = window.GLRSApp.storage.ref(path);
        return await storageRef.getDownloadURL();
    },

    // Compress image without uploading (utility function)
    compressImage: async (file, maxWidth = 800, maxHeight = 800, quality = 0.6) => {
        if (!file) return null;

        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');

                    let width = img.width;
                    let height = img.height;

                    // Calculate new dimensions
                    if (width > height) {
                        if (width > maxWidth) {
                            height = (maxWidth / width) * height;
                            width = maxWidth;
                        }
                    } else {
                        if (height > maxHeight) {
                            width = (maxHeight / height) * width;
                            height = maxHeight;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;
                    ctx.drawImage(img, 0, 0, width, height);

                    resolve(canvas.toDataURL('image/jpeg', quality));
                };
                img.onerror = () => reject(new Error('Failed to load image'));
                img.src = e.target.result;
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }
};

// ============================================================
// BACKWARD COMPATIBILITY
// ============================================================

// Expose service methods at root level for backward compatibility
window.uploadChatImage = window.GLRSApp.services.storage.uploadChatImage;
window.uploadFile = window.GLRSApp.services.storage.uploadFile;
window.compressImage = window.GLRSApp.services.storage.compressImage;

console.log('✅ storage.js loaded - Storage service available');
// ============================================================
// GLRS LIGHTHOUSE - CLOUD FUNCTIONS SERVICE
// ============================================================
// Firebase Cloud Functions integrations
// Part of modular architecture - handles Cloud Function calls
// ============================================================

window.GLRSApp = window.GLRSApp || {};
window.GLRSApp.services = window.GLRSApp.services || {};

// Initialize Cloud Functions (if available)
let functions = null;
if (typeof firebase !== 'undefined' && firebase.apps.length && firebase.functions) {
    functions = firebase.functions();
    window.GLRSApp.functions = functions;
    window.functions = functions;
    console.log('✅ Firebase Functions initialized');
} else {
    console.warn('⚠️ Firebase Functions not available');
}

// ============================================================
// CLOUD FUNCTION WRAPPERS
// ============================================================

window.GLRSApp.services.functions = {

    // Generic callable function wrapper
    callFunction: async (functionName, data = {}) => {
        if (!functions) {
            throw new Error('Firebase Functions not initialized');
        }

        try {
            const callable = functions.httpsCallable(functionName);
            const result = await callable(data);
            return result.data;
        } catch (error) {
            console.error(`Error calling function ${functionName}:`, error);
            throw error;
        }
    },

    // Example functions (to be implemented when Cloud Functions are added):

    // Send notification
    // sendNotification: async (userId, notification) => {
    //     return await window.GLRSApp.services.functions.callFunction('sendNotification', {
    //         userId,
    //         notification
    //     });
    // },

    // Generate report
    // generateReport: async (userId, reportType, dateRange) => {
    //     return await window.GLRSApp.services.functions.callFunction('generateReport', {
    //         userId,
    //         reportType,
    //         dateRange
    //     });
    // },

    // Process payment
    // processPayment: async (userId, amount, paymentMethod) => {
    //     return await window.GLRSApp.services.functions.callFunction('processPayment', {
    //         userId,
    //         amount,
    //         paymentMethod
    //     });
    // }
};

// ============================================================
// BACKWARD COMPATIBILITY
// ============================================================

// Expose callFunction at root level
window.callFunction = window.GLRSApp.services.functions.callFunction;

console.log('✅ functions.js loaded - Cloud Functions service available');
// ============================================================
// GLRS LIGHTHOUSE - AUTHENTICATION UTILITIES
// ============================================================
// Firebase authentication helper functions
// Extracted from PIRapp.js for modularity
// ============================================================

window.GLRSApp = window.GLRSApp || {};

// ============================================================
// AUTHENTICATION HELPERS
// ============================================================

// Get current authenticated user (Firebase auth + Firestore data)
window.GLRSApp.authUtils = {

    // Get current user ID
    getCurrentUserId: () => {
        const user = firebase.auth().currentUser;
        return user ? user.uid : null;
    },

    // Check if user is authenticated
    isAuthenticated: () => {
        return firebase.auth().currentUser !== null;
    },

    // Get current Firebase auth user object
    getCurrentUser: () => {
        return firebase.auth().currentUser;
    },

    // Handle user logout
    handleLogout: async () => {
        if (confirm('Are you sure you want to sign out?')) {
            try {
                await firebase.auth().signOut();
                console.log(' User signed out');
            } catch (error) {
                console.error('L Logout error:', error);
                alert('Error signing out. Please try again.');
            }
        }
    },

    // Get current user email
    getCurrentUserEmail: () => {
        const user = firebase.auth().currentUser;
        return user ? user.email : null;
    },

    // Check if user email is verified
    isEmailVerified: () => {
        const user = firebase.auth().currentUser;
        return user ? user.emailVerified : false;
    }
};

console.log('✅ auth.js loaded - Authentication utilities available at window.GLRSApp.authUtils');
