import { useState, useEffect, useCallback, useMemo } from 'react'
import { doc, getDoc, Timestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useAuth } from '@/contexts/AuthContext'

// ============================================================
// TYPES
// ============================================================

export interface ProfileVisibility {
  bio?: 'public' | 'private'
  sobrietyDate?: 'public' | 'private'
  recoveryGoals?: 'public' | 'private'
  primaryDrugOfChoice?: 'public' | 'private'
  timezone?: 'public' | 'private'
  city?: 'public' | 'private'
  phone?: 'public' | 'private'
  dateOfBirth?: 'public' | 'private'
  programStartDate?: 'public' | 'private'
  previousPrograms?: 'public' | 'private'
  supportGroupType?: 'public' | 'private'
  meetingPreference?: 'public' | 'private'
  hasSponsor?: 'public' | 'private'
  favoriteQuote?: 'public' | 'private'
  interests?: 'public' | 'private'
  copingTechniques?: 'public' | 'private'
  proudestMilestone?: 'public' | 'private'
  pronouns?: 'public' | 'private'
}

export interface UserProfile {
  id: string
  firstName?: string
  lastName?: string
  email?: string
  displayName?: string
  bio?: string
  profilePhoto?: string
  profileImageUrl?: string
  profilePicture?: string
  coverPhotoUrl?: string
  sobrietyDate?: string
  recoveryGoals?: string
  primaryDrugOfChoice?: string
  timezone?: string
  city?: string
  phone?: string
  dateOfBirth?: string
  programStartDate?: string
  previousPrograms?: string
  supportGroupType?: string
  meetingPreference?: string
  hasSponsor?: boolean
  favoriteQuote?: string
  interests?: string
  copingTechniques?: string
  proudestMilestone?: string
  pronouns?: string
  createdAt?: Timestamp
  updatedAt?: Timestamp
  role?: 'pir' | 'coach' | 'admin'
  profileVisibility?: ProfileVisibility
}

// ============================================================
// CACHE HELPERS
// ============================================================

const CACHE_DURATION_MS = 5 * 60 * 1000 // 5 minutes

interface CachedProfile {
  profile: UserProfile
  timestamp: number
}

function getCacheKey(userId: string): string {
  return `userProfile_${userId}`
}

function getCachedProfile(userId: string): UserProfile | null {
  try {
    const cached = sessionStorage.getItem(getCacheKey(userId))
    if (cached) {
      const data: CachedProfile = JSON.parse(cached)
      if (Date.now() - data.timestamp < CACHE_DURATION_MS) {
        return data.profile
      }
    }
  } catch (error) {
    console.error('Error reading profile cache:', error)
  }
  return null
}

function cacheProfile(userId: string, profile: UserProfile): void {
  try {
    const data: CachedProfile = {
      profile,
      timestamp: Date.now(),
    }
    sessionStorage.setItem(getCacheKey(userId), JSON.stringify(data))
  } catch (error) {
    console.error('Error caching profile:', error)
  }
}

// ============================================================
// HELPER FUNCTIONS
// ============================================================

/**
 * Calculate days sober from sobriety date
 * @param sobrietyDate - Date string in YYYY-MM-DD format
 * @returns Number of days sober
 */
export function calculateDaysSober(sobrietyDate: string | undefined): number {
  if (!sobrietyDate) return 0

  try {
    // Parse as LOCAL date
    const [year, month, day] = sobrietyDate.split('-').map(Number)
    const sobrietyDateObj = new Date(year, month - 1, day, 0, 0, 0, 0)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Convert both to UTC to avoid DST issues
    const sobrietyUTC = Date.UTC(
      sobrietyDateObj.getFullYear(),
      sobrietyDateObj.getMonth(),
      sobrietyDateObj.getDate()
    )
    const todayUTC = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate())

    // Calculate difference in milliseconds (DST-proof)
    const diffTime = todayUTC - sobrietyUTC

    // Convert to days and add 1 (sobriety date counts as day 1)
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1

    // Return at least 1 if sobriety date is today or in the past
    return Math.max(1, diffDays)
  } catch (error) {
    console.error('Error calculating sobriety days:', error)
    return 0
  }
}

/**
 * Format member since date (e.g., "Member since Jan 2024")
 * @param joinDate - Firestore timestamp or date value
 * @returns Formatted string
 */
export function formatMemberSince(joinDate: Timestamp | Date | string | number | undefined): string {
  if (!joinDate) return 'Member'

  try {
    let date: Date

    if (joinDate instanceof Timestamp) {
      date = joinDate.toDate()
    } else if (joinDate instanceof Date) {
      date = joinDate
    } else if (typeof joinDate === 'string' || typeof joinDate === 'number') {
      date = new Date(joinDate)
    } else {
      return 'Member'
    }

    return `Member since ${date.toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric',
    })}`
  } catch (error) {
    console.error('Error formatting member since date:', error)
    return 'Member'
  }
}

/**
 * Get initials from name (for avatar placeholder)
 * @param firstName - First name
 * @param lastName - Last name
 * @returns Initials (e.g., "JD")
 */
export function getInitials(firstName?: string, lastName?: string): string {
  if (!firstName && !lastName) return '?'
  const first = (firstName || '').charAt(0).toUpperCase()
  const last = (lastName || '').charAt(0).toUpperCase()
  return `${first}${last}`.trim() || '?'
}

/**
 * Get display name from user profile
 * @param profile - User profile object
 * @returns Display name string
 */
export function getDisplayName(profile?: UserProfile): string {
  if (!profile) return 'Unknown'
  return (
    profile.displayName ||
    `${profile.firstName || ''} ${profile.lastName || ''}`.trim() ||
    'Unknown'
  )
}

/**
 * Get profile picture URL from profile
 * @param profile - User profile object
 * @returns Profile picture URL or undefined
 */
export function getProfilePicture(profile?: UserProfile): string | undefined {
  if (!profile) return undefined
  return profile.profileImageUrl || profile.profilePhoto || profile.profilePicture || undefined
}

// ============================================================
// MAIN HOOK
// ============================================================

interface UseUserProfileOptions {
  /** Skip loading data (for preloaded profiles) */
  skipFetch?: boolean
}

interface UseUserProfileReturn {
  /** User profile data */
  profile: UserProfile | null
  /** Loading state */
  loading: boolean
  /** Error message if any */
  error: string | null
  /** Whether viewing own profile */
  isOwnProfile: boolean
  /** Whether current user is coach/admin */
  isCoachOrAdmin: boolean
  /** Check if a field is viewable based on privacy settings */
  canViewField: (fieldName: keyof ProfileVisibility) => boolean
  /** Calculated days sober */
  daysSober: number
  /** Formatted member since string */
  memberSince: string
  /** Display name */
  displayName: string
  /** Initials for avatar */
  initials: string
  /** Profile picture URL */
  profilePicture: string | undefined
  /** Refresh profile data */
  refresh: () => Promise<void>
}

/**
 * Hook for fetching and managing another user's public profile
 * Respects privacy settings - shows only public fields to non-coaches
 *
 * @param userId - ID of user to fetch profile for
 * @param options - Optional configuration
 * @returns Profile data and helper functions
 */
export function useUserProfile(
  userId: string | undefined,
  options: UseUserProfileOptions = {}
): UseUserProfileReturn {
  const { skipFetch = false } = options
  const { user, userData } = useAuth()

  // State
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(!skipFetch)
  const [error, setError] = useState<string | null>(null)

  // Computed values
  const isOwnProfile = user?.uid === userId
  const isCoachOrAdmin = userData?.role === 'coach' || userData?.role === 'admin'

  /**
   * Check if current user can view a specific field
   * Own profile: can view everything
   * Coach/admin: can view everything (override privacy)
   * Others: respect profileVisibility settings
   */
  const canViewField = useCallback(
    (fieldName: keyof ProfileVisibility): boolean => {
      // Own profile - can view everything
      if (isOwnProfile) return true

      // Coach/admin - can view everything (override privacy)
      if (isCoachOrAdmin) return true

      // Check profileVisibility settings
      if (!profile?.profileVisibility) {
        // No visibility settings - default to private
        return false
      }

      // Return visibility setting for this field
      return profile.profileVisibility[fieldName] === 'public'
    },
    [isOwnProfile, isCoachOrAdmin, profile]
  )

  // Derived values
  const daysSober = useMemo(() => {
    if (!profile?.sobrietyDate) return 0
    if (!canViewField('sobrietyDate')) return 0
    return calculateDaysSober(profile.sobrietyDate)
  }, [profile, canViewField])

  const memberSince = useMemo(() => {
    return formatMemberSince(profile?.createdAt)
  }, [profile])

  const displayName = useMemo(() => {
    return getDisplayName(profile || undefined)
  }, [profile])

  const initials = useMemo(() => {
    return getInitials(profile?.firstName, profile?.lastName)
  }, [profile])

  const profilePicture = useMemo(() => {
    return getProfilePicture(profile || undefined)
  }, [profile])

  /**
   * Fetch profile data from Firestore
   */
  const fetchProfile = useCallback(async () => {
    if (!userId) {
      setError('No user ID provided')
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Check cache first
      const cached = getCachedProfile(userId)
      if (cached) {
        console.log('[useUserProfile] Profile loaded from cache:', userId)
        setProfile(cached)
        setLoading(false)
        return
      }

      // Fetch from Firestore
      const userDoc = await getDoc(doc(db, 'users', userId))

      if (!userDoc.exists()) {
        throw new Error('User profile not found')
      }

      const profileData: UserProfile = {
        id: userDoc.id,
        ...userDoc.data(),
      } as UserProfile

      console.log('[useUserProfile] Profile loaded from Firestore:', userId)

      // Cache the profile
      cacheProfile(userId, profileData)

      setProfile(profileData)
    } catch (err) {
      console.error('[useUserProfile] Error loading profile:', err)
      setError(err instanceof Error ? err.message : 'Failed to load profile')
    } finally {
      setLoading(false)
    }
  }, [userId])

  /**
   * Refresh profile data (bypasses cache)
   */
  const refresh = useCallback(async () => {
    if (!userId) return

    // Clear cache
    try {
      sessionStorage.removeItem(getCacheKey(userId))
    } catch (e) {
      // Ignore cache errors
    }

    await fetchProfile()
  }, [userId, fetchProfile])

  // Load profile on mount
  useEffect(() => {
    if (skipFetch) return

    fetchProfile()
  }, [fetchProfile, skipFetch])

  return {
    profile,
    loading,
    error,
    isOwnProfile,
    isCoachOrAdmin,
    canViewField,
    daysSober,
    memberSince,
    displayName,
    initials,
    profilePicture,
    refresh,
  }
}

export default useUserProfile
