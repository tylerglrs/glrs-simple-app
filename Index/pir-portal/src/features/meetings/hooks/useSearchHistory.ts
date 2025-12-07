import { useState, useEffect, useCallback } from 'react'

// ============================================================
// CONSTANTS
// ============================================================

const STORAGE_KEY = 'meetingSearchHistory'
const MAX_HISTORY_ITEMS = 10
const EXPIRY_DAYS = 30
const EXPIRY_MS = EXPIRY_DAYS * 24 * 60 * 60 * 1000

// ============================================================
// TYPES
// ============================================================

interface SearchHistoryItem {
  query: string
  timestamp: number
}

export interface UseSearchHistoryReturn {
  /** Recent search queries (newest first) */
  history: SearchHistoryItem[]
  /** Add a search query to history */
  addSearch: (query: string) => void
  /** Remove a specific search from history */
  removeSearch: (query: string) => void
  /** Clear all search history */
  clearHistory: () => void
  /** Get suggestions based on current input */
  getSuggestions: (input: string) => string[]
}

// ============================================================
// HOOK: useSearchHistory
// ============================================================

/**
 * Hook for managing meeting search history
 *
 * Features:
 * - Persists to localStorage
 * - Auto-expires entries after 30 days
 * - Keeps last 10 searches
 * - Deduplicates entries
 * - Provides autocomplete suggestions
 *
 * @returns Object with history array and management methods
 */
export function useSearchHistory(): UseSearchHistoryReturn {
  const [history, setHistory] = useState<SearchHistoryItem[]>([])

  // ============================================================
  // LOAD HISTORY ON MOUNT
  // ============================================================

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (!stored) return

      const parsed: SearchHistoryItem[] = JSON.parse(stored)

      // Filter out expired entries
      const thirtyDaysAgo = Date.now() - EXPIRY_MS
      const validHistory = parsed.filter((item) => item.timestamp > thirtyDaysAgo)

      // Update storage if entries were filtered out
      if (validHistory.length !== parsed.length) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(validHistory))
      }

      setHistory(validHistory)
    } catch (error) {
      console.error('[useSearchHistory] Error loading history:', error)
      localStorage.removeItem(STORAGE_KEY)
    }
  }, [])

  // ============================================================
  // PERSIST TO STORAGE
  // ============================================================

  const saveToStorage = useCallback((items: SearchHistoryItem[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    } catch (error) {
      console.error('[useSearchHistory] Error saving history:', error)
    }
  }, [])

  // ============================================================
  // ADD SEARCH
  // ============================================================

  /**
   * Add a search query to history
   * - Deduplicates (moves existing to top)
   * - Limits to MAX_HISTORY_ITEMS
   */
  const addSearch = useCallback(
    (query: string) => {
      const trimmed = query.trim()
      if (!trimmed) return

      setHistory((prev) => {
        // Remove existing entry if it exists
        const filtered = prev.filter((item) => item.query.toLowerCase() !== trimmed.toLowerCase())

        // Add new entry at the beginning
        const newHistory = [
          { query: trimmed, timestamp: Date.now() },
          ...filtered,
        ].slice(0, MAX_HISTORY_ITEMS)

        saveToStorage(newHistory)
        return newHistory
      })
    },
    [saveToStorage]
  )

  // ============================================================
  // REMOVE SEARCH
  // ============================================================

  /**
   * Remove a specific search query from history
   */
  const removeSearch = useCallback(
    (query: string) => {
      setHistory((prev) => {
        const newHistory = prev.filter(
          (item) => item.query.toLowerCase() !== query.toLowerCase()
        )
        saveToStorage(newHistory)
        return newHistory
      })
    },
    [saveToStorage]
  )

  // ============================================================
  // CLEAR HISTORY
  // ============================================================

  /**
   * Clear all search history
   */
  const clearHistory = useCallback(() => {
    setHistory([])
    localStorage.removeItem(STORAGE_KEY)
  }, [])

  // ============================================================
  // GET SUGGESTIONS
  // ============================================================

  /**
   * Get autocomplete suggestions based on input
   * Returns queries that start with or contain the input
   */
  const getSuggestions = useCallback(
    (input: string): string[] => {
      const trimmed = input.trim().toLowerCase()
      if (!trimmed) return history.map((item) => item.query)

      return history
        .filter((item) => item.query.toLowerCase().includes(trimmed))
        .map((item) => item.query)
    },
    [history]
  )

  return {
    history,
    addSearch,
    removeSearch,
    clearHistory,
    getSuggestions,
  }
}

export default useSearchHistory
