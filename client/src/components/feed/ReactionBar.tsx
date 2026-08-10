import React from 'react';
import { REACTION_EMOJI, REACTION_LABELS } from '../../utils/constants';
import { Post, ReactionType } from '../../types';
import { useAuth } from '../../contexts/AuthContext';

interface ReactionBarProps {
  post: Post;
  onReact: (postId: string, type: ReactionType) => void;
}

const ReactionBar: React.FC<ReactionBarProps> = ({ post, onReact }) => {
  const { user } = useAuth();

  const reactionTypes: ReactionType[] = ['like', 'insightful', 'fire', 'code'];

  const getReactionCount = (type: ReactionType) =>
    post.reactions.filter((r) => r.type === type).length;

  const getUserReaction = () => {
    if (!user) return null;
    const reaction = post.reactions.find((r) => {
      const userId = typeof r.user === 'string' ? r.user : r.user._id;
      return userId === user._id;
    });
    return reaction?.type || null;
  };

  const activeReaction = getUserReaction();

  return (
    <div className="flex items-center gap-1">
      {reactionTypes.map((type) => {
        const count = getReactionCount(type);
        const isActive = activeReaction === type;

        return (
          <button
            key={type}
            onClick={() => onReact(post._id, type)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm transition-all duration-200
              ${isActive
                ? 'bg-primary-500/20 text-primary-300 scale-105'
                : 'text-surface-400 hover:bg-surface-700/50 hover:text-surface-200'
              }`}
            title={REACTION_LABELS[type]}
            id={`reaction-${type}-${post._id}`}
          >
            <span className={`text-base ${isActive ? 'animate-bounce-in' : ''}`}>
              {REACTION_EMOJI[type]}
            </span>
            {count > 0 && (
              <span className="text-xs font-medium">{count}</span>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default ReactionBar;
