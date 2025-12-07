import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth'
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
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Lock,
  Loader2,
  XCircle,
  Eye,
  EyeOff,
  ShieldCheck,
} from 'lucide-react'

// =============================================================================
// VALIDATION SCHEMA
// =============================================================================

const passwordSchema = z.object({
  password: z.string().min(1, 'Password is required'),
})

type PasswordFormValues = z.infer<typeof passwordSchema>

// =============================================================================
// COMPONENT
// =============================================================================

interface PasswordModalProps {
  onClose: () => void
  onSuccess?: () => void
  title?: string
  description?: string
}

export function PasswordModal({
  onClose,
  onSuccess,
  title = 'Confirm Your Password',
  description = 'For security, please enter your password to continue.',
}: PasswordModalProps) {
  const { user } = useAuth()
  const { toast } = useToast()

  // State
  const [isVerifying, setIsVerifying] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form
  const form = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      password: '',
    },
  })

  // Handle verification
  const onSubmit = async (values: PasswordFormValues) => {
    if (!user?.email) {
      setError('Authentication error. Please refresh the page and try again.')
      return
    }

    setIsVerifying(true)
    setError(null)

    try {
      // Re-authenticate user
      const credential = EmailAuthProvider.credential(user.email, values.password)
      await reauthenticateWithCredential(user, credential)

      toast({
        title: 'Verified',
        description: 'Password confirmed successfully.',
      })

      // Call success callback if provided
      if (onSuccess) {
        onSuccess()
      }

      onClose()
    } catch (err) {
      console.error('[PasswordModal] Verification failed:', err)

      const error = err as { code?: string; message?: string }

      if (error.code === 'auth/wrong-password') {
        setError('Incorrect password. Please try again.')
      } else if (error.code === 'auth/too-many-requests') {
        setError('Too many failed attempts. Please try again later.')
      } else {
        setError('Verification failed: ' + (error.message || 'Unknown error'))
      }
    } finally {
      setIsVerifying(false)
    }
  }

  return (
    <DialogContent className="max-w-[95vw] sm:max-w-[400px] p-0 gap-0">
      {/* Header */}
      <DialogHeader className="px-6 py-4 bg-gradient-to-r from-gray-700 to-gray-800">
        <DialogTitle className="text-xl font-bold text-white flex items-center gap-3">
          <Lock className="h-6 w-6" />
          {title}
        </DialogTitle>
        <DialogDescription className="text-gray-300 mt-1">{description}</DialogDescription>
      </DialogHeader>

      {/* Content */}
      <div className="p-6 space-y-5">
        {/* Security Badge */}
        <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
          <ShieldCheck className="h-5 w-5 text-emerald-500" />
          <p className="text-sm text-muted-foreground">
            Your password is securely verified and never stored.
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-3 text-destructive text-sm flex items-center gap-2">
            <XCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        {/* Form */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Current Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter your password"
                        disabled={isVerifying}
                        autoComplete="current-password"
                        autoFocus
                        className="pr-10"
                        {...field}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={isVerifying}
                      >
                        {showPassword ? (
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
          </form>
        </Form>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-end gap-3 px-6 py-4 border-t bg-muted/30">
        <Button type="button" variant="outline" onClick={onClose} disabled={isVerifying}>
          Cancel
        </Button>
        <Button
          onClick={form.handleSubmit(onSubmit)}
          disabled={isVerifying || !form.formState.isValid}
          className="bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-800 hover:to-gray-900"
        >
          {isVerifying ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Verifying...
            </>
          ) : (
            'Confirm'
          )}
        </Button>
      </div>
    </DialogContent>
  )
}

export default PasswordModal
