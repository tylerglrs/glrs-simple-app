# GLRS LIGHTHOUSE - 6-LAYER TO 3-LAYER ARCHITECTURE SIMPLIFICATION ANALYSIS

**Created:** 2025-01-12
**Working Directory:** `/Users/tylerroberts/glrs-simple-app/Index`
**Status:** Planning Phase - Ready for Implementation

---

## EXECUTIVE SUMMARY

### Current State (6-Layer Architecture)
The application currently uses an over-engineered architecture with 6 layers of indirection:

1. **Component** → calls loader function
2. **Loader function** (loaders.js) → calls Firebase
3. **Firebase** → returns data to loader
4. **Loader** → updates global state via GLRSApp.setState()
5. **Global state** → triggers pub/sub notification
6. **All subscribed components** → re-render via useGlobalState() hook

**Total Infrastructure Files:** 4 files, 1,871 lines
**Total Component Files:** 16 files, 27,955 lines
**State References:** 918+ across all components
**setState Calls:** 387 across all components

### Target State (3-Layer Architecture)
Simplified direct Firebase access pattern:

1. **Component** → calls Firebase directly
2. **Firebase** → returns data
3. **Component** → updates its own local state with useState/setState

**Files to DELETE:** 4 infrastructure files (1,871 lines)
**Files to MODIFY:** 16 component files
**Estimated Effort:** 105-135 hours

---

## PART 1: FIREBASE QUERY REFERENCE

This section documents all 35 loader functions and their Firebase queries extracted from `/services/loaders.js` (1,068 lines).

### 1.1 PRIMARY DATA LOADER

#### Function: `loadAllData`
**Collections:** Multiple (orchestrates all other loaders)
**Query:** N/A (calls 17 other loaders in parallel)
**Data loaded:** All user data on app initialization
**State updated:** `loading: true/false`
**Complexity:** High - orchestrates entire app initialization

**Sub-loaders called:**
- loadUserData
- loadTopicRooms
- loadMeetings
- loadEmergencyResources
- loadGoals
- loadAssignments
- loadDailyInspiration
- loadMilestones
- loadBroadcasts
- loadResources
- loadSupportGroups
- loadCheckIns
- loadTodaysPledge
- loadStreak
- loadCoachNotes
- loadReflections
- loadComplianceRates

---

### 1.2 USER DATA LOADERS

#### Function: `loadUserData`
**Collections:** `users`
**Query:**
```javascript
db.collection('users').doc(user.uid).get()
```
**Data loaded:** User profile, profile image URL, coach assignment
**State updated:** `userData`, `profileImage`, `coachInfo`
**Dependencies:** If user has `assignedCoach`, loads coach document

**Secondary query:**
```javascript
db.collection('users').doc(data.assignedCoach).get()
```

---

### 1.3 COMMUNITY DATA LOADERS

#### Function: `loadTopicRooms`
**Collections:** `topicRooms`
**Query:**
```javascript
db.collection('topicRooms')
  .where('active', '==', true)
  .get()
```
**Data loaded:** Active topic discussion rooms
**State updated:** `topicRooms[]`

---

#### Function: `loadMeetings`
**Collections:** `meetings`
**Query 1 (Assigned meetings):**
```javascript
db.collection('meetings')
  .where('assignedPIRs', 'array-contains', currentUserId)
  .where('status', '==', 'scheduled')
  .get()
```

**Query 2 (Global meetings):**
```javascript
db.collection('meetings')
  .where('isGlobal', '==', true)
  .where('status', '==', 'scheduled')
  .get()
```
**Data loaded:** User's assigned meetings + global meetings (merged, deduplicated)
**State updated:** `meetings[]`
**Post-processing:** Sorts by `scheduledTime`

---

#### Function: `loadSupportGroups`
**Collections:** `supportGroups`
**Query:**
```javascript
db.collection('supportGroups')
  .where('memberIds', 'array-contains', user.uid)
  .get()
```
**Data loaded:** Support groups where user is a member
**State updated:** `supportGroups[]`

---

#### Function: `loadEmergencyResources`
**Collections:** `emergencyResources`
**Query:**
```javascript
db.collection('emergencyResources')
  .where('active', '==', true)
  .orderBy('priority', 'desc')
  .get()
```
**Data loaded:** Active emergency contact resources
**State updated:** `emergencyResources[]`

---

### 1.4 GOALS & ASSIGNMENTS LOADERS

#### Function: `loadGoals`
**Collections:** `goals`
**Query:**
```javascript
db.collection('goals')
  .where('userId', '==', user.uid)
  .where('status', '!=', 'deleted')
  .orderBy('status')
  .orderBy('createdAt', 'desc')
  .get()
```
**Data loaded:** User's active/completed goals (excludes deleted)
**State updated:** `goals[]`, `goalStats{total, active, completed}`
**Post-processing:** Filters goals by status to calculate stats

---

#### Function: `loadAssignments`
**Collections:** `assignments`
**Query:**
```javascript
db.collection('assignments')
  .where('userId', '==', user.uid)
  .where('status', '!=', 'deleted')
  .orderBy('status')
  .orderBy('dueDate', 'asc')
  .get()
```
**Data loaded:** User's assignments (excludes deleted)
**State updated:** `assignments[]`
**Sort order:** Status first, then by due date ascending

---

### 1.5 HABITS & DAILY TASKS LOADERS

#### Function: `loadHabits`
**Collections:** `habits`
**Query:**
```javascript
db.collection('habits')
  .where('userId', '==', user.uid)
  .where('active', '==', true)
  .get()
```
**Data loaded:** User's active habit tracking items
**State updated:** `habits[]`

---

#### Function: `loadTodayHabits`
**Collections:** `habitCompletions`
**Query:**
```javascript
db.collection('habitCompletions')
  .where('userId', '==', user.uid)
  .where('completedDate', '>=', Timestamp.fromDate(today))
  .get()
```
**Data loaded:** Habits completed today
**State updated:** `todayHabits[]`
**Date logic:** `today` = current date at 00:00:00

---

#### Function: `loadQuickReflections`
**Collections:** `quickReflections`
**Query:**
```javascript
db.collection('quickReflections')
  .where('userId', '==', user.uid)
  .orderBy('createdAt', 'desc')
  .limit(10)
  .get()
```
**Data loaded:** Last 10 quick reflection entries
**State updated:** `quickReflections[]`

---

#### Function: `loadTodayWins`
**Collections:** `todayWins`
**Query:**
```javascript
db.collection('todayWins')
  .where('userId', '==', user.uid)
  .where('date', '>=', Timestamp.fromDate(today))
  .get()
```
**Data loaded:** Today's wins/achievements
**State updated:** `todayWins[]`

---

#### Function: `loadDailyTasksStatus`
**Collections:** `checkIns`, `pledges`

**Query 1 (Morning check-in):**
```javascript
db.collection('checkIns')
  .where('userId', '==', user.uid)
  .where('type', '==', 'morning')
  .where('date', '>=', Timestamp.fromDate(today))
  .limit(1)
  .get()
```

**Query 2 (Evening reflection):**
```javascript
db.collection('checkIns')
  .where('userId', '==', user.uid)
  .where('type', '==', 'evening')
  .where('date', '>=', Timestamp.fromDate(today))
  .limit(1)
  .get()
```

**Query 3 (Daily pledge):**
```javascript
db.collection('pledges')
  .where('userId', '==', user.uid)
  .where('date', '>=', Timestamp.fromDate(today))
  .limit(1)
  .get()
```

**Data loaded:** Completion status of today's tasks
**State updated:** `checkInStatus{morning, evening}`, `pledgeMade`

---

### 1.6 INSPIRATION & MOTIVATION LOADERS

#### Function: `loadDailyInspiration`
**Collections:** `dailyQuotes`, `quotes`

**Query 1 (Daily quote):**
```javascript
db.collection('dailyQuotes')
  .doc(dateString)  // YYYY-MM-DD format
  .get()
```

**Query 2 (Fallback to random quote):**
```javascript
db.collection('quotes')
  .limit(50)
  .get()
```
**Data loaded:** Today's motivational quote (or random if not found)
**State updated:** `dailyQuote`
**Logic:** If no quote for today, picks random from 50 quotes

---

#### Function: `loadMilestones`
**Collections:** `milestones`
**Query:**
```javascript
db.collection('milestones')
  .where('userId', '==', user.uid)
  .orderBy('achievedDate', 'desc')
  .get()
```
**Data loaded:** User's sobriety milestones
**State updated:** `milestones[]`

---

#### Function: `loadBroadcasts`
**Collections:** `broadcasts`
**Query:**
```javascript
db.collection('broadcasts')
  .where('active', '==', true)
  .where('expiresAt', '>', Timestamp.now())
  .orderBy('expiresAt', 'desc')
  .limit(1)
  .get()
```
**Data loaded:** Most recent active broadcast (not expired)
**State updated:** `activeBroadcast`

---

### 1.7 RESOURCES & CONTENT LOADERS

#### Function: `loadResources`
**Collections:** `resources`
**Query:**
```javascript
db.collection('resources')
  .where('active', '==', true)
  .get()
```
**Data loaded:** Active educational resources (public + assigned to user)
**State updated:** `resources[]`
**Post-processing:** Client-side filter for `isPublic` OR `assignedUsers.includes(user.uid)`

**⚠️ OPTIMIZATION OPPORTUNITY:** Could use composite query instead of client-side filtering

---

### 1.8 CHECK-IN DATA LOADERS

#### Function: `loadCheckIns`
**Collections:** `checkIns`
**Query:**
```javascript
db.collection('checkIns')
  .where('userId', '==', user.uid)
  .orderBy('date', 'desc')
  .limit(30)
  .get()
```
**Data loaded:** Last 30 check-ins
**State updated:** `checkIns[]`, plus chart data via `updateChartData()`
**Side effects:** Calls `updateChartData()` helper to populate `moodChartData`, `cravingChartData`, `anxietyChartData`, `sleepChartData`

---

#### Function: `loadStreakCheckIns`
**Collections:** `streaks`
**Query:**
```javascript
db.collection('streaks')
  .doc(user.uid)
  .get()
```
**Data loaded:** User's check-in streak document
**State updated:** `checkInStreak`, `streakCheckIns[]`

---

#### Function: `loadTodaysPledge`
**Collections:** `pledges`
**Query:**
```javascript
db.collection('pledges')
  .where('userId', '==', user.uid)
  .where('date', '>=', Timestamp.fromDate(today))
  .limit(1)
  .get()
```
**Data loaded:** Whether user made pledge today
**State updated:** `pledgeMade` (boolean)

---

#### Function: `loadStreak`
**Collections:** `streaks`
**Query:**
```javascript
db.collection('streaks')
  .doc(user.uid)
  .get()
```
**Data loaded:** Check-in streak data
**State updated:** `checkInStreak`, `streakCheckIns[]`
**Default values:** If no document, sets to 0 and empty array

---

### 1.9 COACH NOTES & FEEDBACK LOADERS

#### Function: `loadCoachNotes`
**Collections:** `coachNotes`
**Query:**
```javascript
db.collection('coachNotes')
  .where('pirId', '==', user.uid)
  .orderBy('createdAt', 'desc')
  .limit(10)
  .get()
```
**Data loaded:** Last 10 notes from assigned coach
**State updated:** `coachNotes[]`

---

### 1.10 ANALYTICS & CHART DATA LOADERS

#### Function: `loadCalendarHeatmapData`
**Collections:** `checkIns`
**Query:**
```javascript
db.collection('checkIns')
  .where('userId', '==', user.uid)
  .where('date', '>=', Timestamp.fromDate(sixMonthsAgo))
  .get()
```
**Data loaded:** Check-ins from last 6 months
**State updated:** `calendarHeatmapData` (object with date keys, count values)
**Post-processing:** Aggregates check-ins by date into `{YYYY-MM-DD: count}` format

---

#### Function: `loadMoodWeekData`
**Collections:** `checkIns`
**Query:**
```javascript
db.collection('checkIns')
  .where('userId', '==', user.uid)
  .where('date', '>=', Timestamp.fromDate(sevenDaysAgo))
  .orderBy('date', 'asc')
  .get()
```
**Data loaded:** Mood data from last 7 days
**State updated:** `moodWeekData[]`
**Post-processing:** Extracts `{date, mood}` objects

---

#### Function: `loadOverallDayWeekData`
**Collections:** `checkIns`
**Query:**
```javascript
db.collection('checkIns')
  .where('userId', '==', user.uid)
  .where('type', '==', 'evening')
  .where('date', '>=', Timestamp.fromDate(sevenDaysAgo))
  .orderBy('date', 'asc')
  .get()
```
**Data loaded:** Evening reflection "overall day" scores from last 7 days
**State updated:** `overallDayWeekData[]`
**Filter:** Only evening check-ins (excludes morning)

---

#### Function: `loadGratitudeJournal`
**Collections:** `gratitudeEntries`
**Query:**
```javascript
db.collection('gratitudeEntries')
  .where('userId', '==', user.uid)
  .orderBy('date', 'desc')
  .limit(30)
  .get()
```
**Data loaded:** Last 30 gratitude journal entries
**State updated:** `gratitudeJournalData[]`

---

#### Function: `loadGratitudeInsights`
**Collections:** `gratitudeInsights`
**Query:**
```javascript
db.collection('gratitudeInsights')
  .doc(user.uid)
  .get()
```
**Data loaded:** AI-generated gratitude insights document
**State updated:** `gratitudeInsights`

---

#### Function: `loadDailyQuotes`
**Collections:** `quotes`
**Query:**
```javascript
db.collection('quotes')
  .where('active', '==', true)
  .limit(10)
  .get()
```
**Data loaded:** 10 active motivational quotes
**State updated:** `dailyQuotes[]`

---

#### Function: `loadChallengesHistory`
**Collections:** `challenges`
**Query:**
```javascript
db.collection('challenges')
  .where('userId', '==', user.uid)
  .orderBy('startDate', 'desc')
  .get()
```
**Data loaded:** User's challenge history (all challenges)
**State updated:** `challengesHistoryData[]`

---

#### Function: `loadTomorrowGoals`
**Collections:** `tomorrowGoals`
**Query:**
```javascript
db.collection('tomorrowGoals')
  .where('userId', '==', user.uid)
  .where('date', '>=', Timestamp.fromDate(tomorrow))
  .limit(1)
  .get()
```
**Data loaded:** Tomorrow's planning/goals document
**State updated:** `tomorrowGoalsData` (object or null)
**Date logic:** `tomorrow` = current date + 1 day at 00:00:00

---

#### Function: `loadGoalAchievementData`
**Collections:** `goalAchievements`
**Query:**
```javascript
db.collection('goalAchievements')
  .where('userId', '==', user.uid)
  .orderBy('achievedDate', 'desc')
  .get()
```
**Data loaded:** Goal achievement history
**State updated:** `goalHistory[]`, `goalStats{total, completed, active}`
**Post-processing:** Calculates stats from status field

---

#### Function: `loadReflections`
**Collections:** `checkIns`
**Query:**
```javascript
db.collection('checkIns')
  .where('userId', '==', user.uid)
  .where('type', '==', 'evening')
  .orderBy('date', 'desc')
  .limit(30)
  .get()
```
**Data loaded:** Last 30 evening reflections
**State updated:** `reflectionData[]`

---

#### Function: `loadStreakReflections`
**Collections:** `reflectionStreaks`
**Query:**
```javascript
db.collection('reflectionStreaks')
  .doc(user.uid)
  .get()
```
**Data loaded:** Evening reflection streak document
**State updated:** `streakReflections`

---

#### Function: `loadChallengesInsights`
**Collections:** `challengeInsights`
**Query:**
```javascript
db.collection('challengeInsights')
  .doc(user.uid)
  .get()
```
**Data loaded:** AI-generated challenge insights
**State updated:** `challengesInsights`

---

#### Function: `loadComplianceRates`
**Collections:** `userStats`
**Query:**
```javascript
db.collection('userStats')
  .doc(user.uid)
  .get()
```
**Data loaded:** User compliance/engagement statistics
**State updated:** `complianceRate`

---

### 1.11 HELPER FUNCTIONS

#### Function: `updateChartData`
**Collections:** None (pure function)
**Query:** N/A
**Data loaded:** N/A
**State updated:** `moodChartData[]`, `cravingChartData[]`, `anxietyChartData[]`, `sleepChartData[]`
**Purpose:** Transforms check-in array into chart-ready data format `{x: Date, y: value}`
**Called by:** `loadCheckIns()`

---

#### Function: `checkMilestoneNotifications`
**Collections:** `notifications`

**Query 1 (Check if notification exists):**
```javascript
db.collection('notifications')
  .where('userId', '==', user.uid)
  .where('type', '==', 'milestone')
  .where('milestoneDay', '==', sobrietyDays)
  .limit(1)
  .get()
```

**Query 2 (Create notification if missing):**
```javascript
db.collection('notifications').add({
  userId: user.uid,
  type: 'milestone',
  milestoneDay: sobrietyDays,
  title: `${sobrietyDays} Days Sober!`,
  message: `Congratulations on ${sobrietyDays} days of sobriety!`,
  read: false,
  createdAt: FieldValue.serverTimestamp()
})
```
**Purpose:** Auto-create milestone notifications at 7, 30, 60, 90, 180, 365, 730, 1095 days
**State updated:** None (notification created in Firestore)

---

#### Function: `updateStreak`
**Collections:** `streaks`
**Query:**
```javascript
db.collection('streaks').doc(user.uid).get()
```
**Write operations:**
```javascript
// Increment streak
db.collection('streaks').doc(user.uid).update({
  currentStreak: data.currentStreak + 1,
  lastCheckIn: FieldValue.serverTimestamp()
})

// OR Reset streak (if broken)
db.collection('streaks').doc(user.uid).update({
  currentStreak: 1,
  lastCheckIn: FieldValue.serverTimestamp()
})

// OR Create first streak
db.collection('streaks').doc(user.uid).set({
  currentStreak: 1,
  lastCheckIn: FieldValue.serverTimestamp()
})
```
**Purpose:** Calculate and update check-in streak based on last check-in date
**State updated:** `checkInStreak`
**Logic:**
- If last check-in was yesterday: increment
- If last check-in was before yesterday: reset to 1
- If no streak document: create with streak = 1

---

## PART 2: FIRESTORE COLLECTION CATALOG

### Collections Summary
Based on analysis of loaders.js, the application uses **29 Firestore collections**:

| Collection | Documents | Purpose | Queries |
|------------|-----------|---------|---------|
| `users` | User documents | User profiles, settings | Doc get by UID |
| `checkIns` | Check-in entries | Morning/evening check-ins | 7 queries (type, date filters) |
| `goals` | Goal documents | User recovery goals | Where userId, status ≠ deleted |
| `assignments` | Assignment docs | Coach-assigned tasks | Where userId, status ≠ deleted |
| `topicRooms` | Room documents | Discussion topic rooms | Where active = true |
| `meetings` | Meeting documents | Support group meetings | 2 queries (assignedPIRs, isGlobal) |
| `supportGroups` | Group documents | Support group membership | Where memberIds array-contains |
| `emergencyResources` | Resource docs | Crisis resources | Where active, order by priority |
| `habits` | Habit documents | Habit tracking | Where userId, active |
| `habitCompletions` | Completion docs | Daily habit logs | Where userId, date >= today |
| `quickReflections` | Reflection docs | Quick reflection entries | Where userId, limit 10 |
| `todayWins` | Win documents | Daily wins/achievements | Where userId, date >= today |
| `pledges` | Pledge documents | Daily pledge tracker | Where userId, date >= today |
| `streaks` | Streak documents | Check-in streaks (1 per user) | Doc get by UID |
| `coachNotes` | Note documents | Coach feedback notes | Where pirId, limit 10 |
| `dailyQuotes` | Quote documents | Daily motivational quotes | Doc get by date string |
| `quotes` | Quote documents | Quote library | Where active, limit 10/50 |
| `milestones` | Milestone docs | Sobriety milestones | Where userId, order by date |
| `broadcasts` | Broadcast docs | System announcements | Where active, expiresAt > now |
| `resources` | Resource docs | Educational content | Where active (+ client filter) |
| `gratitudeEntries` | Entry documents | Gratitude journal | Where userId, limit 30 |
| `gratitudeInsights` | Insight docs | AI insights (1 per user) | Doc get by UID |
| `challenges` | Challenge docs | Recovery challenges | Where userId, order by startDate |
| `tomorrowGoals` | Goal documents | Tomorrow planning | Where userId, date >= tomorrow |
| `goalAchievements` | Achievement docs | Goal completion history | Where userId, order by achievedDate |
| `reflectionStreaks` | Streak docs | Reflection streaks (1 per user) | Doc get by UID |
| `challengeInsights` | Insight docs | Challenge AI insights (1 per user) | Doc get by UID |
| `userStats` | Stats documents | User analytics (1 per user) | Doc get by UID |
| `notifications` | Notification docs | User notifications | Where userId, type, milestoneDay |

**Total: 29 collections** (some only read, some read+write)

---

## PART 3: COMPONENT STATE DEPENDENCY ANALYSIS

This section analyzes each component file and documents its data dependencies.

### 3.1 PIRapp.js (478 lines)

**Purpose:** Root application component, orchestrates all tabs and modals

**State References:** 42 properties accessed
- Auth: `user`, `userData`, `profileImage`, `loading`, `sobrietyDays`
- Navigation: `currentView`, `showModal`
- Check-ins: `checkInStatus`, `checkInStreak`, `complianceRate`, `totalCheckIns`
- Data: `goals`, `assignments`, `checkIns`, `notifications`, `communityMessages`
- UI: `pulling`, `pullDistance`, `refreshing`, `contentRef`
- Journey: `lifeTouchStart`, `lifeTouchEnd`, `lifeCardIndex`, `lifeIsDragging`
- Finances: `financesTouchStart`, `financesTouchEnd`, `financesCardIndex`, `financesIsDragging`
- Wellness: `wellnessTouchStart`, `wellnessTouchEnd`, `wellnessCardIndex`, `wellnessIsDragging`

**setState Calls:** 38 calls
- Primarily wrapper functions passing setters to custom hooks
- Pull-to-refresh state updates
- Touch handler state updates for swipeable cards

**Loader Function Calls:** 9 direct calls
- `GLRSApp.loaders.loadAllData()` - Initial data load
- `GLRSApp.loaders.loadCheckIns()` - Refresh check-ins
- `GLRSApp.loaders.loadGoals()` - Refresh goals
- `GLRSApp.loaders.loadAssignments()` - Refresh assignments
- `GLRSApp.loaders.loadCommunityMessages()` - Refresh messages
- `GLRSApp.loaders.loadTopicRooms()` - Refresh topic rooms
- `GLRSApp.loaders.loadResources()` - Refresh resources
- `GLRSApp.loaders.loadGoogleConnection()` - Google Calendar
- `GLRSApp.loaders.loadComplianceRates()` - Stats refresh

**Migration Complexity:** **MEDIUM**
- Already uses global state via `useGlobalState()` hook
- Most data loading happens in custom hooks (useDataLoading)
- Need to replace loader calls with direct Firebase queries
- Touch handlers are already extracted, minimal changes needed

---

### 3.2 tabs/HomeTab.js (353 lines)

**Purpose:** Home dashboard view with check-in status, streak, daily tasks

**State References:** 28 properties accessed
- User: `user`, `userData`, `sobrietyDays`, `moneySaved`
- Check-ins: `checkInStatus`, `checkInStreak`, `pledgeMade`, `complianceRate`
- Data: `goals`, `assignments`, `notifications`, `activeBroadcast`
- UI: `currentView`, `showModal`, `broadcastDismissed`
- Stats: `goalStats`, `totalCheckIns`
- Chart data: `moodChartData`, `cravingChartData`, `anxietyChartData`, `sleepChartData`

**setState Calls:** 5 calls
- `setShowModal` - Open modals
- `setBroadcastDismissed` - Dismiss broadcast banner

**Loader Function Calls:** 0 direct calls
- All data loaded by PIRapp.js on mount
- Uses data from global state only

**Firebase Collections Needed:**
- `checkIns` - Today's check-in status
- `pledges` - Today's pledge status
- `streaks` - Current check-in streak
- `goals` - Active goals count
- `assignments` - Due today count
- `broadcasts` - Active broadcast message

**Migration Complexity:** **LOW**
- No direct loader calls
- All data already in global state
- Just needs to call Firebase directly instead of reading from state
- Simple queries (mostly checking existence of today's documents)

---

### 3.3 tabs/JourneyTab.js (2,538 lines)

**Purpose:** Journey tracking with Life/Finances/Wellness tabs, swipeable cards

**State References:** 153 properties accessed (highest of all tabs)
- User: `user`, `userData`, `sobrietyDays`, `moneySaved`
- Swipeable cards: All touch state for 3 tabs (life, finances, wellness)
- Journey data: `lifeCardIndex`, `financesCardIndex`, `wellnessCardIndex`
- Savings: `savingsItems`, `savingsGoals`, `moneyMapStops`, `activeSavingsGoal`, `actualMoneySaved`, `customGoalItems`
- Check-ins: All mood/craving/anxiety/sleep chart data
- Milestones: `milestones`, milestone dates
- UI: `showModal`, `expandedGraph`, `journeyTab`

**setState Calls:** 4 calls
- `setShowModal` - Open journey modals
- `setJourneyTab` - Switch between Life/Finances/Wellness
- `setExpandedGraph` - Expand/collapse graphs

**Loader Function Calls:** 0 direct calls
- All data loaded on mount by PIRapp.js
- Uses extensive state data for charts and visualizations

**Firebase Collections Needed:**
- `checkIns` - Mood/craving/anxiety/sleep data for charts
- `milestones` - Sobriety milestone history
- `savingsItems` - User's savings tracking (Finances tab)
- `savingsGoals` - Savings goals (Finances tab)
- `moneyMapStops` - Money map visualization (Finances tab)
- Custom wellness data (if stored in Firestore)

**Migration Complexity:** **HIGH**
- Largest component with most state dependencies
- Complex chart rendering logic
- Multiple sub-tabs with different data needs
- Savings data needs dedicated loader queries
- Recommendation: Break into 3 separate tab components (Life, Finances, Wellness)

---

### 3.4 tabs/TasksTab.js (2,393 lines)

**Purpose:** Goals and assignments tracking

**State References:** 115 properties accessed
- User: `user`, `userData`
- Goals: `goals`, `goalStats`
- Assignments: `assignments`
- UI: `showModal`, `showSidebar`
- Stats: Goal progress, completion rates

**setState Calls:** 27 calls
- `setShowModal` - Open task modals
- `setShowSidebar` - Toggle sidebar
- Goal/assignment interaction handlers

**Loader Function Calls:** 2 direct calls
- `GLRSApp.loaders.loadGoals()` - Refresh goals after changes
- `GLRSApp.loaders.loadAssignments()` - Refresh assignments after changes

**Firebase Collections Needed:**
- `goals` - User's goals
- `assignments` - User's assignments
- Goal progress calculations (might be in goals collection)

**Migration Complexity:** **MEDIUM**
- Moderate state dependencies
- 2 loader calls to replace with direct Firebase queries
- Most logic is UI rendering, data fetching is straightforward
- Queries are simple: where userId, status != deleted

---

### 3.5 tabs/CommunityTab.js (637 lines)

**Purpose:** Community chat, topic rooms, support groups

**State References:** 25 properties accessed
- User: `user`, `userData`
- Community: `communityMessages`, `topicRooms`, `supportGroups`, `meetings`
- Active room: `activeTopicRoom`, `topicRoomMessages`
- UI: `showModal`, `uploading`, `selectedImage`
- Message: `topicMessage`

**setState Calls:** 4 calls
- `setShowModal` - Open community modals
- `setActiveTopicRoom` - Enter topic room
- `setTopicRoomMessages` - Load room messages
- `setUploading` - Image upload state

**Loader Function Calls:** 2 direct calls
- `GLRSApp.loaders.loadTopicRooms()` - Refresh topic rooms
- `GLRSApp.loaders.loadCommunityMessages()` - Refresh main chat

**Firebase Collections Needed:**
- `topicRooms` - Active topic rooms
- `topicRooms/{roomId}/messages` - Messages in specific room (subcollection)
- `messages` - Community-wide messages
- `supportGroups` - User's support groups
- `meetings` - Upcoming meetings

**Migration Complexity:** **MEDIUM**
- Real-time listeners needed for messages
- Subcollection queries for topic room messages
- Image upload functionality already working
- 2 loader calls to replace

---

### 3.6 tabs/ProfileTab.js (490 lines)

**Purpose:** User profile, settings, data export, Google Calendar

**State References:** 35 properties accessed
- User: `user`, `userData`, `profileImage`
- Google: `googleConnected`, `googleToken`, `googleTokenExpiry`
- Stats: `sobrietyDays`, `moneySaved`, `checkInStreak`, `complianceRate`
- Data: `checkIns`, `goals`, `assignments`
- UI: `showModal`

**setState Calls:** 13 calls
- `setShowModal` - Open profile modals
- Google Calendar state updates
- Profile image updates

**Loader Function Calls:** 1 direct call
- `GLRSApp.loaders.loadUserData()` - Refresh user profile after edits

**Firebase Collections Needed:**
- `users` - User profile document
- Google Calendar integration (OAuth tokens stored in user doc)

**Migration Complexity:** **LOW**
- Simple data needs (mostly user document)
- 1 loader call to replace
- Most complexity is in Google Calendar OAuth (already working)
- Data export reads from global state (no changes needed)

---

### 3.7 tabs/ResourcesTab.js (1,112 lines)

**Purpose:** Educational resources library

**State References:** 8 properties accessed
- User: `user`, `userData`
- Resources: `resources`
- UI: `showModal`

**setState Calls:** 1 call
- `setShowModal` - Open resource viewer modal

**Loader Function Calls:** 1 direct call
- `GLRSApp.loaders.loadResources()` - Refresh resources list

**Firebase Collections Needed:**
- `resources` - Educational resources (with access control)

**Migration Complexity:** **LOW**
- Minimal state dependencies
- 1 simple loader call to replace
- Query includes client-side filtering (isPublic OR assignedUsers)

---

### 3.8 tabs/NotificationsTab.js (327 lines)

**Purpose:** Notification center

**State References:** 9 properties accessed
- User: `user`
- Notifications: `notifications`, `unreadCount`
- UI: `showModal`

**setState Calls:** 0 calls
- Read-only view
- Mark as read handled by notification actions

**Loader Function Calls:** 0 direct calls
- Notifications loaded via real-time listener in PIRapp.js
- No manual refresh needed

**Firebase Collections Needed:**
- `notifications` - User notifications

**Migration Complexity:** **LOW**
- Simplest tab
- No loader calls
- Just needs real-time listener for notifications
- Mark as read already uses direct Firebase update

---

### 3.9 modals/ModalContainer.js (8,344 lines)

**Purpose:** Centralized modal rendering system (30 modals)

**State References:** 246 properties accessed (most complex file)
- All data needed by various modals
- Chart data for pattern modals
- Goals/assignments for task modals
- Check-in data for reflection modals
- Journey data for JAR modals

**setState Calls:** 145 calls
- Modal open/close
- Form field updates
- Data refreshes after saves

**Loader Function Calls:** 15+ calls
- Every modal that saves data calls corresponding loader
- Examples: `loadGoals()`, `loadCheckIns()`, `loadReflections()`, etc.

**Firebase Collections Needed:**
- Almost all collections (modals touch everything)

**Migration Complexity:** **VERY HIGH**
- Largest file with most dependencies
- Each modal is essentially a mini-component
- 30 different modals with different data needs
- Recommendation: Break into separate modal files grouped by category

---

### 3.10 modals/JourneyTabModals.js (4,071 lines)

**Purpose:** Journey tab modal system (JAR modals, milestones)

**State References:** 44 properties
- Journey: JAR amounts, milestones, countdowns
- User: `userData`, `sobrietyDays`
- UI: `showModal`

**setState Calls:** 37 calls
- JAR amount updates
- Milestone saves
- Countdown management

**Loader Function Calls:** 4 calls
- `loadMilestones()`
- JAR data refresh
- Custom savings data

**Firebase Collections Needed:**
- `milestones`
- `jarData` (or stored in userData)
- `countdowns`
- `savingsGoals`

**Migration Complexity:** **MEDIUM-HIGH**
- Large file but focused domain
- JAR data structure needs mapping
- 4 loader calls to replace

---

### 3.11 modals/TasksTabModals.js (1,578 lines)

**Purpose:** Tasks tab modal system (pattern charts, insights)

**State References:** 42 properties
- Chart data: All mood/craving/anxiety/sleep arrays
- Check-ins: `checkIns`, reflection data
- Pattern detection: AI insights
- UI: `showModal`, date ranges

**setState Calls:** 41 calls
- Modal navigation
- Date range selection
- Chart configuration

**Loader Function Calls:** 3 calls
- `loadCheckIns()`
- Chart data refresh
- Pattern detection trigger

**Firebase Collections Needed:**
- `checkIns`
- `gratitudeEntries`
- `challenges`
- Pattern detection (might be calculated client-side)

**Migration Complexity:** **MEDIUM**
- Chart rendering complexity
- Pattern detection logic
- 3 loader calls to replace

---

### 3.12 modals/TasksSidebarModals.js (3,105 lines)

**Purpose:** Tasks sidebar quick action modals

**State References:** 114 properties
- Tasks: `habits`, `todayHabits`, `quickReflections`, `todayWins`
- Goals: Goal progress data
- Check-ins: Completion status
- UI: Multiple modal states

**setState Calls:** 51 calls
- Quick action saves
- Habit completion toggles
- Reflection saves

**Loader Function Calls:** 6+ calls
- `loadHabits()`
- `loadTodayHabits()`
- `loadQuickReflections()`
- `loadTodayWins()`
- `loadGoals()`
- `loadCheckIns()`

**Firebase Collections Needed:**
- `habits`
- `habitCompletions`
- `quickReflections`
- `todayWins`
- `goals`

**Migration Complexity:** **HIGH**
- Multiple quick action patterns
- 6+ loader calls to replace
- Habit tracking has complex logic

---

### 3.13 modals/JourneyTabHomeModals.js (672 lines)

**Purpose:** Journey tab home view modals

**State References:** 17 properties
- Journey: Home tab data
- User: `userData`, `sobrietyDays`
- UI: `showModal`

**setState Calls:** 15 calls
- Modal interactions
- Journey home data updates

**Loader Function Calls:** 2 calls
- Journey home data refresh
- Milestone updates

**Firebase Collections Needed:**
- `milestones`
- Journey home data (collection TBD)

**Migration Complexity:** **MEDIUM**
- Focused domain
- 2 loader calls
- Moderate complexity

---

### 3.14 modals/SharedModals.js (637 lines)

**Purpose:** Shared modals across all tabs (legal, crisis, image viewer)

**State References:** 3 properties
- UI: `showModal`
- User: `user`
- Emergency: `emergencyResources`

**setState Calls:** 6 calls
- Modal open/close
- Image viewer state

**Loader Function Calls:** 0 calls
- All data already loaded
- Static modals (Terms, Privacy, Crisis)

**Firebase Collections Needed:**
- None (legal content is static)
- `emergencyResources` (already loaded on init)

**Migration Complexity:** **VERY LOW**
- No loader calls
- Minimal state dependencies
- Static content

---

### 3.15 modals/GoalModal.js (1,403 lines)

**Purpose:** Goal creation/editing modal

**State References:** 18 properties
- Goals: `goals`, goal form data
- User: `user`, `userData`
- UI: `showModal`

**setState Calls:** 0 calls
- All updates via parent component

**Loader Function Calls:** 0 calls
- Parent component calls `loadGoals()` after save

**Firebase Collections Needed:**
- `goals`

**Migration Complexity:** **LOW**
- No loader calls (parent handles refresh)
- Simple goal CRUD operations
- Direct Firebase writes already working

---

### 3.16 modals/GroupDetailModal.js (14 lines)

**Purpose:** Support group detail modal (stub/placeholder)

**State References:** 0 properties

**setState Calls:** 0 calls

**Loader Function Calls:** 0 calls

**Migration Complexity:** **NONE**
- Empty/placeholder file
- Can be deleted or left as-is

---

## PART 4: MIGRATION COMPLEXITY MATRIX

| Component | Lines | State Refs | setState | Loaders | Complexity | Priority | Estimated Hours |
|-----------|-------|------------|----------|---------|------------|----------|-----------------|
| **Infrastructure (DELETE)** |
| services/state.js | 278 | N/A | N/A | N/A | N/A | 1 | 1 |
| services/loaders.js | 1068 | N/A | N/A | N/A | N/A | 1 | 1 |
| services/handlers.js | 477 | N/A | N/A | N/A | N/A | 1 | 1 |
| services/useGlobalState.js | 48 | N/A | N/A | N/A | N/A | 1 | 1 |
| **Tabs (MODIFY)** |
| tabs/HomeTab.js | 353 | 28 | 5 | 0 | LOW | 2 | 3-4 |
| tabs/NotificationsTab.js | 327 | 9 | 0 | 0 | LOW | 2 | 2-3 |
| tabs/ProfileTab.js | 490 | 35 | 13 | 1 | LOW | 2 | 4-5 |
| tabs/ResourcesTab.js | 1112 | 8 | 1 | 1 | LOW | 2 | 3-4 |
| tabs/CommunityTab.js | 637 | 25 | 4 | 2 | MEDIUM | 3 | 5-6 |
| tabs/TasksTab.js | 2393 | 115 | 27 | 2 | MEDIUM | 3 | 8-10 |
| tabs/JourneyTab.js | 2538 | 153 | 4 | 0 | HIGH | 4 | 12-15 |
| **Modals (MODIFY)** |
| modals/SharedModals.js | 637 | 3 | 6 | 0 | VERY LOW | 2 | 2 |
| modals/GoalModal.js | 1403 | 18 | 0 | 0 | LOW | 2 | 3-4 |
| modals/GroupDetailModal.js | 14 | 0 | 0 | 0 | NONE | 5 | 0.5 |
| modals/JourneyTabHomeModals.js | 672 | 17 | 15 | 2 | MEDIUM | 3 | 5-6 |
| modals/TasksTabModals.js | 1578 | 42 | 41 | 3 | MEDIUM | 3 | 6-8 |
| modals/JourneyTabModals.js | 4071 | 44 | 37 | 4 | MEDIUM-HIGH | 4 | 10-12 |
| modals/TasksSidebarModals.js | 3105 | 114 | 51 | 6 | HIGH | 4 | 10-12 |
| modals/ModalContainer.js | 8344 | 246 | 145 | 15+ | VERY HIGH | 5 | 20-25 |
| **Root Component** |
| PIRapp.js | 478 | 42 | 38 | 9 | MEDIUM | 1 | 6-8 |
| **TOTALS** | **29,923** | **918** | **387** | **46** | - | - | **105-135** |

---

## PART 5: EXECUTION PLAN

### Phase 1: Infrastructure Cleanup (4 hours)

**Goal:** Remove global state infrastructure files

**Tasks:**
1. **Delete 4 service files** (1 hour)
   - `/services/state.js`
   - `/services/loaders.js`
   - `/services/handlers.js`
   - `/services/useGlobalState.js`
   - Backup files before deletion

2. **Create Firebase utilities file** (2 hours)
   - `/utils/firebase.js` - Reusable query builders
   - Helper functions for common query patterns
   - Date range utilities (today, last 7 days, last 30 days, etc.)
   - Example:
   ```javascript
   // /utils/firebase.js
   export const getTodayCheckIns = async (userId, type) => {
       const today = new Date();
       today.setHours(0, 0, 0, 0);
       return await db.collection('checkIns')
           .where('userId', '==', userId)
           .where('type', '==', type)
           .where('date', '>=', firebase.firestore.Timestamp.fromDate(today))
           .limit(1)
           .get();
   };
   ```

3. **Update index.html script tags** (1 hour)
   - Remove references to deleted service files
   - Add new `/utils/firebase.js` script tag

**Deliverables:**
- ✅ 4 infrastructure files deleted
- ✅ New `/utils/firebase.js` with common query helpers
- ✅ Updated script tags in index.html

---

### Phase 2: Low-Complexity Components (12-16 hours)

**Goal:** Migrate simple components with 0-1 loader calls

**Priority 2 Components:**

#### 2.1 tabs/NotificationsTab.js (2-3 hours)
**Current:** Reads from `state.notifications`
**Target:** Add real-time listener in useEffect
```javascript
useEffect(() => {
    if (!user) return;
    const unsubscribe = db.collection('notifications')
        .where('userId', '==', user.uid)
        .orderBy('createdAt', 'desc')
        .onSnapshot(snapshot => {
            const notifs = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setNotifications(notifs);
        });
    return () => unsubscribe();
}, [user]);
```

#### 2.2 tabs/HomeTab.js (3-4 hours)
**Current:** Reads from `state.checkInStatus`, `state.goals`, etc.
**Target:** Add 3 Firebase queries in useEffect
```javascript
// Query 1: Today's check-ins
const todayCheckIns = await getTodayCheckIns(user.uid);

// Query 2: Active goals count
const goalsSnap = await db.collection('goals')
    .where('userId', '==', user.uid)
    .where('status', '==', 'active')
    .get();

// Query 3: Due today assignments
const assignmentsSnap = await db.collection('assignments')
    .where('userId', '==', user.uid)
    .where('dueDate', '>=', todayStart)
    .where('dueDate', '<', tomorrowStart)
    .get();

setHomeData({
    checkInsDone: !todayCheckIns.empty,
    activeGoals: goalsSnap.size,
    dueToday: assignmentsSnap.size
});
```

#### 2.3 tabs/ProfileTab.js (4-5 hours)
**Current:** Reads from `state.userData`, calls `loadUserData()` once
**Target:** Direct user document query + update
```javascript
// Load user data
const loadProfile = async () => {
    const userDoc = await db.collection('users').doc(user.uid).get();
    setUserData(userDoc.data());
};

// Update profile
const saveProfile = async (updates) => {
    await db.collection('users').doc(user.uid).update(updates);
    await loadProfile(); // Refresh
};
```

#### 2.4 tabs/ResourcesTab.js (3-4 hours)
**Current:** Reads from `state.resources`, calls `loadResources()` once
**Target:** Direct resources query
```javascript
const loadResources = async () => {
    const resourcesSnap = await db.collection('resources')
        .where('active', '==', true)
        .get();

    const resources = resourcesSnap.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(r => r.isPublic || r.assignedUsers?.includes(user.uid));

    setResources(resources);
};
```

#### 2.5 modals/SharedModals.js (2 hours)
**Current:** Reads from `state.emergencyResources`
**Target:** Load emergency resources on mount
```javascript
useEffect(() => {
    const loadEmergencyResources = async () => {
        const snap = await db.collection('emergencyResources')
            .where('active', '==', true)
            .orderBy('priority', 'desc')
            .get();
        setEmergencyResources(snap.docs.map(doc => doc.data()));
    };
    loadEmergencyResources();
}, []);
```

#### 2.6 modals/GoalModal.js (3-4 hours)
**Current:** No loader calls (parent refreshes)
**Target:** Add local refresh callback
```javascript
const handleSaveGoal = async (goalData) => {
    await db.collection('goals').add({
        ...goalData,
        userId: user.uid,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });

    // Call parent's refresh function
    onGoalSaved?.();
};
```

**Phase 2 Deliverables:**
- ✅ 6 low-complexity components migrated
- ✅ All components use local useState instead of global state
- ✅ All components make direct Firebase calls
- ✅ Zero dependencies on services/loaders.js

---

### Phase 3: Medium-Complexity Components (24-32 hours)

**Goal:** Migrate components with 2-4 loader calls and moderate state

**Priority 3 Components:**

#### 3.1 tabs/CommunityTab.js (5-6 hours)
**Current:** Reads from `state.communityMessages`, `state.topicRooms`, calls 2 loaders
**Target:** 3 Firebase queries + real-time listeners
```javascript
// Real-time listener for community messages
useEffect(() => {
    const unsubscribe = db.collection('messages')
        .where('tenantId', '==', TENANT_ID)
        .orderBy('createdAt', 'desc')
        .limit(50)
        .onSnapshot(snapshot => {
            const messages = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setCommunityMessages(messages);
        });
    return () => unsubscribe();
}, []);

// Real-time listener for topic rooms
useEffect(() => {
    const unsubscribe = db.collection('topicRooms')
        .where('active', '==', true)
        .onSnapshot(snapshot => {
            const rooms = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setTopicRooms(rooms);
        });
    return () => unsubscribe();
}, []);

// Load support groups (one-time)
useEffect(() => {
    const loadGroups = async () => {
        const snap = await db.collection('supportGroups')
            .where('memberIds', 'array-contains', user.uid)
            .get();
        setSupportGroups(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };
    loadGroups();
}, [user.uid]);
```

#### 3.2 tabs/TasksTab.js (8-10 hours)
**Current:** Reads from `state.goals`, `state.assignments`, calls 2 loaders
**Target:** 2 Firebase queries with real-time updates
```javascript
// Real-time listener for goals
useEffect(() => {
    if (!user) return;
    const unsubscribe = db.collection('goals')
        .where('userId', '==', user.uid)
        .where('status', '!=', 'deleted')
        .orderBy('status')
        .orderBy('createdAt', 'desc')
        .onSnapshot(snapshot => {
            const goals = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setGoals(goals);

            // Calculate stats locally
            setGoalStats({
                total: goals.length,
                active: goals.filter(g => g.status === 'active').length,
                completed: goals.filter(g => g.status === 'completed').length
            });
        });
    return () => unsubscribe();
}, [user]);

// Real-time listener for assignments
useEffect(() => {
    if (!user) return;
    const unsubscribe = db.collection('assignments')
        .where('userId', '==', user.uid)
        .where('status', '!=', 'deleted')
        .orderBy('status')
        .orderBy('dueDate', 'asc')
        .onSnapshot(snapshot => {
            const assignments = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setAssignments(assignments);
        });
    return () => unsubscribe();
}, [user]);
```

#### 3.3 modals/JourneyTabHomeModals.js (5-6 hours)
**Current:** Calls 2 loaders
**Target:** Direct milestone queries
```javascript
const loadMilestones = async () => {
    const snap = await db.collection('milestones')
        .where('userId', '==', user.uid)
        .orderBy('achievedDate', 'desc')
        .get();
    setMilestones(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
};

const saveMilestone = async (milestoneData) => {
    await db.collection('milestones').add({
        ...milestoneData,
        userId: user.uid,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    await loadMilestones(); // Refresh
};
```

#### 3.4 modals/TasksTabModals.js (6-8 hours)
**Current:** Calls 3 loaders (checkIns, chart data, patterns)
**Target:** Check-in queries with local chart processing
```javascript
const loadCheckInsForCharts = async () => {
    const snap = await db.collection('checkIns')
        .where('userId', '==', user.uid)
        .orderBy('date', 'desc')
        .limit(30)
        .get();

    const checkIns = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setCheckIns(checkIns);

    // Process chart data locally
    const moodData = checkIns
        .filter(c => c.mood !== undefined)
        .map(c => ({ x: c.date.toDate(), y: c.mood }));
    setMoodChartData(moodData);

    // ... same for craving, anxiety, sleep
};
```

**Phase 3 Deliverables:**
- ✅ 4 medium-complexity components migrated
- ✅ Real-time listeners implemented where appropriate
- ✅ Local state management working
- ✅ Chart data processing moved to component level

---

### Phase 4: High-Complexity Components (32-40 hours)

**Goal:** Migrate large components with 4+ loader calls and extensive state

**Priority 4 Components:**

#### 4.1 tabs/JourneyTab.js (12-15 hours)
**Recommendation:** **Split into 3 separate components first**
- `tabs/JourneyLifeTab.js` - Life tracking (500-700 lines)
- `tabs/JourneyFinancesTab.js` - Finances/savings tracking (800-1000 lines)
- `tabs/JourneyWellnessTab.js` - Wellness graphs (800-1000 lines)

Then migrate each:

**JourneyLifeTab.js:**
```javascript
// Milestones query
const loadMilestones = async () => {
    const snap = await db.collection('milestones')
        .where('userId', '==', user.uid)
        .orderBy('achievedDate', 'desc')
        .get();
    setMilestones(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
};
```

**JourneyFinancesTab.js:**
```javascript
// Savings items query
const loadSavingsData = async () => {
    const [itemsSnap, goalsSnap, stopsSnap] = await Promise.all([
        db.collection('savingsItems').where('userId', '==', user.uid).get(),
        db.collection('savingsGoals').where('userId', '==', user.uid).get(),
        db.collection('moneyMapStops').where('userId', '==', user.uid).get()
    ]);

    setSavingsItems(itemsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    setSavingsGoals(goalsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    setMoneyMapStops(stopsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
};
```

**JourneyWellnessTab.js:**
```javascript
// Check-ins for wellness graphs
const loadWellnessData = async () => {
    const snap = await db.collection('checkIns')
        .where('userId', '==', user.uid)
        .orderBy('date', 'desc')
        .limit(30)
        .get();

    const checkIns = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Process for graphs
    processWellnessGraphs(checkIns);
};
```

#### 4.2 modals/JourneyTabModals.js (10-12 hours)
**Current:** 4 loader calls (milestones, JAR data, savings)
**Target:** Direct queries for each modal
```javascript
// JAR Modal
const loadJARData = async () => {
    const userDoc = await db.collection('users').doc(user.uid).get();
    const jarData = userDoc.data()?.jarData || {};
    setJarData(jarData);
};

const saveJARAmount = async (category, amount) => {
    await db.collection('users').doc(user.uid).update({
        [`jarData.${category}`]: amount
    });
    await loadJARData();
};

// Milestone Modal
const loadMilestones = async () => {
    const snap = await db.collection('milestones')
        .where('userId', '==', user.uid)
        .orderBy('achievedDate', 'desc')
        .get();
    setMilestones(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
};
```

#### 4.3 modals/TasksSidebarModals.js (10-12 hours)
**Current:** 6 loader calls (habits, reflections, wins, goals)
**Target:** Direct queries for sidebar actions
```javascript
// Habits
const loadHabits = async () => {
    const [habitsSnap, completionsSnap] = await Promise.all([
        db.collection('habits')
            .where('userId', '==', user.uid)
            .where('active', '==', true)
            .get(),
        db.collection('habitCompletions')
            .where('userId', '==', user.uid)
            .where('completedDate', '>=', todayStart)
            .get()
    ]);

    setHabits(habitsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    setTodayHabits(completionsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
};

// Quick Reflections
const loadQuickReflections = async () => {
    const snap = await db.collection('quickReflections')
        .where('userId', '==', user.uid)
        .orderBy('createdAt', 'desc')
        .limit(10)
        .get();
    setQuickReflections(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
};

// Today Wins
const loadTodayWins = async () => {
    const snap = await db.collection('todayWins')
        .where('userId', '==', user.uid)
        .where('date', '>=', todayStart)
        .get();
    setTodayWins(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
};
```

**Phase 4 Deliverables:**
- ✅ JourneyTab split into 3 separate components
- ✅ 3 high-complexity modal files migrated
- ✅ All direct Firebase queries working
- ✅ No global state dependencies

---

### Phase 5: PIRapp.js Root Component (6-8 hours)

**Goal:** Simplify root component, remove global state orchestration

**Current Architecture:**
```javascript
// PIRapp.js - Current (6-layer)
const state = window.GLRSApp.hooks.useGlobalState();
// ... 407 lines of state management
GLRSApp.loaders.loadAllData(); // Loads everything into global state
```

**Target Architecture:**
```javascript
// PIRapp.js - Target (3-layer)
function PIRApp({ user }) {
    // Only minimal shared state
    const [currentView, setCurrentView] = useState('home');
    const [showModal, setShowModal] = useState(null);

    // User data (shared across views)
    const [userData, setUserData] = useState(null);
    const [sobrietyDays, setSobrietyDays] = useState(0);

    // Load user data once on mount
    useEffect(() => {
        if (!user) return;
        const loadUser = async () => {
            const userDoc = await db.collection('users').doc(user.uid).get();
            const data = userDoc.data();
            setUserData(data);

            // Calculate sobriety days
            if (data.recoveryStartDate) {
                const start = data.recoveryStartDate.toDate();
                const days = Math.floor((new Date() - start) / (1000 * 60 * 60 * 24));
                setSobrietyDays(days);
            }
        };
        loadUser();
    }, [user]);

    // Pass minimal props to child views
    return (
        <div className="app-container">
            <HeaderBar user={user} userData={userData} />

            {currentView === 'home' && (
                <HomeTab user={user} userData={userData} sobrietyDays={sobrietyDays} />
            )}
            {currentView === 'journey' && (
                <JourneyTab user={user} userData={userData} sobrietyDays={sobrietyDays} />
            )}
            {/* ... other views */}

            <BottomNavigation currentView={currentView} onViewChange={setCurrentView} />
        </div>
    );
}
```

**Changes:**
- Remove `useGlobalState()` hook
- Remove all `GLRSApp.loaders.*` calls
- Keep only minimal shared state (user, view, modal)
- Each tab loads its own data independently
- No pub/sub pattern needed

**Phase 5 Deliverables:**
- ✅ PIRapp.js simplified to <200 lines
- ✅ No global state dependencies
- ✅ Minimal prop passing (user, userData, sobrietyDays)
- ✅ Each tab self-contained

---

### Phase 6: ModalContainer.js Refactor (20-25 hours)

**Recommendation:** **Break into 6 category files** before migration

#### 6.1 File Structure (2 hours)
```
/modals/
  categories/
    CheckInModals.js          - Morning/evening check-in modals
    GoalModals.js             - Goal/assignment modals (already exists)
    JourneyModals.js          - Journey/JAR modals (already exists)
    TasksModals.js            - Pattern/chart modals (already exists)
    CommunityModals.js        - Topic room/group modals
    ProfileModals.js          - Settings/export modals
```

#### 6.2 Migrate Each Category (3-4 hours each)
**CheckInModals.js:**
```javascript
export const MorningCheckInModal = ({ user, onClose }) => {
    const [formData, setFormData] = useState({
        mood: 5,
        cravingsIntensity: 0,
        anxietyLevel: 0,
        notes: ''
    });

    const handleSave = async () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        await db.collection('checkIns').add({
            userId: user.uid,
            type: 'morning',
            date: firebase.firestore.Timestamp.fromDate(today),
            ...formData,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        onClose();
    };

    return (/* JSX */);
};
```

**Phase 6 Deliverables:**
- ✅ ModalContainer.js deleted (8,344 lines removed)
- ✅ 6 new category modal files created (~1,200-1,500 lines each)
- ✅ Each modal self-contained with own data loading
- ✅ No global state dependencies

---

### Phase 7: Testing & Validation (8-10 hours)

**Goal:** Ensure all functionality works with new architecture

**Testing Checklist:**

1. **Data Loading Tests** (2 hours)
   - [ ] Home tab loads check-in status correctly
   - [ ] Journey tab loads milestones and savings data
   - [ ] Tasks tab loads goals and assignments
   - [ ] Community tab loads messages and topic rooms
   - [ ] Resources tab loads resources
   - [ ] Profile tab loads user data

2. **Real-Time Updates Tests** (2 hours)
   - [ ] Notifications update in real-time
   - [ ] Community messages update in real-time
   - [ ] Goals update after edit
   - [ ] Assignments update after completion
   - [ ] Check-in streak updates immediately

3. **Modal Tests** (2 hours)
   - [ ] Morning check-in saves correctly
   - [ ] Evening reflection saves correctly
   - [ ] Goal creation/edit works
   - [ ] Assignment completion works
   - [ ] JAR amount updates work
   - [ ] Milestone creation works

4. **Edge Cases Tests** (2 hours)
   - [ ] Offline behavior (no Firebase connection)
   - [ ] Empty state handling (new user)
   - [ ] Large datasets (100+ goals, 1000+ check-ins)
   - [ ] Network errors handled gracefully
   - [ ] Missing data doesn't crash app

5. **Performance Tests** (2 hours)
   - [ ] Tab switching is fast (<100ms)
   - [ ] Data loads within 2 seconds
   - [ ] Scrolling is smooth (60 FPS)
   - [ ] No memory leaks (check with DevTools)

**Phase 7 Deliverables:**
- ✅ All tests passing
- ✅ No console errors
- ✅ Performance metrics meet targets
- ✅ Edge cases handled

---

### Phase 8: Documentation & Cleanup (2-4 hours)

**Goal:** Update documentation and remove dead code

**Tasks:**
1. **Update README** (1 hour)
   - Document new architecture (3-layer)
   - Remove references to old service files
   - Add Firebase query examples

2. **Update Code Comments** (1 hour)
   - Add JSDoc comments to Firebase query functions
   - Document component data dependencies
   - Add architecture diagrams (if needed)

3. **Delete Unused Files** (1 hour)
   - Remove service files (already deleted in Phase 1)
   - Remove any backup files (*.backup)
   - Clean up unused imports

4. **Create Migration Guide** (1 hour)
   - Document changes for future developers
   - List breaking changes (if any)
   - Provide rollback instructions

**Phase 8 Deliverables:**
- ✅ Updated README.md
- ✅ Code comments added
- ✅ Unused files removed
- ✅ Migration guide created

---

## PART 6: EFFORT SUMMARY

### Total Estimated Hours: 105-135 hours

| Phase | Description | Hours | % of Total |
|-------|-------------|-------|------------|
| 1 | Infrastructure Cleanup | 4 | 3% |
| 2 | Low-Complexity Components (6 files) | 12-16 | 12% |
| 3 | Medium-Complexity Components (4 files) | 24-32 | 24% |
| 4 | High-Complexity Components (3 files) | 32-40 | 30% |
| 5 | PIRapp.js Root Component | 6-8 | 6% |
| 6 | ModalContainer.js Refactor | 20-25 | 19% |
| 7 | Testing & Validation | 8-10 | 8% |
| 8 | Documentation & Cleanup | 2-4 | 2% |

### Files Summary

**Files to DELETE:** 4 files, 1,871 lines
- services/state.js (278 lines)
- services/loaders.js (1,068 lines)
- services/handlers.js (477 lines)
- services/useGlobalState.js (48 lines)

**Files to CREATE:** 1 file
- utils/firebase.js (~200-300 lines) - Reusable Firebase query helpers

**Files to MODIFY:** 16 files, 27,955 lines
- All tab components (7 files)
- All modal components (9 files)
- PIRapp.js (root component)

**Files to SPLIT (Recommended):**
- tabs/JourneyTab.js → 3 files (Life, Finances, Wellness)
- modals/ModalContainer.js → 6 category files

**Net Line Reduction:** ~1,600 lines deleted (infrastructure overhead removed)

---

## PART 7: RISK ASSESSMENT

### High-Risk Areas

1. **Real-Time Listeners**
   - **Risk:** Forgetting to unsubscribe causes memory leaks
   - **Mitigation:** Always return cleanup function from useEffect
   ```javascript
   useEffect(() => {
       const unsubscribe = db.collection('...').onSnapshot(...);
       return () => unsubscribe(); // CRITICAL
   }, []);
   ```

2. **Data Consistency**
   - **Risk:** Component state gets out of sync with Firestore
   - **Mitigation:** Use real-time listeners for frequently changing data (messages, notifications)
   - **Mitigation:** Reload data after mutations (create/update/delete)

3. **Query Performance**
   - **Risk:** Unoptimized queries (missing indexes, large result sets)
   - **Mitigation:** Add Firestore indexes for all compound queries
   - **Mitigation:** Use `.limit()` for list queries (never load all documents)

4. **Error Handling**
   - **Risk:** Network errors crash app or show blank screens
   - **Mitigation:** Wrap all Firebase calls in try-catch
   - **Mitigation:** Show user-friendly error messages
   ```javascript
   try {
       await db.collection('...').add(...);
   } catch (error) {
       console.error('Save failed:', error);
       alert('Failed to save. Please try again.');
   }
   ```

5. **Breaking Existing Functionality**
   - **Risk:** Migration breaks working features
   - **Mitigation:** Test each component thoroughly after migration
   - **Mitigation:** Keep backups of all files before changes
   - **Mitigation:** Deploy incrementally (one component at a time)

### Medium-Risk Areas

1. **Prop Drilling**
   - **Risk:** Need to pass `user` and `userData` through many layers
   - **Mitigation:** Use React Context for auth user (read-only)
   - **Mitigation:** Keep component tree shallow (max 3 levels)

2. **Duplicate Queries**
   - **Risk:** Multiple components query same data (inefficient)
   - **Mitigation:** Lift shared data to parent component
   - **Mitigation:** Use React Context for frequently accessed data

3. **Loading States**
   - **Risk:** Users see blank screens while data loads
   - **Mitigation:** Add loading spinners to all data-fetching components
   - **Mitigation:** Show skeleton screens for better UX

### Low-Risk Areas

1. **Static Content**
   - Legal modals (Terms, Privacy) - no data dependencies
   - Crisis resources - loaded once on mount

2. **Read-Only Views**
   - Notifications tab - just displays data
   - Resources tab - just lists resources

3. **Simple CRUD**
   - Profile updates - single document
   - Goal creation - straightforward write operation

---

## PART 8: SUCCESS CRITERIA

### Functional Requirements
- ✅ All features work exactly as before migration
- ✅ No console errors during normal usage
- ✅ Real-time updates work (notifications, messages)
- ✅ Offline behavior graceful (no crashes)
- ✅ All modals save data correctly

### Performance Requirements
- ✅ Tab switching < 100ms
- ✅ Data loads within 2 seconds
- ✅ Scrolling maintains 60 FPS
- ✅ No memory leaks (stable memory usage)
- ✅ Firebase query count < 100 per session

### Code Quality Requirements
- ✅ No global state system (state.js, loaders.js deleted)
- ✅ All components use local useState
- ✅ All Firebase calls direct (no loader functions)
- ✅ Proper cleanup functions in all useEffects
- ✅ Try-catch on all async operations
- ✅ JSDoc comments on all Firebase functions

### Architecture Requirements
- ✅ 3-layer architecture (Component → Firebase → Component)
- ✅ No pub/sub pattern
- ✅ No global state object
- ✅ Each component self-contained
- ✅ Minimal prop passing (user, userData only)

---

## PART 9: ROLLBACK PLAN

### If Migration Fails

1. **Git Revert** (Immediate - 5 minutes)
   ```bash
   git checkout main  # Discard all changes
   git pull origin main  # Get last working version
   ```

2. **File Restoration** (If files deleted - 10 minutes)
   - Restore from backup folder
   - Copy `/services/*.js` files back
   - Restore `index.html` script tags

3. **Database Rollback** (N/A)
   - No schema changes - Firestore unchanged
   - All collections remain the same
   - No data migration needed

### Prevention
- Create git branch for migration: `git checkout -b migration/simplify-architecture`
- Commit after each phase: `git commit -m "Phase 2: Low-complexity components"`
- Keep backups of all modified files in `/backups/` folder
- Test thoroughly before merging to main

---

## END OF ANALYSIS DOCUMENT

**Next Steps:**
1. Review this analysis with team
2. Get approval for execution plan
3. Create git branch: `migration/simplify-architecture`
4. Begin Phase 1: Infrastructure Cleanup
5. Follow phases sequentially, testing after each

**Questions for Review:**
- Approve 105-135 hour estimate?
- Approve phased rollout plan?
- Any concerns about breaking changes?
- Need additional testing/validation steps?
