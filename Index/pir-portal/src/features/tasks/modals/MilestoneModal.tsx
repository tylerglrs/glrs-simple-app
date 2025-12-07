import { useState, useEffect } from 'react'
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Progress } from '@/components/ui/progress'
import {
  Trophy,
  Star,
  Award,
  Target,
  X,
  Loader2,
  CheckCircle,
  PartyPopper,
  Sparkles,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { db, auth } from '@/lib/firebase'
import { doc, getDoc } from 'firebase/firestore'

// =============================================================================
// TYPES
// =============================================================================

export interface MilestoneModalProps {
  onClose: () => void
}

interface Milestone {
  days: number
  label: string
  icon: string
  description: string
  color: string
}

// =============================================================================
// MILESTONE DATA
// =============================================================================

const milestones: Milestone[] = [
  { days: 1, label: '1 Day', icon: 'star', description: 'First day of recovery - the hardest step is behind you!', color: 'bg-yellow-500' },
  { days: 7, label: '1 Week', icon: 'trophy', description: 'One full week! Your body is starting to heal.', color: 'bg-orange-500' },
  { days: 14, label: '2 Weeks', icon: 'award', description: 'Two weeks strong! Sleep and energy improving.', color: 'bg-amber-500' },
  { days: 30, label: '1 Month', icon: 'star', description: 'A full month! Major accomplishment achieved.', color: 'bg-green-500' },
  { days: 60, label: '2 Months', icon: 'trophy', description: 'Two months! New habits are forming.', color: 'bg-teal-500' },
  { days: 90, label: '3 Months', icon: 'award', description: 'Three months - a true milestone in recovery!', color: 'bg-blue-500' },
  { days: 180, label: '6 Months', icon: 'star', description: 'Half a year! Your brain is rewiring.', color: 'bg-indigo-500' },
  { days: 365, label: '1 Year', icon: 'trophy', description: 'One full year! Incredible achievement.', color: 'bg-purple-500' },
  { days: 730, label: '2 Years', icon: 'award', description: 'Two years of freedom and growth.', color: 'bg-pink-500' },
  { days: 1095, label: '3 Years', icon: 'star', description: 'Three years - you are an inspiration!', color: 'bg-rose-500' },
  { days: 1825, label: '5 Years', icon: 'trophy', description: 'Five years of transformation.', color: 'bg-gradient-to-r from-yellow-500 to-orange-500' },
  { days: 3650, label: '10 Years', icon: 'award', description: 'A decade of recovery. Legendary!', color: 'bg-gradient-to-r from-purple-500 to-pink-500' },
]

// =============================================================================
// COMPONENT
// =============================================================================

export function MilestoneModal({ onClose }: MilestoneModalProps) {
  const isMobile = useMediaQuery('(max-width: 768px)')
  const [sobrietyDays, setSobrietyDays] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadSobrietyDays = async () => {
      const userId = auth.currentUser?.uid
      if (!userId) {
        setLoading(false)
        return
      }

      try {
        const userDoc = await getDoc(doc(db, 'users', userId))
        if (userDoc.exists()) {
          const userData = userDoc.data()
          if (userData.sobrietyStartDate) {
            const startDate = userData.sobrietyStartDate.toDate
              ? userData.sobrietyStartDate.toDate()
              : new Date(userData.sobrietyStartDate)
            const now = new Date()
            const diffTime = Math.abs(now.getTime() - startDate.getTime())
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
            setSobrietyDays(diffDays)
          }
        }
      } catch (error) {
        console.error('Error loading sobriety days:', error)
      } finally {
        setLoading(false)
      }
    }

    loadSobrietyDays()
  }, [])

  // Find current and next milestone
  const achievedMilestones = milestones.filter(m => sobrietyDays >= m.days)
  const nextMilestone = milestones.find(m => sobrietyDays < m.days)
  const currentMilestone = achievedMilestones[achievedMilestones.length - 1]

  // Calculate progress to next milestone
  const progressToNext = nextMilestone
    ? ((sobrietyDays - (currentMilestone?.days || 0)) /
       (nextMilestone.days - (currentMilestone?.days || 0))) * 100
    : 100

  const daysUntilNext = nextMilestone ? nextMilestone.days - sobrietyDays : 0

  if (loading) {
    return (
      <DialogContent className="max-w-[95vw] sm:max-w-[500px]">
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-teal-500" />
        </div>
      </DialogContent>
    )
  }

  return (
    <DialogContent className="max-w-[95vw] sm:max-w-[500px] p-0">
      {/* Header */}
      <DialogHeader className="p-5 pb-4 border-b bg-gradient-to-r from-purple-50 to-pink-50">
        <div className="flex items-center justify-between">
          <DialogTitle className="flex items-center gap-2 text-lg font-semibold text-purple-700">
            <Trophy className="h-5 w-5" />
            Recovery Milestones
          </DialogTitle>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
            <X className="h-5 w-5" />
          </Button>
        </div>
      </DialogHeader>

      <ScrollArea className="max-h-[60vh]">
        <div className={cn('p-5 space-y-5', isMobile && 'p-4 space-y-4')}>
          {/* Current Progress */}
          <div className="bg-gradient-to-br from-teal-500 to-green-500 rounded-xl p-5 text-white text-center">
            <Sparkles className="h-10 w-10 mx-auto mb-2 opacity-90" />
            <p className="text-5xl font-bold mb-1">{sobrietyDays}</p>
            <p className="text-lg opacity-90">Days in Recovery</p>
            {nextMilestone && (
              <p className="text-sm mt-2 opacity-80">
                {daysUntilNext} days until {nextMilestone.label}
              </p>
            )}
          </div>

          {/* Next Milestone Progress */}
          {nextMilestone && (
            <div className="bg-white rounded-lg p-4 border shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-foreground">
                  Progress to {nextMilestone.label}
                </span>
                <span className="text-sm text-muted-foreground">
                  {Math.round(progressToNext)}%
                </span>
              </div>
              <Progress value={progressToNext} className="h-3" />
              <p className="text-xs text-muted-foreground mt-2">
                {nextMilestone.description}
              </p>
            </div>
          )}

          {/* Milestones Timeline */}
          <div className="space-y-3">
            <h3 className="font-semibold text-foreground">Your Journey</h3>
            {milestones.map((milestone) => {
              const isAchieved = sobrietyDays >= milestone.days
              const isCurrent = currentMilestone?.days === milestone.days
              const isNext = nextMilestone?.days === milestone.days

              return (
                <div
                  key={milestone.days}
                  className={cn(
                    'flex items-center gap-3 p-3 rounded-lg border',
                    isAchieved && 'bg-green-50 border-green-200',
                    isNext && 'bg-purple-50 border-purple-200',
                    !isAchieved && !isNext && 'bg-gray-50 border-gray-200 opacity-60'
                  )}
                >
                  <div
                    className={cn(
                      'w-10 h-10 rounded-full flex items-center justify-center',
                      isAchieved ? 'bg-green-500 text-white' :
                      isNext ? 'bg-purple-500 text-white' :
                      'bg-gray-300 text-gray-500'
                    )}
                  >
                    {isAchieved ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : milestone.icon === 'star' ? (
                      <Star className="h-5 w-5" />
                    ) : milestone.icon === 'trophy' ? (
                      <Trophy className="h-5 w-5" />
                    ) : (
                      <Award className="h-5 w-5" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        'font-semibold',
                        isAchieved ? 'text-green-700' :
                        isNext ? 'text-purple-700' :
                        'text-gray-500'
                      )}>
                        {milestone.label}
                      </span>
                      {isCurrent && (
                        <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded-full">
                          Current
                        </span>
                      )}
                      {isNext && (
                        <span className="text-xs bg-purple-500 text-white px-2 py-0.5 rounded-full">
                          Next
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {milestone.description}
                    </p>
                  </div>
                  {isAchieved && (
                    <PartyPopper className="h-5 w-5 text-green-500" />
                  )}
                </div>
              )
            })}
          </div>

          {/* Encouragement */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-100 text-center">
            <Target className="h-8 w-8 mx-auto text-purple-500 mb-2" />
            <p className="text-sm text-purple-800">
              Every day in recovery is a victory. Keep going - you're doing amazing!
            </p>
          </div>
        </div>
      </ScrollArea>
    </DialogContent>
  )
}

export default MilestoneModal
