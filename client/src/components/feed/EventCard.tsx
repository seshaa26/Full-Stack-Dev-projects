import React, { useState } from 'react';
import { Calendar, MapPin, Link as LinkIcon, MessageCircle, Bookmark, ExternalLink } from 'lucide-react';
import { Post, ReactionType } from '../../types';
import { formatDate } from '../../utils/formatDate';
import Avatar from '../ui/Avatar';
import ReactionBar from './ReactionBar';
import CommentList from '../comments/CommentList';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

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
        <div className="flex-1">
          <h2 className="font-bold text-lg text-surface-50 mb-1 leading-tight">
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
        <Avatar src={post.author.avatar} name={post.author.name} size="md" />
      </div>

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
    </article>
  );
};

export default EventCard;
