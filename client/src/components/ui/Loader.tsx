import React from 'react';

interface LoaderProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const Loader: React.FC<LoaderProps> = ({ size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'h-5 w-5 border-2',
    md: 'h-8 w-8 border-[3px]',
    lg: 'h-12 w-12 border-4',
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div
        className={`${sizeClasses[size]} rounded-full animate-spin 
        border-primary-500/30 border-t-primary-500`}
        style={{
          background: 'transparent',
        }}
      />
    </div>
  );
};

export const PageLoader: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center bg-surface-950">
    <div className="text-center">
      <Loader size="lg" className="mb-4" />
      <p className="text-surface-400 text-sm animate-pulse">Loading DevXgen...</p>
    </div>
  </div>
);

export default Loader;
