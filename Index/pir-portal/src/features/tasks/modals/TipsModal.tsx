import { useState } from 'react'
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Lightbulb,
  X,
  Heart,
  Brain,
  Moon,
  Utensils,
  Users,
  Activity,
  Shield,
  Flame,
  RefreshCw,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useMediaQuery } from '@/hooks/useMediaQuery'

// =============================================================================
// TYPES
// =============================================================================

export interface TipsModalProps {
  onClose: () => void
}

interface TipCategory {
  id: string
  name: string
  icon: React.ReactNode
  tips: string[]
}

// =============================================================================
// TIP DATA
// =============================================================================

const tipCategories: TipCategory[] = [
  {
    id: 'cravings',
    name: 'Cravings',
    icon: <Flame className="h-4 w-4" />,
    tips: [
      'Use the H.A.L.T. method: Check if you\'re Hungry, Angry, Lonely, or Tired',
      'Play the tape forward - visualize the consequences of using',
      'Call your sponsor or a supportive friend',
      'Engage in physical activity - even a short walk helps',
      'Practice deep breathing: 4 counts in, 7 hold, 8 out',
      'Remember: Cravings typically pass within 15-20 minutes',
      'Keep a list of reasons why you chose recovery',
      'Distract yourself with a hobby or task',
      'Change your environment - go to a different room or outside',
      'Use ice or cold water to engage your dive reflex and calm down',
    ],
  },
  {
    id: 'anxiety',
    name: 'Anxiety',
    icon: <Activity className="h-4 w-4" />,
    tips: [
      '5-4-3-2-1 Grounding: Notice 5 things you see, 4 hear, 3 feel, 2 smell, 1 taste',
      'Box breathing: Breathe in for 4 seconds, hold 4, out 4, hold 4',
      'Progressive muscle relaxation - tense and release each muscle group',
      'Challenge catastrophic thoughts - what\'s the evidence?',
      'Accept anxiety as a wave that will pass',
      'Limit caffeine and sugar intake',
      'Maintain a regular sleep schedule',
      'Practice mindfulness meditation daily',
      'Physical exercise releases tension and improves mood',
      'Journaling can help process anxious thoughts',
    ],
  },
  {
    id: 'sleep',
    name: 'Sleep',
    icon: <Moon className="h-4 w-4" />,
    tips: [
      'Keep a consistent sleep schedule, even on weekends',
      'Create a relaxing bedtime routine',
      'Avoid screens 1-2 hours before bed',
      'Keep your bedroom cool, dark, and quiet',
      'Limit caffeine after 2 PM',
      'Avoid alcohol - it disrupts sleep quality',
      'Don\'t lie in bed awake - get up and do something relaxing',
      'Use white noise or calming sounds',
      'Practice relaxation techniques before bed',
      'Reserve the bed for sleep only - don\'t work or watch TV in bed',
    ],
  },
  {
    id: 'nutrition',
    name: 'Nutrition',
    icon: <Utensils className="h-4 w-4" />,
    tips: [
      'Eat regular meals to stabilize blood sugar',
      'Stay hydrated - dehydration can mimic anxiety',
      'Increase protein intake to support neurotransmitter production',
      'Eat foods rich in omega-3s (salmon, walnuts)',
      'Limit processed foods and added sugars',
      'B vitamins support nervous system health (whole grains, eggs)',
      'Magnesium-rich foods can help with relaxation (leafy greens, nuts)',
      'Avoid skipping meals - it can trigger cravings',
      'Reduce caffeine gradually to avoid withdrawal',
      'Consider a daily multivitamin to address deficiencies',
    ],
  },
  {
    id: 'mindset',
    name: 'Mindset',
    icon: <Brain className="h-4 w-4" />,
    tips: [
      'Practice gratitude - write down 3 things daily',
      'Use positive affirmations - "I am capable of recovery"',
      'Embrace the beginner\'s mind - every day is a fresh start',
      'Progress over perfection - small steps count',
      'Replace "I have to" with "I get to"',
      'Accept what you can\'t control, focus on what you can',
      'Celebrate small wins - they build momentum',
      'Practice self-compassion - talk to yourself like a friend',
      'Visualize your future self in recovery',
      'Remember: Recovery is a journey, not a destination',
    ],
  },
  {
    id: 'connection',
    name: 'Connection',
    icon: <Users className="h-4 w-4" />,
    tips: [
      'Attend meetings regularly - connection heals',
      'Call someone in recovery daily',
      'Be honest about how you\'re really feeling',
      'Ask for help before you\'re in crisis',
      'Volunteer to help others - it boosts your own recovery',
      'Set healthy boundaries with unsupportive people',
      'Find a sponsor or mentor',
      'Join a recovery community group',
      'Share your story - it helps you and others',
      'Build relationships outside of recovery too',
    ],
  },
  {
    id: 'selfcare',
    name: 'Self-Care',
    icon: <Heart className="h-4 w-4" />,
    tips: [
      'Move your body daily - even 10 minutes helps',
      'Spend time in nature',
      'Practice good hygiene - it affects mood',
      'Set aside time for activities you enjoy',
      'Take breaks from work and responsibilities',
      'Limit social media if it affects your mood',
      'Practice saying "no" without guilt',
      'Create a morning routine that centers you',
      'Celebrate your recovery milestones',
      'Rest when you need it - recovery takes energy',
    ],
  },
  {
    id: 'relapse',
    name: 'Relapse Prevention',
    icon: <Shield className="h-4 w-4" />,
    tips: [
      'Know your triggers and have a plan for each',
      'Recognize warning signs early (HALT, isolation, old thinking)',
      'Keep emergency contacts easily accessible',
      'Avoid high-risk situations, especially early on',
      'Have an escape plan for unexpected triggers',
      'If you relapse, reach out immediately - don\'t isolate',
      'Relapse doesn\'t erase progress - get back up',
      'Review and update your relapse prevention plan regularly',
      'Practice "playing the tape forward" regularly',
      'Build a routine that supports recovery',
    ],
  },
]

// =============================================================================
// COMPONENT
// =============================================================================

export function TipsModal({ onClose }: TipsModalProps) {
  const isMobile = useMediaQuery('(max-width: 768px)')
  const [currentCategory, setCurrentCategory] = useState(tipCategories[0])

  const getRandomTips = (count: number = 3) => {
    const allTips: { tip: string; category: string }[] = []
    tipCategories.forEach((cat) => {
      cat.tips.forEach((tip) => {
        allTips.push({ tip, category: cat.name })
      })
    })

    // Shuffle and take first `count`
    return allTips.sort(() => Math.random() - 0.5).slice(0, count)
  }

  const [randomTips, setRandomTips] = useState(() => getRandomTips(3))

  const refreshRandomTips = () => {
    setRandomTips(getRandomTips(3))
  }

  return (
    <DialogContent className="max-w-[95vw] sm:max-w-[600px] p-0">
      {/* Header */}
      <DialogHeader className="p-5 pb-4 border-b bg-gradient-to-r from-teal-50 to-green-50">
        <div className="flex items-center justify-between">
          <DialogTitle className="flex items-center gap-2 text-lg font-semibold text-teal-700">
            <Lightbulb className="h-5 w-5" />
            Recovery Tips
          </DialogTitle>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
            <X className="h-5 w-5" />
          </Button>
        </div>
      </DialogHeader>

      <Tabs defaultValue="browse" className="w-full">
        <TabsList className={cn('w-full grid grid-cols-2', isMobile && 'text-sm')}>
          <TabsTrigger value="random">Quick Tips</TabsTrigger>
          <TabsTrigger value="browse">Browse All</TabsTrigger>
        </TabsList>

        <ScrollArea className="max-h-[55vh]">
          {/* Random Tips Tab */}
          <TabsContent value="random" className="mt-0 p-5">
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-foreground">Tips for Today</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={refreshRandomTips}
                  className="text-teal-600 hover:text-teal-700"
                >
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Refresh
                </Button>
              </div>

              {randomTips.map((item, index) => (
                <div
                  key={index}
                  className="p-4 bg-gradient-to-r from-teal-50 to-green-50 rounded-lg border border-teal-100"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-teal-100 flex-shrink-0">
                      <span className="text-sm font-semibold text-teal-700">{index + 1}</span>
                    </div>
                    <div>
                      <p className="text-foreground">{item.tip}</p>
                      <p className="text-xs text-teal-600 mt-1">{item.category}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Browse All Tab */}
          <TabsContent value="browse" className="mt-0">
            <div className={cn('p-5', isMobile && 'p-4')}>
              {/* Category Pills */}
              <div className="flex flex-wrap gap-2 mb-4">
                {tipCategories.map((category) => (
                  <Button
                    key={category.id}
                    variant={currentCategory.id === category.id ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setCurrentCategory(category)}
                    className={cn(
                      'gap-1',
                      currentCategory.id === category.id && 'bg-teal-500 hover:bg-teal-600'
                    )}
                  >
                    {category.icon}
                    {category.name}
                  </Button>
                ))}
              </div>

              {/* Tips List */}
              <div className="space-y-2">
                {currentCategory.tips.map((tip, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border"
                  >
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-teal-100 flex-shrink-0 text-sm font-medium text-teal-700">
                      {index + 1}
                    </div>
                    <p className="text-sm text-foreground">{tip}</p>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </ScrollArea>
      </Tabs>
    </DialogContent>
  )
}

export default TipsModal
