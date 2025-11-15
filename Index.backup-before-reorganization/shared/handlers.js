// ============================================================
// GLRS LIGHTHOUSE - HANDLER FUNCTIONS
// ============================================================
// Event handler functions as React Hook with Context API access
// Converted to useHandlers hook pattern (Phase 8D-2)
// ============================================================

window.GLRSApp = window.GLRSApp || {};
window.GLRSApp.hooks = window.GLRSApp.hooks || {};

// ============================================================
// USEHANDLERS HOOK - Access state via Context API
// ============================================================

const useHandlers = () => {
    // Access ALL state from Context
    const {
        user,
        userData,
        pledgeMade,
        setPledgeMade,
        selectedImage,
        setSelectedImage,
        uploading,
        setUploading,
        topicMessage,
        setTopicMessage,
        gratitudeTheme,
        setGratitudeTheme,
        gratitudeText,
        setGratitudeText,
        setShowGratitudeModal,
        assignments,
        checkInStatus,
        setCheckInStatus,
        eveningReflectionData,
        setEveningReflectionData,
        setProfileImage,
        setUserData,
        setTopicRoomMessages,
        activeTopicRoom,
        // Functions from loaders
        updateGoalProgress,
        loadAssignments,
        loadGoals,
        updateStreak,
        loadReflections,
        loadCheckIns,
        loadDailyTasksStatus,
        // Functions from other handlers
        uploadChatImage,
        flagContent
    } = useAppContext();

    // Access Firebase from window
    const db = window.db;
    const firebase = window.firebase;

    // ============================================================
    // TOPIC ROOM HANDLERS
    // ============================================================

    const handleTopicImageSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Remove the size check here since we'll compress it
            setSelectedImage(file);
        }
    };

    const handleSendMessage = async () => {
        if ((!topicMessage.trim() && !selectedImage) || uploading) return;

        try {
            setUploading(true);
            const messageData = {
                senderId: user.uid,
                senderName: userData?.displayName || userData?.firstName || 'Anonymous',
                content: topicMessage,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                roomId: activeTopicRoom?.id
            };

            // Upload image if selected
            if (selectedImage) {
                const imageUrl = await uploadChatImage(selectedImage, 'topic', activeTopicRoom?.id);
                messageData.imageUrl = imageUrl;
                messageData.imageName = selectedImage.name;
            }

            await db.collection('topicRooms').doc(activeTopicRoom?.id)
                .collection('messages').add(messageData);

            setTopicMessage('');
            setSelectedImage(null);
            const fileInput = document.getElementById('topic-image-input');
            if (fileInput) fileInput.value = '';
        } catch (error) {
            alert(error.message || 'Failed to send message');
        } finally {
            setUploading(false);
        }
    };

    const handleFlagTopicMessage = async (message) => {
        const flagData = {
            roomId: activeTopicRoom?.id,
            roomName: activeTopicRoom?.name,
            messageId: message.id,
            messageContent: message.message,
            messageImageUrl: message.imageUrl || null,
            authorId: message.userId,
            authorName: message.userName
        };

        const flagged = await flagContent('topic_message', flagData);
        if (flagged && typeof setTopicRoomMessages === 'function') {
            setTopicRoomMessages(prev => prev.filter(m => m.id !== message.id));
        }
    };

    // ============================================================
    // ASSIGNMENT HANDLERS
    // ============================================================

    const handleAssignmentComplete = async (assignmentId, isCompleted) => {
        try {
            // First, get the assignment to check if it has a goalId
            const assignmentDoc = await db.collection('assignments').doc(assignmentId).get();
            const assignment = assignmentDoc.exists ? { id: assignmentDoc.id, ...assignmentDoc.data() } : null;

            if (!assignment) {
                throw new Error('Assignment not found');
            }

            // Update the assignment
            const updates = {
                status: isCompleted ? 'completed' : 'pending',
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            };

            if (isCompleted) {
                updates.completedAt = firebase.firestore.FieldValue.serverTimestamp();
            } else {
                updates.completedAt = null;
                updates.reflection = null;
            }

            await db.collection('assignments').doc(assignmentId).update(updates);

            // Update goal progress if this assignment belongs to a goal
            if (assignment.goalId && typeof updateGoalProgress === 'function') {
                await updateGoalProgress(assignment.goalId);
            }

            // Reload both assignments and goals to update all progress calculations
            if (typeof loadAssignments === 'function') await loadAssignments();
            if (typeof loadGoals === 'function') await loadGoals();

            // Update the GoalsTasksView if it exists
            if (window.goalsTasksViewInstance) {
                window.goalsTasksViewInstance.forceUpdate();
            }

            // If completed, send notification to coach
            if (isCompleted && userData?.assignedCoach) {
                await db.collection('notifications').add({
                    userId: userData.assignedCoach,
                    senderId: user.uid,
                    senderName: userData.displayName || userData.firstName || 'PIR',
                    type: 'assignment_completed',
                    title: 'Assignment Completed',
                    message: `${userData.displayName || 'PIR'} completed: ${assignment.title}`,
                    assignmentId: assignmentId,
                    read: false,
                    urgent: false,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                });
            }

            // Show success feedback
            const feedbackMsg = isCompleted ? 'Assignment marked complete!' : 'Assignment marked incomplete';
            window.GLRSApp.utils.showNotification(feedbackMsg, 'success');

        } catch (error) {
            window.GLRSApp.utils.showNotification('Failed to update assignment', 'error');
        }
    };

    const handleReflectionSave = async (assignmentId, reflection) => {
        try {
            await db.collection('assignments').doc(assignmentId).update({
                status: 'completed',
                reflection: reflection,
                completedAt: firebase.firestore.FieldValue.serverTimestamp(),
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });

            // Reload both to update progress everywhere
            if (typeof loadAssignments === 'function') await loadAssignments();
            if (typeof loadGoals === 'function') await loadGoals();

            // Send notification to coach with reflection
            const assignment = assignments?.find(a => a.id === assignmentId);
            if (assignment && userData?.assignedCoach) {
                await db.collection('notifications').add({
                    userId: userData.assignedCoach,
                    senderId: user.uid,
                    senderName: userData.displayName || userData.firstName || 'PIR',
                    type: 'assignment_reflection',
                    title: 'Assignment Completed with Reflection',
                    message: `${userData.displayName || 'PIR'} completed with reflection: ${assignment.title}`,
                    reflection: reflection,
                    assignmentId: assignmentId,
                    read: false,
                    urgent: false,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                });
            }

            window.GLRSApp.utils.showNotification('Assignment completed with reflection!', 'success');
        } catch (error) {
            window.GLRSApp.utils.showNotification('Failed to save reflection', 'error');
        }
    };

    // ============================================================
    // CHECK-IN HANDLERS
    // ============================================================

    const saveGratitude = async () => {
        try {
            if (!gratitudeTheme) {
                alert('Please select a theme');
                return;
            }
            if (!gratitudeText.trim()) {
                alert('Please write what you\'re grateful for');
                return;
            }

            await db.collection('gratitudes').add({
                userId: user.uid,
                theme: gratitudeTheme,
                text: gratitudeText.trim(),
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });

            // Reset form and close modal
            setGratitudeTheme('');
            setGratitudeText('');
            if (typeof setShowGratitudeModal === 'function') {
                setShowGratitudeModal(false);
            }

            // Show success message
            alert('Gratitude saved! 🙏');

            // Reload reflections to update top theme
            if (typeof loadReflections === 'function') {
                await loadReflections();
            }

        } catch (error) {
            alert('Error saving gratitude. Please try again.');
        }
    };

    const handlePledge = async () => {
        if (pledgeMade) return;

        try {
            await db.collection('pledges').add({
                userId: user.uid,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });

            setPledgeMade(true);

            await db.collection('notifications').add({
                userId: user.uid,
                type: 'pledge',
                title: 'Daily Pledge Made',
                message: 'You\'ve committed to your recovery today!',
                read: false,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });

            // Create activity log
            await db.collection('activities').add({
                userId: user.uid,
                type: 'pledge',
                description: 'Made daily pledge',
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        } catch (error) {
            console.error('Error saving pledge:', error);
        }
    };

    const handleMorningCheckIn = async (data) => {
        try {
            // Get user's timezone midnight boundaries (uses user.timezone preference, defaults to PST)
            // NOTE: Timezone is NEVER hardcoded - always uses user's profile setting
            const userTimezone = user.timezone || "America/Los_Angeles";
            const userNow = new Date(new Date().toLocaleString("en-US", {timeZone: userTimezone}));
            const today = new Date(userNow);
            today.setHours(0, 0, 0, 0);
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);

            // Check if check-in already exists for today
            const existingCheckIn = await db.collection('checkIns')
                .where('userId', '==', user.uid)
                .where('createdAt', '>=', today)
                .where('createdAt', '<', tomorrow)
                .get();

            if (existingCheckIn.empty) {
                // Create new check-in
                await db.collection('checkIns').add({
                    userId: user.uid,
                    morningData: data,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                });
            } else {
                // Update existing check-in
                await db.collection('checkIns').doc(existingCheckIn.docs[0].id).update({
                    morningData: data,
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                });
            }

            setCheckInStatus(prev => ({ ...prev, morning: true }));

            // Update streak
            if (typeof updateStreak === 'function') {
                await updateStreak();
            }

            // Check for auto-triggered alerts with NEW THRESHOLDS (0-10 scale)
            if (data.mood <= 3) {
                await db.collection('alerts').add({
                    userId: user.uid,
                    type: 'low_mood',
                    status: 'active',
                    severity: 'high',
                    message: `Low mood detected (${data.mood}/10)`,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                });
            }

            if (data.craving >= 7) {
                await db.collection('alerts').add({
                    userId: user.uid,
                    type: 'high_craving',
                    status: 'active',
                    severity: 'high',
                    message: `High craving intensity detected (${data.craving}/10)`,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                });
            }
        } catch (error) {
            alert('Failed to save check-in');
        }
    };

    const handleEveningReflection = async (data) => {
        try {
            const userTimezone = user.timezone || "America/Los_Angeles";
            const userNow = new Date(new Date().toLocaleString("en-US", {timeZone: userTimezone}));
            const today = new Date(userNow);
            today.setHours(0, 0, 0, 0);
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);

            // Save to checkIns collection with eveningData
            const existingCheckIn = await db.collection('checkIns')
                .where('userId', '==', user.uid)
                .where('createdAt', '>=', today)
                .where('createdAt', '<', tomorrow)
                .get();

            if (existingCheckIn.empty) {
                // Create new check-in with eveningData
                await db.collection('checkIns').add({
                    userId: user.uid,
                    tenantId: user.tenantId || 'glrs',
                    eveningData: data,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                });
            } else {
                // Update existing check-in with eveningData
                await db.collection('checkIns').doc(existingCheckIn.docs[0].id).update({
                    eveningData: data,
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                });
            }

            setCheckInStatus(prev => ({ ...prev, evening: true }));

            // Clear the form
            setEveningReflectionData({
                promptResponse: '',
                overallDay: 5,
                challenges: '',
                gratitude: '',
                tomorrowGoal: ''
            });

            // Reload reflections to update stats
            if (typeof loadReflections === 'function') await loadReflections();
            if (typeof loadCheckIns === 'function') await loadCheckIns();
            if (typeof loadDailyTasksStatus === 'function') await loadDailyTasksStatus();

            alert('Evening reflection complete!');
        } catch (error) {
            alert('Failed to save reflection');
        }
    };

    // ============================================================
    // PROFILE HANDLERS
    // ============================================================

    const handleProfileImageUpload = async (file) => {
        try {
            // Check file size (limit to 5MB for upload)
            if (file.size > 5 * 1024 * 1024) {
                window.GLRSApp.utils.showNotification('Image size must be less than 5MB', 'error');
                return;
            }

            // Show loading
            window.GLRSApp.utils.showNotification('Processing image...', 'info');

            // Create canvas for resizing
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();

            // Read and process the file
            const reader = new FileReader();

            reader.onload = async (e) => {
                img.onload = async () => {
                    try {
                        // Resize to max 300x300 pixels
                        const MAX_SIZE = 300;
                        let width = img.width;
                        let height = img.height;

                        // Calculate new dimensions maintaining aspect ratio
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

                        // Set canvas size
                        canvas.width = width;
                        canvas.height = height;

                        // Draw and compress image
                        ctx.drawImage(img, 0, 0, width, height);

                        // Convert to base64 with compression
                        let resizedBase64 = canvas.toDataURL('image/jpeg', 0.7);

                        // Check final size (should be under 500KB)
                        const base64Size = resizedBase64.length * 0.75;
                        if (base64Size > 500 * 1024) {
                            // Try with more compression
                            const moreCompressed = canvas.toDataURL('image/jpeg', 0.5);
                            if (moreCompressed.length * 0.75 > 500 * 1024) {
                                window.GLRSApp.utils.showNotification('Image is too large even after compression. Please choose a smaller image.', 'error');
                                return;
                            }
                            resizedBase64 = moreCompressed;
                        }

                        // Store directly in Firestore
                        await db.collection('users').doc(user.uid).update({
                            profileImageUrl: resizedBase64,
                            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                        });

                        // Update local state
                        if (typeof setProfileImage === 'function') {
                            setProfileImage(resizedBase64);
                        }

                        if (typeof setUserData === 'function') {
                            setUserData(prevData => ({
                                ...prevData,
                                profileImageUrl: resizedBase64
                            }));
                        }

                        // Update the displayed image immediately
                        const profileImgElements = document.querySelectorAll('.profile-image, #profileImage, .user-avatar');
                        profileImgElements.forEach(elem => {
                            if (elem.tagName === 'IMG') {
                                elem.src = resizedBase64;
                            } else {
                                elem.style.backgroundImage = `url(${resizedBase64})`;
                            }
                        });

                        window.GLRSApp.utils.showNotification('Profile image updated successfully!', 'success');

                    } catch (error) {
                        window.GLRSApp.utils.showNotification('Failed to process image', 'error');
                    }
                };

                img.onerror = () => {
                    window.GLRSApp.utils.showNotification('Failed to load image', 'error');
                };

                img.src = e.target.result;
            };

            reader.onerror = () => {
                window.GLRSApp.utils.showNotification('Failed to read file', 'error');
            };

            reader.readAsDataURL(file);

        } catch (error) {
            window.GLRSApp.utils.showNotification('Failed to upload image', 'error');
        }
    };

    // ============================================================
    // RETURN ALL HANDLERS
    // ============================================================

    return {
        handleTopicImageSelect,
        handleSendMessage,
        handleFlagTopicMessage,
        handleAssignmentComplete,
        handleReflectionSave,
        saveGratitude,
        handlePledge,
        handleMorningCheckIn,
        handleEveningReflection,
        handleProfileImageUpload
    };
};

// ============================================================
// EXPORTS
// ============================================================

// Register hook to namespace
window.GLRSApp.hooks.useHandlers = useHandlers;

// Keep backward compatibility for now
window.GLRSApp.handlers = window.GLRSApp.handlers || {};

console.log('✅ handlers.js loaded - useHandlers hook available');
