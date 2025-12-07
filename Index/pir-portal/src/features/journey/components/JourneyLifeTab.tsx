import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, Target, Award, Loader2, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import {
  GradientCard,
  AnimatedCounter,
  FireAnimation,
  JourneyIllustration,
  GoalsIllustration,
  CelebrationIllustration,
} from '@/components/common'
import {
  staggerContainer,
  staggerItem,
  haptics,
} from '@/lib/animations'
import { useJourneyData } from '../hooks/useJourneyData'
import { useCountdownGoals } from '../hooks/useCountdownGoals'
import { useStreaks } from '../hooks/useStreaks'
import StreakDisplay from './StreakDisplay'
import CountdownCard from './CountdownCard'

// =============================================================================
// TYPES
// =============================================================================

interface HeroCard {
  id: 'sobriety' | 'days' | 'milestone'
  icon: React.ReactNode
  label: string
  getValue: () => React.ReactNode
}

// =============================================================================
// COMPONENT
// =============================================================================

export function JourneyLifeTab() {
  const isMobile = useMediaQuery('(max-width: 768px)')
  const [heroCardIndex, setHeroCardIndex] = useState(0)
  const [touchStart, setTouchStart] = useState(0)
  const [touchEnd, setTouchEnd] = useState(0)
  const cardsRef = useRef<HTMLDivElement>(null)

  // Hooks
  const { userData, milestones, daysSober, nextMilestone, loading, error } = useJourneyData()
  const { goals: countdownGoals, loading: countdownLoading, deleteGoal, completeGoal } = useCountdownGoals()
  const { checkInStreak, reflectionStreak, loading: streaksLoading } = useStreaks()

  // Touch handlers for hero card swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return

    const distance = touchStart - touchEnd
    const threshold = 50

    if (distance > threshold && heroCardIndex < 2) {
      setHeroCardIndex(heroCardIndex + 1)
    } else if (distance < -threshold && heroCardIndex > 0) {
      setHeroCardIndex(heroCardIndex - 1)
    }

    setTouchStart(0)
    setTouchEnd(0)
  }

  // Format sobriety date
  const formatSobrietyDate = () => {
    if (!userData?.sobrietyDate) return null
    const [year, month, day] = userData.sobrietyDate.split('-').map(Number)
    const date = new Date(year, month - 1, day)
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    })
  }

  // Loading state
  if (loading) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Loading Journey...</p>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center gap-4 p-5">
        <AlertCircle className="h-12 w-12 text-destructive" />
        <p className="text-center text-destructive">{error}</p>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    )
  }

  // Hero cards configuration
  const heroCards: HeroCard[] = [
    {
      id: 'sobriety',
      icon: <Star className="h-12 w-12 text-white" strokeWidth={2} />,
      label: 'SOBRIETY DATE',
      getValue: () => {
        if (!userData?.sobrietyDate) {
          return (
            <div className="flex flex-col items-center">
              <JourneyIllustration size="sm" className="w-16 h-16 mb-2 opacity-80" />
              <span className="text-base">Set your sobriety date in profile</span>
            </div>
          )
        }
        return (
          <>
            <span className="text-3xl font-bold md:text-4xl">{formatSobrietyDate()}</span>
            <span className="mt-3 text-sm opacity-90">Your recovery journey started</span>
          </>
        )
      },
    },
    {
      id: 'days',
      icon: <FireAnimation size={56} />,
      label: 'DAYS SOBER',
      getValue: () => {
        if (!userData?.sobrietyDate) {
          return (
            <div className="flex flex-col items-center">
              <JourneyIllustration size="sm" className="w-16 h-16 mb-2 opacity-80" />
              <span className="text-base">Set your sobriety date in profile</span>
            </div>
          )
        }
        return (
          <>
            <span className="text-5xl font-bold md:text-6xl">
              <AnimatedCounter value={daysSober} duration={2} />
            </span>
            <span className="mt-3 text-sm opacity-90">Your streak continues</span>
          </>
        )
      },
    },
    {
      id: 'milestone',
      icon: <Target className="h-12 w-12 text-white" strokeWidth={2} />,
      label: 'NEXT MILESTONE',
      getValue: () => {
        if (!userData?.sobrietyDate) {
          return (
            <div className="flex flex-col items-center">
              <JourneyIllustration size="sm" className="w-16 h-16 mb-2 opacity-80" />
              <span className="text-base">Set your sobriety date in profile</span>
            </div>
          )
        }
        if (!nextMilestone) {
          return (
            <>
              <CelebrationIllustration size="sm" className="w-16 h-16 mb-2" />
              <span className="mt-1 text-xl font-bold">All Milestones Achieved!</span>
            </>
          )
        }
        return (
          <>
            <span className="text-5xl font-bold">{nextMilestone.daysUntil}</span>
            <span className="mt-3 text-base opacity-90">
              {nextMilestone.daysUntil === 1 ? 'day' : 'days'} until {nextMilestone.title}
            </span>
          </>
        )
      },
    },
  ]

  const currentCard = heroCards[heroCardIndex]

  return (
    <div className="flex flex-col">
      {/* Hero Cards Section */}
      <div className="w-full bg-gradient-to-br from-teal-500 to-cyan-600 py-6 relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white/5 -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-white/5 translate-y-1/2 -translate-x-1/3" />
          <div className="absolute top-1/4 left-1/4 w-4 h-4 rounded-full bg-white/20 animate-pulse" />
          <div className="absolute top-1/3 right-1/4 w-3 h-3 rounded-full bg-white/15 animate-pulse delay-100" />
          <div className="absolute bottom-1/3 left-1/3 w-2 h-2 rounded-full bg-white/10 animate-pulse delay-200" />
        </div>
        <div
          ref={cardsRef}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className="px-4 relative z-10"
        >
          {/* Navigation Arrows */}
          {heroCardIndex > 0 && (
            <button
              onClick={() => {
                haptics.tap()
                setHeroCardIndex(heroCardIndex - 1)
              }}
              className="absolute left-2 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
            >
              <ChevronLeft className="h-5 w-5 text-white" />
            </button>
          )}
          {heroCardIndex < 2 && (
            <button
              onClick={() => {
                haptics.tap()
                setHeroCardIndex(heroCardIndex + 1)
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
            >
              <ChevronRight className="h-5 w-5 text-white" />
            </button>
          )}

          {/* Current Hero Card with Animation */}
          <AnimatePresence mode="wait">
            <motion.div
              key={heroCardIndex}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ type: 'spring' as const, stiffness: 300, damping: 30 }}
              className={cn(
                'mx-auto flex min-h-[220px] flex-col items-center justify-center',
                'rounded-2xl border-2 border-white/30 bg-white/10 backdrop-blur-sm p-6 text-center text-white',
                'shadow-xl',
                isMobile ? 'max-w-full' : 'max-w-md'
              )}
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1, type: 'spring' as const, stiffness: 400 }}
              >
                {currentCard.icon}
              </motion.div>
              <p className="mt-4 text-xs font-semibold uppercase tracking-widest text-white/80">
                {currentCard.label}
              </p>
              <div className="mt-4 flex flex-col items-center">{currentCard.getValue()}</div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Pagination Dots */}
        <div className="mt-5 flex justify-center gap-3 pb-2">
          {heroCards.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                haptics.tap()
                setHeroCardIndex(index)
              }}
              className={cn(
                'h-2 rounded-full transition-all duration-300',
                heroCardIndex === index
                  ? 'w-8 bg-white'
                  : 'w-2 bg-white/50 hover:bg-white/70'
              )}
              aria-label={`Go to card ${index + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Padded Content Container */}
      <div className={cn('mx-auto w-full', isMobile ? 'px-4' : 'max-w-xl px-5')}>
        {/* Recovery Milestones */}
        {userData?.sobrietyDate && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-6"
          >
            <h4 className="mb-3 text-base font-semibold text-teal-700">Recovery Milestones</h4>
            <GradientCard gradient="from-teal-50 to-cyan-100">
              <CardContent className="py-4">
                <div className="overflow-x-auto pb-2">
                  <motion.div
                    variants={staggerContainer}
                    initial="hidden"
                    animate="show"
                    className="flex min-w-max items-center gap-8"
                  >
                    {milestones.map((milestone, index) => (
                      <motion.div
                        key={index}
                        variants={staggerItem}
                        className="relative flex min-w-[80px] flex-col items-center"
                      >
                        {/* Connecting Line */}
                        {index > 0 && (
                          <div
                            className={cn(
                              'absolute left-[-32px] top-5 h-0.5 w-8',
                              milestone.achieved ? 'bg-teal-500' : 'bg-teal-200'
                            )}
                          />
                        )}

                        {/* Milestone Marker */}
                        <div
                          className={cn(
                            'flex h-10 w-10 items-center justify-center rounded-full text-xl transition-transform hover:scale-110',
                            milestone.achieved
                              ? 'bg-gradient-to-br from-teal-500 to-cyan-600 text-white shadow-md'
                              : 'border-2 border-teal-200 bg-white text-teal-300'
                          )}
                        >
                          {milestone.achieved ? (
                            <Award className="h-5 w-5" />
                          ) : (
                            <span className="text-sm">{milestone.icon}</span>
                          )}
                        </div>

                        {/* Milestone Info */}
                        <span className="mt-2 text-xs font-medium text-slate-700">{milestone.title}</span>
                        <span className="text-xs text-slate-500">
                          {milestone.achieved ? 'Achieved' : `${milestone.daysUntil} days`}
                        </span>
                      </motion.div>
                    ))}
                  </motion.div>
                </div>
              </CardContent>
            </GradientCard>
          </motion.div>
        )}

        {/* Streak Cards */}
        <div className="mt-6">
          <h4 className="mb-3 text-base font-semibold text-primary">Your Streaks</h4>
          <StreakDisplay
            checkInStreak={checkInStreak}
            reflectionStreak={reflectionStreak}
            loading={streaksLoading}
            variant="cards"
          />
        </div>

        {/* Countdown Goals */}
        <div className="mt-6">
          <div className="mb-3 flex items-center justify-between">
            <h4 className="text-base font-semibold text-primary">Countdown Goals</h4>
            <Button variant="outline" size="sm" className="h-8 text-xs">
              + Add Goal
            </Button>
          </div>

          {countdownLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : countdownGoals.length === 0 ? (
            <div
              className={cn(
                'rounded-xl border-2 border-dashed border-muted-foreground/30 p-6',
                'text-center text-muted-foreground'
              )}
            >
              <div className="flex justify-center mb-3">
                <GoalsIllustration size="md" className="w-24 h-24 opacity-70" />
              </div>
              <p className="text-sm font-medium">No countdown goals yet</p>
              <p className="text-xs opacity-75 mt-1">Add a goal to track something special!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {countdownGoals.map((goal) => (
                <CountdownCard
                  key={goal.id}
                  goal={goal}
                  onDelete={deleteGoal}
                  onComplete={completeGoal}
                  variant="full"
                />
              ))}
            </div>
          )}
        </div>

        {/* Bottom Spacing */}
        <div className="h-8" />
      </div>
    </div>
  )
}

export default JourneyLifeTab
