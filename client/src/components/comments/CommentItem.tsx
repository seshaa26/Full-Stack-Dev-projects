import React, { useState } from 'react';
import { Comment } from '../../types';
import { formatDate } from '../../utils/formatDate';
import Avatar from '../ui/Avatar';
import { Edit2, Trash2, MoreHorizontal, Reply } from 'lucide-react';
import Button from '../ui/Button';
import CommentForm from './CommentForm';

interface CommentItemProps {
  comment: Comment;
  currentUserId?: string;
  onDelete: (commentId: string) => void;
  onUpdate: (commentId: string, content: string) => void;
  onReply: (parentCommentId: string, content: string) => Promise<void>;
  depth?: number;
}

const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  currentUserId,
  onDelete,
  onUpdate,
  onReply,
  depth = 0
}) => {
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showReplyForm, setShowReplyForm] = useState(false);

  const isAuthor = currentUserId === comment.author._id || currentUserId === (comment.author as any);
  
  // Limit depth to 1 for this implementation, meaning replies don't have their own replies
  const maxDepth = 1;
  const canReply = depth < maxDepth;

  const handleSaveEdit = () => {
    if (!editContent.trim()) {
      setEditing(false);
      return;
    }
    onUpdate(comment._id, editContent);
    setEditing(false);
  };

  const handleAddReply = async (content: string) => {
    await onReply(comment._id, content);
    setShowReplyForm(false);
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-start gap-2.5 animate-fade-in group relative">
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
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="p-1 text-surface-500 hover:text-surface-200 transition-colors"
                >
                  <MoreHorizontal size={14} />
                </button>
                {menuOpen && (
                  <div className="absolute right-0 mt-1 w-28 py-1 bg-surface-800 rounded-lg shadow-xl border border-surface-700/50 z-10">
                    <button
                      onClick={() => {
                        setEditing(true);
                        setEditContent(comment.content);
                        setMenuOpen(false);
                      }}
                      className="w-full text-left px-3 py-1.5 text-xs text-surface-200 hover:bg-surface-700/50 flex items-center gap-1.5"
                    >
                      <Edit2 size={12} /> Edit
                    </button>
                    <button
                      onClick={() => {
                        onDelete(comment._id);
                        setMenuOpen(false);
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
          
          {editing ? (
            <div className="mt-2">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="textarea-field min-h-[60px] text-sm mb-2"
                autoFocus
              />
              <div className="flex justify-end gap-2">
                <Button variant="secondary" size="sm" onClick={() => setEditing(false)}>
                  Cancel
                </Button>
                <Button variant="primary" size="sm" onClick={handleSaveEdit}>
                  Save
                </Button>
              </div>
            </div>
          ) : (
            <>
              <p className="text-sm text-surface-300 mt-1">{comment.content}</p>
              
              {canReply && (
                <div className="mt-2">
                  <button 
                    onClick={() => setShowReplyForm(!showReplyForm)}
                    className="flex items-center gap-1 text-xs text-surface-400 hover:text-surface-200 transition-colors"
                  >
                    <Reply size={12} /> 
                    {showReplyForm ? 'Cancel Reply' : 'Reply'}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {showReplyForm && (
        <div className="ml-10 mt-1 animate-fade-in">
          <CommentForm onSubmit={handleAddReply} placeholder="Write a reply..." />
        </div>
      )}

      {comment.replies && comment.replies.length > 0 && (
        <div className="ml-5 pl-4 border-l-2 border-surface-700/50 space-y-3 mt-1">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply._id}
              comment={reply}
              currentUserId={currentUserId}
              onDelete={onDelete}
              onUpdate={onUpdate}
              onReply={onReply}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CommentItem;
