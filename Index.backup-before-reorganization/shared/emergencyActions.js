// ═══════════════════════════════════════════════════════════
// EMERGENCY & ALERT ACTIONS
// Business logic for SOS triggers and emergency alerts
// ═══════════════════════════════════════════════════════════

// ==========================================
// TRIGGER SOS EMERGENCY ALERT
// ==========================================

const triggerSOS = async ({ user, userData, db, firebase }) => {
    if (confirm('This will send an emergency alert to your coach. Continue?')) {
        try {
            await db.collection('alerts').add({
                userId: user.uid,
                type: 'sos',
                status: 'active',
                severity: 'critical',
                message: 'Emergency SOS triggered',
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });

            // Create notification for coach
            if (userData?.assignedCoach) {
                await db.collection('notifications').add({
                    userId: userData.assignedCoach,
                    type: 'emergency',
                    title: 'EMERGENCY SOS',
                    message: `${userData.displayName || user.email} has triggered an emergency alert!`,
                    pirId: user.uid,
                    severity: 'critical',
                    read: false,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                });
            }

            alert('Emergency alert sent. Your coach has been notified.');
        } catch (error) {
            console.error('Error triggering SOS:', error);
            alert('Failed to send alert. Please call 988 for immediate help.');
        }
    }
};

// Register globally
window.GLRSApp = window.GLRSApp || { shared: {} };
window.GLRSApp.shared = window.GLRSApp.shared || {};
window.GLRSApp.shared.emergencyActions = {
    triggerSOS
};

console.log('✅ Emergency actions loaded');
