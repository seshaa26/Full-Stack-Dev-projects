import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { Post, ReactionType } from '../types';
import * as postService from '../services/postService';
import { useSocket } from '../contexts/SocketContext';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/layout/Navbar';
import Sidebar from '../components/layout/Sidebar';
import MobileNav from '../components/layout/MobileNav';
import PostCard from '../components/feed/PostCard';
import PollCard from '../components/feed/PollCard';
import AnnouncementCard from '../components/feed/AnnouncementCard';
import CreatePostModal from '../components/feed/CreatePostModal';
import TagFilter from '../components/feed/TagFilter';
import Loader from '../components/ui/Loader';
import { TrendingUp, Hash, Users } from 'lucide-react';
import { POPULAR_TAGS } from '../utils/constants';

const HomePage: React.FC = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const isTrending = searchParams.get('sort') === 'trending';
  const isSaved = searchParams.get('saved') === 'true';

  const { isAuthenticated } = useAuth();
  const { socket } = useSocket();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Fetch posts
  const fetchPosts = useCallback(async (pageNum: number, tag: string | null, reset = false) => {
    try {
      if (reset) setLoading(true);
      else setLoadingMore(true);

      const data = await postService.getPosts(pageNum, 10, tag || undefined);

      if (reset) {
        setPosts(data.posts);
      } else {
        setPosts((prev) => [...prev, ...data.posts]);
      }

      setHasMore(pageNum < data.pagination.pages);
    } catch (error) {
      console.error('Failed to fetch posts:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    setPage(1);
    fetchPosts(1, selectedTag, true);
  }, [selectedTag, fetchPosts]);

  // Infinite scroll
  useEffect(() => {
    if (loadMoreRef.current) {
      observerRef.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && hasMore && !loadingMore) {
            const nextPage = page + 1;
            setPage(nextPage);
            fetchPosts(nextPage, selectedTag);
          }
        },
        { threshold: 0.5 }
      );
      observerRef.current.observe(loadMoreRef.current);
    }

    return () => {
      if (observerRef.current) observerRef.current.disconnect();
    };
  }, [hasMore, loadingMore, page, selectedTag, fetchPosts]);

  // Real-time updates via Socket.IO
  useEffect(() => {
    if (!socket) return;

    const handleNewPost = (post: Post) => {
      setPosts((prev) => [post, ...prev]);
    };

    const handlePostUpdated = (updatedPost: Post) => {
      setPosts((prev) =>
        prev.map((p) => (p._id === updatedPost._id ? updatedPost : p))
      );
    };

    const handlePostDeleted = ({ postId }: { postId: string }) => {
      setPosts((prev) => prev.filter((p) => p._id !== postId));
    };

    socket.on('new-post', handleNewPost);
    socket.on('post-updated', handlePostUpdated);
    socket.on('post-deleted', handlePostDeleted);

    return () => {
      socket.off('new-post', handleNewPost);
      socket.off('post-updated', handlePostUpdated);
      socket.off('post-deleted', handlePostDeleted);
    };
  }, [socket]);

  // Handlers
  const handleReaction = async (postId: string, type: ReactionType) => {
    if (!isAuthenticated) return;
    try {
      const data = await postService.toggleReaction(postId, type);
      setPosts((prev) =>
        prev.map((p) => (p._id === postId ? data.post : p))
      );
    } catch (error) {
      console.error('Reaction failed:', error);
    }
  };

  const handleVote = async (postId: string, optionId: string) => {
    if (!isAuthenticated) return;
    try {
      const data = await postService.votePoll(postId, optionId);
      setPosts((prev) =>
        prev.map((p) => (p._id === postId ? data.post : p))
      );
    } catch (error) {
      console.error('Vote failed:', error);
    }
  };

  const handleCreatePost = async (data: any) => {
    try {
      if (data.type === 'poll' && data.options) {
        await postService.createPoll({
          content: data.content,
          options: data.options,
          tags: data.tags,
        });
      } else {
        await postService.createPost({
          content: data.content,
          type: data.type,
          mediaUrl: data.mediaUrl,
          tags: data.tags,
        });
      }
      // Post will appear via Socket.IO event
    } catch (error) {
      console.error('Failed to create post:', error);
    }
  };

  const renderPost = (post: Post) => {
    switch (post.type) {
      case 'poll':
        return <PollCard key={post._id} post={post} onVote={handleVote} onReact={handleReaction} />;
      case 'announcement':
        return <AnnouncementCard key={post._id} post={post} onReact={handleReaction} />;
      default:
        return <PostCard key={post._id} post={post} onReact={handleReaction} />;
    }
  };

  // Skeleton loader
  const renderSkeleton = () => (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="glass-card p-5 animate-pulse">
          <div className="flex items-center gap-3 mb-4">
            <div className="skeleton-avatar" />
            <div className="flex-1">
              <div className="skeleton-text w-32" />
              <div className="skeleton-text w-20" />
            </div>
          </div>
          <div className="skeleton-text w-full" />
          <div className="skeleton-text w-3/4" />
          <div className="skeleton-text w-1/2" />
          <div className="mt-4 flex gap-2">
            <div className="skeleton h-8 w-16 rounded-xl" />
            <div className="skeleton h-8 w-16 rounded-xl" />
            <div className="skeleton h-8 w-16 rounded-xl" />
          </div>
        </div>
      ))}
    </div>
  );

  const filteredPosts = posts.filter(p => {
    if (isSaved) {
      return localStorage.getItem(`bookmark_${p._id}`) === 'true';
    }
    return true;
  });

  if (isTrending) {
    filteredPosts.sort((a, b) => (b.commentsCount + b.reactions.length) - (a.commentsCount + a.reactions.length));
  }

  return (
    <div className="min-h-screen bg-surface-950" id="home-page">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-20 pb-24 lg:pb-8">
        <div className="flex gap-6">
          {/* Left Sidebar */}
          <Sidebar
            selectedTag={selectedTag}
            onTagSelect={setSelectedTag}
            onCreatePost={() => setShowCreateModal(true)}
          />

          {/* Main Feed */}
          <div className="flex-1 min-w-0 max-w-2xl mx-auto lg:mx-0">
            {/* Mobile Tag Filter */}
            <TagFilter selectedTag={selectedTag} onTagSelect={setSelectedTag} />

            {/* Feed Header */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-surface-100">
                {isTrending ? 'Trending Posts' : isSaved ? 'Saved Posts' : (selectedTag ? `#${selectedTag}` : 'Your Feed')}
              </h2>
              {selectedTag && (
                <button
                  onClick={() => setSelectedTag(null)}
                  className="text-xs text-primary-400 hover:text-primary-300"
                >
                  Clear filter
                </button>
              )}
            </div>

            {/* Post List */}
            {loading ? (
              renderSkeleton()
            ) : filteredPosts.length === 0 ? (
              <div className="glass-card p-12 text-center">
                <div className="text-4xl mb-3">🌱</div>
                <h3 className="text-lg font-semibold text-surface-200 mb-2">
                  {isSaved ? 'No saved posts' : 'No posts yet'}
                </h3>
                <p className="text-sm text-surface-400 mb-4">
                  {isSaved 
                    ? "You haven't bookmarked any posts yet." 
                    : "Be the first to share something with the community!"}
                </p>
                {isAuthenticated && (
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="btn-primary"
                  >
                    Create First Post
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredPosts.map(renderPost)}
                
                <div ref={loadMoreRef} className="py-4 flex justify-center h-20">
                  {loadingMore && <Loader size="sm" />}
                  {!hasMore && filteredPosts.length > 0 && (
                    <p className="text-surface-500 text-sm">You've reached the end!</p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right Panel (Desktop) */}
          <aside className="hidden xl:block w-72 shrink-0">
            <div className="sticky top-20 space-y-4">
              {/* Trending Topics */}
              <div className="glass-card p-4">
                <h3 className="flex items-center gap-2 text-sm font-semibold text-surface-200 mb-3">
                  <TrendingUp size={16} className="text-amber-400" />
                  Trending Topics
                </h3>
                <div className="space-y-2">
                  {POPULAR_TAGS.slice(0, 6).map((tag, i) => (
                    <button
                      key={tag}
                      onClick={() => setSelectedTag(tag)}
                      className="flex items-center gap-2 w-full px-2 py-1.5 rounded-lg text-sm text-surface-400
                               hover:bg-surface-700/50 hover:text-surface-200 transition-colors text-left"
                    >
                      <Hash size={13} className="text-primary-500" />
                      <span className="flex-1">{tag}</span>
                      <span className="text-xs text-surface-500">#{i + 1}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Active Community */}
              <div className="glass-card p-4">
                <h3 className="flex items-center gap-2 text-sm font-semibold text-surface-200 mb-3">
                  <Users size={16} className="text-cyan-400" />
                  Community
                </h3>
                <div className="text-center py-4">
                  <p className="text-2xl font-bold gradient-text">DevXgen</p>
                  <p className="text-xs text-surface-400 mt-1">Growing every day 🚀</p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>

      {/* Mobile Navigation */}
      <MobileNav onCreatePost={() => setShowCreateModal(true)} />

      {/* Create Post Modal */}
      <CreatePostModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreatePost}
      />
    </div>
  );
};

export default HomePage;
