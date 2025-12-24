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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { User, Phone, MapPin, Settings, Loader2 } from 'lucide-react'
import { useState, useCallback } from 'react'
import { AddressAutocomplete, type AddressComponents } from '@/components/common/AddressAutocomplete'
import { useStatusBarColor } from '@/hooks/useStatusBarColor'

// =============================================================================
// VALIDATION SCHEMA
// =============================================================================

const personalInfoSchema = z.object({
  firstName: z
    .string()
    .min(1, 'First name is required')
    .max(50, 'First name must be less than 50 characters'),
  lastName: z
    .string()
    .min(1, 'Last name is required')
    .max(50, 'Last name must be less than 50 characters'),
  displayName: z
    .string()
    .max(50, 'Display name must be less than 50 characters')
    .optional(),
  phone: z
    .string()
    .regex(/^[\d\s\-()]*$/, 'Invalid phone number format')
    .optional()
    .or(z.literal('')),
  dateOfBirth: z.string().optional().or(z.literal('')),
  gender: z.string().optional(),
  timezone: z.string().optional(),
  dateFormat: z.string().optional(),
  timeFormat: z.string().optional(),
  street: z.string().max(100, 'Street must be less than 100 characters').optional(),
  city: z.string().max(50, 'City must be less than 50 characters').optional(),
  state: z.string().max(50, 'State must be less than 50 characters').optional(),
  zip: z
    .string()
    .regex(/^[\d\-]*$/, 'Invalid ZIP code format')
    .max(10, 'ZIP code must be less than 10 characters')
    .optional()
    .or(z.literal('')),
  insurance: z.string().max(100, 'Insurance must be less than 100 characters').optional(),
  insuranceId: z.string().max(50, 'Insurance ID must be less than 50 characters').optional(),
})

type PersonalInfoFormValues = z.infer<typeof personalInfoSchema>

// =============================================================================
// TIMEZONE OPTIONS
// =============================================================================

const TIMEZONE_OPTIONS = [
  { value: 'America/New_York', label: 'Eastern Time (ET)' },
  { value: 'America/Chicago', label: 'Central Time (CT)' },
  { value: 'America/Denver', label: 'Mountain Time (MT)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
  { value: 'America/Anchorage', label: 'Alaska Time (AKT)' },
  { value: 'Pacific/Honolulu', label: 'Hawaii Time (HT)' },
]

const DATE_FORMAT_OPTIONS = [
  { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY' },
  { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY' },
  { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD' },
]

const TIME_FORMAT_OPTIONS = [
  { value: '12h', label: '12-hour (AM/PM)' },
  { value: '24h', label: '24-hour' },
]

const GENDER_OPTIONS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'non-binary', label: 'Non-Binary' },
  { value: 'prefer-not', label: 'Prefer Not to Say' },
]

// =============================================================================
// COMPONENT
// =============================================================================

interface PersonalInfoModalProps {
  onClose: () => void
}

export function PersonalInfoModal({ onClose }: PersonalInfoModalProps) {
  const { user, userData } = useAuth()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Set iOS status bar to match modal header color
  useStatusBarColor('#058585', true)

  // Get user's current timezone or detect it
  const getUserTimezone = () => {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/Los_Angeles'
  }

  // Convert Firestore Timestamp to date string for form
  const getDateString = (timestamp: unknown): string => {
    if (!timestamp) return ''
    if (typeof timestamp === 'object' && 'toDate' in timestamp) {
      return (timestamp as { toDate: () => Date }).toDate().toISOString().split('T')[0]
    }
    if (timestamp instanceof Date) {
      return timestamp.toISOString().split('T')[0]
    }
    return String(timestamp)
  }

  // Form with default values from userData
  const form = useForm<PersonalInfoFormValues>({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: {
      firstName: userData?.firstName || '',
      lastName: userData?.lastName || '',
      displayName: userData?.displayName || '',
      phone: userData?.phone || '',
      dateOfBirth: getDateString(userData?.dateOfBirth),
      gender: userData?.gender || '',
      timezone: (userData as unknown as Record<string, unknown>)?.timezone as string || getUserTimezone(),
      dateFormat: (userData as unknown as Record<string, unknown>)?.dateFormat as string || 'MM/DD/YYYY',
      timeFormat: (userData as unknown as Record<string, unknown>)?.timeFormat as string || '12h',
      street: ((userData as unknown as Record<string, unknown>)?.address as Record<string, unknown>)?.street as string || '',
      city: ((userData as unknown as Record<string, unknown>)?.address as Record<string, unknown>)?.city as string || '',
      state: ((userData as unknown as Record<string, unknown>)?.address as Record<string, unknown>)?.state as string || '',
      zip: ((userData as unknown as Record<string, unknown>)?.address as Record<string, unknown>)?.zip as string || '',
      insurance: (userData as unknown as Record<string, unknown>)?.insurance as string || '',
      insuranceId: (userData as unknown as Record<string, unknown>)?.insuranceId as string || '',
    },
  })

  // Handle address selection from autocomplete
  const handleAddressSelect = useCallback((address: AddressComponents) => {
    // Auto-fill all address fields
    if (address.street) {
      form.setValue('street', address.street)
    }
    if (address.city) {
      form.setValue('city', address.city)
    }
    if (address.state) {
      form.setValue('state', address.state)
    }
    if (address.zip) {
      form.setValue('zip', address.zip)
    }
    // Auto-set timezone based on state (if we detected one)
    if (address.timezone) {
      form.setValue('timezone', address.timezone)
    }
  }, [form])

  // Handle form submission
  const onSubmit = async (values: PersonalInfoFormValues) => {
    if (!user?.uid) {
      toast({
        title: 'Error',
        description: 'You must be logged in to update your profile.',
        variant: 'destructive',
      })
      return
    }

    setIsSubmitting(true)

    try {
      // Build update object
      const updates: Record<string, unknown> = {
        updatedAt: serverTimestamp(),
      }

      // Basic fields
      if (values.firstName) updates.firstName = values.firstName
      if (values.lastName) updates.lastName = values.lastName
      if (values.displayName !== undefined) updates.displayName = values.displayName || `${values.firstName} ${values.lastName}`.trim()
      if (values.phone !== undefined) updates.phone = values.phone
      if (values.dateOfBirth) updates.dateOfBirth = values.dateOfBirth
      if (values.gender !== undefined) updates.gender = values.gender

      // Preferences
      if (values.timezone) {
        updates.timezone = values.timezone
        updates.timezoneManualOverride = true
        updates.timezoneDetectedAt = serverTimestamp()
      }
      if (values.dateFormat) updates.dateFormat = values.dateFormat
      if (values.timeFormat) updates.timeFormat = values.timeFormat

      // Insurance
      if (values.insurance !== undefined) updates.insurance = values.insurance
      if (values.insuranceId !== undefined) updates.insuranceId = values.insuranceId

      // Address object
      const hasAddressData = values.street || values.city || values.state || values.zip
      if (hasAddressData) {
        updates.address = {
          street: values.street || '',
          city: values.city || '',
          state: values.state || '',
          zip: values.zip || '',
        }
      }

      // Update Firestore
      await updateDoc(doc(db, 'users', user.uid), updates)

      // Update AI context
      await updateContextAfterProfileUpdate(user.uid, {
        displayName: values.displayName || `${values.firstName} ${values.lastName}`.trim(),
      })

      toast({
        title: 'Success',
        description: 'Personal information updated successfully.',
      })

      onClose()
    } catch (error) {
      console.error('[PersonalInfoModal] Error updating profile:', error)
      toast({
        title: 'Error',
        description: 'Failed to update personal information. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <ResponsiveModal open={true} onOpenChange={(open) => !open && onClose()} desktopSize="lg">
      <div className="flex flex-col h-full bg-white overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-[#058585] to-[#047272] shrink-0">
          <h2 className="text-xl font-bold text-white flex items-center gap-3">
            <User className="h-6 w-6" />
            Account Information
          </h2>
        </div>

        {/* Content */}
        <ScrollArea className="flex-1">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 p-6">
            {/* Basic Information Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-primary font-semibold border-b pb-2">
                <User className="h-5 w-5" />
                Basic Information
              </div>

              <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        First Name <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="John" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Last Name <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="displayName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Display Name</FormLabel>
                    <FormControl>
                      <Input placeholder="How others see you in the community" {...field} />
                    </FormControl>
                    <FormDescription>
                      This is how other members will see you in posts and messages.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Separator />

            {/* Contact Information Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-primary font-semibold border-b pb-2">
                <Phone className="h-5 w-5" />
                Contact Information
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium leading-none">Email Address</label>
                <Input value={user?.email || ''} disabled className="bg-muted cursor-not-allowed" />
                <p className="text-[0.8rem] text-muted-foreground">
                  Email cannot be changed here. Contact support if needed.
                </p>
              </div>

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input placeholder="(555) 123-4567" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Separator />

            {/* Personal Details Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-primary font-semibold border-b pb-2">
                <User className="h-5 w-5" />
                Personal Details
              </div>

              <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="dateOfBirth"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date of Birth</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gender</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select Gender" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {GENDER_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Separator />

            {/* Location Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-primary font-semibold border-b pb-2">
                <MapPin className="h-5 w-5" />
                Location
              </div>

              {/* Address Autocomplete */}
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Street Address
                </label>
                <AddressAutocomplete
                  onAddressSelect={handleAddressSelect}
                  initialValue={form.watch('street') || ''}
                  placeholder="Start typing your address..."
                />
                <p className="text-[0.8rem] text-muted-foreground">
                  Select an address to auto-fill city, state, ZIP, and timezone
                </p>
              </div>

              <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input placeholder="San Francisco" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>State</FormLabel>
                      <FormControl>
                        <Input placeholder="CA" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="zip"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ZIP Code</FormLabel>
                      <FormControl>
                        <Input placeholder="94102" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Separator />

            {/* Preferences Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-primary font-semibold border-b pb-2">
                <Settings className="h-5 w-5" />
                Preferences
              </div>

              <FormField
                control={form.control}
                name="timezone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Timezone</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Timezone" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {TIMEZONE_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="dateFormat"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date Format</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select Format" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {DATE_FORMAT_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="timeFormat"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Time Format</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select Format" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {TIME_FORMAT_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </form>
        </Form>
      </ScrollArea>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t bg-muted/30 shrink-0">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            type="submit"
            onClick={form.handleSubmit(onSubmit)}
            disabled={isSubmitting}
            className="bg-gradient-to-r from-[#058585] to-[#047272] hover:from-[#047272] hover:to-[#036363]"
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
      </div>
    </ResponsiveModal>
  )
}

export default PersonalInfoModal
