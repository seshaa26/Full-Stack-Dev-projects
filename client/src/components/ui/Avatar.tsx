import React, { useState } from 'react';
import { User as UserIcon } from 'lucide-react';

interface AvatarProps {
  src?: string;
  name?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const Avatar: React.FC<AvatarProps> = ({ src, name, size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-14 w-14 text-lg',
    xl: 'h-20 w-20 text-2xl',
  };

  const iconSizes = {
    sm: 14,
    md: 18,
    lg: 24,
    xl: 32,
  };

  const [imgError, setImgError] = useState(false);

  if (src && !imgError) {
    return (
      <img
        src={src}
        alt={name || 'Avatar'}
        onError={() => setImgError(true)}
        className={`${sizeClasses[size]} rounded-full object-cover bg-surface-800 ring-2 ring-surface-600/50 ${className}`}
      />
    );
  }

  // Fallback: initials or icon
  const initials = name
    ? name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : null;

  return (
    <div
      className={`${sizeClasses[size]} rounded-full flex items-center justify-center 
      bg-gradient-to-br from-primary-600 to-violet-600 text-white font-bold 
      ring-2 ring-surface-600/50 ${className}`}
    >
      {initials || <UserIcon size={iconSizes[size]} />}
    </div>
  );
};

export default Avatar;
