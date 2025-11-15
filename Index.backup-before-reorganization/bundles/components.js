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
console.log('✅ BottomNavigation component loaded');// ═══════════════════════════════════════════════════════════
// CRISIS BUTTON COMPONENT
// Floating emergency resources button
// ✅ PHASE 8C-5: Converted to use Context API
// ═══════════════════════════════════════════════════════════

const CrisisButton = () => {
  // Get state from Context
  const {
    setShowCrisisModal
  } = useAppContext();
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'fixed',
      bottom: '90px',
      right: '20px',
      zIndex: 999
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => setShowCrisisModal(true),
    style: {
      background: '#DC143C',
      color: '#fff',
      width: '60px',
      height: '60px',
      borderRadius: '50%',
      border: 'none',
      fontSize: '28px',
      cursor: 'pointer',
      boxShadow: '0 4px 12px rgba(220, 20, 60, 0.4)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    title: "Crisis Resources"
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "alert-octagon",
    style: {
      width: '32px',
      height: '32px'
    }
  })));
};

// Register component globally
window.GLRSApp = window.GLRSApp || {
  components: {}
};
window.GLRSApp.components = window.GLRSApp.components || {};
window.GLRSApp.components.CrisisButton = CrisisButton;
console.log('✅ CrisisButton component loaded');// ═══════════════════════════════════════════════════════════
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
console.log('✅ HeaderBar component loaded');// ═══════════════════════════════════════════════════════════
// LEGAL FOOTER COMPONENT
// Terms of Service, Privacy Policy, and Data Handling links
// ✅ PHASE 8C-5: Converted to use Context API
// ═══════════════════════════════════════════════════════════

const LegalFooter = () => {
  // Get state from Context
  const {
    setShowTermsModal,
    setShowPrivacyModal,
    setShowDataHandlingModal
  } = useAppContext();
  return /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'center',
      padding: '20px',
      background: 'rgba(0,0,0,0.1)',
      borderTop: '1px solid rgba(255,255,255,0.1)',
      marginBottom: '70px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '12px',
      color: 'rgba(255,255,255,0.7)',
      marginBottom: '10px'
    }
  }, /*#__PURE__*/React.createElement("a", {
    href: "#",
    onClick: e => {
      e.preventDefault();
      setShowTermsModal(true);
    },
    style: {
      color: 'rgba(255,255,255,0.9)',
      textDecoration: 'none',
      margin: '0 10px'
    }
  }, "Terms of Service"), /*#__PURE__*/React.createElement("span", null, "\u2022"), /*#__PURE__*/React.createElement("a", {
    href: "#",
    onClick: e => {
      e.preventDefault();
      setShowPrivacyModal(true);
    },
    style: {
      color: 'rgba(255,255,255,0.9)',
      textDecoration: 'none',
      margin: '0 10px'
    }
  }, "Privacy Policy"), /*#__PURE__*/React.createElement("span", null, "\u2022"), /*#__PURE__*/React.createElement("a", {
    href: "#",
    onClick: e => {
      e.preventDefault();
      setShowDataHandlingModal(true);
    },
    style: {
      color: 'rgba(255,255,255,0.9)',
      textDecoration: 'none',
      margin: '0 10px'
    }
  }, "Data Handling")), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '11px',
      color: 'rgba(255,255,255,0.5)'
    }
  }, "\xA9 2025 Guiding Light Recovery Services. All rights reserved."));
};

// Register component globally
window.GLRSApp = window.GLRSApp || {
  components: {}
};
window.GLRSApp.components = window.GLRSApp.components || {};
window.GLRSApp.components.LegalFooter = LegalFooter;
console.log('✅ LegalFooter component loaded');// ═══════════════════════════════════════════════════════════
// LOADING SPINNER COMPONENT
// Reusable loading indicator with optional message
// ═══════════════════════════════════════════════════════════

const LoadingSpinner = ({
  message = 'Loading...'
}) => {
  return React.createElement('div', {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '60vh',
      flexDirection: 'column',
      gap: '15px'
    }
  }, [React.createElement('div', {
    key: 'spinner',
    style: {
      width: '50px',
      height: '50px',
      border: '4px solid rgba(6, 148, 148, 0.2)',
      borderTop: '4px solid #069494',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite'
    }
  }), React.createElement('div', {
    key: 'message',
    style: {
      color: '#666',
      fontSize: '14px',
      fontWeight: '500'
    }
  }, message)]);
};

// Register globally
window.GLRSApp = window.GLRSApp || {};
window.GLRSApp.components = window.GLRSApp.components || {};
window.GLRSApp.components.LoadingSpinner = LoadingSpinner;
console.log('✅ LoadingSpinner component loaded');// ═══════════════════════════════════════════════════════════
// MAIN CONTENT COMPONENT
// View router - renders appropriate tab based on currentView
// ✅ PHASE 8C-1: Converted to use Context API
// ✅ PHASE 8C-3: All 5 main tabs now use Context (no app prop)
// ✅ PHASE 8C-4: Added NotificationsTab & ProfileView (7 views total)
// ═══════════════════════════════════════════════════════════

const MainContent = ({
  contentRef,
  handleTouchStart,
  handleTouchMove,
  handleTouchEnd
}) => {
  // Get state from Context
  const {
    currentView,
    loading,
    userData,
    goals,
    assignments,
    checkIns,
    resources
  } = useAppContext();

  // LoadingSpinner component reference
  const LoadingSpinner = window.GLRSApp.components.LoadingSpinner;
  return /*#__PURE__*/React.createElement("div", {
    className: "content",
    ref: contentRef,
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd
  }, currentView === 'home' && (loading || !userData ? React.createElement(LoadingSpinner, {
    message: 'Loading your recovery data...'
  }) : React.createElement(window.GLRSApp.components.HomeTab)), currentView === 'tasks' && (loading || !goals || !assignments ? React.createElement(LoadingSpinner, {
    message: 'Loading your tasks...'
  }) : React.createElement(window.GLRSApp.components.TasksTab)), currentView === 'progress' && (loading || !checkIns ? React.createElement(LoadingSpinner, {
    message: 'Loading your progress...'
  }) : React.createElement(window.GLRSApp.components.JourneyTab)), currentView === 'connect' && (loading ? React.createElement(LoadingSpinner, {
    message: 'Loading community...'
  }) : React.createElement(window.GLRSApp.components.CommunityTab)), currentView === 'guides' && (loading || !resources ? React.createElement(LoadingSpinner, {
    message: 'Loading resources...'
  }) : React.createElement(window.GLRSApp.components.ResourcesView)), currentView === 'notifications' && (loading ? React.createElement(LoadingSpinner, {
    message: 'Loading notifications...'
  }) : React.createElement(window.GLRSApp.components.NotificationsTab)), currentView === 'profile' && (loading || !userData ? React.createElement(LoadingSpinner, {
    message: 'Loading profile...'
  }) : React.createElement(window.GLRSApp.components.ProfileView)));
};

// Register component globally
window.GLRSApp = window.GLRSApp || {
  components: {}
};
window.GLRSApp.components = window.GLRSApp.components || {};
window.GLRSApp.components.MainContent = MainContent;
console.log('✅ MainContent component loaded');// ═══════════════════════════════════════════════════════════
// MODAL RENDERER COMPONENT
// Centralized modal declarations extracted from PIRapp.js
// Renders all app-level modals based on state
// ✅ PHASE 8C-5: Converted to use Context API
// ═══════════════════════════════════════════════════════════

const ModalRenderer = () => {
  // Get ALL modal state from Context (no props needed!)
  const {
    // Modal States
    showDisclaimerModal,
    showTermsModal,
    showPrivacyModal,
    showDataHandlingModal,
    showCrisisModal,
    showSidebar,
    showHabitTrackerModal,
    showAffirmationModal,
    showMoodTrackerModal,
    showCravingTrackerModal,
    showAnxietyTrackerModal,
    showSleepTrackerModal,
    showGratitudeJournalModal,
    showDailyReflectionModal,
    showGoalSettingModal,
    showProgressReviewModal,
    showCheckInHistoryModal,
    showMilestoneModal,
    showAchievementsModal,
    showResourceLibraryModal,
    showCommunityModal,
    showMessagingModal,
    showProfileEditModal,
    showSettingsModal,
    showNotificationsModal,
    showCalendarModal,
    showDataExportModal,
    showFeedbackModal,
    showHelpModal,
    showIncompleteTasksModal,
    // Setters
    setShowDisclaimerModal,
    setShowTermsModal,
    setShowPrivacyModal,
    setShowDataHandlingModal,
    setShowCrisisModal,
    setShowSidebar,
    setShowHabitTrackerModal,
    setShowAffirmationModal,
    setShowMoodTrackerModal,
    setShowCravingTrackerModal,
    setShowAnxietyTrackerModal,
    setShowSleepTrackerModal,
    setShowGratitudeJournalModal,
    setShowDailyReflectionModal,
    setShowGoalSettingModal,
    setShowProgressReviewModal,
    setShowCheckInHistoryModal,
    setShowMilestoneModal,
    setShowAchievementsModal,
    setShowResourceLibraryModal,
    setShowCommunityModal,
    setShowMessagingModal,
    setShowProfileEditModal,
    setShowSettingsModal,
    setShowNotificationsModal,
    setShowCalendarModal,
    setShowDataExportModal,
    setShowFeedbackModal,
    setShowHelpModal,
    setShowIncompleteTasksModal

    // Note: No app object needed - all state comes from Context
  } = useAppContext();
  return /*#__PURE__*/React.createElement(React.Fragment, null, showDisclaimerModal && /*#__PURE__*/React.createElement(window.GLRSApp.modals.DisclaimerModal, {
    onAccept: () => {
      localStorage.setItem('disclaimerAccepted', 'true');
      localStorage.setItem('disclaimerAcceptedDate', new Date().toISOString());
      setShowDisclaimerModal(false);
    }
  }), showTermsModal && /*#__PURE__*/React.createElement(window.GLRSApp.modals.LegalModal, {
    type: "terms",
    onClose: () => setShowTermsModal(false)
  }), showPrivacyModal && /*#__PURE__*/React.createElement(window.GLRSApp.modals.LegalModal, {
    type: "privacy",
    onClose: () => setShowPrivacyModal(false)
  }), showDataHandlingModal && /*#__PURE__*/React.createElement(window.GLRSApp.modals.LegalModal, {
    type: "dataHandling",
    onClose: () => setShowDataHandlingModal(false)
  }), showCrisisModal && /*#__PURE__*/React.createElement(window.GLRSApp.modals.CrisisModal, {
    onClose: () => setShowCrisisModal(false)
  }), showSidebar && /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex',
      zIndex: 10000
    },
    onClick: () => setShowSidebar(false)
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: '280px',
      background: '#FFFFFF',
      height: '100%',
      boxShadow: '2px 0 12px rgba(0,0,0,0.15)',
      overflowY: 'auto',
      animation: 'slideInLeft 0.3s ease-out'
    },
    onClick: e => e.stopPropagation()
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '20px',
      borderBottom: '1px solid #E0E0E0',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("h3", {
    style: {
      margin: 0,
      color: '#058585',
      fontSize: '18px',
      fontWeight: 'bold'
    }
  }, "Quick Actions"), /*#__PURE__*/React.createElement("button", {
    onClick: () => setShowSidebar(false),
    style: {
      background: 'none',
      border: 'none',
      fontSize: '24px',
      cursor: 'pointer',
      color: '#666',
      padding: '0',
      width: '32px',
      height: '32px'
    }
  }, "\xD7")), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '10px'
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => {
      setShowHabitTrackerModal(true);
      setShowSidebar(false);
    },
    style: {
      width: '100%',
      padding: '15px',
      marginBottom: '10px',
      background: 'linear-gradient(135deg, #058585 0%, #047575 100%)',
      color: 'white',
      border: 'none',
      borderRadius: '12px',
      cursor: 'pointer',
      fontSize: '15px',
      fontWeight: '600',
      textAlign: 'left',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      boxShadow: '0 2px 8px rgba(5, 133, 133, 0.3)',
      transition: 'all 0.2s ease'
    },
    onMouseEnter: e => {
      e.currentTarget.style.transform = 'translateY(-2px)';
      e.currentTarget.style.boxShadow = '0 4px 12px rgba(5, 133, 133, 0.4)';
    },
    onMouseLeave: e => {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = '0 2px 8px rgba(5, 133, 133, 0.3)';
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: '20px'
    }
  }, "\u2713"), /*#__PURE__*/React.createElement("span", null, "Habit Tracker"))))), showIncompleteTasksModal && app?.goals && /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10000,
      padding: '20px'
    },
    onClick: () => setShowIncompleteTasksModal(false)
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: '#fff',
      borderRadius: '15px',
      maxWidth: '500px',
      width: '100%',
      maxHeight: '80vh',
      overflow: 'auto',
      boxShadow: '0 8px 32px rgba(0,0,0,0.2)'
    },
    onClick: e => e.stopPropagation()
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '20px',
      borderBottom: '2px solid #FFA500',
      background: 'linear-gradient(135deg, #FFA500 0%, #FF8C00 100%)',
      color: '#fff',
      borderRadius: '15px 15px 0 0'
    }
  }, /*#__PURE__*/React.createElement("h2", {
    style: {
      margin: 0,
      fontSize: '24px'
    }
  }, "\u26A0\uFE0F Incomplete Tasks")), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '20px'
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      color: '#666',
      marginBottom: '20px'
    }
  }, "You have unfinished tasks from your goals. Complete them to make progress!"), app.goals.filter(goal => goal.status === 'active').map(goal => {
    const incompleteTasks = (app.assignments || []).filter(a => a.goalId === goal.id && a.status !== 'completed');
    if (incompleteTasks.length === 0) return null;
    return /*#__PURE__*/React.createElement("div", {
      key: goal.id,
      style: {
        marginBottom: '20px',
        padding: '15px',
        background: '#f8f9fa',
        borderRadius: '10px',
        border: '1px solid #ddd'
      }
    }, /*#__PURE__*/React.createElement("h3", {
      style: {
        margin: '0 0 10px 0',
        color: '#333',
        fontSize: '16px'
      }
    }, goal.title), /*#__PURE__*/React.createElement("ul", {
      style: {
        margin: 0,
        paddingLeft: '20px'
      }
    }, incompleteTasks.map(task => /*#__PURE__*/React.createElement("li", {
      key: task.id,
      style: {
        color: '#666',
        fontSize: '14px',
        marginBottom: '5px'
      }
    }, task.title))));
  }), /*#__PURE__*/React.createElement("button", {
    onClick: () => setShowIncompleteTasksModal(false),
    style: {
      width: '100%',
      padding: '12px',
      background: '#FFA500',
      color: '#fff',
      border: 'none',
      borderRadius: '8px',
      fontSize: '16px',
      fontWeight: 'bold',
      cursor: 'pointer',
      marginTop: '10px'
    }
  }, "Got It")))));
};

// Register component globally
window.GLRSApp = window.GLRSApp || {};
window.GLRSApp.components = window.GLRSApp.components || {};
window.GLRSApp.components.ModalRenderer = ModalRenderer;
console.log('✅ ModalRenderer component loaded');// ═══════════════════════════════════════════════════════════
// PULL-TO-REFRESH INDICATOR COMPONENT
// Visual indicator shown during pull-to-refresh gesture
// ✅ PHASE 8C-5: Converted to use Context API
// ═══════════════════════════════════════════════════════════

const PullToRefreshIndicator = () => {
  // Get state from Context
  const {
    pulling,
    pullDistance,
    refreshing
  } = useAppContext();
  if (!pulling) return null;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      top: '80px',
      left: '50%',
      transform: `translateX(-50%) translateY(${Math.min(pullDistance, 80)}px)`,
      zIndex: 999,
      transition: refreshing ? 'transform 0.3s' : 'none'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: '40px',
      height: '40px',
      borderRadius: '50%',
      background: 'var(--color-primary)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0 2px 8px rgba(6, 148, 148, 0.3)',
      animation: refreshing ? 'spin 1s linear infinite' : 'none'
    }
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": refreshing ? "loader" : "arrow-down",
    style: {
      width: '24px',
      height: '24px',
      color: '#fff'
    }
  })));
};

// Register component globally
window.GLRSApp = window.GLRSApp || {
  components: {}
};
window.GLRSApp.components = window.GLRSApp.components || {};
window.GLRSApp.components.PullToRefreshIndicator = PullToRefreshIndicator;
console.log('✅ PullToRefreshIndicator component loaded');