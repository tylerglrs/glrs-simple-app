// ═══════════════════════════════════════════════════════════
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
    return (
        <>
            {/* Phase 2: First-Launch Disclaimer Modal */}
            {showDisclaimerModal && (
                <window.GLRSApp.modals.DisclaimerModal
                    onAccept={() => {
                        localStorage.setItem('disclaimerAccepted', 'true');
                        localStorage.setItem('disclaimerAcceptedDate', new Date().toISOString());
                        setShowDisclaimerModal(false);
                    }}
                />
            )}

            {/* Phase 2: Legal Modals */}
            {showTermsModal && (
                <window.GLRSApp.modals.LegalModal
                    type="terms"
                    onClose={() => setShowTermsModal(false)}
                />
            )}

            {showPrivacyModal && (
                <window.GLRSApp.modals.LegalModal
                    type="privacy"
                    onClose={() => setShowPrivacyModal(false)}
                />
            )}

            {showDataHandlingModal && (
                <window.GLRSApp.modals.LegalModal
                    type="dataHandling"
                    onClose={() => setShowDataHandlingModal(false)}
                />
            )}

            {/* Phase 2: Crisis Resources Modal */}
            {showCrisisModal && (
                <window.GLRSApp.modals.CrisisModal
                    onClose={() => setShowCrisisModal(false)}
                />
            )}

            {/* Tasks Sidebar Modal */}
            {showSidebar && (
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(0,0,0,0.5)',
                        display: 'flex',
                        zIndex: 10000
                    }}
                    onClick={() => setShowSidebar(false)}
                >
                    <div
                        style={{
                            width: '280px',
                            background: '#FFFFFF',
                            height: '100%',
                            boxShadow: '2px 0 12px rgba(0,0,0,0.15)',
                            overflowY: 'auto',
                            animation: 'slideInLeft 0.3s ease-out'
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div style={{
                            padding: '20px',
                            borderBottom: '1px solid #E0E0E0',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <h3 style={{ margin: 0, color: '#058585', fontSize: '18px', fontWeight: 'bold' }}>
                                Quick Actions
                            </h3>
                            <button
                                onClick={() => setShowSidebar(false)}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    fontSize: '24px',
                                    cursor: 'pointer',
                                    color: '#666',
                                    padding: '0',
                                    width: '32px',
                                    height: '32px'
                                }}
                            >
                                ×
                            </button>
                        </div>

                        <div style={{ padding: '10px' }}>
                            {/* Habit Tracker Button */}
                            <button
                                onClick={() => {
                                    setShowHabitTrackerModal(true);
                                    setShowSidebar(false);
                                }}
                                style={{
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
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(5, 133, 133, 0.4)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(5, 133, 133, 0.3)';
                                }}
                            >
                                <span style={{ fontSize: '20px' }}>✓</span>
                                <span>Habit Tracker</span>
                            </button>

                            {/* Additional sidebar buttons would go here */}
                            {/* These are just examples - actual implementation depends on what's in PIRapp.js */}
                        </div>
                    </div>
                </div>
            )}

            {/* Incomplete Tasks Modal */}
            {showIncompleteTasksModal && app?.goals && (
                <div
                    style={{
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
                    }}
                    onClick={() => setShowIncompleteTasksModal(false)}
                >
                    <div
                        style={{
                            background: '#fff',
                            borderRadius: '15px',
                            maxWidth: '500px',
                            width: '100%',
                            maxHeight: '80vh',
                            overflow: 'auto',
                            boxShadow: '0 8px 32px rgba(0,0,0,0.2)'
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div style={{
                            padding: '20px',
                            borderBottom: '2px solid #FFA500',
                            background: 'linear-gradient(135deg, #FFA500 0%, #FF8C00 100%)',
                            color: '#fff',
                            borderRadius: '15px 15px 0 0'
                        }}>
                            <h2 style={{ margin: 0, fontSize: '24px' }}>⚠️ Incomplete Tasks</h2>
                        </div>

                        <div style={{ padding: '20px' }}>
                            <p style={{ color: '#666', marginBottom: '20px' }}>
                                You have unfinished tasks from your goals. Complete them to make progress!
                            </p>

                            {app.goals
                                .filter(goal => goal.status === 'active')
                                .map(goal => {
                                    const incompleteTasks = (app.assignments || [])
                                        .filter(a => a.goalId === goal.id && a.status !== 'completed');

                                    if (incompleteTasks.length === 0) return null;

                                    return (
                                        <div key={goal.id} style={{
                                            marginBottom: '20px',
                                            padding: '15px',
                                            background: '#f8f9fa',
                                            borderRadius: '10px',
                                            border: '1px solid #ddd'
                                        }}>
                                            <h3 style={{ margin: '0 0 10px 0', color: '#333', fontSize: '16px' }}>
                                                {goal.title}
                                            </h3>
                                            <ul style={{ margin: 0, paddingLeft: '20px' }}>
                                                {incompleteTasks.map(task => (
                                                    <li key={task.id} style={{ color: '#666', fontSize: '14px', marginBottom: '5px' }}>
                                                        {task.title}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    );
                                })
                            }

                            <button
                                onClick={() => setShowIncompleteTasksModal(false)}
                                style={{
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
                                }}
                            >
                                Got It
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

// Register component globally
window.GLRSApp = window.GLRSApp || {};
window.GLRSApp.components = window.GLRSApp.components || {};
window.GLRSApp.components.ModalRenderer = ModalRenderer;

console.log('✅ ModalRenderer component loaded');
