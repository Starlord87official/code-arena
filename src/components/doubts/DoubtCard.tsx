import { useState, useEffect, useRef } from 'react';
import { format, parseISO, formatDistanceToNow } from 'date-fns';
import { Check, ChevronDown, ChevronUp, Code, Calendar, Tag, Loader2, MessageCircle, Send, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Doubt, useMarkDoubtSolved, DoubtCategory, DoubtDifficulty } from '@/hooks/useDoubts';
import { useDoubtComments, DoubtComment } from '@/hooks/useDoubtComments';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';

const categoryColors: Record<DoubtCategory, string> = {
  study: 'bg-primary/20 text-primary border-primary/50',
  job: 'bg-status-success/20 text-status-success border-status-success/50',
  internship: 'bg-status-warning/20 text-status-warning border-status-warning/50',
  referral: 'bg-accent/20 text-accent border-accent/50',
};

const difficultyColors: Record<DoubtDifficulty, string> = {
  beginner: 'bg-status-success/20 text-status-success border-status-success/50',
  intermediate: 'bg-status-warning/20 text-status-warning border-status-warning/50',
  advanced: 'bg-destructive/20 text-destructive border-destructive/50',
};

interface DoubtCardProps {
  doubt: Doubt;
}

export function DoubtCard({ doubt }: DoubtCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const commentsEndRef = useRef<HTMLDivElement>(null);
  
  const { mutate: markSolved, isPending } = useMarkDoubtSolved();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const {
    comments,
    isLoading: commentsLoading,
    isSubmitting,
    fetchComments,
    addComment,
    deleteComment,
    commentCount
  } = useDoubtComments(doubt.id);

  // Fetch comments when expanded
  useEffect(() => {
    if (expanded) {
      fetchComments();
    }
  }, [expanded, fetchComments]);

  // Scroll to bottom when new comment added
  useEffect(() => {
    if (commentsEndRef.current && comments.length > 0) {
      commentsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [comments.length]);

  const handleMarkSolved = () => {
    markSolved(doubt.id, {
      onSuccess: () => {
        toast({
          title: 'Doubt cleared!',
          description: 'Your doubt has been marked as solved',
        });
      },
      onError: (error) => {
        toast({
          title: 'Failed to mark as solved',
          description: error.message,
          variant: 'destructive',
        });
      },
    });
  };

  const handleSubmitReply = async () => {
    if (!replyContent.trim()) return;
    
    const result = await addComment(replyContent);
    if (result.success) {
      setReplyContent('');
      toast({
        title: 'Reply posted!',
        description: 'Your reply has been added.',
      });
    } else {
      toast({
        title: 'Failed to post reply',
        description: result.error || 'Something went wrong',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    const result = await deleteComment(commentId);
    if (result.success) {
      toast({
        title: 'Comment deleted',
      });
    } else {
      toast({
        title: 'Failed to delete comment',
        description: result.error,
        variant: 'destructive',
      });
    }
  };

  return (
    <div className={`arena-card rounded-xl overflow-hidden ${doubt.is_own ? 'border-primary/30' : ''}`}>
      {/* Header */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            {/* Tags Row */}
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <Badge className={`${categoryColors[doubt.category]} border text-xs capitalize`}>
                {doubt.category}
              </Badge>
              <Badge className={`${difficultyColors[doubt.difficulty]} border text-xs capitalize`}>
                {doubt.difficulty}
              </Badge>
              <Badge variant="outline" className="text-xs">
                <Tag className="h-3 w-3 mr-1" />
                {doubt.topic_name}
              </Badge>
              {doubt.is_own && (
                <Badge className="bg-primary/20 text-primary border-primary/50 text-xs">
                  Your Doubt
                </Badge>
              )}
              {doubt.is_solved && (
                <Badge className="bg-status-success/20 text-status-success border-status-success/50 text-xs">
                  <Check className="h-3 w-3 mr-1" />
                  Solved
                </Badge>
              )}
            </div>

            {/* Title */}
            <h3 className="font-semibold text-foreground text-lg mb-1">{doubt.title}</h3>

            {/* Meta */}
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {format(parseISO(doubt.created_at), 'MMM d, yyyy')}
              </span>
              {doubt.is_solved && doubt.solved_at && (
                <span className="flex items-center gap-1 text-status-success">
                  <Check className="h-3 w-3" />
                  Solved {format(parseISO(doubt.solved_at), 'MMM d, yyyy')}
                </span>
              )}
              {/* Comment count indicator */}
              {!expanded && commentCount > 0 && (
                <span className="flex items-center gap-1 text-primary">
                  <MessageCircle className="h-3 w-3" />
                  {commentCount} {commentCount === 1 ? 'reply' : 'replies'}
                </span>
              )}
            </div>
          </div>

          {/* Expand Button */}
          <Button
            variant="ghost"
            size="sm"
            className="flex-shrink-0"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Content Preview */}
        {!expanded && (
          <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
            {doubt.content}
          </p>
        )}
      </div>

      {/* Expanded Content */}
      {expanded && (
        <div className="px-4 pb-4 space-y-4">
          {/* Full Content */}
          <div className="prose prose-sm prose-invert max-w-none">
            <p className="text-foreground whitespace-pre-wrap">{doubt.content}</p>
          </div>

          {/* Code Block */}
          {doubt.code_block && (
            <div className="bg-background rounded-lg border border-border overflow-hidden">
              <div className="px-3 py-2 bg-secondary/50 border-b border-border flex items-center gap-2">
                <Code className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Code</span>
              </div>
              <pre className="p-4 overflow-x-auto">
                <code className="text-sm font-mono text-foreground">{doubt.code_block}</code>
              </pre>
            </div>
          )}

          {/* Mark as Solved Button (only for owner of unsolved doubts) */}
          {doubt.is_own && !doubt.is_solved && (
            <div className="pt-4 border-t border-border">
              <Button
                className="gap-2 bg-status-success hover:bg-status-success/80"
                onClick={handleMarkSolved}
                disabled={isPending}
              >
                {isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Check className="h-4 w-4" />
                )}
                Yes, my doubt is cleared
              </Button>
            </div>
          )}

          {/* Comments Section Divider */}
          <div className="border-t border-border/50 pt-4">
            <div className="flex items-center gap-2 mb-4">
              <MessageCircle className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">
                Replies ({comments.length})
              </span>
            </div>

            {/* Comments List */}
            {commentsLoading ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : comments.length === 0 ? (
              <div className="text-center py-6">
                <MessageCircle className="h-8 w-8 text-muted-foreground/50 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  No replies yet. Be the first to help!
                </p>
              </div>
            ) : (
              <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                {comments.map((comment) => (
                  <CommentItem
                    key={comment.id}
                    comment={comment}
                    isAuthor={comment.user_id === doubt.user_id}
                    canDelete={comment.user_id === user?.id || doubt.user_id === user?.id}
                    onDelete={() => handleDeleteComment(comment.id)}
                  />
                ))}
                <div ref={commentsEndRef} />
              </div>
            )}

            {/* Reply Input */}
            {user && (
              <div className="mt-4 space-y-3">
                <Textarea
                  placeholder="Write a reply…"
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  className="min-h-[80px] bg-background/50 border-border/50 resize-none"
                  disabled={isSubmitting}
                />
                <div className="flex justify-end">
                  <Button
                    onClick={handleSubmitReply}
                    disabled={isSubmitting || !replyContent.trim()}
                    className="gap-2"
                  >
                    {isSubmitting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                    Post Reply
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Individual Comment Component
interface CommentItemProps {
  comment: DoubtComment;
  isAuthor: boolean;
  canDelete: boolean;
  onDelete: () => void;
}

function CommentItem({ comment, isAuthor, canDelete, onDelete }: CommentItemProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    await onDelete();
    setIsDeleting(false);
  };

  return (
    <div className="group flex gap-3 p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors">
      {/* Avatar */}
      <Link to={`/profile/${comment.username}`} className="flex-shrink-0">
        <Avatar className="h-8 w-8">
          <AvatarImage src={comment.avatar_url || undefined} alt={comment.username} />
          <AvatarFallback className="text-xs bg-primary/20 text-primary">
            {comment.username?.slice(0, 2).toUpperCase() || '??'}
          </AvatarFallback>
        </Avatar>
      </Link>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <Link 
            to={`/profile/${comment.username}`}
            className="text-sm font-medium text-foreground hover:text-primary transition-colors"
          >
            {comment.username}
          </Link>
          {isAuthor && (
            <Badge className="bg-primary/20 text-primary border-primary/50 text-[10px] px-1.5 py-0">
              Author
            </Badge>
          )}
          <span className="text-xs text-muted-foreground">
            {formatDistanceToNow(parseISO(comment.created_at), { addSuffix: true })}
          </span>
        </div>
        <p className="text-sm text-foreground/90 whitespace-pre-wrap break-words">
          {comment.content}
        </p>
      </div>

      {/* Delete Button */}
      {canDelete && (
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
          onClick={handleDelete}
          disabled={isDeleting}
        >
          {isDeleting ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <Trash2 className="h-3 w-3" />
          )}
        </Button>
      )}
    </div>
  );
}
