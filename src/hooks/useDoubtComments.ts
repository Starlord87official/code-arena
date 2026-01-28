import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface DoubtComment {
  id: string;
  doubt_id: string;
  user_id: string;
  content: string;
  created_at: string;
  username: string;
  avatar_url: string | null;
}

interface GetCommentsResponse {
  success: boolean;
  comments?: DoubtComment[];
  error?: string;
}

interface AddCommentResponse {
  success: boolean;
  comment?: DoubtComment;
  error?: string;
}

interface DeleteCommentResponse {
  success: boolean;
  error?: string;
}

export function useDoubtComments(doubtId: string) {
  const [comments, setComments] = useState<DoubtComment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchComments = useCallback(async () => {
    if (!doubtId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error: rpcError } = await supabase.rpc('get_doubt_comments', {
        p_doubt_id: doubtId
      });

      if (rpcError) throw rpcError;

      const response = data as unknown as GetCommentsResponse;
      
      if (response?.success) {
        setComments(response.comments || []);
      } else {
        setError(response?.error || 'Failed to fetch comments');
      }
    } catch (err) {
      console.error('Error fetching comments:', err);
      setError('Failed to load comments');
    } finally {
      setIsLoading(false);
    }
  }, [doubtId]);

  const addComment = useCallback(async (content: string) => {
    if (!doubtId || !content.trim()) return { success: false, error: 'Content required' };
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      const { data, error: rpcError } = await supabase.rpc('add_doubt_comment', {
        p_doubt_id: doubtId,
        p_content: content.trim()
      });

      if (rpcError) throw rpcError;

      const response = data as unknown as AddCommentResponse;

      if (response?.success && response.comment) {
        // Optimistically add to comments list
        setComments(prev => [...prev, response.comment!]);
        return { success: true };
      } else {
        setError(response?.error || 'Failed to add comment');
        return { success: false, error: response?.error };
      }
    } catch (err) {
      console.error('Error adding comment:', err);
      setError('Failed to add comment');
      return { success: false, error: 'Failed to add comment' };
    } finally {
      setIsSubmitting(false);
    }
  }, [doubtId]);

  const deleteComment = useCallback(async (commentId: string) => {
    try {
      const { data, error: rpcError } = await supabase.rpc('delete_doubt_comment', {
        p_comment_id: commentId
      });

      if (rpcError) throw rpcError;

      const response = data as unknown as DeleteCommentResponse;

      if (response?.success) {
        setComments(prev => prev.filter(c => c.id !== commentId));
        return { success: true };
      } else {
        return { success: false, error: response?.error };
      }
    } catch (err) {
      console.error('Error deleting comment:', err);
      return { success: false, error: 'Failed to delete comment' };
    }
  }, []);

  return {
    comments,
    isLoading,
    isSubmitting,
    error,
    fetchComments,
    addComment,
    deleteComment,
    commentCount: comments.length
  };
}
