import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format a date for display
 */
export function formatDate(
  date: Date | { toDate: () => Date } | { seconds: number } | string | null | undefined,
  format: "short" | "long" | "relative" = "short"
): string {
  if (!date) return "N/A"

  let dateObj: Date

  if (date instanceof Date) {
    dateObj = date
  } else if (typeof date === "object" && "toDate" in date) {
    dateObj = date.toDate()
  } else if (typeof date === "object" && "seconds" in date) {
    dateObj = new Date(date.seconds * 1000)
  } else if (typeof date === "string") {
    dateObj = new Date(date)
  } else {
    return "N/A"
  }

  if (isNaN(dateObj.getTime())) return "N/A"

  if (format === "relative") {
    return formatRelativeTime(dateObj)
  }

  if (format === "long") {
    return dateObj.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  return dateObj.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

/**
 * Format relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(date: Date): string {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (seconds < 60) return "Just now"
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  })
}

/**
 * Truncate text with ellipsis
 */
export function truncate(str: string, length: number): string {
  if (!str) return ""
  if (str.length <= length) return str
  return str.slice(0, length) + "..."
}

/**
 * Calculate sobriety days from date
 */
export function calculateSobrietyDays(
  sobrietyDate: Date | { toDate: () => Date } | { seconds: number } | string | null | undefined
): number {
  if (!sobrietyDate) return 0

  let dateObj: Date

  if (sobrietyDate instanceof Date) {
    dateObj = sobrietyDate
  } else if (typeof sobrietyDate === "object" && "toDate" in sobrietyDate) {
    dateObj = sobrietyDate.toDate()
  } else if (typeof sobrietyDate === "object" && "seconds" in sobrietyDate) {
    dateObj = new Date(sobrietyDate.seconds * 1000)
  } else if (typeof sobrietyDate === "string") {
    // Handle YYYY-MM-DD format without timezone issues
    if (sobrietyDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const [year, month, day] = sobrietyDate.split("-").map(Number)
      dateObj = new Date(year, month - 1, day)
    } else {
      dateObj = new Date(sobrietyDate)
    }
  } else {
    return 0
  }

  if (isNaN(dateObj.getTime())) return 0

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  dateObj.setHours(0, 0, 0, 0)

  const diffTime = today.getTime() - dateObj.getTime()
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

  return Math.max(0, diffDays)
}

/**
 * Get initials from name
 */
export function getInitials(name: string | undefined | null): string {
  if (!name) return "?"
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

/**
 * Format currency
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount)
}

/**
 * Format distance to now (handles Firestore Timestamp and Date)
 */
export function formatDistanceToNow(
  date: Date | { toDate: () => Date } | { seconds: number } | null | undefined
): string {
  if (!date) return "Unknown"

  let dateObj: Date

  if (date instanceof Date) {
    dateObj = date
  } else if (typeof date === "object" && "toDate" in date) {
    dateObj = date.toDate()
  } else if (typeof date === "object" && "seconds" in date) {
    dateObj = new Date(date.seconds * 1000)
  } else {
    return "Unknown"
  }

  if (isNaN(dateObj.getTime())) return "Unknown"

  return formatRelativeTime(dateObj)
}
