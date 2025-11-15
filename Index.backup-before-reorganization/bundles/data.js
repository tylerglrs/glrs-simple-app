// ============================================================
// GLRS LIGHTHOUSE - DATA LOADER FUNCTIONS
// ============================================================
// Data loading functions as React Hook with Context API access
// Converted to useLoaders hook pattern (Phase 8E)
// ============================================================

window.GLRSApp = window.GLRSApp || {};
window.GLRSApp.hooks = window.GLRSApp.hooks || {};

// ============================================================
// USELOADERS HOOK - Access state via Context API
// ============================================================

const useLoaders = () => {
    // Access ALL state from Context
    const {
        user,
        setLoading,
        setUserData,
        setProfileImage,
        setCoachInfo,
        setTopicRooms,
        setMeetings,
        setSupportGroups,
        setEmergencyResources,
        setGoals,
        setAssignments,
        setHabits,
        setTodayHabits,
        setQuickReflections,
        setTodayWins,
        setCheckInStatus,
        setDailyQuote,
        setDailyQuotes,
        setMilestones,
        setNextMilestone,
        setActiveBroadcast,
        setResources,
        setCheckIns,
        setStreakCheckIns,
        setPledgeMade,
        setCheckInStreak,
        setCoachNotes,
        setCalendarHeatmapData,
        setMoodWeekData,
        setOverallDayWeekData,
        setGratitudeJournalData,
        setGratitudeInsights,
        setChallengesHistoryData,
        setChallengesInsights,
        setTomorrowGoalsData,
        setGoalHistory,
        setYesterdayGoal,
        setGoalStatus,
        setGoalNotes,
        setReflectionData,
        setStreakReflections,
        setComplianceRate,
        setMoodChartData,
        setCravingChartData,
        setAnxietyChartData,
        setSleepChartData,
        userData,
        sobrietyDays,
        checkInStatus,
        setTotalCheckIns,
        setChallengeCheckInStatus,
        setChallengeCheckInNotes,
        setCheckInData,
        setGoalStats
    } = useAppContext();

    // Access Firebase from window
    const db = window.db;
    const firebase = window.firebase;
    const auth = window.auth;

// ============================================================
// BATCH 1: PRIMARY DATA LOADERS (Functions 1-10)
// ============================================================

    const loadAllData = async () => {
        try {
            setLoading(true);
            await loadUserData();
            await Promise.all([
                loadTopicRooms(),
                loadMeetings(),
                loadEmergencyResources(),
                loadGoals(),
                loadAssignments(),
                loadDailyInspiration(),
                loadMilestones(),
                loadBroadcasts(),
                loadResources(),
                loadSupportGroups(),
                loadCheckIns(),
                loadTodaysPledge(),
                loadStreak(),
                loadCoachNotes(),
                loadReflections(),
                loadComplianceRates(),
                window.GLRSApp.calculations.calculateMilestones(),
                checkMilestoneNotifications(),
                loadDailyTasksStatus(),
                window.GLRSApp.calculations.calculateTotalCheckIns().then(count => setTotalCheckIns(count)),
                window.GLRSApp.calculations.calculateStreaks(),
                window.GLRSApp.calculations.calculateReflectionStreaks()
            ]);
        } catch (error) {
        } finally {
            setLoading(false);
        }
    };

const loadUserData = async () => {
    try {
        const userDoc = await db.collection('users').doc(user.uid).get();
        if (userDoc.exists) {
            const data = userDoc.data();
            setUserData(data);

            if (data.profileImageUrl) {
                setProfileImage(data.profileImageUrl);
            }

            // Load coach info
            if (data.assignedCoach) {
                const coachDoc = await db.collection('users').doc(data.assignedCoach).get();
                if (coachDoc.exists) {
                    setCoachInfo(coachDoc.data());
                }
            }
        }
    } catch (error) {
    }
};

const loadTopicRooms = async () => {
    try {
        const roomsSnap = await db.collection('topicRooms')
            .where('active', '==', true)
            .get();

        const roomsData = [];
        roomsSnap.forEach(doc => {
            roomsData.push({ id: doc.id, ...doc.data() });
        });
        setTopicRooms(roomsData);
    } catch (error) {
    }
};

const loadMeetings = async () => {
    try {
        const currentUserId = auth.currentUser?.uid;
        if (!currentUserId) return;

        // Get meetings where this PIR is specifically assigned
        const assignedMeetingsSnap = await db.collection('meetings')
            .where('assignedPIRs', 'array-contains', currentUserId)
            .where('status', '==', 'scheduled')
            .get();
        
        // Get global meetings (for all PIRs)
        const globalMeetingsSnap = await db.collection('meetings')
            .where('isGlobal', '==', true)
            .where('status', '==', 'scheduled')
            .get();
        
        // Combine both results and remove duplicates
        const meetingsMap = new Map();
        
        assignedMeetingsSnap.forEach(doc => {
            meetingsMap.set(doc.id, { id: doc.id, ...doc.data() });
        });
        
        globalMeetingsSnap.forEach(doc => {
            if (!meetingsMap.has(doc.id)) {
                meetingsMap.set(doc.id, { id: doc.id, ...doc.data() });
            }
        });
        
        // Convert to array and sort by scheduled time
        const meetingsData = Array.from(meetingsMap.values()).sort((a, b) => {
            const timeA = a.scheduledTime?.toDate ? a.scheduledTime.toDate() : new Date(a.scheduledTime);
            const timeB = b.scheduledTime?.toDate ? b.scheduledTime.toDate() : new Date(b.scheduledTime);
            return timeA - timeB;
        });
        
        setMeetings(meetingsData);
    } catch (error) {
    }
};

// Load support groups user is assigned to
const loadSupportGroups = async () => {
    try {
        const groupsSnap = await db.collection('supportGroups')
            .where('active', '==', true)
            .orderBy('day')
            .get();

        const groupsData = [];
        groupsSnap.forEach(doc => {
            groupsData.push({ id: doc.id, ...doc.data() });
        });
        setSupportGroups(groupsData);
    } catch (error) {
    }
};

// Load emergency resources
const loadEmergencyResources = async () => {
    try {
        const emergencySnap = await db.collection('resources')
            .where('category', '==', 'emergency')
            .where('active', '==', true)
            .get();

        const emergencyData = [];
        emergencySnap.forEach(doc => {
            emergencyData.push({ id: doc.id, ...doc.data() });
        });
        setEmergencyResources(emergencyData);
    } catch (error) {
    }
};

// Load goals with objectives - UPDATED VERSION

const loadGoals = async () => {
    try {
        // Load ALL goals, not just active ones
        const goalsSnap = await db.collection('goals')
            .where('userId', '==', user.uid)
            .orderBy('createdAt', 'desc')
            .get();
        
        const goalsData = [];
        for (const doc of goalsSnap.docs) {
            const goalData = { id: doc.id, ...doc.data() };
            
            // Load assignments for this goal
            const assignmentsSnap = await db.collection('assignments')
                .where('goalId', '==', doc.id)
                .where('userId', '==', user.uid)
                .get();
            
            const assignments = [];
            assignmentsSnap.forEach(aDoc => {
                assignments.push({ id: aDoc.id, ...aDoc.data() });
            });
            
            goalData.assignments = assignments;
            
            // Calculate goal progress
            const completed = assignments.filter(a => a.status === 'completed').length;
            goalData.progress = assignments.length > 0 ? 
                Math.round((completed / assignments.length) * 100) : 0;
            
            goalsData.push(goalData);
        }
        
        setGoals(goalsData);
        
        // Update lifetime stats
        updateLifetimeStats(goalsData);
    } catch (error) {
    }
};

// Load standalone assignments - UPDATED VERSION

const loadAssignments = async () => {
    try {
        const assignmentsSnap = await db.collection('assignments')
            .where('userId', '==', user.uid)
            .orderBy('createdAt', 'desc')
            .get();
        
        const assignmentsData = [];
        assignmentsSnap.forEach(doc => {
            const assignment = { id: doc.id, ...doc.data() };
            assignmentsData.push(assignment);
        });
        
        setAssignments(assignmentsData);
        
        // Update lifetime completed count
        const completedCount = assignmentsData.filter(a => a.status === 'completed').length;
        updateLifetimeCompletedTasks(completedCount);
        
    } catch (error) {
    }
};

// Load habits from Firestore

const loadHabits = async () => {
    try {
        const habitsSnap = await db.collection('habits')
            .where('userId', '==', user.uid)
            .orderBy('createdAt', 'desc')
            .get();

        const habitsData = [];
        habitsSnap.forEach(doc => {
            habitsData.push({ id: doc.id, ...doc.data() });
        });

        setHabits(habitsData);
    } catch (error) {
    }
};

// Load today's habit completions

const loadTodayHabits = async () => {
    try {
        const userTimezone = user.timezone || "America/Los_Angeles";
        const userNow = new Date(new Date().toLocaleString("en-US", {timeZone: userTimezone}));
        const today = new Date(userNow);
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const todayHabitsSnap = await db.collection('habitCompletions')
            .where('userId', '==', user.uid)
            .where('completedAt', '>=', firebase.firestore.Timestamp.fromDate(today))
            .where('completedAt', '<', firebase.firestore.Timestamp.fromDate(tomorrow))
            .get();

        const todayHabitsData = [];
        todayHabitsSnap.forEach(doc => {
            todayHabitsData.push({ id: doc.id, ...doc.data() });
        });

        setTodayHabits(todayHabitsData);
    } catch (error) {
    }
};

// Load quick reflections


const loadQuickReflections = async () => {
    try {
        const reflectionsSnap = await db.collection('quickReflections')
            .where('userId', '==', user.uid)
            .orderBy('createdAt', 'desc')
            .limit(50)
            .get();

        const reflectionsData = [];
        reflectionsSnap.forEach(doc => {
            reflectionsData.push({ id: doc.id, ...doc.data() });
        });

        setQuickReflections(reflectionsData);
    } catch (error) {
    }
};

// Load today's wins

const loadTodayWins = async () => {
    try {
        const userTimezone = user.timezone || "America/Los_Angeles";
        const userNow = new Date(new Date().toLocaleString("en-US", {timeZone: userTimezone}));
        const today = new Date(userNow);
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const winsSnap = await db.collection('wins')
            .where('userId', '==', user.uid)
            .where('createdAt', '>=', firebase.firestore.Timestamp.fromDate(today))
            .where('createdAt', '<', firebase.firestore.Timestamp.fromDate(tomorrow))
            .orderBy('createdAt', 'desc')
            .get();

        const winsData = [];
        winsSnap.forEach(doc => {
            winsData.push({ id: doc.id, ...doc.data() });
        });

        setTodayWins(winsData);
    } catch (error) {
    }
};

// Reusable helper function to share content to community
const shareToCommunity = async (postType, content, sourceCollection, sourceId) => {
    try {
        await db.collection('communityPosts').add({
            // Author info
            userId: user.uid,
            userName: `${userData.firstName || ''} ${userData.lastName || ''}`.trim() || 'Anonymous',
            userAvatar: userData.photoURL || null,

            // Post details
            postType: postType,
            content: content,

            // Source tracking
            sourceCollection: sourceCollection,
            sourceId: sourceId,

            // Engagement
            likes: 0,
            likedBy: [],
            commentCount: 0,

            // Metadata
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            sharedAt: firebase.firestore.FieldValue.serverTimestamp(),
            tenantId: user.tenantId || 'glrs',
            isPublic: true,
            isPinned: false
        });
        return { success: true };
    } catch (error) {
        return { success: false, error };
    }
};

  // Calculate today's tasks (morning check-in + evening reflection + assignments)

// ============================================================
// BATCH 2: SECONDARY DATA LOADERS (Functions 11-20)
// ============================================================

const loadDailyTasksStatus = async () => {
    try {
        // Get user's timezone midnight boundaries (uses user.timezone preference, defaults to PST)
        // NOTE: Timezone is NEVER hardcoded - always uses user's profile setting
        const userTimezone = user.timezone || "America/Los_Angeles";
        const userNow = new Date(new Date().toLocaleString("en-US", {timeZone: userTimezone}));
        const today = new Date(userNow);
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        // Check for today's check-ins
        const todayCheckInsSnap = await db.collection('checkIns')
            .where('userId', '==', user.uid)
            .where('createdAt', '>=', today)
            .where('createdAt', '<', tomorrow)
            .get();
        
        let morningDone = false;
        let eveningDone = false;
        
        todayCheckInsSnap.forEach(doc => {
            const data = doc.data();
            if (data.morningData) morningDone = true;
            if (data.eveningData) eveningDone = true;
        });
        
        // Get ALL assignments (not just incomplete) to properly track today's work
        const assignmentsSnap = await db.collection('assignments')
            .where('userId', '==', user.uid)
            .get();
        
        const todayAssignments = [];
        let todayCompletedAssignments = 0;
        
        assignmentsSnap.forEach(doc => {
            const data = doc.data();
            const dueDate = data.dueDate?.toDate ? data.dueDate.toDate() : null;
            const completedAt = data.completedAt?.toDate ? data.completedAt.toDate() : null;
            
            // Check if this assignment is relevant for today
            let isRelevantForToday = false;
            
            if (dueDate) {
                const dueDateString = dueDate.toDateString();
                const todayString = today.toDateString();
                // Include if due today or overdue (and not completed before today)
                if (dueDateString === todayString || (dueDate < today && (!completedAt || completedAt >= today))) {
                    isRelevantForToday = true;
                }
            } else if (!data.dueDate && (!completedAt || completedAt >= today)) {
                // Include assignments without due dates that aren't already completed before today
                isRelevantForToday = true;
            }
            
            if (isRelevantForToday) {
                todayAssignments.push({ id: doc.id, ...data });
                
                // Check if it was completed TODAY
                if (completedAt && completedAt >= today && completedAt < tomorrow) {
                    todayCompletedAssignments++;
                }
            }
        });
        
        // Filter to get only incomplete assignments for display
        const incompleteAssignments = todayAssignments.filter(a => a.status !== 'completed');
        
        // Calculate totals
        const totalDailyTasks = 2; // Morning + Evening
        const completedDailyTasks = (morningDone ? 1 : 0) + (eveningDone ? 1 : 0);
        const totalTasks = totalDailyTasks + incompleteAssignments.length + todayCompletedAssignments;
        const completedTasks = completedDailyTasks + todayCompletedAssignments;
        
        // Update dashboard display
        const tasksStatElement = document.querySelector('.tasks-stat');
        if (tasksStatElement) {
            tasksStatElement.textContent = `${completedTasks}/${totalTasks} Today`;
        }
        
        // Set check-in status for UI
        setCheckInStatus({ morning: morningDone, evening: eveningDone });
        
        return {
            totalTasks,
            completedTasks,
            morningDone,
            eveningDone,
            assignments: incompleteAssignments, // Return only incomplete for display
            completedAssignmentsToday: todayCompletedAssignments
        };
    } catch (error) {
        return {
            totalTasks: 2,
            completedTasks: 0,
            morningDone: false,
            eveningDone: false,
            assignments: [],
            completedAssignmentsToday: 0
        };
    }
};

// Update lifetime stats with correct active goals calculation
const updateLifetimeStats = (goalsData) => {
    if (!goalsData) return;
    
    const completedGoals = goalsData.filter(g => g.status === 'completed').length;
    const activeGoals = goalsData.filter(g => g.status === 'active').length;
    const totalGoals = goalsData.length;
    
    // Update dashboard elements
    const goalsStatElement = document.querySelector('.goals-stat');
    if (goalsStatElement) {
        if (activeGoals === 0) {
            goalsStatElement.textContent = '0 Active';
        } else {
            goalsStatElement.textContent = `${activeGoals} Active / ${completedGoals} Complete`;
        }
    }
};

// Update lifetime completed tasks count
const updateLifetimeCompletedTasks = (count) => {
    const tasksStatElement = document.querySelector('.lifetime-tasks-stat');
    if (tasksStatElement) {
        tasksStatElement.textContent = count;
    }
};

// Handler for assignment completion - UPDATED with Goal Progress

// Handler for saving reflection with assignment

// Helper function to show notifications (add if not exists)
      // Fixed upload handler - saves data URL directly with message
const uploadChatImage = async (file, chatType, roomId) => {
    if (!file) return null;
    
    return new Promise((resolve, reject) => {
        // First compress the image
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                // Create canvas for compression
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                
                // Set max dimensions
                const maxWidth = 800;
                const maxHeight = 800;
                let width = img.width;
                let height = img.height;
                
                // Calculate new dimensions
                if (width > height) {
                    if (width > maxWidth) {
                        height = (maxWidth / width) * height;
                        width = maxWidth;
                    }
                } else {
                    if (height > maxHeight) {
                        width = (maxHeight / height) * width;
                        height = maxHeight;
                    }
                }
                
                // Set canvas size and draw compressed image
                canvas.width = width;
                canvas.height = height;
                ctx.drawImage(img, 0, 0, width, height);
                
                // Convert to data URL directly
                const dataUrl = canvas.toDataURL('image/jpeg', 0.6);
                
                // Check size
                if (dataUrl.length > 900000) { // ~900KB limit for safety
                    alert('Image too large. Please choose a smaller image.');
                    reject(new Error('Image too large after compression'));
                    return;
                }
                
                // Return the data URL directly - no Firestore save needed here
                resolve(dataUrl);
            };
            img.onerror = () => reject(new Error('Failed to load image'));
            img.src = e.target.result;
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
};
// Shared content flagging handler (this one is fine)
const flagContent = async (contentType, contentData) => {
    const reason = prompt('Please describe why you are flagging this content:');
    if (!reason) return false;
    
    try {
        await db.collection('flaggedContent').add({
            contentType: contentType, // 'topic_message' or 'community_message'
            ...contentData,
            flaggedBy: user.uid,
            flaggedByName: userData?.displayName || userData?.firstName || 'PIR',
            reason: reason,
            status: 'pending',
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        alert('Thank you. This content has been flagged for review.');
        return true;
    } catch (error) {
        alert('Failed to flag content');
        return false;
    }
};

// ALL FUNCTIONS GO HERE BEFORE THE RETURN STATEMENT

// Check for milestone notifications
const checkMilestoneNotifications = async () => {
    if (!userData?.sobrietyDate) return;
    
    const recoveryMilestones = window.GLRSApp.utils.getRecoveryMilestones(userData.sobrietyDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (const milestone of recoveryMilestones) {
        // Check if notification already sent today
        const existingNotif = await db.collection('notifications')
            .where('recipientId', '==', user.uid)
            .where('type', 'in', ['milestone_today', 'milestone_tomorrow'])
            .where('milestoneTitle', '==', milestone.title)
            .where('createdAt', '>=', today)
            .limit(1)
            .get();
        
        if (!existingNotif.empty) continue;
        
        // Send notification for milestone TODAY
        if (milestone.isToday) {
            // Notify PIR
            await db.collection('notifications').add({
                recipientId: user.uid,
                type: 'milestone_today',
                message: `Congratulations! You've reached ${milestone.title}!`,
                milestoneTitle: milestone.title,
                icon: milestone.icon,
                read: false,
                urgent: true,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            // Notify Coach
            if (userData.assignedCoach) {
                await db.collection('notifications').add({
                    recipientId: userData.assignedCoach,
                    senderId: user.uid,
                    senderName: userData.displayName || userData.firstName || 'PIR',
                    type: 'pir_milestone_achieved',
                    message: `${userData.displayName || 'PIR'} reached ${milestone.title}!`,
                    milestoneTitle: milestone.title,
                    icon: milestone.icon,
                    read: false,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                });
            }
        }
        
        // Send notification for milestone TOMORROW
        if (milestone.isTomorrow) {
            // Notify PIR
            await db.collection('notifications').add({
                recipientId: user.uid,
                type: 'milestone_tomorrow',
                message: `Tomorrow you'll reach ${milestone.title}! Keep going!`,
                milestoneTitle: milestone.title,
                icon: milestone.icon,
                read: false,
                urgent: false,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            // Notify Coach
            if (userData.assignedCoach) {
                await db.collection('notifications').add({
                    recipientId: userData.assignedCoach,
                    senderId: user.uid,
                    senderName: userData.displayName || userData.firstName || 'PIR',
                    type: 'pir_milestone_upcoming',
                    message: `${userData.displayName || 'PIR'} will reach ${milestone.title} tomorrow`,
                    milestoneTitle: milestone.title,
                    icon: milestone.icon,
                    read: false,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                });
            }
        }
    }
};

// Load daily inspiration (rotates by day of year)

const loadDailyInspiration = async () => {
    try {
        const inspirationsSnap = await db.collection('dailyInspirations')
            .where('active', '==', true)
            .get();
        
        if (!inspirationsSnap.empty) {
            const inspirations = [];
            inspirationsSnap.forEach(doc => {
                inspirations.push({ id: doc.id, ...doc.data() });
            });
            
            // Use day of year for consistent daily rotation
            const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
            const index = dayOfYear % inspirations.length;
            setDailyQuote(inspirations[index]);
        } else {
            setDailyQuote({
                quote: "One day at a time.",
                author: "Recovery Wisdom"
            });
        }
    } catch (error) {
        setDailyQuote({
            quote: "Progress, not perfection.",
            author: "Recovery Wisdom"
        });
    }
};

// Load milestones

const loadMilestones = async () => {
    try {
        const milestonesSnap = await db.collection('milestones')
            .orderBy('daysRequired', 'asc')
            .get();
        
        const milestonesData = [];
        milestonesSnap.forEach(doc => {
            milestonesData.push({ id: doc.id, ...doc.data() });
        });
        setMilestones(milestonesData);
        
        // Calculate next milestone
        if (userData?.sobrietyDate) {
            const daysClean = window.GLRSApp.utils.calculateSobrietyDays(userData.sobrietyDate);
            const next = milestonesData.find(m => m.daysRequired > daysClean);
            setNextMilestone(next);
        }
    } catch (error) {
    }
};

// Load broadcasts

const loadBroadcasts = async () => {
    try {
        const broadcastsSnap = await db.collection('broadcasts')
            .where('active', '==', true)
            .orderBy('createdAt', 'desc')
            .limit(1)
            .get();
        
        if (!broadcastsSnap.empty && !broadcastDismissed) {
            const broadcast = broadcastsSnap.docs[0].data();
            setActiveBroadcast(broadcast);
        }
    } catch (error) {
    }
};

// Add this to your PIRApp component's loadResources function - REPLACE the existing loadResources function

const loadResources = async () => {
    try {
        // Get ALL resources that are either global OR specifically assigned to this PIR
        const resourcesSnap = await db.collection('resources')
            .where('active', '==', true)
            .get();
        
        const resourcesData = {
            videos: [],
            articles: [], 
            tools: [],
            worksheets: []
        };
        
        resourcesSnap.forEach(doc => {
            const resource = { id: doc.id, ...doc.data() };
            
            // Skip emergency resources - they're handled separately
            if (resource.category === 'emergency') return;
            
            // Check if PIR should see this resource
            const shouldShowResource = 
                resource.isGlobal === true || // Global resource
                (resource.assignedPIRs && resource.assignedPIRs.includes(user.uid)) || // Specifically assigned
                resource.userId === user.uid; // Created for this PIR
            
            if (!shouldShowResource) return;
            
            // Categorize by type
            if (resource.type === 'video') {
                resourcesData.videos.push(resource);
            } else if (resource.type === 'article') {
                resourcesData.articles.push(resource);
            } else if (resource.type === 'tool') {
                resourcesData.tools.push(resource);
            } else if (resource.type === 'worksheet') {
                resourcesData.worksheets.push(resource);
            }
        });
        
        setResources(resourcesData);
    } catch (error) {
    }
};

// Load check-ins and prepare chart data

const loadCheckIns = async () => {
    try {
        const checkInsSnapshot = await db.collection('checkIns')
            .where('userId', '==', user.uid)
            .orderBy('createdAt', 'desc')
            .limit(30)
            .get();
        
        const checkInsList = [];
        checkInsSnapshot.forEach(doc => {
            checkInsList.push({ id: doc.id, ...doc.data() });
        });
        setCheckIns(checkInsList);
        
        // Check today's status
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        const todayCheckIn = checkInsList.find(checkIn => {
            const checkInDate = checkIn.createdAt?.toDate ? 
                checkIn.createdAt.toDate() : new Date(checkIn.createdAt);
            return checkInDate >= today && checkInDate < tomorrow;
        });
        
        if (todayCheckIn) {
            setCheckInStatus({
                morning: !!todayCheckIn.morningData,
                evening: !!todayCheckIn.eveningData
            });
        }
        
        // Prepare chart data
        prepareChartData(checkInsList);
    } catch (error) {
    }
};

// Load all check-ins for streak modal

const loadStreakCheckIns = async () => {
    try {
        // Load enough check-ins to cover potential streak (last 90 days should be more than enough)
        const checkInsSnapshot = await db.collection('checkIns')
            .where('userId', '==', user.uid)
            .orderBy('createdAt', 'desc')
            .limit(90)
            .get();

        const allCheckIns = [];
        checkInsSnapshot.forEach(doc => {
            allCheckIns.push({ id: doc.id, ...doc.data() });
        });

        // Calculate consecutive days from today backwards
        const streakList = [];
        // Get user's timezone midnight boundaries (uses user.timezone preference, defaults to PST)
        // NOTE: Timezone is NEVER hardcoded - always uses user's profile setting
        const userTimezone = user.timezone || "America/Los_Angeles";
        const userNow = new Date(new Date().toLocaleString("en-US", {timeZone: userTimezone}));
        const today = new Date(userNow);
        today.setHours(0, 0, 0, 0);

        let currentDate = new Date(today);
        let consecutiveDays = true;
        let dayIndex = 0;

        while (consecutiveDays && dayIndex < 365) {
            const nextDay = new Date(currentDate);
            nextDay.setDate(nextDay.getDate() + 1);

            // Find check-in for current date
            const dayCheckIn = allCheckIns.find(checkIn => {
                const checkInDate = checkIn.createdAt?.toDate ?
                    checkIn.createdAt.toDate() : new Date(checkIn.createdAt);
                // Convert check-in date to user's timezone (to match currentDate's calculation)
                const checkInUserTZ = new Date(checkInDate.toLocaleString("en-US", {timeZone: userTimezone}));
                checkInUserTZ.setHours(0, 0, 0, 0);
                return checkInUserTZ.getTime() === currentDate.getTime();
            });

            if (dayCheckIn) {
                streakList.push(dayCheckIn);
                currentDate.setDate(currentDate.getDate() - 1);
                dayIndex++;
            } else {
                // Allow grace period for today if before 6pm (user's timezone)
                if (dayIndex === 0 && userNow.getHours() < 18) {
                    currentDate.setDate(currentDate.getDate() - 1);
                    dayIndex++;
                    continue;
                }
                consecutiveDays = false;
            }
        }

        setStreakCheckIns(streakList);
    } catch (error) {
    }
};

// Prepare 30-day scrollable chart data
const prepareChartData = (checkInsList) => {
    const labels = [];
    const moodData = [];
    const cravingData = [];
    const anxietyData = [];
    const sleepData = [];
    
    // Get last 30 days
    for (let i = 29; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        
        const dateStr = date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric' 
        });
        labels.push(dateStr);
        
        // Find check-in for this date
        const checkIn = checkInsList.find(c => {
            const checkInDate = c.createdAt?.toDate ? 
                c.createdAt.toDate() : new Date(c.createdAt);
            return checkInDate.toDateString() === date.toDateString();
        });
        
        if (checkIn?.morningData) {
            // Use nullish coalescing to properly handle 0 values
            moodData.push(checkIn.morningData.mood ?? null);
            cravingData.push(checkIn.morningData.craving ?? null);
            // Support both old field names (anxietyLevel) and new field names (anxiety)
            anxietyData.push(checkIn.morningData.anxiety ?? checkIn.morningData.anxietyLevel ?? null);
            // Support both old field names (sleepQuality) and new field names (sleep)
            sleepData.push(checkIn.morningData.sleep ?? checkIn.morningData.sleepQuality ?? null);
        } else {
            moodData.push(null);
            cravingData.push(null);
            anxietyData.push(null);
            sleepData.push(null);
        }
    }
    
    setMoodChartData({
        labels: labels,
        datasets: [{
            label: 'Mood',
            data: moodData,
            borderColor: '#4caf50',
            backgroundColor: 'rgba(76, 175, 80, 0.1)',
            tension: 0.4,
            spanGaps: false
        }]
    });
    
    setCravingChartData({
        labels: labels,
        datasets: [{
            label: 'Cravings',
            data: cravingData,
            borderColor: '#ff9800',
            backgroundColor: 'rgba(255, 152, 0, 0.1)',
            tension: 0.4,
            spanGaps: false
        }]
    });
    
    setAnxietyChartData({
        labels: labels,
        datasets: [{
            label: 'Anxiety',
            data: anxietyData,
            borderColor: '#f44336',
            backgroundColor: 'rgba(244, 67, 54, 0.1)',
            tension: 0.4,
            spanGaps: false
        }]
    });
    
    setSleepChartData({
        labels: labels,
        datasets: [{
            label: 'Sleep Quality',
            data: sleepData,
            borderColor: '#9c27b0',
            backgroundColor: 'rgba(156, 39, 176, 0.1)',
            tension: 0.4,
            spanGaps: false
        }]
    });
};
   

// Enhanced chart initialization with scroll capability
useEffect(() => {
    if (currentView === 'progress' && moodChartData && cravingChartData && anxietyChartData && sleepChartData) {
        setTimeout(() => {
            const moodCanvas = document.getElementById('moodChart');
            const cravingCanvas = document.getElementById('cravingChart');
            const anxietyCanvas = document.getElementById('anxietyChart');
            const sleepCanvas = document.getElementById('sleepChart');
            
            // Destroy existing charts
            if (chartRef.current) {
                chartRef.current.destroy();
            }
            if (cravingChartRef.current) {
                cravingChartRef.current.destroy();
            }
            if (anxietyChartRef.current) {
                anxietyChartRef.current.destroy();
            }
            if (sleepChartRef.current) {
                sleepChartRef.current.destroy();
            }
            
            // Chart configuration remains the same
            const chartConfig = {
                type: 'line',
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    interaction: {
                        mode: 'index',
                        intersect: false,
                    },
                    plugins: {
                        legend: {
                            display: true,
                            position: 'top',
                        },
                        tooltip: {
                            enabled: true,
                            callbacks: {
                                label: function(context) {
                                    if (context.parsed.y === null) {
                                        return 'No data';
                                    }
                                    return `${context.dataset.label}: ${context.parsed.y}/10`;
                                }
                            }
                        },
                        zoom: {
                            zoom: {
                                wheel: {
                                    enabled: true,
                                },
                                pinch: {
                                    enabled: true
                                },
                                mode: 'x',
                            },
                            pan: {
                                enabled: true,
                                mode: 'x',
                            }
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            max: 10,
                            ticks: {
                                stepSize: 1
                            },
                            title: {
                                display: true,
                                text: 'Level (0-10)'
                            }
                        },
                        x: {
                            ticks: {
                                maxRotation: 45,
                                minRotation: 45
                            }
                        }
                    }
                }
            };
            
            if (moodCanvas) {
                const ctx = moodCanvas.getContext('2d');
                chartRef.current = new Chart(ctx, {
                    ...chartConfig,
                    data: moodChartData
                });
            }
            
            if (cravingCanvas) {
                const ctx = cravingCanvas.getContext('2d');
                cravingChartRef.current = new Chart(ctx, {
                    ...chartConfig,
                    data: cravingChartData
                });
            }
            
            if (anxietyCanvas) {
                const ctx = anxietyCanvas.getContext('2d');
                anxietyChartRef.current = new Chart(ctx, {
                    ...chartConfig,
                    data: anxietyChartData
                });
            }
            
            if (sleepCanvas) {
                const ctx = sleepCanvas.getContext('2d');
                sleepChartRef.current = new Chart(ctx, {
                    ...chartConfig,
                    data: sleepChartData
                });
            }
        }, 100);
    }
}, [currentView, moodChartData, cravingChartData, anxietyChartData, sleepChartData]);
    
// Load today's pledge status

const loadTodaysPledge = async () => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        const pledgeSnapshot = await db.collection('pledges')
            .where('userId', '==', user.uid)
            .where('createdAt', '>=', today)
            .where('createdAt', '<', tomorrow)
            .get();
        
        setPledgeMade(!pledgeSnapshot.empty);
    } catch (error) {
    }
};

// Load check-in streak and stats

const loadStreak = async () => {
    try {
        // Load last 90 days of check-ins for streak calculation
        const ninetyDaysAgo = new Date();
        ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

        const checkInsSnapshot = await db.collection('checkIns')
            .where('userId', '==', user.uid)
            .where('createdAt', '>=', ninetyDaysAgo)
            .orderBy('createdAt', 'desc')
            .get();

        const checkInsList = [];
        checkInsSnapshot.forEach(doc => {
            checkInsList.push({ id: doc.id, ...doc.data() });
        });

        setCheckInData(checkInsList);

        // Calculate streak (consecutive days from today backwards)
        let streak = 0;
        // Use user's timezone to match handleMorningCheckIn save logic
        // NOTE: Timezone is NEVER hardcoded - always uses user's profile setting
        const userTimezone = user.timezone || "America/Los_Angeles";
        const userNow = new Date(new Date().toLocaleString("en-US", {timeZone: userTimezone}));
        const today = new Date(userNow);
        today.setHours(0, 0, 0, 0);

        for (let i = 0; i < 365; i++) {
            const checkDate = new Date(today);
            checkDate.setDate(checkDate.getDate() - i);
            checkDate.setHours(0, 0, 0, 0);

            const nextDay = new Date(checkDate);
            nextDay.setDate(nextDay.getDate() + 1);

            const hasCheckIn = checkInsList.some(checkIn => {
                const checkInDate = checkIn.createdAt?.toDate ?
                    checkIn.createdAt.toDate() : new Date(checkIn.createdAt);
                // Convert check-in date to user's timezone (to match today's calculation)
                const checkInUserTZ = new Date(checkInDate.toLocaleString("en-US", {timeZone: userTimezone}));
                checkInUserTZ.setHours(0, 0, 0, 0);
                return checkInUserTZ.getTime() === checkDate.getTime();
            });

            if (hasCheckIn) {
                streak++;
            } else {
                // Allow 1 grace day for today if it's before evening (user's timezone)
                if (i === 0 && userNow.getHours() < 18) {
                    continue;
                }
                break;
            }
        }

        setCheckInStreak(streak);

        // Calculate weekly stats
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const recentCheckIns = checkInsList.filter(checkIn => {
            const checkInDate = checkIn.createdAt?.toDate ?
                checkIn.createdAt.toDate() : new Date(checkIn.createdAt);
            return checkInDate >= sevenDaysAgo;
        });

        // Check rate (percentage of last 30 days with check-ins)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const last30DaysCheckIns = checkInsList.filter(checkIn => {
            const checkInDate = checkIn.createdAt?.toDate ?
                checkIn.createdAt.toDate() : new Date(checkIn.createdAt);
            return checkInDate >= thirtyDaysAgo;
        });

        const checkRate = Math.round((last30DaysCheckIns.length / 30) * 100);

        // Average mood (from last 30 days)
        const moodValues = last30DaysCheckIns
            .filter(c => c.morningData?.mood)
            .map(c => c.morningData.mood);

        const avgMood = moodValues.length > 0
            ? (moodValues.reduce((a, b) => a + b, 0) / moodValues.length).toFixed(1)
            : 0;

        // This week completion (last 7 days)
        const thisWeekCompletion = Math.round((recentCheckIns.length / 7) * 100);

        setWeeklyStats({
            checkRate,
            avgMood: parseFloat(avgMood),
            thisWeekCompletion
        });

    } catch (error) {
    }
};

// Load coach notes

const loadCoachNotes = async () => {
    try {
        const notesSnapshot = await db.collection('coachNotes')
            .where('userId', '==', user.uid)
            .orderBy('createdAt', 'desc')
            .limit(5)
            .get();

        const notesList = [];
        notesSnapshot.forEach(doc => {
            notesList.push({ id: doc.id, ...doc.data() });
        });

        setCoachNotes(notesList);
    } catch (error) {
    }
};

// Load calendar heatmap data (365 days of check-ins)

// ============================================================
// BATCH 3: TERTIARY DATA LOADERS (Functions 21-33)
// ============================================================

const loadCalendarHeatmapData = async () => {
    try {
        // Get user's timezone
        const userTimezone = user.timezone || "America/Los_Angeles";

        // Fetch last 365 days of check-ins
        const oneYearAgo = new Date();
        oneYearAgo.setDate(oneYearAgo.getDate() - 365);

        const snapshot = await db.collection('checkIns')
            .where('userId', '==', user.uid)
            .where('createdAt', '>=', oneYearAgo)
            .orderBy('createdAt', 'desc')
            .get();

        // Process check-ins into calendar data
        const calendarData = {};

        snapshot.docs.forEach(doc => {
            const checkIn = doc.data();
            const checkInDate = checkIn.createdAt?.toDate ?
                checkIn.createdAt.toDate() : new Date(checkIn.createdAt);

            // Convert to user's timezone and extract date components properly
            const checkInUserTZ = new Date(checkInDate.toLocaleString("en-US", {timeZone: userTimezone}));

            // IMPORTANT: Create dateKey from date components, NOT from ISO string
            // ISO string converts back to UTC which can shift the date!
            const year = checkInUserTZ.getFullYear();
            const month = String(checkInUserTZ.getMonth() + 1).padStart(2, '0');
            const day = String(checkInUserTZ.getDate()).padStart(2, '0');
            const dateKey = `${year}-${month}-${day}`;

            if (!calendarData[dateKey]) {
                calendarData[dateKey] = {
                    date: checkInUserTZ,
                    dateKey: dateKey,
                    morningCheckIn: null,
                    eveningCheckIn: null,
                    count: 0
                };
            }

            // Determine if morning or evening check-in
            // IMPORTANT: Only count once per type (morning/evening) per day
            // This prevents duplicate counting if there are multiple documents for the same day
            if (checkIn.morningData && !calendarData[dateKey].morningCheckIn) {
                calendarData[dateKey].morningCheckIn = checkIn.morningData;
                calendarData[dateKey].count++;
            }
            if (checkIn.eveningData && !calendarData[dateKey].eveningCheckIn) {
                calendarData[dateKey].eveningCheckIn = checkIn.eveningData;
                calendarData[dateKey].count++;
            }
        });

        // Convert to array and sort by date
        const calendarArray = Object.values(calendarData).sort((a, b) =>
            new Date(a.dateKey) - new Date(b.dateKey)
        );

        setCalendarHeatmapData(calendarArray);

    } catch (error) {
    }
};

// Load 7-day mood data for mood insights modal

const loadMoodWeekData = async () => {
    try {
        // Get user's timezone
        const userTimezone = user.timezone || "America/Los_Angeles";

        // Fetch ALL check-ins (no date limit - pull complete history)
        const snapshot = await db.collection('checkIns')
            .where('userId', '==', user.uid)
            .orderBy('createdAt', 'desc')
            .get();

        // Process check-ins by day
        const moodByDay = {};

        snapshot.docs.forEach(doc => {
            const checkIn = doc.data();
            const checkInDate = checkIn.createdAt?.toDate ?
                checkIn.createdAt.toDate() : new Date(checkIn.createdAt);

            // Convert to user's timezone
            const checkInUserTZ = new Date(checkInDate.toLocaleString("en-US", {timeZone: userTimezone}));

            // Create dateKey
            const year = checkInUserTZ.getFullYear();
            const month = String(checkInUserTZ.getMonth() + 1).padStart(2, '0');
            const day = String(checkInUserTZ.getDate()).padStart(2, '0');
            const dateKey = `${year}-${month}-${day}`;

            // Get mood value (morning check-in mood, scale 1-10)
            const moodValue = checkIn.morningData?.mood;

            if (moodValue) {
                // Store the mood for this day (if multiple check-ins, take the latest/highest)
                if (!moodByDay[dateKey] || moodValue > moodByDay[dateKey].mood) {
                    moodByDay[dateKey] = {
                        dateKey: dateKey,
                        date: checkInUserTZ,
                        mood: moodValue
                    };
                }
            }
        });

        // Convert to array and sort by date (oldest first)
        const moodArray = Object.values(moodByDay).sort((a, b) =>
            new Date(a.dateKey) - new Date(b.dateKey)
        );

        // Split into last week and this week
        const today = new Date();

        // This week = last 7 days (days 0-6 from today)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(today.getDate() - 7);
        const sevenDaysAgoKey = `${sevenDaysAgo.getFullYear()}-${String(sevenDaysAgo.getMonth() + 1).padStart(2, '0')}-${String(sevenDaysAgo.getDate()).padStart(2, '0')}`;

        // Last week = 7 days before that (days 7-13 from today)
        const fourteenDaysAgo = new Date();
        fourteenDaysAgo.setDate(today.getDate() - 14);
        const fourteenDaysAgoKey = `${fourteenDaysAgo.getFullYear()}-${String(fourteenDaysAgo.getMonth() + 1).padStart(2, '0')}-${String(fourteenDaysAgo.getDate()).padStart(2, '0')}`;

        const thisWeekMoods = moodArray.filter(m => m.dateKey >= sevenDaysAgoKey);
        const lastWeekMoods = moodArray.filter(m => m.dateKey >= fourteenDaysAgoKey && m.dateKey < sevenDaysAgoKey);

        // Calculate averages (only from days with actual check-ins)
        const thisWeekAvg = thisWeekMoods.length > 0
            ? thisWeekMoods.reduce((sum, m) => sum + m.mood, 0) / thisWeekMoods.length
            : 0;

        const lastWeekAvg = lastWeekMoods.length > 0
            ? lastWeekMoods.reduce((sum, m) => sum + m.mood, 0) / lastWeekMoods.length
            : 0;

        // Create 7-day breakdown (last 7 days)
        const weekData = [];
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);

            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const dateKey = `${year}-${month}-${day}`;

            const dayName = dayNames[date.getDay()];
            const moodData = moodByDay[dateKey];

            weekData.push({
                dateKey: dateKey,
                dayName: dayName,
                mood: moodData ? moodData.mood : null, // null means no check-in
                hasMood: !!moodData
            });
        }

        setMoodWeekData({
            thisWeekAvg: parseFloat(thisWeekAvg.toFixed(1)),
            lastWeekAvg: parseFloat(lastWeekAvg.toFixed(1)),
            difference: parseFloat((thisWeekAvg - lastWeekAvg).toFixed(1)),
            weekData: weekData
        });

    } catch (error) {
    }
};

// Load 7-day overall day score data for overall day insights modal

const loadOverallDayWeekData = async () => {
    try {
        // Get user's timezone
        const userTimezone = user.timezone || "America/Los_Angeles";

        // Fetch ALL check-ins (no date limit - pull complete history)
        const snapshot = await db.collection('checkIns')
            .where('userId', '==', user.uid)
            .orderBy('createdAt', 'desc')
            .get();

        // Process check-ins by day
        const overallDayByDay = {};

        snapshot.docs.forEach(doc => {
            const checkIn = doc.data();
            const checkInDate = checkIn.createdAt?.toDate ?
                checkIn.createdAt.toDate() : new Date(checkIn.createdAt);

            // Convert to user's timezone
            const checkInUserTZ = new Date(checkInDate.toLocaleString("en-US", {timeZone: userTimezone}));

            // Create dateKey
            const year = checkInUserTZ.getFullYear();
            const month = String(checkInUserTZ.getMonth() + 1).padStart(2, '0');
            const day = String(checkInUserTZ.getDate()).padStart(2, '0');
            const dateKey = `${year}-${month}-${day}`;

            // Get overall day score (evening reflection overallDay, scale 1-10)
            const overallDayValue = checkIn.eveningData?.overallDay;

            if (overallDayValue) {
                // Store the overall day score for this day (if multiple check-ins, take the latest/highest)
                if (!overallDayByDay[dateKey] || overallDayValue > overallDayByDay[dateKey].overallDay) {
                    overallDayByDay[dateKey] = {
                        dateKey: dateKey,
                        date: checkInUserTZ,
                        overallDay: overallDayValue
                    };
                }
            }
        });

        // Convert to array and sort by date (oldest first)
        const overallDayArray = Object.values(overallDayByDay).sort((a, b) =>
            new Date(a.dateKey) - new Date(b.dateKey)
        );

        // Calculate averages from last 14 reflections (7 most recent + 7 before that)
        const last14Reflections = overallDayArray.slice(-14); // Get last 14 reflections
        const thisWeekScores = last14Reflections.slice(-7); // Last 7 reflections
        const lastWeekScores = last14Reflections.slice(0, 7); // Previous 7 reflections

        // Calculate averages
        const thisWeekAvg = thisWeekScores.length > 0
            ? thisWeekScores.reduce((sum, m) => sum + m.overallDay, 0) / thisWeekScores.length
            : 0;

        const lastWeekAvg = lastWeekScores.length > 0
            ? lastWeekScores.reduce((sum, m) => sum + m.overallDay, 0) / lastWeekScores.length
            : 0;

        // Create 7-day breakdown (last 7 DAYS WITH REFLECTIONS, not calendar days)
        const weekData = [];
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

        // Get all dates with reflections, sorted newest first
        const datesWithReflections = Object.keys(overallDayByDay)
            .sort((a, b) => new Date(b) - new Date(a))
            .slice(0, 7); // Take the 7 most recent days WITH reflections

        // Create week data from these dates
        datesWithReflections.reverse().forEach(dateKey => {
            const date = new Date(dateKey);
            const dayName = dayNames[date.getDay()];
            const overallDayData = overallDayByDay[dateKey];

            weekData.push({
                dateKey: dateKey,
                dayName: dayName,
                date: date,
                overallDay: overallDayData.overallDay,
                hasOverallDay: true
            });
        });

        setOverallDayWeekData({
            thisWeekAvg: parseFloat(thisWeekAvg.toFixed(1)),
            lastWeekAvg: parseFloat(lastWeekAvg.toFixed(1)),
            difference: parseFloat((thisWeekAvg - lastWeekAvg).toFixed(1)),
            weekData: weekData
        });

    } catch (error) {
    }
};

// Load gratitude journal data

const loadGratitudeJournal = async () => {
    try {
        const userTimezone = user.timezone || "America/Los_Angeles";

        // Fetch all check-ins with gratitude
        const snapshot = await db.collection('checkIns')
            .where('userId', '==', user.uid)
            .orderBy('createdAt', 'desc')
            .get();

        const gratitudes = [];
        snapshot.docs.forEach(doc => {
            const checkIn = doc.data();
            if (checkIn.eveningData?.gratitude && checkIn.eveningData.gratitude.trim()) {
                const checkInDate = checkIn.createdAt?.toDate ?
                    checkIn.createdAt.toDate() : new Date(checkIn.createdAt);
                const checkInUserTZ = new Date(checkInDate.toLocaleString("en-US", {timeZone: userTimezone}));

                gratitudes.push({
                    id: doc.id,
                    date: checkInUserTZ,
                    gratitude: checkIn.eveningData.gratitude,
                    overallDay: checkIn.eveningData.overallDay || null
                });
            }
        });

        setGratitudeJournalData(gratitudes);
    } catch (error) {
    }
};

// Load gratitude insights from Cloud Functions

const loadGratitudeInsights = async () => {
    try {
        // Read pre-computed insights from Cloud Functions
        const insightsRef = db.collection('users').doc(user.uid)
            .collection('insights').doc('gratitude');

        const insightsDoc = await insightsRef.get();

        if (insightsDoc.exists) {
            const data = insightsDoc.data();
            setGratitudeInsights(data);
        } else {
            setGratitudeInsights(null);
        }
    } catch (error) {
        setGratitudeInsights(null);
    }
};

// Load daily quotes from Firestore

const loadDailyQuotes = async () => {
    try {
        const quotesSnapshot = await db.collection('dailyQuotes')
            .orderBy('order', 'asc')
            .get();

        if (!quotesSnapshot.empty) {
            const quotes = quotesSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setDailyQuotes(quotes);
        } else {
            // Fallback to default quotes if Firestore is empty
            setDailyQuotes([
                { quote: "One day at a time.", author: "Anonymous", order: 1 },
                { quote: "Progress, not perfection.", author: "Anonymous", order: 2 },
                { quote: "You are stronger than you think.", author: "Anonymous", order: 3 },
                { quote: "Every day is a new beginning.", author: "Anonymous", order: 4 },
                { quote: "Believe in yourself and all that you are.", author: "Anonymous", order: 5 }
            ]);
        }
    } catch (error) {
        // Fallback on error
        setDailyQuotes([
            { quote: "One day at a time.", author: "Anonymous", order: 1 },
            { quote: "Progress, not perfection.", author: "Anonymous", order: 2 },
            { quote: "You are stronger than you think.", author: "Anonymous", order: 3 },
            { quote: "Every day is a new beginning.", author: "Anonymous", order: 4 },
            { quote: "Believe in yourself and all that you are.", author: "Anonymous", order: 5 }
        ]);
    }
};

// Load challenges history data

const loadChallengesHistory = async () => {
    try {
        const userTimezone = user.timezone || "America/Los_Angeles";

        // Fetch all check-ins with challenges
        const snapshot = await db.collection('checkIns')
            .where('userId', '==', user.uid)
            .orderBy('createdAt', 'desc')
            .get();

        const challenges = [];
        snapshot.docs.forEach(doc => {
            const checkIn = doc.data();
            if (checkIn.eveningData?.challenges && checkIn.eveningData.challenges.trim()) {
                const checkInDate = checkIn.createdAt?.toDate ?
                    checkIn.createdAt.toDate() : new Date(checkIn.createdAt);
                const checkInUserTZ = new Date(checkInDate.toLocaleString("en-US", {timeZone: userTimezone}));

                challenges.push({
                    id: doc.id,
                    date: checkInUserTZ,
                    challenges: checkIn.eveningData.challenges,
                    overallDay: checkIn.eveningData.overallDay || null
                });
            }
        });

        setChallengesHistoryData(challenges);
    } catch (error) {
    }
};

// Submit challenge check-in
const submitChallengeCheckIn = async () => {
    if (!selectedChallenge || !challengeCheckInStatus) {
        alert('Please select a status');
        return;
    }

    if (!challengeCheckInNotes.trim()) {
        alert('Please add notes about your progress');
        return;
    }

    try {
        // Update the challenge tracking document
        await db.collection('challenges_tracking').doc(selectedChallenge.id).update({
            status: challengeCheckInStatus === 'resolved' ? 'resolved' : 'ongoing',
            lastCheckInDate: firebase.firestore.FieldValue.serverTimestamp(),
            checkIns: firebase.firestore.FieldValue.arrayUnion({
                date: firebase.firestore.FieldValue.serverTimestamp(),
                status: challengeCheckInStatus,
                notes: challengeCheckInNotes
            })
        });

        // If resolved, create breakthrough notification
        if (challengeCheckInStatus === 'resolved') {
            await db.collection('notifications').add({
                userId: user.uid,
                type: 'breakthrough',
                title: '🎉 Breakthrough Moment!',
                message: `You've resolved a challenge: ${selectedChallenge.challengeText.substring(0, 50)}...`,
                challengeId: selectedChallenge.id,
                read: false,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        }


        // Close modal and reset
        setShowChallengeCheckInModal(false);
        setSelectedChallenge(null);
        setChallengeCheckInStatus('');
        setChallengeCheckInNotes('');

        alert(challengeCheckInStatus === 'resolved' ? '🎉 Congratulations on resolving this challenge!' : '✅ Check-in saved');

    } catch (error) {
        alert('Error saving check-in. Please try again.');
    }
};

// Load tomorrow's goals data

const loadTomorrowGoals = async () => {
    try {
        const userTimezone = user.timezone || "America/Los_Angeles";

        // Fetch all check-ins with tomorrow goals
        const snapshot = await db.collection('checkIns')
            .where('userId', '==', user.uid)
            .orderBy('createdAt', 'desc')
            .get();

        const goals = [];
        snapshot.docs.forEach(doc => {
            const checkIn = doc.data();
            if (checkIn.eveningData?.tomorrowGoal && checkIn.eveningData.tomorrowGoal.trim()) {
                const checkInDate = checkIn.createdAt?.toDate ?
                    checkIn.createdAt.toDate() : new Date(checkIn.createdAt);
                const checkInUserTZ = new Date(checkInDate.toLocaleString("en-US", {timeZone: userTimezone}));

                // Calculate the "tomorrow" date this goal was for
                const goalDate = new Date(checkInUserTZ);
                goalDate.setDate(goalDate.getDate() + 1);

                goals.push({
                    id: doc.id,
                    setOnDate: checkInUserTZ,
                    goalDate: goalDate,
                    goal: checkIn.eveningData.tomorrowGoal,
                    overallDay: checkIn.eveningData.overallDay || null
                });
            }
        });

        setTomorrowGoalsData(goals);
    } catch (error) {
    }
};

// Load goal achievement history and yesterday's goal

const loadGoalAchievementData = async () => {
    try {
        const userTimezone = user.timezone || "America/Los_Angeles";

        // Get yesterday's date
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        yesterday.setHours(0, 0, 0, 0);
        const yesterdayEnd = new Date(yesterday);
        yesterdayEnd.setHours(23, 59, 59, 999);

        // Find yesterday's goal from check-ins
        const yesterdayGoalSnap = await db.collection('checkIns')
            .where('userId', '==', user.uid)
            .where('createdAt', '>=', yesterday)
            .where('createdAt', '<=', yesterdayEnd)
            .get();

        let foundYesterdayGoal = null;
        yesterdayGoalSnap.docs.forEach(doc => {
            const checkIn = doc.data();
            if (checkIn.eveningData?.tomorrowGoal && checkIn.eveningData.tomorrowGoal.trim()) {
                foundYesterdayGoal = {
                    id: doc.id,
                    goal: checkIn.eveningData.tomorrowGoal,
                    setDate: checkIn.createdAt.toDate()
                };
            }
        });

        setYesterdayGoal(foundYesterdayGoal);

        // Load goal history from goals_tracking collection
        const historySnap = await db.collection('goals_tracking')
            .where('userId', '==', user.uid)
            .orderBy('checkedInAt', 'desc')
            .limit(30)
            .get();

        const history = historySnap.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            checkedInAt: doc.data().checkedInAt?.toDate()
        }));

        setGoalHistory(history);

        // Calculate stats
        window.GLRSApp.calculations.calculateGoalStats(history);

    } catch (error) {
    }
};

// Calculate goal achievement statistics

// Submit goal achievement check-in
const submitGoalAchievement = async () => {
    if (!yesterdayGoal || !goalStatus) {
        alert('Please select how you did with your goal');
        return;
    }

    try {
        // Save to goals_tracking collection
        await db.collection('goals_tracking').add({
            userId: user.uid,
            goal: yesterdayGoal.goal,
            goalSetDate: firebase.firestore.Timestamp.fromDate(yesterdayGoal.setDate),
            status: goalStatus,
            notes: goalNotes.trim(),
            checkedInAt: firebase.firestore.FieldValue.serverTimestamp()
        });


        // Reload data
        await loadGoalAchievementData();

        // Reset form
        setGoalStatus('');
        setGoalNotes('');
        setYesterdayGoal(null);

        alert(goalStatus === 'yes' ? '🎉 Awesome! Keep up the great work!' : '✅ Goal check-in saved');

    } catch (error) {
        alert('Error saving check-in. Please try again.');
    }
};

// Share reflections summary
const shareReflections = async () => {
    try {
        window.GLRSApp.utils.triggerHaptic('medium');

        // 🔍 DIAGNOSTIC: Check auth state
        console.log('🔍 Share Reflections - Auth Check:');
        console.log('  - user object:', user);
        console.log('  - user.uid:', user?.uid);
        console.log('  - Firebase auth:', firebase.auth().currentUser);
        console.log('  - Auth UID:', firebase.auth().currentUser?.uid);

        if (!user || !user.uid) {
            alert('❌ You must be logged in to share reflections');
            return;
        }

        // Get last 30 days of reflections
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        console.log('🔍 Querying checkIns for userId:', user.uid);

        const snapshot = await db.collection('checkIns')
            .where('userId', '==', user.uid)
            .where('createdAt', '>=', thirtyDaysAgo)
            .orderBy('createdAt', 'desc')
            .get();

        const reflections = [];
        snapshot.docs.forEach(doc => {
            const checkIn = doc.data();
            if (checkIn.eveningData && (checkIn.eveningData.gratitude || checkIn.eveningData.overallDay)) {
                const checkInDate = checkIn.createdAt?.toDate ?
                    checkIn.createdAt.toDate() : new Date(checkIn.createdAt);

                reflections.push({
                    date: checkInDate,
                    overallDay: checkIn.eveningData.overallDay,
                    gratitude: checkIn.eveningData.gratitude,
                    challenges: checkIn.eveningData.challenges
                });
            }
        });

        if (reflections.length === 0) {
            alert('No reflections to share yet. Start your evening reflections to build your journal!');
            return;
        }

        // Calculate stats
        const avgScore = reflections
            .filter(r => r.overallDay)
            .reduce((sum, r) => sum + r.overallDay, 0) / reflections.filter(r => r.overallDay).length;

        const gratitudeCount = reflections.filter(r => r.gratitude && r.gratitude.trim()).length;

        // Get recent gratitudes (last 5)
        const recentGratitudes = reflections
            .filter(r => r.gratitude && r.gratitude.trim())
            .slice(0, 5);

        // Create shareable text
        const shareText = `🌟 My Recovery Reflections (Last 30 Days)

📊 ${reflections.length} reflections completed
⭐ ${avgScore ? avgScore.toFixed(1) : '—'}/10 average daily score
💚 ${gratitudeCount} gratitudes expressed

Recent Gratitudes:
${recentGratitudes.map((r, i) => `${i + 1}. ${r.gratitude.length > 100 ? r.gratitude.substring(0, 100) + '...' : r.gratitude}`).join('\n')}

Staying committed to my recovery journey! 🙏

—
Shared from GLRS Lighthouse Recovery App`;

        // Use Web Share API if available
        if (navigator.share) {
            await navigator.share({
                title: 'My Recovery Reflections',
                text: shareText
            });
            window.GLRSApp.utils.triggerHaptic('success');
        } else {
            // Fallback: Copy to clipboard
            await navigator.clipboard.writeText(shareText);
            window.GLRSApp.utils.triggerHaptic('success');
            alert('✅ Reflections summary copied to clipboard!\n\nYou can now paste and share via text, email, or social media.');
        }

    } catch (error) {
        console.error('❌ Share reflections error:', error);
        console.error('   - Error code:', error.code);
        console.error('   - Error message:', error.message);
        console.error('   - Error name:', error.name);

        if (error.name === 'AbortError') {
            // User cancelled share - silent
            console.log('ℹ️ Share cancelled by user');
        } else if (error.code === 'permission-denied') {
            window.GLRSApp.utils.triggerHaptic('error');
            alert('❌ Permission denied: You don\'t have access to your check-in data.\n\nPlease try logging out and logging back in.');
        } else {
            window.GLRSApp.utils.triggerHaptic('error');
            alert('❌ Error sharing reflections:\n\n' + error.message + '\n\nPlease check console for details.');
        }
    }
};

// Calculate all check-in streaks

// Load reflections and calculate stats

const loadReflections = async () => {
    try {
        // Load ALL check-ins that have evening reflections (all-time for accurate average)
        const checkInsSnapshot = await db.collection('checkIns')
            .where('userId', '==', user.uid)
            .orderBy('createdAt', 'desc')
            .get();

        // Extract only check-ins that have eveningData
        const reflectionsList = [];
        checkInsSnapshot.forEach(doc => {
            const data = doc.data();
            if (data.eveningData) {
                // Flatten structure for easier use
                reflectionsList.push({
                    id: doc.id,
                    createdAt: data.createdAt,
                    updatedAt: data.updatedAt,
                    // Extract eveningData fields to top level
                    overallDay: data.eveningData.overallDay,
                    challenges: data.eveningData.challenges,
                    gratitude: data.eveningData.gratitude,
                    tomorrowGoal: data.eveningData.tomorrowGoal,
                    promptResponse: data.eveningData.promptResponse || '',
                    // Keep original eveningData for modal display
                    eveningData: data.eveningData
                });
            }
        });

        setReflectionData(reflectionsList);


        // Calculate reflection streak
        let streak = 0;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        for (let i = 0; i < 365; i++) {
            const checkDate = new Date(today);
            checkDate.setDate(checkDate.getDate() - i);
            checkDate.setHours(0, 0, 0, 0);

            const hasReflection = reflectionsList.some(reflection => {
                const reflectionDate = reflection.createdAt?.toDate ?
                    reflection.createdAt.toDate() : new Date(reflection.createdAt);
                reflectionDate.setHours(0, 0, 0, 0);
                return reflectionDate.getTime() === checkDate.getTime();
            });

            if (hasReflection) {
                streak++;
            } else {
                // Allow grace day for today if before 9 PM
                if (i === 0 && new Date().getHours() < 21) {
                    continue;
                }
                break;
            }
        }

        setReflectionStreak(streak);

        // Calculate all-time stats (entire account history)
        const totalAllTime = reflectionsList.length;

        // Calculate avg daily score from ALL reflections (all-time average)
        const scores = reflectionsList
            .filter(r => r.overallDay !== undefined && r.overallDay !== null)
            .map(r => r.overallDay);

        const avgDailyScore = scores.length > 0
            ? parseFloat((scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1))
            : 0;


        // Get themes from Cloud Functions insights (if available)
        let topGratitudeTheme = '';
        let gratitudeThemesData = [];

        try {
            const insightsRef = db.collection('users').doc(user.uid)
                .collection('insights').doc('gratitude');
            const insightsDoc = await insightsRef.get();

            if (insightsDoc.exists) {
                const insightsData = insightsDoc.data();
                if (insightsData.computed?.topThemes && insightsData.computed.topThemes.length > 0) {
                    // Use Cloud Functions computed themes
                    gratitudeThemesData = insightsData.computed.topThemes.map(t => ({
                        theme: t.theme,
                        count: Math.round((t.percentage / 100) * insightsData.totalCount) || 1,
                        percentage: t.percentage,
                        emotionalWeight: t.emotionalWeight
                    }));
                    topGratitudeTheme = gratitudeThemesData[0].theme;
                }
            }
        } catch (error) {
        }

        setReflectionStats({
            totalThisMonth: totalAllTime,
            avgDailyScore: avgDailyScore,
            topGratitudeTheme,
            gratitudeThemes: gratitudeThemesData // Store Cloud Functions themes
        });

    } catch (error) {
    }
};

// Load all reflections for streak modal

const loadStreakReflections = async () => {
    try {
        // Load check-ins with evening reflections (last 90 days)
        const ninetyDaysAgo = new Date();
        ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

        const checkInsSnapshot = await db.collection('checkIns')
            .where('userId', '==', user.uid)
            .where('createdAt', '>=', ninetyDaysAgo)
            .orderBy('createdAt', 'desc')
            .get();

        // Extract only check-ins that have eveningData
        const allReflections = [];
        checkInsSnapshot.forEach(doc => {
            const data = doc.data();
            if (data.eveningData) {
                // Flatten structure for modal display
                allReflections.push({
                    id: doc.id,
                    createdAt: data.createdAt,
                    updatedAt: data.updatedAt,
                    // Extract eveningData fields
                    overallDay: data.eveningData.overallDay,
                    challenges: data.eveningData.challenges,
                    gratitude: data.eveningData.gratitude,
                    tomorrowGoal: data.eveningData.tomorrowGoal,
                    promptResponse: data.eveningData.promptResponse || '',
                    eveningData: data.eveningData
                });
            }
        });


        // Calculate consecutive days from today backwards
        const streakList = [];
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        let currentDate = new Date(today);
        let consecutiveDays = true;

        while (consecutiveDays) {
            // Find reflection for current date
            const dayReflection = allReflections.find(reflection => {
                const reflectionDate = reflection.createdAt?.toDate ?
                    reflection.createdAt.toDate() : new Date(reflection.createdAt);
                reflectionDate.setHours(0, 0, 0, 0);
                return reflectionDate.getTime() === currentDate.getTime();
            });

            if (dayReflection) {
                streakList.push(dayReflection);
                currentDate.setDate(currentDate.getDate() - 1);
            } else {
                // Allow grace period for today if before 9 PM
                if (currentDate.getTime() === today.getTime() && new Date().getHours() < 21) {
                    currentDate.setDate(currentDate.getDate() - 1);
                    continue;
                }
                consecutiveDays = false;
            }
        }

        setStreakReflections(streakList);
    } catch (error) {
    }
};

// Load challenges insights from Cloud Functions

const loadChallengesInsights = async () => {
    try {
        const insightsRef = db.collection('users').doc(user.uid)
            .collection('insights').doc('challenges');
        const insightsDoc = await insightsRef.get();

        if (insightsDoc.exists) {
            const insightsData = insightsDoc.data();
            setChallengesInsights(insightsData);
        } else {
            setChallengesInsights(null);
        }
    } catch (error) {
        setChallengesInsights(null);
    }
};

// Calculate all reflection streaks (for longest streak feature)


// Load compliance rates

const loadComplianceRates = async () => {
    try {
        // Get user's account creation date (same logic as loadProfileStats)
        const userDoc = await db.collection('users').doc(user.uid).get();
        const accountCreatedDate = userDoc.data()?.createdAt?.toDate() || new Date();

        // Calculate days since account creation (max 30 days for recent performance)
        const today = new Date();
        const daysSinceCreation = Math.floor((today - accountCreatedDate) / (1000 * 60 * 60 * 24));
        const daysToCheck = Math.min(daysSinceCreation, 30); // Cap at 30 days

        // Skip calculation if account is less than 1 day old
        if (daysToCheck < 1) {
            setComplianceRate({
                checkIn: 0,
                assignment: 0
            });
            return;
        }

        // Calculate check-in rate based on days since joining
        const dateToCheckFrom = new Date();
        dateToCheckFrom.setDate(dateToCheckFrom.getDate() - daysToCheck);

        const checkInsSnap = await db.collection('checkIns')
            .where('userId', '==', user.uid)
            .where('createdAt', '>=', dateToCheckFrom)
            .get();

        // COUNT ONLY MORNING CHECK-INS (same as ProfileView)
        let morningCheckInCount = 0;
        checkInsSnap.forEach(doc => {
            const data = doc.data();
            if (data.morningData) {
                morningCheckInCount++;
            }
        });

        // Calculate rate: morning check-ins / days they've been a member (max 30)
        const checkInRate = Math.min(100, Math.round((morningCheckInCount / daysToCheck) * 100));

        // Calculate assignment completion rate (keep existing logic)
        const assignmentsSnap = await db.collection('assignments')
            .where('userId', '==', user.uid)
            .get();

        let totalAssignments = 0;
        let completedAssignments = 0;

        assignmentsSnap.forEach(doc => {
            totalAssignments++;
            if (doc.data().status === 'completed') {
                completedAssignments++;
            }
        });

        const assignmentRate = totalAssignments > 0 ? 
            Math.round((completedAssignments / totalAssignments) * 100) : 0;

        setComplianceRate({
            checkIn: checkInRate,
            assignment: assignmentRate
        });
    } catch (error) {
    }
};

// Update check-in streak
const updateStreak = async () => {
    try {
        const streakDoc = await db.collection('streaks').doc(user.uid).get();

        if (streakDoc.exists) {
            const data = streakDoc.data();
            const lastCheckIn = data.lastCheckIn?.toDate ?
                data.lastCheckIn.toDate() : new Date(data.lastCheckIn);
            const today = new Date();
            const daysDiff = Math.floor((today - lastCheckIn) / (1000 * 60 * 60 * 24));

            if (daysDiff === 1) {
                // Continue streak
                await db.collection('streaks').doc(user.uid).update({
                    currentStreak: data.currentStreak + 1,
                    lastCheckIn: firebase.firestore.FieldValue.serverTimestamp()
                });
                setCheckInStreak(data.currentStreak + 1);
            } else if (daysDiff > 1) {
                // Reset streak
                await db.collection('streaks').doc(user.uid).update({
                    currentStreak: 1,
                    lastCheckIn: firebase.firestore.FieldValue.serverTimestamp()
                });
                setCheckInStreak(1);
            } else {
                // Same day, maintain current streak
                setCheckInStreak(data.currentStreak);
            }
        } else {
            // First check-in ever
            await db.collection('streaks').doc(user.uid).set({
                currentStreak: 1,
                lastCheckIn: firebase.firestore.FieldValue.serverTimestamp()
            });
            setCheckInStreak(1);
        }
    } catch (error) {
        console.error('Error updating streak:', error);
    }
};

    // ============================================================
    // RETURN ALL LOADER FUNCTIONS
    // ============================================================

    return {
        loadAllData,
        loadUserData,
        loadTopicRooms,
        loadMeetings,
        loadGoals,
        loadAssignments,
        loadHabits,
        loadTodayHabits,
        loadQuickReflections,
        loadTodayWins,
        loadDailyTasksStatus,
        loadDailyInspiration,
        loadMilestones,
        loadBroadcasts,
        loadResources,
        loadCheckIns,
        loadStreakCheckIns,
        loadTodaysPledge,
        loadStreak,
        loadCoachNotes,
        loadCalendarHeatmapData,
        loadMoodWeekData,
        loadOverallDayWeekData,
        loadGratitudeJournal,
        loadGratitudeInsights,
        loadDailyQuotes,
        loadChallengesHistory,
        loadTomorrowGoals,
        loadGoalAchievementData,
        loadReflections,
        loadStreakReflections,
        loadChallengesInsights,
        loadComplianceRates,
        loadSupportGroups,
        loadEmergencyResources,
        updateStreak
    };
};

// ============================================================
// EXPORTS
// ============================================================

// Register hook to namespace
window.GLRSApp.hooks.useLoaders = useLoaders;

console.log('✅ loaders.js loaded - useLoaders hook available with 35 functions');
// ============================================================
// GLRS LIGHTHOUSE - REALTIME LISTENER FUNCTIONS
// ============================================================
// Firestore realtime listener setup extracted from PIRapp.js
// Exported to window.GLRSApp.listeners
// ============================================================

window.GLRSApp = window.GLRSApp || {};

// ============================================================
// REALTIME LISTENERS SETUP
// ============================================================

    const setupRealtimeListeners = (db, user, listenersRef, broadcastDismissed, setters, loadFunctions) => {
        // Destructure setters
        const { setNotifications, setUnreadCount, setCommunityMessages, setActiveBroadcast } = setters;

        // Destructure load functions
        const { loadGoals, loadAssignments, loadHabits, loadTodayHabits, loadQuickReflections, loadTodayWins } = loadFunctions;
        // Notifications listener
        const notifListener = db.collection('notifications')
            .where('userId', '==', user.uid)
            .orderBy('createdAt', 'desc')
            .limit(20)
            .onSnapshot(snapshot => {
                const notificationsList = [];
                let unread = 0;
                snapshot.forEach(doc => {
                    const notification = { id: doc.id, ...doc.data() };
                    notificationsList.push(notification);
                    if (!notification.read) unread++;
                });
                setNotifications(notificationsList);
                setUnreadCount(unread);
            });
        listenersRef.current.push(notifListener);

        // Community messages listener
        const messagesListener = db.collection('messages')
            .where('roomId', '==', 'main')
            .orderBy('createdAt', 'desc')
            .limit(50)
            .onSnapshot(snapshot => {
                const messages = [];
                snapshot.forEach(doc => {
                    messages.push({ id: doc.id, ...doc.data() });
                });
                setCommunityMessages(messages.reverse());
            });
        listenersRef.current.push(messagesListener);

        // Goals listener
        const goalsListener = db.collection('goals')
            .where('userId', '==', user.uid)
            .where('status', '==', 'active')
            .onSnapshot(snapshot => {
                loadGoals();
            });
        listenersRef.current.push(goalsListener);

        // Assignments listener
        const assignmentsListener = db.collection('assignments')
            .where('userId', '==', user.uid)
            .onSnapshot(snapshot => {
                loadAssignments();
            });
        listenersRef.current.push(assignmentsListener);

        // Habits listener
        const habitsListener = db.collection('habits')
            .where('userId', '==', user.uid)
            .onSnapshot(snapshot => {
                loadHabits();
                loadTodayHabits();
            });
        listenersRef.current.push(habitsListener);

        // Habit completions listener
        const habitCompletionsListener = db.collection('habitCompletions')
            .where('userId', '==', user.uid)
            .onSnapshot(snapshot => {
                loadTodayHabits();
            });
        listenersRef.current.push(habitCompletionsListener);

        // Quick reflections listener
        const quickReflectionsListener = db.collection('quickReflections')
            .where('userId', '==', user.uid)
            .onSnapshot(snapshot => {
                loadQuickReflections();
            });
        listenersRef.current.push(quickReflectionsListener);

        // Wins listener
        const winsListener = db.collection('wins')
            .where('userId', '==', user.uid)
            .onSnapshot(snapshot => {
                loadTodayWins();
            });
        listenersRef.current.push(winsListener);

        // Broadcasts listener
        const broadcastsListener = db.collection('broadcasts')
            .where('active', '==', true)
            .orderBy('createdAt', 'desc')
            .limit(1)
            .onSnapshot(snapshot => {
                if (!snapshot.empty && !broadcastDismissed) {
                    const broadcast = snapshot.docs[0].data();
                    setActiveBroadcast(broadcast);
                }
            });
        listenersRef.current.push(broadcastsListener);
    };

// ============================================================
// EXPORTS
// ============================================================

window.GLRSApp.listeners = {
    setupRealtimeListeners
};

console.log('✅ listeners.js loaded - setupRealtimeListeners function available');
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
