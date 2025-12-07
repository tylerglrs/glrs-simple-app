import { useMemo } from 'react'
import { COPING_TECHNIQUES, type CopingTechnique, type CopingCategory } from '../data/copingTechniques'

// =============================================================================
// HELPER
// =============================================================================

/**
 * Get day of year (1-366)
 */
function getDayOfYear(date: Date = new Date()): number {
  const start = new Date(date.getFullYear(), 0, 0)
  const diff = date.getTime() - start.getTime()
  const oneDay = 1000 * 60 * 60 * 24
  return Math.floor(diff / oneDay)
}

// =============================================================================
// HOOK
// =============================================================================

/**
 * Hook that returns today's coping technique based on day of year.
 * Uses a deterministic rotation system cycling through all 61 techniques (~2 month rotation).
 *
 * @returns CopingTechnique for today
 *
 * @example
 * const technique = useTodaysCopingTechnique()
 * // Day 1 of year returns technique index 0
 * // Day 62 of year returns technique index 0 again (full cycle)
 */
export function useTodaysCopingTechnique(): CopingTechnique {
  return useMemo(() => {
    const dayOfYear = getDayOfYear()
    const index = ((dayOfYear - 1) % COPING_TECHNIQUES.length + COPING_TECHNIQUES.length) % COPING_TECHNIQUES.length
    return COPING_TECHNIQUES[index]
  }, []) // Empty deps since we only need to calculate once per render
}

/**
 * Hook that returns techniques filtered by category.
 * Useful for category-specific views or filters.
 *
 * @param category - 'CBT' | 'DBT' | 'MINDFULNESS'
 * @returns Array of CopingTechniques in that category
 */
export function useTechniquesByCategory(category: CopingCategory): CopingTechnique[] {
  return useMemo(() => {
    return COPING_TECHNIQUES.filter((t) => t.category === category)
  }, [category])
}

/**
 * Hook that returns the count of techniques by category.
 * Useful for displaying category statistics.
 *
 * @returns Object with category counts
 */
export function useTechniqueStats(): {
  total: number
  byCBT: number
  byDBT: number
  byMindfulness: number
} {
  return useMemo(() => {
    const cbt = COPING_TECHNIQUES.filter((t) => t.category === 'CBT').length
    const dbt = COPING_TECHNIQUES.filter((t) => t.category === 'DBT').length
    const mindfulness = COPING_TECHNIQUES.filter((t) => t.category === 'MINDFULNESS').length

    return {
      total: COPING_TECHNIQUES.length,
      byCBT: cbt,
      byDBT: dbt,
      byMindfulness: mindfulness,
    }
  }, [])
}

export default useTodaysCopingTechnique
