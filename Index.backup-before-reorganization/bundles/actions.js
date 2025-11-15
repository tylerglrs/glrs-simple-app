// ═══════════════════════════════════════════════════════════
// ASSIGNMENT & GOAL MANAGEMENT ACTIONS
// Business logic for completing assignments and updating goal progress
// ═══════════════════════════════════════════════════════════

// ==========================================
// COMPLETE ASSIGNMENT WITH REFLECTION
// ==========================================

const completeAssignment = async ({
    assignmentId,
    goalId,
    reflection,
    user,
    db,
    firebase,
    loadAssignments,
    loadGoals,
    loadComplianceRates,
    updateGoalProgress
}) => {
    try {
        await db.collection('assignments').doc(assignmentId).update({
            status: 'completed',
            completedAt: firebase.firestore.FieldValue.serverTimestamp(),
            reflection: reflection || ''
        });

        // Create activity log
        await db.collection('activities').add({
            userId: user.uid,
            type: 'assignment_completion',
            description: 'Completed assignment',
            assignmentId: assignmentId,
            reflection: reflection,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        // Create notification
        await db.collection('notifications').add({
            userId: user.uid,
            type: 'assignment',
            title: 'Assignment Completed',
            message: 'Great job completing your assignment!',
            read: false,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        if (goalId) {
            await updateGoalProgress({ goalId, user, db, firebase });
        }

        await loadAssignments();
        await loadGoals();
        await loadComplianceRates();
    } catch (error) {
        console.error('Error completing assignment:', error);
        throw error;
    }
};

// ==========================================
// UPDATE GOAL PROGRESS
// ==========================================

const updateGoalProgress = async ({ goalId, user, db, firebase }) => {
    try {
        // Get ALL assignments for this goal (not filtered by status)
        const assignmentsSnap = await db.collection('assignments')
            .where('goalId', '==', goalId)
            .where('userId', '==', user.uid)
            .get();

        let total = 0;
        let completed = 0;

        assignmentsSnap.forEach(doc => {
            total++;
            if (doc.data().status === 'completed') {
                completed++;
            }
        });

        const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

        // Update the goal document
        await db.collection('goals').doc(goalId).update({
            progress: progress,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        // Also check if goal should be marked complete (100% progress)
        if (progress === 100) {
            const goalDoc = await db.collection('goals').doc(goalId).get();
            if (goalDoc.exists && goalDoc.data().status !== 'completed') {
                await db.collection('goals').doc(goalId).update({
                    status: 'completed',
                    completedAt: firebase.firestore.FieldValue.serverTimestamp()
                });

                // Send notification to PIR about goal completion
                await db.collection('notifications').add({
                    userId: user.uid,
                    type: 'goal_completed',
                    title: 'Goal Completed!',
                    message: `Congratulations! You've completed the goal: ${goalDoc.data().title}`,
                    goalId: goalId,
                    read: false,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                });
            }
        }
    } catch (error) {
        console.error('Error updating goal progress:', error);
        throw error;
    }
};

// Register globally
window.GLRSApp = window.GLRSApp || { shared: {} };
window.GLRSApp.shared = window.GLRSApp.shared || {};
window.GLRSApp.shared.assignmentActions = {
    completeAssignment,
    updateGoalProgress
};

console.log('✅ Assignment actions loaded');
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
// ═══════════════════════════════════════════════════════════
// EMERGENCY & ALERT ACTIONS
// Business logic for SOS triggers and emergency alerts
// ═══════════════════════════════════════════════════════════

// ==========================================
// TRIGGER SOS EMERGENCY ALERT
// ==========================================

const triggerSOS = async ({ user, userData, db, firebase }) => {
    if (confirm('This will send an emergency alert to your coach. Continue?')) {
        try {
            await db.collection('alerts').add({
                userId: user.uid,
                type: 'sos',
                status: 'active',
                severity: 'critical',
                message: 'Emergency SOS triggered',
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });

            // Create notification for coach
            if (userData?.assignedCoach) {
                await db.collection('notifications').add({
                    userId: userData.assignedCoach,
                    type: 'emergency',
                    title: 'EMERGENCY SOS',
                    message: `${userData.displayName || user.email} has triggered an emergency alert!`,
                    pirId: user.uid,
                    severity: 'critical',
                    read: false,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                });
            }

            alert('Emergency alert sent. Your coach has been notified.');
        } catch (error) {
            console.error('Error triggering SOS:', error);
            alert('Failed to send alert. Please call 988 for immediate help.');
        }
    }
};

// Register globally
window.GLRSApp = window.GLRSApp || { shared: {} };
window.GLRSApp.shared = window.GLRSApp.shared || {};
window.GLRSApp.shared.emergencyActions = {
    triggerSOS
};

console.log('✅ Emergency actions loaded');
// ═══════════════════════════════════════════════════════════
// DATA EXPORT ACTIONS
// Business logic for exporting recovery data as JSON and PDF
// ═══════════════════════════════════════════════════════════

// ==========================================
// EXPORT DATA AS JSON
// ==========================================

const exportDataAsJSON = ({
    userData,
    checkIns,
    goals,
    assignments,
    sobrietyDays,
    checkInStreak,
    complianceRate
}) => {
    const exportData = {
        userData: userData,
        checkIns: checkIns,
        goals: goals,
        assignments: assignments,
        sobrietyDays: sobrietyDays,
        streak: checkInStreak,
        complianceRates: complianceRate,
        exportedAt: new Date().toISOString()
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', `recovery_data_${new Date().toISOString().split('T')[0]}.json`);
    linkElement.click();
};

// ==========================================
// EXPORT DATA AS PDF
// ==========================================

const exportDataAsPDF = ({
    userData,
    user,
    sobrietyDays,
    moneySaved,
    checkInStreak,
    complianceRate,
    checkIns,
    goals
}) => {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    doc.setFontSize(20);
    doc.text('Recovery Progress Report', 20, 20);

    doc.setFontSize(12);
    doc.text(`Name: ${userData?.displayName || userData?.firstName || user.email}`, 20, 40);
    doc.text(`Days Clean: ${sobrietyDays}`, 20, 50);
    doc.text(`Money Saved: $${moneySaved.toLocaleString()}`, 20, 60);
    doc.text(`Check-in Streak: ${checkInStreak} days`, 20, 70);
    doc.text(`Check-in Compliance: ${complianceRate.checkIn}%`, 20, 80);
    doc.text(`Assignment Completion: ${complianceRate.assignment}%`, 20, 90);
    doc.text(`Export Date: ${new Date().toLocaleDateString()}`, 20, 100);

    // Add recent check-ins
    if (checkIns.length > 0) {
        doc.text('Recent Check-ins:', 20, 120);
        checkIns.slice(0, 5).forEach((checkIn, index) => {
            const date = checkIn.createdAt?.toDate ?
                checkIn.createdAt.toDate().toLocaleDateString() : 'Unknown';
            const mood = checkIn.morningData?.mood || 'N/A';
            const craving = checkIn.morningData?.craving || 'N/A';
            doc.text(`${date} - Mood: ${mood}/5, Craving: ${craving}/5`, 30, 130 + (index * 10));
        });
    }

    // Add goals summary
    if (goals.length > 0) {
        doc.addPage();
        doc.text('Active Goals:', 20, 20);
        goals.forEach((goal, index) => {
            doc.text(`${goal.title} - ${goal.progress}% complete`, 30, 30 + (index * 10));
        });
    }

    doc.save(`recovery_report_${new Date().toISOString().split('T')[0]}.pdf`);
};

// Register globally
window.GLRSApp = window.GLRSApp || { shared: {} };
window.GLRSApp.shared = window.GLRSApp.shared || {};
window.GLRSApp.shared.exportActions = {
    exportDataAsJSON,
    exportDataAsPDF
};

console.log('✅ Export actions loaded');
// ═══════════════════════════════════════════════════════════
// NOTIFICATION ACTIONS
// Business logic for managing notifications
// ═══════════════════════════════════════════════════════════

// ==========================================
// MARK SINGLE NOTIFICATION AS READ
// ==========================================

const markNotificationAsRead = async ({ notificationId, db, firebase }) => {
    try {
        await db.collection('notifications').doc(notificationId).update({
            read: true,
            readAt: firebase.firestore.FieldValue.serverTimestamp()
        });
    } catch (error) {
        console.error('Error marking notification as read:', error);
    }
};

// ==========================================
// MARK ALL NOTIFICATIONS AS READ
// ==========================================

const markAllNotificationsAsRead = async ({ notifications, db, firebase }) => {
    try {
        const batch = db.batch();

        notifications.forEach(notification => {
            if (!notification.read) {
                const notificationRef = db.collection('notifications').doc(notification.id);
                batch.update(notificationRef, {
                    read: true,
                    readAt: firebase.firestore.FieldValue.serverTimestamp()
                });
            }
        });

        await batch.commit();
    } catch (error) {
        console.error('Error marking all notifications as read:', error);
    }
};

// Register globally
window.GLRSApp = window.GLRSApp || { shared: {} };
window.GLRSApp.shared = window.GLRSApp.shared || {};
window.GLRSApp.shared.notificationActions = {
    markNotificationAsRead,
    markAllNotificationsAsRead
};

console.log('✅ Notification actions loaded');
// ═══════════════════════════════════════════════════════════
// UI ACTIONS
// Business logic for UI interactions and state changes
// ═══════════════════════════════════════════════════════════

// ==========================================
// HANDLE PROFILE IMAGE SELECTION
// ==========================================

const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
        // Check file type
        if (!file.type.startsWith('image/')) {
            window.GLRSApp.utils.showNotification('Please select an image file', 'error');
            return;
        }

        // Use the upload handler from handlers.js
        window.GLRSApp.handlers.handleProfileImageUpload(file);
    }
};

// ==========================================
// DISMISS BROADCAST MESSAGE
// ==========================================

const dismissBroadcast = ({ setBroadcastDismissed, setActiveBroadcast }) => {
    setBroadcastDismissed(true);
    setActiveBroadcast(null);
};

// Register globally
window.GLRSApp = window.GLRSApp || { shared: {} };
window.GLRSApp.shared = window.GLRSApp.shared || {};
window.GLRSApp.shared.uiActions = {
    handleImageSelect,
    dismissBroadcast
};

console.log('✅ UI actions loaded');
