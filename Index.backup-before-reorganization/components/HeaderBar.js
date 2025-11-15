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
    return (
        <div className="header">
            <div className="header-title" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {currentView === 'tasks' && (
                    <div
                        onClick={() => {
                            if (typeof window.GLRSApp?.utils?.triggerHaptic === 'function') {
                                window.GLRSApp.utils.triggerHaptic('light');
                            }
                            setShowSidebar(true);
                        }}
                        style={{
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '4px'
                        }}
                    >
                        <i data-lucide="menu" style={{ width: '24px', height: '24px', color: '#058585' }}></i>
                    </div>
                )}
                {currentView === 'home' && 'Home'}
                {currentView === 'tasks' && 'Tasks'}
                {currentView === 'progress' && 'Journey'}
                {currentView === 'connect' && 'Community'}
                {currentView === 'guides' && 'Guides'}
                {currentView === 'notifications' && 'Notifications'}
            </div>
            <div className="header-actions">
                {currentView === 'home' && (
                    <button className="header-btn">
                        <i data-lucide="filter" style={{width: '18px', height: '18px'}}></i>
                    </button>
                )}
                {currentView === 'tasks' && (
                    <button className="header-btn" onClick={() => setShowIncompleteTasksModal(true)}>
                        <span>Task</span>
                    </button>
                )}
                {currentView === 'progress' && (
                    <button className="header-btn" onClick={() => {
                        if (typeof window.GLRSApp?.utils?.triggerHaptic === 'function') {
                            window.GLRSApp.utils.triggerHaptic('light');
                        }
                        setShowMilestoneModal(true);
                    }}>
                        <i data-lucide="calendar-range" style={{width: '18px', height: '18px'}}></i>
                    </button>
                )}
                {currentView === 'connect' && (
                    <button className="header-btn">
                        <i data-lucide="search" style={{width: '18px', height: '18px'}}></i>
                    </button>
                )}
                {currentView === 'guides' && (
                    <button className="header-btn">
                        <i data-lucide="search" style={{width: '18px', height: '18px'}}></i>
                    </button>
                )}
                {currentView === 'notifications' && (
                    <button className="header-btn" onClick={markAllNotificationsAsRead}>
                        <span>Mark All Read</span>
                    </button>
                )}
                <div className="header-avatar" onClick={() => setShowProfileModal(true)}>
                    {(userData?.displayName || userData?.firstName || user?.email || 'U').charAt(0).toUpperCase()}
                </div>
            </div>
        </div>
    );
};

// Register component globally
window.GLRSApp = window.GLRSApp || { components: {} };
window.GLRSApp.components = window.GLRSApp.components || {};
window.GLRSApp.components.HeaderBar = HeaderBar;

console.log('✅ HeaderBar component loaded');
