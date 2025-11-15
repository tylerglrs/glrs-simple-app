// Main PIR App Component
function PIRApp({
  user
}) {
  // CORRECTED NAVIGATION ORDER: Tasks-Journey-Home-Connect-Guides-Notifications

  // ═══════════════════════════════════════════════════════════
  // CONTEXT: Get state from AppContext
  // ═══════════════════════════════════════════════════════════

  const {
    // Batch 1: User Data & Core UI States
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
    // Batch 2: Progress & Chart States
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
    // Batch 3: Journey Tab States
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
    // Batch 4: Tasks Tab States
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
    // Batch 5: Connect Tab States
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
    // Batch 6: Resources & Notifications
    resources,
    setResources,
    notifications,
    setNotifications,
    unreadCount,
    setUnreadCount,
    // Batch 7: Modals & Forms
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
    // Batch 8: Mobile Interactions
    pulling,
    setPulling,
    pullDistance,
    setPullDistance,
    refreshing,
    setRefreshing,
    pullStartY,
    contentRef,
    listenersRef
  } = useAppContext();

  // ═══════════════════════════════════════════════════════════
  // ALL STATE NOW IN CONTEXT - NO LOCAL STATE REMAINING
  // ═══════════════════════════════════════════════════════════

  // ==========================================
  // JOURNEY TAB - SWIPEABLE CARD HANDLERS
  // ==========================================
  // TOUCH HANDLERS - Extracted to /Index/shared/touchHandlers.js
  // ==========================================

  // Life Tab Touch Handlers
  const {
    handleLifeTouchStart,
    handleLifeTouchMove,
    handleLifeTouchEnd
  } = window.GLRSApp.shared.touchHandlers.createLifeTouchHandlers(lifeTouchStart, lifeTouchEnd, lifeCardIndex, setLifeTouchStart, setLifeTouchEnd, setLifeIsDragging, setLifeCardIndex);

  // Finances Tab Touch Handlers
  const {
    handleFinancesTouchStart,
    handleFinancesTouchMove,
    handleFinancesTouchEnd
  } = window.GLRSApp.shared.touchHandlers.createFinancesTouchHandlers(financesTouchStart, financesTouchEnd, financesCardIndex, setFinancesTouchStart, setFinancesTouchEnd, setFinancesIsDragging, setFinancesCardIndex);

  // Wellness Tab Touch Handlers
  const {
    handleWellnessTouchStart,
    handleWellnessTouchMove,
    handleWellnessTouchEnd
  } = window.GLRSApp.shared.touchHandlers.createWellnessTouchHandlers(wellnessTouchStart, wellnessTouchEnd, wellnessCardIndex, setWellnessTouchStart, setWellnessTouchEnd, setWellnessIsDragging, setWellnessCardIndex);

  // ==========================================
  // PULL-TO-REFRESH FUNCTIONALITY - Using custom hook
  // ==========================================

  const {
    handleRefresh,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd
  } = window.GLRSApp.hooks.usePullToRefresh({
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
  });

  // ==========================================
  // CUSTOM HOOKS: Lifecycle & Data Management
  // ==========================================

  // Load all data and setup real-time listeners on mount
  window.GLRSApp.hooks.useDataLoading(user, db, listenersRef, broadcastDismissed, {
    setNotifications,
    setUnreadCount,
    setCommunityMessages,
    setActiveBroadcast
  }, {
    loadGoals,
    loadAssignments,
    loadHabits,
    loadTodayHabits,
    loadQuickReflections,
    loadTodayWins,
    loadGoogleConnection
  });

  // Initialize Lucide icons when view changes
  window.GLRSApp.hooks.useLucideIcons([currentView, showModal, showIncompleteTasksModal, showSidebar, showHabitTrackerModal, showQuickReflectionModal, showThisWeekTasksModal, showOverdueItemsModal, showMarkCompleteModal, showProgressStatsModal, showGoalProgressModal, showTodayWinsModal, showHabitHistory, showReflectionHistory, showWinsHistory, lifeCardIndex]);

  // Calculate sobriety days and money saved
  window.GLRSApp.hooks.useSobrietyCalculation(userData, setSobrietyDays, setMoneySaved);

  // Re-initialize Lucide icons when modals open
  window.GLRSApp.hooks.useModalIcons(showModal);

  // Re-initialize Lucide icons when switching Journey tabs
  window.GLRSApp.hooks.useJourneyTabIcons(currentView, journeyTab);

  // Load Finances data from Firestore
  window.GLRSApp.hooks.useSavingsData(user, db, setSavingsItems, setSavingsGoals, setMoneyMapStops, setActiveSavingsGoal, setActualMoneySaved, setCustomGoalItems);

  // Save user's savings preferences to Firestore
  window.GLRSApp.hooks.useSavingsPreferences(user, db, activeSavingsGoal, actualMoneySaved, customGoalItems);

  // Initialize progress charts when data changes
  window.GLRSApp.hooks.useProgressCharts(currentView, moodChartData, cravingChartData, chartRef, cravingChartRef);

  // Journey Tab Accordion Graphs - Render when wellness tab is active and graph changes
  window.GLRSApp.hooks.useJourneyWellnessGraphs(currentView, journeyTab, expandedGraph, checkIns);

  // Check profile completion
  window.GLRSApp.hooks.useProfileCompletion(userData, showModal, setShowModal, db, user);

  // Auto-refresh tasks at midnight (user's timezone)
  window.GLRSApp.hooks.useMidnightReset(user, setCheckInStatus);

  // ==========================================
  // BUSINESS LOGIC: Assignment & Goal Management
  // ==========================================

  // Complete assignment WITH REFLECTION - Using extracted utility
  const completeAssignment = async (assignmentId, goalId, reflection) => {
    await window.GLRSApp.shared.assignmentActions.completeAssignment({
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
    });
  };

  // Update goal progress - Using extracted utility
  const updateGoalProgress = async goalId => {
    await window.GLRSApp.shared.assignmentActions.updateGoalProgress({
      goalId,
      user,
      db,
      firebase
    });
  };

  // Update the send message function for GLRS Community - SAVES TO MESSAGES
  // ==========================================
  // BUSINESS LOGIC: Community & Messaging
  // ==========================================

  // Send community message - Using extracted utility
  const sendCommunityMessage = async (message, imageUrl) => {
    await window.GLRSApp.shared.messagingActions.sendCommunityMessage({
      message,
      imageUrl,
      user,
      userData,
      db,
      firebase
    });
  };

  // Send topic room message - Using extracted utility
  const sendTopicRoomMessage = async (roomId, content, imageFile = null) => {
    await window.GLRSApp.shared.messagingActions.sendTopicRoomMessage({
      roomId,
      content,
      imageFile,
      user,
      userData,
      db,
      firebase,
      setTopicRoomMessages
    });
  };

  // Enter topic room - Using extracted utility
  const enterTopicRoom = async room => {
    await window.GLRSApp.shared.messagingActions.enterTopicRoom({
      room,
      db,
      setActiveTopicRoom,
      setTopicRoomMessages,
      setShowModal
    });
  };

  // Handle SOS trigger

  // ==========================================
  // BUSINESS LOGIC: Emergency & Crisis
  // ==========================================

  const triggerSOS = async () => {
    await window.GLRSApp.shared.emergencyActions.triggerSOS({
      user,
      userData,
      db,
      firebase
    });
  };

  // Update the handleImageSelect function to use the new handler

  // ==========================================
  // BUSINESS LOGIC: UI Actions
  // ==========================================

  const handleImageSelect = e => {
    window.GLRSApp.shared.uiActions.handleImageSelect(e);
  };

  // Export data as JSON

  // ==========================================
  // BUSINESS LOGIC: Data Export
  // ==========================================

  const exportDataAsJSON = () => {
    window.GLRSApp.shared.exportActions.exportDataAsJSON({
      userData,
      checkIns,
      goals,
      assignments,
      sobrietyDays,
      checkInStreak,
      complianceRate
    });
  };

  // Export data as PDF with comprehensive data

  const exportDataAsPDF = () => {
    window.GLRSApp.shared.exportActions.exportDataAsPDF({
      userData,
      user,
      sobrietyDays,
      moneySaved,
      checkInStreak,
      complianceRate,
      checkIns,
      goals
    });
  };

  // ==========================================
  // BUSINESS LOGIC: Notifications
  // ==========================================

  const markNotificationAsRead = async notificationId => {
    await window.GLRSApp.shared.notificationActions.markNotificationAsRead({
      notificationId,
      db,
      firebase
    });
  };

  // Mark all notifications as read

  const markAllNotificationsAsRead = async () => {
    await window.GLRSApp.shared.notificationActions.markAllNotificationsAsRead({
      notifications,
      db,
      firebase
    });
  };

  // Dismiss broadcast

  const dismissBroadcast = () => {
    window.GLRSApp.shared.uiActions.dismissBroadcast({
      setBroadcastDismissed,
      setActiveBroadcast
    });
  };

  // ========================================
  // PATTERN DETECTION ALGORITHMS
  // ========================================
  // PATTERN DETECTION - Extracted to /Index/shared/patternDetection.js
  // ========================================

  // Run pattern detection on check-ins data
  window.GLRSApp.hooks.usePatternDetection(checkIns, setPatternDetection);

  // ==========================================
  // LOADING STATE CHECK
  // ==========================================

  if (loading) {
    return React.createElement(window.GLRSApp.components.LoadingSpinner, {
      message: 'Loading your recovery dashboard...'
    });
  }

  // ==========================================
  // MODAL ROUTER FUNCTION - REMOVED (duplicate declaration)
  // Using centralized showModal state at line 233 instead
  // ==========================================

  // ==========================================
  // ✅ PHASE 8C-6: APP OBJECT REMOVED
  // All components now use Context API via useAppContext()
  // No longer need to pass app object as props
  // ==========================================
  // NOTE: Modal components (TasksSidebarModals, JourneyTabModals, TasksTabModals,
  // HomeTabModals, JourneyTabHomeModals) still receive individual props.
  // These will be converted to Context in future phases.

  return /*#__PURE__*/React.createElement("div", {
    className: "app-container"
  }, React.createElement(window.GLRSApp.components.HeaderBar), React.createElement(window.GLRSApp.components.PullToRefreshIndicator), React.createElement(window.GLRSApp.components.MainContent, {
    contentRef,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd
  }), React.createElement(window.GLRSApp.components.LegalFooter), React.createElement(window.GLRSApp.components.CrisisButton), React.createElement(window.GLRSApp.components.BottomNavigation), React.createElement(window.GLRSApp.components.ModalRenderer), window.GLRSApp?.components?.TasksSidebarModals && React.createElement(window.GLRSApp.components.TasksSidebarModals, {
    // Sidebar control
    showSidebar,
    setShowSidebar,
    // 8 Quick Action Modal visibility flags & setters
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
    // Additional modal visibility flags & setters
    showIntentionsModal,
    setShowIntentionsModal,
    showProgressSnapshotModal,
    setShowProgressSnapshotModal,
    showPastIntentionsModal,
    setShowPastIntentionsModal,
    // Streak modals
    showStreaksModal,
    setShowStreaksModal,
    showReflectionStreaksModal,
    setShowReflectionStreaksModal,
    // Data props
    user: userData,
    goals,
    objectives: [],
    assignments,
    habits,
    todayHabits,
    quickReflections,
    todayWins,
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
    currentReflection: null,
    pastIntentions: [],
    graphDateRange,
    setGraphDateRange,
    selectedRange,
    setSelectedRange,
    activeGoals: goals.filter(g => g.status === 'active'),
    activeObjectives: [],
    activeAssignments: assignments.filter(a => a.status !== 'completed'),
    completionRate: 0,
    completedAssignments: assignments.filter(a => a.status === 'completed').length,
    totalAssignments: assignments.length,
    streakData,
    reflectionStreakData,
    // Functions
    shareToCommunity: () => {},
    triggerHaptic,
    exportGraphsToPDF: () => {},
    shareGraphsPDF: () => {}
  }), window.GLRSApp?.components?.JourneyTabModals && React.createElement(window.GLRSApp.components.JourneyTabModals, {
    // Modal Visibility Flags (28)
    showWeeklyReportModal,
    showStreakModal,
    showCalendarHeatmapModal,
    showReflectionStreakModal,
    showMoodInsightsModal,
    showOverallDayInsightsModal,
    showGratitudeThemesModal,
    showGratitudeJournalModal,
    showChallengesHistoryModal,
    showChallengeCheckInModal,
    showBreakthroughModal,
    showTomorrowGoalsModal,
    showJourneyCalendarModal,
    showGraphSettingsModal,
    showIncompleteTasksModal,
    // Modal Setters (28 - excluding orphaned setShowMilestoneModal)
    setShowWeeklyReportModal,
    setShowStreakModal,
    setShowCalendarHeatmapModal,
    setShowReflectionStreakModal,
    setShowMoodInsightsModal,
    setShowOverallDayInsightsModal,
    setShowGratitudeThemesModal,
    setShowGratitudeJournalModal,
    setShowChallengesHistoryModal,
    setShowChallengeCheckInModal,
    setShowBreakthroughModal,
    setShowTomorrowGoalsModal,
    setShowJourneyCalendarModal,
    setShowGraphSettingsModal,
    setShowIncompleteTasksModal,
    // Data Props (22 - with aliases and placeholders)
    checkInData,
    checkInStatus,
    reflectionData,
    assignments,
    coachNotes,
    userData,
    user: userData,
    sobrietyDate: userData?.sobrietyStartDate || '',
    goals,
    challenges: challengesHistoryData,
    habits,
    intentions: [],
    tasks: [],
    wins: [],
    breakthroughs: breakthroughData,
    gratitudeEntries: gratitudeJournalData,
    moodData: moodWeekData,
    overallDayData: overallDayWeekData,
    streakData,
    calendarData: calendarHeatmapData,
    graphSettings: {},
    progressData: {},
    // Function Props (11 - with stubs for missing)
    triggerHaptic,
    setCurrentView,
    saveReflection: () => {},
    saveChallengeCheckIn: () => {},
    saveBreakthrough: () => {},
    saveTomorrowGoals: () => {},
    saveIntention: () => {},
    saveWin: () => {},
    markTaskComplete: () => {},
    updateGraphSettings: () => {},
    updateHabit: () => {},
    // UI State
    showSidebar,
    showHabitHistory,
    setShowHabitHistory
  }), window.GLRSApp?.components?.TasksTabModals && React.createElement(window.GLRSApp.components.TasksTabModals, {
    // Visibility state props
    showMoodPatternModal,
    showCravingPatternModal,
    showAnxietyPatternModal,
    showSleepPatternModal,
    showTipsModal,
    showCopingTechniqueModal,
    showMilestoneModal,
    showPastReflectionsModal,
    showGratitudeModal,
    // Close handler props
    setShowMoodPatternModal,
    setShowCravingPatternModal,
    setShowAnxietyPatternModal,
    setShowSleepPatternModal,
    setShowTipsModal,
    setShowCopingTechniqueModal,
    setShowMilestoneModal,
    setShowPastReflectionsModal,
    setShowGratitudeModal,
    // Data props
    patternDetection,
    copingTechniques: window.GLRSApp.staticData.copingTechniques,
    user: userData,
    sobrietyDate: userData?.sobrietyStartDate || '',
    allMilestones,
    nextMilestone,
    reflectionData,
    reflectionFilter,
    setReflectionFilter,
    selectedReflection,
    setSelectedReflection,
    gratitudeThemes: window.GLRSApp.staticData.gratitudeThemes,
    gratitudeTheme,
    setGratitudeTheme,
    gratitudeText,
    setGratitudeText,
    // Function props
    triggerHaptic,
    setCurrentView,
    saveGratitude: window.GLRSApp.handlers?.saveGratitude || (() => {})
  })); // Close return statement (opening at line 6075)
} // Close PIRApp function (opening at line 2)

// ═══════════════════════════════════════════════════════════
// WRAPPER COMPONENT: PIRApp with Context Provider
// ═══════════════════════════════════════════════════════════

function PIRAppWithContext({
  user
}) {
  return /*#__PURE__*/React.createElement(AppProvider, {
    user: user
  }, /*#__PURE__*/React.createElement(PIRApp, {
    user: user
  }));
}

// Expose wrapped component to global namespace
window.GLRSApp.components.PIRApp = PIRAppWithContext;

// Backward compatibility
window.PIRApp = PIRAppWithContext;

// Also expose unwrapped component for direct use if needed
window.GLRSApp.components.PIRAppUnwrapped = PIRApp;
console.log('✅ PIRApp.js loaded - Main app component available with Context API');
