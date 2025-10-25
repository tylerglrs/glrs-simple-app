// ==========================================
// SHARED FIREBASE CONFIGURATION
// ==========================================
// This file contains Firebase initialization and core utilities
// Used by all admin pages

// Check if Firebase SDK is loaded
if (typeof firebase === 'undefined') {
    console.error('❌ Firebase SDK not loaded! Make sure Firebase scripts are in <head> before this script.');
    throw new Error('Firebase SDK not loaded');
}

// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyAufSTHtCTFSEIeZ9YzvrULCnji5I-SMi0",
    authDomain: "glrs-pir-system.firebaseapp.com",
    projectId: "glrs-pir-system",
    storageBucket: "glrs-pir-system.firebasestorage.app",
    messagingSenderId: "830378577655",
    appId: "1:830378577655:web:8c5e0a9b0f3d2f1a0c9e8b"
};

// Initialize Firebase (check if already initialized)
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
    console.log('✅ Firebase initialized successfully');
} else {
    console.log('ℹ️ Firebase already initialized');
}

// Create instances and make them globally available
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();

// Also attach to window for compatibility
window.auth = auth;
window.db = db;
window.storage = storage;

// ==========================================
// MULTI-TENANT ARCHITECTURE
// ==========================================

// Tenant Detection Function
// Detects tenant from subdomain (e.g., tenant.glrecoveryservices.com)
// Falls back to 'glrs' for localhost and default domain
const getTenantId = () => {
    const hostname = window.location.hostname;

    // For localhost or IP addresses
    if (hostname === 'localhost' || hostname.match(/^\d+\.\d+\.\d+\.\d+$/)) {
        return 'glrs';
    }

    // Extract subdomain
    const parts = hostname.split('.');

    // For subdomain.glrecoveryservices.com
    if (parts.length >= 3) {
        const subdomain = parts[0];
        // Exclude common prefixes
        if (subdomain !== 'www' && subdomain !== 'app') {
            return subdomain;
        }
    }

    // Default tenant
    return 'glrs';
};

const CURRENT_TENANT = getTenantId();

// Attach to window for compatibility
window.CURRENT_TENANT = CURRENT_TENANT;
window.getTenantId = getTenantId;

// ==========================================
// AUDIT LOGGING (HIPAA COMPLIANCE)
// ==========================================

// Audit Logging Function for HIPAA Compliance
window.logAudit = async (action, details = {}) => {
    try {
        const currentUser = window.auth.currentUser;
        if (!currentUser) return;

        // Get user data for logging
        const userDoc = await window.db.collection('users').doc(currentUser.uid).get();
        const userData = userDoc.exists ? userDoc.data() : {};

        await window.db.collection('auditLogs').add({
            tenantId: details.tenantId || window.CURRENT_TENANT,
            userId: currentUser.uid,
            userEmail: currentUser.email,
            userName: userData.displayName || `${userData.firstName || ''} ${userData.lastName || ''}`.trim(),
            userRole: userData.role || 'unknown',
            action: action,
            targetUserId: details.targetUserId || null,
            targetResource: details.resource || null,
            resourceId: details.resourceId || null,
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            changes: details.changes || null,
            metadata: {
                userAgent: navigator.userAgent,
                url: window.location.href
            },
            success: details.success !== false
        });
    } catch (error) {
        console.error('Failed to log audit:', error);
        // Don't throw - audit logging should not break app functionality
    }
};

// ==========================================
// TENANT BRANDING SYSTEM
// ==========================================

let tenantConfig = null;

window.loadTenantBranding = async (tenantId) => {
    try {
        const tenantDoc = await window.db.collection('tenants').doc(tenantId).get();
        if (tenantDoc.exists) {
            tenantConfig = tenantDoc.data();
            window.applyTenantBranding(tenantConfig.config?.branding);
        } else {
            window.applyDefaultBranding();
        }
    } catch (error) {
        console.error('Error loading tenant branding:', error);
        // Use default branding
        window.applyDefaultBranding();
    }
};

window.applyTenantBranding = (branding) => {
    if (!branding) {
        window.applyDefaultBranding();
        return;
    }

    const root = document.documentElement;
    root.style.setProperty('--primary-color', branding.primaryColor || '#0077CC');
    root.style.setProperty('--secondary-color', branding.secondaryColor || '#008B8B');
    root.style.setProperty('--accent-color', branding.accentColor || '#FF8C00');

    // Update logo if provided
    if (branding.logoUrl) {
        const logoElements = document.querySelectorAll('.tenant-logo');
        logoElements.forEach(el => {
            el.src = branding.logoUrl;
            el.style.display = 'block';
        });
    }
};

window.applyDefaultBranding = () => {
    const root = document.documentElement;
    root.style.setProperty('--primary-color', '#0077CC');
    root.style.setProperty('--secondary-color', '#008B8B');
    root.style.setProperty('--accent-color', '#FF8C00');
};

// ==========================================
// DATA MIGRATION & VALIDATION UTILITIES
// ==========================================

const COLLECTIONS_TO_MIGRATE = [
    'users', 'checkIns', 'alerts', 'messages', 'goals', 'objectives',
    'assignments', 'meetings', 'supportGroups', 'topicRooms', 'resources',
    'milestones', 'pirNotes', 'notifications', 'moderationActions',
    'userWarnings', 'meetingAttendance', 'messageReactions', 'activities',
    'pledges', 'coachNotes', 'checkInReviews', 'sessionFlags'
];

window.migrateTenantData = async (tenantId, onProgress) => {
    console.log(`🔄 Starting migration for tenant: ${tenantId}`);
    let totalUpdated = 0;

    for (const collection of COLLECTIONS_TO_MIGRATE) {
        try {
            const snapshot = await window.db.collection(collection)
                .where('tenantId', '==', null)
                .limit(500)
                .get();

            if (snapshot.empty) {
                console.log(`✓ ${collection}: No documents to migrate`);
                continue;
            }

            const batch = window.db.batch();
            let batchCount = 0;

            snapshot.forEach(doc => {
                batch.update(doc.ref, { tenantId: tenantId });
                batchCount++;
            });

            if (batchCount > 0) {
                await batch.commit();
                totalUpdated += batchCount;
                console.log(`✓ ${collection}: Migrated ${batchCount} documents`);
                if (onProgress) onProgress(collection, batchCount);
            }
        } catch (error) {
            console.error(`✗ ${collection}: Migration failed`, error);
        }
    }

    console.log(`✅ Migration complete! Updated ${totalUpdated} documents`);
    return totalUpdated;
};

window.validateTenantData = async (tenantId) => {
    console.log(`🔍 Validating data for tenant: ${tenantId}`);
    const report = {};

    for (const collection of COLLECTIONS_TO_MIGRATE) {
        try {
            const totalSnap = await window.db.collection(collection).get();
            const tenantSnap = await window.db.collection(collection)
                .where('tenantId', '==', tenantId)
                .get();
            const nullSnap = await window.db.collection(collection)
                .where('tenantId', '==', null)
                .get();

            report[collection] = {
                total: totalSnap.size,
                withTenant: tenantSnap.size,
                missing: nullSnap.size
            };
        } catch (error) {
            report[collection] = { error: error.message };
        }
    }

    console.table(report);
    return report;
};

// Mark Firebase as ready
window.FIREBASE_READY = true;

console.log('✅ Firebase configuration loaded');
console.log(`🏢 Current tenant: ${window.CURRENT_TENANT}`);
