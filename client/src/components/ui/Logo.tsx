import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  animate?: boolean;
}

const Logo: React.FC<LogoProps> = ({ size = 'md', className = '', animate = true }) => {
  const sizeMap = {
    sm: 'w-10 h-10',
    md: 'w-14 h-14',
    lg: 'w-20 h-20',
    xl: 'w-28 h-28',
  };

  const dimensions = sizeMap[size];

  return (
    <div className={`relative flex items-center justify-center ${dimensions} ${className}`}>
      {/* Background Pulse Glow */}
      {animate && (
        <div className="absolute inset-0 bg-primary-500 rounded-full blur-xl opacity-10 animate-pulse-glow"></div>
      )}
      
      {/* DX Infinite Logo — mix-blend-multiply removes white background */}
      <img
        src="/logo.png"
        alt="DevXgen Logo"
        className="relative z-10 w-full h-full object-contain drop-shadow-sm"
      />
    </div>
  );
};

export default Logo;
