import { useState, useEffect, useRef } from 'react'
import { doc, onSnapshot, type DocumentData } from 'firebase/firestore'
import { db } from '@/lib/firebase'

interface UseFirestoreDocOptions {
  // Whether the query should run
  enabled?: boolean
}

interface UseFirestoreDocResult<T> {
  data: T | null
  loading: boolean
  error: Error | null
  exists: boolean
}

/**
 * Generic hook for real-time single Firestore document
 * @param collectionName - The Firestore collection name
 * @param docId - The document ID (can be null/undefined to disable)
 * @param options - Hook options
 * @returns { data, loading, error, exists }
 */
export function useFirestoreDoc<T = DocumentData>(
  collectionName: string,
  docId: string | null | undefined,
  options: UseFirestoreDocOptions = {}
): UseFirestoreDocResult<T> {
  const { enabled = true } = options

  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [exists, setExists] = useState(false)

  // Track if component is mounted
  const isMounted = useRef(true)

  useEffect(() => {
    isMounted.current = true

    // Don't run if disabled or no docId
    if (!enabled || !docId) {
      setLoading(false)
      setData(null)
      setExists(false)
      return
    }

    setLoading(true)
    setError(null)

    // Subscribe to document
    const docRef = doc(db, collectionName, docId)

    const unsubscribe = onSnapshot(
      docRef,
      (snapshot) => {
        if (!isMounted.current) return

        if (snapshot.exists()) {
          setData({
            id: snapshot.id,
            ...snapshot.data(),
          } as T)
          setExists(true)
        } else {
          setData(null)
          setExists(false)
        }

        setLoading(false)
        setError(null)
      },
      (err) => {
        if (!isMounted.current) return

        console.error(`Firestore doc error in ${collectionName}/${docId}:`, err)
        setError(err)
        setLoading(false)
        setExists(false)
      }
    )

    // Cleanup
    return () => {
      isMounted.current = false
      unsubscribe()
    }
  }, [collectionName, docId, enabled])

  return { data, loading, error, exists }
}

/**
 * Helper to create typed document hooks
 */
export function createDocHook<T>(collectionName: string) {
  return function useDocument(
    docId: string | null | undefined,
    options: UseFirestoreDocOptions = {}
  ) {
    return useFirestoreDoc<T>(collectionName, docId, options)
  }
}
