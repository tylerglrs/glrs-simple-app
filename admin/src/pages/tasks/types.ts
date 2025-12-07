import { Timestamp } from "firebase/firestore"

export type AssignmentStatus = "pending" | "in-progress" | "completed" | "overdue"

export type Priority = "high" | "medium" | "low"

export type GoalStatus = "active" | "completed" | "paused"

export interface Assignment {
  id: string
  title: string
  description?: string
  pirId: string
  pirName?: string
  priority: Priority
  status: AssignmentStatus
  dueDate?: Timestamp | Date
  createdAt?: Timestamp | Date
  updatedAt?: Timestamp | Date
  completedAt?: Timestamp | Date
  createdBy?: string
  objectiveId?: string
  goalId?: string
  tenantId: string
}

export interface Objective {
  id: string
  title: string
  description?: string
  assignments: Assignment[]
}

export interface Goal {
  id: string
  title: string
  description?: string
  pirId: string
  pirName?: string
  status: GoalStatus
  objectives: Objective[]
  createdAt?: Timestamp | Date
  updatedAt?: Timestamp | Date
  targetDate?: Timestamp | Date
  tenantId: string
}

export interface CheckIn {
  id: string
  pirId: string
  pirName?: string
  date: Timestamp | Date
  mood?: number
  moodLabel?: string
  cravings?: number
  notes?: string
  goals?: string[]
  challenges?: string[]
  gratitude?: string
  createdAt?: Timestamp | Date
  type?: "morning" | "evening" | "daily"
}

export interface PIRUser {
  id: string
  uid: string
  email: string
  displayName?: string
  firstName?: string
  lastName?: string
}

// Main tab types
export type TabType = "checkins" | "goldenthread" | "overview"

// Check-in sub-tab types
export type CheckInSubTab = "all" | "evening" | "goldenthread" | "gratitude"

// Reflection type for evening reflections
export interface Reflection {
  id: string
  pirId: string
  pirName?: string
  date: Timestamp | Date
  overallDay?: number
  gratitude?: string
  challenges?: string
  tomorrowGoal?: string
  wins?: string[]
  createdAt?: Timestamp | Date
}

// Gratitude entry type
export interface GratitudeEntry {
  id: string
  pirId: string
  pirName?: string
  date: Timestamp | Date
  entry: string
  category?: string
  createdAt?: Timestamp | Date
}
