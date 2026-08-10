import React, { useState } from 'react';
import { Send } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import Avatar from '../ui/Avatar';

interface CommentFormProps {
  onSubmit: (content: string) => Promise<void>;
}

const CommentForm: React.FC<CommentFormProps> = ({ onSubmit }) => {
  const { user, isAuthenticated } = useAuth();
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isAuthenticated) {
    return (
      <p className="text-xs text-surface-500 text-center py-2">
        Sign in to comment
      </p>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || loading) return;

    setLoading(true);
    try {
      await onSubmit(content.trim());
      setContent('');
    } catch (error) {
      console.error('Failed to post comment:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-start gap-2.5">
      <Avatar src={user?.avatar} name={user?.name} size="sm" />
      <div className="flex-1 relative">
        <input
          type="text"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write a comment..."
          className="w-full pr-10 px-4 py-2.5 rounded-xl bg-surface-800/60 border border-surface-700/50
                   text-sm text-surface-200 placeholder-surface-500
                   focus:outline-none focus:border-primary-500/40 focus:ring-1 focus:ring-primary-500/20
                   transition-all duration-200"
          id="comment-input"
        />
        <button
          type="submit"
          disabled={!content.trim() || loading}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg 
                   text-primary-400 hover:text-primary-300 disabled:text-surface-600 
                   transition-colors"
        >
          <Send size={16} />
        </button>
      </div>
    </form>
  );
};

export default CommentForm;
