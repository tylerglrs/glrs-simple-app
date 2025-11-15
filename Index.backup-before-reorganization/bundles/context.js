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
console.log('✅ AppContext.js loaded - Context API ready');// ═══════════════════════════════════════════════════════════
// APP INITIALIZATION HOOKS
// Custom hooks for PIRapp lifecycle management
// ═══════════════════════════════════════════════════════════

// ==========================================
// PULL-TO-REFRESH HOOK
// ==========================================

const usePullToRefresh = ({
  contentRef,
  pullStartY,
  currentView,
  setPulling,
  setPullDistance,
  setRefreshing,
  loadAllData,
  loadCheckIns,
  loadGoals,
  loadAssignments,
  loadCommunityMessages,
  loadTopicRooms,
  loadResources
}) => {
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      // Trigger haptic feedback (if available)
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }

      // Reload data based on current view
      if (currentView === 'home') {
        await loadAllData();
      } else if (currentView === 'progress') {
        await loadCheckIns();
      } else if (currentView === 'tasks') {
        await loadGoals();
        await loadAssignments();
      } else if (currentView === 'connect') {
        await loadCommunityMessages();
        await loadTopicRooms();
      } else if (currentView === 'profile') {
        await loadResources();
      }

      // Show success notification
      window.GLRSApp.utils.showNotification('Refreshed', 'success');
    } catch (error) {
      window.GLRSApp.utils.showNotification('Refresh failed', 'error');
    } finally {
      setRefreshing(false);
      setPullDistance(0);
      setPulling(false);
    }
  };
  const handleTouchStart = e => {
    if (!contentRef.current) return;
    const scrollTop = contentRef.current.scrollTop;

    // Only allow pull-to-refresh when at the top
    if (scrollTop === 0) {
      pullStartY.current = e.touches[0].clientY;
    }
  };
  const handleTouchMove = e => {
    if (!contentRef.current || pullStartY.current === 0) return;
    const scrollTop = contentRef.current.scrollTop;
    if (scrollTop > 0) {
      setPulling(false);
      setPullDistance(0);
      return;
    }
    const currentY = e.touches[0].clientY;
    const distance = currentY - pullStartY.current;
    if (distance > 0 && distance <= 120) {
      setPulling(true);
      setPullDistance(distance);
      e.preventDefault(); // Prevent scroll
    }
  };
  const handleTouchEnd = () => {
    if (pulling && pullDistance > 80) {
      handleRefresh();
    } else {
      setPulling(false);
      setPullDistance(0);
    }
    pullStartY.current = 0;
  };
  return {
    handleRefresh,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd
  };
};

// ==========================================
// DATA LOADING & LISTENERS HOOK
// ==========================================

const useDataLoading = (user, db, listenersRef, broadcastDismissed, setters, loaders) => {
  React.useEffect(() => {
    if (user) {
      window.GLRSApp.loaders.loadAllData();
      window.GLRSApp.listeners.setupRealtimeListeners(db, user, listenersRef, broadcastDismissed, {
        setNotifications: setters.setNotifications,
        setUnreadCount: setters.setUnreadCount,
        setCommunityMessages: setters.setCommunityMessages,
        setActiveBroadcast: setters.setActiveBroadcast
      }, {
        loadGoals: loaders.loadGoals,
        loadAssignments: loaders.loadAssignments,
        loadHabits: loaders.loadHabits,
        loadTodayHabits: loaders.loadTodayHabits,
        loadQuickReflections: loaders.loadQuickReflections,
        loadTodayWins: loaders.loadTodayWins
      });
      loaders.loadGoogleConnection();
    }
    return () => {
      // Cleanup listeners
      listenersRef.current.forEach(unsubscribe => unsubscribe());
    };
  }, [user]);
};

// ==========================================
// LUCIDE ICONS INITIALIZATION HOOK
// ==========================================

const useLucideIcons = dependencies => {
  React.useEffect(() => {
    if (typeof lucide !== 'undefined') {
      // Use setTimeout to ensure React finishes rendering before creating icons
      // Increased delay to 100ms to ensure all DOM updates complete
      setTimeout(() => {
        lucide.createIcons();
      }, 100);
    }
  }, dependencies);
};

// ==========================================
// SOBRIETY CALCULATION HOOK
// ==========================================

const useSobrietyCalculation = (userData, setSobrietyDays, setMoneySaved) => {
  React.useEffect(() => {
    if (userData?.sobrietyDate) {
      const calculateStats = () => {
        const days = window.GLRSApp.utils.calculateSobrietyDays(userData.sobrietyDate);
        setSobrietyDays(days);

        // Use the user's custom daily cost, default to 20 if not set
        const dailyCost = userData.dailyCost || 20;
        setMoneySaved(days * dailyCost);
      };
      calculateStats();
      const interval = setInterval(calculateStats, 60000);
      return () => clearInterval(interval);
    }
  }, [userData]);
};

// ==========================================
// MODAL ICONS HOOK
// ==========================================

const useModalIcons = showModal => {
  React.useEffect(() => {
    // Small delay to ensure DOM is updated
    const timer = setTimeout(() => {
      if (window.lucide) {
        window.lucide.createIcons();
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [showModal]);
};

// ==========================================
// JOURNEY TAB ICONS HOOK
// ==========================================

const useJourneyTabIcons = (currentView, journeyTab) => {
  React.useEffect(() => {
    if (currentView === 'journey') {
      // Small delay to ensure DOM is updated
      const timer = setTimeout(() => {
        if (window.lucide) {
          window.lucide.createIcons();
        }
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [currentView, journeyTab]);
};

// ==========================================
// SAVINGS DATA LOADER HOOK
// ==========================================

const useSavingsData = (user, db, setSavingsItems, setSavingsGoals, setMoneyMapStops, setActiveSavingsGoal, setActualMoneySaved, setCustomGoalItems) => {
  React.useEffect(() => {
    if (!user) return;
    const loadSavingsData = async () => {
      try {
        // Load savings items
        const itemsSnapshot = await db.collection('savingsItems').orderBy('minCost', 'asc').get();
        if (!itemsSnapshot.empty) {
          const items = itemsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setSavingsItems(items);
        }

        // Load savings goals
        const goalsSnapshot = await db.collection('savingsGoals').orderBy('amount', 'asc').get();
        if (!goalsSnapshot.empty) {
          const goals = goalsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setSavingsGoals(goals);
        }

        // Load money map stops
        const stopsSnapshot = await db.collection('moneyMapStops').orderBy('amount', 'asc').get();
        if (!stopsSnapshot.empty) {
          const stops = stopsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setMoneyMapStops(stops);
        }

        // Load user's savings preferences
        const prefsDoc = await db.collection('users').doc(user.uid).collection('savingsPreferences').doc('current').get();
        if (prefsDoc.exists) {
          const prefs = prefsDoc.data();
          if (prefs.activeSavingsGoal) setActiveSavingsGoal(prefs.activeSavingsGoal);
          if (prefs.actualMoneySaved) setActualMoneySaved(prefs.actualMoneySaved);
          if (prefs.customGoalItems) setCustomGoalItems(prefs.customGoalItems);
        }
      } catch (error) {
        console.error('Error loading savings data:', error);
      }
    };
    loadSavingsData();
  }, [user]);
};

// ==========================================
// SAVINGS PREFERENCES SAVER HOOK
// ==========================================

const useSavingsPreferences = (user, db, activeSavingsGoal, actualMoneySaved, customGoalItems) => {
  React.useEffect(() => {
    if (!user) return;
    const savePreferences = async () => {
      try {
        await db.collection('users').doc(user.uid).collection('savingsPreferences').doc('current').set({
          activeSavingsGoal,
          actualMoneySaved,
          customGoalItems,
          updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        }, {
          merge: true
        });
      } catch (error) {
        console.error('Error saving savings preferences:', error);
      }
    };

    // Debounce saves
    const timeoutId = setTimeout(savePreferences, 1000);
    return () => clearTimeout(timeoutId);
  }, [activeSavingsGoal, actualMoneySaved, customGoalItems, user]);
};

// ==========================================
// PROGRESS CHARTS INITIALIZATION HOOK
// ==========================================

const useProgressCharts = (currentView, moodChartData, cravingChartData, chartRef, cravingChartRef) => {
  React.useEffect(() => {
    if (currentView === 'progress' && moodChartData && cravingChartData) {
      setTimeout(() => {
        const moodCanvas = document.getElementById('moodChart');
        const cravingCanvas = document.getElementById('cravingCanvas');

        // Destroy existing charts
        if (chartRef.current) {
          chartRef.current.destroy();
        }
        if (cravingChartRef.current) {
          cravingChartRef.current.destroy();
        }
        if (moodCanvas) {
          const ctx = moodCanvas.getContext('2d');
          chartRef.current = new Chart(ctx, {
            type: 'line',
            data: moodChartData,
            options: {
              responsive: true,
              maintainAspectRatio: false,
              scales: {
                y: {
                  beginAtZero: true,
                  max: 10
                }
              }
            }
          });
        }
        if (cravingCanvas) {
          const ctx = cravingCanvas.getContext('2d');
          cravingChartRef.current = new Chart(ctx, {
            type: 'line',
            data: cravingChartData,
            options: {
              responsive: true,
              maintainAspectRatio: false,
              scales: {
                y: {
                  beginAtZero: true,
                  max: 10
                }
              }
            }
          });
        }
      }, 100);
    }
  }, [currentView, moodChartData, cravingChartData]);
};

// ==========================================
// JOURNEY WELLNESS GRAPHS HOOK
// ==========================================

const useJourneyWellnessGraphs = (currentView, journeyTab, expandedGraph, checkIns) => {
  React.useEffect(() => {
    if (currentView === 'progress' && journeyTab === 'wellness' && expandedGraph && checkIns.length > 0) {
      setTimeout(() => {
        // Generate full 31-day date range
        const today = new Date();
        const last31Days = [];
        for (let i = 30; i >= 0; i--) {
          const date = new Date(today);
          date.setDate(date.getDate() - i);
          last31Days.push(date);
        }

        // Create labels from full 31-day range
        const labels = last31Days.map(date => date.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric'
        }));

        // Helper function to find check-in for a specific date
        const findCheckInForDate = date => {
          return checkIns.find(c => {
            const checkInDate = c.createdAt?.toDate ? c.createdAt.toDate() : new Date(c.createdAt);
            return checkInDate.toDateString() === date.toDateString();
          });
        };

        // Map check-ins to full 31-day range
        const moodData = last31Days.map(date => {
          const checkIn = findCheckInForDate(date);
          return checkIn?.morningData?.mood ?? null;
        });
        const cravingData = last31Days.map(date => {
          const checkIn = findCheckInForDate(date);
          return checkIn?.morningData?.craving ?? null;
        });
        const anxietyData = last31Days.map(date => {
          const checkIn = findCheckInForDate(date);
          return checkIn?.morningData?.anxiety ?? null;
        });
        const sleepData = last31Days.map(date => {
          const checkIn = findCheckInForDate(date);
          return checkIn?.eveningData?.sleepQuality ?? null;
        });
        const overallData = last31Days.map(date => {
          const checkIn = findCheckInForDate(date);
          return checkIn?.eveningData?.overallDay ?? null;
        });

        // Render expanded graph
        if (expandedGraph === 'mood') {
          const canvas = document.getElementById('journeyMoodChart');
          if (canvas) {
            const ctx = canvas.getContext('2d');
            if (window.journeyMoodChart && typeof window.journeyMoodChart.destroy === 'function') {
              window.journeyMoodChart.destroy();
            }
            window.journeyMoodChart = new Chart(ctx, {
              type: 'line',
              data: {
                labels: labels,
                datasets: [{
                  label: 'Mood',
                  data: moodData,
                  borderColor: '#058585',
                  backgroundColor: 'rgba(5, 133, 133, 0.1)',
                  tension: 0.4,
                  fill: true,
                  pointRadius: 4,
                  pointHoverRadius: 6,
                  pointBackgroundColor: '#058585',
                  pointBorderColor: '#fff',
                  pointBorderWidth: 2,
                  pointHoverBackgroundColor: '#058585',
                  pointHoverBorderColor: '#fff'
                }]
              },
              options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: false
                  },
                  tooltip: {
                    enabled: true,
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    borderColor: '#058585',
                    borderWidth: 1,
                    callbacks: {
                      label: function (context) {
                        if (context.parsed.y === null) {
                          return 'Missing check-in creates gaps in your wellness picture. Stay consistent to track your progress!';
                        }
                        return 'Mood: ' + context.parsed.y;
                      }
                    }
                  }
                },
                interaction: {
                  mode: 'index',
                  intersect: false
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    max: 10,
                    ticks: {
                      color: '#666'
                    }
                  },
                  x: {
                    ticks: {
                      color: '#666'
                    }
                  }
                }
              }
            });
          }
        } else if (expandedGraph === 'cravings') {
          const canvas = document.getElementById('journeyCravingsChart');
          if (canvas) {
            const ctx = canvas.getContext('2d');
            if (window.journeyCravingsChart && typeof window.journeyCravingsChart.destroy === 'function') {
              window.journeyCravingsChart.destroy();
            }
            window.journeyCravingsChart = new Chart(ctx, {
              type: 'line',
              data: {
                labels: labels,
                datasets: [{
                  label: 'Cravings Intensity',
                  data: cravingData,
                  borderColor: '#DC143C',
                  backgroundColor: 'rgba(220, 20, 60, 0.1)',
                  tension: 0.4,
                  fill: true,
                  pointRadius: 4,
                  pointHoverRadius: 6,
                  pointBackgroundColor: '#DC143C',
                  pointBorderColor: '#fff',
                  pointBorderWidth: 2,
                  pointHoverBackgroundColor: '#DC143C',
                  pointHoverBorderColor: '#fff'
                }]
              },
              options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: false
                  },
                  tooltip: {
                    enabled: true,
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    borderColor: '#DC143C',
                    borderWidth: 1,
                    callbacks: {
                      label: function (context) {
                        if (context.parsed.y === null) {
                          return 'Missing check-in creates gaps in your wellness picture. Stay consistent to track your progress!';
                        }
                        return 'Cravings: ' + context.parsed.y;
                      }
                    }
                  }
                },
                interaction: {
                  mode: 'index',
                  intersect: false
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    max: 10,
                    ticks: {
                      color: '#666'
                    }
                  },
                  x: {
                    ticks: {
                      color: '#666'
                    }
                  }
                }
              }
            });
          }
        } else if (expandedGraph === 'anxiety') {
          const canvas = document.getElementById('journeyAnxietyChart');
          if (canvas) {
            const ctx = canvas.getContext('2d');
            if (window.journeyAnxietyChart && typeof window.journeyAnxietyChart.destroy === 'function') {
              window.journeyAnxietyChart.destroy();
            }
            window.journeyAnxietyChart = new Chart(ctx, {
              type: 'line',
              data: {
                labels: labels,
                datasets: [{
                  label: 'Anxiety Level',
                  data: anxietyData,
                  borderColor: '#FFA500',
                  backgroundColor: 'rgba(255, 165, 0, 0.1)',
                  tension: 0.4,
                  fill: true,
                  pointRadius: 4,
                  pointHoverRadius: 6,
                  pointBackgroundColor: '#FFA500',
                  pointBorderColor: '#fff',
                  pointBorderWidth: 2,
                  pointHoverBackgroundColor: '#FFA500',
                  pointHoverBorderColor: '#fff'
                }]
              },
              options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: false
                  },
                  tooltip: {
                    enabled: true,
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    borderColor: '#FFA500',
                    borderWidth: 1,
                    callbacks: {
                      label: function (context) {
                        if (context.parsed.y === null) {
                          return 'Missing check-in creates gaps in your wellness picture. Stay consistent to track your progress!';
                        }
                        return 'Anxiety: ' + context.parsed.y;
                      }
                    }
                  }
                },
                interaction: {
                  mode: 'index',
                  intersect: false
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    max: 10,
                    ticks: {
                      color: '#666'
                    }
                  },
                  x: {
                    ticks: {
                      color: '#666'
                    }
                  }
                }
              }
            });
          }
        } else if (expandedGraph === 'sleep') {
          const canvas = document.getElementById('journeySleepChart');
          if (canvas) {
            const ctx = canvas.getContext('2d');
            if (window.journeySleepChart && typeof window.journeySleepChart.destroy === 'function') {
              window.journeySleepChart.destroy();
            }
            window.journeySleepChart = new Chart(ctx, {
              type: 'line',
              data: {
                labels: labels,
                datasets: [{
                  label: 'Sleep Quality',
                  data: sleepData,
                  borderColor: '#9c27b0',
                  backgroundColor: 'rgba(156, 39, 176, 0.1)',
                  tension: 0.4,
                  fill: true,
                  pointRadius: 4,
                  pointHoverRadius: 6,
                  pointBackgroundColor: '#9c27b0',
                  pointBorderColor: '#fff',
                  pointBorderWidth: 2,
                  pointHoverBackgroundColor: '#9c27b0',
                  pointHoverBorderColor: '#fff'
                }]
              },
              options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: false
                  },
                  tooltip: {
                    enabled: true,
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    borderColor: '#9c27b0',
                    borderWidth: 1,
                    callbacks: {
                      label: function (context) {
                        if (context.parsed.y === null) {
                          return 'Missing check-in creates gaps in your wellness picture. Stay consistent to track your progress!';
                        }
                        return 'Sleep Quality: ' + context.parsed.y;
                      }
                    }
                  }
                },
                interaction: {
                  mode: 'index',
                  intersect: false
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    max: 10,
                    ticks: {
                      color: '#666'
                    }
                  },
                  x: {
                    ticks: {
                      color: '#666'
                    }
                  }
                }
              }
            });
          }
        } else if (expandedGraph === 'overall') {
          const canvas = document.getElementById('journeyOverallChart');
          if (canvas) {
            const ctx = canvas.getContext('2d');
            if (window.journeyOverallChart && typeof window.journeyOverallChart.destroy === 'function') {
              window.journeyOverallChart.destroy();
            }
            window.journeyOverallChart = new Chart(ctx, {
              type: 'line',
              data: {
                labels: labels,
                datasets: [{
                  label: 'Overall Day Rating',
                  data: overallData,
                  borderColor: '#4A90E2',
                  backgroundColor: 'rgba(74, 144, 226, 0.1)',
                  tension: 0.4,
                  fill: true,
                  pointRadius: 4,
                  pointHoverRadius: 6,
                  pointBackgroundColor: '#4A90E2',
                  pointBorderColor: '#fff',
                  pointBorderWidth: 2,
                  pointHoverBackgroundColor: '#4A90E2',
                  pointHoverBorderColor: '#fff'
                }]
              },
              options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: false
                  },
                  tooltip: {
                    enabled: true,
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    borderColor: '#4A90E2',
                    borderWidth: 1,
                    callbacks: {
                      label: function (context) {
                        if (context.parsed.y === null) {
                          return 'Missing check-in creates gaps in your wellness picture. Stay consistent to track your progress!';
                        }
                        return 'Overall Day Rating: ' + context.parsed.y;
                      }
                    }
                  }
                },
                interaction: {
                  mode: 'index',
                  intersect: false
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    max: 10,
                    ticks: {
                      color: '#666'
                    }
                  },
                  x: {
                    ticks: {
                      color: '#666'
                    }
                  }
                }
              }
            });
          }
        }

        // Render sparklines for collapsed graphs
        const renderSparkline = (canvasId, data, color) => {
          const canvas = document.getElementById(canvasId);
          if (canvas) {
            const ctx = canvas.getContext('2d');
            const chartKey = canvasId.replace('journey', '').replace('Sparkline', '');
            if (window[`journey${chartKey}SparklineChart`]) {
              window[`journey${chartKey}SparklineChart`].destroy();
            }
            window[`journey${chartKey}SparklineChart`] = new Chart(ctx, {
              type: 'line',
              data: {
                labels: labels,
                datasets: [{
                  data: data,
                  borderColor: color,
                  borderWidth: 2,
                  backgroundColor: `${color}1a`,
                  tension: 0.4,
                  fill: true,
                  pointRadius: 4,
                  pointHoverRadius: 6,
                  pointBackgroundColor: color,
                  pointBorderColor: '#fff',
                  pointBorderWidth: 2,
                  pointHoverBackgroundColor: color,
                  pointHoverBorderColor: '#fff'
                }]
              },
              options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: false
                  },
                  tooltip: {
                    enabled: true,
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    borderColor: color,
                    borderWidth: 1
                  }
                },
                interaction: {
                  mode: 'index',
                  intersect: false
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    max: 10,
                    ticks: {
                      color: '#666'
                    }
                  },
                  x: {
                    ticks: {
                      color: '#666'
                    }
                  }
                }
              }
            });
          }
        };
        if (expandedGraph !== 'mood') renderSparkline('journeyMoodSparkline', moodData, '#058585');
        if (expandedGraph !== 'cravings') renderSparkline('journeyCravingsSparkline', cravingData, '#DC143C');
        if (expandedGraph !== 'anxiety') renderSparkline('journeyAnxietySparkline', anxietyData, '#FFA500');
        if (expandedGraph !== 'sleep') renderSparkline('journeySleepSparkline', sleepData, '#9c27b0');
        if (expandedGraph !== 'overall') renderSparkline('journeyOverallSparkline', overallData, '#4A90E2');

        // Initialize Lucide icons
        if (typeof lucide !== 'undefined' && lucide.createIcons) {
          lucide.createIcons();
        }
      }, 100);
    }
  }, [currentView, journeyTab, expandedGraph, checkIns]);
};

// ==========================================
// PROFILE COMPLETION CHECK HOOK
// ==========================================

const useProfileCompletion = (userData, showModal, setShowModal, db, user) => {
  React.useEffect(() => {
    if (userData && !userData.profileComplete) {
      const checkProfileCompletion = () => {
        if (userData.firstName && userData.lastName && userData.phone) {
          db.collection('users').doc(user.uid).update({
            profileComplete: true
          });
        } else if (!showModal) {
          setTimeout(() => {
            if (!localStorage.getItem('profilePromptShown')) {
              setShowModal('profilePrompt');
              localStorage.setItem('profilePromptShown', 'true');
            }
          }, 5000);
        }
      };
      checkProfileCompletion();
    }
  }, [userData, showModal]);
};

// ==========================================
// MIDNIGHT RESET HOOK
// ==========================================

const useMidnightReset = (user, setCheckInStatus) => {
  React.useEffect(() => {
    const checkMidnightReset = () => {
      const now = new Date();
      const userTimezone = user.timezone || "America/Los_Angeles";
      const userNow = new Date(now.toLocaleString("en-US", {
        timeZone: userTimezone
      }));
      const hours = userNow.getHours();
      const minutes = userNow.getMinutes();
      const seconds = userNow.getSeconds();

      // Calculate milliseconds until midnight (user's timezone)
      const msUntilMidnight = ((23 - hours) * 60 * 60 + (59 - minutes) * 60 + (60 - seconds)) * 1000;

      // Set timeout for midnight reset
      const midnightTimer = setTimeout(() => {
        // Reset daily tasks
        window.GLRSApp.loaders.loadDailyTasksStatus();
        window.GLRSApp.loaders.loadCheckIns();
        setCheckInStatus({
          morning: false,
          evening: false
        });

        // Set up daily interval
        const dailyInterval = setInterval(() => {
          window.GLRSApp.loaders.loadDailyTasksStatus();
          window.GLRSApp.loaders.loadCheckIns();
          setCheckInStatus({
            morning: false,
            evening: false
          });
        }, 24 * 60 * 60 * 1000); // Every 24 hours

        return () => clearInterval(dailyInterval);
      }, msUntilMidnight);
      return () => clearTimeout(midnightTimer);
    };
    checkMidnightReset();
  }, []);
};

// ==========================================
// PATTERN DETECTION HOOK
// ==========================================

const usePatternDetection = (checkIns, setPatternDetection) => {
  React.useEffect(() => {
    if (checkIns.length > 0) {
      const pattern = window.GLRSApp.shared.patternDetection.detectPatterns(checkIns);
      setPatternDetection(pattern);
    }
  }, [checkIns]);
};

// Register hooks globally
window.GLRSApp = window.GLRSApp || {
  hooks: {}
};
window.GLRSApp.hooks = {
  usePullToRefresh,
  useDataLoading,
  useLucideIcons,
  useSobrietyCalculation,
  useModalIcons,
  useJourneyTabIcons,
  useSavingsData,
  useSavingsPreferences,
  useProgressCharts,
  useJourneyWellnessGraphs,
  useProfileCompletion,
  useMidnightReset,
  usePatternDetection
};
console.log('✅ App initialization hooks loaded'); // ==========================================
    // GOOGLE CALENDAR INTEGRATION - PIR SIDE
    // ==========================================

    // Simple encryption/decryption for token storage

    // Load Google connection status on mount
    const loadGoogleConnection = async () => {
        try {
            const userDoc = await db.collection('users').doc(user.uid).get();
            const data = userDoc.data();
            
            if (data?.googleConnected && data?.googleAccessToken) {
                setGoogleConnected(true);
                
                // Decrypt token
                const decrypted = window.GLRSApp.utils.decryptToken(data.googleAccessToken, user.uid);
                setGoogleToken(decrypted);
                setGoogleTokenExpiry(data.googleTokenExpiry);
                
                // Check if token is expired
                if (data.googleTokenExpiry && Date.now() > data.googleTokenExpiry) {
                }
            } else {
                setGoogleConnected(false);
                setGoogleToken(null);
            }
        } catch (error) {
            setGoogleConnected(false);
        }
    };

    // Check and auto-refresh Google token if needed
    const checkGoogleToken = async () => {
        try {
            if (!googleConnected || !googleToken) {
                return { 
                    valid: false, 
                    error: 'Google Calendar not connected. Please connect in Settings.' 
                };
            }
            
            // Check if token is expired or will expire in next 5 minutes
            const expiryBuffer = 5 * 60 * 1000; // 5 minutes
            const isExpired = googleTokenExpiry && (Date.now() + expiryBuffer) > googleTokenExpiry;
            
            if (isExpired) {
                
                // Show user-friendly message
                window.GLRSApp.utils.showNotification('Refreshing Google Calendar connection...', 'info');
                
                // Attempt to refresh token
                const refreshed = await refreshGoogleToken();
                
                if (!refreshed) {
                    // Show error banner
                    window.GLRSApp.utils.showNotification(
                        'Google Calendar connection expired. Please reconnect in Settings.', 
                        'error'
                    );
                    return { 
                        valid: false, 
                        error: 'Token refresh failed. Please reconnect Google Calendar.' 
                    };
                }
                
                return { valid: true, token: googleToken };
            }
            
            return { valid: true, token: googleToken };
            
        } catch (error) {
            window.GLRSApp.utils.showNotification('Error validating Google Calendar connection', 'error');
            return { 
                valid: false, 
                error: 'Failed to validate token: ' + error.message 
            };
        }
    };

    // Refresh Google token
    const refreshGoogleToken = async () => {
        try {
            // For OAuth tokens, we need to re-authenticate
            // Google doesn't provide refresh tokens for browser-based OAuth
            
            // Attempt silent refresh if possible
            if (typeof google !== 'undefined' && google.accounts) {
                // This won't work automatically - user must re-consent
                return false;
            }
            
            return false;
        } catch (error) {
            return false;
        }
    };

    // Connect Google Calendar
    const connectGoogleCalendar = async () => {
        setSyncingGoogle(true);
        try {
            
            // Check if Google Identity Services loaded
            if (typeof google === 'undefined' || !google.accounts) {
                throw new Error('Google Identity Services not loaded. Please refresh the page.');
            }
            
            // Initialize token client with CALENDAR ONLY scope
            const tokenClient = google.accounts.oauth2.initTokenClient({
                client_id: '457406864879-k1sunucuqofe22m5rg93hvo6nngiqh0u.apps.googleusercontent.com',
                scope: 'https://www.googleapis.com/auth/calendar.events',
                callback: async (tokenResponse) => {
                    try {
                        
                        if (tokenResponse.error) {
                            throw new Error(tokenResponse.error);
                        }
                        
                        if (!tokenResponse.access_token) {
                            throw new Error('No access token received');
                        }
                        
                        // Encrypt token before storing
                        const encryptedToken = window.GLRSApp.utils.encryptToken(tokenResponse.access_token, user.uid);
                        
                        
                        // Save to Firebase
                        await db.collection('users').doc(user.uid).update({
                            googleConnected: true,
                            googleAccessToken: encryptedToken,
                            googleTokenExpiry: Date.now() + (tokenResponse.expires_in * 1000),
                            googleConnectedAt: firebase.firestore.FieldValue.serverTimestamp(),
                            calendarSyncEnabled: false // Default to off, user must enable
                        });
                        
                        // Update local state
                        setGoogleConnected(true);
                        setGoogleToken(tokenResponse.access_token);
                        setGoogleTokenExpiry(Date.now() + (tokenResponse.expires_in * 1000));
                        
                        window.GLRSApp.utils.showNotification('Google Calendar Connected!', 'success');
                        
                        // Close modal and reload
                        setShowModal(null);
                        setTimeout(() => loadGoogleConnection(), 500);
                        
                    } catch (error) {
                        window.GLRSApp.utils.showNotification('Failed to save connection: ' + error.message, 'error');
                    } finally {
                        setSyncingGoogle(false);
                    }
                },
            });
            
            // Request access token
            tokenClient.requestAccessToken({ prompt: 'consent' });
            
        } catch (error) {
            window.GLRSApp.utils.showNotification('Failed to connect: ' + error.message, 'error');
            setSyncingGoogle(false);
        }
    };

    // Disconnect Google Calendar
    const disconnectGoogleCalendar = async () => {
        if (!confirm('Disconnect Google Calendar?\n\nThis will remove:\n• Calendar sync\n• All synced milestones\n\nYou can reconnect anytime.')) {
            return;
        }
        
        setSyncingGoogle(true);
        try {
            
            // Revoke token if available
            if (googleToken && typeof google !== 'undefined' && google.accounts) {
                google.accounts.oauth2.revoke(googleToken, () => {
                });
            }
            
            // Remove from Firebase
            await db.collection('users').doc(user.uid).update({
                googleConnected: false,
                googleAccessToken: firebase.firestore.FieldValue.delete(),
                googleTokenExpiry: firebase.firestore.FieldValue.delete(),
                calendarSyncEnabled: false,
                milestoneCalendarEvents: firebase.firestore.FieldValue.delete(),
                googleDisconnectedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            // Update local state
            setGoogleConnected(false);
            setGoogleToken(null);
            setGoogleTokenExpiry(null);
            
            window.GLRSApp.utils.showNotification('Google Calendar disconnected', 'success');
            setShowModal(null);
            
        } catch (error) {
            window.GLRSApp.utils.showNotification('Failed to disconnect: ' + error.message, 'error');
        } finally {
            setSyncingGoogle(false);
        }
    };

    // ==========================================
    // END GOOGLE CALENDAR INTEGRATION
    // ==========================================