import { useState, useEffect, useCallback } from 'react'
import { db, auth } from '@/lib/firebase'
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore'
import type { ChartType } from '../types'

// =============================================================================
// TYPES
// =============================================================================

export interface ChartSettings {
  dateRange: 'week' | 'month' | 'all'
  visibleCharts: ChartType[]
  chartOrder: ChartType[]
  showTrendBadges: boolean
  showMissedDays: boolean
}

const DEFAULT_SETTINGS: ChartSettings = {
  dateRange: 'month',
  visibleCharts: ['mood', 'craving', 'anxiety', 'sleep', 'overallDay'],
  chartOrder: ['mood', 'craving', 'anxiety', 'sleep', 'overallDay'],
  showTrendBadges: true,
  showMissedDays: true,
}

interface UseChartSettingsReturn {
  settings: ChartSettings
  loading: boolean
  updateSettings: (updates: Partial<ChartSettings>) => Promise<void>
  resetSettings: () => Promise<void>
  toggleChart: (chartType: ChartType) => Promise<void>
  reorderCharts: (newOrder: ChartType[]) => Promise<void>
}

// =============================================================================
// HOOK
// =============================================================================

export function useChartSettings(): UseChartSettingsReturn {
  const [settings, setSettings] = useState<ChartSettings>(DEFAULT_SETTINGS)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        setSettings(DEFAULT_SETTINGS)
        setLoading(false)
        return
      }

      try {
        const settingsRef = doc(db, 'userSettings', user.uid)
        const settingsDoc = await getDoc(settingsRef)

        if (settingsDoc.exists()) {
          const data = settingsDoc.data()
          if (data.chartSettings) {
            setSettings({
              ...DEFAULT_SETTINGS,
              ...data.chartSettings,
            })
          }
        }
      } catch (error) {
        console.error('Error loading chart settings:', error)
      } finally {
        setLoading(false)
      }
    })

    return () => unsubscribe()
  }, [])

  const saveSettings = useCallback(async (newSettings: ChartSettings) => {
    const user = auth.currentUser
    if (!user) return

    try {
      const settingsRef = doc(db, 'userSettings', user.uid)
      const settingsDoc = await getDoc(settingsRef)

      if (settingsDoc.exists()) {
        await updateDoc(settingsRef, { chartSettings: newSettings })
      } else {
        await setDoc(settingsRef, { chartSettings: newSettings })
      }
    } catch (error) {
      console.error('Error saving chart settings:', error)
    }
  }, [])

  const updateSettings = useCallback(
    async (updates: Partial<ChartSettings>) => {
      const newSettings = { ...settings, ...updates }
      setSettings(newSettings)
      await saveSettings(newSettings)
    },
    [settings, saveSettings]
  )

  const resetSettings = useCallback(async () => {
    setSettings(DEFAULT_SETTINGS)
    await saveSettings(DEFAULT_SETTINGS)
  }, [saveSettings])

  const toggleChart = useCallback(
    async (chartType: ChartType) => {
      const isVisible = settings.visibleCharts.includes(chartType)
      const newVisibleCharts = isVisible
        ? settings.visibleCharts.filter(c => c !== chartType)
        : [...settings.visibleCharts, chartType]

      await updateSettings({ visibleCharts: newVisibleCharts })
    },
    [settings.visibleCharts, updateSettings]
  )

  const reorderCharts = useCallback(
    async (newOrder: ChartType[]) => {
      await updateSettings({ chartOrder: newOrder })
    },
    [updateSettings]
  )

  return {
    settings,
    loading,
    updateSettings,
    resetSettings,
    toggleChart,
    reorderCharts,
  }
}

export default useChartSettings
