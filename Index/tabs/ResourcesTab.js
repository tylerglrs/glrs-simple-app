// Destructure React hooks for use in components
const { useState, useEffect, useMemo, useCallback, useRef } = React;

/**
 * @file ResourcesTab.js - Resources library with category browsing and progress tracking
 * @description Provides users access to assigned and global recovery resources with:
 * - Category-based filtering (Coping Skills, Relapse Prevention, Daily Tools, Education, Support, Life Skills)
 * - Resource viewer with personal notes and progress tracking
 * - "NEW" badges for recently added resources
 * - Print and download functionality
 * - Search across all resources
 * - Assigned vs Global resource tabs
 *
 * @components
 * MAIN COMPONENT (1):
 * - ResourcesView: Main resources browser with category selection and resource listing
 *
 * SUB-COMPONENT (1):
 * - ResourceViewer: Full-screen resource detail viewer with notes and progress tracking
 *
 * @architecture 3-Layer Direct Architecture (Component → Firebase → Component)
 * - ResourcesView uses local useState hooks (15 total)
 * - Direct Firebase Firestore queries (9 total)
 * - Real-time auth listener with cleanup
 * - NO global state dependencies
 * - ResourceViewer is props-based with callbacks (NO Firebase)
 *
 * @firebase 9 Firestore queries:
 * - users: Get display names for resource authors
 * - resources: Load assigned and global resources
 * - users/{uid}/preferences: Save/load notes, progress, last view timestamp
 * - activities: Log progress update activities
 * - users/{uid}/resourceViews: Track resource view timestamps
 *
 * @refactored November 2025 - Phase 5 complete
 * @author GLRS Development Team
 */

/**
 * ResourcesView Component
 * @description Main resources browser with category selection, resource listing, and filtering
 *
 * @features
 * - Category Selection: 6 categories (Coping, Relapse Prevention, Daily, Education, Support, Life Skills)
 * - Assigned vs Global Tabs: Toggle between personally assigned and globally available resources
 * - Search Functionality: Search across all resources by title/description
 * - Progress Tracking: Track resources as not-started, in-progress, or completed
 * - Personal Notes: Add/edit notes for each resource
 * - "NEW" Badges: Highlight recently added resources
 * - Resource Counts: Display count per category
 *
 * @state 15 useState hooks:
 * - user: object - Current authenticated user from Firebase auth
 * - selectedCategory: string|null - Active category filter (null = category selection view)
 * - activeTab: string - 'assigned' or 'global' resources tab
 * - resources: array - Filtered resources for current view (category + tab)
 * - allResources: array - All resources loaded from Firebase
 * - notes: object - User's personal notes per resource (resourceId: noteText)
 * - progress: object - Progress tracking per resource (resourceId: {status, updatedAt, completedAt})
 * - searchQuery: string - Search filter text
 * - selectedResource: object|null - Currently viewing resource (opens ResourceViewer)
 * - loading: boolean - Loading state for data fetches
 * - error: string|null - Error message for display to user
 * - resourceCounts: object - Count of resources per category (categoryId: count)
 * - totalResourceCount: number - Total resources available
 * - newResourceIds: array - IDs of resources added since last view
 * - userNames: object - Display names for resource authors (userId: displayName)
 *
 * @effects 4 useEffect hooks:
 * - Auth listener: Load user from Firebase auth (cleanup on unmount)
 * - Load resources: Load all resources and user preferences when user changes
 * - Check new resources: Check for new resources and load user names when allResources changes
 * - Filter resources: Filter resources by category and tab when filters change
 *
 * @firebase 9 Firestore queries:
 * 1. users: Get display names for resource authors
 * 2. resources (assigned): Load resources assigned to user
 * 3. resources (global): Load globally available resources
 * 4. users/{uid}/preferences/lastResourceView: Get last view timestamp
 * 5. users/{uid}/preferences/lastResourceView: Update last view timestamp
 * 6. users/{uid}/preferences/resources: Load saved notes and progress
 * 7. activities: Log progress update activities
 * 8. users/{uid}/preferences/resources: Save notes and progress
 * 9. users/{uid}/resourceViews: Track resource view timestamps
 *
 * @errorHandling All 9 Firebase queries have proper error handling:
 * - Critical errors (loadAllResources, savePreferences): setError() + user notification
 * - Non-critical errors: console.error() only, app continues
 *
 * @returns {React.Element} Three views: category selection, resource list, or resource viewer
 */
function ResourcesView() {  // ✅ PHASE 5: Refactored with error handling + loading states + JSDoc
    const [user, setUser] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [resources, setResources] = useState([]);
    const [allResources, setAllResources] = useState([]);
    const [notes, setNotes] = useState({});
    const [progress, setProgress] = useState({});
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedResource, setSelectedResource] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [resourceCounts, setResourceCounts] = useState({});
    const [totalResourceCount, setTotalResourceCount] = useState(0);
    const [newResourceIds, setNewResourceIds] = useState([]);
    const [userNames, setUserNames] = useState({});

    // PHASE 1: Mobile-responsive state
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [showSidebar, setShowSidebar] = useState(false); // For Phase 2

    // PHASE 3: Tab navigation state
    const [activeTab, setActiveTab] = useState('library'); // 'library' | 'work' | 'wellness' | 'relationships' | 'crisis'

    // PHASE 4: My Library filtering state
    const [filterType, setFilterType] = useState('all'); // 'all' | 'article' | 'video' | 'audio' | 'worksheet' | 'tool'
    const [filterStatus, setFilterStatus] = useState('all'); // 'all' | 'assigned' | 'browsing' | 'completed' | 'incomplete'

    const categories = [
        { id: 'coping', name: 'Coping Skills', icon: 'brain', color: 'var(--color-success)' },
        { id: 'relapse', name: 'Relapse Prevention', icon: 'shield', color: 'var(--color-warning)' },
        { id: 'daily', name: 'Daily Tools', icon: 'calendar-check', color: 'var(--color-info)' },
        { id: 'education', name: 'Education', icon: 'book-open', color: 'var(--color-secondary)' },
        { id: 'support', name: 'Support', icon: 'users', color: 'var(--color-primary)' },
        { id: 'life', name: 'Life Skills', icon: 'sparkles', color: 'var(--color-accent)' }
    ];

    // PHASE 3: Tab definitions
    const tabs = [
        { id: 'library', label: 'My Library', icon: 'book-open', emoji: '📚' },
        { id: 'work', label: 'Work & Career', icon: 'briefcase', emoji: '💼' },
        { id: 'wellness', label: 'Wellness', icon: 'heart', emoji: '🧠' },
        { id: 'relationships', label: 'Relationships', icon: 'users', emoji: '👥' },
        { id: 'crisis', label: 'Crisis Toolkit', icon: 'shield-alert', emoji: '🚨' }
    ];

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

    // PHASE 1: Resize listener for mobile responsiveness
    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        if (!user) return;

        loadAllResources();
        loadUserPreferences();
    }, [user?.uid]);

    useEffect(() => {
        if (allResources.length > 0) {
            checkNewResources();
            loadUserNames();
        }
    }, [allResources]);

    // PHASE 2: Initialize Lucide icons on mount and when activeTab changes
    useEffect(() => {
        const timer = setTimeout(() => {
            if (typeof lucide !== 'undefined' && typeof lucide.createIcons === 'function') {
                lucide.createIcons();
                console.log('✅ ResourcesTab: Icons initialized');
            }
        }, 100);

        return () => clearTimeout(timer);
    }, [activeTab]);

    // Initialize Lucide icons when sidebar opens
    useEffect(() => {
        if (showSidebar) {
            const timer = setTimeout(() => {
                if (typeof lucide !== 'undefined' && typeof lucide.createIcons === 'function') {
                    lucide.createIcons();
                    console.log('✅ ResourcesTab: Sidebar icons initialized');
                }
            }, 100);

            return () => clearTimeout(timer);
        }
    }, [showSidebar]);

    useEffect(() => {
        if (selectedCategory) {
            filterCategoryResources();
        }
    }, [selectedCategory, activeTab, allResources]);

    /**
     * Load display names for resource authors
     * @description Fetches user display names for all unique resource authors
     * @async
     * @firebase users collection (read)
     * @updates userNames state with mapping of userId to displayName
     * @errorHandling Individual user failures default to 'Unknown', outer catch logs error
     */
    const loadUserNames = async () => {
        try {
            const uniqueUserIds = [...new Set(allResources.map(r => r.addedBy).filter(Boolean))];
            const names = {};
            
            for (const userId of uniqueUserIds) {
                try {
                    const userDoc = await db.collection('users').doc(userId).get();
                    if (userDoc.exists) {
                        const data = userDoc.data();
                        names[userId] = data.displayName || `${data.firstName} ${data.lastName}` || 'Unknown';
                    }
                } catch (error) {
                    console.error('Error loading user name:', userId, error);
                    names[userId] = 'Unknown';
                }
            }
            
            setUserNames(names);
        } catch (error) {
            console.error('Error loading user names:', error);
            // Non-critical: Set empty object, authors will show as "Unknown"
            setUserNames({});
        }
    };

    /**
     * Load all assigned and global resources
     * @description Main data loading function - fetches both assigned and global resources,
     * merges them (prioritizing assigned), and calculates counts per category
     * @async
     * @firebase resources collection (read with where clauses)
     * @updates allResources, totalResourceCount, resourceCounts, loading, error states
     * @errorHandling Critical - sets error state and displays error UI to user
     * @triggers checkNewResources() and loadUserNames() via useEffect
     */
    const loadAllResources = async () => {
        if (!user?.uid) return;

        try {
            setLoading(true);
            setError(null); // Clear any previous errors

            const assignedQuery = await db.collection('resources')
                .where('assignedTo', 'array-contains', user.uid)
                .where('active', '==', true)
                .get();
            
            const globalQuery = await db.collection('resources')
                .where('isGlobal', '==', true)
                .where('active', '==', true)
                .get();

            const resourceMap = new Map();
            
            assignedQuery.forEach(doc => {
                resourceMap.set(doc.id, { 
                    id: doc.id, 
                    ...doc.data(),
                    isAssigned: true 
                });
            });
            
            globalQuery.forEach(doc => {
                if (!resourceMap.has(doc.id)) {
                    resourceMap.set(doc.id, { 
                        id: doc.id, 
                        ...doc.data(),
                        isAssigned: false 
                    });
                }
            });

            const allResourcesList = Array.from(resourceMap.values());
            setAllResources(allResourcesList);
            setTotalResourceCount(allResourcesList.length);
            
            const counts = {};
            categories.forEach(cat => {
                counts[cat.id] = allResourcesList.filter(r => r.category === cat.id).length;
            });
            setResourceCounts(counts);
            setLoading(false); // Data loaded successfully

        } catch (error) {
            console.error('Error loading resources:', error);
            setError('Failed to load resources. Please check your connection and try again.');
            setLoading(false);
            window.handleFirebaseError && window.handleFirebaseError(error, 'ResourcesView.loadAllResources');
        }
    };

    const filterCategoryResources = () => {
        let filtered = allResources.filter(r => r.category === selectedCategory);
        
        if (activeTab === 'assigned') {
            filtered = filtered.filter(r => r.isAssigned);
        } else {
            filtered = filtered.filter(r => !r.isAssigned);
        }
        
        setResources(filtered);
    };

    const checkNewResources = async () => {
        if (!user?.uid) return;

        try {
            const lastViewDoc = await db.collection('users').doc(user.uid)
                .collection('preferences').doc('lastResourceView').get();

            const lastView = lastViewDoc.exists ? lastViewDoc.data().timestamp : null;

            if (lastView && lastView.toDate) {
                const newResources = allResources.filter(r =>
                    r.addedAt && r.addedAt.toDate && r.addedAt.toDate() > lastView.toDate()
                );
                setNewResourceIds(newResources.map(r => r.id));
            }

            await db.collection('users').doc(user.uid)
                .collection('preferences').doc('lastResourceView')
                .set({ timestamp: firebase.firestore.FieldValue.serverTimestamp() });

        } catch (error) {
            console.error('Error checking new resources:', error);
            // Non-critical: New resource badges won't show, but app continues
        }
    };

    const loadUserPreferences = async () => {
        if (!user?.uid) return;

        try {
            const prefDoc = await db.collection('users').doc(user.uid)
                .collection('preferences').doc('resources').get();
            
            if (prefDoc.exists) {
                const data = prefDoc.data();
                setNotes(data.notes || {});
                setProgress(data.progress || {});
            }
        } catch (error) {
            console.error('Error loading user preferences:', error);
            // Non-critical: Default to empty notes and progress
            setNotes({});
            setProgress({});
        }
    };

    /**
     * Update progress status for a resource
     * @description Updates progress state, saves to Firestore, logs activity, and shows notification
     * @async
     * @param {string} resourceId - ID of resource to update
     * @param {string} status - Progress status: 'not-started', 'in-progress', or 'completed'
     * @firebase
     * - users/{uid}/preferences/resources: Save progress
     * - activities: Log progress update activity
     * @updates progress state with new status and timestamps
     * @errorHandling Activity logging failure is non-critical and logged only
     */
    const updateProgress = async (resourceId, status) => {
        const newProgress = { 
            ...progress, 
            [resourceId]: {
                status: status,
                updatedAt: new Date().toISOString(),
                completedAt: status === 'completed' ? new Date().toISOString() : progress[resourceId]?.completedAt || null
            }
        };
        setProgress(newProgress);
        
        const saved = await savePreferences({ progress: newProgress });

        if (saved && user?.uid) {
            try {
                await db.collection('activities').add({
                    userId: user.uid,
                    type: 'resource_progress',
                    resourceId: resourceId,
                    status: status,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                });
            } catch (error) {
                console.error('Error logging activity:', error);
                // Non-critical: Activity tracking failed, but progress was saved
            }

            showNotification(`Progress updated to ${status}`, 'success');
        }
    };

    const saveNote = async (resourceId, note) => {
        const newNotes = { ...notes, [resourceId]: note };
        setNotes(newNotes);
        
        const saved = await savePreferences({ notes: newNotes });
        if (saved) {
            showNotification('Note saved', 'success');
        }
    };

    /**
     * Save user preferences (notes and progress) to Firestore
     * @description Merges updates with current preferences and saves to user's preferences subcollection
     * @async
     * @param {object} updates - Partial updates to merge (e.g., {notes: {...}} or {progress: {...}})
     * @returns {boolean} True if save successful, false if failed
     * @firebase users/{uid}/preferences/resources (write with merge)
     * @errorHandling Critical - shows user notification and returns false on failure
     */
    const savePreferences = async (updates) => {
        if (!user?.uid) return false;

        try {
            const currentPrefs = {
                notes: notes,
                progress: progress,
                ...updates,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            };

            await db.collection('users').doc(user.uid)
                .collection('preferences').doc('resources')
                .set(currentPrefs, { merge: true });


            return true;
        } catch (error) {
            console.error('Error saving preferences:', error);
            showNotification('Failed to save preferences. Please check your connection and try again.', 'error');
            window.handleFirebaseError && window.handleFirebaseError(error, 'ResourcesView.savePreferences');
            return false;
        }
    };

    const recordView = async (resourceId) => {
        if (!user?.uid) return;

        try {
            await db.collection('users').doc(user.uid)
                .collection('resourceViews').doc(resourceId)
                .set({
                    viewedAt: firebase.firestore.FieldValue.serverTimestamp()
                });
        } catch (error) {
            console.error('Error recording resource view:', error);
            // Non-critical: View tracking failed, but resource still opens
        }
    };

    const showNotification = (message, type) => {
        const existingToast = document.querySelector('.resource-toast');
        if (existingToast) {
            existingToast.remove();
        }
        
        const toast = document.createElement('div');
        toast.className = 'resource-toast';
        toast.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: ${type === 'success' ? '#4CAF50' : '#f44336'};
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            z-index: 10000;
            animation: slideIn 0.3s ease;
            box-shadow: 0 3px 6px rgba(0,0,0,0.2);
        `;
        toast.textContent = message;
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (document.body.contains(toast)) {
                    document.body.removeChild(toast);
                }
            }, 300);
        }, 3000);
    };

    const getFilteredResources = () => {
        if (!searchQuery) return resources;
        
        return resources.filter(resource => 
            resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            resource.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            resource.category.toLowerCase().includes(searchQuery.toLowerCase())
        );
    };

    const handleResourceClick = async (resource) => {
        if (!resource || !resource.id) {
            return;
        }

        // Navigate to dedicated resource viewer page
        window.location.href = `/resourceView.html?id=${resource.id}`;
    };

    // PHASE 4: My Library filtering logic
    const getLibraryResources = () => {
        let filtered = [...allResources];

        // Filter by type
        if (filterType !== 'all') {
            filtered = filtered.filter(r => r.type === filterType);
        }

        // Filter by status
        if (filterStatus === 'assigned') {
            filtered = filtered.filter(r => r.isAssigned === true);
        } else if (filterStatus === 'browsing') {
            filtered = filtered.filter(r => !r.isAssigned && progress[r.id]?.status === 'in_progress');
        } else if (filterStatus === 'completed') {
            filtered = filtered.filter(r => progress[r.id]?.status === 'completed');
        } else if (filterStatus === 'incomplete') {
            filtered = filtered.filter(r => r.isAssigned && progress[r.id]?.status !== 'completed');
        }
        // 'all' returns all filtered resources (no status filter)

        return filtered;
    };

    // Category Selection View
    if (!selectedCategory) {
        return (
            <div className="section-content">
                {/* PHASE 1: Recovery Resources Header - Fixed at top */}
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: isMobile ? '48px' : '56px',
                    background: '#058585',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: isMobile ? '0 8px' : '0 12px',
                    zIndex: 100,
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}>
                    {/* LEFT: Hamburger Menu + Recovery Resources Title */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '8px' : '12px' }}>
                        <button
                            onClick={() => {
                                if (window.GLRSApp?.utils?.triggerHaptic) window.GLRSApp.utils.triggerHaptic('light');
                                setShowSidebar(true);
                            }}
                            style={{
                                background: 'transparent',
                                border: 'none',
                                cursor: 'pointer',
                                padding: isMobile ? '6px' : '8px',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'background 0.2s',
                                minWidth: isMobile ? '44px' : '40px',
                                minHeight: isMobile ? '44px' : '40px'
                            }}
                            onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                            onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                        >
                            <i data-lucide="menu" style={{ width: isMobile ? '22px' : '24px', height: isMobile ? '22px' : '24px', color: '#FFFFFF' }}></i>
                        </button>

                        <h1 style={{
                            color: '#FFFFFF',
                            fontSize: isMobile ? '16px' : '18px',
                            fontWeight: 'bold',
                            margin: 0
                        }}>
                            Recovery Resources
                        </h1>
                    </div>

                    {/* RIGHT: Search Icon + Profile Icon */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '4px' : '8px' }}>
                        {/* Search Button (placeholder for future) */}
                        <button
                            style={{
                                background: 'transparent',
                                border: 'none',
                                cursor: 'pointer',
                                padding: isMobile ? '6px' : '8px',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'background 0.2s',
                                minWidth: isMobile ? '44px' : '40px',
                                minHeight: isMobile ? '44px' : '40px'
                            }}
                            onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                            onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                        >
                            <i data-lucide="search" style={{ width: isMobile ? '22px' : '24px', height: isMobile ? '22px' : '24px', color: '#FFFFFF' }}></i>
                        </button>

                        {/* Profile Button */}
                        <button
                            onClick={() => {
                                if (window.GLRSApp?.utils?.triggerHaptic) window.GLRSApp.utils.triggerHaptic('light');
                                if (window.navigateToTab) {
                                    window.navigateToTab('profile');
                                }
                            }}
                            style={{
                                background: 'transparent',
                                border: 'none',
                                cursor: 'pointer',
                                padding: isMobile ? '6px' : '8px',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'background 0.2s',
                                minWidth: isMobile ? '44px' : '40px',
                                minHeight: isMobile ? '44px' : '40px'
                            }}
                            onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                            onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                        >
                            <i data-lucide="user" style={{ width: isMobile ? '22px' : '24px', height: isMobile ? '22px' : '24px', color: '#FFFFFF' }}></i>
                        </button>
                    </div>
                </div>

                {/* PHASE 3: Tab Navigation - Fixed position, below header */}
                <div style={{
                    background: '#058585',
                    display: 'flex',
                    justifyContent: 'space-around',
                    alignItems: 'center',
                    height: '48px',
                    position: 'fixed',
                    top: '48px',
                    left: 0,
                    right: 0,
                    zIndex: 99,
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}>
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => {
                                if (window.GLRSApp?.utils?.triggerHaptic) window.GLRSApp.utils.triggerHaptic('light');
                                setActiveTab(tab.id);
                            }}
                            style={{
                                flex: 1,
                                height: '100%',
                                background: 'none',
                                border: 'none',
                                color: activeTab === tab.id ? '#FFFFFF' : 'rgba(255,255,255,0.7)',
                                fontSize: isMobile ? '11px' : '14px',
                                fontWeight: activeTab === tab.id ? 'bold' : '400',
                                cursor: 'pointer',
                                position: 'relative',
                                transition: 'all 0.2s',
                                display: 'flex',
                                flexDirection: isMobile ? 'column' : 'row',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: isMobile ? '2px' : '6px',
                                padding: isMobile ? '4px 2px' : '8px 4px'
                            }}
                        >
                            {isMobile ? (
                                <>
                                    <i data-lucide={tab.icon} style={{
                                        width: '16px',
                                        height: '16px',
                                        color: activeTab === tab.id ? '#FFFFFF' : 'rgba(255,255,255,0.7)',
                                        strokeWidth: activeTab === tab.id ? 2.5 : 2
                                    }}></i>
                                    <span style={{ fontSize: '11px', lineHeight: '1.2' }}>
                                        {tab.label === 'My Library' ? 'Library' :
                                         tab.label === 'Work & Career' ? 'Work' :
                                         tab.label === 'Crisis Toolkit' ? 'Crisis' :
                                         tab.label}
                                    </span>
                                </>
                            ) : (
                                <>
                                    <i data-lucide={tab.icon} style={{
                                        width: '18px',
                                        height: '18px',
                                        color: activeTab === tab.id ? '#FFFFFF' : 'rgba(255,255,255,0.7)',
                                        strokeWidth: activeTab === tab.id ? 2.5 : 2
                                    }}></i>
                                    <span>{tab.label}</span>
                                </>
                            )}
                            {activeTab === tab.id && (
                                <div style={{
                                    position: 'absolute',
                                    bottom: 0,
                                    left: '50%',
                                    transform: 'translateX(-50%)',
                                    width: '60%',
                                    height: '2px',
                                    background: '#FFFFFF'
                                }} />
                            )}
                        </button>
                    ))}
                </div>

                {/* PHASE 3: Content area with light gray background */}
                <div style={{
                    paddingTop: '96px',
                    background: '#F0F2F5',
                    minHeight: '100vh',
                    padding: isMobile ? '96px 12px 20px' : '96px 20px 20px'
                }}>
                    {/* PHASE 3: Tab Content Placeholders */}

                    {/* PHASE 4: My Library Tab - Full Implementation */}
                    {activeTab === 'library' && (() => {
                        const libraryResources = getLibraryResources();

                        return (
                            <>
                                {/* Filter Row */}
                                <div style={{
                                    background: '#FFFFFF',
                                    borderRadius: isMobile ? '12px' : '16px',
                                    padding: isMobile ? '12px' : '16px',
                                    marginBottom: '16px',
                                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                                    display: 'flex',
                                    flexDirection: isMobile ? 'column' : 'row',
                                    gap: isMobile ? '12px' : '16px',
                                    alignItems: isMobile ? 'stretch' : 'center'
                                }}>
                                    {/* Type Filter */}
                                    <div style={{ flex: isMobile ? '1' : '0 0 200px' }}>
                                        <label style={{
                                            display: 'block',
                                            fontSize: isMobile ? '12px' : '13px',
                                            color: '#666',
                                            marginBottom: '4px',
                                            fontWeight: '500'
                                        }}>
                                            Type
                                        </label>
                                        <select
                                            value={filterType}
                                            onChange={(e) => {
                                                if (window.GLRSApp?.utils?.triggerHaptic) window.GLRSApp.utils.triggerHaptic('light');
                                                setFilterType(e.target.value);
                                            }}
                                            style={{
                                                width: '100%',
                                                padding: isMobile ? '10px 12px' : '12px 16px',
                                                fontSize: isMobile ? '13px' : '14px',
                                                border: '1px solid #E0E0E0',
                                                borderRadius: '8px',
                                                background: '#FAFAFA',
                                                color: '#2c3e50',
                                                cursor: 'pointer',
                                                outline: 'none',
                                                transition: 'all 0.2s'
                                            }}
                                        >
                                            <option value="all">All Types</option>
                                            <option value="article">Articles</option>
                                            <option value="video">Videos</option>
                                            <option value="audio">Audio</option>
                                            <option value="worksheet">Worksheets</option>
                                            <option value="tool">Tools</option>
                                        </select>
                                    </div>

                                    {/* Status Filter */}
                                    <div style={{ flex: isMobile ? '1' : '0 0 200px' }}>
                                        <label style={{
                                            display: 'block',
                                            fontSize: isMobile ? '12px' : '13px',
                                            color: '#666',
                                            marginBottom: '4px',
                                            fontWeight: '500'
                                        }}>
                                            Status
                                        </label>
                                        <select
                                            value={filterStatus}
                                            onChange={(e) => {
                                                if (window.GLRSApp?.utils?.triggerHaptic) window.GLRSApp.utils.triggerHaptic('light');
                                                setFilterStatus(e.target.value);
                                            }}
                                            style={{
                                                width: '100%',
                                                padding: isMobile ? '10px 12px' : '12px 16px',
                                                fontSize: isMobile ? '13px' : '14px',
                                                border: '1px solid #E0E0E0',
                                                borderRadius: '8px',
                                                background: '#FAFAFA',
                                                color: '#2c3e50',
                                                cursor: 'pointer',
                                                outline: 'none',
                                                transition: 'all 0.2s'
                                            }}
                                        >
                                            <option value="all">All Resources</option>
                                            <option value="assigned">Assigned</option>
                                            <option value="browsing">Browsing</option>
                                            <option value="completed">Completed</option>
                                            <option value="incomplete">Incomplete</option>
                                        </select>
                                    </div>

                                    {/* Resource Count */}
                                    <div style={{
                                        flex: 1,
                                        display: 'flex',
                                        alignItems: isMobile ? 'flex-start' : 'flex-end',
                                        justifyContent: isMobile ? 'flex-start' : 'flex-end',
                                        paddingTop: isMobile ? '0' : '20px'
                                    }}>
                                        <span style={{
                                            fontSize: isMobile ? '13px' : '14px',
                                            color: '#666',
                                            fontWeight: '500'
                                        }}>
                                            {libraryResources.length} {libraryResources.length === 1 ? 'resource' : 'resources'}
                                        </span>
                                    </div>
                                </div>

                                {/* Resource Grid */}
                                {libraryResources.length > 0 ? (
                                    <div style={{
                                        display: 'grid',
                                        gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(320px, 1fr))',
                                        gap: isMobile ? '12px' : '16px'
                                    }}>
                                        {libraryResources.map(resource => {
                                            const resourceProgress = progress[resource.id];
                                            const isCompleted = resourceProgress?.status === 'completed';
                                            const progressPercent = resourceProgress?.progress || 0;

                                            return (
                                                <div
                                                    key={resource.id}
                                                    onClick={() => handleResourceClick(resource)}
                                                    style={{
                                                        background: '#FFFFFF',
                                                        borderRadius: isMobile ? '12px' : '16px',
                                                        padding: isMobile ? '12px' : '16px',
                                                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                                                        cursor: 'pointer',
                                                        transition: 'all 0.2s',
                                                        border: '1px solid transparent'
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                                                        e.currentTarget.style.border = '1px solid #058585';
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
                                                        e.currentTarget.style.border = '1px solid transparent';
                                                    }}
                                                >
                                                    {/* Type Badge + Status */}
                                                    <div style={{
                                                        display: 'flex',
                                                        justifyContent: 'space-between',
                                                        alignItems: 'center',
                                                        marginBottom: '8px'
                                                    }}>
                                                        <span style={{
                                                            fontSize: isMobile ? '11px' : '12px',
                                                            fontWeight: '600',
                                                            color: '#058585',
                                                            background: 'rgba(5, 133, 133, 0.1)',
                                                            padding: '4px 8px',
                                                            borderRadius: '6px',
                                                            textTransform: 'uppercase'
                                                        }}>
                                                            {resource.type || 'Article'}
                                                        </span>
                                                        {resource.isAssigned && (
                                                            <span style={{
                                                                fontSize: isMobile ? '11px' : '12px',
                                                                fontWeight: '600',
                                                                color: isCompleted ? '#4CAF50' : '#FF9800',
                                                                background: isCompleted ? 'rgba(76, 175, 80, 0.1)' : 'rgba(255, 152, 0, 0.1)',
                                                                padding: '4px 8px',
                                                                borderRadius: '6px'
                                                            }}>
                                                                {isCompleted ? '✓ Done' : '→ Assigned'}
                                                            </span>
                                                        )}
                                                    </div>

                                                    {/* Title */}
                                                    <h3 style={{
                                                        fontSize: isMobile ? '15px' : '16px',
                                                        fontWeight: '700',
                                                        color: '#2c3e50',
                                                        marginBottom: '8px',
                                                        lineHeight: '1.4'
                                                    }}>
                                                        {resource.title}
                                                    </h3>

                                                    {/* Description */}
                                                    {resource.description && (
                                                        <p style={{
                                                            fontSize: isMobile ? '13px' : '14px',
                                                            color: '#666',
                                                            lineHeight: '1.5',
                                                            marginBottom: '12px',
                                                            display: '-webkit-box',
                                                            WebkitLineClamp: 2,
                                                            WebkitBoxOrient: 'vertical',
                                                            overflow: 'hidden'
                                                        }}>
                                                            {resource.description}
                                                        </p>
                                                    )}

                                                    {/* Progress Bar (if in progress) */}
                                                    {resourceProgress && progressPercent > 0 && progressPercent < 100 && (
                                                        <div style={{ marginTop: '12px' }}>
                                                            <div style={{
                                                                display: 'flex',
                                                                justifyContent: 'space-between',
                                                                alignItems: 'center',
                                                                marginBottom: '4px'
                                                            }}>
                                                                <span style={{
                                                                    fontSize: isMobile ? '11px' : '12px',
                                                                    color: '#666',
                                                                    fontWeight: '500'
                                                                }}>
                                                                    Progress
                                                                </span>
                                                                <span style={{
                                                                    fontSize: isMobile ? '11px' : '12px',
                                                                    color: '#058585',
                                                                    fontWeight: '600'
                                                                }}>
                                                                    {progressPercent}%
                                                                </span>
                                                            </div>
                                                            <div style={{
                                                                width: '100%',
                                                                height: '6px',
                                                                background: '#E0E0E0',
                                                                borderRadius: '3px',
                                                                overflow: 'hidden'
                                                            }}>
                                                                <div style={{
                                                                    width: `${progressPercent}%`,
                                                                    height: '100%',
                                                                    background: 'linear-gradient(90deg, #058585 0%, #047373 100%)',
                                                                    transition: 'width 0.3s ease'
                                                                }} />
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Metadata */}
                                                    <div style={{
                                                        marginTop: '12px',
                                                        paddingTop: '12px',
                                                        borderTop: '1px solid #F0F0F0',
                                                        display: 'flex',
                                                        justifyContent: 'space-between',
                                                        alignItems: 'center'
                                                    }}>
                                                        <span style={{
                                                            fontSize: isMobile ? '11px' : '12px',
                                                            color: '#999'
                                                        }}>
                                                            {categories.find(c => c.id === resource.category)?.name || 'General'}
                                                        </span>
                                                        {resource.duration && (
                                                            <span style={{
                                                                fontSize: isMobile ? '11px' : '12px',
                                                                color: '#999'
                                                            }}>
                                                                {resource.duration}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    /* Empty State */
                                    <div style={{
                                        background: '#FFFFFF',
                                        borderRadius: isMobile ? '12px' : '16px',
                                        padding: isMobile ? '40px 20px' : '60px 40px',
                                        textAlign: 'center',
                                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                                    }}>
                                        <div style={{ fontSize: isMobile ? '48px' : '64px', marginBottom: '16px' }}>📭</div>
                                        <h3 style={{
                                            fontSize: isMobile ? '18px' : '20px',
                                            color: '#2c3e50',
                                            marginBottom: '8px',
                                            fontWeight: '700'
                                        }}>
                                            No Resources Found
                                        </h3>
                                        <p style={{
                                            fontSize: isMobile ? '14px' : '15px',
                                            color: '#666',
                                            lineHeight: '1.6',
                                            maxWidth: '400px',
                                            margin: '0 auto'
                                        }}>
                                            Try adjusting your filters to see more resources, or browse other tabs to discover new content.
                                        </p>
                                    </div>
                                )}
                            </>
                        );
                    })()}

                    {/* PHASE 5: Work & Career Tab - Full Implementation */}
                    {activeTab === 'work' && (() => {
                        // Define work-related subcategories
                        const workCategories = ['workplace-stress', 'professional-boundaries', 'career-rebuilding', 'first-responder-ptsd', 'workplace-disclosure'];

                        // Filter resources by work categories
                        const workResources = allResources.filter(r =>
                            workCategories.includes(r.subcategory) || r.category === 'work'
                        );

                        return (
                            <>
                                {/* Category Header - Teal Gradient */}
                                <div style={{
                                    background: 'linear-gradient(135deg, #058585 0%, #047373 100%)',
                                    borderRadius: isMobile ? '12px' : '16px',
                                    padding: isMobile ? '20px 16px' : '24px 20px',
                                    marginBottom: '16px',
                                    boxShadow: '0 2px 8px rgba(5, 133, 133, 0.2)',
                                    color: '#FFFFFF'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                                        <i data-lucide="briefcase" style={{
                                            width: isMobile ? '28px' : '32px',
                                            height: isMobile ? '28px' : '32px',
                                            color: '#FFFFFF',
                                            strokeWidth: 2.5
                                        }}></i>
                                        <h2 style={{
                                            fontSize: isMobile ? '20px' : '24px',
                                            fontWeight: '700',
                                            margin: 0,
                                            color: '#FFFFFF'
                                        }}>
                                            Work & Career Resources
                                        </h2>
                                    </div>
                                    <p style={{
                                        fontSize: isMobile ? '13px' : '14px',
                                        lineHeight: '1.6',
                                        margin: 0,
                                        color: 'rgba(255, 255, 255, 0.95)',
                                        maxWidth: '800px'
                                    }}>
                                        Resources for managing workplace stress, setting professional boundaries, rebuilding your career, and navigating workplace challenges during recovery. Special support for first responders and professionals.
                                    </p>
                                    <div style={{
                                        marginTop: '12px',
                                        fontSize: isMobile ? '12px' : '13px',
                                        color: 'rgba(255, 255, 255, 0.9)',
                                        fontWeight: '500'
                                    }}>
                                        {workResources.length} {workResources.length === 1 ? 'resource' : 'resources'} available
                                    </div>
                                </div>

                                {/* Resource Grid */}
                                {workResources.length > 0 ? (
                                    <div style={{
                                        display: 'grid',
                                        gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(320px, 1fr))',
                                        gap: isMobile ? '12px' : '16px'
                                    }}>
                                        {workResources.map(resource => {
                                            const resourceProgress = progress[resource.id];
                                            const isCompleted = resourceProgress?.status === 'completed';
                                            const progressPercent = resourceProgress?.progress || 0;

                                            return (
                                                <div
                                                    key={resource.id}
                                                    onClick={() => handleResourceClick(resource)}
                                                    style={{
                                                        background: '#FFFFFF',
                                                        borderRadius: isMobile ? '12px' : '16px',
                                                        padding: isMobile ? '12px' : '16px',
                                                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                                                        cursor: 'pointer',
                                                        transition: 'all 0.2s',
                                                        border: '1px solid transparent'
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                                                        e.currentTarget.style.border = '1px solid #058585';
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
                                                        e.currentTarget.style.border = '1px solid transparent';
                                                    }}
                                                >
                                                    {/* Type Badge + Status */}
                                                    <div style={{
                                                        display: 'flex',
                                                        justifyContent: 'space-between',
                                                        alignItems: 'center',
                                                        marginBottom: '8px'
                                                    }}>
                                                        <span style={{
                                                            fontSize: isMobile ? '11px' : '12px',
                                                            fontWeight: '600',
                                                            color: '#058585',
                                                            background: 'rgba(5, 133, 133, 0.1)',
                                                            padding: '4px 8px',
                                                            borderRadius: '6px',
                                                            textTransform: 'uppercase'
                                                        }}>
                                                            {resource.type || 'Article'}
                                                        </span>
                                                        {resource.isAssigned && (
                                                            <span style={{
                                                                fontSize: isMobile ? '11px' : '12px',
                                                                fontWeight: '600',
                                                                color: isCompleted ? '#4CAF50' : '#FF9800',
                                                                background: isCompleted ? 'rgba(76, 175, 80, 0.1)' : 'rgba(255, 152, 0, 0.1)',
                                                                padding: '4px 8px',
                                                                borderRadius: '6px'
                                                            }}>
                                                                {isCompleted ? '✓ Done' : '→ Assigned'}
                                                            </span>
                                                        )}
                                                    </div>

                                                    {/* Title */}
                                                    <h3 style={{
                                                        fontSize: isMobile ? '15px' : '16px',
                                                        fontWeight: '700',
                                                        color: '#2c3e50',
                                                        marginBottom: '8px',
                                                        lineHeight: '1.4'
                                                    }}>
                                                        {resource.title}
                                                    </h3>

                                                    {/* Description */}
                                                    {resource.description && (
                                                        <p style={{
                                                            fontSize: isMobile ? '13px' : '14px',
                                                            color: '#666',
                                                            lineHeight: '1.5',
                                                            marginBottom: '12px',
                                                            display: '-webkit-box',
                                                            WebkitLineClamp: 2,
                                                            WebkitBoxOrient: 'vertical',
                                                            overflow: 'hidden'
                                                        }}>
                                                            {resource.description}
                                                        </p>
                                                    )}

                                                    {/* Progress Bar (if in progress) */}
                                                    {resourceProgress && progressPercent > 0 && progressPercent < 100 && (
                                                        <div style={{ marginTop: '12px' }}>
                                                            <div style={{
                                                                display: 'flex',
                                                                justifyContent: 'space-between',
                                                                alignItems: 'center',
                                                                marginBottom: '4px'
                                                            }}>
                                                                <span style={{
                                                                    fontSize: isMobile ? '11px' : '12px',
                                                                    color: '#666',
                                                                    fontWeight: '500'
                                                                }}>
                                                                    Progress
                                                                </span>
                                                                <span style={{
                                                                    fontSize: isMobile ? '11px' : '12px',
                                                                    color: '#058585',
                                                                    fontWeight: '600'
                                                                }}>
                                                                    {progressPercent}%
                                                                </span>
                                                            </div>
                                                            <div style={{
                                                                width: '100%',
                                                                height: '6px',
                                                                background: '#E0E0E0',
                                                                borderRadius: '3px',
                                                                overflow: 'hidden'
                                                            }}>
                                                                <div style={{
                                                                    width: `${progressPercent}%`,
                                                                    height: '100%',
                                                                    background: 'linear-gradient(90deg, #058585 0%, #047373 100%)',
                                                                    transition: 'width 0.3s ease'
                                                                }} />
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Metadata */}
                                                    <div style={{
                                                        marginTop: '12px',
                                                        paddingTop: '12px',
                                                        borderTop: '1px solid #F0F0F0',
                                                        display: 'flex',
                                                        justifyContent: 'space-between',
                                                        alignItems: 'center'
                                                    }}>
                                                        <span style={{
                                                            fontSize: isMobile ? '11px' : '12px',
                                                            color: '#999'
                                                        }}>
                                                            {categories.find(c => c.id === resource.category)?.name || 'Work & Career'}
                                                        </span>
                                                        {resource.duration && (
                                                            <span style={{
                                                                fontSize: isMobile ? '11px' : '12px',
                                                                color: '#999'
                                                            }}>
                                                                {resource.duration}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    /* Empty State */
                                    <div style={{
                                        background: '#FFFFFF',
                                        borderRadius: isMobile ? '12px' : '16px',
                                        padding: isMobile ? '40px 20px' : '60px 40px',
                                        textAlign: 'center',
                                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                                    }}>
                                        <i data-lucide="briefcase" style={{
                                            width: isMobile ? '48px' : '64px',
                                            height: isMobile ? '48px' : '64px',
                                            color: '#d1d5db',
                                            strokeWidth: 1.5,
                                            margin: '0 auto 16px'
                                        }}></i>
                                        <h3 style={{
                                            fontSize: isMobile ? '18px' : '20px',
                                            color: '#2c3e50',
                                            marginBottom: '8px',
                                            fontWeight: '700'
                                        }}>
                                            No Work Resources Yet
                                        </h3>
                                        <p style={{
                                            fontSize: isMobile ? '14px' : '15px',
                                            color: '#666',
                                            lineHeight: '1.6',
                                            maxWidth: '400px',
                                            margin: '0 auto'
                                        }}>
                                            Work and career resources will appear here as they become available. Check back soon or browse other categories.
                                        </p>
                                    </div>
                                )}
                            </>
                        );
                    })()}

                    {/* PHASE 6: Wellness Tab - Full Implementation */}
                    {activeTab === 'wellness' && (() => {
                        // Define wellness-related subcategories
                        const wellnessCategories = ['sleep-hygiene', 'nutrition', 'exercise', 'anxiety-management', 'depression-support', 'mat-information', 'mindfulness'];

                        // Filter resources by wellness categories
                        const wellnessResources = allResources.filter(r =>
                            wellnessCategories.includes(r.subcategory) || r.category === 'wellness' || r.category === 'coping'
                        );

                        return (
                            <>
                                {/* Category Header - Teal Gradient */}
                                <div style={{
                                    background: 'linear-gradient(135deg, #058585 0%, #047373 100%)',
                                    borderRadius: isMobile ? '12px' : '16px',
                                    padding: isMobile ? '20px 16px' : '24px 20px',
                                    marginBottom: '16px',
                                    boxShadow: '0 2px 8px rgba(5, 133, 133, 0.2)',
                                    color: '#FFFFFF'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                                        <i data-lucide="heart" style={{
                                            width: isMobile ? '28px' : '32px',
                                            height: isMobile ? '28px' : '32px',
                                            color: '#FFFFFF',
                                            strokeWidth: 2.5
                                        }}></i>
                                        <h2 style={{
                                            fontSize: isMobile ? '20px' : '24px',
                                            fontWeight: '700',
                                            margin: 0,
                                            color: '#FFFFFF'
                                        }}>
                                            Wellness Resources
                                        </h2>
                                    </div>
                                    <p style={{
                                        fontSize: isMobile ? '13px' : '14px',
                                        lineHeight: '1.6',
                                        margin: 0,
                                        color: 'rgba(255, 255, 255, 0.95)',
                                        maxWidth: '800px'
                                    }}>
                                        Support your mental and physical health with resources on sleep hygiene, nutrition, exercise, anxiety management, depression support, mindfulness practices, and holistic wellness approaches for your recovery journey.
                                    </p>
                                    <div style={{
                                        marginTop: '12px',
                                        fontSize: isMobile ? '12px' : '13px',
                                        color: 'rgba(255, 255, 255, 0.9)',
                                        fontWeight: '500'
                                    }}>
                                        {wellnessResources.length} {wellnessResources.length === 1 ? 'resource' : 'resources'} available
                                    </div>
                                </div>

                                {/* Resource Grid */}
                                {wellnessResources.length > 0 ? (
                                    <div style={{
                                        display: 'grid',
                                        gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(320px, 1fr))',
                                        gap: isMobile ? '12px' : '16px'
                                    }}>
                                        {wellnessResources.map(resource => {
                                            const resourceProgress = progress[resource.id];
                                            const isCompleted = resourceProgress?.status === 'completed';
                                            const progressPercent = resourceProgress?.progress || 0;

                                            return (
                                                <div
                                                    key={resource.id}
                                                    onClick={() => handleResourceClick(resource)}
                                                    style={{
                                                        background: '#FFFFFF',
                                                        borderRadius: isMobile ? '12px' : '16px',
                                                        padding: isMobile ? '12px' : '16px',
                                                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                                                        cursor: 'pointer',
                                                        transition: 'all 0.2s',
                                                        border: '1px solid transparent'
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                                                        e.currentTarget.style.border = '1px solid #058585';
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
                                                        e.currentTarget.style.border = '1px solid transparent';
                                                    }}
                                                >
                                                    {/* Type Badge + Status */}
                                                    <div style={{
                                                        display: 'flex',
                                                        justifyContent: 'space-between',
                                                        alignItems: 'center',
                                                        marginBottom: '8px'
                                                    }}>
                                                        <span style={{
                                                            fontSize: isMobile ? '11px' : '12px',
                                                            fontWeight: '600',
                                                            color: '#058585',
                                                            background: 'rgba(5, 133, 133, 0.1)',
                                                            padding: '4px 8px',
                                                            borderRadius: '6px',
                                                            textTransform: 'uppercase'
                                                        }}>
                                                            {resource.type || 'Article'}
                                                        </span>
                                                        {resource.isAssigned && (
                                                            <span style={{
                                                                fontSize: isMobile ? '11px' : '12px',
                                                                fontWeight: '600',
                                                                color: isCompleted ? '#4CAF50' : '#FF9800',
                                                                background: isCompleted ? 'rgba(76, 175, 80, 0.1)' : 'rgba(255, 152, 0, 0.1)',
                                                                padding: '4px 8px',
                                                                borderRadius: '6px'
                                                            }}>
                                                                {isCompleted ? '✓ Done' : '→ Assigned'}
                                                            </span>
                                                        )}
                                                    </div>

                                                    {/* Title */}
                                                    <h3 style={{
                                                        fontSize: isMobile ? '15px' : '16px',
                                                        fontWeight: '700',
                                                        color: '#2c3e50',
                                                        marginBottom: '8px',
                                                        lineHeight: '1.4'
                                                    }}>
                                                        {resource.title}
                                                    </h3>

                                                    {/* Description */}
                                                    {resource.description && (
                                                        <p style={{
                                                            fontSize: isMobile ? '13px' : '14px',
                                                            color: '#666',
                                                            lineHeight: '1.5',
                                                            marginBottom: '12px',
                                                            display: '-webkit-box',
                                                            WebkitLineClamp: 2,
                                                            WebkitBoxOrient: 'vertical',
                                                            overflow: 'hidden'
                                                        }}>
                                                            {resource.description}
                                                        </p>
                                                    )}

                                                    {/* Progress Bar (if in progress) */}
                                                    {resourceProgress && progressPercent > 0 && progressPercent < 100 && (
                                                        <div style={{ marginTop: '12px' }}>
                                                            <div style={{
                                                                display: 'flex',
                                                                justifyContent: 'space-between',
                                                                alignItems: 'center',
                                                                marginBottom: '4px'
                                                            }}>
                                                                <span style={{
                                                                    fontSize: isMobile ? '11px' : '12px',
                                                                    color: '#666',
                                                                    fontWeight: '500'
                                                                }}>
                                                                    Progress
                                                                </span>
                                                                <span style={{
                                                                    fontSize: isMobile ? '11px' : '12px',
                                                                    color: '#058585',
                                                                    fontWeight: '600'
                                                                }}>
                                                                    {progressPercent}%
                                                                </span>
                                                            </div>
                                                            <div style={{
                                                                width: '100%',
                                                                height: '6px',
                                                                background: '#E0E0E0',
                                                                borderRadius: '3px',
                                                                overflow: 'hidden'
                                                            }}>
                                                                <div style={{
                                                                    width: `${progressPercent}%`,
                                                                    height: '100%',
                                                                    background: 'linear-gradient(90deg, #058585 0%, #047373 100%)',
                                                                    transition: 'width 0.3s ease'
                                                                }} />
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Metadata */}
                                                    <div style={{
                                                        marginTop: '12px',
                                                        paddingTop: '12px',
                                                        borderTop: '1px solid #F0F0F0',
                                                        display: 'flex',
                                                        justifyContent: 'space-between',
                                                        alignItems: 'center'
                                                    }}>
                                                        <span style={{
                                                            fontSize: isMobile ? '11px' : '12px',
                                                            color: '#999'
                                                        }}>
                                                            {categories.find(c => c.id === resource.category)?.name || 'Wellness'}
                                                        </span>
                                                        {resource.duration && (
                                                            <span style={{
                                                                fontSize: isMobile ? '11px' : '12px',
                                                                color: '#999'
                                                            }}>
                                                                {resource.duration}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    /* Empty State */
                                    <div style={{
                                        background: '#FFFFFF',
                                        borderRadius: isMobile ? '12px' : '16px',
                                        padding: isMobile ? '40px 20px' : '60px 40px',
                                        textAlign: 'center',
                                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                                    }}>
                                        <i data-lucide="heart" style={{
                                            width: isMobile ? '48px' : '64px',
                                            height: isMobile ? '48px' : '64px',
                                            color: '#d1d5db',
                                            strokeWidth: 1.5,
                                            margin: '0 auto 16px'
                                        }}></i>
                                        <h3 style={{
                                            fontSize: isMobile ? '18px' : '20px',
                                            color: '#2c3e50',
                                            marginBottom: '8px',
                                            fontWeight: '700'
                                        }}>
                                            No Wellness Resources Yet
                                        </h3>
                                        <p style={{
                                            fontSize: isMobile ? '14px' : '15px',
                                            color: '#666',
                                            lineHeight: '1.6',
                                            maxWidth: '400px',
                                            margin: '0 auto'
                                        }}>
                                            Wellness resources will appear here as they become available. Check back soon or browse other categories.
                                        </p>
                                    </div>
                                )}
                            </>
                        );
                    })()}

                    {/* PHASE 7: Relationships Tab - Full Implementation */}
                    {activeTab === 'relationships' && (() => {
                        // Define relationship-related subcategories
                        const relationshipCategories = ['family-repair', 'communication-skills', 'making-amends', 'healthy-boundaries', 'dating-in-recovery', 'parenting'];

                        // Filter resources by relationship categories
                        const relationshipResources = allResources.filter(r =>
                            relationshipCategories.includes(r.subcategory) || r.category === 'relationships' || r.category === 'support'
                        );

                        return (
                            <>
                                {/* Category Header - Teal Gradient */}
                                <div style={{
                                    background: 'linear-gradient(135deg, #058585 0%, #047373 100%)',
                                    borderRadius: isMobile ? '12px' : '16px',
                                    padding: isMobile ? '20px 16px' : '24px 20px',
                                    marginBottom: '16px',
                                    boxShadow: '0 2px 8px rgba(5, 133, 133, 0.2)',
                                    color: '#FFFFFF'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                                        <i data-lucide="users" style={{
                                            width: isMobile ? '28px' : '32px',
                                            height: isMobile ? '28px' : '32px',
                                            color: '#FFFFFF',
                                            strokeWidth: 2.5
                                        }}></i>
                                        <h2 style={{
                                            fontSize: isMobile ? '20px' : '24px',
                                            fontWeight: '700',
                                            margin: 0,
                                            color: '#FFFFFF'
                                        }}>
                                            Relationship Resources
                                        </h2>
                                    </div>
                                    <p style={{
                                        fontSize: isMobile ? '13px' : '14px',
                                        lineHeight: '1.6',
                                        margin: 0,
                                        color: 'rgba(255, 255, 255, 0.95)',
                                        maxWidth: '800px'
                                    }}>
                                        Rebuild and strengthen relationships with family, friends, and partners. Learn communication skills, set healthy boundaries, make amends, navigate dating in recovery, and build the supportive connections you deserve.
                                    </p>
                                    <div style={{
                                        marginTop: '12px',
                                        fontSize: isMobile ? '12px' : '13px',
                                        color: 'rgba(255, 255, 255, 0.9)',
                                        fontWeight: '500'
                                    }}>
                                        {relationshipResources.length} {relationshipResources.length === 1 ? 'resource' : 'resources'} available
                                    </div>
                                </div>

                                {/* Resource Grid */}
                                {relationshipResources.length > 0 ? (
                                    <div style={{
                                        display: 'grid',
                                        gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(320px, 1fr))',
                                        gap: isMobile ? '12px' : '16px'
                                    }}>
                                        {relationshipResources.map(resource => {
                                            const resourceProgress = progress[resource.id];
                                            const isCompleted = resourceProgress?.status === 'completed';
                                            const progressPercent = resourceProgress?.progress || 0;

                                            return (
                                                <div
                                                    key={resource.id}
                                                    onClick={() => handleResourceClick(resource)}
                                                    style={{
                                                        background: '#FFFFFF',
                                                        borderRadius: isMobile ? '12px' : '16px',
                                                        padding: isMobile ? '12px' : '16px',
                                                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                                                        cursor: 'pointer',
                                                        transition: 'all 0.2s',
                                                        border: '1px solid transparent'
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                                                        e.currentTarget.style.border = '1px solid #058585';
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
                                                        e.currentTarget.style.border = '1px solid transparent';
                                                    }}
                                                >
                                                    {/* Type Badge + Status */}
                                                    <div style={{
                                                        display: 'flex',
                                                        justifyContent: 'space-between',
                                                        alignItems: 'center',
                                                        marginBottom: '8px'
                                                    }}>
                                                        <span style={{
                                                            fontSize: isMobile ? '11px' : '12px',
                                                            fontWeight: '600',
                                                            color: '#058585',
                                                            background: 'rgba(5, 133, 133, 0.1)',
                                                            padding: '4px 8px',
                                                            borderRadius: '6px',
                                                            textTransform: 'uppercase'
                                                        }}>
                                                            {resource.type || 'Article'}
                                                        </span>
                                                        {resource.isAssigned && (
                                                            <span style={{
                                                                fontSize: isMobile ? '11px' : '12px',
                                                                fontWeight: '600',
                                                                color: isCompleted ? '#4CAF50' : '#FF9800',
                                                                background: isCompleted ? 'rgba(76, 175, 80, 0.1)' : 'rgba(255, 152, 0, 0.1)',
                                                                padding: '4px 8px',
                                                                borderRadius: '6px'
                                                            }}>
                                                                {isCompleted ? '✓ Done' : '→ Assigned'}
                                                            </span>
                                                        )}
                                                    </div>

                                                    {/* Title */}
                                                    <h3 style={{
                                                        fontSize: isMobile ? '15px' : '16px',
                                                        fontWeight: '700',
                                                        color: '#2c3e50',
                                                        marginBottom: '8px',
                                                        lineHeight: '1.4'
                                                    }}>
                                                        {resource.title}
                                                    </h3>

                                                    {/* Description */}
                                                    {resource.description && (
                                                        <p style={{
                                                            fontSize: isMobile ? '13px' : '14px',
                                                            color: '#666',
                                                            lineHeight: '1.5',
                                                            marginBottom: '12px',
                                                            display: '-webkit-box',
                                                            WebkitLineClamp: 2,
                                                            WebkitBoxOrient: 'vertical',
                                                            overflow: 'hidden'
                                                        }}>
                                                            {resource.description}
                                                        </p>
                                                    )}

                                                    {/* Progress Bar (if in progress) */}
                                                    {resourceProgress && progressPercent > 0 && progressPercent < 100 && (
                                                        <div style={{ marginTop: '12px' }}>
                                                            <div style={{
                                                                display: 'flex',
                                                                justifyContent: 'space-between',
                                                                alignItems: 'center',
                                                                marginBottom: '4px'
                                                            }}>
                                                                <span style={{
                                                                    fontSize: isMobile ? '11px' : '12px',
                                                                    color: '#666',
                                                                    fontWeight: '500'
                                                                }}>
                                                                    Progress
                                                                </span>
                                                                <span style={{
                                                                    fontSize: isMobile ? '11px' : '12px',
                                                                    color: '#058585',
                                                                    fontWeight: '600'
                                                                }}>
                                                                    {progressPercent}%
                                                                </span>
                                                            </div>
                                                            <div style={{
                                                                width: '100%',
                                                                height: '6px',
                                                                background: '#E0E0E0',
                                                                borderRadius: '3px',
                                                                overflow: 'hidden'
                                                            }}>
                                                                <div style={{
                                                                    width: `${progressPercent}%`,
                                                                    height: '100%',
                                                                    background: 'linear-gradient(90deg, #058585 0%, #047373 100%)',
                                                                    transition: 'width 0.3s ease'
                                                                }} />
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Metadata */}
                                                    <div style={{
                                                        marginTop: '12px',
                                                        paddingTop: '12px',
                                                        borderTop: '1px solid #F0F0F0',
                                                        display: 'flex',
                                                        justifyContent: 'space-between',
                                                        alignItems: 'center'
                                                    }}>
                                                        <span style={{
                                                            fontSize: isMobile ? '11px' : '12px',
                                                            color: '#999'
                                                        }}>
                                                            {categories.find(c => c.id === resource.category)?.name || 'Relationships'}
                                                        </span>
                                                        {resource.duration && (
                                                            <span style={{
                                                                fontSize: isMobile ? '11px' : '12px',
                                                                color: '#999'
                                                            }}>
                                                                {resource.duration}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    /* Empty State */
                                    <div style={{
                                        background: '#FFFFFF',
                                        borderRadius: isMobile ? '12px' : '16px',
                                        padding: isMobile ? '40px 20px' : '60px 40px',
                                        textAlign: 'center',
                                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                                    }}>
                                        <i data-lucide="users" style={{
                                            width: isMobile ? '48px' : '64px',
                                            height: isMobile ? '48px' : '64px',
                                            color: '#d1d5db',
                                            strokeWidth: 1.5,
                                            margin: '0 auto 16px'
                                        }}></i>
                                        <h3 style={{
                                            fontSize: isMobile ? '18px' : '20px',
                                            color: '#2c3e50',
                                            marginBottom: '8px',
                                            fontWeight: '700'
                                        }}>
                                            No Relationship Resources Yet
                                        </h3>
                                        <p style={{
                                            fontSize: isMobile ? '14px' : '15px',
                                            color: '#666',
                                            lineHeight: '1.6',
                                            maxWidth: '400px',
                                            margin: '0 auto'
                                        }}>
                                            Relationship resources will appear here as they become available. Check back soon or browse other categories.
                                        </p>
                                    </div>
                                )}
                            </>
                        );
                    })()}

                    {/* PHASE 8: Crisis Toolkit Tab - Full Implementation */}
                    {activeTab === 'crisis' && (() => {
                        // Define crisis-related subcategories
                        const crisisCategories = ['breathing-exercises', 'grounding-techniques', 'crisis-hotlines', 'relapse-prevention', 'emergency-planning'];

                        // Filter resources by crisis categories
                        const crisisResources = allResources.filter(r =>
                            crisisCategories.includes(r.subcategory) || r.category === 'crisis' || r.category === 'relapse'
                        );

                        return (
                            <>
                                {/* Category Header - RED Gradient (Urgency) */}
                                <div style={{
                                    background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
                                    borderRadius: isMobile ? '12px' : '16px',
                                    padding: isMobile ? '20px 16px' : '24px 20px',
                                    marginBottom: '16px',
                                    boxShadow: '0 2px 8px rgba(220, 38, 38, 0.3)',
                                    color: '#FFFFFF'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                                        <i data-lucide="shield-alert" style={{
                                            width: isMobile ? '28px' : '32px',
                                            height: isMobile ? '28px' : '32px',
                                            color: '#FFFFFF',
                                            strokeWidth: 2.5
                                        }}></i>
                                        <h2 style={{
                                            fontSize: isMobile ? '20px' : '24px',
                                            fontWeight: '700',
                                            margin: 0,
                                            color: '#FFFFFF'
                                        }}>
                                            Crisis Toolkit
                                        </h2>
                                    </div>
                                    <p style={{
                                        fontSize: isMobile ? '13px' : '14px',
                                        lineHeight: '1.6',
                                        margin: 0,
                                        color: 'rgba(255, 255, 255, 0.95)',
                                        maxWidth: '800px'
                                    }}>
                                        Emergency resources, crisis hotlines, immediate coping strategies, and 24/7 support for urgent situations. You're not alone - help is always available.
                                    </p>
                                    <div style={{
                                        marginTop: '12px',
                                        fontSize: isMobile ? '12px' : '13px',
                                        color: 'rgba(255, 255, 255, 0.9)',
                                        fontWeight: '500'
                                    }}>
                                        {crisisResources.length} {crisisResources.length === 1 ? 'resource' : 'resources'} available
                                    </div>
                                </div>

                                {/* Quick Tools Section */}
                                <div style={{
                                    background: '#FFFFFF',
                                    borderRadius: isMobile ? '12px' : '16px',
                                    padding: isMobile ? '16px' : '20px',
                                    marginBottom: '16px',
                                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                                }}>
                                    <h3 style={{
                                        fontSize: isMobile ? '16px' : '18px',
                                        fontWeight: '700',
                                        color: '#2c3e50',
                                        marginBottom: '12px',
                                        marginTop: 0
                                    }}>
                                        Quick Crisis Tools
                                    </h3>
                                    <div style={{
                                        display: 'grid',
                                        gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
                                        gap: isMobile ? '12px' : '16px'
                                    }}>
                                        {/* Box Breathing */}
                                        <button
                                            onClick={() => {
                                                if (window.GLRSApp?.utils?.triggerHaptic) window.GLRSApp.utils.triggerHaptic('light');
                                                alert('Box Breathing Exercise:\n\n1. Breathe in for 4 seconds\n2. Hold for 4 seconds\n3. Breathe out for 4 seconds\n4. Hold for 4 seconds\n5. Repeat 4 times\n\nFocus on your breath and count slowly.');
                                            }}
                                            style={{
                                                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                                                border: 'none',
                                                borderRadius: '12px',
                                                padding: isMobile ? '16px' : '20px',
                                                color: '#FFFFFF',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s',
                                                textAlign: 'left',
                                                boxShadow: '0 2px 4px rgba(59, 130, 246, 0.3)'
                                            }}
                                            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                                            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                                        >
                                            <i data-lucide="wind" style={{
                                                width: '24px',
                                                height: '24px',
                                                color: '#FFFFFF',
                                                marginBottom: '8px',
                                                display: 'block'
                                            }}></i>
                                            <div style={{
                                                fontSize: isMobile ? '14px' : '15px',
                                                fontWeight: '600',
                                                marginBottom: '4px'
                                            }}>
                                                Box Breathing
                                            </div>
                                            <div style={{
                                                fontSize: isMobile ? '12px' : '13px',
                                                opacity: 0.9
                                            }}>
                                                4-4-4-4 breathing pattern
                                            </div>
                                        </button>

                                        {/* 5-4-3-2-1 Grounding */}
                                        <button
                                            onClick={() => {
                                                if (window.GLRSApp?.utils?.triggerHaptic) window.GLRSApp.utils.triggerHaptic('light');
                                                alert('5-4-3-2-1 Grounding Technique:\n\nName out loud:\n5 things you can SEE\n4 things you can TOUCH\n3 things you can HEAR\n2 things you can SMELL\n1 thing you can TASTE\n\nThis brings you back to the present moment.');
                                            }}
                                            style={{
                                                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                                border: 'none',
                                                borderRadius: '12px',
                                                padding: isMobile ? '16px' : '20px',
                                                color: '#FFFFFF',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s',
                                                textAlign: 'left',
                                                boxShadow: '0 2px 4px rgba(16, 185, 129, 0.3)'
                                            }}
                                            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                                            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                                        >
                                            <i data-lucide="hand" style={{
                                                width: '24px',
                                                height: '24px',
                                                color: '#FFFFFF',
                                                marginBottom: '8px',
                                                display: 'block'
                                            }}></i>
                                            <div style={{
                                                fontSize: isMobile ? '14px' : '15px',
                                                fontWeight: '600',
                                                marginBottom: '4px'
                                            }}>
                                                5-4-3-2-1 Grounding
                                            </div>
                                            <div style={{
                                                fontSize: isMobile ? '12px' : '13px',
                                                opacity: 0.9
                                            }}>
                                                Engage your senses
                                            </div>
                                        </button>

                                        {/* Crisis Hotline */}
                                        <button
                                            onClick={() => {
                                                if (window.GLRSApp?.utils?.triggerHaptic) window.GLRSApp.utils.triggerHaptic('medium');
                                                window.location.href = 'tel:988';
                                            }}
                                            style={{
                                                background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
                                                border: 'none',
                                                borderRadius: '12px',
                                                padding: isMobile ? '16px' : '20px',
                                                color: '#FFFFFF',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s',
                                                textAlign: 'left',
                                                boxShadow: '0 2px 4px rgba(220, 38, 38, 0.3)'
                                            }}
                                            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                                            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                                        >
                                            <i data-lucide="phone" style={{
                                                width: '24px',
                                                height: '24px',
                                                color: '#FFFFFF',
                                                marginBottom: '8px',
                                                display: 'block'
                                            }}></i>
                                            <div style={{
                                                fontSize: isMobile ? '14px' : '15px',
                                                fontWeight: '600',
                                                marginBottom: '4px'
                                            }}>
                                                Crisis Hotline
                                            </div>
                                            <div style={{
                                                fontSize: isMobile ? '12px' : '13px',
                                                opacity: 0.9
                                            }}>
                                                988 - 24/7 support
                                            </div>
                                        </button>

                                        {/* Find a Meeting */}
                                        <button
                                            onClick={() => {
                                                if (window.GLRSApp?.utils?.triggerHaptic) window.GLRSApp.utils.triggerHaptic('light');
                                                if (window.navigateToTab) {
                                                    window.navigateToTab('connect');
                                                }
                                            }}
                                            style={{
                                                background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                                                border: 'none',
                                                borderRadius: '12px',
                                                padding: isMobile ? '16px' : '20px',
                                                color: '#FFFFFF',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s',
                                                textAlign: 'left',
                                                boxShadow: '0 2px 4px rgba(139, 92, 246, 0.3)'
                                            }}
                                            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                                            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                                        >
                                            <i data-lucide="map-pin" style={{
                                                width: '24px',
                                                height: '24px',
                                                color: '#FFFFFF',
                                                marginBottom: '8px',
                                                display: 'block'
                                            }}></i>
                                            <div style={{
                                                fontSize: isMobile ? '14px' : '15px',
                                                fontWeight: '600',
                                                marginBottom: '4px'
                                            }}>
                                                Find a Meeting
                                            </div>
                                            <div style={{
                                                fontSize: isMobile ? '12px' : '13px',
                                                opacity: 0.9
                                            }}>
                                                Connect with others
                                            </div>
                                        </button>
                                    </div>
                                </div>

                                {/* Resource Grid */}
                                {crisisResources.length > 0 ? (
                                    <div style={{
                                        display: 'grid',
                                        gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(320px, 1fr))',
                                        gap: isMobile ? '12px' : '16px'
                                    }}>
                                        {crisisResources.map(resource => {
                                            const resourceProgress = progress[resource.id];
                                            const isCompleted = resourceProgress?.status === 'completed';
                                            const progressPercent = resourceProgress?.progress || 0;

                                            return (
                                                <div
                                                    key={resource.id}
                                                    onClick={() => handleResourceClick(resource)}
                                                    style={{
                                                        background: '#FFFFFF',
                                                        borderRadius: isMobile ? '12px' : '16px',
                                                        padding: isMobile ? '12px' : '16px',
                                                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                                                        cursor: 'pointer',
                                                        transition: 'all 0.2s',
                                                        border: '1px solid transparent'
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                                                        e.currentTarget.style.border = '1px solid #dc2626';
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
                                                        e.currentTarget.style.border = '1px solid transparent';
                                                    }}
                                                >
                                                    {/* Type Badge + Status */}
                                                    <div style={{
                                                        display: 'flex',
                                                        justifyContent: 'space-between',
                                                        alignItems: 'center',
                                                        marginBottom: '8px'
                                                    }}>
                                                        <span style={{
                                                            fontSize: isMobile ? '11px' : '12px',
                                                            fontWeight: '600',
                                                            color: '#dc2626',
                                                            background: 'rgba(220, 38, 38, 0.1)',
                                                            padding: '4px 8px',
                                                            borderRadius: '6px',
                                                            textTransform: 'uppercase'
                                                        }}>
                                                            {resource.type || 'Article'}
                                                        </span>
                                                        {resource.isAssigned && (
                                                            <span style={{
                                                                fontSize: isMobile ? '11px' : '12px',
                                                                fontWeight: '600',
                                                                color: isCompleted ? '#4CAF50' : '#FF9800',
                                                                background: isCompleted ? 'rgba(76, 175, 80, 0.1)' : 'rgba(255, 152, 0, 0.1)',
                                                                padding: '4px 8px',
                                                                borderRadius: '6px'
                                                            }}>
                                                                {isCompleted ? '✓ Done' : '→ Assigned'}
                                                            </span>
                                                        )}
                                                    </div>

                                                    {/* Title */}
                                                    <h3 style={{
                                                        fontSize: isMobile ? '15px' : '16px',
                                                        fontWeight: '700',
                                                        color: '#2c3e50',
                                                        marginBottom: '8px',
                                                        lineHeight: '1.4'
                                                    }}>
                                                        {resource.title}
                                                    </h3>

                                                    {/* Description */}
                                                    {resource.description && (
                                                        <p style={{
                                                            fontSize: isMobile ? '13px' : '14px',
                                                            color: '#666',
                                                            lineHeight: '1.5',
                                                            marginBottom: '12px',
                                                            display: '-webkit-box',
                                                            WebkitLineClamp: 2,
                                                            WebkitBoxOrient: 'vertical',
                                                            overflow: 'hidden'
                                                        }}>
                                                            {resource.description}
                                                        </p>
                                                    )}

                                                    {/* Progress Bar (if in progress) */}
                                                    {resourceProgress && progressPercent > 0 && progressPercent < 100 && (
                                                        <div style={{ marginTop: '12px' }}>
                                                            <div style={{
                                                                display: 'flex',
                                                                justifyContent: 'space-between',
                                                                alignItems: 'center',
                                                                marginBottom: '4px'
                                                            }}>
                                                                <span style={{
                                                                    fontSize: isMobile ? '11px' : '12px',
                                                                    color: '#666',
                                                                    fontWeight: '500'
                                                                }}>
                                                                    Progress
                                                                </span>
                                                                <span style={{
                                                                    fontSize: isMobile ? '11px' : '12px',
                                                                    color: '#dc2626',
                                                                    fontWeight: '600'
                                                                }}>
                                                                    {progressPercent}%
                                                                </span>
                                                            </div>
                                                            <div style={{
                                                                width: '100%',
                                                                height: '6px',
                                                                background: '#E0E0E0',
                                                                borderRadius: '3px',
                                                                overflow: 'hidden'
                                                            }}>
                                                                <div style={{
                                                                    width: `${progressPercent}%`,
                                                                    height: '100%',
                                                                    background: 'linear-gradient(90deg, #dc2626 0%, #b91c1c 100%)',
                                                                    transition: 'width 0.3s ease'
                                                                }} />
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Metadata */}
                                                    <div style={{
                                                        marginTop: '12px',
                                                        paddingTop: '12px',
                                                        borderTop: '1px solid #F0F0F0',
                                                        display: 'flex',
                                                        justifyContent: 'space-between',
                                                        alignItems: 'center'
                                                    }}>
                                                        <span style={{
                                                            fontSize: isMobile ? '11px' : '12px',
                                                            color: '#999'
                                                        }}>
                                                            {categories.find(c => c.id === resource.category)?.name || 'Crisis'}
                                                        </span>
                                                        {resource.duration && (
                                                            <span style={{
                                                                fontSize: isMobile ? '11px' : '12px',
                                                                color: '#999'
                                                            }}>
                                                                {resource.duration}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    /* Empty State */
                                    <div style={{
                                        background: '#FFFFFF',
                                        borderRadius: isMobile ? '12px' : '16px',
                                        padding: isMobile ? '40px 20px' : '60px 40px',
                                        textAlign: 'center',
                                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                                    }}>
                                        <i data-lucide="shield-alert" style={{
                                            width: isMobile ? '48px' : '64px',
                                            height: isMobile ? '48px' : '64px',
                                            color: '#dc2626',
                                            marginBottom: '16px',
                                            display: 'block',
                                            margin: '0 auto 16px',
                                            strokeWidth: 2
                                        }}></i>
                                        <h3 style={{
                                            fontSize: isMobile ? '18px' : '20px',
                                            color: '#2c3e50',
                                            marginBottom: '8px',
                                            fontWeight: '700'
                                        }}>
                                            No Crisis Resources Yet
                                        </h3>
                                        <p style={{
                                            fontSize: isMobile ? '14px' : '15px',
                                            color: '#666',
                                            lineHeight: '1.6',
                                            maxWidth: '400px',
                                            margin: '0 auto'
                                        }}>
                                            Crisis resources will appear here as they become available. Use the Quick Tools above for immediate support.
                                        </p>
                                    </div>
                                )}
                            </>
                        );
                    })()}
                </div>

                {/* PHASE 2: Smart Recommendations Sidebar */}
                {showSidebar && (
                    <>
                        {/* Backdrop */}
                        <div
                            style={{
                                position: 'fixed',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                                zIndex: 999,
                                transition: 'opacity 0.3s ease'
                            }}
                            onClick={() => {
                                if (window.GLRSApp?.utils?.triggerHaptic) window.GLRSApp.utils.triggerHaptic('light');
                                setShowSidebar(false);
                            }}
                        />

                        {/* Sidebar Panel */}
                        <div style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            bottom: 0,
                            width: isMobile ? '280px' : '320px',
                            backgroundColor: '#FFFFFF',
                            boxShadow: '2px 0 8px rgba(0, 0, 0, 0.15)',
                            zIndex: 1000,
                            display: 'flex',
                            flexDirection: 'column',
                            transition: 'transform 0.3s ease',
                            transform: 'translateX(0)'
                        }}>
                            {/* Sidebar Header */}
                            <div style={{
                                padding: isMobile ? '16px' : '20px',
                                borderBottom: '1px solid #E5E5E5',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                background: 'linear-gradient(135deg, #058585 0%, #047373 100%)'
                            }}>
                                <h2 style={{
                                    margin: 0,
                                    fontSize: isMobile ? '16px' : '18px',
                                    fontWeight: 'bold',
                                    color: '#FFFFFF'
                                }}>
                                    🎯 Smart Recommendations
                                </h2>
                                <button
                                    onClick={() => {
                                        if (window.GLRSApp?.utils?.triggerHaptic) window.GLRSApp.utils.triggerHaptic('light');
                                        setShowSidebar(false);
                                    }}
                                    style={{
                                        background: 'rgba(255, 255, 255, 0.2)',
                                        border: 'none',
                                        cursor: 'pointer',
                                        padding: '8px',
                                        borderRadius: '6px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}
                                >
                                    <i data-lucide="x" style={{ width: '20px', height: '20px', color: '#FFFFFF' }}></i>
                                </button>
                            </div>

                            {/* Sidebar Content */}
                            <div style={{
                                flex: 1,
                                overflowY: 'auto',
                                padding: isMobile ? '16px' : '20px'
                            }}>
                                {/* Coming Soon Message */}
                                <div style={{
                                    background: 'linear-gradient(135deg, rgba(5, 133, 133, 0.1) 0%, rgba(4, 115, 115, 0.05) 100%)',
                                    borderRadius: '12px',
                                    padding: isMobile ? '16px' : '24px',
                                    border: '2px solid rgba(5, 133, 133, 0.3)',
                                    textAlign: 'center'
                                }}>
                                    <i data-lucide="construction" style={{
                                        width: isMobile ? '40px' : '48px',
                                        height: isMobile ? '40px' : '48px',
                                        color: '#058585',
                                        marginBottom: '16px',
                                        strokeWidth: 2,
                                        display: 'block',
                                        margin: '0 auto 16px'
                                    }}></i>
                                    <h3 style={{
                                        fontSize: isMobile ? '16px' : '18px',
                                        color: '#2c3e50',
                                        marginBottom: '12px',
                                        fontWeight: '700'
                                    }}>
                                        Smart Recommendations In Progress
                                    </h3>
                                    <p style={{
                                        fontSize: isMobile ? '13px' : '14px',
                                        color: '#666',
                                        lineHeight: '1.6',
                                        margin: 0
                                    }}>
                                        We're developing AI-powered resource recommendations based on your recovery journey, goals, and challenges. Check back soon for updates!
                                    </p>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        );
    }

    // Resource List View
    if (!selectedResource) {
        const category = categories.find(c => c.id === selectedCategory);
        const filteredResources = getFilteredResources();

        return (
            <div className="section-content">
                {/* PHASE 1: Recovery Resources Header - Fixed at top */}
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: isMobile ? '48px' : '56px',
                    background: '#058585',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: isMobile ? '0 8px' : '0 12px',
                    zIndex: 100,
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}>
                    {/* LEFT: Hamburger Menu + Recovery Resources Title */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '8px' : '12px' }}>
                        <button
                            onClick={() => {
                                if (window.GLRSApp?.utils?.triggerHaptic) window.GLRSApp.utils.triggerHaptic('light');
                                setShowSidebar(true);
                            }}
                            style={{
                                background: 'transparent',
                                border: 'none',
                                cursor: 'pointer',
                                padding: isMobile ? '6px' : '8px',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'background 0.2s',
                                minWidth: isMobile ? '44px' : '40px',
                                minHeight: isMobile ? '44px' : '40px'
                            }}
                            onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                            onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                        >
                            <i data-lucide="menu" style={{ width: isMobile ? '22px' : '24px', height: isMobile ? '22px' : '24px', color: '#FFFFFF' }}></i>
                        </button>

                        <h1 style={{
                            color: '#FFFFFF',
                            fontSize: isMobile ? '16px' : '18px',
                            fontWeight: 'bold',
                            margin: 0
                        }}>
                            Recovery Resources
                        </h1>
                    </div>

                    {/* RIGHT: Search Icon + Profile Icon */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '4px' : '8px' }}>
                        {/* Search Button (placeholder for future) */}
                        <button
                            style={{
                                background: 'transparent',
                                border: 'none',
                                cursor: 'pointer',
                                padding: isMobile ? '6px' : '8px',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'background 0.2s',
                                minWidth: isMobile ? '44px' : '40px',
                                minHeight: isMobile ? '44px' : '40px'
                            }}
                            onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                            onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                        >
                            <i data-lucide="search" style={{ width: isMobile ? '22px' : '24px', height: isMobile ? '22px' : '24px', color: '#FFFFFF' }}></i>
                        </button>

                        {/* Profile Button */}
                        <button
                            onClick={() => {
                                if (window.GLRSApp?.utils?.triggerHaptic) window.GLRSApp.utils.triggerHaptic('light');
                                if (window.navigateToTab) {
                                    window.navigateToTab('profile');
                                }
                            }}
                            style={{
                                background: 'transparent',
                                border: 'none',
                                cursor: 'pointer',
                                padding: isMobile ? '6px' : '8px',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'background 0.2s',
                                minWidth: isMobile ? '44px' : '40px',
                                minHeight: isMobile ? '44px' : '40px'
                            }}
                            onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                            onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                        >
                            <i data-lucide="user" style={{ width: isMobile ? '22px' : '24px', height: isMobile ? '22px' : '24px', color: '#FFFFFF' }}></i>
                        </button>
                    </div>
                </div>

                {/* PHASE 3: Tab Navigation - Fixed position, below header */}
                <div style={{
                    background: '#058585',
                    display: 'flex',
                    justifyContent: 'space-around',
                    alignItems: 'center',
                    height: '48px',
                    position: 'fixed',
                    top: '48px',
                    left: 0,
                    right: 0,
                    zIndex: 99,
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}>
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => {
                                if (window.GLRSApp?.utils?.triggerHaptic) window.GLRSApp.utils.triggerHaptic('light');
                                setActiveTab(tab.id);
                            }}
                            style={{
                                flex: 1,
                                height: '100%',
                                background: 'none',
                                border: 'none',
                                color: activeTab === tab.id ? '#FFFFFF' : 'rgba(255,255,255,0.7)',
                                fontSize: isMobile ? '11px' : '14px',
                                fontWeight: activeTab === tab.id ? 'bold' : '400',
                                cursor: 'pointer',
                                position: 'relative',
                                transition: 'all 0.2s',
                                display: 'flex',
                                flexDirection: isMobile ? 'column' : 'row',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: isMobile ? '2px' : '6px',
                                padding: isMobile ? '4px 2px' : '8px 4px'
                            }}
                        >
                            {isMobile ? (
                                <>
                                    <i data-lucide={tab.icon} style={{
                                        width: '16px',
                                        height: '16px',
                                        color: activeTab === tab.id ? '#FFFFFF' : 'rgba(255,255,255,0.7)',
                                        strokeWidth: activeTab === tab.id ? 2.5 : 2
                                    }}></i>
                                    <span style={{ fontSize: '11px', lineHeight: '1.2' }}>
                                        {tab.label === 'My Library' ? 'Library' :
                                         tab.label === 'Work & Career' ? 'Work' :
                                         tab.label === 'Crisis Toolkit' ? 'Crisis' :
                                         tab.label}
                                    </span>
                                </>
                            ) : (
                                <>
                                    <i data-lucide={tab.icon} style={{
                                        width: '18px',
                                        height: '18px',
                                        color: activeTab === tab.id ? '#FFFFFF' : 'rgba(255,255,255,0.7)',
                                        strokeWidth: activeTab === tab.id ? 2.5 : 2
                                    }}></i>
                                    <span>{tab.label}</span>
                                </>
                            )}
                            {activeTab === tab.id && (
                                <div style={{
                                    position: 'absolute',
                                    bottom: 0,
                                    left: '50%',
                                    transform: 'translateX(-50%)',
                                    width: '60%',
                                    height: '2px',
                                    background: '#FFFFFF'
                                }} />
                            )}
                        </button>
                    ))}
                </div>

                {/* PHASE 3: Content area with light gray background */}
                <div style={{
                    paddingTop: '96px',
                    background: '#F0F2F5',
                    minHeight: '100vh',
                    padding: isMobile ? '96px 12px 20px' : '96px 20px 20px'
                }}>
                <div style={{
                    background: 'rgba(255,255,255,0.1)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: '20px',
                    padding: '20px',
                    marginBottom: '20px'
                }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        marginBottom: '20px'
                    }}>
                        <button 
                            onClick={() => setSelectedCategory(null)}
                            style={{
                                background: 'rgba(255,255,255,0.2)',
                                border: 'none',
                                color: 'white',
                                fontSize: '24px',
                                cursor: 'pointer',
                                padding: '10px',
                                borderRadius: '10px'
                            }}
                        >
                            ←
                        </button>
                        <div style={{ flex: 1, textAlign: 'center' }}>
                            <h2 style={{ margin: 0, color: 'white' }}>
                                {category?.icon} {category?.name}
                            </h2>
                            <p style={{ 
                                margin: '5px 0 0 0', 
                                color: 'rgba(255,255,255,0.8)',
                                fontSize: '14px'
                            }}>
                                {filteredResources.length} resources
                            </p>
                        </div>
                    </div>

                    <div style={{
                        display: 'flex',
                        background: 'rgba(255,255,255,0.2)',
                        borderRadius: '15px',
                        padding: '5px'
                    }}>
                        <button
                            onClick={() => setActiveTab('assigned')}
                            style={{
                                flex: 1,
                                padding: '12px',
                                background: activeTab === 'assigned' ? 'white' : 'transparent',
                                color: activeTab === 'assigned' ? '#764ba2' : 'white',
                                border: 'none',
                                borderRadius: '10px',
                                cursor: 'pointer',
                                fontWeight: 'bold',
                                transition: 'all 0.3s'
                            }}
                        >
                            Assigned ({resources.filter(r => r.isAssigned).length})
                        </button>
                        <button
                            onClick={() => setActiveTab('global')}
                            style={{
                                flex: 1,
                                padding: '12px',
                                background: activeTab === 'global' ? 'white' : 'transparent',
                                color: activeTab === 'global' ? '#764ba2' : 'white',
                                border: 'none',
                                borderRadius: '10px',
                                cursor: 'pointer',
                                fontWeight: 'bold',
                                transition: 'all 0.3s'
                            }}
                        >
                            Global ({resources.filter(r => !r.isAssigned).length})
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div style={{
                        textAlign: 'center',
                        color: 'white',
                        padding: '40px'
                    }}>
                        Loading resources...
                    </div>
                ) : error ? (
                    <div style={{
                        background: 'rgba(255,255,255,0.95)',
                        borderRadius: '20px',
                        padding: '40px',
                        textAlign: 'center'
                    }}>
                        <i data-lucide="alert-circle" style={{
                            width: '48px',
                            height: '48px',
                            color: '#ef4444',
                            marginBottom: '16px'
                        }}></i>
                        <h3 style={{
                            color: '#ef4444',
                            margin: '0 0 12px 0',
                            fontSize: '20px'
                        }}>
                            Error Loading Resources
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
                                loadAllResources();
                            }}
                            style={{
                                padding: '12px 24px',
                                background: '#9c27b0',
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
                ) : filteredResources.length === 0 ? (
                    <div style={{
                        textAlign: 'center',
                        color: 'rgba(255,255,255,0.8)',
                        padding: '40px',
                        background: 'rgba(255,255,255,0.1)',
                        borderRadius: '20px'
                    }}>
                        No resources found.
                    </div>
                ) : (
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '15px'
                    }}>
                        {filteredResources.map(resource => (
                            <div 
                                key={resource.id}
                                style={{
                                    background: 'rgba(255,255,255,0.95)',
                                    borderRadius: '20px',
                                    padding: '20px',
                                    position: 'relative',
                                    transition: 'all 0.3s',
                                    cursor: 'pointer'
                                }}
                                onClick={() => handleResourceClick(resource)}
                            >
                                {newResourceIds.includes(resource.id) && (
                                    <span style={{
                                        position: 'absolute',
                                        top: '10px',
                                        right: '10px',
                                        background: '#ff4444',
                                        color: 'white',
                                        padding: '4px 10px',
                                        borderRadius: '10px',
                                        fontSize: '11px',
                                        fontWeight: 'bold'
                                    }}>
                                        NEW
                                    </span>
                                )}

                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'flex-start'
                                }}>
                                    <div style={{ flex: 1 }}>
                                        <h4 style={{
                                            color: '#333',
                                            margin: '0 0 8px 0',
                                            fontSize: '18px'
                                        }}>
                                            {resource.title}
                                        </h4>
                                        {resource.description && (
                                            <p style={{
                                                color: '#666',
                                                fontSize: '14px',
                                                margin: '0 0 15px 0',
                                                lineHeight: '1.5'
                                            }}>
                                                {resource.description}
                                            </p>
                                        )}
                                        
                                        <div style={{
                                            display: 'flex',
                                            gap: '10px',
                                            flexWrap: 'wrap',
                                            marginBottom: '15px'
                                        }}>
                                            <span style={{
                                                background: progress[resource.id]?.status === 'completed' 
                                                    ? 'linear-gradient(135deg, #4CAF50, #45a049)'
                                                    : progress[resource.id]?.status === 'in-progress' 
                                                    ? 'linear-gradient(135deg, #ff9800, #f57c00)'
                                                    : 'linear-gradient(135deg, #9e9e9e, #757575)',
                                                color: 'white',
                                                padding: '6px 12px',
                                                borderRadius: '20px',
                                                fontSize: '12px',
                                                fontWeight: 'bold'
                                            }}>
                                                {progress[resource.id]?.status === 'completed' ? '✓ Completed' :
                                                 progress[resource.id]?.status === 'in-progress' ? '⏳ In Progress' :
                                                 '○ Not Started'}
                                            </span>

                                            {resource.addedAt && (
                                                <span style={{
                                                    background: 'rgba(103,58,183,0.1)',
                                                    color: '#673ab7',
                                                    padding: '6px 12px',
                                                    borderRadius: '20px',
                                                    fontSize: '12px'
                                                }}>
                                                    <i data-lucide="calendar" style={{width: '12px', height: '12px', marginRight: '4px'}}></i>
                                                    Added {resource.addedAt.toDate ?
                                                        new Date(resource.addedAt.toDate()).toLocaleDateString() :
                                                        new Date(resource.addedAt).toLocaleDateString()}
                                                </span>
                                            )}

                                            {progress[resource.id]?.completedAt && (
                                                <span style={{
                                                    background: 'rgba(76,175,80,0.1)',
                                                    color: '#4CAF50',
                                                    padding: '6px 12px',
                                                    borderRadius: '20px',
                                                    fontSize: '12px'
                                                }}>
                                                    ✅ Completed {new Date(progress[resource.id].completedAt).toLocaleDateString()}
                                                </span>
                                            )}
                                        </div>

                                        <div style={{
                                            display: 'flex',
                                            gap: '10px',
                                            alignItems: 'center'
                                        }}>
                                            <select
                                                value={progress[resource.id]?.status || 'not-started'}
                                                onChange={(e) => {
                                                    e.stopPropagation();
                                                    updateProgress(resource.id, e.target.value);
                                                }}
                                                onClick={(e) => e.stopPropagation()}
                                                style={{
                                                    padding: '8px 12px',
                                                    background: 'white',
                                                    border: '2px solid #e0e0e0',
                                                    borderRadius: '10px',
                                                    color: '#333',
                                                    cursor: 'pointer',
                                                    fontWeight: '500'
                                                }}
                                            >
                                                <option value="not-started">Not Started</option>
                                                <option value="in-progress">In Progress</option>
                                                <option value="completed">Completed</option>
                                            </select>
                                            
                                            {notes[resource.id] && (
                                                <span style={{
                                                    background: 'rgba(33,150,243,0.1)',
                                                    color: '#2196F3',
                                                    padding: '8px 12px',
                                                    borderRadius: '10px',
                                                    fontSize: '12px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '5px'
                                                }}>
                                                    <i data-lucide="file-text" style={{width: '14px', height: '14px', marginRight: '4px'}}></i>
                                                    Has notes
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                </div> {/* End content area */}

                {/* PHASE 2: Smart Recommendations Sidebar */}
                {showSidebar && (
                    <>
                        {/* Backdrop */}
                        <div
                            style={{
                                position: 'fixed',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                                zIndex: 999,
                                transition: 'opacity 0.3s ease'
                            }}
                            onClick={() => {
                                if (window.GLRSApp?.utils?.triggerHaptic) window.GLRSApp.utils.triggerHaptic('light');
                                setShowSidebar(false);
                            }}
                        />

                        {/* Sidebar Panel */}
                        <div style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            bottom: 0,
                            width: isMobile ? '280px' : '320px',
                            backgroundColor: '#FFFFFF',
                            boxShadow: '2px 0 8px rgba(0, 0, 0, 0.15)',
                            zIndex: 1000,
                            display: 'flex',
                            flexDirection: 'column',
                            transition: 'transform 0.3s ease',
                            transform: 'translateX(0)'
                        }}>
                            {/* Sidebar Header */}
                            <div style={{
                                padding: isMobile ? '16px' : '20px',
                                borderBottom: '1px solid #E5E5E5',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                background: 'linear-gradient(135deg, #058585 0%, #047373 100%)'
                            }}>
                                <h2 style={{
                                    margin: 0,
                                    fontSize: isMobile ? '16px' : '18px',
                                    fontWeight: 'bold',
                                    color: '#FFFFFF'
                                }}>
                                    🎯 Smart Recommendations
                                </h2>
                                <button
                                    onClick={() => {
                                        if (window.GLRSApp?.utils?.triggerHaptic) window.GLRSApp.utils.triggerHaptic('light');
                                        setShowSidebar(false);
                                    }}
                                    style={{
                                        background: 'rgba(255, 255, 255, 0.2)',
                                        border: 'none',
                                        cursor: 'pointer',
                                        padding: '8px',
                                        borderRadius: '6px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}
                                >
                                    <i data-lucide="x" style={{ width: '20px', height: '20px', color: '#FFFFFF' }}></i>
                                </button>
                            </div>

                            {/* Sidebar Content */}
                            <div style={{
                                flex: 1,
                                overflowY: 'auto',
                                padding: isMobile ? '16px' : '20px'
                            }}>
                                {/* Coming Soon Message */}
                                <div style={{
                                    background: 'linear-gradient(135deg, rgba(5, 133, 133, 0.1) 0%, rgba(4, 115, 115, 0.05) 100%)',
                                    borderRadius: '12px',
                                    padding: isMobile ? '16px' : '24px',
                                    border: '2px solid rgba(5, 133, 133, 0.3)',
                                    textAlign: 'center'
                                }}>
                                    <i data-lucide="construction" style={{
                                        width: isMobile ? '40px' : '48px',
                                        height: isMobile ? '40px' : '48px',
                                        color: '#058585',
                                        marginBottom: '16px',
                                        strokeWidth: 2,
                                        display: 'block',
                                        margin: '0 auto 16px'
                                    }}></i>
                                    <h3 style={{
                                        fontSize: isMobile ? '16px' : '18px',
                                        color: '#2c3e50',
                                        marginBottom: '12px',
                                        fontWeight: '700'
                                    }}>
                                        Smart Recommendations In Progress
                                    </h3>
                                    <p style={{
                                        fontSize: isMobile ? '13px' : '14px',
                                        color: '#666',
                                        lineHeight: '1.6',
                                        margin: 0
                                    }}>
                                        We're developing AI-powered resource recommendations based on your recovery journey, goals, and challenges. Check back soon for updates!
                                    </p>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        );
    }

    return (
        <ResourceViewer 
            resource={selectedResource}
            onBack={() => setSelectedResource(null)}
            onUpdateNote={(note) => saveNote(selectedResource.id, note)}
            currentNote={notes[selectedResource.id]}
            progress={progress[selectedResource.id]}
            onUpdateProgress={(status) => updateProgress(selectedResource.id, status)}
            userName={userNames[selectedResource.addedBy] || 'Unknown'}
        />
    );
}

/**
 * ResourceViewer Component
 * @description Full-screen resource detail viewer with notes, progress tracking, print/download
 *
 * @features
 * - Full-screen resource display (content, embed, or external link)
 * - Personal notes: Add/edit/save notes for the resource
 * - Progress tracking: Update status (not-started, in-progress, completed)
 * - Print functionality: Print resource content
 * - Download functionality: Download resource file or content
 * - Resource metadata: Category, added date, completion date, author
 *
 * @props
 * - resource: object - Resource object to display (title, content, embedUrl, url, category, etc.)
 * - onBack: function - Callback to close viewer and return to resource list
 * - onUpdateNote: function - Callback to save note (noteText) => void
 * - currentNote: string - Current note text for this resource
 * - progress: object - Progress object {status, updatedAt, completedAt}
 * - onUpdateProgress: function - Callback to update progress (status) => void
 * - userName: string - Author display name
 *
 * @state 2 useState hooks (local UI state only):
 * - note: string - Note input text (initialized from currentNote)
 * - showNoteInput: boolean - Note editor visibility toggle
 *
 * @architecture Props-based component (NO Firebase)
 * - All data comes from props
 * - All actions use callbacks to parent
 * - Pure UI component
 *
 * @returns {React.Element} Full-screen resource viewer with sticky header
 */
function ResourceViewer({ resource, onBack, onUpdateNote, currentNote, progress, onUpdateProgress, userName }) {
    const [note, setNote] = useState(currentNote || '');
    const [showNoteInput, setShowNoteInput] = useState(false);

    const handlePrint = () => {
        window.print();
    };

    const handleDownload = async () => {
        if (resource.fileURL) {
            window.open(resource.fileURL, '_blank');
        } else if (resource.content) {
            const blob = new Blob([resource.content], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${resource.title}.txt`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'white',
            zIndex: 9999,
            overflowY: 'auto'
        }}>
            <div style={{
                background: 'linear-gradient(135deg, #9c27b0 0%, #673ab7 100%)',
                padding: '20px',
                position: 'sticky',
                top: 0,
                zIndex: 10
            }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                }}>
                    <button 
                        onClick={onBack}
                        style={{
                            background: 'rgba(255,255,255,0.2)',
                            border: 'none',
                            color: 'white',
                            fontSize: '24px',
                            cursor: 'pointer',
                            padding: '5px 10px',
                            borderRadius: '8px'
                        }}
                    >
                        ←
                    </button>
                    <h2 style={{
                        flex: 1,
                        textAlign: 'center',
                        margin: 0,
                        color: 'white',
                        fontSize: '18px'
                    }}>
                        {resource.title}
                    </h2>
                    <div style={{display: 'flex', gap: '10px'}}>
                        <button 
                            onClick={handlePrint}
                            style={{
                                background: 'rgba(255,255,255,0.2)',
                                border: 'none',
                                color: 'white',
                                padding: '8px 12px',
                                borderRadius: '8px',
                                cursor: 'pointer'
                            }}
                        >
                            <i data-lucide="printer" style={{width: '18px', height: '18px'}}></i>
                        </button>
                        <button
                            onClick={handleDownload}
                            style={{
                                background: 'rgba(255,255,255,0.2)',
                                border: 'none',
                                color: 'white',
                                padding: '8px 12px',
                                borderRadius: '8px',
                                cursor: 'pointer'
                            }}
                        >
                            <i data-lucide="download" style={{width: '18px', height: '18px'}}></i>
                        </button>
                    </div>
                </div>
                
                <div style={{
                    marginTop: '15px',
                    display: 'flex',
                    gap: '10px',
                    alignItems: 'center'
                }}>
                    <span style={{color: 'white', fontSize: '14px'}}>Progress:</span>
                    <select
                        value={progress?.status || 'not-started'}
                        onChange={(e) => onUpdateProgress(e.target.value)}
                        style={{
                            padding: '6px 12px',
                            background: 'rgba(255,255,255,0.9)',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            flex: 1
                        }}
                    >
                        <option value="not-started">Not Started</option>
                        <option value="in-progress">In Progress</option>
                        <option value="completed">Completed</option>
                    </select>
                </div>
            </div>

            <div style={{padding: '20px', maxWidth: '800px', margin: '0 auto'}}>
                {resource.content ? (
                    <div style={{
                        fontSize: '16px',
                        lineHeight: '1.8',
                        color: '#333'
                    }}>
                        {resource.content.split('\n').map((paragraph, index) => (
                            <p key={index} style={{marginBottom: '15px'}}>
                                {paragraph}
                            </p>
                        ))}
                    </div>
                ) : resource.embedUrl ? (
                    <iframe 
                        src={resource.embedUrl}
                        style={{
                            width: '100%',
                            height: '600px',
                            border: 'none',
                            borderRadius: '10px'
                        }}
                    />
                ) : (
                    <div style={{
                        padding: '40px',
                        textAlign: 'center',
                        color: '#999'
                    }}>
                        <p>This resource is available externally.</p>
                        <a 
                            href={resource.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                                display: 'inline-block',
                                marginTop: '20px',
                                padding: '12px 24px',
                                background: '#9c27b0',
                                color: 'white',
                                borderRadius: '8px',
                                textDecoration: 'none'
                            }}
                        >
                            Open Resource
                        </a>
                    </div>
                )}

                <div style={{
                    marginTop: '40px',
                    padding: '20px',
                    background: '#f5f5f5',
                    borderRadius: '10px'
                }}>
                    <h3 style={{margin: '0 0 15px 0', display: 'flex', alignItems: 'center', gap: '8px'}}>
                        <i data-lucide="file-text" style={{width: '20px', height: '20px'}}></i>
                        Personal Notes
                    </h3>
                    {showNoteInput ? (
                        <div>
                            <textarea 
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                                placeholder="Add your thoughts, reflections, or key takeaways..."
                                style={{
                                    width: '100%',
                                    minHeight: '100px',
                                    padding: '10px',
                                    border: '1px solid #ddd',
                                    borderRadius: '8px',
                                    fontSize: '14px',
                                    resize: 'vertical'
                                }}
                            />
                            <div style={{marginTop: '10px', display: 'flex', gap: '10px'}}>
                                <button
                                    onClick={() => {
                                        onUpdateNote(note);
                                        setShowNoteInput(false);
                                    }}
                                    style={{
                                        padding: '8px 16px',
                                        background: '#4CAF50',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '8px',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Save Note
                                </button>
                                <button
                                    onClick={() => {
                                        setNote(currentNote || '');
                                        setShowNoteInput(false);
                                    }}
                                    style={{
                                        padding: '8px 16px',
                                        background: '#999',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '8px',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div>
                            {currentNote ? (
                                <div>
                                    <p style={{margin: '0 0 10px 0', whiteSpace: 'pre-wrap'}}>
                                        {currentNote}
                                    </p>
                                    <button
                                        onClick={() => {
                                            setNote(currentNote);
                                            setShowNoteInput(true);
                                        }}
                                        style={{
                                            padding: '8px 16px',
                                            background: '#9c27b0',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '8px',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        Edit Note
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={() => setShowNoteInput(true)}
                                    style={{
                                        padding: '8px 16px',
                                        background: '#9c27b0',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '8px',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Add Note
                                </button>
                            )}
                        </div>
                    )}
                </div>

                <div style={{
                    marginTop: '20px',
                    padding: '15px',
                    background: '#f9f9f9',
                    borderRadius: '10px',
                    fontSize: '14px',
                    color: '#666'
                }}>
                    <div style={{marginBottom: '8px'}}>
                        <strong>Category:</strong> {resource.category}
                    </div>
                    {resource.addedAt && (
                        <div style={{marginBottom: '8px'}}>
                            <strong>Added:</strong> {resource.addedAt.toDate ? 
                                new Date(resource.addedAt.toDate()).toLocaleDateString() :
                                new Date(resource.addedAt).toLocaleDateString()}
                        </div>
                    )}
                    {progress?.completedAt && (
                        <div style={{marginBottom: '8px'}}>
                            <strong>Completed:</strong> {new Date(progress.completedAt).toLocaleDateString()}
                        </div>
                    )}
                    {userName && (
                        <div>
                            <strong>Added by:</strong> {userName}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// Register components globally
window.GLRSApp = window.GLRSApp || { components: {} };
window.GLRSApp.components = window.GLRSApp.components || {};
window.GLRSApp.components.ResourcesView = ResourcesView;
window.GLRSApp.components.ResourceViewer = ResourceViewer;

console.log('✅ PHASE 5: ResourcesTab components loaded with JSDoc + error handling + loading/error UI');
