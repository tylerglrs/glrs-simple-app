import { useState, useEffect } from 'react'
import { Star, Loader2 } from 'lucide-react'
import { ResponsiveModal } from '@/components/ui/responsive-modal'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore'
import { db, auth } from '@/lib/firebase'
import type { GratitudeTheme } from '../../types'

// =============================================================================
// TYPES
// =============================================================================

export interface GratitudeThemesModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

// =============================================================================
// COMPONENT
// =============================================================================

export function GratitudeThemesModal({ open, onOpenChange }: GratitudeThemesModalProps) {
  const [themes, setThemes] = useState<GratitudeTheme[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!open) return

    const loadThemes = async () => {
      const user = auth.currentUser
      if (!user) return

      setLoading(true)
      try {
        // Load gratitude entries and analyze themes
        const gratitudeQuery = query(
          collection(db, 'checkIns'),
          where('userId', '==', user.uid),
          orderBy('createdAt', 'desc'),
          limit(100)
        )

        const snapshot = await getDocs(gratitudeQuery)
        const themeCount: Record<string, number> = {}

        snapshot.docs.forEach((doc) => {
          const data = doc.data()
          const gratitude = data.eveningData?.gratitude
          if (gratitude) {
            // Simple theme extraction from gratitude text
            const themes = extractThemes(gratitude)
            themes.forEach((theme) => {
              themeCount[theme] = (themeCount[theme] || 0) + 1
            })
          }
        })

        // Convert to array and calculate percentages
        const total = Object.values(themeCount).reduce((a, b) => a + b, 0)
        const themeArray: GratitudeTheme[] = Object.entries(themeCount)
          .map(([theme, count]) => ({
            theme,
            count,
            percentage: total > 0 ? Math.round((count / total) * 100) : 0,
          }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 10)

        setThemes(themeArray)
      } catch (error) {
        console.error('Error loading gratitude themes:', error)
      } finally {
        setLoading(false)
      }
    }

    loadThemes()
  }, [open])

  return (
    <ResponsiveModal open={open} onOpenChange={onOpenChange} desktopSize="md">
      <div className="flex flex-col h-full bg-white overflow-hidden">
        <div className="px-4 py-3 border-b shrink-0">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <span className="text-xl">💚</span>
            Gratitude Themes
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            The most common themes from your gratitude reflections, ranked by frequency.
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-4">

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : themes.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Star className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="font-medium">No Themes Yet</p>
            <p className="text-sm">Express gratitude in your evening reflections to see patterns.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {themes.map((theme, index) => {
              const maxCount = themes[0].count
              const barWidth = (theme.count / maxCount) * 100

              return (
                <div
                  key={theme.theme}
                  className={cn(
                    'rounded-lg p-3',
                    index === 0
                      ? 'bg-gradient-to-r from-green-50 to-primary/10 border-2 border-green-500'
                      : 'bg-muted/50 border border-border'
                  )}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-muted-foreground">
                        {index + 1}.
                      </span>
                      <span className={cn('font-medium', index === 0 && 'font-bold')}>
                        {theme.theme}
                      </span>
                      {index === 0 && <Star className="h-4 w-4 text-yellow-500" />}
                    </div>
                    <div className="flex items-center gap-2">
                      {theme.percentage && (
                        <span className="rounded-full bg-green-500 px-2 py-0.5 text-xs font-bold text-white">
                          {theme.percentage}%
                        </span>
                      )}
                      <span className="rounded-full bg-primary px-2 py-0.5 text-xs font-bold text-white">
                        {theme.count}x
                      </span>
                    </div>
                  </div>
                  <Progress value={barWidth} className="h-1.5" />
                </div>
              )
            })}
          </div>
        )}

        <Button onClick={() => onOpenChange(false)} className="w-full mt-4">
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

function extractThemes(text: string): string[] {
  const themes: string[] = []
  const lowerText = text.toLowerCase()

  // Common gratitude themes to look for
  const themeKeywords: Record<string, string[]> = {
    Family: ['family', 'mom', 'dad', 'parent', 'child', 'son', 'daughter', 'spouse', 'husband', 'wife'],
    Friends: ['friend', 'friendship', 'buddy', 'pal'],
    Health: ['health', 'healthy', 'wellness', 'recovery', 'sober', 'sobriety'],
    Work: ['work', 'job', 'career', 'boss', 'colleague', 'coworker'],
    Nature: ['nature', 'weather', 'sun', 'rain', 'outside', 'outdoors', 'park'],
    Home: ['home', 'house', 'apartment', 'shelter', 'roof'],
    Food: ['food', 'meal', 'dinner', 'lunch', 'breakfast', 'eat'],
    Sleep: ['sleep', 'rest', 'bed', 'slept'],
    Support: ['support', 'help', 'sponsor', 'coach', 'therapist', 'counselor'],
    Progress: ['progress', 'growth', 'improve', 'better', 'milestone'],
    Peace: ['peace', 'calm', 'quiet', 'serenity', 'peaceful'],
    Love: ['love', 'loved', 'loving', 'care', 'caring'],
  }

  Object.entries(themeKeywords).forEach(([theme, keywords]) => {
    if (keywords.some((keyword) => lowerText.includes(keyword))) {
      themes.push(theme)
    }
  })

  // Return at least "General" if no specific themes found
  return themes.length > 0 ? themes : ['General']
}

export default GratitudeThemesModal
