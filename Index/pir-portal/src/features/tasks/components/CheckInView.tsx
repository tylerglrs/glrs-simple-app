import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Sun,
  ChevronRight,
  ChevronLeft,
  Phone,
  CalendarCheck,
  Share2,
  Heart,
  Target,
  TrendingUp,
  TrendingDown,
  Minus,
  Loader2,
  Smile,
  Flame,
  Brain,
  Moon,
  Sparkles,
  Check,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import {
  GradientCard,
  TealGradientCard,
  AnimatedCounter,
  CircularProgress,
  MorningIllustration,
} from '@/components/common'
import {
  staggerContainer,
  staggerItem,
  haptics,
} from '@/lib/animations'
import { MoodSliders } from './MoodSliders'
import type { MorningCheckInData, CheckInStatus, WeeklyStats, StreakData } from '../hooks/useCheckInData'

// =============================================================================
// TYPES
// =============================================================================

export interface CheckInViewProps {
  checkInStatus: CheckInStatus
  checkInStreak: number
  checkInStreakData: StreakData
  weeklyStats: WeeklyStats | null
  onSubmit: (data: MorningCheckInData) => Promise<boolean>
  loading?: boolean
  onOpenModal?: (modal: string) => void
  onNavigate?: (view: 'checkin' | 'reflections' | 'overview' | 'golden') => void
  lastSubmittedData?: MorningCheckInData | null
  yesterdayCheckInData?: YesterdayData | null
}

// =============================================================================
// STEP INDICATOR
// =============================================================================

interface StepIndicatorProps {
  currentStep: number
  totalSteps: number
}

function StepIndicator({ currentStep, totalSteps }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-center gap-2 mb-4">
      {Array.from({ length: totalSteps }, (_, i) => (
        <div
          key={i}
          className={cn(
            'h-2 rounded-full transition-all duration-300',
            i + 1 === currentStep ? 'w-8 bg-teal-500' : 'w-2 bg-gray-200'
          )}
        />
      ))}
    </div>
  )
}

// =============================================================================
// HELPERS FOR COMPLETION STATE
// =============================================================================

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

interface YesterdayData {
  mood?: number
  craving?: number
  anxiety?: number
  sleep?: number
}

const getComparisonIcon = (current: number, previous: number | undefined, inverted = false) => {
  if (previous === undefined) return null
  const diff = current - previous
  if (Math.abs(diff) < 1) return { icon: Minus, color: 'text-white/60', label: 'stable' }
  if (inverted) {
    return diff > 0
      ? { icon: TrendingUp, color: 'text-red-300', label: 'up' }
      : { icon: TrendingDown, color: 'text-green-300', label: 'down' }
  }
  return diff > 0
    ? { icon: TrendingUp, color: 'text-green-300', label: 'up' }
    : { icon: TrendingDown, color: 'text-red-300', label: 'down' }
}

const getComparisonText = (current: number, previous: number | undefined, inverted = false) => {
  if (previous === undefined) return ''
  const diff = current - previous
  if (Math.abs(diff) < 1) return 'stable'
  const magnitude = Math.abs(diff)
  if (inverted) {
    return diff < 0 ? `${magnitude} better` : `+${magnitude}`
  }
  return diff > 0 ? `+${magnitude}` : `${magnitude} lower`
}

// =============================================================================
// COMPLETION STATE WITH TODAY'S SNAPSHOT
// =============================================================================

interface CompletionStateProps {
  onNavigateToReflection?: () => void
  submittedData?: MorningCheckInData | null
  yesterdayData?: YesterdayData | null
}

function CompletionState({ onNavigateToReflection, submittedData, yesterdayData }: CompletionStateProps) {
  const isMobile = useMediaQuery('(max-width: 768px)')

  const snapshotItems = submittedData ? [
    {
      key: 'mood',
      label: 'Mood',
      value: submittedData.mood ?? 0,
      icon: Smile,
      color: 'text-yellow-300',
      bgColor: 'bg-yellow-500/30',
      getLabel: getMoodLabel,
      inverted: false
    },
    {
      key: 'anxiety',
      label: 'Anxiety',
      value: submittedData.anxiety ?? 0,
      icon: Brain,
      color: 'text-purple-300',
      bgColor: 'bg-purple-500/30',
      getLabel: getAnxietyLabel,
      inverted: true
    },
    {
      key: 'craving',
      label: 'Craving',
      value: submittedData.craving ?? 0,
      icon: Flame,
      color: 'text-orange-300',
      bgColor: 'bg-orange-500/30',
      getLabel: getCravingLabel,
      inverted: true
    },
    {
      key: 'sleep',
      label: 'Sleep',
      value: submittedData.sleep ?? 0,
      icon: Moon,
      color: 'text-indigo-300',
      bgColor: 'bg-indigo-500/30',
      getLabel: getSleepLabel,
      inverted: false
    },
  ] : []

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring' as const, stiffness: 300, damping: 20 }}
    >
      <TealGradientCard className="overflow-hidden relative">
        {/* Decorative pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-white/30 -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full bg-white/20 translate-y-1/2 -translate-x-1/2" />
        </div>
        <CardContent className={cn('relative', isMobile ? 'py-6 px-4' : 'py-8 px-6')}>
          {/* Header */}
          <div className="text-center mb-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1, type: 'spring' as const, stiffness: 400 }}
              className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white shadow-lg mb-3"
            >
              <Check className="h-8 w-8 text-teal-600" />
            </motion.div>
            <h3 className={cn('font-bold text-white', isMobile ? 'text-lg' : 'text-xl')}>
              Check-in Complete!
            </h3>
          </div>

          {/* Today's Snapshot */}
          {submittedData && snapshotItems.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white/10 backdrop-blur-sm rounded-xl p-4 mb-4"
            >
              <h4 className="text-xs font-semibold text-white/80 uppercase tracking-wide mb-3 flex items-center gap-2">
                <Sun className="h-3.5 w-3.5 text-amber-300" />
                Today's Snapshot
              </h4>

              <div className="space-y-2">
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
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + index * 0.08 }}
                      className="flex items-center justify-between py-1.5"
                    >
                      <div className="flex items-center gap-2">
                        <div className={cn('w-7 h-7 rounded-lg flex items-center justify-center', item.bgColor)}>
                          <item.icon className={cn('h-4 w-4', item.color)} />
                        </div>
                        <span className="text-sm font-medium text-white/90">{item.label}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={cn('font-bold text-white', isMobile ? 'text-sm' : 'text-base')}>
                          {item.value}/10
                        </span>
                        {ComparisonIcon && (
                          <div className={cn('flex items-center gap-0.5', comparison.color)}>
                            <ComparisonIcon className="h-3.5 w-3.5" />
                            <span className="text-xs font-medium">
                              {getComparisonText(
                                item.value,
                                yesterdayData?.[item.key as keyof YesterdayData],
                                item.inverted
                              )}
                            </span>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </motion.div>
          )}

          {/* Streak indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex items-center justify-center gap-2 text-sm text-white/80 mb-4"
          >
            <Sparkles className="h-4 w-4 text-yellow-300" />
            <span>Streak updated</span>
          </motion.div>

          {/* Navigation to Evening Reflection */}
          {onNavigateToReflection && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Button
                variant="secondary"
                onClick={() => {
                  haptics.tap()
                  onNavigateToReflection()
                }}
                className={cn(
                  'w-full bg-white/20 hover:bg-white/30 text-white border-white/30',
                  'transition-all duration-200',
                  isMobile ? 'text-sm' : 'text-base'
                )}
              >
                Come back this evening for your reflection
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </motion.div>
          )}
        </CardContent>
      </TealGradientCard>
    </motion.div>
  )
}

// =============================================================================
// QUICK STATS CARDS
// =============================================================================

interface QuickStatsProps {
  weeklyStats: WeeklyStats | null
  checkInStreakData: StreakData
  onOpenModal?: (modal: string) => void
}

function QuickStats({ weeklyStats, checkInStreakData, onOpenModal }: QuickStatsProps) {
  const isMobile = useMediaQuery('(max-width: 768px)')

  const stats = [
    {
      label: 'Check Rate',
      value: weeklyStats?.checkRate ?? 0,
      suffix: '%',
      description: '7-day',
      gradient: 'from-teal-50 to-cyan-100',
      color: '#069494',
      onClick: () => onOpenModal?.('stats'),
    },
    {
      label: 'Avg Mood',
      value: weeklyStats?.avgMood ?? 0,
      suffix: '',
      decimals: 1,
      description: '7-day',
      gradient: 'from-rose-50 to-pink-100',
      color: '#ec4899',
      onClick: () => onOpenModal?.('moodPattern'),
    },
    {
      label: 'Best Streak',
      value: checkInStreakData.longestStreak,
      suffix: 'd',
      description: 'All-time',
      gradient: 'from-amber-50 to-orange-100',
      color: '#f97316',
      onClick: () => onOpenModal?.('streakHistory'),
    },
  ]

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="show"
      className="grid grid-cols-3 gap-2 md:gap-3 mb-4"
    >
      {stats.map((stat, index) => (
        <motion.div key={index} variants={staggerItem}>
          <GradientCard
            gradient={stat.gradient}
            hoverEffect
            onClick={() => {
              haptics.tap()
              stat.onClick()
            }}
            className="cursor-pointer"
          >
            <CardContent className={cn('text-center', isMobile ? 'py-3 px-2' : 'py-4 px-3')}>
              <div className="flex justify-center mb-1">
                <CircularProgress
                  value={stat.value}
                  max={stat.label === 'Avg Mood' ? 10 : 100}
                  size={isMobile ? 40 : 48}
                  strokeWidth={4}
                  color={stat.color}
                />
              </div>
              <div className={cn('font-bold text-slate-800', isMobile ? 'text-lg' : 'text-xl')}>
                {stat.value > 0 ? (
                  <AnimatedCounter
                    value={stat.value}
                    suffix={stat.suffix}
                    decimals={stat.decimals ?? 0}
                    duration={1.5}
                  />
                ) : (
                  '-'
                )}
              </div>
              <div className={cn('font-medium text-slate-600', isMobile ? 'text-xs' : 'text-xs')}>
                {stat.label}
              </div>
              <div className="text-xs text-slate-500">{stat.description}</div>
            </CardContent>
          </GradientCard>
        </motion.div>
      ))}
    </motion.div>
  )
}

// =============================================================================
// ACTION CARDS
// =============================================================================

interface ActionCardsProps {
  checkInStreak: number
  weeklyStats: WeeklyStats | null
  onOpenModal?: (modal: string) => void
}

function ActionCards({ checkInStreak, weeklyStats, onOpenModal }: ActionCardsProps) {
  const isMobile = useMediaQuery('(max-width: 768px)')

  // Share progress handler
  const handleShare = useCallback(async () => {
    const shareText =
      checkInStreak > 0
        ? `${checkInStreak} ${checkInStreak === 1 ? 'day' : 'days'} check-in streak!\n\nProud of my progress in recovery.${weeklyStats?.checkRate ? `\n\n${weeklyStats.checkRate}% check-in rate this week` : ''}${weeklyStats?.avgMood ? `\nAverage mood: ${weeklyStats.avgMood}/10` : ''}\n\n#RecoveryJourney #Progress`
        : 'Starting my recovery journey!\n\nFollowing my daily check-ins and reflections.\n\n#RecoveryJourney'

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My Recovery Progress',
          text: shareText,
        })
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          await navigator.clipboard.writeText(shareText)
          alert('Progress copied to clipboard!')
        }
      }
    } else {
      await navigator.clipboard.writeText(shareText)
      alert('Progress copied to clipboard!')
    }
  }, [checkInStreak, weeklyStats])

  const actions = [
    {
      icon: Phone,
      gradient: 'from-red-500 to-red-600',
      title: 'Crisis Support',
      description: '24/7 crisis resources',
      onClick: () => onOpenModal?.('crisis'),
      urgent: true,
    },
    {
      icon: Target,
      gradient: 'from-teal-500 to-cyan-600',
      title: 'Recovery Milestones',
      description: 'View progress & next goal',
      onClick: () => onOpenModal?.('milestone'),
      featured: true,
    },
    {
      icon: CalendarCheck,
      gradient: 'from-indigo-50 to-purple-100',
      title: 'Weekly Report',
      description: 'Analytics & insights',
      onClick: () => onOpenModal?.('stats'),
    },
    {
      icon: Heart,
      gradient: 'from-rose-50 to-pink-100',
      title: 'Coping Technique',
      description: 'Daily CBT/DBT',
      onClick: () => onOpenModal?.('copingTechnique'),
    },
    {
      icon: Share2,
      gradient: 'from-amber-50 to-orange-100',
      title: 'Share Progress',
      description: 'Celebrate milestones',
      onClick: handleShare,
    },
  ]

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="show"
      className="space-y-2"
    >
      {actions.map((action, index) => {
        const Icon = action.icon
        const isFeatured = action.featured || action.urgent

        return (
          <motion.div key={index} variants={staggerItem}>
            {isFeatured ? (
              <TealGradientCard
                hoverEffect
                onClick={() => {
                  haptics.tap()
                  action.onClick()
                }}
                className={cn(
                  'cursor-pointer',
                  action.urgent && 'bg-gradient-to-r from-red-500 to-red-600'
                )}
              >
                <CardContent className={cn('flex items-center gap-3', isMobile ? 'py-4 px-4' : 'py-5 px-5')}>
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-white/20">
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className={cn('font-bold text-white', isMobile ? 'text-sm' : 'text-base')}>
                      {action.title}
                    </div>
                    <div className={cn('text-white/90', isMobile ? 'text-xs' : 'text-sm')}>
                      {action.description}
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-white/70" />
                </CardContent>
              </TealGradientCard>
            ) : (
              <GradientCard
                gradient={action.gradient}
                hoverEffect
                onClick={() => {
                  haptics.tap()
                  action.onClick()
                }}
                className="cursor-pointer"
              >
                <CardContent
                  className={cn('flex items-center justify-between', isMobile ? 'py-3 px-3' : 'py-3 px-4')}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-white/80 shadow-sm">
                      <Icon className="h-5 w-5 text-slate-700" />
                    </div>
                    <div>
                      <div className={cn('font-medium text-slate-800', isMobile ? 'text-sm' : 'text-base')}>
                        {action.title}
                      </div>
                      <div className={cn('text-slate-600', isMobile ? 'text-xs' : 'text-sm')}>
                        {action.description}
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-400" />
                </CardContent>
              </GradientCard>
            )}
          </motion.div>
        )
      })}
    </motion.div>
  )
}

// =============================================================================
// MULTI-STEP FORM
// =============================================================================

interface MultiStepFormProps {
  onSubmit: (data: MorningCheckInData) => Promise<boolean>
  loading?: boolean
}

function MultiStepForm({ onSubmit, loading }: MultiStepFormProps) {
  const isMobile = useMediaQuery('(max-width: 768px)')
  const [step, setStep] = useState(1)
  const [values, setValues] = useState<MorningCheckInData>({
    mood: null,
    craving: null,
    anxiety: null,
    sleep: null,
    notes: '',
  })

  const totalSteps = 2 // Step 1: Mood sliders, Step 2: Notes + Submit

  const handleSliderChange = useCallback((key: string, value: number) => {
    setValues((prev) => ({ ...prev, [key]: value }))
  }, [])

  const canProceed = values.mood !== null && values.craving !== null && values.anxiety !== null && values.sleep !== null

  const handleSubmit = useCallback(async () => {
    const success = await onSubmit(values)
    if (success) {
      // Reset form on success
      setValues({
        mood: null,
        craving: null,
        anxiety: null,
        sleep: null,
        notes: '',
      })
      setStep(1)
    }
  }, [onSubmit, values])

  return (
    <div>
      <StepIndicator currentStep={step} totalSteps={totalSteps} />

      {step === 1 && (
        <>
          {/* Header */}
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-orange-500">
              <Sun className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className={cn('font-bold', isMobile ? 'text-base' : 'text-lg')}>
                Morning Check-In
              </h3>
              <p className={cn('text-muted-foreground', isMobile ? 'text-xs' : 'text-sm')}>
                How are you feeling today?
              </p>
            </div>
          </div>

          {/* Mood Sliders */}
          <MoodSliders values={values} onChange={handleSliderChange} disabled={loading} />

          {/* Next Button */}
          <div className="flex justify-end mt-4">
            <Button
              onClick={() => setStep(2)}
              disabled={!canProceed || loading}
              className="bg-teal-500 hover:bg-teal-600"
            >
              Next
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </>
      )}

      {step === 2 && (
        <>
          {/* Summary */}
          <Card className="mb-4 bg-muted/30">
            <CardContent className={cn('py-3', isMobile ? 'px-3' : 'px-4')}>
              <div className={cn('font-medium mb-2', isMobile ? 'text-sm' : 'text-base')}>
                Your Ratings
              </div>
              <div className="grid grid-cols-4 gap-2 text-center">
                {[
                  { label: 'Mood', value: values.mood },
                  { label: 'Craving', value: values.craving },
                  { label: 'Anxiety', value: values.anxiety },
                  { label: 'Sleep', value: values.sleep },
                ].map((item) => (
                  <div key={item.label}>
                    <div className={cn('font-bold text-teal-600', isMobile ? 'text-lg' : 'text-xl')}>
                      {item.value}
                    </div>
                    <div className={cn('text-muted-foreground', isMobile ? 'text-xs' : 'text-xs')}>
                      {item.label}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          <Card className="mb-4">
            <CardContent className={cn('pt-4', isMobile ? 'pb-3 px-3' : 'pb-4 px-4')}>
              <div className={cn('font-medium mb-2', isMobile ? 'text-sm' : 'text-base')}>
                Additional Notes <span className="text-muted-foreground">(optional)</span>
              </div>
              <Textarea
                value={values.notes || ''}
                onChange={(e) => setValues((prev) => ({ ...prev, notes: e.target.value }))}
                placeholder="Anything else on your mind today?"
                className={cn('resize-none', isMobile ? 'min-h-[80px]' : 'min-h-[100px]')}
                disabled={loading}
              />
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep(1)} disabled={loading}>
              <ChevronLeft className="mr-1 h-4 w-4" />
              Back
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={loading}
              className="bg-teal-500 hover:bg-teal-600"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <TrendingUp className="mr-1 h-4 w-4" />
                  Submit Check-In
                </>
              )}
            </Button>
          </div>
        </>
      )}
    </div>
  )
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function CheckInView({
  checkInStatus,
  checkInStreak,
  checkInStreakData,
  weeklyStats,
  onSubmit,
  loading,
  onOpenModal,
  onNavigate,
  lastSubmittedData,
  yesterdayCheckInData,
}: CheckInViewProps) {
  const isMobile = useMediaQuery('(max-width: 768px)')

  return (
    <ScrollArea className="h-full">
      <div className={cn('max-w-[600px] mx-auto', isMobile ? 'px-4 py-4' : 'px-6 py-6')}>
        {/* Section Header */}
        <h2 className={cn('font-medium mb-4', isMobile ? 'text-base' : 'text-lg')}>
          Morning Check-In
        </h2>

        {/* Check-In Form or Completion State */}
        {checkInStatus.morning ? (
          <CompletionState
            onNavigateToReflection={() => onNavigate?.('reflections')}
            submittedData={lastSubmittedData}
            yesterdayData={yesterdayCheckInData}
          />
        ) : (
          <Card className="mb-4">
            <CardContent className={cn('pt-5', isMobile ? 'pb-4 px-4' : 'pb-5 px-5')}>
              <MultiStepForm onSubmit={onSubmit} loading={loading} />
            </CardContent>
          </Card>
        )}

        {/* Quick Stats - Shown when not completed for motivation */}
        {!checkInStatus.morning && (
          <>
            <h3 className={cn('font-medium mb-3', isMobile ? 'text-sm' : 'text-base')}>
              Quick Stats
            </h3>
            <QuickStats
              weeklyStats={weeklyStats}
              checkInStreakData={checkInStreakData}
              onOpenModal={onOpenModal}
            />
          </>
        )}

      </div>
    </ScrollArea>
  )
}

export default CheckInView
