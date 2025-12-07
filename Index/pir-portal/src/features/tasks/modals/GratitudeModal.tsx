import { useState } from 'react'
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Textarea } from '@/components/ui/textarea'
import {
  Heart,
  X,
  Loader2,
  Users,
  Sun,
  TrendingUp,
  Smile,
  Target,
  Shield,
  Award,
  LifeBuoy,
  Palette,
  Coffee,
  MoreHorizontal,
  CheckCircle,
  Sparkles,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { db, auth } from '@/lib/firebase'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { updateContextAfterGratitude } from '@/lib/updateAIContext'

// =============================================================================
// TYPES
// =============================================================================

export interface GratitudeModalProps {
  onClose: () => void
}

interface GratitudeTheme {
  id: string
  label: string
  icon: LucideIcon
  color: string
}

// =============================================================================
// GRATITUDE THEMES
// =============================================================================

const gratitudeThemes: GratitudeTheme[] = [
  { id: 'relationships', label: 'Relationships', icon: Users, color: 'bg-red-100 text-red-600 border-red-200' },
  { id: 'health', label: 'Health & Wellness', icon: Heart, color: 'bg-teal-100 text-teal-600 border-teal-200' },
  { id: 'nature', label: 'Nature', icon: Sun, color: 'bg-green-100 text-green-600 border-green-200' },
  { id: 'personal', label: 'Personal Growth', icon: TrendingUp, color: 'bg-pink-100 text-pink-600 border-pink-200' },
  { id: 'moments', label: 'Small Moments', icon: Smile, color: 'bg-yellow-100 text-yellow-600 border-yellow-200' },
  { id: 'opportunities', label: 'Opportunities', icon: Target, color: 'bg-green-100 text-green-600 border-green-200' },
  { id: 'comfort', label: 'Comfort & Safety', icon: Shield, color: 'bg-blue-100 text-blue-600 border-blue-200' },
  { id: 'accomplishments', label: 'Accomplishments', icon: Award, color: 'bg-purple-100 text-purple-600 border-purple-200' },
  { id: 'support', label: 'Support & Help', icon: LifeBuoy, color: 'bg-orange-100 text-orange-600 border-orange-200' },
  { id: 'creativity', label: 'Creativity', icon: Palette, color: 'bg-rose-100 text-rose-600 border-rose-200' },
  { id: 'simple', label: 'Simple Pleasures', icon: Coffee, color: 'bg-amber-100 text-amber-600 border-amber-200' },
  { id: 'other', label: 'Other', icon: MoreHorizontal, color: 'bg-gray-100 text-gray-600 border-gray-200' },
]

// =============================================================================
// COMPONENT
// =============================================================================

export function GratitudeModal({ onClose }: GratitudeModalProps) {
  const isMobile = useMediaQuery('(max-width: 768px)')
  const [selectedTheme, setSelectedTheme] = useState<string | null>(null)
  const [gratitudeText, setGratitudeText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async () => {
    if (!gratitudeText.trim() || submitting) return

    const userId = auth.currentUser?.uid
    if (!userId) return

    setSubmitting(true)
    try {
      await addDoc(collection(db, 'gratitudes'), {
        userId,
        text: gratitudeText.trim(),
        theme: selectedTheme,
        createdAt: serverTimestamp(),
      })

      // Update AI context
      await updateContextAfterGratitude(userId)

      setSubmitted(true)
      setTimeout(() => {
        onClose()
      }, 1500)
    } catch (error) {
      console.error('Error saving gratitude:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const selectedThemeData = gratitudeThemes.find(t => t.id === selectedTheme)

  if (submitted) {
    return (
      <DialogContent className="max-w-[95vw] sm:max-w-[500px]">
        <div className="flex flex-col items-center justify-center py-12">
          <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
          <h3 className="text-xl font-semibold text-foreground mb-2">
            Gratitude Saved!
          </h3>
          <p className="text-sm text-muted-foreground text-center">
            Taking time to appreciate the good things in life supports your recovery.
          </p>
        </div>
      </DialogContent>
    )
  }

  return (
    <DialogContent className="max-w-[95vw] sm:max-w-[500px] p-0">
      {/* Header */}
      <DialogHeader className="p-5 pb-4 border-b bg-gradient-to-r from-pink-50 to-rose-50">
        <div className="flex items-center justify-between">
          <DialogTitle className="flex items-center gap-2 text-lg font-semibold text-pink-700">
            <Heart className="h-5 w-5" />
            Gratitude Journal
          </DialogTitle>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
            <X className="h-5 w-5" />
          </Button>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          What are you grateful for today?
        </p>
      </DialogHeader>

      <ScrollArea className="max-h-[60vh]">
        <div className={cn('p-5 space-y-5', isMobile && 'p-4 space-y-4')}>
          {/* Theme Selection */}
          <div>
            <label className="text-sm font-medium text-foreground mb-3 block">
              Choose a theme (optional)
            </label>
            <div className="grid grid-cols-3 gap-2">
              {gratitudeThemes.map((theme) => {
                const Icon = theme.icon
                const isSelected = selectedTheme === theme.id

                return (
                  <button
                    key={theme.id}
                    onClick={() => setSelectedTheme(isSelected ? null : theme.id)}
                    className={cn(
                      'flex flex-col items-center gap-1 p-3 rounded-lg border transition-all',
                      isSelected
                        ? theme.color + ' ring-2 ring-offset-1 ring-pink-400'
                        : 'bg-gray-50 hover:bg-gray-100 border-gray-200'
                    )}
                  >
                    <Icon className={cn('h-5 w-5', isSelected ? '' : 'text-gray-500')} />
                    <span className={cn(
                      'text-xs font-medium',
                      isSelected ? '' : 'text-gray-600'
                    )}>
                      {theme.label}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Gratitude Text */}
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              {selectedThemeData
                ? `I'm grateful for (${selectedThemeData.label})...`
                : "I'm grateful for..."}
            </label>
            <Textarea
              value={gratitudeText}
              onChange={(e) => setGratitudeText(e.target.value)}
              placeholder="Write what you're grateful for today..."
              className="min-h-[120px] text-base"
            />
          </div>

          {/* Prompts */}
          <div className="bg-pink-50 rounded-lg p-4 border border-pink-100">
            <div className="flex items-start gap-2">
              <Sparkles className="h-5 w-5 text-pink-500 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-pink-800 text-sm mb-1">
                  Need inspiration?
                </h4>
                <ul className="text-xs text-pink-700 space-y-1">
                  <li>• Something that made you smile today</li>
                  <li>• A person who supported you</li>
                  <li>• A simple comfort you enjoyed</li>
                  <li>• Progress you've made in recovery</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <Button
            onClick={handleSubmit}
            disabled={!gratitudeText.trim() || submitting}
            className="w-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600"
          >
            {submitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Heart className="h-4 w-4 mr-2" />
                Save Gratitude
              </>
            )}
          </Button>
        </div>
      </ScrollArea>
    </DialogContent>
  )
}

export default GratitudeModal
