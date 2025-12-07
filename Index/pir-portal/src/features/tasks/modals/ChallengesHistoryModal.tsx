import { useState, useEffect } from 'react'
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AlertTriangle, X, Loader2, Calendar, CheckCircle, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { db, auth } from '@/lib/firebase'
import { collection, query, where, orderBy, onSnapshot, Timestamp } from 'firebase/firestore'
import { formatDateTime } from '../hooks/useTasksModalData'

// =============================================================================
// TYPES
// =============================================================================

export interface ChallengesHistoryModalProps {
  onClose: () => void
}

interface Challenge {
  id: string
  userId: string
  name: string
  description?: string
  status: 'active' | 'completed' | 'failed'
  startDate: Timestamp | Date
  endDate?: Timestamp | Date
  createdAt: Timestamp | Date
}

type FilterPeriod = 'all' | 'week' | 'month'

// =============================================================================
// COMPONENT
// =============================================================================

export function ChallengesHistoryModal({ onClose }: ChallengesHistoryModalProps) {
  const isMobile = useMediaQuery('(max-width: 768px)')
  const [challenges, setChallenges] = useState<Challenge[]>([])
  const [loading, setLoading] = useState(true)
  const [filterPeriod, setFilterPeriod] = useState<FilterPeriod>('all')

  useEffect(() => {
    const userId = auth.currentUser?.uid
    if (!userId) {
      setChallenges([])
      setLoading(false)
      return
    }

    const challengesQuery = query(
      collection(db, 'challenges'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    )

    const unsubscribe = onSnapshot(
      challengesQuery,
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Challenge[]
        setChallenges(data)
        setLoading(false)
      },
      (err) => {
        console.error('Error loading challenges:', err)
        setChallenges([])
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [])

  // Filter challenges by period
  const filteredChallenges = challenges.filter((challenge) => {
    const date =
      challenge.createdAt instanceof Date
        ? challenge.createdAt
        : challenge.createdAt.toDate()

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

  // Calculate stats
  const stats = {
    total: filteredChallenges.length,
    completed: filteredChallenges.filter((c) => c.status === 'completed').length,
    active: filteredChallenges.filter((c) => c.status === 'active').length,
  }

  const successRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <AlertTriangle className="h-4 w-4 text-orange-500" />
    }
  }

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-50 border-green-200'
      case 'failed':
        return 'bg-red-50 border-red-200'
      default:
        return 'bg-orange-50 border-orange-200'
    }
  }

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
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Challenges History
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
              <TabsTrigger value="all" className="flex-1">
                All Time
              </TabsTrigger>
              <TabsTrigger value="month" className="flex-1">
                This Month
              </TabsTrigger>
              <TabsTrigger value="week" className="flex-1">
                This Week
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </DialogHeader>

      <ScrollArea className="max-h-[55vh]">
        <div className={cn('p-5 space-y-5', isMobile && 'p-4 space-y-4')}>
          {/* Stats Summary */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-gray-50 rounded-lg p-3 text-center border">
              <p className="text-xl font-bold text-foreground">{stats.total}</p>
              <p className="text-xs text-muted-foreground">Total</p>
            </div>
            <div className="bg-green-50 rounded-lg p-3 text-center border border-green-100">
              <p className="text-xl font-bold text-green-600">{stats.completed}</p>
              <p className="text-xs text-muted-foreground">Completed</p>
            </div>
            <div className="bg-blue-50 rounded-lg p-3 text-center border border-blue-100">
              <p className="text-xl font-bold text-blue-600">{successRate}%</p>
              <p className="text-xs text-muted-foreground">Success Rate</p>
            </div>
          </div>

          {/* Challenges List */}
          {filteredChallenges.length === 0 ? (
            <div className="text-center py-10">
              <AlertTriangle className="h-12 w-12 mx-auto text-gray-300 mb-3" />
              <h3 className="font-semibold text-foreground mb-1">No Challenges Yet</h3>
              <p className="text-sm text-muted-foreground">
                Start taking on challenges to push your recovery forward.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredChallenges.map((challenge) => (
                <div
                  key={challenge.id}
                  className={cn('p-4 rounded-lg border', getStatusBg(challenge.status))}
                >
                  <div className="flex items-start gap-3">
                    {getStatusIcon(challenge.status)}
                    <div className="flex-1">
                      <h4 className="font-medium text-foreground">{challenge.name}</h4>
                      {challenge.description && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {challenge.description}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          {formatDateTime(challenge.createdAt)}
                        </span>
                        <span
                          className={cn(
                            'text-xs px-1.5 py-0.5 rounded capitalize',
                            challenge.status === 'completed' && 'bg-green-100 text-green-700',
                            challenge.status === 'failed' && 'bg-red-100 text-red-700',
                            challenge.status === 'active' && 'bg-orange-100 text-orange-700'
                          )}
                        >
                          {challenge.status}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </ScrollArea>
    </DialogContent>
  )
}

export default ChallengesHistoryModal
