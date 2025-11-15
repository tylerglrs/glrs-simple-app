// Index/CommunityTab.js
window.GLRSApp = window.GLRSApp || {};
window.GLRSApp.components = window.GLRSApp.components || {};
function CommunityTab() {
  // ✅ PHASE 8C-3: Converted to use Context API
  // Get state from Context instead of props
  const {
    activeChat,
    setActiveChat,
    communityMessages,
    sendCommunityMessage,
    user,
    uploadChatImage,
    flagContent,
    setModalImage,
    topicRooms,
    enterTopicRoom,
    supportGroups,
    meetings,
    emergencyResources,
    triggerHaptic,
    triggerSOS,
    CommunityChat
  } = useAppContext();
  return /*#__PURE__*/React.createElement("div", {
    className: "section-content"
  }, /*#__PURE__*/React.createElement("h2", {
    style: {
      color: 'white',
      marginBottom: '20px'
    }
  }, "Community Connect"), /*#__PURE__*/React.createElement("div", {
    className: "chat-tabs"
  }, /*#__PURE__*/React.createElement("button", {
    className: `tab-btn ${activeChat === 'main' ? 'active' : ''}`,
    onClick: () => setActiveChat('main')
  }, "GLRS Community"), /*#__PURE__*/React.createElement("button", {
    className: `tab-btn ${activeChat === 'rooms' ? 'active' : ''}`,
    onClick: () => setActiveChat('rooms')
  }, "Topic Rooms"), /*#__PURE__*/React.createElement("button", {
    className: `tab-btn ${activeChat === 'groups' ? 'active' : ''}`,
    onClick: () => setActiveChat('groups')
  }, "Support Groups"), /*#__PURE__*/React.createElement("button", {
    className: `tab-btn ${activeChat === 'meetings' ? 'active' : ''}`,
    onClick: () => setActiveChat('meetings')
  }, "Meetings")), activeChat === 'main' && /*#__PURE__*/React.createElement(CommunityChat, {
    messages: communityMessages,
    onSendMessage: sendCommunityMessage,
    currentUserId: user?.uid,
    uploadChatImage: uploadChatImage,
    flagContent: flagContent,
    setModalImage: setModalImage
  }), activeChat === 'rooms' && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("h3", {
    style: {
      color: '#f4c430',
      marginBottom: '20px'
    }
  }, "Recovery Topic Rooms"), topicRooms?.length > 0 ? topicRooms.map(room => /*#__PURE__*/React.createElement("div", {
    key: room.id,
    className: "room-card",
    onClick: () => enterTopicRoom(room)
  }, /*#__PURE__*/React.createElement("div", {
    className: "room-icon"
  }, room.icon ? room.icon : /*#__PURE__*/React.createElement("i", {
    "data-lucide": "message-circle",
    style: {
      width: '24px',
      height: '24px'
    }
  })), /*#__PURE__*/React.createElement("h4", null, room.name), /*#__PURE__*/React.createElement("p", {
    style: {
      color: 'rgba(255,255,255,0.7)'
    }
  }, room.description))) : /*#__PURE__*/React.createElement("div", {
    className: "empty-state"
  }, /*#__PURE__*/React.createElement("div", {
    className: "empty-state-icon"
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "message-square",
    style: {
      width: '48px',
      height: '48px',
      color: 'var(--color-text-secondary)'
    }
  })), /*#__PURE__*/React.createElement("div", {
    className: "empty-state-text"
  }, "No topic rooms available yet."))), activeChat === 'groups' && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("h3", {
    style: {
      color: '#f4c430',
      marginBottom: '20px'
    }
  }, "Support Groups"), supportGroups?.length > 0 ? supportGroups.map(group => /*#__PURE__*/React.createElement("div", {
    key: group.id,
    className: "support-group-card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "group-header"
  }, /*#__PURE__*/React.createElement("h4", {
    style: {
      color: 'white'
    }
  }, group.name), /*#__PURE__*/React.createElement("span", {
    className: `badge ${group.type === 'AA' ? 'badge-primary' : group.type === 'NA' ? 'badge-warning' : group.type === 'SMART' ? 'badge-success' : 'badge-secondary'}`
  }, group.type)), group.description && /*#__PURE__*/React.createElement("p", {
    style: {
      color: 'rgba(255,255,255,0.7)',
      marginBottom: '10px'
    }
  }, group.description), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '14px',
      opacity: 0.8
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: '6px'
    }
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "calendar",
    style: {
      width: '14px',
      height: '14px'
    }
  }), group.day), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: '6px'
    }
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "clock",
    style: {
      width: '14px',
      height: '14px'
    }
  }), group.time), group.location && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: '6px'
    }
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "map-pin",
    style: {
      width: '14px',
      height: '14px'
    }
  }), group.location), !group.location && group.link && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: '6px'
    }
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "video",
    style: {
      width: '14px',
      height: '14px'
    }
  }), "Virtual Meeting")), group.link && /*#__PURE__*/React.createElement("button", {
    className: "join-btn",
    onClick: () => window.open(group.link, '_blank'),
    style: {
      marginTop: '10px'
    }
  }, "Join Virtual Meeting"))) : /*#__PURE__*/React.createElement("div", {
    className: "empty-state"
  }, /*#__PURE__*/React.createElement("div", {
    className: "empty-state-icon"
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "users",
    style: {
      width: '48px',
      height: '48px',
      color: 'var(--color-primary)'
    }
  })), /*#__PURE__*/React.createElement("div", {
    className: "empty-state-text"
  }, "No support groups available yet."))), activeChat === 'meetings' && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("h3", {
    style: {
      color: '#f4c430',
      marginBottom: '20px'
    }
  }, "Scheduled Group Meetings"), meetings?.length > 0 ? meetings.map(meeting => {
    const meetingDate = meeting.scheduledTime?.toDate ? meeting.scheduledTime.toDate() : new Date(meeting.scheduledTime);
    return /*#__PURE__*/React.createElement("div", {
      key: meeting.id,
      className: "meeting-card"
    }, /*#__PURE__*/React.createElement("div", {
      className: "meeting-header"
    }, /*#__PURE__*/React.createElement("h4", null, meeting.meetingTitle || 'Group Recovery Session'), /*#__PURE__*/React.createElement("span", {
      className: `status-badge ${meeting.status === 'scheduled' ? 'scheduled' : meeting.status === 'completed' ? 'completed' : 'cancelled'}`
    }, meeting.status)), /*#__PURE__*/React.createElement("div", {
      className: "meeting-type"
    }, meeting.type || 'Group Session'), /*#__PURE__*/React.createElement("div", {
      className: "meeting-details"
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: '6px'
      }
    }, /*#__PURE__*/React.createElement("i", {
      "data-lucide": "calendar",
      style: {
        width: '14px',
        height: '14px'
      }
    }), meetingDate.toLocaleDateString()), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: '6px'
      }
    }, /*#__PURE__*/React.createElement("i", {
      "data-lucide": "clock",
      style: {
        width: '14px',
        height: '14px'
      }
    }), meetingDate.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: '6px'
      }
    }, /*#__PURE__*/React.createElement("i", {
      "data-lucide": "timer",
      style: {
        width: '14px',
        height: '14px'
      }
    }), "Duration: ", meeting.duration || '60', " minutes"), meeting.isGlobal && /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: '6px'
      }
    }, /*#__PURE__*/React.createElement("i", {
      "data-lucide": "globe",
      style: {
        width: '14px',
        height: '14px'
      }
    }), "All PIRs Invited")), meeting.notes && /*#__PURE__*/React.createElement("div", {
      className: "meeting-notes",
      style: {
        display: 'flex',
        alignItems: 'flex-start',
        gap: '6px'
      }
    }, /*#__PURE__*/React.createElement("i", {
      "data-lucide": "file-text",
      style: {
        width: '14px',
        height: '14px',
        marginTop: '2px'
      }
    }), meeting.notes), meeting.meetingLink && /*#__PURE__*/React.createElement("button", {
      className: "join-btn",
      onClick: () => window.open(meeting.meetingLink, '_blank')
    }, "Join Virtual Meeting"));
  }) : /*#__PURE__*/React.createElement("div", {
    className: "empty-state"
  }, /*#__PURE__*/React.createElement("div", {
    className: "empty-state-icon"
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "calendar",
    style: {
      width: '48px',
      height: '48px',
      color: 'var(--color-primary)'
    }
  })), /*#__PURE__*/React.createElement("div", {
    className: "empty-state-text"
  }, "No group meetings scheduled."))), /*#__PURE__*/React.createElement("div", {
    className: "crisis-resources"
  }, /*#__PURE__*/React.createElement("div", {
    className: "crisis-title"
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "alert-octagon",
    style: {
      width: '20px',
      height: '20px',
      marginRight: '8px',
      color: '#DC143C'
    }
  }), "Crisis Resources"), emergencyResources?.length > 0 ? emergencyResources.map(resource => /*#__PURE__*/React.createElement("div", {
    key: resource.id,
    style: {
      marginBottom: '15px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "crisis-number"
  }, resource.phone && /*#__PURE__*/React.createElement("a", {
    href: `tel:${resource.phone}`
  }, resource.phone)), /*#__PURE__*/React.createElement("div", {
    className: "crisis-description"
  }, resource.title), /*#__PURE__*/React.createElement("small", {
    style: {
      opacity: 0.7
    }
  }, resource.available || '24/7'))) : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: '15px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "crisis-number"
  }, /*#__PURE__*/React.createElement("a", {
    href: "tel:988"
  }, "988")), /*#__PURE__*/React.createElement("div", {
    className: "crisis-description"
  }, "Suicide & Crisis Lifeline")), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "crisis-number"
  }, /*#__PURE__*/React.createElement("a", {
    href: "tel:1-800-662-4357"
  }, "1-800-662-HELP")), /*#__PURE__*/React.createElement("div", {
    className: "crisis-description"
  }, "SAMHSA National Helpline"))), /*#__PURE__*/React.createElement("button", {
    className: "sos-btn",
    onClick: () => {
      triggerHaptic('error');
      triggerSOS();
    }
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "alert-octagon",
    style: {
      width: '18px',
      height: '18px',
      marginRight: '8px'
    }
  }), "SOS - I Need Help Now")));
}
// Community Chat Component - FULLY UPDATED VERSION
function CommunityChat({
  messages,
  onSendMessage,
  currentUserId,
  uploadChatImage,
  flagContent,
  setModalImage
}) {
  const [message, setMessage] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [likes, setLikes] = useState({});
  const [showComments, setShowComments] = useState({});
  const messagesEndRef = useRef(null);
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth"
    });
  }, [messages]);
  const handleImageSelect = e => {
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
  const handleLike = msgId => {
    setLikes(prev => ({
      ...prev,
      [msgId]: !prev[msgId]
    }));
  };
  const getInitials = name => {
    if (!name) return 'A';
    const parts = name.split(' ');
    return parts.length > 1 ? parts[0][0] + parts[1][0] : parts[0][0];
  };
  const formatTimeAgo = timestamp => {
    if (!timestamp?.toDate) return 'now';
    const date = timestamp.toDate();
    const seconds = Math.floor((new Date() - date) / 1000);
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };
  return /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 'var(--space-4)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'rgba(255,255,255,0.95)',
      borderRadius: 'var(--radius-lg)',
      padding: 'var(--space-4)',
      marginBottom: 'var(--space-4)',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 'var(--space-3)',
      alignItems: 'flex-start'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
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
    }
  }, getInitials('You')), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("input", {
    type: "text",
    placeholder: "What's on your mind?",
    value: message,
    onChange: e => setMessage(e.target.value),
    onKeyPress: e => e.key === 'Enter' && handleSend(),
    style: {
      width: '100%',
      padding: 'var(--space-3)',
      border: '1px solid #ddd',
      borderRadius: 'var(--radius-lg)',
      fontSize: 'var(--font-base)',
      background: '#f8f9fa',
      outline: 'none'
    }
  }), selectedImage && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 'var(--space-2)',
      padding: 'var(--space-2)',
      background: '#e7f5ff',
      borderRadius: 'var(--radius-md)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'var(--font-sm)',
      color: '#333'
    }
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "image",
    style: {
      width: '16px',
      height: '16px',
      marginRight: '8px'
    }
  }), selectedImage.name), /*#__PURE__*/React.createElement("button", {
    onClick: () => setSelectedImage(null),
    style: {
      background: 'transparent',
      border: 'none',
      cursor: 'pointer',
      padding: '4px'
    }
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "x",
    style: {
      width: '16px',
      height: '16px',
      color: '#666'
    }
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 'var(--space-2)',
      marginTop: 'var(--space-3)',
      paddingTop: 'var(--space-3)',
      borderTop: '1px solid #eee'
    }
  }, /*#__PURE__*/React.createElement("input", {
    type: "file",
    id: "community-image-input",
    accept: "image/*",
    style: {
      display: 'none'
    },
    onChange: handleImageSelect
  }), /*#__PURE__*/React.createElement("button", {
    onClick: () => document.getElementById('community-image-input').click(),
    style: {
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
    }
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "image",
    style: {
      width: '20px',
      height: '20px'
    }
  }), "Photo"), /*#__PURE__*/React.createElement("button", {
    onClick: handleSend,
    disabled: uploading || !message.trim() && !selectedImage,
    style: {
      padding: 'var(--space-2) var(--space-4)',
      background: uploading || !message.trim() && !selectedImage ? '#ccc' : 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
      border: 'none',
      borderRadius: 'var(--radius-md)',
      color: '#fff',
      fontSize: 'var(--font-sm)',
      fontWeight: 'bold',
      cursor: uploading || !message.trim() && !selectedImage ? 'not-allowed' : 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--space-1)'
    }
  }, uploading ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "loader",
    style: {
      width: '16px',
      height: '16px',
      animation: 'spin 1s linear infinite'
    }
  }), "Posting...") : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "send",
    style: {
      width: '16px',
      height: '16px'
    }
  }), "Post")))))), /*#__PURE__*/React.createElement("div", null, messages?.length > 0 ? messages.slice().reverse().map(msg => /*#__PURE__*/React.createElement("div", {
    key: msg.id,
    style: {
      background: 'rgba(255,255,255,0.95)',
      borderRadius: 'var(--radius-lg)',
      padding: 'var(--space-4)',
      marginBottom: 'var(--space-4)',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      marginBottom: 'var(--space-3)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
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
    }
  }, getInitials(msg.senderName)), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: '600',
      color: '#333',
      fontSize: 'var(--font-base)'
    }
  }, msg.senderName || 'Anonymous'), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 'var(--font-xs)',
      color: '#666'
    }
  }, formatTimeAgo(msg.createdAt))), msg.senderId !== currentUserId && flagContent && /*#__PURE__*/React.createElement("button", {
    onClick: () => flagContent('community_message', {
      messageId: msg.id,
      messageContent: msg.content,
      messageImageUrl: msg.imageUrl || null,
      authorId: msg.senderId,
      authorName: msg.senderName
    }),
    style: {
      background: 'transparent',
      border: 'none',
      cursor: 'pointer',
      padding: 'var(--space-2)'
    }
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "flag",
    style: {
      width: '16px',
      height: '16px',
      color: '#999'
    }
  }))), msg.content && /*#__PURE__*/React.createElement("div", {
    style: {
      color: '#333',
      fontSize: 'var(--font-base)',
      lineHeight: '1.5',
      marginBottom: msg.imageUrl ? 'var(--space-3)' : 0
    }
  }, msg.content), msg.imageUrl && /*#__PURE__*/React.createElement("img", {
    src: msg.imageUrl,
    alt: "Post content",
    style: {
      width: '100%',
      borderRadius: 'var(--radius-md)',
      cursor: 'pointer'
    },
    onClick: () => setModalImage(msg.imageUrl)
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 'var(--space-4)',
      marginTop: 'var(--space-3)',
      paddingTop: 'var(--space-3)',
      borderTop: '1px solid #eee'
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => handleLike(msg.id),
    style: {
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
    }
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "heart",
    style: {
      width: '18px',
      height: '18px',
      fill: likes[msg.id] ? 'var(--color-danger)' : 'none'
    }
  }), "Like"), /*#__PURE__*/React.createElement("button", {
    onClick: () => setShowComments(prev => ({
      ...prev,
      [msg.id]: !prev[msg.id]
    })),
    style: {
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
    }
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "message-circle",
    style: {
      width: '18px',
      height: '18px'
    }
  }), "Comment")))) : /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'center',
      padding: 'var(--space-8)',
      background: 'rgba(255,255,255,0.95)',
      borderRadius: 'var(--radius-lg)',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
    }
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "users",
    style: {
      width: '48px',
      height: '48px',
      color: '#ccc',
      marginBottom: 'var(--space-3)'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      color: '#666',
      fontSize: 'var(--font-base)'
    }
  }, "No posts yet. Be the first to share!")), /*#__PURE__*/React.createElement("div", {
    ref: messagesEndRef
  })));
}

// Export the component
window.GLRSApp.components.CommunityTab = CommunityTab;
