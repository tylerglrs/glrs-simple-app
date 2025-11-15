// ============================================================
// GLRS LIGHTHOUSE - APP CONTEXT
// ============================================================
// Centralized State Management for PIR App
// Created: Phase 8 - Context API Migration
// Purpose: Move all useState/useRef from PIRapp.js to centralized context
// Enables: Phase 7 JSX extraction (tabs can consume context independently)
// ============================================================

const {
  createContext,
  useContext,
  useState,
  useRef
} = React;

// ============================================================
// CREATE CONTEXT
// ============================================================

const AppContext = createContext(null);

// ============================================================
// CUSTOM HOOK FOR CONSUMING CONTEXT
// ============================================================

const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
};

// ============================================================
// PROVIDER COMPONENT
// ============================================================

const AppProvider = ({
  children,
  user
}) => {
  // ═══════════════════════════════════════════════════════════
  // STATE DECLARATIONS - Moved from PIRapp.js
  // ═══════════════════════════════════════════════════════════

  // ────────────────────────────────────────────────────────────
  // BATCH 1: USER DATA & CORE UI STATES (26 states, Lines 4-33)
  // ────────────────────────────────────────────────────────────

  // Core UI States
  const [currentView, setCurrentView] = useState('home');
  const [journeyTab, setJourneyTab] = useState('life'); // Journey sub-tab: life, finances, wellness
  const [dailyQuotes, setDailyQuotes] = useState([]); // Dynamic quotes from Firestore
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [loading, setLoading] = useState(true);

  // User Data States
  const [userData, setUserData] = useState(null);
  const [profileImage, setProfileImage] = useState(null);
  const [coachInfo, setCoachInfo] = useState(null);

  // Home Section States
  const [sobrietyDays, setSobrietyDays] = useState(0);
  const [selectedMood, setSelectedMood] = useState(null);
  const [pledgeMade, setPledgeMade] = useState(false);
  const [moneySaved, setMoneySaved] = useState(0);
  const [dailyQuote, setDailyQuote] = useState(null);
  const [milestones, setMilestones] = useState([]);
  const [nextMilestone, setNextMilestone] = useState(null);
  const [activeBroadcast, setActiveBroadcast] = useState(null);
  const [broadcastDismissed, setBroadcastDismissed] = useState(false);
  const [checkInStatus, setCheckInStatus] = useState({
    morning: false,
    evening: false
  });
  const [checkInStreak, setCheckInStreak] = useState(0);
  const [streakCheckIns, setStreakCheckIns] = useState([]);
  const [complianceRate, setComplianceRate] = useState({
    checkIn: 0,
    assignment: 0
  });
  const [totalCheckIns, setTotalCheckIns] = useState(0);
  const [googleConnected, setGoogleConnected] = useState(false);
  const [googleToken, setGoogleToken] = useState(null);
  const [googleTokenExpiry, setGoogleTokenExpiry] = useState(null);
  const [syncingGoogle, setSyncingGoogle] = useState(false);

  // ────────────────────────────────────────────────────────────
  // BATCH 2: PROGRESS & CHART STATES (5 states, Lines 70-78)
  // ────────────────────────────────────────────────────────────

  const [checkIns, setCheckIns] = useState([]);
  const [moodChartData, setMoodChartData] = useState(null);
  const [cravingChartData, setCravingChartData] = useState(null);
  const [anxietyChartData, setAnxietyChartData] = useState(null);
  const [sleepChartData, setSleepChartData] = useState(null);

  // ────────────────────────────────────────────────────────────
  // BATCH 3: JOURNEY TAB STATES (27 states, Lines 87-127)
  // ────────────────────────────────────────────────────────────

  // Journey Tab - Life Card States
  const [lifeCardIndex, setLifeCardIndex] = useState(0);
  const [lifeIsDragging, setLifeIsDragging] = useState(false);
  const [lifeTouchStart, setLifeTouchStart] = useState(0);
  const [lifeTouchEnd, setLifeTouchEnd] = useState(0);

  // Journey Tab - Finances Card States
  const [financesCardIndex, setFinancesCardIndex] = useState(0);
  const [financesIsDragging, setFinancesIsDragging] = useState(false);
  const [financesTouchStart, setFinancesTouchStart] = useState(0);
  const [financesTouchEnd, setFinancesTouchEnd] = useState(0);

  // Journey Tab - Finances Feature States
  const [savingsCarouselIndex, setSavingsCarouselIndex] = useState(0);
  const [activeSavingsGoal, setActiveSavingsGoal] = useState(null); // {name, amount, icon}
  const [actualMoneySaved, setActualMoneySaved] = useState(0);
  const [customGoalItems, setCustomGoalItems] = useState([]);
  const [tempAmount, setTempAmount] = useState('');
  const [savingsCarouselTouchStart, setSavingsCarouselTouchStart] = useState(0);

  // Finances - Firestore data (NO HARDCODED DATA)
  const [savingsItems, setSavingsItems] = useState([]); // Loaded from Firestore
  const [savingsGoals, setSavingsGoals] = useState([]); // Loaded from Firestore
  const [moneyMapStops, setMoneyMapStops] = useState([]); // Loaded from Firestore

  // Journey Tab - Wellness Card States
  const [wellnessCardIndex, setWellnessCardIndex] = useState(0);
  const [wellnessIsDragging, setWellnessIsDragging] = useState(false);
  const [wellnessTouchStart, setWellnessTouchStart] = useState(0);
  const [wellnessTouchEnd, setWellnessTouchEnd] = useState(0);

  // Journey Tab - Accordion Graph States
  const [expandedGraph, setExpandedGraph] = useState('mood'); // Which graph is expanded: mood, cravings, anxiety, sleep, overall
  const [missedMoodCheckIns, setMissedMoodCheckIns] = useState(0);
  const [missedCravingCheckIns, setMissedCravingCheckIns] = useState(0);
  const [missedAnxietyCheckIns, setMissedAnxietyCheckIns] = useState(0);
  const [missedSleepCheckIns, setMissedSleepCheckIns] = useState(0);
  const [missedOverallCheckIns, setMissedOverallCheckIns] = useState(0);

  // ────────────────────────────────────────────────────────────
  // BATCH 4: TASKS TAB STATES (68 states, Lines 148-269)
  // ────────────────────────────────────────────────────────────

  // Core Tasks States
  const [goals, setGoals] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [showSidebar, setShowSidebar] = useState(false);
  const [dueToday, setDueToday] = useState(0);

  // Modal Visibility States
  const [showIncompleteTasksModal, setShowIncompleteTasksModal] = useState(false);
  const [showHabitTrackerModal, setShowHabitTrackerModal] = useState(false);
  const [showQuickReflectionModal, setShowQuickReflectionModal] = useState(false);
  const [showThisWeekTasksModal, setShowThisWeekTasksModal] = useState(false);
  const [showOverdueItemsModal, setShowOverdueItemsModal] = useState(false);
  const [showMarkCompleteModal, setShowMarkCompleteModal] = useState(false);
  const [showProgressStatsModal, setShowProgressStatsModal] = useState(false);
  const [showGoalProgressModal, setShowGoalProgressModal] = useState(false);
  const [showTodayWinsModal, setShowTodayWinsModal] = useState(false);
  const [showCopingTechniqueModal, setShowCopingTechniqueModal] = useState(false);
  const [showGratitudeModal, setShowGratitudeModal] = useState(false);
  const [showGratitudeThemesModal, setShowGratitudeThemesModal] = useState(false);
  const [showJourneyCalendarModal, setShowJourneyCalendarModal] = useState(false);
  const [showMilestoneModal, setShowMilestoneModal] = useState(false);
  const [showPastReflectionsModal, setShowPastReflectionsModal] = useState(false);
  const [showReflectionStreakModal, setShowReflectionStreakModal] = useState(false);
  const [showReflectionStreaksModal, setShowReflectionStreaksModal] = useState(false);
  const [showStreakModal, setShowStreakModal] = useState(false);
  const [showStreaksModal, setShowStreaksModal] = useState(false);
  const [showWeeklyReportModal, setShowWeeklyReportModal] = useState(false);
  const [showIntentionsModal, setShowIntentionsModal] = useState(false);
  const [showProgressSnapshotModal, setShowProgressSnapshotModal] = useState(false);
  const [showPastIntentionsModal, setShowPastIntentionsModal] = useState(false);
  const [showGraphSettingsModal, setShowGraphSettingsModal] = useState(false);
  const [showCalendarHeatmapModal, setShowCalendarHeatmapModal] = useState(false);
  const [showMoodInsightsModal, setShowMoodInsightsModal] = useState(false);
  const [showOverallDayInsightsModal, setShowOverallDayInsightsModal] = useState(false);
  const [showGratitudeJournalModal, setShowGratitudeJournalModal] = useState(false);
  const [showChallengesHistoryModal, setShowChallengesHistoryModal] = useState(false);
  const [showChallengeCheckInModal, setShowChallengeCheckInModal] = useState(false);
  const [showBreakthroughModal, setShowBreakthroughModal] = useState(false);
  const [showTomorrowGoalsModal, setShowTomorrowGoalsModal] = useState(false);
  const [showMoodPatternModal, setShowMoodPatternModal] = useState(false);
  const [showCravingPatternModal, setShowCravingPatternModal] = useState(false);
  const [showAnxietyPatternModal, setShowAnxietyPatternModal] = useState(false);
  const [showSleepPatternModal, setShowSleepPatternModal] = useState(false);
  const [showTipsModal, setShowTipsModal] = useState(false);

  // Data States for Modals
  const [habits, setHabits] = useState([]);
  const [todayHabits, setTodayHabits] = useState([]);
  const [quickReflections, setQuickReflections] = useState([]);
  const [todayWins, setTodayWins] = useState([]);
  const [newHabitName, setNewHabitName] = useState('');
  const [newReflection, setNewReflection] = useState('');
  const [newWin, setNewWin] = useState('');
  const [showHabitHistory, setShowHabitHistory] = useState(false);
  const [showReflectionHistory, setShowReflectionHistory] = useState(false);
  const [showWinsHistory, setShowWinsHistory] = useState(false);

  // Active Task Tab and Check-In Data
  const [activeTaskTab, setActiveTaskTab] = useState('checkin');
  const [morningCheckInData, setMorningCheckInData] = useState({
    mood: null,
    craving: null,
    anxiety: null,
    sleep: null
  });
  const [eveningReflectionData, setEveningReflectionData] = useState({
    overallDay: null,
    promptResponse: '',
    challenges: '',
    gratitude: '',
    tomorrowGoal: ''
  });

  // Pattern Detection and Analytics
  const [patternDetection, setPatternDetection] = useState(null);
  const [calendarHeatmapData, setCalendarHeatmapData] = useState([]);
  const [selectedCalendarDay, setSelectedCalendarDay] = useState(null);
  const [calendarViewMode, setCalendarViewMode] = useState('month');
  const [calendarCurrentMonth, setCalendarCurrentMonth] = useState(new Date());
  const [calendarCurrentWeek, setCalendarCurrentWeek] = useState(new Date());
  const [moodWeekData, setMoodWeekData] = useState([]);
  const [streakData, setStreakData] = useState({
    longestStreak: 0,
    currentStreak: 0,
    allStreaks: []
  });
  const [reflectionStreakData, setReflectionStreakData] = useState({
    longestStreak: 0,
    currentStreak: 0,
    allStreaks: []
  });
  const [overallDayWeekData, setOverallDayWeekData] = useState([]);
  const [allMilestones, setAllMilestones] = useState([]);

  // Reflection States
  const [selectedReflection, setSelectedReflection] = useState(null);
  const [reflectionFilter, setReflectionFilter] = useState('all');
  const [gratitudeTheme, setGratitudeTheme] = useState('');
  const [gratitudeText, setGratitudeText] = useState('');
  const [gratitudeJournalData, setGratitudeJournalData] = useState([]);
  const [gratitudeInsights, setGratitudeInsights] = useState(null);

  // Challenges States
  const [challengesHistoryData, setChallengesHistoryData] = useState([]);
  const [challengesInsights, setChallengesInsights] = useState(null);
  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const [challengeCheckInStatus, setChallengeCheckInStatus] = useState('');
  const [challengeCheckInNotes, setChallengeCheckInNotes] = useState('');

  // Graph and Date Range States
  const [graphDateRange, setGraphDateRange] = useState({
    start: null,
    end: null
  });
  const [selectedRange, setSelectedRange] = useState('all');

  // Breakthrough and Tomorrow Goals
  const [breakthroughData, setBreakthroughData] = useState(null);
  const [tomorrowGoalsData, setTomorrowGoalsData] = useState([]);
  const [goalHistory, setGoalHistory] = useState([]);
  const [yesterdayGoal, setYesterdayGoal] = useState(null);
  const [goalStatus, setGoalStatus] = useState('');
  const [goalNotes, setGoalNotes] = useState('');

  // Goal and Weekly Statistics
  const [goalStats, setGoalStats] = useState({
    completionRate: 0,
    currentStreak: 0,
    bestStreak: 0,
    totalGoals: 0
  });
  const [weeklyStats, setWeeklyStats] = useState({
    checkRate: 0,
    avgMood: 0,
    thisWeekCompletion: 0
  });

  // Additional Check-In and Reflection Data
  const [checkInData, setCheckInData] = useState([]);
  const [reflectionStreak, setReflectionStreak] = useState(0);
  const [streakReflections, setStreakReflections] = useState([]);
  const [reflectionData, setReflectionData] = useState([]);
  const [reflectionStats, setReflectionStats] = useState({
    totalThisMonth: 0,
    avgDailyScore: 0,
    topGratitudeTheme: ''
  });
  const [coachNotes, setCoachNotes] = useState([]);

  // ────────────────────────────────────────────────────────────
  // BATCH 5: CONNECT TAB STATES (12 states, Lines 335-346) - Updated Phase 8D-2
  // ────────────────────────────────────────────────────────────

  const [activeChat, setActiveChat] = useState('main');
  const [communityMessages, setCommunityMessages] = useState([]);
  const [topicRooms, setTopicRooms] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [supportGroups, setSupportGroups] = useState([]);
  const [emergencyResources, setEmergencyResources] = useState([]);
  const [activeTopicRoom, setActiveTopicRoom] = useState(null);
  const [topicRoomMessages, setTopicRoomMessages] = useState([]);

  // Topic Room Message Composition States (Phase 8D-2)
  const [topicMessage, setTopicMessage] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [uploading, setUploading] = useState(false);

  // ────────────────────────────────────────────────────────────
  // BATCH 6: RESOURCES & NOTIFICATIONS (3 states, Lines 345-354)
  // ────────────────────────────────────────────────────────────

  const [resources, setResources] = useState({
    videos: [],
    articles: [],
    tools: [],
    worksheets: []
  });
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // ────────────────────────────────────────────────────────────
  // BATCH 7: MODALS & FORMS (6 states, Lines 355-365)
  // ────────────────────────────────────────────────────────────

  const [showModal, setShowModal] = useState(null);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showDataHandlingModal, setShowDataHandlingModal] = useState(false);
  const [showCrisisModal, setShowCrisisModal] = useState(false);
  const [showDisclaimerModal, setShowDisclaimerModal] = useState(() => {
    return !localStorage.getItem('disclaimerAccepted');
  });

  // ────────────────────────────────────────────────────────────
  // BATCH 8: MOBILE INTERACTIONS (3 states, Lines 368-370)
  // ────────────────────────────────────────────────────────────

  const [pulling, setPulling] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  // ═══════════════════════════════════════════════════════════
  // REF DECLARATIONS - Moved from PIRapp.js
  // ═══════════════════════════════════════════════════════════

  // ────────────────────────────────────────────────────────────
  // BATCH 2: CHART REFS (4 refs, Lines 73-78)
  // ────────────────────────────────────────────────────────────

  const chartRef = useRef(null);
  const cravingChartRef = useRef(null);
  const anxietyChartRef = useRef(null);
  const sleepChartRef = useRef(null);

  // ────────────────────────────────────────────────────────────
  // BATCH 3: JOURNEY CARD REFS (4 refs, Lines 91-119)
  // ────────────────────────────────────────────────────────────

  const lifeCardsRef = useRef(null);
  const financesCardsRef = useRef(null);
  const savingsCarouselRef = useRef(null);
  const wellnessCardsRef = useRef(null);

  // ────────────────────────────────────────────────────────────
  // BATCH 7: FILE INPUT REF (1 ref, Line 356)
  // ────────────────────────────────────────────────────────────

  const fileInputRef = useRef(null);

  // ────────────────────────────────────────────────────────────
  // BATCH 8: MOBILE INTERACTION REFS (3 refs, Lines 371-379)
  // ────────────────────────────────────────────────────────────

  const pullStartY = useRef(0);
  const contentRef = useRef(null);
  const listenersRef = useRef([]);

  // ═══════════════════════════════════════════════════════════
  // CUSTOM HOOKS - Business logic with Context access
  // ═══════════════════════════════════════════════════════════

  // Get handlers with Context access (Phase 8D-2)
  const handlers = window.GLRSApp?.hooks?.useHandlers ? window.GLRSApp.hooks.useHandlers() : {};

  // Get loaders with Context access (Phase 8E)
  const loaders = window.GLRSApp?.hooks?.useLoaders ? window.GLRSApp.hooks.useLoaders() : {};

  // ═══════════════════════════════════════════════════════════
  // UTILITY FUNCTIONS - Non-loader utilities
  // ═══════════════════════════════════════════════════════════

  // Access Firebase from window
  const db = window.db;
  const firebase = window.firebase;

  // Utility functions from assignmentActions.js
  const updateGoalProgress = async goalId => {
    if (window.GLRSApp?.actions?.updateGoalProgress) {
      return window.GLRSApp.actions.updateGoalProgress({
        goalId,
        user,
        db,
        firebase
      });
    }
  };

  // Utility functions from loaders.js (need special handling)
  const uploadChatImage = async (file, chatType, roomId) => {
    // uploadChatImage in loaders.js doesn't reference closure vars, it's self-contained
    if (window.GLRSApp?.utils?.uploadChatImage) {
      return window.GLRSApp.utils.uploadChatImage(file, chatType, roomId);
    }
    return null;
  };
  const flagContent = async (contentType, contentData) => {
    // flagContent needs user, userData, db, firebase - we can inject them
    if (!user || !db || !firebase) return false;
    const reason = prompt('Please describe why you are flagging this content:');
    if (!reason) return false;
    try {
      await db.collection('flaggedContent').add({
        contentType: contentType,
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

  // ═══════════════════════════════════════════════════════════
  // CONTEXT VALUE - All state and refs exposed to consumers
  // ═══════════════════════════════════════════════════════════

  const contextValue = {
    // ────────────────────────────────────────────────────────────
    // USER PROP (passed from PIRapp.js)
    // ────────────────────────────────────────────────────────────
    user,
    // ────────────────────────────────────────────────────────────
    // BATCH 1: USER DATA & CORE UI STATES (26 states × 2 = 52 properties)
    // ────────────────────────────────────────────────────────────
    currentView,
    setCurrentView,
    journeyTab,
    setJourneyTab,
    dailyQuotes,
    setDailyQuotes,
    showProfileModal,
    setShowProfileModal,
    loading,
    setLoading,
    userData,
    setUserData,
    profileImage,
    setProfileImage,
    coachInfo,
    setCoachInfo,
    sobrietyDays,
    setSobrietyDays,
    selectedMood,
    setSelectedMood,
    pledgeMade,
    setPledgeMade,
    moneySaved,
    setMoneySaved,
    dailyQuote,
    setDailyQuote,
    milestones,
    setMilestones,
    nextMilestone,
    setNextMilestone,
    activeBroadcast,
    setActiveBroadcast,
    broadcastDismissed,
    setBroadcastDismissed,
    checkInStatus,
    setCheckInStatus,
    checkInStreak,
    setCheckInStreak,
    streakCheckIns,
    setStreakCheckIns,
    complianceRate,
    setComplianceRate,
    totalCheckIns,
    setTotalCheckIns,
    googleConnected,
    setGoogleConnected,
    googleToken,
    setGoogleToken,
    googleTokenExpiry,
    setGoogleTokenExpiry,
    syncingGoogle,
    setSyncingGoogle,
    // ────────────────────────────────────────────────────────────
    // BATCH 2: PROGRESS & CHART STATES (5 states × 2 + 4 refs = 14 properties)
    // ────────────────────────────────────────────────────────────
    checkIns,
    setCheckIns,
    moodChartData,
    setMoodChartData,
    cravingChartData,
    setCravingChartData,
    anxietyChartData,
    setAnxietyChartData,
    sleepChartData,
    setSleepChartData,
    chartRef,
    cravingChartRef,
    anxietyChartRef,
    sleepChartRef,
    // ────────────────────────────────────────────────────────────
    // BATCH 3: JOURNEY TAB STATES (27 states × 2 + 4 refs = 58 properties)
    // ────────────────────────────────────────────────────────────
    lifeCardIndex,
    setLifeCardIndex,
    lifeIsDragging,
    setLifeIsDragging,
    lifeTouchStart,
    setLifeTouchStart,
    lifeTouchEnd,
    setLifeTouchEnd,
    lifeCardsRef,
    financesCardIndex,
    setFinancesCardIndex,
    financesIsDragging,
    setFinancesIsDragging,
    financesTouchStart,
    setFinancesTouchStart,
    financesTouchEnd,
    setFinancesTouchEnd,
    financesCardsRef,
    savingsCarouselIndex,
    setSavingsCarouselIndex,
    activeSavingsGoal,
    setActiveSavingsGoal,
    actualMoneySaved,
    setActualMoneySaved,
    customGoalItems,
    setCustomGoalItems,
    tempAmount,
    setTempAmount,
    savingsCarouselTouchStart,
    setSavingsCarouselTouchStart,
    savingsCarouselRef,
    savingsItems,
    setSavingsItems,
    savingsGoals,
    setSavingsGoals,
    moneyMapStops,
    setMoneyMapStops,
    wellnessCardIndex,
    setWellnessCardIndex,
    wellnessIsDragging,
    setWellnessIsDragging,
    wellnessTouchStart,
    setWellnessTouchStart,
    wellnessTouchEnd,
    setWellnessTouchEnd,
    wellnessCardsRef,
    expandedGraph,
    setExpandedGraph,
    missedMoodCheckIns,
    setMissedMoodCheckIns,
    missedCravingCheckIns,
    setMissedCravingCheckIns,
    missedAnxietyCheckIns,
    setMissedAnxietyCheckIns,
    missedSleepCheckIns,
    setMissedSleepCheckIns,
    missedOverallCheckIns,
    setMissedOverallCheckIns,
    // ────────────────────────────────────────────────────────────
    // BATCH 4: TASKS TAB STATES (68 states × 2 = 136 properties)
    // ────────────────────────────────────────────────────────────
    goals,
    setGoals,
    assignments,
    setAssignments,
    showSidebar,
    setShowSidebar,
    dueToday,
    setDueToday,
    showIncompleteTasksModal,
    setShowIncompleteTasksModal,
    showHabitTrackerModal,
    setShowHabitTrackerModal,
    showQuickReflectionModal,
    setShowQuickReflectionModal,
    showThisWeekTasksModal,
    setShowThisWeekTasksModal,
    showOverdueItemsModal,
    setShowOverdueItemsModal,
    showMarkCompleteModal,
    setShowMarkCompleteModal,
    showProgressStatsModal,
    setShowProgressStatsModal,
    showGoalProgressModal,
    setShowGoalProgressModal,
    showTodayWinsModal,
    setShowTodayWinsModal,
    showCopingTechniqueModal,
    setShowCopingTechniqueModal,
    showGratitudeModal,
    setShowGratitudeModal,
    showGratitudeThemesModal,
    setShowGratitudeThemesModal,
    showJourneyCalendarModal,
    setShowJourneyCalendarModal,
    showMilestoneModal,
    setShowMilestoneModal,
    showPastReflectionsModal,
    setShowPastReflectionsModal,
    showReflectionStreakModal,
    setShowReflectionStreakModal,
    showReflectionStreaksModal,
    setShowReflectionStreaksModal,
    showStreakModal,
    setShowStreakModal,
    showStreaksModal,
    setShowStreaksModal,
    showWeeklyReportModal,
    setShowWeeklyReportModal,
    showIntentionsModal,
    setShowIntentionsModal,
    showProgressSnapshotModal,
    setShowProgressSnapshotModal,
    showPastIntentionsModal,
    setShowPastIntentionsModal,
    showGraphSettingsModal,
    setShowGraphSettingsModal,
    showCalendarHeatmapModal,
    setShowCalendarHeatmapModal,
    showMoodInsightsModal,
    setShowMoodInsightsModal,
    showOverallDayInsightsModal,
    setShowOverallDayInsightsModal,
    showGratitudeJournalModal,
    setShowGratitudeJournalModal,
    showChallengesHistoryModal,
    setShowChallengesHistoryModal,
    showChallengeCheckInModal,
    setShowChallengeCheckInModal,
    showBreakthroughModal,
    setShowBreakthroughModal,
    showTomorrowGoalsModal,
    setShowTomorrowGoalsModal,
    showMoodPatternModal,
    setShowMoodPatternModal,
    showCravingPatternModal,
    setShowCravingPatternModal,
    showAnxietyPatternModal,
    setShowAnxietyPatternModal,
    showSleepPatternModal,
    setShowSleepPatternModal,
    showTipsModal,
    setShowTipsModal,
    habits,
    setHabits,
    todayHabits,
    setTodayHabits,
    quickReflections,
    setQuickReflections,
    todayWins,
    setTodayWins,
    newHabitName,
    setNewHabitName,
    newReflection,
    setNewReflection,
    newWin,
    setNewWin,
    showHabitHistory,
    setShowHabitHistory,
    showReflectionHistory,
    setShowReflectionHistory,
    showWinsHistory,
    setShowWinsHistory,
    activeTaskTab,
    setActiveTaskTab,
    morningCheckInData,
    setMorningCheckInData,
    eveningReflectionData,
    setEveningReflectionData,
    patternDetection,
    setPatternDetection,
    calendarHeatmapData,
    setCalendarHeatmapData,
    selectedCalendarDay,
    setSelectedCalendarDay,
    calendarViewMode,
    setCalendarViewMode,
    calendarCurrentMonth,
    setCalendarCurrentMonth,
    calendarCurrentWeek,
    setCalendarCurrentWeek,
    moodWeekData,
    setMoodWeekData,
    streakData,
    setStreakData,
    reflectionStreakData,
    setReflectionStreakData,
    overallDayWeekData,
    setOverallDayWeekData,
    allMilestones,
    setAllMilestones,
    selectedReflection,
    setSelectedReflection,
    reflectionFilter,
    setReflectionFilter,
    gratitudeTheme,
    setGratitudeTheme,
    gratitudeText,
    setGratitudeText,
    gratitudeJournalData,
    setGratitudeJournalData,
    gratitudeInsights,
    setGratitudeInsights,
    challengesHistoryData,
    setChallengesHistoryData,
    challengesInsights,
    setChallengesInsights,
    selectedChallenge,
    setSelectedChallenge,
    challengeCheckInStatus,
    setChallengeCheckInStatus,
    challengeCheckInNotes,
    setChallengeCheckInNotes,
    graphDateRange,
    setGraphDateRange,
    selectedRange,
    setSelectedRange,
    breakthroughData,
    setBreakthroughData,
    tomorrowGoalsData,
    setTomorrowGoalsData,
    goalHistory,
    setGoalHistory,
    yesterdayGoal,
    setYesterdayGoal,
    goalStatus,
    setGoalStatus,
    goalNotes,
    setGoalNotes,
    goalStats,
    setGoalStats,
    weeklyStats,
    setWeeklyStats,
    checkInData,
    setCheckInData,
    reflectionStreak,
    setReflectionStreak,
    streakReflections,
    setStreakReflections,
    reflectionData,
    setReflectionData,
    reflectionStats,
    setReflectionStats,
    coachNotes,
    setCoachNotes,
    // ────────────────────────────────────────────────────────────
    // BATCH 5: CONNECT TAB STATES (12 states × 2 = 24 properties) - Updated Phase 8D-2
    // ────────────────────────────────────────────────────────────
    activeChat,
    setActiveChat,
    communityMessages,
    setCommunityMessages,
    topicRooms,
    setTopicRooms,
    meetings,
    setMeetings,
    supportGroups,
    setSupportGroups,
    emergencyResources,
    setEmergencyResources,
    activeTopicRoom,
    setActiveTopicRoom,
    topicRoomMessages,
    setTopicRoomMessages,
    topicMessage,
    setTopicMessage,
    selectedImage,
    setSelectedImage,
    uploading,
    setUploading,
    // ────────────────────────────────────────────────────────────
    // BATCH 6: RESOURCES & NOTIFICATIONS (3 states × 2 = 6 properties)
    // ────────────────────────────────────────────────────────────
    resources,
    setResources,
    notifications,
    setNotifications,
    unreadCount,
    setUnreadCount,
    // ────────────────────────────────────────────────────────────
    // BATCH 7: MODALS & FORMS (6 states × 2 + 1 ref = 13 properties)
    // ────────────────────────────────────────────────────────────
    showModal,
    setShowModal,
    fileInputRef,
    showTermsModal,
    setShowTermsModal,
    showPrivacyModal,
    setShowPrivacyModal,
    showDataHandlingModal,
    setShowDataHandlingModal,
    showCrisisModal,
    setShowCrisisModal,
    showDisclaimerModal,
    setShowDisclaimerModal,
    // ────────────────────────────────────────────────────────────
    // BATCH 8: MOBILE INTERACTIONS (3 states × 2 + 3 refs = 9 properties)
    // ────────────────────────────────────────────────────────────
    pulling,
    setPulling,
    pullDistance,
    setPullDistance,
    refreshing,
    setRefreshing,
    pullStartY,
    contentRef,
    listenersRef,
    // ────────────────────────────────────────────────────────────
    // HANDLERS - Business logic functions (Phase 8D-2)
    // ────────────────────────────────────────────────────────────
    handlePledge: handlers.handlePledge,
    handleMorningCheckIn: handlers.handleMorningCheckIn,
    handleEveningReflection: handlers.handleEveningReflection,
    handleAssignmentComplete: handlers.handleAssignmentComplete,
    handleReflectionSave: handlers.handleReflectionSave,
    saveGratitude: handlers.saveGratitude,
    handleProfileImageUpload: handlers.handleProfileImageUpload,
    handleTopicImageSelect: handlers.handleTopicImageSelect,
    handleSendMessage: handlers.handleSendMessage,
    handleFlagTopicMessage: handlers.handleFlagTopicMessage,
    // ────────────────────────────────────────────────────────────
    // LOADER FUNCTIONS (Phase 8E - All 35 loaders from useLoaders hook)
    // ────────────────────────────────────────────────────────────
    loadAllData: loaders.loadAllData,
    loadUserData: loaders.loadUserData,
    loadTopicRooms: loaders.loadTopicRooms,
    loadMeetings: loaders.loadMeetings,
    loadGoals: loaders.loadGoals,
    loadAssignments: loaders.loadAssignments,
    loadHabits: loaders.loadHabits,
    loadTodayHabits: loaders.loadTodayHabits,
    loadQuickReflections: loaders.loadQuickReflections,
    loadTodayWins: loaders.loadTodayWins,
    loadDailyTasksStatus: loaders.loadDailyTasksStatus,
    loadDailyInspiration: loaders.loadDailyInspiration,
    loadMilestones: loaders.loadMilestones,
    loadBroadcasts: loaders.loadBroadcasts,
    loadResources: loaders.loadResources,
    loadCheckIns: loaders.loadCheckIns,
    loadStreakCheckIns: loaders.loadStreakCheckIns,
    loadTodaysPledge: loaders.loadTodaysPledge,
    loadStreak: loaders.loadStreak,
    loadCoachNotes: loaders.loadCoachNotes,
    loadCalendarHeatmapData: loaders.loadCalendarHeatmapData,
    loadMoodWeekData: loaders.loadMoodWeekData,
    loadOverallDayWeekData: loaders.loadOverallDayWeekData,
    loadGratitudeJournal: loaders.loadGratitudeJournal,
    loadGratitudeInsights: loaders.loadGratitudeInsights,
    loadDailyQuotes: loaders.loadDailyQuotes,
    loadChallengesHistory: loaders.loadChallengesHistory,
    loadTomorrowGoals: loaders.loadTomorrowGoals,
    loadGoalAchievementData: loaders.loadGoalAchievementData,
    loadReflections: loaders.loadReflections,
    loadStreakReflections: loaders.loadStreakReflections,
    loadChallengesInsights: loaders.loadChallengesInsights,
    loadComplianceRates: loaders.loadComplianceRates,
    loadSupportGroups: loaders.loadSupportGroups,
    loadEmergencyResources: loaders.loadEmergencyResources,
    updateStreak: loaders.updateStreak,
    // ────────────────────────────────────────────────────────────
    // UTILITY FUNCTIONS (Non-loader utilities)
    // ────────────────────────────────────────────────────────────
    updateGoalProgress,
    uploadChatImage,
    flagContent
  };
  return /*#__PURE__*/React.createElement(AppContext.Provider, {
    value: contextValue
  }, children);
};

// ============================================================
// EXPORT CONTEXT
// ============================================================

// Register globally
window.GLRSApp = window.GLRSApp || {
  components: {},
  hooks: {}
};
window.GLRSApp.components.AppContext = AppContext;
window.GLRSApp.components.AppProvider = AppProvider;
window.GLRSApp.hooks.useAppContext = useAppContext;
console.log('✅ AppContext.js loaded - Context API ready');