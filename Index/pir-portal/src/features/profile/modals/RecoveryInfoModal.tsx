import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { doc, updateDoc, setDoc, serverTimestamp, Timestamp } from 'firebase/firestore'
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
import { Textarea } from '@/components/ui/textarea'
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Heart, Calendar, DollarSign, Users, AlertTriangle, Loader2, Info } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useState, useMemo } from 'react'
import { RECOVERY_PROGRAMS } from '@/features/journey/types/recovery'
import { getUserTimezone } from '@/lib/timezone'

// =============================================================================
// CONSTANTS
// =============================================================================

const MAX_PROGRAMS = 3

// =============================================================================
// VALIDATION SCHEMA
// =============================================================================

const recoveryInfoSchema = z.object({
  sobrietyDateTime: z.string().optional(),
  substance: z.string().optional(),
  recoveryPrograms: z.array(z.string()).max(MAX_PROGRAMS, `You can select up to ${MAX_PROGRAMS} programs`).optional(),
  // Sponsor info (for 12-step programs: AA, NA, CMA, MA, Celebrate Recovery)
  sponsorName: z.string().max(100, 'Name must be less than 100 characters').optional(),
  sponsorPhone: z
    .string()
    .regex(/^[\d\s\-()]*$/, 'Invalid phone number format')
    .optional()
    .or(z.literal('')),
  // Mentor/Guide info (for Recovery Dharma)
  mentorName: z.string().max(100, 'Name must be less than 100 characters').optional(),
  mentorPhone: z
    .string()
    .regex(/^[\d\s\-()]*$/, 'Invalid phone number format')
    .optional()
    .or(z.literal('')),
  // Accountability Partner info (for Celebrate Recovery)
  accountabilityPartnerName: z.string().max(100, 'Name must be less than 100 characters').optional(),
  accountabilityPartnerPhone: z
    .string()
    .regex(/^[\d\s\-()]*$/, 'Invalid phone number format')
    .optional()
    .or(z.literal('')),
  recoveryGoals: z.string().max(1000, 'Goals must be less than 1000 characters').optional(),
  triggers: z.string().max(1000, 'Triggers must be less than 1000 characters').optional(),
  dailyCost: z
    .string()
    .regex(/^[\d.]*$/, 'Must be a valid number')
    .optional()
    .or(z.literal('')),
})

type RecoveryInfoFormValues = z.infer<typeof recoveryInfoSchema>

// =============================================================================
// OPTIONS
// =============================================================================

const SUBSTANCE_OPTIONS = [
  { value: 'alcohol', label: 'Alcohol' },
  { value: 'opioids', label: 'Opioids' },
  { value: 'stimulants', label: 'Stimulants' },
  { value: 'cannabis', label: 'Cannabis' },
  { value: 'benzodiazepines', label: 'Benzodiazepines' },
  { value: 'multiple', label: 'Multiple Substances' },
  { value: 'other', label: 'Other' },
]

// Group programs by category for better UX
const PROGRAM_OPTIONS_BY_CATEGORY = {
  'twelve-step': RECOVERY_PROGRAMS.filter(p => p.category === 'twelve-step'),
  'faith-based': RECOVERY_PROGRAMS.filter(p => p.category === 'faith-based'),
  'secular': RECOVERY_PROGRAMS.filter(p => p.category === 'secular'),
  'other': RECOVERY_PROGRAMS.filter(p => p.category === 'other'),
}

// =============================================================================
// COMPONENT
// =============================================================================

interface RecoveryInfoModalProps {
  onClose: () => void
}

export function RecoveryInfoModal({ onClose }: RecoveryInfoModalProps) {
  const { user, userData } = useAuth()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showDailyCostWarning, setShowDailyCostWarning] = useState(false)
  const [pendingUpdates, setPendingUpdates] = useState<Record<string, unknown> | null>(null)

  // Get user's timezone
  const userTimezone = useMemo(() => getUserTimezone(userData), [userData])

  // Convert Firestore Timestamp to datetime-local string in user's timezone
  const getDateTimeString = (timestamp: unknown): string => {
    if (!timestamp) return ''
    try {
      let date: Date
      if (timestamp instanceof Timestamp) {
        date = timestamp.toDate()
      } else if (typeof timestamp === 'object' && 'toDate' in timestamp) {
        date = (timestamp as { toDate: () => Date }).toDate()
      } else if (timestamp instanceof Date) {
        date = timestamp
      } else if (typeof timestamp === 'string') {
        date = new Date(timestamp)
      } else {
        return ''
      }
      // Format for datetime-local input (YYYY-MM-DDTHH:mm) in user's timezone
      // Use Intl.DateTimeFormat to properly format in the user's timezone
      const formatter = new Intl.DateTimeFormat('en-CA', {
        timeZone: userTimezone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      })
      const parts = formatter.formatToParts(date)
      const get = (type: string) => parts.find(p => p.type === type)?.value || '00'
      return `${get('year')}-${get('month')}-${get('day')}T${get('hour')}:${get('minute')}`
    } catch {
      return ''
    }
  }

  // Get userData with type casting for extended fields
  const extendedUserData = userData as Record<string, unknown> | null

  // Parse existing programs - handle both single string and array
  const getExistingPrograms = (): string[] => {
    const programs = extendedUserData?.recoveryPrograms
    if (Array.isArray(programs)) return programs
    // Legacy: handle single program stored as string
    const legacyProgram = extendedUserData?.recoveryProgram as string
    if (legacyProgram && legacyProgram !== 'none') return [legacyProgram]
    return []
  }

  // Form with default values from userData
  const form = useForm<RecoveryInfoFormValues>({
    resolver: zodResolver(recoveryInfoSchema),
    defaultValues: {
      sobrietyDateTime: getDateTimeString(userData?.sobrietyDate),
      substance: extendedUserData?.substance as string || '',
      recoveryPrograms: getExistingPrograms(),
      sponsorName: extendedUserData?.sponsorName as string || '',
      sponsorPhone: extendedUserData?.sponsorPhone as string || '',
      mentorName: extendedUserData?.mentorName as string || '',
      mentorPhone: extendedUserData?.mentorPhone as string || '',
      accountabilityPartnerName: extendedUserData?.accountabilityPartnerName as string || '',
      accountabilityPartnerPhone: extendedUserData?.accountabilityPartnerPhone as string || '',
      recoveryGoals: extendedUserData?.recoveryGoals as string || '',
      triggers: extendedUserData?.triggers as string || '',
      dailyCost: extendedUserData?.dailyCost?.toString() || '',
    },
  })

  // Watch selected programs for UI updates
  const selectedPrograms = form.watch('recoveryPrograms') || []

  // Determine which support figure sections to show based on selected programs
  const TWELVE_STEP_PROGRAMS = ['aa', 'na', 'cma']
  const has12StepProgram = selectedPrograms.some(p => TWELVE_STEP_PROGRAMS.includes(p))
  const hasRecoveryDharma = selectedPrograms.includes('recovery-dharma')
  // Note: SMART Recovery doesn't have sponsors

  // Toggle program selection
  const toggleProgram = (programId: string) => {
    const current = form.getValues('recoveryPrograms') || []
    if (current.includes(programId)) {
      // Remove program
      form.setValue('recoveryPrograms', current.filter(p => p !== programId))
    } else if (current.length < MAX_PROGRAMS) {
      // Add program (if under limit)
      form.setValue('recoveryPrograms', [...current, programId])
    }
  }

  // Calculate savings adjustment if daily cost changes
  const calculateSavingsAdjustment = (
    oldCost: number,
    newCost: number,
    currentSavings: number
  ): number => {
    if (oldCost === 0) return currentSavings
    const ratio = newCost / oldCost
    return Math.round(currentSavings * ratio)
  }

  // Handle form submission
  const onSubmit = async (values: RecoveryInfoFormValues) => {
    if (!user?.uid) {
      toast({
        title: 'Error',
        description: 'You must be logged in to update your profile.',
        variant: 'destructive',
      })
      return
    }

    // Build update object
    const updates: Record<string, unknown> = {
      updatedAt: serverTimestamp(),
    }

    // Convert datetime-local to Firestore Timestamp
    // The datetime-local input value is in the format YYYY-MM-DDTHH:mm
    // We need to interpret it in the user's timezone preference
    if (values.sobrietyDateTime) {
      // Parse the datetime-local string components
      const [datePart, timePart] = values.sobrietyDateTime.split('T')
      const [year, month, day] = datePart.split('-').map(Number)
      const [hour, minute] = timePart.split(':').map(Number)

      // The browser creates a date in its local timezone when we use new Date(y,m,d,h,m)
      // But the user entered the time meaning it's in THEIR timezone preference
      // We need to find the difference and adjust

      // Step 1: Create date as if it's in browser's local timezone
      const browserLocalDate = new Date(year, month - 1, day, hour, minute)

      // Step 2: Format this instant in the user's timezone to see how it would appear
      const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: userTimezone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      })
      const parts = formatter.formatToParts(browserLocalDate)
      const getPart = (type: string) => parseInt(parts.find(p => p.type === type)?.value || '0', 10)
      const userTzHour = getPart('hour')
      const userTzMinute = getPart('minute')
      const userTzDay = getPart('day')
      const userTzMonth = getPart('month')
      const userTzYear = getPart('year')

      // Step 3: The user typed the datetime meaning it's in their timezone
      // But we interpreted it as browser local. Calculate the difference.
      // If browserLocal shows 8:00 but in userTz it shows 5:00, difference is 3 hours
      // User meant 8:00 in userTz, which equals (8+3)=11:00 in browserLocal

      // Create a date object from what the same instant looks like in user's timezone
      const sameInstantInUserTz = new Date(userTzYear, userTzMonth - 1, userTzDay, userTzHour, userTzMinute)

      // The offset is how much earlier/later the browser timezone is vs user timezone
      const offsetMs = browserLocalDate.getTime() - sameInstantInUserTz.getTime()

      // Apply the offset: user typed X:XX meaning that time in their timezone
      // We need to add the offset to shift from browser interpretation to correct UTC
      const correctedDate = new Date(browserLocalDate.getTime() + offsetMs)

      updates.sobrietyDate = Timestamp.fromDate(correctedDate)
    }

    // Only add fields that have values
    if (values.substance) updates.substance = values.substance
    // Store programs as array
    if (values.recoveryPrograms && values.recoveryPrograms.length > 0) {
      updates.recoveryPrograms = values.recoveryPrograms
      // Also store first program as recoveryProgram for backwards compatibility
      updates.recoveryProgram = values.recoveryPrograms[0]
    } else {
      updates.recoveryPrograms = []
      updates.recoveryProgram = 'none'
    }
    if (values.sponsorName !== undefined) updates.sponsorName = values.sponsorName
    if (values.sponsorPhone !== undefined) updates.sponsorPhone = values.sponsorPhone
    if (values.mentorName !== undefined) updates.mentorName = values.mentorName
    if (values.mentorPhone !== undefined) updates.mentorPhone = values.mentorPhone
    if (values.accountabilityPartnerName !== undefined) updates.accountabilityPartnerName = values.accountabilityPartnerName
    if (values.accountabilityPartnerPhone !== undefined) updates.accountabilityPartnerPhone = values.accountabilityPartnerPhone
    if (values.recoveryGoals !== undefined) updates.recoveryGoals = values.recoveryGoals
    if (values.triggers !== undefined) updates.triggers = values.triggers

    // Handle dailyCost change with warning
    if (values.dailyCost !== undefined && values.dailyCost !== '') {
      const newDailyCost = parseFloat(values.dailyCost)
      const oldDailyCost = (extendedUserData?.dailyCost as number) || 0
      const currentActualSaved = (extendedUserData?.actualMoneySaved as number) || 0

      // Check if daily cost is changing and user has saved money
      if (oldDailyCost > 0 && newDailyCost !== oldDailyCost && currentActualSaved > 0) {
        const adjustedAmount = calculateSavingsAdjustment(oldDailyCost, newDailyCost, currentActualSaved)
        updates.dailyCost = newDailyCost
        updates._pendingAdjustment = {
          oldCost: oldDailyCost,
          newCost: newDailyCost,
          currentSavings: currentActualSaved,
          adjustedSavings: adjustedAmount,
        }
        setPendingUpdates(updates)
        setShowDailyCostWarning(true)
        return
      }

      updates.dailyCost = newDailyCost
    }

    await saveUpdates(updates)
  }

  // Save updates to Firestore
  const saveUpdates = async (updates: Record<string, unknown>) => {
    if (!user?.uid) return

    setIsSubmitting(true)

    try {
      // Remove internal fields
      const cleanUpdates = { ...updates }
      delete cleanUpdates._pendingAdjustment

      await updateDoc(doc(db, 'users', user.uid), cleanUpdates)

      // Sync sponsor/mentor info to program progress documents for two-way sync
      const selectedPrograms = (cleanUpdates.recoveryPrograms as string[]) || form.getValues('recoveryPrograms') || []
      const sponsorName = cleanUpdates.sponsorName as string | undefined
      const sponsorPhone = cleanUpdates.sponsorPhone as string | undefined
      const mentorName = cleanUpdates.mentorName as string | undefined
      const mentorPhone = cleanUpdates.mentorPhone as string | undefined
      const accountabilityPartnerName = cleanUpdates.accountabilityPartnerName as string | undefined
      const accountabilityPartnerPhone = cleanUpdates.accountabilityPartnerPhone as string | undefined

      // Sync sponsor info to 12-step program progress documents
      const TWELVE_STEP_PROGRAM_IDS = ['aa', 'na', 'cma']
      const syncPromises: Promise<void>[] = []

      for (const programId of selectedPrograms) {
        if (TWELVE_STEP_PROGRAM_IDS.includes(programId)) {
          // Sync sponsor to 12-step progress document
          const collectionName = `${programId}Progress`
          const progressRef = doc(db, collectionName, user.uid)
          syncPromises.push(
            setDoc(progressRef, {
              userId: user.uid,
              sponsorName: sponsorName ?? '',
              sponsorPhone: sponsorPhone ?? '',
              updatedAt: serverTimestamp(),
            }, { merge: true })
          )
        }

        if (programId === 'recovery-dharma') {
          // Sync mentor to Recovery Dharma progress
          const progressRef = doc(db, 'recoveryDharmaProgress', user.uid)
          syncPromises.push(
            setDoc(progressRef, {
              userId: user.uid,
              mentorName: mentorName ?? '',
              mentorPhone: mentorPhone ?? '',
              updatedAt: serverTimestamp(),
            }, { merge: true })
          )
        }

      }

      // Wait for all syncs to complete
      await Promise.all(syncPromises)

      // Update AI context with recovery info changes
      await updateContextAfterProfileUpdate(user.uid, {})

      toast({
        title: 'Success',
        description: 'Recovery information updated successfully.',
      })

      onClose()
    } catch (error) {
      console.error('[RecoveryInfoModal] Error updating recovery info:', error)
      toast({
        title: 'Error',
        description: 'Failed to update recovery information. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle daily cost adjustment confirmation
  const handleDailyCostConfirm = async (adjustSavings: boolean) => {
    if (!pendingUpdates) return

    const updates = { ...pendingUpdates }
    const adjustment = updates._pendingAdjustment as {
      adjustedSavings: number
    }

    if (adjustSavings && adjustment) {
      updates.actualMoneySaved = adjustment.adjustedSavings
    }

    delete updates._pendingAdjustment
    setShowDailyCostWarning(false)
    setPendingUpdates(null)

    await saveUpdates(updates)
  }

  // Get adjustment info for warning dialog
  const adjustmentInfo = pendingUpdates?._pendingAdjustment as {
    oldCost: number
    newCost: number
    currentSavings: number
    adjustedSavings: number
  } | undefined

  return (
    <>
      <ResponsiveModal open={true} onOpenChange={(open) => !open && onClose()} desktopSize="lg">
        <div className="flex flex-col h-full bg-white overflow-hidden">
          {/* Header */}
          <div className="px-6 py-4 bg-gradient-to-r from-emerald-600 to-emerald-700 shrink-0">
            <h2 className="text-xl font-bold text-white flex items-center gap-3">
              <Heart className="h-6 w-6" />
              Recovery Information
            </h2>
          </div>

          {/* Content */}
          <ScrollArea className="flex-1">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 p-6">
              {/* Sobriety Date Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-emerald-600 font-semibold border-b pb-2">
                  <Calendar className="h-5 w-5" />
                  Sobriety Date
                </div>

                <FormField
                  control={form.control}
                  name="sobrietyDateTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Sobriety Date & Time <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input type="datetime-local" {...field} />
                      </FormControl>
                      <FormDescription>
                        Enter the date and time 24 hours after your last use.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Separator />

              {/* Substance & Program Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-emerald-600 font-semibold border-b pb-2">
                  <Heart className="h-5 w-5" />
                  Recovery Details
                </div>

                <FormField
                  control={form.control}
                  name="substance"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Primary Substance</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select Substance" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {SUBSTANCE_OPTIONS.map((option) => (
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

                {/* Multi-select Recovery Programs */}
                <FormField
                  control={form.control}
                  name="recoveryPrograms"
                  render={() => (
                    <FormItem>
                      <div className="flex items-center justify-between">
                        <FormLabel>Recovery Programs</FormLabel>
                        <span className={cn(
                          "text-xs font-medium px-2 py-0.5 rounded-full",
                          selectedPrograms.length >= MAX_PROGRAMS
                            ? "bg-amber-100 text-amber-700"
                            : "bg-gray-100 text-gray-600"
                        )}>
                          {selectedPrograms.length}/{MAX_PROGRAMS} selected
                        </span>
                      </div>

                      <div className="space-y-4 mt-2">
                        {/* 12-Step Programs */}
                        <div className="space-y-2">
                          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">12-Step Programs</p>
                          <div className="grid grid-cols-2 gap-2">
                            {PROGRAM_OPTIONS_BY_CATEGORY['twelve-step'].map((program) => {
                              const isSelected = selectedPrograms.includes(program.id)
                              const isDisabled = !isSelected && selectedPrograms.length >= MAX_PROGRAMS
                              return (
                                <button
                                  key={program.id}
                                  type="button"
                                  onClick={() => toggleProgram(program.id)}
                                  disabled={isDisabled}
                                  className={cn(
                                    "flex items-center gap-2 p-3 rounded-lg border-2 text-left transition-all",
                                    isSelected
                                      ? "border-emerald-500 bg-emerald-50"
                                      : isDisabled
                                        ? "border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed"
                                        : "border-gray-200 hover:border-emerald-300 hover:bg-emerald-50/50"
                                  )}
                                >
                                  <div
                                    className={cn(
                                      "w-5 h-5 rounded flex items-center justify-center flex-shrink-0",
                                      isSelected ? "bg-emerald-500 text-white" : "border border-gray-300"
                                    )}
                                  >
                                    {isSelected && <span className="text-xs">✓</span>}
                                  </div>
                                  <div className="min-w-0">
                                    <p className="font-medium text-sm truncate">{program.shortName}</p>
                                    <p className="text-xs text-gray-500 truncate">{program.name.replace(` (${program.shortName})`, '')}</p>
                                  </div>
                                </button>
                              )
                            })}
                          </div>
                        </div>

                        {/* Secular Programs */}
                        <div className="space-y-2">
                          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Secular Programs</p>
                          <div className="grid grid-cols-2 gap-2">
                            {PROGRAM_OPTIONS_BY_CATEGORY['secular'].map((program) => {
                              const isSelected = selectedPrograms.includes(program.id)
                              const isDisabled = !isSelected && selectedPrograms.length >= MAX_PROGRAMS
                              return (
                                <button
                                  key={program.id}
                                  type="button"
                                  onClick={() => toggleProgram(program.id)}
                                  disabled={isDisabled}
                                  className={cn(
                                    "flex items-center gap-2 p-3 rounded-lg border-2 text-left transition-all",
                                    isSelected
                                      ? "border-emerald-500 bg-emerald-50"
                                      : isDisabled
                                        ? "border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed"
                                        : "border-gray-200 hover:border-emerald-300 hover:bg-emerald-50/50"
                                  )}
                                >
                                  <div
                                    className={cn(
                                      "w-5 h-5 rounded flex items-center justify-center flex-shrink-0",
                                      isSelected ? "bg-emerald-500 text-white" : "border border-gray-300"
                                    )}
                                  >
                                    {isSelected && <span className="text-xs">✓</span>}
                                  </div>
                                  <div className="min-w-0">
                                    <p className="font-medium text-sm truncate">{program.shortName}</p>
                                    <p className="text-xs text-gray-500 truncate">{program.name.replace(` (${program.shortName})`, '').replace(' Secular Recovery', '')}</p>
                                  </div>
                                </button>
                              )
                            })}
                          </div>
                        </div>

                        {/* Faith-Based Programs */}
                        <div className="space-y-2">
                          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Faith-Based Programs</p>
                          <div className="grid grid-cols-2 gap-2">
                            {PROGRAM_OPTIONS_BY_CATEGORY['faith-based'].map((program) => {
                              const isSelected = selectedPrograms.includes(program.id)
                              const isDisabled = !isSelected && selectedPrograms.length >= MAX_PROGRAMS
                              return (
                                <button
                                  key={program.id}
                                  type="button"
                                  onClick={() => toggleProgram(program.id)}
                                  disabled={isDisabled}
                                  className={cn(
                                    "flex items-center gap-2 p-3 rounded-lg border-2 text-left transition-all",
                                    isSelected
                                      ? "border-emerald-500 bg-emerald-50"
                                      : isDisabled
                                        ? "border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed"
                                        : "border-gray-200 hover:border-emerald-300 hover:bg-emerald-50/50"
                                  )}
                                >
                                  <div
                                    className={cn(
                                      "w-5 h-5 rounded flex items-center justify-center flex-shrink-0",
                                      isSelected ? "bg-emerald-500 text-white" : "border border-gray-300"
                                    )}
                                  >
                                    {isSelected && <span className="text-xs">✓</span>}
                                  </div>
                                  <div className="min-w-0">
                                    <p className="font-medium text-sm truncate">{program.shortName}</p>
                                    <p className="text-xs text-gray-500 truncate">{program.name}</p>
                                  </div>
                                </button>
                              )
                            })}
                          </div>
                        </div>

                        {/* Other Options */}
                        <div className="space-y-2">
                          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Other</p>
                          <div className="grid grid-cols-2 gap-2">
                            {PROGRAM_OPTIONS_BY_CATEGORY['other'].map((program) => {
                              const isSelected = selectedPrograms.includes(program.id)
                              const isDisabled = !isSelected && selectedPrograms.length >= MAX_PROGRAMS
                              return (
                                <button
                                  key={program.id}
                                  type="button"
                                  onClick={() => toggleProgram(program.id)}
                                  disabled={isDisabled}
                                  className={cn(
                                    "flex items-center gap-2 p-3 rounded-lg border-2 text-left transition-all",
                                    isSelected
                                      ? "border-emerald-500 bg-emerald-50"
                                      : isDisabled
                                        ? "border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed"
                                        : "border-gray-200 hover:border-emerald-300 hover:bg-emerald-50/50"
                                  )}
                                >
                                  <div
                                    className={cn(
                                      "w-5 h-5 rounded flex items-center justify-center flex-shrink-0",
                                      isSelected ? "bg-emerald-500 text-white" : "border border-gray-300"
                                    )}
                                  >
                                    {isSelected && <span className="text-xs">✓</span>}
                                  </div>
                                  <div className="min-w-0">
                                    <p className="font-medium text-sm truncate">{program.name}</p>
                                  </div>
                                </button>
                              )
                            })}
                          </div>
                        </div>
                      </div>

                      {selectedPrograms.length > 0 && (
                        <div className="flex items-start gap-2 mt-3 p-2 bg-emerald-50 rounded-lg">
                          <Info className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                          <p className="text-sm text-emerald-700">
                            Your Journey tab will show progress tracking for: {selectedPrograms.map(id =>
                              RECOVERY_PROGRAMS.find(p => p.id === id)?.shortName
                            ).filter(Boolean).join(', ')}
                          </p>
                        </div>
                      )}
                      <FormDescription>
                        Select up to {MAX_PROGRAMS} recovery programs you're participating in.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Separator />

              {/* Daily Cost Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-emerald-600 font-semibold border-b pb-2">
                  <DollarSign className="h-5 w-5" />
                  Financial Impact
                </div>

                <FormField
                  control={form.control}
                  name="dailyCost"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Daily Cost of Use ($)</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                            $
                          </span>
                          <Input type="number" inputMode="decimal" step="0.01" min="0" className="pl-7" {...field} />
                        </div>
                      </FormControl>
                      <FormDescription>
                        Used to calculate money saved in recovery.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Separator />

              {/* Dynamic Support Figure Sections */}
              {(has12StepProgram || hasRecoveryDharma) && (
                <>
                  {/* Sponsor Section - for 12-step programs */}
                  {has12StepProgram && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-emerald-600 font-semibold border-b pb-2">
                        <Users className="h-5 w-5" />
                        Sponsor Information
                        <span className="ml-auto text-xs font-normal text-gray-500">
                          12-Step Programs
                        </span>
                      </div>

                      <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                        <FormField
                          control={form.control}
                          name="sponsorName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Sponsor Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Your sponsor's name" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="sponsorPhone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Sponsor Phone</FormLabel>
                              <FormControl>
                                <Input placeholder="(555) 123-4567" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <p className="text-xs text-gray-500">
                        Your sponsor guides you through the steps and shares their experience of recovery.
                      </p>
                    </div>
                  )}

                  {/* Mentor/Guide Section - for Recovery Dharma */}
                  {hasRecoveryDharma && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-orange-600 font-semibold border-b pb-2">
                        <Users className="h-5 w-5" />
                        Mentor / Guide
                        <span className="ml-auto text-xs font-normal text-gray-500">Recovery Dharma</span>
                      </div>

                      <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                        <FormField
                          control={form.control}
                          name="mentorName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Mentor/Guide Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Your mentor's name" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="mentorPhone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Mentor/Guide Phone</FormLabel>
                              <FormControl>
                                <Input placeholder="(555) 123-4567" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <p className="text-xs text-gray-500">
                        In Recovery Dharma, mentors guide you through Buddhist principles and meditation practices.
                      </p>
                    </div>
                  )}

                  <Separator />
                </>
              )}

              {/* No support figure message for secular programs without sponsors */}
              {selectedPrograms.length > 0 && !has12StepProgram && !hasRecoveryDharma && (
                <>
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-gray-500 font-semibold border-b pb-2">
                      <Users className="h-5 w-5" />
                      Support Network
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600">
                      <p>
                        <strong>{selectedPrograms.map(id => RECOVERY_PROGRAMS.find(p => p.id === id)?.shortName).join(', ')}</strong>{' '}
                        {selectedPrograms.length === 1 ? 'uses' : 'use'} peer-based group support rather than individual sponsorship.
                      </p>
                      <p className="mt-2">
                        Support comes from fellow members during meetings and through the community.
                      </p>
                    </div>
                  </div>
                  <Separator />
                </>
              )}

              {/* Goals & Triggers Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-emerald-600 font-semibold border-b pb-2">
                  <AlertTriangle className="h-5 w-5" />
                  Goals & Awareness
                </div>

                <FormField
                  control={form.control}
                  name="recoveryGoals"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Recovery Goals</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="What do you want to achieve in your recovery?"
                          className="min-h-[80px] resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="triggers"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Known Triggers</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="What situations or emotions trigger cravings?"
                          className="min-h-[80px] resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Understanding your triggers helps you stay prepared.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
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
              className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800"
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

      {/* Daily Cost Warning Dialog */}
      <AlertDialog open={showDailyCostWarning} onOpenChange={setShowDailyCostWarning}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Changing Daily Cost Impact
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              {adjustmentInfo && (
                <>
                  <p>
                    Old: ${adjustmentInfo.oldCost}/day → New: ${adjustmentInfo.newCost}/day
                  </p>
                  <p>This will change all your savings calculations.</p>
                  <p>Your current actual savings: ${adjustmentInfo.currentSavings.toLocaleString()}</p>
                  <p className="font-medium">
                    Would you like to adjust your actual savings proportionally?
                  </p>
                  <p>Adjusted amount: ${adjustmentInfo.adjustedSavings.toLocaleString()}</p>
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => handleDailyCostConfirm(false)}>
              Keep ${adjustmentInfo?.currentSavings.toLocaleString()}
            </AlertDialogCancel>
            <AlertDialogAction onClick={() => handleDailyCostConfirm(true)}>
              Adjust to ${adjustmentInfo?.adjustedSavings.toLocaleString()}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

export default RecoveryInfoModal
