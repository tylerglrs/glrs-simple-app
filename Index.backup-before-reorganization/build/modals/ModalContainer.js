// Modal Container Component with ALL modals working
function ModalContainer({
  type,
  onClose,
  data,
  handlers
}) {
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
    overallDay: 5 // Changed from 3 to 5 (middle of 0-10)
  });
  const [topicMessage, setTopicMessage] = useState('');

  // ADD THESE LINES HERE:
  const [selectedImage, setSelectedImage] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [uploading, setUploading] = useState(false);

  // Get user from data
  const user = data.user || {};

  // Handler functions for topic room
  const handleTopicImageSelect = e => {
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
  const handleFlagTopicMessage = msg => {
    if (handlers.flagMessage) {
      handlers.flagMessage(msg);
    }
  };
  const renderModalContent = () => {
    switch (type) {
      case 'notifications':
        return /*#__PURE__*/React.createElement("div", {
          className: "notification-panel"
        }, /*#__PURE__*/React.createElement("h3", {
          style: {
            marginBottom: '20px'
          }
        }, "Notifications"), data.notifications.length > 0 ? /*#__PURE__*/React.createElement(React.Fragment, null, data.notifications.map(notification => /*#__PURE__*/React.createElement("div", {
          key: notification.id,
          className: `notification-item ${!notification.read ? 'unread' : ''}`,
          onClick: () => handlers.markNotificationAsRead(notification.id)
        }, /*#__PURE__*/React.createElement("div", {
          className: "notification-header"
        }, /*#__PURE__*/React.createElement("span", {
          className: "notification-type"
        }, notification.type), /*#__PURE__*/React.createElement("span", {
          className: "notification-time"
        }, notification.createdAt?.toDate ? new Date(notification.createdAt.toDate()).toLocaleTimeString() : 'now')), /*#__PURE__*/React.createElement("div", {
          className: "notification-message"
        }, /*#__PURE__*/React.createElement("strong", null, notification.title), /*#__PURE__*/React.createElement("div", null, notification.message)))), data.notifications.some(n => !n.read) && /*#__PURE__*/React.createElement("button", {
          className: "btn-primary",
          onClick: handlers.markAllNotificationsAsRead,
          style: {
            marginTop: '15px'
          }
        }, "Mark All as Read")) : /*#__PURE__*/React.createElement("div", {
          style: {
            textAlign: 'center',
            opacity: 0.6,
            padding: '40px'
          }
        }, "No notifications"));
      case 'checkIn':
        return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h3", {
          style: {
            marginBottom: '20px'
          }
        }, "Morning Check-in"), /*#__PURE__*/React.createElement("div", {
          className: "slider-group"
        }, /*#__PURE__*/React.createElement("div", {
          className: "slider-label"
        }, /*#__PURE__*/React.createElement("span", null, "Overall Mood"), /*#__PURE__*/React.createElement("span", {
          className: "slider-value"
        }, morningData.mood)), /*#__PURE__*/React.createElement("input", {
          type: "range",
          className: "slider",
          min: "0",
          max: "10",
          value: morningData.mood,
          onChange: e => setMorningData({
            ...morningData,
            mood: parseInt(e.target.value)
          })
        }), /*#__PURE__*/React.createElement("div", {
          style: {
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '12px',
            color: '#666',
            marginTop: '5px'
          }
        }, /*#__PURE__*/React.createElement("span", null, "0 (Worst)"), /*#__PURE__*/React.createElement("span", null, "5 (Neutral)"), /*#__PURE__*/React.createElement("span", null, "10 (Best)"))), /*#__PURE__*/React.createElement("div", {
          className: "slider-group"
        }, /*#__PURE__*/React.createElement("div", {
          className: "slider-label"
        }, /*#__PURE__*/React.createElement("span", null, "Craving Intensity"), /*#__PURE__*/React.createElement("span", {
          className: "slider-value"
        }, morningData.craving)), /*#__PURE__*/React.createElement("input", {
          type: "range",
          className: "slider",
          min: "0",
          max: "10",
          value: morningData.craving,
          onChange: e => setMorningData({
            ...morningData,
            craving: parseInt(e.target.value)
          })
        }), /*#__PURE__*/React.createElement("div", {
          style: {
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '12px',
            color: '#666',
            marginTop: '5px'
          }
        }, /*#__PURE__*/React.createElement("span", null, "0 (None)"), /*#__PURE__*/React.createElement("span", null, "5 (Moderate)"), /*#__PURE__*/React.createElement("span", null, "10 (Intense)"))), /*#__PURE__*/React.createElement("div", {
          className: "slider-group"
        }, /*#__PURE__*/React.createElement("div", {
          className: "slider-label"
        }, /*#__PURE__*/React.createElement("span", null, "Sleep Quality"), /*#__PURE__*/React.createElement("span", {
          className: "slider-value"
        }, morningData.sleepQuality)), /*#__PURE__*/React.createElement("input", {
          type: "range",
          className: "slider",
          min: "0",
          max: "10",
          value: morningData.sleepQuality,
          onChange: e => setMorningData({
            ...morningData,
            sleepQuality: parseInt(e.target.value)
          })
        }), /*#__PURE__*/React.createElement("div", {
          style: {
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '12px',
            color: '#666',
            marginTop: '5px'
          }
        }, /*#__PURE__*/React.createElement("span", null, "0 (Terrible)"), /*#__PURE__*/React.createElement("span", null, "5 (Fair)"), /*#__PURE__*/React.createElement("span", null, "10 (Excellent)"))), /*#__PURE__*/React.createElement("div", {
          className: "slider-group"
        }, /*#__PURE__*/React.createElement("div", {
          className: "slider-label"
        }, /*#__PURE__*/React.createElement("span", null, "Anxiety Level"), /*#__PURE__*/React.createElement("span", {
          className: "slider-value"
        }, morningData.anxietyLevel)), /*#__PURE__*/React.createElement("input", {
          type: "range",
          className: "slider",
          min: "0",
          max: "10",
          value: morningData.anxietyLevel,
          onChange: e => setMorningData({
            ...morningData,
            anxietyLevel: parseInt(e.target.value)
          })
        }), /*#__PURE__*/React.createElement("div", {
          style: {
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '12px',
            color: '#666',
            marginTop: '5px'
          }
        }, /*#__PURE__*/React.createElement("span", null, "0 (Calm)"), /*#__PURE__*/React.createElement("span", null, "5 (Moderate)"), /*#__PURE__*/React.createElement("span", null, "10 (Severe)"))), /*#__PURE__*/React.createElement("div", {
          className: "form-group"
        }, /*#__PURE__*/React.createElement("label", {
          className: "form-label"
        }, "Notes (Optional)"), /*#__PURE__*/React.createElement("textarea", {
          className: "textarea",
          placeholder: "Any thoughts or feelings you'd like to share?",
          value: morningData.notes,
          onChange: e => setMorningData({
            ...morningData,
            notes: e.target.value
          })
        })), /*#__PURE__*/React.createElement("button", {
          className: "btn-primary",
          onClick: async () => {
            await handlers.handleMorningCheckIn(morningData);
            onClose();
          }
        }, "Submit Check-in"));
      case 'reflection':
        return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h3", {
          style: {
            marginBottom: '20px'
          }
        }, "Evening Reflection"), /*#__PURE__*/React.createElement("div", {
          className: "form-group"
        }, /*#__PURE__*/React.createElement("label", {
          className: "form-label"
        }, "What are you grateful for today?"), /*#__PURE__*/React.createElement("textarea", {
          className: "textarea",
          placeholder: "List 3 things you're grateful for...",
          value: eveningData.gratitude,
          onChange: e => setEveningData({
            ...eveningData,
            gratitude: e.target.value
          })
        })), /*#__PURE__*/React.createElement("div", {
          className: "form-group"
        }, /*#__PURE__*/React.createElement("label", {
          className: "form-label"
        }, "What challenges did you face?"), /*#__PURE__*/React.createElement("textarea", {
          className: "textarea",
          placeholder: "Describe any difficulties...",
          value: eveningData.challenges,
          onChange: e => setEveningData({
            ...eveningData,
            challenges: e.target.value
          })
        })), /*#__PURE__*/React.createElement("div", {
          className: "form-group"
        }, /*#__PURE__*/React.createElement("label", {
          className: "form-label"
        }, "What's one goal for tomorrow?"), /*#__PURE__*/React.createElement("textarea", {
          className: "textarea",
          placeholder: "Set an intention...",
          value: eveningData.tomorrowGoal,
          onChange: e => setEveningData({
            ...eveningData,
            tomorrowGoal: e.target.value
          })
        })), /*#__PURE__*/React.createElement("div", {
          className: "slider-group"
        }, /*#__PURE__*/React.createElement("div", {
          className: "slider-label"
        }, /*#__PURE__*/React.createElement("span", null, "Overall Day Rating"), /*#__PURE__*/React.createElement("span", {
          className: "slider-value"
        }, eveningData.overallDay)), /*#__PURE__*/React.createElement("input", {
          type: "range",
          className: "slider",
          min: "0",
          max: "10",
          value: eveningData.overallDay,
          onChange: e => setEveningData({
            ...eveningData,
            overallDay: parseInt(e.target.value)
          })
        }), /*#__PURE__*/React.createElement("div", {
          style: {
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '12px',
            color: '#666',
            marginTop: '5px'
          }
        }, /*#__PURE__*/React.createElement("span", null, "0 (Terrible)"), /*#__PURE__*/React.createElement("span", null, "5 (OK)"), /*#__PURE__*/React.createElement("span", null, "10 (Excellent)"))), /*#__PURE__*/React.createElement("button", {
          className: "btn-primary",
          onClick: async () => {
            await handlers.handleEveningReflection(eveningData);
            onClose();
          }
        }, "Submit Reflection"));
      case 'topicRoom':
        return /*#__PURE__*/React.createElement("div", null, " ", /*#__PURE__*/React.createElement("h3", {
          style: {
            marginBottom: '20px'
          }
        }, data.activeTopicRoom?.icon, " ", data.activeTopicRoom?.name), /*#__PURE__*/React.createElement("p", {
          style: {
            opacity: 0.8,
            marginBottom: '20px'
          }
        }, data.activeTopicRoom?.description), /*#__PURE__*/React.createElement("div", {
          style: {
            flex: 1,
            overflowY: 'auto',
            padding: '15px',
            height: '300px'
          }
        }, data.topicRoomMessages?.map(msg => /*#__PURE__*/React.createElement("div", {
          key: msg.id,
          style: {
            background: msg.userId === user.uid ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'rgba(255,255,255,0.05)',
            padding: '12px',
            borderRadius: '12px',
            marginBottom: '10px'
          }
        }, /*#__PURE__*/React.createElement("div", {
          style: {
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '8px'
          }
        }, /*#__PURE__*/React.createElement("span", {
          style: {
            fontWeight: 'bold',
            color: '#f4c430'
          }
        }, msg.senderName || 'Anonymous'), /*#__PURE__*/React.createElement("div", {
          style: {
            display: 'flex',
            gap: '10px',
            alignItems: 'center'
          }
        }, /*#__PURE__*/React.createElement("span", {
          style: {
            fontSize: '12px',
            opacity: 0.7,
            color: 'white'
          }
        }, msg.createdAt?.toDate ? msg.createdAt.toDate().toLocaleTimeString() : 'sending...'), msg.userId !== user.uid && /*#__PURE__*/React.createElement("button", {
          onClick: () => handleFlagTopicMessage(msg),
          style: {
            background: 'transparent',
            border: 'none',
            color: 'rgba(255,255,255,0.5)',
            cursor: 'pointer',
            fontSize: '14px',
            padding: '2px'
          },
          title: "Flag inappropriate content"
        }, /*#__PURE__*/React.createElement("i", {
          "data-lucide": "flag",
          style: {
            width: '16px',
            height: '16px'
          }
        })))), msg.message && /*#__PURE__*/React.createElement("p", {
          style: {
            margin: 0,
            color: 'white',
            lineHeight: 1.5
          }
        }, msg.message), msg.imageUrl && /*#__PURE__*/React.createElement("img", {
          src: msg.imageUrl,
          alt: "Shared",
          style: {
            maxWidth: '100%',
            maxHeight: '300px',
            borderRadius: '8px',
            marginTop: '10px',
            cursor: 'pointer'
          },
          onClick: () => window.open(msg.imageUrl, '_blank')
        })))), /*#__PURE__*/React.createElement("div", {
          style: {
            padding: '15px',
            borderTop: '1px solid rgba(255,255,255,0.1)'
          }
        }, selectedImage && /*#__PURE__*/React.createElement("div", {
          style: {
            marginBottom: '10px',
            padding: '8px',
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '8px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }
        }, /*#__PURE__*/React.createElement("span", {
          style: {
            color: 'white',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }
        }, /*#__PURE__*/React.createElement("i", {
          "data-lucide": "camera",
          style: {
            width: '16px',
            height: '16px'
          }
        }), selectedImage.name), /*#__PURE__*/React.createElement("button", {
          onClick: () => {
            setSelectedImage(null);
            document.getElementById('topic-image-input').value = '';
          },
          style: {
            background: 'transparent',
            border: 'none',
            color: 'white',
            cursor: 'pointer'
          }
        }, "\u2715")), /*#__PURE__*/React.createElement("div", {
          style: {
            display: 'flex',
            gap: '10px'
          }
        }, /*#__PURE__*/React.createElement("input", {
          type: "file",
          id: "topic-image-input",
          accept: "image/*",
          style: {
            display: 'none'
          },
          onChange: handleTopicImageSelect
        }), /*#__PURE__*/React.createElement("button", {
          onClick: () => document.getElementById('topic-image-input').click(),
          style: {
            background: 'rgba(255,255,255,0.1)',
            border: 'none',
            borderRadius: '8px',
            padding: '10px',
            color: 'white',
            cursor: 'pointer'
          },
          disabled: uploading
        }, /*#__PURE__*/React.createElement("i", {
          "data-lucide": "camera",
          style: {
            width: '18px',
            height: '18px'
          }
        })), /*#__PURE__*/React.createElement("input", {
          type: "text",
          value: newMessage,
          onChange: e => setNewMessage(e.target.value),
          placeholder: "Type a message...",
          onKeyPress: e => e.key === 'Enter' && handleSendMessage(),
          style: {
            flex: 1,
            padding: '10px',
            background: 'rgba(255,255,255,0.1)',
            border: 'none',
            borderRadius: '8px',
            color: 'white'
          }
        }), /*#__PURE__*/React.createElement("button", {
          onClick: handleSendMessage,
          disabled: uploading || !newMessage.trim() && !selectedImage,
          style: {
            padding: '10px 20px',
            background: uploading ? 'gray' : '#f4c430',
            border: 'none',
            borderRadius: '8px',
            color: 'black',
            fontWeight: 'bold',
            cursor: uploading ? 'not-allowed' : 'pointer'
          }
        }, uploading ? '...' : 'Send'))));
      case 'account':
        return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h3", {
          style: {
            marginBottom: '20px'
          }
        }, "Account Settings"), /*#__PURE__*/React.createElement("div", {
          className: "form-group"
        }, /*#__PURE__*/React.createElement("label", {
          className: "form-label"
        }, "Display Name"), /*#__PURE__*/React.createElement("input", {
          type: "text",
          className: "form-input",
          value: formData.displayName || data.userData?.displayName || '',
          onChange: e => setFormData({
            ...formData,
            displayName: e.target.value
          })
        })), /*#__PURE__*/React.createElement("div", {
          className: "form-group"
        }, /*#__PURE__*/React.createElement("label", {
          className: "form-label"
        }, "First Name"), /*#__PURE__*/React.createElement("input", {
          type: "text",
          className: "form-input",
          value: formData.firstName || data.userData?.firstName || '',
          onChange: e => setFormData({
            ...formData,
            firstName: e.target.value
          })
        })), /*#__PURE__*/React.createElement("div", {
          className: "form-group"
        }, /*#__PURE__*/React.createElement("label", {
          className: "form-label"
        }, "Last Name"), /*#__PURE__*/React.createElement("input", {
          type: "text",
          className: "form-input",
          value: formData.lastName || data.userData?.lastName || '',
          onChange: e => setFormData({
            ...formData,
            lastName: e.target.value
          })
        })), /*#__PURE__*/React.createElement("div", {
          className: "form-group"
        }, /*#__PURE__*/React.createElement("label", {
          className: "form-label"
        }, "Phone"), /*#__PURE__*/React.createElement("input", {
          type: "tel",
          className: "form-input",
          value: formData.phone || data.userData?.phone || '',
          onChange: e => setFormData({
            ...formData,
            phone: e.target.value
          })
        })), /*#__PURE__*/React.createElement("div", {
          className: "form-group"
        }, /*#__PURE__*/React.createElement("label", {
          className: "form-label"
        }, "Street Address"), /*#__PURE__*/React.createElement("input", {
          type: "text",
          className: "form-input",
          value: formData.street || data.userData?.address?.street || '',
          onChange: e => setFormData({
            ...formData,
            street: e.target.value
          })
        })), /*#__PURE__*/React.createElement("div", {
          className: "form-group"
        }, /*#__PURE__*/React.createElement("label", {
          className: "form-label"
        }, "City"), /*#__PURE__*/React.createElement("input", {
          type: "text",
          className: "form-input",
          value: formData.city || data.userData?.address?.city || '',
          onChange: e => setFormData({
            ...formData,
            city: e.target.value
          })
        })), /*#__PURE__*/React.createElement("div", {
          className: "form-group"
        }, /*#__PURE__*/React.createElement("label", {
          className: "form-label"
        }, "State"), /*#__PURE__*/React.createElement("input", {
          type: "text",
          className: "form-input",
          value: formData.state || data.userData?.address?.state || '',
          onChange: e => setFormData({
            ...formData,
            state: e.target.value
          })
        })), /*#__PURE__*/React.createElement("div", {
          className: "form-group"
        }, /*#__PURE__*/React.createElement("label", {
          className: "form-label"
        }, "ZIP"), /*#__PURE__*/React.createElement("input", {
          type: "text",
          className: "form-input",
          value: formData.zip || data.userData?.address?.zip || '',
          onChange: e => setFormData({
            ...formData,
            zip: e.target.value
          })
        })), /*#__PURE__*/React.createElement("button", {
          className: "btn-primary",
          onClick: async () => {
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
          }
        }, "Save Changes"));
      case 'emergency':
        return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h3", {
          style: {
            marginBottom: '20px'
          }
        }, "Emergency Contacts"), data.userData?.emergencyContacts?.map((contact, index) => /*#__PURE__*/React.createElement("div", {
          key: index,
          style: {
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '10px',
            padding: '15px',
            marginBottom: '10px'
          }
        }, /*#__PURE__*/React.createElement("div", {
          style: {
            fontWeight: 'bold'
          }
        }, contact.name), /*#__PURE__*/React.createElement("div", null, contact.phone), /*#__PURE__*/React.createElement("div", {
          style: {
            opacity: 0.8,
            fontSize: '14px'
          }
        }, contact.relationship))), /*#__PURE__*/React.createElement("h4", {
          style: {
            marginTop: '20px',
            marginBottom: '15px'
          }
        }, "Add New Contact"), /*#__PURE__*/React.createElement("div", {
          className: "form-group"
        }, /*#__PURE__*/React.createElement("input", {
          type: "text",
          className: "form-input",
          placeholder: "Name",
          value: formData.contactName || '',
          onChange: e => setFormData({
            ...formData,
            contactName: e.target.value
          })
        })), /*#__PURE__*/React.createElement("div", {
          className: "form-group"
        }, /*#__PURE__*/React.createElement("input", {
          type: "tel",
          className: "form-input",
          placeholder: "Phone",
          value: formData.contactPhone || '',
          onChange: e => setFormData({
            ...formData,
            contactPhone: e.target.value
          })
        })), /*#__PURE__*/React.createElement("div", {
          className: "form-group"
        }, /*#__PURE__*/React.createElement("input", {
          type: "text",
          className: "form-input",
          placeholder: "Relationship",
          value: formData.contactRelationship || '',
          onChange: e => setFormData({
            ...formData,
            contactRelationship: e.target.value
          })
        })), /*#__PURE__*/React.createElement("button", {
          className: "btn-primary",
          onClick: async () => {
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
          }
        }, "Add Contact"));
      case 'profilePrompt':
        return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h3", {
          style: {
            marginBottom: '20px'
          }
        }, "Complete Your Profile"), /*#__PURE__*/React.createElement("p", {
          style: {
            marginBottom: '20px',
            opacity: 0.9
          }
        }, "Help us personalize your recovery journey by completing your profile."), /*#__PURE__*/React.createElement("button", {
          className: "btn-primary",
          onClick: () => {
            onClose();
            setTimeout(() => setShowModal('account'), 100);
          }
        }, "Complete Profile"), /*#__PURE__*/React.createElement("button", {
          style: {
            background: 'transparent',
            border: '1px solid rgba(255,255,255,0.3)',
            color: 'white',
            padding: '10px',
            borderRadius: '10px',
            width: '100%',
            marginTop: '10px',
            cursor: 'pointer'
          },
          onClick: onClose
        }, "Remind Me Later"));
      // Enhanced Modal Cases for ModalContainer
      // PERSONAL INFORMATION MODAL
      case 'personalInfo':
        return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h3", {
          style: {
            marginBottom: '20px'
          }
        }, "Personal Information"), /*#__PURE__*/React.createElement("div", {
          className: "form-group"
        }, /*#__PURE__*/React.createElement("label", {
          className: "form-label"
        }, "First Name"), /*#__PURE__*/React.createElement("input", {
          type: "text",
          className: "form-input",
          value: formData.firstName || data.userData?.firstName || '',
          onChange: e => setFormData({
            ...formData,
            firstName: e.target.value
          })
        })), /*#__PURE__*/React.createElement("div", {
          className: "form-group"
        }, /*#__PURE__*/React.createElement("label", {
          className: "form-label"
        }, "Last Name"), /*#__PURE__*/React.createElement("input", {
          type: "text",
          className: "form-input",
          value: formData.lastName || data.userData?.lastName || '',
          onChange: e => setFormData({
            ...formData,
            lastName: e.target.value
          })
        })), /*#__PURE__*/React.createElement("div", {
          className: "form-group"
        }, /*#__PURE__*/React.createElement("label", {
          className: "form-label"
        }, "Display Name"), /*#__PURE__*/React.createElement("input", {
          type: "text",
          className: "form-input",
          value: formData.displayName || data.userData?.displayName || '',
          onChange: e => setFormData({
            ...formData,
            displayName: e.target.value
          })
        })), /*#__PURE__*/React.createElement("div", {
          className: "form-group"
        }, /*#__PURE__*/React.createElement("label", {
          className: "form-label"
        }, "Phone"), /*#__PURE__*/React.createElement("input", {
          type: "tel",
          className: "form-input",
          value: formData.phone || data.userData?.phone || '',
          onChange: e => setFormData({
            ...formData,
            phone: e.target.value
          })
        })), /*#__PURE__*/React.createElement("div", {
          className: "form-group"
        }, /*#__PURE__*/React.createElement("label", {
          className: "form-label"
        }, "Date of Birth"), /*#__PURE__*/React.createElement("input", {
          type: "date",
          className: "form-input",
          value: formData.dateOfBirth || data.userData?.dateOfBirth || '',
          onChange: e => setFormData({
            ...formData,
            dateOfBirth: e.target.value
          })
        })), /*#__PURE__*/React.createElement("div", {
          className: "form-group"
        }, /*#__PURE__*/React.createElement("label", {
          className: "form-label"
        }, "Gender"), /*#__PURE__*/React.createElement("select", {
          className: "form-select",
          value: formData.gender || data.userData?.gender || '',
          onChange: e => setFormData({
            ...formData,
            gender: e.target.value
          })
        }, /*#__PURE__*/React.createElement("option", {
          value: ""
        }, "Select Gender"), /*#__PURE__*/React.createElement("option", {
          value: "male"
        }, "Male"), /*#__PURE__*/React.createElement("option", {
          value: "female"
        }, "Female"), /*#__PURE__*/React.createElement("option", {
          value: "non-binary"
        }, "Non-Binary"), /*#__PURE__*/React.createElement("option", {
          value: "prefer-not"
        }, "Prefer Not to Say"))), /*#__PURE__*/React.createElement("div", {
          className: "form-group"
        }, /*#__PURE__*/React.createElement("label", {
          className: "form-label"
        }, "Street Address"), /*#__PURE__*/React.createElement("input", {
          type: "text",
          className: "form-input",
          value: formData.street || data.userData?.address?.street || '',
          onChange: e => setFormData({
            ...formData,
            street: e.target.value
          })
        })), /*#__PURE__*/React.createElement("div", {
          className: "form-group"
        }, /*#__PURE__*/React.createElement("label", {
          className: "form-label"
        }, "City"), /*#__PURE__*/React.createElement("input", {
          type: "text",
          className: "form-input",
          value: formData.city || data.userData?.address?.city || '',
          onChange: e => setFormData({
            ...formData,
            city: e.target.value
          })
        })), /*#__PURE__*/React.createElement("div", {
          className: "form-group"
        }, /*#__PURE__*/React.createElement("label", {
          className: "form-label"
        }, "State"), /*#__PURE__*/React.createElement("input", {
          type: "text",
          className: "form-input",
          value: formData.state || data.userData?.address?.state || '',
          onChange: e => setFormData({
            ...formData,
            state: e.target.value
          })
        })), /*#__PURE__*/React.createElement("div", {
          className: "form-group"
        }, /*#__PURE__*/React.createElement("label", {
          className: "form-label"
        }, "ZIP Code"), /*#__PURE__*/React.createElement("input", {
          type: "text",
          className: "form-input",
          value: formData.zip || data.userData?.address?.zip || '',
          onChange: e => setFormData({
            ...formData,
            zip: e.target.value
          })
        })), /*#__PURE__*/React.createElement("div", {
          className: "form-group"
        }, /*#__PURE__*/React.createElement("label", {
          className: "form-label"
        }, "Insurance Provider (Optional)"), /*#__PURE__*/React.createElement("input", {
          type: "text",
          className: "form-input",
          value: formData.insurance || data.userData?.insurance || '',
          onChange: e => setFormData({
            ...formData,
            insurance: e.target.value
          })
        })), /*#__PURE__*/React.createElement("div", {
          className: "form-group"
        }, /*#__PURE__*/React.createElement("label", {
          className: "form-label"
        }, "Insurance ID (Optional)"), /*#__PURE__*/React.createElement("input", {
          type: "text",
          className: "form-input",
          value: formData.insuranceId || data.userData?.insuranceId || '',
          onChange: e => setFormData({
            ...formData,
            insuranceId: e.target.value
          })
        })), /*#__PURE__*/React.createElement("button", {
          className: "btn-primary",
          onClick: async () => {
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
              const hasAddressData = addressFields.some(field => formData[field] !== undefined && formData[field] !== '');
              if (hasAddressData) {
                // Get existing address to merge with
                const userDoc = await db.collection('users').doc(data.user.uid).get();
                const existingAddress = userDoc.data()?.address || {};
                updates.address = {
                  street: formData.street !== undefined ? formData.street : existingAddress.street || '',
                  city: formData.city !== undefined ? formData.city : existingAddress.city || '',
                  state: formData.state !== undefined ? formData.state : existingAddress.state || '',
                  zip: formData.zip !== undefined ? formData.zip : existingAddress.zip || ''
                };
              }

              // Add timestamp
              updates.updatedAt = firebase.firestore.FieldValue.serverTimestamp();

              // Only proceed if there are updates to make
              if (Object.keys(updates).length === 1) {
                // Only updatedAt
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
          }
        }, "Save Changes"));

      // RECOVERY INFO MODAL
      case 'recoveryInfo':
        return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h3", {
          style: {
            marginBottom: '20px'
          }
        }, "Recovery Settings"), /*#__PURE__*/React.createElement("div", {
          className: "form-group"
        }, /*#__PURE__*/React.createElement("label", {
          className: "form-label"
        }, "Sobriety Date & Time", /*#__PURE__*/React.createElement("small", {
          style: {
            display: 'block',
            opacity: 0.8,
            marginTop: '5px',
            fontSize: '12px'
          }
        }, "Enter the date and time 24 hours after your last use")), /*#__PURE__*/React.createElement("input", {
          type: "datetime-local",
          className: "form-input",
          value: formData.sobrietyDateTime || (data.userData?.sobrietyDate ? new Date(data.userData.sobrietyDate).toISOString().slice(0, 16) : ''),
          onChange: e => setFormData({
            ...formData,
            sobrietyDateTime: e.target.value
          })
        })), /*#__PURE__*/React.createElement("div", {
          className: "form-group"
        }, /*#__PURE__*/React.createElement("label", {
          className: "form-label"
        }, "Primary Substance"), /*#__PURE__*/React.createElement("select", {
          className: "form-select",
          value: formData.substance || data.userData?.substance || '',
          onChange: e => setFormData({
            ...formData,
            substance: e.target.value
          })
        }, /*#__PURE__*/React.createElement("option", {
          value: ""
        }, "Select Substance"), /*#__PURE__*/React.createElement("option", {
          value: "alcohol"
        }, "Alcohol"), /*#__PURE__*/React.createElement("option", {
          value: "opioids"
        }, "Opioids"), /*#__PURE__*/React.createElement("option", {
          value: "stimulants"
        }, "Stimulants"), /*#__PURE__*/React.createElement("option", {
          value: "cannabis"
        }, "Cannabis"), /*#__PURE__*/React.createElement("option", {
          value: "benzodiazepines"
        }, "Benzodiazepines"), /*#__PURE__*/React.createElement("option", {
          value: "multiple"
        }, "Multiple Substances"), /*#__PURE__*/React.createElement("option", {
          value: "other"
        }, "Other"))), /*#__PURE__*/React.createElement("div", {
          className: "form-group"
        }, /*#__PURE__*/React.createElement("label", {
          className: "form-label"
        }, "Daily Cost of Use ($)"), /*#__PURE__*/React.createElement("input", {
          type: "number",
          className: "form-input",
          placeholder: "Amount spent per day (e.g., 20)",
          value: formData.dailyCost || data.userData?.dailyCost || '',
          onChange: e => setFormData({
            ...formData,
            dailyCost: parseFloat(e.target.value)
          })
        }), /*#__PURE__*/React.createElement("small", {
          style: {
            color: 'rgba(255,255,255,0.6)',
            display: 'block',
            marginTop: '5px'
          }
        }, "Used to calculate money saved in recovery")), /*#__PURE__*/React.createElement("div", {
          className: "form-group"
        }, /*#__PURE__*/React.createElement("label", {
          className: "form-label"
        }, "Sponsor Name (Optional)"), /*#__PURE__*/React.createElement("input", {
          type: "text",
          className: "form-input",
          value: formData.sponsorName || data.userData?.sponsorName || '',
          onChange: e => setFormData({
            ...formData,
            sponsorName: e.target.value
          })
        })), /*#__PURE__*/React.createElement("div", {
          className: "form-group"
        }, /*#__PURE__*/React.createElement("label", {
          className: "form-label"
        }, "Sponsor Phone (Optional)"), /*#__PURE__*/React.createElement("input", {
          type: "tel",
          className: "form-input",
          value: formData.sponsorPhone || data.userData?.sponsorPhone || '',
          onChange: e => setFormData({
            ...formData,
            sponsorPhone: e.target.value
          })
        })), /*#__PURE__*/React.createElement("button", {
          className: "btn-primary",
          onClick: async () => {
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
                  const warningMessage = `⚠️ Changing Daily Cost Impact:\n\n` + `Old: $${oldDailyCost}/day → New: $${newDailyCost}/day\n\n` + `This will change all your savings calculations.\n\n` + `Your current actual savings: $${currentActualSaved.toLocaleString()}\n\n` + `Would you like to adjust your actual savings proportionally?\n\n` + `Adjusted amount: $${adjustedAmount.toLocaleString()}\n\n` + `Click OK to adjust, Cancel to keep $${currentActualSaved.toLocaleString()}`;
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
              if (Object.keys(updates).length === 1) {
                // Only has updatedAt
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
          }
        }, "Save Changes"));

      // PASSWORD & SECURITY MODAL
      case 'password':
        return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h3", {
          style: {
            marginBottom: '20px'
          }
        }, "Password & Security"), /*#__PURE__*/React.createElement("div", {
          className: "form-group"
        }, /*#__PURE__*/React.createElement("label", {
          className: "form-label"
        }, "Current Password"), /*#__PURE__*/React.createElement("input", {
          type: "password",
          className: "form-input",
          value: formData.currentPassword || '',
          onChange: e => setFormData({
            ...formData,
            currentPassword: e.target.value
          })
        })), /*#__PURE__*/React.createElement("div", {
          className: "form-group"
        }, /*#__PURE__*/React.createElement("label", {
          className: "form-label"
        }, "New Password"), /*#__PURE__*/React.createElement("input", {
          type: "password",
          className: "form-input",
          value: formData.newPassword || '',
          onChange: e => setFormData({
            ...formData,
            newPassword: e.target.value
          })
        })), /*#__PURE__*/React.createElement("div", {
          className: "form-group"
        }, /*#__PURE__*/React.createElement("label", {
          className: "form-label"
        }, "Confirm New Password"), /*#__PURE__*/React.createElement("input", {
          type: "password",
          className: "form-input",
          value: formData.confirmPassword || '',
          onChange: e => setFormData({
            ...formData,
            confirmPassword: e.target.value
          })
        })), /*#__PURE__*/React.createElement("button", {
          className: "btn-primary",
          onClick: async () => {
            if (formData.newPassword !== formData.confirmPassword) {
              alert('Passwords do not match');
              return;
            }
            try {
              const credential = firebase.auth.EmailAuthProvider.credential(data.user.email, formData.currentPassword);
              await data.user.reauthenticateWithCredential(credential);
              await data.user.updatePassword(formData.newPassword);
              alert('Password updated successfully!');
              onClose();
            } catch (error) {
              alert('Failed to update password. Check current password.');
            }
          }
        }, "Update Password"), /*#__PURE__*/React.createElement("div", {
          style: {
            marginTop: '30px',
            paddingTop: '20px',
            borderTop: '1px solid rgba(255,255,255,0.1)'
          }
        }, /*#__PURE__*/React.createElement("h4", {
          style: {
            marginBottom: '15px'
          }
        }, "Two-Factor Authentication"), /*#__PURE__*/React.createElement("p", {
          style: {
            fontSize: '14px',
            opacity: 0.8,
            marginBottom: '15px'
          }
        }, "Add an extra layer of security to your account"), /*#__PURE__*/React.createElement("button", {
          className: "btn-primary",
          style: {
            background: 'rgba(76, 175, 80, 0.2)',
            border: '1px solid #4CAF50'
          }
        }, "Enable 2FA (Coming Soon)")));

      // NOTIFICATION SETTINGS MODAL
      case 'notificationSettings':
        return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h3", {
          style: {
            marginBottom: '20px'
          }
        }, "Notification Settings"), /*#__PURE__*/React.createElement("h4", {
          style: {
            marginBottom: '15px',
            color: '#f4c430'
          }
        }, "Daily Reminders"), /*#__PURE__*/React.createElement("div", {
          className: "form-group"
        }, /*#__PURE__*/React.createElement("label", {
          className: "form-label"
        }, "Morning Check-in Time"), /*#__PURE__*/React.createElement("input", {
          type: "time",
          className: "form-input",
          value: formData.morningCheckInTime || data.userData?.notifications?.morningCheckIn || '08:00',
          onChange: e => setFormData({
            ...formData,
            morningCheckInTime: e.target.value
          })
        })), /*#__PURE__*/React.createElement("div", {
          className: "form-group"
        }, /*#__PURE__*/React.createElement("label", {
          className: "form-label"
        }, "Evening Reflection Time"), /*#__PURE__*/React.createElement("input", {
          type: "time",
          className: "form-input",
          value: formData.eveningReflectionTime || data.userData?.notifications?.eveningReflection || '20:00',
          onChange: e => setFormData({
            ...formData,
            eveningReflectionTime: e.target.value
          })
        })), /*#__PURE__*/React.createElement("div", {
          className: "form-group"
        }, /*#__PURE__*/React.createElement("label", {
          className: "form-label"
        }, "Daily Pledge Reminder"), /*#__PURE__*/React.createElement("input", {
          type: "time",
          className: "form-input",
          value: formData.pledgeTime || data.userData?.notifications?.dailyPledge || '09:00',
          onChange: e => setFormData({
            ...formData,
            pledgeTime: e.target.value
          })
        })), /*#__PURE__*/React.createElement("h4", {
          style: {
            marginBottom: '15px',
            marginTop: '25px',
            color: '#f4c430'
          }
        }, "Alert Preferences"), /*#__PURE__*/React.createElement("div", {
          style: {
            display: 'flex',
            flexDirection: 'column',
            gap: '15px'
          }
        }, /*#__PURE__*/React.createElement("label", {
          style: {
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }
        }, /*#__PURE__*/React.createElement("input", {
          type: "checkbox",
          checked: formData.assignmentAlerts !== false,
          onChange: e => setFormData({
            ...formData,
            assignmentAlerts: e.target.checked
          })
        }), "Assignment due date reminders"), /*#__PURE__*/React.createElement("label", {
          style: {
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }
        }, /*#__PURE__*/React.createElement("input", {
          type: "checkbox",
          checked: formData.milestoneAlerts !== false,
          onChange: e => setFormData({
            ...formData,
            milestoneAlerts: e.target.checked
          })
        }), "Milestone celebration alerts"), /*#__PURE__*/React.createElement("label", {
          style: {
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }
        }, /*#__PURE__*/React.createElement("input", {
          type: "checkbox",
          checked: formData.messageAlerts !== false,
          onChange: e => setFormData({
            ...formData,
            messageAlerts: e.target.checked
          })
        }), "New message notifications"), /*#__PURE__*/React.createElement("label", {
          style: {
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }
        }, /*#__PURE__*/React.createElement("input", {
          type: "checkbox",
          checked: formData.missedCheckInAlerts !== false,
          onChange: e => setFormData({
            ...formData,
            missedCheckInAlerts: e.target.checked
          })
        }), "Missed check-in reminders")), /*#__PURE__*/React.createElement("h4", {
          style: {
            marginBottom: '15px',
            marginTop: '25px',
            color: '#f4c430'
          }
        }, "Time Zone"), /*#__PURE__*/React.createElement("div", {
          className: "form-group"
        }, /*#__PURE__*/React.createElement("select", {
          className: "form-select",
          value: formData.timezone || data.userData?.timezone || 'America/Los_Angeles',
          onChange: e => setFormData({
            ...formData,
            timezone: e.target.value
          })
        }, /*#__PURE__*/React.createElement("option", {
          value: "America/Los_Angeles"
        }, "Pacific Time"), /*#__PURE__*/React.createElement("option", {
          value: "America/Denver"
        }, "Mountain Time"), /*#__PURE__*/React.createElement("option", {
          value: "America/Chicago"
        }, "Central Time"), /*#__PURE__*/React.createElement("option", {
          value: "America/New_York"
        }, "Eastern Time"), /*#__PURE__*/React.createElement("option", {
          value: "America/Phoenix"
        }, "Arizona"), /*#__PURE__*/React.createElement("option", {
          value: "Pacific/Honolulu"
        }, "Hawaii"), /*#__PURE__*/React.createElement("option", {
          value: "America/Anchorage"
        }, "Alaska"))), /*#__PURE__*/React.createElement("button", {
          className: "btn-primary",
          onClick: async () => {
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
          }
        }, "Save Settings"));

      // GOOGLE CALENDAR MODAL - COMING SOON
      case 'googleCalendar':
        return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h3", {
          style: {
            marginBottom: '20px'
          }
        }, "Google Calendar Integration"), /*#__PURE__*/React.createElement("div", {
          style: {
            background: 'rgba(244, 196, 48, 0.1)',
            border: '1px solid rgba(244, 196, 48, 0.3)',
            borderRadius: '10px',
            padding: '30px',
            marginBottom: '20px',
            textAlign: 'center'
          }
        }, /*#__PURE__*/React.createElement("div", {
          style: {
            marginBottom: '15px'
          }
        }, /*#__PURE__*/React.createElement("i", {
          "data-lucide": "construction",
          style: {
            width: '64px',
            height: '64px',
            color: 'var(--color-warning)'
          }
        })), /*#__PURE__*/React.createElement("div", {
          style: {
            fontSize: '24px',
            fontWeight: 'bold',
            marginBottom: '10px',
            color: '#f4c430'
          }
        }, "Coming Soon!"), /*#__PURE__*/React.createElement("div", {
          style: {
            fontSize: '16px',
            opacity: 0.9,
            lineHeight: '1.6'
          }
        }, "We're working on Google Calendar integration.", /*#__PURE__*/React.createElement("br", null), "This feature will be available soon.")), /*#__PURE__*/React.createElement("div", {
          style: {
            background: 'rgba(33, 150, 243, 0.1)',
            border: '1px solid rgba(33, 150, 243, 0.3)',
            borderRadius: '10px',
            padding: '20px',
            marginBottom: '20px'
          }
        }, /*#__PURE__*/React.createElement("h4", {
          style: {
            color: '#2196F3',
            marginBottom: '15px',
            fontSize: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }
        }, /*#__PURE__*/React.createElement("i", {
          "data-lucide": "calendar",
          style: {
            width: '18px',
            height: '18px'
          }
        }), "What's Coming"), /*#__PURE__*/React.createElement("ul", {
          style: {
            fontSize: '14px',
            opacity: 0.9,
            paddingLeft: '20px',
            margin: '10px 0',
            lineHeight: '2'
          }
        }, /*#__PURE__*/React.createElement("li", null, "Sync recovery milestones to your personal calendar"), /*#__PURE__*/React.createElement("li", null, "Automatic reminders for scheduled meetings"), /*#__PURE__*/React.createElement("li", null, "Support group session notifications"), /*#__PURE__*/React.createElement("li", null, "One-click calendar integration"))), /*#__PURE__*/React.createElement("button", {
          className: "btn-primary",
          onClick: onClose
        }, "Got It"));

      // HELP & SUPPORT MODAL
      case 'help':
        return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h3", {
          style: {
            marginBottom: '20px'
          }
        }, "Help & Support"), /*#__PURE__*/React.createElement("div", {
          style: {
            background: 'rgba(244, 196, 48, 0.1)',
            border: '1px solid rgba(244, 196, 48, 0.3)',
            borderRadius: '10px',
            padding: '15px',
            marginBottom: '20px'
          }
        }, /*#__PURE__*/React.createElement("h4", {
          style: {
            color: '#f4c430',
            marginBottom: '10px'
          }
        }, "Need Immediate Help?"), /*#__PURE__*/React.createElement("div", {
          style: {
            marginBottom: '10px'
          }
        }, /*#__PURE__*/React.createElement("strong", null, "Crisis Line:"), " ", /*#__PURE__*/React.createElement("a", {
          href: "tel:988",
          style: {
            color: '#f4c430'
          }
        }, "988")), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("strong", null, "SAMHSA Helpline:"), " ", /*#__PURE__*/React.createElement("a", {
          href: "tel:1-800-662-4357",
          style: {
            color: '#f4c430'
          }
        }, "1-800-662-HELP"))), /*#__PURE__*/React.createElement("h4", {
          style: {
            marginBottom: '15px'
          }
        }, "Contact Support"), /*#__PURE__*/React.createElement("div", {
          style: {
            marginBottom: '15px'
          }
        }, /*#__PURE__*/React.createElement("strong", null, "Email:"), " info@glrecoveryservices.com"), /*#__PURE__*/React.createElement("div", {
          style: {
            marginBottom: '15px'
          }
        }, /*#__PURE__*/React.createElement("strong", null, "Phone:"), " Contact Your Coach"), /*#__PURE__*/React.createElement("div", {
          style: {
            marginBottom: '20px'
          }
        }, /*#__PURE__*/React.createElement("strong", null, "Hours:"), " Monday - Friday, 9am - 5pm PST"), /*#__PURE__*/React.createElement("h4", {
          style: {
            marginBottom: '15px'
          }
        }, "Frequently Asked Questions"), /*#__PURE__*/React.createElement("div", {
          style: {
            display: 'flex',
            flexDirection: 'column',
            gap: '15px'
          }
        }, /*#__PURE__*/React.createElement("details", {
          style: {
            cursor: 'pointer'
          }
        }, /*#__PURE__*/React.createElement("summary", {
          style: {
            fontWeight: 'bold',
            marginBottom: '5px'
          }
        }, "How do I complete a check-in?"), /*#__PURE__*/React.createElement("p", {
          style: {
            fontSize: '14px',
            opacity: 0.8,
            paddingLeft: '15px'
          }
        }, "Navigate to the Tasks tab and tap on Morning Check-in or Evening Reflection.")), /*#__PURE__*/React.createElement("details", {
          style: {
            cursor: 'pointer'
          }
        }, /*#__PURE__*/React.createElement("summary", {
          style: {
            fontWeight: 'bold',
            marginBottom: '5px'
          }
        }, "How do I contact my coach?"), /*#__PURE__*/React.createElement("p", {
          style: {
            fontSize: '14px',
            opacity: 0.8,
            paddingLeft: '15px'
          }
        }, "Your coach's contact information is displayed in your profile. You can call or message them directly.")), /*#__PURE__*/React.createElement("details", {
          style: {
            cursor: 'pointer'
          }
        }, /*#__PURE__*/React.createElement("summary", {
          style: {
            fontWeight: 'bold',
            marginBottom: '5px'
          }
        }, "What if I miss a check-in?"), /*#__PURE__*/React.createElement("p", {
          style: {
            fontSize: '14px',
            opacity: 0.8,
            paddingLeft: '15px'
          }
        }, "Missing occasional check-ins is okay. Focus on building consistency over time. Your coach will be notified of patterns."))), /*#__PURE__*/React.createElement("button", {
          className: "btn-primary",
          style: {
            marginTop: '20px'
          },
          onClick: onClose
        }, "Close"));

      // FEEDBACK MODAL
      case 'feedback':
        return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h3", {
          style: {
            marginBottom: '20px'
          }
        }, "Send Feedback"), /*#__PURE__*/React.createElement("p", {
          style: {
            fontSize: '14px',
            opacity: 0.8,
            marginBottom: '20px'
          }
        }, "Your feedback helps us improve the recovery experience for everyone."), /*#__PURE__*/React.createElement("div", {
          className: "form-group"
        }, /*#__PURE__*/React.createElement("label", {
          className: "form-label"
        }, "Feedback Type"), /*#__PURE__*/React.createElement("select", {
          className: "form-select",
          value: formData.feedbackType || '',
          onChange: e => setFormData({
            ...formData,
            feedbackType: e.target.value
          })
        }, /*#__PURE__*/React.createElement("option", {
          value: ""
        }, "Select Type"), /*#__PURE__*/React.createElement("option", {
          value: "bug"
        }, "Bug Report"), /*#__PURE__*/React.createElement("option", {
          value: "feature"
        }, "Feature Request"), /*#__PURE__*/React.createElement("option", {
          value: "praise"
        }, "Positive Feedback"), /*#__PURE__*/React.createElement("option", {
          value: "concern"
        }, "Concern"), /*#__PURE__*/React.createElement("option", {
          value: "other"
        }, "Other"))), /*#__PURE__*/React.createElement("div", {
          className: "form-group"
        }, /*#__PURE__*/React.createElement("label", {
          className: "form-label"
        }, "Your Feedback"), /*#__PURE__*/React.createElement("textarea", {
          className: "textarea",
          placeholder: "Tell us what's on your mind...",
          value: formData.feedbackText || '',
          onChange: e => setFormData({
            ...formData,
            feedbackText: e.target.value
          }),
          style: {
            minHeight: '150px'
          }
        })), /*#__PURE__*/React.createElement("button", {
          className: "btn-primary",
          onClick: async () => {
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
          }
        }, "Send Feedback"));

      // EXPORT DATA MODAL
      case 'export':
        return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h3", {
          style: {
            marginBottom: '20px'
          }
        }, "Export Your Data"), /*#__PURE__*/React.createElement("p", {
          style: {
            fontSize: '14px',
            opacity: 0.8,
            marginBottom: '20px'
          }
        }, "Download all your recovery data in your preferred format."), /*#__PURE__*/React.createElement("div", {
          style: {
            display: 'flex',
            flexDirection: 'column',
            gap: '10px'
          }
        }, /*#__PURE__*/React.createElement("button", {
          className: "btn-primary",
          onClick: () => {
            triggerHaptic('light');
            handlers.exportDataAsJSON();
          },
          style: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }
        }, /*#__PURE__*/React.createElement("i", {
          "data-lucide": "download",
          style: {
            width: '18px',
            height: '18px'
          }
        }), "Export as JSON (Technical Format)"), /*#__PURE__*/React.createElement("button", {
          className: "btn-primary",
          onClick: () => {
            triggerHaptic('light');
            handlers.exportDataAsPDF();
          },
          style: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }
        }, /*#__PURE__*/React.createElement("i", {
          "data-lucide": "file-text",
          style: {
            width: '18px',
            height: '18px'
          }
        }), "Export as PDF (Report Format)")), /*#__PURE__*/React.createElement("small", {
          style: {
            display: 'block',
            marginTop: '20px',
            opacity: 0.6
          }
        }, "Your export will include all check-ins, goals, assignments, and progress data."));

      // DELETE ACCOUNT MODAL
      case 'deleteAccount':
        return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h3", {
          style: {
            marginBottom: '20px',
            color: '#ff4757'
          }
        }, "Delete Account"), /*#__PURE__*/React.createElement("div", {
          style: {
            background: 'rgba(255, 71, 87, 0.1)',
            border: '1px solid rgba(255, 71, 87, 0.3)',
            borderRadius: '10px',
            padding: '15px',
            marginBottom: '20px'
          }
        }, /*#__PURE__*/React.createElement("strong", {
          style: {
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }
        }, /*#__PURE__*/React.createElement("i", {
          "data-lucide": "alert-triangle",
          style: {
            width: '18px',
            height: '18px',
            color: '#ff4757'
          }
        }), "This action cannot be undone!"), /*#__PURE__*/React.createElement("p", {
          style: {
            marginTop: '10px',
            fontSize: '14px'
          }
        }, "Deleting your account will permanently remove:"), /*#__PURE__*/React.createElement("ul", {
          style: {
            fontSize: '14px',
            marginTop: '10px',
            paddingLeft: '20px'
          }
        }, /*#__PURE__*/React.createElement("li", null, "All your check-ins and progress data"), /*#__PURE__*/React.createElement("li", null, "Goals and assignments"), /*#__PURE__*/React.createElement("li", null, "Messages and community posts"), /*#__PURE__*/React.createElement("li", null, "Your profile and settings"))), /*#__PURE__*/React.createElement("div", {
          className: "form-group"
        }, /*#__PURE__*/React.createElement("label", {
          className: "form-label"
        }, "Type \"DELETE\" to confirm:"), /*#__PURE__*/React.createElement("input", {
          type: "text",
          className: "form-input",
          placeholder: "Type DELETE",
          value: formData.deleteConfirm || '',
          onChange: e => setFormData({
            ...formData,
            deleteConfirm: e.target.value
          })
        })), /*#__PURE__*/React.createElement("button", {
          className: "btn-danger",
          disabled: formData.deleteConfirm !== 'DELETE',
          onClick: async () => {
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
          }
        }, "Permanently Delete Account"), /*#__PURE__*/React.createElement("button", {
          style: {
            width: '100%',
            padding: '14px',
            background: 'transparent',
            border: '1px solid rgba(255,255,255,0.3)',
            borderRadius: '10px',
            color: 'white',
            cursor: 'pointer',
            marginTop: '10px'
          },
          onClick: onClose
        }, "Cancel"));

      // TERMS OF SERVICE MODAL
      case 'terms':
        return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h3", {
          style: {
            marginBottom: '20px'
          }
        }, "Terms of Service"), /*#__PURE__*/React.createElement("div", {
          style: {
            fontSize: '14px',
            lineHeight: '1.6',
            opacity: 0.9
          }
        }, /*#__PURE__*/React.createElement("h4", {
          style: {
            marginTop: '15px',
            marginBottom: '10px'
          }
        }, "1. Acceptance of Terms"), /*#__PURE__*/React.createElement("p", null, "By using GLRS Recovery Services, you agree to these terms."), /*#__PURE__*/React.createElement("h4", {
          style: {
            marginTop: '15px',
            marginBottom: '10px'
          }
        }, "2. Service Description"), /*#__PURE__*/React.createElement("p", null, "GLRS provides recovery coaching and support services. We are not a medical provider."), /*#__PURE__*/React.createElement("h4", {
          style: {
            marginTop: '15px',
            marginBottom: '10px'
          }
        }, "3. User Responsibilities"), /*#__PURE__*/React.createElement("p", null, "You are responsible for maintaining the confidentiality of your account."), /*#__PURE__*/React.createElement("h4", {
          style: {
            marginTop: '15px',
            marginBottom: '10px'
          }
        }, "4. Privacy"), /*#__PURE__*/React.createElement("p", null, "Your use of our services is also governed by our Privacy Policy."), /*#__PURE__*/React.createElement("h4", {
          style: {
            marginTop: '15px',
            marginBottom: '10px'
          }
        }, "5. Disclaimers"), /*#__PURE__*/React.createElement("p", null, "Our services are not a substitute for medical treatment or professional therapy.")), /*#__PURE__*/React.createElement("button", {
          className: "btn-primary",
          style: {
            marginTop: '20px'
          },
          onClick: onClose
        }, "I Understand"));

      // PRIVACY POLICY MODAL
      case 'privacy_policy':
        return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h3", {
          style: {
            marginBottom: '20px'
          }
        }, "Privacy Policy"), /*#__PURE__*/React.createElement("div", {
          style: {
            fontSize: '14px',
            lineHeight: '1.6',
            opacity: 0.9
          }
        }, /*#__PURE__*/React.createElement("h4", {
          style: {
            marginTop: '15px',
            marginBottom: '10px'
          }
        }, "Information We Collect"), /*#__PURE__*/React.createElement("p", null, "We collect information you provide directly, including recovery data and personal information."), /*#__PURE__*/React.createElement("h4", {
          style: {
            marginTop: '15px',
            marginBottom: '10px'
          }
        }, "How We Use Your Information"), /*#__PURE__*/React.createElement("p", null, "Your data is used to provide recovery support services and track your progress."), /*#__PURE__*/React.createElement("h4", {
          style: {
            marginTop: '15px',
            marginBottom: '10px'
          }
        }, "Data Protection"), /*#__PURE__*/React.createElement("p", null, "We implement appropriate security measures to protect your information."), /*#__PURE__*/React.createElement("h4", {
          style: {
            marginTop: '15px',
            marginBottom: '10px'
          }
        }, "Your Rights"), /*#__PURE__*/React.createElement("p", null, "You have the right to access, update, or delete your personal information.")), /*#__PURE__*/React.createElement("button", {
          className: "btn-primary",
          style: {
            marginTop: '20px'
          },
          onClick: onClose
        }, "Close"));

      // ABOUT MODAL
      case 'about':
        return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h3", {
          style: {
            marginBottom: '20px'
          }
        }, "About GLRS"), /*#__PURE__*/React.createElement("div", {
          style: {
            textAlign: 'center',
            marginBottom: '20px'
          }
        }, /*#__PURE__*/React.createElement("img", {
          src: "glrs-logo.png",
          alt: "GLRS Logo",
          style: {
            width: '80px',
            height: 'auto',
            objectFit: 'contain',
            margin: '0 auto'
          }
        })), /*#__PURE__*/React.createElement("div", {
          style: {
            fontSize: '14px',
            lineHeight: '1.6',
            opacity: 0.9
          }
        }, /*#__PURE__*/React.createElement("p", {
          style: {
            marginBottom: '15px'
          }
        }, /*#__PURE__*/React.createElement("strong", null, "Guiding Light Recovery Services")), /*#__PURE__*/React.createElement("p", {
          style: {
            marginBottom: '15px'
          }
        }, "Version 1.0.0"), /*#__PURE__*/React.createElement("p", {
          style: {
            marginBottom: '15px'
          }
        }, "GLRS Recovery Connect is a comprehensive recovery support platform designed to help individuals maintain their sobriety journey with daily check-ins, goal tracking, and coach support."), /*#__PURE__*/React.createElement("p", {
          style: {
            marginBottom: '15px'
          }
        }, "\xA9 2024 Guiding Light Recovery Services. All rights reserved.")), /*#__PURE__*/React.createElement("button", {
          className: "btn-primary",
          style: {
            marginTop: '20px'
          },
          onClick: onClose
        }, "Close"));

      // JourneyTab Modals
      case 'setGoal':
        {
          const modalTotalDays = data.calculateSobrietyDays(data.userData.sobrietyDate);
          const dailyCost = data.userData?.dailyCost || 20;
          return /*#__PURE__*/React.createElement("div", {
            style: {
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
            },
            onClick: onClose
          }, /*#__PURE__*/React.createElement("div", {
            style: {
              background: '#fff',
              borderRadius: '15px',
              maxWidth: '500px',
              width: '100%',
              maxHeight: '80vh',
              overflow: 'auto'
            },
            onClick: e => e.stopPropagation()
          }, /*#__PURE__*/React.createElement("div", {
            style: {
              padding: '20px',
              borderBottom: '2px solid #058585',
              background: 'linear-gradient(135deg, #058585 0%, #069494 100%)',
              color: '#fff',
              borderRadius: '15px 15px 0 0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }
          }, /*#__PURE__*/React.createElement("h3", {
            style: {
              margin: 0,
              fontSize: '20px'
            }
          }, "Choose Your Savings Goal"), /*#__PURE__*/React.createElement("button", {
            onClick: onClose,
            style: {
              background: 'none',
              border: 'none',
              color: '#fff',
              fontSize: '24px',
              cursor: 'pointer',
              padding: '0',
              lineHeight: '1'
            }
          }, "\xD7")), /*#__PURE__*/React.createElement("div", {
            style: {
              padding: '20px'
            }
          }, /*#__PURE__*/React.createElement("p", {
            style: {
              color: '#666',
              fontSize: '14px',
              marginBottom: '20px'
            }
          }, "Select a goal to track your progress. Your savings will be measured against this goal."), /*#__PURE__*/React.createElement("div", {
            style: {
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }
          }, data.savingsGoals.map((goal, index) => {
            const totalSaved = modalTotalDays * dailyCost;
            const progress = Math.min(100, totalSaved / goal.amount * 100);
            const achieved = totalSaved >= goal.amount;
            return /*#__PURE__*/React.createElement("div", {
              key: index,
              onClick: () => {
                handlers.setActiveSavingsGoal(goal);
                onClose();
              },
              style: {
                padding: '16px',
                border: data.activeSavingsGoal?.name === goal.name ? '2px solid #058585' : '1px solid #ddd',
                borderRadius: '10px',
                cursor: 'pointer',
                background: achieved ? 'linear-gradient(135deg, rgba(0, 168, 107, 0.1) 0%, rgba(0, 168, 107, 0.05) 100%)' : '#fff',
                transition: 'all 0.2s ease'
              },
              onMouseEnter: e => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
              },
              onMouseLeave: e => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }
            }, /*#__PURE__*/React.createElement("div", {
              style: {
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '12px'
              }
            }, /*#__PURE__*/React.createElement("i", {
              "data-lucide": goal.icon,
              style: {
                width: '24px',
                height: '24px',
                strokeWidth: 2,
                color: '#058585'
              }
            }), /*#__PURE__*/React.createElement("div", {
              style: {
                flex: 1
              }
            }, /*#__PURE__*/React.createElement("div", {
              style: {
                fontSize: '16px',
                fontWeight: '600',
                color: '#333',
                marginBottom: '2px'
              }
            }, goal.name), /*#__PURE__*/React.createElement("div", {
              style: {
                fontSize: '14px',
                color: '#666'
              }
            }, "$", goal.amount.toLocaleString())), achieved && /*#__PURE__*/React.createElement("div", {
              style: {
                background: '#00A86B',
                color: '#fff',
                padding: '4px 12px',
                borderRadius: '20px',
                fontSize: '11px',
                fontWeight: '600'
              }
            }, "ACHIEVED")), /*#__PURE__*/React.createElement("div", {
              style: {
                width: '100%',
                height: '6px',
                background: 'rgba(0,0,0,0.1)',
                borderRadius: '3px',
                overflow: 'hidden'
              }
            }, /*#__PURE__*/React.createElement("div", {
              style: {
                width: `${progress}%`,
                height: '100%',
                background: achieved ? '#00A86B' : '#058585',
                borderRadius: '3px',
                transition: 'width 0.3s ease'
              }
            })), /*#__PURE__*/React.createElement("div", {
              style: {
                fontSize: '12px',
                color: '#666',
                marginTop: '6px'
              }
            }, Math.round(progress), "% progress"));
          })))));
        }
      case 'jar':
        {
          const modalTotalDays = data.calculateSobrietyDays(data.userData.sobrietyDate);
          const dailyCost = data.userData?.dailyCost || 20;
          return /*#__PURE__*/React.createElement("div", {
            style: {
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
            },
            onClick: onClose
          }, /*#__PURE__*/React.createElement("div", {
            style: {
              background: '#fff',
              borderRadius: '15px',
              maxWidth: '500px',
              width: '100%',
              maxHeight: '80vh',
              overflow: 'auto'
            },
            onClick: e => e.stopPropagation()
          }, /*#__PURE__*/React.createElement("div", {
            style: {
              padding: '20px',
              borderBottom: '2px solid #FFD700',
              background: 'linear-gradient(135deg, rgba(255,215,0,0.2) 0%, rgba(255,215,0,0.1) 100%)',
              color: '#333',
              borderRadius: '15px 15px 0 0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }
          }, /*#__PURE__*/React.createElement("h3", {
            style: {
              margin: 0,
              fontSize: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }
          }, /*#__PURE__*/React.createElement("i", {
            "data-lucide": "piggy-bank",
            style: {
              width: '24px',
              height: '24px',
              strokeWidth: 2
            }
          }), "Your Savings Jar"), /*#__PURE__*/React.createElement("button", {
            onClick: onClose,
            style: {
              background: 'none',
              border: 'none',
              color: '#333',
              fontSize: '24px',
              cursor: 'pointer',
              padding: '0',
              lineHeight: '1'
            }
          }, "\xD7")), /*#__PURE__*/React.createElement("div", {
            style: {
              padding: '24px',
              textAlign: 'center'
            }
          }, /*#__PURE__*/React.createElement("div", {
            style: {
              marginBottom: '30px'
            }
          }, /*#__PURE__*/React.createElement("div", {
            style: {
              fontSize: '14px',
              color: '#666',
              marginBottom: '16px'
            }
          }, "Based on your sobriety, you would have spent:"), /*#__PURE__*/React.createElement("div", {
            style: {
              fontSize: '36px',
              fontWeight: '700',
              color: '#058585',
              marginBottom: '8px'
            }
          }, "$", (modalTotalDays * dailyCost).toLocaleString()), /*#__PURE__*/React.createElement("div", {
            style: {
              fontSize: '13px',
              color: '#999'
            }
          }, "Virtual Savings ($", dailyCost, "/day \xD7 ", modalTotalDays, " days)")), /*#__PURE__*/React.createElement("div", {
            style: {
              height: '1px',
              background: 'linear-gradient(90deg, transparent 0%, #ddd 50%, transparent 100%)',
              marginBottom: '20px'
            }
          }), /*#__PURE__*/React.createElement("div", {
            style: {
              marginBottom: '24px'
            }
          }, /*#__PURE__*/React.createElement("div", {
            style: {
              fontSize: '14px',
              color: '#666',
              marginBottom: '8px'
            }
          }, "Money you've actually saved:"), /*#__PURE__*/React.createElement("div", {
            style: {
              fontSize: '28px',
              fontWeight: '700',
              color: '#00A86B',
              marginBottom: '8px'
            }
          }, "$", data.actualMoneySaved.toLocaleString()), /*#__PURE__*/React.createElement("button", {
            onClick: () => {
              handlers.setTempAmount(data.actualMoneySaved.toString());
              handlers.setShowModal('updateAmount');
            },
            style: {
              background: 'linear-gradient(135deg, #058585 0%, #069494 100%)',
              color: '#fff',
              padding: '8px 16px',
              borderRadius: '6px',
              border: 'none',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer',
              marginTop: '8px'
            }
          }, "Update Amount")), /*#__PURE__*/React.createElement("div", {
            style: {
              background: '#f8f9fa',
              borderRadius: '10px',
              padding: '16px',
              textAlign: 'left'
            }
          }, /*#__PURE__*/React.createElement("div", {
            style: {
              fontSize: '13px',
              fontWeight: '600',
              color: '#333',
              marginBottom: '12px'
            }
          }, "Savings Breakdown"), /*#__PURE__*/React.createElement("div", {
            style: {
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '8px'
            }
          }, /*#__PURE__*/React.createElement("span", {
            style: {
              fontSize: '13px',
              color: '#666'
            }
          }, "Days Sober:"), /*#__PURE__*/React.createElement("span", {
            style: {
              fontSize: '13px',
              fontWeight: '600',
              color: '#333'
            }
          }, modalTotalDays)), /*#__PURE__*/React.createElement("div", {
            style: {
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '8px'
            }
          }, /*#__PURE__*/React.createElement("span", {
            style: {
              fontSize: '13px',
              color: '#666'
            }
          }, "Daily Cost:"), /*#__PURE__*/React.createElement("span", {
            style: {
              fontSize: '13px',
              fontWeight: '600',
              color: '#333'
            }
          }, "$", dailyCost)), /*#__PURE__*/React.createElement("div", {
            style: {
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '8px'
            }
          }, /*#__PURE__*/React.createElement("span", {
            style: {
              fontSize: '13px',
              color: '#666'
            }
          }, "Total Virtual:"), /*#__PURE__*/React.createElement("span", {
            style: {
              fontSize: '13px',
              fontWeight: '600',
              color: '#058585'
            }
          }, "$", (modalTotalDays * dailyCost).toLocaleString())), /*#__PURE__*/React.createElement("div", {
            style: {
              height: '1px',
              background: '#ddd',
              margin: '8px 0'
            }
          }), /*#__PURE__*/React.createElement("div", {
            style: {
              display: 'flex',
              justifyContent: 'space-between'
            }
          }, /*#__PURE__*/React.createElement("span", {
            style: {
              fontSize: '13px',
              color: '#666'
            }
          }, "Actual Saved:"), /*#__PURE__*/React.createElement("span", {
            style: {
              fontSize: '13px',
              fontWeight: '600',
              color: '#00A86B'
            }
          }, "$", data.actualMoneySaved.toLocaleString()))), /*#__PURE__*/React.createElement("div", {
            style: {
              marginTop: '20px',
              padding: '12px',
              background: '#fff3cd',
              borderRadius: '8px',
              border: '1px solid #ffc107'
            }
          }, /*#__PURE__*/React.createElement("p", {
            style: {
              margin: 0,
              fontSize: '12px',
              color: '#856404'
            }
          }, "\uD83D\uDCA1 Tip: Keep your actual savings separate to build your emergency fund!")))));
        }
      case 'addCountdown':
        return /*#__PURE__*/React.createElement("div", {
          style: {
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
          },
          onClick: onClose
        }, /*#__PURE__*/React.createElement("div", {
          style: {
            background: '#fff',
            borderRadius: '15px',
            maxWidth: '500px',
            width: '100%'
          },
          onClick: e => e.stopPropagation()
        }, /*#__PURE__*/React.createElement("div", {
          style: {
            padding: '20px',
            borderBottom: '2px solid #058585',
            background: 'linear-gradient(135deg, #058585 0%, #069494 100%)',
            color: '#fff',
            borderRadius: '15px 15px 0 0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }
        }, /*#__PURE__*/React.createElement("h3", {
          style: {
            margin: 0,
            fontSize: '20px'
          }
        }, "Add Custom Goal"), /*#__PURE__*/React.createElement("button", {
          onClick: onClose,
          style: {
            background: 'none',
            border: 'none',
            color: '#fff',
            fontSize: '24px',
            cursor: 'pointer',
            padding: '0',
            lineHeight: '1'
          }
        }, "\xD7")), /*#__PURE__*/React.createElement("div", {
          style: {
            padding: '24px'
          }
        }, /*#__PURE__*/React.createElement("div", {
          style: {
            marginBottom: '16px'
          }
        }, /*#__PURE__*/React.createElement("label", {
          style: {
            display: 'block',
            marginBottom: '6px',
            fontSize: '14px',
            fontWeight: '600',
            color: '#333'
          }
        }, "Goal Name"), /*#__PURE__*/React.createElement("input", {
          type: "text",
          id: "customGoalName",
          placeholder: "e.g., New Laptop, Vacation, Car Repair",
          style: {
            width: '100%',
            padding: '12px',
            borderRadius: '8px',
            border: '1px solid #ddd',
            fontSize: '14px',
            boxSizing: 'border-box'
          }
        })), /*#__PURE__*/React.createElement("div", {
          style: {
            marginBottom: '16px'
          }
        }, /*#__PURE__*/React.createElement("label", {
          style: {
            display: 'block',
            marginBottom: '6px',
            fontSize: '14px',
            fontWeight: '600',
            color: '#333'
          }
        }, "Target Amount ($)"), /*#__PURE__*/React.createElement("input", {
          type: "number",
          id: "customGoalAmount",
          placeholder: "e.g., 1500",
          min: "1",
          style: {
            width: '100%',
            padding: '12px',
            borderRadius: '8px',
            border: '1px solid #ddd',
            fontSize: '14px',
            boxSizing: 'border-box'
          }
        })), /*#__PURE__*/React.createElement("div", {
          style: {
            marginBottom: '24px'
          }
        }, /*#__PURE__*/React.createElement("label", {
          style: {
            display: 'block',
            marginBottom: '6px',
            fontSize: '14px',
            fontWeight: '600',
            color: '#333'
          }
        }, "Choose Icon"), /*#__PURE__*/React.createElement("div", {
          style: {
            display: 'grid',
            gridTemplateColumns: 'repeat(6, 1fr)',
            gap: '8px'
          }
        }, ['dollar-sign', 'shopping-cart', 'home', 'car', 'plane', 'heart', 'gift', 'trophy', 'star', 'zap', 'music', 'book'].map(iconName => /*#__PURE__*/React.createElement("button", {
          key: iconName,
          onClick: e => {
            document.querySelectorAll('.custom-goal-icon-btn').forEach(btn => {
              btn.style.border = '2px solid #ddd';
              btn.style.background = '#fff';
            });
            e.currentTarget.style.border = '2px solid #058585';
            e.currentTarget.style.background = 'rgba(5, 133, 133, 0.1)';
            e.currentTarget.dataset.selected = 'true';
          },
          className: "custom-goal-icon-btn",
          "data-icon": iconName,
          style: {
            padding: '12px',
            border: '2px solid #ddd',
            borderRadius: '8px',
            background: '#fff',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s ease'
          }
        }, /*#__PURE__*/React.createElement("i", {
          "data-lucide": iconName,
          style: {
            width: '20px',
            height: '20px',
            strokeWidth: 2,
            color: '#058585'
          }
        }))))), /*#__PURE__*/React.createElement("button", {
          onClick: () => {
            const name = document.getElementById('customGoalName').value;
            const amount = parseFloat(document.getElementById('customGoalAmount').value);
            const selectedIcon = document.querySelector('.custom-goal-icon-btn[data-selected="true"]');
            const icon = selectedIcon ? selectedIcon.dataset.icon : 'target';
            if (!name || !amount || amount <= 0) {
              alert('Please enter a valid name and amount');
              return;
            }
            const newGoal = {
              name,
              amount,
              icon,
              custom: true
            };
            handlers.setCustomGoalItems([...data.customGoalItems, newGoal]);
            onClose();
            document.getElementById('customGoalName').value = '';
            document.getElementById('customGoalAmount').value = '';
            document.querySelectorAll('.custom-goal-icon-btn').forEach(btn => {
              btn.style.border = '2px solid #ddd';
              btn.style.background = '#fff';
              btn.dataset.selected = 'false';
            });
          },
          style: {
            width: '100%',
            background: 'linear-gradient(135deg, #058585 0%, #069494 100%)',
            color: '#fff',
            padding: '14px',
            borderRadius: '8px',
            border: 'none',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer'
          }
        }, "Add Goal"))));
      case 'updateAmount':
        return /*#__PURE__*/React.createElement("div", {
          style: {
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10001,
            padding: '20px'
          },
          onClick: onClose
        }, /*#__PURE__*/React.createElement("div", {
          style: {
            background: '#fff',
            borderRadius: '15px',
            maxWidth: '400px',
            width: '100%'
          },
          onClick: e => e.stopPropagation()
        }, /*#__PURE__*/React.createElement("div", {
          style: {
            padding: '20px',
            borderBottom: '2px solid #058585',
            background: 'linear-gradient(135deg, #058585 0%, #069494 100%)',
            color: '#fff',
            borderRadius: '15px 15px 0 0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }
        }, /*#__PURE__*/React.createElement("h3", {
          style: {
            margin: 0,
            fontSize: '20px'
          }
        }, "Update Savings Amount"), /*#__PURE__*/React.createElement("button", {
          onClick: onClose,
          style: {
            background: 'none',
            border: 'none',
            color: '#fff',
            fontSize: '24px',
            cursor: 'pointer',
            padding: '0',
            lineHeight: '1'
          }
        }, "\xD7")), /*#__PURE__*/React.createElement("div", {
          style: {
            padding: '24px'
          }
        }, /*#__PURE__*/React.createElement("p", {
          style: {
            color: '#666',
            fontSize: '14px',
            marginBottom: '16px'
          }
        }, "Enter the amount you've actually saved so far."), /*#__PURE__*/React.createElement("div", {
          style: {
            marginBottom: '20px'
          }
        }, /*#__PURE__*/React.createElement("label", {
          style: {
            display: 'block',
            marginBottom: '6px',
            fontSize: '14px',
            fontWeight: '600',
            color: '#333'
          }
        }, "Amount ($)"), /*#__PURE__*/React.createElement("input", {
          type: "number",
          value: data.tempAmount,
          onChange: e => handlers.setTempAmount(e.target.value),
          min: "0",
          step: "0.01",
          placeholder: "0.00",
          autoFocus: true,
          style: {
            width: '100%',
            padding: '12px',
            borderRadius: '8px',
            border: '2px solid #058585',
            fontSize: '16px',
            boxSizing: 'border-box'
          },
          onKeyPress: e => {
            if (e.key === 'Enter') {
              const amount = parseFloat(data.tempAmount);
              if (!isNaN(amount) && amount >= 0) {
                handlers.setActualMoneySaved(amount);
                onClose();
              } else {
                alert('Please enter a valid amount');
              }
            }
          }
        })), /*#__PURE__*/React.createElement("div", {
          style: {
            display: 'flex',
            gap: '10px'
          }
        }, /*#__PURE__*/React.createElement("button", {
          onClick: onClose,
          style: {
            flex: 1,
            background: '#f0f0f0',
            color: '#666',
            padding: '12px',
            borderRadius: '8px',
            border: 'none',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer'
          }
        }, "Cancel"), /*#__PURE__*/React.createElement("button", {
          onClick: () => {
            const amount = parseFloat(data.tempAmount);
            if (!isNaN(amount) && amount >= 0) {
              handlers.setActualMoneySaved(amount);
              onClose();
            } else {
              alert('Please enter a valid amount');
            }
          },
          style: {
            flex: 1,
            background: 'linear-gradient(135deg, #058585 0%, #069494 100%)',
            color: '#fff',
            padding: '12px',
            borderRadius: '8px',
            border: 'none',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer'
          }
        }, "Update")))));

      // TasksTab Modals
      case 'moodPattern':
        return /*#__PURE__*/React.createElement("div", {
          style: {
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
          },
          onClick: onClose
        }, /*#__PURE__*/React.createElement("div", {
          style: {
            background: '#FFFFFF',
            borderRadius: '15px',
            maxWidth: '500px',
            width: '100%',
            maxHeight: '80vh',
            overflow: 'auto'
          },
          onClick: e => e.stopPropagation()
        }, /*#__PURE__*/React.createElement("div", {
          style: {
            padding: '20px',
            borderBottom: '1px solid #E5E5E5'
          }
        }, /*#__PURE__*/React.createElement("div", {
          style: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }
        }, /*#__PURE__*/React.createElement("h3", {
          style: {
            margin: 0,
            fontSize: '18px',
            fontWeight: '400',
            color: '#000000'
          }
        }, "Mood Improvement Tips"), /*#__PURE__*/React.createElement("button", {
          onClick: onClose,
          style: {
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '4px'
          }
        }, /*#__PURE__*/React.createElement("i", {
          "data-lucide": "x",
          style: {
            width: '20px',
            height: '20px',
            color: '#666666'
          }
        })))), /*#__PURE__*/React.createElement("div", {
          style: {
            padding: '20px'
          }
        }, /*#__PURE__*/React.createElement("h4", {
          style: {
            fontSize: '16px',
            fontWeight: '400',
            color: '#000000',
            marginBottom: '12px'
          }
        }, "Recommended Actions"), /*#__PURE__*/React.createElement("div", {
          style: {
            marginBottom: '20px'
          }
        }, ['Practice 5 minutes of deep breathing when you wake up', 'Get 15-30 minutes of sunlight exposure daily', 'Maintain a consistent sleep schedule', 'Limit caffeine intake after 2pm', 'Exercise for at least 20 minutes per day', 'Connect with a friend or family member', 'Write down three things you are grateful for'].map((tip, index) => /*#__PURE__*/React.createElement("div", {
          key: index,
          style: {
            background: '#F5F5F5',
            borderRadius: '8px',
            padding: '12px',
            marginBottom: '8px',
            display: 'flex',
            gap: '12px',
            alignItems: 'flex-start'
          }
        }, /*#__PURE__*/React.createElement("i", {
          "data-lucide": "check-circle",
          style: {
            width: '20px',
            height: '20px',
            color: '#058585',
            flexShrink: 0,
            marginTop: '2px'
          }
        }), /*#__PURE__*/React.createElement("div", {
          style: {
            fontSize: '14px',
            fontWeight: '400',
            color: '#000000',
            lineHeight: '1.5'
          }
        }, tip)))), /*#__PURE__*/React.createElement("button", {
          onClick: () => {
            data.triggerHaptic('light');
            handlers.setCurrentView('guides');
            onClose();
          },
          style: {
            width: '100%',
            height: '48px',
            background: '#058585',
            border: 'none',
            borderRadius: '8px',
            color: '#FFFFFF',
            fontSize: '14px',
            fontWeight: '400',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }
        }, "View Related Resources"))));
      case 'cravingPattern':
        return /*#__PURE__*/React.createElement("div", {
          style: {
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
          },
          onClick: onClose
        }, /*#__PURE__*/React.createElement("div", {
          style: {
            background: '#FFFFFF',
            borderRadius: '15px',
            maxWidth: '500px',
            width: '100%',
            maxHeight: '80vh',
            overflow: 'auto'
          },
          onClick: e => e.stopPropagation()
        }, /*#__PURE__*/React.createElement("div", {
          style: {
            padding: '20px',
            borderBottom: '1px solid #E5E5E5'
          }
        }, /*#__PURE__*/React.createElement("div", {
          style: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }
        }, /*#__PURE__*/React.createElement("h3", {
          style: {
            margin: 0,
            fontSize: '18px',
            fontWeight: '400',
            color: '#000000'
          }
        }, "Craving Management Tips"), /*#__PURE__*/React.createElement("button", {
          onClick: onClose,
          style: {
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '4px'
          }
        }, /*#__PURE__*/React.createElement("i", {
          "data-lucide": "x",
          style: {
            width: '20px',
            height: '20px',
            color: '#666666'
          }
        })))), /*#__PURE__*/React.createElement("div", {
          style: {
            padding: '20px'
          }
        }, /*#__PURE__*/React.createElement("h4", {
          style: {
            fontSize: '16px',
            fontWeight: '400',
            color: '#000000',
            marginBottom: '12px'
          }
        }, "Recommended Actions"), /*#__PURE__*/React.createElement("div", {
          style: {
            marginBottom: '20px'
          }
        }, ['Use the 5-4-3-2-1 grounding technique when cravings hit', 'Call your sponsor or accountability partner immediately', 'Remove yourself from triggering environments', 'Engage in physical activity to redirect energy', 'Practice HALT: Check if you are Hungry, Angry, Lonely, or Tired', 'Keep a craving journal to identify patterns and triggers'].map((tip, index) => /*#__PURE__*/React.createElement("div", {
          key: index,
          style: {
            background: '#F5F5F5',
            borderRadius: '8px',
            padding: '12px',
            marginBottom: '8px',
            display: 'flex',
            gap: '12px',
            alignItems: 'flex-start'
          }
        }, /*#__PURE__*/React.createElement("i", {
          "data-lucide": "check-circle",
          style: {
            width: '20px',
            height: '20px',
            color: '#058585',
            flexShrink: 0,
            marginTop: '2px'
          }
        }), /*#__PURE__*/React.createElement("div", {
          style: {
            fontSize: '14px',
            fontWeight: '400',
            color: '#000000',
            lineHeight: '1.5'
          }
        }, tip)))), /*#__PURE__*/React.createElement("button", {
          onClick: () => {
            data.triggerHaptic('light');
            handlers.setCurrentView('guides');
            onClose();
          },
          style: {
            width: '100%',
            height: '48px',
            background: '#058585',
            border: 'none',
            borderRadius: '8px',
            color: '#FFFFFF',
            fontSize: '14px',
            fontWeight: '400',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }
        }, "View Related Resources"))));
      case 'anxietyPattern':
        return /*#__PURE__*/React.createElement("div", {
          style: {
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
          },
          onClick: onClose
        }, /*#__PURE__*/React.createElement("div", {
          style: {
            background: '#FFFFFF',
            borderRadius: '15px',
            maxWidth: '500px',
            width: '100%',
            maxHeight: '80vh',
            overflow: 'auto'
          },
          onClick: e => e.stopPropagation()
        }, /*#__PURE__*/React.createElement("div", {
          style: {
            padding: '20px',
            borderBottom: '1px solid #E5E5E5'
          }
        }, /*#__PURE__*/React.createElement("div", {
          style: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }
        }, /*#__PURE__*/React.createElement("h3", {
          style: {
            margin: 0,
            fontSize: '18px',
            fontWeight: '400',
            color: '#000000'
          }
        }, "Anxiety Management Tips"), /*#__PURE__*/React.createElement("button", {
          onClick: onClose,
          style: {
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '4px'
          }
        }, /*#__PURE__*/React.createElement("i", {
          "data-lucide": "x",
          style: {
            width: '20px',
            height: '20px',
            color: '#666666'
          }
        })))), /*#__PURE__*/React.createElement("div", {
          style: {
            padding: '20px'
          }
        }, /*#__PURE__*/React.createElement("h4", {
          style: {
            fontSize: '16px',
            fontWeight: '400',
            color: '#000000',
            marginBottom: '12px'
          }
        }, "Recommended Actions"), /*#__PURE__*/React.createElement("div", {
          style: {
            marginBottom: '20px'
          }
        }, ['Practice 4-7-8 breathing: Inhale 4 counts, hold 7, exhale 8', 'Use progressive muscle relaxation techniques', 'Challenge negative thoughts with evidence-based thinking', 'Limit caffeine and sugar intake', 'Establish a calming bedtime routine', 'Practice mindfulness meditation for 10 minutes daily'].map((tip, index) => /*#__PURE__*/React.createElement("div", {
          key: index,
          style: {
            background: '#F5F5F5',
            borderRadius: '8px',
            padding: '12px',
            marginBottom: '8px',
            display: 'flex',
            gap: '12px',
            alignItems: 'flex-start'
          }
        }, /*#__PURE__*/React.createElement("i", {
          "data-lucide": "check-circle",
          style: {
            width: '20px',
            height: '20px',
            color: '#058585',
            flexShrink: 0,
            marginTop: '2px'
          }
        }), /*#__PURE__*/React.createElement("div", {
          style: {
            fontSize: '14px',
            fontWeight: '400',
            color: '#000000',
            lineHeight: '1.5'
          }
        }, tip)))), /*#__PURE__*/React.createElement("button", {
          onClick: () => {
            data.triggerHaptic('light');
            handlers.setCurrentView('guides');
            onClose();
          },
          style: {
            width: '100%',
            height: '48px',
            background: '#058585',
            border: 'none',
            borderRadius: '8px',
            color: '#FFFFFF',
            fontSize: '14px',
            fontWeight: '400',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }
        }, "View Related Resources"))));
      case 'sleepPattern':
        return /*#__PURE__*/React.createElement("div", {
          style: {
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
          },
          onClick: onClose
        }, /*#__PURE__*/React.createElement("div", {
          style: {
            background: '#FFFFFF',
            borderRadius: '15px',
            maxWidth: '500px',
            width: '100%',
            maxHeight: '80vh',
            overflow: 'auto'
          },
          onClick: e => e.stopPropagation()
        }, /*#__PURE__*/React.createElement("div", {
          style: {
            padding: '20px',
            borderBottom: '1px solid #E5E5E5'
          }
        }, /*#__PURE__*/React.createElement("div", {
          style: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }
        }, /*#__PURE__*/React.createElement("h3", {
          style: {
            margin: 0,
            fontSize: '18px',
            fontWeight: '400',
            color: '#000000'
          }
        }, "Sleep Improvement Tips"), /*#__PURE__*/React.createElement("button", {
          onClick: onClose,
          style: {
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '4px'
          }
        }, /*#__PURE__*/React.createElement("i", {
          "data-lucide": "x",
          style: {
            width: '20px',
            height: '20px',
            color: '#666666'
          }
        })))), /*#__PURE__*/React.createElement("div", {
          style: {
            padding: '20px'
          }
        }, /*#__PURE__*/React.createElement("h4", {
          style: {
            fontSize: '16px',
            fontWeight: '400',
            color: '#000000',
            marginBottom: '12px'
          }
        }, "Recommended Actions"), /*#__PURE__*/React.createElement("div", {
          style: {
            marginBottom: '20px'
          }
        }, ['Maintain consistent sleep and wake times, even on weekends', 'Create a relaxing bedtime routine 30-60 minutes before sleep', 'Keep your bedroom cool, dark, and quiet', 'Avoid screens at least 1 hour before bed', 'Limit naps to 20-30 minutes before 3pm', 'Avoid large meals, caffeine, and alcohol before bedtime'].map((tip, index) => /*#__PURE__*/React.createElement("div", {
          key: index,
          style: {
            background: '#F5F5F5',
            borderRadius: '8px',
            padding: '12px',
            marginBottom: '8px',
            display: 'flex',
            gap: '12px',
            alignItems: 'flex-start'
          }
        }, /*#__PURE__*/React.createElement("i", {
          "data-lucide": "check-circle",
          style: {
            width: '20px',
            height: '20px',
            color: '#058585',
            flexShrink: 0,
            marginTop: '2px'
          }
        }), /*#__PURE__*/React.createElement("div", {
          style: {
            fontSize: '14px',
            fontWeight: '400',
            color: '#000000',
            lineHeight: '1.5'
          }
        }, tip)))), /*#__PURE__*/React.createElement("button", {
          onClick: () => {
            data.triggerHaptic('light');
            handlers.setCurrentView('guides');
            onClose();
          },
          style: {
            width: '100%',
            height: '48px',
            background: '#058585',
            border: 'none',
            borderRadius: '8px',
            color: '#FFFFFF',
            fontSize: '14px',
            fontWeight: '400',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }
        }, "View Related Resources"))));
      case 'tips':
        return /*#__PURE__*/React.createElement("div", {
          style: {
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
          },
          onClick: onClose
        }, /*#__PURE__*/React.createElement("div", {
          style: {
            background: '#FFFFFF',
            borderRadius: '15px',
            maxWidth: '500px',
            width: '100%',
            maxHeight: '80vh',
            overflow: 'auto'
          },
          onClick: e => e.stopPropagation()
        }, /*#__PURE__*/React.createElement("div", {
          style: {
            padding: '20px',
            borderBottom: '1px solid #E5E5E5'
          }
        }, /*#__PURE__*/React.createElement("div", {
          style: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }
        }, /*#__PURE__*/React.createElement("h3", {
          style: {
            margin: 0,
            fontSize: '18px',
            fontWeight: '400',
            color: '#000000'
          }
        }, "Pattern Insights"), /*#__PURE__*/React.createElement("button", {
          onClick: onClose,
          style: {
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '4px'
          }
        }, /*#__PURE__*/React.createElement("i", {
          "data-lucide": "x",
          style: {
            width: '20px',
            height: '20px',
            color: '#666666'
          }
        })))), /*#__PURE__*/React.createElement("div", {
          style: {
            padding: '20px'
          }
        }, /*#__PURE__*/React.createElement("div", {
          style: {
            background: '#FFF8E1',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '20px',
            border: '1px solid #FFD54F'
          }
        }, /*#__PURE__*/React.createElement("div", {
          style: {
            fontSize: '16px',
            fontWeight: '400',
            color: '#000000',
            marginBottom: '8px'
          }
        }, data.patternDetection.message), data.patternDetection.day && /*#__PURE__*/React.createElement("div", {
          style: {
            fontSize: '14px',
            fontWeight: '400',
            color: '#666666'
          }
        }, "Day: ", data.patternDetection.day, " | Value: ", data.patternDetection.value)), /*#__PURE__*/React.createElement("h4", {
          style: {
            fontSize: '16px',
            fontWeight: '400',
            color: '#000000',
            marginBottom: '12px'
          }
        }, "Recommended Actions"), /*#__PURE__*/React.createElement("div", {
          style: {
            marginBottom: '20px'
          }
        }, data.patternDetection.tips.map((tip, index) => /*#__PURE__*/React.createElement("div", {
          key: index,
          style: {
            background: '#F5F5F5',
            borderRadius: '8px',
            padding: '12px',
            marginBottom: '8px',
            display: 'flex',
            gap: '12px'
          }
        }, /*#__PURE__*/React.createElement("div", {
          style: {
            width: '24px',
            height: '24px',
            borderRadius: '50%',
            background: '#058585',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '12px',
            fontWeight: 'bold',
            flexShrink: 0
          }
        }, index + 1), /*#__PURE__*/React.createElement("div", {
          style: {
            fontSize: '14px',
            fontWeight: '400',
            color: '#000000',
            lineHeight: '1.5'
          }
        }, tip)))), /*#__PURE__*/React.createElement("button", {
          onClick: () => {
            data.triggerHaptic('light');
            handlers.setCurrentView('guides');
            onClose();
          },
          style: {
            width: '100%',
            height: '48px',
            background: '#058585',
            border: 'none',
            borderRadius: '8px',
            color: '#FFFFFF',
            fontSize: '14px',
            fontWeight: '400',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }
        }, "View Related Guides"))));
      case 'copingTechnique':
        {
          const dayOfMonth = new Date().getDate();
          const technique = data.copingTechniques.find(t => t.day === dayOfMonth) || data.copingTechniques[0];
          return /*#__PURE__*/React.createElement("div", {
            style: {
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
            },
            onClick: onClose
          }, /*#__PURE__*/React.createElement("div", {
            style: {
              background: '#FFFFFF',
              borderRadius: '15px',
              maxWidth: '500px',
              width: '100%',
              maxHeight: '80vh',
              overflow: 'auto'
            },
            onClick: e => e.stopPropagation()
          }, /*#__PURE__*/React.createElement("div", {
            style: {
              padding: '20px',
              borderBottom: '1px solid #E5E5E5'
            }
          }, /*#__PURE__*/React.createElement("div", {
            style: {
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }
          }, /*#__PURE__*/React.createElement("div", {
            style: {
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }
          }, /*#__PURE__*/React.createElement("i", {
            "data-lucide": technique.icon,
            style: {
              width: '24px',
              height: '24px',
              color: '#058585'
            }
          }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h3", {
            style: {
              margin: 0,
              fontSize: '18px',
              fontWeight: '400',
              color: '#000000'
            }
          }, technique.title), /*#__PURE__*/React.createElement("div", {
            style: {
              fontSize: '12px',
              fontWeight: '400',
              color: '#666666',
              marginTop: '4px'
            }
          }, technique.category, " \u2022 Day ", technique.day))), /*#__PURE__*/React.createElement("button", {
            onClick: onClose,
            style: {
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '4px'
            }
          }, /*#__PURE__*/React.createElement("i", {
            "data-lucide": "x",
            style: {
              width: '20px',
              height: '20px',
              color: '#666666'
            }
          })))), /*#__PURE__*/React.createElement("div", {
            style: {
              padding: '20px'
            }
          }, /*#__PURE__*/React.createElement("div", {
            style: {
              textAlign: 'center',
              padding: '20px',
              marginBottom: '20px',
              background: technique.category === 'Breathing' ? 'linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 100%)' : technique.category === 'Mindfulness' ? 'linear-gradient(135deg, #F3E5F5 0%, #E1BEE7 100%)' : technique.category === 'Physical' ? 'linear-gradient(135deg, #E8F5E9 0%, #C8E6C9 100%)' : technique.category === 'Cognitive' ? 'linear-gradient(135deg, #FFF9C4 0%, #FFF59D 100%)' : 'linear-gradient(135deg, #FFE0B2 0%, #FFCC80 100%)',
              borderRadius: '12px'
            }
          }, /*#__PURE__*/React.createElement("i", {
            "data-lucide": technique.icon,
            style: {
              width: '64px',
              height: '64px',
              color: technique.category === 'Breathing' ? '#1976D2' : technique.category === 'Mindfulness' ? '#7B1FA2' : technique.category === 'Physical' ? '#388E3C' : technique.category === 'Cognitive' ? '#F57F17' : '#E64A19',
              marginBottom: '12px'
            }
          }), /*#__PURE__*/React.createElement("div", {
            style: {
              fontSize: '12px',
              fontWeight: 'bold',
              color: '#666666',
              textTransform: 'uppercase',
              letterSpacing: '1px'
            }
          }, technique.category, " Technique")), /*#__PURE__*/React.createElement("h4", {
            style: {
              fontSize: '16px',
              fontWeight: 'bold',
              color: '#000000',
              marginBottom: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }
          }, /*#__PURE__*/React.createElement("i", {
            "data-lucide": "list-checks",
            style: {
              width: '20px',
              height: '20px',
              color: '#058585'
            }
          }), "How to Practice"), /*#__PURE__*/React.createElement("div", {
            style: {
              background: '#F5F5F5',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '16px',
              border: '1px solid #E0E0E0'
            }
          }, technique.description.split('\n').map((line, index) => {
            const isNumbered = /^\d+\./.test(line.trim());
            const isBold = line.includes('Optimizes') || line.includes('Reduces') || line.includes('Improves');
            return /*#__PURE__*/React.createElement("div", {
              key: index,
              style: {
                fontSize: '14px',
                fontWeight: isBold ? 'bold' : '400',
                color: isBold ? '#058585' : '#000000',
                lineHeight: '1.6',
                marginBottom: line.trim() === '' ? '12px' : '6px',
                paddingLeft: isNumbered ? '0' : '0',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '8px'
              }
            }, isNumbered && /*#__PURE__*/React.createElement("span", {
              style: {
                color: '#058585',
                fontWeight: 'bold',
                minWidth: '20px'
              }
            }, line.match(/^\d+\./)?.[0]), /*#__PURE__*/React.createElement("span", null, isNumbered ? line.replace(/^\d+\.\s*/, '') : line.trim() || '\u00A0'));
          })), /*#__PURE__*/React.createElement("div", {
            style: {
              padding: '12px',
              background: 'linear-gradient(135deg, #E8F5E9 0%, #C8E6C9 100%)',
              borderRadius: '8px',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }
          }, /*#__PURE__*/React.createElement("i", {
            "data-lucide": "heart-pulse",
            style: {
              width: '20px',
              height: '20px',
              color: '#2E7D32'
            }
          }), /*#__PURE__*/React.createElement("div", {
            style: {
              fontSize: '12px',
              fontWeight: 'bold',
              color: '#2E7D32'
            }
          }, "Evidence-Based Technique")), /*#__PURE__*/React.createElement("button", {
            onClick: () => {
              data.triggerHaptic('light');
              onClose();
            },
            style: {
              width: '100%',
              height: '48px',
              background: '#058585',
              border: 'none',
              borderRadius: '8px',
              color: '#FFFFFF',
              fontSize: '14px',
              fontWeight: '400',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }
          }, "Got It"))));
        }
      case 'milestone':
        return /*#__PURE__*/React.createElement("div", {
          style: {
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
          },
          onClick: () => onClose()
        }, /*#__PURE__*/React.createElement("div", {
          style: {
            background: '#FFFFFF',
            borderRadius: '15px',
            maxWidth: '500px',
            width: '100%',
            maxHeight: '80vh',
            overflow: 'auto'
          },
          onClick: e => e.stopPropagation()
        }, /*#__PURE__*/React.createElement("div", {
          style: {
            padding: '20px',
            borderBottom: '1px solid #E5E5E5'
          }
        }, /*#__PURE__*/React.createElement("div", {
          style: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }
        }, /*#__PURE__*/React.createElement("div", {
          style: {
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }
        }, /*#__PURE__*/React.createElement("i", {
          "data-lucide": "trophy",
          style: {
            width: '24px',
            height: '24px',
            color: '#058585'
          }
        }), /*#__PURE__*/React.createElement("h3", {
          style: {
            margin: 0,
            fontSize: '18px',
            fontWeight: '400',
            color: '#000000'
          }
        }, "Recovery Milestones")), /*#__PURE__*/React.createElement("button", {
          onClick: () => onClose(),
          style: {
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '4px'
          }
        }, /*#__PURE__*/React.createElement("i", {
          "data-lucide": "x",
          style: {
            width: '20px',
            height: '20px',
            color: '#666666'
          }
        })))), /*#__PURE__*/React.createElement("div", {
          style: {
            padding: '20px'
          }
        }, !user?.sobrietyDate ?
        /*#__PURE__*/
        /* No sobriety date set */
        React.createElement("div", {
          style: {
            textAlign: 'center',
            padding: '40px 20px'
          }
        }, /*#__PURE__*/React.createElement("i", {
          "data-lucide": "calendar-x",
          style: {
            width: '64px',
            height: '64px',
            color: '#058585',
            marginBottom: '20px'
          }
        }), /*#__PURE__*/React.createElement("h4", {
          style: {
            fontSize: '18px',
            fontWeight: '400',
            color: '#000000',
            marginBottom: '12px'
          }
        }, "Set Your Sobriety Date"), /*#__PURE__*/React.createElement("p", {
          style: {
            fontSize: '14px',
            color: '#666666',
            marginBottom: '24px',
            lineHeight: '1.6'
          }
        }, "To track your recovery milestones, please set your sobriety date in your profile settings."), /*#__PURE__*/React.createElement("button", {
          onClick: () => {
            data.triggerHaptic('medium');
            onClose();
            handlers.setCurrentView('profile');
          },
          style: {
            padding: '12px 24px',
            background: '#058585',
            border: 'none',
            borderRadius: '8px',
            color: '#FFFFFF',
            fontSize: '14px',
            fontWeight: '400',
            cursor: 'pointer'
          }
        }, "Go to Profile")) : allMilestones.length === 0 ?
        /*#__PURE__*/
        /* Milestones not loaded yet */
        React.createElement("div", {
          style: {
            textAlign: 'center',
            padding: '40px 20px'
          }
        }, /*#__PURE__*/React.createElement("i", {
          "data-lucide": "loader",
          style: {
            width: '48px',
            height: '48px',
            color: '#058585',
            marginBottom: '20px',
            animation: 'spin 1s linear infinite'
          }
        }), /*#__PURE__*/React.createElement("p", {
          style: {
            fontSize: '14px',
            color: '#666666'
          }
        }, "Loading milestones...")) :
        /*#__PURE__*/
        /* Milestones loaded - show content */
        React.createElement(React.Fragment, null, data.nextMilestone &&
        /*#__PURE__*/
        /* Progress Card */
        React.createElement("div", {
          style: {
            background: 'linear-gradient(135deg, #058585 0%, #047373 100%)',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '20px',
            color: '#FFFFFF'
          }
        }, /*#__PURE__*/React.createElement("div", {
          style: {
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '12px'
          }
        }, /*#__PURE__*/React.createElement("i", {
          "data-lucide": data.nextMilestone.icon,
          style: {
            width: '32px',
            height: '32px'
          }
        }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
          style: {
            fontSize: '16px',
            fontWeight: 'bold'
          }
        }, data.nextMilestone.achieved ? 'All Milestones Complete!' : `Next: ${data.nextMilestone.label}`), /*#__PURE__*/React.createElement("div", {
          style: {
            fontSize: '14px',
            opacity: 0.9
          }
        }, data.nextMilestone.achieved ? `${data.nextMilestone.daysSober} days sober` : `${data.nextMilestone.daysUntil} ${data.nextMilestone.daysUntil === 1 ? 'day' : 'days'} to go`))), !nextMilestone.achieved && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
          style: {
            background: 'rgba(255,255,255,0.3)',
            borderRadius: '10px',
            height: '8px',
            overflow: 'hidden',
            marginBottom: '8px'
          }
        }, /*#__PURE__*/React.createElement("div", {
          style: {
            background: '#FFFFFF',
            height: '100%',
            width: `${data.nextMilestone.progressPercentage}%`,
            transition: 'width 0.3s ease'
          }
        })), /*#__PURE__*/React.createElement("div", {
          style: {
            fontSize: '12px',
            textAlign: 'right',
            opacity: 0.9
          }
        }, data.nextMilestone.progressPercentage, "% complete"))), /*#__PURE__*/React.createElement("h4", {
          style: {
            fontSize: '16px',
            fontWeight: '400',
            color: '#000000',
            marginBottom: '12px'
          }
        }, "All Milestones"), /*#__PURE__*/React.createElement("div", {
          style: {
            marginBottom: '20px'
          }
        }, data.allMilestones.map((milestone, index) => /*#__PURE__*/React.createElement("div", {
          key: index,
          style: {
            background: milestone.achieved ? '#E8F5E9' : '#F5F5F5',
            borderRadius: '12px',
            padding: '12px',
            marginBottom: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            border: milestone.achieved ? '1px solid #4CAF50' : '1px solid #E0E0E0'
          }
        }, /*#__PURE__*/React.createElement("div", {
          style: {
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            background: milestone.achieved ? 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)' : '#E0E0E0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }
        }, /*#__PURE__*/React.createElement("i", {
          "data-lucide": milestone.achieved ? 'check' : milestone.icon,
          style: {
            width: '20px',
            height: '20px',
            color: milestone.achieved ? '#FFFFFF' : '#999999'
          }
        })), /*#__PURE__*/React.createElement("div", {
          style: {
            flex: 1
          }
        }, /*#__PURE__*/React.createElement("div", {
          style: {
            fontSize: '14px',
            fontWeight: '400',
            color: '#000000',
            marginBottom: '2px'
          }
        }, milestone.label, " (", milestone.days, " days)"), /*#__PURE__*/React.createElement("div", {
          style: {
            fontSize: '12px',
            fontWeight: '400',
            color: '#666666'
          }
        }, milestone.achieved ? `Achieved on ${milestone.dateString}` : `Target: ${milestone.dateString}`)), milestone.achieved && /*#__PURE__*/React.createElement("div", {
          style: {
            fontSize: '20px'
          }
        }, "\uD83C\uDF89")))), /*#__PURE__*/React.createElement("button", {
          onClick: () => {
            data.triggerHaptic('light');
            onClose();
          },
          style: {
            width: '100%',
            height: '48px',
            background: '#058585',
            border: 'none',
            borderRadius: '8px',
            color: '#FFFFFF',
            fontSize: '14px',
            fontWeight: '400',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }
        }, "Close")))));
      case 'pastReflections':
        {
          // Filter reflections based on selected filter
          const getFilteredReflections = () => {
            if (data.reflectionFilter === 'all') {
              return data.reflectionData;
            } else if (data.reflectionFilter === 'week') {
              const weekAgo = new Date();
              weekAgo.setDate(weekAgo.getDate() - 7);
              return data.reflectionData.filter(r => {
                const reflectionDate = r.createdAt?.toDate ? r.createdAt.toDate() : new Date(r.createdAt);
                return reflectionDate >= weekAgo;
              });
            } else if (data.reflectionFilter === 'month') {
              const monthAgo = new Date();
              monthAgo.setDate(monthAgo.getDate() - 30);
              return data.reflectionData.filter(r => {
                const reflectionDate = r.createdAt?.toDate ? r.createdAt.toDate() : new Date(r.createdAt);
                return reflectionDate >= monthAgo;
              });
            }
            return data.reflectionData;
          };
          const filteredReflections = getFilteredReflections();
          return /*#__PURE__*/React.createElement("div", {
            style: {
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
            },
            onClick: () => {
              onClose();
              handlers.handlers.setSelectedReflection(null);
            }
          }, /*#__PURE__*/React.createElement("div", {
            style: {
              background: '#FFFFFF',
              borderRadius: '15px',
              maxWidth: '600px',
              width: '100%',
              maxHeight: '85vh',
              overflow: 'auto',
              display: 'flex',
              flexDirection: 'column'
            },
            onClick: e => e.stopPropagation()
          }, /*#__PURE__*/React.createElement("div", {
            style: {
              padding: '20px',
              borderBottom: '1px solid #E5E5E5',
              position: 'sticky',
              top: 0,
              background: '#FFFFFF',
              zIndex: 1
            }
          }, /*#__PURE__*/React.createElement("div", {
            style: {
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }
          }, /*#__PURE__*/React.createElement("div", {
            style: {
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }
          }, /*#__PURE__*/React.createElement("i", {
            "data-lucide": "book-open",
            style: {
              width: '24px',
              height: '24px',
              color: '#058585'
            }
          }), /*#__PURE__*/React.createElement("h3", {
            style: {
              margin: 0,
              fontSize: '18px',
              fontWeight: '400',
              color: '#000000'
            }
          }, "Past Reflections")), /*#__PURE__*/React.createElement("button", {
            onClick: () => {
              onClose();
              handlers.handlers.setSelectedReflection(null);
            },
            style: {
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '4px'
            }
          }, /*#__PURE__*/React.createElement("i", {
            "data-lucide": "x",
            style: {
              width: '20px',
              height: '20px',
              color: '#666666'
            }
          }))), /*#__PURE__*/React.createElement("div", {
            style: {
              display: 'flex',
              gap: '8px',
              marginTop: '16px'
            }
          }, ['all', 'week', 'month'].map(filter => /*#__PURE__*/React.createElement("button", {
            key: filter,
            onClick: () => {
              data.triggerHaptic('light');
              handlers.setReflectionFilter(filter);
              handlers.handlers.setSelectedReflection(null);
            },
            style: {
              flex: 1,
              padding: '8px 12px',
              background: data.data.reflectionFilter === filter ? '#058585' : '#F5F5F5',
              color: data.data.reflectionFilter === filter ? '#FFFFFF' : '#666666',
              border: 'none',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: '400',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }
          }, filter === 'all' ? 'All Time' : filter === 'week' ? 'This Week' : 'This Month')))), /*#__PURE__*/React.createElement("div", {
            style: {
              padding: '20px',
              flex: 1,
              overflow: 'auto'
            }
          }, filteredReflections.length === 0 ? /*#__PURE__*/React.createElement("div", {
            style: {
              textAlign: 'center',
              padding: '40px 20px',
              color: '#999999'
            }
          }, /*#__PURE__*/React.createElement("i", {
            "data-lucide": "book-open",
            style: {
              width: '48px',
              height: '48px',
              color: '#E0E0E0',
              marginBottom: '12px'
            }
          }), /*#__PURE__*/React.createElement("div", {
            style: {
              fontSize: '14px',
              fontWeight: '400'
            }
          }, "No reflections found")) : /*#__PURE__*/React.createElement("div", {
            style: {
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }
          }, filteredReflections.map((reflection, index) => {
            const reflectionDate = reflection.createdAt?.toDate ? reflection.createdAt.toDate() : new Date(reflection.createdAt);
            const isExpanded = data.selectedReflection?.id === reflection.id;
            return /*#__PURE__*/React.createElement("div", {
              key: reflection.id || index,
              style: {
                background: '#F8F9FA',
                borderRadius: '12px',
                padding: '16px',
                border: isExpanded ? '2px solid #058585' : '1px solid #E5E5E5',
                cursor: 'pointer',
                transition: 'all 0.2s'
              },
              onClick: () => {
                data.triggerHaptic('light');
                handlers.setSelectedReflection(isExpanded ? null : reflection);
              }
            }, /*#__PURE__*/React.createElement("div", {
              style: {
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: isExpanded ? '16px' : '0'
              }
            }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
              style: {
                fontSize: '14px',
                fontWeight: 'bold',
                color: '#000000',
                marginBottom: '4px'
              }
            }, reflectionDate.toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            })), reflection.overallDay && /*#__PURE__*/React.createElement("div", {
              style: {
                fontSize: '12px',
                fontWeight: '400',
                color: '#666666'
              }
            }, "Daily Score: ", reflection.overallDay, "/10")), /*#__PURE__*/React.createElement("i", {
              "data-lucide": isExpanded ? 'chevron-up' : 'chevron-down',
              style: {
                width: '20px',
                height: '20px',
                color: '#666666'
              }
            })), isExpanded && /*#__PURE__*/React.createElement("div", {
              style: {
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }
            }, reflection.promptResponse && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
              style: {
                fontSize: '13px',
                fontWeight: 'bold',
                color: '#058585',
                marginBottom: '6px'
              }
            }, "Prompt Response"), /*#__PURE__*/React.createElement("div", {
              style: {
                fontSize: '13px',
                fontWeight: '400',
                color: '#000000',
                lineHeight: '1.5',
                background: '#FFFFFF',
                padding: '10px',
                borderRadius: '8px'
              }
            }, reflection.promptResponse)), reflection.challenges && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
              style: {
                fontSize: '13px',
                fontWeight: 'bold',
                color: '#058585',
                marginBottom: '6px'
              }
            }, "Challenges"), /*#__PURE__*/React.createElement("div", {
              style: {
                fontSize: '13px',
                fontWeight: '400',
                color: '#000000',
                lineHeight: '1.5',
                background: '#FFFFFF',
                padding: '10px',
                borderRadius: '8px'
              }
            }, reflection.challenges)), reflection.gratitude && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
              style: {
                fontSize: '13px',
                fontWeight: 'bold',
                color: '#058585',
                marginBottom: '6px'
              }
            }, "Gratitude"), /*#__PURE__*/React.createElement("div", {
              style: {
                fontSize: '13px',
                fontWeight: '400',
                color: '#000000',
                lineHeight: '1.5',
                background: '#FFFFFF',
                padding: '10px',
                borderRadius: '8px'
              }
            }, reflection.gratitude)), reflection.tomorrowGoal && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
              style: {
                fontSize: '13px',
                fontWeight: 'bold',
                color: '#058585',
                marginBottom: '6px'
              }
            }, "Tomorrow's Goal"), /*#__PURE__*/React.createElement("div", {
              style: {
                fontSize: '13px',
                fontWeight: '400',
                color: '#000000',
                lineHeight: '1.5',
                background: '#FFFFFF',
                padding: '10px',
                borderRadius: '8px'
              }
            }, reflection.tomorrowGoal))));
          })))));
        }
      case 'gratitude':
        return /*#__PURE__*/React.createElement("div", {
          style: {
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
          },
          onClick: () => {
            onClose();
            handlers.setGratitudeTheme('');
            handlers.setGratitudeText('');
          }
        }, /*#__PURE__*/React.createElement("div", {
          style: {
            background: '#FFFFFF',
            borderRadius: '15px',
            maxWidth: '500px',
            width: '100%',
            maxHeight: '85vh',
            overflow: 'auto'
          },
          onClick: e => e.stopPropagation()
        }, /*#__PURE__*/React.createElement("div", {
          style: {
            padding: '20px',
            borderBottom: '1px solid #E5E5E5'
          }
        }, /*#__PURE__*/React.createElement("div", {
          style: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }
        }, /*#__PURE__*/React.createElement("div", {
          style: {
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }
        }, /*#__PURE__*/React.createElement("i", {
          "data-lucide": "heart",
          style: {
            width: '24px',
            height: '24px',
            color: '#058585'
          }
        }), /*#__PURE__*/React.createElement("h3", {
          style: {
            margin: 0,
            fontSize: '18px',
            fontWeight: '400',
            color: '#000000'
          }
        }, "Gratitude Entry")), /*#__PURE__*/React.createElement("button", {
          onClick: () => {
            onClose();
            handlers.setGratitudeTheme('');
            handlers.setGratitudeText('');
          },
          style: {
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '4px'
          }
        }, /*#__PURE__*/React.createElement("i", {
          "data-lucide": "x",
          style: {
            width: '20px',
            height: '20px',
            color: '#666666'
          }
        })))), /*#__PURE__*/React.createElement("div", {
          style: {
            padding: '20px'
          }
        }, /*#__PURE__*/React.createElement("div", {
          style: {
            marginBottom: '20px'
          }
        }, /*#__PURE__*/React.createElement("h4", {
          style: {
            fontSize: '14px',
            fontWeight: 'bold',
            color: '#000000',
            marginBottom: '12px'
          }
        }, "Select a Theme"), /*#__PURE__*/React.createElement("div", {
          style: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
            gap: '8px'
          }
        }, data.gratitudeThemes.map(theme => /*#__PURE__*/React.createElement("button", {
          key: theme.id,
          onClick: () => {
            data.triggerHaptic('light');
            handlers.setGratitudeTheme(theme.id);
          },
          style: {
            padding: '12px',
            background: data.gratitudeTheme === theme.id ? theme.color : '#F5F5F5',
            color: data.gratitudeTheme === theme.id ? '#FFFFFF' : '#000000',
            border: 'none',
            borderRadius: '8px',
            fontSize: '12px',
            fontWeight: '400',
            cursor: 'pointer',
            transition: 'all 0.2s',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '6px'
          }
        }, /*#__PURE__*/React.createElement("i", {
          "data-lucide": theme.icon,
          style: {
            width: '20px',
            height: '20px',
            color: data.gratitudeTheme === theme.id ? '#FFFFFF' : theme.color
          }
        }), /*#__PURE__*/React.createElement("div", {
          style: {
            textAlign: 'center',
            lineHeight: '1.2'
          }
        }, theme.label))))), /*#__PURE__*/React.createElement("div", {
          style: {
            marginBottom: '20px'
          }
        }, /*#__PURE__*/React.createElement("h4", {
          style: {
            fontSize: '14px',
            fontWeight: 'bold',
            color: '#000000',
            marginBottom: '8px'
          }
        }, "What are you grateful for?"), /*#__PURE__*/React.createElement("textarea", {
          value: data.gratitudeText,
          onChange: e => handlers.setGratitudeText(e.target.value),
          placeholder: "Express your gratitude...",
          style: {
            width: '100%',
            minHeight: '100px',
            padding: '12px',
            border: '1px solid #E5E5E5',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '400',
            color: '#000000',
            fontFamily: 'inherit',
            resize: 'vertical'
          }
        })), /*#__PURE__*/React.createElement("button", {
          onClick: () => {
            data.triggerHaptic('medium');
            data.saveGratitude();
          },
          style: {
            width: '100%',
            height: '48px',
            background: '#058585',
            border: 'none',
            borderRadius: '8px',
            color: '#FFFFFF',
            fontSize: '14px',
            fontWeight: '400',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }
        }, "Save Gratitude"))));
      case 'streak':
        return /*#__PURE__*/React.createElement("div", {
          style: {
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
          },
          onClick: () => onClose()
        }, /*#__PURE__*/React.createElement("div", {
          style: {
            background: '#FFFFFF',
            borderRadius: '15px',
            maxWidth: '400px',
            width: '100%',
            maxHeight: '80vh',
            overflow: 'auto'
          },
          onClick: e => e.stopPropagation()
        }, /*#__PURE__*/React.createElement("div", {
          style: {
            padding: '20px',
            borderBottom: '1px solid #E5E5E5'
          }
        }, /*#__PURE__*/React.createElement("div", {
          style: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }
        }, /*#__PURE__*/React.createElement("h3", {
          style: {
            margin: 0,
            fontSize: '18px',
            fontWeight: '400',
            color: '#000000'
          }
        }, "Check-In Streak"), /*#__PURE__*/React.createElement("button", {
          onClick: () => onClose(),
          style: {
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '4px'
          }
        }, /*#__PURE__*/React.createElement("i", {
          "data-lucide": "x",
          style: {
            width: '20px',
            height: '20px',
            color: '#666666'
          }
        })))), /*#__PURE__*/React.createElement("div", {
          style: {
            padding: '20px'
          }
        }, /*#__PURE__*/React.createElement("button", {
          onClick: () => onClose(),
          style: {
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'none',
            border: 'none',
            color: '#058585',
            fontSize: '14px',
            fontWeight: '400',
            cursor: 'pointer',
            marginBottom: '16px',
            padding: 0
          }
        }, /*#__PURE__*/React.createElement("i", {
          "data-lucide": "arrow-left",
          style: {
            width: '20px',
            height: '20px'
          }
        }), "Back to Check-In"), /*#__PURE__*/React.createElement("div", {
          style: {
            background: '#E0F7FA',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '20px',
            textAlign: 'center'
          }
        }, /*#__PURE__*/React.createElement("div", {
          style: {
            fontSize: '32px',
            fontWeight: 'bold',
            color: '#058585',
            marginBottom: '4px'
          }
        }, data.checkInStreak, " ", checkInStreak === 1 ? 'Day' : 'Days'), /*#__PURE__*/React.createElement("div", {
          style: {
            fontSize: '14px',
            fontWeight: '400',
            color: '#666666'
          }
        }, "Current Streak")), /*#__PURE__*/React.createElement("div", {
          style: {
            fontSize: '14px',
            fontWeight: '400',
            color: '#000000',
            marginBottom: '12px'
          }
        }, "All Check-Ins in Streak"), /*#__PURE__*/React.createElement("div", {
          style: {
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }
        }, data.data.streakCheckIns.length > 0 ? streakCheckIns.map((checkIn, index) => {
          const checkInDate = checkIn.createdAt?.toDate ? checkIn.createdAt.toDate() : new Date(checkIn.createdAt);
          const dateStr = checkInDate.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
          });

          // Get morning data (primary source for scores)
          const mood = checkIn.morningData?.mood ?? checkIn.eveningData?.mood ?? 'N/A';
          const craving = checkIn.morningData?.craving ?? checkIn.eveningData?.craving ?? 'N/A';
          const anxiety = checkIn.morningData?.anxiety ?? checkIn.eveningData?.anxiety ?? 'N/A';
          const sleep = checkIn.morningData?.sleep ?? checkIn.eveningData?.sleep ?? 'N/A';
          return /*#__PURE__*/React.createElement("div", {
            key: checkIn.id,
            style: {
              background: '#FFFFFF',
              border: '1px solid #E5E5E5',
              borderRadius: '8px',
              padding: '12px'
            }
          }, /*#__PURE__*/React.createElement("div", {
            style: {
              fontSize: '14px',
              fontWeight: 'bold',
              color: '#000000',
              marginBottom: '6px'
            }
          }, "Day ", data.data.streakCheckIns.length - index, " - ", dateStr), /*#__PURE__*/React.createElement("div", {
            style: {
              fontSize: '12px',
              fontWeight: '400',
              color: '#666666',
              display: 'flex',
              flexWrap: 'wrap',
              gap: '12px'
            }
          }, /*#__PURE__*/React.createElement("span", null, "Mood: ", mood), /*#__PURE__*/React.createElement("span", null, "Craving: ", craving), /*#__PURE__*/React.createElement("span", null, "Anxiety: ", anxiety), /*#__PURE__*/React.createElement("span", null, "Sleep: ", sleep)));
        }) : /*#__PURE__*/React.createElement("div", {
          style: {
            padding: '20px',
            textAlign: 'center',
            color: '#999999',
            fontSize: '14px'
          }
        }, "No check-ins in streak yet. Start checking in daily to build your streak!")))));
      case 'weeklyReport':
        {
          // Calculate week-specific stats
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          weekAgo.setHours(0, 0, 0, 0);

          // Check-in stats for the week
          const thisWeekCheckIns = data.checkInData.filter(c => {
            const checkInDate = c.createdAt?.toDate ? c.createdAt.toDate() : new Date(c.createdAt);
            return checkInDate >= weekAgo;
          });
          const weekCheckInCount = thisWeekCheckIns.length;
          const weekCheckInRate = Math.round(weekCheckInCount / 7 * 100);
          const weekMoodScores = thisWeekCheckIns.filter(c => c.morningData?.mood !== undefined || c.eveningData?.mood !== undefined).map(c => c.morningData?.mood ?? c.eveningData?.mood);
          const weekAvgMood = weekMoodScores.length > 0 ? (weekMoodScores.reduce((a, b) => a + b, 0) / weekMoodScores.length).toFixed(1) : 'N/A';
          const weekCravingsScores = thisWeekCheckIns.filter(c => c.morningData?.craving !== undefined || c.eveningData?.craving !== undefined).map(c => c.morningData?.craving ?? c.eveningData?.craving);
          const weekAvgCravings = weekCravingsScores.length > 0 ? (weekCravingsScores.reduce((a, b) => a + b, 0) / weekCravingsScores.length).toFixed(1) : 'N/A';
          const weekAnxietyScores = thisWeekCheckIns.filter(c => c.morningData?.anxiety !== undefined || c.eveningData?.anxiety !== undefined).map(c => c.morningData?.anxiety ?? c.eveningData?.anxiety);
          const weekAvgAnxiety = weekAnxietyScores.length > 0 ? (weekAnxietyScores.reduce((a, b) => a + b, 0) / weekAnxietyScores.length).toFixed(1) : 'N/A';
          const weekSleepScores = thisWeekCheckIns.filter(c => c.morningData?.sleep !== undefined || c.eveningData?.sleep !== undefined).map(c => c.morningData?.sleep ?? c.eveningData?.sleep);
          const weekAvgSleep = weekSleepScores.length > 0 ? (weekSleepScores.reduce((a, b) => a + b, 0) / weekSleepScores.length).toFixed(1) : 'N/A';

          // Reflection stats for the week
          const thisWeekReflections = data.reflectionData.filter(r => {
            const reflectionDate = r.createdAt?.toDate ? r.createdAt.toDate() : new Date(r.createdAt);
            return reflectionDate >= weekAgo;
          });
          const weekReflectionCount = thisWeekReflections.length;
          const weekDailyScores = thisWeekReflections.filter(r => r.dailyScore).map(r => r.dailyScore);
          const weekAvgDailyScore = weekDailyScores.length > 0 ? (weekDailyScores.reduce((a, b) => a + b, 0) / weekDailyScores.length).toFixed(1) : 'N/A';

          // Gratitude entries for the week
          const weekGratitudes = thisWeekReflections.filter(r => r.gratitude && r.gratitude.length > 0).length;

          // Assignment progress for the week
          const thisWeekAssignments = data.assignments.filter(a => {
            if (!a.createdAt) return false;
            const assignmentDate = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
            return assignmentDate >= weekAgo;
          });
          const weekAssignmentsCompleted = thisWeekAssignments.filter(a => a.status === 'completed').length;
          const weekAssignmentsTotal = thisWeekAssignments.length;
          const weekCompletionRate = weekAssignmentsTotal > 0 ? Math.round(weekAssignmentsCompleted / weekAssignmentsTotal * 100) : 0;

          // Coach notes for the week
          const thisWeekCoachNotes = data.coachNotes.filter(n => {
            if (!n.createdAt) return false;
            const noteDate = n.createdAt?.toDate ? n.createdAt.toDate() : new Date(n.createdAt);
            return noteDate >= weekAgo;
          });
          return /*#__PURE__*/React.createElement("div", {
            style: {
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
            },
            onClick: () => onClose()
          }, /*#__PURE__*/React.createElement("div", {
            style: {
              background: '#FFFFFF',
              borderRadius: '15px',
              maxWidth: '600px',
              width: '100%',
              maxHeight: '90vh',
              overflow: 'auto'
            },
            onClick: e => e.stopPropagation()
          }, /*#__PURE__*/React.createElement("div", {
            style: {
              padding: '20px',
              borderBottom: '1px solid #E5E5E5',
              position: 'sticky',
              top: 0,
              background: '#FFFFFF',
              zIndex: 1
            }
          }, /*#__PURE__*/React.createElement("div", {
            style: {
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }
          }, /*#__PURE__*/React.createElement("div", {
            style: {
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }
          }, /*#__PURE__*/React.createElement("i", {
            "data-lucide": "calendar-check",
            style: {
              width: '24px',
              height: '24px',
              color: '#058585'
            }
          }), /*#__PURE__*/React.createElement("h3", {
            style: {
              margin: 0,
              fontSize: '20px',
              fontWeight: 'bold',
              color: '#000000'
            }
          }, "Weekly Progress Report")), /*#__PURE__*/React.createElement("button", {
            onClick: () => onClose(),
            style: {
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '4px'
            }
          }, /*#__PURE__*/React.createElement("i", {
            "data-lucide": "x",
            style: {
              width: '20px',
              height: '20px',
              color: '#666666'
            }
          }))), /*#__PURE__*/React.createElement("div", {
            style: {
              fontSize: '12px',
              color: '#666666',
              marginTop: '8px'
            }
          }, "Last 7 Days \u2022 ", new Date(weekAgo).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
          }), " - ", new Date().toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
          }))), /*#__PURE__*/React.createElement("div", {
            style: {
              padding: '20px'
            }
          }, /*#__PURE__*/React.createElement("div", {
            style: {
              marginBottom: '24px',
              padding: '16px',
              background: 'linear-gradient(135deg, #058585 0%, #047373 100%)',
              borderRadius: '12px',
              color: '#FFFFFF'
            }
          }, /*#__PURE__*/React.createElement("div", {
            style: {
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              marginBottom: '12px'
            }
          }, /*#__PURE__*/React.createElement("i", {
            "data-lucide": "check-circle",
            style: {
              width: '20px',
              height: '20px'
            }
          }), /*#__PURE__*/React.createElement("h4", {
            style: {
              margin: 0,
              fontSize: '16px',
              fontWeight: 'bold'
            }
          }, "Check-In Summary")), /*#__PURE__*/React.createElement("div", {
            style: {
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '12px'
            }
          }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
            style: {
              fontSize: '12px',
              opacity: 0.9
            }
          }, "Check-In Rate"), /*#__PURE__*/React.createElement("div", {
            style: {
              fontSize: '24px',
              fontWeight: 'bold'
            }
          }, weekCheckInRate, "%"), /*#__PURE__*/React.createElement("div", {
            style: {
              fontSize: '11px',
              opacity: 0.8
            }
          }, weekCheckInCount, "/7 days")), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
            style: {
              fontSize: '12px',
              opacity: 0.9
            }
          }, "Avg Mood"), /*#__PURE__*/React.createElement("div", {
            style: {
              fontSize: '24px',
              fontWeight: 'bold'
            }
          }, weekAvgMood), /*#__PURE__*/React.createElement("div", {
            style: {
              fontSize: '11px',
              opacity: 0.8
            }
          }, "out of 10")), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
            style: {
              fontSize: '12px',
              opacity: 0.9
            }
          }, "Avg Cravings"), /*#__PURE__*/React.createElement("div", {
            style: {
              fontSize: '24px',
              fontWeight: 'bold'
            }
          }, weekAvgCravings), /*#__PURE__*/React.createElement("div", {
            style: {
              fontSize: '11px',
              opacity: 0.8
            }
          }, "intensity")), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
            style: {
              fontSize: '12px',
              opacity: 0.9
            }
          }, "Avg Anxiety"), /*#__PURE__*/React.createElement("div", {
            style: {
              fontSize: '24px',
              fontWeight: 'bold'
            }
          }, weekAvgAnxiety), /*#__PURE__*/React.createElement("div", {
            style: {
              fontSize: '11px',
              opacity: 0.8
            }
          }, "level"))), /*#__PURE__*/React.createElement("div", {
            style: {
              marginTop: '12px',
              paddingTop: '12px',
              borderTop: '1px solid rgba(255,255,255,0.2)'
            }
          }, /*#__PURE__*/React.createElement("div", {
            style: {
              fontSize: '12px',
              opacity: 0.9
            }
          }, "Avg Sleep Quality"), /*#__PURE__*/React.createElement("div", {
            style: {
              fontSize: '24px',
              fontWeight: 'bold'
            }
          }, weekAvgSleep), /*#__PURE__*/React.createElement("div", {
            style: {
              fontSize: '11px',
              opacity: 0.8
            }
          }, "out of 10"))), /*#__PURE__*/React.createElement("div", {
            style: {
              marginBottom: '24px',
              padding: '16px',
              background: '#F5F5F5',
              borderRadius: '12px'
            }
          }, /*#__PURE__*/React.createElement("div", {
            style: {
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              marginBottom: '12px'
            }
          }, /*#__PURE__*/React.createElement("i", {
            "data-lucide": "book-open",
            style: {
              width: '20px',
              height: '20px',
              color: '#058585'
            }
          }), /*#__PURE__*/React.createElement("h4", {
            style: {
              margin: 0,
              fontSize: '16px',
              fontWeight: 'bold',
              color: '#000000'
            }
          }, "Reflection Summary")), /*#__PURE__*/React.createElement("div", {
            style: {
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '12px'
            }
          }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
            style: {
              fontSize: '12px',
              color: '#666666'
            }
          }, "Reflections"), /*#__PURE__*/React.createElement("div", {
            style: {
              fontSize: '24px',
              fontWeight: 'bold',
              color: '#058585'
            }
          }, weekReflectionCount)), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
            style: {
              fontSize: '12px',
              color: '#666666'
            }
          }, "Avg Daily Score"), /*#__PURE__*/React.createElement("div", {
            style: {
              fontSize: '24px',
              fontWeight: 'bold',
              color: '#058585'
            }
          }, weekAvgDailyScore)), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
            style: {
              fontSize: '12px',
              color: '#666666'
            }
          }, "Gratitudes"), /*#__PURE__*/React.createElement("div", {
            style: {
              fontSize: '24px',
              fontWeight: 'bold',
              color: '#058585'
            }
          }, weekGratitudes)))), /*#__PURE__*/React.createElement("div", {
            style: {
              marginBottom: '24px',
              padding: '16px',
              background: '#F5F5F5',
              borderRadius: '12px'
            }
          }, /*#__PURE__*/React.createElement("div", {
            style: {
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              marginBottom: '12px'
            }
          }, /*#__PURE__*/React.createElement("i", {
            "data-lucide": "clipboard-check",
            style: {
              width: '20px',
              height: '20px',
              color: '#058585'
            }
          }), /*#__PURE__*/React.createElement("h4", {
            style: {
              margin: 0,
              fontSize: '16px',
              fontWeight: 'bold',
              color: '#000000'
            }
          }, "Assignment Progress")), /*#__PURE__*/React.createElement("div", {
            style: {
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '12px'
            }
          }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
            style: {
              fontSize: '12px',
              color: '#666666'
            }
          }, "Completed"), /*#__PURE__*/React.createElement("div", {
            style: {
              fontSize: '24px',
              fontWeight: 'bold',
              color: '#058585'
            }
          }, weekAssignmentsCompleted), /*#__PURE__*/React.createElement("div", {
            style: {
              fontSize: '11px',
              color: '#999999'
            }
          }, "of ", weekAssignmentsTotal, " assignments")), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
            style: {
              fontSize: '12px',
              color: '#666666'
            }
          }, "Completion Rate"), /*#__PURE__*/React.createElement("div", {
            style: {
              fontSize: '24px',
              fontWeight: 'bold',
              color: '#058585'
            }
          }, weekCompletionRate, "%")))), /*#__PURE__*/React.createElement("div", {
            style: {
              marginBottom: '24px',
              padding: '16px',
              background: '#F5F5F5',
              borderRadius: '12px'
            }
          }, /*#__PURE__*/React.createElement("div", {
            style: {
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              marginBottom: '12px'
            }
          }, /*#__PURE__*/React.createElement("i", {
            "data-lucide": "flame",
            style: {
              width: '20px',
              height: '20px',
              color: '#FF6B6B'
            }
          }), /*#__PURE__*/React.createElement("h4", {
            style: {
              margin: 0,
              fontSize: '16px',
              fontWeight: 'bold',
              color: '#000000'
            }
          }, "Current Streaks")), /*#__PURE__*/React.createElement("div", {
            style: {
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '12px'
            }
          }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
            style: {
              fontSize: '12px',
              color: '#666666'
            }
          }, "Check-In Streak"), /*#__PURE__*/React.createElement("div", {
            style: {
              fontSize: '24px',
              fontWeight: 'bold',
              color: '#FF6B6B'
            }
          }, data.checkInStreak), /*#__PURE__*/React.createElement("div", {
            style: {
              fontSize: '11px',
              color: '#999999'
            }
          }, "days")), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
            style: {
              fontSize: '12px',
              color: '#666666'
            }
          }, "Reflection Streak"), /*#__PURE__*/React.createElement("div", {
            style: {
              fontSize: '24px',
              fontWeight: 'bold',
              color: '#FF6B6B'
            }
          }, data.reflectionStreak), /*#__PURE__*/React.createElement("div", {
            style: {
              fontSize: '11px',
              color: '#999999'
            }
          }, "days")))), thisWeekCoachNotes.length > 0 ? /*#__PURE__*/React.createElement("div", {
            style: {
              marginBottom: '16px',
              padding: '16px',
              background: '#FFF9E6',
              borderRadius: '12px',
              border: '1px solid #FFE066'
            }
          }, /*#__PURE__*/React.createElement("div", {
            style: {
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              marginBottom: '12px'
            }
          }, /*#__PURE__*/React.createElement("i", {
            "data-lucide": "message-circle",
            style: {
              width: '20px',
              height: '20px',
              color: '#F59E0B'
            }
          }), /*#__PURE__*/React.createElement("h4", {
            style: {
              margin: 0,
              fontSize: '16px',
              fontWeight: 'bold',
              color: '#000000'
            }
          }, "Coach Notes This Week")), /*#__PURE__*/React.createElement("div", {
            style: {
              fontSize: '12px',
              color: '#666666',
              marginBottom: '8px'
            }
          }, thisWeekCoachNotes.length, " note", thisWeekCoachNotes.length !== 1 ? 's' : '', " from your coach"), thisWeekCoachNotes.slice(0, 3).map((note, index) => /*#__PURE__*/React.createElement("div", {
            key: note.id || index,
            style: {
              padding: '10px',
              background: '#FFFFFF',
              borderRadius: '8px',
              marginBottom: index < Math.min(2, thisWeekCoachNotes.length - 1) ? '8px' : 0,
              border: '1px solid #E5E5E5'
            }
          }, /*#__PURE__*/React.createElement("div", {
            style: {
              fontSize: '11px',
              color: '#999999',
              marginBottom: '4px'
            }
          }, note.createdAt?.toDate ? note.createdAt.toDate().toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
          }) : 'Recent'), /*#__PURE__*/React.createElement("div", {
            style: {
              fontSize: '13px',
              color: '#000000',
              lineHeight: '1.4'
            }
          }, note.note?.substring(0, 100), note.note?.length > 100 ? '...' : ''))), thisWeekCoachNotes.length > 3 && /*#__PURE__*/React.createElement("div", {
            style: {
              fontSize: '12px',
              color: '#058585',
              marginTop: '8px',
              textAlign: 'center'
            }
          }, "+ ", thisWeekCoachNotes.length - 3, " more note", thisWeekCoachNotes.length - 3 !== 1 ? 's' : '')) : /*#__PURE__*/React.createElement("div", {
            style: {
              marginBottom: '16px',
              padding: '16px',
              background: '#F5F5F5',
              borderRadius: '12px',
              textAlign: 'center'
            }
          }, /*#__PURE__*/React.createElement("i", {
            "data-lucide": "message-circle",
            style: {
              width: '32px',
              height: '32px',
              color: '#CCCCCC',
              marginBottom: '8px'
            }
          }), /*#__PURE__*/React.createElement("div", {
            style: {
              fontSize: '14px',
              color: '#999999'
            }
          }, "No coach notes this week")), /*#__PURE__*/React.createElement("div", {
            style: {
              padding: '16px',
              background: 'linear-gradient(135deg, #E8F5E9 0%, #C8E6C9 100%)',
              borderRadius: '12px',
              textAlign: 'center'
            }
          }, /*#__PURE__*/React.createElement("div", {
            style: {
              fontSize: '16px',
              fontWeight: 'bold',
              color: '#2E7D32',
              marginBottom: '8px'
            }
          }, weekCheckInRate >= 85 && weekReflectionCount >= 5 ? 'Outstanding Week!' : weekCheckInRate >= 70 && weekReflectionCount >= 3 ? 'Great Progress!' : weekCheckInRate >= 50 ? 'Keep Going!' : 'You\'ve Got This!'), /*#__PURE__*/React.createElement("div", {
            style: {
              fontSize: '13px',
              color: '#1B5E20',
              lineHeight: '1.5'
            }
          }, weekCheckInRate >= 85 && weekReflectionCount >= 5 ? 'You\'re crushing it! Your consistency is inspiring.' : weekCheckInRate >= 70 && weekReflectionCount >= 3 ? 'You\'re making excellent progress. Keep up the momentum!' : weekCheckInRate >= 50 ? 'You\'re building great habits. Every day counts!' : 'Remember, progress isn\'t always linear. We\'re here to support you.')), /*#__PURE__*/React.createElement("button", {
            onClick: async () => {
              try {
                const reportText = `Weekly Progress Report\nLast 7 Days\n\nCheck-In Summary:\n- Check-In Rate: ${weekCheckInRate}% (${weekCheckInCount}/7 days)\n- Avg Mood: ${weekAvgMood}/10\n- Avg Cravings: ${weekAvgCravings}/10\n- Avg Anxiety: ${weekAvgAnxiety}/10\n- Avg Sleep Quality: ${weekAvgSleep}/10\n\nReflection Summary:\n- Reflections: ${weekReflectionCount}\n- Avg Daily Score: ${weekAvgDailyScore}/10\n- Gratitudes: ${weekGratitudes}\n\nAssignment Progress:\n- Completed: ${weekAssignmentsCompleted}/${weekAssignmentsTotal}\n- Completion Rate: ${weekCompletionRate}%\n\nCurrent Streaks:\n- Check-In Streak: ${data.checkInStreak} days\n- Reflection Streak: ${data.reflectionStreak} days`;
                if (navigator.share) {
                  await navigator.share({
                    title: 'Weekly Progress Report',
                    text: reportText
                  });
                } else {
                  // Fallback: copy to clipboard
                  await navigator.clipboard.writeText(reportText);
                  alert('Report copied to clipboard!');
                }
              } catch (error) {
                if (error.name !== 'AbortError') {
                  console.error('Share/export error:', error);
                  alert('Unable to share report. Please try again.');
                }
              }
            },
            style: {
              width: '100%',
              marginTop: '16px',
              padding: '14px',
              background: 'linear-gradient(135deg, #058585 0%, #047373 100%)',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }
          }, /*#__PURE__*/React.createElement("i", {
            "data-lucide": "share-2",
            style: {
              width: '20px',
              height: '20px'
            }
          }), "Export / Share Report"))));
        }
      case 'calendarHeatmap':
        return /*#__PURE__*/React.createElement("div", {
          style: {
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
          },
          onClick: () => {
            onClose();
            handlers.handlers.setSelectedCalendarDay(null);
          }
        }, /*#__PURE__*/React.createElement("div", {
          style: {
            background: '#FFFFFF',
            borderRadius: '15px',
            maxWidth: '600px',
            width: '100%',
            maxHeight: '90vh',
            overflow: 'auto'
          },
          onClick: e => e.stopPropagation()
        }, /*#__PURE__*/React.createElement("div", {
          style: {
            padding: '20px',
            borderBottom: '1px solid #E5E5E5',
            position: 'sticky',
            top: 0,
            background: '#FFFFFF',
            zIndex: 10
          }
        }, /*#__PURE__*/React.createElement("div", {
          style: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '15px'
          }
        }, /*#__PURE__*/React.createElement("div", {
          style: {
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }
        }, /*#__PURE__*/React.createElement("i", {
          "data-lucide": "calendar",
          style: {
            width: '24px',
            height: '24px',
            color: '#058585'
          }
        }), /*#__PURE__*/React.createElement("h3", {
          style: {
            margin: 0,
            fontSize: '20px',
            fontWeight: '600',
            color: '#000000'
          }
        }, "Check-In Calendar")), /*#__PURE__*/React.createElement("button", {
          onClick: () => {
            onClose();
            handlers.handlers.setSelectedCalendarDay(null);
          },
          style: {
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '4px'
          }
        }, /*#__PURE__*/React.createElement("i", {
          "data-lucide": "x",
          style: {
            width: '20px',
            height: '20px',
            color: '#666666'
          }
        }))), /*#__PURE__*/React.createElement("div", {
          style: {
            display: 'flex',
            gap: '8px',
            marginBottom: '15px'
          }
        }, ['week', 'month'].map(mode => /*#__PURE__*/React.createElement("button", {
          key: mode,
          onClick: () => {
            data.triggerHaptic('light');
            handlers.setCalendarViewMode(mode);
            handlers.handlers.setSelectedCalendarDay(null);
          },
          style: {
            flex: 1,
            padding: '10px 16px',
            borderRadius: '8px',
            border: data.calendarViewMode === mode ? '2px solid #058585' : '1px solid #E5E5E5',
            background: data.calendarViewMode === mode ? 'rgba(5, 133, 133, 0.1)' : '#FFFFFF',
            color: data.calendarViewMode === mode ? '#058585' : '#666666',
            fontSize: '14px',
            fontWeight: data.calendarViewMode === mode ? '600' : '400',
            cursor: 'pointer',
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px'
          }
        }, /*#__PURE__*/React.createElement("i", {
          "data-lucide": mode === 'week' ? 'calendar-days' : 'calendar',
          style: {
            width: '16px',
            height: '16px'
          }
        }), mode.charAt(0).toUpperCase() + mode.slice(1)))), data.calendarViewMode === 'month' && /*#__PURE__*/React.createElement("div", {
          style: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '12px',
            background: '#F8F9FA',
            borderRadius: '8px'
          }
        }, /*#__PURE__*/React.createElement("button", {
          onClick: () => {
            data.triggerHaptic('light');
            const newMonth = new Date(calendarCurrentMonth);
            newMonth.setMonth(newMonth.getMonth() - 1);
            handlers.setCalendarCurrentMonth(newMonth);
          },
          style: {
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '4px'
          }
        }, /*#__PURE__*/React.createElement("svg", {
          width: "20",
          height: "20",
          viewBox: "0 0 24 24",
          fill: "none",
          stroke: "#058585",
          strokeWidth: "2",
          strokeLinecap: "round",
          strokeLinejoin: "round"
        }, /*#__PURE__*/React.createElement("polyline", {
          points: "15 18 9 12 15 6"
        }))), /*#__PURE__*/React.createElement("div", {
          style: {
            fontSize: '16px',
            fontWeight: '600',
            color: '#000000'
          }
        }, calendarCurrentMonth.toLocaleDateString('en-US', {
          month: 'long',
          year: 'numeric'
        })), /*#__PURE__*/React.createElement("button", {
          onClick: () => {
            data.triggerHaptic('light');
            const newMonth = new Date(calendarCurrentMonth);
            newMonth.setMonth(newMonth.getMonth() + 1);
            handlers.setCalendarCurrentMonth(newMonth);
          },
          style: {
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '4px'
          }
        }, /*#__PURE__*/React.createElement("svg", {
          width: "20",
          height: "20",
          viewBox: "0 0 24 24",
          fill: "none",
          stroke: "#058585",
          strokeWidth: "2",
          strokeLinecap: "round",
          strokeLinejoin: "round"
        }, /*#__PURE__*/React.createElement("polyline", {
          points: "9 18 15 12 9 6"
        })))), data.calendarViewMode === 'week' && (() => {
          // Get Monday as start of week (ISO 8601 standard)
          const getMonday = d => {
            const date = new Date(d);
            const day = date.getDay();
            const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
            return new Date(date.setDate(diff));
          };
          const monday = getMonday(calendarCurrentWeek);
          const sunday = new Date(monday);
          sunday.setDate(monday.getDate() + 6);
          return /*#__PURE__*/React.createElement("div", {
            style: {
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '12px',
              background: '#F8F9FA',
              borderRadius: '8px'
            }
          }, /*#__PURE__*/React.createElement("button", {
            onClick: () => {
              data.triggerHaptic('light');
              const newWeek = new Date(calendarCurrentWeek);
              newWeek.setDate(newWeek.getDate() - 7);
              handlers.setCalendarCurrentWeek(newWeek);
              handlers.handlers.setSelectedCalendarDay(null);
            },
            style: {
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '4px'
            }
          }, /*#__PURE__*/React.createElement("svg", {
            width: "20",
            height: "20",
            viewBox: "0 0 24 24",
            fill: "none",
            stroke: "#058585",
            strokeWidth: "2",
            strokeLinecap: "round",
            strokeLinejoin: "round"
          }, /*#__PURE__*/React.createElement("polyline", {
            points: "15 18 9 12 15 6"
          }))), /*#__PURE__*/React.createElement("div", {
            style: {
              fontSize: '16px',
              fontWeight: '600',
              color: '#000000',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }
          }, /*#__PURE__*/React.createElement("svg", {
            width: "16",
            height: "16",
            viewBox: "0 0 24 24",
            fill: "none",
            stroke: "#058585",
            strokeWidth: "2",
            strokeLinecap: "round",
            strokeLinejoin: "round"
          }, /*#__PURE__*/React.createElement("rect", {
            x: "3",
            y: "4",
            width: "18",
            height: "18",
            rx: "2",
            ry: "2"
          }), /*#__PURE__*/React.createElement("line", {
            x1: "16",
            y1: "2",
            x2: "16",
            y2: "6"
          }), /*#__PURE__*/React.createElement("line", {
            x1: "8",
            y1: "2",
            x2: "8",
            y2: "6"
          }), /*#__PURE__*/React.createElement("line", {
            x1: "3",
            y1: "10",
            x2: "21",
            y2: "10"
          })), monday.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
          }), " - ", sunday.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
          })), /*#__PURE__*/React.createElement("button", {
            onClick: () => {
              data.triggerHaptic('light');
              const newWeek = new Date(calendarCurrentWeek);
              newWeek.setDate(newWeek.getDate() + 7);
              handlers.setCalendarCurrentWeek(newWeek);
              handlers.handlers.setSelectedCalendarDay(null);
            },
            style: {
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '4px'
            }
          }, /*#__PURE__*/React.createElement("svg", {
            width: "20",
            height: "20",
            viewBox: "0 0 24 24",
            fill: "none",
            stroke: "#058585",
            strokeWidth: "2",
            strokeLinecap: "round",
            strokeLinejoin: "round"
          }, /*#__PURE__*/React.createElement("polyline", {
            points: "9 18 15 12 9 6"
          }))));
        })(), /*#__PURE__*/React.createElement("button", {
          onClick: () => {
            data.triggerHaptic('light');
            const today = new Date();
            handlers.setCalendarCurrentMonth(today);
            handlers.setCalendarCurrentWeek(today);
            handlers.handlers.setSelectedCalendarDay(null);
          },
          style: {
            width: '100%',
            marginTop: '12px',
            padding: '10px',
            borderRadius: '8px',
            border: '1px solid #058585',
            background: '#FFFFFF',
            color: '#058585',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }
        }, /*#__PURE__*/React.createElement("i", {
          "data-lucide": "calendar-check",
          style: {
            width: '16px',
            height: '16px'
          }
        }), "Jump to Today"), /*#__PURE__*/React.createElement("div", {
          style: {
            marginTop: '15px',
            padding: '15px',
            background: '#F8F9FA',
            borderRadius: '8px',
            border: '1px solid #E5E5E5'
          }
        }, /*#__PURE__*/React.createElement("div", {
          style: {
            fontSize: '13px',
            fontWeight: '600',
            color: '#000000',
            marginBottom: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }
        }, /*#__PURE__*/React.createElement("i", {
          "data-lucide": "info",
          style: {
            width: '16px',
            height: '16px',
            color: '#058585'
          }
        }), "Daily Check-In Status"), /*#__PURE__*/React.createElement("div", {
          style: {
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }
        }, /*#__PURE__*/React.createElement("div", {
          style: {
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }
        }, /*#__PURE__*/React.createElement("div", {
          style: {
            width: '20px',
            height: '20px',
            borderRadius: '4px',
            background: '#00A86B',
            flexShrink: 0
          }
        }), /*#__PURE__*/React.createElement("span", {
          style: {
            fontSize: '12px',
            color: '#666666'
          }
        }, "Morning & Evening Check-Ins Completed")), /*#__PURE__*/React.createElement("div", {
          style: {
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }
        }, /*#__PURE__*/React.createElement("div", {
          style: {
            width: '20px',
            height: '20px',
            borderRadius: '4px',
            background: '#7FD4AA',
            flexShrink: 0
          }
        }), /*#__PURE__*/React.createElement("span", {
          style: {
            fontSize: '12px',
            color: '#666666'
          }
        }, "Only Morning OR Evening Completed")), /*#__PURE__*/React.createElement("div", {
          style: {
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }
        }, /*#__PURE__*/React.createElement("div", {
          style: {
            width: '20px',
            height: '20px',
            borderRadius: '4px',
            background: '#E5E5E5',
            flexShrink: 0
          }
        }), /*#__PURE__*/React.createElement("span", {
          style: {
            fontSize: '12px',
            color: '#666666'
          }
        }, "No Check-Ins Completed"))))), /*#__PURE__*/React.createElement("div", {
          style: {
            padding: '20px'
          }
        }, (() => {
          // Get user's timezone
          const userTimezone = user.timezone || "America/Los_Angeles";

          // Helper function to get color based on check-in count
          const getColorForCount = count => {
            if (count >= 2) return '#00A86B'; // Dark green - both check-ins
            if (count === 1) return '#7FD4AA'; // Light green - one check-in
            return '#E5E5E5'; // Gray - no check-in
          };

          // Generate calendar data for the selected view mode
          if (data.calendarViewMode === 'month') {
            // Month view - Calendar grid for current month
            const year = calendarCurrentMonth.getFullYear();
            const month = calendarCurrentMonth.getMonth();

            // Get first day of month and how many days in month
            const firstDayOfMonth = new Date(year, month, 1);
            const lastDayOfMonth = new Date(year, month + 1, 0);
            const daysInMonth = lastDayOfMonth.getDate();
            const startingDayOfWeek = firstDayOfMonth.getDay(); // 0 = Sunday

            // Build calendar grid
            const calendarDays = [];

            // Add empty cells for days before month starts
            for (let i = 0; i < startingDayOfWeek; i++) {
              calendarDays.push(null);
            }

            // Add all days in month
            for (let day = 1; day <= daysInMonth; day++) {
              const date = new Date(year, month, day);
              const dateKey = date.toISOString().split('T')[0];
              const dayData = calendarHeatmapData.find(d => d.dateKey === dateKey);
              calendarDays.push({
                date: date,
                dateKey: dateKey,
                day: day,
                count: dayData ? dayData.count : 0,
                data: dayData
              });
            }

            // Group into weeks
            const weeks = [];
            for (let i = 0; i < calendarDays.length; i += 7) {
              weeks.push(calendarDays.slice(i, i + 7));
            }
            return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
              style: {
                display: 'grid',
                gridTemplateColumns: 'repeat(7, 1fr)',
                gap: '8px',
                marginBottom: '12px',
                paddingBottom: '8px',
                borderBottom: '2px solid #E5E5E5'
              }
            }, ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, i) => /*#__PURE__*/React.createElement("div", {
              key: i,
              style: {
                fontSize: '12px',
                fontWeight: '600',
                color: '#666666',
                textAlign: 'center'
              }
            }, day))), /*#__PURE__*/React.createElement("div", {
              style: {
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }
            }, weeks.map((week, weekIndex) => /*#__PURE__*/React.createElement("div", {
              key: weekIndex,
              style: {
                display: 'grid',
                gridTemplateColumns: 'repeat(7, 1fr)',
                gap: '8px'
              }
            }, week.map((day, dayIndex) => {
              if (!day) {
                return /*#__PURE__*/React.createElement("div", {
                  key: dayIndex,
                  style: {
                    aspectRatio: '1'
                  }
                });
              }
              const isToday = day.dateKey === new Date().toISOString().split('T')[0];
              const isSelected = selectedCalendarDay?.dateKey === day.dateKey;
              return /*#__PURE__*/React.createElement("div", {
                key: dayIndex,
                onClick: () => {
                  if (day.data) {
                    data.triggerHaptic('light');
                    handlers.setSelectedCalendarDay(day);
                  }
                },
                style: {
                  aspectRatio: '1',
                  borderRadius: '8px',
                  background: getColorForCount(day.count),
                  border: isToday ? '3px solid #FF8C00' : isSelected ? '3px solid #058585' : '1px solid #DDD',
                  cursor: day.data ? 'pointer' : 'default',
                  transition: 'all 0.2s',
                  transform: isSelected ? 'scale(1.05)' : 'scale(1)',
                  boxShadow: isSelected ? '0 4px 12px rgba(5, 133, 133, 0.3)' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative'
                }
              }, /*#__PURE__*/React.createElement("span", {
                style: {
                  fontSize: '14px',
                  fontWeight: isToday ? '700' : '500',
                  color: day.count > 0 ? '#FFFFFF' : '#999999'
                }
              }, day.day), day.data && /*#__PURE__*/React.createElement("div", {
                style: {
                  position: 'absolute',
                  bottom: '4px',
                  display: 'flex',
                  gap: '2px'
                }
              }, day.data.morningCheckIn && /*#__PURE__*/React.createElement("div", {
                style: {
                  width: '4px',
                  height: '4px',
                  borderRadius: '50%',
                  background: '#FFFFFF'
                }
              }), day.data.eveningCheckIn && /*#__PURE__*/React.createElement("div", {
                style: {
                  width: '4px',
                  height: '4px',
                  borderRadius: '50%',
                  background: '#FFFFFF'
                }
              })));
            })))), selectedCalendarDay && selectedCalendarDay.data && /*#__PURE__*/React.createElement("div", {
              style: {
                marginTop: '20px',
                padding: '20px',
                background: 'linear-gradient(135deg, rgba(5, 133, 133, 0.05) 0%, rgba(5, 133, 133, 0.1) 100%)',
                borderRadius: '12px',
                border: '2px solid #058585',
                animation: 'fadeIn 0.3s'
              }
            }, /*#__PURE__*/React.createElement("div", {
              style: {
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '16px'
              }
            }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
              style: {
                fontSize: '18px',
                fontWeight: '600',
                color: '#000000',
                marginBottom: '4px'
              }
            }, selectedCalendarDay.date.toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
              year: 'numeric'
            })), /*#__PURE__*/React.createElement("div", {
              style: {
                fontSize: '13px',
                color: '#666666',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }
            }, /*#__PURE__*/React.createElement("i", {
              "data-lucide": "check-circle",
              style: {
                width: '14px',
                height: '14px',
                color: '#00A86B'
              }
            }), selectedCalendarDay.count, " check-in", selectedCalendarDay.count !== 1 ? 's' : '', " completed")), /*#__PURE__*/React.createElement("button", {
              onClick: () => handlers.handlers.setSelectedCalendarDay(null),
              style: {
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '4px'
              }
            }, /*#__PURE__*/React.createElement("i", {
              "data-lucide": "x",
              style: {
                width: '18px',
                height: '18px',
                color: '#666666'
              }
            }))), selectedCalendarDay.data.morningCheckIn && /*#__PURE__*/React.createElement("div", {
              style: {
                marginBottom: selectedCalendarDay.data.eveningCheckIn ? '16px' : '0',
                padding: '15px',
                background: '#FFFFFF',
                borderRadius: '8px',
                border: '1px solid #E5E5E5'
              }
            }, /*#__PURE__*/React.createElement("div", {
              style: {
                fontSize: '14px',
                fontWeight: '600',
                color: '#058585',
                marginBottom: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }
            }, /*#__PURE__*/React.createElement("i", {
              "data-lucide": "sunrise",
              style: {
                width: '16px',
                height: '16px'
              }
            }), "Morning Check-In"), /*#__PURE__*/React.createElement("div", {
              style: {
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '12px'
              }
            }, /*#__PURE__*/React.createElement("div", {
              style: {
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }
            }, /*#__PURE__*/React.createElement("i", {
              "data-lucide": "smile",
              style: {
                width: '16px',
                height: '16px',
                color: '#666666'
              }
            }), /*#__PURE__*/React.createElement("span", {
              style: {
                fontSize: '13px',
                color: '#666666'
              }
            }, "Mood: ", /*#__PURE__*/React.createElement("strong", {
              style: {
                color: '#000000'
              }
            }, selectedCalendarDay.data.morningCheckIn.mood ?? 'N/A'))), /*#__PURE__*/React.createElement("div", {
              style: {
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }
            }, /*#__PURE__*/React.createElement("i", {
              "data-lucide": "flame",
              style: {
                width: '16px',
                height: '16px',
                color: '#666666'
              }
            }), /*#__PURE__*/React.createElement("span", {
              style: {
                fontSize: '13px',
                color: '#666666'
              }
            }, "Craving: ", /*#__PURE__*/React.createElement("strong", {
              style: {
                color: '#000000'
              }
            }, selectedCalendarDay.data.morningCheckIn.craving ?? 'N/A'))), /*#__PURE__*/React.createElement("div", {
              style: {
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }
            }, /*#__PURE__*/React.createElement("i", {
              "data-lucide": "alert-circle",
              style: {
                width: '16px',
                height: '16px',
                color: '#666666'
              }
            }), /*#__PURE__*/React.createElement("span", {
              style: {
                fontSize: '13px',
                color: '#666666'
              }
            }, "Anxiety: ", /*#__PURE__*/React.createElement("strong", {
              style: {
                color: '#000000'
              }
            }, selectedCalendarDay.data.morningCheckIn.anxiety ?? 'N/A'))), /*#__PURE__*/React.createElement("div", {
              style: {
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }
            }, /*#__PURE__*/React.createElement("i", {
              "data-lucide": "moon",
              style: {
                width: '16px',
                height: '16px',
                color: '#666666'
              }
            }), /*#__PURE__*/React.createElement("span", {
              style: {
                fontSize: '13px',
                color: '#666666'
              }
            }, "Sleep: ", /*#__PURE__*/React.createElement("strong", {
              style: {
                color: '#000000'
              }
            }, selectedCalendarDay.data.morningCheckIn.sleep ?? 'N/A'))))), selectedCalendarDay.data.eveningCheckIn && /*#__PURE__*/React.createElement("div", {
              style: {
                padding: '15px',
                background: '#FFFFFF',
                borderRadius: '8px',
                border: '1px solid #E5E5E5'
              }
            }, /*#__PURE__*/React.createElement("div", {
              style: {
                fontSize: '14px',
                fontWeight: '600',
                color: '#058585',
                marginBottom: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }
            }, /*#__PURE__*/React.createElement("i", {
              "data-lucide": "sunset",
              style: {
                width: '16px',
                height: '16px'
              }
            }), "Evening Check-In"), /*#__PURE__*/React.createElement("div", {
              style: {
                fontSize: '13px',
                color: '#666666',
                lineHeight: '1.6'
              }
            }, selectedCalendarDay.data.eveningCheckIn.overallDay !== undefined && /*#__PURE__*/React.createElement("div", {
              style: {
                marginBottom: '8px'
              }
            }, /*#__PURE__*/React.createElement("strong", null, "Overall Day:"), " ", selectedCalendarDay.data.eveningCheckIn.overallDay, "/10"), selectedCalendarDay.data.eveningCheckIn.gratitude && /*#__PURE__*/React.createElement("div", {
              style: {
                marginBottom: '8px'
              }
            }, /*#__PURE__*/React.createElement("strong", null, "Gratitude:"), " ", selectedCalendarDay.data.eveningCheckIn.gratitude), selectedCalendarDay.data.eveningCheckIn.challenges && /*#__PURE__*/React.createElement("div", {
              style: {
                marginBottom: '8px'
              }
            }, /*#__PURE__*/React.createElement("strong", null, "Challenges:"), " ", selectedCalendarDay.data.eveningCheckIn.challenges), selectedCalendarDay.data.eveningCheckIn.tomorrowGoal && /*#__PURE__*/React.createElement("div", {
              style: {
                marginBottom: '8px'
              }
            }, /*#__PURE__*/React.createElement("strong", null, "Tomorrow's Goal:"), " ", selectedCalendarDay.data.eveningCheckIn.tomorrowGoal), selectedCalendarDay.data.eveningCheckIn.promptResponse && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("strong", null, "Reflection:"), " ", selectedCalendarDay.data.eveningCheckIn.promptResponse)))));
          } else {
            // Week view - Monday to Sunday
            // Get Monday as start of week (ISO 8601 standard)
            const getMonday = d => {
              const date = new Date(d);
              const day = date.getDay();
              const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
              return new Date(date.setDate(diff));
            };
            const monday = getMonday(calendarCurrentWeek);

            // Generate 7 days for the week (Monday to Sunday)
            const weekDays = [];
            for (let i = 0; i < 7; i++) {
              const date = new Date(monday);
              date.setDate(monday.getDate() + i);

              // Create dateKey the same way we do in loadCalendarHeatmapData
              const year = date.getFullYear();
              const month = String(date.getMonth() + 1).padStart(2, '0');
              const day = String(date.getDate()).padStart(2, '0');
              const dateKey = `${year}-${month}-${day}`;
              const dayData = calendarHeatmapData.find(d => d.dateKey === dateKey);
              weekDays.push({
                date: date,
                dateKey: dateKey,
                day: date.getDate(),
                dayName: date.toLocaleDateString('en-US', {
                  weekday: 'short'
                }),
                count: dayData ? dayData.count : 0,
                data: dayData
              });
            }
            return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
              style: {
                padding: '15px',
                background: 'linear-gradient(135deg, rgba(5, 133, 133, 0.05) 0%, rgba(5, 133, 133, 0.1) 100%)',
                borderRadius: '12px',
                marginBottom: '20px',
                border: '1px solid rgba(5, 133, 133, 0.2)'
              }
            }, /*#__PURE__*/React.createElement("div", {
              style: {
                fontSize: '14px',
                fontWeight: '600',
                color: '#000000',
                marginBottom: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }
            }, /*#__PURE__*/React.createElement("i", {
              "data-lucide": "calendar-days",
              style: {
                width: '16px',
                height: '16px',
                color: '#058585'
              }
            }), weekDays[0].date.toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric'
            }), " - ", weekDays[6].date.toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric'
            })), /*#__PURE__*/React.createElement("div", {
              style: {
                fontSize: '13px',
                color: '#666666'
              }
            }, (() => {
              // Calculate how many days to count based on current week
              const today = new Date();
              const todayDateKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

              // Check if today falls within this week
              const isCurrentWeek = weekDays.some(d => d.dateKey === todayDateKey);
              let totalDays = 7;
              if (isCurrentWeek) {
                // Find which day of the week today is (0 = Monday, 6 = Sunday)
                const todayIndex = weekDays.findIndex(d => d.dateKey === todayDateKey);
                totalDays = todayIndex + 1; // +1 because index is 0-based
              }
              const daysWithCheckIns = weekDays.slice(0, totalDays).filter(d => d.count > 0).length;
              return `${daysWithCheckIns} out of ${totalDays} days with check-ins`;
            })())), /*#__PURE__*/React.createElement("div", {
              style: {
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }
            }, weekDays.map((day, dayIndex) => {
              const isToday = day.dateKey === new Date().toISOString().split('T')[0];
              const isSelected = selectedCalendarDay?.dateKey === day.dateKey;
              return /*#__PURE__*/React.createElement("div", {
                key: dayIndex,
                onClick: () => {
                  if (day.data) {
                    data.triggerHaptic('light');
                    handlers.setSelectedCalendarDay(day);
                  }
                },
                style: {
                  padding: '16px',
                  borderRadius: '12px',
                  background: getColorForCount(day.count),
                  border: isToday ? '3px solid #FF8C00' : isSelected ? '3px solid #058585' : '2px solid #E5E5E5',
                  cursor: day.data ? 'pointer' : 'default',
                  transition: 'all 0.2s',
                  transform: isSelected ? 'scale(1.02)' : 'scale(1)',
                  boxShadow: isSelected ? '0 4px 12px rgba(5, 133, 133, 0.3)' : '0 2px 4px rgba(0,0,0,0.05)'
                }
              }, /*#__PURE__*/React.createElement("div", {
                style: {
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }
              }, /*#__PURE__*/React.createElement("div", {
                style: {
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }
              }, /*#__PURE__*/React.createElement("div", {
                style: {
                  width: '48px',
                  height: '48px',
                  borderRadius: '8px',
                  background: day.count > 0 ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.05)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid rgba(255,255,255,0.5)'
                }
              }, /*#__PURE__*/React.createElement("div", {
                style: {
                  fontSize: '11px',
                  fontWeight: '600',
                  color: day.count > 0 ? '#FFFFFF' : '#999999'
                }
              }, day.dayName.toUpperCase()), /*#__PURE__*/React.createElement("div", {
                style: {
                  fontSize: '18px',
                  fontWeight: '700',
                  color: day.count > 0 ? '#FFFFFF' : '#999999'
                }
              }, day.day)), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
                style: {
                  fontSize: '15px',
                  fontWeight: '600',
                  color: day.count > 0 ? '#FFFFFF' : '#000000',
                  marginBottom: '4px'
                }
              }, isToday && /*#__PURE__*/React.createElement("span", {
                style: {
                  marginRight: '6px'
                }
              }, "(Today)"), day.date.toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric'
              })), /*#__PURE__*/React.createElement("div", {
                style: {
                  fontSize: '13px',
                  color: day.count > 0 ? 'rgba(255,255,255,0.9)' : '#666666',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }
              }, day.count === 0 && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("i", {
                "data-lucide": "x-circle",
                style: {
                  width: '14px',
                  height: '14px'
                }
              }), "No check-ins"), day.count === 1 && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("i", {
                "data-lucide": "check",
                style: {
                  width: '14px',
                  height: '14px'
                }
              }), "1 check-in completed"), day.count === 2 && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("i", {
                "data-lucide": "check-check",
                style: {
                  width: '14px',
                  height: '14px'
                }
              }), "Both check-ins completed")))), day.data && /*#__PURE__*/React.createElement("div", {
                style: {
                  display: 'flex',
                  gap: '8px'
                }
              }, day.data.morningCheckIn && /*#__PURE__*/React.createElement("div", {
                style: {
                  padding: '4px 8px',
                  borderRadius: '6px',
                  background: 'rgba(255,255,255,0.3)',
                  fontSize: '11px',
                  fontWeight: '600',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }
              }, /*#__PURE__*/React.createElement("i", {
                "data-lucide": "sunrise",
                style: {
                  width: '12px',
                  height: '12px'
                }
              }), "AM"), day.data.eveningCheckIn && /*#__PURE__*/React.createElement("div", {
                style: {
                  padding: '4px 8px',
                  borderRadius: '6px',
                  background: 'rgba(255,255,255,0.3)',
                  fontSize: '11px',
                  fontWeight: '600',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }
              }, /*#__PURE__*/React.createElement("i", {
                "data-lucide": "sunset",
                style: {
                  width: '12px',
                  height: '12px'
                }
              }), "PM"))), isSelected && day.data && /*#__PURE__*/React.createElement("div", {
                style: {
                  marginTop: '16px',
                  paddingTop: '16px',
                  borderTop: '1px solid rgba(255,255,255,0.3)'
                }
              }, day.data.morningCheckIn && /*#__PURE__*/React.createElement("div", {
                style: {
                  marginBottom: day.data.eveningCheckIn ? '12px' : '0',
                  padding: '12px',
                  background: 'rgba(255,255,255,0.2)',
                  borderRadius: '8px'
                }
              }, /*#__PURE__*/React.createElement("div", {
                style: {
                  fontSize: '13px',
                  fontWeight: '600',
                  color: '#FFFFFF',
                  marginBottom: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }
              }, /*#__PURE__*/React.createElement("i", {
                "data-lucide": "sunrise",
                style: {
                  width: '14px',
                  height: '14px'
                }
              }), "Morning Check-In"), /*#__PURE__*/React.createElement("div", {
                style: {
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '8px',
                  fontSize: '12px',
                  color: 'rgba(255,255,255,0.9)'
                }
              }, /*#__PURE__*/React.createElement("div", {
                style: {
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }
              }, /*#__PURE__*/React.createElement("i", {
                "data-lucide": "smile",
                style: {
                  width: '12px',
                  height: '12px'
                }
              }), "Mood: ", /*#__PURE__*/React.createElement("strong", null, day.data.morningCheckIn.mood ?? 'N/A')), /*#__PURE__*/React.createElement("div", {
                style: {
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }
              }, /*#__PURE__*/React.createElement("i", {
                "data-lucide": "flame",
                style: {
                  width: '12px',
                  height: '12px'
                }
              }), "Craving: ", /*#__PURE__*/React.createElement("strong", null, day.data.morningCheckIn.craving ?? 'N/A')), /*#__PURE__*/React.createElement("div", {
                style: {
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }
              }, /*#__PURE__*/React.createElement("i", {
                "data-lucide": "alert-circle",
                style: {
                  width: '12px',
                  height: '12px'
                }
              }), "Anxiety: ", /*#__PURE__*/React.createElement("strong", null, day.data.morningCheckIn.anxiety ?? 'N/A')), /*#__PURE__*/React.createElement("div", {
                style: {
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }
              }, /*#__PURE__*/React.createElement("i", {
                "data-lucide": "moon",
                style: {
                  width: '12px',
                  height: '12px'
                }
              }), "Sleep: ", /*#__PURE__*/React.createElement("strong", null, day.data.morningCheckIn.sleep ?? 'N/A')))), day.data.eveningCheckIn && /*#__PURE__*/React.createElement("div", {
                style: {
                  padding: '12px',
                  background: 'rgba(255,255,255,0.2)',
                  borderRadius: '8px'
                }
              }, /*#__PURE__*/React.createElement("div", {
                style: {
                  fontSize: '13px',
                  fontWeight: '600',
                  color: '#FFFFFF',
                  marginBottom: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }
              }, /*#__PURE__*/React.createElement("i", {
                "data-lucide": "sunset",
                style: {
                  width: '14px',
                  height: '14px'
                }
              }), "Evening Check-In"), /*#__PURE__*/React.createElement("div", {
                style: {
                  fontSize: '12px',
                  color: 'rgba(255,255,255,0.9)',
                  lineHeight: '1.5'
                }
              }, day.data.eveningCheckIn.overallDay !== undefined && /*#__PURE__*/React.createElement("div", {
                style: {
                  marginBottom: '6px'
                }
              }, /*#__PURE__*/React.createElement("strong", null, "Overall Day:"), " ", day.data.eveningCheckIn.overallDay, "/10"), day.data.eveningCheckIn.gratitude && /*#__PURE__*/React.createElement("div", {
                style: {
                  marginBottom: '6px'
                }
              }, /*#__PURE__*/React.createElement("strong", null, "Gratitude:"), " ", day.data.eveningCheckIn.gratitude), day.data.eveningCheckIn.challenges && /*#__PURE__*/React.createElement("div", {
                style: {
                  marginBottom: '6px'
                }
              }, /*#__PURE__*/React.createElement("strong", null, "Challenges:"), " ", day.data.eveningCheckIn.challenges), day.data.eveningCheckIn.tomorrowGoal && /*#__PURE__*/React.createElement("div", {
                style: {
                  marginBottom: '6px'
                }
              }, /*#__PURE__*/React.createElement("strong", null, "Tomorrow's Goal:"), " ", day.data.eveningCheckIn.tomorrowGoal), day.data.eveningCheckIn.promptResponse && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("strong", null, "Reflection:"), " ", day.data.eveningCheckIn.promptResponse)))));
            })));
          }
        })())));
      case 'reflectionStreak':
        return /*#__PURE__*/React.createElement("div", {
          style: {
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
          },
          onClick: () => onClose()
        }, /*#__PURE__*/React.createElement("div", {
          style: {
            background: '#FFFFFF',
            borderRadius: '15px',
            maxWidth: '400px',
            width: '100%',
            maxHeight: '80vh',
            overflow: 'auto'
          },
          onClick: e => e.stopPropagation()
        }, /*#__PURE__*/React.createElement("div", {
          style: {
            padding: '20px',
            borderBottom: '1px solid #E5E5E5'
          }
        }, /*#__PURE__*/React.createElement("div", {
          style: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }
        }, /*#__PURE__*/React.createElement("h3", {
          style: {
            margin: 0,
            fontSize: '18px',
            fontWeight: '400',
            color: '#000000'
          }
        }, "Reflection Streak"), /*#__PURE__*/React.createElement("button", {
          onClick: () => onClose(),
          style: {
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '4px'
          }
        }, /*#__PURE__*/React.createElement("i", {
          "data-lucide": "x",
          style: {
            width: '20px',
            height: '20px',
            color: '#666666'
          }
        })))), /*#__PURE__*/React.createElement("div", {
          style: {
            padding: '20px'
          }
        }, /*#__PURE__*/React.createElement("button", {
          onClick: () => onClose(),
          style: {
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'none',
            border: 'none',
            color: '#058585',
            fontSize: '14px',
            fontWeight: '400',
            cursor: 'pointer',
            marginBottom: '16px',
            padding: 0
          }
        }, /*#__PURE__*/React.createElement("i", {
          "data-lucide": "arrow-left",
          style: {
            width: '20px',
            height: '20px'
          }
        }), "Back to Reflections"), /*#__PURE__*/React.createElement("div", {
          style: {
            background: '#E0F7FA',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '20px',
            textAlign: 'center'
          }
        }, /*#__PURE__*/React.createElement("div", {
          style: {
            fontSize: '32px',
            fontWeight: 'bold',
            color: '#058585',
            marginBottom: '4px'
          }
        }, data.reflectionStreak, " ", reflectionStreak === 1 ? 'Day' : 'Days'), /*#__PURE__*/React.createElement("div", {
          style: {
            fontSize: '14px',
            fontWeight: '400',
            color: '#666666'
          }
        }, "Current Streak")), /*#__PURE__*/React.createElement("div", {
          style: {
            fontSize: '14px',
            fontWeight: '400',
            color: '#000000',
            marginBottom: '12px'
          }
        }, "All Reflections in Streak"), /*#__PURE__*/React.createElement("div", {
          style: {
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }
        }, data.streakReflections.length > 0 ? data.streakReflections.map((reflection, index) => {
          const reflectionDate = reflection.createdAt?.toDate ? reflection.createdAt.toDate() : new Date(reflection.createdAt);
          const dateStr = reflectionDate.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
          });
          const overallDay = reflection.overallDay ?? reflection.dailyScore ?? 'N/A';
          const hasGratitude = reflection.gratitude && reflection.gratitude.length > 0;

          // Score color coding
          const scoreColor = overallDay >= 8 ? '#4CAF50' : overallDay >= 6 ? '#FFA726' : overallDay >= 4 ? '#FF7043' : overallDay !== 'N/A' ? '#DC143C' : '#999999';
          return /*#__PURE__*/React.createElement("div", {
            key: reflection.id,
            style: {
              background: '#FFFFFF',
              border: '1px solid #E5E5E5',
              borderRadius: '8px',
              padding: '12px'
            }
          }, /*#__PURE__*/React.createElement("div", {
            style: {
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '8px'
            }
          }, /*#__PURE__*/React.createElement("div", {
            style: {
              fontSize: '14px',
              fontWeight: 'bold',
              color: '#000000'
            }
          }, "Day ", data.streakReflections.length - index, " - ", dateStr), hasGratitude && /*#__PURE__*/React.createElement("i", {
            "data-lucide": "heart",
            style: {
              width: '16px',
              height: '16px',
              color: '#FF6B6B'
            }
          })), /*#__PURE__*/React.createElement("div", {
            style: {
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }
          }, /*#__PURE__*/React.createElement("i", {
            "data-lucide": "smile",
            style: {
              width: '16px',
              height: '16px',
              color: scoreColor
            }
          }), /*#__PURE__*/React.createElement("div", {
            style: {
              fontSize: '12px',
              fontWeight: 'bold',
              color: scoreColor
            }
          }, "Overall Day Score: ", overallDay, overallDay !== 'N/A' ? '/10' : '')));
        }) : /*#__PURE__*/React.createElement("div", {
          style: {
            padding: '20px',
            textAlign: 'center',
            color: '#999999',
            fontSize: '14px'
          }
        }, "No reflections in streak yet. Start reflecting daily to build your streak!")))));
      case 'moodInsights':
        return /*#__PURE__*/React.createElement("div", {
          style: {
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
          },
          onClick: () => onClose()
        }, /*#__PURE__*/React.createElement("div", {
          style: {
            background: '#FFFFFF',
            borderRadius: '15px',
            maxWidth: '500px',
            width: '100%',
            maxHeight: '80vh',
            overflow: 'auto'
          },
          onClick: e => e.stopPropagation()
        }, /*#__PURE__*/React.createElement("div", {
          style: {
            padding: '20px',
            borderBottom: '1px solid #E5E5E5'
          }
        }, /*#__PURE__*/React.createElement("div", {
          style: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }
        }, /*#__PURE__*/React.createElement("h3", {
          style: {
            margin: 0,
            fontSize: '18px',
            fontWeight: '400',
            color: '#000000'
          }
        }, "Mood Insights"), /*#__PURE__*/React.createElement("button", {
          onClick: () => onClose(),
          style: {
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '4px'
          }
        }, /*#__PURE__*/React.createElement("i", {
          "data-lucide": "x",
          style: {
            width: '20px',
            height: '20px',
            color: '#666666'
          }
        })))), /*#__PURE__*/React.createElement("div", {
          style: {
            padding: '20px'
          }
        }, /*#__PURE__*/React.createElement("div", {
          style: {
            textAlign: 'center',
            marginBottom: '24px'
          }
        }, /*#__PURE__*/React.createElement("div", {
          style: {
            fontSize: '14px',
            fontWeight: '400',
            color: '#666666',
            marginBottom: '8px'
          }
        }, "7-Day Average"), /*#__PURE__*/React.createElement("div", {
          style: {
            fontSize: '48px',
            fontWeight: 'bold',
            color: '#058585',
            marginBottom: '4px'
          }
        }, data.moodWeekData.thisWeekAvg || '—'), /*#__PURE__*/React.createElement("div", {
          style: {
            fontSize: '14px',
            fontWeight: '400',
            color: moodWeekData.difference > 0 ? '#00A86B' : moodWeekData.difference < 0 ? '#DC143C' : '#666666'
          }
        }, data.moodWeekData.difference > 0 ? '↑' : moodWeekData.difference < 0 ? '↓' : '—', " ", data.moodWeekData.difference > 0 ? '+' : '', data.moodWeekData.difference || '0', " from last week")), /*#__PURE__*/React.createElement("h4", {
          style: {
            fontSize: '16px',
            fontWeight: '400',
            color: '#000000',
            marginBottom: '12px'
          }
        }, "Weekly Breakdown"), /*#__PURE__*/React.createElement("div", {
          style: {
            marginBottom: '20px'
          }
        }, data.moodWeekData.weekData && moodWeekData.weekData.map((dayData, index) => {
          const score = dayData.mood;
          const barWidth = score ? score / 10 * 100 : 0; // Out of 10, not 5!

          return /*#__PURE__*/React.createElement("div", {
            key: dayData.dateKey,
            style: {
              marginBottom: '12px'
            }
          }, /*#__PURE__*/React.createElement("div", {
            style: {
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '4px'
            }
          }, /*#__PURE__*/React.createElement("span", {
            style: {
              fontSize: '14px',
              fontWeight: '400',
              color: '#000000'
            }
          }, dayData.dayName), /*#__PURE__*/React.createElement("span", {
            style: {
              fontSize: '14px',
              fontWeight: 'bold',
              color: score ? '#058585' : '#999999'
            }
          }, score ? score.toFixed(1) : 'No check-in')), /*#__PURE__*/React.createElement("div", {
            style: {
              width: '100%',
              height: '8px',
              background: '#E5E5E5',
              borderRadius: '4px',
              overflow: 'hidden'
            }
          }, /*#__PURE__*/React.createElement("div", {
            style: {
              width: `${barWidth}%`,
              height: '100%',
              background: score >= 7 ? '#00A86B' : score >= 5 ? '#FFA500' : score ? '#DC143C' : '#E5E5E5',
              transition: 'width 0.3s'
            }
          })));
        })), /*#__PURE__*/React.createElement("button", {
          onClick: () => {
            data.triggerHaptic('light');
            onClose();
          },
          style: {
            width: '100%',
            height: '48px',
            background: '#058585',
            border: 'none',
            borderRadius: '8px',
            color: '#FFFFFF',
            fontSize: '14px',
            fontWeight: '400',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }
        }, "Back"))));
      case 'overallDayInsights':
        return /*#__PURE__*/React.createElement("div", {
          style: {
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
          },
          onClick: () => onClose()
        }, /*#__PURE__*/React.createElement("div", {
          style: {
            background: '#FFFFFF',
            borderRadius: '15px',
            maxWidth: '500px',
            width: '100%',
            maxHeight: '80vh',
            overflow: 'auto'
          },
          onClick: e => e.stopPropagation()
        }, /*#__PURE__*/React.createElement("div", {
          style: {
            padding: '20px',
            borderBottom: '1px solid #E5E5E5'
          }
        }, /*#__PURE__*/React.createElement("div", {
          style: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }
        }, /*#__PURE__*/React.createElement("h3", {
          style: {
            margin: 0,
            fontSize: '18px',
            fontWeight: '400',
            color: '#000000'
          }
        }, "Overall Day Insights"), /*#__PURE__*/React.createElement("button", {
          onClick: () => onClose(),
          style: {
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '4px'
          }
        }, /*#__PURE__*/React.createElement("i", {
          "data-lucide": "x",
          style: {
            width: '20px',
            height: '20px',
            color: '#666666'
          }
        })))), /*#__PURE__*/React.createElement("div", {
          style: {
            padding: '20px'
          }
        }, /*#__PURE__*/React.createElement("div", {
          style: {
            textAlign: 'center',
            marginBottom: '24px'
          }
        }, /*#__PURE__*/React.createElement("div", {
          style: {
            fontSize: '14px',
            fontWeight: '400',
            color: '#666666',
            marginBottom: '8px'
          }
        }, "7-Day Average"), /*#__PURE__*/React.createElement("div", {
          style: {
            fontSize: '48px',
            fontWeight: 'bold',
            color: '#058585',
            marginBottom: '4px'
          }
        }, data.overallDayWeekData.thisWeekAvg || '—'), /*#__PURE__*/React.createElement("div", {
          style: {
            fontSize: '14px',
            fontWeight: '400',
            color: overallDayWeekData.difference > 0 ? '#00A86B' : overallDayWeekData.difference < 0 ? '#DC143C' : '#666666'
          }
        }, data.overallDayWeekData.difference > 0 ? '↑' : overallDayWeekData.difference < 0 ? '↓' : '—', " ", data.overallDayWeekData.difference > 0 ? '+' : '', data.overallDayWeekData.difference || '0', " from last week")), /*#__PURE__*/React.createElement("h4", {
          style: {
            fontSize: '16px',
            fontWeight: '400',
            color: '#000000',
            marginBottom: '12px'
          }
        }, "Last 7 Reflections"), /*#__PURE__*/React.createElement("div", {
          style: {
            marginBottom: '20px'
          }
        }, data.overallDayWeekData.weekData && overallDayWeekData.weekData.map((dayData, index) => {
          const score = dayData.overallDay;
          const barWidth = score ? score / 10 * 100 : 0; // Out of 10

          return /*#__PURE__*/React.createElement("div", {
            key: dayData.dateKey,
            style: {
              marginBottom: '12px'
            }
          }, /*#__PURE__*/React.createElement("div", {
            style: {
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '4px'
            }
          }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
            style: {
              fontSize: '14px',
              fontWeight: '600',
              color: '#000000'
            }
          }, dayData.dayName), /*#__PURE__*/React.createElement("div", {
            style: {
              fontSize: '12px',
              color: '#666666'
            }
          }, dayData.date ? new Date(dayData.date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
          }) : '')), /*#__PURE__*/React.createElement("span", {
            style: {
              fontSize: '16px',
              fontWeight: 'bold',
              color: '#058585'
            }
          }, score ? score.toFixed(1) : '—')), /*#__PURE__*/React.createElement("div", {
            style: {
              width: '100%',
              height: '8px',
              background: '#E5E5E5',
              borderRadius: '4px',
              overflow: 'hidden'
            }
          }, /*#__PURE__*/React.createElement("div", {
            style: {
              width: `${barWidth}%`,
              height: '100%',
              background: score >= 7 ? '#00A86B' : score >= 5 ? '#FFA500' : score ? '#DC143C' : '#E5E5E5',
              transition: 'width 0.3s'
            }
          })));
        })), /*#__PURE__*/React.createElement("button", {
          onClick: () => {
            data.triggerHaptic('light');
            onClose();
          },
          style: {
            width: '100%',
            height: '48px',
            background: '#058585',
            border: 'none',
            borderRadius: '8px',
            color: '#FFFFFF',
            fontSize: '14px',
            fontWeight: '400',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }
        }, "Back"))));
      case 'gratitudeThemes':
        return /*#__PURE__*/React.createElement("div", {
          style: {
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
          },
          onClick: () => onClose()
        }, /*#__PURE__*/React.createElement("div", {
          style: {
            background: '#FFFFFF',
            borderRadius: '15px',
            maxWidth: '500px',
            width: '100%',
            maxHeight: '80vh',
            overflow: 'auto'
          },
          onClick: e => e.stopPropagation()
        }, /*#__PURE__*/React.createElement("div", {
          style: {
            padding: '20px',
            borderBottom: '1px solid #E5E5E5'
          }
        }, /*#__PURE__*/React.createElement("div", {
          style: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }
        }, /*#__PURE__*/React.createElement("h3", {
          style: {
            margin: 0,
            fontSize: '18px',
            fontWeight: '400',
            color: '#000000'
          }
        }, "\uD83D\uDC9A Gratitude Themes"), /*#__PURE__*/React.createElement("button", {
          onClick: () => onClose(),
          style: {
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '4px'
          }
        }, /*#__PURE__*/React.createElement("i", {
          "data-lucide": "x",
          style: {
            width: '20px',
            height: '20px',
            color: '#666666'
          }
        })))), /*#__PURE__*/React.createElement("div", {
          style: {
            padding: '20px'
          }
        }, /*#__PURE__*/React.createElement("p", {
          style: {
            fontSize: '14px',
            color: '#666666',
            marginBottom: '20px'
          }
        }, "The most common themes from your gratitude reflections, ranked by frequency."), data.reflectionStats.gratitudeThemes && data.reflectionStats.gratitudeThemes.length > 0 ? /*#__PURE__*/React.createElement("div", {
          style: {
            marginBottom: '20px'
          }
        }, data.reflectionStats.gratitudeThemes.map((theme, index) => {
          const maxCount = data.reflectionStats.gratitudeThemes[0].count;
          const barWidth = theme.count / maxCount * 100;
          return /*#__PURE__*/React.createElement("div", {
            key: index,
            style: {
              marginBottom: '16px',
              padding: '14px',
              background: index === 0 ? 'linear-gradient(135deg, rgba(0,168,107,0.1) 0%, rgba(5,133,133,0.1) 100%)' : '#F8F9FA',
              borderRadius: '10px',
              border: index === 0 ? '2px solid #00A86B' : '1px solid #E5E5E5'
            }
          }, /*#__PURE__*/React.createElement("div", {
            style: {
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '8px'
            }
          }, /*#__PURE__*/React.createElement("div", {
            style: {
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }
          }, /*#__PURE__*/React.createElement("span", {
            style: {
              fontSize: '20px',
              fontWeight: 'bold',
              color: '#666666',
              minWidth: '30px'
            }
          }, index + 1, "."), /*#__PURE__*/React.createElement("span", {
            style: {
              fontSize: '16px',
              fontWeight: index === 0 ? 'bold' : '400',
              color: '#000000'
            }
          }, theme.theme), index === 0 && /*#__PURE__*/React.createElement("span", {
            style: {
              fontSize: '16px'
            }
          }, "\u2B50")), /*#__PURE__*/React.createElement("div", {
            style: {
              display: 'flex',
              gap: '8px',
              alignItems: 'center'
            }
          }, theme.percentage && /*#__PURE__*/React.createElement("div", {
            style: {
              padding: '4px 12px',
              background: '#00A86B',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: 'bold',
              color: '#FFFFFF'
            }
          }, theme.percentage, "%"), /*#__PURE__*/React.createElement("div", {
            style: {
              padding: '4px 12px',
              background: '#058585',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: 'bold',
              color: '#FFFFFF'
            }
          }, theme.count, " ", theme.count === 1 ? 'time' : 'times'))), /*#__PURE__*/React.createElement("div", {
            style: {
              width: '100%',
              height: '6px',
              background: '#E5E5E5',
              borderRadius: '3px',
              overflow: 'hidden'
            }
          }, /*#__PURE__*/React.createElement("div", {
            style: {
              width: `${barWidth}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #00A86B 0%, #058585 100%)',
              transition: 'width 0.3s'
            }
          })));
        })) : /*#__PURE__*/React.createElement("div", {
          style: {
            textAlign: 'center',
            padding: '40px 20px',
            color: '#999999'
          }
        }, /*#__PURE__*/React.createElement("div", {
          style: {
            fontSize: '16px',
            fontWeight: '600',
            marginBottom: '8px'
          }
        }, "No Themes Yet"), /*#__PURE__*/React.createElement("div", null, "Gratitude themes will appear here after Cloud Functions processes your reflections.")), /*#__PURE__*/React.createElement("button", {
          onClick: () => {
            data.triggerHaptic('light');
            onClose();
          },
          style: {
            width: '100%',
            height: '48px',
            background: '#058585',
            border: 'none',
            borderRadius: '8px',
            color: '#FFFFFF',
            fontSize: '14px',
            fontWeight: '400',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }
        }, "Back"))));
      case 'gratitudeJournal':
        return /*#__PURE__*/React.createElement("div", {
          style: {
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px'
          },
          onClick: () => {
            data.triggerHaptic('light');
            onClose();
          }
        }, /*#__PURE__*/React.createElement("div", {
          style: {
            background: '#FFFFFF',
            borderRadius: '20px',
            maxWidth: '600px',
            width: '100%',
            maxHeight: '80vh',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
          },
          onClick: e => e.stopPropagation()
        }, /*#__PURE__*/React.createElement("div", {
          style: {
            padding: '20px',
            borderBottom: '1px solid #E5E5E5',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }
        }, /*#__PURE__*/React.createElement("h3", {
          style: {
            margin: 0,
            fontSize: '20px',
            fontWeight: 'bold',
            color: '#000000'
          }
        }, "Gratitude Journal"), /*#__PURE__*/React.createElement("button", {
          onClick: () => {
            data.triggerHaptic('light');
            onClose();
          },
          style: {
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '8px'
          }
        }, /*#__PURE__*/React.createElement("i", {
          "data-lucide": "x",
          style: {
            width: '20px',
            height: '20px',
            color: '#666666'
          }
        }))), /*#__PURE__*/React.createElement("div", {
          style: {
            padding: '20px',
            overflowY: 'auto',
            flex: 1
          }
        }, /*#__PURE__*/React.createElement("p", {
          style: {
            fontSize: '14px',
            color: '#666666',
            marginBottom: '20px'
          }
        }, "All your gratitude entries from evening reflections."), data.gratitudeInsights && data.gratitudeInsights.computed && /*#__PURE__*/React.createElement("div", {
          style: {
            background: 'linear-gradient(135deg, #00A86B 0%, #058585 100%)',
            borderRadius: '16px',
            padding: '20px',
            marginBottom: '24px',
            color: '#FFFFFF'
          }
        }, /*#__PURE__*/React.createElement("h4", {
          style: {
            margin: '0 0 16px 0',
            fontSize: '16px',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }
        }, "Your Gratitude Insights"), data.gratitudeInsights.computed.topThemes && data.gratitudeInsights.computed.topThemes.length > 0 && /*#__PURE__*/React.createElement("div", {
          style: {
            marginBottom: '16px'
          }
        }, /*#__PURE__*/React.createElement("div", {
          style: {
            fontSize: '13px',
            fontWeight: '600',
            marginBottom: '8px',
            opacity: 0.9
          }
        }, "Core Values"), /*#__PURE__*/React.createElement("div", {
          style: {
            display: 'flex',
            gap: '8px',
            flexWrap: 'wrap'
          }
        }, data.gratitudeInsights.computed.topThemes.slice(0, 3).map((theme, idx) => /*#__PURE__*/React.createElement("div", {
          key: idx,
          style: {
            background: 'rgba(255, 255, 255, 0.2)',
            padding: '8px 14px',
            borderRadius: '20px',
            fontSize: '13px',
            fontWeight: '500',
            backdropFilter: 'blur(10px)'
          }
        }, theme.theme, " (", theme.percentage, "%)")))), data.gratitudeInsights.computed.gaps && data.gratitudeInsights.computed.gaps.length > 0 && /*#__PURE__*/React.createElement("div", {
          style: {
            marginBottom: '16px'
          }
        }, /*#__PURE__*/React.createElement("div", {
          style: {
            fontSize: '13px',
            fontWeight: '600',
            marginBottom: '8px',
            opacity: 0.9
          }
        }, "Growth Opportunities"), /*#__PURE__*/React.createElement("div", {
          style: {
            background: 'rgba(255, 255, 255, 0.15)',
            padding: '12px',
            borderRadius: '12px',
            fontSize: '13px',
            lineHeight: '1.5'
          }
        }, data.gratitudeInsights.computed.gaps[0].severity === 'high' ? /*#__PURE__*/React.createElement("span", null, "Consider reflecting on ", /*#__PURE__*/React.createElement("strong", null, data.gratitudeInsights.computed.gaps[0].category), " - it's been ", data.gratitudeInsights.computed.gaps[0].daysSinceLast, " days since your last mention.") : /*#__PURE__*/React.createElement("span", null, "You might explore gratitude for ", /*#__PURE__*/React.createElement("strong", null, data.gratitudeInsights.computed.gaps[0].category), " to deepen your practice."))), data.gratitudeInsights.computed.lastComputed && /*#__PURE__*/React.createElement("div", {
          style: {
            fontSize: '11px',
            opacity: 0.7,
            marginTop: '12px'
          }
        }, "Insights updated ", new Date(data.gratitudeInsights.computed.lastComputed.toDate()).toLocaleDateString())), data.gratitudeJournalData.length > 0 ? /*#__PURE__*/React.createElement("div", {
          style: {
            marginBottom: '20px'
          }
        }, data.gratitudeJournalData.map((entry, index) => /*#__PURE__*/React.createElement("div", {
          key: entry.id,
          style: {
            marginBottom: '16px',
            padding: '16px',
            background: '#F8F9FA',
            borderRadius: '12px',
            border: '1px solid #E5E5E5'
          }
        }, /*#__PURE__*/React.createElement("div", {
          style: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '8px'
          }
        }, /*#__PURE__*/React.createElement("div", {
          style: {
            fontSize: '13px',
            fontWeight: '600',
            color: '#058585'
          }
        }, new Date(entry.date).toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        })), entry.overallDay && /*#__PURE__*/React.createElement("div", {
          style: {
            padding: '4px 10px',
            background: entry.overallDay >= 7 ? '#00A86B' : entry.overallDay >= 5 ? '#FFA500' : '#DC143C',
            borderRadius: '12px',
            fontSize: '11px',
            fontWeight: 'bold',
            color: '#FFFFFF'
          }
        }, "Day: ", entry.overallDay, "/10")), /*#__PURE__*/React.createElement("div", {
          style: {
            fontSize: '14px',
            color: '#333333',
            lineHeight: '1.6',
            marginBottom: '12px'
          }
        }, entry.gratitude), /*#__PURE__*/React.createElement("button", {
          onClick: async () => {
            if (confirm('Share this gratitude with the community?')) {
              const result = await data.shareToCommunity('gratitude', entry.gratitude, 'checkIns', entry.id);
              if (result.success) {
                alert('Gratitude shared to community! 🎉');
              } else {
                alert('Error sharing to community');
              }
            }
          },
          style: {
            padding: '8px 16px',
            background: '#058585',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            fontSize: '13px',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }
        }, /*#__PURE__*/React.createElement("i", {
          "data-lucide": "share-2",
          style: {
            width: '14px',
            height: '14px'
          }
        }), "Share Gratitude")))) : /*#__PURE__*/React.createElement("div", {
          style: {
            textAlign: 'center',
            padding: '40px 20px',
            color: '#999999'
          }
        }, /*#__PURE__*/React.createElement("div", {
          style: {
            fontSize: '16px',
            fontWeight: '600',
            marginBottom: '8px'
          }
        }, "No Gratitude Entries Yet"), /*#__PURE__*/React.createElement("div", null, "Express gratitude in your evening reflections. Cloud Functions will analyze patterns and reveal your core values to support your recovery.")), /*#__PURE__*/React.createElement("button", {
          onClick: () => {
            data.triggerHaptic('light');
            onClose();
          },
          style: {
            width: '100%',
            height: '48px',
            background: '#058585',
            border: 'none',
            borderRadius: '8px',
            color: '#FFFFFF',
            fontSize: '14px',
            fontWeight: '400',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }
        }, "Back"))));
      case 'challengesHistory':
        return /*#__PURE__*/React.createElement("div", {
          style: {
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px'
          },
          onClick: () => {
            data.triggerHaptic('light');
            onClose();
          }
        }, /*#__PURE__*/React.createElement("div", {
          style: {
            background: '#FFFFFF',
            borderRadius: '20px',
            maxWidth: '600px',
            width: '100%',
            maxHeight: '80vh',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
          },
          onClick: e => e.stopPropagation()
        }, /*#__PURE__*/React.createElement("div", {
          style: {
            padding: '20px',
            borderBottom: '1px solid #E5E5E5',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }
        }, /*#__PURE__*/React.createElement("h3", {
          style: {
            margin: 0,
            fontSize: '20px',
            fontWeight: 'bold',
            color: '#000000'
          }
        }, "Challenges History"), /*#__PURE__*/React.createElement("button", {
          onClick: () => {
            data.triggerHaptic('light');
            onClose();
          },
          style: {
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '8px'
          }
        }, /*#__PURE__*/React.createElement("i", {
          "data-lucide": "x",
          style: {
            width: '20px',
            height: '20px',
            color: '#666666'
          }
        }))), /*#__PURE__*/React.createElement("div", {
          style: {
            padding: '20px',
            overflowY: 'auto',
            flex: 1
          }
        }, /*#__PURE__*/React.createElement("p", {
          style: {
            fontSize: '14px',
            color: '#666666',
            marginBottom: '20px'
          }
        }, "Review the challenges you've faced and overcome in your recovery journey."), data.challengesInsights && data.challengesInsights.categories && Object.keys(data.challengesInsights.categories).length > 0 && /*#__PURE__*/React.createElement("div", {
          style: {
            marginBottom: '24px',
            padding: '20px',
            background: 'linear-gradient(135deg, #FFF3CD 0%, #FFE6A8 100%)',
            borderRadius: '15px',
            border: '2px solid #FFA500'
          }
        }, /*#__PURE__*/React.createElement("div", {
          style: {
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            marginBottom: '16px'
          }
        }, /*#__PURE__*/React.createElement("div", {
          style: {
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #FFA500 0%, #FF8C00 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }
        }, /*#__PURE__*/React.createElement("i", {
          "data-lucide": "brain",
          style: {
            width: '20px',
            height: '20px',
            color: '#FFFFFF'
          }
        })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h4", {
          style: {
            margin: 0,
            fontSize: '16px',
            fontWeight: 'bold',
            color: '#856404'
          }
        }, "Challenge Patterns"), /*#__PURE__*/React.createElement("p", {
          style: {
            margin: 0,
            fontSize: '12px',
            color: '#856404',
            opacity: 0.8
          }
        }, "Analyzed by Cloud Functions"))), /*#__PURE__*/React.createElement("div", {
          style: {
            background: 'rgba(255, 255, 255, 0.7)',
            borderRadius: '12px',
            padding: '16px'
          }
        }, /*#__PURE__*/React.createElement("div", {
          style: {
            fontSize: '13px',
            fontWeight: '600',
            color: '#856404',
            marginBottom: '12px'
          }
        }, "Challenge Categories"), /*#__PURE__*/React.createElement("div", {
          style: {
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }
        }, Object.entries(data.challengesInsights.categories).sort((a, b) => b[1].count - a[1].count).slice(0, 5).map(([category, data]) => /*#__PURE__*/React.createElement("div", {
          key: category,
          style: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '10px',
            background: '#FFFFFF',
            borderRadius: '8px',
            border: '1px solid #FFE6A8'
          }
        }, /*#__PURE__*/React.createElement("div", {
          style: {
            fontSize: '14px',
            fontWeight: '500',
            color: '#333333',
            textTransform: 'capitalize'
          }
        }, category.replace(/_/g, ' ')), /*#__PURE__*/React.createElement("div", {
          style: {
            padding: '4px 12px',
            background: '#FF8C00',
            borderRadius: '20px',
            fontSize: '12px',
            fontWeight: 'bold',
            color: '#FFFFFF'
          }
        }, data.count, " ", data.count === 1 ? 'time' : 'times')))), data.challengesInsights.totalChallenges && /*#__PURE__*/React.createElement("div", {
          style: {
            marginTop: '16px',
            padding: '12px',
            background: 'linear-gradient(135deg, rgba(255, 140, 0, 0.1) 0%, rgba(255, 165, 0, 0.1) 100%)',
            borderRadius: '8px',
            border: '1px solid #FFE6A8'
          }
        }, /*#__PURE__*/React.createElement("div", {
          style: {
            fontSize: '12px',
            color: '#856404',
            marginBottom: '4px'
          }
        }, "Total Challenges Tracked"), /*#__PURE__*/React.createElement("div", {
          style: {
            fontSize: '20px',
            fontWeight: 'bold',
            color: '#FF8C00'
          }
        }, data.challengesInsights.totalChallenges)))), data.challengesHistoryData.length > 0 ? /*#__PURE__*/React.createElement("div", {
          style: {
            marginBottom: '20px'
          }
        }, data.challengesHistoryData.map((entry, index) => /*#__PURE__*/React.createElement("div", {
          key: entry.id,
          style: {
            marginBottom: '16px',
            padding: '16px',
            background: '#FFF3CD',
            borderRadius: '12px',
            border: '1px solid #FFA500'
          }
        }, /*#__PURE__*/React.createElement("div", {
          style: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '8px'
          }
        }, /*#__PURE__*/React.createElement("div", {
          style: {
            fontSize: '13px',
            fontWeight: '600',
            color: '#856404'
          }
        }, new Date(entry.date).toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        })), entry.overallDay && /*#__PURE__*/React.createElement("div", {
          style: {
            padding: '4px 10px',
            background: entry.overallDay >= 7 ? '#00A86B' : entry.overallDay >= 5 ? '#FFA500' : '#DC143C',
            borderRadius: '12px',
            fontSize: '11px',
            fontWeight: 'bold',
            color: '#FFFFFF'
          }
        }, "Day: ", entry.overallDay, "/10")), /*#__PURE__*/React.createElement("div", {
          style: {
            fontSize: '14px',
            color: '#333333',
            lineHeight: '1.6'
          }
        }, entry.challenges)))) : /*#__PURE__*/React.createElement("div", {
          style: {
            textAlign: 'center',
            padding: '40px 20px',
            color: '#999999'
          }
        }, /*#__PURE__*/React.createElement("div", {
          style: {
            fontSize: '16px',
            fontWeight: '600',
            marginBottom: '8px'
          }
        }, "No Challenges Yet"), /*#__PURE__*/React.createElement("div", null, "Document your challenges in evening reflections. Cloud Functions will analyze patterns and provide insights to support your recovery.")), /*#__PURE__*/React.createElement("button", {
          onClick: () => {
            data.triggerHaptic('light');
            onClose();
          },
          style: {
            width: '100%',
            height: '48px',
            background: '#058585',
            border: 'none',
            borderRadius: '8px',
            color: '#FFFFFF',
            fontSize: '14px',
            fontWeight: '400',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }
        }, "Back"))));
      case 'challengeCheckIn':
        if (!data.selectedChallenge) return null;
        return /*#__PURE__*/React.createElement("div", {
          style: {
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px'
          },
          onClick: () => {
            data.triggerHaptic('light');
            onClose();
            handlers.setSelectedChallenge(null);
            handlers.setChallengeCheckInStatus('');
            handlers.setChallengeCheckInNotes('');
          }
        }, /*#__PURE__*/React.createElement("div", {
          style: {
            background: '#FFFFFF',
            borderRadius: '20px',
            maxWidth: '500px',
            width: '100%',
            maxHeight: '85vh',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
          },
          onClick: e => e.stopPropagation()
        }, /*#__PURE__*/React.createElement("div", {
          style: {
            padding: '20px',
            borderBottom: '1px solid #E5E5E5',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }
        }, /*#__PURE__*/React.createElement("h3", {
          style: {
            margin: 0,
            fontSize: '20px',
            fontWeight: 'bold',
            color: '#000000'
          }
        }, "Challenge Check-In"), /*#__PURE__*/React.createElement("button", {
          onClick: () => {
            data.triggerHaptic('light');
            onClose();
            handlers.setSelectedChallenge(null);
            handlers.setChallengeCheckInStatus('');
            handlers.setChallengeCheckInNotes('');
          },
          style: {
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '8px'
          }
        }, /*#__PURE__*/React.createElement("i", {
          "data-lucide": "x",
          style: {
            width: '20px',
            height: '20px',
            color: '#666666'
          }
        }))), /*#__PURE__*/React.createElement("div", {
          style: {
            padding: '20px',
            overflowY: 'auto',
            flex: 1
          }
        }, /*#__PURE__*/React.createElement("div", {
          style: {
            padding: '16px',
            background: '#FFF3CD',
            borderRadius: '12px',
            marginBottom: '24px',
            border: '1px solid #FFA500'
          }
        }, /*#__PURE__*/React.createElement("div", {
          style: {
            fontSize: '13px',
            fontWeight: '600',
            color: '#856404',
            marginBottom: '8px'
          }
        }, "Your Challenge:"), /*#__PURE__*/React.createElement("div", {
          style: {
            fontSize: '14px',
            color: '#333333',
            lineHeight: '1.6'
          }
        }, data.selectedChallenge.challengeText)), /*#__PURE__*/React.createElement("div", {
          style: {
            marginBottom: '24px'
          }
        }, /*#__PURE__*/React.createElement("label", {
          style: {
            display: 'block',
            fontSize: '14px',
            fontWeight: '600',
            color: '#333333',
            marginBottom: '12px'
          }
        }, "How are things going? *"), /*#__PURE__*/React.createElement("div", {
          style: {
            display: 'grid',
            gap: '10px'
          }
        }, [{
          value: 'resolved',
          label: 'Resolved',
          color: '#00A86B',
          desc: 'I overcame this challenge!'
        }, {
          value: 'better',
          label: 'Getting Better',
          color: '#4CAF50',
          desc: 'Making progress'
        }, {
          value: 'same',
          label: 'About the Same',
          color: '#FFA500',
          desc: 'No change yet'
        }, {
          value: 'worse',
          label: 'Gotten Worse',
          color: '#FF6B6B',
          desc: 'Struggling more'
        }, {
          value: 'help',
          label: 'Need Help',
          color: '#DC143C',
          desc: 'I need support'
        }].map(status => /*#__PURE__*/React.createElement("button", {
          key: status.value,
          onClick: () => {
            data.triggerHaptic('light');
            handlers.setChallengeCheckInStatus(status.value);
          },
          style: {
            padding: '14px',
            background: data.challengeCheckInStatus === status.value ? status.color : '#FFFFFF',
            border: `2px solid ${status.color}`,
            borderRadius: '12px',
            color: data.challengeCheckInStatus === status.value ? '#FFFFFF' : status.color,
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s',
            textAlign: 'left',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }
        }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", null, status.label), /*#__PURE__*/React.createElement("div", {
          style: {
            fontSize: '11px',
            opacity: data.challengeCheckInStatus === status.value ? 0.9 : 0.7,
            marginTop: '2px'
          }
        }, status.desc)), data.challengeCheckInStatus === status.value && /*#__PURE__*/React.createElement("div", {
          style: {
            fontSize: '18px'
          }
        }, "\u25CF"))))), /*#__PURE__*/React.createElement("div", {
          style: {
            marginBottom: '20px'
          }
        }, /*#__PURE__*/React.createElement("label", {
          style: {
            display: 'block',
            fontSize: '14px',
            fontWeight: '600',
            color: '#333333',
            marginBottom: '8px'
          }
        }, "Notes about your progress *"), /*#__PURE__*/React.createElement("textarea", {
          value: data.challengeCheckInNotes,
          onChange: e => handlers.setChallengeCheckInNotes(e.target.value),
          placeholder: data.challengeCheckInStatus === 'resolved' ? 'What helped you overcome this challenge?' : data.challengeCheckInStatus === 'better' ? 'What strategies are working for you?' : data.challengeCheckInStatus === 'worse' ? 'What is making this harder right now?' : data.challengeCheckInStatus === 'help' ? 'What kind of support do you need?' : 'Share your thoughts on how you are handling this challenge...',
          style: {
            width: '100%',
            minHeight: '100px',
            padding: '12px',
            borderRadius: '8px',
            border: '1px solid #ddd',
            fontSize: '14px',
            fontFamily: 'inherit',
            resize: 'vertical'
          }
        })), /*#__PURE__*/React.createElement("button", {
          onClick: () => {
            data.triggerHaptic('medium');
            data.submitChallengeCheckIn();
          },
          disabled: !data.challengeCheckInStatus || !data.challengeCheckInNotes.trim(),
          style: {
            width: '100%',
            height: '48px',
            background: data.challengeCheckInStatus && data.challengeCheckInNotes.trim() ? '#058585' : '#CCCCCC',
            border: 'none',
            borderRadius: '8px',
            color: '#FFFFFF',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: data.challengeCheckInStatus && data.challengeCheckInNotes.trim() ? 'pointer' : 'not-allowed',
            transition: 'all 0.2s'
          }
        }, data.challengeCheckInStatus === 'resolved' ? '🎉 Mark as Resolved' : '✅ Save Check-In'), /*#__PURE__*/React.createElement("button", {
          onClick: () => {
            data.triggerHaptic('light');
            onClose();
            handlers.setSelectedChallenge(null);
            handlers.setChallengeCheckInStatus('');
            handlers.setChallengeCheckInNotes('');
          },
          style: {
            width: '100%',
            height: '48px',
            background: 'transparent',
            border: 'none',
            color: '#666666',
            fontSize: '14px',
            cursor: 'pointer',
            marginTop: '8px'
          }
        }, "Cancel"))));
      case 'breakthrough':
        if (!data.breakthroughData) return null;
        return /*#__PURE__*/React.createElement("div", {
          style: {
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1100,
            padding: '20px',
            animation: 'fadeIn 0.3s ease-in'
          },
          onClick: () => {
            data.triggerHaptic('light');
            onClose();
            handlers.setBreakthroughData(null);
          }
        }, /*#__PURE__*/React.createElement("div", {
          style: {
            background: 'linear-gradient(135deg, #00A86B 0%, #058585 100%)',
            borderRadius: '24px',
            maxWidth: '500px',
            width: '100%',
            padding: '40px 30px',
            textAlign: 'center',
            color: '#FFFFFF',
            boxShadow: '0 20px 60px rgba(0, 168, 107, 0.4)',
            animation: 'slideUp 0.4s ease-out'
          },
          onClick: e => e.stopPropagation()
        }, /*#__PURE__*/React.createElement("h2", {
          style: {
            margin: '0 0 12px 0',
            fontSize: '28px',
            fontWeight: 'bold'
          }
        }, "Breakthrough Moment!"), /*#__PURE__*/React.createElement("p", {
          style: {
            fontSize: '16px',
            opacity: 0.9,
            marginBottom: '24px',
            lineHeight: '1.5'
          }
        }, "You've overcome a challenge that once held you back."), data.breakthroughData.challengeText && /*#__PURE__*/React.createElement("div", {
          style: {
            padding: '20px',
            background: 'rgba(255, 255, 255, 0.15)',
            borderRadius: '16px',
            marginBottom: '24px',
            backdropFilter: 'blur(10px)'
          }
        }, /*#__PURE__*/React.createElement("div", {
          style: {
            fontSize: '13px',
            fontWeight: '600',
            marginBottom: '8px',
            opacity: 0.9
          }
        }, "Your Challenge:"), /*#__PURE__*/React.createElement("div", {
          style: {
            fontSize: '15px',
            lineHeight: '1.6'
          }
        }, data.breakthroughData.challengeText)), data.breakthroughData.daysSinceLastMention && /*#__PURE__*/React.createElement("div", {
          style: {
            padding: '16px',
            background: 'rgba(255, 255, 255, 0.2)',
            borderRadius: '12px',
            marginBottom: '24px'
          }
        }, /*#__PURE__*/React.createElement("div", {
          style: {
            fontSize: '14px',
            marginBottom: '4px',
            opacity: 0.9
          }
        }, "It's been"), /*#__PURE__*/React.createElement("div", {
          style: {
            fontSize: '32px',
            fontWeight: 'bold',
            marginBottom: '4px'
          }
        }, data.breakthroughData.daysSinceLastMention), /*#__PURE__*/React.createElement("div", {
          style: {
            fontSize: '14px',
            opacity: 0.9
          }
        }, "days since you mentioned this challenge")), /*#__PURE__*/React.createElement("div", {
          style: {
            padding: '20px',
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '12px',
            marginBottom: '28px',
            fontSize: '15px',
            lineHeight: '1.6',
            fontStyle: 'italic'
          }
        }, "\"Every challenge you overcome makes you stronger. This breakthrough is proof of your resilience and growth.\""), /*#__PURE__*/React.createElement("button", {
          onClick: async () => {
            if (confirm('Share this breakthrough with the community to inspire others?')) {
              const breakthroughContent = `Breakthrough! Overcame: "${data.breakthroughData.challengeText}" - ${data.breakthroughData.daysSinceLastMention} days challenge-free!`;
              const result = await data.shareToCommunity('breakthrough', breakthroughContent, 'challenges_tracking', data.breakthroughData.challengeId || 'unknown');
              if (result.success) {
                alert('Breakthrough shared to community! 🎉');
              } else {
                alert('Error sharing to community');
              }
            }
          },
          style: {
            width: '100%',
            padding: '16px',
            background: 'rgba(255, 255, 255, 0.2)',
            border: '2px solid #FFFFFF',
            borderRadius: '12px',
            color: '#FFFFFF',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: 'pointer',
            marginBottom: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            transition: 'all 0.2s'
          }
        }, /*#__PURE__*/React.createElement("i", {
          "data-lucide": "share-2",
          style: {
            width: '20px',
            height: '20px'
          }
        }), "Share Breakthrough"), /*#__PURE__*/React.createElement("button", {
          onClick: () => {
            data.triggerHaptic('medium');
            onClose();
            handlers.setBreakthroughData(null);
          },
          style: {
            width: '100%',
            padding: '16px',
            background: '#FFFFFF',
            border: 'none',
            borderRadius: '12px',
            color: '#00A86B',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }
        }, "\u2728 Continue")));
      case 'tomorrowGoals':
        return /*#__PURE__*/React.createElement("div", {
          style: {
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px'
          },
          onClick: () => {
            data.triggerHaptic('light');
            onClose();
            handlers.setGoalStatus('');
            handlers.setGoalNotes('');
          }
        }, /*#__PURE__*/React.createElement("div", {
          style: {
            background: '#FFFFFF',
            borderRadius: '20px',
            maxWidth: '600px',
            width: '100%',
            maxHeight: '85vh',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
          },
          onClick: e => e.stopPropagation()
        }, /*#__PURE__*/React.createElement("div", {
          style: {
            padding: '20px',
            borderBottom: '1px solid #E5E5E5',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }
        }, /*#__PURE__*/React.createElement("h3", {
          style: {
            margin: 0,
            fontSize: '20px',
            fontWeight: 'bold',
            color: '#000000'
          }
        }, "\uD83C\uDFC6 Goal Achievement Tracker"), /*#__PURE__*/React.createElement("button", {
          onClick: () => {
            data.triggerHaptic('light');
            onClose();
            handlers.setGoalStatus('');
            handlers.setGoalNotes('');
          },
          style: {
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '8px'
          }
        }, /*#__PURE__*/React.createElement("i", {
          "data-lucide": "x",
          style: {
            width: '20px',
            height: '20px',
            color: '#666666'
          }
        }))), /*#__PURE__*/React.createElement("div", {
          style: {
            padding: '20px',
            overflowY: 'auto',
            flex: 1
          }
        }, data.yesterdayGoal ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("p", {
          style: {
            fontSize: '14px',
            color: '#666666',
            marginBottom: '20px'
          }
        }, "Did you accomplish your goal from yesterday?"), /*#__PURE__*/React.createElement("div", {
          style: {
            padding: '16px',
            background: '#E7F5FF',
            borderRadius: '12px',
            marginBottom: '24px',
            border: '1px solid #058585'
          }
        }, /*#__PURE__*/React.createElement("div", {
          style: {
            fontSize: '13px',
            fontWeight: '600',
            color: '#666666',
            marginBottom: '8px'
          }
        }, "Yesterday's Goal:"), /*#__PURE__*/React.createElement("div", {
          style: {
            fontSize: '15px',
            color: '#333333',
            lineHeight: '1.6',
            fontWeight: '500'
          }
        }, data.yesterdayGoal.goal)), /*#__PURE__*/React.createElement("div", {
          style: {
            marginBottom: '20px'
          }
        }, /*#__PURE__*/React.createElement("label", {
          style: {
            display: 'block',
            fontSize: '14px',
            fontWeight: '600',
            color: '#333333',
            marginBottom: '12px'
          }
        }, "How did it go? *"), /*#__PURE__*/React.createElement("div", {
          style: {
            display: 'grid',
            gap: '10px'
          }
        }, [{
          value: 'yes',
          label: 'Yes',
          desc: 'Completed it!',
          color: '#00A86B'
        }, {
          value: 'almost',
          label: 'Almost',
          desc: 'Got close',
          color: '#4CAF50'
        }, {
          value: 'partially',
          label: 'Partially',
          desc: 'Made progress',
          color: '#FFA500'
        }, {
          value: 'no',
          label: 'No',
          desc: 'Didn\'t complete',
          color: '#FF6B6B'
        }, {
          value: 'didnt_try',
          label: 'Didn\'t Try',
          desc: 'Couldn\'t attempt',
          color: '#999999'
        }].map(status => /*#__PURE__*/React.createElement("button", {
          key: status.value,
          onClick: () => {
            data.triggerHaptic('light');
            handlers.setGoalStatus(status.value);
          },
          style: {
            padding: '12px',
            background: data.goalStatus === status.value ? status.color : '#FFFFFF',
            border: `2px solid ${status.color}`,
            borderRadius: '10px',
            color: data.goalStatus === status.value ? '#FFFFFF' : status.color,
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s',
            textAlign: 'left',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }
        }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", null, status.label), /*#__PURE__*/React.createElement("div", {
          style: {
            fontSize: '11px',
            opacity: data.goalStatus === status.value ? 0.9 : 0.7,
            marginTop: '2px'
          }
        }, status.desc)), data.goalStatus === status.value && /*#__PURE__*/React.createElement("div", {
          style: {
            fontSize: '16px'
          }
        }, "\u25CF"))))), /*#__PURE__*/React.createElement("div", {
          style: {
            marginBottom: '20px'
          }
        }, /*#__PURE__*/React.createElement("label", {
          style: {
            display: 'block',
            fontSize: '14px',
            fontWeight: '600',
            color: '#333333',
            marginBottom: '8px'
          }
        }, "Notes (optional)"), /*#__PURE__*/React.createElement("textarea", {
          value: data.goalNotes,
          onChange: e => handlers.setGoalNotes(e.target.value),
          placeholder: data.goalStatus === 'yes' ? 'What helped you succeed?' : data.goalStatus === 'almost' ? 'What got in the way?' : data.goalStatus === 'no' ? 'What prevented you from completing it?' : 'Any thoughts about this goal...',
          style: {
            width: '100%',
            minHeight: '80px',
            padding: '12px',
            borderRadius: '8px',
            border: '1px solid #ddd',
            fontSize: '14px',
            fontFamily: 'inherit',
            resize: 'vertical'
          }
        })), /*#__PURE__*/React.createElement("button", {
          onClick: () => {
            data.triggerHaptic('medium');
            data.submitGoalAchievement();
          },
          disabled: !data.goalStatus,
          style: {
            width: '100%',
            height: '48px',
            background: data.goalStatus ? '#058585' : '#CCCCCC',
            border: 'none',
            borderRadius: '8px',
            color: '#FFFFFF',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: data.goalStatus ? 'pointer' : 'not-allowed',
            transition: 'all 0.2s'
          }
        }, data.goalStatus === 'yes' ? '🎉 Record Success' : '✅ Record Progress')) :
        /*#__PURE__*/
        /* No yesterday's goal - show stats and history */
        React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("p", {
          style: {
            fontSize: '14px',
            color: '#666666',
            marginBottom: '20px'
          }
        }, "Track your goal completion rate and build your achievement streak!"), data.goalStats.totalGoals > 0 ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
          style: {
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '12px',
            marginBottom: '24px'
          }
        }, /*#__PURE__*/React.createElement("div", {
          style: {
            padding: '16px',
            background: 'linear-gradient(135deg, #00A86B 0%, #058585 100%)',
            borderRadius: '12px',
            textAlign: 'center',
            color: '#FFFFFF'
          }
        }, /*#__PURE__*/React.createElement("div", {
          style: {
            fontSize: '28px',
            fontWeight: 'bold',
            marginBottom: '4px'
          }
        }, data.goalStats.completionRate, "%"), /*#__PURE__*/React.createElement("div", {
          style: {
            fontSize: '11px',
            opacity: 0.9
          }
        }, "Success Rate")), /*#__PURE__*/React.createElement("div", {
          style: {
            padding: '16px',
            background: 'linear-gradient(135deg, #FFA500 0%, #FF8C00 100%)',
            borderRadius: '12px',
            textAlign: 'center',
            color: '#FFFFFF'
          }
        }, /*#__PURE__*/React.createElement("div", {
          style: {
            fontSize: '28px',
            fontWeight: 'bold',
            marginBottom: '4px'
          }
        }, data.goalStats.currentStreak), /*#__PURE__*/React.createElement("div", {
          style: {
            fontSize: '11px',
            opacity: 0.9
          }
        }, "Current Streak")), /*#__PURE__*/React.createElement("div", {
          style: {
            padding: '16px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: '12px',
            textAlign: 'center',
            color: '#FFFFFF'
          }
        }, /*#__PURE__*/React.createElement("div", {
          style: {
            fontSize: '28px',
            fontWeight: 'bold',
            marginBottom: '4px'
          }
        }, data.goalStats.bestStreak), /*#__PURE__*/React.createElement("div", {
          style: {
            fontSize: '11px',
            opacity: 0.9
          }
        }, "Best Streak"))), /*#__PURE__*/React.createElement("h4", {
          style: {
            margin: '0 0 12px 0',
            fontSize: '16px',
            fontWeight: 'bold',
            color: '#333'
          }
        }, "Recent Goals (", data.goalStats.totalGoals, " total)"), /*#__PURE__*/React.createElement("div", {
          style: {
            marginBottom: '20px'
          }
        }, data.goalHistory.slice(0, 10).map((goal, index) => /*#__PURE__*/React.createElement("div", {
          key: goal.id,
          style: {
            padding: '14px',
            marginBottom: '10px',
            background: '#F8F9FA',
            borderRadius: '10px',
            borderLeft: `4px solid ${goal.status === 'yes' ? '#00A86B' : goal.status === 'almost' ? '#4CAF50' : goal.status === 'partially' ? '#FFA500' : goal.status === 'no' ? '#FF6B6B' : '#999999'}`
          }
        }, /*#__PURE__*/React.createElement("div", {
          style: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '6px'
          }
        }, /*#__PURE__*/React.createElement("div", {
          style: {
            fontSize: '12px',
            color: '#666',
            fontWeight: '600'
          }
        }, goal.checkedInAt && new Date(goal.checkedInAt).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric'
        })), /*#__PURE__*/React.createElement("div", {
          style: {
            fontSize: '12px',
            fontWeight: 'bold',
            color: goal.status === 'yes' ? '#00A86B' : goal.status === 'almost' ? '#4CAF50' : goal.status === 'partially' ? '#FFA500' : goal.status === 'no' ? '#FF6B6B' : '#999999'
          }
        }, goal.status === 'yes' ? '✅ Completed' : goal.status === 'almost' ? '⚡ Almost' : goal.status === 'partially' ? '🟡 Partial' : goal.status === 'no' ? '❌ No' : '🤷 Skipped')), /*#__PURE__*/React.createElement("div", {
          style: {
            fontSize: '13px',
            color: '#333',
            lineHeight: '1.5'
          }
        }, goal.goal), goal.notes && /*#__PURE__*/React.createElement("div", {
          style: {
            marginTop: '8px',
            fontSize: '12px',
            color: '#666',
            fontStyle: 'italic'
          }
        }, "Note: ", goal.notes))))) : /*#__PURE__*/React.createElement("div", {
          style: {
            textAlign: 'center',
            padding: '40px 20px',
            color: '#999999'
          }
        }, /*#__PURE__*/React.createElement("div", {
          style: {
            fontSize: '48px',
            marginBottom: '12px'
          }
        }, "\uD83C\uDFC6"), /*#__PURE__*/React.createElement("div", {
          style: {
            marginBottom: '8px',
            fontSize: '16px',
            fontWeight: '600'
          }
        }, "No goals tracked yet"), /*#__PURE__*/React.createElement("div", {
          style: {
            fontSize: '14px'
          }
        }, "Set a goal in your evening reflection and check back tomorrow to record your progress!")), /*#__PURE__*/React.createElement("button", {
          onClick: () => {
            data.triggerHaptic('light');
            onClose();
          },
          style: {
            width: '100%',
            height: '48px',
            background: '#058585',
            border: 'none',
            borderRadius: '8px',
            color: '#FFFFFF',
            fontSize: '14px',
            fontWeight: '400',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }
        }, "Back")))));
      case 'streaks':
        return /*#__PURE__*/React.createElement("div", {
          style: {
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px'
          }
        }, /*#__PURE__*/React.createElement("div", {
          style: {
            background: '#FFFFFF',
            borderRadius: '12px',
            width: '100%',
            maxWidth: '500px',
            maxHeight: '80vh',
            overflow: 'auto'
          }
        }, /*#__PURE__*/React.createElement("div", {
          style: {
            padding: '20px',
            borderBottom: '1px solid #E5E5E5',
            position: 'sticky',
            top: 0,
            background: '#FFFFFF',
            zIndex: 10
          }
        }, /*#__PURE__*/React.createElement("h3", {
          style: {
            margin: 0,
            fontSize: '20px',
            fontWeight: 'bold',
            color: '#000000'
          }
        }, "\uD83D\uDD25 Your Check-In Streaks")), /*#__PURE__*/React.createElement("div", {
          style: {
            padding: '20px'
          }
        }, data.streakData.currentStreak > 0 && /*#__PURE__*/React.createElement("div", {
          style: {
            padding: '16px',
            background: 'linear-gradient(135deg, rgba(5, 133, 133, 0.1) 0%, rgba(0, 168, 107, 0.1) 100%)',
            borderRadius: '12px',
            marginBottom: '20px',
            border: '2px solid #058585'
          }
        }, /*#__PURE__*/React.createElement("div", {
          style: {
            fontSize: '14px',
            color: '#666',
            marginBottom: '8px'
          }
        }, "Current Streak"), /*#__PURE__*/React.createElement("div", {
          style: {
            fontSize: '32px',
            fontWeight: 'bold',
            color: '#058585'
          }
        }, "\uD83D\uDD25 ", data.streakData.currentStreak, " ", data.streakData.currentStreak === 1 ? 'day' : 'days'), /*#__PURE__*/React.createElement("div", {
          style: {
            fontSize: '12px',
            color: '#666',
            marginTop: '8px'
          }
        }, "Keep it up! Check in today to extend your streak.")), /*#__PURE__*/React.createElement("div", {
          style: {
            marginBottom: '12px',
            fontSize: '16px',
            fontWeight: '600',
            color: '#000'
          }
        }, "All Streaks"), data.streakData.allStreaks.length > 0 ? /*#__PURE__*/React.createElement("div", {
          style: {
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }
        }, data.streakData.allStreaks.map((streak, index) => {
          const startDate = new Date(streak.startDate);
          const endDate = new Date(streak.endDate);
          const isLongest = index === 0; // First in sorted array is longest
          const isCurrent = streak.endDate === `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}`;
          return /*#__PURE__*/React.createElement("div", {
            key: index,
            style: {
              padding: '14px',
              background: isLongest ? '#FFF9E6' : '#F8F9FA',
              borderRadius: '10px',
              border: isLongest ? '2px solid #FFA500' : '1px solid #E5E5E5',
              position: 'relative'
            }
          }, /*#__PURE__*/React.createElement("div", {
            style: {
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }
          }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
            style: {
              fontSize: '18px',
              fontWeight: 'bold',
              color: '#000',
              marginBottom: '4px'
            }
          }, streak.length, " ", streak.length === 1 ? 'day' : 'days', isLongest && /*#__PURE__*/React.createElement("span", {
            style: {
              marginLeft: '8px',
              fontSize: '14px'
            }
          }, "\u2B50 Longest"), isCurrent && /*#__PURE__*/React.createElement("span", {
            style: {
              marginLeft: '8px',
              fontSize: '14px'
            }
          }, "\u2190 Current")), /*#__PURE__*/React.createElement("div", {
            style: {
              fontSize: '13px',
              color: '#666'
            }
          }, startDate.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
          }), ' - ', endDate.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
          }))), /*#__PURE__*/React.createElement("div", {
            style: {
              fontSize: '24px'
            }
          }, "\uD83D\uDD25")));
        })) : /*#__PURE__*/React.createElement("div", {
          style: {
            textAlign: 'center',
            padding: '40px 20px',
            color: '#999'
          }
        }, /*#__PURE__*/React.createElement("div", {
          style: {
            fontSize: '48px',
            marginBottom: '12px'
          }
        }, "\uD83D\uDD25"), /*#__PURE__*/React.createElement("div", null, "Start checking in to build your first streak!")), /*#__PURE__*/React.createElement("button", {
          onClick: () => {
            data.triggerHaptic('light');
            onClose();
          },
          style: {
            marginTop: '20px',
            width: '100%',
            height: '48px',
            background: '#058585',
            border: 'none',
            borderRadius: '8px',
            color: '#FFFFFF',
            fontSize: '14px',
            fontWeight: '400',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }
        }, "Back"))));
      case 'reflectionStreaks':
        return /*#__PURE__*/React.createElement("div", {
          style: {
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px'
          }
        }, /*#__PURE__*/React.createElement("div", {
          style: {
            background: '#FFFFFF',
            borderRadius: '12px',
            width: '100%',
            maxWidth: '500px',
            maxHeight: '80vh',
            overflow: 'auto'
          }
        }, /*#__PURE__*/React.createElement("div", {
          style: {
            padding: '20px',
            borderBottom: '1px solid #E5E5E5',
            position: 'sticky',
            top: 0,
            background: '#FFFFFF',
            zIndex: 10
          }
        }, /*#__PURE__*/React.createElement("h3", {
          style: {
            margin: 0,
            fontSize: '20px',
            fontWeight: 'bold',
            color: '#000000'
          }
        }, "\uD83C\uDF19 Your Reflection Streaks")), /*#__PURE__*/React.createElement("div", {
          style: {
            padding: '20px'
          }
        }, data.reflectionStreakData.currentStreak > 0 && /*#__PURE__*/React.createElement("div", {
          style: {
            padding: '16px',
            background: 'linear-gradient(135deg, rgba(5, 133, 133, 0.1) 0%, rgba(0, 168, 107, 0.1) 100%)',
            borderRadius: '12px',
            marginBottom: '20px',
            border: '2px solid #058585'
          }
        }, /*#__PURE__*/React.createElement("div", {
          style: {
            fontSize: '14px',
            color: '#666',
            marginBottom: '8px'
          }
        }, "Current Streak"), /*#__PURE__*/React.createElement("div", {
          style: {
            fontSize: '32px',
            fontWeight: 'bold',
            color: '#058585'
          }
        }, "\uD83D\uDD25 ", data.reflectionStreakData.currentStreak, " ", data.reflectionStreakData.currentStreak === 1 ? 'day' : 'days'), /*#__PURE__*/React.createElement("div", {
          style: {
            fontSize: '12px',
            color: '#666',
            marginTop: '8px'
          }
        }, "Keep it up! Reflect tonight to extend your streak.")), /*#__PURE__*/React.createElement("div", {
          style: {
            marginBottom: '12px',
            fontSize: '16px',
            fontWeight: '600',
            color: '#000'
          }
        }, "All Streaks"), data.reflectionStreakData.allStreaks.length > 0 ? /*#__PURE__*/React.createElement("div", {
          style: {
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }
        }, data.reflectionStreakData.allStreaks.map((streak, index) => {
          const startDate = new Date(streak.startDate);
          const endDate = new Date(streak.endDate);
          const isLongest = index === 0; // First in sorted array is longest
          const isCurrent = streak.endDate === `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}`;
          return /*#__PURE__*/React.createElement("div", {
            key: index,
            style: {
              padding: '14px',
              background: isLongest ? '#FFF9E6' : '#F8F9FA',
              borderRadius: '10px',
              border: isLongest ? '2px solid #FFA500' : '1px solid #E5E5E5',
              position: 'relative'
            }
          }, /*#__PURE__*/React.createElement("div", {
            style: {
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }
          }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
            style: {
              fontSize: '18px',
              fontWeight: 'bold',
              color: '#000',
              marginBottom: '4px'
            }
          }, streak.length, " ", streak.length === 1 ? 'day' : 'days', isLongest && /*#__PURE__*/React.createElement("span", {
            style: {
              marginLeft: '8px',
              fontSize: '14px'
            }
          }, "\u2B50 Longest"), isCurrent && /*#__PURE__*/React.createElement("span", {
            style: {
              marginLeft: '8px',
              fontSize: '14px'
            }
          }, "\u2190 Current")), /*#__PURE__*/React.createElement("div", {
            style: {
              fontSize: '13px',
              color: '#666'
            }
          }, startDate.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
          }), ' - ', endDate.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
          }))), /*#__PURE__*/React.createElement("div", {
            style: {
              fontSize: '24px'
            }
          }, "\uD83D\uDD25")));
        })) : /*#__PURE__*/React.createElement("div", {
          style: {
            textAlign: 'center',
            padding: '40px 20px',
            color: '#999'
          }
        }, /*#__PURE__*/React.createElement("div", {
          style: {
            fontSize: '48px',
            marginBottom: '12px'
          }
        }, "\uD83C\uDF19"), /*#__PURE__*/React.createElement("div", null, "Start reflecting daily to build your first streak!")), /*#__PURE__*/React.createElement("button", {
          onClick: () => {
            data.triggerHaptic('light');
            onClose();
          },
          style: {
            marginTop: '20px',
            width: '100%',
            height: '48px',
            background: '#058585',
            border: 'none',
            borderRadius: '8px',
            color: '#FFFFFF',
            fontSize: '14px',
            fontWeight: '400',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }
        }, "Back"))));
      case 'journeyCalendar':
        return /*#__PURE__*/React.createElement("div", {
          style: {
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
          },
          onClick: () => onClose()
        }, /*#__PURE__*/React.createElement("div", {
          style: {
            background: '#FFFFFF',
            borderRadius: '15px',
            maxWidth: '400px',
            width: '100%'
          },
          onClick: e => e.stopPropagation()
        }, /*#__PURE__*/React.createElement("div", {
          style: {
            padding: '20px',
            borderBottom: '1px solid #E5E5E5'
          }
        }, /*#__PURE__*/React.createElement("h3", {
          style: {
            margin: 0,
            fontSize: '20px',
            fontWeight: 'bold',
            color: '#000000'
          }
        }, "\uD83D\uDCC5 Calendar Options")), /*#__PURE__*/React.createElement("div", {
          style: {
            padding: '20px'
          }
        }, /*#__PURE__*/React.createElement("button", {
          onClick: () => {
            data.triggerHaptic('medium');
            onClose();
            handlers.setShowModal('milestone');
          },
          style: {
            width: '100%',
            padding: '18px',
            background: 'linear-gradient(135deg, #0077CC 0%, #058585 100%)',
            border: 'none',
            borderRadius: '12px',
            color: '#FFFFFF',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer',
            marginBottom: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            transition: 'all 0.2s',
            boxShadow: '0 4px 12px rgba(0,119,204,0.3)'
          }
        }, /*#__PURE__*/React.createElement("div", {
          style: {
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }
        }, /*#__PURE__*/React.createElement("i", {
          "data-lucide": "milestone",
          style: {
            width: '24px',
            height: '24px'
          }
        }), /*#__PURE__*/React.createElement("div", {
          style: {
            textAlign: 'left'
          }
        }, /*#__PURE__*/React.createElement("div", null, "Milestone Calendar"), /*#__PURE__*/React.createElement("div", {
          style: {
            fontSize: '12px',
            opacity: 0.9,
            fontWeight: '400'
          }
        }, "View and share recovery milestones"))), /*#__PURE__*/React.createElement("i", {
          "data-lucide": "chevron-right",
          style: {
            width: '20px',
            height: '20px'
          }
        })), /*#__PURE__*/React.createElement("button", {
          onClick: () => {
            data.triggerHaptic('medium');
            onClose();
            handlers.setShowModal('graphSettings');
          },
          style: {
            width: '100%',
            padding: '18px',
            background: 'linear-gradient(135deg, #00A86B 0%, #008554 100%)',
            border: 'none',
            borderRadius: '12px',
            color: '#FFFFFF',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            transition: 'all 0.2s',
            boxShadow: '0 4px 12px rgba(0,168,107,0.3)'
          }
        }, /*#__PURE__*/React.createElement("div", {
          style: {
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }
        }, /*#__PURE__*/React.createElement("i", {
          "data-lucide": "bar-chart-3",
          style: {
            width: '24px',
            height: '24px'
          }
        }), /*#__PURE__*/React.createElement("div", {
          style: {
            textAlign: 'left'
          }
        }, /*#__PURE__*/React.createElement("div", null, "Graph Settings"), /*#__PURE__*/React.createElement("div", {
          style: {
            fontSize: '12px',
            opacity: 0.9,
            fontWeight: '400'
          }
        }, "Share & print wellness graphs"))), /*#__PURE__*/React.createElement("i", {
          "data-lucide": "chevron-right",
          style: {
            width: '20px',
            height: '20px'
          }
        })), /*#__PURE__*/React.createElement("button", {
          onClick: () => {
            data.triggerHaptic('light');
            onClose();
          },
          style: {
            marginTop: '20px',
            width: '100%',
            padding: '12px',
            background: '#6c757d',
            border: 'none',
            borderRadius: '8px',
            color: '#FFFFFF',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }
        }, "Close"))));
      case 'graphSettings':
        return /*#__PURE__*/React.createElement("div", {
          style: {
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
          },
          onClick: () => onClose()
        }, /*#__PURE__*/React.createElement("div", {
          style: {
            background: '#FFFFFF',
            borderRadius: '15px',
            maxWidth: '500px',
            width: '100%',
            maxHeight: '80vh',
            overflow: 'auto'
          },
          onClick: e => e.stopPropagation()
        }, /*#__PURE__*/React.createElement("div", {
          style: {
            padding: '20px',
            borderBottom: '1px solid #E5E5E5'
          }
        }, /*#__PURE__*/React.createElement("div", {
          style: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }
        }, /*#__PURE__*/React.createElement("div", {
          style: {
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }
        }, /*#__PURE__*/React.createElement("i", {
          "data-lucide": "bar-chart-3",
          style: {
            width: '24px',
            height: '24px',
            color: '#00A86B'
          }
        }), /*#__PURE__*/React.createElement("h3", {
          style: {
            margin: 0,
            fontSize: '20px',
            fontWeight: 'bold',
            color: '#000000'
          }
        }, "Graph Settings")), /*#__PURE__*/React.createElement("button", {
          onClick: () => onClose(),
          style: {
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '4px'
          }
        }, /*#__PURE__*/React.createElement("i", {
          "data-lucide": "x",
          style: {
            width: '20px',
            height: '20px',
            color: '#666666'
          }
        })))), /*#__PURE__*/React.createElement("div", {
          style: {
            padding: '20px'
          }
        }, /*#__PURE__*/React.createElement("div", {
          style: {
            marginBottom: '24px'
          }
        }, /*#__PURE__*/React.createElement("h4", {
          style: {
            fontSize: '16px',
            fontWeight: '600',
            color: '#000000',
            marginBottom: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }
        }, /*#__PURE__*/React.createElement("i", {
          "data-lucide": "calendar",
          style: {
            width: '18px',
            height: '18px',
            color: '#0077CC'
          }
        }), "Date Range"), /*#__PURE__*/React.createElement("p", {
          style: {
            fontSize: '13px',
            color: '#666666',
            marginBottom: '12px'
          }
        }, "Select a date range to view your wellness graphs"), /*#__PURE__*/React.createElement("div", {
          style: {
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '8px',
            marginBottom: '16px'
          }
        }, /*#__PURE__*/React.createElement("button", {
          onClick: () => {
            data.triggerHaptic('light');
            const endDate = new Date();
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - 7);
            handlers.setGraphDateRange({
              start: startDate,
              end: endDate
            });
            handlers.setSelectedRange('7days');
          },
          style: {
            padding: '12px',
            background: data.selectedRange === '7days' ? 'linear-gradient(135deg, #00A86B 0%, #008554 100%)' : '#F5F5F5',
            color: data.selectedRange === '7days' ? '#FFFFFF' : '#333333',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer'
          }
        }, "Last 7 Days"), /*#__PURE__*/React.createElement("button", {
          onClick: () => {
            data.triggerHaptic('light');
            const endDate = new Date();
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - 30);
            handlers.setGraphDateRange({
              start: startDate,
              end: endDate
            });
            handlers.setSelectedRange('30days');
          },
          style: {
            padding: '12px',
            background: data.selectedRange === '30days' ? 'linear-gradient(135deg, #00A86B 0%, #008554 100%)' : '#F5F5F5',
            color: data.selectedRange === '30days' ? '#FFFFFF' : '#333333',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer'
          }
        }, "Last 30 Days"), /*#__PURE__*/React.createElement("button", {
          onClick: () => {
            data.triggerHaptic('light');
            const endDate = new Date();
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - 90);
            handlers.setGraphDateRange({
              start: startDate,
              end: endDate
            });
            handlers.setSelectedRange('90days');
          },
          style: {
            padding: '12px',
            background: data.selectedRange === '90days' ? 'linear-gradient(135deg, #00A86B 0%, #008554 100%)' : '#F5F5F5',
            color: data.selectedRange === '90days' ? '#FFFFFF' : '#333333',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer'
          }
        }, "Last 90 Days"), /*#__PURE__*/React.createElement("button", {
          onClick: () => {
            data.triggerHaptic('light');
            handlers.setGraphDateRange({
              start: null,
              end: null
            });
            handlers.setSelectedRange('all');
          },
          style: {
            padding: '12px',
            background: data.selectedRange === 'all' ? 'linear-gradient(135deg, #00A86B 0%, #008554 100%)' : '#F5F5F5',
            color: data.selectedRange === 'all' ? '#FFFFFF' : '#333333',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer'
          }
        }, "All Time")), /*#__PURE__*/React.createElement("div", {
          style: {
            padding: '16px',
            background: '#F8F9FA',
            borderRadius: '10px',
            border: '1px solid #E5E5E5'
          }
        }, /*#__PURE__*/React.createElement("div", {
          style: {
            fontSize: '14px',
            fontWeight: '500',
            color: '#000000',
            marginBottom: '12px'
          }
        }, "Custom Date Range"), /*#__PURE__*/React.createElement("div", {
          style: {
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '12px'
          }
        }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
          style: {
            fontSize: '12px',
            color: '#666666',
            marginBottom: '6px',
            display: 'block'
          }
        }, "Start Date"), /*#__PURE__*/React.createElement("input", {
          type: "date",
          value: data.graphDateRange.start ? data.graphDateRange.start.toISOString().split('T')[0] : '',
          onChange: e => {
            const date = e.target.value ? new Date(e.target.value) : null;
            handlers.setGraphDateRange({
              ...graphDateRange,
              start: date
            });
          },
          style: {
            width: '100%',
            padding: '10px',
            borderRadius: '8px',
            border: '1px solid #ddd',
            fontSize: '14px'
          }
        })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
          style: {
            fontSize: '12px',
            color: '#666666',
            marginBottom: '6px',
            display: 'block'
          }
        }, "End Date"), /*#__PURE__*/React.createElement("input", {
          type: "date",
          value: data.graphDateRange.end ? data.graphDateRange.end.toISOString().split('T')[0] : '',
          onChange: e => {
            const date = e.target.value ? new Date(e.target.value) : null;
            handlers.setGraphDateRange({
              ...graphDateRange,
              end: date
            });
          },
          style: {
            width: '100%',
            padding: '10px',
            borderRadius: '8px',
            border: '1px solid #ddd',
            fontSize: '14px'
          }
        }))))), /*#__PURE__*/React.createElement("div", {
          style: {
            marginBottom: '20px'
          }
        }, /*#__PURE__*/React.createElement("h4", {
          style: {
            fontSize: '16px',
            fontWeight: '600',
            color: '#000000',
            marginBottom: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }
        }, /*#__PURE__*/React.createElement("i", {
          "data-lucide": "file-text",
          style: {
            width: '18px',
            height: '18px',
            color: '#0077CC'
          }
        }), "Export & Share"), /*#__PURE__*/React.createElement("button", {
          onClick: async () => {
            data.triggerHaptic('medium');
            await data.exportGraphsToPDF(data.graphDateRange, data.user);
          },
          style: {
            width: '100%',
            padding: '16px',
            background: 'linear-gradient(135deg, #0077CC 0%, #005A9C 100%)',
            border: 'none',
            borderRadius: '12px',
            color: '#FFFFFF',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer',
            marginBottom: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            boxShadow: '0 4px 12px rgba(0,119,204,0.3)'
          }
        }, /*#__PURE__*/React.createElement("i", {
          "data-lucide": "printer",
          style: {
            width: '20px',
            height: '20px'
          }
        }), "Print to PDF"), /*#__PURE__*/React.createElement("button", {
          onClick: async () => {
            data.triggerHaptic('medium');
            await data.shareGraphsPDF(data.graphDateRange, data.user);
          },
          style: {
            width: '100%',
            padding: '16px',
            background: 'linear-gradient(135deg, #00A86B 0%, #008554 100%)',
            border: 'none',
            borderRadius: '12px',
            color: '#FFFFFF',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            boxShadow: '0 4px 12px rgba(0,168,107,0.3)'
          }
        }, /*#__PURE__*/React.createElement("i", {
          "data-lucide": "share-2",
          style: {
            width: '20px',
            height: '20px'
          }
        }), "Share PDF")), /*#__PURE__*/React.createElement("button", {
          onClick: () => {
            data.triggerHaptic('light');
            onClose();
          },
          style: {
            width: '100%',
            padding: '12px',
            background: '#6c757d',
            border: 'none',
            borderRadius: '8px',
            color: '#FFFFFF',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }
        }, "Close"))));
      default:
        return /*#__PURE__*/React.createElement("div", null, "Content not available");
    }
  };
  return renderModalContent();
}

// Register ModalContainer component globally
window.GLRSApp.components.ModalContainer = ModalContainer;