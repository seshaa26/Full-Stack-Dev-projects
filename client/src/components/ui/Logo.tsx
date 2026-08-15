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
      
      {/* Cyberpunk Neon SVG Logo (Plain Background) */}
      <svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" className="relative z-10 w-full h-full drop-shadow-md">
        <defs>
          <linearGradient id="cyberpunkGlow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00f2fe"/>
            <stop offset="100%" stopColor="#4facfe"/>
          </linearGradient>
        </defs>
        
        {/* Glowing Intersection Path 1 */}
        <path d="M30 30 L50 30 L70 60 L90 30 L100 45 L70 90 L50 90 Z" fill="url(#cyberpunkGlow)"/>
        
        {/* Glowing Intersection Path 2 (Semi-transparent overlay) */}
        <path d="M20 90 L40 90 L60 60 L40 30 L20 45 L50 90 Z" fill="#38bdf8" opacity="0.8"/>
      </svg>
    </div>
  );
};

export default Logo;
