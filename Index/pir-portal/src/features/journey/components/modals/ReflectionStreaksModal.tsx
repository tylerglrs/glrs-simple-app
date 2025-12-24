import { useState, useEffect } from 'react'
import { Moon, Calendar, Loader2 } from 'lucide-react'
import { ResponsiveModal } from '@/components/ui/responsive-modal'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore'
import { db, auth } from '@/lib/firebase'
import type { StreakData } from '../../types'

// =============================================================================
// TYPES
// =============================================================================

export interface ReflectionStreaksModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  streakData: StreakData
}

interface ReflectionHistoryItem {
  date: string
  hasReflection: boolean
  overallDay?: number
  reflection?: string
}

// =============================================================================
// COMPONENT
// =============================================================================

export function ReflectionStreaksModal({
  open,
  onOpenChange,
  streakData,
}: ReflectionStreaksModalProps) {
  const [history, setHistory] = useState<ReflectionHistoryItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!open) return

    const loadHistory = async () => {
      const user = auth.currentUser
      if (!user) return

      setLoading(true)
      try {
        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

        const checkInsQuery = query(
          collection(db, 'checkIns'),
          where('userId', '==', user.uid),
          where('createdAt', '>=', thirtyDaysAgo),
          orderBy('createdAt', 'desc'),
          limit(60)
        )

        const snapshot = await getDocs(checkInsQuery)

        // Build history for last 30 days
        const historyMap = new Map<string, ReflectionHistoryItem>()

        for (let i = 0; i < 30; i++) {
          const date = new Date()
          date.setDate(date.getDate() - i)
          const dateStr = date.toISOString().split('T')[0]
          historyMap.set(dateStr, {
            date: dateStr,
            hasReflection: false,
          })
        }

        snapshot.docs.forEach((doc) => {
          const data = doc.data()
          const date = data.createdAt?.toDate?.() || new Date()
          const dateStr = date.toISOString().split('T')[0]

          if (data.eveningData?.reflection && historyMap.has(dateStr)) {
            historyMap.set(dateStr, {
              date: dateStr,
              hasReflection: true,
              overallDay: data.eveningData.overallDay,
              reflection: data.eveningData.reflection,
            })
          }
        })

        setHistory(Array.from(historyMap.values()))
      } catch (error) {
        console.error('Error loading reflection history:', error)
      } finally {
        setLoading(false)
      }
    }

    loadHistory()
  }, [open])

  return (
    <ResponsiveModal open={open} onOpenChange={onOpenChange} desktopSize="md">
      <div className="flex flex-col h-full bg-white overflow-hidden">
        <div className="px-4 py-3 border-b shrink-0">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Moon className="h-5 w-5 text-indigo-500" />
            Reflection History
          </h2>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Current Streak */}
        <div className="rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 p-4 text-center text-white">
          <div className="text-4xl font-bold">{streakData.current}</div>
          <div className="text-sm opacity-90">Day Reflection Streak</div>
          <div className="mt-2 text-xs opacity-75">
            Longest: {streakData.longest} days
          </div>
        </div>

        {/* History */}
        <div className="flex-1 overflow-y-auto -mx-6 px-6 mt-4">
          <h4 className="text-sm font-semibold mb-3 flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            Last 30 Days
          </h4>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="space-y-2">
              {history.map((item) => (
                <div
                  key={item.date}
                  className={cn(
                    'rounded-lg border p-3 transition-all',
                    item.hasReflection
                      ? 'bg-indigo-50 border-indigo-200'
                      : 'bg-muted/30 border-border'
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className={cn(
                          'h-3 w-3 rounded-full',
                          item.hasReflection ? 'bg-indigo-500' : 'bg-muted'
                        )}
                      />
                      <span className="text-sm font-medium">
                        {new Date(item.date).toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                    {item.hasReflection ? (
                      <span className="text-xs text-indigo-600 font-medium">
                        ✓ Reflected
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground">
                        Missed
                      </span>
                    )}
                  </div>
                  {item.reflection && (
                    <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                      {item.reflection}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-4 border-t shrink-0">
          <Button onClick={() => onOpenChange(false)} className="w-full">
            Close
          </Button>
        </div>
        </div>
      </div>
    </ResponsiveModal>
  )
}

export default ReflectionStreaksModal
