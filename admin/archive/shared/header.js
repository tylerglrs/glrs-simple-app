// ==========================================
// SHARED HEADER COMPONENT
// ==========================================
// Top navigation bar for all admin pages
// Includes: Search, Refresh, Notifications, User Display
// Adapted from original admin.html lines 2741-2940

// Note: This file uses React (must be loaded before this script)
const { useState, useEffect, useRef } = React;

/**
 * Header Component
 *
 * Features:
 * - User display name/email
 * - Global search bar (searches current page content)
 * - Refresh button with animation
 * - Notification bell with unread count badge
 * - Notification dropdown panel
 * - Dynamic margin-left that adjusts with sidebar collapse
 *
 * Usage:
 *   <Header
 *     user={user}
 *     searchQuery={searchQuery}
 *     setSearchQuery={setSearchQuery}
 *     sidebarCollapsed={sidebarCollapsed}
 *     notifications={notifications}
 *     onClearNotification={handleClearNotification}
 *     onClearAllNotifications={handleClearAllNotifications}
 *   />
 */
function Header({
    user,
    searchQuery = '',
    setSearchQuery = () => {},
    sidebarCollapsed = false,
    notifications = [],
    onClearNotification = () => {},
    onClearAllNotifications = () => {}
}) {
    const [showNotifications, setShowNotifications] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const notificationRef = useRef(null);

    // Responsive states
    const [isMobile, setIsMobile] = useState(window.innerWidth < 600);
    const [isTablet, setIsTablet] = useState(window.innerWidth >= 600 && window.innerWidth < 1024);

    // Responsive resize listener
    useEffect(() => {
        const handleResize = () => {
            const width = window.innerWidth;
            setIsMobile(width < 600);
            setIsTablet(width >= 600 && width < 1024);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Close notification dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (notificationRef.current && !notificationRef.current.contains(event.target)) {
                setShowNotifications(false);
            }
        }

        if (showNotifications) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [showNotifications]);

    // Handle refresh button click
    const handleRefresh = () => {
        setRefreshing(true);
        setTimeout(() => {
            window.location.reload();
        }, 300);
    };

    // Calculate unread notification count
    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <div style={{
            background: 'white',
            padding: isMobile ? '10px 12px' : isTablet ? '12px 20px' : '15px 30px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            position: 'sticky',
            top: 0,
            zIndex: 99,
            gap: isMobile ? '8px' : '15px'
            // Note: marginLeft removed - parent container handles sidebar offset
        }}>
            {/* Left Side - User Display */}
            <div style={{
                fontSize: isMobile ? '14px' : '18px',
                fontWeight: '600',
                color: '#333',
                display: 'flex',
                alignItems: 'center',
                gap: isMobile ? '8px' : '12px',
                minWidth: 0,
                flex: isMobile ? '0 0 auto' : '0 0 auto'
            }}>
                {user && (
                    <>
                        <div style={{
                            width: isMobile ? '32px' : '36px',
                            height: isMobile ? '32px' : '36px',
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #0077CC 0%, #008B8B 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontWeight: 'bold',
                            fontSize: isMobile ? '12px' : '14px',
                            flexShrink: 0
                        }}>
                            {(user.displayName || user.email || 'U').charAt(0).toUpperCase()}
                        </div>
                        {/* Hide name on mobile to save space */}
                        {!isMobile && (
                            <span style={{
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                maxWidth: isTablet ? '120px' : '200px'
                            }}>
                                {user.displayName || user.email}
                            </span>
                        )}
                    </>
                )}
            </div>

            {/* Right Side - Search, Refresh, Notifications */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: isMobile ? '8px' : isTablet ? '10px' : '15px',
                flex: 1,
                justifyContent: 'flex-end',
                minWidth: 0
            }}>
                {/* Search Bar - responsive width */}
                <input
                    type="text"
                    placeholder={isMobile ? "Search..." : "Search on this page..."}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{
                        padding: isMobile ? '8px 12px' : '10px 20px',
                        borderRadius: '25px',
                        border: '2px solid #e0e0e0',
                        width: isMobile ? '120px' : isTablet ? '180px' : '350px',
                        minWidth: isMobile ? '100px' : '150px',
                        fontSize: isMobile ? '13px' : '14px',
                        outline: 'none',
                        transition: 'border-color 0.3s, width 0.3s',
                        flexShrink: 1
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#0077CC'}
                    onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                />

                {/* Refresh Button - icon only on mobile */}
                <button
                    onClick={handleRefresh}
                    disabled={refreshing}
                    title="Refresh page"
                    style={{
                        padding: isMobile ? '8px 10px' : '10px 20px',
                        background: 'linear-gradient(135deg, #0077CC 0%, #008B8B 100%)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: refreshing ? 'not-allowed' : 'pointer',
                        fontSize: '14px',
                        fontWeight: '600',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        transition: 'transform 0.2s, opacity 0.2s',
                        opacity: refreshing ? 0.6 : 1,
                        flexShrink: 0,
                        minWidth: isMobile ? '36px' : 'auto'
                    }}
                    onMouseEnter={(e) => {
                        if (!refreshing) e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                    }}
                >
                    <span style={{
                        display: 'inline-block',
                        animation: refreshing ? 'spin 1s linear infinite' : 'none'
                    }}>
                        {refreshing ? '⟳' : '↻'}
                    </span>
                    {!isMobile && 'Refresh'}
                </button>

                {/* Notification Bell */}
                <div ref={notificationRef} style={{ position: 'relative' }}>
                    <button
                        onClick={() => setShowNotifications(!showNotifications)}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '24px',
                            position: 'relative',
                            padding: '8px',
                            borderRadius: '8px',
                            transition: 'background 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = '#f0f0f0'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                        🔔
                        {unreadCount > 0 && (
                            <div style={{
                                position: 'absolute',
                                top: '4px',
                                right: '4px',
                                background: '#DC143C',
                                color: 'white',
                                borderRadius: '10px',
                                padding: '2px 6px',
                                fontSize: '11px',
                                fontWeight: 'bold',
                                minWidth: '18px',
                                textAlign: 'center'
                            }}>
                                {unreadCount > 99 ? '99+' : unreadCount}
                            </div>
                        )}
                    </button>

                    {/* Notification Dropdown - responsive width */}
                    {showNotifications && (
                        <div style={{
                            position: isMobile ? 'fixed' : 'absolute',
                            top: isMobile ? '60px' : '100%',
                            right: isMobile ? '10px' : 0,
                            left: isMobile ? '10px' : 'auto',
                            marginTop: isMobile ? 0 : '10px',
                            background: 'white',
                            borderRadius: '12px',
                            boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                            width: isMobile ? 'auto' : isTablet ? '320px' : '400px',
                            maxWidth: isMobile ? 'calc(100vw - 20px)' : '400px',
                            maxHeight: isMobile ? 'calc(100vh - 140px)' : '500px',
                            overflow: 'hidden',
                            display: 'flex',
                            flexDirection: 'column',
                            zIndex: 1000
                        }}>
                            {/* Dropdown Header */}
                            <div style={{
                                padding: '15px 20px',
                                borderBottom: '1px solid #e0e0e0',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}>
                                <div style={{
                                    fontSize: '16px',
                                    fontWeight: '600',
                                    color: '#333'
                                }}>
                                    Notifications ({notifications.length})
                                </div>
                                {notifications.length > 0 && (
                                    <button
                                        onClick={() => {
                                            onClearAllNotifications();
                                            setShowNotifications(false);
                                        }}
                                        style={{
                                            background: 'transparent',
                                            border: 'none',
                                            color: '#0077CC',
                                            cursor: 'pointer',
                                            fontSize: '13px',
                                            fontWeight: '500'
                                        }}
                                    >
                                        Clear All
                                    </button>
                                )}
                            </div>

                            {/* Notifications List */}
                            <div style={{
                                overflowY: 'auto',
                                maxHeight: '420px'
                            }}>
                                {notifications.length === 0 ? (
                                    <div style={{
                                        padding: '40px 20px',
                                        textAlign: 'center',
                                        color: '#999'
                                    }}>
                                        <div style={{ fontSize: '48px', marginBottom: '10px' }}>🔕</div>
                                        <div>No notifications</div>
                                    </div>
                                ) : (
                                    notifications.map((notification, index) => (
                                        <div
                                            key={notification.id || index}
                                            style={{
                                                padding: '15px 20px',
                                                borderBottom: index < notifications.length - 1 ? '1px solid #f0f0f0' : 'none',
                                                background: notification.read ? 'white' : '#f8f9ff',
                                                cursor: 'pointer',
                                                transition: 'background 0.2s'
                                            }}
                                            onMouseEnter={(e) => e.currentTarget.style.background = '#f5f5f5'}
                                            onMouseLeave={(e) => e.currentTarget.style.background = notification.read ? 'white' : '#f8f9ff'}
                                        >
                                            <div style={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'flex-start',
                                                gap: '10px'
                                            }}>
                                                <div style={{ flex: 1 }}>
                                                    <div style={{
                                                        fontSize: '14px',
                                                        fontWeight: notification.read ? 'normal' : '600',
                                                        color: '#333',
                                                        marginBottom: '4px'
                                                    }}>
                                                        {notification.title || notification.message}
                                                    </div>
                                                    {notification.body && (
                                                        <div style={{
                                                            fontSize: '13px',
                                                            color: '#666',
                                                            marginBottom: '6px'
                                                        }}>
                                                            {notification.body}
                                                        </div>
                                                    )}
                                                    <div style={{
                                                        fontSize: '12px',
                                                        color: '#999'
                                                    }}>
                                                        {notification.timestamp && new Date(notification.timestamp.toDate?.() || notification.timestamp).toLocaleString()}
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onClearNotification(notification.id);
                                                    }}
                                                    style={{
                                                        background: 'transparent',
                                                        border: 'none',
                                                        color: '#999',
                                                        cursor: 'pointer',
                                                        fontSize: '16px',
                                                        padding: '4px'
                                                    }}
                                                    title="Clear notification"
                                                >
                                                    ✕
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// Export for use in all pages
window.Header = Header;

console.log('✅ Header component loaded');
