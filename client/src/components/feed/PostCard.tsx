import React, { useState } from 'react';
import { MessageCircle, Share2, Bookmark } from 'lucide-react';
import { Post, ReactionType } from '../../types';
import { formatDate } from '../../utils/formatDate';
import Avatar from '../ui/Avatar';
import Badge from '../ui/Badge';
import ReactionBar from './ReactionBar';
import CommentList from '../comments/CommentList';

interface PostCardProps {
  post: Post;
  onReact: (postId: string, type: ReactionType) => void;
}

const PostCard: React.FC<PostCardProps> = ({ post, onReact }) => {
  const [showComments, setShowComments] = useState(false);

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
      </div>

      {/* Content */}
      <div className="text-surface-200 text-sm leading-relaxed mb-3">
        {renderContent(post.content)}
      </div>

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
