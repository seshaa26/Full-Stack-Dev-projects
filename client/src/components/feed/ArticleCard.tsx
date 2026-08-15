import React, { useState } from 'react';
import { BookOpen, MessageCircle, Bookmark } from 'lucide-react';
import { Post, ReactionType } from '../../types';
import { formatDate } from '../../utils/formatDate';
import Avatar from '../ui/Avatar';
import ReactionBar from './ReactionBar';
import CommentList from '../comments/CommentList';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

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

  return (
    <article
      className="glass-card p-0 animate-fade-in overflow-hidden"
      id={`article-${post._id}`}
    >
      {post.mediaUrl && (
        <div className="w-full h-48 md:h-64 overflow-hidden relative border-b border-surface-700/50">
          <img src={post.mediaUrl} alt="Article cover" className="w-full h-full object-cover" loading="lazy" />
          <div className="absolute inset-0 bg-gradient-to-t from-surface-900/90 to-transparent" />
        </div>
      )}

      <div className="p-5">
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
