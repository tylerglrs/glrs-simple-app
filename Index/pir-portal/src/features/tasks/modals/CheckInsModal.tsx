import { useState, useEffect } from 'react'
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Calendar, X, Loader2, Sun, Moon, CheckCircle } from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { Illustration } from '@/components/common/Illustration'
import {
  db,
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  Timestamp,
  auth,
} from '@/lib/firebase'

// =============================================================================
// TYPES
// =============================================================================

export interface CheckInsModalProps {
  onClose: () => void
}

type FilterPeriod = 'all' | 'week' | 'month'

interface CheckIn {
  id: string
  userId: string
  type: 'morning' | 'evening'
  mood?: number
  craving?: number
  anxiety?: number
  sleep?: number
  createdAt: Timestamp | Date
}

// =============================================================================
// HELPERS
// =============================================================================

function getDateString(date?: Date): string {
  const d = date || new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
}

// =============================================================================
// COMPONENT
// =============================================================================

export function CheckInsModal({ onClose }: CheckInsModalProps) {
  const isMobile = useMediaQuery('(max-width: 768px)')
  const [checkIns, setCheckIns] = useState<CheckIn[]>([])
  const [loading, setLoading] = useState(true)
  const [filterPeriod, setFilterPeriod] = useState<FilterPeriod>('week') // Default to week to match card

  // Load all check-ins
  useEffect(() => {
    const userId = auth.currentUser?.uid
    if (!userId) {
      setCheckIns([])
      setLoading(false)
      return
    }

    const checkInsQuery = query(
      collection(db, 'checkIns'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    )

    const unsubscribe = onSnapshot(
      checkInsQuery,
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as CheckIn[]
        setCheckIns(data)
        setLoading(false)
      },
      (err) => {
        console.error('Error loading check-ins:', err)
        setCheckIns([])
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [])

  // Filter check-ins by period
  const filteredCheckIns = checkIns.filter((checkIn) => {
    const date =
      checkIn.createdAt instanceof Date
        ? checkIn.createdAt
        : checkIn.createdAt.toDate()

    if (filterPeriod === 'week') {
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      return date >= weekAgo
    }

    if (filterPeriod === 'month') {
      const monthAgo = new Date()
      monthAgo.setMonth(monthAgo.getMonth() - 1)
      return date >= monthAgo
    }

    return true
  })

  // Calculate check-in rate for the period
  const calculateCheckRate = () => {
    let daysInPeriod = 31 // default for "all" (last 31 days shown)

    if (filterPeriod === 'week') {
      daysInPeriod = 7
    } else if (filterPeriod === 'month') {
      daysInPeriod = 30
    } else {
      // For "all time", calculate based on first check-in date
      if (checkIns.length > 0) {
        const firstCheckIn = checkIns[checkIns.length - 1]
        const firstDate =
          firstCheckIn.createdAt instanceof Date
            ? firstCheckIn.createdAt
            : firstCheckIn.createdAt.toDate()
        const daysSinceFirst = Math.max(1, Math.ceil((Date.now() - firstDate.getTime()) / (1000 * 60 * 60 * 24)))
        daysInPeriod = Math.min(daysSinceFirst, 365) // Cap at 365 days
      }
    }

    // Count unique days with morning check-ins
    const uniqueDates = new Set(
      filteredCheckIns
        .filter((c) => c.type === 'morning')
        .map((c) => {
          const date =
            c.createdAt instanceof Date
              ? c.createdAt
              : c.createdAt.toDate()
          return getDateString(date)
        })
    )

    return Math.min(100, Math.round((uniqueDates.size / daysInPeriod) * 100))
  }

  // Group check-ins by date
  const groupedCheckIns = filteredCheckIns.reduce((acc, checkIn) => {
    const date =
      checkIn.createdAt instanceof Date
        ? checkIn.createdAt
        : checkIn.createdAt.toDate()
    const dateKey = getDateString(date)

    if (!acc[dateKey]) {
      acc[dateKey] = { morning: null as CheckIn | null, evening: null as CheckIn | null }
    }

    if (checkIn.type === 'morning') {
      acc[dateKey].morning = checkIn
    } else if (checkIn.type === 'evening') {
      acc[dateKey].evening = checkIn
    }

    return acc
  }, {} as Record<string, { morning: CheckIn | null; evening: CheckIn | null }>)

  const sortedDates = Object.keys(groupedCheckIns).sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime()
  )

  const checkRate = calculateCheckRate()
  const totalMorningCheckIns = filteredCheckIns.filter((c) => c.type === 'morning').length
  const totalEveningCheckIns = filteredCheckIns.filter((c) => c.type === 'evening').length

  if (loading) {
    return (
      <DialogContent className="max-w-[95vw] sm:max-w-[550px]">
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-teal-500" />
        </div>
      </DialogContent>
    )
  }

  return (
    <DialogContent className="max-w-[95vw] sm:max-w-[550px] p-0">
      {/* Header */}
      <DialogHeader className="p-5 pb-4 border-b">
        <div className="flex items-center justify-between">
          <DialogTitle className="flex items-center gap-2 text-lg font-semibold">
            <Calendar className="h-5 w-5 text-teal-600" />
            Check Ins
          </DialogTitle>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Filter Tabs */}
        <div className="pt-3">
          <Tabs
            value={filterPeriod}
            onValueChange={(v) => setFilterPeriod(v as FilterPeriod)}
          >
            <TabsList className="w-full">
              <TabsTrigger value="week" className="flex-1">
                This Week
              </TabsTrigger>
              <TabsTrigger value="month" className="flex-1">
                This Month
              </TabsTrigger>
              <TabsTrigger value="all" className="flex-1">
                All Time
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </DialogHeader>

      <ScrollArea className="max-h-[55vh]">
        <div className="p-4 space-y-4 md:p-5 md:space-y-5">
          {/* Stats Summary */}
          <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-xl p-5 text-center border border-teal-100">
            <p className="text-sm text-muted-foreground mb-2">Check-In Rate</p>
            <p className="text-4xl font-bold text-teal-600 mb-3">
              {checkRate}%
            </p>
            <Progress value={checkRate} className="h-2 mb-3" />
            <div className="flex justify-center gap-6 text-sm">
              <div className="flex items-center gap-1.5">
                <Sun className="h-4 w-4 text-amber-500" />
                <span className="text-muted-foreground">
                  {totalMorningCheckIns} morning
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <Moon className="h-4 w-4 text-indigo-500" />
                <span className="text-muted-foreground">
                  {totalEveningCheckIns} evening
                </span>
              </div>
            </div>
          </div>

          {/* Check-ins List */}
          {sortedDates.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-10 bg-gradient-to-br from-teal-50 to-cyan-50 rounded-xl border-2 border-dashed border-teal-200"
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                className="mb-4"
              >
                <Illustration name="no-checkins" size="lg" className="mx-auto opacity-85" />
              </motion.div>
              <motion.h3
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="font-semibold text-foreground mb-1"
              >
                No Check-Ins Yet
              </motion.h3>
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-sm text-muted-foreground px-4"
              >
                Start tracking your daily progress with morning check-ins.
              </motion.p>
            </motion.div>
          ) : (
            <div className="space-y-2">
              {sortedDates.map((dateKey) => {
                const dayData = groupedCheckIns[dateKey]
                const displayDate = new Date(dateKey)
                const isToday = dateKey === getDateString()
                const isYesterday = dateKey === getDateString(new Date(Date.now() - 86400000))

                let dateLabel = formatDate(displayDate)
                if (isToday) dateLabel = 'Today'
                if (isYesterday) dateLabel = 'Yesterday'

                return (
                  <div
                    key={dateKey}
                    className={cn(
                      'flex items-center justify-between p-3 rounded-lg border',
                      isToday ? 'bg-teal-50 border-teal-200' : 'bg-gray-50 border-gray-100'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div>
                        <p className={cn(
                          'text-sm font-medium',
                          isToday ? 'text-teal-600' : 'text-foreground'
                        )}>
                          {dateLabel}
                        </p>
                        {dayData.morning?.mood !== undefined && (
                          <p className="text-xs text-muted-foreground">
                            Mood: {dayData.morning.mood}/10
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Morning Check-in */}
                      <div
                        className={cn(
                          'flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium',
                          dayData.morning
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-400'
                        )}
                      >
                        <Sun className="h-3 w-3" />
                        {dayData.morning ? (
                          <CheckCircle className="h-3 w-3" />
                        ) : (
                          <span>-</span>
                        )}
                      </div>

                      {/* Evening Reflection */}
                      <div
                        className={cn(
                          'flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium',
                          dayData.evening
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-400'
                        )}
                      >
                        <Moon className="h-3 w-3" />
                        {dayData.evening ? (
                          <CheckCircle className="h-3 w-3" />
                        ) : (
                          <span>-</span>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </ScrollArea>
    </DialogContent>
  )
}

export default CheckInsModal
