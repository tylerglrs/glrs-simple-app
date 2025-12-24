import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  Check,
  ChevronRight,
  ChevronDown,
  User,
  Phone,
  Target,
  Award,
  Calendar,
  Edit2,
  Save,
  ShieldCheck,
  Heart,
} from 'lucide-react'
import { doc, onSnapshot, setDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ResponsiveModal } from '@/components/ui/responsive-modal'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { NA_STEPS, type CMAProgress } from '../types/recovery'

// CMA uses the same 12 steps as NA, adapted for crystal meth addiction
const CMA_STEPS = NA_STEPS.map(step => ({
  ...step,
  // Keep the step content the same - CMA follows NA's step format
}))

// Animation variants
const headerVariants = {
  hidden: { opacity: 0, y: -20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: 'easeOut' as const,
    },
  },
}

const contentVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.2,
      delay: 0.1,
    },
  },
}

const stepContentVariants = {
  hidden: {
    height: 0,
    opacity: 0,
  },
  visible: {
    height: 'auto',
    opacity: 1,
    transition: {
      height: {
        duration: 0.3,
        ease: 'easeOut' as const,
      },
      opacity: {
        duration: 0.2,
        delay: 0.1,
      },
    },
  },
  exit: {
    height: 0,
    opacity: 0,
    transition: {
      height: {
        duration: 0.2,
        ease: 'easeIn' as const,
      },
      opacity: {
        duration: 0.1,
      },
    },
  },
}

interface CMAModalProps {
  isOpen: boolean
  onClose: () => void
}

export function CMAModal({ isOpen, onClose }: CMAModalProps) {
  const { user, userData } = useAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [expandedStep, setExpandedStep] = useState<number | null>(null)
  const [activeTab, setActiveTab] = useState<'steps' | 'sponsor' | '90in90' | 'resources'>('steps')

  // Progress state
  const [progress, setProgress] = useState<Partial<CMAProgress>>({
    currentStep: 1,
    stepsCompleted: [],
    stepNotes: {},
    ninetyInNinetyMeetings: 0,
  })

  // Form states
  const [editingNote, setEditingNote] = useState<number | null>(null)
  const [noteText, setNoteText] = useState('')

  // Real-time listener for progress - merges with user profile sponsor info
  useEffect(() => {
    if (!user) return

    setLoading(true)
    const docRef = doc(db, 'cmaProgress', user.uid)

    const unsubscribe = onSnapshot(
      docRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data() as CMAProgress
          // Merge with sponsor info from user profile (user profile is source of truth)
          setProgress({
            ...data,
            sponsorName: userData?.sponsorName || data.sponsorName || '',
            sponsorPhone: userData?.sponsorPhone || data.sponsorPhone || '',
          })
        } else {
          // No progress doc yet - use sponsor info from user profile
          setProgress({
            currentStep: 1,
            stepsCompleted: [],
            stepNotes: {},
            ninetyInNinetyMeetings: 0,
            sponsorName: userData?.sponsorName || '',
            sponsorPhone: userData?.sponsorPhone || '',
          })
        }
        setLoading(false)
      },
      (error) => {
        console.error('Error loading CMA progress:', error)
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [user, userData?.sponsorName, userData?.sponsorPhone])

  const saveProgress = async (updates: Partial<CMAProgress>) => {
    if (!user) return
    setSaving(true)
    try {
      const docRef = doc(db, 'cmaProgress', user.uid)
      const localProgress = {
        ...progress,
        ...updates,
        userId: user.uid,
      }
      setProgress(localProgress)
      await setDoc(docRef, { ...localProgress, updatedAt: serverTimestamp() }, { merge: true })
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

  const saveStepNote = async (stepNum: number) => {
    const notes = { ...(progress.stepNotes || {}), [stepNum]: noteText }
    await saveProgress({ stepNotes: notes })
    setEditingNote(null)
    setNoteText('')
  }

  const completedCount = progress.stepsCompleted?.length || 0
  const progressPercent = (completedCount / 12) * 100

  return (
    <ResponsiveModal
      open={isOpen}
      onOpenChange={(open) => !open && onClose()}
      desktopSize="lg"
    >
      <div className="flex flex-col h-full bg-white">
        {/* Header */}
        <motion.div
          variants={headerVariants}
          initial="hidden"
          animate="visible"
          className="bg-gradient-to-r from-red-600 via-rose-500 to-red-700 text-white p-4 flex-shrink-0"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-6 h-6 md:w-8 md:h-8 flex-shrink-0" />
              <div>
                <h2 className="font-bold text-lg md:text-xl">
                  Crystal Meth Anonymous
                </h2>
                <p className="text-red-100 text-xs md:text-sm">
                  Recovery from Crystal Meth Addiction
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors flex-shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Progress bar */}
          <div className="mt-4 bg-white/10 rounded-lg p-2">
            <div className="flex justify-between text-sm mb-1">
              <span>Steps Completed: {completedCount}/12</span>
              <span>{Math.round(progressPercent)}%</span>
            </div>
            <div className="h-2 bg-red-400/30 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-white rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
              />
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <motion.div
          variants={contentVariants}
          initial="hidden"
          animate="visible"
          className="flex border-b overflow-x-auto flex-shrink-0"
        >
          {[
            { id: 'steps', label: 'Steps', icon: Target },
            { id: 'sponsor', label: 'Sponsor', icon: User },
            { id: '90in90', label: '90 in 90', icon: Calendar },
            { id: 'resources', label: 'Resources', icon: Heart },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-3 font-medium transition-colors whitespace-nowrap px-3 text-xs md:text-sm",
                activeTab === tab.id
                  ? 'text-red-600 border-b-2 border-red-600'
                  : 'text-gray-500 hover:text-gray-700'
              )}
            >
              <tab.icon className="w-4 h-4" />
              <span className="inline sm:hidden md:inline">{tab.label}</span>
            </button>
          ))}
        </motion.div>

        {/* Content */}
        <ScrollArea className="flex-1">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <motion.div
              variants={contentVariants}
              initial="hidden"
              animate="visible"
            >
              {/* Steps Tab */}
              {activeTab === 'steps' && (
                <div className="p-4 space-y-2">
                  <div className="bg-red-50 rounded-lg p-3 mb-4">
                    <p className="text-red-700 text-xs md:text-sm">
                      <strong>CMA's 12 Steps</strong> follow the same format as NA, providing a
                      spiritual framework for recovery from crystal meth addiction.
                    </p>
                  </div>
                  {CMA_STEPS.map(step => {
                    const isCompleted = progress.stepsCompleted?.includes(step.number)
                    const isExpanded = expandedStep === step.number
                    const isCurrent = progress.currentStep === step.number

                    return (
                      <div
                        key={step.number}
                        className={cn(
                          "border rounded-lg overflow-hidden transition-all",
                          isCurrent && !isCompleted
                            ? 'border-red-500 bg-red-50'
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
                              "w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-colors",
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
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className={cn(
                                "font-medium text-sm md:text-base",
                                isCompleted ? 'text-green-700' : ''
                              )}>
                                Step {step.number}: {step.shortTitle}
                              </span>
                              {isCurrent && !isCompleted && (
                                <span className="text-xs bg-red-600 text-white px-2 py-0.5 rounded-full">
                                  Current
                                </span>
                              )}
                            </div>
                          </div>
                          {isExpanded ? (
                            <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                          ) : (
                            <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                          )}
                        </button>

                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              variants={stepContentVariants}
                              initial="hidden"
                              animate="visible"
                              exit="exit"
                              className="overflow-hidden"
                            >
                              <div className="px-4 pb-4 pt-2 border-t bg-white">
                                <p className="text-gray-700 italic mb-3 text-sm md:text-base">
                                  "{step.title}"
                                </p>
                                <p className="text-gray-600 mb-3 text-xs md:text-sm">
                                  {step.description}
                                </p>

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
                                        className="text-red-600 text-sm flex items-center gap-1"
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
                                          className="bg-red-600 hover:bg-red-700"
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
                                    <p className="text-gray-600 bg-gray-50 rounded p-2 min-h-[40px] text-xs md:text-sm">
                                      {progress.stepNotes?.[step.number] || 'No notes yet. Click Edit to add your thoughts.'}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    )
                  })}
                </div>
              )}

              {/* Sponsor Tab */}
              {activeTab === 'sponsor' && (
                <div className="p-4 space-y-6">
                  <div className="text-center p-6 bg-red-50 rounded-lg">
                    <User className="w-12 h-12 md:w-16 md:h-16 text-red-600 mx-auto mb-3" />
                    <h3 className="font-semibold mb-2 text-base md:text-lg">
                      Your Sponsor
                    </h3>
                    <p className="text-gray-600 text-xs md:text-sm">
                      A CMA sponsor is someone who has experience staying clean from crystal meth
                      and can guide you through the 12 Steps.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm md:text-base">Sponsor Name</Label>
                      <Input
                        value={progress.sponsorName || ''}
                        onChange={(e) => saveProgress({ sponsorName: e.target.value })}
                        placeholder="Enter sponsor name"
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label className="text-sm md:text-base">Sponsor Phone</Label>
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
                      <Label className="text-sm md:text-base">Home Group</Label>
                      <Input
                        value={progress.homeGroup || ''}
                        onChange={(e) => saveProgress({ homeGroup: e.target.value })}
                        placeholder="Your home group name"
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label className="text-sm md:text-base">Clean Date</Label>
                      <Input
                        type="date"
                        value={progress.cleanDate || ''}
                        onChange={(e) => saveProgress({ cleanDate: e.target.value })}
                        className="mt-1"
                      />
                    </div>
                  </div>

                  {progress.sponsorPhone && (
                    <Button
                      className="w-full bg-red-600 hover:bg-red-700"
                      onClick={() => window.location.href = `tel:${progress.sponsorPhone}`}
                    >
                      <Phone className="w-4 h-4 mr-2" />
                      Call Sponsor
                    </Button>
                  )}
                </div>
              )}

              {/* 90 in 90 Tab */}
              {activeTab === '90in90' && (
                <div className="p-4 space-y-6">
                  <div className="text-center p-6 bg-gradient-to-br from-red-50 to-orange-50 rounded-lg">
                    <Calendar className="w-12 h-12 md:w-16 md:h-16 text-red-600 mx-auto mb-3" />
                    <h3 className="font-semibold mb-2 text-base md:text-lg">
                      90 Meetings in 90 Days
                    </h3>
                    <p className="text-gray-600 mb-4 text-xs md:text-sm">
                      Build a strong foundation for your recovery by attending a meeting every day
                      for your first 90 days clean.
                    </p>

                    {progress.ninetyInNinetyStart ? (
                      <div className="bg-white rounded-lg p-4 shadow-sm">
                        <div className="font-bold text-red-600 mb-1 text-3xl md:text-4xl">
                          {progress.ninetyInNinetyMeetings || 0}
                        </div>
                        <div className="text-gray-500 text-sm md:text-base">
                          of 90 meetings
                        </div>
                        <div className="mt-3 h-3 bg-gray-200 rounded-full overflow-hidden">
                          <motion.div
                            className="h-full bg-gradient-to-r from-red-500 to-orange-500 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${((progress.ninetyInNinetyMeetings || 0) / 90) * 100}%` }}
                            transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
                          />
                        </div>
                        <p className="text-gray-500 mt-2 text-xs md:text-sm">
                          Started: {new Date(progress.ninetyInNinetyStart).toLocaleDateString()}
                        </p>
                      </div>
                    ) : (
                      <Button
                        onClick={() => saveProgress({
                          ninetyInNinetyStart: new Date().toISOString().split('T')[0],
                          ninetyInNinetyMeetings: 0
                        })}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Start 90 in 90 Challenge
                      </Button>
                    )}
                  </div>

                  {progress.ninetyInNinetyStart && (
                    <div className="flex gap-4">
                      <Button
                        className="flex-1 bg-red-600 hover:bg-red-700"
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
                    </div>
                  )}

                  {(progress.ninetyInNinetyMeetings || 0) >= 90 && (
                    <div className="text-center p-6 bg-green-50 border border-green-200 rounded-lg">
                      <Award className="w-12 h-12 md:w-16 md:h-16 text-green-600 mx-auto mb-3" />
                      <h3 className="font-bold text-green-700 text-lg md:text-xl">
                        Congratulations!
                      </h3>
                      <p className="text-green-600 text-sm md:text-base">
                        You completed 90 meetings in 90 days!
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Resources Tab */}
              {activeTab === 'resources' && (
                <div className="p-4 space-y-6">
                  <div className="text-center p-6 bg-red-50 rounded-lg">
                    <Heart className="w-12 h-12 md:w-16 md:h-16 text-red-600 mx-auto mb-3" />
                    <h3 className="font-semibold mb-2 text-base md:text-lg">
                      CMA Resources
                    </h3>
                    <p className="text-gray-600 text-xs md:text-sm">
                      Tools and information to support your recovery
                    </p>
                  </div>

                  <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
                    <h4 className="font-medium mb-2 text-amber-800 text-sm md:text-base">
                      CMA Preamble
                    </h4>
                    <p className="text-amber-700 italic text-xs md:text-sm">
                      "Crystal Meth Anonymous is a fellowship of people who share their experience,
                      strength and hope with each other, so they may solve their common problem and
                      help others to recover from addiction to crystal meth."
                    </p>
                  </div>

                  <div className="bg-white rounded-lg p-4 border">
                    <h4 className="font-medium mb-3 text-sm md:text-base">
                      About CMA
                    </h4>
                    <ul className="text-gray-600 space-y-2 text-xs md:text-sm">
                      <li className="flex items-start gap-2">
                        <ShieldCheck className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                        <span>Founded in the 1990s in response to the crystal meth epidemic</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <ShieldCheck className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                        <span>Uses the same 12 Steps and 12 Traditions as NA</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <ShieldCheck className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                        <span>Focused specifically on crystal meth addiction</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <ShieldCheck className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                        <span>Meetings available in-person and online worldwide</span>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium mb-3 text-sm md:text-base">
                      CMA Literature
                    </h4>
                    <p className="text-gray-600 mb-3 text-xs md:text-sm">
                      CMA members often use NA literature alongside CMA-specific pamphlets and materials.
                    </p>
                    <ul className="text-gray-700 space-y-2 text-xs md:text-sm">
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-600" />
                        CMA Meeting Format & Readings
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-600" />
                        CMA Pamphlets
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-600" />
                        NA Basic Text
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-600" />
                        It Works: How and Why
                      </li>
                    </ul>
                  </div>

                  <div className="bg-blue-50 rounded-lg p-4">
                    <h4 className="font-medium mb-2 text-blue-800 text-sm md:text-base">
                      Recovery Principle
                    </h4>
                    <p className="text-blue-700 text-xs md:text-sm">
                      "The only requirement for membership is a desire to stop using crystal meth."
                    </p>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </ScrollArea>

        {/* Footer */}
        <motion.div
          variants={contentVariants}
          initial="hidden"
          animate="visible"
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

export default CMAModal
