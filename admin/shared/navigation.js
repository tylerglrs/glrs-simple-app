// ==========================================
// SHARED NAVIGATION COMPONENT
// ==========================================
// Sidebar navigation for all admin pages
// Extracted from admin.html lines 2445-2739
// Adapted for URL-based navigation

// Note: This file uses React (must be loaded before this script)
const { useState, useEffect, useRef } = React;

/**
 * Sidebar Navigation Component
 *
 * Features:
 * - URL-based active page detection
 * - Role-based menu visibility
 * - Tenant switcher for SuperAdmins
 * - Mobile responsive with hamburger menu
 * - Collapsible sidebar
 *
 * Usage:
 *   <Sidebar user={user} collapsed={collapsed} onCollapsedChange={setCollapsed} />
 */
function Sidebar({ user, collapsed = false, onCollapsedChange = null }) {
    console.log('🔵 SIDEBAR V7 LOADED - Fixed React hooks infinite loop');
    const [showTenantModal, setShowTenantModal] = useState(false);
    const [showNewTenantModal, setShowNewTenantModal] = useState(false);
    const [showManageTenantModal, setShowManageTenantModal] = useState(false);
    const [managingTenant, setManagingTenant] = useState(null);
    const [tenantUsageStats, setTenantUsageStats] = useState({ pirCount: '...', coachCount: '...' });
    const [tenants, setTenants] = useState([]);
    const [currentTenant, setCurrentTenant] = useState(window.CURRENT_TENANT || 'full-service');
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [newTenantData, setNewTenantData] = useState({
        tenantId: '',
        companyName: '',
        contactEmail: '',
        contactPhone: '',
        timezone: 'America/New_York',
        logoUrl: '',
        subscriptionTier: 'Professional',
        maxPirs: 100,
        maxCoaches: 10,
        status: 'Active',
        trialEndDate: '',
        adminFirstName: '',
        adminLastName: '',
        adminEmail: '',
        adminPassword: ''
    });

    // Use internal state if parent doesn't provide collapsed control
    const [internalCollapsed, setInternalCollapsed] = useState(() => {
        // Restore collapsed state from preferences
        return window.getPreference ? window.getPreference('sidebarCollapsed', false) : false;
    });

    // Use prop if provided, otherwise use internal state
    const isCollapsed = onCollapsedChange ? collapsed : internalCollapsed;
    const setCollapsed = onCollapsedChange || setInternalCollapsed;

    // Detect current page from URL
    const getCurrentPage = () => {
        const path = window.location.pathname;
        // Extract page name from /admin/pagename or /admin/pagename.html
        const match = path.match(/\/admin\/([^/.]+)/);
        return match ? match[1] : 'dashboard';
    };

    const [currentView, setCurrentView] = useState(getCurrentPage());

    // Mobile responsiveness
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
            if (window.innerWidth >= 768) {
                setMobileMenuOpen(false);
            }
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Load tenants for SuperAdmin
    useEffect(() => {
        if (user && window.isSuperAdmin && window.isSuperAdmin(user)) {
            const loadTenants = async () => {
                try {
                    const tenantsSnap = await window.db.collection('tenants').get();
                    const tenantsData = tenantsSnap.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data()
                    }));
                    setTenants(tenantsData);
                } catch (error) {
                    console.error('Error loading tenants:', error);
                }
            };
            loadTenants();
        }
    }, [user]);

    // Subscription tier configuration
    const SUBSCRIPTION_TIERS = {
        'Starter': { maxPirs: 25, maxCoaches: 2 },
        'Professional': { maxPirs: 100, maxCoaches: 10 },
        'Enterprise': { maxPirs: 500, maxCoaches: 50 },
        'Unlimited': { maxPirs: 9999, maxCoaches: 999 }
    };

    // Auto-fill max limits when tier changes
    useEffect(() => {
        const tierLimits = SUBSCRIPTION_TIERS[newTenantData.subscriptionTier];
        if (tierLimits) {
            setNewTenantData(prev => ({
                ...prev,
                maxPirs: tierLimits.maxPirs,
                maxCoaches: tierLimits.maxCoaches
            }));
        }
    }, [newTenantData.subscriptionTier]);

    // Save collapsed state preference
    useEffect(() => {
        if (window.savePreference) {
            window.savePreference('sidebarCollapsed', isCollapsed);
        }
    }, [isCollapsed]);

    // Load tenant usage stats when managing a tenant
    useEffect(() => {
        if (managingTenant && managingTenant.id) {
            // Reset to loading state
            setTenantUsageStats({ pirCount: '...', coachCount: '...' });

            // Load PIR count
            window.db.collection('users')
                .where('tenantId', '==', managingTenant.id)
                .where('role', '==', 'pir')
                .get()
                .then(snap => {
                    setTenantUsageStats(prev => ({ ...prev, pirCount: snap.size }));
                })
                .catch(() => {
                    setTenantUsageStats(prev => ({ ...prev, pirCount: 'Error' }));
                });

            // Load Coach count
            window.db.collection('users')
                .where('tenantId', '==', managingTenant.id)
                .where('role', 'in', ['coach', 'admin'])
                .get()
                .then(snap => {
                    setTenantUsageStats(prev => ({ ...prev, coachCount: snap.size }));
                })
                .catch(() => {
                    setTenantUsageStats(prev => ({ ...prev, coachCount: 'Error' }));
                });
        }
    }, [managingTenant]);

    // Menu items configuration
    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: '📊', path: '/admin/dashboard' },
        { id: 'users', label: 'Users', icon: '👥', path: '/admin/users', minRole: 'admin' },
        { id: 'mypirs', label: 'My PIRs', icon: '🎯', path: '/admin/mypirs', minRole: 'coach' },
        { id: 'feedback', label: 'Feedback', icon: '📝', path: '/admin/feedback' },
        { id: 'resources', label: 'Resources', icon: '📚', path: '/admin/resources' },
        { id: 'goals', label: 'Goals', icon: '🏆', path: '/admin/goals' },
        { id: 'community', label: 'Community', icon: '💬', path: '/admin/community' },
        { id: 'checkins', label: 'Check-ins', icon: '✅', path: '/admin/checkins' },
        { id: 'alerts', label: 'Alerts', icon: '🚨', path: '/admin/alerts' },
        { id: 'reports', label: 'Reports', icon: '📈', path: '/admin/reports' },
        { id: 'settings', label: 'Settings', icon: '⚙️', path: '/admin/settings' }
    ];

    // Add Audit Logs for SuperAdmin
    if (user && window.isSuperAdmin && window.isSuperAdmin(user)) {
        menuItems.push({ id: 'auditlogs', label: 'Audit Logs', icon: '📋', path: '/admin/auditlogs' });
    }

    // Filter menu items based on user role
    const visibleMenuItems = menuItems.filter(item => {
        if (!item.minRole) return true;
        if (!user || !window.hasPermission) return false;
        return window.hasPermission(user.role, item.minRole);
    });

    // Navigation handler (URL-based)
    const handleNavigation = (path) => {
        window.location.href = path;
    };

    // Logout handler
    const handleLogout = async () => {
        try {
            await window.auth.signOut();
            window.location.href = '/admin/login';
        } catch (error) {
            console.error('Logout error:', error);
            alert('Error logging out. Please try again.');
        }
    };

    return (
        <>
            {/* Mobile Menu Toggle */}
            {isMobile && (
                <button
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    style={{
                        position: 'fixed',
                        top: '15px',
                        left: '15px',
                        zIndex: 1001,
                        background: 'linear-gradient(135deg, #0077CC 0%, #005A9C 100%)',
                        border: 'none',
                        color: 'white',
                        padding: '12px 16px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '20px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                    }}
                >
                    ☰
                </button>
            )}

            {/* Sidebar */}
            <div style={{
                width: isMobile ? '280px' : (isCollapsed ? '80px' : '280px'),
                background: 'linear-gradient(180deg, #0077CC 0%, #005A9C 100%)',
                height: '100vh',
                position: 'fixed',
                left: isMobile ? (mobileMenuOpen ? 0 : '-280px') : 0,
                top: 0,
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '4px 0 12px rgba(0,0,0,0.15)',
                transition: 'left 0.3s, width 0.3s',
                zIndex: 1000,
                overflowY: 'auto',
                overflowX: 'hidden'
            }}>
                {/* Header */}
                <div style={{
                    padding: '20px',
                    borderBottom: '1px solid rgba(255,255,255,0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                }}>
                    {!isCollapsed && (
                        <div style={{ color: 'white', fontSize: '20px', fontWeight: 'bold' }}>
                            🛡️ GLRS Admin
                        </div>
                    )}
                    <button
                        onClick={() => setCollapsed(!isCollapsed)}
                        style={{
                            background: 'rgba(255,255,255,0.2)',
                            border: 'none',
                            color: 'white',
                            padding: '8px 12px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '16px'
                        }}
                    >
                        {isCollapsed ? '→' : '←'}
                    </button>
                </div>

                {/* User Profile */}
                {user && (
                    <div style={{
                        padding: '20px',
                        borderBottom: '1px solid rgba(255,255,255,0.2)',
                        display: isCollapsed ? 'none' : 'block'
                    }}>
                        <div style={{
                            background: 'rgba(255,255,255,0.1)',
                            borderRadius: '12px',
                            padding: '15px',
                            color: 'white'
                        }}>
                            <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>
                                {user.displayName || `${user.firstName || ''} ${user.lastName || ''}`.trim()}
                            </div>
                            <div style={{ fontSize: '13px', opacity: 0.9, marginBottom: '8px' }}>
                                {user.email}
                            </div>
                            <div style={{
                                display: 'inline-block',
                                background: 'rgba(255,255,255,0.3)',
                                padding: '4px 12px',
                                borderRadius: '20px',
                                fontSize: '12px',
                                fontWeight: '600'
                            }}>
                                {user.role?.toUpperCase() || 'USER'}
                            </div>
                        </div>
                    </div>
                )}

                {/* Navigation Menu */}
                <div style={{ flex: 1, padding: '10px', overflowY: 'auto' }}>
                    {visibleMenuItems.map(item => (
                        <div
                            key={item.id}
                            onClick={() => handleNavigation(item.path)}
                            style={{
                                padding: isCollapsed ? '16px 0' : '16px 20px',
                                margin: '4px 0',
                                borderRadius: '10px',
                                cursor: 'pointer',
                                background: currentView === item.id
                                    ? 'rgba(255,255,255,0.25)'
                                    : 'transparent',
                                color: 'white',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                transition: 'all 0.2s',
                                fontWeight: currentView === item.id ? '600' : 'normal',
                                justifyContent: isCollapsed ? 'center' : 'flex-start'
                            }}
                            onMouseEnter={(e) => {
                                if (currentView !== item.id) {
                                    e.currentTarget.style.background = 'rgba(255,255,255,0.15)';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (currentView !== item.id) {
                                    e.currentTarget.style.background = 'transparent';
                                }
                            }}
                        >
                            <span style={{ fontSize: '20px' }}>{item.icon}</span>
                            {!isCollapsed && <span style={{ fontSize: '15px' }}>{item.label}</span>}
                        </div>
                    ))}
                </div>

                {/* Tenant Switcher (SuperAdmin Only) */}
                {user && window.isSuperAdmin && window.isSuperAdmin(user) && !isCollapsed && (
                    <div style={{
                        padding: '15px',
                        borderTop: '1px solid rgba(255,255,255,0.2)',
                        background: 'rgba(0,0,0,0.2)'
                    }}>
                        <div style={{ color: 'white', fontSize: '12px', marginBottom: '8px', opacity: 0.8 }}>
                            Current Portal
                        </div>
                        <div style={{
                            background: 'rgba(255,255,255,0.1)',
                            padding: '10px',
                            borderRadius: '6px',
                            color: 'white',
                            fontSize: '14px',
                            fontWeight: '600',
                            marginBottom: '10px'
                        }}>
                            {currentTenant.toUpperCase()}
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                                onClick={async () => {
                                    // Load current tenant data for management
                                    try {
                                        const tenantDoc = await window.db.collection('tenants').doc(currentTenant).get();
                                        if (tenantDoc.exists) {
                                            setManagingTenant({ id: currentTenant, ...tenantDoc.data() });
                                            setShowManageTenantModal(true);
                                        } else {
                                            alert('Tenant data not found');
                                        }
                                    } catch (error) {
                                        console.error('Error loading tenant:', error);
                                        alert('Error loading tenant data');
                                    }
                                }}
                                style={{
                                    flex: 1,
                                    padding: '10px',
                                    background: 'rgba(255,255,255,0.2)',
                                    border: '1px solid rgba(255,255,255,0.3)',
                                    color: 'white',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    fontSize: '13px',
                                    fontWeight: '600'
                                }}
                            >
                                Manage
                            </button>
                            <button
                                onClick={() => setShowNewTenantModal(true)}
                                style={{
                                    flex: 1,
                                    padding: '10px',
                                    background: 'linear-gradient(135deg, #00C853 0%, #00A040 100%)',
                                    border: 'none',
                                    color: 'white',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    fontSize: '13px',
                                    fontWeight: '600',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '4px'
                                }}
                            >
                                <span style={{ fontSize: '16px' }}>+</span>
                                New
                            </button>
                        </div>
                    </div>
                )}

                {/* Logout Button */}
                <div style={{
                    padding: '15px',
                    borderTop: '1px solid rgba(255,255,255,0.2)'
                }}>
                    <button
                        onClick={handleLogout}
                        style={{
                            width: '100%',
                            padding: isCollapsed ? '12px 0' : '12px 20px',
                            background: 'rgba(220,20,60,0.8)',
                            border: 'none',
                            color: 'white',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: '600',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px'
                        }}
                    >
                        <span>🚪</span>
                        {!isCollapsed && <span>Logout</span>}
                    </button>
                </div>
            </div>

            {/* Tenant Switcher Modal */}
            {showTenantModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 2000
                }}>
                    <div style={{
                        background: 'white',
                        padding: '30px',
                        borderRadius: '12px',
                        maxWidth: '500px',
                        width: '90%',
                        maxHeight: '80vh',
                        overflowY: 'auto'
                    }}>
                        <h2 style={{ marginTop: 0 }}>Switch Portal</h2>
                        <p>Select a portal to manage:</p>
                        <div style={{ marginTop: '20px' }}>
                            {tenants.map(tenant => (
                                <div
                                    key={tenant.id}
                                    onClick={() => {
                                        window.location.href = `https://${tenant.id}.glrecoveryservices.com/admin/dashboard`;
                                    }}
                                    style={{
                                        padding: '15px',
                                        marginBottom: '10px',
                                        background: tenant.id === currentTenant ? '#E3F2FD' : '#f5f5f5',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        border: tenant.id === currentTenant ? '2px solid #0077CC' : '1px solid #ddd'
                                    }}
                                >
                                    <div style={{ fontWeight: '600', marginBottom: '4px' }}>
                                        {tenant.config?.companyName || tenant.id}
                                    </div>
                                    <div style={{ fontSize: '12px', color: '#666' }}>
                                        Portal: {tenant.id}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button
                            onClick={() => setShowTenantModal(false)}
                            style={{
                                marginTop: '20px',
                                padding: '10px 20px',
                                background: '#ddd',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer'
                            }}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {/* New Tenant Modal */}
            {showNewTenantModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 2000
                }}>
                    <div style={{
                        background: 'white',
                        padding: '30px',
                        borderRadius: '12px',
                        maxWidth: '500px',
                        width: '90%',
                        maxHeight: '80vh',
                        overflowY: 'auto'
                    }}>
                        <h2 style={{ marginTop: 0, marginBottom: '10px' }}>Create New Tenant</h2>
                        <p style={{ color: '#666', marginBottom: '25px' }}>Set up a new tenant organization</p>

                        <form onSubmit={async (e) => {
                            e.preventDefault();
                            let secondaryApp;
                            try {
                                // Step 1: Create admin user account using secondary Firebase app
                                try {
                                    secondaryApp = window.firebase.app('SecondaryApp');
                                    await secondaryApp.delete();
                                } catch (e) {
                                    // App doesn't exist, continue
                                }

                                secondaryApp = window.firebase.initializeApp(window.firebaseConfig, 'SecondaryApp');
                                const secondaryAuth = secondaryApp.auth();

                                const userCredential = await secondaryAuth.createUserWithEmailAndPassword(
                                    newTenantData.adminEmail,
                                    newTenantData.adminPassword
                                );

                                const adminUid = userCredential.user.uid;

                                // Step 2: Create admin user document
                                await window.db.collection('users').doc(adminUid).set({
                                    tenantId: newTenantData.tenantId,
                                    email: newTenantData.adminEmail,
                                    displayName: `${newTenantData.adminFirstName} ${newTenantData.adminLastName}`,
                                    firstName: newTenantData.adminFirstName,
                                    lastName: newTenantData.adminLastName,
                                    role: 'admin',
                                    active: true,
                                    createdAt: window.firebase.firestore.FieldValue.serverTimestamp()
                                });

                                // Step 3: Create tenant document in Firestore
                                const tenantConfig = {
                                    companyName: newTenantData.companyName,
                                    contactEmail: newTenantData.contactEmail,
                                    contactPhone: newTenantData.contactPhone,
                                    timezone: newTenantData.timezone,
                                    logoUrl: newTenantData.logoUrl,
                                    maxPirs: parseInt(newTenantData.maxPirs),
                                    maxCoaches: parseInt(newTenantData.maxCoaches),
                                    subscriptionTier: newTenantData.subscriptionTier,
                                    status: newTenantData.status
                                };

                                // Add trial end date if status is Trial
                                if (newTenantData.status === 'Trial' && newTenantData.trialEndDate) {
                                    tenantConfig.trialEndDate = window.firebase.firestore.Timestamp.fromDate(new Date(newTenantData.trialEndDate));
                                }

                                await window.db.collection('tenants').doc(newTenantData.tenantId).set({
                                    config: tenantConfig,
                                    adminUid: adminUid,
                                    createdAt: window.firebase.firestore.FieldValue.serverTimestamp(),
                                    createdBy: user.uid,
                                    status: newTenantData.status.toLowerCase()
                                });

                                // Step 4: Clean up secondary app
                                await secondaryApp.delete();

                                // Step 5: Log audit
                                if (window.logAudit) {
                                    await window.logAudit('tenant_created', {
                                        tenantId: newTenantData.tenantId,
                                        companyName: newTenantData.companyName,
                                        adminEmail: newTenantData.adminEmail
                                    });
                                }

                                alert(`✅ Tenant "${newTenantData.companyName}" created successfully!\n\nAdmin: ${newTenantData.adminFirstName} ${newTenantData.adminLastName}\nEmail: ${newTenantData.adminEmail}`);
                                setShowNewTenantModal(false);
                                setNewTenantData({
                                    tenantId: '', companyName: '', contactEmail: '', contactPhone: '',
                                    timezone: 'America/New_York', logoUrl: '', subscriptionTier: 'Professional',
                                    maxPirs: 100, maxCoaches: 10, status: 'Active',
                                    adminFirstName: '', adminLastName: '', adminEmail: '', adminPassword: ''
                                });

                                // Step 6: Reload tenants list
                                const tenantsSnap = await window.db.collection('tenants').get();
                                const tenantsData = tenantsSnap.docs.map(doc => ({
                                    id: doc.id,
                                    ...doc.data()
                                }));
                                setTenants(tenantsData);
                            } catch (error) {
                                console.error('Error creating tenant:', error);
                                alert('❌ Error creating tenant: ' + error.message);
                                // Clean up secondary app if it exists
                                if (secondaryApp) {
                                    try {
                                        await secondaryApp.delete();
                                    } catch (e) {
                                        // Ignore
                                    }
                                }
                            }
                        }}>
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '14px' }}>
                                    Tenant ID (slug) *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={newTenantData.tenantId}
                                    onChange={(e) => setNewTenantData({ ...newTenantData, tenantId: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
                                    placeholder="company-name"
                                    style={{
                                        width: '100%',
                                        padding: '10px',
                                        border: '1px solid #ddd',
                                        borderRadius: '6px',
                                        fontSize: '14px',
                                        boxSizing: 'border-box'
                                    }}
                                />
                                <small style={{ color: '#666', fontSize: '12px' }}>Lowercase letters, numbers, and hyphens only</small>
                            </div>

                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '14px' }}>
                                    Company Name *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={newTenantData.companyName}
                                    onChange={(e) => setNewTenantData({ ...newTenantData, companyName: e.target.value })}
                                    placeholder="Acme Corporation"
                                    style={{
                                        width: '100%',
                                        padding: '10px',
                                        border: '1px solid #ddd',
                                        borderRadius: '6px',
                                        fontSize: '14px',
                                        boxSizing: 'border-box'
                                    }}
                                />
                            </div>

                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '14px' }}>
                                    Contact Email *
                                </label>
                                <input
                                    type="email"
                                    required
                                    value={newTenantData.contactEmail}
                                    onChange={(e) => setNewTenantData({ ...newTenantData, contactEmail: e.target.value })}
                                    placeholder="contact@company.com"
                                    style={{
                                        width: '100%',
                                        padding: '10px',
                                        border: '1px solid #ddd',
                                        borderRadius: '6px',
                                        fontSize: '14px',
                                        boxSizing: 'border-box'
                                    }}
                                />
                            </div>

                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '14px' }}>
                                    Contact Phone
                                </label>
                                <input
                                    type="tel"
                                    value={newTenantData.contactPhone}
                                    onChange={(e) => setNewTenantData({ ...newTenantData, contactPhone: e.target.value })}
                                    placeholder="+1 (555) 123-4567"
                                    style={{
                                        width: '100%',
                                        padding: '10px',
                                        border: '1px solid #ddd',
                                        borderRadius: '6px',
                                        fontSize: '14px',
                                        boxSizing: 'border-box'
                                    }}
                                />
                            </div>

                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '14px' }}>
                                    Timezone *
                                </label>
                                <select
                                    required
                                    value={newTenantData.timezone}
                                    onChange={(e) => setNewTenantData({ ...newTenantData, timezone: e.target.value })}
                                    style={{
                                        width: '100%',
                                        padding: '10px',
                                        border: '1px solid #ddd',
                                        borderRadius: '6px',
                                        fontSize: '14px',
                                        boxSizing: 'border-box',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <option value="America/New_York">Eastern Time (ET)</option>
                                    <option value="America/Chicago">Central Time (CT)</option>
                                    <option value="America/Denver">Mountain Time (MT)</option>
                                    <option value="America/Phoenix">Arizona Time (MST)</option>
                                    <option value="America/Los_Angeles">Pacific Time (PT)</option>
                                    <option value="America/Anchorage">Alaska Time (AKT)</option>
                                    <option value="Pacific/Honolulu">Hawaii Time (HT)</option>
                                </select>
                            </div>

                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '14px' }}>
                                    Logo URL (optional)
                                </label>
                                <input
                                    type="url"
                                    value={newTenantData.logoUrl}
                                    onChange={(e) => setNewTenantData({ ...newTenantData, logoUrl: e.target.value })}
                                    placeholder="https://example.com/logo.png"
                                    style={{
                                        width: '100%',
                                        padding: '10px',
                                        border: '1px solid #ddd',
                                        borderRadius: '6px',
                                        fontSize: '14px',
                                        boxSizing: 'border-box'
                                    }}
                                />
                            </div>

                            <h3 style={{ fontSize: '16px', fontWeight: '600', marginTop: '30px', marginBottom: '15px', color: '#333' }}>
                                📊 Subscription & Limits
                            </h3>

                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '14px' }}>
                                    Subscription Tier *
                                </label>
                                <select
                                    required
                                    value={newTenantData.subscriptionTier}
                                    onChange={(e) => setNewTenantData({ ...newTenantData, subscriptionTier: e.target.value })}
                                    style={{
                                        width: '100%',
                                        padding: '10px',
                                        border: '1px solid #ddd',
                                        borderRadius: '6px',
                                        fontSize: '14px',
                                        boxSizing: 'border-box',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <option value="Starter">Starter (25 PIRs, 2 Coaches)</option>
                                    <option value="Professional">Professional (100 PIRs, 10 Coaches)</option>
                                    <option value="Enterprise">Enterprise (500 PIRs, 50 Coaches)</option>
                                    <option value="Unlimited">Unlimited (9999 PIRs, 999 Coaches)</option>
                                </select>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '14px' }}>
                                        Max PIRs *
                                    </label>
                                    <input
                                        type="number"
                                        required
                                        min="1"
                                        value={newTenantData.maxPirs}
                                        onChange={(e) => setNewTenantData({ ...newTenantData, maxPirs: e.target.value })}
                                        style={{
                                            width: '100%',
                                            padding: '10px',
                                            border: '1px solid #ddd',
                                            borderRadius: '6px',
                                            fontSize: '14px',
                                            boxSizing: 'border-box'
                                        }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '14px' }}>
                                        Max Coaches *
                                    </label>
                                    <input
                                        type="number"
                                        required
                                        min="1"
                                        value={newTenantData.maxCoaches}
                                        onChange={(e) => setNewTenantData({ ...newTenantData, maxCoaches: e.target.value })}
                                        style={{
                                            width: '100%',
                                            padding: '10px',
                                            border: '1px solid #ddd',
                                            borderRadius: '6px',
                                            fontSize: '14px',
                                            boxSizing: 'border-box'
                                        }}
                                    />
                                </div>
                            </div>

                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '14px' }}>
                                    Status *
                                </label>
                                <select
                                    required
                                    value={newTenantData.status}
                                    onChange={(e) => setNewTenantData({ ...newTenantData, status: e.target.value })}
                                    style={{
                                        width: '100%',
                                        padding: '10px',
                                        border: '1px solid #ddd',
                                        borderRadius: '6px',
                                        fontSize: '14px',
                                        boxSizing: 'border-box',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <option value="Active">Active</option>
                                    <option value="Trial">Trial</option>
                                    <option value="Suspended">Suspended</option>
                                </select>
                            </div>

                            {newTenantData.status === 'Trial' && (
                                <div style={{ marginBottom: '20px' }}>
                                    <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '14px' }}>
                                        Trial End Date {newTenantData.status === 'Trial' ? '*' : '(Optional)'}
                                    </label>
                                    <input
                                        type="date"
                                        required={newTenantData.status === 'Trial'}
                                        value={newTenantData.trialEndDate}
                                        onChange={(e) => setNewTenantData({ ...newTenantData, trialEndDate: e.target.value })}
                                        min={new Date().toISOString().split('T')[0]}
                                        style={{
                                            width: '100%',
                                            padding: '10px',
                                            border: '1px solid #ddd',
                                            borderRadius: '6px',
                                            fontSize: '14px',
                                            boxSizing: 'border-box'
                                        }}
                                    />
                                    <small style={{ color: '#666', fontSize: '12px' }}>
                                        Tenant will be automatically suspended after this date
                                    </small>
                                </div>
                            )}

                            <h3 style={{ fontSize: '16px', fontWeight: '600', marginTop: '30px', marginBottom: '15px', color: '#333' }}>
                                👤 Create Admin Account
                            </h3>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '14px' }}>
                                        First Name *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={newTenantData.adminFirstName}
                                        onChange={(e) => setNewTenantData({ ...newTenantData, adminFirstName: e.target.value })}
                                        placeholder="John"
                                        style={{
                                            width: '100%',
                                            padding: '10px',
                                            border: '1px solid #ddd',
                                            borderRadius: '6px',
                                            fontSize: '14px',
                                            boxSizing: 'border-box'
                                        }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '14px' }}>
                                        Last Name *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={newTenantData.adminLastName}
                                        onChange={(e) => setNewTenantData({ ...newTenantData, adminLastName: e.target.value })}
                                        placeholder="Doe"
                                        style={{
                                            width: '100%',
                                            padding: '10px',
                                            border: '1px solid #ddd',
                                            borderRadius: '6px',
                                            fontSize: '14px',
                                            boxSizing: 'border-box'
                                        }}
                                    />
                                </div>
                            </div>

                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '14px' }}>
                                    Admin Email *
                                </label>
                                <input
                                    type="email"
                                    required
                                    value={newTenantData.adminEmail}
                                    onChange={(e) => setNewTenantData({ ...newTenantData, adminEmail: e.target.value })}
                                    placeholder="admin@company.com"
                                    style={{
                                        width: '100%',
                                        padding: '10px',
                                        border: '1px solid #ddd',
                                        borderRadius: '6px',
                                        fontSize: '14px',
                                        boxSizing: 'border-box'
                                    }}
                                />
                            </div>

                            <div style={{ marginBottom: '25px' }}>
                                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '14px' }}>
                                    Admin Password *
                                </label>
                                <input
                                    type="password"
                                    required
                                    minLength="6"
                                    value={newTenantData.adminPassword}
                                    onChange={(e) => setNewTenantData({ ...newTenantData, adminPassword: e.target.value })}
                                    placeholder="Minimum 6 characters"
                                    style={{
                                        width: '100%',
                                        padding: '10px',
                                        border: '1px solid #ddd',
                                        borderRadius: '6px',
                                        fontSize: '14px',
                                        boxSizing: 'border-box'
                                    }}
                                />
                                <small style={{ color: '#666', fontSize: '12px' }}>Minimum 6 characters</small>
                            </div>

                            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowNewTenantModal(false);
                                        setNewTenantData({ tenantId: '', companyName: '', adminEmail: '', adminName: '' });
                                    }}
                                    style={{
                                        padding: '10px 20px',
                                        background: '#ddd',
                                        border: 'none',
                                        borderRadius: '6px',
                                        cursor: 'pointer',
                                        fontSize: '14px',
                                        fontWeight: '600'
                                    }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    style={{
                                        padding: '10px 20px',
                                        background: 'linear-gradient(135deg, #00C853 0%, #00A040 100%)',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '6px',
                                        cursor: 'pointer',
                                        fontSize: '14px',
                                        fontWeight: '600'
                                    }}
                                >
                                    Create Tenant
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Manage Tenant Modal */}
            {showManageTenantModal && managingTenant && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 2000
                }}>
                    <div style={{
                        background: 'white',
                        padding: '30px',
                        borderRadius: '12px',
                        maxWidth: '600px',
                        width: '90%',
                        maxHeight: '85vh',
                        overflowY: 'auto'
                    }}>
                        <h2 style={{ marginTop: 0, marginBottom: '5px' }}>
                            🏢 Manage Tenant
                        </h2>
                        <p style={{ color: '#666', marginBottom: '25px', fontSize: '14px' }}>
                            {managingTenant.config?.companyName || managingTenant.id}
                        </p>

                        {/* Current Usage Statistics */}
                        <div style={{
                            background: '#f5f5f5',
                            padding: '20px',
                            borderRadius: '8px',
                            marginBottom: '25px'
                        }}>
                            <h3 style={{ fontSize: '15px', fontWeight: '600', marginTop: 0, marginBottom: '15px', color: '#333' }}>
                                📈 Current Usage (HIPAA Compliant - Counts Only)
                            </h3>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                <div style={{
                                    background: 'white',
                                    padding: '15px',
                                    borderRadius: '6px',
                                    border: '1px solid #ddd'
                                }}>
                                    <div style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>Total PIRs</div>
                                    <div style={{ fontSize: '24px', fontWeight: '700', color: '#0077CC' }}>
                                        {tenantUsageStats.pirCount}
                                    </div>
                                    <div style={{ fontSize: '11px', color: '#999', marginTop: '5px' }}>
                                        Max: {managingTenant.config?.maxPirs || 'N/A'}
                                    </div>
                                </div>
                                <div style={{
                                    background: 'white',
                                    padding: '15px',
                                    borderRadius: '6px',
                                    border: '1px solid #ddd'
                                }}>
                                    <div style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>Total Coaches</div>
                                    <div style={{ fontSize: '24px', fontWeight: '700', color: '#00A040' }}>
                                        {tenantUsageStats.coachCount}
                                    </div>
                                    <div style={{ fontSize: '11px', color: '#999', marginTop: '5px' }}>
                                        Max: {managingTenant.config?.maxCoaches || 'N/A'}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Edit Tenant Form */}
                        <form onSubmit={async (e) => {
                            e.preventDefault();
                            const formData = new FormData(e.target);
                            try {
                                const updateData = {
                                    'config.companyName': formData.get('companyName'),
                                    'config.contactEmail': formData.get('contactEmail'),
                                    'config.contactPhone': formData.get('contactPhone'),
                                    'config.timezone': formData.get('timezone'),
                                    'config.logoUrl': formData.get('logoUrl'),
                                    'config.subscriptionTier': formData.get('subscriptionTier'),
                                    'config.maxPirs': parseInt(formData.get('maxPirs')),
                                    'config.maxCoaches': parseInt(formData.get('maxCoaches')),
                                    'config.status': formData.get('status'),
                                    'status': formData.get('status').toLowerCase(),
                                    'updatedAt': window.firebase.firestore.FieldValue.serverTimestamp(),
                                    'updatedBy': user.uid
                                };

                                // Add or remove trial end date based on status
                                if (formData.get('status') === 'Trial' && formData.get('trialEndDate')) {
                                    updateData['config.trialEndDate'] = window.firebase.firestore.Timestamp.fromDate(new Date(formData.get('trialEndDate')));
                                } else if (formData.get('status') !== 'Trial') {
                                    // Remove trial end date if status changed from Trial to something else
                                    updateData['config.trialEndDate'] = window.firebase.firestore.FieldValue.delete();
                                }

                                await window.db.collection('tenants').doc(managingTenant.id).update(updateData);

                                if (window.logAudit) {
                                    await window.logAudit('tenant_updated', {
                                        tenantId: managingTenant.id,
                                        companyName: formData.get('companyName')
                                    });
                                }

                                alert('✅ Tenant updated successfully!');
                                setShowManageTenantModal(false);
                                setManagingTenant(null);

                                // Reload tenants list
                                const tenantsSnap = await window.db.collection('tenants').get();
                                const tenantsData = tenantsSnap.docs.map(doc => ({
                                    id: doc.id,
                                    ...doc.data()
                                }));
                                setTenants(tenantsData);
                            } catch (error) {
                                console.error('Error updating tenant:', error);
                                alert('❌ Error updating tenant: ' + error.message);
                            }
                        }}>
                            <h3 style={{ fontSize: '15px', fontWeight: '600', marginTop: '0', marginBottom: '15px', color: '#333' }}>
                                📋 Tenant Information
                            </h3>

                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px' }}>
                                    Portal Type (read-only)
                                </label>
                                <input
                                    type="text"
                                    value={managingTenant.id}
                                    disabled
                                    style={{
                                        width: '100%',
                                        padding: '10px',
                                        border: '1px solid #ddd',
                                        borderRadius: '6px',
                                        fontSize: '14px',
                                        boxSizing: 'border-box',
                                        background: '#f5f5f5',
                                        color: '#666'
                                    }}
                                />
                            </div>

                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px' }}>
                                    Company Name *
                                </label>
                                <input
                                    type="text"
                                    name="companyName"
                                    required
                                    defaultValue={managingTenant.config?.companyName || ''}
                                    style={{
                                        width: '100%',
                                        padding: '10px',
                                        border: '1px solid #ddd',
                                        borderRadius: '6px',
                                        fontSize: '14px',
                                        boxSizing: 'border-box'
                                    }}
                                />
                            </div>

                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px' }}>
                                    Contact Email *
                                </label>
                                <input
                                    type="email"
                                    name="contactEmail"
                                    required
                                    defaultValue={managingTenant.config?.contactEmail || ''}
                                    style={{
                                        width: '100%',
                                        padding: '10px',
                                        border: '1px solid #ddd',
                                        borderRadius: '6px',
                                        fontSize: '14px',
                                        boxSizing: 'border-box'
                                    }}
                                />
                            </div>

                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px' }}>
                                    Contact Phone
                                </label>
                                <input
                                    type="tel"
                                    name="contactPhone"
                                    defaultValue={managingTenant.config?.contactPhone || ''}
                                    style={{
                                        width: '100%',
                                        padding: '10px',
                                        border: '1px solid #ddd',
                                        borderRadius: '6px',
                                        fontSize: '14px',
                                        boxSizing: 'border-box'
                                    }}
                                />
                            </div>

                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px' }}>
                                    Timezone *
                                </label>
                                <select
                                    name="timezone"
                                    required
                                    defaultValue={managingTenant.config?.timezone || 'America/New_York'}
                                    style={{
                                        width: '100%',
                                        padding: '10px',
                                        border: '1px solid #ddd',
                                        borderRadius: '6px',
                                        fontSize: '14px',
                                        boxSizing: 'border-box',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <option value="America/New_York">Eastern Time (ET)</option>
                                    <option value="America/Chicago">Central Time (CT)</option>
                                    <option value="America/Denver">Mountain Time (MT)</option>
                                    <option value="America/Phoenix">Arizona Time (MST)</option>
                                    <option value="America/Los_Angeles">Pacific Time (PT)</option>
                                    <option value="America/Anchorage">Alaska Time (AKT)</option>
                                    <option value="Pacific/Honolulu">Hawaii Time (HT)</option>
                                </select>
                            </div>

                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px' }}>
                                    Logo URL
                                </label>
                                <input
                                    type="url"
                                    name="logoUrl"
                                    defaultValue={managingTenant.config?.logoUrl || ''}
                                    style={{
                                        width: '100%',
                                        padding: '10px',
                                        border: '1px solid #ddd',
                                        borderRadius: '6px',
                                        fontSize: '14px',
                                        boxSizing: 'border-box'
                                    }}
                                />
                            </div>

                            <h3 style={{ fontSize: '15px', fontWeight: '600', marginTop: '25px', marginBottom: '15px', color: '#333' }}>
                                📊 Subscription & Limits
                            </h3>

                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px' }}>
                                    Subscription Tier *
                                </label>
                                <select
                                    name="subscriptionTier"
                                    required
                                    defaultValue={managingTenant.config?.subscriptionTier || 'Professional'}
                                    onChange={(e) => {
                                        const tierLimits = SUBSCRIPTION_TIERS[e.target.value];
                                        if (tierLimits) {
                                            e.target.form.maxPirs.value = tierLimits.maxPirs;
                                            e.target.form.maxCoaches.value = tierLimits.maxCoaches;
                                        }
                                    }}
                                    style={{
                                        width: '100%',
                                        padding: '10px',
                                        border: '1px solid #ddd',
                                        borderRadius: '6px',
                                        fontSize: '14px',
                                        boxSizing: 'border-box',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <option value="Starter">Starter (25 PIRs, 2 Coaches)</option>
                                    <option value="Professional">Professional (100 PIRs, 10 Coaches)</option>
                                    <option value="Enterprise">Enterprise (500 PIRs, 50 Coaches)</option>
                                    <option value="Unlimited">Unlimited (9999 PIRs, 999 Coaches)</option>
                                </select>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px' }}>
                                        Max PIRs *
                                    </label>
                                    <input
                                        type="number"
                                        name="maxPirs"
                                        required
                                        min="1"
                                        defaultValue={managingTenant.config?.maxPirs || 100}
                                        style={{
                                            width: '100%',
                                            padding: '10px',
                                            border: '1px solid #ddd',
                                            borderRadius: '6px',
                                            fontSize: '14px',
                                            boxSizing: 'border-box'
                                        }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px' }}>
                                        Max Coaches *
                                    </label>
                                    <input
                                        type="number"
                                        name="maxCoaches"
                                        required
                                        min="1"
                                        defaultValue={managingTenant.config?.maxCoaches || 10}
                                        style={{
                                            width: '100%',
                                            padding: '10px',
                                            border: '1px solid #ddd',
                                            borderRadius: '6px',
                                            fontSize: '14px',
                                            boxSizing: 'border-box'
                                        }}
                                    />
                                </div>
                            </div>

                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px' }}>
                                    Status *
                                </label>
                                <select
                                    name="status"
                                    id="tenantStatus"
                                    required
                                    defaultValue={managingTenant.config?.status || 'Active'}
                                    onChange={(e) => {
                                        const trialDateField = document.getElementById('trialEndDateField');
                                        if (trialDateField) {
                                            trialDateField.style.display = e.target.value === 'Trial' ? 'block' : 'none';
                                        }
                                    }}
                                    style={{
                                        width: '100%',
                                        padding: '10px',
                                        border: '1px solid #ddd',
                                        borderRadius: '6px',
                                        fontSize: '14px',
                                        boxSizing: 'border-box',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <option value="Active">Active</option>
                                    <option value="Trial">Trial</option>
                                    <option value="Suspended">Suspended</option>
                                </select>
                            </div>

                            <div
                                id="trialEndDateField"
                                style={{
                                    marginBottom: '20px',
                                    display: (managingTenant.config?.status === 'Trial' ? 'block' : 'none')
                                }}
                            >
                                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px' }}>
                                    Trial End Date
                                </label>
                                <input
                                    type="date"
                                    name="trialEndDate"
                                    defaultValue={managingTenant.config?.trialEndDate?.toDate ? managingTenant.config.trialEndDate.toDate().toISOString().split('T')[0] : ''}
                                    min={new Date().toISOString().split('T')[0]}
                                    style={{
                                        width: '100%',
                                        padding: '10px',
                                        border: '1px solid #ddd',
                                        borderRadius: '6px',
                                        fontSize: '14px',
                                        boxSizing: 'border-box'
                                    }}
                                />
                                <small style={{ color: '#666', fontSize: '12px' }}>
                                    Tenant will be automatically suspended after this date
                                </small>
                            </div>

                            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginBottom: '25px' }}>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowManageTenantModal(false);
                                        setManagingTenant(null);
                                    }}
                                    style={{
                                        padding: '10px 20px',
                                        background: '#ddd',
                                        border: 'none',
                                        borderRadius: '6px',
                                        cursor: 'pointer',
                                        fontSize: '14px',
                                        fontWeight: '600'
                                    }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    style={{
                                        padding: '10px 20px',
                                        background: 'linear-gradient(135deg, #0077CC 0%, #005A9C 100%)',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '6px',
                                        cursor: 'pointer',
                                        fontSize: '14px',
                                        fontWeight: '600'
                                    }}
                                >
                                    Save Changes
                                </button>
                            </div>
                        </form>

                        {/* Danger Zone */}
                        <div style={{
                            background: '#FFF5F5',
                            border: '1px solid #FDD',
                            borderRadius: '8px',
                            padding: '20px',
                            marginTop: '25px'
                        }}>
                            <h3 style={{ fontSize: '15px', fontWeight: '600', marginTop: 0, marginBottom: '10px', color: '#DC143C' }}>
                                ⚠️ Danger Zone
                            </h3>
                            <p style={{ fontSize: '13px', color: '#666', marginBottom: '15px' }}>
                                Deleting a tenant will permanently remove all tenant data. This action cannot be undone.
                            </p>
                            <button
                                onClick={async () => {
                                    const confirmText = `DELETE ${managingTenant.id}`;
                                    const userInput = prompt(
                                        `⚠️ WARNING: You are about to permanently delete tenant "${managingTenant.config?.companyName || managingTenant.id}".\n\n` +
                                        `This will:\n` +
                                        `- Delete the tenant document\n` +
                                        `- NOT delete user accounts (manual cleanup required)\n` +
                                        `- NOT delete tenant data in other collections (manual cleanup required)\n\n` +
                                        `To confirm, type: ${confirmText}`
                                    );

                                    if (userInput === confirmText) {
                                        try {
                                            await window.db.collection('tenants').doc(managingTenant.id).delete();

                                            if (window.logAudit) {
                                                await window.logAudit('tenant_deleted', {
                                                    tenantId: managingTenant.id,
                                                    companyName: managingTenant.config?.companyName
                                                });
                                            }

                                            alert('✅ Tenant deleted successfully');
                                            setShowManageTenantModal(false);
                                            setManagingTenant(null);

                                            // Reload tenants list
                                            const tenantsSnap = await window.db.collection('tenants').get();
                                            const tenantsData = tenantsSnap.docs.map(doc => ({
                                                id: doc.id,
                                                ...doc.data()
                                            }));
                                            setTenants(tenantsData);
                                        } catch (error) {
                                            console.error('Error deleting tenant:', error);
                                            alert('❌ Error deleting tenant: ' + error.message);
                                        }
                                    } else if (userInput !== null) {
                                        alert('❌ Confirmation text did not match. Deletion cancelled.');
                                    }
                                }}
                                style={{
                                    padding: '10px 20px',
                                    background: '#DC143C',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                    fontWeight: '600'
                                }}
                            >
                                Delete Tenant
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

// Export for use in all pages
window.Sidebar = Sidebar;

console.log('✅ Navigation component loaded');
