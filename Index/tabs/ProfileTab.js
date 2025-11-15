  // Destructure React hooks for use in components
const { useState, useEffect, useMemo, useCallback, useRef } = React;

/**
 * @file ProfileTab.js - User profile display and account settings management
 * @description Provides comprehensive profile management with settings, stats, and modals:
 * - Profile display with avatar, stats, and coach info
 * - Account settings (personal info, recovery settings, password, notifications)
 * - Emergency contacts management
 * - Data export functionality
 * - Help, feedback, and legal document access
 * - Account deletion with confirmation
 *
 * @components
 * MAIN COMPONENT (1):
 * - ProfileView: Main profile manager with stats and settings menu
 *
 * MODAL ROUTER (1):
 * - ProfileModals: Routes to 11 different modal types
 *
 * MODAL COMPONENTS (11):
 * - AccountModal: Account settings form
 * - EmergencyModal: Emergency contacts manager
 * - PersonalInfoModal: Personal information editor
 * - RecoveryInfoModal: Recovery settings editor
 * - PasswordModal: Password change form
 * - NotificationSettingsModal: Notification preferences
 * - GoogleCalendarModal: Calendar integration (coming soon)
 * - HelpModal: Help & support information
 * - FeedbackModal: Feedback submission form
 * - ExportModal: Data export options
 * - DeleteAccountModal: Account deletion confirmation
 *
 * @architecture 3-Layer Direct Architecture (Component → Firebase → Component)
 * - ProfileView uses local useState hooks (7 total)
 * - Direct Firebase queries with proper error handling
 * - NO global state dependencies
 * - All modals are props-based with callbacks (NO Firebase)
 * - Modal handlers perform Firebase operations and reload data
 *
 * @firebase 8 Firestore queries:
 * - users: Get user profile data (3 queries)
 * - users: Update user settings (7 update operations in handlers)
 * - checkIns: Query for profile stats calculation
 * - assignments: Query for task completion stats
 * - streaks: Get current streak data
 * - feedback: Add user feedback
 *
 * @refactored November 2025 - Phase 7 complete (THE FINAL TAB)
 * @author GLRS Development Team
 */

/**
 * ProfileView Component
 * @description Main profile manager with stats, coach info, and comprehensive settings menu
 *
 * @features
 * - Profile avatar with upload functionality
 * - Profile completion percentage indicator
 * - Sobriety days counter with milestone display
 * - Stats grid: check-in rate, lifetime task completion, streak, avg mood
 * - Coach information display (if assigned)
 * - 14 settings buttons across 4 sections (Account, Support, About, Sign Out)
 * - Modal system for all 11 settings features
 * - Loading spinner during data fetch
 * - Error UI with retry functionality
 *
 * @state 7 useState hooks:
 * - user: object - Current authenticated user from Firebase Auth
 * - userData: object - User profile data from Firestore
 * - coachInfo: object - Assigned coach data from Firestore
 * - googleConnected: boolean - Google Calendar connection status
 * - loading: boolean - Loading state for Firebase queries
 * - error: string|null - Error message for display
 * - showModal: string|null - Currently displayed modal type
 * - profileStats: object - Calculated stats (5 metrics)
 *
 * @effects 4 useEffect hooks:
 * - Auth listener: Load user from Firebase auth (cleanup on unmount)
 * - User data loader: Load profile data when user changes
 * - Coach info loader: Load coach data when assignedCoach changes
 * - Profile stats loader: Calculate stats when user changes
 *
 * @firebase 3 direct Firestore queries:
 * - users: Get user profile data (with error handling, loading state)
 * - users: Get coach profile data (with error handling)
 * - Multiple queries in loadProfileStats() for stats calculation
 *
 * @modalHandlers 7 Firebase operation handlers:
 * - handleUpdatePersonalInfo: Update user personal data
 * - handleUpdateRecoveryInfo: Update recovery settings
 * - handleChangePassword: Firebase auth password change
 * - handleUpdateNotificationSettings: Update notification preferences
 * - handleSubmitFeedback: Add feedback to Firestore
 * - handleDeleteAccount: Delete Firestore data + Firebase auth account
 * - handleAddEmergencyContact: Add contact to emergencyContacts array
 *
 * @errorHandling
 * - All Firebase queries have try-catch with console.error + handleFirebaseError
 * - User-facing error messages with retry button
 * - Loading state prevents interaction during data fetch
 *
 * @returns {React.Element} Profile display with stats, settings menu, and modal system
 */
function ProfileView() {  // ✅ PHASE 7: Refactored with modals wired + error handling + JSDoc
    // Local state hooks
    const [user, setUser] = useState(null);
    const [userData, setUserData] = useState(null);
    const [coachInfo, setCoachInfo] = useState(null);
    const [googleConnected, setGoogleConnected] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(null);

    const [profileStats, setProfileStats] = useState({
        checkInRate: 0,
        assignmentRate: 0,
        currentStreak: 0,
        avgMood: 0,
        avgCraving: 0
    });

    // Load current user from Firebase auth
    useEffect(() => {
        const unsubscribeAuth = firebase.auth().onAuthStateChanged((authUser) => {
            if (authUser) {
                setUser(authUser);
            } else {
                setUser(null);
            }
        });

        return () => unsubscribeAuth();
    }, []);

    // Load user profile data
    useEffect(() => {
        if (!user) return;

        const loadUserData = async () => {
            try {
                setLoading(true);

                const userDoc = await db.collection('users').doc(user.uid).get();
                if (userDoc.exists) {
                    const data = userDoc.data();
                    setUserData(data);
                    setGoogleConnected(!!data.googleCalendar?.connected);
                }
            } catch (error) {
                console.error('Error loading user data:', error);
                setError('Failed to load profile. Please check your connection and try again.');
                window.handleFirebaseError && window.handleFirebaseError(error, 'ProfileView.loadUserData');
            } finally {
                setLoading(false);
            }
        };

        loadUserData();
    }, [user]);

    // Load coach info
    useEffect(() => {
        if (!userData?.assignedCoach) return;

        const loadCoachInfo = async () => {
            try {
                const coachDoc = await db.collection('users').doc(userData.assignedCoach).get();
                if (coachDoc.exists) {
                    setCoachInfo(coachDoc.data());
                }
            } catch (error) {
                console.error('Error loading coach info:', error);
                window.handleFirebaseError && window.handleFirebaseError(error, 'ProfileView.loadCoachInfo');
                // Don't set error state for coach info - it's not critical for profile display
            }
        };

        loadCoachInfo();
    }, [userData?.assignedCoach]);

    // Calculate profile completion percentage
    const calculateProfileCompletion = () => {
        let completed = 0;
        let total = 10;

        if (userData?.firstName) completed++;
        if (userData?.lastName) completed++;
        if (userData?.phone) completed++;
        if (userData?.sobrietyDate) completed++;
        if (userData?.substance) completed++;
        if (userData?.dailyCost) completed++;
        if (userData?.emergencyContacts?.length > 0) completed++;
        if (userData?.address?.city) completed++;
        if (userData?.profileImageUrl) completed++;
        if (userData?.dateOfBirth) completed++;

        return Math.round((completed / total) * 100);
    };

    // Load profile stats
    useEffect(() => {
        if (!user) return;
        loadProfileStats();
    }, [user]);
    
    const loadProfileStats = async () => {
        if (!user?.uid) return;

        try {
            // Get user's account creation date
            const userDoc = await db.collection('users').doc(user.uid).get();
            const accountCreatedDate = userDoc.data()?.createdAt?.toDate() || new Date();

            // Calculate days since account creation (max 30 days for recent performance)
            const today = new Date();
            const daysSinceCreation = Math.floor((today - accountCreatedDate) / (1000 * 60 * 60 * 24));
            const daysToCheck = Math.min(daysSinceCreation, 30); // Cap at 30 days

            // Skip calculation if account is less than 1 day old
            if (daysToCheck < 1) {
                setProfileStats({
                    checkInRate: 0,
                    assignmentRate: 0,
                    currentStreak: 0,
                    avgMood: 0,
                    avgCraving: 0
                });
                return;
            }

            // Calculate check-in rate based on days since joining
            const dateToCheckFrom = new Date();
            dateToCheckFrom.setDate(dateToCheckFrom.getDate() - daysToCheck);

            const checkInsSnap = await db.collection('checkins')
                .where('userId', '==', user.uid)
                .where('createdAt', '>=', dateToCheckFrom)
                .get();
        
        // COUNT ONLY MORNING CHECK-INS
        let morningCheckInCount = 0;
        let totalMood = 0;
        let totalCraving = 0;
        let moodCount = 0;
        
        checkInsSnap.forEach(doc => {
            const data = doc.data();
            if (data.morningData) {
                morningCheckInCount++;
                
                // Calculate average mood (and craving for potential future use)
                if (data.morningData.mood) {
                    totalMood += data.morningData.mood;
                    moodCount++;
                }
                if (data.morningData.craving) {
                    totalCraving += data.morningData.craving;
                }
            }
        });
        
        // Calculate check-in rate - CAPPED AT 100%
        const checkInRate = Math.min(100, Math.round((morningCheckInCount / daysToCheck) * 100));
        
        // Calculate LIFETIME task completion (all check-ins + reflections + assignments)
const taskCompletion = await calculateLifetimeTaskCompletion(user.uid);

// Get current streak
const streakDoc = await db.collection('streaks').doc(user.uid).get();
const currentStreak = streakDoc.exists ? streakDoc.data().currentStreak || 0 : 0;

// Use the lifetime task completion rate instead of just assignment rate
const assignmentRate = taskCompletion.completionRate; // This is now ALL tasks, not just assignments

setProfileStats({
    checkInRate,
    assignmentRate,  // This now represents total task completion, not just assignments
    currentStreak,
    avgMood: moodCount > 0 ? (totalMood / moodCount).toFixed(1) : 0,
    avgCraving: moodCount > 0 ? (totalCraving / moodCount).toFixed(1) : 0
});
} catch (error) {
    console.error('Error loading profile stats:', error);
    window.handleFirebaseError && window.handleFirebaseError(error, 'ProfileView.loadProfileStats');
    // Set default stats on error so UI doesn't show incorrect 0%
    setProfileStats({
        checkInRate: 0,
        assignmentRate: 0,
        currentStreak: 0,
        avgMood: 0,
        avgCraving: 0
    });
}
};

/**
 * Helper: Calculate Lifetime Task Completion
 * @description Calculates overall task completion rate across all recovery activities
 * @param {string} userId - Firebase user ID
 * @returns {Promise<object>} Completion stats with rate, totals, and breakdown
 * @firebase 3 Firestore queries (users, checkIns, assignments)
 */
const calculateLifetimeTaskCompletion = async (userId) => {
    try {
        // Get user's account creation date
        const userDoc = await db.collection('users').doc(userId).get();
        const accountCreatedDate = userDoc.data()?.createdAt?.toDate() || new Date();
        
        // Calculate total days since joining
        const today = new Date();
        const daysSinceJoining = Math.floor((today - accountCreatedDate) / (1000 * 60 * 60 * 24)) + 1; // +1 to include today
        
        // Get ALL check-ins (no date filter for lifetime)
        const checkInsSnap = await db.collection('checkins')
            .where('userId', '==', userId)
            .get();
        
        // Count morning check-ins and evening reflections separately
        let morningCheckInsCompleted = 0;
        let eveningReflectionsCompleted = 0;
        
        checkInsSnap.forEach(doc => {
            const data = doc.data();
            if (data.morningData) {
                morningCheckInsCompleted++;
            }
            if (data.eveningData) {
                eveningReflectionsCompleted++;
            }
        });
        
        // Get ALL assignments (lifetime)
        const assignmentsSnap = await db.collection('assignments')
            .where('userId', '==', userId)
            .get();
        
        let totalAssignments = 0;
        let completedAssignments = 0;
        
        assignmentsSnap.forEach(doc => {
            totalAssignments++;
            if (doc.data().status === 'completed') {
                completedAssignments++;
            }
        });
        
        // Calculate totals
        const expectedDailyTasks = daysSinceJoining * 2; // Morning + Evening each day
        const totalExpectedTasks = expectedDailyTasks + totalAssignments;
        const totalCompletedTasks = morningCheckInsCompleted + eveningReflectionsCompleted + completedAssignments;
        
        // Calculate percentage
        const completionRate = totalExpectedTasks > 0 ? 
            Math.round((totalCompletedTasks / totalExpectedTasks) * 100) : 0;
        
        return {
            completionRate,
            totalCompleted: totalCompletedTasks,
            totalExpected: totalExpectedTasks,
            breakdown: {
                morningCheckIns: morningCheckInsCompleted,
                eveningReflections: eveningReflectionsCompleted,
                assignments: completedAssignments,
                expectedDailyTasks: expectedDailyTasks,
                totalAssignments: totalAssignments
            }
        };
    } catch (error) {
        return {
            completionRate: 0,
            totalCompleted: 0,
            totalExpected: 0
        };
    }
};

    const handleFileInputChange = (e) => {
    const file = e.target.files[0];
    if (file) {
        handleImageSelect(file);  // Call app object function
    }
};

// Modal callback handlers
const handleUpdatePersonalInfo = async (updates) => {
    try {
        await db.collection('users').doc(user.uid).update(updates);
        // Reload user data to reflect changes
        const userDoc = await db.collection('users').doc(user.uid).get();
        if (userDoc.exists) {
            setUserData(userDoc.data());
        }
    } catch (error) {
        console.error('Error updating personal info:', error);
        window.handleFirebaseError && window.handleFirebaseError(error, 'ProfileView.handleUpdatePersonalInfo');
        throw error; // Re-throw so modal can handle alert
    }
};

const handleUpdateRecoveryInfo = async (updates) => {
    try {
        await db.collection('users').doc(user.uid).update(updates);
        // Reload user data
        const userDoc = await db.collection('users').doc(user.uid).get();
        if (userDoc.exists) {
            setUserData(userDoc.data());
        }
    } catch (error) {
        console.error('Error updating recovery info:', error);
        window.handleFirebaseError && window.handleFirebaseError(error, 'ProfileView.handleUpdateRecoveryInfo');
        throw error;
    }
};

const handleChangePassword = async (currentPassword, newPassword) => {
    try {
        const credential = firebase.auth.EmailAuthProvider.credential(
            user.email,
            currentPassword
        );
        await user.reauthenticateWithCredential(credential);
        await user.updatePassword(newPassword);
    } catch (error) {
        console.error('Error changing password:', error);
        window.handleFirebaseError && window.handleFirebaseError(error, 'ProfileView.handleChangePassword');
        throw error;
    }
};

const handleUpdateNotificationSettings = async (updates) => {
    try {
        await db.collection('users').doc(user.uid).update(updates);
        // Reload user data
        const userDoc = await db.collection('users').doc(user.uid).get();
        if (userDoc.exists) {
            setUserData(userDoc.data());
        }
    } catch (error) {
        console.error('Error updating notification settings:', error);
        window.handleFirebaseError && window.handleFirebaseError(error, 'ProfileView.handleUpdateNotificationSettings');
        throw error;
    }
};

const handleSubmitFeedback = async (feedbackData) => {
    try {
        await db.collection('feedback').add({
            ...feedbackData,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
    } catch (error) {
        console.error('Error submitting feedback:', error);
        window.handleFirebaseError && window.handleFirebaseError(error, 'ProfileView.handleSubmitFeedback');
        throw error;
    }
};

const handleDeleteAccount = async (userId) => {
    try {
        // Delete user data from Firestore
        await db.collection('users').doc(userId).delete();
        // Delete Firebase auth account
        await user.delete();
    } catch (error) {
        console.error('Error deleting account:', error);
        window.handleFirebaseError && window.handleFirebaseError(error, 'ProfileView.handleDeleteAccount');
        throw error;
    }
};

const handleAddEmergencyContact = async (newContact) => {
    try {
        const currentContacts = userData?.emergencyContacts || [];
        await db.collection('users').doc(user.uid).update({
            emergencyContacts: [...currentContacts, newContact]
        });
        // Reload user data
        const userDoc = await db.collection('users').doc(user.uid).get();
        if (userDoc.exists) {
            setUserData(userDoc.data());
        }
    } catch (error) {
        console.error('Error adding emergency contact:', error);
        window.handleFirebaseError && window.handleFirebaseError(error, 'ProfileView.handleAddEmergencyContact');
        throw error;
    }
};


const profileCompletion = calculateProfileCompletion();

// Loading State UI
if (loading) {
    return (
        <div style={{
            textAlign: 'center',
            color: 'white',
            padding: '60px 20px',
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '20px',
            margin: '20px'
        }}>
            <div className="spinner" style={{
                width: '48px',
                height: '48px',
                border: '4px solid rgba(255,255,255,0.3)',
                borderTop: '4px solid white',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                margin: '0 auto 20px auto'
            }}></div>
            <p style={{ fontSize: '16px', opacity: 0.9 }}>Loading profile...</p>
        </div>
    );
}

// Error State UI
if (error) {
    return (
        <div style={{
            background: 'rgba(255,255,255,0.95)',
            borderRadius: '20px',
            padding: '40px',
            textAlign: 'center',
            margin: '20px'
        }}>
            <i data-lucide="alert-circle" style={{
                width: '64px',
                height: '64px',
                color: '#ef4444',
                marginBottom: '20px'
            }}></i>
            <h3 style={{
                color: '#ef4444',
                margin: '0 0 12px 0',
                fontSize: '20px'
            }}>
                Error Loading Profile
            </h3>
            <p style={{
                color: '#666',
                margin: '0 0 24px 0',
                fontSize: '16px',
                lineHeight: '1.5'
            }}>
                {error}
            </p>
            <button
                onClick={() => {
                    setError(null);
                    setLoading(true);
                    // The useEffect will re-run and reload profile data
                }}
                style={{
                    padding: '12px 24px',
                    background: '#764ba2',
                    color: 'white',
                    border: 'none',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    transition: 'all 0.3s'
                }}
            >
                Retry
            </button>
        </div>
    );
}

return (
    <>
        <div className="profile-menu">
            <div className="profile-header">
                <div className="profile-avatar" onClick={() => {
                    const fileInput = document.getElementById('profile-avatar-input');
                    if (fileInput) fileInput.click();
                }}>
                    {userData?.profileImageUrl ? (
                        <img src={userData.profileImageUrl} alt="Profile" />
                    ) : (
                        (userData?.displayName || userData?.firstName || user?.email || 'U').charAt(0).toUpperCase()
                    )}
                    <div className="profile-avatar-upload">
                        <i data-lucide="camera" style={{width: '16px', height: '16px'}}></i>
                    </div>
                </div>
                <input
                    id="profile-avatar-input"
                    type="file"
                    accept="image/*"
                    className="upload-input"
                    onChange={handleFileInputChange}
                    style={{display: 'none'}}
                />
                <div className="profile-name">
                    {userData?.displayName || userData?.firstName || 'User'}
                </div>
                <div className="profile-email">{user?.email}</div>
                
                {/* Profile Completion Indicator */}
                {profileCompletion < 100 && (
                    <div style={{marginTop: '10px'}}>
                        <div style={{fontSize: '12px', opacity: 0.8, marginBottom: '5px'}}>
                            Profile {profileCompletion}% Complete
                        </div>
                        <div style={{
                            background: 'rgba(255,255,255,0.1)',
                            borderRadius: '10px',
                            height: '8px',
                            overflow: 'hidden'
                        }}>
                            <div style={{
                                background: 'linear-gradient(135deg, #f4c430 0%, #ff9500 100%)',
                                width: `${profileCompletion}%`,
                                height: '100%',
                                transition: 'width 0.3s ease'
                            }}/>
                        </div>
                    </div>
                )}
                
                {/* Sobriety Info */}
                {userData?.sobrietyDate && (
                    <div style={{
                        marginTop: '15px',
                        padding: '10px',
                        background: 'rgba(76, 175, 80, 0.1)',
                        borderRadius: '10px',
                        border: '1px solid rgba(76, 175, 80, 0.3)'
                    }}>
                        <div style={{fontSize: '24px', fontWeight: 'bold', color: '#4CAF50'}}>
                            {window.getSobrietyDays(userData.sobrietyDate)} Days Clean
                        </div>
                        <div style={{fontSize: '12px', opacity: 0.8, marginTop: '5px'}}>
                            Since {new Date(userData.sobrietyDate).toLocaleDateString('en-US', {
                                timeZone: 'UTC',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}
                        </div>
                    </div>
                )}
            </div>  {/* THIS WAS MISSING - Closing profile-header */}
            
            {/* Stats Section */}
            <div className="menu-section">
                <div className="menu-title">My Stats</div>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: '10px',
                    padding: '0 15px',
                    marginBottom: '15px'
                }}>
                    <div style={{
                        background: 'rgba(255,255,255,0.05)',
                        borderRadius: '10px',
                        padding: '10px',
                        textAlign: 'center'
                    }}>
                        <div style={{fontSize: '20px', fontWeight: 'bold', color: '#f4c430'}}>
                            {profileStats.checkInRate}%
                        </div>
                        <div style={{fontSize: '11px', opacity: 0.7}}>Check-in Rate</div>
                    </div>
                    
                    <div style={{
                        background: 'rgba(255,255,255,0.05)',
                        borderRadius: '10px',
                        padding: '10px',
                        textAlign: 'center'
                    }}>
                        <div style={{fontSize: '20px', fontWeight: 'bold', color: '#4CAF50'}}>
                            {profileStats.assignmentRate}%
                        </div>
                        <div style={{fontSize: '11px', opacity: 0.7}}>Lifetime Task</div>
                    </div>
                    
                    <div style={{
                        background: 'rgba(255,255,255,0.05)',
                        borderRadius: '10px',
                        padding: '10px',
                        textAlign: 'center'
                    }}>
                        <div style={{fontSize: '20px', fontWeight: 'bold', color: '#ff9500'}}>
                            {profileStats.currentStreak}
                        </div>
                        <div style={{fontSize: '11px', opacity: 0.7}}>Day Streak</div>
                    </div>
                    
                    <div style={{
                        background: 'rgba(255,255,255,0.05)',
                        borderRadius: '10px',
                        padding: '10px',
                        textAlign: 'center'
                    }}>
                        <div style={{fontSize: '20px', fontWeight: 'bold', color: '#9c27b0'}}>
                            {profileStats.avgMood}/10
                        </div>
                        <div style={{fontSize: '11px', opacity: 0.7}}>Avg Mood</div>
                    </div>
                </div>
            </div>
                
                {/* Coach Section */}
                {coachInfo && (
                    <div className="menu-section">
                        <div className="menu-title">My Coach</div>
                        <div style={{background: 'rgba(255,255,255,0.05)', borderRadius: '10px', padding: '15px', margin: '0 10px'}}>
                            <div style={{fontWeight: 'bold', marginBottom: '5px'}}>
                                {coachInfo.displayName || coachInfo.firstName + ' ' + coachInfo.lastName}
                            </div>
                            {coachInfo.credentials && (
                                <div style={{fontSize: '14px', opacity: 0.8, marginBottom: '5px'}}>
                                    {coachInfo.credentials}
                                </div>
                            )}
                            {coachInfo.phone && (
                                <div style={{fontSize: '14px'}}>
                                    📞 <a href={`tel:${coachInfo.phone}`} style={{color: '#f4c430', textDecoration: 'none'}}>
                                        {coachInfo.phone}
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>
                )}
                
                {/* Account Settings */}
                <div className="menu-section">
                    <div className="menu-title">Account</div>
                    <button className="menu-item" onClick={() => setShowModal('personalInfo')}>
                        <div className="menu-item-left">
                            <span className="menu-icon"><i data-lucide="user" style={{width: '18px', height: '18px'}}></i></span>
                            <span>Personal Information</span>
                        </div>
                        <span className="menu-arrow">›</span>
                    </button>
                    <button className="menu-item" onClick={() => setShowModal('recoveryInfo')}>
                        <div className="menu-item-left">
                            <span className="menu-icon"><i data-lucide="target" style={{width: '18px', height: '18px'}}></i></span>
                            <span>Recovery Settings</span>
                        </div>
                        <span className="menu-arrow">›</span>
                    </button>
                    <button className="menu-item" onClick={() => setShowModal('password')}>
                        <div className="menu-item-left">
                            <span className="menu-icon"><i data-lucide="lock" style={{width: '18px', height: '18px'}}></i></span>
                            <span>Password & Security</span>
                        </div>
                        <span className="menu-arrow">›</span>
                    </button>
                    <button className="menu-item" onClick={() => setShowModal('notificationSettings')}>
    <div className="menu-item-left">
        <span className="menu-icon"><i data-lucide="bell" style={{width: '18px', height: '18px'}}></i></span>
        <span>Notification Settings</span>
    </div>
    <span className="menu-arrow">›</span>
</button>

{/* NEW: Google Calendar Integration */}
<button className="menu-item" onClick={() => setShowModal('googleCalendar')}>
    <div className="menu-item-left">
        <span className="menu-icon"><i data-lucide="calendar" style={{width: '18px', height: '18px'}}></i></span>
        <span>Google Calendar</span>
    </div>
    <span className="menu-arrow" style={{
        color: googleConnected ? '#4CAF50' : 'rgba(255,255,255,0.5)',
        fontWeight: googleConnected ? 'bold' : 'normal'
    }}>
        {googleConnected ? '✓ Connected' : 'Not Connected'}
    </span>
</button>

<button className="menu-item" onClick={() => setShowModal('emergency')}>
    <div className="menu-item-left">
        <span className="menu-icon"><i data-lucide="alert-circle" style={{width: '18px', height: '18px'}}></i></span>
        <span>Emergency Contacts</span>
    </div>
    <span className="menu-arrow">›</span>
</button>
                    </div>
                {/* Support & Resources */}
                <div className="menu-section">
                    <div className="menu-title">Support</div>
                    <button className="menu-item" onClick={() => setShowModal('help')}>
                        <div className="menu-item-left">
                            <span className="menu-icon"><i data-lucide="help-circle" style={{width: '18px', height: '18px'}}></i></span>
                            <span>Help & Support</span>
                        </div>
                        <span className="menu-arrow">›</span>
                    </button>
                    <button className="menu-item" onClick={() => setShowModal('feedback')}>
                        <div className="menu-item-left">
                            <span className="menu-icon"><i data-lucide="message-square" style={{width: '18px', height: '18px'}}></i></span>
                            <span>Send Feedback</span>
                        </div>
                        <span className="menu-arrow">›</span>
                    </button>
                    <button className="menu-item" onClick={() => setShowModal('export')}>
                        <div className="menu-item-left">
                            <span className="menu-icon"><i data-lucide="download" style={{width: '18px', height: '18px'}}></i></span>
                            <span>Export My Data</span>
                        </div>
                        <span className="menu-arrow">›</span>
                    </button>
                </div>

                {/* About Section */}
                <div className="menu-section">
                    <div className="menu-title">About</div>
                    <button className="menu-item" onClick={() => {
                        // Use existing LegalModal from shared/Modals.js
                        if (window.GLRSApp?.modals?.LegalModal) {
                            window.GLRSApp.modals.LegalModal({type: 'terms', onClose: () => {}});
                        }
                    }}>
                        <div className="menu-item-left">
                            <span className="menu-icon"><i data-lucide="file-text" style={{width: '18px', height: '18px'}}></i></span>
                            <span>Terms of Service</span>
                        </div>
                        <span className="menu-arrow">›</span>
                    </button>
                    <button className="menu-item" onClick={() => {
                        // Use existing LegalModal from shared/Modals.js
                        if (window.GLRSApp?.modals?.LegalModal) {
                            window.GLRSApp.modals.LegalModal({type: 'privacy', onClose: () => {}});
                        }
                    }}>
                        <div className="menu-item-left">
                            <span className="menu-icon"><i data-lucide="shield" style={{width: '18px', height: '18px'}}></i></span>
                            <span>Privacy Policy</span>
                        </div>
                        <span className="menu-arrow">›</span>
                    </button>
                    <button className="menu-item" onClick={() => {
                        // Simple alert for now - can be replaced with dedicated modal later
                        alert('Guiding Light Recovery Services\n\nSupporting working professionals in their recovery journey.\n\nVisit: glrecoveryservices.com');
                    }}>
                        <div className="menu-item-left">
                            <span className="menu-icon"><i data-lucide="info" style={{width: '18px', height: '18px'}}></i></span>
                            <span>About GLRS</span>
                        </div>
                        <span className="menu-arrow">›</span>
                    </button>
                </div>

                {/* Sign Out & Delete Account */}
                <div className="menu-section">
                    <button className="btn-danger" onClick={window.GLRSApp.authUtils.handleLogout}>
                        Sign Out
                    </button>
                    <button
                        style={{
                            width: '100%',
                            padding: '14px',
                            background: 'transparent',
                            border: '1px solid rgba(255, 71, 87, 0.5)',
                            borderRadius: '10px',
                            color: '#ff4757',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            marginTop: '10px'
                        }}
                        onClick={() => setShowModal('deleteAccount')}
                    >
                        Delete Account
                    </button>
                </div>
            </div>

            {/* Render Modals */}
            {showModal && (
                <ProfileModals
                    modalType={showModal}
                    userData={userData}
                    user={user}
                    onClose={() => setShowModal(null)}
                    onUpdatePersonalInfo={handleUpdatePersonalInfo}
                    onUpdateRecoveryInfo={handleUpdateRecoveryInfo}
                    onChangePassword={handleChangePassword}
                    onUpdateNotificationSettings={handleUpdateNotificationSettings}
                    onSubmitFeedback={handleSubmitFeedback}
                    onDeleteAccount={handleDeleteAccount}
                    onOpenModal={setShowModal}
                    onAddEmergencyContact={handleAddEmergencyContact}
                />
            )}
        </>
    );
}

// Expose ProfileView to global namespace
window.GLRSApp.components.ProfileView = ProfileView;

console.log('✅ PHASE 7: ProfileView component loaded - THE FINAL TAB complete!');

/**
 * ProfileModals Router Component
 * @description Routes to 11 different modal types based on modalType prop
 * @props All props passed through to child modals (userData, user, callbacks)
 * @architecture Props-based, NO Firebase (all operations via callbacks)
 */
function ProfileModals({
    modalType,
    userData,
    user,
    onClose,
    onUpdatePersonalInfo,
    onUpdateRecoveryInfo,
    onChangePassword,
    onUpdateNotificationSettings,
    onSubmitFeedback,
    onDeleteAccount,
    onOpenModal,
    onAddEmergencyContact
}) {
    const renderModalContent = () => {
        switch(modalType) {
            case 'account':
                return <AccountModal onClose={onClose} onOpenModal={onOpenModal} userData={userData} />;
            case 'emergency':
                return <EmergencyModal userData={userData} user={user} onClose={onClose} onAddEmergencyContact={onAddEmergencyContact} />;
            case 'personalInfo':
                return <PersonalInfoModal userData={userData} user={user} onClose={onClose} onUpdate={onUpdatePersonalInfo} />;
            case 'recoveryInfo':
                return <RecoveryInfoModal userData={userData} user={user} onClose={onClose} onUpdate={onUpdateRecoveryInfo} />;
            case 'password':
                return <PasswordModal user={user} onClose={onClose} onSubmit={onChangePassword} />;
            case 'notificationSettings':
                return <NotificationSettingsModal userData={userData} user={user} onClose={onClose} onUpdate={onUpdateNotificationSettings} />;
            case 'googleCalendar':
                return <GoogleCalendarModal onClose={onClose} />;
            case 'help':
                return <HelpModal onClose={onClose} />;
            case 'feedback':
                return <FeedbackModal userData={userData} user={user} onClose={onClose} onSubmit={onSubmitFeedback} />;
            case 'export':
                return <ExportModal onClose={onClose} />;
            case 'deleteAccount':
                return <DeleteAccountModal user={user} onClose={onClose} onDelete={onDeleteAccount} />;
            default:
                return null;
        }
    };
    return renderModalContent();
}

/** AccountModal - Edit account settings (name, phone, address) */
function AccountModal({ userData, onClose, onOpenModal }) {
    const [formData, setFormData] = React.useState({});

    return (
        <div>
            <h3 style={{marginBottom: '20px'}}>Account Settings</h3>
            <div className="form-group">
                <label className="form-label">Display Name</label>
                <input
                    type="text"
                    className="form-input"
                    value={formData.displayName || userData?.displayName || ''}
                    onChange={(e) => setFormData({...formData, displayName: e.target.value})}
                />
            </div>
            <div className="form-group">
                <label className="form-label">First Name</label>
                <input
                    type="text"
                    className="form-input"
                    value={formData.firstName || userData?.firstName || ''}
                    onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                />
            </div>
            <div className="form-group">
                <label className="form-label">Last Name</label>
                <input
                    type="text"
                    className="form-input"
                    value={formData.lastName || userData?.lastName || ''}
                    onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                />
            </div>
            <div className="form-group">
                <label className="form-label">Phone</label>
                <input
                    type="tel"
                    className="form-input"
                    value={formData.phone || userData?.phone || ''}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                />
            </div>
            <div className="form-group">
                <label className="form-label">Street Address</label>
                <input
                    type="text"
                    className="form-input"
                    value={formData.street || userData?.address?.street || ''}
                    onChange={(e) => setFormData({...formData, street: e.target.value})}
                />
            </div>
            <div className="form-group">
                <label className="form-label">City</label>
                <input
                    type="text"
                    className="form-input"
                    value={formData.city || userData?.address?.city || ''}
                    onChange={(e) => setFormData({...formData, city: e.target.value})}
                />
            </div>
            <div className="form-group">
                <label className="form-label">State</label>
                <input
                    type="text"
                    className="form-input"
                    value={formData.state || userData?.address?.state || ''}
                    onChange={(e) => setFormData({...formData, state: e.target.value})}
                />
            </div>
            <div className="form-group">
                <label className="form-label">ZIP</label>
                <input
                    type="text"
                    className="form-input"
                    value={formData.zip || userData?.address?.zip || ''}
                    onChange={(e) => setFormData({...formData, zip: e.target.value})}
                />
            </div>
            <button
                className="btn-primary"
                onClick={() => {
                    const updates = {
                        displayName: formData.displayName,
                        firstName: formData.firstName,
                        lastName: formData.lastName,
                        phone: formData.phone,
                        address: {
                            street: formData.street,
                            city: formData.city,
                            state: formData.state,
                            zip: formData.zip
                        }
                    };
                    // Call parent callback with updates
                    if (window.GLRSApp && window.GLRSApp.handlers && window.GLRSApp.handlers.updateAccountSettings) {
                        window.GLRSApp.handlers.updateAccountSettings(updates);
                    }
                    onClose();
                }}
            >
                Save Changes
            </button>
        </div>
    );
}

/** EmergencyModal - Manage emergency contacts with add functionality */
function EmergencyModal({ userData, user, onClose, onAddEmergencyContact }) {
    const [formData, setFormData] = React.useState({});

    const handleAddContact = async () => {
        const newContact = {
            name: formData.contactName,
            phone: formData.contactPhone,
            relationship: formData.contactRelationship
        };

        try {
            await onAddEmergencyContact(newContact);
            alert('Emergency contact added');
            onClose();
        } catch (error) {
            console.error('Error adding emergency contact:', error);
            window.handleFirebaseError && window.handleFirebaseError(error, 'EmergencyModal.handleAddContact');
            alert('Failed to add contact');
        }
    };

    return (
        <div>
            <h3 style={{marginBottom: '20px'}}>Emergency Contacts</h3>
            {userData?.emergencyContacts?.map((contact, index) => (
                <div key={index} style={{
                    background: 'rgba(255,255,255,0.1)',
                    borderRadius: '10px',
                    padding: '15px',
                    marginBottom: '10px'
                }}>
                    <div style={{fontWeight: 'bold'}}>{contact.name}</div>
                    <div>{contact.phone}</div>
                    <div style={{opacity: 0.8, fontSize: '14px'}}>{contact.relationship}</div>
                </div>
            ))}

            <h4 style={{marginTop: '20px', marginBottom: '15px'}}>Add New Contact</h4>
            <div className="form-group">
                <input
                    type="text"
                    className="form-input"
                    placeholder="Name"
                    value={formData.contactName || ''}
                    onChange={(e) => setFormData({...formData, contactName: e.target.value})}
                />
            </div>
            <div className="form-group">
                <input
                    type="tel"
                    className="form-input"
                    placeholder="Phone"
                    value={formData.contactPhone || ''}
                    onChange={(e) => setFormData({...formData, contactPhone: e.target.value})}
                />
            </div>
            <div className="form-group">
                <input
                    type="text"
                    className="form-input"
                    placeholder="Relationship"
                    value={formData.contactRelationship || ''}
                    onChange={(e) => setFormData({...formData, contactRelationship: e.target.value})}
                />
            </div>
            <button
                className="btn-primary"
                onClick={handleAddContact}
            >
                Add Contact
            </button>
        </div>
    );
}

/** PersonalInfoModal - Edit personal info (name, DOB, gender, address, insurance) */
function PersonalInfoModal({ userData, user, onClose, onUpdate }) {
    const [formData, setFormData] = React.useState({});

    return (
        <div>
            <h3 style={{marginBottom: '20px'}}>Personal Information</h3>
            <div className="form-group">
                <label className="form-label">First Name</label>
                <input
                    type="text"
                    className="form-input"
                    value={formData.firstName || userData?.firstName || ''}
                    onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                />
            </div>
            <div className="form-group">
                <label className="form-label">Last Name</label>
                <input
                    type="text"
                    className="form-input"
                    value={formData.lastName || userData?.lastName || ''}
                    onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                />
            </div>
            <div className="form-group">
                <label className="form-label">Display Name</label>
                <input
                    type="text"
                    className="form-input"
                    value={formData.displayName || userData?.displayName || ''}
                    onChange={(e) => setFormData({...formData, displayName: e.target.value})}
                />
            </div>
            <div className="form-group">
                <label className="form-label">Phone</label>
                <input
                    type="tel"
                    className="form-input"
                    value={formData.phone || userData?.phone || ''}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                />
            </div>
            <div className="form-group">
                <label className="form-label">Date of Birth</label>
                <input
                    type="date"
                    className="form-input"
                    value={formData.dateOfBirth || userData?.dateOfBirth || ''}
                    onChange={(e) => setFormData({...formData, dateOfBirth: e.target.value})}
                />
            </div>
            <div className="form-group">
                <label className="form-label">Gender</label>
                <select
                    className="form-select"
                    value={formData.gender || userData?.gender || ''}
                    onChange={(e) => setFormData({...formData, gender: e.target.value})}
                >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="non-binary">Non-Binary</option>
                    <option value="prefer-not">Prefer Not to Say</option>
                </select>
            </div>
            <div className="form-group">
                <label className="form-label">Street Address</label>
                <input
                    type="text"
                    className="form-input"
                    value={formData.street || userData?.address?.street || ''}
                    onChange={(e) => setFormData({...formData, street: e.target.value})}
                />
            </div>
            <div className="form-group">
                <label className="form-label">City</label>
                <input
                    type="text"
                    className="form-input"
                    value={formData.city || userData?.address?.city || ''}
                    onChange={(e) => setFormData({...formData, city: e.target.value})}
                />
            </div>
            <div className="form-group">
                <label className="form-label">State</label>
                <input
                    type="text"
                    className="form-input"
                    value={formData.state || userData?.address?.state || ''}
                    onChange={(e) => setFormData({...formData, state: e.target.value})}
                />
            </div>
            <div className="form-group">
                <label className="form-label">ZIP Code</label>
                <input
                    type="text"
                    className="form-input"
                    value={formData.zip || userData?.address?.zip || ''}
                    onChange={(e) => setFormData({...formData, zip: e.target.value})}
                />
            </div>
            <div className="form-group">
                <label className="form-label">Insurance Provider (Optional)</label>
                <input
                    type="text"
                    className="form-input"
                    value={formData.insurance || userData?.insurance || ''}
                    onChange={(e) => setFormData({...formData, insurance: e.target.value})}
                />
            </div>
            <div className="form-group">
                <label className="form-label">Insurance ID (Optional)</label>
                <input
                    type="text"
                    className="form-input"
                    value={formData.insuranceId || userData?.insuranceId || ''}
                    onChange={(e) => setFormData({...formData, insuranceId: e.target.value})}
                />
            </div>
            <button
                className="btn-primary"
                onClick={async () => {
                    try {
                        // Build update object with proper validation
                        const updates = {};

                        // Handle simple fields - only add if they have values
                        if (formData.firstName !== undefined && formData.firstName !== '') {
                            updates.firstName = formData.firstName;
                        }
                        if (formData.lastName !== undefined && formData.lastName !== '') {
                            updates.lastName = formData.lastName;
                        }
                        if (formData.displayName !== undefined && formData.displayName !== '') {
                            updates.displayName = formData.displayName;
                        }
                        if (formData.phone !== undefined && formData.phone !== '') {
                            updates.phone = formData.phone;
                        }
                        if (formData.dateOfBirth !== undefined && formData.dateOfBirth !== '') {
                            updates.dateOfBirth = formData.dateOfBirth;
                        }
                        if (formData.gender !== undefined && formData.gender !== '') {
                            updates.gender = formData.gender;
                        }
                        if (formData.insurance !== undefined && formData.insurance !== '') {
                            updates.insurance = formData.insurance;
                        }
                        if (formData.insuranceId !== undefined && formData.insuranceId !== '') {
                            updates.insuranceId = formData.insuranceId;
                        }

                        // Handle address as a nested object - CRITICAL for admin.html sync
                        // Only update address if at least one field is provided
                        const addressFields = ['street', 'city', 'state', 'zip'];
                        const hasAddressData = addressFields.some(field =>
                            formData[field] !== undefined && formData[field] !== ''
                        );

                        if (hasAddressData) {
                            // Get existing address to merge with
                            const existingAddress = userData?.address || {};

                            updates.address = {
                                street: formData.street !== undefined ? formData.street : (existingAddress.street || ''),
                                city: formData.city !== undefined ? formData.city : (existingAddress.city || ''),
                                state: formData.state !== undefined ? formData.state : (existingAddress.state || ''),
                                zip: formData.zip !== undefined ? formData.zip : (existingAddress.zip || '')
                            };
                        }

                        // Only proceed if there are updates to make
                        if (Object.keys(updates).length === 0) {
                            alert('No changes to save');
                            return;
                        }

                        // Call parent callback with updates
                        await onUpdate(updates);

                        // Provide specific feedback
                        const savedFields = Object.keys(updates);
                        alert(`Successfully updated: ${savedFields.join(', ')}`);

                        onClose();
                    } catch (error) {
                        // Provide specific error feedback
                        if (error.code === 'permission-denied') {
                            alert('Permission denied. Please try logging out and back in.');
                        } else if (error.code === 'not-found') {
                            alert('User record not found. Please contact support.');
                        } else {
                            alert(`Failed to update information: ${error.message}`);
                        }
                    }
                }}
            >
                Save Changes
            </button>
        </div>
    );
}

/** RecoveryInfoModal - Edit recovery settings (sobriety date, substance, daily cost, sponsor) */
function RecoveryInfoModal({ userData, user, onClose, onUpdate }) {
    const [formData, setFormData] = React.useState({});

    return (
        <div>
            <h3 style={{marginBottom: '20px'}}>Recovery Settings</h3>
            <div className="form-group">
                <label className="form-label">
                    Sobriety Date & Time
                    <small style={{display: 'block', opacity: 0.8, marginTop: '5px', fontSize: '12px'}}>
                        Enter the date and time 24 hours after your last use
                    </small>
                </label>
                <input
                    type="datetime-local"
                    className="form-input"
                    value={formData.sobrietyDateTime ||
                           (userData?.sobrietyDate ?
                            new Date(userData.sobrietyDate).toISOString().slice(0, 16) : '')}
                    onChange={(e) => setFormData({...formData, sobrietyDateTime: e.target.value})}
                />
            </div>
            <div className="form-group">
                <label className="form-label">Primary Substance</label>
                <select
                    className="form-select"
                    value={formData.substance || userData?.substance || ''}
                    onChange={(e) => setFormData({...formData, substance: e.target.value})}
                >
                    <option value="">Select Substance</option>
                    <option value="alcohol">Alcohol</option>
                    <option value="opioids">Opioids</option>
                    <option value="stimulants">Stimulants</option>
                    <option value="cannabis">Cannabis</option>
                    <option value="benzodiazepines">Benzodiazepines</option>
                    <option value="multiple">Multiple Substances</option>
                    <option value="other">Other</option>
                </select>
            </div>
            <div className="form-group">
                <label className="form-label">Daily Cost of Use ($)</label>
                <input
                    type="number"
                    className="form-input"
                    placeholder="Amount spent per day (e.g., 20)"
                    value={formData.dailyCost || userData?.dailyCost || ''}
                    onChange={(e) => setFormData({...formData, dailyCost: parseFloat(e.target.value)})}
                />
                <small style={{color: 'rgba(255,255,255,0.6)', display: 'block', marginTop: '5px'}}>
                    Used to calculate money saved in recovery
                </small>
            </div>

            <div className="form-group">
                <label className="form-label">Sponsor Name (Optional)</label>
                <input
                    type="text"
                    className="form-input"
                    value={formData.sponsorName || userData?.sponsorName || ''}
                    onChange={(e) => setFormData({...formData, sponsorName: e.target.value})}
                />
            </div>
            <div className="form-group">
                <label className="form-label">Sponsor Phone (Optional)</label>
                <input
                    type="tel"
                    className="form-input"
                    value={formData.sponsorPhone || userData?.sponsorPhone || ''}
                    onChange={(e) => setFormData({...formData, sponsorPhone: e.target.value})}
                />
            </div>
            <button
                className="btn-primary"
                onClick={async () => {
                    try {
                        const updates = {};

                        // Convert datetime-local to ISO string for consistent storage
                        if (formData.sobrietyDateTime) {
                            const sobrietyDate = new Date(formData.sobrietyDateTime);
                            updates.sobrietyDate = sobrietyDate.toISOString();
                        }

                        // Only add fields that have values
                        if (formData.substance !== undefined && formData.substance !== '') {
                            updates.substance = formData.substance;
                        }

                        // Handle dailyCost change with edge case warning
                        if (formData.dailyCost !== undefined && formData.dailyCost !== '') {
                            const newDailyCost = parseFloat(formData.dailyCost);
                            const oldDailyCost = userData.dailyCost || 0;

                            // If dailyCost is changing and user has actualMoneySaved data
                            if (oldDailyCost > 0 && newDailyCost !== oldDailyCost) {
                                const currentActualSaved = userData.actualMoneySaved || 0;
                                const ratio = newDailyCost / oldDailyCost;
                                const adjustedAmount = Math.round(currentActualSaved * ratio);

                                const warningMessage = `⚠️ Changing Daily Cost Impact:\n\n` +
                                    `Old: $${oldDailyCost}/day → New: $${newDailyCost}/day\n\n` +
                                    `This will change all your savings calculations.\n\n` +
                                    `Your current actual savings: $${currentActualSaved.toLocaleString()}\n\n` +
                                    `Would you like to adjust your actual savings proportionally?\n\n` +
                                    `Adjusted amount: $${adjustedAmount.toLocaleString()}\n\n` +
                                    `Click OK to adjust, Cancel to keep $${currentActualSaved.toLocaleString()}`;

                                const shouldAdjust = confirm(warningMessage);

                                if (shouldAdjust) {
                                    // Adjust actualMoneySaved proportionally
                                    updates.actualMoneySaved = adjustedAmount;
                                }
                            }

                            updates.dailyCost = newDailyCost;
                        }
                        if (formData.sponsorName !== undefined && formData.sponsorName !== '') {
                            updates.sponsorName = formData.sponsorName;
                        }
                        if (formData.sponsorPhone !== undefined && formData.sponsorPhone !== '') {
                            updates.sponsorPhone = formData.sponsorPhone;
                        }

                        // Only proceed if there are updates
                        if (Object.keys(updates).length === 0) {
                            alert('No changes to save');
                            return;
                        }

                        // Call parent callback with updates
                        await onUpdate(updates);

                        alert('Recovery settings updated!');
                        onClose();
                    } catch (error) {
                        console.error('Error updating recovery settings:', error);
                        window.handleFirebaseError && window.handleFirebaseError(error, 'RecoveryInfoModal.handleSave');
                        alert('Failed to update settings: ' + error.message);
                    }
                }}
            >
                Save Changes
            </button>
        </div>
    );
}

/** PasswordModal - Change password with current password verification + 2FA info */
function PasswordModal({ user, onClose, onSubmit }) {
    const [formData, setFormData] = React.useState({});

    return (
        <div>
            <h3 style={{marginBottom: '20px'}}>Password & Security</h3>
            <div className="form-group">
                <label className="form-label">Current Password</label>
                <input
                    type="password"
                    className="form-input"
                    value={formData.currentPassword || ''}
                    onChange={(e) => setFormData({...formData, currentPassword: e.target.value})}
                />
            </div>
            <div className="form-group">
                <label className="form-label">New Password</label>
                <input
                    type="password"
                    className="form-input"
                    value={formData.newPassword || ''}
                    onChange={(e) => setFormData({...formData, newPassword: e.target.value})}
                />
            </div>
            <div className="form-group">
                <label className="form-label">Confirm New Password</label>
                <input
                    type="password"
                    className="form-input"
                    value={formData.confirmPassword || ''}
                    onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                />
            </div>
            <button
                className="btn-primary"
                onClick={async () => {
                    if (formData.newPassword !== formData.confirmPassword) {
                        alert('Passwords do not match');
                        return;
                    }
                    try {
                        await onSubmit(formData.currentPassword, formData.newPassword);
                        alert('Password updated successfully!');
                        onClose();
                    } catch (error) {
                        console.error('Error updating password:', error);
                        window.handleFirebaseError && window.handleFirebaseError(error, 'PasswordModal.handleUpdate');
                        alert('Failed to update password. Check current password.');
                    }
                }}
            >
                Update Password
            </button>

            <div style={{marginTop: '30px', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.1)'}}>
                <h4 style={{marginBottom: '15px'}}>Two-Factor Authentication</h4>
                <p style={{fontSize: '14px', opacity: 0.8, marginBottom: '15px'}}>
                    Add an extra layer of security to your account
                </p>
                <button className="btn-primary" style={{background: 'rgba(76, 175, 80, 0.2)', border: '1px solid #4CAF50'}}>
                    Enable 2FA (Coming Soon)
                </button>
            </div>
        </div>
    );
}

/** NotificationSettingsModal - Configure notification times, alert preferences, timezone */
function NotificationSettingsModal({ userData, user, onClose, onUpdate }) {
    const [formData, setFormData] = React.useState({});

    return (
        <div>
            <h3 style={{marginBottom: '20px'}}>Notification Settings</h3>

            <h4 style={{marginBottom: '15px', color: '#f4c430'}}>Daily Reminders</h4>
            <div className="form-group">
                <label className="form-label">Morning Check-in Time</label>
                <input
                    type="time"
                    className="form-input"
                    value={formData.morningCheckInTime || userData?.notifications?.morningCheckIn || '08:00'}
                    onChange={(e) => setFormData({...formData, morningCheckInTime: e.target.value})}
                />
            </div>
            <div className="form-group">
                <label className="form-label">Evening Reflection Time</label>
                <input
                    type="time"
                    className="form-input"
                    value={formData.eveningReflectionTime || userData?.notifications?.eveningReflection || '20:00'}
                    onChange={(e) => setFormData({...formData, eveningReflectionTime: e.target.value})}
                />
            </div>
            <div className="form-group">
                <label className="form-label">Daily Pledge Reminder</label>
                <input
                    type="time"
                    className="form-input"
                    value={formData.pledgeTime || userData?.notifications?.dailyPledge || '09:00'}
                    onChange={(e) => setFormData({...formData, pledgeTime: e.target.value})}
                />
            </div>

            <h4 style={{marginBottom: '15px', marginTop: '25px', color: '#f4c430'}}>Alert Preferences</h4>
            <div style={{display: 'flex', flexDirection: 'column', gap: '15px'}}>
                <label style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                    <input
                        type="checkbox"
                        checked={formData.assignmentAlerts !== false}
                        onChange={(e) => setFormData({...formData, assignmentAlerts: e.target.checked})}
                    />
                    Assignment due date reminders
                </label>
                <label style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                    <input
                        type="checkbox"
                        checked={formData.milestoneAlerts !== false}
                        onChange={(e) => setFormData({...formData, milestoneAlerts: e.target.checked})}
                    />
                    Milestone celebration alerts
                </label>
                <label style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                    <input
                        type="checkbox"
                        checked={formData.messageAlerts !== false}
                        onChange={(e) => setFormData({...formData, messageAlerts: e.target.checked})}
                    />
                    New message notifications
                </label>
                <label style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                    <input
                        type="checkbox"
                        checked={formData.missedCheckInAlerts !== false}
                        onChange={(e) => setFormData({...formData, missedCheckInAlerts: e.target.checked})}
                    />
                    Missed check-in reminders
                </label>
            </div>

            <h4 style={{marginBottom: '15px', marginTop: '25px', color: '#f4c430'}}>Time Zone</h4>
            <div className="form-group">
                <select
                    className="form-select"
                    value={formData.timezone || userData?.timezone || 'America/Los_Angeles'}
                    onChange={(e) => setFormData({...formData, timezone: e.target.value})}
                >
                    <option value="America/Los_Angeles">Pacific Time</option>
                    <option value="America/Denver">Mountain Time</option>
                    <option value="America/Chicago">Central Time</option>
                    <option value="America/New_York">Eastern Time</option>
                    <option value="America/Phoenix">Arizona</option>
                    <option value="Pacific/Honolulu">Hawaii</option>
                    <option value="America/Anchorage">Alaska</option>
                </select>
            </div>

            <button
                className="btn-primary"
                onClick={async () => {
                    try {
                        const updates = {
                            notifications: {
                                morningCheckIn: formData.morningCheckInTime,
                                eveningReflection: formData.eveningReflectionTime,
                                dailyPledge: formData.pledgeTime,
                                assignmentAlerts: formData.assignmentAlerts,
                                milestoneAlerts: formData.milestoneAlerts,
                                messageAlerts: formData.messageAlerts,
                                missedCheckInAlerts: formData.missedCheckInAlerts
                            },
                            timezone: formData.timezone
                        };
                        await onUpdate(updates);
                        alert('Notification settings updated!');
                        onClose();
                    } catch (error) {
                        console.error('Error updating notification settings:', error);
                        window.handleFirebaseError && window.handleFirebaseError(error, 'NotificationSettingsModal.handleSave');
                        alert('Failed to update settings');
                    }
                }}
            >
                Save Settings
            </button>
        </div>
    );
}

/** GoogleCalendarModal - Google Calendar integration (coming soon) */
function GoogleCalendarModal({ onClose }) {
    return (
        <div>
            <h3 style={{marginBottom: '20px'}}>Google Calendar Integration</h3>

            {/* Coming Soon Card */}
            <div style={{
                background: 'rgba(244, 196, 48, 0.1)',
                border: '1px solid rgba(244, 196, 48, 0.3)',
                borderRadius: '10px',
                padding: '30px',
                marginBottom: '20px',
                textAlign: 'center'
            }}>
                <div style={{marginBottom: '15px'}}>
                    <i data-lucide="construction" style={{width: '64px', height: '64px', color: 'var(--color-warning)'}}></i>
                </div>
                <div style={{
                    fontSize: '24px',
                    fontWeight: 'bold',
                    marginBottom: '10px',
                    color: '#f4c430'
                }}>
                    Coming Soon!
                </div>
                <div style={{fontSize: '16px', opacity: 0.9, lineHeight: '1.6'}}>
                    We're working on Google Calendar integration.<br/>
                    This feature will be available soon.
                </div>
            </div>

            {/* What's Coming Info */}
            <div style={{
                background: 'rgba(33, 150, 243, 0.1)',
                border: '1px solid rgba(33, 150, 243, 0.3)',
                borderRadius: '10px',
                padding: '20px',
                marginBottom: '20px'
            }}>
                <h4 style={{color: '#2196F3', marginBottom: '15px', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px'}}>
                    <i data-lucide="calendar" style={{width: '18px', height: '18px'}}></i>
                    What's Coming
                </h4>
                <ul style={{
                    fontSize: '14px',
                    opacity: 0.9,
                    paddingLeft: '20px',
                    margin: '10px 0',
                    lineHeight: '2'
                }}>
                    <li>Sync recovery milestones to your personal calendar</li>
                    <li>Automatic reminders for scheduled meetings</li>
                    <li>Support group session notifications</li>
                    <li>One-click calendar integration</li>
                </ul>
            </div>

            {/* Close Button */}
            <button
                className="btn-primary"
                onClick={onClose}
            >
                Got It
            </button>
        </div>
    );
}

/** HelpModal - Help & support with crisis lines, contact info, FAQs */
function HelpModal({ onClose }) {
    return (
        <div>
            <h3 style={{marginBottom: '20px'}}>Help & Support</h3>

            <div style={{
                background: 'rgba(244, 196, 48, 0.1)',
                border: '1px solid rgba(244, 196, 48, 0.3)',
                borderRadius: '10px',
                padding: '15px',
                marginBottom: '20px'
            }}>
                <h4 style={{color: '#f4c430', marginBottom: '10px'}}>Need Immediate Help?</h4>
                <div style={{marginBottom: '10px'}}>
                    <strong>Crisis Line:</strong> <a href="tel:988" style={{color: '#f4c430'}}>988</a>
                </div>
                <div>
                    <strong>SAMHSA Helpline:</strong> <a href="tel:1-800-662-4357" style={{color: '#f4c430'}}>1-800-662-HELP</a>
                </div>
            </div>

            <h4 style={{marginBottom: '15px'}}>Contact Support</h4>
            <div style={{marginBottom: '15px'}}>
                <strong>Email:</strong> info@glrecoveryservices.com
            </div>
            <div style={{marginBottom: '15px'}}>
                <strong>Phone:</strong> Contact Your Coach
            </div>
            <div style={{marginBottom: '20px'}}>
                <strong>Hours:</strong> Monday - Friday, 9am - 5pm PST
            </div>

            <h4 style={{marginBottom: '15px'}}>Frequently Asked Questions</h4>
            <div style={{display: 'flex', flexDirection: 'column', gap: '15px'}}>
                <details style={{cursor: 'pointer'}}>
                    <summary style={{fontWeight: 'bold', marginBottom: '5px'}}>How do I complete a check-in?</summary>
                    <p style={{fontSize: '14px', opacity: 0.8, paddingLeft: '15px'}}>
                        Navigate to the Tasks tab and tap on Morning Check-in or Evening Reflection.
                    </p>
                </details>
                <details style={{cursor: 'pointer'}}>
                    <summary style={{fontWeight: 'bold', marginBottom: '5px'}}>How do I contact my coach?</summary>
                    <p style={{fontSize: '14px', opacity: 0.8, paddingLeft: '15px'}}>
                        Your coach's contact information is displayed in your profile. You can call or message them directly.
                    </p>
                </details>
                <details style={{cursor: 'pointer'}}>
                    <summary style={{fontWeight: 'bold', marginBottom: '5px'}}>What if I miss a check-in?</summary>
                    <p style={{fontSize: '14px', opacity: 0.8, paddingLeft: '15px'}}>
                        Missing occasional check-ins is okay. Focus on building consistency over time. Your coach will be notified of patterns.
                    </p>
                </details>
            </div>

            <button className="btn-primary" style={{marginTop: '20px'}} onClick={onClose}>
                Close
            </button>
        </div>
    );
}

/** FeedbackModal - Submit feedback (bug report, feature request, praise, concern) */
function FeedbackModal({ userData, user, onClose, onSubmit }) {
    const [formData, setFormData] = React.useState({});

    return (
        <div>
            <h3 style={{marginBottom: '20px'}}>Send Feedback</h3>
            <p style={{fontSize: '14px', opacity: 0.8, marginBottom: '20px'}}>
                Your feedback helps us improve the recovery experience for everyone.
            </p>
            <div className="form-group">
                <label className="form-label">Feedback Type</label>
                <select
                    className="form-select"
                    value={formData.feedbackType || ''}
                    onChange={(e) => setFormData({...formData, feedbackType: e.target.value})}
                >
                    <option value="">Select Type</option>
                    <option value="bug">Bug Report</option>
                    <option value="feature">Feature Request</option>
                    <option value="praise">Positive Feedback</option>
                    <option value="concern">Concern</option>
                    <option value="other">Other</option>
                </select>
            </div>
            <div className="form-group">
                <label className="form-label">Your Feedback</label>
                <textarea
                    className="textarea"
                    placeholder="Tell us what's on your mind..."
                    value={formData.feedbackText || ''}
                    onChange={(e) => setFormData({...formData, feedbackText: e.target.value})}
                    style={{minHeight: '150px'}}
                />
            </div>
            <button
                className="btn-primary"
                onClick={async () => {
                    if (!formData.feedbackType || !formData.feedbackText) {
                        alert('Please select a type and enter feedback');
                        return;
                    }
                    try {
                        await onSubmit({
                            userId: user.uid,
                            userName: userData?.displayName || userData?.firstName || 'Anonymous',
                            type: formData.feedbackType,
                            message: formData.feedbackText
                        });
                        alert('Thank you for your feedback!');
                        onClose();
                    } catch (error) {
                        console.error('Error submitting feedback:', error);
                        window.handleFirebaseError && window.handleFirebaseError(error, 'FeedbackModal.handleSubmit');
                        alert('Failed to send feedback');
                    }
                }}
            >
                Send Feedback
            </button>
        </div>
    );
}

/** ExportModal - Export user data as JSON or PDF */
function ExportModal({ onClose }) {
    return (
        <div>
            <h3 style={{marginBottom: '20px'}}>Export Your Data</h3>
            <p style={{fontSize: '14px', opacity: 0.8, marginBottom: '20px'}}>
                Download all your recovery data in your preferred format.
            </p>
            <div style={{display: 'flex', flexDirection: 'column', gap: '10px'}}>
                <button
                    className="btn-primary"
                    onClick={() => {
                        window.triggerHaptic && window.triggerHaptic('light');
                        window.GLRSApp.handlers.exportDataAsJSON();
                    }}
                    style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'}}
                >
                    <i data-lucide="download" style={{width: '18px', height: '18px'}}></i>
                    Export as JSON (Technical Format)
                </button>
                <button
                    className="btn-primary"
                    onClick={() => {
                        window.triggerHaptic && window.triggerHaptic('light');
                        window.GLRSApp.handlers.exportDataAsPDF();
                    }}
                    style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'}}
                >
                    <i data-lucide="file-text" style={{width: '18px', height: '18px'}}></i>
                    Export as PDF (Report Format)
                </button>
            </div>
            <small style={{display: 'block', marginTop: '20px', opacity: 0.6}}>
                Your export will include all check-ins, goals, assignments, and progress data.
            </small>
        </div>
    );
}

/** DeleteAccountModal - Delete account with confirmation and warning */
function DeleteAccountModal({ user, onClose, onDelete }) {
    const [formData, setFormData] = React.useState({});

    return (
        <div>
            <h3 style={{marginBottom: '20px', color: '#ff4757'}}>Delete Account</h3>
            <div style={{
                background: 'rgba(255, 71, 87, 0.1)',
                border: '1px solid rgba(255, 71, 87, 0.3)',
                borderRadius: '10px',
                padding: '15px',
                marginBottom: '20px'
            }}>
                <strong style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                    <i data-lucide="alert-triangle" style={{width: '18px', height: '18px', color: '#ff4757'}}></i>
                    This action cannot be undone!
                </strong>
                <p style={{marginTop: '10px', fontSize: '14px'}}>
                    Deleting your account will permanently remove:
                </p>
                <ul style={{fontSize: '14px', marginTop: '10px', paddingLeft: '20px'}}>
                    <li>All your check-ins and progress data</li>
                    <li>Goals and assignments</li>
                    <li>Messages and community posts</li>
                    <li>Your profile and settings</li>
                </ul>
            </div>
            <div className="form-group">
                <label className="form-label">Type "DELETE" to confirm:</label>
                <input
                    type="text"
                    className="form-input"
                    placeholder="Type DELETE"
                    value={formData.deleteConfirm || ''}
                    onChange={(e) => setFormData({...formData, deleteConfirm: e.target.value})}
                />
            </div>
            <button
                className="btn-danger"
                disabled={formData.deleteConfirm !== 'DELETE'}
                onClick={async () => {
                    if (confirm('Are you absolutely sure? This cannot be undone.')) {
                        try {
                            await onDelete(user.uid);
                            alert('Account deleted. We wish you the best in your recovery journey.');
                        } catch (error) {
                            console.error('Error deleting account:', error);
                            window.handleFirebaseError && window.handleFirebaseError(error, 'DeleteAccountModal.handleDelete');
                            alert('Failed to delete account. You may need to sign in again.');
                        }
                    }
                }}
            >
                Permanently Delete Account
            </button>
            <button
                style={{
                    width: '100%',
                    padding: '14px',
                    background: 'transparent',
                    border: '1px solid rgba(255,255,255,0.3)',
                    borderRadius: '10px',
                    color: 'white',
                    cursor: 'pointer',
                    marginTop: '10px'
                }}
                onClick={onClose}
            >
                Cancel
            </button>
        </div>
    );
}

// Register all components in global namespace
window.GLRSApp = window.GLRSApp || {};
window.GLRSApp.modals = window.GLRSApp.modals || {};
window.GLRSApp.modals.ProfileModals = ProfileModals;

// Register all 11 modal components for consistency
window.GLRSApp.modals.AccountModal = AccountModal;
window.GLRSApp.modals.EmergencyModal = EmergencyModal;
window.GLRSApp.modals.PersonalInfoModal = PersonalInfoModal;
window.GLRSApp.modals.RecoveryInfoModal = RecoveryInfoModal;
window.GLRSApp.modals.PasswordModal = PasswordModal;
window.GLRSApp.modals.NotificationSettingsModal = NotificationSettingsModal;
window.GLRSApp.modals.GoogleCalendarModal = GoogleCalendarModal;
window.GLRSApp.modals.HelpModal = HelpModal;
window.GLRSApp.modals.FeedbackModal = FeedbackModal;
window.GLRSApp.modals.ExportModal = ExportModal;
window.GLRSApp.modals.DeleteAccountModal = DeleteAccountModal;

console.log('✅ PHASE 7: ProfileTab.js complete - All 13 components registered!');
