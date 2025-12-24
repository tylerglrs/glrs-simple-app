import { useState, useEffect } from 'react'
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
  MessageSquare,
  Users,
  Loader2,
} from 'lucide-react'
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ResponsiveModal } from '@/components/ui/responsive-modal'
import { useStatusBarColor } from '@/hooks/useStatusBarColor'
import { TWELVE_STEPS, type TwelveStepsProgress } from '../types/recovery'

interface TwelveStepsModalProps {
  isOpen: boolean
  onClose: () => void
}

export function TwelveStepsModal({ isOpen, onClose }: TwelveStepsModalProps) {
  const { user } = useAuth()

  // Set iOS status bar to match modal header color (blue-600)
  useStatusBarColor('#2563EB', isOpen)

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [expandedStep, setExpandedStep] = useState<number | null>(null)
  const [activeTab, setActiveTab] = useState<'steps' | 'sponsor' | '90in90' | 'reading'>('steps')

  // Progress state
  const [progress, setProgress] = useState<Partial<TwelveStepsProgress>>({
    currentStep: 1,
    stepsCompleted: [],
    stepNotes: {},
    ninetyInNinetyMeetings: 0,
  })

  // Form states
  const [editingNote, setEditingNote] = useState<number | null>(null)
  const [noteText, setNoteText] = useState('')

  useEffect(() => {
    if (isOpen && user) {
      loadProgress()
    }
  }, [isOpen, user])

  const loadProgress = async () => {
    if (!user) return
    setLoading(true)
    try {
      const docRef = doc(db, 'twelveStepsProgress', user.uid)
      const docSnap = await getDoc(docRef)
      if (docSnap.exists()) {
        setProgress(docSnap.data() as TwelveStepsProgress)
      }
    } catch (error) {
      console.error('Error loading 12 steps progress:', error)
    } finally {
      setLoading(false)
    }
  }

  const saveProgress = async (updates: Partial<TwelveStepsProgress>) => {
    if (!user) return
    setSaving(true)
    try {
      const docRef = doc(db, 'twelveStepsProgress', user.uid)
      // Update local state without the timestamp
      const localProgress = {
        ...progress,
        ...updates,
        userId: user.uid,
      }
      setProgress(localProgress)
      // Write to Firestore with the timestamp
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

    // Update current step to next incomplete
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
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">12 Steps Progress</h2>
              <p className="text-blue-100 text-sm">Track your journey through the steps</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Progress bar */}
          <div className="mt-4">
            <div className="flex justify-between text-sm mb-1">
              <span>{completedCount} of 12 steps complete</span>
              <span>{Math.round(progressPercent)}%</span>
            </div>
            <div className="h-2 bg-blue-400/30 rounded-full overflow-hidden">
              <div
                className="h-full bg-white rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b shrink-0 bg-white">
          {[
            { id: 'steps', label: 'The Steps', icon: Target },
            { id: 'sponsor', label: 'Sponsor', icon: User },
            { id: '90in90', label: '90 in 90', icon: Calendar },
            { id: 'reading', label: 'Big Book', icon: Book },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <ScrollArea className="flex-1">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
          ) : (
            <>
              {/* Steps Tab */}
              {activeTab === 'steps' && (
                <div className="p-4 space-y-2">
                  {TWELVE_STEPS.map(step => {
                    const isCompleted = progress.stepsCompleted?.includes(step.number)
                    const isExpanded = expandedStep === step.number
                    const isCurrent = progress.currentStep === step.number

                    return (
                      <div
                        key={step.number}
                        className={`border rounded-lg overflow-hidden transition-all ${
                          isCurrent && !isCompleted
                            ? 'border-blue-500 bg-blue-50'
                            : isCompleted
                              ? 'border-green-200 bg-green-50'
                              : 'border-gray-200'
                        }`}
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
                            className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
                              isCompleted
                                ? 'bg-green-500 text-white'
                                : 'bg-gray-200 text-gray-500 hover:bg-gray-300'
                            }`}
                          >
                            {isCompleted ? (
                              <Check className="w-5 h-5" />
                            ) : (
                              <span className="font-bold">{step.number}</span>
                            )}
                          </button>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className={`font-medium ${isCompleted ? 'text-green-700' : ''}`}>
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

                        {isExpanded && (
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
                        )}
                      </div>
                    )
                  })}
                </div>
              )}

              {/* Sponsor Tab */}
              {activeTab === 'sponsor' && (
                <div className="p-4 space-y-6">
                  <div className="text-center p-6 bg-blue-50 rounded-lg">
                    <User className="w-16 h-16 text-blue-600 mx-auto mb-3" />
                    <h3 className="font-semibold text-lg mb-2">Your Sponsor</h3>
                    <p className="text-gray-600 text-sm">
                      A sponsor is a guide who has worked the steps and can help you on your journey.
                    </p>
                  </div>

                  <div className="space-y-4">
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
                  </div>

                  {progress.sponsorPhone && (
                    <Button
                      className="w-full"
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
                  <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg">
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
                          <div
                            className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                            style={{ width: `${((progress.ninetyInNinetyMeetings || 0) / 90) * 100}%` }}
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
                  </div>

                  {progress.ninetyInNinetyStart && (
                    <div className="flex gap-4">
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
                    </div>
                  )}

                  {(progress.ninetyInNinetyMeetings || 0) >= 90 && (
                    <div className="text-center p-6 bg-green-50 border border-green-200 rounded-lg">
                      <Award className="w-16 h-16 text-green-600 mx-auto mb-3" />
                      <h3 className="font-bold text-xl text-green-700">Congratulations!</h3>
                      <p className="text-green-600">You completed 90 meetings in 90 days!</p>
                    </div>
                  )}
                </div>
              )}

              {/* Big Book Tab */}
              {activeTab === 'reading' && (
                <div className="p-4 space-y-6">
                  <div className="text-center p-6 bg-amber-50 rounded-lg">
                    <Book className="w-16 h-16 text-amber-600 mx-auto mb-3" />
                    <h3 className="font-semibold text-lg mb-2">Big Book Progress</h3>
                    <p className="text-gray-600 text-sm">
                      "Alcoholics Anonymous" - the basic text for recovery
                    </p>
                  </div>

                  <div>
                    <Label>Current Progress</Label>
                    <Input
                      value={progress.bigBookProgress || ''}
                      onChange={(e) => saveProgress({ bigBookProgress: e.target.value })}
                      placeholder="e.g., Chapter 5, page 58"
                      className="mt-1"
                    />
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium mb-3">Big Book Chapters</h4>
                    <div className="space-y-2 text-sm">
                      {[
                        'Bill\'s Story',
                        'There Is A Solution',
                        'More About Alcoholism',
                        'We Agnostics',
                        'How It Works',
                        'Into Action',
                        'Working With Others',
                        'To Wives',
                        'The Family Afterward',
                        'To Employers',
                        'A Vision For You',
                      ].map((chapter, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-xs font-medium">
                            {idx + 1}
                          </div>
                          <span>{chapter}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </ScrollArea>

        {/* Footer */}
        <div className="p-4 border-t bg-gray-50 shrink-0">
          <Button variant="outline" className="w-full" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </ResponsiveModal>
  )
}
