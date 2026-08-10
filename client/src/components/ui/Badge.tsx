import React from 'react';

interface BadgeProps {
  variant?: 'default' | 'announcement' | 'poll' | 'success' | 'fire';
  children: React.ReactNode;
  className?: string;
}

const Badge: React.FC<BadgeProps> = ({ variant = 'default', children, className = '' }) => {
  const variants = {
    default: 'bg-primary-500/20 text-primary-400 border border-primary-500/30',
    announcement: 'badge-announcement',
    poll: 'badge-poll',
    success: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
    fire: 'bg-orange-500/20 text-orange-400 border border-orange-500/30',
  };

  return (
    <span className={`badge ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};

export default Badge;
