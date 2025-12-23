import { initializeApp, getApps, type FirebaseApp } from 'firebase/app'
import {
  getAuth,
  initializeAuth,
  type Auth,
  onAuthStateChanged,
  type User,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  indexedDBLocalPersistence,
  browserLocalPersistence,
} from 'firebase/auth'
import {
  getFirestore,
  type Firestore,
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  onSnapshot,
  serverTimestamp,
  Timestamp,
  type QueryConstraint,
  type DocumentData,
  type QueryDocumentSnapshot,
  arrayUnion,
  arrayRemove,
  writeBatch,
  increment,
} from 'firebase/firestore'
import {
  getStorage,
  type FirebaseStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage'
import { getFunctions, type Functions, httpsCallable } from 'firebase/functions'
import { getMessaging, getToken, onMessage, type Messaging } from 'firebase/messaging'

// Firebase Configuration (from environment variables)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

// Initialize Firebase (singleton pattern)
let app: FirebaseApp
let auth: Auth
let db: Firestore
let storage: FirebaseStorage
let functions: Functions
let messaging: Messaging | null = null

// Detect Capacitor environment
const isCapacitor = typeof window !== 'undefined' &&
  (window.location?.protocol === 'capacitor:' ||
   (window as unknown as { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor?.isNativePlatform?.())

if (!getApps().length) {
  app = initializeApp(firebaseConfig)

  // Use initializeAuth with indexedDBLocalPersistence for Capacitor/WKWebView
  // This is required because browserLocalPersistence doesn't work in WKWebView
  if (isCapacitor) {
    console.log('[Firebase] Initializing auth with indexedDBLocalPersistence (Capacitor)')
    auth = initializeAuth(app, {
      persistence: indexedDBLocalPersistence,
    })
  } else {
    console.log('[Firebase] Initializing auth with browserLocalPersistence (Web)')
    auth = initializeAuth(app, {
      persistence: browserLocalPersistence,
    })
  }
} else {
  app = getApps()[0]
  auth = getAuth(app)
}

db = getFirestore(app)
storage = getStorage(app)
functions = getFunctions(app)

// Initialize FCM messaging (only in browser with service worker support)
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  try {
    messaging = getMessaging(app)
  } catch (error) {
    console.warn('Firebase Messaging not supported:', error)
  }
}

// Current tenant - PIR Portal is always 'glrs' tenant
export const CURRENT_TENANT = 'glrs'

// Export Firebase instances
export {
  app,
  auth,
  db,
  storage,
  functions,
  messaging,
  // Auth functions
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  // Firestore functions
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  onSnapshot,
  serverTimestamp,
  Timestamp,
  arrayUnion,
  arrayRemove,
  writeBatch,
  increment,
  // Storage functions
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
  // Cloud Functions
  httpsCallable,
}

// Types
export type { User, QueryConstraint, DocumentData, QueryDocumentSnapshot }

// =============================================================================
// FIREBASE CLOUD MESSAGING (FCM) HELPERS
// =============================================================================

const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY

/**
 * Request notification permission and get FCM token
 * Returns null if permission denied or FCM not supported
 */
export async function requestNotificationPermission(): Promise<string | null> {
  if (!messaging) {
    console.warn('FCM not initialized')
    return null
  }

  try {
    // Request permission
    const permission = await Notification.requestPermission()
    if (permission !== 'granted') {
      console.log('Notification permission denied')
      return null
    }

    // Register service worker
    const registration = await navigator.serviceWorker.register(
      '/Index/pir-portal/dist/firebase-messaging-sw.js'
    )

    // Get FCM token
    const token = await getToken(messaging, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: registration,
    })

    console.log('FCM token obtained:', token?.substring(0, 20) + '...')
    return token
  } catch (error) {
    console.error('Error getting FCM token:', error)
    return null
  }
}

/**
 * Subscribe to foreground messages
 * Returns unsubscribe function
 */
export function onForegroundMessage(
  callback: (payload: { notification?: { title?: string; body?: string }; data?: Record<string, string> }) => void
): (() => void) | null {
  if (!messaging) {
    console.warn('FCM not initialized')
    return null
  }

  return onMessage(messaging, (payload) => {
    console.log('Foreground message received:', payload)
    callback(payload)
  })
}

/**
 * Check if notifications are supported and permission status
 */
export function getNotificationStatus(): {
  supported: boolean
  permission: NotificationPermission | 'unsupported'
} {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return { supported: false, permission: 'unsupported' }
  }
  return { supported: true, permission: Notification.permission }
}
