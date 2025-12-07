import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { updateContextAfterProfileUpdate } from '@/lib/updateAIContext'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/hooks/use-toast'
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormDescription,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import {
  Shield,
  Eye,
  Calendar,
  BarChart3,
  Users,
  MessageSquare,
  UserX,
  Share2,
  Lock,
  Ban,
  Loader2,
  Trash2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useState, useEffect } from 'react'

// =============================================================================
// TYPES
// =============================================================================

interface PrivacySettings {
  profileVisibility: 'everyone' | 'coach_only' | 'private'
  showSobrietyDate: boolean
  showProgressStats: boolean
  communityParticipation: boolean
  allowDirectMessages: boolean
  anonymousPosting: boolean
  shareProgressWithCoach: boolean
  blockedUsers: string[]
}

// =============================================================================
// VALIDATION SCHEMA
// =============================================================================

const privacySettingsSchema = z.object({
  profileVisibility: z.enum(['everyone', 'coach_only', 'private']),
  showSobrietyDate: z.boolean(),
  showProgressStats: z.boolean(),
  communityParticipation: z.boolean(),
  allowDirectMessages: z.boolean(),
  anonymousPosting: z.boolean(),
})

type PrivacySettingsFormValues = z.infer<typeof privacySettingsSchema>

// =============================================================================
// VISIBILITY OPTIONS
// =============================================================================

const VISIBILITY_OPTIONS = [
  { value: 'everyone', label: 'Everyone', description: 'All community members can see your profile' },
  { value: 'coach_only', label: 'Coach Only', description: 'Only your coach can see your full profile' },
  { value: 'private', label: 'Private', description: 'Your profile is hidden from everyone except staff' },
]

// =============================================================================
// COMPONENT
// =============================================================================

interface PrivacySettingsModalProps {
  onClose: () => void
}

export function PrivacySettingsModal({ onClose }: PrivacySettingsModalProps) {
  const { user, userData } = useAuth()
  const { toast } = useToast()

  // Get extended user data with privacy settings
  const extendedUserData = userData as Record<string, unknown> | null
  const privacyData = (extendedUserData?.privacy as Partial<PrivacySettings>) || {}

  // State
  const [isSaving, setIsSaving] = useState(false)
  const [blockedUsers, setBlockedUsers] = useState<string[]>(privacyData.blockedUsers || [])
  const [unblockUserId, setUnblockUserId] = useState<string | null>(null)

  // Form
  const form = useForm<PrivacySettingsFormValues>({
    resolver: zodResolver(privacySettingsSchema),
    defaultValues: {
      profileVisibility: privacyData.profileVisibility || 'coach_only',
      showSobrietyDate: privacyData.showSobrietyDate !== false,
      showProgressStats: privacyData.showProgressStats || false,
      communityParticipation: privacyData.communityParticipation !== false,
      allowDirectMessages: privacyData.allowDirectMessages !== false,
      anonymousPosting: privacyData.anonymousPosting || false,
    },
  })

  // Sync blocked users from userData
  useEffect(() => {
    if (privacyData.blockedUsers) {
      setBlockedUsers(privacyData.blockedUsers)
    }
  }, [privacyData.blockedUsers])

  // Handle unblock user
  const handleUnblock = (userId: string) => {
    setBlockedUsers((prev) => prev.filter((id) => id !== userId))
    setUnblockUserId(null)
  }

  // Handle form submission
  const onSubmit = async (values: PrivacySettingsFormValues) => {
    if (!user?.uid) {
      toast({
        title: 'Error',
        description: 'You must be logged in to update privacy settings.',
        variant: 'destructive',
      })
      return
    }

    setIsSaving(true)

    try {
      await updateDoc(doc(db, 'users', user.uid), {
        privacy: {
          profileVisibility: values.profileVisibility,
          showSobrietyDate: values.showSobrietyDate,
          showProgressStats: values.showProgressStats,
          communityParticipation: values.communityParticipation,
          allowDirectMessages: values.allowDirectMessages,
          anonymousPosting: values.anonymousPosting,
          shareProgressWithCoach: true, // Always true - required for service
          blockedUsers: blockedUsers,
        },
        updatedAt: serverTimestamp(),
      })

      // Update AI context
      await updateContextAfterProfileUpdate(user.uid, {})

      toast({
        title: 'Success',
        description: 'Privacy settings updated successfully.',
      })

      onClose()
    } catch (error) {
      console.error('[PrivacySettingsModal] Error saving settings:', error)
      toast({
        title: 'Error',
        description: 'Failed to save privacy settings. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsSaving(false)
    }
  }

  // Toggle row component
  const ToggleRow = ({
    icon: Icon,
    label,
    description,
    checked,
    onChange,
    disabled = false,
  }: {
    icon: React.ElementType
    label: string
    description: string
    checked: boolean
    onChange: (checked: boolean) => void
    disabled?: boolean
  }) => (
    <div
      className={cn(
        'flex items-center justify-between py-3',
        disabled && 'opacity-60'
      )}
    >
      <div className="flex items-start gap-3 flex-1 mr-4">
        <Icon className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
        <div>
          <div className="font-medium text-sm">{label}</div>
          <div className="text-xs text-muted-foreground mt-0.5">{description}</div>
        </div>
      </div>
      <Switch
        checked={checked}
        onCheckedChange={onChange}
        disabled={disabled}
      />
    </div>
  )

  return (
    <DialogContent className="max-w-[95vw] sm:max-w-[540px] p-0 gap-0">
      {/* Header */}
      <DialogHeader className="px-6 py-4 bg-gradient-to-r from-red-600 to-rose-600">
        <DialogTitle className="text-xl font-bold text-white flex items-center gap-3">
          <Shield className="h-6 w-6" />
          Privacy Settings
        </DialogTitle>
        <DialogDescription className="text-red-100">
          Control who can see your profile and how you interact with the community.
        </DialogDescription>
      </DialogHeader>

      {/* Content */}
      <ScrollArea className="max-h-[calc(90vh-180px)]">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 space-y-6">
            {/* Profile Visibility Section */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900 border-b pb-2">
                Profile Visibility
              </h3>

              {/* Profile Visibility Dropdown */}
              <FormField
                control={form.control}
                name="profileVisibility"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Eye className="h-4 w-4 text-muted-foreground" />
                      Who can see your profile
                    </FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select visibility" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {VISIBILITY_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            <div className="flex flex-col">
                              <span>{option.label}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      {VISIBILITY_OPTIONS.find((o) => o.value === field.value)?.description}
                    </FormDescription>
                  </FormItem>
                )}
              />

              {/* Show Sobriety Date */}
              <FormField
                control={form.control}
                name="showSobrietyDate"
                render={({ field }) => (
                  <ToggleRow
                    icon={Calendar}
                    label="Show Sobriety Date"
                    description="Display your sobriety start date on your profile"
                    checked={field.value ?? false}
                    onChange={field.onChange}
                  />
                )}
              />

              {/* Show Progress Stats */}
              <FormField
                control={form.control}
                name="showProgressStats"
                render={({ field }) => (
                  <ToggleRow
                    icon={BarChart3}
                    label="Show Progress Stats"
                    description="Display your milestone achievements and streaks publicly"
                    checked={field.value ?? false}
                    onChange={field.onChange}
                  />
                )}
              />
            </div>

            <Separator />

            {/* Community Privacy Section */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900 border-b pb-2">
                Community Privacy
              </h3>

              {/* Community Participation */}
              <FormField
                control={form.control}
                name="communityParticipation"
                render={({ field }) => (
                  <ToggleRow
                    icon={Users}
                    label="Community Participation"
                    description="Appear in community feed and topic rooms"
                    checked={field.value ?? false}
                    onChange={field.onChange}
                  />
                )}
              />

              {/* Allow Direct Messages */}
              <FormField
                control={form.control}
                name="allowDirectMessages"
                render={({ field }) => (
                  <ToggleRow
                    icon={MessageSquare}
                    label="Allow Direct Messages"
                    description="Let other PIRs send you private messages"
                    checked={field.value ?? false}
                    onChange={field.onChange}
                  />
                )}
              />

              {/* Anonymous Posting */}
              <FormField
                control={form.control}
                name="anonymousPosting"
                render={({ field }) => (
                  <ToggleRow
                    icon={UserX}
                    label="Anonymous Posting"
                    description="Post in community without showing your name"
                    checked={field.value ?? false}
                    onChange={field.onChange}
                  />
                )}
              />
            </div>

            <Separator />

            {/* Data Sharing Section */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900 border-b pb-2">
                Data Sharing
              </h3>

              {/* Share Progress with Coach (Locked) */}
              <div className="flex items-center justify-between py-3 opacity-60">
                <div className="flex items-start gap-3 flex-1 mr-4">
                  <Share2 className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-medium text-sm flex items-center gap-2">
                      Share Progress with Coach
                      <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      Your coach always has access to your progress (required for service)
                    </div>
                  </div>
                </div>
                <Switch checked={true} disabled={true} />
              </div>
            </div>

            <Separator />

            {/* Blocked Users Section */}
            <div className="space-y-4">
              <h3 className="font-semibold text-red-600 flex items-center gap-2 border-b pb-2 border-red-200">
                <Ban className="h-5 w-5" />
                Blocked Users
              </h3>

              <Card className={cn(
                'border-red-200',
                blockedUsers.length > 0 && 'bg-red-50/50'
              )}>
                <CardContent className="pt-4">
                  {blockedUsers.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      You haven't blocked any users yet.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {blockedUsers.map((userId) => (
                        <div
                          key={userId}
                          className="flex items-center justify-between p-3 bg-white rounded-lg border"
                        >
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="font-mono text-xs">
                              {userId.slice(0, 8)}...
                            </Badge>
                          </div>
                          <AlertDialog
                            open={unblockUserId === userId}
                            onOpenChange={(open: boolean) => !open && setUnblockUserId(null)}
                          >
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => setUnblockUserId(userId)}
                              >
                                <Trash2 className="h-3.5 w-3.5 mr-1" />
                                Unblock
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Unblock User</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to unblock this user? They will be able to
                                  see your profile and message you again.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleUnblock(userId)}>
                                  Unblock
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      ))}
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground mt-3">
                    Users you've blocked cannot see your profile or message you
                  </p>
                </CardContent>
              </Card>
            </div>
          </form>
        </Form>
      </ScrollArea>

      {/* Footer */}
      <div className="flex items-center justify-end gap-3 px-6 py-4 border-t bg-muted/30">
        <Button type="button" variant="outline" onClick={onClose} disabled={isSaving}>
          Cancel
        </Button>
        <Button
          onClick={form.handleSubmit(onSubmit)}
          disabled={isSaving}
          className="bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700"
        >
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            'Save Changes'
          )}
        </Button>
      </div>
    </DialogContent>
  )
}

export default PrivacySettingsModal
