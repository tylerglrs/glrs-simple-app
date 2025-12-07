/**
 * MessagesTab.js
 * Complete Messages Tab - All functionality in one file
 * Project: Lighthouse - Messages Tab Implementation
 *
 * Contains:
 * - MessagesTab (conversation list)
 * - MessageThread (message display)
 * - MessageInput (typing + sending + image upload)
 * - NewConversationModal (start new conversations)
 * - ImageLightbox (full-screen image viewer)
 * - All features: typing indicators, read receipts, optimistic UI, image messages
 */

const { useState, useEffect, useRef, useMemo, useCallback } = React;

// ============================================
// INLINE SVG ICONS (React-compatible, no Lucide createIcons needed)
// ============================================
const Icons = {
  X: ({ size = 24, color = 'currentColor', style = {} }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}>
      <line x1="18" y1="6" x2="6" y2="18"></line>
      <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
  ),
  ArrowLeft: ({ size = 24, color = 'currentColor', style = {} }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}>
      <line x1="19" y1="12" x2="5" y2="12"></line>
      <polyline points="12 19 5 12 12 5"></polyline>
    </svg>
  ),
  Search: ({ size = 24, color = 'currentColor', style = {} }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}>
      <circle cx="11" cy="11" r="8"></circle>
      <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
    </svg>
  ),
  Users: ({ size = 24, color = 'currentColor', style = {} }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}>
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
      <circle cx="9" cy="7" r="4"></circle>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
    </svg>
  ),
  BadgeCheck: ({ size = 24, color = 'currentColor', style = {} }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}>
      <path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z"></path>
      <path d="m9 12 2 2 4-4"></path>
    </svg>
  ),
  ChevronRight: ({ size = 24, color = 'currentColor', style = {} }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}>
      <polyline points="9 18 15 12 9 6"></polyline>
    </svg>
  ),
  ChevronDown: ({ size = 24, color = 'currentColor', style = {} }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}>
      <polyline points="6 9 12 15 18 9"></polyline>
    </svg>
  ),
  Send: ({ size = 24, color = 'currentColor', style = {} }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}>
      <line x1="22" y1="2" x2="11" y2="13"></line>
      <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
    </svg>
  ),
  Image: ({ size = 24, color = 'currentColor', style = {} }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}>
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
      <circle cx="8.5" cy="8.5" r="1.5"></circle>
      <polyline points="21 15 16 10 5 21"></polyline>
    </svg>
  ),
  Check: ({ size = 24, color = 'currentColor', style = {} }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}>
      <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
  ),
  CheckCheck: ({ size = 24, color = 'currentColor', style = {} }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}>
      <path d="M18 6 7 17l-5-5"></path>
      <path d="m22 10-7.5 7.5L13 16"></path>
    </svg>
  ),
  MessageCircle: ({ size = 24, color = 'currentColor', style = {} }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}>
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
    </svg>
  ),
  MessageSquare: ({ size = 24, color = 'currentColor', style = {} }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}>
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
    </svg>
  ),
  Edit: ({ size = 24, color = 'currentColor', style = {} }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}>
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
    </svg>
  ),
  Plus: ({ size = 24, color = 'currentColor', style = {} }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}>
      <line x1="12" y1="5" x2="12" y2="19"></line>
      <line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
  )
};

// ============================================
// IMAGE LIGHTBOX COMPONENT
// ============================================
const ImageLightbox = ({ imageUrl, onClose }) => {
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.95)',
        zIndex: 10000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        cursor: 'zoom-out'
      }}
    >
      <button
        onClick={onClose}
        style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          background: 'rgba(255, 255, 255, 0.1)',
          border: 'none',
          borderRadius: '50%',
          width: '44px',
          height: '44px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          color: '#FFFFFF'
        }}
        aria-label="Close"
      >
        <Icons.X size={24} />
      </button>
      <img
        src={imageUrl}
        alt="Full size"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '100%',
          maxHeight: '100%',
          objectFit: 'contain',
          borderRadius: '8px',
          cursor: 'default'
        }}
      />
    </div>
  );
};

// ============================================
// NEW CONVERSATION MODAL COMPONENT
// ============================================
const NewConversationModal = ({ currentUserId, userData, onClose, onSelectRecipient, isMobile }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [eligibleUsers, setEligibleUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [step, setStep] = useState(1); // 1 = select recipient, 2 = compose
  const [messageText, setMessageText] = useState('');
  const [sending, setSending] = useState(false);
  const searchInputRef = useRef(null);

  // Fetch eligible users on mount
  useEffect(() => {
    const fetchEligibleUsers = async () => {
      setLoading(true);
      try {
        const users = [];

        // 1. First, get the user's assigned coach (always messageable)
        if (userData?.assignedCoach) {
          const coachDoc = await db.collection('users').doc(userData.assignedCoach).get();
          if (coachDoc.exists) {
            const coachData = coachDoc.data();
            users.push({
              id: coachDoc.id,
              name: `${coachData.firstName || ''} ${coachData.lastName || ''}`.trim() || 'Your Coach',
              role: coachData.role || 'coach',
              avatar: coachData.photoURL || null,
              isCoach: true,
              verified: true
            });
          }
        }

        // 2. Get users with public profiles who allow direct messages
        const publicUsersSnapshot = await db.collection('users')
          .where('privacy.profileVisibility', '==', 'everyone')
          .where('privacy.allowDirectMessages', '==', true)
          .limit(50)
          .get();

        publicUsersSnapshot.docs.forEach(doc => {
          // Don't add self or duplicates (coach might appear twice)
          if (doc.id !== currentUserId && !users.find(u => u.id === doc.id)) {
            const data = doc.data();
            // Only add PIRs (not coaches/admins unless they're the assigned coach)
            if (data.role === 'pir' || data.role === 'user') {
              users.push({
                id: doc.id,
                name: `${data.firstName || ''} ${data.lastName || ''}`.trim() || 'User',
                role: data.role || 'pir',
                avatar: data.photoURL || null,
                isCoach: false,
                verified: false
              });
            }
          }
        });

        setEligibleUsers(users);
      } catch (error) {
        console.error('Error fetching eligible users:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEligibleUsers();
  }, [currentUserId, userData?.assignedCoach]);

  // Focus search input on mount
  useEffect(() => {
    if (searchInputRef.current && step === 1) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  }, [step]);

  // Filter users by search query
  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return eligibleUsers;
    const query = searchQuery.toLowerCase();
    return eligibleUsers.filter(user =>
      user.name.toLowerCase().includes(query)
    );
  }, [eligibleUsers, searchQuery]);

  // Handle user selection
  const handleSelectUser = (user) => {
    setSelectedUser(user);
    setStep(2);
  };

  // Handle sending first message
  const handleSendMessage = async () => {
    if (!messageText.trim() || !selectedUser || sending) return;

    setSending(true);
    try {
      // Check if conversation already exists
      const existingConvo = await db.collection('conversations')
        .where('participants', 'array-contains', currentUserId)
        .get();

      let conversationId = null;
      const sortedParticipants = [currentUserId, selectedUser.id].sort();

      for (const doc of existingConvo.docs) {
        const data = doc.data();
        if (data.participants.includes(selectedUser.id)) {
          conversationId = doc.id;
          break;
        }
      }

      // Create new conversation if doesn't exist
      if (!conversationId) {
        const newConvoRef = await db.collection('conversations').add({
          participants: sortedParticipants,
          participantDetails: {
            [currentUserId]: {
              name: `${userData?.firstName || ''} ${userData?.lastName || ''}`.trim() || 'You',
              avatar: userData?.photoURL || null,
              role: userData?.role || 'pir'
            },
            [selectedUser.id]: {
              name: selectedUser.name,
              avatar: selectedUser.avatar,
              role: selectedUser.role
            }
          },
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
          lastMessageTimestamp: firebase.firestore.FieldValue.serverTimestamp(),
          lastMessage: null,
          unreadCount: {
            [currentUserId]: 0,
            [selectedUser.id]: 0
          },
          typing: {}
        });
        conversationId = newConvoRef.id;
      }

      // Send the message
      await db.collection('messages').add({
        conversationId: conversationId,
        senderId: currentUserId,
        recipientId: selectedUser.id,
        text: messageText.trim(),
        type: 'text',
        status: 'sent',
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
        readAt: null
      });

      // Update conversation
      await db.collection('conversations').doc(conversationId).update({
        lastMessage: {
          text: messageText.trim().length > 50 ? messageText.trim().substring(0, 50) + '...' : messageText.trim(),
          senderId: currentUserId,
          timestamp: firebase.firestore.FieldValue.serverTimestamp(),
          type: 'text'
        },
        lastMessageTimestamp: firebase.firestore.FieldValue.serverTimestamp(),
        [`unreadCount.${selectedUser.id}`]: firebase.firestore.FieldValue.increment(1)
      });

      if (typeof window.triggerHaptic === 'function') {
        window.triggerHaptic();
      }

      // Pass the conversation to parent
      onSelectRecipient({
        id: conversationId,
        participants: sortedParticipants,
        participantDetails: {
          [currentUserId]: {
            name: `${userData?.firstName || ''} ${userData?.lastName || ''}`.trim() || 'You',
            avatar: userData?.photoURL || null,
            role: userData?.role || 'pir'
          },
          [selectedUser.id]: {
            name: selectedUser.name,
            avatar: selectedUser.avatar,
            role: selectedUser.role
          }
        }
      });

      onClose();
    } catch (error) {
      console.error('Error starting conversation:', error);
      alert('Failed to start conversation. Please try again.');
    } finally {
      setSending(false);
    }
  };

  // Animation styles
  const modalAnimation = `
    @keyframes slideInFromRight {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: scale(0.95); }
      to { opacity: 1; transform: scale(1); }
    }
  `;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      zIndex: 9999,
      display: 'flex',
      alignItems: isMobile ? 'stretch' : 'center',
      justifyContent: 'center'
    }}>
      <style>{modalAnimation}</style>

      <div style={{
        width: isMobile ? '100%' : '440px',
        maxWidth: '100%',
        height: isMobile ? '100%' : 'auto',
        maxHeight: isMobile ? '100%' : '85vh',
        backgroundColor: '#FFFFFF',
        borderRadius: isMobile ? '0' : '16px',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        boxShadow: isMobile ? 'none' : '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        animation: isMobile ? 'slideInFromRight 0.3s ease-out' : 'fadeIn 0.2s ease-out'
      }}>
        {/* Header */}
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid #E5E7EB',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          backgroundColor: '#FFFFFF'
        }}>
          {step === 2 ? (
            <button
              onClick={() => { setStep(1); setSelectedUser(null); setMessageText(''); }}
              style={{
                background: 'none',
                border: 'none',
                padding: '8px',
                marginLeft: '-8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#058585',
                borderRadius: '8px'
              }}
              aria-label="Back"
            >
              <Icons.ArrowLeft size={22} />
            </button>
          ) : null}

          <h2 style={{
            margin: 0,
            fontSize: '18px',
            fontWeight: '600',
            color: '#111827',
            flex: 1
          }}>
            {step === 1 ? 'New Message' : 'New Conversation'}
          </h2>

          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              padding: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#6B7280',
              borderRadius: '8px',
              transition: 'all 0.15s'
            }}
            aria-label="Close"
          >
            <Icons.X size={22} />
          </button>
        </div>

        {/* Step 1: Select Recipient */}
        {step === 1 && (
          <>
            {/* Search Input */}
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #F3F4F6' }}>
              <div style={{ position: 'relative' }}>
                <span style={{
                  position: 'absolute',
                  left: '14px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Icons.Search size={18} color="#9CA3AF" />
                </span>
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search people..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 16px 12px 44px',
                    backgroundColor: '#F9FAFB',
                    border: '1px solid #E5E7EB',
                    borderRadius: '12px',
                    fontSize: '15px',
                    color: '#111827',
                    outline: 'none',
                    transition: 'all 0.15s'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#058585';
                    e.target.style.backgroundColor = '#FFFFFF';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#E5E7EB';
                    e.target.style.backgroundColor = '#F9FAFB';
                  }}
                />
              </div>
            </div>

            {/* User List */}
            <div style={{ flex: 1, overflowY: 'auto' }}>
              {loading ? (
                <div style={{ padding: '40px 20px', textAlign: 'center' }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    border: '3px solid #E5E7EB',
                    borderTopColor: '#058585',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                    margin: '0 auto 12px'
                  }}></div>
                  <div style={{ fontSize: '14px', color: '#6B7280' }}>Loading contacts...</div>
                </div>
              ) : filteredUsers.length === 0 ? (
                <div style={{ padding: '40px 20px', textAlign: 'center' }}>
                  <div style={{ marginBottom: '12px', display: 'flex', justifyContent: 'center' }}>
                    <Icons.Users size={48} color="#E5E7EB" />
                  </div>
                  <div style={{ fontSize: '15px', fontWeight: '600', color: '#374151', marginBottom: '4px' }}>
                    {searchQuery ? 'No results found' : 'No contacts available'}
                  </div>
                  <div style={{ fontSize: '13px', color: '#6B7280' }}>
                    {searchQuery ? 'Try a different search' : 'Users must have public profiles to receive messages'}
                  </div>
                </div>
              ) : (
                <>
                  {/* Coach Section */}
                  {filteredUsers.some(u => u.isCoach) && (
                    <div style={{ padding: '8px 20px' }}>
                      <div style={{
                        fontSize: '11px',
                        fontWeight: '600',
                        color: '#6B7280',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}>
                        Your Coach
                      </div>
                    </div>
                  )}

                  {filteredUsers.filter(u => u.isCoach).map(user => (
                    <div
                      key={user.id}
                      onClick={() => handleSelectUser(user)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '12px 20px',
                        cursor: 'pointer',
                        transition: 'background 0.15s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F9FAFB'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <div style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #058585 0%, #047272 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#FFFFFF',
                        fontSize: '18px',
                        fontWeight: '600',
                        flexShrink: 0,
                        backgroundImage: user.avatar ? `url(${user.avatar})` : 'none',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        position: 'relative'
                      }}>
                        {!user.avatar && user.name[0]?.toUpperCase()}
                        {user.verified && (
                          <div style={{
                            position: 'absolute',
                            bottom: '-2px',
                            right: '-2px',
                            width: '18px',
                            height: '18px',
                            backgroundColor: '#FFFFFF',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            <Icons.BadgeCheck size={14} color="#058585" />
                          </div>
                        )}
                      </div>

                      <div style={{ flex: 1 }}>
                        <div style={{
                          fontSize: '15px',
                          fontWeight: '600',
                          color: '#111827',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}>
                          {user.name}
                        </div>
                        <div style={{
                          fontSize: '13px',
                          color: '#058585',
                          fontWeight: '500',
                          textTransform: 'capitalize'
                        }}>
                          {user.role}
                        </div>
                      </div>

                      <Icons.ChevronRight size={20} color="#D1D5DB" />
                    </div>
                  ))}

                  {/* Peers Section */}
                  {filteredUsers.some(u => !u.isCoach) && (
                    <div style={{ padding: '16px 20px 8px' }}>
                      <div style={{
                        fontSize: '11px',
                        fontWeight: '600',
                        color: '#6B7280',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}>
                        Community Members
                      </div>
                    </div>
                  )}

                  {filteredUsers.filter(u => !u.isCoach).map(user => (
                    <div
                      key={user.id}
                      onClick={() => handleSelectUser(user)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '12px 20px',
                        cursor: 'pointer',
                        transition: 'background 0.15s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F9FAFB'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <div style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '50%',
                        backgroundColor: '#E5E7EB',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#6B7280',
                        fontSize: '18px',
                        fontWeight: '600',
                        flexShrink: 0,
                        backgroundImage: user.avatar ? `url(${user.avatar})` : 'none',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center'
                      }}>
                        {!user.avatar && user.name[0]?.toUpperCase()}
                      </div>

                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '15px', fontWeight: '500', color: '#111827' }}>
                          {user.name}
                        </div>
                        <div style={{ fontSize: '13px', color: '#6B7280', textTransform: 'capitalize' }}>
                          {user.role === 'pir' ? 'Recovery Member' : user.role}
                        </div>
                      </div>

                      <Icons.ChevronRight size={20} color="#D1D5DB" />
                    </div>
                  ))}
                </>
              )}
            </div>
          </>
        )}

        {/* Step 2: Compose Message */}
        {step === 2 && selectedUser && (
          <>
            {/* Selected User Header */}
            <div style={{
              padding: '16px 20px',
              backgroundColor: '#F9FAFB',
              borderBottom: '1px solid #E5E7EB',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <div style={{
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                background: selectedUser.isCoach
                  ? 'linear-gradient(135deg, #058585 0%, #047272 100%)'
                  : '#E5E7EB',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: selectedUser.isCoach ? '#FFFFFF' : '#6B7280',
                fontSize: '16px',
                fontWeight: '600',
                flexShrink: 0,
                backgroundImage: selectedUser.avatar ? `url(${selectedUser.avatar})` : 'none',
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}>
                {!selectedUser.avatar && selectedUser.name[0]?.toUpperCase()}
              </div>

              <div>
                <div style={{ fontSize: '15px', fontWeight: '600', color: '#111827' }}>
                  {selectedUser.name}
                </div>
                <div style={{
                  fontSize: '13px',
                  color: selectedUser.isCoach ? '#058585' : '#6B7280',
                  textTransform: 'capitalize'
                }}>
                  {selectedUser.isCoach ? 'Your Coach' : selectedUser.role === 'pir' ? 'Recovery Member' : selectedUser.role}
                </div>
              </div>
            </div>

            {/* Message Input Area */}
            <div style={{ flex: 1, padding: '20px', display: 'flex', flexDirection: 'column' }}>
              <textarea
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder="Write your message..."
                autoFocus
                style={{
                  flex: 1,
                  minHeight: '120px',
                  padding: '16px',
                  backgroundColor: '#F9FAFB',
                  border: '1px solid #E5E7EB',
                  borderRadius: '12px',
                  fontSize: '15px',
                  lineHeight: '1.5',
                  color: '#111827',
                  resize: 'none',
                  outline: 'none',
                  fontFamily: 'inherit',
                  transition: 'all 0.15s'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#058585';
                  e.target.style.backgroundColor = '#FFFFFF';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#E5E7EB';
                  e.target.style.backgroundColor = '#F9FAFB';
                }}
              />

              <div style={{
                display: 'flex',
                justifyContent: 'flex-end',
                marginTop: '16px'
              }}>
                <button
                  onClick={handleSendMessage}
                  disabled={!messageText.trim() || sending}
                  style={{
                    padding: '12px 24px',
                    background: messageText.trim() && !sending
                      ? 'linear-gradient(135deg, #058585 0%, #047272 100%)'
                      : '#E5E7EB',
                    color: messageText.trim() && !sending ? '#FFFFFF' : '#9CA3AF',
                    border: 'none',
                    borderRadius: '10px',
                    fontSize: '15px',
                    fontWeight: '600',
                    cursor: messageText.trim() && !sending ? 'pointer' : 'not-allowed',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'all 0.15s',
                    boxShadow: messageText.trim() && !sending ? '0 2px 8px rgba(5, 133, 133, 0.25)' : 'none'
                  }}
                >
                  {sending ? (
                    <>
                      <div style={{
                        width: '18px',
                        height: '18px',
                        border: '2px solid rgba(255,255,255,0.3)',
                        borderTopColor: '#FFFFFF',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite'
                      }}></div>
                      Sending...
                    </>
                  ) : (
                    <>
                      <Icons.Send size={18} />
                      Send Message
                    </>
                  )}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// ============================================
// MESSAGE INPUT COMPONENT (with image upload)
// ============================================
const MessageInput = ({ conversation, currentUserId, onSendMessage, isMobile }) => {
  const [messageText, setMessageText] = useState('');
  const [sending, setSending] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const maxLength = 1000;

  // Typing indicator state
  const [lastTypingUpdate, setLastTypingUpdate] = useState(0);
  const typingTimeoutRef = useRef(null);

  // Update typing status in Firestore
  const updateTypingStatus = async (isTyping) => {
    if (!conversation?.id || !currentUserId) return;

    try {
      await db.collection('conversations').doc(conversation.id).update({
        [`typing.${currentUserId}`]: isTyping
          ? firebase.firestore.FieldValue.serverTimestamp()
          : null
      });
    } catch (error) {
      console.debug('Typing status update failed:', error.message);
    }
  };

  // Clear typing indicator on unmount or conversation change
  useEffect(() => {
    return () => {
      updateTypingStatus(false);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [conversation?.id]);

  // Auto-resize textarea based on content
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const newHeight = Math.min(textareaRef.current.scrollHeight, 120);
      textareaRef.current.style.height = `${newHeight}px`;
    }
  }, [messageText]);

  // Handle image upload
  const handleImageSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !conversation?.id) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image must be less than 5MB');
      return;
    }

    setUploadingImage(true);
    const otherUserId = conversation.participants.find(id => id !== currentUserId);

    try {
      // Create a unique filename
      const timestamp = Date.now();
      const filename = `messages/${conversation.id}/${timestamp}_${file.name}`;
      const storageRef = firebase.storage().ref(filename);

      // Upload the file
      const uploadTask = await storageRef.put(file);
      const imageUrl = await uploadTask.ref.getDownloadURL();

      // Create optimistic message
      const tempId = `temp_${timestamp}`;
      const newMessage = {
        id: tempId,
        conversationId: conversation.id,
        senderId: currentUserId,
        recipientId: otherUserId,
        text: null,
        type: 'image',
        imageUrl: imageUrl,
        status: 'sent',
        createdAt: {
          toDate: () => new Date(),
          toMillis: () => Date.now()
        },
        _isOptimistic: true
      };

      if (onSendMessage) {
        onSendMessage(newMessage);
      }

      // Save message to Firestore
      await db.collection('messages').add({
        conversationId: conversation.id,
        senderId: currentUserId,
        recipientId: otherUserId,
        text: null,
        type: 'image',
        imageUrl: imageUrl,
        status: 'sent',
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
        readAt: null
      });

      // Update conversation
      await db.collection('conversations').doc(conversation.id).update({
        lastMessage: {
          text: 'Sent an image',
          senderId: currentUserId,
          timestamp: firebase.firestore.FieldValue.serverTimestamp(),
          type: 'image'
        },
        lastMessageTimestamp: firebase.firestore.FieldValue.serverTimestamp(),
        [`unreadCount.${otherUserId}`]: firebase.firestore.FieldValue.increment(1),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      });

      if (typeof window.triggerHaptic === 'function') {
        window.triggerHaptic();
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image. Please try again.');
    } finally {
      setUploadingImage(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Handle sending text message
  const handleSend = async () => {
    const trimmed = messageText.trim();
    if (!trimmed || sending || !conversation?.id) return;

    updateTypingStatus(false);
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    setSending(true);
    const tempId = `temp_${Date.now()}`;
    const otherUserId = conversation.participants.find(id => id !== currentUserId);

    const newMessage = {
      id: tempId,
      conversationId: conversation.id,
      senderId: currentUserId,
      recipientId: otherUserId,
      text: trimmed,
      type: 'text',
      status: 'sent',
      createdAt: {
        toDate: () => new Date(),
        toMillis: () => Date.now()
      },
      updatedAt: null,
      readAt: null,
      _isOptimistic: true
    };

    if (onSendMessage) {
      onSendMessage(newMessage);
    }

    setMessageText('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    try {
      const messageRef = await db.collection('messages').add({
        conversationId: conversation.id,
        senderId: currentUserId,
        recipientId: otherUserId,
        text: trimmed,
        type: 'text',
        status: 'sent',
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
        readAt: null
      });

      await db.collection('conversations').doc(conversation.id).update({
        lastMessage: {
          text: trimmed.length > 50 ? trimmed.substring(0, 50) + '...' : trimmed,
          senderId: currentUserId,
          timestamp: firebase.firestore.FieldValue.serverTimestamp(),
          type: 'text'
        },
        lastMessageTimestamp: firebase.firestore.FieldValue.serverTimestamp(),
        [`unreadCount.${otherUserId}`]: firebase.firestore.FieldValue.increment(1),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      });

      if (typeof window.triggerHaptic === 'function') {
        window.triggerHaptic();
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
      setMessageText(trimmed);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleChange = (e) => {
    const value = e.target.value;
    if (value.length <= maxLength) {
      setMessageText(value);

      if (value.length > 0) {
        const now = Date.now();
        if (now - lastTypingUpdate > 1000) {
          updateTypingStatus(true);
          setLastTypingUpdate(now);
        }

        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }

        typingTimeoutRef.current = setTimeout(() => {
          updateTypingStatus(false);
        }, 3000);
      } else {
        updateTypingStatus(false);
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }
      }
    }
  };

  const canSend = messageText.trim().length > 0 && !sending;
  const charCount = messageText.length;
  const showCharCount = charCount > 800;

  return (
    <div style={{
      padding: isMobile ? '10px 12px' : '12px 16px',
      borderTop: '1px solid #E5E7EB',
      backgroundColor: '#FFFFFF',
      display: 'flex',
      alignItems: 'flex-end',
      gap: '8px'
    }}>
      {/* Image Upload Button */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageSelect}
        style={{ display: 'none' }}
      />
      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={uploadingImage}
        style={{
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          border: 'none',
          backgroundColor: uploadingImage ? '#E5E7EB' : '#F3F4F6',
          color: uploadingImage ? '#9CA3AF' : '#6B7280',
          cursor: uploadingImage ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.15s',
          flexShrink: 0
        }}
        aria-label="Attach image"
      >
        {uploadingImage ? (
          <div style={{
            width: '18px',
            height: '18px',
            border: '2px solid #D1D5DB',
            borderTopColor: '#6B7280',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}></div>
        ) : (
          <Icons.Image size={20} />
        )}
      </button>

      {/* Text Input */}
      <div style={{ flex: 1, position: 'relative' }}>
        <textarea
          ref={textareaRef}
          value={messageText}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          disabled={sending}
          rows={1}
          style={{
            width: '100%',
            minHeight: '40px',
            maxHeight: '120px',
            padding: '10px 16px',
            paddingRight: showCharCount ? '50px' : '16px',
            backgroundColor: '#F8F9FA',
            border: '1px solid #E5E7EB',
            borderRadius: '20px',
            color: '#2C3E50',
            fontSize: isMobile ? '14px' : '15px',
            lineHeight: '1.4',
            resize: 'none',
            fontFamily: 'inherit',
            outline: 'none',
            boxSizing: 'border-box',
            transition: 'border-color 0.15s ease'
          }}
          onFocus={(e) => {
            e.target.style.borderColor = '#058585';
            e.target.style.boxShadow = '0 0 0 2px rgba(5, 133, 133, 0.1)';
          }}
          onBlur={(e) => {
            e.target.style.borderColor = '#E5E7EB';
            e.target.style.boxShadow = 'none';
          }}
          aria-label="Type a message"
        />
        {showCharCount && (
          <span style={{
            position: 'absolute',
            right: '12px',
            bottom: '10px',
            fontSize: '11px',
            color: charCount >= maxLength ? '#EF4444' : '#9CA3AF',
            fontWeight: charCount >= maxLength ? '600' : '400',
            pointerEvents: 'none'
          }}>
            {charCount}/{maxLength}
          </span>
        )}
      </div>

      {/* Send Button */}
      <button
        onClick={handleSend}
        disabled={!canSend}
        style={{
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          border: 'none',
          background: canSend ? 'linear-gradient(135deg, #058585 0%, #047272 100%)' : '#E5E7EB',
          color: canSend ? '#FFFFFF' : '#9CA3AF',
          cursor: canSend ? 'pointer' : 'not-allowed',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.2s ease',
          flexShrink: 0,
          boxShadow: canSend ? '0 2px 4px rgba(5, 133, 133, 0.2)' : 'none'
        }}
        aria-label={sending ? 'Sending message...' : 'Send message'}
      >
        {sending ? (
          <div style={{
            width: '18px',
            height: '18px',
            border: '2px solid rgba(255,255,255,0.3)',
            borderTopColor: '#FFFFFF',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}></div>
        ) : (
          <Icons.Send size={18} />
        )}
      </button>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

// ============================================
// MESSAGE THREAD COMPONENT (with image display)
// ============================================
const MessageThread = ({ conversation, currentUserId, onBack, isMobile }) => {
  const [messages, setMessages] = useState([]);
  const [optimisticMessages, setOptimisticMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lightboxImage, setLightboxImage] = useState(null);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const [isNearBottom, setIsNearBottom] = useState(true);
  const [isOtherUserTyping, setIsOtherUserTyping] = useState(false);

  const otherUser = useMemo(() => {
    if (!conversation) return null;
    const otherUserId = conversation.participants.find(id => id !== currentUserId);
    return conversation.participantDetails?.[otherUserId] || { name: 'Unknown', avatar: null };
  }, [conversation, currentUserId]);

  // Real-time listener for messages
  useEffect(() => {
    if (!conversation?.id) return;

    setLoading(true);
    const unsubscribe = db.collection('messages')
      .where('conversationId', '==', conversation.id)
      .orderBy('createdAt', 'asc')
      .onSnapshot(snapshot => {
        const msgs = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setMessages(msgs);
        setLoading(false);

        if (isNearBottom) {
          setTimeout(() => scrollToBottom(), 100);
        }
      }, error => {
        console.error('Error loading messages:', error);
        setLoading(false);
      });

    return () => unsubscribe();
  }, [conversation?.id, isNearBottom]);

  // Listen for typing status
  useEffect(() => {
    if (!conversation?.id || !currentUserId) return;

    const otherUserId = conversation.participants.find(id => id !== currentUserId);
    if (!otherUserId) return;

    const unsubscribe = db.collection('conversations')
      .doc(conversation.id)
      .onSnapshot(doc => {
        const data = doc.data();
        const otherUserTypingTimestamp = data?.typing?.[otherUserId];

        if (otherUserTypingTimestamp) {
          const typingTime = otherUserTypingTimestamp.toMillis
            ? otherUserTypingTimestamp.toMillis()
            : otherUserTypingTimestamp;
          const now = Date.now();
          const isRecent = (now - typingTime) < 4000;
          setIsOtherUserTyping(isRecent);

          if (isRecent) {
            const hideTimeout = setTimeout(() => {
              setIsOtherUserTyping(false);
            }, 4000 - (now - typingTime));
            return () => clearTimeout(hideTimeout);
          }
        } else {
          setIsOtherUserTyping(false);
        }
      }, error => {
        console.error('Error listening to typing status:', error);
        setIsOtherUserTyping(false);
      });

    return () => unsubscribe();
  }, [conversation?.id, currentUserId]);

  // Clear optimistic messages when real messages arrive
  useEffect(() => {
    if (messages.length > 0 && optimisticMessages.length > 0) {
      setOptimisticMessages(prev =>
        prev.filter(optMsg => {
          const hasRealVersion = messages.some(realMsg =>
            realMsg.senderId === optMsg.senderId &&
            ((realMsg.text === optMsg.text && optMsg.type === 'text') ||
             (realMsg.imageUrl === optMsg.imageUrl && optMsg.type === 'image')) &&
            !realMsg._isOptimistic
          );
          return !hasRealVersion;
        })
      );
    }
  }, [messages]);

  const handleSendMessage = (newMessage) => {
    setOptimisticMessages(prev => [...prev, newMessage]);
    setTimeout(() => scrollToBottom(), 100);
  };

  const allMessages = useMemo(() => {
    const filteredOptimistic = optimisticMessages.filter(optMsg => {
      return !messages.some(realMsg =>
        realMsg.senderId === optMsg.senderId &&
        ((realMsg.text === optMsg.text && optMsg.type === 'text') ||
         (realMsg.imageUrl === optMsg.imageUrl && optMsg.type === 'image'))
      );
    });
    return [...messages, ...filteredOptimistic];
  }, [messages, optimisticMessages]);

  // Mark messages as read
  useEffect(() => {
    if (!conversation?.id || !currentUserId || messages.length === 0) return;

    const unreadMessages = messages.filter(msg =>
      msg.senderId !== currentUserId &&
      msg.status !== 'read'
    );

    if (unreadMessages.length > 0) {
      const batch = db.batch();
      unreadMessages.forEach(msg => {
        const msgRef = db.collection('messages').doc(msg.id);
        batch.update(msgRef, {
          status: 'read',
          readAt: firebase.firestore.FieldValue.serverTimestamp()
        });
      });

      const convoRef = db.collection('conversations').doc(conversation.id);
      batch.update(convoRef, {
        [`unreadCount.${currentUserId}`]: 0
      });

      batch.commit().catch(err => console.error('Error marking as read:', err));
    }
  }, [messages, conversation?.id, currentUserId]);

  const handleScroll = () => {
    if (!messagesContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
    const nearBottom = scrollHeight - scrollTop - clientHeight < 100;
    setIsNearBottom(nearBottom);
  };

  const scrollToBottom = (behavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  // Group messages
  const groupedMessages = useMemo(() => {
    const groups = [];
    let currentGroup = null;

    allMessages.forEach((msg, idx) => {
      const prevMsg = allMessages[idx - 1];
      const shouldGroup = prevMsg &&
        prevMsg.senderId === msg.senderId &&
        msg.createdAt && prevMsg.createdAt &&
        (msg.createdAt.toMillis() - prevMsg.createdAt.toMillis()) < 60000;

      if (shouldGroup && currentGroup) {
        currentGroup.messages.push(msg);
      } else {
        currentGroup = {
          senderId: msg.senderId,
          messages: [msg],
          timestamp: msg.createdAt
        };
        groups.push(currentGroup);
      }
    });

    return groups;
  }, [allMessages]);

  const formatDateHeader = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate();
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const msgDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

    if (msgDate.getTime() === today.getTime()) return 'Today';
    if (msgDate.getTime() === yesterday.getTime()) return 'Yesterday';

    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  const formatMessageTime = (timestamp) => {
    if (!timestamp) return '';
    return timestamp.toDate().toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const messagesWithHeaders = useMemo(() => {
    const result = [];
    let lastDate = null;

    groupedMessages.forEach(group => {
      if (!group.timestamp) return;
      const msgDate = group.timestamp.toDate().toDateString();
      if (msgDate !== lastDate) {
        result.push({ type: 'date-header', date: group.timestamp, key: `header-${msgDate}` });
        lastDate = msgDate;
      }
      result.push({ type: 'message-group', ...group, key: `group-${group.messages[0].id}` });
    });

    return result;
  }, [groupedMessages]);

  const ReadReceipt = ({ message }) => {
    if (message.senderId !== currentUserId) return null;
    const status = message.status || 'sent';

    if (status === 'sent') {
      return (
        <span style={{ marginLeft: '4px', display: 'inline-flex' }} aria-label="Sent">
          <Icons.Check size={14} color="rgba(255,255,255,0.7)" />
        </span>
      );
    }

    if (status === 'delivered') {
      return (
        <span style={{ marginLeft: '4px', display: 'inline-flex' }} aria-label="Delivered">
          <Icons.CheckCheck size={16} color="rgba(255,255,255,0.7)" />
        </span>
      );
    }

    if (status === 'read') {
      return (
        <span style={{ marginLeft: '4px', display: 'inline-flex' }} aria-label="Read">
          <Icons.CheckCheck size={16} color="#00C853" />
        </span>
      );
    }

    return null;
  };

  if (loading) {
    return (
      <div style={{
        flex: 1,
        backgroundColor: '#FFFFFF',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '3px solid #E5E7EB',
          borderTopColor: '#058585',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        <div style={{ marginTop: '16px', color: '#7F8C8D', fontSize: '14px' }}>
          Loading messages...
        </div>
      </div>
    );
  }

  return (
    <div style={{
      flex: 1,
      backgroundColor: '#FFFFFF',
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      position: 'relative'
    }}>
      {/* Lightbox */}
      {lightboxImage && (
        <ImageLightbox imageUrl={lightboxImage} onClose={() => setLightboxImage(null)} />
      )}

      {/* Thread Header */}
      <div style={{
        padding: isMobile ? '12px 16px' : '16px 20px',
        borderBottom: '1px solid #E5E7EB',
        backgroundColor: '#FFFFFF',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        position: 'sticky',
        top: 0,
        zIndex: 10
      }}>
        {isMobile && (
          <button
            onClick={onBack}
            style={{
              background: 'none',
              border: 'none',
              padding: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#058585',
              marginLeft: '-8px'
            }}
            aria-label="Back to conversations"
          >
            <Icons.ArrowLeft size={24} />
          </button>
        )}

        <div style={{
          width: isMobile ? '40px' : '44px',
          height: isMobile ? '40px' : '44px',
          borderRadius: '50%',
          backgroundColor: '#058585',
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#FFFFFF',
          fontSize: isMobile ? '16px' : '18px',
          fontWeight: '600',
          backgroundImage: otherUser?.avatar ? `url(${otherUser.avatar})` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}>
          {!otherUser?.avatar && otherUser?.name?.[0]?.toUpperCase()}
        </div>

        <div style={{ flex: 1 }}>
          <div style={{
            fontSize: isMobile ? '16px' : '17px',
            fontWeight: '600',
            color: '#2C3E50'
          }}>
            {otherUser?.name || 'Unknown'}
          </div>
          {otherUser?.role && (
            <div style={{ fontSize: '12px', color: '#7F8C8D', textTransform: 'capitalize' }}>
              {otherUser.role}
            </div>
          )}
        </div>
      </div>

      {/* Messages Container */}
      <div
        ref={messagesContainerRef}
        onScroll={handleScroll}
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '16px',
          backgroundColor: '#F8F9FA'
        }}
      >
        {allMessages.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: '#7F8C8D' }}>
            <div style={{
              marginBottom: '16px',
              display: 'flex',
              justifyContent: 'center'
            }}>
              <Icons.MessageCircle size={48} color="#E5E7EB" />
            </div>
            <div style={{ fontSize: '16px', fontWeight: '600', color: '#2C3E50', marginBottom: '8px' }}>
              No messages yet
            </div>
            <div style={{ fontSize: '14px' }}>
              Start the conversation by sending a message
            </div>
          </div>
        )}

        {messagesWithHeaders.map(item => {
          if (item.type === 'date-header') {
            return (
              <div key={item.key} style={{ textAlign: 'center', margin: '20px 0 16px 0' }}>
                <span style={{
                  backgroundColor: '#E1F5F4',
                  color: '#047272',
                  padding: '6px 14px',
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontWeight: '500',
                  display: 'inline-block'
                }}>
                  {formatDateHeader(item.date)}
                </span>
              </div>
            );
          }

          const isOwn = item.senderId === currentUserId;
          return (
            <div
              key={item.key}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: isOwn ? 'flex-end' : 'flex-start',
                marginBottom: '8px'
              }}
            >
              {item.messages.map((msg, msgIdx) => {
                const isFirstInGroup = msgIdx === 0;
                const isLastInGroup = msgIdx === item.messages.length - 1;
                const isImage = msg.type === 'image';

                return (
                  <div key={msg.id} style={{ maxWidth: isMobile ? '85%' : '70%', marginBottom: '2px' }}>
                    {isImage ? (
                      // Image Message
                      <div
                        onClick={() => setLightboxImage(msg.imageUrl)}
                        style={{
                          cursor: 'pointer',
                          borderRadius: '12px',
                          overflow: 'hidden',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                        }}
                      >
                        <img
                          src={msg.imageUrl}
                          alt="Shared image"
                          style={{
                            maxWidth: '100%',
                            maxHeight: '300px',
                            display: 'block',
                            borderRadius: '12px'
                          }}
                        />
                      </div>
                    ) : (
                      // Text Message
                      <div style={{
                        padding: '8px 12px',
                        background: isOwn ? 'linear-gradient(135deg, #058585 0%, #047272 100%)' : '#F3F4F6',
                        color: isOwn ? '#FFFFFF' : '#2C3E50',
                        borderRadius: isOwn
                          ? isFirstInGroup ? '12px 12px 4px 12px' : isLastInGroup ? '12px 4px 12px 12px' : '12px 4px 4px 12px'
                          : isFirstInGroup ? '12px 12px 12px 4px' : isLastInGroup ? '4px 12px 12px 12px' : '4px 12px 12px 4px',
                        wordWrap: 'break-word',
                        whiteSpace: 'pre-wrap',
                        fontSize: isMobile ? '14px' : '15px',
                        lineHeight: '1.4',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                      }}>
                        {msg.text}
                      </div>
                    )}

                    {isLastInGroup && (
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: isOwn ? 'flex-end' : 'flex-start',
                        marginTop: '4px',
                        gap: '4px'
                      }}>
                        <span style={{ fontSize: '11px', color: '#9CA3AF' }}>
                          {formatMessageTime(msg.createdAt)}
                        </span>
                        <ReadReceipt message={msg} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}

        <div ref={messagesEndRef} />
      </div>

      {/* Scroll to bottom button */}
      {!isNearBottom && allMessages.length > 0 && (
        <button
          onClick={() => scrollToBottom()}
          style={{
            position: 'absolute',
            bottom: '80px',
            right: '20px',
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            backgroundColor: '#058585',
            border: 'none',
            color: '#FFFFFF',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            zIndex: 5
          }}
          aria-label="Scroll to bottom"
        >
          <Icons.ChevronDown size={20} />
        </button>
      )}

      {/* Typing Indicator */}
      {isOtherUserTyping && (
        <div style={{
          padding: '8px 16px',
          backgroundColor: '#F8F9FA',
          borderTop: '1px solid #E5E7EB',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <div style={{ display: 'flex', gap: '3px', alignItems: 'center' }}>
            <span style={{
              width: '6px', height: '6px', backgroundColor: '#058585', borderRadius: '50%',
              animation: 'typingDot 1.4s infinite ease-in-out', animationDelay: '0s'
            }}></span>
            <span style={{
              width: '6px', height: '6px', backgroundColor: '#058585', borderRadius: '50%',
              animation: 'typingDot 1.4s infinite ease-in-out', animationDelay: '0.2s'
            }}></span>
            <span style={{
              width: '6px', height: '6px', backgroundColor: '#058585', borderRadius: '50%',
              animation: 'typingDot 1.4s infinite ease-in-out', animationDelay: '0.4s'
            }}></span>
          </div>
          <span style={{ fontSize: '13px', color: '#7F8C8D', fontStyle: 'italic' }}>
            {otherUser?.name || 'User'} is typing...
          </span>
          <style>{`
            @keyframes typingDot {
              0%, 60%, 100% { transform: translateY(0); opacity: 0.6; }
              30% { transform: translateY(-4px); opacity: 1; }
            }
          `}</style>
        </div>
      )}

      {/* Message Input */}
      <MessageInput
        conversation={conversation}
        currentUserId={currentUserId}
        onSendMessage={handleSendMessage}
        isMobile={isMobile}
      />
    </div>
  );
};

// ============================================
// MESSAGES TAB COMPONENT (MAIN)
// ============================================
const MessagesTab = () => {
  console.log('MessagesTab RENDER START');

  const [conversations, setConversations] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [showNewConversation, setShowNewConversation] = useState(false);
  const [userData, setUserData] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const currentUserId = firebase.auth().currentUser?.uid;

  // Load user data
  useEffect(() => {
    if (!currentUserId) return;

    const unsubscribe = db.collection('users').doc(currentUserId)
      .onSnapshot(doc => {
        if (doc.exists) {
          setUserData(doc.data());
        }
      });

    return () => unsubscribe();
  }, [currentUserId]);

  // Real-time listener for conversations
  useEffect(() => {
    if (!currentUserId) {
      setLoading(false);
      return;
    }

    setLoading(true);

    const unsubscribe = db.collection('conversations')
      .where('participants', 'array-contains', currentUserId)
      .orderBy('lastMessageTimestamp', 'desc')
      .onSnapshot(snapshot => {
        const convos = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setConversations(convos);
        setLoading(false);
      }, error => {
        console.error('Error loading conversations:', error);
        setLoading(false);
      });

    return () => unsubscribe();
  }, [currentUserId]);

  // Responsive listener
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Filter conversations by search query
  const filteredConversations = useMemo(() => {
    if (!searchQuery) return conversations;

    const query = searchQuery.toLowerCase();
    return conversations.filter(convo => {
      const otherUserId = convo.participants.find(id => id !== currentUserId);
      const otherUser = convo.participantDetails?.[otherUserId];
      return otherUser?.name?.toLowerCase().includes(query);
    });
  }, [conversations, searchQuery, currentUserId]);

  const getOtherParticipant = (conversation) => {
    const otherUserId = conversation.participants.find(id => id !== currentUserId);
    return conversation.participantDetails?.[otherUserId] || { name: 'Unknown', avatar: null };
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate();
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Now';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Handle selecting a conversation from the new conversation modal
  const handleSelectRecipient = (conversation) => {
    setSelectedConversation(conversation);
    setShowNewConversation(false);
  };

  // Loading state
  if (loading) {
    return (
      <div style={{
        backgroundColor: '#FFFFFF',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#2C3E50'
      }}>
        <div style={{ textAlign: 'center', color: '#2C3E50' }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '3px solid #E5E7EB',
            borderTopColor: '#058585',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 12px'
          }}></div>
          <div style={{
            fontSize: '16px',
            fontWeight: '600',
            color: '#2C3E50'
          }}>
            Loading conversations...
          </div>
        </div>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  const showConversationList = isMobile ? !selectedConversation : true;
  const showMessageThread = isMobile ? !!selectedConversation : !!selectedConversation;

  return (
    <div style={{
      backgroundColor: '#F8F9FA',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: isMobile ? 'column' : 'row',
      paddingBottom: isMobile ? '80px' : '0',
      color: '#2C3E50'
    }}>
      {/* New Conversation Modal */}
      {showNewConversation && (
        <NewConversationModal
          currentUserId={currentUserId}
          userData={userData}
          onClose={() => setShowNewConversation(false)}
          onSelectRecipient={handleSelectRecipient}
          isMobile={isMobile}
        />
      )}

      {/* Conversation List */}
      {showConversationList && (
        <div style={{
          width: isMobile ? '100%' : '380px',
          borderRight: isMobile ? 'none' : '1px solid #E5E7EB',
          backgroundColor: '#FFFFFF',
          display: 'flex',
          flexDirection: 'column',
          height: isMobile ? 'auto' : 'auto',
          minHeight: isMobile ? 'calc(100vh - 80px)' : 'auto',
          color: '#2C3E50'
        }}>
          {/* Header with New Message Button */}
          <div style={{
            padding: '16px',
            borderBottom: '1px solid #E5E7EB',
            backgroundColor: '#FFFFFF'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '12px'
            }}>
              <h1 style={{
                margin: 0,
                fontSize: '20px',
                fontWeight: '600',
                color: '#2C3E50'
              }}>
                Messages
              </h1>

              {/* New Message Button */}
              <button
                onClick={() => setShowNewConversation(true)}
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #058585 0%, #047272 100%)',
                  color: '#FFFFFF',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 4px rgba(5, 133, 133, 0.2)',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.05)';
                  e.currentTarget.style.boxShadow = '0 4px 8px rgba(5, 133, 133, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = '0 2px 4px rgba(5, 133, 133, 0.2)';
                }}
                aria-label="New message"
              >
                <Icons.Edit size={18} />
              </button>
            </div>

            {/* Search bar */}
            <div style={{ position: 'relative' }}>
              <span style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Icons.Search size={16} color="#7F8C8D" />
              </span>
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px 10px 36px',
                  backgroundColor: '#F8F9FA',
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px',
                  color: '#2C3E50',
                  fontSize: '14px',
                  outline: 'none'
                }}
                onFocus={(e) => e.target.style.borderColor = '#058585'}
                onBlur={(e) => e.target.style.borderColor = '#E5E7EB'}
              />
            </div>
          </div>

          {/* Conversation list */}
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {filteredConversations.length === 0 ? (
              <div style={{ padding: '40px 20px', textAlign: 'center', color: '#7F8C8D' }}>
                <div style={{
                  marginBottom: '16px',
                  display: 'flex',
                  justifyContent: 'center'
                }}>
                  <Icons.MessageCircle size={48} color="#E5E7EB" />
                </div>
                <div style={{ fontSize: '16px', fontWeight: '600', color: '#2C3E50', marginBottom: '8px' }}>
                  {searchQuery ? 'No conversations found' : 'No messages yet'}
                </div>
                <div style={{ fontSize: '14px', marginBottom: '20px' }}>
                  {searchQuery ? 'Try a different search term' : 'Start a conversation with your coach or peers'}
                </div>
                {!searchQuery && (
                  <button
                    onClick={() => setShowNewConversation(true)}
                    style={{
                      padding: '10px 20px',
                      background: 'linear-gradient(135deg, #058585 0%, #047272 100%)',
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <Icons.Plus size={16} />
                    Start a Conversation
                  </button>
                )}
              </div>
            ) : (
              filteredConversations.map(convo => {
                const otherUser = getOtherParticipant(convo);
                const unreadCount = convo.unreadCount?.[currentUserId] || 0;
                const isSelected = selectedConversation?.id === convo.id;
                const lastMessageText = convo.lastMessage?.type === 'image'
                  ? 'Sent an image'
                  : convo.lastMessage?.text || 'No messages';

                return (
                  <div
                    key={convo.id}
                    onClick={() => setSelectedConversation(convo)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px 16px',
                      cursor: 'pointer',
                      borderBottom: '1px solid #F8F9FA',
                      backgroundColor: isSelected ? '#F0FDFA' : 'transparent',
                      transition: 'background 0.15s ease'
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) e.currentTarget.style.backgroundColor = '#F8F9FA';
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    {/* Avatar */}
                    <div style={{
                      width: '52px',
                      height: '52px',
                      borderRadius: '50%',
                      backgroundColor: '#058585',
                      flexShrink: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#FFFFFF',
                      fontSize: '20px',
                      fontWeight: '600',
                      backgroundImage: otherUser.avatar ? `url(${otherUser.avatar})` : 'none',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center'
                    }}>
                      {!otherUser.avatar && otherUser.name?.[0]?.toUpperCase()}
                    </div>

                    {/* Content */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '4px'
                      }}>
                        <span style={{
                          fontSize: '16px',
                          fontWeight: unreadCount > 0 ? '600' : '400',
                          color: '#2C3E50'
                        }}>
                          {otherUser.name}
                        </span>
                        <span style={{
                          fontSize: '12px',
                          color: '#7F8C8D',
                          flexShrink: 0,
                          marginLeft: '8px'
                        }}>
                          {formatTimestamp(convo.lastMessageTimestamp)}
                        </span>
                      </div>

                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}>
                        <span style={{
                          fontSize: '14px',
                          color: unreadCount > 0 ? '#2C3E50' : '#7F8C8D',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          fontWeight: unreadCount > 0 ? '500' : '400',
                          fontStyle: convo.lastMessage?.type === 'image' ? 'italic' : 'normal'
                        }}>
                          {lastMessageText}
                        </span>
                        {unreadCount > 0 && (
                          <span style={{
                            backgroundColor: '#058585',
                            color: '#FFFFFF',
                            fontSize: '12px',
                            fontWeight: '600',
                            padding: '2px 6px',
                            borderRadius: '10px',
                            minWidth: '20px',
                            textAlign: 'center',
                            flexShrink: 0,
                            marginLeft: '8px'
                          }}>
                            {unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Message Thread */}
      {showMessageThread && selectedConversation && (
        <MessageThread
          conversation={selectedConversation}
          currentUserId={currentUserId}
          onBack={() => setSelectedConversation(null)}
          isMobile={isMobile}
        />
      )}

      {/* Empty state when no conversation selected (desktop only) */}
      {!isMobile && !selectedConversation && (
        <div style={{
          flex: 1,
          backgroundColor: '#F8F9FA',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#7F8C8D',
          padding: '40px 20px'
        }}>
          <div style={{ marginBottom: '16px' }}>
            <Icons.MessageSquare size={64} color="#E5E7EB" />
          </div>
          <div style={{
            fontSize: '18px',
            fontWeight: '600',
            color: '#2C3E50',
            marginBottom: '8px'
          }}>
            Select a conversation
          </div>
          <div style={{ fontSize: '14px', textAlign: 'center', marginBottom: '20px' }}>
            Choose a conversation from the list or start a new one
          </div>
          <button
            onClick={() => setShowNewConversation(true)}
            style={{
              padding: '10px 20px',
              background: 'linear-gradient(135deg, #058585 0%, #047272 100%)',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <Icons.Plus size={16} />
            New Message
          </button>
        </div>
      )}
    </div>
  );
};

// Register component globally
window.GLRSApp = window.GLRSApp || { components: {} };
window.GLRSApp.components = window.GLRSApp.components || {};
window.GLRSApp.components.MessagesTab = MessagesTab;

console.log('MessagesTab component loaded and registered (with NewConversationModal + Image Support)');
