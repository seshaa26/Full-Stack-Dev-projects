import React, { useState, useEffect } from 'react';
import { Comment } from '../../types';
import { getComments, createComment } from '../../services/commentService';
import { formatDate } from '../../utils/formatDate';
import Avatar from '../ui/Avatar';
import Loader from '../ui/Loader';
import CommentForm from './CommentForm';

interface CommentListProps {
  postId: string;
}

const CommentList: React.FC<CommentListProps> = ({ postId }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const data = await getComments(postId);
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
    const data = await createComment(postId, content);
    setComments((prev) => [...prev, data.comment]);
  };

  if (loading) {
    return <Loader size="sm" className="py-4" />;
  }

  return (
    <div className="space-y-3">
      {/* Existing Comments */}
      {comments.length > 0 ? (
        <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
          {comments.map((comment) => (
            <div key={comment._id} className="flex items-start gap-2.5 animate-fade-in">
              <Avatar src={comment.author.avatar} name={comment.author.name} size="sm" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-surface-200">
                    {comment.author.name}
                  </span>
                  <span className="text-[10px] text-surface-500">
                    {formatDate(comment.createdAt)}
                  </span>
                </div>
                <p className="text-sm text-surface-300 mt-0.5">{comment.content}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-surface-500 text-center py-2">
          No comments yet. Be the first!
        </p>
      )}

      {/* Comment Form */}
      <CommentForm onSubmit={handleAddComment} />
    </div>
  );
};

export default CommentList;
