// ==========================================
// GRANULAR PERMISSIONS SYSTEM
// ==========================================
// Comprehensive permission management for GLRS Admin Portal
// Supports page access, action permissions, and data scope controls

// ==========================================
// PERMISSION PRESETS
// ==========================================

/**
 * SUPERADMIN1_PRESET - Default permissions for Portal-Level Super Admin
 * Full control within their portal only
 */
window.SUPERADMIN1_PRESET = {
    // PAGE ACCESS - ALL pages including Settings and Audit Logs
    access_dashboard: true,
    access_users: true,
    access_my_pirs: true,
    access_feedback: true,        // Legacy (merged into logs)
    access_resources: true,
    access_goals: true,
    access_community: true,
    access_communication: true,
    access_meetings: true,
    access_templates: true,
    access_checkins: true,
    access_alerts: true,
    access_reports: true,         // Legacy (merged into logs)
    access_logs: true,            // NEW: Merged Reports, Feedback, Audit Logs
    access_settings: true,        // ✅ YES for superadmin1
    access_audit_logs: true,      // Legacy (merged into logs)

    // ACTIONS - ALL actions enabled
    action_create_pir: true,
    action_delete_pir: true,
    action_create_resource: true,
    action_delete_resource: true,
    action_create_coach: true,
    action_create_admin: true,            // ✅ YES
    action_create_superadmin1: true,      // ✅ NEW - can create other superadmin1s
    action_modify_settings: true,
    action_export_data: true,
    action_view_audit_logs: true,
    action_impersonate: true,             // ✅ YES
    action_create_goal: true,
    action_create_assignment: true,
    action_send_message: true,

    // DATA SCOPE
    scope: 'all_pirs_portal'
};

/**
 * ADMIN_PRESET - Default permissions for Admin role
 * Broad access but cannot access settings or create admins by default
 */
window.ADMIN_PRESET = {
    // PAGE ACCESS - all except settings and audit logs
    access_dashboard: true,
    access_users: true,
    access_my_pirs: true,
    access_feedback: true,           // Legacy (merged into logs)
    access_resources: true,
    access_goals: true,
    access_community: true,
    access_communication: true,
    access_meetings: true,
    access_templates: true,
    access_checkins: true,
    access_alerts: true,
    access_reports: true,            // Legacy (merged into logs)
    access_logs: true,               // NEW: Merged Reports, Feedback, Audit Logs
    access_settings: false,          // ❌ NO - only superadmin1
    access_audit_logs: false,        // Legacy (merged into logs)

    // ACTIONS - toggleable by superadmin1
    action_create_pir: true,
    action_delete_pir: true,
    action_create_resource: true,
    action_delete_resource: true,
    action_create_coach: true,
    action_create_admin: false,      // ❌ NO by default (toggleable)
    action_create_superadmin1: false, // ❌ NO - only superadmin1
    action_modify_settings: false,   // ❌ NO
    action_export_data: true,
    action_view_audit_logs: false,
    action_impersonate: true,        // ✅ YES (changed from NO)
    action_create_goal: true,
    action_create_assignment: true,
    action_send_message: true,

    // DATA SCOPE
    scope: 'all_pirs_portal'
};

/**
 * COACH_PRESET - Default permissions for Coach role
 * Limited to working with assigned PIRs only
 */
window.COACH_PRESET = {
    // PAGE ACCESS - working pages only
    access_dashboard: true,
    access_users: false,             // ❌ NO - cannot manage staff
    access_my_pirs: true,            // ✅ PRIMARY workspace
    access_feedback: false,          // Legacy (merged into logs)
    access_resources: false,
    access_goals: true,
    access_community: true,
    access_communication: true,
    access_meetings: true,
    access_templates: true,
    access_checkins: true,
    access_alerts: true,
    access_reports: true,            // Legacy (merged into logs)
    access_logs: true,               // NEW: Merged Reports, Feedback, Audit Logs
    access_settings: false,
    access_audit_logs: false,        // Legacy (merged into logs)

    // ACTIONS - minimal permissions
    action_create_pir: false,        // ❌ NO - cannot onboard PIRs
    action_delete_pir: false,
    action_create_resource: false,
    action_delete_resource: false,
    action_create_coach: false,      // ❌ NO - cannot create coaches
    action_create_admin: false,
    action_create_superadmin1: false,
    action_modify_settings: false,
    action_export_data: false,
    action_view_audit_logs: false,
    action_impersonate: false,
    action_create_goal: true,
    action_create_assignment: true,
    action_send_message: true,

    // DATA SCOPE - CRITICAL
    scope: 'assigned_pirs'           // ✅ Only see assigned PIRs
};

// ==========================================
// HELPER FUNCTIONS
// ==========================================

/**
 * Get default permissions for role (used when permissions object missing)
 * @param {string} role - User role
 * @returns {object} Default permissions object
 */
window.getDefaultPermissions = (role) => {
    if (role === 'superadmin1') return window.SUPERADMIN1_PRESET;
    if (role === 'admin') return window.ADMIN_PRESET;
    if (role === 'coach') return window.COACH_PRESET;

    // Most restrictive for PIR or unknown
    return {
        // All page access false
        access_dashboard: false,
        access_users: false,
        access_my_pirs: false,
        access_feedback: false,
        access_resources: false,
        access_goals: false,
        access_community: false,
        access_communication: false,
        access_meetings: false,
        access_templates: false,
        access_checkins: false,
        access_alerts: false,
        access_reports: false,
        access_logs: false,
        access_settings: false,
        access_audit_logs: false,

        // All actions false
        action_create_pir: false,
        action_delete_pir: false,
        action_create_resource: false,
        action_delete_resource: false,
        action_create_coach: false,
        action_create_admin: false,
        action_create_superadmin1: false,
        action_modify_settings: false,
        action_export_data: false,
        action_view_audit_logs: false,
        action_impersonate: false,
        action_create_goal: false,
        action_create_assignment: false,
        action_send_message: false,

        // Most restrictive scope
        scope: 'own_data'
    };
};

/**
 * Check if user has specific permission
 * SuperAdmin and SuperAdmin1 bypass most checks
 * @param {object} user - User object with permissions
 * @param {string} permissionKey - Permission to check (e.g., 'access_dashboard', 'action_create_pir')
 * @returns {boolean}
 */
window.hasSpecificPermission = (user, permissionKey) => {
    // Global SuperAdmin bypass (all permissions)
    if (window.isSuperAdmin(user)) {
        return true;
    }

    // SuperAdmin1 bypass (all permissions within tenant)
    if (window.isSuperAdmin1(user)) {
        return true;
    }

    // Check if permissions object exists
    if (!user || !user.permissions) {
        console.warn(`User missing permissions object, using fallback for ${permissionKey}`);
        // Fallback to role-based preset
        const defaultPerms = window.getDefaultPermissions(user?.role);
        return defaultPerms?.[permissionKey] === true;
    }

    return user.permissions[permissionKey] === true;
};

/**
 * Check if user can access specific page
 * @param {object} user - User object
 * @param {string} pageName - Page name (e.g., 'dashboard', 'users', 'settings')
 * @returns {boolean}
 */
window.canAccessPage = (user, pageName) => {
    return window.hasSpecificPermission(user, `access_${pageName}`);
};

/**
 * Check if user can perform specific action
 * @param {object} user - User object
 * @param {string} actionName - Action name (e.g., 'create_pir', 'delete_resource')
 * @returns {boolean}
 */
window.canPerformAction = (user, actionName) => {
    return window.hasSpecificPermission(user, `action_${actionName}`);
};

/**
 * Get user's data scope
 * @param {object} user - User object
 * @returns {string} Data scope ('own_data', 'assigned_pirs', 'all_pirs_tenant', 'all_coaches_tenant', 'all_tenants')
 */
window.getDataScope = (user) => {
    // Global SuperAdmin has all_tenants scope
    if (window.isSuperAdmin(user)) {
        return 'all_tenants';
    }

    // SuperAdmin1 has all_pirs_tenant scope (within their tenant)
    if (window.isSuperAdmin1(user)) {
        return 'all_pirs_tenant';
    }

    if (!user || !user.permissions || !user.permissions.scope) {
        // Fallback based on role
        if (user?.role === 'admin') return 'all_pirs_tenant';
        if (user?.role === 'coach') return 'assigned_pirs';
        return 'own_data';
    }

    return user.permissions.scope;
};

/**
 * Apply data scope to Firestore query for PIR filtering
 * @param {Query} baseQuery - Base Firestore query
 * @param {object} user - User object
 * @param {string} tenantId - Current tenant ID
 * @returns {Query} Modified query with scope applied
 */
window.applyScopeToPIRQuery = (baseQuery, user, tenantId) => {
    const scope = window.getDataScope(user);

    // Global SuperAdmin - no filtering
    if (scope === 'all_portals') {
        return baseQuery;
    }

    // SuperAdmin1 or all_pirs_portal - filter by portal
    if (scope === 'all_pirs_portal') {
        return baseQuery.where('tenantId', '==', tenantId);
    }

    // assigned_pirs - filter to assigned PIRs only
    if (scope === 'assigned_pirs') {
        return baseQuery
            .where('tenantId', '==', tenantId)
            .where('assignedCoach', '==', user.uid);
    }

    // own_data - filter to user's own data
    if (scope === 'own_data') {
        return baseQuery
            .where('tenantId', '==', tenantId)
            .where('uid', '==', user.uid);
    }

    // Default: tenant filtering
    return baseQuery.where('tenantId', '==', tenantId);
};

/**
 * Check if user can edit permissions (only superadmin and superadmin1)
 * @param {object} user - User object
 * @returns {boolean}
 */
window.canEditPermissions = (user) => {
    return window.isSuperAdmin(user) || window.isSuperAdmin1(user);
};

/**
 * Ensure user has permissions object (apply defaults if missing)
 * @param {object} user - User object
 * @returns {object} User object with permissions
 */
window.ensurePermissions = (user) => {
    if (!user) return null;

    if (!user.permissions) {
        console.warn('User missing permissions object, applying default preset for role:', user.role);
        return {
            ...user,
            permissions: window.getDefaultPermissions(user.role)
        };
    }

    return user;
};

/**
 * Get list of assigned PIR IDs for a coach
 * @param {object} user - User object (must be coach)
 * @param {string} tenantId - Current tenant ID
 * @returns {Promise<Array<string>>} Array of PIR user IDs
 */
window.getAssignedPIRIds = async (user, tenantId) => {
    try {
        const pirsSnap = await window.db.collection('users')
            .where('tenantId', '==', tenantId)
            .where('role', '==', 'pir')
            .where('assignedCoach', '==', user.uid)
            .get();

        return pirsSnap.docs.map(doc => doc.id);
    } catch (error) {
        console.error('Error loading assigned PIR IDs:', error);
        return [];
    }
};

/**
 * Check if data belongs to user's scope
 * Used for filtering data client-side after fetching
 * @param {object} user - User object
 * @param {object} dataItem - Data item with userId or assignedCoach
 * @param {string} tenantId - Current tenant ID
 * @returns {boolean}
 */
window.isInUserScope = (user, dataItem, tenantId) => {
    const scope = window.getDataScope(user);

    // Global SuperAdmin sees everything
    if (scope === 'all_tenants') {
        return true;
    }

    // Check tenant match first
    if (dataItem.tenantId && dataItem.tenantId !== tenantId) {
        return false;
    }

    // all_pirs_tenant - all data in tenant
    if (scope === 'all_pirs_tenant') {
        return dataItem.tenantId === tenantId;
    }

    // assigned_pirs - only assigned data
    if (scope === 'assigned_pirs') {
        return dataItem.assignedCoach === user.uid || dataItem.userId === user.uid;
    }

    // own_data - only own data
    if (scope === 'own_data') {
        return dataItem.userId === user.uid || dataItem.uid === user.uid;
    }

    return false;
};

console.log('✅ Permissions system loaded');
