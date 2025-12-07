import {
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { History, X, Loader2, Sparkles, Calendar } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { useIntentions, formatDateShort } from '../hooks/useTasksModalData'
import { Timestamp } from 'firebase/firestore'

// =============================================================================
// TYPES
// =============================================================================

export interface PastIntentionsModalProps {
  onClose: () => void
}

interface LocalIntention {
  id: string
  text: string
  completed?: boolean
  createdAt: Date
}

interface GroupedIntentions {
  date: string
  intentions: LocalIntention[]
}

// =============================================================================
// COMPONENT
// =============================================================================

export function PastIntentionsModal({ onClose }: PastIntentionsModalProps) {
  const isMobile = useMediaQuery('(max-width: 768px)')
  const { allIntentions, loading } = useIntentions()

  // Convert intentions to local format with Date type
  const convertToLocalIntention = (intention: typeof allIntentions[0]): LocalIntention => {
    const createdAt = intention.createdAt instanceof Timestamp
      ? intention.createdAt.toDate()
      : new Date(intention.createdAt as unknown as string)
    return {
      id: intention.id,
      text: intention.text,
      completed: intention.completed,
      createdAt,
    }
  }

  // Group intentions by date
  const groupedIntentions: GroupedIntentions[] = allIntentions.reduce((acc: GroupedIntentions[], intention) => {
    const localIntention = convertToLocalIntention(intention)
    const date = formatDateShort(intention.createdAt)
    const existingGroup = acc.find((g) => g.date === date)

    if (existingGroup) {
      existingGroup.intentions.push(localIntention)
    } else {
      acc.push({ date, intentions: [localIntention] })
    }

    return acc
  }, [])

  // Calculate stats
  const totalIntentions = allIntentions.length
  const completedIntentions = allIntentions.filter((i) => i.completed).length
  const completionRate = totalIntentions > 0
    ? Math.round((completedIntentions / totalIntentions) * 100)
    : 0

  // Filter by period
  const now = new Date()
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

  const weekIntentions = groupedIntentions.filter((g) => {
    const date = new Date(g.intentions[0].createdAt)
    return date >= weekAgo
  })

  const monthIntentions = groupedIntentions.filter((g) => {
    const date = new Date(g.intentions[0].createdAt)
    return date >= monthAgo
  })

  if (loading) {
    return (
      <DialogContent className="max-w-[95vw] sm:max-w-[500px]">
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
        </div>
      </DialogContent>
    )
  }

  return (
    <DialogContent className="max-w-[95vw] sm:max-w-[500px] p-0">
      {/* Header */}
      <DialogHeader className="p-5 pb-4 border-b">
        <div className="flex items-center justify-between">
          <DialogTitle className="flex items-center gap-2 text-lg font-semibold text-purple-700">
            <History className="h-5 w-5" />
            Past Intentions
          </DialogTitle>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
            <X className="h-5 w-5" />
          </Button>
        </div>
      </DialogHeader>

      <div className={cn('p-5 pt-4', isMobile && 'p-4 pt-3')}>
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <p className="text-2xl font-bold text-purple-600">{totalIntentions}</p>
            <p className="text-xs text-muted-foreground">Total</p>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <p className="text-2xl font-bold text-green-600">{completedIntentions}</p>
            <p className="text-xs text-muted-foreground">Completed</p>
          </div>
          <div className="text-center p-3 bg-indigo-50 rounded-lg">
            <p className="text-2xl font-bold text-indigo-600">{completionRate}%</p>
            <p className="text-xs text-muted-foreground">Rate</p>
          </div>
        </div>

        {/* Period Tabs */}
        <Tabs defaultValue="week" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="week">This Week</TabsTrigger>
            <TabsTrigger value="month">This Month</TabsTrigger>
            <TabsTrigger value="all">All Time</TabsTrigger>
          </TabsList>

          <ScrollArea className="h-[40vh]">
            <TabsContent value="week" className="mt-0">
              <IntentionsList groups={weekIntentions} />
            </TabsContent>
            <TabsContent value="month" className="mt-0">
              <IntentionsList groups={monthIntentions} />
            </TabsContent>
            <TabsContent value="all" className="mt-0">
              <IntentionsList groups={groupedIntentions} />
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

interface IntentionsListProps {
  groups: GroupedIntentions[]
}

function IntentionsList({ groups }: IntentionsListProps) {
  if (groups.length === 0) {
    return (
      <div className="text-center py-10">
        <Sparkles className="h-12 w-12 mx-auto text-gray-300 mb-3" />
        <h3 className="font-semibold text-foreground mb-1">No Intentions Yet</h3>
        <p className="text-sm text-muted-foreground">
          Start setting daily intentions to see them here.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {groups.map((group, groupIndex) => (
        <div key={groupIndex}>
          <div className="flex items-center gap-2 mb-2 text-sm text-muted-foreground">
            <Calendar className="h-3.5 w-3.5" />
            <span className="font-medium">{group.date}</span>
          </div>
          <div className="space-y-2 ml-1">
            {group.intentions.map((intention) => (
              <div
                key={intention.id}
                className={cn(
                  'flex items-start gap-3 p-3 rounded-lg border',
                  intention.completed
                    ? 'bg-green-50 border-green-200'
                    : 'bg-purple-50 border-purple-100'
                )}
              >
                <Sparkles
                  className={cn(
                    'h-4 w-4 mt-0.5 flex-shrink-0',
                    intention.completed ? 'text-green-500' : 'text-purple-500'
                  )}
                />
                <p
                  className={cn(
                    'text-sm',
                    intention.completed
                      ? 'text-green-700 line-through'
                      : 'text-foreground'
                  )}
                >
                  {intention.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

export default PastIntentionsModal
