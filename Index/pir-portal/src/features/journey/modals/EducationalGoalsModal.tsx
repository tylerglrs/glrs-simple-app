import { useState, useEffect } from 'react'
import {
  X,
  Check,
  ChevronRight,
  ChevronDown,
  GraduationCap,
  Award,
  BookOpen,
  Zap,
  Star,
  Plus,
  Trash2,
  Edit2,
  Save,
  Calendar,
  Target,
  School,
} from 'lucide-react'
import { collection, doc, getDoc, getDocs, setDoc, deleteDoc, query, where, serverTimestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ResponsiveModal } from '@/components/ui/responsive-modal'
import { useStatusBarColor } from '@/hooks/useStatusBarColor'
import { Illustration } from '@/components/common/Illustration'
import {
  EDUCATIONAL_GOAL_TYPES,
  EDUCATION_MILESTONES,
  type EducationalGoal,
} from '../types/recovery'

interface EducationalGoalsModalProps {
  isOpen: boolean
  onClose: () => void
}

const GOAL_ICONS: Record<string, React.ElementType> = {
  degree: GraduationCap,
  certification: Award,
  course: BookOpen,
  skill: Zap,
  other: Star,
}

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  'not-started': { bg: 'bg-gray-100', text: 'text-gray-600' },
  'in-progress': { bg: 'bg-blue-100', text: 'text-blue-600' },
  'completed': { bg: 'bg-green-100', text: 'text-green-600' },
  'paused': { bg: 'bg-amber-100', text: 'text-amber-600' },
}

export function EducationalGoalsModal({ isOpen, onClose }: EducationalGoalsModalProps) {
  const { user } = useAuth()

  // Set iOS status bar to match modal header color (emerald-600)
  useStatusBarColor('#059669', isOpen)

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [goals, setGoals] = useState<EducationalGoal[]>([])
  const [expandedGoal, setExpandedGoal] = useState<string | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingGoal, setEditingGoal] = useState<string | null>(null)

  // New goal form state
  const [newGoal, setNewGoal] = useState({
    title: '',
    description: '',
    goalType: 'course' as EducationalGoal['goalType'],
    targetDate: '',
    institution: '',
  })

  const [newMilestone, setNewMilestone] = useState('')

  useEffect(() => {
    if (isOpen && user) {
      loadGoals()
    }
  }, [isOpen, user])

  const loadGoals = async () => {
    if (!user) return
    setLoading(true)
    try {
      const q = query(
        collection(db, 'educationalGoals'),
        where('userId', '==', user.uid)
      )
      const snapshot = await getDocs(q)
      const loadedGoals = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as EducationalGoal[]
      // Sort by createdAt, handling Firestore Timestamp objects
      setGoals(loadedGoals.sort((a, b) => {
        const getTime = (date: unknown): number => {
          if (!date) return 0
          if (date instanceof Date) return date.getTime()
          if (typeof date === 'object' && 'toDate' in date && typeof (date as { toDate: () => Date }).toDate === 'function') {
            return (date as { toDate: () => Date }).toDate().getTime()
          }
          return 0
        }
        return getTime(b.createdAt) - getTime(a.createdAt)
      }))
    } catch (error) {
      console.error('Error loading educational goals:', error)
    } finally {
      setLoading(false)
    }
  }

  const createGoal = async () => {
    if (!user || !newGoal.title.trim()) return
    setSaving(true)
    try {
      const goalId = `edu_${Date.now()}`
      const goal: Omit<EducationalGoal, 'id'> = {
        userId: user.uid,
        title: newGoal.title.trim(),
        description: newGoal.description.trim() || undefined,
        goalType: newGoal.goalType,
        targetDate: newGoal.targetDate || undefined,
        institution: newGoal.institution.trim() || undefined,
        status: 'not-started',
        progress: 0,
        milestones: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      await setDoc(doc(db, 'educationalGoals', goalId), {
        ...goal,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
      setGoals([{ id: goalId, ...goal }, ...goals])
      setNewGoal({
        title: '',
        description: '',
        goalType: 'course',
        targetDate: '',
        institution: '',
      })
      setShowAddForm(false)
    } catch (error) {
      console.error('Error creating goal:', error)
    } finally {
      setSaving(false)
    }
  }

  const updateGoal = async (goalId: string, updates: Partial<EducationalGoal>) => {
    if (!user) return
    setSaving(true)
    try {
      await setDoc(doc(db, 'educationalGoals', goalId), {
        ...updates,
        updatedAt: serverTimestamp(),
      }, { merge: true })
      setGoals(goals.map(g => g.id === goalId ? { ...g, ...updates } : g))
    } catch (error) {
      console.error('Error updating goal:', error)
    } finally {
      setSaving(false)
    }
  }

  const deleteGoal = async (goalId: string) => {
    if (!confirm('Delete this educational goal?')) return
    try {
      await deleteDoc(doc(db, 'educationalGoals', goalId))
      setGoals(goals.filter(g => g.id !== goalId))
    } catch (error) {
      console.error('Error deleting goal:', error)
    }
  }

  const addMilestone = async (goalId: string) => {
    if (!newMilestone.trim()) return
    const goal = goals.find(g => g.id === goalId)
    if (!goal) return

    const milestone = {
      id: `ms_${Date.now()}`,
      title: newMilestone.trim(),
      completed: false,
    }
    await updateGoal(goalId, {
      milestones: [...(goal.milestones || []), milestone]
    })
    setNewMilestone('')
  }

  const toggleMilestone = async (goalId: string, milestoneId: string) => {
    const goal = goals.find(g => g.id === goalId)
    if (!goal || !goal.milestones) return

    const newMilestones = goal.milestones.map(ms =>
      ms.id === milestoneId
        ? { ...ms, completed: !ms.completed, completedDate: !ms.completed ? new Date().toISOString() : undefined }
        : ms
    )

    // Calculate progress
    const completedCount = newMilestones.filter(ms => ms.completed).length
    const progress = newMilestones.length > 0 ? Math.round((completedCount / newMilestones.length) * 100) : 0

    // Check if all milestones complete
    const allComplete = newMilestones.length > 0 && newMilestones.every(ms => ms.completed)

    await updateGoal(goalId, {
      milestones: newMilestones,
      progress,
      status: allComplete ? 'completed' : goal.status === 'not-started' ? 'in-progress' : goal.status,
    })
  }

  const removeMilestone = async (goalId: string, milestoneId: string) => {
    const goal = goals.find(g => g.id === goalId)
    if (!goal || !goal.milestones) return

    await updateGoal(goalId, {
      milestones: goal.milestones.filter(ms => ms.id !== milestoneId)
    })
  }

  const completedGoals = goals.filter(g => g.status === 'completed').length
  const inProgressGoals = goals.filter(g => g.status === 'in-progress').length

  return (
    <ResponsiveModal
      open={isOpen}
      onOpenChange={(open) => !open && onClose()}
      desktopSize="lg"
    >
      <div className="flex flex-col h-full bg-white">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-green-700 text-white p-4 shrink-0 relative overflow-hidden">
          {/* Decorative illustration */}
          <div className="absolute right-0 top-1/2 -translate-y-1/2 opacity-15 pointer-events-none">
            <Illustration name="education" size="md" />
          </div>
          <div className="flex items-center justify-between relative z-10">
            <div>
              <h2 className="text-xl font-bold">Educational Goals</h2>
              <p className="text-emerald-100 text-sm">Track your learning journey</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Stats */}
          <div className="mt-4 grid grid-cols-3 gap-4 relative z-10">
            <div className="text-center bg-white/10 rounded-lg p-2">
              <div className="text-2xl font-bold">{goals.length}</div>
              <div className="text-emerald-200 text-xs">Total Goals</div>
            </div>
            <div className="text-center bg-white/10 rounded-lg p-2">
              <div className="text-2xl font-bold">{inProgressGoals}</div>
              <div className="text-emerald-200 text-xs">In Progress</div>
            </div>
            <div className="text-center bg-white/10 rounded-lg p-2">
              <div className="text-2xl font-bold">{completedGoals}</div>
              <div className="text-emerald-200 text-xs">Completed</div>
            </div>
          </div>
        </div>

        {/* Content */}
        <ScrollArea className="flex-1">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="p-4 space-y-4">
              {/* Add Goal Button */}
              {!showAddForm && (
                <Button
                  className="w-full"
                  onClick={() => setShowAddForm(true)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Educational Goal
                </Button>
              )}

              {/* Add Goal Form */}
              {showAddForm && (
                <div className="bg-emerald-50 rounded-lg p-4 space-y-3">
                  <h4 className="font-medium flex items-center gap-2">
                    <GraduationCap className="w-4 h-4" />
                    New Educational Goal
                  </h4>

                  <div>
                    <Label>Goal Title *</Label>
                    <Input
                      value={newGoal.title}
                      onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                      placeholder="e.g., Complete Bachelor's Degree"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label>Type</Label>
                    <div className="grid grid-cols-5 gap-2 mt-1">
                      {EDUCATIONAL_GOAL_TYPES.map(type => {
                        const Icon = GOAL_ICONS[type.id]
                        return (
                          <button
                            key={type.id}
                            onClick={() => setNewGoal({ ...newGoal, goalType: type.id as EducationalGoal['goalType'] })}
                            className={`flex flex-col items-center gap-1 p-2 rounded-lg border text-xs ${
                              newGoal.goalType === type.id
                                ? 'border-emerald-500 bg-emerald-100 text-emerald-700'
                                : 'border-gray-200 hover:bg-gray-50'
                            }`}
                          >
                            <Icon className="w-4 h-4" />
                            <span>{type.name.split('/')[0]}</span>
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  <div>
                    <Label>Institution (optional)</Label>
                    <Input
                      value={newGoal.institution}
                      onChange={(e) => setNewGoal({ ...newGoal, institution: e.target.value })}
                      placeholder="e.g., University name, platform"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label>Target Date (optional)</Label>
                    <Input
                      type="date"
                      value={newGoal.targetDate}
                      onChange={(e) => setNewGoal({ ...newGoal, targetDate: e.target.value })}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label>Description (optional)</Label>
                    <Textarea
                      value={newGoal.description}
                      onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                      placeholder="Add details about this goal..."
                      className="mt-1"
                      rows={2}
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={createGoal} disabled={!newGoal.title.trim() || saving}>
                      <Save className="w-4 h-4 mr-1" />
                      Create Goal
                    </Button>
                    <Button variant="outline" onClick={() => setShowAddForm(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              {/* Goals List */}
              {goals.length === 0 && !showAddForm ? (
                <div className="text-center py-12 text-gray-500">
                  <GraduationCap className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>No educational goals yet</p>
                  <p className="text-sm">Add your first goal to start tracking!</p>
                </div>
              ) : (
                goals.map(goal => {
                  const Icon = GOAL_ICONS[goal.goalType] || Star
                  const isExpanded = expandedGoal === goal.id
                  const statusColor = STATUS_COLORS[goal.status] || STATUS_COLORS['not-started']

                  return (
                    <div
                      key={goal.id}
                      className={`border rounded-lg overflow-hidden ${
                        goal.status === 'completed' ? 'border-green-200' : 'border-gray-200'
                      }`}
                    >
                      <button
                        onClick={() => setExpandedGoal(isExpanded ? null : goal.id || null)}
                        className="w-full flex items-center gap-3 p-3 text-left hover:bg-gray-50"
                      >
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          goal.status === 'completed' ? 'bg-green-100 text-green-600' : 'bg-emerald-100 text-emerald-600'
                        }`}>
                          {goal.status === 'completed' ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{goal.title}</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${statusColor.bg} ${statusColor.text}`}>
                              {goal.status.replace('-', ' ')}
                            </span>
                          </div>
                          {goal.institution && (
                            <p className="text-xs text-gray-500">{goal.institution}</p>
                          )}
                          {goal.progress !== undefined && goal.progress > 0 && (
                            <div className="mt-1">
                              <Progress value={goal.progress} className="h-1.5" />
                            </div>
                          )}
                        </div>
                        {isExpanded ? (
                          <ChevronDown className="w-5 h-5 text-gray-400" />
                        ) : (
                          <ChevronRight className="w-5 h-5 text-gray-400" />
                        )}
                      </button>

                      {isExpanded && (
                        <div className="px-4 pb-4 border-t bg-gray-50 space-y-4">
                          {/* Goal Info */}
                          {goal.description && (
                            <p className="text-sm text-gray-600 pt-3">{goal.description}</p>
                          )}

                          <div className="flex flex-wrap gap-2 text-sm">
                            {goal.targetDate && (
                              <span className="flex items-center gap-1 bg-blue-100 text-blue-700 px-2 py-1 rounded">
                                <Calendar className="w-3 h-3" />
                                Target: {new Date(goal.targetDate).toLocaleDateString()}
                              </span>
                            )}
                            <span className="flex items-center gap-1 bg-gray-100 text-gray-700 px-2 py-1 rounded">
                              <Target className="w-3 h-3" />
                              {goal.milestones?.length || 0} milestones
                            </span>
                          </div>

                          {/* Status Update */}
                          <div>
                            <Label className="text-sm">Status</Label>
                            <div className="flex gap-2 mt-1">
                              {(['not-started', 'in-progress', 'paused', 'completed'] as const).map(status => (
                                <button
                                  key={status}
                                  onClick={() => goal.id && updateGoal(goal.id, { status })}
                                  className={`px-3 py-1 rounded text-xs font-medium ${
                                    goal.status === status
                                      ? `${STATUS_COLORS[status].bg} ${STATUS_COLORS[status].text}`
                                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                                  }`}
                                >
                                  {status.replace('-', ' ')}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Milestones */}
                          <div>
                            <Label className="text-sm">Milestones</Label>
                            {goal.milestones && goal.milestones.length > 0 && (
                              <ul className="mt-2 space-y-1">
                                {goal.milestones.map(ms => (
                                  <li key={ms.id} className="flex items-center gap-2 bg-white p-2 rounded">
                                    <button
                                      onClick={() => goal.id && toggleMilestone(goal.id, ms.id)}
                                      className={`w-5 h-5 rounded flex items-center justify-center ${
                                        ms.completed ? 'bg-green-500 text-white' : 'border border-gray-300'
                                      }`}
                                    >
                                      {ms.completed && <Check className="w-3 h-3" />}
                                    </button>
                                    <span className={`flex-1 text-sm ${ms.completed ? 'line-through text-gray-400' : ''}`}>
                                      {ms.title}
                                    </span>
                                    <button
                                      onClick={() => goal.id && removeMilestone(goal.id, ms.id)}
                                      className="text-gray-400 hover:text-red-500"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  </li>
                                ))}
                              </ul>
                            )}
                            <div className="flex gap-2 mt-2">
                              <Input
                                value={editingGoal === goal.id ? newMilestone : ''}
                                onChange={(e) => {
                                  setEditingGoal(goal.id || null)
                                  setNewMilestone(e.target.value)
                                }}
                                onFocus={() => setEditingGoal(goal.id || null)}
                                placeholder="Add a milestone..."
                                className="flex-1"
                                onKeyDown={(e) => e.key === 'Enter' && goal.id && addMilestone(goal.id)}
                              />
                              <Button
                                size="sm"
                                onClick={() => goal.id && addMilestone(goal.id)}
                                disabled={!newMilestone.trim() || editingGoal !== goal.id}
                              >
                                <Plus className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>

                          {/* Delete */}
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:bg-red-50"
                            onClick={() => goal.id && deleteGoal(goal.id)}
                          >
                            <Trash2 className="w-3 h-3 mr-1" />
                            Delete Goal
                          </Button>
                        </div>
                      )}
                    </div>
                  )
                })
              )}

              {/* Suggested Milestones */}
              {goals.length > 0 && (
                <div className="bg-amber-50 rounded-lg p-4 mt-4">
                  <h4 className="font-medium text-amber-800 mb-2">Suggested Milestones</h4>
                  <div className="flex flex-wrap gap-2">
                    {EDUCATION_MILESTONES.map(ms => (
                      <span key={ms.id} className="bg-white text-amber-700 px-2 py-1 rounded text-xs">
                        {ms.title}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
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
