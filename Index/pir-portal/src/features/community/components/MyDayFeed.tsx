import { useState } from 'react'
import {
  Sun,
  Trophy,
  Filter,
  Plus,
  Loader2,
  Sparkles,
  User,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { CommunityMessage } from './CommunityMessage'
import type { MyDayPost, MyDayPostType, MyDayFilter, Comment } from '../types'

// ============================================================
// TYPES
// ============================================================

interface MyDayFeedProps {
  posts: MyDayPost[]
  loading: boolean
  error: string | null
  currentUserId: string
  isCoachOrAdmin: boolean
  filter: MyDayFilter
  onSetFilter: (filter: MyDayFilter) => void
  comments: Record<string, Comment[]>
  loadingComments: Record<string, boolean>
  submittingComment: boolean
  onCreatePost: (type: MyDayPostType, content: string, isAnonymous: boolean) => Promise<boolean>
  onDeletePost: (postId: string) => Promise<boolean>
  onReportPost: (postId: string) => Promise<boolean>
  onBlockUser: (userId: string) => Promise<boolean>
  onReaction: (postId: string, reactionType: 'heart' | 'support' | 'celebrate') => Promise<void>
  onLoadComments: (postId: string) => Promise<void>
  onAddComment: (postId: string, content: string) => Promise<boolean>
  onDeleteComment: (postId: string, commentId: string) => Promise<boolean>
  onAvatarClick: (userId: string, isAnonymous: boolean) => void
}

// ============================================================
// LOADING STATE
// ============================================================

function LoadingState() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <Card key={i}>
          <CardContent className="p-4">
            <div className="flex items-start gap-3 mb-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-5 w-16 rounded-full" />
                </div>
                <Skeleton className="h-3 w-20 mt-1" />
              </div>
            </div>
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-3/4" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

// ============================================================
// EMPTY STATE
// ============================================================

function EmptyState({ filter }: { filter: MyDayFilter }) {
  const getMessage = () => {
    switch (filter) {
      case 'reflections':
        return 'No reflections shared yet today.'
      case 'wins':
        return 'No wins shared yet today.'
      case 'myPosts':
        return "You haven't shared anything today."
      default:
        return 'No posts shared today yet.'
    }
  }

  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-12 text-center">
        <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
          <Sparkles className="h-6 w-6 text-muted-foreground" />
        </div>
        <h3 className="text-base font-semibold text-foreground mb-2">
          {getMessage()}
        </h3>
        <p className="text-sm text-muted-foreground max-w-[250px]">
          Share a reflection or celebrate a win with your community!
        </p>
      </CardContent>
    </Card>
  )
}

// ============================================================
// CREATE POST MODAL
// ============================================================

interface CreatePostModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (type: MyDayPostType, content: string, isAnonymous: boolean) => Promise<boolean>
}

function CreatePostModal({ open, onOpenChange, onSubmit }: CreatePostModalProps) {
  const { toast } = useToast()
  const [postType, setPostType] = useState<MyDayPostType>('reflection')
  const [content, setContent] = useState('')
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!content.trim()) return

    setSubmitting(true)
    try {
      const success = await onSubmit(postType, content.trim(), isAnonymous)
      if (success) {
        toast({
          title: 'Posted!',
          description: `Your ${postType} has been shared.`,
        })
        setContent('')
        setIsAnonymous(false)
        onOpenChange(false)
      } else {
        toast({
          variant: 'destructive',
          title: 'Failed to post',
          description: 'Please try again.',
        })
      }
    } catch {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Something went wrong.',
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleClose = () => {
    if (!submitting) {
      setContent('')
      setIsAnonymous(false)
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {postType === 'reflection' ? (
              <>
                <Sun className="h-5 w-5 text-blue-500" />
                Share a Reflection
              </>
            ) : (
              <>
                <Trophy className="h-5 w-5 text-amber-500" />
                Celebrate a Win
              </>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Post Type Selector */}
          <div className="flex gap-2">
            <Button
              type="button"
              variant={postType === 'reflection' ? 'default' : 'outline'}
              onClick={() => setPostType('reflection')}
              className="flex-1"
            >
              <Sun className="h-4 w-4 mr-2" />
              Reflection
            </Button>
            <Button
              type="button"
              variant={postType === 'win' ? 'default' : 'outline'}
              onClick={() => setPostType('win')}
              className="flex-1"
            >
              <Trophy className="h-4 w-4 mr-2" />
              Win
            </Button>
          </div>

          {/* Content */}
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={
              postType === 'reflection'
                ? "What's on your mind today? Share your thoughts, feelings, or insights..."
                : "What's something you're proud of today? Big or small, every win counts!"
            }
            className="min-h-[120px] resize-none"
            maxLength={500}
          />
          <p className="text-xs text-right text-muted-foreground">
            {content.length}/500
          </p>

          {/* Anonymous Toggle */}
          <div className="flex items-center gap-3 p-3 rounded-lg border bg-muted/30">
            <Checkbox
              id="anonymous"
              checked={isAnonymous}
              onCheckedChange={(checked) => setIsAnonymous(checked === true)}
            />
            <div className="flex-1">
              <Label htmlFor="anonymous" className="font-medium cursor-pointer">
                Post anonymously
              </Label>
              <p className="text-xs text-muted-foreground">
                Your name won't be shown with this post
              </p>
            </div>
            <User className="h-4 w-4 text-muted-foreground" />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={handleClose} disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!content.trim() || submitting}>
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Posting...
              </>
            ) : (
              'Share'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ============================================================
// MAIN COMPONENT
// ============================================================

export function MyDayFeed({
  posts,
  loading,
  error,
  currentUserId,
  isCoachOrAdmin,
  filter,
  onSetFilter,
  comments,
  loadingComments,
  submittingComment,
  onCreatePost,
  onDeletePost,
  onReportPost,
  onBlockUser,
  onReaction,
  onLoadComments,
  onAddComment,
  onDeleteComment,
  onAvatarClick,
}: MyDayFeedProps) {
  const [showCreateModal, setShowCreateModal] = useState(false)

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              My Day
            </CardTitle>
            <Button size="sm" onClick={() => setShowCreateModal(true)}>
              <Plus className="h-4 w-4 mr-1" />
              Share
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-sm text-muted-foreground mb-4">
            Share your daily reflections and celebrate wins with your community.
            Posts from the last 24 hours are shown.
          </p>

          {/* Filter */}
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select
              value={filter}
              onValueChange={(value) => onSetFilter(value as MyDayFilter)}
            >
              <SelectTrigger className="w-[180px] h-9">
                <SelectValue placeholder="Filter posts" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Posts</SelectItem>
                <SelectItem value="reflections">Reflections Only</SelectItem>
                <SelectItem value="wins">Wins Only</SelectItem>
                <SelectItem value="myPosts">My Posts</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Posts Feed */}
      {loading ? (
        <LoadingState />
      ) : error ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-destructive mb-2">{error}</p>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </CardContent>
        </Card>
      ) : posts.length === 0 ? (
        <EmptyState filter={filter} />
      ) : (
        <div>
          {posts.map((post) => (
            <CommunityMessage
              key={post.id}
              message={post}
              currentUserId={currentUserId}
              isMyDayPost={true}
              comments={comments[post.id] || []}
              loadingComments={loadingComments[post.id]}
              submittingComment={submittingComment}
              onReaction={(type) => onReaction(post.id, type)}
              onLoadComments={() => onLoadComments(post.id)}
              onAddComment={(content) => onAddComment(post.id, content)}
              onDeleteComment={(commentId) => onDeleteComment(post.id, commentId)}
              onDelete={() => onDeletePost(post.id)}
              onReport={() => onReportPost(post.id)}
              onBlock={() => onBlockUser(post.userId)}
              onAvatarClick={onAvatarClick}
              onImageClick={() => {}}
              isCoachOrAdmin={isCoachOrAdmin}
            />
          ))}
        </div>
      )}

      {/* Create Post Modal */}
      <CreatePostModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        onSubmit={onCreatePost}
      />
    </div>
  )
}

export default MyDayFeed
