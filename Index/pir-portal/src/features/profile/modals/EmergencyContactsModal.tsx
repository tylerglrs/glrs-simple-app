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
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import {
  Users,
  UserCheck,
  Phone,
  Plus,
  Edit3,
  Trash2,
  Star,
  X,
  Loader2,
  UserPlus,
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { useStatusBarColor } from '@/hooks/useStatusBarColor'

// =============================================================================
// TYPES
// =============================================================================

interface EmergencyContact {
  name: string
  phone: string
  relationship?: string
  isPrimary?: boolean
}

// =============================================================================
// VALIDATION SCHEMA
// =============================================================================

const emergencyContactSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(100, 'Name must be less than 100 characters'),
  phone: z
    .string()
    .min(1, 'Phone number is required')
    .regex(/^[\d\s\-()]+$/, 'Invalid phone number format'),
  relationship: z.string().optional(),
  isPrimary: z.boolean(),
})

type EmergencyContactFormValues = z.infer<typeof emergencyContactSchema>

// =============================================================================
// OPTIONS
// =============================================================================

const RELATIONSHIP_OPTIONS = [
  { value: 'spouse', label: 'Spouse/Partner' },
  { value: 'parent', label: 'Parent' },
  { value: 'sibling', label: 'Sibling' },
  { value: 'child', label: 'Child' },
  { value: 'friend', label: 'Friend' },
  { value: 'therapist', label: 'Therapist' },
  { value: 'sponsor', label: 'Sponsor' },
  { value: 'other', label: 'Other' },
]

// =============================================================================
// COMPONENT
// =============================================================================

interface EmergencyContactsModalProps {
  onClose: () => void
}

export function EmergencyContactsModal({ onClose }: EmergencyContactsModalProps) {
  const { user, userData } = useAuth()
  const { toast } = useToast()

  // Set iOS status bar to match modal header color (violet-600)
  useStatusBarColor('#7C3AED', true)

  // Get extended user data
  const extendedUserData = userData as unknown as Record<string, unknown> | null

  // State
  const [contacts, setContacts] = useState<EmergencyContact[]>([])
  const [isAdding, setIsAdding] = useState(false)
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null)

  // Initialize contacts from userData
  useEffect(() => {
    const existingContacts = (extendedUserData?.emergencyContacts as EmergencyContact[]) || []
    setContacts(existingContacts)
  }, [extendedUserData?.emergencyContacts])

  // Form for adding/editing contacts
  const form = useForm<EmergencyContactFormValues>({
    resolver: zodResolver(emergencyContactSchema),
    defaultValues: {
      name: '',
      phone: '',
      relationship: '',
      isPrimary: false,
    },
  })

  // Reset form when adding new contact
  const handleAddNew = () => {
    form.reset({
      name: '',
      phone: '',
      relationship: '',
      isPrimary: false,
    })
    setEditingIndex(null)
    setIsAdding(true)
  }

  // Start editing existing contact
  const handleEdit = (index: number) => {
    const contact = contacts[index]
    form.reset({
      name: contact.name,
      phone: contact.phone,
      relationship: contact.relationship || '',
      isPrimary: contact.isPrimary || false,
    })
    setEditingIndex(index)
    setIsAdding(true)
  }

  // Cancel add/edit
  const handleCancel = () => {
    form.reset()
    setIsAdding(false)
    setEditingIndex(null)
  }

  // Submit contact (add or update)
  const onSubmitContact = (values: EmergencyContactFormValues) => {
    const newContact: EmergencyContact = {
      name: values.name,
      phone: values.phone,
      relationship: values.relationship,
      isPrimary: values.isPrimary,
    }

    let updatedContacts: EmergencyContact[]

    if (editingIndex !== null) {
      // Update existing
      updatedContacts = contacts.map((contact, idx) => {
        if (idx === editingIndex) {
          return newContact
        }
        // If setting new primary, remove primary from others
        if (values.isPrimary && contact.isPrimary) {
          return { ...contact, isPrimary: false }
        }
        return contact
      })
    } else {
      // Add new - if setting as primary, remove primary from others
      if (values.isPrimary) {
        updatedContacts = contacts.map((c) => ({ ...c, isPrimary: false }))
        updatedContacts.push(newContact)
      } else {
        updatedContacts = [...contacts, newContact]
      }
    }

    setContacts(updatedContacts)
    handleCancel()
  }

  // Delete contact
  const handleDelete = (index: number) => {
    const updatedContacts = contacts.filter((_, idx) => idx !== index)
    setContacts(updatedContacts)
    setDeleteIndex(null)
  }

  // Save all contacts to Firestore
  const handleSaveAll = async () => {
    if (!user?.uid) {
      toast({
        title: 'Error',
        description: 'You must be logged in to update contacts.',
        variant: 'destructive',
      })
      return
    }

    setIsSaving(true)

    try {
      await updateDoc(doc(db, 'users', user.uid), {
        emergencyContacts: contacts,
        updatedAt: serverTimestamp(),
      })

      // Update AI context with emergency contacts count
      await updateContextAfterProfileUpdate(user.uid, {})

      toast({
        title: 'Success',
        description: 'Emergency contacts updated successfully.',
      })

      onClose()
    } catch (error) {
      console.error('[EmergencyContactsModal] Error saving contacts:', error)
      toast({
        title: 'Error',
        description: 'Failed to save emergency contacts. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsSaving(false)
    }
  }

  // Get coach info
  const assignedCoach = extendedUserData?.assignedCoach as string | undefined
  const assignedCoachName = extendedUserData?.assignedCoachName as string | undefined

  return (
    <ResponsiveModal open={true} onOpenChange={(open) => !open && onClose()} desktopSize="lg">
      <div className="flex flex-col h-full bg-white overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-violet-600 to-purple-600 shrink-0">
          <h2 className="text-xl font-bold text-white flex items-center gap-3">
            <Users className="h-6 w-6" />
            Emergency Contacts
          </h2>
        </div>

        {/* Content */}
        <ScrollArea className="flex-1">
        <div className="p-6 space-y-6">
          {/* Assigned Coach Card (Read-Only) */}
          {assignedCoach && (
            <Card className="bg-teal-50 border-teal-200">
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 mb-2">
                  <UserCheck className="h-5 w-5 text-teal-600" />
                  <span className="text-sm font-semibold text-teal-600">Assigned Coach</span>
                </div>
                <div className="text-base font-semibold text-gray-900">
                  {assignedCoachName || 'Your Coach'}
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  Always available for support
                </div>
              </CardContent>
            </Card>
          )}

          {/* Contact Form (Add/Edit) */}
          {isAdding ? (
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">
                    {editingIndex !== null ? 'Edit Contact' : 'Add Contact'}
                  </h3>
                  <Button variant="ghost" size="icon" onClick={handleCancel}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmitContact)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Name <span className="text-destructive">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="Contact name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Phone <span className="text-destructive">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="(555) 123-4567" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="relationship"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Relationship</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select relationship" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {RELATIONSHIP_OPTIONS.map((option) => (
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
                      name="isPrimary"
                      render={({ field }) => (
                        <FormItem className="flex items-center gap-2">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <FormLabel className="!mt-0 cursor-pointer">
                            Set as primary contact
                          </FormLabel>
                        </FormItem>
                      )}
                    />

                    <div className="flex justify-end gap-2 pt-2">
                      <Button type="button" variant="outline" onClick={handleCancel}>
                        Cancel
                      </Button>
                      <Button type="submit">
                        {editingIndex !== null ? 'Update' : 'Add'} Contact
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          ) : (
            /* Contact List */
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">Your Emergency Contacts</h3>
                {contacts.length < 3 && (
                  <Button size="sm" onClick={handleAddNew} className="bg-violet-600 hover:bg-violet-700">
                    <Plus className="h-4 w-4 mr-1" />
                    Add Contact
                  </Button>
                )}
              </div>

              {contacts.length === 0 ? (
                <Card className="border-dashed">
                  <CardContent className="flex flex-col items-center justify-center py-8 text-center">
                    <UserPlus className="h-12 w-12 text-gray-300 mb-4" />
                    <p className="text-gray-500">No emergency contacts added yet</p>
                    <p className="text-sm text-gray-400 mt-1">
                      Add someone you trust to contact in case of emergency
                    </p>
                    <Button size="sm" className="mt-4" onClick={handleAddNew}>
                      <Plus className="h-4 w-4 mr-1" />
                      Add Your First Contact
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {contacts.map((contact, index) => (
                    <Card key={index} className="relative">
                      <CardContent className="pt-4">
                        {contact.isPrimary && (
                          <Badge
                            variant="secondary"
                            className="absolute top-2 right-2 bg-amber-100 text-amber-800"
                          >
                            <Star className="h-3 w-3 mr-1" />
                            Primary
                          </Badge>
                        )}

                        <div className="pr-20">
                          <div className="font-semibold text-gray-900">{contact.name}</div>
                          <div className="flex items-center gap-1.5 text-sm text-gray-500 mt-1">
                            <Phone className="h-3.5 w-3.5" />
                            {contact.phone}
                          </div>
                          {contact.relationship && (
                            <div className="flex items-center gap-1.5 text-sm text-gray-500 mt-1">
                              <Users className="h-3.5 w-3.5" />
                              {RELATIONSHIP_OPTIONS.find((r) => r.value === contact.relationship)?.label ||
                                contact.relationship}
                            </div>
                          )}
                        </div>

                        <div className="flex gap-2 mt-3 pt-3 border-t">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => handleEdit(index)}
                          >
                            <Edit3 className="h-3.5 w-3.5 mr-1" />
                            Edit
                          </Button>

                          <AlertDialog
                            open={deleteIndex === index}
                            onOpenChange={(open) => !open && setDeleteIndex(null)}
                          >
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex-1 text-destructive hover:text-destructive"
                                onClick={() => setDeleteIndex(index)}
                              >
                                <Trash2 className="h-3.5 w-3.5 mr-1" />
                                Delete
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Contact</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete {contact.name} from your emergency
                                  contacts? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  className="bg-destructive hover:bg-destructive/90"
                                  onClick={() => handleDelete(index)}
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {contacts.length >= 3 && (
                <p className="text-sm text-muted-foreground text-center">
                  Maximum of 3 emergency contacts allowed.
                </p>
              )}
            </div>
          )}
        </div>
      </ScrollArea>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t bg-muted/30 shrink-0">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button
            onClick={handleSaveAll}
            disabled={isSaving || isAdding}
            className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700"
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

export default EmergencyContactsModal
