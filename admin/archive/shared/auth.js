// ==========================================
// SHARED AUTHENTICATION & AUTHORIZATION
// ==========================================
// This file contains authentication helpers and role-based access control
// Used by all admin pages

// ==========================================
// ROLE HIERARCHY & PERMISSIONS
// ==========================================

// Role hierarchy definition
window.ROLE_HIERARCHY = {
    superadmin: 5,      // Global - all tenants
    superadmin1: 4,     // Tenant-level - own tenant only
    admin: 3,           // Managed user
    coach: 2,           // Managed user
    pir: 1              // Client
};

/**
 * Check if user has required permission level
 * @param {string} userRole - User's current role
 * @param {string} requiredRole - Minimum required role
 * @returns {boolean}
 */
window.hasPermission = (userRole, requiredRole) => {
    return (window.ROLE_HIERARCHY[userRole] || 0) >= (window.ROLE_HIERARCHY[requiredRole] || 0);
};

/**
 * Check if user is a SuperAdmin (global)
 * @param {object} user - User object
 * @returns {boolean}
 */
window.isSuperAdmin = (user) => {
    return user && user.role === 'superadmin';
};

/**
 * Check if user is a SuperAdmin1 (tenant-level super admin)
 * @param {object} user - User object
 * @returns {boolean}
 */
window.isSuperAdmin1 = (user) => {
    return user && user.role === 'superadmin1';
};

/**
 * Check if user is either SuperAdmin or SuperAdmin1
 * @param {object} user - User object
 * @returns {boolean}
 */
window.isSuperAdminAny = (user) => {
    return user && (user.role === 'superadmin' || user.role === 'superadmin1');
};

/**
 * Check if user is an Admin or SuperAdmin (any level)
 * @param {object} user - User object
 * @returns {boolean}
 */
window.isAdmin = (user) => {
    return user && (user.role === 'admin' || user.role === 'superadmin' || user.role === 'superadmin1');
};

/**
 * Check if user is a Coach (or higher)
 * @param {object} user - User object
 * @returns {boolean}
 */
window.isCoach = (user) => {
    return user && window.hasPermission(user.role, 'coach');
};

// ==========================================
// NOTIFICATION PREFERENCES
// ==========================================

/**
 * Get user notification preferences
 * @param {string} userId - User ID
 * @returns {object|null} Notification preferences
 */
window.getUserNotificationPrefs = async (userId) => {
    try {
        const prefsDoc = await window.db.collection('settings').doc(`${userId}-notifications`).get();
        if (prefsDoc.exists) {
            return prefsDoc.data();
        }
        // Default preferences (all enabled)
        return {
            emailOnSOS: true,
            emailOnMissedCheckIn: true,
            emailOnNewPIR: true,
            emailOnGoalComplete: true,
            emailOnAlert: true,
            pushOnSOS: true,
            pushOnMessage: true,
            pushOnAlert: true,
            quietHoursEnabled: false,
            quietHoursStart: '22:00',
            quietHoursEnd: '08:00'
        };
    } catch (error) {
        console.error('Error loading notification preferences:', error);
        return null;
    }
};

/**
 * Check if current time is within quiet hours
 * @param {object} prefs - Notification preferences
 * @returns {boolean}
 */
window.isInQuietHours = (prefs) => {
    if (!prefs || !prefs.quietHoursEnabled) return false;

    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    const [startH, startM] = (prefs.quietHoursStart || '22:00').split(':').map(Number);
    const [endH, endM] = (prefs.quietHoursEnd || '08:00').split(':').map(Number);

    const quietStart = startH * 60 + startM;
    const quietEnd = endH * 60 + endM;

    // Handle overnight quiet hours (e.g., 22:00 to 08:00)
    if (quietStart > quietEnd) {
        return currentMinutes >= quietStart || currentMinutes <= quietEnd;
    }
    // Handle same-day quiet hours
    return currentMinutes >= quietStart && currentMinutes <= quietEnd;
};

/**
 * Check if notification should be sent based on preferences
 * @param {string} recipientId - Recipient user ID
 * @param {string} notificationType - Type of notification
 * @returns {boolean}
 */
window.shouldSendNotification = async (recipientId, notificationType) => {
    try {
        const prefs = await window.getUserNotificationPrefs(recipientId);
        if (!prefs) return true; // If can't load prefs, allow notification

        // Check quiet hours (applies to all non-urgent notifications)
        if (notificationType !== 'sos' && window.isInQuietHours(prefs)) {
            console.log(`⏰ Notification suppressed (quiet hours): ${notificationType} for user ${recipientId}`);
            return false;
        }

        // Check notification type preferences
        const prefMap = {
            'sos': 'emailOnSOS',
            'sos_push': 'pushOnSOS',
            'alert': 'emailOnAlert',
            'alert_push': 'pushOnAlert',
            'assignment_created': 'emailOnNewPIR',
            'assignment_push': 'pushOnMessage',
            'user-created': 'emailOnNewPIR',
            'pir_assigned': 'emailOnNewPIR',
            'coach_changed': 'emailOnAlert',
            'goal_complete': 'emailOnGoalComplete',
            'message': 'pushOnMessage'
        };

        const prefKey = prefMap[notificationType];
        if (prefKey && prefs[prefKey] === false) {
            console.log(`🔕 Notification suppressed (user preference): ${notificationType} for user ${recipientId}`);
            return false;
        }

        return true;
    } catch (error) {
        console.error('Error checking notification preferences:', error);
        return true; // On error, allow notification
    }
};

/**
 * Create notification with preference checking
 * @param {object} notificationData - Notification data
 * @param {string} notificationType - Type of notification
 * @returns {object|null} Created notification reference
 */
window.createNotificationWithPreferences = async (notificationData, notificationType) => {
    try {
        const recipientId = notificationData.recipientId || notificationData.userId;
        if (!recipientId) {
            console.error('❌ Cannot create notification: no recipientId specified');
            return null;
        }

        const shouldSend = await window.shouldSendNotification(recipientId, notificationType);
        if (!shouldSend) {
            return null; // Notification suppressed
        }

        // Create the notification
        const notifRef = await window.db.collection('notifications').add({
            ...notificationData,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        console.log(`✅ Notification created: ${notificationType} for user ${recipientId}`);
        return notifRef;
    } catch (error) {
        console.error('Error creating notification:', error);
        throw error;
    }
};

// ==========================================
// TENANT STATUS CHECKING
// ==========================================

/**
 * Check tenant status and trial expiration
 * @param {string} tenantId - Tenant ID to check
 * @returns {object} Status object with suspended, trialExpired, isTrial, daysRemaining
 */
window.checkTenantStatus = async (tenantId) => {
    try {
        const tenantDoc = await window.db.collection('tenants').doc(tenantId).get();

        if (!tenantDoc.exists) {
            console.warn('⚠️ Tenant document not found:', tenantId);
            return { suspended: false, trialExpired: false, isTrial: false };
        }

        const tenantData = tenantDoc.data();
        const config = tenantData.config || {};
        const status = (config.status || 'Active').toLowerCase();

        // Check if suspended
        if (status === 'suspended') {
            return {
                suspended: true,
                trialExpired: false,
                isTrial: false,
                status: 'Suspended'
            };
        }

        // Check if trial and if expired
        if (status === 'trial') {
            const trialEndDate = config.trialEndDate;

            if (trialEndDate) {
                const now = new Date();
                const endDate = trialEndDate.toDate ? trialEndDate.toDate() : new Date(trialEndDate);
                const isExpired = now > endDate;

                if (isExpired) {
                    return {
                        suspended: false,
                        trialExpired: true,
                        isTrial: true,
                        status: 'Trial Expired',
                        trialEndDate: endDate
                    };
                }

                // Trial active - calculate days remaining
                const daysRemaining = Math.ceil((endDate - now) / (1000 * 60 * 60 * 24));

                return {
                    suspended: false,
                    trialExpired: false,
                    isTrial: true,
                    status: 'Trial',
                    trialEndDate: endDate,
                    daysRemaining: daysRemaining
                };
            }

            // Trial status but no end date - treat as active trial
            return {
                suspended: false,
                trialExpired: false,
                isTrial: true,
                status: 'Trial'
            };
        }

        // Active status
        return {
            suspended: false,
            trialExpired: false,
            isTrial: false,
            status: 'Active'
        };

    } catch (error) {
        console.error('Error checking tenant status:', error);
        // On error, allow access (fail open)
        return { suspended: false, trialExpired: false, isTrial: false };
    }
};

// ==========================================
// AUTHENTICATION HELPERS
// ==========================================

/**
 * Get current authenticated user from Firestore
 * @returns {object|null} User data or null
 */
window.getCurrentUser = async () => {
    try {
        const firebaseUser = window.auth.currentUser;
        if (!firebaseUser) return null;

        const userDoc = await window.db.collection('users').doc(firebaseUser.uid).get();
        if (!userDoc.exists) return null;

        const userData = {
            uid: firebaseUser.uid,
            ...userDoc.data()
        };

        // ==========================================
        // TENANT STATUS ENFORCEMENT
        // ==========================================
        // Check tenant status and enforce restrictions
        if (userData.tenantId && userData.role !== 'superadmin') {
            const tenantStatus = await window.checkTenantStatus(userData.tenantId);

            if (tenantStatus.suspended) {
                // Redirect to suspended page
                console.warn('⚠️ Tenant is suspended:', userData.tenantId);
                if (!window.location.pathname.includes('/admin/suspended')) {
                    window.location.href = '/admin/suspended';
                }
                return null;
            }

            if (tenantStatus.trialExpired) {
                // Redirect to suspended page (trial expired = suspended)
                console.warn('⚠️ Trial expired for tenant:', userData.tenantId);
                if (!window.location.pathname.includes('/admin/suspended')) {
                    window.location.href = '/admin/suspended';
                }
                return null;
            }

            // Attach tenant status to user data
            userData.tenantStatus = tenantStatus;
        }

        return userData;
    } catch (error) {
        console.error('Error getting current user:', error);
        return null;
    }
};

/**
 * Sign out current user
 */
window.signOutUser = async () => {
    try {
        await window.auth.signOut();
        window.location.href = '/admin/login';
    } catch (error) {
        console.error('Error signing out:', error);
        throw error;
    }
};

/**
 * Check if user has access to tenant
 * @param {object} user - User object
 * @param {string} tenantId - Tenant ID to check
 * @returns {boolean}
 */
window.canAccessTenant = (user, tenantId) => {
    if (!user) return false;

    // SuperAdmins can access all tenants
    if (window.isSuperAdmin(user)) return true;

    // Regular users can only access their own tenant
    return user.tenantId === tenantId;
};

/**
 * Redirect to login if not authenticated
 */
window.requireAuth = () => {
    window.auth.onAuthStateChanged(user => {
        if (!user) {
            window.location.href = '/admin/login';
        }
    });
};

/**
 * Redirect if user doesn't have required role
 * @param {object} user - User object
 * @param {string} requiredRole - Minimum required role
 */
window.requireRole = (user, requiredRole) => {
    if (!user || !window.hasPermission(user.role, requiredRole)) {
        alert('You do not have permission to access this page');
        window.location.href = '/admin/dashboard';
    }
};

console.log('✅ Authentication helpers loaded');
