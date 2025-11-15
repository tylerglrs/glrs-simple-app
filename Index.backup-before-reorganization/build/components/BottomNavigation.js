// ═══════════════════════════════════════════════════════════
// BOTTOM NAVIGATION COMPONENT
// Main app navigation bar with 6 tabs
// ✅ PHASE 8C-5: Converted to use Context API
// ═══════════════════════════════════════════════════════════

const BottomNavigation = () => {
  // Get state from Context
  const {
    currentView,
    setCurrentView,
    unreadCount,
    triggerHaptic
  } = useAppContext();
  return /*#__PURE__*/React.createElement("div", {
    className: "bottom-nav"
  }, /*#__PURE__*/React.createElement("div", {
    className: `nav-item ${currentView === 'tasks' ? 'active' : ''}`,
    onClick: () => {
      if (typeof triggerHaptic === 'function') triggerHaptic('light');
      setCurrentView('tasks');
    }
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "check-square",
    className: "nav-icon"
  }), /*#__PURE__*/React.createElement("div", {
    className: "nav-label"
  }, "Tasks")), /*#__PURE__*/React.createElement("div", {
    className: `nav-item ${currentView === 'progress' ? 'active' : ''}`,
    onClick: () => {
      if (typeof triggerHaptic === 'function') triggerHaptic('light');
      setCurrentView('progress');
    }
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "trending-up",
    className: "nav-icon"
  }), /*#__PURE__*/React.createElement("div", {
    className: "nav-label"
  }, "Journey")), /*#__PURE__*/React.createElement("div", {
    className: `nav-item ${currentView === 'home' ? 'active' : ''}`,
    onClick: () => {
      if (typeof triggerHaptic === 'function') triggerHaptic('light');
      setCurrentView('home');
    }
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "home",
    className: "nav-icon"
  }), /*#__PURE__*/React.createElement("div", {
    className: "nav-label"
  }, "Home")), /*#__PURE__*/React.createElement("div", {
    className: `nav-item ${currentView === 'connect' ? 'active' : ''}`,
    onClick: () => {
      if (typeof triggerHaptic === 'function') triggerHaptic('light');
      setCurrentView('connect');
    }
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "message-circle",
    className: "nav-icon"
  }), /*#__PURE__*/React.createElement("div", {
    className: "nav-label"
  }, "Connect")), /*#__PURE__*/React.createElement("div", {
    className: `nav-item ${currentView === 'guides' ? 'active' : ''}`,
    onClick: () => {
      if (typeof triggerHaptic === 'function') triggerHaptic('light');
      setCurrentView('guides');
    }
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "book-open",
    className: "nav-icon"
  }), /*#__PURE__*/React.createElement("div", {
    className: "nav-label"
  }, "Guides")), /*#__PURE__*/React.createElement("div", {
    className: `nav-item ${currentView === 'notifications' ? 'active' : ''}`,
    onClick: () => {
      if (typeof triggerHaptic === 'function') triggerHaptic('light');
      setCurrentView('notifications');
    }
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "bell",
    className: "nav-icon"
  }), /*#__PURE__*/React.createElement("div", {
    className: "nav-label"
  }, "Notifications"), unreadCount > 0 && /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      top: '8px',
      right: '50%',
      marginRight: '-16px',
      background: '#ff4757',
      color: '#fff',
      borderRadius: '50%',
      width: '16px',
      height: '16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '10px',
      fontWeight: 'bold'
    }
  }, unreadCount > 9 ? '9+' : unreadCount)));
};

// Register component globally
window.GLRSApp = window.GLRSApp || {
  components: {}
};
window.GLRSApp.components = window.GLRSApp.components || {};
window.GLRSApp.components.BottomNavigation = BottomNavigation;
console.log('✅ BottomNavigation component loaded');