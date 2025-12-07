import { Timestamp } from 'firebase/firestore'

// =============================================================================
// USER & AUTH TYPES
// =============================================================================

export interface UserData {
  id: string
  email: string
  displayName?: string
  firstName?: string
  lastName?: string
  role: 'pir' | 'coach' | 'admin' | 'superadmin'
  coachId?: string
  coachName?: string
  sobrietyDate?: Timestamp
  tenantId: string
  profilePhoto?: string
  phone?: string
  dateOfBirth?: Timestamp
  gender?: string
  occupation?: string
  bio?: string
  recoveryStory?: string
  primarySubstance?: string
  treatmentHistory?: string[]
  status?: 'active' | 'inactive' | 'suspended'
  lastActivity?: Timestamp
  createdAt: Timestamp
  updatedAt?: Timestamp
}

// =============================================================================
// CHECK-IN & MOOD TYPES
// =============================================================================

export interface CheckIn {
  id: string
  userId: string
  tenantId: string
  type: 'morning' | 'evening'
  mood: number // 1-10
  craving: number // 1-10
  anxiety: number // 1-10
  sleep: number // 1-10 (hours or quality)
  energy?: number // 1-10
  notes?: string
  highlights?: string[]
  challenges?: string[]
  gratitude?: string
  intentions?: string[]
  createdAt: Timestamp
}

export interface Reflection {
  id: string
  userId: string
  tenantId: string
  type: 'evening' | 'quick'
  content: string
  mood?: number
  wins?: string[]
  challenges?: string[]
  learnings?: string
  tomorrow?: string
  createdAt: Timestamp
}

export interface QuickReflection {
  id: string
  userId: string
  tenantId: string
  prompt: string
  response: string
  mood?: number
  createdAt: Timestamp
}

// =============================================================================
// GOALS & TASKS (GOLDEN THREAD HIERARCHY)
// =============================================================================

export interface Goal {
  id: string
  userId: string
  tenantId: string
  title: string
  description?: string
  category: 'recovery' | 'health' | 'career' | 'relationships' | 'financial' | 'personal'
  status: 'active' | 'completed' | 'paused' | 'archived'
  targetDate?: Timestamp
  progress: number // 0-100
  createdAt: Timestamp
  updatedAt?: Timestamp
}

export interface Objective {
  id: string
  userId: string
  goalId: string
  tenantId: string
  title: string
  description?: string
  status: 'active' | 'completed' | 'paused'
  dueDate?: Timestamp
  progress: number // 0-100
  createdAt: Timestamp
  updatedAt?: Timestamp
}

export interface Assignment {
  id: string
  userId: string
  coachId: string
  goalId?: string
  objectiveId?: string
  tenantId: string
  title: string
  description?: string
  type: 'task' | 'reading' | 'exercise' | 'reflection' | 'homework'
  status: 'pending' | 'in_progress' | 'completed' | 'overdue'
  priority: 'low' | 'medium' | 'high'
  dueDate?: Timestamp
  completedAt?: Timestamp
  coachNotes?: string
  pirNotes?: string
  attachments?: string[]
  createdAt: Timestamp
  updatedAt?: Timestamp
}

// =============================================================================
// HABITS & TRACKING
// =============================================================================

export interface Habit {
  id: string
  userId: string
  tenantId: string
  name: string
  description?: string
  frequency: 'daily' | 'weekly' | 'custom'
  targetDays?: number[] // 0-6 for Sun-Sat
  reminderTime?: string
  category: 'health' | 'mindfulness' | 'social' | 'productivity' | 'recovery'
  icon?: string
  color?: string
  streak: number
  bestStreak: number
  isActive: boolean
  createdAt: Timestamp
  updatedAt?: Timestamp
}

export interface HabitCompletion {
  id: string
  habitId: string
  userId: string
  tenantId: string
  completedAt: Timestamp
  notes?: string
}

// =============================================================================
// GRATITUDE & WINS
// =============================================================================

export interface Gratitude {
  id: string
  userId: string
  tenantId: string
  theme?: string
  content: string
  imageUrl?: string
  createdAt: Timestamp
}

export interface TodayWin {
  id: string
  userId: string
  tenantId: string
  content: string
  category?: string
  createdAt: Timestamp
}

export interface Breakthrough {
  id: string
  userId: string
  tenantId: string
  title: string
  description: string
  category?: string
  date: Timestamp
  createdAt: Timestamp
}

// =============================================================================
// MEETINGS & SCHEDULE
// =============================================================================

export interface Meeting {
  id: string
  userId: string
  tenantId: string
  title: string
  description?: string
  type: 'glrs' | 'aa' | 'na' | 'other'
  location?: string
  address?: string
  coordinates?: {
    lat: number
    lng: number
  }
  isVirtual: boolean
  conferenceUrl?: string
  day?: number // 0-6 for Sun-Sat
  time: string
  duration?: number // minutes
  recurring: boolean
  recurrenceRule?: string
  createdAt: Timestamp
  updatedAt?: Timestamp
}

export interface ExternalMeeting {
  id: string
  source: 'aa' | 'na'
  region: string
  name: string
  day: number // 0-6
  time: string
  location: string
  locationFormatted?: string
  address?: string
  coordinates?: {
    lat: number
    lng: number
  }
  isVirtual: boolean
  conferenceUrl?: string
  types?: string[] // O, C, S, etc.
  notes?: string
  lastUpdated: Timestamp
}

export interface SavedMeeting {
  id: string
  meetingId: string
  meetingType: 'glrs' | 'external'
  userId: string
  tenantId: string
  notes?: string
  reminders: boolean
  createdAt: Timestamp
}

// =============================================================================
// COMMUNITY & MESSAGING
// =============================================================================

export interface CommunityMessage {
  id: string
  userId: string
  userName: string
  userPhoto?: string
  tenantId: string
  roomId?: string
  content: string
  imageUrl?: string
  reactions?: Record<string, string[]>
  isDeleted: boolean
  createdAt: Timestamp
}

export interface TopicRoom {
  id: string
  tenantId: string
  name: string
  description?: string
  icon?: string
  color?: string
  memberCount: number
  lastActivity?: Timestamp
  isActive: boolean
  createdAt: Timestamp
}

export interface SupportGroup {
  id: string
  tenantId: string
  name: string
  description?: string
  type: 'peer' | 'professional' | 'family'
  memberIds: string[]
  adminIds: string[]
  imageUrl?: string
  isPrivate: boolean
  maxMembers?: number
  createdAt: Timestamp
  updatedAt?: Timestamp
}

// =============================================================================
// DIRECT MESSAGING
// =============================================================================

export interface Conversation {
  id: string
  participantIds: string[]
  tenantId: string
  lastMessage?: string
  lastMessageAt?: Timestamp
  unreadCount?: Record<string, number>
  createdAt: Timestamp
}

export interface Message {
  id: string
  conversationId: string
  senderId: string
  senderName: string
  tenantId: string
  content: string
  imageUrl?: string
  isRead: boolean
  readAt?: Timestamp
  createdAt: Timestamp
}

// =============================================================================
// FINANCES (JAR/SAVINGS)
// =============================================================================

export interface SavingsGoal {
  id: string
  userId: string
  tenantId: string
  name: string
  targetAmount: number
  currentAmount: number
  deadline?: Timestamp
  icon?: string
  color?: string
  isCompleted: boolean
  createdAt: Timestamp
  updatedAt?: Timestamp
}

export interface SavingsItem {
  id: string
  userId: string
  goalId?: string
  tenantId: string
  type: 'deposit' | 'withdrawal'
  amount: number
  description?: string
  source?: string
  createdAt: Timestamp
}

export interface MoneyMapStop {
  id: string
  userId: string
  tenantId: string
  name: string
  description?: string
  amount: number
  date: Timestamp
  category: string
  isRecurring: boolean
  frequency?: 'daily' | 'weekly' | 'monthly' | 'yearly'
  createdAt: Timestamp
}

export interface CountdownGoal {
  id: string
  userId: string
  tenantId: string
  title: string
  targetDate: Timestamp
  category: 'milestone' | 'event' | 'goal' | 'custom'
  icon?: string
  color?: string
  description?: string
  isCompleted: boolean
  createdAt: Timestamp
}

// =============================================================================
// RESOURCES & CONTENT
// =============================================================================

export interface Resource {
  id: string
  tenantId: string
  title: string
  description?: string
  category: string
  subcategory?: string
  type: 'article' | 'video' | 'pdf' | 'link' | 'audio'
  url?: string
  content?: string
  thumbnailUrl?: string
  author?: string
  duration?: number // minutes
  tags?: string[]
  viewCount: number
  isPublished: boolean
  createdAt: Timestamp
  updatedAt?: Timestamp
}

// =============================================================================
// NOTIFICATIONS & BROADCASTS
// =============================================================================

export interface Notification {
  id: string
  userId: string
  tenantId: string
  type: 'message' | 'assignment' | 'reminder' | 'alert' | 'broadcast' | 'milestone'
  title: string
  body: string
  data?: Record<string, unknown>
  isRead: boolean
  readAt?: Timestamp
  actionUrl?: string
  createdAt: Timestamp
}

export interface Broadcast {
  id: string
  tenantId: string
  title: string
  body: string
  type: 'info' | 'warning' | 'success' | 'urgent'
  targetAudience: 'all' | 'pirs' | 'coaches' | 'specific'
  targetUserIds?: string[]
  isActive: boolean
  startDate?: Timestamp
  endDate?: Timestamp
  createdBy: string
  createdAt: Timestamp
}

export interface DailyQuote {
  id: string
  tenantId: string
  quote: string
  author?: string
  category?: string
  date: Timestamp
  isActive: boolean
}

// =============================================================================
// EMERGENCY & SAFETY
// =============================================================================

export interface EmergencyContact {
  id: string
  userId: string
  tenantId: string
  name: string
  relationship: string
  phone: string
  email?: string
  isPrimary: boolean
  notifyOnCrisis: boolean
  createdAt: Timestamp
  updatedAt?: Timestamp
}

export interface CrisisAlert {
  id: string
  userId: string
  tenantId: string
  type: 'sos' | 'keyword' | 'check_in'
  severity: 'low' | 'medium' | 'high' | 'critical'
  triggerContent?: string
  status: 'open' | 'acknowledged' | 'resolved'
  acknowledgedBy?: string
  acknowledgedAt?: Timestamp
  resolvedBy?: string
  resolvedAt?: Timestamp
  notes?: string
  createdAt: Timestamp
}

// =============================================================================
// STREAKS & GAMIFICATION
// =============================================================================

export interface Streak {
  id: string
  userId: string
  tenantId: string
  type: 'check_in' | 'reflection' | 'gratitude' | 'sobriety'
  currentStreak: number
  longestStreak: number
  lastActivityDate: Timestamp
  totalCount: number
  updatedAt: Timestamp
}

// =============================================================================
// CALENDAR & INTEGRATIONS
// =============================================================================

export interface CalendarConnection {
  id: string
  userId: string
  tenantId: string
  provider: 'google' | 'apple'
  accessToken?: string // encrypted
  refreshToken?: string // encrypted
  calendarId?: string
  syncEnabled: boolean
  lastSyncAt?: Timestamp
  createdAt: Timestamp
  updatedAt?: Timestamp
}

// =============================================================================
// TYPE EXPORTS
// =============================================================================

export type CollectionName =
  | 'users'
  | 'checkIns'
  | 'reflections'
  | 'quickReflections'
  | 'goals'
  | 'objectives'
  | 'assignments'
  | 'habits'
  | 'habitCompletions'
  | 'gratitudes'
  | 'todayWins'
  | 'breakthroughs'
  | 'meetings'
  | 'externalMeetings'
  | 'savedMeetings'
  | 'communityMessages'
  | 'topicRooms'
  | 'supportGroups'
  | 'conversations'
  | 'messages'
  | 'savingsGoals'
  | 'savingsItems'
  | 'moneyMapStops'
  | 'countdownGoals'
  | 'resources'
  | 'notifications'
  | 'broadcasts'
  | 'dailyQuotes'
  | 'emergencyContacts'
  | 'crisisAlerts'
  | 'streaks'
  | 'calendarConnections'
