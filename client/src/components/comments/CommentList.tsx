import React, { useState, useEffect } from 'react';
import { Comment } from '../../types';
import { getComments, createComment } from '../../services/commentService';
import { formatDate } from '../../utils/formatDate';
import Avatar from '../ui/Avatar';
import Loader from '../ui/Loader';
import CommentForm from './CommentForm';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import { Edit2, Trash2, X, Check, MoreHorizontal } from 'lucide-react';
import Button from '../ui/Button';

interface CommentListProps {
  postId: string;
}

const CommentList: React.FC<CommentListProps> = ({ postId }) => {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);

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

  const handleDelete = async (commentId: string) => {
    if (!window.confirm('Delete this comment?')) return;
    try {
      await api.delete(`/posts/${postId}/comments/${commentId}`);
      setComments((prev) => prev.filter((c) => c._id !== commentId));
    } catch (error) {
      console.error('Failed to delete comment:', error);
    }
  };

  const handleUpdate = async (commentId: string) => {
    if (!editContent.trim()) {
      setEditingId(null);
      return;
    }
    try {
      const { data } = await api.put(`/posts/${postId}/comments/${commentId}`, { content: editContent });
      setComments((prev) => prev.map((c) => (c._id === commentId ? data.comment : c)));
      setEditingId(null);
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
        <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
          {comments.map((comment) => {
            const isAuthor = user?._id === comment.author._id || user?._id === (comment.author as any);
            return (
              <div key={comment._id} className="flex items-start gap-2.5 animate-fade-in group relative">
                <Avatar src={comment.author.avatar} name={comment.author.name} size="sm" />
                <div className="flex-1 min-w-0 bg-surface-800/40 p-2.5 rounded-xl border border-surface-700/30">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-surface-200">
                        {comment.author.name}
                      </span>
                      <span className="text-[10px] text-surface-500">
                        {formatDate(comment.createdAt)}
                      </span>
                    </div>

                    {isAuthor && (
                      <div className="relative">
                        <button
                          onClick={() => setMenuOpenId(menuOpenId === comment._id ? null : comment._id)}
                          className="p-1 text-surface-500 hover:text-surface-200 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <MoreHorizontal size={14} />
                        </button>
                        {menuOpenId === comment._id && (
                          <div className="absolute right-0 mt-1 w-28 py-1 bg-surface-800 rounded-lg shadow-xl border border-surface-700/50 z-10">
                            <button
                              onClick={() => {
                                setEditingId(comment._id);
                                setEditContent(comment.content);
                                setMenuOpenId(null);
                              }}
                              className="w-full text-left px-3 py-1.5 text-xs text-surface-200 hover:bg-surface-700/50 flex items-center gap-1.5"
                            >
                              <Edit2 size={12} /> Edit
                            </button>
                            <button
                              onClick={() => {
                                handleDelete(comment._id);
                                setMenuOpenId(null);
                              }}
                              className="w-full text-left px-3 py-1.5 text-xs text-red-400 hover:bg-red-500/10 flex items-center gap-1.5"
                            >
                              <Trash2 size={12} /> Delete
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  
                  {editingId === comment._id ? (
                    <div className="mt-2">
                      <textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="textarea-field min-h-[60px] text-sm mb-2"
                        autoFocus
                      />
                      <div className="flex justify-end gap-2">
                        <Button variant="secondary" size="sm" onClick={() => setEditingId(null)}>
                          Cancel
                        </Button>
                        <Button variant="primary" size="sm" onClick={() => handleUpdate(comment._id)}>
                          Save
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-surface-300 mt-1">{comment.content}</p>
                  )}
                </div>
              </div>
            );
          })}
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
