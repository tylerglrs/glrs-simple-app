// ==========================================
// USER DETAIL MODAL - SHARED COMPONENT
// ==========================================
// Used by: users.html, mypirs.html, dashboard.html
// Extracted from admin.html lines 32839-37710 (4,872 lines)
// ==========================================

function UserDetailModal({ user, onClose, onUpdate }) {
    // Extract ID from user object
    const pirId = user?.id;
    
    // Core States
    const [pirData, setPirData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');
    
    // Data States
    const [activities, setActivities] = useState([]);
    const [availableCoaches, setAvailableCoaches] = useState([]);
    const [checkIns, setCheckIns] = useState([]);
    const [assignments, setAssignments] = useState([]);
    const [goals, setGoals] = useState([]);
    const [objectives, setObjectives] = useState([]);
    const [alerts, setAlerts] = useState([]);
    const [meetings, setMeetings] = useState([]);
    const [resources, setResources] = useState([]);
    const [milestones, setMilestones] = useState([]);
    const [messages, setMessages] = useState([]);
    const [supportGroups, setSupportGroups] = useState([]);
    const [pledges, setPledges] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [topicRooms, setTopicRooms] = useState([]);
    const [resourceProgress, setResourceProgress] = useState({});
    const [resourceNotes, setResourceNotes] = useState({});
    const [streakData, setStreakData] = useState({});
    const [complianceData, setComplianceData] = useState({});
    const [allMessages, setAllMessages] = useState([]);
    
    // UI States
    const [editing, setEditing] = useState(false);
    const [editData, setEditData] = useState({});
    const [chartData, setChartData] = useState(null);
    const [expandedGoals, setExpandedGoals] = useState({});
    const [showAddGoal, setShowAddGoal] = useState(false);
    const [showAddObjective, setShowAddObjective] = useState(false);
    const [showAddAssignment, setShowAddAssignment] = useState(false);
    const [selectedGoalId, setSelectedGoalId] = useState(null);
    const [selectedObjectiveId, setSelectedObjectiveId] = useState(null);
    const [showAssignResource, setShowAssignResource] = useState(false);
    const [showCreateResource, setShowCreateResource] = useState(false);
    const [showGoldenThread, setShowGoldenThread] = useState(false);
    const [selectedGoalForObjective, setSelectedGoalForObjective] = useState(null);
    const [selectedObjectiveForAssignment, setSelectedObjectiveForAssignment] = useState(null);
    
    // Chart refs
    const moodChartRef = useRef(null);
    const cravingChartRef = useRef(null);
    const anxietyChartRef = useRef(null);
    const sleepChartRef = useRef(null);

    // ========== LOAD DATA ON MOUNT ==========
    useEffect(() => {
        if (pirId) {
            loadCompletePIRData();
        }
    }, [pirId]);

    const loadCompletePIRData = async () => {
        try {
            setLoading(true);
            
            const userDoc = await db.collection('users').doc(pirId).get();
            if (!userDoc.exists) {
                alert('PIR not found');
                onClose();
                return;
            }
            
            const userData = { id: userDoc.id, ...userDoc.data() };
            
            // Fix timezone issues for dates
            userData.sobrietyDays = calculateSobrietyDaysFixed(userData.sobrietyDate);
            userData.accountAge = daysSince(userData.createdAt);
            userData.lastLoginFormatted = await getLastLoginFormatted(pirId, userData);
            userData.firstLoginFormatted = formatFirstLogin(userData.createdAt);
            userData.moneySaved = userData.sobrietyDays * (userData.dailyCost || 20);
            
            setPirData(userData);
            setEditData(userData);
            
            // Load all related data in parallel
            await Promise.all([
                loadActivitiesData(),
                loadCheckInsData(),
                loadAssignmentsData(),
                loadGoalsData(),
                loadObjectivesData(),
                loadAlertsData(),
                loadMeetingsData(),
                loadResourcesData(),
                loadMilestonesData(),
                loadMessagesData(),
                loadAllUserMessages(),
                loadSupportGroupsData(),
                loadPledgesData(),
                loadNotificationsData(),
                loadTopicRoomsData(),
                loadResourceProgressData(),
                loadStreakData(),
                loadComplianceDataFixed(userData.createdAt),
                loadProgressChartData(),
                loadAvailableCoaches()
            ]);
            
        } catch (error) {
            console.error('Error loading PIR data:', error);
            alert('Failed to load PIR data: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    // ========== CALCULATION FUNCTIONS ==========
    const calculateSobrietyDaysFixed = (sobrietyDate) => {
        if (!sobrietyDate) return 0;
        
        let year, month, day;
        
        if (typeof sobrietyDate === 'string' && sobrietyDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
            [year, month, day] = sobrietyDate.split('-').map(Number);
        } else if (sobrietyDate.toDate) {
            const date = sobrietyDate.toDate();
            year = date.getFullYear();
            month = date.getMonth() + 1;
            day = date.getDate();
        } else if (sobrietyDate.seconds) {
            const date = new Date(sobrietyDate.seconds * 1000);
            year = date.getFullYear();
            month = date.getMonth() + 1;
            day = date.getDate();
        } else {
            const date = new Date(sobrietyDate);
            year = date.getFullYear();
            month = date.getMonth() + 1;
            day = date.getDate();
        }
        
        const today = new Date();
        const todayYear = today.getFullYear();
        const todayMonth = today.getMonth() + 1;
        const todayDay = today.getDate();
        
        const startDate = new Date(year, month - 1, day, 0, 0, 0, 0);
        const endDate = new Date(todayYear, todayMonth - 1, todayDay, 0, 0, 0, 0);
        
        const millisecondsDiff = endDate.getTime() - startDate.getTime();
        const complete24HourPeriods = Math.floor(millisecondsDiff / (1000 * 60 * 60 * 24));
        const totalDays = complete24HourPeriods + 2;
        
        return Math.max(1, totalDays);
    };

    const getLastLoginFormatted = async (userId, userData) => {
        try {
            if (userData.lastLogin) {
                const lastLogin = userData.lastLogin.toDate ? userData.lastLogin.toDate() : new Date(userData.lastLogin);
                return lastLogin.toLocaleString('en-US', { 
                    month: 'short', day: 'numeric', year: 'numeric',
                    hour: 'numeric', minute: '2-digit', hour12: true 
                });
            }
            
            const loginActivity = await db.collection('activities')
                .where('userId', '==', userId)
                .where('type', '==', 'login')
                .orderBy('createdAt', 'desc')
                .limit(1)
                .get();
            
            if (!loginActivity.empty) {
                const lastLogin = loginActivity.docs[0].data().createdAt.toDate();
                return lastLogin.toLocaleString('en-US', { 
                    month: 'short', day: 'numeric', year: 'numeric',
                    hour: 'numeric', minute: '2-digit', hour12: true 
                });
            }
            
            return 'No login recorded';
        } catch (error) {
            console.error('Error getting last login:', error);
            return 'Unable to determine';
        }
    };

    const formatFirstLogin = (createdAt) => {
        if (!createdAt) return 'Unknown';
        const date = createdAt.toDate ? createdAt.toDate() : new Date(createdAt);
        return date.toLocaleString('en-US', { 
            month: 'short', day: 'numeric', year: 'numeric'
        });
    };

    const daysSince = (date) => {
        if (!date) return 0;
        const start = date?.toDate ? date.toDate() : new Date(date);
        const today = new Date();
        const diffTime = Math.abs(today - start);
        return Math.floor(diffTime / (1000 * 60 * 60 * 24));
    };

    const formatDate = (date) => {
        if (!date) return 'N/A';
        
        let d;
        if (date?.toDate) {
            d = date.toDate();
        } else if (date?.seconds) {
            d = new Date(date.seconds * 1000);
        } else if (typeof date === 'string') {
            if (!date.includes('T')) {
                d = new Date(date + 'T00:00:00');
            } else {
                d = new Date(date);
            }
        } else {
            d = new Date(date);
        }
        
        return d.toLocaleDateString('en-US', {
            year: 'numeric', month: 'long', day: 'numeric'
        });
    };

    const formatDateTime = (date) => {
        if (!date) return 'N/A';
        const d = date?.toDate ? date.toDate() : new Date(date);
        return d.toLocaleString();
    };

    const formatTimeAgo = (date) => {
        if (!date) return 'Never';
        const d = date?.toDate ? date.toDate() : new Date(date);
        const now = new Date();
        const diff = Math.floor((now - d) / 1000);
        
        if (diff < 60) return 'Just now';
        if (diff < 3600) return Math.floor(diff / 60) + ' minutes ago';
        if (diff < 86400) return Math.floor(diff / 3600) + ' hours ago';
        if (diff < 604800) return Math.floor(diff / 86400) + ' days ago';
        return d.toLocaleDateString();
    };

    // ========== DATA LOADING FUNCTIONS ==========
    const loadAvailableCoaches = async () => {
        try {
            const coachesSnap = await db.collection('users')
                .where('role', 'in', ['admin', 'coach'])
                .get();
            
            const coachesList = [];
            coachesSnap.forEach(doc => {
                coachesList.push({ id: doc.id, ...doc.data() });
            });
            setAvailableCoaches(coachesList);
        } catch (error) {
            console.error('Error loading coaches:', error);
            setAvailableCoaches([]);
        }
    };

    const loadComplianceDataFixed = async (accountCreatedAt) => {
        try {
            const accountDate = accountCreatedAt?.toDate ? accountCreatedAt.toDate() : new Date(accountCreatedAt);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            accountDate.setHours(0, 0, 0, 0);
            
            const daysSinceCreation = Math.floor((today - accountDate) / (1000 * 60 * 60 * 24));
            const daysToCheck = Math.min(daysSinceCreation, 30);
            
            if (daysToCheck <= 0) {
                setComplianceData({
                    morningRate: 0, eveningRate: 0, assignmentRate: 0,
                    totalCheckIns: 0, daysTracked: 0, recentCheckIns: []
                });
                return;
            }
            
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - daysToCheck);
            startDate.setHours(0, 0, 0, 0);
            
            const allCheckInsSnap = await db.collection('checkIns')
                .where('userId', '==', pirId)
                .orderBy('createdAt', 'desc')
                .get();
            
            const complianceCheckInsSnap = await db.collection('checkIns')
                .where('userId', '==', pirId)
                .where('createdAt', '>=', startDate)
                .get();
            
            const allCheckInsData = [];
            allCheckInsSnap.forEach(doc => {
                const data = doc.data();
                allCheckInsData.push({
                    id: doc.id, ...data,
                    date: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt)
                });
            });
            
            let morningCount = 0, eveningCount = 0;
            const dateMap = new Map();
            
            complianceCheckInsSnap.forEach(doc => {
                const data = doc.data();
                const checkInDate = data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt);
                const dateKey = checkInDate.toDateString();
                
                if (!dateMap.has(dateKey)) {
                    dateMap.set(dateKey, { morning: false, evening: false });
                }
                
                if (data.morningData && !dateMap.get(dateKey).morning) {
                    morningCount++;
                    dateMap.get(dateKey).morning = true;
                }
                if (data.eveningData && !dateMap.get(dateKey).evening) {
                    eveningCount++;
                    dateMap.get(dateKey).evening = true;
                }
            });
            
            const completedAssignments = assignments.filter(a => a.status === 'completed').length;
            const totalAssignments = assignments.length;
            
            const morningRate = Math.min(100, Math.round((morningCount / daysToCheck) * 100));
            const eveningRate = Math.min(100, Math.round((eveningCount / daysToCheck) * 100));
            const assignmentRate = totalAssignments > 0 ? 
                Math.min(100, Math.round((completedAssignments / totalAssignments) * 100)) : 0;
            
            setComplianceData({
                morningRate, eveningRate, assignmentRate,
                totalCheckIns: morningCount + eveningCount,
                daysTracked: daysToCheck,
                recentCheckIns: allCheckInsData
            });
            
            setCheckIns(allCheckInsData);
            
        } catch (error) {
            console.error('Error calculating compliance:', error);
            setComplianceData({
                morningRate: 0, eveningRate: 0, assignmentRate: 0,
                totalCheckIns: 0, daysTracked: 0, recentCheckIns: []
            });
        }
    };

    const loadMilestonesData = async () => {
        try {
            const milestonesList = [];
            
            try {
                const milestonesSnap = await db.collection('milestones')
                    .where('userId', '==', pirId)
                    .get();
                
                milestonesSnap.forEach(doc => {
                    milestonesList.push({ id: doc.id, ...doc.data() });
                });
            } catch (error) {
                console.error('Error loading custom milestones:', error);
            }
            
            if (pirData?.sobrietyDate) {
                const standardMilestones = getStandardMilestones(pirData.sobrietyDate);
                milestonesList.push(...standardMilestones);
            }
            
            setMilestones(milestonesList);
        } catch (error) {
            console.error('Error loading milestones:', error);
            setMilestones([]);
        }
    };

    const getStandardMilestones = (sobrietyDate) => {
        const milestones = [
            { days: 1, title: '24 Hours', icon: '🌅', description: 'First day of recovery' },
            { days: 7, title: 'One Week', icon: '📅', description: 'A week of sobriety' },
            { days: 30, title: 'One Month', icon: '📆', description: 'First month milestone' },
            { days: 60, title: 'Two Months', icon: '📅', description: 'Two months strong' },
            { days: 90, title: 'Three Months', icon: '🏆', description: 'Quarter year achieved' },
            { days: 180, title: 'Six Months', icon: '⭐', description: 'Half year milestone' },
            { days: 365, title: 'One Year', icon: '🎉', description: 'Full year of recovery' },
            { days: 730, title: 'Two Years', icon: '🎊', description: 'Two years of sobriety' }
        ];
        
        const sobrietyDateObj = sobrietyDate?.toDate ? sobrietyDate.toDate() : new Date(sobrietyDate);
        const today = new Date();
        
        return milestones.map(m => {
            const targetDate = new Date(sobrietyDateObj);
            targetDate.setDate(targetDate.getDate() + m.days);
            const achieved = today >= targetDate;
            const daysUntil = Math.ceil((targetDate - today) / (1000 * 60 * 60 * 24));
            
            return {
                ...m, targetDate, achieved,
                daysUntil: achieved ? 0 : daysUntil,
                type: 'standard',
                id: `standard-${m.days}`
            };
        });
    };

    const loadActivitiesData = async () => {
        try {
            const activitiesSnap = await db.collection('activities')
                .where('userId', '==', pirId)
                .orderBy('createdAt', 'desc')
                .limit(100)
                .get();
            
            const activitiesList = [];
            activitiesSnap.forEach(doc => {
                activitiesList.push({ id: doc.id, ...doc.data() });
            });
            setActivities(activitiesList);
        } catch (error) {
            console.error('Error loading activities:', error);
            setActivities([]);
        }
    };

    const loadCheckInsData = async () => {
        try {
            const checkInsSnap = await db.collection('checkIns')
                .where('userId', '==', pirId)
                .orderBy('createdAt', 'desc')
                .limit(60)
                .get();
            
            const checkInsList = [];
            checkInsSnap.forEach(doc => {
                checkInsList.push({ id: doc.id, ...doc.data() });
            });
            setCheckIns(checkInsList);
        } catch (error) {
            console.error('Error loading check-ins:', error);
            setCheckIns([]);
        }
    };

    const loadAssignmentsData = async () => {
        try {
            const assignmentsSnap = await db.collection('assignments')
                .where('userId', '==', pirId)
                .get();
            
            const assignmentsList = [];
            assignmentsSnap.forEach(doc => {
                assignmentsList.push({ id: doc.id, ...doc.data() });
            });
            setAssignments(assignmentsList);
        } catch (error) {
            console.error('Error loading assignments:', error);
            setAssignments([]);
        }
    };

    const loadGoalsData = async () => {
        try {
            const goalsSnap = await db.collection('goals')
                .where('userId', '==', pirId)
                .orderBy('createdAt', 'desc')
                .get();
            
            const goalsList = [];
            for (const doc of goalsSnap.docs) {
                const goalData = { id: doc.id, ...doc.data() };
                goalData.progress = await calculateGoalProgress(doc.id);
                goalsList.push(goalData);
            }
            setGoals(goalsList);
        } catch (error) {
            console.error('Error loading goals:', error);
            setGoals([]);
        }
    };

    const loadObjectivesData = async () => {
        try {
            const objectivesSnap = await db.collection('objectives')
                .where('userId', '==', pirId)
                .orderBy('order', 'asc')
                .get();
            
            const objectivesList = [];
            objectivesSnap.forEach(doc => {
                objectivesList.push({ id: doc.id, ...doc.data() });
            });
            setObjectives(objectivesList);
        } catch (error) {
            console.error('Error loading objectives:', error);
            setObjectives([]);
        }
    };

    const loadAlertsData = async () => {
        try {
            const alertsSnap = await db.collection('alerts')
                .where('userId', '==', pirId)
                .orderBy('createdAt', 'desc')
                .limit(50)
                .get();
            
            const alertsList = [];
            alertsSnap.forEach(doc => {
                alertsList.push({ id: doc.id, ...doc.data() });
            });
            setAlerts(alertsList);
        } catch (error) {
            console.error('Error loading alerts:', error);
            setAlerts([]);
        }
    };

    const loadMeetingsData = async () => {
        try {
            const meetingsSnap = await db.collection('meetings')
                .where('pirId', '==', pirId)
                .orderBy('scheduledTime', 'desc')
                .get();
            
            const meetingsList = [];
            meetingsSnap.forEach(doc => {
                meetingsList.push({ id: doc.id, ...doc.data() });
            });
            setMeetings(meetingsList);
        } catch (error) {
            console.error('Error loading meetings:', error);
            setMeetings([]);
        }
    };

    const loadResourcesData = async () => {
        try {
            const resourcesList = [];
            
            try {
                const assignedResources = await db.collection('resources')
                    .where('assignedTo', 'array-contains', pirId)
                    .get();
                
                assignedResources.forEach(doc => {
                    resourcesList.push({ id: doc.id, ...doc.data() });
                });
            } catch (error) {
                console.log('Array-contains query failed, trying alternative');
            }
            
            try {
                const globalResources = await db.collection('resources')
                    .where('isGlobal', '==', true)
                    .get();
                
                globalResources.forEach(doc => {
                    const data = { id: doc.id, ...doc.data() };
                    if (!resourcesList.find(r => r.id === doc.id)) {
                        resourcesList.push(data);
                    }
                });
            } catch (error) {
                console.log('Global resources query failed');
            }
            
            setResources(resourcesList);
        } catch (error) {
            console.error('Error loading resources:', error);
            setResources([]);
        }
    };

    const loadMessagesData = async () => {
        try {
            const messagesSnap = await db.collection('messages')
                .where('senderId', '==', pirId)
                .orderBy('createdAt', 'desc')
                .limit(50)
                .get();
            
            const messagesList = [];
            messagesSnap.forEach(doc => {
                messagesList.push({ id: doc.id, ...doc.data() });
            });
            setMessages(messagesList);
        } catch (error) {
            console.error('Error loading messages:', error);
            setMessages([]);
        }
    };

    const loadAllUserMessages = async () => {
        try {
            const messagesData = [];
            
            try {
                const directMessages = await db.collection('messages')
                    .where('senderId', '==', pirId)
                    .orderBy('createdAt', 'desc')
                    .get();
                
                directMessages.forEach(doc => {
                    messagesData.push({ id: doc.id, ...doc.data(), type: 'direct' });
                });
            } catch (error) {
                console.log('Error loading direct messages:', error);
            }
            
            try {
                const receivedMessages = await db.collection('messages')
                    .where('userId', '==', pirId)
                    .orderBy('createdAt', 'desc')
                    .get();
                
                receivedMessages.forEach(doc => {
                    const data = doc.data();
                    if (data.senderId === pirId) {
                        messagesData.push({ id: doc.id, ...data, type: 'direct' });
                    }
                });
            } catch (error) {
                console.log('Error loading received messages:', error);
            }
            
            try {
                const communityMessages = await db.collection('glrsChat')
                    .where('senderId', '==', pirId)
                    .orderBy('createdAt', 'desc')
                    .limit(50)
                    .get();
                
                communityMessages.forEach(doc => {
                    messagesData.push({ id: doc.id, ...doc.data(), type: 'community' });
                });
            } catch (error) {
                console.log('Community chat collection may not exist:', error);
            }
            
            try {
                const topicMessages = await db.collection('topicRoomMessages')
                    .where('senderId', '==', pirId)
                    .orderBy('createdAt', 'desc')
                    .limit(50)
                    .get();
                
                topicMessages.forEach(doc => {
                    messagesData.push({ id: doc.id, ...doc.data(), type: 'topic' });
                });
            } catch (error) {
                console.log('Topic room messages may not exist:', error);
            }
            
            messagesData.sort((a, b) => {
                const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0);
                const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0);
                return dateB - dateA;
            });
            
            setAllMessages(messagesData);
            
        } catch (error) {
            console.error('Error loading user messages:', error);
            setAllMessages([]);
        }
    };

    const loadSupportGroupsData = async () => {
        try {
            const supportGroupsSnap = await db.collection('supportGroups')
                .where('active', '==', true)
                .get();
            
            const supportGroupsList = [];
            supportGroupsSnap.forEach(doc => {
                supportGroupsList.push({ id: doc.id, ...doc.data() });
            });
            setSupportGroups(supportGroupsList);
        } catch (error) {
            console.error('Error loading support groups:', error);
            setSupportGroups([]);
        }
    };

    const loadPledgesData = async () => {
        try {
            const pledgesSnap = await db.collection('pledges')
                .where('userId', '==', pirId)
                .orderBy('createdAt', 'desc')
                .limit(30)
                .get();
            
            const pledgesList = [];
            pledgesSnap.forEach(doc => {
                pledgesList.push({ id: doc.id, ...doc.data() });
            });
            setPledges(pledgesList);
        } catch (error) {
            console.error('Error loading pledges:', error);
            setPledges([]);
        }
    };

    const loadNotificationsData = async () => {
        try {
            const notificationsSnap = await db.collection('notifications')
                .where('userId', '==', pirId)
                .orderBy('createdAt', 'desc')
                .limit(50)
                .get();
            
            const notificationsList = [];
            notificationsSnap.forEach(doc => {
                notificationsList.push({ id: doc.id, ...doc.data() });
            });
            setNotifications(notificationsList);
        } catch (error) {
            console.error('Error loading notifications:', error);
            setNotifications([]);
        }
    };

    const loadTopicRoomsData = async () => {
        try {
            const topicRoomsSnap = await db.collection('topicRooms').get();
            
            const topicRoomsList = [];
            topicRoomsSnap.forEach(doc => {
                topicRoomsList.push({ id: doc.id, ...doc.data() });
            });
            setTopicRooms(topicRoomsList);
        } catch (error) {
            console.error('Error loading topic rooms:', error);
            setTopicRooms([]);
        }
    };

    const loadResourceProgressData = async () => {
        try {
            const progressDoc = await db.collection('users').doc(pirId)
                .collection('resourcePreferences').doc('progress').get();
            
            if (progressDoc.exists) {
                setResourceProgress(progressDoc.data() || {});
            }
            
            const notesDoc = await db.collection('users').doc(pirId)
                .collection('resourcePreferences').doc('notes').get();
            
            if (notesDoc.exists) {
                setResourceNotes(notesDoc.data() || {});
            }
        } catch (error) {
            console.error('Error loading resource progress:', error);
        }
    };

    const loadStreakData = async () => {
        try {
            const streakDoc = await db.collection('streaks').doc(pirId).get();
            if (streakDoc.exists) {
                setStreakData(streakDoc.data());
            }
        } catch (error) {
            console.error('Error loading streak data:', error);
        }
    };

    const loadProgressChartData = async () => {
        try {
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            
            const checkInsSnap = await db.collection('checkIns')
                .where('userId', '==', pirId)
                .where('createdAt', '>=', thirtyDaysAgo)
                .orderBy('createdAt', 'asc')
                .get();
            
            const chartLabels = [];
            const moodData = [];
            const cravingData = [];
            const anxietyData = [];
            const sleepData = [];
            
            for (let i = 29; i >= 0; i--) {
                const date = new Date();
                date.setDate(date.getDate() - i);
                chartLabels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
                
                let dayCheckIn = null;
                checkInsSnap.forEach(doc => {
                    const checkInDate = doc.data().createdAt?.toDate() || new Date(doc.data().createdAt);
                    if (checkInDate.toDateString() === date.toDateString()) {
                        dayCheckIn = doc.data();
                    }
                });
                
                moodData.push(dayCheckIn?.morningData?.mood ?? null);
                cravingData.push(dayCheckIn?.morningData?.craving ?? null);
                anxietyData.push(dayCheckIn?.morningData?.anxietyLevel ?? null);
                sleepData.push(dayCheckIn?.morningData?.sleepQuality ?? null);
            }
            
            setChartData({
                labels: chartLabels,
                mood: moodData,
                craving: cravingData,
                anxiety: anxietyData,
                sleep: sleepData
            });
        } catch (error) {
            console.error('Error loading chart data:', error);
        }
    };

    const calculateGoalProgress = async (goalId) => {
        const goalAssignments = assignments.filter(a => a.goalId === goalId);
        const completed = goalAssignments.filter(a => a.status === 'completed').length;
        return goalAssignments.length > 0 ? Math.round((completed / goalAssignments.length) * 100) : 0;
    };

    const getActivityIcon = (type) => {
        const icons = {
            'check_in': '✅', 'assignment_completed': '📝', 'goal_completed': '🎯',
            'objective_completed': '🎯', 'message_sent': '💬', 'sos_triggered': '🚨',
            'login': '🔑', 'profile_updated': '👤', 'pledge_completed': '🤝',
            'resource_viewed': '📚', 'milestone_achieved': '🏆', 'streak_update': '🔥'
        };
        return icons[type] || '📌';
    };

    const getActivityColor = (type) => {
        const colors = {
            'check_in': 'var(--success-color)',
            'assignment_completed': 'var(--primary-color)',
            'goal_completed': 'var(--warning-color)',
            'message_sent': 'var(--secondary-color)',
            'sos_triggered': 'var(--danger-color)',
            'login': 'var(--info-color)',
            'profile_updated': 'var(--muted-color)'
        };
        return colors[type] || 'var(--text-muted)';
    };

    // ========== CHART RENDERING ==========
    useEffect(() => {
        if (chartData && activeTab === 'progress') {
            setTimeout(() => {
                renderCharts();
            }, 100);
        }
    }, [chartData, activeTab]);

    const renderCharts = () => {
        const chartConfig = {
            type: 'line',
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: { beginAtZero: true, max: 10, ticks: { stepSize: 1 } }
                },
                plugins: {
                    legend: { display: true },
                    tooltip: { enabled: true }
                }
            }
        };

        if (moodChartRef.current) moodChartRef.current.destroy();
        if (cravingChartRef.current) cravingChartRef.current.destroy();
        if (anxietyChartRef.current) anxietyChartRef.current.destroy();
        if (sleepChartRef.current) sleepChartRef.current.destroy();

        const moodCanvas = document.getElementById(`mood-chart-${pirId}`);
        if (moodCanvas) {
            moodChartRef.current = new Chart(moodCanvas, {
                ...chartConfig,
                data: {
                    labels: chartData.labels,
                    datasets: [{
                        label: 'Mood',
                        data: chartData.mood,
                        borderColor: 'var(--success-color)',
                        backgroundColor: 'rgba(76, 175, 80, 0.1)',
                        tension: 0.4,
                        spanGaps: true
                    }]
                }
            });
        }

        const cravingCanvas = document.getElementById(`craving-chart-${pirId}`);
        if (cravingCanvas) {
            cravingChartRef.current = new Chart(cravingCanvas, {
                ...chartConfig,
                data: {
                    labels: chartData.labels,
                    datasets: [{
                        label: 'Craving',
                        data: chartData.craving,
                        borderColor: 'var(--warning-color)',
                        backgroundColor: 'rgba(255, 152, 0, 0.1)',
                        tension: 0.4,
                        spanGaps: true
                    }]
                }
            });
        }

        const anxietyCanvas = document.getElementById(`anxiety-chart-${pirId}`);
        if (anxietyCanvas) {
            anxietyChartRef.current = new Chart(anxietyCanvas, {
                ...chartConfig,
                data: {
                    labels: chartData.labels,
                    datasets: [{
                        label: 'Anxiety',
                        data: chartData.anxiety,
                        borderColor: 'var(--danger-color)',
                        backgroundColor: 'rgba(244, 67, 54, 0.1)',
                        tension: 0.4,
                        spanGaps: true
                    }]
                }
            });
        }

        const sleepCanvas = document.getElementById(`sleep-chart-${pirId}`);
        if (sleepCanvas) {
            sleepChartRef.current = new Chart(sleepCanvas, {
                ...chartConfig,
                data: {
                    labels: chartData.labels,
                    datasets: [{
                        label: 'Sleep Quality',
                        data: chartData.sleep,
                        borderColor: 'var(--secondary-color)',
                        backgroundColor: 'rgba(156, 39, 176, 0.1)',
                        tension: 0.4,
                        spanGaps: true
                    }]
                }
            });
        }
    };

    // ========== ACTION HANDLERS ==========
    const handleSaveProfile = async () => {
        try {
            const updates = {
                ...editData,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            };
            
            if (editData.assignedCoach !== pirData.assignedCoach) {
                const newCoach = availableCoaches.find(c => c.id === editData.assignedCoach);
                const oldCoach = availableCoaches.find(c => c.id === pirData.assignedCoach);
                
                const historyEntry = {
                    assignedAt: new Date().toISOString(),
                    assignedBy: user.uid,
                    coachId: editData.assignedCoach,
                    coachName: newCoach?.displayName || newCoach?.email || 'Unknown',
                    previousCoachId: pirData.assignedCoach || null,
                    previousCoachName: oldCoach?.displayName || oldCoach?.email || 'None'
                };
                
                updates.coachAssignmentHistory = firebase.firestore.FieldValue.arrayUnion(historyEntry);
                
                if (editData.assignedCoach) {
                    await createNotificationWithPreferences({
                        recipientId: editData.assignedCoach,
                        type: 'pir_assigned',
                        message: `${pirData.displayName || pirData.email} has been assigned to you`,
                        pirId: pirId,
                        pirName: pirData.displayName || pirData.email,
                        read: false
                    }, 'pir_assigned');
                }

                await createNotificationWithPreferences({
                    recipientId: pirId,
                    type: 'coach_changed',
                    message: `Your coach has been updated to ${newCoach?.displayName || 'a new coach'}`,
                    read: false
                }, 'coach_changed');
            }
            
            await db.collection('users').doc(pirId).update(updates);
            
            await db.collection('activities').add({
                userId: pirId,
                type: 'profile_updated',
                description: 'Profile information updated' + 
                    (editData.assignedCoach !== pirData.assignedCoach ? ' - Coach assignment changed' : ''),
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            setPirData(editData);
            setEditing(false);
            alert('Profile updated successfully' + 
                (editData.assignedCoach !== pirData.assignedCoach ? '\n\nCoach assignment changed and notifications sent!' : ''));
            if (onUpdate) onUpdate();
        } catch (error) {
            console.error('Error updating profile:', error);
            alert('Failed to update profile: ' + error.message);
        }
    };

    // ========== NEW: DELETE ACCOUNT (SOFT DELETE) ==========
    const handleDeleteAccount = async () => {
        const confirmDelete = confirm(
            `⚠️ DELETE ACCOUNT WARNING\n\n` +
            `Are you sure you want to delete ${pirData.displayName || pirData.email}'s account?\n\n` +
            `This will:\n` +
            `• Mark account as DELETED and INACTIVE\n` +
            `• Prevent PIR from logging in\n` +
            `• Preserve all data for compliance (7 years)\n` +
            `• Record deletion in activity log\n\n` +
            `Type "DELETE" in the next prompt to confirm.`
        );
        
        if (!confirmDelete) return;
        
        const confirmText = prompt('Type DELETE to confirm account deletion:');
        if (confirmText !== 'DELETE') {
            alert('Deletion cancelled. Text did not match.');
            return;
        }
        
        try {
            await db.collection('users').doc(pirId).update({
                deleted: true,
                active: false,
                deletedAt: firebase.firestore.FieldValue.serverTimestamp(),
                deletedBy: user.uid,
                deletedReason: 'Admin deleted account',
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            await db.collection('activities').add({
                userId: pirId,
                type: 'account_deleted',
                description: `Account deleted by ${user.displayName || user.email}`,
                deletedBy: user.uid,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            await createNotificationWithPreferences({
                recipientId: pirId,
                type: 'account_deleted',
                message: 'Your account has been deactivated. Please contact support if you believe this is an error.',
                read: false
            }, 'alert');
            
            alert('✅ Account deleted successfully!\n\nThe PIR can no longer log in, but all data is preserved for compliance.');
            
            if (onUpdate) onUpdate();
            onClose();
            
        } catch (error) {
            console.error('Error deleting account:', error);
            alert('❌ Failed to delete account: ' + error.message);
        }
    };

    // ========== NEW: TOGGLE ACTIVE STATUS ==========
    const handleToggleActiveStatus = async () => {
        const newActiveStatus = !pirData.active;
        const action = newActiveStatus ? 'ACTIVATE' : 'DEACTIVATE';
        
        const confirm = window.confirm(
            `${action} ACCOUNT\n\n` +
            `Are you sure you want to ${action.toLowerCase()} ${pirData.displayName || pirData.email}'s account?\n\n` +
            `${newActiveStatus ? 
                '• PIR will be able to log in\n• All features will be accessible' : 
                '• PIR will NOT be able to log in\n• Account will be locked'}`
        );
        
        if (!confirm) return;
        
        try {
            await db.collection('users').doc(pirId).update({
                active: newActiveStatus,
                activeStatusChangedAt: firebase.firestore.FieldValue.serverTimestamp(),
                activeStatusChangedBy: user.uid,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            await db.collection('activities').add({
                userId: pirId,
                type: newActiveStatus ? 'account_activated' : 'account_deactivated',
                description: `Account ${newActiveStatus ? 'activated' : 'deactivated'} by ${user.displayName || user.email}`,
                changedBy: user.uid,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            await createNotificationWithPreferences({
                recipientId: pirId,
                type: newActiveStatus ? 'account_activated' : 'account_deactivated',
                message: newActiveStatus ?
                    'Your account has been activated. You can now log in.' :
                    'Your account has been deactivated. Please contact support.',
                read: false
            }, 'alert');
            
            setPirData({...pirData, active: newActiveStatus});
            setEditData({...editData, active: newActiveStatus});
            
            alert(`✅ Account ${newActiveStatus ? 'activated' : 'deactivated'} successfully!`);
            
            if (onUpdate) onUpdate();
            
        } catch (error) {
            console.error('Error toggling active status:', error);
            alert('❌ Failed to update status: ' + error.message);
        }
    };

    const handleAddGoal = async (goalData) => {
        try {
            await db.collection('goals').add({
                ...goalData,
                userId: pirId,
                createdBy: user.uid,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            await loadGoalsData();
            setShowAddGoal(false);
            alert('Goal added successfully');
        } catch (error) {
            console.error('Error adding goal:', error);
            alert('Failed to add goal');
        }
    };

    const handleAssignResource = async (resourceId) => {
        try {
            const resourceDoc = await db.collection('resources').doc(resourceId).get();
            const resourceData = resourceDoc.data();
            
            const currentAssigned = resourceData.assignedTo || [];
            if (!currentAssigned.includes(pirId)) {
                await db.collection('resources').doc(resourceId).update({
                    assignedTo: firebase.firestore.FieldValue.arrayUnion(pirId)
                });
                
                await loadResourcesData();
                alert('Resource assigned successfully');
            } else {
                alert('Resource already assigned to this PIR');
            }
        } catch (error) {
            console.error('Error assigning resource:', error);
            alert('Failed to assign resource');
        }
    };

    const handleDeleteMessage = async (messageId, messageType) => {
        if (!confirm('Are you sure you want to delete this message?')) return;
        
        try {
            let collection = 'messages';
            if (messageType === 'community') collection = 'glrsChat';
            if (messageType === 'topic') collection = 'topicRoomMessages';
            
            await db.collection(collection).doc(messageId).delete();
            
            await db.collection('flaggedContent').add({
                originalCollection: collection,
                originalId: messageId,
                userId: pirId,
                flaggedBy: user.uid,
                reason: 'Deleted by coach',
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            await loadAllUserMessages();
            alert('Message deleted and flagged');
        } catch (error) {
            console.error('Error deleting message:', error);
            alert('Failed to delete message');
        }
    };

    // ========== RENDER OVERVIEW TAB (UPDATED WITH CSS VARIABLES) ==========
    const renderOverviewTab = () => (
        <div style={{ padding: '20px' }}>
            {/* Account Status Banner */}
            {(!pirData.active || pirData.deleted) && (
                <div style={{
                    background: pirData.deleted ? 'var(--gradient-danger)' : 'var(--gradient-warning)',
                    padding: '15px 20px',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--text-white)',
                    marginBottom: '20px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontWeight: 'bold',
                    boxShadow: 'var(--shadow-md)'
                }}>
                    <span>
                        {pirData.deleted ? '🚫 ACCOUNT DELETED' : '⚠️ ACCOUNT INACTIVE'}
                        {pirData.deleted && ' - PIR cannot log in. Data preserved for compliance.'}
                        {!pirData.deleted && !pirData.active && ' - PIR cannot log in until activated.'}
                    </span>
                    {!pirData.deleted && (
                        <button
                            onClick={handleToggleActiveStatus}
                            style={{
                                background: 'var(--text-white)',
                                color: pirData.active ? 'var(--warning-color)' : 'var(--success-color)',
                                border: 'none',
                                padding: '8px 16px',
                                borderRadius: 'var(--radius-sm)',
                                cursor: 'pointer',
                                fontWeight: 'bold',
                                fontSize: '14px',
                                transition: 'var(--transition-fast)'
                            }}
                        >
                            {pirData.active ? 'Deactivate' : 'Activate'}
                        </button>
                    )}
                </div>
            )}

            {/* Key Metrics Cards */}
            <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                gap: '20px',
                marginBottom: '30px'
            }}>
                <div style={{
                    background: 'var(--gradient-primary)',
                    padding: '20px',
                    borderRadius: 'var(--radius-lg)',
                    color: 'var(--text-white)',
                    boxShadow: 'var(--shadow-primary)',
                    transition: 'var(--transition-fast)',
                    cursor: 'default'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                    <div style={{ fontSize: '14px', opacity: 0.9 }}>Sobriety Days</div>
                    <div style={{ fontSize: '36px', fontWeight: 'bold' }}>{pirData.sobrietyDays}</div>
                    <div style={{ fontSize: '12px', opacity: 0.8 }}>Since {formatDate(pirData.sobrietyDate)}</div>
                </div>

                <div style={{
                    background: 'var(--gradient-primary)',
                    padding: '20px',
                    borderRadius: 'var(--radius-lg)',
                    color: 'var(--text-white)',
                    boxShadow: 'var(--shadow-md)',
                    transition: 'var(--transition-fast)',
                    cursor: 'default'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                    <div style={{ fontSize: '14px', opacity: 0.9 }}>Current Streak</div>
                    <div style={{ fontSize: '36px', fontWeight: 'bold' }}>{streakData.currentStreak || 0} 🔥</div>
                    <div style={{ fontSize: '12px', opacity: 0.8 }}>Best: {streakData.longestStreak || 0} days</div>
                </div>

                <div style={{
                    background: 'var(--gradient-primary)',
                    padding: '20px',
                    borderRadius: 'var(--radius-lg)',
                    color: 'var(--text-white)',
                    boxShadow: 'var(--shadow-md)',
                    transition: 'var(--transition-fast)',
                    cursor: 'default'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                    <div style={{ fontSize: '14px', opacity: 0.9 }}>Last Login</div>
                    <div style={{ fontSize: '16px', fontWeight: 'bold' }}>{pirData.lastLoginFormatted}</div>
                    <div style={{ fontSize: '12px', opacity: 0.8 }}>Account age: {pirData.accountAge} days</div>
                </div>

                <div style={{
                    background: 'var(--gradient-primary)',
                    padding: '20px',
                    borderRadius: 'var(--radius-lg)',
                    color: 'var(--text-white)',
                    boxShadow: 'var(--shadow-md)',
                    transition: 'var(--transition-fast)',
                    cursor: 'default'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                    <div style={{ fontSize: '14px', opacity: 0.9 }}>Money Saved</div>
                    <div style={{ fontSize: '36px', fontWeight: 'bold' }}>${pirData.moneySaved}</div>
                    <div style={{ fontSize: '12px', opacity: 0.8 }}>${pirData.dailyCost || 20}/day saved</div>
                </div>
            </div>
            
            {/* Profile Information */}
            <div style={{
                background: 'var(--text-white)',
                borderRadius: 'var(--radius-lg)',
                padding: '25px',
                boxShadow: 'var(--shadow-sm)',
                marginBottom: '20px'
            }}>
                <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    marginBottom: '20px'
                }}>
                    <h3 style={{ margin: 0, color: 'var(--text-primary)' }}>Profile Information</h3>
                    {!editing ? (
                        <button 
                            className="btn btn-secondary"
                            onClick={() => setEditing(true)}
                            style={{
                                background: 'var(--gradient-secondary)',
                                color: 'var(--text-white)',
                                border: 'none',
                                padding: '10px 20px',
                                borderRadius: 'var(--radius-sm)',
                                cursor: 'pointer',
                                fontWeight: '500',
                                transition: 'var(--transition-fast)'
                            }}
                        >
                            Edit Profile
                        </button>
                    ) : (
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button 
                                className="btn btn-primary"
                                onClick={handleSaveProfile}
                                style={{
                                    background: 'var(--gradient-primary)',
                                    color: 'var(--text-white)',
                                    border: 'none',
                                    padding: '10px 20px',
                                    borderRadius: 'var(--radius-sm)',
                                    cursor: 'pointer',
                                    fontWeight: '500',
                                    transition: 'var(--transition-fast)'
                                }}
                            >
                                Save Changes
                            </button>
                            <button 
                                className="btn btn-secondary"
                                onClick={() => {
                                    setEditing(false);
                                    setEditData(pirData);
                                }}
                                style={{
                                    background: 'var(--text-muted)',
                                    color: 'var(--text-white)',
                                    border: 'none',
                                    padding: '10px 20px',
                                    borderRadius: 'var(--radius-sm)',
                                    cursor: 'pointer',
                                    fontWeight: '500',
                                    transition: 'var(--transition-fast)'
                                }}
                            >
                                Cancel
                            </button>
                        </div>
                    )}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <div>
                        <label style={{ fontWeight: 'bold', color: 'var(--text-secondary)' }}>Full Name</label>
                        {editing ? (
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <input
                                    type="text"
                                    value={editData.firstName || ''}
                                    onChange={(e) => setEditData({...editData, firstName: e.target.value})}
                                    style={{ 
                                        flex: 1, 
                                        padding: '8px', 
                                        borderRadius: 'var(--radius-sm)', 
                                        border: '1px solid var(--border-color)' 
                                    }}
                                />
                                <input
                                    type="text"
                                    value={editData.lastName || ''}
                                    onChange={(e) => setEditData({...editData, lastName: e.target.value})}
                                    style={{ 
                                        flex: 1, 
                                        padding: '8px', 
                                        borderRadius: 'var(--radius-sm)', 
                                        border: '1px solid var(--border-color)' 
                                    }}
                                />
                            </div>
                        ) : (
                            <p style={{ color: 'var(--text-primary)' }}>{pirData.firstName} {pirData.lastName}</p>
                        )}
                    </div>

                    <div>
                        <label style={{ fontWeight: 'bold', color: 'var(--text-secondary)' }}>Email</label>
                        <p style={{ color: 'var(--text-primary)' }}>{pirData.email}</p>
                    </div>

                    <div>
                        <label style={{ fontWeight: 'bold', color: 'var(--text-secondary)' }}>Phone</label>
                        {editing ? (
                            <input
                                type="tel"
                                value={editData.phone || ''}
                                onChange={(e) => setEditData({...editData, phone: e.target.value})}
                                style={{ 
                                    width: '100%', 
                                    padding: '8px', 
                                    borderRadius: 'var(--radius-sm)', 
                                    border: '1px solid var(--border-color)' 
                                }}
                            />
                        ) : (
                            <p style={{ color: 'var(--text-primary)' }}>{pirData.phone || 'Not provided'}</p>
                        )}
                    </div>

                    <div>
                        <label style={{ fontWeight: 'bold', color: 'var(--text-secondary)' }}>Date of Birth</label>
                        {editing ? (
                            <input
                                type="date"
                                value={editData.dateOfBirth || ''}
                                onChange={(e) => setEditData({...editData, dateOfBirth: e.target.value})}
                                style={{ 
                                    width: '100%', 
                                    padding: '8px', 
                                    borderRadius: 'var(--radius-sm)', 
                                    border: '1px solid var(--border-color)' 
                                }}
                            />
                        ) : (
                            <p style={{ color: 'var(--text-primary)' }}>{pirData.dateOfBirth || 'Not provided'}</p>
                        )}
                    </div>

                    <div>
                        <label style={{ fontWeight: 'bold', color: 'var(--text-secondary)' }}>Sobriety Date</label>
                        {editing ? (
                            <input
                                type="date"
                                value={editData.sobrietyDate || ''}
                                onChange={(e) => setEditData({...editData, sobrietyDate: e.target.value})}
                                style={{ 
                                    width: '100%', 
                                    padding: '8px', 
                                    borderRadius: 'var(--radius-sm)', 
                                    border: '1px solid var(--border-color)' 
                                }}
                            />
                        ) : (
                            <p style={{ color: 'var(--text-primary)' }}>{formatDate(pirData.sobrietyDate)}</p>
                        )}
                    </div>

                    <div>
                        <label style={{ fontWeight: 'bold', color: 'var(--text-secondary)' }}>Substance</label>
                        <p style={{ color: 'var(--text-primary)' }}>{pirData.substance || 'Not specified'}</p>
                    </div>

                    <div style={{ gridColumn: 'span 2' }}>
                        <label style={{ fontWeight: 'bold', color: 'var(--text-secondary)' }}>Address</label>
                        {editing ? (
                            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '10px' }}>
                                <input
                                    type="text"
                                    value={editData.address?.street || ''}
                                    onChange={(e) => setEditData({
                                        ...editData, 
                                        address: {...editData.address, street: e.target.value}
                                    })}
                                    placeholder="Street Address"
                                    style={{ 
                                        padding: '8px', 
                                        borderRadius: 'var(--radius-sm)', 
                                        border: '1px solid var(--border-color)' 
                                    }}
                                />
                                <input
                                    type="text"
                                    value={editData.address?.city || ''}
                                    onChange={(e) => setEditData({
                                        ...editData, 
                                        address: {...editData.address, city: e.target.value}
                                    })}
                                    placeholder="City"
                                    style={{ 
                                        padding: '8px', 
                                        borderRadius: 'var(--radius-sm)', 
                                        border: '1px solid var(--border-color)' 
                                    }}
                                />
                                <input
                                    type="text"
                                    value={editData.address?.state || ''}
                                    onChange={(e) => setEditData({
                                        ...editData, 
                                        address: {...editData.address, state: e.target.value}
                                    })}
                                    placeholder="State"
                                    style={{ 
                                        padding: '8px', 
                                        borderRadius: 'var(--radius-sm)', 
                                        border: '1px solid var(--border-color)' 
                                    }}
                                />
                                <input
                                    type="text"
                                    value={editData.address?.zip || ''}
                                    onChange={(e) => setEditData({
                                        ...editData, 
                                        address: {...editData.address, zip: e.target.value}
                                    })}
                                    placeholder="ZIP"
                                    style={{ 
                                        padding: '8px', 
                                        borderRadius: 'var(--radius-sm)', 
                                        border: '1px solid var(--border-color)' 
                                    }}
                                />
                            </div>
                        ) : (
                            <p style={{ color: 'var(--text-primary)' }}>
                                {pirData.address ? 
                                    `${pirData.address.street || ''} ${pirData.address.city || ''}, ${pirData.address.state || ''} ${pirData.address.zip || ''}`.trim() : 
                                    'Not provided'}
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* Assigned Coach Section */}
            <div style={{
                background: 'var(--text-white)',
                borderRadius: 'var(--radius-lg)',
                padding: '25px',
                boxShadow: 'var(--shadow-sm)',
                marginBottom: '20px'
            }}>
                <h3 style={{ marginBottom: '20px', color: 'var(--text-primary)' }}>Assigned Coach</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <div>
                        <label style={{ fontWeight: 'bold', color: 'var(--text-secondary)' }}>Current Coach</label>
                        {editing ? (
                            <select
                                value={editData.assignedCoach || ''}
                                onChange={(e) => setEditData({...editData, assignedCoach: e.target.value})}
                                style={{ 
                                    width: '100%', 
                                    padding: '8px', 
                                    borderRadius: 'var(--radius-sm)', 
                                    border: '1px solid var(--border-color)',
                                    fontSize: '14px'
                                }}
                            >
                                <option value="">-- No Coach Assigned --</option>
                                {availableCoaches.map(coach => (
                                    <option key={coach.id} value={coach.id}>
                                        {coach.displayName || coach.email} ({coach.role})
                                    </option>
                                ))}
                            </select>
                        ) : (
                            <p style={{ color: 'var(--text-primary)' }}>
                                {availableCoaches.find(c => c.id === pirData.assignedCoach)?.displayName || 
                                 availableCoaches.find(c => c.id === pirData.assignedCoach)?.email || 
                                 'No coach assigned'}
                            </p>
                        )}
                    </div>
                    <div>
                        <label style={{ fontWeight: 'bold', color: 'var(--text-secondary)' }}>Coach Email</label>
                        <p style={{ color: 'var(--text-primary)' }}>
                            {availableCoaches.find(c => c.id === pirData.assignedCoach)?.email || 'N/A'}
                        </p>
                    </div>
                </div>
                
                {pirData.coachAssignmentHistory && pirData.coachAssignmentHistory.length > 0 && (
                    <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid var(--border-color)' }}>
                        <h4 style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '10px' }}>Assignment History</h4>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                            {pirData.coachAssignmentHistory.slice(0, 3).map((history, index) => (
                                <div key={index} style={{ padding: '5px 0' }}>
                                    {formatDate(history.assignedAt)} - Assigned to {history.coachName || 'Unknown'}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Account Management Section */}
            <div style={{
                background: 'var(--text-white)',
                borderRadius: 'var(--radius-lg)',
                padding: '25px',
                boxShadow: 'var(--shadow-sm)',
                marginBottom: '20px',
                border: '2px solid var(--border-color)'
            }}>
                <h3 style={{ marginBottom: '20px', color: 'var(--text-primary)' }}>⚠️ Account Management</h3>
                
                <div style={{ display: 'grid', gap: '15px' }}>
                    {/* Active Status Control */}
                    <div style={{
                        padding: '15px',
                        background: pirData.active ? 'rgba(76, 175, 80, 0.1)' : 'rgba(255, 193, 7, 0.1)',
                        borderRadius: 'var(--radius-md)',
                        border: pirData.active ? '1px solid var(--success-color)' : '1px solid var(--warning-color)'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <div style={{ fontWeight: 'bold', marginBottom: '5px', color: 'var(--text-primary)' }}>
                                    Account Status: {pirData.active ? '✅ Active' : '⚠️ Inactive'}
                                </div>
                                <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                                    {pirData.active ? 
                                        'PIR can log in and access all features' : 
                                        'PIR cannot log in. Activate to restore access.'}
                                </div>
                            </div>
                            {!pirData.deleted && (
                                <button
                                    onClick={handleToggleActiveStatus}
                                    style={{
                                        background: pirData.active ? 'var(--gradient-warning)' : 'var(--gradient-success)',
                                        color: 'var(--text-white)',
                                        border: 'none',
                                        padding: '10px 20px',
                                        borderRadius: 'var(--radius-sm)',
                                        cursor: 'pointer',
                                        fontWeight: 'bold',
                                        fontSize: '14px',
                                        transition: 'var(--transition-fast)'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                                    onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                                >
                                    {pirData.active ? 'Deactivate Account' : 'Activate Account'}
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Delete Account Control */}
                    {!pirData.deleted && (
                        <div style={{
                            padding: '15px',
                            background: 'rgba(244, 67, 54, 0.05)',
                            borderRadius: 'var(--radius-md)',
                            border: '2px solid var(--danger-color)'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <div style={{ fontWeight: 'bold', marginBottom: '5px', color: 'var(--text-primary)' }}>
                                        🚫 Danger Zone: Delete Account
                                    </div>
                                    <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                                        Permanently mark account as deleted. Data preserved for compliance.
                                    </div>
                                </div>
                                <button
                                    onClick={handleDeleteAccount}
                                    style={{
                                        background: 'var(--gradient-danger)',
                                        color: 'var(--text-white)',
                                        border: 'none',
                                        padding: '10px 20px',
                                        borderRadius: 'var(--radius-sm)',
                                        cursor: 'pointer',
                                        fontWeight: 'bold',
                                        fontSize: '14px',
                                        transition: 'var(--transition-fast)'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                                    onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                                >
                                    Delete Account
                                </button>
                            </div>
                        </div>
                    )}
                    
                    {/* Deleted Account Banner */}
                    {pirData.deleted && (
                        <div style={{
                            padding: '15px',
                            background: 'rgba(244, 67, 54, 0.1)',
                            borderRadius: 'var(--radius-md)',
                            border: '2px solid var(--danger-color)'
                        }}>
                            <div style={{ fontWeight: 'bold', marginBottom: '5px', color: 'var(--danger-color)' }}>
                                🚫 ACCOUNT DELETED
                            </div>
                            <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                                Deleted on: {pirData.deletedAt ? formatDateTime(pirData.deletedAt) : 'Unknown'}
                                <br />
                                PIR cannot log in. All data preserved for compliance.
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Emergency Contacts */}
            <div style={{
                background: 'var(--text-white)',
                borderRadius: 'var(--radius-lg)',
                padding: '25px',
                boxShadow: 'var(--shadow-sm)',
                marginBottom: '20px'
            }}>
                <h3 style={{ marginBottom: '20px', color: 'var(--text-primary)' }}>Emergency Contacts</h3>
                {pirData.emergencyContacts && pirData.emergencyContacts.length > 0 ? (
                    <div style={{ display: 'grid', gap: '15px' }}>
                        {pirData.emergencyContacts.map((contact, index) => (
                            <div key={index} style={{
                                padding: '15px',
                                background: contact.isPrimary ? 'rgba(76, 175, 80, 0.1)' : 'var(--background-secondary)',
                                borderRadius: 'var(--radius-md)',
                                border: contact.isPrimary ? '2px solid var(--success-color)' : '1px solid var(--border-color)'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <div style={{ fontWeight: 'bold', fontSize: '16px', color: 'var(--text-primary)' }}>
                                            {contact.name} 
                                            {contact.isPrimary && (
                                                <span style={{
                                                    marginLeft: '10px',
                                                    background: 'var(--success-color)',
                                                    color: 'var(--text-white)',
                                                    padding: '2px 8px',
                                                    borderRadius: '12px',
                                                    fontSize: '12px'
                                                }}>PRIMARY</span>
                                            )}
                                        </div>
                                        <div style={{ color: 'var(--text-secondary)', marginTop: '5px' }}>
                                            {contact.relationship} • {contact.phone}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p style={{ color: 'var(--text-secondary)' }}>No emergency contacts configured</p>
                )}
            </div>

            {/* Sponsor Information */}
            <div style={{
                background: 'var(--text-white)',
                borderRadius: 'var(--radius-lg)',
                padding: '25px',
                boxShadow: 'var(--shadow-sm)'
            }}>
                <h3 style={{ marginBottom: '20px', color: 'var(--text-primary)' }}>Sponsor Information</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <div>
                        <label style={{ fontWeight: 'bold', color: 'var(--text-secondary)' }}>Sponsor Name</label>
                        {editing ? (
                            <input
                                type="text"
                                value={editData.sponsorName || ''}
                                onChange={(e) => setEditData({...editData, sponsorName: e.target.value})}
                                style={{ 
                                    width: '100%', 
                                    padding: '8px', 
                                    borderRadius: 'var(--radius-sm)', 
                                    border: '1px solid var(--border-color)' 
                                }}
                            />
                        ) : (
                            <p style={{ color: 'var(--text-primary)' }}>{pirData.sponsorName || 'Not assigned'}</p>
                        )}
                    </div>
                    <div>
                        <label style={{ fontWeight: 'bold', color: 'var(--text-secondary)' }}>Sponsor Phone</label>
                        {editing ? (
                            <input
                                type="tel"
                                value={editData.sponsorPhone || ''}
                                onChange={(e) => setEditData({...editData, sponsorPhone: e.target.value})}
                                style={{ 
                                    width: '100%', 
                                    padding: '8px', 
                                    borderRadius: 'var(--radius-sm)', 
                                    border: '1px solid var(--border-color)' 
                                }}
                            />
                        ) : (
                            <p style={{ color: 'var(--text-primary)' }}>{pirData.sponsorPhone || 'Not provided'}</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
// ========== PROGRESS TAB - CSS VARIABLES + READABLE TEXT ==========
const renderProgressTab = () => (
    <div style={{ padding: '20px' }}>
        {/* Compliance Metrics */}
        <div style={{
            background: 'var(--text-white)',
            borderRadius: 'var(--radius-lg)',
            padding: '20px',
            marginBottom: '20px',
            boxShadow: 'var(--shadow-sm)'
        }}>
            <h3 style={{ 
                marginBottom: '20px', 
                color: 'var(--text-primary)',
                fontSize: '18px',
                fontWeight: '600'
            }}>
                Compliance Metrics (Last {complianceData.daysTracked} Days)
            </h3>
            <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
                gap: '20px' 
            }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ 
                        fontSize: '36px', 
                        fontWeight: 'bold', 
                        color: 'var(--success-color)' 
                    }}>
                        {complianceData.morningRate}%
                    </div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                        Morning Check-ins
                    </div>
                </div>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ 
                        fontSize: '36px', 
                        fontWeight: 'bold', 
                        color: 'var(--primary-color)' 
                    }}>
                        {complianceData.eveningRate}%
                    </div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                        Evening Reflections
                    </div>
                </div>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ 
                        fontSize: '36px', 
                        fontWeight: 'bold', 
                        color: 'var(--warning-color)' 
                    }}>
                        {complianceData.assignmentRate}%
                    </div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                        Assignments Complete
                    </div>
                </div>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ 
                        fontSize: '36px', 
                        fontWeight: 'bold', 
                        color: 'var(--secondary-color)' 
                    }}>
                        {complianceData.totalCheckIns}
                    </div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                        Total Check-ins
                    </div>
                </div>
            </div>
        </div>

        {/* Check-ins History Table */}
        <div style={{
            background: 'var(--text-white)',
            borderRadius: 'var(--radius-lg)',
            padding: '20px',
            marginBottom: '20px',
            boxShadow: 'var(--shadow-sm)'
        }}>
            <h3 style={{ 
                marginBottom: '20px', 
                color: 'var(--text-primary)',
                fontSize: '18px',
                fontWeight: '600'
            }}>
                Check-in History
            </h3>
            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ 
                            borderBottom: '2px solid var(--border-color)', 
                            background: 'var(--background-secondary)' 
                        }}>
                            <th style={{ 
                                padding: '12px', 
                                textAlign: 'left', 
                                color: 'var(--text-primary)', 
                                fontWeight: 'bold',
                                fontSize: '14px'
                            }}>Date</th>
                            <th style={{ 
                                padding: '12px', 
                                textAlign: 'center', 
                                color: 'var(--text-primary)', 
                                fontWeight: 'bold',
                                fontSize: '14px'
                            }}>Morning</th>
                            <th style={{ 
                                padding: '12px', 
                                textAlign: 'center', 
                                color: 'var(--text-primary)', 
                                fontWeight: 'bold',
                                fontSize: '14px'
                            }}>Evening</th>
                            <th style={{ 
                                padding: '12px', 
                                textAlign: 'center', 
                                color: 'var(--text-primary)', 
                                fontWeight: 'bold',
                                fontSize: '14px'
                            }}>Mood</th>
                            <th style={{ 
                                padding: '12px', 
                                textAlign: 'center', 
                                color: 'var(--text-primary)', 
                                fontWeight: 'bold',
                                fontSize: '14px'
                            }}>Craving</th>
                            <th style={{ 
                                padding: '12px', 
                                textAlign: 'center', 
                                color: 'var(--text-primary)', 
                                fontWeight: 'bold',
                                fontSize: '14px'
                            }}>Sleep</th>
                            <th style={{ 
                                padding: '12px', 
                                textAlign: 'left', 
                                color: 'var(--text-primary)', 
                                fontWeight: 'bold',
                                fontSize: '14px'
                            }}>Daily Pledge</th>
                        </tr>
                    </thead>
                    <tbody>
                        {checkIns && checkIns.length > 0 ? (
                            checkIns.map((checkIn, index) => (
                                <tr key={checkIn.id} style={{ 
                                    borderBottom: '1px solid var(--border-color)',
                                    background: index % 2 === 0 ? 'var(--text-white)' : 'var(--background-secondary)'
                                }}>
                                    <td style={{ 
                                        padding: '10px', 
                                        color: 'var(--text-primary)', 
                                        fontWeight: '500',
                                        fontSize: '14px'
                                    }}>
                                        {formatDate(checkIn.createdAt)}
                                    </td>
                                    <td style={{ padding: '10px', textAlign: 'center' }}>
                                        {checkIn.morningData ? (
                                            <span style={{ 
                                                color: 'var(--success-color)', 
                                                fontSize: '18px', 
                                                fontWeight: 'bold' 
                                            }}>✓</span>
                                        ) : (
                                            <span style={{ 
                                                color: 'var(--text-muted)', 
                                                fontSize: '18px' 
                                            }}>✗</span>
                                        )}
                                    </td>
                                    <td style={{ padding: '10px', textAlign: 'center' }}>
                                        {checkIn.eveningData ? (
                                            <span style={{ 
                                                color: 'var(--primary-color)', 
                                                fontSize: '18px', 
                                                fontWeight: 'bold' 
                                            }}>✓</span>
                                        ) : (
                                            <span style={{ 
                                                color: 'var(--text-muted)', 
                                                fontSize: '18px' 
                                            }}>✗</span>
                                        )}
                                    </td>
                                    <td style={{ 
                                        padding: '10px', 
                                        textAlign: 'center', 
                                        color: 'var(--text-primary)', 
                                        fontWeight: '500',
                                        fontSize: '14px'
                                    }}>
                                        {checkIn.morningData?.mood || checkIn.eveningData?.mood || '-'}/10
                                    </td>
                                    <td style={{ 
                                        padding: '10px', 
                                        textAlign: 'center', 
                                        color: 'var(--text-primary)', 
                                        fontWeight: '500',
                                        fontSize: '14px'
                                    }}>
                                        {checkIn.morningData?.craving || checkIn.eveningData?.craving || '-'}/10
                                    </td>
                                    <td style={{ 
                                        padding: '10px', 
                                        textAlign: 'center', 
                                        color: 'var(--text-primary)', 
                                        fontWeight: '500',
                                        fontSize: '14px'
                                    }}>
                                        {checkIn.morningData?.sleepQuality || '-'}/10
                                    </td>
                                    <td style={{ padding: '10px' }}>
                                        <div style={{ 
                                            maxWidth: '200px', 
                                            overflow: 'hidden', 
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap',
                                            fontSize: '13px',
                                            color: 'var(--text-secondary)',
                                            fontWeight: '400'
                                        }}>
                                            {checkIn.morningData?.dailyPledge || '-'}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="7" style={{ 
                                    padding: '40px', 
                                    textAlign: 'center', 
                                    color: 'var(--text-secondary)',
                                    background: 'var(--background-secondary)',
                                    fontSize: '14px'
                                }}>
                                    No check-ins recorded yet
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>

        {/* Progress Charts */}
        <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr', 
            gap: '20px', 
            marginBottom: '20px' 
        }}>
            <div style={{
                background: 'var(--text-white)',
                borderRadius: 'var(--radius-lg)',
                padding: '20px',
                boxShadow: 'var(--shadow-sm)'
            }}>
                <h4 style={{ 
                    marginBottom: '15px', 
                    color: 'var(--text-primary)',
                    fontSize: '16px',
                    fontWeight: '600'
                }}>
                    30-Day Mood Trend
                </h4>
                <div style={{ height: '200px' }}>
                    <canvas id={`mood-chart-${pirId}`}></canvas>
                </div>
            </div>
            
            <div style={{
                background: 'var(--text-white)',
                borderRadius: 'var(--radius-lg)',
                padding: '20px',
                boxShadow: 'var(--shadow-sm)'
            }}>
                <h4 style={{ 
                    marginBottom: '15px', 
                    color: 'var(--text-primary)',
                    fontSize: '16px',
                    fontWeight: '600'
                }}>
                    30-Day Craving Trend
                </h4>
                <div style={{ height: '200px' }}>
                    <canvas id={`craving-chart-${pirId}`}></canvas>
                </div>
            </div>
            
            <div style={{
                background: 'var(--text-white)',
                borderRadius: 'var(--radius-lg)',
                padding: '20px',
                boxShadow: 'var(--shadow-sm)'
            }}>
                <h4 style={{ 
                    marginBottom: '15px', 
                    color: 'var(--text-primary)',
                    fontSize: '16px',
                    fontWeight: '600'
                }}>
                    30-Day Anxiety Trend
                </h4>
                <div style={{ height: '200px' }}>
                    <canvas id={`anxiety-chart-${pirId}`}></canvas>
                </div>
            </div>
            
            <div style={{
                background: 'var(--text-white)',
                borderRadius: 'var(--radius-lg)',
                padding: '20px',
                boxShadow: 'var(--shadow-sm)'
            }}>
                <h4 style={{ 
                    marginBottom: '15px', 
                    color: 'var(--text-primary)',
                    fontSize: '16px',
                    fontWeight: '600'
                }}>
                    30-Day Sleep Quality Trend
                </h4>
                <div style={{ height: '200px' }}>
                    <canvas id={`sleep-chart-${pirId}`}></canvas>
                </div>
            </div>
        </div>

        {/* Evening Reflections Section */}
        <div style={{
            background: 'var(--text-white)',
            borderRadius: 'var(--radius-lg)',
            padding: '20px',
            marginBottom: '20px',
            boxShadow: 'var(--shadow-sm)'
        }}>
            <h3 style={{ 
                marginBottom: '20px', 
                color: 'var(--text-primary)',
                fontSize: '18px',
                fontWeight: '600'
            }}>
                Evening Reflections
            </h3>
            <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
                {checkIns && checkIns.filter(c => c.eveningData).length > 0 ? (
                    checkIns.filter(c => c.eveningData).map((checkIn, index) => (
                        <div key={checkIn.id} style={{
                            padding: '20px',
                            marginBottom: '15px',
                            background: index % 2 === 0 ? 'var(--background-secondary)' : '#f5f5f5',
                            borderRadius: 'var(--radius-md)',
                            borderLeft: '4px solid var(--primary-color)'
                        }}>
                            <div style={{ 
                                display: 'flex', 
                                justifyContent: 'space-between', 
                                alignItems: 'center',
                                marginBottom: '15px'
                            }}>
                                <h5 style={{ 
                                    margin: 0, 
                                    color: 'var(--text-primary)',
                                    fontSize: '15px',
                                    fontWeight: '600'
                                }}>
                                    {formatDate(checkIn.createdAt)}
                                </h5>
                                <div style={{
                                    background: 'var(--primary-color)',
                                    color: 'var(--text-white)',
                                    padding: '4px 12px',
                                    borderRadius: '12px',
                                    fontSize: '12px',
                                    fontWeight: '500'
                                }}>
                                    Overall Day: {checkIn.eveningData.overallDay || 0}/10
                                </div>
                            </div>
                            
                            <div style={{ display: 'grid', gap: '12px' }}>
                                {checkIn.eveningData.gratitude && (
                                    <div>
                                        <strong style={{ 
                                            color: 'var(--success-color)', 
                                            fontSize: '13px',
                                            fontWeight: '600'
                                        }}>Gratitude:</strong>
                                        <p style={{ 
                                            margin: '4px 0', 
                                            color: 'var(--text-primary)', 
                                            fontSize: '14px',
                                            lineHeight: '1.5'
                                        }}>
                                            {checkIn.eveningData.gratitude}
                                        </p>
                                    </div>
                                )}
                                
                                {checkIn.eveningData.challenges && (
                                    <div>
                                        <strong style={{ 
                                            color: 'var(--warning-color)', 
                                            fontSize: '13px',
                                            fontWeight: '600'
                                        }}>Challenges:</strong>
                                        <p style={{ 
                                            margin: '4px 0', 
                                            color: 'var(--text-primary)', 
                                            fontSize: '14px',
                                            lineHeight: '1.5'
                                        }}>
                                            {checkIn.eveningData.challenges}
                                        </p>
                                    </div>
                                )}
                                
                                {checkIn.eveningData.tomorrowGoal && (
                                    <div>
                                        <strong style={{ 
                                            color: 'var(--secondary-color)', 
                                            fontSize: '13px',
                                            fontWeight: '600'
                                        }}>Tomorrow's Goal:</strong>
                                        <p style={{ 
                                            margin: '4px 0', 
                                            color: 'var(--text-primary)', 
                                            fontSize: '14px',
                                            lineHeight: '1.5'
                                        }}>
                                            {checkIn.eveningData.tomorrowGoal}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                ) : (
                    <div style={{ 
                        padding: '40px', 
                        textAlign: 'center', 
                        color: 'var(--text-secondary)',
                        fontSize: '14px'
                    }}>
                        No evening reflections recorded yet
                    </div>
                )}
            </div>
        </div>

        {/* Pledges Section */}
        <div style={{
            background: 'var(--text-white)',
            borderRadius: 'var(--radius-lg)',
            padding: '20px',
            boxShadow: 'var(--shadow-sm)'
        }}>
            <h3 style={{ 
                marginBottom: '20px', 
                color: 'var(--text-primary)',
                fontSize: '18px',
                fontWeight: '600'
            }}>
                Daily Pledges
            </h3>
            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                {pledges && pledges.length > 0 ? (
                    pledges.map((pledge, index) => (
                        <div key={pledge.id} style={{
                            padding: '15px',
                            marginBottom: '10px',
                            background: index % 2 === 0 ? 'var(--background-secondary)' : '#f5f5f5',
                            borderRadius: 'var(--radius-sm)',
                            borderLeft: `4px solid ${pledge.completed ? 'var(--success-color)' : 'var(--warning-color)'}`
                        }}>
                            <div style={{ 
                                display: 'flex', 
                                justifyContent: 'space-between', 
                                alignItems: 'center',
                                marginBottom: '8px'
                            }}>
                                <span style={{ 
                                    fontSize: '12px', 
                                    color: 'var(--text-secondary)',
                                    fontWeight: '500'
                                }}>
                                    {formatDate(pledge.createdAt)}
                                </span>
                                {pledge.completed && (
                                    <span style={{ 
                                        color: 'var(--success-color)', 
                                        fontSize: '16px' 
                                    }}>✓</span>
                                )}
                            </div>
                            <p style={{ 
                                margin: 0, 
                                color: 'var(--text-primary)', 
                                fontSize: '14px',
                                lineHeight: '1.5'
                            }}>
                                {pledge.content || pledge.text || pledge.pledge}
                            </p>
                        </div>
                    ))
                ) : (
                    <div style={{ 
                        padding: '30px', 
                        textAlign: 'center', 
                        color: 'var(--text-secondary)',
                        fontSize: '14px'
                    }}>
                        No pledges recorded yet
                    </div>
                )}
            </div>
        </div>
    </div>
);

// ========== GOLDEN THREAD TAB - CSS VARIABLES + READABLE TEXT ==========
const renderGoldenThreadTab = () => {
    // Handler functions remain unchanged...
    const handleCreateGoldenThread = async (threadData) => {
        // ... same implementation
    };

    const handleAddGoal = async (goalData) => {
        // ... same implementation
    };

    const handleAddObjective = async (objectiveData) => {
        // ... same implementation
    };

    const handleAddAssignment = async (assignmentData) => {
        // ... same implementation
    };

    return (
        <div style={{ padding: '20px' }}>
            <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                marginBottom: '20px' 
            }}>
                <h3 style={{ 
                    margin: 0, 
                    color: 'var(--text-primary)',
                    fontSize: '18px',
                    fontWeight: '600'
                }}>
                    Recovery Journey Structure
                </h3>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                        className="btn btn-primary"
                        onClick={() => setShowGoldenThread(true)}
                        style={{
                            background: 'var(--gradient-primary)',
                            border: 'none',
                            color: 'var(--text-white)',
                            padding: '10px 20px',
                            borderRadius: 'var(--radius-sm)',
                            cursor: 'pointer',
                            fontWeight: '500',
                            transition: 'var(--transition-fast)'
                        }}
                    >
                        + Golden Thread
                    </button>
                    <button
                        className="btn btn-secondary"
                        onClick={() => setShowAddGoal(true)}
                        style={{
                            background: 'var(--success-color)',
                            border: 'none',
                            color: 'var(--text-white)',
                            padding: '10px 20px',
                            borderRadius: 'var(--radius-sm)',
                            cursor: 'pointer',
                            fontWeight: '500',
                            transition: 'var(--transition-fast)'
                        }}
                    >
                        + Add Goal
                    </button>
                </div>
            </div>
            
            {/* Goals list */}
            {goals.length > 0 ? (
                goals.map(goal => (
                    <div key={goal.id} style={{
                        background: 'var(--text-white)',
                        borderRadius: 'var(--radius-lg)',
                        padding: '20px',
                        marginBottom: '20px',
                        boxShadow: 'var(--shadow-sm)',
                        borderLeft: `4px solid ${goal.status === 'completed' ? 'var(--success-color)' : 'var(--primary-color)'}`
                    }}>
                        <div 
                            style={{ 
                                display: 'flex', 
                                justifyContent: 'space-between', 
                                alignItems: 'center',
                                cursor: 'pointer'
                            }}
                            onClick={() => setExpandedGoals({...expandedGoals, [goal.id]: !expandedGoals[goal.id]})}
                        >
                            <div>
                                <h4 style={{ 
                                    margin: 0, 
                                    color: 'var(--text-primary)',
                                    fontSize: '16px',
                                    fontWeight: '600'
                                }}>
                                    {expandedGoals[goal.id] ? '▼' : '▶'} {goal.title}
                                </h4>
                                <p style={{ 
                                    margin: '5px 0', 
                                    color: 'var(--text-secondary)',
                                    fontSize: '14px'
                                }}>
                                    {goal.description}
                                </p>
                            </div>
                            <div style={{
                                background: `conic-gradient(var(--success-color) 0% ${goal.progress || 0}%, var(--border-color) ${goal.progress || 0}% 100%)`,
                                width: '60px',
                                height: '60px',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <div style={{
                                    background: 'var(--text-white)',
                                    width: '50px',
                                    height: '50px',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontWeight: 'bold',
                                    color: 'var(--text-primary)',
                                    fontSize: '14px'
                                }}>
                                    {goal.progress || 0}%
                                </div>
                            </div>
                        </div>
                        
                        {expandedGoals[goal.id] && (
                            <div style={{ marginTop: '20px' }}>
                                <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                                    <button 
                                        className="btn btn-secondary"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedGoalForObjective(goal);
                                            setShowAddObjective(true);
                                        }}
                                        style={{
                                            background: 'var(--primary-color)',
                                            border: 'none',
                                            color: 'var(--text-white)',
                                            padding: '8px 16px',
                                            borderRadius: 'var(--radius-sm)',
                                            cursor: 'pointer',
                                            fontSize: '13px',
                                            fontWeight: '500'
                                        }}
                                    >
                                        + Add Objective
                                    </button>
                                </div>
                                
                                {/* Objectives */}
                                <div style={{ marginBottom: '15px' }}>
                                    <h5 style={{ 
                                        color: 'var(--text-secondary)', 
                                        marginBottom: '10px',
                                        fontSize: '14px',
                                        fontWeight: '600'
                                    }}>
                                        Objectives
                                    </h5>
                                    {objectives.filter(o => o.goalId === goal.id).map(objective => (
                                        <div key={objective.id} style={{
                                            background: 'var(--background-secondary)',
                                            padding: '10px',
                                            borderRadius: 'var(--radius-sm)',
                                            marginBottom: '10px',
                                            borderLeft: `3px solid ${objective.status === 'completed' ? 'var(--success-color)' : 'var(--warning-color)'}`
                                        }}>
                                            <div style={{ 
                                                display: 'flex', 
                                                justifyContent: 'space-between', 
                                                alignItems: 'center' 
                                            }}>
                                                <strong style={{ 
                                                    color: 'var(--text-primary)',
                                                    fontSize: '14px',
                                                    fontWeight: '600'
                                                }}>
                                                    #{objective.order} - {objective.title}
                                                </strong>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setSelectedObjectiveForAssignment(objective);
                                                        setShowAddAssignment(true);
                                                    }}
                                                    style={{
                                                        background: 'var(--secondary-color)',
                                                        border: 'none',
                                                        color: 'var(--text-white)',
                                                        padding: '4px 12px',
                                                        borderRadius: 'var(--radius-sm)',
                                                        cursor: 'pointer',
                                                        fontSize: '12px',
                                                        fontWeight: '500'
                                                    }}
                                                >
                                                    + Assignment
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                
                                {/* Assignments */}
                                <div>
                                    <h5 style={{ 
                                        color: 'var(--text-secondary)', 
                                        marginBottom: '10px',
                                        fontSize: '14px',
                                        fontWeight: '600'
                                    }}>
                                        Assignments
                                    </h5>
                                    {assignments.filter(a => a.goalId === goal.id).map(assignment => (
                                        <div key={assignment.id} style={{
                                            background: '#f5f5f5',
                                            padding: '10px',
                                            borderRadius: 'var(--radius-sm)',
                                            marginBottom: '10px',
                                            borderLeft: `3px solid ${assignment.status === 'completed' ? 'var(--success-color)' : 'var(--primary-color)'}`
                                        }}>
                                            <strong style={{ 
                                                color: 'var(--text-primary)',
                                                fontSize: '14px',
                                                fontWeight: '600'
                                            }}>
                                                {assignment.title}
                                            </strong>
                                            <div style={{ 
                                                fontSize: '13px', 
                                                color: 'var(--text-secondary)',
                                                marginTop: '4px'
                                            }}>
                                                {assignment.description}
                                            </div>
                                            <div style={{ 
                                                fontSize: '12px', 
                                                color: 'var(--text-muted)', 
                                                marginTop: '5px' 
                                            }}>
                                                Due: {formatDate(assignment.dueDate)} • Status: {assignment.status}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                ))
            ) : (
                <div style={{
                    background: 'var(--text-white)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '40px',
                    textAlign: 'center',
                    color: 'var(--text-secondary)',
                    boxShadow: 'var(--shadow-sm)'
                }}>
                    <p style={{ fontSize: '15px', margin: '0 0 10px 0' }}>
                        No goals configured yet
                    </p>
                    <p style={{ fontSize: '14px', margin: 0 }}>
                        Click "Golden Thread" or "Add Goal" to get started
                    </p>
                </div>
            )}

            {/* Modals remain the same */}
            {showGoldenThread && (
                <CreateGoalModal
                    type="goldenThread"
                    selectedPIR={{ id: pirId, displayName: pirData?.displayName, email: pirData?.email }}
                    selectedParent={null}
                    currentUser={user}
                    onSubmit={handleCreateGoldenThread}
                    onClose={() => setShowGoldenThread(false)}
                />
            )}

            {showAddGoal && (
                <CreateGoalModal
                    type="goal"
                    selectedPIR={{ id: pirId }}
                    selectedParent={null}
                    currentUser={user}
                    onSubmit={handleAddGoal}
                    onClose={() => setShowAddGoal(false)}
                />
            )}

            {showAddObjective && (
                <CreateGoalModal
                    type="objective"
                    selectedPIR={{ id: pirId }}
                    selectedParent={selectedGoalForObjective}
                    currentUser={user}
                    onSubmit={handleAddObjective}
                    onClose={() => {
                        setShowAddObjective(false);
                        setSelectedGoalForObjective(null);
                    }}
                />
            )}

            {showAddAssignment && (
                <CreateGoalModal
                    type="assignment"
                    selectedPIR={{ id: pirId }}
                    selectedParent={selectedObjectiveForAssignment}
                    currentUser={user}
                    onSubmit={handleAddAssignment}
                    onClose={() => {
                        setShowAddAssignment(false);
                        setSelectedObjectiveForAssignment(null);
                    }}
                />
            )}
        </div>
    );
};

  const renderMilestonesTab = () => {
    // Calculate milestones based on sobriety date using same logic as getRecoveryMilestones
    const calculateMilestones = () => {
        if (!pirData?.sobrietyDate) return [];
        
        // Parse sobriety date in LOCAL timezone (Pacific) - SAME AS getRecoveryMilestones
        let startYear, startMonth, startDay;
        
        if (typeof pirData.sobrietyDate === 'string' && pirData.sobrietyDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
            [startYear, startMonth, startDay] = pirData.sobrietyDate.split('-').map(Number);
        } else if (pirData.sobrietyDate.toDate) {
            const d = pirData.sobrietyDate.toDate();
            startYear = d.getFullYear();
            startMonth = d.getMonth() + 1;
            startDay = d.getDate();
        } else if (pirData.sobrietyDate.seconds) {
            const d = new Date(pirData.sobrietyDate.seconds * 1000);
            startYear = d.getFullYear();
            startMonth = d.getMonth() + 1;
            startDay = d.getDate();
        } else {
            const d = new Date(pirData.sobrietyDate);
            startYear = d.getFullYear();
            startMonth = d.getMonth() + 1;
            startDay = d.getDate();
        }
        
        const startDate = new Date(startYear, startMonth - 1, startDay, 0, 0, 0, 0);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const allMilestones = [];
        
        // DAY-BASED MILESTONES (count exact days)
        const dayBased = [
            { days: 1, title: '24 Hours Clean', icon: '🌟', description: 'The first day - the hardest step' },
            { days: 7, title: '1 Week Clean', icon: '📅', description: 'A full week of sobriety' },
            { days: 30, title: '1 Month Clean', icon: '🏆', description: 'First major milestone' },
            { days: 60, title: '2 Months Clean', icon: '💪', description: 'Establishing new habits' },
            { days: 90, title: '3 Months Clean', icon: '🎯', description: 'Quarter year achieved' },
            { days: 100, title: '100 Days Clean', icon: '💯', description: 'Triple digits!' },
            { days: 200, title: '200 Days Clean', icon: '✨', description: 'Incredible progress' },
            { days: 500, title: '500 Days Clean', icon: '🏆', description: 'Over a year of dedication' },
            { days: 1000, title: '1000 Days Clean', icon: '🏅', description: 'A thousand days strong' }
        ];
        
        dayBased.forEach(milestone => {
            const targetDate = new Date(startDate);
            targetDate.setDate(targetDate.getDate() + milestone.days - 1);
            const achieved = today >= targetDate;
            const daysUntil = Math.ceil((targetDate - today) / (1000 * 60 * 60 * 24));
            
            allMilestones.push({
                ...milestone,
                targetDate,
                achieved,
                daysUntil: achieved ? 0 : daysUntil,
                achievedDate: achieved ? targetDate : null,
                id: `day-${milestone.days}`
            });
        });
        
        // MONTHLY MILESTONES (same day of month)
        const monthBased = [
            { months: 4, title: '4 Months Clean', icon: '⭐', description: 'Solid foundation built' },
            { months: 5, title: '5 Months Clean', icon: '🌈', description: 'Five months of growth' },
            { months: 6, title: '6 Months Clean', icon: '🎉', description: 'Half year milestone' },
            { months: 7, title: '7 Months Clean', icon: '🌟', description: 'Seven months strong' },
            { months: 8, title: '8 Months Clean', icon: '🏅', description: 'Eight months of progress' },
            { months: 9, title: '9 Months Clean', icon: '💎', description: 'Nine months of recovery' },
            { months: 10, title: '10 Months Clean', icon: '🌺', description: 'Ten months achieved' },
            { months: 11, title: '11 Months Clean', icon: '🎊', description: 'Almost a year!' },
            { months: 12, title: '1 Year Clean', icon: '🎂', description: 'Full year of recovery' },
            { months: 18, title: '18 Months Clean', icon: '🌟', description: 'A year and a half strong' }
        ];
        
        monthBased.forEach(milestone => {
            const targetDate = new Date(startYear, (startMonth - 1) + milestone.months, startDay, 0, 0, 0, 0);
            const achieved = today >= targetDate;
            const daysUntil = Math.ceil((targetDate - today) / (1000 * 60 * 60 * 24));
            
            allMilestones.push({
                days: Math.floor((targetDate - startDate) / (1000 * 60 * 60 * 24)) + 2,
                title: milestone.title,
                icon: milestone.icon,
                description: milestone.description,
                targetDate,
                achieved,
                daysUntil: achieved ? 0 : daysUntil,
                achievedDate: achieved ? targetDate : null,
                id: `month-${milestone.months}`
            });
        });
        
        // YEARLY MILESTONES (same month & day every year)
        const yearBased = [
            { years: 2, title: '2 Years Clean', icon: '🎈', description: 'Two years of sobriety' },
            { years: 3, title: '3 Years Clean', icon: '🎉', description: 'Three years of growth' },
            { years: 4, title: '4 Years Clean', icon: '🌟', description: 'Four years strong' },
            { years: 5, title: '5 Years Clean', icon: '💫', description: 'Half a decade of recovery' },
            { years: 6, title: '6 Years Clean', icon: '🌟', description: 'Six years of dedication' },
            { years: 7, title: '7 Years Clean', icon: '🌟', description: 'Seven years achieved' },
            { years: 8, title: '8 Years Clean', icon: '🌟', description: 'Eight years of sobriety' },
            { years: 9, title: '9 Years Clean', icon: '🌟', description: 'Nine years strong' },
            { years: 10, title: '10 Years Clean', icon: '💎', description: 'A decade of sobriety' }
        ];
        
        // Add 11-20 years dynamically
        for (let year = 11; year <= 20; year++) {
            yearBased.push({
                years: year,
                title: `${year} Years Clean`,
                icon: '🌟',
                description: `${year} years of recovery`
            });
        }
        
        yearBased.forEach(milestone => {
            const targetDate = new Date(startYear + milestone.years, startMonth - 1, startDay, 0, 0, 0, 0);
            const achieved = today >= targetDate;
            const daysUntil = Math.ceil((targetDate - today) / (1000 * 60 * 60 * 24));
            
            allMilestones.push({
                days: Math.floor((targetDate - startDate) / (1000 * 60 * 60 * 24)) + 2,
                title: milestone.title,
                icon: milestone.icon,
                description: milestone.description,
                targetDate,
                achieved,
                daysUntil: achieved ? 0 : daysUntil,
                achievedDate: achieved ? targetDate : null,
                id: `year-${milestone.years}`
            });
        });
        
        // Sort by target date
        allMilestones.sort((a, b) => a.targetDate - b.targetDate);
        
        return allMilestones;
    };
    
    const allMilestones = calculateMilestones();
    const achievedMilestones = allMilestones.filter(m => m.achieved);
    const upcomingMilestones = allMilestones.filter(m => !m.achieved).slice(0, 6);
    
    return (
        <div style={{ padding: '20px' }}>
            <h3 style={{ 
                marginBottom: '30px', 
                color: 'var(--text-primary)',
                fontSize: '18px',
                fontWeight: '600'
            }}>
                Recovery Milestones
            </h3>
            
            {/* Summary Stats */}
            <div style={{
                background: 'var(--gradient-primary)',
                borderRadius: 'var(--radius-lg)',
                padding: '25px',
                marginBottom: '30px',
                color: 'var(--text-white)',
                textAlign: 'center',
                boxShadow: 'var(--shadow-primary)'
            }}>
                <div style={{ fontSize: '48px', fontWeight: 'bold', marginBottom: '10px' }}>
                    {achievedMilestones.length}
                </div>
                <div style={{ fontSize: '18px', opacity: 0.9 }}>
                    Milestones Achieved
                </div>
                <div style={{ fontSize: '14px', opacity: 0.8, marginTop: '10px' }}>
                    {pirData?.sobrietyDays || 0} days of continuous sobriety
                </div>
            </div>
            
            {/* Achieved Milestones Section */}
            {achievedMilestones.length > 0 && (
                <>
                    <h4 style={{ 
                        marginBottom: '20px', 
                        color: 'var(--text-primary)',
                        fontSize: '16px',
                        fontWeight: '600'
                    }}>
                        Achieved Milestones 🎉
                    </h4>
                    <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                        gap: '20px',
                        marginBottom: '40px'
                    }}>
                        {achievedMilestones.map((milestone, index) => (
                            <div key={milestone.id || index} style={{
                                background: 'var(--gradient-success)',
                                borderRadius: 'var(--radius-lg)',
                                padding: '20px',
                                boxShadow: 'var(--shadow-md)',
                                position: 'relative',
                                overflow: 'hidden',
                                transform: 'scale(1)',
                                transition: 'var(--transition-fast)',
                                cursor: 'pointer'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}>
                                <div style={{
                                    position: 'absolute',
                                    top: '10px',
                                    right: '10px',
                                    fontSize: '24px',
                                    color: 'rgba(255,255,255,0.9)'
                                }}>
                                    ✓
                                </div>
                                <div style={{
                                    fontSize: '36px',
                                    marginBottom: '10px',
                                    textAlign: 'center'
                                }}>
                                    {milestone.icon}
                                </div>
                                <h5 style={{
                                    margin: '0 0 10px 0',
                                    color: 'var(--text-white)',
                                    textAlign: 'center',
                                    fontSize: '16px',
                                    fontWeight: 'bold'
                                }}>
                                    {milestone.title}
                                </h5>
                                <p style={{
                                    fontSize: '12px',
                                    color: 'rgba(255,255,255,0.9)',
                                    textAlign: 'center',
                                    margin: '0 0 10px 0'
                                }}>
                                    {milestone.description}
                                </p>
                                <div style={{
                                    fontSize: '11px',
                                    color: 'rgba(255,255,255,0.8)',
                                    textAlign: 'center',
                                    fontWeight: 'bold'
                                }}>
                                    Achieved on {formatDate(milestone.achievedDate)}
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}
            
            {/* Upcoming Milestones Section */}
            {upcomingMilestones.length > 0 && (
                <>
                    <h4 style={{ 
                        marginBottom: '20px', 
                        color: 'var(--text-primary)',
                        fontSize: '16px',
                        fontWeight: '600'
                    }}>
                        Upcoming Milestones 🎯
                    </h4>
                    <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                        gap: '20px' 
                    }}>
                        {upcomingMilestones.map((milestone, index) => (
                            <div key={milestone.id || index} style={{
                                background: 'var(--text-white)',
                                borderRadius: 'var(--radius-lg)',
                                padding: '20px',
                                boxShadow: 'var(--shadow-sm)',
                                border: '2px solid var(--border-color)',
                                position: 'relative',
                                overflow: 'hidden',
                                transform: 'scale(1)',
                                transition: 'var(--transition-fast)',
                                cursor: 'pointer'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'scale(1.05)';
                                e.currentTarget.style.borderColor = 'var(--primary-color)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'scale(1)';
                                e.currentTarget.style.borderColor = 'var(--border-color)';
                            }}>
                                {milestone.daysUntil <= 7 && (
                                    <div style={{
                                        position: 'absolute',
                                        top: '10px',
                                        right: '10px',
                                        background: 'var(--warning-color)',
                                        color: 'var(--text-white)',
                                        padding: '2px 8px',
                                        borderRadius: '12px',
                                        fontSize: '10px',
                                        fontWeight: 'bold'
                                    }}>
                                        SOON!
                                    </div>
                                )}
                                <div style={{
                                    fontSize: '36px',
                                    marginBottom: '10px',
                                    textAlign: 'center',
                                    opacity: 0.7
                                }}>
                                    {milestone.icon}
                                </div>
                                <h5 style={{
                                    margin: '0 0 10px 0',
                                    color: 'var(--text-primary)',
                                    textAlign: 'center',
                                    fontSize: '16px',
                                    fontWeight: 'bold'
                                }}>
                                    {milestone.title}
                                </h5>
                                <p style={{
                                    fontSize: '12px',
                                    color: 'var(--text-secondary)',
                                    textAlign: 'center',
                                    margin: '0 0 15px 0'
                                }}>
                                    {milestone.description}
                                </p>
                                <div style={{
                                    background: 'var(--background-secondary)',
                                    borderRadius: '20px',
                                    padding: '8px',
                                    textAlign: 'center'
                                }}>
                                    <div style={{
                                        fontSize: '20px',
                                        fontWeight: 'bold',
                                        color: milestone.daysUntil <= 7 ? 'var(--warning-color)' : 'var(--primary-color)'
                                    }}>
                                        {milestone.daysUntil}
                                    </div>
                                    <div style={{
                                        fontSize: '11px',
                                        color: 'var(--text-muted)',
                                        textTransform: 'uppercase'
                                    }}>
                                        days to go
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}
            
            {allMilestones.length === 0 && (
                <div style={{
                    background: 'var(--text-white)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '40px',
                    textAlign: 'center',
                    color: 'var(--text-secondary)',
                    boxShadow: 'var(--shadow-sm)'
                }}>
                    <p style={{ fontSize: '15px', margin: '0 0 10px 0' }}>
                        No milestones configured yet
                    </p>
                    <p style={{ fontSize: '14px', margin: 0 }}>
                        Milestones will appear once a sobriety date is set
                    </p>
                </div>
            )}
        </div>
    );
};

// Fixed renderCommunicationsTab
const renderCommunicationsTab = () => {
    const handleDeleteMessage = async (messageId, messageType) => {
        if (!confirm('Are you sure you want to delete this message?')) return;
        
        try {
            let collection = 'messages';
            if (messageType === 'community') collection = 'glrsChat';
            if (messageType === 'topic') collection = 'topicRoomMessages';
            
            await db.collection(collection).doc(messageId).delete();
            
            await db.collection('flaggedContent').add({
                originalCollection: collection,
                originalId: messageId,
                userId: pirId,
                flaggedBy: user.uid,
                reason: 'Deleted by coach',
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            await loadAllUserMessages();
            alert('Message deleted and flagged');
        } catch (error) {
            console.error('Error deleting message:', error);
            alert('Failed to delete message');
        }
    };
    
    return (
        <div style={{ padding: '20px' }}>
            <h3 style={{ 
                marginBottom: '20px', 
                color: 'var(--text-primary)',
                fontSize: '18px',
                fontWeight: '600'
            }}>
                Communication Activity
            </h3>
            
            {/* Message Stats */}
            <div style={{
                background: 'var(--text-white)',
                borderRadius: 'var(--radius-lg)',
                padding: '20px',
                marginBottom: '20px',
                boxShadow: 'var(--shadow-sm)'
            }}>
                <h4 style={{ 
                    marginBottom: '15px', 
                    color: 'var(--text-primary)',
                    fontSize: '16px',
                    fontWeight: '600'
                }}>
                    Engagement Metrics
                </h4>
                <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
                    gap: '20px' 
                }}>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ 
                            fontSize: '36px', 
                            fontWeight: 'bold', 
                            color: 'var(--info-color)' 
                        }}>
                            {allMessages.length}
                        </div>
                        <div style={{ 
                            color: 'var(--text-secondary)',
                            fontSize: '14px'
                        }}>
                            Total Messages
                        </div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ 
                            fontSize: '36px', 
                            fontWeight: 'bold', 
                            color: 'var(--success-color)' 
                        }}>
                            {allMessages.filter(m => m.type === 'community').length}
                        </div>
                        <div style={{ 
                            color: 'var(--text-secondary)',
                            fontSize: '14px'
                        }}>
                            Community Posts
                        </div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ 
                            fontSize: '36px', 
                            fontWeight: 'bold', 
                            color: 'var(--warning-color)' 
                        }}>
                            {allMessages.filter(m => m.type === 'topic').length}
                        </div>
                        <div style={{ 
                            color: 'var(--text-secondary)',
                            fontSize: '14px'
                        }}>
                            Topic Room Posts
                        </div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ 
                            fontSize: '36px', 
                            fontWeight: 'bold', 
                            color: 'var(--secondary-color)' 
                        }}>
                            {allMessages.filter(m => m.type === 'direct').length}
                        </div>
                        <div style={{ 
                            color: 'var(--text-secondary)',
                            fontSize: '14px'
                        }}>
                            Direct Messages
                        </div>
                    </div>
                </div>
            </div>

            {/* All Messages with Moderation Controls */}
            <div style={{
                background: 'var(--text-white)',
                borderRadius: 'var(--radius-lg)',
                padding: '20px',
                boxShadow: 'var(--shadow-sm)'
            }}>
                <h4 style={{ 
                    marginBottom: '15px', 
                    color: 'var(--text-primary)',
                    fontSize: '16px',
                    fontWeight: '600'
                }}>
                    Message History
                </h4>
                {allMessages.length > 0 ? (
                    <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
                        {allMessages.map(message => (
                            <div key={message.id} style={{
                                padding: '15px',
                                borderBottom: '1px solid var(--border-color)',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'start'
                            }}>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', gap: '10px', marginBottom: '5px' }}>
                                        <span style={{
                                            background: message.type === 'community' ? 'var(--success-color)' :
                                                       message.type === 'topic' ? 'var(--warning-color)' : 
                                                       'var(--info-color)',
                                            color: 'var(--text-white)',
                                            padding: '2px 8px',
                                            borderRadius: '12px',
                                            fontSize: '10px',
                                            fontWeight: 'bold'
                                        }}>
                                            {message.type.toUpperCase()}
                                        </span>
                                        {message.roomId && (
                                            <span style={{ 
                                                fontSize: '12px', 
                                                color: 'var(--text-muted)' 
                                            }}>
                                                Room: {message.roomId}
                                            </span>
                                        )}
                                        <span style={{ 
                                            fontSize: '12px', 
                                            color: 'var(--text-muted)' 
                                        }}>
                                            {formatTimeAgo(message.createdAt)}
                                        </span>
                                    </div>
                                    <div style={{ color: 'var(--text-primary)', fontSize: '14px' }}>
                                        {message.content || message.text || message.message || 'No content'}
                                    </div>
                                    {message.imageUrl && (
                                        <div style={{ marginTop: '10px' }}>
                                            <img 
                                                src={message.imageUrl} 
                                                alt="Message attachment" 
                                                style={{ 
                                                    maxWidth: '200px', 
                                                    borderRadius: 'var(--radius-sm)' 
                                                }}
                                            />
                                        </div>
                                    )}
                                </div>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <button
                                        onClick={() => handleDeleteMessage(message.id, message.type)}
                                        style={{
                                            background: 'var(--danger-color)',
                                            color: 'var(--text-white)',
                                            border: 'none',
                                            padding: '5px 10px',
                                            borderRadius: 'var(--radius-sm)',
                                            cursor: 'pointer',
                                            fontSize: '12px',
                                            fontWeight: '500',
                                            transition: 'var(--transition-fast)'
                                        }}
                                    >
                                        Delete
                                    </button>
                                    <button
                                        onClick={async () => {
                                            try {
                                                await db.collection('flaggedContent').add({
                                                    messageId: message.id,
                                                    messageType: message.type,
                                                    userId: pirId,
                                                    flaggedBy: user.uid,
                                                    reason: 'Flagged for review',
                                                    content: message.content || message.text,
                                                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                                                });
                                                alert('Message flagged for review');
                                            } catch (error) {
                                                console.error('Error flagging message:', error);
                                                alert('Failed to flag message');
                                            }
                                        }}
                                        style={{
                                            background: 'var(--warning-color)',
                                            color: 'var(--text-white)',
                                            border: 'none',
                                            padding: '5px 10px',
                                            borderRadius: 'var(--radius-sm)',
                                            cursor: 'pointer',
                                            fontSize: '12px',
                                            fontWeight: '500',
                                            transition: 'var(--transition-fast)'
                                        }}
                                    >
                                        Flag
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p style={{ 
                        color: 'var(--text-secondary)', 
                        padding: '20px', 
                        textAlign: 'center',
                        fontSize: '14px'
                    }}>
                        No messages sent yet
                    </p>
                )}
            </div>
        </div>
    );
};

const renderResourcesTab = () => (
    <div style={{ padding: '20px' }}>
        <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            marginBottom: '20px' 
        }}>
            <h3 style={{ 
                margin: 0, 
                color: 'var(--text-primary)',
                fontSize: '18px',
                fontWeight: '600'
            }}>
                Resource Management
            </h3>
            <div style={{ display: 'flex', gap: '10px' }}>
                <button
                    className="btn btn-primary"
                    onClick={() => setShowAssignResource(true)}
                    style={{
                        background: 'var(--gradient-success)',
                        border: 'none',
                        color: 'var(--text-white)',
                        padding: '10px 20px',
                        borderRadius: 'var(--radius-sm)',
                        cursor: 'pointer',
                        fontWeight: '500',
                        transition: 'var(--transition-fast)'
                    }}
                >
                    Assign Resource
                </button>
                <button
                    className="btn btn-primary"
                    onClick={() => setShowCreateResource(true)}
                    style={{
                        background: 'var(--gradient-secondary)',
                        border: 'none',
                        color: 'var(--text-white)',
                        padding: '10px 20px',
                        borderRadius: 'var(--radius-sm)',
                        cursor: 'pointer',
                        fontWeight: '500',
                        transition: 'var(--transition-fast)'
                    }}
                >
                    Create Resource
                </button>
            </div>
        </div>
        
        {['education', 'coping', 'daily', 'life', 'support', 'relapse'].map(category => {
            const categoryResources = resources.filter(r => r.category === category);
            if (categoryResources.length === 0) return null;
            
            return (
                <div key={category} style={{
                    background: 'var(--text-white)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '20px',
                    marginBottom: '20px',
                    boxShadow: 'var(--shadow-sm)'
                }}>
                    <h4 style={{ 
                        marginBottom: '15px', 
                        color: 'var(--text-primary)', 
                        textTransform: 'capitalize',
                        fontSize: '16px',
                        fontWeight: '600'
                    }}>
                        {category} Resources ({categoryResources.length})
                    </h4>
                    <div style={{ display: 'grid', gap: '10px' }}>
                        {categoryResources.map(resource => (
                            <div key={resource.id} style={{
                                padding: '15px',
                                background: 'var(--background-secondary)',
                                borderRadius: 'var(--radius-md)',
                                borderLeft: `3px solid ${
                                    resourceProgress[resource.id]?.status === 'completed' ? 'var(--success-color)' :
                                    resourceProgress[resource.id]?.status === 'in-progress' ? 'var(--warning-color)' :
                                    'var(--info-color)'
                                }`,
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}>
                                <div style={{ flex: 1 }}>
                                    <strong style={{ 
                                        color: 'var(--text-primary)',
                                        fontSize: '14px',
                                        fontWeight: '600'
                                    }}>
                                        {resource.title}
                                    </strong>
                                    <p style={{ 
                                        fontSize: '12px', 
                                        color: 'var(--text-secondary)', 
                                        margin: '5px 0' 
                                    }}>
                                        {resource.description}
                                    </p>
                                    {resource.url && (
                                        <a 
                                            href={resource.url} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            style={{
                                                fontSize: '11px',
                                                color: 'var(--primary-color)',
                                                textDecoration: 'none',
                                                fontWeight: '500'
                                            }}
                                        >
                                            View Resource →
                                        </a>
                                    )}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <span style={{
                                        background: resourceProgress[resource.id]?.status === 'completed' ? 'var(--success-color)' :
                                                   resourceProgress[resource.id]?.status === 'in-progress' ? 'var(--warning-color)' :
                                                   'var(--border-color)',
                                        color: 'var(--text-white)',
                                        padding: '4px 8px',
                                        borderRadius: '12px',
                                        fontSize: '10px',
                                        fontWeight: 'bold'
                                    }}>
                                        {resourceProgress[resource.id]?.status || 'Not Started'}
                                    </span>
                                    <button
                                        onClick={async () => {
                                            if (confirm('Are you sure you want to unassign this resource?')) {
                                                try {
                                                    await db.collection('resources').doc(resource.id).update({
                                                        assignedTo: firebase.firestore.FieldValue.arrayRemove(pirId)
                                                    });
                                                    await loadResourcesData();
                                                    alert('Resource unassigned successfully');
                                                } catch (error) {
                                                    console.error('Error unassigning resource:', error);
                                                    alert('Failed to unassign resource');
                                                }
                                            }
                                        }}
                                        style={{
                                            background: 'var(--danger-color)',
                                            color: 'var(--text-white)',
                                            border: 'none',
                                            padding: '4px 8px',
                                            borderRadius: 'var(--radius-sm)',
                                            cursor: 'pointer',
                                            fontSize: '10px',
                                            fontWeight: '600',
                                            transition: 'var(--transition-fast)'
                                        }}
                                    >
                                        Unassign
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            );
        })}

        {/* Assign Resource Modal */}
        {showAssignResource && (
            <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0,0,0,0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 10000
            }}>
                <div style={{
                    background: 'var(--text-white)',
                    padding: '30px',
                    borderRadius: 'var(--radius-lg)',
                    width: '600px',
                    maxWidth: '90%',
                    maxHeight: '80vh',
                    overflow: 'auto',
                    boxShadow: 'var(--shadow-lg)'
                }}>
                    <h3 style={{ 
                        marginBottom: '20px',
                        color: 'var(--text-primary)',
                        fontSize: '18px',
                        fontWeight: '600'
                    }}>
                        Assign Resource to {pirData?.firstName || 'PIR'}
                    </h3>
                    
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ 
                            display: 'block', 
                            marginBottom: '10px', 
                            color: 'var(--text-secondary)',
                            fontSize: '14px',
                            fontWeight: '500'
                        }}>
                            Select Resource to Assign:
                        </label>
                        <select 
                            id="resource-select"
                            style={{
                                width: '100%',
                                padding: '10px',
                                borderRadius: 'var(--radius-sm)',
                                border: '1px solid var(--border-color)',
                                fontSize: '14px',
                                color: 'var(--text-primary)'
                            }}
                        >
                            <option value="">Choose a resource...</option>
                            {resources.filter(r => !r.assignedTo?.includes(pirId)).map(resource => (
                                <option key={resource.id} value={resource.id}>
                                    {resource.title} ({resource.category})
                                </option>
                            ))}
                        </select>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                        <button
                            onClick={() => setShowAssignResource(false)}
                            style={{
                                padding: '10px 20px',
                                borderRadius: 'var(--radius-sm)',
                                border: '1px solid var(--border-color)',
                                background: 'var(--text-white)',
                                color: 'var(--text-primary)',
                                cursor: 'pointer',
                                fontSize: '14px',
                                fontWeight: '500',
                                transition: 'var(--transition-fast)'
                            }}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={async () => {
                                const select = document.getElementById('resource-select');
                                const resourceId = select.value;
                                if (resourceId) {
                                    try {
                                        await db.collection('resources').doc(resourceId).update({
                                            assignedTo: firebase.firestore.FieldValue.arrayUnion(pirId)
                                        });
                                        await loadResourcesData();
                                        setShowAssignResource(false);
                                        alert('Resource assigned successfully');
                                    } catch (error) {
                                        console.error('Error assigning resource:', error);
                                        alert('Failed to assign resource');
                                    }
                                } else {
                                    alert('Please select a resource');
                                }
                            }}
                            style={{
                                padding: '10px 20px',
                                borderRadius: 'var(--radius-sm)',
                                border: 'none',
                                background: 'var(--gradient-success)',
                                color: 'var(--text-white)',
                                cursor: 'pointer',
                                fontSize: '14px',
                                fontWeight: '500',
                                transition: 'var(--transition-fast)'
                            }}
                        >
                            Assign Resource
                        </button>
                    </div>
                </div>
            </div>
        )}

        {/* Create Resource Modal */}
        {showCreateResource && (
            <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0,0,0,0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 10000
            }}>
                <div style={{
                    background: 'var(--text-white)',
                    padding: '30px',
                    borderRadius: 'var(--radius-lg)',
                    width: '600px',
                    maxWidth: '90%',
                    boxShadow: 'var(--shadow-lg)'
                }}>
                    <h3 style={{ 
                        marginBottom: '20px',
                        color: 'var(--text-primary)',
                        fontSize: '18px',
                        fontWeight: '600'
                    }}>
                        Create New Resource
                    </h3>
                    
                    <form onSubmit={async (e) => {
                        e.preventDefault();
                        const form = e.target;
                        try {
                            await db.collection('resources').add({
                                title: form.title.value,
                                description: form.description.value,
                                category: form.category.value,
                                url: form.url.value || null,
                                assignedTo: [pirId],
                                createdBy: user.uid,
                                createdAt: firebase.firestore.FieldValue.serverTimestamp()
                            });
                            await loadResourcesData();
                            setShowCreateResource(false);
                            alert('Resource created and assigned successfully');
                        } catch (error) {
                            console.error('Error creating resource:', error);
                            alert('Failed to create resource');
                        }
                    }}>
                        <div style={{ marginBottom: '15px' }}>
                            <label style={{ 
                                display: 'block', 
                                marginBottom: '5px',
                                color: 'var(--text-secondary)',
                                fontSize: '14px',
                                fontWeight: '500'
                            }}>
                                Title *
                            </label>
                            <input
                                name="title"
                                type="text"
                                required
                                style={{
                                    width: '100%',
                                    padding: '8px',
                                    borderRadius: 'var(--radius-sm)',
                                    border: '1px solid var(--border-color)',
                                    fontSize: '14px',
                                    color: 'var(--text-primary)'
                                }}
                            />
                        </div>
                        
                        <div style={{ marginBottom: '15px' }}>
                            <label style={{ 
                                display: 'block', 
                                marginBottom: '5px',
                                color: 'var(--text-secondary)',
                                fontSize: '14px',
                                fontWeight: '500'
                            }}>
                                Description *
                            </label>
                            <textarea
                                name="description"
                                required
                                rows="3"
                                style={{
                                    width: '100%',
                                    padding: '8px',
                                    borderRadius: 'var(--radius-sm)',
                                    border: '1px solid var(--border-color)',
                                    fontSize: '14px',
                                    color: 'var(--text-primary)'
                                }}
                            />
                        </div>
                        
                        <div style={{ marginBottom: '15px' }}>
                            <label style={{ 
                                display: 'block', 
                                marginBottom: '5px',
                                color: 'var(--text-secondary)',
                                fontSize: '14px',
                                fontWeight: '500'
                            }}>
                                Category *
                            </label>
                            <select
                                name="category"
                                required
                                style={{
                                    width: '100%',
                                    padding: '8px',
                                    borderRadius: 'var(--radius-sm)',
                                    border: '1px solid var(--border-color)',
                                    fontSize: '14px',
                                    color: 'var(--text-primary)'
                                }}
                            >
                                <option value="">Select category...</option>
                                <option value="education">Education</option>
                                <option value="coping">Coping</option>
                                <option value="daily">Daily</option>
                                <option value="life">Life</option>
                                <option value="support">Support</option>
                                <option value="relapse">Relapse Prevention</option>
                            </select>
                        </div>
                        
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ 
                                display: 'block', 
                                marginBottom: '5px',
                                color: 'var(--text-secondary)',
                                fontSize: '14px',
                                fontWeight: '500'
                            }}>
                                URL (optional)
                            </label>
                            <input
                                name="url"
                                type="url"
                                placeholder="https://..."
                                style={{
                                    width: '100%',
                                    padding: '8px',
                                    borderRadius: 'var(--radius-sm)',
                                    border: '1px solid var(--border-color)',
                                    fontSize: '14px',
                                    color: 'var(--text-primary)'
                                }}
                            />
                        </div>
                        
                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                            <button
                                type="button"
                                onClick={() => setShowCreateResource(false)}
                                style={{
                                    padding: '10px 20px',
                                    borderRadius: 'var(--radius-sm)',
                                    border: '1px solid var(--border-color)',
                                    background: 'var(--text-white)',
                                    color: 'var(--text-primary)',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                    fontWeight: '500',
                                    transition: 'var(--transition-fast)'
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                style={{
                                    padding: '10px 20px',
                                    borderRadius: 'var(--radius-sm)',
                                    border: 'none',
                                    background: 'var(--gradient-secondary)',
                                    color: 'var(--text-white)',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                    fontWeight: '500',
                                    transition: 'var(--transition-fast)'
                                }}
                            >
                                Create Resource
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        )}
    </div>
);

const renderActivityTab = () => (
    <div style={{ padding: '20px' }}>
        <h3 style={{ 
            marginBottom: '20px', 
            color: 'var(--text-primary)',
            fontSize: '18px',
            fontWeight: '600'
        }}>
            Complete Activity Feed
        </h3>
        
        <div style={{
            background: 'var(--text-white)',
            borderRadius: 'var(--radius-lg)',
            padding: '20px',
            boxShadow: 'var(--shadow-sm)'
        }}>
            <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
                {activities.length > 0 ? (
                    activities.map(activity => (
                        <div key={activity.id} style={{
                            padding: '15px',
                            borderBottom: '1px solid var(--border-color)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '15px'
                        }}>
                            <div style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '50%',
                                background: getActivityColor(activity.type),
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '20px',
                                flexShrink: 0
                            }}>
                                {getActivityIcon(activity.type)}
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ 
                                    fontWeight: 'bold', 
                                    color: 'var(--text-primary)',
                                    fontSize: '14px'
                                }}>
                                    {activity.description || activity.type?.replace(/_/g, ' ').toUpperCase()}
                                </div>
                                <div style={{ 
                                    fontSize: '11px', 
                                    color: 'var(--text-muted)', 
                                    marginTop: '5px' 
                                }}>
                                    {formatTimeAgo(activity.createdAt)}
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <p style={{ 
                        color: 'var(--text-secondary)',
                        textAlign: 'center',
                        padding: '20px',
                        fontSize: '14px'
                    }}>
                        No activity recorded
                    </p>
                )}
            </div>
        </div>
    </div>
);

const renderFinancialTab = () => (
    <div style={{ padding: '20px' }}>
        <h3 style={{ 
            marginBottom: '20px', 
            color: 'var(--text-primary)',
            fontSize: '18px',
            fontWeight: '600'
        }}>
            Financial Impact
        </h3>
        
        <div style={{
            background: 'var(--gradient-primary)',
            borderRadius: 'var(--radius-lg)',
            padding: '30px',
            marginBottom: '20px',
            color: 'var(--text-white)',
            textAlign: 'center',
            boxShadow: 'var(--shadow-primary)'
        }}>
            <div style={{ fontSize: '48px', fontWeight: 'bold' }}>
                ${pirData?.moneySaved || 0}
            </div>
            <div style={{ fontSize: '18px', opacity: 0.9 }}>
                Total Saved in Recovery
            </div>
            <div style={{ fontSize: '14px', opacity: 0.8, marginTop: '10px' }}>
                Based on ${pirData?.dailyCost || 20}/day
            </div>
        </div>

        <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr', 
            gap: '20px' 
        }}>
            <div style={{
                background: 'var(--text-white)',
                borderRadius: 'var(--radius-lg)',
                padding: '20px',
                boxShadow: 'var(--shadow-sm)'
            }}>
                <h4 style={{ 
                    marginBottom: '15px', 
                    color: 'var(--text-primary)',
                    fontSize: '16px',
                    fontWeight: '600'
                }}>
                    Monthly Projection
                </h4>
                <div style={{ 
                    fontSize: '32px', 
                    fontWeight: 'bold', 
                    color: 'var(--success-color)' 
                }}>
                    ${(pirData?.dailyCost || 20) * 30}
                </div>
                <div style={{ 
                    fontSize: '12px', 
                    color: 'var(--text-secondary)' 
                }}>
                    Saved per month
                </div>
            </div>

            <div style={{
                background: 'var(--text-white)',
                borderRadius: 'var(--radius-lg)',
                padding: '20px',
                boxShadow: 'var(--shadow-sm)'
            }}>
                <h4 style={{ 
                    marginBottom: '15px', 
                    color: 'var(--text-primary)',
                    fontSize: '16px',
                    fontWeight: '600'
                }}>
                    Yearly Projection
                </h4>
                <div style={{ 
                    fontSize: '32px', 
                    fontWeight: 'bold', 
                    color: 'var(--info-color)' 
                }}>
                    ${(pirData?.dailyCost || 20) * 365}
                </div>
                <div style={{ 
                    fontSize: '12px', 
                    color: 'var(--text-secondary)' 
                }}>
                    Saved per year
                </div>
            </div>
        </div>
    </div>
);

const renderCommunityTab = () => (
    <div style={{ padding: '20px' }}>
        <h3 style={{ 
            marginBottom: '30px', 
            color: 'var(--text-primary)',
            fontSize: '18px',
            fontWeight: '600'
        }}>
            Community Engagement
        </h3>
        
        {/* Community Stats Overview */}
        <div style={{
            background: 'var(--gradient-primary)',
            borderRadius: 'var(--radius-lg)',
            padding: '20px',
            marginBottom: '30px',
            color: 'var(--text-white)',
            boxShadow: 'var(--shadow-primary)'
        }}>
            <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
                gap: '20px' 
            }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '32px', fontWeight: 'bold' }}>
                        {meetings.filter(m => m.status === 'scheduled').length}
                    </div>
                    <div style={{ fontSize: '12px', opacity: 0.9 }}>Upcoming Meetings</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '32px', fontWeight: 'bold' }}>
                        {topicRooms.filter(room => 
                            room.members?.includes(pirId) || room.activeParticipants?.includes(pirId)
                        ).length}
                    </div>
                    <div style={{ fontSize: '12px', opacity: 0.9 }}>Topic Rooms</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '32px', fontWeight: 'bold' }}>
                        {supportGroups.filter(group => 
                            group.members?.includes(pirId) || group.participants?.includes(pirId)
                        ).length}
                    </div>
                    <div style={{ fontSize: '12px', opacity: 0.9 }}>Support Groups</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '32px', fontWeight: 'bold' }}>
                        {allMessages.filter(m => m.type === 'community').length}
                    </div>
                    <div style={{ fontSize: '12px', opacity: 0.9 }}>Community Posts</div>
                </div>
            </div>
        </div>

        {/* Scheduled Meetings Section */}
        <div style={{
            background: 'var(--text-white)',
            borderRadius: 'var(--radius-lg)',
            padding: '20px',
            marginBottom: '20px',
            boxShadow: 'var(--shadow-sm)'
        }}>
            <h4 style={{ 
                marginBottom: '20px', 
                color: 'var(--text-primary)',
                fontSize: '16px',
                fontWeight: '600'
            }}>
                📅 Scheduled Meetings
            </h4>
            {meetings && meetings.filter(m => 
                (m.pirId === pirId || m.pirIds?.includes(pirId) || m.isGlobal) && 
                m.status === 'scheduled'
            ).length > 0 ? (
                <div style={{ display: 'grid', gap: '15px' }}>
                    {meetings.filter(m => 
                        (m.pirId === pirId || m.pirIds?.includes(pirId) || m.isGlobal) && 
                        m.status === 'scheduled'
                    ).map(meeting => (
                        <div key={meeting.id} style={{
                            padding: '15px',
                            background: 'var(--background-secondary)',
                            borderRadius: 'var(--radius-md)',
                            borderLeft: '4px solid var(--info-color)'
                        }}>
                            <div style={{ 
                                display: 'flex', 
                                justifyContent: 'space-between', 
                                alignItems: 'center' 
                            }}>
                                <div>
                                    <h5 style={{ 
                                        margin: '0 0 10px 0', 
                                        color: 'var(--text-primary)',
                                        fontSize: '15px',
                                        fontWeight: '600'
                                    }}>
                                        {meeting.meetingTitle || meeting.title || 'Recovery Session'}
                                    </h5>
                                    <div style={{ 
                                        display: 'flex', 
                                        gap: '15px', 
                                        fontSize: '13px', 
                                        color: 'var(--text-secondary)' 
                                    }}>
                                        <span>📅 {formatDate(meeting.scheduledTime)}</span>
                                        <span>🕐 {new Date(meeting.scheduledTime?.toDate ? 
                                            meeting.scheduledTime.toDate() : 
                                            meeting.scheduledTime).toLocaleTimeString('en-US', {
                                                hour: 'numeric',
                                                minute: '2-digit',
                                                hour12: true
                                            })}</span>
                                        <span>📝 {meeting.type || 'Group Session'}</span>
                                    </div>
                                    {meeting.notes && (
                                        <p style={{ 
                                            margin: '10px 0 0 0', 
                                            fontSize: '12px', 
                                            color: 'var(--text-secondary)' 
                                        }}>
                                            {meeting.notes}
                                        </p>
                                    )}
                                </div>
                                <div style={{ 
                                    display: 'flex', 
                                    flexDirection: 'column', 
                                    gap: '5px' 
                                }}>
                                    {meeting.isGlobal && (
                                        <span style={{
                                            background: 'var(--success-color)',
                                            color: 'var(--text-white)',
                                            padding: '4px 8px',
                                            borderRadius: '12px',
                                            fontSize: '10px',
                                            textAlign: 'center',
                                            fontWeight: 'bold'
                                        }}>
                                            ALL PIRS
                                        </span>
                                    )}
                                    {meeting.meetingLink && (
                                        <a 
                                            href={meeting.meetingLink} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            style={{
                                                background: 'var(--info-color)',
                                                color: 'var(--text-white)',
                                                padding: '6px 12px',
                                                borderRadius: 'var(--radius-sm)',
                                                textDecoration: 'none',
                                                fontSize: '12px',
                                                textAlign: 'center',
                                                fontWeight: '500'
                                            }}
                                        >
                                            Join Meeting
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <p style={{ 
                    color: 'var(--text-secondary)', 
                    textAlign: 'center', 
                    padding: '20px',
                    fontSize: '14px'
                }}>
                    No upcoming meetings scheduled
                </p>
            )}
        </div>

        {/* Topic Rooms Section */}
        <div style={{
            background: 'var(--text-white)',
            borderRadius: 'var(--radius-lg)',
            padding: '20px',
            marginBottom: '20px',
            boxShadow: 'var(--shadow-sm)'
        }}>
            <h4 style={{ 
                marginBottom: '20px', 
                color: 'var(--text-primary)',
                fontSize: '16px',
                fontWeight: '600'
            }}>
                💬 Topic Rooms
            </h4>
            {topicRooms && topicRooms.length > 0 ? (
                <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
                    gap: '15px' 
                }}>
                    {topicRooms.map(room => {
                        const isMember = room.members?.includes(pirId) || 
                                        room.activeParticipants?.includes(pirId);
                        return (
                            <div key={room.id} style={{
                                padding: '15px',
                                background: isMember ? 'rgba(33, 150, 243, 0.1)' : 'var(--background-secondary)',
                                borderRadius: 'var(--radius-md)',
                                border: isMember ? '2px solid var(--info-color)' : '1px solid var(--border-color)',
                                position: 'relative'
                            }}>
                                {isMember && (
                                    <span style={{
                                        position: 'absolute',
                                        top: '10px',
                                        right: '10px',
                                        background: 'var(--success-color)',
                                        color: 'var(--text-white)',
                                        padding: '2px 6px',
                                        borderRadius: '10px',
                                        fontSize: '10px',
                                        fontWeight: 'bold'
                                    }}>
                                        MEMBER
                                    </span>
                                )}
                                <h5 style={{ 
                                    margin: '0 0 10px 0', 
                                    color: 'var(--text-primary)',
                                    fontSize: '15px',
                                    fontWeight: '600'
                                }}>
                                    {room.name}
                                </h5>
                                <p style={{ 
                                    fontSize: '12px', 
                                    color: 'var(--text-secondary)', 
                                    margin: '0 0 10px 0' 
                                }}>
                                    {room.description}
                                </p>
                                <div style={{ 
                                    fontSize: '11px', 
                                    color: 'var(--text-muted)' 
                                }}>
                                    👥 {room.members?.length || 0} members
                                    {room.lastActivity && (
                                        <span style={{ marginLeft: '10px' }}>
                                            Last active: {formatTimeAgo(room.lastActivity)}
                                        </span>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <p style={{ 
                    color: 'var(--text-secondary)', 
                    textAlign: 'center', 
                    padding: '20px',
                    fontSize: '14px'
                }}>
                    No topic rooms available
                </p>
            )}
        </div>

        {/* Support Groups Section */}
        <div style={{
            background: 'var(--text-white)',
            borderRadius: 'var(--radius-lg)',
            padding: '20px',
            marginBottom: '20px',
            boxShadow: 'var(--shadow-sm)'
        }}>
            <h4 style={{ 
                marginBottom: '20px', 
                color: 'var(--text-primary)',
                fontSize: '16px',
                fontWeight: '600'
            }}>
                🤝 Support Groups
            </h4>
            {supportGroups && supportGroups.length > 0 ? (
                <div style={{ display: 'grid', gap: '15px' }}>
                    {supportGroups.map(group => {
                        const isMember = group.members?.includes(pirId) || 
                                        group.participants?.includes(pirId);
                        return (
                            <div key={group.id} style={{
                                padding: '20px',
                                background: isMember ? 'rgba(156, 39, 176, 0.05)' : 'var(--background-secondary)',
                                borderRadius: 'var(--radius-md)',
                                borderLeft: `4px solid ${isMember ? 'var(--secondary-color)' : 'var(--border-color)'}`
                            }}>
                                <div style={{ 
                                    display: 'flex', 
                                    justifyContent: 'space-between', 
                                    alignItems: 'start' 
                                }}>
                                    <div style={{ flex: 1 }}>
                                        <h5 style={{ 
                                            margin: '0 0 10px 0', 
                                            color: 'var(--text-primary)',
                                            fontSize: '15px',
                                            fontWeight: '600'
                                        }}>
                                            {group.name}
                                        </h5>
                                        <p style={{ 
                                            fontSize: '13px', 
                                            color: 'var(--text-secondary)', 
                                            margin: '0 0 10px 0' 
                                        }}>
                                            {group.description}
                                        </p>
                                        {group.meetingSchedule && (
                                            <div style={{ 
                                                fontSize: '12px', 
                                                color: 'var(--text-secondary)' 
                                            }}>
                                                📅 Meets: {group.meetingSchedule}
                                            </div>
                                        )}
                                        <div style={{ 
                                            fontSize: '11px', 
                                            color: 'var(--text-muted)', 
                                            marginTop: '10px' 
                                        }}>
                                            👥 {group.members?.length || 0} members
                                            {group.facilitator && (
                                                <span style={{ marginLeft: '15px' }}>
                                                    Facilitated by: {group.facilitator}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    {isMember && (
                                        <span style={{
                                            background: 'var(--secondary-color)',
                                            color: 'var(--text-white)',
                                            padding: '4px 12px',
                                            borderRadius: '12px',
                                            fontSize: '11px',
                                            fontWeight: 'bold'
                                        }}>
                                            ENROLLED
                                        </span>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <p style={{ 
                    color: 'var(--text-secondary)', 
                    textAlign: 'center', 
                    padding: '20px',
                    fontSize: '14px'
                }}>
                    No support groups available
                </p>
            )}
        </div>

        {/* Recent Community Activity */}
        <div style={{
            background: 'var(--text-white)',
            borderRadius: 'var(--radius-lg)',
            padding: '20px',
            boxShadow: 'var(--shadow-sm)'
        }}>
            <h4 style={{ 
                marginBottom: '20px', 
                color: 'var(--text-primary)',
                fontSize: '16px',
                fontWeight: '600'
            }}>
                🌐 Recent Community Activity
            </h4>
            {allMessages.filter(m => m.type === 'community' || m.type === 'topic').length > 0 ? (
                <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                    {allMessages
                        .filter(m => m.type === 'community' || m.type === 'topic')
                        .slice(0, 10)
                        .map(message => (
                        <div key={message.id} style={{
                            padding: '10px',
                            borderBottom: '1px solid var(--border-color)',
                            fontSize: '13px'
                        }}>
                            <div style={{ 
                                display: 'flex', 
                                gap: '10px', 
                                marginBottom: '5px' 
                            }}>
                                <span style={{
                                    background: message.type === 'community' ? 'var(--success-color)' : 'var(--warning-color)',
                                    color: 'var(--text-white)',
                                    padding: '2px 6px',
                                    borderRadius: '8px',
                                    fontSize: '10px',
                                    fontWeight: 'bold'
                                }}>
                                    {message.type === 'community' ? 'COMMUNITY' : 'TOPIC'}
                                </span>
                                <span style={{ 
                                    color: 'var(--text-muted)', 
                                    fontSize: '11px' 
                                }}>
                                    {formatTimeAgo(message.createdAt)}
                                </span>
                            </div>
                            <div style={{ color: 'var(--text-primary)' }}>
                                {message.content || message.text || 'Posted a message'}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <p style={{ 
                    color: 'var(--text-secondary)', 
                    textAlign: 'center', 
                    padding: '20px',
                    fontSize: '14px'
                }}>
                    No recent community activity
                </p>
            )}
        </div>
    </div>
);
    // ========== MAIN MODAL RENDER ==========
    if (loading) {
        return (
            <div style={{
                position: 'fixed',
                top: 0, left: 0, right: 0, bottom: 0,
                background: 'rgba(0,0,0,0.7)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 10000
            }}>
                <div style={{
                    background: 'var(--text-white)',
                    padding: '40px',
                    borderRadius: 'var(--radius-lg)',
                    textAlign: 'center'
                }}>
                    <div style={{ fontSize: '24px', marginBottom: '20px' }}>⏳</div>
                    <div style={{ color: 'var(--text-primary)' }}>Loading PIR data...</div>
                </div>
            </div>
        );
    }

    if (!pirData) return null;
   return (
    <div className="modal-overlay" style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(5px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        animation: 'fadeIn 0.3s ease-in-out'
    }}>
        <div className="modal-content" style={{
            maxWidth: '1200px',
            width: '95%',
            maxHeight: '90vh',
            background: 'var(--text-white)',
            borderRadius: 'var(--radius-xl)',
            boxShadow: 'var(--shadow-xl)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            animation: 'slideUp 0.3s ease-out'
        }}>
            {/* MODAL HEADER */}
            <div className="modal-header" style={{
                background: 'var(--gradient-primary)',
                padding: '25px 30px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: '1px solid rgba(255,255,255,0.1)'
            }}>
                <h3 style={{
                    margin: 0,
                    color: 'var(--text-white)',
                    fontSize: '24px',
                    fontWeight: '600',
                    letterSpacing: '-0.5px'
                }}>
                    {pirData?.firstName} {pirData?.lastName} - PIR Details
                </h3>
                <button 
                    className="close-btn" 
                    onClick={onClose}
                    style={{
                        background: 'rgba(255,255,255,0.2)',
                        border: 'none',
                        color: 'var(--text-white)',
                        fontSize: '28px',
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'var(--transition-fast)',
                        fontWeight: '300'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(255,255,255,0.3)';
                        e.currentTarget.style.transform = 'rotate(90deg)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(255,255,255,0.2)';
                        e.currentTarget.style.transform = 'rotate(0deg)';
                    }}
                >
                    ×
                </button>
            </div>
            
            {loading ? (
                <div className="loading-container" style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '400px',
                    gap: '20px'
                }}>
                    <div className="loading-spinner" style={{
                        width: '60px',
                        height: '60px',
                        border: '4px solid var(--background-secondary)',
                        borderTop: '4px solid var(--primary-color)',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite'
                    }}></div>
                    <p style={{
                        color: 'var(--text-secondary)',
                        fontSize: '16px',
                        margin: 0
                    }}>
                        Loading PIR data...
                    </p>
                </div>
            ) : (
                <>
{/* TAB NAVIGATION */}
<div className="tab-nav" style={{
    display: 'flex',
    gap: '8px',
    padding: '20px 25px 0 25px',
    background: 'var(--background-secondary)',
    borderBottom: '2px solid var(--border-color)',
    overflowX: 'auto',
    position: 'sticky',
    top: 0,
    zIndex: 10
}}>
    <button 
        className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
        onClick={() => setActiveTab('overview')}
        style={{
            padding: '12px 20px',
            border: 'none',
            background: activeTab === 'overview' ? 'var(--gradient-primary)' : 'transparent',
            color: activeTab === 'overview' ? 'var(--text-white)' : 'var(--text-secondary)',
            borderRadius: 'var(--radius-md) var(--radius-md) 0 0',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: activeTab === 'overview' ? '600' : '500',
            transition: 'var(--transition-fast)',
            whiteSpace: 'nowrap',
            boxShadow: activeTab === 'overview' ? 'var(--shadow-sm)' : 'none'
        }}
        onMouseEnter={(e) => {
            if (activeTab !== 'overview') {
                e.currentTarget.style.background = 'var(--background-primary)';
                e.currentTarget.style.color = 'var(--text-primary)';
            }
        }}
        onMouseLeave={(e) => {
            if (activeTab !== 'overview') {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = 'var(--text-secondary)';
            }
        }}
    >
        📊 Overview
    </button>
    <button 
        className={`tab-btn ${activeTab === 'progress' ? 'active' : ''}`}
        onClick={() => setActiveTab('progress')}
        style={{
            padding: '12px 20px',
            border: 'none',
            background: activeTab === 'progress' ? 'var(--gradient-primary)' : 'transparent',
            color: activeTab === 'progress' ? 'var(--text-white)' : 'var(--text-secondary)',
            borderRadius: 'var(--radius-md) var(--radius-md) 0 0',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: activeTab === 'progress' ? '600' : '500',
            transition: 'var(--transition-fast)',
            whiteSpace: 'nowrap',
            boxShadow: activeTab === 'progress' ? 'var(--shadow-sm)' : 'none'
        }}
        onMouseEnter={(e) => {
            if (activeTab !== 'progress') {
                e.currentTarget.style.background = 'var(--background-primary)';
                e.currentTarget.style.color = 'var(--text-primary)';
            }
        }}
        onMouseLeave={(e) => {
            if (activeTab !== 'progress') {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = 'var(--text-secondary)';
            }
        }}
    >
        📈 Progress
    </button>
    <button 
        className={`tab-btn ${activeTab === 'goldenthread' ? 'active' : ''}`}
        onClick={() => setActiveTab('goldenthread')}
        style={{
            padding: '12px 20px',
            border: 'none',
            background: activeTab === 'goldenthread' ? 'var(--gradient-primary)' : 'transparent',
            color: activeTab === 'goldenthread' ? 'var(--text-white)' : 'var(--text-secondary)',
            borderRadius: 'var(--radius-md) var(--radius-md) 0 0',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: activeTab === 'goldenthread' ? '600' : '500',
            transition: 'var(--transition-fast)',
            whiteSpace: 'nowrap',
            boxShadow: activeTab === 'goldenthread' ? 'var(--shadow-sm)' : 'none'
        }}
        onMouseEnter={(e) => {
            if (activeTab !== 'goldenthread') {
                e.currentTarget.style.background = 'var(--background-primary)';
                e.currentTarget.style.color = 'var(--text-primary)';
            }
        }}
        onMouseLeave={(e) => {
            if (activeTab !== 'goldenthread') {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = 'var(--text-secondary)';
            }
        }}
    >
        🧵 Golden Thread
    </button>
    <button 
        className={`tab-btn ${activeTab === 'milestones' ? 'active' : ''}`}
        onClick={() => setActiveTab('milestones')}
        style={{
            padding: '12px 20px',
            border: 'none',
            background: activeTab === 'milestones' ? 'var(--gradient-primary)' : 'transparent',
            color: activeTab === 'milestones' ? 'var(--text-white)' : 'var(--text-secondary)',
            borderRadius: 'var(--radius-md) var(--radius-md) 0 0',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: activeTab === 'milestones' ? '600' : '500',
            transition: 'var(--transition-fast)',
            whiteSpace: 'nowrap',
            boxShadow: activeTab === 'milestones' ? 'var(--shadow-sm)' : 'none'
        }}
        onMouseEnter={(e) => {
            if (activeTab !== 'milestones') {
                e.currentTarget.style.background = 'var(--background-primary)';
                e.currentTarget.style.color = 'var(--text-primary)';
            }
        }}
        onMouseLeave={(e) => {
            if (activeTab !== 'milestones') {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = 'var(--text-secondary)';
            }
        }}
    >
        🏆 Milestones
    </button>
    <button 
        className={`tab-btn ${activeTab === 'resources' ? 'active' : ''}`}
        onClick={() => setActiveTab('resources')}
        style={{
            padding: '12px 20px',
            border: 'none',
            background: activeTab === 'resources' ? 'var(--gradient-primary)' : 'transparent',
            color: activeTab === 'resources' ? 'var(--text-white)' : 'var(--text-secondary)',
            borderRadius: 'var(--radius-md) var(--radius-md) 0 0',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: activeTab === 'resources' ? '600' : '500',
            transition: 'var(--transition-fast)',
            whiteSpace: 'nowrap',
            boxShadow: activeTab === 'resources' ? 'var(--shadow-sm)' : 'none'
        }}
        onMouseEnter={(e) => {
            if (activeTab !== 'resources') {
                e.currentTarget.style.background = 'var(--background-primary)';
                e.currentTarget.style.color = 'var(--text-primary)';
            }
        }}
        onMouseLeave={(e) => {
            if (activeTab !== 'resources') {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = 'var(--text-secondary)';
            }
        }}
    >
        📚 Resources
    </button>
    <button 
        className={`tab-btn ${activeTab === 'communications' ? 'active' : ''}`}
        onClick={() => setActiveTab('communications')}
        style={{
            padding: '12px 20px',
            border: 'none',
            background: activeTab === 'communications' ? 'var(--gradient-primary)' : 'transparent',
            color: activeTab === 'communications' ? 'var(--text-white)' : 'var(--text-secondary)',
            borderRadius: 'var(--radius-md) var(--radius-md) 0 0',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: activeTab === 'communications' ? '600' : '500',
            transition: 'var(--transition-fast)',
            whiteSpace: 'nowrap',
            boxShadow: activeTab === 'communications' ? 'var(--shadow-sm)' : 'none'
        }}
        onMouseEnter={(e) => {
            if (activeTab !== 'communications') {
                e.currentTarget.style.background = 'var(--background-primary)';
                e.currentTarget.style.color = 'var(--text-primary)';
            }
        }}
        onMouseLeave={(e) => {
            if (activeTab !== 'communications') {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = 'var(--text-secondary)';
            }
        }}
    >
        💬 Communications
    </button>
    <button 
        className={`tab-btn ${activeTab === 'activity' ? 'active' : ''}`}
        onClick={() => setActiveTab('activity')}
        style={{
            padding: '12px 20px',
            border: 'none',
            background: activeTab === 'activity' ? 'var(--gradient-primary)' : 'transparent',
            color: activeTab === 'activity' ? 'var(--text-white)' : 'var(--text-secondary)',
            borderRadius: 'var(--radius-md) var(--radius-md) 0 0',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: activeTab === 'activity' ? '600' : '500',
            transition: 'var(--transition-fast)',
            whiteSpace: 'nowrap',
            boxShadow: activeTab === 'activity' ? 'var(--shadow-sm)' : 'none'
        }}
        onMouseEnter={(e) => {
            if (activeTab !== 'activity') {
                e.currentTarget.style.background = 'var(--background-primary)';
                e.currentTarget.style.color = 'var(--text-primary)';
            }
        }}
        onMouseLeave={(e) => {
            if (activeTab !== 'activity') {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = 'var(--text-secondary)';
            }
        }}
    >
        📋 Activity
    </button>
    <button 
        className={`tab-btn ${activeTab === 'financial' ? 'active' : ''}`}
        onClick={() => setActiveTab('financial')}
        style={{
            padding: '12px 20px',
            border: 'none',
            background: activeTab === 'financial' ? 'var(--gradient-primary)' : 'transparent',
            color: activeTab === 'financial' ? 'var(--text-white)' : 'var(--text-secondary)',
            borderRadius: 'var(--radius-md) var(--radius-md) 0 0',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: activeTab === 'financial' ? '600' : '500',
            transition: 'var(--transition-fast)',
            whiteSpace: 'nowrap',
            boxShadow: activeTab === 'financial' ? 'var(--shadow-sm)' : 'none'
        }}
        onMouseEnter={(e) => {
            if (activeTab !== 'financial') {
                e.currentTarget.style.background = 'var(--background-primary)';
                e.currentTarget.style.color = 'var(--text-primary)';
            }
        }}
        onMouseLeave={(e) => {
            if (activeTab !== 'financial') {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = 'var(--text-secondary)';
            }
        }}
    >
        💰 Financial
    </button>
    <button 
        className={`tab-btn ${activeTab === 'community' ? 'active' : ''}`}
        onClick={() => setActiveTab('community')}
        style={{
            padding: '12px 20px',
            border: 'none',
            background: activeTab === 'community' ? 'var(--gradient-primary)' : 'transparent',
            color: activeTab === 'community' ? 'var(--text-white)' : 'var(--text-secondary)',
            borderRadius: 'var(--radius-md) var(--radius-md) 0 0',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: activeTab === 'community' ? '600' : '500',
            transition: 'var(--transition-fast)',
            whiteSpace: 'nowrap',
            boxShadow: activeTab === 'community' ? 'var(--shadow-sm)' : 'none'
        }}
        onMouseEnter={(e) => {
            if (activeTab !== 'community') {
                e.currentTarget.style.background = 'var(--background-primary)';
                e.currentTarget.style.color = 'var(--text-primary)';
            }
        }}
        onMouseLeave={(e) => {
            if (activeTab !== 'community') {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = 'var(--text-secondary)';
            }
        }}
    >
        🌐 Community
    </button>
</div>

{/* TAB CONTENT - FIXED: Added position and zIndex */}
<div className="tab-content" style={{
    flex: 1,
    overflowY: 'auto',
    background: 'var(--background-secondary)',
    transition: 'opacity 0.3s ease-in-out',
    position: 'relative',
    zIndex: 1
}}>
    {activeTab === 'overview' && renderOverviewTab()}
    {activeTab === 'progress' && renderProgressTab()}
    {activeTab === 'goldenthread' && renderGoldenThreadTab()}
    {activeTab === 'milestones' && renderMilestonesTab()}
    {activeTab === 'resources' && renderResourcesTab()}
    {activeTab === 'communications' && renderCommunicationsTab()}
    {activeTab === 'activity' && renderActivityTab()}
    {activeTab === 'financial' && renderFinancialTab()}
    {activeTab === 'community' && renderCommunityTab()}
</div>
                </>
            )}
        </div>
    </div>
);
}; // This closes the UserDetailModal function
    
     // ========== COACH DETAIL MODAL - COMPLETE WITH TRAINING & CREDENTIALS ==========
