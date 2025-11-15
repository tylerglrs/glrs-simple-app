// ═══════════════════════════════════════════════════════════
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
    return (
        <div
            className="content"
            ref={contentRef}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
        >
            {currentView === 'home' && (
                loading || !userData ?
                    React.createElement(LoadingSpinner, { message: 'Loading your recovery data...' }) :
                    React.createElement(window.GLRSApp.components.HomeTab)
            )}

            {currentView === 'tasks' && (
                loading || !goals || !assignments ?
                    React.createElement(LoadingSpinner, { message: 'Loading your tasks...' }) :
                    React.createElement(window.GLRSApp.components.TasksTab)
            )}

            {currentView === 'progress' && (
                loading || !checkIns ?
                    React.createElement(LoadingSpinner, { message: 'Loading your progress...' }) :
                    React.createElement(window.GLRSApp.components.JourneyTab)
            )}

            {currentView === 'connect' && (
                loading ?
                    React.createElement(LoadingSpinner, { message: 'Loading community...' }) :
                    React.createElement(window.GLRSApp.components.CommunityTab)
            )}

            {currentView === 'guides' && (
                loading || !resources ?
                    React.createElement(LoadingSpinner, { message: 'Loading resources...' }) :
                    React.createElement(window.GLRSApp.components.ResourcesView)
            )}

            {currentView === 'notifications' && (
                loading ?
                    React.createElement(LoadingSpinner, { message: 'Loading notifications...' }) :
                    React.createElement(window.GLRSApp.components.NotificationsTab)
            )}

            {currentView === 'profile' && (
                loading || !userData ?
                    React.createElement(LoadingSpinner, { message: 'Loading profile...' }) :
                    React.createElement(window.GLRSApp.components.ProfileView)
            )}
        </div>
    );
};

// Register component globally
window.GLRSApp = window.GLRSApp || { components: {} };
window.GLRSApp.components = window.GLRSApp.components || {};
window.GLRSApp.components.MainContent = MainContent;

console.log('✅ MainContent component loaded');
