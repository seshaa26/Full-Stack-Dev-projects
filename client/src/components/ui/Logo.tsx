import React from 'react';

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
        <div className="absolute inset-0 bg-primary-500 rounded-full blur-xl opacity-10 animate-pulse-glow"></div>
      )}
      
      {/* 3D Sphere Logo */}
      <svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" className="relative z-10 w-full h-full drop-shadow-md">
        <defs>
          <linearGradient id="sphereGrad" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#818cf8"/> {/* Indigo 400 */}
            <stop offset="100%" stopColor="#1d4ed8"/> {/* Blue 700 */}
          </linearGradient>
          <filter id="shadowGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#1d4ed8" floodOpacity="0.4" />
          </filter>
        </defs>
        
        {/* Sphere Base */}
        <circle cx="60" cy="60" r="55" fill="url(#sphereGrad)" filter="url(#shadowGlow)"/>
        
        {/* 'D' Cutout Graphic */}
        <path d="M35 30 L35 90 C70 90 85 75 85 60 C85 45 70 30 35 30 Z M45 42 L45 78 C60 78 70 68 70 60 C70 52 60 42 45 42 Z" fill="#ffffff" fillRule="evenodd"/>
        
        {/* Floating 'X' Geometric Accent */}
        <path d="M70 40 L85 40 L95 55 L105 40 L120 50 L100 80 L80 50 Z" fill="#ffffff" opacity="0.8"/>
      </svg>
    </div>
  );
};

export default Logo;
