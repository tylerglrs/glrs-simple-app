import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  deleteUser as firebaseDeleteUser
} from 'firebase/auth'
import { doc, deleteDoc, collection, query, where, getDocs, writeBatch } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/hooks/use-toast'
import { ResponsiveModal } from '@/components/ui/responsive-modal'
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
import { Checkbox } from '@/components/ui/checkbox'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Card, CardContent } from '@/components/ui/card'
import {
  ShieldAlert,
  AlertTriangle,
  Loader2,
  XCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// =============================================================================
// DATA DELETION LIST
// =============================================================================

const DELETION_ITEMS = [
  'Your complete user profile and account settings',
  'All check-in data and daily reflections',
  'Personal goals, milestones, and progress tracking',
  'Assignments from your coach',
  'All messages and conversations',
  'Community posts, comments, and likes',
  'Saved resources and bookmarks',
  'Notification preferences and history',
  'Connected calendar integrations',
  'All uploaded photos and documents',
]

// =============================================================================
// VALIDATION SCHEMA
// =============================================================================

const deleteAccountSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(1, 'Password is required'),
  confirmText: z.string().refine((val) => val === 'DELETE', {
    message: 'Please type DELETE to confirm',
  }),
  understood: z.boolean().refine((val) => val === true, {
    message: 'You must confirm you understand this action is permanent',
  }),
})

type DeleteAccountFormValues = z.infer<typeof deleteAccountSchema>

// =============================================================================
// COMPONENT
// =============================================================================

interface DeleteAccountModalProps {
  onClose: () => void
}

export function DeleteAccountModal({ onClose }: DeleteAccountModalProps) {
  const { user } = useAuth()
  const { toast } = useToast()


  // State
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [deletionProgress, setDeletionProgress] = useState<string | null>(null)

  // Form
  const form = useForm<DeleteAccountFormValues>({
    resolver: zodResolver(deleteAccountSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmText: '',
      understood: false,
    },
  })

  // Check if form is valid for submission
  const isFormValid = form.formState.isValid

  // Delete user data from all collections
  const deleteUserData = async (userId: string) => {
    const collectionsToDelete = [
      'checkIns',
      'goals',
      'assignments',
      'messages',
      'communityMessages',
      'gratitudes',
      'reflections',
      'habits',
      'habitCompletions',
      'quickReflections',
      'todayWins',
      'breakthroughs',
      'savingsItems',
      'savingsGoals',
      'moneyMapStops',
      'notifications',
    ]

    for (const collectionName of collectionsToDelete) {
      setDeletionProgress(`Deleting ${collectionName}...`)

      try {
        const q = query(collection(db, collectionName), where('userId', '==', userId))
        const snapshot = await getDocs(q)

        if (!snapshot.empty) {
          const batch = writeBatch(db)
          snapshot.docs.forEach((doc) => {
            batch.delete(doc.ref)
          })
          await batch.commit()
        }
      } catch (err) {
        console.error(`[DeleteAccountModal] Error deleting ${collectionName}:`, err)
        // Continue with other collections even if one fails
      }
    }

    // Delete the user document
    setDeletionProgress('Deleting user profile...')
    try {
      await deleteDoc(doc(db, 'users', userId))
    } catch (err) {
      console.error('[DeleteAccountModal] Error deleting user document:', err)
    }
  }

  // Handle delete
  const onSubmit = async (values: DeleteAccountFormValues) => {
    if (!user) {
      setError('Authentication error. Please refresh the page and try again.')
      return
    }

    // Verify email matches
    if (values.email !== user.email) {
      setError('Email address does not match your account.')
      return
    }

    setIsDeleting(true)
    setError(null)
    setDeletionProgress('Verifying credentials...')

    try {
      // Re-authenticate user
      const credential = EmailAuthProvider.credential(values.email, values.password)
      await reauthenticateWithCredential(user, credential)

      // Delete all user data from Firestore
      await deleteUserData(user.uid)

      // Delete the Firebase Auth user
      setDeletionProgress('Removing account...')
      await firebaseDeleteUser(user)

      toast({
        title: 'Account Deleted',
        description: 'Your account and all associated data have been permanently deleted.',
      })

      // Close modal - the auth state change will redirect to login
      onClose()
    } catch (err) {
      console.error('[DeleteAccountModal] Error deleting account:', err)

      const error = err as { code?: string; message?: string }

      if (error.code === 'auth/wrong-password') {
        setError('Incorrect password. Please try again.')
      } else if (error.code === 'auth/requires-recent-login') {
        setError('For security, please sign out and sign in again before deleting your account.')
      } else if (error.code === 'auth/too-many-requests') {
        setError('Too many failed attempts. Please try again later.')
      } else {
        setError('Failed to delete account: ' + (error.message || 'Unknown error'))
      }
    } finally {
      setIsDeleting(false)
      setDeletionProgress(null)
    }
  }

  return (
    <ResponsiveModal open={true} onOpenChange={(open) => !open && onClose()} desktopSize="md">
      <div className="flex flex-col h-full bg-white overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-teal-600 to-teal-700 shrink-0">
          <h2 className="text-xl font-bold text-white flex items-center gap-3">
            <ShieldAlert className="h-6 w-6" />
            Delete Account
          </h2>
        </div>

        {/* Content */}
        <ScrollArea className="flex-1">
        <div className="p-6 space-y-5">
          {/* Warning Description */}
          <p className="text-sm text-muted-foreground">
            This action is permanent and cannot be reversed. Please carefully review what will be
            deleted before proceeding.
          </p>

          {/* What Gets Deleted */}
          <Card className="bg-gradient-to-r from-teal-50 to-cyan-50 border-teal-200">
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="h-5 w-5 text-teal-600" />
                <p className="font-bold text-teal-800">
                  The following data will be permanently deleted:
                </p>
              </div>
              <ul className="space-y-1.5 text-sm text-teal-700">
                {DELETION_ITEMS.map((item, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-teal-400 mt-1">-</span>
                    {item}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Error Message */}
          {error && (
            <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-3 text-destructive text-sm flex items-center gap-2">
              <XCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          {/* Deletion Progress */}
          {deletionProgress && (
            <div className="bg-muted rounded-lg p-3 text-sm flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin shrink-0" />
              {deletionProgress}
            </div>
          )}

          {/* Verification Form */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* Email Confirmation */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bold text-foreground">
                      Confirm your email address
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        inputMode="email"
                        placeholder="Type your email to confirm"
                        disabled={isDeleting}
                        autoComplete="off"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Password */}
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bold text-foreground">
                      Enter your password
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Type your password to confirm"
                        disabled={isDeleting}
                        autoComplete="new-password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Type DELETE */}
              <FormField
                control={form.control}
                name="confirmText"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bold text-foreground">
                      Type <span className="font-mono text-destructive">DELETE</span> to confirm
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        placeholder="Type DELETE"
                        disabled={isDeleting}
                        autoComplete="off"
                        className="font-mono uppercase"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Confirmation Checkbox */}
              <FormField
                control={form.control}
                name="understood"
                render={({ field }) => (
                  <FormItem>
                    <Card className="bg-muted/30">
                      <CardContent className="pt-4">
                        <div className="flex items-start gap-3">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              disabled={isDeleting}
                              className="mt-0.5"
                            />
                          </FormControl>
                          <FormLabel className="!mt-0 font-semibold text-sm leading-relaxed cursor-pointer">
                            I understand this action is permanent and cannot be undone. All my data
                            will be permanently deleted.
                          </FormLabel>
                        </div>
                        <FormMessage className="mt-2" />
                      </CardContent>
                    </Card>
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </div>
      </ScrollArea>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t bg-muted/30 shrink-0">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isDeleting}
            className="border-teal-300 text-teal-700 hover:bg-teal-50"
          >
            Cancel
          </Button>
          <Button
            onClick={form.handleSubmit(onSubmit)}
            disabled={!isFormValid || isDeleting}
            className={cn(
              'bg-gradient-to-r',
              isFormValid && !isDeleting
                ? 'from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800'
                : 'from-gray-300 to-gray-400 cursor-not-allowed'
            )}
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              'Delete Account'
            )}
          </Button>
        </div>
      </div>
    </ResponsiveModal>
  )
}

export default DeleteAccountModal
