import { useState, useEffect } from 'react'
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  BookOpen,
  X,
  Loader2,
  Calendar,
  ChevronDown,
  ChevronUp,
  Sparkles,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { db, auth } from '@/lib/firebase'
import { collection, query, where, orderBy, onSnapshot, Timestamp } from 'firebase/firestore'

// =============================================================================
// TYPES
// =============================================================================

export interface PastReflectionsModalProps {
  onClose: () => void
}

interface Reflection {
  id: string
  promptResponse?: string
  overallDay?: number
  challenges?: string
  gratitude?: string
  tomorrowGoal?: string
  createdAt: Timestamp | Date
}

// =============================================================================
// HELPERS
// =============================================================================

const formatDate = (date: Timestamp | Date): string => {
  const d = date instanceof Timestamp ? date.toDate() : new Date(date)
  return d.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
}

// =============================================================================
// COMPONENT
// =============================================================================

export function PastReflectionsModal({ onClose }: PastReflectionsModalProps) {
  const isMobile = useMediaQuery('(max-width: 768px)')
  const [reflections, setReflections] = useState<Reflection[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [period, setPeriod] = useState<'week' | 'month' | 'all'>('week')

  useEffect(() => {
    const userId = auth.currentUser?.uid
    if (!userId) {
      setLoading(false)
      return
    }

    const now = new Date()
    let startDate: Date

    if (period === 'week') {
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    } else if (period === 'month') {
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    } else {
      startDate = new Date(0) // All time
    }

    const q = query(
      collection(db, 'checkIns'),
      where('userId', '==', userId),
      where('createdAt', '>=', Timestamp.fromDate(startDate)),
      orderBy('createdAt', 'desc')
    )

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs
          .map(doc => ({
            id: doc.id,
            ...doc.data(),
          } as Reflection))
          .filter(r => r.overallDay !== undefined || r.promptResponse)

        setReflections(data)
        setLoading(false)
      },
      (error) => {
        console.error('Error loading reflections:', error)
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [period])

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id)
  }

  const getOverallDayEmoji = (score: number | undefined) => {
    if (score === undefined) return ''
    if (score >= 8) return '😊'
    if (score >= 6) return '🙂'
    if (score >= 4) return '😐'
    if (score >= 2) return '😔'
    return '😢'
  }

  if (loading) {
    return (
      <DialogContent className="max-w-[95vw] sm:max-w-[500px]">
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
        </div>
      </DialogContent>
    )
  }

  return (
    <DialogContent className="max-w-[95vw] sm:max-w-[500px] p-0">
      {/* Header */}
      <DialogHeader className="p-5 pb-4 border-b">
        <div className="flex items-center justify-between">
          <DialogTitle className="flex items-center gap-2 text-lg font-semibold text-indigo-700">
            <BookOpen className="h-5 w-5" />
            Past Reflections
          </DialogTitle>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
            <X className="h-5 w-5" />
          </Button>
        </div>
      </DialogHeader>

      <div className={cn('p-5 pt-4', isMobile && 'p-4 pt-3')}>
        {/* Period Tabs */}
        <Tabs defaultValue="week" className="w-full" onValueChange={(v) => setPeriod(v as 'week' | 'month' | 'all')}>
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="week">This Week</TabsTrigger>
            <TabsTrigger value="month">This Month</TabsTrigger>
            <TabsTrigger value="all">All Time</TabsTrigger>
          </TabsList>

          <ScrollArea className="h-[45vh]">
            <TabsContent value="week" className="mt-0">
              <ReflectionsList
                reflections={reflections}
                expandedId={expandedId}
                toggleExpand={toggleExpand}
                getOverallDayEmoji={getOverallDayEmoji}
              />
            </TabsContent>
            <TabsContent value="month" className="mt-0">
              <ReflectionsList
                reflections={reflections}
                expandedId={expandedId}
                toggleExpand={toggleExpand}
                getOverallDayEmoji={getOverallDayEmoji}
              />
            </TabsContent>
            <TabsContent value="all" className="mt-0">
              <ReflectionsList
                reflections={reflections}
                expandedId={expandedId}
                toggleExpand={toggleExpand}
                getOverallDayEmoji={getOverallDayEmoji}
              />
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </div>
    </DialogContent>
  )
}

// =============================================================================
// SUB-COMPONENTS
// =============================================================================

interface ReflectionsListProps {
  reflections: Reflection[]
  expandedId: string | null
  toggleExpand: (id: string) => void
  getOverallDayEmoji: (score: number | undefined) => string
}

function ReflectionsList({ reflections, expandedId, toggleExpand, getOverallDayEmoji }: ReflectionsListProps) {
  if (reflections.length === 0) {
    return (
      <div className="text-center py-10">
        <Sparkles className="h-12 w-12 mx-auto text-gray-300 mb-3" />
        <h3 className="font-semibold text-foreground mb-1">No Reflections Yet</h3>
        <p className="text-sm text-muted-foreground">
          Complete your evening reflections to see them here.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {reflections.map((reflection) => (
        <div
          key={reflection.id}
          className="bg-white rounded-lg border shadow-sm overflow-hidden"
        >
          <button
            className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
            onClick={() => toggleExpand(reflection.id)}
          >
            <div className="flex items-center gap-3">
              <div className="text-2xl">
                {getOverallDayEmoji(reflection.overallDay)}
              </div>
              <div className="text-left">
                <div className="flex items-center gap-2">
                  <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-sm font-medium">
                    {formatDate(reflection.createdAt)}
                  </span>
                </div>
                {reflection.overallDay !== undefined && (
                  <span className="text-xs text-muted-foreground">
                    Overall: {reflection.overallDay}/10
                  </span>
                )}
              </div>
            </div>
            {expandedId === reflection.id ? (
              <ChevronUp className="h-5 w-5 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-5 w-5 text-muted-foreground" />
            )}
          </button>

          {expandedId === reflection.id && (
            <div className="px-4 pb-4 pt-2 border-t bg-gray-50 space-y-3">
              {reflection.promptResponse && (
                <div>
                  <span className="text-xs font-medium text-indigo-600">
                    Reflection
                  </span>
                  <p className="text-sm text-foreground mt-1">
                    {reflection.promptResponse}
                  </p>
                </div>
              )}
              {reflection.challenges && (
                <div>
                  <span className="text-xs font-medium text-orange-600">
                    Challenges
                  </span>
                  <p className="text-sm text-foreground mt-1">
                    {reflection.challenges}
                  </p>
                </div>
              )}
              {reflection.gratitude && (
                <div>
                  <span className="text-xs font-medium text-green-600">
                    Gratitude
                  </span>
                  <p className="text-sm text-foreground mt-1">
                    {reflection.gratitude}
                  </p>
                </div>
              )}
              {reflection.tomorrowGoal && (
                <div>
                  <span className="text-xs font-medium text-purple-600">
                    Tomorrow's Goal
                  </span>
                  <p className="text-sm text-foreground mt-1">
                    {reflection.tomorrowGoal}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

export default PastReflectionsModal
