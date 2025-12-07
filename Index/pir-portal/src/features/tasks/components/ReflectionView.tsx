import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Moon,
  ChevronRight,
  Target,
  Loader2,
  Star,
  MessageSquare,
  Heart,
  Sparkles,
  Check,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import {
  GradientCard,
  EveningIllustration,
  GratitudeIllustration,
} from '@/components/common'
import { SinglePicker } from './MoodSliders'
import type {
  EveningReflectionData,
  CheckInStatus,
  ReflectionStats,
  StreakData,
  YesterdayGoal,
  GratitudeTheme,
} from '../hooks/useCheckInData'

// =============================================================================
// TYPES
// =============================================================================

export interface ReflectionViewProps {
  checkInStatus: CheckInStatus
  reflectionStreak: number
  reflectionStreakData: StreakData
  reflectionStats: ReflectionStats
  yesterdayGoal: YesterdayGoal | null
  onSubmit: (data: EveningReflectionData) => Promise<boolean>
  onMarkGoalComplete: (completed: boolean) => Promise<boolean>
  loading?: boolean
  onOpenModal?: (modal: string) => void
  lastSubmittedReflection?: EveningReflectionData | null
}

// =============================================================================
// CONSTANTS
// =============================================================================

const DAILY_PROMPTS = [
  'What challenged you today, and what did you learn from it?',
  'What moment today are you most grateful for?',
  'How did you practice self-care today?',
  'What made you smile today?',
  'What did you accomplish that you are proud of?',
  'How did you connect with others today?',
  'What would you do differently if you could redo today?',
  'What small victory did you have today?',
  'How did you manage stress today?',
  'What positive thought helped you get through the day?',
]

function getTodaysPrompt(): string {
  const dayOfMonth = new Date().getDate()
  return DAILY_PROMPTS[dayOfMonth % DAILY_PROMPTS.length]
}

// =============================================================================
// HELPERS FOR COMPLETION STATE
// =============================================================================

const getDayRatingLabel = (value: number): string => {
  if (value <= 2) return 'Tough Day'
  if (value <= 4) return 'Challenging'
  if (value <= 6) return 'Okay'
  if (value <= 8) return 'Good Day'
  return 'Great Day!'
}

const getDayRatingEmoji = (value: number): string => {
  if (value <= 2) return 'Struggled but pushed through'
  if (value <= 4) return 'Faced some challenges'
  if (value <= 6) return 'Made it through'
  if (value <= 8) return 'Had a positive day'
  return 'Thriving today!'
}

// =============================================================================
// COMPLETION STATE
// =============================================================================

interface CompletionStateProps {
  submittedData?: EveningReflectionData | null
}

function CompletionState({ submittedData }: CompletionStateProps) {
  const isMobile = useMediaQuery('(max-width: 768px)')

  const truncateText = (text: string | undefined, maxLength: number): string => {
    if (!text) return ''
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength).trim() + '...'
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring' as const, stiffness: 300, damping: 20 }}
    >
      <GradientCard gradient="from-indigo-500 to-purple-600" className="border-0 text-white overflow-hidden relative">
        {/* Decorative pattern with stars effect */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-4 right-8 w-2 h-2 rounded-full bg-white animate-pulse" />
          <div className="absolute top-12 right-16 w-1.5 h-1.5 rounded-full bg-white animate-pulse delay-100" />
          <div className="absolute top-8 left-12 w-1.5 h-1.5 rounded-full bg-white animate-pulse delay-200" />
          <div className="absolute bottom-16 right-12 w-2 h-2 rounded-full bg-white animate-pulse delay-300" />
          <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-white/10 -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-36 h-36 rounded-full bg-white/10 translate-y-1/2 -translate-x-1/2" />
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
              <Check className="h-8 w-8 text-indigo-600" />
            </motion.div>
            <h3 className={cn('font-bold text-white', isMobile ? 'text-lg' : 'text-xl')}>
              Reflection Complete!
            </h3>
          </div>

          {/* Tonight's Reflection Summary */}
          {submittedData && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white/10 backdrop-blur-sm rounded-xl p-4 mb-4"
            >
              <h4 className="text-xs font-semibold text-white/80 uppercase tracking-wide mb-3 flex items-center gap-2">
                <Moon className="h-3.5 w-3.5 text-indigo-300" />
                Tonight's Reflection
              </h4>

              <div className="space-y-3">
                {/* Day Rating */}
                {submittedData.overallDay !== null && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="flex items-center justify-between py-1.5"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-yellow-500/30 flex items-center justify-center">
                        <Star className="h-4 w-4 text-yellow-300" />
                      </div>
                      <span className="text-sm font-medium text-white/90">Day Rating</span>
                    </div>
                    <div className="text-right">
                      <span className={cn('font-bold text-white', isMobile ? 'text-sm' : 'text-base')}>
                        {submittedData.overallDay}/10
                      </span>
                      <span className="text-xs text-white/70 ml-2">
                        {getDayRatingLabel(submittedData.overallDay)}
                      </span>
                    </div>
                  </motion.div>
                )}

                {/* Prompt Response Snippet */}
                {submittedData.promptResponse && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                    className="py-1.5"
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className="w-7 h-7 rounded-lg bg-blue-500/30 flex items-center justify-center">
                        <MessageSquare className="h-4 w-4 text-blue-300" />
                      </div>
                      <span className="text-sm font-medium text-white/90">Today's Thought</span>
                    </div>
                    <p className="text-xs text-white/70 italic pl-9 line-clamp-2">
                      "{truncateText(submittedData.promptResponse, 80)}"
                    </p>
                  </motion.div>
                )}

                {/* Gratitude */}
                {submittedData.gratitude && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                    className="py-1.5"
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className="w-7 h-7 rounded-lg bg-pink-500/30 flex items-center justify-center">
                        <Heart className="h-4 w-4 text-pink-300" />
                      </div>
                      <span className="text-sm font-medium text-white/90">Grateful For</span>
                    </div>
                    <p className="text-xs text-white/70 italic pl-9 line-clamp-2">
                      "{truncateText(submittedData.gratitude, 80)}"
                    </p>
                  </motion.div>
                )}

                {/* Tomorrow's Goal */}
                {submittedData.tomorrowGoal && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 }}
                    className="py-1.5"
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className="w-7 h-7 rounded-lg bg-emerald-500/30 flex items-center justify-center">
                        <Target className="h-4 w-4 text-emerald-300" />
                      </div>
                      <span className="text-sm font-medium text-white/90">Tomorrow's Goal</span>
                    </div>
                    <p className="text-xs text-white/70 italic pl-9 line-clamp-2">
                      "{truncateText(submittedData.tomorrowGoal, 80)}"
                    </p>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}

          {/* Streak indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="flex items-center justify-center gap-2 text-sm text-white/80 mb-3"
          >
            <Sparkles className="h-4 w-4 text-yellow-300" />
            <span>Streak updated</span>
          </motion.div>

          {/* Footer message */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className={cn('text-white/70 text-center', isMobile ? 'text-xs' : 'text-sm')}
          >
            Come back tomorrow for your next reflection
          </motion.p>
        </CardContent>
      </GradientCard>
    </motion.div>
  )
}

// =============================================================================
// YESTERDAY'S GOAL CARD
// =============================================================================

interface YesterdayGoalCardProps {
  goal: YesterdayGoal
  onMarkComplete: (completed: boolean) => Promise<boolean>
}

function YesterdayGoalCard({ goal, onMarkComplete }: YesterdayGoalCardProps) {
  const isMobile = useMediaQuery('(max-width: 768px)')

  return (
    <Card
      className={cn(
        'mb-4',
        goal.completed
          ? 'bg-green-50 border-green-300'
          : 'bg-amber-50 border-amber-300'
      )}
    >
      <CardContent className={cn('pt-4', isMobile ? 'pb-3 px-4' : 'pb-4 px-5')}>
        <div className="flex items-center gap-2 mb-3">
          <Target
            className={cn(
              'h-5 w-5',
              goal.completed ? 'text-green-600' : 'text-amber-600'
            )}
          />
          <span className={cn('font-bold', isMobile ? 'text-sm' : 'text-base')}>
            Yesterday's Goal
          </span>
        </div>

        <Card className="bg-white mb-3">
          <CardContent className="py-3 px-4">
            <p className={cn('italic text-muted-foreground', isMobile ? 'text-sm' : 'text-base')}>
              "{goal.goal}"
            </p>
          </CardContent>
        </Card>

        <div className="flex items-center gap-3 p-3 bg-white/70 rounded-lg">
          <Checkbox
            id="goal-complete"
            checked={goal.completed}
            onCheckedChange={(checked) => onMarkComplete(checked as boolean)}
          />
          <label
            htmlFor="goal-complete"
            className={cn(
              'font-semibold cursor-pointer',
              goal.completed ? 'text-green-600' : 'text-muted-foreground',
              isMobile ? 'text-sm' : 'text-base'
            )}
          >
            {goal.completed ? 'Completed!' : 'Mark as completed'}
          </label>
        </div>
      </CardContent>
    </Card>
  )
}

// =============================================================================
// GRATITUDE THEMES CARD
// =============================================================================

interface GratitudeThemesCardProps {
  themes: GratitudeTheme[]
  onOpenModal?: (modal: string) => void
}

function GratitudeThemesCard({ themes, onOpenModal }: GratitudeThemesCardProps) {
  const isMobile = useMediaQuery('(max-width: 768px)')

  return (
    <Card
      className="cursor-pointer hover:shadow-md transition-shadow mb-3"
      onClick={() => onOpenModal?.('gratitudeThemes')}
    >
      <CardContent className={cn('pt-4', isMobile ? 'pb-3 px-4' : 'pb-4 px-5')}>
        <div className="flex items-center justify-between mb-3">
          <span className={cn('font-semibold', isMobile ? 'text-sm' : 'text-base')}>
            Top Gratitude Themes
          </span>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </div>

        {themes.length > 0 ? (
          <div className="space-y-2">
            {themes.map((theme, index) => (
              <div
                key={index}
                className={cn(
                  'flex items-center justify-between p-3 rounded-lg border',
                  index === 0
                    ? 'bg-amber-50 border-amber-200'
                    : index === 1
                      ? 'bg-gray-50 border-gray-200'
                      : 'bg-gray-50/50 border-gray-100'
                )}
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">
                    {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                  </span>
                  <div>
                    <div className={cn('font-semibold', isMobile ? 'text-sm' : 'text-base')}>
                      {theme.name}
                    </div>
                    <div className={cn('text-muted-foreground', isMobile ? 'text-xs' : 'text-xs')}>
                      Last: {theme.lastDate.toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </div>
                  </div>
                </div>
                <span className="px-2 py-1 bg-teal-500 text-white text-xs font-bold rounded-full">
                  {theme.count}x
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4">
            <div className="flex justify-center mb-2">
              <GratitudeIllustration size="sm" className="w-16 h-16 opacity-70" />
            </div>
            <p className={cn('text-muted-foreground italic', isMobile ? 'text-sm' : 'text-base')}>
              Start adding gratitudes to see your themes!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}


// =============================================================================
// REFLECTION FORM
// =============================================================================

interface ReflectionFormProps {
  yesterdayGoal: YesterdayGoal | null
  onSubmit: (data: EveningReflectionData) => Promise<boolean>
  onMarkGoalComplete: (completed: boolean) => Promise<boolean>
  loading?: boolean
}

function ReflectionForm({
  yesterdayGoal,
  onSubmit,
  onMarkGoalComplete,
  loading,
}: ReflectionFormProps) {
  const isMobile = useMediaQuery('(max-width: 768px)')
  const [values, setValues] = useState<EveningReflectionData>({
    overallDay: null,
    promptResponse: '',
    challenges: '',
    gratitude: '',
    tomorrowGoal: '',
  })

  const canSubmit =
    values.overallDay !== null &&
    values.challenges?.trim() &&
    values.gratitude?.trim() &&
    values.tomorrowGoal?.trim()

  const handleSubmit = useCallback(async () => {
    const success = await onSubmit(values)
    if (success) {
      setValues({
        overallDay: null,
        promptResponse: '',
        challenges: '',
        gratitude: '',
        tomorrowGoal: '',
      })
    }
  }, [onSubmit, values])

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-600">
          <Moon className="h-5 w-5 text-white" />
        </div>
        <div>
          <h3 className={cn('font-bold', isMobile ? 'text-base' : 'text-lg')}>
            Evening Reflection
          </h3>
          <p className={cn('text-muted-foreground', isMobile ? 'text-xs' : 'text-sm')}>
            Reflect on your day
          </p>
        </div>
      </div>

      {/* Daily Prompt */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className={cn('py-3', isMobile ? 'px-3' : 'px-4')}>
          <div className={cn('font-bold text-blue-800 mb-1', isMobile ? 'text-sm' : 'text-base')}>
            Today's Reflection Prompt
          </div>
          <p className={cn('text-blue-700 italic', isMobile ? 'text-sm' : 'text-base')}>
            "{getTodaysPrompt()}"
          </p>
        </CardContent>
      </Card>

      {/* Prompt Response */}
      <Card>
        <CardContent className={cn('pt-3', isMobile ? 'pb-3 px-3' : 'pb-4 px-4')}>
          <div className={cn('font-medium mb-2', isMobile ? 'text-sm' : 'text-base')}>
            Your Response
          </div>
          <Textarea
            value={values.promptResponse || ''}
            onChange={(e) => setValues((prev) => ({ ...prev, promptResponse: e.target.value }))}
            placeholder="Reflect on today's prompt..."
            className={cn('resize-y', isMobile ? 'min-h-[70px]' : 'min-h-[80px]')}
            disabled={loading}
          />
        </CardContent>
      </Card>

      {/* Overall Day Rating */}
      <SinglePicker
        label="Overall Day"
        value={values.overallDay}
        onChange={(value) => setValues((prev) => ({ ...prev, overallDay: value }))}
        lowLabel="Difficult"
        highLabel="Excellent"
        disabled={loading}
      />

      {/* Challenges */}
      <Card>
        <CardContent className={cn('pt-3', isMobile ? 'pb-3 px-3' : 'pb-4 px-4')}>
          <div className={cn('font-medium mb-2', isMobile ? 'text-sm' : 'text-base')}>
            Today's Challenges <span className="text-destructive">*</span>
          </div>
          <Textarea
            value={values.challenges || ''}
            onChange={(e) => setValues((prev) => ({ ...prev, challenges: e.target.value }))}
            placeholder="What challenges did you face today?"
            className={cn('resize-y', isMobile ? 'min-h-[55px]' : 'min-h-[60px]')}
            disabled={loading}
          />
        </CardContent>
      </Card>

      {/* Gratitude */}
      <Card>
        <CardContent className={cn('pt-3', isMobile ? 'pb-3 px-3' : 'pb-4 px-4')}>
          <div className={cn('font-medium mb-2', isMobile ? 'text-sm' : 'text-base')}>
            What I'm Grateful For <span className="text-destructive">*</span>
          </div>
          <Textarea
            value={values.gratitude || ''}
            onChange={(e) => setValues((prev) => ({ ...prev, gratitude: e.target.value }))}
            placeholder="What are you grateful for today?"
            className={cn('resize-y', isMobile ? 'min-h-[55px]' : 'min-h-[60px]')}
            disabled={loading}
          />
        </CardContent>
      </Card>

      {/* Tomorrow's Goal */}
      <Card>
        <CardContent className={cn('pt-3', isMobile ? 'pb-3 px-3' : 'pb-4 px-4')}>
          <div className={cn('font-medium mb-2', isMobile ? 'text-sm' : 'text-base')}>
            Tomorrow's Goal <span className="text-destructive">*</span>
          </div>
          <Textarea
            value={values.tomorrowGoal || ''}
            onChange={(e) => setValues((prev) => ({ ...prev, tomorrowGoal: e.target.value }))}
            placeholder="What's your goal for tomorrow?"
            className={cn('resize-y', isMobile ? 'min-h-[55px]' : 'min-h-[60px]')}
            disabled={loading}
          />
        </CardContent>
      </Card>

      {/* Yesterday's Goal */}
      {yesterdayGoal && (
        <YesterdayGoalCard goal={yesterdayGoal} onMarkComplete={onMarkGoalComplete} />
      )}

      {/* Submit Button */}
      <div className="flex justify-center pt-2">
        <Button
          onClick={handleSubmit}
          disabled={!canSubmit || loading}
          className={cn(
            'px-8',
            canSubmit && !loading
              ? 'bg-teal-500 hover:bg-teal-600'
              : 'bg-gray-300 cursor-not-allowed'
          )}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : (
            'Submit'
          )}
        </Button>
      </div>
    </div>
  )
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function ReflectionView({
  checkInStatus,
  reflectionStreak,
  reflectionStreakData: _reflectionStreakData,
  reflectionStats,
  yesterdayGoal,
  onSubmit,
  onMarkGoalComplete,
  loading,
  onOpenModal,
  lastSubmittedReflection,
}: ReflectionViewProps) {
  // Note: _reflectionStreakData reserved for future streak chart feature
  const isMobile = useMediaQuery('(max-width: 768px)')

  return (
    <ScrollArea className="h-full">
      <div className={cn('max-w-[600px] mx-auto', isMobile ? 'px-4 py-4' : 'px-6 py-6')}>
        {/* Section Header */}
        <h2 className={cn('font-medium mb-4', isMobile ? 'text-base' : 'text-lg')}>
          Evening Reflections
        </h2>

        {/* Reflection Form or Completion State */}
        {checkInStatus.evening ? (
          <CompletionState submittedData={lastSubmittedReflection} />
        ) : (
          <>
            <Card className="mb-4">
              <CardContent className={cn('pt-5', isMobile ? 'pb-4 px-4' : 'pb-5 px-5')}>
                <ReflectionForm
                  yesterdayGoal={yesterdayGoal}
                  onSubmit={onSubmit}
                  onMarkGoalComplete={onMarkGoalComplete}
                  loading={loading}
                />
              </CardContent>
            </Card>

            {/* Gratitude Themes - only show when form is visible */}
            <GratitudeThemesCard
              themes={reflectionStats.topGratitudeThemes}
              onOpenModal={onOpenModal}
            />

            {/* View Past Reflections */}
            <Button
              variant="outline"
              className="w-full mt-3 border-teal-500 text-teal-600 hover:bg-teal-50"
              onClick={() => onOpenModal?.('pastReflections')}
            >
              View Past Reflections
            </Button>
          </>
        )}
      </div>
    </ScrollArea>
  )
}

export default ReflectionView
