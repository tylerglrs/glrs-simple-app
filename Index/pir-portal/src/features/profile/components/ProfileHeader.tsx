import { useRef } from 'react'
import { motion } from 'framer-motion'
import { Edit3, Calendar, CheckCircle, UserCheck, Loader2 } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { AnimatedCounter, FireAnimation } from '@/components/common'
import { haptics } from '@/lib/animations'
import { calculateDaysSober } from '../hooks/useUserProfile'
import type { ProfileHeaderProps } from '../types'

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function getInitials(firstName?: string, lastName?: string, email?: string): string {
  if (firstName) {
    return `${firstName.charAt(0)}${lastName ? lastName.charAt(0) : ''}`.toUpperCase()
  }
  if (email) {
    return email.charAt(0).toUpperCase()
  }
  return 'U'
}


function formatSobrietyDate(dateStr?: string): string {
  if (!dateStr) return ''
  try {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', {
      timeZone: 'UTC',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  } catch {
    return ''
  }
}

// ============================================================
// PROFILE HEADER COMPONENT
// ============================================================

/**
 * Profile header with avatar, name, sobriety info, and status badges
 * Matches the original teal gradient design from ProfileTab.js
 */
export function ProfileHeader({
  userData,
  coachInfo,
  googleConnected,
  profileCompletion,
  onAvatarChange,
  uploadingAvatar = false,
}: ProfileHeaderProps) {
  const isMobile = useMediaQuery('(max-width: 768px)')
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Calculate display values
  const displayName = userData?.displayName || userData?.firstName || 'User'
  const sobrietyDays = userData?.sobrietyDate
    ? calculateDaysSober(userData.sobrietyDate)
    : 0
  const sobrietyDateFormatted = formatSobrietyDate(userData?.sobrietyDate)
  const coachDisplayName =
    coachInfo?.displayName ||
    `${coachInfo?.firstName || ''} ${coachInfo?.lastName || ''}`.trim()

  // Handle avatar click
  const handleAvatarClick = () => {
    fileInputRef.current?.click()
  }

  // Handle file selection
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file (JPG, PNG, etc.)')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size must be less than 5MB')
      return
    }

    await onAvatarChange(file)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className={cn(
        'w-full relative overflow-hidden',
        'bg-gradient-to-br from-teal-500 via-teal-600 to-cyan-600',
        isMobile ? 'px-4 py-6' : 'px-5 py-8'
      )}
    >
      {/* Decorative background elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-white/5 -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-36 h-36 rounded-full bg-white/5 translate-y-1/2 -translate-x-1/3" />
        <div className="absolute top-1/4 right-1/4 w-3 h-3 rounded-full bg-white/20 animate-pulse" />
        <div className="absolute bottom-1/3 left-1/3 w-2 h-2 rounded-full bg-white/15 animate-pulse delay-100" />
      </div>
      <div
        className={cn(
          'flex gap-5 relative z-10',
          isMobile ? 'flex-col items-center' : 'flex-row items-start'
        )}
      >
        {/* Avatar with Gradient Ring */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, type: 'spring' as const, stiffness: 300 }}
          className="relative"
        >
          {/* Gradient Ring */}
          <div className="absolute inset-0 -m-1 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 animate-pulse" style={{ padding: '3px' }} />
          <Avatar
            className={cn(
              'cursor-pointer border-4 border-white shadow-xl relative',
              'w-24 h-24'
            )}
            onClick={() => {
              haptics.tap()
              handleAvatarClick()
            }}
          >
            <AvatarImage
              src={userData?.profileImageUrl}
              alt={displayName}
              className="object-cover"
            />
            <AvatarFallback className="bg-gradient-to-br from-teal-600 to-cyan-700 text-white text-3xl font-bold">
              {getInitials(userData?.firstName, userData?.lastName, userData?.email)}
            </AvatarFallback>
          </Avatar>

          {/* Edit Icon / Loading Indicator */}
          <motion.button
            type="button"
            onClick={() => {
              haptics.tap()
              handleAvatarClick()
            }}
            disabled={uploadingAvatar}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className={cn(
              'absolute bottom-0 right-0',
              'w-8 h-8 rounded-full',
              'bg-gradient-to-br from-teal-600 to-cyan-700 shadow-lg',
              'flex items-center justify-center',
              'cursor-pointer border-2 border-white',
              uploadingAvatar && 'cursor-wait'
            )}
          >
            {uploadingAvatar ? (
              <Loader2 className="w-4 h-4 text-white animate-spin" />
            ) : (
              <Edit3 className="w-4 h-4 text-white" />
            )}
          </motion.button>

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </motion.div>

        {/* Profile Info */}
        <motion.div
          initial={{ opacity: 0, x: isMobile ? 0 : 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className={cn(
            'flex-1 text-white',
            isMobile ? 'text-center' : 'text-left'
          )}
        >
          {/* Name */}
          <h1
            className={cn(
              'font-bold mb-1',
              'drop-shadow-md',
              isMobile ? 'text-2xl' : 'text-3xl'
            )}
          >
            {displayName}
          </h1>

          {/* Sobriety Info with Animated Counter */}
          {userData?.sobrietyDate && (
            <div className="flex items-center gap-2 text-white/95 mb-2 drop-shadow-sm">
              <FireAnimation size={28} />
              <span className="text-lg font-semibold">
                <AnimatedCounter value={sobrietyDays} duration={2} /> days sober
              </span>
              <span className="text-white/70">• Since {sobrietyDateFormatted}</span>
            </div>
          )}

          {/* Coach Info */}
          {coachInfo && (
            <div
              className={cn(
                'flex items-center gap-1.5 text-sm text-white/85 mb-3 drop-shadow-sm',
                isMobile ? 'justify-center' : 'justify-start'
              )}
            >
              <UserCheck className="w-4 h-4" />
              <span>Coach: {coachDisplayName}</span>
            </div>
          )}

          {/* Status Badges with Animation */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className={cn(
              'flex flex-wrap gap-2 mt-4',
              isMobile ? 'justify-center' : 'justify-start'
            )}
          >
            {/* Calendar Connected Badge */}
            {googleConnected && (
              <Badge
                variant="secondary"
                className="bg-emerald-500/90 text-white border-0 shadow-md px-3 py-1.5 backdrop-blur-sm"
              >
                <Calendar className="w-3.5 h-3.5 mr-1.5" />
                Calendar Connected
              </Badge>
            )}

            {/* Profile Completion Badge */}
            {profileCompletion < 100 && (
              <Badge
                variant="secondary"
                className="bg-amber-500/90 text-white border-0 shadow-md px-3 py-1.5 backdrop-blur-sm"
              >
                <CheckCircle className="w-3.5 h-3.5 mr-1.5" />
                {profileCompletion}% Complete
              </Badge>
            )}
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  )
}

export default ProfileHeader
