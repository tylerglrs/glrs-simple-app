// ═══════════════════════════════════════════════════════════
// NOTIFICATIONS TAB COMPONENT
// Display and manage user notifications
// ✅ PHASE 8C-4: Created with Context API
// ═══════════════════════════════════════════════════════════

function NotificationsTab() {
  // Get state from Context
  const {
    notifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    user,
    triggerHaptic
  } = useAppContext();
  const [filter, setFilter] = useState('all'); // all, unread, read

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
  const handleNotificationClick = async notification => {
    if (typeof triggerHaptic === 'function') triggerHaptic('light');

    // Mark as read if unread
    if (!notification.read) {
      await markNotificationAsRead(notification.id);
    }

    // Handle notification action based on type
    if (notification.actionUrl) {
      window.location.href = notification.actionUrl;
    }
  };
  const handleMarkAllRead = async () => {
    if (typeof triggerHaptic === 'function') triggerHaptic('medium');
    await markAllNotificationsAsRead();
  };
  const getNotificationIcon = type => {
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
  const getNotificationColor = type => {
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
  const formatTimeAgo = timestamp => {
    if (!timestamp?.toDate) return 'now';
    const date = timestamp.toDate();
    const seconds = Math.floor((new Date() - date) / 1000);
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };
  return /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      minHeight: '100vh',
      padding: '20px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'rgba(255,255,255,0.1)',
      backdropFilter: 'blur(10px)',
      borderRadius: '20px',
      padding: '20px',
      marginBottom: '20px'
    }
  }, /*#__PURE__*/React.createElement("h2", {
    style: {
      margin: '0 0 15px 0',
      color: 'white'
    }
  }, "Notifications"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      background: 'rgba(255,255,255,0.2)',
      borderRadius: '15px',
      padding: '5px',
      marginBottom: '15px'
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => setFilter('all'),
    style: {
      flex: 1,
      padding: '10px',
      background: filter === 'all' ? 'white' : 'transparent',
      color: filter === 'all' ? '#764ba2' : 'white',
      border: 'none',
      borderRadius: '10px',
      cursor: 'pointer',
      fontWeight: 'bold',
      transition: 'all 0.3s'
    }
  }, "All (", notifications?.length || 0, ")"), /*#__PURE__*/React.createElement("button", {
    onClick: () => setFilter('unread'),
    style: {
      flex: 1,
      padding: '10px',
      background: filter === 'unread' ? 'white' : 'transparent',
      color: filter === 'unread' ? '#764ba2' : 'white',
      border: 'none',
      borderRadius: '10px',
      cursor: 'pointer',
      fontWeight: 'bold',
      transition: 'all 0.3s'
    }
  }, "Unread (", unreadCount, ")"), /*#__PURE__*/React.createElement("button", {
    onClick: () => setFilter('read'),
    style: {
      flex: 1,
      padding: '10px',
      background: filter === 'read' ? 'white' : 'transparent',
      color: filter === 'read' ? '#764ba2' : 'white',
      border: 'none',
      borderRadius: '10px',
      cursor: 'pointer',
      fontWeight: 'bold',
      transition: 'all 0.3s'
    }
  }, "Read")), unreadCount > 0 && /*#__PURE__*/React.createElement("button", {
    onClick: handleMarkAllRead,
    style: {
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
    }
  }, "Mark All as Read")), filteredNotifications.length === 0 ? /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'center',
      color: 'rgba(255,255,255,0.8)',
      padding: '40px',
      background: 'rgba(255,255,255,0.1)',
      borderRadius: '20px'
    }
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "bell-off",
    style: {
      width: '64px',
      height: '64px',
      marginBottom: '20px',
      opacity: 0.5
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '18px',
      fontWeight: 'bold',
      marginBottom: '10px'
    }
  }, "No ", filter === 'all' ? '' : filter, " notifications"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '14px',
      opacity: 0.8
    }
  }, "You're all caught up!")) : /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: '12px'
    }
  }, filteredNotifications.map(notification => /*#__PURE__*/React.createElement("div", {
    key: notification.id,
    onClick: () => handleNotificationClick(notification),
    style: {
      background: notification.read ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.95)',
      borderRadius: '15px',
      padding: '15px',
      cursor: 'pointer',
      transition: 'all 0.3s',
      border: notification.read ? 'none' : '2px solid #f4c430',
      position: 'relative'
    }
  }, !notification.read && /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      top: '15px',
      right: '15px',
      width: '10px',
      height: '10px',
      borderRadius: '50%',
      background: '#0077CC'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: '12px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: '40px',
      height: '40px',
      borderRadius: '50%',
      background: `linear-gradient(135deg, ${getNotificationColor(notification.type)}, ${getNotificationColor(notification.type)}cc)`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": getNotificationIcon(notification.type),
    style: {
      width: '20px',
      height: '20px',
      color: '#fff'
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      paddingRight: '20px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: notification.read ? '500' : 'bold',
      color: '#333',
      marginBottom: '5px',
      fontSize: '15px'
    }
  }, notification.title), /*#__PURE__*/React.createElement("div", {
    style: {
      color: '#666',
      fontSize: '14px',
      lineHeight: '1.4',
      marginBottom: '8px'
    }
  }, notification.message), /*#__PURE__*/React.createElement("div", {
    style: {
      color: '#999',
      fontSize: '12px'
    }
  }, formatTimeAgo(notification.createdAt))))))));
}

// Register component globally
window.GLRSApp = window.GLRSApp || {
  components: {}
};
window.GLRSApp.components = window.GLRSApp.components || {};
window.GLRSApp.components.NotificationsTab = NotificationsTab;
console.log('✅ NotificationsTab component loaded');
