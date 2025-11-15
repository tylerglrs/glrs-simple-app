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
