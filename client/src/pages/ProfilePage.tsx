import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Post, ReactionType } from '../types';
import * as postService from '../services/postService';
import Navbar from '../components/layout/Navbar';
import ProfileCard from '../components/profile/ProfileCard';
import EditProfileModal from '../components/profile/EditProfileModal';
import PostCard from '../components/feed/PostCard';
import PollCard from '../components/feed/PollCard';
import AnnouncementCard from '../components/feed/AnnouncementCard';
import Loader from '../components/ui/Loader';

const ProfilePage: React.FC = () => {
  const { user, updateUser, isAuthenticated } = useAuth();
  const [showEditModal, setShowEditModal] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserPosts = async () => {
      try {
        // Fetch all posts and filter by current user (simplified approach)
        const data = await postService.getPosts(1, 50);
        const userPosts = data.posts.filter(
          (p) => p.author._id === user?._id
        );
        setPosts(userPosts);
      } catch (error) {
        console.error('Failed to fetch user posts:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchUserPosts();
  }, [user]);

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

  if (!user) return null;

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

  return (
    <div className="min-h-screen bg-surface-950" id="profile-page">
      <Navbar />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 pt-20 pb-24">
        {/* Profile Card */}
        <ProfileCard
          user={user}
          isOwn={true}
          onEdit={() => setShowEditModal(true)}
        />

        {/* User's Posts */}
        <div className="mt-6">
          <h2 className="text-lg font-bold text-surface-100 mb-4">
            My Posts ({posts.length})
          </h2>

          {loading ? (
            <Loader className="py-8" />
          ) : posts.length === 0 ? (
            <div className="glass-card p-8 text-center">
              <p className="text-surface-400">You haven't posted anything yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {posts.map(renderPost)}
            </div>
          )}
        </div>
      </main>

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        user={user}
        onUpdate={updateUser}
      />
    </div>
  );
};

export default ProfilePage;
