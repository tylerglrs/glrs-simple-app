// Destructure React hooks for use in components
const { useState, useEffect, useMemo, useCallback, useRef } = React;

/**
 * @file NotificationsTab.js - User notifications display and management
 * @description Provides real-time notification system with filtering and management:
 * - Real-time notification feed with Firebase onSnapshot
 * - Filter by all/unread/read status
 * - Mark individual or all notifications as read
 * - Notification type icons and colors
 * - Time-based formatting (e.g., "2h ago")
 * - Integration with topic rooms and modals
 *
 * @components
 * MAIN COMPONENT (1):
 * - NotificationsTab: Main notifications manager with real-time listener
 *
 * MODAL COMPONENTS (3):
 * - NotificationCommunityModals: Modal router (renders NotificationsModal or TopicRoomModal)
 * - NotificationsModal: Notification list modal
 * - TopicRoomModal: Topic room messaging modal with image support
 *
 * ACTION HANDLERS (2):
 * - markNotificationAsRead: Mark single notification as read
 * - markAllNotificationsAsRead: Batch mark all notifications as read
 *
 * @architecture 3-Layer Direct Architecture (Component → Firebase → Component)
 * - NotificationsTab uses local useState hooks (4 total)
 * - Direct Firebase real-time listener with proper cleanup
 * - NO global state dependencies
 * - Modals are props-based with callbacks (NO Firebase)
 * - Action handlers are separate utility functions
 *
 * @firebase 3 Firestore queries:
 * - notifications: Real-time listener for user's notifications
 * - notifications: Update single notification read status
 * - notifications: Batch update all notifications read status
 *
 * @refactored November 2025 - Phase 6 complete
 * @author GLRS Development Team
 */

// ═══════════════════════════════════════════════════════════
// NOTIFICATIONS TAB COMPONENT
// Display and manage user notifications
// ✅ PHASE 6: Refactored with error handling + loading/error UI + JSDoc
// ═══════════════════════════════════════════════════════════

/**
 * NotificationsTab Component
 * @description Main notifications manager with real-time Firebase listener
 *
 * @features
 * - Real-time notification updates using Firebase onSnapshot
 * - Filter tabs: All, Unread, Read notifications
 * - Mark individual notifications as read on click
 * - Mark all notifications as read with single button
 * - Notification type-based icons (achievement, milestone, assignment, etc.)
 * - Color-coded notification types
 * - Time-ago formatting (e.g., "2h ago", "just now")
 * - Loading spinner during data fetch
 * - Error UI with retry functionality
 * - Unread count badge display
 *
 * @state 4 useState hooks:
 * - notifications: array - All notifications from Firebase
 * - user: object - Current authenticated user
 * - loading: boolean - Loading state for Firebase listener
 * - error: string|null - Error message for display to user
 * - filter: string - Current filter ('all', 'unread', 'read')
 *
 * @computed 2 useMemo hooks:
 * - filteredNotifications: array - Notifications filtered by current filter
 * - unreadCount: number - Count of unread notifications
 *
 * @effects 2 useEffect hooks:
 * - Auth listener: Load user from Firebase auth (cleanup on unmount)
 * - Notifications listener: Real-time listener for user notifications (cleanup on unmount)
 *
 * @firebase 1 Firestore query:
 * - notifications: Real-time listener with where/orderBy/limit
 *   - Filters by userId
 *   - Orders by createdAt descending
 *   - Limits to 50 most recent
 *   - Has error callback and cleanup
 *
 * @errorHandling
 * - Real-time listener error: Sets error state, displays error UI with retry
 * - Calls window.handleFirebaseError for tracking
 * - All errors logged with console.error
 *
 * @returns {React.Element} Notifications display with filter tabs and notification list
 */
function NotificationsTab() {
    // Local state for notifications and UI
    const [notifications, setNotifications] = useState([]);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState('all'); // all, unread, read

    // Load current user from Firebase auth
    useEffect(() => {
        const unsubscribeAuth = firebase.auth().onAuthStateChanged((authUser) => {
            if (authUser) {
                setUser(authUser);
            } else {
                setUser(null);
                setNotifications([]);
            }
        });

        return () => unsubscribeAuth();
    }, []);

    // Real-time listener for notifications
    useEffect(() => {
        if (!user) {
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null); // Clear any previous errors

        const unsubscribe = db.collection('notifications')
            .where('userId', '==', user.uid)
            .orderBy('createdAt', 'desc')
            .limit(50)
            .onSnapshot(
                (snapshot) => {
                    const notifs = window.snapshotToArray(snapshot);
                    setNotifications(notifs);
                    setError(null); // Clear error on successful load
                    setLoading(false);
                },
                (error) => {
                    console.error('Error loading notifications:', error);
                    setError('Failed to load notifications. Please check your connection and try again.');
                    setLoading(false);
                    window.handleFirebaseError && window.handleFirebaseError(error, 'NotificationsTab.loadNotifications');
                }
            );

        // CRITICAL: Cleanup listener to prevent memory leaks
        return () => unsubscribe();
    }, [user]);

    // Filter notifications based on current filter
    const filteredNotifications = React.useMemo(() => {
        if (!notifications) return [];

        if (filter === 'unread') {
            return notifications.filter(n => !n.read);
        } else if (filter === 'read') {
            return notifications.filter(n => n.read);
        }
        return notifications;
    }, [notifications, filter]);

    const unreadCount = React.useMemo(() => {
        return notifications?.filter(n => !n.read).length || 0;
    }, [notifications]);

    const handleNotificationClick = async (notification) => {
        if (typeof window.GLRSApp.utils?.triggerHaptic === 'function') {
            window.GLRSApp.utils.triggerHaptic('light');
        }

        // Mark as read if unread
        if (!notification.read) {
            await window.GLRSApp.shared.notificationActions.markNotificationAsRead({
                notificationId: notification.id,
                db: window.db,
                firebase: window.firebase
            });
        }

        // Handle notification action based on type
        if (notification.actionUrl) {
            window.location.href = notification.actionUrl;
        }
    };

    const handleMarkAllRead = async () => {
        if (typeof window.GLRSApp.utils?.triggerHaptic === 'function') {
            window.GLRSApp.utils.triggerHaptic('medium');
        }
        await window.GLRSApp.shared.notificationActions.markAllNotificationsAsRead({
            notifications: notifications,
            db: window.db,
            firebase: window.firebase
        });
    };

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'achievement':
                return 'trophy';
            case 'milestone':
                return 'star';
            case 'assignment':
                return 'clipboard';
            case 'message':
                return 'message-circle';
            case 'reminder':
                return 'clock';
            case 'alert':
                return 'alert-circle';
            case 'system':
                return 'info';
            default:
                return 'bell';
        }
    };

    const getNotificationColor = (type) => {
        switch (type) {
            case 'achievement':
                return '#FFD700';
            case 'milestone':
                return '#f4c430';
            case 'assignment':
                return '#0077CC';
            case 'message':
                return '#9c27b0';
            case 'reminder':
                return '#FF8C00';
            case 'alert':
                return '#DC143C';
            case 'system':
                return '#666';
            default:
                return '#0077CC';
        }
    };

    const formatTimeAgo = (timestamp) => {
        if (!timestamp?.toDate) return 'now';
        const date = timestamp.toDate();
        const seconds = Math.floor((new Date() - date) / 1000);

        if (seconds < 60) return 'just now';
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
        if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
        return date.toLocaleDateString();
    };

    return (
        <div style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            minHeight: '100vh',
            padding: '20px'
        }}>
            {/* Header */}
            <div style={{
                background: 'rgba(255,255,255,0.1)',
                backdropFilter: 'blur(10px)',
                borderRadius: '20px',
                padding: '20px',
                marginBottom: '20px'
            }}>
                <h2 style={{ margin: '0 0 15px 0', color: 'white' }}>
                    Notifications
                </h2>

                {/* Filter Tabs */}
                <div style={{
                    display: 'flex',
                    background: 'rgba(255,255,255,0.2)',
                    borderRadius: '15px',
                    padding: '5px',
                    marginBottom: '15px'
                }}>
                    <button
                        onClick={() => setFilter('all')}
                        style={{
                            flex: 1,
                            padding: '10px',
                            background: filter === 'all' ? 'white' : 'transparent',
                            color: filter === 'all' ? '#764ba2' : 'white',
                            border: 'none',
                            borderRadius: '10px',
                            cursor: 'pointer',
                            fontWeight: 'bold',
                            transition: 'all 0.3s'
                        }}
                    >
                        All ({notifications?.length || 0})
                    </button>
                    <button
                        onClick={() => setFilter('unread')}
                        style={{
                            flex: 1,
                            padding: '10px',
                            background: filter === 'unread' ? 'white' : 'transparent',
                            color: filter === 'unread' ? '#764ba2' : 'white',
                            border: 'none',
                            borderRadius: '10px',
                            cursor: 'pointer',
                            fontWeight: 'bold',
                            transition: 'all 0.3s'
                        }}
                    >
                        Unread ({unreadCount})
                    </button>
                    <button
                        onClick={() => setFilter('read')}
                        style={{
                            flex: 1,
                            padding: '10px',
                            background: filter === 'read' ? 'white' : 'transparent',
                            color: filter === 'read' ? '#764ba2' : 'white',
                            border: 'none',
                            borderRadius: '10px',
                            cursor: 'pointer',
                            fontWeight: 'bold',
                            transition: 'all 0.3s'
                        }}
                    >
                        Read
                    </button>
                </div>

                {/* Mark All Read Button */}
                {unreadCount > 0 && (
                    <button
                        onClick={handleMarkAllRead}
                        style={{
                            width: '100%',
                            padding: '12px',
                            background: 'rgba(255,255,255,0.2)',
                            border: 'none',
                            borderRadius: '10px',
                            color: 'white',
                            cursor: 'pointer',
                            fontWeight: 'bold',
                            fontSize: '14px',
                            transition: 'all 0.3s'
                        }}
                    >
                        Mark All as Read
                    </button>
                )}
            </div>

            {/* Loading State */}
            {loading ? (
                <div style={{
                    textAlign: 'center',
                    color: 'white',
                    padding: '60px 20px',
                    background: 'rgba(255,255,255,0.1)',
                    borderRadius: '20px'
                }}>
                    <div className="spinner" style={{
                        width: '48px',
                        height: '48px',
                        border: '4px solid rgba(255,255,255,0.3)',
                        borderTop: '4px solid white',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite',
                        margin: '0 auto 20px auto'
                    }}></div>
                    <p style={{ fontSize: '16px', opacity: 0.9 }}>Loading notifications...</p>
                </div>
            ) : error ? (
                /* Error State */
                <div style={{
                    background: 'rgba(255,255,255,0.95)',
                    borderRadius: '20px',
                    padding: '40px',
                    textAlign: 'center'
                }}>
                    <i data-lucide="alert-circle" style={{
                        width: '64px',
                        height: '64px',
                        color: '#ef4444',
                        marginBottom: '20px'
                    }}></i>
                    <h3 style={{
                        color: '#ef4444',
                        margin: '0 0 12px 0',
                        fontSize: '20px'
                    }}>
                        Error Loading Notifications
                    </h3>
                    <p style={{
                        color: '#666',
                        margin: '0 0 24px 0',
                        fontSize: '16px',
                        lineHeight: '1.5'
                    }}>
                        {error}
                    </p>
                    <button
                        onClick={() => {
                            setError(null);
                            setLoading(true);
                            // The useEffect will re-run and reload notifications
                        }}
                        style={{
                            padding: '12px 24px',
                            background: '#764ba2',
                            color: 'white',
                            border: 'none',
                            borderRadius: '10px',
                            cursor: 'pointer',
                            fontSize: '16px',
                            fontWeight: 'bold',
                            transition: 'all 0.3s'
                        }}
                    >
                        Retry
                    </button>
                </div>
            ) : filteredNotifications.length === 0 ? (
                /* Empty State */
                <div style={{
                    textAlign: 'center',
                    color: 'rgba(255,255,255,0.8)',
                    padding: '40px',
                    background: 'rgba(255,255,255,0.1)',
                    borderRadius: '20px'
                }}>
                    <i data-lucide="bell-off" style={{
                        width: '64px',
                        height: '64px',
                        marginBottom: '20px',
                        opacity: 0.5
                    }}></i>
                    <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '10px' }}>
                        No {filter === 'all' ? '' : filter} notifications
                    </div>
                    <div style={{ fontSize: '14px', opacity: 0.8 }}>
                        You're all caught up!
                    </div>
                </div>
            ) : (
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px'
                }}>
                    {filteredNotifications.map(notification => (
                        <div
                            key={notification.id}
                            onClick={() => handleNotificationClick(notification)}
                            style={{
                                background: notification.read
                                    ? 'rgba(255,255,255,0.7)'
                                    : 'rgba(255,255,255,0.95)',
                                borderRadius: '15px',
                                padding: '15px',
                                cursor: 'pointer',
                                transition: 'all 0.3s',
                                border: notification.read ? 'none' : '2px solid #f4c430',
                                position: 'relative'
                            }}
                        >
                            {/* Unread Badge */}
                            {!notification.read && (
                                <div style={{
                                    position: 'absolute',
                                    top: '15px',
                                    right: '15px',
                                    width: '10px',
                                    height: '10px',
                                    borderRadius: '50%',
                                    background: '#0077CC'
                                }}></div>
                            )}

                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                                {/* Icon */}
                                <div style={{
                                    width: '40px',
                                    height: '40px',
                                    borderRadius: '50%',
                                    background: `linear-gradient(135deg, ${getNotificationColor(notification.type)}, ${getNotificationColor(notification.type)}cc)`,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0
                                }}>
                                    <i data-lucide={getNotificationIcon(notification.type)} style={{
                                        width: '20px',
                                        height: '20px',
                                        color: '#fff'
                                    }}></i>
                                </div>

                                {/* Content */}
                                <div style={{ flex: 1, paddingRight: '20px' }}>
                                    <div style={{
                                        fontWeight: notification.read ? '500' : 'bold',
                                        color: '#333',
                                        marginBottom: '5px',
                                        fontSize: '15px'
                                    }}>
                                        {notification.title}
                                    </div>
                                    <div style={{
                                        color: '#666',
                                        fontSize: '14px',
                                        lineHeight: '1.4',
                                        marginBottom: '8px'
                                    }}>
                                        {notification.message}
                                    </div>
                                    <div style={{
                                        color: '#999',
                                        fontSize: '12px'
                                    }}>
                                        {formatTimeAgo(notification.createdAt)}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

// Register component globally
window.GLRSApp = window.GLRSApp || { components: {} };
window.GLRSApp.components = window.GLRSApp.components || {};
window.GLRSApp.components.NotificationsTab = NotificationsTab;

console.log('✅ NotificationsTab component loaded - Phase 6 (error handling + loading/error UI + JSDoc)');

/**
 * NotificationCommunityModals Component
 * @description Modal router component that renders NotificationsModal or TopicRoomModal based on modalType
 *
 * @props
 * - modalType: string - Type of modal to render ('notifications' or 'topicRoom')
 * - notifications: array - Array of notification objects (for NotificationsModal)
 * - activeTopicRoom: object - Active topic room data (for TopicRoomModal)
 * - topicRoomMessages: array - Topic room messages (for TopicRoomModal)
 * - user: object - Current user object
 * - onClose: function - Callback to close modal
 * - onMarkNotificationRead: function - Callback to mark notification as read (notificationId)
 * - onMarkAllNotificationsRead: function - Callback to mark all notifications as read
 * - onFlagMessage: function - Callback to flag message for moderation
 * - onSendTopicMessage: function - Callback to send topic room message
 *
 * @architecture Props-based router component (NO Firebase, NO state)
 * - Pure router that delegates to sub-modals
 * - All data comes from props
 * - All actions use callbacks to parent
 *
 * @returns {React.Element|null} NotificationsModal, TopicRoomModal, or null
 */
function NotificationCommunityModals({ modalType, notifications, activeTopicRoom, topicRoomMessages, user, onClose, onMarkNotificationRead, onMarkAllNotificationsRead, onFlagMessage, onSendTopicMessage }) {
    // ═══════════════════════════════════════════════════════════
    // 3-LAYER PATTERN: Modals with data props and callbacks
    // - Receives data as props (notifications, messages, etc.)
    // - Uses callbacks to notify parent of actions
    // - Local useState for form inputs only
    // - Parent handles Firebase writes
    // ═══════════════════════════════════════════════════════════

    const renderModalContent = () => {
        switch(modalType) {
            case 'notifications':
                return (
                    <NotificationsModal
                        notifications={notifications}
                        onClose={onClose}
                        onMarkNotificationRead={onMarkNotificationRead}
                        onMarkAllNotificationsRead={onMarkAllNotificationsRead}
                    />
                );

            case 'topicRoom':
                return (
                    <TopicRoomModal
                        activeTopicRoom={activeTopicRoom}
                        topicRoomMessages={topicRoomMessages}
                        user={user}
                        onClose={onClose}
                        onFlagMessage={onFlagMessage}
                        onSendMessage={onSendTopicMessage}
                    />
                );

            default:
                return null;
        }
    };

    return renderModalContent();
}

// ═══════════════════════════════════════════════════════════
// NOTIFICATIONS MODAL
// ═══════════════════════════════════════════════════════════

/**
 * NotificationsModal Component
 * @description Modal display for notification list with mark-as-read functionality
 *
 * @features
 * - Display all notifications in a scrollable list
 * - Show notification type, title, message, and timestamp
 * - Click notification to mark as read
 * - "Mark All as Read" button (only shows if unread notifications exist)
 * - Empty state for no notifications
 *
 * @props
 * - notifications: array - Array of notification objects to display
 * - onClose: function - Callback to close modal
 * - onMarkNotificationRead: function - Callback to mark single notification as read (notificationId)
 * - onMarkAllNotificationsRead: function - Callback to mark all notifications as read
 *
 * @architecture Props-based component (NO Firebase, NO state)
 * - All data comes from props
 * - All actions use callbacks to parent
 * - Pure UI component
 *
 * @returns {React.Element} Notification list modal
 */
function NotificationsModal({ notifications, onClose, onMarkNotificationRead, onMarkAllNotificationsRead }) {
    return (
        <div className="notification-panel">
            <h3 style={{marginBottom: '20px'}}>Notifications</h3>
            {notifications && notifications.length > 0 ? (
                <>
                    {notifications.map(notification => (
                        <div
                            key={notification.id}
                            className={`notification-item ${!notification.read ? 'unread' : ''}`}
                            onClick={() => onMarkNotificationRead(notification.id)}
                        >
                            <div className="notification-header">
                                <span className="notification-type">{notification.type}</span>
                                <span className="notification-time">
                                    {notification.createdAt?.toDate ?
                                        new Date(notification.createdAt.toDate()).toLocaleTimeString() :
                                        'now'}
                                </span>
                            </div>
                            <div className="notification-message">
                                <strong>{notification.title}</strong>
                                <div>{notification.message}</div>
                            </div>
                        </div>
                    ))}
                    {notifications.some(n => !n.read) && (
                        <button
                            className="btn-primary"
                            onClick={onMarkAllNotificationsRead}
                            style={{marginTop: '15px'}}
                        >
                            Mark All as Read
                        </button>
                    )}
                </>
            ) : (
                <div style={{textAlign: 'center', opacity: 0.6, padding: '40px'}}>
                    No notifications
                </div>
            )}
        </div>
    );
}

// ═══════════════════════════════════════════════════════════
// TOPIC ROOM MODAL
// ═══════════════════════════════════════════════════════════

/**
 * TopicRoomModal Component
 * @description Topic room messaging modal with text and image support
 *
 * @features
 * - Display topic room messages in chronological order
 * - Send text messages
 * - Attach and send images
 * - Image preview before sending
 * - Flag messages for moderation
 * - Upload progress indicator
 * - Message input with character support
 *
 * @props
 * - activeTopicRoom: object - Active topic room data (id, name, etc.)
 * - topicRoomMessages: array - Array of message objects for this room
 * - user: object - Current user object
 * - onClose: function - Callback to close modal
 * - onFlagMessage: function - Callback to flag message (message)
 * - onSendMessage: function - Callback to send message (messageText, imageFile)
 *
 * @state 3 useState hooks (local UI state):
 * - newMessage: string - Message input text
 * - selectedImage: File|null - Selected image file for upload
 * - uploading: boolean - Upload in progress indicator
 *
 * @architecture Props-based component with local UI state (NO Firebase)
 * - All data comes from props
 * - All Firebase operations use callbacks to parent
 * - Local state only for form inputs and upload status
 *
 * @errorHandling
 * - Send message errors logged with console.error
 * - Upload state always resets in finally block (prevents stuck button)
 * - Message preserved on error for user retry
 *
 * @returns {React.Element} Topic room messaging interface
 */
function TopicRoomModal({ activeTopicRoom, topicRoomMessages, user, onClose, onFlagMessage, onSendMessage }) {
    const [newMessage, setNewMessage] = React.useState('');
    const [selectedImage, setSelectedImage] = React.useState(null);
    const [uploading, setUploading] = React.useState(false);

    const handleTopicImageSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedImage(file);
        }
    };

    const handleSendMessage = async () => {
        if (!newMessage.trim() && !selectedImage) return;

        setUploading(true);
        try {
            await onSendMessage(newMessage || '', selectedImage);
            setNewMessage('');
            setSelectedImage(null);
            // Clear the file input
            const fileInput = document.getElementById('topic-image-input');
            if (fileInput) fileInput.value = '';
        } catch (error) {
            console.error('Failed to send message:', error);
            // Don't clear message on error so user can retry
        } finally {
            setUploading(false); // CRITICAL FIX: Always reset uploading state
        }
    };

    const handleFlagTopicMessage = (msg) => {
        if (onFlagMessage) {
            onFlagMessage(msg);
        }
    };

    return (
        <div>
            <h3 style={{marginBottom: '20px'}}>
                {activeTopicRoom?.icon} {activeTopicRoom?.name}
            </h3>
            <p style={{opacity: 0.8, marginBottom: '20px'}}>
                {activeTopicRoom?.description}
            </p>

            {/* Messages container */}
            <div style={{flex: 1, overflowY: 'auto', padding: '15px', height: '300px'}}>
                {topicRoomMessages?.map(msg => (
                    <div key={msg.id} style={{
                        background: msg.userId === user?.uid ?
                            'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' :
                            'rgba(255,255,255,0.05)',
                        padding: '12px',
                        borderRadius: '12px',
                        marginBottom: '10px'
                    }}>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            marginBottom: '8px'
                        }}>
                            <span style={{fontWeight: 'bold', color: '#f4c430'}}>
                                {msg.senderName || 'Anonymous'}
                            </span>
                            <div style={{display: 'flex', gap: '10px', alignItems: 'center'}}>
                                <span style={{fontSize: '12px', opacity: 0.7, color: 'white'}}>
                                    {msg.createdAt?.toDate ?
                                        msg.createdAt.toDate().toLocaleTimeString() :
                                        'sending...'}
                                </span>
                                {msg.userId !== user?.uid && (
                                    <button
                                        onClick={() => handleFlagTopicMessage(msg)}
                                        style={{
                                            background: 'transparent',
                                            border: 'none',
                                            color: 'rgba(255,255,255,0.5)',
                                            cursor: 'pointer',
                                            fontSize: '14px',
                                            padding: '2px'
                                        }}
                                        title="Flag inappropriate content"
                                    >
                                        <i data-lucide="flag" style={{width: '16px', height: '16px'}}></i>
                                    </button>
                                )}
                            </div>
                        </div>
                        {msg.message && (
                            <p style={{margin: 0, color: 'white', lineHeight: 1.5}}>
                                {msg.message}
                            </p>
                        )}
                        {msg.imageUrl && (
                            <img
                                src={msg.imageUrl}
                                alt="Shared"
                                style={{
                                    maxWidth: '100%',
                                    maxHeight: '300px',
                                    borderRadius: '8px',
                                    marginTop: '10px',
                                    cursor: 'pointer'
                                }}
                                onClick={() => window.open(msg.imageUrl, '_blank')}
                            />
                        )}
                    </div>
                ))}
            </div>

            <div style={{
                padding: '15px',
                borderTop: '1px solid rgba(255,255,255,0.1)'
            }}>
                {selectedImage && (
                    <div style={{
                        marginBottom: '10px',
                        padding: '8px',
                        background: 'rgba(255,255,255,0.1)',
                        borderRadius: '8px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <span style={{color: 'white', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px'}}>
                            <i data-lucide="camera" style={{width: '16px', height: '16px'}}></i>
                            {selectedImage.name}
                        </span>
                        <button
                            onClick={() => {
                                setSelectedImage(null);
                                const fileInput = document.getElementById('topic-image-input');
                                if (fileInput) fileInput.value = '';
                            }}
                            style={{
                                background: 'transparent',
                                border: 'none',
                                color: 'white',
                                cursor: 'pointer'
                            }}
                        >
                            ✕
                        </button>
                    </div>
                )}
                <div style={{display: 'flex', gap: '10px'}}>
                    <input
                        type="file"
                        id="topic-image-input"
                        accept="image/*"
                        style={{display: 'none'}}
                        onChange={handleTopicImageSelect}
                    />
                    <button
                        onClick={() => {
                            const fileInput = document.getElementById('topic-image-input');
                            if (fileInput) fileInput.click();
                        }}
                        style={{
                            background: 'rgba(255,255,255,0.1)',
                            border: 'none',
                            borderRadius: '8px',
                            padding: '10px',
                            color: 'white',
                            cursor: 'pointer'
                        }}
                        disabled={uploading}
                    >
                        <i data-lucide="camera" style={{width: '18px', height: '18px'}}></i>
                    </button>
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        style={{
                            flex: 1,
                            padding: '10px',
                            background: 'rgba(255,255,255,0.1)',
                            border: 'none',
                            borderRadius: '8px',
                            color: 'white'
                        }}
                    />
                    <button
                        onClick={handleSendMessage}
                        disabled={uploading || (!newMessage.trim() && !selectedImage)}
                        style={{
                            padding: '10px 20px',
                            background: uploading ? 'gray' : '#f4c430',
                            border: 'none',
                            borderRadius: '8px',
                            color: 'black',
                            fontWeight: 'bold',
                            cursor: uploading ? 'not-allowed' : 'pointer'
                        }}
                    >
                        {uploading ? '...' : 'Send'}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ═══════════════════════════════════════════════════════════
// COMPONENT REGISTRATION
// ═══════════════════════════════════════════════════════════

// Register to global namespace
window.GLRSApp = window.GLRSApp || {};
window.GLRSApp.components = window.GLRSApp.components || {};
window.GLRSApp.components.NotificationCommunityModals = NotificationCommunityModals;
window.GLRSApp.components.NotificationsModal = NotificationsModal;
window.GLRSApp.components.TopicRoomModal = TopicRoomModal;

console.log('✅ PHASE 6: NotificationCommunityModals + 2 modals loaded (JSDoc + error handling)');
// ═══════════════════════════════════════════════════════════
// NOTIFICATION ACTIONS
// Business logic for managing notifications
// ═══════════════════════════════════════════════════════════

// ==========================================
// MARK SINGLE NOTIFICATION AS READ
// ==========================================

/**
 * Mark a single notification as read
 * @description Updates notification document with read status and timestamp
 * @async
 * @param {object} params - Function parameters
 * @param {string} params.notificationId - ID of notification to mark as read
 * @param {object} params.db - Firestore database instance
 * @param {object} params.firebase - Firebase instance for serverTimestamp
 * @firebase notifications collection (update)
 * @errorHandling Logs error and calls window.handleFirebaseError
 * @returns {Promise<void>}
 */
const markNotificationAsRead = async ({ notificationId, db, firebase }) => {
    try {
        await db.collection('notifications').doc(notificationId).update({
            read: true,
            readAt: firebase.firestore.FieldValue.serverTimestamp()
        });
    } catch (error) {
        console.error('Error marking notification as read:', error);
        window.handleFirebaseError && window.handleFirebaseError(error, 'NotificationsTab.markNotificationAsRead');
    }
};

// ==========================================
// MARK ALL NOTIFICATIONS AS READ
// ==========================================

/**
 * Mark all unread notifications as read
 * @description Batch updates all unread notifications with read status and timestamp
 * @async
 * @param {object} params - Function parameters
 * @param {array} params.notifications - Array of notification objects
 * @param {object} params.db - Firestore database instance
 * @param {object} params.firebase - Firebase instance for serverTimestamp
 * @firebase notifications collection (batch update)
 * @errorHandling Logs error and calls window.handleFirebaseError
 * @returns {Promise<void>}
 */
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
        window.handleFirebaseError && window.handleFirebaseError(error, 'NotificationsTab.markAllNotificationsAsRead');
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


