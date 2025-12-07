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
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormDescription,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
  Bell,
  MessageSquare,
  Moon,
  Mail,
  ChevronDown,
  Volume2,
  Vibrate,
  Loader2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { useState } from 'react'

// =============================================================================
// VALIDATION SCHEMA
// =============================================================================

const notificationSettingsSchema = z.object({
  // Master toggle
  notificationsEnabled: z.boolean(),

  // Daily reminders
  morningCheckInTime: z.string(),
  eveningReflectionTime: z.string(),

  // Messages
  messageAlerts: z.boolean(),

  // Delivery settings
  quietHoursEnabled: z.boolean(),
  quietHoursStart: z.string(),
  quietHoursEnd: z.string(),
  notificationSounds: z.boolean(),
  vibration: z.boolean(),

  // Email reports
  emailDigestEnabled: z.boolean(),
  emailDigestFrequency: z.string(),
  weeklyReport: z.boolean(),
})

type NotificationSettingsFormValues = z.infer<typeof notificationSettingsSchema>

// =============================================================================
// COMPONENT
// =============================================================================

interface NotificationSettingsModalProps {
  onClose: () => void
}

export function NotificationSettingsModal({ onClose }: NotificationSettingsModalProps) {
  const { user, userData } = useAuth()
  const { toast } = useToast()
  const isMobile = useMediaQuery('(max-width: 768px)')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Expanded sections state
  const [expandedSections, setExpandedSections] = useState({
    messages: false,
    delivery: false,
    emailReports: false,
  })

  // Get notification settings from userData
  const notifications = (userData as unknown as Record<string, unknown>)?.notifications as Record<string, unknown> | undefined

  // Form with default values
  const form = useForm<NotificationSettingsFormValues>({
    resolver: zodResolver(notificationSettingsSchema),
    defaultValues: {
      notificationsEnabled: notifications?.enabled !== false,
      morningCheckInTime: (notifications?.morningCheckIn as string) || '08:00',
      eveningReflectionTime: (notifications?.eveningReflection as string) || '20:00',
      messageAlerts: notifications?.messageAlerts !== false,
      quietHoursEnabled: (notifications?.quietHours as Record<string, unknown>)?.enabled !== false,
      quietHoursStart: (notifications?.quietHours as Record<string, unknown>)?.start as string || '22:00',
      quietHoursEnd: (notifications?.quietHours as Record<string, unknown>)?.end as string || '08:00',
      notificationSounds: notifications?.sounds !== false,
      vibration: notifications?.vibration !== false,
      emailDigestEnabled: (notifications?.emailDigest as Record<string, unknown>)?.enabled !== false,
      emailDigestFrequency: (notifications?.emailDigest as Record<string, unknown>)?.frequency as string || 'weekly',
      weeklyReport: notifications?.weeklyReport !== false,
    },
  })

  // Watch values for conditional rendering
  const watchNotificationsEnabled = form.watch('notificationsEnabled')
  const watchQuietHoursEnabled = form.watch('quietHoursEnabled')
  const watchEmailDigestEnabled = form.watch('emailDigestEnabled')

  // Handle form submission
  const onSubmit = async (values: NotificationSettingsFormValues) => {
    if (!user?.uid) {
      toast({
        title: 'Error',
        description: 'You must be logged in to update settings.',
        variant: 'destructive',
      })
      return
    }

    setIsSubmitting(true)

    try {
      const updates = {
        notifications: {
          enabled: values.notificationsEnabled,
          morningCheckIn: values.morningCheckInTime,
          eveningReflection: values.eveningReflectionTime,
          messageAlerts: values.messageAlerts,
          quietHours: {
            enabled: values.quietHoursEnabled,
            start: values.quietHoursStart,
            end: values.quietHoursEnd,
          },
          sounds: values.notificationSounds,
          vibration: values.vibration,
          emailDigest: {
            enabled: values.emailDigestEnabled,
            frequency: values.emailDigestFrequency,
          },
          weeklyReport: values.weeklyReport,
        },
        updatedAt: serverTimestamp(),
      }

      await updateDoc(doc(db, 'users', user.uid), updates)

      // Update AI context
      await updateContextAfterProfileUpdate(user.uid, {})

      toast({
        title: 'Success',
        description: 'Notification settings updated successfully.',
      })

      onClose()
    } catch (error) {
      console.error('[NotificationSettingsModal] Error updating settings:', error)
      toast({
        title: 'Error',
        description: 'Failed to update notification settings. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Toggle section expansion
  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  // Section header component
  const SectionHeader = ({
    title,
    icon: Icon,
    section,
    count,
    total,
  }: {
    title: string
    icon: typeof Bell
    section: keyof typeof expandedSections
    count: number
    total: number
  }) => (
    <CollapsibleTrigger
      className="flex items-center justify-between w-full py-3 hover:bg-muted/50 rounded-lg px-2"
      onClick={() => toggleSection(section)}
    >
      <div className="flex items-center gap-3">
        <Icon className="h-5 w-5 text-amber-500" />
        <span className="font-medium">{title}</span>
        <span className="text-sm text-muted-foreground">
          ({count}/{total} enabled)
        </span>
      </div>
      <ChevronDown
        className={cn(
          'h-4 w-4 text-muted-foreground transition-transform',
          expandedSections[section] && 'rotate-180'
        )}
      />
    </CollapsibleTrigger>
  )

  // Toggle row component
  const ToggleRow = ({
    checked,
    onCheckedChange,
    label,
    description,
    disabled,
  }: {
    checked: boolean
    onCheckedChange: (checked: boolean) => void
    label: string
    description?: string
    disabled?: boolean
  }) => (
    <div className={cn('flex items-center justify-between py-2', disabled && 'opacity-50')}>
      <div className="flex-1 mr-4">
        <div className="font-medium text-sm">{label}</div>
        {description && <div className="text-xs text-muted-foreground mt-0.5">{description}</div>}
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} disabled={disabled} />
    </div>
  )

  return (
    <DialogContent className="max-w-[95vw] sm:max-w-[600px] p-0 gap-0">
      {/* Header */}
      <DialogHeader className="px-6 py-4 bg-gradient-to-r from-amber-500 to-orange-500">
        <DialogTitle className="text-xl font-bold text-white flex items-center gap-3">
          <Bell className="h-6 w-6" />
          Message & Email Settings
        </DialogTitle>
      </DialogHeader>

      {/* Content */}
      <ScrollArea className="max-h-[calc(90vh-180px)]">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Master Toggle */}
            <div className="px-6 py-4 border-b">
              <FormField
                control={form.control}
                name="notificationsEnabled"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between">
                    <div>
                      <FormLabel className="text-base font-semibold">Enable Alerts</FormLabel>
                      <FormDescription>
                        Master switch to control message alerts and sounds
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <div className="px-6 space-y-4">
              {/* Daily Reminders */}
              <div className="space-y-3">
                <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                  Daily Reminders
                </h3>
                <div className={cn('grid gap-4', isMobile ? 'grid-cols-1' : 'grid-cols-2')}>
                  <FormField
                    control={form.control}
                    name="morningCheckInTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Morning Check-In</FormLabel>
                        <FormControl>
                          <Input
                            type="time"
                            {...field}
                            disabled={!watchNotificationsEnabled}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="eveningReflectionTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Evening Reflection</FormLabel>
                        <FormControl>
                          <Input
                            type="time"
                            {...field}
                            disabled={!watchNotificationsEnabled}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <Separator />

              {/* Messages Section */}
              <Collapsible open={expandedSections.messages}>
                <SectionHeader
                  title="Messages"
                  icon={MessageSquare}
                  section="messages"
                  count={form.watch('messageAlerts') ? 1 : 0}
                  total={1}
                />
                <CollapsibleContent className="pl-8 space-y-2">
                  <FormField
                    control={form.control}
                    name="messageAlerts"
                    render={({ field }) => (
                      <ToggleRow
                        checked={field.value ?? false}
                        onCheckedChange={field.onChange}
                        label="New message notifications"
                        description="Alert when you receive a new message from your coach or peers"
                        disabled={!watchNotificationsEnabled}
                      />
                    )}
                  />
                </CollapsibleContent>
              </Collapsible>

              <Separator />

              {/* Delivery Settings Section */}
              <Collapsible open={expandedSections.delivery}>
                <SectionHeader
                  title="Delivery Settings"
                  icon={Moon}
                  section="delivery"
                  count={
                    [
                      form.watch('quietHoursEnabled'),
                      form.watch('notificationSounds'),
                      form.watch('vibration'),
                    ].filter(Boolean).length
                  }
                  total={3}
                />
                <CollapsibleContent className="pl-8 space-y-4">
                  {/* Quiet Hours */}
                  <div className="space-y-3">
                    <FormField
                      control={form.control}
                      name="quietHoursEnabled"
                      render={({ field }) => (
                        <ToggleRow
                          checked={field.value ?? false}
                          onCheckedChange={field.onChange}
                          label="Quiet Hours"
                          description="Silence notifications during specified hours"
                          disabled={!watchNotificationsEnabled}
                        />
                      )}
                    />

                    {watchQuietHoursEnabled && (
                      <div className={cn('grid gap-4 pl-4', isMobile ? 'grid-cols-1' : 'grid-cols-2')}>
                        <FormField
                          control={form.control}
                          name="quietHoursStart"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm">Start Time</FormLabel>
                              <FormControl>
                                <Input type="time" {...field} disabled={!watchNotificationsEnabled} />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="quietHoursEnd"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm">End Time</FormLabel>
                              <FormControl>
                                <Input type="time" {...field} disabled={!watchNotificationsEnabled} />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                    )}
                  </div>

                  <Separator />

                  {/* Sound & Vibration */}
                  <FormField
                    control={form.control}
                    name="notificationSounds"
                    render={({ field }) => (
                      <div className="flex items-center justify-between py-2">
                        <div className="flex items-center gap-3">
                          <Volume2 className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <div className="font-medium text-sm">Notification Sounds</div>
                            <div className="text-xs text-muted-foreground">Play sounds for alerts</div>
                          </div>
                        </div>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={!watchNotificationsEnabled}
                        />
                      </div>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="vibration"
                    render={({ field }) => (
                      <div className="flex items-center justify-between py-2">
                        <div className="flex items-center gap-3">
                          <Vibrate className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <div className="font-medium text-sm">Vibration</div>
                            <div className="text-xs text-muted-foreground">Vibrate for notifications</div>
                          </div>
                        </div>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={!watchNotificationsEnabled}
                        />
                      </div>
                    )}
                  />
                </CollapsibleContent>
              </Collapsible>

              <Separator />

              {/* Email Reports Section */}
              <Collapsible open={expandedSections.emailReports}>
                <SectionHeader
                  title="Email Reports"
                  icon={Mail}
                  section="emailReports"
                  count={
                    [form.watch('emailDigestEnabled'), form.watch('weeklyReport')].filter(Boolean)
                      .length
                  }
                  total={2}
                />
                <CollapsibleContent className="pl-8 space-y-4">
                  <FormField
                    control={form.control}
                    name="emailDigestEnabled"
                    render={({ field }) => (
                      <ToggleRow
                        checked={field.value ?? false}
                        onCheckedChange={field.onChange}
                        label="Email Digest"
                        description="Receive summary emails of your activity"
                      />
                    )}
                  />

                  {watchEmailDigestEnabled && (
                    <FormField
                      control={form.control}
                      name="emailDigestFrequency"
                      render={({ field }) => (
                        <FormItem className="pl-4">
                          <FormLabel className="text-sm">Frequency</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select frequency" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="daily">Daily</SelectItem>
                              <SelectItem value="weekly">Weekly</SelectItem>
                              <SelectItem value="monthly">Monthly</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
                  )}

                  <FormField
                    control={form.control}
                    name="weeklyReport"
                    render={({ field }) => (
                      <ToggleRow
                        checked={field.value ?? false}
                        onCheckedChange={field.onChange}
                        label="Weekly Progress Report"
                        description="Receive a weekly summary of your recovery progress"
                      />
                    )}
                  />
                </CollapsibleContent>
              </Collapsible>
            </div>
          </form>
        </Form>
      </ScrollArea>

      {/* Footer */}
      <div className="flex items-center justify-end gap-3 px-6 py-4 border-t bg-muted/30">
        <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button
          onClick={form.handleSubmit(onSubmit)}
          disabled={isSubmitting}
          className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
        >
          {isSubmitting ? (
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

export default NotificationSettingsModal
