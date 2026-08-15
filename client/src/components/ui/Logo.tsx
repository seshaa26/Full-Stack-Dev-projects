import React from 'react';
import logoImg from '../../assets/logo.jpg';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  animate?: boolean;
}

const Logo: React.FC<LogoProps> = ({ size = 'md', className = '', animate = true }) => {
  const sizeMap = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
  };

  const dimensions = sizeMap[size];

  return (
    <div className={`relative flex items-center justify-center ${dimensions} ${className}`}>
      {/* Background Pulse Glow */}
      {animate && (
        <div className="absolute inset-0 bg-primary-500 rounded-full blur-xl opacity-20 animate-pulse-glow"></div>
      )}
      
      {/* 3D Infinity Logo */}
      <img
        src={logoImg}
        alt="DevXgen Logo"
        className="relative z-10 w-full h-full object-contain rounded-full shadow-lg"
      />
    </div>
  );
};

export default Logo;
