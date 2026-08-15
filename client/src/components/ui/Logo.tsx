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
        <div className="absolute inset-0 bg-emerald-500 rounded-full blur-xl opacity-10 animate-pulse-glow"></div>
      )}
      
      {/* Minimalist Code Terminal Logo */}
      <svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" className="relative z-10 w-full h-full drop-shadow-md">
        {/* Terminal Window Base */}
        <rect width="120" height="120" fill="#0f172a" rx="24" stroke="#1e293b" strokeWidth="4"/>
        
        {/* Terminal Header Dots */}
        <circle cx="20" cy="20" r="4" fill="#ef4444" />
        <circle cx="32" cy="20" r="4" fill="#eab308" />
        <circle cx="44" cy="20" r="4" fill="#22c55e" />
        
        {/* Code Tag */}
        <text 
          x="60" 
          y="80" 
          fontFamily="ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace" 
          fontSize="42" 
          fontWeight="bold" 
          fill="#10b981" 
          textAnchor="middle"
        >
          &lt;DX/&gt;
        </text>
      </svg>
    </div>
  );
};

export default Logo;
