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
 *   <Sidebar user={user} />
 */
function Sidebar({ user }) {
    const [showTenantModal, setShowTenantModal] = useState(false);
    const [tenants, setTenants] = useState([]);
    const [currentTenant, setCurrentTenant] = useState(window.CURRENT_TENANT || 'glrs');
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [collapsed, setCollapsed] = useState(() => {
        // Restore collapsed state from preferences
        return window.getPreference ? window.getPreference('sidebarCollapsed', false) : false;
    });

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

    // Save collapsed state preference
    useEffect(() => {
        if (window.savePreference) {
            window.savePreference('sidebarCollapsed', collapsed);
        }
    }, [collapsed]);

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
                        background: 'linear-gradient(135deg, var(--primary-color) 0%, var(--primary-dark) 100%)',
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
                width: isMobile ? '280px' : (collapsed ? '80px' : '280px'),
                background: 'linear-gradient(180deg, var(--primary-color) 0%, var(--primary-dark) 100%)',
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
                    {!collapsed && (
                        <div style={{ color: 'white', fontSize: '20px', fontWeight: 'bold' }}>
                            🛡️ GLRS Admin
                        </div>
                    )}
                    {!isMobile && (
                        <button
                            onClick={() => setCollapsed(!collapsed)}
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
                            {collapsed ? '→' : '←'}
                        </button>
                    )}
                </div>

                {/* User Profile */}
                {user && (
                    <div style={{
                        padding: '20px',
                        borderBottom: '1px solid rgba(255,255,255,0.2)',
                        display: collapsed ? 'none' : 'block'
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
                                padding: collapsed ? '16px 0' : '16px 20px',
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
                                justifyContent: collapsed ? 'center' : 'flex-start'
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
                            {!collapsed && <span style={{ fontSize: '15px' }}>{item.label}</span>}
                        </div>
                    ))}
                </div>

                {/* Tenant Switcher (SuperAdmin Only) */}
                {user && window.isSuperAdmin && window.isSuperAdmin(user) && !collapsed && (
                    <div style={{
                        padding: '15px',
                        borderTop: '1px solid rgba(255,255,255,0.2)',
                        background: 'rgba(0,0,0,0.2)'
                    }}>
                        <div style={{ color: 'white', fontSize: '12px', marginBottom: '8px', opacity: 0.8' }}>
                            Current Tenant
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
                        <button
                            onClick={() => setShowTenantModal(true)}
                            style={{
                                width: '100%',
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
                            Switch Tenant
                        </button>
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
                            padding: collapsed ? '12px 0' : '12px 20px',
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
                        {!collapsed && <span>Logout</span>}
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
                        <h2 style={{ marginTop: 0 }}>Switch Tenant</h2>
                        <p>Select a tenant to manage:</p>
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
                                        border: tenant.id === currentTenant ? '2px solid var(--primary-color)' : '1px solid #ddd'
                                    }}
                                >
                                    <div style={{ fontWeight: '600', marginBottom: '4px' }}>
                                        {tenant.config?.companyName || tenant.id}
                                    </div>
                                    <div style={{ fontSize: '12px', color: '#666' }}>
                                        Tenant ID: {tenant.id}
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
        </>
    );
}

// Export for use in all pages
window.Sidebar = Sidebar;

console.log('✅ Navigation component loaded');
