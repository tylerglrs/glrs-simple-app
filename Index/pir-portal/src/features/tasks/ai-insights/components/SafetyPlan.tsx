/**
 * SafetyPlan.tsx
 * Phase 8D-3: User-Facing Safety Plan Component
 *
 * Displays and allows editing of the user's personal safety plan.
 * Data persisted to Firestore at users/{userId}/safetyPlan.
 * Can be opened from CrisisModal or Profile settings.
 */

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Shield,
  Phone,
  Users,
  Heart,
  MapPin,
  AlertTriangle,
  X,
  Save,
  Edit2,
  Plus,
  Trash2,
  Check,
  Loader2
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { haptics } from '@/lib/animations'
import { db, auth } from '@/lib/firebase'
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { updateContextAfterSafetyPlanUpdate } from '@/lib/updateAIContext'

interface SafetyPlanData {
  warningSignals: string[]
  copingStrategies: string[]
  reasonsToLive: string[]
  supportContacts: SupportContact[]
  professionalContacts: ProfessionalContact[]
  safeEnvironment: string[]
  lastUpdated?: Date
}

interface SupportContact {
  id: string
  name: string
  phone: string
  relationship: string
}

interface ProfessionalContact {
  id: string
  name: string
  phone: string
  type: string // therapist, psychiatrist, counselor, etc.
}

interface SafetyPlanProps {
  isOpen: boolean
  onClose: () => void
  readOnly?: boolean
}

const generateId = () => Math.random().toString(36).substring(2, 9)

const defaultSafetyPlan: SafetyPlanData = {
  warningSignals: [],
  copingStrategies: [],
  reasonsToLive: [],
  supportContacts: [],
  professionalContacts: [],
  safeEnvironment: []
}

// Editable list component
interface EditableListProps {
  title: string
  icon: React.ReactNode
  items: string[]
  placeholder: string
  onUpdate: (items: string[]) => void
  color: string
  isEditing: boolean
}

const EditableList = ({
  title,
  icon,
  items,
  placeholder,
  onUpdate,
  color,
  isEditing
}: EditableListProps) => {
  const [newItem, setNewItem] = useState('')

  const addItem = () => {
    if (newItem.trim()) {
      onUpdate([...items, newItem.trim()])
      setNewItem('')
      haptics.tap()
    }
  }

  const removeItem = (index: number) => {
    onUpdate(items.filter((_, i) => i !== index))
    haptics.tap()
  }

  return (
    <div className={cn('p-3 md:p-4 rounded-xl border', color)}>
      <div className="flex items-center gap-2 mb-3">
        {icon}
        <h3 className="font-semibold text-gray-800">{title}</h3>
      </div>

      {items.length === 0 && !isEditing ? (
        <p className="text-sm text-gray-400 italic">No items added yet</p>
      ) : (
        <ul className="space-y-2">
          {items.map((item, index) => (
            <li key={index} className="flex items-center gap-2 text-sm">
              <Check className="w-4 h-4 text-teal-500 flex-shrink-0" />
              <span className="flex-1 text-gray-700">{item}</span>
              {isEditing && (
                <button
                  onClick={() => removeItem(index)}
                  className="p-1 hover:bg-red-100 rounded text-red-500 transition-colors"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      {isEditing && (
        <div className="flex gap-2 mt-3">
          <input
            type="text"
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addItem()}
            placeholder={placeholder}
            className={cn(
              'flex-1 px-3 py-2 text-sm rounded-lg',
              'border border-gray-200 focus:border-teal-400',
              'focus:outline-none focus:ring-2 focus:ring-teal-100'
            )}
          />
          <button
            onClick={addItem}
            disabled={!newItem.trim()}
            className={cn(
              'p-2 rounded-lg bg-teal-500 text-white',
              'hover:bg-teal-600 disabled:opacity-50',
              'transition-colors'
            )}
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  )
}

// Contact list component
interface ContactListProps {
  title: string
  icon: React.ReactNode
  contacts: (SupportContact | ProfessionalContact)[]
  onUpdate: (contacts: (SupportContact | ProfessionalContact)[]) => void
  color: string
  isEditing: boolean
  contactType: 'support' | 'professional'
}

const ContactList = ({
  title,
  icon,
  contacts,
  onUpdate,
  color,
  isEditing,
  contactType
}: ContactListProps) => {
  const [showAddForm, setShowAddForm] = useState(false)
  const [newContact, setNewContact] = useState({
    name: '',
    phone: '',
    relationship: '',
    type: ''
  })

  const addContact = () => {
    if (newContact.name && newContact.phone) {
      const contact = {
        id: generateId(),
        name: newContact.name,
        phone: newContact.phone,
        ...(contactType === 'support'
          ? { relationship: newContact.relationship }
          : { type: newContact.type })
      }
      onUpdate([...contacts, contact as SupportContact | ProfessionalContact])
      setNewContact({ name: '', phone: '', relationship: '', type: '' })
      setShowAddForm(false)
      haptics.tap()
    }
  }

  const removeContact = (id: string) => {
    onUpdate(contacts.filter((c) => c.id !== id))
    haptics.tap()
  }

  return (
    <div className={cn('p-3 md:p-4 rounded-xl border', color)}>
      <div className="flex items-center gap-2 mb-3">
        {icon}
        <h3 className="font-semibold text-gray-800">{title}</h3>
      </div>

      {contacts.length === 0 && !isEditing ? (
        <p className="text-sm text-gray-400 italic">No contacts added yet</p>
      ) : (
        <div className="space-y-2">
          {contacts.map((contact) => (
            <div
              key={contact.id}
              className="flex items-center gap-3 p-2 bg-white/60 rounded-lg"
            >
              <div className="flex-1">
                <p className="font-medium text-sm text-gray-800">{contact.name}</p>
                <p className="text-xs text-gray-500">
                  {('relationship' in contact ? contact.relationship : contact.type)} - {contact.phone}
                </p>
              </div>
              <a
                href={`tel:${contact.phone}`}
                className="p-3 bg-teal-100 rounded-lg text-teal-600 hover:bg-teal-200 transition-colors min-h-[48px] min-w-[48px] flex items-center justify-center"
                onClick={() => haptics.select()}
              >
                <Phone className="w-5 h-5" />
              </a>
              {isEditing && (
                <button
                  onClick={() => removeContact(contact.id)}
                  className="p-2 hover:bg-red-100 rounded-lg text-red-500 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {isEditing && (
        <>
          {showAddForm ? (
            <div className="mt-3 p-3 bg-white/60 rounded-lg space-y-2">
              <input
                type="text"
                value={newContact.name}
                onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                placeholder="Name"
                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:border-teal-400 focus:outline-none"
              />
              <input
                type="tel"
                value={newContact.phone}
                onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                placeholder="Phone number"
                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:border-teal-400 focus:outline-none"
              />
              <input
                type="text"
                value={contactType === 'support' ? newContact.relationship : newContact.type}
                onChange={(e) =>
                  setNewContact({
                    ...newContact,
                    [contactType === 'support' ? 'relationship' : 'type']: e.target.value
                  })
                }
                placeholder={contactType === 'support' ? 'Relationship (e.g., Friend, Family)' : 'Type (e.g., Therapist, Counselor)'}
                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:border-teal-400 focus:outline-none"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={addContact}
                  disabled={!newContact.name || !newContact.phone}
                  className="flex-1 py-2 text-sm bg-teal-500 text-white rounded-lg hover:bg-teal-600 disabled:opacity-50 transition-colors"
                >
                  Add
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowAddForm(true)}
              className="w-full mt-3 py-2 text-sm text-teal-600 hover:bg-teal-50 rounded-lg flex items-center justify-center gap-1 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Contact
            </button>
          )}
        </>
      )}
    </div>
  )
}

export function SafetyPlan({ isOpen, onClose, readOnly = false }: SafetyPlanProps) {
  const [safetyPlan, setSafetyPlan] = useState<SafetyPlanData>(defaultSafetyPlan)
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load safety plan from Firestore
  useEffect(() => {
    const loadSafetyPlan = async () => {
      if (!isOpen) return

      const user = auth.currentUser
      if (!user) {
        setError('Please sign in to view your safety plan')
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        const docRef = doc(db, 'users', user.uid, 'safetyPlan', 'current')
        const docSnap = await getDoc(docRef)

        if (docSnap.exists()) {
          setSafetyPlan(docSnap.data() as SafetyPlanData)
        } else {
          setSafetyPlan(defaultSafetyPlan)
        }
        setError(null)
      } catch (err) {
        console.error('[SafetyPlan] Error loading:', err)
        setError('Failed to load safety plan')
      } finally {
        setIsLoading(false)
      }
    }

    loadSafetyPlan()
  }, [isOpen])

  // Save safety plan to Firestore
  const saveSafetyPlan = async () => {
    const user = auth.currentUser
    if (!user) {
      setError('Please sign in to save your safety plan')
      return
    }

    try {
      setIsSaving(true)
      const docRef = doc(db, 'users', user.uid, 'safetyPlan', 'current')
      await setDoc(docRef, {
        ...safetyPlan,
        lastUpdated: serverTimestamp()
      })

      // Update AI context
      await updateContextAfterSafetyPlanUpdate(user.uid)

      setIsEditing(false)
      haptics.success()
      console.log('[SafetyPlan] Saved successfully')
    } catch (err) {
      console.error('[SafetyPlan] Error saving:', err)
      setError('Failed to save safety plan')
    } finally {
      setIsSaving(false)
    }
  }

  const handleClose = () => {
    if (isEditing) {
      // Prompt to save changes
      if (confirm('You have unsaved changes. Save before closing?')) {
        saveSafetyPlan().then(onClose)
      } else {
        setIsEditing(false)
        onClose()
      }
    } else {
      onClose()
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={cn(
              'relative w-full max-w-lg bg-gray-50 rounded-2xl shadow-2xl overflow-hidden',
              'max-h-[90vh] flex flex-col'
            )}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-teal-600 to-teal-500 p-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">My Safety Plan</h2>
                  <p className="text-white/80 text-sm">Personal crisis resources</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {!readOnly && (
                  isEditing ? (
                    <button
                      onClick={saveSafetyPlan}
                      disabled={isSaving}
                      className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
                    >
                      {isSaving ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <Save className="w-5 h-5" />
                      )}
                    </button>
                  ) : (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
                    >
                      <Edit2 className="w-5 h-5" />
                    </button>
                  )
                )}
                <button
                  onClick={handleClose}
                  className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-3 md:space-y-4">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-teal-500" />
                </div>
              ) : error ? (
                <div className="text-center py-12">
                  <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-3" />
                  <p className="text-gray-600">{error}</p>
                </div>
              ) : (
                <>
                  {/* Warning Signals */}
                  <EditableList
                    title="Warning Signs"
                    icon={<AlertTriangle className="w-5 h-5 text-orange-500" />}
                    items={safetyPlan.warningSignals}
                    placeholder="Add a warning sign..."
                    onUpdate={(items) =>
                      setSafetyPlan({ ...safetyPlan, warningSignals: items })
                    }
                    color="bg-orange-50 border-orange-200"
                    isEditing={isEditing}
                  />

                  {/* Coping Strategies */}
                  <EditableList
                    title="Coping Strategies"
                    icon={<Heart className="w-5 h-5 text-pink-500" />}
                    items={safetyPlan.copingStrategies}
                    placeholder="Add a coping strategy..."
                    onUpdate={(items) =>
                      setSafetyPlan({ ...safetyPlan, copingStrategies: items })
                    }
                    color="bg-pink-50 border-pink-200"
                    isEditing={isEditing}
                  />

                  {/* Reasons to Live */}
                  <EditableList
                    title="Reasons to Live"
                    icon={<Heart className="w-5 h-5 text-red-500" />}
                    items={safetyPlan.reasonsToLive}
                    placeholder="Add a reason..."
                    onUpdate={(items) =>
                      setSafetyPlan({ ...safetyPlan, reasonsToLive: items })
                    }
                    color="bg-red-50 border-red-200"
                    isEditing={isEditing}
                  />

                  {/* Support Contacts */}
                  <ContactList
                    title="People I Can Contact"
                    icon={<Users className="w-5 h-5 text-blue-500" />}
                    contacts={safetyPlan.supportContacts}
                    onUpdate={(contacts) =>
                      setSafetyPlan({
                        ...safetyPlan,
                        supportContacts: contacts as SupportContact[]
                      })
                    }
                    color="bg-blue-50 border-blue-200"
                    isEditing={isEditing}
                    contactType="support"
                  />

                  {/* Professional Contacts */}
                  <ContactList
                    title="Professional Support"
                    icon={<Phone className="w-5 h-5 text-purple-500" />}
                    contacts={safetyPlan.professionalContacts}
                    onUpdate={(contacts) =>
                      setSafetyPlan({
                        ...safetyPlan,
                        professionalContacts: contacts as ProfessionalContact[]
                      })
                    }
                    color="bg-purple-50 border-purple-200"
                    isEditing={isEditing}
                    contactType="professional"
                  />

                  {/* Safe Environment */}
                  <EditableList
                    title="Making My Environment Safe"
                    icon={<MapPin className="w-5 h-5 text-green-500" />}
                    items={safetyPlan.safeEnvironment}
                    placeholder="Add a safety step..."
                    onUpdate={(items) =>
                      setSafetyPlan({ ...safetyPlan, safeEnvironment: items })
                    }
                    color="bg-green-50 border-green-200"
                    isEditing={isEditing}
                  />
                </>
              )}
            </div>

            {/* Footer */}
            <div className="p-3 md:p-4 border-t border-gray-200 bg-white">
              <p className="text-xs text-gray-500 text-center">
                Your safety plan is private and only visible to you and your care team.
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default SafetyPlan
