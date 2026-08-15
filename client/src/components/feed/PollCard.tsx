import React, { useState } from 'react';
import { BarChart3, MessageCircle, Bookmark } from 'lucide-react';
import { Post, ReactionType } from '../../types';
import { formatDate } from '../../utils/formatDate';
import { useAuth } from '../../contexts/AuthContext';
import Avatar from '../ui/Avatar';
import Badge from '../ui/Badge';
import CommentList from '../comments/CommentList';
import api from '../../services/api';

interface PollCardProps {
  post: Post;
  onVote: (postId: string, optionId: string) => void;
  onReact: (postId: string, type: ReactionType) => void;
}

const PollCard: React.FC<PollCardProps> = ({ post, onVote, onReact }) => {
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

  const totalVotes = post.pollOptions.reduce((sum, opt) => sum + opt.votes.length, 0);

  // Check if the current user has voted
  const userVotedOptionId = post.pollOptions.find((opt) =>
    opt.votes.includes(user?._id || '')
  )?._id;

  const hasVoted = !!userVotedOptionId;

  return (
    <article className="glass-card-hover p-5 animate-fade-in" id={`poll-${post._id}`}>
      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        <Avatar src={post.author.avatar} name={post.author.name} size="md" />
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-surface-100 text-sm">
              {post.author.name}
            </span>
            <Badge variant="poll">
              <BarChart3 size={10} className="mr-1" />
              Poll
            </Badge>
            <span className="text-xs text-surface-500">{formatDate(post.createdAt)}</span>
          </div>
        </div>
      </div>

      {/* Poll Question */}
      <h3 className="text-surface-100 font-semibold text-base mb-4">{post.content}</h3>

      {/* Poll Options */}
      <div className="space-y-2.5 mb-4">
        {post.pollOptions.map((option) => {
          const voteCount = option.votes.length;
          const percentage = totalVotes > 0 ? Math.round((voteCount / totalVotes) * 100) : 0;
          const isSelected = option._id === userVotedOptionId;

          return (
            <button
              key={option._id}
              onClick={() => !hasVoted && onVote(post._id, option._id)}
              disabled={hasVoted}
              className={`relative w-full text-left p-3 rounded-xl border transition-all duration-300 overflow-hidden
                ${isSelected
                  ? 'border-primary-500/50 bg-primary-500/10'
                  : hasVoted
                    ? 'border-surface-700/30 bg-surface-800/30'
                    : 'border-surface-700/50 bg-surface-800/50 hover:border-primary-500/30 hover:bg-surface-700/50 cursor-pointer'
                }`}
              id={`poll-option-${option._id}`}
            >
              {/* Progress Bar Background */}
              {hasVoted && (
                <div
                  className={`absolute inset-0 rounded-xl transition-all duration-700 ease-out
                    ${isSelected ? 'bg-primary-500/15' : 'bg-surface-700/20'}`}
                  style={{ width: `${percentage}%` }}
                />
              )}

              <div className="relative flex items-center justify-between">
                <span className={`text-sm font-medium ${isSelected ? 'text-primary-300' : 'text-surface-200'}`}>
                  {option.optionText}
                </span>
                {hasVoted && (
                  <span className={`text-sm font-bold ${isSelected ? 'text-primary-400' : 'text-surface-400'}`}>
                    {percentage}%
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Vote Count */}
      <p className="text-xs text-surface-500 mb-3">
        {totalVotes} {totalVotes === 1 ? 'vote' : 'votes'}
      </p>

      {/* Tags */}
      {post.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {post.tags.map((tag) => (
            <span key={tag} className="tag-chip text-[11px]">#{tag}</span>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="border-t border-surface-700/30 pt-3 flex items-center justify-between">
        <div className="flex items-center gap-1">
          {/* Simplified reaction for polls */}
          <button
            onClick={() => onReact(post._id, 'like')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm text-surface-400 
                     hover:bg-surface-700/50 hover:text-surface-200 transition-colors"
          >
            👍 <span className="text-xs">{post.reactions.filter(r => r.type === 'like').length || ''}</span>
          </button>
        </div>
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

export default PollCard;
