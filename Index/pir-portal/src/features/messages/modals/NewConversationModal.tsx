import { useState, useCallback, useMemo, useEffect } from 'react'
import { Search, ArrowLeft, Send, Loader2, MessageCircle, User, Shield } from 'lucide-react'
import { DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'
import { useEligibleUsers, type EligibleUser, type Conversation } from '../hooks/useConversations'
import { useAuth } from '@/contexts/AuthContext'
import { db } from '@/lib/firebase'
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore'

interface NewConversationModalProps {
  recipientId?: string
  onSelectConversation?: (conversation: Conversation) => void
  onClose: () => void
}

type Step = 'select' | 'compose'

export function NewConversationModal({
  recipientId: initialRecipientId,
  onSelectConversation,
  onClose,
}: NewConversationModalProps) {
  const { user, userData } = useAuth()
  const { toast } = useToast()
  const { eligibleUsers, loading: loadingUsers } = useEligibleUsers()

  // State
  const [step, setStep] = useState<Step>(initialRecipientId ? 'compose' : 'select')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedUser, setSelectedUser] = useState<EligibleUser | null>(null)
  const [messageText, setMessageText] = useState('')
  const [sending, setSending] = useState(false)

  // If initialRecipientId provided, pre-select that user
  useEffect(() => {
    if (initialRecipientId && eligibleUsers.length > 0) {
      const preselected = eligibleUsers.find((u) => u.id === initialRecipientId)
      if (preselected) {
        setSelectedUser(preselected)
        setStep('compose')
      }
    }
  }, [initialRecipientId, eligibleUsers])

  // Filter users by search
  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return eligibleUsers
    const q = searchQuery.toLowerCase()
    return eligibleUsers.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.role.toLowerCase().includes(q)
    )
  }, [eligibleUsers, searchQuery])

  // Separate coach from community members
  const { coach, communityMembers } = useMemo(() => {
    const coach = filteredUsers.find((u) => u.isCoach)
    const communityMembers = filteredUsers.filter((u) => !u.isCoach)
    return { coach, communityMembers }
  }, [filteredUsers])

  // Handle user selection
  const handleSelectUser = useCallback((user: EligibleUser) => {
    setSelectedUser(user)
    setStep('compose')
  }, [])

  // Handle back to selection
  const handleBack = useCallback(() => {
    setStep('select')
    setMessageText('')
  }, [])

  // Create or get existing conversation
  const getOrCreateConversation = useCallback(
    async (recipientId: string): Promise<string> => {
      if (!user?.uid) throw new Error('Not authenticated')

      // Check for existing conversation between these users
      const conversationsRef = collection(db, 'conversations')
      const q = query(
        conversationsRef,
        where('participants', 'array-contains', user.uid)
      )
      const snapshot = await getDocs(q)

      // Find conversation with this recipient
      const existing = snapshot.docs.find((doc) => {
        const participants = doc.data().participants as string[]
        return participants.includes(recipientId) && participants.length === 2
      })

      if (existing) {
        return existing.id
      }

      // Get recipient details for participantDetails
      const recipientDetails = selectedUser
        ? {
            name: selectedUser.name,
            avatar: selectedUser.avatar,
            role: selectedUser.role,
          }
        : {
            name: 'Unknown',
            avatar: null,
            role: 'user',
          }

      // Get current user details
      const currentUserDetails = {
        name: userData?.firstName
          ? `${userData.firstName} ${userData.lastName || ''}`.trim()
          : user.email || 'Unknown',
        avatar: userData?.profilePhoto || null,
        role: userData?.role || 'pir',
      }

      // Create new conversation
      const newConversation = await addDoc(conversationsRef, {
        participants: [user.uid, recipientId],
        participantDetails: {
          [user.uid]: currentUserDetails,
          [recipientId]: recipientDetails,
        },
        createdAt: serverTimestamp(),
        lastMessageTimestamp: serverTimestamp(),
        lastMessage: null,
        unreadCount: {
          [user.uid]: 0,
          [recipientId]: 0,
        },
        typing: {},
      })

      return newConversation.id
    },
    [user, userData, selectedUser]
  )

  // Send first message
  const handleSendMessage = useCallback(async () => {
    if (!selectedUser || !messageText.trim() || !user?.uid) return

    setSending(true)
    try {
      // Get or create conversation
      const conversationId = await getOrCreateConversation(selectedUser.id)

      // Add message
      await addDoc(collection(db, 'messages'), {
        conversationId,
        senderId: user.uid,
        recipientId: selectedUser.id,
        text: messageText.trim(),
        type: 'text',
        status: 'sent',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        readAt: null,
      })

      toast({
        title: 'Message sent',
        description: `Your message to ${selectedUser.name} has been sent.`,
      })

      // If callback provided, call it with conversation-like object
      if (onSelectConversation) {
        // Fetch the conversation data to pass back
        const conversationsRef = collection(db, 'conversations')
        const q = query(conversationsRef, where('participants', 'array-contains', user.uid))
        const snapshot = await getDocs(q)
        const convoDoc = snapshot.docs.find((d) => d.id === conversationId)

        if (convoDoc) {
          const data = convoDoc.data()
          onSelectConversation({
            id: convoDoc.id,
            participants: data.participants || [],
            participantDetails: data.participantDetails || {},
            createdAt: data.createdAt?.toDate() || null,
            lastMessageTimestamp: data.lastMessageTimestamp?.toDate() || null,
            lastMessage: data.lastMessage || null,
            unreadCount: data.unreadCount || {},
            typing: data.typing || {},
          })
        }
      }

      onClose()
    } catch (err) {
      console.error('Error sending message:', err)
      toast({
        variant: 'destructive',
        title: 'Failed to send',
        description: 'Could not send your message. Please try again.',
      })
    } finally {
      setSending(false)
    }
  }, [selectedUser, messageText, user, getOrCreateConversation, onSelectConversation, onClose, toast])

  // Render user item
  const renderUserItem = (u: EligibleUser, showCoachBadge = false) => (
    <button
      key={u.id}
      onClick={() => handleSelectUser(u)}
      className={cn(
        'w-full flex items-center gap-3 p-3 rounded-lg transition-colors',
        'hover:bg-muted focus:bg-muted focus:outline-none'
      )}
    >
      <Avatar className="h-11 w-11 flex-shrink-0">
        <AvatarImage src={u.avatar || undefined} />
        <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
          {u.name?.[0]?.toUpperCase() || '?'}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 text-left min-w-0">
        <div className="font-medium text-foreground truncate flex items-center gap-2">
          {u.name}
          {showCoachBadge && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-primary/10 text-primary text-xs font-medium rounded">
              <Shield className="h-3 w-3" />
              Coach
            </span>
          )}
        </div>
        <div className="text-sm text-muted-foreground capitalize truncate">{u.role}</div>
      </div>
    </button>
  )

  return (
    <DialogContent className="max-w-[95vw] sm:max-w-md p-0 gap-0 overflow-hidden">
      {/* Step 1: Select Recipient */}
      {step === 'select' && (
        <>
          <DialogHeader className="p-4 pb-0">
            <DialogTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-primary" />
              New Message
            </DialogTitle>
          </DialogHeader>

          <div className="p-4 pt-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search people..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          <ScrollArea className="max-h-[400px]">
            {loadingUsers ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-12 px-4">
                <User className="h-10 w-10 text-muted-foreground/50 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">
                  {searchQuery ? 'No users found matching your search' : 'No users available to message'}
                </p>
              </div>
            ) : (
              <div className="px-4 pb-4 space-y-4">
                {/* Coach Section */}
                {coach && (
                  <div>
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-1 mb-2">
                      Your Coach
                    </h3>
                    <div className="rounded-lg border bg-card">
                      {renderUserItem(coach, true)}
                    </div>
                  </div>
                )}

                {/* Community Members Section */}
                {communityMembers.length > 0 && (
                  <div>
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-1 mb-2">
                      Community Members
                    </h3>
                    <div className="rounded-lg border bg-card divide-y">
                      {communityMembers.map((u) => renderUserItem(u))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </ScrollArea>
        </>
      )}

      {/* Step 2: Compose Message */}
      {step === 'compose' && selectedUser && (
        <>
          <DialogHeader className="p-4 pb-0">
            <DialogTitle className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleBack}
                className="-ml-2 h-8 w-8"
                disabled={sending}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <span>New Message</span>
            </DialogTitle>
          </DialogHeader>

          <div className="p-4 space-y-4">
            {/* Recipient Display */}
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <Avatar className="h-10 w-10 flex-shrink-0">
                <AvatarImage src={selectedUser.avatar || undefined} />
                <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
                  {selectedUser.name?.[0]?.toUpperCase() || '?'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-foreground truncate flex items-center gap-2">
                  {selectedUser.name}
                  {selectedUser.isCoach && (
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-primary/10 text-primary text-xs font-medium rounded">
                      <Shield className="h-3 w-3" />
                      Coach
                    </span>
                  )}
                </div>
                <div className="text-sm text-muted-foreground capitalize">{selectedUser.role}</div>
              </div>
            </div>

            {/* Message Textarea */}
            <div className="space-y-2">
              <Textarea
                placeholder={`Write your message to ${selectedUser.name}...`}
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                rows={4}
                className="resize-none"
                disabled={sending}
                autoFocus
              />
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  {messageText.length}/1000 characters
                </span>
              </div>
            </div>

            {/* Send Button */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={sending}
                className="flex-1"
              >
                Back
              </Button>
              <Button
                onClick={handleSendMessage}
                disabled={!messageText.trim() || sending}
                className="flex-1"
              >
                {sending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Send Message
                  </>
                )}
              </Button>
            </div>
          </div>
        </>
      )}
    </DialogContent>
  )
}

export default NewConversationModal
