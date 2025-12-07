import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/hooks/use-toast'
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import {
  Download,
  FileJson,
  Calendar,
  CheckCircle2,
  Clock,
  Target,
  MessageSquare,
  Heart,
  Activity,
  Trophy,
  Loader2,
  Info,
  FileCheck,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useState } from 'react'
import { db } from '@/lib/firebase'
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  doc,
  getDoc,
  Timestamp,
} from 'firebase/firestore'

// =============================================================================
// TYPES
// =============================================================================

type DateRange = 'all' | '30days' | '90days' | '1year'

interface ExportProgress {
  current: number
  total: number
  currentStep: string
}

interface ExportStats {
  checkIns: number
  goals: number
  objectives: number
  assignments: number
  messages: number
  topicRoomMessages: number
  gratitudes: number
  reflections: number
  habits: number
  habitCompletions: number
  quickReflections: number
  todayWins: number
  pledges: number
  breakthroughs: number
}

// =============================================================================
// EXPORT CATEGORIES
// =============================================================================

const EXPORT_CATEGORIES = [
  { id: 'profile', label: 'Profile Data', icon: CheckCircle2, description: 'Your account information' },
  { id: 'checkIns', label: 'Check-ins', icon: Clock, description: 'Daily check-in records' },
  { id: 'goals', label: 'Goals & Objectives', icon: Target, description: 'Your recovery goals' },
  { id: 'messages', label: 'Messages', icon: MessageSquare, description: 'Coach and community messages' },
  { id: 'reflections', label: 'Reflections', icon: Heart, description: 'Gratitudes and reflections' },
  { id: 'habits', label: 'Habits', icon: Activity, description: 'Habit tracking data' },
  { id: 'achievements', label: 'Achievements', icon: Trophy, description: 'Wins and breakthroughs' },
] as const

// =============================================================================
// COMPONENT
// =============================================================================

interface ExportModalProps {
  onClose: () => void
}

export function ExportModal({ onClose }: ExportModalProps) {
  const { user } = useAuth()
  const { toast } = useToast()

  // State
  const [dateRange, setDateRange] = useState<DateRange>('all')
  const [isExporting, setIsExporting] = useState(false)
  const [progress, setProgress] = useState<ExportProgress | null>(null)
  const [exportStats, setExportStats] = useState<ExportStats | null>(null)
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    EXPORT_CATEGORIES.map((c) => c.id)
  )

  // Toggle category selection
  const toggleCategory = (categoryId: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    )
  }

  // Calculate start date based on range
  const getStartDate = (): Date | null => {
    if (dateRange === 'all') return null

    const now = new Date()
    switch (dateRange) {
      case '30days':
        now.setDate(now.getDate() - 30)
        return now
      case '90days':
        now.setDate(now.getDate() - 90)
        return now
      case '1year':
        now.setFullYear(now.getFullYear() - 1)
        return now
      default:
        return null
    }
  }

  // Export user data
  const handleExport = async () => {
    if (!user?.uid) {
      toast({
        title: 'Error',
        description: 'You must be logged in to export data.',
        variant: 'destructive',
      })
      return
    }

    if (selectedCategories.length === 0) {
      toast({
        title: 'Error',
        description: 'Please select at least one category to export.',
        variant: 'destructive',
      })
      return
    }

    setIsExporting(true)
    setProgress({ current: 0, total: 15, currentStep: 'Starting export...' })

    const stats: ExportStats = {
      checkIns: 0,
      goals: 0,
      objectives: 0,
      assignments: 0,
      messages: 0,
      topicRoomMessages: 0,
      gratitudes: 0,
      reflections: 0,
      habits: 0,
      habitCompletions: 0,
      quickReflections: 0,
      todayWins: 0,
      pledges: 0,
      breakthroughs: 0,
    }

    try {
      const exportData: Record<string, unknown> = {
        exportedAt: new Date().toISOString(),
        exportVersion: '2.0',
        dateRange: dateRange,
        userId: user.uid,
        selectedCategories,
      }

      const startDate = getStartDate()
      let step = 0

      // Helper to build date-filtered query
      const buildQuery = (
        collectionName: string,
        dateField: string,
        orderField: string = dateField
      ) => {
        let q = query(
          collection(db, collectionName),
          where('userId', '==', user.uid)
        )
        if (startDate) {
          q = query(q, where(dateField, '>=', Timestamp.fromDate(startDate)))
        }
        return query(q, orderBy(orderField, 'desc'), limit(1000))
      }

      // 1. Export user profile
      if (selectedCategories.includes('profile')) {
        setProgress({ current: ++step, total: 15, currentStep: 'Exporting profile...' })
        const userDoc = await getDoc(doc(db, 'users', user.uid))
        exportData.user = userDoc.exists() ? userDoc.data() : null
      }

      // 2. Export check-ins
      if (selectedCategories.includes('checkIns')) {
        setProgress({ current: ++step, total: 15, currentStep: 'Exporting check-ins...' })
        const q = buildQuery('checkIns', 'timestamp')
        const snap = await getDocs(q)
        const checkIns: Record<string, unknown>[] = []
        snap.forEach((doc) => checkIns.push({ id: doc.id, ...doc.data() }))
        exportData.checkIns = checkIns
        stats.checkIns = checkIns.length
      }

      // 3. Export goals
      if (selectedCategories.includes('goals')) {
        setProgress({ current: ++step, total: 15, currentStep: 'Exporting goals...' })
        const q = query(
          collection(db, 'goals'),
          where('userId', '==', user.uid),
          orderBy('createdAt', 'desc'),
          limit(500)
        )
        const snap = await getDocs(q)
        const goals: Record<string, unknown>[] = []
        snap.forEach((doc) => goals.push({ id: doc.id, ...doc.data() }))
        exportData.goals = goals
        stats.goals = goals.length
      }

      // 4. Export objectives
      if (selectedCategories.includes('goals')) {
        setProgress({ current: ++step, total: 15, currentStep: 'Exporting objectives...' })
        const q = query(
          collection(db, 'objectives'),
          where('userId', '==', user.uid),
          orderBy('createdAt', 'desc'),
          limit(500)
        )
        const snap = await getDocs(q)
        const objectives: Record<string, unknown>[] = []
        snap.forEach((doc) => objectives.push({ id: doc.id, ...doc.data() }))
        exportData.objectives = objectives
        stats.objectives = objectives.length
      }

      // 5. Export assignments
      if (selectedCategories.includes('goals')) {
        setProgress({ current: ++step, total: 15, currentStep: 'Exporting assignments...' })
        const q = buildQuery('assignments', 'createdAt')
        const snap = await getDocs(q)
        const assignments: Record<string, unknown>[] = []
        snap.forEach((doc) => assignments.push({ id: doc.id, ...doc.data() }))
        exportData.assignments = assignments
        stats.assignments = assignments.length
      }

      // 6. Export coach messages
      if (selectedCategories.includes('messages')) {
        setProgress({ current: ++step, total: 15, currentStep: 'Exporting messages...' })
        const q = buildQuery('messages', 'createdAt')
        const snap = await getDocs(q)
        const messages: Record<string, unknown>[] = []
        snap.forEach((doc) => messages.push({ id: doc.id, ...doc.data() }))
        exportData.messages = messages
        stats.messages = messages.length
      }

      // 7. Export community messages
      if (selectedCategories.includes('messages')) {
        setProgress({ current: ++step, total: 15, currentStep: 'Exporting community messages...' })
        const q = buildQuery('communityMessages', 'createdAt')
        const snap = await getDocs(q)
        const topicMessages: Record<string, unknown>[] = []
        snap.forEach((doc) => topicMessages.push({ id: doc.id, ...doc.data() }))
        exportData.topicRoomMessages = topicMessages
        stats.topicRoomMessages = topicMessages.length
      }

      // 8. Export gratitudes
      if (selectedCategories.includes('reflections')) {
        setProgress({ current: ++step, total: 15, currentStep: 'Exporting gratitudes...' })
        const q = buildQuery('gratitudes', 'date')
        const snap = await getDocs(q)
        const gratitudes: Record<string, unknown>[] = []
        snap.forEach((doc) => gratitudes.push({ id: doc.id, ...doc.data() }))
        exportData.gratitudes = gratitudes
        stats.gratitudes = gratitudes.length
      }

      // 9. Export reflections
      if (selectedCategories.includes('reflections')) {
        setProgress({ current: ++step, total: 15, currentStep: 'Exporting reflections...' })
        const q = buildQuery('reflections', 'date')
        const snap = await getDocs(q)
        const reflections: Record<string, unknown>[] = []
        snap.forEach((doc) => reflections.push({ id: doc.id, ...doc.data() }))
        exportData.reflections = reflections
        stats.reflections = reflections.length
      }

      // 10. Export habits
      if (selectedCategories.includes('habits')) {
        setProgress({ current: ++step, total: 15, currentStep: 'Exporting habits...' })
        const q = query(
          collection(db, 'habits'),
          where('userId', '==', user.uid),
          orderBy('createdAt', 'desc'),
          limit(200)
        )
        const snap = await getDocs(q)
        const habits: Record<string, unknown>[] = []
        snap.forEach((doc) => habits.push({ id: doc.id, ...doc.data() }))
        exportData.habits = habits
        stats.habits = habits.length
      }

      // 11. Export habit completions
      if (selectedCategories.includes('habits')) {
        setProgress({ current: ++step, total: 15, currentStep: 'Exporting habit completions...' })
        const q = buildQuery('habitCompletions', 'completedAt')
        const snap = await getDocs(q)
        const completions: Record<string, unknown>[] = []
        snap.forEach((doc) => completions.push({ id: doc.id, ...doc.data() }))
        exportData.habitCompletions = completions
        stats.habitCompletions = completions.length
      }

      // 12. Export quick reflections
      if (selectedCategories.includes('reflections')) {
        setProgress({ current: ++step, total: 15, currentStep: 'Exporting quick reflections...' })
        const q = buildQuery('quickReflections', 'createdAt')
        const snap = await getDocs(q)
        const quickReflections: Record<string, unknown>[] = []
        snap.forEach((doc) => quickReflections.push({ id: doc.id, ...doc.data() }))
        exportData.quickReflections = quickReflections
        stats.quickReflections = quickReflections.length
      }

      // 13. Export today wins
      if (selectedCategories.includes('achievements')) {
        setProgress({ current: ++step, total: 15, currentStep: 'Exporting wins...' })
        const q = buildQuery('todayWins', 'date')
        const snap = await getDocs(q)
        const wins: Record<string, unknown>[] = []
        snap.forEach((doc) => wins.push({ id: doc.id, ...doc.data() }))
        exportData.todayWins = wins
        stats.todayWins = wins.length
      }

      // 14. Export pledges
      if (selectedCategories.includes('achievements')) {
        setProgress({ current: ++step, total: 15, currentStep: 'Exporting pledges...' })
        const q = buildQuery('pledges', 'createdAt')
        const snap = await getDocs(q)
        const pledges: Record<string, unknown>[] = []
        snap.forEach((doc) => pledges.push({ id: doc.id, ...doc.data() }))
        exportData.pledges = pledges
        stats.pledges = pledges.length
      }

      // 15. Export breakthroughs
      if (selectedCategories.includes('achievements')) {
        setProgress({ current: ++step, total: 15, currentStep: 'Exporting breakthroughs...' })
        const q = buildQuery('breakthroughs', 'createdAt')
        const snap = await getDocs(q)
        const breakthroughs: Record<string, unknown>[] = []
        snap.forEach((doc) => breakthroughs.push({ id: doc.id, ...doc.data() }))
        exportData.breakthroughs = breakthroughs
        stats.breakthroughs = breakthroughs.length
      }

      // Calculate totals
      const totalRecords = Object.values(stats).reduce((a, b) => a + b, 0)
      exportData.totalRecords = totalRecords
      exportData.stats = stats

      // Create and download file
      setProgress({ current: 15, total: 15, currentStep: 'Creating download...' })

      const jsonString = JSON.stringify(exportData, null, 2)
      const blob = new Blob([jsonString], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `glrs-data-export-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      setExportStats(stats)

      toast({
        title: 'Export Complete',
        description: `Successfully exported ${totalRecords} records.`,
      })
    } catch (error) {
      console.error('[ExportModal] Export error:', error)
      toast({
        title: 'Export Failed',
        description: 'Failed to export data. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsExporting(false)
      setProgress(null)
    }
  }

  return (
    <DialogContent className="max-w-[95vw] sm:max-w-[560px] p-0 gap-0">
      {/* Header */}
      <DialogHeader className="px-6 py-4 bg-gradient-to-r from-teal-600 to-emerald-600">
        <DialogTitle className="text-xl font-bold text-white flex items-center gap-3">
          <Download className="h-6 w-6" />
          Export Your Data
        </DialogTitle>
        <DialogDescription className="text-teal-100">
          Download your recovery data in JSON format (GDPR compliant).
        </DialogDescription>
      </DialogHeader>

      {/* Content */}
      <ScrollArea className="max-h-[calc(90vh-180px)]">
        <div className="p-6 space-y-6">
          {/* Date Range Selection */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                Time Period
              </CardTitle>
              <CardDescription>
                Choose how much historical data to include
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Select
                value={dateRange}
                onValueChange={(value: DateRange) => setDateRange(value)}
                disabled={isExporting}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="30days">Last 30 Days</SelectItem>
                  <SelectItem value="90days">Last 90 Days</SelectItem>
                  <SelectItem value="1year">Last Year</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Category Selection */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <FileJson className="h-5 w-5 text-muted-foreground" />
                Data Categories
              </CardTitle>
              <CardDescription>
                Select which types of data to include
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {EXPORT_CATEGORIES.map((category) => (
                <div
                  key={category.id}
                  className={cn(
                    'flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors',
                    selectedCategories.includes(category.id)
                      ? 'bg-teal-50 border-teal-200'
                      : 'hover:bg-muted/50',
                    isExporting && 'pointer-events-none opacity-60'
                  )}
                  onClick={() => !isExporting && toggleCategory(category.id)}
                >
                  <Checkbox
                    id={category.id}
                    checked={selectedCategories.includes(category.id)}
                    onCheckedChange={() => toggleCategory(category.id)}
                    disabled={isExporting}
                  />
                  <category.icon className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                  <div className="flex-1">
                    <Label htmlFor={category.id} className="font-medium cursor-pointer">
                      {category.label}
                    </Label>
                    <p className="text-xs text-muted-foreground">{category.description}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Export Progress */}
          {isExporting && progress && (
            <Card className="border-teal-200 bg-teal-50/50">
              <CardContent className="pt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{progress.currentStep}</span>
                  <span className="text-sm text-muted-foreground">
                    {progress.current}/{progress.total}
                  </span>
                </div>
                <Progress value={(progress.current / progress.total) * 100} />
              </CardContent>
            </Card>
          )}

          {/* Export Stats (after completion) */}
          {exportStats && !isExporting && (
            <Card className="border-green-200 bg-green-50/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2 text-green-700">
                  <FileCheck className="h-5 w-5" />
                  Export Complete
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {exportStats.checkIns > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Check-ins:</span>
                      <Badge variant="secondary">{exportStats.checkIns}</Badge>
                    </div>
                  )}
                  {exportStats.goals > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Goals:</span>
                      <Badge variant="secondary">{exportStats.goals}</Badge>
                    </div>
                  )}
                  {exportStats.messages > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Messages:</span>
                      <Badge variant="secondary">{exportStats.messages}</Badge>
                    </div>
                  )}
                  {exportStats.gratitudes > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Gratitudes:</span>
                      <Badge variant="secondary">{exportStats.gratitudes}</Badge>
                    </div>
                  )}
                  {exportStats.reflections > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Reflections:</span>
                      <Badge variant="secondary">{exportStats.reflections}</Badge>
                    </div>
                  )}
                  {exportStats.habits > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Habits:</span>
                      <Badge variant="secondary">{exportStats.habits}</Badge>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Info Alert */}
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription className="text-xs">
              Your data will be downloaded as a JSON file. This format can be imported into other
              applications or viewed with any text editor. Timestamps are preserved for data integrity.
            </AlertDescription>
          </Alert>
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="flex items-center justify-end gap-3 px-6 py-4 border-t bg-muted/30">
        <Button type="button" variant="outline" onClick={onClose} disabled={isExporting}>
          {exportStats ? 'Close' : 'Cancel'}
        </Button>
        <Button
          onClick={handleExport}
          disabled={isExporting || selectedCategories.length === 0}
          className="bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700"
        >
          {isExporting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Exporting...
            </>
          ) : (
            <>
              <Download className="mr-2 h-4 w-4" />
              Export Data
            </>
          )}
        </Button>
      </div>
    </DialogContent>
  )
}

export default ExportModal
