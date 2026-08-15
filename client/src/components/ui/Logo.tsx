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
      
      {/* SVG Icon */}
      <svg
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="relative z-10 w-full h-full drop-shadow-sm opacity-90"
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

        {/* Infinity Loop */}
        <path 
          d="M 60 60 
             C 45 35, 20 35, 20 60
             C 20 85, 45 85, 60 60
             C 75 35, 100 35, 100 60
             C 100 85, 75 85, 60 60 Z"
          stroke="url(#gradX1)" 
          strokeWidth="12" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
        />
        
        {/* Secondary Inner Glow / Trace */}
        <path 
          d="M 60 60 
             C 45 35, 20 35, 20 60
             C 20 85, 45 85, 60 60
             C 75 35, 100 35, 100 60
             C 100 85, 75 85, 60 60 Z"
          stroke="url(#gradX2)" 
          strokeWidth="6" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          className={animate ? "animate-pulse" : ""}
        />

        {/* Center Glow Dot */}
        <circle 
          cx="60" 
          cy="60" 
          r="5" 
          fill="#cbd5e1" 
          className={animate ? "animate-pulse-glow" : ""}
        />
      </svg>
    </div>
  );
};

export default Logo;
