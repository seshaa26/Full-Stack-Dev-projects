import React, { useState, useEffect } from 'react';
import { Comment } from '../../types';
import { getComments, createComment } from '../../services/commentService';
import Loader from '../ui/Loader';
import CommentForm from './CommentForm';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import CommentItem from './CommentItem';

interface CommentListProps {
  postId: string;
}

const CommentList: React.FC<CommentListProps> = ({ postId }) => {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const data = await getComments(postId);
        // Backend now returns top-level comments with replies embedded
        setComments(data.comments);
      } catch (error) {
        console.error('Failed to fetch comments:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchComments();
  }, [postId]);

  const handleAddComment = async (content: string) => {
    try {
      const data = await createComment(postId, content);
      // It's a top-level comment, so we can just push it to the list
      setComments((prev) => [...prev, data.comment]);
    } catch (error) {
      console.error('Failed to create comment:', error);
    }
  };

  const handleAddReply = async (parentCommentId: string, content: string) => {
    try {
      const data = await createComment(postId, content, parentCommentId);
      setComments((prev) => 
        prev.map(c => {
          if (c._id === parentCommentId) {
            return {
              ...c,
              replies: [...(c.replies || []), data.comment]
            };
          }
          return c;
        })
      );
    } catch (error) {
      console.error('Failed to reply:', error);
    }
  };

  const handleDelete = async (commentId: string) => {
    if (!window.confirm('Delete this comment?')) return;
    try {
      await api.delete(`/posts/${postId}/comments/${commentId}`);
      
      // Update state: check if it's a top-level comment or a reply
      setComments((prev) => {
        // Try removing it as a top-level comment
        const filtered = prev.filter(c => c._id !== commentId);
        if (filtered.length !== prev.length) return filtered;
        
        // Otherwise, try removing it from replies
        return prev.map(c => ({
          ...c,
          replies: c.replies?.filter(r => r._id !== commentId) || []
        }));
      });
    } catch (error) {
      console.error('Failed to delete comment:', error);
    }
  };

  const handleUpdate = async (commentId: string, content: string) => {
    try {
      const { data } = await api.put(`/posts/${postId}/comments/${commentId}`, { content });
      
      setComments((prev) => {
        return prev.map(c => {
          if (c._id === commentId) {
            return { ...data.comment, replies: c.replies }; // Preserve replies
          }
          if (c.replies) {
            return {
              ...c,
              replies: c.replies.map(r => r._id === commentId ? data.comment : r)
            };
          }
          return c;
        });
      });
    } catch (error) {
      console.error('Failed to update comment:', error);
    }
  };

  if (loading) {
    return <Loader size="sm" className="py-4" />;
  }

  return (
    <div className="space-y-3">
      {/* Existing Comments */}
      {comments.length > 0 ? (
        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
          {comments.map((comment) => (
            <CommentItem
              key={comment._id}
              comment={comment}
              currentUserId={user?._id}
              onDelete={handleDelete}
              onUpdate={handleUpdate}
              onReply={handleAddReply}
            />
          ))}
        </div>
      ) : (
        <p className="text-xs text-surface-500 text-center py-2">
          No comments yet. Be the first!
        </p>
      )}

      {/* Main Comment Form */}
      <CommentForm onSubmit={handleAddComment} placeholder="Add a comment..." />
    </div>
  );
};

export default CommentList;
