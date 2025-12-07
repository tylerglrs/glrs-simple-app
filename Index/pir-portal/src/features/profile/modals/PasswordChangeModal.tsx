import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
} from 'firebase/auth'
import { auth } from '@/lib/firebase'
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
  FormMessage,
  FormDescription,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Lock, Eye, EyeOff, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useState } from 'react'

// =============================================================================
// VALIDATION SCHEMA
// =============================================================================

const passwordChangeSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number'),
    confirmPassword: z.string().min(1, 'Please confirm your new password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: 'New password must be different from current password',
    path: ['newPassword'],
  })

type PasswordChangeFormValues = z.infer<typeof passwordChangeSchema>

// =============================================================================
// PASSWORD STRENGTH INDICATOR
// =============================================================================

function getPasswordStrength(password: string): {
  score: number
  label: string
  color: string
} {
  let score = 0

  if (password.length >= 8) score++
  if (password.length >= 12) score++
  if (/[A-Z]/.test(password)) score++
  if (/[a-z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++

  if (score <= 2) return { score, label: 'Weak', color: 'bg-red-500' }
  if (score <= 4) return { score, label: 'Fair', color: 'bg-yellow-500' }
  if (score <= 5) return { score, label: 'Good', color: 'bg-blue-500' }
  return { score, label: 'Strong', color: 'bg-green-500' }
}

// =============================================================================
// COMPONENT
// =============================================================================

interface PasswordChangeModalProps {
  onClose: () => void
}

export function PasswordChangeModal({ onClose }: PasswordChangeModalProps) {
  const { user } = useAuth()
  const { toast } = useToast()

  // State
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form
  const form = useForm<PasswordChangeFormValues>({
    resolver: zodResolver(passwordChangeSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  })

  const watchNewPassword = form.watch('newPassword')
  const passwordStrength = getPasswordStrength(watchNewPassword || '')

  // Handle form submission
  const onSubmit = async (values: PasswordChangeFormValues) => {
    if (!user?.email) {
      toast({
        title: 'Error',
        description: 'You must be logged in to change your password.',
        variant: 'destructive',
      })
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      // Re-authenticate user with current password
      const credential = EmailAuthProvider.credential(user.email, values.currentPassword)
      const currentUser = auth.currentUser

      if (!currentUser) {
        throw new Error('No user currently signed in')
      }

      await reauthenticateWithCredential(currentUser, credential)

      // Update password
      await updatePassword(currentUser, values.newPassword)

      toast({
        title: 'Success',
        description: 'Your password has been updated successfully.',
      })

      onClose()
    } catch (err) {
      console.error('[PasswordChangeModal] Error changing password:', err)

      // Handle specific Firebase errors
      const firebaseError = err as { code?: string; message?: string }

      if (firebaseError.code === 'auth/wrong-password') {
        setError('Current password is incorrect. Please try again.')
      } else if (firebaseError.code === 'auth/too-many-requests') {
        setError('Too many failed attempts. Please try again later.')
      } else if (firebaseError.code === 'auth/requires-recent-login') {
        setError('For security, please sign out and sign in again before changing your password.')
      } else if (firebaseError.code === 'auth/weak-password') {
        setError('Password is too weak. Please choose a stronger password.')
      } else {
        setError(firebaseError.message || 'Failed to update password. Please try again.')
      }

      toast({
        title: 'Error',
        description: 'Failed to change password.',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Password requirements checklist
  const requirements = [
    { met: (watchNewPassword?.length || 0) >= 8, text: 'At least 8 characters' },
    { met: /[A-Z]/.test(watchNewPassword || ''), text: 'One uppercase letter' },
    { met: /[a-z]/.test(watchNewPassword || ''), text: 'One lowercase letter' },
    { met: /[0-9]/.test(watchNewPassword || ''), text: 'One number' },
  ]

  return (
    <DialogContent className="max-w-[95vw] sm:max-w-[480px] p-0 gap-0">
      {/* Header */}
      <DialogHeader className="px-6 py-4 bg-gradient-to-r from-indigo-600 to-indigo-700">
        <DialogTitle className="text-xl font-bold text-white flex items-center gap-3">
          <Lock className="h-6 w-6" />
          Change Password
        </DialogTitle>
        <DialogDescription className="text-indigo-100">
          Enter your current password and choose a new one.
        </DialogDescription>
      </DialogHeader>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Current Password */}
            <FormField
              control={form.control}
              name="currentPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Current Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showCurrentPassword ? 'text' : 'password'}
                        placeholder="Enter current password"
                        {...field}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      >
                        {showCurrentPassword ? (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* New Password */}
            <FormField
              control={form.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showNewPassword ? 'text' : 'password'}
                        placeholder="Enter new password"
                        {...field}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                      >
                        {showNewPassword ? (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />

                  {/* Password Strength Indicator */}
                  {watchNewPassword && (
                    <div className="mt-2 space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className={cn('h-full transition-all duration-300', passwordStrength.color)}
                            style={{ width: `${(passwordStrength.score / 6) * 100}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium text-muted-foreground">
                          {passwordStrength.label}
                        </span>
                      </div>

                      {/* Requirements Checklist */}
                      <ul className="space-y-1">
                        {requirements.map((req, index) => (
                          <li
                            key={index}
                            className={cn(
                              'flex items-center gap-2 text-xs',
                              req.met ? 'text-green-600' : 'text-muted-foreground'
                            )}
                          >
                            {req.met ? (
                              <CheckCircle2 className="h-3.5 w-3.5" />
                            ) : (
                              <div className="h-3.5 w-3.5 rounded-full border border-muted-foreground" />
                            )}
                            {req.text}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </FormItem>
              )}
            />

            {/* Confirm Password */}
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm New Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="Re-enter new password"
                        {...field}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormDescription className="text-xs">
              Choose a strong password that you haven&apos;t used before.
            </FormDescription>
          </form>
        </Form>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-end gap-3 px-6 py-4 border-t bg-muted/30">
        <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button
          onClick={form.handleSubmit(onSubmit)}
          disabled={isSubmitting}
          className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Updating...
            </>
          ) : (
            'Update Password'
          )}
        </Button>
      </div>
    </DialogContent>
  )
}

export default PasswordChangeModal
