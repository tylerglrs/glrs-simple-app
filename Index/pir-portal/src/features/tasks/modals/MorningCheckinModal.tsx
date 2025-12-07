import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  EnhancedDialog,
  EnhancedDialogContent,
} from '@/components/ui/enhanced-dialog'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import {
  Sun,
  X,
  Loader2,
  CheckCircle,
  Smile,
  Flame,
  Brain,
  Moon,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Minus,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { db, auth } from '@/lib/firebase'
import { updateContextAfterMorningCheckin } from '@/lib/updateAIContext'
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  where,
  getDocs,
  Timestamp,
  updateDoc,
} from 'firebase/firestore'
import { checkInCelebration, haptics } from '@/lib/animations'

// =============================================================================
// TYPES
// =============================================================================

export interface MorningCheckinModalProps {
  onClose: () => void
  onComplete?: () => void
}

interface CheckInData {
  mood: number
  craving: number
  anxiety: number
  sleep: number
}

interface YesterdayData {
  mood?: number
  craving?: number
  anxiety?: number
  sleep?: number
}

// Comparison helpers
const getComparisonIcon = (current: number, previous: number | undefined, inverted = false) => {
  if (previous === undefined) return null
  const diff = current - previous
  if (Math.abs(diff) < 1) return { icon: Minus, color: 'text-gray-400', label: 'stable' }
  if (inverted) {
    // For craving/anxiety, lower is better
    return diff > 0
      ? { icon: TrendingUp, color: 'text-red-400', label: 'up' }
      : { icon: TrendingDown, color: 'text-green-400', label: 'down' }
  }
  // For mood/sleep, higher is better
  return diff > 0
    ? { icon: TrendingUp, color: 'text-green-400', label: 'up' }
    : { icon: TrendingDown, color: 'text-red-400', label: 'down' }
}

const getComparisonText = (current: number, previous: number | undefined, inverted = false) => {
  if (previous === undefined) return 'first check-in!'
  const diff = current - previous
  if (Math.abs(diff) < 1) return 'stable'
  const direction = diff > 0 ? 'up' : 'down'
  const magnitude = Math.abs(diff)
  if (inverted) {
    return diff < 0 ? `${magnitude} better!` : `${direction} ${magnitude}`
  }
  return diff > 0 ? `${magnitude} better!` : `${direction} ${magnitude}`
}

// =============================================================================
// ANIMATION VARIANTS
// =============================================================================

const stepVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 100 : -100,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
    transition: {
      type: 'spring' as const,
      stiffness: 300,
      damping: 30,
    },
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -100 : 100,
    opacity: 0,
    transition: { duration: 0.2 },
  }),
}

const iconBounce = {
  initial: { scale: 0.8, opacity: 0 },
  animate: {
    scale: 1,
    opacity: 1,
    transition: {
      type: 'spring' as const,
      stiffness: 400,
      damping: 15,
    },
  },
}

const pulseAnimation = {
  scale: [1, 1.05, 1],
  transition: {
    duration: 2,
    repeat: Infinity,
    ease: 'easeInOut' as const,
  },
}

// =============================================================================
// HELPERS
// =============================================================================

const getMoodEmoji = (value: number): string => {
  if (value <= 2) return '😢'
  if (value <= 4) return '😔'
  if (value <= 6) return '😐'
  if (value <= 8) return '🙂'
  return '😊'
}

const getMoodLabel = (value: number): string => {
  if (value <= 2) return 'Very Low'
  if (value <= 4) return 'Low'
  if (value <= 6) return 'Moderate'
  if (value <= 8) return 'Good'
  return 'Excellent'
}

const getCravingLabel = (value: number): string => {
  if (value <= 2) return 'None'
  if (value <= 4) return 'Mild'
  if (value <= 6) return 'Moderate'
  if (value <= 8) return 'Strong'
  return 'Intense'
}

const getAnxietyLabel = (value: number): string => {
  if (value <= 2) return 'Calm'
  if (value <= 4) return 'Slight'
  if (value <= 6) return 'Moderate'
  if (value <= 8) return 'High'
  return 'Severe'
}

const getSleepLabel = (value: number): string => {
  if (value <= 2) return 'Very Poor'
  if (value <= 4) return 'Poor'
  if (value <= 6) return 'Fair'
  if (value <= 8) return 'Good'
  return 'Excellent'
}

// Get slider track gradient based on metric type
const getSliderGradient = (key: string, _value: number) => {
  switch (key) {
    case 'mood':
      return `linear-gradient(90deg, #EF4444 0%, #EAB308 50%, #22C55E 100%)`
    case 'craving':
      return `linear-gradient(90deg, #22C55E 0%, #EAB308 50%, #EF4444 100%)`
    case 'anxiety':
      return `linear-gradient(90deg, #22C55E 0%, #EAB308 50%, #EF4444 100%)`
    case 'sleep':
      return `linear-gradient(90deg, #EF4444 0%, #EAB308 50%, #22C55E 100%)`
    default:
      return `linear-gradient(90deg, #14B8A6 0%, #14B8A6 100%)`
  }
}

// =============================================================================
// STEP CONFIGURATION
// =============================================================================

const steps = [
  {
    key: 'mood',
    title: 'How are you feeling?',
    subtitle: 'Rate your overall mood right now',
    icon: Smile,
    color: 'text-yellow-500',
    bgColor: 'bg-gradient-to-br from-yellow-100 to-amber-100',
    borderColor: 'border-yellow-200',
    getLabel: getMoodLabel,
    getEmoji: getMoodEmoji,
  },
  {
    key: 'craving',
    title: 'Any cravings?',
    subtitle: 'Rate your current craving intensity',
    icon: Flame,
    color: 'text-orange-500',
    bgColor: 'bg-gradient-to-br from-orange-100 to-red-100',
    borderColor: 'border-orange-200',
    getLabel: getCravingLabel,
    getEmoji: () => '🔥',
  },
  {
    key: 'anxiety',
    title: 'Anxiety level?',
    subtitle: 'How anxious or stressed do you feel?',
    icon: Brain,
    color: 'text-purple-500',
    bgColor: 'bg-gradient-to-br from-purple-100 to-violet-100',
    borderColor: 'border-purple-200',
    getLabel: getAnxietyLabel,
    getEmoji: () => '🧠',
  },
  {
    key: 'sleep',
    title: 'How did you sleep?',
    subtitle: "Rate last night's sleep quality",
    icon: Moon,
    color: 'text-indigo-500',
    bgColor: 'bg-gradient-to-br from-indigo-100 to-blue-100',
    borderColor: 'border-indigo-200',
    getLabel: getSleepLabel,
    getEmoji: () => '🌙',
  },
]

// =============================================================================
// COMPONENT
// =============================================================================

export function MorningCheckinModal({ onClose, onComplete }: MorningCheckinModalProps) {
  const isMobile = useMediaQuery('(max-width: 768px)')
  const [[step, direction], setStep] = useState([0, 0])
  const [data, setData] = useState<CheckInData>({
    mood: 5,
    craving: 3,
    anxiety: 3,
    sleep: 5,
  })
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [yesterdayData, setYesterdayData] = useState<YesterdayData | null>(null)

  const currentStep = steps[step]
  const currentValue = data[currentStep.key as keyof CheckInData]
  const isLastStep = step === steps.length - 1

  const paginate = (newDirection: number) => {
    haptics.tap()
    setStep([step + newDirection, newDirection])
  }

  const handleSubmit = async () => {
    const userId = auth.currentUser?.uid
    if (!userId) return

    setSubmitting(true)
    haptics.tap()

    try {
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      // Fetch yesterday's data for comparison
      const yesterday = new Date(today)
      yesterday.setDate(yesterday.getDate() - 1)
      const yesterdayEnd = new Date(today)

      const yesterdayQuery = query(
        collection(db, 'checkIns'),
        where('userId', '==', userId),
        where('createdAt', '>=', Timestamp.fromDate(yesterday)),
        where('createdAt', '<', Timestamp.fromDate(yesterdayEnd))
      )
      const yesterdayDocs = await getDocs(yesterdayQuery)

      if (!yesterdayDocs.empty) {
        const yesterdayDoc = yesterdayDocs.docs[0].data()
        const morningData = yesterdayDoc.morningData || {}
        setYesterdayData({
          mood: morningData.mood ?? yesterdayDoc.mood,
          craving: morningData.craving ?? yesterdayDoc.craving,
          anxiety: morningData.anxiety ?? yesterdayDoc.anxiety,
          sleep: morningData.sleep ?? yesterdayDoc.sleep,
        })
      }

      const existingQuery = query(
        collection(db, 'checkIns'),
        where('userId', '==', userId),
        where('createdAt', '>=', Timestamp.fromDate(today))
      )
      const existingDocs = await getDocs(existingQuery)

      if (existingDocs.empty) {
        await addDoc(collection(db, 'checkIns'), {
          userId,
          morningData: data,
          mood: data.mood,
          craving: data.craving,
          anxiety: data.anxiety,
          sleep: data.sleep,
          createdAt: serverTimestamp(),
        })
      } else {
        const docRef = existingDocs.docs[0].ref
        await updateDoc(docRef, {
          morningData: data,
          mood: data.mood,
          craving: data.craving,
          anxiety: data.anxiety,
          sleep: data.sleep,
        })
      }

      // Update AI context document
      await updateContextAfterMorningCheckin(userId, {
        mood: data.mood,
        craving: data.craving,
        anxiety: data.anxiety,
        sleep: data.sleep,
        energy: 5, // Default energy since not collected in morning check-in
      })

      setSubmitted(true)
      haptics.success()
      checkInCelebration()

      // No auto-close - user clicks Continue button to dismiss
    } catch (error) {
      console.error('Error saving check-in:', error)
      haptics.error()
    } finally {
      setSubmitting(false)
    }
  }

  // Success state with Today's Snapshot summary
  if (submitted) {
    const snapshotItems = [
      {
        key: 'mood',
        label: 'Mood',
        value: data.mood,
        icon: Smile,
        color: 'text-yellow-500',
        bgColor: 'bg-yellow-100',
        getLabel: getMoodLabel,
        inverted: false
      },
      {
        key: 'anxiety',
        label: 'Anxiety',
        value: data.anxiety,
        icon: Brain,
        color: 'text-purple-500',
        bgColor: 'bg-purple-100',
        getLabel: getAnxietyLabel,
        inverted: true
      },
      {
        key: 'craving',
        label: 'Craving',
        value: data.craving,
        icon: Flame,
        color: 'text-orange-500',
        bgColor: 'bg-orange-100',
        getLabel: getCravingLabel,
        inverted: true
      },
      {
        key: 'sleep',
        label: 'Sleep',
        value: data.sleep,
        icon: Moon,
        color: 'text-indigo-500',
        bgColor: 'bg-indigo-100',
        getLabel: getSleepLabel,
        inverted: false
      },
    ]

    return (
      <EnhancedDialog open onOpenChange={onClose}>
        <EnhancedDialogContent
          variant={isMobile ? 'fullscreen' : 'centered'}
          showCloseButton={false}
          className="p-0"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col h-full min-h-[500px] bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50"
          >
            {/* Header */}
            <div className="text-center pt-8 pb-4 px-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4"
              >
                <CheckCircle className="h-8 w-8 text-green-500" />
              </motion.div>
              <motion.h3
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-2xl font-bold text-foreground"
              >
                Check-in Complete!
              </motion.h3>
            </div>

            {/* Today's Snapshot */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex-1 px-6 pb-6"
            >
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-5 shadow-sm border border-green-100">
                <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4 flex items-center gap-2">
                  <Sun className="h-4 w-4 text-amber-500" />
                  Today's Snapshot
                </h4>

                <div className="space-y-3">
                  {snapshotItems.map((item, index) => {
                    const comparison = getComparisonIcon(
                      item.value,
                      yesterdayData?.[item.key as keyof YesterdayData],
                      item.inverted
                    )
                    const ComparisonIcon = comparison?.icon

                    return (
                      <motion.div
                        key={item.key}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 + index * 0.1 }}
                        className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
                      >
                        <div className="flex items-center gap-3">
                          <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', item.bgColor)}>
                            <item.icon className={cn('h-4 w-4', item.color)} />
                          </div>
                          <span className="font-medium text-gray-700">{item.label}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={cn('font-bold text-lg', item.color)}>
                            {item.value}/10
                          </span>
                          {ComparisonIcon && (
                            <div className={cn('flex items-center gap-1', comparison.color)}>
                              <ComparisonIcon className="h-4 w-4" />
                              <span className="text-xs font-medium">
                                {getComparisonText(
                                  item.value,
                                  yesterdayData?.[item.key as keyof YesterdayData],
                                  item.inverted
                                )}
                              </span>
                            </div>
                          )}
                          {!ComparisonIcon && yesterdayData === null && (
                            <span className="text-xs text-gray-400">first check-in!</span>
                          )}
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              </div>
            </motion.div>

            {/* Footer */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="px-6 pb-6"
            >
              <div className="flex items-center justify-center gap-2 text-sm text-gray-500 mb-4">
                <Sparkles className="h-4 w-4 text-yellow-500" />
                <span>Streak updated</span>
              </div>
              <Button
                onClick={() => {
                  onComplete?.()
                  onClose()
                }}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
              >
                Continue
              </Button>
            </motion.div>
          </motion.div>
        </EnhancedDialogContent>
      </EnhancedDialog>
    )
  }

  return (
    <EnhancedDialog open onOpenChange={onClose}>
      <EnhancedDialogContent
        variant={isMobile ? 'fullscreen' : 'centered'}
        showCloseButton={false}
        className="p-0 overflow-hidden"
      >
        {/* Header */}
        <div className="relative bg-gradient-to-r from-orange-400 via-amber-400 to-yellow-400 p-6 pb-8">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
          >
            <X className="h-5 w-5 text-white" />
          </button>

          {/* Sun illustration */}
          <div className="flex justify-center mb-4">
            <motion.div
              animate={pulseAnimation}
              className="w-20 h-20 rounded-full bg-white/30 flex items-center justify-center"
            >
              <Sun className="h-12 w-12 text-white" />
            </motion.div>
          </div>

          <h2 className="text-2xl font-bold text-white text-center">Morning Check-in</h2>
          <p className="text-white/80 text-center text-sm mt-1">Start your day with awareness</p>

          {/* Progress dots */}
          <div className="flex justify-center gap-2 mt-4">
            {steps.map((_, i) => (
              <motion.div
                key={i}
                initial={false}
                animate={{
                  scale: i === step ? 1.2 : 1,
                  backgroundColor:
                    i === step ? '#ffffff' : i < step ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.3)',
                }}
                className="w-2.5 h-2.5 rounded-full"
              />
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 overflow-hidden">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={step}
              custom={direction}
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="space-y-6"
            >
              {/* Step Icon */}
              <motion.div
                variants={iconBounce}
                initial="initial"
                animate="animate"
                className="flex justify-center"
              >
                <div
                  className={cn(
                    'w-20 h-20 rounded-2xl flex items-center justify-center border-2',
                    currentStep.bgColor,
                    currentStep.borderColor
                  )}
                >
                  <currentStep.icon className={cn('h-10 w-10', currentStep.color)} />
                </div>
              </motion.div>

              {/* Question */}
              <div className="text-center">
                <h3 className="text-xl font-semibold text-foreground mb-1">{currentStep.title}</h3>
                <p className="text-sm text-muted-foreground">{currentStep.subtitle}</p>
              </div>

              {/* Emoji & Value Display */}
              <div className="text-center py-4">
                <motion.span
                  key={currentValue}
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-6xl block mb-2"
                >
                  {currentStep.getEmoji(currentValue)}
                </motion.span>
                <motion.p
                  key={`label-${currentValue}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn('text-lg font-semibold', currentStep.color)}
                >
                  {currentStep.getLabel(currentValue)} ({currentValue}/10)
                </motion.p>
              </div>

              {/* Slider */}
              <div className="px-4 pb-4">
                <div className="relative">
                  <Slider
                    value={[currentValue]}
                    onValueChange={(value) => {
                      setData({ ...data, [currentStep.key]: value[0] })
                      haptics.tap()
                    }}
                    max={10}
                    min={0}
                    step={1}
                    className="w-full"
                  />
                  {/* Custom gradient track overlay */}
                  <div
                    className="absolute top-1/2 left-0 right-0 h-2 -translate-y-1/2 rounded-full pointer-events-none opacity-30"
                    style={{ background: getSliderGradient(currentStep.key, currentValue) }}
                  />
                </div>
                <div className="flex justify-between mt-3 text-xs text-muted-foreground">
                  <span>0</span>
                  <span>5</span>
                  <span>10</span>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer Navigation */}
        <div className="p-4 border-t bg-muted/30 flex justify-between items-center">
          <Button
            variant="ghost"
            onClick={() => paginate(-1)}
            disabled={step === 0}
            className="gap-1"
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </Button>

          <span className="text-sm text-muted-foreground">
            {step + 1} of {steps.length}
          </span>

          {isLastStep ? (
            <Button
              onClick={handleSubmit}
              disabled={submitting}
              className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 gap-1"
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  Submit
                  <CheckCircle className="h-4 w-4" />
                </>
              )}
            </Button>
          ) : (
            <Button onClick={() => paginate(1)} className="gap-1">
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </EnhancedDialogContent>
    </EnhancedDialog>
  )
}

export default MorningCheckinModal
