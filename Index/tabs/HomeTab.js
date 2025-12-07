// Index/HomeTab.js
// Destructure React hooks for use in components
const { useState, useEffect, useMemo, useCallback, useRef } = React;

// Helper function for timezone-aware timestamp formatting
const formatDate = (date, format = 'date') => {
    if (!date) return '';
    // Convert Date objects to Firestore Timestamp format for formatTimestamp
    const timestamp = date.toDate ? date : { toDate: () => date };
    return window.GLRSApp?.utils?.formatTimestamp(timestamp, null, format) ||
           (date.toDate ? date.toDate() : date).toLocaleDateString();
};

function HomeTab() {  // ✅ PHASE 2: Refactored to local state + direct Firebase queries
    // Local state hooks
    const [user, setUser] = useState(null);
    const [activeBroadcast, setActiveBroadcast] = useState(null);
    const [broadcastDismissed, setBroadcastDismissed] = useState(false);
    const [coachInfo, setCoachInfo] = useState(null);
    const [sobrietyDays, setSobrietyDays] = useState(0);
    const [dailyQuote, setDailyQuote] = useState(null);
    const [nextMilestone, setNextMilestone] = useState(null);
    const [milestones, setMilestones] = useState([]);
    const [userData, setUserData] = useState(null);

    // Mobile responsiveness
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    // Phase 2: Daily Actions data
    const [todayCheckIn, setTodayCheckIn] = useState(null);
    const [incompleteAssignments, setIncompleteAssignments] = useState([]); // Changed from todayTasks
    const [todayMeetings, setTodayMeetings] = useState([]);
    const [eveningReflection, setEveningReflection] = useState(null);
    const [dailyActionsLoading, setDailyActionsLoading] = useState(true);

    // Phase 3: Time-aware state
    const [timeOfDay, setTimeOfDay] = useState('other');

    // Phase 4: Active Streaks data
    const [checkInStreak, setCheckInStreak] = useState(0);
    const [reflectionStreak, setReflectionStreak] = useState(0);
    const [meetingAttendance, setMeetingAttendance] = useState({ attended: 0, scheduled: 0 });
    const [streaksLoading, setStreaksLoading] = useState(true);

    // Phase 5: Gratitude Quick Entry data
    const [gratitudeText, setGratitudeText] = useState('');
    const [todayGratitude, setTodayGratitude] = useState(null);
    const [recentGratitudes, setRecentGratitudes] = useState([]);
    const [gratitudeSubmitting, setGratitudeSubmitting] = useState(false);
    const [gratitudeSuccess, setGratitudeSuccess] = useState(false);

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

    // Initialize Lucide icons on component mount and when daily actions load
    useEffect(() => {
        const timer = setTimeout(() => {
            if (typeof lucide !== 'undefined' && typeof lucide.createIcons === 'function') {
                lucide.createIcons();
                console.log('✅ HomeTab: Lucide icons initialized');
            }
        }, 100);

        return () => clearTimeout(timer);
    }, [dailyActionsLoading]); // Re-initialize when daily actions finish loading

    // Handle window resize for mobile responsiveness
    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Phase 3: Time-aware detection (updates every hour)
    useEffect(() => {
        const getTimeOfDay = () => {
            const hour = new Date().getHours();
            if (hour >= 6 && hour < 12) return 'morning';
            if (hour >= 18 && hour < 23) return 'evening';
            return 'other';
        };

        // Set initial time
        setTimeOfDay(getTimeOfDay());

        // Update every hour
        const interval = setInterval(() => {
            setTimeOfDay(getTimeOfDay());
        }, 60 * 60 * 1000); // 1 hour

        return () => clearInterval(interval);
    }, []);

    // Load user data and calculate sobriety days
    useEffect(() => {
        if (!user) return;

        const loadUserData = async () => {
            try {
                const userDoc = await db.collection('users').doc(user.uid).get();
                if (userDoc.exists) {
                    const data = userDoc.data();
                    setUserData(data);

                    // Calculate sobriety days
                    if (data.sobrietyDate) {
                        // sobrietyDate is stored as string "YYYY-MM-DD"
                        const days = window.GLRSApp.utils.calculateSobrietyDays(data.sobrietyDate);
                        setSobrietyDays(days);
                    }
                }
            } catch (error) {
                window.handleFirebaseError(error, 'loadUserData');
            }
        };

        loadUserData();
    }, [user, sobrietyDays]);

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
                window.handleFirebaseError(error, 'loadCoachInfo');
            }
        };

        loadCoachInfo();
    }, [userData]);

    // Load active broadcast
    useEffect(() => {
        const loadBroadcast = async () => {
            try {
                const now = firebase.firestore.Timestamp.now();
                const broadcastSnap = await db.collection('broadcasts')
                    .where('active', '==', true)
                    .where('expiresAt', '>', now)
                    .limit(1)
                    .get();

                if (!broadcastSnap.empty) {
                    setActiveBroadcast(broadcastSnap.docs[0].data());
                }
            } catch (error) {
                window.handleFirebaseError(error, 'loadBroadcast');
            }
        };

        loadBroadcast();
    }, []);

    // Load daily quote
    useEffect(() => {
        const loadDailyQuote = async () => {
            try {
                const today = new Date().toISOString().split('T')[0];
                const quoteDoc = await db.collection('dailyQuotes').doc(today).get();

                if (quoteDoc.exists) {
                    setDailyQuote(quoteDoc.data());
                } else {
                    // Fallback quote
                    setDailyQuote({ quote: "One day at a time.", author: null });
                }
            } catch (error) {
                window.handleFirebaseError(error, 'loadDailyQuote');
            }
        };

        loadDailyQuote();
    }, []);

    // Load milestones and calculate next milestone
    useEffect(() => {
        const loadMilestones = async () => {
            try {
                const milestonesSnap = await db.collection('milestones')
                    .orderBy('days', 'asc')
                    .get();

                const milestonesData = window.snapshotToArray(milestonesSnap);
                setMilestones(milestonesData);

                // Find next milestone
                const next = milestonesData.find(m => m.days > sobrietyDays);
                if (next) {
                    setNextMilestone({ ...next, daysRequired: next.days });
                }
            } catch (error) {
                window.handleFirebaseError(error, 'loadMilestones');
            }
        };

        loadMilestones();
    }, [sobrietyDays]);

    // Phase 3: Real-time listener for morning check-in
    useEffect(() => {
        if (!user) return;

        const today = new Date().toISOString().split('T')[0];
        const unsubscribe = db.collection('checkIns')
            .where('userId', '==', user.uid)
            .where('date', '==', today)
            .where('type', '==', 'morning')
            .limit(1)
            .onSnapshot(snapshot => {
                if (!snapshot.empty) {
                    setTodayCheckIn(snapshot.docs[0].data());
                } else {
                    setTodayCheckIn(null);
                }
            }, error => {
                console.error('Error listening to morning check-in:', error);
            });

        return () => unsubscribe();
    }, [user]);

    // Phase 3: Real-time listener for evening reflection
    useEffect(() => {
        if (!user) return;

        const today = new Date().toISOString().split('T')[0];
        const unsubscribe = db.collection('checkIns')
            .where('userId', '==', user.uid)
            .where('date', '==', today)
            .where('type', '==', 'evening')
            .limit(1)
            .onSnapshot(snapshot => {
                if (!snapshot.empty) {
                    setEveningReflection(snapshot.docs[0].data());
                } else {
                    setEveningReflection(null);
                }
            }, error => {
                console.error('Error listening to evening reflection:', error);
            });

        return () => unsubscribe();
    }, [user]);

    // Phase 3: Real-time listener for ALL incomplete assignments
    useEffect(() => {
        if (!user) return;

        setDailyActionsLoading(true);

        const unsubscribe = db.collection('assignments')
            .where('userId', '==', user.uid)
            .where('status', '!=', 'completed')
            .onSnapshot(snapshot => {
                const assignments = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));

                // Sort by priority: Overdue → Today → Tomorrow → Future
                const sortedAssignments = sortAssignmentsByPriority(assignments);
                setIncompleteAssignments(sortedAssignments);
                setDailyActionsLoading(false);
            }, error => {
                console.error('Error listening to assignments:', error);
                setDailyActionsLoading(false);
            });

        return () => unsubscribe();
    }, [user]);

    // Phase 3: Real-time listener for today's meetings
    useEffect(() => {
        if (!user) return;

        const today = new Date().toISOString().split('T')[0];
        const dayOfWeek = new Date().getDay();

        // Listen to GLRS virtual meetings
        const unsubscribe1 = db.collection('meetings')
            .where('date', '==', today)
            .where('type', '==', 'virtual')
            .onSnapshot(snapshot => {
                const glrsMeetings = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                    source: 'glrs'
                }));

                // Combine with saved meetings
                setTodayMeetings(prevMeetings => {
                    const savedMeetings = prevMeetings.filter(m => m.source === 'external');
                    return [...glrsMeetings, ...savedMeetings];
                });
            }, error => {
                console.error('Error listening to GLRS meetings:', error);
            });

        // Listen to saved AA/NA meetings for today
        const unsubscribe2 = db.collection('users')
            .doc(user.uid)
            .collection('savedMeetings')
            .where('dayOfWeek', '==', dayOfWeek)
            .onSnapshot(snapshot => {
                const savedMeetings = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                    source: 'external'
                }));

                // Combine with GLRS meetings
                setTodayMeetings(prevMeetings => {
                    const glrsMeetings = prevMeetings.filter(m => m.source === 'glrs');
                    return [...glrsMeetings, ...savedMeetings];
                });
            }, error => {
                console.error('Error listening to saved meetings:', error);
            });

        return () => {
            unsubscribe1();
            unsubscribe2();
        };
    }, [user]);

    // Helper function: Sort assignments by priority
    const sortAssignmentsByPriority = (assignments) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        return assignments.sort((a, b) => {
            const aDate = a.dueDate?.toDate?.() || new Date(a.dueDate);
            const bDate = b.dueDate?.toDate?.() || new Date(b.dueDate);

            const aOverdue = aDate < today;
            const bOverdue = bDate < today;

            // Overdue first
            if (aOverdue && !bOverdue) return -1;
            if (!aOverdue && bOverdue) return 1;

            // Then sort by date (earliest first)
            return aDate - bDate;
        });
    };

    // Helper function: Get priority badge info
    const getPriorityBadge = (dueDate) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const date = dueDate?.toDate?.() || new Date(dueDate);

        if (date < today) {
            const daysOverdue = Math.floor((today - date) / (1000 * 60 * 60 * 24));
            return {
                label: `OVERDUE (${daysOverdue}d)`,
                color: '#B91C1C',
                bgColor: '#FEE2E2'
            };
        } else if (date >= today && date < tomorrow) {
            return {
                label: 'DUE TODAY',
                color: '#DC2626',
                bgColor: '#FEE2E2'
            };
        } else if (date >= tomorrow && date < new Date(tomorrow.getTime() + 24 * 60 * 60 * 1000)) {
            return {
                label: 'DUE TOMORROW',
                color: '#F59E0B',
                bgColor: '#FEF3C7'
            };
        } else {
            const formattedDate = formatDate(date, 'date');
            return {
                label: `DUE ${formattedDate}`,
                color: '#6B7280',
                bgColor: '#F3F4F6'
            };
        }
    };

    // Phase 4: Load user streaks from Firestore
    useEffect(() => {
        if (!user) return;

        setStreaksLoading(true);

        // Real-time listener for user document to get streaks
        const unsubscribe = db.collection('users').doc(user.uid).onSnapshot(async (doc) => {
            if (!doc.exists) {
                setStreaksLoading(false);
                return;
            }

            const userData = doc.data();

            // Check-In Streak
            if (userData.currentCheckInStreak !== undefined) {
                setCheckInStreak(userData.currentCheckInStreak || 0);
            } else {
                // Calculate streak if not exists
                const streak = await calculateCheckInStreak(user.uid);
                setCheckInStreak(streak);
                // Update user document with calculated streak
                await db.collection('users').doc(user.uid).update({
                    currentCheckInStreak: streak,
                    lastCheckInDate: new Date().toISOString().split('T')[0]
                }).catch(err => console.error('Error updating check-in streak:', err));
            }

            // Reflection Streak
            if (userData.currentReflectionStreak !== undefined) {
                setReflectionStreak(userData.currentReflectionStreak || 0);
            } else {
                // Calculate streak if not exists
                const streak = await calculateReflectionStreak(user.uid);
                setReflectionStreak(streak);
                // Update user document with calculated streak
                await db.collection('users').doc(user.uid).update({
                    currentReflectionStreak: streak,
                    lastReflectionDate: new Date().toISOString().split('T')[0]
                }).catch(err => console.error('Error updating reflection streak:', err));
            }

            setStreaksLoading(false);
        }, error => {
            console.error('Error listening to user streaks:', error);
            setStreaksLoading(false);
        });

        return () => unsubscribe();
    }, [user]);

    // Phase 4: Calculate meeting attendance this month
    useEffect(() => {
        if (!user) return;

        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const endOfMonth = new Date();
        endOfMonth.setMonth(endOfMonth.getMonth() + 1);
        endOfMonth.setDate(0);
        endOfMonth.setHours(23, 59, 59, 999);

        // Query meetings this month
        const unsubscribeMeetings = db.collection('meetings')
            .where('userId', '==', user.uid)
            .where('startTime', '>=', firebase.firestore.Timestamp.fromDate(startOfMonth))
            .where('startTime', '<=', firebase.firestore.Timestamp.fromDate(endOfMonth))
            .onSnapshot(snapshot => {
                const totalMeetings = snapshot.size;

                // Count attended meetings (assuming attended field exists, or all are considered attended)
                const attendedMeetings = snapshot.docs.filter(doc => {
                    const data = doc.data();
                    // If attended field exists, use it; otherwise count all as scheduled but not necessarily attended
                    // For now, we'll check if the meeting has passed
                    const meetingTime = data.startTime?.toDate() || new Date(data.startTime);
                    return meetingTime < new Date(); // Past meetings are considered attended
                }).length;

                setMeetingAttendance({ attended: attendedMeetings, scheduled: totalMeetings });
            }, error => {
                console.error('Error listening to meeting attendance:', error);
            });

        return () => unsubscribeMeetings();
    }, [user]);

    // Helper: Calculate check-in streak
    const calculateCheckInStreak = async (userId) => {
        try {
            const today = new Date();
            let streak = 0;
            let checkDate = new Date(today);

            // Check backwards day by day
            for (let i = 0; i < 365; i++) { // Max 365 days
                const dateStr = checkDate.toISOString().split('T')[0];

                const snapshot = await db.collection('checkIns')
                    .where('userId', '==', userId)
                    .where('date', '==', dateStr)
                    .where('type', '==', 'morning')
                    .limit(1)
                    .get();

                if (!snapshot.empty) {
                    streak++;
                    checkDate.setDate(checkDate.getDate() - 1); // Go back one day
                } else {
                    break; // Streak broken
                }
            }

            return streak;
        } catch (error) {
            console.error('Error calculating check-in streak:', error);
            return 0;
        }
    };

    // Helper: Calculate reflection streak
    const calculateReflectionStreak = async (userId) => {
        try {
            const today = new Date();
            let streak = 0;
            let checkDate = new Date(today);

            // Check backwards day by day
            for (let i = 0; i < 365; i++) { // Max 365 days
                const dateStr = checkDate.toISOString().split('T')[0];

                const snapshot = await db.collection('checkIns')
                    .where('userId', '==', userId)
                    .where('date', '==', dateStr)
                    .where('type', '==', 'evening')
                    .limit(1)
                    .get();

                if (!snapshot.empty) {
                    streak++;
                    checkDate.setDate(checkDate.getDate() - 1); // Go back one day
                } else {
                    break; // Streak broken
                }
            }

            return streak;
        } catch (error) {
            console.error('Error calculating reflection streak:', error);
            return 0;
        }
    };

    // Phase 5: Load today's gratitude entry
    useEffect(() => {
        if (!user) return;

        const today = new Date().toISOString().split('T')[0];

        const unsubscribe = db.collection('gratitudes')
            .where('userId', '==', user.uid)
            .where('date', '==', today)
            .limit(1)
            .onSnapshot(snapshot => {
                if (!snapshot.empty) {
                    setTodayGratitude(snapshot.docs[0].data());
                } else {
                    setTodayGratitude(null);
                }
            }, error => {
                console.error('Error listening to today\'s gratitude:', error);
            });

        return () => unsubscribe();
    }, [user]);

    // Phase 5: Load recent 3 gratitude entries
    useEffect(() => {
        if (!user) return;

        const unsubscribe = db.collection('gratitudes')
            .where('userId', '==', user.uid)
            .orderBy('createdAt', 'desc')
            .limit(3)
            .onSnapshot(snapshot => {
                const gratitudes = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setRecentGratitudes(gratitudes);
            }, error => {
                console.error('Error listening to recent gratitudes:', error);
            });

        return () => unsubscribe();
    }, [user]);

    // Phase 5: Submit gratitude entry
    const handleGratitudeSubmit = async () => {
        if (!user || !gratitudeText.trim()) return;

        setGratitudeSubmitting(true);
        setGratitudeSuccess(false);

        try {
            const today = new Date().toISOString().split('T')[0];

            await db.collection('gratitudes').add({
                userId: user.uid,
                text: gratitudeText.trim(),
                date: today,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });

            // Success!
            setGratitudeText('');
            setGratitudeSuccess(true);

            // Trigger haptic feedback
            if (typeof window.GLRSApp?.utils?.triggerHaptic === 'function') {
                window.GLRSApp.utils.triggerHaptic('medium');
            }

            // Hide success message after 3 seconds
            setTimeout(() => {
                setGratitudeSuccess(false);
            }, 3000);

        } catch (error) {
            console.error('Error submitting gratitude:', error);
            if (typeof window.GLRSApp?.utils?.showNotification === 'function') {
                window.GLRSApp.utils.showNotification('Error saving gratitude. Please try again.', 'error');
            }
        } finally {
            setGratitudeSubmitting(false);
        }
    };

    return (
        <>
            {activeBroadcast && !broadcastDismissed && (
                <div className="broadcast-banner">
                    <div className="broadcast-content">
                        <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                            <i data-lucide="megaphone" style={{width: '24px', height: '24px', color: 'var(--color-accent)'}}></i>
                            <div>
                                <div style={{fontWeight: 'bold', color: 'var(--color-accent)'}}>Announcement</div>
                                <div style={{color: 'white', marginTop: '5px'}}>{activeBroadcast.message}</div>
                            </div>
                        </div>
                    </div>
                    <button className="broadcast-dismiss" onClick={() => {
                        setBroadcastDismissed(true);
                        setActiveBroadcast(null);
                    }}>×</button>
                </div>
            )}

            {/* HERO SECTION - Teal background with sobriety counter */}
            <div className="hero-section">
                {/* PHASE 4: Your Guide Card - Refined */}
                {coachInfo && (
                    <div className="coach-info-card" style={{
                        marginBottom: isMobile ? '15px' : '20px'
                    }}>
                        <h3 style={{
                            color: '#4CAF50',
                            marginBottom: isMobile ? '8px' : '10px',
                            fontSize: isMobile ? '16px' : '18px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}>
                            <i data-lucide="lighthouse" style={{
                                width: isMobile ? '20px' : '22px',
                                height: isMobile ? '20px' : '22px',
                                color: '#4CAF50'
                            }}></i>
                            Your Guide
                        </h3>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            flexWrap: isMobile ? 'wrap' : 'nowrap',
                            gap: isMobile ? '10px' : '0'
                        }}>
                            <div style={{flex: 1}}>
                                <div style={{
                                    fontSize: isMobile ? '16px' : '18px',
                                    fontWeight: 'bold',
                                    color: 'white'
                                }}>
                                    {coachInfo.displayName || coachInfo.firstName + ' ' + coachInfo.lastName}
                                </div>
                                {coachInfo.credentials && (
                                    <div style={{
                                        fontSize: isMobile ? '12px' : '14px',
                                        opacity: 0.8,
                                        marginTop: '5px'
                                    }}>
                                        {coachInfo.credentials}
                                    </div>
                                )}
                            </div>
                            {coachInfo.phone && (
                                <a href={`tel:${coachInfo.phone}`} style={{
                                    background: 'rgba(255, 255, 255, 0.1)',
                                    padding: isMobile ? '10px 16px' : '8px 15px',
                                    borderRadius: '20px',
                                    color: 'white',
                                    textDecoration: 'none',
                                    fontSize: isMobile ? '13px' : '14px',
                                    minHeight: isMobile ? '44px' : 'auto',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    whiteSpace: 'nowrap',
                                    transition: 'all 0.2s ease'
                                }}
                                onMouseOver={(e) => {
                                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                                }}
                                onMouseOut={(e) => {
                                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                                }}>
                                    <i data-lucide="phone" style={{
                                        width: isMobile ? '18px' : '16px',
                                        height: isMobile ? '18px' : '16px'
                                    }}></i>
                                    Contact
                                </a>
                            )}
                        </div>
                    </div>
                )}

                {/* PHASE 4: Hero Background - Sobriety Counter - Refined */}
                <div className="hero-background">
                    <div className="day-counter-container" style={{
                        padding: isMobile ? '30px 20px' : '40px 30px'
                    }}>
                        <div className="large-number" style={{
                            fontSize: isMobile ? '64px' : '80px',
                            fontWeight: 'bold',
                            color: '#fff',
                            lineHeight: '1',
                            marginBottom: isMobile ? '8px' : '10px'
                        }}>
                            {sobrietyDays}
                        </div>
                        <div className="large-text" style={{
                            fontSize: isMobile ? '20px' : '24px',
                            fontWeight: '600',
                            color: '#fff',
                            marginBottom: isMobile ? '20px' : '25px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px'
                        }}>
                            <i data-lucide="award" style={{
                                width: isMobile ? '22px' : '26px',
                                height: isMobile ? '22px' : '26px',
                                color: '#FFD700'
                            }}></i>
                            Days Strong
                        </div>
                        <div className="motivational-quote" style={{
                            fontSize: isMobile ? '15px' : '18px',
                            fontStyle: 'italic',
                            color: 'rgba(255, 255, 255, 0.95)',
                            lineHeight: '1.5',
                            maxWidth: isMobile ? '280px' : '400px',
                            margin: '0 auto',
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: '6px'
                        }}>
                            <i data-lucide="quote" style={{
                                width: '16px',
                                height: '16px',
                                color: 'rgba(255, 255, 255, 0.6)',
                                flexShrink: 0,
                                marginTop: '2px'
                            }}></i>
                            <span>{dailyQuote?.quote || "One day at a time."}</span>
                        </div>
                        {dailyQuote?.author && (
                            <div style={{
                                fontSize: isMobile ? '11px' : '12px',
                                opacity: 0.7,
                                marginTop: '8px',
                                color: '#fff'
                            }}>
                                — {dailyQuote.author}
                            </div>
                        )}
                    </div>
                </div>

                {/* PHASE 4: Next Milestone Preview - Refined */}
                {nextMilestone && (
                    <div className="milestone-preview" style={{
                        padding: isMobile ? '15px' : '20px',
                        marginTop: isMobile ? '15px' : '20px'
                    }}>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            gap: isMobile ? '15px' : '20px',
                            flexWrap: isMobile ? 'wrap' : 'nowrap'
                        }}>
                            <div style={{flex: 1, minWidth: isMobile ? '100%' : 'auto'}}>
                                <div style={{
                                    fontSize: isMobile ? '16px' : '18px',
                                    color: 'white',
                                    fontWeight: 'bold',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    marginBottom: '5px'
                                }}>
                                    <i data-lucide={nextMilestone.icon || 'target'} style={{
                                        width: isMobile ? '18px' : '20px',
                                        height: isMobile ? '18px' : '20px',
                                        color: '#FFD700'
                                    }}></i>
                                    <span>Next: {nextMilestone.title}</span>
                                </div>
                                <div style={{
                                    color: 'rgba(255,255,255,0.7)',
                                    marginTop: '5px',
                                    fontSize: isMobile ? '13px' : '14px',
                                    lineHeight: '1.4'
                                }}>
                                    {nextMilestone.description}
                                </div>
                            </div>
                            <div style={{
                                textAlign: 'center',
                                minWidth: isMobile ? '100px' : '80px',
                                padding: isMobile ? '10px' : '0'
                            }}>
                                <div style={{
                                    fontSize: isMobile ? '32px' : '24px',
                                    fontWeight: 'bold',
                                    color: '#4CAF50',
                                    lineHeight: '1'
                                }}>
                                    {nextMilestone.daysRequired - sobrietyDays}
                                </div>
                                <div style={{
                                    fontSize: isMobile ? '11px' : '12px',
                                    color: 'rgba(255,255,255,0.7)',
                                    marginTop: '5px'
                                }}>
                                    days to go
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            {/* END HERO SECTION */}

            {/* BODY SECTION - White background with cards */}
            <div className="body-section">
                {/* PHASE 2: DAILY ACTIONS SECTION */}
                <div style={{
                    padding: isMobile ? '20px 15px' : '30px 20px',
                    background: '#fff'
                }}>
                    <h2 style={{
                        fontSize: isMobile ? '20px' : '24px',
                        fontWeight: 'bold',
                        color: '#333',
                        marginBottom: isMobile ? '15px' : '20px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px'
                    }}>
                        <i data-lucide="zap" style={{width: '24px', height: '24px', color: '#14b8a6'}}></i>
                        Daily Actions
                    </h2>

                    {dailyActionsLoading ? (
                        <div style={{
                            padding: '40px 20px',
                            textAlign: 'center',
                            color: '#666'
                        }}>
                            <div style={{
                                width: '40px',
                                height: '40px',
                                border: '4px solid rgba(20, 184, 166, 0.2)',
                                borderTop: '4px solid #14b8a6',
                                borderRadius: '50%',
                                animation: 'spin 1s linear infinite',
                                margin: '0 auto 10px'
                            }}></div>
                            Loading today's actions...
                        </div>
                    ) : (
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(280px, 1fr))',
                            gap: isMobile ? '12px' : '16px'
                        }}>
                            {/* CARD 1: Morning Check-In (only 6am-12pm) */}
                            {!todayCheckIn && timeOfDay === 'morning' && (
                                <div
                                    onClick={() => {
                                        if (typeof window.GLRSApp?.utils?.triggerHaptic === 'function') {
                                            window.GLRSApp.utils.triggerHaptic('light');
                                        }
                                        // Navigate to Tasks tab
                                        window.dispatchEvent(new CustomEvent('glrs-navigate', { detail: { view: 'tasks' } }));
                                    }}
                                    style={{
                                        padding: isMobile ? '20px' : '24px',
                                        background: 'linear-gradient(135deg, #FFA726 0%, #FF9800 100%)',
                                        borderRadius: '12px',
                                        cursor: 'pointer',
                                        boxShadow: '0 2px 8px rgba(255, 152, 0, 0.2)',
                                        transition: 'all 0.2s ease',
                                        minHeight: isMobile ? '80px' : '100px',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        justifyContent: 'space-between'
                                    }}
                                    onMouseOver={(e) => {
                                        e.currentTarget.style.transform = 'translateY(-2px)';
                                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(255, 152, 0, 0.3)';
                                    }}
                                    onMouseOut={(e) => {
                                        e.currentTarget.style.transform = 'translateY(0)';
                                        e.currentTarget.style.boxShadow = '0 2px 8px rgba(255, 152, 0, 0.2)';
                                    }}
                                >
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '12px',
                                        marginBottom: '8px'
                                    }}>
                                        <i data-lucide="sun" style={{
                                            width: isMobile ? '28px' : '32px',
                                            height: isMobile ? '28px' : '32px',
                                            color: '#fff'
                                        }}></i>
                                        <h3 style={{
                                            fontSize: isMobile ? '16px' : '18px',
                                            fontWeight: 'bold',
                                            color: '#fff',
                                            margin: 0
                                        }}>
                                            Morning Check-In
                                        </h3>
                                    </div>
                                    <p style={{
                                        fontSize: isMobile ? '13px' : '14px',
                                        color: 'rgba(255, 255, 255, 0.9)',
                                        margin: 0
                                    }}>
                                        Start your day by checking in
                                    </p>
                                </div>
                            )}

                            {/* CARD 2: Incomplete Assignments (Separate card for each) */}
                            {incompleteAssignments.map((assignment) => {
                                const badge = getPriorityBadge(assignment.dueDate);
                                return (
                                    <div
                                        key={assignment.id}
                                        onClick={() => {
                                            if (typeof window.GLRSApp?.utils?.triggerHaptic === 'function') {
                                                window.GLRSApp.utils.triggerHaptic('light');
                                            }
                                            // Navigate to Tasks tab
                                            window.dispatchEvent(new CustomEvent('glrs-navigate', { detail: { view: 'tasks' } }));
                                        }}
                                        style={{
                                            padding: isMobile ? '16px' : '20px',
                                            background: 'linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)',
                                            borderRadius: '12px',
                                            cursor: 'pointer',
                                            boxShadow: '0 2px 8px rgba(20, 184, 166, 0.2)',
                                            transition: 'all 0.2s ease'
                                        }}
                                        onMouseOver={(e) => {
                                            e.currentTarget.style.transform = 'translateY(-2px)';
                                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(20, 184, 166, 0.3)';
                                        }}
                                        onMouseOut={(e) => {
                                            e.currentTarget.style.transform = 'translateY(0)';
                                            e.currentTarget.style.boxShadow = '0 2px 8px rgba(20, 184, 166, 0.2)';
                                        }}
                                    >
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'flex-start',
                                            justifyContent: 'space-between',
                                            marginBottom: assignment.description ? '8px' : '0'
                                        }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                                                <i data-lucide="clipboard-list" style={{
                                                    width: isMobile ? '24px' : '28px',
                                                    height: isMobile ? '24px' : '28px',
                                                    color: '#fff',
                                                    flexShrink: 0
                                                }}></i>
                                                <h3 style={{
                                                    fontSize: isMobile ? '15px' : '16px',
                                                    fontWeight: 'bold',
                                                    color: '#fff',
                                                    margin: 0,
                                                    lineHeight: '1.4'
                                                }}>
                                                    {assignment.title || 'Assignment'}
                                                </h3>
                                            </div>
                                            <span style={{
                                                backgroundColor: badge.bgColor,
                                                color: badge.color,
                                                padding: isMobile ? '4px 8px' : '6px 10px',
                                                borderRadius: '6px',
                                                fontSize: isMobile ? '10px' : '11px',
                                                fontWeight: 'bold',
                                                whiteSpace: 'nowrap',
                                                marginLeft: '8px'
                                            }}>
                                                {badge.label}
                                            </span>
                                        </div>
                                        {assignment.description && (
                                            <p style={{
                                                fontSize: isMobile ? '13px' : '14px',
                                                color: 'rgba(255, 255, 255, 0.85)',
                                                margin: 0,
                                                lineHeight: '1.5',
                                                marginLeft: isMobile ? '36px' : '40px'
                                            }}>
                                                {assignment.description}
                                            </p>
                                        )}
                                    </div>
                                );
                            })}

                            {/* CARD 3: Meetings Today (Separate card for each) */}
                            {todayMeetings.map((meeting) => {
                                const meetingTime = meeting.startTime?.toDate?.() || new Date(meeting.startTime);
                                const timeStr = meetingTime.toLocaleTimeString('en-US', {
                                    hour: 'numeric',
                                    minute: '2-digit',
                                    hour12: true
                                });

                                // Determine meeting type badge
                                const isGLRSMeeting = meeting.type === 'glrs';
                                const meetingType = isGLRSMeeting ? 'GLRS' : (meeting.type || 'AA/NA').toUpperCase();

                                return (
                                    <div
                                        key={meeting.id}
                                        onClick={() => {
                                            if (typeof window.GLRSApp?.utils?.triggerHaptic === 'function') {
                                                window.GLRSApp.utils.triggerHaptic('light');
                                            }
                                            // Navigate to Connect tab → Meetings section
                                            window.dispatchEvent(new CustomEvent('glrs-navigate', { detail: { view: 'connect' } }));
                                            setTimeout(() => {
                                                window.dispatchEvent(new CustomEvent('scrollToMeetings'));
                                            }, 300);
                                        }}
                                        style={{
                                            padding: isMobile ? '16px' : '20px',
                                            background: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
                                            borderRadius: '12px',
                                            cursor: 'pointer',
                                            boxShadow: '0 2px 8px rgba(139, 92, 246, 0.2)',
                                            transition: 'all 0.2s ease'
                                        }}
                                        onMouseOver={(e) => {
                                            e.currentTarget.style.transform = 'translateY(-2px)';
                                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(139, 92, 246, 0.3)';
                                        }}
                                        onMouseOut={(e) => {
                                            e.currentTarget.style.transform = 'translateY(0)';
                                            e.currentTarget.style.boxShadow = '0 2px 8px rgba(139, 92, 246, 0.2)';
                                        }}
                                    >
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'flex-start',
                                            justifyContent: 'space-between',
                                            marginBottom: '8px'
                                        }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                                                <i data-lucide="calendar" style={{
                                                    width: isMobile ? '24px' : '28px',
                                                    height: isMobile ? '24px' : '28px',
                                                    color: '#fff',
                                                    flexShrink: 0
                                                }}></i>
                                                <div style={{ flex: 1 }}>
                                                    <h3 style={{
                                                        fontSize: isMobile ? '15px' : '16px',
                                                        fontWeight: 'bold',
                                                        color: '#fff',
                                                        margin: 0,
                                                        marginBottom: '4px',
                                                        lineHeight: '1.4'
                                                    }}>
                                                        {meeting.title || meeting.name || 'Meeting'}
                                                    </h3>
                                                    <div style={{
                                                        fontSize: isMobile ? '13px' : '14px',
                                                        color: 'rgba(255, 255, 255, 0.9)',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '6px'
                                                    }}>
                                                        <i data-lucide="clock" style={{
                                                            width: '14px',
                                                            height: '14px',
                                                            color: 'rgba(255, 255, 255, 0.9)'
                                                        }}></i>
                                                        {timeStr}
                                                    </div>
                                                </div>
                                            </div>
                                            <span style={{
                                                backgroundColor: 'rgba(255, 255, 255, 0.25)',
                                                color: '#fff',
                                                padding: isMobile ? '4px 8px' : '6px 10px',
                                                borderRadius: '6px',
                                                fontSize: isMobile ? '10px' : '11px',
                                                fontWeight: 'bold',
                                                whiteSpace: 'nowrap',
                                                marginLeft: '8px'
                                            }}>
                                                {meetingType}
                                            </span>
                                        </div>
                                        {(meeting.location || meeting.virtualLink) && (
                                            <div style={{
                                                fontSize: isMobile ? '12px' : '13px',
                                                color: 'rgba(255, 255, 255, 0.8)',
                                                marginLeft: isMobile ? '36px' : '40px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '6px'
                                            }}>
                                                <i data-lucide={meeting.virtualLink ? "video" : "map-pin"} style={{
                                                    width: '14px',
                                                    height: '14px',
                                                    color: 'rgba(255, 255, 255, 0.8)'
                                                }}></i>
                                                {meeting.virtualLink ? 'Virtual Meeting' : meeting.location}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}

                            {/* CARD 4: Evening Reflection (only 6pm-11pm) */}
                            {!eveningReflection && timeOfDay === 'evening' && (
                                <div
                                    onClick={() => {
                                        if (typeof window.GLRSApp?.utils?.triggerHaptic === 'function') {
                                            window.GLRSApp.utils.triggerHaptic('light');
                                        }
                                        // Navigate to Tasks tab
                                        window.dispatchEvent(new CustomEvent('glrs-navigate', { detail: { view: 'tasks' } }));
                                    }}
                                    style={{
                                        padding: isMobile ? '20px' : '24px',
                                        background: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)',
                                        borderRadius: '12px',
                                        cursor: 'pointer',
                                        boxShadow: '0 2px 8px rgba(99, 102, 241, 0.2)',
                                        transition: 'all 0.2s ease',
                                        minHeight: isMobile ? '80px' : '100px',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        justifyContent: 'space-between'
                                    }}
                                    onMouseOver={(e) => {
                                        e.currentTarget.style.transform = 'translateY(-2px)';
                                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(99, 102, 241, 0.3)';
                                    }}
                                    onMouseOut={(e) => {
                                        e.currentTarget.style.transform = 'translateY(0)';
                                        e.currentTarget.style.boxShadow = '0 2px 8px rgba(99, 102, 241, 0.2)';
                                    }}
                                >
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '12px',
                                        marginBottom: '8px'
                                    }}>
                                        <i data-lucide="moon" style={{
                                            width: isMobile ? '28px' : '32px',
                                            height: isMobile ? '28px' : '32px',
                                            color: '#fff'
                                        }}></i>
                                        <h3 style={{
                                            fontSize: isMobile ? '16px' : '18px',
                                            fontWeight: 'bold',
                                            color: '#fff',
                                            margin: 0
                                        }}>
                                            Evening Reflection
                                        </h3>
                                    </div>
                                    <p style={{
                                        fontSize: isMobile ? '13px' : '14px',
                                        color: 'rgba(255, 255, 255, 0.9)',
                                        margin: 0
                                    }}>
                                        Reflect on your day
                                    </p>
                                </div>
                            )}

                            {/* No actions message if all cards are hidden */}
                            {todayCheckIn && incompleteAssignments.length === 0 && todayMeetings.length === 0 && eveningReflection && (
                                <div style={{
                                    gridColumn: '1 / -1',
                                    padding: '40px 20px',
                                    textAlign: 'center',
                                    color: '#666',
                                    background: '#f8f9fa',
                                    borderRadius: '12px'
                                }}>
                                    <i data-lucide="check-circle" style={{
                                        width: '48px',
                                        height: '48px',
                                        color: '#14b8a6',
                                        margin: '0 auto 12px',
                                        display: 'block'
                                    }}></i>
                                    <h3 style={{
                                        fontSize: isMobile ? '16px' : '18px',
                                        fontWeight: 'bold',
                                        color: '#333',
                                        marginBottom: '8px'
                                    }}>
                                        You're all caught up!
                                    </h3>
                                    <p style={{
                                        fontSize: '14px',
                                        color: '#666',
                                        margin: 0
                                    }}>
                                        Great work completing all your daily actions.
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* PHASE 4: ACTIVE STREAKS SECTION */}
                <div style={{
                    padding: isMobile ? '20px 15px 30px' : '30px 20px 40px',
                    background: '#fff'
                }}>
                    <h2 style={{
                        fontSize: isMobile ? '20px' : '24px',
                        fontWeight: 'bold',
                        color: '#333',
                        marginBottom: isMobile ? '15px' : '20px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px'
                    }}>
                        <i data-lucide="trending-up" style={{width: '24px', height: '24px', color: '#14b8a6'}}></i>
                        Active Streaks
                    </h2>

                    {streaksLoading ? (
                        <div style={{
                            textAlign: 'center',
                            padding: '40px 20px',
                            color: '#999'
                        }}>
                            <div className="spinner" style={{
                                border: '3px solid #f3f3f3',
                                borderTop: '3px solid #14b8a6',
                                borderRadius: '50%',
                                width: '40px',
                                height: '40px',
                                animation: 'spin 1s linear infinite',
                                margin: '0 auto'
                            }}></div>
                        </div>
                    ) : (
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
                            gap: isMobile ? '15px' : '20px',
                            maxWidth: '1200px',
                            margin: '0 auto'
                        }}>
                            {/* Streak 1: Check-In Streak */}
                            <div style={{
                                padding: isMobile ? '24px' : '28px',
                                background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                                borderRadius: '16px',
                                textAlign: 'center',
                                boxShadow: '0 4px 12px rgba(245, 158, 11, 0.2)',
                                transition: 'all 0.2s ease'
                            }}
                            onMouseOver={(e) => {
                                e.currentTarget.style.transform = 'translateY(-4px)';
                                e.currentTarget.style.boxShadow = '0 8px 20px rgba(245, 158, 11, 0.3)';
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 4px 12px rgba(245, 158, 11, 0.2)';
                            }}>
                                <i data-lucide="flame" style={{
                                    width: isMobile ? '40px' : '48px',
                                    height: isMobile ? '40px' : '48px',
                                    color: '#fff',
                                    marginBottom: '12px',
                                    display: 'block',
                                    margin: '0 auto 12px'
                                }}></i>
                                <div style={{
                                    fontSize: isMobile ? '48px' : '56px',
                                    fontWeight: 'bold',
                                    color: '#fff',
                                    lineHeight: '1',
                                    marginBottom: '8px'
                                }}>
                                    {checkInStreak}
                                </div>
                                <div style={{
                                    fontSize: isMobile ? '14px' : '16px',
                                    color: 'rgba(255, 255, 255, 0.9)',
                                    fontWeight: '500'
                                }}>
                                    Check-In Streak
                                </div>
                                <div style={{
                                    fontSize: isMobile ? '12px' : '13px',
                                    color: 'rgba(255, 255, 255, 0.75)',
                                    marginTop: '6px'
                                }}>
                                    {checkInStreak === 1 ? 'day' : 'days'} in a row
                                </div>
                            </div>

                            {/* Streak 2: Reflection Streak */}
                            <div style={{
                                padding: isMobile ? '24px' : '28px',
                                background: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)',
                                borderRadius: '16px',
                                textAlign: 'center',
                                boxShadow: '0 4px 12px rgba(99, 102, 241, 0.2)',
                                transition: 'all 0.2s ease'
                            }}
                            onMouseOver={(e) => {
                                e.currentTarget.style.transform = 'translateY(-4px)';
                                e.currentTarget.style.boxShadow = '0 8px 20px rgba(99, 102, 241, 0.3)';
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 4px 12px rgba(99, 102, 241, 0.2)';
                            }}>
                                <i data-lucide="moon" style={{
                                    width: isMobile ? '40px' : '48px',
                                    height: isMobile ? '40px' : '48px',
                                    color: '#fff',
                                    marginBottom: '12px',
                                    display: 'block',
                                    margin: '0 auto 12px'
                                }}></i>
                                <div style={{
                                    fontSize: isMobile ? '48px' : '56px',
                                    fontWeight: 'bold',
                                    color: '#fff',
                                    lineHeight: '1',
                                    marginBottom: '8px'
                                }}>
                                    {reflectionStreak}
                                </div>
                                <div style={{
                                    fontSize: isMobile ? '14px' : '16px',
                                    color: 'rgba(255, 255, 255, 0.9)',
                                    fontWeight: '500'
                                }}>
                                    Reflection Streak
                                </div>
                                <div style={{
                                    fontSize: isMobile ? '12px' : '13px',
                                    color: 'rgba(255, 255, 255, 0.75)',
                                    marginTop: '6px'
                                }}>
                                    {reflectionStreak === 1 ? 'day' : 'days'} in a row
                                </div>
                            </div>

                            {/* Streak 3: Meeting Attendance */}
                            <div style={{
                                padding: isMobile ? '24px' : '28px',
                                background: 'linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)',
                                borderRadius: '16px',
                                textAlign: 'center',
                                boxShadow: '0 4px 12px rgba(20, 184, 166, 0.2)',
                                transition: 'all 0.2s ease'
                            }}
                            onMouseOver={(e) => {
                                e.currentTarget.style.transform = 'translateY(-4px)';
                                e.currentTarget.style.boxShadow = '0 8px 20px rgba(20, 184, 166, 0.3)';
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 4px 12px rgba(20, 184, 166, 0.2)';
                            }}>
                                <i data-lucide="calendar-check" style={{
                                    width: isMobile ? '40px' : '48px',
                                    height: isMobile ? '40px' : '48px',
                                    color: '#fff',
                                    marginBottom: '12px',
                                    display: 'block',
                                    margin: '0 auto 12px'
                                }}></i>
                                <div style={{
                                    fontSize: isMobile ? '48px' : '56px',
                                    fontWeight: 'bold',
                                    color: '#fff',
                                    lineHeight: '1',
                                    marginBottom: '8px'
                                }}>
                                    {meetingAttendance.attended}/{meetingAttendance.scheduled}
                                </div>
                                <div style={{
                                    fontSize: isMobile ? '14px' : '16px',
                                    color: 'rgba(255, 255, 255, 0.9)',
                                    fontWeight: '500'
                                }}>
                                    Meeting Attendance
                                </div>
                                <div style={{
                                    fontSize: isMobile ? '12px' : '13px',
                                    color: 'rgba(255, 255, 255, 0.75)',
                                    marginTop: '6px'
                                }}>
                                    This month
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* PHASE 3: QUICK LAUNCH ICON GRID */}
                <div style={{
                    padding: isMobile ? '20px 15px 30px' : '30px 20px 40px',
                    background: '#f8f9fa'
                }}>
                    <h2 style={{
                        fontSize: isMobile ? '20px' : '24px',
                        fontWeight: 'bold',
                        color: '#333',
                        marginBottom: isMobile ? '15px' : '20px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px'
                    }}>
                        <i data-lucide="grid" style={{width: '24px', height: '24px', color: '#14b8a6'}}></i>
                        Quick Launch
                    </h2>

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: isMobile ? 'repeat(3, 1fr)' : 'repeat(3, 1fr)',
                        gap: isMobile ? '12px' : '16px',
                        maxWidth: isMobile ? '100%' : '600px',
                        margin: '0 auto'
                    }}>
                        {/* Icon 1: Guides Tab */}
                        <button
                            onClick={() => {
                                if (typeof window.GLRSApp?.utils?.triggerHaptic === 'function') {
                                    window.GLRSApp.utils.triggerHaptic('light');
                                }
                                window.dispatchEvent(new CustomEvent('glrs-navigate', { detail: { view: 'guides' } }));
                            }}
                            title="Guides"
                            style={{
                                width: isMobile ? '80px' : '100px',
                                height: isMobile ? '80px' : '100px',
                                background: 'linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)',
                                border: 'none',
                                borderRadius: '16px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: '0 2px 8px rgba(20, 184, 166, 0.2)',
                                transition: 'all 0.2s ease',
                                margin: '0 auto'
                            }}
                            onMouseOver={(e) => {
                                e.currentTarget.style.transform = 'scale(1.05)';
                                e.currentTarget.style.boxShadow = '0 4px 12px rgba(20, 184, 166, 0.3)';
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.transform = 'scale(1)';
                                e.currentTarget.style.boxShadow = '0 2px 8px rgba(20, 184, 166, 0.2)';
                            }}
                        >
                            <i data-lucide="book-open" style={{
                                width: isMobile ? '36px' : '44px',
                                height: isMobile ? '36px' : '44px',
                                color: '#fff',
                                strokeWidth: '2'
                            }}></i>
                        </button>

                        {/* Icon 2: Journey Tab */}
                        <button
                            onClick={() => {
                                if (typeof window.GLRSApp?.utils?.triggerHaptic === 'function') {
                                    window.GLRSApp.utils.triggerHaptic('light');
                                }
                                window.dispatchEvent(new CustomEvent('glrs-navigate', { detail: { view: 'progress' } }));
                            }}
                            title="Journey"
                            style={{
                                width: isMobile ? '80px' : '100px',
                                height: isMobile ? '80px' : '100px',
                                background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
                                border: 'none',
                                borderRadius: '16px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: '0 2px 8px rgba(59, 130, 246, 0.2)',
                                transition: 'all 0.2s ease',
                                margin: '0 auto'
                            }}
                            onMouseOver={(e) => {
                                e.currentTarget.style.transform = 'scale(1.05)';
                                e.currentTarget.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.3)';
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.transform = 'scale(1)';
                                e.currentTarget.style.boxShadow = '0 2px 8px rgba(59, 130, 246, 0.2)';
                            }}
                        >
                            <i data-lucide="map" style={{
                                width: isMobile ? '36px' : '44px',
                                height: isMobile ? '36px' : '44px',
                                color: '#fff',
                                strokeWidth: '2'
                            }}></i>
                        </button>

                        {/* Icon 3: Connect Tab */}
                        <button
                            onClick={() => {
                                if (typeof window.GLRSApp?.utils?.triggerHaptic === 'function') {
                                    window.GLRSApp.utils.triggerHaptic('light');
                                }
                                window.dispatchEvent(new CustomEvent('glrs-navigate', { detail: { view: 'connect' } }));
                            }}
                            title="Connect"
                            style={{
                                width: isMobile ? '80px' : '100px',
                                height: isMobile ? '80px' : '100px',
                                background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                                border: 'none',
                                borderRadius: '16px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: '0 2px 8px rgba(245, 158, 11, 0.2)',
                                transition: 'all 0.2s ease',
                                margin: '0 auto'
                            }}
                            onMouseOver={(e) => {
                                e.currentTarget.style.transform = 'scale(1.05)';
                                e.currentTarget.style.boxShadow = '0 4px 12px rgba(245, 158, 11, 0.3)';
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.transform = 'scale(1)';
                                e.currentTarget.style.boxShadow = '0 2px 8px rgba(245, 158, 11, 0.2)';
                            }}
                        >
                            <i data-lucide="users" style={{
                                width: isMobile ? '36px' : '44px',
                                height: isMobile ? '36px' : '44px',
                                color: '#fff',
                                strokeWidth: '2'
                            }}></i>
                        </button>

                        {/* Icon 4: Meetings */}
                        <button
                            onClick={() => {
                                if (typeof window.GLRSApp?.utils?.triggerHaptic === 'function') {
                                    window.GLRSApp.utils.triggerHaptic('light');
                                }
                                window.dispatchEvent(new CustomEvent('glrs-navigate', { detail: { view: 'connect' } }));
                                setTimeout(() => {
                                    window.dispatchEvent(new CustomEvent('scrollToMeetings'));
                                }, 300);
                            }}
                            title="Meetings"
                            style={{
                                width: isMobile ? '80px' : '100px',
                                height: isMobile ? '80px' : '100px',
                                background: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
                                border: 'none',
                                borderRadius: '16px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: '0 2px 8px rgba(139, 92, 246, 0.2)',
                                transition: 'all 0.2s ease',
                                margin: '0 auto'
                            }}
                            onMouseOver={(e) => {
                                e.currentTarget.style.transform = 'scale(1.05)';
                                e.currentTarget.style.boxShadow = '0 4px 12px rgba(139, 92, 246, 0.3)';
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.transform = 'scale(1)';
                                e.currentTarget.style.boxShadow = '0 2px 8px rgba(139, 92, 246, 0.2)';
                            }}
                        >
                            <i data-lucide="calendar" style={{
                                width: isMobile ? '36px' : '44px',
                                height: isMobile ? '36px' : '44px',
                                color: '#fff',
                                strokeWidth: '2'
                            }}></i>
                        </button>

                        {/* Icon 5: Progress/Stats */}
                        <button
                            onClick={() => {
                                if (typeof window.GLRSApp?.utils?.triggerHaptic === 'function') {
                                    window.GLRSApp.utils.triggerHaptic('light');
                                }
                                window.dispatchEvent(new CustomEvent('glrs-navigate', { detail: { view: 'progress' } }));
                                setTimeout(() => {
                                    window.dispatchEvent(new CustomEvent('scrollToStats'));
                                }, 300);
                            }}
                            title="Progress"
                            style={{
                                width: isMobile ? '80px' : '100px',
                                height: isMobile ? '80px' : '100px',
                                background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                                border: 'none',
                                borderRadius: '16px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: '0 2px 8px rgba(16, 185, 129, 0.2)',
                                transition: 'all 0.2s ease',
                                margin: '0 auto'
                            }}
                            onMouseOver={(e) => {
                                e.currentTarget.style.transform = 'scale(1.05)';
                                e.currentTarget.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.3)';
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.transform = 'scale(1)';
                                e.currentTarget.style.boxShadow = '0 2px 8px rgba(16, 185, 129, 0.2)';
                            }}
                        >
                            <i data-lucide="trending-up" style={{
                                width: isMobile ? '36px' : '44px',
                                height: isMobile ? '36px' : '44px',
                                color: '#fff',
                                strokeWidth: '2'
                            }}></i>
                        </button>

                        {/* Icon 6: SOS - Crisis Resources (RED) */}
                        <button
                            onClick={() => {
                                if (typeof window.GLRSApp?.utils?.triggerHaptic === 'function') {
                                    window.GLRSApp.utils.triggerHaptic('medium');
                                }
                                // Trigger crisis modal
                                window.dispatchEvent(new CustomEvent('openCrisisModal'));
                            }}
                            title="SOS - Crisis Resources"
                            style={{
                                width: isMobile ? '80px' : '100px',
                                height: isMobile ? '80px' : '100px',
                                background: 'linear-gradient(135deg, #DC143C 0%, #B91C1C 100%)',
                                border: 'none',
                                borderRadius: '16px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: '0 2px 8px rgba(220, 20, 60, 0.3)',
                                transition: 'all 0.2s ease',
                                margin: '0 auto'
                            }}
                            onMouseOver={(e) => {
                                e.currentTarget.style.transform = 'scale(1.05)';
                                e.currentTarget.style.boxShadow = '0 4px 12px rgba(220, 20, 60, 0.5)';
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.transform = 'scale(1)';
                                e.currentTarget.style.boxShadow = '0 2px 8px rgba(220, 20, 60, 0.3)';
                            }}
                        >
                            <i data-lucide="alert-circle" style={{
                                width: isMobile ? '36px' : '44px',
                                height: isMobile ? '36px' : '44px',
                                color: '#fff',
                                strokeWidth: '2'
                            }}></i>
                        </button>
                    </div>
                </div>

                {/* PHASE 5: GRATITUDE QUICK ENTRY */}
                <div style={{
                    padding: isMobile ? '30px 15px 40px' : '40px 20px 50px',
                    background: 'linear-gradient(135deg, #FDF2F8 0%, #FCE7F3 100%)'
                }}>
                    <h2 style={{
                        fontSize: isMobile ? '20px' : '24px',
                        fontWeight: 'bold',
                        color: '#333',
                        marginBottom: isMobile ? '8px' : '10px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px'
                    }}>
                        <i data-lucide="heart" style={{width: '24px', height: '24px', color: '#EC4899'}}></i>
                        Daily Gratitude
                    </h2>
                    <p style={{
                        fontSize: isMobile ? '13px' : '14px',
                        color: '#666',
                        marginBottom: isMobile ? '20px' : '24px',
                        margin: 0,
                        marginBottom: isMobile ? '20px' : '24px'
                    }}>
                        Take a moment to reflect on what you're grateful for today
                    </p>

                    {/* Today's entry if exists */}
                    {todayGratitude && (
                        <div style={{
                            background: '#fff',
                            padding: isMobile ? '16px' : '20px',
                            borderRadius: '12px',
                            marginBottom: isMobile ? '20px' : '24px',
                            boxShadow: '0 2px 8px rgba(236, 72, 153, 0.1)',
                            border: '2px solid #F9A8D4'
                        }}>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                marginBottom: '8px'
                            }}>
                                <i data-lucide="check-circle" style={{
                                    width: '20px',
                                    height: '20px',
                                    color: '#10B981'
                                }}></i>
                                <span style={{
                                    fontSize: isMobile ? '13px' : '14px',
                                    fontWeight: '600',
                                    color: '#10B981'
                                }}>
                                    Today's gratitude recorded
                                </span>
                            </div>
                            <p style={{
                                fontSize: isMobile ? '14px' : '15px',
                                color: '#333',
                                margin: 0,
                                lineHeight: '1.6'
                            }}>
                                "{todayGratitude.text}"
                            </p>
                        </div>
                    )}

                    {/* Input form (only show if no entry today) */}
                    {!todayGratitude && (
                        <div style={{
                            background: '#fff',
                            padding: isMobile ? '20px' : '24px',
                            borderRadius: '16px',
                            marginBottom: isMobile ? '24px' : '28px',
                            boxShadow: '0 4px 12px rgba(236, 72, 153, 0.15)'
                        }}>
                            <textarea
                                value={gratitudeText}
                                onChange={(e) => {
                                    if (e.target.value.length <= 280) {
                                        setGratitudeText(e.target.value);
                                    }
                                }}
                                placeholder="What are you grateful for today?"
                                style={{
                                    width: '100%',
                                    minHeight: isMobile ? '80px' : '100px',
                                    padding: isMobile ? '12px' : '16px',
                                    border: '2px solid #F9A8D4',
                                    borderRadius: '12px',
                                    fontSize: isMobile ? '14px' : '15px',
                                    fontFamily: 'inherit',
                                    resize: 'vertical',
                                    outline: 'none',
                                    transition: 'border-color 0.2s ease',
                                    marginBottom: '12px'
                                }}
                                onFocus={(e) => e.target.style.borderColor = '#EC4899'}
                                onBlur={(e) => e.target.style.borderColor = '#F9A8D4'}
                            />
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}>
                                <span style={{
                                    fontSize: '12px',
                                    color: gratitudeText.length > 260 ? '#EF4444' : '#999'
                                }}>
                                    {gratitudeText.length}/280
                                </span>
                                <button
                                    onClick={handleGratitudeSubmit}
                                    disabled={!gratitudeText.trim() || gratitudeSubmitting}
                                    style={{
                                        padding: isMobile ? '10px 20px' : '12px 24px',
                                        background: (!gratitudeText.trim() || gratitudeSubmitting)
                                            ? '#D1D5DB'
                                            : 'linear-gradient(135deg, #EC4899 0%, #DB2777 100%)',
                                        color: '#fff',
                                        border: 'none',
                                        borderRadius: '8px',
                                        fontSize: isMobile ? '14px' : '15px',
                                        fontWeight: '600',
                                        cursor: (!gratitudeText.trim() || gratitudeSubmitting) ? 'not-allowed' : 'pointer',
                                        transition: 'all 0.2s ease',
                                        opacity: (!gratitudeText.trim() || gratitudeSubmitting) ? 0.6 : 1
                                    }}
                                    onMouseOver={(e) => {
                                        if (gratitudeText.trim() && !gratitudeSubmitting) {
                                            e.target.style.transform = 'translateY(-2px)';
                                            e.target.style.boxShadow = '0 4px 12px rgba(236, 72, 153, 0.3)';
                                        }
                                    }}
                                    onMouseOut={(e) => {
                                        e.target.style.transform = 'translateY(0)';
                                        e.target.style.boxShadow = 'none';
                                    }}
                                >
                                    {gratitudeSubmitting ? 'Saving...' : 'Save Gratitude'}
                                </button>
                            </div>
                            {gratitudeSuccess && (
                                <div style={{
                                    marginTop: '12px',
                                    padding: '10px',
                                    background: '#D1FAE5',
                                    color: '#065F46',
                                    borderRadius: '8px',
                                    fontSize: '13px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px'
                                }}>
                                    <i data-lucide="check" style={{width: '16px', height: '16px'}}></i>
                                    Gratitude saved successfully!
                                </div>
                            )}
                        </div>
                    )}

                    {/* Recent entries */}
                    {recentGratitudes.length > 0 && (
                        <div>
                            <h3 style={{
                                fontSize: isMobile ? '16px' : '18px',
                                fontWeight: '600',
                                color: '#333',
                                marginBottom: isMobile ? '12px' : '16px'
                            }}>
                                Recent Gratitude Entries
                            </h3>
                            <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: isMobile ? '10px' : '12px'
                            }}>
                                {recentGratitudes.slice(0, 3).map((entry) => {
                                    const entryDate = entry.createdAt?.toDate?.() || new Date(entry.createdAt);
                                    const formattedDate = entryDate.toLocaleDateString('en-US', {
                                        month: 'short',
                                        day: 'numeric'
                                    });

                                    return (
                                        <div
                                            key={entry.id}
                                            onClick={() => {
                                                // Optional: Navigate to full gratitude journal
                                                if (typeof window.GLRSApp?.utils?.triggerHaptic === 'function') {
                                                    window.GLRSApp.utils.triggerHaptic('light');
                                                }
                                                // Could navigate to journey tab or gratitude modal
                                            }}
                                            style={{
                                                background: '#fff',
                                                padding: isMobile ? '14px' : '16px',
                                                borderRadius: '12px',
                                                boxShadow: '0 2px 6px rgba(0, 0, 0, 0.05)',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s ease'
                                            }}
                                            onMouseOver={(e) => {
                                                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
                                                e.currentTarget.style.transform = 'translateY(-2px)';
                                            }}
                                            onMouseOut={(e) => {
                                                e.currentTarget.style.boxShadow = '0 2px 6px rgba(0, 0, 0, 0.05)';
                                                e.currentTarget.style.transform = 'translateY(0)';
                                            }}
                                        >
                                            <div style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '8px',
                                                marginBottom: '6px'
                                            }}>
                                                <i data-lucide="calendar" style={{
                                                    width: '14px',
                                                    height: '14px',
                                                    color: '#EC4899'
                                                }}></i>
                                                <span style={{
                                                    fontSize: '12px',
                                                    color: '#EC4899',
                                                    fontWeight: '600'
                                                }}>
                                                    {formattedDate}
                                                </span>
                                            </div>
                                            <p style={{
                                                fontSize: isMobile ? '13px' : '14px',
                                                color: '#555',
                                                margin: 0,
                                                lineHeight: '1.5',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                display: '-webkit-box',
                                                WebkitLineClamp: 2,
                                                WebkitBoxOrient: 'vertical'
                                            }}>
                                                {entry.text}
                                            </p>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

// Register component globally
window.GLRSApp = window.GLRSApp || { components: {} };
window.GLRSApp.components = window.GLRSApp.components || {};
window.GLRSApp.components.HomeTab = HomeTab;

console.log('✅ HomeTab component loaded - Phase 2 (local state + direct Firebase)');
// LegalInfoModals.js - Legal and informational modals
// ✅ PHASE 6B: Extracted from ModalContainer.js (3 modals)
// 3-Layer Architecture: Component → Firebase → Component

function LegalInfoModals({ modalType, onClose }) {
    // ═══════════════════════════════════════════════════════════
    // 3-LAYER PATTERN: Presentational modals only (no data fetching)
    // - Receives modalType as prop
    // - Uses onClose callback to notify parent
    // - No useState needed (static content)
    // - No Firebase queries (informational only)
    // ═══════════════════════════════════════════════════════════

    const renderModalContent = () => {
        switch(modalType) {
            case 'terms':
                return <TermsModal onClose={onClose} />;

            case 'privacy_policy':
                return <PrivacyPolicyModal onClose={onClose} />;

            case 'about':
                return <AboutModal onClose={onClose} />;

            default:
                return null;
        }
    };

    return renderModalContent();
}

// ═══════════════════════════════════════════════════════════
// TERMS OF SERVICE MODAL
// ═══════════════════════════════════════════════════════════

function TermsModal({ onClose }) {
    return (
        <div>
            <h3 style={{marginBottom: '20px'}}>Terms of Service</h3>
            <div style={{fontSize: '14px', lineHeight: '1.6', opacity: 0.9}}>
                <h4 style={{marginTop: '15px', marginBottom: '10px'}}>1. Acceptance of Terms</h4>
                <p>By using GLRS Recovery Services, you agree to these terms.</p>

                <h4 style={{marginTop: '15px', marginBottom: '10px'}}>2. Service Description</h4>
                <p>GLRS provides recovery coaching and support services. We are not a medical provider.</p>

                <h4 style={{marginTop: '15px', marginBottom: '10px'}}>3. User Responsibilities</h4>
                <p>You are responsible for maintaining the confidentiality of your account.</p>

                <h4 style={{marginTop: '15px', marginBottom: '10px'}}>4. Privacy</h4>
                <p>Your use of our services is also governed by our Privacy Policy.</p>

                <h4 style={{marginTop: '15px', marginBottom: '10px'}}>5. Disclaimers</h4>
                <p>Our services are not a substitute for medical treatment or professional therapy.</p>
            </div>
            <button className="btn-primary" style={{marginTop: '20px'}} onClick={onClose}>
                I Understand
            </button>
        </div>
    );
}

// ═══════════════════════════════════════════════════════════
// PRIVACY POLICY MODAL
// ═══════════════════════════════════════════════════════════

function PrivacyPolicyModal({ onClose }) {
    return (
        <div>
            <h3 style={{marginBottom: '20px'}}>Privacy Policy</h3>
            <div style={{fontSize: '14px', lineHeight: '1.6', opacity: 0.9}}>
                <h4 style={{marginTop: '15px', marginBottom: '10px'}}>Information We Collect</h4>
                <p>We collect information you provide directly, including recovery data and personal information.</p>

                <h4 style={{marginTop: '15px', marginBottom: '10px'}}>How We Use Your Information</h4>
                <p>Your data is used to provide recovery support services and track your progress.</p>

                <h4 style={{marginTop: '15px', marginBottom: '10px'}}>Data Protection</h4>
                <p>We implement appropriate security measures to protect your information.</p>

                <h4 style={{marginTop: '15px', marginBottom: '10px'}}>Your Rights</h4>
                <p>You have the right to access, update, or delete your personal information.</p>
            </div>
            <button className="btn-primary" style={{marginTop: '20px'}} onClick={onClose}>
                Close
            </button>
        </div>
    );
}

// ═══════════════════════════════════════════════════════════
// ABOUT MODAL
// ═══════════════════════════════════════════════════════════

function AboutModal({ onClose }) {
    return (
        <div>
            <h3 style={{marginBottom: '20px'}}>About GLRS</h3>
            <div style={{textAlign: 'center', marginBottom: '20px'}}>
                <img
                    src="glrs-logo.png"
                    alt="GLRS Logo"
                    style={{
                        width: '80px',
                        height: 'auto',
                        objectFit: 'contain',
                        margin: '0 auto'
                    }}
                />
            </div>
            <div style={{fontSize: '14px', lineHeight: '1.6', opacity: 0.9}}>
                <p style={{marginBottom: '15px'}}>
                    <strong>Guiding Light Recovery Services</strong>
                </p>
                <p style={{marginBottom: '15px'}}>
                    Version 1.0.0
                </p>
                <p style={{marginBottom: '15px'}}>
                    GLRS Recovery Connect is a comprehensive recovery support platform designed to help individuals
                    maintain their sobriety journey with daily check-ins, goal tracking, and coach support.
                </p>
                <p style={{marginBottom: '15px'}}>
                    © 2024 Guiding Light Recovery Services. All rights reserved.
                </p>
            </div>
            <button className="btn-primary" style={{marginTop: '20px'}} onClick={onClose}>
                Close
            </button>
        </div>
    );
}

// ═══════════════════════════════════════════════════════════
// COMPONENT REGISTRATION
// ═══════════════════════════════════════════════════════════

// Register to global namespace
window.GLRSApp = window.GLRSApp || {};
window.GLRSApp.components = window.GLRSApp.components || {};
window.GLRSApp.components.LegalInfoModals = LegalInfoModals;

console.log('✅ LegalInfoModals.js loaded - 3 legal/info modals (3-layer architecture)');
// ============================================================
// GLRS LIGHTHOUSE - MODAL COMPONENTS
// ============================================================
// Pure presentational modal components
// Extracted from PIRapp.js for modularity
// ============================================================

const ImageModal = ({ imageUrl, onClose }) => {  // ✅ PHASE 2: Refactored to receive props (Facebook-style web modal)
    if (!imageUrl) return null;

    return (
        <div
            onClick={onClose}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.85)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 10000,
                cursor: 'pointer',
                padding: '40px 20px'
            }}
        >
            {/* Image container with max width like Facebook */}
            <div
                style={{
                    maxWidth: '1200px',
                    maxHeight: '90vh',
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
                onClick={(e) => e.stopPropagation()}
            >
                <img
                    src={imageUrl}
                    style={{
                        maxWidth: '100%',
                        maxHeight: '90vh',
                        objectFit: 'contain',
                        borderRadius: '8px',
                        boxShadow: '0 12px 48px rgba(0, 0, 0, 0.5)'
                    }}
                />
            </div>
            {/* Close button */}
            <button
                onClick={onClose}
                style={{
                    position: 'absolute',
                    top: '20px',
                    right: '20px',
                    background: 'rgba(255, 255, 255, 0.2)',
                    backdropFilter: 'blur(10px)',
                    border: 'none',
                    color: 'white',
                    fontSize: '24px',
                    cursor: 'pointer',
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s ease'
                }}
                onMouseOver={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.3)'}
                onMouseOut={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.2)'}
            >
                ✕
            </button>
        </div>
    );
};

// ==========================================
// PHASE 2: APP STORE COMPLIANCE MODALS
// ==========================================

// First-Launch Disclaimer Modal
const DisclaimerModal = ({ onAccept }) => {  // ✅ PHASE 2: Refactored to receive callback
    const [checkboxChecked, setCheckboxChecked] = useState(false);

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
            padding: '20px'
        }}>
            <div style={{
                background: '#fff',
                borderRadius: '15px',
                maxWidth: '600px',
                width: '100%',
                maxHeight: '90vh',
                overflow: 'auto'
            }}>
                <div style={{
                    padding: '30px',
                    background: 'linear-gradient(135deg, #0077CC 0%, #00A86B 100%)',
                    color: '#fff',
                    borderRadius: '15px 15px 0 0'
                }}>
                    <h2 style={{ margin: '0 0 10px 0', fontSize: '28px' }}>
                        Welcome to Recovery Compass
                    </h2>
                    <p style={{ margin: 0, fontSize: '16px', opacity: 0.9 }}>
                        Please read this important information before using the app
                    </p>
                </div>

                <div style={{ padding: '30px' }}>
                    <div style={{
                        padding: '20px',
                        background: '#fff3cd',
                        borderRadius: '10px',
                        marginBottom: '20px',
                        border: '1px solid #ffc107'
                    }}>
                        <h3 style={{ margin: '0 0 15px 0', color: '#856404' }}>
                            ⚕️ Medical Disclaimer
                        </h3>
                        <p style={{ margin: 0, fontSize: '14px', color: '#856404', lineHeight: '1.6' }}>
                            <strong>This app is NOT a substitute for professional medical advice, diagnosis, or treatment.</strong>
                            <br/><br/>
                            Recovery Compass is a recovery support tool designed to complement professional treatment.
                            It should not replace in-person therapy, medical care, or emergency services.
                            <br/><br/>
                            <strong>If you are experiencing a medical or mental health emergency, call 911 or go to the nearest emergency room immediately.</strong>
                        </p>
                    </div>

                    <div style={{
                        padding: '20px',
                        background: '#f8f9fa',
                        borderRadius: '10px',
                        marginBottom: '20px'
                    }}>
                        <h3 style={{ margin: '0 0 15px 0', color: '#333', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <i data-lucide="lock" style={{width: '20px', height: '20px', color: 'var(--color-primary)'}}></i>
                            Privacy & Confidentiality
                        </h3>
                        <p style={{ margin: 0, fontSize: '14px', color: '#666', lineHeight: '1.6' }}>
                            Your privacy is our priority. We use industry-standard encryption and HIPAA-compliant practices
                            to protect your information. However, no electronic system is 100% secure.
                            Please avoid sharing sensitive information you're not comfortable storing digitally.
                        </p>
                    </div>

                    <div style={{
                        padding: '20px',
                        background: '#f8f9fa',
                        borderRadius: '10px',
                        marginBottom: '20px'
                    }}>
                        <h3 style={{ margin: '0 0 15px 0', color: '#333', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <i data-lucide="message-circle" style={{width: '20px', height: '20px', color: 'var(--color-primary)'}}></i>
                            Peer Support Disclaimer
                        </h3>
                        <p style={{ margin: 0, fontSize: '14px', color: '#666', lineHeight: '1.6' }}>
                            Community features connect you with others in recovery. While peer support can be valuable,
                            remember that other users are not medical professionals. Always consult your healthcare provider
                            for medical advice.
                        </p>
                    </div>

                    <label style={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: '15px',
                        background: '#e7f5ff',
                        borderRadius: '10px',
                        marginBottom: '20px',
                        cursor: 'pointer'
                    }}>
                        <input
                            type="checkbox"
                            checked={checkboxChecked}
                            onChange={(e) => setCheckboxChecked(e.target.checked)}
                            style={{
                                width: '20px',
                                height: '20px',
                                marginRight: '12px',
                                cursor: 'pointer'
                            }}
                        />
                        <span style={{ fontSize: '14px', color: '#333' }}>
                            I have read and understand these disclaimers and agree to the Terms of Service and Privacy Policy
                        </span>
                    </label>

                    <button
                        onClick={() => {
                            if (!checkboxChecked) {
                                alert('Please check the box to confirm you understand and agree');
                                return;
                            }
                            if (onAccept) onAccept();
                        }}
                        style={{
                            width: '100%',
                            background: 'linear-gradient(135deg, #0077CC 0%, #00A86B 100%)',
                            color: '#fff',
                            padding: '15px',
                            borderRadius: '8px',
                            border: 'none',
                            fontSize: '16px',
                            fontWeight: 'bold',
                            cursor: 'pointer'
                        }}
                    >
                        Continue to App
                    </button>
                </div>
            </div>
        </div>
    );
};

// Legal Modal Component (Terms, Privacy, Data Handling)
const LegalModal = ({ modalType, onClose }) => {  // ✅ PHASE 2: Refactored to receive props
    const content = {
        terms: {
            title: 'Terms of Service',
            body: `Last Updated: January 2025

1. ACCEPTANCE OF TERMS
By accessing or using Recovery Compass, you agree to be bound by these Terms of Service.

2. SERVICE DESCRIPTION
Recovery Compass is a recovery support application designed to complement professional treatment.

3. USER RESPONSIBILITIES
- Provide accurate information
- Maintain confidentiality of your account
- Use the service responsibly and lawfully
- Not share sensitive medical information in community features

4. MEDICAL DISCLAIMER
This service is NOT a substitute for professional medical advice. Always consult healthcare providers for medical decisions.

5. PRIVACY
Your use is governed by our Privacy Policy. We protect your data using industry-standard encryption.

6. LIABILITY LIMITATION
Recovery Compass is provided "as is" without warranties. We are not liable for any damages arising from use.

7. TERMINATION
We may suspend or terminate access for violations of these terms.

8. GOVERNING LAW
These terms are governed by the laws of [Your State/Country].

9. CONTACT
For questions: support@glrecoveryservices.com`
        },
        privacy: {
            title: 'Privacy Policy',
            body: `Last Updated: January 2025

1. INFORMATION WE COLLECT
- Account information (name, email)
- Recovery data (check-ins, goals, progress)
- Usage data (features accessed, session duration)
- Device information (device type, OS version)

2. HOW WE USE YOUR INFORMATION
- Provide and improve our services
- Communicate with you about your account
- Track your recovery progress
- Personalize your experience
- Comply with legal obligations

3. INFORMATION SHARING
We DO NOT sell your personal information. We may share data only:
- With your explicit consent
- With your assigned coach/treatment team
- To comply with legal requirements
- With service providers under strict confidentiality agreements

4. DATA SECURITY
- Industry-standard encryption (AES-256)
- HIPAA-compliant practices
- Secure data transmission (HTTPS)
- Regular security audits
- Limited employee access

5. YOUR RIGHTS (GDPR/CCPA)
- Access your data
- Correct inaccurate data
- Request data deletion
- Export your data
- Opt out of communications

6. DATA RETENTION
We retain your data while your account is active and for 7 years after closure (HIPAA compliance).

7. COOKIES
We use essential cookies for functionality. No third-party advertising cookies.

8. CHILDREN'S PRIVACY
Our service is not intended for users under 13. We comply with COPPA.

9. CHANGES TO POLICY
We'll notify you of material changes via email or in-app notification.

10. CONTACT
Privacy questions: privacy@glrecoveryservices.com`
        },
        dataHandling: {
            title: 'Data Handling & Your Rights',
            body: `Last Updated: January 2025

WHAT DATA WE COLLECT

Recovery Data:
- Daily check-ins (mood, cravings, anxiety, sleep)
- Goals and assignments
- Progress tracking
- Community messages
- Resource usage

Account Data:
- Name, email, profile photo
- Subscription information
- Login history
- Device information

HOW WE PROTECT YOUR DATA

Encryption:
- AES-256 encryption for sensitive data
- Secure data transmission (HTTPS/TLS)
- Encrypted backups
- Zero-knowledge architecture (where applicable)

Access Controls:
- Role-based access (coaches see only assigned clients)
- Multi-factor authentication available
- Regular security audits
- Employee background checks

HIPAA Compliance:
- Business Associate Agreements with partners
- Regular compliance training
- Breach notification procedures
- Audit logging

YOUR RIGHTS

Access: Request a copy of your data anytime
Correction: Update inaccurate information
Deletion: Request permanent account deletion
Export: Download your data in JSON format
Portability: Transfer data to another service
Opt-out: Unsubscribe from non-essential emails

DATA RETENTION

Active Accounts: Data retained while account is active
Closed Accounts: Data retained for 7 years (HIPAA requirement)
Deletion Requests: 30-day grace period, then permanent deletion
Backups: Removed from backups within 90 days

THIRD-PARTY SERVICES

We use these trusted partners:
- Firebase (Google) - Database and authentication
- Stripe - Payment processing (PCI-DSS compliant)
- SendGrid - Email delivery
All partners sign data processing agreements.

DATA BREACHES

In the unlikely event of a breach:
- You'll be notified within 72 hours
- We'll report to authorities as required
- We'll provide credit monitoring if SSNs exposed
- We'll publish transparency reports

INTERNATIONAL TRANSFERS

Data is stored in US data centers (Firebase).
If you're in EU/EEA, we use Standard Contractual Clauses.

EXERCISING YOUR RIGHTS

Email: privacy@glrecoveryservices.com
Phone: 1-800-XXX-XXXX
In-app: Profile → Settings → Data Management

We respond to requests within 30 days.`
        }
    };

    const selectedContent = content[modalType] || content.terms;

    return (
        <div style={{
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
        }}>
            <div style={{
                background: '#fff',
                borderRadius: '15px',
                maxWidth: '700px',
                width: '100%',
                maxHeight: '90vh',
                display: 'flex',
                flexDirection: 'column'
            }}>
                <div style={{
                    padding: '20px 30px',
                    borderBottom: '1px solid #ddd',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <h2 style={{ margin: 0, color: '#333', fontSize: '24px' }}>
                        {selectedContent.title}
                    </h2>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            fontSize: '28px',
                            cursor: 'pointer',
                            color: '#999'
                        }}
                    >
                        ×
                    </button>
                </div>

                <div style={{
                    padding: '30px',
                    overflowY: 'auto',
                    flex: 1
                }}>
                    <pre style={{
                        whiteSpace: 'pre-wrap',
                        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                        fontSize: '14px',
                        lineHeight: '1.6',
                        color: '#333',
                        margin: 0
                    }}>
                        {selectedContent.body}
                    </pre>
                </div>

                <div style={{
                    padding: '20px 30px',
                    borderTop: '1px solid #ddd'
                }}>
                    <button
                        onClick={onClose}
                        style={{
                            width: '100%',
                            background: '#0077CC',
                            color: '#fff',
                            padding: '12px',
                            borderRadius: '8px',
                            border: 'none',
                            fontSize: '16px',
                            fontWeight: 'bold',
                            cursor: 'pointer'
                        }}
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

// Crisis Resources Modal
const CrisisModal = ({ onClose }) => {  // ✅ PHASE 2: Refactored to receive callback
    const resources = [
        {
            name: '988 Suicide & Crisis Lifeline',
            number: '988',
            description: '24/7 free and confidential support',
            action: () => window.location.href = 'tel:988'
        },
        {
            name: 'Crisis Text Line',
            number: 'Text HOME to 741741',
            description: 'Free 24/7 text support',
            action: () => window.location.href = 'sms:741741&body=HOME'
        },
        {
            name: 'SAMHSA National Helpline',
            number: '1-800-662-4357',
            description: 'Treatment referral and information',
            action: () => window.location.href = 'tel:18006624357'
        },
        {
            name: 'Veterans Crisis Line',
            number: '988 (Press 1)',
            description: 'Support for veterans and their families',
            action: () => window.location.href = 'tel:988'
        },
        {
            name: 'Emergency Services',
            number: '911',
            description: 'Life-threatening emergencies',
            action: () => window.location.href = 'tel:911'
        }
    ];

    return (
        <div style={{
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
        }}>
            <div style={{
                background: '#fff',
                borderRadius: '15px',
                maxWidth: '500px',
                width: '100%',
                maxHeight: '90vh',
                overflow: 'auto'
            }}>
                <div style={{
                    padding: '20px',
                    borderBottom: '2px solid #DC143C',
                    background: '#DC143C',
                    color: '#fff',
                    borderRadius: '15px 15px 0 0'
                }}>
                    <h2 style={{ margin: 0, fontSize: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <i data-lucide="alert-octagon" style={{width: '28px', height: '28px'}}></i>
                        Crisis Resources
                    </h2>
                    <p style={{ margin: '10px 0 0 0', fontSize: '14px', opacity: 0.9 }}>
                        If you're in crisis or need immediate help, please use one of these resources
                    </p>
                </div>

                <div style={{ padding: '20px' }}>
                    {resources.map((resource, index) => (
                        <div key={index} style={{
                            padding: '15px',
                            marginBottom: '15px',
                            background: '#f8f9fa',
                            borderRadius: '10px',
                            border: '1px solid #ddd'
                        }}>
                            <h3 style={{ margin: '0 0 5px 0', color: '#333', fontSize: '18px' }}>
                                {resource.name}
                            </h3>
                            <p style={{ margin: '0 0 10px 0', color: '#666', fontSize: '14px' }}>
                                {resource.description}
                            </p>
                            <button
                                onClick={resource.action}
                                style={{
                                    background: '#DC143C',
                                    color: '#fff',
                                    padding: '10px 20px',
                                    borderRadius: '8px',
                                    border: 'none',
                                    fontSize: '16px',
                                    fontWeight: 'bold',
                                    cursor: 'pointer',
                                    width: '100%'
                                }}
                            >
                                <i data-lucide="phone" style={{width: '18px', height: '18px', marginRight: '8px'}}></i>
                                {resource.number}
                            </button>
                        </div>
                    ))}

                    <div style={{
                        marginTop: '20px',
                        padding: '15px',
                        background: '#fff3cd',
                        borderRadius: '10px',
                        border: '1px solid #ffc107'
                    }}>
                        <p style={{ margin: 0, fontSize: '13px', color: '#856404' }}>
                            <strong>⚠️ Important:</strong> If you or someone else is in immediate danger, call 911 or go to the nearest emergency room.
                        </p>
                    </div>

                    <button
                        onClick={onClose}
                        style={{
                            marginTop: '20px',
                            background: '#6c757d',
                            color: '#fff',
                            padding: '12px',
                            borderRadius: '8px',
                            border: 'none',
                            fontSize: '16px',
                            cursor: 'pointer',
                            width: '100%'
                        }}
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

// ============================================================
// NAMESPACE EXPOSURE
// ============================================================

// Register modals globally
window.GLRSApp = window.GLRSApp || {};
window.GLRSApp.modals = {
    ImageModal,
    DisclaimerModal,
    LegalModal,
    CrisisModal
};

console.log('✅ SharedModals.js loaded - Phase 2 (4 modal components refactored to props)');

// ═══════════════════════════════════════════════════════════
// PULL-TO-REFRESH INDICATOR COMPONENT
// Visual indicator shown during pull-to-refresh gesture
// ✅ PHASE 7C: Converted to props-based pattern
// ═══════════════════════════════════════════════════════════

const PullToRefreshIndicator = ({
    pulling,
    pullDistance,
    refreshing
}) => {
    if (!pulling) return null;

    return (
        <div style={{
            position: 'absolute',
            top: '80px',
            left: '50%',
            transform: `translateX(-50%) translateY(${Math.min(pullDistance, 80)}px)`,
            zIndex: 999,
            transition: refreshing ? 'transform 0.3s' : 'none'
        }}>
            <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: 'var(--color-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(6, 148, 148, 0.3)',
                animation: refreshing ? 'spin 1s linear infinite' : 'none'
            }}>
                <i
                    data-lucide={refreshing ? "loader" : "arrow-down"}
                    style={{width: '24px', height: '24px', color: '#fff'}}
                ></i>
            </div>
        </div>
    );
};

// Register component globally
window.GLRSApp = window.GLRSApp || { components: {} };
window.GLRSApp.components = window.GLRSApp.components || {};
window.GLRSApp.components.PullToRefreshIndicator = PullToRefreshIndicator;

console.log('✅ PullToRefreshIndicator component loaded');
// ═══════════════════════════════════════════════════════════
// MODAL RENDERER COMPONENT
// Centralized modal declarations extracted from PIRapp.js
// Renders all app-level modals based on state
// ✅ PHASE 7C: Converted to props-based pattern
// ═══════════════════════════════════════════════════════════

const ModalRenderer = ({
    // Modal States
    showDisclaimerModal,
    showTermsModal,
    showPrivacyModal,
    showDataHandlingModal,
    showCrisisModal,
    showIncompleteTasksModal,

    // Setters
    onCloseDisclaimerModal,
    onCloseTermsModal,
    onClosePrivacyModal,
    onCloseDataHandlingModal,
    onCloseCrisisModal,
    onCloseIncompleteTasksModal,

    // Data needed for rendering
    goals,
    assignments
}) => {
    return (
        <>
            {/* Phase 2: First-Launch Disclaimer Modal */}
            {showDisclaimerModal && (
                <window.GLRSApp.modals.DisclaimerModal
                    onAccept={() => {
                        localStorage.setItem('disclaimerAccepted', 'true');
                        localStorage.setItem('disclaimerAcceptedDate', new Date().toISOString());
                        if (onCloseDisclaimerModal) onCloseDisclaimerModal();
                    }}
                />
            )}

            {/* Phase 2: Legal Modals */}
            {showTermsModal && (
                <window.GLRSApp.modals.LegalModal
                    type="terms"
                    onClose={() => { if (onCloseTermsModal) onCloseTermsModal(); }}
                />
            )}

            {showPrivacyModal && (
                <window.GLRSApp.modals.LegalModal
                    type="privacy"
                    onClose={() => { if (onClosePrivacyModal) onClosePrivacyModal(); }}
                />
            )}

            {showDataHandlingModal && (
                <window.GLRSApp.modals.LegalModal
                    type="dataHandling"
                    onClose={() => { if (onCloseDataHandlingModal) onCloseDataHandlingModal(); }}
                />
            )}

            {/* Phase 2: Crisis Resources Modal */}
            {showCrisisModal && (
                <window.GLRSApp.modals.CrisisModal
                    onClose={() => { if (onCloseCrisisModal) onCloseCrisisModal(); }}
                />
            )}
            {/* Incomplete Tasks Modal */}
            {showIncompleteTasksModal && goals && (
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
                    onClick={() => { if (onCloseIncompleteTasksModal) onCloseIncompleteTasksModal(); }}
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

                            {goals
                                .filter(goal => goal.status === 'active')
                                .map(goal => {
                                    const incompleteTasks = (assignments || [])
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
                                onClick={() => { if (onCloseIncompleteTasksModal) onCloseIncompleteTasksModal(); }}
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
// ═══════════════════════════════════════════════════════════
// MAIN CONTENT COMPONENT
// View router - renders appropriate tab based on currentView
// ✅ PHASE 7C: Converted to props-based pattern
// ═══════════════════════════════════════════════════════════

const MainContent = ({
    contentRef,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    currentView,
    loading,
    userData,
    goals,
    assignments,
    checkIns,
    resources
}) => {

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

            {currentView === 'messages' && (
                loading ?
                    React.createElement(LoadingSpinner, { message: 'Loading messages...' }) :
                    React.createElement(window.GLRSApp.components.MessagesTab)
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

// ═══════════════════════════════════════════════════════════
// LOADING SPINNER COMPONENT
// Reusable loading indicator with optional message
// ═══════════════════════════════════════════════════════════

const LoadingSpinner = ({ message = 'Loading...' }) => {
    return React.createElement('div', {
        style: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '60vh',
            flexDirection: 'column',
            gap: '15px'
        }
    }, [
        React.createElement('div', {
            key: 'spinner',
            style: {
                width: '50px',
                height: '50px',
                border: '4px solid rgba(6, 148, 148, 0.2)',
                borderTop: '4px solid #069494',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
            }
        }),
        React.createElement('div', {
            key: 'message',
            style: {
                color: '#666',
                fontSize: '14px',
                fontWeight: '500'
            }
        }, message)
    ]);
};

// Register globally
window.GLRSApp = window.GLRSApp || {};
window.GLRSApp.components = window.GLRSApp.components || {};
window.GLRSApp.components.LoadingSpinner = LoadingSpinner;

console.log('✅ LoadingSpinner component loaded');

// ═══════════════════════════════════════════════════════════
// LEGAL FOOTER COMPONENT
// Terms of Service, Privacy Policy, and Data Handling links
// ✅ PHASE 7C: Converted to props-based pattern
// ═══════════════════════════════════════════════════════════

const LegalFooter = ({
    onShowTermsModal,
    onShowPrivacyModal,
    onShowDataHandlingModal
}) => {
    return (
        <div style={{
            textAlign: 'center',
            padding: '20px',
            background: 'rgba(0,0,0,0.1)',
            borderTop: '1px solid rgba(255,255,255,0.1)',
            marginBottom: '70px'
        }}>
            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)', marginBottom: '10px' }}>
                <a
                    href="#"
                    onClick={(e) => { e.preventDefault(); if (onShowTermsModal) onShowTermsModal(true); }}
                    style={{ color: 'rgba(255,255,255,0.9)', textDecoration: 'none', margin: '0 10px' }}
                >
                    Terms of Service
                </a>
                <span>•</span>
                <a
                    href="#"
                    onClick={(e) => { e.preventDefault(); if (onShowPrivacyModal) onShowPrivacyModal(true); }}
                    style={{ color: 'rgba(255,255,255,0.9)', textDecoration: 'none', margin: '0 10px' }}
                >
                    Privacy Policy
                </a>
                <span>•</span>
                <a
                    href="#"
                    onClick={(e) => { e.preventDefault(); if (onShowDataHandlingModal) onShowDataHandlingModal(true); }}
                    style={{ color: 'rgba(255,255,255,0.9)', textDecoration: 'none', margin: '0 10px' }}
                >
                    Data Handling
                </a>
            </div>
            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>
                © 2025 Guiding Light Recovery Services. All rights reserved.
            </div>
        </div>
    );
};

// Register component globally
window.GLRSApp = window.GLRSApp || { components: {} };
window.GLRSApp.components = window.GLRSApp.components || {};
window.GLRSApp.components.LegalFooter = LegalFooter;

console.log('✅ LegalFooter component loaded');
// ═══════════════════════════════════════════════════════════
// HEADERBAR COMPONENT
// Top navigation bar with view-specific actions and sidebar
// ✅ PHASE 1: Updated with Recovery Compass, User icon, and sidebar
// ═══════════════════════════════════════════════════════════

const HeaderBar = ({
    currentView,
    onShowProfileModal,
    onMarkAllNotificationsAsRead,
    userData,
    user
}) => {
    // Sidebar state (local to HeaderBar component)
    const [showSidebar, setShowSidebar] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    // Handle window resize for mobile responsiveness
    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Re-initialize Lucide icons when sidebar opens/closes
    useEffect(() => {
        const timer = setTimeout(() => {
            if (typeof lucide !== 'undefined' && typeof lucide.createIcons === 'function') {
                lucide.createIcons();
            }
        }, 50);
        return () => clearTimeout(timer);
    }, [showSidebar]);

    return (
        <>
            <div className="header">
                <div className="header-title" style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '8px' : '10px' }}>
                    {currentView === 'home' && (
                        <>
                            <button
                                onClick={() => {
                                    if (typeof window.GLRSApp?.utils?.triggerHaptic === 'function') {
                                        window.GLRSApp.utils.triggerHaptic('light');
                                    }
                                    setShowSidebar(true);
                                }}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    padding: 0,
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    color: '#14b8a6'
                                }}
                                title="Open sidebar"
                            >
                                <i data-lucide="compass" style={{width: isMobile ? '22px' : '24px', height: isMobile ? '22px' : '24px'}}></i>
                            </button>
                            <span style={{ fontSize: isMobile ? '16px' : '18px', fontWeight: '600' }}>Recovery Compass</span>
                        </>
                    )}
                    {currentView === 'connect' && 'Community'}
                    {currentView === 'messages' && 'Messages'}
                </div>
                <div className="header-actions">
                    {currentView === 'connect' && (
                        <button className="header-btn">
                            <i data-lucide="search" style={{width: '18px', height: '18px'}}></i>
                        </button>
                    )}
                    {/* User icon - navigates to profile */}
                    <button
                        className="header-btn"
                        onClick={() => {
                            if (typeof window.GLRSApp?.utils?.triggerHaptic === 'function') {
                                window.GLRSApp.utils.triggerHaptic('light');
                            }
                            window.dispatchEvent(new CustomEvent('glrs-navigate', { detail: { view: 'profile' } }));
                        }}
                        style={{
                            width: isMobile ? '36px' : '40px',
                            height: isMobile ? '36px' : '40px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: 0
                        }}
                        title="Profile"
                    >
                        <i data-lucide="user" style={{width: isMobile ? '18px' : '20px', height: isMobile ? '18px' : '20px'}}></i>
                    </button>
                </div>
            </div>

            {/* Sidebar Backdrop */}
            {showSidebar && (
                <div
                    onClick={() => {
                        if (typeof window.GLRSApp?.utils?.triggerHaptic === 'function') {
                            window.GLRSApp.utils.triggerHaptic('light');
                        }
                        setShowSidebar(false);
                    }}
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        zIndex: 9998,
                        animation: 'fadeIn 0.2s ease-out'
                    }}
                />
            )}

            {/* Sidebar Panel */}
            {showSidebar && (
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        bottom: 0,
                        width: isMobile ? '280px' : '320px',
                        backgroundColor: '#fff',
                        zIndex: 9999,
                        boxShadow: '2px 0 12px rgba(0, 0, 0, 0.15)',
                        animation: 'slideInLeft 0.3s ease-out',
                        display: 'flex',
                        flexDirection: 'column'
                    }}
                >
                    {/* Sidebar Header */}
                    <div style={{
                        padding: isMobile ? '20px 16px' : '24px 20px',
                        borderBottom: '1px solid #e5e7eb',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <i data-lucide="compass" style={{width: '24px', height: '24px', color: '#14b8a6'}}></i>
                            <h2 style={{
                                margin: 0,
                                fontSize: isMobile ? '18px' : '20px',
                                fontWeight: '700',
                                color: '#1f2937'
                            }}>
                                Home
                            </h2>
                        </div>
                        <button
                            onClick={() => {
                                if (typeof window.GLRSApp?.utils?.triggerHaptic === 'function') {
                                    window.GLRSApp.utils.triggerHaptic('light');
                                }
                                setShowSidebar(false);
                            }}
                            style={{
                                background: 'none',
                                border: 'none',
                                padding: '8px',
                                cursor: 'pointer',
                                color: '#6b7280',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderRadius: '4px',
                                transition: 'background-color 0.2s'
                            }}
                            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                            title="Close sidebar"
                        >
                            <i data-lucide="x" style={{width: '24px', height: '24px'}}></i>
                        </button>
                    </div>

                    {/* Sidebar Content */}
                    <div style={{
                        flex: 1,
                        padding: isMobile ? '24px 16px' : '32px 20px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        textAlign: 'center'
                    }}>
                        <div style={{
                            width: isMobile ? '80px' : '96px',
                            height: isMobile ? '80px' : '96px',
                            borderRadius: '50%',
                            backgroundColor: '#f0fdfa',
                            border: '3px solid #14b8a6',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginBottom: isMobile ? '20px' : '24px'
                        }}>
                            <i data-lucide="construction" style={{width: isMobile ? '40px' : '48px', height: isMobile ? '40px' : '48px', color: '#14b8a6'}}></i>
                        </div>

                        <h3 style={{
                            fontSize: isMobile ? '18px' : '20px',
                            fontWeight: '700',
                            color: '#1f2937',
                            marginBottom: isMobile ? '12px' : '16px'
                        }}>
                            Sidebar Under Construction
                        </h3>

                        <p style={{
                            fontSize: isMobile ? '14px' : '15px',
                            color: '#6b7280',
                            lineHeight: '1.6',
                            maxWidth: '260px',
                            margin: 0
                        }}>
                            We're thinking about the best ways to serve you
                        </p>
                    </div>

                    {/* Sidebar Footer (Optional) */}
                    <div style={{
                        padding: isMobile ? '16px' : '20px',
                        borderTop: '1px solid #e5e7eb',
                        textAlign: 'center'
                    }}>
                        <p style={{
                            fontSize: '13px',
                            color: '#9ca3af',
                            margin: 0
                        }}>
                            Check back soon for updates
                        </p>
                    </div>
                </div>
            )}

            {/* CSS Animations */}
            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }

                @keyframes slideInLeft {
                    from {
                        transform: translateX(-100%);
                    }
                    to {
                        transform: translateX(0);
                    }
                }
            `}</style>
        </>
    );
};

// Register component globally
window.GLRSApp = window.GLRSApp || { components: {} };
window.GLRSApp.components = window.GLRSApp.components || {};
window.GLRSApp.components.HeaderBar = HeaderBar;

console.log('✅ HeaderBar component loaded');
// ═══════════════════════════════════════════════════════════
// CRISIS BUTTON COMPONENT
// Floating emergency resources button
// ✅ PHASE 7C: Converted to props-based pattern
// ═══════════════════════════════════════════════════════════

const CrisisButton = ({ onShowCrisisModal }) => {
    return (
        <div style={{
            position: 'fixed',
            bottom: '90px',
            right: '20px',
            zIndex: 999
        }}>
            <button
                onClick={() => { if (onShowCrisisModal) onShowCrisisModal(true); }}
                style={{
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
                }}
                title="Crisis Resources"
            >
                <i data-lucide="alert-octagon" style={{width: '32px', height: '32px'}}></i>
            </button>
        </div>
    );
};

// Register component globally
window.GLRSApp = window.GLRSApp || { components: {} };
window.GLRSApp.components = window.GLRSApp.components || {};
window.GLRSApp.components.CrisisButton = CrisisButton;

console.log('✅ CrisisButton component loaded');
// ═══════════════════════════════════════════════════════════
// BOTTOM NAVIGATION COMPONENT - REMOVED
// This component has been moved to MeetingsTab.js with 6 tabs
// (Tasks, Journey, Meetings, Connect, Guides, Notifications)
// ═══════════════════════════════════════════════════════════

