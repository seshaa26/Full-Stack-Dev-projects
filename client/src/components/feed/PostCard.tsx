import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, Share2, Bookmark, MoreHorizontal, Edit2, Trash2, X, Check, Image as ImageIcon } from 'lucide-react';
import { Post, ReactionType } from '../../types';
import { formatDate } from '../../utils/formatDate';
import Avatar from '../ui/Avatar';
import Badge from '../ui/Badge';
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
  const [editMediaUrl, setEditMediaUrl] = useState(post.mediaUrl || '');
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const [isBookmarked, setIsBookmarked] = useState(() => {
    return post.bookmarks?.includes(user?._id || '') || false;
  });

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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert('Image size exceeds 10MB limit.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setEditMediaUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUpdate = async () => {
    if (!editContent.trim()) {
      setIsEditing(false);
      return;
    }
    setIsSaving(true);
    try {
      await api.put(`/posts/${post._id}`, { 
        content: editContent,
        mediaUrl: editMediaUrl 
      });
      setIsEditing(false);
      // The socket event will update the post automatically
    } catch (error) {
      console.error('Failed to update post:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleShare = () => {
    const url = `${window.location.origin}/#post-${post._id}`;
    navigator.clipboard.writeText(url);
    alert('Post link copied to clipboard!');
  };

  const handleBookmark = async () => {
    if (!user) return;
    try {
      setIsBookmarked(!isBookmarked);
      await api.post(`/posts/${post._id}/bookmark`);
    } catch (error) {
      console.error('Failed to bookmark post:', error);
      setIsBookmarked(isBookmarked); // Revert on failure
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
          <div className="flex justify-between items-center mt-2">
            <div>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleImageUpload} 
                accept="image/*" 
                className="hidden" 
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-surface-400 hover:text-primary-500 transition-colors p-1"
                title="Change Image"
              >
                <ImageIcon size={18} />
              </button>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" onClick={() => {
                setIsEditing(false);
                setEditContent(post.content);
                setEditMediaUrl(post.mediaUrl || '');
              }}>
                <X size={14} className="mr-1" /> Cancel
              </Button>
              <Button variant="primary" size="sm" onClick={handleUpdate} loading={isSaving}>
                <Check size={14} className="mr-1" /> Save
              </Button>
            </div>
          </div>
          
          {editMediaUrl && (
            <div className="mt-3 relative inline-block">
              <img src={editMediaUrl} alt="Edit preview" className="rounded-lg max-h-48 object-cover" />
              <button
                type="button"
                onClick={() => setEditMediaUrl('')}
                className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-black text-white rounded-full transition-colors backdrop-blur-sm"
              >
                <X size={14} />
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="text-surface-200 text-sm leading-relaxed mb-3">
          {renderContent(post.content)}
        </div>
      )}

      {/* Media */}
      {post.mediaUrl && !isEditing && (
        <div className="mb-3 rounded-xl overflow-hidden border border-surface-700/30 bg-surface-900/30">
          <img
            src={post.mediaUrl}
            alt="Post attachment"
            className="w-full h-auto max-h-[600px] object-contain"
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
            onClick={handleBookmark}
            className={`p-2 rounded-xl transition-colors ${
              isBookmarked 
                ? 'text-primary-400 bg-primary-500/10' 
                : 'text-surface-400 hover:bg-surface-700/50 hover:text-surface-200'
            }`}
            title={isBookmarked ? "Remove Bookmark" : "Bookmark Post"}
          >
            <Bookmark size={16} className={isBookmarked ? 'fill-current' : ''} />
          </button>
          <button
            onClick={handleShare}
            className="p-2 rounded-xl text-surface-400 hover:bg-surface-700/50 hover:text-surface-200 transition-colors"
            title="Share Post"
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
