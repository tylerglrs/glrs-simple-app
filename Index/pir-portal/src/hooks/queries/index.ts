/**
 * TanStack Query Hooks
 *
 * These hooks provide cached, real-time data fetching with TanStack Query.
 * They replace manual Firestore queries with optimized caching for:
 * - Instant tab switching (data already in cache)
 * - Reduced Firestore reads (stale-while-revalidate pattern)
 * - Real-time updates via Firestore listeners
 * - Computed values derived from cached data
 *
 * Usage:
 * ```tsx
 * import { useCheckInsQuery, useGoalsQuery, useJourneyQuery } from '@/hooks/queries'
 *
 * function MyComponent() {
 *   const { checkInStatus, weeklyStats } = useCheckInsQuery()
 *   const { activeGoals, stats } = useGoalsQuery()
 *   const { daysSober, milestones } = useJourneyQuery()
 * }
 * ```
 */

// Check-ins query hook
export {
  useCheckInsQuery,
  type CheckInStatus,
  type WeeklyStats,
  type ReflectionStats,
  type StreakData,
  type YesterdayGoal,
  type MorningCheckInData,
  type EveningReflectionData,
} from './useCheckInsQuery'

// Goals query hook
export {
  useGoalsQuery,
  useSingleGoalQuery,
  createGoal,
  updateGoal,
  deleteGoal,
  completeGoal,
  pauseGoal,
  resumeGoal,
  type GoalWithProgress,
  type GoalStats,
  type CreateGoalInput,
  type UpdateGoalInput,
} from './useGoalsQuery'

// Journey query hook
export {
  useJourneyQuery,
  calculateSobrietyDays,
  getRecoveryMilestones,
  type JourneyUserData,
  type CheckIn,
  type Milestone,
  type SavingsGoal,
  type Breakthrough,
  type GratitudeEntry,
  type ChallengeEntry,
} from './useJourneyQuery'

// Profile query hook
export {
  useProfileQuery,
  type ProfileStats,
  type ReflectionStreakData,
  type StreakPeriod,
  type CoachInfo,
  type EmergencyContact,
  type CalendarConnection,
} from './useProfileQuery'

// Meetings query hook
export {
  useMeetingsQuery,
  useExternalMeetingsQuery,
  useSavedMeetingsQuery,
  type Meeting,
  type SavedMeeting,
} from './useMeetingsQuery'
