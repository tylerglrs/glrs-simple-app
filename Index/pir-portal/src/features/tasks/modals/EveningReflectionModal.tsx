import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ResponsiveModal } from '@/components/ui/responsive-modal'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { SinglePicker } from '../components/MoodSliders'
import {
  Moon,
  X,
  Loader2,
  CheckCircle,
  ChevronRight,
  ChevronLeft,
  MessageSquare,
  AlertCircle,
  Heart,
  Target,
  Stars,
  Sparkles,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { db, auth } from '@/lib/firebase'
import { updateContextAfterEveningCheckin } from '@/lib/updateAIContext'
import {
  collection,
  query,
  where,
  getDocs,
  Timestamp,
  updateDoc,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore'
import { celebrate, haptics } from '@/lib/animations'

// =============================================================================
// TYPES
// =============================================================================

export interface EveningReflectionModalProps {
  onClose: () => void
  onComplete?: () => void
}

interface ReflectionData {
  overallDay: number
  promptResponse: string
  challenges: string
  gratitude: string
  tomorrowGoal: string
}

// =============================================================================
// ANIMATION VARIANTS
// =============================================================================

const stepVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 80 : -80,
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
    x: direction > 0 ? -80 : 80,
    opacity: 0,
    transition: { duration: 0.2 },
  }),
}

const starVariants = {
  hidden: { opacity: 0, scale: 0 },
  visible: (i: number) => ({
    opacity: [0, 1, 0.5],
    scale: [0, 1, 0.8],
    transition: {
      delay: i * 0.2,
      duration: 2,
      repeat: Infinity,
      repeatType: 'reverse' as const,
    },
  }),
}

// =============================================================================
// HELPERS
// =============================================================================

const getOverallDayEmoji = (value: number): string => {
  if (value <= 2) return '😢'
  if (value <= 4) return '😔'
  if (value <= 6) return '😐'
  if (value <= 8) return '🙂'
  return '😊'
}

const getOverallDayLabel = (value: number): string => {
  if (value <= 2) return 'Difficult'
  if (value <= 4) return 'Challenging'
  if (value <= 6) return 'Okay'
  if (value <= 8) return 'Good'
  return 'Great'
}

// Daily reflection prompts
const reflectionPrompts = [
  "What challenged you today, and what did you learn from it?",
  "What moment today are you most grateful for?",
  "How did you practice self-care today?",
  "What made you proud of yourself today?",
  "What would you do differently if you could redo today?",
  "What did you accomplish today that moved you forward?",
  "What emotion did you feel most strongly today?",
  "How did you show kindness to yourself or others today?",
  "What boundary did you maintain or need to set?",
  "What gave you hope or strength today?",
]

// =============================================================================
// STEP CONFIGURATION
// =============================================================================

const getSteps = (todayPrompt: string) => [
  {
    key: 'overallDay',
    title: 'How was your day overall?',
    subtitle: 'Reflect on your day as a whole',
    type: 'slider' as const,
    icon: Moon,
    color: 'text-indigo-300',
    bgColor: 'bg-indigo-900/50',
  },
  {
    key: 'promptResponse',
    title: todayPrompt,
    subtitle: "Today's reflection prompt",
    type: 'textarea' as const,
    icon: MessageSquare,
    color: 'text-blue-300',
    bgColor: 'bg-blue-900/50',
    placeholder: 'Take a moment to reflect...',
  },
  {
    key: 'challenges',
    title: "Today's Challenges",
    subtitle: 'Acknowledge what was hard',
    type: 'textarea' as const,
    icon: AlertCircle,
    color: 'text-amber-300',
    bgColor: 'bg-amber-900/50',
    placeholder: 'What challenges did you face?',
  },
  {
    key: 'gratitude',
    title: "What I'm Grateful For",
    subtitle: 'End with appreciation',
    type: 'textarea' as const,
    icon: Heart,
    color: 'text-pink-300',
    bgColor: 'bg-pink-900/50',
    placeholder: 'What are you thankful for today?',
  },
  {
    key: 'tomorrowGoal',
    title: "Tomorrow's Intention",
    subtitle: 'Set yourself up for success',
    type: 'textarea' as const,
    icon: Target,
    color: 'text-emerald-300',
    bgColor: 'bg-emerald-900/50',
    placeholder: "What's one goal for tomorrow?",
  },
]

// =============================================================================
// COMPONENT
// =============================================================================

export function EveningReflectionModal({ onClose, onComplete }: EveningReflectionModalProps) {
  const [[step, direction], setStep] = useState([0, 0])
  const [data, setData] = useState<ReflectionData>({
    overallDay: 5,
    promptResponse: '',
    challenges: '',
    gratitude: '',
    tomorrowGoal: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  // Get today's prompt based on day of month
  const todayPrompt = reflectionPrompts[new Date().getDate() % reflectionPrompts.length]
  const steps = getSteps(todayPrompt)

  const currentStep = steps[step]
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

      const existingQuery = query(
        collection(db, 'checkIns'),
        where('userId', '==', userId),
        where('createdAt', '>=', Timestamp.fromDate(today))
      )
      const existingDocs = await getDocs(existingQuery)

      const eveningData = {
        overallDay: data.overallDay,
        promptResponse: data.promptResponse,
        challenges: data.challenges,
        gratitude: data.gratitude,
        tomorrowGoal: data.tomorrowGoal,
      }

      if (!existingDocs.empty) {
        const docRef = existingDocs.docs[0].ref
        await updateDoc(docRef, {
          eveningData,
          overallDay: data.overallDay,
        })
      } else {
        await addDoc(collection(db, 'checkIns'), {
          userId,
          eveningData,
          overallDay: data.overallDay,
          createdAt: serverTimestamp(),
        })
      }

      // Update AI context document
      await updateContextAfterEveningCheckin(userId, {
        overallDay: data.overallDay,
        gratitude: data.gratitude,
        tomorrowGoal: data.tomorrowGoal,
      })

      setSubmitted(true)
      haptics.success()
      celebrate()

      // No auto-close - user clicks Done button to dismiss
    } catch (error) {
      console.error('Error saving reflection:', error)
      haptics.error()
    } finally {
      setSubmitting(false)
    }
  }

  // Helper to truncate text with ellipsis
  const truncateText = (text: string, maxLength: number) => {
    if (!text || text.length <= maxLength) return text || 'Not provided'
    return text.substring(0, maxLength).trim() + '...'
  }

  // Success state with Tonight's Reflection summary
  if (submitted) {
    const summaryItems = [
      {
        key: 'overallDay',
        label: 'Day Rating',
        value: `${data.overallDay}/10`,
        sublabel: getOverallDayLabel(data.overallDay),
        icon: Moon,
        color: 'text-indigo-300',
        bgColor: 'bg-indigo-800/50',
        isRating: true
      },
      {
        key: 'promptResponse',
        label: 'Reflected on',
        value: truncateText(data.promptResponse, 60),
        icon: MessageSquare,
        color: 'text-blue-300',
        bgColor: 'bg-blue-900/50'
      },
      {
        key: 'gratitude',
        label: 'Gratitude',
        value: truncateText(data.gratitude, 60),
        icon: Heart,
        color: 'text-pink-300',
        bgColor: 'bg-pink-900/50'
      },
      {
        key: 'tomorrowGoal',
        label: 'Tomorrow',
        value: truncateText(data.tomorrowGoal, 60),
        icon: Target,
        color: 'text-emerald-300',
        bgColor: 'bg-emerald-900/50'
      },
    ]

    return (
      <ResponsiveModal open onOpenChange={onClose} showCloseButton={false} desktopSize="md">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col h-full min-h-[550px] relative overflow-hidden bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-900"
          >
            {/* Animated stars background */}
            {[...Array(12)].map((_, i) => (
              <motion.div
                key={i}
                custom={i}
                variants={starVariants}
                initial="hidden"
                animate="visible"
                className="absolute pointer-events-none"
                style={{
                  top: `${5 + Math.random() * 90}%`,
                  left: `${5 + Math.random() * 90}%`,
                }}
              >
                <Stars className="h-2 w-2 text-yellow-200/40" />
              </motion.div>
            ))}

            {/* Header */}
            <div className="text-center pt-8 pb-4 px-6 relative z-10">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                className="relative inline-block mb-4"
              >
                <div className="w-16 h-16 rounded-full bg-indigo-800/50 flex items-center justify-center border-2 border-indigo-400/30">
                  <Moon className="h-8 w-8 text-indigo-200" />
                </div>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3 }}
                  className="absolute -top-1 -right-1 bg-green-500 rounded-full p-1"
                >
                  <CheckCircle className="h-4 w-4 text-white" />
                </motion.div>
              </motion.div>
              <motion.h3
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-2xl font-bold text-white"
              >
                Reflection Complete!
              </motion.h3>
            </div>

            {/* Tonight's Reflection Summary */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex-1 px-5 pb-4 relative z-10 overflow-y-auto"
            >
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
                <h4 className="text-sm font-semibold text-indigo-300 uppercase tracking-wide mb-4 flex items-center gap-2">
                  <Stars className="h-4 w-4 text-yellow-300" />
                  Tonight's Reflection
                </h4>

                <div className="space-y-3">
                  {summaryItems.map((item, index) => (
                    <motion.div
                      key={item.key}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                      className="flex items-start gap-3 py-2 border-b border-white/10 last:border-0"
                    >
                      <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5', item.bgColor)}>
                        <item.icon className={cn('h-4 w-4', item.color)} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                          {item.label}
                        </span>
                        {item.isRating ? (
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-lg font-bold text-white">{item.value}</span>
                            <span className="text-sm text-indigo-300">({item.sublabel})</span>
                            <span className="text-xl ml-1">{getOverallDayEmoji(data.overallDay)}</span>
                          </div>
                        ) : (
                          <p className="text-sm text-white/90 mt-0.5 leading-relaxed">
                            {item.value}
                          </p>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Footer */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="px-5 pb-6 relative z-10"
            >
              <div className="flex items-center justify-center gap-2 text-sm text-indigo-300 mb-4">
                <Sparkles className="h-4 w-4" />
                <span>Reflection streak updated</span>
              </div>
              <Button
                onClick={() => {
                  onComplete?.()
                  onClose()
                }}
                className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white"
              >
                Done
              </Button>
            </motion.div>
          </motion.div>
      </ResponsiveModal>
    )
  }

  return (
    <ResponsiveModal open onOpenChange={onClose} showCloseButton={false} desktopSize="md" className="bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-900">
        {/* Header with night sky */}
        <div className="relative p-6 pb-8 overflow-hidden">
          {/* Animated stars */}
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              custom={i}
              variants={starVariants}
              initial="hidden"
              animate="visible"
              className="absolute"
              style={{
                top: `${10 + Math.random() * 60}%`,
                left: `${5 + Math.random() * 90}%`,
              }}
            >
              <Stars className="h-2 w-2 text-yellow-200/40" />
            </motion.div>
          ))}

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors z-10"
          >
            <X className="h-5 w-5 text-white/80" />
          </button>

          {/* Moon illustration */}
          <div className="flex justify-center mb-4">
            <motion.div
              animate={{
                y: [0, -5, 0],
                transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
              }}
              className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/30"
            >
              <Moon className="h-10 w-10 text-white" />
            </motion.div>
          </div>

          <h2 className="text-2xl font-bold text-white text-center">Evening Reflection</h2>
          <p className="text-indigo-200 text-center text-sm mt-1">End your day with intention</p>

          {/* Progress dots */}
          <div className="flex justify-center gap-2 mt-4">
            {steps.map((_, i) => (
              <motion.div
                key={i}
                initial={false}
                animate={{
                  scale: i === step ? 1.3 : 1,
                  backgroundColor:
                    i === step
                      ? 'rgba(165, 180, 252, 1)'
                      : i < step
                      ? 'rgba(165, 180, 252, 0.6)'
                      : 'rgba(255, 255, 255, 0.2)',
                }}
                className="w-2 h-2 rounded-full"
              />
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 overflow-y-auto">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={step}
              custom={direction}
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="space-y-5"
            >
              {/* Step Icon */}
              <div className="flex justify-center">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                  className={cn(
                    'w-16 h-16 rounded-xl flex items-center justify-center',
                    currentStep.bgColor
                  )}
                >
                  <currentStep.icon className={cn('h-8 w-8', currentStep.color)} />
                </motion.div>
              </div>

              {/* Question */}
              <div className="text-center">
                <h3 className="text-lg font-semibold text-white mb-1">{currentStep.title}</h3>
                <p className="text-sm text-indigo-200">{currentStep.subtitle}</p>
              </div>

              {/* Input based on type */}
              {currentStep.type === 'slider' ? (
                <div className="space-y-4 py-4">
                  {/* Emoji display */}
                  <div className="text-center mb-4">
                    <motion.span
                      key={data.overallDay}
                      initial={{ scale: 0.5 }}
                      animate={{ scale: 1 }}
                      className="text-5xl block mb-2"
                    >
                      {getOverallDayEmoji(data.overallDay)}
                    </motion.span>
                    <p className="text-lg font-medium text-indigo-200">
                      {getOverallDayLabel(data.overallDay)}
                    </p>
                  </div>
                  {/* Single Picker with evening theme - transparent card for modal */}
                  <div className="[&_.card]:bg-white/5 [&_.card]:border-white/10 [&_.card]:border-l-violet-400 [&_h3]:text-white [&_p]:text-indigo-200">
                    <SinglePicker
                      label="Day Rating"
                      description="Rate your overall day"
                      value={data.overallDay}
                      onChange={(value) => {
                        setData({ ...data, overallDay: value })
                        haptics.tap()
                      }}
                      lowLabel="Difficult"
                      highLabel="Great"
                      theme="evening"
                      inverted={false}
                      icon={Moon}
                    />
                  </div>
                </div>
              ) : (
                <div className="py-2">
                  <Textarea
                    value={data[currentStep.key as keyof ReflectionData] as string}
                    onChange={(e) =>
                      setData({ ...data, [currentStep.key]: e.target.value })
                    }
                    placeholder={currentStep.placeholder}
                    className={cn(
                      'min-h-[140px] text-base resize-none',
                      'bg-white/5 border-white/10 text-white placeholder:text-indigo-300/50',
                      'focus:border-indigo-400/50 focus:ring-indigo-400/20'
                    )}
                  />
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer Navigation */}
        <div className="p-4 border-t border-white/10 bg-slate-900/50 flex justify-between items-center">
          <Button
            variant="ghost"
            onClick={() => paginate(-1)}
            disabled={step === 0}
            className="gap-1 text-indigo-200 hover:text-white hover:bg-white/10"
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </Button>

          <span className="text-sm text-indigo-300">
            {step + 1} of {steps.length}
          </span>

          {isLastStep ? (
            <Button
              onClick={handleSubmit}
              disabled={submitting}
              className="gap-1 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white"
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  Complete
                  <CheckCircle className="h-4 w-4" />
                </>
              )}
            </Button>
          ) : (
            <Button
              onClick={() => paginate(1)}
              className="gap-1 bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}
        </div>
    </ResponsiveModal>
  )
}

export default EveningReflectionModal
