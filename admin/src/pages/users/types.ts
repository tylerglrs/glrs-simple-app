import { Timestamp } from "firebase/firestore"

export type UserRole = "pir" | "coach" | "admin" | "superadmin" | "superadmin1"

export type UserStatus = "active" | "inactive" | "critical"

export type ComplianceLevel = "high" | "medium" | "low" | "unknown"

export interface User {
  id: string
  uid: string
  email: string
  displayName?: string
  firstName?: string
  lastName?: string
  role: UserRole
  tenantId: string
  active: boolean
  profileImageUrl?: string
  phone?: string
  createdAt?: Timestamp | Date
  lastLogin?: Timestamp | Date
  // PIR-specific fields
  assignedCoach?: string
  coachName?: string
  sobrietyDate?: Timestamp | Date | string
  daysSober?: number
  lastCheckIn?: Timestamp | Date
  checkInStreak?: number
  compliance?: number
  complianceLevel?: ComplianceLevel
  // Coach-specific fields
  pirCount?: number
  capacity?: number
}

export interface Coach {
  id: string
  uid: string
  email: string
  displayName?: string
  firstName?: string
  lastName?: string
  pirCount?: number
  capacity?: number
}

export interface CreateUserFormData {
  email: string
  password: string
  firstName: string
  lastName: string
  role: UserRole
  assignedCoach: string
  phone: string
  sobrietyDate: string
}

export type TabType = "pir" | "coach" | "admin"

export type StatusFilter = "all" | "active" | "inactive" | "critical"

export type ComplianceFilter = "all" | "high" | "medium" | "low"
