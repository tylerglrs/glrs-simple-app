import { Timestamp } from "firebase/firestore"

export type CalendarEventType =
  | "support_group"
  | "milestone"
  | "session"
  | "saved_meeting"
  | "assignment_due"
  | "check_in_streak"

export interface CalendarEvent {
  id: string
  title: string
  date: Date
  type: CalendarEventType
  pirId?: string
  pirName?: string
  time?: string
  description?: string
  metadata?: Record<string, unknown>
}

export interface CalendarDay {
  date: Date
  isCurrentMonth: boolean
  isToday: boolean
  events: CalendarEvent[]
}

// Event type configuration with colors
export const EVENT_TYPE_CONFIG: Record<
  CalendarEventType,
  { label: string; color: string; bgColor: string }
> = {
  support_group: {
    label: "Support Group",
    color: "#069494", // Teal (primary)
    bgColor: "#06949420",
  },
  milestone: {
    label: "PIR Milestone",
    color: "#00A86B", // Green
    bgColor: "#00A86B20",
  },
  session: {
    label: "Scheduled Session",
    color: "#2196F3", // Blue
    bgColor: "#2196F320",
  },
  saved_meeting: {
    label: "AA/NA Meeting",
    color: "#9C27B0", // Purple
    bgColor: "#9C27B020",
  },
  assignment_due: {
    label: "Assignment Due",
    color: "#FF9800", // Orange
    bgColor: "#FF980020",
  },
  check_in_streak: {
    label: "Streak Milestone",
    color: "#FFC107", // Amber
    bgColor: "#FFC10720",
  },
}

// Milestone definitions for PIR sobriety tracking
export const SOBRIETY_MILESTONES = [
  { days: 1, label: "1 Day" },
  { days: 7, label: "1 Week" },
  { days: 14, label: "2 Weeks" },
  { days: 30, label: "30 Days" },
  { days: 60, label: "60 Days" },
  { days: 90, label: "90 Days" },
  { days: 180, label: "6 Months" },
  { days: 365, label: "1 Year" },
  { days: 730, label: "2 Years" },
  { days: 1095, label: "3 Years" },
  { days: 1825, label: "5 Years" },
] as const

// Helper to convert Firestore timestamp to Date
export function toDate(value: Timestamp | Date | string | undefined): Date | null {
  if (!value) return null
  if (value instanceof Date) return value
  if (typeof value === "string") return new Date(value)
  if (value && typeof value === "object" && "toDate" in value) {
    return value.toDate()
  }
  return null
}
