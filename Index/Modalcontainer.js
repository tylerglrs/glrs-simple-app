  // Modal Container Component with ALL modals working
function ModalContainer({ type, onClose, data, handlers }) {
    const [formData, setFormData] = useState({});
    const [morningData, setMorningData] = useState({
        mood: 5,
        craving: 0,
        sleepQuality: 5,
        anxietyLevel: 0,
        notes: ''
    });
    const [eveningData, setEveningData] = useState({
        gratitude: '',
        challenges: '',
        tomorrowGoal: '',
        overallDay: 5   // Changed from 3 to 5 (middle of 0-10)
    });
    const [topicMessage, setTopicMessage] = useState('');
    
    // ADD THESE LINES HERE:
    const [selectedImage, setSelectedImage] = useState(null);
    const [newMessage, setNewMessage] = useState('');
    const [uploading, setUploading] = useState(false);
    
    // Get user from data
    const user = data.user || {};
    
    // Handler functions for topic room
    const handleTopicImageSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedImage(file);
        }
    };
  // In ModalContainer - This is the ONLY handleSendMessage you need
const handleSendMessage = async () => {
    // Allow sending with either text or image
    if (!newMessage.trim() && !selectedImage) return;
    
    setUploading(true);
    try {
        await handlers.sendTopicMessage(newMessage || '', selectedImage);
        setNewMessage('');
        setSelectedImage(null);
        // Clear the file input
        const fileInput = document.querySelector('input[type="file"]');
        if (fileInput) fileInput.value = '';
    } catch (error) {
        showNotification('Failed to send message', 'error');
    } finally {
        setUploading(false);
    }
};

const handleFlagTopicMessage = (msg) => {
    if (handlers.flagMessage) {
        handlers.flagMessage(msg);
    }
};
    
    const renderModalContent = () => {
        switch(type) {
            case 'notifications':
                return ( 
    
                
                            <div className="notification-panel">
                                <h3 style={{marginBottom: '20px'}}>Notifications</h3>
                                {data.notifications.length > 0 ? (
                                    <>
                                        {data.notifications.map(notification => (
                                            <div 
                                                key={notification.id}
                                                className={`notification-item ${!notification.read ? 'unread' : ''}`}
                                                onClick={() => handlers.markNotificationAsRead(notification.id)}
                                            >
                                                <div className="notification-header">
                                                    <span className="notification-type">{notification.type}</span>
                                                    <span className="notification-time">
                                                        {notification.createdAt?.toDate ? 
                                                            new Date(notification.createdAt.toDate()).toLocaleTimeString() :
                                                            'now'}
                                                    </span>
                                                </div>
                                                <div className="notification-message">
                                                    <strong>{notification.title}</strong>
                                                    <div>{notification.message}</div>
                                                </div>
                                            </div>
                                        ))}
                                        {data.notifications.some(n => !n.read) && (
                                            <button 
                                                className="btn-primary"
                                                onClick={handlers.markAllNotificationsAsRead}
                                                style={{marginTop: '15px'}}
                                            >
                                                Mark All as Read
                                            </button>
                                        )}
                                    </>
                                ) : (
                                    <div style={{textAlign: 'center', opacity: 0.6, padding: '40px'}}>
                                        No notifications
                                    </div>
                                )}
                            </div>
                        );
                        
                    case 'checkIn':
    return (
        <div>
            <h3 style={{marginBottom: '20px'}}>Morning Check-in</h3>
            <div className="slider-group">
                <div className="slider-label">
                    <span>Overall Mood</span>
                    <span className="slider-value">{morningData.mood}</span>
                </div>
                <input 
                    type="range"
                    className="slider"
                    min="0" max="10"
                    value={morningData.mood}
                    onChange={(e) => setMorningData({...morningData, mood: parseInt(e.target.value)})}
                />
                <div style={{display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#666', marginTop: '5px'}}>
                    <span>0 (Worst)</span>
                    <span>5 (Neutral)</span>
                    <span>10 (Best)</span>
                </div>
            </div>
            
            <div className="slider-group">
                <div className="slider-label">
                    <span>Craving Intensity</span>
                    <span className="slider-value">{morningData.craving}</span>
                </div>
                <input 
                    type="range"
                    className="slider"
                    min="0" max="10"
                    value={morningData.craving}
                    onChange={(e) => setMorningData({...morningData, craving: parseInt(e.target.value)})}
                />
                <div style={{display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#666', marginTop: '5px'}}>
                    <span>0 (None)</span>
                    <span>5 (Moderate)</span>
                    <span>10 (Intense)</span>
                </div>
            </div>
            
            <div className="slider-group">
                <div className="slider-label">
                    <span>Sleep Quality</span>
                    <span className="slider-value">{morningData.sleepQuality}</span>
                </div>
                <input 
                    type="range"
                    className="slider"
                    min="0" max="10"
                    value={morningData.sleepQuality}
                    onChange={(e) => setMorningData({...morningData, sleepQuality: parseInt(e.target.value)})}
                />
                <div style={{display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#666', marginTop: '5px'}}>
                    <span>0 (Terrible)</span>
                    <span>5 (Fair)</span>
                    <span>10 (Excellent)</span>
                </div>
            </div>
            
            <div className="slider-group">
                <div className="slider-label">
                    <span>Anxiety Level</span>
                    <span className="slider-value">{morningData.anxietyLevel}</span>
                </div>
                <input 
                    type="range"
                    className="slider"
                    min="0" max="10"
                    value={morningData.anxietyLevel}
                    onChange={(e) => setMorningData({...morningData, anxietyLevel: parseInt(e.target.value)})}
                />
                <div style={{display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#666', marginTop: '5px'}}>
                    <span>0 (Calm)</span>
                    <span>5 (Moderate)</span>
                    <span>10 (Severe)</span>
                </div>
            </div>
            
            <div className="form-group">
                <label className="form-label">Notes (Optional)</label>
                <textarea 
                    className="textarea"
                    placeholder="Any thoughts or feelings you'd like to share?"
                    value={morningData.notes}
                    onChange={(e) => setMorningData({...morningData, notes: e.target.value})}
                />
            </div>
            
            <button 
                className="btn-primary"
                onClick={async () => {
                    await handlers.handleMorningCheckIn(morningData);
                    onClose();
                }}
            >
                Submit Check-in
            </button>
        </div>
    );

case 'reflection':
    return (
        <div>
            <h3 style={{marginBottom: '20px'}}>Evening Reflection</h3>
            <div className="form-group">
                <label className="form-label">What are you grateful for today?</label>
                <textarea 
                    className="textarea"
                    placeholder="List 3 things you're grateful for..."
                    value={eveningData.gratitude}
                    onChange={(e) => setEveningData({...eveningData, gratitude: e.target.value})}
                />
            </div>
            
            <div className="form-group">
                <label className="form-label">What challenges did you face?</label>
                <textarea 
                    className="textarea"
                    placeholder="Describe any difficulties..."
                    value={eveningData.challenges}
                    onChange={(e) => setEveningData({...eveningData, challenges: e.target.value})}
                />
            </div>
            
            <div className="form-group">
                <label className="form-label">What's one goal for tomorrow?</label>
                <textarea 
                    className="textarea"
                    placeholder="Set an intention..."
                    value={eveningData.tomorrowGoal}
                    onChange={(e) => setEveningData({...eveningData, tomorrowGoal: e.target.value})}
                />
            </div>
            
            <div className="slider-group">
                <div className="slider-label">
                    <span>Overall Day Rating</span>
                    <span className="slider-value">{eveningData.overallDay}</span>
                </div>
                <input 
                    type="range"
                    className="slider"
                    min="0" max="10"
                    value={eveningData.overallDay}
                    onChange={(e) => setEveningData({...eveningData, overallDay: parseInt(e.target.value)})}
                />
                <div style={{display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#666', marginTop: '5px'}}>
                    <span>0 (Terrible)</span>
                    <span>5 (OK)</span>
                    <span>10 (Excellent)</span>
                </div>
            </div>
            
            <button 
                className="btn-primary"
                onClick={async () => {
                    await handlers.handleEveningReflection(eveningData);
                    onClose();
                }}
            >
                Submit Reflection
            </button>
        </div>
    );
                        
                  case 'topicRoom':
    return (
        <div> {/* Parent wrapper */}
            <h3 style={{marginBottom: '20px'}}>
                {data.activeTopicRoom?.icon} {data.activeTopicRoom?.name}
            </h3>
            <p style={{opacity: 0.8, marginBottom: '20px'}}>
                {data.activeTopicRoom?.description}
            </p>
            
            {/* Messages container */}
            <div style={{flex: 1, overflowY: 'auto', padding: '15px', height: '300px'}}>
                {data.topicRoomMessages?.map(msg => (
                    <div key={msg.id} style={{
                        background: msg.userId === user.uid ? 
                            'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 
                            'rgba(255,255,255,0.05)',
                        padding: '12px',
                        borderRadius: '12px',
                        marginBottom: '10px'
                    }}>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            marginBottom: '8px'
                        }}>
                            <span style={{fontWeight: 'bold', color: '#f4c430'}}>
                                {msg.senderName || 'Anonymous'}
                            </span>
                            <div style={{display: 'flex', gap: '10px', alignItems: 'center'}}>
                                <span style={{fontSize: '12px', opacity: 0.7, color: 'white'}}>
                                    {msg.createdAt?.toDate ? 
                                        msg.createdAt.toDate().toLocaleTimeString() : 
                                        'sending...'}
                                </span>
                                {msg.userId !== user.uid && (
                                    <button
                                        onClick={() => handleFlagTopicMessage(msg)}
                                        style={{
                                            background: 'transparent',
                                            border: 'none',
                                            color: 'rgba(255,255,255,0.5)',
                                            cursor: 'pointer',
                                            fontSize: '14px',
                                            padding: '2px'
                                        }}
                                        title="Flag inappropriate content"
                                    >
                                        <i data-lucide="flag" style={{width: '16px', height: '16px'}}></i>
                                    </button>
                                )}
                            </div>
                        </div>
                        {msg.message && (
                            <p style={{margin: 0, color: 'white', lineHeight: 1.5}}>
                                {msg.message}
                            </p>
                        )}
                        {msg.imageUrl && (
                            <img 
                                src={msg.imageUrl}
                                alt="Shared"
                                style={{
                                    maxWidth: '100%',
                                    maxHeight: '300px',
                                    borderRadius: '8px',
                                    marginTop: '10px',
                                    cursor: 'pointer'
                                }}
                                onClick={() => window.open(msg.imageUrl, '_blank')}
                            />
                        )}
                    </div>
                ))}
            </div>
            
            <div style={{
                padding: '15px',
                borderTop: '1px solid rgba(255,255,255,0.1)'
            }}>
                {selectedImage && (
                    <div style={{
                        marginBottom: '10px',
                        padding: '8px',
                        background: 'rgba(255,255,255,0.1)',
                        borderRadius: '8px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <span style={{color: 'white', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px'}}>
                            <i data-lucide="camera" style={{width: '16px', height: '16px'}}></i>
                            {selectedImage.name}
                        </span>
                        <button
                            onClick={() => {
                                setSelectedImage(null);
                                document.getElementById('topic-image-input').value = '';
                            }}
                            style={{
                                background: 'transparent',
                                border: 'none',
                                color: 'white',
                                cursor: 'pointer'
                            }}
                        >
                            ✕
                        </button>
                    </div>
                )}
                <div style={{display: 'flex', gap: '10px'}}>
                    <input
                        type="file"
                        id="topic-image-input"
                        accept="image/*"
                        style={{display: 'none'}}
                        onChange={handleTopicImageSelect}
                    />
                    <button
                        onClick={() => document.getElementById('topic-image-input').click()}
                        style={{
                            background: 'rgba(255,255,255,0.1)',
                            border: 'none',
                            borderRadius: '8px',
                            padding: '10px',
                            color: 'white',
                            cursor: 'pointer'
                        }}
                        disabled={uploading}
                    >
                        <i data-lucide="camera" style={{width: '18px', height: '18px'}}></i>
                    </button>
                    <input 
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        style={{
                            flex: 1,
                            padding: '10px',
                            background: 'rgba(255,255,255,0.1)',
                            border: 'none',
                            borderRadius: '8px',
                            color: 'white'
                        }}
                    />
                    <button 
                        onClick={handleSendMessage}
                        disabled={uploading || (!newMessage.trim() && !selectedImage)}
                        style={{
                            padding: '10px 20px',
                            background: uploading ? 'gray' : '#f4c430',
                            border: 'none',
                            borderRadius: '8px',
                            color: 'black',
                            fontWeight: 'bold',
                            cursor: uploading ? 'not-allowed' : 'pointer'
                        }}
                    >
                        {uploading ? '...' : 'Send'}
                    </button>
                </div>
            </div>
        </div> 
    ); 
                        
                    case 'account':
                        return (
                            <div>
                                <h3 style={{marginBottom: '20px'}}>Account Settings</h3>
                                <div className="form-group">
                                    <label className="form-label">Display Name</label>
                                    <input 
                                        type="text"
                                        className="form-input"
                                        value={formData.displayName || data.userData?.displayName || ''}
                                        onChange={(e) => setFormData({...formData, displayName: e.target.value})}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">First Name</label>
                                    <input 
                                        type="text"
                                        className="form-input"
                                        value={formData.firstName || data.userData?.firstName || ''}
                                        onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Last Name</label>
                                    <input 
                                        type="text"
                                        className="form-input"
                                        value={formData.lastName || data.userData?.lastName || ''}
                                        onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Phone</label>
                                    <input 
                                        type="tel"
                                        className="form-input"
                                        value={formData.phone || data.userData?.phone || ''}
                                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Street Address</label>
                                    <input 
                                        type="text"
                                        className="form-input"
                                        value={formData.street || data.userData?.address?.street || ''}
                                        onChange={(e) => setFormData({...formData, street: e.target.value})}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">City</label>
                                    <input 
                                        type="text"
                                        className="form-input"
                                        value={formData.city || data.userData?.address?.city || ''}
                                        onChange={(e) => setFormData({...formData, city: e.target.value})}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">State</label>
                                    <input 
                                        type="text"
                                        className="form-input"
                                        value={formData.state || data.userData?.address?.state || ''}
                                        onChange={(e) => setFormData({...formData, state: e.target.value})}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">ZIP</label>
                                    <input 
                                        type="text"
                                        className="form-input"
                                        value={formData.zip || data.userData?.address?.zip || ''}
                                        onChange={(e) => setFormData({...formData, zip: e.target.value})}
                                    />
                                </div>
                                <button 
                                    className="btn-primary"
                                    onClick={async () => {
                                        try {
                                            const updates = {
                                                ...formData,
                                                address: {
                                                    street: formData.street,
                                                    city: formData.city,
                                                    state: formData.state,
                                                    zip: formData.zip
                                                }
                                            };
                                            await db.collection('users').doc(data.user.uid).update(updates);
                                            alert('Settings updated!');
                                            onClose();
                                        } catch (error) {
                                            alert('Failed to update settings');
                                        }
                                    }}
                                >
                                    Save Changes
                                </button>
                            </div>
                        );
                        
                    case 'emergency':
                        return (
                            <div>
                                <h3 style={{marginBottom: '20px'}}>Emergency Contacts</h3>
                                {data.userData?.emergencyContacts?.map((contact, index) => (
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
                                    onClick={async () => {
                                        const newContact = {
                                            name: formData.contactName,
                                            phone: formData.contactPhone,
                                            relationship: formData.contactRelationship
                                        };
                                        const contacts = data.userData?.emergencyContacts || [];
                                        contacts.push(newContact);
                                        try {
                                            await db.collection('users').doc(data.user.uid).update({
                                                emergencyContacts: contacts
                                            });
                                            alert('Emergency contact added');
                                            onClose();
                                        } catch (error) {
                                            alert('Failed to add contact');
                                        }
                                    }}
                                >
                                    Add Contact
                                </button>
                            </div>
                        );
                        
                    case 'profilePrompt':
                        return (
                            <div>
                                <h3 style={{marginBottom: '20px'}}>Complete Your Profile</h3>
                                <p style={{marginBottom: '20px', opacity: 0.9}}>
                                    Help us personalize your recovery journey by completing your profile.
                                </p>
                                <button 
                                    className="btn-primary"
                                    onClick={() => {
                                        onClose();
                                        setTimeout(() => setShowModal('account'), 100);
                                    }}
                                >
                                    Complete Profile
                                </button>
                                <button 
                                    style={{
                                        background: 'transparent',
                                        border: '1px solid rgba(255,255,255,0.3)',
                                        color: 'white',
                                        padding: '10px',
                                        borderRadius: '10px',
                                        width: '100%',
                                        marginTop: '10px',
                                        cursor: 'pointer'
                                    }}
                                    onClick={onClose}
                                >
                                    Remind Me Later
                                </button>
                            </div>
                        );
                        // Enhanced Modal Cases for ModalContainer
        // PERSONAL INFORMATION MODAL
case 'personalInfo':
    return (
        <div>
            <h3 style={{marginBottom: '20px'}}>Personal Information</h3>
            <div className="form-group">
                <label className="form-label">First Name</label>
                <input 
                    type="text"
                    className="form-input"
                    value={formData.firstName || data.userData?.firstName || ''}
                    onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                />
            </div>
            <div className="form-group">
                <label className="form-label">Last Name</label>
                <input 
                    type="text"
                    className="form-input"
                    value={formData.lastName || data.userData?.lastName || ''}
                    onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                />
            </div>
            <div className="form-group">
                <label className="form-label">Display Name</label>
                <input 
                    type="text"
                    className="form-input"
                    value={formData.displayName || data.userData?.displayName || ''}
                    onChange={(e) => setFormData({...formData, displayName: e.target.value})}
                />
            </div>
            <div className="form-group">
                <label className="form-label">Phone</label>
                <input 
                    type="tel"
                    className="form-input"
                    value={formData.phone || data.userData?.phone || ''}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                />
            </div>
            <div className="form-group">
                <label className="form-label">Date of Birth</label>
                <input 
                    type="date"
                    className="form-input"
                    value={formData.dateOfBirth || data.userData?.dateOfBirth || ''}
                    onChange={(e) => setFormData({...formData, dateOfBirth: e.target.value})}
                />
            </div>
            <div className="form-group">
                <label className="form-label">Gender</label>
                <select 
                    className="form-select"
                    value={formData.gender || data.userData?.gender || ''}
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
                    value={formData.street || data.userData?.address?.street || ''}
                    onChange={(e) => setFormData({...formData, street: e.target.value})}
                />
            </div>
            <div className="form-group">
                <label className="form-label">City</label>
                <input 
                    type="text"
                    className="form-input"
                    value={formData.city || data.userData?.address?.city || ''}
                    onChange={(e) => setFormData({...formData, city: e.target.value})}
                />
            </div>
            <div className="form-group">
                <label className="form-label">State</label>
                <input 
                    type="text"
                    className="form-input"
                    value={formData.state || data.userData?.address?.state || ''}
                    onChange={(e) => setFormData({...formData, state: e.target.value})}
                />
            </div>
            <div className="form-group">
                <label className="form-label">ZIP Code</label>
                <input 
                    type="text"
                    className="form-input"
                    value={formData.zip || data.userData?.address?.zip || ''}
                    onChange={(e) => setFormData({...formData, zip: e.target.value})}
                />
            </div>
            <div className="form-group">
                <label className="form-label">Insurance Provider (Optional)</label>
                <input 
                    type="text"
                    className="form-input"
                    value={formData.insurance || data.userData?.insurance || ''}
                    onChange={(e) => setFormData({...formData, insurance: e.target.value})}
                />
            </div>
            <div className="form-group">
                <label className="form-label">Insurance ID (Optional)</label>
                <input 
                    type="text"
                    className="form-input"
                    value={formData.insuranceId || data.userData?.insuranceId || ''}
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
                            const userDoc = await db.collection('users').doc(data.user.uid).get();
                            const existingAddress = userDoc.data()?.address || {};
                            
                            updates.address = {
                                street: formData.street !== undefined ? formData.street : (existingAddress.street || ''),
                                city: formData.city !== undefined ? formData.city : (existingAddress.city || ''),
                                state: formData.state !== undefined ? formData.state : (existingAddress.state || ''),
                                zip: formData.zip !== undefined ? formData.zip : (existingAddress.zip || '')
                            };
                        }
                        
                        // Add timestamp
                        updates.updatedAt = firebase.firestore.FieldValue.serverTimestamp();
                        
                        // Only proceed if there are updates to make
                        if (Object.keys(updates).length === 1) { // Only updatedAt
                            alert('No changes to save');
                            return;
                        }
                        
                        // Perform the update
                        await db.collection('users').doc(data.user.uid).update(updates);
                        
                        // Log what was saved for debugging
                        
                        // Update local userData to reflect changes immediately
                        const updatedUserDoc = await db.collection('users').doc(data.user.uid).get();
                        if (data.setUserData) {
                            data.setUserData(updatedUserDoc.data());
                        }
                        
                        // Provide specific feedback
                        const savedFields = Object.keys(updates).filter(k => k !== 'updatedAt');
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
            
        // RECOVERY INFO MODAL
case 'recoveryInfo':
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
                           (data.userData?.sobrietyDate ? 
                            new Date(data.userData.sobrietyDate).toISOString().slice(0, 16) : '')}
                    onChange={(e) => setFormData({...formData, sobrietyDateTime: e.target.value})}
                />
            </div>
            <div className="form-group">
                <label className="form-label">Primary Substance</label>
                <select 
                    className="form-select"
                    value={formData.substance || data.userData?.substance || ''}
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
                    value={formData.dailyCost || data.userData?.dailyCost || ''}
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
                    value={formData.sponsorName || data.userData?.sponsorName || ''}
                    onChange={(e) => setFormData({...formData, sponsorName: e.target.value})}
                />
            </div>
            <div className="form-group">
                <label className="form-label">Sponsor Phone (Optional)</label>
                <input 
                    type="tel"
                    className="form-input"
                    value={formData.sponsorPhone || data.userData?.sponsorPhone || ''}
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
                            const oldDailyCost = data.user.dailyCost || 0;

                            // If dailyCost is changing and user has actualMoneySaved data
                            if (oldDailyCost > 0 && newDailyCost !== oldDailyCost) {
                                const currentActualSaved = data.user.actualMoneySaved || 0;
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
                        
                        // Add timestamp
                        updates.updatedAt = firebase.firestore.FieldValue.serverTimestamp();
                        
                        // Only proceed if there are updates
                        if (Object.keys(updates).length === 1) { // Only has updatedAt
                            alert('No changes to save');
                            return;
                        }
                        
                        // Update Firestore
                        await db.collection('users').doc(data.user.uid).update(updates);
                        
                        // Reload user data to reflect changes
                        const updatedDoc = await db.collection('users').doc(data.user.uid).get();
                        if (data.setUserData) {
                            data.setUserData(updatedDoc.data());
                            
                            // Recalculate sobriety days if date was updated
                            if (updates.sobrietyDate) {
                                const sobrietyDate = new Date(updates.sobrietyDate);
                                const today = new Date();
                                const diffTime = today - sobrietyDate;
                                const sobrietyDays = window.getSobrietyDays(userData.sobrietyDate);
                                if (data.setSobrietyDays) {
                                    data.setSobrietyDays(diffDays >= 0 ? diffDays : 0);
                                }
                                
                                // Recalculate money saved
                                if (data.setMoneySaved && updatedDoc.data().dailyCost) {
                                    data.setMoneySaved((diffDays * updatedDoc.data().dailyCost).toFixed(2));
                                }
                            }
                        }
                        
                        alert('Recovery settings updated!');
                        onClose();
                    } catch (error) {
                        alert('Failed to update settings: ' + error.message);
                    }
                }}
            >
                Save Changes
            </button>
        </div>
    );
            
        // PASSWORD & SECURITY MODAL
        case 'password':
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
                                const credential = firebase.auth.EmailAuthProvider.credential(
                                    data.user.email,
                                    formData.currentPassword
                                );
                                await data.user.reauthenticateWithCredential(credential);
                                await data.user.updatePassword(formData.newPassword);
                                alert('Password updated successfully!');
                                onClose();
                            } catch (error) {
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
            
        // NOTIFICATION SETTINGS MODAL
        case 'notificationSettings':
            return (
                <div>
                    <h3 style={{marginBottom: '20px'}}>Notification Settings</h3>
                    
                    <h4 style={{marginBottom: '15px', color: '#f4c430'}}>Daily Reminders</h4>
                    <div className="form-group">
                        <label className="form-label">Morning Check-in Time</label>
                        <input 
                            type="time"
                            className="form-input"
                            value={formData.morningCheckInTime || data.userData?.notifications?.morningCheckIn || '08:00'}
                            onChange={(e) => setFormData({...formData, morningCheckInTime: e.target.value})}
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Evening Reflection Time</label>
                        <input 
                            type="time"
                            className="form-input"
                            value={formData.eveningReflectionTime || data.userData?.notifications?.eveningReflection || '20:00'}
                            onChange={(e) => setFormData({...formData, eveningReflectionTime: e.target.value})}
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Daily Pledge Reminder</label>
                        <input 
                            type="time"
                            className="form-input"
                            value={formData.pledgeTime || data.userData?.notifications?.dailyPledge || '09:00'}
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
                            value={formData.timezone || data.userData?.timezone || 'America/Los_Angeles'}
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
                                await db.collection('users').doc(data.user.uid).update({
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
                                });
                                alert('Notification settings updated!');
                                onClose();
                            } catch (error) {
                                alert('Failed to update settings');
                            }
                        }}
                    >
                        Save Settings
                    </button>
                </div>
            );
            
   // GOOGLE CALENDAR MODAL - COMING SOON
case 'googleCalendar':
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
            
        // HELP & SUPPORT MODAL
        case 'help':
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
            
        // FEEDBACK MODAL
        case 'feedback':
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
                                await db.collection('feedback').add({
                                    userId: data.user.uid,
                                    userName: data.userData?.displayName || data.userData?.firstName || 'Anonymous',
                                    type: formData.feedbackType,
                                    message: formData.feedbackText,
                                    status: 'new',
                                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                                });
                                alert('Thank you for your feedback!');
                                onClose();
                            } catch (error) {
                                alert('Failed to send feedback');
                            }
                        }}
                    >
                        Send Feedback
                    </button>
                </div>
            );
            
        // EXPORT DATA MODAL
        case 'export':
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
                                triggerHaptic('light');
                                handlers.exportDataAsJSON();
                            }}
                            style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'}}
                        >
                            <i data-lucide="download" style={{width: '18px', height: '18px'}}></i>
                            Export as JSON (Technical Format)
                        </button>
                        <button
                            className="btn-primary"
                            onClick={() => {
                                triggerHaptic('light');
                                handlers.exportDataAsPDF();
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
            
        // DELETE ACCOUNT MODAL
        case 'deleteAccount':
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
                                    await db.collection('users').doc(data.user.uid).update({
                                        deleted: true,
                                        deletedAt: firebase.firestore.FieldValue.serverTimestamp()
                                    });
                                    await auth.currentUser.delete();
                                    alert('Account deleted. We wish you the best in your recovery journey.');
                                } catch (error) {
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
            
        // TERMS OF SERVICE MODAL
        case 'terms':
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
            
        // PRIVACY POLICY MODAL
        case 'privacy_policy':
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
            
        // ABOUT MODAL
        case 'about':
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
                        
                    default:
                        return <div>Content not available</div>;
                }
            };
            
           return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
        <div className="modal-content">
            <div className="modal-header">
                <h2 className="modal-title">{type === 'notifications' ? 'Notifications' : ''}</h2>
                <button className="close-btn" onClick={onClose}>×</button>
            </div>
            <div className="modal-body">
                {renderModalContent()}
            </div>
        </div>
    </div>
);
}