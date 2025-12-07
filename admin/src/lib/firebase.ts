import { initializeApp, getApps, FirebaseApp } from "firebase/app"
import {
  getAuth,
  Auth,
  onAuthStateChanged,
  User,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
} from "firebase/auth"
import {
  getFirestore,
  Firestore,
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
  onSnapshot,
  serverTimestamp,
  Timestamp,
  QueryConstraint,
  DocumentData,
  arrayUnion,
  arrayRemove,
  writeBatch,
} from "firebase/firestore"
import {
  getStorage,
  FirebaseStorage,
  ref,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage"

// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyAufSTHtCTFSEIeZ9YzvrULCnji5I-SMi0",
  authDomain: "glrs-pir-system.firebaseapp.com",
  projectId: "glrs-pir-system",
  storageBucket: "glrs-pir-system.firebasestorage.app",
  messagingSenderId: "830378577655",
  appId: "1:830378577655:web:8c5e0a9b0f3d2f1a0c9e8b",
}

// Initialize Firebase (singleton pattern)
let app: FirebaseApp
let auth: Auth
let db: Firestore
let storage: FirebaseStorage

if (!getApps().length) {
  app = initializeApp(firebaseConfig)
  console.log("Firebase initialized successfully")
} else {
  app = getApps()[0]
  console.log("Firebase already initialized")
}

auth = getAuth(app)
db = getFirestore(app)
storage = getStorage(app)

// Portal type detection (single-business model)
export function getPortalType(): "full-service" | "consumer" | "alumni" {
  const path = window.location.pathname

  if (path.includes("consumer.html") || path.includes("/consumer")) {
    return "consumer"
  } else if (path.includes("alumni.html") || path.includes("/alumni")) {
    return "alumni"
  }

  return "full-service"
}

export const CURRENT_TENANT = getPortalType()

// Audit logging (HIPAA compliance)
export async function logAudit(
  action: string,
  details: {
    tenantId?: string
    targetUserId?: string
    resource?: string
    resourceId?: string
    changes?: Record<string, unknown>
    success?: boolean
  } = {}
): Promise<void> {
  try {
    const currentUser = auth.currentUser
    if (!currentUser) return

    const userDoc = await getDoc(doc(db, "users", currentUser.uid))
    const userData = userDoc.exists() ? userDoc.data() : {}

    await addDoc(collection(db, "auditLogs"), {
      tenantId: details.tenantId || CURRENT_TENANT,
      userId: currentUser.uid,
      userEmail: currentUser.email,
      userName:
        userData.displayName || `${userData.firstName || ""} ${userData.lastName || ""}`.trim(),
      userRole: userData.role || "unknown",
      action,
      targetUserId: details.targetUserId || null,
      targetResource: details.resource || null,
      resourceId: details.resourceId || null,
      timestamp: serverTimestamp(),
      changes: details.changes || null,
      metadata: {
        userAgent: navigator.userAgent,
        url: window.location.href,
      },
      success: details.success !== false,
    })
  } catch (error) {
    console.error("Failed to log audit:", error)
    // Don't throw - audit logging should not break app functionality
  }
}

// Export Firebase instances and utilities
export {
  app,
  auth,
  db,
  storage,
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
  onSnapshot,
  serverTimestamp,
  Timestamp,
  arrayUnion,
  arrayRemove,
  writeBatch,
  // Storage functions
  ref,
  uploadBytes,
  getDownloadURL,
}

// Types
export type { User, QueryConstraint, DocumentData }
