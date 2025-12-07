import { useState, useEffect, useRef } from 'react'
import {
  collection,
  query,
  onSnapshot,
  type QueryConstraint,
  type DocumentData,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'

interface UseFirestoreQueryOptions {
  // Whether the query should run
  enabled?: boolean
  // Dependencies that should trigger re-subscription
  deps?: unknown[]
}

interface UseFirestoreQueryResult<T> {
  data: T[]
  loading: boolean
  error: Error | null
}

/**
 * Generic hook for real-time Firestore collection queries
 * @param collectionName - The Firestore collection name
 * @param constraints - Query constraints (where, orderBy, limit, etc.)
 * @param options - Hook options
 * @returns { data, loading, error }
 */
export function useFirestoreQuery<T = DocumentData>(
  collectionName: string,
  constraints: QueryConstraint[] = [],
  options: UseFirestoreQueryOptions = {}
): UseFirestoreQueryResult<T> {
  const { enabled = true, deps = [] } = options

  const [data, setData] = useState<T[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  // Track if component is mounted to prevent state updates after unmount
  const isMounted = useRef(true)

  // Serialize constraints for dependency comparison
  const constraintsKey = JSON.stringify(
    constraints.map((c) => ({
      type: c.type,
      // @ts-expect-error - Accessing internal constraint properties for comparison
      _query: c._query,
    }))
  )

  useEffect(() => {
    isMounted.current = true

    // Don't run if disabled
    if (!enabled) {
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    // Build query
    const q = query(collection(db, collectionName), ...constraints)

    // Subscribe to real-time updates
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        if (!isMounted.current) return

        const items = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as T[]

        setData(items)
        setLoading(false)
        setError(null)
      },
      (err) => {
        if (!isMounted.current) return

        console.error(`Firestore query error in ${collectionName}:`, err)
        setError(err)
        setLoading(false)
      }
    )

    // Cleanup: unsubscribe and mark as unmounted
    return () => {
      isMounted.current = false
      unsubscribe()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collectionName, constraintsKey, enabled, ...deps])

  return { data, loading, error }
}

/**
 * Helper to create typed collection hooks
 */
export function createCollectionHook<T>(collectionName: string) {
  return function useCollection(
    constraints: QueryConstraint[] = [],
    options: UseFirestoreQueryOptions = {}
  ) {
    return useFirestoreQuery<T>(collectionName, constraints, options)
  }
}
