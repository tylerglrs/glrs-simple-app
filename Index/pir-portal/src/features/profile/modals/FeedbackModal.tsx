import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Card, CardContent } from '@/components/ui/card'
import {
  MessageSquarePlus,
  Bug,
  Lightbulb,
  Heart,
  AlertCircle,
  HelpCircle,
  X,
  Loader2,
  Send,
  Image,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// =============================================================================
// TYPES & OPTIONS
// =============================================================================

const FEEDBACK_TYPES = [
  { value: 'bug', label: 'Bug Report', icon: Bug, color: 'text-red-500' },
  { value: 'feature', label: 'Feature Request', icon: Lightbulb, color: 'text-amber-500' },
  { value: 'praise', label: 'Positive Feedback', icon: Heart, color: 'text-pink-500' },
  { value: 'concern', label: 'Concern', icon: AlertCircle, color: 'text-orange-500' },
  { value: 'other', label: 'Other', icon: HelpCircle, color: 'text-gray-500' },
]

// =============================================================================
// VALIDATION SCHEMA
// =============================================================================

const feedbackSchema = z.object({
  feedbackType: z.enum(['bug', 'feature', 'praise', 'concern', 'other'], {
    message: 'Please select a feedback type',
  }),
  message: z
    .string()
    .min(10, 'Please provide at least 10 characters of feedback')
    .max(2000, 'Feedback must be less than 2000 characters'),
  email: z.string().email('Please enter a valid email').optional().or(z.literal('')),
})

type FeedbackFormValues = z.infer<typeof feedbackSchema>

// =============================================================================
// COMPONENT
// =============================================================================

interface FeedbackModalProps {
  onClose: () => void
}

export function FeedbackModal({ onClose }: FeedbackModalProps) {
  const { user, userData } = useAuth()
  const { toast } = useToast()

  // Get extended user data
  const extendedUserData = userData as unknown as Record<string, unknown> | null

  // State
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [screenshot, setScreenshot] = useState<File | null>(null)
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null)

  // Form
  const form = useForm<FeedbackFormValues>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: {
      feedbackType: undefined,
      message: '',
      email: user?.email || '',
    },
  })

  // Handle screenshot selection
  const handleScreenshotChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: 'Invalid file type',
          description: 'Please select an image file (PNG, JPG, etc.)',
          variant: 'destructive',
        })
        return
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: 'File too large',
          description: 'Please select an image smaller than 5MB',
          variant: 'destructive',
        })
        return
      }

      setScreenshot(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setScreenshotPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  // Remove screenshot
  const removeScreenshot = () => {
    setScreenshot(null)
    setScreenshotPreview(null)
  }

  // Submit handler
  const onSubmit = async (values: FeedbackFormValues) => {
    setIsSubmitting(true)

    try {
      // Prepare feedback data
      const feedbackData: Record<string, unknown> = {
        userId: user?.uid || 'anonymous',
        userName:
          (extendedUserData?.displayName as string) ||
          (extendedUserData?.firstName as string) ||
          'Anonymous',
        userEmail: values.email || user?.email || null,
        type: values.feedbackType,
        message: values.message,
        status: 'new',
        createdAt: serverTimestamp(),
        deviceInfo: {
          userAgent: navigator.userAgent,
          platform: navigator.platform,
          language: navigator.language,
          screenWidth: window.screen.width,
          screenHeight: window.screen.height,
        },
      }

      // If there's a screenshot, convert to base64 and include
      if (screenshot && screenshotPreview) {
        feedbackData.screenshot = screenshotPreview
        feedbackData.screenshotName = screenshot.name
        feedbackData.screenshotSize = screenshot.size
      }

      // Save to Firestore
      await addDoc(collection(db, 'feedback'), feedbackData)

      toast({
        title: 'Thank you!',
        description: 'Your feedback has been submitted successfully.',
      })

      onClose()
    } catch (error) {
      console.error('[FeedbackModal] Error submitting feedback:', error)
      toast({
        title: 'Error',
        description: 'Failed to submit feedback. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Get selected type info
  const selectedType = FEEDBACK_TYPES.find((t) => t.value === form.watch('feedbackType'))

  return (
    <DialogContent className="max-w-[95vw] sm:max-w-[550px] p-0 gap-0">
      {/* Header */}
      <DialogHeader className="px-6 py-4 bg-gradient-to-r from-violet-500 to-purple-600">
        <DialogTitle className="text-xl font-bold text-white flex items-center gap-3">
          <MessageSquarePlus className="h-6 w-6" />
          Send Feedback
        </DialogTitle>
      </DialogHeader>

      {/* Content */}
      <ScrollArea className="max-h-[calc(90vh-180px)]">
        <div className="p-6">
          <p className="text-sm text-muted-foreground mb-6">
            Your feedback helps us improve the recovery experience for everyone. We read every
            submission.
          </p>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              {/* Feedback Type */}
              <FormField
                control={form.control}
                name="feedbackType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Feedback Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type of feedback" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {FEEDBACK_TYPES.map((type) => {
                          const Icon = type.icon
                          return (
                            <SelectItem key={type.value} value={type.value}>
                              <div className="flex items-center gap-2">
                                <Icon className={cn('h-4 w-4', type.color)} />
                                {type.label}
                              </div>
                            </SelectItem>
                          )
                        })}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Type-specific hint */}
              {selectedType && (
                <Card className="bg-muted/30">
                  <CardContent className="p-3 flex items-start gap-3">
                    <selectedType.icon className={cn('h-5 w-5 mt-0.5', selectedType.color)} />
                    <div className="text-sm text-muted-foreground">
                      {selectedType.value === 'bug' && (
                        <>
                          Please describe what happened, what you expected, and steps to reproduce
                          the issue.
                        </>
                      )}
                      {selectedType.value === 'feature' && (
                        <>
                          Tell us about the feature you&apos;d like to see and how it would help
                          your recovery journey.
                        </>
                      )}
                      {selectedType.value === 'praise' && (
                        <>
                          We love hearing what&apos;s working well! Share what you appreciate about
                          the app.
                        </>
                      )}
                      {selectedType.value === 'concern' && (
                        <>
                          Your concerns are important to us. Please share what&apos;s troubling you
                          and we&apos;ll look into it.
                        </>
                      )}
                      {selectedType.value === 'other' && (
                        <>Share anything else on your mind about the GLRS Lighthouse app.</>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Message */}
              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your Feedback</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Tell us what's on your mind..."
                        className="min-h-[150px] resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription className="text-right">
                      {field.value?.length || 0}/2000
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Contact Email (Optional) */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Contact Email <span className="text-muted-foreground">(optional)</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="your.email@example.com"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      We&apos;ll only use this to follow up on your feedback if needed.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Screenshot Upload */}
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Screenshot <span className="text-muted-foreground">(optional)</span>
                </label>

                {screenshotPreview ? (
                  <Card className="relative">
                    <CardContent className="p-2">
                      <img
                        src={screenshotPreview}
                        alt="Screenshot preview"
                        className="w-full h-auto max-h-[200px] object-contain rounded"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2 h-8 w-8"
                        onClick={removeScreenshot}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-muted-foreground/25 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Image className="h-8 w-8 text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">
                        Click to upload a screenshot
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">PNG, JPG up to 5MB</p>
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleScreenshotChange}
                    />
                  </label>
                )}
              </div>
            </form>
          </Form>
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="flex items-center justify-end gap-3 px-6 py-4 border-t bg-muted/30">
        <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button
          onClick={form.handleSubmit(onSubmit)}
          disabled={isSubmitting || !form.formState.isValid}
          className="bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <Send className="mr-2 h-4 w-4" />
              Send Feedback
            </>
          )}
        </Button>
      </div>
    </DialogContent>
  )
}

export default FeedbackModal
