// ═══════════════════════════════════════════════════════════
// COMMUNITY & MESSAGING ACTIONS
// Business logic for sending messages and managing topic rooms
// ═══════════════════════════════════════════════════════════

// ==========================================
// SEND COMMUNITY MESSAGE
// ==========================================

const sendCommunityMessage = async ({ message, imageUrl, user, userData, db, firebase }) => {
    try {
        const messageData = {
            roomId: 'main',  // Required for messages collection
            senderId: user.uid,
            senderName: userData?.displayName || userData?.firstName || 'Anonymous',
            content: message,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        };

        // Add image URL if provided
        if (imageUrl) {
            messageData.imageUrl = imageUrl;
        }

        await db.collection('messages').add(messageData);
    } catch (error) {
        console.error('Error sending community message:', error);
        throw error;
    }
};

// ==========================================
// SEND TOPIC ROOM MESSAGE
// ==========================================

const sendTopicRoomMessage = async ({
    roomId,
    content,
    imageFile = null,
    user,
    userData,
    db,
    firebase,
    setTopicRoomMessages
}) => {
    // Allow sending with just an image or just text
    if (!content && !imageFile) return;

    try {
        const messageData = {
            roomId: roomId,
            userId: user.uid,
            senderId: user.uid,
            senderName: userData?.displayName || userData?.firstName || 'Anonymous',
            message: content || '',  // Allow empty message if there's an image
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        };

        // Handle image upload if provided
        if (imageFile && imageFile instanceof File) {
            try {
                // Create canvas for resizing
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                const img = new Image();

                // Read and process the file
                const reader = new FileReader();

                const base64 = await new Promise((resolve, reject) => {
                    reader.onload = (e) => {
                        img.onload = () => {
                            // Resize to max 500x500 pixels for chat
                            const MAX_SIZE = 500;
                            let width = img.width;
                            let height = img.height;

                            if (width > height) {
                                if (width > MAX_SIZE) {
                                    height = Math.round((height * MAX_SIZE) / width);
                                    width = MAX_SIZE;
                                }
                            } else {
                                if (height > MAX_SIZE) {
                                    width = Math.round((width * MAX_SIZE) / height);
                                    height = MAX_SIZE;
                                }
                            }

                            canvas.width = width;
                            canvas.height = height;
                            ctx.drawImage(img, 0, 0, width, height);

                            // Convert to base64 with compression
                            const resizedBase64 = canvas.toDataURL('image/jpeg', 0.7);
                            resolve(resizedBase64);
                        };

                        img.onerror = () => reject(new Error('Failed to load image'));
                        img.src = e.target.result;
                    };

                    reader.onerror = () => reject(new Error('Failed to read file'));
                    reader.readAsDataURL(imageFile);
                });

                messageData.imageUrl = base64;
            } catch (imgError) {
                window.GLRSApp.utils.showNotification('Failed to process image, sending message only', 'warning');
            }
        }

        // Add message to Firestore
        await db.collection('messages').add(messageData);

        // Reload messages after sending
        const messagesSnap = await db.collection('messages')
            .where('roomId', '==', roomId)
            .orderBy('createdAt', 'desc')
            .limit(50)
            .get();

        const messages = [];
        messagesSnap.forEach(doc => {
            messages.push({ id: doc.id, ...doc.data() });
        });
        setTopicRoomMessages(messages.reverse());

    } catch (error) {
        console.error('Error sending topic room message:', error);
        window.GLRSApp.utils.showNotification('Failed to send message', 'error');
        throw error;
    }
};

// ==========================================
// ENTER TOPIC ROOM
// ==========================================

const enterTopicRoom = async ({
    room,
    db,
    setActiveTopicRoom,
    setTopicRoomMessages,
    setShowModal
}) => {
    setActiveTopicRoom(room);

    // Load room messages
    try {
        const messagesSnap = await db.collection('messages')
            .where('roomId', '==', room.id)
            .orderBy('createdAt', 'desc')
            .limit(50)
            .get();

        const messages = [];
        messagesSnap.forEach(doc => {
            messages.push({ id: doc.id, ...doc.data() });
        });
        setTopicRoomMessages(messages.reverse());
    } catch (error) {
        console.error('Error loading topic room messages:', error);
    }

    setShowModal('topicRoom');
};

// Register globally
window.GLRSApp = window.GLRSApp || { shared: {} };
window.GLRSApp.shared = window.GLRSApp.shared || {};
window.GLRSApp.shared.messagingActions = {
    sendCommunityMessage,
    sendTopicRoomMessage,
    enterTopicRoom
};

console.log('✅ Messaging actions loaded');
