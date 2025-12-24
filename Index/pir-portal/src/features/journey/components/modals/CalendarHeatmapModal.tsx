import { useState, useEffect } from 'react'
import { ResponsiveModal } from '@/components/ui/responsive-modal'
import { Button } from '@/components/ui/button'
import { CalendarHeatmap } from '../CalendarHeatmap'
import { CalendarHeatmapSkeleton } from '@/components/common'
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
    <ResponsiveModal open={open} onOpenChange={onOpenChange} desktopSize="lg">
      <div className="flex flex-col h-full bg-white overflow-hidden">
        <div className="px-4 py-3 border-b shrink-0">
          <h2 className="text-lg font-semibold">Check-In Calendar</h2>
        </div>

        <div className="flex-1 overflow-y-auto p-4">

        {loading ? (
          <CalendarHeatmapSkeleton />
        ) : (
          <CalendarHeatmap
            checkIns={checkIns}
            onDayClick={handleDayClick}
          />
        )}

        <Button onClick={() => onOpenChange(false)} className="w-full">
          Close
        </Button>
        </div>
      </div>
    </ResponsiveModal>
  )
}

export default CalendarHeatmapModal
