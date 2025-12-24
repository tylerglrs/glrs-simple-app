import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  Check,
  ChevronRight,
  ChevronDown,
  Flower2,
  Users,
  BookOpen,
  Clock,
  Compass,
  Heart,
  Target,
  Edit2,
  Save,
  Award,
} from 'lucide-react'
import { doc, onSnapshot, setDoc, serverTimestamp, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ResponsiveModal } from '@/components/ui/responsive-modal'
import { cn } from '@/lib/utils'
import { Illustration } from '@/components/common/Illustration'
import { useStatusBarColor } from '@/hooks/useStatusBarColor'
import {
  DHARMA_ELEMENTS,
  EIGHTFOLD_PATH,
  type RecoveryDharmaProgress,
} from '../types/recovery'

interface RecoveryDharmaModalProps {
  isOpen: boolean
  onClose: () => void
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 400, damping: 25 } },
}

export function RecoveryDharmaModal({ isOpen, onClose }: RecoveryDharmaModalProps) {
  const { user, userData } = useAuth()
  const [loading, setLoading] = useState(true)

  // Set iOS status bar to match modal header color (orange-600)
  useStatusBarColor('#EA580C', isOpen)
  const [saving, setSaving] = useState(false)
  const [expandedElement, setExpandedElement] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'elements' | 'path' | 'meditation' | 'sangha'>('elements')

  const [progress, setProgress] = useState<Partial<RecoveryDharmaProgress>>({
    elementsProgress: {},
    eightfoldPathProgress: {},
    meditationMinutesWeekly: 0,
    meditationStreak: 0,
    inquiryCompleted: false,
  })

  const [editingNote, setEditingNote] = useState<string | null>(null)
  const [noteText, setNoteText] = useState('')

  // Real-time listener for dharma progress - merges with user profile mentor info
  useEffect(() => {
    if (!isOpen || !user) return

    setLoading(true)
    const docRef = doc(db, 'recoveryDharmaProgress', user.uid)

    const unsubscribe = onSnapshot(
      docRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data() as RecoveryDharmaProgress
          // Merge with mentor info from user profile (user profile is source of truth)
          setProgress({
            ...data,
            mentorName: userData?.mentorName || data.mentorName || '',
            mentorPhone: userData?.mentorPhone || data.mentorPhone || '',
          })
        } else {
          // No progress doc yet - use mentor info from user profile
          setProgress(prev => ({
            ...prev,
            mentorName: userData?.mentorName || '',
            mentorPhone: userData?.mentorPhone || '',
          }))
        }
        setLoading(false)
      },
      (error) => {
        console.error('Error listening to dharma progress:', error)
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [isOpen, user, userData?.mentorName, userData?.mentorPhone])

  const saveProgress = async (updates: Partial<RecoveryDharmaProgress>) => {
    if (!user) return
    setSaving(true)
    try {
      const docRef = doc(db, 'recoveryDharmaProgress', user.uid)

      // Update local state without the timestamp
      const localProgress = {
        ...progress,
        ...updates,
        userId: user.uid,
      }
      setProgress(localProgress)

      // Write to Firestore with the timestamp
      await setDoc(docRef, { ...localProgress, updatedAt: serverTimestamp() }, { merge: true })

      // If mentor name or phone changed, sync to user profile
      if (updates.mentorName !== undefined || updates.mentorPhone !== undefined) {
        const userDocRef = doc(db, 'users', user.uid)
        const userUpdates: any = {}
        if (updates.mentorName !== undefined) userUpdates.mentorName = updates.mentorName
        if (updates.mentorPhone !== undefined) userUpdates.mentorPhone = updates.mentorPhone

        await setDoc(userDocRef, userUpdates, { merge: true })
      }
    } catch (error) {
      console.error('Error saving progress:', error)
    } finally {
      setSaving(false)
    }
  }

  const toggleElementComplete = async (elementId: string) => {
    const current = progress.elementsProgress?.[elementId] || { completed: false, notes: '' }
    await saveProgress({
      elementsProgress: {
        ...progress.elementsProgress,
        [elementId]: { ...current, completed: !current.completed }
      }
    })
  }

  const togglePathPracticing = async (pathId: string) => {
    const current = progress.eightfoldPathProgress?.[pathId] || { practicing: false, notes: '' }
    await saveProgress({
      eightfoldPathProgress: {
        ...progress.eightfoldPathProgress,
        [pathId]: { ...current, practicing: !current.practicing }
      }
    })
  }

  const saveElementNote = async (elementId: string) => {
    const current = progress.elementsProgress?.[elementId] || { completed: false, notes: '' }
    await saveProgress({
      elementsProgress: {
        ...progress.elementsProgress,
        [elementId]: { ...current, notes: noteText }
      }
    })
    setEditingNote(null)
    setNoteText('')
  }

  const logMeditation = async (minutes: number) => {
    const newTotal = (progress.meditationMinutesWeekly || 0) + minutes
    await saveProgress({
      meditationMinutesWeekly: newTotal,
      meditationStreak: (progress.meditationStreak || 0) + 1
    })
  }

  const completedElements = Object.values(progress.elementsProgress || {}).filter(e => e.completed).length
  const practicingPaths = Object.values(progress.eightfoldPathProgress || {}).filter(p => p.practicing).length

  return (
    <ResponsiveModal
      open={isOpen}
      onOpenChange={(open) => !open && onClose()}
      desktopSize="lg"
    >
      <div className="flex flex-col h-full bg-white">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-gradient-to-r from-orange-600 via-orange-500 to-amber-600 text-white p-4 flex-shrink-0 relative overflow-hidden"
        >
          {/* Decorative illustration */}
          <div className="absolute right-0 top-1/2 -translate-y-1/2 opacity-15 pointer-events-none">
            <Illustration name="wellness" size="md" />
          </div>
          <div className="flex items-center justify-between relative z-10">
            <div>
              <h2 className="text-xl font-bold">Recovery Dharma</h2>
              <p className="text-orange-100 text-sm">Buddhist-inspired addiction recovery</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Progress indicators */}
          <div className="mt-4 grid grid-cols-3 gap-4">
            <motion.div
              variants={itemVariants}
              className="text-center"
            >
              <div className="text-2xl font-bold">{completedElements}/6</div>
              <div className="text-orange-200 text-xs">Elements</div>
            </motion.div>
            <motion.div
              variants={itemVariants}
              className="text-center"
            >
              <div className="text-2xl font-bold">{practicingPaths}/8</div>
              <div className="text-orange-200 text-xs">Path Practices</div>
            </motion.div>
            <motion.div
              variants={itemVariants}
              className="text-center"
            >
              <div className="text-2xl font-bold">{progress.meditationStreak || 0}</div>
              <div className="text-orange-200 text-xs">Day Streak</div>
            </motion.div>
          </div>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="flex border-b flex-shrink-0"
        >
          {[
            { id: 'elements', label: 'Six Elements', icon: Flower2 },
            { id: 'path', label: 'Eightfold Path', icon: Compass },
            { id: 'meditation', label: 'Meditation', icon: Clock },
            { id: 'sangha', label: 'Sangha', icon: Users },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors",
                activeTab === tab.id
                  ? 'text-orange-600 border-b-2 border-orange-600'
                  : 'text-gray-500 hover:text-gray-700'
              )}
            >
              <tab.icon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </motion.div>

        {/* Content */}
        <ScrollArea className="flex-1">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-orange-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {/* Six Elements Tab */}
              {activeTab === 'elements' && (
                <div className="p-4 space-y-3">
                  <motion.p
                    variants={itemVariants}
                    className="text-gray-600 text-sm mb-4"
                  >
                    Recovery Dharma is built on six interconnected elements that support lasting recovery.
                  </motion.p>

                  {DHARMA_ELEMENTS.map(element => {
                    const elementProgress = progress.elementsProgress?.[element.id] || { completed: false, notes: '' }
                    const isExpanded = expandedElement === element.id

                    return (
                      <motion.div
                        key={element.id}
                        variants={itemVariants}
                        className={cn(
                          "border rounded-lg overflow-hidden",
                          elementProgress.completed
                            ? 'border-green-200 bg-green-50'
                            : 'border-gray-200'
                        )}
                      >
                        <button
                          onClick={() => setExpandedElement(isExpanded ? null : element.id)}
                          className="w-full flex items-center gap-3 p-3 text-left"
                        >
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              toggleElementComplete(element.id)
                            }}
                            className={cn(
                              "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                              elementProgress.completed
                                ? 'bg-green-500 text-white'
                                : 'bg-orange-100 text-orange-600'
                            )}
                          >
                            {elementProgress.completed ? (
                              <Check className="w-5 h-5" />
                            ) : (
                              <Flower2 className="w-4 h-4" />
                            )}
                          </button>
                          <div className="flex-1">
                            <h4 className="font-medium">{element.name}</h4>
                            <p className="text-sm text-gray-500">{element.description}</p>
                          </div>
                          {isExpanded ? (
                            <ChevronDown className="w-5 h-5 text-gray-400" />
                          ) : (
                            <ChevronRight className="w-5 h-5 text-gray-400" />
                          )}
                        </button>

                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden"
                            >
                              <div className="px-4 pb-4 border-t bg-white">
                                <div className="mt-3">
                                  <h5 className="text-sm font-medium mb-2">Practices</h5>
                                  <ul className="space-y-1">
                                    {element.practices.map((practice, idx) => (
                                      <li key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                                        <div className="w-1.5 h-1.5 rounded-full bg-orange-400" />
                                        {practice}
                                      </li>
                                    ))}
                                  </ul>
                                </div>

                                {/* Notes */}
                                <div className="mt-4">
                                  <div className="flex items-center justify-between mb-2">
                                    <Label className="text-sm font-medium">Your Reflections</Label>
                                    {editingNote !== element.id && (
                                      <button
                                        onClick={() => {
                                          setEditingNote(element.id)
                                          setNoteText(elementProgress.notes || '')
                                        }}
                                        className="text-orange-600 text-sm flex items-center gap-1"
                                      >
                                        <Edit2 className="w-3 h-3" />
                                        Edit
                                      </button>
                                    )}
                                  </div>

                                  {editingNote === element.id ? (
                                    <div className="space-y-2">
                                      <Textarea
                                        value={noteText}
                                        onChange={(e) => setNoteText(e.target.value)}
                                        placeholder="Your thoughts on this element..."
                                        rows={3}
                                      />
                                      <div className="flex gap-2">
                                        <Button
                                          size="sm"
                                          onClick={() => saveElementNote(element.id)}
                                          disabled={saving}
                                        >
                                          <Save className="w-3 h-3 mr-1" />
                                          Save
                                        </Button>
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() => {
                                            setEditingNote(null)
                                            setNoteText('')
                                          }}
                                        >
                                          Cancel
                                        </Button>
                                      </div>
                                    </div>
                                  ) : (
                                    <p className="text-sm text-gray-600 bg-gray-50 rounded p-2 min-h-[40px]">
                                      {elementProgress.notes || 'No notes yet.'}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    )
                  })}
                </div>
              )}

              {/* Eightfold Path Tab */}
              {activeTab === 'path' && (
                <div className="p-4">
                  <motion.p
                    variants={itemVariants}
                    className="text-gray-600 text-sm mb-4"
                  >
                    The Noble Eightfold Path is the Buddha's practical guide to ethical living and mental development.
                  </motion.p>

                  {['Wisdom', 'Ethics', 'Concentration'].map(category => (
                    <motion.div
                      key={category}
                      variants={itemVariants}
                      className="mb-6"
                    >
                      <h4 className="font-medium text-orange-700 mb-3 flex items-center gap-2">
                        {category === 'Wisdom' && <BookOpen className="w-4 h-4" />}
                        {category === 'Ethics' && <Heart className="w-4 h-4" />}
                        {category === 'Concentration' && <Target className="w-4 h-4" />}
                        {category}
                      </h4>
                      <div className="space-y-2">
                        {EIGHTFOLD_PATH.filter(p => p.category === category).map(path => {
                          const pathProgress = progress.eightfoldPathProgress?.[path.id] || { practicing: false, notes: '' }
                          return (
                            <div
                              key={path.id}
                              className={cn(
                                "flex items-center justify-between p-3 rounded-lg border",
                                pathProgress.practicing
                                  ? 'border-green-200 bg-green-50'
                                  : 'border-gray-200'
                              )}
                            >
                              <span className="font-medium">{path.name}</span>
                              <button
                                onClick={() => togglePathPracticing(path.id)}
                                className={cn(
                                  "px-3 py-1 rounded-full text-sm font-medium transition-colors",
                                  pathProgress.practicing
                                    ? 'bg-green-500 text-white'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                )}
                              >
                                {pathProgress.practicing ? 'Practicing' : 'Start'}
                              </button>
                            </div>
                          )
                        })}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Meditation Tab */}
              {activeTab === 'meditation' && (
                <div className="p-4 space-y-6">
                  <motion.div
                    variants={itemVariants}
                    className="text-center p-6 bg-gradient-to-br from-orange-50 to-amber-50 rounded-lg"
                  >
                    <Clock className="w-16 h-16 text-orange-600 mx-auto mb-3" />
                    <h3 className="font-semibold text-lg mb-2">Meditation Practice</h3>
                    <p className="text-gray-600 text-sm">
                      Meditation is at the heart of Recovery Dharma, helping develop awareness and inner peace.
                    </p>
                  </motion.div>

                  <motion.div
                    variants={itemVariants}
                    className="grid grid-cols-2 gap-4"
                  >
                    <div className="text-center p-4 bg-orange-50 rounded-lg">
                      <div className="text-3xl font-bold text-orange-600">
                        {progress.meditationMinutesWeekly || 0}
                      </div>
                      <div className="text-sm text-gray-600">Minutes This Week</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-3xl font-bold text-green-600">
                        {progress.meditationStreak || 0}
                      </div>
                      <div className="text-sm text-gray-600">Day Streak</div>
                    </div>
                  </motion.div>

                  <motion.div variants={itemVariants}>
                    <Label className="mb-3 block">Log Today's Meditation</Label>
                    <div className="grid grid-cols-4 gap-2">
                      {[5, 10, 15, 20].map(mins => (
                        <Button
                          key={mins}
                          variant="outline"
                          onClick={() => logMeditation(mins)}
                          className="flex flex-col py-3"
                        >
                          <span className="font-bold">{mins}</span>
                          <span className="text-xs text-gray-500">min</span>
                        </Button>
                      ))}
                    </div>
                  </motion.div>

                  <motion.div
                    variants={itemVariants}
                    className="bg-amber-50 border border-amber-200 rounded-lg p-4"
                  >
                    <h4 className="font-medium text-amber-800 mb-2">Meditation Types</h4>
                    <ul className="text-sm text-amber-700 space-y-1">
                      <li>• Mindfulness of breath</li>
                      <li>• Loving-kindness (Metta)</li>
                      <li>• Body scan</li>
                      <li>• Walking meditation</li>
                      <li>• RAIN (Recognize, Allow, Investigate, Nurture)</li>
                    </ul>
                  </motion.div>
                </div>
              )}

              {/* Sangha Tab */}
              {activeTab === 'sangha' && (
                <div className="p-4 space-y-6">
                  <motion.div
                    variants={itemVariants}
                    className="text-center p-6 bg-orange-50 rounded-lg"
                  >
                    <Users className="w-16 h-16 text-orange-600 mx-auto mb-3" />
                    <h3 className="font-semibold text-lg mb-2">Sangha (Community)</h3>
                    <p className="text-gray-600 text-sm">
                      We do not recover alone. The sangha provides support and wise friendship.
                    </p>
                  </motion.div>

                  <motion.div
                    variants={itemVariants}
                    className="space-y-4"
                  >
                    <div>
                      <Label>Mentor/Guide Name</Label>
                      <Input
                        value={progress.mentorName || ''}
                        onChange={(e) => saveProgress({ mentorName: e.target.value })}
                        placeholder="Your mentor or kalyana mitta"
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label>Mentor Phone</Label>
                      <Input
                        value={progress.mentorPhone || ''}
                        onChange={(e) => saveProgress({ mentorPhone: e.target.value })}
                        placeholder="Your mentor's phone number"
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label>Home Group</Label>
                      <Input
                        value={progress.homeGroup || ''}
                        onChange={(e) => saveProgress({ homeGroup: e.target.value })}
                        placeholder="Your regular meeting group"
                        className="mt-1"
                      />
                    </div>
                  </motion.div>

                  <motion.div
                    variants={itemVariants}
                    className="flex items-center justify-between p-4 bg-orange-50 rounded-lg"
                  >
                    <div>
                      <h4 className="font-medium">Inquiry Workbook</h4>
                      <p className="text-sm text-gray-600">Completed the RD Inquiry process</p>
                    </div>
                    <button
                      onClick={() => saveProgress({ inquiryCompleted: !progress.inquiryCompleted })}
                      className={cn(
                        "px-4 py-2 rounded-lg font-medium",
                        progress.inquiryCompleted
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-100 text-gray-700'
                      )}
                    >
                      {progress.inquiryCompleted ? (
                        <span className="flex items-center gap-1">
                          <Check className="w-4 h-4" /> Complete
                        </span>
                      ) : 'Mark Complete'}
                    </button>
                  </motion.div>

                  <AnimatePresence>
                    {progress.inquiryCompleted && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="text-center p-4 bg-green-50 border border-green-200 rounded-lg"
                      >
                        <Award className="w-8 h-8 text-green-600 mx-auto mb-2" />
                        <p className="text-green-700 font-medium">Inquiry Workbook Completed!</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </motion.div>
          )}
        </ScrollArea>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-4 border-t bg-gray-50 flex-shrink-0"
        >
          <Button variant="outline" className="w-full" onClick={onClose}>
            Close
          </Button>
        </motion.div>
      </div>
    </ResponsiveModal>
  )
}
