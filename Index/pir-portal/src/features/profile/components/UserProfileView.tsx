import { useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  MessageCircle,
  Calendar,
  Target,
  User,
  Globe,
  AlertCircle,
  Lock,
  Award,
  Heart,
  MapPin,
  Quote,
  Sparkles,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { useModalStore } from '@/stores/modalStore'
import { useUserProfile } from '../hooks/useUserProfile'

// ============================================================
// SUB-COMPONENTS
// ============================================================

interface StatCardProps {
  icon: React.ReactNode
  value: string | number
  label: string
  isPrivate?: boolean
  className?: string
}

function StatCard({ icon, value, label, isPrivate = false, className }: StatCardProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center p-4 md:p-5 bg-card rounded-xl border shadow-sm',
        className
      )}
    >
      <div
        className={cn(
          'w-12 h-12 md:w-14 md:h-14 rounded-xl flex items-center justify-center mb-3',
          isPrivate ? 'bg-muted' : 'bg-primary/10'
        )}
      >
        {isPrivate ? (
          <Lock className="w-6 h-6 md:w-7 md:h-7 text-muted-foreground" />
        ) : (
          <span className="text-primary">{icon}</span>
        )}
      </div>
      <div
        className={cn(
          'text-2xl md:text-3xl font-bold mb-1',
          isPrivate ? 'text-muted-foreground' : 'text-foreground'
        )}
      >
        {isPrivate ? '---' : value}
      </div>
      <div className="text-xs md:text-sm font-medium text-muted-foreground uppercase tracking-wide">
        {isPrivate ? 'Private' : label}
      </div>
    </div>
  )
}

interface AboutFieldProps {
  icon: React.ReactNode
  label: string
  value: string | undefined
  isPrivate?: boolean
}

function AboutField({ icon, label, value, isPrivate = false }: AboutFieldProps) {
  if (isPrivate && !value) return null

  return (
    <div className="mb-4">
      <div className="flex items-center gap-2 mb-1">
        <span className={cn('w-4 h-4', isPrivate ? 'text-muted-foreground' : 'text-primary')}>
          {isPrivate ? <Lock className="w-4 h-4" /> : icon}
        </span>
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          {label}
        </span>
      </div>
      <p
        className={cn(
          'text-sm md:text-base leading-relaxed pl-6',
          isPrivate ? 'text-muted-foreground italic' : 'text-foreground'
        )}
      >
        {isPrivate ? 'Private' : value}
      </p>
    </div>
  )
}

function LoadingState() {
  return (
    <div className="min-h-screen bg-background p-4">
      {/* Header skeleton */}
      <div className="flex items-center gap-3 mb-6">
        <Skeleton className="h-10 w-10 rounded-lg" />
        <Skeleton className="h-6 w-32" />
      </div>

      {/* Avatar skeleton */}
      <div className="flex flex-col items-center mb-8">
        <Skeleton className="h-24 w-24 rounded-full mb-4" />
        <Skeleton className="h-7 w-40 mb-2" />
        <Skeleton className="h-4 w-28" />
      </div>

      {/* Stats skeleton */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <Skeleton className="h-28 rounded-xl" />
        <Skeleton className="h-28 rounded-xl" />
      </div>

      {/* About skeleton */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-20" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </CardContent>
      </Card>
    </div>
  )
}

function ErrorState({ message, onBack }: { message: string; onBack: () => void }) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="text-center max-w-sm">
        <AlertCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-foreground mb-2">Error Loading Profile</h2>
        <p className="text-muted-foreground mb-6">{message}</p>
        <Button onClick={onBack} variant="default">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Go Back
        </Button>
      </div>
    </div>
  )
}

function PrivateProfileMessage({ firstName }: { firstName?: string }) {
  return (
    <div className="flex flex-col items-center py-8 px-4 bg-muted/50 rounded-lg border border-border">
      <Lock className="h-12 w-12 text-muted-foreground mb-4" />
      <h3 className="text-base font-semibold text-foreground mb-2">Private Profile</h3>
      <p className="text-sm text-muted-foreground text-center max-w-[280px]">
        {firstName || 'This user'} hasn't made their profile details public yet.
      </p>
    </div>
  )
}

// ============================================================
// MAIN COMPONENT
// ============================================================

export function UserProfileView() {
  const navigate = useNavigate()
  const { userId } = useParams<{ userId: string }>()
  const isMobile = useMediaQuery('(max-width: 768px)')
  const { openModal } = useModalStore()

  // Fetch user profile
  const {
    profile,
    loading,
    error,
    isOwnProfile,
    canViewField,
    daysSober,
    memberSince,
    displayName,
    initials,
    profilePicture,
  } = useUserProfile(userId)

  // Handle back navigation
  const handleBack = () => {
    navigate(-1)
  }

  // Handle send message - opens new conversation modal
  const handleSendMessage = () => {
    if (!profile) return

    openModal('newConversation', {
      recipientId: profile.id,
      onSelectConversation: () => {
        // Navigate to messages after conversation is created
        navigate('/messages')
      },
    })
  }

  // Loading state
  if (loading) {
    return <LoadingState />
  }

  // Error state
  if (error || !profile) {
    return <ErrorState message={error || 'Profile not found'} onBack={handleBack} />
  }

  // Check if any public data is available
  const hasAnyPublicData =
    canViewField('bio') ||
    canViewField('recoveryGoals') ||
    canViewField('primaryDrugOfChoice') ||
    canViewField('timezone') ||
    canViewField('city') ||
    canViewField('favoriteQuote') ||
    canViewField('interests')

  return (
    <div className="min-h-screen bg-background">
      {/* Cover Photo Area */}
      <div
        className={cn(
          'relative w-full bg-gradient-to-br from-primary to-primary/80',
          isMobile ? 'h-32' : 'h-40'
        )}
      >
        {profile.coverPhotoUrl && (
          <img
            src={profile.coverPhotoUrl}
            alt="Cover"
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}

        {/* Back Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={handleBack}
          className="absolute top-3 left-3 bg-black/30 backdrop-blur-sm hover:bg-black/50 text-white border-0"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
      </div>

      {/* Profile Content */}
      <div className="px-4 pb-8">
        {/* Avatar - Overlapping cover */}
        <div className="flex justify-center -mt-12 md:-mt-14 mb-4">
          <Avatar className={cn('border-4 border-background shadow-lg', isMobile ? 'h-24 w-24' : 'h-28 w-28')}>
            <AvatarImage src={profilePicture} alt={displayName} />
            <AvatarFallback className="bg-primary text-primary-foreground text-2xl md:text-3xl font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>
        </div>

        {/* Name and Role */}
        <div className="text-center mb-6">
          <h1 className={cn('font-bold text-foreground', isMobile ? 'text-xl' : 'text-2xl')}>
            {displayName}
          </h1>
          {profile.role && (
            <Badge variant="secondary" className="mt-2 capitalize">
              {profile.role}
            </Badge>
          )}
          <p className="text-sm text-muted-foreground mt-2">{memberSince}</p>
        </div>

        {/* Action Buttons */}
        {!isOwnProfile && (
          <div className="flex justify-center gap-3 mb-6">
            <Button onClick={handleSendMessage} className="flex-1 max-w-[200px]">
              <MessageCircle className="w-4 h-4 mr-2" />
              Send Message
            </Button>
          </div>
        )}

        {/* Stats Row */}
        <div className="grid grid-cols-2 gap-3 md:gap-4 mb-6">
          <StatCard
            icon={<Award className="w-6 h-6 md:w-7 md:h-7" />}
            value={daysSober > 0 ? daysSober : 0}
            label="Days Sober"
            isPrivate={!canViewField('sobrietyDate') || daysSober === 0}
          />
          <StatCard
            icon={<Heart className="w-6 h-6 md:w-7 md:h-7" />}
            value={profile.hasSponsor ? 'Yes' : 'No'}
            label="Has Sponsor"
            isPrivate={!canViewField('hasSponsor')}
          />
        </div>

        {/* About Section */}
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              About
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {!hasAnyPublicData && !isOwnProfile ? (
              <PrivateProfileMessage firstName={profile.firstName} />
            ) : (
              <div className="space-y-1">
                {/* Always show member since */}
                <AboutField
                  icon={<Calendar className="w-4 h-4" />}
                  label="Member Since"
                  value={memberSince}
                />

                {/* Bio */}
                {canViewField('bio') && profile.bio && (
                  <AboutField icon={<User className="w-4 h-4" />} label="Bio" value={profile.bio} />
                )}

                {/* City */}
                {canViewField('city') && profile.city && (
                  <AboutField icon={<MapPin className="w-4 h-4" />} label="Location" value={profile.city} />
                )}

                {/* Favorite Quote */}
                {canViewField('favoriteQuote') && profile.favoriteQuote && (
                  <AboutField
                    icon={<Quote className="w-4 h-4" />}
                    label="Favorite Quote"
                    value={`"${profile.favoriteQuote}"`}
                  />
                )}

                {/* Interests */}
                {canViewField('interests') && profile.interests && (
                  <AboutField
                    icon={<Sparkles className="w-4 h-4" />}
                    label="Interests & Hobbies"
                    value={profile.interests}
                  />
                )}

                {/* Timezone */}
                {canViewField('timezone') && profile.timezone && (
                  <AboutField
                    icon={<Globe className="w-4 h-4" />}
                    label="Timezone"
                    value={profile.timezone}
                  />
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recovery Section - Only for coaches or if fields are public */}
        {(canViewField('recoveryGoals') ||
          canViewField('primaryDrugOfChoice') ||
          canViewField('supportGroupType')) && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" />
                Recovery Journey
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-1">
              {/* Recovery Goals */}
              {canViewField('recoveryGoals') && profile.recoveryGoals && (
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="w-4 h-4 text-primary" />
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Recovery Goals
                    </span>
                  </div>
                  <div className="pl-6">
                    {profile.recoveryGoals.split('\n').filter(Boolean).map((goal, index) => (
                      <div key={index} className="flex items-start gap-2 mb-1">
                        <span className="text-primary font-medium">{index + 1}.</span>
                        <p className="text-sm md:text-base text-foreground">{goal.trim()}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Primary Drug of Choice */}
              {canViewField('primaryDrugOfChoice') && profile.primaryDrugOfChoice && (
                <AboutField
                  icon={<AlertCircle className="w-4 h-4" />}
                  label="Primary Drug of Choice"
                  value={profile.primaryDrugOfChoice}
                />
              )}

              {/* Support Group Type */}
              {canViewField('supportGroupType') && profile.supportGroupType && (
                <AboutField
                  icon={<User className="w-4 h-4" />}
                  label="Support Group"
                  value={profile.supportGroupType}
                />
              )}

              {/* Meeting Preference */}
              {canViewField('meetingPreference') && profile.meetingPreference && (
                <AboutField
                  icon={<Calendar className="w-4 h-4" />}
                  label="Meeting Preference"
                  value={profile.meetingPreference}
                />
              )}

              {/* Proudest Milestone */}
              {canViewField('proudestMilestone') && profile.proudestMilestone && (
                <AboutField
                  icon={<Award className="w-4 h-4" />}
                  label="Proudest Milestone"
                  value={profile.proudestMilestone}
                />
              )}

              {/* Coping Techniques */}
              {canViewField('copingTechniques') && profile.copingTechniques && (
                <AboutField
                  icon={<Sparkles className="w-4 h-4" />}
                  label="Coping Techniques"
                  value={profile.copingTechniques}
                />
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

export default UserProfileView
