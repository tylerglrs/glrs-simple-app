import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  Check,
  ChevronRight,
  ChevronDown,
  User,
  Phone,
  MapPin,
  Target,
  Book,
  Award,
  Calendar,
  Edit2,
  Save,
  Scale,
  Scroll,
  Coffee,
  Loader2,
} from 'lucide-react'
import { doc, getDoc, setDoc, onSnapshot, serverTimestamp } from 'firebase/firestore'
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
  TWELVE_STEPS,
  TWELVE_TRADITIONS,
  type AAProgress,
} from '../types/recovery'

// =============================================================================
// TYPES
// =============================================================================

interface AAModalProps {
  isOpen: boolean
  onClose: () => void
}

// =============================================================================
// ANIMATION VARIANTS
// =============================================================================

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring' as const, stiffness: 400, damping: 25 },
  },
}

// =============================================================================
// COMPONENT
// =============================================================================

export function AAModal({ isOpen, onClose }: AAModalProps) {
  const { user, userData } = useAuth()
  const [loading, setLoading] = useState(true)

  // Set iOS status bar to match modal header color (blue-600)
  useStatusBarColor('#2563EB', isOpen)
  const [saving, setSaving] = useState(false)
  const [expandedStep, setExpandedStep] = useState<number | null>(null)
  const [expandedTradition, setExpandedTradition] = useState<number | null>(null)
  const [activeTab, setActiveTab] = useState<'steps' | 'traditions' | 'sponsor' | '90in90' | 'reading'>('steps')

  // Progress state
  const [progress, setProgress] = useState<Partial<AAProgress>>({
    currentStep: 1,
    stepsCompleted: [],
    stepNotes: {},
    traditionsStudied: [],
    traditionNotes: {},
    ninetyInNinetyMeetings: 0,
  })

  // Form states
  const [editingNote, setEditingNote] = useState<number | null>(null)
  const [noteText, setNoteText] = useState('')
  const [editingTraditionNote, setEditingTraditionNote] = useState<number | null>(null)
  const [traditionNoteText, setTraditionNoteText] = useState('')

  // Real-time listener for progress - merges with user profile sponsor info
  useEffect(() => {
    if (!isOpen || !user) return

    setLoading(true)
    const docRef = doc(db, 'aaProgress', user.uid)

    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as AAProgress
        // Merge with sponsor info from user profile (user profile is source of truth)
        setProgress({
          ...data,
          sponsorName: userData?.sponsorName || data.sponsorName || '',
          sponsorPhone: userData?.sponsorPhone || data.sponsorPhone || '',
        })
      } else {
        // No progress doc yet - use sponsor info from user profile
        setProgress(prev => ({
          ...prev,
          sponsorName: userData?.sponsorName || '',
          sponsorPhone: userData?.sponsorPhone || '',
        }))
      }
      setLoading(false)
    }, (error) => {
      console.error('Error loading AA progress:', error)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [isOpen, user, userData?.sponsorName, userData?.sponsorPhone])

  const saveProgress = async (updates: Partial<AAProgress>) => {
    if (!user) return
    setSaving(true)
    try {
      const docRef = doc(db, 'aaProgress', user.uid)
      const localProgress = {
        ...progress,
        ...updates,
        userId: user.uid,
      }
      setProgress(localProgress)
      await setDoc(docRef, { ...localProgress, updatedAt: serverTimestamp() }, { merge: true })

      // If sponsor info was updated, also update the user profile for sync
      if (updates.sponsorName !== undefined || updates.sponsorPhone !== undefined) {
        const userDocRef = doc(db, 'users', user.uid)
        const userUpdates: Record<string, string | undefined> = {}
        if (updates.sponsorName !== undefined) userUpdates.sponsorName = updates.sponsorName
        if (updates.sponsorPhone !== undefined) userUpdates.sponsorPhone = updates.sponsorPhone
        await setDoc(userDocRef, userUpdates, { merge: true })
      }
    } catch (error) {
      console.error('Error saving progress:', error)
    } finally {
      setSaving(false)
    }
  }

  const toggleStepComplete = async (stepNum: number) => {
    const completed = progress.stepsCompleted || []
    let newCompleted: number[]
    if (completed.includes(stepNum)) {
      newCompleted = completed.filter(s => s !== stepNum)
    } else {
      newCompleted = [...completed, stepNum].sort((a, b) => a - b)
    }

    let newCurrentStep = progress.currentStep || 1
    for (let i = 1; i <= 12; i++) {
      if (!newCompleted.includes(i)) {
        newCurrentStep = i
        break
      }
    }
    if (newCompleted.length === 12) newCurrentStep = 12

    await saveProgress({
      stepsCompleted: newCompleted,
      currentStep: newCurrentStep
    })
  }

  const toggleTraditionStudied = async (tradNum: number) => {
    const studied = progress.traditionsStudied || []
    let newStudied: number[]
    if (studied.includes(tradNum)) {
      newStudied = studied.filter(t => t !== tradNum)
    } else {
      newStudied = [...studied, tradNum].sort((a, b) => a - b)
    }
    await saveProgress({ traditionsStudied: newStudied })
  }

  const saveStepNote = async (stepNum: number) => {
    const notes = { ...(progress.stepNotes || {}), [stepNum]: noteText }
    await saveProgress({ stepNotes: notes })
    setEditingNote(null)
    setNoteText('')
  }

  const saveTraditionNote = async (tradNum: number) => {
    const notes = { ...(progress.traditionNotes || {}), [tradNum]: traditionNoteText }
    await saveProgress({ traditionNotes: notes })
    setEditingTraditionNote(null)
    setTraditionNoteText('')
  }

  const completedCount = progress.stepsCompleted?.length || 0
  const progressPercent = (completedCount / 12) * 100
  const traditionsStudiedCount = progress.traditionsStudied?.length || 0

  // Loading state
  if (loading) {
    return (
      <ResponsiveModal
        open={isOpen}
        onOpenChange={(open) => !open && onClose()}
        desktopSize="lg"
      >
        <div className="flex flex-col h-full bg-white">
          <div className="flex items-center justify-center h-full min-h-[400px]">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
              <p className="text-sm text-muted-foreground">Loading AA Progress...</p>
            </div>
          </div>
        </div>
      </ResponsiveModal>
    )
  }

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
          className="relative bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-600 p-6 overflow-hidden"
        >
          {/* Decorative illustration */}
          <div className="absolute right-0 top-1/2 -translate-y-1/2 opacity-15 pointer-events-none">
            <Illustration name="lighthouse" size="md" />
          </div>
          {/* Decorative elements */}
          <div className="absolute top-4 right-12 w-8 h-8 rounded-full bg-white/10" />
          <div className="absolute bottom-4 left-8 w-6 h-6 rounded-full bg-white/5" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors z-10"
          >
            <X className="h-5 w-5 text-white" />
          </button>

          {/* Title and progress */}
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-3">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring' as const, stiffness: 400, damping: 15, delay: 0.2 }}
                className="p-3 rounded-xl bg-white/20 backdrop-blur-sm"
              >
                <Target className="h-7 w-7 text-white" />
              </motion.div>
              <div>
                <h2 className="text-xl font-bold text-white">Alcoholics Anonymous</h2>
                <p className="text-white/80 text-sm">The Original 12-Step Fellowship</p>
              </div>
            </div>

            {/* Progress circle */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3 }}
              className="relative"
            >
              <svg className="w-14 h-14 -rotate-90">
                <circle
                  cx="28"
                  cy="28"
                  r="24"
                  stroke="rgba(255,255,255,0.2)"
                  strokeWidth="4"
                  fill="none"
                />
                <motion.circle
                  cx="28"
                  cy="28"
                  r="24"
                  stroke="white"
                  strokeWidth="4"
                  fill="none"
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: progressPercent / 100 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                  style={{
                    strokeDasharray: '151',
                    strokeDashoffset: '0',
                  }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs font-bold text-white">
                  {completedCount}/12
                </span>
              </div>
            </motion.div>
          </div>

          {/* Progress bars */}
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div className="bg-white/10 rounded-lg p-2">
              <div className="flex justify-between text-sm text-white/90 mb-1">
                <span>Steps: {completedCount}/12</span>
                <span>{Math.round(progressPercent)}%</span>
              </div>
              <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 0.5 }}
                  className="h-full bg-white rounded-full"
                />
              </div>
            </div>
            <div className="bg-white/10 rounded-lg p-2">
              <div className="flex justify-between text-sm text-white/90 mb-1">
                <span>Traditions: {traditionsStudiedCount}/12</span>
                <span>{Math.round((traditionsStudiedCount / 12) * 100)}%</span>
              </div>
              <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(traditionsStudiedCount / 12) * 100}%` }}
                  transition={{ duration: 0.5 }}
                  className="h-full bg-white rounded-full"
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="flex border-b bg-white overflow-x-auto flex-shrink-0">
          {[
            { id: 'steps', label: 'Steps', icon: Target },
            { id: 'traditions', label: 'Traditions', icon: Scale },
            { id: 'sponsor', label: 'Sponsor', icon: User },
            { id: '90in90', label: '90 in 90', icon: Calendar },
            { id: 'reading', label: 'Literature', icon: Book },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={cn(
                'flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors whitespace-nowrap px-2 border-b-2',
                activeTab === tab.id
                  ? 'text-blue-600 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700 border-transparent'
              )}
            >
              <tab.icon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <ScrollArea className="flex-1">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="p-4"
          >
            {/* Steps Tab */}
            {activeTab === 'steps' && (
              <div className="space-y-2">
                <motion.div variants={itemVariants} className="bg-blue-50 rounded-lg p-3 mb-4">
                  <p className="text-sm text-blue-700">
                    <strong>The 12 Steps</strong> are the spiritual principles that AA members follow
                    as a path to recovery. Work through them with your sponsor.
                  </p>
                </motion.div>
                {TWELVE_STEPS.map((step, index) => {
                  const isCompleted = progress.stepsCompleted?.includes(step.number)
                  const isExpanded = expandedStep === step.number
                  const isCurrent = progress.currentStep === step.number

                  return (
                    <motion.div
                      key={step.number}
                      variants={itemVariants}
                      className={cn(
                        'border rounded-lg overflow-hidden transition-all',
                        isCurrent && !isCompleted
                          ? 'border-blue-500 bg-blue-50'
                          : isCompleted
                            ? 'border-green-200 bg-green-50'
                            : 'border-gray-200'
                      )}
                    >
                      <button
                        onClick={() => setExpandedStep(isExpanded ? null : step.number)}
                        className="w-full flex items-center gap-3 p-3 text-left"
                      >
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            toggleStepComplete(step.number)
                          }}
                          className={cn(
                            'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-colors',
                            isCompleted
                              ? 'bg-green-500 text-white'
                              : 'bg-gray-200 text-gray-500 hover:bg-gray-300'
                          )}
                        >
                          {isCompleted ? (
                            <Check className="w-5 h-5" />
                          ) : (
                            <span className="font-bold">{step.number}</span>
                          )}
                        </button>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className={cn('font-medium', isCompleted && 'text-green-700')}>
                              Step {step.number}: {step.shortTitle}
                            </span>
                            {isCurrent && !isCompleted && (
                              <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full">
                                Current
                              </span>
                            )}
                          </div>
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
                            className="overflow-hidden"
                          >
                            <div className="px-4 pb-4 pt-2 border-t bg-white">
                              <p className="text-gray-700 italic mb-3">"{step.title}"</p>
                              <p className="text-gray-600 text-sm mb-3">{step.description}</p>

                              {step.bigBookChapter && (
                                <div className="flex items-center gap-2 text-sm text-blue-600 mb-3">
                                  <Book className="w-4 h-4" />
                                  <span>Big Book: {step.bigBookChapter}</span>
                                </div>
                              )}

                              {/* Notes section */}
                              <div className="mt-4">
                                <div className="flex items-center justify-between mb-2">
                                  <Label className="text-sm font-medium">Your Notes</Label>
                                  {editingNote !== step.number && (
                                    <button
                                      onClick={() => {
                                        setEditingNote(step.number)
                                        setNoteText(progress.stepNotes?.[step.number] || '')
                                      }}
                                      className="text-blue-600 text-sm flex items-center gap-1"
                                    >
                                      <Edit2 className="w-3 h-3" />
                                      Edit
                                    </button>
                                  )}
                                </div>

                                {editingNote === step.number ? (
                                  <div className="space-y-2">
                                    <Textarea
                                      value={noteText}
                                      onChange={(e) => setNoteText(e.target.value)}
                                      placeholder="Write your reflections on this step..."
                                      rows={3}
                                    />
                                    <div className="flex gap-2">
                                      <Button
                                        size="sm"
                                        onClick={() => saveStepNote(step.number)}
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
                                    {progress.stepNotes?.[step.number] || 'No notes yet. Click Edit to add your thoughts.'}
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

            {/* Traditions Tab */}
            {activeTab === 'traditions' && (
              <div className="space-y-2">
                <motion.div variants={itemVariants} className="bg-amber-50 rounded-lg p-3 mb-4">
                  <p className="text-sm text-amber-700">
                    <strong>The 12 Traditions</strong> guide how AA groups function and relate to
                    the world. They ensure AA's unity and effectiveness.
                  </p>
                </motion.div>
                {TWELVE_TRADITIONS.map((tradition, index) => {
                  const isStudied = progress.traditionsStudied?.includes(tradition.number)
                  const isExpanded = expandedTradition === tradition.number

                  return (
                    <motion.div
                      key={tradition.number}
                      variants={itemVariants}
                      className={cn(
                        'border rounded-lg overflow-hidden transition-all',
                        isStudied
                          ? 'border-amber-200 bg-amber-50'
                          : 'border-gray-200'
                      )}
                    >
                      <button
                        onClick={() => setExpandedTradition(isExpanded ? null : tradition.number)}
                        className="w-full flex items-center gap-3 p-3 text-left"
                      >
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            toggleTraditionStudied(tradition.number)
                          }}
                          className={cn(
                            'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-colors',
                            isStudied
                              ? 'bg-amber-500 text-white'
                              : 'bg-gray-200 text-gray-500 hover:bg-gray-300'
                          )}
                        >
                          {isStudied ? (
                            <Check className="w-5 h-5" />
                          ) : (
                            <span className="font-bold">{tradition.number}</span>
                          )}
                        </button>
                        <div className="flex-1 min-w-0">
                          <span className={cn('font-medium', isStudied && 'text-amber-700')}>
                            Tradition {tradition.number}: {tradition.principle}
                          </span>
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
                            className="overflow-hidden"
                          >
                            <div className="px-4 pb-4 pt-2 border-t bg-white">
                              <div className="mb-3">
                                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Short Form</p>
                                <p className="text-gray-700 italic">"{tradition.shortForm}"</p>
                              </div>
                              <div className="mb-3">
                                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Long Form</p>
                                <p className="text-gray-600 text-sm">{tradition.longForm}</p>
                              </div>

                              {/* Notes section */}
                              <div className="mt-4">
                                <div className="flex items-center justify-between mb-2">
                                  <Label className="text-sm font-medium">Your Notes</Label>
                                  {editingTraditionNote !== tradition.number && (
                                    <button
                                      onClick={() => {
                                        setEditingTraditionNote(tradition.number)
                                        setTraditionNoteText(progress.traditionNotes?.[tradition.number] || '')
                                      }}
                                      className="text-amber-600 text-sm flex items-center gap-1"
                                    >
                                      <Edit2 className="w-3 h-3" />
                                      Edit
                                    </button>
                                  )}
                                </div>

                                {editingTraditionNote === tradition.number ? (
                                  <div className="space-y-2">
                                    <Textarea
                                      value={traditionNoteText}
                                      onChange={(e) => setTraditionNoteText(e.target.value)}
                                      placeholder="Write your reflections on this tradition..."
                                      rows={3}
                                    />
                                    <div className="flex gap-2">
                                      <Button
                                        size="sm"
                                        onClick={() => saveTraditionNote(tradition.number)}
                                        disabled={saving}
                                        className="bg-amber-500 hover:bg-amber-600"
                                      >
                                        <Save className="w-3 h-3 mr-1" />
                                        Save
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => {
                                          setEditingTraditionNote(null)
                                          setTraditionNoteText('')
                                        }}
                                      >
                                        Cancel
                                      </Button>
                                    </div>
                                  </div>
                                ) : (
                                  <p className="text-sm text-gray-600 bg-gray-50 rounded p-2 min-h-[40px]">
                                    {progress.traditionNotes?.[tradition.number] || 'No notes yet. Click Edit to add your thoughts.'}
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

            {/* Sponsor Tab */}
            {activeTab === 'sponsor' && (
              <motion.div variants={containerVariants} className="space-y-6">
                <motion.div variants={itemVariants} className="text-center p-6 bg-blue-50 rounded-lg">
                  <User className="w-16 h-16 text-blue-600 mx-auto mb-3" />
                  <h3 className="font-semibold text-lg mb-2">Your Sponsor</h3>
                  <p className="text-gray-600 text-sm">
                    A sponsor is a guide who has worked the steps and can help you on your journey.
                  </p>
                </motion.div>

                <motion.div variants={itemVariants} className="space-y-4">
                  <div>
                    <Label>Sponsor Name</Label>
                    <Input
                      value={progress.sponsorName || ''}
                      onChange={(e) => saveProgress({ sponsorName: e.target.value })}
                      placeholder="Enter sponsor name"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label>Sponsor Phone</Label>
                    <Input
                      value={progress.sponsorPhone || ''}
                      onChange={(e) => saveProgress({ sponsorPhone: e.target.value })}
                      placeholder="Enter phone number"
                      type="tel"
                      inputMode="tel"
                      autoComplete="tel"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label>Home Group</Label>
                    <Input
                      value={progress.homeGroup || ''}
                      onChange={(e) => saveProgress({ homeGroup: e.target.value })}
                      placeholder="Your home group name"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label>Service Position</Label>
                    <Input
                      value={progress.servicePosition || ''}
                      onChange={(e) => saveProgress({ servicePosition: e.target.value })}
                      placeholder="e.g., GSR, Secretary, Treasurer"
                      className="mt-1"
                    />
                  </div>
                </motion.div>

                {progress.sponsorPhone && (
                  <motion.div variants={itemVariants}>
                    <Button
                      className="w-full"
                      onClick={() => window.location.href = `tel:${progress.sponsorPhone}`}
                    >
                      <Phone className="w-4 h-4 mr-2" />
                      Call Sponsor
                    </Button>
                  </motion.div>
                )}
              </motion.div>
            )}

            {/* 90 in 90 Tab */}
            {activeTab === '90in90' && (
              <motion.div variants={containerVariants} className="space-y-6">
                <motion.div variants={itemVariants} className="text-center p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg">
                  <Calendar className="w-16 h-16 text-blue-600 mx-auto mb-3" />
                  <h3 className="font-semibold text-lg mb-2">90 Meetings in 90 Days</h3>
                  <p className="text-gray-600 text-sm mb-4">
                    A powerful commitment in early recovery - one meeting every day for 90 days.
                  </p>

                  {progress.ninetyInNinetyStart ? (
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <div className="text-4xl font-bold text-blue-600 mb-1">
                        {progress.ninetyInNinetyMeetings || 0}
                      </div>
                      <div className="text-gray-500">of 90 meetings</div>
                      <div className="mt-3 h-3 bg-gray-200 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${((progress.ninetyInNinetyMeetings || 0) / 90) * 100}%` }}
                          className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                        />
                      </div>
                      <p className="text-sm text-gray-500 mt-2">
                        Started: {new Date(progress.ninetyInNinetyStart).toLocaleDateString()}
                      </p>
                    </div>
                  ) : (
                    <Button
                      onClick={() => saveProgress({
                        ninetyInNinetyStart: new Date().toISOString().split('T')[0],
                        ninetyInNinetyMeetings: 0
                      })}
                    >
                      Start 90 in 90 Challenge
                    </Button>
                  )}
                </motion.div>

                {progress.ninetyInNinetyStart && (
                  <motion.div variants={itemVariants} className="flex gap-4">
                    <Button
                      className="flex-1"
                      onClick={() => saveProgress({
                        ninetyInNinetyMeetings: (progress.ninetyInNinetyMeetings || 0) + 1
                      })}
                      disabled={(progress.ninetyInNinetyMeetings || 0) >= 90}
                    >
                      <Check className="w-4 h-4 mr-2" />
                      Log Meeting
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        if (confirm('Reset 90 in 90 progress?')) {
                          saveProgress({
                            ninetyInNinetyStart: undefined,
                            ninetyInNinetyMeetings: 0
                          })
                        }
                      }}
                    >
                      Reset
                    </Button>
                  </motion.div>
                )}

                {(progress.ninetyInNinetyMeetings || 0) >= 90 && (
                  <motion.div
                    variants={itemVariants}
                    className="text-center p-6 bg-green-50 border border-green-200 rounded-lg"
                  >
                    <Award className="w-16 h-16 text-green-600 mx-auto mb-3" />
                    <h3 className="font-bold text-xl text-green-700">Congratulations!</h3>
                    <p className="text-green-600">You completed 90 meetings in 90 days!</p>
                  </motion.div>
                )}
              </motion.div>
            )}

            {/* Literature Tab */}
            {activeTab === 'reading' && (
              <motion.div variants={containerVariants} className="space-y-6">
                <motion.div variants={itemVariants} className="text-center p-6 bg-amber-50 rounded-lg">
                  <Book className="w-16 h-16 text-amber-600 mx-auto mb-3" />
                  <h3 className="font-semibold text-lg mb-2">AA Literature</h3>
                  <p className="text-gray-600 text-sm">
                    Track your progress through AA's essential reading
                  </p>
                </motion.div>

                <motion.div variants={itemVariants} className="space-y-4">
                  <div>
                    <Label>Big Book Progress</Label>
                    <Input
                      value={progress.bigBookProgress || ''}
                      onChange={(e) => saveProgress({ bigBookProgress: e.target.value })}
                      placeholder="e.g., Chapter 5, page 58"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label>Twelve Steps and Twelve Traditions Progress</Label>
                    <Input
                      value={progress.twelveAndTwelveProgress || ''}
                      onChange={(e) => saveProgress({ twelveAndTwelveProgress: e.target.value })}
                      placeholder="e.g., Step 4 essay"
                      className="mt-1"
                    />
                  </div>
                </motion.div>

                <motion.div variants={itemVariants} className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium mb-3">Big Book Chapters</h4>
                  <div className="space-y-2 text-sm">
                    {[
                      { num: 1, title: "Bill's Story" },
                      { num: 2, title: 'There Is A Solution' },
                      { num: 3, title: 'More About Alcoholism' },
                      { num: 4, title: 'We Agnostics' },
                      { num: 5, title: 'How It Works' },
                      { num: 6, title: 'Into Action' },
                      { num: 7, title: 'Working With Others' },
                      { num: 8, title: 'To Wives' },
                      { num: 9, title: 'The Family Afterward' },
                      { num: 10, title: 'To Employers' },
                      { num: 11, title: 'A Vision For You' },
                    ].map((chapter) => (
                      <div key={chapter.num} className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-xs font-medium">
                          {chapter.num}
                        </div>
                        <span>{chapter.title}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>

                <motion.div variants={itemVariants} className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-medium mb-3 text-blue-800">Other AA Resources</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li className="flex items-center gap-2">
                      <Scroll className="w-4 h-4" />
                      Daily Reflections
                    </li>
                    <li className="flex items-center gap-2">
                      <Book className="w-4 h-4" />
                      Living Sober
                    </li>
                    <li className="flex items-center gap-2">
                      <Coffee className="w-4 h-4" />
                      As Bill Sees It
                    </li>
                  </ul>
                </motion.div>
              </motion.div>
            )}
          </motion.div>
        </ScrollArea>

        {/* Footer */}
        <div className="p-4 border-t bg-gray-50 flex-shrink-0">
          <Button variant="outline" className="w-full" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </ResponsiveModal>
  )
}

export default AAModal
