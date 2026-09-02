import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  animate?: boolean;
}

const Logo: React.FC<LogoProps> = ({ size = 'md', className = '', animate = true }) => {
  const sizeMap = {
    sm: 'w-14 h-14',
    md: 'w-20 h-20',
    lg: 'w-28 h-28',
    xl: 'w-36 h-36',
  };

  const dimensions = sizeMap[size];

  return (
    <div className={`relative flex items-center justify-center ${dimensions} ${className}`}>
      {/* Background Pulse Glow */}
      {animate && (
        <div className="absolute inset-0 bg-primary-500 rounded-full blur-xl opacity-10 animate-pulse-glow"></div>
      )}

      {/* DX Infinite Logo */}
      <img
        src="/logo.png"
        alt="DevXgen Logo"
        className="relative z-10 w-full h-full object-contain drop-shadow-sm brightness-110 contrast-105"
        style={{ filter: 'brightness(1.3) contrast(1.1)' }}
      />
    </div>
  );
};

export default Logo;
