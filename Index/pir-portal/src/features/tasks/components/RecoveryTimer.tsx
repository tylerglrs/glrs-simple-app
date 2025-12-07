import { useState, useEffect } from 'react'
import { Award, Calendar, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

// =============================================================================
// TYPES
// =============================================================================

export interface RecoveryTimerProps {
  startDate: Date | null
  variant?: 'compact' | 'full' | 'hero'
  showMilestone?: boolean
  className?: string
}

interface TimeBreakdown {
  years: number
  months: number
  days: number
  hours: number
  minutes: number
  seconds: number
  totalDays: number
}

interface Milestone {
  days: number
  label: string
  achieved: boolean
}

// =============================================================================
// HELPERS
// =============================================================================

const calculateTimeBreakdown = (startDate: Date): TimeBreakdown => {
  const now = new Date()
  const diff = now.getTime() - startDate.getTime()

  const totalDays = Math.floor(diff / (1000 * 60 * 60 * 24))
  const years = Math.floor(totalDays / 365)
  const remainingDays = totalDays % 365
  const months = Math.floor(remainingDays / 30)
  const days = remainingDays % 30

  const totalHours = Math.floor(diff / (1000 * 60 * 60))
  const hours = totalHours % 24

  const totalMinutes = Math.floor(diff / (1000 * 60))
  const minutes = totalMinutes % 60

  const totalSeconds = Math.floor(diff / 1000)
  const seconds = totalSeconds % 60

  return { years, months, days, hours, minutes, seconds, totalDays }
}

const getMilestones = (totalDays: number): Milestone[] => {
  const milestoneList = [
    { days: 1, label: '1 Day' },
    { days: 7, label: '1 Week' },
    { days: 14, label: '2 Weeks' },
    { days: 30, label: '1 Month' },
    { days: 60, label: '2 Months' },
    { days: 90, label: '3 Months' },
    { days: 180, label: '6 Months' },
    { days: 365, label: '1 Year' },
    { days: 730, label: '2 Years' },
    { days: 1095, label: '3 Years' },
    { days: 1825, label: '5 Years' },
    { days: 3650, label: '10 Years' },
  ]

  return milestoneList.map(m => ({
    ...m,
    achieved: totalDays >= m.days,
  }))
}

const getNextMilestone = (milestones: Milestone[]): Milestone | null => {
  return milestones.find(m => !m.achieved) || null
}

// =============================================================================
// COMPONENT
// =============================================================================

export function RecoveryTimer({
  startDate,
  variant = 'full',
  showMilestone = true,
  className,
}: RecoveryTimerProps) {
  const [time, setTime] = useState<TimeBreakdown | null>(null)

  useEffect(() => {
    if (!startDate) return

    const updateTime = () => {
      setTime(calculateTimeBreakdown(startDate))
    }

    updateTime()
    const interval = setInterval(updateTime, 1000)

    return () => clearInterval(interval)
  }, [startDate])

  if (!startDate || !time) {
    return (
      <div className={cn('text-center py-4', className)}>
        <p className="text-sm text-muted-foreground">
          Set your recovery start date to track your progress
        </p>
      </div>
    )
  }

  const milestones = getMilestones(time.totalDays)
  const nextMilestone = getNextMilestone(milestones)
  const daysToNextMilestone = nextMilestone
    ? nextMilestone.days - time.totalDays
    : 0

  if (variant === 'compact') {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <Award className="h-5 w-5 text-teal-500" />
        <span className="text-lg font-bold text-teal-600">
          {time.totalDays}
        </span>
        <span className="text-sm text-muted-foreground">days</span>
      </div>
    )
  }

  if (variant === 'hero') {
    return (
      <div className={cn(
        'bg-gradient-to-br from-teal-500 to-green-500 rounded-2xl p-6 text-white text-center',
        className
      )}>
        <Award className="h-12 w-12 mx-auto mb-3 opacity-90" />
        <p className="text-6xl font-bold mb-1">{time.totalDays}</p>
        <p className="text-lg opacity-90 mb-4">Days in Recovery</p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-center">
          <div className="bg-white/20 rounded-lg p-2">
            <p className="text-2xl font-bold">{time.years}</p>
            <p className="text-xs opacity-80">Years</p>
          </div>
          <div className="bg-white/20 rounded-lg p-2">
            <p className="text-2xl font-bold">{time.months}</p>
            <p className="text-xs opacity-80">Months</p>
          </div>
          <div className="bg-white/20 rounded-lg p-2">
            <p className="text-2xl font-bold">{time.days}</p>
            <p className="text-xs opacity-80">Days</p>
          </div>
          <div className="bg-white/20 rounded-lg p-2">
            <p className="text-2xl font-bold">{String(time.hours).padStart(2, '0')}</p>
            <p className="text-xs opacity-80">Hours</p>
          </div>
        </div>

        {showMilestone && nextMilestone && (
          <div className="mt-4 pt-4 border-t border-white/20">
            <p className="text-sm opacity-80">
              {daysToNextMilestone} days until {nextMilestone.label}
            </p>
          </div>
        )}
      </div>
    )
  }

  // Default: full
  return (
    <div className={cn('rounded-xl border bg-white p-4 md:p-5 shadow-sm', className)}>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center">
          <Award className="h-6 w-6 text-teal-600" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground">Recovery Timer</h3>
          <p className="text-sm text-muted-foreground">Your journey continues</p>
        </div>
      </div>

      <div className="text-center py-4">
        <p className="text-5xl font-bold text-teal-600 mb-1">{time.totalDays}</p>
        <p className="text-sm text-muted-foreground">Days Strong</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
        <div className="text-center bg-gray-50 rounded-lg p-2">
          <p className="text-xl font-bold text-foreground">{time.years}</p>
          <p className="text-xs text-muted-foreground">Yrs</p>
        </div>
        <div className="text-center bg-gray-50 rounded-lg p-2">
          <p className="text-xl font-bold text-foreground">{time.months}</p>
          <p className="text-xs text-muted-foreground">Mo</p>
        </div>
        <div className="text-center bg-gray-50 rounded-lg p-2">
          <p className="text-xl font-bold text-foreground">{time.days}</p>
          <p className="text-xs text-muted-foreground">Days</p>
        </div>
        <div className="text-center bg-gray-50 rounded-lg p-2">
          <p className="text-xl font-bold text-foreground font-mono">
            {String(time.hours).padStart(2, '0')}:{String(time.minutes).padStart(2, '0')}
          </p>
          <p className="text-xs text-muted-foreground">Time</p>
        </div>
      </div>

      {showMilestone && nextMilestone && (
        <div className="bg-teal-50 rounded-lg p-3 flex items-center gap-3">
          <Sparkles className="h-5 w-5 text-teal-500 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-teal-700">
              Next: {nextMilestone.label}
            </p>
            <p className="text-xs text-teal-600">
              {daysToNextMilestone} days to go
            </p>
          </div>
        </div>
      )}

      <div className="flex items-center justify-center gap-1 mt-3 text-xs text-muted-foreground">
        <Calendar className="h-3 w-3" />
        <span>Started {startDate.toLocaleDateString()}</span>
      </div>
    </div>
  )
}

export default RecoveryTimer
