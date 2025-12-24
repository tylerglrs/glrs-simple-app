import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  Check,
  ChevronRight,
  ChevronDown,
  Brain,
  Target,
  Zap,
  Scale,
  Sparkles,
  Edit2,
  Save,
  Plus,
  Trash2,
  ArrowRight,
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
import { cn } from '@/lib/utils'
import { Illustration } from '@/components/common/Illustration'
import {
  SMART_POINTS,
  SMART_STAGES,
  type SmartRecoveryProgress,
  type SmartStage,
  type CostBenefitAnalysis,
} from '../types/recovery'

interface SmartRecoveryModalProps {
  isOpen: boolean
  onClose: () => void
}

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: 'easeOut' as const }
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: { duration: 0.2, ease: 'easeIn' as const }
  }
}

const staggerChildren = {
  visible: {
    transition: {
      staggerChildren: 0.05
    }
  }
}

export function SmartRecoveryModal({ isOpen, onClose }: SmartRecoveryModalProps) {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)

  const [saving, setSaving] = useState(false)
  const [expandedPoint, setExpandedPoint] = useState<number | null>(null)
  const [activeTab, setActiveTab] = useState<'4point' | 'stages' | 'cba' | 'plan'>('4point')

  const [progress, setProgress] = useState<Partial<SmartRecoveryProgress>>({
    currentStage: 'contemplation',
    pointsProgress: {},
    costBenefitAnalysis: {
      costsOfUsing: [],
      benefitsOfUsing: [],
      costsOfNotUsing: [],
      benefitsOfNotUsing: [],
    },
    changePlan: {
      changesWanted: '',
      reasonsForChange: '',
      stepsToTake: [],
      support: [],
      obstacles: [],
    },
  })

  const [newItem, setNewItem] = useState('')
  const [editingField, setEditingField] = useState<string | null>(null)

  useEffect(() => {
    if (!isOpen || !user) return

    setLoading(true)
    const docRef = doc(db, 'smartRecoveryProgress', user.uid)

    const unsubscribe = onSnapshot(
      docRef,
      (docSnap) => {
        if (docSnap.exists()) {
          setProgress(docSnap.data() as SmartRecoveryProgress)
        }
        setLoading(false)
      },
      (error) => {
        console.error('Error loading SMART progress:', error)
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [isOpen, user])

  const saveProgress = async (updates: Partial<SmartRecoveryProgress>) => {
    if (!user) return
    setSaving(true)
    try {
      const docRef = doc(db, 'smartRecoveryProgress', user.uid)
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

  const toggleToolUsed = async (pointNum: number, tool: string) => {
    const pointProgress = progress.pointsProgress?.[pointNum] || { toolsUsed: [], notes: '' }
    let newTools: string[]
    if (pointProgress.toolsUsed.includes(tool)) {
      newTools = pointProgress.toolsUsed.filter(t => t !== tool)
    } else {
      newTools = [...pointProgress.toolsUsed, tool]
    }
    await saveProgress({
      pointsProgress: {
        ...progress.pointsProgress,
        [pointNum]: { ...pointProgress, toolsUsed: newTools }
      }
    })
  }

  const addToCBA = async (field: keyof CostBenefitAnalysis) => {
    if (!newItem.trim()) return
    const cba = progress.costBenefitAnalysis || {
      costsOfUsing: [],
      benefitsOfUsing: [],
      costsOfNotUsing: [],
      benefitsOfNotUsing: [],
    }
    await saveProgress({
      costBenefitAnalysis: {
        ...cba,
        [field]: [...(cba[field] || []), newItem.trim()]
      }
    })
    setNewItem('')
  }

  const removeFromCBA = async (field: keyof CostBenefitAnalysis, index: number) => {
    const cba = progress.costBenefitAnalysis || {
      costsOfUsing: [],
      benefitsOfUsing: [],
      costsOfNotUsing: [],
      benefitsOfNotUsing: [],
    }
    await saveProgress({
      costBenefitAnalysis: {
        ...cba,
        [field]: (cba[field] || []).filter((_: string, i: number) => i !== index)
      }
    })
  }

  const addToChangePlan = async (field: 'stepsToTake' | 'support' | 'obstacles') => {
    if (!newItem.trim()) return
    const plan = progress.changePlan || {
      changesWanted: '',
      reasonsForChange: '',
      stepsToTake: [],
      support: [],
      obstacles: [],
    }
    await saveProgress({
      changePlan: {
        ...plan,
        [field]: [...(plan[field] || []), newItem.trim()]
      }
    })
    setNewItem('')
  }

  const currentStageIndex = SMART_STAGES.findIndex(s => s.id === progress.currentStage)
  const toolsUsedCount = Object.values(progress.pointsProgress || {})
    .reduce((sum, p) => sum + (p.toolsUsed?.length || 0), 0)

  return (
    <ResponsiveModal
      open={isOpen}
      onOpenChange={(open) => !open && onClose()}
      desktopSize="lg"
    >
      <div className="flex flex-col h-full bg-white">
        {/* Header */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          className="bg-gradient-to-r from-green-600 via-green-500 to-emerald-600 text-white p-6 flex-shrink-0 relative overflow-hidden"
        >
          {/* Decorative illustration */}
          <div className="absolute right-0 top-1/2 -translate-y-1/2 opacity-15 pointer-events-none">
            <Illustration name="growth" size="md" />
          </div>
          <div className="flex items-center justify-between mb-4 relative z-10">
            <div>
              <h2 className="font-bold text-xl md:text-2xl">
                SMART Recovery
              </h2>
              <p className="text-green-100 text-xs md:text-sm">
                Self-Management and Recovery Training
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-white hover:bg-white/20"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Stage indicator */}
          <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
            <div className="flex justify-between items-center mb-2">
              <span className="text-green-100 text-xs md:text-sm">
                Current Stage
              </span>
              <span className="font-bold text-sm md:text-base">
                {SMART_STAGES.find(s => s.id === progress.currentStage)?.name}
              </span>
            </div>
            <div className="flex gap-1">
              {SMART_STAGES.map((stage, idx) => (
                <div
                  key={stage.id}
                  className={cn(
                    "flex-1 h-2 rounded-full transition-all duration-300",
                    idx <= currentStageIndex ? 'bg-white' : 'bg-white/30'
                  )}
                />
              ))}
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mt-4">
            {[
              { id: '4point', label: '4-Point', icon: Target },
              { id: 'stages', label: 'Stages', icon: ArrowRight },
              { id: 'cba', label: 'CBA', icon: Scale },
              { id: 'plan', label: 'Plan', icon: Zap },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all",
                  activeTab === tab.id
                    ? 'bg-white text-green-600 shadow-lg'
                    : 'text-white/80 hover:bg-white/20'
                )}
              >
                <tab.icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Content */}
        <ScrollArea className="flex-1">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="p-4 space-y-3 md:space-y-4">
              {/* 4-Point Program Tab */}
              <AnimatePresence mode="wait">
                {activeTab === '4point' && (
                  <motion.div
                    key="4point"
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    variants={fadeInUp}
                    className="space-y-3"
                  >
                    <div className="bg-green-50 rounded-lg p-4">
                      <h4 className="font-medium text-green-800 mb-2 flex items-center gap-2">
                        <Brain className="w-4 h-4" />
                        The 4-Point Program
                      </h4>
                      <p className="text-green-700 text-xs md:text-sm">
                        SMART Recovery uses science-based tools from Cognitive Behavioral Therapy (CBT)
                        and Motivational Interviewing. You've used {toolsUsedCount} tools so far!
                      </p>
                    </div>

                    <motion.div variants={staggerChildren} className="space-y-3">
                      {SMART_POINTS.map(point => {
                        const pointProgress = progress.pointsProgress?.[point.number] || { toolsUsed: [], notes: '' }
                        const isExpanded = expandedPoint === point.number

                        return (
                          <motion.div
                            key={point.number}
                            variants={fadeInUp}
                            className="border rounded-lg overflow-hidden shadow-sm"
                          >
                            <button
                              onClick={() => setExpandedPoint(isExpanded ? null : point.number)}
                              className="w-full flex items-center gap-3 p-3 text-left hover:bg-gray-50 transition-colors"
                            >
                              <div className="w-10 h-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center font-bold flex-shrink-0">
                                {point.number}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-sm md:text-base">
                                  {point.title}
                                </h4>
                                <p className="text-xs text-gray-500">
                                  {pointProgress.toolsUsed.length}/{point.tools.length} tools used
                                </p>
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
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: 'auto', opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.2 }}
                                  className="overflow-hidden"
                                >
                                  <div className="px-4 pb-4 border-t bg-gray-50">
                                    <p className="text-gray-600 py-3 text-xs md:text-sm">
                                      {point.description}
                                    </p>

                                    <h5 className="text-sm font-medium mb-2">Tools</h5>
                                    <div className="space-y-2">
                                      {point.tools.map((tool, idx) => {
                                        const isUsed = pointProgress.toolsUsed.includes(tool)
                                        return (
                                          <button
                                            key={idx}
                                            onClick={() => toggleToolUsed(point.number, tool)}
                                            className={cn(
                                              "w-full flex items-center gap-3 p-2 rounded-lg border text-left transition-all",
                                              isUsed
                                                ? 'border-green-200 bg-green-50'
                                                : 'border-gray-200 bg-white hover:bg-gray-50'
                                            )}
                                          >
                                            <div className={cn(
                                              "w-6 h-6 rounded-full flex items-center justify-center transition-all flex-shrink-0",
                                              isUsed ? 'bg-green-500 text-white' : 'bg-gray-200'
                                            )}>
                                              {isUsed && <Check className="w-4 h-4" />}
                                            </div>
                                            <span className={cn(
                                              "text-xs md:text-sm",
                                              isUsed ? 'text-green-700 font-medium' : ''
                                            )}>
                                              {tool}
                                            </span>
                                          </button>
                                        )
                                      })}
                                    </div>
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </motion.div>
                        )
                      })}
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Stages of Change Tab */}
              <AnimatePresence mode="wait">
                {activeTab === 'stages' && (
                  <motion.div
                    key="stages"
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    variants={fadeInUp}
                    className="space-y-4"
                  >
                    <div className="bg-purple-50 rounded-lg p-4">
                      <h4 className="font-medium text-purple-800 mb-2">Stages of Change</h4>
                      <p className="text-purple-700 text-xs md:text-sm">
                        The Transtheoretical Model helps you understand where you are in your recovery journey.
                        Select your current stage below.
                      </p>
                    </div>

                    <motion.div variants={staggerChildren} className="space-y-3">
                      {SMART_STAGES.map((stage, idx) => {
                        const isCurrent = progress.currentStage === stage.id
                        const isPast = idx < currentStageIndex

                        return (
                          <motion.button
                            key={stage.id}
                            variants={fadeInUp}
                            onClick={() => saveProgress({ currentStage: stage.id as SmartStage })}
                            className={cn(
                              "w-full flex items-center gap-4 p-4 rounded-lg border text-left transition-all",
                              isCurrent
                                ? 'border-purple-500 bg-purple-50 ring-2 ring-purple-200'
                                : isPast
                                  ? 'border-green-200 bg-green-50'
                                  : 'border-gray-200 hover:border-gray-300'
                            )}
                          >
                            <div className={cn(
                              "w-10 h-10 rounded-full flex items-center justify-center font-bold flex-shrink-0",
                              isCurrent
                                ? 'bg-purple-500 text-white'
                                : isPast
                                  ? 'bg-green-500 text-white'
                                  : 'bg-gray-200'
                            )}>
                              {isPast ? <Check className="w-5 h-5" /> : idx + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className={cn(
                                "font-medium text-sm md:text-base",
                                isCurrent ? 'text-purple-700' : ''
                              )}>
                                {stage.name}
                              </h4>
                              <p className="text-gray-600 text-xs md:text-sm">
                                {stage.description}
                              </p>
                            </div>
                            {isCurrent && (
                              <span className="text-xs bg-purple-500 text-white px-2 py-1 rounded-full flex-shrink-0">
                                Current
                              </span>
                            )}
                          </motion.button>
                        )
                      })}
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Cost-Benefit Analysis Tab */}
              <AnimatePresence mode="wait">
                {activeTab === 'cba' && (
                  <motion.div
                    key="cba"
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    variants={fadeInUp}
                    className="space-y-4"
                  >
                    <div className="bg-amber-50 rounded-lg p-4">
                      <h4 className="font-medium text-amber-800 mb-2 flex items-center gap-2">
                        <Scale className="w-4 h-4" />
                        Cost-Benefit Analysis
                      </h4>
                      <p className="text-amber-700 text-xs md:text-sm">
                        Weigh the pros and cons of using vs. not using to build motivation for change.
                      </p>
                    </div>

                    <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                      {/* Costs of Using */}
                      <div className="bg-red-50 rounded-lg p-3">
                        <h5 className="font-medium text-red-700 mb-2 text-sm">Costs of Using</h5>
                        <ul className="space-y-1 mb-2">
                          {(progress.costBenefitAnalysis?.costsOfUsing || []).map((item, idx) => (
                            <li key={idx} className="flex items-center gap-1 text-sm">
                              <span className="flex-1">{item}</span>
                              <button
                                onClick={() => removeFromCBA('costsOfUsing', idx)}
                                className="text-red-400 hover:text-red-600"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </li>
                          ))}
                        </ul>
                        {editingField === 'costsOfUsing' ? (
                          <div className="flex gap-1">
                            <Input
                              value={newItem}
                              onChange={(e) => setNewItem(e.target.value)}
                              placeholder="Add..."
                              className="text-sm h-8"
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') addToCBA('costsOfUsing')
                              }}
                            />
                            <Button size="sm" className="h-8" onClick={() => addToCBA('costsOfUsing')}>
                              <Plus className="w-3 h-3" />
                            </Button>
                          </div>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-full text-red-600 hover:text-red-700 hover:bg-red-100"
                            onClick={() => setEditingField('costsOfUsing')}
                          >
                            <Plus className="w-3 h-3 mr-1" /> Add
                          </Button>
                        )}
                      </div>

                      {/* Benefits of Using */}
                      <div className="bg-orange-50 rounded-lg p-3">
                        <h5 className="font-medium text-orange-700 mb-2 text-sm">Benefits of Using</h5>
                        <ul className="space-y-1 mb-2">
                          {(progress.costBenefitAnalysis?.benefitsOfUsing || []).map((item, idx) => (
                            <li key={idx} className="flex items-center gap-1 text-sm">
                              <span className="flex-1">{item}</span>
                              <button
                                onClick={() => removeFromCBA('benefitsOfUsing', idx)}
                                className="text-orange-400 hover:text-orange-600"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </li>
                          ))}
                        </ul>
                        {editingField === 'benefitsOfUsing' ? (
                          <div className="flex gap-1">
                            <Input
                              value={newItem}
                              onChange={(e) => setNewItem(e.target.value)}
                              placeholder="Add..."
                              className="text-sm h-8"
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') addToCBA('benefitsOfUsing')
                              }}
                            />
                            <Button size="sm" className="h-8" onClick={() => addToCBA('benefitsOfUsing')}>
                              <Plus className="w-3 h-3" />
                            </Button>
                          </div>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-full text-orange-600 hover:text-orange-700 hover:bg-orange-100"
                            onClick={() => setEditingField('benefitsOfUsing')}
                          >
                            <Plus className="w-3 h-3 mr-1" /> Add
                          </Button>
                        )}
                      </div>

                      {/* Benefits of Not Using */}
                      <div className="bg-green-50 rounded-lg p-3">
                        <h5 className="font-medium text-green-700 mb-2 text-sm">Benefits of Not Using</h5>
                        <ul className="space-y-1 mb-2">
                          {(progress.costBenefitAnalysis?.benefitsOfNotUsing || []).map((item, idx) => (
                            <li key={idx} className="flex items-center gap-1 text-sm">
                              <span className="flex-1">{item}</span>
                              <button
                                onClick={() => removeFromCBA('benefitsOfNotUsing', idx)}
                                className="text-green-400 hover:text-green-600"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </li>
                          ))}
                        </ul>
                        {editingField === 'benefitsOfNotUsing' ? (
                          <div className="flex gap-1">
                            <Input
                              value={newItem}
                              onChange={(e) => setNewItem(e.target.value)}
                              placeholder="Add..."
                              className="text-sm h-8"
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') addToCBA('benefitsOfNotUsing')
                              }}
                            />
                            <Button size="sm" className="h-8" onClick={() => addToCBA('benefitsOfNotUsing')}>
                              <Plus className="w-3 h-3" />
                            </Button>
                          </div>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-full text-green-600 hover:text-green-700 hover:bg-green-100"
                            onClick={() => setEditingField('benefitsOfNotUsing')}
                          >
                            <Plus className="w-3 h-3 mr-1" /> Add
                          </Button>
                        )}
                      </div>

                      {/* Costs of Not Using */}
                      <div className="bg-blue-50 rounded-lg p-3">
                        <h5 className="font-medium text-blue-700 mb-2 text-sm">Costs of Not Using</h5>
                        <ul className="space-y-1 mb-2">
                          {(progress.costBenefitAnalysis?.costsOfNotUsing || []).map((item, idx) => (
                            <li key={idx} className="flex items-center gap-1 text-sm">
                              <span className="flex-1">{item}</span>
                              <button
                                onClick={() => removeFromCBA('costsOfNotUsing', idx)}
                                className="text-blue-400 hover:text-blue-600"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </li>
                          ))}
                        </ul>
                        {editingField === 'costsOfNotUsing' ? (
                          <div className="flex gap-1">
                            <Input
                              value={newItem}
                              onChange={(e) => setNewItem(e.target.value)}
                              placeholder="Add..."
                              className="text-sm h-8"
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') addToCBA('costsOfNotUsing')
                              }}
                            />
                            <Button size="sm" className="h-8" onClick={() => addToCBA('costsOfNotUsing')}>
                              <Plus className="w-3 h-3" />
                            </Button>
                          </div>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-full text-blue-600 hover:text-blue-700 hover:bg-blue-100"
                            onClick={() => setEditingField('costsOfNotUsing')}
                          >
                            <Plus className="w-3 h-3 mr-1" /> Add
                          </Button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Change Plan Tab */}
              <AnimatePresence mode="wait">
                {activeTab === 'plan' && (
                  <motion.div
                    key="plan"
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    variants={fadeInUp}
                    className="space-y-4"
                  >
                    <div className="bg-teal-50 rounded-lg p-4">
                      <h4 className="font-medium text-teal-800 mb-2 flex items-center gap-2">
                        <Zap className="w-4 h-4" />
                        Change Plan Worksheet
                      </h4>
                      <p className="text-teal-700 text-xs md:text-sm">
                        Create a concrete plan for making and maintaining changes.
                      </p>
                    </div>

                    <motion.div variants={staggerChildren} className="space-y-4">
                      <motion.div variants={fadeInUp}>
                        <Label>What changes do I want to make?</Label>
                        <Textarea
                          value={progress.changePlan?.changesWanted || ''}
                          onChange={(e) => saveProgress({
                            changePlan: {
                              ...(progress.changePlan || { reasonsForChange: '', stepsToTake: [], support: [], obstacles: [] }),
                              changesWanted: e.target.value
                            }
                          })}
                          placeholder="Describe the changes you want to make..."
                          className="mt-1"
                          rows={2}
                        />
                      </motion.div>

                      <motion.div variants={fadeInUp}>
                        <Label>Why do I want to make these changes?</Label>
                        <Textarea
                          value={progress.changePlan?.reasonsForChange || ''}
                          onChange={(e) => saveProgress({
                            changePlan: {
                              ...(progress.changePlan || { changesWanted: '', stepsToTake: [], support: [], obstacles: [] }),
                              reasonsForChange: e.target.value
                            }
                          })}
                          placeholder="Your reasons for change..."
                          className="mt-1"
                          rows={2}
                        />
                      </motion.div>

                      <motion.div variants={fadeInUp}>
                        <Label>Steps I will take</Label>
                        <ul className="mt-2 space-y-1">
                          {(progress.changePlan?.stepsToTake || []).map((step, idx) => (
                            <li key={idx} className="flex items-center gap-2 bg-gray-50 p-2 rounded">
                              <span className="w-6 h-6 rounded-full bg-teal-100 text-teal-600 text-xs flex items-center justify-center flex-shrink-0">
                                {idx + 1}
                              </span>
                              <span className="flex-1 text-xs md:text-sm">
                                {step}
                              </span>
                            </li>
                          ))}
                        </ul>
                        <div className="flex gap-2 mt-2">
                          <Input
                            value={editingField === 'stepsToTake' ? newItem : ''}
                            onChange={(e) => {
                              setEditingField('stepsToTake')
                              setNewItem(e.target.value)
                            }}
                            onFocus={() => setEditingField('stepsToTake')}
                            placeholder="Add a step..."
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') addToChangePlan('stepsToTake')
                            }}
                          />
                          <Button onClick={() => addToChangePlan('stepsToTake')} disabled={!newItem.trim()}>
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                      </motion.div>

                      <motion.div variants={fadeInUp}>
                        <Label>People who can support me</Label>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {(progress.changePlan?.support || []).map((person, idx) => (
                            <span key={idx} className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs md:text-sm">
                              {person}
                            </span>
                          ))}
                        </div>
                        <div className="flex gap-2 mt-2">
                          <Input
                            value={editingField === 'support' ? newItem : ''}
                            onChange={(e) => {
                              setEditingField('support')
                              setNewItem(e.target.value)
                            }}
                            onFocus={() => setEditingField('support')}
                            placeholder="Add a supporter..."
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') addToChangePlan('support')
                            }}
                          />
                          <Button onClick={() => addToChangePlan('support')} disabled={!newItem.trim()}>
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                      </motion.div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </ScrollArea>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-3 md:p-4 border-t bg-gray-50 flex-shrink-0"
        >
          <Button
            variant="outline"
            className="w-full"
            onClick={onClose}
          >
            Close
          </Button>
        </motion.div>
      </div>
    </ResponsiveModal>
  )
}
