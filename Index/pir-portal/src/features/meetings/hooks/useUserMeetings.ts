import { useState, useEffect, useCallback } from 'react'
import {
  db,
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  serverTimestamp,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
} from '@/lib/firebase'
import { useAuth } from '@/contexts/AuthContext'
import { updateContextAfterMeetingAttend } from '@/lib/updateAIContext'
import type { ScheduledMeeting, Meeting, MeetingStatus } from '../types'

// ============================================================
// CONSTANTS
// ============================================================

const MEETINGS_COLLECTION = 'meetings'
const DEFAULT_LIMIT = 100

// ============================================================
// TYPES
// ============================================================

export interface UseUserMeetingsReturn {
  meetings: ScheduledMeeting[]
  loading: boolean
  error: string | null
  // Meeting management
  scheduleMeeting: (meeting: Meeting, scheduledTime: Date) => Promise<string | null>
  updateMeeting: (meetingId: string, updates: Partial<ScheduledMeeting>) => Promise<boolean>
  cancelMeeting: (meetingId: string) => Promise<boolean>
  deleteMeeting: (meetingId: string) => Promise<boolean>
  // Attendance tracking
  markAttended: (meetingId: string) => Promise<boolean>
  markNotAttended: (meetingId: string) => Promise<boolean>
  // Filtering helpers
  getTodaysMeetings: () => ScheduledMeeting[]
  getUpcomingMeetings: (days?: number) => ScheduledMeeting[]
  getPastMeetings: () => ScheduledMeeting[]
  // Refetch
  refetch: () => void
}

// ============================================================
// HELPER FUNCTIONS
// ============================================================

/**
 * Convert Firestore document to ScheduledMeeting
 */
function docToScheduledMeeting(id: string, data: Record<string, unknown>): ScheduledMeeting {
  return {
    id,
    userId: data.userId as string,
    name: data.meetingTitle as string || data.name as string || 'Untitled Meeting',
    meetingTitle: data.meetingTitle as string || '',
    type: data.type as ScheduledMeeting['type'] || 'GLRS',
    types: data.types as string || '',
    day: typeof data.day === 'number' ? data.day : new Date().getDay(),
    time: data.time as string || '',
    scheduledTime: data.scheduledTime as Timestamp,
    status: data.status as MeetingStatus || 'scheduled',
    attended: Boolean(data.attended),
    attendedAt: data.attendedAt as Timestamp | null,
    source: 'GLRS',
    isVirtual: Boolean(data.isVirtual),
    location: data.location as ScheduledMeeting['location'],
    address: data.address as ScheduledMeeting['address'],
    coordinates: data.coordinates as ScheduledMeeting['coordinates'],
    conferenceUrl: data.conferenceUrl as string,
    notes: data.notes as string,
    glrsMeetingId: data.glrsMeetingId as string,
    externalMeetingId: data.externalMeetingId as string,
    recurringSource: data.recurringSource as string,
    isRecurring: Boolean(data.isRecurring),
    createdAt: data.createdAt as Timestamp | null,
    updatedAt: data.updatedAt as Timestamp | null,
    lastUpdated: data.lastUpdated as Timestamp | null,
  }
}

/**
 * Check if a meeting is today
 */
function isToday(timestamp: Timestamp): boolean {
  if (!timestamp) return false
  const date = timestamp.toDate()
  const today = new Date()
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  )
}

/**
 * Check if a meeting is in the past
 */
function isPast(timestamp: Timestamp): boolean {
  if (!timestamp) return false
  return timestamp.toDate() < new Date()
}

/**
 * Check if a meeting is upcoming (within specified days)
 */
function isUpcoming(timestamp: Timestamp, days: number): boolean {
  if (!timestamp) return false
  const meetingDate = timestamp.toDate()
  const now = new Date()
  const futureDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000)
  return meetingDate >= now && meetingDate <= futureDate
}

// ============================================================
// HOOK: useUserMeetings
// ============================================================

/**
 * Hook for managing user's scheduled GLRS meetings
 *
 * Features:
 * - Real-time sync with Firestore
 * - Schedule new meetings from external sources
 * - Attendance tracking with timestamps
 * - Meeting status management (scheduled, completed, cancelled)
 * - Filtering by today, upcoming, past
 *
 * Firestore Collection: meetings
 * - userId: string (user who scheduled)
 * - meetingTitle: string
 * - scheduledTime: Timestamp
 * - status: 'scheduled' | 'completed' | 'cancelled'
 * - attended: boolean
 * - attendedAt: Timestamp | null
 *
 * @returns Object with meetings array, methods, and loading state
 */
export function useUserMeetings(): UseUserMeetingsReturn {
  const { user } = useAuth()
  const [meetings, setMeetings] = useState<ScheduledMeeting[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const userId = user?.uid

  // ============================================================
  // REAL-TIME LISTENER
  // ============================================================

  useEffect(() => {
    if (!userId) {
      setMeetings([])
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    const meetingsRef = collection(db, MEETINGS_COLLECTION)
    const meetingsQuery = query(
      meetingsRef,
      where('userId', '==', userId),
      where('status', 'in', ['scheduled', 'completed']),
      orderBy('scheduledTime', 'desc'),
      limit(DEFAULT_LIMIT)
    )

    const unsubscribe = onSnapshot(
      meetingsQuery,
      (snapshot) => {
        const userMeetings: ScheduledMeeting[] = snapshot.docs.map((doc) =>
          docToScheduledMeeting(doc.id, doc.data())
        )
        setMeetings(userMeetings)
        setLoading(false)
        console.log(`[useUserMeetings] Loaded ${userMeetings.length} scheduled meetings`)
      },
      (err) => {
        console.error('[useUserMeetings] Error loading meetings:', err)
        setError('Failed to load your meetings. Please try again.')
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [userId])

  // ============================================================
  // MEETING MANAGEMENT METHODS
  // ============================================================

  /**
   * Schedule a new meeting
   * Can be from external meeting or GLRS meeting
   */
  const scheduleMeeting = useCallback(
    async (meeting: Meeting, scheduledTime: Date): Promise<string | null> => {
      if (!userId) {
        console.warn('[useUserMeetings] Cannot schedule: User not authenticated')
        return null
      }

      try {
        const meetingsRef = collection(db, MEETINGS_COLLECTION)
        const newMeeting = {
          userId,
          meetingTitle: meeting.name,
          name: meeting.name,
          type: meeting.type,
          types: meeting.types || '',
          day: meeting.day,
          time: meeting.time,
          scheduledTime: Timestamp.fromDate(scheduledTime),
          status: 'scheduled' as MeetingStatus,
          attended: false,
          attendedAt: null,
          source: meeting.source,
          isVirtual: meeting.isVirtual,
          location: meeting.location || null,
          address: meeting.address || null,
          coordinates: meeting.coordinates || null,
          conferenceUrl: meeting.conferenceUrl || null,
          notes: meeting.notes || null,
          externalMeetingId: meeting.externalMeetingId || meeting.id,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        }

        const docRef = await addDoc(meetingsRef, newMeeting)
        console.log(`[useUserMeetings] Scheduled meeting: ${meeting.name} (${docRef.id})`)
        return docRef.id
      } catch (err) {
        console.error('[useUserMeetings] Error scheduling meeting:', err)
        setError('Failed to schedule meeting. Please try again.')
        return null
      }
    },
    [userId]
  )

  /**
   * Update an existing meeting
   */
  const updateMeeting = useCallback(
    async (meetingId: string, updates: Partial<ScheduledMeeting>): Promise<boolean> => {
      if (!userId) {
        console.warn('[useUserMeetings] Cannot update: User not authenticated')
        return false
      }

      try {
        const meetingRef = doc(db, MEETINGS_COLLECTION, meetingId)
        await updateDoc(meetingRef, {
          ...updates,
          updatedAt: serverTimestamp(),
        })
        console.log(`[useUserMeetings] Updated meeting: ${meetingId}`)
        return true
      } catch (err) {
        console.error('[useUserMeetings] Error updating meeting:', err)
        setError('Failed to update meeting. Please try again.')
        return false
      }
    },
    [userId]
  )

  /**
   * Cancel a meeting (soft delete - changes status)
   */
  const cancelMeeting = useCallback(
    async (meetingId: string): Promise<boolean> => {
      return updateMeeting(meetingId, { status: 'cancelled' })
    },
    [updateMeeting]
  )

  /**
   * Delete a meeting (hard delete)
   */
  const deleteMeeting = useCallback(
    async (meetingId: string): Promise<boolean> => {
      if (!userId) {
        console.warn('[useUserMeetings] Cannot delete: User not authenticated')
        return false
      }

      try {
        const meetingRef = doc(db, MEETINGS_COLLECTION, meetingId)
        await deleteDoc(meetingRef)
        console.log(`[useUserMeetings] Deleted meeting: ${meetingId}`)
        return true
      } catch (err) {
        console.error('[useUserMeetings] Error deleting meeting:', err)
        setError('Failed to delete meeting. Please try again.')
        return false
      }
    },
    [userId]
  )

  // ============================================================
  // ATTENDANCE TRACKING
  // ============================================================

  /**
   * Mark a meeting as attended
   */
  const markAttended = useCallback(
    async (meetingId: string): Promise<boolean> => {
      if (!userId) {
        console.warn('[useUserMeetings] Cannot mark attended: User not authenticated')
        return false
      }

      try {
        const meetingRef = doc(db, MEETINGS_COLLECTION, meetingId)
        await updateDoc(meetingRef, {
          status: 'completed',
          attended: true,
          attendedAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        })
        // Update AI context
        await updateContextAfterMeetingAttend(userId)
        console.log(`[useUserMeetings] Marked attended: ${meetingId}`)
        return true
      } catch (err) {
        console.error('[useUserMeetings] Error marking attended:', err)
        setError('Failed to mark attendance. Please try again.')
        return false
      }
    },
    [userId]
  )

  /**
   * Mark a meeting as not attended (undo attendance)
   */
  const markNotAttended = useCallback(
    async (meetingId: string): Promise<boolean> => {
      if (!userId) {
        console.warn('[useUserMeetings] Cannot mark not attended: User not authenticated')
        return false
      }

      try {
        const meetingRef = doc(db, MEETINGS_COLLECTION, meetingId)
        await updateDoc(meetingRef, {
          status: 'scheduled',
          attended: false,
          attendedAt: null,
          updatedAt: serverTimestamp(),
        })
        console.log(`[useUserMeetings] Marked not attended: ${meetingId}`)
        return true
      } catch (err) {
        console.error('[useUserMeetings] Error marking not attended:', err)
        setError('Failed to update attendance. Please try again.')
        return false
      }
    },
    [userId]
  )

  // ============================================================
  // FILTERING HELPERS
  // ============================================================

  /**
   * Get meetings scheduled for today
   */
  const getTodaysMeetings = useCallback((): ScheduledMeeting[] => {
    return meetings.filter(
      (m) => m.scheduledTime && isToday(m.scheduledTime) && m.status === 'scheduled'
    )
  }, [meetings])

  /**
   * Get upcoming meetings (next N days, default 7)
   */
  const getUpcomingMeetings = useCallback(
    (days = 7): ScheduledMeeting[] => {
      return meetings.filter(
        (m) => m.scheduledTime && isUpcoming(m.scheduledTime, days) && m.status === 'scheduled'
      )
    },
    [meetings]
  )

  /**
   * Get past meetings (completed or past scheduled time)
   */
  const getPastMeetings = useCallback((): ScheduledMeeting[] => {
    return meetings.filter(
      (m) =>
        m.status === 'completed' || (m.scheduledTime && isPast(m.scheduledTime) && !m.attended)
    )
  }, [meetings])

  /**
   * Force refetch (real-time listener auto-updates, but this triggers loading state)
   */
  const refetch = useCallback(() => {
    setLoading(true)
    // Real-time listener will handle the actual refetch
    setTimeout(() => setLoading(false), 500)
  }, [])

  return {
    meetings,
    loading,
    error,
    scheduleMeeting,
    updateMeeting,
    cancelMeeting,
    deleteMeeting,
    markAttended,
    markNotAttended,
    getTodaysMeetings,
    getUpcomingMeetings,
    getPastMeetings,
    refetch,
  }
}

export default useUserMeetings
