import React, { useState } from 'react';
import { Megaphone, MessageCircle, Bookmark } from 'lucide-react';
import { Post, ReactionType } from '../../types';
import { formatDate } from '../../utils/formatDate';
import Avatar from '../ui/Avatar';
import ReactionBar from './ReactionBar';
import CommentList from '../comments/CommentList';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

interface AnnouncementCardProps {
  post: Post;
  onReact: (postId: string, type: ReactionType) => void;
}

const AnnouncementCard: React.FC<AnnouncementCardProps> = ({ post, onReact }) => {
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
      console.error('Failed to bookmark post:', error);
      setIsBookmarked(isBookmarked);
    }
  };

  return (
    <article
      className="relative glass-card p-5 animate-fade-in overflow-hidden gradient-border"
      id={`announcement-${post._id}`}
    >
      {/* Gradient glow effect */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-orange-500 to-red-500" />

      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        <div className="p-2 rounded-xl bg-amber-500/15">
          <Megaphone size={20} className="text-amber-400" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-surface-100 text-sm">{post.author.name}</span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold 
                           bg-amber-500/20 text-amber-400 border border-amber-500/30 uppercase tracking-wider">
              Official
            </span>
            <span className="text-xs text-surface-500">{formatDate(post.createdAt)}</span>
          </div>
        </div>
        <Avatar src={post.author.avatar} name={post.author.name} size="sm" />
      </div>

      {/* Content */}
      <div className="text-surface-100 text-sm leading-relaxed mb-3 font-medium">
        {post.content}
      </div>

      {/* Media */}
      {post.mediaUrl && (
        <div className="mb-3 rounded-xl overflow-hidden border border-amber-500/20">
          <img src={post.mediaUrl} alt="Announcement" className="w-full max-h-80 object-cover" loading="lazy" />
        </div>
      )}

      {/* Tags */}
      {post.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {post.tags.map((tag) => (
            <span key={tag} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium 
                                     bg-amber-500/10 text-amber-400 border border-amber-500/20">
              #{tag}
            </span>
          ))}
        </div>
      )}

      <div className="border-t border-surface-700/30 my-3" />

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

export default AnnouncementCard;
