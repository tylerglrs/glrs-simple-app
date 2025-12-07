import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDoc,
  serverTimestamp,
  increment,
  arrayUnion,
  arrayRemove,
  Timestamp,
  limit,
} from 'firebase/firestore'
import type { Unsubscribe } from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { db, storage } from '@/lib/firebase'
import { useAuth } from '@/contexts/AuthContext'
import type {
  CommunityMessage,
  MyDayPost,
  MyDayPostType,
  MyDayFilter,
  SupportGroup,
  Comment,
  CommunitySubTab,
  TopicRoom,
} from '../types'

// ============================================================
// CONSTANTS
// ============================================================

const MESSAGES_COLLECTION = 'messages'
const DAILY_POSTS_COLLECTION = 'dailyPosts'
const SUPPORT_GROUPS_COLLECTION = 'supportGroups'
const TOPIC_ROOMS_COLLECTION = 'topicRooms'
const BLOCKED_USERS_COLLECTION = 'blockedUsers'
const REPORTED_CONTENT_COLLECTION = 'reportedContent'
const MAX_IMAGE_SIZE = 1024 * 1024 * 5 // 5MB
const IMAGE_QUALITY = 0.8
const MESSAGE_LIMIT = 100 // Limit for performance
const MY_DAY_HOURS = 24 // Hours to show My Day posts

// ============================================================
// HELPER FUNCTIONS
// ============================================================

/**
 * Compress an image file before upload
 */
async function compressImage(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        let width = img.width
        let height = img.height

        // Max dimension 1200px
        const maxDim = 1200
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = (height * maxDim) / width
            width = maxDim
          } else {
            width = (width * maxDim) / height
            height = maxDim
          }
        }

        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          reject(new Error('Could not get canvas context'))
          return
        }
        ctx.drawImage(img, 0, 0, width, height)
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob)
            } else {
              reject(new Error('Failed to compress image'))
            }
          },
          'image/jpeg',
          IMAGE_QUALITY
        )
      }
      img.onerror = () => reject(new Error('Failed to load image'))
      img.src = e.target?.result as string
    }
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsDataURL(file)
  })
}

/**
 * Format timestamp to relative time
 */
export function formatTimeAgo(timestamp: Timestamp | null): string {
  if (!timestamp) return 'now'
  const date = timestamp.toDate()
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000)

  if (seconds < 60) return 'just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

/**
 * Get user initials from name
 */
export function getInitials(name?: string): string {
  if (!name) return '?'
  const parts = name.split(' ')
  return parts.length > 1
    ? (parts[0][0] + parts[1][0]).toUpperCase()
    : parts[0][0].toUpperCase()
}

/**
 * Generate a temporary ID for optimistic updates
 */
function generateTempId(): string {
  return `temp_${Date.now()}_${Math.random().toString(36).substring(7)}`
}

// ============================================================
// MAIN HOOK
// ============================================================

interface UseCommunityOptions {
  initialTab?: CommunitySubTab
  topicRoomId?: string | null
}

export function useCommunity(options: UseCommunityOptions = {}) {
  const { initialTab = 'main', topicRoomId: initialTopicRoomId = null } = options
  const { user, userData } = useAuth()

  // Tab state
  const [activeTab, setActiveTab] = useState<CommunitySubTab>(initialTab)

  // Topic room state
  const [selectedTopicRoomId, setSelectedTopicRoomId] = useState<string | null>(initialTopicRoomId)
  const [topicRooms, setTopicRooms] = useState<TopicRoom[]>([])
  const [topicRoomsLoading, setTopicRoomsLoading] = useState(true)

  // Community messages state
  const [communityMessages, setCommunityMessages] = useState<CommunityMessage[]>([])
  const [messagesLoading, setMessagesLoading] = useState(true)
  const [messagesError, setMessagesError] = useState<string | null>(null)

  // My Day state
  const [myDayPosts, setMyDayPosts] = useState<MyDayPost[]>([])
  const [myDayLoading, setMyDayLoading] = useState(true)
  const [myDayError, setMyDayError] = useState<string | null>(null)
  const [myDayFilter, setMyDayFilter] = useState<MyDayFilter>('all')

  // Support groups state
  const [supportGroups, setSupportGroups] = useState<SupportGroup[]>([])
  const [groupsLoading, setGroupsLoading] = useState(true)
  const [groupsError, setGroupsError] = useState<string | null>(null)

  // Comments state with real-time subscriptions
  const [comments, setComments] = useState<Record<string, Comment[]>>({})
  const [loadingComments, setLoadingComments] = useState<Record<string, boolean>>({})
  const [submittingComment, setSubmittingComment] = useState(false)
  const commentSubscriptions = useRef<Record<string, Unsubscribe>>({})

  // Blocked users state
  const [blockedUserIds, setBlockedUserIds] = useState<string[]>([])

  // Image upload state
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  // ============================================================
  // COMPUTED VALUES (Memoized for performance)
  // ============================================================

  const isCoachOrAdmin = useMemo(() => {
    return userData?.role === 'coach' || userData?.role === 'admin'
  }, [userData?.role])

  const currentUserDisplayName = useMemo(() => {
    if (userData?.displayName) return userData.displayName
    const fullName = `${userData?.firstName || ''} ${userData?.lastName || ''}`.trim()
    if (fullName) return fullName
    return user?.displayName || 'Anonymous'
  }, [userData?.displayName, userData?.firstName, userData?.lastName, user?.displayName])

  const currentUserProfilePhoto = useMemo(() => {
    return userData?.profilePhoto || null
  }, [userData?.profilePhoto])

  // Filter My Day posts with memoization
  const filteredMyDayPosts = useMemo(() => {
    if (!user) return []

    let filtered = myDayPosts.filter(
      (post) => !blockedUserIds.includes(post.userId)
    )

    switch (myDayFilter) {
      case 'reflections':
        return filtered.filter((post) => post.type === 'reflection')
      case 'wins':
        return filtered.filter((post) => post.type === 'win')
      case 'myPosts':
        return filtered.filter((post) => post.userId === user.uid)
      default:
        return filtered
    }
  }, [myDayPosts, myDayFilter, blockedUserIds, user])

  // Filter community messages with memoization
  const filteredMessages = useMemo(() => {
    return communityMessages.filter(
      (msg) => !blockedUserIds.includes(msg.senderId)
    )
  }, [communityMessages, blockedUserIds])

  // ============================================================
  // CLEANUP ON UNMOUNT
  // ============================================================

  useEffect(() => {
    // Cleanup all comment subscriptions on unmount
    return () => {
      Object.values(commentSubscriptions.current).forEach((unsubscribe) => {
        unsubscribe()
      })
      commentSubscriptions.current = {}
    }
  }, [])

  // ============================================================
  // DATA LOADING - BLOCKED USERS (Real-time)
  // ============================================================

  useEffect(() => {
    if (!user?.uid) return

    const blockedRef = collection(db, BLOCKED_USERS_COLLECTION)
    const q = query(blockedRef, where('blockedBy', '==', user.uid))

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const ids = snapshot.docs.map((doc) => doc.data().blockedUserId as string)
        setBlockedUserIds(ids)
      },
      (error) => {
        console.error('[useCommunity] Error loading blocked users:', error)
      }
    )

    return () => unsubscribe()
  }, [user?.uid])

  // ============================================================
  // DATA LOADING - TOPIC ROOMS (Real-time)
  // ============================================================

  useEffect(() => {
    if (!user?.uid) return

    setTopicRoomsLoading(true)

    const roomsRef = collection(db, TOPIC_ROOMS_COLLECTION)
    const q = query(roomsRef, orderBy('name', 'asc'))

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const rooms: TopicRoom[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as TopicRoom[]
        setTopicRooms(rooms)
        setTopicRoomsLoading(false)
      },
      (error) => {
        console.error('[useCommunity] Error loading topic rooms:', error)
        setTopicRoomsLoading(false)
      }
    )

    return () => unsubscribe()
  }, [user?.uid])

  // ============================================================
  // DATA LOADING - COMMUNITY MESSAGES (Real-time with limit)
  // ============================================================

  useEffect(() => {
    if (!user?.uid) return

    setMessagesLoading(true)
    setMessagesError(null)

    const messagesRef = collection(db, MESSAGES_COLLECTION)

    // Build query based on whether we're in a topic room or main community
    let q
    if (selectedTopicRoomId) {
      q = query(
        messagesRef,
        where('type', '==', 'topic'),
        where('topicRoomId', '==', selectedTopicRoomId),
        orderBy('createdAt', 'desc'),
        limit(MESSAGE_LIMIT)
      )
    } else {
      q = query(
        messagesRef,
        where('type', '==', 'community'),
        orderBy('createdAt', 'desc'),
        limit(MESSAGE_LIMIT)
      )
    }

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const msgs: CommunityMessage[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as CommunityMessage[]
        setCommunityMessages(msgs)
        setMessagesLoading(false)
      },
      (error) => {
        console.error('[useCommunity] Error loading community messages:', error)
        setMessagesError('Failed to load community messages')
        setMessagesLoading(false)
      }
    )

    return () => unsubscribe()
  }, [user?.uid, selectedTopicRoomId])

  // ============================================================
  // DATA LOADING - MY DAY POSTS (Real-time with time limit)
  // ============================================================

  useEffect(() => {
    if (!user?.uid) return

    setMyDayLoading(true)
    setMyDayError(null)

    // Get posts from last 24 hours
    const yesterday = new Date()
    yesterday.setHours(yesterday.getHours() - MY_DAY_HOURS)

    const postsRef = collection(db, DAILY_POSTS_COLLECTION)
    const q = query(
      postsRef,
      where('createdAt', '>=', Timestamp.fromDate(yesterday)),
      orderBy('createdAt', 'desc'),
      limit(MESSAGE_LIMIT)
    )

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const posts: MyDayPost[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as MyDayPost[]
        setMyDayPosts(posts)
        setMyDayLoading(false)
      },
      (error) => {
        console.error('[useCommunity] Error loading My Day posts:', error)
        setMyDayError('Failed to load My Day posts')
        setMyDayLoading(false)
      }
    )

    return () => unsubscribe()
  }, [user?.uid])

  // ============================================================
  // DATA LOADING - SUPPORT GROUPS (Real-time)
  // ============================================================

  useEffect(() => {
    if (!user?.uid) return

    setGroupsLoading(true)
    setGroupsError(null)

    const groupsRef = collection(db, SUPPORT_GROUPS_COLLECTION)
    const q = query(groupsRef, orderBy('name', 'asc'))

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const groups: SupportGroup[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as SupportGroup[]
        setSupportGroups(groups)
        setGroupsLoading(false)
      },
      (error) => {
        console.error('[useCommunity] Error loading support groups:', error)
        setGroupsError('Failed to load support groups')
        setGroupsLoading(false)
      }
    )

    return () => unsubscribe()
  }, [user?.uid])

  // ============================================================
  // IMAGE UPLOAD
  // ============================================================

  const uploadImage = useCallback(
    async (file: File, folder: string = 'community'): Promise<string | null> => {
      if (!user?.uid) return null
      if (file.size > MAX_IMAGE_SIZE) {
        throw new Error('Image must be less than 5MB')
      }

      setUploading(true)
      setUploadProgress(0)

      try {
        // Compress image
        setUploadProgress(20)
        const compressed = await compressImage(file)

        // Upload to Firebase Storage
        setUploadProgress(50)
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.jpg`
        const storageRef = ref(storage, `${folder}/${user.uid}/${fileName}`)
        await uploadBytes(storageRef, compressed)

        setUploadProgress(80)
        const url = await getDownloadURL(storageRef)

        setUploadProgress(100)
        return url
      } catch (error) {
        console.error('[useCommunity] Error uploading image:', error)
        throw error
      } finally {
        setUploading(false)
        setUploadProgress(0)
      }
    },
    [user?.uid]
  )

  // ============================================================
  // COMMUNITY MESSAGE ACTIONS (with Optimistic Updates)
  // ============================================================

  const sendCommunityMessage = useCallback(
    async (content: string, imageUrl?: string, isAnonymous: boolean = false): Promise<boolean> => {
      if (!user?.uid || (!content.trim() && !imageUrl)) return false

      // Create optimistic message
      const tempId = generateTempId()
      const optimisticMessage: CommunityMessage = {
        id: tempId,
        content: content.trim(),
        imageUrl: imageUrl || undefined,
        senderId: user.uid,
        senderName: isAnonymous ? 'Anonymous' : currentUserDisplayName,
        senderProfileImageUrl: isAnonymous ? undefined : currentUserProfilePhoto || undefined,
        isAnonymous,
        type: selectedTopicRoomId ? 'topic' : 'community',
        topicRoomId: selectedTopicRoomId || undefined,
        createdAt: Timestamp.now(),
        reactions: { heart: [], support: [], celebrate: [] },
        reactedBy: {},
        commentCount: 0,
      }

      // Add optimistic message immediately (at the start since sorted desc)
      setCommunityMessages((prev) => [optimisticMessage, ...prev])

      try {
        const messagesRef = collection(db, MESSAGES_COLLECTION)
        await addDoc(messagesRef, {
          content: content.trim(),
          imageUrl: imageUrl || null,
          senderId: user.uid,
          senderName: isAnonymous ? 'Anonymous' : currentUserDisplayName,
          senderProfileImageUrl: isAnonymous ? null : currentUserProfilePhoto,
          isAnonymous,
          type: selectedTopicRoomId ? 'topic' : 'community',
          topicRoomId: selectedTopicRoomId || null,
          createdAt: serverTimestamp(),
          reactions: { heart: [], support: [], celebrate: [] },
          reactedBy: {},
          commentCount: 0,
        })
        // Real-time listener will update with actual data
        return true
      } catch (error) {
        console.error('[useCommunity] Error sending message:', error)
        // Remove optimistic message on error
        setCommunityMessages((prev) => prev.filter((msg) => msg.id !== tempId))
        return false
      }
    },
    [user?.uid, currentUserDisplayName, currentUserProfilePhoto, selectedTopicRoomId]
  )

  const deleteMessage = useCallback(
    async (messageId: string): Promise<boolean> => {
      if (!user?.uid) return false

      // Optimistic delete
      const deletedMessage = communityMessages.find((msg) => msg.id === messageId)
      setCommunityMessages((prev) => prev.filter((msg) => msg.id !== messageId))

      try {
        const messageRef = doc(db, MESSAGES_COLLECTION, messageId)
        const messageDoc = await getDoc(messageRef)

        if (!messageDoc.exists()) {
          return false
        }

        const messageData = messageDoc.data()
        if (messageData.senderId !== user.uid && !isCoachOrAdmin) {
          // Restore message if not authorized
          if (deletedMessage) {
            setCommunityMessages((prev) => [...prev, deletedMessage].sort((a, b) => {
              const aTime = a.createdAt?.toMillis() || 0
              const bTime = b.createdAt?.toMillis() || 0
              return bTime - aTime
            }))
          }
          return false
        }

        await deleteDoc(messageRef)
        return true
      } catch (error) {
        console.error('[useCommunity] Error deleting message:', error)
        // Restore message on error
        if (deletedMessage) {
          setCommunityMessages((prev) => [...prev, deletedMessage].sort((a, b) => {
            const aTime = a.createdAt?.toMillis() || 0
            const bTime = b.createdAt?.toMillis() || 0
            return bTime - aTime
          }))
        }
        return false
      }
    },
    [user?.uid, isCoachOrAdmin, communityMessages]
  )

  const reportMessage = useCallback(
    async (messageId: string, reason?: string): Promise<boolean> => {
      if (!user?.uid) return false

      try {
        const reportsRef = collection(db, REPORTED_CONTENT_COLLECTION)
        await addDoc(reportsRef, {
          contentId: messageId,
          contentType: 'community_message',
          reportedBy: user.uid,
          reason: reason || 'Inappropriate content',
          createdAt: serverTimestamp(),
          status: 'pending',
        })
        return true
      } catch (error) {
        console.error('[useCommunity] Error reporting message:', error)
        return false
      }
    },
    [user?.uid]
  )

  // ============================================================
  // MY DAY ACTIONS (with Optimistic Updates)
  // ============================================================

  const createMyDayPost = useCallback(
    async (type: MyDayPostType, content: string, isAnonymous: boolean = false): Promise<boolean> => {
      if (!user?.uid || !content.trim()) return false

      // Create optimistic post
      const tempId = generateTempId()
      const optimisticPost: MyDayPost = {
        id: tempId,
        userId: user.uid,
        userDisplayName: isAnonymous ? 'Anonymous' : currentUserDisplayName,
        userProfileImageUrl: isAnonymous ? undefined : currentUserProfilePhoto || undefined,
        type,
        content: content.trim(),
        isAnonymous,
        createdAt: Timestamp.now(),
        reactions: { heart: [], support: [], celebrate: [] },
        reactedBy: {},
        commentCount: 0,
      }

      // Add optimistic post immediately
      setMyDayPosts((prev) => [optimisticPost, ...prev])

      try {
        const postsRef = collection(db, DAILY_POSTS_COLLECTION)
        await addDoc(postsRef, {
          userId: user.uid,
          userDisplayName: isAnonymous ? 'Anonymous' : currentUserDisplayName,
          userProfileImageUrl: isAnonymous ? null : currentUserProfilePhoto,
          type,
          content: content.trim(),
          isAnonymous,
          createdAt: serverTimestamp(),
          reactions: { heart: [], support: [], celebrate: [] },
          reactedBy: {},
          commentCount: 0,
        })
        return true
      } catch (error) {
        console.error('[useCommunity] Error creating My Day post:', error)
        // Remove optimistic post on error
        setMyDayPosts((prev) => prev.filter((post) => post.id !== tempId))
        return false
      }
    },
    [user?.uid, currentUserDisplayName, currentUserProfilePhoto]
  )

  const deleteMyDayPost = useCallback(
    async (postId: string): Promise<boolean> => {
      if (!user?.uid) return false

      // Optimistic delete
      const deletedPost = myDayPosts.find((post) => post.id === postId)
      setMyDayPosts((prev) => prev.filter((post) => post.id !== postId))

      try {
        const postRef = doc(db, DAILY_POSTS_COLLECTION, postId)
        const postDoc = await getDoc(postRef)

        if (!postDoc.exists()) {
          return false
        }

        const postData = postDoc.data()
        if (postData.userId !== user.uid && !isCoachOrAdmin) {
          // Restore post if not authorized
          if (deletedPost) {
            setMyDayPosts((prev) => [...prev, deletedPost].sort((a, b) => {
              const aTime = a.createdAt?.toMillis() || 0
              const bTime = b.createdAt?.toMillis() || 0
              return bTime - aTime
            }))
          }
          return false
        }

        await deleteDoc(postRef)
        return true
      } catch (error) {
        console.error('[useCommunity] Error deleting My Day post:', error)
        // Restore post on error
        if (deletedPost) {
          setMyDayPosts((prev) => [...prev, deletedPost].sort((a, b) => {
            const aTime = a.createdAt?.toMillis() || 0
            const bTime = b.createdAt?.toMillis() || 0
            return bTime - aTime
          }))
        }
        return false
      }
    },
    [user?.uid, isCoachOrAdmin, myDayPosts]
  )

  // ============================================================
  // REACTIONS (with Optimistic Updates)
  // ============================================================

  const addReaction = useCallback(
    async (
      postId: string,
      reactionType: 'heart' | 'support' | 'celebrate',
      isMyDayPost: boolean = false
    ): Promise<void> => {
      if (!user?.uid) return

      // Get current state for optimistic update
      const posts = isMyDayPost ? myDayPosts : communityMessages
      const post = posts.find((p) => p.id === postId)

      if (!post) return

      const currentReaction = post.reactedBy?.[user.uid]
      const isToggleOff = currentReaction === reactionType

      // Helper to create updated post
      const updatePost = <T extends CommunityMessage | MyDayPost>(p: T): T => {
        if (p.id !== postId) return p

        const newReactions = { ...p.reactions }
        const newReactedBy = { ...p.reactedBy }

        // Remove from previous reaction
        if (currentReaction && newReactions[currentReaction]) {
          newReactions[currentReaction] = newReactions[currentReaction].filter(
            (uid) => uid !== user.uid
          )
        }

        if (isToggleOff) {
          // Toggle off - remove from reactedBy
          delete newReactedBy[user.uid]
        } else {
          // Add new reaction
          if (!newReactions[reactionType]) {
            newReactions[reactionType] = []
          }
          newReactions[reactionType] = [...newReactions[reactionType], user.uid]
          newReactedBy[user.uid] = reactionType
        }

        return { ...p, reactions: newReactions, reactedBy: newReactedBy }
      }

      // Optimistic update - apply to correct state
      if (isMyDayPost) {
        setMyDayPosts((prev) => prev.map(updatePost))
      } else {
        setCommunityMessages((prev) => prev.map(updatePost))
      }

      try {
        const collectionName = isMyDayPost ? DAILY_POSTS_COLLECTION : MESSAGES_COLLECTION
        const postRef = doc(db, collectionName, postId)

        const updates: Record<string, unknown> = {}

        if (currentReaction) {
          updates[`reactions.${currentReaction}`] = arrayRemove(user.uid)
        }

        if (isToggleOff) {
          updates[`reactedBy.${user.uid}`] = null
        } else {
          updates[`reactions.${reactionType}`] = arrayUnion(user.uid)
          updates[`reactedBy.${user.uid}`] = reactionType
        }

        await updateDoc(postRef, updates)
      } catch (error) {
        console.error('[useCommunity] Error adding reaction:', error)
        // Real-time listener will restore correct state
      }
    },
    [user?.uid, myDayPosts, communityMessages]
  )

  // ============================================================
  // COMMENTS (Real-time with Optimistic Updates)
  // ============================================================

  const subscribeToComments = useCallback(
    (postId: string, isMyDayPost: boolean = false) => {
      // Don't subscribe if already subscribed
      if (commentSubscriptions.current[postId]) return

      const collectionName = isMyDayPost ? DAILY_POSTS_COLLECTION : MESSAGES_COLLECTION
      const commentsRef = collection(db, collectionName, postId, 'comments')
      const q = query(commentsRef, orderBy('createdAt', 'asc'))

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const loadedComments: Comment[] = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as Comment[]
          setComments((prev) => ({ ...prev, [postId]: loadedComments }))
          setLoadingComments((prev) => ({ ...prev, [postId]: false }))
        },
        (error) => {
          console.error('[useCommunity] Error loading comments:', error)
          setLoadingComments((prev) => ({ ...prev, [postId]: false }))
        }
      )

      commentSubscriptions.current[postId] = unsubscribe
    },
    []
  )

  const loadComments = useCallback(
    async (postId: string, isMyDayPost: boolean = false): Promise<void> => {
      if (!user?.uid) return

      setLoadingComments((prev) => ({ ...prev, [postId]: true }))

      // Start real-time subscription
      subscribeToComments(postId, isMyDayPost)
    },
    [user?.uid, subscribeToComments]
  )

  const addComment = useCallback(
    async (
      postId: string,
      content: string,
      isMyDayPost: boolean = false,
      isAnonymous: boolean = false
    ): Promise<boolean> => {
      if (!user?.uid || !content.trim()) return false

      setSubmittingComment(true)

      // Create optimistic comment
      const tempId = generateTempId()
      const optimisticComment: Comment = {
        id: tempId,
        content: content.trim(),
        userId: user.uid,
        userDisplayName: isAnonymous ? 'Anonymous' : currentUserDisplayName,
        userProfileImageUrl: isAnonymous ? undefined : currentUserProfilePhoto || undefined,
        isAnonymous,
        createdAt: Timestamp.now(),
      }

      // Add optimistic comment
      setComments((prev) => ({
        ...prev,
        [postId]: [...(prev[postId] || []), optimisticComment],
      }))

      // Optimistically update comment count
      const incrementCount = <T extends CommunityMessage | MyDayPost>(p: T): T =>
        p.id === postId ? { ...p, commentCount: (p.commentCount || 0) + 1 } : p

      if (isMyDayPost) {
        setMyDayPosts((prev) => prev.map(incrementCount))
      } else {
        setCommunityMessages((prev) => prev.map(incrementCount))
      }

      try {
        const collectionName = isMyDayPost ? DAILY_POSTS_COLLECTION : MESSAGES_COLLECTION
        const commentsRef = collection(db, collectionName, postId, 'comments')

        await addDoc(commentsRef, {
          content: content.trim(),
          userId: user.uid,
          userDisplayName: isAnonymous ? 'Anonymous' : currentUserDisplayName,
          userProfileImageUrl: isAnonymous ? null : currentUserProfilePhoto,
          isAnonymous,
          createdAt: serverTimestamp(),
        })

        // Increment comment count on server
        const postRef = doc(db, collectionName, postId)
        await updateDoc(postRef, {
          commentCount: increment(1),
        })

        return true
      } catch (error) {
        console.error('[useCommunity] Error adding comment:', error)
        // Remove optimistic comment on error
        setComments((prev) => ({
          ...prev,
          [postId]: (prev[postId] || []).filter((c) => c.id !== tempId),
        }))
        // Restore comment count
        const decrementCount = <T extends CommunityMessage | MyDayPost>(p: T): T =>
          p.id === postId ? { ...p, commentCount: Math.max((p.commentCount || 1) - 1, 0) } : p

        if (isMyDayPost) {
          setMyDayPosts((prev) => prev.map(decrementCount))
        } else {
          setCommunityMessages((prev) => prev.map(decrementCount))
        }
        return false
      } finally {
        setSubmittingComment(false)
      }
    },
    [user?.uid, currentUserDisplayName, currentUserProfilePhoto]
  )

  const deleteComment = useCallback(
    async (postId: string, commentId: string, isMyDayPost: boolean = false): Promise<boolean> => {
      if (!user?.uid) return false

      // Get comment for optimistic delete
      const postComments = comments[postId] || []
      const deletedComment = postComments.find((c) => c.id === commentId)

      if (!deletedComment) return false

      // Check authorization
      if (deletedComment.userId !== user.uid && !isCoachOrAdmin) {
        return false
      }

      // Optimistic delete
      setComments((prev) => ({
        ...prev,
        [postId]: (prev[postId] || []).filter((c) => c.id !== commentId),
      }))

      // Optimistically update comment count
      const decrementCount = <T extends CommunityMessage | MyDayPost>(p: T): T =>
        p.id === postId ? { ...p, commentCount: Math.max((p.commentCount || 1) - 1, 0) } : p

      if (isMyDayPost) {
        setMyDayPosts((prev) => prev.map(decrementCount))
      } else {
        setCommunityMessages((prev) => prev.map(decrementCount))
      }

      try {
        const collectionName = isMyDayPost ? DAILY_POSTS_COLLECTION : MESSAGES_COLLECTION
        const commentRef = doc(db, collectionName, postId, 'comments', commentId)
        await deleteDoc(commentRef)

        // Decrement comment count on server
        const postRef = doc(db, collectionName, postId)
        await updateDoc(postRef, {
          commentCount: increment(-1),
        })

        return true
      } catch (error) {
        console.error('[useCommunity] Error deleting comment:', error)
        // Restore comment on error
        setComments((prev) => ({
          ...prev,
          [postId]: [...(prev[postId] || []), deletedComment].sort((a, b) => {
            const aTime = a.createdAt?.toMillis() || 0
            const bTime = b.createdAt?.toMillis() || 0
            return aTime - bTime
          }),
        }))
        // Restore comment count
        const incrementCount = <T extends CommunityMessage | MyDayPost>(p: T): T =>
          p.id === postId ? { ...p, commentCount: (p.commentCount || 0) + 1 } : p

        if (isMyDayPost) {
          setMyDayPosts((prev) => prev.map(incrementCount))
        } else {
          setCommunityMessages((prev) => prev.map(incrementCount))
        }
        return false
      }
    },
    [user?.uid, isCoachOrAdmin, comments]
  )

  // ============================================================
  // TOPIC ROOM SWITCHING
  // ============================================================

  const switchTopicRoom = useCallback((roomId: string | null) => {
    setSelectedTopicRoomId(roomId)
    // Clear messages when switching rooms (listener will fetch new ones)
    setCommunityMessages([])
    setMessagesLoading(true)
  }, [])

  // ============================================================
  // BLOCK USER
  // ============================================================

  const blockUser = useCallback(
    async (userId: string): Promise<boolean> => {
      if (!user?.uid || userId === user.uid) return false

      // Optimistic update - add to blocked list
      setBlockedUserIds((prev) => [...prev, userId])

      try {
        const blockedRef = collection(db, BLOCKED_USERS_COLLECTION)
        await addDoc(blockedRef, {
          blockedUserId: userId,
          blockedBy: user.uid,
          createdAt: serverTimestamp(),
        })
        return true
      } catch (error) {
        console.error('[useCommunity] Error blocking user:', error)
        // Remove from blocked list on error
        setBlockedUserIds((prev) => prev.filter((id) => id !== userId))
        return false
      }
    },
    [user?.uid]
  )

  // ============================================================
  // RETURN
  // ============================================================

  return {
    // Tab state
    activeTab,
    setActiveTab,

    // Topic rooms
    topicRooms,
    topicRoomsLoading,
    selectedTopicRoomId,
    switchTopicRoom,

    // User info
    currentUserId: user?.uid || null,
    currentUserDisplayName,
    currentUserProfilePhoto,
    isCoachOrAdmin,

    // Community messages
    communityMessages: filteredMessages,
    messagesLoading,
    messagesError,
    sendCommunityMessage,
    deleteMessage,
    reportMessage,

    // My Day
    myDayPosts: filteredMyDayPosts,
    myDayLoading,
    myDayError,
    myDayFilter,
    setMyDayFilter,
    createMyDayPost,
    deleteMyDayPost,

    // Support groups
    supportGroups,
    groupsLoading,
    groupsError,

    // Reactions
    addReaction,

    // Comments (real-time)
    comments,
    loadingComments,
    submittingComment,
    loadComments,
    addComment,
    deleteComment,

    // Image upload
    uploading,
    uploadProgress,
    uploadImage,

    // User actions
    blockUser,
    blockedUserIds,
  }
}

export default useCommunity
