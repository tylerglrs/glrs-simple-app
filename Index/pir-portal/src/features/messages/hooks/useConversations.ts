import { useState, useEffect, useMemo, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  serverTimestamp,
  increment,
  writeBatch,
  limit,
} from 'firebase/firestore'
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage'
import { db, storage } from '@/lib/firebase'

// =============================================================================
// TYPES
// =============================================================================

export interface Participant {
  name: string
  avatar: string | null
  role: string
}

export interface LastMessage {
  text: string
  senderId: string
  timestamp: Date | null
  type: 'text' | 'image'
}

export interface Conversation {
  id: string
  participants: string[]
  participantDetails: Record<string, Participant>
  createdAt: Date | null
  lastMessageTimestamp: Date | null
  lastMessage: LastMessage | null
  unreadCount: Record<string, number>
  typing: Record<string, Date | null>
}

export interface Message {
  id: string
  conversationId: string
  senderId: string
  recipientId: string
  text: string | null
  type: 'text' | 'image'
  imageUrl?: string
  status: 'sent' | 'delivered' | 'read'
  createdAt: Date | null
  updatedAt: Date | null
  readAt: Date | null
  _isOptimistic?: boolean
}

export interface EligibleUser {
  id: string
  name: string
  role: string
  avatar: string | null
  isCoach: boolean
  verified: boolean
}

// =============================================================================
// MAIN HOOK
// =============================================================================

export function useConversations() {
  const { user, userData } = useAuth()
  const currentUserId = user?.uid

  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  // Real-time listener for conversations
  useEffect(() => {
    if (!currentUserId) {
      setLoading(false)
      return
    }

    setLoading(true)

    const q = query(
      collection(db, 'conversations'),
      where('participants', 'array-contains', currentUserId),
      orderBy('lastMessageTimestamp', 'desc')
    )

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const convos: Conversation[] = snapshot.docs.map((doc) => {
          const data = doc.data()
          return {
            id: doc.id,
            participants: data.participants || [],
            participantDetails: data.participantDetails || {},
            createdAt: data.createdAt?.toDate() || null,
            lastMessageTimestamp: data.lastMessageTimestamp?.toDate() || null,
            lastMessage: data.lastMessage
              ? {
                  text: data.lastMessage.text,
                  senderId: data.lastMessage.senderId,
                  timestamp: data.lastMessage.timestamp?.toDate() || null,
                  type: data.lastMessage.type || 'text',
                }
              : null,
            unreadCount: data.unreadCount || {},
            typing: data.typing || {},
          }
        })
        setConversations(convos)
        setLoading(false)
        setError(null)
      },
      (err) => {
        console.error('Error loading conversations:', err)
        setError(err as Error)
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [currentUserId])

  // Get other participant from conversation
  const getOtherParticipant = useCallback(
    (conversation: Conversation): Participant => {
      const otherUserId = conversation.participants.find((id) => id !== currentUserId)
      return (
        conversation.participantDetails?.[otherUserId || ''] || {
          name: 'Unknown',
          avatar: null,
          role: 'user',
        }
      )
    },
    [currentUserId]
  )

  // Get unread count for current user
  const getUnreadCount = useCallback(
    (conversation: Conversation): number => {
      return conversation.unreadCount?.[currentUserId || ''] || 0
    },
    [currentUserId]
  )

  // Total unread count across all conversations
  const totalUnreadCount = useMemo(() => {
    return conversations.reduce((total, convo) => {
      return total + (convo.unreadCount?.[currentUserId || ''] || 0)
    }, 0)
  }, [conversations, currentUserId])

  // Create or get existing conversation
  const getOrCreateConversation = useCallback(
    async (recipientId: string, recipientData: Partial<Participant>) => {
      if (!currentUserId || !userData) {
        throw new Error('User not authenticated')
      }

      // Check if conversation already exists
      const q = query(
        collection(db, 'conversations'),
        where('participants', 'array-contains', currentUserId)
      )

      const snapshot = await getDocs(q)
      let existingConversationId: string | null = null

      for (const doc of snapshot.docs) {
        const data = doc.data()
        if (data.participants.includes(recipientId)) {
          existingConversationId = doc.id
          break
        }
      }

      if (existingConversationId) {
        return existingConversationId
      }

      // Create new conversation
      const sortedParticipants = [currentUserId, recipientId].sort()

      const newConvoRef = await addDoc(collection(db, 'conversations'), {
        participants: sortedParticipants,
        participantDetails: {
          [currentUserId]: {
            name: `${userData.firstName || ''} ${userData.lastName || ''}`.trim() || 'You',
            avatar: userData.profilePhoto || null,
            role: userData.role || 'pir',
          },
          [recipientId]: {
            name: recipientData.name || 'User',
            avatar: recipientData.avatar || null,
            role: recipientData.role || 'user',
          },
        },
        createdAt: serverTimestamp(),
        lastMessageTimestamp: serverTimestamp(),
        lastMessage: null,
        unreadCount: {
          [currentUserId]: 0,
          [recipientId]: 0,
        },
        typing: {},
      })

      return newConvoRef.id
    },
    [currentUserId, userData]
  )

  return {
    conversations,
    loading,
    error,
    currentUserId,
    userData,
    getOtherParticipant,
    getUnreadCount,
    totalUnreadCount,
    getOrCreateConversation,
  }
}

// =============================================================================
// MESSAGES HOOK
// =============================================================================

export function useMessages(conversationId: string | null) {
  const { user } = useAuth()
  const currentUserId = user?.uid

  const [messages, setMessages] = useState<Message[]>([])
  const [optimisticMessages, setOptimisticMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  // Real-time listener for messages
  useEffect(() => {
    if (!conversationId) {
      setMessages([])
      setLoading(false)
      return
    }

    setLoading(true)

    const q = query(
      collection(db, 'messages'),
      where('conversationId', '==', conversationId),
      orderBy('createdAt', 'asc')
    )

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const msgs: Message[] = snapshot.docs.map((doc) => {
          const data = doc.data()
          return {
            id: doc.id,
            conversationId: data.conversationId,
            senderId: data.senderId,
            recipientId: data.recipientId,
            text: data.text,
            type: data.type || 'text',
            imageUrl: data.imageUrl,
            status: data.status || 'sent',
            createdAt: data.createdAt?.toDate() || null,
            updatedAt: data.updatedAt?.toDate() || null,
            readAt: data.readAt?.toDate() || null,
          }
        })
        setMessages(msgs)
        setLoading(false)
        setError(null)
      },
      (err) => {
        console.error('Error loading messages:', err)
        setError(err as Error)
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [conversationId])

  // Clear optimistic messages when real messages arrive
  useEffect(() => {
    if (messages.length > 0 && optimisticMessages.length > 0) {
      setOptimisticMessages((prev) =>
        prev.filter((optMsg) => {
          const hasRealVersion = messages.some(
            (realMsg) =>
              realMsg.senderId === optMsg.senderId &&
              ((realMsg.text === optMsg.text && optMsg.type === 'text') ||
                (realMsg.imageUrl === optMsg.imageUrl && optMsg.type === 'image'))
          )
          return !hasRealVersion
        })
      )
    }
  }, [messages, optimisticMessages.length])

  // Combined messages (real + optimistic)
  const allMessages = useMemo(() => {
    const filteredOptimistic = optimisticMessages.filter((optMsg) => {
      return !messages.some(
        (realMsg) =>
          realMsg.senderId === optMsg.senderId &&
          ((realMsg.text === optMsg.text && optMsg.type === 'text') ||
            (realMsg.imageUrl === optMsg.imageUrl && optMsg.type === 'image'))
      )
    })
    return [...messages, ...filteredOptimistic]
  }, [messages, optimisticMessages])

  // Add optimistic message
  const addOptimisticMessage = useCallback((message: Message) => {
    setOptimisticMessages((prev) => [...prev, message])
  }, [])

  // Mark messages as read
  const markAsRead = useCallback(async () => {
    if (!conversationId || !currentUserId || messages.length === 0) return

    const unreadMessages = messages.filter(
      (msg) => msg.senderId !== currentUserId && msg.status !== 'read'
    )

    if (unreadMessages.length === 0) return

    try {
      const batch = writeBatch(db)

      unreadMessages.forEach((msg) => {
        const msgRef = doc(db, 'messages', msg.id)
        batch.update(msgRef, {
          status: 'read',
          readAt: serverTimestamp(),
        })
      })

      const convoRef = doc(db, 'conversations', conversationId)
      batch.update(convoRef, {
        [`unreadCount.${currentUserId}`]: 0,
      })

      await batch.commit()
    } catch (err) {
      console.error('Error marking messages as read:', err)
    }
  }, [conversationId, currentUserId, messages])

  return {
    messages: allMessages,
    loading,
    error,
    addOptimisticMessage,
    markAsRead,
  }
}

// =============================================================================
// SEND MESSAGE HOOK
// =============================================================================

export function useSendMessage(conversation: Conversation | null) {
  const { user } = useAuth()
  const currentUserId = user?.uid

  const [sending, setSending] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  const otherUserId = useMemo(() => {
    if (!conversation || !currentUserId) return null
    return conversation.participants.find((id) => id !== currentUserId) || null
  }, [conversation, currentUserId])

  // Send text message
  const sendTextMessage = useCallback(
    async (text: string, onOptimisticAdd?: (message: Message) => void) => {
      if (!conversation?.id || !currentUserId || !otherUserId || !text.trim()) {
        return false
      }

      const trimmed = text.trim()
      setSending(true)

      // Create optimistic message
      const tempId = `temp_${Date.now()}`
      const optimisticMessage: Message = {
        id: tempId,
        conversationId: conversation.id,
        senderId: currentUserId,
        recipientId: otherUserId,
        text: trimmed,
        type: 'text',
        status: 'sent',
        createdAt: new Date(),
        updatedAt: null,
        readAt: null,
        _isOptimistic: true,
      }

      onOptimisticAdd?.(optimisticMessage)

      try {
        await addDoc(collection(db, 'messages'), {
          conversationId: conversation.id,
          senderId: currentUserId,
          recipientId: otherUserId,
          text: trimmed,
          type: 'text',
          status: 'sent',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          readAt: null,
        })

        await updateDoc(doc(db, 'conversations', conversation.id), {
          lastMessage: {
            text: trimmed.length > 50 ? trimmed.substring(0, 50) + '...' : trimmed,
            senderId: currentUserId,
            timestamp: serverTimestamp(),
            type: 'text',
          },
          lastMessageTimestamp: serverTimestamp(),
          [`unreadCount.${otherUserId}`]: increment(1),
          updatedAt: serverTimestamp(),
        })

        return true
      } catch (err) {
        console.error('Error sending message:', err)
        return false
      } finally {
        setSending(false)
      }
    },
    [conversation, currentUserId, otherUserId]
  )

  // Send image message
  const sendImageMessage = useCallback(
    async (file: File, onOptimisticAdd?: (message: Message) => void) => {
      if (!conversation?.id || !currentUserId || !otherUserId) {
        return false
      }

      // Validate file
      if (!file.type.startsWith('image/')) {
        throw new Error('Please select an image file')
      }

      if (file.size > 5 * 1024 * 1024) {
        throw new Error('Image must be less than 5MB')
      }

      setUploadingImage(true)
      setUploadProgress(0)

      try {
        // Upload to Firebase Storage with progress tracking
        const timestamp = Date.now()
        const filename = `messages/${conversation.id}/${timestamp}_${file.name}`
        const storageRef = ref(storage, filename)

        // Use resumable upload for progress tracking
        const uploadTask = uploadBytesResumable(storageRef, file)

        // Wait for upload with progress updates
        const imageUrl = await new Promise<string>((resolve, reject) => {
          uploadTask.on(
            'state_changed',
            (snapshot) => {
              const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
              setUploadProgress(Math.round(progress))
            },
            (error) => {
              reject(error)
            },
            async () => {
              try {
                const url = await getDownloadURL(uploadTask.snapshot.ref)
                resolve(url)
              } catch (err) {
                reject(err)
              }
            }
          )
        })

        // Create optimistic message
        const tempId = `temp_${timestamp}`
        const optimisticMessage: Message = {
          id: tempId,
          conversationId: conversation.id,
          senderId: currentUserId,
          recipientId: otherUserId,
          text: null,
          type: 'image',
          imageUrl,
          status: 'sent',
          createdAt: new Date(),
          updatedAt: null,
          readAt: null,
          _isOptimistic: true,
        }

        onOptimisticAdd?.(optimisticMessage)

        // Save to Firestore
        await addDoc(collection(db, 'messages'), {
          conversationId: conversation.id,
          senderId: currentUserId,
          recipientId: otherUserId,
          text: null,
          type: 'image',
          imageUrl,
          status: 'sent',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          readAt: null,
        })

        await updateDoc(doc(db, 'conversations', conversation.id), {
          lastMessage: {
            text: 'Sent an image',
            senderId: currentUserId,
            timestamp: serverTimestamp(),
            type: 'image',
          },
          lastMessageTimestamp: serverTimestamp(),
          [`unreadCount.${otherUserId}`]: increment(1),
          updatedAt: serverTimestamp(),
        })

        return true
      } catch (err) {
        console.error('Error sending image:', err)
        throw err
      } finally {
        setUploadingImage(false)
        setUploadProgress(0)
      }
    },
    [conversation, currentUserId, otherUserId]
  )

  return {
    sendTextMessage,
    sendImageMessage,
    sending,
    uploadingImage,
    uploadProgress,
  }
}

// =============================================================================
// TYPING INDICATOR HOOK
// =============================================================================

export function useTypingIndicator(conversation: Conversation | null) {
  const { user } = useAuth()
  const currentUserId = user?.uid

  const [isOtherUserTyping, setIsOtherUserTyping] = useState(false)
  const [lastTypingUpdate, setLastTypingUpdate] = useState(0)

  const otherUserId = useMemo(() => {
    if (!conversation || !currentUserId) return null
    return conversation.participants.find((id) => id !== currentUserId) || null
  }, [conversation, currentUserId])

  // Listen for typing status
  useEffect(() => {
    if (!conversation?.id || !otherUserId) return

    const unsubscribe = onSnapshot(
      doc(db, 'conversations', conversation.id),
      (snapshot) => {
        const data = snapshot.data()
        const otherUserTypingTimestamp = data?.typing?.[otherUserId]

        if (otherUserTypingTimestamp) {
          const typingTime =
            typeof otherUserTypingTimestamp.toMillis === 'function'
              ? otherUserTypingTimestamp.toMillis()
              : otherUserTypingTimestamp
          const now = Date.now()
          const isRecent = now - typingTime < 4000
          setIsOtherUserTyping(isRecent)

          if (isRecent) {
            const hideTimeout = setTimeout(() => {
              setIsOtherUserTyping(false)
            }, 4000 - (now - typingTime))
            return () => clearTimeout(hideTimeout)
          }
        } else {
          setIsOtherUserTyping(false)
        }
      },
      (err) => {
        console.error('Error listening to typing status:', err)
        setIsOtherUserTyping(false)
      }
    )

    return () => unsubscribe()
  }, [conversation?.id, otherUserId])

  // Update typing status
  const updateTypingStatus = useCallback(
    async (isTyping: boolean) => {
      if (!conversation?.id || !currentUserId) return

      try {
        await updateDoc(doc(db, 'conversations', conversation.id), {
          [`typing.${currentUserId}`]: isTyping ? serverTimestamp() : null,
        })
      } catch (err) {
        console.debug('Typing status update failed:', err)
      }
    },
    [conversation?.id, currentUserId]
  )

  // Handle typing with debounce
  const handleTyping = useCallback(() => {
    const now = Date.now()
    if (now - lastTypingUpdate > 1000) {
      updateTypingStatus(true)
      setLastTypingUpdate(now)
    }
  }, [lastTypingUpdate, updateTypingStatus])

  // Stop typing
  const stopTyping = useCallback(() => {
    updateTypingStatus(false)
  }, [updateTypingStatus])

  return {
    isOtherUserTyping,
    handleTyping,
    stopTyping,
  }
}

// =============================================================================
// ELIGIBLE USERS HOOK
// =============================================================================

export function useEligibleUsers() {
  const { user, userData } = useAuth()
  const currentUserId = user?.uid

  const [eligibleUsers, setEligibleUsers] = useState<EligibleUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchEligibleUsers = async () => {
      if (!currentUserId) {
        setLoading(false)
        return
      }

      setLoading(true)
      try {
        const users: EligibleUser[] = []

        // 1. Get the user's assigned coach (always messageable)
        if (userData?.coachId) {
          const coachDoc = await getDoc(doc(db, 'users', userData.coachId))
          if (coachDoc.exists()) {
            const coachData = coachDoc.data()
            users.push({
              id: coachDoc.id,
              name:
                `${coachData.firstName || ''} ${coachData.lastName || ''}`.trim() || 'Your Coach',
              role: coachData.role || 'coach',
              avatar: coachData.photoURL || null,
              isCoach: true,
              verified: true,
            })
          }
        }

        // 2. Get users with public profiles who allow direct messages
        const publicUsersQuery = query(
          collection(db, 'users'),
          where('privacy.profileVisibility', '==', 'everyone'),
          where('privacy.allowDirectMessages', '==', true),
          limit(50)
        )

        const publicUsersSnapshot = await getDocs(publicUsersQuery)

        publicUsersSnapshot.docs.forEach((doc) => {
          // Don't add self or duplicates
          if (doc.id !== currentUserId && !users.find((u) => u.id === doc.id)) {
            const data = doc.data()
            // Only add PIRs (not coaches/admins unless they're the assigned coach)
            if (data.role === 'pir' || data.role === 'user') {
              users.push({
                id: doc.id,
                name: `${data.firstName || ''} ${data.lastName || ''}`.trim() || 'User',
                role: data.role || 'pir',
                avatar: data.photoURL || null,
                isCoach: false,
                verified: false,
              })
            }
          }
        })

        setEligibleUsers(users)
        setError(null)
      } catch (err) {
        console.error('Error fetching eligible users:', err)
        setError(err as Error)
      } finally {
        setLoading(false)
      }
    }

    fetchEligibleUsers()
  }, [currentUserId, userData?.coachId])

  return {
    eligibleUsers,
    loading,
    error,
  }
}

export default useConversations
