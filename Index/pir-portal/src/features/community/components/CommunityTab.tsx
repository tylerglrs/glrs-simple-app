import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { MessageCircle, Sun, Users } from 'lucide-react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { useModalStore } from '@/stores/modalStore'
import { useAuth } from '@/contexts/AuthContext'
import { useCommunity } from '../hooks/useCommunity'
import { CommunityChat } from './CommunityChat'
import { MyDayFeed } from './MyDayFeed'
import { SupportGroups } from './SupportGroups'
import type { CommunitySubTab } from '../types'

// ============================================================
// TAB CONFIGURATION
// ============================================================

const TABS: { id: CommunitySubTab; label: string; shortLabel: string; icon: typeof MessageCircle }[] = [
  { id: 'main', label: 'Community', shortLabel: 'Chat', icon: MessageCircle },
  { id: 'myday', label: 'My Day', shortLabel: 'My Day', icon: Sun },
  { id: 'groups', label: 'Support Groups', shortLabel: 'Groups', icon: Users },
]

// ============================================================
// MAIN COMPONENT
// ============================================================

interface CommunityTabProps {
  className?: string
}

export function CommunityTab({ className }: CommunityTabProps) {
  const navigate = useNavigate()
  const isMobile = useMediaQuery('(max-width: 768px)')
  const { openModal } = useModalStore()
  const { userData } = useAuth()

  // Community data and actions
  const {
    // Tab state
    activeTab,
    setActiveTab,

    // User info
    currentUserId,
    currentUserDisplayName,
    isCoachOrAdmin,

    // Community messages
    communityMessages,
    messagesLoading,
    messagesError,
    sendCommunityMessage,
    deleteMessage,
    reportMessage,

    // My Day
    myDayPosts,
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

    // Comments
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
  } = useCommunity()

  // ============================================================
  // HANDLERS
  // ============================================================

  // Handle avatar click - navigate to profile
  const handleAvatarClick = useCallback(
    (userId: string, isAnonymous: boolean) => {
      if (isAnonymous) return
      navigate(`/profile/${userId}`)
    },
    [navigate]
  )

  // Handle image click - open lightbox
  const handleImageClick = useCallback(
    (imageUrl: string) => {
      openModal('imageLightbox', { imageUrl })
    },
    [openModal]
  )

  // Handle navigation to privacy settings
  const handleNavigateToPrivacy = useCallback(() => {
    navigate('/profile')
    // TODO: Open privacy settings modal after navigation
  }, [navigate])

  // Reaction handlers with isMyDayPost flag
  const handleMessageReaction = useCallback(
    async (messageId: string, reactionType: 'heart' | 'support' | 'celebrate') => {
      await addReaction(messageId, reactionType, false)
    },
    [addReaction]
  )

  const handleMyDayReaction = useCallback(
    async (postId: string, reactionType: 'heart' | 'support' | 'celebrate') => {
      await addReaction(postId, reactionType, true)
    },
    [addReaction]
  )

  // Comment handlers with isMyDayPost flag
  const handleLoadMessageComments = useCallback(
    async (messageId: string) => {
      await loadComments(messageId, false)
    },
    [loadComments]
  )

  const handleLoadMyDayComments = useCallback(
    async (postId: string) => {
      await loadComments(postId, true)
    },
    [loadComments]
  )

  const handleAddMessageComment = useCallback(
    async (messageId: string, content: string) => {
      return addComment(messageId, content, false)
    },
    [addComment]
  )

  const handleAddMyDayComment = useCallback(
    async (postId: string, content: string) => {
      return addComment(postId, content, true)
    },
    [addComment]
  )

  const handleDeleteMessageComment = useCallback(
    async (messageId: string, commentId: string) => {
      return deleteComment(messageId, commentId, false)
    },
    [deleteComment]
  )

  const handleDeleteMyDayComment = useCallback(
    async (postId: string, commentId: string) => {
      return deleteComment(postId, commentId, true)
    },
    [deleteComment]
  )

  // Report My Day post (uses same collection logic)
  const handleReportMyDayPost = useCallback(
    async (postId: string): Promise<boolean> => {
      // Use same report logic, just mark as dailyPost type
      return reportMessage(postId)
    },
    [reportMessage]
  )

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Tab Navigation */}
      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as CommunitySubTab)}
        className="flex flex-col h-full"
      >
        <div className="sticky top-0 z-10 bg-background border-b">
          <TabsList className="w-full h-auto p-1 grid grid-cols-3 bg-muted/50">
            {TABS.map((tab) => {
              const Icon = tab.icon
              return (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className={cn(
                    'flex flex-col items-center gap-1 py-2 px-1',
                    'text-xs md:text-sm',
                    'data-[state=active]:bg-background data-[state=active]:shadow-sm'
                  )}
                >
                  <Icon className="h-4 w-4 md:h-5 md:w-5" />
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="sm:hidden">{tab.shortLabel}</span>
                </TabsTrigger>
              )
            })}
          </TabsList>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto">
          <div className={cn('p-4', isMobile ? 'pb-24' : 'pb-8')}>
            {/* Community Chat Tab */}
            <TabsContent value="main" className="mt-0">
              <CommunityChat
                messages={communityMessages}
                loading={messagesLoading}
                error={messagesError}
                currentUserId={currentUserId || ''}
                currentUserName={currentUserDisplayName}
                currentUserImage={userData?.profilePhoto}
                isCoachOrAdmin={isCoachOrAdmin}
                privacySettings={undefined}
                comments={comments}
                loadingComments={loadingComments}
                submittingComment={submittingComment}
                uploading={uploading}
                uploadProgress={uploadProgress}
                onSendMessage={sendCommunityMessage}
                onUploadImage={uploadImage}
                onDeleteMessage={deleteMessage}
                onReportMessage={reportMessage}
                onBlockUser={blockUser}
                onReaction={handleMessageReaction}
                onLoadComments={handleLoadMessageComments}
                onAddComment={handleAddMessageComment}
                onDeleteComment={handleDeleteMessageComment}
                onAvatarClick={handleAvatarClick}
                onImageClick={handleImageClick}
                onNavigateToPrivacy={handleNavigateToPrivacy}
              />
            </TabsContent>

            {/* My Day Tab */}
            <TabsContent value="myday" className="mt-0">
              <MyDayFeed
                posts={myDayPosts}
                loading={myDayLoading}
                error={myDayError}
                currentUserId={currentUserId || ''}
                isCoachOrAdmin={isCoachOrAdmin}
                filter={myDayFilter}
                onSetFilter={setMyDayFilter}
                comments={comments}
                loadingComments={loadingComments}
                submittingComment={submittingComment}
                onCreatePost={createMyDayPost}
                onDeletePost={deleteMyDayPost}
                onReportPost={handleReportMyDayPost}
                onBlockUser={blockUser}
                onReaction={handleMyDayReaction}
                onLoadComments={handleLoadMyDayComments}
                onAddComment={handleAddMyDayComment}
                onDeleteComment={handleDeleteMyDayComment}
                onAvatarClick={handleAvatarClick}
              />
            </TabsContent>

            {/* Support Groups Tab */}
            <TabsContent value="groups" className="mt-0">
              <SupportGroups
                groups={supportGroups}
                loading={groupsLoading}
                error={groupsError}
              />
            </TabsContent>
          </div>
        </div>
      </Tabs>
    </div>
  )
}

export default CommunityTab
