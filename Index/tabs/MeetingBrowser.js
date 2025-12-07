/**
 * MEETING BROWSER - FULL PAGE VIEW
 *
 * Purpose: Browse and search all external AA/NA meetings (4,106 total)
 * Features:
 * - Filter by meeting type (AA, NA, All)
 * - Filter by county (5 Bay Area counties)
 * - Day of week filter
 * - Add meetings to personal schedule
 * - Full-page layout (similar to UserProfileView)
 *
 * Created: November 18, 2025 - Phase 2
 * Updated: November 18, 2025 - Changed from modal to full-page view
 */

const MeetingBrowser = ({
    onBack,
    externalMeetings,
    onAddMeeting,
    currentUserId,
    isMobile,
    // NEW: Admin context props
    isAdmin = false,           // true when running in admin portal
    currentUser = null,        // the logged-in admin/coach user object
    availablePIRs = null       // optional pre-loaded list of PIRs
}) => {
    // ==========================================
    // ADMIN CONTEXT: PIR SELECTION STATE
    // ==========================================
    const isAdminPortal = isAdmin || window.location.pathname.includes('/admin/');
    const [showPIRSelector, setShowPIRSelector] = React.useState(false);
    const [selectedPIR, setSelectedPIR] = React.useState(null);
    const [pirList, setPirList] = React.useState(availablePIRs || []);
    const [loadingPIRs, setLoadingPIRs] = React.useState(false);
    const [pirSearchQuery, setPirSearchQuery] = React.useState('');

    // ✅ PHASE 1 FIX #4: Applied filters (these trigger actual filtering)
    const [typeFilter, setTypeFilter] = React.useState('all'); // 'aa' | 'na' | 'all'
    const [countyFilter, setCountyFilter] = React.useState('all'); // 'sf' | 'eastbay' | 'santaclara' | 'santacruz' | 'sanmateo' | 'all'
    const [dayFilter, setDayFilter] = React.useState('all'); // 0-6 | 'all'
    const [formatFilter, setFormatFilter] = React.useState('all'); // NEW: Format type filter
    const [groupsFilter, setGroupsFilter] = React.useState([]); // NEW: Multi-select for demographic groups
    const [accessibilityFilter, setAccessibilityFilter] = React.useState([]); // NEW: Multi-select for accessibility
    const [languageFilter, setLanguageFilter] = React.useState('all'); // 'all' | 'en' | 'es' | 'fr'
    const [specialCategoriesFilter, setSpecialCategoriesFilter] = React.useState([]); // Renamed from specialFilters

    // ✅ PHASE 1 FIX #4: Temporary filters (batch filtering - only applied when user clicks "Apply")
    const [tempTypeFilter, setTempTypeFilter] = React.useState('all');
    const [tempCountyFilter, setTempCountyFilter] = React.useState('all');
    const [tempDayFilter, setTempDayFilter] = React.useState('all');
    const [tempFormatFilter, setTempFormatFilter] = React.useState('all');
    const [tempGroupsFilter, setTempGroupsFilter] = React.useState([]);
    const [tempAccessibilityFilter, setTempAccessibilityFilter] = React.useState([]);
    const [tempLanguageFilter, setTempLanguageFilter] = React.useState('all');
    const [tempSpecialCategoriesFilter, setTempSpecialCategoriesFilter] = React.useState([]);

    // ✅ PHASE 1 FIX #4: Filter modal state
    const [showFilterModal, setShowFilterModal] = React.useState(false);

    const [filteredResults, setFilteredResults] = React.useState([]);
    const [addingMeetingId, setAddingMeetingId] = React.useState(null);
    const [showWeekSelector, setShowWeekSelector] = React.useState(false);
    const [selectedMeetingForAdd, setSelectedMeetingForAdd] = React.useState(null);
    const [weeksToAdd, setWeeksToAdd] = React.useState(12);
    const [openPopover, setOpenPopover] = React.useState(null); // Track which popover is open: 'groups' | 'accessibility' | 'special' | null

    // ✅ PHASE 2 FIX #1: Pagination state for virtualization
    const [currentPage, setCurrentPage] = React.useState(1);
    const itemsPerPage = 20;

    // Accessibility: ARIA live announcement for filter changes
    const [ariaAnnouncement, setAriaAnnouncement] = React.useState('');

    // Phase 3: Location-based features
    const [userLocation, setUserLocation] = React.useState(null); // { lat, lng }
    const [locationPermissionStatus, setLocationPermissionStatus] = React.useState('prompt'); // 'prompt' | 'granted' | 'denied'
    const [distanceRadius, setDistanceRadius] = React.useState(null); // 5 | 10 | 25 | 50 | null (miles)
    const [loadingLocation, setLoadingLocation] = React.useState(false);

    // Phase 3: Favorites system
    const [favorites, setFavorites] = React.useState(new Set()); // Set of favorited meeting IDs
    const [showFavoritesOnly, setShowFavoritesOnly] = React.useState(false);

    // Phase 3: Search history (localStorage)
    const [searchHistory, setSearchHistory] = React.useState([]);
    const [searchQuery, setSearchQuery] = React.useState('');
    const [showSearchSuggestions, setShowSearchSuggestions] = React.useState(false);

    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    // ✅ PHASE 1 FIX #2: useDebounce hook - delays value updates by specified milliseconds
    // Prevents UI freezing when filtering 4,106 meetings on every filter change
    const useDebounce = (value, delay = 300) => {
        const [debouncedValue, setDebouncedValue] = React.useState(value);

        React.useEffect(() => {
            const timer = setTimeout(() => {
                setDebouncedValue(value);
            }, delay);

            return () => clearTimeout(timer);
        }, [value, delay]);

        return debouncedValue;
    };

    // ✅ PHASE 1 FIX #2: Create debounced versions of filter states (300ms delay)
    const debouncedTypeFilter = useDebounce(typeFilter, 300);
    const debouncedCountyFilter = useDebounce(countyFilter, 300);
    const debouncedDayFilter = useDebounce(dayFilter, 300);
    const debouncedFormatFilter = useDebounce(formatFilter, 300);
    const debouncedGroupsFilter = useDebounce(groupsFilter, 300);
    const debouncedAccessibilityFilter = useDebounce(accessibilityFilter, 300);
    const debouncedLanguageFilter = useDebounce(languageFilter, 300);
    const debouncedSpecialCategoriesFilter = useDebounce(specialCategoriesFilter, 300);

    // Close popover when clicking outside
    React.useEffect(() => {
        const handleClickOutside = (event) => {
            if (openPopover && !event.target.closest('.filter-popover-container')) {
                setOpenPopover(null);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [openPopover]);

    // ✅ FIX #5 (Phase 3): Track component mount state to prevent DOM errors during modal close
    const isMountedRef = React.useRef(true);
    React.useEffect(() => {
        isMountedRef.current = true;
        return () => {
            isMountedRef.current = false;
        };
    }, []);

    // Initialize Lucide icons after component renders (debounced to prevent DOM errors)
    React.useEffect(() => {
        const timer = setTimeout(() => {
            // ✅ FIX #5 (Phase 3): Check if mounted before manipulating DOM
            if (isMountedRef.current) {
                try {
                    if (window.lucide && typeof window.lucide.createIcons === 'function') {
                        window.lucide.createIcons();
                        console.log('✅ Lucide icons initialized (MeetingBrowser)');
                    }
                } catch (error) {
                    // ✅ FIX #5: Silently catch DOM manipulation errors during icon initialization
                    // This prevents "removeChild" errors when modal closes during icon init
                    console.warn('Icon initialization warning (safe to ignore):', error.message);
                }
            }
        }, 100); // Small delay to ensure DOM is fully settled

        return () => clearTimeout(timer);
    }, []); // ✅ FIX #3: Initialize ONCE on mount only (not on every filter change)

    // ==========================================
    // ADMIN CONTEXT: LOAD PIRs FOR SELECTION
    // ==========================================
    React.useEffect(() => {
        if (!isAdminPortal || availablePIRs) return; // Skip if not admin or PIRs pre-loaded

        const loadPIRs = async () => {
            setLoadingPIRs(true);
            try {
                // Get db reference (works in both PIR app and admin portal)
                const db = window.db || firebase.firestore();

                let query = db.collection('users').where('role', '==', 'pir');

                // If coach, filter to only their assigned PIRs
                if (currentUser?.role === 'coach' && currentUser?.uid) {
                    query = query.where('assignedCoach', '==', currentUser.uid);
                }

                const snapshot = await query.orderBy('displayName').get();
                const pirs = snapshot.docs.map(doc => ({
                    uid: doc.id,
                    ...doc.data()
                }));

                setPirList(pirs);
                console.log(`✅ Loaded ${pirs.length} PIRs for admin meeting assignment`);
            } catch (error) {
                console.error('Failed to load PIRs:', error);
                // Try without orderBy if index doesn't exist
                try {
                    const db = window.db || firebase.firestore();
                    let query = db.collection('users').where('role', '==', 'pir');
                    if (currentUser?.role === 'coach' && currentUser?.uid) {
                        query = query.where('assignedCoach', '==', currentUser.uid);
                    }
                    const snapshot = await query.get();
                    const pirs = snapshot.docs.map(doc => ({
                        uid: doc.id,
                        ...doc.data()
                    })).sort((a, b) => (a.displayName || '').localeCompare(b.displayName || ''));
                    setPirList(pirs);
                } catch (fallbackError) {
                    console.error('Fallback PIR load failed:', fallbackError);
                }
            } finally {
                setLoadingPIRs(false);
            }
        };

        loadPIRs();
    }, [isAdminPortal, currentUser, availablePIRs]);

    // Filter PIRs based on search query
    const filteredPIRs = React.useMemo(() => {
        if (!pirSearchQuery.trim()) return pirList;
        const query = pirSearchQuery.toLowerCase();
        return pirList.filter(pir =>
            (pir.displayName || '').toLowerCase().includes(query) ||
            (pir.email || '').toLowerCase().includes(query) ||
            (pir.firstName || '').toLowerCase().includes(query) ||
            (pir.lastName || '').toLowerCase().includes(query)
        );
    }, [pirList, pirSearchQuery]);

    // Code aliasing - maps duplicate/variant codes to primary codes
    const codeAliases = {
        'S': 'ES',        // Spanish
        'G': 'LGBTQ',     // Gay/Lesbian → LGBTQ
        'L': 'LGBTQ',     // Lesbian → LGBTQ
        'XB': 'X',        // Wheelchair + Bathroom → Wheelchair
        '12 STEP': '12x12', // Alternative notation
        'TWELVE STEP': '12x12'
    };

    // Normalize code using aliasing
    const normalizeCode = (code) => {
        const upperCode = String(code).toUpperCase().trim();
        return codeAliases[upperCode] || upperCode;
    };

    // Meeting type code decoder - COMPLETE 45+ CODE DEFINITIONS (TSML standard)
    const meetingTypeCodes = {
        // FORMAT TYPES (How the meeting is conducted)
        'D': 'Discussion',
        'B': 'Big Book Study',
        '12x12': '12 Steps & 12 Traditions',
        'LIT': 'Literature',
        'ST': 'Step Study',
        'SP': 'Speaker',
        'MED': 'Meditation',
        'CAN': 'Candlelight',
        'T': 'Tradition Study', // Context-dependent (could also be Transgender)
        'TR': 'Tradition Study',
        'POA': 'Format Varies',

        // MEETING ACCESS (Who can attend)
        'O': 'Open (Non-alcoholics welcome)',
        'C': 'Closed (Alcoholics only)',

        // DEMOGRAPHIC FOCUS (Target groups)
        'W': 'Women Only',
        'M': 'Men Only',
        'Y': 'Young People',
        'SEN': 'Seniors',
        'LGBTQ': 'LGBTQ+',
        'POC': 'People of Color',
        'G': 'Gay/Lesbian (LGBTQ+)', // Older code, maps to LGBTQ
        'L': 'Lesbian (LGBTQ+)', // Older code, maps to LGBTQ
        'NB': 'Non-Binary',

        // SPECIAL POPULATIONS (Specific needs)
        'BE': 'Beginners',
        'DD': 'Dual Diagnosis',
        'ABSI': 'Adult Children of Alcoholics',
        'AL-AN': 'Al-Anon Focus',
        'DB': 'Digital Basket (Venmo/PayPal)',
        'GR': 'Grapevine',
        'DR': 'Daily Reflections',
        '11': '11th Step Focus',
        'P': 'Professionals',
        'A': 'Atheist/Agnostic',
        'N': 'Native American',

        // ACCESSIBILITY FEATURES (Physical/virtual access)
        'X': 'Wheelchair Accessible',
        'XB': 'Wheelchair Accessible + Bathroom',
        'BA': 'Babysitting Available',
        'CF': 'Child-Friendly',
        'ASL': 'ASL Interpreted',
        'ONL': 'Online',
        'HY': 'Hybrid (In-person & Online)',
        'TC': 'Temporarily Closed',
        'FF': 'Fragrance Free',
        'XT': 'Cross-Talk Permitted',

        // LANGUAGE
        'EN': 'English',
        'ES': 'Spanish',
        'S': 'Spanish', // Alias for ES
        'FR': 'French',

        // Default
        'DEFAULT': 'Meeting Type'
    };

    // Get full name for meeting type code
    const getTypeName = (code) => {
        const normalizedCode = normalizeCode(code);
        return meetingTypeCodes[normalizedCode] || code;
    };

    // Convert military time to 12-hour format with AM/PM
    const formatTime = (timeStr) => {
        if (!timeStr) return 'Time not specified';

        const time = String(timeStr).toLowerCase().trim();

        // Handle special cases
        if (time.includes('noon') || time === '12:00') return '12:00 PM';
        if (time.includes('midnight')) return '12:00 AM';

        // Parse time (handles both 12:00 and 17:30 formats)
        const match = time.match(/(\d+):?(\d+)?\s*(am|pm)?/i);
        if (!match) return timeStr; // Return original if can't parse

        let hours = parseInt(match[1]);
        const minutes = match[2] ? parseInt(match[2]) : 0;
        const meridiem = match[3];

        // If already has AM/PM, just format nicely
        if (meridiem) {
            const isPM = meridiem.toLowerCase() === 'pm';
            if (isPM && hours !== 12) hours += 12;
            if (!isPM && hours === 12) hours = 0;
        }

        // Convert 24-hour to 12-hour
        const isPM = hours >= 12;
        const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
        const displayMinutes = minutes.toString().padStart(2, '0');
        const ampm = isPM ? 'PM' : 'AM';

        return `${displayHours}:${displayMinutes} ${ampm}`;
    };

    // County mapping based on city names
    const getCounty = (meeting) => {
        // Extract city from various possible locations
        let cityStr = '';

        // Try meeting.city first (direct property)
        if (meeting.city) {
            if (typeof meeting.city === 'object' && meeting.city.city) {
                cityStr = meeting.city.city;
            } else if (typeof meeting.city === 'string') {
                cityStr = meeting.city;
            }
        }

        // If not found, try meeting.address.city (nested in address object)
        if (!cityStr && meeting.address && typeof meeting.address === 'object' && meeting.address.city) {
            cityStr = meeting.address.city;
        }

        const city = String(cityStr || '').toLowerCase();

        // San Francisco / Marin
        if (city.includes('san francisco') || city.includes('marin') || city.includes('sausalito') ||
            city.includes('mill valley') || city.includes('san rafael')) {
            return 'sf';
        }

        // East Bay (Alameda/Contra Costa)
        if (city.includes('oakland') || city.includes('berkeley') || city.includes('alameda') ||
            city.includes('richmond') || city.includes('hayward') || city.includes('fremont') ||
            city.includes('concord') || city.includes('walnut creek') || city.includes('antioch')) {
            return 'eastbay';
        }

        // Santa Clara
        if (city.includes('san jose') || city.includes('santa clara') || city.includes('sunnyvale') ||
            city.includes('mountain view') || city.includes('palo alto') || city.includes('cupertino') ||
            city.includes('campbell') || city.includes('los gatos') || city.includes('milpitas')) {
            return 'santaclara';
        }

        // Santa Cruz
        if (city.includes('santa cruz') || city.includes('capitola') || city.includes('watsonville') ||
            city.includes('scotts valley') || city.includes('aptos')) {
            return 'santacruz';
        }

        // San Mateo
        if (city.includes('san mateo') || city.includes('redwood city') || city.includes('burlingame') ||
            city.includes('millbrae') || city.includes('pacifica') || city.includes('south san francisco') ||
            city.includes('daly city') || city.includes('belmont') || city.includes('san carlos')) {
            return 'sanmateo';
        }

        return 'other';
    };

    // ═══════════════════════════════════════════════════════════
    // PHASE 3: LOCATION & DISTANCE HELPERS
    // ═══════════════════════════════════════════════════════════

    // Calculate distance between two coordinates using Haversine formula (returns miles)
    const calculateDistance = (lat1, lng1, lat2, lng2) => {
        const R = 3959; // Earth radius in miles
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLng = (lng2 - lng1) * Math.PI / 180;

        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                  Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                  Math.sin(dLng/2) * Math.sin(dLng/2);

        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c; // Distance in miles
    };

    // Get user's current location with permission
    const getUserLocation = () => {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error('Geolocation not supported by this browser'));
                return;
            }

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    resolve({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    });
                },
                (error) => {
                    reject(error);
                },
                { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 } // Cache for 5 minutes
            );
        });
    };

    // Handle "Use My Location" button click
    const handleUseMyLocation = async () => {
        setLoadingLocation(true);
        try {
            const location = await getUserLocation();
            setUserLocation(location);
            setLocationPermissionStatus('granted');
            setDistanceRadius(10); // Default to 10 miles
            console.log('📍 Location obtained:', location);
        } catch (error) {
            console.error('Location error:', error);
            setLocationPermissionStatus('denied');
            alert('Unable to get your location. Please check your browser permissions.');
        } finally {
            setLoadingLocation(false);
        }
    };

    // Clear location filter
    const handleClearLocation = () => {
        setUserLocation(null);
        setDistanceRadius(null);
    };

    // ═══════════════════════════════════════════════════════════
    // PHASE 3: FAVORITES SYSTEM
    // ═══════════════════════════════════════════════════════════

    // Load user's favorites from Firestore
    React.useEffect(() => {
        if (!currentUserId) return;

        const loadFavorites = async () => {
            try {
                const db = firebase.firestore();
                const favoritesSnapshot = await db.collection('users')
                    .doc(currentUserId)
                    .collection('favorites')
                    .get();

                const favIds = new Set(favoritesSnapshot.docs.map(doc => doc.id));
                setFavorites(favIds);
            } catch (error) {
                console.error('Error loading favorites:', error);
            }
        };

        loadFavorites();
    }, [currentUserId]);

    // Toggle favorite status
    const handleToggleFavorite = async (meeting) => {
        if (!currentUserId) {
            alert('Please sign in to save favorites');
            return;
        }

        const meetingId = meeting.id;
        const isFavorited = favorites.has(meetingId);

        try {
            const db = firebase.firestore();
            const favoriteRef = db.collection('users')
                .doc(currentUserId)
                .collection('favorites')
                .doc(meetingId);

            if (isFavorited) {
                // Remove from favorites
                await favoriteRef.delete();
                setFavorites(prev => {
                    const newSet = new Set(prev);
                    newSet.delete(meetingId);
                    return newSet;
                });
            } else {
                // Add to favorites
                await favoriteRef.set({
                    meetingId: meetingId,
                    meetingName: meeting.name,
                    meetingType: meeting.type,
                    addedAt: firebase.firestore.FieldValue.serverTimestamp()
                });
                setFavorites(prev => new Set(prev).add(meetingId));
            }
        } catch (error) {
            console.error('Error toggling favorite:', error);
            alert('Failed to update favorite. Please try again.');
        }
    };

    // ═══════════════════════════════════════════════════════════
    // PHASE 3: SEARCH HISTORY (localStorage)
    // ═══════════════════════════════════════════════════════════

    // Load search history from localStorage
    React.useEffect(() => {
        const storedHistory = localStorage.getItem('meetingSearchHistory');
        if (storedHistory) {
            try {
                const history = JSON.parse(storedHistory);
                // Filter out searches older than 30 days
                const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
                const recentHistory = history.filter(item => item.timestamp > thirtyDaysAgo);
                setSearchHistory(recentHistory);
            } catch (error) {
                console.error('Error loading search history:', error);
            }
        }
    }, []);

    // Save search to history
    const handleSearch = (query) => {
        if (!query.trim()) return;

        const newHistory = [
            { query: query.trim(), timestamp: Date.now() },
            ...searchHistory.filter(item => item.query !== query.trim())
        ].slice(0, 10); // Keep only last 10 searches

        setSearchHistory(newHistory);
        localStorage.setItem('meetingSearchHistory', JSON.stringify(newHistory));
        setSearchQuery(query);
        setShowSearchSuggestions(false);
    };

    // Clear search history
    const handleClearSearchHistory = () => {
        setSearchHistory([]);
        localStorage.removeItem('meetingSearchHistory');
    };

    // Phase 3: Generate meeting recommendations based on user's favorites
    const getRecommendedMeetings = React.useMemo(() => {
        if (favorites.size === 0) return [];

        // Get favorited meetings
        const favoritedMeetings = externalMeetings.filter(m => favorites.has(m.id));
        if (favoritedMeetings.length === 0) return [];

        // Extract patterns from favorites
        const patterns = {
            types: {},
            days: {},
            timeOfDay: {}, // morning (5-11), afternoon (12-17), evening (18-23), night (0-4)
            counties: {}
        };

        favoritedMeetings.forEach(meeting => {
            // Count meeting types (AA/NA)
            patterns.types[meeting.type] = (patterns.types[meeting.type] || 0) + 1;

            // Count days
            patterns.days[meeting.day] = (patterns.days[meeting.day] || 0) + 1;

            // Count time of day
            if (meeting.time) {
                const hour = parseInt(meeting.time.split(':')[0]);
                let timeOfDay = 'night';
                if (hour >= 5 && hour < 12) timeOfDay = 'morning';
                else if (hour >= 12 && hour < 18) timeOfDay = 'afternoon';
                else if (hour >= 18) timeOfDay = 'evening';
                patterns.timeOfDay[timeOfDay] = (patterns.timeOfDay[timeOfDay] || 0) + 1;
            }

            // Count counties
            const county = getCounty(meeting);
            if (county) {
                patterns.counties[county] = (patterns.counties[county] || 0) + 1;
            }
        });

        // Score all non-favorited meetings
        const scored = externalMeetings
            .filter(m => !favorites.has(m.id)) // Exclude already favorited
            .map(meeting => {
                let score = 0;

                // Type match (high weight)
                if (patterns.types[meeting.type]) {
                    score += patterns.types[meeting.type] * 3;
                }

                // Day match (medium weight)
                if (patterns.days[meeting.day]) {
                    score += patterns.days[meeting.day] * 2;
                }

                // Time of day match (medium weight)
                if (meeting.time) {
                    const hour = parseInt(meeting.time.split(':')[0]);
                    let timeOfDay = 'night';
                    if (hour >= 5 && hour < 12) timeOfDay = 'morning';
                    else if (hour >= 12 && hour < 18) timeOfDay = 'afternoon';
                    else if (hour >= 18) timeOfDay = 'evening';

                    if (patterns.timeOfDay[timeOfDay]) {
                        score += patterns.timeOfDay[timeOfDay] * 2;
                    }
                }

                // County/location match (low weight)
                const county = getCounty(meeting);
                if (county && patterns.counties[county]) {
                    score += patterns.counties[county] * 1;
                }

                // Distance bonus (if location available)
                if (userLocation && meeting.location?.coordinates) {
                    const lat = meeting.location.coordinates._lat || meeting.location.coordinates.latitude;
                    const lng = meeting.location.coordinates._long || meeting.location.coordinates.longitude;
                    if (lat && lng) {
                        const distance = calculateDistance(userLocation.lat, userLocation.lng, lat, lng);
                        if (distance < 10) score += 3; // Close by
                        else if (distance < 25) score += 1; // Moderately close
                    }
                }

                return { ...meeting, recommendationScore: score };
            })
            .filter(m => m.recommendationScore > 0) // Only recommend meetings with some match
            .sort((a, b) => b.recommendationScore - a.recommendationScore) // Sort by score
            .slice(0, 6); // Top 6 recommendations

        return scored;
    }, [externalMeetings, favorites, userLocation]);

    // Helper function to check if meeting has a code (with aliasing support)
    const meetingHasCode = (meeting, targetCode) => {
        const typeString = String(meeting.types || '').toUpperCase();
        const types = typeString.split(',').map(t => t.trim());

        // Check both the code and its normalized version
        const normalizedTarget = normalizeCode(targetCode);
        return types.some(type => {
            const normalizedType = normalizeCode(type);
            return normalizedType === normalizedTarget || type === targetCode.toUpperCase();
        });
    };

    // Helper function to toggle checkbox in multi-select filter
    const toggleFilter = (filterArray, setFilterArray, value) => {
        if (filterArray.includes(value)) {
            setFilterArray(filterArray.filter(v => v !== value));
        } else {
            setFilterArray([...filterArray, value]);
        }
    };

    // ✅ PHASE 1 FIX #2: Apply filters with debouncing (300ms delay after user stops changing filters)
    // This prevents UI freezing when filtering 4,106 meetings
    React.useEffect(() => {
        let results = [...externalMeetings];

        // Filter by type (AA/NA) - using debounced value
        if (debouncedTypeFilter === 'aa') {
            results = results.filter(m => m.type === 'AA');
        } else if (debouncedTypeFilter === 'na') {
            results = results.filter(m => m.type === 'NA');
        }

        // Filter by county - using debounced value
        if (debouncedCountyFilter !== 'all') {
            results = results.filter(m => getCounty(m) === debouncedCountyFilter);
        }

        // Filter by day - using debounced value
        if (debouncedDayFilter !== 'all') {
            results = results.filter(m => m.day === parseInt(debouncedDayFilter));
        }

        // Filter by format (single-select) - using debounced value
        if (debouncedFormatFilter !== 'all') {
            results = results.filter(m => meetingHasCode(m, debouncedFormatFilter));
        }

        // Filter by groups (multi-select with OR logic) - using debounced value
        if (debouncedGroupsFilter.length > 0) {
            results = results.filter(m => {
                // Meeting must have ANY of the selected group codes (OR logic)
                return debouncedGroupsFilter.some(code => meetingHasCode(m, code));
            });
        }

        // Filter by accessibility (multi-select with OR logic) - using debounced value
        if (debouncedAccessibilityFilter.length > 0) {
            results = results.filter(m => {
                // Meeting must have ANY of the selected accessibility codes (OR logic)
                return debouncedAccessibilityFilter.some(code => meetingHasCode(m, code));
            });
        }

        // Filter by language (single-select) - using debounced value
        if (debouncedLanguageFilter !== 'all') {
            results = results.filter(m => meetingHasCode(m, debouncedLanguageFilter));
        }

        // Filter by special categories (multi-select with OR logic) - using debounced value
        if (debouncedSpecialCategoriesFilter.length > 0) {
            results = results.filter(m => {
                // Meeting must have ANY of the selected special category codes (OR logic)
                return debouncedSpecialCategoriesFilter.some(code => meetingHasCode(m, code));
            });
        }

        // Phase 3: Calculate distances and filter by proximity
        if (userLocation && distanceRadius) {
            // Calculate distance for each meeting
            results = results.map(meeting => {
                // Extract coordinates from location object
                const lat = meeting.location?.coordinates?._lat || meeting.location?.coordinates?.latitude;
                const lng = meeting.location?.coordinates?._long || meeting.location?.coordinates?.longitude;

                if (lat && lng) {
                    const distance = calculateDistance(userLocation.lat, userLocation.lng, lat, lng);
                    return { ...meeting, distance };
                }
                return { ...meeting, distance: null };
            });

            // Filter by distance radius
            results = results.filter(m => m.distance !== null && m.distance <= distanceRadius);

            // Sort by distance (closest first)
            results = results.sort((a, b) => (a.distance || 999) - (b.distance || 999));
        }

        // Phase 3: Filter by text search query
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            results = results.filter(m => {
                // Search in meeting name
                if (m.name && String(m.name).toLowerCase().includes(query)) return true;

                // Search in location name
                if (m.locationName && String(m.locationName).toLowerCase().includes(query)) return true;

                // Search in structured location fields
                if (m.location) {
                    if (m.location.name && String(m.location.name).toLowerCase().includes(query)) return true;
                    if (m.location.formatted && String(m.location.formatted).toLowerCase().includes(query)) return true;
                    if (m.location.city && String(m.location.city).toLowerCase().includes(query)) return true;
                    if (m.location.state && String(m.location.state).toLowerCase().includes(query)) return true;
                    if (m.location.streetName && String(m.location.streetName).toLowerCase().includes(query)) return true;
                }

                // Search in notes
                if (m.notes && String(m.notes).toLowerCase().includes(query)) return true;

                return false;
            });
        }

        // Phase 3: Filter by favorites
        if (showFavoritesOnly) {
            results = results.filter(m => favorites.has(m.id));
        }

        setFilteredResults(results);
    }, [externalMeetings, debouncedTypeFilter, debouncedCountyFilter, debouncedDayFilter, debouncedFormatFilter, debouncedGroupsFilter, debouncedAccessibilityFilter, debouncedLanguageFilter, debouncedSpecialCategoriesFilter, userLocation, distanceRadius, searchQuery, showFavoritesOnly, favorites]);

    // ✅ PHASE 1 FIX #4: Batch filtering handlers
    const handleOpenFilterModal = () => {
        // Copy applied filters to temporary filters
        setTempTypeFilter(typeFilter);
        setTempCountyFilter(countyFilter);
        setTempDayFilter(dayFilter);
        setTempFormatFilter(formatFilter);
        setTempGroupsFilter([...groupsFilter]);
        setTempAccessibilityFilter([...accessibilityFilter]);
        setTempLanguageFilter(languageFilter);
        setTempSpecialCategoriesFilter([...specialCategoriesFilter]);
        setShowFilterModal(true);
    };

    const handleApplyFilters = () => {
        // Copy temporary filters to applied filters (triggers filtering)
        setTypeFilter(tempTypeFilter);
        setCountyFilter(tempCountyFilter);
        setDayFilter(tempDayFilter);
        setFormatFilter(tempFormatFilter);
        setGroupsFilter([...tempGroupsFilter]);
        setAccessibilityFilter([...tempAccessibilityFilter]);
        setLanguageFilter(tempLanguageFilter);
        setSpecialCategoriesFilter([...tempSpecialCategoriesFilter]);
        setShowFilterModal(false);
    };

    const handleClearFilters = () => {
        // Reset temporary filters to defaults
        setTempTypeFilter('all');
        setTempCountyFilter('all');
        setTempDayFilter('all');
        setTempFormatFilter('all');
        setTempGroupsFilter([]);
        setTempAccessibilityFilter([]);
        setTempLanguageFilter('all');
        setTempSpecialCategoriesFilter([]);
    };

    const handleCancelFilters = () => {
        // Close modal without applying
        setShowFilterModal(false);
    };

    // Count active filters
    const getActiveFilterCount = () => {
        let count = 0;
        if (typeFilter !== 'all') count++;
        if (countyFilter !== 'all') count++;
        if (dayFilter !== 'all') count++;
        if (formatFilter !== 'all') count++;
        if (groupsFilter.length > 0) count++;
        if (accessibilityFilter.length > 0) count++;
        if (languageFilter !== 'all') count++;
        if (specialCategoriesFilter.length > 0) count++;
        return count;
    };

    // ✅ PHASE 2 FIX #1: Pagination logic and handlers
    const totalPages = Math.ceil(filteredResults.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, filteredResults.length);
    const paginatedResults = filteredResults.slice(startIndex, endIndex);

    const handlePreviousPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
            // Scroll to top of meeting list
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const handleNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
            // Scroll to top of meeting list
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const handleJumpToPage = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    // Reset to page 1 when filters change
    React.useEffect(() => {
        setCurrentPage(1);
    }, [debouncedTypeFilter, debouncedCountyFilter, debouncedDayFilter, debouncedFormatFilter, debouncedGroupsFilter, debouncedAccessibilityFilter, debouncedLanguageFilter, debouncedSpecialCategoriesFilter]);

    // Keyboard navigation for pagination (Left/Right arrow keys)
    React.useEffect(() => {
        const handleKeyDown = (e) => {
            // Only handle arrows if not typing in input/textarea
            if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
                if (e.key === 'ArrowLeft' && currentPage > 1) {
                    e.preventDefault();
                    handlePreviousPage();
                } else if (e.key === 'ArrowRight' && currentPage < totalPages) {
                    e.preventDefault();
                    handleNextPage();
                }
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [currentPage, totalPages]);

    // Close filter modal on Escape key
    React.useEffect(() => {
        if (!showFilterModal) return;

        const handleEscapeKey = (e) => {
            if (e.key === 'Escape') {
                e.preventDefault();
                handleCancelFilters();
            }
        };

        document.addEventListener('keydown', handleEscapeKey);
        return () => document.removeEventListener('keydown', handleEscapeKey);
    }, [showFilterModal]);

    // Announce filter results to screen readers
    React.useEffect(() => {
        const activeFilters = getActiveFilterCount();
        if (activeFilters > 0) {
            setAriaAnnouncement(`Filters applied. Showing ${filteredResults.length} of ${externalMeetings.length} meetings.`);
        } else {
            setAriaAnnouncement(`Showing all ${filteredResults.length} meetings.`);
        }
        // Clear announcement after 3 seconds to prevent it from being re-read
        const timer = setTimeout(() => setAriaAnnouncement(''), 3000);
        return () => clearTimeout(timer);
    }, [filteredResults.length, externalMeetings.length]);

    // Handle add to schedule - creates weekly instances for attendance tracking
    const handleAddToSchedule = async () => {
        if (!selectedMeetingForAdd) return;

        // ==========================================
        // ADMIN CONTEXT: Validate PIR selection
        // ==========================================
        if (isAdminPortal && !selectedPIR) {
            if (window.showNotification) {
                window.showNotification('Please select a PIR first', 'error');
            }
            return;
        }

        // Determine target user ID (selectedPIR in admin mode, currentUserId otherwise)
        const targetUserId = isAdminPortal ? selectedPIR.uid : currentUserId;
        const targetUserName = isAdminPortal ? (selectedPIR.displayName || selectedPIR.email || 'PIR') : null;

        const meeting = selectedMeetingForAdd;
        // ✅ FIX #1: Don't close modal yet - wait for save to complete
        // setShowWeekSelector(false); // REMOVED - moved to after success
        setAddingMeetingId(meeting.id);

        try {
            const now = new Date();
            const instances = [];

            // ✅ FIX #6 (Phase 4): Parse time ONCE instead of repeating for every week (30x speedup)
            let parsedHours = 0;
            let parsedMinutes = 0;

            if (meeting.time) {
                const timeStr = String(meeting.time).toLowerCase().trim();

                // Handle special keywords
                if (timeStr.includes('noon') || timeStr === '12:00') {
                    parsedHours = 12;
                    parsedMinutes = 0;
                } else if (timeStr.includes('midnight')) {
                    parsedHours = 0;
                    parsedMinutes = 0;
                } else {
                    // Match time patterns (more flexible)
                    const match = timeStr.match(/(\d+)(?::(\d+))?\s*(am|pm)?/i);
                    if (match) {
                        let hours = parseInt(match[1]);
                        const minutes = parseInt(match[2] || 0);
                        const meridiem = match[3] ? match[3].toLowerCase() : null;

                        // Determine if PM
                        let isPM = false;
                        if (meridiem === 'pm') {
                            isPM = true;
                        } else if (meridiem === 'am') {
                            isPM = false;
                        } else {
                            // No meridiem - educated guess: 12 or 1-6 are PM
                            if (hours === 12 || (hours >= 1 && hours <= 6)) {
                                isPM = true;
                            }
                        }

                        // Convert to 24-hour format
                        if (isPM && hours !== 12) hours += 12;
                        if (!isPM && hours === 12) hours = 0;

                        parsedHours = hours;
                        parsedMinutes = minutes;
                    }
                }
            }

            // Find next occurrence of this day of week
            const getNextOccurrence = (dayOfWeek, weeksFromNow = 0) => {
                const date = new Date(now);
                date.setDate(date.getDate() + (7 * weeksFromNow));
                const currentDay = date.getDay();
                const daysUntilTarget = (dayOfWeek - currentDay + 7) % 7;
                date.setDate(date.getDate() + daysUntilTarget);

                // ✅ FIX #6: Set pre-parsed time (no repeated parsing)
                date.setHours(parsedHours, parsedMinutes, 0, 0);

                return date;
            };

            // ✅ PHASE 2 FIX: Preserve map structures (no JSON.stringify!)
            const baseInstance = {
                userId: targetUserId, // Uses selectedPIR.uid in admin mode
                meetingTitle: meeting.name || 'Recovery Meeting',
                type: meeting.type,
                types: meeting.types || '',
                isVirtual: meeting.isVirtual || false,

                // ✅ NEW: Preserve venue name separately
                locationName: meeting.locationName || (meeting.location && typeof meeting.location === 'object' ? meeting.location.name : null) || '',

                // ✅ NEW: Keep location as map object (not JSON string!)
                location: meeting.location || null,

                // ✅ NEW: Keep address as map object (not JSON string!)
                address: meeting.address || null,

                // ✅ NEW: Extract GeoPoint coordinates
                coordinates: (meeting.location && typeof meeting.location === 'object' ? meeting.location.coordinates : null) || meeting.coordinates || null,

                // ✅ NEW: Extract fields for queries (fallback chain)
                city: (meeting.location && typeof meeting.location === 'object' ? meeting.location.city : null)
                   || (meeting.address && typeof meeting.address === 'object' ? meeting.address.city : null)
                   || meeting.city || '',
                state: (meeting.location && typeof meeting.location === 'object' ? meeting.location.state : null)
                    || (meeting.address && typeof meeting.address === 'object' ? meeting.address.state : null)
                    || meeting.state || '',
                zip: (meeting.location && typeof meeting.location === 'object' ? meeting.location.zipCode : null)
                  || (meeting.address && typeof meeting.address === 'object' ? meeting.address.zip : null)
                  || meeting.zip || '',
                formatted: (meeting.location && typeof meeting.location === 'object' ? meeting.location.formatted : null)
                        || (meeting.address && typeof meeting.address === 'object' ? meeting.address.formatted : null)
                        || '',

                meetingLink: meeting.conferenceUrl || meeting.conference_url || null,
                notes: meeting.notes || '',
                day: meeting.day,
                time: meeting.time || '',
                duration: 60,
                isRecurring: false,
                recurringSource: 'external',
                status: 'scheduled',
                attended: false,
                attendedAt: null,
                externalMeetingId: meeting.id,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            };

            // Create weekly instances based on user selection (1-30 weeks)
            for (let week = 0; week < weeksToAdd; week++) {
                const meetingDate = getNextOccurrence(meeting.day, week);

                // ✅ FIX #6: Clone base instance and add unique scheduledTime (fast)
                const instance = {
                    ...baseInstance,
                    scheduledTime: firebase.firestore.Timestamp.fromDate(meetingDate)
                };

                instances.push(instance);
            }

            // Batch add all instances
            const batch = db.batch();
            instances.forEach(instance => {
                const docRef = db.collection('meetings').doc();
                batch.set(docRef, instance);
            });

            // ✅ FIX #6 (Phase 4): Reduced logging (only critical messages)
            await batch.commit();

            // ✅ Success! Show notification
            if (window.showNotification) {
                const scheduleTarget = isAdminPortal && targetUserName
                    ? `${targetUserName}'s schedule`
                    : 'your schedule';
                window.showNotification(`Added ${weeksToAdd} weekly ${meeting.type} meeting instance${weeksToAdd > 1 ? 's' : ''} to ${scheduleTarget}`, 'success');
            }

            // ✅ Call parent callback to refresh meetings list
            if (onAddMeeting) {
                onAddMeeting(instances[0]); // Pass first instance
            }

            // ✅ NOW close modal and reset state (after success confirmed)
            setShowWeekSelector(false);
            setSelectedMeetingForAdd(null);
            // Reset PIR selection in admin mode
            if (isAdminPortal) {
                setSelectedPIR(null);
                setShowPIRSelector(false);
            }

        } catch (error) {
            // ✅ Show error notification to user
            if (window.showNotification) {
                window.showNotification(
                    'Failed to add meeting: ' + (error.message || 'Unknown error. Please try again.'),
                    'error'
                );
            }

            if (window.handleFirebaseError) {
                window.handleFirebaseError(error, 'MeetingBrowser.handleAddToSchedule');
            }

            // ⚠️ Modal stays open - user can retry

        } finally {
            // ✅ FIX #6 (Phase 4): Always clear loading state
            setAddingMeetingId(null);
        }
    };

    return (
        <div style={isAdminPortal ? {
            // Admin portal: Flow within container, no fixed positioning
            background: '#F0F2F5',
            minHeight: '600px',
            borderRadius: '12px',
            overflow: 'hidden'
        } : {
            // PIR app: Fixed positioning for mobile layout
            position: 'fixed',
            top: '48px',
            left: 0,
            right: 0,
            bottom: '60px',
            background: '#F0F2F5',
            overflowY: 'auto',
            zIndex: 100
        }}>
            {/* Accessibility: Live region for screen reader announcements */}
            <div
                role="status"
                aria-live="polite"
                aria-atomic="true"
                style={{
                    position: 'absolute',
                    left: '-10000px',
                    width: '1px',
                    height: '1px',
                    overflow: 'hidden'
                }}
            >
                {ariaAnnouncement}
            </div>

            {/* Header */}
            <div style={{
                background: '#FFFFFF',
                padding: isAdminPortal ? '16px 20px' : '12px 16px',
                borderBottom: '1px solid #E4E6EB',
                position: isAdminPortal ? 'relative' : 'sticky',
                top: isAdminPortal ? 'auto' : 0,
                zIndex: 10,
                borderRadius: isAdminPortal ? '12px 12px 0 0' : 0
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    {/* Back button - hidden in admin mode */}
                    {!isAdminPortal && (
                        <button
                            onClick={onBack}
                            style={{
                                background: 'transparent',
                                border: 'none',
                                cursor: 'pointer',
                                padding: '8px',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'background 0.2s',
                                visibility: 'visible',
                                opacity: 1,
                                flexShrink: 0,
                                minWidth: '40px',
                                minHeight: '40px'
                            }}
                            onMouseOver={(e) => e.currentTarget.style.background = '#F0F2F5'}
                            onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                        >
                            <i data-lucide="arrow-left" style={{ width: '24px', height: '24px', color: '#333', display: 'block' }}></i>
                        </button>
                    )}
                    <div style={{ flex: 1 }}>
                        <h2 style={{ color: '#333', margin: 0, fontSize: '20px', fontWeight: 'bold' }}>
                            Browse Recovery Meetings
                        </h2>
                        <div style={{ color: '#65676B', fontSize: '14px', marginTop: '4px' }}>
                            {filteredResults.length} meetings available
                        </div>
                    </div>
                    {/* ✅ PHASE 1 FIX #4: Filters Button */}
                    <button
                        onClick={handleOpenFilterModal}
                        aria-label={`Filters${getActiveFilterCount() > 0 ? ` (${getActiveFilterCount()} active)` : ''}`}
                        aria-haspopup="dialog"
                        aria-expanded={showFilterModal}
                        style={{
                            background: getActiveFilterCount() > 0 ? '#2196F3' : '#FFFFFF',
                            color: getActiveFilterCount() > 0 ? '#FFFFFF' : '#333',
                            border: `2px solid ${getActiveFilterCount() > 0 ? '#2196F3' : '#E0E0E0'}`,
                            borderRadius: '20px',
                            padding: '8px 16px',
                            fontSize: '14px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            flexShrink: 0,
                            transition: 'all 0.2s'
                        }}
                    >
                        <i data-lucide="filter" style={{ width: '16px', height: '16px' }}></i>
                        {isMobile ? '' : 'Filters'}
                        {getActiveFilterCount() > 0 && (
                            <span style={{
                                background: '#FFFFFF',
                                color: '#2196F3',
                                borderRadius: '10px',
                                padding: '2px 6px',
                                fontSize: '12px',
                                fontWeight: 'bold',
                                minWidth: '20px',
                                textAlign: 'center'
                            }}>
                                {getActiveFilterCount()}
                            </span>
                        )}
                    </button>
                </div>

                {/* Phase 3: Search Input with Autocomplete */}
                <div style={{
                    background: '#FFFFFF',
                    padding: '12px 16px',
                    borderBottom: '1px solid #E4E6EB',
                    position: 'relative'
                }}>
                    <div style={{ position: 'relative' }}>
                        {/* Search Input */}
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            background: '#F0F2F5',
                            borderRadius: '20px',
                            padding: '8px 12px',
                            border: showSearchSuggestions ? '2px solid #058585' : '2px solid transparent',
                            transition: 'border 0.2s'
                        }}>
                            <i data-lucide="search" style={{ width: '16px', height: '16px', color: '#65676B' }}></i>
                            <input
                                type="text"
                                placeholder="Search meetings by name, location..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onFocus={() => setShowSearchSuggestions(true)}
                                onBlur={() => {
                                    // Delay to allow clicking on suggestions
                                    setTimeout(() => setShowSearchSuggestions(false), 200);
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && searchQuery.trim()) {
                                        handleSearch(searchQuery);
                                    }
                                }}
                                style={{
                                    flex: 1,
                                    border: 'none',
                                    background: 'transparent',
                                    outline: 'none',
                                    fontSize: '14px',
                                    color: '#333'
                                }}
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => {
                                        setSearchQuery('');
                                        setShowSearchSuggestions(false);
                                    }}
                                    style={{
                                        background: 'transparent',
                                        border: 'none',
                                        cursor: 'pointer',
                                        padding: '4px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        color: '#65676B'
                                    }}
                                >
                                    <i data-lucide="x" style={{ width: '16px', height: '16px' }}></i>
                                </button>
                            )}
                        </div>

                        {/* Autocomplete Dropdown */}
                        {showSearchSuggestions && searchHistory.length > 0 && (
                            <div style={{
                                position: 'absolute',
                                top: 'calc(100% + 4px)',
                                left: 0,
                                right: 0,
                                background: '#FFFFFF',
                                borderRadius: '8px',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                                zIndex: 1000,
                                maxHeight: '300px',
                                overflowY: 'auto'
                            }}>
                                {/* Header */}
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    padding: '8px 12px',
                                    borderBottom: '1px solid #E4E6EB'
                                }}>
                                    <div style={{
                                        fontSize: '12px',
                                        fontWeight: '600',
                                        color: '#65676B',
                                        textTransform: 'uppercase'
                                    }}>
                                        Recent Searches
                                    </div>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleClearSearchHistory();
                                        }}
                                        style={{
                                            background: 'transparent',
                                            border: 'none',
                                            color: '#058585',
                                            fontSize: '12px',
                                            fontWeight: '600',
                                            cursor: 'pointer',
                                            padding: '4px'
                                        }}
                                    >
                                        Clear All
                                    </button>
                                </div>

                                {/* Search History Items */}
                                {searchHistory.map((item, index) => (
                                    <button
                                        key={index}
                                        onClick={() => {
                                            setSearchQuery(item.query);
                                            handleSearch(item.query);
                                        }}
                                        style={{
                                            width: '100%',
                                            padding: '10px 12px',
                                            background: 'transparent',
                                            border: 'none',
                                            borderBottom: index < searchHistory.length - 1 ? '1px solid #F0F2F5' : 'none',
                                            textAlign: 'left',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            transition: 'background 0.2s'
                                        }}
                                        onMouseOver={(e) => e.currentTarget.style.background = '#F0F2F5'}
                                        onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                                    >
                                        <i data-lucide="clock" style={{ width: '14px', height: '14px', color: '#65676B' }}></i>
                                        <span style={{ fontSize: '14px', color: '#333', flex: 1 }}>
                                            {item.query}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Phase 3: Location-Based Filter UI */}
                <div style={{
                    background: '#F0F2F5',
                    padding: '12px 16px',
                    borderBottom: '1px solid #E4E6EB',
                    display: 'flex',
                    flexDirection: isMobile ? 'column' : 'row',
                    gap: '12px',
                    alignItems: isMobile ? 'stretch' : 'center'
                }}>
                    {/* Use My Location Button */}
                    {!userLocation && (
                        <button
                            onClick={handleUseMyLocation}
                            disabled={loadingLocation}
                            style={{
                                background: '#FFFFFF',
                                border: '2px solid #058585',
                                color: '#058585',
                                borderRadius: '20px',
                                padding: '8px 16px',
                                fontSize: '14px',
                                fontWeight: '600',
                                cursor: loadingLocation ? 'not-allowed' : 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '6px',
                                opacity: loadingLocation ? 0.6 : 1,
                                flex: isMobile ? '1' : '0 0 auto'
                            }}
                        >
                            <i data-lucide="map-pin" style={{ width: '16px', height: '16px' }}></i>
                            {loadingLocation ? 'Getting Location...' : 'Use My Location'}
                        </button>
                    )}

                    {/* Distance Radius Selector */}
                    {userLocation && (
                        <>
                            <div style={{
                                display: 'flex',
                                gap: '8px',
                                flexWrap: 'wrap',
                                flex: 1
                            }}>
                                <span style={{ fontSize: '14px', color: '#666', alignSelf: 'center', fontWeight: '600' }}>Within:</span>
                                {[5, 10, 25, 50].map(radius => (
                                    <button
                                        key={radius}
                                        onClick={() => setDistanceRadius(radius)}
                                        style={{
                                            background: distanceRadius === radius ? '#058585' : '#FFFFFF',
                                            color: distanceRadius === radius ? '#FFFFFF' : '#333',
                                            border: `2px solid ${distanceRadius === radius ? '#058585' : '#E0E0E0'}`,
                                            borderRadius: '16px',
                                            padding: '6px 12px',
                                            fontSize: '14px',
                                            fontWeight: '600',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        {radius} mi
                                    </button>
                                ))}
                            </div>

                            {/* Clear Location Button */}
                            <button
                                onClick={handleClearLocation}
                                style={{
                                    background: 'transparent',
                                    border: 'none',
                                    color: '#666',
                                    fontSize: '14px',
                                    cursor: 'pointer',
                                    padding: '6px 12px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px'
                                }}
                            >
                                <i data-lucide="x" style={{ width: '16px', height: '16px' }}></i>
                                Clear
                            </button>
                        </>
                    )}

                    {/* Phase 3: Favorites Toggle */}
                    {favorites.size > 0 && (
                        <button
                            onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                            aria-label={showFavoritesOnly ? 'Show all meetings' : 'Show only favorite meetings'}
                            aria-pressed={showFavoritesOnly}
                            style={{
                                background: showFavoritesOnly ? '#FFB300' : '#FFFFFF',
                                color: showFavoritesOnly ? '#FFFFFF' : '#FFB300',
                                border: `2px solid #FFB300`,
                                borderRadius: '20px',
                                padding: '8px 16px',
                                fontSize: '14px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '6px',
                                transition: 'all 0.2s',
                                flex: isMobile ? '1' : '0 0 auto'
                            }}
                            onMouseOver={(e) => {
                                if (!showFavoritesOnly) {
                                    e.currentTarget.style.background = '#FFF8E1';
                                }
                            }}
                            onMouseOut={(e) => {
                                if (!showFavoritesOnly) {
                                    e.currentTarget.style.background = '#FFFFFF';
                                }
                            }}
                        >
                            <i data-lucide="star" style={{
                                width: '16px',
                                height: '16px',
                                fill: showFavoritesOnly ? '#FFFFFF' : '#FFB300',
                                stroke: showFavoritesOnly ? '#FFFFFF' : '#FFB300'
                            }}></i>
                            {showFavoritesOnly ? `Favorites (${favorites.size})` : 'My Favorites'}
                        </button>
                    )}
                </div>

                {/* ✅ PHASE 1 FIX #4: Active Filter Chips */}
                {getActiveFilterCount() > 0 && (
                    <div style={{
                        display: 'flex',
                        gap: '6px',
                        flexWrap: 'nowrap',
                        overflowX: 'auto',
                        WebkitOverflowScrolling: 'touch',
                        paddingBottom: '8px',
                        marginTop: '8px'
                    }}>
                        {typeFilter !== 'all' && (
                            <div style={{
                                background: '#2196F3',
                                color: '#FFFFFF',
                                borderRadius: '16px',
                                padding: '6px 12px',
                                fontSize: '13px',
                                fontWeight: '600',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                flexShrink: 0
                            }}>
                                {typeFilter.toUpperCase()}
                                <button
                                    onClick={() => setTypeFilter('all')}
                                    style={{
                                        background: 'transparent',
                                        border: 'none',
                                        color: '#FFFFFF',
                                        cursor: 'pointer',
                                        padding: '2px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        fontSize: '16px',
                                        lineHeight: 1
                                    }}
                                >
                                    ✕
                                </button>
                            </div>
                        )}
                        {countyFilter !== 'all' && (
                            <div style={{
                                background: '#2196F3',
                                color: '#FFFFFF',
                                borderRadius: '16px',
                                padding: '6px 12px',
                                fontSize: '13px',
                                fontWeight: '600',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                flexShrink: 0
                            }}>
                                {countyFilter === 'sf' ? 'San Francisco' :
                                 countyFilter === 'eastbay' ? 'East Bay' :
                                 countyFilter === 'santaclara' ? 'Santa Clara' :
                                 countyFilter === 'santacruz' ? 'Santa Cruz' :
                                 countyFilter === 'sanmateo' ? 'San Mateo' : countyFilter}
                                <button
                                    onClick={() => setCountyFilter('all')}
                                    style={{
                                        background: 'transparent',
                                        border: 'none',
                                        color: '#FFFFFF',
                                        cursor: 'pointer',
                                        padding: '2px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        fontSize: '16px',
                                        lineHeight: 1
                                    }}
                                >
                                    ✕
                                </button>
                            </div>
                        )}
                        {dayFilter !== 'all' && (
                            <div style={{
                                background: '#2196F3',
                                color: '#FFFFFF',
                                borderRadius: '16px',
                                padding: '6px 12px',
                                fontSize: '13px',
                                fontWeight: '600',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                flexShrink: 0
                            }}>
                                {days[parseInt(dayFilter)]}
                                <button
                                    onClick={() => setDayFilter('all')}
                                    style={{
                                        background: 'transparent',
                                        border: 'none',
                                        color: '#FFFFFF',
                                        cursor: 'pointer',
                                        padding: '2px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        fontSize: '16px',
                                        lineHeight: 1
                                    }}
                                >
                                    ✕
                                </button>
                            </div>
                        )}
                        {formatFilter !== 'all' && (
                            <div style={{
                                background: '#2196F3',
                                color: '#FFFFFF',
                                borderRadius: '16px',
                                padding: '6px 12px',
                                fontSize: '13px',
                                fontWeight: '600',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                flexShrink: 0
                            }}>
                                {formatFilter}
                                <button
                                    onClick={() => setFormatFilter('all')}
                                    style={{
                                        background: 'transparent',
                                        border: 'none',
                                        color: '#FFFFFF',
                                        cursor: 'pointer',
                                        padding: '2px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        fontSize: '16px',
                                        lineHeight: 1
                                    }}
                                >
                                    ✕
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* Filters - Uniform buttons with popovers */}
                <div style={{
                    display: 'flex',
                    gap: '8px',
                    flexWrap: isMobile ? 'nowrap' : 'wrap',
                    alignItems: 'center',
                    overflowX: isMobile ? 'auto' : 'visible',
                    paddingBottom: isMobile ? '4px' : '0',
                    WebkitOverflowScrolling: 'touch'
                }}>
                    {/* Common button styles */}
                    {(() => {
                        const buttonStyle = {
                            padding: '8px 12px',
                            borderRadius: '6px',
                            border: '2px solid #E0E0E0',
                            fontSize: '13px',
                            fontWeight: '600',
                            color: '#333',
                            background: '#FFFFFF',
                            cursor: 'pointer',
                            outline: 'none',
                            minWidth: '120px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: '8px'
                        };

                        const popoverStyle = {
                            position: 'absolute',
                            top: 'calc(100% + 4px)',
                            left: isMobile ? '-50px' : 0,
                            background: '#FFFFFF',
                            border: '2px solid #E0E0E0',
                            borderRadius: '8px',
                            padding: '12px',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                            zIndex: 1000,
                            width: isMobile ? 'calc(100vw - 40px)' : 'auto',
                            minWidth: isMobile ? 'unset' : '220px',
                            maxWidth: isMobile ? '335px' : 'none',
                            maxHeight: '320px',
                            overflowY: 'auto'
                        };

                        const checkboxLabelStyle = {
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '6px 0',
                            cursor: 'pointer',
                            fontSize: '13px',
                            color: '#333'
                        };

                        return null; // This is just for defining styles
                    })()}

                    {/* 1. Type Filter */}
                    <select
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value)}
                        style={{
                            padding: '8px 12px',
                            borderRadius: '6px',
                            border: '2px solid #E0E0E0',
                            fontSize: '13px',
                            fontWeight: '600',
                            color: '#333',
                            background: '#FFFFFF',
                            cursor: 'pointer',
                            outline: 'none',
                            minWidth: isMobile ? '100px' : '120px',
                            flexShrink: isMobile ? 0 : 1
                        }}
                    >
                        <option value="all">All ({externalMeetings.length})</option>
                        <option value="aa">AA ({externalMeetings.filter(m => m.type === 'AA').length})</option>
                        <option value="na">NA ({externalMeetings.filter(m => m.type === 'NA').length})</option>
                    </select>

                    {/* 2. County Filter */}
                    <select
                        value={countyFilter}
                        onChange={(e) => setCountyFilter(e.target.value)}
                        style={{
                            padding: '8px 12px',
                            borderRadius: '6px',
                            border: '2px solid #E0E0E0',
                            fontSize: '13px',
                            fontWeight: '600',
                            color: '#333',
                            background: '#FFFFFF',
                            cursor: 'pointer',
                            outline: 'none',
                            minWidth: isMobile ? '100px' : '120px',
                            flexShrink: isMobile ? 0 : 1
                        }}
                    >
                        <option value="all">All Counties</option>
                        <option value="sf">SF/Marin</option>
                        <option value="eastbay">East Bay</option>
                        <option value="santaclara">Santa Clara</option>
                        <option value="santacruz">Santa Cruz</option>
                        <option value="sanmateo">San Mateo</option>
                    </select>

                    {/* 3. Day Filter */}
                    <select
                        value={dayFilter}
                        onChange={(e) => setDayFilter(e.target.value)}
                        style={{
                            padding: '8px 12px',
                            borderRadius: '6px',
                            border: '2px solid #E0E0E0',
                            fontSize: '13px',
                            fontWeight: '600',
                            color: '#333',
                            background: '#FFFFFF',
                            cursor: 'pointer',
                            outline: 'none',
                            minWidth: isMobile ? '100px' : '120px',
                            flexShrink: isMobile ? 0 : 1
                        }}
                    >
                        <option value="all">All Days</option>
                        {days.map((day, index) => (
                            <option key={index} value={index.toString()}>{day}</option>
                        ))}
                    </select>

                    {/* 4. Format Filter */}
                    <select
                        value={formatFilter}
                        onChange={(e) => setFormatFilter(e.target.value)}
                        style={{
                            padding: '8px 12px',
                            borderRadius: '6px',
                            border: '2px solid #E0E0E0',
                            fontSize: '13px',
                            fontWeight: '600',
                            color: '#333',
                            background: '#FFFFFF',
                            cursor: 'pointer',
                            outline: 'none',
                            minWidth: isMobile ? '100px' : '120px',
                            flexShrink: isMobile ? 0 : 1
                        }}
                    >
                        <option value="all">All Formats</option>
                        <option value="D">Discussion</option>
                        <option value="O">Open</option>
                        <option value="C">Closed</option>
                        <option value="B">Big Book</option>
                        <option value="12x12">12 & 12</option>
                        <option value="LIT">Literature</option>
                        <option value="ST">Step Study</option>
                        <option value="SP">Speaker</option>
                        <option value="TR">Tradition</option>
                        <option value="MED">Meditation</option>
                    </select>

                    {/* 5. Groups Filter (Popover with Checkboxes) */}
                    <div className="filter-popover-container" style={{ position: 'relative' }}>
                        <button
                            onClick={() => setOpenPopover(openPopover === 'groups' ? null : 'groups')}
                            style={{
                                padding: '8px 12px',
                                borderRadius: '6px',
                                border: '2px solid #E0E0E0',
                                fontSize: '13px',
                                fontWeight: '600',
                                color: '#333',
                                background: '#FFFFFF',
                                cursor: 'pointer',
                                outline: 'none',
                                minWidth: isMobile ? '100px' : '120px',
                                flexShrink: isMobile ? 0 : 1,
                                whiteSpace: 'nowrap',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                gap: '8px'
                            }}
                        >
                            <span>Groups: {groupsFilter.length > 0 ? groupsFilter.length : 'None'}</span>
                            <i data-lucide="chevron-down" style={{ width: '14px', height: '14px' }}></i>
                        </button>

                        {openPopover === 'groups' && (
                            <div style={{
                                position: 'absolute',
                                top: 'calc(100% + 4px)',
                                left: isMobile ? '-50px' : 0,
                                background: '#FFFFFF',
                                border: '2px solid #E0E0E0',
                                borderRadius: '8px',
                                padding: '12px',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                                zIndex: 1000,
                                width: isMobile ? 'calc(100vw - 40px)' : 'auto',
                                minWidth: isMobile ? 'unset' : '220px',
                                maxWidth: isMobile ? '335px' : 'none',
                                maxHeight: '320px',
                                overflowY: 'auto'
                            }}>
                                <div style={{ marginBottom: '8px', paddingBottom: '8px', borderBottom: '1px solid #E0E0E0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#65676B' }}>SELECT GROUPS</span>
                                    {groupsFilter.length > 0 && (
                                        <button
                                            onClick={() => setGroupsFilter([])}
                                            style={{
                                                fontSize: '11px',
                                                color: '#E53935',
                                                background: 'none',
                                                border: 'none',
                                                cursor: 'pointer',
                                                fontWeight: '600'
                                            }}
                                        >
                                            Clear All
                                        </button>
                                    )}
                                </div>
                                {[
                                    { value: 'LGBTQ', label: 'LGBTQ+' },
                                    { value: 'Y', label: 'Young People' },
                                    { value: 'SEN', label: 'Seniors' },
                                    { value: 'POC', label: 'People of Color' },
                                    { value: 'W', label: 'Women' },
                                    { value: 'M', label: 'Men' },
                                    { value: 'P', label: 'Professionals' },
                                    { value: 'BE', label: 'Beginners' },
                                    { value: 'N', label: 'Native American' },
                                    { value: 'A', label: 'Atheist/Agnostic' }
                                ].map(option => (
                                    <label key={option.value} style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        padding: '6px 0',
                                        cursor: 'pointer',
                                        fontSize: '13px',
                                        color: '#333'
                                    }}>
                                        <input
                                            type="checkbox"
                                            checked={groupsFilter.includes(option.value)}
                                            onChange={() => toggleFilter(groupsFilter, setGroupsFilter, option.value)}
                                            style={{ cursor: 'pointer' }}
                                        />
                                        {option.label}
                                    </label>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* 6. Accessibility Filter (Popover with Checkboxes) */}
                    <div className="filter-popover-container" style={{ position: 'relative' }}>
                        <button
                            onClick={() => setOpenPopover(openPopover === 'accessibility' ? null : 'accessibility')}
                            style={{
                                padding: '8px 12px',
                                borderRadius: '6px',
                                border: '2px solid #E0E0E0',
                                fontSize: '13px',
                                fontWeight: '600',
                                color: '#333',
                                background: '#FFFFFF',
                                cursor: 'pointer',
                                outline: 'none',
                                minWidth: isMobile ? '100px' : '120px',
                                flexShrink: isMobile ? 0 : 1,
                                whiteSpace: 'nowrap',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                gap: '8px'
                            }}
                        >
                            <span>Access: {accessibilityFilter.length > 0 ? accessibilityFilter.length : 'None'}</span>
                            <i data-lucide="chevron-down" style={{ width: '14px', height: '14px' }}></i>
                        </button>

                        {openPopover === 'accessibility' && (
                            <div style={{
                                position: 'absolute',
                                top: 'calc(100% + 4px)',
                                left: isMobile ? '-50px' : 0,
                                background: '#FFFFFF',
                                border: '2px solid #E0E0E0',
                                borderRadius: '8px',
                                padding: '12px',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                                zIndex: 1000,
                                width: isMobile ? 'calc(100vw - 40px)' : 'auto',
                                minWidth: isMobile ? 'unset' : '220px',
                                maxWidth: isMobile ? '335px' : 'none',
                                maxHeight: '320px',
                                overflowY: 'auto'
                            }}>
                                <div style={{ marginBottom: '8px', paddingBottom: '8px', borderBottom: '1px solid #E0E0E0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#65676B' }}>SELECT ACCESSIBILITY</span>
                                    {accessibilityFilter.length > 0 && (
                                        <button
                                            onClick={() => setAccessibilityFilter([])}
                                            style={{
                                                fontSize: '11px',
                                                color: '#E53935',
                                                background: 'none',
                                                border: 'none',
                                                cursor: 'pointer',
                                                fontWeight: '600'
                                            }}
                                        >
                                            Clear All
                                        </button>
                                    )}
                                </div>
                                {[
                                    { value: 'ONL', label: 'Online' },
                                    { value: 'HY', label: 'Hybrid' },
                                    { value: 'X', label: 'Wheelchair' },
                                    { value: 'CF', label: 'Child-Friendly' },
                                    { value: 'BA', label: 'Babysitting' },
                                    { value: 'ASL', label: 'ASL' },
                                    { value: 'FF', label: 'Fragrance Free' }
                                ].map(option => (
                                    <label key={option.value} style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        padding: '6px 0',
                                        cursor: 'pointer',
                                        fontSize: '13px',
                                        color: '#333'
                                    }}>
                                        <input
                                            type="checkbox"
                                            checked={accessibilityFilter.includes(option.value)}
                                            onChange={() => toggleFilter(accessibilityFilter, setAccessibilityFilter, option.value)}
                                            style={{ cursor: 'pointer' }}
                                        />
                                        {option.label}
                                    </label>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* 7. Language Filter */}
                    <select
                        value={languageFilter}
                        onChange={(e) => setLanguageFilter(e.target.value)}
                        style={{
                            padding: '8px 12px',
                            borderRadius: '6px',
                            border: '2px solid #E0E0E0',
                            fontSize: '13px',
                            fontWeight: '600',
                            color: '#333',
                            background: '#FFFFFF',
                            cursor: 'pointer',
                            outline: 'none',
                            minWidth: isMobile ? '100px' : '120px',
                            flexShrink: isMobile ? 0 : 1
                        }}
                    >
                        <option value="all">All Languages</option>
                        <option value="EN">English</option>
                        <option value="ES">Spanish</option>
                        <option value="FR">French</option>
                    </select>

                    {/* 8. Special Categories Filter (Popover with Checkboxes) */}
                    <div className="filter-popover-container" style={{ position: 'relative' }}>
                        <button
                            onClick={() => setOpenPopover(openPopover === 'special' ? null : 'special')}
                            style={{
                                padding: '8px 12px',
                                borderRadius: '6px',
                                border: '2px solid #E0E0E0',
                                fontSize: '13px',
                                fontWeight: '600',
                                color: '#333',
                                background: '#FFFFFF',
                                cursor: 'pointer',
                                outline: 'none',
                                minWidth: isMobile ? '100px' : '120px',
                                flexShrink: isMobile ? 0 : 1,
                                whiteSpace: 'nowrap',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                gap: '8px'
                            }}
                        >
                            <span>Special: {specialCategoriesFilter.length > 0 ? specialCategoriesFilter.length : 'None'}</span>
                            <i data-lucide="chevron-down" style={{ width: '14px', height: '14px' }}></i>
                        </button>

                        {openPopover === 'special' && (
                            <div style={{
                                position: 'absolute',
                                top: 'calc(100% + 4px)',
                                left: isMobile ? '-50px' : 0,
                                background: '#FFFFFF',
                                border: '2px solid #E0E0E0',
                                borderRadius: '8px',
                                padding: '12px',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                                zIndex: 1000,
                                width: isMobile ? 'calc(100vw - 40px)' : 'auto',
                                minWidth: isMobile ? 'unset' : '220px',
                                maxWidth: isMobile ? '335px' : 'none',
                                maxHeight: '320px',
                                overflowY: 'auto'
                            }}>
                                <div style={{ marginBottom: '8px', paddingBottom: '8px', borderBottom: '1px solid #E0E0E0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#65676B' }}>SELECT SPECIAL</span>
                                    {specialCategoriesFilter.length > 0 && (
                                        <button
                                            onClick={() => setSpecialCategoriesFilter([])}
                                            style={{
                                                fontSize: '11px',
                                                color: '#E53935',
                                                background: 'none',
                                                border: 'none',
                                                cursor: 'pointer',
                                                fontWeight: '600'
                                            }}
                                        >
                                            Clear All
                                        </button>
                                    )}
                                </div>
                                {[
                                    { value: 'DD', label: 'Dual Diagnosis' },
                                    { value: 'ABSI', label: 'Adult Children' },
                                    { value: '11', label: '11th Step' },
                                    { value: 'GR', label: 'Grapevine' },
                                    { value: 'DR', label: 'Daily Reflections' },
                                    { value: 'XT', label: 'Cross-Talk' },
                                    { value: 'DB', label: 'Digital Basket' }
                                ].map(option => (
                                    <label key={option.value} style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        padding: '6px 0',
                                        cursor: 'pointer',
                                        fontSize: '13px',
                                        color: '#333'
                                    }}>
                                        <input
                                            type="checkbox"
                                            checked={specialCategoriesFilter.includes(option.value)}
                                            onChange={() => toggleFilter(specialCategoriesFilter, setSpecialCategoriesFilter, option.value)}
                                            style={{ cursor: 'pointer' }}
                                        />
                                        {option.label}
                                    </label>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Clear All Filters Button */}
                    {(typeFilter !== 'all' || countyFilter !== 'all' || dayFilter !== 'all' ||
                      formatFilter !== 'all' || languageFilter !== 'all' ||
                      groupsFilter.length > 0 || accessibilityFilter.length > 0 || specialCategoriesFilter.length > 0) && (
                        <button
                            onClick={() => {
                                setTypeFilter('all');
                                setCountyFilter('all');
                                setDayFilter('all');
                                setFormatFilter('all');
                                setGroupsFilter([]);
                                setAccessibilityFilter([]);
                                setLanguageFilter('all');
                                setSpecialCategoriesFilter([]);
                            }}
                            style={{
                                padding: '8px 16px',
                                borderRadius: '6px',
                                border: 'none',
                                fontSize: '13px',
                                fontWeight: '600',
                                color: '#FFFFFF',
                                background: '#E53935',
                                cursor: 'pointer',
                                outline: 'none',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px'
                            }}
                        >
                            <i data-lucide="x" style={{ width: '14px', height: '14px' }}></i>
                            Clear All
                        </button>
                    )}
                </div>
            </div>

            {/* Meeting List */}
            <div style={{ padding: '12px' }}>
                {/* ✅ PHASE 2 FIX #1: Pagination Counter */}
                {filteredResults.length > 0 && (
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: '16px',
                        padding: isMobile ? '12px' : '16px',
                        background: '#F0F2F5',
                        borderRadius: '8px',
                        gap: '12px',
                        flexWrap: 'wrap'
                    }}>
                        <div style={{
                            fontSize: '14px',
                            fontWeight: '600',
                            color: '#333',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                        }}>
                            <i data-lucide="list" style={{ width: '16px', height: '16px', color: '#058585' }}></i>
                            Showing {startIndex + 1}-{endIndex} of {filteredResults.length} meeting{filteredResults.length !== 1 ? 's' : ''}
                        </div>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}>
                            {/* ✅ PHASE 2 FIX #4: Accessible pagination with ARIA & keyboard support */}
                            <button
                                onClick={handlePreviousPage}
                                disabled={currentPage === 1}
                                aria-label="Go to previous page"
                                aria-disabled={currentPage === 1}
                                tabIndex={0}
                                onKeyDown={(e) => {
                                    if ((e.key === 'Enter' || e.key === ' ') && currentPage !== 1) {
                                        e.preventDefault();
                                        handlePreviousPage();
                                    }
                                }}
                                style={{
                                    padding: isMobile ? '8px 12px' : '8px 16px',
                                    background: currentPage === 1 ? '#E0E0E0' : '#FFFFFF',
                                    color: currentPage === 1 ? '#9E9E9E' : '#058585',
                                    border: `2px solid ${currentPage === 1 ? '#E0E0E0' : '#058585'}`,
                                    borderRadius: '8px',
                                    fontSize: '13px',
                                    fontWeight: '600',
                                    cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    transition: 'all 0.2s',
                                    outline: 'none'
                                }}
                                onFocus={(e) => {
                                    if (currentPage !== 1) {
                                        e.currentTarget.style.boxShadow = '0 0 0 3px rgba(24, 119, 242, 0.3)';
                                        e.currentTarget.style.borderColor = '#1877F2';
                                    }
                                }}
                                onBlur={(e) => {
                                    e.currentTarget.style.boxShadow = 'none';
                                    e.currentTarget.style.borderColor = currentPage === 1 ? '#E0E0E0' : '#058585';
                                }}
                                onMouseOver={(e) => {
                                    if (currentPage !== 1) {
                                        e.currentTarget.style.background = '#058585';
                                        e.currentTarget.style.color = '#FFFFFF';
                                    }
                                }}
                                onMouseOut={(e) => {
                                    if (currentPage !== 1) {
                                        e.currentTarget.style.background = '#FFFFFF';
                                        e.currentTarget.style.color = '#058585';
                                    }
                                }}
                            >
                                <i data-lucide="chevron-left" style={{ width: '14px', height: '14px' }}></i>
                                {!isMobile && 'Previous'}
                            </button>
                            <div
                                role="status"
                                aria-live="polite"
                                aria-label={`Page ${currentPage} of ${totalPages}`}
                                style={{
                                    padding: '8px 12px',
                                    background: '#058585',
                                    color: '#FFFFFF',
                                    borderRadius: '8px',
                                    fontSize: '13px',
                                    fontWeight: 'bold',
                                    minWidth: isMobile ? '50px' : '70px',
                                    textAlign: 'center'
                                }}
                            >
                                {currentPage} / {totalPages}
                            </div>
                            <button
                                onClick={handleNextPage}
                                disabled={currentPage === totalPages}
                                aria-label="Go to next page"
                                aria-disabled={currentPage === totalPages}
                                tabIndex={0}
                                onKeyDown={(e) => {
                                    if ((e.key === 'Enter' || e.key === ' ') && currentPage !== totalPages) {
                                        e.preventDefault();
                                        handleNextPage();
                                    }
                                }}
                                style={{
                                    padding: isMobile ? '8px 12px' : '8px 16px',
                                    background: currentPage === totalPages ? '#E0E0E0' : '#FFFFFF',
                                    color: currentPage === totalPages ? '#9E9E9E' : '#058585',
                                    border: `2px solid ${currentPage === totalPages ? '#E0E0E0' : '#058585'}`,
                                    borderRadius: '8px',
                                    fontSize: '13px',
                                    fontWeight: '600',
                                    cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    transition: 'all 0.2s',
                                    outline: 'none'
                                }}
                                onFocus={(e) => {
                                    if (currentPage !== totalPages) {
                                        e.currentTarget.style.boxShadow = '0 0 0 3px rgba(24, 119, 242, 0.3)';
                                        e.currentTarget.style.borderColor = '#1877F2';
                                    }
                                }}
                                onBlur={(e) => {
                                    e.currentTarget.style.boxShadow = 'none';
                                    e.currentTarget.style.borderColor = currentPage === totalPages ? '#E0E0E0' : '#058585';
                                }}
                                onMouseOver={(e) => {
                                    if (currentPage !== totalPages) {
                                        e.currentTarget.style.background = '#058585';
                                        e.currentTarget.style.color = '#FFFFFF';
                                    }
                                }}
                                onMouseOut={(e) => {
                                    if (currentPage !== totalPages) {
                                        e.currentTarget.style.background = '#FFFFFF';
                                        e.currentTarget.style.color = '#058585';
                                    }
                                }}
                            >
                                {!isMobile && 'Next'}
                                <i data-lucide="chevron-right" style={{ width: '14px', height: '14px' }}></i>
                            </button>
                        </div>
                    </div>
                )}

                {/* Phase 3: Recommended Meetings Section */}
                {getRecommendedMeetings.length > 0 && !showFavoritesOnly && !searchQuery.trim() && (
                    <div style={{
                        background: '#F0F2F5',
                        padding: '16px',
                        margin: '0 -16px',
                        marginBottom: '12px'
                    }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            marginBottom: '12px'
                        }}>
                            <i data-lucide="sparkles" style={{ width: '18px', height: '18px', color: '#FFB300' }}></i>
                            <h3 style={{
                                margin: 0,
                                fontSize: '16px',
                                fontWeight: 'bold',
                                color: '#333'
                            }}>
                                Recommended for You
                            </h3>
                            <div style={{
                                padding: '2px 8px',
                                background: '#FFB300',
                                color: '#FFFFFF',
                                borderRadius: '10px',
                                fontSize: '11px',
                                fontWeight: '600'
                            }}>
                                {getRecommendedMeetings.length}
                            </div>
                        </div>
                        <div style={{
                            fontSize: '12px',
                            color: '#65676B',
                            marginBottom: '12px'
                        }}>
                            Based on your {favorites.size} favorite{favorites.size !== 1 ? 's' : ''}
                        </div>

                        {/* Horizontal Scrollable Carousel */}
                        <div style={{
                            display: 'flex',
                            gap: '12px',
                            overflowX: 'auto',
                            paddingBottom: '8px',
                            scrollSnapType: 'x mandatory',
                            WebkitOverflowScrolling: 'touch'
                        }}>
                            {getRecommendedMeetings.map((meeting) => (
                                <div key={meeting.id} style={{
                                    background: '#FFFFFF',
                                    borderRadius: '8px',
                                    padding: '12px',
                                    minWidth: isMobile ? '280px' : '320px',
                                    maxWidth: isMobile ? '280px' : '320px',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                                    scrollSnapAlign: 'start',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '10px',
                                    border: '2px solid #FFB300'
                                }}>
                                    {/* Header with badges */}
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'flex-start',
                                        gap: '8px'
                                    }}>
                                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                            <span style={{
                                                padding: '4px 8px',
                                                borderRadius: '10px',
                                                fontSize: '11px',
                                                fontWeight: '700',
                                                background: meeting.type === 'AA' ? '#E7F3FF' : '#E8F5E9',
                                                color: meeting.type === 'AA' ? '#1877F2' : '#43A047'
                                            }}>
                                                {meeting.type}
                                            </span>
                                            <span style={{
                                                padding: '4px 8px',
                                                borderRadius: '10px',
                                                fontSize: '10px',
                                                fontWeight: '600',
                                                background: '#F0F2F5',
                                                color: '#65676B'
                                            }}>
                                                {days[meeting.day]}
                                            </span>
                                        </div>

                                        {/* Favorite button */}
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleToggleFavorite(meeting);
                                            }}
                                            style={{
                                                background: 'transparent',
                                                border: 'none',
                                                cursor: 'pointer',
                                                padding: '4px'
                                            }}
                                        >
                                            <i data-lucide="star"
                                               style={{
                                                   width: '16px',
                                                   height: '16px',
                                                   fill: 'none',
                                                   stroke: '#9E9E9E'
                                               }}></i>
                                        </button>
                                    </div>

                                    {/* Meeting name */}
                                    <h4 style={{
                                        margin: 0,
                                        fontSize: '14px',
                                        fontWeight: 'bold',
                                        color: '#333',
                                        lineHeight: '1.3',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        display: '-webkit-box',
                                        WebkitLineClamp: 2,
                                        WebkitBoxOrient: 'vertical'
                                    }}>
                                        {String(meeting.name || 'Unnamed Meeting')}
                                    </h4>

                                    {/* Time */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <i data-lucide="clock" style={{ width: '12px', height: '12px', color: '#058585' }}></i>
                                        <span style={{ fontSize: '12px', color: '#65676B', fontWeight: '600' }}>
                                            {formatTime(meeting.time)}
                                        </span>
                                    </div>

                                    {/* Location */}
                                    {meeting.location?.city && (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <i data-lucide="map-pin" style={{ width: '12px', height: '12px', color: '#058585' }}></i>
                                            <span style={{ fontSize: '12px', color: '#65676B', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                {meeting.location.city}, {meeting.location.state}
                                            </span>
                                        </div>
                                    )}

                                    {/* Add to Schedule button */}
                                    <button
                                        onClick={() => {
                                            setSelectedMeetingForAdd(meeting);
                                            setShowWeekSelector(true);
                                        }}
                                        style={{
                                            padding: '8px 12px',
                                            background: 'linear-gradient(135deg, #058585, #069494)',
                                            color: '#FFFFFF',
                                            border: 'none',
                                            borderRadius: '6px',
                                            fontSize: '12px',
                                            fontWeight: 'bold',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '6px',
                                            marginTop: 'auto'
                                        }}
                                    >
                                        <i data-lucide="calendar-plus" style={{ width: '12px', height: '12px' }}></i>
                                        Add to Schedule
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {filteredResults.length > 0 ? (
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px'
                    }}>
                        {/* ✅ PHASE 2 FIX #1: Use paginatedResults instead of filteredResults */}
                        {paginatedResults.map((meeting) => (
                            <div key={meeting.id} style={{
                                background: '#FFFFFF',
                                borderRadius: '8px',
                                padding: isMobile ? '12px' : '16px',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '12px'
                            }}>
                                {/* Meeting Type Badge */}
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'flex-start',
                                    gap: '8px',
                                    flexWrap: 'wrap'
                                }}>
                                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flex: 1, flexWrap: 'wrap' }}>
                                        <span style={{
                                            padding: '4px 10px',
                                            borderRadius: '12px',
                                            fontSize: '12px',
                                            fontWeight: '700',
                                            background: meeting.type === 'AA' ? '#E7F3FF' : '#E8F5E9',
                                            color: meeting.type === 'AA' ? '#1877F2' : '#43A047'
                                        }}>
                                            {meeting.type}
                                        </span>
                                        {/* Phase 3: Distance badge */}
                                        {meeting.distance !== null && meeting.distance !== undefined && (
                                            <span style={{
                                                padding: '4px 10px',
                                                borderRadius: '12px',
                                                fontSize: '11px',
                                                fontWeight: '600',
                                                background: '#FFF3E0',
                                                color: '#E65100',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '4px'
                                            }}>
                                                <i data-lucide="map-pin" style={{ width: '12px', height: '12px' }}></i>
                                                {meeting.distance.toFixed(1)} mi
                                            </span>
                                        )}
                                        <span style={{
                                            padding: '4px 10px',
                                            borderRadius: '12px',
                                            fontSize: '11px',
                                            fontWeight: '600',
                                            background: '#F0F2F5',
                                            color: '#65676B'
                                        }}>
                                            {days[meeting.day]}
                                        </span>
                                    </div>

                                    {/* Phase 3: Favorite Star Button */}
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleToggleFavorite(meeting);
                                        }}
                                        aria-label={favorites.has(meeting.id) ? 'Remove from favorites' : 'Add to favorites'}
                                        title={favorites.has(meeting.id) ? 'Remove from favorites' : 'Add to favorites'}
                                        style={{
                                            background: 'transparent',
                                            border: 'none',
                                            cursor: 'pointer',
                                            padding: '6px',
                                            borderRadius: '50%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            transition: 'all 0.2s',
                                            color: favorites.has(meeting.id) ? '#FFB300' : '#9E9E9E'
                                        }}
                                        onMouseOver={(e) => {
                                            e.currentTarget.style.background = '#F0F2F5';
                                            e.currentTarget.style.transform = 'scale(1.1)';
                                        }}
                                        onMouseOut={(e) => {
                                            e.currentTarget.style.background = 'transparent';
                                            e.currentTarget.style.transform = 'scale(1)';
                                        }}
                                    >
                                        <i data-lucide={favorites.has(meeting.id) ? 'star' : 'star'}
                                           style={{
                                               width: '18px',
                                               height: '18px',
                                               fill: favorites.has(meeting.id) ? '#FFB300' : 'none',
                                               stroke: favorites.has(meeting.id) ? '#FFB300' : '#9E9E9E'
                                           }}></i>
                                    </button>
                                </div>

                                {/* Meeting Name */}
                                <h4 style={{
                                    color: '#333',
                                    margin: 0,
                                    fontSize: '15px',
                                    fontWeight: 'bold',
                                    lineHeight: '1.3'
                                }}>
                                    {String(meeting.name || 'Unnamed Meeting')}
                                </h4>

                                {/* Time */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <i data-lucide="clock" style={{ width: '14px', height: '14px', color: '#058585' }}></i>
                                    <span style={{ fontSize: '13px', color: '#65676B', fontWeight: '600' }}>
                                        {formatTime(meeting.time)}
                                    </span>
                                </div>

                                {/* ✅ PHASE 2 FIX #2: Location with structured address support */}
                                {(() => {
                                    // Check if new structured format (with coordinates)
                                    const hasStructuredLocation = meeting.location && typeof meeting.location === 'object' && meeting.location.coordinates;

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
                                                    {loc.name && (
                                                        <div style={{ fontWeight: '600' }}>
                                                            {String(loc.name)}
                                                        </div>
                                                    )}

                                                    {/* Structured Address */}
                                                    {loc.formatted ? (
                                                        <div>{loc.formatted}</div>
                                                    ) : (
                                                        <>
                                                            {loc.streetNumber && loc.streetName && (
                                                                <div>{loc.streetNumber} {loc.streetName}</div>
                                                            )}
                                                            <div>
                                                                {[loc.city, loc.state, loc.zipCode].filter(Boolean).join(', ')}
                                                            </div>
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
                                                    {/* Location Name */}
                                                    {meeting.location && (
                                                        <div style={{ fontWeight: '600' }}>
                                                            {typeof meeting.location === 'object' && meeting.location.name
                                                                ? String(meeting.location.name)
                                                                : typeof meeting.location === 'string'
                                                                ? String(meeting.location)
                                                                : 'Location'}
                                                        </div>
                                                    )}

                                                    {/* Street Address */}
                                                    {meeting.address && (
                                                        <div>{String(meeting.address)}</div>
                                                    )}

                                                    {/* City, State, Zip */}
                                                    {(() => {
                                                        const parts = [];
                                                        if (meeting.city) parts.push(String(meeting.city));
                                                        if (meeting.state) parts.push(String(meeting.state));
                                                        if (meeting.zip) parts.push(String(meeting.zip));
                                                        return parts.length > 0 ? <div>{parts.join(', ')}</div> : null;
                                                    })()}
                                                </div>
                                            </div>
                                        );
                                    }

                                    return null;
                                })()}

                                {/* Meeting Types */}
                                {meeting.types && (
                                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                                        {/* Virtual badge */}
                                        {meeting.isVirtual && (
                                            <span style={{
                                                padding: '2px 8px',
                                                borderRadius: '10px',
                                                fontSize: '11px',
                                                fontWeight: '600',
                                                background: '#E7F3FF',
                                                color: '#1877F2',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '4px'
                                            }}>
                                                <i data-lucide="video" style={{ width: '10px', height: '10px' }}></i>
                                                Virtual
                                            </span>
                                        )}
                                        {/* Type codes */}
                                        {(() => {
                                            const typeList = Array.isArray(meeting.types)
                                                ? meeting.types
                                                : String(meeting.types).split(',').map(t => t.trim());
                                            return typeList.map((type, idx) => {
                                                const code = String(type).trim();
                                                const fullName = getTypeName(code);
                                                const isKnownType = meetingTypeCodes[code.toUpperCase()];

                                                return (
                                                    <span
                                                        key={idx}
                                                        title={isKnownType ? fullName : undefined}
                                                        style={{
                                                            padding: '2px 8px',
                                                            borderRadius: '10px',
                                                            fontSize: '11px',
                                                            fontWeight: '600',
                                                            background: isKnownType ? '#E8F5E9' : '#F0F2F5',
                                                            color: isKnownType ? '#2E7D32' : '#65676B',
                                                            cursor: isKnownType ? 'help' : 'default',
                                                            transition: 'all 0.2s'
                                                        }}
                                                        onMouseOver={(e) => {
                                                            if (isKnownType) {
                                                                e.currentTarget.style.background = '#C8E6C9';
                                                                e.currentTarget.style.transform = 'scale(1.05)';
                                                            }
                                                        }}
                                                        onMouseOut={(e) => {
                                                            if (isKnownType) {
                                                                e.currentTarget.style.background = '#E8F5E9';
                                                                e.currentTarget.style.transform = 'scale(1)';
                                                            }
                                                        }}
                                                    >
                                                        {isKnownType ? `${code} - ${fullName}` : code}
                                                    </span>
                                                );
                                            });
                                        })()}
                                    </div>
                                )}

                                {/* Notes/Description */}
                                {meeting.notes && (
                                    <div style={{
                                        padding: '8px 12px',
                                        background: '#F7F9FA',
                                        borderRadius: '6px',
                                        borderLeft: '3px solid #058585'
                                    }}>
                                        <div style={{
                                            fontSize: '12px',
                                            color: '#65676B',
                                            lineHeight: '1.4'
                                        }}>
                                            {String(meeting.notes)}
                                        </div>
                                    </div>
                                )}

                                {/* Add to Schedule Button */}
                                <button
                                    onClick={() => {
                                        setSelectedMeetingForAdd(meeting);
                                        // In admin mode, show PIR selector first; otherwise show week selector
                                        if (isAdminPortal) {
                                            setShowPIRSelector(true);
                                        } else {
                                            setShowWeekSelector(true);
                                        }
                                    }}
                                    disabled={addingMeetingId === meeting.id}
                                    style={{
                                        padding: '10px 16px',
                                        background: addingMeetingId === meeting.id ? '#CED0D4' : 'linear-gradient(135deg, #058585, #069494)',
                                        color: '#FFFFFF',
                                        border: 'none',
                                        borderRadius: '8px',
                                        fontSize: '13px',
                                        fontWeight: 'bold',
                                        cursor: addingMeetingId === meeting.id ? 'not-allowed' : 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '8px',
                                        boxShadow: addingMeetingId === meeting.id ? 'none' : '0 2px 8px rgba(5,133,133,0.3)',
                                        transition: 'transform 0.2s ease',
                                        marginTop: 'auto'
                                    }}
                                    onMouseOver={(e) => {
                                        if (addingMeetingId !== meeting.id) {
                                            e.currentTarget.style.transform = 'translateY(-1px)';
                                        }
                                    }}
                                    onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                                >
                                    <i data-lucide={addingMeetingId === meeting.id ? 'loader-2' : isAdminPortal ? 'user-plus' : 'calendar-plus'}
                                       style={{
                                           width: '14px',
                                           height: '14px',
                                           animation: addingMeetingId === meeting.id ? 'spin 1s linear infinite' : 'none'
                                       }}></i>
                                    {addingMeetingId === meeting.id ? 'Adding...' : (isAdminPortal ? "Add to PIR's Schedule" : 'Add to Schedule')}
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div style={{
                        textAlign: 'center',
                        padding: '60px 20px',
                        background: '#FFFFFF',
                        borderRadius: '8px',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                    }}>
                        <i data-lucide="search-x" style={{ width: '48px', height: '48px', color: '#058585', marginBottom: '16px' }}></i>
                        <div style={{ color: '#65676B', fontSize: '15px' }}>
                            No meetings found matching your filters.
                        </div>
                        <div style={{ color: '#65676B', fontSize: '13px', marginTop: '8px' }}>
                            Try adjusting your filters.
                        </div>
                    </div>
                )}

                {/* ✅ PHASE 2 FIX #1: Bottom Pagination Controls */}
                {filteredResults.length > 0 && (
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginTop: '16px',
                        padding: isMobile ? '12px' : '16px',
                        background: '#F0F2F5',
                        borderRadius: '8px',
                        gap: '12px',
                        flexWrap: 'wrap'
                    }}>
                        <div style={{
                            fontSize: '14px',
                            fontWeight: '600',
                            color: '#333',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                        }}>
                            <i data-lucide="list" style={{ width: '16px', height: '16px', color: '#058585' }}></i>
                            Showing {startIndex + 1}-{endIndex} of {filteredResults.length} meeting{filteredResults.length !== 1 ? 's' : ''}
                        </div>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}>
                            {/* ✅ PHASE 2 FIX #4: Accessible pagination with ARIA & keyboard support */}
                            <button
                                onClick={handlePreviousPage}
                                disabled={currentPage === 1}
                                aria-label="Go to previous page"
                                aria-disabled={currentPage === 1}
                                tabIndex={0}
                                onKeyDown={(e) => {
                                    if ((e.key === 'Enter' || e.key === ' ') && currentPage !== 1) {
                                        e.preventDefault();
                                        handlePreviousPage();
                                    }
                                }}
                                style={{
                                    padding: isMobile ? '8px 12px' : '8px 16px',
                                    background: currentPage === 1 ? '#E0E0E0' : '#FFFFFF',
                                    color: currentPage === 1 ? '#9E9E9E' : '#058585',
                                    border: `2px solid ${currentPage === 1 ? '#E0E0E0' : '#058585'}`,
                                    borderRadius: '8px',
                                    fontSize: '13px',
                                    fontWeight: '600',
                                    cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    transition: 'all 0.2s',
                                    outline: 'none'
                                }}
                                onFocus={(e) => {
                                    if (currentPage !== 1) {
                                        e.currentTarget.style.boxShadow = '0 0 0 3px rgba(24, 119, 242, 0.3)';
                                        e.currentTarget.style.borderColor = '#1877F2';
                                    }
                                }}
                                onBlur={(e) => {
                                    e.currentTarget.style.boxShadow = 'none';
                                    e.currentTarget.style.borderColor = currentPage === 1 ? '#E0E0E0' : '#058585';
                                }}
                                onMouseOver={(e) => {
                                    if (currentPage !== 1) {
                                        e.currentTarget.style.background = '#058585';
                                        e.currentTarget.style.color = '#FFFFFF';
                                    }
                                }}
                                onMouseOut={(e) => {
                                    if (currentPage !== 1) {
                                        e.currentTarget.style.background = '#FFFFFF';
                                        e.currentTarget.style.color = '#058585';
                                    }
                                }}
                            >
                                <i data-lucide="chevron-left" style={{ width: '14px', height: '14px' }}></i>
                                {!isMobile && 'Previous'}
                            </button>
                            <div
                                role="status"
                                aria-live="polite"
                                aria-label={`Page ${currentPage} of ${totalPages}`}
                                style={{
                                    padding: '8px 12px',
                                    background: '#058585',
                                    color: '#FFFFFF',
                                    borderRadius: '8px',
                                    fontSize: '13px',
                                    fontWeight: 'bold',
                                    minWidth: isMobile ? '50px' : '70px',
                                    textAlign: 'center'
                                }}
                            >
                                {currentPage} / {totalPages}
                            </div>
                            <button
                                onClick={handleNextPage}
                                disabled={currentPage === totalPages}
                                aria-label="Go to next page"
                                aria-disabled={currentPage === totalPages}
                                tabIndex={0}
                                onKeyDown={(e) => {
                                    if ((e.key === 'Enter' || e.key === ' ') && currentPage !== totalPages) {
                                        e.preventDefault();
                                        handleNextPage();
                                    }
                                }}
                                style={{
                                    padding: isMobile ? '8px 12px' : '8px 16px',
                                    background: currentPage === totalPages ? '#E0E0E0' : '#FFFFFF',
                                    color: currentPage === totalPages ? '#9E9E9E' : '#058585',
                                    border: `2px solid ${currentPage === totalPages ? '#E0E0E0' : '#058585'}`,
                                    borderRadius: '8px',
                                    fontSize: '13px',
                                    fontWeight: '600',
                                    cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    transition: 'all 0.2s',
                                    outline: 'none'
                                }}
                                onFocus={(e) => {
                                    if (currentPage !== totalPages) {
                                        e.currentTarget.style.boxShadow = '0 0 0 3px rgba(24, 119, 242, 0.3)';
                                        e.currentTarget.style.borderColor = '#1877F2';
                                    }
                                }}
                                onBlur={(e) => {
                                    e.currentTarget.style.boxShadow = 'none';
                                    e.currentTarget.style.borderColor = currentPage === totalPages ? '#E0E0E0' : '#058585';
                                }}
                                onMouseOver={(e) => {
                                    if (currentPage !== totalPages) {
                                        e.currentTarget.style.background = '#058585';
                                        e.currentTarget.style.color = '#FFFFFF';
                                    }
                                }}
                                onMouseOut={(e) => {
                                    if (currentPage !== totalPages) {
                                        e.currentTarget.style.background = '#FFFFFF';
                                        e.currentTarget.style.color = '#058585';
                                    }
                                }}
                            >
                                {!isMobile && 'Next'}
                                <i data-lucide="chevron-right" style={{ width: '14px', height: '14px' }}></i>
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Week Selector Modal */}
            {showWeekSelector && selectedMeetingForAdd && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000,
                    padding: '20px'
                }}>
                    <div style={{
                        background: '#FFFFFF',
                        borderRadius: '12px',
                        padding: '24px',
                        maxWidth: '400px',
                        width: '100%',
                        boxShadow: '0 10px 40px rgba(0,0,0,0.3)'
                    }}>
                        {/* Modal Header */}
                        <div style={{ marginBottom: '20px' }}>
                            <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: 'bold', color: '#333' }}>
                                {isAdminPortal ? `Add to ${selectedPIR?.displayName || selectedPIR?.email || 'PIR'}'s Schedule` : 'Add to Schedule'}
                            </h3>
                            <p style={{ margin: 0, fontSize: '14px', color: '#65676B', lineHeight: '1.4' }}>
                                {selectedMeetingForAdd.name}
                            </p>
                            {isAdminPortal && selectedPIR && (
                                <div style={{
                                    marginTop: '8px',
                                    padding: '8px 12px',
                                    background: '#E7F3FF',
                                    borderRadius: '6px',
                                    fontSize: '13px',
                                    color: '#1877F2',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px'
                                }}>
                                    <i data-lucide="user" style={{ width: '14px', height: '14px' }}></i>
                                    <span>For: <strong>{selectedPIR.displayName || selectedPIR.email}</strong></span>
                                </div>
                            )}
                        </div>

                        {/* Week Selector */}
                        <div style={{ marginBottom: '24px' }}>
                            <label style={{
                                display: 'block',
                                fontSize: '13px',
                                fontWeight: '600',
                                color: '#333',
                                marginBottom: '8px'
                            }}>
                                How many weeks?
                            </label>
                            <input
                                type="number"
                                min="1"
                                max="30"
                                value={weeksToAdd}
                                onChange={(e) => {
                                    const value = parseInt(e.target.value);
                                    if (value >= 1 && value <= 30) {
                                        setWeeksToAdd(value);
                                    }
                                }}
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    fontSize: '16px',
                                    border: '2px solid #E0E0E0',
                                    borderRadius: '8px',
                                    outline: 'none',
                                    transition: 'border-color 0.2s'
                                }}
                                onFocus={(e) => e.target.style.borderColor = '#058585'}
                                onBlur={(e) => e.target.style.borderColor = '#E0E0E0'}
                            />
                            <div style={{
                                marginTop: '8px',
                                fontSize: '12px',
                                color: '#65676B',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px'
                            }}>
                                <i data-lucide="info" style={{ width: '12px', height: '12px' }}></i>
                                This will create {weeksToAdd} weekly meeting instance{weeksToAdd > 1 ? 's' : ''}
                            </div>
                        </div>

                        {/* Buttons */}
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button
                                onClick={() => {
                                    setShowWeekSelector(false);
                                    setSelectedMeetingForAdd(null);
                                }}
                                style={{
                                    flex: 1,
                                    padding: '12px',
                                    background: '#F0F2F5',
                                    color: '#333',
                                    border: 'none',
                                    borderRadius: '8px',
                                    fontSize: '14px',
                                    fontWeight: 'bold',
                                    cursor: 'pointer'
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAddToSchedule}
                                style={{
                                    flex: 1,
                                    padding: '12px',
                                    background: 'linear-gradient(135deg, #058585, #069494)',
                                    color: '#FFFFFF',
                                    border: 'none',
                                    borderRadius: '8px',
                                    fontSize: '14px',
                                    fontWeight: 'bold',
                                    cursor: 'pointer',
                                    boxShadow: '0 2px 8px rgba(5,133,133,0.3)'
                                }}
                            >
                                Add to Schedule
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ==========================================
                ADMIN CONTEXT: PIR SELECTOR MODAL
                ========================================== */}
            {showPIRSelector && selectedMeetingForAdd && isAdminPortal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1001,
                    padding: '20px'
                }}>
                    <div style={{
                        background: '#FFFFFF',
                        borderRadius: '12px',
                        padding: '24px',
                        maxWidth: '500px',
                        width: '100%',
                        maxHeight: '80vh',
                        display: 'flex',
                        flexDirection: 'column',
                        boxShadow: '0 10px 40px rgba(0,0,0,0.3)'
                    }}>
                        {/* Modal Header */}
                        <div style={{ marginBottom: '16px' }}>
                            <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: 'bold', color: '#333' }}>
                                Select PIR
                            </h3>
                            <p style={{ margin: 0, fontSize: '14px', color: '#65676B', lineHeight: '1.4' }}>
                                Choose which PIR to add this meeting to:
                            </p>
                            <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#058585', fontWeight: '600' }}>
                                {selectedMeetingForAdd.name}
                            </p>
                        </div>

                        {/* Search Input */}
                        <div style={{ marginBottom: '16px' }}>
                            <input
                                type="text"
                                placeholder="Search PIRs by name or email..."
                                value={pirSearchQuery}
                                onChange={(e) => setPirSearchQuery(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '12px 16px',
                                    fontSize: '14px',
                                    border: '2px solid #E0E0E0',
                                    borderRadius: '8px',
                                    outline: 'none',
                                    transition: 'border-color 0.2s',
                                    boxSizing: 'border-box'
                                }}
                                onFocus={(e) => e.target.style.borderColor = '#058585'}
                                onBlur={(e) => e.target.style.borderColor = '#E0E0E0'}
                            />
                        </div>

                        {/* PIR List */}
                        <div style={{
                            flex: 1,
                            overflowY: 'auto',
                            marginBottom: '16px',
                            border: '1px solid #E0E0E0',
                            borderRadius: '8px'
                        }}>
                            {loadingPIRs ? (
                                <div style={{
                                    padding: '40px',
                                    textAlign: 'center',
                                    color: '#65676B'
                                }}>
                                    <i data-lucide="loader-2" style={{
                                        width: '24px',
                                        height: '24px',
                                        animation: 'spin 1s linear infinite'
                                    }}></i>
                                    <div style={{ marginTop: '8px' }}>Loading PIRs...</div>
                                </div>
                            ) : filteredPIRs.length === 0 ? (
                                <div style={{
                                    padding: '40px',
                                    textAlign: 'center',
                                    color: '#65676B'
                                }}>
                                    <i data-lucide="users" style={{
                                        width: '32px',
                                        height: '32px',
                                        marginBottom: '8px',
                                        opacity: 0.5
                                    }}></i>
                                    <div>{pirSearchQuery ? 'No PIRs match your search' : 'No PIRs available'}</div>
                                </div>
                            ) : (
                                filteredPIRs.map((pir) => (
                                    <div
                                        key={pir.uid}
                                        onClick={() => {
                                            setSelectedPIR(pir);
                                            setShowPIRSelector(false);
                                            setShowWeekSelector(true);
                                            setPirSearchQuery('');
                                        }}
                                        style={{
                                            padding: '12px 16px',
                                            borderBottom: '1px solid #F0F2F5',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '12px',
                                            transition: 'background 0.2s'
                                        }}
                                        onMouseOver={(e) => e.currentTarget.style.background = '#F7F9FA'}
                                        onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                                    >
                                        {/* Avatar */}
                                        <div style={{
                                            width: '40px',
                                            height: '40px',
                                            borderRadius: '50%',
                                            background: 'linear-gradient(135deg, #058585, #069494)',
                                            color: '#FFFFFF',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '16px',
                                            fontWeight: 'bold',
                                            flexShrink: 0
                                        }}>
                                            {(pir.displayName || pir.email || '?').charAt(0).toUpperCase()}
                                        </div>
                                        {/* Info */}
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{
                                                fontSize: '14px',
                                                fontWeight: '600',
                                                color: '#333',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap'
                                            }}>
                                                {pir.displayName || pir.firstName && pir.lastName ? `${pir.firstName} ${pir.lastName}` : 'Unnamed PIR'}
                                            </div>
                                            <div style={{
                                                fontSize: '12px',
                                                color: '#65676B',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap'
                                            }}>
                                                {pir.email}
                                            </div>
                                        </div>
                                        {/* Arrow */}
                                        <i data-lucide="chevron-right" style={{
                                            width: '16px',
                                            height: '16px',
                                            color: '#9E9E9E',
                                            flexShrink: 0
                                        }}></i>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Buttons */}
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button
                                onClick={() => {
                                    setShowPIRSelector(false);
                                    setSelectedMeetingForAdd(null);
                                    setPirSearchQuery('');
                                }}
                                style={{
                                    flex: 1,
                                    padding: '12px',
                                    background: '#F0F2F5',
                                    color: '#333',
                                    border: 'none',
                                    borderRadius: '8px',
                                    fontSize: '14px',
                                    fontWeight: 'bold',
                                    cursor: 'pointer'
                                }}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ✅ PHASE 1 FIX #4: Filter Modal (Bottom Sheet on Mobile, Modal on Desktop) */}
            {showFilterModal && (
                <>
                    {/* Overlay */}
                    <div
                        onClick={handleCancelFilters}
                        style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: 'rgba(0,0,0,0.5)',
                            zIndex: 9998,
                            animation: 'fadeIn 0.2s'
                        }}
                    />

                    {/* Modal Container */}
                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="filter-modal-title"
                        style={{
                            position: 'fixed',
                            bottom: isMobile ? 0 : '50%',
                            left: isMobile ? 0 : '50%',
                            right: isMobile ? 0 : 'auto',
                            transform: isMobile ? 'none' : 'translate(-50%, 50%)',
                            background: '#FFFFFF',
                            borderRadius: isMobile ? '16px 16px 0 0' : '12px',
                            boxShadow: '0 -4px 20px rgba(0,0,0,0.2)',
                            zIndex: 9999,
                            maxHeight: isMobile ? '80vh' : '70vh',
                            width: isMobile ? '100%' : '90%',
                            maxWidth: isMobile ? '100%' : '600px',
                            display: 'flex',
                            flexDirection: 'column',
                            animation: isMobile ? 'slideUp 0.3s ease-out' : 'scaleIn 0.2s ease-out'
                        }}
                    >
                        {/* Header */}
                        <div style={{
                            padding: '16px 20px',
                            borderBottom: '1px solid #E4E6EB',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <h3 id="filter-modal-title" style={{ margin: 0, fontSize: '18px', fontWeight: 'bold', color: '#333' }}>
                                Filters
                            </h3>
                            <button
                                onClick={handleCancelFilters}
                                aria-label="Close filters dialog"
                                style={{
                                    background: 'transparent',
                                    border: 'none',
                                    cursor: 'pointer',
                                    padding: '4px',
                                    fontSize: '24px',
                                    color: '#666',
                                    lineHeight: 1
                                }}
                            >
                                ✕
                            </button>
                        </div>

                        {/* Scrollable Content */}
                        <div style={{
                            flex: 1,
                            overflowY: 'auto',
                            padding: '20px'
                        }}>
                            {/* Day of Week Filter */}
                            <div style={{ marginBottom: '24px' }}>
                                <label style={{
                                    display: 'block',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    color: '#333',
                                    marginBottom: '12px'
                                }}>
                                    Day of Week
                                </label>
                                <div style={{
                                    display: 'flex',
                                    flexWrap: 'wrap',
                                    gap: '8px'
                                }}>
                                    <button
                                        onClick={() => setTempDayFilter('all')}
                                        style={{
                                            padding: '8px 16px',
                                            borderRadius: '16px',
                                            border: `2px solid ${tempDayFilter === 'all' ? '#2196F3' : '#E0E0E0'}`,
                                            background: tempDayFilter === 'all' ? '#2196F3' : '#FFFFFF',
                                            color: tempDayFilter === 'all' ? '#FFFFFF' : '#333',
                                            fontSize: '13px',
                                            fontWeight: '600',
                                            cursor: 'pointer',
                                            flexShrink: 0
                                        }}
                                    >
                                        All Days
                                    </button>
                                    {days.map((day, index) => (
                                        <button
                                            key={index}
                                            onClick={() => setTempDayFilter(String(index))}
                                            style={{
                                                padding: '8px 16px',
                                                borderRadius: '16px',
                                                border: `2px solid ${tempDayFilter === String(index) ? '#2196F3' : '#E0E0E0'}`,
                                                background: tempDayFilter === String(index) ? '#2196F3' : '#FFFFFF',
                                                color: tempDayFilter === String(index) ? '#FFFFFF' : '#333',
                                                fontSize: '13px',
                                                fontWeight: '600',
                                                cursor: 'pointer',
                                                flexShrink: 0
                                            }}
                                        >
                                            {day.substring(0, 3)}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Meeting Type Filter */}
                            <div style={{ marginBottom: '24px' }}>
                                <label style={{
                                    display: 'block',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    color: '#333',
                                    marginBottom: '12px'
                                }}>
                                    Meeting Type
                                </label>
                                <div style={{
                                    display: 'flex',
                                    gap: '8px',
                                    flexWrap: 'wrap'
                                }}>
                                    <button
                                        onClick={() => setTempTypeFilter('all')}
                                        style={{
                                            padding: '8px 16px',
                                            borderRadius: '16px',
                                            border: `2px solid ${tempTypeFilter === 'all' ? '#2196F3' : '#E0E0E0'}`,
                                            background: tempTypeFilter === 'all' ? '#2196F3' : '#FFFFFF',
                                            color: tempTypeFilter === 'all' ? '#FFFFFF' : '#333',
                                            fontSize: '13px',
                                            fontWeight: '600',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        All Types
                                    </button>
                                    <button
                                        onClick={() => setTempTypeFilter('aa')}
                                        style={{
                                            padding: '8px 16px',
                                            borderRadius: '16px',
                                            border: `2px solid ${tempTypeFilter === 'aa' ? '#2196F3' : '#E0E0E0'}`,
                                            background: tempTypeFilter === 'aa' ? '#2196F3' : '#FFFFFF',
                                            color: tempTypeFilter === 'aa' ? '#FFFFFF' : '#333',
                                            fontSize: '13px',
                                            fontWeight: '600',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        AA
                                    </button>
                                    <button
                                        onClick={() => setTempTypeFilter('na')}
                                        style={{
                                            padding: '8px 16px',
                                            borderRadius: '16px',
                                            border: `2px solid ${tempTypeFilter === 'na' ? '#2196F3' : '#E0E0E0'}`,
                                            background: tempTypeFilter === 'na' ? '#2196F3' : '#FFFFFF',
                                            color: tempTypeFilter === 'na' ? '#FFFFFF' : '#333',
                                            fontSize: '13px',
                                            fontWeight: '600',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        NA
                                    </button>
                                </div>
                            </div>

                            {/* County Filter */}
                            <div style={{ marginBottom: '24px' }}>
                                <label style={{
                                    display: 'block',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    color: '#333',
                                    marginBottom: '12px'
                                }}>
                                    County
                                </label>
                                <select
                                    value={tempCountyFilter}
                                    onChange={(e) => setTempCountyFilter(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        borderRadius: '8px',
                                        border: '2px solid #E0E0E0',
                                        fontSize: '14px',
                                        color: '#333',
                                        background: '#FFFFFF',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <option value="all">All Counties</option>
                                    <option value="sf">San Francisco</option>
                                    <option value="sanmateo">San Mateo</option>
                                    <option value="santaclara">Santa Clara</option>
                                    <option value="eastbay">East Bay</option>
                                    <option value="santacruz">Santa Cruz</option>
                                </select>
                            </div>

                            {/* Format Filter */}
                            <div style={{ marginBottom: '24px' }}>
                                <label style={{
                                    display: 'block',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    color: '#333',
                                    marginBottom: '12px'
                                }}>
                                    Format
                                </label>
                                <select
                                    value={tempFormatFilter}
                                    onChange={(e) => setTempFormatFilter(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        borderRadius: '8px',
                                        border: '2px solid #E0E0E0',
                                        fontSize: '14px',
                                        color: '#333',
                                        background: '#FFFFFF',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <option value="all">All Formats</option>
                                    <option value="O">Open</option>
                                    <option value="C">Closed</option>
                                    <option value="D">Discussion</option>
                                    <option value="B">Big Book</option>
                                    <option value="SP">Speaker</option>
                                    <option value="ONL">Online</option>
                                    <option value="HY">Hybrid</option>
                                </select>
                            </div>
                        </div>

                        {/* Sticky Bottom Bar */}
                        <div style={{
                            padding: '16px 20px',
                            borderTop: '1px solid #E4E6EB',
                            display: 'flex',
                            gap: '12px',
                            background: '#FFFFFF',
                            borderRadius: isMobile ? '0' : '0 0 12px 12px'
                        }}>
                            <button
                                onClick={handleClearFilters}
                                style={{
                                    flex: 1,
                                    padding: '12px',
                                    background: '#F0F2F5',
                                    color: '#333',
                                    border: 'none',
                                    borderRadius: '8px',
                                    fontSize: '14px',
                                    fontWeight: 'bold',
                                    cursor: 'pointer'
                                }}
                            >
                                Clear
                            </button>
                            <button
                                onClick={handleCancelFilters}
                                style={{
                                    flex: 1,
                                    padding: '12px',
                                    background: '#FFFFFF',
                                    color: '#333',
                                    border: '2px solid #E0E0E0',
                                    borderRadius: '8px',
                                    fontSize: '14px',
                                    fontWeight: 'bold',
                                    cursor: 'pointer'
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleApplyFilters}
                                style={{
                                    flex: 2,
                                    padding: '12px',
                                    background: '#2196F3',
                                    color: '#FFFFFF',
                                    border: 'none',
                                    borderRadius: '8px',
                                    fontSize: '14px',
                                    fontWeight: 'bold',
                                    cursor: 'pointer',
                                    boxShadow: '0 2px 8px rgba(33,150,243,0.3)'
                                }}
                            >
                                Apply
                                {(() => {
                                    let tempCount = 0;
                                    if (tempTypeFilter !== 'all') tempCount++;
                                    if (tempCountyFilter !== 'all') tempCount++;
                                    if (tempDayFilter !== 'all') tempCount++;
                                    if (tempFormatFilter !== 'all') tempCount++;
                                    return tempCount > 0 ? ` (${tempCount})` : '';
                                })()}
                            </button>
                        </div>
                    </div>

                    {/* Animations */}
                    <style>{`
                        @keyframes slideUp {
                            from {
                                transform: translateY(100%);
                            }
                            to {
                                transform: translateY(0);
                            }
                        }
                        @keyframes fadeIn {
                            from { opacity: 0; }
                            to { opacity: 1; }
                        }
                        @keyframes scaleIn {
                            from {
                                opacity: 0;
                                transform: translate(-50%, 50%) scale(0.95);
                            }
                            to {
                                opacity: 1;
                                transform: translate(-50%, 50%) scale(1);
                            }
                        }
                    `}</style>
                </>
            )}

            {/* Animation Keyframes */}
            <style>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

// Register component in namespace
window.GLRSApp = window.GLRSApp || {};
window.GLRSApp.components = window.GLRSApp.components || {};
window.GLRSApp.components.MeetingBrowser = MeetingBrowser;
