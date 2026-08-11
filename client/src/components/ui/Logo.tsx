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
        <div className="absolute inset-0 bg-primary-500 rounded-full blur-xl opacity-20 animate-pulse-glow"></div>
      )}
      
      {/* SVG Icon */}
      <svg
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="relative z-10 w-full h-full drop-shadow-md"
      >
        <defs>
          <linearGradient id="gradX1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0284c7" /> {/* primary-600 */}
            <stop offset="100%" stopColor="#4f46e5" /> {/* indigo-600 */}
          </linearGradient>
          <linearGradient id="gradX2" x1="100%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#7c3aed" /> {/* violet-600 */}
            <stop offset="100%" stopColor="#0284c7" /> {/* primary-600 */}
          </linearGradient>
        </defs>

        {/* Left Bracket < */}
        <path 
          d="M 38 35 L 18 60 L 38 85" 
          stroke="url(#gradX1)" 
          strokeWidth="12" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
        />
        
        {/* Right Bracket > */}
        <path 
          d="M 82 35 L 102 60 L 82 85" 
          stroke="url(#gradX2)" 
          strokeWidth="12" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
        />

        {/* The X (intersecting slashes) */}
        <path 
          d="M 72 32 L 48 88" 
          stroke="url(#gradX1)" 
          strokeWidth="12" 
          strokeLinecap="round" 
        />
        <path 
          d="M 48 32 L 72 88" 
          stroke="url(#gradX2)" 
          strokeWidth="12" 
          strokeLinecap="round" 
        />
        
        {/* Center Glow Dot */}
        <circle 
          cx="60" 
          cy="60" 
          r="6" 
          fill="#ffffff" 
          className={animate ? "animate-pulse" : ""}
        />
      </svg>
    </div>
  );
};

export default Logo;
