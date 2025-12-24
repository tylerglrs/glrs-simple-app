import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  EnhancedDialog,
  EnhancedDialogContent,
} from '@/components/ui/enhanced-dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Progress } from '@/components/ui/progress'
import {
  LayoutDashboard,
  X,
  Loader2,
  Sun,
  Moon,
  CheckCircle,
  Target,
  TrendingUp,
  Calendar,
  Flame,
  ChevronRight,
  Heart,
  Brain,
  Sparkles,
  ArrowRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { db, auth } from '@/lib/firebase'
import { collection, query, where, getDocs, Timestamp, doc, getDoc } from 'firebase/firestore'
import { haptics } from '@/lib/animations'

// =============================================================================
// TYPES
// =============================================================================

export interface DailyOverviewModalProps {
  onClose: () => void
  onOpenModal?: (modal: string) => void
}

interface DailyStats {
  morningCheckIn: boolean
  eveningReflection: boolean
  tasksCompleted: number
  totalTasks: number
  mood: number | null
  streak: number
  reflectionStreak: number
  avgMoodWeek: number | null
}

// =============================================================================
// ANIMATION VARIANTS
// =============================================================================

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.15,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, x: 30 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      type: 'spring' as const,
      stiffness: 300,
      damping: 24,
    },
  },
}

const scaleInVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      type: 'spring' as const,
      stiffness: 400,
      damping: 25,
    },
  },
}

const progressVariants = {
  hidden: { opacity: 0, scaleX: 0 },
  visible: {
    opacity: 1,
    scaleX: 1,
    transition: {
      duration: 0.8,
      ease: 'easeOut' as const,
    },
  },
}

// =============================================================================
// HELPERS
// =============================================================================

const getMoodColor = (mood: number | null) => {
  if (mood === null) return 'text-gray-400'
  if (mood <= 3) return 'text-red-500'
  if (mood <= 5) return 'text-yellow-500'
  if (mood <= 7) return 'text-green-500'
  return 'text-emerald-500'
}

// =============================================================================
// CIRCULAR PROGRESS RING
// =============================================================================

interface ProgressRingProps {
  value: number
  max: number
  size?: number
  strokeWidth?: number
  color?: string
  children?: React.ReactNode
}

function ProgressRing({
  value,
  max,
  size = 80,
  strokeWidth = 8,
  color = '#069494',
  children,
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const progress = Math.min(value / max, 1)
  const strokeDashoffset = circumference - progress * circumference

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-gray-200"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
          style={{
            strokeDasharray: circumference,
          }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">{children}</div>
    </div>
  )
}

// =============================================================================
// STAT CARD COMPONENT
// =============================================================================

interface StatCardProps {
  icon: typeof Sun
  label: string
  value: string | number
  sublabel?: string
  gradient: string
  iconColor: string
  onClick?: () => void
}

function StatCard({ icon: Icon, label, value, sublabel, gradient, iconColor, onClick }: StatCardProps) {
  return (
    <motion.div
      variants={itemVariants}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => {
        haptics.tap()
        onClick?.()
      }}
      className={cn(
        'p-4 rounded-xl border cursor-pointer transition-shadow',
        gradient,
        'hover:shadow-md'
      )}
    >
      <div className="flex items-center gap-3">
        <div className={cn('p-2 rounded-lg bg-white/60', iconColor)}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-muted-foreground truncate">{label}</p>
          <p className="text-lg font-bold text-foreground">{value}</p>
          {sublabel && <p className="text-xs text-muted-foreground">{sublabel}</p>}
        </div>
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
      </div>
    </motion.div>
  )
}

// =============================================================================
// COMPONENT
// =============================================================================

export function DailyOverviewModal({ onClose, onOpenModal }: DailyOverviewModalProps) {
  const isMobile = useMediaQuery('(max-width: 768px)')


  const [stats, setStats] = useState<DailyStats>({
    morningCheckIn: false,
    eveningReflection: false,
    tasksCompleted: 0,
    totalTasks: 0,
    mood: null,
    streak: 0,
    reflectionStreak: 0,
    avgMoodWeek: null,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadDailyStats = async () => {
      const userId = auth.currentUser?.uid
      if (!userId) {
        setLoading(false)
        return
      }

      try {
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        // Load today's check-in
        const checkInQuery = query(
          collection(db, 'checkIns'),
          where('userId', '==', userId),
          where('createdAt', '>=', Timestamp.fromDate(today))
        )
        const checkInSnapshot = await getDocs(checkInQuery)

        let morningCheckIn = false
        let eveningReflection = false
        let mood = null

        if (!checkInSnapshot.empty) {
          const checkInData = checkInSnapshot.docs[0].data()
          morningCheckIn = !!checkInData.morningData || !!checkInData.mood
          eveningReflection = !!checkInData.eveningData || !!checkInData.overallDay
          mood = checkInData.mood || checkInData.morningData?.mood || null
        }

        // Load today's assignments
        const assignmentsQuery = query(
          collection(db, 'assignments'),
          where('pirId', '==', userId),
          where('status', 'in', ['pending', 'in_progress', 'completed'])
        )
        const assignmentsSnapshot = await getDocs(assignmentsQuery)

        let tasksCompleted = 0
        let totalTasks = 0

        assignmentsSnapshot.forEach((docSnap) => {
          const assignment = docSnap.data()
          if (assignment.dueDate) {
            const dueDate = assignment.dueDate.toDate
              ? assignment.dueDate.toDate()
              : new Date(assignment.dueDate)
            const tomorrow = new Date(today)
            tomorrow.setDate(tomorrow.getDate() + 1)

            if (dueDate < tomorrow) {
              totalTasks++
              if (assignment.status === 'completed') {
                tasksCompleted++
              }
            }
          }
        })

        // Load streaks
        let streak = 0
        let reflectionStreak = 0
        const streakDoc = await getDoc(doc(db, 'streaks', userId))
        if (streakDoc.exists()) {
          const streakData = streakDoc.data()
          streak = streakData.currentStreak || 0
          reflectionStreak = streakData.reflectionStreak || 0
        }

        // Calculate weekly mood average
        const weekAgo = new Date(today)
        weekAgo.setDate(weekAgo.getDate() - 7)
        const weeklyCheckInQuery = query(
          collection(db, 'checkIns'),
          where('userId', '==', userId),
          where('createdAt', '>=', Timestamp.fromDate(weekAgo))
        )
        const weeklySnapshot = await getDocs(weeklyCheckInQuery)

        let moodSum = 0
        let moodCount = 0
        weeklySnapshot.forEach((docSnap) => {
          const data = docSnap.data()
          const docMood = data.mood || data.morningData?.mood
          if (docMood) {
            moodSum += docMood
            moodCount++
          }
        })
        const avgMoodWeek = moodCount > 0 ? moodSum / moodCount : null

        setStats({
          morningCheckIn,
          eveningReflection,
          tasksCompleted,
          totalTasks,
          mood,
          streak,
          reflectionStreak,
          avgMoodWeek,
        })
      } catch (error) {
        console.error('Error loading daily stats:', error)
      } finally {
        setLoading(false)
      }
    }

    loadDailyStats()
  }, [])

  const completionPercentage =
    stats.totalTasks > 0 ? Math.round((stats.tasksCompleted / stats.totalTasks) * 100) : 0

  const dailyProgress = [stats.morningCheckIn, stats.eveningReflection, stats.tasksCompleted > 0].filter(
    Boolean
  ).length

  // Loading state
  if (loading) {
    return (
      <EnhancedDialog open onOpenChange={onClose}>
        <EnhancedDialogContent
          variant={isMobile ? 'fullscreen' : 'sheet-right'}
          showCloseButton={false}
          className="p-0"
        >
          <div className="flex items-center justify-center h-full min-h-[400px]">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center gap-3"
            >
              <Loader2 className="h-10 w-10 animate-spin text-teal-500" />
              <p className="text-sm text-muted-foreground">Loading your day...</p>
            </motion.div>
          </div>
        </EnhancedDialogContent>
      </EnhancedDialog>
    )
  }

  return (
    <EnhancedDialog open onOpenChange={onClose}>
      <EnhancedDialogContent
        variant={isMobile ? 'fullscreen' : 'sheet-right'}
        showCloseButton={false}
        className="p-0 flex flex-col"
      >
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative bg-gradient-to-br from-teal-500 via-teal-600 to-emerald-600 p-6 pb-8"
        >
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-white/10 -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full bg-white/5 translate-y-1/2 -translate-x-1/2" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors z-10"
          >
            <X className="h-5 w-5 text-white" />
          </button>

          {/* Title and date */}
          <div className="flex items-start gap-4 relative z-10">
            <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm">
              <LayoutDashboard className="h-7 w-7 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-white">Today's Overview</h2>
              <p className="text-white/80 text-sm mt-0.5">
                {new Date().toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
          </div>

          {/* Progress ring */}
          <div className="flex justify-center mt-6">
            <ProgressRing value={dailyProgress} max={3} size={100} strokeWidth={10} color="#ffffff">
              <div className="text-center">
                <p className="text-3xl font-bold text-white">{dailyProgress}/3</p>
                <p className="text-xs text-white/70">Done</p>
              </div>
            </ProgressRing>
          </div>

          {/* Progress message */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center text-white/90 text-sm mt-3 font-medium"
          >
            {dailyProgress === 3
              ? "You're on fire today!"
              : dailyProgress === 2
                ? 'Almost there! One more to go.'
                : dailyProgress === 1
                  ? 'Good start! Keep the momentum.'
                  : "Let's make today count!"}
          </motion.p>
        </motion.div>

        {/* Content */}
        <ScrollArea className="flex-1">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className={cn('p-5 space-y-5', isMobile && 'p-4 space-y-4')}
          >
            {/* Check-in Status Section */}
            <motion.div variants={itemVariants}>
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="h-4 w-4 text-teal-600" />
                <h3 className="font-semibold text-foreground">Daily Check-ins</h3>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Morning */}
                <motion.div
                  variants={scaleInVariants}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    haptics.tap()
                    onOpenModal?.('morningCheckin')
                  }}
                  className={cn(
                    'p-4 rounded-xl border-2 text-center cursor-pointer transition-all',
                    stats.morningCheckIn
                      ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-300'
                      : 'bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200 hover:border-amber-300'
                  )}
                >
                  <motion.div
                    animate={
                      !stats.morningCheckIn
                        ? { scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }
                        : {}
                    }
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Sun
                      className={cn(
                        'h-10 w-10 mx-auto mb-2',
                        stats.morningCheckIn ? 'text-green-500' : 'text-amber-500'
                      )}
                    />
                  </motion.div>
                  <p className="font-semibold text-sm">Morning</p>
                  <div className="flex items-center justify-center gap-1 mt-2">
                    {stats.morningCheckIn ? (
                      <>
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-xs text-green-600 font-medium">Complete</span>
                      </>
                    ) : (
                      <>
                        <ArrowRight className="h-4 w-4 text-amber-500" />
                        <span className="text-xs text-amber-600 font-medium">Start</span>
                      </>
                    )}
                  </div>
                </motion.div>

                {/* Evening */}
                <motion.div
                  variants={scaleInVariants}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    haptics.tap()
                    onOpenModal?.('eveningReflection')
                  }}
                  className={cn(
                    'p-4 rounded-xl border-2 text-center cursor-pointer transition-all',
                    stats.eveningReflection
                      ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-300'
                      : 'bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200 hover:border-indigo-300'
                  )}
                >
                  <motion.div
                    animate={
                      !stats.eveningReflection
                        ? { y: [0, -3, 0] }
                        : {}
                    }
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Moon
                      className={cn(
                        'h-10 w-10 mx-auto mb-2',
                        stats.eveningReflection ? 'text-green-500' : 'text-indigo-500'
                      )}
                    />
                  </motion.div>
                  <p className="font-semibold text-sm">Evening</p>
                  <div className="flex items-center justify-center gap-1 mt-2">
                    {stats.eveningReflection ? (
                      <>
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-xs text-green-600 font-medium">Complete</span>
                      </>
                    ) : (
                      <>
                        <ArrowRight className="h-4 w-4 text-indigo-500" />
                        <span className="text-xs text-indigo-600 font-medium">Start</span>
                      </>
                    )}
                  </div>
                </motion.div>
              </div>
            </motion.div>

            {/* Stats Cards */}
            <motion.div variants={itemVariants} className="space-y-3">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="h-4 w-4 text-teal-600" />
                <h3 className="font-semibold text-foreground">Your Stats</h3>
              </div>

              <StatCard
                icon={Flame}
                label="Check-in Streak"
                value={`${stats.streak} days`}
                sublabel="Keep it going!"
                gradient="bg-gradient-to-r from-amber-50 to-orange-50"
                iconColor="text-orange-500"
                onClick={() => onOpenModal?.('streakHistory')}
              />

              <StatCard
                icon={Moon}
                label="Reflection Streak"
                value={`${stats.reflectionStreak} days`}
                sublabel="Evening reflections"
                gradient="bg-gradient-to-r from-indigo-50 to-purple-50"
                iconColor="text-indigo-500"
                onClick={() => onOpenModal?.('reflectionStreaks')}
              />

              <StatCard
                icon={Heart}
                label="Today's Mood"
                value={stats.mood !== null ? `${stats.mood}/10` : 'Not set'}
                sublabel={stats.avgMoodWeek ? `Weekly avg: ${stats.avgMoodWeek.toFixed(1)}` : undefined}
                gradient="bg-gradient-to-r from-rose-50 to-pink-50"
                iconColor={getMoodColor(stats.mood)}
                onClick={() => onOpenModal?.('moodPattern')}
              />

              <StatCard
                icon={Brain}
                label="Weekly Avg Mood"
                value={stats.avgMoodWeek ? stats.avgMoodWeek.toFixed(1) : '-'}
                sublabel="Last 7 days"
                gradient="bg-gradient-to-r from-purple-50 to-violet-50"
                iconColor="text-purple-500"
                onClick={() => onOpenModal?.('stats')}
              />
            </motion.div>

            {/* Tasks Progress */}
            {stats.totalTasks > 0 && (
              <motion.div variants={itemVariants}>
                <div className="flex items-center gap-2 mb-3">
                  <Target className="h-4 w-4 text-teal-600" />
                  <h3 className="font-semibold text-foreground">Task Progress</h3>
                </div>

                <div className="bg-white rounded-xl p-4 border shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-muted-foreground">
                      {stats.tasksCompleted} of {stats.totalTasks} completed
                    </span>
                    <span className="text-sm font-bold text-teal-600">{completionPercentage}%</span>
                  </div>
                  <motion.div variants={progressVariants} style={{ originX: 0 }}>
                    <Progress value={completionPercentage} className="h-3" />
                  </motion.div>
                </div>
              </motion.div>
            )}

            {/* Motivational Footer */}
            <motion.div
              variants={itemVariants}
              className="bg-gradient-to-r from-teal-50 via-emerald-50 to-green-50 rounded-xl p-5 border border-teal-100 text-center"
            >
              <div className="flex justify-center mb-2">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                >
                  <Sparkles className="h-8 w-8 text-teal-500" />
                </motion.div>
              </div>
              <p className="text-sm text-teal-800 font-medium">
                {dailyProgress === 3
                  ? "Amazing job today! You're building strong habits."
                  : 'Every small step counts towards your recovery journey.'}
              </p>
            </motion.div>
          </motion.div>
        </ScrollArea>
      </EnhancedDialogContent>
    </EnhancedDialog>
  )
}

export default DailyOverviewModal
