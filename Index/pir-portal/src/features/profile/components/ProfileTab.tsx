import { useState, useCallback, useMemo } from 'react'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { doc, updateDoc, serverTimestamp, Timestamp } from 'firebase/firestore'
import { db, storage } from '@/lib/firebase'
import { updateContextAfterProfileUpdate } from '@/lib/updateAIContext'
import { useAuth } from '@/contexts/AuthContext'
import { useModalStore, type ModalName } from '@/stores/modalStore'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { AlertCircle, LogOut, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { useProfileData } from '../hooks/useProfileData'
import { ProfileHeader } from './ProfileHeader'
import { StatsGrid } from './StatsGrid'
import { SettingsSections } from './SettingsSections'
import type { ProfileModalType } from '../types'

// ============================================================
// LOADING STATE
// ============================================================

function ProfileLoadingState() {
  const isMobile = useMediaQuery('(max-width: 768px)')

  return (
    <div className="min-h-screen bg-background">
      {/* Header skeleton */}
      <div className="w-full h-40 bg-gradient-to-br from-[#058585] to-[#047272] animate-pulse" />

      <div className={cn('space-y-4', isMobile ? 'p-4' : 'p-6')}>
        {/* Stats skeleton */}
        <div className="grid grid-cols-2 gap-3">
          <Skeleton className="h-[60px] rounded-xl" />
          <Skeleton className="h-[60px] rounded-xl" />
          <Skeleton className="h-[60px] rounded-xl" />
          <Skeleton className="h-[60px] rounded-xl" />
        </div>

        {/* Settings skeleton */}
        <div className="space-y-3">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-[72px] rounded-2xl" />
          <Skeleton className="h-[72px] rounded-2xl" />
          <Skeleton className="h-[72px] rounded-2xl" />
        </div>
      </div>
    </div>
  )
}

// ============================================================
// ERROR STATE
// ============================================================

interface ProfileErrorStateProps {
  error: string
  onRetry: () => void
}

function ProfileErrorState({ error, onRetry }: ProfileErrorStateProps) {
  const isMobile = useMediaQuery('(max-width: 768px)')

  return (
    <div
      className={cn(
        'min-h-screen bg-background flex items-center justify-center',
        isMobile ? 'p-4' : 'p-8'
      )}
    >
      <div className="text-center max-w-sm">
        <AlertCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-foreground mb-2">
          Error Loading Profile
        </h2>
        <p className="text-muted-foreground mb-6">{error}</p>
        <Button onClick={onRetry} variant="default">
          Try Again
        </Button>
      </div>
    </div>
  )
}

// ============================================================
// SIGN OUT BUTTON
// ============================================================

interface SignOutButtonProps {
  onSignOut: () => Promise<void>
  loading?: boolean
}

function SignOutButton({ onSignOut, loading = false }: SignOutButtonProps) {
  const isMobile = useMediaQuery('(max-width: 768px)')

  return (
    <div className={cn('px-4 py-6', !isMobile && 'px-5 py-8')}>
      <Button
        variant="default"
        size="lg"
        onClick={onSignOut}
        disabled={loading}
        className={cn(
          'w-full',
          'bg-gradient-to-r from-[#058585] to-[#047272]',
          'hover:from-[#047272] hover:to-[#036363]',
          'text-white font-semibold',
          isMobile ? 'min-h-[48px]' : 'min-h-[50px]'
        )}
      >
        {loading ? (
          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
        ) : (
          <LogOut className="w-5 h-5 mr-2" />
        )}
        {loading ? 'Signing out...' : 'Sign Out'}
      </Button>
    </div>
  )
}

// ============================================================
// MAIN PROFILE TAB COMPONENT
// ============================================================

/**
 * ProfileTab - Main settings & profile view
 *
 * Features:
 * - Profile header with avatar, name, sobriety info
 * - Account activity stats grid
 * - 5 settings sections with modal triggers
 * - Sign out button
 * - Avatar upload to Firebase Storage
 * - Mobile responsive design
 */
export function ProfileTab() {
  const { user, userData, logOut } = useAuth()
  const { openModal } = useModalStore()

  // Profile data hook
  const {
    stats,
    streakData,
    coachInfo,
    googleConnected,
    appleConnected,
    loading,
    error,
    refreshStats,
  } = useProfileData()

  // Local state
  const [signingOut, setSigningOut] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)

  // Transform userData for ProfileHeader (convert Timestamp to string)
  const profileHeaderUserData = useMemo(() => {
    if (!userData) return null
    return {
      firstName: userData.firstName,
      lastName: userData.lastName,
      displayName: userData.displayName,
      email: userData.email,
      profileImageUrl: userData.profilePhoto, // UserData uses profilePhoto
      // Convert Timestamp to ISO string for ProfileHeader
      sobrietyDate: userData.sobrietyDate instanceof Timestamp
        ? userData.sobrietyDate.toDate().toISOString()
        : typeof userData.sobrietyDate === 'string'
        ? userData.sobrietyDate
        : undefined,
    }
  }, [userData])

  // ============================================================
  // HANDLERS
  // ============================================================

  /**
   * Handle avatar change - upload to Firebase Storage
   */
  const handleAvatarChange = useCallback(
    async (file: File) => {
      if (!user?.uid) return

      setUploadingAvatar(true)

      try {
        // Create storage reference
        const fileExtension = file.name.split('.').pop()
        const fileName = `profile_${user.uid}_${Date.now()}.${fileExtension}`
        const storageRef = ref(storage, `profile-pictures/${fileName}`)

        // Upload file
        const uploadResult = await uploadBytes(storageRef, file)

        // Get download URL
        const downloadURL = await getDownloadURL(uploadResult.ref)

        // Update user profile in Firestore
        await updateDoc(doc(db, 'users', user.uid), {
          profileImageUrl: downloadURL,
          profilePictureUpdatedAt: serverTimestamp(),
        })

        // Update AI context
        await updateContextAfterProfileUpdate(user.uid, {})

        // Refresh to show new avatar
        await refreshStats()

        console.log('[ProfileTab] Avatar uploaded successfully')
      } catch (err) {
        console.error('[ProfileTab] Error uploading avatar:', err)
        alert('Failed to upload profile picture. Please try again.')
      } finally {
        setUploadingAvatar(false)
      }
    },
    [user?.uid, refreshStats]
  )

  /**
   * Handle opening profile modals
   */
  const handleOpenModal = useCallback(
    (modalId: ProfileModalType) => {
      // Cast to ModalName - all ProfileModalType values are valid ModalName values
      // Note: modals get userData from AuthContext, so we don't pass it here
      openModal(modalId as ModalName)
    },
    [openModal]
  )

  /**
   * Handle sign out
   */
  const handleSignOut = useCallback(async () => {
    setSigningOut(true)
    try {
      await logOut()
      // Navigation is handled by auth state change
    } catch (err) {
      console.error('[ProfileTab] Sign out error:', err)
      alert('Failed to sign out. Please try again.')
      setSigningOut(false)
    }
  }, [logOut])

  // ============================================================
  // RENDER
  // ============================================================

  // Loading state
  if (loading && !userData) {
    return <ProfileLoadingState />
  }

  // Error state
  if (error && !userData) {
    return <ProfileErrorState error={error} onRetry={refreshStats} />
  }

  return (
    <ScrollArea className="h-full">
      <div className="min-h-screen bg-background pb-20">
        {/* Profile Header */}
        <ProfileHeader
          userData={profileHeaderUserData}
          coachInfo={coachInfo}
          googleConnected={googleConnected}
          profileCompletion={stats.profileCompletion}
          onAvatarChange={handleAvatarChange}
          uploadingAvatar={uploadingAvatar}
        />

        {/* Account Activity Stats Grid */}
        <StatsGrid
          stats={stats}
          streakData={streakData}
          loading={loading}
        />

        {/* Settings Sections */}
        <SettingsSections
          onOpenModal={handleOpenModal}
          googleConnected={googleConnected}
          appleConnected={appleConnected}
          profileCompletion={stats.profileCompletion}
        />

        {/* Sign Out Button */}
        <SignOutButton onSignOut={handleSignOut} loading={signingOut} />
      </div>
    </ScrollArea>
  )
}

export default ProfileTab
