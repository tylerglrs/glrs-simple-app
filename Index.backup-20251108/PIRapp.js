// Main PIR App Component
function PIRApp({ user }) {
    // CORRECTED NAVIGATION ORDER: Tasks-Journey-Home-Connect-Guides-Notifications
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
    const [checkInStatus, setCheckInStatus] = useState({ morning: false, evening: false });
    const [checkInStreak, setCheckInStreak] = useState(0);
    const [streakCheckIns, setStreakCheckIns] = useState([]);
    const [complianceRate, setComplianceRate] = useState({ checkIn: 0, assignment: 0 });
    const [totalCheckIns, setTotalCheckIns] = useState(0);
    const [googleConnected, setGoogleConnected] = useState(false);
    const [googleToken, setGoogleToken] = useState(null);
    const [googleTokenExpiry, setGoogleTokenExpiry] = useState(null);
    const [syncingGoogle, setSyncingGoogle] = useState(false);
    
    // Progress States
    const [checkIns, setCheckIns] = useState([]);
    const [moodChartData, setMoodChartData] = useState(null);
    const [cravingChartData, setCravingChartData] = useState(null);
    const chartRef = useRef(null);
    const cravingChartRef = useRef(null);
    const [anxietyChartData, setAnxietyChartData] = useState(null);
    const anxietyChartRef = useRef(null);
    const [sleepChartData, setSleepChartData] = useState(null);
    const sleepChartRef = useRef(null);

    // Journey Tab - Life Card States
    const [lifeCardIndex, setLifeCardIndex] = useState(0);
    const [lifeIsDragging, setLifeIsDragging] = useState(false);
    const [lifeTouchStart, setLifeTouchStart] = useState(0);
    const [lifeTouchEnd, setLifeTouchEnd] = useState(0);
    const lifeCardsRef = useRef(null);

    // Journey Tab - Finances Card States
    const [financesCardIndex, setFinancesCardIndex] = useState(0);
    const [financesIsDragging, setFinancesIsDragging] = useState(false);
    const [financesTouchStart, setFinancesTouchStart] = useState(0);
    const [financesTouchEnd, setFinancesTouchEnd] = useState(0);
    const financesCardsRef = useRef(null);

    // Journey Tab - Finances Feature States
    const [savingsCarouselIndex, setSavingsCarouselIndex] = useState(0);
    const [activeSavingsGoal, setActiveSavingsGoal] = useState(null); // {name, amount, icon}
    const [actualMoneySaved, setActualMoneySaved] = useState(0);
    const [customGoalItems, setCustomGoalItems] = useState([]);
    const [tempAmount, setTempAmount] = useState('');
    const savingsCarouselRef = useRef(null);
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
    const wellnessCardsRef = useRef(null);

    // Journey Tab - Accordion Graph States
    const [expandedGraph, setExpandedGraph] = useState('mood'); // Which graph is expanded: mood, cravings, anxiety, sleep, overall
    const [missedMoodCheckIns, setMissedMoodCheckIns] = useState(0);
    const [missedCravingCheckIns, setMissedCravingCheckIns] = useState(0);
    const [missedAnxietyCheckIns, setMissedAnxietyCheckIns] = useState(0);
    const [missedSleepCheckIns, setMissedSleepCheckIns] = useState(0);
    const [missedOverallCheckIns, setMissedOverallCheckIns] = useState(0);

    // Tasks States
    const [goals, setGoals] = useState([]);
    const [assignments, setAssignments] = useState([]);
    const [showSidebar, setShowSidebar] = useState(false);
    const [dueToday, setDueToday] = useState(0); // Number of items due today
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

    // TasksTabModals specific states
    const [showMoodPatternModal, setShowMoodPatternModal] = useState(false);
    const [showCravingPatternModal, setShowCravingPatternModal] = useState(false);
    const [showAnxietyPatternModal, setShowAnxietyPatternModal] = useState(false);
    const [showSleepPatternModal, setShowSleepPatternModal] = useState(false);
    const [showTipsModal, setShowTipsModal] = useState(false);

    // Data states for modals
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

    const [activeTaskTab, setActiveTaskTab] = useState('checkin'); // checkin | reflections | golden
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
    const [patternDetection, setPatternDetection] = useState(null);
    const [calendarHeatmapData, setCalendarHeatmapData] = useState([]);
    const [selectedCalendarDay, setSelectedCalendarDay] = useState(null);
    const [calendarViewMode, setCalendarViewMode] = useState('month'); // 'week', 'month'
    const [calendarCurrentMonth, setCalendarCurrentMonth] = useState(new Date());
    const [calendarCurrentWeek, setCalendarCurrentWeek] = useState(new Date());
    const [moodWeekData, setMoodWeekData] = useState([]);
    const [streakData, setStreakData] = useState({ longestStreak: 0, currentStreak: 0, allStreaks: [] });
    const [reflectionStreakData, setReflectionStreakData] = useState({ longestStreak: 0, currentStreak: 0, allStreaks: [] });
    const [overallDayWeekData, setOverallDayWeekData] = useState([]);
    const [allMilestones, setAllMilestones] = useState([]);
    const [selectedReflection, setSelectedReflection] = useState(null);
    const [reflectionFilter, setReflectionFilter] = useState('all'); // 'all', 'week', 'month'
    const [gratitudeTheme, setGratitudeTheme] = useState('');
    const [gratitudeText, setGratitudeText] = useState('');
    const [gratitudeJournalData, setGratitudeJournalData] = useState([]);
    const [gratitudeInsights, setGratitudeInsights] = useState(null);
    const [challengesHistoryData, setChallengesHistoryData] = useState([]);
    const [challengesInsights, setChallengesInsights] = useState(null);
    const [graphDateRange, setGraphDateRange] = useState({ start: null, end: null });
    const [selectedRange, setSelectedRange] = useState('all'); // Track which date range preset is selected
    const [selectedChallenge, setSelectedChallenge] = useState(null);
    const [challengeCheckInStatus, setChallengeCheckInStatus] = useState('');
    const [challengeCheckInNotes, setChallengeCheckInNotes] = useState('');
    const [breakthroughData, setBreakthroughData] = useState(null);
    const [tomorrowGoalsData, setTomorrowGoalsData] = useState([]);
    const [goalHistory, setGoalHistory] = useState([]);
    const [yesterdayGoal, setYesterdayGoal] = useState(null);
    const [goalStatus, setGoalStatus] = useState('');
    const [goalNotes, setGoalNotes] = useState('');
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

    // Connect States
    const [activeChat, setActiveChat] = useState('main');
    const [communityMessages, setCommunityMessages] = useState([]);
    const [topicRooms, setTopicRooms] = useState([]);
    const [meetings, setMeetings] = useState([]);
    const [supportGroups, setSupportGroups] = useState([]);
    const [emergencyResources, setEmergencyResources] = useState([]);
    const [activeTopicRoom, setActiveTopicRoom] = useState(null);
    const [topicRoomMessages, setTopicRoomMessages] = useState([]);
    
    // Profile States
    const [resources, setResources] = useState({
        videos: [],
        articles: [],
        tools: [],
        worksheets: []
    });
    
    // General States
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [showModal, setShowModal] = useState(null);
    const fileInputRef = useRef(null);

    // Phase 2: App Store Compliance Modals
    const [showTermsModal, setShowTermsModal] = useState(false);
    const [showPrivacyModal, setShowPrivacyModal] = useState(false);
    const [showDataHandlingModal, setShowDataHandlingModal] = useState(false);
    const [showCrisisModal, setShowCrisisModal] = useState(false);
    const [showDisclaimerModal, setShowDisclaimerModal] = useState(() => {
        return !localStorage.getItem('disclaimerAccepted');
    });

    // Phase 2: Mobile Interactions States
    const [pulling, setPulling] = useState(false);
    const [pullDistance, setPullDistance] = useState(0);
    const [refreshing, setRefreshing] = useState(false);
    const pullStartY = useRef(0);
    const contentRef = useRef(null);

    // 31 Daily Coping Techniques (Evidence-Based)
    const copingTechniques = [
        { day: 1, category: 'Breathing', title: 'Box Breathing', icon: 'wind', description: '1. Breathe in slowly for 4 counts\n2. Hold your breath for 4 counts\n3. Breathe out slowly for 4 counts\n4. Hold empty lungs for 4 counts\n5. Repeat for 5 minutes\n\nUsed by Navy SEALs to stay calm under pressure.' },
        { day: 2, category: 'Grounding', title: '5-4-3-2-1 Grounding', icon: 'eye', description: 'Notice and name aloud:\n\n5 things you can SEE\n4 things you can TOUCH\n3 things you can HEAR\n2 things you can SMELL\n1 thing you can TASTE\n\nBrings you back to the present moment when feeling overwhelmed.' },
        { day: 3, category: 'CBT', title: 'Thought Record', icon: 'file-text', description: '1. Write down the triggering situation\n2. Identify the automatic negative thought\n3. Note the emotions and intensity (1-10)\n4. Find evidence FOR the thought\n5. Find evidence AGAINST the thought\n6. Create a balanced alternative thought\n\nChallenges cognitive distortions.' },
        { day: 4, category: 'DBT', title: 'TIPP Skill', icon: 'thermometer', description: 'Temperature: Hold ice or splash cold water on face\nIntense exercise: Do 60 seconds of jumping jacks\nPaced breathing: Slow exhales longer than inhales\nProgressive muscle relaxation: Tense and release muscles\n\nQuickly reduces intense emotions in crisis.' },
        { day: 5, category: 'Mindfulness', title: 'Body Scan Meditation', icon: 'scan', description: '1. Lie down or sit comfortably\n2. Close your eyes\n3. Focus attention on your toes\n4. Slowly move awareness up through:\n   - Feet, ankles, calves, knees\n   - Thighs, hips, stomach\n   - Chest, shoulders, arms\n   - Neck, face, head\n5. Notice sensations without judgment\n\n10-minute practice.' },
        { day: 6, category: 'Anger Management', title: 'Timeout Technique', icon: 'pause-circle', description: '1. Notice anger rising (physical cues)\n2. Say "I need a timeout" out loud\n3. Leave the situation for 20 minutes\n4. Do calming activity (walk, breathe, music)\n5. Return when calm enough to discuss\n\nPrevents regrettable angry outbursts.' },
        { day: 7, category: 'Anxiety', title: 'Worry Time Schedule', icon: 'clock', description: '1. Schedule 15 minutes daily for worrying\n2. When worries arise during day, write them down\n3. Tell yourself "I\'ll think about this at 3pm"\n4. During worry time, review list and problem-solve\n5. After 15 minutes, close the list\n\nContains anxiety to specific time.' },
        { day: 8, category: 'Breathing', title: '4-7-8 Breathing', icon: 'wind', description: '1. Exhale completely through mouth\n2. Close mouth, inhale through nose for 4 counts\n3. Hold breath for 7 counts\n4. Exhale completely through mouth for 8 counts\n5. Repeat 4 cycles\n\nDr. Andrew Weil\'s natural tranquilizer.' },
        { day: 9, category: 'Grounding', title: 'Physical Grounding', icon: 'anchor', description: '1. Plant both feet firmly on ground\n2. Press feet down, feel the floor\n3. Notice the weight of your body\n4. Touch something nearby (wall, chair)\n5. Feel the texture and temperature\n6. Say "I am here, I am safe"\n\nAnchors you when dissociating.' },
        { day: 10, category: 'CBT', title: 'Cognitive Reframing', icon: 'refresh-cw', description: 'OLD THOUGHT: "I\'m a total failure"\nREFRAME: "I made a mistake, and I can learn from it"\n\nOLD: "Nobody likes me"\nREFRAME: "Some people like me, I can build connections"\n\nOLD: "I can\'t handle this"\nREFRAME: "This is hard, but I\'ve handled hard things before"\n\nReplace absolutes with balanced thoughts.' },
        { day: 11, category: 'DBT', title: 'STOP Skill', icon: 'octagon', description: 'S - STOP: Freeze, don\'t react\nT - TAKE A STEP BACK: Get space from situation\nO - OBSERVE: Notice thoughts, feelings, facts\nP - PROCEED MINDFULLY: What\'s effective here?\n\nPrevents impulsive reactions.' },
        { day: 12, category: 'Mindfulness', title: 'Mindful Walking', icon: 'footprints', description: '1. Walk slowly and deliberately\n2. Notice the sensation of each foot lifting\n3. Feel your foot moving through air\n4. Notice the foot touching ground\n5. Feel weight shifting to that foot\n6. Repeat with other foot\n\nWalk for 10 minutes focusing only on steps.' },
        { day: 13, category: 'Anger Management', title: 'Anger Ladder', icon: 'bar-chart-2', description: 'Rate your anger 1-10:\n\n1-3: Annoyed (deep breath, let it go)\n4-6: Frustrated (take a break, talk it out)\n7-8: Angry (use timeout, physical activity)\n9-10: Furious (immediate safety plan, call support)\n\nKnow your number, match your response.' },
        { day: 14, category: 'Anxiety', title: 'Progressive Muscle Relaxation', icon: 'activity', description: '1. Tense fists for 5 seconds, release\n2. Tense arms for 5 seconds, release\n3. Tense shoulders for 5 seconds, release\n4. Tense face for 5 seconds, release\n5. Tense stomach for 5 seconds, release\n6. Tense legs for 5 seconds, release\n7. Tense feet for 5 seconds, release\n\nReleases physical tension from anxiety.' },
        { day: 15, category: 'Breathing', title: 'Diaphragmatic Breathing', icon: 'wind', description: '1. Place one hand on chest, one on belly\n2. Breathe in through nose for 4 counts\n3. Belly should rise, chest stays still\n4. Exhale through mouth for 6 counts\n5. Belly should fall\n6. Repeat for 5 minutes\n\nActivates parasympathetic nervous system.' },
        { day: 16, category: 'Grounding', title: 'Categories Game', icon: 'list', description: 'Choose a category and name items:\n\n- 10 US states\n- 10 animals\n- 10 foods\n- 10 movies\n- 10 song titles\n\nSay them out loud. Engages logical brain, reduces emotional overwhelm.' },
        { day: 17, category: 'CBT', title: 'Decatastrophizing', icon: 'alert-triangle', description: 'WORST CASE: What\'s the absolute worst that could happen?\nBEST CASE: What\'s the best possible outcome?\nMOST LIKELY: What will probably actually happen?\n\nReality is usually in the middle. Reduces catastrophic thinking.' },
        { day: 18, category: 'DBT', title: 'DEAR MAN', icon: 'message-square', description: 'Describe the situation\nExpress your feelings\nAssert your needs\nReinforce (why they should help)\n\nstay Mindful (don\'t get distracted)\nAppear confident\nNegotiate (be willing to compromise)\n\nEffective interpersonal communication.' },
        { day: 19, category: 'Mindfulness', title: 'Mindful Eating', icon: 'coffee', description: '1. Choose one food (raisin, chocolate, fruit)\n2. Look at it closely for 30 seconds\n3. Smell it for 30 seconds\n4. Feel the texture for 30 seconds\n5. Place in mouth without chewing (30 sec)\n6. Chew slowly, noticing flavors\n7. Swallow mindfully\n\nPractices being fully present.' },
        { day: 20, category: 'Anger Management', title: 'Opposite Action', icon: 'repeat', description: 'When anger urges you to:\n\nYELL → Speak softly\nATTACK → Step away\nBLAME → Take responsibility\nBREAK THINGS → Hold something gently\n\nDoing the opposite reduces anger\'s intensity.' },
        { day: 21, category: 'Anxiety', title: 'Exposure Ladder', icon: 'trending-up', description: '1. List feared situation (1-10 difficulty)\n2. Start with easiest (difficulty 2-3)\n3. Face that situation repeatedly\n4. When anxiety drops 50%, move to next step\n5. Gradually work up the ladder\n\nGradual exposure builds confidence.' },
        { day: 22, category: 'Breathing', title: 'Alternate Nostril Breathing', icon: 'wind', description: '1. Close right nostril with thumb\n2. Inhale through left nostril (4 counts)\n3. Close left nostril with ring finger\n4. Exhale through right nostril (4 counts)\n5. Inhale through right nostril (4 counts)\n6. Switch, exhale through left\n7. Repeat 5 minutes\n\nBalances nervous system.' },
        { day: 23, category: 'Grounding', title: 'Safe Place Visualization', icon: 'home', description: '1. Close your eyes\n2. Picture a place where you feel completely safe\n3. Notice every detail: colors, sounds, smells\n4. Feel the safety in your body\n5. Create a cue word (e.g., "beach")\n6. Practice daily\n7. Use cue word in crisis\n\nMental safe space always available.' },
        { day: 24, category: 'CBT', title: 'Cost-Benefit Analysis', icon: 'scale', description: 'For any belief or behavior:\n\nCOSTS:\n- What are the disadvantages?\n- What does it cost me?\n\nBENEFITS:\n- What are the advantages?\n- What do I gain?\n\nMakes unconscious patterns conscious.' },
        { day: 25, category: 'DBT', title: 'Radical Acceptance', icon: 'check-circle', description: 'What it is:\n- Accepting reality as it is\n- Not approving or liking it\n- Stopping the fight with reality\n\n"I can\'t change what happened, AND I can choose how I respond now."\n\nReduces suffering from non-acceptance.' },
        { day: 26, category: 'Mindfulness', title: 'Loving-Kindness Meditation', icon: 'heart', description: 'Repeat silently:\n\n"May I be safe\nMay I be healthy\nMay I be happy\nMay I live with ease"\n\nThen wish same for:\n- Someone you love\n- Someone neutral\n- Someone difficult\n- All beings\n\nBuilds self-compassion.' },
        { day: 27, category: 'Anger Management', title: 'Anger Journal', icon: 'book', description: 'After anger episode, write:\n\n1. TRIGGER: What happened right before?\n2. THOUGHTS: What was I thinking?\n3. FEELINGS: What did I feel in my body?\n4. ACTIONS: What did I do?\n5. CONSEQUENCES: What happened as a result?\n6. ALTERNATIVE: What could I do differently?\n\nIdentifies patterns over time.' },
        { day: 28, category: 'Anxiety', title: 'Thought Stopping', icon: 'x-circle', description: '1. When anxious thought starts, yell "STOP!" (or picture a stop sign)\n2. Snap a rubber band on wrist (or clap)\n3. Replace with planned positive thought\n4. Engage in physical activity\n\nInterrupts rumination cycle.' },
        { day: 29, category: 'Breathing', title: 'Resonant Breathing', icon: 'wind', description: '1. Breathe at rate of 6 breaths per minute\n2. Inhale for 5 seconds\n3. Exhale for 5 seconds\n4. Keep rhythm steady\n5. Practice for 10-20 minutes\n\nOptimizes heart rate variability, reduces stress.' },
        { day: 30, category: 'Grounding', title: 'Cold Water Grounding', icon: 'droplet', description: '1. Hold ice cube in your hand\n2. Splash cold water on your face\n3. Take a cold shower\n4. Drink ice water slowly\n\nPhysical sensation brings immediate presence. Activates dive reflex, calms nervous system.' },
        { day: 31, category: 'CBT', title: 'Evidence Gathering', icon: 'search', description: 'BELIEF: "Everyone thinks I\'m incompetent"\n\nEVIDENCE FOR:\n- (list objective facts only)\n\nEVIDENCE AGAINST:\n- (list objective facts only)\n\nNEW BALANCED BELIEF:\n- Based on all evidence\n\nTests beliefs against reality.' }
    ];

    // Gratitude themes (12 categories)
    const gratitudeThemes = [
        { id: 'relationships', label: 'Relationships', icon: 'users', color: '#FF6B6B' },
        { id: 'health', label: 'Health & Wellness', icon: 'heart', color: '#4ECDC4' },
        { id: 'nature', label: 'Nature & Environment', icon: 'sun', color: '#95E1D3' },
        { id: 'personal', label: 'Personal Growth', icon: 'trending-up', color: '#F38181' },
        { id: 'moments', label: 'Small Moments', icon: 'smile', color: '#FFD93D' },
        { id: 'opportunities', label: 'Opportunities', icon: 'target', color: '#6BCB77' },
        { id: 'comfort', label: 'Comfort & Safety', icon: 'shield', color: '#4D96FF' },
        { id: 'accomplishments', label: 'Accomplishments', icon: 'award', color: '#9D84B7' },
        { id: 'support', label: 'Support & Help', icon: 'life-buoy', color: '#FFA500' },
        { id: 'creativity', label: 'Creativity & Expression', icon: 'palette', color: '#E74C3C' },
        { id: 'simple', label: 'Simple Pleasures', icon: 'coffee', color: '#795548' },
        { id: 'other', label: 'Other', icon: 'more-horizontal', color: '#999999' }
    ];

    // Real-time listeners references
    const listenersRef = useRef([]);

    // ==========================================
    // GOOGLE CALENDAR INTEGRATION - PIR SIDE
    // ==========================================

    // Simple encryption/decryption for token storage
    const encryptToken = (token) => {
        try {
            // Base64 encode with user-specific salt
            const salt = user.uid.substring(0, 8);
            const combined = salt + token + salt;
            return btoa(combined);
        } catch (error) {
            return token; // Fallback to plain if encryption fails
        }
    };

    const decryptToken = (encryptedToken) => {
        try {
            const salt = user.uid.substring(0, 8);
            const decoded = atob(encryptedToken);
            // Remove salt from both ends
            return decoded.substring(salt.length, decoded.length - salt.length);
        } catch (error) {
            return encryptedToken; // Fallback if decryption fails
        }
    };

    // Load Google connection status on mount
    const loadGoogleConnection = async () => {
        try {
            const userDoc = await db.collection('users').doc(user.uid).get();
            const data = userDoc.data();
            
            if (data?.googleConnected && data?.googleAccessToken) {
                setGoogleConnected(true);
                
                // Decrypt token
                const decrypted = decryptToken(data.googleAccessToken);
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
                showNotification('Refreshing Google Calendar connection...', 'info');
                
                // Attempt to refresh token
                const refreshed = await refreshGoogleToken();
                
                if (!refreshed) {
                    // Show error banner
                    showNotification(
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
            showNotification('Error validating Google Calendar connection', 'error');
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
                        const encryptedToken = encryptToken(tokenResponse.access_token);
                        
                        
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
                        
                        showNotification('Google Calendar Connected!', 'success');
                        
                        // Close modal and reload
                        setShowModal(null);
                        setTimeout(() => loadGoogleConnection(), 500);
                        
                    } catch (error) {
                        showNotification('Failed to save connection: ' + error.message, 'error');
                    } finally {
                        setSyncingGoogle(false);
                    }
                },
            });
            
            // Request access token
            tokenClient.requestAccessToken({ prompt: 'consent' });
            
        } catch (error) {
            showNotification('Failed to connect: ' + error.message, 'error');
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
            
            showNotification('Google Calendar disconnected', 'success');
            setShowModal(null);
            
        } catch (error) {
            showNotification('Failed to disconnect: ' + error.message, 'error');
        } finally {
            setSyncingGoogle(false);
        }
    };

    // ==========================================
    // END GOOGLE CALENDAR INTEGRATION
    // ==========================================

    // ==========================================
    // JOURNEY TAB - SWIPEABLE CARD HANDLERS
    // ==========================================

    // Life Tab Touch Handlers
    const handleLifeTouchStart = (e) => {
        setLifeTouchStart(e.targetTouches[0].clientX);
        setLifeIsDragging(true);
    };

    const handleLifeTouchMove = (e) => {
        setLifeTouchEnd(e.targetTouches[0].clientX);
    };

    const handleLifeTouchEnd = () => {
        if (!lifeTouchStart || !lifeTouchEnd) return;

        const distance = lifeTouchStart - lifeTouchEnd;
        const threshold = 50; // Minimum swipe distance

        if (distance > threshold && lifeCardIndex < 2) {
            // Swipe left - next card
            setLifeCardIndex(lifeCardIndex + 1);
            triggerHaptic('light');
        } else if (distance < -threshold && lifeCardIndex > 0) {
            // Swipe right - previous card
            setLifeCardIndex(lifeCardIndex - 1);
            triggerHaptic('light');
        }

        setLifeIsDragging(false);
        setLifeTouchStart(0);
        setLifeTouchEnd(0);
    };

    // Finances Tab Touch Handlers
    const handleFinancesTouchStart = (e) => {
        setFinancesTouchStart(e.targetTouches[0].clientX);
        setFinancesIsDragging(true);
    };

    const handleFinancesTouchMove = (e) => {
        setFinancesTouchEnd(e.targetTouches[0].clientX);
    };

    const handleFinancesTouchEnd = () => {
        if (!financesTouchStart || !financesTouchEnd) return;

        const distance = financesTouchStart - financesTouchEnd;
        const threshold = 50;

        if (distance > threshold && financesCardIndex < 2) {
            setFinancesCardIndex(financesCardIndex + 1);
            triggerHaptic('light');
        } else if (distance < -threshold && financesCardIndex > 0) {
            setFinancesCardIndex(financesCardIndex - 1);
            triggerHaptic('light');
        }

        setFinancesIsDragging(false);
        setFinancesTouchStart(0);
        setFinancesTouchEnd(0);
    };

    // Wellness Tab Touch Handlers
    const handleWellnessTouchStart = (e) => {
        setWellnessTouchStart(e.targetTouches[0].clientX);
        setWellnessIsDragging(true);
    };

    const handleWellnessTouchMove = (e) => {
        setWellnessTouchEnd(e.targetTouches[0].clientX);
    };

    const handleWellnessTouchEnd = () => {
        if (!wellnessTouchStart || !wellnessTouchEnd) return;

        const distance = wellnessTouchStart - wellnessTouchEnd;
        const threshold = 50;

        if (distance > threshold && wellnessCardIndex < 2) {
            setWellnessCardIndex(wellnessCardIndex + 1);
            triggerHaptic('light');
        } else if (distance < -threshold && wellnessCardIndex > 0) {
            setWellnessCardIndex(wellnessCardIndex - 1);
            triggerHaptic('light');
        }

        setWellnessIsDragging(false);
        setWellnessTouchStart(0);
        setWellnessTouchEnd(0);
    };

    // ==========================================
    // PHASE 2: PULL-TO-REFRESH FUNCTIONALITY
    // ==========================================

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
            showNotification('Refreshed', 'success');

        } catch (error) {
            showNotification('Refresh failed', 'error');
        } finally {
            setRefreshing(false);
            setPullDistance(0);
            setPulling(false);
        }
    };

    const handleTouchStart = (e) => {
        if (!contentRef.current) return;
        const scrollTop = contentRef.current.scrollTop;

        // Only allow pull-to-refresh when at the top
        if (scrollTop === 0) {
            pullStartY.current = e.touches[0].clientY;
        }
    };

    const handleTouchMove = (e) => {
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

    // ==========================================
    // END PULL-TO-REFRESH
    // ==========================================

    // ==========================================
    // HAPTIC FEEDBACK - Using global window.triggerHaptic from helpers.js
    // ==========================================

    // Load all data on mount
    useEffect(() => {
        if (user) {
            loadAllData();
            setupRealtimeListeners();
            loadGoogleConnection();
        }

        return () => {
            // Cleanup listeners
            listenersRef.current.forEach(unsubscribe => unsubscribe());
        };
    }, [user]);

    // Initialize Lucide icons - CRITICAL: Re-run whenever view changes
    useEffect(() => {
        if (typeof lucide !== 'undefined') {
            // Use setTimeout to ensure React finishes rendering before creating icons
            // Increased delay to 100ms to ensure all DOM updates complete
            setTimeout(() => {
                lucide.createIcons();
            }, 100);
        }
    }, [currentView, showModal, showIncompleteTasksModal, showSidebar, showHabitTrackerModal, showQuickReflectionModal, showThisWeekTasksModal, showOverdueItemsModal, showMarkCompleteModal, showProgressStatsModal, showGoalProgressModal, showTodayWinsModal, showHabitHistory, showReflectionHistory, showWinsHistory, lifeCardIndex]);

    // Setup real-time listeners
    const setupRealtimeListeners = () => {
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

    // FIXED: Complete sobriety days calculation function
    const calculateSobrietyDays = (sobrietyDate) => {
        if (!sobrietyDate) return 0;

        // Parse as LOCAL date
        const [year, month, day] = sobrietyDate.split('-');
        const sobrietyDateObj = new Date(parseInt(year), parseInt(month) - 1, parseInt(day), 0, 0, 0, 0);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // FIXED: Convert both to UTC to avoid DST issues
        // DST causes 1-hour difference between PST and PDT which affects millisecond calculations
        const sobrietyUTC = Date.UTC(sobrietyDateObj.getFullYear(), sobrietyDateObj.getMonth(), sobrietyDateObj.getDate());
        const todayUTC = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());

        // Calculate difference in milliseconds (now DST-proof)
        const diffTime = todayUTC - sobrietyUTC;

        // Convert to days and add 1 (because day 1 is the sobriety date itself)
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;

        // Return at least 1 if sobriety date is today or in the past
        return Math.max(1, diffDays);
    };

    // FIXED: Updated useEffect for sobriety calculation
    useEffect(() => {
        if (userData?.sobrietyDate) {
            const calculateStats = () => {
                const days = calculateSobrietyDays(userData.sobrietyDate);
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

    // Re-initialize Lucide icons when any modal opens
    useEffect(() => {
            // Small delay to ensure DOM is updated
            const timer = setTimeout(() => {
                if (window.lucide) {
                    window.lucide.createIcons();
                }
            }, 100);
            return () => clearTimeout(timer);
        }, [showModal]);

    // Re-initialize Lucide icons when switching Journey tabs (fixes Finances icon flickering)
    useEffect(() => {
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

    // Load Finances data from Firestore (NO HARDCODED DATA)
    useEffect(() => {
        if (!user) return;

        const loadSavingsData = async () => {
            try {
                // Load savings items
                const itemsSnapshot = await db.collection('savingsItems')
                    .orderBy('minCost', 'asc')
                    .get();

                if (!itemsSnapshot.empty) {
                    const items = itemsSnapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data()
                    }));
                    setSavingsItems(items);
                }

                // Load savings goals
                const goalsSnapshot = await db.collection('savingsGoals')
                    .orderBy('amount', 'asc')
                    .get();

                if (!goalsSnapshot.empty) {
                    const goals = goalsSnapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data()
                    }));
                    setSavingsGoals(goals);
                }

                // Load money map stops
                const stopsSnapshot = await db.collection('moneyMapStops')
                    .orderBy('amount', 'asc')
                    .get();

                if (!stopsSnapshot.empty) {
                    const stops = stopsSnapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data()
                    }));
                    setMoneyMapStops(stops);
                }

                // Load user's savings preferences
                const prefsDoc = await db.collection('users')
                    .doc(user.uid)
                    .collection('savingsPreferences')
                    .doc('current')
                    .get();

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

    // Save user's savings preferences to Firestore when they change
    useEffect(() => {
        if (!user) return;

        const savePreferences = async () => {
            try {
                await db.collection('users')
                    .doc(user.uid)
                    .collection('savingsPreferences')
                    .doc('current')
                    .set({
                        activeSavingsGoal,
                        actualMoneySaved,
                        customGoalItems,
                        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                    }, { merge: true });
            } catch (error) {
                console.error('Error saving savings preferences:', error);
            }
        };

        // Debounce saves
        const timeoutId = setTimeout(savePreferences, 1000);
        return () => clearTimeout(timeoutId);
    }, [activeSavingsGoal, actualMoneySaved, customGoalItems, user]);

    // Initialize charts when data changes
    useEffect(() => {
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

    // Journey Tab Accordion Graphs - Render when wellness tab is active and graph changes
    useEffect(() => {
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
                const labels = last31Days.map(date =>
                    date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                );

                // Helper function to find check-in for a specific date
                const findCheckInForDate = (date) => {
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
                    return checkIn?.morningData?.anxiety ?? checkIn?.morningData?.anxietyLevel ?? null;
                });

                const sleepData = last31Days.map(date => {
                    const checkIn = findCheckInForDate(date);
                    return checkIn?.morningData?.sleep ?? checkIn?.morningData?.sleepQuality ?? null;
                });

                const overallData = last31Days.map(date => {
                    const checkIn = findCheckInForDate(date);
                    return checkIn?.eveningData?.overallDay ?? null;
                });

                // Calculate missed check-ins for each metric
                const missedMood = moodData.filter(val => val === null).length;
                const missedCraving = cravingData.filter(val => val === null).length;
                const missedAnxiety = anxietyData.filter(val => val === null).length;
                const missedSleep = sleepData.filter(val => val === null).length;
                const missedOverall = overallData.filter(val => val === null).length;

                // Update state with missed check-in counts
                setMissedMoodCheckIns(missedMood);
                setMissedCravingCheckIns(missedCraving);
                setMissedAnxietyCheckIns(missedAnxiety);
                setMissedSleepCheckIns(missedSleep);
                setMissedOverallCheckIns(missedOverall);

                // Render expanded graphs
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
                                    label: 'Mood Score',
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
                                    legend: { display: false },
                                    tooltip: {
                                        enabled: true,
                                        backgroundColor: 'rgba(0,0,0,0.8)',
                                        titleColor: '#fff',
                                        bodyColor: '#fff',
                                        borderColor: '#058585',
                                        borderWidth: 1,
                                        callbacks: {
                                            label: function(context) {
                                                if (context.parsed.y === null) {
                                                    return 'Missing check-in creates gaps in your wellness picture. Stay consistent to track your progress!';
                                                }
                                                return 'Mood Score: ' + context.parsed.y;
                                            }
                                        }
                                    }
                                },
                                interaction: {
                                    mode: 'index',
                                    intersect: false
                                },
                                scales: {
                                    y: { beginAtZero: true, max: 10, ticks: { color: '#666' } },
                                    x: { ticks: { color: '#666' } }
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
                                    label: 'Craving Intensity',
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
                                    legend: { display: false },
                                    tooltip: {
                                        enabled: true,
                                        backgroundColor: 'rgba(0,0,0,0.8)',
                                        titleColor: '#fff',
                                        bodyColor: '#fff',
                                        borderColor: '#DC143C',
                                        borderWidth: 1,
                                        callbacks: {
                                            label: function(context) {
                                                if (context.parsed.y === null) {
                                                    return 'Missing check-in creates gaps in your wellness picture. Stay consistent to track your progress!';
                                                }
                                                return 'Craving Intensity: ' + context.parsed.y;
                                            }
                                        }
                                    }
                                },
                                interaction: {
                                    mode: 'index',
                                    intersect: false
                                },
                                scales: {
                                    y: { beginAtZero: true, max: 10, ticks: { color: '#666' } },
                                    x: { ticks: { color: '#666' } }
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
                                    legend: { display: false },
                                    tooltip: {
                                        enabled: true,
                                        backgroundColor: 'rgba(0,0,0,0.8)',
                                        titleColor: '#fff',
                                        bodyColor: '#fff',
                                        borderColor: '#FFA500',
                                        borderWidth: 1,
                                        callbacks: {
                                            label: function(context) {
                                                if (context.parsed.y === null) {
                                                    return 'Missing check-in creates gaps in your wellness picture. Stay consistent to track your progress!';
                                                }
                                                return 'Anxiety Level: ' + context.parsed.y;
                                            }
                                        }
                                    }
                                },
                                interaction: {
                                    mode: 'index',
                                    intersect: false
                                },
                                scales: {
                                    y: { beginAtZero: true, max: 10, ticks: { color: '#666' } },
                                    x: { ticks: { color: '#666' } }
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
                                    legend: { display: false },
                                    tooltip: {
                                        enabled: true,
                                        backgroundColor: 'rgba(0,0,0,0.8)',
                                        titleColor: '#fff',
                                        bodyColor: '#fff',
                                        borderColor: '#9c27b0',
                                        borderWidth: 1,
                                        callbacks: {
                                            label: function(context) {
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
                                    y: { beginAtZero: true, max: 10, ticks: { color: '#666' } },
                                    x: { ticks: { color: '#666' } }
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
                                    legend: { display: false },
                                    tooltip: {
                                        enabled: true,
                                        backgroundColor: 'rgba(0,0,0,0.8)',
                                        titleColor: '#fff',
                                        bodyColor: '#fff',
                                        borderColor: '#4A90E2',
                                        borderWidth: 1,
                                        callbacks: {
                                            label: function(context) {
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
                                    y: { beginAtZero: true, max: 10, ticks: { color: '#666' } },
                                    x: { ticks: { color: '#666' } }
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
                                    legend: { display: false },
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
                                    y: { beginAtZero: true, max: 10, ticks: { color: '#666' } },
                                    x: { ticks: { color: '#666' } }
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

    // Check profile completion
    useEffect(() => {
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

    // Auto-refresh tasks at midnight (user's timezone)
    // NOTE: Timezone is NEVER hardcoded - always uses user's profile setting
    useEffect(() => {
        const checkMidnightReset = () => {
            const now = new Date();
            const userTimezone = user.timezone || "America/Los_Angeles";
            const userNow = new Date(now.toLocaleString("en-US", {timeZone: userTimezone}));
            const hours = userNow.getHours();
            const minutes = userNow.getMinutes();
            const seconds = userNow.getSeconds();

            // Calculate milliseconds until midnight (user's timezone)
            const msUntilMidnight = ((23 - hours) * 60 * 60 + (59 - minutes) * 60 + (60 - seconds)) * 1000;
            
            // Set timeout for midnight reset
            const midnightTimer = setTimeout(() => {
                // Reset daily tasks
                loadDailyTasksStatus();
                loadCheckIns();
                setCheckInStatus({ morning: false, evening: false });
                
                // Set up daily interval
                const dailyInterval = setInterval(() => {
                    loadDailyTasksStatus();
                    loadCheckIns();
                    setCheckInStatus({ morning: false, evening: false });
                }, 24 * 60 * 60 * 1000); // Every 24 hours
                
                return () => clearInterval(dailyInterval);
            }, msUntilMidnight);
            
            return () => clearTimeout(midnightTimer);
        };
        
        checkMidnightReset();
    }, []);

    // FIXED: Complete loadAllData function
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
                calculateMilestones(),
                checkMilestoneNotifications(),
                loadDailyTasksStatus(),
                calculateTotalCheckIns().then(count => setTotalCheckIns(count)),
                calculateStreaks(),
                calculateReflectionStreaks()
            ]);
        } catch (error) {
        } finally {
            setLoading(false);
        }
    };

            // Load user data and coach info
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

            // Load topic rooms
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
            // Add these state variables in TopicRoom component
            // Add state for image modal (near your other state variables)
const [modalImage, setModalImage] = useState(null);

// Image Modal Component (add before the return statement)
const ImageModal = ({ imageUrl, onClose }) => {
    if (!imageUrl) return null;
    
    return (
        <div 
            onClick={onClose}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.9)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 10000,
                cursor: 'pointer'
            }}
        >
            <img 
                src={imageUrl}
                style={{
                    maxWidth: '90%',
                    maxHeight: '90%',
                    objectFit: 'contain'
                }}
                onClick={(e) => e.stopPropagation()}
            />
            <button
                onClick={onClose}
                style={{
                    position: 'absolute',
                    top: '20px',
                    right: '20px',
                    background: 'transparent',
                    border: 'none',
                    color: 'white',
                    fontSize: '30px',
                    cursor: 'pointer'
                }}
            >
                ✕
            </button>
        </div>
    );
};
// ==========================================
// PHASE 2: APP STORE COMPLIANCE MODALS
// ==========================================

// First-Launch Disclaimer Modal
const DisclaimerModal = ({ onAccept }) => {
    const [checkboxChecked, setCheckboxChecked] = useState(false);

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
            padding: '20px'
        }}>
            <div style={{
                background: '#fff',
                borderRadius: '15px',
                maxWidth: '600px',
                width: '100%',
                maxHeight: '90vh',
                overflow: 'auto'
            }}>
                <div style={{
                    padding: '30px',
                    background: 'linear-gradient(135deg, #0077CC 0%, #00A86B 100%)',
                    color: '#fff',
                    borderRadius: '15px 15px 0 0'
                }}>
                    <h2 style={{ margin: '0 0 10px 0', fontSize: '28px' }}>
                        Welcome to Recovery Compass
                    </h2>
                    <p style={{ margin: 0, fontSize: '16px', opacity: 0.9 }}>
                        Please read this important information before using the app
                    </p>
                </div>

                <div style={{ padding: '30px' }}>
                    <div style={{
                        padding: '20px',
                        background: '#fff3cd',
                        borderRadius: '10px',
                        marginBottom: '20px',
                        border: '1px solid #ffc107'
                    }}>
                        <h3 style={{ margin: '0 0 15px 0', color: '#856404' }}>
                            ⚕️ Medical Disclaimer
                        </h3>
                        <p style={{ margin: 0, fontSize: '14px', color: '#856404', lineHeight: '1.6' }}>
                            <strong>This app is NOT a substitute for professional medical advice, diagnosis, or treatment.</strong>
                            <br/><br/>
                            Recovery Compass is a recovery support tool designed to complement professional treatment.
                            It should not replace in-person therapy, medical care, or emergency services.
                            <br/><br/>
                            <strong>If you are experiencing a medical or mental health emergency, call 911 or go to the nearest emergency room immediately.</strong>
                        </p>
                    </div>

                    <div style={{
                        padding: '20px',
                        background: '#f8f9fa',
                        borderRadius: '10px',
                        marginBottom: '20px'
                    }}>
                        <h3 style={{ margin: '0 0 15px 0', color: '#333', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <i data-lucide="lock" style={{width: '20px', height: '20px', color: 'var(--color-primary)'}}></i>
                            Privacy & Confidentiality
                        </h3>
                        <p style={{ margin: 0, fontSize: '14px', color: '#666', lineHeight: '1.6' }}>
                            Your privacy is our priority. We use industry-standard encryption and HIPAA-compliant practices
                            to protect your information. However, no electronic system is 100% secure.
                            Please avoid sharing sensitive information you're not comfortable storing digitally.
                        </p>
                    </div>

                    <div style={{
                        padding: '20px',
                        background: '#f8f9fa',
                        borderRadius: '10px',
                        marginBottom: '20px'
                    }}>
                        <h3 style={{ margin: '0 0 15px 0', color: '#333', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <i data-lucide="message-circle" style={{width: '20px', height: '20px', color: 'var(--color-primary)'}}></i>
                            Peer Support Disclaimer
                        </h3>
                        <p style={{ margin: 0, fontSize: '14px', color: '#666', lineHeight: '1.6' }}>
                            Community features connect you with others in recovery. While peer support can be valuable,
                            remember that other users are not medical professionals. Always consult your healthcare provider
                            for medical advice.
                        </p>
                    </div>

                    <label style={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: '15px',
                        background: '#e7f5ff',
                        borderRadius: '10px',
                        marginBottom: '20px',
                        cursor: 'pointer'
                    }}>
                        <input
                            type="checkbox"
                            checked={checkboxChecked}
                            onChange={(e) => setCheckboxChecked(e.target.checked)}
                            style={{
                                width: '20px',
                                height: '20px',
                                marginRight: '12px',
                                cursor: 'pointer'
                            }}
                        />
                        <span style={{ fontSize: '14px', color: '#333' }}>
                            I have read and understand these disclaimers and agree to the Terms of Service and Privacy Policy
                        </span>
                    </label>

                    <button
                        onClick={() => {
                            if (!checkboxChecked) {
                                alert('Please check the box to confirm you understand and agree');
                                return;
                            }
                            onAccept();
                        }}
                        style={{
                            width: '100%',
                            background: 'linear-gradient(135deg, #0077CC 0%, #00A86B 100%)',
                            color: '#fff',
                            padding: '15px',
                            borderRadius: '8px',
                            border: 'none',
                            fontSize: '16px',
                            fontWeight: 'bold',
                            cursor: 'pointer'
                        }}
                    >
                        Continue to App
                    </button>
                </div>
            </div>
        </div>
    );
};

// Legal Modal Component (Terms, Privacy, Data Handling)
const LegalModal = ({ type, onClose }) => {
    const content = {
        terms: {
            title: 'Terms of Service',
            body: `Last Updated: January 2025

1. ACCEPTANCE OF TERMS
By accessing or using Recovery Compass, you agree to be bound by these Terms of Service.

2. SERVICE DESCRIPTION
Recovery Compass is a recovery support application designed to complement professional treatment.

3. USER RESPONSIBILITIES
- Provide accurate information
- Maintain confidentiality of your account
- Use the service responsibly and lawfully
- Not share sensitive medical information in community features

4. MEDICAL DISCLAIMER
This service is NOT a substitute for professional medical advice. Always consult healthcare providers for medical decisions.

5. PRIVACY
Your use is governed by our Privacy Policy. We protect your data using industry-standard encryption.

6. LIABILITY LIMITATION
Recovery Compass is provided "as is" without warranties. We are not liable for any damages arising from use.

7. TERMINATION
We may suspend or terminate access for violations of these terms.

8. GOVERNING LAW
These terms are governed by the laws of [Your State/Country].

9. CONTACT
For questions: support@glrecoveryservices.com`
        },
        privacy: {
            title: 'Privacy Policy',
            body: `Last Updated: January 2025

1. INFORMATION WE COLLECT
- Account information (name, email)
- Recovery data (check-ins, goals, progress)
- Usage data (features accessed, session duration)
- Device information (device type, OS version)

2. HOW WE USE YOUR INFORMATION
- Provide and improve our services
- Communicate with you about your account
- Track your recovery progress
- Personalize your experience
- Comply with legal obligations

3. INFORMATION SHARING
We DO NOT sell your personal information. We may share data only:
- With your explicit consent
- With your assigned coach/treatment team
- To comply with legal requirements
- With service providers under strict confidentiality agreements

4. DATA SECURITY
- Industry-standard encryption (AES-256)
- HIPAA-compliant practices
- Secure data transmission (HTTPS)
- Regular security audits
- Limited employee access

5. YOUR RIGHTS (GDPR/CCPA)
- Access your data
- Correct inaccurate data
- Request data deletion
- Export your data
- Opt out of communications

6. DATA RETENTION
We retain your data while your account is active and for 7 years after closure (HIPAA compliance).

7. COOKIES
We use essential cookies for functionality. No third-party advertising cookies.

8. CHILDREN'S PRIVACY
Our service is not intended for users under 13. We comply with COPPA.

9. CHANGES TO POLICY
We'll notify you of material changes via email or in-app notification.

10. CONTACT
Privacy questions: privacy@glrecoveryservices.com`
        },
        dataHandling: {
            title: 'Data Handling & Your Rights',
            body: `Last Updated: January 2025

WHAT DATA WE COLLECT

Recovery Data:
- Daily check-ins (mood, cravings, anxiety, sleep)
- Goals and assignments
- Progress tracking
- Community messages
- Resource usage

Account Data:
- Name, email, profile photo
- Subscription information
- Login history
- Device information

HOW WE PROTECT YOUR DATA

Encryption:
- AES-256 encryption for sensitive data
- Secure data transmission (HTTPS/TLS)
- Encrypted backups
- Zero-knowledge architecture (where applicable)

Access Controls:
- Role-based access (coaches see only assigned clients)
- Multi-factor authentication available
- Regular security audits
- Employee background checks

HIPAA Compliance:
- Business Associate Agreements with partners
- Regular compliance training
- Breach notification procedures
- Audit logging

YOUR RIGHTS

Access: Request a copy of your data anytime
Correction: Update inaccurate information
Deletion: Request permanent account deletion
Export: Download your data in JSON format
Portability: Transfer data to another service
Opt-out: Unsubscribe from non-essential emails

DATA RETENTION

Active Accounts: Data retained while account is active
Closed Accounts: Data retained for 7 years (HIPAA requirement)
Deletion Requests: 30-day grace period, then permanent deletion
Backups: Removed from backups within 90 days

THIRD-PARTY SERVICES

We use these trusted partners:
- Firebase (Google) - Database and authentication
- Stripe - Payment processing (PCI-DSS compliant)
- SendGrid - Email delivery
All partners sign data processing agreements.

DATA BREACHES

In the unlikely event of a breach:
- You'll be notified within 72 hours
- We'll report to authorities as required
- We'll provide credit monitoring if SSNs exposed
- We'll publish transparency reports

INTERNATIONAL TRANSFERS

Data is stored in US data centers (Firebase).
If you're in EU/EEA, we use Standard Contractual Clauses.

EXERCISING YOUR RIGHTS

Email: privacy@glrecoveryservices.com
Phone: 1-800-XXX-XXXX
In-app: Profile → Settings → Data Management

We respond to requests within 30 days.`
        }
    };

    const selectedContent = content[type] || content.terms;

    return (
        <div style={{
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
        }}>
            <div style={{
                background: '#fff',
                borderRadius: '15px',
                maxWidth: '700px',
                width: '100%',
                maxHeight: '90vh',
                display: 'flex',
                flexDirection: 'column'
            }}>
                <div style={{
                    padding: '20px 30px',
                    borderBottom: '1px solid #ddd',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <h2 style={{ margin: 0, color: '#333', fontSize: '24px' }}>
                        {selectedContent.title}
                    </h2>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            fontSize: '28px',
                            cursor: 'pointer',
                            color: '#999'
                        }}
                    >
                        ×
                    </button>
                </div>

                <div style={{
                    padding: '30px',
                    overflowY: 'auto',
                    flex: 1
                }}>
                    <pre style={{
                        whiteSpace: 'pre-wrap',
                        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                        fontSize: '14px',
                        lineHeight: '1.6',
                        color: '#333',
                        margin: 0
                    }}>
                        {selectedContent.body}
                    </pre>
                </div>

                <div style={{
                    padding: '20px 30px',
                    borderTop: '1px solid #ddd'
                }}>
                    <button
                        onClick={onClose}
                        style={{
                            width: '100%',
                            background: '#0077CC',
                            color: '#fff',
                            padding: '12px',
                            borderRadius: '8px',
                            border: 'none',
                            fontSize: '16px',
                            fontWeight: 'bold',
                            cursor: 'pointer'
                        }}
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

// Crisis Resources Modal
const CrisisModal = ({ onClose }) => {
    const resources = [
        {
            name: '988 Suicide & Crisis Lifeline',
            number: '988',
            description: '24/7 free and confidential support',
            action: () => window.location.href = 'tel:988'
        },
        {
            name: 'Crisis Text Line',
            number: 'Text HOME to 741741',
            description: 'Free 24/7 text support',
            action: () => window.location.href = 'sms:741741&body=HOME'
        },
        {
            name: 'SAMHSA National Helpline',
            number: '1-800-662-4357',
            description: 'Treatment referral and information',
            action: () => window.location.href = 'tel:18006624357'
        },
        {
            name: 'Veterans Crisis Line',
            number: '988 (Press 1)',
            description: 'Support for veterans and their families',
            action: () => window.location.href = 'tel:988'
        },
        {
            name: 'Emergency Services',
            number: '911',
            description: 'Life-threatening emergencies',
            action: () => window.location.href = 'tel:911'
        }
    ];

    return (
        <div style={{
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
        }}>
            <div style={{
                background: '#fff',
                borderRadius: '15px',
                maxWidth: '500px',
                width: '100%',
                maxHeight: '90vh',
                overflow: 'auto'
            }}>
                <div style={{
                    padding: '20px',
                    borderBottom: '2px solid #DC143C',
                    background: '#DC143C',
                    color: '#fff',
                    borderRadius: '15px 15px 0 0'
                }}>
                    <h2 style={{ margin: 0, fontSize: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <i data-lucide="alert-octagon" style={{width: '28px', height: '28px'}}></i>
                        Crisis Resources
                    </h2>
                    <p style={{ margin: '10px 0 0 0', fontSize: '14px', opacity: 0.9 }}>
                        If you're in crisis or need immediate help, please use one of these resources
                    </p>
                </div>

                <div style={{ padding: '20px' }}>
                    {resources.map((resource, index) => (
                        <div key={index} style={{
                            padding: '15px',
                            marginBottom: '15px',
                            background: '#f8f9fa',
                            borderRadius: '10px',
                            border: '1px solid #ddd'
                        }}>
                            <h3 style={{ margin: '0 0 5px 0', color: '#333', fontSize: '18px' }}>
                                {resource.name}
                            </h3>
                            <p style={{ margin: '0 0 10px 0', color: '#666', fontSize: '14px' }}>
                                {resource.description}
                            </p>
                            <button
                                onClick={resource.action}
                                style={{
                                    background: '#DC143C',
                                    color: '#fff',
                                    padding: '10px 20px',
                                    borderRadius: '8px',
                                    border: 'none',
                                    fontSize: '16px',
                                    fontWeight: 'bold',
                                    cursor: 'pointer',
                                    width: '100%'
                                }}
                            >
                                <i data-lucide="phone" style={{width: '18px', height: '18px', marginRight: '8px'}}></i>
                                {resource.number}
                            </button>
                        </div>
                    ))}

                    <div style={{
                        marginTop: '20px',
                        padding: '15px',
                        background: '#fff3cd',
                        borderRadius: '10px',
                        border: '1px solid #ffc107'
                    }}>
                        <p style={{ margin: 0, fontSize: '13px', color: '#856404' }}>
                            <strong>⚠️ Important:</strong> If you or someone else is in immediate danger, call 911 or go to the nearest emergency room.
                        </p>
                    </div>

                    <button
                        onClick={onClose}
                        style={{
                            marginTop: '20px',
                            background: '#6c757d',
                            color: '#fff',
                            padding: '12px',
                            borderRadius: '8px',
                            border: 'none',
                            fontSize: '16px',
                            cursor: 'pointer',
                            width: '100%'
                        }}
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};
const [selectedImage, setSelectedImage] = useState(null);
const [uploading, setUploading] = useState(false);

// Image selection handler - UPDATED
const handleTopicImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
        // Remove the size check here since we'll compress it
        setSelectedImage(file);
    }
};

// Update handleSendMessage in TopicRoom - UPDATED
const handleSendMessage = async () => {
    if ((!topicMessage.trim() && !selectedImage) || uploading) return;
    
    try {
        setUploading(true);
        const messageData = {
            senderId: user.uid,  // Changed from userId to senderId to match display
            senderName: userData?.displayName || userData?.firstName || 'Anonymous',
            content: topicMessage,  // Changed from 'message' to 'content' to match display
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            roomId: data.activeTopicRoom.id  // Changed from selectedRoom to data.activeTopicRoom
        };
        
        // Upload image if selected
        if (selectedImage) {
            const imageUrl = await uploadChatImage(selectedImage, 'topic', data.activeTopicRoom.id);
            messageData.imageUrl = imageUrl;
            messageData.imageName = selectedImage.name;
        }
        
        await db.collection('topicRooms').doc(data.activeTopicRoom.id)
            .collection('messages').add(messageData);
        
        setTopicMessage('');  // Changed from setNewMessage to setTopicMessage
        setSelectedImage(null);
        const fileInput = document.getElementById('topic-image-input');
        if (fileInput) fileInput.value = '';
    } catch (error) {
        alert(error.message || 'Failed to send message');
    } finally {
        setUploading(false);
    }
};

// Flag handler for topic messages
const handleFlagTopicMessage = async (message) => {
    const flagData = {
        roomId: selectedRoom.id,
        roomName: selectedRoom.name,
        messageId: message.id,
        messageContent: message.message,
        messageImageUrl: message.imageUrl || null,
        authorId: message.userId,
        authorName: message.userName
    };
    
    const flagged = await flagContent('topic_message', flagData);
    if (flagged) {
        // Optionally remove from local view
        setMessages(prev => prev.filter(m => m.id !== message.id));
    }
};

           // Load meetings
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
        if (assignment.goalId) {
            await updateGoalProgress(assignment.goalId);
        }
        
        // Reload both assignments and goals to update all progress calculations
        await loadAssignments();
        await loadGoals();
        
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
        showNotification(feedbackMsg, 'success');
        
    } catch (error) {
        showNotification('Failed to update assignment', 'error');
    }
};

// Handler for saving reflection with assignment
const handleReflectionSave = async (assignmentId, reflection) => {
    try {
        await db.collection('assignments').doc(assignmentId).update({
            status: 'completed',
            reflection: reflection,
            completedAt: firebase.firestore.FieldValue.serverTimestamp(),
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        // Reload both to update progress everywhere
        await loadAssignments();
        await loadGoals();
        
        // Send notification to coach with reflection
        const assignment = assignments.find(a => a.id === assignmentId);
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
        
        showNotification('Assignment completed with reflection!', 'success');
    } catch (error) {
        showNotification('Failed to save reflection', 'error');
    }
};

// Helper function to show notifications (add if not exists)
const showNotification = (message, type = 'info') => {
    // Trigger haptic feedback
    if (navigator.vibrate) {
        navigator.vibrate(type === 'success' ? [10, 50, 10] : type === 'error' ? [50, 100, 50] : 10);
    }

    // Create notification container
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: var(--space-4);
        right: var(--space-4);
        background: ${type === 'success' ? 'var(--color-success)' : type === 'error' ? 'var(--color-danger)' : 'var(--color-info)'};
        color: white;
        padding: var(--space-4) var(--space-6);
        border-radius: var(--radius-lg);
        box-shadow: 0 8px 24px rgba(0,0,0,0.15);
        z-index: 10000;
        animation: slideIn 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        display: flex;
        align-items: center;
        gap: var(--space-3);
        max-width: 400px;
        backdrop-filter: blur(10px);
    `;

    // Add icon based on type
    const icon = document.createElement('i');
    icon.setAttribute('data-lucide', type === 'success' ? 'check-circle' : type === 'error' ? 'alert-circle' : 'info');
    icon.style.cssText = 'width: 20px; height: 20px; flex-shrink: 0;';

    // Add message text
    const text = document.createElement('span');
    text.textContent = message;
    text.style.cssText = 'font-size: var(--font-sm); font-weight: 500;';

    notification.appendChild(icon);
    notification.appendChild(text);
    document.body.appendChild(notification);

    // Initialize icon
    if (window.lucide) {
        window.lucide.createIcons();
    }

    // Auto-dismiss after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, 3000);
};
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
const getRecoveryMilestones = (sobrietyDate) => {
    if (!sobrietyDate) return [];

    // FIXED: Parse as LOCAL date to avoid timezone shifting
    // "2023-02-03" should be Feb 3 in user's timezone, not UTC
    const [year, month, day] = sobrietyDate.split('-');
    const startDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day), 0, 0, 0, 0);

    // Icon emoji mapping
    const iconEmoji = {
        'star': '⭐',
        'calendar': '📅',
        'award': '🏆',
        'trending-up': '📈',
        'target': '🎯',
        'check-circle': '✓',
        'sunrise': '🌅',
        'zap': '⚡',
        'sparkles': '✨',
        'medal': '🏅',
        'gem': '💎',
        'flower': '🌸',
        'gift': '🎁',
        'cake': '🎂',
        'crown': '👑',
        'trophy': '🏆',
        'diamond': '💎'
    };

    const milestones = [
        { days: 1, title: '24 Hours', icon: 'star', type: 'days' },
        { days: 7, title: '1 Week', icon: 'calendar', type: 'days' },
        { months: 1, title: '1 Month', icon: 'award', type: 'months' },
        { months: 2, title: '2 Months', icon: 'trending-up', type: 'months' },
        { months: 3, title: '3 Months', icon: 'target', type: 'months' },
        { days: 100, title: '100 Days', icon: 'check-circle', type: 'days' },
        { months: 4, title: '4 Months', icon: 'star', type: 'months' },
        { months: 5, title: '5 Months', icon: 'sunrise', type: 'months' },
        { months: 6, title: '6 Months', icon: 'zap', type: 'months' },
        { days: 200, title: '200 Days', icon: 'sparkles', type: 'days' },
        { months: 7, title: '7 Months', icon: 'star', type: 'months' },
        { months: 8, title: '8 Months', icon: 'medal', type: 'months' },
        { months: 9, title: '9 Months', icon: 'gem', type: 'months' },
        { months: 10, title: '10 Months', icon: 'flower', type: 'months' },
        { months: 11, title: '11 Months', icon: 'gift', type: 'months' },
        { years: 1, title: '1 Year', icon: 'cake', type: 'years' },
        { days: 400, title: '400 Days', icon: 'star', type: 'days' },
        { days: 500, title: '500 Days', icon: 'award', type: 'days' },
        { years: 2, title: '2 Years', icon: 'crown', type: 'years' },
        { days: 1000, title: '1000 Days', icon: 'medal', type: 'days' },
        { years: 3, title: '3 Years', icon: 'zap', type: 'years' },
        { years: 4, title: '4 Years', icon: 'star', type: 'years' },
        { years: 5, title: '5 Years', icon: 'sparkles', type: 'years' },
        { days: 2000, title: '2000 Days', icon: 'trophy', type: 'days' },
        { years: 6, title: '6 Years', icon: 'crown', type: 'years' },
        { years: 7, title: '7 Years', icon: 'star', type: 'years' },
        { years: 8, title: '8 Years', icon: 'sparkles', type: 'years' },
        { years: 9, title: '9 Years', icon: 'medal', type: 'years' },
        { years: 10, title: '10 Years', icon: 'crown', type: 'years' },
        { days: 5000, title: '5000 Days', icon: 'diamond', type: 'days' }
    ];

    // Add more yearly milestones dynamically (11-20 years)
    for (let year = 11; year <= 20; year++) {
        milestones.push({
            years: year,
            title: `${year} Years`,
            icon: 'star',
            type: 'years'
        });
    }

    // Calculate milestone dates and actual days for each milestone
    const processedMilestones = milestones.map(milestone => {
        let milestoneDate = new Date(startDate);
        let milestoneDays;

        if (milestone.type === 'years') {
            // YEARS: Use date arithmetic (handles leap years automatically)
            // Feb 3, 2023 + 3 years = Feb 3, 2026
            milestoneDate.setFullYear(startDate.getFullYear() + milestone.years);
            milestoneDate.setHours(0, 0, 0, 0);
            // Calculate day number: Feb 3, 2023 (Day 1) to Feb 3, 2026 (Day 1097)
            // We include BOTH the start date and end date in the count
            const diffTime = milestoneDate - startDate;
            const daysDiff = Math.round(diffTime / (1000 * 60 * 60 * 24));
            milestoneDays = daysDiff + 1; // +1 because Day 1 is the start date itself
        } else if (milestone.type === 'months') {
            // MONTHS: Use date arithmetic
            // Feb 3, 2023 + 4 months = June 3, 2023
            milestoneDate.setMonth(startDate.getMonth() + milestone.months);
            milestoneDate.setHours(0, 0, 0, 0);
            // Calculate day number including both start and end date
            const diffTime = milestoneDate - startDate;
            const daysDiff = Math.round(diffTime / (1000 * 60 * 60 * 24));
            milestoneDays = daysDiff + 1; // +1 because Day 1 is the start date itself
        } else {
            // DAYS: For pure day milestones, it's just the day number
            milestoneDays = milestone.days;
            // Calculate the actual calendar date for this day number
            const tempStart = new Date(startDate);
            tempStart.setHours(0, 0, 0, 0);
            milestoneDate = new Date(tempStart.getTime() + (milestone.days - 1) * 24 * 60 * 60 * 1000);
        }

        return {
            ...milestone,
            days: milestoneDays, // Store the calculated days
            date: milestoneDate
        };
    });

    // Sort milestones by calculated days to ensure proper order
    processedMilestones.sort((a, b) => a.days - b.days);

    // Use the correct timezone-aware calculation
    const daysSober = calculateSobrietyDays(sobrietyDate);

    return processedMilestones.map(milestone => {
        return {
            ...milestone,
            icon: iconEmoji[milestone.icon] || milestone.icon, // Convert to emoji
            achieved: daysSober >= milestone.days,
            isToday: daysSober === milestone.days,
            isTomorrow: daysSober === (milestone.days - 1),
            daysUntil: milestone.days - daysSober,
            type: 'recovery' // Mark as recovery milestone
        };
    });
};

// Check for milestone notifications
const checkMilestoneNotifications = async () => {
    if (!userData?.sobrietyDate) return;
    
    const recoveryMilestones = getRecoveryMilestones(userData.sobrietyDate);
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
            const daysClean = calculateSobrietyDays(userData.sobrietyDate);
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
        calculateGoalStats(history);

    } catch (error) {
    }
};

// Calculate goal achievement statistics
const calculateGoalStats = (history) => {
    if (history.length === 0) {
        setGoalStats({
            completionRate: 0,
            currentStreak: 0,
            bestStreak: 0,
            totalGoals: 0
        });
        return;
    }

    const completedGoals = history.filter(g => g.status === 'yes' || g.status === 'almost').length;
    const completionRate = Math.round((completedGoals / history.length) * 100);

    // Calculate current streak (consecutive successful goals)
    let currentStreak = 0;
    for (const goal of history) {
        if (goal.status === 'yes' || goal.status === 'almost') {
            currentStreak++;
        } else {
            break;
        }
    }

    // Calculate best streak
    let bestStreak = 0;
    let tempStreak = 0;
    for (const goal of history) {
        if (goal.status === 'yes' || goal.status === 'almost') {
            tempStreak++;
            bestStreak = Math.max(bestStreak, tempStreak);
        } else {
            tempStreak = 0;
        }
    }

    setGoalStats({
        completionRate,
        currentStreak,
        bestStreak,
        totalGoals: history.length
    });
};

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
        triggerHaptic('medium');

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
            triggerHaptic('success');
        } else {
            // Fallback: Copy to clipboard
            await navigator.clipboard.writeText(shareText);
            triggerHaptic('success');
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
            triggerHaptic('error');
            alert('❌ Permission denied: You don\'t have access to your check-in data.\n\nPlease try logging out and logging back in.');
        } else {
            triggerHaptic('error');
            alert('❌ Error sharing reflections:\n\n' + error.message + '\n\nPlease check console for details.');
        }
    }
};

// Calculate all check-in streaks
const calculateStreaks = async () => {
    try {
        const userTimezone = user.timezone || "America/Los_Angeles";

        // Fetch ALL check-ins
        const snapshot = await db.collection('checkIns')
            .where('userId', '==', user.uid)
            .orderBy('createdAt', 'asc')
            .get();

        // Group check-ins by date
        const checkInsByDate = {};
        snapshot.docs.forEach(doc => {
            const checkIn = doc.data();
            const checkInDate = checkIn.createdAt?.toDate ?
                checkIn.createdAt.toDate() : new Date(checkIn.createdAt);
            const checkInUserTZ = new Date(checkInDate.toLocaleString("en-US", {timeZone: userTimezone}));

            const year = checkInUserTZ.getFullYear();
            const month = String(checkInUserTZ.getMonth() + 1).padStart(2, '0');
            const day = String(checkInUserTZ.getDate()).padStart(2, '0');
            const dateKey = `${year}-${month}-${day}`;

            checkInsByDate[dateKey] = true;
        });

        // Get all dates with check-ins, sorted
        const datesWithCheckIns = Object.keys(checkInsByDate).sort();

        if (datesWithCheckIns.length === 0) {
            setStreakData({ longestStreak: 0, currentStreak: 0, allStreaks: [] });
            return;
        }

        // Find all streaks
        const allStreaks = [];
        let currentStreakStart = datesWithCheckIns[0];
        let currentStreakEnd = datesWithCheckIns[0];

        for (let i = 1; i < datesWithCheckIns.length; i++) {
            const prevDate = new Date(datesWithCheckIns[i - 1]);
            const currDate = new Date(datesWithCheckIns[i]);

            // Calculate day difference
            const diffTime = currDate - prevDate;
            const diffDays = diffTime / (1000 * 60 * 60 * 24);

            if (diffDays === 1) {
                // Consecutive day - extend current streak
                currentStreakEnd = datesWithCheckIns[i];
            } else {
                // Streak broken - save current streak
                const streakStart = new Date(currentStreakStart);
                const streakEnd = new Date(currentStreakEnd);
                const streakLength = Math.round((streakEnd - streakStart) / (1000 * 60 * 60 * 24)) + 1;

                allStreaks.push({
                    startDate: currentStreakStart,
                    endDate: currentStreakEnd,
                    length: streakLength
                });

                // Start new streak
                currentStreakStart = datesWithCheckIns[i];
                currentStreakEnd = datesWithCheckIns[i];
            }
        }

        // Add final streak
        const streakStart = new Date(currentStreakStart);
        const streakEnd = new Date(currentStreakEnd);
        const streakLength = Math.round((streakEnd - streakStart) / (1000 * 60 * 60 * 24)) + 1;
        allStreaks.push({
            startDate: currentStreakStart,
            endDate: currentStreakEnd,
            length: streakLength
        });

        // Sort streaks by length (longest first)
        allStreaks.sort((a, b) => b.length - a.length);

        // Find current streak (last streak if it includes today)
        const today = new Date();
        const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
        const lastStreak = allStreaks[allStreaks.length - 1];
        const currentStreak = lastStreak && lastStreak.endDate === todayKey ? lastStreak.length : 0;

        // Longest streak
        const longestStreak = allStreaks.length > 0 ? allStreaks[0].length : 0;

        setStreakData({
            longestStreak,
            currentStreak,
            allStreaks
        });

    } catch (error) {
    }
};

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
        let gratitudeThemes = [];

        try {
            const insightsRef = db.collection('users').doc(user.uid)
                .collection('insights').doc('gratitude');
            const insightsDoc = await insightsRef.get();

            if (insightsDoc.exists) {
                const insightsData = insightsDoc.data();
                if (insightsData.computed?.topThemes && insightsData.computed.topThemes.length > 0) {
                    // Use Cloud Functions computed themes
                    gratitudeThemes = insightsData.computed.topThemes.map(t => ({
                        theme: t.theme,
                        count: Math.round((t.percentage / 100) * insightsData.totalCount) || 1,
                        percentage: t.percentage,
                        emotionalWeight: t.emotionalWeight
                    }));
                    topGratitudeTheme = gratitudeThemes[0].theme;
                }
            }
        } catch (error) {
        }

        setReflectionStats({
            totalThisMonth: totalAllTime,
            avgDailyScore: avgDailyScore,
            topGratitudeTheme,
            gratitudeThemes // Store Cloud Functions themes
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
const calculateReflectionStreaks = async () => {
    try {
        const userTimezone = user.timezone || "America/Los_Angeles";

        // Fetch ALL check-ins with eveningData
        const snapshot = await db.collection('checkIns')
            .where('userId', '==', user.uid)
            .orderBy('createdAt', 'asc')
            .get();

        // Group reflections by date (only check-ins with eveningData)
        const reflectionsByDate = {};
        snapshot.docs.forEach(doc => {
            const checkIn = doc.data();
            // Only count if it has eveningData (reflection)
            if (checkIn.eveningData) {
                const checkInDate = checkIn.createdAt?.toDate ?
                    checkIn.createdAt.toDate() : new Date(checkIn.createdAt);
                const checkInUserTZ = new Date(checkInDate.toLocaleString("en-US", {timeZone: userTimezone}));

                const year = checkInUserTZ.getFullYear();
                const month = String(checkInUserTZ.getMonth() + 1).padStart(2, '0');
                const day = String(checkInUserTZ.getDate()).padStart(2, '0');
                const dateKey = `${year}-${month}-${day}`;

                reflectionsByDate[dateKey] = true;
            }
        });

        // Get all dates with reflections, sorted
        const datesWithReflections = Object.keys(reflectionsByDate).sort();

        if (datesWithReflections.length === 0) {
            setReflectionStreakData({ longestStreak: 0, currentStreak: 0, allStreaks: [] });
            return;
        }

        // Find all streaks
        const allStreaks = [];
        let currentStreakStart = datesWithReflections[0];
        let currentStreakEnd = datesWithReflections[0];

        for (let i = 1; i < datesWithReflections.length; i++) {
            const prevDate = new Date(datesWithReflections[i - 1]);
            const currDate = new Date(datesWithReflections[i]);

            // Calculate day difference
            const diffTime = currDate - prevDate;
            const diffDays = diffTime / (1000 * 60 * 60 * 24);

            if (diffDays === 1) {
                // Consecutive day - extend current streak
                currentStreakEnd = datesWithReflections[i];
            } else {
                // Streak broken - save current streak
                const streakStart = new Date(currentStreakStart);
                const streakEnd = new Date(currentStreakEnd);
                const streakLength = Math.round((streakEnd - streakStart) / (1000 * 60 * 60 * 24)) + 1;

                allStreaks.push({
                    startDate: currentStreakStart,
                    endDate: currentStreakEnd,
                    length: streakLength
                });

                // Start new streak
                currentStreakStart = datesWithReflections[i];
                currentStreakEnd = datesWithReflections[i];
            }
        }

        // Add final streak
        const streakStart = new Date(currentStreakStart);
        const streakEnd = new Date(currentStreakEnd);
        const streakLength = Math.round((streakEnd - streakStart) / (1000 * 60 * 60 * 24)) + 1;
        allStreaks.push({
            startDate: currentStreakStart,
            endDate: currentStreakEnd,
            length: streakLength
        });

        // Sort streaks by length (longest first)
        allStreaks.sort((a, b) => b.length - a.length);

        // Find current streak (last streak if it includes today)
        const today = new Date();
        const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
        const lastStreak = allStreaks[allStreaks.length - 1];
        const currentStreak = lastStreak && lastStreak.endDate === todayKey ? lastStreak.length : 0;

        // Longest streak
        const longestStreak = allStreaks.length > 0 ? allStreaks[0].length : 0;

        setReflectionStreakData({
            longestStreak,
            currentStreak,
            allStreaks
        });

    } catch (error) {
    }
};

// Calculate milestones
const calculateMilestones = () => {
    try {
        if (!user.sobrietyDate) {
            return;
        }

        // Get sobriety date
        const startDate = new Date(user.sobrietyDate);

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        startDate.setHours(0, 0, 0, 0);

        // Calculate days sober
        const daysSober = Math.floor((today - startDate) / (1000 * 60 * 60 * 24));

        // Define all milestones
        const milestoneDefinitions = [
            { days: 7, label: '1 Week', icon: 'calendar' },
            { days: 14, label: '2 Weeks', icon: 'calendar' },
            { days: 21, label: '3 Weeks', icon: 'calendar' },
            { days: 30, label: '1 Month', icon: 'award' },
            { days: 60, label: '2 Months', icon: 'award' },
            { days: 90, label: '3 Months', icon: 'star' },
            { days: 180, label: '6 Months', icon: 'star' },
            { days: 365, label: '1 Year', icon: 'trophy' },
            { days: 547, label: '18 Months', icon: 'trophy' },
            { days: 730, label: '2 Years', icon: 'medal' },
            { days: 1095, label: '3 Years', icon: 'medal' },
            { days: 1825, label: '5 Years', icon: 'crown' },
            { days: 3650, label: '10 Years', icon: 'crown' }
        ];

        // Calculate milestone status
        const milestones = milestoneDefinitions.map(m => {
            const achieved = daysSober >= m.days;
            const daysUntil = m.days - daysSober;
            const milestoneDate = new Date(startDate);
            milestoneDate.setDate(milestoneDate.getDate() + m.days);

            return {
                ...m,
                achieved,
                daysUntil,
                date: milestoneDate,
                dateString: milestoneDate.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                })
            };
        });

        // Find next milestone
        const upcomingMilestones = milestones.filter(m => !m.achieved);
        const next = upcomingMilestones.length > 0 ? upcomingMilestones[0] : null;

        // Calculate progress to next milestone
        if (next) {
            const previousMilestone = milestones.filter(m => m.achieved).slice(-1)[0];
            const startDays = previousMilestone ? previousMilestone.days : 0;
            const endDays = next.days;
            const currentProgress = daysSober - startDays;
            const totalRange = endDays - startDays;
            const progressPercentage = Math.round((currentProgress / totalRange) * 100);

            setNextMilestone({
                ...next,
                progressPercentage,
                daysSober
            });
        } else {
            // All milestones achieved!
            setNextMilestone({
                days: daysSober,
                label: 'All Milestones Complete!',
                icon: 'crown',
                achieved: true,
                daysUntil: 0,
                progressPercentage: 100,
                daysSober
            });
        }

        setAllMilestones(milestones);

    } catch (error) {
    }
};

// Save gratitude entry
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
        setShowGratitudeModal(false);

        // Show success message
        alert('Gratitude saved! 🙏');

        // Reload reflections to update top theme
        await loadReflections();

    } catch (error) {
        alert('Error saving gratitude. Please try again.');
    }
};


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

         // Calculate total lifetime check-ins
const calculateTotalCheckIns = async () => {
    try {
        const checkInsSnap = await db.collection('checkIns')
            .where('userId', '==', user.uid)
            .get();
        
        let totalCount = 0;
        checkInsSnap.forEach(doc => {
            const data = doc.data();
            if (data.morningData) totalCount++;
            if (data.eveningData) totalCount++;
        });
        
        return totalCount;
    } catch (error) {
        return 0;
    }
};

// Handle daily pledge
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
    }
};

// Handle morning check-in - UPDATED FOR 0-10 SCALE
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
        await updateStreak();
        
        // Check for auto-triggered alerts with NEW THRESHOLDS (0-10 scale)
        if (data.mood <= 3) {  // Changed from <= 2 (on 1-5 scale)
            await db.collection('alerts').add({
                userId: user.uid,
                type: 'low_mood',
                status: 'active',
                severity: 'high',
                message: `Low mood detected (${data.mood}/10)`,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        }
        
        if (data.craving >= 7) {  // Changed from >= 4 (on 1-5 scale)
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
        
       
// Handle evening reflection - SAVES TO CHECKINS COLLECTION ONLY
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
        await loadReflections();
        await loadCheckIns();
        await loadDailyTasksStatus();

        alert('Evening reflection complete!');
    } catch (error) {
        alert('Failed to save reflection');
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
            }
        } else {
            // Create new streak
            await db.collection('streaks').doc(user.uid).set({
                currentStreak: 1,
                lastCheckIn: firebase.firestore.FieldValue.serverTimestamp()
            });
            setCheckInStreak(1);
        }
    } catch (error) {
    }
};

// Complete assignment WITH REFLECTION
const completeAssignment = async (assignmentId, goalId, reflection) => {
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
            await updateGoalProgress(goalId);
        }
        
        await loadAssignments();
        await loadGoals();
        await loadComplianceRates();
    } catch (error) {
    }
};

// Update goal progress - IMPROVED VERSION
const updateGoalProgress = async (goalId) => {
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
        
        // Trigger a refresh of the goals view if it exists
        if (window.goalsTasksViewInstance) {
            window.goalsTasksViewInstance.forceUpdate();
        }
        
    } catch (error) {
    }
};

// Update the send message function for GLRS Community - SAVES TO MESSAGES
const sendCommunityMessage = async (message, imageUrl) => {
    try {
        const messageData = {
            roomId: 'main',  // Required for messages collection
            senderId: user.uid,
            senderName: userData?.displayName || userData?.firstName || 'Anonymous',
            content: message,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()  // Changed from timestamp
        };
        
        // Add image URL if provided
        if (imageUrl) {
            messageData.imageUrl = imageUrl;
        }
        
        await db.collection('messages').add(messageData);  // Changed from glrsChat
    } catch (error) {
        throw error;
    }
};

const sendTopicRoomMessage = async (roomId, content, imageFile = null) => {
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
                showNotification('Failed to process image, sending message only', 'warning');
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
        showNotification('Failed to send message', 'error');
    }
};

// Enter topic room
const enterTopicRoom = async (room) => {
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
    }
    
    setShowModal('topicRoom');
};

// Handle SOS trigger
const triggerSOS = async () => {
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
            alert('Failed to send alert. Please call 988 for immediate help.');
        }
    }
};

// Alternative Profile Image Upload - Resize and store in Firestore
const handleProfileImageUpload = async (file) => {
    try {
        // Check file size (limit to 5MB for upload)
        if (file.size > 5 * 1024 * 1024) {
            showNotification('Image size must be less than 5MB', 'error');
            return;
        }
        
        // Show loading
        showNotification('Processing image...', 'info');
        
        // Create canvas for resizing
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        
        // Read and process the file
        const reader = new FileReader();
        
        reader.onload = async (e) => {
            img.onload = async () => {
                try {
                    // Resize to max 300x300 pixels (slightly larger for better quality)
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
                    const base64Size = resizedBase64.length * 0.75; // Approximate size in bytes
                    if (base64Size > 500 * 1024) {
                        // Try with more compression
                        const moreCompressed = canvas.toDataURL('image/jpeg', 0.5);
                        if (moreCompressed.length * 0.75 > 500 * 1024) {
                            showNotification('Image is too large even after compression. Please choose a smaller image.', 'error');
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
                    
                    showNotification('Profile image updated successfully!', 'success');
                    
                } catch (error) {
                    showNotification('Failed to process image', 'error');
                }
            };
            
            img.onerror = () => {
                showNotification('Failed to load image', 'error');
            };
            
            img.src = e.target.result;
        };
        
        reader.onerror = () => {
            showNotification('Failed to read file', 'error');
        };
        
        reader.readAsDataURL(file);
        
    } catch (error) {
        showNotification('Failed to upload image', 'error');
    }
};

// Update the handleImageSelect function to use the new handler
const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
        // Check file type
        if (!file.type.startsWith('image/')) {
            showNotification('Please select an image file', 'error');
            return;
        }
        
        // Use the new upload handler
        handleProfileImageUpload(file);
    }
};

// Export data as JSON
const exportDataAsJSON = () => {
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

// Export data as PDF with comprehensive data
const exportDataAsPDF = () => {
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

// Handle logout
const handleLogout = async () => {
    if (confirm('Are you sure you want to sign out?')) {
        await auth.signOut();
    }
};

// Mark notification as read
const markNotificationAsRead = async (notificationId) => {
    try {
        await db.collection('notifications').doc(notificationId).update({
            read: true,
            readAt: firebase.firestore.FieldValue.serverTimestamp()
        });
    } catch (error) {
    }
};

// Mark all notifications as read
const markAllNotificationsAsRead = async () => {
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
    }
};

// Dismiss broadcast
const dismissBroadcast = () => {
    setBroadcastDismissed(true);
    setActiveBroadcast(null);
};

// ========================================
// PATTERN DETECTION ALGORITHMS
// ========================================

// Algorithm 1: Day-of-Week Pattern Detection
const detectDayOfWeekPattern = (checkInsData) => {
    if (!checkInsData || checkInsData.length < 7) return null;

    const dayGroups = { 0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] }; // Sun-Sat
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    checkInsData.slice(0, 30).forEach(checkIn => {
        if (!checkIn.morningData) return;
        const date = checkIn.createdAt?.toDate ? checkIn.createdAt.toDate() : new Date(checkIn.createdAt);
        const dayOfWeek = date.getDay();

        dayGroups[dayOfWeek].push({
            mood: checkIn.morningData.mood || 3,
            craving: checkIn.morningData.craving || 3,
            anxiety: checkIn.morningData.anxiety || 3
        });
    });

    const dayAverages = {};
    let totalMood = 0, totalCraving = 0, totalAnxiety = 0, count = 0;

    Object.keys(dayGroups).forEach(day => {
        if (dayGroups[day].length === 0) return;

        const avgMood = dayGroups[day].reduce((sum, d) => sum + d.mood, 0) / dayGroups[day].length;
        const avgCraving = dayGroups[day].reduce((sum, d) => sum + d.craving, 0) / dayGroups[day].length;
        const avgAnxiety = dayGroups[day].reduce((sum, d) => sum + d.anxiety, 0) / dayGroups[day].length;

        dayAverages[day] = { mood: avgMood, craving: avgCraving, anxiety: avgAnxiety };
        totalMood += avgMood;
        totalCraving += avgCraving;
        totalAnxiety += avgAnxiety;
        count++;
    });

    if (count === 0) return null;

    const weeklyAvg = {
        mood: totalMood / count,
        craving: totalCraving / count,
        anxiety: totalAnxiety / count
    };

    let lowestMoodDay = null, highestCravingDay = null, highestAnxietyDay = null;
    let lowestMoodValue = 5, highestCravingValue = 0, highestAnxietyValue = 0;

    Object.keys(dayAverages).forEach(day => {
        if (dayAverages[day].mood < lowestMoodValue) {
            lowestMoodValue = dayAverages[day].mood;
            lowestMoodDay = parseInt(day);
        }
        if (dayAverages[day].craving > highestCravingValue) {
            highestCravingValue = dayAverages[day].craving;
            highestCravingDay = parseInt(day);
        }
        if (dayAverages[day].anxiety > highestAnxietyValue) {
            highestAnxietyValue = dayAverages[day].anxiety;
            highestAnxietyDay = parseInt(day);
        }
    });

    if (lowestMoodDay !== null && weeklyAvg.mood - lowestMoodValue >= 1) {
        return {
            type: 'dayOfWeek',
            metric: 'mood',
            day: dayNames[lowestMoodDay],
            value: lowestMoodValue.toFixed(1),
            message: `Your mood tends to dip on ${dayNames[lowestMoodDay]}s`,
            tips: [
                `Start your ${dayNames[lowestMoodDay]} with a morning routine`,
                `Schedule something enjoyable for ${dayNames[lowestMoodDay]} mornings`,
                `Connect with your accountability partner on ${dayNames[lowestMoodDay]}`,
                `Review your ${dayNames[lowestMoodDay]} triggers from past weeks`
            ]
        };
    }

    if (highestCravingDay !== null && highestCravingValue - weeklyAvg.craving >= 1) {
        return {
            type: 'dayOfWeek',
            metric: 'craving',
            day: dayNames[highestCravingDay],
            value: highestCravingValue.toFixed(1),
            message: `Your cravings spike on ${dayNames[highestCravingDay]}s`,
            tips: [
                `Identify your ${dayNames[highestCravingDay]} triggers (stress? social plans?)`,
                `Plan alternative activities for ${dayNames[highestCravingDay]} evenings`,
                `Check in with your support group on ${dayNames[highestCravingDay]}s`,
                `Practice grounding techniques on ${dayNames[highestCravingDay]} afternoons`
            ]
        };
    }

    if (highestAnxietyDay !== null && highestAnxietyValue - weeklyAvg.anxiety >= 1) {
        return {
            type: 'dayOfWeek',
            metric: 'anxiety',
            day: dayNames[highestAnxietyDay],
            value: highestAnxietyValue.toFixed(1),
            message: `Your anxiety is higher on ${dayNames[highestAnxietyDay]}s`,
            tips: [
                `Prepare for the week ahead on ${dayNames[highestAnxietyDay - 1 >= 0 ? highestAnxietyDay - 1 : 6]} night`,
                `Practice ${dayNames[highestAnxietyDay]} evening meditation`,
                `Limit social media on ${dayNames[highestAnxietyDay]}s`,
                `Connect with supportive friends on ${dayNames[highestAnxietyDay]}`
            ]
        };
    }

    return null;
};

// Algorithm 2: Consecutive Days Pattern Detection
const detectConsecutiveDaysPattern = (checkInsData) => {
    if (!checkInsData || checkInsData.length < 3) return null;

    let consecutiveLowMood = 0, consecutiveHighCraving = 0;
    let maxConsecutiveLowMood = 0, maxConsecutiveHighCraving = 0;

    checkInsData.slice(0, 14).forEach(checkIn => {
        if (!checkIn.morningData) {
            consecutiveLowMood = 0;
            consecutiveHighCraving = 0;
            return;
        }

        const mood = checkIn.morningData.mood || 3;
        const craving = checkIn.morningData.craving || 3;

        if (mood <= 2) {
            consecutiveLowMood++;
            maxConsecutiveLowMood = Math.max(maxConsecutiveLowMood, consecutiveLowMood);
        } else {
            consecutiveLowMood = 0;
        }

        if (craving >= 4) {
            consecutiveHighCraving++;
            maxConsecutiveHighCraving = Math.max(maxConsecutiveHighCraving, consecutiveHighCraving);
        } else {
            consecutiveHighCraving = 0;
        }
    });

    if (maxConsecutiveLowMood >= 3) {
        return {
            type: 'consecutive',
            metric: 'lowMood',
            days: maxConsecutiveLowMood,
            message: `You've had ${maxConsecutiveLowMood} consecutive days of low mood. Let's address this.`,
            tips: [
                'Consider reaching out to your coach today',
                'Review your coping strategies - what\'s working?',
                'Have you been completing your daily check-ins?',
                'Physical activity can help - take a walk today'
            ]
        };
    }

    if (maxConsecutiveHighCraving >= 3) {
        return {
            type: 'consecutive',
            metric: 'highCraving',
            days: maxConsecutiveHighCraving,
            message: `High cravings for ${maxConsecutiveHighCraving} days in a row. Time for extra support.`,
            tips: [
                'This is normal - cravings pass, you are strong',
                'Call your accountability partner right now',
                'Use the 5-minute rule: delay for 5 minutes, reassess',
                'Review your relapse prevention plan in Guides'
            ]
        };
    }

    return null;
};

// Algorithm 3: Time-of-Day Pattern Detection
const detectTimeOfDayPattern = (checkInsData) => {
    if (!checkInsData || checkInsData.length < 7) return null;

    let morningMoodSum = 0, eveningMoodSum = 0;
    let morningCount = 0, eveningCount = 0;

    checkInsData.slice(0, 14).forEach(checkIn => {
        if (checkIn.morningData && checkIn.morningData.mood) {
            morningMoodSum += checkIn.morningData.mood;
            morningCount++;
        }
        if (checkIn.eveningData && checkIn.eveningData.overallDay) {
            eveningMoodSum += checkIn.eveningData.overallDay;
            eveningCount++;
        }
    });

    if (morningCount < 5 || eveningCount < 5) return null;

    const avgMorningMood = morningMoodSum / morningCount;
    const avgEveningMood = eveningMoodSum / eveningCount;
    const difference = avgMorningMood - avgEveningMood;

    if (difference <= -1) {
        return {
            type: 'timeOfDay',
            metric: 'morningsHarder',
            difference: Math.abs(difference).toFixed(1),
            message: 'Your mornings tend to be more challenging',
            tips: [
                'Establish a consistent morning routine',
                'Avoid checking phone first thing in the morning',
                'Try morning meditation or stretching',
                'Plan something positive for each morning'
            ]
        };
    }

    if (difference >= 1) {
        return {
            type: 'timeOfDay',
            metric: 'eveningsHarder',
            difference: difference.toFixed(1),
            message: 'Your mood dips in the evenings',
            tips: [
                'Avoid isolation in the evenings',
                'Limit screen time after 8 PM',
                'Call a friend or family member each evening',
                'Practice evening reflection to process your day'
            ]
        };
    }

    return null;
};

// Run pattern detection on check-ins data
useEffect(() => {
    if (checkIns.length > 0) {
        const pattern = detectDayOfWeekPattern(checkIns) ||
                       detectConsecutiveDaysPattern(checkIns) ||
                       detectTimeOfDayPattern(checkIns);
        setPatternDetection(pattern);
    }
}, [checkIns]);

if (loading) {
    return (
        <div className="loading-container">
            <div className="loading-spinner"></div>
        </div>
    );
}

// ==========================================
// LOADING SPINNER COMPONENT
// ==========================================
const LoadingSpinner = ({ message = 'Loading...' }) => {
    return React.createElement('div', {
        style: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '60vh',
            flexDirection: 'column',
            gap: '15px'
        }
    }, [
        React.createElement('div', {
            key: 'spinner',
            style: {
                width: '50px',
                height: '50px',
                border: '4px solid rgba(6, 148, 148, 0.2)',
                borderTop: '4px solid #069494',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
            }
        }),
        React.createElement('div', {
            key: 'message',
            style: {
                color: '#666',
                fontSize: '14px',
                fontWeight: '500'
            }
        }, message)
    ]);
};

// ==========================================
// MODAL ROUTER FUNCTION - REMOVED (duplicate declaration)
// Using centralized showModal state at line 233 instead
// ==========================================

// ==========================================
// APP OBJECT CREATION
// Central state container - passes all state, functions, and refs to child components
// ==========================================
const app = {
    // ========================================
    // USER & AUTH
    // ========================================
    user,

    // ========================================
    // NAVIGATION STATES (7 states × 2 = 14 properties)
    // ========================================
    currentView, setCurrentView,
    journeyTab, setJourneyTab,
    activeTaskTab, setActiveTaskTab,
    showProfileModal, setShowProfileModal,
    loading, setLoading,
    showDisclaimerModal, setShowDisclaimerModal,
    showSidebar, setShowSidebar,

    // ========================================
    // USER DATA STATES (3 states × 2 = 6 properties)
    // ========================================
    userData, setUserData,
    profileImage, setProfileImage,
    coachInfo, setCoachInfo,

    // ========================================
    // HOME SECTION STATES (17 states × 2 = 34 properties)
    // ========================================
    sobrietyDays, setSobrietyDays,
    selectedMood, setSelectedMood,
    pledgeMade, setPledgeMade,
    moneySaved, setMoneySaved,
    dailyQuote, setDailyQuote,
    milestones, setMilestones,
    nextMilestone, setNextMilestone,
    activeBroadcast, setActiveBroadcast,
    broadcastDismissed, setBroadcastDismissed,
    checkInStatus, setCheckInStatus,
    checkInStreak, setCheckInStreak,
    streakCheckIns, setStreakCheckIns,
    complianceRate, setComplianceRate,
    totalCheckIns, setTotalCheckIns,
    googleConnected, setGoogleConnected,
    googleToken, setGoogleToken,
    googleTokenExpiry, setGoogleTokenExpiry,
    syncingGoogle, setSyncingGoogle,

    // ========================================
    // PROGRESS/CHART STATES (5 states × 2 = 10 properties)
    // ========================================
    checkIns, setCheckIns,
    moodChartData, setMoodChartData,
    cravingChartData, setCravingChartData,
    anxietyChartData, setAnxietyChartData,
    sleepChartData, setSleepChartData,

    // ========================================
    // JOURNEY LIFE CARDS STATES (5 states × 2 = 10 properties)
    // ========================================
    lifeCardIndex, setLifeCardIndex,
    lifeIsDragging, setLifeIsDragging,
    lifeTouchStart, setLifeTouchStart,
    lifeTouchEnd, setLifeTouchEnd,
    dailyQuotes, setDailyQuotes,

    // ========================================
    // JOURNEY FINANCES STATES (5 states × 2 = 10 properties)
    // ========================================
    financesCardIndex, setFinancesCardIndex,
    financesIsDragging, setFinancesIsDragging,
    financesTouchStart, setFinancesTouchStart,
    financesTouchEnd, setFinancesTouchEnd,
    actualMoneySaved, setActualMoneySaved,

    // ========================================
    // JOURNEY SAVINGS CAROUSEL STATES (12 states × 2 = 24 properties)
    // ========================================
    savingsCarouselIndex, setSavingsCarouselIndex,
    activeSavingsGoal, setActiveSavingsGoal,
    savingsCarouselTouchStart, setSavingsCarouselTouchStart,
    savingsItems, setSavingsItems,
    savingsGoals, setSavingsGoals,
    moneyMapStops, setMoneyMapStops,

    // ========================================
    // JOURNEY WELLNESS CARDS STATES (5 states × 2 = 10 properties)
    // ========================================
    wellnessCardIndex, setWellnessCardIndex,
    wellnessIsDragging, setWellnessIsDragging,
    wellnessTouchStart, setWellnessTouchStart,
    wellnessTouchEnd, setWellnessTouchEnd,
    expandedGraph, setExpandedGraph,

    // ========================================
    // JOURNEY MISSED CHECK-INS STATES (5 states × 2 = 10 properties)
    // ========================================
    missedMoodCheckIns, setMissedMoodCheckIns,
    missedCravingCheckIns, setMissedCravingCheckIns,
    missedAnxietyCheckIns, setMissedAnxietyCheckIns,
    missedSleepCheckIns, setMissedSleepCheckIns,
    missedOverallCheckIns, setMissedOverallCheckIns,

    // ========================================
    // TASKS/GOALS STATES (14 states × 2 = 28 properties)
    // ========================================
    goals, setGoals,
    assignments, setAssignments,
    dueToday, setDueToday,
    habits, setHabits,
    todayHabits, setTodayHabits,
    quickReflections, setQuickReflections,
    todayWins, setTodayWins,
    newHabitName, setNewHabitName,
    newReflection, setNewReflection,
    newWin, setNewWin,
    showHabitHistory, setShowHabitHistory,
    showReflectionHistory, setShowReflectionHistory,
    showWinsHistory, setShowWinsHistory,
    goalHistory, setGoalHistory,

    // ========================================
    // TASKS MODAL STATES (9 states × 2 = 18 properties)
    // ========================================
    showIncompleteTasksModal, setShowIncompleteTasksModal,
    showHabitTrackerModal, setShowHabitTrackerModal,
    showQuickReflectionModal, setShowQuickReflectionModal,
    showThisWeekTasksModal, setShowThisWeekTasksModal,
    showOverdueItemsModal, setShowOverdueItemsModal,
    showMarkCompleteModal, setShowMarkCompleteModal,
    showProgressStatsModal, setShowProgressStatsModal,
    showGoalProgressModal, setShowGoalProgressModal,
    showTodayWinsModal, setShowTodayWinsModal,

    // ========================================
    // CHECK-IN STATES (4 states × 2 = 8 properties)
    // ========================================
    morningCheckInData, setMorningCheckInData,
    eveningReflectionData, setEveningReflectionData,
    patternDetection, setPatternDetection,
    checkInData, setCheckInData,

    // ========================================
    // STREAK MODAL STATES (4 states × 2 = 8 properties)
    // ========================================
    showStreakModal, setShowStreakModal,
    showReflectionStreakModal, setShowReflectionStreakModal,
    showStreaksModal, setShowStreaksModal,
    showReflectionStreaksModal, setShowReflectionStreaksModal,

    // ========================================
    // PATTERN/INSIGHTS MODAL STATES (3 states × 2 = 6 properties)
    // ========================================
    showTipsModal, setShowTipsModal,
    moodWeekData, setMoodWeekData,
    overallDayWeekData, setOverallDayWeekData,

    // ========================================
    // STREAK DATA STATES (4 states × 2 = 8 properties)
    // ========================================
    streakData, setStreakData,
    reflectionStreakData, setReflectionStreakData,
    reflectionStreak, setReflectionStreak,
    streakReflections, setStreakReflections,

    // ========================================
    // CALENDAR/MILESTONE DATA STATES (6 states × 2 = 12 properties)
    // ========================================
    calendarHeatmapData, setCalendarHeatmapData,
    selectedCalendarDay, setSelectedCalendarDay,
    calendarViewMode, setCalendarViewMode,
    calendarCurrentMonth, setCalendarCurrentMonth,
    calendarCurrentWeek, setCalendarCurrentWeek,
    allMilestones, setAllMilestones,

    // ========================================
    // MILESTONE/CALENDAR MODAL STATES (2 states × 2 = 4 properties)
    // ========================================
    showMilestoneModal, setShowMilestoneModal,
    showJourneyCalendarModal, setShowJourneyCalendarModal,

    // ========================================
    // REFLECTION DATA STATES (4 states × 2 = 8 properties)
    // ========================================
    selectedReflection, setSelectedReflection,
    reflectionFilter, setReflectionFilter,
    reflectionData, setReflectionData,
    reflectionStats, setReflectionStats,

    // ========================================
    // REFLECTION MODAL STATE (1 state × 2 = 2 properties)
    // ========================================
    showPastReflectionsModal, setShowPastReflectionsModal,

    // ========================================
    // GRATITUDE DATA STATES (4 states × 2 = 8 properties)
    // ========================================
    gratitudeTheme, setGratitudeTheme,
    gratitudeText, setGratitudeText,
    gratitudeJournalData, setGratitudeJournalData,
    gratitudeInsights, setGratitudeInsights,

    // ========================================
    // GRATITUDE MODAL STATES (3 states × 2 = 6 properties)
    // ========================================
    showGratitudeModal, setShowGratitudeModal,
    showGratitudeThemesModal, setShowGratitudeThemesModal,
    showCopingTechniqueModal, setShowCopingTechniqueModal,

    // ========================================
    // CHALLENGES MODAL STATES (5 states × 2 = 10 properties)
    // ========================================
    challengesHistoryData, setChallengesHistoryData,
    challengesInsights, setChallengesInsights,
    selectedChallenge, setSelectedChallenge,
    challengeCheckInStatus, setChallengeCheckInStatus,
    challengeCheckInNotes, setChallengeCheckInNotes,

    // ========================================
    // GRAPH/CHART MODAL STATES (2 states × 2 = 4 properties)
    // ========================================
    graphDateRange, setGraphDateRange,
    selectedRange, setSelectedRange,

    // ========================================
    // BREAKTHROUGH/GOALS MODAL STATES (5 states × 2 = 10 properties)
    // ========================================
    breakthroughData, setBreakthroughData,
    tomorrowGoalsData, setTomorrowGoalsData,
    yesterdayGoal, setYesterdayGoal,
    goalStatus, setGoalStatus,
    goalNotes, setGoalNotes,
    goalStats, setGoalStats,

    // ========================================
    // WEEKLY REPORT DATA STATE (1 state × 2 = 2 properties)
    // ========================================
    weeklyStats, setWeeklyStats,

    // ========================================
    // WEEKLY REPORT MODAL STATE (1 state × 2 = 2 properties)
    // ========================================
    showWeeklyReportModal, setShowWeeklyReportModal,

    // ========================================
    // COACH NOTES STATE (1 state × 2 = 2 properties)
    // ========================================
    coachNotes, setCoachNotes,

    // ========================================
    // COMMUNITY STATES (8 states × 2 = 16 properties)
    // ========================================
    activeChat, setActiveChat,
    communityMessages, setCommunityMessages,
    topicRooms, setTopicRooms,
    meetings, setMeetings,
    supportGroups, setSupportGroups,
    emergencyResources, setEmergencyResources,
    activeTopicRoom, setActiveTopicRoom,
    topicRoomMessages, setTopicRoomMessages,

    // ========================================
    // RESOURCES STATES (1 state × 2 = 2 properties)
    // ========================================
    resources, setResources,

    // ========================================
    // NOTIFICATIONS STATES (2 states × 2 = 4 properties)
    // ========================================
    notifications, setNotifications,
    unreadCount, setUnreadCount,

    // ========================================
    // LEGAL/MODAL STATES (5 states × 2 = 10 properties)
    // ========================================
    showModal, setShowModal,
    showTermsModal, setShowTermsModal,
    showPrivacyModal, setShowPrivacyModal,
    showDataHandlingModal, setShowDataHandlingModal,
    showCrisisModal, setShowCrisisModal,

    // ========================================
    // PULL-TO-REFRESH STATES (3 states × 2 = 6 properties)
    // ========================================
    pulling, setPulling,
    pullDistance, setPullDistance,
    refreshing, setRefreshing,

    // ========================================
    // IMAGE/UPLOAD STATES (3 states × 2 = 6 properties)
    // ========================================
    modalImage, setModalImage,
    selectedImage, setSelectedImage,
    uploading, setUploading,

    // ========================================
    // REFS (12 refs)
    // ========================================
    chartRef,
    cravingChartRef,
    anxietyChartRef,
    sleepChartRef,
    lifeCardsRef,
    financesCardsRef,
    savingsCarouselRef,
    wellnessCardsRef,
    fileInputRef,
    pullStartY,
    contentRef,
    listenersRef,

    // ========================================
    // STATIC DATA (2 arrays)
    // ========================================
    copingTechniques,
    gratitudeThemes,

    // ========================================
    // GOOGLE CALENDAR FUNCTIONS (7 functions)
    // ========================================
    encryptToken,
    decryptToken,
    loadGoogleConnection,
    checkGoogleToken,
    refreshGoogleToken,
    connectGoogleCalendar,
    disconnectGoogleCalendar,

    // ========================================
    // TOUCH HANDLER FUNCTIONS (13 functions)
    // ========================================
    handleLifeTouchStart,
    handleLifeTouchMove,
    handleLifeTouchEnd,
    handleFinancesTouchStart,
    handleFinancesTouchMove,
    handleFinancesTouchEnd,
    handleWellnessTouchStart,
    handleWellnessTouchMove,
    handleWellnessTouchEnd,
    handleRefresh,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,

    // ========================================
    // CORE UTILITY FUNCTIONS (3 functions)
    // ========================================
    triggerHaptic,
    setupRealtimeListeners,
    calculateSobrietyDays,

    // ========================================
    // DATA LOADING FUNCTIONS (32 functions)
    // ========================================
    loadAllData,
    loadUserData,
    loadTopicRooms,
    loadMeetings,
    loadSupportGroups,
    loadEmergencyResources,
    loadGoals,
    loadAssignments,
    loadHabits,
    loadTodayHabits,
    loadQuickReflections,
    loadTodayWins,
    loadDailyTasksStatus,
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

    // ========================================
    // DATA PREPARATION FUNCTIONS (6 functions)
    // ========================================
    prepareChartData,
    calculateGoalStats,
    calculateStreaks,
    calculateReflectionStreaks,
    calculateMilestones,
    calculateTotalCheckIns,

    // ========================================
    // MILESTONE FUNCTIONS (5 functions)
    // ========================================
    getRecoveryMilestones,
    checkMilestoneNotifications,
    loadDailyInspiration,
    loadMilestones,
    loadBroadcasts,

    // ========================================
    // CHECK-IN HANDLER FUNCTIONS (5 functions)
    // ========================================
    handlePledge,
    handleMorningCheckIn,
    handleEveningReflection,
    updateStreak,
    handleReflectionSave,

    // ========================================
    // TASK/GOAL HANDLER FUNCTIONS (6 functions)
    // ========================================
    completeAssignment,
    updateGoalProgress,
    handleAssignmentComplete,
    updateLifetimeStats,
    updateLifetimeCompletedTasks,
    submitGoalAchievement,

    // ========================================
    // COMMUNITY/MESSAGING FUNCTIONS (10 functions)
    // ========================================
    sendCommunityMessage,
    sendTopicRoomMessage,
    enterTopicRoom,
    handleTopicImageSelect,
    handleSendMessage,
    handleFlagTopicMessage,
    uploadChatImage,
    flagContent,
    shareToCommunity,
    shareReflections,

    // ========================================
    // GRATITUDE/CHALLENGE FUNCTIONS (2 functions)
    // ========================================
    saveGratitude,
    submitChallengeCheckIn,

    // ========================================
    // NOTIFICATION FUNCTIONS (4 functions)
    // ========================================
    showNotification,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    dismissBroadcast,

    // ========================================
    // PROFILE/MEDIA FUNCTIONS (3 functions)
    // ========================================
    handleProfileImageUpload,
    handleImageSelect,
    triggerSOS,

    // ========================================
    // EXPORT FUNCTIONS (2 functions)
    // ========================================
    exportDataAsJSON,
    exportDataAsPDF,

    // ========================================
    // AUTH FUNCTIONS (1 function)
    // ========================================
    handleLogout,

    // ========================================
    // PATTERN DETECTION FUNCTIONS (3 functions)
    // ========================================
    detectDayOfWeekPattern,
    detectConsecutiveDaysPattern,
    detectTimeOfDayPattern,

    // ========================================
    // MODAL COMPONENT FUNCTIONS (4 functions)
    // ========================================
    ImageModal,
    DisclaimerModal,
    LegalModal,
    CrisisModal,

    // ========================================
    // FIREBASE & UTILITIES
    // ========================================
    db: window.db,
    firebase: window.firebase,
    storage: window.storage
};

return (
    <div className="app-container">
        <div className="header">
            <div className="header-title" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {currentView === 'tasks' && (
                    <div
                        onClick={() => {
                            if (typeof triggerHaptic === 'function') triggerHaptic('light');
                            setShowSidebar(true);
                        }}
                        style={{
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '4px'
                        }}
                    >
                        <i data-lucide="menu" style={{ width: '24px', height: '24px', color: '#058585' }}></i>
                    </div>
                )}
                {currentView === 'home' && 'Home'}
                {currentView === 'tasks' && 'Tasks'}
                {currentView === 'progress' && 'Journey'}
                {currentView === 'connect' && 'Community'}
                {currentView === 'guides' && 'Guides'}
                {currentView === 'notifications' && 'Notifications'}
            </div>
            <div className="header-actions">
                {currentView === 'home' && (
                    <button className="header-btn">
                        <i data-lucide="filter" style={{width: '18px', height: '18px'}}></i>
                    </button>
                )}
                {currentView === 'tasks' && (
                    <button className="header-btn" onClick={() => setShowIncompleteTasksModal(true)}>
                        <span>Task</span>
                    </button>
                )}
                {currentView === 'progress' && (
                    <button className="header-btn" onClick={() => {
                        triggerHaptic('light');
                        setShowMilestoneModal(true);
                    }}>
                        <i data-lucide="calendar-range" style={{width: '18px', height: '18px'}}></i>
                    </button>
                )}
                {currentView === 'connect' && (
                    <button className="header-btn">
                        <i data-lucide="search" style={{width: '18px', height: '18px'}}></i>
                    </button>
                )}
                {currentView === 'guides' && (
                    <button className="header-btn">
                        <i data-lucide="search" style={{width: '18px', height: '18px'}}></i>
                    </button>
                )}
                {currentView === 'notifications' && (
                    <button className="header-btn" onClick={markAllNotificationsAsRead}>
                        <span>Mark All Read</span>
                    </button>
                )}
                <div className="header-avatar" onClick={() => setShowProfileModal(true)}>
                    {(userData?.displayName || userData?.firstName || user.email || 'U').charAt(0).toUpperCase()}
                </div>
            </div>
        </div>

        {/* Pull-to-Refresh Indicator */}
        {pulling && (
            <div style={{
                position: 'absolute',
                top: '80px',
                left: '50%',
                transform: `translateX(-50%) translateY(${Math.min(pullDistance, 80)}px)`,
                zIndex: 999,
                transition: refreshing ? 'transform 0.3s' : 'none'
            }}>
                <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: 'var(--color-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 2px 8px rgba(6, 148, 148, 0.3)',
                    animation: refreshing ? 'spin 1s linear infinite' : 'none'
                }}>
                    <i data-lucide={refreshing ? "loader" : "arrow-down"} style={{width: '24px', height: '24px', color: '#fff'}}></i>
                </div>
            </div>
        )}

        <div
            className="content"
            ref={contentRef}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
        >

            {currentView === 'home' && (
                loading || !userData ?
                    React.createElement(LoadingSpinner, { message: 'Loading your recovery data...' }) :
                    React.createElement(window.GLRSApp.components.HomeTab, { app })
            )}

            {currentView === 'tasks' && (
                loading || !goals || !assignments ?
                    React.createElement(LoadingSpinner, { message: 'Loading your tasks...' }) :
                    React.createElement(window.GLRSApp.components.TasksTab, { app })
            )}

            {currentView === 'progress' && (
                loading || !checkIns ?
                    React.createElement(LoadingSpinner, { message: 'Loading your progress...' }) :
                    React.createElement(window.GLRSApp.components.JourneyTab, { app })
            )}

            {currentView === 'connect' && (
                loading ?
                    React.createElement(LoadingSpinner, { message: 'Loading community...' }) :
                    React.createElement(window.GLRSApp.components.CommunityTab, { app })
            )}

            {currentView === 'guides' && (
                loading || !resources ?
                    React.createElement(LoadingSpinner, { message: 'Loading resources...' }) :
                    React.createElement(window.GLRSApp.components.ResourcesView, { app })
            )}

           {currentView === 'notifications' && (
                <div style={{padding: '20px', textAlign: 'center', color: '#666'}}>
                    <h3>Notifications</h3>
                    <p>Notification center coming soon!</p>
                </div>
            )}
        </div>

        {/* Phase 2: Legal Footer */}
        <div style={{
            textAlign: 'center',
            padding: '20px',
            background: 'rgba(0,0,0,0.1)',
            borderTop: '1px solid rgba(255,255,255,0.1)',
            marginBottom: '70px'
        }}>
            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)', marginBottom: '10px' }}>
                <a
                    href="#"
                    onClick={(e) => { e.preventDefault(); setShowTermsModal(true); }}
                    style={{ color: 'rgba(255,255,255,0.9)', textDecoration: 'none', margin: '0 10px' }}
                >
                    Terms of Service
                </a>
                <span>•</span>
                <a
                    href="#"
                    onClick={(e) => { e.preventDefault(); setShowPrivacyModal(true); }}
                    style={{ color: 'rgba(255,255,255,0.9)', textDecoration: 'none', margin: '0 10px' }}
                >
                    Privacy Policy
                </a>
                <span>•</span>
                <a
                    href="#"
                    onClick={(e) => { e.preventDefault(); setShowDataHandlingModal(true); }}
                    style={{ color: 'rgba(255,255,255,0.9)', textDecoration: 'none', margin: '0 10px' }}
                >
                    Data Handling
                </a>
            </div>
            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>
                © 2025 Guiding Light Recovery Services. All rights reserved.
            </div>
        </div>

        {/* Phase 2: Floating Crisis Button */}
        <div style={{
            position: 'fixed',
            bottom: '90px',
            right: '20px',
            zIndex: 999
        }}>
            <button
                onClick={() => setShowCrisisModal(true)}
                style={{
                    background: '#DC143C',
                    color: '#fff',
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    border: 'none',
                    fontSize: '28px',
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(220, 20, 60, 0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
                title="Crisis Resources"
            >
                <i data-lucide="alert-octagon" style={{width: '32px', height: '32px'}}></i>
            </button>
        </div>

        <div className="bottom-nav">
            <div
                className={`nav-item ${currentView === 'tasks' ? 'active' : ''}`}
                onClick={() => {
                    triggerHaptic('light');
                    setCurrentView('tasks');
                }}
            >
                <i data-lucide="check-square" className="nav-icon"></i>
                <div className="nav-label">Tasks</div>
            </div>
            <div
                className={`nav-item ${currentView === 'progress' ? 'active' : ''}`}
                onClick={() => {
                    triggerHaptic('light');
                    setCurrentView('progress');
                }}
            >
                <i data-lucide="trending-up" className="nav-icon"></i>
                <div className="nav-label">Journey</div>
            </div>
            <div
                className={`nav-item ${currentView === 'home' ? 'active' : ''}`}
                onClick={() => {
                    triggerHaptic('light');
                    setCurrentView('home');
                }}
            >
                <i data-lucide="home" className="nav-icon"></i>
                <div className="nav-label">Home</div>
            </div>
            <div
                className={`nav-item ${currentView === 'connect' ? 'active' : ''}`}
                onClick={() => {
                    triggerHaptic('light');
                    setCurrentView('connect');
                }}
            >
                <i data-lucide="message-circle" className="nav-icon"></i>
                <div className="nav-label">Connect</div>
            </div>
            <div
                className={`nav-item ${currentView === 'guides' ? 'active' : ''}`}
                onClick={() => {
                    triggerHaptic('light');
                    setCurrentView('guides');
                }}
            >
                <i data-lucide="book-open" className="nav-icon"></i>
                <div className="nav-label">Guides</div>
            </div>
            <div
                className={`nav-item ${currentView === 'notifications' ? 'active' : ''}`}
                onClick={() => {
                    triggerHaptic('light');
                    setCurrentView('notifications');
                }}
            >
                <i data-lucide="bell" className="nav-icon"></i>
                <div className="nav-label">Notifications</div>
                {unreadCount > 0 && (
                    <span style={{
                        position: 'absolute',
                        top: '8px',
                        right: '50%',
                        marginRight: '-16px',
                        background: '#ff4757',
                        color: '#fff',
                        borderRadius: '50%',
                        width: '16px',
                        height: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '10px',
                        fontWeight: 'bold'
                    }}>
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </div>
        </div>

      

{/* Phase 2: First-Launch Disclaimer Modal */}
{showDisclaimerModal && (
    <DisclaimerModal
        onAccept={() => {
            localStorage.setItem('disclaimerAccepted', 'true');
            localStorage.setItem('disclaimerAcceptedDate', new Date().toISOString());
            setShowDisclaimerModal(false);
        }}
    />
)}

{/* Phase 2: Legal Modals */}
{showTermsModal && (
    <LegalModal
        type="terms"
        onClose={() => setShowTermsModal(false)}
    />
)}

{showPrivacyModal && (
    <LegalModal
        type="privacy"
        onClose={() => setShowPrivacyModal(false)}
    />
)}

{showDataHandlingModal && (
    <LegalModal
        type="dataHandling"
        onClose={() => setShowDataHandlingModal(false)}
    />
)}

{/* Phase 2: Crisis Resources Modal */}
{showCrisisModal && (
    <CrisisModal
        onClose={() => setShowCrisisModal(false)}
    />
)}

{/* Tasks Sidebar Modal */}
{showSidebar && (
    <div
        style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            zIndex: 10000
        }}
        onClick={() => setShowSidebar(false)}
    >
        <div
            style={{
                width: '280px',
                background: '#FFFFFF',
                height: '100%',
                boxShadow: '2px 0 12px rgba(0,0,0,0.15)',
                overflowY: 'auto',
                animation: 'slideInLeft 0.3s ease-out'
            }}
            onClick={(e) => e.stopPropagation()}
        >
            <div style={{
                padding: '20px',
                borderBottom: '1px solid #E0E0E0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <h3 style={{ margin: 0, color: '#058585', fontSize: '18px', fontWeight: 'bold' }}>
                    Quick Actions
                </h3>
                <button
                    onClick={() => setShowSidebar(false)}
                    style={{
                        background: 'none',
                        border: 'none',
                        fontSize: '24px',
                        cursor: 'pointer',
                        color: '#666',
                        padding: '0',
                        width: '32px',
                        height: '32px'
                    }}
                >
                    ×
                </button>
            </div>

            <div style={{ padding: '10px' }}>
                {/* Habit Tracker Button */}
                <button
                    onClick={() => {
                        setShowHabitTrackerModal(true);
                        setShowSidebar(false);
                    }}
                    style={{
                        width: '100%',
                        padding: '16px',
                        marginBottom: '8px',
                        background: '#FFFFFF',
                        border: '1px solid #E0E0E0',
                        borderRadius: '8px',
                        textAlign: 'left',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px'
                    }}
                >
                    <div style={{ fontSize: '24px' }}>✅</div>
                    <div>
                        <div style={{ fontSize: '16px', fontWeight: '500', color: '#333' }}>
                            Habit Tracker
                        </div>
                        <div style={{ fontSize: '12px', color: '#999' }}>
                            Track daily habits
                        </div>
                    </div>
                </button>

                {/* Quick Reflection Button */}
                <button
                    onClick={() => {
                        setShowQuickReflectionModal(true);
                        setShowSidebar(false);
                    }}
                    style={{
                        width: '100%',
                        padding: '16px',
                        marginBottom: '8px',
                        background: '#FFFFFF',
                        border: '1px solid #E0E0E0',
                        borderRadius: '8px',
                        textAlign: 'left',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px'
                    }}
                >
                    <div style={{ fontSize: '24px' }}>💭</div>
                    <div>
                        <div style={{ fontSize: '16px', fontWeight: '500', color: '#333' }}>
                            Quick Reflection
                        </div>
                        <div style={{ fontSize: '12px', color: '#999' }}>
                            Journal your thoughts
                        </div>
                    </div>
                </button>

                {/* This Week Tasks Button */}
                <button
                    onClick={() => {
                        setShowThisWeekTasksModal(true);
                        setShowSidebar(false);
                    }}
                    style={{
                        width: '100%',
                        padding: '16px',
                        marginBottom: '8px',
                        background: '#FFFFFF',
                        border: '1px solid #E0E0E0',
                        borderRadius: '8px',
                        textAlign: 'left',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px'
                    }}
                >
                    <div style={{ fontSize: '24px' }}>📅</div>
                    <div>
                        <div style={{ fontSize: '16px', fontWeight: '500', color: '#333' }}>
                            This Week's Tasks
                        </div>
                        <div style={{ fontSize: '12px', color: '#999' }}>
                            View weekly assignments
                        </div>
                    </div>
                </button>

                {/* Today's Wins Button */}
                <button
                    onClick={() => {
                        setShowTodayWinsModal(true);
                        setShowSidebar(false);
                    }}
                    style={{
                        width: '100%',
                        padding: '16px',
                        marginBottom: '8px',
                        background: '#FFFFFF',
                        border: '1px solid #E0E0E0',
                        borderRadius: '8px',
                        textAlign: 'left',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px'
                    }}
                >
                    <div style={{ fontSize: '24px' }}>🏆</div>
                    <div>
                        <div style={{ fontSize: '16px', fontWeight: '500', color: '#333' }}>
                            Today's Wins
                        </div>
                        <div style={{ fontSize: '12px', color: '#999' }}>
                            Celebrate achievements
                        </div>
                    </div>
                </button>

                {/* Overdue Items Button */}
                <button
                    onClick={() => {
                        setShowOverdueItemsModal(true);
                        setShowSidebar(false);
                    }}
                    style={{
                        width: '100%',
                        padding: '16px',
                        marginBottom: '8px',
                        background: '#FFFFFF',
                        border: '1px solid #E0E0E0',
                        borderRadius: '8px',
                        textAlign: 'left',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px'
                    }}
                >
                    <div style={{ fontSize: '24px' }}>⚠️</div>
                    <div>
                        <div style={{ fontSize: '16px', fontWeight: '500', color: '#333' }}>
                            Overdue Items
                        </div>
                        <div style={{ fontSize: '12px', color: '#999' }}>
                            Tasks past due date
                        </div>
                    </div>
                </button>

                {/* Progress Stats Button */}
                <button
                    onClick={() => {
                        setShowProgressStatsModal(true);
                        setShowSidebar(false);
                    }}
                    style={{
                        width: '100%',
                        padding: '16px',
                        marginBottom: '8px',
                        background: '#FFFFFF',
                        border: '1px solid #E0E0E0',
                        borderRadius: '8px',
                        textAlign: 'left',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px'
                    }}
                >
                    <div style={{ fontSize: '24px' }}>📊</div>
                    <div>
                        <div style={{ fontSize: '16px', fontWeight: '500', color: '#333' }}>
                            Progress Stats
                        </div>
                        <div style={{ fontSize: '12px', color: '#999' }}>
                            Overall statistics
                        </div>
                    </div>
                </button>

                {/* Goal Progress Button */}
                <button
                    onClick={() => {
                        setShowGoalProgressModal(true);
                        setShowSidebar(false);
                    }}
                    style={{
                        width: '100%',
                        padding: '16px',
                        marginBottom: '8px',
                        background: '#FFFFFF',
                        border: '1px solid #E0E0E0',
                        borderRadius: '8px',
                        textAlign: 'left',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px'
                    }}
                >
                    <div style={{ fontSize: '24px' }}>🎯</div>
                    <div>
                        <div style={{ fontSize: '16px', fontWeight: '500', color: '#333' }}>
                            Goal Progress
                        </div>
                        <div style={{ fontSize: '12px', color: '#999' }}>
                            Track goal completion
                        </div>
                    </div>
                </button>

                {/* Incomplete Tasks Button */}
                <button
                    onClick={() => {
                        setShowIncompleteTasksModal(true);
                        setShowSidebar(false);
                    }}
                    style={{
                        width: '100%',
                        padding: '16px',
                        marginBottom: '8px',
                        background: '#FFFFFF',
                        border: '1px solid #E0E0E0',
                        borderRadius: '8px',
                        textAlign: 'left',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px'
                    }}
                >
                    <div style={{ fontSize: '24px' }}>📋</div>
                    <div>
                        <div style={{ fontSize: '16px', fontWeight: '500', color: '#333' }}>
                            Incomplete Tasks
                        </div>
                        <div style={{ fontSize: '12px', color: '#999' }}>
                            Pending items
                        </div>
                    </div>
                </button>
            </div>
        </div>
    </div>
)}

{/* Incomplete Tasks Modal */}
{showIncompleteTasksModal && (
    <div
        style={{
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
        }}
        onClick={() => setShowIncompleteTasksModal(false)}
    >
        <div
            style={{
                background: '#FFFFFF',
                borderRadius: '15px',
                maxWidth: '500px',
                width: '100%',
                maxHeight: '80vh',
                overflow: 'auto'
            }}
            onClick={(e) => e.stopPropagation()}
        >
            <div style={{
                padding: '20px',
                borderBottom: '2px solid #058585',
                background: '#058585',
                color: '#fff',
                borderRadius: '15px 15px 0 0'
            }}>
                <h2 style={{ margin: 0, fontSize: '24px' }}>
                    📋 Incomplete Tasks
                </h2>
                <p style={{ margin: '10px 0 0 0', fontSize: '14px', opacity: 0.9 }}>
                    Tasks that need your attention
                </p>
            </div>

            <div style={{ padding: '20px' }}>
                {/* Incomplete Goals */}
                {goals && goals.filter(g => !g.completed).length > 0 && (
                    <div style={{ marginBottom: '20px' }}>
                        <h3 style={{ fontSize: '16px', color: '#333', marginBottom: '10px' }}>
                            Goals
                        </h3>
                        {goals.filter(g => !g.completed).map((goal, index) => (
                            <div
                                key={index}
                                style={{
                                    padding: '12px',
                                    marginBottom: '8px',
                                    background: '#F8F9FA',
                                    borderRadius: '8px',
                                    borderLeft: '4px solid #FF9500'
                                }}
                            >
                                <div style={{ fontSize: '14px', fontWeight: '500', color: '#333' }}>
                                    {goal.title || goal.name || 'Untitled Goal'}
                                </div>
                                {goal.dueDate && (
                                    <div style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>
                                        Due: {new Date(goal.dueDate.seconds * 1000).toLocaleDateString()}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {/* Incomplete Assignments */}
                {assignments && assignments.filter(a => !a.completed).length > 0 && (
                    <div style={{ marginBottom: '20px' }}>
                        <h3 style={{ fontSize: '16px', color: '#333', marginBottom: '10px' }}>
                            Assignments
                        </h3>
                        {assignments.filter(a => !a.completed).map((assignment, index) => (
                            <div
                                key={index}
                                style={{
                                    padding: '12px',
                                    marginBottom: '8px',
                                    background: '#F8F9FA',
                                    borderRadius: '8px',
                                    borderLeft: '4px solid #058585'
                                }}
                            >
                                <div style={{ fontSize: '14px', fontWeight: '500', color: '#333' }}>
                                    {assignment.title || assignment.name || 'Untitled Assignment'}
                                </div>
                                {assignment.dueDate && (
                                    <div style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>
                                        Due: {new Date(assignment.dueDate.seconds * 1000).toLocaleDateString()}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {/* No incomplete tasks */}
                {(!goals || goals.filter(g => !g.completed).length === 0) &&
                 (!assignments || assignments.filter(a => !a.completed).length === 0) && (
                    <div style={{
                        padding: '40px 20px',
                        textAlign: 'center',
                        color: '#999'
                    }}>
                        <div style={{ fontSize: '48px', marginBottom: '15px' }}>🎉</div>
                        <div style={{ fontSize: '16px', fontWeight: '500', color: '#333', marginBottom: '8px' }}>
                            All Caught Up!
                        </div>
                        <div style={{ fontSize: '14px' }}>
                            You have no incomplete tasks
                        </div>
                    </div>
                )}

                <button
                    onClick={() => setShowIncompleteTasksModal(false)}
                    style={{
                        marginTop: '20px',
                        width: '100%',
                        background: '#6c757d',
                        color: '#fff',
                        padding: '12px',
                        borderRadius: '8px',
                        border: 'none',
                        fontSize: '16px',
                        cursor: 'pointer'
                    }}
                >
                    Close
                </button>
            </div>
        </div>
    </div>
)}

            {/* TasksSidebarModals - Sidebar Quick Actions */}
            {window.GLRSApp?.components?.TasksSidebarModals && React.createElement(window.GLRSApp.components.TasksSidebarModals, {
                // Sidebar control
                showSidebar, setShowSidebar,

                // 8 Quick Action Modal visibility flags & setters
                showHabitTrackerModal, setShowHabitTrackerModal,
                showQuickReflectionModal, setShowQuickReflectionModal,
                showThisWeekTasksModal, setShowThisWeekTasksModal,
                showOverdueItemsModal, setShowOverdueItemsModal,
                showMarkCompleteModal, setShowMarkCompleteModal,
                showProgressStatsModal, setShowProgressStatsModal,
                showGoalProgressModal, setShowGoalProgressModal,
                showTodayWinsModal, setShowTodayWinsModal,

                // Additional modal visibility flags & setters
                showIntentionsModal, setShowIntentionsModal,
                showProgressSnapshotModal, setShowProgressSnapshotModal,
                showPastIntentionsModal, setShowPastIntentionsModal,

                // Streak modals
                showStreaksModal, setShowStreaksModal,
                showReflectionStreaksModal, setShowReflectionStreaksModal,

                // Data props
                user: userData,
                goals, objectives: [], assignments,
                habits, todayHabits,
                quickReflections, todayWins,
                newHabitName, setNewHabitName,
                newReflection, setNewReflection,
                newWin, setNewWin,
                showHabitHistory, setShowHabitHistory,
                showReflectionHistory, setShowReflectionHistory,
                showWinsHistory, setShowWinsHistory,
                currentReflection: null,
                pastIntentions: [],
                graphDateRange, setGraphDateRange,
                selectedRange, setSelectedRange,
                activeGoals: goals.filter(g => g.status === 'active'),
                activeObjectives: [],
                activeAssignments: assignments.filter(a => a.status !== 'completed'),
                completionRate: 0,
                completedAssignments: assignments.filter(a => a.status === 'completed').length,
                totalAssignments: assignments.length,
                streakData, reflectionStreakData,

                // Functions
                shareToCommunity: () => {},
                triggerHaptic,
                exportGraphsToPDF: () => {},
                shareGraphsPDF: () => {}
            })}

            {/* JourneyTabModals - Journey Tab Modal System */}
            {window.GLRSApp?.components?.JourneyTabModals && React.createElement(window.GLRSApp.components.JourneyTabModals, {
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
            })}

            {/* TasksTabModals - Tasks Tab Modal System */}
            {window.GLRSApp?.components?.TasksTabModals && React.createElement(window.GLRSApp.components.TasksTabModals, {
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
                copingTechniques,
                user: userData,
                sobrietyDate: userData?.sobrietyStartDate || '',
                allMilestones,
                nextMilestone,
                reflectionData,
                reflectionFilter,
                setReflectionFilter,
                selectedReflection,
                setSelectedReflection,
                gratitudeThemes,
                gratitudeTheme,
                setGratitudeTheme,
                gratitudeText,
                setGratitudeText,

                // Function props
                triggerHaptic,
                setCurrentView,
                saveGratitude: () => {}
            })}

        </div>
    );  // Close return statement (opening at line 6075)
}  // Close PIRApp function (opening at line 2)

// Expose PIRApp to global namespace
window.GLRSApp.components.PIRApp = PIRApp;

// Backward compatibility
window.PIRApp = PIRApp;

console.log('✅ PIRApp.js loaded - Main app component available');