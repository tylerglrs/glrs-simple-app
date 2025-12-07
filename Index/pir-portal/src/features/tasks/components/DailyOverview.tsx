import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import {
  Sun,
  Moon,
  CheckCircle2,
  Flame,
  TrendingUp,
  Calendar,
  Target,
  Heart,
  Sparkles,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import {
  GradientCard,
  AnimatedCounter,
  CircularProgress,
  ToolkitCard,
  FireAnimation,
  getGreeting,
} from '@/components/common'
import {
  staggerContainer,
  staggerItem,
  haptics,
} from '@/lib/animations'
import type {
  CheckInStatus,
  WeeklyStats,
  StreakData,
  ReflectionStats,
} from '../hooks/useCheckInData'
import { CopingTechniqueCard } from './CopingTechniqueCard'
import { AssignmentCalendar } from './AssignmentCalendar'
import { ActivityCalendar } from './ActivityCalendar'
import { useTechniqueCompletion } from '../hooks/useTechniqueCompletion'
import { ScrollFadeBackground } from './ScrollFadeBackground'
import type { CopingTechnique } from '../data/copingTechniques'
import type { DayActivity } from '../hooks/useActivityData'
import { DayDetailModal } from '../modals/DayDetailModal'

// =============================================================================
// TYPES
// =============================================================================

export interface DailyOverviewProps {
  checkInStatus: CheckInStatus
  checkInStreak: number
  reflectionStreak: number
  checkInStreakData: StreakData
  reflectionStreakData: StreakData
  weeklyStats: WeeklyStats | null
  reflectionStats: ReflectionStats
  onNavigate: (view: 'checkin' | 'reflections') => void
  onOpenModal?: (modal: string) => void
}

// =============================================================================
// HELPERS
// =============================================================================

function getTimeOfDay(): 'morning' | 'afternoon' | 'evening' {
  const hour = new Date().getHours()
  if (hour < 12) return 'morning'
  if (hour < 17) return 'afternoon'
  return 'evening'
}

// =============================================================================
// HERO GREETING CARD
// =============================================================================

interface HeroGreetingProps {
  completedCount: number
  totalTasks: number
}

function HeroGreeting({ completedCount, totalTasks }: HeroGreetingProps) {
  const isMobile = useMediaQuery('(max-width: 768px)')
  const greeting = getGreeting()
  const progress = (completedCount / totalTasks) * 100

  // Determine message based on completion
  const getMessage = () => {
    const remaining = totalTasks - completedCount
    if (remaining === 0) return "You're all caught up!"
    if (remaining === 1) return 'One more to go!'
    if (remaining === 2) return 'Two more to go!'
    return "Let's get started"
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="mb-4 overflow-hidden relative bg-transparent border-0">
        <CardContent className={cn('py-3 relative', isMobile ? 'px-4' : 'px-5')}>
          <div className="flex items-center justify-between">
            <div>
              <h1 className={cn('font-bold text-white', isMobile ? 'text-lg' : 'text-xl')}>
                {greeting}
              </h1>
              <p className="text-white/90 text-sm font-medium">
                {getMessage()}
              </p>
              <p className="text-white/70 text-xs">
                {new Date().toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
            <div className="flex flex-col items-center">
              <CircularProgress
                value={progress}
                max={100}
                size={isMobile ? 48 : 56}
                strokeWidth={5}
                color="rgba(255,255,255,0.95)"
                bgColor="rgba(255,255,255,0.2)"
              >
                <span className="text-white font-bold text-xs">{completedCount}/{totalTasks}</span>
              </CircularProgress>
              {completedCount === totalTasks && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="mt-1"
                >
                  <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                </motion.div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// =============================================================================
// TODAY'S TASKS SECTION
// =============================================================================

interface TodayTasksProps {
  checkInStatus: CheckInStatus
  techniqueCompleted: boolean
  onNavigate: (view: 'checkin' | 'reflections') => void
}

function TodayTasks({ checkInStatus, techniqueCompleted, onNavigate }: TodayTasksProps) {
  const isMobile = useMediaQuery('(max-width: 768px)')
  const timeOfDay = getTimeOfDay()

  // Determine which card to highlight
  const showMorningHighlight = !checkInStatus.morning
  const showEveningHighlight = checkInStatus.morning && !checkInStatus.evening && timeOfDay !== 'morning'

  // Check if all 3 tasks are done
  const allTasksDone = checkInStatus.morning && checkInStatus.evening && techniqueCompleted

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="show"
      className="mb-4"
    >
      <div className="flex items-center justify-between mb-3">
        <h2 className={cn('font-bold text-slate-900', isMobile ? 'text-base' : 'text-lg')}>
          Today's Tasks
        </h2>
        {allTasksDone && (
          <span className="flex items-center gap-1 text-emerald-600 text-sm font-medium">
            <CheckCircle2 className="h-4 w-4" />
            All done!
          </span>
        )}
      </div>

      {/* Gap between header and cards */}
      <div className="h-3" />

      <div className="grid grid-cols-2 gap-3">
        {/* Morning Check-In */}
        <motion.div variants={staggerItem}>
          <ToolkitCard
            icon={Sun}
            title="Morning Check-In"
            subtitle={checkInStatus.morning ? 'Completed' : 'Track your mood'}
            theme="morning"
            onClick={() => {
              haptics.tap()
              onNavigate('checkin')
            }}
            badge={showMorningHighlight ? '!' : undefined}
            disabled={false}
          />
        </motion.div>

        {/* Evening Reflection */}
        <motion.div variants={staggerItem}>
          <ToolkitCard
            icon={Moon}
            title="Evening Reflection"
            subtitle={checkInStatus.evening ? 'Completed' : 'Reflect & unwind'}
            theme="evening"
            onClick={() => {
              haptics.tap()
              onNavigate('reflections')
            }}
            badge={showEveningHighlight ? '!' : undefined}
            disabled={false}
          />
        </motion.div>
      </div>
    </motion.div>
  )
}

// =============================================================================
// STREAK SECTION (ENHANCED)
// =============================================================================

interface StreakSectionProps {
  checkInStreak: number
  reflectionStreak: number
  checkInStreakData: StreakData
  reflectionStreakData: StreakData
  onOpenModal?: (modal: string) => void
}

function StreakSection({
  checkInStreak,
  reflectionStreak,
  checkInStreakData,
  reflectionStreakData,
  onOpenModal,
}: StreakSectionProps) {
  const isMobile = useMediaQuery('(max-width: 768px)')

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="mb-4"
    >
      <div className="flex items-center gap-2 mb-3">
        <FireAnimation size={24} />
        <h2 className={cn('font-bold text-slate-900', isMobile ? 'text-base' : 'text-lg')}>
          Streaks
        </h2>
        {(checkInStreak >= 7 || reflectionStreak >= 7) && (
          <Sparkles className="h-4 w-4 text-amber-500 animate-pulse" />
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* Check-In Streak */}
        <GradientCard
          gradient=""
          hoverEffect
          onClick={() => onOpenModal?.('streaks')}
          className="cursor-pointer bg-transparent border-0"
        >
          <CardContent className={cn('flex items-center gap-3', isMobile ? 'py-3 px-3' : 'py-3 px-4')}>
            {/* Colorful circular illustration */}
            <div className="relative flex-shrink-0">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-md">
                <div className="w-8 h-8 rounded-full bg-white/30 flex items-center justify-center">
                  <Flame className="h-4 w-4 text-white" />
                </div>
              </div>
              {checkInStreak > 0 && (
                <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
                  <CheckCircle2 className="h-3 w-3 text-white" />
                </div>
              )}
            </div>
            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className={cn('font-bold text-slate-900', isMobile ? 'text-2xl' : 'text-3xl')}>
                <AnimatedCounter value={checkInStreak} duration={1.5} />
              </div>
              <div className={cn('font-medium text-teal-600', isMobile ? 'text-xs' : 'text-sm')}>
                Check-In Streak
              </div>
              <div className="text-xs text-slate-500">
                Best: {checkInStreakData.longestStreak} days
              </div>
            </div>
          </CardContent>
        </GradientCard>

        {/* Reflection Streak */}
        <GradientCard
          gradient=""
          hoverEffect
          onClick={() => onOpenModal?.('reflectionStreaks')}
          className="cursor-pointer bg-transparent border-0"
        >
          <CardContent className={cn('flex items-center gap-3', isMobile ? 'py-3 px-3' : 'py-3 px-4')}>
            {/* Colorful circular illustration */}
            <div className="relative flex-shrink-0">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center shadow-md">
                <div className="w-8 h-8 rounded-full bg-white/30 flex items-center justify-center">
                  <Moon className="h-4 w-4 text-white" />
                </div>
              </div>
              {reflectionStreak > 0 && (
                <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
                  <CheckCircle2 className="h-3 w-3 text-white" />
                </div>
              )}
            </div>
            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className={cn('font-bold text-slate-900', isMobile ? 'text-2xl' : 'text-3xl')}>
                <AnimatedCounter value={reflectionStreak} duration={1.5} />
              </div>
              <div className={cn('font-medium text-teal-600', isMobile ? 'text-xs' : 'text-sm')}>
                Reflection Streak
              </div>
              <div className="text-xs text-slate-500">
                Best: {reflectionStreakData.longestStreak} days
              </div>
            </div>
          </CardContent>
        </GradientCard>
      </div>
    </motion.div>
  )
}

// =============================================================================
// INSIGHTS SECTION (METRICS)
// =============================================================================

interface InsightsSectionProps {
  weeklyStats: WeeklyStats | null
  reflectionStats: ReflectionStats
  onOpenModal?: (modal: string) => void
}

function InsightsSection({ weeklyStats, reflectionStats, onOpenModal }: InsightsSectionProps) {
  const isMobile = useMediaQuery('(max-width: 768px)')

  const insights = [
    {
      icon: Calendar,
      label: 'Check Ins',
      value: weeklyStats?.checkRate ?? 0,
      suffix: '%',
      description: '7-day',
      modal: 'checkIns',
      gradient: '',
      color: '#069494',
    },
    {
      icon: Heart,
      label: 'Avg Mood',
      value: weeklyStats?.avgMood ?? 0,
      suffix: '',
      decimals: 1,
      description: '7-day',
      modal: 'moodPattern',
      gradient: '',
      color: '#069494',
    },
    {
      icon: Target,
      label: 'Reflections',
      value: reflectionStats.totalThisMonth,
      suffix: '',
      description: 'This month',
      modal: 'allReflections',
      gradient: '',
      color: '#069494',
    },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="mb-4"
    >
      <div className="flex items-center gap-2 mb-3">
        <TrendingUp className="h-5 w-5 text-teal-500" />
        <h2 className={cn('font-bold text-slate-900', isMobile ? 'text-base' : 'text-lg')}>
          Insights
        </h2>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {insights.map((insight, index) => {
          const Icon = insight.icon
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 + index * 0.1 }}
            >
              <GradientCard
                gradient={insight.gradient}
                hoverEffect
                onClick={() => onOpenModal?.(insight.modal)}
                className="cursor-pointer bg-transparent border border-slate-200/60"
              >
                <CardContent className="text-center py-2 px-2">
                  {/* Uniform layout for all insight cards */}
                  <div className="flex justify-center mb-0.5">
                    <CircularProgress
                      value={insight.value}
                      max={insight.label === 'Avg Mood' ? 10 : 100}
                      size={36}
                      strokeWidth={4}
                      color={insight.color}
                    >
                      <Icon className="h-3.5 w-3.5" style={{ color: insight.color }} />
                    </CircularProgress>
                  </div>
                  <div className="font-bold text-slate-900 text-base">
                    {insight.value > 0 ? (
                      <AnimatedCounter
                        value={insight.value}
                        suffix={insight.suffix}
                        decimals={insight.decimals ?? 0}
                        duration={1.5}
                      />
                    ) : (
                      '-'
                    )}
                  </div>
                  <div className="font-medium text-teal-600 text-xs">
                    {insight.label}
                  </div>
                  <div className="text-xs text-slate-500">{insight.description}</div>
                </CardContent>
              </GradientCard>
            </motion.div>
          )
        })}
      </div>
    </motion.div>
  )
}

// =============================================================================
// QUICK ACTIONS GRID
// =============================================================================

function QuickActions() {
  const navigate = useNavigate()
  const isMobile = useMediaQuery('(max-width: 768px)')

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
    >
      {/* Beacon Card - AI Insights Hub Entry */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <div
          onClick={() => {
            haptics.tap()
            navigate('/insights')
          }}
          className={cn(
            'relative overflow-hidden rounded-2xl cursor-pointer',
            'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900',
            'border border-violet-500/30',
            'shadow-lg shadow-violet-500/10',
            'transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-violet-500/20',
            'active:scale-[0.98]'
          )}
        >
          {/* Animated glow background */}
          <div className="absolute inset-0 bg-gradient-to-br from-violet-600/20 via-transparent to-cyan-600/20 opacity-60" />
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-violet-500/20 rounded-full blur-2xl" />
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-cyan-500/20 rounded-full blur-2xl" />

          <div className={cn('relative flex items-center gap-4', isMobile ? 'py-4 px-4' : 'py-5 px-5')}>
            {/* Circular AI Illustration */}
            <div className="relative flex-shrink-0">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-500 via-purple-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-violet-500/30">
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-sm">
                  <Sparkles className="h-4 w-4 text-white animate-pulse" />
                </div>
              </div>
              {/* Animated ring */}
              <div className="absolute inset-0 rounded-full border-2 border-violet-400/40 animate-ping" style={{ animationDuration: '2s' }} />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-white text-base">Beacon</h3>
              <p className={cn('text-slate-300 line-clamp-2', isMobile ? 'text-xs' : 'text-sm')}>
                Your personal insights and pattern analysis
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function DailyOverview({
  checkInStatus,
  checkInStreak,
  reflectionStreak,
  checkInStreakData,
  reflectionStreakData,
  weeklyStats,
  reflectionStats,
  onNavigate,
  onOpenModal,
}: DailyOverviewProps) {
  const isMobile = useMediaQuery('(max-width: 768px)')
  const { isCompleted: techniqueCompleted } = useTechniqueCompletion()

  // Day Detail Modal state
  const [selectedDayData, setSelectedDayData] = useState<{
    date: string
    activity: DayActivity
  } | null>(null)

  // Total tasks: Morning Check-in + Evening Reflection + Today's Technique = 3
  const totalTasks = 3
  const completedCount =
    (checkInStatus.morning ? 1 : 0) +
    (checkInStatus.evening ? 1 : 0) +
    (techniqueCompleted ? 1 : 0)

  return (
    <ScrollFadeBackground className="h-full" fadeEnd={550} minOpacity={0.05}>
      <div className={cn('max-w-[600px] mx-auto', isMobile ? 'px-4 py-4' : 'px-6 py-6')}>
        {/* Spacer for background visibility at top */}
        <div className="h-8" />

        {/* Hero Greeting */}
        <HeroGreeting completedCount={completedCount} totalTasks={totalTasks} />

        {/* Spacer to push content below illustration */}
        <div className="h-16" />

        {/* Today's Tasks */}
        <TodayTasks
          checkInStatus={checkInStatus}
          techniqueCompleted={techniqueCompleted}
          onNavigate={onNavigate}
        />

        {/* Today's Coping Technique */}
        <CopingTechniqueCard
          onTryIt={(_technique: CopingTechnique) => {
            // Note: _technique available for future modal data passing
            onOpenModal?.('copingTechnique')
          }}
          className="mb-4"
        />

        {/* Assignment Calendar - 7 Day Swipeable View */}
        <AssignmentCalendar
          onSelectDay={(day) => {
            // Could open a modal or filter view
            console.log('Selected day:', day.dateString)
          }}
          onSelectAssignment={(assignment) => {
            // Open assignment detail modal
            onOpenModal?.('assignmentDetail')
            console.log('Selected assignment:', assignment.id)
          }}
        />

        {/* Streaks */}
        <StreakSection
          checkInStreak={checkInStreak}
          reflectionStreak={reflectionStreak}
          checkInStreakData={checkInStreakData}
          reflectionStreakData={reflectionStreakData}
          onOpenModal={onOpenModal}
        />

        {/* Activity Calendar */}
        <ActivityCalendar
          onSelectDay={(date, activity) => {
            setSelectedDayData({ date, activity })
          }}
        />

        {/* Insights */}
        <InsightsSection
          weeklyStats={weeklyStats}
          reflectionStats={reflectionStats}
          onOpenModal={onOpenModal}
        />

        {/* Quick Actions */}
        <QuickActions />

        {/* Bottom padding for safe scrolling */}
        <div className="h-8" />
      </div>

      {/* Day Detail Modal */}
      {selectedDayData && (
        <DayDetailModal
          onClose={() => setSelectedDayData(null)}
          date={selectedDayData.date}
          activity={selectedDayData.activity}
        />
      )}
    </ScrollFadeBackground>
  )
}

export default DailyOverview
