import { useState, useEffect } from 'react'
import { Loader2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { CalendarHeatmap } from '../CalendarHeatmap'
import { collection, query, where, getDocs, orderBy, Timestamp } from 'firebase/firestore'
import { db, auth } from '@/lib/firebase'
import type { CheckIn, CalendarDayData } from '../../types'

// =============================================================================
// TYPES
// =============================================================================

export interface CalendarHeatmapModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

// =============================================================================
// COMPONENT
// =============================================================================

export function CalendarHeatmapModal({ open, onOpenChange }: CalendarHeatmapModalProps) {
  const [checkIns, setCheckIns] = useState<CheckIn[]>([])
  const [loading, setLoading] = useState(true)
  const [, setSelectedDayData] = useState<CalendarDayData | null>(null)

  useEffect(() => {
    if (!open) return

    const loadCheckIns = async () => {
      const user = auth.currentUser
      if (!user) return

      setLoading(true)
      try {
        // Load last 90 days of check-ins for the heatmap
        const ninetyDaysAgo = new Date()
        ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90)

        const checkInsQuery = query(
          collection(db, 'checkIns'),
          where('userId', '==', user.uid),
          where('createdAt', '>=', Timestamp.fromDate(ninetyDaysAgo)),
          orderBy('createdAt', 'desc')
        )

        const snapshot = await getDocs(checkInsQuery)
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as CheckIn[]

        setCheckIns(data)
      } catch (error) {
        console.error('Error loading check-ins:', error)
      } finally {
        setLoading(false)
      }
    }

    loadCheckIns()
  }, [open])

  const handleDayClick = (_date: Date, data: CalendarDayData) => {
    setSelectedDayData(data)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Check-In Calendar</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <CalendarHeatmap
            checkIns={checkIns}
            onDayClick={handleDayClick}
          />
        )}

        <Button onClick={() => onOpenChange(false)} className="w-full">
          Close
        </Button>
      </DialogContent>
    </Dialog>
  )
}

export default CalendarHeatmapModal
