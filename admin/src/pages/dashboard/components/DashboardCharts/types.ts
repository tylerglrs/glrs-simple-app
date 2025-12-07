import { Timestamp } from "firebase/firestore"

export interface CheckInDataPoint {
  date: string
  mood: number
  cravings: number
  anxiety: number
  sleep: number
  count: number
}

export interface RawCheckIn {
  id: string
  userId: string
  mood?: number
  cravings?: number
  anxiety?: number
  sleep?: number
  createdAt: Timestamp | Date
}

export interface ComplianceData {
  expected: number
  actual: number
  percentage: number
}

export interface StatusDistributionData {
  active: number
  inactive: number
  critical: number
  total: number
}

export type TimeRange = 7 | 14 | 30 | 90

export const TIME_RANGE_OPTIONS: { value: TimeRange; label: string }[] = [
  { value: 7, label: "7 Days" },
  { value: 14, label: "14 Days" },
  { value: 30, label: "30 Days" },
  { value: 90, label: "90 Days" },
]

// Chart colors
export const CHART_COLORS = {
  mood: "#069494", // Teal (primary)
  cravings: "#FF8559", // Orange
  anxiety: "#F59E0B", // Amber
  sleep: "#3B82F6", // Blue
  active: "#00A86B", // Green
  inactive: "#9CA3AF", // Gray
  critical: "#EF4444", // Red
  compliant: "#00A86B", // Green
  partial: "#F59E0B", // Yellow
  noncompliant: "#EF4444", // Red
}

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

// Format date for chart labels
export function formatChartDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

// Calculate average of array
export function average(arr: number[]): number {
  if (arr.length === 0) return 0
  return Math.round((arr.reduce((a, b) => a + b, 0) / arr.length) * 10) / 10
}
