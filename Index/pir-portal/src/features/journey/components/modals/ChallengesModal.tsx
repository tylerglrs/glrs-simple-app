import { useState, useEffect } from 'react'
import { Loader2, AlertTriangle, Calendar, Brain } from 'lucide-react'
import { ResponsiveModal } from '@/components/ui/responsive-modal'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore'
import { db, auth } from '@/lib/firebase'
import type { ChallengeEntry, ChallengesInsights } from '../../types'

// =============================================================================
// TYPES
// =============================================================================

export interface ChallengesModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

// =============================================================================
// COMPONENT
// =============================================================================

export function ChallengesModal({ open, onOpenChange }: ChallengesModalProps) {
  const [entries, setEntries] = useState<ChallengeEntry[]>([])
  const [insights, setInsights] = useState<ChallengesInsights | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!open) return

    const loadData = async () => {
      const user = auth.currentUser
      if (!user) return

      setLoading(true)
      try {
        // Load challenge entries
        const challengesQuery = query(
          collection(db, 'checkIns'),
          where('userId', '==', user.uid),
          orderBy('createdAt', 'desc'),
          limit(50)
        )

        const snapshot = await getDocs(challengesQuery)
        const challengeEntries: ChallengeEntry[] = []
        const categoryCount: Record<string, number> = {}

        snapshot.docs.forEach((doc) => {
          const data = doc.data()
          if (data.eveningData?.challenges) {
            const createdAt = data.createdAt?.toDate?.() || new Date()
            challengeEntries.push({
              id: doc.id,
              date: createdAt.toISOString().split('T')[0],
              challenges: data.eveningData.challenges,
              overallDay: data.eveningData.overallDay,
            })

            // Categorize challenges
            const categories = categorizeChallenge(data.eveningData.challenges)
            categories.forEach((cat) => {
              categoryCount[cat] = (categoryCount[cat] || 0) + 1
            })
          }
        })

        setEntries(challengeEntries)
        setInsights({
          categories: Object.fromEntries(
            Object.entries(categoryCount).map(([k, v]) => [k, { count: v }])
          ),
          totalChallenges: challengeEntries.length,
        })
      } catch (error) {
        console.error('Error loading challenges:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [open])

  return (
    <ResponsiveModal open={open} onOpenChange={onOpenChange} desktopSize="lg">
      <div className="flex flex-col h-full bg-white overflow-hidden">
        <div className="px-4 py-3 border-b shrink-0">
          <h2 className="text-lg font-semibold">Challenges History</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Review the challenges you've faced and overcome in your recovery journey.
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              {/* Insights Panel */}
              {insights && Object.keys(insights.categories).length > 0 && (
                <div className="rounded-xl bg-gradient-to-br from-amber-50 to-orange-100 border-2 border-amber-500 p-4 mb-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-orange-500">
                      <Brain className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-bold text-amber-900">Challenge Patterns</h4>
                      <p className="text-xs text-amber-700">Analyzed from your reflections</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {Object.entries(insights.categories)
                      .sort(([, a], [, b]) => b.count - a.count)
                      .slice(0, 5)
                      .map(([category, data]) => (
                        <div
                          key={category}
                          className="flex items-center justify-between rounded-lg bg-white/70 p-2"
                        >
                          <span className="text-sm font-medium text-foreground capitalize">
                            {category.replace(/_/g, ' ')}
                          </span>
                          <span className="rounded-full bg-orange-500 px-2 py-0.5 text-xs font-bold text-white">
                            {data.count}x
                          </span>
                        </div>
                      ))}
                  </div>

                  {insights.totalChallenges && (
                    <div className="mt-3 pt-3 border-t border-amber-200 text-center">
                      <span className="text-sm text-amber-700">
                        Total Challenges Tracked:{' '}
                        <span className="font-bold text-amber-900">{insights.totalChallenges}</span>
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Entries List */}
              {entries.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <AlertTriangle className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p className="font-medium">No Challenges Recorded</p>
                  <p className="text-sm">Share challenges in your evening reflections.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {entries.map((entry) => (
                    <div
                      key={entry.id}
                      className="rounded-xl border bg-muted/30 p-4"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-semibold text-primary">
                            {new Date(entry.date).toLocaleDateString('en-US', {
                              weekday: 'short',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </span>
                        </div>
                        {entry.overallDay && (
                          <span
                            className={cn(
                              'rounded-full px-2 py-0.5 text-xs font-bold text-white',
                              entry.overallDay >= 7
                                ? 'bg-green-500'
                                : entry.overallDay >= 5
                                  ? 'bg-amber-500'
                                  : 'bg-red-500'
                            )}
                          >
                            Day: {entry.overallDay}/10
                          </span>
                        )}
                      </div>

                      <p className="text-sm text-foreground leading-relaxed">
                        {entry.challenges}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        <div className="p-4 border-t shrink-0">
          <Button onClick={() => onOpenChange(false)} className="w-full">
            Close
          </Button>
        </div>
      </div>
    </ResponsiveModal>
  )
}

// =============================================================================
// HELPERS
// =============================================================================

function categorizeChallenge(text: string): string[] {
  const categories: string[] = []
  const lowerText = text.toLowerCase()

  const categoryKeywords: Record<string, string[]> = {
    cravings: ['craving', 'urge', 'temptation', 'trigger', 'want to use'],
    stress: ['stress', 'stressed', 'anxious', 'anxiety', 'overwhelmed', 'pressure'],
    relationships: ['relationship', 'family', 'friend', 'partner', 'argument', 'conflict'],
    work: ['work', 'job', 'boss', 'coworker', 'career'],
    sleep: ['sleep', 'insomnia', 'tired', 'exhausted', 'fatigue'],
    emotions: ['angry', 'sad', 'depressed', 'lonely', 'frustrated', 'emotional'],
    health: ['health', 'sick', 'pain', 'medical'],
    financial: ['money', 'financial', 'bills', 'debt', 'broke'],
    social: ['social', 'people', 'crowd', 'party', 'event'],
    boredom: ['bored', 'boredom', 'nothing to do'],
  }

  Object.entries(categoryKeywords).forEach(([category, keywords]) => {
    if (keywords.some((keyword) => lowerText.includes(keyword))) {
      categories.push(category)
    }
  })

  return categories.length > 0 ? categories : ['general']
}

export default ChallengesModal
