import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'
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
import { GraduationCap, School, BookOpen, Award, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useState } from 'react'
import { EDUCATION_LEVELS } from '@/features/journey/types/recovery'
import { useStatusBarColor } from '@/hooks/useStatusBarColor'

// =============================================================================
// VALIDATION SCHEMA
// =============================================================================

const educationInfoSchema = z.object({
  educationLevel: z.string().optional(),
  schoolName: z.string().max(200, 'School name must be less than 200 characters').optional(),
  fieldOfStudy: z.string().max(100, 'Field must be less than 100 characters').optional(),
  graduationYear: z
    .string()
    .regex(/^(\d{4})?$/, 'Must be a valid year')
    .optional()
    .or(z.literal('')),
  certifications: z.string().max(500, 'Too many characters').optional(),
  educationNotes: z.string().max(1000, 'Notes too long').optional(),
})

type EducationInfoFormValues = z.infer<typeof educationInfoSchema>

// =============================================================================
// COMPONENT
// =============================================================================

interface EducationInfoModalProps {
  onClose: () => void
}

export function EducationInfoModal({ onClose }: EducationInfoModalProps) {
  const { user, userData } = useAuth()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Set iOS status bar to match modal header color (emerald-600)
  useStatusBarColor('#059669', true)

  // Get userData with type casting for extended fields
  const extendedUserData = userData as Record<string, unknown> | null

  // Form with default values from userData
  const form = useForm<EducationInfoFormValues>({
    resolver: zodResolver(educationInfoSchema),
    defaultValues: {
      educationLevel: extendedUserData?.educationLevel as string || '',
      schoolName: extendedUserData?.schoolName as string || '',
      fieldOfStudy: extendedUserData?.fieldOfStudy as string || '',
      graduationYear: extendedUserData?.graduationYear?.toString() || '',
      certifications: extendedUserData?.certifications as string || '',
      educationNotes: extendedUserData?.educationNotes as string || '',
    },
  })

  // Handle form submission
  const onSubmit = async (values: EducationInfoFormValues) => {
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

      // Only add fields that have values
      if (values.educationLevel) updates.educationLevel = values.educationLevel
      if (values.schoolName !== undefined) updates.schoolName = values.schoolName
      if (values.fieldOfStudy !== undefined) updates.fieldOfStudy = values.fieldOfStudy
      if (values.graduationYear) updates.graduationYear = parseInt(values.graduationYear)
      if (values.certifications !== undefined) updates.certifications = values.certifications
      if (values.educationNotes !== undefined) updates.educationNotes = values.educationNotes

      await updateDoc(doc(db, 'users', user.uid), updates)

      toast({
        title: 'Success',
        description: 'Education information updated successfully.',
      })

      onClose()
    } catch (error) {
      console.error('[EducationInfoModal] Error updating education info:', error)
      toast({
        title: 'Error',
        description: 'Failed to update education information. Please try again.',
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
        <div className="px-6 py-4 bg-gradient-to-r from-emerald-600 to-green-700 shrink-0">
          <h2 className="text-xl font-bold text-white flex items-center gap-3">
            <GraduationCap className="h-6 w-6" />
            Education Information
          </h2>
        </div>

        {/* Content */}
        <ScrollArea className="flex-1">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 p-6">
            {/* Education Level Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-emerald-600 font-semibold border-b pb-2">
                <GraduationCap className="h-5 w-5" />
                Education Level
              </div>

              <FormField
                control={form.control}
                name="educationLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Highest Level Completed</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Education Level" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {EDUCATION_LEVELS.map((level) => (
                          <SelectItem key={level.id} value={level.id}>
                            {level.name}
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

            {/* School Info Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-emerald-600 font-semibold border-b pb-2">
                <School className="h-5 w-5" />
                School Information
              </div>

              <FormField
                control={form.control}
                name="schoolName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>School/Institution Name</FormLabel>
                    <FormControl>
                      <Input placeholder="University, college, or school name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="fieldOfStudy"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Field of Study/Major</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Business, Computer Science" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="graduationYear"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Graduation Year</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., 2020" type="number" inputMode="numeric" min="1950" max="2040" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Separator />

            {/* Certifications Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-emerald-600 font-semibold border-b pb-2">
                <Award className="h-5 w-5" />
                Certifications & Licenses
              </div>

              <FormField
                control={form.control}
                name="certifications"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Professional Certifications</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="List any professional certifications, licenses, or credentials"
                        className="min-h-[80px] resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Include any trade certifications, professional licenses, or specialized training.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Separator />

            {/* Additional Notes Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-emerald-600 font-semibold border-b pb-2">
                <BookOpen className="h-5 w-5" />
                Additional Notes
              </div>

              <FormField
                control={form.control}
                name="educationNotes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Education Notes</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Any additional information about your education journey"
                        className="min-h-[80px] resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Share your educational journey, current learning goals, or skills development.
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
            className="bg-gradient-to-r from-emerald-600 to-green-700 hover:from-emerald-700 hover:to-green-800"
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

export default EducationInfoModal
