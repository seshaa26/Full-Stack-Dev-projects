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
        <div className="absolute inset-0 bg-cyan-500 rounded-full blur-xl opacity-20 animate-pulse-glow"></div>
      )}
      
      {/* Cyberpunk Neon DX Logo */}
      <svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" className="relative z-10 w-full h-full">
        <defs>
          <linearGradient id="neonD" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00f2fe"/>
            <stop offset="100%" stopColor="#4facfe"/>
          </linearGradient>
          
          <linearGradient id="neonX" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.8"/>
            <stop offset="100%" stopColor="#0284c7" stopOpacity="0.8"/>
          </linearGradient>

          {/* Heavy Neon Glow Effect */}
          <filter id="neonGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="3" result="blur1"/>
            <feGaussianBlur stdDeviation="6" result="blur2"/>
            <feGaussianBlur stdDeviation="10" result="blur3"/>
            <feMerge>
              <feMergeNode in="blur3"/>
              <feMergeNode in="blur2"/>
              <feMergeNode in="blur1"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        {/* The 'D' Shape */}
        <path 
          d="M 12.5 20 L 42.5 20 C 67.5 20, 77.5 40, 77.5 60 C 77.5 80, 67.5 100, 42.5 100 L 12.5 100 Z M 32.5 40 L 32.5 80 C 47.5 80, 52.5 70, 52.5 60 C 52.5 50, 47.5 40, 32.5 40 Z" 
          fill="url(#neonD)" 
          fillRule="evenodd"
          filter="url(#neonGlow)"
        />
        
        {/* The 'X' Left Leg */}
        <path 
          d="M 52.5 20 L 67.5 20 L 107.5 100 L 92.5 100 Z" 
          fill="url(#neonX)" 
          filter="url(#neonGlow)"
        />
        
        {/* The 'X' Right Leg (Overlapping) */}
        <path 
          d="M 107.5 20 L 92.5 20 L 52.5 100 L 67.5 100 Z" 
          fill="url(#neonX)" 
          filter="url(#neonGlow)"
        />
      </svg>
    </div>
  );
};

export default Logo;
