import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { doc, updateDoc, serverTimestamp, Timestamp } from 'firebase/firestore'
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
import { Heart, Calendar, DollarSign, Users, AlertTriangle, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { useState } from 'react'

// =============================================================================
// VALIDATION SCHEMA
// =============================================================================

const recoveryInfoSchema = z.object({
  sobrietyDateTime: z.string().optional(),
  substance: z.string().optional(),
  recoveryProgram: z.string().optional(),
  sponsorName: z.string().max(100, 'Name must be less than 100 characters').optional(),
  sponsorPhone: z
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

const PROGRAM_OPTIONS = [
  { value: 'aa', label: 'Alcoholics Anonymous (AA)' },
  { value: 'na', label: 'Narcotics Anonymous (NA)' },
  { value: 'smart', label: 'SMART Recovery' },
  { value: 'celebrate', label: 'Celebrate Recovery' },
  { value: 'refuge', label: 'Refuge Recovery' },
  { value: 'lifering', label: 'LifeRing Secular Recovery' },
  { value: 'women', label: 'Women for Sobriety' },
  { value: 'other', label: 'Other Program' },
  { value: 'none', label: 'Not in a program' },
]

// =============================================================================
// COMPONENT
// =============================================================================

interface RecoveryInfoModalProps {
  onClose: () => void
}

export function RecoveryInfoModal({ onClose }: RecoveryInfoModalProps) {
  const { user, userData } = useAuth()
  const { toast } = useToast()
  const isMobile = useMediaQuery('(max-width: 768px)')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showDailyCostWarning, setShowDailyCostWarning] = useState(false)
  const [pendingUpdates, setPendingUpdates] = useState<Record<string, unknown> | null>(null)

  // Convert Firestore Timestamp to datetime-local string
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
      // Format for datetime-local input (YYYY-MM-DDTHH:mm)
      return date.toISOString().slice(0, 16)
    } catch {
      return ''
    }
  }

  // Get userData with type casting for extended fields
  const extendedUserData = userData as Record<string, unknown> | null

  // Form with default values from userData
  const form = useForm<RecoveryInfoFormValues>({
    resolver: zodResolver(recoveryInfoSchema),
    defaultValues: {
      sobrietyDateTime: getDateTimeString(userData?.sobrietyDate),
      substance: extendedUserData?.substance as string || '',
      recoveryProgram: extendedUserData?.recoveryProgram as string || '',
      sponsorName: extendedUserData?.sponsorName as string || '',
      sponsorPhone: extendedUserData?.sponsorPhone as string || '',
      recoveryGoals: extendedUserData?.recoveryGoals as string || '',
      triggers: extendedUserData?.triggers as string || '',
      dailyCost: extendedUserData?.dailyCost?.toString() || '',
    },
  })

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

    // Convert datetime-local to ISO string for Firestore
    if (values.sobrietyDateTime) {
      const sobrietyDate = new Date(values.sobrietyDateTime)
      updates.sobrietyDate = Timestamp.fromDate(sobrietyDate)
    }

    // Only add fields that have values
    if (values.substance) updates.substance = values.substance
    if (values.recoveryProgram) updates.recoveryProgram = values.recoveryProgram
    if (values.sponsorName !== undefined) updates.sponsorName = values.sponsorName
    if (values.sponsorPhone !== undefined) updates.sponsorPhone = values.sponsorPhone
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
      <DialogContent className="max-w-[95vw] sm:max-w-[600px] p-0 gap-0">
        {/* Header */}
        <DialogHeader className="px-6 py-4 bg-gradient-to-r from-emerald-600 to-emerald-700">
          <DialogTitle className="text-xl font-bold text-white flex items-center gap-3">
            <Heart className="h-6 w-6" />
            Recovery Information
          </DialogTitle>
        </DialogHeader>

        {/* Content */}
        <ScrollArea className="max-h-[calc(90vh-180px)]">
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

                <FormField
                  control={form.control}
                  name="recoveryProgram"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Recovery Program</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select Program (Optional)" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {PROGRAM_OPTIONS.map((option) => (
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
                          <Input type="number" step="0.01" min="0" className="pl-7" {...field} />
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

              {/* Sponsor Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-emerald-600 font-semibold border-b pb-2">
                  <Users className="h-5 w-5" />
                  Sponsor Information
                </div>

                <div className={cn('grid gap-4', isMobile ? 'grid-cols-1' : 'grid-cols-2')}>
                  <FormField
                    control={form.control}
                    name="sponsorName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sponsor Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Optional" {...field} />
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
              </div>

              <Separator />

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
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t bg-muted/30">
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
      </DialogContent>

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
