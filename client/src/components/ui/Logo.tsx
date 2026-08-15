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
        <div className="absolute inset-0 bg-rose-500 rounded-full blur-xl opacity-15 animate-pulse-glow"></div>
      )}
      
      {/* Fluid Wave Ring Logo */}
      <svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" className="relative z-10 w-full h-full drop-shadow-lg">
        <defs>
          <linearGradient id="fluidWave" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ff0844"/>
            <stop offset="100%" stopColor="#ffb199"/>
          </linearGradient>
          <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#ff0844" floodOpacity="0.4" />
          </filter>
        </defs>
        
        {/* Outer Continuous Ring */}
        <path 
          d="M10 60 C10 32.4 32.4 10 60 10 C87.6 10 110 32.4 110 60 C110 87.6 87.6 110 60 110 C32.4 110 10 87.6 10 60 Z" 
          fill="none" 
          stroke="url(#fluidWave)" 
          strokeWidth="8"
          filter="url(#neonGlow)"
        />
        
        {/* Minimalist 'D' Path inside */}
        <path 
          d="M40 30 L40 90 M30 30 L50 30 M30 90 L50 90" 
          stroke="#ff0844" 
          strokeWidth="8" 
          strokeLinecap="round"
        />
        
        {/* Minimalist 'X' Path inside */}
        <path 
          d="M60 40 L90 80 M90 40 L60 80" 
          stroke="#ffb199" 
          strokeWidth="8" 
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
};

export default Logo;
