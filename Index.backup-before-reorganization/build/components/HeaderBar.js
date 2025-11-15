// ═══════════════════════════════════════════════════════════
// HEADERBAR COMPONENT
// Top navigation bar with view-specific actions
// ✅ PHASE 8C-5: Converted to use Context API
// ═══════════════════════════════════════════════════════════

const HeaderBar = () => {
  // Get state from Context
  const {
    currentView,
    setShowSidebar,
    setShowIncompleteTasksModal,
    setShowMilestoneModal,
    setShowProfileModal,
    markAllNotificationsAsRead,
    userData,
    user
  } = useAppContext();
  return /*#__PURE__*/React.createElement("div", {
    className: "header"
  }, /*#__PURE__*/React.createElement("div", {
    className: "header-title",
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: '10px'
    }
  }, currentView === 'tasks' && /*#__PURE__*/React.createElement("div", {
    onClick: () => {
      if (typeof window.GLRSApp?.utils?.triggerHaptic === 'function') {
        window.GLRSApp.utils.triggerHaptic('light');
      }
      setShowSidebar(true);
    },
    style: {
      cursor: 'pointer',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '4px'
    }
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "menu",
    style: {
      width: '24px',
      height: '24px',
      color: '#058585'
    }
  })), currentView === 'home' && 'Home', currentView === 'tasks' && 'Tasks', currentView === 'progress' && 'Journey', currentView === 'connect' && 'Community', currentView === 'guides' && 'Guides', currentView === 'notifications' && 'Notifications'), /*#__PURE__*/React.createElement("div", {
    className: "header-actions"
  }, currentView === 'home' && /*#__PURE__*/React.createElement("button", {
    className: "header-btn"
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "filter",
    style: {
      width: '18px',
      height: '18px'
    }
  })), currentView === 'tasks' && /*#__PURE__*/React.createElement("button", {
    className: "header-btn",
    onClick: () => setShowIncompleteTasksModal(true)
  }, /*#__PURE__*/React.createElement("span", null, "Task")), currentView === 'progress' && /*#__PURE__*/React.createElement("button", {
    className: "header-btn",
    onClick: () => {
      if (typeof window.GLRSApp?.utils?.triggerHaptic === 'function') {
        window.GLRSApp.utils.triggerHaptic('light');
      }
      setShowMilestoneModal(true);
    }
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "calendar-range",
    style: {
      width: '18px',
      height: '18px'
    }
  })), currentView === 'connect' && /*#__PURE__*/React.createElement("button", {
    className: "header-btn"
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "search",
    style: {
      width: '18px',
      height: '18px'
    }
  })), currentView === 'guides' && /*#__PURE__*/React.createElement("button", {
    className: "header-btn"
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "search",
    style: {
      width: '18px',
      height: '18px'
    }
  })), currentView === 'notifications' && /*#__PURE__*/React.createElement("button", {
    className: "header-btn",
    onClick: markAllNotificationsAsRead
  }, /*#__PURE__*/React.createElement("span", null, "Mark All Read")), /*#__PURE__*/React.createElement("div", {
    className: "header-avatar",
    onClick: () => setShowProfileModal(true)
  }, (userData?.displayName || userData?.firstName || user?.email || 'U').charAt(0).toUpperCase())));
};

// Register component globally
window.GLRSApp = window.GLRSApp || {
  components: {}
};
window.GLRSApp.components = window.GLRSApp.components || {};
window.GLRSApp.components.HeaderBar = HeaderBar;
console.log('✅ HeaderBar component loaded');