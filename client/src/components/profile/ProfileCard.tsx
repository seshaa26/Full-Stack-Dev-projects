import React from 'react';
import { Calendar, Mail, Edit2 } from 'lucide-react';
import { User } from '../../types';
import Avatar from '../ui/Avatar';
import Button from '../ui/Button';

interface ProfileCardProps {
  user: User;
  isOwn?: boolean;
  onEdit?: () => void;
}

const ProfileCard: React.FC<ProfileCardProps> = ({ user, isOwn = false, onEdit }) => {
  const memberSince = new Date(user.createdAt).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="glass-card overflow-hidden animate-fade-in">
      {/* Gradient Header Banner */}
      <div className="h-32 bg-gradient-to-r from-primary-600 via-violet-600 to-cyan-600 relative">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMSIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjEpIi8+PC9zdmc+')] opacity-50" />
      </div>

      {/* Profile Content */}
      <div className="px-6 pb-6">
        <div className="flex justify-between items-start mb-4">
          <Avatar src={user.avatar} name={user.name} size="xl" className="ring-4 ring-surface-900 -mt-12 bg-surface-900" />
          {isOwn && onEdit && (
            <Button variant="secondary" size="sm" onClick={onEdit} className="mt-4">
              <Edit2 size={14} />
              Edit Profile
            </Button>
          )}
        </div>

        <h1 className="text-xl font-bold text-surface-100 mb-1">{user.name}</h1>

        {user.bio && (
          <p className="text-sm text-surface-300 mb-4 leading-relaxed">{user.bio}</p>
        )}

        {/* Skills */}
        {user.skills.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {user.skills.map((skill) => (
              <span key={skill} className="tag-chip">
                {skill}
              </span>
            ))}
          </div>
        )}

        {/* Meta Info */}
        <div className="flex flex-wrap gap-4 text-xs text-surface-400">
          <span className="flex items-center gap-1.5">
            <Mail size={13} />
            {user.email}
          </span>
          <span className="flex items-center gap-1.5">
            <Calendar size={13} />
            Member since {memberSince}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;
