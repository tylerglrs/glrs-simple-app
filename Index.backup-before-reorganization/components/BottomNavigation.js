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
    return (
        <div className="bottom-nav">
            <div
                className={`nav-item ${currentView === 'tasks' ? 'active' : ''}`}
                onClick={() => {
                    if (typeof triggerHaptic === 'function') triggerHaptic('light');
                    setCurrentView('tasks');
                }}
            >
                <i data-lucide="check-square" className="nav-icon"></i>
                <div className="nav-label">Tasks</div>
            </div>
            <div
                className={`nav-item ${currentView === 'progress' ? 'active' : ''}`}
                onClick={() => {
                    if (typeof triggerHaptic === 'function') triggerHaptic('light');
                    setCurrentView('progress');
                }}
            >
                <i data-lucide="trending-up" className="nav-icon"></i>
                <div className="nav-label">Journey</div>
            </div>
            <div
                className={`nav-item ${currentView === 'home' ? 'active' : ''}`}
                onClick={() => {
                    if (typeof triggerHaptic === 'function') triggerHaptic('light');
                    setCurrentView('home');
                }}
            >
                <i data-lucide="home" className="nav-icon"></i>
                <div className="nav-label">Home</div>
            </div>
            <div
                className={`nav-item ${currentView === 'connect' ? 'active' : ''}`}
                onClick={() => {
                    if (typeof triggerHaptic === 'function') triggerHaptic('light');
                    setCurrentView('connect');
                }}
            >
                <i data-lucide="message-circle" className="nav-icon"></i>
                <div className="nav-label">Connect</div>
            </div>
            <div
                className={`nav-item ${currentView === 'guides' ? 'active' : ''}`}
                onClick={() => {
                    if (typeof triggerHaptic === 'function') triggerHaptic('light');
                    setCurrentView('guides');
                }}
            >
                <i data-lucide="book-open" className="nav-icon"></i>
                <div className="nav-label">Guides</div>
            </div>
            <div
                className={`nav-item ${currentView === 'notifications' ? 'active' : ''}`}
                onClick={() => {
                    if (typeof triggerHaptic === 'function') triggerHaptic('light');
                    setCurrentView('notifications');
                }}
            >
                <i data-lucide="bell" className="nav-icon"></i>
                <div className="nav-label">Notifications</div>
                {unreadCount > 0 && (
                    <span style={{
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
                    }}>
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </div>
        </div>
    );
};

// Register component globally
window.GLRSApp = window.GLRSApp || { components: {} };
window.GLRSApp.components = window.GLRSApp.components || {};
window.GLRSApp.components.BottomNavigation = BottomNavigation;

console.log('✅ BottomNavigation component loaded');
