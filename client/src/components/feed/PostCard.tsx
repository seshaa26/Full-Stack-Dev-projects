import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, Share2, Bookmark, MoreHorizontal, Edit2, Trash2, X, Check } from 'lucide-react';
import { Post, ReactionType } from '../../types';
import { formatDate } from '../../utils/formatDate';
import Avatar from '../ui/Avatar';
import Badge from '../ui/Badge';
import ReactionBar from './ReactionBar';
import ReactionBar from './ReactionBar';
import CommentList from '../comments/CommentList';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import Button from '../ui/Button';

interface PostCardProps {
  post: Post;
  onReact: (postId: string, type: ReactionType) => void;
}

const PostCard: React.FC<PostCardProps> = ({ post, onReact }) => {
  const { user } = useAuth();
  const [showComments, setShowComments] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(post.content);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const isAuthor = user?._id === post.author._id || user?._id === (post.author as any);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    setIsDeleting(true);
    try {
      await api.delete(`/posts/${post._id}`);
      // The socket event will remove it from the feed automatically
    } catch (error) {
      console.error('Failed to delete post:', error);
      setIsDeleting(false);
    }
  };

  const handleUpdate = async () => {
    if (!editContent.trim() || editContent === post.content) {
      setIsEditing(false);
      return;
    }
    setIsSaving(true);
    try {
      await api.put(`/posts/${post._id}`, { content: editContent });
      setIsEditing(false);
      // The socket event will update the post automatically
    } catch (error) {
      console.error('Failed to update post:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Simple code block rendering: detect ```...``` blocks
  const renderContent = (content: string) => {
    const parts = content.split(/(```[\s\S]*?```)/g);
    return parts.map((part, i) => {
      if (part.startsWith('```') && part.endsWith('```')) {
        const code = part.slice(3, -3).replace(/^\w+\n/, ''); // Remove language tag
        return (
          <pre
            key={i}
            className="my-3 p-4 rounded-xl bg-surface-900/80 border border-surface-700/50 
                     overflow-x-auto font-mono text-sm text-emerald-400"
          >
            <code>{code}</code>
          </pre>
        );
      }
      return (
        <span key={i} className="whitespace-pre-wrap">
          {part}
        </span>
      );
    });
  };

  return (
    <article className="glass-card-hover p-5 animate-fade-in" id={`post-${post._id}`}>
      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        <Avatar src={post.author.avatar} name={post.author.name} size="md" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-surface-100 text-sm">
              {post.author.name}
            </span>
            {post.type === 'announcement' && (
              <Badge variant="announcement">📢 Announcement</Badge>
            )}
            <span className="text-xs text-surface-500">
              {formatDate(post.createdAt)}
            </span>
          </div>
          {post.author.email && (
            <p className="text-xs text-surface-500 truncate">{post.author.email}</p>
          )}
        </div>

        {/* Action Menu */}
        {isAuthor && (
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1.5 rounded-lg text-surface-400 hover:bg-surface-700/50 hover:text-surface-200 transition-colors"
              disabled={isDeleting}
            >
              <MoreHorizontal size={18} />
            </button>
            
            {showMenu && (
              <div className="absolute right-0 mt-1 w-36 py-1 bg-surface-800 rounded-xl shadow-xl border border-surface-700/50 z-10 animate-fade-in">
                <button
                  onClick={() => {
                    setIsEditing(true);
                    setShowMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-surface-200 hover:bg-surface-700/50 hover:text-primary-400 flex items-center gap-2"
                >
                  <Edit2 size={14} /> Edit
                </button>
                <button
                  onClick={() => {
                    handleDelete();
                    setShowMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 flex items-center gap-2"
                >
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      {isEditing ? (
        <div className="mb-4">
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className="textarea-field min-h-[100px] mb-2"
            autoFocus
          />
          <div className="flex justify-end gap-2">
            <Button variant="secondary" size="sm" onClick={() => setIsEditing(false)}>
              <X size={14} className="mr-1" /> Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleUpdate} loading={isSaving}>
              <Check size={14} className="mr-1" /> Save
            </Button>
          </div>
        </div>
      ) : (
        <div className="text-surface-200 text-sm leading-relaxed mb-3">
          {renderContent(post.content)}
        </div>
      )}

      {/* Media */}
      {post.mediaUrl && (
        <div className="mb-3 rounded-xl overflow-hidden border border-surface-700/30">
          <img
            src={post.mediaUrl}
            alt="Post attachment"
            className="w-full max-h-96 object-cover"
            loading="lazy"
          />
        </div>
      )}

      {/* Tags */}
      {post.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {post.tags.map((tag) => (
            <span key={tag} className="tag-chip text-[11px]">
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Divider */}
      <div className="border-t border-surface-700/30 my-3" />

      {/* Action Bar */}
      <div className="flex items-center justify-between">
        <ReactionBar post={post} onReact={onReact} />

        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowComments(!showComments)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm text-surface-400 
                     hover:bg-surface-700/50 hover:text-surface-200 transition-colors"
            id={`comments-toggle-${post._id}`}
          >
            <MessageCircle size={16} />
            <span className="text-xs">{post.commentsCount}</span>
          </button>
          <button
            className="p-2 rounded-xl text-surface-400 hover:bg-surface-700/50 
                     hover:text-surface-200 transition-colors"
          >
            <Bookmark size={16} />
          </button>
          <button
            className="p-2 rounded-xl text-surface-400 hover:bg-surface-700/50 
                     hover:text-surface-200 transition-colors"
          >
            <Share2 size={16} />
          </button>
        </div>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="mt-4 pt-4 border-t border-surface-700/30 animate-slide-up">
          <CommentList postId={post._id} />
        </div>
      )}
    </article>
  );
};

export default PostCard;
