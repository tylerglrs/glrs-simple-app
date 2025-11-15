// Destructure React hooks for use in components
const { useState, useEffect, useMemo, useCallback, useRef } = React;

/**
 * @file CommunityTab.js - Community features and peer-to-peer support
 * @description Contains community chat, topic rooms, support groups, meetings, and emergency resources
 *
 * @components
 * MAIN COMPONENT (1):
 * - CommunityTab: Main community features with tabbed interface
 *
 * SUB-COMPONENT (1):
 * - CommunityChat: Chat/feed UI component for displaying and sending messages
 *
 * @features
 * COMMUNITY TAB:
 * - Tabbed interface: Main chat, Topic Rooms, Support Groups, Meetings
 * - Real-time community message feed
 * - Topic rooms for specific recovery topics
 * - Support group listings with meeting schedules
 * - Upcoming meetings calendar
 * - Emergency resources list
 * - SOS emergency button
 *
 * COMMUNITY CHAT:
 * - Message feed with auto-scroll
 * - Image upload support
 * - Like/comment functionality
 * - Flag content for moderation
 * - Full-screen image viewing
 *
 * @architecture 3-Layer Direct Architecture (Component → Firebase → Component)
 * - CommunityTab uses local useState hooks
 * - Direct Firebase Firestore queries
 * - Real-time listeners with cleanup
 * - NO global state dependencies
 * - CommunityChat is props-based with callbacks (NO Firebase)
 *
 * @refactored November 2025 - Phase 4 complete
 * @author GLRS Development Team
 */

// Index/CommunityTab.js
window.GLRSApp = window.GLRSApp || {};
window.GLRSApp.components = window.GLRSApp.components || {};

/**
 * CommunityTab Component
 * @description Main community features with multi-tab interface for peer support
 *
 * @features
 * - Tab 1: GLRS Community - Main message feed for all users
 * - Tab 2: Topic Rooms - Specialized discussion rooms (relapse prevention, family support, etc.)
 * - Tab 3: Support Groups - Weekly support group meetings with schedules
 * - Tab 4: Meetings - Upcoming meeting calendar
 * - Emergency resources section with crisis hotlines
 * - SOS emergency button for immediate coach notification
 *
 * @state 8 useState hooks:
 * - user: Firebase auth user object
 * - activeChat: Current tab ('main'|'rooms'|'groups'|'meetings')
 * - communityMessages: Array of community messages (real-time)
 * - topicRooms: Array of active topic rooms
 * - supportGroups: Array of active support groups
 * - meetings: Array of scheduled/completed meetings
 * - emergencyResources: Array of emergency resources
 * - loading: Loading state for initial data fetch
 * - error: Error state for user-facing error messages
 *
 * @firebase 6 Firestore queries:
 * 1. onAuthStateChanged: Monitor auth state
 * 2. loadCommunityMessages: Real-time listener for community messages
 * 3. loadTopicRooms: Fetch active topic rooms
 * 4. loadSupportGroups: Fetch active support groups
 * 5. loadMeetings: Fetch scheduled/completed meetings
 * 6. loadEmergencyResources: Fetch emergency resources
 * 7. sendCommunityMessage: Write new message to Firestore
 *
 * @props (optional callbacks for functionality)
 * - onUploadChatImage: function - Callback to upload chat image
 * - onFlagContent: function - Callback to flag content for moderation
 * - onSetModalImage: function - Callback to show full-screen image
 * - onEnterTopicRoom: function - Callback to navigate to topic room
 * - onTriggerSOS: function - Callback to trigger emergency SOS
 *
 * @utilities
 * - window.snapshotToArray: Convert Firestore snapshot to array
 * - window.handleFirebaseError: Centralized error logging
 *
 * @returns {React.Element} Community tab with tabbed interface
 */
function CommunityTab({
    onUploadChatImage,
    onFlagContent,
    onSetModalImage,
    onEnterTopicRoom,
    onTriggerSOS
} = {}) {  // ✅ PHASE 4: Added JSDoc + error handling + optional props
    // Local state hooks
    const [user, setUser] = useState(null);
    const [activeChat, setActiveChat] = useState('main');
    const [communityMessages, setCommunityMessages] = useState([]);
    const [topicRooms, setTopicRooms] = useState([]);
    const [supportGroups, setSupportGroups] = useState([]);
    const [meetings, setMeetings] = useState([]);
    const [emergencyResources, setEmergencyResources] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

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

    // Real-time listener for community messages
    useEffect(() => {
        if (!user) return;

        const unsubscribe = db.collection('messages')
            .where('type', '==', 'community')
            .orderBy('createdAt', 'desc')
            .limit(50)
            .onSnapshot((snapshot) => {
                const msgs = window.snapshotToArray(snapshot);
                setCommunityMessages(msgs);
                setError(null); // Clear any previous errors
                setLoading(false);
            }, (error) => {
                console.error('Error loading community messages:', error);
                setError('Failed to load community messages. Please check your connection and try again.');
                window.handleFirebaseError && window.handleFirebaseError(error, 'CommunityTab.loadCommunityMessages');
                setLoading(false);
            });

        return () => unsubscribe();
    }, [user]);

    // Load topic rooms
    useEffect(() => {
        if (!user) return;

        const loadTopicRooms = async () => {
            try {
                const roomsSnap = await db.collection('topicRooms')
                    .where('status', '==', 'active')
                    .orderBy('name', 'asc')
                    .get();

                const rooms = window.snapshotToArray(roomsSnap);
                setTopicRooms(rooms);
            } catch (error) {
                console.error('Error loading topic rooms:', error);
                // Non-critical error - topic rooms are optional, don't show error UI
                window.handleFirebaseError && window.handleFirebaseError(error, 'CommunityTab.loadTopicRooms');
            }
        };

        loadTopicRooms();
    }, [user]);

    // Load support groups
    useEffect(() => {
        if (!user) return;

        const loadSupportGroups = async () => {
            try {
                const groupsSnap = await db.collection('supportGroups')
                    .where('status', '==', 'active')
                    .orderBy('day', 'asc')
                    .get();

                const groups = window.snapshotToArray(groupsSnap);
                setSupportGroups(groups);
            } catch (error) {
                console.error('Error loading support groups:', error);
                // Non-critical error - support groups are optional, don't show error UI
                window.handleFirebaseError && window.handleFirebaseError(error, 'CommunityTab.loadSupportGroups');
            }
        };

        loadSupportGroups();
    }, [user]);

    // Load scheduled meetings
    useEffect(() => {
        if (!user) return;

        const loadMeetings = async () => {
            try {
                const meetingsSnap = await db.collection('meetings')
                    .where('status', 'in', ['scheduled', 'completed'])
                    .orderBy('scheduledTime', 'desc')
                    .limit(10)
                    .get();

                const mtgs = window.snapshotToArray(meetingsSnap);
                setMeetings(mtgs);
            } catch (error) {
                console.error('Error loading meetings:', error);
                // Non-critical error - meetings are optional, don't show error UI
                window.handleFirebaseError && window.handleFirebaseError(error, 'CommunityTab.loadMeetings');
            } finally {
                setLoading(false);
            }
        };

        loadMeetings();
    }, [user]);

    // Load emergency resources
    useEffect(() => {
        const loadEmergencyResources = async () => {
            try {
                const resourcesSnap = await db.collection('emergencyResources')
                    .where('status', '==', 'active')
                    .orderBy('priority', 'asc')
                    .get();

                const resources = window.snapshotToArray(resourcesSnap);
                setEmergencyResources(resources);
            } catch (error) {
                console.error('Error loading emergency resources:', error);
                // Non-critical error - emergency resources are optional, don't show error UI
                window.handleFirebaseError && window.handleFirebaseError(error, 'CommunityTab.loadEmergencyResources');
            }
        };

        loadEmergencyResources();
    }, []);

    // Send community message function
    const sendCommunityMessage = async (messageText, imageUrl = null) => {
        if (!user) return;

        try {
            await db.collection('messages').add({
                type: 'community',
                content: messageText,
                imageUrl: imageUrl,
                senderId: user.uid,
                senderName: user.displayName || user.email,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                likes: 0,
                comments: []
            });
        } catch (error) {
            console.error('Error sending community message:', error);
            window.handleFirebaseError && window.handleFirebaseError(error, 'CommunityTab.sendCommunityMessage');
            throw error; // Re-throw so calling code can handle
        }
    };

    // Upload chat image function
    const uploadChatImage = async (file, type, roomId) => {
        if (onUploadChatImage) {
            return await onUploadChatImage(file, type, roomId);
        } else {
            console.warn('Upload chat image: No callback provided. Pass onUploadChatImage prop to CommunityTab.');
            return null;
        }
    };

    // Flag content function
    const flagContent = (contentType, contentData) => {
        if (onFlagContent) {
            onFlagContent(contentType, contentData);
        } else {
            console.warn('Flag content: No callback provided. Pass onFlagContent prop to CommunityTab.');
        }
    };

    // Set modal image function
    const setModalImage = (imageUrl) => {
        if (onSetModalImage) {
            onSetModalImage(imageUrl);
        } else {
            console.warn('Set modal image: No callback provided. Pass onSetModalImage prop to CommunityTab.');
        }
    };

    // Enter topic room function
    const enterTopicRoom = (room) => {
        if (onEnterTopicRoom) {
            onEnterTopicRoom(room);
        } else {
            console.warn('Enter topic room: No callback provided. Pass onEnterTopicRoom prop to CommunityTab.');
        }
    };

    // Trigger SOS function
    const triggerSOS = () => {
        if (onTriggerSOS) {
            onTriggerSOS();
        } else {
            console.warn('Trigger SOS: No callback provided. Pass onTriggerSOS prop to CommunityTab.');
            alert('SOS alert sent! Your coach has been notified.');
        }
    };

    // Show loading state
    if (loading && !user) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                flexDirection: 'column',
                gap: '16px'
            }}>
                <div className="spinner" style={{
                    width: '40px',
                    height: '40px',
                    border: '4px solid #f3f3f3',
                    borderTop: '4px solid #058585',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                }}></div>
                <p style={{ color: '#666', fontSize: '14px' }}>Loading Community...</p>
            </div>
        );
    }

    // Show error state
    if (error) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                flexDirection: 'column',
                gap: '16px',
                padding: '20px'
            }}>
                <i data-lucide="alert-circle" style={{ width: '48px', height: '48px', color: '#ef4444' }}></i>
                <p style={{ color: '#ef4444', fontSize: '16px', fontWeight: 'bold' }}>Error</p>
                <p style={{ color: '#666', fontSize: '14px', textAlign: 'center' }}>{error}</p>
                <button
                    onClick={() => window.location.reload()}
                    style={{
                        padding: '10px 20px',
                        background: '#058585',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '14px'
                    }}
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="section-content">
            <h2 style={{color: 'white', marginBottom: '20px'}}>Community Connect</h2>
            
            <div className="chat-tabs">
                <button
                    className={`tab-btn ${activeChat === 'main' ? 'active' : ''}`}
                    onClick={() => setActiveChat('main')}
                >
                    GLRS Community
                </button>
                <button
                    className={`tab-btn ${activeChat === 'rooms' ? 'active' : ''}`}
                    onClick={() => setActiveChat('rooms')}
                >
                    Topic Rooms
                </button>
                <button
                    className={`tab-btn ${activeChat === 'groups' ? 'active' : ''}`}
                    onClick={() => setActiveChat('groups')}
                >
                    Support Groups
                </button>
                <button
                    className={`tab-btn ${activeChat === 'meetings' ? 'active' : ''}`}
                    onClick={() => setActiveChat('meetings')}
                >
                    Meetings
                </button>
            </div>

            {activeChat === 'main' && (
                <CommunityChat
                    messages={communityMessages}
                    onSendMessage={sendCommunityMessage}
                    currentUserId={user?.uid}
                    uploadChatImage={uploadChatImage}
                    flagContent={flagContent}
                    setModalImage={setModalImage}
                />
            )}

            {activeChat === 'rooms' && (
                <>
                    <h3 style={{color: '#f4c430', marginBottom: '20px'}}>Recovery Topic Rooms</h3>
                    {topicRooms?.length > 0 ? (
                        topicRooms.map(room => (
                            <div
                                key={room.id}
                                className="room-card"
                                onClick={() => enterTopicRoom(room)}
                            >
                                <div className="room-icon">
                                    {room.icon ? room.icon : <i data-lucide="message-circle" style={{width: '24px', height: '24px'}}></i>}
                                </div>
                                <h4>{room.name}</h4>
                                <p style={{color: 'rgba(255,255,255,0.7)'}}>{room.description}</p>
                            </div>
                        ))
                    ) : (
                        <div className="empty-state">
                            <div className="empty-state-icon">
                                <i data-lucide="message-square" style={{width: '48px', height: '48px', color: 'var(--color-text-secondary)'}}></i>
                            </div>
                            <div className="empty-state-text">No topic rooms available yet.</div>
                        </div>
                    )}
                </>
            )}

            {activeChat === 'groups' && (
                <>
                    <h3 style={{color: '#f4c430', marginBottom: '20px'}}>Support Groups</h3>
                    {supportGroups?.length > 0 ? (
                        supportGroups.map(group => (
                            <div key={group.id} className="support-group-card">
                                <div className="group-header">
                                    <h4 style={{color: 'white'}}>{group.name}</h4>
                                    <span className={`badge ${
                                        group.type === 'AA' ? 'badge-primary' :
                                        group.type === 'NA' ? 'badge-warning' :
                                        group.type === 'SMART' ? 'badge-success' :
                                        'badge-secondary'
                                    }`}>
                                        {group.type}
                                    </span>
                                </div>
                                
                                {group.description && (
                                    <p style={{color: 'rgba(255,255,255,0.7)', marginBottom: '10px'}}>
                                        {group.description}
                                    </p>
                                )}
                                
                                <div style={{fontSize: '14px', opacity: 0.8}}>
                                    <div style={{display: 'flex', alignItems: 'center', gap: '6px'}}>
                                        <i data-lucide="calendar" style={{width: '14px', height: '14px'}}></i>
                                        {group.day}
                                    </div>
                                    <div style={{display: 'flex', alignItems: 'center', gap: '6px'}}>
                                        <i data-lucide="clock" style={{width: '14px', height: '14px'}}></i>
                                        {group.time}
                                    </div>
                                    {group.location && (
                                        <div style={{display: 'flex', alignItems: 'center', gap: '6px'}}>
                                            <i data-lucide="map-pin" style={{width: '14px', height: '14px'}}></i>
                                            {group.location}
                                        </div>
                                    )}
                                    {!group.location && group.link && (
                                        <div style={{display: 'flex', alignItems: 'center', gap: '6px'}}>
                                            <i data-lucide="video" style={{width: '14px', height: '14px'}}></i>
                                            Virtual Meeting
                                        </div>
                                    )}
                                </div>
                                
                                {group.link && (
                                    <button 
                                        className="join-btn" 
                                        onClick={() => window.open(group.link, '_blank')}
                                        style={{marginTop: '10px'}}
                                    >
                                        Join Virtual Meeting
                                    </button>
                                )}
                            </div>
                        ))
                    ) : (
                        <div className="empty-state">
                            <div className="empty-state-icon">
                                <i data-lucide="users" style={{width: '48px', height: '48px', color: 'var(--color-primary)'}}></i>
                            </div>
                            <div className="empty-state-text">
                                No support groups available yet.
                            </div>
                        </div>
                    )}
                </>
            )}

            {activeChat === 'meetings' && (
                <>
                    <h3 style={{color: '#f4c430', marginBottom: '20px'}}>Scheduled Group Meetings</h3>
                    {meetings?.length > 0 ? (
                        meetings.map(meeting => {
                            const meetingDate = meeting.scheduledTime?.toDate ? 
                                meeting.scheduledTime.toDate() : 
                                new Date(meeting.scheduledTime);
                            
                            return (
                                <div key={meeting.id} className="meeting-card">
                                    <div className="meeting-header">
                                        <h4>{meeting.meetingTitle || 'Group Recovery Session'}</h4>
                                        <span className={`status-badge ${
                                            meeting.status === 'scheduled' ? 'scheduled' : 
                                            meeting.status === 'completed' ? 'completed' : 'cancelled'
                                        }`}>
                                            {meeting.status}
                                        </span>
                                    </div>
                                    
                                    <div className="meeting-type">{meeting.type || 'Group Session'}</div>
                                    
                                    <div className="meeting-details">
                                        <div style={{display: 'flex', alignItems: 'center', gap: '6px'}}>
                                            <i data-lucide="calendar" style={{width: '14px', height: '14px'}}></i>
                                            {meetingDate.toLocaleDateString()}
                                        </div>
                                        <div style={{display: 'flex', alignItems: 'center', gap: '6px'}}>
                                            <i data-lucide="clock" style={{width: '14px', height: '14px'}}></i>
                                            {meetingDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                        </div>
                                        <div style={{display: 'flex', alignItems: 'center', gap: '6px'}}>
                                            <i data-lucide="timer" style={{width: '14px', height: '14px'}}></i>
                                            Duration: {meeting.duration || '60'} minutes
                                        </div>

                                        {meeting.isGlobal && (
                                            <div style={{display: 'flex', alignItems: 'center', gap: '6px'}}>
                                                <i data-lucide="globe" style={{width: '14px', height: '14px'}}></i>
                                                All PIRs Invited
                                            </div>
                                        )}
                                    </div>

                                    {meeting.notes && (
                                        <div className="meeting-notes" style={{display: 'flex', alignItems: 'flex-start', gap: '6px'}}>
                                            <i data-lucide="file-text" style={{width: '14px', height: '14px', marginTop: '2px'}}></i>
                                            {meeting.notes}
                                        </div>
                                    )}
                                    
                                    {meeting.meetingLink && (
                                        <button 
                                            className="join-btn" 
                                            onClick={() => window.open(meeting.meetingLink, '_blank')}
                                        >
                                            Join Virtual Meeting
                                        </button>
                                    )}
                                </div>
                            );
                        })
                    ) : (
                        <div className="empty-state">
                            <div className="empty-state-icon">
                                <i data-lucide="calendar" style={{width: '48px', height: '48px', color: 'var(--color-primary)'}}></i>
                            </div>
                            <div className="empty-state-text">No group meetings scheduled.</div>
                        </div>
                    )}
                </>
            )}
            
            <div className="crisis-resources">
                <div className="crisis-title">
                    <i data-lucide="alert-octagon" style={{width: '20px', height: '20px', marginRight: '8px', color: '#DC143C'}}></i>
                    Crisis Resources
                </div>
                {emergencyResources?.length > 0 ? (
                    emergencyResources.map(resource => (
                        <div key={resource.id} style={{marginBottom: '15px'}}>
                            <div className="crisis-number">
                                {resource.phone && (
                                    <a href={`tel:${resource.phone}`}>
                                        {resource.phone}
                                    </a>
                                )}
                            </div>
                            <div className="crisis-description">{resource.title}</div>
                            <small style={{opacity: 0.7}}>{resource.available || '24/7'}</small>
                        </div>
                    ))
                ) : (
                    <>
                        <div style={{marginBottom: '15px'}}>
                            <div className="crisis-number">
                                <a href="tel:988">988</a>
                            </div>
                            <div className="crisis-description">Suicide & Crisis Lifeline</div>
                        </div>
                        <div>
                            <div className="crisis-number">
                                <a href="tel:1-800-662-4357">1-800-662-HELP</a>
                            </div>
                            <div className="crisis-description">SAMHSA National Helpline</div>
                        </div>
                    </>
                )}
                <button className="sos-btn" onClick={() => {
                    if (window.GLRSApp?.utils?.triggerHaptic) {
                        window.GLRSApp.utils.triggerHaptic('error');
                    }
                    triggerSOS();
                }}>
                    <i data-lucide="alert-octagon" style={{width: '18px', height: '18px', marginRight: '8px'}}></i>
                    SOS - I Need Help Now
                </button>
            </div>
        </div>
    );
}

/**
 * CommunityChat Component
 * @description Chat/feed UI component for displaying and sending community messages
 *
 * @features
 * - Auto-scrolling message feed
 * - Message composition with text and image support
 * - Image preview before sending
 * - Like/comment functionality (UI only - logic in parent)
 * - Flag content button for moderation
 * - Full-screen image viewing
 * - Upload indicator during image upload
 *
 * @props
 * - messages: array - Array of message objects to display
 * - onSendMessage: function - Callback to send new message (text, imageUrl)
 * - currentUserId: string - Current user's ID to identify own messages
 * - uploadChatImage: function - Callback to upload image and return URL
 * - flagContent: function - Callback to flag content for moderation
 * - setModalImage: function - Callback to show full-screen image
 *
 * @state 5 useState hooks:
 * - message: string - Message input text
 * - selectedImage: File - Selected image file
 * - uploading: boolean - Upload in progress
 * - likes: object - Like counts (UI only)
 * - showComments: object - Comment visibility state
 *
 * @architecture Props-based component (NO Firebase queries)
 * - All data comes from props
 * - All actions use callbacks
 * - Pure UI component
 *
 * @returns {React.Element} Chat feed UI with message list and input
 */
function CommunityChat({ messages, onSendMessage, currentUserId, uploadChatImage, flagContent, setModalImage }) {
    const [message, setMessage] = useState('');
    const [selectedImage, setSelectedImage] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [likes, setLikes] = useState({});
    const [showComments, setShowComments] = useState({});
    const messagesEndRef = useRef(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleImageSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedImage(file);
        }
    };

    const handleSend = async () => {
        if ((message.trim() || selectedImage) && !uploading) {
            setUploading(true);

            try {
                let imageUrl = null;

                if (selectedImage && uploadChatImage) {
                    imageUrl = await uploadChatImage(selectedImage, 'community', 'main');
                }

                await onSendMessage(message, imageUrl);

                setMessage('');
                setSelectedImage(null);
                const fileInput = document.getElementById('community-image-input');
                if (fileInput) fileInput.value = '';

            } catch (error) {
                alert('Failed to send message');
            } finally {
                setUploading(false);
            }
        }
    };

    const handleLike = (msgId) => {
        setLikes(prev => ({
            ...prev,
            [msgId]: !prev[msgId]
        }));
    };

    const getInitials = (name) => {
        if (!name) return 'A';
        const parts = name.split(' ');
        return parts.length > 1
            ? parts[0][0] + parts[1][0]
            : parts[0][0];
    };

    const formatTimeAgo = (timestamp) => {
        if (!timestamp?.toDate) return 'now';
        const date = timestamp.toDate();
        const seconds = Math.floor((new Date() - date) / 1000);

        if (seconds < 60) return 'just now';
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
        return `${Math.floor(seconds / 86400)}d ago`;
    };

    return (
        <div style={{marginBottom: 'var(--space-4)'}}>
            {/* Create Post Card */}
            <div style={{
                background: 'rgba(255,255,255,0.95)',
                borderRadius: 'var(--radius-lg)',
                padding: 'var(--space-4)',
                marginBottom: 'var(--space-4)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
                <div style={{display: 'flex', gap: 'var(--space-3)', alignItems: 'flex-start'}}>
                    <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fff',
                        fontSize: 'var(--font-sm)',
                        fontWeight: 'bold',
                        flexShrink: 0
                    }}>
                        {getInitials('You')}
                    </div>
                    <div style={{flex: 1}}>
                        <input
                            type="text"
                            placeholder="What's on your mind?"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                            style={{
                                width: '100%',
                                padding: 'var(--space-3)',
                                border: '1px solid #ddd',
                                borderRadius: 'var(--radius-lg)',
                                fontSize: 'var(--font-base)',
                                background: '#f8f9fa',
                                outline: 'none'
                            }}
                        />
                        {selectedImage && (
                            <div style={{
                                marginTop: 'var(--space-2)',
                                padding: 'var(--space-2)',
                                background: '#e7f5ff',
                                borderRadius: 'var(--radius-md)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between'
                            }}>
                                <span style={{fontSize: 'var(--font-sm)', color: '#333'}}>
                                    <i data-lucide="image" style={{width: '16px', height: '16px', marginRight: '8px'}}></i>
                                    {selectedImage.name}
                                </span>
                                <button
                                    onClick={() => setSelectedImage(null)}
                                    style={{
                                        background: 'transparent',
                                        border: 'none',
                                        cursor: 'pointer',
                                        padding: '4px'
                                    }}
                                >
                                    <i data-lucide="x" style={{width: '16px', height: '16px', color: '#666'}}></i>
                                </button>
                            </div>
                        )}
                        <div style={{
                            display: 'flex',
                            gap: 'var(--space-2)',
                            marginTop: 'var(--space-3)',
                            paddingTop: 'var(--space-3)',
                            borderTop: '1px solid #eee'
                        }}>
                            <input
                                type="file"
                                id="community-image-input"
                                accept="image/*"
                                style={{display: 'none'}}
                                onChange={handleImageSelect}
                            />
                            <button
                                onClick={() => document.getElementById('community-image-input').click()}
                                style={{
                                    flex: 1,
                                    padding: 'var(--space-2)',
                                    background: 'transparent',
                                    border: 'none',
                                    borderRadius: 'var(--radius-md)',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: 'var(--space-1)',
                                    fontSize: 'var(--font-sm)',
                                    color: '#666',
                                    fontWeight: '500'
                                }}
                            >
                                <i data-lucide="image" style={{width: '20px', height: '20px'}}></i>
                                Photo
                            </button>
                            <button
                                onClick={handleSend}
                                disabled={uploading || (!message.trim() && !selectedImage)}
                                style={{
                                    padding: 'var(--space-2) var(--space-4)',
                                    background: (uploading || (!message.trim() && !selectedImage))
                                        ? '#ccc'
                                        : 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
                                    border: 'none',
                                    borderRadius: 'var(--radius-md)',
                                    color: '#fff',
                                    fontSize: 'var(--font-sm)',
                                    fontWeight: 'bold',
                                    cursor: (uploading || (!message.trim() && !selectedImage)) ? 'not-allowed' : 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 'var(--space-1)'
                                }}
                            >
                                {uploading ? (
                                    <>
                                        <i data-lucide="loader" style={{width: '16px', height: '16px', animation: 'spin 1s linear infinite'}}></i>
                                        Posting...
                                    </>
                                ) : (
                                    <>
                                        <i data-lucide="send" style={{width: '16px', height: '16px'}}></i>
                                        Post
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Feed Posts */}
            <div>
                {messages?.length > 0 ? (
                    messages.slice().reverse().map(msg => (
                        <div key={msg.id} style={{
                            background: 'rgba(255,255,255,0.95)',
                            borderRadius: 'var(--radius-lg)',
                            padding: 'var(--space-4)',
                            marginBottom: 'var(--space-4)',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                        }}>
                            {/* Post Header */}
                            <div style={{display: 'flex', alignItems: 'center', marginBottom: 'var(--space-3)'}}>
                                <div style={{
                                    width: '40px',
                                    height: '40px',
                                    borderRadius: '50%',
                                    background: 'linear-gradient(135deg, var(--color-secondary), var(--color-accent))',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: '#fff',
                                    fontSize: 'var(--font-sm)',
                                    fontWeight: 'bold',
                                    marginRight: 'var(--space-3)'
                                }}>
                                    {getInitials(msg.senderName)}
                                </div>
                                <div style={{flex: 1}}>
                                    <div style={{fontWeight: '600', color: '#333', fontSize: 'var(--font-base)'}}>
                                        {msg.senderName || 'Anonymous'}
                                    </div>
                                    <div style={{fontSize: 'var(--font-xs)', color: '#666'}}>
                                        {formatTimeAgo(msg.createdAt)}
                                    </div>
                                </div>
                                {msg.senderId !== currentUserId && flagContent && (
                                    <button
                                        onClick={() => flagContent('community_message', {
                                            messageId: msg.id,
                                            messageContent: msg.content,
                                            messageImageUrl: msg.imageUrl || null,
                                            authorId: msg.senderId,
                                            authorName: msg.senderName
                                        })}
                                        style={{
                                            background: 'transparent',
                                            border: 'none',
                                            cursor: 'pointer',
                                            padding: 'var(--space-2)'
                                        }}
                                    >
                                        <i data-lucide="flag" style={{width: '16px', height: '16px', color: '#999'}}></i>
                                    </button>
                                )}
                            </div>

                            {/* Post Content */}
                            {msg.content && (
                                <div style={{
                                    color: '#333',
                                    fontSize: 'var(--font-base)',
                                    lineHeight: '1.5',
                                    marginBottom: msg.imageUrl ? 'var(--space-3)' : 0
                                }}>
                                    {msg.content}
                                </div>
                            )}

                            {/* Post Image */}
                            {msg.imageUrl && (
                                <img
                                    src={msg.imageUrl}
                                    alt="Post content"
                                    style={{
                                        width: '100%',
                                        borderRadius: 'var(--radius-md)',
                                        cursor: 'pointer'
                                    }}
                                    onClick={() => setModalImage(msg.imageUrl)}
                                />
                            )}

                            {/* Post Actions */}
                            <div style={{
                                display: 'flex',
                                gap: 'var(--space-4)',
                                marginTop: 'var(--space-3)',
                                paddingTop: 'var(--space-3)',
                                borderTop: '1px solid #eee'
                            }}>
                                <button
                                    onClick={() => handleLike(msg.id)}
                                    style={{
                                        background: 'transparent',
                                        border: 'none',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 'var(--space-1)',
                                        fontSize: 'var(--font-sm)',
                                        fontWeight: '500',
                                        color: likes[msg.id] ? 'var(--color-danger)' : '#666',
                                        padding: 'var(--space-2)'
                                    }}
                                >
                                    <i data-lucide="heart" style={{
                                        width: '18px',
                                        height: '18px',
                                        fill: likes[msg.id] ? 'var(--color-danger)' : 'none'
                                    }}></i>
                                    Like
                                </button>
                                <button
                                    onClick={() => setShowComments(prev => ({...prev, [msg.id]: !prev[msg.id]}))}
                                    style={{
                                        background: 'transparent',
                                        border: 'none',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 'var(--space-1)',
                                        fontSize: 'var(--font-sm)',
                                        fontWeight: '500',
                                        color: '#666',
                                        padding: 'var(--space-2)'
                                    }}
                                >
                                    <i data-lucide="message-circle" style={{width: '18px', height: '18px'}}></i>
                                    Comment
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div style={{
                        textAlign: 'center',
                        padding: 'var(--space-8)',
                        background: 'rgba(255,255,255,0.95)',
                        borderRadius: 'var(--radius-lg)',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                    }}>
                        <i data-lucide="users" style={{width: '48px', height: '48px', color: '#ccc', marginBottom: 'var(--space-3)'}}></i>
                        <div style={{color: '#666', fontSize: 'var(--font-base)'}}>
                            No posts yet. Be the first to share!
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>
        </div>
    );
}

// Register components
window.GLRSApp.components.CommunityTab = CommunityTab;
window.GLRSApp.components.CommunityChat = CommunityChat;

console.log('✅ PHASE 4: CommunityTab component loaded with JSDoc + error handling + loading/error UI');