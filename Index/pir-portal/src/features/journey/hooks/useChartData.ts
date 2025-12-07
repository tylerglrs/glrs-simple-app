import { useState, useEffect, useMemo } from 'react'
import { db, auth } from '@/lib/firebase'
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  Timestamp,
} from 'firebase/firestore'
import type { CheckIn, ChartDataPoint, ChartType, TrendInfo } from '../types'

// =============================================================================
// CHART CONFIGS
// =============================================================================

export const CHART_CONFIGS: Record<ChartType, {
  title: string
  color: string
  bgColor: string
  metricPath: string
  icon: string
}> = {
  mood: {
    title: 'Mood',
    color: '#069494',
    bgColor: 'rgba(6, 148, 148, 0.1)',
    metricPath: 'morningData.mood',
    icon: 'smile',
  },
  craving: {
    title: 'Craving',
    color: '#FF6B6B',
    bgColor: 'rgba(255, 107, 107, 0.1)',
    metricPath: 'morningData.craving',
    icon: 'flame',
  },
  anxiety: {
    title: 'Anxiety',
    color: '#FFA500',
    bgColor: 'rgba(255, 165, 0, 0.1)',
    metricPath: 'morningData.anxiety',
    icon: 'alert-circle',
  },
  sleep: {
    title: 'Sleep',
    color: '#9B59B6',
    bgColor: 'rgba(155, 89, 182, 0.1)',
    metricPath: 'morningData.sleep',
    icon: 'moon',
  },
  overallDay: {
    title: 'Overall Day',
    color: '#2ECC71',
    bgColor: 'rgba(46, 204, 113, 0.1)',
    metricPath: 'eveningData.overallDay',
    icon: 'star',
  },
}

// =============================================================================
// HELPERS
// =============================================================================

const getMetricValue = (checkIn: CheckIn, metricPath: string): number | null => {
  const pathParts = metricPath.split('.')
  let value: unknown = checkIn

  for (const part of pathParts) {
    if (value === null || value === undefined) return null
    value = (value as Record<string, unknown>)[part]
  }

  if (typeof value === 'number') return value
  return null
}

const getDateString = (date: Date): string => {
  return date.toISOString().split('T')[0]
}

const formatDateLabel = (date: Date): string => {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

// =============================================================================
// TYPES
// =============================================================================

interface ChartDataSet {
  sparkline: ChartDataPoint[]  // 7 days
  full: ChartDataPoint[]       // 31 days
  average: number
  trend: TrendInfo
  latestValue: number | null
  missedDays: number
}

interface UseChartDataReturn {
  data: Record<ChartType, ChartDataSet>
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

// =============================================================================
// HOOK
// =============================================================================

export function useChartData(): UseChartDataReturn {
  const [checkIns, setCheckIns] = useState<CheckIn[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async () => {
    const user = auth.currentUser
    if (!user) {
      setCheckIns([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)

      const thirtyOneDaysAgo = new Date()
      thirtyOneDaysAgo.setDate(thirtyOneDaysAgo.getDate() - 31)
      thirtyOneDaysAgo.setHours(0, 0, 0, 0)

      const checkInsRef = collection(db, 'checkIns')
      const q = query(
        checkInsRef,
        where('userId', '==', user.uid),
        where('createdAt', '>=', Timestamp.fromDate(thirtyOneDaysAgo)),
        orderBy('createdAt', 'desc')
      )

      const snapshot = await getDocs(q)
      const checkInsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as CheckIn[]

      setCheckIns(checkInsData)
      setError(null)
    } catch (err) {
      console.error('Error loading chart data:', err)
      setError('Failed to load chart data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        fetchData()
      } else {
        setCheckIns([])
        setLoading(false)
      }
    })

    return () => unsubscribe()
  }, [])

  const data = useMemo(() => {
    const result: Record<ChartType, ChartDataSet> = {} as Record<ChartType, ChartDataSet>

    const chartTypes: ChartType[] = ['mood', 'craving', 'anxiety', 'sleep', 'overallDay']

    for (const chartType of chartTypes) {
      const config = CHART_CONFIGS[chartType]
      const metricPath = config.metricPath

      // Build data for last 31 days
      const fullData: ChartDataPoint[] = []
      const sparklineData: ChartDataPoint[] = []
      const values: number[] = []

      for (let i = 30; i >= 0; i--) {
        const date = new Date()
        date.setDate(date.getDate() - i)
        date.setHours(0, 0, 0, 0)
        const dateStr = getDateString(date)

        // Find check-in for this date
        const checkIn = checkIns.find(ci => {
          const ciDate = ci.createdAt?.toDate?.() || new Date()
          return getDateString(ciDate) === dateStr
        })

        const value = checkIn ? getMetricValue(checkIn, metricPath) : null

        const dataPoint: ChartDataPoint = {
          date: dateStr,
          value,
          label: formatDateLabel(date),
        }

        fullData.push(dataPoint)

        // Add to sparkline if in last 7 days
        if (i < 7) {
          sparklineData.push(dataPoint)
        }

        if (value !== null) {
          values.push(value)
        }
      }

      // Calculate average
      const average = values.length > 0
        ? values.reduce((sum, v) => sum + v, 0) / values.length
        : 0

      // Calculate trend (compare last 7 days to previous 7 days)
      const last7 = values.slice(-7)
      const prev7 = values.slice(-14, -7)

      let trend: TrendInfo = { direction: 'stable', percentage: 0 }

      if (last7.length > 0 && prev7.length > 0) {
        const last7Avg = last7.reduce((sum, v) => sum + v, 0) / last7.length
        const prev7Avg = prev7.reduce((sum, v) => sum + v, 0) / prev7.length

        if (prev7Avg > 0) {
          const change = ((last7Avg - prev7Avg) / prev7Avg) * 100
          if (Math.abs(change) < 5) {
            trend = { direction: 'stable', percentage: Math.abs(change) }
          } else if (change > 0) {
            trend = { direction: 'up', percentage: Math.abs(change) }
          } else {
            trend = { direction: 'down', percentage: Math.abs(change) }
          }
        }
      }

      // Get latest value
      const latestValue = fullData.length > 0 ? fullData[fullData.length - 1].value : null

      // Calculate missed days
      const missedDays = 31 - values.length

      result[chartType] = {
        sparkline: sparklineData,
        full: fullData,
        average: Number(average.toFixed(1)),
        trend,
        latestValue,
        missedDays,
      }
    }

    return result
  }, [checkIns])

  return {
    data,
    loading,
    error,
    refetch: fetchData,
  }
}

export default useChartData
