import { Timestamp } from "firebase/firestore"

export interface PIR {
  id: string
  uid: string
  email: string
  displayName?: string
  firstName?: string
  lastName?: string
  profileImageUrl?: string
  role: string
  tenantId: string
  assignedCoach?: string
  coachName?: string
  sobrietyDate?: Timestamp | Date
  daysSober?: number
  active?: boolean
  lastCheckIn?: Timestamp | Date
  checkInStreak?: number
}

export interface Alert {
  id: string
  userId: string
  pirId?: string
  pirName?: string
  type: string
  message: string
  severity: "high" | "medium" | "low"
  status: "active" | "resolved" | "dismissed"
  createdAt: Timestamp | Date
  resolvedAt?: Timestamp | Date
}

export interface Activity {
  id: string
  userId: string
  pirId?: string
  pirName?: string
  type: ActivityType
  description: string
  metadata?: Record<string, unknown>
  createdAt: Timestamp | Date
}

export type ActivityType =
  | "check_in"
  | "assignment_completed"
  | "goal_completed"
  | "objective_completed"
  | "message_sent"
  | "sos_triggered"
  | "login"
  | "profile_updated"
  | "pledge_completed"
  | "resource_viewed"
  | "milestone_achieved"
  | "streak_update"
  | "account_created"

export interface Task {
  id: string
  title: string
  description?: string
  pirId: string
  pirName?: string
  dueDate: Timestamp | Date
  status: "pending" | "in_progress" | "completed" | "overdue"
  isOverdue?: boolean
  priority?: "high" | "medium" | "low"
  createdAt: Timestamp | Date
}

export interface DashboardStats {
  totalPirs: number
  activePirs: number
  totalCoaches: number
  alertsToday: number
  avgCompliance: number
  checkInsToday: number
}

export interface Coach {
  id: string
  uid: string
  email: string
  displayName?: string
  firstName?: string
  lastName?: string
}
