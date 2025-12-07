// ==========================================
// USER DETAIL PAGE TYPES
// ==========================================

export interface PIRUser {
  id: string
  uid: string
  email: string
  displayName?: string
  firstName?: string
  lastName?: string
  phone?: string
  dateOfBirth?: string
  profilePhoto?: string
  role: "pir"
  tenantId: string
  status?: "active" | "inactive" | "suspended"
  // Recovery Info
  sobrietyDate?: string
  sobrietyDays?: number
  substance?: string
  dailyCost?: number
  moneySaved?: number
  program?: string
  // Coach Assignment
  assignedCoach?: string
  assignedCoachName?: string
  assignedCoachEmail?: string
  // Emergency Contacts
  emergencyContacts?: EmergencyContact[]
  // Timestamps
  createdAt?: Date
  lastLogin?: Date
  lastActivity?: Date
  // Stats
  totalCheckIns?: number
  streakDays?: number
  complianceRate?: number
}

export interface EmergencyContact {
  name: string
  relationship: string
  phone: string
}

export interface Coach {
  id: string
  uid: string
  email: string
  displayName?: string
  firstName?: string
  lastName?: string
  role: "coach" | "admin"
  tenantId: string
  pirCount?: number
}

export interface Activity {
  id: string
  type: ActivityType
  description?: string
  message?: string
  pirId?: string
  userId?: string
  metadata?: Record<string, unknown>
  createdAt?: Date
  tenantId?: string
}

export type ActivityType =
  | "check_in"
  | "assignment_completed"
  | "goal_completed"
  | "message_sent"
  | "message_received"
  | "sos_triggered"
  | "login"
  | "profile_updated"
  | "resource_viewed"
  | "milestone_achieved"
  | "meeting_attended"
  | "group_joined"
  | "reflection_added"
  | "habit_completed"

export interface CheckIn {
  id: string
  pirId: string
  type: "morning" | "evening"
  mood?: number
  cravings?: number
  anxiety?: number
  sleep?: number
  gratitude?: string
  challenges?: string
  notes?: string
  createdAt?: Date
  tenantId?: string
}

export interface Goal {
  id: string
  pirId: string
  title: string
  description?: string
  category?: string
  status: "active" | "completed" | "paused"
  progress?: number
  targetDate?: Date
  objectives?: Objective[]
  createdAt?: Date
  completedAt?: Date
  tenantId?: string
}

export interface Objective {
  id: string
  title: string
  completed: boolean
  completedAt?: Date
}

export interface Assignment {
  id: string
  pirId: string
  coachId: string
  title: string
  description?: string
  type?: string
  status: "pending" | "in_progress" | "completed" | "cancelled" | "overdue"
  priority?: "low" | "medium" | "high"
  dueDate?: Date
  createdAt?: Date
  completedAt?: Date
  tenantId?: string
}

export interface Message {
  id: string
  senderId: string
  senderName?: string
  recipientId: string
  recipientName?: string
  text?: string
  content?: string
  type?: "text" | "image" | "file"
  imageUrl?: string
  status?: "sent" | "delivered" | "read"
  readAt?: Date
  direction?: "sent" | "received"
  createdAt?: Date
  tenantId?: string
}

export interface DailyPost {
  id: string
  pirId: string
  content: string
  type?: "reflection" | "win" | "post"
  imageUrl?: string
  anonymous?: boolean
  hidden?: boolean
  flagged?: boolean
  likes?: string[]
  commentCount?: number
  moderatedAt?: Date
  moderatedBy?: string
  moderatorName?: string
  createdAt?: Date
  tenantId?: string
}

export interface PostComment {
  id: string
  postId: string
  authorId: string
  authorName?: string
  text: string
  createdAt?: Date
}

export interface Resource {
  id: string
  title: string
  description?: string
  type: "article" | "video" | "audio" | "pdf" | "link"
  category?: string
  url?: string
  fileUrl?: string
  duration?: string
  createdAt?: Date
  tenantId?: string
}

export interface Meeting {
  id: string
  pirId?: string
  name: string
  type?: string
  day?: number
  time?: string
  location?: string
  address?: string
  city?: string
  isVirtual?: boolean
  conferenceUrl?: string
  source?: string
  attended?: boolean
  attendedAt?: Date
  notes?: string
}

export interface SavedMeeting extends Meeting {
  savedAt?: Date
  addedBy?: string
  addedByName?: string
  types?: string[]
  attendance?: Record<string, boolean>
  lastAttendance?: Date
}

export interface GuideNote {
  id: string
  pirId: string
  text: string
  resourceId?: string
  coachName?: string
  createdBy?: string
  createdAt?: Date
  updatedAt?: Date
  updatedBy?: string
}

export interface ResourceProgress {
  resourceId: string
  status: "not-started" | "in-progress" | "completed"
  percentComplete: number
  lastViewed?: Date
  notes?: string
}

export interface AssignedResource extends Resource {
  assignedTo?: string[]
  assignedAt?: Date
  assignedBy?: string
}

export interface Milestone {
  id: string
  pirId: string
  type: string
  title: string
  description?: string
  achievedAt?: Date
  sobrietyDays?: number
}

export interface SupportGroup {
  id: string
  name: string
  description?: string
  meetingDay?: string
  meetingTime?: string
  members?: string[]
  type?: "glrs" | "external"
}

export interface PIRNote {
  id: string
  pirId: string
  coachId: string
  content: string
  type?: "session" | "private" | "progress"
  createdAt?: Date
}

export interface CoachNote {
  id: string
  pirId: string
  coachId: string
  coachName?: string
  text: string
  category: "general" | "progress" | "concern" | "goal" | "session"
  createdAt?: Date
  updatedAt?: Date
}

export interface Gratitude {
  id: string
  pirId: string
  content?: string
  text?: string
  theme?: string
  createdAt?: Date
}

export interface Reflection {
  id: string
  pirId: string
  content?: string
  text?: string
  wins?: string[]
  createdAt?: Date
}

export interface Breakthrough {
  id: string
  pirId: string
  content?: string
  text?: string
  createdAt?: Date
}

export interface SavingsItem {
  id: string
  pirId: string
  name?: string
  description?: string
  amount: number
  category?: string
  notes?: string
  createdAt?: Date
}

export interface SavingsGoal {
  id: string
  pirId: string
  name: string
  description?: string
  targetAmount: number
  currentAmount?: number
  targetDate?: Date
  status?: "active" | "completed"
  createdAt?: Date
  completedAt?: Date
}

export interface Document {
  id: string
  pirId: string
  title: string
  type: "intake" | "progress_note" | "discharge" | "other"
  category?: string
  description?: string
  fileUrl?: string
  fileType?: string
  fileName?: string
  uploadedBy?: string
  uploadedByName?: string
  createdAt?: Date
  updatedAt?: Date
}

export interface ChartDataPoint {
  date: string
  mood?: number | null
  cravings?: number | null
  anxiety?: number | null
  sleep?: number | null
}

export interface TrendData {
  avg30: string
  avg7: string
  trend: "up" | "down" | "stable"
  change: string
}

export interface Pattern {
  type: "warning" | "positive"
  title: string
  message: string
  metric: string
  severity: "high" | "medium" | "positive"
}

// Extended Objective type for Golden Thread hierarchy
export interface ObjectiveWithGoal extends Objective {
  id: string
  goalId: string
  title: string
  description?: string
  completed: boolean
  completedAt?: Date
  createdAt?: Date
  status?: "pending" | "completed"
}

// Tab configuration
export interface Tab {
  id: string
  label: string
}

export const TABS: Tab[] = [
  { id: "overview", label: "Overview" },
  { id: "wellness", label: "Wellness" },
  { id: "tasks", label: "Tasks" },
  { id: "messages", label: "Messages" },
  { id: "meetings", label: "Meetings" },
  { id: "guides", label: "Guides" },
  { id: "journey", label: "Journey" },
  { id: "community", label: "Community" },
  { id: "financial", label: "Financial" },
  { id: "documentation", label: "Documentation" },
  { id: "activity", label: "Activity" },
]
