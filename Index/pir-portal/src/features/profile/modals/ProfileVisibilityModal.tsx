import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { updateContextAfterProfileUpdate } from '@/lib/updateAIContext'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/hooks/use-toast'
import { ResponsiveModal } from '@/components/ui/responsive-modal'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Eye,
  EyeOff,
  UserCheck,
  Globe,
  User,
  Calendar,
  Mail,
  Phone,
  MapPin,
  Award,
  Activity,
  Heart,
  Loader2,
  MessageSquare,
  AlertTriangle,
} from 'lucide-react'
import { Switch } from '@/components/ui/switch'
import { useState, useEffect } from 'react'
import { useStatusBarColor } from '@/hooks/useStatusBarColor'

// =============================================================================
// TYPES
// =============================================================================

type VisibilityLevel = 'everyone' | 'coach_only' | 'private'

interface FieldVisibilitySettings {
  displayName: VisibilityLevel
  firstName: VisibilityLevel
  lastName: VisibilityLevel
  email: VisibilityLevel
  phone: VisibilityLevel
  location: VisibilityLevel
  sobrietyDate: VisibilityLevel
  sobrietyDays: VisibilityLevel
  recoveryProgram: VisibilityLevel
  milestones: VisibilityLevel
  checkInStreak: VisibilityLevel
  bio: VisibilityLevel
}

// =============================================================================
// VALIDATION SCHEMA
// =============================================================================

const visibilitySchema = z.object({
  displayName: z.enum(['everyone', 'coach_only', 'private']),
  firstName: z.enum(['everyone', 'coach_only', 'private']),
  lastName: z.enum(['everyone', 'coach_only', 'private']),
  email: z.enum(['everyone', 'coach_only', 'private']),
  phone: z.enum(['everyone', 'coach_only', 'private']),
  location: z.enum(['everyone', 'coach_only', 'private']),
  sobrietyDate: z.enum(['everyone', 'coach_only', 'private']),
  sobrietyDays: z.enum(['everyone', 'coach_only', 'private']),
  recoveryProgram: z.enum(['everyone', 'coach_only', 'private']),
  milestones: z.enum(['everyone', 'coach_only', 'private']),
  checkInStreak: z.enum(['everyone', 'coach_only', 'private']),
  bio: z.enum(['everyone', 'coach_only', 'private']),
})

type VisibilityFormValues = z.infer<typeof visibilitySchema>

// =============================================================================
// VISIBILITY OPTIONS
// =============================================================================

const VISIBILITY_OPTIONS = [
  { value: 'everyone', label: 'Everyone', icon: Globe },
  { value: 'coach_only', label: 'Coach Only', icon: UserCheck },
  { value: 'private', label: 'Private', icon: EyeOff },
] as const

// =============================================================================
// FIELD DEFINITIONS
// =============================================================================

interface FieldDefinition {
  key: keyof FieldVisibilitySettings
  label: string
  description: string
  icon: React.ElementType
  category: 'personal' | 'contact' | 'recovery' | 'progress'
}

const FIELD_DEFINITIONS: FieldDefinition[] = [
  // Personal Info
  { key: 'displayName', label: 'Display Name', description: 'Your public display name', icon: User, category: 'personal' },
  { key: 'firstName', label: 'First Name', description: 'Your legal first name', icon: User, category: 'personal' },
  { key: 'lastName', label: 'Last Name', description: 'Your legal last name', icon: User, category: 'personal' },
  { key: 'bio', label: 'Bio', description: 'Your profile biography', icon: Heart, category: 'personal' },

  // Contact Info
  { key: 'email', label: 'Email', description: 'Your email address', icon: Mail, category: 'contact' },
  { key: 'phone', label: 'Phone', description: 'Your phone number', icon: Phone, category: 'contact' },
  { key: 'location', label: 'Location', description: 'City and state', icon: MapPin, category: 'contact' },

  // Recovery Info
  { key: 'sobrietyDate', label: 'Sobriety Date', description: 'When you started recovery', icon: Calendar, category: 'recovery' },
  { key: 'recoveryProgram', label: 'Recovery Program', description: 'Your program type', icon: Heart, category: 'recovery' },

  // Progress Stats
  { key: 'sobrietyDays', label: 'Sobriety Days', description: 'Days in recovery counter', icon: Award, category: 'progress' },
  { key: 'milestones', label: 'Milestones', description: 'Your achieved milestones', icon: Award, category: 'progress' },
  { key: 'checkInStreak', label: 'Check-in Streak', description: 'Consecutive check-in days', icon: Activity, category: 'progress' },
]

const CATEGORIES = [
  { id: 'personal', label: 'Personal Information', icon: User },
  { id: 'contact', label: 'Contact Information', icon: Mail },
  { id: 'recovery', label: 'Recovery Information', icon: Heart },
  { id: 'progress', label: 'Progress Stats', icon: Activity },
] as const

// =============================================================================
// COMPONENT
// =============================================================================

interface ProfileVisibilityModalProps {
  onClose: () => void
}

export function ProfileVisibilityModal({ onClose }: ProfileVisibilityModalProps) {
  const { user, userData } = useAuth()
  const { toast } = useToast()

  // Set iOS status bar to match modal header color (blue-600)
  useStatusBarColor('#2563EB', true)

  // Get extended user data
  const extendedUserData = userData as Record<string, unknown> | null
  const fieldVisibility = (extendedUserData?.fieldVisibility as Partial<FieldVisibilitySettings>) || {}

  // State
  const [isSaving, setIsSaving] = useState(false)

  // Peer messaging state
  const privacySettings = (extendedUserData?.privacy as Record<string, unknown>) || {}
  const [peerMessagingEnabled, setPeerMessagingEnabled] = useState(
    privacySettings.allowDirectMessages === true &&
    privacySettings.profileVisibility === 'everyone'
  )

  // Handle peer messaging toggle
  const handlePeerMessagingToggle = async (enabled: boolean) => {
    if (!user?.uid) return

    setPeerMessagingEnabled(enabled)

    try {
      await updateDoc(doc(db, 'users', user.uid), {
        'privacy.profileVisibility': enabled ? 'everyone' : 'coach_only',
        'privacy.allowDirectMessages': enabled,
        updatedAt: serverTimestamp(),
      })

      toast({
        title: enabled ? 'Peer Messaging Enabled' : 'Peer Messaging Disabled',
        description: enabled
          ? 'Other participants can now see your profile and send you messages.'
          : 'Your profile is now visible only to your coach.',
      })
    } catch (error) {
      console.error('[ProfileVisibilityModal] Error updating peer messaging:', error)
      setPeerMessagingEnabled(!enabled) // Revert on error
      toast({
        title: 'Error',
        description: 'Failed to update peer messaging settings.',
        variant: 'destructive',
      })
    }
  }

  // Form with defaults
  const form = useForm<VisibilityFormValues>({
    resolver: zodResolver(visibilitySchema),
    defaultValues: {
      displayName: fieldVisibility.displayName || 'everyone',
      firstName: fieldVisibility.firstName || 'coach_only',
      lastName: fieldVisibility.lastName || 'coach_only',
      email: fieldVisibility.email || 'private',
      phone: fieldVisibility.phone || 'private',
      location: fieldVisibility.location || 'coach_only',
      sobrietyDate: fieldVisibility.sobrietyDate || 'coach_only',
      sobrietyDays: fieldVisibility.sobrietyDays || 'everyone',
      recoveryProgram: fieldVisibility.recoveryProgram || 'coach_only',
      milestones: fieldVisibility.milestones || 'everyone',
      checkInStreak: fieldVisibility.checkInStreak || 'everyone',
      bio: fieldVisibility.bio || 'everyone',
    },
  })

  // Set all fields to a visibility level
  const setAllTo = (level: VisibilityLevel) => {
    const values = form.getValues()
    const newValues = Object.keys(values).reduce((acc, key) => {
      acc[key as keyof VisibilityFormValues] = level
      return acc
    }, {} as VisibilityFormValues)
    form.reset(newValues)
  }

  // Handle form submission
  const onSubmit = async (values: VisibilityFormValues) => {
    if (!user?.uid) {
      toast({
        title: 'Error',
        description: 'You must be logged in to update visibility settings.',
        variant: 'destructive',
      })
      return
    }

    setIsSaving(true)

    try {
      await updateDoc(doc(db, 'users', user.uid), {
        fieldVisibility: values,
        updatedAt: serverTimestamp(),
      })

      // Update AI context
      await updateContextAfterProfileUpdate(user.uid, {})

      toast({
        title: 'Success',
        description: 'Profile visibility settings updated.',
      })

      onClose()
    } catch (error) {
      console.error('[ProfileVisibilityModal] Error saving settings:', error)
      toast({
        title: 'Error',
        description: 'Failed to save visibility settings. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <ResponsiveModal open={true} onOpenChange={(open) => !open && onClose()} desktopSize="lg">
      <div className="flex flex-col h-full bg-white overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 shrink-0">
          <h2 className="text-xl font-bold text-white flex items-center gap-3">
            <Eye className="h-6 w-6" />
            Profile Visibility
          </h2>
          <p className="text-blue-100 text-sm mt-1">
            Control the visibility of each field on your profile.
          </p>
        </div>

      {/* Quick Actions */}
      <div className="px-6 py-3 border-b bg-muted/30 flex flex-wrap gap-2">
        <span className="text-sm text-muted-foreground mr-2 self-center">Set all to:</span>
        {VISIBILITY_OPTIONS.map((option) => (
          <Button
            key={option.value}
            variant="outline"
            size="sm"
            onClick={() => setAllTo(option.value)}
            className="text-xs"
          >
            <option.icon className="h-3.5 w-3.5 mr-1" />
            {option.label}
          </Button>
        ))}
      </div>

        {/* Content */}
        <ScrollArea className="flex-1">
        <div className="p-6 space-y-6">
          {/* Peer Messaging Toggle - Master Setting */}
          <Card className="border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
            <CardContent className="pt-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <MessageSquare className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold text-foreground">Peer Messaging</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Allow other participants to see your profile and send you direct messages.
                  </p>
                </div>
                <Switch
                  checked={peerMessagingEnabled}
                  onCheckedChange={handlePeerMessagingToggle}
                />
              </div>

              {peerMessagingEnabled && (
                <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg">
                  <div className="flex gap-2">
                    <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-500 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-amber-800 dark:text-amber-200">
                      When enabled, other participants in recovery can see your name and profile picture,
                      and may send you direct messages. Your coach can always message you regardless of
                      this setting.
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Divider with label */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Field-Level Visibility
              </span>
            </div>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="px-6 pb-6 space-y-6">
            {CATEGORIES.map((category) => {
              const categoryFields = FIELD_DEFINITIONS.filter(
                (f) => f.category === category.id
              )

              return (
                <Card key={category.id}>
                  <CardHeader className="py-3">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                      <category.icon className="h-4 w-4 text-muted-foreground" />
                      {category.label}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0 space-y-3">
                    {categoryFields.map((field) => (
                      <FormField
                        key={field.key}
                        control={form.control}
                        name={field.key}
                        render={({ field: formField }) => (
                          <FormItem className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <field.icon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                              <FormLabel className="font-normal text-sm truncate">
                                {field.label}
                              </FormLabel>
                            </div>
                            <FormControl>
                              <Select
                                onValueChange={formField.onChange}
                                defaultValue={formField.value}
                              >
                                <SelectTrigger className="w-28 md:w-36">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {VISIBILITY_OPTIONS.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                      <div className="flex items-center gap-2">
                                        <option.icon className="h-3.5 w-3.5" />
                                        <span className="text-xs md:text-sm">
                                          {option.label}
                                        </span>
                                      </div>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    ))}
                  </CardContent>
                </Card>
              )
            })}

            {/* Legend */}
            <Card className="bg-muted/50">
              <CardContent className="pt-4">
                <h4 className="font-medium text-sm mb-3">Visibility Levels</h4>
                <div className="space-y-2">
                  {VISIBILITY_OPTIONS.map((option) => (
                    <div key={option.value} className="flex items-center gap-3 text-sm">
                      <option.icon className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{option.label}:</span>
                      <span className="text-muted-foreground">
                        {option.value === 'everyone' && 'All community members can see this'}
                        {option.value === 'coach_only' && 'Only your coach can see this'}
                        {option.value === 'private' && 'Only you and staff can see this'}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </form>
        </Form>
      </ScrollArea>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t bg-muted/30 shrink-0">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button
            onClick={form.handleSubmit(onSubmit)}
            disabled={isSaving}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
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
      </div>
    </ResponsiveModal>
  )
}

export default ProfileVisibilityModal
