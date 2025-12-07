import { initializeApp, getApps, type FirebaseApp } from 'firebase/app'
import {
  getAuth,
  type Auth,
  onAuthStateChanged,
  type User,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
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

if (!getApps().length) {
  app = initializeApp(firebaseConfig)
} else {
  app = getApps()[0]
}

auth = getAuth(app)
db = getFirestore(app)
storage = getStorage(app)
functions = getFunctions(app)

// Current tenant - PIR Portal is always 'glrs' tenant
export const CURRENT_TENANT = 'glrs'

// Export Firebase instances
export {
  app,
  auth,
  db,
  storage,
  functions,
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
export type { User, QueryConstraint, DocumentData }
