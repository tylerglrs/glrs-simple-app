/**
 * Crisis Alerts Types
 * Phase 8E: Admin Crisis Dashboard
 *
 * Complete type definitions for the crisisAlerts collection
 * and supporting interfaces for the alerts dashboard.
 */

import { Timestamp } from 'firebase/firestore'

// ============================================================================
// CORE TYPES
// ============================================================================

/** Alert source - where the alert originated from */
export type AlertSource = 'sos' | 'ai' | 'checkin'

/** Alert tier - severity classification (1 = most severe) */
export type AlertTier = 1 | 2 | 3 | 4

/** Alert severity - human-readable severity level */
export type AlertSeverity = 'critical' | 'high' | 'medium' | 'low'

/** Alert status - current workflow state */
export type AlertStatus = 'unread' | 'acknowledged' | 'responded' | 'escalated' | 'resolved'

/** AI feature that triggered the alert (for source='ai') */
export type AIFeature =
  | 'anchor'
  | 'daily_oracle'
  | 'voice_companion'
  | 'story_mode'
  | 'guided_checkin'
  | 'prompt_cards'

/** Check-in type (for source='checkin') */
export type CheckinType = 'morning' | 'evening' | 'weekly'

/** SOS trigger location (for source='sos') */
export type SOSTriggerLocation = 'home' | 'community' | 'messages' | 'header' | 'profile'

/** Actions that can be taken on an alert */
export type AlertAction =
  | 'acknowledge'
  | 'add_note'
  | 'respond'
  | 'escalate'
  | 'resolve'
  | 'contact_pir'

// ============================================================================
// RESPONSE LOG
// ============================================================================

/** Entry in the response timeline */
export interface ResponseLogEntry {
  /** Type of action taken */
  action: 'acknowledged' | 'note_added' | 'escalated' | 'resolved' | 'contacted_pir' | 'responded'
  /** User ID who took the action */
  userId: string
  /** Display name of user who took the action */
  userName: string
  /** When the action was taken */
  timestamp: Timestamp
  /** Optional note associated with the action */
  note?: string
}

// ============================================================================
// NOTIFICATION STATUS
// ============================================================================

/** Notification delivery status for each channel */
export interface NotificationStatus {
  /** Push notification sent */
  push: boolean
  /** When push was sent */
  pushSentAt?: Timestamp
  /** Email notification sent */
  email: boolean
  /** When email was sent */
  emailSentAt?: Timestamp
  /** SMS notification sent */
  sms: boolean
  /** When SMS was sent */
  smsSentAt?: Timestamp
  /** In-app notification sent */
  inApp: boolean
  /** When in-app notification was sent */
  inAppSentAt?: Timestamp
}

// ============================================================================
// GEO POINT (for SOS location)
// ============================================================================

/** Geographic coordinates for SOS alerts */
export interface GeoPoint {
  latitude: number
  longitude: number
}

// ============================================================================
// MAIN CRISIS ALERT INTERFACE
// ============================================================================

/**
 * CrisisAlert - Complete alert document from crisisAlerts collection
 *
 * This is the primary data structure for the crisis alerts dashboard.
 * All alerts from SOS, AI, and Check-in sources share this structure.
 */
export interface CrisisAlert {
  /** Document ID */
  id: string

  // ─────────────────────────────────────────────────────────────────────────
  // Core Identification
  // ─────────────────────────────────────────────────────────────────────────

  /** PIR user ID */
  pirId: string
  /** PIR display name */
  pirName: string
  /** Assigned coach user ID (null if no coach assigned) */
  coachId: string | null
  /** Coach display name */
  coachName: string | null
  /** Tenant ID (e.g., "full-service") */
  tenantId: string

  // ─────────────────────────────────────────────────────────────────────────
  // Source & Classification
  // ─────────────────────────────────────────────────────────────────────────

  /** Where the alert originated */
  source: AlertSource
  /** Severity tier (1=Critical, 2=High, 3=Moderate, 4=Standard) */
  tier: AlertTier
  /** Human-readable severity mapped from tier */
  severity: AlertSeverity

  // ─────────────────────────────────────────────────────────────────────────
  // Alert Content
  // ─────────────────────────────────────────────────────────────────────────

  /** Keywords that triggered the detection */
  triggerKeywords: string[]
  /** Surrounding text context (up to 500 chars) */
  context: string
  /** Complete user input/message */
  fullMessage: string

  // ─────────────────────────────────────────────────────────────────────────
  // AI-Specific Data (optional, for source='ai')
  // ─────────────────────────────────────────────────────────────────────────

  /** Which AI feature detected the crisis */
  aiFeature?: AIFeature
  /** What the AI responded with (if any) */
  aiResponse?: string
  /** Were crisis resources displayed to the user? */
  resourcesDisplayed: boolean
  /** Was LLM bypassed for safety? */
  llmBypassed?: boolean

  // ─────────────────────────────────────────────────────────────────────────
  // Check-in Specific Data (optional, for source='checkin')
  // ─────────────────────────────────────────────────────────────────────────

  /** ID of the check-in document that triggered the alert */
  checkinId?: string
  /** Type of check-in */
  checkinType?: CheckinType
  /** Concerning score (1-10 scale) */
  concerningScore?: number
  /** Which fields triggered the alert */
  concerningFields?: string[]

  // ─────────────────────────────────────────────────────────────────────────
  // SOS Specific Data (optional, for source='sos')
  // ─────────────────────────────────────────────────────────────────────────

  /** Location when SOS was triggered */
  sosLocation?: GeoPoint
  /** Where in the app SOS was triggered from */
  sosTriggeredFrom?: SOSTriggerLocation

  // ─────────────────────────────────────────────────────────────────────────
  // Status & Workflow
  // ─────────────────────────────────────────────────────────────────────────

  /** Current workflow status */
  status: AlertStatus
  /** When the alert was acknowledged */
  acknowledgedAt: Timestamp | null
  /** Who acknowledged the alert */
  acknowledgedBy: string | null
  /** When a response was recorded */
  respondedAt: Timestamp | null
  /** Who responded to the alert */
  respondedBy: string | null
  /** When the alert was escalated */
  escalatedAt: Timestamp | null
  /** Who the alert was escalated to (supervisor/manager ID) */
  escalatedTo: string | null
  /** When the alert was resolved */
  resolvedAt: Timestamp | null
  /** Who resolved the alert */
  resolvedBy: string | null

  // ─────────────────────────────────────────────────────────────────────────
  // Response Tracking
  // ─────────────────────────────────────────────────────────────────────────

  /** Notes about the response */
  responseNotes: string | null
  /** Complete timeline of actions taken */
  responseLog: ResponseLogEntry[]

  // ─────────────────────────────────────────────────────────────────────────
  // Notifications
  // ─────────────────────────────────────────────────────────────────────────

  /** Status of notifications sent for this alert */
  notificationsSent: NotificationStatus

  // ─────────────────────────────────────────────────────────────────────────
  // Audit
  // ─────────────────────────────────────────────────────────────────────────

  /** When the alert was created */
  createdAt: Timestamp
  /** When the alert was last updated */
  updatedAt: Timestamp
}

// ============================================================================
// FILTER INTERFACES
// ============================================================================

/** Filter options for the alerts list */
export interface AlertFilters {
  /** Filter by source (all, sos, ai, checkin) */
  source: 'all' | AlertSource
  /** Filter by tier (all, 1, 2, 3, 4) */
  tier: 'all' | '1' | '2' | '3' | '4'
  /** Filter by status (all, or specific status) */
  status: 'all' | AlertStatus
  /** Filter by date range */
  dateRange: {
    start: Date | null
    end: Date | null
  }
  /** Filter by specific PIR */
  pirId: string | null
  /** Filter by specific coach */
  coachId: string | null
  /** Search query (PIR name, keywords) */
  searchQuery?: string
}

/** Default filter values */
export const DEFAULT_FILTERS: AlertFilters = {
  source: 'all',
  tier: 'all',
  status: 'all',
  dateRange: {
    start: null,
    end: null,
  },
  pirId: null,
  coachId: null,
  searchQuery: '',
}

// ============================================================================
// STATISTICS INTERFACES
// ============================================================================

/** Aggregated statistics for alerts */
export interface AlertStats {
  /** Total number of alerts */
  total: number
  /** Number of unread alerts */
  unread: number
  /** Number of critical (tier 1) alerts not resolved */
  critical: number
  /** Number of high (tier 2) alerts not resolved */
  high: number
  /** Number of acknowledged alerts */
  acknowledged: number
  /** Number of resolved alerts */
  resolved: number
  /** Breakdown by source */
  bySource: {
    sos: number
    ai: number
    checkin: number
  }
  /** Breakdown by tier */
  byTier: {
    1: number
    2: number
    3: number
    4: number
  }
}

/** Default stats values */
export const DEFAULT_STATS: AlertStats = {
  total: 0,
  unread: 0,
  critical: 0,
  high: 0,
  acknowledged: 0,
  resolved: 0,
  bySource: {
    sos: 0,
    ai: 0,
    checkin: 0,
  },
  byTier: {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
  },
}

// ============================================================================
// HOOK OPTIONS
// ============================================================================

/** Options for useAlerts hook */
export interface UseAlertsOptions {
  /** Tenant ID to filter by */
  tenantId: string
  /** Coach ID for coach-scoped views (optional) */
  coachId?: string
  /** Maximum number of alerts to fetch */
  limit?: number
}

/** Options for useAlertBadge hook */
export interface UseAlertBadgeOptions {
  /** Tenant ID to filter by */
  tenantId?: string
  /** Coach ID for coach-scoped views (optional) */
  coachId?: string
}

// ============================================================================
// COMPONENT PROPS INTERFACES
// ============================================================================

/** Props for AlertStatsCards component */
export interface AlertStatsCardsProps {
  stats: AlertStats
  loading?: boolean
  onStatClick?: (filter: Partial<AlertFilters>) => void
}

/** Props for AlertFilters component */
export interface AlertFiltersProps {
  filters: AlertFilters
  onFilterChange: (filters: AlertFilters) => void
  loading?: boolean
}

/** Props for AlertCard component */
export interface AlertCardProps {
  alert: CrisisAlert
  onAcknowledge: () => void
  onRespond: () => void
  onEscalate: () => void
  onViewDetails: () => void
}

/** Props for AlertList component */
export interface AlertListProps {
  alerts: CrisisAlert[]
  loading?: boolean
  onAlertSelect: (alert: CrisisAlert) => void
  selectedAlertId?: string
  onAcknowledge: (alert: CrisisAlert) => void
  onRespond: (alert: CrisisAlert) => void
  onEscalate: (alert: CrisisAlert) => void
}

/** Props for AlertDetail component (Sheet) */
export interface AlertDetailProps {
  alert: CrisisAlert | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onAction: (action: AlertAction, note?: string) => Promise<void>
}

/** Props for AlertTimeline component */
export interface AlertTimelineProps {
  entries: ResponseLogEntry[]
  currentStatus: AlertStatus
  loading?: boolean
}

/** Props for AIContextDisplay component */
export interface AIContextDisplayProps {
  alert: CrisisAlert
}

/** Props for AlertCharts component */
export interface AlertChartsProps {
  alerts: CrisisAlert[]
  dateRange: number // days
  loading?: boolean
}

/** Props for AlertCalendar component */
export interface AlertCalendarProps {
  alerts: CrisisAlert[]
  onDateSelect: (date: Date) => void
  selectedDate: Date | null
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

/** Maps tier to severity */
export const TIER_TO_SEVERITY: Record<AlertTier, AlertSeverity> = {
  1: 'critical',
  2: 'high',
  3: 'medium',
  4: 'low',
}

/** Maps severity to tier */
export const SEVERITY_TO_TIER: Record<AlertSeverity, AlertTier> = {
  critical: 1,
  high: 2,
  medium: 3,
  low: 4,
}

/** Display labels for tiers */
export const TIER_LABELS: Record<AlertTier, string> = {
  1: 'Critical',
  2: 'High',
  3: 'Moderate',
  4: 'Standard',
}

/** Display labels for sources */
export const SOURCE_LABELS: Record<AlertSource, string> = {
  sos: 'SOS Button',
  ai: 'AI Crisis',
  checkin: 'Check-in',
}

/** Display labels for statuses */
export const STATUS_LABELS: Record<AlertStatus, string> = {
  unread: 'Unread',
  acknowledged: 'Acknowledged',
  responded: 'Responded',
  escalated: 'Escalated',
  resolved: 'Resolved',
}

/** Display labels for AI features */
export const AI_FEATURE_LABELS: Record<AIFeature, string> = {
  anchor: 'Anchor AI Chat',
  daily_oracle: 'Daily Oracle',
  voice_companion: 'Voice Companion',
  story_mode: 'Story Mode',
  guided_checkin: 'Guided Check-in',
  prompt_cards: 'Prompt Cards',
}

/** Colors for tiers (for badges, borders, etc.) */
export const TIER_COLORS: Record<AlertTier, { bg: string; text: string; border: string }> = {
  1: { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-500' },
  2: { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-500' },
  3: { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-500' },
  4: { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-500' },
}

/** Colors for sources */
export const SOURCE_COLORS: Record<AlertSource, { bg: string; text: string }> = {
  sos: { bg: 'bg-red-500', text: 'text-white' },
  ai: { bg: 'bg-purple-500', text: 'text-white' },
  checkin: { bg: 'bg-teal-500', text: 'text-white' },
}

/** Colors for statuses */
export const STATUS_COLORS: Record<AlertStatus, { bg: string; text: string }> = {
  unread: { bg: 'bg-red-100', text: 'text-red-700' },
  acknowledged: { bg: 'bg-yellow-100', text: 'text-yellow-700' },
  responded: { bg: 'bg-blue-100', text: 'text-blue-700' },
  escalated: { bg: 'bg-orange-100', text: 'text-orange-700' },
  resolved: { bg: 'bg-green-100', text: 'text-green-700' },
}
