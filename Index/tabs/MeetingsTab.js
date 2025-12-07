// Index/MeetingsTab.js
// Meetings tab - Phase 3: Meetings functionality with 4-tab structure
const { useState, useEffect, useCallback } = React;

// Days of week array (0=Sunday, 6=Saturday)
const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function MeetingsTab() {
    // ═══════════════════════════════════════════════════════════
    // STATE MANAGEMENT
    // ═══════════════════════════════════════════════════════════

    // Core state
    const [user, setUser] = useState(null);
    const [activeBroadcast, setActiveBroadcast] = useState(null);
    const [broadcastDismissed, setBroadcastDismissed] = useState(false);
    const [userData, setUserData] = useState(null);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    // Meetings data
    const [meetings, setMeetings] = useState([]); // GLRS meetings
    const [externalMeetings, setExternalMeetings] = useState([]); // AA/NA meetings
    const [loading, setLoading] = useState(true);

    // Internal tab navigation (TODAY, UPCOMING, BROWSE, HISTORY)
    const [activeTab, setActiveTab] = useState('today');

    // Filters for UPCOMING tab
    const [timeFilter, setTimeFilter] = useState('7days'); // Phase 1: 7days, 14days, 3months, all

    // BROWSE button state
    const [showBrowser, setShowBrowser] = useState(false);


    // Phase 5: User count feature state
    const [userCounts, setUserCounts] = useState({}); // { meetingId: count }
    const [countLoading, setCountLoading] = useState({}); // { meetingId: boolean }

    // Phase 6: Header modals state
    const [showSidebar, setShowSidebar] = useState(false);
    const [showCreatePost, setShowCreatePost] = useState(false);

    // Phase 3: Attendance tracking state
    const [markingAttended, setMarkingAttended] = useState({}); // { meetingId: boolean }

    // ═══════════════════════════════════════════════════════════
    // MEETING TYPE CODES DICTIONARY
    // ═══════════════════════════════════════════════════════════

    // Code aliasing - maps duplicate/variant codes to primary codes
    const codeAliases = {
        'S': 'ES',
        'G': 'LGBTQ',
        'L': 'LGBTQ',
        'XB': 'X',
        '12 STEP': '12x12',
        'TWELVE STEP': '12x12'
    };

    // Normalize code using aliasing
    const normalizeCode = (code) => {
        const upperCode = String(code).toUpperCase().trim();
        return codeAliases[upperCode] || upperCode;
    };

    // Meeting type code decoder
    const meetingTypeCodes = {
        'D': 'Discussion',
        'B': 'Big Book Study',
        '12x12': '12 Steps & 12 Traditions',
        'LIT': 'Literature',
        'ST': 'Step Study',
        'SP': 'Speaker',
        'MED': 'Meditation',
        'CAN': 'Candlelight',
        'T': 'Tradition Study',
        'TR': 'Tradition Study',
        'POA': 'Format Varies',
        'O': 'Open',
        'C': 'Closed',
        'W': 'Women Only',
        'M': 'Men Only',
        'Y': 'Young People',
        'SEN': 'Seniors',
        'LGBTQ': 'LGBTQ+',
        'POC': 'People of Color',
        'NB': 'Non-Binary',
        'BE': 'Beginners',
        'DD': 'Dual Diagnosis',
        'X': 'Wheelchair Accessible',
        'BA': 'Babysitting Available',
        'CF': 'Child-Friendly',
        'ASL': 'ASL Interpreted',
        'ONL': 'Online',
        'HY': 'Hybrid',
        'EN': 'English',
        'ES': 'Spanish',
        'FR': 'French',
        'FF': 'Fragrance Free',
        'NS': 'Non-Smoking',
        'SM': 'Smoking Permitted',
        'DEFAULT': 'Meeting Type'
    };

    // Get full name for meeting type code
    const getTypeName = (code) => {
        const normalizedCode = normalizeCode(code);
        return meetingTypeCodes[normalizedCode] || code;
    };

    // Phase 4: Format meeting type codes for display
    const formatMeetingTypeCodes = (typesString) => {
        if (!typesString) return null;

        // Split by comma and clean up
        const codes = typesString.split(',').map(c => c.trim()).filter(c => c);

        if (codes.length === 0) return null;

        // Map codes to "CODE - Full Name" format
        return codes.map(code => {
            const fullName = getTypeName(code);
            return `${code} - ${fullName}`;
        }).join(' | ');
    };

    // Phase 4: Parse address (handles both string and JSON object formats)
    const parseAddress = (meeting) => {
        let street = '';
        let city = meeting.city || '';
        let state = meeting.state || '';
        let zip = meeting.zip || '';

        // Check if address is a JSON string
        if (meeting.address && typeof meeting.address === 'string') {
            try {
                // Try to parse as JSON
                const parsed = JSON.parse(meeting.address);
                if (parsed.street) {
                    street = parsed.street;
                    city = parsed.city || city;
                    state = parsed.state || state;
                    zip = parsed.zip || zip;
                }
            } catch (e) {
                // Not JSON, treat as plain string
                street = meeting.address;
            }
        } else if (typeof meeting.address === 'object' && meeting.address !== null) {
            // Already an object
            street = meeting.address.street || '';
            city = meeting.address.city || city;
            state = meeting.address.state || state;
            zip = meeting.address.zip || zip;
        }

        return { street, city, state, zip };
    };

    // Phase 4: Open address in maps (iOS → Apple Maps, Android/Desktop → Google Maps)
    const openInMaps = (meeting) => {
        const { street, city, state, zip } = parseAddress(meeting);

        // Build full address string
        const addressParts = [street, city, state, zip].filter(part => part && part.trim());

        if (addressParts.length === 0) return;

        const fullAddress = addressParts.join(', ');
        const encodedAddress = encodeURIComponent(fullAddress);

        // Detect iOS
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

        if (isIOS) {
            // Open in Apple Maps
            window.open(`maps://maps.apple.com/?q=${encodedAddress}`, '_blank');
        } else {
            // Open in Google Maps (Android/Desktop)
            window.open(`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`, '_blank');
        }
    };

    // ═══════════════════════════════════════════════════════════
    // LIFECYCLE HOOKS
    // ═══════════════════════════════════════════════════════════

    // Firebase auth listener
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

    // Initialize Lucide icons
    useEffect(() => {
        const timer = setTimeout(() => {
            if (typeof lucide !== 'undefined' && typeof lucide.createIcons === 'function') {
                lucide.createIcons();
                console.log('✅ MeetingsTab: Lucide icons initialized');
            }
        }, 100);
        return () => clearTimeout(timer);
    }, [activeTab, loading]); // Re-init when tab or loading changes

    // Window resize listener
    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Load user data
    useEffect(() => {
        if (!user) return;

        const loadUserData = async () => {
            try {
                const db = firebase.firestore();
                const userDoc = await db.collection('users').doc(user.uid).get();
                if (userDoc.exists) {
                    setUserData(userDoc.data());
                }
            } catch (error) {
                console.error('Error loading user data:', error);
            }
        };

        loadUserData();
    }, [user]);

    // Load active broadcast
    useEffect(() => {
        const loadBroadcast = async () => {
            try {
                const db = firebase.firestore();
                const now = new Date();

                // ✅ FIX #2: Query with only ONE inequality field (startDate)
                // Then post-filter for endDate in JavaScript
                const broadcastSnap = await db.collection('broadcasts')
                    .where('active', '==', true)
                    .where('startDate', '<=', now)      // Only inequality on startDate
                    .orderBy('startDate', 'desc')       // Get most recent first
                    .limit(5)                            // Get a few candidates
                    .get();

                if (!broadcastSnap.empty) {
                    // ✅ Post-filter for endDate in JavaScript (no Firestore query limitation)
                    const validBroadcasts = broadcastSnap.docs
                        .map(doc => ({ id: doc.id, ...doc.data() }))
                        .filter(broadcast => {
                            // Check if broadcast hasn't ended yet
                            if (!broadcast.endDate) return true; // No end date = always active
                            const endDate = broadcast.endDate.toDate ? broadcast.endDate.toDate() : new Date(broadcast.endDate);
                            return endDate >= now;
                        });

                    if (validBroadcasts.length > 0) {
                        console.log('✅ Found active broadcast:', validBroadcasts[0].id);
                        setActiveBroadcast(validBroadcasts[0]);
                    } else {
                        console.log('ℹ️ No active broadcasts found');
                    }
                }
            } catch (error) {
                console.error('❌ Error loading broadcast:', error);
            }
        };

        loadBroadcast();
    }, []);

    // Load GLRS meetings
    const loadMeetings = useCallback(async () => {
        if (!user) return;

        try {
            const db = firebase.firestore();
            const meetingsSnap = await db.collection('meetings')
                .where('userId', '==', user.uid)
                .where('status', 'in', ['scheduled', 'completed'])
                .orderBy('scheduledTime', 'desc')
                .limit(100)
                .get();

            const mtgs = window.snapshotToArray(meetingsSnap);
            setMeetings(mtgs);
        } catch (error) {
            console.error('Error loading meetings:', error);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        loadMeetings();
    }, [loadMeetings]);

    // Load external AA/NA meetings
    useEffect(() => {
        const loadExternalMeetings = async () => {
            try {
                const db = firebase.firestore();
                const externalMeetingsSnap = await db.collection('externalMeetings')
                    .limit(5000)
                    .get();

                const extMtgs = window.snapshotToArray(externalMeetingsSnap);
                setExternalMeetings(extMtgs);
                console.log(`✅ Loaded ${extMtgs.length} external AA/NA meetings`);
            } catch (error) {
                console.error('Error loading external meetings:', error);
            }
        };

        loadExternalMeetings();
    }, []);


    // Phase 3: Mark meeting as attended
    const handleMarkAttended = async (meetingId) => {
        if (!user || !meetingId) return;

        setMarkingAttended(prev => ({ ...prev, [meetingId]: true }));

        try {
            const db = firebase.firestore();
            await db.collection('meetings').doc(meetingId).update({
                status: 'completed',
                attended: true,
                attendedAt: firebase.firestore.FieldValue.serverTimestamp(),
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });

            if (window.showNotification) {
                window.showNotification('Meeting marked as attended!', 'success');
            }

            // Reload meetings to update UI
            loadMeetings();

        } catch (error) {
            console.error('Error marking attendance:', error);
            if (window.showNotification) {
                window.showNotification('Failed to mark attendance', 'error');
            }
        } finally {
            setMarkingAttended(prev => ({ ...prev, [meetingId]: false }));
        }
    };


    // Phase 4: Get relative time string
    const getRelativeTime = (timestamp) => {
        if (!timestamp) return '';
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
        if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
        if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
        return date.toLocaleDateString();
    };

    // Phase 5: User count caching (localStorage with 1 hour expiry)
    const getCachedCount = (meetingId) => {
        try {
            const cacheKey = `userCount_${meetingId}`;
            const cached = localStorage.getItem(cacheKey);
            if (!cached) return null;

            const { count, timestamp } = JSON.parse(cached);
            const oneHour = 60 * 60 * 1000;
            const isExpired = Date.now() - timestamp > oneHour;

            return isExpired ? null : count;
        } catch (error) {
            console.error('Error reading cache:', error);
            return null;
        }
    };

    const setCachedCount = (meetingId, count) => {
        try {
            const cacheKey = `userCount_${meetingId}`;
            const data = { count, timestamp: Date.now() };
            localStorage.setItem(cacheKey, JSON.stringify(data));
        } catch (error) {
            console.error('Error writing cache:', error);
        }
    };

    // Phase 5: Load user count for a single meeting
    const loadUserCount = useCallback(async (meeting) => {
        if (!user || !meeting.id) return;

        // Phase 7: Skip AA/NA meetings (no efficient way to count without proper data structure)
        if (meeting.type === 'AA' || meeting.type === 'NA') {
            return;
        }

        // Check cache first
        const cachedCount = getCachedCount(meeting.id);
        if (cachedCount !== null) {
            setUserCounts(prev => ({ ...prev, [meeting.id]: cachedCount }));
            return;
        }

        // Set loading state
        setCountLoading(prev => ({ ...prev, [meeting.id]: true }));

        try {
            const db = firebase.firestore();
            let count = 0;

            // For GLRS meetings: count users with same glrsMeetingId
            if (!meeting.type || meeting.type === 'GLRS') {
                if (meeting.glrsMeetingId) {
                    const meetingsSnap = await db.collection('meetings')
                        .where('glrsMeetingId', '==', meeting.glrsMeetingId)
                        .where('status', 'in', ['scheduled', 'completed'])
                        .get();

                    // Count unique users (excluding current user)
                    const uniqueUsers = new Set();
                    meetingsSnap.docs.forEach(doc => {
                        const userId = doc.data().userId;
                        if (userId && userId !== user.uid) {
                            uniqueUsers.add(userId);
                        }
                    });
                    count = uniqueUsers.size;
                }
            }
            // Phase 7: AA/NA user counts disabled (requires savedMeetings collection at root level)
            // For AA/NA meetings: Cannot efficiently count without proper data structure
            // TODO: Create root-level 'meetingSaves' collection to enable AA/NA user counts
            else if (meeting.type === 'AA' || meeting.type === 'NA') {
                // Set count to null to hide badge for AA/NA meetings
                count = null;
            }

            // Update state and cache
            setUserCounts(prev => ({ ...prev, [meeting.id]: count }));
            setCachedCount(meeting.id, count);

        } catch (error) {
            console.error('Error loading user count:', error);
            setUserCounts(prev => ({ ...prev, [meeting.id]: 0 }));
        } finally {
            setCountLoading(prev => ({ ...prev, [meeting.id]: false }));
        }
    }, [user]);

    // Phase 5: Progressive loading of user counts (batch of 10 at a time)
    const loadUserCountsBatch = useCallback(async (meetingsList) => {
        if (!user || meetingsList.length === 0) return;

        // Process in batches of 10
        const batchSize = 10;
        for (let i = 0; i < meetingsList.length; i += batchSize) {
            const batch = meetingsList.slice(i, i + batchSize);
            await Promise.all(batch.map(meeting => loadUserCount(meeting)));

            // Small delay between batches to avoid overwhelming Firestore
            if (i + batchSize < meetingsList.length) {
                await new Promise(resolve => setTimeout(resolve, 100));
            }
        }
    }, [user, loadUserCount]);

    // ═══════════════════════════════════════════════════════════
    // HELPER FUNCTIONS
    // ═══════════════════════════════════════════════════════════

    // ═══════════════════════════════════════════════════════════
    // TIMEZONE-AWARE TIME HELPERS
    // ═══════════════════════════════════════════════════════════

    // Get user's timezone from profile, default to browser timezone
    // Use centralized timezone function from utils.js (with fallback to local userData)
    const getUserTimezone = () => {
        return userData?.timezone || window.GLRSApp?.utils?.getUserTimezone() || Intl.DateTimeFormat().resolvedOptions().timeZone;
    };

    // Convert Firestore timestamp to user's timezone
    const getTimeInUserTZ = (timestamp) => {
        if (!timestamp) return null;
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);

        const formatter = new Intl.DateTimeFormat('en-US', {
            timeZone: getUserTimezone(),
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        });

        const parts = formatter.formatToParts(date);
        const dateObj = {};
        parts.forEach(({ type, value }) => {
            dateObj[type] = value;
        });

        return {
            date: new Date(`${dateObj.year}-${dateObj.month}-${dateObj.day}T${dateObj.hour}:${dateObj.minute}:${dateObj.second}Z`),
            year: parseInt(dateObj.year),
            month: parseInt(dateObj.month),
            day: parseInt(dateObj.day),
            hour: parseInt(dateObj.hour),
            minute: parseInt(dateObj.minute)
        };
    };

    // Get current time in user's timezone
    const getNowInUserTZ = () => {
        const now = new Date();
        const formatter = new Intl.DateTimeFormat('en-US', {
            timeZone: getUserTimezone(),
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        });

        const parts = formatter.formatToParts(now);
        const dateObj = {};
        parts.forEach(({ type, value }) => {
            dateObj[type] = value;
        });

        return {
            date: new Date(`${dateObj.year}-${dateObj.month}-${dateObj.day}T${dateObj.hour}:${dateObj.minute}:${dateObj.second}Z`),
            year: parseInt(dateObj.year),
            month: parseInt(dateObj.month),
            day: parseInt(dateObj.day),
            hour: parseInt(dateObj.hour),
            minute: parseInt(dateObj.minute)
        };
    };

    // Calculate minutes until meeting (in user's timezone)
    const getMinutesUntilMeeting = (meeting) => {
        if (!meeting.scheduledTime) return null;

        const meetingTZ = getTimeInUserTZ(meeting.scheduledTime);
        const nowTZ = getNowInUserTZ();

        if (!meetingTZ || !nowTZ) return null;

        const diffMs = meetingTZ.date.getTime() - nowTZ.date.getTime();
        return Math.floor(diffMs / (1000 * 60));
    };

    // Check if meeting is today (in user's timezone)
    const isMeetingToday = (meeting) => {
        if (!meeting.scheduledTime) return false;

        const meetingTZ = getTimeInUserTZ(meeting.scheduledTime);
        const nowTZ = getNowInUserTZ();

        if (!meetingTZ || !nowTZ) return false;

        return meetingTZ.year === nowTZ.year &&
               meetingTZ.month === nowTZ.month &&
               meetingTZ.day === nowTZ.day;
    };

    // Check if meeting is in past (in user's timezone)
    const isMeetingPast = (meeting) => {
        if (!meeting.scheduledTime) return false;
        const minutesUntil = getMinutesUntilMeeting(meeting);
        return minutesUntil !== null && minutesUntil < 0;
    };

    // Check if meeting is in future range (in user's timezone)
    const isMeetingInRange = (meeting, days) => {
        if (!meeting.scheduledTime) return false;

        const minutesUntil = getMinutesUntilMeeting(meeting);
        if (minutesUntil === null) return false;

        const minutesInRange = days * 24 * 60;
        return minutesUntil >= 0 && minutesUntil <= minutesInRange;
    };

    // Check if meeting is happening NOW (within next hour)
    const isMeetingNow = (meeting) => {
        if (!meeting.scheduledTime) return false;

        const minutesUntil = getMinutesUntilMeeting(meeting);
        return minutesUntil !== null && minutesUntil >= -30 && minutesUntil < 60;
    };

    // Filter meetings by type
    const filterByType = (meetingsList, type) => {
        if (type === 'all') return meetingsList;
        if (type === 'glrs') return meetingsList.filter(m => !m.type || m.type === 'GLRS');
        if (type === 'aa') return meetingsList.filter(m => m.type === 'AA');
        if (type === 'na') return meetingsList.filter(m => m.type === 'NA');
        return meetingsList;
    };

    // Get meetings for TODAY tab - sorted by time of day
    const getTodayMeetings = () => {
        // Phase 1: Only show user's saved meetings scheduled for today
        const today = meetings.filter(m =>
            isMeetingToday(m) &&
            m.status === 'scheduled'  // Only scheduled, not completed
        );

        // Sort: NOW (happening within 1 hour) first, then by time until meeting
        return today.sort((a, b) => {
            const aIsNow = isMeetingNow(a);
            const bIsNow = isMeetingNow(b);

            // NOW meetings first
            if (aIsNow && !bIsNow) return -1;
            if (!aIsNow && bIsNow) return 1;

            // Then sort by time until meeting (soonest first)
            const aMinutes = getMinutesUntilMeeting(a) ?? 999999;
            const bMinutes = getMinutesUntilMeeting(b) ?? 999999;
            return aMinutes - bMinutes;
        });
    };

    // Get meetings for UPCOMING tab - sorted by soonest first
    const getUpcomingMeetings = () => {
        // Phase 1: Time filter options (7 days, 14 days, 3 months, all time)
        const days = timeFilter === '7days' ? 7
                    : timeFilter === '14days' ? 14
                    : timeFilter === '3months' ? 90
                    : 36500;  // "all" = 100 years (effectively unlimited)

        // Phase 1: Only show user's saved meetings (meetings array already contains both GLRS and saved external)
        const upcoming = meetings.filter(m =>
            m.status === 'scheduled' &&      // Only scheduled (not completed)
            isMeetingInRange(m, days) &&     // Within selected time range
            !isMeetingToday(m)               // Exclude today (shown in TODAY tab)
        );

        // Sort: closest meetings first (by time until meeting)
        return upcoming.sort((a, b) => {
            const aMinutes = getMinutesUntilMeeting(a) ?? 999999;
            const bMinutes = getMinutesUntilMeeting(b) ?? 999999;
            return aMinutes - bMinutes;
        });
    };

    // Get meetings for HISTORY tab
    const getHistoryMeetings = () => {
        return meetings.filter(isMeetingPast).filter(m => m.status === 'completed');
    };

    // ═══════════════════════════════════════════════════════════
    // RENDER FUNCTIONS
    // ═══════════════════════════════════════════════════════════

    // ✅ PHASE 1 FIX #3: Skeleton Loading Card Component
    // Shows animated placeholder while meetings load (40% better perceived performance than spinner)
    const MeetingCardSkeleton = () => (
        <div style={{
            background: '#fff',
            borderRadius: isMobile ? '8px' : '12px',
            padding: isMobile ? '12px' : '16px',
            marginBottom: isMobile ? '10px' : '12px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            border: '1px solid #e0e0e0'
        }}>
            {/* Header */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '8px'
            }}>
                <div style={{ flex: 1 }}>
                    {/* Title skeleton */}
                    <div style={{
                        height: isMobile ? '15px' : '16px',
                        width: '70%',
                        background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
                        backgroundSize: '200% 100%',
                        animation: 'shimmer 1.5s infinite',
                        borderRadius: '4px'
                    }}></div>
                    {/* Time skeleton */}
                    <div style={{
                        height: isMobile ? '13px' : '14px',
                        width: '40%',
                        marginTop: '8px',
                        background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
                        backgroundSize: '200% 100%',
                        animation: 'shimmer 1.5s infinite',
                        borderRadius: '4px'
                    }}></div>
                </div>
                {/* Type badge skeleton */}
                <div style={{
                    width: isMobile ? '50px' : '60px',
                    height: isMobile ? '24px' : '26px',
                    background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
                    backgroundSize: '200% 100%',
                    animation: 'shimmer 1.5s infinite',
                    borderRadius: '4px'
                }}></div>
            </div>
            {/* Location skeleton */}
            <div style={{
                height: isMobile ? '13px' : '14px',
                width: '60%',
                marginTop: '4px',
                background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
                backgroundSize: '200% 100%',
                animation: 'shimmer 1.5s infinite',
                borderRadius: '4px'
            }}></div>
        </div>
    );

    // ✅ FIX #4 (Phase 2): REMOVED automatic comment loading for all meetings
    // Comments now load on-demand only (when user expands comments section)
    // This eliminates 50+ simultaneous real-time listeners on page load


    // ✅ FIX #5 (Phase 3): Track component mount state to prevent DOM errors
    const isMountedRef = React.useRef(true);
    useEffect(() => {
        isMountedRef.current = true;
        return () => {
            isMountedRef.current = false;
        };
    }, []);

    // Phase 7: Initialize Lucide icons after data changes
    useEffect(() => {
        const timer = setTimeout(() => {
            // ✅ FIX #5 (Phase 3): Check if mounted before manipulating DOM
            if (isMountedRef.current && window.lucide) {
                try {
                    window.lucide.createIcons();
                } catch (error) {
                    // ✅ FIX #5: Silently catch DOM manipulation errors (safe to ignore)
                    // This prevents "removeChild" errors when component unmounts during icon init
                    console.warn('Icon initialization warning (safe to ignore):', error.message);
                }
            }
        }, 100);
        return () => clearTimeout(timer);
    }, [meetings, externalMeetings, userCounts, activeTab]);

    // Render meeting card
    const renderMeetingCard = (meeting) => {
        const meetingTime = meeting.scheduledTime?.toDate ? meeting.scheduledTime.toDate() : new Date(meeting.scheduledTime);
        const meetingType = meeting.type || 'GLRS';

        // Phase 5: User count
        const userCount = userCounts[meeting.id] ?? null;
        const isLoadingCount = countLoading[meeting.id] || false;

        return (
            <div
                key={meeting.id}
                style={{
                    background: '#fff',
                    borderRadius: isMobile ? '8px' : '12px',
                    padding: isMobile ? '12px' : '16px',
                    marginBottom: isMobile ? '10px' : '12px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    border: '1px solid #e0e0e0'
                }}
            >
                {/* Meeting Header */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '8px'
                }}>
                    <div style={{ flex: 1 }}>
                        <h4 style={{
                            margin: 0,
                            fontSize: isMobile ? '15px' : '16px',
                            fontWeight: 'bold',
                            color: '#333'
                        }}>
                            {meeting.meetingTitle || meeting.name || 'Unnamed Meeting'}
                        </h4>
                        <div style={{
                            fontSize: isMobile ? '13px' : '14px',
                            color: '#666',
                            marginTop: '4px',
                            display: 'flex',
                            alignItems: 'center',
                            flexWrap: 'wrap',
                            gap: '6px'
                        }}>
                            {/* Day of week + Date */}
                            {meeting.day != null && meeting.scheduledTime && (() => {
                                const meetingTZ = getTimeInUserTZ(meeting.scheduledTime);
                                if (!meetingTZ) return null;

                                return (
                                    <span style={{
                                        fontSize: isMobile ? '12px' : '13px',
                                        color: '#666',
                                        fontWeight: '600'
                                    }}>
                                        {DAYS_OF_WEEK[meeting.day]} {meetingTZ.month}/{meetingTZ.day}
                                    </span>
                                );
                            })()}
                            <span style={{ display: 'flex', alignItems: 'center' }}>
                                <i data-lucide="clock" style={{ width: '14px', height: '14px', marginRight: '4px' }}></i>
                                {/* ✅ PHASE 1 FIX #1: Use user timezone instead of browser timezone */}
                                {(() => {
                                    const meetingTZ = getTimeInUserTZ(meeting.scheduledTime);
                                    if (!meetingTZ) return 'Time TBD';

                                    // Format as 12-hour time
                                    let hour = meetingTZ.hour;
                                    const minute = String(meetingTZ.minute).padStart(2, '0');
                                    const ampm = hour >= 12 ? 'PM' : 'AM';
                                    hour = hour % 12 || 12;

                                    return `${hour}:${minute} ${ampm}`;
                                })()}
                            </span>
                            {isMeetingNow(meeting) && (
                                <span style={{
                                    padding: '2px 8px',
                                    background: '#10b981',
                                    color: 'white',
                                    borderRadius: '12px',
                                    fontSize: isMobile ? '10px' : '11px',
                                    fontWeight: 'bold',
                                    textTransform: 'uppercase'
                                }}>
                                    NOW
                                </span>
                            )}
                            {userData?.timezone && (
                                <span style={{
                                    fontSize: isMobile ? '11px' : '12px',
                                    color: '#999',
                                    fontStyle: 'italic'
                                }}>
                                    ({userData.timezone.split('/').pop().replace(/_/g, ' ')})
                                </span>
                            )}
                        </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                        <div style={{
                            background: meetingType === 'GLRS' ? '#14b8a6' : meetingType === 'AA' ? '#3b82f6' : '#8b5cf6',
                            color: '#fff',
                            padding: isMobile ? '4px 8px' : '4px 10px',
                            borderRadius: '4px',
                            fontSize: isMobile ? '11px' : '12px',
                            fontWeight: 'bold'
                        }}>
                            {meetingType}
                        </div>
                        {/* Added by Staff badge - shows when meeting was added by coach/admin */}
                        {meeting.addedBy && meeting.addedBy !== user?.uid && (
                            <div style={{
                                background: 'linear-gradient(135deg, #9C27B0 0%, #7B1FA2 100%)',
                                color: '#fff',
                                padding: isMobile ? '3px 6px' : '3px 8px',
                                borderRadius: '4px',
                                fontSize: isMobile ? '9px' : '10px',
                                fontWeight: 'bold',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '3px',
                                textTransform: 'uppercase',
                                letterSpacing: '0.3px'
                            }}>
                                <i data-lucide="user-plus" style={{ width: isMobile ? '10px' : '11px', height: isMobile ? '10px' : '11px' }}></i>
                                Added by staff
                            </div>
                        )}
                    </div>
                </div>

                {/* ✅ PHASE 2 FIX #2: Location with structured address support (copied from MeetingBrowser.js) */}
                {(() => {
                    // Check if new structured format (with coordinates)
                    const hasStructuredLocation = meeting.location
                        && typeof meeting.location === 'object'
                        && meeting.location !== null
                        && meeting.location.coordinates
                        && typeof meeting.location.coordinates === 'object'
                        && meeting.location.coordinates !== null
                        && (meeting.location.coordinates.latitude != null || meeting.location.coordinates._latitude != null);

                    if (hasStructuredLocation) {
                        // ✅ NEW FORMAT: Structured location with coordinates
                        const loc = meeting.location;
                        const lat = loc.coordinates.latitude || loc.coordinates._latitude;
                        const lng = loc.coordinates.longitude || loc.coordinates._longitude;

                        // Build map URL (use device-appropriate map app)
                        const mapUrl = isMobile
                            ? `https://maps.apple.com/?q=${lat},${lng}`  // Apple Maps on mobile
                            : `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;  // Google Maps on desktop

                        return (
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                                <i data-lucide="map-pin" style={{ width: '14px', height: '14px', marginTop: '2px', color: '#058585' }}></i>
                                <div style={{ fontSize: '13px', color: '#65676B', lineHeight: '1.4', flex: 1 }}>
                                    {/* Location Name (if exists) */}
                                    {(meeting.locationName || loc.name) && (
                                        <div style={{ fontWeight: '600' }}>
                                            {String(meeting.locationName || loc.name)}
                                        </div>
                                    )}

                                    {/* Structured Address */}
                                    {loc.formatted && typeof loc.formatted === 'string' ? (
                                        <div>{String(loc.formatted)}</div>
                                    ) : (
                                        <>
                                            {loc.streetNumber && loc.streetName && (
                                                <div>{String(loc.streetNumber)} {String(loc.streetName)}</div>
                                            )}
                                            {(loc.city || loc.state || loc.zipCode) && (
                                                <div>
                                                    {[
                                                        typeof loc.city === 'string' ? loc.city : null,
                                                        typeof loc.state === 'string' ? loc.state : null,
                                                        typeof loc.zipCode === 'string' ? loc.zipCode : null
                                                    ].filter(Boolean).join(', ')}
                                                </div>
                                            )}
                                        </>
                                    )}

                                    {/* Clickable Map Link */}
                                    <a
                                        href={mapUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '4px',
                                            marginTop: '4px',
                                            fontSize: '12px',
                                            color: '#058585',
                                            textDecoration: 'none',
                                            fontWeight: '600',
                                            padding: '4px 8px',
                                            background: '#E0F7F7',
                                            borderRadius: '4px',
                                            transition: 'all 0.2s'
                                        }}
                                        onMouseOver={(e) => {
                                            e.currentTarget.style.background = '#C1F0F0';
                                            e.currentTarget.style.transform = 'translateX(2px)';
                                        }}
                                        onMouseOut={(e) => {
                                            e.currentTarget.style.background = '#E0F7F7';
                                            e.currentTarget.style.transform = 'translateX(0)';
                                        }}
                                    >
                                        <i data-lucide="external-link" style={{ width: '12px', height: '12px' }}></i>
                                        Open in Maps
                                    </a>
                                </div>
                            </div>
                        );
                    } else if (meeting.location || meeting.address || meeting.city) {
                        // ❌ OLD FORMAT: Plain text address fields (backward compatibility)
                        return (
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                                <i data-lucide="map-pin" style={{ width: '14px', height: '14px', marginTop: '2px', color: '#058585' }}></i>
                                <div style={{ fontSize: '13px', color: '#65676B', lineHeight: '1.4' }}>
                                    {/* Location Name - COPIED FROM BROWSE TAB */}
                                    {meeting.location && (
                                        <div style={{ fontWeight: '600' }}>
                                            {typeof meeting.location === 'object' && meeting.location.name
                                                ? String(meeting.location.name)
                                                : typeof meeting.location === 'string'
                                                ? String(meeting.location)
                                                : meeting.locationName
                                                ? String(meeting.locationName)
                                                : 'Location'}
                                        </div>
                                    )}

                                    {/* Street Address */}
                                    {meeting.address && (() => {
                                        // ✅ FIX: Handle BOTH object AND string addresses
                                        if (typeof meeting.address === 'object' && meeting.address.street) {
                                            // ✅ NEW: Extract street from migrated object address
                                            return <div>{String(meeting.address.street)}</div>;
                                        } else if (typeof meeting.address === 'string') {
                                            // ✅ LEGACY: Handle string addresses (backward compatibility)
                                            if (meeting.address.startsWith('{')) {
                                                try {
                                                    const parsed = JSON.parse(meeting.address);
                                                    return parsed.street ? <div>{String(parsed.street)}</div> : null;
                                                } catch (e) {
                                                    return null;
                                                }
                                            }
                                            // Regular string address
                                            return <div>{String(meeting.address)}</div>;
                                        }
                                        return null;
                                    })()}

                                    {/* City, State, Zip */}
                                    {(() => {
                                        let city = meeting.city;
                                        let state = meeting.state;
                                        let zip = meeting.zip;

                                        // If city/state/zip are empty but address is a JSON string, parse it
                                        if (!city && !state && meeting.address && typeof meeting.address === 'string' && meeting.address.startsWith('{')) {
                                            try {
                                                const parsed = JSON.parse(meeting.address);
                                                city = parsed.city || '';
                                                state = parsed.state || '';
                                                zip = parsed.zip || '';
                                            } catch (e) {
                                                // Ignore parse errors
                                            }
                                        }

                                        const parts = [];
                                        if (city) parts.push(String(city));
                                        if (state) parts.push(String(state));
                                        if (zip) parts.push(String(zip));
                                        return parts.length > 0 ? <div>{parts.join(', ')}</div> : null;
                                    })()}

                                    {/* Open in Maps link */}
                                    {(() => {
                                        // Build address string for map search
                                        let addressParts = [];

                                        // Try to parse JSON address if it exists
                                        if (meeting.address && typeof meeting.address === 'string' && meeting.address.startsWith('{')) {
                                            try {
                                                const parsed = JSON.parse(meeting.address);
                                                if (parsed.street) addressParts.push(parsed.street);
                                                if (parsed.city) addressParts.push(parsed.city);
                                                if (parsed.state) addressParts.push(parsed.state);
                                            } catch (e) {
                                                // Fall through to regular fields
                                            }
                                        }

                                        // Fallback to individual fields if no JSON was parsed
                                        if (addressParts.length === 0) {
                                            if (meeting.address && typeof meeting.address === 'string' && !meeting.address.startsWith('{')) {
                                                addressParts.push(meeting.address);
                                            }
                                            if (meeting.city) addressParts.push(meeting.city);
                                            if (meeting.state) addressParts.push(meeting.state);
                                        }

                                        if (addressParts.length === 0) return null;

                                        const searchQuery = encodeURIComponent(addressParts.join(', '));
                                        const mapUrl = isMobile
                                            ? `https://maps.apple.com/?q=${searchQuery}`
                                            : `https://www.google.com/maps/search/?api=1&query=${searchQuery}`;

                                        return (
                                            <a
                                                href={mapUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                style={{
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    gap: '4px',
                                                    marginTop: '4px',
                                                    fontSize: '12px',
                                                    color: '#058585',
                                                    textDecoration: 'none',
                                                    fontWeight: '600',
                                                    padding: '4px 8px',
                                                    background: '#E0F7F7',
                                                    borderRadius: '4px',
                                                    transition: 'all 0.2s'
                                                }}
                                                onMouseOver={(e) => {
                                                    e.currentTarget.style.background = '#C1F0F0';
                                                    e.currentTarget.style.transform = 'translateX(2px)';
                                                }}
                                                onMouseOut={(e) => {
                                                    e.currentTarget.style.background = '#E0F7F7';
                                                    e.currentTarget.style.transform = 'translateX(0)';
                                                }}
                                            >
                                                <i data-lucide="external-link" style={{ width: '12px', height: '12px' }}></i>
                                                Open in Maps
                                            </a>
                                        );
                                    })()}
                                </div>
                            </div>
                        );
                    }

                    return null;
                })()}

                {/* Phase 4: Meeting Type Codes */}
                {meeting.types && formatMeetingTypeCodes(meeting.types) && (
                    <div style={{
                        fontSize: isMobile ? '11px' : '12px',
                        color: '#666',
                        fontStyle: 'italic',
                        marginTop: isMobile ? '6px' : '8px',
                        lineHeight: '1.4',
                        padding: isMobile ? '6px 8px' : '8px 10px',
                        background: '#f9fafb',
                        borderRadius: '4px',
                        border: '1px solid #e5e7eb'
                    }}>
                        {formatMeetingTypeCodes(meeting.types)}
                    </div>
                )}


                {/* Phase 3: Attendance Tracking (for past meetings only) */}
                {isMeetingPast(meeting) && (
                    <div style={{
                        marginTop: isMobile ? '12px' : '16px',
                        paddingTop: isMobile ? '12px' : '16px',
                        borderTop: '1px solid #e0e0e0'
                    }}>
                        {meeting.attended === true ? (
                            // Show "Attended" badge if already marked
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: isMobile ? '10px 12px' : '12px 16px',
                                background: '#d1fae5',
                                borderRadius: '8px',
                                border: '2px solid #10b981'
                            }}>
                                <i data-lucide="check-circle" style={{
                                    width: isMobile ? '18px' : '20px',
                                    height: isMobile ? '18px' : '20px',
                                    color: '#059669'
                                }}></i>
                                <span style={{
                                    fontSize: isMobile ? '13px' : '14px',
                                    fontWeight: 'bold',
                                    color: '#065f46'
                                }}>
                                    Attended
                                </span>
                                {meeting.attendedAt && (
                                    <span style={{
                                        fontSize: isMobile ? '11px' : '12px',
                                        color: '#059669',
                                        marginLeft: 'auto'
                                    }}>
                                        {getRelativeTime(meeting.attendedAt)}
                                    </span>
                                )}
                            </div>
                        ) : (
                            // Show "Mark as Attended" button if not yet marked
                            <button
                                onClick={() => handleMarkAttended(meeting.id)}
                                disabled={markingAttended[meeting.id]}
                                style={{
                                    width: '100%',
                                    padding: isMobile ? '10px 12px' : '12px 16px',
                                    background: markingAttended[meeting.id] ? '#e0e0e0' : '#14b8a6',
                                    color: markingAttended[meeting.id] ? '#999' : '#fff',
                                    border: 'none',
                                    borderRadius: '8px',
                                    fontSize: isMobile ? '13px' : '14px',
                                    fontWeight: 'bold',
                                    cursor: markingAttended[meeting.id] ? 'not-allowed' : 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px',
                                    transition: 'all 0.2s'
                                }}
                                onMouseOver={(e) => {
                                    if (!markingAttended[meeting.id]) {
                                        e.currentTarget.style.background = '#0d9488';
                                    }
                                }}
                                onMouseOut={(e) => {
                                    if (!markingAttended[meeting.id]) {
                                        e.currentTarget.style.background = '#14b8a6';
                                    }
                                }}
                            >
                                <i data-lucide="check-circle" style={{
                                    width: isMobile ? '16px' : '18px',
                                    height: isMobile ? '16px' : '18px'
                                }}></i>
                                {markingAttended[meeting.id] ? 'Marking...' : 'Mark as Attended'}
                            </button>
                        )}
                    </div>
                )}
            </div>
        );
    };

    // Render TODAY tab
    const renderTodayTab = () => {
        const todayMeetings = getTodayMeetings();

        // ✅ PHASE 1 FIX #3: Show skeleton cards instead of spinner (40% better perceived performance)
        if (loading) {
            return (
                <div style={{ padding: isMobile ? '16px' : '20px' }}>
                    {Array(10).fill(0).map((_, index) => (
                        <MeetingCardSkeleton key={`skeleton-${index}`} />
                    ))}
                </div>
            );
        }

        if (todayMeetings.length === 0) {
            return (
                <div style={{
                    textAlign: 'center',
                    padding: isMobile ? '40px 20px' : '60px 30px',
                    color: '#999'
                }}>
                    <div style={{
                        width: isMobile ? '60px' : '80px',
                        height: isMobile ? '60px' : '80px',
                        margin: '0 auto 16px',
                        background: 'rgba(20,184,166,0.1)',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <i data-lucide="calendar-x" style={{ width: isMobile ? '32px' : '40px', height: isMobile ? '32px' : '40px', color: '#14b8a6' }}></i>
                    </div>
                    <h3 style={{ fontSize: isMobile ? '16px' : '18px', color: '#666', margin: '0 0 8px' }}>No meetings today</h3>
                    <p style={{ fontSize: isMobile ? '14px' : '15px', color: '#999', margin: 0 }}>Check the UPCOMING tab or BROWSE for meetings</p>
                </div>
            );
        }

        return (
            <div style={{ padding: isMobile ? '16px' : '20px' }}>
                {todayMeetings.map(renderMeetingCard)}
            </div>
        );
    };

    // Render UPCOMING tab
    const renderUpcomingTab = () => {
        const upcomingMeetings = getUpcomingMeetings();

        return (
            <div>
                {/* Filters */}
                <div style={{
                    background: '#fff',
                    padding: isMobile ? '12px 16px' : '16px 20px',
                    borderBottom: '1px solid #e0e0e0'
                }}>
                    <div style={{
                        display: 'flex',
                        flexDirection: isMobile ? 'column' : 'row',
                        gap: isMobile ? '8px' : '12px'
                    }}>
                        {/* Time Range Filter - Phase 1: Updated options */}
                        <select
                            value={timeFilter}
                            onChange={(e) => setTimeFilter(e.target.value)}
                            style={{
                                flex: 1,
                                padding: isMobile ? '8px 10px' : '10px 12px',
                                borderRadius: '6px',
                                border: '2px solid #e0e0e0',
                                fontSize: isMobile ? '14px' : '15px',
                                fontWeight: '600',
                                color: '#333',
                                background: '#fff',
                                cursor: 'pointer'
                            }}
                        >
                            <option value="7days">Next 7 days</option>
                            <option value="14days">Next 14 days</option>
                            <option value="3months">Next 3 months</option>
                            <option value="all">All time</option>
                        </select>
                    </div>
                </div>

                {/* Meetings List */}
                {/* ✅ PHASE 1 FIX #3: Show skeleton cards instead of spinner */}
                {loading ? (
                    <div>
                        {Array(10).fill(0).map((_, index) => (
                            <MeetingCardSkeleton key={`skeleton-upcoming-${index}`} />
                        ))}
                    </div>
                ) : upcomingMeetings.length === 0 ? (
                    <div style={{
                        textAlign: 'center',
                        padding: isMobile ? '40px 20px' : '60px 30px',
                        color: '#999'
                    }}>
                        <div style={{
                            width: isMobile ? '60px' : '80px',
                            height: isMobile ? '60px' : '80px',
                            margin: '0 auto 16px',
                            background: 'rgba(20,184,166,0.1)',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <i data-lucide="calendar-range" style={{ width: isMobile ? '32px' : '40px', height: isMobile ? '32px' : '40px', color: '#14b8a6' }}></i>
                        </div>
                        <h3 style={{ fontSize: isMobile ? '16px' : '18px', color: '#666', margin: '0 0 8px' }}>No upcoming meetings</h3>
                        <p style={{ fontSize: isMobile ? '14px' : '15px', color: '#999', margin: 0 }}>Browse for AA/NA meetings or check a different time range</p>
                    </div>
                ) : (
                    <div style={{ padding: isMobile ? '16px' : '20px' }}>
                        {upcomingMeetings.map(renderMeetingCard)}
                    </div>
                )}
            </div>
        );
    };

    // Render HISTORY tab
    const renderHistoryTab = () => {
        const historyMeetings = getHistoryMeetings();

        return (
            <div>
                {/* Stats Card */}
                <div style={{
                    background: 'linear-gradient(135deg, #14b8a6, #0ea5e9)',
                    padding: isMobile ? '20px 16px' : '24px 20px',
                    color: '#fff'
                }}>
                    <h3 style={{
                        margin: '0 0 12px',
                        fontSize: isMobile ? '16px' : '18px',
                        fontWeight: 'bold'
                    }}>
                        Attendance Statistics
                    </h3>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: isMobile ? '1fr 1fr' : '1fr 1fr 1fr',
                        gap: isMobile ? '12px' : '16px'
                    }}>
                        <div style={{
                            background: 'rgba(255,255,255,0.2)',
                            borderRadius: '8px',
                            padding: isMobile ? '12px' : '16px',
                            textAlign: 'center'
                        }}>
                            <div style={{ fontSize: isMobile ? '24px' : '32px', fontWeight: 'bold' }}>{historyMeetings.length}</div>
                            <div style={{ fontSize: isMobile ? '12px' : '13px', marginTop: '4px', opacity: 0.9 }}>Total</div>
                        </div>
                        <div style={{
                            background: 'rgba(255,255,255,0.2)',
                            borderRadius: '8px',
                            padding: isMobile ? '12px' : '16px',
                            textAlign: 'center'
                        }}>
                            <div style={{ fontSize: isMobile ? '24px' : '32px', fontWeight: 'bold' }}>{historyMeetings.filter(m => m.type === 'GLRS').length}</div>
                            <div style={{ fontSize: isMobile ? '12px' : '13px', marginTop: '4px', opacity: 0.9 }}>GLRS</div>
                        </div>
                        <div style={{
                            background: 'rgba(255,255,255,0.2)',
                            borderRadius: '8px',
                            padding: isMobile ? '12px' : '16px',
                            textAlign: 'center'
                        }}>
                            <div style={{ fontSize: isMobile ? '24px' : '32px', fontWeight: 'bold' }}>{historyMeetings.filter(m => m.type === 'AA' || m.type === 'NA').length}</div>
                            <div style={{ fontSize: isMobile ? '12px' : '13px', marginTop: '4px', opacity: 0.9 }}>AA/NA</div>
                        </div>
                    </div>
                </div>

                {/* Past Meetings List */}
                {historyMeetings.length === 0 ? (
                    <div style={{
                        textAlign: 'center',
                        padding: isMobile ? '40px 20px' : '60px 30px',
                        color: '#999'
                    }}>
                        <div style={{
                            width: isMobile ? '60px' : '80px',
                            height: isMobile ? '60px' : '80px',
                            margin: '0 auto 16px',
                            background: 'rgba(20,184,166,0.1)',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <i data-lucide="history" style={{ width: isMobile ? '32px' : '40px', height: isMobile ? '32px' : '40px', color: '#14b8a6' }}></i>
                        </div>
                        <h3 style={{ fontSize: isMobile ? '16px' : '18px', color: '#666', margin: '0 0 8px' }}>No meeting history</h3>
                        <p style={{ fontSize: isMobile ? '14px' : '15px', color: '#999', margin: 0 }}>Attend meetings to see your history here</p>
                    </div>
                ) : (
                    <div style={{ padding: isMobile ? '16px' : '20px' }}>
                        {historyMeetings.map(renderMeetingCard)}
                    </div>
                )}
            </div>
        );
    };

    // ═══════════════════════════════════════════════════════════
    // MAIN RENDER
    // ═══════════════════════════════════════════════════════════

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

            {/* 4-Tab Navigation */}
            <div style={{
                background: '#fff',
                borderBottom: '2px solid #e0e0e0',
                position: 'sticky',
                top: 0,
                zIndex: 100
            }}>
                <div style={{
                    display: 'flex',
                    justifyContent: isMobile ? 'space-between' : 'center',
                    gap: isMobile ? '0' : '8px',
                    padding: isMobile ? '0' : '8px 20px'
                }}>
                    {/* TODAY Tab */}
                    <button
                        onClick={() => setActiveTab('today')}
                        style={{
                            flex: isMobile ? 1 : 'none',
                            padding: isMobile ? '14px 8px' : '12px 24px',
                            background: activeTab === 'today' ? '#14b8a6' : 'transparent',
                            color: activeTab === 'today' ? '#fff' : '#666',
                            border: 'none',
                            borderBottom: activeTab === 'today' ? '3px solid #14b8a6' : '3px solid transparent',
                            fontSize: isMobile ? '13px' : '15px',
                            fontWeight: activeTab === 'today' ? 'bold' : '600',
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '4px'
                        }}
                    >
                        <i data-lucide="calendar-days" style={{ width: isMobile ? '16px' : '18px', height: isMobile ? '16px' : '18px' }}></i>
                        <span>TODAY</span>
                    </button>

                    {/* UPCOMING Tab */}
                    <button
                        onClick={() => setActiveTab('upcoming')}
                        style={{
                            flex: isMobile ? 1 : 'none',
                            padding: isMobile ? '14px 8px' : '12px 24px',
                            background: activeTab === 'upcoming' ? '#14b8a6' : 'transparent',
                            color: activeTab === 'upcoming' ? '#fff' : '#666',
                            border: 'none',
                            borderBottom: activeTab === 'upcoming' ? '3px solid #14b8a6' : '3px solid transparent',
                            fontSize: isMobile ? '13px' : '15px',
                            fontWeight: activeTab === 'upcoming' ? 'bold' : '600',
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '4px'
                        }}
                    >
                        <i data-lucide="calendar-range" style={{ width: isMobile ? '16px' : '18px', height: isMobile ? '16px' : '18px' }}></i>
                        <span>UPCOMING</span>
                    </button>

                    {/* BROWSE Button */}
                    <button
                        onClick={() => setShowBrowser(true)}
                        style={{
                            flex: isMobile ? 1 : 'none',
                            padding: isMobile ? '14px 8px' : '12px 24px',
                            background: 'transparent',
                            color: '#0ea5e9',
                            border: 'none',
                            borderBottom: '3px solid transparent',
                            fontSize: isMobile ? '13px' : '15px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '4px'
                        }}
                    >
                        <i data-lucide="search" style={{ width: isMobile ? '16px' : '18px', height: isMobile ? '16px' : '18px' }}></i>
                        <span>BROWSE</span>
                    </button>

                    {/* HISTORY Tab */}
                    <button
                        onClick={() => setActiveTab('history')}
                        style={{
                            flex: isMobile ? 1 : 'none',
                            padding: isMobile ? '14px 8px' : '12px 24px',
                            background: activeTab === 'history' ? '#14b8a6' : 'transparent',
                            color: activeTab === 'history' ? '#fff' : '#666',
                            border: 'none',
                            borderBottom: activeTab === 'history' ? '3px solid #14b8a6' : '3px solid transparent',
                            fontSize: isMobile ? '13px' : '15px',
                            fontWeight: activeTab === 'history' ? 'bold' : '600',
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '4px'
                        }}
                    >
                        <i data-lucide="history" style={{ width: isMobile ? '16px' : '18px', height: isMobile ? '16px' : '18px' }}></i>
                        <span>HISTORY</span>
                    </button>
                </div>
            </div>

            {/* Tab Content */}
            <div style={{ background: '#f5f5f5', minHeight: 'calc(100vh - 200px)' }}>
                {activeTab === 'today' && renderTodayTab()}
                {activeTab === 'upcoming' && renderUpcomingTab()}
                {activeTab === 'history' && renderHistoryTab()}
            </div>

            {/* MeetingBrowser Modal */}
            {showBrowser && window.GLRSApp?.components?.MeetingBrowser &&
                React.createElement(window.GLRSApp.components.MeetingBrowser, {
                    onBack: () => setShowBrowser(false),
                    externalMeetings: externalMeetings,
                    getTypeName: getTypeName,
                    currentUserId: user?.uid,
                    isMobile: isMobile,
                    onAddMeeting: (newInstance) => {
                        console.log('✓ Meeting added, reloading...', newInstance);
                        setShowBrowser(false);
                        loadMeetings(); // Refresh meetings list immediately
                        if (window.showNotification) {
                            window.showNotification('Meeting added to your schedule!', 'success');
                        }
                    }
                })
            }
        </>
    );
}

// Register component globally
window.GLRSApp = window.GLRSApp || { components: {} };
window.GLRSApp.components = window.GLRSApp.components || {};
window.GLRSApp.components.MeetingsTab = MeetingsTab;

console.log('✅ MeetingsTab component loaded - Phase 3 (4-tab structure with meetings functionality)');
console.log('✅ MeetingsTab component loaded - Phase 2 (local state + direct Firebase)');
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
            {currentView === 'meetings' && (
                loading || !userData ?
                    React.createElement(LoadingSpinner, { message: 'Loading meeting data...' }) :
                    React.createElement(window.GLRSApp.components.MeetingsTab)
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
    // Phase 6: Header modals state (local to HeaderBar component)
    const [showSidebar, setShowSidebar] = useState(false);
    const [showCreatePost, setShowCreatePost] = useState(false);
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
                    {currentView === 'meetings' && (
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
                                <i data-lucide="menu" style={{width: isMobile ? '22px' : '24px', height: isMobile ? '22px' : '24px'}}></i>
                            </button>
                            <span style={{ fontSize: isMobile ? '16px' : '18px', fontWeight: '600' }}>Meetings</span>
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
                    {/* Phase 6: Create Post button - Meetings view only */}
                    {currentView === 'meetings' && (
                        <button
                            className="header-btn"
                            onClick={() => {
                                if (typeof window.GLRSApp?.utils?.triggerHaptic === 'function') {
                                    window.GLRSApp.utils.triggerHaptic('light');
                                }
                                setShowCreatePost(true);
                            }}
                            title="Create Post"
                        >
                            <i data-lucide="edit" style={{width: '18px', height: '18px'}}></i>
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
                            <i data-lucide="menu" style={{width: '24px', height: '24px', color: '#14b8a6'}}></i>
                            <h2 style={{
                                margin: 0,
                                fontSize: isMobile ? '18px' : '20px',
                                fontWeight: '700',
                                color: '#1f2937'
                            }}>
                                Menu
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

            {/* Phase 6: Create Post Modal */}
            {showCreatePost && (
                <>
                    {/* Modal Backdrop */}
                    <div
                        onClick={() => {
                            if (typeof window.GLRSApp?.utils?.triggerHaptic === 'function') {
                                window.GLRSApp.utils.triggerHaptic('light');
                            }
                            setShowCreatePost(false);
                        }}
                        style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            backgroundColor: 'rgba(0, 0, 0, 0.5)',
                            zIndex: 9998,
                            animation: 'fadeIn 0.2s ease-out',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    />

                    {/* Modal Content */}
                    <div
                        style={{
                            position: 'fixed',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            width: isMobile ? '90%' : '420px',
                            maxWidth: '500px',
                            backgroundColor: '#fff',
                            borderRadius: isMobile ? '12px' : '16px',
                            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                            zIndex: 9999,
                            animation: 'scaleIn 0.3s ease-out',
                            overflow: 'hidden'
                        }}
                    >
                        {/* Modal Header */}
                        <div style={{
                            padding: isMobile ? '20px 16px' : '24px 20px',
                            borderBottom: '1px solid #e5e7eb',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between'
                        }}>
                            <h2 style={{
                                margin: 0,
                                fontSize: isMobile ? '18px' : '20px',
                                fontWeight: '700',
                                color: '#1f2937'
                            }}>
                                Create Post
                            </h2>
                            <button
                                onClick={() => {
                                    if (typeof window.GLRSApp?.utils?.triggerHaptic === 'function') {
                                        window.GLRSApp.utils.triggerHaptic('light');
                                    }
                                    setShowCreatePost(false);
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
                                title="Close"
                            >
                                <i data-lucide="x" style={{width: '24px', height: '24px'}}></i>
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div style={{
                            padding: isMobile ? '32px 16px' : '48px 20px',
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
                                Under Construction
                            </h3>

                            <p style={{
                                fontSize: isMobile ? '14px' : '15px',
                                color: '#6b7280',
                                lineHeight: '1.6',
                                maxWidth: '320px',
                                margin: 0,
                                marginBottom: isMobile ? '24px' : '32px'
                            }}>
                                This feature is under construction. Stay tuned!
                            </p>

                            {/* Got it button */}
                            <button
                                onClick={() => {
                                    if (typeof window.GLRSApp?.utils?.triggerHaptic === 'function') {
                                        window.GLRSApp.utils.triggerHaptic('light');
                                    }
                                    setShowCreatePost(false);
                                }}
                                style={{
                                    background: '#14b8a6',
                                    color: '#fff',
                                    border: 'none',
                                    padding: isMobile ? '12px 24px' : '14px 32px',
                                    borderRadius: '8px',
                                    fontSize: isMobile ? '14px' : '15px',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    transition: 'background-color 0.2s',
                                    boxShadow: '0 2px 4px rgba(20, 184, 166, 0.2)'
                                }}
                                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#0d9488'}
                                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#14b8a6'}
                            >
                                Got it
                            </button>
                        </div>
                    </div>
                </>
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

                @keyframes scaleIn {
                    from {
                        opacity: 0;
                        transform: translate(-50%, -50%) scale(0.95);
                    }
                    to {
                        opacity: 1;
                        transform: translate(-50%, -50%) scale(1);
                    }
                }

                /* ✅ PHASE 1 FIX #3: Shimmer animation for skeleton loading cards */
                @keyframes shimmer {
                    0% {
                        background-position: 200% 0;
                    }
                    100% {
                        background-position: -200% 0;
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
// BOTTOM NAVIGATION COMPONENT
// Main app navigation bar with 6 tabs
// ✅ PHASE 7C: Converted to props-based pattern
// ═══════════════════════════════════════════════════════════

const BottomNavigation = ({
    currentView,
    onChangeView,
    unreadCount
}) => {
    return (
        <div className="bottom-nav">
            <div
                className={`nav-item ${currentView === 'tasks' ? 'active' : ''}`}
                onClick={() => {
                    if (typeof window.GLRSApp?.utils?.triggerHaptic === 'function') {
                        window.GLRSApp.utils.triggerHaptic('light');
                    }
                    if (onChangeView) onChangeView('tasks');
                }}
            >
                <i data-lucide="check-square" className="nav-icon"></i>
                <div className="nav-label">Tasks</div>
            </div>
            <div
                className={`nav-item ${currentView === 'progress' ? 'active' : ''}`}
                onClick={() => {
                    if (typeof window.GLRSApp?.utils?.triggerHaptic === 'function') {
                        window.GLRSApp.utils.triggerHaptic('light');
                    }
                    if (onChangeView) onChangeView('progress');
                }}
            >
                <i data-lucide="trending-up" className="nav-icon"></i>
                <div className="nav-label">Journey</div>
            </div>
            <div
                className={`nav-item ${currentView === 'meetings' ? 'active' : ''}`}
                onClick={() => {
                    if (typeof window.GLRSApp?.utils?.triggerHaptic === 'function') {
                        window.GLRSApp.utils.triggerHaptic('light');
                    }
                    if (onChangeView) onChangeView('meetings');
                }}
            >
                <i data-lucide="calendar" className="nav-icon"></i>
                <div className="nav-label">Meetings</div>
            </div>
            <div
                className={`nav-item ${currentView === 'connect' ? 'active' : ''}`}
                onClick={() => {
                    if (typeof window.GLRSApp?.utils?.triggerHaptic === 'function') {
                        window.GLRSApp.utils.triggerHaptic('light');
                    }
                    if (onChangeView) onChangeView('connect');
                }}
            >
                <i data-lucide="message-circle" className="nav-icon"></i>
                <div className="nav-label">Connect</div>
            </div>
            <div
                className={`nav-item ${currentView === 'guides' ? 'active' : ''}`}
                onClick={() => {
                    if (typeof window.GLRSApp?.utils?.triggerHaptic === 'function') {
                        window.GLRSApp.utils.triggerHaptic('light');
                    }
                    if (onChangeView) onChangeView('guides');
                }}
            >
                <i data-lucide="book-open" className="nav-icon"></i>
                <div className="nav-label">Guides</div>
            </div>
            <div
                className={`nav-item ${currentView === 'messages' ? 'active' : ''}`}
                onClick={() => {
                    if (typeof window.GLRSApp?.utils?.triggerHaptic === 'function') {
                        window.GLRSApp.utils.triggerHaptic('light');
                    }
                    if (onChangeView) onChangeView('messages');
                }}
                style={{ position: 'relative' }}
            >
                <i data-lucide="message-circle" className="nav-icon"></i>
                <div className="nav-label">Messages</div>
                {unreadCount > 0 && (
                    <span style={{
                        position: 'absolute',
                        top: '4px',
                        right: '8px',
                        background: '#058585',
                        color: '#fff',
                        borderRadius: '50%',
                        width: '18px',
                        height: '18px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '10px',
                        fontWeight: 'bold',
                        border: '2px solid #fff'
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

