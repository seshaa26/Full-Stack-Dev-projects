import React, { useState, useRef, useEffect } from 'react';
import { Calendar, MapPin, Link as LinkIcon, MessageCircle, Bookmark, ExternalLink, MoreHorizontal, Edit2, Trash2, X, Check, Image as ImageIcon, Share2 } from 'lucide-react';
import { Post, ReactionType } from '../../types';
import { formatDate } from '../../utils/formatDate';
import Avatar from '../ui/Avatar';
import ReactionBar from './ReactionBar';
import CommentList from '../comments/CommentList';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../ui/Button';

interface EventCardProps {
  post: Post;
  onReact: (postId: string, type: ReactionType) => void;
}

const EventCard: React.FC<EventCardProps> = ({ post, onReact }) => {
  const { user } = useAuth();
  const [showComments, setShowComments] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(() => {
    return post.bookmarks?.includes(user?._id || '') || false;
  });

  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [editContent, setEditContent] = useState(post.content);
  const [editTitle, setEditTitle] = useState(post.title || '');
  const [editDate, setEditDate] = useState(post.eventDate ? new Date(post.eventDate).toISOString().slice(0, 16) : '');
  const [editLink, setEditLink] = useState(post.eventLink || '');
  const [editMediaUrl, setEditMediaUrl] = useState(post.mediaUrl || '');

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
      console.error('Failed to bookmark event:', error);
      setIsBookmarked(isBookmarked);
    }
  };

  const handleShare = () => {
    const url = `${window.location.origin}/#event-${post._id}`;
    navigator.clipboard.writeText(url);
    alert('Event link copied to clipboard!');
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this event?')) return;
    setIsDeleting(true);
    try {
      await api.delete(`/posts/${post._id}`);
    } catch (error) {
      console.error('Failed to delete event:', error);
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
        eventDate: editDate ? new Date(editDate).toISOString() : undefined,
        eventLink: editLink,
        mediaUrl: editMediaUrl
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update event:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const isLink = post.eventLink && post.eventLink.startsWith('http');

  return (
    <article
      className="glass-card p-5 animate-fade-in overflow-hidden"
      id={`event-${post._id}`}
    >
      {/* Header */}
      <div className="flex items-start gap-3 mb-4">
        <div className="p-2.5 rounded-xl bg-pink-500/15">
          <Calendar size={22} className="text-pink-400" />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="font-bold text-lg text-surface-50 mb-1 leading-tight truncate">
            {post.title || 'Untitled Event'}
          </h2>
          <div className="flex items-center gap-2 flex-wrap text-xs text-surface-400">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-bold 
                           bg-pink-500/20 text-pink-400 border border-pink-500/30 uppercase">
              Event
            </span>
            <span>Hosted by <span className="font-semibold text-surface-200">{post.author.name}</span></span>
            <span>•</span>
            <span>{formatDate(post.createdAt)}</span>
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

      {isEditing ? (
        <div className="mb-4 space-y-3 bg-surface-900/50 p-4 rounded-xl border border-surface-700/50">
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            placeholder="Event Title"
            className="input-field text-lg font-semibold"
          />
          <div className="flex gap-3">
            <input
              type="datetime-local"
              value={editDate}
              onChange={(e) => setEditDate(e.target.value)}
              className="input-field flex-1"
            />
            <input
              type="url"
              value={editLink}
              onChange={(e) => setEditLink(e.target.value)}
              placeholder="Event Link / Location"
              className="input-field flex-1"
            />
          </div>
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className="textarea-field min-h-[100px]"
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
                setEditDate(post.eventDate ? new Date(post.eventDate).toISOString().slice(0, 16) : '');
                setEditLink(post.eventLink || '');
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
          {/* Event Details Box */}
          <div className="mb-4 bg-surface-900/50 rounded-xl p-4 border border-surface-700/50 space-y-3">
            {post.eventDate && (
              <div className="flex items-start gap-3">
                <Calendar size={18} className="text-surface-400 mt-0.5 shrink-0" />
                <div>
                  <span className="block text-xs font-semibold text-surface-500 uppercase tracking-wider mb-0.5">Date & Time</span>
                  <span className="text-sm font-medium text-surface-200">
                    {new Date(post.eventDate).toLocaleString(undefined, {
                      weekday: 'short',
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
              </div>
            )}
            
            {post.eventLink && (
              <div className="flex items-start gap-3">
                {isLink ? (
                  <LinkIcon size={18} className="text-surface-400 mt-0.5 shrink-0" />
                ) : (
                  <MapPin size={18} className="text-surface-400 mt-0.5 shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <span className="block text-xs font-semibold text-surface-500 uppercase tracking-wider mb-0.5">
                    {isLink ? 'Link' : 'Location'}
                  </span>
                  {isLink ? (
                    <a href={post.eventLink} target="_blank" rel="noopener noreferrer" 
                       className="text-sm font-medium text-primary-400 hover:text-primary-300 flex items-center gap-1 truncate">
                      {post.eventLink} <ExternalLink size={12} />
                    </a>
                  ) : (
                    <span className="text-sm font-medium text-surface-200 block truncate">
                      {post.eventLink}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Description */}
          <div className="text-surface-300 text-sm leading-relaxed mb-4 whitespace-pre-wrap">
            {post.content}
          </div>

          {/* Media/Photo */}
      {post.mediaUrl && !isEditing && (
            <div className="mb-4 rounded-xl overflow-hidden border border-surface-700/50 bg-surface-900/50">
              <img src={post.mediaUrl} alt="Event" className="w-full max-h-96 object-cover" loading="lazy" />
            </div>
          )}
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
          
          <button
            onClick={handleShare}
            className="p-2 rounded-xl text-surface-400 hover:bg-surface-700/50 hover:text-surface-200 transition-colors"
            title="Share Event"
          >
            <Share2 size={18} />
          </button>
        </div>
      </div>

      {showComments && (
        <div className="mt-4 pt-4 border-t border-surface-700/30 animate-slide-up">
          <CommentList postId={post._id} />
        </div>
      )}
    </article>
  );
};

export default EventCard;
