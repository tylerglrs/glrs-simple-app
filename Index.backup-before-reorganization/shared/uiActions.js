// ═══════════════════════════════════════════════════════════
// UI ACTIONS
// Business logic for UI interactions and state changes
// ═══════════════════════════════════════════════════════════

// ==========================================
// HANDLE PROFILE IMAGE SELECTION
// ==========================================

const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
        // Check file type
        if (!file.type.startsWith('image/')) {
            window.GLRSApp.utils.showNotification('Please select an image file', 'error');
            return;
        }

        // Use the upload handler from handlers.js
        window.GLRSApp.handlers.handleProfileImageUpload(file);
    }
};

// ==========================================
// DISMISS BROADCAST MESSAGE
// ==========================================

const dismissBroadcast = ({ setBroadcastDismissed, setActiveBroadcast }) => {
    setBroadcastDismissed(true);
    setActiveBroadcast(null);
};

// Register globally
window.GLRSApp = window.GLRSApp || { shared: {} };
window.GLRSApp.shared = window.GLRSApp.shared || {};
window.GLRSApp.shared.uiActions = {
    handleImageSelect,
    dismissBroadcast
};

console.log('✅ UI actions loaded');
