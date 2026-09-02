import React, { useState, useRef, useEffect } from 'react';
import { BookOpen, MessageCircle, Bookmark, MoreHorizontal, Edit2, Trash2, X, Check, Image as ImageIcon } from 'lucide-react';
import { Post, ReactionType } from '../../types';
import { formatDate } from '../../utils/formatDate';
import Avatar from '../ui/Avatar';
import ReactionBar from './ReactionBar';
import CommentList from '../comments/CommentList';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../ui/Button';

interface ArticleCardProps {
  post: Post;
  onReact: (postId: string, type: ReactionType) => void;
}

const ArticleCard: React.FC<ArticleCardProps> = ({ post, onReact }) => {
  const { user } = useAuth();
  const [showComments, setShowComments] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(() => {
    return post.bookmarks?.includes(user?._id || '') || false;
  });

  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(post.content);
  const [editTitle, setEditTitle] = useState(post.title || '');
  const [editMediaUrl, setEditMediaUrl] = useState(post.mediaUrl || '');
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
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

  const handleBookmark = async () => {
    if (!user) return;
    try {
      setIsBookmarked(!isBookmarked);
      await api.post(`/posts/${post._id}/bookmark`);
    } catch (error) {
      console.error('Failed to bookmark article:', error);
      setIsBookmarked(isBookmarked);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this article?')) return;
    setIsDeleting(true);
    try {
      await api.delete(`/posts/${post._id}`);
    } catch (error) {
      console.error('Failed to delete article:', error);
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
        title: editTitle,
        mediaUrl: editMediaUrl
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update article:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <article
      className="glass-card p-0 animate-fade-in overflow-hidden relative"
      id={`article-${post._id}`}
    >
      {/* Action Menu (Floating top right for articles) */}
      {isAuthor && (
        <div className="absolute top-4 right-4 z-10" ref={menuRef}>
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1.5 rounded-lg bg-black/40 text-white hover:bg-black/60 transition-colors backdrop-blur-md"
            disabled={isDeleting}
          >
            <MoreHorizontal size={18} />
          </button>
          
          {showMenu && (
            <div className="absolute right-0 mt-1 w-36 py-1 bg-surface-800 rounded-xl shadow-xl border border-surface-700/50 z-20 animate-fade-in">
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

      {post.mediaUrl && !isEditing && (
        <div className="w-full h-48 md:h-64 overflow-hidden relative border-b border-surface-700/50">
          <img src={post.mediaUrl} alt="Article cover" className="w-full h-full object-cover" loading="lazy" />
          <div className="absolute inset-0 bg-gradient-to-t from-surface-900/90 to-transparent" />
        </div>
      )}

      <div className="p-5">
        {isEditing ? (
          <div className="mb-4 space-y-3 bg-surface-900/50 p-4 rounded-xl border border-surface-700/50 mt-8">
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              placeholder="Article Title"
              className="input-field text-xl font-bold"
            />
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="textarea-field min-h-[200px]"
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
                  setEditTitle(post.title || '');
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
          <>
            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
              <Avatar src={post.author.avatar} name={post.author.name} size="md" />
              <div className="flex-1">
                <span className="font-bold text-surface-100 text-sm block">{post.author.name}</span>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold 
                                 bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 uppercase">
                    <BookOpen size={10} /> Article
                  </span>
                  <span className="text-xs text-surface-500">{formatDate(post.createdAt)}</span>
                </div>
              </div>
            </div>

            {/* Title */}
            <h2 className="text-xl font-bold text-surface-50 mb-3 leading-snug">
              {post.title || 'Untitled Article'}
            </h2>

            {/* Content Preview */}
            <div className="text-surface-300 text-sm leading-relaxed mb-4 whitespace-pre-wrap">
              {post.content}
            </div>
          </>
        )}

        {/* Tags */}
        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {post.tags.map((tag) => (
              <span key={tag} className="tag-chip text-[11px]">
                #{tag}
              </span>
            ))}
          </div>
        )}

        <div className="border-t border-surface-700/30 mb-3" />

        {/* Actions */}
        <div className="flex items-center justify-between">
          <ReactionBar post={post} onReact={onReact} />
          <div className="flex items-center gap-1">
            <button
              onClick={() => setShowComments(!showComments)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm text-surface-400 
                       hover:bg-surface-700/50 hover:text-surface-200 transition-colors"
            >
              <MessageCircle size={16} />
              <span className="text-xs">{post.commentsCount}</span>
            </button>
            
            <button
              onClick={handleBookmark}
              className={`p-2 rounded-xl transition-all duration-200 ${
                isBookmarked 
                  ? 'text-primary-400 bg-primary-500/10' 
                  : 'text-surface-400 hover:text-surface-200 hover:bg-surface-700/50'
              }`}
            >
              <Bookmark size={18} fill={isBookmarked ? 'currentColor' : 'none'} />
            </button>
          </div>
        </div>

        {showComments && (
          <div className="mt-4 pt-4 border-t border-surface-700/30 animate-slide-up">
            <CommentList postId={post._id} />
          </div>
        )}
      </div>
    </article>
  );
};

export default ArticleCard;
